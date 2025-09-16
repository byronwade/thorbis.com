#!/usr/bin/env node

/**
 * Comprehensive Thorbis Lint Fixer
 * Fixes multiple categories of lint issues efficiently
 */

const fs = require('fs')
const path = require('path')

class ComprehensiveLintFixer {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      stringIssues: 0,
      anyTypes: 0,
      unusedVars: 0,
      emptyObjects: 0,
      constIssues: 0
    }
  }

  fixFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8')
      let newContent = content
      let localChanges = false

      // 1. String literal fixes
      const stringFixes = this.fixStringLiterals(newContent)
      if (stringFixes.changed) {
        newContent = stringFixes.content
        this.stats.stringIssues += stringFixes.count
        localChanges = true
      }

      // 2. TypeScript any type fixes
      if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
        const anyFixes = this.fixAnyTypes(newContent)
        if (anyFixes.changed) {
          newContent = anyFixes.content
          this.stats.anyTypes += anyFixes.count
          localChanges = true
        }

        // 3. Empty object type fixes
        const emptyObjFixes = this.fixEmptyObjects(newContent)
        if (emptyObjFixes.changed) {
          newContent = emptyObjFixes.content
          this.stats.emptyObjects += emptyObjFixes.count
          localChanges = true
        }

        // 4. Prefer const fixes
        const constFixes = this.fixPreferConst(newContent)
        if (constFixes.changed) {
          newContent = constFixes.content
          this.stats.constIssues += constFixes.count
          localChanges = true
        }

        // 5. Unused variable fixes
        const unusedFixes = this.fixUnusedVars(newContent)
        if (unusedFixes.changed) {
          newContent = unusedFixes.content
          this.stats.unusedVars += unusedFixes.count
          localChanges = true
        }
      }

      if (localChanges) {
        fs.writeFileSync(filePath, newContent)
        this.stats.filesProcessed++
        return true
      }

      return false
    } catch (error) {
      console.error(`❌ Error: ${filePath}: ${error.message}`)
      return false
    }
  }

  fixStringLiterals(content) {
    let newContent = content
    let count = 0

    const patterns = [
      // Fix unterminated strings: || '}
      { from: /(\|\|\s*)'}/g, to: "$1''}", desc: 'unterminated values' },
      // Fix template literals: `content`
      { from: /'([^']+)`/g, to: "'$1'", desc: 'mixed quotes' },
      // Fix function calls: .replace('v', ')
      { from: /\.replace\('([^']+)',\s*'\)/g, to: ".replace('$1', '')", desc: 'incomplete replace' },
      // Fix console methods: console.log('msg', var)'
      { from: /console\.(log|error|warn)\('([^']+)',\s*([^)]+)\)'/g, to: "console.$1('$2', $3)", desc: 'console calls' },
      // Fix throw statements: throw new Error('msg')'
      { from: /throw new Error\('([^']+)'\)'/g, to: "throw new Error('$1')", desc: 'error throws' },
    ]

    for (const pattern of patterns) {
      const matches = newContent.match(pattern.from)
      if (matches) {
        newContent = newContent.replace(pattern.from, pattern.to)
        count += matches.length
      }
    }

    return { content: newContent, changed: count > 0, count }
  }

  fixAnyTypes(content) {
    let newContent = content
    let count = 0

    const patterns = [
      // Function parameters
      { from: /\(\s*(\w+):\s*any\s*\)/g, to: '($1: unknown)', desc: 'function params' },
      { from: /\(\s*(\w+):\s*any,/g, to: '($1: unknown,', desc: 'function params with comma' },
      { from: /,\s*(\w+):\s*any\s*\)/g, to: ', $1: unknown)', desc: 'trailing params' },
      { from: /,\s*(\w+):\s*any,/g, to: ', $1: unknown,', desc: 'middle params' },
      
      // Array and object types
      { from: /:\s*any\[\]/g, to: ': unknown[]', desc: 'array types' },
      { from: /:\s*any\s*=/g, to: ': unknown =', desc: 'variable declarations' },
      
      // Specific context types
      { from: /error:\s*any/g, to: 'error: Error | unknown', desc: 'error types' },
      { from: /data:\s*any/g, to: 'data: unknown', desc: 'data types' },
      { from: /config:\s*any/g, to: 'config: Record<string, unknown>', desc: 'config types' },
      { from: /options:\s*any/g, to: 'options: Record<string, unknown>', desc: 'options types' },
      { from: /params:\s*any/g, to: 'params: Record<string, unknown>', desc: 'params types' },
      
      // Return types
      { from: /\):\s*any\s*{/g, to: '): unknown {', desc: 'return types' },
      { from: /\):\s*Promise<any>/g, to: '): Promise<unknown>', desc: 'promise returns' },
      
      // Generic types
      { from: /<any>/g, to: '<unknown>', desc: 'generics' },
    ]

    for (const pattern of patterns) {
      const matches = newContent.match(pattern.from)
      if (matches) {
        newContent = newContent.replace(pattern.from, pattern.to)
        count += matches.length
      }
    }

    return { content: newContent, changed: count > 0, count }
  }

  fixEmptyObjects(content) {
    let newContent = content
    let count = 0

    // Replace {} with Record<string, unknown> in most contexts
    const emptyObjPattern = /:\s*\{\}/g
    const matches = newContent.match(emptyObjPattern)
    if (matches) {
      newContent = newContent.replace(emptyObjPattern, ': Record<string, unknown>')
      count = matches.length
    }

    return { content: newContent, changed: count > 0, count }
  }

  fixPreferConst(content) {
    let newContent = content
    let count = 0

    // Simple pattern: let varName = value (not reassigned later)
    const letPattern = /\blet\s+(\w+)\s*=\s*([^;\n]+)/g
    const matches = newContent.match(letPattern)
    
    if (matches) {
      for (const match of matches) {
        const varName = match.match(/let\s+(\w+)/)[1]
        // Simple heuristic: if no reassignment found
        const reassignPattern = new RegExp(`\\b${varName}\\s*=(?!=)`, 'g')
        const reassignments = newContent.match(reassignPattern) || []
        
        // If only one assignment (the declaration), convert to const
        if (reassignments.length <= 1) {
          newContent = newContent.replace(match, match.replace('let ', 'const '))
          count++
        }
      }
    }

    return { content: newContent, changed: count > 0, count }
  }

  fixUnusedVars(content) {
    let newContent = content
    let count = 0

    // Mark clearly unused error/catch variables
    const unusedErrorPattern = /catch\s*\(\s*(\w+)\s*\)\s*{[^}]*}/g
    const errorMatches = newContent.match(unusedErrorPattern) || []
    
    for (const match of errorMatches) {
      const varName = match.match(/catch\s*\(\s*(\w+)\s*\)/)[1]
      // If error variable is never used in the catch block
      if (!match.includes(varName + '.') && !match.includes(varName + '[') && !match.includes('console.')) {
        newContent = newContent.replace(match, match.replace(`(${varName})`, '(_error)'))
        count++
      }
    }

    return { content: newContent, changed: count > 0, count }
  }

  processDirectory(dir) {
    const files = fs.readdirSync(dir)
    
    for (const file of files) {
      const filePath = path.join(dir, file)
      const stat = fs.statSync(filePath)
      
      if (stat.isDirectory()) {
        if (['node_modules', 'dist', 'build', '.next', '.git'].includes(file)) {
          continue
        }
        this.processDirectory(filePath)
      } else if (stat.isFile() && (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx'))) {
        this.fixFile(filePath)
      }
    }
  }

  run(startDir = './src') {
    console.log('🔧 Running comprehensive lint fixes...')
    
    this.processDirectory(startDir)
    
    console.log('\n📊 Summary:')
    console.log(`✅ Files processed: ${this.stats.filesProcessed}`)
    console.log(`🔤 String issues fixed: ${this.stats.stringIssues}`)
    console.log(`🏷️  Any types fixed: ${this.stats.anyTypes}`)
    console.log(`📦 Empty objects fixed: ${this.stats.emptyObjects}`)
    console.log(`🔒 Const fixes: ${this.stats.constIssues}`)
    console.log(`🗑️  Unused vars fixed: ${this.stats.unusedVars}`)
  }
}

const fixer = new ComprehensiveLintFixer()
fixer.run(process.argv[2])

