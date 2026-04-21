'use client'

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { type ProductLine, type FinancialState, YEARS, MUNICIPAL_FUND_SOURCES, sumYear, ALL_MONTHS } from '@/data/financials'
import { formatCompact, formatCurrency, formatNumber, formatMonth } from '@/lib/format'

interface Props {
  product: ProductLine
  data: FinancialState
  yearFilter?: number
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: 'bg-green-pale text-green-dark',
    negotiation: 'bg-amber-100 text-amber-700',
    prospecting: 'bg-cyan-pale text-navy',
  }
  const labels: Record<string, string> = { active: 'Ativo', negotiation: 'Em Negociação', prospecting: 'Prospecção' }
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${styles[status] ?? ''}`}>{labels[status] ?? status}</span>
}

export default function ProductDetail({ product, data, yearFilter }: Props) {
  const catData = data.revenue[product.id] ?? {}
  const years = yearFilter ? [yearFilter] : YEARS.map(Number)

  const allMonths = yearFilter
    ? ALL_MONTHS.filter((m) => m.startsWith(String(yearFilter)))
    : ALL_MONTHS

  const firstNonZero = allMonths.findIndex((m) => (catData[m]?.projected ?? 0) > 0 || (catData[m]?.actual ?? 0) > 0)
  const months = firstNonZero > 0 ? allMonths.slice(firstNonZero) : allMonths

  const chartData = months.map((m) => ({
    month: formatMonth(m),
    projected: catData[m]?.projected ?? 0,
    actual: catData[m]?.actual ?? 0,
  }))

  let cumulative = 0
  const cumulativeData = months.map((m) => {
    cumulative += catData[m]?.projected ?? 0
    return { month: formatMonth(m), cumulative }
  })

  const yearSums = years.map((yr) => sumYear(catData, yr))
  const total = yearSums.reduce((s, v) => s + v.projected, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="w-4 h-4 rounded-full mt-1 shrink-0" style={{ background: product.color }} />
        <div>
          <h2 className="text-lg font-extrabold text-card-fg">{product.name}</h2>
          <p className="text-sm text-muted-fg mt-1 font-[family-name:var(--font-serif)]">{product.description}</p>
        </div>
      </div>

      {/* Revenue summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {years.map((yr, i) => (
          <div key={yr} className="bg-card rounded-xl border border-border p-3">
            <span className="text-[10px] text-muted-fg font-bold">Receita {yr}</span>
            <p className="text-lg font-bold mt-0.5" style={{ color: product.color }}>{formatCompact(yearSums[i].projected)}</p>
          </div>
        ))}
        {!yearFilter && (
          <div className="bg-card rounded-xl border border-border p-3">
            <span className="text-[10px] text-muted-fg font-bold">Total</span>
            <p className="text-lg font-bold mt-0.5 text-navy">{formatCompact(total)}</p>
          </div>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-xs font-bold text-card-fg mb-3">Receita Mensal</h3>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 9 }} interval={yearFilter ? 0 : 3} angle={-45} textAnchor="end" height={45} />
                <YAxis tickFormatter={(v: number) => formatCompact(v)} tick={{ fontSize: 9 }} width={60} />
                <Tooltip formatter={(v) => formatCompact(Number(v))} />
                <Area type="monotone" dataKey="projected" stroke={product.color} fill={product.color} fillOpacity={0.12} strokeWidth={2} name="Projetado" />
                <Area type="monotone" dataKey="actual" stroke="#00E5A0" fill="#00E5A0" fillOpacity={0.1} strokeWidth={2} strokeDasharray="4 2" name="Realizado" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-xs font-bold text-card-fg mb-3">Receita Acumulada</h3>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cumulativeData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 9 }} interval={yearFilter ? 0 : 3} angle={-45} textAnchor="end" height={45} />
                <YAxis tickFormatter={(v: number) => formatCompact(v)} tick={{ fontSize: 9 }} width={60} />
                <Tooltip formatter={(v) => formatCompact(Number(v))} />
                <Area type="monotone" dataKey="cumulative" stroke={product.color} fill={product.color} fillOpacity={0.08} strokeWidth={2} name="Acumulado" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="text-xs font-bold text-card-fg mb-3">Indicadores-Chave</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {product.kpis.map((kpi) => (
            <div key={kpi.label} className="border border-border rounded-lg p-3">
              <span className="text-[10px] text-muted-fg font-bold">{kpi.label}</span>
              <div className="mt-2 space-y-1">
                {YEARS.map((yr) => (
                  <div key={yr} className="flex justify-between">
                    <span className="text-[11px] text-muted-fg">{yr}</span>
                    <span className="text-[11px] font-semibold font-mono">
                      {kpi.unit === 'R$' || kpi.unit === 'R$/professor' ? formatCompact(kpi[`target${yr}` as keyof typeof kpi] as number) : kpi.unit === '%' ? `${kpi[`target${yr}` as keyof typeof kpi]}%` : formatNumber(kpi[`target${yr}` as keyof typeof kpi] as number)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sub-projects / Pipeline */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="text-xs font-bold text-card-fg mb-3">Contratos & Pipeline</h3>
        <div className="space-y-2">
          {product.subProjects.map((sp) => (
            <div key={sp.name} className="flex items-center justify-between border border-border rounded-lg p-3 hover:bg-muted/50 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-card-fg">{sp.name}</span>
                  <StatusBadge status={sp.status} />
                </div>
                <div className="flex items-center gap-3 mt-0.5 text-[11px] text-muted-fg flex-wrap">
                  <span>{sp.startDate} → {sp.endDate}</span>
                  {sp.citiesCount > 0 && <span>{sp.citiesCount} municípios</span>}
                  {sp.studentsTarget > 0 && <span>{formatNumber(sp.studentsTarget)} alunos</span>}
                  {sp.teachersTarget > 0 && <span>{formatNumber(sp.teachersTarget)} professores</span>}
                </div>
              </div>
              <div className="text-right shrink-0 ml-4">
                <span className="text-sm font-bold text-navy">{formatCompact(sp.contractValue)}</span>
                <p className="text-[10px] text-muted-fg">valor contrato</p>
              </div>
            </div>
          ))}
          <div className="pt-2 border-t border-border flex justify-between text-sm font-bold text-navy">
            <span>Total Pipeline</span>
            <span>{formatCompact(product.subProjects.reduce((s, sp) => s + sp.contractValue, 0))}</span>
          </div>
        </div>
      </div>

      {product.id === 'municipal' && (
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-xs font-bold text-card-fg mb-3">Fontes de Economia — % sobre Savings</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {MUNICIPAL_FUND_SOURCES.map((source) => (
              <div key={source} className="flex items-center gap-2 text-[12px] text-card-fg py-1.5 px-3 bg-amber-50 rounded-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                {source}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
