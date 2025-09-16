export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
export type AccountSubtype = 
  | 'current_asset' | 'fixed_asset' | 'other_asset'
  | 'current_liability' | 'long_term_liability' | 'other_liability'
  | 'equity'
  | 'operating_revenue' | 'other_revenue'
  | 'operating_expense' | 'other_expense'

export interface ChartOfAccount {
  id: string
  code: string
  name: string
  type: AccountType
  subtype: AccountSubtype
  balance: number
  description?: string
  parent_id?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  account_id: string
  date: string
  description: string
  reference?: string
  reference_number?: string
  amount: number
  total_amount: number
  type: 'income' | 'expense' | 'transfer'
  category: string
  status: 'draft' | 'posted' | 'voided'
  reconciliation_status?: 'pending' | 'reconciled' | 'disputed'
  created_at: string
  updated_at: string
  entries: TransactionEntry[]
  attachments?: TransactionAttachment[]
  ai_categorization?: AiCategorization
}

export interface TransactionEntry {
  id: string
  transaction_id: string
  account_id: string
  account: ChartOfAccount
  debit_amount: number
  credit_amount: number
  description?: string
  created_at: string
}

export interface TransactionAttachment {
  id: string
  transaction_id: string
  file_name: string
  file_url: string
  file_type: string
  file_size: number
  created_at: string
}

export interface AiCategorization {
  confidence: number
  suggested_category: string
  suggested_accounts: string[]
  insights: string[]
  processed_at: string
}

export interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  address?: Address
  tax_id?: string
  payment_terms: number
  credit_limit?: number
  preferred_currency?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Vendor {
  id: string
  name: string
  email?: string
  phone?: string
  address?: Address
  tax_id?: string
  payment_terms: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Address {
  street: string
  city: string
  state: string
  zip_code: string
  country: string
}

export interface Invoice {
  id: string
  invoice_number: string
  customer_id: string
  customer: Customer
  date: string
  due_date: string
  subtotal: number
  tax_amount: number
  total_amount: number
  balance: number
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'voided'
  line_items: InvoiceLineItem[]
  payments?: Payment[]
  created_at: string
  updated_at: string
}

export interface InvoiceLineItem {
  id: string
  invoice_id: string
  description: string
  quantity: number
  unit_price: number
  line_total: number
  tax_rate?: number
  account_id?: string
}

export interface Bill {
  id: string
  bill_number: string
  vendor_id: string
  vendor: Vendor
  date: string
  due_date: string
  subtotal: number
  tax_amount: number
  total_amount: number
  balance: number
  status: 'draft' | 'pending' | 'paid' | 'overdue' | 'voided'
  line_items: BillLineItem[]
  payments?: Payment[]
  created_at: string
  updated_at: string
}

export interface BillLineItem {
  id: string
  bill_id: string
  account_id: string
  description: string
  quantity: number
  unit_price: number
  total_amount: number
  tax_rate?: number
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  payment_number: string
  type: 'payment_received' | 'payment_made'
  amount: number
  date: string
  method: 'cash' | 'check' | 'credit_card' | 'bank_transfer' | 'other'
  reference_number?: string
  memo?: string
  account_id: string
  customer_id?: string
  vendor_id?: string
  invoice_id?: string
  bill_id?: string
  created_at: string
  updated_at: string
}

export interface TaxRate {
  id: string
  name: string
  rate: number
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface FinancialReport {
  id: string
  name: string
  type: 'balance_sheet' | 'income_statement' | 'cash_flow' | 'trial_balance' | 'custom'
  date_from: string
  date_to: string
  data: Record<string, unknown>
  generated_at: string
  ai_insights?: ReportInsight[]
}

export interface ReportInsight {
  type: 'trend' | 'anomaly' | 'opportunity' | 'warning'
  title: string
  description: string
  confidence: number
  recommendation?: string
  impact_score: number
}

export interface BankAccount {
  id: string
  name: string
  account_number: string
  routing_number?: string
  bank_name: string
  account_type: 'checking' | 'savings' | 'credit_card' | 'line_of_credit'
  current_balance: number
  available_balance: number
  currency: string
  last_reconciled?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface BankTransaction {
  id: string
  bank_account_id: string
  date: string
  description: string
  amount: number
  type: 'debit' | 'credit'
  status: 'cleared' | 'pending' | 'reconciled'
  transaction_id?: string
  ai_match_confidence?: number
  created_at: string
  updated_at: string
}