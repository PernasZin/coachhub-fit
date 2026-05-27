'use client'

// components/coaches/CoachesGrid.tsx

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { CoachRow } from '@/app/coaches/page'

const SPECIALTIES = [
  'Musculação', 'CrossFit', 'Corrida', 'Yoga', 'Pilates',
  'Natação', 'Nutrição', 'Emagrecimento', 'Hipertrofia', 'Funcional', 'Boxe',
]

type SortKey = 'relevance' | 'rating' | 'price_asc' | 'price_desc'

function formatPrice(cents: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)
}

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  online:  { label: 'Online agora', color: '#39FF7A' },
  busy:    { label: 'Ocupado',      color: '#FBBF24' },
  offline: { label: 'Offline',      color: '#555550' },
}

// ── CoachCard ──────────────────────────────────────────
function CoachCard({ coach, priority }: { coach: CoachRow; priority: boolean }) {
  const status    = STATUS_CONFIG[coach.status] ?? STATUS_CONFIG.offline
  const initials  = getInitials(coach.users.full_name)
  const firstName = coach.users.full_name.split(' ')[0]
  const shortBio  = coach.short_bio || coach.bio?.slice(0, 110) + (coach.bio?.length > 110 ? '…' : '')
  const isPremium  = coach.visibility_tier === 'premium'
  const isFeatured = coach.visibility_tier === 'featured'

  return (
    <Link href={`/coaches/${coach.id}`} className="group block h-full">
      <article
        className="coach-card relative h-full flex flex-col overflow-hidden rounded-2xl"
        style={{
          background: 'var(--surface)',
          border: isPremium
            ? '1px solid rgba(251,191,36,0.4)'
            : isFeatured
            ? '1px solid rgba(57,255,122,0.3)'
            : '1px solid var(--border)',
          boxShadow: isPremium
            ? '0 0 0 1px rgba(251,191,36,0.08)'
            : isFeatured
            ? '0 0 0 1px rgba(57,255,122,0.06)'
            : 'none',
        }}
      >
        {/* Hover overlay */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10"
          style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)' }} />

        {/* Cover */}
        <div className="relative h-32 sm:h-36 overflow-hidden flex-shrink-0"
          style={{ background: 'var(--surface-2)' }}>
          {coach.cover_image_url ? (
            <Image src={coach.cover_image_url} alt="" fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              style={{ opacity: 0.4 }} priority={priority} />
          ) : (
            <div className="absolute inset-0"
              style={{
                background: isPremium
                  ? 'radial-gradient(ellipse at 30% 50%, rgba(251,191,36,0.18) 0%, transparent 65%)'
                  : isFeatured
                  ? 'radial-gradient(ellipse at 30% 50%, rgba(57,255,122,0.15) 0%, transparent 65%)'
                  : 'radial-gradient(ellipse at 30% 50%, rgba(255,255,255,0.04) 0%, transparent 65%)',
              }} />
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(to bottom, transparent 20%, rgba(16,16,16,0.9) 100%)' }} />

          {/* Tier badge */}
          <div className="absolute top-2.5 left-2.5 flex gap-1.5">
            {isPremium && (
              <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: '#FBBF24', color: '#080808', fontFamily: 'var(--font-display)', fontSize: '10px', letterSpacing: '0.04em' }}>
                Premium
              </span>
            )}
            {isFeatured && (
              <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(57,255,122,0.15)', color: 'var(--neon)', border: '1px solid rgba(57,255,122,0.3)', fontFamily: 'var(--font-display)', fontSize: '10px', letterSpacing: '0.04em' }}>
                Destaque
              </span>
            )}
          </div>

          {/* Status */}
          <div className="absolute top-2.5 right-2.5">
            <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full glass"
              style={{ border: `1px solid ${status.color}18`, color: status.color, fontSize: '11px', fontFamily: 'var(--font-body)' }}>
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: status.color, boxShadow: coach.status === 'online' ? `0 0 6px ${status.color}` : 'none' }} />
              {status.label}
            </span>
          </div>
        </div>

        {/* Avatar */}
        <div className="px-4 -mt-8 relative z-10 mb-1">
          <div className="w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-surface flex-shrink-0"
            style={{ border: '2px solid var(--surface)', background: 'var(--surface-3)',
              boxShadow: isPremium ? '0 0 0 1px rgba(251,191,36,0.25)' : isFeatured ? '0 0 0 1px rgba(57,255,122,0.2)' : 'none' }}>
            {coach.users.avatar_url ? (
              <Image src={coach.users.avatar_url} alt={coach.users.full_name}
                width={64} height={64} className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-display font-black text-lg"
                style={{
                  background: isPremium ? 'rgba(251,191,36,0.15)' : isFeatured ? 'rgba(57,255,122,0.15)' : 'var(--surface-2)',
                  color: isPremium ? '#FBBF24' : isFeatured ? 'var(--neon)' : 'var(--text-muted)',
                }}>
                {initials}
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="px-4 pb-4 flex flex-col flex-1 gap-2">
          {/* Nome */}
          <div>
            <h3 className="font-display font-bold text-base leading-tight"
              style={{ color: 'var(--text-primary)' }}>
              <span className="group-hover:text-neon transition-colors duration-200">
                {coach.users.full_name}
              </span>
            </h3>
            {coach.location && (
              <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                {coach.location}
              </p>
            )}
          </div>

          {/* Bio */}
          {shortBio && (
            <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
              {shortBio}
            </p>
          )}

          {/* Especialidades */}
          {coach.specialties.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {coach.specialties.slice(0, 3).map(spec => (
                <span key={spec} className="spec-pill">{spec}</span>
              ))}
              {coach.specialties.length > 3 && (
                <span className="text-xs" style={{ color: 'var(--text-muted)', padding: '2px 0' }}>
                  +{coach.specialties.length - 3}
                </span>
              )}
            </div>
          )}

          <div className="flex-1" />

          {/* Footer */}
          <div className="pt-2.5 flex items-center justify-between"
            style={{ borderTop: '1px solid var(--border)' }}>
            {/* Stats */}
            <div className="flex items-center gap-2.5">
              {coach.rating_count > 0 && (
                <span className="flex items-center gap-1 text-xs">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="#FBBF24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {Number(coach.rating_avg).toFixed(1)}
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>({coach.rating_count})</span>
                </span>
              )}
              {coach.years_experience > 0 && (
                <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  {coach.years_experience}a
                </span>
              )}
            </div>

            {/* Preço */}
            {coach.min_price ? (
              <div className="text-right">
                <p className="font-display font-black text-sm leading-none"
                  style={{ color: isPremium ? '#FBBF24' : isFeatured ? 'var(--neon)' : 'var(--text-primary)' }}>
                  {formatPrice(coach.min_price)}
                  <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>/mês</span>
                </p>
              </div>
            ) : (
              <span className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                Consultar
              </span>
            )}
          </div>

          {/* CTA */}
          <div className="text-center py-2 rounded-xl text-xs font-bold transition-all duration-200"
            style={{
              background: isPremium ? 'rgba(251,191,36,0.08)' : 'rgba(57,255,122,0.06)',
              border: isPremium ? '1px solid rgba(251,191,36,0.2)' : '1px solid rgba(57,255,122,0.18)',
              color: isPremium ? '#FBBF24' : 'var(--neon)',
              fontFamily: 'var(--font-body)',
              letterSpacing: '0',
            }}>
            Ver perfil de {firstName} →
          </div>
        </div>
      </article>
    </Link>
  )
}

// ── Skeleton ───────────────────────────────────────────
function CoachCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="h-36 skeleton-shimmer" />
      <div className="px-4 pt-2 pb-4">
        <div className="w-16 h-16 rounded-2xl -mt-8 mb-3 skeleton-shimmer" />
        <div className="h-4 rounded w-3/4 mb-1.5 skeleton-shimmer" />
        <div className="h-3 rounded w-1/2 mb-3 skeleton-shimmer" />
        <div className="flex gap-1.5 mb-4">
          <div className="h-5 w-16 rounded-full skeleton-shimmer" />
          <div className="h-5 w-20 rounded-full skeleton-shimmer" />
        </div>
        <div className="h-7 rounded-xl skeleton-shimmer" />
      </div>
    </div>
  )
}

// ── CoachesGrid ────────────────────────────────────────
export function CoachesGrid({ coaches }: { coaches: CoachRow[] }) {
  const [search, setSearch]           = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [activeSpec, setActiveSpec]   = useState<string | null>(null)
  const [onlyAvailable, setOnlyAvailable] = useState(false)
  const [sort, setSort]               = useState<SortKey>('relevance')

  const filtered = useMemo(() => {
    let list = [...coaches]
    if (search.trim()) {
      const q = search.toLowerCase().trim()
      list = list.filter(c =>
        c.users.full_name.toLowerCase().includes(q) ||
        c.specialties.some(s => s.toLowerCase().includes(q)) ||
        c.location?.toLowerCase().includes(q) ||
        c.bio?.toLowerCase().includes(q)
      )
    }
    if (locationFilter.trim()) {
      const lq = locationFilter.toLowerCase().trim()
      list = list.filter(c => c.location?.toLowerCase().includes(lq))
    }
    if (activeSpec) list = list.filter(c => c.specialties.includes(activeSpec))
    if (onlyAvailable) list = list.filter(c => c.status === 'online')
    switch (sort) {
      case 'rating':     list.sort((a, b) => (b.rating_avg ?? 0) - (a.rating_avg ?? 0)); break
      case 'price_asc':  list.sort((a, b) => (a.min_price ?? Infinity) - (b.min_price ?? Infinity)); break
      case 'price_desc': list.sort((a, b) => (b.min_price ?? 0) - (a.min_price ?? 0)); break
    }
    return list
  }, [coaches, search, activeSpec, onlyAvailable, sort])

  const hasFilters  = !!(search || locationFilter || activeSpec || onlyAvailable || sort !== 'relevance')
  const showSkeleton = false // Server Component já entrega dados — skeleton apenas como visual

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6" style={{ background: 'var(--bg-dark)' }}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8 animate-fade-up">
          <p className="text-xs font-bold mb-2 tracking-widest uppercase"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
            Marketplace
          </p>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <h1 className="font-display font-extrabold tracking-tight"
                style={{ color: 'var(--text-primary)', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', lineHeight: 1.1 }}>
                Encontre seu coach
              </h1>
              <p className="mt-1.5 text-sm" style={{ color: 'var(--text-muted)' }}>
                {filtered.length === coaches.length
                  ? `${coaches.length} coach${coaches.length !== 1 ? 'es' : ''} disponível${coaches.length !== 1 ? 'is' : ''}`
                  : `${filtered.length} de ${coaches.length} coach${coaches.length !== 1 ? 'es' : ''}`}
              </p>
            </div>
            <select value={sort} onChange={e => setSort(e.target.value as SortKey)}
              className="text-sm rounded-xl px-3 py-2 outline-none self-start sm:self-auto"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
              <option value="relevance">Mais relevantes</option>
              <option value="rating">Melhor avaliados</option>
              <option value="price_asc">Menor preço</option>
              <option value="price_desc">Maior preço</option>
            </select>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-6 flex flex-col gap-3 animate-fade-up" style={{ animationDelay: '0.05s' }}>

          {/* Search */}
          <div className="search-bar">
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nome ou especialidade…"
              className="input-base w-full"
              style={{ paddingLeft: '2.75rem' }}
            />
            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </div>

          {/* Location filter */}
          <div className="search-bar">
            <input
              type="text"
              value={locationFilter}
              onChange={e => setLocationFilter(e.target.value)}
              placeholder="Filtrar por cidade ou estado — ex: São Carlos, SP"
              className="input-base w-full"
              style={{ paddingLeft: '2.75rem' }}
            />
            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            {locationFilter && (
              <button
                type="button"
                onClick={() => setLocationFilter('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                style={{ color: 'var(--text-muted)' }}
                aria-label="Limpar cidade">
                ×
              </button>
            )}
          </div>

          {/* Specialty pills + available toggle */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex gap-1.5 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0"
              style={{ scrollbarWidth: 'none' }}>
              {SPECIALTIES.map(spec => (
                <button
                  key={spec}
                  onClick={() => setActiveSpec(activeSpec === spec ? null : spec)}
                  className={`spec-pill flex-shrink-0 ${activeSpec === spec ? 'active' : ''}`}
                >
                  {spec}
                </button>
              ))}
            </div>
            <button
              onClick={() => setOnlyAvailable(!onlyAvailable)}
              className="flex-shrink-0 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all duration-150"
              style={{
                background: onlyAvailable ? 'rgba(57,255,122,0.1)' : 'var(--surface)',
                border: `1px solid ${onlyAvailable ? 'rgba(57,255,122,0.3)' : 'var(--border)'}`,
                color: onlyAvailable ? 'var(--neon)' : 'var(--text-muted)',
              }}>
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: '#39FF7A', boxShadow: onlyAvailable ? '0 0 5px #39FF7A' : 'none' }} />
              Online agora
            </button>
          </div>
        </div>

        {/* Grid */}
        {showSkeleton ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => <CoachCardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl py-20 text-center animate-fade-in"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'var(--surface-2)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="1.5" style={{ color: 'var(--text-muted)' }}>
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
            <p className="font-display font-bold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>
              Nenhum coach encontrado
            </p>
            <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
              {locationFilter.trim()
                ? `Nenhum coach encontrado em "${locationFilter.trim()}". Tente outra cidade ou remova o filtro.`
                : 'Tente outros termos ou remova os filtros ativos.'}
            </p>
            {hasFilters && (
              <button
                onClick={() => { setSearch(''); setLocationFilter(''); setActiveSpec(null); setOnlyAvailable(false); setSort('relevance') }}
                className="btn-secondary text-sm">
                Limpar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-fade-in">
            {filtered.map((coach, i) => (
              <CoachCard key={coach.id} coach={coach} priority={i < 3} />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
