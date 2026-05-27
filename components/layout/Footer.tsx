import Link from 'next/link'

const footerLinks = {
  Produto: [
    { label: 'Como funciona',  href: '/como-funciona' },
    { label: 'Para coaches',   href: '/para-coaches' },
    { label: 'Explorar coaches', href: '/coaches' },
    { label: 'Planos de visibilidade', href: '/para-coaches#planos' },
  ],
  Plataforma: [
    { label: 'Cadastrar como coach', href: '/cadastro?role=coach' },
    { label: 'Cadastrar como aluno', href: '/cadastro?role=student' },
    { label: 'Entrar',              href: '/login' },
  ],
  Suporte: [
    { label: 'Termos de uso', href: '/termos' },
    { label: 'Privacidade',   href: '/privacidade' },
  ],
}

export function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        background: 'var(--surface)',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        {/* Top: logo + links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black"
                style={{ background: 'var(--neon)', color: '#080808' }}
              >
                CH
              </span>
              <span className="font-display font-bold text-base" style={{ color: 'var(--text-primary)' }}>
                CoachHub <span style={{ color: 'var(--neon)' }}>Fit</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Vitrine de coaches de fitness para alunos encontrarem o profissional certo.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <p
                className="text-xs font-medium mb-4 uppercase tracking-widest"
                style={{ color: 'var(--text-muted)' }}
              >
                {category}
              </p>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors duration-200 hover:text-neon"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            © 2025 CoachHub Fit. Todos os direitos reservados.
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Feito com dedicação para coaches reais 💚
          </p>
        </div>
      </div>
    </footer>
  )
}
