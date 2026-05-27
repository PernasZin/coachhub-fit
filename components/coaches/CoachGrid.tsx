import { CoachCard } from './CoachCard'
import type { Coach } from '@/types'

interface CoachGridProps {
  coaches: Coach[]
  title?: string
  subtitle?: string
}

export function CoachGrid({ coaches, title, subtitle }: CoachGridProps) {
  if (coaches.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
            style={{ color: 'var(--text-muted)' }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>
        <p className="font-display font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>
          Nenhum coach encontrado
        </p>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Tente outros filtros ou especialidades.
        </p>
      </div>
    )
  }

  return (
    <section>
      {(title || subtitle) && (
        <div className="mb-8">
          {title && (
            <h2
              className="font-display font-bold text-2xl sm:text-3xl mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              {title}
            </h2>
          )}
          {subtitle && (
            <p style={{ color: 'var(--text-secondary)' }}>{subtitle}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {coaches.map((coach) => (
          <CoachCard key={coach.id} coach={coach} />
        ))}
      </div>
    </section>
  )
}
