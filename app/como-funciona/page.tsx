// app/como-funciona/page.tsx

import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Como funciona — CoachHub Fit',
  description:
    'Entenda como o CoachHub Fit conecta alunos a coaches: explore perfis, compare pacotes, envie interesse e converse diretamente pelo WhatsApp ou Instagram.',
}

const STUDENT_STEPS = [
  {
    n: '1', icon: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>),
    title: 'Explore coaches por especialidade',
    desc: 'Filtre por musculação, corrida, nutrição, yoga e mais. Veja quem está online agora.',
    note: 'Não precisa criar conta',
  },
  {
    n: '2', icon: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>),
    title: 'Veja o perfil completo',
    desc: 'Bio, certificações, experiência, fotos e os pacotes que o coach oferece com preço e o que está incluso.',
    note: 'Compare quantos quiser',
  },
  {
    n: '3', icon: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 2L11 13M22 2 15 22l-4-9-9-4 20-7z"/></svg>),
    title: 'Envie interesse em segundos',
    desc: 'Informe nome, WhatsApp ou Instagram, e seu objetivo. Sem criar conta, sem dados bancários.',
    note: 'Leva menos de 1 minuto',
  },
  {
    n: '4', icon: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.28h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l1.27-.88a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.03z"/></svg>),
    title: 'Converse direto com o coach',
    desc: 'O coach recebe seus dados e entra em contato pelo WhatsApp ou Instagram. Sem intermediário.',
    note: 'A conversa é sua',
  },
]

const COACH_STEPS = [
  {
    n: '1', icon: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>),
    title: 'Crie seu perfil profissional',
    desc: 'Foto, capa, bio, especialidades, certificações e pacotes. Tudo num link para compartilhar.',
    note: 'Gratuito · 10 minutos',
  },
  {
    n: '2', icon: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 6L9 17l-5-5"/></svg>),
    title: 'Aprovação em até 48h',
    desc: 'Nossa equipe revisa o perfil para garantir qualidade na vitrine.',
    note: 'Você recebe um e-mail',
  },
  {
    n: '3', icon: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>),
    title: 'Apareça na vitrine',
    desc: 'Alunos que buscam coaches na sua especialidade encontram seu perfil.',
    note: 'Destaque e Premium = mais visibilidade',
  },
  {
    n: '4', icon: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>),
    title: 'Receba leads e responda',
    desc: 'Nome, contato e objetivo chegam no painel. Um clique abre o WhatsApp ou Instagram.',
    note: 'E-mail de notificação imediato',
  },
]

export default function ComoFuncionaPage() {
  return (
    <div className="min-h-screen pt-16" style={{ background: 'var(--bg-dark)' }}>

      {/* ── Hero ──────────────────────────────────────── */}
      <section className="relative py-14 sm:py-20 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] rounded-full"
            style={{ background: 'radial-gradient(ellipse, rgba(57,255,122,0.07) 0%, transparent 65%)' }} />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <span className="section-tag mb-5 inline-flex">Como funciona</span>
          <h1 className="font-display font-extrabold tracking-tight mb-5"
            style={{ color: 'var(--text-primary)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.05 }}>
            Conexão direta entre{' '}
  <span style={{ color: 'var(--neon)' }}>alunos e coaches</span>
          </h1>
          <p className="text-base sm:text-lg leading-relaxed mb-6"
            style={{ color: 'var(--text-secondary)' }}>
            O CoachHub Fit é uma vitrine. Alunos encontram coaches verificados e entram em
            contato direto. Não há gestão de treino, dieta ou check-in — a plataforma conecta
            e a conversa continua pelo WhatsApp ou Instagram.
          </p>
          {/* Diferenciadores em linha */}
          <div className="flex flex-wrap justify-center gap-3">
            {['Sem intermediário', 'Sem taxa por lead', 'Sem app extra'].map(d => (
              <span key={d} className="text-xs px-3 py-1.5 rounded-full"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                {d}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dois fluxos ───────────────────────────────── */}
      <section className="pb-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Para alunos */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background: 'var(--surface)', border: '1px solid rgba(57,255,122,0.25)' }}>
            <div className="h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(57,255,122,0.7), transparent)' }} />
            <div className="p-7">
              <div className="mb-6">
                <span className="text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full inline-flex"
                  style={{ background: 'rgba(57,255,122,0.1)', border: '1px solid rgba(57,255,122,0.2)', color: 'var(--neon)', fontFamily: 'var(--font-display)' }}>
                  Para alunos
                </span>
                <p className="text-sm mt-3 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  Encontre o coach certo para o seu objetivo — sem precisar criar conta.
                </p>
              </div>

              <div className="flex flex-col gap-5 mb-6">
                {STUDENT_STEPS.map((step, i) => (
                  <div key={step.n} className="flex gap-3.5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 mt-0.5"
                      style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--neon)' }}>
                      {step.icon}
                    </div>
                    <div>
                      <p className="font-display font-semibold text-sm mb-0.5" style={{ color: 'var(--text-primary)' }}>
                        {step.title}
                      </p>
                      <p className="text-xs leading-relaxed mb-1" style={{ color: 'var(--text-secondary)' }}>
                        {step.desc}
                      </p>
                      <span className="text-xs" style={{ color: 'var(--neon)', opacity: 0.75 }}>
                        → {step.note}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <Link href="/coaches"
                className="btn-primary text-sm w-full text-center py-3">
                Explorar coaches agora
              </Link>
            </div>
          </div>

          {/* Para coaches */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }} />
            <div className="p-7">
              <div className="mb-6">
                <span className="text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full inline-flex"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
                  Para coaches
                </span>
                <p className="text-sm mt-3 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  Apareça para alunos que já estão buscando — sem criar site ou rodar anúncio.
                </p>
              </div>

              <div className="flex flex-col gap-5 mb-6">
                {COACH_STEPS.map((step) => (
                  <div key={step.n} className="flex gap-3.5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 mt-0.5"
                      style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                      {step.icon}
                    </div>
                    <div>
                      <p className="font-display font-semibold text-sm mb-0.5" style={{ color: 'var(--text-primary)' }}>
                        {step.title}
                      </p>
                      <p className="text-xs leading-relaxed mb-1" style={{ color: 'var(--text-secondary)' }}>
                        {step.desc}
                      </p>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        → {step.note}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <Link href="/cadastro?role=coach"
                className="btn-secondary text-sm w-full text-center py-3">
                Criar perfil de coach grátis
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── O que NÃO é o CoachHub Fit ────────────────── */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl p-7 sm:p-8"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <h2 className="font-display font-bold text-lg mb-5" style={{ color: 'var(--text-primary)' }}>
              Para ficar claro
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-3"
                  style={{ color: 'var(--neon)', fontFamily: 'var(--font-display)' }}>
                  O que é
                </p>
                {[
                  'Vitrine para coaches serem encontrados',
                  'Geração de leads qualificados',
                  'Contato direto pelo WhatsApp/Instagram',
                  'Perfil profissional sem precisar de site',
                ].map(t => (
                  <p key={t} className="flex items-start gap-2 text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="2.5" className="mt-0.5 flex-shrink-0" style={{ color: 'var(--neon)' }}>
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                    {t}
                  </p>
                ))}
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-3"
                  style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
                  O que não é
                </p>
                {[
                  'Plataforma de treino ou dieta',
                  'Gestão de alunos e check-ins',
                  'App de acompanhamento',
                  'Pagamento entre coach e aluno',
                ].map(t => (
                  <p key={t} className="flex items-start gap-2 text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="2" className="mt-0.5 flex-shrink-0" style={{ color: '#555550' }}>
                      <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                    {t}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA final ─────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 pb-24">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl mb-3"
            style={{ color: 'var(--text-primary)' }}>
            Por onde você quer começar?
          </h2>
          <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
            Alunos entram em contato sem criar conta. Coaches se cadastram grátis.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/coaches"
              className="btn-primary text-base px-8 py-3.5 w-full sm:w-auto">
              Encontrar meu coach
            </Link>
            <Link href="/cadastro?role=coach"
              className="btn-secondary text-base px-8 py-3.5 w-full sm:w-auto">
              Criar perfil de coach
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
