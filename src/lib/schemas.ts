import { z } from 'zod'

// Account validation schemas
export const AccountTypeSchema = z.enum(['asset', 'liability', 'equity', 'revenue', 'expense'])

export const AccountSubtypeSchema = z.enum([
  'current_asset',
  'fixed_asset',
  'current_liability', 
  'long_term_liability',
  'equity',
  'operating_revenue',
  'non_operating_revenue',
  'operating_expense',
  'non_operating_expense'
])

export const ChartOfAccountSchema = z.object({
  id: z.string().optional(),
  code: z.string()
    .min(3, 'Account code must be at least 3 characters')
    .max(10, 'Account code must not exceed 10 characters')
    .regex(/^\d+$/, 'Account code must contain only numbers'),
  name: z.string()
    .min(1, 'Account name is required')
    .max(255, 'Account name must not exceed 255 characters')
    .trim(),
  type: AccountTypeSchema,
  subtype: AccountSubtypeSchema,
  description: z.string()
    .max(1000, 'Description must not exceed 1000 characters')
    .optional(),
  parent_account_id: z.string().nullable().optional(),
  balance: z.number()
    .finite('Balance must be a valid number')
    .default(0),
  is_active: z.boolean().default(true),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
})

export const CreateAccountSchema = ChartOfAccountSchema.omit({ 
  id: true, 
  created_at: true, 
  updated_at: true 
})

export const UpdateAccountSchema = ChartOfAccountSchema.partial().omit({ 
  id: true, 
  created_at: true, 
  updated_at: true 
})

// Transaction validation schemas
export const TransactionStatusSchema = z.enum(['draft', 'posted', 'voided'])

export const TransactionEntrySchema = z.object({
  id: z.string().optional(),
  transaction_id: z.string().optional(),
  account_id: z.string()
    .min(1, 'Account is required')
    .uuid('Invalid account ID format'),
  debit_amount: z.number()
    .min(0, 'Debit amount cannot be negative')
    .finite('Debit amount must be a valid number')
    .default(0),
  credit_amount: z.number()
    .min(0, 'Credit amount cannot be negative')
    .finite('Credit amount must be a valid number')  
    .default(0),
  description: z.string()
    .min(1, 'Entry description is required')
    .max(255, 'Entry description must not exceed 255 characters')
    .trim(),
  created_at: z.string().datetime().optional()
}).refine(
  (entry) => {
    // Ensure entry has either debit or credit, but not both
    return (entry.debit_amount > 0) !== (entry.credit_amount > 0)
  },
  {
    message: 'Entry must have either a debit or credit amount, but not both',
    path: ['debit_amount', 'credit_amount']
  }
)

export const TransactionSchema = z.object({
  id: z.string().optional(),
  account_id: z.string()
    .min(1, 'Primary account is required')
    .uuid('Invalid account ID format'),
  date: z.string()
    .min(1, 'Transaction date is required')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  description: z.string()
    .min(1, 'Transaction description is required')
    .max(500, 'Description must not exceed 500 characters')
    .trim(),
  reference_number: z.string()
    .max(100, 'Reference number must not exceed 100 characters')
    .optional(),
  amount: z.number()
    .min(0.01, 'Amount must be greater than 0')
    .finite('Amount must be a valid number'),
  total_amount: z.number()
    .min(0.01, 'Total amount must be greater than 0')
    .finite('Total amount must be a valid number'),
  type: z.enum(['income', 'expense', 'transfer']),
  category: z.string()
    .max(255, 'Category must not exceed 255 characters')
    .optional(),
  status: TransactionStatusSchema.default('draft'),
  reconciliation_status: z.enum(['pending', 'reconciled', 'disputed']).default('pending'),
  entries: z.array(TransactionEntrySchema)
    .min(2, 'Transaction must have at least 2 journal entries')
    .max(20, 'Transaction cannot have more than 20 journal entries'),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
}).refine(
  (transaction) => {
    // Validate that debits equal credits
    const totalDebits = transaction.entries.reduce((sum, entry) => sum + entry.debit_amount, 0)
    const totalCredits = transaction.entries.reduce((sum, entry) => sum + entry.credit_amount, 0)
    return Math.abs(totalDebits - totalCredits) < 0.01
  },
  {
    message: 'Total debits must equal total credits',
    path: ['entries']
  }
)

export const CreateTransactionSchema = TransactionSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
})

export const UpdateTransactionSchema = TransactionSchema.partial().omit({
  id: true,
  created_at: true,
  updated_at: true
})

// Customer validation schemas
export const CustomerSchema = z.object({
  id: z.string().optional(),
  name: z.string()
    .min(1, 'Customer name is required')
    .max(255, 'Customer name must not exceed 255 characters')
    .trim(),
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email must not exceed 255 characters')
    .toLowerCase()
    .optional(),
  phone: z.string()
    .max(20, 'Phone number must not exceed 20 characters')
    .regex(/^[\+]?[0-9\(\)\-\s\.]+$/, 'Invalid phone number format')
    .optional(),
  address: z.object({
    street: z.string().max(255, 'Street address too long').optional(),
    city: z.string().max(100, 'City name too long').optional(),
    state: z.string().max(50, 'State name too long').optional(),
    zip: z.string().max(20, 'ZIP code too long').optional(),
    country: z.string().max(100, 'Country name too long').optional()
  }).optional(),
  payment_terms: z.number()
    .int('Payment terms must be a whole number')
    .min(0, 'Payment terms cannot be negative')
    .max(365, 'Payment terms cannot exceed 365 days')
    .default(30),
  credit_limit: z.number()
    .min(0, 'Credit limit cannot be negative')
    .finite('Credit limit must be a valid number')
    .optional(),
  tax_id: z.string()
    .max(50, 'Tax ID must not exceed 50 characters')
    .optional(),
  notes: z.string()
    .max(2000, 'Notes must not exceed 2000 characters')
    .optional(),
  is_active: z.boolean().default(true),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
})

export const CreateCustomerSchema = CustomerSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
})

export const UpdateCustomerSchema = CustomerSchema.partial().omit({
  id: true,
  created_at: true,
  updated_at: true
})

// Invoice validation schemas
export const InvoiceStatusSchema = z.enum(['draft', 'sent', 'paid', 'overdue', 'voided'])

export const InvoiceLineItemSchema = z.object({
  id: z.string().optional(),
  invoice_id: z.string().optional(),
  description: z.string()
    .min(1, 'Line item description is required')
    .max(255, 'Description must not exceed 255 characters')
    .trim(),
  quantity: z.number()
    .min(0.01, 'Quantity must be greater than 0')
    .finite('Quantity must be a valid number'),
  unit_price: z.number()
    .min(0, 'Unit price cannot be negative')
    .finite('Unit price must be a valid number'),
  line_total: z.number()
    .min(0, 'Line total cannot be negative')
    .finite('Line total must be a valid number'),
  tax_rate: z.number()
    .min(0, 'Tax rate cannot be negative')
    .max(100, 'Tax rate cannot exceed 100%')
    .optional(),
  account_id: z.string()
    .uuid('Invalid account ID format')
    .optional()
}).refine(
  (item) => {
    // Validate that line_total equals quantity * unit_price
    const calculatedTotal = item.quantity * item.unit_price
    return Math.abs(item.line_total - calculatedTotal) < 0.01
  },
  {
    message: 'Line total must equal quantity × unit price',
    path: ['line_total']
  }
)

export const InvoiceSchema = z.object({
  id: z.string().optional(),
  invoice_number: z.string()
    .min(1, 'Invoice number is required')
    .max(50, 'Invoice number must not exceed 50 characters')
    .trim(),
  customer_id: z.string()
    .min(1, 'Customer is required')
    .uuid('Invalid customer ID format'),
  date: z.string()
    .min(1, 'Invoice date is required')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  due_date: z.string()
    .min(1, 'Due date is required')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be in YYYY-MM-DD format'),
  subtotal: z.number()
    .min(0, 'Subtotal cannot be negative')
    .finite('Subtotal must be a valid number'),
  tax_amount: z.number()
    .min(0, 'Tax amount cannot be negative')
    .finite('Tax amount must be a valid number'),
  total_amount: z.number()
    .min(0.01, 'Total amount must be greater than 0')
    .finite('Total amount must be a valid number'),
  balance: z.number()
    .min(0, 'Balance cannot be negative')
    .finite('Balance must be a valid number'),
  status: InvoiceStatusSchema.default('draft'),
  line_items: z.array(InvoiceLineItemSchema)
    .min(1, 'Invoice must have at least one line item')
    .max(100, 'Invoice cannot have more than 100 line items'),
  notes: z.string()
    .max(2000, 'Notes must not exceed 2000 characters')
    .optional(),
  terms: z.string()
    .max(1000, 'Terms must not exceed 1000 characters')
    .optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
}).refine(
  (invoice) => {
    // Validate due date is after invoice date
    return new Date(invoice.due_date) >= new Date(invoice.date)
  },
  {
    message: 'Due date must be on or after invoice date',
    path: ['due_date']
  }
).refine(
  (invoice) => {
    // Validate subtotal equals sum of line item totals
    const calculatedSubtotal = invoice.line_items.reduce((sum, item) => sum + item.line_total, 0)
    return Math.abs(invoice.subtotal - calculatedSubtotal) < 0.01
  },
  {
    message: 'Subtotal must equal sum of line item totals',
    path: ['subtotal']
  }
).refine(
  (invoice) => {
    // Validate total_amount equals subtotal + tax_amount
    const calculatedTotal = invoice.subtotal + invoice.tax_amount
    return Math.abs(invoice.total_amount - calculatedTotal) < 0.01
  },
  {
    message: 'Total amount must equal subtotal plus tax amount',
    path: ['total_amount']
  }
)

export const CreateInvoiceSchema = InvoiceSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
})

export const UpdateInvoiceSchema = InvoiceSchema.partial().omit({
  id: true,
  created_at: true,
  updated_at: true
})

// Bill validation schemas (similar to invoices but for payables)
export const BillStatusSchema = z.enum(['pending', 'approved', 'paid', 'overdue', 'voided'])

export const BillLineItemSchema = z.object({
  id: z.string().optional(),
  bill_id: z.string().optional(),
  description: z.string()
    .min(1, 'Line item description is required')
    .max(255, 'Description must not exceed 255 characters')
    .trim(),
  quantity: z.number()
    .min(0.01, 'Quantity must be greater than 0')
    .finite('Quantity must be a valid number'),
  unit_cost: z.number()
    .min(0, 'Unit cost cannot be negative')
    .finite('Unit cost must be a valid number'),
  line_total: z.number()
    .min(0, 'Line total cannot be negative')
    .finite('Line total must be a valid number'),
  tax_rate: z.number()
    .min(0, 'Tax rate cannot be negative')
    .max(100, 'Tax rate cannot exceed 100%')
    .optional(),
  account_id: z.string()
    .min(1, 'Account is required for expense allocation')
    .uuid('Invalid account ID format')
}).refine(
  (item) => {
    // Validate that line_total equals quantity * unit_cost
    const calculatedTotal = item.quantity * item.unit_cost
    return Math.abs(item.line_total - calculatedTotal) < 0.01
  },
  {
    message: 'Line total must equal quantity × unit cost',
    path: ['line_total']
  }
)

export const BillSchema = z.object({
  id: z.string().optional(),
  bill_number: z.string()
    .min(1, 'Bill number is required')
    .max(50, 'Bill number must not exceed 50 characters')
    .trim(),
  vendor_id: z.string()
    .min(1, 'Vendor is required')
    .uuid('Invalid vendor ID format'),
  date: z.string()
    .min(1, 'Bill date is required')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  due_date: z.string()
    .min(1, 'Due date is required')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be in YYYY-MM-DD format'),
  subtotal: z.number()
    .min(0, 'Subtotal cannot be negative')
    .finite('Subtotal must be a valid number'),
  tax_amount: z.number()
    .min(0, 'Tax amount cannot be negative')
    .finite('Tax amount must be a valid number'),
  total_amount: z.number()
    .min(0.01, 'Total amount must be greater than 0')
    .finite('Total amount must be a valid number'),
  balance: z.number()
    .min(0, 'Balance cannot be negative')
    .finite('Balance must be a valid number'),
  status: BillStatusSchema.default('pending'),
  line_items: z.array(BillLineItemSchema)
    .min(1, 'Bill must have at least one line item')
    .max(100, 'Bill cannot have more than 100 line items'),
  notes: z.string()
    .max(2000, 'Notes must not exceed 2000 characters')
    .optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
}).refine(
  (bill) => {
    // Validate due date is after bill date
    return new Date(bill.due_date) >= new Date(bill.date)
  },
  {
    message: 'Due date must be on or after bill date',
    path: ['due_date']
  }
)

export const CreateBillSchema = BillSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
})

export const UpdateBillSchema = BillSchema.partial().omit({
  id: true,
  created_at: true,
  updated_at: true
})

// Vendor validation schemas
export const VendorSchema = z.object({
  id: z.string().optional(),
  name: z.string()
    .min(1, 'Vendor name is required')
    .max(255, 'Vendor name must not exceed 255 characters')
    .trim(),
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email must not exceed 255 characters')
    .toLowerCase()
    .optional(),
  phone: z.string()
    .max(20, 'Phone number must not exceed 20 characters')
    .regex(/^[\+]?[0-9\(\)\-\s\.]+$/, 'Invalid phone number format')
    .optional(),
  address: z.object({
    street: z.string().max(255, 'Street address too long').optional(),
    city: z.string().max(100, 'City name too long').optional(),
    state: z.string().max(50, 'State name too long').optional(),
    zip: z.string().max(20, 'ZIP code too long').optional(),
    country: z.string().max(100, 'Country name too long').optional()
  }).optional(),
  payment_terms: z.number()
    .int('Payment terms must be a whole number')
    .min(0, 'Payment terms cannot be negative')
    .max(365, 'Payment terms cannot exceed 365 days')
    .default(30),
  tax_id: z.string()
    .max(50, 'Tax ID must not exceed 50 characters')
    .optional(),
  notes: z.string()
    .max(2000, 'Notes must not exceed 2000 characters')
    .optional(),
  is_active: z.boolean().default(true),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
})

export const CreateVendorSchema = VendorSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
})

export const UpdateVendorSchema = VendorSchema.partial().omit({
  id: true,
  created_at: true,
  updated_at: true
})

// Common validation utilities
export const validateAccountCode = (code: string, existingCodes: string[] = []): z.ZodIssue[] => {
  const issues: z.ZodIssue[] = []
  
  if (existingCodes.includes(code)) {
    issues.push({
      code: 'custom',
      path: ['code'],
      message: 'Account code already exists'
    })
  }
  
  return issues
}

export const validateInvoiceNumber = (invoiceNumber: string, existingNumbers: string[] = []): z.ZodIssue[] => {
  const issues: z.ZodIssue[] = []
  
  if (existingNumbers.includes(invoiceNumber)) {
    issues.push({
      code: 'custom',
      path: ['invoice_number'],
      message: 'Invoice number already exists'
    })
  }
  
  return issues
}

export const validateTransactionBalance = (entries: unknown[]): z.ZodIssue[] => {
  const issues: z.ZodIssue[] = []
  
  const totalDebits = entries.reduce((sum, entry) => sum + (entry.debit_amount || 0), 0)
  const totalCredits = entries.reduce((sum, entry) => sum + (entry.credit_amount || 0), 0)
  
  if (Math.abs(totalDebits - totalCredits) > 0.01) {
    issues.push({
      code: 'custom',
      path: ['entries'],
      message: 'Transaction is out of balance. Debits: $${totalDebits.toFixed(2)}, Credits: $${totalCredits.toFixed(2)}'
    })
  }
  
  return issues
}