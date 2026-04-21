'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { PRODUCTS, type FinancialState, getChartData } from '@/data/financials'
import { formatCompact, formatMonth } from '@/lib/format'

interface Props {
  data: FinancialState
  yearFilter?: number
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  const total = payload.reduce((s, p) => s + p.value, 0)
  return (
    <div className="bg-white border border-border rounded-lg shadow-lg p-3 text-[11px]">
      <p className="font-bold text-card-fg mb-1.5">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-6 py-0.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-muted-fg">{PRODUCTS.find((pr) => pr.id === p.name)?.shortName ?? p.name}</span>
          </div>
          <span className="font-semibold font-mono">{formatCompact(p.value)}</span>
        </div>
      ))}
      <div className="border-t border-border mt-1.5 pt-1.5 flex justify-between font-bold">
        <span>Total</span>
        <span className="font-mono">{formatCompact(total)}</span>
      </div>
    </div>
  )
}

export default function RevenueChart({ data, yearFilter }: Props) {
  const allData = getChartData(data)
  const filtered = yearFilter
    ? allData.filter((d) => (d.month as string).startsWith(String(yearFilter)))
    : allData
  const chartData = filtered.map((d) => ({ ...d, monthLabel: formatMonth(d.month as string) }))
  const showEveryN = chartData.length > 24 ? 2 : chartData.length > 12 ? 1 : 0

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="text-sm font-bold text-card-fg mb-4">Receita Mensal por Linha de Produto</h3>
      <div className="h-[380px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="monthLabel" tick={{ fontSize: 10 }} interval={showEveryN} angle={-45} textAnchor="end" height={55} />
            <YAxis tickFormatter={(v: number) => formatCompact(v)} tick={{ fontSize: 10 }} width={65} />
            <Tooltip content={<CustomTooltip />} />
            <Legend formatter={(v: string) => PRODUCTS.find((p) => p.id === v)?.shortName ?? v} wrapperStyle={{ fontSize: 11 }} />
            {PRODUCTS.map((p, i) => (
              <Bar key={p.id} dataKey={p.id} stackId="revenue" fill={p.color} radius={i === PRODUCTS.length - 1 ? [3, 3, 0, 0] : undefined} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
