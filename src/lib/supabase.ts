import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import type { Database } from './supabase/types';
import { mockAuth, createMockSupabaseClient } from './mock-auth';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Flag to determine if we should use mock auth (for development when Supabase is unavailable)
const USE_MOCK_AUTH = process.env.NODE_ENV === 'development' && (!supabaseUrl || !supabaseKey);

let supabaseClient: any;

if (USE_MOCK_AUTH) {
  console.log('🔧 Using mock authentication for development');
  supabaseClient = createMockSupabaseClient();
} else {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }

  // Create the Supabase client with database types
  supabaseClient = createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

export const supabase = supabaseClient;

// Export function to create client instance (for proper patterns)
export const createSupabaseClient = () => supabaseClient;

// Server-side client for admin operations (when needed)
export const createSupabaseServer = () => {
  // Use mock auth for development when Supabase is unavailable
  if (USE_MOCK_AUTH) {
    console.log('🔧 Using mock authentication for server operations');
    return createMockSupabaseClient();
  }
  
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for server operations');
  }
  
  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

// Re-export types from generated types file for convenience
export type {
  Database,
  Organization,
  UserProfile,
  OrganizationMembership,
  UserInvitation,
  ApiKey,
  AuditLog,
  Webhook,
  FileRecord as File,
  OrganizationWithMembership,
  UserProfileWithOrganizations,
  IndustryType,
  SubscriptionTier,
  SubscriptionStatus,
  MembershipRole,
  MembershipStatus,
  InvitationStatus,
} from './supabase/types';

// Course-related types (for edu industry)
export interface Course {
  id: string;
  title: string;
  description: string;
  category: 'plumbing' | 'retail' | 'software' | 'onboarding';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Beginner to Advanced';
  duration: string;
  instructor: string;
  rating: number;
  xp_reward: number;
  featured: boolean;
  is_new: boolean;
  tags: string[];
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  type: 'video' | 'interactive' | 'quiz' | 'exam' | 'practical';
  duration: number;
  order_index: number;
  content: any;
  xp_reward: number;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// AUTHENTICATION HELPER FUNCTIONS
// =============================================================================

export const getUser = async (): Promise<User | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const getSession = async (): Promise<Session | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signUp = async (email: string, password: string, metadata?: Record<string, unknown>) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const resetPassword = async (email: string) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: '${window.location.origin}/auth/reset-password',
  });
  return { data, error };
};

export const updatePassword = async (password: string) => {
  const { data, error } = await supabase.auth.updateUser({
    password,
  });
  return { data, error };
};

// =============================================================================
// DATABASE HELPER FUNCTIONS
// =============================================================================

// Get user's organizations with membership info
export const getUserOrganizations = async (userId: string): Promise<OrganizationWithMembership[]> => {
  // If using mock auth, return mock organizations
  if (USE_MOCK_AUTH) {
    const { getMockOrganizationsForUser } = await import('./mock-business-data');
    return getMockOrganizationsForUser(userId);
  }

  const { data, error } = await supabase
    .from('organizations')
    .select('
      *,
      membership:organization_memberships!inner(*)
    ')
    .eq('organization_memberships.user_id', userId)
    .eq('organization_memberships.status', 'active')
    .eq('is_active', true)
    .order('membership.joined_at', { ascending: true });

  if (error) {
    console.error('Error fetching user organizations:', error);
    return [];
  }

  return data || [];
};

// Get organization by slug
export const getOrganizationBySlug = async (slug: string): Promise<Organization | null> => {
  // If using mock auth, return mock organization
  if (USE_MOCK_AUTH) {
    const { getMockOrganizationBySlug } = await import('./mock-business-data');
    return getMockOrganizationBySlug(slug);
  }

  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Error fetching organization:', error);
    return null;
  }

  return data;
};

// Get user profile
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
};

// Create user profile (typically called after signup)
export const createUserProfile = async (profile: Partial<UserProfile>): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .insert(profile)
    .select()
    .single();

  if (error) {
    console.error('Error creating user profile:', error);
    return null;
  }

  return data;
};

// Update user profile
export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user profile:', error);
    return null;
  }

  return data;
};

// Check if user has access to organization
export const checkOrganizationAccess = async (userId: string, organizationId: string, minRole: string = 'member'): Promise<boolean> => {
  const { data, error } = await supabase.rpc('user_has_organization_access', {
    org_id: organizationId,
    min_role: minRole,
  });

  if (error) {
    console.error('Error checking organization access:', error);
    return false;
  }

  return data === true;
};

// Log audit event
export const logAuditEvent = async (auditLog: Omit<AuditLog, 'id' | 'created_at'>): Promise<void> => {
  const { error } = await supabase
    .from('audit_logs')
    .insert(auditLog);

  if (error) {
    console.error('Error logging audit event:', error);
  }
};

// =============================================================================
// BUSINESS DIRECTORY INTEGRATION
// =============================================================================

// Database types for business directory
export interface BusinessSubmission {
  id: string;
  business_name: string;
  business_category: string;
  primary_phone: string;
  primary_email: string;
  website_url?: string;
  
  // Location
  address_line_1: string;
  city: string;
  state_province: string;
  postal_code: string;
  service_area?: string;
  location_coordinates?: string; // PostGIS POINT
  
  // Services
  business_description: string;
  primary_services: string;
  years_in_business?: number;
  team_size?: number;
  
  // Certifications
  is_licensed: boolean;
  is_insured: boolean;
  offers_emergency_service: boolean;
  
  // AI Processing
  verification_score: number;
  trust_badges: string[];
  risk_level: 'low' | 'medium' | 'high';
  industry_classification: string;
  
  // Status
  submission_status: 'pending_review' | 'approved' | 'rejected' | 'needs_info';
  submission_source: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  ai_processed_at?: string;
}

// Trust verification database types
export interface TrustBadge {
  id: string;
  business_id: string;
  badge_type: string;
  badge_name: string;
  badge_description: string;
  verification_level: 'basic' | 'verified' | 'premium';
  verification_date: string;
  expiration_date?: string;
  verification_source: string;
  verification_data: Record<string, unknown>;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface AIReviewQueue {
  id: string;
  submission_id: string;
  review_type: string;
  priority: number;
  verification_score: number;
  trust_badges: string[];
  scheduled_for: string;
  processed_at?: string;
  processor_id?: string;
  review_results?: Record<string, unknown>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

// Helper functions for database operations
export class BusinessDirectoryService {
  static async submitBusiness(data: Partial<BusinessSubmission>) {
    const { data: submission, error } = await supabase
      .from('business_directory_submissions')
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return submission;
  }
  
  static async searchBusinesses(query: string, filters: {
    category?: string;
    location?: string;
    limit?: number;
  } = {}) {
    let supabaseQuery = supabase
      .from('business_directory_submissions')
      .select('*')
      .eq('submission_status', 'approved');
    
    if (query) {
      supabaseQuery = supabaseQuery.or(
        'business_name.ilike.%${query}%,business_description.ilike.%${query}%'
      );
    }
    
    if (filters.category) {
      supabaseQuery = supabaseQuery.eq('business_category', filters.category);
    }
    
    if (filters.location) {
      supabaseQuery = supabaseQuery.or(
        'city.ilike.%${filters.location}%,state_province.ilike.%${filters.location}%'
      );
    }
    
    if (filters.limit) {
      supabaseQuery = supabaseQuery.limit(filters.limit);
    }
    
    const { data, error } = await supabaseQuery;
    if (error) throw error;
    return data;
  }
  
  static async getTrustBadges(businessId: string) {
    const { data, error } = await supabase
      .from('business_trust_badges')
      .select('*')
      .eq('business_id', businessId)
      .eq('is_active', true)
      .order('display_order');
    
    if (error) throw error;
    return data;
  }
  
  static async addTrustBadge(badge: Partial<TrustBadge>) {
    const { data, error } = await supabase
      .from('business_trust_badges')
      .insert(badge)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
  
  static async scheduleAIReview(reviewData: Partial<AIReviewQueue>) {
    const { data, error } = await supabase
      .from('ai_mgmt.review_queue')
      .insert(reviewData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}

// RLS (Row Level Security) helper functions
export class SecurityService {
  static async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  }
  
  static async getUserBusinesses(userId: string) {
    const { data, error } = await supabase
      .from('tenant_mgmt.businesses')
      .select('*')
      .contains('user_ids', [userId])
      .eq('business_status', 'active');
    
    if (error) throw error;
    return data;
  }
  
  static async canAccessBusiness(userId: string, businessId: string) {
    const businesses = await this.getUserBusinesses(userId);
    return businesses.some(business => business.id === businessId);
  }
}

// Audit logging service
export class AuditService {
  static async logActivity(activity: {
    business_id?: string;
    user_id?: string;
    action: string;
    resource_type: string;
    resource_id?: string;
    details?: Record<string, unknown>;
    ip_address?: string;
    user_agent?: string;
  }) {
    const { error } = await supabase
      .from('audit_mgmt.activity_logs')
      .insert({
        ...activity,
        created_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Failed to log audit activity:', error);
    }
  }
}