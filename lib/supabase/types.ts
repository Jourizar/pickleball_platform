// lib/supabase/types.ts
// Manually maintained types matching supabase/migrations/001_initial.sql
// To auto-generate: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string | null
          phone: string | null
          membership_type: string | null
          role: 'member' | 'admin'
          stripe_customer_id: string | null
          subscription_status: 'active' | 'inactive' | 'canceled'
          subscription_id: string | null
          locale: 'es' | 'en'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name?: string | null
          phone?: string | null
          membership_type?: string | null
          role?: 'member' | 'admin'
          stripe_customer_id?: string | null
          subscription_status?: 'active' | 'inactive' | 'canceled'
          subscription_id?: string | null
          locale?: 'es' | 'en'
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      membership_plans: {
        Row: {
          id: string
          name: string
          age_range: string | null
          price: number
          benefits: string[]
          thumbnail_url: string | null
          badge_color: string
          cta_label: string
          is_active: boolean
          display_order: number
          stripe_price_id: string | null
          stripe_product_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          age_range?: string | null
          price: number
          benefits?: string[]
          thumbnail_url?: string | null
          badge_color?: string
          cta_label?: string
          is_active?: boolean
          display_order?: number
          stripe_price_id?: string | null
          stripe_product_id?: string | null
        }
        Update: Partial<Database['public']['Tables']['membership_plans']['Insert']>
      }
      courts: {
        Row: {
          id: string
          name: string
          description: string | null
          photo_url: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          photo_url?: string | null
          is_active?: boolean
        }
        Update: Partial<Database['public']['Tables']['courts']['Insert']>
      }
      time_slots: {
        Row: {
          id: string
          court_id: string
          date: string
          start_time: string
          end_time: string
          max_capacity: number
          price_override: number | null
          currency: string
          is_blocked: boolean
        }
        Insert: {
          id?: string
          court_id: string
          date: string
          start_time: string
          end_time: string
          max_capacity?: number
          price_override?: number | null
          currency?: string
          is_blocked?: boolean
        }
        Update: Partial<Database['public']['Tables']['time_slots']['Insert']>
      }
      reservations: {
        Row: {
          id: string
          user_id: string
          time_slot_id: string
          status: 'confirmed' | 'canceled'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          time_slot_id: string
          status?: 'confirmed' | 'canceled'
        }
        Update: Partial<Database['public']['Tables']['reservations']['Insert']>
      }
      tournaments: {
        Row: {
          id: string
          name: string
          date: string | null
          description: string | null
          max_participants: number | null
          entry_fee: number
          currency: string
          is_open: boolean
        }
        Insert: {
          id?: string
          name: string
          date?: string | null
          description?: string | null
          max_participants?: number | null
          entry_fee?: number
          currency?: string
          is_open?: boolean
        }
        Update: Partial<Database['public']['Tables']['tournaments']['Insert']>
      }
      tournament_registrations: {
        Row: {
          id: string
          user_id: string
          tournament_id: string
          registered_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tournament_id: string
        }
        Update: Partial<Database['public']['Tables']['tournament_registrations']['Insert']>
      }
      faqs: {
        Row: {
          id: string
          question: string
          answer: string
          display_order: number
          is_visible: boolean
        }
        Insert: {
          id?: string
          question: string
          answer: string
          display_order?: number
          is_visible?: boolean
        }
        Update: Partial<Database['public']['Tables']['faqs']['Insert']>
      }
      site_content: {
        Row: {
          id: string
          page: string
          section: string
          key: string
          value: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          page: string
          section: string
          key: string
          value?: string | null
        }
        Update: Partial<Database['public']['Tables']['site_content']['Insert']>
      }
      staff_members: {
        Row: {
          id: string
          name: string
          role: string | null
          bio: string | null
          photo_url: string | null
          display_order: number
          is_visible: boolean
        }
        Insert: {
          id?: string
          name: string
          role?: string | null
          bio?: string | null
          photo_url?: string | null
          display_order?: number
          is_visible?: boolean
        }
        Update: Partial<Database['public']['Tables']['staff_members']['Insert']>
      }
      gallery_images: {
        Row: {
          id: string
          url: string
          alt: string | null
          display_order: number
        }
        Insert: {
          id?: string
          url: string
          alt?: string | null
          display_order?: number
        }
        Update: Partial<Database['public']['Tables']['gallery_images']['Insert']>
      }
      site_settings: {
        Row: {
          id: string
          key: string
          value: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value?: string | null
        }
        Update: Partial<Database['public']['Tables']['site_settings']['Insert']>
      }
    }
    Functions: {
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
    }
  }
}

// Convenience type helpers
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']
