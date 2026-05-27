// middleware.ts
// Responsabilidades:
//  1. Atualizar a sessão Supabase nos cookies a cada request
//  2. Proteger rotas privadas (/coach/*, /student/*, /admin/*)
//  3. Redirecionar usuário logado que tenta acessar /login ou /cadastro

import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const PROTECTED_PREFIXES = ['/coach/', '/student/', '/admin/']
const AUTH_ROUTES = ['/login', '/cadastro']

const ROLE_DASHBOARDS: Record<string, string> = {
  coach:   '/coach/dashboard',
  student: '/student/dashboard',
  admin:   '/admin/dashboard',
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const { supabaseResponse, user, supabase } = await updateSession(request)

  // Rotas protegidas sem sessão → /login
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))
  if (isProtected && !user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Usuário autenticado em rotas de auth → dashboard
  if (user) {
    const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r))

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role ?? 'student'
    const dashboard = ROLE_DASHBOARDS[role] ?? '/student/dashboard'

    if (isAuthRoute) {
      return NextResponse.redirect(new URL(dashboard, request.url))
    }

    // Protege acesso cruzado de roles
    if (role === 'student' && pathname.startsWith('/coach/')) {
      return NextResponse.redirect(new URL('/student/dashboard', request.url))
    }
    if (role === 'coach' && pathname.startsWith('/student/')) {
      return NextResponse.redirect(new URL('/coach/dashboard', request.url))
    }
    if (role !== 'admin' && pathname.startsWith('/admin/')) {
      return NextResponse.redirect(new URL(dashboard, request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)',
  ],
}
