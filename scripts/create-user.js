#!/usr/bin/env node

/**
 * User Creation Script for Thorbis Business OS
 * Creates a user account with the specified email and password using Supabase
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env.local') });

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createUser(email, password, additionalData = {}) {
  try {
    console.log(`🚀 Creating user: ${email}`);
    
    // Create the user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Skip email confirmation for local development
      user_metadata: {
        first_name: additionalData.firstName || 'Byron',
        last_name: additionalData.lastName || 'Wade',
        role: additionalData.role || 'admin',
        ...additionalData
      }
    });

    if (authError) {
      console.error('❌ Auth error:', authError.message);
      return false;
    }

    console.log('✅ User created in auth.users:', authData.user.id);

    // The user profile should be created automatically by the database trigger
    // Let's verify it was created
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait a bit for trigger to execute

    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.log('⚠️  Profile not created automatically, creating manually...');
      
      // Create profile manually
      const { data: manualProfile, error: manualError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          email: email,
          first_name: additionalData.firstName || 'Byron',
          last_name: additionalData.lastName || 'Wade',
          phone: additionalData.phone || null,
          metadata: {
            role: additionalData.role || 'admin',
            created_via: 'script'
          },
          profile_completed: true,
          terms_accepted_at: new Date().toISOString()
        })
        .select()
        .single();

      if (manualError) {
        console.error('❌ Error creating profile:', manualError.message);
        return false;
      }

      console.log('✅ User profile created manually');
      return { user: authData.user, profile: manualProfile };
    } else {
      console.log('✅ User profile created automatically');
      return { user: authData.user, profile: profileData };
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

async function createSampleBusinesses(userId) {
  console.log('🏢 Creating sample business data...');
  
  const businesses = [
    {
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
      user_id: userId,
      facebook_url: 'https://facebook.com/profixplumbing',
      instagram_url: 'https://instagram.com/profixplumbing'
    },
    {
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
      user_id: userId
    },
    {
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
      user_id: userId,
      facebook_url: 'https://facebook.com/bellavistabistro',
      instagram_url: 'https://instagram.com/bellavistabistro'
    },
    {
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
      user_id: userId,
      instagram_url: 'https://instagram.com/techstyleboutique'
    }
  ];

  for (const business of businesses) {
    try {
      const { data, error } = await supabase
        .from('business_directory_submissions')
        .insert(business)
        .select()
        .single();

      if (error) {
        console.error(`❌ Error creating business ${business.business_name}:`, error.message);
      } else {
        console.log(`✅ Created business: ${business.business_name} (${data.id})`);
        
        // Add some trust badges for verified businesses
        if (business.verification_status === 'verified') {
          await createTrustBadges(data.id, business.business_category);
        }
      }
    } catch (error) {
      console.error(`❌ Error creating business ${business.business_name}:`, error.message);
    }
  }
}

async function createTrustBadges(businessId, category) {
  const badges = [
    {
      business_id: businessId,
      badge_type: 'verification',
      badge_name: 'Identity Verified',
      badge_description: 'Business identity verified through government databases',
      verification_level: 'verified',
      verification_date: new Date().toISOString(),
      verification_source: 'persona_api',
      verification_data: { score: 0.95, method: 'document_review' },
      display_order: 1
    },
    {
      business_id: businessId,
      badge_type: 'license',
      badge_name: 'Licensed Professional',
      badge_description: 'Valid business license verified with state authorities',
      verification_level: 'verified',
      verification_date: new Date().toISOString(),
      verification_source: 'middesk_api',
      verification_data: { license_status: 'active', issuing_state: 'CA' },
      display_order: 2
    },
    {
      business_id: businessId,
      badge_type: 'insurance',
      badge_name: 'Insured Business',
      badge_description: 'Current liability insurance verified',
      verification_level: 'verified',
      verification_date: new Date().toISOString(),
      expiration_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
      verification_source: 'axle_api',
      verification_data: { coverage_amount: '$2,000,000', policy_status: 'active' },
      display_order: 3
    }
  ];

  for (const badge of badges) {
    try {
      const { error } = await supabase
        .from('business_trust_badges')
        .insert(badge);

      if (error) {
        console.error(`❌ Error creating badge ${badge.badge_name}:`, error.message);
      } else {
        console.log(`✅ Added trust badge: ${badge.badge_name}`);
      }
    } catch (error) {
      console.error(`❌ Error creating badge ${badge.badge_name}:`, error.message);
    }
  }
}

// Main execution
async function main() {
  console.log('🔧 Thorbis Business OS - User Creation Script');
  console.log('===============================================\n');

  // Create the main user
  const result = await createUser('bcw1995@gmail.com', 'Byronwade1995!', {
    firstName: 'Byron',
    lastName: 'Wade',
    role: 'admin',
    phone: '(555) 123-4567'
  });

  if (!result) {
    console.error('❌ Failed to create user');
    process.exit(1);
  }

  console.log('\n✅ User created successfully!');
  console.log(`   User ID: ${result.user.id}`);
  console.log(`   Email: ${result.user.email}`);
  console.log(`   Profile ID: ${result.profile.id}\n`);

  // Create sample business data
  await createSampleBusinesses(result.user.id);

  console.log('\n🎉 Setup completed successfully!');
  console.log('You can now sign in with:');
  console.log('  Email: bcw1995@gmail.com');
  console.log('  Password: Byronwade1995!');
  console.log('\nLocal Supabase Dashboard: http://127.0.0.1:54323');
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the script
main().catch(console.error);