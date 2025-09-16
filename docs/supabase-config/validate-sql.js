/**
 * SQL Syntax Validation for RLS Policies
 * 
 * Basic validation to catch syntax errors before deployment
 */

const fs = require('fs')
const path = require('path')

async function validateSQL() {
  console.log('🔍 Validating SQL syntax for RLS policies...\n')
  
  try {
    const sqlFile = path.join(__dirname, 'rls-policies.sql')
    const sql = fs.readFileSync(sqlFile, 'utf8')
    
    console.log(`📄 Loaded ${sqlFile} (${sql.length.toLocaleString()} characters)`)
    
    // Basic SQL syntax checks
    const checks = [
      {
        name: 'Balanced parentheses',
        test: (sql) => {
          const open = (sql.match(/\(/g) || []).length
          const close = (sql.match(/\)/g) || []).length
          return { pass: open === close, details: `${open} open, ${close} close` }
        }
      },
      {
        name: 'Semicolon termination',
        test: (sql) => {
          // Remove comments and split by semicolons
          const cleanedSQL = sql.replace(/--.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '')
          const statements = cleanedSQL.split(';').filter(s => s.trim())
          
          // Check that major SQL statements end with semicolons
          const majorStatements = ['CREATE', 'ALTER', 'DROP', 'INSERT', 'UPDATE', 'DELETE', 'GRANT']
          const lines = cleanedSQL.split('\n').filter(line => {
            const trimmed = line.trim()
            return majorStatements.some(stmt => trimmed.startsWith(stmt))
          })
          
          return { pass: statements.length > 0, details: `${statements.length} terminated statements, ${lines.length} major statements` }
        }
      },
      {
        name: 'Policy naming convention',
        test: (sql) => {
          const policies = sql.match(/CREATE POLICY "([^"]+)"/g) || []
          const validNames = policies.filter(p => {
            const name = p.match(/"([^"]+)"/)[1]
            return name.match(/^[a-z_]+_(select|insert|update|delete|write)$/)
          })
          return { pass: validNames.length === policies.length, details: `${validNames.length}/${policies.length} valid` }
        }
      },
      {
        name: 'Required utility functions',
        test: (sql) => {
          const required = [
            'current_user_business_id()',
            'current_user_role()',
            'is_api_partner()',
            'can_read_user_data('
          ]
          const missing = required.filter(func => !sql.includes(func))
          return { pass: missing.length === 0, details: missing.length ? `Missing: ${missing.join(', ')}` : 'All present' }
        }
      },
      {
        name: 'Business ID checks',
        test: (sql) => {
          const businessIdChecks = (sql.match(/business_id = current_user_business_id\(\)/g) || []).length
          const policies = (sql.match(/CREATE POLICY/g) || []).length
          return { pass: businessIdChecks > 0, details: `${businessIdChecks} business_id checks in ${policies} policies` }
        }
      },
      {
        name: 'Role-based restrictions',
        test: (sql) => {
          const roleChecks = (sql.match(/current_user_role\(\)/g) || []).length
          const policies = (sql.match(/CREATE POLICY/g) || []).length
          return { pass: roleChecks > 0, details: `${roleChecks} role checks in ${policies} policies` }
        }
      },
      {
        name: 'API partner restrictions',
        test: (sql) => {
          const apiChecks = (sql.match(/is_api_partner\(\)/g) || []).length
          return { pass: apiChecks > 0, details: `${apiChecks} API partner checks` }
        }
      },
      {
        name: 'Audit log immutability',
        test: (sql) => {
          const auditNoUpdate = sql.includes('audit_log_update') && sql.includes('USING (false)')
          const auditNoDelete = sql.includes('audit_log_delete') && sql.includes('USING (false)')
          return { pass: auditNoUpdate && auditNoDelete, details: `Update: ${auditNoUpdate}, Delete: ${auditNoDelete}` }
        }
      },
      {
        name: 'No hardcoded IDs',
        test: (sql) => {
          // Look for UUID patterns that might be hardcoded
          const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi
          const hardcodedUUIDs = sql.match(uuidPattern) || []
          // Filter out comments and examples
          const actualHardcoded = hardcodedUUIDs.filter(uuid => {
            const context = sql.substr(sql.indexOf(uuid) - 50, 100)
            return !context.includes('--') && !context.includes('/*')
          })
          return { pass: actualHardcoded.length === 0, details: `${actualHardcoded.length} hardcoded UUIDs found` }
        }
      },
      {
        name: 'Security definer functions',
        test: (sql) => {
          const functions = sql.match(/CREATE OR REPLACE FUNCTION[^;]+;/gs) || []
          const secureDefiner = functions.filter(func => func.includes('SECURITY DEFINER'))
          return { pass: secureDefiner.length > 0, details: `${secureDefiner.length}/${functions.length} with SECURITY DEFINER` }
        }
      }
    ]
    
    console.log('\n🧪 Running validation checks...\n')
    
    let allPassed = true
    for (const check of checks) {
      const result = check.test(sql)
      const status = result.pass ? '✅' : '❌'
      console.log(`${status} ${check.name}: ${result.details}`)
      if (!result.pass) allPassed = false
    }
    
    // Count key elements
    console.log('\n📊 SQL Analysis:')
    const policies = (sql.match(/CREATE POLICY/g) || []).length
    const functions = (sql.match(/CREATE OR REPLACE FUNCTION/g) || []).length
    const views = (sql.match(/CREATE OR REPLACE VIEW/g) || []).length
    const triggers = (sql.match(/CREATE TRIGGER/g) || []).length
    
    console.log(`Policies: ${policies}`)
    console.log(`Functions: ${functions}`)  
    console.log(`Views: ${views}`)
    console.log(`Triggers: ${triggers}`)
    console.log(`Total lines: ${sql.split('\n').length}`)
    
    // Extract table coverage
    console.log('\n🗄️ Table Coverage:')
    const tables = new Set()
    const policyMatches = sql.match(/CREATE POLICY "[^"]+" ON (\w+)/g) || []
    policyMatches.forEach(match => {
      const table = match.match(/ON (\w+)/)[1]
      tables.add(table)
    })
    
    console.log(`Tables with policies: ${Array.from(tables).sort().join(', ')}`)
    console.log(`Total tables covered: ${tables.size}`)
    
    // Check for common patterns
    console.log('\n🔍 Pattern Analysis:')
    const patterns = {
      'Tenant isolation': (sql.match(/business_id = current_user_business_id\(\)/g) || []).length,
      'Role checks': (sql.match(/current_user_role\(\) IN/g) || []).length,
      'Self-access': (sql.match(/auth\.uid\(\)/g) || []).length,
      'API partner': (sql.match(/is_api_partner\(\)/g) || []).length,
      'Security definer': (sql.match(/SECURITY DEFINER/g) || []).length
    }
    
    for (const [pattern, count] of Object.entries(patterns)) {
      console.log(`${pattern}: ${count} occurrences`)
    }
    
    if (allPassed) {
      console.log('\n🎉 All validation checks passed!')
      console.log('SQL appears to be syntactically correct and follows RLS best practices.')
    } else {
      console.log('\n❌ Some validation checks failed.')
      console.log('Please review and fix the issues above.')
      process.exit(1)
    }
    
  } catch (error) {
    console.error('💥 Validation failed:', error.message)
    process.exit(1)
  }
}

// Run validation if called directly
if (require.main === module) {
  validateSQL()
}

module.exports = { validateSQL }
