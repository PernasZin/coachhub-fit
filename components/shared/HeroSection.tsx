import Link from 'next/link'

const STUDENT_BULLETS = [
  'Coaches verificados por especialidade',
  'Compare perfis, pacotes e preços',
  'Contato direto pelo WhatsApp ou Instagram',
]

const COACH_BULLETS = [
  'Perfil profissional sem precisar de site',
  'Leads chegam prontos com nome e objetivo',
  'Apareça para quem já busca um coach',
]

export function HeroSection() {
  return (
    <section className="relative flex items-center justify-center overflow-hidden pt-16 pb-20 min-h-[92vh]">

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2
          w-[800px] h-[500px] rounded-full opacity-[0.055]"
          style={{ background: 'radial-gradient(ellipse, #39FF7A 0%, transparent 60%)' }} />
        <div className="absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`,
            backgroundSize: '56px 56px',
          }} />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center animate-fade-up">

        {/* Badge */}
        <div className="flex justify-center mb-7">
          <span className="section-tag gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse-dot inline-block" />
            Vitrine de coaches de fitness
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-display font-extrabold mb-5 tracking-tight"
          style={{ color: 'var(--text-primary)', fontSize: 'clamp(2.1rem, 5.5vw, 3.6rem)', lineHeight: 1.05 }}>
          O coach certo{' '}
          <br className="hidden sm:block" />
          <span style={{ color: 'var(--neon)' }}>para o seu objetivo.</span>
        </h1>

        {/* Sub */}
        <p className="text-base sm:text-lg max-w-xl mx-auto mb-9 leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}>
          Alunos encontram coaches verificados e entram em contato direto.
          Coaches criam perfil, aparecem na busca e recebem leads.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
          <Link href="/coaches"
            className="btn-primary text-base px-8 py-3 w-full sm:w-auto">
            Encontrar meu coach
          </Link>
          <Link href="/cadastro?role=coach"
            className="btn-secondary text-base px-8 py-3 w-full sm:w-auto">
            Sou coach — criar perfil grátis
          </Link>
        </div>

        {/* Dois cards de bullets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto mb-9">
          {[
            { label: 'Para alunos', bullets: STUDENT_BULLETS, color: 'var(--neon)' },
            { label: 'Para coaches', bullets: COACH_BULLETS, color: 'var(--neon)' },
          ].map(group => (
            <div key={group.label}
              className="rounded-xl p-4 text-left"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-3"
                style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.08em' }}>
                {group.label}
              </p>
              <ul className="flex flex-col gap-2">
                {group.bullets.map(b => (
                  <li key={b} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="2.5" className="mt-0.5 flex-shrink-0" style={{ color: group.color }}>
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Trust */}
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Sem cartão de crédito · Cancele quando quiser · Suporte em português
        </p>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-7 left-1/2 -translate-x-1/2 opacity-25 animate-bounce">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" style={{ color: 'var(--text-muted)' }}>
          <path d="M12 5v14M5 12l7 7 7-7"/>
        </svg>
      </div>
    </section>
  )
}
