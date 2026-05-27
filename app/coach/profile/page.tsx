// app/coach/profile/page.tsx

import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { ProfileForm } from '@/components/coach/ProfileForm'

export const metadata: Metadata = {
  title: 'Editar perfil — CoachHub Fit',
}

export default async function CoachProfilePage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userRow } = await supabase
    .from('users')
    .select('role, full_name, avatar_url')
    .eq('id', user.id)
    .single()

  // Allow admin with coach_profile to access coach profile editing
  if (userRow?.role === 'student') redirect('/student/dashboard')
  if (userRow?.role === 'admin') {
    const { data: adminCp } = await supabase
      .from('coach_profiles').select('id').eq('user_id', user.id).single()
    if (!adminCp) redirect('/admin/dashboard')
    // has coach_profile — continue
  }

  const { data: coachProfile, error } = await supabase
    .from('coach_profiles')
    .select(`
      id, slug,
      bio, short_bio,
      specialties, certifications,
      location, years_experience, status,
      instagram_handle, youtube_handle, linkedin_url,
      cover_image_url
    `)
    .eq('user_id', user.id)
    .single()

  if (error || !coachProfile) {
    console.error('[coach/profile] perfil não encontrado:', error?.message)
    redirect('/coach/dashboard')
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">

        <nav className="flex items-center gap-1.5 text-xs mb-8" style={{ color: 'var(--text-muted)' }}>
          <Link href="/coach/dashboard" className="transition-colors duration-150 hover:text-neon">
            Dashboard
          </Link>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
          <span style={{ color: 'var(--text-secondary)' }}>Editar perfil</span>
        </nav>

        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest mb-1"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
            Perfil público
          </p>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl mb-1"
            style={{ color: 'var(--text-primary)' }}>
            Editar perfil
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Essas informações aparecem na sua página pública e influenciam diretamente sua conversão.{' '}
            <Link href={`/coaches/${coachProfile.id}`}
              className="font-medium transition-colors duration-150"
              style={{ color: 'var(--neon)' }}
              target="_blank" rel="noopener noreferrer">
              Ver perfil ↗
            </Link>
          </p>
        </div>

        <ProfileForm
          profile={coachProfile}
          userId={user.id}
          currentAvatarUrl={userRow?.avatar_url ?? null}
        />

      </div>
    </div>
  )
}
