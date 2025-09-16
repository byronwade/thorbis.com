// =============================================================================
// THORBIS BUSINESS OS - SUPABASE GENERATED TYPES
// =============================================================================
// Auto-generated TypeScript types from Supabase database schema
// Created: 2025-01-31
// Version: 1.0.0
//
// These types are generated from the database schema and should match
// the table definitions in /supabase/migrations/
// =============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// =============================================================================
// DATABASE SCHEMA INTERFACE
// =============================================================================

export interface Database {
  public: {
    Tables: Record<string, unknown>
    Views: Record<string, unknown>
    Functions: Record<string, unknown>
    Enums: Record<string, unknown>
    CompositeTypes: Record<string, unknown>
  }
  shared: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          email: string
          phone: string | null
          website: string | null
          logo_url: string | null
          address: Json | null
          industry: 'hs' | 'rest' | 'auto' | 'ret' | 'edu' | 'payroll' | 'ai'
          timezone: string
          currency: string
          settings: Json
          subscription_tier: 'basic' | 'pro' | 'enterprise'
          subscription_status: 'active' | 'canceled' | 'past_due' | 'trialing'
          trial_ends_at: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          email: string
          phone?: string | null
          website?: string | null
          logo_url?: string | null
          address?: Json | null
          industry: 'hs' | 'rest' | 'auto' | 'ret' | 'edu' | 'payroll' | 'ai'
          timezone?: string
          currency?: string
          settings?: Json
          subscription_tier?: 'basic' | 'pro' | 'enterprise'
          subscription_status?: 'active' | 'canceled' | 'past_due' | 'trialing'
          trial_ends_at?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          email?: string
          phone?: string | null
          website?: string | null
          logo_url?: string | null
          address?: Json | null
          industry?: 'hs' | 'rest' | 'auto' | 'ret' | 'edu' | 'payroll' | 'ai'
          timezone?: string
          currency?: string
          settings?: Json
          subscription_tier?: 'basic' | 'pro' | 'enterprise'
          subscription_status?: 'active' | 'canceled' | 'past_due' | 'trialing'
          trial_ends_at?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          avatar_url: string | null
          phone: string | null
          timezone: string
          language: string
          preferences: Json
          onboarding_completed: boolean
          last_seen_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          timezone?: string
          language?: string
          preferences?: Json
          onboarding_completed?: boolean
          last_seen_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          timezone?: string
          language?: string
          preferences?: Json
          onboarding_completed?: boolean
          last_seen_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      organization_memberships: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          role: 'owner' | 'admin' | 'manager' | 'member' | 'guest'
          permissions: Json
          status: 'active' | 'inactive' | 'pending' | 'suspended'
          invited_by: string | null
          joined_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          role?: 'owner' | 'admin' | 'manager' | 'member' | 'guest'
          permissions?: Json
          status?: 'active' | 'inactive' | 'pending' | 'suspended'
          invited_by?: string | null
          joined_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'manager' | 'member' | 'guest'
          permissions?: Json
          status?: 'active' | 'inactive' | 'pending' | 'suspended'
          invited_by?: string | null
          joined_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_memberships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_memberships_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      user_invitations: {
        Row: {
          id: string
          organization_id: string
          email: string
          role: 'admin' | 'manager' | 'member' | 'guest'
          permissions: Json
          invited_by: string
          token: string
          expires_at: string
          accepted_at: string | null
          accepted_by: string | null
          status: 'pending' | 'accepted' | 'expired' | 'revoked'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          email: string
          role?: 'admin' | 'manager' | 'member' | 'guest'
          permissions?: Json
          invited_by: string
          token: string
          expires_at: string
          accepted_at?: string | null
          accepted_by?: string | null
          status?: 'pending' | 'accepted' | 'expired' | 'revoked'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          email?: string
          role?: 'admin' | 'manager' | 'member' | 'guest'
          permissions?: Json
          invited_by?: string
          token?: string
          expires_at?: string
          accepted_at?: string | null
          accepted_by?: string | null
          status?: 'pending' | 'accepted' | 'expired' | 'revoked'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_invitations_accepted_by_fkey"
            columns: ["accepted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      api_keys: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          name: string
          key_prefix: string
          key_hash: string
          permissions: Json
          rate_limit: number
          expires_at: string | null
          last_used_at: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          name: string
          key_prefix: string
          key_hash: string
          permissions?: Json
          rate_limit?: number
          expires_at?: string | null
          last_used_at?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          name?: string
          key_prefix?: string
          key_hash?: string
          permissions?: Json
          rate_limit?: number
          expires_at?: string | null
          last_used_at?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_keys_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      audit_logs: {
        Row: {
          id: string
          organization_id: string
          user_id: string | null
          action: string
          resource_type: string
          resource_id: string | null
          old_values: Json | null
          new_values: Json | null
          metadata: Json
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id?: string | null
          action: string
          resource_type: string
          resource_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          metadata?: Json
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string | null
          action?: string
          resource_type?: string
          resource_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          metadata?: Json
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      webhooks: {
        Row: {
          id: string
          organization_id: string
          url: string
          events: string[]
          secret: string
          is_active: boolean
          headers: Json
          retry_count: number
          timeout_seconds: number
          last_triggered_at: string | null
          last_success_at: string | null
          last_failure_at: string | null
          failure_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          url: string
          events: string[]
          secret: string
          is_active?: boolean
          headers?: Json
          retry_count?: number
          timeout_seconds?: number
          last_triggered_at?: string | null
          last_success_at?: string | null
          last_failure_at?: string | null
          failure_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          url?: string
          events?: string[]
          secret?: string
          is_active?: boolean
          headers?: Json
          retry_count?: number
          timeout_seconds?: number
          last_triggered_at?: string | null
          last_success_at?: string | null
          last_failure_at?: string | null
          failure_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhooks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          }
        ]
      }
      files: {
        Row: {
          id: string
          organization_id: string
          user_id: string | null
          filename: string
          original_filename: string
          content_type: string
          size_bytes: number
          storage_path: string
          bucket_name: string
          metadata: Json
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id?: string | null
          filename: string
          original_filename: string
          content_type: string
          size_bytes: number
          storage_path: string
          bucket_name?: string
          metadata?: Json
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string | null
          filename?: string
          original_filename?: string
          content_type?: string
          size_bytes?: number
          storage_path?: string
          bucket_name?: string
          metadata?: Json
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "files_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "files_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: Record<string, unknown>
    Functions: {
      current_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      user_has_organization_access: {
        Args: {
          org_id: string
          min_role?: string
        }
        Returns: boolean
      }
      user_is_organization_admin: {
        Args: {
          org_id: string
        }
        Returns: boolean
      }
      user_organization_ids: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
      get_user_organizations: {
        Args: {
          user_uuid: string
        }
        Returns: {
          organization_id: string
          organization_name: string
          organization_slug: string
          organization_industry: string
          role: string
          status: string
          joined_at: string
        }[]
      }
    }
    Enums: Record<string, unknown>
    CompositeTypes: Record<string, unknown>
  }
  // Industry-specific schemas would be defined here
  hs: {
    Tables: Record<string, unknown>
    Views: Record<string, unknown>
    Functions: Record<string, unknown>
    Enums: Record<string, unknown>
    CompositeTypes: Record<string, unknown>
  }
  rest: {
    Tables: Record<string, unknown>
    Views: Record<string, unknown>
    Functions: Record<string, unknown>
    Enums: Record<string, unknown>
    CompositeTypes: Record<string, unknown>
  }
  auto: {
    Tables: Record<string, unknown>
    Views: Record<string, unknown>
    Functions: Record<string, unknown>
    Enums: Record<string, unknown>
    CompositeTypes: Record<string, unknown>
  }
  ret: {
    Tables: Record<string, unknown>
    Views: Record<string, unknown>
    Functions: Record<string, unknown>
    Enums: Record<string, unknown>
    CompositeTypes: Record<string, unknown>
  }
  edu: {
    Tables: Record<string, unknown>
    Views: Record<string, unknown>
    Functions: Record<string, unknown>
    Enums: Record<string, unknown>
    CompositeTypes: Record<string, unknown>
  }
  payroll: {
    Tables: Record<string, unknown>
    Views: Record<string, unknown>
    Functions: Record<string, unknown>
    Enums: Record<string, unknown>
    CompositeTypes: Record<string, unknown>
  }
  ai: {
    Tables: Record<string, unknown>
    Views: Record<string, unknown>
    Functions: Record<string, unknown>
    Enums: Record<string, unknown>
    CompositeTypes: Record<string, unknown>
  }
}

// =============================================================================
// TYPE ALIASES FOR CONVENIENCE
// =============================================================================

// Row types (what you get when selecting data)
export type Organization = Database['shared']['Tables']['organizations']['Row']
export type UserProfile = Database['shared']['Tables']['user_profiles']['Row']
export type OrganizationMembership = Database['shared']['Tables']['organization_memberships']['Row']
export type UserInvitation = Database['shared']['Tables']['user_invitations']['Row']
export type ApiKey = Database['shared']['Tables']['api_keys']['Row']
export type AuditLog = Database['shared']['Tables']['audit_logs']['Row']
export type Webhook = Database['shared']['Tables']['webhooks']['Row']
export type FileRecord = Database['shared']['Tables']['files']['Row']

// Insert types (what you need when inserting data)
export type OrganizationInsert = Database['shared']['Tables']['organizations']['Insert']
export type UserProfileInsert = Database['shared']['Tables']['user_profiles']['Insert']
export type OrganizationMembershipInsert = Database['shared']['Tables']['organization_memberships']['Insert']
export type UserInvitationInsert = Database['shared']['Tables']['user_invitations']['Insert']
export type ApiKeyInsert = Database['shared']['Tables']['api_keys']['Insert']
export type AuditLogInsert = Database['shared']['Tables']['audit_logs']['Insert']
export type WebhookInsert = Database['shared']['Tables']['webhooks']['Insert']
export type FileInsert = Database['shared']['Tables']['files']['Insert']

// Update types (what you can update)
export type OrganizationUpdate = Database['shared']['Tables']['organizations']['Update']
export type UserProfileUpdate = Database['shared']['Tables']['user_profiles']['Update']
export type OrganizationMembershipUpdate = Database['shared']['Tables']['organization_memberships']['Update']
export type UserInvitationUpdate = Database['shared']['Tables']['user_invitations']['Update']
export type ApiKeyUpdate = Database['shared']['Tables']['api_keys']['Update']
export type AuditLogUpdate = Database['shared']['Tables']['audit_logs']['Update']
export type WebhookUpdate = Database['shared']['Tables']['webhooks']['Update']
export type FileUpdate = Database['shared']['Tables']['files']['Update']

// Function argument and return types
export type GetUserOrganizationsResult = Database['shared']['Functions']['get_user_organizations']['Returns'][0]

// =============================================================================
// UTILITY TYPES
// =============================================================================

// Organization with membership info
export interface OrganizationWithMembership extends Organization {
  membership?: OrganizationMembership
}

// Extended user profile with organizations
export interface UserProfileWithOrganizations extends UserProfile {
  organizations?: OrganizationWithMembership[]
}

// Enum types for better type safety
export type IndustryType = Organization['industry']
export type SubscriptionTier = Organization['subscription_tier']
export type SubscriptionStatus = Organization['subscription_status']
export type MembershipRole = OrganizationMembership['role']
export type MembershipStatus = OrganizationMembership['status']
export type InvitationStatus = UserInvitation['status']