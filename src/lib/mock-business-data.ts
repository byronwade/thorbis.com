/**
 * Mock Business Data for Development
 * Provides sample organizations and business profiles for testing
 */

import type { Organization, OrganizationWithMembership } from './supabase';

// Sample organizations for different industries
export const MOCK_ORGANIZATIONS: OrganizationWithMembership[] = [
  {
    id: 'org-hs-1',
    name: 'ProFix Plumbing Solutions',
    slug: 'profix-plumbing',
    email: 'info@profixplumbing.com',
    phone: '(555) 123-4567',
    website: 'https://profixplumbing.com',
    logo_url: '/logos/profix-plumbing.png',
    address: {
      street: '123 Main Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102'
    },
    industry: 'hs',
    timezone: 'America/Los_Angeles',
    currency: 'USD',
    settings: {
      business_hours: {
        monday: { open: '08:00', close: '18:00', closed: false },
        tuesday: { open: '08:00', close: '18:00', closed: false },
        wednesday: { open: '08:00', close: '18:00', closed: false },
        thursday: { open: '08:00', close: '18:00', closed: false },
        friday: { open: '08:00', close: '18:00', closed: false },
        saturday: { open: '09:00', close: '17:00', closed: false },
        sunday: { open: '10:00', close: '16:00', closed: false }
      },
      service_area_radius: 25,
      emergency_service: true,
      license_number: 'CA-PL-123456',
      insurance_provider: 'State Farm',
      services: [
        'Emergency repairs',
        'Pipe installation', 
        'Drain cleaning',
        'Water heater repair',
        'Bathroom remodeling'
      ]
    },
    subscription_tier: 'pro',
    subscription_status: 'active',
    trial_ends_at: null,
    is_active: true,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-12-01T00:00:00.000Z',
    membership: {
      id: 'mem-hs-1',
      organization_id: 'org-hs-1',
      user_id: 'mock-user-1',
      role: 'owner',
      permissions: { all: true },
      status: 'active',
      invited_by: null,
      joined_at: '2024-01-01T00:00:00.000Z',
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z'
    }
  },
  {
    id: 'org-auto-1',
    name: 'Downtown Auto Repair',
    slug: 'downtown-auto-repair',
    email: 'contact@downtownauto.com',
    phone: '(555) 987-6543',
    website: 'https://downtownauto.com',
    logo_url: '/logos/downtown-auto.png',
    address: {
      street: '456 Oak Avenue',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94103'
    },
    industry: 'auto',
    timezone: 'America/Los_Angeles',
    currency: 'USD',
    settings: {
      business_hours: {
        monday: { open: '07:00', close: '19:00', closed: false },
        tuesday: { open: '07:00', close: '19:00', closed: false },
        wednesday: { open: '07:00', close: '19:00', closed: false },
        thursday: { open: '07:00', close: '19:00', closed: false },
        friday: { open: '07:00', close: '19:00', closed: false },
        saturday: { open: '08:00', close: '17:00', closed: false },
        sunday: { open: '00:00', close: '00:00', closed: true }
      },
      license_number: 'CA-AR-789012',
      insurance_provider: 'Allstate',
      specializations: [
        'Foreign vehicles',
        'Domestic vehicles',
        'Hybrid vehicles'
      ],
      services: [
        'Oil changes',
        'Brake repair',
        'Transmission service',
        'Engine diagnostics',
        'Tire installation'
      ]
    },
    subscription_tier: 'pro',
    subscription_status: 'active',
    trial_ends_at: null,
    is_active: true,
    created_at: '2024-01-15T00:00:00.000Z',
    updated_at: '2024-12-01T00:00:00.000Z',
    membership: {
      id: 'mem-auto-1',
      organization_id: 'org-auto-1',
      user_id: 'mock-user-1',
      role: 'owner',
      permissions: { all: true },
      status: 'active',
      invited_by: null,
      joined_at: '2024-01-15T00:00:00.000Z',
      created_at: '2024-01-15T00:00:00.000Z',
      updated_at: '2024-01-15T00:00:00.000Z'
    }
  },
  {
    id: 'org-rest-1',
    name: 'Bella Vista Italian Bistro',
    slug: 'bella-vista-bistro',
    email: 'reservations@bellavista.com',
    phone: '(555) 456-7890',
    website: 'https://bellavistabistro.com',
    logo_url: '/logos/bella-vista.png',
    address: {
      street: '789 Pine Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94108'
    },
    industry: 'rest',
    timezone: 'America/Los_Angeles',
    currency: 'USD',
    settings: {
      business_hours: {
        monday: { open: '00:00', close: '00:00', closed: true },
        tuesday: { open: '17:00', close: '22:00', closed: false },
        wednesday: { open: '17:00', close: '22:00', closed: false },
        thursday: { open: '17:00', close: '22:00', closed: false },
        friday: { open: '17:00', close: '23:00', closed: false },
        saturday: { open: '16:00', close: '23:00', closed: false },
        sunday: { open: '16:00', close: '22:00', closed: false }
      },
      cuisine_type: 'Italian',
      seating_capacity: 120,
      reservation_system: true,
      delivery: false,
      takeout: true,
      license_number: 'CA-FB-345678',
      services: [
        'Fine dining',
        'Catering',
        'Private events',
        'Wine tastings',
        'Cooking classes'
      ]
    },
    subscription_tier: 'enterprise',
    subscription_status: 'active',
    trial_ends_at: null,
    is_active: true,
    created_at: '2024-02-01T00:00:00.000Z',
    updated_at: '2024-12-01T00:00:00.000Z',
    membership: {
      id: 'mem-rest-1',
      organization_id: 'org-rest-1',
      user_id: 'mock-user-1',
      role: 'owner',
      permissions: { all: true },
      status: 'active',
      invited_by: null,
      joined_at: '2024-02-01T00:00:00.000Z',
      created_at: '2024-02-01T00:00:00.000Z',
      updated_at: '2024-02-01T00:00:00.000Z'
    }
  },
  {
    id: 'org-ret-1',
    name: 'TechStyle Boutique',
    slug: 'techstyle-boutique',
    email: 'hello@techstyle.com',
    phone: '(555) 321-0987',
    website: 'https://techstyleboutique.com',
    logo_url: '/logos/techstyle.png',
    address: {
      street: '321 Fashion Ave',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94109'
    },
    industry: 'ret',
    timezone: 'America/Los_Angeles',
    currency: 'USD',
    settings: {
      business_hours: {
        monday: { open: '10:00', close: '20:00', closed: false },
        tuesday: { open: '10:00', close: '20:00', closed: false },
        wednesday: { open: '10:00', close: '20:00', closed: false },
        thursday: { open: '10:00', close: '21:00', closed: false },
        friday: { open: '10:00', close: '21:00', closed: false },
        saturday: { open: '09:00', close: '21:00', closed: false },
        sunday: { open: '11:00', close: '19:00', closed: false }
      },
      store_type: 'Fashion Boutique',
      online_store: true,
      curbside_pickup: true,
      personal_shopping: true,
      license_number: 'CA-RT-567890',
      services: [
        'Fashion retail',
        'Personal styling',
        'Custom alterations',
        'Wardrobe consulting'
      ]
    },
    subscription_tier: 'basic',
    subscription_status: 'active',
    trial_ends_at: null,
    is_active: true,
    created_at: '2024-03-01T00:00:00.000Z',
    updated_at: '2024-12-01T00:00:00.000Z',
    membership: {
      id: 'mem-ret-1',
      organization_id: 'org-ret-1',
      user_id: 'mock-user-1',
      role: 'owner',
      permissions: { all: true },
      status: 'active',
      invited_by: null,
      joined_at: '2024-03-01T00:00:00.000Z',
      created_at: '2024-03-01T00:00:00.000Z',
      updated_at: '2024-03-01T00:00:00.000Z'
    }
  }
];

// Mock business directory submissions (for the business directory feature)
export const MOCK_BUSINESS_SUBMISSIONS = [
  {
    id: 'bus-1',
    business_name: 'ProFix Plumbing Solutions',
    business_category: 'hs',
    primary_phone: '(555) 123-4567',
    primary_email: 'info@profixplumbing.com',
    website_url: 'https://profixplumbing.com',
    address_line_1: '123 Main Street',
    city: 'San Francisco',
    state_province: 'CA',
    postal_code: '94102',
    service_area: '25',
    business_description: 'Professional plumbing services for residential and commercial properties. 24/7 emergency service, licensed and insured.',
    primary_services: 'Emergency repairs, pipe installation, drain cleaning, water heater repair, bathroom remodeling',
    years_in_business: 8,
    team_size: 12,
    is_licensed: true,
    is_insured: true,
    offers_emergency_service: true,
    license_number: 'CA-PL-123456',
    insurance_provider: 'State Farm',
    insurance_amount: '$2,000,000',
    tax_id: '12-3456789',
    verification_status: 'verified',
    verification_score: 0.95,
    submission_status: 'approved',
    user_id: 'mock-user-1',
    facebook_url: 'https://facebook.com/profixplumbing',
    instagram_url: 'https://instagram.com/profixplumbing',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-12-01T00:00:00.000Z'
  },
  {
    id: 'bus-2',
    business_name: 'Downtown Auto Repair',
    business_category: 'auto',
    primary_phone: '(555) 987-6543',
    primary_email: 'contact@downtownauto.com',
    website_url: 'https://downtownauto.com',
    address_line_1: '456 Oak Avenue',
    city: 'San Francisco',
    state_province: 'CA',
    postal_code: '94103',
    service_area: '15',
    business_description: 'Full-service auto repair shop specializing in foreign and domestic vehicles. ASE certified technicians.',
    primary_services: 'Oil changes, brake repair, transmission service, engine diagnostics, tire installation',
    years_in_business: 15,
    team_size: 8,
    is_licensed: true,
    is_insured: true,
    offers_emergency_service: false,
    license_number: 'CA-AR-789012',
    insurance_provider: 'Allstate',
    insurance_amount: '$1,500,000',
    tax_id: '98-7654321',
    verification_status: 'verified',
    verification_score: 0.92,
    submission_status: 'approved',
    user_id: 'mock-user-1',
    created_at: '2024-01-15T00:00:00.000Z',
    updated_at: '2024-12-01T00:00:00.000Z'
  },
  {
    id: 'bus-3',
    business_name: 'Bella Vista Italian Bistro',
    business_category: 'rest',
    primary_phone: '(555) 456-7890',
    primary_email: 'reservations@bellavista.com',
    website_url: 'https://bellavistabistro.com',
    address_line_1: '789 Pine Street',
    city: 'San Francisco',
    state_province: 'CA',
    postal_code: '94108',
    business_description: 'Authentic Italian cuisine in the heart of downtown. Fresh pasta made daily, extensive wine selection.',
    primary_services: 'Fine dining, catering, private events, wine tastings, cooking classes',
    years_in_business: 6,
    team_size: 25,
    is_licensed: true,
    is_insured: true,
    offers_emergency_service: false,
    license_number: 'CA-FB-345678',
    insurance_provider: 'Progressive',
    insurance_amount: '$1,000,000',
    tax_id: '55-4433221',
    verification_status: 'verified',
    verification_score: 0.88,
    submission_status: 'approved',
    user_id: 'mock-user-1',
    facebook_url: 'https://facebook.com/bellavistabistro',
    instagram_url: 'https://instagram.com/bellavistabistro',
    created_at: '2024-02-01T00:00:00.000Z',
    updated_at: '2024-12-01T00:00:00.000Z'
  },
  {
    id: 'bus-4',
    business_name: 'TechStyle Boutique',
    business_category: 'ret',
    primary_phone: '(555) 321-0987',
    primary_email: 'hello@techstyle.com',
    website_url: 'https://techstyleboutique.com',
    address_line_1: '321 Fashion Ave',
    city: 'San Francisco',
    state_province: 'CA',
    postal_code: '94109',
    business_description: 'Modern fashion boutique featuring sustainable and tech-integrated clothing for the modern professional.',
    primary_services: 'Fashion retail, personal styling, custom alterations, wardrobe consulting',
    years_in_business: 3,
    team_size: 6,
    is_licensed: true,
    is_insured: true,
    offers_emergency_service: false,
    license_number: 'CA-RT-567890',
    insurance_provider: 'Travelers',
    insurance_amount: '$500,000',
    tax_id: '77-8899001',
    verification_status: 'pending',
    verification_score: 0.75,
    submission_status: 'pending_review',
    user_id: 'mock-user-1',
    instagram_url: 'https://instagram.com/techstyleboutique',
    created_at: '2024-03-01T00:00:00.000Z',
    updated_at: '2024-12-01T00:00:00.000Z'
  }
];

// Trust badges for businesses
export const MOCK_TRUST_BADGES = [
  {
    id: 'badge-1',
    business_id: 'bus-1',
    badge_type: 'verification',
    badge_name: 'Identity Verified',
    badge_description: 'Business identity verified through government databases',
    verification_level: 'verified',
    verification_date: '2024-01-01T00:00:00.000Z',
    verification_source: 'persona_api',
    verification_data: { score: 0.95, method: 'document_review' },
    is_active: true,
    display_order: 1
  },
  {
    id: 'badge-2',
    business_id: 'bus-1',
    badge_type: 'license',
    badge_name: 'Licensed Professional',
    badge_description: 'Valid business license verified with state authorities',
    verification_level: 'verified',
    verification_date: '2024-01-01T00:00:00.000Z',
    verification_source: 'middesk_api',
    verification_data: { license_status: 'active', issuing_state: 'CA' },
    is_active: true,
    display_order: 2
  },
  {
    id: 'badge-3',
    business_id: 'bus-1',
    badge_type: 'insurance',
    badge_name: 'Insured Business',
    badge_description: 'Current liability insurance verified',
    verification_level: 'verified',
    verification_date: '2024-01-01T00:00:00.000Z',
    expiration_date: '2025-01-01T00:00:00.000Z',
    verification_source: 'axle_api',
    verification_data: { coverage_amount: '$2,000,000', policy_status: 'active' },
    is_active: true,
    display_order: 3
  }
];

// Helper functions for mock data
export const getMockOrganizationsForUser = (userId: string = 'mock-user-1'): OrganizationWithMembership[] => {
  return MOCK_ORGANIZATIONS.filter(org => org.membership?.user_id === userId);
};

export const getMockOrganizationById = (id: string): OrganizationWithMembership | null => {
  return MOCK_ORGANIZATIONS.find(org => org.id === id) || null;
};

export const getMockOrganizationBySlug = (slug: string): OrganizationWithMembership | null => {
  return MOCK_ORGANIZATIONS.find(org => org.slug === slug) || null;
};

export const getMockOrganizationsByIndustry = (industry: string): OrganizationWithMembership[] => {
  return MOCK_ORGANIZATIONS.filter(org => org.industry === industry);
};