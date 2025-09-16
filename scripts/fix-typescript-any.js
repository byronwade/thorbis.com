#!/usr/bin/env node

/**
 * Fix TypeScript 'any' types with proper types
 */

const fs = require('fs')
const path = require('path')

function fixAnyTypesInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    let newContent = content
    let changesMade = false

    // Fix common any patterns
    const fixes = [
      // Function parameters
      { pattern: /\(\s*(\w+):\s*any\s*\)/g, replacement: '($1: unknown)', name: 'function params' },
      { pattern: /\(\s*(\w+):\s*any,/g, replacement: '($1: unknown,', name: 'function params with comma' },
      { pattern: /,\s*(\w+):\s*any\s*\)/g, replacement: ', $1: unknown)', name: 'trailing function params' },
      { pattern: /,\s*(\w+):\s*any,/g, replacement: ', $1: unknown,', name: 'middle function params' },
      
      // Array types
      { pattern: /:\s*any\[\]/g, replacement: ': unknown[]', name: 'array types' },
      
      // Variable declarations
      { pattern: /:\s*any\s*=/g, replacement: ': unknown =', name: 'variable declarations' },
      
      // Object properties
      { pattern: /(\w+):\s*any([,}])/g, replacement: '$1: unknown$2', name: 'object properties' },
      
      // Return types
      { pattern: /\):\s*any\s*{/g, replacement: '): unknown {', name: 'return types' },
      { pattern: /\):\s*Promise<any>/g, replacement: '): Promise<unknown>', name: 'promise return types' },
      
      // Generic types
      { pattern: /<any>/g, replacement: '<unknown>', name: 'generic types' },
      
      // Record types
      { pattern: /Record<\w+,\s*any>/g, replacement: (match) => match.replace('any', 'unknown'), name: 'record types' },
      
      // Safer patterns for specific cases
      { pattern: /error:\s*any/g, replacement: 'error: Error | unknown', name: 'error types' },
      { pattern: /data:\s*any/g, replacement: 'data: unknown', name: 'data types' },
      { pattern: /response:\s*any/g, replacement: 'response: unknown', name: 'response types' },
      { pattern: /payload:\s*any/g, replacement: 'payload: unknown', name: 'payload types' },
      { pattern: /config:\s*any/g, replacement: 'config: Record<string, unknown>', name: 'config types' },
      { pattern: /options:\s*any/g, replacement: 'options: Record<string, unknown>', name: 'options types' },
      { pattern: /params:\s*any/g, replacement: 'params: Record<string, unknown>', name: 'params types' },
      { pattern: /context:\s*any/g, replacement: 'context: Record<string, unknown>', name: 'context types' },
    ]

    for (const fix of fixes) {
      const beforeCount = (newContent.match(fix.pattern) || []).length
      newContent = newContent.replace(fix.pattern, fix.replacement)
      const afterCount = (newContent.match(fix.pattern) || []).length
      
      if (beforeCount > afterCount) {
        console.log(`  ✓ Fixed ${beforeCount - afterCount} ${fix.name} instances`)
        changesMade = true
      }
    }

    if (changesMade) {
      fs.writeFileSync(filePath, newContent)
      console.log(`✅ Fixed any types in: ${filePath}`)
      return true
    }
    
    return false
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message)
    return false
  }
}

function walkDirectory(dir) {
  const files = fs.readdirSync(dir)
  let fixedCount = 0
  
  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    
    if (stat.isDirectory()) {
      if (['node_modules', 'dist', 'build', '.next', '.git'].includes(file)) {
        continue
      }
      fixedCount += walkDirectory(filePath)
    } else if (stat.isFile() && (file.endsWith('.ts') || file.endsWith('.tsx'))) {
      // Only process TypeScript files for 'any' fixes
      if (fixAnyTypesInFile(filePath)) {
        fixedCount++
      }
    }
  }
  
  return fixedCount
}

console.log('🔧 Fixing TypeScript any types...')
const startDir = process.argv[2] || './src'
const fixedCount = walkDirectory(startDir)
console.log(`\n🎉 Fixed TypeScript any types in ${fixedCount} files!`)

