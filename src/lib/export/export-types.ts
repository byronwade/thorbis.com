// Export format types
export enum ExportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
  JSON = 'json'
}

// Export data types
export enum ExportDataType {
  TRANSACTIONS = 'transactions',
  INVOICES = 'invoices',
  BILLS = 'bills',
  ACCOUNTS = 'accounts',
  CUSTOMERS = 'customers',
  VENDORS = 'vendors',
  FINANCIAL_REPORT = 'financial_report',
  TAX_REPORT = 'tax_report'
}

// Export options
export interface ExportOptions {
  format: ExportFormat
  dataType: ExportDataType
  filename?: string
  dateRange?: {
    startDate: Date
    endDate: Date
  }
  filters?: Record<string, unknown>
  includeDetails?: boolean
  groupBy?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  columns?: string[]
}

// Export result
export interface ExportResult {
  success: boolean
  filename: string
  url?: string
  error?: string
  size?: number
  recordCount?: number
}

// Report template types
export enum ReportTemplate {
  PROFIT_LOSS = 'profit_loss',
  BALANCE_SHEET = 'balance_sheet',
  CASH_FLOW = 'cash_flow',
  TRIAL_BALANCE = 'trial_balance',
  AGED_RECEIVABLES = 'aged_receivables',
  AGED_PAYABLES = 'aged_payables',
  TAX_SUMMARY = 'tax_summary'
}

// PDF export options
export interface PDFExportOptions extends ExportOptions {
  format: ExportFormat.PDF
  template?: ReportTemplate
  includeCharts?: boolean
  includeHeader?: boolean
  includeFooter?: boolean
  orientation?: 'portrait' | 'landscape'
  pageSize?: 'A4' | 'Letter' | 'Legal'
}

// Excel export options
export interface ExcelExportOptions extends ExportOptions {
  format: ExportFormat.EXCEL
  includeFormulas?: boolean
  includeCharts?: boolean
  sheetName?: string
  autoFilter?: boolean
  freezeRows?: number
  columnWidths?: Record<string, number>
}

// CSV export options
export interface CSVExportOptions extends ExportOptions {
  format: ExportFormat.CSV
  delimiter?: ',' | ';' | '\t'
  encoding?: 'utf-8' | 'latin1'
  includeHeaders?: boolean
  quoteAll?: boolean
}

// Export progress
export interface ExportProgress {
  id: string
  status: 'preparing' | 'processing' | 'generating' | 'completed' | 'failed'
  progress: number // 0-100
  message?: string
  error?: string
  result?: ExportResult
}

// Column configuration for exports
export interface ExportColumn {
  key: string
  label: string
  type: 'text' | 'number' | 'currency' | 'date' | 'boolean'
  width?: number
  format?: string
  formula?: string
  align?: 'left' | 'center' | 'right'
}

// Export configuration for different data types
export const EXPORT_CONFIGURATIONS: Record<ExportDataType, {
  columns: ExportColumn[]
  defaultFilename: string
  supportedFormats: ExportFormat[]
}> = {
  [ExportDataType.TRANSACTIONS]: {
    columns: [
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'description', label: 'Description', type: 'text' },
      { key: 'type', label: 'Type', type: 'text' },
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'total_amount', label: 'Amount', type: 'currency' },
      { key: 'reference_number', label: 'Reference', type: 'text' },
      { key: 'status', label: 'Status', type: 'text' }
    ],
    defaultFilename: 'transactions',
    supportedFormats: [ExportFormat.PDF, ExportFormat.EXCEL, ExportFormat.CSV, ExportFormat.JSON]
  },
  [ExportDataType.INVOICES]: {
    columns: [
      { key: 'invoice_number', label: 'Invoice #', type: 'text' },
      { key: 'customer_name', label: 'Customer', type: 'text' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'due_date', label: 'Due Date', type: 'date' },
      { key: 'total_amount', label: 'Amount', type: 'currency' },
      { key: 'status', label: 'Status', type: 'text' },
      { key: 'paid_amount', label: 'Paid', type: 'currency' },
      { key: 'balance_due', label: 'Balance Due', type: 'currency' }
    ],
    defaultFilename: 'invoices',
    supportedFormats: [ExportFormat.PDF, ExportFormat.EXCEL, ExportFormat.CSV, ExportFormat.JSON]
  },
  [ExportDataType.BILLS]: {
    columns: [
      { key: 'bill_number', label: 'Bill #', type: 'text' },
      { key: 'vendor_name', label: 'Vendor', type: 'text' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'due_date', label: 'Due Date', type: 'date' },
      { key: 'total_amount', label: 'Amount', type: 'currency' },
      { key: 'status', label: 'Status', type: 'text' },
      { key: 'paid_amount', label: 'Paid', type: 'currency' },
      { key: 'balance_due', label: 'Balance Due', type: 'currency' }
    ],
    defaultFilename: 'bills',
    supportedFormats: [ExportFormat.PDF, ExportFormat.EXCEL, ExportFormat.CSV, ExportFormat.JSON]
  },
  [ExportDataType.ACCOUNTS]: {
    columns: [
      { key: 'code', label: 'Account Code', type: 'text' },
      { key: 'name', label: 'Account Name', type: 'text' },
      { key: 'type', label: 'Type', type: 'text' },
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'balance', label: 'Balance', type: 'currency' },
      { key: 'is_active', label: 'Active', type: 'boolean' }
    ],
    defaultFilename: 'chart-of-accounts',
    supportedFormats: [ExportFormat.PDF, ExportFormat.EXCEL, ExportFormat.CSV, ExportFormat.JSON]
  },
  [ExportDataType.CUSTOMERS]: {
    columns: [
      { key: 'name', label: 'Customer Name', type: 'text' },
      { key: 'email', label: 'Email', type: 'text' },
      { key: 'phone', label: 'Phone', type: 'text' },
      { key: 'address', label: 'Address', type: 'text' },
      { key: 'total_invoiced', label: 'Total Invoiced', type: 'currency' },
      { key: 'total_paid', label: 'Total Paid', type: 'currency' },
      { key: 'balance_due', label: 'Balance Due', type: 'currency' }
    ],
    defaultFilename: 'customers',
    supportedFormats: [ExportFormat.PDF, ExportFormat.EXCEL, ExportFormat.CSV, ExportFormat.JSON]
  },
  [ExportDataType.VENDORS]: {
    columns: [
      { key: 'name', label: 'Vendor Name', type: 'text' },
      { key: 'email', label: 'Email', type: 'text' },
      { key: 'phone', label: 'Phone', type: 'text' },
      { key: 'address', label: 'Address', type: 'text' },
      { key: 'total_billed', label: 'Total Billed', type: 'currency' },
      { key: 'total_paid', label: 'Total Paid', type: 'currency' },
      { key: 'balance_due', label: 'Balance Due', type: 'currency' }
    ],
    defaultFilename: 'vendors',
    supportedFormats: [ExportFormat.PDF, ExportFormat.EXCEL, ExportFormat.CSV, ExportFormat.JSON]
  },
  [ExportDataType.FINANCIAL_REPORT]: {
    columns: [
      { key: 'account_name', label: 'Account', type: 'text' },
      { key: 'account_code', label: 'Code', type: 'text' },
      { key: 'debit_total', label: 'Debits', type: 'currency' },
      { key: 'credit_total', label: 'Credits', type: 'currency' },
      { key: 'balance', label: 'Balance', type: 'currency' }
    ],
    defaultFilename: 'financial-report',
    supportedFormats: [ExportFormat.PDF, ExportFormat.EXCEL, ExportFormat.CSV]
  },
  [ExportDataType.TAX_REPORT]: {
    columns: [
      { key: 'period', label: 'Period', type: 'text' },
      { key: 'taxable_income', label: 'Taxable Income', type: 'currency' },
      { key: 'tax_deductions', label: 'Deductions', type: 'currency' },
      { key: 'tax_owed', label: 'Tax Owed', type: 'currency' },
      { key: 'tax_paid', label: 'Tax Paid', type: 'currency' },
      { key: 'balance_due', label: 'Balance Due', type: 'currency' }
    ],
    defaultFilename: 'tax-report',
    supportedFormats: [ExportFormat.PDF, ExportFormat.EXCEL, ExportFormat.CSV]
  }
}