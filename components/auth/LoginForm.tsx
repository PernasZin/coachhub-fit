'use client'

import React from 'react'

import { useFormState, useFormStatus } from 'react-dom'
import Link from 'next/link'
import { loginAction, signInWithGoogleAction } from '@/app/actions/auth'
import type { ActionResult } from '@/app/actions/auth'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-primary w-full py-3 text-base mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? 'Entrando...' : 'Entrar'}
    </button>
  )
}


function GoogleButton() {
  const [loading, setLoading] = React.useState(false)

  async function handleClick() {
    if (loading) return
    setLoading(true)
    try {
      await signInWithGoogleAction()
    } catch {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="btn-secondary w-full py-3 text-sm gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
          Conectando…
        </>
      ) : (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Entrar com Google
        </>
      )}
    </button>
  )
}

export function LoginForm() {
  const [state, action] = useFormState<ActionResult, FormData>(
    loginAction,
    {}
  )

  return (
    <div className="w-full max-w-[380px]">
      {/* Logo */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 mb-6">
          <span
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black"
            style={{ background: 'var(--neon)', color: '#080808' }}
          >
            CH
          </span>
          <span className="font-display font-bold" style={{ color: 'var(--text-primary)' }}>
            CoachHub <span style={{ color: 'var(--neon)' }}>Fit</span>
          </span>
        </Link>
        <h1 className="font-display font-extrabold text-2xl mb-2" style={{ color: 'var(--text-primary)' }}>
          Bem-vindo de volta
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Entre na sua conta para continuar
        </p>
      </div>

      {/* Card */}
      <div
        className="rounded-2xl p-6"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        {/* Erro global */}
        {state?.error && (
          <div
            className="rounded-xl p-3 mb-4 text-sm"
            style={{
              background: 'rgba(228,74,74,0.1)',
              border: '1px solid rgba(228,74,74,0.25)',
              color: '#F87171',
            }}
          >
            {state?.error}
          </div>
        )}

        <form action={action} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="label-base">E-mail</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="seu@email.com"
              className="input-base"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="label-base mb-0">Senha</label>
              <Link
                href="/esqueci-senha"
                className="text-xs hover:text-neon transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                Esqueci minha senha
              </Link>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              className="input-base"
              autoComplete="current-password"
              required
            />
          </div>

          <SubmitButton />
        </form>

        {/* Divisor */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full" style={{ borderTop: '1px solid var(--border)' }} />
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 text-xs" style={{ background: 'var(--surface)', color: 'var(--text-muted)' }}>
              ou continue com
            </span>
          </div>
        </div>

        {/* Google OAuth */}
        <GoogleButton />
      </div>

      <p className="text-center mt-5 text-sm" style={{ color: 'var(--text-secondary)' }}>
        Ainda não tem conta?{' '}
        <Link href="/cadastro" className="text-neon hover:underline font-medium">
          Criar conta grátis
        </Link>
      </p>
    </div>
  )
}
