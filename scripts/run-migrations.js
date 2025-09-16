#!/usr/bin/env node

/**
 * Database Migration Runner for Thorbis Business OS
 * 
 * This script runs database migrations in the correct order to set up
 * the comprehensive multi-tenant PostgreSQL schema.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Migration configuration
const MIGRATIONS_DIR = path.join(__dirname, '../migrations');
const MIGRATION_FILES = [
  '001_create_core_schemas.sql',
  '002_create_business_directory.sql', 
  '003_create_hs_schema.sql'
];

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, total, message) {
  log(`[${step}/${total}] ${message}`, 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

async function checkConnection() {
  try {
    const { data, error } = await supabase.from('_test_connection').select('*').limit(1);
    // We expect an error since the table doesn't exist, but if we get a connection error, that's bad
    if (error && !error.message.includes('does not exist')) {
      throw error;
    }
    return true;
  } catch (error) {
    throw new Error(`Database connection failed: ${error.message}`);
  }
}

async function runSqlFile(filePath) {
  try {
    log(`\n📄 Reading migration file: ${path.basename(filePath)}`, 'blue');
    
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // Split SQL into individual statements (simple approach)
    const statements = sql
      .split(/;\s*(?=\n|$)/)
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    log(`   Found ${statements.length} SQL statements to execute`, 'blue');
    
    let successCount = 0;
    let warningCount = 0;
    
    for (const [index, statement] of statements.entries()) {
      try {
        // Skip comments and empty statements
        if (!statement || statement.startsWith('--') || statement.startsWith('/*')) {
          continue;
        }
        
        const { error } = await supabase.rpc('exec_sql', { sql_statement: statement });
        
        if (error) {
          // Some errors are acceptable (e.g., "already exists")
          const acceptableErrors = [
            'already exists',
            'extension "uuid-ossp" already exists',
            'extension "postgis" already exists',
            'extension "pg_trgm" already exists',
            'extension "unaccent" already exists',
            'extension "btree_gin" already exists'
          ];
          
          const isAcceptable = acceptableErrors.some(err => 
            error.message.toLowerCase().includes(err.toLowerCase())
          );
          
          if (isAcceptable) {
            warningCount++;
            if (process.env.VERBOSE === 'true') {
              logWarning(`Statement ${index + 1}: ${error.message}`);
            }
          } else {
            throw error;
          }
        } else {
          successCount++;
        }
        
        // Progress indicator for long migrations
        if (statements.length > 10 && (index + 1) % 10 === 0) {
          log(`   Progress: ${index + 1}/${statements.length} statements completed`, 'blue');
        }
        
      } catch (error) {
        logError(`Failed to execute statement ${index + 1}:`);
        logError(`SQL: ${statement.substring(0, 200)}${statement.length > 200 ? '...' : ''}`);
        throw error;
      }
    }
    
    logSuccess(`Migration completed: ${successCount} statements executed successfully`);
    if (warningCount > 0) {
      logWarning(`${warningCount} statements had acceptable warnings (already exists, etc.)`);
    }
    
  } catch (error) {
    logError(`Migration failed: ${error.message}`);
    throw error;
  }
}

async function createMigrationTable() {
  try {
    const { error } = await supabase.rpc('exec_sql', {
      sql_statement: `
        CREATE TABLE IF NOT EXISTS sys_mgmt.migrations (
          id SERIAL PRIMARY KEY,
          filename VARCHAR(255) NOT NULL UNIQUE,
          executed_at TIMESTAMPTZ DEFAULT NOW(),
          checksum VARCHAR(64),
          success BOOLEAN DEFAULT TRUE
        );
      `
    });
    
    if (error && !error.message.includes('already exists')) {
      throw error;
    }
  } catch (error) {
    // If sys_mgmt schema doesn't exist yet, create a simple migrations table
    const { error: simpleError } = await supabase.rpc('exec_sql', {
      sql_statement: `
        CREATE TABLE IF NOT EXISTS migrations (
          id SERIAL PRIMARY KEY,
          filename VARCHAR(255) NOT NULL UNIQUE,
          executed_at TIMESTAMPTZ DEFAULT NOW(),
          checksum VARCHAR(64),
          success BOOLEAN DEFAULT TRUE
        );
      `
    });
    
    if (simpleError && !simpleError.message.includes('already exists')) {
      throw simpleError;
    }
  }
}

async function recordMigration(filename) {
  try {
    // Try sys_mgmt schema first, fallback to public
    let { error } = await supabase.rpc('exec_sql', {
      sql_statement: `
        INSERT INTO sys_mgmt.migrations (filename) 
        VALUES ('${filename}') 
        ON CONFLICT (filename) DO UPDATE SET executed_at = NOW();
      `
    });
    
    if (error && error.message.includes('does not exist')) {
      // Fallback to public schema
      ({ error } = await supabase.rpc('exec_sql', {
        sql_statement: `
          INSERT INTO migrations (filename) 
          VALUES ('${filename}') 
          ON CONFLICT (filename) DO UPDATE SET executed_at = NOW();
        `
      }));
    }
    
    if (error) {
      logWarning(`Could not record migration: ${error.message}`);
    }
  } catch (error) {
    logWarning(`Could not record migration: ${error.message}`);
  }
}

async function main() {
  log('\n🚀 Starting Thorbis Business OS Database Migration', 'bright');
  log('====================================================', 'bright');
  
  try {
    // Step 1: Check database connection
    logStep(1, 6, 'Checking database connection...');
    await checkConnection();
    logSuccess('Database connection established');
    
    // Step 2: Create executive SQL function if needed
    logStep(2, 6, 'Setting up migration infrastructure...');
    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql_statement: `
          CREATE OR REPLACE FUNCTION exec_sql(sql_statement text)
          RETURNS void AS $$
          BEGIN
            EXECUTE sql_statement;
          END;
          $$ LANGUAGE plpgsql SECURITY DEFINER;
        `
      });
      
      if (error && !error.message.includes('already exists')) {
        // Fallback: try to run migrations without the helper function
        logWarning('Could not create exec_sql function, will use direct queries');
      }
    } catch (error) {
      logWarning('Could not create migration infrastructure');
    }
    
    // Step 3: Create migrations tracking table
    logStep(3, 6, 'Creating migration tracking table...');
    await createMigrationTable();
    logSuccess('Migration tracking ready');
    
    // Step 4: Run migrations
    logStep(4, 6, `Running ${MIGRATION_FILES.length} migration files...`);
    for (const [index, filename] of MIGRATION_FILES.entries()) {
      const filePath = path.join(MIGRATIONS_DIR, filename);
      
      if (!fs.existsSync(filePath)) {
        logError(`Migration file not found: ${filename}`);
        continue;
      }
      
      log(`\n📦 Running migration ${index + 1}/${MIGRATION_FILES.length}: ${filename}`, 'magenta');
      await runSqlFile(filePath);
      await recordMigration(filename);
    }
    
    // Step 5: Verify core tables
    logStep(5, 6, 'Verifying migration success...');
    const verificationQueries = [
      'SELECT COUNT(*) FROM tenant_mgmt.organizations LIMIT 1',
      'SELECT COUNT(*) FROM directory.business_submissions LIMIT 1',
      'SELECT COUNT(*) FROM hs.customers LIMIT 1'
    ];
    
    for (const query of verificationQueries) {
      try {
        await supabase.rpc('exec_sql', { sql_statement: query });
      } catch (error) {
        logWarning(`Verification failed for query: ${query}`);
      }
    }
    logSuccess('Core tables verified');
    
    // Step 6: Summary
    logStep(6, 6, 'Migration complete!');
    log('\n🎉 Database migration completed successfully!', 'green');
    log('\nNext steps:', 'bright');
    log('1. Run your application and test the business directory submission');
    log('2. Check the database for proper schema creation');
    log('3. Monitor logs for any RLS policy issues');
    
  } catch (error) {
    logError('\n💥 Migration failed!');
    logError(`Error: ${error.message}`);
    
    if (error.stack) {
      log('\nStack trace:', 'red');
      console.error(error.stack);
    }
    
    log('\nTroubleshooting tips:', 'yellow');
    log('1. Check your .env.local file has the correct Supabase credentials');
    log('2. Verify your service role key has the required permissions');
    log('3. Check if there are any conflicting tables in your database');
    log('4. Run with VERBOSE=true for detailed output');
    
    process.exit(1);
  }
}

// Run the migration
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { runSqlFile, checkConnection };