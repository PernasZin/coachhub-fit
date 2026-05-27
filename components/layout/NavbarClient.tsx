'use client'

// components/layout/NavbarClient.tsx
// Client Component — renderiza navbar com estado correto para logado/deslogado.

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { logoutAction } from '@/app/actions/auth'

interface UserInfo {
  name: string
  role: string
  initials: string
  hasCoachProfile?: boolean
}

const NAV_LINKS = [
  { label: 'Coaches', href: '/coaches' },
  { label: 'Para coaches', href: '/para-coaches' },
  { label: 'Como funciona', href: '/como-funciona' },
]

const DASHBOARD: Record<string, string> = {
  coach:   '/coach/dashboard',
  student: '/student/dashboard',
  admin:   '/admin/dashboard',
}

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
      <span
        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black"
        style={{ background: 'var(--neon)', color: '#080808', fontFamily: 'var(--font-display)' }}
      >
        CH
      </span>
      <span className="font-display font-bold text-base tracking-tight" style={{ color: 'var(--text-primary)' }}>
        CoachHub <span style={{ color: 'var(--neon)' }}>Fit</span>
      </span>
    </Link>
  )
}

// ── Avatar/menu do usuário logado ──────────────────────
function UserMenu({ user }: { user: UserInfo }) {
  const { hasCoachProfile = false } = user
  const [open, setOpen] = useState(false)
  const menuPathname = usePathname()
  // Admin com coach_profile: mantém contexto do coach quando está em /coach/*
  const inCoachArea = menuPathname.startsWith('/coach/')
  const dashHref = (user.role === 'admin' && hasCoachProfile && inCoachArea)
    ? '/coach/dashboard'
    : (DASHBOARD[user.role] ?? '/student/dashboard')
  const ROLE_LABELS: Record<string, string> = { admin: 'Admin', coach: 'Coach', student: 'Aluno' }
  const roleLabel = ROLE_LABELS[user.role] ?? 'Aluno'

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all duration-150"
        style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
          style={{ background: 'var(--neon)', color: '#080808', fontFamily: 'var(--font-display)' }}
        >
          {user.initials}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-xs font-semibold leading-none" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            {user.name.split(' ')[0]}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{roleLabel}</p>
        </div>
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className={`hidden sm:block transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          style={{ color: 'var(--text-muted)' }}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-full mt-2 w-48 rounded-xl overflow-hidden z-20"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
          >
            <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <p className="text-xs font-medium truncate" style={{ color: 'var(--text-secondary)' }}>{user.name}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{roleLabel}</p>
            </div>
            <nav className="p-1.5 flex flex-col gap-0.5">
              {/* Admin: painel admin + painel coach se tiver perfil */}
              {user.role === 'admin' ? (
                <>
                  <Link href="/admin/dashboard" onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors duration-150"
                    style={{ color: 'var(--text-secondary)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                    Painel admin
                  </Link>
                  {hasCoachProfile && (
                    <>
                      <Link href="/coach/dashboard" onClick={() => setOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors duration-150"
                        style={{ color: 'var(--text-secondary)' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                          <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                        </svg>
                        Painel coach
                      </Link>
                      <Link href="/coach/billing" onClick={() => setOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors duration-150"
                        style={{ color: 'var(--text-secondary)' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                        Visibilidade
                      </Link>
                    </>
                  )}
                </>
              ) : (
                /* Coach e aluno: dashboard normal */
                <Link href={dashHref} onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors duration-150"
                  style={{ color: 'var(--text-secondary)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                  </svg>
                  Dashboard
                </Link>
              )}
              {user.role === 'coach' && (
                <>
                  <Link href="/coach/profile" onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors duration-150"
                    style={{ color: 'var(--text-secondary)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                    Meu perfil
                  </Link>
                  <Link href="/coach/leads" onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors duration-150"
                    style={{ color: 'var(--text-secondary)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
                      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
                    </svg>
                    Leads
                  </Link>
                  <Link href="/coach/billing" onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors duration-150"
                    style={{ color: 'var(--text-secondary)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                    Visibilidade
                  </Link>
                </>
              )}
            </nav>
            <div className="p-1.5 pt-0" style={{ borderTop: '1px solid var(--border)' }}>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors duration-150"
                  style={{ color: 'rgba(248,113,113,0.8)' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Sair
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ── Main Navbar ────────────────────────────────────────
export function NavbarClient({ user }: { user: UserInfo | null }) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const isLoggedIn = !!user
  const inCoachAreaMain = pathname.startsWith('/coach/')
  const dashHref = (user?.role === 'admin' && user?.hasCoachProfile && inCoachAreaMain)
    ? '/coach/dashboard'
    : user ? (DASHBOARD[user.role] ?? '/student/dashboard') : '/login'

  // Hide public links on dashboard pages
  const isDashboard = pathname.startsWith('/coach/') || pathname.startsWith('/student/') || pathname.startsWith('/admin/')

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(8,8,8,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Logo />

        {/* Links desktop — só em páginas públicas */}
        {!isDashboard && (
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={cn('btn-ghost text-sm', pathname === link.href ? 'text-neon font-medium' : '')}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3 flex-shrink-0">
          {isLoggedIn ? (
            <>
              <Link href={dashHref} className="btn-ghost text-sm">
                Dashboard
              </Link>
              <UserMenu user={user!} />
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost text-sm">Entrar</Link>
              <Link href="/cadastro" className="btn-primary text-sm">Começar grátis</Link>
            </>
          )}
        </div>

        {/* Hambúrguer mobile */}
        <button
          className="md:hidden p-1.5"
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Menu"
        >
          <div className="flex flex-col gap-1.5">
            <span className={cn('w-5 h-0.5 rounded transition-all duration-200', menuOpen ? 'rotate-45 translate-y-2' : '')} style={{ background: 'var(--text-primary)' }} />
            <span className={cn('w-5 h-0.5 rounded transition-all duration-200', menuOpen ? 'opacity-0' : '')} style={{ background: 'var(--text-primary)' }} />
            <span className={cn('w-5 h-0.5 rounded transition-all duration-200', menuOpen ? '-rotate-45 -translate-y-2' : '')} style={{ background: 'var(--text-primary)' }} />
          </div>
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden px-4 pb-4 flex flex-col gap-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {!isDashboard && NAV_LINKS.map(link => (
            <Link key={link.href} href={link.href} className="btn-ghost text-sm justify-start" onClick={() => setMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
          <div className="flex flex-col gap-2 mt-2 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {isLoggedIn ? (
              <>
                <Link href={dashHref} className="btn-secondary text-sm" onClick={() => setMenuOpen(false)}>
                  Dashboard
                </Link>
                <form action={logoutAction}>
                  <button type="submit" className="btn-ghost text-sm w-full" style={{ color: 'rgba(248,113,113,0.8)' }}>
                    Sair
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-secondary text-sm" onClick={() => setMenuOpen(false)}>Entrar</Link>
                <Link href="/cadastro" className="btn-primary text-sm" onClick={() => setMenuOpen(false)}>Começar grátis</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
