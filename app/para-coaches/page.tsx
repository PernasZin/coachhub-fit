// app/para-coaches/page.tsx

import type { Metadata } from 'next'
import Link from 'next/link'
import { PricingCards } from '@/components/shared/PricingCards'

export const metadata: Metadata = {
  title: 'Para coaches — CoachHub Fit',
  description:
    'Crie um perfil profissional, apareça para alunos que já estão buscando um coach e receba leads direto no WhatsApp ou Instagram. Grátis para começar.',
}

const BENEFITS = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
      </svg>
    ),
    color: '#39FF7A', bg: 'rgba(57,255,122,0.08)', border: 'rgba(57,255,122,0.2)',
    title: 'Alunos chegam até você',
    desc: 'A vitrine atrai quem já quer contratar um coach. Você não precisa fazer anúncio pago nem correr atrás de lead frio.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="2.5"/><path d="M21 15l-5-5L5 21"/>
      </svg>
    ),
    color: '#60A5FA', bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.2)',
    title: 'Perfil profissional sem site próprio',
    desc: 'Foto, capa, bio, especialidades, certificações e pacotes de atendimento — tudo num link só para compartilhar nas redes.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.28h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l1.27-.88a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.03z"/>
      </svg>
    ),
    color: '#FBBF24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.2)',
    title: 'Lead com tudo que você precisa',
    desc: 'Nome, contato e objetivo já chegam no painel. Um clique abre o WhatsApp ou Instagram direto para a conversa.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    color: '#C084FC', bg: 'rgba(192,132,252,0.08)', border: 'rgba(192,132,252,0.2)',
    title: 'Qualidade verificada pela equipe',
    desc: 'Cada coach passa por aprovação manual antes de aparecer na vitrine. Seu perfil fica ao lado de profissionais sérios.',
  },
]

const STEPS = [
  {
    n: '1',
    title: 'Crie seu perfil em 10 minutos',
    desc: 'Preencha bio, especialidades, certificações e adicione seus pacotes de atendimento com preço e o que está incluso.',
    detail: 'Gratuito · Sem cartão de crédito',
    color: 'var(--neon)',
    bg: 'rgba(57,255,122,0.1)',
    border: 'rgba(57,255,122,0.2)',
  },
  {
    n: '2',
    title: 'Aprovação em até 48h',
    desc: 'Nossa equipe revisa o perfil para manter a qualidade da vitrine. Você recebe um e-mail quando for aprovado.',
    detail: 'Você avisa quando quiser editar',
    color: '#60A5FA',
    bg: 'rgba(96,165,250,0.1)',
    border: 'rgba(96,165,250,0.2)',
  },
  {
    n: '3',
    title: 'Apareça para quem já busca',
    desc: 'Seu perfil entra na vitrine ordenado por especialidade, localização e avaliação. Coaches em destaque aparecem primeiro.',
    detail: 'Coaches premium aparecem na home',
    color: '#C084FC',
    bg: 'rgba(192,132,252,0.1)',
    border: 'rgba(192,132,252,0.2)',
  },
  {
    n: '4',
    title: 'Responda pelo WhatsApp ou Instagram',
    desc: 'Leads chegam com nome, contato e objetivo. Um clique no painel abre a conversa direto — sem intermediário.',
    detail: 'Email de notificação imediato',
    color: '#FBBF24',
    bg: 'rgba(251,191,36,0.1)',
    border: 'rgba(251,191,36,0.2)',
  },
]

export default function ParaCoachesPage() {
  return (
    <div className="min-h-screen pt-16" style={{ background: 'var(--bg-dark)' }}>

      {/* ── Hero ──────────────────────────────────────── */}
      <section className="relative overflow-hidden py-16 sm:py-24 px-4 sm:px-6">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] rounded-full"
            style={{ background: 'radial-gradient(ellipse, rgba(57,255,122,0.05) 0%, transparent 65%)' }} />
          <div className="absolute inset-0"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
              backgroundSize: '64px 64px',
            }} />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <span className="section-tag mb-6 inline-flex">Para coaches e treinadores</span>

          <h1 className="font-display font-extrabold leading-none mb-6"
            style={{ color: 'var(--text-primary)', fontSize: 'clamp(2rem, 5vw, 3.25rem)' }}>
            Receba leads de alunos{' '}
  <span style={{ color: 'var(--neon)' }}>sem criar site.</span>
          </h1>

          <p className="text-lg sm:text-xl max-w-xl mx-auto mb-8 leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}>
            CoachHub Fit é uma vitrine de coaches. Crie seu perfil, apareça para quem já está
            buscando e receba interessados direto no WhatsApp ou Instagram.
          </p>

          {/* Trust line */}
          <p className="text-sm mb-10" style={{ color: 'var(--text-muted)' }}>
            Sem taxa por lead · Aprovação em até 48h · Suporte em português
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
            <Link href="/cadastro?role=coach"
              className="btn-primary text-base px-8 py-3.5 w-full sm:w-auto">
              Criar perfil grátis
            </Link>
            <Link href="/coaches"
              className="btn-secondary text-base px-8 py-3.5 w-full sm:w-auto">
              Ver a vitrine →
            </Link>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Aprovação em até 48h · Suporte em português
          </p>
        </div>
      </section>

      {/* ── Benefícios ────────────────────────────────── */}
      <section className="py-14 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="section-tag mb-4 inline-flex">Por que usar</span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl"
              style={{ color: 'var(--text-primary)' }}>
              Captação de alunos online,{' '}
              <span style={{ color: 'var(--neon)' }}>sem complicação</span>
            </h2>
            <p className="mt-3 text-sm max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
              Não é plataforma de treino, dieta ou gestão de alunos. É uma vitrine para você ser encontrado e receber contato.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {BENEFITS.map(b => (
              <div key={b.title}
                className="coach-card flex items-start gap-4 p-6 rounded-2xl"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: b.bg, color: b.color, border: `1px solid ${b.border}` }}>
                  {b.icon}
                </div>
                <div>
                  <h3 className="font-display font-bold text-base mb-1.5" style={{ color: 'var(--text-primary)' }}>
                    {b.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {b.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Como funciona ─────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="section-tag mb-4 inline-flex">Como funciona</span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl"
              style={{ color: 'var(--text-primary)' }}>
              Do cadastro ao primeiro lead
            </h2>
          </div>

          <div className="relative">
            {/* Linha vertical conectora */}
            <div className="absolute left-5 top-10 bottom-10 w-px hidden sm:block"
              style={{ background: 'linear-gradient(to bottom, var(--neon)40, transparent)' }} />

            <div className="flex flex-col gap-3">
              {STEPS.map((step, i) => (
                <div key={step.n}
                  className="relative flex items-start gap-4 p-5 rounded-2xl transition-all duration-200"
                  style={{ background: 'var(--surface)', border: `1px solid ${i === 0 ? step.border : 'var(--border)'}` }}>
                  {i === 0 && (
                    <div className="absolute top-0 left-0 right-0 h-px rounded-full"
                      style={{ background: `linear-gradient(90deg, transparent, ${step.color}60, transparent)` }} />
                  )}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-black text-base flex-shrink-0 z-10"
                    style={{ background: step.bg, color: step.color, border: `1px solid ${step.border}` }}>
                    {step.n}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-bold text-base mb-1" style={{ color: 'var(--text-primary)' }}>
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                      {step.desc}
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs"
                      style={{ color: step.color, opacity: 0.8 }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                      {step.detail}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-8">
            <Link href="/cadastro?role=coach" className="btn-primary px-8 py-3.5">
              Começar agora — é grátis
            </Link>
          </div>
        </div>
      </section>

      {/* ── Preview de lead ───────────────────────────── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="section-tag mb-4 inline-flex">Painel de leads</span>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl mb-4"
                style={{ color: 'var(--text-primary)' }}>
                Cada lead chega{' '}
                <span style={{ color: 'var(--neon)' }}>pronto para responder</span>
              </h2>
              <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                Nome, WhatsApp ou Instagram, objetivo e o pacote de interesse — tudo em um card.
                Um clique já abre a conversa. Sem planilha, sem copiar número, sem perder lead.
              </p>
              <div className="flex flex-col gap-2">
                {[
                  'E-mail de notificação imediato quando chega lead',
                  'Painel organizado: novos / conectados / arquivados',
                  'Acesso pelo celular ou computador',
                ].map(t => (
                  <p key={t} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="2.5" className="mt-0.5 flex-shrink-0" style={{ color: 'var(--neon)' }}>
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                    {t}
                  </p>
                ))}
              </div>
            </div>

            {/* Lead mockup */}
            <div className="rounded-2xl overflow-hidden"
              style={{ background: 'var(--surface)', border: '1px solid rgba(57,255,122,0.25)' }}>
              <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(57,255,122,0.6), transparent)' }} />
              <div className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center font-display font-black text-sm flex-shrink-0"
                    style={{ background: 'rgba(57,255,122,0.12)', color: 'var(--neon)', border: '1px solid rgba(57,255,122,0.2)' }}>
                    MS
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display font-bold text-base" style={{ color: 'var(--text-primary)' }}>
                        Maria Silva
                      </span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1"
                        style={{ background: 'rgba(57,255,122,0.08)', border: '1px solid rgba(57,255,122,0.25)', color: 'var(--neon)' }}>
                        <span className="w-1 h-1 rounded-full bg-current animate-pulse" />
                        Novo lead
                      </span>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>agora mesmo</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
                    style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#25D366' }}>
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.555 4.122 1.524 5.857L.057 23.882l6.182-1.622A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.846 0-3.574-.5-5.065-1.371l-.364-.215-3.77.989 1.007-3.672-.236-.378A9.943 9.943 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                    </svg>
                    <span style={{ color: 'var(--text-secondary)' }}>(16) 99999-0000</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
                    style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Pacote Mensal</span>
                    <span style={{ color: 'var(--neon)' }}>R$350/mês</span>
                  </div>
                </div>
                <div className="mb-3">
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(57,255,122,0.08)', border: '1px solid rgba(57,255,122,0.2)', color: 'var(--neon)' }}>
                    Emagrecer
                  </span>
                </div>
                <div className="text-sm px-4 py-3 rounded-xl mb-4"
                  style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)', borderLeft: '2px solid rgba(57,255,122,0.3)' }}>
                  Tenho disponibilidade pela manhã e busco perder 8kg antes do verão.
                </div>
                <div className="flex gap-2">
                  <div className="btn-primary text-sm flex items-center gap-2 px-4 py-2 cursor-default select-none">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.555 4.122 1.524 5.857L.057 23.882l6.182-1.622A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.846 0-3.574-.5-5.065-1.371l-.364-.215-3.77.989 1.007-3.672-.236-.378A9.943 9.943 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                    </svg>
                    WhatsApp
                  </div>
                  <div className="btn-secondary text-xs flex items-center gap-1.5 cursor-default select-none">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Marcar como conectado
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Planos de visibilidade ─────────────────────── */}
      <PricingCards />

      {/* ── CTA final ─────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 pb-24">
        <div className="max-w-xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden text-center px-8 py-14"
            style={{ background: 'var(--surface)', border: '1px solid rgba(57,255,122,0.25)' }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse, rgba(57,255,122,0.14) 0%, transparent 70%)' }} />
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(57,255,122,0.7), transparent)' }} />
            <div className="relative z-10">
              <span className="section-tag mb-5 inline-flex">Comece hoje</span>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl mb-3 leading-tight"
                style={{ color: 'var(--text-primary)' }}>
                Seu perfil pode estar{' '}
                <span style={{ color: 'var(--neon)' }}>no ar ainda hoje</span>
              </h2>
              <p className="text-sm mb-7 max-w-xs mx-auto" style={{ color: 'var(--text-secondary)' }}>
                Crie seu perfil gratuitamente, aguarde aprovação e comece a aparecer para alunos que já estão buscando um coach.
              </p>
              <Link href="/cadastro?role=coach"
                className="btn-primary text-base px-10 py-3.5 inline-flex">
                Criar perfil grátis agora
              </Link>
              <p className="mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                Sem cartão de crédito · Aprovação em até 48h
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
