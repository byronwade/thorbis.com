#!/usr/bin/env node

/**
 * Thorbis Theme Consistency Checker
 * 
 * This script scans the codebase for hard-coded colors and suggests
 * replacements using the Thorbis theme CSS variables.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Thorbis theme color mappings
const THEME_COLORS = {
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
  
  // Social media colors (replace with neutral)
  '#1877f2': 'hsl(var(--muted-foreground))', // Facebook
  '#1da1f2': 'hsl(var(--muted-foreground))', // Twitter
  '#5865f2': 'hsl(var(--muted-foreground))', // Discord
  '#0077b5': 'hsl(var(--muted-foreground))', // LinkedIn
  '#EA4335': 'hsl(var(--muted-foreground))', // Gmail
  '#720E9E': 'hsl(var(--muted-foreground))', // Yahoo
  '#00A4E4': 'hsl(var(--muted-foreground))', // AOL
  
  // Other colors to replace
  '#10B981': 'hsl(var(--muted-foreground))', // Green
  '#F59E0B': 'hsl(var(--accent))', // Orange
  '#FFFF00': 'hsl(var(--primary))', // Yellow
  '#f0f8ff': 'hsl(var(--muted))', // Light blue
  '#4682B4': 'hsl(var(--primary))', // Steel blue
  '#CD853F': 'hsl(var(--muted-foreground))', // Peru
  '#22c55e': 'hsl(var(--primary))', // Green
  '#0066cc': 'hsl(var(--primary))', // Blue
};

// Forbidden colors that should never be used
const FORBIDDEN_COLORS = [
  '#8b5cf6', '#7c3aed', '#6d28d9', // Purple variants
  '#ec4899', '#db2777', '#be185d', // Pink variants
  '#a855f7', '#9333ea', '#7c3aed', // Violet variants
  '#f472b6', '#ec4899', '#db2777', // Rose variants
];

// File patterns to scan
const SCAN_PATTERNS = [
  'src/**/*.{js,jsx,ts,tsx}',
  'src/**/*.css',
  'components/**/*.{js,jsx,ts,tsx}',
  'app/**/*.{js,jsx,ts,tsx}',
];

// Files to exclude
const EXCLUDE_PATTERNS = [
  'node_modules/**',
  '.next/**',
  'dist/**',
  'build/**',
  '*.min.js',
  '*.min.css',
];

function findFiles() {
  try {
    const findCommand = `find . -type f \\( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" -o -name "*.css" \\) -not -path "./node_modules/*" -not -path "./.next/*" -not -path "./dist/*" -not -path "./build/*"`;
    const files = execSync(findCommand, { encoding: 'utf8' })
      .split('\n')
      .filter(file => file.trim() && file.startsWith('./src/'));
    
    return files;
  } catch (error) {
    console.error('Error finding files:', error.message);
    return [];
  }
}

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    
    // Check for hard-coded hex colors
    const hexColorRegex = /#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}/g;
    const hexMatches = content.match(hexColorRegex) || [];
    
    hexMatches.forEach(color => {
      if (THEME_COLORS[color]) {
        issues.push({
          type: 'hardcoded_color',
          color,
          suggestion: THEME_COLORS[color],
          severity: 'warning'
        });
      } else if (FORBIDDEN_COLORS.includes(color)) {
        issues.push({
          type: 'forbidden_color',
          color,
          suggestion: 'Use Thorbis theme colors instead',
          severity: 'error'
        });
      }
    });
    
    // Check for hard-coded Tailwind color classes
    const tailwindColorRegex = /(bg|text|border)-\[#[0-9a-fA-F]{6}\]/g;
    const tailwindMatches = content.match(tailwindColorRegex) || [];
    
    tailwindMatches.forEach(match => {
      const color = match.match(/#[0-9a-fA-F]{6}/)[0];
      if (THEME_COLORS[color]) {
        issues.push({
          type: 'hardcoded_tailwind',
          match,
          suggestion: match.replace(color, THEME_COLORS[color]),
          severity: 'warning'
        });
      }
    });
    
    // Check for rgb/rgba colors
    const rgbColorRegex = /rgba?\([^)]+\)/g;
    const rgbMatches = content.match(rgbColorRegex) || [];
    
    rgbMatches.forEach(match => {
      issues.push({
        type: 'rgb_color',
        match,
        suggestion: 'Replace with hsl(var(--theme-variable))',
        severity: 'warning'
      });
    });
    
    return issues;
  } catch (error) {
    console.error(`Error scanning ${filePath}:`, error.message);
    return [];
  }
}

function generateReport(allIssues) {
  const report = {
    summary: {
      totalFiles: 0,
      totalIssues: 0,
      errors: 0,
      warnings: 0
    },
    files: {},
    recommendations: []
  };
  
  allIssues.forEach(({ file, issues }) => {
    if (issues.length > 0) {
      report.summary.totalFiles++;
      report.files[file] = issues;
      
      issues.forEach(issue => {
        report.summary.totalIssues++;
        if (issue.severity === 'error') {
          report.summary.errors++;
        } else {
          report.summary.warnings++;
        }
      });
    }
  });
  
  // Generate recommendations
  if (report.summary.errors > 0) {
    report.recommendations.push('❌ Remove all forbidden colors (red, green, orange, purple, pink)');
  }
  
  if (report.summary.warnings > 0) {
    report.recommendations.push('⚠️ Replace hard-coded colors with Thorbis theme variables');
  }
  
  report.recommendations.push('✅ Use CSS variables: hsl(var(--primary)), hsl(var(--background)), etc.');
  report.recommendations.push('✅ Use semantic Tailwind classes: bg-primary, text-foreground, etc.');
  report.recommendations.push('✅ Follow the Thorbis theme: Blue + Neutral colors only');
  
  return report;
}

function printReport(report) {
  console.log('\n🎨 Thorbis Theme Consistency Report\n');
  console.log('📊 Summary:');
  console.log(`   Files scanned: ${report.summary.totalFiles}`);
  console.log(`   Total issues: ${report.summary.totalIssues}`);
  console.log(`   Errors: ${report.summary.errors}`);
  console.log(`   Warnings: ${report.summary.warnings}`);
  
  if (report.summary.totalIssues === 0) {
    console.log('\n✅ All files follow the Thorbis theme!');
    return;
  }
  
  console.log('\n📁 Files with issues:');
  Object.entries(report.files).forEach(([file, issues]) => {
    console.log(`\n   ${file}:`);
    issues.forEach(issue => {
      const icon = issue.severity === 'error' ? '❌' : '⚠️';
      console.log(`     ${icon} ${issue.type}: ${issue.match || issue.color}`);
      console.log(`        → ${issue.suggestion}`);
    });
  });
  
  console.log('\n💡 Recommendations:');
  report.recommendations.forEach(rec => {
    console.log(`   ${rec}`);
  });
  
  console.log('\n🎯 Thorbis Theme Colors:');
  console.log('   Primary: hsl(var(--primary))     // #3B82F6');
  console.log('   Background: hsl(var(--background)) // #000000');
  console.log('   Foreground: hsl(var(--foreground)) // #FFFFFF');
  console.log('   Card: hsl(var(--card))           // #0a0a0a');
  console.log('   Muted: hsl(var(--muted))         // #f6f7fb');
  console.log('   Border: hsl(var(--border))       // #374151');
}

function main() {
  console.log('🔍 Scanning for theme consistency issues...\n');
  
  const files = findFiles();
  const allIssues = [];
  
  files.forEach(file => {
    const issues = scanFile(file);
    if (issues.length > 0) {
      allIssues.push({ file, issues });
    }
  });
  
  const report = generateReport(allIssues);
  printReport(report);
  
  // Exit with error code if there are critical issues
  if (report.summary.errors > 0) {
    process.exit(1);
  }
}

main();
