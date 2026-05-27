// app/student/dashboard/page.tsx

import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { logoutAction } from '@/app/actions/auth'

export const metadata: Metadata = { title: 'Dashboard — CoachHub Fit' }

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase()
}

export default async function StudentDashboardPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'coach') redirect('/coach/dashboard')
  if (profile?.role === 'admin')  redirect('/admin/dashboard')

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Aluno'
  const initials  = getInitials(profile?.full_name ?? 'A')

  // Leads do aluno (para ver se já interagiu com algum coach)
  const { data: leads } = await supabase
    .from('contracts')
    .select(`
      id, status, created_at, plan_name_snapshot,
      coach_profiles (
        id,
        users ( full_name )
      )
    `)
    .eq('student_user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const activeLeads  = (leads ?? []).filter(l => l.status === 'active')
  const pendingLeads = (leads ?? []).filter(l => l.status === 'pending')
  const hasLeads     = (leads ?? []).length > 0

  return (
    <div className="min-h-screen pt-28 pb-16 px-4 sm:px-6" style={{ background: 'var(--bg-dark)' }}>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-black text-sm flex-shrink-0"
              style={{ background: 'var(--neon)', color: '#080808' }}
            >
              {initials}
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-widest mb-0.5" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
                Área do aluno
              </p>
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight leading-none" style={{ color: 'var(--text-primary)' }}>
                Olá, {firstName}
              </h1>
            </div>
          </div>
          <form action={logoutAction}>
            <button type="submit" className="btn-ghost text-sm flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Sair
            </button>
          </form>
        </div>

        {/* Se tem coach ativo */}
        {activeLeads.length > 0 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: 'Coaches ativos', value: activeLeads.length, color: '#39FF7A' },
                { label: 'Leads enviados', value: (leads ?? []).length, color: '#60A5FA' },
                { label: 'Pendentes', value: pendingLeads.length, color: '#FBBF24' },
              ].map(m => (
                <div key={m.label} className="rounded-2xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <div className="h-0.5 mb-4 rounded-full -mx-4 -mt-4" style={{ background: `linear-gradient(90deg, transparent, ${m.color}40, transparent)` }} />
                  <p className="font-display font-black text-2xl" style={{ color: m.color }}>{m.value}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{m.label}</p>
                </div>
              ))}
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
                Suas conversas
              </p>
              <div className="flex flex-col gap-2">
                {(leads ?? []).slice(0, 5).map((lead: any) => {
                  const coachName = (lead.coach_profiles as any)?.users?.full_name ?? 'Coach'
                  const coachInitials = getInitials(coachName)
                  const statusMap: Record<string, { label: string; color: string }> = {
                    pending: { label: 'Aguardando resposta', color: '#39FF7A' },
                    active:  { label: 'Cliente ativo',       color: '#60A5FA' },
                    cancelled: { label: 'Arquivado',          color: '#555550' },
                  }
                  const s = statusMap[lead.status] ?? statusMap.pending
                  return (
                    <div key={lead.id} className="flex items-center gap-3 px-4 py-3.5 rounded-2xl"
                      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center font-display font-black text-xs flex-shrink-0"
                        style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                        {coachInitials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                          {coachName}
                        </p>
                        {lead.plan_name_snapshot && (
                          <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{lead.plan_name_snapshot}</p>
                        )}
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded-full flex-shrink-0" style={{
                        background: `${s.color}15`, border: `1px solid ${s.color}30`, color: s.color
                      }}>
                        {s.label}
                      </span>
                    </div>
                  )
                })}
              </div>
              <div className="mt-4">
                <Link href="/coaches" className="btn-secondary text-sm">
                  Explorar mais coaches
                </Link>
              </div>
            </div>
          </div>
        ) : hasLeads ? (
          /* Tem leads mas nenhum ativo ainda */
          <div className="space-y-6">
            <div
              className="rounded-2xl p-6"
              style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.15)' }}
            >
              <p className="font-display font-bold text-base mb-1" style={{ color: 'var(--text-primary)' }}>
                {pendingLeads.length} interesse{pendingLeads.length !== 1 ? 's' : ''} aguardando resposta
              </p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Os coaches que você contatou ainda não responderam. Aguarde — eles entrarão em contato pelo número que você informou.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {(leads ?? []).map((lead: any) => {
                const coachName = (lead.coach_profiles as any)?.users?.full_name ?? 'Coach'
                return (
                  <div key={lead.id} className="flex items-center gap-3 px-4 py-3.5 rounded-2xl"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center font-display font-black text-xs flex-shrink-0"
                      style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
                      {getInitials(coachName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>{coachName}</p>
                      {lead.plan_name_snapshot && (
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{lead.plan_name_snapshot}</p>
                      )}
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)', color: '#FBBF24' }}>
                      Aguardando
                    </span>
                  </div>
                )
              })}
            </div>
            <Link href="/coaches" className="btn-secondary text-sm inline-flex">
              Explorar mais coaches
            </Link>
          </div>
        ) : (
          /* Sem nenhum lead — estado vazio principal */
          <div className="space-y-6">
            {/* CTA hero */}
            <div
              className="relative rounded-2xl p-8 sm:p-10 overflow-hidden"
              style={{ background: 'rgba(57,255,122,0.05)', border: '1px solid rgba(57,255,122,0.18)' }}
            >
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(57,255,122,0.08) 0%, transparent 70%)' }} />
              <div className="relative">
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--neon)', fontFamily: 'var(--font-display)' }}>
                  Por onde começar
                </p>
                <h2 className="font-display font-extrabold text-2xl sm:text-3xl mb-2" style={{ color: 'var(--text-primary)' }}>
                  Encontre seu coach ideal
                </h2>
                <p className="text-sm mb-6 max-w-md" style={{ color: 'var(--text-secondary)' }}>
                  Você ainda não se conectou com nenhum coach. Explore os profissionais disponíveis, escolha um plano e envie seu interesse em segundos.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/coaches" className="btn-primary text-sm">
                    Explorar coaches
                  </Link>
                  <Link href="/como-funciona" className="btn-secondary text-sm">
                    Como funciona
                  </Link>
                </div>
              </div>
            </div>

            {/* Cards explicativos — o que você terá */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
                O que você terá ao contratar um coach
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    icon: (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                    ),
                    color: '#60A5FA',
                    title: 'Acompanhamento direto',
                    desc: 'Comunicação com seu coach via WhatsApp ou plataforma, sem burocracia.',
                  },
                  {
                    icon: (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                    ),
                    color: '#39FF7A',
                    title: 'Pacote sob medida',
                    desc: 'O coach apresenta pacotes com o que está incluso, preço e formato de trabalho.',
                  },
                  {
                    icon: (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                      </svg>
                    ),
                    color: '#C084FC',
                    title: 'Acompanhamento de evolução',
                    desc: 'Check-ins periódicos para ajustar o plano conforme seu progresso.',
                  },
                  {
                    icon: (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                    ),
                    color: '#FBBF24',
                    title: 'Resultados reais',
                    desc: 'Avaliações, fotos de progresso e métricas que comprovam sua transformação.',
                  },
                ].map(card => (
                  <div key={card.title} className="flex items-start gap-4 p-4 rounded-2xl"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${card.color}18`, color: card.color, border: `1px solid ${card.color}20` }}>
                      {card.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-0.5" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                        {card.title}
                      </p>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                        {card.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
