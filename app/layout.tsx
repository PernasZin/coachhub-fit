import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'
import { NavbarWrapper } from '@/components/layout/NavbarWrapper'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'CoachHub Fit — Plataforma para coaches de alta performance',
  description:
    'Encontre coaches verificados por especialidade e entre em contato direto. Para coaches: crie seu perfil e receba leads qualificados.',
  keywords: ['personal trainer', 'coach online', 'treinamento personalizado', 'plataforma de coaching'],
  openGraph: {
    title: 'CoachHub Fit',
    description: 'A plataforma que conecta coaches e alunos de alta performance.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <NavbarWrapper />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
