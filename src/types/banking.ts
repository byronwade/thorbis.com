/**
 * Banking Types for Thorbis Banking App
 * 
 * This file contains all TypeScript types and interfaces for the banking
 * application, including accounts, transactions, payments, and loans.
 */

// =====================================================================================
// CORE ACCOUNT TYPES
// =====================================================================================

export type AccountType = 'checking' | 'savings' | 'credit' | 'loan' | 'investment'
export type AccountStatus = 'active' | 'frozen' | 'closed' | 'pending'

export interface BankingAccount {
  id: string
  tenant_id: string
  user_id: string
  
  // Account Information
  account_number: string
  account_name: string
  account_type: AccountType
  
  // Balance and Limits
  current_balance: number
  available_balance: number
  credit_limit?: number
  minimum_balance: number
  
  // Account Status
  status: AccountStatus
  opened_date: string
  closed_date?: string
  
  // Interest and Fees
  interest_rate?: number
  monthly_fee: number
  overdraft_fee: number
  
  // Metadata
  description?: string
  external_account_id?: string
  routing_number?: string
  
  // Timestamps
  created_at: string
  updated_at: string
}

// =====================================================================================
// TRANSACTION TYPES
// =====================================================================================

export type TransactionType = 'debit' | 'credit' | 'transfer' | 'payment' | 'fee' | 'interest'
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled'

export interface BankingTransaction {
  id: string
  tenant_id: string
  account_id: string
  
  // Transaction Details
  transaction_type: TransactionType
  amount: number
  balance_after: number
  
  // Transaction Information
  description: string
  category?: string
  subcategory?: string
  merchant_name?: string
  reference_number?: string
  
  // Related Transactions
  related_transaction_id?: string
  transfer_account_id?: string
  
  // Payment Information
  payment_method?: string
  card_last_four?: string
  
  // Status and Processing
  status: TransactionStatus
  processed_date: string
  effective_date: string
  
  // Location and Device
  location_lat?: number
  location_lng?: number
  location_name?: string
  device_id?: string
  
  // Metadata
  external_transaction_id?: string
  metadata: Record<string, unknown>
  
  // Timestamps
  created_at: string
  updated_at: string
}

// =====================================================================================
// PAYMENT TYPES
// =====================================================================================

export type PaymentMethodType = 'credit_card' | 'debit_card' | 'bank_account' | 'digital_wallet'
export type PaymentMethodStatus = 'active' | 'expired' | 'frozen' | 'deleted'

export interface BankingPaymentMethod {
  id: string
  tenant_id: string
  user_id: string
  
  // Method Information
  method_type: PaymentMethodType
  method_name: string
  
  // Card Information
  last_four?: string
  expiry_month?: number
  expiry_year?: number
  card_brand?: string
  
  // Bank Account Information
  account_id?: string
  routing_number?: string
  account_number_masked?: string
  
  // Status and Settings
  status: PaymentMethodStatus
  is_default: boolean
  
  // Security
  fingerprint?: string
  external_payment_method_id?: string
  
  // Timestamps
  created_at: string
  updated_at: string
}

export type PaymentFrequency = 'once' | 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly'
export type ScheduledPaymentStatus = 'active' | 'paused' | 'completed' | 'cancelled'

export interface BankingScheduledPayment {
  id: string
  tenant_id: string
  user_id: string
  
  // Payment Details
  payee_name: string
  amount: number
  payment_method_id: string
  from_account_id: string
  
  // Scheduling
  frequency: PaymentFrequency
  next_payment_date: string
  end_date?: string
  
  // Status
  status: ScheduledPaymentStatus
  auto_pay: boolean
  
  // Metadata
  description?: string
  category?: string
  reference_number?: string
  
  // Timestamps
  created_at: string
  updated_at: string
}

export type PaymentExecutionStatus = 'pending' | 'completed' | 'failed' | 'cancelled'

export interface BankingPaymentExecution {
  id: string
  tenant_id: string
  scheduled_payment_id: string
  
  // Execution Details
  amount: number
  executed_date: string
  status: PaymentExecutionStatus
  
  // Related Transaction
  transaction_id?: string
  
  // Error Information
  error_code?: string
  error_message?: string
  
  // Timestamps
  created_at: string
  updated_at: string
}

// =====================================================================================
// CARD TYPES
// =====================================================================================

export type CardType = 'debit' | 'credit' | 'virtual' | 'prepaid'
export type CardStatus = 'active' | 'frozen' | 'expired' | 'lost' | 'stolen' | 'cancelled'

export interface BankingCard {
  id: string
  tenant_id: string
  user_id: string
  account_id: string
  
  // Card Information
  card_type: CardType
  card_name: string
  last_four: string
  
  // Card Details
  expiry_month: number
  expiry_year: number
  card_brand: string
  
  // Limits and Settings
  daily_limit?: number
  monthly_limit?: number
  single_transaction_limit?: number
  
  // Status
  status: CardStatus
  
  // Security Settings
  pin_set: boolean
  contactless_enabled: boolean
  online_purchases_enabled: boolean
  international_enabled: boolean
  
  // Metadata
  issued_date: string
  activation_date?: string
  last_used_date?: string
  external_card_id?: string
  
  // Timestamps
  created_at: string
  updated_at: string
}

// =====================================================================================
// LOAN TYPES
// =====================================================================================

export type LoanType = 'term_loan' | 'line_of_credit' | 'sba_loan' | 'equipment_loan' | 'real_estate_loan'
export type LoanStatus = 'active' | 'paid_off' | 'defaulted' | 'closed'

export interface BankingLoan {
  id: string
  tenant_id: string
  user_id: string
  
  // Loan Information
  loan_type: LoanType
  loan_name: string
  
  // Loan Amounts
  original_amount: number
  current_balance: number
  available_credit: number
  
  // Terms
  interest_rate: number
  term_months?: number
  monthly_payment: number
  
  // Dates
  origination_date: string
  first_payment_date?: string
  maturity_date?: string
  next_payment_date?: string
  
  // Status
  status: LoanStatus
  
  // Loan Details
  purpose?: string
  collateral_description?: string
  guarantor_info: Record<string, unknown>
  
  // External Reference
  external_loan_id?: string
  loan_servicer?: string
  
  // Timestamps
  created_at: string
  updated_at: string
}

export type LoanPaymentStatus = 'scheduled' | 'pending' | 'completed' | 'failed' | 'late'

export interface BankingLoanPayment {
  id: string
  tenant_id: string
  loan_id: string
  
  // Payment Information
  payment_amount: number
  principal_amount: number
  interest_amount: number
  fees_amount: number
  
  // Payment Details
  payment_date: string
  due_date: string
  status: LoanPaymentStatus
  
  // Balance Information
  balance_before: number
  balance_after: number
  
  // Related Transaction
  transaction_id?: string
  
  // Timestamps
  created_at: string
  updated_at: string
}

// =====================================================================================
// TRANSFER TYPES
// =====================================================================================

export type TransferType = 'internal' | 'ach' | 'wire' | 'p2p'
export type TransferStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'

export interface BankingTransfer {
  id: string
  tenant_id: string
  user_id: string
  
  // Transfer Details
  transfer_type: TransferType
  amount: number
  
  // Source and Destination
  from_account_id: string
  to_account_id?: string
  external_account_info: Record<string, unknown>
  
  // Transfer Information
  description?: string
  reference_number?: string
  
  // Fees and Timing
  fee_amount: number
  exchange_rate: number
  
  // Status and Dates
  status: TransferStatus
  initiated_date: string
  expected_completion_date?: string
  completed_date?: string
  
  // Related Transactions
  debit_transaction_id?: string
  credit_transaction_id?: string
  fee_transaction_id?: string
  
  // External Reference
  external_transfer_id?: string
  
  // Timestamps
  created_at: string
  updated_at: string
}

// =====================================================================================
// REPORTING TYPES
// =====================================================================================

export type ReportStatus = 'generating' | 'completed' | 'failed' | 'archived'

export interface BankingReport {
  id: string
  tenant_id: string
  user_id: string
  
  // Report Information
  report_type: string
  report_name: string
  report_period_start: string
  report_period_end: string
  
  // Report Data
  report_data: Record<string, unknown>
  file_path?: string
  file_size?: number
  file_format: string
  
  // Status
  status: ReportStatus
  
  // Timestamps
  generated_at: string
  expires_at?: string
  created_at: string
  updated_at: string
}

// =====================================================================================
// API RESPONSE TYPES
// =====================================================================================

export interface BankingApiResponse<T> {
  data: T
  success: boolean
  message?: string
  errors?: string[]
}

export interface BankingPaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    per_page: number
    total: number
    total_pages: number
  }
  success: boolean
  message?: string
}

// =====================================================================================
// DASHBOARD TYPES
// =====================================================================================

export interface BankingDashboardData {
  totalBalance: number
  checkingBalance: number
  savingsBalance: number
  creditAvailable: number
  recentTransactions: BankingTransaction[]
  accounts: BankingAccount[]
  monthlyIncome: number
  monthlyExpenses: number
  netCashFlow: number
}

export interface BankingAnalytics {
  monthlyIncome: number
  monthlyExpenses: number
  netCashFlow: number
  accountBalanceGrowth: number
  spendingByCategory: Record<string, number>
  incomeVsExpensesTrend: Array<{
    date: string
    income: number
    expenses: number
  }>
}

// =====================================================================================
// FORM TYPES
// =====================================================================================

export interface TransferFormData {
  fromAccountId: string
  toAccountId: string
  amount: number
  description: string
  transferType: TransferType
}

export interface ScheduledPaymentFormData {
  payeeName: string
  amount: number
  paymentMethodId: string
  fromAccountId: string
  frequency: PaymentFrequency
  nextPaymentDate: string
  endDate?: string
  description?: string
  category?: string
}

export interface CardRequestFormData {
  cardType: CardType
  cardName: string
  accountId: string
  dailyLimit?: number
  monthlyLimit?: number
  singleTransactionLimit?: number
}