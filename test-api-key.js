#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase API Key...\n');
console.log('📋 Environment Variables:');
console.log('  URL:', supabaseUrl);
console.log('  API Key (first 20 chars):', supabaseAnonKey?.substring(0, 20) + '...' );
console.log('');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testApiKey() {
  console.log('1️⃣ Testing basic connection...');
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.log('❌ API Key Error:', error.message);
      console.log('   Error type:', error.name);
      console.log('   Error status:', error.status);
      
      if (error.message.includes('Invalid API key')) {
        console.log('\n💡 This means your API key is invalid or expired');
        console.log('📝 Next steps:');
        console.log('   1. Go to https://supabase.com/dashboard');
        console.log('   2. Select your project');
        console.log('   3. Go to Settings > API');
        console.log('   4. Copy the "anon public" key');
        console.log('   5. Update your .env.local file');
      }
    } else {
      console.log('✅ API Key is valid!');
      console.log('   Session check completed');
    }
  } catch (err) {
    console.log('❌ Unexpected error:', err.message);
  }

  console.log('\n2️⃣ Testing auth endpoint directly...');
  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/session`, {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('   Response status:', response.status);
    console.log('   Response ok:', response.ok);
    
    if (!response.ok) {
      const text = await response.text();
      console.log('   Error response:', text);
    }
  } catch (err) {
    console.log('❌ Fetch error:', err.message);
  }
}

testApiKey().catch(console.error);
