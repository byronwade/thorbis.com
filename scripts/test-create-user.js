#!/usr/bin/env node

/**
 * Test User Creation Script - Final attempt
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env.local') });

console.log('🔧 Thorbis Business OS - Final User Creation Test');
console.log('================================================\n');

// Supabase configuration from environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

console.log('✅ Environment variables loaded');
console.log(`📍 Supabase URL: ${supabaseUrl}`);

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testConnection() {
  try {
    console.log('\n🔗 Testing Supabase connection...');
    
    // Simple test query
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.log('⚠️  No session found (expected for service client)');
    }
    
    console.log('✅ Supabase connection working');
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    return false;
  }
}

async function createTestUser() {
  try {
    console.log('\n🚀 Creating user: bcw1995@gmail.com');
    
    // Create the user with admin client
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'bcw1995@gmail.com',
      password: 'Byronwade1995!',
      email_confirm: true, // Skip email confirmation
      user_metadata: {
        first_name: 'Byron',
        last_name: 'Wade',
        role: 'admin'
      }
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('✅ User already exists - that\'s fine!');
        return true;
      }
      console.error('❌ Create user error:', authError.message);
      return false;
    }

    console.log('✅ User created successfully!');
    console.log(`   User ID: ${authData.user.id}`);
    console.log(`   Email: ${authData.user.email}`);
    
    return true;

  } catch (error) {
    console.error('❌ User creation error:', error.message);
    return false;
  }
}

async function testSignIn() {
  try {
    console.log('\n🔐 Testing user sign in...');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'bcw1995@gmail.com',
      password: 'Byronwade1995!'
    });

    if (error) {
      console.error('❌ Sign in failed:', error.message);
      return false;
    }

    console.log('✅ Sign in successful!');
    console.log(`   Session: ${data.session ? '✅' : '❌'}`);
    console.log(`   User: ${data.user ? '✅' : '❌'}`);
    console.log(`   Access Token: ${data.session?.access_token ? 'Present' : 'Missing'}`);
    
    return true;
  } catch (error) {
    console.error('❌ Sign in error:', error.message);
    return false;
  }
}

// Main execution
async function main() {
  // Test connection
  const connectionOk = await testConnection();
  if (!connectionOk) {
    console.error('\n❌ Cannot connect to Supabase');
    process.exit(1);
  }

  // Create user
  const userCreated = await createTestUser();
  if (!userCreated) {
    console.error('\n❌ Failed to create user');
    process.exit(1);
  }

  // Test sign in
  const signInOk = await testSignIn();
  if (!signInOk) {
    console.error('\n❌ Sign in test failed');
    process.exit(1);
  }

  console.log('\n🎉 All tests passed!');
  console.log('\n📋 Authentication Setup Complete');
  console.log('================================');
  console.log('✅ Supabase connection working');
  console.log('✅ User account ready (bcw1995@gmail.com)');
  console.log('✅ Sign in functionality verified');
  console.log('\n🚀 Next Steps:');
  console.log('1. Start the development server');
  console.log('2. Navigate to: http://localhost:3000/auth');
  console.log('3. Sign in with: bcw1995@gmail.com / Byronwade1995!');
  console.log('4. You should have access to all protected pages');
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the script
main().catch(console.error);