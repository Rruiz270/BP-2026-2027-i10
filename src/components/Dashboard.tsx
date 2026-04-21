'use client'

import { useState, useEffect, useCallback } from 'react'
import { PRODUCTS, EXPENSE_CATEGORIES, ALL_MONTHS, buildDefaultState, type FinancialState } from '@/data/financials'
import KPICards from './KPICards'
import RevenueChart from './RevenueChart'
import FinancialTable from './FinancialTable'
import ProductDetail from './ProductDetail'
import InputDashboard from './InputDashboard'
import ExportPanel from './ExportPanel'

type Tab = 'overview' | 'education' | 'fundeb' | 'bncc' | 'municipal' | 'input' | 'export' | 'expenses'
type Year = 'all' | '2026' | '2027' | '2028' | '2029'

const STORAGE_KEY = 'i10-bp-data-v4'

const NAV_SECTIONS = [
  { label: 'PAINEL', items: [{ id: 'overview' as Tab, label: 'Visão Geral', icon: '◉' }] },
  { label: 'PRODUTOS', items: PRODUCTS.map((p) => ({ id: p.id as Tab, label: p.shortName, icon: '◈', color: p.color })) },
  {
    label: 'GESTÃO',
    items: [
      { id: 'input' as Tab, label: 'Reforecast & Actuals', icon: '▦' },
      { id: 'expenses' as Tab, label: 'Despesas', icon: '▤' },
      { id: 'export' as Tab, label: 'Relatórios & Export', icon: '↗' },
    ],
  },
]

export default function Dashboard() {
  const [tab, setTab] = useState<Tab>('overview')
  const [year, setYear] = useState<Year>('all')
  const [data, setData] = useState<FinancialState>(() => buildDefaultState())
  const [loaded, setLoaded] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as FinancialState
        const defaults = buildDefaultState()
        const merged: FinancialState = { revenue: { ...defaults.revenue }, expenses: { ...defaults.expenses }, comments: { ...parsed.comments } }
        for (const key of Object.keys(parsed.revenue ?? {})) {
          if (merged.revenue[key]) {
            for (const month of ALL_MONTHS) {
              if (parsed.revenue[key]?.[month]) merged.revenue[key][month] = { ...merged.revenue[key][month], ...parsed.revenue[key][month] }
            }
          }
        }
        for (const key of Object.keys(parsed.expenses ?? {})) {
          if (merged.expenses[key]) {
            for (const month of ALL_MONTHS) {
              if (parsed.expenses[key]?.[month]) merged.expenses[key][month] = { ...merged.expenses[key][month], ...parsed.expenses[key][month] }
            }
          }
        }
        setData(merged)
      }
    } catch { /* ignore */ }
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data, loaded])

  const updateCell = useCallback((type: 'revenue' | 'expenses', categoryId: string, month: string, field: 'projected' | 'actual', value: number | null) => {
    setData((prev) => {
      const next = structuredClone(prev)
      if (!next[type][categoryId]) return prev
      if (!next[type][categoryId][month]) next[type][categoryId][month] = { projected: 0, actual: null }
      if (field === 'actual') {
        next[type][categoryId][month].actual = value
      } else {
        next[type][categoryId][month].projected = value ?? 0
      }
      return next
    })
  }, [])

  const updateComment = useCallback((key: string, comment: string) => {
    setData((prev) => ({ ...prev, comments: { ...prev.comments, [key]: comment } }))
  }, [])

  const resetData = useCallback(() => {
    setData(buildDefaultState())
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const navigate = (t: Tab) => { setTab(t); setSidebarOpen(false) }
  const activeProduct = PRODUCTS.find((p) => p.id === tab)
  const yearFilter = year === 'all' ? undefined : parseInt(year)

  return (
    <div className="flex w-full min-h-screen relative">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 h-screen z-40 w-64 lg:w-60 gradient-dark text-white flex flex-col shrink-0 overflow-y-auto transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center text-xs font-black text-[#061840]">i10</div>
            <div>
              <h1 className="text-sm font-bold tracking-tight">Instituto i10</h1>
              <p className="text-[10px] text-white/40">Business Plan 2026–2029</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/50 hover:text-white text-xl leading-none">&times;</button>
        </div>

        <nav className="flex-1 py-3 px-2">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="mb-4">
              <p className="px-3 mb-1.5 text-[10px] font-bold tracking-widest text-white/30">{section.label}</p>
              {section.items.map((item) => {
                const isActive = tab === item.id
                const color = 'color' in item ? item.color : undefined
                return (
                  <button key={item.id} onClick={() => navigate(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${isActive ? 'bg-white/15 text-white' : 'text-white/50 hover:bg-white/5 hover:text-white/80'}`}>
                    <span className="text-xs" style={{ color: isActive ? (color ?? 'var(--cyan)') : undefined }}>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button onClick={resetData} className="w-full text-[11px] text-white/30 hover:text-white/60 transition-colors text-left">Resetar dados padrão</button>
          <p className="text-[10px] text-white/20 mt-2">Atualizado: Abril 2026 · v2.0</p>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-border px-4 lg:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-navy text-white text-sm">☰</button>
            <div className="min-w-0">
              <h2 className="text-sm lg:text-base font-bold text-foreground truncate">
                {tab === 'overview' ? 'Visão Geral' : tab === 'input' ? 'Reforecast & Actuals' : tab === 'export' ? 'Relatórios & Export' : tab === 'expenses' ? 'Despesas' : activeProduct?.name}
              </h2>
              <p className="text-[10px] lg:text-[11px] text-muted-fg hidden sm:block">Fechamento de contratos Jun/2026 – Jun/2027 · Receita projetada até 2029</p>
            </div>
          </div>
          <div className="flex items-center gap-0.5 bg-muted rounded-lg p-0.5 shrink-0 overflow-x-auto">
            {(['all', '2026', '2027', '2028', '2029'] as Year[]).map((y) => (
              <button key={y} onClick={() => setYear(y)}
                className={`px-2 lg:px-2.5 py-1.5 rounded-md text-[10px] lg:text-[11px] font-medium transition-all whitespace-nowrap ${year === y ? 'bg-white text-foreground shadow-sm' : 'text-muted-fg hover:text-foreground'}`}>
                {y === 'all' ? 'Todos' : y}
              </button>
            ))}
          </div>
        </header>

        <div className="p-4 lg:p-6 space-y-5 lg:space-y-6">
          {tab === 'overview' && (
            <>
              <KPICards data={data} yearFilter={yearFilter} />
              <RevenueChart data={data} yearFilter={yearFilter} />
              <FinancialTable data={data} yearFilter={yearFilter} />
            </>
          )}
          {tab === 'input' && <InputDashboard data={data} updateCell={updateCell} updateComment={updateComment} mode="revenue" />}
          {tab === 'expenses' && <InputDashboard data={data} updateCell={updateCell} updateComment={updateComment} mode="expenses" />}
          {tab === 'export' && <ExportPanel data={data} />}
          {activeProduct && <ProductDetail product={activeProduct} data={data} yearFilter={yearFilter} />}
        </div>
      </main>
    </div>
  )
}
