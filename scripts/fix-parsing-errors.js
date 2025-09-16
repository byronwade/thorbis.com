#!/usr/bin/env node

/**
 * Automated Lint Fixing Script for Thorbis
 * Fixes critical parsing errors and common TypeScript issues
 */

const fs = require('fs')
const path = require('path')
const glob = require('glob')

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
}

const log = (color, message) => console.log(`${colors[color]}${message}${colors.reset}`)

// Critical parsing error fixes
const parsingFixes = [
  // Fix triple quotes to single quotes
  {
    name: 'Fix triple quotes',
    pattern: /''''/g,
    replacement: "'",
    test: /'''/
  },
  
  // Fix unterminated string literals in template literals
  {
    name: 'Fix template literal quotes',
    pattern: /let\s+(\w+)\s*=\s*'([^']*\n[^']*)'(?!\s*[+`])/g,
    replacement: 'let $1 = `$2`',
    test: /let\s+\w+\s*=\s*'[^']*\n/
  },
  
  // Fix missing semicolons at end of lines
  {
    name: 'Add missing semicolons',
    pattern: /^(\s*)([^;\s\{\}\/][^;\n\{\}\/]*[^;\s\{\}\/\n])(\s*)$/gm,
    replacement: '$1$2;$3',
    test: /^[^;\n\{\}]*[a-zA-Z0-9\)\]]\s*$/m,
    exclude: /(\/\/|\/\*|\*\/|import|export|if|else|for|while|function|const|let|var|\{|\}|\[|\])/
  },
  
  // Fix enum trailing commas
  {
    name: 'Fix enum commas',
    pattern: /,'''?\s*$/gm,
    replacement: '',
    test: /,'''/
  },
  
  // Fix parsing error patterns
  {
    name: 'Fix colon expected errors',
    pattern: /(\w+):\s*$/gm,
    replacement: '$1: any',
    test: /\w+:\s*$/
  }
]

// TypeScript any type fixes
const typeFixes = [
  // Replace simple any with unknown for safety
  {
    name: 'Replace any with unknown in function params',
    pattern: /\(\s*(\w+):\s*any\s*\)/g,
    replacement: '($1: unknown)',
    test: /\(\s*\w+:\s*any\s*\)/
  },
  
  // Replace any[] with unknown[]
  {
    name: 'Replace any[] with unknown[]',
    pattern: /:\s*any\[\]/g,
    replacement: ': unknown[]',
    test: /:\s*any\[\]/
  }
]

// Unused variable fixes
const unusedVarFixes = [
  // Add underscore prefix to unused vars
  {
    name: 'Prefix unused variables with underscore',
    pattern: /\b(const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/g,
    replacement: '$1 _$2 =',
    test: /\b(const|let|var)\s+[a-zA-Z_$][a-zA-Z0-9_$]*\s*=/,
    condition: (match, filename, content) => {
      // Only if variable appears to be unused (simple heuristic)
      const varName = match[2]
      const usagePattern = new RegExp(`\\b${varName}\\b`, 'g')
      const matches = content.match(usagePattern) || []
      return matches.length <= 2 // Declaration + one usage or less
    }
  }
]

// Prefer const fixes
const preferConstFixes = [
  {
    name: 'Change let to const for never reassigned variables',
    pattern: /\blet\s+(\w+)\s*=/g,
    replacement: 'const $1 =',
    test: /\blet\s+\w+\s*=/,
    condition: (match, filename, content) => {
      const varName = match[1]
      // Simple check: if no reassignment pattern found
      const reassignmentPattern = new RegExp(`\\b${varName}\\s*=(?!=)`, 'g')
      const reassignments = content.match(reassignmentPattern) || []
      return reassignments.length <= 1 // Only initial assignment
    }
  }
]

class LintFixer {
  constructor() {
    this.fixedFiles = 0
    this.totalFixes = 0
    this.errors = []
  }

  async fixFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8')
      let newContent = content
      let fileFixed = false
      let fileFixes = 0

      // Apply parsing fixes
      for (const fix of parsingFixes) {
        if (fix.test.test(newContent)) {
          if (fix.exclude && fix.exclude.test(newContent)) continue
          
          const beforeLength = newContent.length
          newContent = newContent.replace(fix.pattern, fix.replacement)
          
          if (newContent.length !== beforeLength || newContent !== content) {
            log('yellow', `  ✓ ${fix.name}`)
            fileFixed = true
            fileFixes++
          }
        }
      }

      // Apply type fixes (safer approach)
      for (const fix of typeFixes) {
        if (fix.test.test(newContent)) {
          const matches = [...newContent.matchAll(fix.pattern)]
          for (const match of matches) {
            if (!fix.condition || fix.condition(match, filePath, newContent)) {
              newContent = newContent.replace(fix.pattern, fix.replacement)
              log('blue', `  ✓ ${fix.name}`)
              fileFixed = true
              fileFixes++
            }
          }
        }
      }

      // Apply prefer const fixes
      for (const fix of preferConstFixes) {
        if (fix.test.test(newContent)) {
          const matches = [...newContent.matchAll(fix.pattern)]
          for (const match of matches) {
            if (!fix.condition || fix.condition(match, filePath, newContent)) {
              newContent = newContent.replace(match[0], fix.replacement.replace('$1', match[1]))
              log('green', `  ✓ ${fix.name}`)
              fileFixed = true
              fileFixes++
            }
          }
        }
      }

      if (fileFixed) {
        fs.writeFileSync(filePath, newContent)
        this.fixedFiles++
        this.totalFixes += fileFixes
        log('green', `Fixed ${filePath} (${fileFixes} fixes)`)
      }

      return fileFixed

    } catch (error) {
      this.errors.push({ file: filePath, error: error.message })
      log('red', `Error fixing ${filePath}: ${error.message}`)
      return false
    }
  }

  async fixDirectory(directory = './src') {
    log('blue', `🔧 Starting automated lint fixes in ${directory}...`)
    
    // Find all TypeScript and JavaScript files
    const patterns = [
      `${directory}/**/*.ts`,
      `${directory}/**/*.tsx`,
      `${directory}/**/*.js`,
      `${directory}/**/*.jsx`
    ]

    const excludePatterns = [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/*.d.ts',
      '**/generated/**'
    ]

    for (const pattern of patterns) {
      const files = glob.sync(pattern, { ignore: excludePatterns })
      
      for (const file of files) {
        await this.fixFile(file)
      }
    }

    // Summary
    log('blue', '\n📊 Fix Summary:')
    log('green', `✅ Files fixed: ${this.fixedFiles}`)
    log('green', `🔧 Total fixes applied: ${this.totalFixes}`)
    
    if (this.errors.length > 0) {
      log('red', `❌ Errors: ${this.errors.length}`)
      this.errors.forEach(err => {
        log('red', `  ${err.file}: ${err.error}`)
      })
    }
  }
}

// CLI usage
if (require.main === module) {
  const fixer = new LintFixer()
  const targetDir = process.argv[2] || './src'
  
  fixer.fixDirectory(targetDir).then(() => {
    log('green', '\n🎉 Automated lint fixing completed!')
    log('yellow', 'Next steps:')
    log('yellow', '1. Run npm run lint to check remaining issues')
    log('yellow', '2. Run npm run type-check to verify TypeScript')
    log('yellow', '3. Test critical paths to ensure functionality')
  }).catch(error => {
    log('red', `Fatal error: ${error.message}`)
    process.exit(1)
  })
}

module.exports = LintFixer
