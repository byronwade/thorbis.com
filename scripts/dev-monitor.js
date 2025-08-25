#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('📊 Development Performance Monitor\n');

// Check if dev server is running
try {
  const response = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:3000', { encoding: 'utf8' });
  if (response.trim() === '200') {
    console.log('✅ Development server is running');
  } else {
    console.log('❌ Development server is not responding');
  }
} catch (error) {
  console.log('❌ Development server is not running');
}

// Check cache sizes
const cacheDirs = [
  { path: '.next/cache', name: 'Next.js Cache' },
  { path: 'node_modules/.cache', name: 'Node Modules Cache' },
  { path: '.turbo', name: 'Turbo Cache' }
];

console.log('\n📁 Cache Analysis:');
cacheDirs.forEach(({ path: dirPath, name }) => {
  if (fs.existsSync(dirPath)) {
    try {
      const stats = fs.statSync(dirPath);
      const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`  ${name}: ${sizeInMB} MB`);
    } catch (error) {
      console.log(`  ${name}: Unable to read`);
    }
  } else {
    console.log(`  ${name}: Not found`);
  }
});

// Check TypeScript build info
if (fs.existsSync('tsconfig.tsbuildinfo')) {
  const stats = fs.statSync('tsconfig.tsbuildinfo');
  const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`  TypeScript Build Info: ${sizeInMB} MB`);
} else {
  console.log('  TypeScript Build Info: Not found (good for performance)');
}

// Check package manager
const packageManager = process.env.npm_execpath?.includes('bun') ? 'Bun' : 
                      process.env.npm_execpath?.includes('yarn') ? 'Yarn' : 'npm';
console.log(`\n📦 Package Manager: ${packageManager}`);

// Performance recommendations
console.log('\n💡 Performance Recommendations:');

if (packageManager !== 'Bun') {
  console.log('  • Consider switching to Bun for faster package management');
}

if (fs.existsSync('tsconfig.tsbuildinfo') && fs.statSync('tsconfig.tsbuildinfo').size > 1024 * 1024) {
  console.log('  • TypeScript build info is large - run "npm run dev:clean"');
}

const nextCacheSize = fs.existsSync('.next/cache') ? 
  fs.statSync('.next/cache').size / (1024 * 1024) : 0;
if (nextCacheSize > 100) {
  console.log('  • Next.js cache is large - run "npm run dev:optimize"');
}

console.log('\n🚀 Quick Actions:');
console.log('  • "npm run dev:optimize" - Clean and optimize');
console.log('  • "npm run dev:clean" - Quick cache cleanup');
console.log('  • "npm run dev" - Start with Turbopack (fastest)');
console.log('  • "npm run dev:legacy" - Start without Turbopack (fallback)');
