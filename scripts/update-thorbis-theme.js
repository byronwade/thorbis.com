#!/usr/bin/env node

/**
 * Thorbis Theme Update Script
 * Updates all files to follow the Thorbis theme: Clean Black, White, Blue, and Neutral Colors
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Color replacement mappings
const colorReplacements = {
  // Hard-coded hex colors to CSS variables
  '#3B82F6': 'hsl(var(--primary))',
  '#000000': 'hsl(var(--background))',
  '#121212': 'hsl(var(--background))',
  '#0a0a0a': 'hsl(var(--card))',
  '#171717': 'hsl(var(--card))',
  '#f6f7fb': 'hsl(var(--muted))',
  '#F6F7FB': 'hsl(var(--muted))',
  '#ffffff': 'hsl(var(--foreground))',
  '#EAEAEA': 'hsl(var(--foreground))',
  '#374151': 'hsl(var(--border))',
  '#6B7280': 'hsl(var(--muted-foreground))',
  
  // Success colors
  '#10B981': 'hsl(var(--success))',
  '#10b981': 'hsl(var(--success))',
  '#059669': 'hsl(var(--success))',
  '#047857': 'hsl(var(--success))',
  '#22c55e': 'hsl(var(--success))',
  
  // Warning colors
  '#F59E0B': 'hsl(var(--warning))',
  '#f59e0b': 'hsl(var(--warning))',
  
  // Error colors
  '#ef4444': 'hsl(var(--destructive))',
  '#dc2626': 'hsl(var(--destructive))',
  
  // Forbidden colors (purple, pink, etc.) - replace with muted-foreground
  '#8b5cf6': 'hsl(var(--muted-foreground))',
  '#7c3aed': 'hsl(var(--muted-foreground))',
  '#ec4899': 'hsl(var(--muted-foreground))',
  '#db2777': 'hsl(var(--muted-foreground))',
  '#4682B4': 'hsl(var(--primary))',
  '#FFFF00': 'hsl(var(--primary))',
  
  // Social media brand colors - replace with muted-foreground
  '#1877f2': 'hsl(var(--muted-foreground))', // Facebook
  '#1da1f2': 'hsl(var(--muted-foreground))', // Twitter
  '#5865f2': 'hsl(var(--muted-foreground))', // Discord
  '#0077b5': 'hsl(var(--muted-foreground))', // LinkedIn
  '#EA4335': 'hsl(var(--muted-foreground))', // Gmail
  '#720E9E': 'hsl(var(--muted-foreground))', // Yahoo
  '#00A4E4': 'hsl(var(--muted-foreground))', // AOL
};

// Tailwind class replacements
const classReplacements = {
  // Gray classes to semantic classes
  'bg-gray-100': 'bg-muted',
  'bg-gray-200': 'bg-muted',
  'bg-gray-300': 'bg-muted',
  'bg-gray-400': 'bg-muted',
  'bg-gray-500': 'bg-muted',
  'bg-gray-600': 'bg-muted',
  'bg-gray-700': 'bg-muted',
  'bg-gray-800': 'bg-card',
  'bg-gray-900': 'bg-card',
  'bg-gray-950': 'bg-card',
  
  'text-gray-100': 'text-muted-foreground',
  'text-gray-200': 'text-muted-foreground',
  'text-gray-300': 'text-muted-foreground',
  'text-gray-400': 'text-muted-foreground',
  'text-gray-500': 'text-muted-foreground',
  'text-gray-600': 'text-muted-foreground',
  'text-gray-700': 'text-muted-foreground',
  'text-gray-800': 'text-foreground',
  'text-gray-900': 'text-foreground',
  'text-gray-950': 'text-foreground',
  
  'border-gray-100': 'border-border',
  'border-gray-200': 'border-border',
  'border-gray-300': 'border-border',
  'border-gray-400': 'border-border',
  'border-gray-500': 'border-border',
  'border-gray-600': 'border-border',
  'border-gray-700': 'border-border',
  'border-gray-800': 'border-border',
  'border-gray-900': 'border-border',
  'border-gray-950': 'border-border',
  
  // Blue classes to primary classes
  'bg-blue-100': 'bg-primary/10',
  'bg-blue-200': 'bg-primary/20',
  'bg-blue-300': 'bg-primary/30',
  'bg-blue-400': 'bg-primary/40',
  'bg-blue-500': 'bg-primary',
  'bg-blue-600': 'bg-primary',
  'bg-blue-700': 'bg-primary',
  'bg-blue-800': 'bg-primary',
  'bg-blue-900': 'bg-primary',
  'bg-blue-950': 'bg-primary',
  
  'text-blue-100': 'text-primary/70',
  'text-blue-200': 'text-primary/80',
  'text-blue-300': 'text-primary/90',
  'text-blue-400': 'text-primary',
  'text-blue-500': 'text-primary',
  'text-blue-600': 'text-primary',
  'text-blue-700': 'text-primary',
  'text-blue-800': 'text-primary',
  'text-blue-900': 'text-primary',
  'text-blue-950': 'text-primary',
  
  'border-blue-100': 'border-primary/20',
  'border-blue-200': 'border-primary/30',
  'border-blue-300': 'border-primary/40',
  'border-blue-400': 'border-primary/50',
  'border-blue-500': 'border-primary',
  'border-blue-600': 'border-primary',
  'border-blue-700': 'border-primary',
  'border-blue-800': 'border-primary',
  'border-blue-900': 'border-primary',
  'border-blue-950': 'border-primary',
  
  // Green classes to success classes
  'bg-green-100': 'bg-success/10',
  'bg-green-200': 'bg-success/20',
  'bg-green-300': 'bg-success/30',
  'bg-green-400': 'bg-success/40',
  'bg-green-500': 'bg-success',
  'bg-green-600': 'bg-success',
  'bg-green-700': 'bg-success',
  'bg-green-800': 'bg-success',
  'bg-green-900': 'bg-success',
  'bg-green-950': 'bg-success',
  
  'text-green-100': 'text-success/70',
  'text-green-200': 'text-success/80',
  'text-green-300': 'text-success/90',
  'text-green-400': 'text-success',
  'text-green-500': 'text-success',
  'text-green-600': 'text-success',
  'text-green-700': 'text-success',
  'text-green-800': 'text-success',
  'text-green-900': 'text-success',
  'text-green-950': 'text-success',
  
  // Red classes to destructive classes
  'bg-red-100': 'bg-destructive/10',
  'bg-red-200': 'bg-destructive/20',
  'bg-red-300': 'bg-destructive/30',
  'bg-red-400': 'bg-destructive/40',
  'bg-red-500': 'bg-destructive',
  'bg-red-600': 'bg-destructive',
  'bg-red-700': 'bg-destructive',
  'bg-red-800': 'bg-destructive',
  'bg-red-900': 'bg-destructive',
  'bg-red-950': 'bg-destructive',
  
  'text-red-100': 'text-destructive/70',
  'text-red-200': 'text-destructive/80',
  'text-red-300': 'text-destructive/90',
  'text-red-400': 'text-destructive',
  'text-red-500': 'text-destructive',
  'text-red-600': 'text-destructive',
  'text-red-700': 'text-destructive',
  'text-red-800': 'text-destructive',
  'text-red-900': 'text-destructive',
  'text-red-950': 'text-destructive',
  
  // Yellow/Orange classes to warning classes
  'bg-yellow-100': 'bg-warning/10',
  'bg-yellow-200': 'bg-warning/20',
  'bg-yellow-300': 'bg-warning/30',
  'bg-yellow-400': 'bg-warning/40',
  'bg-yellow-500': 'bg-warning',
  'bg-yellow-600': 'bg-warning',
  'bg-yellow-700': 'bg-warning',
  'bg-yellow-800': 'bg-warning',
  'bg-yellow-900': 'bg-warning',
  'bg-yellow-950': 'bg-warning',
  
  'text-yellow-100': 'text-warning/70',
  'text-yellow-200': 'text-warning/80',
  'text-yellow-300': 'text-warning/90',
  'text-yellow-400': 'text-warning',
  'text-yellow-500': 'text-warning',
  'text-yellow-600': 'text-warning',
  'text-yellow-700': 'text-warning',
  'text-yellow-800': 'text-warning',
  'text-yellow-900': 'text-warning',
  'text-yellow-950': 'text-warning',
  
  'bg-orange-100': 'bg-warning/10',
  'bg-orange-200': 'bg-warning/20',
  'bg-orange-300': 'bg-warning/30',
  'bg-orange-400': 'bg-warning/40',
  'bg-orange-500': 'bg-warning',
  'bg-orange-600': 'bg-warning',
  'bg-orange-700': 'bg-warning',
  'bg-orange-800': 'bg-warning',
  'bg-orange-900': 'bg-warning',
  'bg-orange-950': 'bg-warning',
  
  'text-orange-100': 'text-warning/70',
  'text-orange-200': 'text-warning/80',
  'text-orange-300': 'text-warning/90',
  'text-orange-400': 'text-warning',
  'text-orange-500': 'text-warning',
  'text-orange-600': 'text-warning',
  'text-orange-700': 'text-warning',
  'text-orange-800': 'text-warning',
  'text-orange-900': 'text-warning',
  'text-orange-950': 'text-warning',
};

// File patterns to process
const filePatterns = [
  'src/**/*.{js,jsx,ts,tsx}',
  'src/**/*.css',
  'src/**/*.scss',
  'components/**/*.{js,jsx,ts,tsx}',
  'app/**/*.{js,jsx,ts,tsx}',
];

// Directories to exclude
const excludeDirs = [
  'node_modules',
  '.git',
  '.next',
  'dist',
  'build',
  'coverage',
  'scripts',
  'voip-popover',
];

function shouldExcludeFile(filePath) {
  return excludeDirs.some(dir => filePath.includes(dir));
}

function replaceInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    // Replace hard-coded hex colors
    for (const [oldColor, newColor] of Object.entries(colorReplacements)) {
      const regex = new RegExp(oldColor, 'g');
      if (regex.test(content)) {
        content = content.replace(regex, newColor);
        hasChanges = true;
        console.log(`  Replaced ${oldColor} with ${newColor}`);
      }
    }
    
    // Replace Tailwind classes
    for (const [oldClass, newClass] of Object.entries(classReplacements)) {
      const regex = new RegExp(`\\b${oldClass}\\b`, 'g');
      if (regex.test(content)) {
        content = content.replace(regex, newClass);
        hasChanges = true;
        console.log(`  Replaced ${oldClass} with ${newClass}`);
      }
    }
    
    // Replace hard-coded color classes with arbitrary values
    const arbitraryColorRegex = /bg-\[#[0-9a-fA-F]{3,6}\]/g;
    if (arbitraryColorRegex.test(content)) {
      content = content.replace(arbitraryColorRegex, 'bg-card');
      hasChanges = true;
      console.log(`  Replaced arbitrary background colors with bg-card`);
    }
    
    const arbitraryTextColorRegex = /text-\[#[0-9a-fA-F]{3,6}\]/g;
    if (arbitraryTextColorRegex.test(content)) {
      content = content.replace(arbitraryTextColorRegex, 'text-foreground');
      hasChanges = true;
      console.log(`  Replaced arbitrary text colors with text-foreground`);
    }
    
    const arbitraryBorderColorRegex = /border-\[#[0-9a-fA-F]{3,6}\]/g;
    if (arbitraryBorderColorRegex.test(content)) {
      content = content.replace(arbitraryBorderColorRegex, 'border-border');
      hasChanges = true;
      console.log(`  Replaced arbitrary border colors with border-border`);
    }
    
    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function findFiles(dir, patterns) {
  const files = [];
  
  function walk(currentDir) {
    if (shouldExcludeFile(currentDir)) return;
    
    try {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          walk(fullPath);
        } else if (stat.isFile()) {
          const ext = path.extname(fullPath);
          if (patterns.some(pattern => 
            pattern.includes(ext) || 
            pattern.includes('*') ||
            fullPath.match(pattern.replace('**', '.*'))
          )) {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${currentDir}:`, error.message);
    }
  }
  
  walk(dir);
  return files;
}

function main() {
  console.log('🎨 Thorbis Theme Update Script');
  console.log('================================');
  console.log('Updating all files to follow Thorbis theme rules...\n');
  
  const startTime = Date.now();
  let totalFiles = 0;
  let updatedFiles = 0;
  
  // Process files in src directory
  const srcFiles = findFiles('src', filePatterns);
  console.log(`Found ${srcFiles.length} files in src directory`);
  
  for (const file of srcFiles) {
    totalFiles++;
    if (replaceInFile(file)) {
      updatedFiles++;
    }
  }
  
  // Process files in components directory if it exists
  if (fs.existsSync('components')) {
    const componentFiles = findFiles('components', filePatterns);
    console.log(`Found ${componentFiles.length} files in components directory`);
    
    for (const file of componentFiles) {
      totalFiles++;
      if (replaceInFile(file)) {
        updatedFiles++;
      }
    }
  }
  
  // Process files in app directory if it exists
  if (fs.existsSync('app')) {
    const appFiles = findFiles('app', filePatterns);
    console.log(`Found ${appFiles.length} files in app directory`);
    
    for (const file of appFiles) {
      totalFiles++;
      if (replaceInFile(file)) {
        updatedFiles++;
      }
    }
  }
  
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  
  console.log('\n================================');
  console.log('🎨 Thorbis Theme Update Complete!');
  console.log(`📊 Processed ${totalFiles} files`);
  console.log(`✅ Updated ${updatedFiles} files`);
  console.log(`⏱️  Duration: ${duration.toFixed(2)}s`);
  console.log('\n🎯 Next Steps:');
  console.log('1. Review the changes to ensure they look correct');
  console.log('2. Test the application to verify the theme is working');
  console.log('3. Run your build process to check for any issues');
  console.log('4. Commit the changes with a descriptive message');
}

// Run the script if called directly
main();
