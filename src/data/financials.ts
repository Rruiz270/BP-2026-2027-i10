export interface MonthlyData {
  month: string
  projected: number
  actual: number | null
}

export interface SubProject {
  name: string
  state: string
  status: 'active' | 'negotiation' | 'prospecting'
  contractValue: number
  startDate: string
  endDate: string
  studentsTarget: number
  teachersTarget: number
  citiesCount: number
}

export interface KPI {
  label: string
  target2026: number
  target2027: number
  target2028: number
  target2029: number
  unit: string
}

export interface ProductLine {
  id: string
  name: string
  shortName: string
  description: string
  color: string
  revenue: MonthlyData[]
  subProjects: SubProject[]
  kpis: KPI[]
}

export interface ExpenseCategory {
  id: string
  name: string
  color: string
  data: MonthlyData[]
}

// ── Timeline: Jan 2026 – Dec 2029 (48 months) ──
function monthsForYear(y: number) {
  return Array.from({ length: 12 }, (_, i) => `${y}-${String(i + 1).padStart(2, '0')}`)
}
export const ALL_MONTHS = [...monthsForYear(2026), ...monthsForYear(2027), ...monthsForYear(2028), ...monthsForYear(2029)]
export const YEARS = [2026, 2027, 2028, 2029] as const

function build(v26: number[], v27: number[], v28: number[], v29: number[]): MonthlyData[] {
  const values = [...v26, ...v27, ...v28, ...v29]
  return ALL_MONTHS.map((month, i) => ({ month, projected: values[i], actual: null }))
}

// ── 1. INTEGRAÇÃO EDUCACIONAL COMPLETA ──
// SC: R$149.35M / 36 months (Aug 2026 – Jul 2029). New contracts close by end 2027.
const educationRevenue = build(
  [0, 0, 0, 0, 0, 0, 0, 9_605_000, 0, 9_605_000, 0, 9_605_000],
  [4_435_000, 4_435_000, 4_435_000, 4_435_000, 4_435_000, 4_435_000, 4_435_000, 4_435_000, 4_435_000, 6_935_000, 9_435_000, 12_435_000],
  [6_500_000, 6_800_000, 7_200_000, 7_500_000, 7_800_000, 8_000_000, 8_200_000, 8_500_000, 8_800_000, 9_000_000, 9_200_000, 9_500_000],
  [7_200_000, 7_000_000, 6_800_000, 6_500_000, 6_200_000, 6_000_000, 5_800_000, 5_500_000, 5_200_000, 5_000_000, 4_800_000, 4_500_000],
)

// ── 2. CONSULTORIA FUNDEB ──
// Starts Jun/2026. Active closings Jun/2026 – Jun/2027. Tail revenue after.
const fundebRevenue = build(
  [0, 0, 0, 0, 0, 1_800_000, 3_000_000, 4_200_000, 5_400_000, 7_200_000, 9_000_000, 11_400_000],
  [6_000_000, 6_600_000, 7_200_000, 7_800_000, 7_800_000, 7_800_000, 4_200_000, 4_200_000, 4_200_000, 3_600_000, 3_600_000, 3_600_000],
  [3_000_000, 3_000_000, 3_200_000, 3_200_000, 3_000_000, 3_000_000, 2_800_000, 2_800_000, 3_000_000, 3_000_000, 3_000_000, 3_000_000],
  [2_500_000, 2_500_000, 2_500_000, 2_500_000, 2_500_000, 2_500_000, 2_000_000, 2_000_000, 2_500_000, 2_500_000, 2_500_000, 2_500_000],
)

// ── 3. BNCC FORMAÇÃO ──
// Starts Jun/2026. Active closings Jun/2026 – Jun/2027. Ongoing enrollment after.
const bnccRevenue = build(
  [0, 0, 0, 0, 0, 800_000, 1_400_000, 2_000_000, 2_600_000, 3_400_000, 4_200_000, 5_600_000],
  [2_000_000, 2_000_000, 2_200_000, 2_200_000, 2_400_000, 2_400_000, 1_800_000, 1_800_000, 1_800_000, 1_800_000, 1_800_000, 1_800_000],
  [2_500_000, 2_500_000, 3_000_000, 3_000_000, 3_000_000, 3_000_000, 3_000_000, 3_000_000, 3_000_000, 3_500_000, 3_500_000, 3_500_000],
  [2_000_000, 2_000_000, 2_000_000, 2_000_000, 2_000_000, 2_000_000, 2_000_000, 2_000_000, 2_000_000, 2_000_000, 2_000_000, 2_000_000],
)

// ── 4. INTEGRAÇÃO MUNICIPAL COMPLETA ──
const municipalRevenue = build(
  [0, 0, 0, 0, 0, 0, 0, 0, 3_000_000, 2_000_000, 2_500_000, 2_500_000],
  [2_000_000, 2_000_000, 3_000_000, 3_000_000, 3_000_000, 4_000_000, 3_500_000, 3_500_000, 4_500_000, 3_500_000, 3_500_000, 2_000_000],
  [3_000_000, 3_500_000, 4_000_000, 4_000_000, 4_500_000, 4_500_000, 4_500_000, 4_000_000, 4_000_000, 4_000_000, 3_500_000, 3_500_000],
  [4_000_000, 4_000_000, 4_500_000, 5_000_000, 5_000_000, 5_000_000, 5_000_000, 4_500_000, 4_500_000, 4_500_000, 4_000_000, 4_000_000],
)

export const PRODUCTS: ProductLine[] = [
  {
    id: 'education',
    name: 'Integração Educacional Completa',
    shortName: 'Educação',
    description: 'Sistema estadual de gestão educacional unificado com IA. Integração de dados pedagógicos e administrativos para redes públicas de ensino.',
    color: '#0A2463',
    revenue: educationRevenue,
    subProjects: [
      { name: 'Santa Catarina — SED/SC', state: 'SC', status: 'active', contractValue: 149_350_000, startDate: '2026-08', endDate: '2029-07', studentsTarget: 530_000, teachersTarget: 35_000, citiesCount: 295 },
      { name: 'Goiás — SEDUC/GO', state: 'GO', status: 'negotiation', contractValue: 85_000_000, startDate: '2027-10', endDate: '2030-09', studentsTarget: 30_000, teachersTarget: 8_000, citiesCount: 246 },
      { name: 'Consórcio SP — Região Metropolitana', state: 'SP', status: 'prospecting', contractValue: 22_000_000, startDate: '2027-11', endDate: '2030-10', studentsTarget: 20_000, teachersTarget: 4_000, citiesCount: 25 },
      { name: 'Consórcio SP — Interior Paulista', state: 'SP', status: 'prospecting', contractValue: 22_000_000, startDate: '2027-11', endDate: '2030-10', studentsTarget: 18_000, teachersTarget: 3_500, citiesCount: 28 },
      { name: 'Consórcio RS — Serra Gaúcha', state: 'RS', status: 'prospecting', contractValue: 20_000_000, startDate: '2027-12', endDate: '2030-11', studentsTarget: 16_000, teachersTarget: 3_000, citiesCount: 22 },
      { name: 'Consórcio MG — Triângulo Mineiro', state: 'MG', status: 'prospecting', contractValue: 20_000_000, startDate: '2027-12', endDate: '2030-11', studentsTarget: 16_000, teachersTarget: 3_000, citiesCount: 20 },
    ],
    kpis: [
      { label: 'Alunos Impactados', target2026: 200_000, target2027: 630_000, target2028: 850_000, target2029: 900_000, unit: 'alunos' },
      { label: 'Professores Integrados', target2026: 25_000, target2027: 56_500, target2028: 75_000, target2029: 80_000, unit: 'professores' },
      { label: 'Escolas Conectadas', target2026: 400, target2027: 1_200, target2028: 2_000, target2029: 2_500, unit: 'escolas' },
    ],
  },
  {
    id: 'fundeb',
    name: 'Consultoria FUNDEB',
    shortName: 'FUNDEB',
    description: 'Consultoria especializada para otimização da captação e aplicação de recursos do FUNDEB. Análise de dados, compliance e maximização de repasses.',
    color: '#00C48A',
    revenue: fundebRevenue,
    subProjects: [
      { name: 'São Paulo — 350 municípios', state: 'SP', status: 'active', contractValue: 21_000_000, startDate: '2026-06', endDate: '2027-06', studentsTarget: 0, teachersTarget: 0, citiesCount: 350 },
      { name: 'Santa Catarina — 150 municípios', state: 'SC', status: 'active', contractValue: 9_000_000, startDate: '2026-06', endDate: '2027-06', studentsTarget: 0, teachersTarget: 0, citiesCount: 150 },
      { name: 'Brasil — Expansão Nacional 2026', state: 'BR', status: 'negotiation', contractValue: 12_000_000, startDate: '2026-06', endDate: '2027-06', studentsTarget: 0, teachersTarget: 0, citiesCount: 200 },
      { name: 'Brasil — Expansão Nacional 2027', state: 'BR', status: 'prospecting', contractValue: 66_600_000, startDate: '2027-01', endDate: '2027-06', studentsTarget: 0, teachersTarget: 0, citiesCount: 1_110 },
    ],
    kpis: [
      { label: 'Municípios Atendidos', target2026: 700, target2027: 1_810, target2028: 2_400, target2029: 2_900, unit: 'cidades' },
      { label: 'Receita Média por Cidade', target2026: 60_000, target2027: 60_000, target2028: 60_000, target2029: 60_000, unit: 'R$' },
      { label: 'FUNDEB Recuperado p/ Cidades', target2026: 500_000_000, target2027: 1_200_000_000, target2028: 1_800_000_000, target2029: 2_200_000_000, unit: 'R$' },
    ],
  },
  {
    id: 'bncc',
    name: 'BNCC Formação — Computação',
    shortName: 'BNCC',
    description: 'Plataforma online de formação e certificação de professores em competências de Computação alinhada à BNCC. Aulas gravadas, trilhas de aprendizagem e certificação.',
    color: '#00B4D8',
    revenue: bnccRevenue,
    subProjects: [
      { name: 'Plataforma EAD — Fase 1', state: 'BR', status: 'active', contractValue: 20_000_000, startDate: '2026-06', endDate: '2027-06', studentsTarget: 0, teachersTarget: 100_000, citiesCount: 0 },
      { name: 'Plataforma EAD — Expansão 2027', state: 'BR', status: 'prospecting', contractValue: 24_000_000, startDate: '2027-01', endDate: '2027-06', studentsTarget: 0, teachersTarget: 120_000, citiesCount: 0 },
    ],
    kpis: [
      { label: 'Professores Certificados', target2026: 100_000, target2027: 220_000, target2028: 400_000, target2029: 520_000, unit: 'professores' },
      { label: 'Ticket Médio', target2026: 200, target2027: 200, target2028: 200, target2029: 200, unit: 'R$/professor' },
      { label: 'Taxa de Conclusão', target2026: 75, target2027: 80, target2028: 82, target2029: 85, unit: '%' },
    ],
  },
  {
    id: 'municipal',
    name: 'Integração Municipal Completa',
    shortName: 'Municipal',
    description: 'Transformação digital completa de municípios: BI, sistemas e banco de dados integrados para Educação, Saúde, Infraestrutura, Social, Meio Ambiente, Esportes e Desenvolvimento Econômico.',
    color: '#F59E0B',
    revenue: municipalRevenue,
    subProjects: [
      { name: 'Município Piloto (a definir)', state: 'SP', status: 'negotiation', contractValue: 10_000_000, startDate: '2026-09', endDate: '2028-08', studentsTarget: 0, teachersTarget: 0, citiesCount: 1 },
      { name: 'Expansão 2027 — 3 municípios', state: 'BR', status: 'prospecting', contractValue: 30_000_000, startDate: '2027-03', endDate: '2029-02', studentsTarget: 0, teachersTarget: 0, citiesCount: 3 },
    ],
    kpis: [
      { label: 'Municípios Integrados', target2026: 1, target2027: 4, target2028: 7, target2029: 10, unit: 'cidades' },
      { label: 'Implementação por Cidade', target2026: 10_000_000, target2027: 10_000_000, target2028: 10_000_000, target2029: 10_000_000, unit: 'R$' },
      { label: 'Economia Identificada', target2026: 15_000_000, target2027: 80_000_000, target2028: 200_000_000, target2029: 350_000_000, unit: 'R$' },
    ],
  },
]

// ── EXPENSE CATEGORIES (defaults at 0 — editable via Input Dashboard) ──
const zeroMonths = () => ALL_MONTHS.map((month) => ({ month, projected: 0, actual: null }))

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { id: 'personnel', name: 'Pessoal & Equipe', color: '#EF4444', data: zeroMonths() },
  { id: 'technology', name: 'Tecnologia & Infraestrutura', color: '#F97316', data: zeroMonths() },
  { id: 'operations', name: 'Operacional & Logística', color: '#A855F7', data: zeroMonths() },
  { id: 'commercial', name: 'Comercial & Marketing', color: '#EC4899', data: zeroMonths() },
  { id: 'admin', name: 'Administrativo & Jurídico', color: '#6366F1', data: zeroMonths() },
  { id: 'partners', name: 'Parceiros & Terceirizados', color: '#14B8A6', data: zeroMonths() },
]

export const MUNICIPAL_FUND_SOURCES = [
  'FUNDEB — Fundo de Manutenção e Desenvolvimento da Educação Básica',
  'FMS — Fundo Municipal de Saúde',
  'FAMAS — Fundo Municipal de Assistência Social',
  'Fundo de Habitação e Infraestrutura',
  'FUNCULTURA / Lei Paulo Gustavo',
  'Fundo Municipal de Esporte e Lazer',
  'Fundo Municipal de Meio Ambiente',
  'Fundo de Desenvolvimento Econômico',
]

// ── State types (for editable dashboard) ──
export interface CellData { projected: number; actual: number | null }
export type CategoryData = Record<string, CellData>
export interface FinancialState {
  revenue: Record<string, CategoryData>
  expenses: Record<string, CategoryData>
}

export function buildDefaultState(): FinancialState {
  const revenue: Record<string, CategoryData> = {}
  for (const p of PRODUCTS) {
    revenue[p.id] = {}
    for (const m of p.revenue) {
      revenue[p.id][m.month] = { projected: m.projected, actual: m.actual }
    }
  }
  const expenses: Record<string, CategoryData> = {}
  for (const e of EXPENSE_CATEGORIES) {
    expenses[e.id] = {}
    for (const m of e.data) {
      expenses[e.id][m.month] = { projected: m.projected, actual: m.actual }
    }
  }
  return { revenue, expenses }
}

// ── Derived helpers ──
export function sumYear(data: CategoryData, year: number): { projected: number; actual: number } {
  let projected = 0, actual = 0
  for (const [month, cell] of Object.entries(data)) {
    if (month.startsWith(String(year))) {
      projected += cell.projected
      actual += cell.actual ?? 0
    }
  }
  return { projected, actual }
}

export function sumAll(data: CategoryData): { projected: number; actual: number } {
  let projected = 0, actual = 0
  for (const cell of Object.values(data)) {
    projected += cell.projected
    actual += cell.actual ?? 0
  }
  return { projected, actual }
}

export function getChartData(state: FinancialState) {
  return ALL_MONTHS.map((month) => {
    const entry: Record<string, string | number> = { month }
    let total = 0
    for (const p of PRODUCTS) {
      const val = state.revenue[p.id]?.[month]?.projected ?? 0
      entry[p.id] = val
      total += val
    }
    entry.total = total
    return entry
  })
}
