#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Optimizing development environment...\n');

// Clean up caches
const cacheDirs = [
  '.next/cache',
  'node_modules/.cache',
  '.turbo',
  'dist',
  'build'
];

console.log('🧹 Cleaning caches...');
cacheDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    try {
      fs.rmSync(dir, { recursive: true, force: true });
      console.log(`  ✓ Cleaned ${dir}`);
    } catch (error) {
      console.log(`  ⚠️  Could not clean ${dir}: ${error.message}`);
    }
  }
});

// Clear TypeScript build info
if (fs.existsSync('tsconfig.tsbuildinfo')) {
  fs.unlinkSync('tsconfig.tsbuildinfo');
  console.log('  ✓ Cleaned TypeScript build info');
}

// Clear Bun cache if using Bun
if (process.env.npm_execpath?.includes('bun')) {
  try {
    execSync('bun pm cache rm', { stdio: 'inherit' });
    console.log('  ✓ Cleaned Bun cache');
  } catch (error) {
    console.log('  ⚠️  Could not clean Bun cache');
  }
}

// Clear npm cache if using npm
if (process.env.npm_execpath?.includes('npm')) {
  try {
    execSync('npm cache clean --force', { stdio: 'inherit' });
    console.log('  ✓ Cleaned npm cache');
  } catch (error) {
    console.log('  ⚠️  Could not clean npm cache');
  }
}

console.log('\n✨ Development environment optimized!');
console.log('\n💡 Tips for faster development:');
console.log('  • Use "npm run dev" (with Turbopack enabled)');
console.log('  • Keep your terminal focused on the dev server');
console.log('  • Avoid running multiple dev servers simultaneously');
console.log('  • Consider using Bun instead of npm for faster package management');
console.log('  • Run this script periodically to clean caches');
