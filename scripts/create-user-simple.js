#!/usr/bin/env node

/**
 * Simple User Creation Script for Thorbis Business OS
 * Creates a user account using Supabase Auth (no custom tables required)
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env.local') });

console.log('🔧 Thorbis Business OS - Simple User Creation Script');
console.log('====================================================\n');

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  console.log('\nMake sure your .env.local contains:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
  process.exit(1);
}

console.log('✅ Environment variables loaded');
console.log(`📍 Supabase URL: ${supabaseUrl}`);

// Create Supabase admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createUser() {
  try {
    console.log('\n🚀 Creating user: bcw1995@gmail.com');
    
    // Create the user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'bcw1995@gmail.com',
      password: 'Byronwade1995!',
      email_confirm: true, // Skip email confirmation for development
      user_metadata: {
        first_name: 'Byron',
        last_name: 'Wade',
        role: 'admin'
      }
    });

    if (authError) {
      console.error('❌ Auth error:', authError.message);
      return false;
    }

    console.log('✅ User created in auth.users successfully!');
    console.log(`   User ID: ${authData.user.id}`);
    console.log(`   Email: ${authData.user.email}`);
    console.log(`   Email Confirmed: ${authData.user.email_confirmed_at ? 'Yes' : 'No'}`);
    
    return authData.user;

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

async function testSignIn() {
  console.log('\n🔐 Testing sign in...');
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'bcw1995@gmail.com',
      password: 'Byronwade1995!'
    });

    if (error) {
      console.error('❌ Sign in failed:', error.message);
      return false;
    }

    console.log('✅ Sign in successful!');
    console.log(`   Session created: ${data.session ? 'Yes' : 'No'}`);
    console.log(`   Access token: ${data.session?.access_token ? '✅' : '❌'}`);
    
    return true;
  } catch (error) {
    console.error('❌ Sign in error:', error.message);
    return false;
  }
}

// Main execution
async function main() {
  // Create the user
  const user = await createUser();
  
  if (!user) {
    console.error('\n❌ Failed to create user');
    process.exit(1);
  }

  // Test sign in
  await testSignIn();

  console.log('\n🎉 Setup completed successfully!');
  console.log('You can now sign in with:');
  console.log('  Email: bcw1995@gmail.com');
  console.log('  Password: Byronwade1995!');
  console.log('\n📱 Try it at: http://localhost:3000/auth');
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the script
main().catch(console.error);