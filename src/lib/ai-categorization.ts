import { AiCategorization, Transaction, ChartOfAccount } from '@/types/accounting'

export interface AiCategorizationRequest {
  description: string
  amount: number
  vendor?: string
  memo?: string
}

export interface AiInsightRequest {
  transactions: Transaction[]
  accounts: ChartOfAccount[]
  period: string
}

export interface AiInsight {
  type: 'trend' | 'anomaly' | 'opportunity' | 'warning'
  title: string
  description: string
  confidence: number
  recommendation?: string
  impact_score: number
  data?: Record<string, unknown>
}

// Mock AI categorization service
export async function categorizeTransaction(request: AiCategorizationRequest): Promise<AiCategorization> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))

  // Simple rule-based categorization for demo
  const { description, amount, vendor } = request
  const lowerDescription = description.toLowerCase()

  let suggestedCategory = 'Other Expenses'
  let suggestedAccounts: string[] = ['6300'] // Other Expenses
  let confidence = 0.7

  // Office supplies
  if (lowerDescription.includes('office') || lowerDescription.includes('supplies') || 
      lowerDescription.includes('staples') || lowerDescription.includes('paper')) {
    suggestedCategory = 'Office Supplies'
    suggestedAccounts = ['5200']
    confidence = 0.9
  }
  // Advertising
  else if (lowerDescription.includes('advertising') || lowerDescription.includes('marketing') ||
           lowerDescription.includes('google ads') || lowerDescription.includes('facebook')) {
    suggestedCategory = 'Advertising'
    suggestedAccounts = ['5100']
    confidence = 0.9
  }
  // Travel
  else if (lowerDescription.includes('travel') || lowerDescription.includes('hotel') ||
           lowerDescription.includes('airline') || lowerDescription.includes('uber')) {
    suggestedCategory = 'Travel and Entertainment'
    suggestedAccounts = ['5700']
    confidence = 0.85
  }
  // Vehicle
  else if (lowerDescription.includes('gas') || lowerDescription.includes('fuel') ||
           lowerDescription.includes('auto') || lowerDescription.includes('vehicle')) {
    suggestedCategory = 'Vehicle Expenses'
    suggestedAccounts = ['5800']
    confidence = 0.9
  }
  // Utilities
  else if (lowerDescription.includes('electric') || lowerDescription.includes('water') ||
           lowerDescription.includes('gas bill') || lowerDescription.includes('internet')) {
    suggestedCategory = 'Utilities'
    suggestedAccounts = ['5400']
    confidence = 0.95
  }
  // Professional fees
  else if (lowerDescription.includes('legal') || lowerDescription.includes('attorney') ||
           lowerDescription.includes('accountant') || lowerDescription.includes('consultant')) {
    suggestedCategory = 'Professional Fees'
    suggestedAccounts = ['5600']
    confidence = 0.9
  }
  // Bank fees
  else if (lowerDescription.includes('bank fee') || lowerDescription.includes('service charge')) {
    suggestedCategory = 'Bank Fees'
    suggestedAccounts = ['6200']
    confidence = 0.95
  }

  const insights = [
    `Transaction amount: $${amount.toFixed(2)}`,
    `Suggested category: ${suggestedCategory}',
    vendor ? 'Vendor: ${vendor}' : 'No vendor specified'
  ]

  return {
    confidence,
    suggested_category: suggestedCategory,
    suggested_accounts: suggestedAccounts,
    insights,
    processed_at: new Date().toISOString()
  }
}

// Mock AI insights generation
export async function generateFinancialInsights(request: AiInsightRequest): Promise<AiInsight[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))

  const { transactions, accounts } = request
  const insights: AiInsight[] = []

  // Calculate total expenses by category
  const expensesByAccount = transactions
    .flatMap(t => t.entries)
    .filter(entry => entry.credit_amount > 0)
    .reduce((acc, entry) => {
      acc[entry.account_id] = (acc[entry.account_id] || 0) + entry.credit_amount
      return acc
    }, {} as Record<string, number>)

  // Find highest expense category
  const highestExpenseAccountId = Object.entries(expensesByAccount)
    .sort(([,a], [,b]) => b - a)[0]?.[0]

  if (highestExpenseAccountId) {
    const account = accounts.find(a => a.id === highestExpenseAccountId)
    if (account) {
      insights.push({
        type: 'trend',
        title: 'Highest Expense Category`,
        description: `${account.name} represents your largest expense category this period.',
        confidence: 0.9,
        recommendation: 'Consider reviewing ${account.name.toLowerCase()} to identify potential cost savings.',
        impact_score: 8,
        data: { amount: expensesByAccount[highestExpenseAccountId], account: account.name }
      })
    }
  }

  // Look for unusual amounts
  const amounts = transactions.map(t => t.total_amount)
  const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length
  const unusualTransactions = transactions.filter(t => t.total_amount > avgAmount * 3)

  if (unusualTransactions.length > 0) {
    insights.push({
      type: 'anomaly',
      title: 'Unusual Transaction Amounts',
      description: 'Detected ${unusualTransactions.length} transactions with amounts significantly above average.',
      confidence: 0.8,
      recommendation: 'Review these transactions to ensure they are accurate and properly categorized.',
      impact_score: 6,
      data: { count: unusualTransactions.length, avgAmount }
    })
  }

  // Cash flow opportunity
  const receivables = accounts.find(a => a.code === '1100')
  if (receivables && receivables.balance > 10000) {
    insights.push({
      type: 'opportunity',
      title: 'Accounts Receivable Collection',
      description: 'You have significant outstanding receivables that could improve cash flow.',
      confidence: 0.85,
      recommendation: 'Consider implementing more aggressive collection procedures or offering early payment discounts.',
      impact_score: 7,
      data: { balance: receivables.balance }
    })
  }

  // Warning about low cash
  const cash = accounts.find(a => a.code === '1000' || a.code === '1010')
  if (cash && cash.balance < 5000) {
    insights.push({
      type: 'warning',
      title: 'Low Cash Balance',
      description: 'Your cash balance is running low and may affect operations.',
      confidence: 0.95,
      recommendation: 'Consider securing additional funding or accelerating receivables collection.',
      impact_score: 9,
      data: { balance: cash.balance }
    })
  }

  return insights
}

// Mock document processing for receipts/invoices
export async function processDocument(file: File): Promise<{
  extractedText: string
  suggestedTransaction: Partial<Transaction>
  confidence: number
}> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000))

  // Mock extracted data based on file name patterns
  const fileName = file.name.toLowerCase()
  
  let extractedText = 'Receipt from business purchase'
  let suggestedTransaction: Partial<Transaction> = {
    description: 'Business expense',
    total_amount: 0,
    entries: []
  }
  let confidence = 0.6

  // Simulate different document types
  if (fileName.includes('receipt') || fileName.includes('invoice')) {
    extractedText = 'RECEIPT
Date: 2024-01-15
Vendor: Office Supply Co
Items: Paper, Pens, Folders
Total: $45.67'
    suggestedTransaction = {
      description: 'Office Supply Co - Office supplies',
      total_amount: 45.67,
      date: '2024-01-15'
    }
    confidence = 0.85
  } else if (fileName.includes('gas') || fileName.includes('fuel')) {
    extractedText = 'FUEL RECEIPT
Date: 2024-01-15
Station: Shell
Gallons: 12.5
Total: $42.50'
    suggestedTransaction = {
      description: 'Shell - Fuel',
      total_amount: 42.50,
      date: '2024-01-15'
    }
    confidence = 0.9
  }

  return {
    extractedText,
    suggestedTransaction,
    confidence
  }
}

export function formatConfidence(confidence: number): string {
  if (confidence >= 0.9) return 'Very High'
  if (confidence >= 0.8) return 'High'
  if (confidence >= 0.7) return 'Medium'
  if (confidence >= 0.6) return 'Low'
  return 'Very Low'
}

export function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.8) return 'text-green-600'
  if (confidence >= 0.6) return 'text-yellow-600'
  return 'text-red-600'
}