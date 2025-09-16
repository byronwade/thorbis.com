import { InvoicesDAL } from '../database/invoices'
import { CustomersDAL } from '../database/customers'
import { Invoice, InvoiceLineItem, Customer } from '@/types/accounting'

export class InvoicesService {
  // Get all invoices
  static async getInvoices(): Promise<Invoice[]> {
    try {
      return await InvoicesDAL.getAllInvoices()
    } catch (error) {
      console.error('Error fetching invoices:', error)
      throw new Error('Failed to fetch invoices')
    }
  }

  // Get invoice by ID
  static async getInvoice(id: string): Promise<Invoice | null> {
    try {
      return await InvoicesDAL.getInvoiceById(id)
    } catch (error) {
      console.error('Error fetching invoice:', error)
      throw new Error('Failed to fetch invoice')
    }
  }

  // Get invoices by customer
  static async getInvoicesByCustomer(customerId: string): Promise<Invoice[]> {
    try {
      return await InvoicesDAL.getInvoicesByCustomer(customerId)
    } catch (error) {
      console.error('Error fetching invoices by customer:', error)
      throw new Error('Failed to fetch invoices by customer')
    }
  }

  // Get invoices by status
  static async getInvoicesByStatus(status: Invoice['status']): Promise<Invoice[]> {
    try {
      return await InvoicesDAL.getInvoicesByStatus(status)
    } catch (error) {
      console.error('Error fetching invoices by status:', error)
      throw new Error('Failed to fetch invoices by status')
    }
  }

  // Get overdue invoices
  static async getOverdueInvoices(): Promise<Invoice[]> {
    try {
      return await InvoicesDAL.getOverdueInvoices()
    } catch (error) {
      console.error('Error fetching overdue invoices:', error)
      throw new Error('Failed to fetch overdue invoices')
    }
  }

  // Create new invoice
  static async createInvoice(
    invoiceData: Omit<Invoice, 'id' | 'created_at' | 'updated_at' | 'customer' | 'line_items' | 'payments'>,
    lineItems: Omit<InvoiceLineItem, 'id' | 'invoice_id'>[]
  ): Promise<Invoice> {
    try {
      // Validate required fields
      if (!invoiceData.invoice_number || !invoiceData.customer_id) {
        throw new Error('Invoice number and customer are required')
      }

      // Validate line items
      if (!lineItems || lineItems.length === 0) {
        throw new Error('At least one line item is required')
      }

      // Validate customer exists
      const customer = await CustomersDAL.getCustomerById(invoiceData.customer_id)
      if (!customer) {
        throw new Error('Customer not found')
      }

      // Validate line items
      for (const item of lineItems) {
        if (!item.description || item.quantity <= 0 || item.unit_price < 0) {
          throw new Error('Invalid line item: description required, quantity must be positive, unit price cannot be negative')
        }
      }

      // Generate invoice number if not provided
      if (!invoiceData.invoice_number) {
        invoiceData.invoice_number = await InvoicesDAL.generateInvoiceNumber()
      }

      return await InvoicesDAL.createInvoice(invoiceData, lineItems)
    } catch (error) {
      console.error('Error creating invoice:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to create invoice')
    }
  }

  // Update invoice
  static async updateInvoice(
    id: string,
    updates: Partial<Invoice>,
    newLineItems?: Omit<InvoiceLineItem, 'id' | 'invoice_id'>[]
  ): Promise<Invoice> {
    try {
      // Validate customer exists if being updated
      if (updates.customer_id) {
        const customer = await CustomersDAL.getCustomerById(updates.customer_id)
        if (!customer) {
          throw new Error('Customer not found')
        }
      }

      // Validate line items if provided
      if (newLineItems) {
        if (newLineItems.length === 0) {
          throw new Error('At least one line item is required')
        }

        for (const item of newLineItems) {
          if (!item.description || item.quantity <= 0 || item.unit_price < 0) {
            throw new Error('Invalid line item: description required, quantity must be positive, unit price cannot be negative')
          }
        }
      }

      return await InvoicesDAL.updateInvoice(id, updates, newLineItems)
    } catch (error) {
      console.error('Error updating invoice:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to update invoice')
    }
  }

  // Delete invoice
  static async deleteInvoice(id: string): Promise<void> {
    try {
      const deleted = await InvoicesDAL.deleteInvoice(id)
      if (!deleted) {
        throw new Error('Invoice not found')
      }
    } catch (error) {
      console.error('Error deleting invoice:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to delete invoice')
    }
  }

  // Search invoices
  static async searchInvoices(searchTerm: string): Promise<Invoice[]> {
    try {
      return await InvoicesDAL.searchInvoices(searchTerm)
    } catch (error) {
      console.error('Error searching invoices:', error)
      throw new Error('Failed to search invoices')
    }
  }

  // Update invoice status
  static async updateInvoiceStatus(id: string, status: Invoice['status']): Promise<Invoice> {
    try {
      return await InvoicesDAL.updateInvoiceStatus(id, status)
    } catch (error) {
      console.error('Error updating invoice status:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to update invoice status')
    }
  }

  // Generate next invoice number
  static async generateInvoiceNumber(): Promise<string> {
    try {
      return await InvoicesDAL.generateInvoiceNumber()
    } catch (error) {
      console.error('Error generating invoice number:', error)
      throw new Error('Failed to generate invoice number')
    }
  }

  // Get invoice summary statistics
  static async getInvoiceSummary(): Promise<{
    totalOutstanding: number
    overdueAmount: number
    paidThisMonth: number
    draftCount: number
  }> {
    try {
      const invoices = await InvoicesDAL.getAllInvoices()
      
      const totalOutstanding = invoices
        .filter(inv => inv.status !== 'paid' && inv.status !== 'voided')
        .reduce((sum, inv) => sum + inv.balance, 0)

      const overdueAmount = invoices
        .filter(inv => inv.status === 'overdue')
        .reduce((sum, inv) => sum + inv.balance, 0)

      const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format
      const paidThisMonth = invoices
        .filter(inv => inv.status === 'paid' && inv.date.startsWith(currentMonth))
        .reduce((sum, inv) => sum + inv.total_amount, 0)

      const draftCount = invoices.filter(inv => inv.status === 'draft').length

      return {
        totalOutstanding,
        overdueAmount,
        paidThisMonth,
        draftCount
      }
    } catch (error) {
      console.error('Error fetching invoice summary:', error)
      throw new Error('Failed to fetch invoice summary')
    }
  }

  // Get active customers for invoice creation
  static async getActiveCustomers(): Promise<Customer[]> {
    try {
      return await CustomersDAL.getActiveCustomers()
    } catch (error) {
      console.error('Error fetching customers:', error)
      throw new Error('Failed to fetch customers')
    }
  }

  // Validate invoice number uniqueness
  static async isInvoiceNumberUnique(invoiceNumber: string, excludeId?: string): Promise<boolean> {
    try {
      const invoices = await InvoicesDAL.getAllInvoices()
      const existing = invoices.find(inv => inv.invoice_number === invoiceNumber)
      if (!existing) return true
      if (excludeId && existing.id === excludeId) return true
      return false
    } catch (error) {
      console.error('Error checking invoice number uniqueness:', error)
      return false
    }
  }

  // Calculate invoice totals
  static calculateInvoiceTotals(lineItems: InvoiceLineItem[]): {
    subtotal: number
    taxAmount: number
    totalAmount: number
  } {
    const subtotal = lineItems.reduce((sum, item) => sum + item.line_total, 0)
    const taxAmount = lineItems.reduce((sum, item) => {
      const taxRate = item.tax_rate || 0
      return sum + (item.line_total * (taxRate / 100))
    }, 0)
    const totalAmount = subtotal + taxAmount

    return { subtotal, taxAmount, totalAmount }
  }

  // Get days until due for an invoice
  static getDaysUntilDue(dueDate: string): number {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  // Check if invoice is overdue
  static isInvoiceOverdue(invoice: Invoice): boolean {
    if (invoice.status === 'paid' || invoice.status === 'voided') {
      return false
    }
    return this.getDaysUntilDue(invoice.due_date) < 0
  }
}