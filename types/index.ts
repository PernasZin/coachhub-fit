export type CoachStatus = 'online' | 'offline' | 'busy'

export type CoachSpecialty =
  | 'Musculação'
  | 'CrossFit'
  | 'Corrida'
  | 'Yoga'
  | 'Pilates'
  | 'Natação'
  | 'Nutrição'
  | 'Emagrecimento'
  | 'Hipertrofia'
  | 'Funcional'
  | 'Boxe'
  | 'Ciclismo'

export type PlanType = 'free' | 'starter' | 'pro' | 'elite'

export interface CoachSocialLinks {
  instagram?: string
  youtube?: string
  linkedin?: string
}

export interface CoachPlan {
  name: string
  price: number // BRL mensal
  features: string[]
  maxStudents: number
}

export interface Coach {
  id: string
  slug: string
  name: string
  avatar: string
  coverImage?: string
  bio: string
  shortBio: string
  specialties: CoachSpecialty[]
  status: CoachStatus
  location: string
  yearsExperience: number
  studentsCount: number
  rating: number
  reviewsCount: number
  certifications: string[]
  socialLinks: CoachSocialLinks
  plans: CoachPlan[]
  visibilityTier: 'free' | 'featured' | 'premium'
  createdAt: string
}

export interface Student {
  id: string
  name: string
  email: string
  avatar?: string
  coachId?: string
  createdAt: string
}

export type UserRole = 'student' | 'coach' | 'admin'

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  name: string
}
