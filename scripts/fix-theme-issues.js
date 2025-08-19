#!/usr/bin/env node

/**
 * Thorbis Theme Fixer
 * 
 * This script automatically fixes theme consistency issues by replacing
 * hard-coded colors with Thorbis theme CSS variables.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Thorbis theme color mappings
const THEME_FIXES = {
  // Primary brand color
  '#3B82F6': 'hsl(var(--primary))',
  
  // Background colors
  '#000000': 'hsl(var(--background))',
  '#121212': 'hsl(var(--background))',
  '#0a0a0a': 'hsl(var(--card))',
  '#171717': 'hsl(var(--card))',
  '#f6f7fb': 'hsl(var(--muted))',
  '#F6F7FB': 'hsl(var(--muted))',
  
  // Text colors
  '#ffffff': 'hsl(var(--background))',
  '#EAEAEA': 'hsl(var(--foreground))',
  '#374151': 'hsl(var(--border))',
  '#6B7280': 'hsl(var(--muted-foreground))',
  
  // Semantic colors - keep these but ensure they use theme variables
  '#10B981': 'hsl(var(--success))',
  '#10b981': 'hsl(var(--success))',
  '#059669': 'hsl(var(--success))',
  '#047857': 'hsl(var(--success))',
  '#22c55e': 'hsl(var(--success))',
  '#F59E0B': 'hsl(var(--warning))',
  '#f59e0b': 'hsl(var(--warning))',
  '#ef4444': 'hsl(var(--destructive))',
  '#dc2626': 'hsl(var(--destructive))',
  
  // Still forbidden colors
  '#8b5cf6': 'hsl(var(--muted-foreground))',
  '#7c3aed': 'hsl(var(--muted-foreground))',
  '#ec4899': 'hsl(var(--muted-foreground))',
  '#db2777': 'hsl(var(--muted-foreground))',
  '#4682B4': 'hsl(var(--primary))',
  '#FFFF00': 'hsl(var(--primary))',
  
  // Social media colors (replace with neutral)
  '#1877f2': 'hsl(var(--muted-foreground))',
  '#1da1f2': 'hsl(var(--muted-foreground))',
  '#5865f2': 'hsl(var(--muted-foreground))',
  '#0077b5': 'hsl(var(--muted-foreground))',
  '#EA4335': 'hsl(var(--muted-foreground))',
  '#720E9E': 'hsl(var(--muted-foreground))',
  '#00A4E4': 'hsl(var(--muted-foreground))',
};

// RGB color replacements
const RGB_FIXES = {
  'rgb(156, 163, 175)': 'hsl(var(--muted-foreground))',
  'rgb(107, 114, 128)': 'hsl(var(--muted-foreground))',
  'rgb(229 231 235)': 'hsl(var(--muted))',
  'rgb(239 68 68)': 'hsl(var(--muted-foreground))',
  'rgb(234 179 8)': 'hsl(var(--accent))',
  'rgb(59 130 246)': 'hsl(var(--primary))',
  'rgb(34 197 94)': 'hsl(var(--muted-foreground))',
  'rgb(156 163 175)': 'hsl(var(--muted-foreground))',
  'rgb(226, 197, 65)': 'hsl(var(--accent))',
  'rgb(203, 139, 208)': 'hsl(var(--muted-foreground))',
  'rgb(239 68 68)': 'hsl(var(--muted-foreground))',
  'rgb(17 17 17)': 'hsl(var(--background))',
  'rgb(200, 200, 200)': 'hsl(var(--muted-foreground))',
  'rgb(100, 100, 100)': 'hsl(var(--muted-foreground))',
};

// RGBA color replacements
const RGBA_FIXES = {
  'rgba(156, 163, 175, 0.2)': 'hsl(var(--muted-foreground) / 0.2)',
  'rgba(107, 114, 128, 0.2)': 'hsl(var(--muted-foreground) / 0.2)',
  'rgba(0, 0, 0, 0.1)': 'hsl(var(--foreground) / 0.1)',
  'rgba(0, 0, 0, 0.06)': 'hsl(var(--foreground) / 0.06)',
  'rgba(0, 0, 0, 0.04)': 'hsl(var(--foreground) / 0.04)',
  'rgba(255, 255, 255, 0.2)': 'hsl(var(--background) / 0.2)',
  'rgba(107, 114, 128, 0.7)': 'hsl(var(--muted-foreground) / 0.7)',
  'rgba(0, 0, 0, 0.05)': 'hsl(var(--foreground) / 0.05)',
  'rgba(13, 13, 13, 0.6)': 'hsl(var(--background) / 0.6)',
  'rgba(236, 236, 241, 0.6)': 'hsl(var(--background) / 0.6)',
  'rgba(0, 0, 0, 0.3)': 'hsl(var(--foreground) / 0.3)',
  'rgba(156, 163, 175, 0.5)': 'hsl(var(--muted-foreground) / 0.5)',
  'rgba(0, 0, 0, 0.5)': 'hsl(var(--foreground) / 0.5)',
  'rgba(255, 255, 255, 0.5)': 'hsl(var(--background) / 0.5)',
  'rgba(255, 255, 255, 0.8)': 'hsl(var(--background) / 0.8)',
  'rgba(48, 48, 48, 0.8)': 'hsl(var(--card) / 0.8)',
  'rgba(255, 255, 255, 0.3)': 'hsl(var(--background) / 0.3)',
  'rgba(0, 0, 0, 0.8)': 'hsl(var(--foreground) / 0.8)',
  'rgba(212, 175, 55, 0.2)': 'hsl(var(--accent) / 0.2)',
  'rgba(255,255,255,0.6)': 'hsl(var(--background) / 0.6)',
  'rgba(59, 130, 246, 0.9)': 'hsl(var(--primary) / 0.9)',
  'rgba(0, 0, 0, 0)': 'transparent',
  'rgba(0,0,0,0.3)': 'hsl(var(--foreground) / 0.3)',
  'rgba(0,0,0,0.2)': 'hsl(var(--foreground) / 0.2)',
  'rgba(0,0,0,0.15)': 'hsl(var(--foreground) / 0.15)',
  'rgba(0,0,0,0.1)': 'hsl(var(--foreground) / 0.1)',
  'rgba(0,0,0,0.4)': 'hsl(var(--foreground) / 0.4)',
  'rgba(120,119,198,0.1)': 'hsl(var(--primary) / 0.1)',
  'rgba(120,120,120,0.15)': 'hsl(var(--muted-foreground) / 0.15)',
  'rgba(34, 197, 94, 0.1)': 'hsl(var(--muted-foreground) / 0.1)',
  'rgba(59, 130, 246, 0.1)': 'hsl(var(--primary) / 0.1)',
  'rgba(34, 197, 94, 0.05)': 'hsl(var(--muted-foreground) / 0.05)',
  'rgba(59, 130, 246, 0.05)': 'hsl(var(--primary) / 0.05)',
  'rgba(156, 163, 175, 0.6)': 'hsl(var(--muted-foreground) / 0.6)',
  'rgba(156, 163, 175, 0.4)': 'hsl(var(--muted-foreground) / 0.4)',
  'rgba(34, 197, 94, 0.4)': 'hsl(var(--muted-foreground) / 0.4)',
  'rgba(184, 134, 11, 0.4)': 'hsl(var(--accent) / 0.4)',
  'rgba(139, 92, 246, 0.4)': 'hsl(var(--muted-foreground) / 0.4)',
  'rgba(239, 68, 68, 0.4)': 'hsl(var(--muted-foreground) / 0.4)',
  'rgba(107, 114, 128, 0.4)': 'hsl(var(--muted-foreground) / 0.4)',
  'rgba(255,255,255,0.3)': 'hsl(var(--background) / 0.3)',
  'rgba(255,255,255,0.2)': 'hsl(var(--background) / 0.2)',
  'rgba(255,255,255,0.4)': 'hsl(var(--background) / 0.4)',
  'rgba(255,255,255,0.1)': 'hsl(var(--background) / 0.1)',
  'rgba(0, 0, 0, 0.7)': 'hsl(var(--foreground) / 0.7)',
  'rgba(0, 0, 0, 0.9)': 'hsl(var(--foreground) / 0.9)',
  'rgba(255, 255, 255, 0.05)': 'hsl(var(--background) / 0.05)',
  'rgba(75, 85, 99, 0.8)': 'hsl(var(--muted-foreground) / 0.8)',
  'rgba(0, 0, 0, 0.5)': 'hsl(var(--foreground) / 0.5)',
  'rgba(55, 65, 81, 0.3)': 'hsl(var(--border) / 0.3)',
  'rgba(59, 130, 246, 0.2)': 'hsl(var(--primary) / 0.2)',
  'rgba(16, 185, 129, 0.2)': 'hsl(var(--muted-foreground) / 0.2)',
  'rgba(75, 85, 99, 0.5)': 'hsl(var(--muted-foreground) / 0.5)',
  'rgba(55, 65, 81, 0.8)': 'hsl(var(--border) / 0.8)',
  'rgba(14,165,233,0.4)': 'hsl(var(--primary) / 0.4)',
  'rgba(14,165,233,0.6)': 'hsl(var(--primary) / 0.6)',
  'rgba(0,0,0,0.6)': 'hsl(var(--foreground) / 0.6)',
};

function findFiles(dir, extensions = ['.js', '.jsx', '.ts', '.tsx', '.css']) {
  const files = [];
  
  function scan(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and .git
        if (item !== 'node_modules' && item !== '.git') {
          scan(fullPath);
        }
      } else if (extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }
  
  scan(dir);
  return files;
}

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let changes = 0;
    
    // Fix hex colors
    for (const [oldColor, newColor] of Object.entries(THEME_FIXES)) {
      const regex = new RegExp(oldColor.replace('#', '\\#'), 'g');
      const matches = content.match(regex);
      if (matches) {
        content = content.replace(regex, newColor);
        changes += matches.length;
      }
    }
    
    // Fix RGB colors
    for (const [oldColor, newColor] of Object.entries(RGB_FIXES)) {
      const regex = new RegExp(oldColor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const matches = content.match(regex);
      if (matches) {
        content = content.replace(regex, newColor);
        changes += matches.length;
      }
    }
    
    // Fix RGBA colors
    for (const [oldColor, newColor] of Object.entries(RGBA_FIXES)) {
      const regex = new RegExp(oldColor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const matches = content.match(regex);
      if (matches) {
        content = content.replace(regex, newColor);
        changes += matches.length;
      }
    }
    
    // Fix Tailwind arbitrary color classes
    const tailwindColorRegex = /(bg|text|border)-\[#([0-9a-fA-F]{6})\]/g;
    const tailwindMatches = content.match(tailwindColorRegex);
    if (tailwindMatches) {
      content = content.replace(tailwindColorRegex, (match, property, color) => {
        const replacement = THEME_FIXES[`#${color.toUpperCase()}`];
        if (replacement) {
          changes++;
          return `${property}-[${replacement}]`;
        }
        return match;
      });
    }
    
    if (changes > 0) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed ${changes} issues in ${filePath}`);
      return changes;
    }
    
    return 0;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return 0;
  }
}

function main() {
  console.log('🎨 Thorbis Theme Fixer');
  console.log('======================\n');
  
  const srcDir = path.join(process.cwd(), 'src');
  const files = findFiles(srcDir);
  
  console.log(`📁 Found ${files.length} files to scan...\n`);
  
  let totalChanges = 0;
  let filesChanged = 0;
  
  for (const file of files) {
    const changes = fixFile(file);
    if (changes > 0) {
      totalChanges += changes;
      filesChanged++;
    }
  }
  
  console.log('\n📊 Summary:');
  console.log(`   Files changed: ${filesChanged}`);
  console.log(`   Total fixes: ${totalChanges}`);
  
  if (totalChanges > 0) {
    console.log('\n🎉 Theme consistency fixes completed!');
    console.log('💡 Run the theme checker again to verify: node scripts/theme-consistency-check.js');
  } else {
    console.log('\n✨ No theme issues found!');
  }
}

main();
