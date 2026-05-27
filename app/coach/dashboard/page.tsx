// app/coach/dashboard/page.tsx

import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { logoutAction } from '@/app/actions/auth'

export const metadata: Metadata = {
  title: 'Dashboard — CoachHub Fit',
}

// ── Icons ──────────────────────────────────────────────
const I = {
  Users: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Star: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  ),
  Inbox: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
    </svg>
  ),
  Plans: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  Check: () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Arrow: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
  Globe: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),
  Edit: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  Logout: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  Trend: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  Shield: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  Zap: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
}

// ── Helpers ────────────────────────────────────────────
function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

function statusConfig(s: string | null | undefined) {
  const map: Record<string, { label: string; dot: string }> = {
    online:  { label: 'Online',  dot: '#39FF7A' },
    offline: { label: 'Offline', dot: '#555550' },
    busy:    { label: 'Ocupado', dot: '#FBBF24' },
  }
  return map[s ?? 'offline'] ?? map.offline
}

// ── Page ───────────────────────────────────────────────
export default async function CoachDashboardPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('full_name, role, avatar_url')
    .eq('id', user.id)
    .single()

  const userProfile = profile
  if (profile?.role === 'student') redirect('/student/dashboard')
  // Admin só acessa /coach/dashboard se tiver coach_profile vinculado
  if (profile?.role === 'admin') {
    const { data: adminCp } = await supabase
      .from('coach_profiles').select('id').eq('user_id', user.id).single()
    if (!adminCp) redirect('/admin/dashboard')
    // tem coach_profile — continua normalmente abaixo
  }

  const { data: cp } = await supabase
    .from('coach_profiles')
    .select('id, slug, bio, short_bio, specialties, students_count, rating_avg, rating_count, status, approved, instagram_handle, visibility_tier, cover_image_url')
    .eq('user_id', user.id)
    .single()

  const [
    { count: pendingLeads },
    { count: totalLeads },
    { count: totalPlans },
    { count: activePlans },
  ] = await Promise.all([
    cp ? supabase.from('contracts').select('id', { count: 'exact', head: true }).eq('coach_profile_id', cp.id).eq('status', 'pending') : Promise.resolve({ count: 0 }),
    cp ? supabase.from('contracts').select('id', { count: 'exact', head: true }).eq('coach_profile_id', cp.id) : Promise.resolve({ count: 0 }),
    cp ? supabase.from('coach_plans').select('id', { count: 'exact', head: true }).eq('coach_profile_id', cp.id) : Promise.resolve({ count: 0 }),
    cp ? supabase.from('coach_plans').select('id', { count: 'exact', head: true }).eq('coach_profile_id', cp.id).eq('is_active', true) : Promise.resolve({ count: 0 }),
  ])

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Coach'
  const initials  = getInitials(profile?.full_name ?? 'Coach')
  const status    = statusConfig(cp?.status)

  // Setup checklist — ordered by priority
  const steps = [
    { done: !!(userProfile?.avatar_url),                   label: 'Adicione sua foto',          sub: 'Foto de perfil aumenta confiança dos alunos', href: '/coach/profile', cta: 'Adicionar foto' },
    { done: !!(cp?.cover_image_url),                       label: 'Adicione uma capa',          sub: 'Imagem de fundo do seu perfil público',        href: '/coach/profile', cta: 'Adicionar capa' },
    { done: !!(cp?.short_bio && cp.short_bio.length > 5),  label: 'Escreva sua frase de destaque', sub: 'Uma linha que resume seu diferencial',      href: '/coach/profile', cta: 'Escrever' },
    { done: !!(cp?.bio && cp.bio.length > 20),             label: 'Escreva sua bio',            sub: 'Conte sua história e metodologia',             href: '/coach/profile', cta: 'Editar perfil' },
    { done: (cp?.specialties?.length ?? 0) > 0,           label: 'Adicione especialidades',    sub: 'Musculação, nutrição, corrida…',                href: '/coach/profile', cta: 'Adicionar' },
    { done: (totalPlans ?? 0) > 0,                        label: 'Crie seu primeiro pacote',   sub: 'Defina preço e o que está incluso',             href: '/coach/plans/new', cta: 'Criar pacote' },
    { done: (totalLeads ?? 0) > 0,                        label: 'Receba seu primeiro lead',   sub: 'Compartilhe o link do seu perfil',              href: cp?.id ? `/coaches/${cp.id}` : '/coach/profile', cta: 'Ver perfil' },
  ]
  const doneCount = steps.filter(s => s.done).length
  const progress  = Math.round((doneCount / steps.length) * 100)
  const nextStep  = steps.find(s => !s.done)

  // Profile completeness score (0–100)
  const scoreItems = [
    { label: 'Foto de perfil',      done: !!(userProfile?.avatar_url) },
    { label: 'Bio completa',        done: !!(cp?.bio && cp.bio.length > 20) },
    { label: 'Especialidades',      done: (cp?.specialties?.length ?? 0) > 0 },
    { label: 'Plano publicado',     done: (activePlans ?? 0) > 0 },
  ]
  const score = Math.round((scoreItems.filter(i => i.done).length / scoreItems.length) * 100)

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-dark)' }}>

      {/* ── Sub-nav do coach (abaixo da Navbar existente) ── */}
      <div
        className="fixed top-16 left-0 right-0 z-30"
        style={{
          background: 'rgba(8,8,8,0.92)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(255,255,255,0.055)',
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between">

          {/* Identidade compacta */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
              style={{ background: 'var(--neon)', color: '#080808', fontFamily: 'var(--font-display)', fontSize: '11px' }}
            >
              {initials}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold hidden sm:block" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                {profile?.full_name ?? 'Coach'}
              </span>
              {/* Status inline */}
              <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: status.dot, boxShadow: cp?.status === 'online' ? `0 0 5px ${status.dot}` : 'none' }}
                />
                <span className="hidden sm:inline">{status.label}</span>
              </span>
              {cp?.approved && (
                <span
                  className="hidden sm:inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(57,255,122,0.08)', border: '1px solid rgba(57,255,122,0.18)', color: 'var(--neon)' }}
                >
                  <I.Shield /> Aprovado
                </span>
              )}
            </div>
          </div>

          {/* Nav links */}
          <nav className="flex items-center gap-0.5">
            {[
              { label: 'Perfil',  href: '/coach/profile' },
              { label: 'Pacotes', href: '/coach/plans' },
              { label: 'Leads',   href: '/coach/leads', badge: pendingLeads ?? 0 },
            ].map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="dash-nav-link flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium"
                style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)', transition: 'color 0.15s, background 0.15s' }}
              >
                {item.label}
                {(item.badge ?? 0) > 0 && (
                  <span
                    className="min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center font-black"
                    style={{ background: 'var(--neon)', color: '#080808', fontSize: '10px' }}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Logout */}
          <form action={logoutAction}>
            <button
              type="submit"
              className="dash-nav-link flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs"
              style={{ color: 'var(--text-muted)', transition: 'color 0.15s, background 0.15s' }}
            >
              <I.Logout />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </form>
        </div>
      </div>

      {/* ── Main content ────────────────────────────────── */}
      <div className="pt-28 pb-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-8">

          {/* ── Hero ────────────────────────────────────── */}
          <div className="flex items-end justify-between gap-4 flex-wrap pt-2">
            <div>
              <p
                className="text-xs font-medium mb-1.5 tracking-widest uppercase"
                style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}
              >
                Área do coach
              </p>
              <h1
                className="font-display font-extrabold tracking-tight"
                style={{ color: 'var(--text-primary)', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', lineHeight: 1.1 }}
              >
                Olá, {firstName} 👋
              </h1>
              <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                {doneCount < steps.length
                  ? `${steps.length - doneCount} ação${steps.length - doneCount > 1 ? 'ões' : ''} para turbinar seu perfil`
                  : 'Seu perfil está completo e pronto para receber leads.'}
              </p>
            </div>
            {cp?.id && (
              <Link
                href={`/coaches/${cp.id}`}
                target="_blank"
                className="dash-cta-btn flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium flex-shrink-0"
                style={{
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: 'var(--text-secondary)',
                  background: 'var(--surface)',
                  fontFamily: 'var(--font-display)',
                  transition: 'border-color 0.2s, color 0.2s, background 0.2s',
                }}
              >
                <I.Globe />
                Ver perfil público
              </Link>
            )}
          </div>

          {/* ── Métricas ────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                label: 'Conexões',
                value: cp?.students_count ?? 0,
                icon: <I.Users />,
                accent: '#60A5FA',
                href: null as string | null,
                sub: cp?.students_count ? 'via CoachHub' : 'Nenhum ainda',
              },
              {
                label: 'Leads recebidos',
                value: totalLeads ?? 0,
                icon: <I.Inbox />,
                accent: '#39FF7A',
                href: '/coach/leads' as string | null,
                sub: (pendingLeads ?? 0) > 0 ? `${pendingLeads} aguardando` : 'Todos atendidos',
                alert: (pendingLeads ?? 0) > 0,
              },
              {
                label: 'Pacotes ativos',
                value: activePlans ?? 0,
                icon: <I.Plans />,
                accent: '#C084FC',
                href: '/coach/plans' as string | null,
                sub: (totalPlans ?? 0) > (activePlans ?? 0) ? `${totalPlans} no total` : (totalPlans ?? 0) === 0 ? 'Crie um pacote' : 'Todos ativos',
              },
              {
                label: 'Avaliação',
                value: cp?.rating_avg ? cp.rating_avg.toFixed(1) : '—',
                icon: <I.Star />,
                accent: '#FBBF24',
                href: null as string | null,
                sub: cp?.rating_count ? `${cp.rating_count} avaliações` : 'Sem avaliações',
              },
            ].map(m => (
              <div
                key={m.label}
                className="relative group rounded-2xl p-4 overflow-hidden metric-lift"
                style={{
                  background: m.alert ? `rgba(57,255,122,0.05)` : 'var(--surface)',
                  border: `1px solid ${m.alert ? `rgba(57,255,122,0.3)` : 'var(--border)'}`,
                }}
              >
                {m.href && <Link href={m.href} className="absolute inset-0 z-10" aria-label={m.label} />}
                {/* Accent top line */}
                <div
                  className="absolute top-0 left-4 right-4 h-px rounded-full"
                  style={{ background: `linear-gradient(90deg, transparent, ${m.accent}60, transparent)` }}
                />
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: `${m.accent}15`, color: m.accent, border: `1px solid ${m.accent}20` }}
                  >
                    {m.icon}
                  </div>
                  {m.alert && (
                    <span
                      className="text-xs font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1"
                      style={{ background: 'rgba(57,255,122,0.15)', color: '#39FF7A', fontFamily: 'var(--font-display)' }}
                    >
                      <I.Zap /> {pendingLeads}
                    </span>
                  )}
                </div>
                <p
                  className="font-display font-black mb-0.5"
                  style={{ color: m.alert ? '#39FF7A' : 'var(--text-primary)', fontSize: 'clamp(1.4rem, 3vw, 1.875rem)', lineHeight: 1 }}
                >
                  {m.value}
                </p>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>{m.label}</p>
                <p className="text-xs" style={{ color: m.alert ? 'rgba(57,255,122,0.7)' : 'var(--text-muted)', opacity: 0.8 }}>
                  {m.sub}
                </p>
              </div>
            ))}
          </div>

          {/* ── Dois painéis lado a lado ─────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

            {/* Painel principal: next step + ações */}
            <div className="lg:col-span-3 flex flex-col gap-4">

              {/* Próximo passo — só aparece se há algo a fazer */}
              {nextStep && (
                <div
                  className="relative rounded-2xl p-5 overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(57,255,122,0.06) 0%, rgba(57,255,122,0.02) 100%)',
                    border: '1px solid rgba(57,255,122,0.2)',
                  }}
                >
                  {/* Glow sutil */}
                  <div
                    className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(57,255,122,0.08) 0%, transparent 70%)' }}
                  />
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-xs font-bold tracking-widest uppercase"
                        style={{ color: 'var(--neon)', fontFamily: 'var(--font-display)' }}
                      >
                        Próximo passo
                      </span>
                    </div>
                    <p className="font-display font-bold text-base mb-1" style={{ color: 'var(--text-primary)' }}>
                      {nextStep.label}
                    </p>
                    <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                      {nextStep.sub}
                    </p>
                    <Link href={nextStep.href} className="btn-primary text-sm inline-flex">
                      {nextStep.cta}
                    </Link>
                  </div>
                </div>
              )}

              {/* Atalhos de navegação */}
              <div
                className="rounded-2xl overflow-hidden"
                style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}
              >
                {[
                  {
                    href: '/coach/profile',
                    icon: <I.Edit />,
                    label: 'Editar perfil',
                    sub: 'Bio, especialidades, localização e redes sociais',
                    accent: '#60A5FA',
                  },
                  {
                    href: '/coach/plans',
                    icon: <I.Plans />,
                    label: 'Meus pacotes',
                    sub: `${activePlans ?? 0} plano${(activePlans ?? 0) !== 1 ? 's' : ''} ativo${(activePlans ?? 0) !== 1 ? 's' : ''} · ${totalPlans ?? 0} no total`,
                    accent: '#C084FC',
                  },
                  {
                    href: '/coach/leads',
                    icon: <I.Inbox />,
                    label: 'Painel de leads',
                    sub: (pendingLeads ?? 0) > 0
                      ? `${pendingLeads} lead${(pendingLeads ?? 0) > 1 ? 's' : ''} aguardando sua resposta`
                      : `${totalLeads ?? 0} lead${(totalLeads ?? 0) !== 1 ? 's' : ''} recebido${(totalLeads ?? 0) !== 1 ? 's' : ''} no total`,
                    accent: '#39FF7A',
                    badge: pendingLeads ?? 0,
                  },
                  {
                    href: '/coach/billing',
                    icon: <I.Star />,
                    label: 'Plano de visibilidade',
                    sub: cp?.visibility_tier === 'premium' ? 'Premium ativo'
                       : cp?.visibility_tier === 'featured' ? 'Destaque ativo'
                       : 'Gratuito — upgrade disponível',
                    accent: cp?.visibility_tier === 'premium' ? '#FBBF24'
                          : cp?.visibility_tier === 'featured' ? '#39FF7A'
                          : '#555550',
                  },
                ].map((item, idx, arr) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="dash-action-row group flex items-center gap-4 px-5 py-4"
                    style={{
                      borderBottom: idx < arr.length - 1 ? '1px solid var(--border)' : 'none',
                      transition: 'background 0.15s',
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${item.accent}18`, color: item.accent, transition: 'transform 0.2s' }}
                    >
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-sm font-semibold"
                          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
                        >
                          {item.label}
                        </span>
                        {(item.badge ?? 0) > 0 && (
                          <span
                            className="min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center text-xs font-black animate-pulse"
                            style={{ background: 'var(--neon)', color: '#080808', fontFamily: 'var(--font-display)' }}
                          >
                            {item.badge ?? 0}
                          </span>
                        )}
                      </div>
                      <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{item.sub}</p>
                    </div>
                    <div
                      className="flex-shrink-0 opacity-40 group-hover:opacity-100 group-hover:-translate-x-0 transition-all duration-200"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <I.Arrow />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Painel lateral: setup + score */}
            <div className="lg:col-span-2 flex flex-col gap-4">

              {/* Setup checklist */}
              <div
                className="rounded-2xl p-5"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p
                      className="text-xs font-bold tracking-widest uppercase mb-0.5"
                      style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}
                    >
                      Configuração
                    </p>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                      {progress === 100 ? 'Perfil completo 🎉' : `${doneCount} de ${steps.length} etapas`}
                    </p>
                  </div>
                  <div
                    className="relative w-12 h-12 flex-shrink-0"
                    style={{ fontSize: '12px' }}
                  >
                    <svg width="48" height="48" viewBox="0 0 48 48" className="rotate-[-90deg]">
                      <circle cx="24" cy="24" r="20" fill="none" stroke="var(--surface-3)" strokeWidth="3" />
                      <circle
                        cx="24" cy="24" r="20" fill="none"
                        stroke={progress === 100 ? 'var(--neon)' : 'var(--neon)'}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 20}`}
                        strokeDashoffset={`${2 * Math.PI * 20 * (1 - progress / 100)}`}
                        style={{ transition: 'stroke-dashoffset 0.8s ease', opacity: progress === 0 ? 0.3 : 1 }}
                      />
                    </svg>
                    <span
                      className="absolute inset-0 flex items-center justify-center font-black text-xs"
                      style={{ color: progress === 100 ? 'var(--neon)' : 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}
                    >
                      {progress}%
                    </span>
                  </div>
                </div>

                {/* Steps */}
                <div className="space-y-1.5">
                  {steps.map((step, i) => (
                    <Link
                      key={i}
                      href={step.done ? '#' : step.href}
                      className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 ${step.done ? 'pointer-events-none' : 'dash-step-row'}`}
                      style={{
                        background: step.done ? 'transparent' : 'var(--surface-2)',
                        opacity: step.done ? 0.45 : 1,
                      }}
                    >
                      {/* Circle */}
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          background: step.done ? 'var(--neon)' : 'transparent',
                          border: `1.5px solid ${step.done ? 'var(--neon)' : 'var(--border-hover)'}`,
                          color: '#080808',
                        }}
                      >
                        {step.done && <I.Check />}
                      </div>
                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-xs font-medium leading-tight"
                          style={{
                            color: step.done ? 'var(--text-muted)' : 'var(--text-secondary)',
                            textDecoration: step.done ? 'line-through' : 'none',
                          }}
                        >
                          {step.label}
                        </p>
                      </div>
                      {/* CTA on hover */}
                      {!step.done && (
                        <span
                          className="text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex-shrink-0"
                          style={{ color: 'var(--neon)', fontFamily: 'var(--font-display)' }}
                        >
                          {step.cta} →
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Visibilidade do perfil */}
              <div
                className="rounded-2xl p-5"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <p
                  className="text-xs font-bold tracking-widest uppercase mb-3"
                  style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}
                >
                  Visibilidade
                </p>
                <div className="space-y-2.5">
                  {scoreItems.map(item => (
                    <div key={item.label} className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                        style={{
                          background: item.done ? 'rgba(57,255,122,0.15)' : 'var(--surface-3)',
                          border: `1px solid ${item.done ? 'rgba(57,255,122,0.3)' : 'var(--border)'}`,
                        }}
                      >
                        {item.done && (
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#39FF7A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        )}
                      </div>
                      <span className="text-xs flex-1" style={{ color: item.done ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                        {item.label}
                      </span>
                      {!item.done && (
                        <Link
                          href="/coach/profile"
                          className="text-xs"
                          style={{ color: 'rgba(57,255,122,0.5)', fontFamily: 'var(--font-display)' }}
                        >
                          + add
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
                <div
                  className="mt-4 pt-4"
                  style={{ borderTop: '1px solid var(--border)' }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Completude do perfil</span>
                    <span className="text-xs font-bold" style={{ color: score >= 75 ? 'var(--neon)' : 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
                      {score}%
                    </span>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--surface-3)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${score}%`,
                        background: score >= 75 ? 'var(--neon)' : score >= 50 ? '#FBBF24' : '#60A5FA',
                        transition: 'width 0.8s ease',
                        boxShadow: score > 0 ? `0 0 6px currentColor` : 'none',
                      }}
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
