// app/page.tsx — Home page (vitrine/marketplace)

import Link from 'next/link'
import { HeroSection } from '@/components/shared/HeroSection'
import { CTASection } from '@/components/shared/CTASection'
import { PricingCards } from '@/components/shared/PricingCards'
import { createClient } from '@/lib/supabase/server'
import { dbCoachToCoach } from '@/lib/adapters'
import { CoachGrid } from '@/components/coaches/CoachGrid'
import type { DbCoachWithUser } from '@/lib/adapters'
import type { DbCoachPlan } from '@/types/database'

// ── Como funciona — dois fluxos em uma seção ──────────
const HOW_IT_WORKS_STUDENTS = [
  {
    step: '01',
    title: 'Explore a vitrine',
    description: 'Busque coaches por especialidade, localização ou objetivo. Veja avaliações e perfis completos.',
  },
  {
    step: '02',
    title: 'Compare perfis e pacotes',
    description: 'Cada coach apresenta seus pacotes com o que está incluso, preço e formato de atendimento.',
  },
  {
    step: '03',
    title: 'Entre em contato direto',
    description: 'Envie interesse em segundos. O coach recebe seus dados e responde pelo WhatsApp ou Instagram.',
  },
]

const HOW_IT_WORKS_COACHES = [
  {
    step: '01',
    title: 'Crie seu perfil',
    description: 'Monte um perfil completo com especialidades, certificações, foto e pacotes de atendimento.',
  },
  {
    step: '02',
    title: 'Apareça na vitrine',
    description: 'Seu perfil fica visível para alunos buscando um coach. Coaches em destaque aparecem primeiro.',
  },
  {
    step: '03',
    title: 'Receba leads qualificados',
    description: 'Alunos enviam nome, contato e objetivo. Você responde via WhatsApp ou Instagram — sem intermediários.',
  },
]

export default async function HomePage() {
  const supabase = createClient()

  // Busca coaches aprovados — featured primeiro, depois por avaliação
  const { data: rows } = await supabase
    .from('coach_profiles')
    .select('*, users ( full_name, avatar_url )')
    .eq('approved', true)
    .order('visibility_tier', { ascending: false })
    .order('rating_avg', { ascending: false })
    .limit(6)

  const dbCoaches = (rows ?? []) as unknown as DbCoachWithUser[]

  // Menor preço de cada coach
  let plansByCoach: Record<string, DbCoachPlan[]> = {}
  if (dbCoaches.length > 0) {
    const ids = dbCoaches.map(c => c.id)
    const { data: plans } = await supabase
      .from('coach_plans')
      .select('*')
      .in('coach_profile_id', ids)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
    for (const plan of plans ?? []) {
      if (!plansByCoach[plan.coach_profile_id]) plansByCoach[plan.coach_profile_id] = []
      plansByCoach[plan.coach_profile_id].push(plan)
    }
  }

  const coaches = dbCoaches.map(row => dbCoachToCoach(row, plansByCoach[row.id] ?? []))
  const hasRealCoaches = coaches.length > 0
  // Título da seção adapta conforme o tier mais alto presente
  const hasPremium  = coaches.some(c => c.visibilityTier === 'premium')
  const hasFeatured = coaches.some(c => c.visibilityTier === 'featured' || c.visibilityTier === 'premium')

  return (
    <>
      <HeroSection />

      {/* ── Como funciona ─────────────────────────────── */}
      <section id="como-funciona" className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="section-tag mb-4 inline-flex">Como funciona</span>
            <h2
              className="font-display font-extrabold text-3xl sm:text-4xl"
              style={{ color: 'var(--text-primary)' }}
            >
              Simples para os dois lados
            </h2>
          </div>

          {/* Dois grupos lado a lado */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Para alunos */}
            <div>
              <div className="flex items-center gap-2 mb-5">
                <span
                  className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                  style={{ background: 'rgba(57,255,122,0.1)', border: '1px solid rgba(57,255,122,0.2)', color: 'var(--neon)', fontFamily: 'var(--font-display)' }}
                >
                  Para alunos
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {HOW_IT_WORKS_STUDENTS.map(item => (
                  <div
                    key={item.step}
                    className="flex gap-4 p-5 rounded-2xl"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                  >
                    <p
                      className="font-display font-black text-2xl leading-none select-none flex-shrink-0 w-8"
                      style={{ color: 'rgba(57,255,122,0.18)' }}
                    >
                      {item.step}
                    </p>
                    <div>
                      <h3 className="font-display font-bold text-base mb-1" style={{ color: 'var(--text-primary)' }}>
                        {item.title}
                      </h3>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="pt-1">
                  <Link href="/coaches" className="btn-primary text-sm inline-flex">
                    Explorar coaches agora →
                  </Link>
                </div>
              </div>
            </div>

            {/* Para coaches */}
            <div>
              <div className="flex items-center gap-2 mb-5">
                <span
                  className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}
                >
                  Para coaches
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {HOW_IT_WORKS_COACHES.map(item => (
                  <div
                    key={item.step}
                    className="flex gap-4 p-5 rounded-2xl"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                  >
                    <p
                      className="font-display font-black text-2xl leading-none select-none flex-shrink-0 w-8"
                      style={{ color: 'rgba(255,255,255,0.06)' }}
                    >
                      {item.step}
                    </p>
                    <div>
                      <h3 className="font-display font-bold text-base mb-1" style={{ color: 'var(--text-primary)' }}>
                        {item.title}
                      </h3>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="pt-1">
                  <Link href="/cadastro?role=coach" className="btn-secondary text-sm inline-flex">
                    Criar perfil grátis →
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Coaches ───────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="section-tag mb-3 inline-flex">Coaches</span>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl" style={{ color: 'var(--text-primary)' }}>
                {hasRealCoaches
                  ? hasPremium ? 'Coaches premium' : hasFeatured ? 'Em destaque' : 'Coaches disponíveis'
                  : 'Plataforma em crescimento'}
              </h2>
              {!hasRealCoaches && (
                <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                  Os primeiros coaches já estão se cadastrando.
                </p>
              )}
            </div>
            {hasRealCoaches && (
              <Link href="/coaches" className="btn-secondary text-sm self-start sm:self-auto">
                Ver todos →
              </Link>
            )}
          </div>

          {hasRealCoaches ? (
            <CoachGrid coaches={coaches} />
          ) : (
            <div
              className="rounded-2xl p-12 text-center"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'var(--surface-2)' }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="1.5" style={{ color: 'var(--text-muted)' }}>
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <p className="font-display font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>
                Seja um dos primeiros coaches
              </p>
              <p className="text-sm mb-6 max-w-xs mx-auto" style={{ color: 'var(--text-secondary)' }}>
                A plataforma está crescendo. Crie seu perfil agora e apareça para os primeiros alunos.
              </p>
              <Link href="/cadastro?role=coach" className="btn-primary text-sm">
                Criar perfil de coach
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── Por que usar o CoachHub Fit — seção para aluno ── */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

            <div>
              <span className="section-tag mb-4 inline-flex">Para quem busca um coach</span>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl mb-4" style={{ color: 'var(--text-primary)' }}>
                Encontre o especialista{' '}
                <span style={{ color: 'var(--neon)' }}>certo para você</span>
              </h2>
              <p className="text-base mb-6 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Todos os coaches passam por aprovação da nossa equipe antes de aparecer na vitrine.
                Você vê o perfil completo, os pacotes e entra em contato direto — sem burocracia.
              </p>
              <Link href="/coaches" className="btn-primary text-sm inline-flex">
                Explorar coaches agora
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {[
                {
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                  ),
                  color: '#39FF7A',
                  bg: 'rgba(57,255,122,0.08)',
                  border: 'rgba(57,255,122,0.2)',
                  title: 'Coaches verificados',
                  desc: 'Cada coach é aprovado manualmente antes de aparecer. Você vê quem realmente é profissional.',
                },
                {
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="3" y="4" width="18" height="18" rx="2"/>
                      <line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  ),
                  color: '#60A5FA',
                  bg: 'rgba(96,165,250,0.08)',
                  border: 'rgba(96,165,250,0.2)',
                  title: 'Compare perfis e pacotes',
                  desc: 'Veja especialidades, certificações, fotos e os pacotes que cada coach oferece antes de entrar em contato.',
                },
                {
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.28h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l1.27-.88a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.03z"/>
                    </svg>
                  ),
                  color: '#C084FC',
                  bg: 'rgba(192,132,252,0.08)',
                  border: 'rgba(192,132,252,0.2)',
                  title: 'Contato direto',
                  desc: 'Sem plataformas no meio. Você e o coach se falam diretamente pelo WhatsApp ou Instagram.',
                },
              ].map(item => (
                <div
                  key={item.title}
                  className="flex items-start gap-4 p-4 rounded-2xl"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: item.bg, color: item.color, border: `1px solid ${item.border}` }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-display font-semibold text-sm mb-0.5" style={{ color: 'var(--text-primary)' }}>
                      {item.title}
                    </p>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Testemunho ────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div
            className="rounded-2xl p-8 sm:p-12 text-center"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <p
              className="font-display text-xl sm:text-2xl font-bold mb-6 max-w-2xl mx-auto leading-snug"
              style={{ color: 'var(--text-primary)' }}
            >
              "Ter um perfil profissional na plataforma tornou mais fácil para alunos me encontrarem e entrarem em contato."
            </p>
            <div className="flex items-center justify-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-black text-sm"
                style={{ background: 'rgba(57,255,122,0.12)', color: 'var(--neon)', border: '1px solid rgba(57,255,122,0.2)' }}
              >
                RM
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Rafael Mendes</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Coach de musculação · São Paulo</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PricingCards />
      <CTASection />
    </>
  )
}
