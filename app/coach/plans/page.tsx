// app/coach/plans/page.tsx

import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { togglePlanActiveAction, deletePlanAction } from '@/app/actions/plans'

export const metadata: Metadata = {
  title: 'Pacotes — CoachHub Fit',
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)
}

export default async function CoachPlansPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userRow } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (userRow?.role !== 'coach' && userRow?.role !== 'admin') redirect('/student/dashboard')

  const { data: cp } = await supabase.from('coach_profiles').select('id').eq('user_id', user.id).single()
  if (!cp) redirect('/coach/dashboard')

  const { data: plans } = await supabase
    .from('coach_plans')
    .select('*')
    .eq('coach_profile_id', cp.id)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  const activePlans   = (plans ?? []).filter(p => p.is_active)
  const inactivePlans = (plans ?? []).filter(p => !p.is_active)

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6" style={{ background: 'var(--bg-dark)' }}>
      <div className="max-w-3xl mx-auto">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs mb-8" style={{ color: 'var(--text-muted)' }}>
          <Link href="/coach/dashboard" className="hover:text-neon transition-colors duration-150">Dashboard</Link>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          <span style={{ color: 'var(--text-secondary)' }}>Pacotes</span>
        </nav>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
          <div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight mb-1" style={{ color: 'var(--text-primary)' }}>
              Meus pacotes
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {(plans ?? []).length === 0
                ? 'Nenhum pacote criado. Pacotes visíveis aparecem no seu perfil público.'
                : `${activePlans.length} ativo${activePlans.length !== 1 ? 's' : ''} · ${(plans ?? []).length} no total`}
            </p>
          </div>
          <Link href="/coach/plans/new" className="btn-primary text-sm flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Novo pacote
          </Link>
        </div>

        {/* Estado vazio */}
        {(!plans || plans.length === 0) && (
          <div className="rounded-2xl p-12 text-center"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'var(--surface-2)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--text-muted)' }}>
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <p className="font-display font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>
              Crie seu primeiro pacote
            </p>
            <p className="text-sm mb-6 max-w-xs mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Pacotes aparecem no seu perfil público e permitem que alunos demonstrem interesse.
            </p>
            <Link href="/coach/plans/new" className="btn-primary text-sm">
              Criar pacote agora
            </Link>
          </div>
        )}

        {/* Pacotes ativos */}
        {activePlans.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
              Ativos · {activePlans.length}
            </p>
            <div className="flex flex-col gap-3">
              {activePlans.map((plan, idx) => (
                <PlanCard key={plan.id} plan={plan} rank={idx} />
              ))}
            </div>
          </div>
        )}

        {/* Pacotes inativos */}
        {inactivePlans.length > 0 && (
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
              Inativos · {inactivePlans.length}
            </p>
            <div className="flex flex-col gap-3" style={{ opacity: 0.6 }}>
              {inactivePlans.map(plan => (
                <PlanCard key={plan.id} plan={plan} rank={-1} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

// ── PlanCard component ─────────────────────────────────
function PlanCard({ plan, rank }: {
  plan: {
    id: string; name: string; description: string; price_brl: number
    features: string[]; is_active: boolean; duration_days: number | null
    update_freq: string; max_students: number; sort_order: number
  }
  rank: number
}) {
  const isTop = rank === 0 && plan.is_active

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'var(--surface)',
        border: `1px solid ${isTop ? 'rgba(57,255,122,0.25)' : 'var(--border)'}`,
      }}
    >
      {/* Top gradient bar para o plano destaque */}
      {isTop && (
        <div className="h-0.5" style={{ background: 'linear-gradient(90deg, transparent, rgba(57,255,122,0.6), transparent)' }} />
      )}

      <div className="p-5">
        <div className="flex items-start gap-4">

          {/* Info principal */}
          <div className="flex-1 min-w-0">
            {/* Nome + badge */}
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h2 className="font-display font-bold text-base" style={{ color: 'var(--text-primary)' }}>
                {plan.name}
              </h2>
              {isTop && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: 'rgba(57,255,122,0.1)', color: 'var(--neon)', border: '1px solid rgba(57,255,122,0.2)' }}
                >
                  Principal
                </span>
              )}
              {!plan.is_active && (
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--surface-3)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                  Inativo
                </span>
              )}
            </div>

            {/* Descrição */}
            {plan.description && (
              <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{plan.description}</p>
            )}

            {/* Preço + metadados */}
            <div className="flex items-baseline gap-1 mb-3">
              <span className="font-display font-black text-2xl" style={{ color: isTop ? 'var(--neon)' : 'var(--text-primary)' }}>
                {formatPrice(plan.price_brl)}
              </span>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>/mês</span>
            </div>

            {/* Chips de metadados */}
            <div className="flex flex-wrap gap-2 mb-3">
              {plan.duration_days && (
                <span className="text-xs px-2.5 py-1 rounded-lg" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                  {plan.duration_days} dias
                </span>
              )}
              {plan.update_freq && (
                <span className="text-xs px-2.5 py-1 rounded-lg" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                  Atualização {plan.update_freq}
                </span>
              )}

            </div>

            {/* Features preview */}
            {plan.features.length > 0 && (
              <div className="flex flex-col gap-1">
                {plan.features.slice(0, 3).map((f: string) => (
                  <div key={f} className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--neon)', flexShrink: 0 }}>
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                    {f}
                  </div>
                ))}
                {plan.features.length > 3 && (
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    +{plan.features.length - 3} mais
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Ações verticais */}
          <div className="flex flex-col gap-1.5 flex-shrink-0">
            <Link
              href={`/coach/plans/${plan.id}/edit`}
              className="btn-ghost text-xs px-3 py-2"
            >
              Editar
            </Link>

            <form action={async () => { 'use server'; await togglePlanActiveAction(plan.id, plan.is_active) }}>
              <button type="submit" className="btn-ghost text-xs px-3 py-2 w-full">
                {plan.is_active ? 'Desativar' : 'Ativar'}
              </button>
            </form>

            <form action={async () => { 'use server'; await deletePlanAction(plan.id) }}>
              <button
                type="submit"
                className="btn-ghost text-xs px-3 py-2 w-full"
                style={{ color: 'rgba(248,113,113,0.7)' }}
              >
                Excluir
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
