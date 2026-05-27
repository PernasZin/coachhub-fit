'use client'

import { useSearchParams } from 'next/navigation'

import { useState } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import Link from 'next/link'
import { signUpAction } from '@/app/actions/auth'
import type { ActionResult } from '@/app/actions/auth'
import type { UserRole } from '@/types/database'

const roles: { value: UserRole; label: string; description: string; icon: string }[] = [
  {
    value: 'coach',
    label: 'Sou coach',
    description: 'Quero criar meu perfil, gerenciar alunos e escalar meu negócio.',
    icon: '🏋️',
  },
  {
    value: 'student',
    label: 'Sou aluno',
    description: 'Quero encontrar um coach qualificado e transformar minha saúde.',
    icon: '🎯',
  },
]

const specialties = [
  'Musculação', 'CrossFit', 'Corrida', 'Yoga', 'Pilates',
  'Natação', 'Nutrição', 'Emagrecimento', 'Hipertrofia', 'Funcional', 'Boxe',
]

function SubmitButton({ role }: { role: UserRole | null }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending || !role}
      className="btn-primary w-full py-3 text-base mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending
        ? 'Criando conta...'
        : role === 'coach'
          ? 'Criar perfil de coach'
          : 'Criar conta de aluno'}
    </button>
  )
}

export function SignUpForm() {
  const searchParams = useSearchParams()
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(() => {
    const param = searchParams.get('role')
    if (param === 'coach' || param === 'student') return param as UserRole
    return null
  })
  const [state, action] = useFormState<ActionResult, FormData>(signUpAction, {})

  return (
    <div className="w-full max-w-md">
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
          Criar sua conta
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Primeiro, nos conte quem você é
        </p>
      </div>

      {/* Seleção de papel */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {roles.map((role) => (
          <button
            key={role.value}
            type="button"
            onClick={() => setSelectedRole(role.value)}
            className="relative rounded-2xl p-4 text-left transition-all duration-200"
            style={{
              background: selectedRole === role.value ? 'rgba(57,255,122,0.08)' : 'var(--surface)',
              border: selectedRole === role.value
                ? '1px solid rgba(57,255,122,0.4)'
                : '1px solid var(--border)',
            }}
          >
            {selectedRole === role.value && (
              <div
                className="absolute top-3 right-3 w-4 h-4 rounded-full flex items-center justify-center"
                style={{ background: 'var(--neon)' }}
              >
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#080808" strokeWidth="3">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
            )}
            <span className="text-3xl block mb-2">{role.icon}</span>
            <p
              className="font-display font-bold text-sm mb-1"
              style={{ color: selectedRole === role.value ? 'var(--neon)' : 'var(--text-primary)' }}
            >
              {role.label}
            </p>
            <p className="text-xs leading-snug" style={{ color: 'var(--text-muted)' }}>
              {role.description}
            </p>
          </button>
        ))}
      </div>

      {/* Formulário — aparece após escolha */}
      {selectedRole && (
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
            {/* Campo oculto com a role */}
            <input type="hidden" name="role" value={selectedRole} />

            <div>
              <label htmlFor="full_name" className="label-base">Nome completo</label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                placeholder={selectedRole === 'coach' ? 'Rafael Mendes' : 'Maria Silva'}
                className="input-base"
                autoComplete="name"
                required
              />
            </div>

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
              <label htmlFor="password" className="label-base">Senha</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                className="input-base"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>

            {/* Especialidade — só para coach */}
            {selectedRole === 'coach' && (
              <div>
                <label htmlFor="specialty" className="label-base">Especialidade principal</label>
                <select
                  id="specialty"
                  name="specialty"
                  className="input-base"
                  style={{ cursor: 'pointer' }}
                >
                  <option value="">Selecione...</option>
                  {specialties.map((s) => (
                    <option key={s} value={s.toLowerCase()}>{s}</option>
                  ))}
                </select>
              </div>
            )}

            <SubmitButton role={selectedRole} />

            <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
              Ao criar a conta, você concorda com os{' '}
              <Link href="/termos" className="hover:text-neon transition-colors">
                Termos de Uso
              </Link>{' '}
              e{' '}
              <Link href="/privacidade" className="hover:text-neon transition-colors">
                Política de Privacidade
              </Link>
              .
            </p>
          </form>
        </div>
      )}

      <p className="text-center mt-5 text-sm" style={{ color: 'var(--text-secondary)' }}>
        Já tem conta?{' '}
        <Link href="/login" className="text-neon hover:underline font-medium">
          Entrar
        </Link>
      </p>
    </div>
  )
}
