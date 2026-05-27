// app/coaches/page.tsx
// Server Component: busca dados reais, passa para o grid client-side com filtros.

import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { CoachesGrid } from '@/components/coaches/CoachesGrid'

export const metadata: Metadata = {
  title: 'Coaches — CoachHub Fit',
  description: 'Encontre o coach ideal para seus objetivos. Musculação, corrida, yoga, nutrição e muito mais. Coaches verificados com contato direto pelo WhatsApp ou Instagram.',
  openGraph: {
    title: 'Coaches — CoachHub Fit',
    description: 'Encontre o coach ideal para seus objetivos. Contato direto pelo WhatsApp ou Instagram.',
    type: 'website',
  },
}

export type CoachRow = {
  id: string
  slug: string
  featured?: boolean   // derived: visibility_tier !== 'free'
  bio: string
  short_bio: string
  specialties: string[]
  location: string
  years_experience: number
  students_count: number
  rating_avg: number
  rating_count: number
  status: 'online' | 'offline' | 'busy'
  visibility_tier: 'free' | 'featured' | 'premium'
  cover_image_url: string | null
  instagram_handle: string | null
  min_price: number | null   // computed from plans
  users: { full_name: string; avatar_url: string | null }
}

export default async function CoachesPage() {
  const supabase = createClient()

  const { data: rows } = await supabase
    .from('coach_profiles')
    .select(`
      id, slug, bio, short_bio, specialties, location,
      years_experience, students_count, rating_avg, rating_count,
      status, visibility_tier, cover_image_url, instagram_handle,
      users ( full_name, avatar_url )
    `)
    .eq('approved', true)
    .order('visibility_tier', { ascending: false })
    .order('rating_avg', { ascending: false })

  const profiles = (rows ?? []) as unknown as Array<Omit<CoachRow, 'min_price'> & { users: { full_name: string; avatar_url: string | null } }>

  // Busca menor preço de cada coach em uma única query
  let minPrices: Record<string, number> = {}
  if (profiles.length > 0) {
    const ids = profiles.map(p => p.id)
    const { data: plans } = await supabase
      .from('coach_plans')
      .select('coach_profile_id, price_brl')
      .in('coach_profile_id', ids)
      .eq('is_active', true)
      .order('price_brl', { ascending: true })

    for (const plan of plans ?? []) {
      if (!(plan.coach_profile_id in minPrices)) {
        minPrices[plan.coach_profile_id] = plan.price_brl
      }
    }
  }

  const coaches: CoachRow[] = profiles.map(p => ({
    ...p,
    featured: p.visibility_tier !== 'free',  // derived for CoachCard/CoachesGrid compat
    min_price: minPrices[p.id] ?? null,
  }))

  return <CoachesGrid coaches={coaches} />
}
