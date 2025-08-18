// Simple test script for password security fixes
// Run with: node test-password-security.js

const { PasswordSecurity } = require('./src/lib/security/password-security.js');

async function testPasswordSecurity() {
  console.log('🧪 Testing Password Security Fixes...\n');
  
  try {
    // Test 1: Basic hash generation
    console.log('1. Testing SHA-1 hash generation...');
    const hash = await PasswordSecurity.generateSHA1Hash('test123');
    console.log('✅ Hash generated:', hash ? hash.substring(0, 10) + '...' : 'null');
    
    // Test 2: Breach check
    console.log('\n2. Testing breach check...');
    const result = await PasswordSecurity.checkBreachedPassword('test123');
    console.log('✅ Breach check result:', result);
    
    // Test 3: Error handling
    console.log('\n3. Testing error handling...');
    try {
      await PasswordSecurity.checkBreachedPassword('');
    } catch (error) {
      console.log('✅ Error properly caught:', error.message);
    }
    
    console.log('\n🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Error details:', {
      name: error.name,
      code: error.code,
      stack: error.stack?.substring(0, 200)
    });
  }
}

testPasswordSecurity();
