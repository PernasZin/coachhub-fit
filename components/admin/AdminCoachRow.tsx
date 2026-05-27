'use client'

// components/admin/AdminCoachRow.tsx
// Client component — runs admin actions and refreshes via router.refresh()

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  approveCoachAction,
  rejectCoachAction,
  revokeApprovalAction,
  setVisibilityTierAction,
} from '@/app/actions/admin'
import type { CoachWithUser } from '@/app/admin/dashboard/page'

const TIER_CONFIG = {
  premium:  { label: 'Premium',  dot: '#FBBF24', bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.2)'  },
  featured: { label: 'Destaque', dot: '#39FF7A', bg: 'rgba(57,255,122,0.06)',  border: 'rgba(57,255,122,0.18)' },
  free:     { label: 'Free',     dot: '#555550', bg: 'transparent',            border: 'var(--border)'         },
} as const

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso))
}

interface Props {
  coach: CoachWithUser
  variant: 'pending' | 'approved'
}

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

export function AdminCoachRow({ coach, variant }: Props) {
  const router   = useRouter()
  const [isPending, startTransition] = useTransition()
  const [activeBtn, setActiveBtn] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const initials  = getInitials(coach.users.full_name)
  const isPendingVariant = variant === 'pending'
  const tier      = TIER_CONFIG[coach.visibility_tier] ?? TIER_CONFIG.free
  const hasBio    = coach.bio && coach.bio.length > 10
  const completeness = [
    hasBio,
    coach.specialties.length > 0,
    !!coach.location,
    !!coach.instagram_handle,
  ].filter(Boolean).length

  function runAction(key: string, action: () => Promise<{ error?: string; success?: boolean }>) {
    if (isPending) return
    setActiveBtn(key)
    setError(null)
    startTransition(async () => {
      const result = await action()
      if (result.error) {
        setError(result.error)
        setActiveBtn(null)
      } else {
        // Refresh the server component data without full page reload
        router.refresh()
      }
    })
  }

  const isLoading = (key: string) => isPending && activeBtn === key

  function BtnSpinner() {
    return (
      <svg className="animate-spin" width="11" height="11" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
      </svg>
    )
  }

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{
        background: 'var(--surface)',
        border: `1px solid ${isPendingVariant ? 'rgba(251,191,36,0.2)' : 'var(--border)'}`,
        opacity: isPending ? 0.75 : 1,
        transition: 'opacity 0.2s',
      }}>
      {isPendingVariant && (
        <div className="h-0.5" style={{ background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.5), transparent)' }} />
      )}

      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3 sm:gap-4">

          {/* Avatar */}
          <div className="w-11 h-11 rounded-xl flex items-center justify-center font-display font-black text-sm flex-shrink-0"
            style={{
              background: isPendingVariant ? 'rgba(251,191,36,0.12)' : 'var(--surface-2)',
              color:      isPendingVariant ? '#FBBF24' : 'var(--text-muted)',
              border:    `1px solid ${isPendingVariant ? 'rgba(251,191,36,0.2)' : 'var(--border)'}`,
            }}>
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            {/* Name + badges */}
            <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-display font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                  {coach.users.full_name}
                </span>
                {!isPendingVariant && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: tier.bg, color: tier.dot, border: `1px solid ${tier.border}` }}>
                    {tier.label}
                  </span>
                )}
                <span className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                  {coach.status}
                </span>
              </div>
              <span className="text-xs font-bold flex-shrink-0"
                style={{ color: completeness >= 3 ? 'var(--neon)' : 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
                {completeness * 25}% perfil
              </span>
            </div>

            {/* Meta */}
            <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
              {coach.users.email}
              {coach.location && <> · {coach.location}</>}
              {' '}· {formatDate(coach.created_at)}
            </p>

            {/* Especialidades */}
            {coach.specialties.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {coach.specialties.slice(0, 4).map(s => (
                  <span key={s} className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                    {s}
                  </span>
                ))}
              </div>
            )}

            {/* Bio */}
            {hasBio && (
              <p className="text-xs mb-3 line-clamp-1" style={{ color: 'var(--text-secondary)' }}>
                {coach.bio.slice(0, 120)}{coach.bio.length > 120 ? '…' : ''}
              </p>
            )}

            {/* Error */}
            {error && (
              <div className="mb-2 px-3 py-2 rounded-lg flex items-start gap-2"
                style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#F87171"
                  strokeWidth="2" className="mt-0.5 flex-shrink-0">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p className="text-xs" style={{ color: '#F87171' }}>{error}</p>
              </div>
            )}

            {/* Ações */}
            <div className="flex flex-wrap gap-2">
              <Link href={`/coaches/${coach.id}`} target="_blank"
                className="btn-ghost text-xs flex items-center gap-1">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                Ver perfil
              </Link>

              {isPendingVariant ? (
                <>
                  {/* Aprovar */}
                  <button
                    onClick={() => runAction('approve', () => approveCoachAction(coach.id))}
                    disabled={isPending}
                    className="text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 disabled:opacity-50"
                    style={{ background: 'rgba(57,255,122,0.12)', color: 'var(--neon)', border: '1px solid rgba(57,255,122,0.25)', fontFamily: 'var(--font-display)' }}>
                    {isLoading('approve') ? <><BtnSpinner /> Aprovando…</> : 'Aprovar'}
                  </button>

                  {/* Rejeitar */}
                  <button
                    onClick={() => runAction('reject', () => rejectCoachAction(coach.id))}
                    disabled={isPending}
                    className="btn-ghost text-xs flex items-center gap-1.5 disabled:opacity-50"
                    style={{ color: 'rgba(248,113,113,0.7)' }}>
                    {isLoading('reject') ? <><BtnSpinner /> Rejeitando…</> : 'Rejeitar'}
                  </button>
                </>
              ) : (
                <>
                  {/* Promover / Rebaixar tier */}
                  {(() => {
                    const nextTier =
                      coach.visibility_tier === 'free'     ? 'featured' :
                      coach.visibility_tier === 'featured' ? 'premium'  : 'free'
                    const label =
                      coach.visibility_tier === 'free'     ? 'Promover → Destaque' :
                      coach.visibility_tier === 'featured' ? 'Promover → Premium'  :
                                                             'Rebaixar → Free'
                    const btnStyle = {
                      background: coach.visibility_tier === 'premium' ? 'rgba(251,191,36,0.1)'
                        : coach.visibility_tier === 'featured' ? 'rgba(57,255,122,0.08)'
                        : 'var(--surface-2)',
                      color: coach.visibility_tier === 'premium' ? '#FBBF24'
                        : coach.visibility_tier === 'featured' ? 'var(--neon)'
                        : 'var(--text-muted)',
                      border: `1px solid ${
                        coach.visibility_tier === 'premium' ? 'rgba(251,191,36,0.25)'
                        : coach.visibility_tier === 'featured' ? 'rgba(57,255,122,0.2)'
                        : 'var(--border)'}`,
                    }
                    return (
                      <button
                        onClick={() => runAction('tier', () => setVisibilityTierAction(coach.id, nextTier as 'free' | 'featured' | 'premium'))}
                        disabled={isPending}
                        className="text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all duration-150 disabled:opacity-50"
                        style={btnStyle}>
                        {isLoading('tier') ? <><BtnSpinner /> Atualizando…</> : label}
                      </button>
                    )
                  })()}

                  {/* Revogar aprovação */}
                  <button
                    onClick={() => {
                      console.log('[revoke click] coach.id:', coach.id, 'name:', coach.users.full_name, 'approved:', coach.approved)
                      runAction('revoke', () => revokeApprovalAction(coach.id))
                    }}
                    disabled={isPending}
                    className="btn-ghost text-xs flex items-center gap-1.5 disabled:opacity-50"
                    style={{ color: 'rgba(248,113,113,0.7)' }}>
                    {isLoading('revoke') ? <><BtnSpinner /> Revogando…</> : 'Revogar aprovação'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
