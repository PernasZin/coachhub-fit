// app/coach/billing/page.tsx
// Planos de visibilidade — modo manual via WhatsApp.
// Sem checkout, sem dados bancários.

import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Plano de visibilidade — CoachHub Fit',
}

// Configure em .env.local: NEXT_PUBLIC_ADMIN_WHATSAPP=5516997514583
const ADMIN_WHATSAPP = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP ?? ''

type Tier = 'free' | 'featured' | 'premium'

const PLANS: {
  tier: Tier
  name: string
  tagline: string
  price: string
  period: string | null
  description: string
  benefits: string[]
  color: string
  bg: string
  border: string
  glow: string
  whatsappMsg: string | null
}[] = [
  {
    tier: 'free',
    name: 'Gratuito',
    tagline: 'Para começar',
    price: 'R$0',
    period: null,
    description: 'Ideal para criar seu perfil e testar a plataforma sem compromisso.',
    benefits: [
      'Perfil público com foto, capa e bio',
      'Aparece na listagem de coaches',
      'Recebe leads de alunos interessados',
      'Cadastro de pacotes de atendimento',
    ],
    color: 'var(--text-muted)',
    bg: 'var(--surface)',
    border: 'var(--border)',
    glow: 'transparent',
    whatsappMsg: null,
  },
  {
    tier: 'featured',
    name: 'Destaque',
    tagline: 'Mais visibilidade',
    price: 'R$14,90',
    period: '/mês',
    description: 'Apareça antes dos coaches gratuitos e aumente suas chances de ser encontrado.',
    benefits: [
      'Tudo do plano Gratuito',
      'Posicionamento acima dos coaches free',
      'Badge "Destaque" no perfil e nos cards',
      'Prioridade na busca por especialidade',
    ],
    color: '#39FF7A',
    bg: 'rgba(57,255,122,0.04)',
    border: 'rgba(57,255,122,0.3)',
    glow: 'rgba(57,255,122,0.08)',
    whatsappMsg: encodeURIComponent(
      'Olá! Quero ativar o plano Destaque do CoachHub Fit por R$14,90/mês no meu perfil.'
    ),
  },
  {
    tier: 'premium',
    name: 'Premium',
    tagline: 'Mais alcance',
    price: 'R$29,90',
    period: '/mês',
    description: 'Apareça na página inicial e nos primeiros resultados de busca da vitrine.',
    benefits: [
      'Tudo do plano Destaque',
      'Aparece em destaque na página inicial',
      'Selo Premium no perfil e nos cards',
      'Primeiros resultados em todas as buscas',
    ],
    color: '#FBBF24',
    bg: 'rgba(251,191,36,0.04)',
    border: 'rgba(251,191,36,0.35)',
    glow: 'rgba(251,191,36,0.08)',
    whatsappMsg: encodeURIComponent(
      'Olá! Quero ativar o plano Premium do CoachHub Fit por R$29,90/mês no meu perfil.'
    ),
  },
]

const TIER_ORDER: Record<Tier, number> = { free: 0, featured: 1, premium: 2 }

const WA_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.555 4.122 1.524 5.857L.057 23.882l6.182-1.622A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.846 0-3.574-.5-5.065-1.371l-.364-.215-3.77.989 1.007-3.672-.236-.378A9.943 9.943 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
  </svg>
)

export default async function CoachBillingPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userRow } = await supabase
    .from('users').select('role').eq('id', user.id).single()

  if (userRow?.role === 'student') redirect('/student/dashboard')
  if (userRow?.role === 'admin') {
    const { data: adminCp } = await supabase
      .from('coach_profiles').select('id').eq('user_id', user.id).single()
    if (!adminCp) redirect('/admin/dashboard')
  }

  const { data: cp } = await supabase
    .from('coach_profiles')
    .select('id, visibility_tier')
    .eq('user_id', user.id)
    .single()

  if (!cp) redirect('/coach/dashboard')

  const currentTier = (cp.visibility_tier ?? 'free') as Tier
  const currentPlan = PLANS.find(p => p.tier === currentTier) ?? PLANS[0]

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6" style={{ background: 'var(--bg-dark)' }}>
      <div className="max-w-2xl mx-auto">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs mb-8" style={{ color: 'var(--text-muted)' }}>
          <Link href="/coach/dashboard" className="hover:text-neon transition-colors">Dashboard</Link>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
          <span style={{ color: 'var(--text-secondary)' }}>Plano de visibilidade</span>
        </nav>

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-widest mb-1"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
            Visibilidade na vitrine
          </p>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl mb-2"
            style={{ color: 'var(--text-primary)' }}>
            Plano de visibilidade
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Controla onde você aparece na vitrine do CoachHub Fit —
            diferente dos pacotes/serviços que você oferece aos alunos.
          </p>
        </div>

        {/* Plano atual — destaque */}
        <div className="relative rounded-2xl overflow-hidden mb-8"
          style={{
            background: currentTier === 'premium'
              ? 'linear-gradient(135deg, rgba(251,191,36,0.08), rgba(251,191,36,0.03))'
              : currentTier === 'featured'
              ? 'linear-gradient(135deg, rgba(57,255,122,0.07), rgba(57,255,122,0.02))'
              : 'var(--surface)',
            border: `1px solid ${currentPlan.border}`,
          }}>
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${currentPlan.color}50, transparent)` }} />
          <div className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: currentPlan.bg, border: `1px solid ${currentPlan.border}` }}>
              {currentTier === 'premium' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth="1.8">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              ) : currentTier === 'featured' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--neon)" strokeWidth="1.8">
                  <path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.8">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Plano atual</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: currentPlan.bg, color: currentPlan.color, border: `1px solid ${currentPlan.border}` }}>
                  {currentPlan.tagline}
                </span>
              </div>
              <p className="font-display font-extrabold text-xl leading-tight"
                style={{ color: currentPlan.color }}>
                {currentPlan.name}
              </p>
            </div>
            {currentTier !== 'free' && (
              <div className="text-right flex-shrink-0">
                <p className="font-display font-black text-2xl leading-none"
                  style={{ color: currentPlan.color }}>
                  {currentPlan.price}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>por mês</p>
              </div>
            )}
          </div>
        </div>

        {/* Cards dos planos */}
        <div className="flex flex-col gap-4 mb-8">
          {PLANS.map(plan => {
            const isCurrentPlan = plan.tier === currentTier
            const isUpgrade     = TIER_ORDER[plan.tier] > TIER_ORDER[currentTier]
            const isDowngrade   = TIER_ORDER[plan.tier] < TIER_ORDER[currentTier]
            const isPremium     = plan.tier === 'premium'

            return (
              <div key={plan.tier}
                className="rounded-2xl overflow-hidden transition-all duration-200"
                style={{
                  background: isCurrentPlan
                    ? (isPremium
                      ? 'linear-gradient(135deg, rgba(251,191,36,0.06), rgba(251,191,36,0.02))'
                      : plan.tier === 'featured'
                      ? 'linear-gradient(135deg, rgba(57,255,122,0.05), rgba(57,255,122,0.01))'
                      : 'var(--surface)')
                    : 'var(--surface)',
                  border: `1px solid ${isCurrentPlan ? plan.border : isDowngrade ? 'rgba(255,255,255,0.04)' : 'var(--border)'}`,
                  opacity: isDowngrade ? 0.5 : 1,
                  boxShadow: isCurrentPlan && !isDowngrade
                    ? `0 0 0 1px ${plan.glow}`
                    : 'none',
                }}>

                {/* Accent top line */}
                <div className="h-px"
                  style={{
                    background: isCurrentPlan || isUpgrade
                      ? `linear-gradient(90deg, transparent, ${plan.color}${isCurrentPlan ? '70' : '30'}, transparent)`
                      : 'transparent',
                  }} />

                <div className="p-5 sm:p-6">
                  {/* Header: nome + tagline + preço */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h2 className="font-display font-extrabold text-lg leading-none"
                          style={{ color: isCurrentPlan ? plan.color : isDowngrade ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                          {plan.name}
                        </h2>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{
                            background: isCurrentPlan ? plan.bg : 'var(--surface-2)',
                            color: isCurrentPlan ? plan.color : 'var(--text-muted)',
                            border: `1px solid ${isCurrentPlan ? plan.border : 'var(--border)'}`,
                          }}>
                          {isCurrentPlan ? '✓ Ativo' : plan.tagline}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed max-w-xs"
                        style={{ color: isDowngrade ? 'var(--text-muted)' : 'var(--text-secondary)' }}>
                        {plan.description}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="font-display font-black text-2xl leading-none"
                        style={{ color: isCurrentPlan ? plan.color : isDowngrade ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                        {plan.price}
                      </span>
                      {plan.period && (
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>por mês</p>
                      )}
                    </div>
                  </div>

                  {/* Benefícios */}
                  <ul className="grid grid-cols-1 gap-1.5 mb-5">
                    {plan.benefits.map(b => (
                      <li key={b} className="flex items-center gap-2 text-xs"
                        style={{ color: isDowngrade ? 'var(--text-muted)' : 'var(--text-secondary)' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                          strokeWidth="2.5" className="flex-shrink-0"
                          style={{ color: isDowngrade ? 'var(--text-muted)' : plan.color }}>
                          <path d="M20 6L9 17l-5-5"/>
                        </svg>
                        {b}
                      </li>
                    ))}
                  </ul>

                  {/* Ação */}
                  {isCurrentPlan ? (
                    <div className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-medium"
                      style={{ background: plan.bg, color: plan.color, border: `1px solid ${plan.border}` }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                      Plano ativo agora
                    </div>
                  ) : isUpgrade && plan.whatsappMsg ? (
                    <div>
                      {ADMIN_WHATSAPP ? (
                        <a href={`https://wa.me/${ADMIN_WHATSAPP}?text=${plan.whatsappMsg}`}
                          target="_blank" rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold transition-all duration-200"
                          style={{
                            background: isPremium ? '#FBBF24' : 'var(--neon)',
                            color: '#080808',
                            fontFamily: 'var(--font-display)',
                            letterSpacing: '0.01em',
                          }}>
                          {WA_ICON}
                          Solicitar {plan.name} via WhatsApp
                        </a>
                      ) : (
                        <div className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs"
                          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                          </svg>
                          Contato de upgrade não configurado
                        </div>
                      )}
                      <p className="text-xs text-center mt-2" style={{ color: 'var(--text-muted)' }}>
                        Ativação em até 24h após confirmação
                      </p>
                    </div>
                  ) : isDowngrade ? (
                    <div className="text-xs px-3 py-2 rounded-xl text-center"
                      style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
                      Plano inferior ao atual
                    </div>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>

        {/* Como funciona o upgrade */}
        <div className="rounded-2xl overflow-hidden mb-6"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <p className="text-xs font-bold uppercase tracking-widest"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
              Como funciona o upgrade
            </p>
          </div>
          <div className="p-5 flex flex-col gap-4">
            {[
              {
                n: '1',
                text: 'Clique em "Solicitar via WhatsApp" no plano desejado.',
                color: 'var(--neon)',
              },
              {
                n: '2',
                text: 'Uma mensagem pronta já vai preenchida para o WhatsApp da equipe.',
                color: '#60A5FA',
              },
              {
                n: '3',
                text: 'A equipe confirma e ativa seu plano em até 24h.',
                color: '#C084FC',
              },
            ].map(step => (
              <div key={step.n} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center font-display font-black text-xs flex-shrink-0 mt-0.5"
                  style={{ background: step.n === '1' ? 'rgba(57,255,122,0.12)' : step.n === '2' ? 'rgba(96,165,250,0.12)' : 'rgba(192,132,252,0.12)', color: step.color }}>
                  {step.n}
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Perguntas rápidas */}
        <div className="rounded-2xl overflow-hidden mb-6"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <p className="text-xs font-bold uppercase tracking-widest"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
              Dúvidas rápidas
            </p>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {[
              {
                q: 'O plano garante que vou receber leads?',
                a: 'Não. O plano aumenta sua visibilidade na vitrine — você aparece antes e com mais destaque. Os leads dependem do seu perfil, especialidade e da demanda da região.',
              },
              {
                q: 'Posso cancelar quando quiser?',
                a: 'Sim. Basta entrar em contato pelo WhatsApp e o plano é ajustado no próximo ciclo.',
              },
              {
                q: 'O plano é diferente dos pacotes que ofereço aos alunos?',
                a: 'Sim. O plano de visibilidade é o que você paga à plataforma para aparecer mais. Os pacotes são o que você oferece aos seus alunos.',
              },
            ].map(faq => (
              <div key={faq.q} className="px-5 py-4">
                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                  {faq.q}
                </p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Rodapé */}
        <p className="text-xs text-center leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          Em breve o pagamento será automático pela plataforma.{' '}
          <Link href="/coach/dashboard" className="hover:text-neon transition-colors" style={{ color: 'var(--text-muted)' }}>
            Voltar ao dashboard →
          </Link>
        </p>

      </div>
    </div>
  )
}
