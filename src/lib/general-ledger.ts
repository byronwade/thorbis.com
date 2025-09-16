import { Transaction, TransactionEntry, ChartOfAccount } from '@/types/accounting'

export interface LedgerEntry {
  id: string
  date: string
  account_id: string
  account_code: string
  account_name: string
  description: string
  debit_amount: number
  credit_amount: number
  running_balance: number
  transaction_id: string
  reference_number?: string
  created_at: string
}

export interface AnomalyDetection {
  id: string
  type: 'unbalanced_entry' | 'unusual_amount' | 'duplicate_transaction' | 'account_mismatch' | 'timing_anomaly'
  severity: 'low' | 'medium' | 'high' | 'critical'
  transaction_id: string
  description: string
  suggested_fix?: string
  confidence: number
  detected_at: string
}

export interface BalancingSuggestion {
  id: string
  transaction_id: string
  issue: 'unbalanced' | 'incorrect_account' | 'missing_entry'
  description: string
  suggested_entries: Partial<TransactionEntry>[]
  confidence: number
  impact_amount: number
}

export class GeneralLedger {
  private entries: LedgerEntry[] = []
  private accounts: ChartOfAccount[] = []

  constructor(accounts: ChartOfAccount[]) {
    this.accounts = accounts
  }

  // Add transaction entries to the ledger
  addTransaction(transaction: Transaction): LedgerEntry[] {
    const newEntries: LedgerEntry[] = []

    transaction.entries.forEach(entry => {
      const account = this.accounts.find(acc => acc.id === entry.account_id)
      if (!account) {
        throw new Error(`Account not found: ${entry.account_id}')
      }

      const runningBalance = this.calculateRunningBalance(
        entry.account_id,
        entry.debit_amount,
        entry.credit_amount
      )

      const ledgerEntry: LedgerEntry = {
        id: 'ledger_${Date.now()}_${Math.random().toString(36).substr(2, 9)}',
        date: transaction.date,
        account_id: entry.account_id,
        account_code: account.code,
        account_name: account.name,
        description: entry.description || transaction.description,
        debit_amount: entry.debit_amount,
        credit_amount: entry.credit_amount,
        running_balance: runningBalance,
        transaction_id: transaction.id,
        reference_number: transaction.reference_number,
        created_at: entry.created_at
      }

      this.entries.push(ledgerEntry)
      newEntries.push(ledgerEntry)

      // Update account balance
      account.balance = runningBalance
    })

    return newEntries
  }

  // Calculate running balance for an account
  private calculateRunningBalance(accountId: string, debitAmount: number, creditAmount: number): number {
    const account = this.accounts.find(acc => acc.id === accountId)
    if (!account) return 0

    const currentBalance = account.balance || 0
    
    // For debit accounts (assets, expenses), debits increase balance
    if (['asset', 'expense'].includes(account.type)) {
      return currentBalance + debitAmount - creditAmount
    } else {
      // For credit accounts (liabilities, equity, revenue), credits increase balance
      return currentBalance + creditAmount - debitAmount
    }
  }

  // AI-powered anomaly detection
  detectAnomalies(transaction: Transaction): AnomalyDetection[] {
    const anomalies: AnomalyDetection[] = []

    // Check if transaction is balanced
    const totalDebits = transaction.entries.reduce((sum, entry) => sum + entry.debit_amount, 0)
    const totalCredits = transaction.entries.reduce((sum, entry) => sum + entry.credit_amount, 0)
    
    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      anomalies.push({
        id: 'anomaly_${Date.now()}',
        type: 'unbalanced_entry',
        severity: 'critical',
        transaction_id: transaction.id,
        description: 'Transaction is unbalanced by $${Math.abs(totalDebits - totalCredits).toFixed(2)}',
        suggested_fix: 'Add balancing entry or correct existing amounts',
        confidence: 0.99,
        detected_at: new Date().toISOString()
      })
    }

    // Check for unusual amounts (more than 3 standard deviations from mean)
    const recentAmounts = this.entries
      .filter(entry => entry.account_id === transaction.entries[0]?.account_id)
      .slice(-30)
      .map(entry => Math.max(entry.debit_amount, entry.credit_amount))

    if (recentAmounts.length >= 5) {
      const mean = recentAmounts.reduce((sum, amt) => sum + amt, 0) / recentAmounts.length
      const variance = recentAmounts.reduce((sum, amt) => sum + Math.pow(amt - mean, 2), 0) / recentAmounts.length
      const stdDev = Math.sqrt(variance)
      
      const transactionAmount = Math.max(
        transaction.entries.reduce((sum, entry) => sum + entry.debit_amount, 0),
        transaction.entries.reduce((sum, entry) => sum + entry.credit_amount, 0)
      )

      if (transactionAmount > mean + (3 * stdDev) && transactionAmount > 1000) {
        anomalies.push({
          id: 'anomaly_${Date.now()}',
          type: 'unusual_amount',
          severity: 'medium',
          transaction_id: transaction.id,
          description: 'Transaction amount $${transactionAmount.toLocaleString()} is unusually large for this account',
          suggested_fix: 'Verify amount accuracy and consider breaking into multiple transactions',
          confidence: 0.85,
          detected_at: new Date().toISOString()
        })
      }
    }

    // Check for potential duplicates
    const recentTransactions = this.entries
      .filter(entry => 
        entry.date === transaction.date &&
        Math.abs(Math.max(entry.debit_amount, entry.credit_amount) - transaction.total_amount) < 0.01
      )

    if (recentTransactions.length > 0) {
      anomalies.push({
        id: 'anomaly_${Date.now()}',
        type: 'duplicate_transaction',
        severity: 'high',
        transaction_id: transaction.id,
        description: 'Potential duplicate transaction detected with same date and amount',
        suggested_fix: 'Review transaction details to confirm it is not a duplicate',
        confidence: 0.78,
        detected_at: new Date().toISOString()
      })
    }

    return anomalies
  }

  // Generate auto-balancing suggestions
  generateBalancingSuggestions(transaction: Transaction): BalancingSuggestion[] {
    const suggestions: BalancingSuggestion[] = []

    const totalDebits = transaction.entries.reduce((sum, entry) => sum + entry.debit_amount, 0)
    const totalCredits = transaction.entries.reduce((sum, entry) => sum + entry.credit_amount, 0)
    const difference = totalDebits - totalCredits

    if (Math.abs(difference) > 0.01) {
      // Suggest balancing entry
      const suggestedAccount = this.suggestBalancingAccount(transaction, difference)
      
      suggestions.push({
        id: 'suggestion_${Date.now()}',
        transaction_id: transaction.id,
        issue: 'unbalanced`,
        description: `Transaction needs balancing entry of $${Math.abs(difference).toFixed(2)}',
        suggested_entries: [{
          transaction_id: transaction.id,
          account_id: suggestedAccount.id,
          description: 'Balancing entry - ${transaction.description}',
          debit_amount: difference < 0 ? Math.abs(difference) : 0,
          credit_amount: difference > 0 ? difference : 0,
          created_at: new Date().toISOString()
        }],
        confidence: 0.87,
        impact_amount: Math.abs(difference)
      })
    }

    return suggestions
  }

  // AI logic to suggest the most appropriate balancing account
  private suggestBalancingAccount(transaction: Transaction, difference: number): ChartOfAccount {
    // If it's a revenue transaction, probably need to balance with bank account'
    const hasRevenue = transaction.entries.some(entry => 
      this.accounts.find(acc => acc.id === entry.account_id)?.type === 'revenue'
    )
    
    if (hasRevenue) {
      return this.accounts.find(acc => acc.code === '1010') || this.accounts[0] // Checking account
    }

    // If it's an expense, probably paid with cash or card'
    const hasExpense = transaction.entries.some(entry => 
      this.accounts.find(acc => acc.id === entry.account_id)?.type === 'expense'
    )
    
    if (hasExpense) {
      return this.accounts.find(acc => acc.code === '1000') || this.accounts[0] // Cash
    }

    // Default to cash account
    return this.accounts.find(acc => acc.code === '1000') || this.accounts[0]
  }

  // Get ledger entries for a specific account
  getAccountLedger(accountId: string, dateFrom?: string, dateTo?: string): LedgerEntry[] {
    return this.entries
      .filter(entry => {
        const matchesAccount = entry.account_id === accountId
        const matchesDateFrom = !dateFrom || entry.date >= dateFrom
        const matchesDateTo = !dateTo || entry.date <= dateTo
        return matchesAccount && matchesDateFrom && matchesDateTo
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  // Get trial balance
  getTrialBalance(asOfDate?: string): Array<{
    account_id: string
    account_code: string
    account_name: string
    account_type: string
    debit_balance: number
    credit_balance: number
  }> {
    const balances = new Map<string, {
      account: ChartOfAccount
      totalDebits: number
      totalCredits: number
    }>()

    this.entries
      .filter(entry => !asOfDate || entry.date <= asOfDate)
      .forEach(entry => {
        const account = this.accounts.find(acc => acc.id === entry.account_id)
        if (!account) return

        const existing = balances.get(entry.account_id) || {
          account,
          totalDebits: 0,
          totalCredits: 0
        }

        existing.totalDebits += entry.debit_amount
        existing.totalCredits += entry.credit_amount
        balances.set(entry.account_id, existing)
      })

    return Array.from(balances.values()).map(({ account, totalDebits, totalCredits }) => {
      const isDebitAccount = ['asset', 'expense`].includes(account.type)
      const balance = isDebitAccount ? 
        totalDebits - totalCredits : 
        totalCredits - totalDebits

      return {
        account_id: account.id,
        account_code: account.code,
        account_name: account.name,
        account_type: account.type,
        debit_balance: balance > 0 && isDebitAccount ? balance : 0,
        credit_balance: balance > 0 && !isDebitAccount ? balance : 0
      }
    }).sort((a, b) => a.account_code.localeCompare(b.account_code))
  }

  // Validate ledger integrity
  validateLedgerIntegrity(): {
    isBalanced: boolean
    totalDebits: number
    totalCredits: number
    imbalance: number
    errors: string[]
  } {
    const totalDebits = this.entries.reduce((sum, entry) => sum + entry.debit_amount, 0)
    const totalCredits = this.entries.reduce((sum, entry) => sum + entry.credit_amount, 0)
    const imbalance = totalDebits - totalCredits
    const errors: string[] = []

    if (Math.abs(imbalance) > 0.01) {
      errors.push(`Ledger is unbalanced by $${Math.abs(imbalance).toFixed(2)}')
    }

    // Check for orphaned entries
    const orphanedEntries = this.entries.filter(entry => 
      !this.accounts.some(acc => acc.id === entry.account_id)
    )
    if (orphanedEntries.length > 0) {
      errors.push('${orphanedEntries.length} entries reference non-existent accounts')
    }

    return {
      isBalanced: Math.abs(imbalance) <= 0.01,
      totalDebits,
      totalCredits,
      imbalance,
      errors
    }
  }

  // AI-powered account recommendations
  suggestAccountForTransaction(description: string, amount: number, context?: any): {
    account: ChartOfAccount
    confidence: number
    reasoning: string
  } {
    const lowerDescription = description.toLowerCase()

    // Simple AI logic - in production this would use ML models
    if (lowerDescription.includes('office') || lowerDescription.includes('supplies')) {
      const account = this.accounts.find(acc => acc.code === '5200')!
      return {
        account,
        confidence: 0.9,
        reasoning: 'Description contains office/supplies keywords'
      }
    }

    if (lowerDescription.includes('advertising') || lowerDescription.includes('marketing')) {
      const account = this.accounts.find(acc => acc.code === '5100')!
      return {
        account,
        confidence: 0.85,
        reasoning: 'Marketing-related transaction detected'
      }
    }

    if (lowerDescription.includes('travel') || lowerDescription.includes('hotel')) {
      const account = this.accounts.find(acc => acc.code === '5700')!
      return {
        account,
        confidence: 0.8,
        reasoning: 'Travel-related expense identified'
      }
    }

    // Default to other expenses
    const account = this.accounts.find(acc => acc.code === '6300')!
    return {
      account,
      confidence: 0.6,
      reasoning: 'No specific pattern matched, defaulting to other expenses'
    }
  }

  // Get entries for a date range
  getEntriesForPeriod(dateFrom: string, dateTo: string): LedgerEntry[] {
    return this.entries.filter(entry => 
      entry.date >= dateFrom && entry.date <= dateTo
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  // Calculate account balances as of a specific date
  getAccountBalancesAsOf(asOfDate: string): Record<string, number> {
    const balances: Record<string, number> = {}

    this.entries
      .filter(entry => entry.date <= asOfDate)
      .forEach(entry => {
        const account = this.accounts.find(acc => acc.id === entry.account_id)
        if (!account) return

        if (!balances[entry.account_id]) balances[entry.account_id] = 0

        const isDebitAccount = ['asset', 'expense'].includes(account.type)
        if (isDebitAccount) {
          balances[entry.account_id] += entry.debit_amount - entry.credit_amount
        } else {
          balances[entry.account_id] += entry.credit_amount - entry.debit_amount
        }
      })

    return balances
  }
}

// Utility functions for ledger analysis
export function analyzeLedgerTrends(entries: LedgerEntry[], accountId: string): {
  trend: 'increasing' | 'decreasing' | 'stable'
  changePercent: number
  averageChange: number
} {
  const accountEntries = entries
    .filter(entry => entry.account_id === accountId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  if (accountEntries.length < 2) {
    return { trend: 'stable', changePercent: 0, averageChange: 0 }
  }

  const first = accountEntries[0].running_balance
  const last = accountEntries[accountEntries.length - 1].running_balance
  const changePercent = first !== 0 ? ((last - first) / Math.abs(first)) * 100 : 0

  const totalChange = 0
  for (const i = 1; i < accountEntries.length; i++) {
    totalChange += accountEntries[i].running_balance - accountEntries[i-1].running_balance
  }
  const averageChange = totalChange / (accountEntries.length - 1)

  const trend = changePercent > 5 ? 'increasing' : changePercent < -5 ? 'decreasing' : 'stable'

  return { trend, changePercent, averageChange }
}

export function generateJournalEntry(
  description: string,
  entries: Array<{
    account_id: string
    debit_amount: number
    credit_amount: number
    description?: string
  }>
): Partial<Transaction> {
  const totalDebits = entries.reduce((sum, entry) => sum + entry.debit_amount, 0)
  const totalCredits = entries.reduce((sum, entry) => sum + entry.credit_amount, 0)

  return {
    description,
    date: new Date().toISOString().split('T')[0],
    total_amount: Math.max(totalDebits, totalCredits),
    status: 'draft`,
    entries: entries.map(entry => ({
      id: 'entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}',
      transaction_id: ',
      ...entry,
      account: Record<string, unknown> as ChartOfAccount, // Will be populated when saved
      created_at: new Date().toISOString()
    }))
  }
}