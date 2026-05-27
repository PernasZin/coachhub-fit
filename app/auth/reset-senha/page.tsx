'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { updatePasswordAction } from '@/app/actions/auth'

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
          Salvando…
        </>
      ) : 'Criar nova senha'}
    </button>
  )
}

export default function ResetSenhaPage() {
  const [state, action] = useFormState(updatePasswordAction, {})
  const router = useRouter()

  useEffect(() => {
    if (state.success) {
      const t = setTimeout(() => router.push('/login'), 2500)
      return () => clearTimeout(t)
    }
  }, [state.success, router])

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16 pb-8">
      <div className="fixed inset-0 pointer-events-none" aria-hidden
        style={{ background: 'radial-gradient(ellipse 600px 400px at 50% 30%, rgba(57,255,122,0.04) 0%, transparent 70%)' }} />

      <div className="relative z-10 w-full max-w-sm">
        <div className="rounded-2xl p-7"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>

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
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--neon)" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <h1 className="font-display font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>
                Senha atualizada!
              </h1>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Redirecionando para o login…
              </p>
            </div>
          ) : (
            <>
              <h1 className="font-display font-bold text-xl mb-1" style={{ color: 'var(--text-primary)' }}>
                Criar nova senha
              </h1>
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                Escolha uma senha segura com pelo menos 8 caracteres.
              </p>

              <form action={action} className="flex flex-col gap-4">
                {state.error && (
                  <div className="rounded-xl px-4 py-3 text-sm"
                    style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: '#F87171' }}>
                    {state.error}
                  </div>
                )}
                <div>
                  <label htmlFor="password" className="label-base">Nova senha</label>
                  <input id="password" name="password" type="password" required
                    minLength={8} placeholder="Mínimo 8 caracteres" className="input-base" />
                </div>
                <SubmitButton />
              </form>

              <p className="text-xs text-center mt-5" style={{ color: 'var(--text-muted)' }}>
                Link expirado?{' '}
                <Link href="/esqueci-senha" className="hover:text-neon transition-colors"
                  style={{ color: 'var(--text-secondary)' }}>
                  Solicitar novo link
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
