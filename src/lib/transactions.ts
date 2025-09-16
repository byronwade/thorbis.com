import { TransactionsDAL } from '../database/transactions'
import { AccountsDAL } from '../database/accounts'
import { Transaction, TransactionEntry } from '@/types/accounting'

export class TransactionsService {
  // Get all transactions
  static async getTransactions(): Promise<Transaction[]> {
    try {
      return await TransactionsDAL.getAllTransactions()
    } catch (error) {
      console.error('Error fetching transactions:', error)
      throw new Error('Failed to fetch transactions')
    }
  }

  // Get transaction by ID
  static async getTransaction(id: string): Promise<Transaction | null> {
    try {
      return await TransactionsDAL.getTransactionById(id)
    } catch (error) {
      console.error('Error fetching transaction:', error)
      throw new Error('Failed to fetch transaction')
    }
  }

  // Get transactions by date range
  static async getTransactionsByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
    try {
      return await TransactionsDAL.getTransactionsByDateRange(startDate, endDate)
    } catch (error) {
      console.error('Error fetching transactions by date range:', error)
      throw new Error('Failed to fetch transactions by date range')
    }
  }

  // Get transactions by account
  static async getTransactionsByAccount(accountId: string): Promise<Transaction[]> {
    try {
      return await TransactionsDAL.getTransactionsByAccount(accountId)
    } catch (error) {
      console.error('Error fetching transactions by account:', error)
      throw new Error('Failed to fetch transactions by account')
    }
  }

  // Create new transaction
  static async createTransaction(
    transactionData: Omit<Transaction, 'id' | 'created_at' | 'updated_at' | 'entries'>,
    entries: Omit<TransactionEntry, 'id' | 'transaction_id' | 'account' | 'created_at'>[]
  ): Promise<Transaction> {
    try {
      // Validate required fields
      if (!transactionData.description || !transactionData.date) {
        throw new Error('Description and date are required')
      }

      // Validate entries
      if (!entries || entries.length < 2) {
        throw new Error('At least two journal entries are required')
      }

      // Validate that debits equal credits
      const totalDebits = entries.reduce((sum, entry) => sum + entry.debit_amount, 0)
      const totalCredits = entries.reduce((sum, entry) => sum + entry.credit_amount, 0)
      
      if (Math.abs(totalDebits - totalCredits) > 0.01) {
        throw new Error('Total debits must equal total credits')
      }

      // Validate all accounts exist
      for (const entry of entries) {
        const account = await AccountsDAL.getAccountById(entry.account_id)
        if (!account) {
          throw new Error('Account with ID ${entry.account_id} not found')
        }
      }

      // Validate entry amounts
      for (const entry of entries) {
        if (entry.debit_amount < 0 || entry.credit_amount < 0) {
          throw new Error('Debit and credit amounts cannot be negative')
        }
        if (entry.debit_amount > 0 && entry.credit_amount > 0) {
          throw new Error('An entry cannot have both debit and credit amounts')
        }
        if (entry.debit_amount === 0 && entry.credit_amount === 0) {
          throw new Error('An entry must have either a debit or credit amount')
        }
      }

      return await TransactionsDAL.createTransaction(transactionData, entries)
    } catch (error) {
      console.error('Error creating transaction:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to create transaction')
    }
  }

  // Update transaction
  static async updateTransaction(
    id: string,
    updates: Partial<Transaction>,
    newEntries?: Omit<TransactionEntry, 'id' | 'transaction_id' | 'account' | 'created_at'>[]
  ): Promise<Transaction> {
    try {
      // Validate entries if provided
      if (newEntries) {
        if (newEntries.length < 2) {
          throw new Error('At least two journal entries are required')
        }

        // Validate that debits equal credits
        const totalDebits = newEntries.reduce((sum, entry) => sum + entry.debit_amount, 0)
        const totalCredits = newEntries.reduce((sum, entry) => sum + entry.credit_amount, 0)
        
        if (Math.abs(totalDebits - totalCredits) > 0.01) {
          throw new Error('Total debits must equal total credits')
        }

        // Validate all accounts exist
        for (const entry of newEntries) {
          const account = await AccountsDAL.getAccountById(entry.account_id)
          if (!account) {
            throw new Error('Account with ID ${entry.account_id} not found')
          }
        }

        // Validate entry amounts
        for (const entry of newEntries) {
          if (entry.debit_amount < 0 || entry.credit_amount < 0) {
            throw new Error('Debit and credit amounts cannot be negative')
          }
          if (entry.debit_amount > 0 && entry.credit_amount > 0) {
            throw new Error('An entry cannot have both debit and credit amounts')
          }
          if (entry.debit_amount === 0 && entry.credit_amount === 0) {
            throw new Error('An entry must have either a debit or credit amount')
          }
        }
      }

      return await TransactionsDAL.updateTransaction(id, updates, newEntries)
    } catch (error) {
      console.error('Error updating transaction:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to update transaction')
    }
  }

  // Delete transaction
  static async deleteTransaction(id: string): Promise<void> {
    try {
      const deleted = await TransactionsDAL.deleteTransaction(id)
      if (!deleted) {
        throw new Error('Transaction not found')
      }
    } catch (error) {
      console.error('Error deleting transaction:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to delete transaction')
    }
  }

  // Search transactions
  static async searchTransactions(searchTerm: string): Promise<Transaction[]> {
    try {
      return await TransactionsDAL.searchTransactions(searchTerm)
    } catch (error) {
      console.error('Error searching transactions:', error)
      throw new Error('Failed to search transactions')
    }
  }

  // Get transaction summary statistics
  static async getTransactionSummary(): Promise<{
    totalIncome: number
    totalExpenses: number
    netIncome: number
    pendingCount: number
    aiCategorized: number
    aiAccuracy: number
  }> {
    try {
      const transactions = await TransactionsDAL.getAllTransactions()
      
      const totalIncome = transactions
        .filter(txn => txn.entries.some(entry => entry.account.type === 'revenue'))
        .reduce((sum, txn) => sum + txn.total_amount, 0)

      const totalExpenses = transactions
        .filter(txn => txn.entries.some(entry => entry.account.type === 'expense'))
        .reduce((sum, txn) => sum + txn.total_amount, 0)

      const netIncome = totalIncome - totalExpenses
      const pendingCount = transactions.filter(txn => txn.status === 'draft').length

      // AI categorization stats (mock for now)
      const aiCategorized = transactions.filter(txn => txn.ai_categorization).length
      const aiAccuracy = transactions.reduce((sum, txn) => 
        sum + (txn.ai_categorization?.confidence || 0), 0
      ) / transactions.length

      return {
        totalIncome,
        totalExpenses,
        netIncome,
        pendingCount,
        aiCategorized,
        aiAccuracy: isNaN(aiAccuracy) ? 0 : aiAccuracy
      }
    } catch (error) {
      console.error('Error fetching transaction summary:', error)
      throw new Error('Failed to fetch transaction summary')
    }
  }

  // Validate transaction balance
  static validateTransactionBalance(entries: { debit_amount: number; credit_amount: number }[]): {
    isValid: boolean
    totalDebits: number
    totalCredits: number
    difference: number
  } {
    const totalDebits = entries.reduce((sum, entry) => sum + entry.debit_amount, 0)
    const totalCredits = entries.reduce((sum, entry) => sum + entry.credit_amount, 0)
    const difference = totalDebits - totalCredits
    const isValid = Math.abs(difference) < 0.01

    return {
      isValid,
      totalDebits,
      totalCredits,
      difference
    }
  }

  // Get available accounts for transaction creation
  static async getAvailableAccounts() {
    try {
      return await AccountsDAL.getAllAccounts()
    } catch (error) {
      console.error('Error fetching accounts:', error)
      throw new Error('Failed to fetch accounts')
    }
  }

  // Auto-categorize transaction based on description (mock implementation)
  static autoCategorizTransaction(description: string): {
    suggestedCategory: string
    confidence: number
    suggestedAccounts: string[]
  } {
    const rules = [
      {
        keywords: ['office', 'supplies', 'staples', 'paper'],
        category: 'Office Supplies',
        confidence: 0.9,
        accounts: ['5200']
      },
      {
        keywords: ['gas', 'fuel', 'shell', 'exxon', 'bp'],
        category: 'Vehicle Expenses',
        confidence: 0.85,
        accounts: ['5800']
      },
      {
        keywords: ['marketing', 'advertising', 'google ads', 'facebook'],
        category: 'Advertising',
        confidence: 0.8,
        accounts: ['5100']
      },
      {
        keywords: ['rent', 'lease', 'office space'],
        category: 'Rent Expense',
        confidence: 0.9,
        accounts: ['5400']
      },
      {
        keywords: ['utilities', 'electricity', 'water', 'internet'],
        category: 'Utilities',
        confidence: 0.85,
        accounts: ['5500']
      }
    ]

    const lowerDescription = description.toLowerCase()
    
    for (const rule of rules) {
      const matchedKeywords = rule.keywords.filter(keyword => 
        lowerDescription.includes(keyword)
      )
      
      if (matchedKeywords.length > 0) {
        return {
          suggestedCategory: rule.category,
          confidence: rule.confidence,
          suggestedAccounts: rule.accounts
        }
      }
    }

    // Default fallback
    return {
      suggestedCategory: 'General Expense',
      confidence: 0.5,
      suggestedAccounts: ['5200']
    }
  }

  // Get transactions for a specific time period
  static async getTransactionsForPeriod(period: 'today' | 'week' | 'month' | 'quarter' | 'year'): Promise<Transaction[]> {
    try {
      const now = new Date()
      let startDate: string
      const endDate = now.toISOString().split('T')[0]

      switch (period) {
        case 'today':
          startDate = endDate
          break
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          startDate = weekAgo.toISOString().split('T')[0]
          break
        case 'month':
          const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
          startDate = monthAgo.toISOString().split('T')[0]
          break
        case 'quarter':
          const quarterAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
          startDate = quarterAgo.toISOString().split('T')[0]
          break
        case 'year':
          const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
          startDate = yearAgo.toISOString().split('T')[0]
          break
        default:
          startDate = endDate
      }

      return await TransactionsDAL.getTransactionsByDateRange(startDate, endDate)
    } catch (error) {
      console.error('Error fetching transactions for period:', error)
      throw new Error('Failed to fetch transactions for period')
    }
  }
}