import { AccountsDAL } from '../database/accounts'
import { ChartOfAccount, AccountType } from '@/types/accounting'

export class AccountsService {
  // Get all accounts
  static async getAccounts(): Promise<ChartOfAccount[]> {
    try {
      return await AccountsDAL.getAllAccounts()
    } catch (error) {
      console.error('Error fetching accounts:', error)
      throw new Error('Failed to fetch accounts')
    }
  }

  // Get account by ID
  static async getAccount(id: string): Promise<ChartOfAccount | null> {
    try {
      return await AccountsDAL.getAccountById(id)
    } catch (error) {
      console.error('Error fetching account:', error)
      throw new Error('Failed to fetch account')
    }
  }

  // Get accounts by type
  static async getAccountsByType(type: AccountType): Promise<ChartOfAccount[]> {
    try {
      return await AccountsDAL.getAccountsByType(type)
    } catch (error) {
      console.error('Error fetching accounts by type:', error)
      throw new Error('Failed to fetch accounts by type')
    }
  }

  // Create new account
  static async createAccount(accountData: Omit<ChartOfAccount, 'id' | 'created_at' | 'updated_at'>): Promise<ChartOfAccount> {
    try {
      // Validate required fields
      if (!accountData.code || !accountData.name || !accountData.type) {
        throw new Error('Code, name, and type are required fields')
      }

      // Validate account code format (4 digits)
      if (!/^\d{4}$/.test(accountData.code)) {
        throw new Error('Account code must be exactly 4 digits')
      }

      return await AccountsDAL.createAccount(accountData)
    } catch (error) {
      console.error('Error creating account:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to create account')
    }
  }

  // Update account
  static async updateAccount(id: string, updates: Partial<ChartOfAccount>): Promise<ChartOfAccount> {
    try {
      // Validate account code format if being updated
      if (updates.code && !/^\d{4}$/.test(updates.code)) {
        throw new Error('Account code must be exactly 4 digits')
      }

      return await AccountsDAL.updateAccount(id, updates)
    } catch (error) {
      console.error('Error updating account:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to update account')
    }
  }

  // Delete account
  static async deleteAccount(id: string): Promise<void> {
    try {
      const deleted = await AccountsDAL.deleteAccount(id)
      if (!deleted) {
        throw new Error('Account not found')
      }
    } catch (error) {
      console.error('Error deleting account:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to delete account')
    }
  }

  // Search accounts
  static async searchAccounts(searchTerm: string): Promise<ChartOfAccount[]> {
    try {
      return await AccountsDAL.searchAccounts(searchTerm)
    } catch (error) {
      console.error('Error searching accounts:', error)
      throw new Error('Failed to search accounts')
    }
  }

  // Get account hierarchy
  static async getAccountHierarchy(): Promise<ChartOfAccount[]> {
    try {
      return await AccountsDAL.getAccountHierarchy()
    } catch (error) {
      console.error('Error fetching account hierarchy:', error)
      throw new Error('Failed to fetch account hierarchy')
    }
  }

  // Get account balance summary by type
  static async getBalanceSummaryByType(): Promise<Record<AccountType, { count: number; totalBalance: number }>> {
    try {
      const accounts = await AccountsDAL.getAllAccounts()
      const summary: Record<AccountType, { count: number; totalBalance: number }> = {
        asset: { count: 0, totalBalance: 0 },
        liability: { count: 0, totalBalance: 0 },
        equity: { count: 0, totalBalance: 0 },
        revenue: { count: 0, totalBalance: 0 },
        expense: { count: 0, totalBalance: 0 }
      }

      accounts.forEach(account => {
        if (account.is_active) {
          summary[account.type].count++
          summary[account.type].totalBalance += account.balance
        }
      })

      return summary
    } catch (error) {
      console.error('Error fetching balance summary:', error)
      throw new Error('Failed to fetch balance summary')
    }
  }

  // Validate account code uniqueness
  static async isAccountCodeUnique(code: string, excludeId?: string): Promise<boolean> {
    try {
      const existing = await AccountsDAL.getAccountByCode(code)
      if (!existing) return true
      if (excludeId && existing.id === excludeId) return true
      return false
    } catch (error) {
      console.error('Error checking account code uniqueness:', error)
      return false
    }
  }

  // Get available account codes (suggest next available code)
  static async getNextAvailableCode(type: AccountType): Promise<string> {
    try {
      const accounts = await AccountsDAL.getAccountsByType(type)
      
      // Define starting ranges for each account type
      const typeRanges: Record<AccountType, [number, number]> = {
        asset: [1000, 1999],
        liability: [2000, 2999],
        equity: [3000, 3999],
        revenue: [4000, 4999],
        expense: [5000, 9999]
      }
      
      const [start, end] = typeRanges[type]
      const existingCodes = new Set(accounts.map(account => parseInt(account.code)))
      
      // Find first available code in range
      for (const code = start; code <= end; code++) {
        if (!existingCodes.has(code)) {
          return code.toString().padStart(4, '0')
        }
      }
      
      throw new Error('No available account codes for type ${type}')
    } catch (error) {
      console.error('Error finding next available code:', error)
      throw new Error('Failed to find next available account code')
    }
  }
}