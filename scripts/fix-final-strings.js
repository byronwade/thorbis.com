#!/usr/bin/env node

/**
 * Fix final string literal issues and template literal problems
 */

const fs = require('fs')
const path = require('path')

function fixFinalStringsInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    let newContent = content

    // Fix patterns like: value={formData.something || '}
    newContent = newContent.replace(/(\|\|\s*)'}/g, "$1''}")
    
    // Fix patterns like: .replace('v', ')
    newContent = newContent.replace(/\.replace\('([^']+)',\s*'\)/g, ".replace('$1', '')")
    
    // Fix patterns like: || 'Unknown Device','
    newContent = newContent.replace(/\|\|\s*'([^']+)','/g, "|| '$1',")
    
    // Fix template literal issues like: `${slug}.md`)
    newContent = newContent.replace(/`([^`]*)\$\{([^}]+)\}\.([^`]*)`\)/g, "`$1\${$2}.$3`)")
    
    // Fix patterns like: path.join(contentDirectory, 'blog`, `${slug}.md`)
    newContent = newContent.replace(/path\.join\([^,]+,\s*'([^']+)`,/g, "path.join($&, '$1',")
    
    // Fix: 'utf8`)
    newContent = newContent.replace(/'utf8`\)/g, "'utf8')")
    
    // Fix: .replace(/[^\w\s-]/g, ')
    newContent = newContent.replace(/\.replace\(\/[^\/]+\/g?,\s*'\)/g, ".replace(/[^\\w\\s-]/g, '')")
    
    // Fix: return ''
    newContent = newContent.replace(/return\s*`$/gm, "return ''")
    
    // Fix: '  `.repeat(
    newContent = newContent.replace(/'  `\.repeat\(/g, "'  '.repeat(")
    
    // Fix: 'v1.0`
    newContent = newContent.replace(/'([^']+)`/g, "'$1'")
    
    // Fix: || 'localhost', '
    newContent = newContent.replace(/\|\|\s*'([^']+)',\s*'/g, "|| '$1',")
    
    // Fix: .split('_')[0])'
    newContent = newContent.replace(/\.split\('([^']+)'\)\[(\d+)\]\)'/g, ".split('$1')[$2]")
    
    // Fix: console.error('message', error)'
    newContent = newContent.replace(/console\.(log|error|warn)\('([^']+)',\s*([^)]+)\)'/g, "console.$1('$2', $3)")
    
    // Fix: throw new Error('message')'
    newContent = newContent.replace(/throw new Error\('([^']+)'\)'/g, "throw new Error('$1')")
    
    // Fix: 'thorbis-business-directory`
    newContent = newContent.replace(/'([^']+)`/g, "'$1'")
    
    // Fix: device.getDevice(', deviceId)'
    newContent = newContent.replace(/\.getDevice\(',\s*([^)]+)\)'/g, ".getDevice('', $1)")
    
    // Fix incomplete function signatures: ): {'
    newContent = newContent.replace(/\):\s*[^{]*\{'/g, (match) => {
      return match.replace(/\{'$/, " {")
    })

    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent)
      console.log(`✅ Fixed final strings in: ${filePath}`)
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
      if (fixFinalStringsInFile(filePath)) {
        fixedCount++
      }
    }
  }
  
  return fixedCount
}

console.log('🔧 Fixing final string literal issues...')
const startDir = process.argv[2] || './src'
const fixedCount = walkDirectory(startDir)
console.log(`\n🎉 Fixed final string issues in ${fixedCount} files!`)

