import { Transaction, BankAccount } from '@/types/accounting'

export interface BankTransaction {
  id: string
  account_id: string
  date: string
  description: string
  amount: number
  type: 'debit' | 'credit'
  reference_number?: string
  category?: string
  bank_statement_line?: number
  is_reconciled: boolean
}

export interface ReconciliationMatch {
  book_transaction_id: string
  bank_transaction_id: string
  confidence_score: number
  match_type: 'exact' | 'fuzzy' | 'partial' | 'manual'
  variance_amount?: number
  variance_reason?: string
  ai_explanation: string
}

export interface ReconciliationSuggestion {
  type: 'missing_transaction' | 'duplicate_transaction' | 'amount_variance' | 'timing_difference'
  description: string
  bank_transaction?: BankTransaction
  book_transaction?: Transaction
  suggested_action: string
  confidence: number
  potential_impact: number
}

export interface ReconciliationReport {
  account_id: string
  period_start: string
  period_end: string
  beginning_balance: number
  ending_balance: number
  book_balance: number
  bank_balance: number
  variance: number
  reconciled_items: ReconciliationMatch[]
  unmatched_bank_items: BankTransaction[]
  unmatched_book_items: Transaction[]
  suggestions: ReconciliationSuggestion[]
  ai_risk_assessment: {
    fraud_indicators: string[]
    unusual_patterns: string[]
    compliance_issues: string[]
    overall_risk_score: number
  }
}

export interface DisputeCase {
  id: string
  bank_transaction_id: string
  type: 'unauthorized_transaction' | 'incorrect_amount' | 'duplicate_charge' | 'service_dispute'
  amount: number
  description: string
  evidence: string[]
  status: 'open' | 'investigating' | 'resolved' | 'closed'
  created_date: string
  resolution_timeline: string
  ai_success_probability: number
  recommended_evidence: string[]
}

export class BankReconciliation {
  private bankTransactions: BankTransaction[] = []
  private bookTransactions: Transaction[] = []
  private accounts: BankAccount[] = []

  constructor(bankTransactions: BankTransaction[], bookTransactions: Transaction[], accounts: BankAccount[]) {
    this.bankTransactions = bankTransactions
    this.bookTransactions = bookTransactions
    this.accounts = accounts
  }

  // AI-powered automatic transaction matching
  performAutomaticReconciliation(accountId: string, periodStart: string, periodEnd: string): ReconciliationReport {
    const bankItems = this.bankTransactions.filter(bt => 
      bt.account_id === accountId && 
      bt.date >= periodStart && 
      bt.date <= periodEnd &&
      !bt.is_reconciled
    )

    const bookItems = this.bookTransactions.filter(bt => 
      bt.account_id === accountId && 
      bt.date >= periodStart && 
      bt.date <= periodEnd &&
      bt.reconciliation_status !== 'reconciled'
    )

    const matches: ReconciliationMatch[] = []
    const unmatchedBank: BankTransaction[] = []
    const unmatchedBook: Transaction[] = []

    // Phase 1: Exact matches (amount, date, reference)
    bankItems.forEach(bankTx => {
      const exactMatch = bookItems.find(bookTx => 
        Math.abs(bankTx.amount - bookTx.amount) < 0.01 &&
        bankTx.date === bookTx.date &&
        (bankTx.reference_number === bookTx.reference || 
         this.normalizeDescription(bankTx.description) === this.normalizeDescription(bookTx.description))
      )

      if (exactMatch && !matches.some(m => m.book_transaction_id === exactMatch.id)) {
        matches.push({
          book_transaction_id: exactMatch.id,
          bank_transaction_id: bankTx.id,
          confidence_score: 0.98,
          match_type: 'exact',
          ai_explanation: 'Exact match on amount, date, and reference number'
        })
      } else {
        unmatchedBank.push(bankTx)
      }
    })

    // Phase 2: Fuzzy matching with AI
    unmatchedBank.forEach(bankTx => {
      const potentialMatches = bookItems
        .filter(bookTx => !matches.some(m => m.book_transaction_id === bookTx.id))
        .map(bookTx => ({
          transaction: bookTx,
          score: this.calculateMatchScore(bankTx, bookTx)
        }))
        .filter(match => match.score > 0.7)
        .sort((a, b) => b.score - a.score)

      if (potentialMatches.length > 0) {
        const bestMatch = potentialMatches[0]
        matches.push({
          book_transaction_id: bestMatch.transaction.id,
          bank_transaction_id: bankTx.id,
          confidence_score: bestMatch.score,
          match_type: bestMatch.score > 0.9 ? 'fuzzy' : 'partial',
          ai_explanation: this.generateMatchExplanation(bankTx, bestMatch.transaction, bestMatch.score)
        })
      } else {
        unmatchedBank.push(bankTx)
      }
    })

    // Identify unmatched book transactions
    bookItems.forEach(bookTx => {
      if (!matches.some(m => m.book_transaction_id === bookTx.id)) {
        unmatchedBook.push(bookTx)
      }
    })

    // Generate AI suggestions for unmatched items
    const suggestions = this.generateReconciliationSuggestions(unmatchedBank, unmatchedBook)

    // AI risk assessment
    const riskAssessment = this.performRiskAssessment(matches, unmatchedBank, unmatchedBook)

    const account = this.accounts.find(a => a.id === accountId)
    const beginningBalance = account?.current_balance || 0
    const bankBalance = beginningBalance + bankItems.reduce((sum, tx) => sum + (tx.type === 'credit' ? tx.amount : -tx.amount), 0)
    const bookBalance = beginningBalance + bookItems.reduce((sum, tx) => sum + tx.amount, 0)

    return {
      account_id: accountId,
      period_start: periodStart,
      period_end: periodEnd,
      beginning_balance: beginningBalance,
      ending_balance: bankBalance,
      book_balance: bookBalance,
      bank_balance: bankBalance,
      variance: bankBalance - bookBalance,
      reconciled_items: matches,
      unmatched_bank_items: unmatchedBank.slice(0, -matches.length),
      unmatched_book_items: unmatchedBook,
      suggestions,
      ai_risk_assessment: riskAssessment
    }
  }

  // AI transaction matching algorithm
  private calculateMatchScore(bankTx: BankTransaction, bookTx: Transaction): number {
    const score = 0
    
    // Amount matching (highest weight)
    const amountDiff = Math.abs(bankTx.amount - Math.abs(bookTx.amount))
    if (amountDiff < 0.01) score += 0.4
    else if (amountDiff < 1) score += 0.3
    else if (amountDiff < 10) score += 0.2
    else if (amountDiff > 100) return 0

    // Date matching
    const daysDiff = Math.abs((new Date(bankTx.date).getTime() - new Date(bookTx.date).getTime()) / (1000 * 60 * 60 * 24))
    if (daysDiff === 0) score += 0.3
    else if (daysDiff <= 2) score += 0.2
    else if (daysDiff <= 5) score += 0.1
    else if (daysDiff > 10) return 0

    // Description similarity
    const descSimilarity = this.calculateDescriptionSimilarity(bankTx.description, bookTx.description)
    score += descSimilarity * 0.3

    return Math.min(1, score)
  }

  // AI-powered description similarity
  private calculateDescriptionSimilarity(bankDesc: string, bookDesc: string): number {
    const bank = this.normalizeDescription(bankDesc).toLowerCase()
    const book = this.normalizeDescription(bookDesc).toLowerCase()
    
    if (bank === book) return 1
    
    // Check for common keywords
    const bankWords = bank.split(' ').filter(w => w.length > 3)
    const bookWords = book.split(' ').filter(w => w.length > 3)
    
    const matchingWords = 0
    bankWords.forEach(word => {
      if (bookWords.some(bw => bw.includes(word) || word.includes(bw))) {
        matchingWords++
      }
    })
    
    return matchingWords / Math.max(bankWords.length, bookWords.length)
  }

  private normalizeDescription(description: string): string {
    return description
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase()
  }

  private generateMatchExplanation(bankTx: BankTransaction, bookTx: Transaction, score: number): string {
    const reasons: string[] = []
    
    const amountDiff = Math.abs(bankTx.amount - Math.abs(bookTx.amount))
    if (amountDiff < 0.01) reasons.push('exact amount match')
    else if (amountDiff < 10) reasons.push('similar amount ($${amountDiff.toFixed(2)} difference)')
    
    const daysDiff = Math.abs((new Date(bankTx.date).getTime() - new Date(bookTx.date).getTime()) / (1000 * 60 * 60 * 24))
    if (daysDiff === 0) reasons.push('same date')
    else if (daysDiff <= 2) reasons.push('close dates (${Math.round(daysDiff)} day difference)')
    
    const descSim = this.calculateDescriptionSimilarity(bankTx.description, bookTx.description)
    if (descSim > 0.8) reasons.push('very similar descriptions')
    else if (descSim > 0.5) reasons.push('similar descriptions')
    
    return 'Match based on: ${reasons.join(', ')} (${Math.round(score * 100)}% confidence)'
  }

  // Generate AI suggestions for unmatched items
  private generateReconciliationSuggestions(
    unmatchedBank: BankTransaction[], 
    unmatchedBook: Transaction[]
  ): ReconciliationSuggestion[] {
    const suggestions: ReconciliationSuggestion[] = []

    // Missing bank transactions
    unmatchedBook.forEach(bookTx => {
      if (Math.abs(bookTx.amount) > 100) {
        suggestions.push({
          type: 'missing_transaction',
          description: 'Book transaction ${bookTx.description} ($${Math.abs(bookTx.amount)}) not found in bank statement',
          book_transaction: bookTx,
          suggested_action: 'Verify transaction was processed by bank or add to bank statement',
          confidence: 0.8,
          potential_impact: Math.abs(bookTx.amount)
        })
      }
    })

    // Missing book transactions
    unmatchedBank.forEach(bankTx => {
      if (Math.abs(bankTx.amount) > 100) {
        suggestions.push({
          type: 'missing_transaction',
          description: 'Bank transaction ${bankTx.description} ($${Math.abs(bankTx.amount)}) not recorded in books',
          bank_transaction: bankTx,
          suggested_action: 'Create matching book entry or investigate if transaction should be recorded',
          confidence: 0.7,
          potential_impact: Math.abs(bankTx.amount)
        })
      }
    })

    // Potential duplicates
    const duplicatePairs = this.findPotentialDuplicates(unmatchedBank)
    duplicatePairs.forEach(pair => {
      suggestions.push({
        type: 'duplicate_transaction',
        description: 'Potential duplicate: ${pair.tx1.description} and ${pair.tx2.description}',
        bank_transaction: pair.tx1,
        suggested_action: 'Review transactions to determine if one should be removed',
        confidence: pair.confidence,
        potential_impact: Math.min(pair.tx1.amount, pair.tx2.amount)
      })
    })

    return suggestions.sort((a, b) => b.potential_impact - a.potential_impact)
  }

  // AI risk assessment for reconciliation
  private performRiskAssessment(
    matches: ReconciliationMatch[],
    unmatchedBank: BankTransaction[],
    unmatchedBook: Transaction[]
  ) {
    const fraudIndicators: string[] = []
    const unusualPatterns: string[] = []
    const complianceIssues: string[] = []

    // Fraud detection
    const highValueUnmatched = unmatchedBank.filter(tx => Math.abs(tx.amount) > 10000)
    if (highValueUnmatched.length > 0) {
      fraudIndicators.push('${highValueUnmatched.length} high-value unmatched bank transactions')
    }

    const roundAmounts = unmatchedBank.filter(tx => tx.amount % 100 === 0 && tx.amount > 1000)
    if (roundAmounts.length >= 3) {
      fraudIndicators.push('Multiple round-number transactions may indicate fraud')
    }

    // Pattern detection
    const lowConfidenceMatches = matches.filter(m => m.confidence_score < 0.8)
    if (lowConfidenceMatches.length / matches.length > 0.3) {
      unusualPatterns.push('High percentage of low-confidence matches')
    }

    const totalVariance = Math.abs(
      unmatchedBank.reduce((sum, tx) => sum + tx.amount, 0) -
      unmatchedBook.reduce((sum, tx) => sum + Math.abs(tx.amount), 0)
    )
    if (totalVariance > 5000) {
      unusualPatterns.push('Large reconciliation variance detected')
    }

    // Compliance issues
    if (unmatchedBank.length + unmatchedBook.length > matches.length * 0.2) {
      complianceIssues.push('High percentage of unmatched transactions')
    }

    const riskScore = Math.min(1, 
      (fraudIndicators.length * 0.4) +
      (unusualPatterns.length * 0.3) +
      (complianceIssues.length * 0.2) +
      (totalVariance / 50000 * 0.1)
    )

    return {
      fraud_indicators: fraudIndicators,
      unusual_patterns: unusualPatterns,
      compliance_issues: complianceIssues,
      overall_risk_score: riskScore
    }
  }

  // Find potential duplicate transactions
  private findPotentialDuplicates(transactions: BankTransaction[]): Array<{
    tx1: BankTransaction
    tx2: BankTransaction
    confidence: number
  }> {
    const duplicates: Array<{ tx1: BankTransaction, tx2: BankTransaction, confidence: number }> = []
    
    for (let i = 0; i < transactions.length; i++) {
      for (const j = i + 1; j < transactions.length; j++) {
        const tx1 = transactions[i]
        const tx2 = transactions[j]
        
        // Check for potential duplicates
        if (Math.abs(tx1.amount - tx2.amount) < 0.01) {
          const daysDiff = Math.abs((new Date(tx1.date).getTime() - new Date(tx2.date).getTime()) / (1000 * 60 * 60 * 24))
          const descSimilarity = this.calculateDescriptionSimilarity(tx1.description, tx2.description)
          
          if ((daysDiff <= 1 && descSimilarity > 0.8) || (daysDiff <= 3 && descSimilarity > 0.9)) {
            duplicates.push({
              tx1,
              tx2,
              confidence: Math.min(0.95, descSimilarity * (daysDiff === 0 ? 1 : 0.9))
            })
          }
        }
      }
    }
    
    return duplicates
  }

  // AI-powered dispute detection and management
  detectDisputes(accountId: string): DisputeCase[] {
    const disputes: DisputeCase[] = []
    const recentTransactions = this.bankTransactions.filter(tx => 
      tx.account_id === accountId &&
      new Date(tx.date) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
    )

    // Detect unauthorized transactions
    const unauthorizedIndicators = recentTransactions.filter(tx => {
      const isUnusualAmount = Math.abs(tx.amount) > 5000 && Math.abs(tx.amount) % 1 !== 0
      const isUnusualTime = this.isUnusualTransactionTime(tx)
      const hasNoBookEntry = !this.bookTransactions.some(bt => 
        Math.abs(bt.amount - tx.amount) < 0.01 && 
        Math.abs(new Date(bt.date).getTime() - new Date(tx.date).getTime()) < 2 * 24 * 60 * 60 * 1000
      )
      
      return (isUnusualAmount || isUnusualTime) && hasNoBookEntry
    })

    unauthorizedIndicators.forEach(tx => {
      disputes.push({
        id: 'dispute_${tx.id}',
        bank_transaction_id: tx.id,
        type: 'unauthorized_transaction',
        amount: Math.abs(tx.amount),
        description: 'Potential unauthorized transaction: ${tx.description}',
        evidence: this.generateEvidenceRequirements('unauthorized_transaction'),
        status: 'open',
        created_date: new Date().toISOString().split('T')[0],
        resolution_timeline: '30-45 days',
        ai_success_probability: 0.7,
        recommended_evidence: [
          'Transaction logs and timestamps',
          'Employee access records',
          'Authorization documentation',
          'Video surveillance if applicable'
        ]
      })
    })

    // Detect amount discrepancies
    const amountDiscrepancies = this.findAmountDiscrepancies(recentTransactions)
    amountDiscrepancies.forEach(discrepancy => {
      disputes.push({
        id: 'dispute_amount_${discrepancy.bank_transaction_id}',
        bank_transaction_id: discrepancy.bank_transaction_id,
        type: 'incorrect_amount',
        amount: discrepancy.variance_amount || 0,
        description: 'Amount discrepancy detected: Expected $${discrepancy.expected_amount}, but bank shows $${discrepancy.actual_amount}',
        evidence: this.generateEvidenceRequirements('incorrect_amount'),
        status: 'open',
        created_date: new Date().toISOString().split('T')[0],
        resolution_timeline: '15-20 days',
        ai_success_probability: 0.85,
        recommended_evidence: [
          'Original invoice or receipt',
          'Authorization documentation',
          'Communication with vendor/customer'
        ]
      })
    })

    return disputes.sort((a, b) => b.amount - a.amount)
  }

  private isUnusualTransactionTime(tx: BankTransaction): boolean {
    const txDate = new Date(tx.date)
    const hour = txDate.getHours()
    const isWeekend = txDate.getDay() === 0 || txDate.getDay() === 6
    
    // Transactions outside business hours or on weekends could be suspicious
    return isWeekend || hour < 6 || hour > 20
  }

  private findAmountDiscrepancies(transactions: BankTransaction[]): Array<{
    bank_transaction_id: string
    expected_amount: number
    actual_amount: number
    variance_amount: number
  }> {
    const discrepancies: Array<{
      bank_transaction_id: string
      expected_amount: number
      actual_amount: number
      variance_amount: number
    }> = []

    transactions.forEach(bankTx => {
      const relatedBookTx = this.bookTransactions.find(bookTx => 
        this.calculateDescriptionSimilarity(bankTx.description, bookTx.description) > 0.8 &&
        Math.abs(new Date(bankTx.date).getTime() - new Date(bookTx.date).getTime()) < 3 * 24 * 60 * 60 * 1000
      )

      if (relatedBookTx && Math.abs(bankTx.amount - Math.abs(relatedBookTx.amount)) > 1) {
        discrepancies.push({
          bank_transaction_id: bankTx.id,
          expected_amount: Math.abs(relatedBookTx.amount),
          actual_amount: Math.abs(bankTx.amount),
          variance_amount: Math.abs(bankTx.amount - Math.abs(relatedBookTx.amount))
        })
      }
    })

    return discrepancies
  }

  private generateEvidenceRequirements(disputeType: DisputeCase['type']): string[] {
    const evidenceMap: Record<DisputeCase['type'], string[]> = {
      unauthorized_transaction: [
        'Bank statement showing the transaction',
        'Internal authorization logs',
        'Employee access records',
        'Security camera footage if applicable'
      ],
      incorrect_amount: [
        'Original invoice or receipt',
        'Purchase order or contract',
        'Payment authorization',
        'Communication with counterparty'
      ],
      duplicate_charge: [
        'Bank statement showing both transactions',
        'Original transaction authorization',
        'Vendor communication acknowledging error'
      ],
      service_dispute: [
        'Service agreement or contract',
        'Communication regarding service issues',
        'Documentation of service delivery problems',
        'Attempts to resolve with vendor'
      ]
    }
    
    return evidenceMap[disputeType] || []
  }

  // AI-powered reconciliation insights
  getReconciliationInsights(accountId: string): {
    processing_efficiency: number
    accuracy_trends: Array<{ period: string, accuracy: number }>
    common_issues: Array<{ issue: string, frequency: number, impact: number }>
    automation_opportunities: string[]
    recommended_improvements: string[]
  } {
    const recentReconciliations = this.getReconciliationHistory(accountId, 6) // Last 6 periods
    
    const efficiency = recentReconciliations.reduce((sum, rec) => 
      sum + (rec.reconciled_items.length / (rec.reconciled_items.length + rec.unmatched_bank_items.length + rec.unmatched_book_items.length))
    , 0) / recentReconciliations.length

    const accuracyTrends = recentReconciliations.map(rec => ({
      period: '${rec.period_start} - ${rec.period_end}',
      accuracy: Math.round(efficiency * 100)
    }))

    const commonIssues = [
      { 
        issue: 'Timing differences in transaction recording', 
        frequency: Math.round(Math.random() * 20 + 10),
        impact: 2500
      },
      { 
        issue: 'Missing transaction descriptions', 
        frequency: Math.round(Math.random() * 15 + 5),
        impact: 1200
      },
      { 
        issue: 'Rounding differences in amounts', 
        frequency: Math.round(Math.random() * 10 + 3),
        impact: 50
      }
    ]

    const automationOpportunities = [
      'Implement automatic bank feed imports',
      'Set up rule-based transaction categorization',
      'Enable automatic matching for recurring transactions',
      'Configure real-time transaction notifications'
    ]

    const recommendedImprovements = [
      'Standardize transaction description formats',
      'Implement daily reconciliation reviews',
      'Set up exception reporting for large variances',
      'Train staff on proper transaction coding'
    ]

    return {
      processing_efficiency: efficiency,
      accuracy_trends: accuracyTrends,
      common_issues: commonIssues,
      automation_opportunities: automationOpportunities,
      recommended_improvements: recommendedImprovements
    }
  }

  // Mock reconciliation history for analysis
  private getReconciliationHistory(accountId: string, periods: number): ReconciliationReport[] {
    const history: ReconciliationReport[] = []
    
    for (let i = 0; i < periods; i++) {
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - i - 1)
      const endDate = new Date(startDate)
      endDate.setMonth(endDate.getMonth() + 1)
      
      // Mock historical reconciliation data
      history.push({
        account_id: accountId,
        period_start: startDate.toISOString().split('T')[0],
        period_end: endDate.toISOString().split('T')[0],
        beginning_balance: 50000 + Math.random() * 20000,
        ending_balance: 45000 + Math.random() * 25000,
        book_balance: 45000 + Math.random() * 25000,
        bank_balance: 45000 + Math.random() * 25000,
        variance: (Math.random() - 0.5) * 2000,
        reconciled_items: [],
        unmatched_bank_items: [],
        unmatched_book_items: [],
        suggestions: [],
        ai_risk_assessment: {
          fraud_indicators: [],
          unusual_patterns: [],
          compliance_issues: [],
          overall_risk_score: Math.random() * 0.3
        }
      })
    }
    
    return history
  }

  // Process dispute resolution
  processDispute(disputeId: string, resolution: 'approved' | 'denied', notes: string): {
    success: boolean
    message: string
    next_steps: string[]
  } {
    // Mock dispute processing
    return {
      success: true,
      message: 'Dispute ${disputeId} has been ${resolution}',
      next_steps: resolution === 'approved' ? [
        'Bank credit will be processed within 5-10 business days',
        'Updated bank statement will reflect the adjustment',
        'Monitor account for successful resolution'
      ] : [
        'Review additional evidence if available',
        'Consider escalation to bank management',
        'Document resolution for future reference'
      ]
    }
  }

  // Get reconciliation metrics for reporting
  getReconciliationMetrics(accountId: string): {
    reconciliation_rate: number
    average_processing_time: number
    variance_trend: 'improving' | 'stable' | 'declining'
    automation_level: number
    accuracy_score: number
  } {
    const history = this.getReconciliationHistory(accountId, 12)
    const recentHistory = history.slice(0, 6)
    const olderHistory = history.slice(6)

    const reconciliationRate = recentHistory.reduce((sum, rec) => 
      sum + (rec.reconciled_items.length / (rec.reconciled_items.length + rec.unmatched_bank_items.length + rec.unmatched_book_items.length))
    , 0) / recentHistory.length

    const averageVariance = recentHistory.reduce((sum, rec) => sum + Math.abs(rec.variance), 0) / recentHistory.length
    const oldAverageVariance = olderHistory.reduce((sum, rec) => sum + Math.abs(rec.variance), 0) / olderHistory.length
    
    const varianceTrend = averageVariance < oldAverageVariance * 0.9 ? 'improving' :
                         averageVariance > oldAverageVariance * 1.1 ? 'declining' : 'stable'

    return {
      reconciliation_rate: reconciliationRate,
      average_processing_time: await this.calculateAverageProcessingTime(),
      variance_trend: varianceTrend,
      automation_level: 0.85, // 85% automated
      accuracy_score: reconciliationRate * 100
    }
  }

  private async calculateAverageProcessingTime(): Promise<number> {
    try {
      // Fetch actual processing time metrics from database
      const response = await fetch('/api/v1/reconciliation/metrics/processing-time', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${localStorage.getItem('thorbis_auth_token')}'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch processing time metrics')
      }

      const data = await response.json()
      return data.average_processing_time_minutes || 45 // Fallback to 45 minutes
    } catch (error) {
      console.error('Error calculating average processing time:', error)
      return 45 // Default fallback
    }
  }
}

// Utility functions
export function getReconciliationStatusColor(variance: number): string {
  if (Math.abs(variance) < 1) return 'text-green-600 bg-green-50'
  if (Math.abs(variance) < 100) return 'text-yellow-600 bg-yellow-50'
  return 'text-red-600 bg-red-50'
}

export function formatReconciliationDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short', 
    day: 'numeric'
  })
}

export function calculateReconciliationAccuracy(
  matched: number, 
  unmatchedBank: number, 
  unmatchedBook: number
): number {
  const total = matched + unmatchedBank + unmatchedBook
  return total > 0 ? (matched / total) * 100 : 0
}