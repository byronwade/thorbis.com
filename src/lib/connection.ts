import { Pool, Client, PoolConfig } from 'pg'

// Database configuration
const dbConfig: PoolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'books_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error if connection takes longer than 2 seconds
}

// Create connection pool
let pool: Pool

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool(dbConfig)
    
    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err)
    })
  }
  
  return pool
}

// Get a single client from the pool
export async function getClient() {
  return await getPool().connect()
}

// Execute a query with the pool
export async function query(text: string, params?: unknown[]) {
  const pool = getPool()
  const result = await pool.query(text, params)
  return result
}

// Execute a transaction
export async function transaction<T>(
  callback: (client: Client) => Promise<T>
): Promise<T> {
  const client = await getClient()
  
  try {
    await client.query('BEGIN')
    const result = await callback(client as Client)
    await client.query('COMMIT')
    return result
  } catch (_error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

// Check database connection
export async function checkConnection(): Promise<boolean> {
  try {
    const result = await query('SELECT NOW()')
    return !!result
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}

// Initialize database (run migrations)
export async function initializeDatabase(): Promise<void> {
  try {
    // Check if tables exist
    const result = await query('
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'chart_of_accounts'
      );
    ')
    
    if (!result.rows[0].exists) {
      console.log('Database tables do not exist. Please run the schema.sql file to initialize the database.')
      throw new Error('Database not initialized. Run schema.sql first.')
    }
    
    console.log('Database connection established successfully')
  } catch (error) {
    console.error('Failed to initialize database:', error)
    throw error
  }
}

// Close all database connections
export async function closeConnections(): Promise<void> {
  if (pool) {
    await pool.end()
  }
}