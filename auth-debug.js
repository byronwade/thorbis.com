#!/usr/bin/env node

// Authentication debug script
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔧 Creating Supabase client...');
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  }
});

console.log('🔍 Testing basic auth methods...');

// Test 1: Check if we can get session
async function testSession() {
  console.log('\n1️⃣ Testing session retrieval...');
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.log('❌ Session error:', error.message);
    } else {
      console.log('✅ Session retrieved successfully');
      console.log('   Has session:', !!data.session);
      if (data.session) {
        console.log('   User:', data.session.user.email);
        console.log('   Expires:', new Date(data.session.expires_at * 1000));
      }
    }
  } catch (err) {
    console.log('❌ Session test failed:', err.message);
  }
}

// Test 2: Check if we can make a simple query
async function testQuery() {
  console.log('\n2️⃣ Testing database connection...');
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) {
      console.log('❌ Query error:', error.message);
      console.log('💡 This might be due to RLS policies - not necessarily a problem');
    } else {
      console.log('✅ Query executed successfully');
    }
  } catch (err) {
    console.log('❌ Query test failed:', err.message);
  }
}

// Test 3: Check auth configuration
async function testAuthConfig() {
  console.log('\n3️⃣ Testing auth configuration...');
  try {
    // This will test if the client is configured properly
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.log('⚠️  Auth config warning:', error.message);
    } else {
      console.log('✅ Auth client created successfully');
      console.log('   Current user:', data.user?.email || 'None');
    }
  } catch (err) {
    console.log('❌ Auth config test failed:', err.message);
  }
}

async function runTests() {
  console.log('🚀 Running authentication diagnostics...\n');
  
  await testAuthConfig();
  await testSession();
  await testQuery();
  
  console.log('\n🎯 Diagnostics complete!');
  console.log('\n📋 Recommendations:');
  console.log('   • If session test fails, check your environment variables');
  console.log('   • If query test fails, check your database RLS policies');
  console.log('   • Try visiting http://localhost:3000/login to test the UI');
}

runTests().catch(console.error);
