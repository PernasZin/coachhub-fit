// components/layout/NavbarWrapper.tsx
// Server Component — lê sessão e passa para o Navbar client component.

import { createClient } from '@/lib/supabase/server'
import { NavbarClient } from './NavbarClient'

export async function NavbarWrapper() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let userInfo: {
    name: string
    role: string
    initials: string
    hasCoachProfile: boolean
  } | null = null

  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('full_name, role')
      .eq('id', user.id)
      .single()

    if (profile) {
      const name     = profile.full_name ?? user.email ?? ''
      const initials = name.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase()

      // For admin, check if they also have a coach_profile
      let hasCoachProfile = false
      if (profile.role === 'admin') {
        const { data: cp } = await supabase
          .from('coach_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single()
        hasCoachProfile = !!cp
      }

      userInfo = { name, role: profile.role, initials, hasCoachProfile }
    }
  }

  return <NavbarClient user={userInfo} />
}
