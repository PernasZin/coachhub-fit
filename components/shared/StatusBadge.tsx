import { cn } from '@/lib/utils'
import type { CoachStatus } from '@/types'

interface StatusBadgeProps {
  status: CoachStatus
  showLabel?: boolean
  size?: 'sm' | 'md'
  className?: string
}

const statusConfig: Record<CoachStatus, { label: string; dotClass: string; badgeClass: string }> = {
  online: {
    label: 'Online',
    dotClass: 'bg-neon animate-pulse-neon',
    badgeClass: 'bg-[rgba(57,255,122,0.1)] text-neon border-[rgba(57,255,122,0.2)]',
  },
  busy: {
    label: 'Ocupado',
    dotClass: 'bg-amber-400',
    badgeClass: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
  },
  offline: {
    label: 'Offline',
    dotClass: 'bg-text-muted',
    badgeClass: 'bg-surface-3 text-text-secondary border-border',
  },
}

export function StatusBadge({ status, showLabel = true, size = 'md', className }: StatusBadgeProps) {
  const config = statusConfig[status]

  if (!showLabel) {
    return (
      <span
        className={cn(
          'rounded-full inline-block',
          size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5',
          config.dotClass,
          className
        )}
      />
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
        config.badgeClass,
        className
      )}
    >
      <span className={cn('rounded-full flex-shrink-0', 'w-1.5 h-1.5', config.dotClass)} />
      {config.label}
    </span>
  )
}
