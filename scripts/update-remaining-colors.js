#!/usr/bin/env node

/**
 * Update Remaining Hard-Coded Colors Script
 * Updates SVG elements and other remaining hard-coded colors to follow Thorbis theme
 */

import fs from 'fs';
import path from 'path';

// Color replacement mappings
const colorReplacements = [
  // Purple colors
  { from: /bg-purple-(\d+)/g, to: 'bg-muted' },
  { from: /text-purple-(\d+)/g, to: 'text-muted-foreground' },
  { from: /border-purple-(\d+)/g, to: 'border-border' },
  
  // Cyan colors
  { from: /bg-cyan-(\d+)/g, to: 'bg-primary' },
  { from: /text-cyan-(\d+)/g, to: 'text-primary' },
  { from: /border-cyan-(\d+)/g, to: 'border-primary' },
  
  // Teal colors
  { from: /bg-teal-(\d+)/g, to: 'bg-success' },
  { from: /text-teal-(\d+)/g, to: 'text-success' },
  { from: /border-teal-(\d+)/g, to: 'border-success' },
  
  // Emerald colors
  { from: /bg-emerald-(\d+)/g, to: 'bg-success' },
  { from: /text-emerald-(\d+)/g, to: 'text-success' },
  { from: /border-emerald-(\d+)/g, to: 'border-success' },
  
  // Indigo colors
  { from: /bg-indigo-(\d+)/g, to: 'bg-primary' },
  { from: /text-indigo-(\d+)/g, to: 'text-primary' },
  { from: /border-indigo-(\d+)/g, to: 'border-primary' },
  
  // Pink colors
  { from: /bg-pink-(\d+)/g, to: 'bg-muted' },
  { from: /text-pink-(\d+)/g, to: 'text-muted-foreground' },
  { from: /border-pink-(\d+)/g, to: 'border-border' },
  
  // Orange colors
  { from: /bg-orange-(\d+)/g, to: 'bg-warning' },
  { from: /text-orange-(\d+)/g, to: 'text-warning' },
  { from: /border-orange-(\d+)/g, to: 'border-warning' },
  
  // Red colors (for errors)
  { from: /bg-red-(\d+)/g, to: 'bg-destructive' },
  { from: /text-red-(\d+)/g, to: 'text-destructive' },
  { from: /border-red-(\d+)/g, to: 'border-destructive' },
  
  // Yellow colors
  { from: /bg-yellow-(\d+)/g, to: 'bg-warning' },
  { from: /text-yellow-(\d+)/g, to: 'text-warning' },
  { from: /border-yellow-(\d+)/g, to: 'border-warning' },
  
  // Green colors
  { from: /bg-green-(\d+)/g, to: 'bg-success' },
  { from: /text-green-(\d+)/g, to: 'text-success' },
  { from: /border-green-(\d+)/g, to: 'border-success' },
  
  // Blue colors
  { from: /bg-blue-(\d+)/g, to: 'bg-primary' },
  { from: /text-blue-(\d+)/g, to: 'text-primary' },
  { from: /border-blue-(\d+)/g, to: 'border-primary' },
];

// Files to process
const filesToProcess = [
  'src/components/debug/dev-diagnostics.jsx',
  'src/app/discover/discover-client.js',
  'src/components/localhub/create-directory/directory-info.js',
  'src/features/auth/onboarding/business-address.js',
  'src/app/developers/page.js',
  'src/components/localhub/create-directory/directory-customization.js',
  'src/app/layout.js',
  'src/components/debug/RoleDebugger.jsx',
  'src/components/localhub/create-directory/directory-location.js',
  'src/features/auth/onboarding/business-verification.js',
  'src/utils/dynamic-imports.js',
  'src/components/user/header.js',
  'src/features/auth/onboarding/business-info.js',
  'src/components/site/footer.js',
  'src/components/admin/permission-manager.js',
  'src/app/localhub/page.js',
  'src/app/(auth)/dashboard/business/customer-portal/page.js',
  'src/app/(auth)/dashboard/business/customer-portal/home-services/bookings/page.js',
  'src/components/academy/questions/renderers/architecture3-d-renderer.tsx',
  // Additional files found
  'src/app/call/[id]/page.js',
  'src/app/company/page.js',
  'src/app/resources/page.js',
  'src/features/auth/account/password-reset.js',
  'src/app/help/page.js',
  'src/app/fleet/page.tsx',
  'src/features/auth/components/BusinessForm/business-form.js',
  'src/app/(landing-pages)/charity-fundraising-platform/page.js',
  'src/components/store/AppleStyleProductShowcase.js',
  'src/app/(landing-pages)/medical-office-software/page.js',
  'src/features/auth/components/SignupForm/signup.js',
  'src/app/pricing/page.js',
  'src/app/(landing-pages)/transparency/page.js'
];

function updateFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;
  
  colorReplacements.forEach(({ from, to }) => {
    const newContent = content.replace(from, to);
    if (newContent !== content) {
      content = newContent;
      updated = true;
    }
  });
  
  if (updated) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

// Process all files
filesToProcess.forEach(updateFile);

console.log('Completed updating remaining hard-coded colors');
