import Link from 'next/link'

export function CTASection() {
  return (
    <section className="py-20 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <div
          className="relative rounded-2xl overflow-hidden text-center px-8 py-16"
          style={{
            background: 'var(--surface)',
            border: '1px solid rgba(57, 255, 122, 0.2)',
          }}
        >
          {/* Glow decorativo */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 pointer-events-none"
            aria-hidden="true"
            style={{
              background: 'radial-gradient(ellipse, rgba(57,255,122,0.15) 0%, transparent 70%)',
            }}
          />

          <div className="relative z-10">
            <span className="section-tag mb-5 inline-flex">
              Comece hoje
            </span>

            <h2
              className="font-display font-extrabold text-3xl sm:text-4xl mb-4 leading-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              Seu perfil visível para{' '}
              <span style={{ color: 'var(--neon)' }}>milhares de alunos</span>
            </h2>

            <p
              className="text-base mb-8 max-w-lg mx-auto"
              style={{ color: 'var(--text-secondary)' }}
            >
              Crie seu perfil profissional, apareça para alunos que buscam um coach
              e receba contatos direto no WhatsApp ou Instagram.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/cadastro?role=coach"
                className="btn-primary text-base px-8 py-3.5 w-full sm:w-auto"
              >
                Criar perfil de coach grátis
              </Link>
              <Link
                href="/coaches"
                className="btn-secondary text-base px-8 py-3.5 w-full sm:w-auto"
              >
                Explorar coaches
              </Link>
            </div>

            <p className="mt-5 text-xs" style={{ color: 'var(--text-muted)' }}>
              Sem cartão de crédito · Cancele quando quiser · Suporte em português
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
