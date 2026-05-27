// types/database.ts
// Tipos que espelham exatamente o schema do Supabase.
// Idealmente gerados via: npx supabase gen types typescript --linked > types/database.ts
// Por enquanto, definidos manualmente para corresponder ao schema.sql.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          avatar_url: string | null
          role: 'student' | 'coach' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string
          avatar_url?: string | null
          role?: 'student' | 'coach' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          full_name?: string
          avatar_url?: string | null
          role?: 'student' | 'coach' | 'admin'
          updated_at?: string
        }
        Relationships: []
      }
      coach_profiles: {
        Row: {
          id: string
          user_id: string
          slug: string
          bio: string
          short_bio: string
          specialties: string[]
          certifications: string[]
          location: string
          years_experience: number
          status: 'online' | 'offline' | 'busy'
          cover_image_url: string | null
          instagram_handle: string | null
          youtube_handle: string | null
          linkedin_url: string | null
          approved: boolean
          featured: boolean
          visibility_tier: 'free' | 'featured' | 'premium'
          students_count: number
          rating_avg: number
          rating_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          slug: string
          bio?: string
          short_bio?: string
          specialties?: string[]
          certifications?: string[]
          location?: string
          years_experience?: number
          status?: 'online' | 'offline' | 'busy'
          cover_image_url?: string | null
          instagram_handle?: string | null
          youtube_handle?: string | null
          linkedin_url?: string | null
          featured?: boolean
          approved?: boolean
        }
        Update: {
          bio?: string
          short_bio?: string
          specialties?: string[]
          certifications?: string[]
          location?: string
          years_experience?: number
          status?: 'online' | 'offline' | 'busy'
          cover_image_url?: string | null
          instagram_handle?: string | null
          youtube_handle?: string | null
          linkedin_url?: string | null
          featured?: boolean
          visibility_tier?: 'free' | 'featured' | 'premium'
          approved?: boolean
        }
        Relationships: []
      }
      student_profiles: {
        Row: {
          id: string
          user_id: string
          date_of_birth: string | null
          weight_kg: number | null
          height_cm: number | null
          goal: string | null
          health_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          date_of_birth?: string | null
          weight_kg?: number | null
          height_cm?: number | null
          goal?: string | null
          health_notes?: string | null
        }
        Update: {
          date_of_birth?: string | null
          weight_kg?: number | null
          height_cm?: number | null
          goal?: string | null
          health_notes?: string | null
        }
        Relationships: []
      }
      coach_plans: {
        Row: {
          id: string
          coach_profile_id: string
          name: string
          description: string
          price_brl: number
          interval: 'monthly' | 'quarterly' | 'yearly'
          features: string[]
          max_students: number
          is_active: boolean
          sort_order: number
          duration_days: number | null
          update_freq: string
          created_at: string
          updated_at: string
        }
        Insert: {
          coach_profile_id: string
          name: string
          description?: string
          price_brl: number
          interval?: 'monthly' | 'quarterly' | 'yearly'
          features?: string[]
          max_students?: number
          is_active?: boolean
          sort_order?: number
          duration_days?: number | null
          update_freq?: string
        }
        Update: {
          name?: string
          description?: string
          price_brl?: number
          interval?: 'monthly' | 'quarterly' | 'yearly'
          features?: string[]
          max_students?: number
          is_active?: boolean
          sort_order?: number
          duration_days?: number | null
          update_freq?: string
        }
        Relationships: []
      }
      contracts: {
        Row: {
          id: string
          coach_profile_id: string
          student_user_id: string | null
          coach_plan_id: string | null
          status: 'pending' | 'active' | 'paused' | 'cancelled'
          started_at: string | null
          ended_at: string | null
          price_snapshot_brl: number | null
          plan_name_snapshot: string | null
          notes: string | null
          student_contact: string
          created_at: string
          updated_at: string
        }
        Insert: {
          coach_profile_id: string
          student_user_id?: string | null
          coach_plan_id?: string | null
          status?: 'pending' | 'active' | 'paused' | 'cancelled'
          price_snapshot_brl?: number | null
          plan_name_snapshot?: string | null
          notes?: string | null
          student_contact?: string
        }
        Update: {
          status?: 'pending' | 'active' | 'paused' | 'cancelled'
          started_at?: string | null
          ended_at?: string | null
          notes?: string | null
          student_contact?: string
        }
        Relationships: []
      }
      checkins: {
        Row: {
          id: string
          contract_id: string
          student_user_id: string
          coach_profile_id: string
          type: 'weekly' | 'biweekly' | 'monthly'
          weight_kg: number | null
          body_fat_pct: number | null
          energy_level: number | null
          sleep_hours: number | null
          notes: string | null
          photo_urls: string[]
          coach_feedback: string | null
          feedback_at: string | null
          created_at: string
        }
        Insert: {
          contract_id: string
          student_user_id: string
          coach_profile_id: string
          type?: 'weekly' | 'biweekly' | 'monthly'
          weight_kg?: number | null
          body_fat_pct?: number | null
          energy_level?: number | null
          sleep_hours?: number | null
          notes?: string | null
          photo_urls?: string[]
        }
        Update: {
          coach_feedback?: string | null
          feedback_at?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          id: string
          contract_id: string
          sender_role: 'coach' | 'student'
          sender_user_id: string
          content: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          contract_id: string
          sender_role: 'coach' | 'student'
          sender_user_id: string
          content: string
          is_read?: boolean
        }
        Update: {
          is_read?: boolean
        }
        Relationships: []
      }
      coach_results: {
        Row: {
          id: string
          coach_profile_id: string
          title: string
          description: string
          before_photo_url: string | null
          after_photo_url: string | null
          duration_weeks: number | null
          specialty: string | null
          published: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          coach_profile_id: string
          title: string
          description?: string
          before_photo_url?: string | null
          after_photo_url?: string | null
          duration_weeks?: number | null
          specialty?: string | null
          published?: boolean
          sort_order?: number
        }
        Update: {
          title?: string
          description?: string
          before_photo_url?: string | null
          after_photo_url?: string | null
          duration_weeks?: number | null
          specialty?: string | null
          published?: boolean
          sort_order?: number
        }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: {
      user_role: 'student' | 'coach' | 'admin'
      coach_status: 'online' | 'offline' | 'busy'
      plan_interval: 'monthly' | 'quarterly' | 'yearly'
      contract_status: 'pending' | 'active' | 'paused' | 'cancelled'
      checkin_type: 'weekly' | 'biweekly' | 'monthly'
      message_sender: 'coach' | 'student'
    }
  }
}

// ── Helpers de conveniência ────────────────────────────────────────────────────
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type InsertDto<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type UpdateDto<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

// Aliases úteis
export type DbUser          = Tables<'users'>
export type DbCoachProfile  = Tables<'coach_profiles'>
export type DbStudentProfile = Tables<'student_profiles'>
export type DbCoachPlan     = Tables<'coach_plans'>
export type DbContract      = Tables<'contracts'>
export type DbCheckin       = Tables<'checkins'>
export type DbMessage       = Tables<'messages'>
export type DbCoachResult   = Tables<'coach_results'>

export type UserRole = Database['public']['Enums']['user_role']
