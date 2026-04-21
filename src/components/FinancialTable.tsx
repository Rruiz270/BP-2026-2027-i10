'use client'

import { PRODUCTS, YEARS, type FinancialState, sumYear } from '@/data/financials'
import { formatCurrency, formatCompact } from '@/lib/format'

interface Props {
  data: FinancialState
  yearFilter?: number
}

export default function FinancialTable({ data, yearFilter }: Props) {
  const years = yearFilter ? [yearFilter] : YEARS.map(Number)
  const showTotal = !yearFilter || years.length > 1

  const grandTotals = years.map((yr) =>
    PRODUCTS.reduce((s, p) => s + sumYear(data.revenue[p.id] ?? {}, yr).projected, 0)
  )
  const grandTotal = grandTotals.reduce((a, b) => a + b, 0)

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="p-5 border-b border-border">
        <h3 className="text-sm font-bold text-card-fg">Resumo Financeiro por Produto</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-navy text-white">
              <th className="text-left px-5 py-3 font-semibold">Linha de Produto</th>
              {years.map((y) => (
                <th key={y} className="text-right px-5 py-3 font-semibold">{y}</th>
              ))}
              {showTotal && <th className="text-right px-5 py-3 font-bold">Total</th>}
              <th className="text-right px-5 py-3 font-semibold">%</th>
            </tr>
          </thead>
          <tbody>
            {PRODUCTS.map((product) => {
              const yearValues = years.map((yr) => sumYear(data.revenue[product.id] ?? {}, yr).projected)
              const total = yearValues.reduce((s, v) => s + v, 0)
              const pct = grandTotal > 0 ? (total / grandTotal) * 100 : 0
              return (
                <tr key={product.id} className="border-t border-border hover:bg-muted/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ background: product.color }} />
                      <div>
                        <span className="font-medium text-card-fg">{product.shortName}</span>
                        <p className="text-[11px] text-muted-fg mt-0.5 max-w-xs truncate font-[family-name:var(--font-serif)]">{product.description}</p>
                      </div>
                    </div>
                  </td>
                  {yearValues.map((v, i) => (
                    <td key={years[i]} className="text-right px-5 py-3 font-mono text-card-fg">{formatCurrency(v)}</td>
                  ))}
                  {showTotal && <td className="text-right px-5 py-3 font-mono font-semibold text-navy">{formatCurrency(total)}</td>}
                  <td className="text-right px-5 py-3 font-mono text-muted-fg">{pct.toFixed(1)}%</td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-navy/20 bg-muted font-bold">
              <td className="px-5 py-3 text-card-fg">Total Receita</td>
              {grandTotals.map((v, i) => (
                <td key={years[i]} className="text-right px-5 py-3 font-mono text-navy">{formatCurrency(v)}</td>
              ))}
              {showTotal && <td className="text-right px-5 py-3 font-mono text-navy">{formatCurrency(grandTotal)}</td>}
              <td className="text-right px-5 py-3 font-mono text-navy">100%</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
