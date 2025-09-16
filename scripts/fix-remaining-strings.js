#!/usr/bin/env node

/**
 * Fix remaining unterminated string literals and other parsing errors
 */

const fs = require('fs')
const path = require('path')

function fixStringsInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    let newContent = content

    // Fix unterminated string literals like: value={formData.something || '}
    newContent = newContent.replace(/(\w+(?:\.\w+)*\s*\|\|\s*)'}/g, "$1''}")
    
    // Fix missing closing quotes in template literals
    newContent = newContent.replace(/(\w+(?:\.\w+)*\s*\|\|\s*)`}/g, "$1``}")
    
    // Fix incomplete string patterns
    newContent = newContent.replace(/=\s*'\s*$/gm, "= ''")
    
    // Fix template literal issues
    newContent = newContent.replace(/`([^`]*)\n([^`]*)'(?!\s*[+`])/g, '`$1\n$2`')
    
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent)
      console.log(`✅ Fixed strings in: ${filePath}`)
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
    } else if (stat.isFile() && (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx'))) {
      if (fixStringsInFile(filePath)) {
        fixedCount++
      }
    }
  }
  
  return fixedCount
}

console.log('🔧 Fixing remaining string literal issues...')
const startDir = process.argv[2] || './src'
const fixedCount = walkDirectory(startDir)
console.log(`\n🎉 Fixed string issues in ${fixedCount} files!`)
