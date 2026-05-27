// app/coach/plans/new/page.tsx

import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { PlanForm } from '@/components/coach/PlanForm'
import { createPlanAction } from '@/app/actions/plans'

export const metadata: Metadata = {
  title: 'Novo plano — CoachHub Fit',
}

export default async function NewPlanPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userRow } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userRow?.role === 'student') redirect('/student/dashboard')
  if (userRow?.role === 'admin') {
    const { data: adminCheck } = await supabase
      .from('coach_profiles').select('id').eq('user_id', user.id).single()
    if (!adminCheck) redirect('/admin/dashboard')
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">

        <nav className="flex items-center gap-2 text-xs mb-8" style={{ color: 'var(--text-muted)' }}>
          <Link href="/coach/dashboard" className="hover:text-neon transition-colors">Dashboard</Link>
          <span>/</span>
          <Link href="/coach/plans" className="hover:text-neon transition-colors">Meus planos</Link>
          <span>/</span>
          <span style={{ color: 'var(--text-secondary)' }}>Novo</span>
        </nav>

        <div className="mb-8">
          <span className="section-tag mb-3 inline-flex">Planos</span>
          <h1
            className="font-display font-extrabold text-2xl sm:text-3xl"
            style={{ color: 'var(--text-primary)' }}
          >
            Novo plano
          </h1>
        </div>

        <PlanForm action={createPlanAction} />

      </div>
    </div>
  )
}
