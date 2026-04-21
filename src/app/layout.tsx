import type { Metadata } from "next"
import { Inter, Source_Serif_4, Geist_Mono } from "next/font/google"
import "./globals.css"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Business Plan 2026–2029 | Instituto i10",
  description: "Plano de Negócios Interativo — Receitas, Despesas, Projeções e Acompanhamento de Resultados",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${sourceSerif.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex">{children}</body>
    </html>
  )
}
