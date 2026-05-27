// app/admin/dashboard/page.tsx
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { logoutAction } from '@/app/actions/auth'
import { AdminCoachRow } from '@/components/admin/AdminCoachRow'

export const metadata: Metadata = { title: 'Admin — CoachHub Fit' }

export type CoachWithUser = {
  id: string; slug: string; bio: string; specialties: string[]
  location: string; status: string; approved: boolean; featured: boolean
  visibility_tier: 'free' | 'featured' | 'premium'
  students_count: number; rating_avg: number; rating_count: number
  instagram_handle: string | null; created_at: string
  users: { full_name: string; email: string; avatar_url: string | null }
}

export default async function AdminDashboardPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users').select('full_name, role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/')

  const [
    { data: allCoaches },
    { count: totalStudents },
    { count: totalLeads },
    { count: pendingLeads },
  ] = await Promise.all([
    supabase
      .from('coach_profiles')
      .select(`id, slug, bio, specialties, location, status, approved, featured, visibility_tier,
               students_count, rating_avg, rating_count, instagram_handle, created_at,
               users ( full_name, email, avatar_url )`)
      .order('created_at', { ascending: false }),
    supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'student'),
    supabase.from('contracts').select('id', { count: 'exact', head: true }),
    supabase.from('contracts').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  const coaches  = (allCoaches ?? []) as unknown as CoachWithUser[]
  const pending  = coaches.filter(c => !c.approved)
  const approved = coaches.filter(c => c.approved)
  const premium  = approved.filter(c => c.visibility_tier === 'premium')
  const featured = approved.filter(c => c.visibility_tier === 'featured')
  const free     = approved.filter(c => c.visibility_tier === 'free')

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6" style={{ background: 'var(--bg-dark)' }}>
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
              Administração
            </p>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight"
              style={{ color: 'var(--text-primary)' }}>
              Painel Admin
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/coaches" target="_blank" className="btn-secondary text-sm flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              Ver site
            </Link>
            <form action={logoutAction}>
              <button type="submit" className="btn-ghost text-sm flex items-center gap-1.5"
                style={{ color: 'var(--text-muted)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Sair
              </button>
            </form>
          </div>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Coaches totais',   value: coaches.length,     color: '#60A5FA', sub: `${approved.length} aprovados` },
            { label: 'Aguardando',       value: pending.length,     color: pending.length > 0 ? '#FBBF24' : '#555550', sub: pending.length > 0 ? 'Requer ação' : 'Tudo ok' },
            { label: 'Alunos',           value: totalStudents ?? 0, color: '#39FF7A', sub: 'cadastrados' },
            { label: 'Leads totais',     value: totalLeads ?? 0,    color: '#C084FC', sub: `${pendingLeads ?? 0} pendentes` },
          ].map(m => (
            <div key={m.label} className="relative rounded-2xl p-4 overflow-hidden"
              style={{ background: 'var(--surface)', border: `1px solid ${m.label === 'Aguardando' && pending.length > 0 ? 'rgba(251,191,36,0.25)' : 'var(--border)'}` }}>
              <div className="absolute top-0 left-4 right-4 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${m.color}50, transparent)` }} />
              <p className="font-display font-black text-3xl leading-none mb-1" style={{ color: m.color }}>{m.value}</p>
              <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{m.label}</p>
              <p className="text-xs mt-0.5" style={{ color: m.color, opacity: 0.7 }}>{m.sub}</p>
            </div>
          ))}
        </div>

        {/* Coaches pendentes */}
        {pending.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full" style={{ background: '#FBBF24', boxShadow: '0 0 6px #FBBF24' }} />
              <p className="text-xs font-bold uppercase tracking-widest"
                style={{ color: '#FBBF24', fontFamily: 'var(--font-display)' }}>
                Aguardando aprovação · {pending.length}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {pending.map(coach => (
                <AdminCoachRow key={coach.id} coach={coach} variant="pending"
                  />
              ))}
            </div>
          </div>
        )}

        {/* Aprovados por tier */}
        {approved.length === 0 ? (
          <div className="rounded-2xl p-8 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Nenhum coach aprovado ainda.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {premium.length > 0 && <TierSection label="Premium"  count={premium.length}  color="#FBBF24" coaches={premium}  />}
            {featured.length > 0 && <TierSection label="Destaque" count={featured.length} color="#39FF7A" coaches={featured} />}
            {free.length > 0     && <TierSection label="Free"     count={free.length}     color="#555550" coaches={free}     />}
          </div>
        )}

        {/* Dica admin */}
        <details className="mt-10 group">
          <summary className="cursor-pointer text-xs flex items-center gap-1.5 select-none w-fit"
            style={{ color: 'var(--text-muted)' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className="group-open:rotate-90 transition-transform duration-150">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
            Como tornar um usuário admin
          </summary>
          <div className="mt-3 rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
              UPDATE public.users SET role = &apos;admin&apos; WHERE email = &apos;seu@email.com&apos;;
            </p>
          </div>
        </details>

      </div>
    </div>
  )
}

// ── TierSection ───────────────────────────────────────
function TierSection({ label, count, color, coaches }: {
  label: string; count: number; color: string; coaches: CoachWithUser[]
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full" style={{ background: color }} />
        <p className="text-xs font-bold uppercase tracking-widest"
          style={{ color, fontFamily: 'var(--font-display)' }}>
          {label} · {count}
        </p>
      </div>
      <div className="flex flex-col gap-2">
        {coaches.map(coach => (
          <AdminCoachRow key={coach.id} coach={coach} variant="approved"
            />
        ))}
      </div>
    </div>
  )
}
