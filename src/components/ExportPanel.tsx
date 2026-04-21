'use client'

import { useState } from 'react'
import { PRODUCTS, EXPENSE_CATEGORIES, ALL_MONTHS, YEARS, type FinancialState, sumYear } from '@/data/financials'
import { formatMonth } from '@/lib/format'
import * as XLSX from 'xlsx'

interface Props {
  data: FinancialState
}

export default function ExportPanel({ data }: Props) {
  const [startMonth, setStartMonth] = useState(ALL_MONTHS[0])
  const [endMonth, setEndMonth] = useState(ALL_MONTHS[ALL_MONTHS.length - 1])
  const [includeRevenue, setIncludeRevenue] = useState(true)
  const [includeExpenses, setIncludeExpenses] = useState(true)
  const [includeSummary, setIncludeSummary] = useState(true)

  const months = ALL_MONTHS.filter((m) => m >= startMonth && m <= endMonth)

  const exportXLSX = () => {
    const wb = XLSX.utils.book_new()

    if (includeRevenue) {
      const header = ['Mês', ...PRODUCTS.map((p) => `${p.shortName} (Proj)`), ...PRODUCTS.map((p) => `${p.shortName} (Real)`), 'Total Proj', 'Total Real']
      const rows = months.map((month) => {
        const projValues = PRODUCTS.map((p) => data.revenue[p.id]?.[month]?.projected ?? 0)
        const actualValues = PRODUCTS.map((p) => data.revenue[p.id]?.[month]?.actual ?? '')
        return [formatMonth(month), ...projValues, ...actualValues, projValues.reduce((a, b) => a + b, 0), actualValues.reduce((a: number, b) => a + (typeof b === 'number' ? b : 0), 0)]
      })

      for (const yr of YEARS) {
        if (months.some((m) => m.startsWith(String(yr)))) {
          const projTotals = PRODUCTS.map((p) => sumYear(data.revenue[p.id] ?? {}, yr).projected)
          const actTotals = PRODUCTS.map((p) => sumYear(data.revenue[p.id] ?? {}, yr).actual)
          rows.push([`Total ${yr}`, ...projTotals, ...actTotals, projTotals.reduce((a, b) => a + b, 0), actTotals.reduce((a, b) => a + b, 0)])
        }
      }

      const ws = XLSX.utils.aoa_to_sheet([header, ...rows])
      ws['!cols'] = header.map((_, i) => ({ wch: i === 0 ? 12 : 18 }))
      XLSX.utils.book_append_sheet(wb, ws, 'Receitas')
    }

    if (includeExpenses) {
      const cats = EXPENSE_CATEGORIES
      const header = ['Mês', ...cats.map((c) => `${c.name} (Proj)`), ...cats.map((c) => `${c.name} (Real)`), 'Total Proj', 'Total Real']
      const rows = months.map((month) => {
        const projValues = cats.map((c) => data.expenses[c.id]?.[month]?.projected ?? 0)
        const actualValues = cats.map((c) => data.expenses[c.id]?.[month]?.actual ?? '')
        return [formatMonth(month), ...projValues, ...actualValues, projValues.reduce((a, b) => a + b, 0), actualValues.reduce((a: number, b) => a + (typeof b === 'number' ? b : 0), 0)]
      })
      const ws = XLSX.utils.aoa_to_sheet([header, ...rows])
      ws['!cols'] = header.map((_, i) => ({ wch: i === 0 ? 12 : 22 }))
      XLSX.utils.book_append_sheet(wb, ws, 'Despesas')
    }

    if (includeSummary) {
      const header = ['Ano', 'Receita Projetada', 'Receita Realizada', 'Despesa Projetada', 'Despesa Realizada', 'Resultado Proj', 'Resultado Real']
      const rows = YEARS.map((yr) => {
        const revProj = PRODUCTS.reduce((s, p) => s + sumYear(data.revenue[p.id] ?? {}, yr).projected, 0)
        const revAct = PRODUCTS.reduce((s, p) => s + sumYear(data.revenue[p.id] ?? {}, yr).actual, 0)
        const expProj = EXPENSE_CATEGORIES.reduce((s, c) => s + sumYear(data.expenses[c.id] ?? {}, yr).projected, 0)
        const expAct = EXPENSE_CATEGORIES.reduce((s, c) => s + sumYear(data.expenses[c.id] ?? {}, yr).actual, 0)
        return [yr, revProj, revAct, expProj, expAct, revProj - expProj, revAct - expAct]
      })
      const ws = XLSX.utils.aoa_to_sheet([header, ...rows])
      ws['!cols'] = header.map((_, i) => ({ wch: i === 0 ? 8 : 22 }))
      XLSX.utils.book_append_sheet(wb, ws, 'Resumo')
    }

    const filename = `i10_BP_${startMonth}_${endMonth}.xlsx`
    XLSX.writeFile(wb, filename)
  }

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl border border-border p-6 space-y-5">
        <h3 className="text-sm font-bold text-card-fg">Exportar Relatório em Excel</h3>
        <p className="text-xs text-muted-fg font-[family-name:var(--font-serif)]">
          Selecione o período e as seções que deseja incluir no relatório. O arquivo será gerado em formato .xlsx compatível com Excel e Google Sheets.
        </p>

        {/* Date range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-medium text-muted-fg mb-1.5">Mês Início</label>
            <select
              value={startMonth}
              onChange={(e) => setStartMonth(e.target.value)}
              className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-cyan/30 focus:border-cyan"
            >
              {ALL_MONTHS.map((m) => (
                <option key={m} value={m}>{formatMonth(m)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-muted-fg mb-1.5">Mês Fim</label>
            <select
              value={endMonth}
              onChange={(e) => setEndMonth(e.target.value)}
              className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-cyan/30 focus:border-cyan"
            >
              {ALL_MONTHS.filter((m) => m >= startMonth).map((m) => (
                <option key={m} value={m}>{formatMonth(m)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Sections */}
        <div>
          <label className="block text-[11px] font-medium text-muted-fg mb-2">Seções do Relatório</label>
          <div className="space-y-2">
            {[
              { key: 'revenue', label: 'Receitas por Produto', desc: `${PRODUCTS.length} linhas de produto × ${months.length} meses`, checked: includeRevenue, set: setIncludeRevenue },
              { key: 'expenses', label: 'Despesas por Categoria', desc: `${EXPENSE_CATEGORIES.length} categorias × ${months.length} meses`, checked: includeExpenses, set: setIncludeExpenses },
              { key: 'summary', label: 'Resumo Anual', desc: 'Receita, Despesa e Resultado por ano', checked: includeSummary, set: setIncludeSummary },
            ].map((section) => (
              <label key={section.key} className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={section.checked}
                  onChange={(e) => section.set(e.target.checked)}
                  className="mt-0.5 accent-[#00B4D8]"
                />
                <div>
                  <span className="text-sm font-medium text-card-fg">{section.label}</span>
                  <p className="text-[11px] text-muted-fg">{section.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Export button */}
        <button
          onClick={exportXLSX}
          disabled={!includeRevenue && !includeExpenses && !includeSummary}
          className="w-full gradient-accent text-[#061840] font-bold text-sm py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Exportar .xlsx ({months.length} meses)
        </button>
      </div>

      {/* Quick export presets */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-sm font-bold text-card-fg mb-3">Exportações Rápidas</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {YEARS.map((yr) => (
            <button
              key={yr}
              onClick={() => { setStartMonth(`${yr}-01`); setEndMonth(`${yr}-12`) }}
              className="border border-border rounded-lg p-3 text-center hover:border-cyan hover:bg-cyan-pale/10 transition-all"
            >
              <span className="block text-lg font-bold text-navy">{yr}</span>
              <span className="text-[11px] text-muted-fg">12 meses</span>
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <button
            onClick={() => { setStartMonth('2026-01'); setEndMonth('2027-12') }}
            className="border border-border rounded-lg p-3 text-center hover:border-cyan hover:bg-cyan-pale/10 transition-all"
          >
            <span className="block text-sm font-bold text-navy">BP Principal (2026–2027)</span>
            <span className="text-[11px] text-muted-fg">24 meses · Contratos fechados</span>
          </button>
          <button
            onClick={() => { setStartMonth('2026-01'); setEndMonth('2029-12') }}
            className="border border-border rounded-lg p-3 text-center hover:border-cyan hover:bg-cyan-pale/10 transition-all"
          >
            <span className="block text-sm font-bold text-navy">Visão Completa (2026–2029)</span>
            <span className="text-[11px] text-muted-fg">48 meses · Receita total</span>
          </button>
        </div>
      </div>
    </div>
  )
}
