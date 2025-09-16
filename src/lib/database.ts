import { createClient } from '@supabase/supabase-js'

// Environment variables with fallbacks for development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

// Client for browser use (with RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Service client for server-side operations (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          password_hash: string
          first_name: string
          last_name: string
          role: 'admin' | 'manager' | 'dispatcher' | 'technician' | 'office_staff' | 'customer'
          phone?: string
          mobile?: string
          avatar_url?: string
          is_active: boolean
          last_login_at?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          first_name: string
          last_name: string
          role: 'admin' | 'manager' | 'dispatcher' | 'technician' | 'office_staff' | 'customer'
          phone?: string
          mobile?: string
          avatar_url?: string
          is_active?: boolean
          last_login_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          first_name?: string
          last_name?: string
          role?: 'admin' | 'manager' | 'dispatcher' | 'technician' | 'office_staff' | 'customer'
          phone?: string
          mobile?: string
          avatar_url?: string
          is_active?: boolean
          last_login_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          customer_number: string
          type: 'residential' | 'commercial' | 'industrial'
          first_name?: string
          last_name?: string
          company_name?: string
          email?: string
          phone?: string
          mobile?: string
          billing_address?: any
          status: 'active' | 'inactive' | 'vip' | 'new' | 'suspended'
          priority: string
          payment_status: 'current' | 'overdue' | 'prepaid' | 'credit_hold'
          credit_limit: number
          source?: string
          referral_source?: string
          assigned_rep_id?: string
          preferred_contact_method: 'email' | 'sms' | 'phone' | 'portal'
          best_time_to_call?: string
          communication_preferences?: any
          service_preferences?: any
          marketing_opt_in: boolean
          service_reminders: boolean
          payment_terms: string
          credit_rating?: string
          tags: string[]
          custom_fields?: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_number?: string
          type: 'residential' | 'commercial' | 'industrial'
          first_name?: string
          last_name?: string
          company_name?: string
          email?: string
          phone?: string
          mobile?: string
          billing_address?: any
          status?: 'active' | 'inactive' | 'vip' | 'new' | 'suspended'
          priority?: string
          payment_status?: 'current' | 'overdue' | 'prepaid' | 'credit_hold'
          credit_limit?: number
          source?: string
          referral_source?: string
          assigned_rep_id?: string
          preferred_contact_method?: 'email' | 'sms' | 'phone' | 'portal'
          best_time_to_call?: string
          communication_preferences?: any
          service_preferences?: any
          marketing_opt_in?: boolean
          service_reminders?: boolean
          payment_terms?: string
          credit_rating?: string
          tags?: string[]
          custom_fields?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_number?: string
          type?: 'residential' | 'commercial' | 'industrial'
          first_name?: string
          last_name?: string
          company_name?: string
          email?: string
          phone?: string
          mobile?: string
          billing_address?: any
          status?: 'active' | 'inactive' | 'vip' | 'new' | 'suspended'
          priority?: string
          payment_status?: 'current' | 'overdue' | 'prepaid' | 'credit_hold'
          credit_limit?: number
          source?: string
          referral_source?: string
          assigned_rep_id?: string
          preferred_contact_method?: 'email' | 'sms' | 'phone' | 'portal'
          best_time_to_call?: string
          communication_preferences?: any
          service_preferences?: any
          marketing_opt_in?: boolean
          service_reminders?: boolean
          payment_terms?: string
          credit_rating?: string
          tags?: string[]
          custom_fields?: any
          created_at?: string
          updated_at?: string
        }
      }
      work_orders: {
        Row: {
          id: string
          work_order_number: string
          customer_id: string
          property_id: string
          assigned_technician_id?: string
          created_by_id?: string
          title: string
          description?: string
          category: 'plumbing' | 'hvac' | 'electrical' | 'general' | 'appliance' | 'emergency'
          scheduled_start?: string
          scheduled_end?: string
          actual_start?: string
          actual_end?: string
          duration_estimated?: number
          duration_actual?: number
          status: 'draft' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold'
          priority: 'low' | 'standard' | 'high' | 'urgent' | 'emergency'
          estimated_cost?: number
          actual_cost?: number
          labor_hours?: number
          special_instructions?: string
          safety_notes?: string
          completion_notes?: string
          customer_signature_url?: string
          photos?: any
          quality_score?: number
          customer_rating?: number
          customer_feedback?: string
          invoice_id?: string
          requires_followup: boolean
          followup_date?: string
          warranty_period?: number
          warranty_expires_at?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          work_order_number?: string
          customer_id: string
          property_id: string
          assigned_technician_id?: string
          created_by_id?: string
          title: string
          description?: string
          category: 'plumbing' | 'hvac' | 'electrical' | 'general' | 'appliance' | 'emergency'
          scheduled_start?: string
          scheduled_end?: string
          actual_start?: string
          actual_end?: string
          duration_estimated?: number
          duration_actual?: number
          status?: 'draft' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold'
          priority?: 'low' | 'standard' | 'high' | 'urgent' | 'emergency'
          estimated_cost?: number
          actual_cost?: number
          labor_hours?: number
          special_instructions?: string
          safety_notes?: string
          completion_notes?: string
          customer_signature_url?: string
          photos?: any
          quality_score?: number
          customer_rating?: number
          customer_feedback?: string
          invoice_id?: string
          requires_followup?: boolean
          followup_date?: string
          warranty_period?: number
          warranty_expires_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          work_order_number?: string
          customer_id?: string
          property_id?: string
          assigned_technician_id?: string
          created_by_id?: string
          title?: string
          description?: string
          category?: 'plumbing' | 'hvac' | 'electrical' | 'general' | 'appliance' | 'emergency'
          scheduled_start?: string
          scheduled_end?: string
          actual_start?: string
          actual_end?: string
          duration_estimated?: number
          duration_actual?: number
          status?: 'draft' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold'
          priority?: 'low' | 'standard' | 'high' | 'urgent' | 'emergency'
          estimated_cost?: number
          actual_cost?: number
          labor_hours?: number
          special_instructions?: string
          safety_notes?: string
          completion_notes?: string
          customer_signature_url?: string
          photos?: any
          quality_score?: number
          customer_rating?: number
          customer_feedback?: string
          invoice_id?: string
          requires_followup?: boolean
          followup_date?: string
          warranty_period?: number
          warranty_expires_at?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: unknown) => {
  console.error('Supabase error:', error)
  throw new Error(error.message || 'Database operation failed')
}

// Connection test function
export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('business_settings')
      .select('business_name')
      .limit(1)
    
    if (error) {
      throw error
    }
    
    return { connected: true, data }
  } catch (error) {
    console.error('Database connection test failed:', error)
    return { connected: false, error }
  }
}