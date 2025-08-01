import { createClient } from '@supabase/supabase-js'
import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client untuk browser
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Client untuk server components
export const createServerSupabaseClient = () => {
  const cookieStore = cookies()
  
  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}

// Client untuk browser components
export const createBrowserSupabaseClient = () => {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Service role client untuk admin operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export type Database = {
  public: {
    Tables: {
      events: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          admin_id: string
          title: string
          description: string
          slug: string
          image_url: string | null
          price: number
          quota: number
          tanggal_event: string
          jam_event: string
          lokasi_event: string
          link_maps: string | null
          form_fields: any
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          admin_id: string
          title: string
          description: string
          slug: string
          image_url?: string | null
          price: number
          quota: number
          tanggal_event: string
          jam_event: string
          lokasi_event: string
          link_maps?: string | null
          form_fields: any
          is_active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          admin_id?: string
          title?: string
          description?: string
          slug?: string
          image_url?: string | null
          price?: number
          quota?: number
          tanggal_event?: string
          jam_event?: string
          lokasi_event?: string
          link_maps?: string | null
          form_fields?: any
          is_active?: boolean
        }
      }
      registrants: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          event_id: string
          form_data: any
          payment_proof_url: string | null
          payment_status: 'pending' | 'confirmed' | 'rejected'
          email: string
          name: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          event_id: string
          form_data: any
          payment_proof_url?: string | null
          payment_status?: 'pending' | 'confirmed' | 'rejected'
          email: string
          name: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          event_id?: string
          form_data?: any
          payment_proof_url?: string | null
          payment_status?: 'pending' | 'confirmed' | 'rejected'
          email?: string
          name?: string
        }
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          email: string
          full_name: string
          role: 'admin'
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          email: string
          full_name: string
          role?: 'admin'
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          email?: string
          full_name?: string
          role?: 'admin'
        }
      }
    }
  }
}