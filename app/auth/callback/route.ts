// app/auth/callback/route.ts
// Recebe o code do Supabase após login OAuth (Google) ou confirmação de e-mail.
// Troca o code por uma sessão e redireciona para o dashboard correto.

import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`)
  }

  const supabase = createClient()

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('[auth/callback] error:', error.message)
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
  }

  // Busca role para redirecionar corretamente
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(`${origin}/login`)
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role ?? 'student'

  const dashboards: Record<string, string> = {
    coach:   '/coach/dashboard',
    student: '/student/dashboard',
    admin:   '/admin/dashboard',
  }

  // '/' means no specific next — go to role dashboard
  const destination = (next.startsWith('/') && next !== '/') ? next : (dashboards[role] ?? '/student/dashboard')
  return NextResponse.redirect(`${origin}${destination}`)
}
