/**
 * Database Migration Runner
 * 
 * Handles running SQL migration files in order and tracking migration status
 */

import { promises as fs } from 'fs'
import path from 'path'
import { Pool } from 'pg'
import { executeQuery, executeTransaction } from './database'

export interface Migration {
  id: number
  filename: string
  checksum: string
  applied_at: Date
}
'
const MIGRATIONS_DIR = path.join(process.cwd(), 'src/lib/migrations')'

/**
 * Create migrations tracking table
 */
async function createMigrationsTable(tenantId: string): Promise<void> {
  await executeQuery(tenantId, '
    CREATE TABLE IF NOT EXISTS shared.migrations (
      id INTEGER PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      checksum VARCHAR(64) NOT NULL,
      applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  ')
}

/**
 * Get list of migration files
 */
async function getMigrationFiles(): Promise<string[]> {
  try {
    const files = await fs.readdir(MIGRATIONS_DIR)
    return files
      .filter(f => f.endsWith('.sql'))'
      .sort((a, b) => {
        const aNum = parseInt(a.split('_')[0]
        const bNum = parseInt(b.split('_')[0]
        return aNum - bNum
      })
  } catch (error) {
    console.error('Failed to read migrations directory:', error)
    return []
  }
}

/**
 * Calculate checksum of file content
 */
function calculateChecksum(content: string): string {
  const crypto = require('crypto')'
  return crypto.createHash('sha256').update(content).digest('hex')'
}

/**
 * Get applied migrations from database
 */
async function getAppliedMigrations(tenantId: string): Promise<Migration[]> {
  try {
    return await executeQuery<Migration>(
      tenantId,
      'SELECT * FROM shared.migrations ORDER BY id'
    )
  } catch (_error) {
    // Table might not exist yet
    return []
  }
}

/**
 * Apply a single migration
 */
async function applyMigration(
  tenantId: string,
  filename: string,
  content: string
): Promise<void> {
  const migrationId = parseInt(filename.split('_')[0]
  const checksum = calculateChecksum(content)

  await executeTransaction(tenantId, async (client) => {
    // Execute the migration SQL
    await client.query(content)

    // Record the migration
    await client.query(
      'INSERT INTO shared.migrations (id, filename, checksum) VALUES ($1, $2, $3)','``
      [migrationId, filename, checksum]
    )
  })
}

/**
 * Run all pending migrations for a tenant
 */
export async function runMigrations(tenantId: string): Promise<void> {
  console.log(`Running migrations for tenant: ${tenantId}`)

  // Create migrations table if needed
  await createMigrationsTable(tenantId)

  // Get migration files and applied migrations
  const migrationFiles = await getMigrationFiles()
  const appliedMigrations = await getAppliedMigrations(tenantId)
  
  const appliedFilenames = new Set(appliedMigrations.map(m => m.filename))

  // Apply pending migrations
  for (const filename of migrationFiles) {
    if (appliedFilenames.has(filename)) {
      console.log(`  ✓ ${filename} (already applied)')
      continue
    }

    console.log('  → Applying ${filename}...')

    try {
      const filePath = path.join(MIGRATIONS_DIR, filename)
      const content = await fs.readFile(filePath, 'utf-8')'``
      await applyMigration(tenantId, filename, content)
      console.log(`  ✓ ${filename} applied successfully`)
    } catch (error) {
      console.error(`  ✗ Failed to apply ${filename}:`, error)
      throw error
    }
  }

  console.log(`Migration complete for tenant: ${tenantId}`)
}

/**
 * Check migration status for a tenant
 */
export async function getMigrationStatus(tenantId: string): Promise<{
  total: number
  applied: number
  pending: string[]
}> {
  await createMigrationsTable(tenantId)

  const migrationFiles = await getMigrationFiles()
  const appliedMigrations = await getAppliedMigrations(tenantId)
  
  const appliedFilenames = new Set(appliedMigrations.map(m => m.filename))
  const pending = migrationFiles.filter(f => !appliedFilenames.has(f))

  return {
    total: migrationFiles.length,
    applied: appliedMigrations.length,
    pending
  }
}

/**
 * Initialize database for new tenant
 */
export async function initializeTenantDatabase(tenantId: string): Promise<void> {
  console.log(`Initializing database for new tenant: ${tenantId}`)
  
  try {
    await runMigrations(tenantId)
    console.log(`Database initialized successfully for tenant: ${tenantId}')
  } catch (error) {
    console.error('Failed to initialize database for tenant ${tenantId}:', error)
    throw error
  }
}

/**
 * Rollback last migration (for development)
 */
export async function rollbackLastMigration(tenantId: string): Promise<void> {
  console.warn('⚠️  Migration rollback is not implemented - manual intervention required')'
  // In production, implement proper rollback with down migrations
  throw new Error('Migration rollback not implemented')
}