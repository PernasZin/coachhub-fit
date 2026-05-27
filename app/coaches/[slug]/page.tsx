// app/coaches/[slug]/page.tsx
// Rota unificada para perfil público de coach.
// Se o parâmetro for um UUID → busca coach real no Supabase.
// Caso contrário → tenta fallback no mock data.
// Se não encontrar nada → notFound().

import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getCoachBySlug } from '@/data/mockCoaches'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatCurrency, formatRating, pluralize } from '@/lib/utils'
import type { DbCoachWithUser } from '@/lib/adapters'
import type { DbCoachPlan } from '@/types/database'
import { InterestButton } from '@/components/coaches/InterestButton'

interface PageProps {
  params: { slug: string }
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function isUUID(value: string): boolean {
  return UUID_RE.test(value)
}

// ── Metadata ──────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = params

  if (isUUID(slug)) {
    const supabase = createClient()
    const { data } = await supabase
      .from('coach_profiles')
      .select('bio, short_bio, users ( full_name )')
      .eq('id', slug)
      .eq('approved', true)
      .single()

    if (data) {
      const row = data as typeof data & { users: { full_name: string } }
      const desc = row.short_bio || row.bio?.slice(0, 155) || 'Coach no CoachHub Fit'
      return {
        title: `${row.users.full_name} — CoachHub Fit`,
        description: desc,
        openGraph: {
          title: `${row.users.full_name} — CoachHub Fit`,
          description: desc,
          type: 'profile',
        },
      }
    }
  }

  // Mock fallback
  const mock = getCoachBySlug(slug)
  if (!mock) return { title: 'Coach não encontrado — CoachHub Fit' }
  return {
    title: `${mock.name} — CoachHub Fit`,
    description: mock.shortBio,
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────
function formatPrice(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100)
}

// ── Página ────────────────────────────────────────────────────────────────
export default async function CoachProfilePage({ params }: PageProps) {
  const { slug } = params

  // ── Tenta coach real se for UUID ────────────────────────────────────────
  if (isUUID(slug)) {
    const supabase = createClient()

    // Verifica sessão para saber se o próprio coach está visualizando
    const { data: { user } } = await supabase.auth.getUser()

    // Busca o perfil sem filtro de aprovação
    const { data: profileRow } = await supabase
      .from('coach_profiles')
      .select('*, users ( full_name, avatar_url )')
      .eq('id', slug)
      .single()

    if (profileRow) {
      const coach = profileRow as unknown as DbCoachWithUser

      // Coach não aprovado: só ele mesmo pode ver (pré-visualização)
      // Visitantes e alunos recebem 404
      const isOwner = user && coach.user_id === user.id
      if (!coach.approved && !isOwner) notFound()

      const { data: plans } = await supabase
        .from('coach_plans')
        .select('*')
        .eq('coach_profile_id', slug)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      const activePlans = plans ?? []
      const firstName = coach.users.full_name.split(' ')[0]

      // Verifica se visitante é aluno logado (para mostrar campo de e-mail no modal)
      const isLoggedIn = !!user && !isOwner

      return (
        <RealCoachProfile
          coach={coach}
          plans={activePlans}
          firstName={firstName}
          isPreview={!coach.approved && !!isOwner}
          isLoggedIn={isLoggedIn}
        />
      )
    }

    // UUID não encontrado no banco → 404
    notFound()
  }

  // ── Fallback mock por slug ──────────────────────────────────────────────
  const mock = getCoachBySlug(slug)
  if (!mock) notFound()

  return <MockCoachProfile coach={mock} />
}

// ══════════════════════════════════════════════════════════════════════════
// Componente: perfil real (dados do Supabase)
// ══════════════════════════════════════════════════════════════════════════
function RealCoachProfile({
  coach,
  plans,
  firstName,
  isPreview = false,
  isLoggedIn = false,
}: {
  coach: DbCoachWithUser
  plans: DbCoachPlan[]
  firstName: string
  isPreview?: boolean
  isLoggedIn?: boolean
}) {
  const hasStats = coach.rating_count > 0 || coach.students_count > 0 || coach.years_experience > 0
  const hasSocial = coach.instagram_handle || coach.youtube_handle || coach.linkedin_url

  return (
    <div className="min-h-screen pt-16 pb-24">

      {/* ── Banner de pré-visualização */}
      {isPreview && (
        <div
          className="fixed top-16 left-0 right-0 z-40 px-4 py-2.5 flex items-center justify-center gap-3 text-sm"
          style={{ background: 'rgba(251,191,36,0.12)', borderBottom: '1px solid rgba(251,191,36,0.25)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#FBBF24', flexShrink: 0 }}>
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
          </svg>
          <span style={{ color: '#FBBF24' }}>
            <strong>Pré-visualização</strong> — seu perfil ainda não está aprovado. Só você consegue ver esta página.
          </span>
          <a href="/coach/profile" style={{ color: '#FBBF24', textDecoration: 'underline', fontSize: '12px' }}>
            Editar perfil →
          </a>
        </div>
      )}

      {/* ── Cover area */}
      <div className="relative h-52 sm:h-64 lg:h-72 overflow-hidden"
        style={{
          background: coach.visibility_tier === 'premium'
            ? 'linear-gradient(135deg,#1a1200,#0a0800)'
            : coach.visibility_tier === 'featured'
            ? 'linear-gradient(135deg,#001a0a,#080808)'
            : 'var(--surface-2)',
        }}>
        {coach.cover_image_url && (
          <Image src={coach.cover_image_url} alt="" fill className="object-cover" priority sizes="100vw"
            style={{ opacity: coach.visibility_tier !== 'free' ? 0.35 : 0.28 }} />
        )}
        {!coach.cover_image_url && (
          <div className="absolute inset-0"
            style={{
              backgroundImage: coach.visibility_tier === 'premium'
                ? 'radial-gradient(ellipse 80% 60% at 30% 60%, rgba(251,191,36,0.12) 0%, transparent 70%)'
                : coach.visibility_tier === 'featured'
                ? 'radial-gradient(ellipse 80% 60% at 30% 60%, rgba(57,255,122,0.1) 0%, transparent 70%)'
                : 'radial-gradient(ellipse 60% 50% at 30% 70%, rgba(255,255,255,0.04) 0%, transparent 70%)',
            }} />
        )}
        {/* Gradient overlay — stronger pull to bg */}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(8,8,8,0.05) 0%, rgba(8,8,8,0.55) 65%, var(--bg-dark) 100%)' }} />
        {/* Tier accent line at bottom */}
        {coach.visibility_tier !== 'free' && (
          <div className="absolute bottom-0 left-0 right-0 h-px"
            style={{
              background: coach.visibility_tier === 'premium'
                ? 'linear-gradient(90deg, transparent, rgba(251,191,36,0.6), transparent)'
                : 'linear-gradient(90deg, transparent, rgba(57,255,122,0.5), transparent)',
            }} />
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">

        {/* ── Hero: avatar + nome + CTA */}
        <div className="relative -mt-14 sm:-mt-16 mb-8 sm:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">

            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden"
                style={{
                  border: `3px solid var(--bg-dark)`,
                  background: 'var(--surface-3)',
                  boxShadow: coach.visibility_tier === 'premium'
                    ? '0 0 0 2px rgba(251,191,36,0.4), 0 12px 40px rgba(0,0,0,0.7)'
                    : coach.visibility_tier === 'featured'
                    ? '0 0 0 2px rgba(57,255,122,0.4), 0 12px 40px rgba(0,0,0,0.7)'
                    : '0 8px 32px rgba(0,0,0,0.6)',
                }}
              >
                {coach.users.avatar_url ? (
                  <Image src={coach.users.avatar_url} alt={coach.users.full_name}
                    width={128} height={128} className="object-cover w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-display font-black text-3xl sm:text-4xl"
                    style={{
                      background: coach.visibility_tier === 'premium'
                        ? 'linear-gradient(135deg,rgba(251,191,36,0.2),rgba(251,191,36,0.05))'
                        : 'linear-gradient(135deg, var(--surface-2), var(--surface-3))',
                      color: coach.visibility_tier === 'premium' ? '#FBBF24' : 'var(--neon)',
                    }}>
                    {coach.users.full_name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              {/* Tier badge on avatar */}
              {coach.visibility_tier === 'premium' && (
                <span className="absolute -bottom-1.5 -right-1.5 text-xs font-black px-2 py-0.5 rounded-full"
                  style={{ background: '#FBBF24', color: '#080808', fontFamily: 'var(--font-display)', fontSize: '9px', letterSpacing: '0.06em' }}>
                  PREMIUM
                </span>
              )}
              {coach.visibility_tier === 'featured' && (
                <span className="absolute -bottom-1.5 -right-1.5 text-xs font-black px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--neon)', color: '#080808', fontFamily: 'var(--font-display)', fontSize: '9px', letterSpacing: '0.06em' }}>
                  DESTAQUE
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0 pb-1">
              {/* Status + location */}
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <StatusBadge status={coach.status} size="sm" />
                {coach.visibility_tier === 'premium' && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: '#FBBF24', color: '#080808', fontFamily: 'var(--font-display)' }}>
                    Premium
                  </span>
                )}
                {coach.visibility_tier === 'featured' && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: 'var(--neon)', color: '#080808', fontFamily: 'var(--font-display)' }}>
                    Destaque
                  </span>
                )}
                {coach.location && (
                  <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    {coach.location}
                  </span>
                )}
                {coach.years_experience > 0 && (
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {coach.years_experience} anos de exp.
                  </span>
                )}
              </div>

              <h1 className="font-display font-extrabold tracking-tight mb-1.5"
                style={{
                  fontSize: 'clamp(1.6rem, 4vw, 2.25rem)',
                  lineHeight: 1.05,
                  color: 'var(--text-primary)',
                }}>
                {coach.users.full_name}
              </h1>

              {/* Short bio */}
              {(coach.short_bio || coach.bio) && (
                <p className="text-sm leading-relaxed max-w-lg" style={{ color: 'var(--text-secondary)' }}>
                  {coach.short_bio || coach.bio.slice(0, 140)}
                </p>
              )}
            </div>

            {/* CTA desktop */}
            <div className="hidden sm:block flex-shrink-0">
              <InterestButton
                coachProfileId={coach.id}
                coachName={coach.users.full_name}
                label={`Falar com ${firstName}`}
                  isLoggedIn={isLoggedIn}
              />
            </div>
          </div>

          {/* Especialidades inline */}
          {coach.specialties.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {coach.specialties.map(spec => (
                <span key={spec} className="spec-pill">{spec}</span>
              ))}
            </div>
          )}

          {/* Stats bar */}
          {hasStats && (
            <div
              className="flex items-center gap-6 mt-5 pt-5 flex-wrap"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              {coach.rating_count > 0 && (
                <div className="flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#FBBF24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <span className="font-display font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                    {Number(coach.rating_avg).toFixed(1)}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>({coach.rating_count} avaliações)</span>
                </div>
              )}
              {coach.students_count > 0 && (
                <div className="flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ color: 'var(--text-muted)' }}>
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  <span className="font-display font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{coach.students_count}</span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>via CoachHub</span>
                </div>
              )}
              {plans.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-bold text-sm" style={{ color: 'var(--neon)' }}>
                    A partir de{' '}
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
                      .format(Math.min(...plans.map(p => p.price_brl)) / 100)}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>/mês</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Grid: conteúdo + sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Coluna principal */}
          <div className="lg:col-span-2 flex flex-col gap-10">

            {/* Bio completa */}
            {coach.bio && (
              <section>
                <h2 className="font-display font-semibold text-xs mb-3 uppercase tracking-widest"
                  style={{ color: 'var(--text-muted)', letterSpacing: '0.12em' }}>
                  Sobre
                </h2>
                <p className="text-sm leading-relaxed whitespace-pre-line"
                  style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                  {coach.bio}
                </p>
              </section>
            )}

            {/* Certificações */}
            {coach.certifications.length > 0 && (
              <section>
                <h2 className="font-display font-bold mb-3 uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)', fontSize: '11px', letterSpacing: '0.1em' }}>
                  Certificações
                </h2>
                <ul className="flex flex-col gap-2">
                  {coach.certifications.map(cert => (
                    <li key={cert} className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                        style={{ color: 'var(--neon)', flexShrink: 0 }}>
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      </svg>
                      {cert}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Planos */}
            {plans.length > 0 ? (
              <section id="planos">
                <h2 className="font-display font-bold mb-4 uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)', fontSize: '11px', letterSpacing: '0.1em' }}>
                  Pacotes disponíveis
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {plans.map((plan, i) => (
                    <div key={plan.id}
                      className="rounded-2xl overflow-hidden flex flex-col"
                      style={{
                        background: i === 0 ? 'rgba(57,255,122,0.03)' : 'var(--surface)',
                        border: i === 0 ? '1px solid rgba(57,255,122,0.3)' : '1px solid var(--border)',
                        boxShadow: i === 0 ? '0 0 0 1px rgba(57,255,122,0.06)' : 'none',
                      }}
                    >
                      <div className="h-px" style={{
                        background: i === 0
                          ? 'linear-gradient(90deg, transparent, rgba(57,255,122,0.8), transparent)'
                          : 'transparent',
                      }} />
                      <div className="p-5 flex flex-col flex-1">
                        {i === 0 && (
                          <span className="text-xs font-medium mb-3 self-start px-2 py-0.5 rounded" style={{ background: "var(--surface-3)", color: "var(--text-muted)", fontFamily: "var(--font-display)", letterSpacing: "0.04em", textTransform: "uppercase" }}>Popular</span>
                        )}
                        <h3 className="font-display font-bold text-base mb-1" style={{ color: 'var(--text-primary)' }}>
                          {plan.name}
                        </h3>
                        {plan.description && (
                          <p className="text-xs mb-3 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                            {plan.description}
                          </p>
                        )}
                        <div className="flex items-baseline gap-1 mb-4">
                          <span className="font-display font-black text-2xl"
                            style={{ color: i === 0 ? 'var(--neon)' : 'var(--text-primary)' }}>
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(plan.price_brl / 100)}
                          </span>
                          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>/mês</span>
                        </div>

                        {plan.features.length > 0 && (
                          <ul className="flex flex-col gap-2 mb-4 flex-1">
                            {plan.features.map((f: string) => (
                              <li key={f} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                  strokeWidth="2.5" className="mt-0.5 flex-shrink-0" style={{ color: 'var(--neon)' }}>
                                  <path d="M20 6L9 17l-5-5"/>
                                </svg>
                                {f}
                              </li>
                            ))}
                          </ul>
                        )}

                        {/* Meta */}
                        <div className="flex flex-wrap gap-2 mb-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                          {plan.duration_days && (
                            <span className="px-2 py-1 rounded-md" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                              {plan.duration_days} dias
                            </span>
                          )}
                          {plan.update_freq && (
                            <span className="px-2 py-1 rounded-md" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                              {plan.update_freq}
                            </span>
                          )}
                          <span className="px-2 py-1 rounded-md" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                            Máx. {plan.max_students} alunos
                          </span>
                        </div>

                        <InterestButton
                          coachProfileId={coach.id}
                          coachName={coach.users.full_name}
                          planId={plan.id}
                          planName={plan.name}
                          planPriceCents={plan.price_brl}
                          fullWidth
                          isLoggedIn={isLoggedIn}
                          variant={i === 0 ? 'primary' : 'secondary'}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : (
              <section>
                <div className="rounded-2xl overflow-hidden"
                  style={{ background: 'rgba(57,255,122,0.04)', border: '1px solid rgba(57,255,122,0.2)' }}>
                  <div className="h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(57,255,122,0.6),transparent)' }} />
                  <div className="p-8 text-center">
                    <p className="font-display font-extrabold text-xl mb-2" style={{ color: 'var(--text-primary)' }}>
                      Quer trabalhar com {firstName}?
                    </p>
                    <p className="text-sm mb-6 max-w-xs mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      Envie seu nome, contato e objetivo. {firstName} responde direto pelo WhatsApp ou Instagram.
                    </p>
                    <InterestButton
                      coachProfileId={coach.id}
                      coachName={coach.users.full_name}
                      label={`Falar com ${firstName}`}
                      isLoggedIn={isLoggedIn}
                    />
                    <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
                      Sem criar conta · Resposta em até 24h
                    </p>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* ── Sidebar */}
          <aside className="flex flex-col gap-4">

            {/* CTA sticky mobile */}
            <div className="sm:hidden sticky bottom-4 z-20">
              <div className="rounded-2xl px-4 pt-3 pb-3"
                style={{ background: 'rgba(8,8,8,0.95)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(57,255,122,0.25)', boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
                <InterestButton
                  coachProfileId={coach.id}
                  coachName={coach.users.full_name}
                  fullWidth
                  label={`Falar com ${firstName}`}
                  isLoggedIn={isLoggedIn}
                />
                <p className="text-xs mt-2 text-center" style={{ color: 'var(--text-muted)' }}>
                  Resposta direta pelo WhatsApp ou Instagram
                </p>
              </div>
            </div>

            {/* CTA desktop */}
            <div className="hidden sm:block rounded-2xl overflow-hidden"
              style={{ background: 'rgba(57,255,122,0.04)', border: '1px solid rgba(57,255,122,0.22)' }}>
              <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(57,255,122,0.7), transparent)' }} />
              <div className="p-5">
                <p className="font-display font-extrabold text-lg mb-1 leading-tight" style={{ color: 'var(--text-primary)' }}>
                  Encontrou o coach certo?
                </p>
                <p className="text-xs mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {plans.length > 0
                    ? `${plans.length} pacote${plans.length !== 1 ? 's' : ''} disponível${plans.length !== 1 ? 'is' : ''}. Envie interesse e ${firstName} entra em contato direto.`
                    : `Envie seu contato e objetivo. ${firstName} responde pelo WhatsApp ou Instagram.`}
                </p>
                <InterestButton
                  coachProfileId={coach.id}
                  coachName={coach.users.full_name}
                  fullWidth
                  isLoggedIn={isLoggedIn}
                  label={plans.length > 0 ? 'Ver pacotes ↓' : `Falar com ${firstName}`}
                />
                <p className="text-xs mt-3 text-center" style={{ color: 'var(--text-muted)' }}>
                  Seus dados são enviados diretamente para {firstName}
                </p>
              </div>
            </div>

            {/* Stats */}
            {hasStats && (
              <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <p className="text-xs font-bold mb-4 uppercase tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
                  Números
                </p>
                <div className="flex flex-col gap-3">
                  {coach.rating_count > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Avaliação</span>
                      <div className="flex items-center gap-1.5">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="#FBBF24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                          {Number(coach.rating_avg).toFixed(1)}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>({coach.rating_count})</span>
                      </div>
                    </div>
                  )}
                  {coach.students_count > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Alunos</span>
                      <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{coach.students_count}</span>
                    </div>
                  )}
                  {coach.years_experience > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Experiência</span>
                      <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                        {coach.years_experience} {coach.years_experience === 1 ? 'ano' : 'anos'}
                      </span>
                    </div>
                  )}
                  {coach.location && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Local</span>
                      <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{coach.location}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Redes sociais */}
            {hasSocial && (
              <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <p className="text-xs font-bold mb-4 uppercase tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
                  Redes sociais
                </p>
                <div className="flex flex-col gap-2.5">
                  {coach.instagram_handle && (
                    <a href={`https://instagram.com/${coach.instagram_handle}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm group transition-colors duration-150"
                      style={{ color: 'var(--text-secondary)' }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-150"
                        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                        </svg>
                      </div>
                      <span>@{coach.instagram_handle}</span>
                    </a>
                  )}
                  {coach.youtube_handle && (
                    <a href={`https://youtube.com/@${coach.youtube_handle}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm group transition-colors duration-150"
                      style={{ color: 'var(--text-secondary)' }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
                          <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
                        </svg>
                      </div>
                      <span>{coach.youtube_handle}</span>
                    </a>
                  )}
                  {coach.linkedin_url && (
                    <a href={coach.linkedin_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm transition-colors duration-150"
                      style={{ color: 'var(--text-secondary)' }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                          <rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
                        </svg>
                      </div>
                      <span>LinkedIn</span>
                    </a>
                  )}
                </div>
              </div>
            )}

          </aside>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// Componente: perfil mock (fallback)
// ══════════════════════════════════════════════════════════════════════════
function MockCoachProfile({ coach }: { coach: NonNullable<ReturnType<typeof getCoachBySlug>> }) {
  return (
    <div className="min-h-screen pt-16 pb-20">
      <div className="relative h-52 sm:h-64 overflow-hidden" style={{ background: 'var(--surface-2)' }}>
        {coach.coverImage && (
          <Image src={coach.coverImage} alt="" fill className="object-cover opacity-40" priority sizes="100vw" />
        )}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, transparent 20%, var(--bg-dark) 100%)' }} />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-16 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-8">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden flex-shrink-0"
            style={{ border: '3px solid var(--bg-dark)', background: 'var(--surface-3)' }}>
            <Image src={coach.avatar} alt={coach.name} width={112} height={112} className="object-cover w-full h-full" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl" style={{ color: 'var(--text-primary)' }}>
                {coach.name}
              </h1>
              <StatusBadge status={coach.status} size="sm" />
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{coach.shortBio}</p>
          </div>
          <div className="flex-shrink-0">
            <Link href={`/cadastro`} className="btn-primary">Entrar em contato</Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-8">
            <section>
              <h2 className="font-display font-bold text-lg mb-3" style={{ color: 'var(--text-primary)' }}>Sobre</h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{coach.bio}</p>
            </section>
            <section>
              <h2 className="font-display font-bold text-lg mb-3" style={{ color: 'var(--text-primary)' }}>Especialidades</h2>
              <div className="flex flex-wrap gap-2">
                {coach.specialties.map((spec) => (
                  <span key={spec} className="px-3 py-1.5 rounded-full text-sm"
                    style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                    {spec}
                  </span>
                ))}
              </div>
            </section>
            {coach.certifications.length > 0 && (
              <section>
                <h2 className="font-display font-bold text-lg mb-3" style={{ color: 'var(--text-primary)' }}>Certificações</h2>
                <ul className="flex flex-col gap-2">
                  {coach.certifications.map((cert) => (
                    <li key={cert} className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                        style={{ color: 'var(--neon)', flexShrink: 0 }}>
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      </svg>
                      {cert}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {coach.plans.length > 0 && (
              <section>
                <h2 className="font-display font-bold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>Pacotes disponíveis</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {coach.plans.map((plan, i) => (
                    <div key={plan.name} className="rounded-xl p-5"
                      style={{ background: 'var(--surface)', border: i === 1 ? '1px solid rgba(57,255,122,0.25)' : '1px solid var(--border)' }}>
                      {i === 1 && <span className="section-tag text-xs mb-3 inline-flex">Recomendado</span>}
                      <h3 className="font-display font-bold text-base mb-1" style={{ color: 'var(--text-primary)' }}>{plan.name}</h3>
                      <p className="font-display font-bold text-2xl mb-3"
                        style={{ color: i === 1 ? 'var(--neon)' : 'var(--text-primary)' }}>
                        {formatCurrency(plan.price)}
                        <span className="text-sm font-normal" style={{ color: 'var(--text-muted)' }}>/mês</span>
                      </p>
                      <ul className="flex flex-col gap-2 mb-4">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                              className="mt-0.5 flex-shrink-0" style={{ color: 'var(--neon)' }}>
                              <path d="M20 6L9 17l-5-5"/>
                            </svg>
                            {f}
                          </li>
                        ))}
                      </ul>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {plan.maxStudents} pessoa{plan.maxStudents !== 1 ? 's' : ''}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="flex flex-col gap-4">
            <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <h3 className="font-display font-bold text-sm mb-4 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                Números
              </h3>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Avaliação</span>
                  <div className="flex items-center gap-1">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="#FFB800">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{formatRating(coach.rating)}</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>({coach.reviewsCount})</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Alunos ativos</span>
                  <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{coach.studentsCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Experiência</span>
                  <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{coach.yearsExperience} anos</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Localização</span>
                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{coach.location}</span>
                </div>
              </div>
            </div>
            {Object.keys(coach.socialLinks).length > 0 && (
              <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <h3 className="font-display font-bold text-sm mb-4 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                  Redes sociais
                </h3>
                <div className="flex flex-col gap-2">
                  {coach.socialLinks.instagram && (
                    <a href={`https://instagram.com/${coach.socialLinks.instagram}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2.5 text-sm transition-colors hover:text-neon"
                      style={{ color: 'var(--text-secondary)' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                      </svg>
                      @{coach.socialLinks.instagram}
                    </a>
                  )}
                </div>
              </div>
            )}
            <div className="rounded-2xl p-5"
              style={{ background: 'rgba(57,255,122,0.06)', border: '1px solid rgba(57,255,122,0.2)' }}>
              <p className="font-display font-bold text-base mb-1" style={{ color: 'var(--text-primary)' }}>
                Encontrou o coach certo?
              </p>
              <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
                Envie seu contato e objetivo. {coach.name.split(' ')[0]} responde pelo WhatsApp ou Instagram.
              </p>
              <Link href={`/cadastro`} className="btn-primary w-full text-sm text-center">
                Entrar em contato
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
