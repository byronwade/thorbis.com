#!/usr/bin/env node

/**
 * Comprehensive script to fix all logger import issues across the codebase
 * This script fixes both @utils/logger and @lib/utils/logger imports
 */

import fs from 'fs';
import { execSync } from 'child_process';

function findFilesWithIncorrectLoggerImports() {
  try {
    // Find all files with logger imports
    const result = execSync('grep -r "import.*logger.*from.*@utils/logger" src/ --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx"', { encoding: 'utf8' });
    
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
  let fixedCount = 0;
  
  files.forEach(filePath => {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      
      // Fix @utils/logger imports
      const oldUtilsImport = /import\s*\{\s*logger\s*\}\s*from\s*['"]@utils\/logger['"];?/g;
      if (oldUtilsImport.test(content)) {
        content = content.replace(oldUtilsImport, 'import logger from "@lib/utils/logger";');
        modified = true;
      }
      
      // Fix @lib/utils/logger imports
      const oldLibUtilsImport = /import\s*\{\s*logger\s*\}\s*from\s*['"]@lib\/utils\/logger['"];?/g;
      if (oldLibUtilsImport.test(content)) {
        content = content.replace(oldLibUtilsImport, 'import logger from "@lib/utils/logger";');
        modified = true;
      }
      
      if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Fixed logger import in: ${filePath}`);
        fixedCount++;
      }
    } catch (error) {
      console.error(`❌ Error fixing ${filePath}:`, error.message);
    }
  });
  
  return fixedCount;
}

function main() {
  console.log('🔍 Finding all incorrect logger imports...\n');
  
  const incorrectFiles = findFilesWithIncorrectLoggerImports();
  
  if (incorrectFiles.length === 0) {
    console.log('✅ All logger imports are correct!');
    return;
  }
  
  console.log(`❌ Found ${incorrectFiles.length} files with incorrect logger imports:`);
  incorrectFiles.forEach(file => console.log(`   - ${file}`));
  
  console.log('\n🔧 Fixing incorrect imports...');
  const fixedCount = fixLoggerImports(incorrectFiles);
  
  console.log(`\n✅ Fixed ${fixedCount} files!`);
  console.log('🎉 All logger import issues resolved!');
}

// Run the script
main();
