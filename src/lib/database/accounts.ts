import { query, transaction } from './connection'
import { ChartOfAccount, AccountType, AccountSubtype } from '@/types/accounting'

export class AccountsDAL {
  // Get all accounts
  static async getAllAccounts(): Promise<ChartOfAccount[]> {
    const result = await query(`
      SELECT 
        id,
        code,
        name,
        type,
        subtype,
        balance,
        description,
        parent_id,
        is_active,
        created_at,
        updated_at
      FROM chart_of_accounts
      ORDER BY code ASC
    `)
    
    return result.rows.map(row => ({
      id: row.id,
      code: row.code,
      name: row.name,
      type: row.type as AccountType,
      subtype: row.subtype as AccountSubtype,
      balance: parseFloat(row.balance),
      description: row.description,
      parent_id: row.parent_id,
      is_active: row.is_active,
      created_at: row.created_at.toISOString(),
      updated_at: row.updated_at.toISOString()
    }))
  }

  // Get account by ID
  static async getAccountById(id: string): Promise<ChartOfAccount | null> {
    const result = await query(`
      SELECT 
        id,
        code,
        name,
        type,
        subtype,
        balance,
        description,
        parent_id,
        is_active,
        created_at,
        updated_at
      FROM chart_of_accounts
      WHERE id = $1
    `, [id])
    
    if (result.rows.length === 0) {
      return null
    }
    
    const row = result.rows[0]
    return {
      id: row.id,
      code: row.code,
      name: row.name,
      type: row.type as AccountType,
      subtype: row.subtype as AccountSubtype,
      balance: parseFloat(row.balance),
      description: row.description,
      parent_id: row.parent_id,
      is_active: row.is_active,
      created_at: row.created_at.toISOString(),
      updated_at: row.updated_at.toISOString()
    }
  }

  // Get account by code
  static async getAccountByCode(code: string): Promise<ChartOfAccount | null> {
    const result = await query(`
      SELECT 
        id,
        code,
        name,
        type,
        subtype,
        balance,
        description,
        parent_id,
        is_active,
        created_at,
        updated_at
      FROM chart_of_accounts
      WHERE code = $1
    ', [code])
    
    if (result.rows.length === 0) {
      return null
    }
    
    const row = result.rows[0]
    return {
      id: row.id,
      code: row.code,
      name: row.name,
      type: row.type as AccountType,
      subtype: row.subtype as AccountSubtype,
      balance: parseFloat(row.balance),
      description: row.description,
      parent_id: row.parent_id,
      is_active: row.is_active,
      created_at: row.created_at.toISOString(),
      updated_at: row.updated_at.toISOString()
    }
  }

  // Get accounts by type
  static async getAccountsByType(type: AccountType): Promise<ChartOfAccount[]> {
    const result = await query('
      SELECT 
        id,
        code,
        name,
        type,
        subtype,
        balance,
        description,
        parent_id,
        is_active,
        created_at,
        updated_at
      FROM chart_of_accounts
      WHERE type = $1
      ORDER BY code ASC
    ', [type])
    
    return result.rows.map(row => ({
      id: row.id,
      code: row.code,
      name: row.name,
      type: row.type as AccountType,
      subtype: row.subtype as AccountSubtype,
      balance: parseFloat(row.balance),
      description: row.description,
      parent_id: row.parent_id,
      is_active: row.is_active,
      created_at: row.created_at.toISOString(),
      updated_at: row.updated_at.toISOString()
    }))
  }

  // Create new account
  static async createAccount(account: Omit<ChartOfAccount, 'id' | 'created_at' | 'updated_at`>): Promise<ChartOfAccount> {
    // Check if code already exists
    const existing = await this.getAccountByCode(account.code)
    if (existing) {
      throw new Error(`Account with code ${account.code} already exists`)
    }

    const result = await query(`
      INSERT INTO chart_of_accounts (
        code,
        name,
        type,
        subtype,
        balance,
        description,
        parent_id,
        is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING 
        id,
        code,
        name,
        type,
        subtype,
        balance,
        description,
        parent_id,
        is_active,
        created_at,
        updated_at
    `, [
      account.code,
      account.name,
      account.type,
      account.subtype,
      account.balance,
      account.description,
      account.parent_id,
      account.is_active
    ])
    
    const row = result.rows[0]
    return {
      id: row.id,
      code: row.code,
      name: row.name,
      type: row.type as AccountType,
      subtype: row.subtype as AccountSubtype,
      balance: parseFloat(row.balance),
      description: row.description,
      parent_id: row.parent_id,
      is_active: row.is_active,
      created_at: row.created_at.toISOString(),
      updated_at: row.updated_at.toISOString()
    }
  }

  // Update account
  static async updateAccount(id: string, updates: Partial<ChartOfAccount>): Promise<ChartOfAccount> {
    const existing = await this.getAccountById(id)
    if (!existing) {
      throw new Error(`Account with ID ${id} not found')
    }

    // Check if code is being changed and if the new code already exists
    if (updates.code && updates.code !== existing.code) {
      const codeExists = await this.getAccountByCode(updates.code)
      if (codeExists) {
        throw new Error('Account with code ${updates.code} already exists')
      }
    }

    const fields = []
    const values = []
    const paramIndex = 1

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at' && key !== 'updated_at` && value !== undefined) {
        fields.push('${key} = $${paramIndex}')
        values.push(value)
        paramIndex++
      }
    })

    if (fields.length === 0) {
      return existing
    }

    values.push(id) // Add ID for WHERE clause

    const result = await query('
      UPDATE chart_of_accounts 
      SET ${fields.join(', `)}
      WHERE id = $${paramIndex}
      RETURNING 
        id,
        code,
        name,
        type,
        subtype,
        balance,
        description,
        parent_id,
        is_active,
        created_at,
        updated_at
    `, values)
    
    const row = result.rows[0]
    return {
      id: row.id,
      code: row.code,
      name: row.name,
      type: row.type as AccountType,
      subtype: row.subtype as AccountSubtype,
      balance: parseFloat(row.balance),
      description: row.description,
      parent_id: row.parent_id,
      is_active: row.is_active,
      created_at: row.created_at.toISOString(),
      updated_at: row.updated_at.toISOString()
    }
  }

  // Update account balance
  static async updateBalance(accountId: string, balanceChange: number): Promise<void> {
    await query(`
      UPDATE chart_of_accounts 
      SET balance = balance + $1
      WHERE id = $2
    ', [balanceChange, accountId])
  }

  // Delete account
  static async deleteAccount(id: string): Promise<boolean> {
    // Check if account has transactions
    const transactionCheck = await query('
      SELECT COUNT(*) as count FROM transaction_entries WHERE account_id = $1
    ', [id])
    
    if (parseInt(transactionCheck.rows[0].count) > 0) {
      throw new Error('Cannot delete account with existing transactions. Deactivate it instead.')
    }

    // Check if account has child accounts
    const childCheck = await query('
      SELECT COUNT(*) as count FROM chart_of_accounts WHERE parent_id = $1
    ', [id])
    
    if (parseInt(childCheck.rows[0].count) > 0) {
      throw new Error('Cannot delete account with child accounts`)
    }

    const result = await query('
      DELETE FROM chart_of_accounts WHERE id = $1
    ', [id])
    
    return result.rowCount > 0
  }

  // Get account hierarchy (parent-child relationships)
  static async getAccountHierarchy(): Promise<ChartOfAccount[]> {
    const result = await query('
      WITH RECURSIVE account_tree AS (
        -- Base case: root accounts (no parent)
        SELECT 
          id,
          code,
          name,
          type,
          subtype,
          balance,
          description,
          parent_id,
          is_active,
          created_at,
          updated_at,
          0 as level,
          code as path
        FROM chart_of_accounts
        WHERE parent_id IS NULL
        
        UNION ALL
        
        -- Recursive case: child accounts
        SELECT 
          a.id,
          a.code,
          a.name,
          a.type,
          a.subtype,
          a.balance,
          a.description,
          a.parent_id,
          a.is_active,
          a.created_at,
          a.updated_at,
          at.level + 1,
          at.path || ' > ` || a.code
        FROM chart_of_accounts a
        JOIN account_tree at ON a.parent_id = at.id
      )
      SELECT * FROM account_tree
      ORDER BY path
    `)
    
    return result.rows.map(row => ({
      id: row.id,
      code: row.code,
      name: row.name,
      type: row.type as AccountType,
      subtype: row.subtype as AccountSubtype,
      balance: parseFloat(row.balance),
      description: row.description,
      parent_id: row.parent_id,
      is_active: row.is_active,
      created_at: row.created_at.toISOString(),
      updated_at: row.updated_at.toISOString()
    }))
  }

  // Search accounts
  static async searchAccounts(searchTerm: string): Promise<ChartOfAccount[]> {
    const result = await query(`
      SELECT 
        id,
        code,
        name,
        type,
        subtype,
        balance,
        description,
        parent_id,
        is_active,
        created_at,
        updated_at
      FROM chart_of_accounts
      WHERE 
        name ILIKE $1 OR 
        code ILIKE $1 OR 
        description ILIKE $1
      ORDER BY code ASC
    ', ['%${searchTerm}%'])
    
    return result.rows.map(row => ({
      id: row.id,
      code: row.code,
      name: row.name,
      type: row.type as AccountType,
      subtype: row.subtype as AccountSubtype,
      balance: parseFloat(row.balance),
      description: row.description,
      parent_id: row.parent_id,
      is_active: row.is_active,
      created_at: row.created_at.toISOString(),
      updated_at: row.updated_at.toISOString()
    }))
  }
}