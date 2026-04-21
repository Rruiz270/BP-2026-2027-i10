'use client'

import { useState, useRef } from 'react'
import { PRODUCTS, EXPENSE_CATEGORIES, ALL_MONTHS, YEARS, type FinancialState, sumYear } from '@/data/financials'
import { formatCompact, formatMonth } from '@/lib/format'

interface Props {
  data: FinancialState
  updateCell: (type: 'revenue' | 'expenses', categoryId: string, month: string, field: 'projected' | 'actual', value: number | null) => void
  mode: 'revenue' | 'expenses'
}

const categories = (mode: 'revenue' | 'expenses') =>
  mode === 'revenue'
    ? PRODUCTS.map((p) => ({ id: p.id, name: p.shortName, color: p.color }))
    : EXPENSE_CATEGORIES.map((e) => ({ id: e.id, name: e.name, color: e.color }))

function EditableCell({
  value,
  onChange,
  readOnly = false,
  highlight = false,
}: {
  value: number | null
  onChange: (v: number | null) => void
  readOnly?: boolean
  highlight?: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const display = value === null || value === undefined ? '—' : formatCompact(value)

  const startEdit = () => {
    if (readOnly) return
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
      <input
        ref={inputRef}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false) }}
        className="w-full h-full px-1.5 py-1 text-xs font-mono text-right bg-white border border-cyan rounded outline-none"
        autoFocus
      />
    )
  }

  return (
    <div
      onClick={startEdit}
      className={`px-1.5 py-1 text-xs font-mono text-right truncate ${
        readOnly ? 'text-muted-fg bg-muted/50' : 'cursor-pointer hover:bg-cyan-pale/30'
      } ${highlight ? 'font-semibold text-navy' : ''}`}
    >
      {display}
    </div>
  )
}

function parseNumber(s: string): number {
  let v = s.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.')
  const multiplier = v.toLowerCase().endsWith('m') ? 1_000_000 : v.toLowerCase().endsWith('k') ? 1_000 : 1
  v = v.replace(/[mkMK]$/, '')
  return parseFloat(v) * multiplier
}

export default function InputDashboard({ data, updateCell, mode }: Props) {
  const [yearFilter, setYearFilter] = useState<number | null>(null)
  const [activeField, setActiveField] = useState<'projected' | 'actual'>('projected')
  const cats = categories(mode)

  const months = yearFilter
    ? ALL_MONTHS.filter((m) => m.startsWith(String(yearFilter)))
    : ALL_MONTHS

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-foreground">
            {mode === 'revenue' ? 'Receitas — Editar Projeções & Actuals' : 'Despesas — Editar Projeções & Actuals'}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5 bg-muted rounded-lg p-0.5">
            <button
              onClick={() => setActiveField('projected')}
              className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                activeField === 'projected' ? 'bg-white text-foreground shadow-sm' : 'text-muted-fg'
              }`}
            >
              Forecast
            </button>
            <button
              onClick={() => setActiveField('actual')}
              className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                activeField === 'actual' ? 'bg-white text-foreground shadow-sm' : 'text-muted-fg'
              }`}
            >
              Actuals
            </button>
          </div>
          <div className="flex items-center gap-0.5 bg-muted rounded-lg p-0.5">
            <button
              onClick={() => setYearFilter(null)}
              className={`px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all ${!yearFilter ? 'bg-white text-foreground shadow-sm' : 'text-muted-fg'}`}
            >
              Todos
            </button>
            {YEARS.map((y) => (
              <button
                key={y}
                onClick={() => setYearFilter(y)}
                className={`px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all ${yearFilter === y ? 'bg-white text-foreground shadow-sm' : 'text-muted-fg'}`}
              >
                {y}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="text-[11px] text-muted-fg">
        {activeField === 'projected'
          ? 'Clique nas células para editar as projeções. Use "K" para milhares e "M" para milhões (ex: 5M = 5.000.000).'
          : 'Clique nas células para inserir os valores realizados. Deixe em branco para meses futuros.'}
      </p>

      {/* Grid */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] border-collapse">
            <thead>
              <tr className="bg-navy text-white">
                <th className="sticky left-0 z-20 bg-navy px-3 py-2.5 text-left font-semibold w-24 min-w-[96px]">Mês</th>
                {cats.map((cat) => (
                  <th key={cat.id} className="px-3 py-2.5 text-right font-semibold min-w-[110px]">
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ background: cat.color }} />
                      {cat.name}
                    </div>
                  </th>
                ))}
                <th className="px-3 py-2.5 text-right font-bold min-w-[110px]">Total Mês</th>
              </tr>
            </thead>
            <tbody>
              {months.map((month, mi) => {
                const isYearStart = month.endsWith('-01')
                let rowTotal = 0
                return (
                  <tr
                    key={month}
                    className={`border-t border-border ${isYearStart && mi > 0 ? 'border-t-2 border-t-navy/20' : ''} hover:bg-cyan-pale/10 transition-colors`}
                  >
                    <td className="sticky left-0 z-10 bg-card px-3 py-0 font-medium text-card-fg border-r border-border">
                      {formatMonth(month)}
                    </td>
                    {cats.map((cat) => {
                      const cell = data[mode][cat.id]?.[month]
                      const val = activeField === 'projected' ? (cell?.projected ?? 0) : (cell?.actual ?? null)
                      if (typeof val === 'number') rowTotal += val
                      return (
                        <td key={cat.id} className="px-0 py-0 border-r border-border/50">
                          <EditableCell
                            value={val}
                            onChange={(v) => updateCell(mode, cat.id, month, activeField, v)}
                          />
                        </td>
                      )
                    })}
                    <td className="px-1.5 py-1 text-right font-mono font-bold text-navy bg-muted/30">
                      {formatCompact(rowTotal)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              {/* Year subtotals */}
              {(yearFilter ? [yearFilter] : YEARS.map(Number)).map((yr) => (
                <tr key={yr} className="border-t-2 border-navy/30 bg-muted font-bold">
                  <td className="sticky left-0 z-10 bg-muted px-3 py-2 text-card-fg border-r border-border">
                    Total {yr}
                  </td>
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
                    {formatCompact(
                      cats.reduce((sum, cat) => {
                        const s = sumYear(data[mode][cat.id] ?? {}, yr)
                        return sum + (activeField === 'projected' ? s.projected : s.actual)
                      }, 0)
                    )}
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
