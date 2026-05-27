import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Confirme seu e-mail — CoachHub Fit',
}

export default function ConfirmarEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16">
      <div className="w-full max-w-sm text-center">
        {/* Ícone */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(57,255,122,0.1)', border: '1px solid rgba(57,255,122,0.2)' }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--neon)' }}>
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
        </div>

        <h1
          className="font-display font-extrabold text-2xl mb-3"
          style={{ color: 'var(--text-primary)' }}
        >
          Verifique seu e-mail
        </h1>

        <p className="text-sm leading-relaxed mb-8" style={{ color: 'var(--text-secondary)' }}>
          Enviamos um link de confirmação para o seu e-mail.
          Clique no link para ativar sua conta e acessar o CoachHub Fit.
        </p>

        <div
          className="rounded-xl p-4 mb-6 text-left"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
          }}
        >
          <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            Não recebeu o e-mail?
          </p>
          <ul className="text-xs space-y-1" style={{ color: 'var(--text-muted)' }}>
            <li>• Verifique a pasta de spam ou lixo eletrônico</li>
            <li>• Aguarde alguns minutos e verifique novamente</li>
            <li>• Certifique-se que digitou o e-mail correto</li>
          </ul>
        </div>

        <Link href="/login" className="btn-secondary text-sm w-full text-center">
          Voltar para o login
        </Link>
      </div>
    </div>
  )
}
