// app/coach/plans/[id]/edit/page.tsx

import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { PlanForm } from '@/components/coach/PlanForm'
import { updatePlanAction } from '@/app/actions/plans'

export const metadata: Metadata = {
  title: 'Editar plano — CoachHub Fit',
}

interface PageProps {
  params: { id: string }
}

export default async function EditPlanPage({ params }: PageProps) {
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

  // Busca o coach_profile_id para confirmar posse antes de renderizar
  const { data: cp } = await supabase
    .from('coach_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!cp) redirect('/coach/dashboard')

  const { data: plan } = await supabase
    .from('coach_plans')
    .select('*')
    .eq('id', params.id)
    .eq('coach_profile_id', cp.id) // garante que é o dono
    .single()

  if (!plan) notFound()

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">

        <nav className="flex items-center gap-2 text-xs mb-8" style={{ color: 'var(--text-muted)' }}>
          <Link href="/coach/dashboard" className="hover:text-neon transition-colors">Dashboard</Link>
          <span>/</span>
          <Link href="/coach/plans" className="hover:text-neon transition-colors">Meus planos</Link>
          <span>/</span>
          <span style={{ color: 'var(--text-secondary)' }}>Editar</span>
        </nav>

        <div className="mb-8">
          <span className="section-tag mb-3 inline-flex">Planos</span>
          <h1
            className="font-display font-extrabold text-2xl sm:text-3xl"
            style={{ color: 'var(--text-primary)' }}
          >
            Editar plano
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {plan.name}
          </p>
        </div>

        <PlanForm action={updatePlanAction} plan={plan} />

      </div>
    </div>
  )
}
