import Link from 'next/link'
import Image from 'next/image'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatCurrency, formatRating } from '@/lib/utils'
import type { Coach } from '@/types'

interface CoachCardProps {
  coach: Coach
}

export function CoachCard({ coach }: CoachCardProps) {
  const tier = coach.visibilityTier ?? 'free'
  const lowestPlan = coach.plans.length > 0
    ? coach.plans.reduce((min, p) => (p.price < min.price ? p : min), coach.plans[0])
    : null

  return (
    <Link
      href={`/coaches/${coach.slug}`}
      className="block group"
    >
      <article
        className="card-base card-hover overflow-hidden h-full flex flex-col"
        style={tier === 'premium' ? { borderColor: 'rgba(251,191,36,0.3)' } : tier === 'featured' ? { borderColor: 'rgba(57,255,122,0.2)' } : {}}
      >
        {/* Avatar + cover */}
        <div className="relative h-32 sm:h-36 overflow-hidden" style={{ background: 'var(--surface-2)' }}>
          {coach.coverImage && (
            <Image
              src={coach.coverImage}
              alt=""
              fill
              className="object-cover opacity-50 group-hover:opacity-60 transition-opacity duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          )}
          {/* Gradient overlay */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to bottom, transparent 30%, var(--surface) 100%)' }}
          />
          {/* Tier badge */}
          {tier === 'premium' && (
            <div className="absolute top-3 left-3">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: '#FBBF24', color: '#080808', fontFamily: 'var(--font-display)' }}>
                Premium
              </span>
            </div>
          )}
          {tier === 'featured' && (
            <div className="absolute top-3 left-3">
              <span className="section-tag text-xs">Destaque</span>
            </div>
          )}
          {/* Status badge */}
          <div className="absolute top-3 right-3">
            <StatusBadge status={coach.status} size="sm" />
          </div>
        </div>

        {/* Avatar flutuante */}
        <div className="px-4 -mt-8 relative z-10 mb-3">
          <div
            className="w-16 h-16 rounded-xl overflow-hidden ring-2"
            style={{ outline: '2px solid var(--surface)', background: 'var(--surface-3)' }}
          >
            <Image
              src={coach.avatar}
              alt={coach.name}
              width={64}
              height={64}
              className="object-cover w-full h-full"
            />
          </div>
        </div>

        {/* Conteúdo */}
        <div className="px-4 pb-4 flex flex-col flex-1 gap-3">
          {/* Nome + localização */}
          <div>
            <h3
              className="font-display font-semibold text-base leading-tight mb-0.5 group-hover:text-neon transition-colors duration-200"
              style={{ color: 'var(--text-primary)' }}
            >
              {coach.name}
            </h3>
            <p className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              {coach.location}
            </p>
          </div>

          {/* Bio curta */}
          <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
            {coach.shortBio}
          </p>

          {/* Especialidades */}
          <div className="flex flex-wrap gap-1.5">
            {coach.specialties.slice(0, 3).map((spec) => (
              <span
                key={spec}
                className="px-2 py-0.5 rounded-full text-xs"
                style={{
                  background: 'var(--surface-3)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                }}
              >
                {spec}
              </span>
            ))}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Stats + preço */}
          <div
            className="flex items-center justify-between pt-3"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            {/* Rating e alunos */}
            <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <span className="flex items-center gap-1">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#FFB800' }}>
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{formatRating(coach.rating)}</span>
                <span>({coach.reviewsCount})</span>
              </span>
              <span className="flex items-center gap-1">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                {coach.studentsCount} alunos
              </span>
            </div>

            {/* Preço */}
            {lowestPlan ? (
              <div className="text-right">
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>a partir de</p>
                <p className="text-sm font-semibold font-display" style={{ color: 'var(--neon)' }}>
                  {formatCurrency(lowestPlan.price)}<span className="text-xs font-normal">/mês</span>
                </p>
              </div>
            ) : (
              <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: 'var(--surface-3)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                Consultar
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}
