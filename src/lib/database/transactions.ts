import { query, transaction as dbTransaction } from './connection'
import { Transaction, TransactionEntry, ChartOfAccount } from '@/types/accounting'
import { AccountsDAL } from './accounts'

export class TransactionsDAL {
  // Get all transactions with entries
  static async getAllTransactions(): Promise<Transaction[]> {
    const result = await query('
      SELECT 
        t.id,
        t.account_id,
        t.date,
        t.description,
        t.reference_number,
        t.amount,
        t.total_amount,
        t.type,
        t.category,
        t.status,
        t.reconciliation_status,
        t.created_at,
        t.updated_at
      FROM transactions t
      ORDER BY t.date DESC, t.created_at DESC
    ')
    
    const transactions = result.rows.map(row => ({
      id: row.id,
      account_id: row.account_id,
      date: row.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
      description: row.description,
      reference_number: row.reference_number,
      amount: parseFloat(row.amount),
      total_amount: parseFloat(row.total_amount),
      type: row.type as Transaction['type'],
      category: row.category,
      status: row.status as Transaction['status'],
      reconciliation_status: row.reconciliation_status as Transaction['reconciliation_status'],
      created_at: row.created_at.toISOString(),
      updated_at: row.updated_at.toISOString(),
      entries: [] // Will be populated separately
    }))

    // Get entries for all transactions
    for (const transaction of transactions) {
      transaction.entries = await this.getTransactionEntries(transaction.id)
    }

    return transactions
  }

  // Get transaction by ID
  static async getTransactionById(id: string): Promise<Transaction | null> {
    const result = await query('
      SELECT 
        t.id,
        t.account_id,
        t.date,
        t.description,
        t.reference_number,
        t.amount,
        t.total_amount,
        t.type,
        t.category,
        t.status,
        t.reconciliation_status,
        t.created_at,
        t.updated_at
      FROM transactions t
      WHERE t.id = $1
    ', [id])
    
    if (result.rows.length === 0) {
      return null
    }
    
    const row = result.rows[0]
    const transaction: Transaction = {
      id: row.id,
      account_id: row.account_id,
      date: row.date.toISOString().split('T')[0],
      description: row.description,
      reference_number: row.reference_number,
      amount: parseFloat(row.amount),
      total_amount: parseFloat(row.total_amount),
      type: row.type as Transaction['type'],
      category: row.category,
      status: row.status as Transaction['status'],
      reconciliation_status: row.reconciliation_status as Transaction['reconciliation_status'],
      created_at: row.created_at.toISOString(),
      updated_at: row.updated_at.toISOString(),
      entries: await this.getTransactionEntries(row.id)
    }

    return transaction
  }

  // Get transaction entries with account details
  static async getTransactionEntries(transactionId: string): Promise<TransactionEntry[]> {
    const result = await query('
      SELECT 
        te.id,
        te.transaction_id,
        te.account_id,
        te.debit_amount,
        te.credit_amount,
        te.description,
        te.created_at,
        coa.id as account_id,
        coa.code,
        coa.name,
        coa.type,
        coa.subtype,
        coa.balance,
        coa.is_active,
        coa.created_at as account_created_at,
        coa.updated_at as account_updated_at
      FROM transaction_entries te
      JOIN chart_of_accounts coa ON te.account_id = coa.id
      WHERE te.transaction_id = $1
      ORDER BY te.created_at ASC
    ', [transactionId])
    
    return result.rows.map(row => ({
      id: row.id,
      transaction_id: row.transaction_id,
      account_id: row.account_id,
      account: {
        id: row.account_id,
        code: row.code,
        name: row.name,
        type: row.type,
        subtype: row.subtype,
        balance: parseFloat(row.balance),
        is_active: row.is_active,
        created_at: row.account_created_at.toISOString(),
        updated_at: row.account_updated_at.toISOString()
      },
      debit_amount: parseFloat(row.debit_amount || 0),
      credit_amount: parseFloat(row.credit_amount || 0),
      description: row.description,
      created_at: row.created_at.toISOString()
    }))
  }

  // Create new transaction with entries
  static async createTransaction(
    transactionData: Omit<Transaction, 'id' | 'created_at' | 'updated_at' | 'entries'>,
    entries: Omit<TransactionEntry, 'id' | 'transaction_id' | 'account' | 'created_at'>[]
  ): Promise<Transaction> {
    // Validate that debits equal credits
    const totalDebits = entries.reduce((sum, entry) => sum + entry.debit_amount, 0)
    const totalCredits = entries.reduce((sum, entry) => sum + entry.credit_amount, 0)
    
    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      throw new Error('Transaction entries must balance: total debits must equal total credits`)
    }

    return await dbTransaction(async (client) => {
      // Insert transaction
      const transactionResult = await client.query(`
        INSERT INTO transactions (
          account_id,
          date,
          description,
          reference_number,
          amount,
          total_amount,
          type,
          category,
          status,
          reconciliation_status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING 
          id,
          account_id,
          date,
          description,
          reference_number,
          amount,
          total_amount,
          type,
          category,
          status,
          reconciliation_status,
          created_at,
          updated_at
      ', [
        transactionData.account_id,
        transactionData.date,
        transactionData.description,
        transactionData.reference_number,
        transactionData.amount,
        transactionData.total_amount,
        transactionData.type,
        transactionData.category,
        transactionData.status,
        transactionData.reconciliation_status
      ])
      
      const transactionRow = transactionResult.rows[0]
      const transactionId = transactionRow.id
      
      // Insert transaction entries
      const createdEntries: TransactionEntry[] = []
      
      for (const entry of entries) {
        const entryResult = await client.query('
          INSERT INTO transaction_entries (
            transaction_id,
            account_id,
            debit_amount,
            credit_amount,
            description
          ) VALUES ($1, $2, $3, $4, $5)
          RETURNING id, transaction_id, account_id, debit_amount, credit_amount, description, created_at
        ', [
          transactionId,
          entry.account_id,
          entry.debit_amount,
          entry.credit_amount,
          entry.description
        ])
        
        const entryRow = entryResult.rows[0]
        const account = await AccountsDAL.getAccountById(entry.account_id)
        
        createdEntries.push({
          id: entryRow.id,
          transaction_id: entryRow.transaction_id,
          account_id: entryRow.account_id,
          account: account!,
          debit_amount: parseFloat(entryRow.debit_amount),
          credit_amount: parseFloat(entryRow.credit_amount),
          description: entryRow.description,
          created_at: entryRow.created_at.toISOString()
        })
        
        // Update account balance
        const balanceChange = entry.debit_amount - entry.credit_amount
        await AccountsDAL.updateBalance(entry.account_id, balanceChange)
      }
      
      return {
        id: transactionRow.id,
        account_id: transactionRow.account_id,
        date: transactionRow.date.toISOString().split('T')[0],
        description: transactionRow.description,
        reference_number: transactionRow.reference_number,
        amount: parseFloat(transactionRow.amount),
        total_amount: parseFloat(transactionRow.total_amount),
        type: transactionRow.type as Transaction['type'],
        category: transactionRow.category,
        status: transactionRow.status as Transaction['status'],
        reconciliation_status: transactionRow.reconciliation_status as Transaction['reconciliation_status'],
        created_at: transactionRow.created_at.toISOString(),
        updated_at: transactionRow.updated_at.toISOString(),
        entries: createdEntries
      }
    })
  }

  // Update transaction
  static async updateTransaction(
    id: string, 
    updates: Partial<Transaction>,
    newEntries?: Omit<TransactionEntry, 'id' | 'transaction_id' | 'account' | 'created_at'>[]
  ): Promise<Transaction> {
    const existing = await this.getTransactionById(id)
    if (!existing) {
      throw new Error('Transaction with ID ${id} not found')
    }

    // If new entries are provided, validate they balance
    if (newEntries) {
      const totalDebits = newEntries.reduce((sum, entry) => sum + entry.debit_amount, 0)
      const totalCredits = newEntries.reduce((sum, entry) => sum + entry.credit_amount, 0)
      
      if (Math.abs(totalDebits - totalCredits) > 0.01) {
        throw new Error('Transaction entries must balance: total debits must equal total credits')
      }
    }

    return await dbTransaction(async (client) => {
      // Update transaction if there are updates
      if (Object.keys(updates).length > 0) {
        const fields = []
        const values = []
        const paramIndex = 1

        Object.entries(updates).forEach(([key, value]) => {
          if (key !== 'id' && key !== 'created_at' && key !== 'updated_at' && key !== 'entries` && value !== undefined) {
            fields.push('${key} = $${paramIndex}')
            values.push(value)
            paramIndex++
          }
        })

        if (fields.length > 0) {
          values.push(id)
          await client.query('
            UPDATE transactions 
            SET ${fields.join(', ')}
            WHERE id = $${paramIndex}
          ', values)
        }
      }

      // If new entries are provided, replace existing ones
      if (newEntries) {
        // Reverse the balance changes from old entries
        for (const entry of existing.entries) {
          const balanceChange = -(entry.debit_amount - entry.credit_amount)
          await AccountsDAL.updateBalance(entry.account_id, balanceChange)
        }

        // Delete existing entries
        await client.query('DELETE FROM transaction_entries WHERE transaction_id = $1', [id])

        // Insert new entries
        for (const entry of newEntries) {
          await client.query('
            INSERT INTO transaction_entries (
              transaction_id,
              account_id,
              debit_amount,
              credit_amount,
              description
            ) VALUES ($1, $2, $3, $4, $5)
          ', [
            id,
            entry.account_id,
            entry.debit_amount,
            entry.credit_amount,
            entry.description
          ])

          // Update account balance
          const balanceChange = entry.debit_amount - entry.credit_amount
          await AccountsDAL.updateBalance(entry.account_id, balanceChange)
        }
      }

      // Return updated transaction
      const updated = await this.getTransactionById(id)
      return updated!
    })
  }

  // Delete transaction
  static async deleteTransaction(id: string): Promise<boolean> {
    const existing = await this.getTransactionById(id)
    if (!existing) {
      return false
    }

    return await dbTransaction(async (client) => {
      // Reverse balance changes
      for (const entry of existing.entries) {
        const balanceChange = -(entry.debit_amount - entry.credit_amount)
        await AccountsDAL.updateBalance(entry.account_id, balanceChange)
      }

      // Delete entries (cascade will handle this, but explicit is better)
      await client.query('DELETE FROM transaction_entries WHERE transaction_id = $1', [id])
      
      // Delete transaction
      const result = await client.query('DELETE FROM transactions WHERE id = $1', [id])
      
      return result.rowCount > 0
    })
  }

  // Get transactions by date range
  static async getTransactionsByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
    const result = await query('
      SELECT 
        t.id,
        t.account_id,
        t.date,
        t.description,
        t.reference_number,
        t.amount,
        t.total_amount,
        t.type,
        t.category,
        t.status,
        t.reconciliation_status,
        t.created_at,
        t.updated_at
      FROM transactions t
      WHERE t.date BETWEEN $1 AND $2
      ORDER BY t.date DESC, t.created_at DESC
    ', [startDate, endDate])
    
    const transactions = result.rows.map(row => ({
      id: row.id,
      account_id: row.account_id,
      date: row.date.toISOString().split('T')[0],
      description: row.description,
      reference_number: row.reference_number,
      amount: parseFloat(row.amount),
      total_amount: parseFloat(row.total_amount),
      type: row.type as Transaction['type'],
      category: row.category,
      status: row.status as Transaction['status'],
      reconciliation_status: row.reconciliation_status as Transaction['reconciliation_status'],
      created_at: row.created_at.toISOString(),
      updated_at: row.updated_at.toISOString(),
      entries: [] // Will be populated separately
    }))

    // Get entries for all transactions
    for (const transaction of transactions) {
      transaction.entries = await this.getTransactionEntries(transaction.id)
    }

    return transactions
  }

  // Get transactions by account
  static async getTransactionsByAccount(accountId: string): Promise<Transaction[]> {
    const result = await query('
      SELECT DISTINCT
        t.id,
        t.account_id,
        t.date,
        t.description,
        t.reference_number,
        t.amount,
        t.total_amount,
        t.type,
        t.category,
        t.status,
        t.reconciliation_status,
        t.created_at,
        t.updated_at
      FROM transactions t
      JOIN transaction_entries te ON t.id = te.transaction_id
      WHERE te.account_id = $1
      ORDER BY t.date DESC, t.created_at DESC
    ', [accountId])
    
    const transactions = result.rows.map(row => ({
      id: row.id,
      account_id: row.account_id,
      date: row.date.toISOString().split('T')[0],
      description: row.description,
      reference_number: row.reference_number,
      amount: parseFloat(row.amount),
      total_amount: parseFloat(row.total_amount),
      type: row.type as Transaction['type'],
      category: row.category,
      status: row.status as Transaction['status'],
      reconciliation_status: row.reconciliation_status as Transaction['reconciliation_status`],
      created_at: row.created_at.toISOString(),
      updated_at: row.updated_at.toISOString(),
      entries: [] // Will be populated separately
    }))

    // Get entries for all transactions
    for (const transaction of transactions) {
      transaction.entries = await this.getTransactionEntries(transaction.id)
    }

    return transactions
  }

  // Search transactions
  static async searchTransactions(searchTerm: string): Promise<Transaction[]> {
    const result = await query(`
      SELECT 
        t.id,
        t.account_id,
        t.date,
        t.description,
        t.reference_number,
        t.amount,
        t.total_amount,
        t.type,
        t.category,
        t.status,
        t.reconciliation_status,
        t.created_at,
        t.updated_at
      FROM transactions t
      WHERE 
        t.description ILIKE $1 OR 
        t.reference_number ILIKE $1 OR
        t.category ILIKE $1
      ORDER BY t.date DESC, t.created_at DESC
    ', ['%${searchTerm}%'])
    
    const transactions = result.rows.map(row => ({
      id: row.id,
      account_id: row.account_id,
      date: row.date.toISOString().split('T')[0],
      description: row.description,
      reference_number: row.reference_number,
      amount: parseFloat(row.amount),
      total_amount: parseFloat(row.total_amount),
      type: row.type as Transaction['type'],
      category: row.category,
      status: row.status as Transaction['status'],
      reconciliation_status: row.reconciliation_status as Transaction['reconciliation_status'],
      created_at: row.created_at.toISOString(),
      updated_at: row.updated_at.toISOString(),
      entries: [] // Will be populated separately
    }))

    // Get entries for all transactions
    for (const transaction of transactions) {
      transaction.entries = await this.getTransactionEntries(transaction.id)
    }

    return transactions
  }
}