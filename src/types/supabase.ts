export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type ContactTemperature = 'cold' | 'warm' | 'hot' | 'client'
export type ProjectStatus = 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled'
export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected'
export type InvoiceStatus = 'draft' | 'sent' | 'partial_paid' | 'paid' | 'overdue' | 'cancelled'
export type PaymentMethod = 'cash' | 'bank_transfer' | 'check' | 'credit_card'

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          address: string | null
          postal_code: string | null
          city: string | null
          country: string | null
          phone: string | null
          email: string | null
          website: string | null
          siret: string | null
          vat: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          postal_code?: string | null
          city?: string | null
          country?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          siret?: string | null
          vat?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          postal_code?: string | null
          city?: string | null
          country?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          siret?: string | null
          vat?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      contacts: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string
          phone: string | null
          temperature: ContactTemperature
          company_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          email: string
          phone?: string | null
          temperature?: ContactTemperature
          company_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string | null
          temperature?: ContactTemperature
          company_id?: string | null
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
          status: ProjectStatus
          contact_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          progress?: number
          status?: ProjectStatus
          contact_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          progress?: number
          status?: ProjectStatus
          contact_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          due_date: string
          status: TaskStatus
          project_id: string
          assigned_user_ids: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          due_date: string
          status?: TaskStatus
          project_id: string
          assigned_user_ids?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          due_date?: string
          status?: TaskStatus
          project_id?: string
          assigned_user_ids?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      quotes: {
        Row: {
          id: string
          company_id: string
          contact_id: string | null
          project_id: string | null
          number: number | null
          quote_number: string | null
          quote_date: string
          status: QuoteStatus
          total_amount: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          contact_id?: string | null
          project_id?: string | null
          number?: number | null
          quote_number?: string | null
          quote_date: string
          status?: QuoteStatus
          total_amount: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          contact_id?: string | null
          project_id?: string | null
          number?: number | null
          quote_number?: string | null
          quote_date?: string
          status?: QuoteStatus
          total_amount?: number
          created_at?: string
          updated_at?: string
        }
      }
      quote_lines: {
        Row: {
          id: string
          quote_id: string
          description: string
          quantity: number
          unit_price: number
          total_line_amount: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          quote_id: string
          description: string
          quantity: number
          unit_price: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          quote_id?: string
          description?: string
          quantity?: number
          unit_price?: number
          created_at?: string
          updated_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          company_id: string
          contact_id: string | null
          project_id: string | null
          invoice_date: string
          status: InvoiceStatus
          total_amount: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          contact_id?: string | null
          project_id?: string | null
          invoice_date: string
          status?: InvoiceStatus
          total_amount: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          contact_id?: string | null
          project_id?: string | null
          invoice_date?: string
          status?: InvoiceStatus
          total_amount?: number
          created_at?: string
          updated_at?: string
        }
      }
      invoice_lines: {
        Row: {
          id: string
          invoice_id: string
          description: string
          quantity: number
          unit_price: number
          total_line_amount: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          description: string
          quantity: number
          unit_price: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          description?: string
          quantity?: number
          unit_price?: number
          created_at?: string
          updated_at?: string
        }
      }
      invoice_payments: {
        Row: {
          id: string
          invoice_id: string
          payment_date: string
          amount_paid: number
          payment_method: PaymentMethod
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          payment_date: string
          amount_paid: number
          payment_method: PaymentMethod
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          payment_date?: string
          amount_paid?: number
          payment_method?: PaymentMethod
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          dark_mode: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          dark_mode?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          dark_mode?: boolean
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
      contact_temperature: ContactTemperature
      project_status: ProjectStatus
      task_status: TaskStatus
      quote_status: QuoteStatus
      invoice_status: InvoiceStatus
      payment_method: PaymentMethod
    }
  }
}