'use client'

import { useState, useRef } from 'react'
import { PRODUCTS, EXPENSE_CATEGORIES, ALL_MONTHS, YEARS, type FinancialState, sumYear } from '@/data/financials'
import { formatCompact, formatMonth } from '@/lib/format'

interface Props {
  data: FinancialState
  updateCell: (type: 'revenue' | 'expenses', categoryId: string, month: string, field: 'projected' | 'actual', value: number | null) => void
  updateComment: (key: string, comment: string) => void
  mode: 'revenue' | 'expenses'
}

interface PendingActual {
  categoryId: string
  month: string
  value: number
  projected: number
  variancePct: number
}

const categories = (mode: 'revenue' | 'expenses') =>
  mode === 'revenue'
    ? PRODUCTS.map((p) => ({ id: p.id, name: p.shortName, color: p.color }))
    : EXPENSE_CATEGORIES.map((e) => ({ id: e.id, name: e.name, color: e.color }))

function commentKey(mode: string, catId: string, month: string) {
  return `${mode}:${catId}:${month}`
}

function parseNumber(s: string): number {
  let v = s.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.')
  const multiplier = v.toLowerCase().endsWith('m') ? 1_000_000 : v.toLowerCase().endsWith('k') ? 1_000 : 1
  v = v.replace(/[mkMK]$/, '')
  return parseFloat(v) * multiplier
}

function EditableCell({
  value,
  onChange,
  readOnly = false,
  frozen = false,
  hasComment = false,
}: {
  value: number | null
  onChange: (v: number | null) => void
  readOnly?: boolean
  frozen?: boolean
  hasComment?: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const display = value === null || value === undefined ? '—' : formatCompact(value)

  const startEdit = () => {
    if (readOnly || frozen) return
    setEditing(true)
    setDraft(value === null ? '' : String(value))
    setTimeout(() => inputRef.current?.select(), 0)
  }

  const commit = () => {
    setEditing(false)
    const trimmed = draft.trim()
    if (trimmed === '' || trimmed === '—') { onChange(null); return }
    const parsed = parseNumber(trimmed)
    if (!isNaN(parsed)) onChange(parsed)
  }

  if (editing) {
    return (
      <input ref={inputRef} type="text" value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false) }}
        className="w-full h-full px-1.5 py-1.5 text-xs font-mono text-right bg-white border border-cyan rounded outline-none"
        autoFocus />
    )
  }

  return (
    <div onClick={startEdit}
      className={`px-1.5 py-1.5 text-xs font-mono text-right truncate relative ${
        frozen ? 'text-muted-fg bg-muted/60 cursor-not-allowed' :
        readOnly ? 'text-muted-fg bg-muted/50' :
        'cursor-pointer hover:bg-cyan-pale/30 active:bg-cyan-pale/50'
      }`}>
      {frozen && <span className="absolute left-0.5 top-0.5 text-[8px] opacity-40">🔒</span>}
      {hasComment && <span className="absolute left-0.5 top-0.5 text-[8px]">💬</span>}
      {display}
    </div>
  )
}

export default function InputDashboard({ data, updateCell, updateComment, mode }: Props) {
  const [yearFilter, setYearFilter] = useState<number | null>(null)
  const [activeField, setActiveField] = useState<'projected' | 'actual'>('projected')
  const [pending, setPending] = useState<PendingActual | null>(null)
  const [commentDraft, setCommentDraft] = useState('')
  const cats = categories(mode)

  const months = yearFilter ? ALL_MONTHS.filter((m) => m.startsWith(String(yearFilter))) : ALL_MONTHS

  const handleActualChange = (categoryId: string, month: string, value: number | null) => {
    if (value === null) {
      updateCell(mode, categoryId, month, 'actual', null)
      return
    }
    const projected = data[mode][categoryId]?.[month]?.projected ?? 0
    if (projected === 0) {
      updateCell(mode, categoryId, month, 'actual', value)
      return
    }
    const variancePct = ((value - projected) / projected) * 100
    if (Math.abs(variancePct) >= 10) {
      setPending({ categoryId, month, value, projected, variancePct })
      setCommentDraft(data.comments[commentKey(mode, categoryId, month)] ?? '')
    } else {
      updateCell(mode, categoryId, month, 'actual', value)
    }
  }

  const confirmPending = () => {
    if (!pending || !commentDraft.trim()) return
    updateCell(mode, pending.categoryId, pending.month, 'actual', pending.value)
    updateComment(commentKey(mode, pending.categoryId, pending.month), commentDraft.trim())
    setPending(null)
    setCommentDraft('')
  }

  const cancelPending = () => { setPending(null); setCommentDraft('') }

  return (
    <div className="space-y-4">
      {/* Variance comment modal */}
      {pending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={cancelPending}>
          <div className="bg-white rounded-xl shadow-2xl border border-border w-full max-w-md p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-navy">Variação significativa detectada</h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-muted rounded-lg p-3">
                <p className="text-[10px] text-muted-fg font-bold">Forecast</p>
                <p className="text-sm font-bold text-navy">{formatCompact(pending.projected)}</p>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <p className="text-[10px] text-muted-fg font-bold">Actual</p>
                <p className="text-sm font-bold text-navy">{formatCompact(pending.value)}</p>
              </div>
              <div className={`rounded-lg p-3 ${pending.variancePct > 0 ? 'bg-green-pale' : 'bg-red-50'}`}>
                <p className="text-[10px] text-muted-fg font-bold">Variação</p>
                <p className={`text-sm font-bold ${pending.variancePct > 0 ? 'text-green-dark' : 'text-red-600'}`}>
                  {pending.variancePct > 0 ? '+' : ''}{pending.variancePct.toFixed(1)}%
                </p>
              </div>
            </div>
            <div className="text-[11px] text-muted-fg">
              {formatMonth(pending.month)} · {cats.find((c) => c.id === pending.categoryId)?.name}
            </div>
            <div>
              <label className="block text-[11px] font-bold text-card-fg mb-1.5">
                Justificativa obrigatória <span className="text-red-500">*</span>
              </label>
              <textarea
                value={commentDraft}
                onChange={(e) => setCommentDraft(e.target.value)}
                placeholder="Explique a variação..."
                className="w-full border border-border rounded-lg p-3 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-cyan/30 focus:border-cyan"
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <button onClick={cancelPending} className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg border border-border text-muted-fg hover:bg-muted transition-colors">
                Cancelar
              </button>
              <button onClick={confirmPending} disabled={!commentDraft.trim()}
                className="flex-1 px-4 py-2.5 text-sm font-bold rounded-lg gradient-accent text-[#061840] hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed">
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-foreground">
          {mode === 'revenue' ? 'Receitas' : 'Despesas'} — Projeções & Actuals
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-0.5 bg-muted rounded-lg p-0.5">
            <button onClick={() => setActiveField('projected')}
              className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-all ${activeField === 'projected' ? 'bg-white text-foreground shadow-sm' : 'text-muted-fg'}`}>
              Forecast
            </button>
            <button onClick={() => setActiveField('actual')}
              className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-all ${activeField === 'actual' ? 'bg-white text-foreground shadow-sm' : 'text-muted-fg'}`}>
              Actuals
            </button>
          </div>
          <div className="flex items-center gap-0.5 bg-muted rounded-lg p-0.5">
            <button onClick={() => setYearFilter(null)}
              className={`px-2 py-1.5 rounded-md text-[11px] font-medium transition-all ${!yearFilter ? 'bg-white text-foreground shadow-sm' : 'text-muted-fg'}`}>
              Todos
            </button>
            {YEARS.map((y) => (
              <button key={y} onClick={() => setYearFilter(y)}
                className={`px-2 py-1.5 rounded-md text-[11px] font-medium transition-all ${yearFilter === y ? 'bg-white text-foreground shadow-sm' : 'text-muted-fg'}`}>
                {y}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="text-[11px] text-muted-fg">
        {activeField === 'projected'
          ? '🔒 Meses com actual registrado ficam congelados. Use "K" para milhares, "M" para milhões.'
          : 'Variações ≥10% exigem justificativa obrigatória. Deixe em branco para meses futuros.'}
      </p>

      {/* Grid */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
          <table className="w-full text-[11px] border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-navy text-white">
                <th className="sticky left-0 z-20 bg-navy px-3 py-2.5 text-left font-semibold w-20 min-w-[80px]">Mês</th>
                {cats.map((cat) => (
                  <th key={cat.id} className="px-2 py-2.5 text-right font-semibold min-w-[100px]">
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: cat.color }} />
                      <span className="truncate">{cat.name}</span>
                    </div>
                  </th>
                ))}
                <th className="px-2 py-2.5 text-right font-bold min-w-[90px]">Total</th>
              </tr>
            </thead>
            <tbody>
              {months.map((month, mi) => {
                const isYearStart = month.endsWith('-01')
                let rowTotal = 0
                return (
                  <tr key={month}
                    className={`border-t border-border ${isYearStart && mi > 0 ? 'border-t-2 border-t-navy/20' : ''} hover:bg-cyan-pale/10 transition-colors`}>
                    <td className="sticky left-0 z-10 bg-card px-2 py-0 font-medium text-card-fg border-r border-border text-[11px]">
                      {formatMonth(month)}
                    </td>
                    {cats.map((cat) => {
                      const cell = data[mode][cat.id]?.[month]
                      const hasActual = cell?.actual !== null && cell?.actual !== undefined
                      const isFrozen = activeField === 'projected' && hasActual
                      const cKey = commentKey(mode, cat.id, month)
                      const hasCommentFlag = !!data.comments[cKey]

                      const val = activeField === 'projected' ? (cell?.projected ?? 0) : (cell?.actual ?? null)
                      if (typeof val === 'number') rowTotal += val

                      return (
                        <td key={cat.id} className="px-0 py-0 border-r border-border/50">
                          <EditableCell
                            value={val}
                            frozen={isFrozen}
                            hasComment={hasCommentFlag}
                            onChange={(v) => {
                              if (activeField === 'actual') handleActualChange(cat.id, month, v)
                              else updateCell(mode, cat.id, month, 'projected', v)
                            }}
                          />
                        </td>
                      )
                    })}
                    <td className="px-1.5 py-1.5 text-right font-mono font-bold text-navy bg-muted/30">
                      {formatCompact(rowTotal)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              {(yearFilter ? [yearFilter] : YEARS.map(Number)).map((yr) => (
                <tr key={yr} className="border-t-2 border-navy/30 bg-muted font-bold">
                  <td className="sticky left-0 z-10 bg-muted px-2 py-2 text-card-fg border-r border-border">Total {yr}</td>
                  {cats.map((cat) => {
                    const catData = data[mode][cat.id] ?? {}
                    const yearSum = sumYear(catData, yr)
                    const val = activeField === 'projected' ? yearSum.projected : yearSum.actual
                    return (
                      <td key={cat.id} className="px-1.5 py-2 text-right font-mono text-card-fg border-r border-border/50">
                        {formatCompact(val)}
                      </td>
                    )
                  })}
                  <td className="px-1.5 py-2 text-right font-mono text-navy">
                    {formatCompact(cats.reduce((sum, cat) => {
                      const s = sumYear(data[mode][cat.id] ?? {}, yr)
                      return sum + (activeField === 'projected' ? s.projected : s.actual)
                    }, 0))}
                  </td>
                </tr>
              ))}
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
