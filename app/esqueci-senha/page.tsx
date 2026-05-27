'use client'

import { useFormState, useFormStatus } from 'react-dom'
import Link from 'next/link'
import { requestPasswordResetAction } from '@/app/actions/auth'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending}
      className="btn-primary w-full py-3 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
      {pending ? (
        <>
          <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
          Enviando…
        </>
      ) : 'Enviar link de recuperação'}
    </button>
  )
}

export default function EsqueciSenhaPage() {
  const [state, action] = useFormState(requestPasswordResetAction, {})

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16 pb-8">
      <div className="fixed inset-0 pointer-events-none" aria-hidden
        style={{ background: 'radial-gradient(ellipse 600px 400px at 50% 30%, rgba(57,255,122,0.04) 0%, transparent 70%)' }} />

      <div className="relative z-10 w-full max-w-sm">
        <div className="rounded-2xl p-7"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>

          {/* Logo */}
          <div className="flex items-center gap-2 mb-7">
            <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black"
              style={{ background: 'var(--neon)', color: '#080808' }}>CH</span>
            <span className="font-display font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
              CoachHub <span style={{ color: 'var(--neon)' }}>Fit</span>
            </span>
          </div>

          {state.success ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(57,255,122,0.1)', border: '1px solid rgba(57,255,122,0.2)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--neon)" strokeWidth="2">
                  <path d="M22 2L11 13M22 2 15 22l-4-9-9-4 20-7z"/>
                </svg>
              </div>
              <h1 className="font-display font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>
                E-mail enviado!
              </h1>
              <p className="text-sm mb-6 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Se esse e-mail estiver cadastrado, você receberá um link para criar uma nova senha. Verifique sua caixa de entrada.
              </p>
              <Link href="/login" className="btn-secondary text-sm w-full text-center">
                Voltar ao login
              </Link>
            </div>
          ) : (
            <>
              <h1 className="font-display font-bold text-xl mb-1" style={{ color: 'var(--text-primary)' }}>
                Esqueceu a senha?
              </h1>
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                Informe seu e-mail e enviaremos um link para criar uma nova senha.
              </p>

              <form action={action} className="flex flex-col gap-4">
                {state.error && (
                  <div className="rounded-xl px-4 py-3 text-sm"
                    style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: '#F87171' }}>
                    {state.error}
                  </div>
                )}
                <div>
                  <label htmlFor="email" className="label-base">E-mail</label>
                  <input id="email" name="email" type="email" required autoComplete="email"
                    placeholder="seu@email.com" className="input-base" />
                </div>
                <SubmitButton />
              </form>

              <p className="text-xs text-center mt-5" style={{ color: 'var(--text-muted)' }}>
                Lembrou?{' '}
                <Link href="/login" className="hover:text-neon transition-colors"
                  style={{ color: 'var(--text-secondary)' }}>
                  Voltar ao login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
