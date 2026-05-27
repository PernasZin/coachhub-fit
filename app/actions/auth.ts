'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// Safe public URL — never falls back to localhost in production
function getPublicUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL
  if (url && url.startsWith('http') && !url.includes('localhost')) return url
  // If missing or localhost, Supabase will use the Site URL configured in its dashboard
  return ''
}

import type { UserRole } from '@/types/database'

export interface ActionResult {
  error?: string
  success?: boolean
}

// ── Login ───────────────────────────────────────────────────
export async function loginAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const email    = String(formData.get('email')    ?? '').trim()
  const password = String(formData.get('password') ?? '').trim()

  if (!email || !password) {
    return { error: 'Preencha e-mail e senha.' }
  }

  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    const isDev = process.env.NODE_ENV === 'development'
    if (
      error.message.includes('Invalid login credentials') ||
      error.message.includes('invalid_credentials')
    ) {
      return { error: 'E-mail ou senha incorretos.' }
    }
    if (error.message.includes('Email not confirmed')) {
      return { error: 'Confirme seu e-mail antes de entrar.' }
    }
    if (error.message.includes('Too many requests')) {
      return { error: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' }
    }
    return { error: isDev ? `Erro Supabase: ${error.message}` : 'Erro ao entrar. Tente novamente.' }
  }

  // Usa data.user do próprio signInWithPassword.
  // getUser() separado falha porque os cookies da sessão
  // acabaram de ser gravados e ainda não estão disponíveis na mesma requisição.
  const user = data.user
  if (!user) {
    return { error: 'Login realizado mas sessão não iniciada. Tente novamente.' }
  }

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    revalidatePath('/', 'layout')
    redirect('/student/dashboard')
  }

  const role: UserRole = profile.role

  revalidatePath('/', 'layout')

  const dashboards: Record<UserRole, string> = {
    coach:   '/coach/dashboard',
    student: '/student/dashboard',
    admin:   '/admin/dashboard',
  }

  redirect(dashboards[role])
}

// ── Cadastro ────────────────────────────────────────────────
export async function signUpAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const email     = String(formData.get('email')     ?? '').trim()
  const password  = String(formData.get('password')  ?? '').trim()
  const fullName  = String(formData.get('full_name') ?? '').trim()
  const role      = (formData.get('role') as UserRole) ?? 'student'
  const specialty = formData.get('specialty') as string | null

  if (!email || !password || !fullName) {
    return { error: 'Preencha todos os campos obrigatórios.' }
  }
  if (password.length < 8) {
    return { error: 'A senha deve ter no mínimo 8 caracteres.' }
  }
  if (!['student', 'coach'].includes(role)) {
    return { error: 'Papel inválido.' }
  }

  const supabase = createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role,
        specialty: specialty ?? null,
      },
      emailRedirectTo: getPublicUrl() ? `${getPublicUrl()}/auth/callback` : undefined,
    },
  })

  if (error) {
    if (
      error.message.includes('already registered') ||
      error.message.includes('already been registered')
    ) {
      return { error: 'Este e-mail já está cadastrado. Tente fazer login.' }
    }
    return { error: 'Erro ao criar conta. Tente novamente.' }
  }

  redirect('/cadastro/confirmar-email')
}

// ── Logout ──────────────────────────────────────────────────
export async function logoutAction(): Promise<void> {
  const supabase = createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

// ── OAuth: Google ───────────────────────────────────────────
export async function signInWithGoogleAction(): Promise<ActionResult> {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: getPublicUrl() ? `${getPublicUrl()}/auth/callback` : undefined,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })

  if (error) return { error: 'Erro ao conectar com Google.' }
  if (data.url) redirect(data.url)

  return { error: 'Erro inesperado.' }
}

export async function requestPasswordResetAction(
  _prev: { error?: string; success?: boolean },
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  if (!email) return { error: 'Informe seu e-mail.' }

  const supabase = createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: getPublicUrl() ? `${getPublicUrl()}/auth/callback?next=/auth/reset-senha` : undefined,
  })

  // Always return success to avoid e-mail enumeration
  if (error) console.error('[resetPassword]', error.message)
  return { success: true }
}

export async function updatePasswordAction(
  _prev: { error?: string; success?: boolean },
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const password = String(formData.get('password') ?? '').trim()
  if (password.length < 8) return { error: 'A senha deve ter pelo menos 8 caracteres.' }

  const supabase = createClient()
  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { error: 'Não foi possível atualizar a senha. O link pode ter expirado.' }
  return { success: true }
}
