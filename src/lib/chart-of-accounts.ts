import { ChartOfAccount, AccountType, AccountSubtype } from '@/types/accounting'

export const DEFAULT_CHART_OF_ACCOUNTS: Omit<ChartOfAccount, 'id' | 'balance' | 'created_at' | 'updated_at'>[] = [
  // Assets
  { code: '1000', name: 'Cash', type: 'asset', subtype: 'current_asset', description: 'Cash on hand and in bank accounts', is_active: true },
  { code: '1010', name: 'Checking Account', type: 'asset', subtype: 'current_asset', description: 'Primary business checking account', is_active: true },
  { code: '1020', name: 'Savings Account', type: 'asset', subtype: 'current_asset', description: 'Business savings account', is_active: true },
  { code: '1100', name: 'Accounts Receivable', type: 'asset', subtype: 'current_asset', description: 'Money owed by customers', is_active: true },
  { code: '1200', name: 'Inventory', type: 'asset', subtype: 'current_asset', description: 'Products and materials for sale', is_active: true },
  { code: '1300', name: 'Prepaid Expenses', type: 'asset', subtype: 'current_asset', description: 'Expenses paid in advance', is_active: true },
  { code: '1400', name: 'Equipment', type: 'asset', subtype: 'fixed_asset', description: 'Business equipment and machinery', is_active: true },
  { code: '1410', name: 'Accumulated Depreciation - Equipment', type: 'asset', subtype: 'fixed_asset', description: 'Accumulated depreciation on equipment', is_active: true },
  { code: '1500', name: 'Vehicles', type: 'asset', subtype: 'fixed_asset', description: 'Business vehicles', is_active: true },
  { code: '1510', name: 'Accumulated Depreciation - Vehicles', type: 'asset', subtype: 'fixed_asset', description: 'Accumulated depreciation on vehicles', is_active: true },

  // Liabilities
  { code: '2000', name: 'Accounts Payable', type: 'liability', subtype: 'current_liability', description: 'Money owed to vendors', is_active: true },
  { code: '2100', name: 'Credit Card Payable', type: 'liability', subtype: 'current_liability', description: 'Credit card balances', is_active: true },
  { code: '2200', name: 'Accrued Expenses', type: 'liability', subtype: 'current_liability', description: 'Expenses incurred but not yet paid', is_active: true },
  { code: '2210', name: 'Payroll Liabilities', type: 'liability', subtype: 'current_liability', description: 'Unpaid wages and payroll taxes', is_active: true },
  { code: '2220', name: 'Sales Tax Payable', type: 'liability', subtype: 'current_liability', description: 'Sales tax collected but not yet paid', is_active: true },
  { code: '2300', name: 'Short-term Loans', type: 'liability', subtype: 'current_liability', description: 'Loans due within one year', is_active: true },
  { code: '2500', name: 'Long-term Debt', type: 'liability', subtype: 'long_term_liability', description: 'Loans and debt due after one year', is_active: true },

  // Equity
  { code: '3000', name: 'Owner\'s Equity', type: 'equity', subtype: 'equity', description: 'Owner\'s investment in the business', is_active: true },
  { code: '3100', name: 'Retained Earnings', type: 'equity', subtype: 'equity', description: 'Accumulated profits retained in business', is_active: true },
  { code: '3200', name: 'Owner\'s Draw', type: 'equity', subtype: 'equity', description: 'Money withdrawn by owner', is_active: true },

  // Revenue
  { code: '4000', name: 'Sales Revenue', type: 'revenue', subtype: 'operating_revenue', description: 'Revenue from primary business activities', is_active: true },
  { code: '4100', name: 'Service Revenue', type: 'revenue', subtype: 'operating_revenue', description: 'Revenue from services provided', is_active: true },
  { code: '4200', name: 'Interest Income', type: 'revenue', subtype: 'other_revenue', description: 'Interest earned on bank accounts and investments', is_active: true },
  { code: '4300', name: 'Other Income', type: 'revenue', subtype: 'other_revenue', description: 'Miscellaneous income', is_active: true },

  // Expenses
  { code: '5000', name: 'Cost of Goods Sold', type: 'expense', subtype: 'operating_expense', description: 'Direct costs of producing goods sold', is_active: true },
  { code: '5100', name: 'Advertising', type: 'expense', subtype: 'operating_expense', description: 'Marketing and advertising expenses', is_active: true },
  { code: '5200', name: 'Office Supplies', type: 'expense', subtype: 'operating_expense', description: 'Office supplies and materials', is_active: true },
  { code: '5300', name: 'Rent', type: 'expense', subtype: 'operating_expense', description: 'Office and facility rent', is_active: true },
  { code: '5400', name: 'Utilities', type: 'expense', subtype: 'operating_expense', description: 'Electricity, water, gas, internet', is_active: true },
  { code: '5500', name: 'Insurance', type: 'expense', subtype: 'operating_expense', description: 'Business insurance premiums', is_active: true },
  { code: '5600', name: 'Professional Fees', type: 'expense', subtype: 'operating_expense', description: 'Legal, accounting, and consulting fees', is_active: true },
  { code: '5700', name: 'Travel and Entertainment', type: 'expense', subtype: 'operating_expense', description: 'Business travel and entertainment', is_active: true },
  { code: '5800', name: 'Vehicle Expenses', type: 'expense', subtype: 'operating_expense', description: 'Gas, maintenance, and vehicle expenses', is_active: true },
  { code: '5900', name: 'Payroll Expenses', type: 'expense', subtype: 'operating_expense', description: 'Employee wages and benefits', is_active: true },
  { code: '6000', name: 'Depreciation', type: 'expense', subtype: 'operating_expense', description: 'Depreciation of fixed assets', is_active: true },
  { code: '6100', name: 'Interest Expense', type: 'expense', subtype: 'other_expense', description: 'Interest paid on loans and credit', is_active: true },
  { code: '6200', name: 'Bank Fees', type: 'expense', subtype: 'other_expense', description: 'Bank service charges and fees', is_active: true },
  { code: '6300', name: 'Other Expenses', type: 'expense', subtype: 'other_expense', description: 'Miscellaneous business expenses', is_active: true },
]

export function getAccountsByType(accounts: ChartOfAccount[], type: AccountType): ChartOfAccount[] {
  return accounts.filter(account => account.type === type && account.is_active)
}

export function getAccountsBySubtype(accounts: ChartOfAccount[], subtype: AccountSubtype): ChartOfAccount[] {
  return accounts.filter(account => account.subtype === subtype && account.is_active)
}

export function getAccountBalance(account: ChartOfAccount): number {
  return account.balance || 0
}

export function isDebitAccount(accountType: AccountType): boolean {
  return ['asset', 'expense'].includes(accountType)
}

export function isCreditAccount(accountType: AccountType): boolean {
  return ['liability', 'equity', 'revenue'].includes(accountType)
}

export function calculateAccountBalance(
  account: ChartOfAccount,
  totalDebits: number,
  totalCredits: number
): number {
  if (isDebitAccount(account.type)) {
    return totalDebits - totalCredits
  } else {
    return totalCredits - totalDebits
  }
}

export function formatAccountCode(code: string): string {
  return code.padStart(4, '0')
}

export function validateAccountCode(code: string, existingCodes: string[]): boolean {
  const numericCode = parseInt(code)
  return !isNaN(numericCode) && numericCode > 0 && !existingCodes.includes(code)
}

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  asset: 'Assets',
  liability: 'Liabilities', 
  equity: 'Equity',
  revenue: 'Revenue',
  expense: 'Expenses'
}

export const ACCOUNT_SUBTYPE_LABELS: Record<AccountSubtype, string> = {
  current_asset: 'Current Assets',
  fixed_asset: 'Fixed Assets',
  other_asset: 'Other Assets',
  current_liability: 'Current Liabilities',
  long_term_liability: 'Long-term Liabilities',
  other_liability: 'Other Liabilities',
  equity: 'Equity',
  operating_revenue: 'Operating Revenue',
  other_revenue: 'Other Revenue',
  operating_expense: 'Operating Expenses',
  other_expense: 'Other Expenses'
}