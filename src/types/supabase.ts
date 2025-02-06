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
      contacts: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string
          phone: string | null
          temperature: 'cold' | 'warm' | 'hot'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          email: string
          phone?: string | null
          temperature?: 'cold' | 'warm' | 'hot'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string | null
          temperature?: 'cold' | 'warm' | 'hot'
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string
          progress: number
          status: 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled'
          contact_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          progress?: number
          status?: 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled'
          contact_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          progress?: number
          status?: 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled'
          contact_id?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      contact_temperature: 'cold' | 'warm' | 'hot'
      project_status: 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled'
    }
  }
}