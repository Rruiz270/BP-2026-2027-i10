'use client'

import { formatCompact, formatNumber } from '@/lib/format'
import { PRODUCTS, YEARS, type FinancialState, sumYear } from '@/data/financials'

interface Props {
  data: FinancialState
  yearFilter?: number
}

function Card({ label, value, sub, accent }: { label: string; value: string; sub: string; accent?: string }) {
  return (
    <div className="bg-card rounded-xl border border-border p-4 flex flex-col gap-1">
      <span className="text-[10px] font-bold text-muted-fg uppercase tracking-wider">{label}</span>
      <span className="text-2xl font-extrabold" style={{ color: accent ?? 'var(--navy)' }}>{value}</span>
      <span className="text-[11px] text-muted-fg">{sub}</span>
    </div>
  )
}

export default function KPICards({ data, yearFilter }: Props) {
  const years = yearFilter ? [yearFilter] : YEARS.map(Number)

  const totalRevenue = PRODUCTS.reduce((sum, p) => {
    return sum + years.reduce((s, yr) => s + sumYear(data.revenue[p.id] ?? {}, yr).projected, 0)
  }, 0)

  const revByYear = YEARS.map((yr) =>
    PRODUCTS.reduce((s, p) => s + sumYear(data.revenue[p.id] ?? {}, yr).projected, 0)
  )

  const educationKPI = PRODUCTS.find((p) => p.id === 'education')!.kpis.find((k) => k.label === 'Alunos Impactados')!
  const bnccKPI = PRODUCTS.find((p) => p.id === 'bncc')!.kpis.find((k) => k.label === 'Professores Certificados')!
  const fundebKPI = PRODUCTS.find((p) => p.id === 'fundeb')!.kpis.find((k) => k.label === 'Municípios Atendidos')!

  const targetKey = yearFilter ? `target${yearFilter}` as keyof typeof educationKPI : 'target2029'
  const students = (educationKPI[targetKey] as number) ?? educationKPI.target2029
  const teachers = (bnccKPI[targetKey] as number) ?? bnccKPI.target2029
  const cities = (fundebKPI[targetKey] as number) ?? fundebKPI.target2029

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card
        label={yearFilter ? `Receita ${yearFilter}` : 'Receita Total 2026–2029'}
        value={formatCompact(totalRevenue)}
        sub={yearFilter ? `${PRODUCTS.length} linhas de produto` : YEARS.map((yr, i) => `${yr}: ${formatCompact(revByYear[i])}`).join(' · ')}
      />
      <Card label="Alunos Impactados" value={formatNumber(students)} sub="Integração Educacional" accent="var(--education)" />
      <Card label="Professores Certificados" value={formatNumber(teachers)} sub="BNCC Formação" accent="var(--bncc)" />
      <Card label="Municípios Atendidos" value={formatNumber(cities)} sub="Consultoria FUNDEB" accent="var(--fundeb)" />
    </div>
  )
}
