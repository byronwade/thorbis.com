#!/usr/bin/env node

/**
 * Script to check for incorrect logger imports
 * This helps prevent the "logger is not exported" error
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

function findFilesWithIncorrectLoggerImports() {
  try {
    // Find all JavaScript/TypeScript files with logger imports
    const result = execSync('grep -r "import.*logger.*from.*@lib/utils/logger" src/ --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx"', { encoding: 'utf8' });
    
    const lines = result.split('\n').filter(line => line.trim());
    const incorrectImports = [];
    
    lines.forEach(line => {
      if (line.includes('import { logger }')) {
        const filePath = line.split(':')[0];
        incorrectImports.push(filePath);
      }
    });
    
    return [...new Set(incorrectImports)]; // Remove duplicates
  } catch (error) {
    return [];
  }
}

function fixLoggerImports(files) {
  files.forEach(filePath => {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Replace named import with default import
      const oldImport = /import\s*\{\s*logger\s*\}\s*from\s*['"]@lib\/utils\/logger['"];?/g;
      const newImport = 'import logger from "@lib/utils/logger";';
      
      if (oldImport.test(content)) {
        content = content.replace(oldImport, newImport);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Fixed logger import in: ${filePath}`);
      }
    } catch (error) {
      console.error(`❌ Error fixing ${filePath}:`, error.message);
    }
  });
}

function main() {
  console.log('🔍 Checking for incorrect logger imports...\n');
  
  const incorrectFiles = findFilesWithIncorrectLoggerImports();
  
  if (incorrectFiles.length === 0) {
    console.log('✅ All logger imports are correct!');
    return;
  }
  
  console.log(`❌ Found ${incorrectFiles.length} files with incorrect logger imports:`);
  incorrectFiles.forEach(file => console.log(`   - ${file}`));
  
  console.log('\n🔧 Fixing incorrect imports...');
  fixLoggerImports(incorrectFiles);
  
  console.log('\n✅ Logger import check complete!');
}

// Run the script if called directly
main();
