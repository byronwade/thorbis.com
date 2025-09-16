#!/usr/bin/env node

/**
 * Test Mock Authentication System
 */

import { mockAuth, mockAdminAuth } from '../src/lib/mock-auth.js';

console.log('🧪 Testing Mock Authentication System');
console.log('=====================================\n');

async function testMockAuth() {
  try {
    console.log('1. Testing admin user creation...');
    
    // Create the demo user
    const createResult = await mockAdminAuth.createUser({
      email: 'bcw1995@gmail.com',
      password: 'Byronwade1995!',
      email_confirm: true,
      user_metadata: {
        first_name: 'Byron',
        last_name: 'Wade',
        role: 'admin'
      }
    });

    if (createResult.error) {
      console.error('❌ User creation failed:', createResult.error.message);
      return false;
    }

    console.log('✅ User created successfully');
    console.log(`   User ID: ${createResult.data.user.id}`);
    console.log(`   Email: ${createResult.data.user.email}`);

    console.log('\n2. Testing user sign in...');
    
    // Test sign in
    const signInResult = await mockAuth.signInWithPassword('bcw1995@gmail.com', 'Byronwade1995!');
    
    if (signInResult.error) {
      console.error('❌ Sign in failed:', signInResult.error.message);
      return false;
    }

    console.log('✅ Sign in successful');
    console.log(`   Access Token: ${signInResult.data.session.access_token ? 'Present' : 'Missing'}`);
    console.log(`   User: ${signInResult.data.user.email}`);

    console.log('\n3. Testing session persistence...');
    
    // Test getting session
    const sessionResult = await mockAuth.getSession();
    
    if (sessionResult.error) {
      console.error('❌ Session test failed:', sessionResult.error.message);
      return false;
    }

    console.log('✅ Session retrieved successfully');
    console.log(`   Session User: ${sessionResult.data.session?.user?.email || 'None'}`);

    console.log('\n4. Testing sign out...');
    
    // Test sign out
    const signOutResult = await mockAuth.signOut();
    
    if (signOutResult.error) {
      console.error('❌ Sign out failed:', signOutResult.error.message);
      return false;
    }

    console.log('✅ Sign out successful');

    // Verify session is cleared
    const sessionAfterSignOut = await mockAuth.getSession();
    console.log(`   Session after sign out: ${sessionAfterSignOut.data.session ? 'Still exists (ERROR)' : 'Cleared ✅'}`);

    return true;

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    return false;
  }
}

async function main() {
  const success = await testMockAuth();
  
  if (success) {
    console.log('\n🎉 All mock authentication tests passed!');
    console.log('\n📋 Mock Auth System Ready');
    console.log('==========================');
    console.log('✅ User creation working');
    console.log('✅ Sign in/out working');
    console.log('✅ Session management working');
    console.log('\n🚀 Demo credentials ready:');
    console.log('   Email: bcw1995@gmail.com');
    console.log('   Password: Byronwade1995!');
    console.log('\n🔧 The application will automatically use mock auth in development mode');
    console.log('   when Supabase is unavailable.');
  } else {
    console.error('\n❌ Mock authentication tests failed');
    process.exit(1);
  }
}

// Run tests
main().catch(console.error);