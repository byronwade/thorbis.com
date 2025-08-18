#!/usr/bin/env node

/**
 * Test script to verify Vercel Web Analytics feature flag integration
 * Run this script to validate that flags are properly configured
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Vercel Web Analytics Feature Flag Integration...\n');

// Test 1: Check if required files exist
console.log('📁 Checking required files...');
const requiredFiles = [
  'src/lib/flags/analytics.ts',
  'src/app/api/flags/route.ts',
  'src/components/shared/vercel-flag-tracker.js',
  'src/lib/flags/definitions.ts',
  'src/lib/flags/server.ts'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Some required files are missing. Please ensure all files are created.');
  process.exit(1);
}

// Test 2: Check if API endpoint works
console.log('\n🌐 Testing flags API endpoint...');
try {
  // Start the development server in the background for testing
  console.log('Starting development server...');
  const child = execSync('bun run dev > /dev/null 2>&1 & echo $!', { 
    encoding: 'utf8',
    timeout: 5000 
  });
  
  const pid = child.trim();
  console.log(`Development server started with PID: ${pid}`);
  
  // Wait a moment for server to start
  setTimeout(async () => {
    try {
      const response = await fetch('http://localhost:3000/api/flags');
      const data = await response.json();
      
      if (response.ok && data.flags) {
        console.log(`✅ API endpoint working - Found ${Object.keys(data.flags).length} flags`);
        console.log('📊 Active flags:', Object.entries(data.flags).filter(([k, v]) => v).map(([k]) => k).join(', '));
      } else {
        console.log('❌ API endpoint returned error:', data);
      }
    } catch (error) {
      console.log('❌ Failed to test API endpoint:', error.message);
    }
    
    // Clean up - kill the dev server
    try {
      execSync(`kill ${pid}`);
      console.log('🧹 Development server stopped');
    } catch (e) {
      // Server might already be stopped
    }
  }, 3000);
  
} catch (error) {
  console.log('❌ Failed to start development server for testing');
}

// Test 3: Validate flag definitions
console.log('\n🏁 Checking flag definitions...');
try {
  const flagsContent = fs.readFileSync('src/lib/flags/definitions.ts', 'utf8');
  
  // Count flags
  const flagMatches = flagsContent.match(/export const \w+Flag = flag/g);
  const flagCount = flagMatches ? flagMatches.length : 0;
  
  console.log(`✅ Found ${flagCount} flag definitions`);
  
  // Check if flags are exported
  if (flagsContent.includes('export const flags = {')) {
    console.log('✅ Flags are properly exported');
  } else {
    console.log('❌ Flags export object not found');
  }
  
} catch (error) {
  console.log('❌ Failed to read flag definitions:', error.message);
}

// Test 4: Check package.json for required dependencies
console.log('\n📦 Checking dependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const requiredDeps = ['@vercel/analytics', '@vercel/flags', '@vercel/edge-config'];
  
  requiredDeps.forEach(dep => {
    if (deps[dep]) {
      console.log(`✅ ${dep}: ${deps[dep]}`);
    } else {
      console.log(`❌ ${dep} - NOT INSTALLED`);
      console.log(`   Run: bun add ${dep}`);
    }
  });
  
} catch (error) {
  console.log('❌ Failed to check dependencies:', error.message);
}

// Test 5: Environment variables check
console.log('\n🌍 Environment setup...');
console.log('⚠️  Make sure you have configured these in your Vercel project:');
console.log('   - EDGE_CONFIG (Vercel Edge Config URL)');
console.log('   - Feature flags in Edge Config with keys like: feature:flag-name');
console.log('   - Vercel Web Analytics enabled in your project settings');

console.log('\n🎯 Next steps to complete the setup:');
console.log('1. Deploy your changes to Vercel');
console.log('2. Enable Web Analytics in your Vercel project dashboard');
console.log('3. Create an Edge Config in Vercel with your flag values');
console.log('4. Visit your deployed site and check Vercel Analytics dashboard');
console.log('5. Your flags should now appear in the "Flags" section!');

console.log('\n✨ Feature flag integration test completed!');
