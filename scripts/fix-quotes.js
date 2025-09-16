#!/usr/bin/env node

/**
 * Simple quote fixing script for Thorbis parsing errors
 * Fixes triple quotes and other common parsing issues
 */

const fs = require('fs')
const path = require('path')

function fixQuotesInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    let newContent = content

    // Fix triple single quotes
    newContent = newContent.replace(/'''/g, "'")
    
    // Fix double single quotes 
    newContent = newContent.replace(/''/g, "'")
    
    // Fix unterminated template literals
    newContent = newContent.replace(/let\s+(\w+)\s*=\s*'([^']*\n[^']*)'(?![`'])/g, "let $1 = `$2`")
    
    // Fix common enum trailing issues
    newContent = newContent.replace(/,\s*''['\s]*$/gm, '')
    
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent)
      console.log(`✅ Fixed quotes in: ${filePath}`)
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
      // Skip node_modules, dist, build directories
      if (['node_modules', 'dist', 'build', '.next', '.git'].includes(file)) {
        continue
      }
      fixedCount += walkDirectory(filePath)
    } else if (stat.isFile() && (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx'))) {
      if (fixQuotesInFile(filePath)) {
        fixedCount++
      }
    }
  }
  
  return fixedCount
}

// Run the fixer
console.log('🔧 Starting quote fixing...')
const startDir = process.argv[2] || './src'
const fixedCount = walkDirectory(startDir)
console.log(`\n🎉 Fixed quotes in ${fixedCount} files!`)
console.log('Next: Run npm run lint to check remaining issues')
