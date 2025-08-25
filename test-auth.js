#!/usr/bin/env node

// Test script to verify Supabase authentication setup
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testAuth() {
  console.log('🔍 Testing Supabase Authentication Setup...\n');

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('📋 Environment Variables:');
  console.log('  NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.log('  NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing');
  console.log('  SUPABASE_SERVICE_ROLE_KEY:', serviceRoleKey ? '✅ Set' : '❌ Missing');
  console.log('');

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing required environment variables');
    process.exit(1);
  }

  try {
    // Test client connection
    console.log('🔗 Testing Supabase client connection...');
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Test basic connection
    const { data, error } = await supabase.from('users').select('count').limit(1).maybeSingle();
    
    if (error) {
      console.log('⚠️  Connection test result:', error.message);
      if (error.message.includes('JWT')) {
        console.log('💡 This might be expected if RLS policies are strict');
      }
    } else {
      console.log('✅ Supabase client connection successful');
    }

    // Test auth session
    console.log('\n🔐 Testing auth session...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.log('⚠️  Session test result:', sessionError.message);
    } else {
      console.log('✅ Auth session test completed');
      console.log('   Has session:', !!sessionData.session);
      if (sessionData.session) {
        console.log('   User ID:', sessionData.session.user.id);
        console.log('   Expires at:', sessionData.session.expires_at);
      }
    }

    console.log('\n🎉 Authentication setup test completed!');
    console.log('📝 Next steps:');
    console.log('   1. Start your Next.js dev server: npm run dev');
    console.log('   2. Visit http://localhost:3000/login');
    console.log('   3. Try logging in with your credentials');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testAuth();
