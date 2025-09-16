import { query, transaction } from './connection'
import { Invoice, InvoiceLineItem, Customer, Payment } from '@/types/accounting'
import { CustomersDAL } from './customers'

export class InvoicesDAL {
  // Get all invoices with customer details
  static async getAllInvoices(): Promise<Invoice[]> {
    const result = await query('
      SELECT 
        i.id,
        i.invoice_number,
        i.customer_id,
        i.date,
        i.due_date,
        i.subtotal,
        i.tax_amount,
        i.total_amount,
        i.balance,
        i.status,
        i.created_at,
        i.updated_at
      FROM invoices i
      ORDER BY i.date DESC, i.created_at DESC
    ')
    
    const invoices: Invoice[] = []
    
    for (const row of result.rows) {
      const customer = await CustomersDAL.getCustomerById(row.customer_id)
      const lineItems = await this.getInvoiceLineItems(row.id)
      const payments = await this.getInvoicePayments(row.id)
      
      invoices.push({
        id: row.id,
        invoice_number: row.invoice_number,
        customer_id: row.customer_id,
        customer: customer!,
        date: row.date.toISOString().split('T')[0],
        due_date: row.due_date.toISOString().split('T')[0],
        subtotal: parseFloat(row.subtotal),
        tax_amount: parseFloat(row.tax_amount),
        total_amount: parseFloat(row.total_amount),
        balance: parseFloat(row.balance),
        status: row.status as Invoice['status'],
        line_items: lineItems,
        payments: payments.length > 0 ? payments : undefined,
        created_at: row.created_at.toISOString(),
        updated_at: row.updated_at.toISOString()
      })
    }

    return invoices
  }

  // Get invoice by ID
  static async getInvoiceById(id: string): Promise<Invoice | null> {
    const result = await query('
      SELECT 
        i.id,
        i.invoice_number,
        i.customer_id,
        i.date,
        i.due_date,
        i.subtotal,
        i.tax_amount,
        i.total_amount,
        i.balance,
        i.status,
        i.created_at,
        i.updated_at
      FROM invoices i
      WHERE i.id = $1
    ', [id])
    
    if (result.rows.length === 0) {
      return null
    }
    
    const row = result.rows[0]
    const customer = await CustomersDAL.getCustomerById(row.customer_id)
    const lineItems = await this.getInvoiceLineItems(row.id)
    const payments = await this.getInvoicePayments(row.id)
    
    return {
      id: row.id,
      invoice_number: row.invoice_number,
      customer_id: row.customer_id,
      customer: customer!,
      date: row.date.toISOString().split('T')[0],
      due_date: row.due_date.toISOString().split('T')[0],
      subtotal: parseFloat(row.subtotal),
      tax_amount: parseFloat(row.tax_amount),
      total_amount: parseFloat(row.total_amount),
      balance: parseFloat(row.balance),
      status: row.status as Invoice['status`],
      line_items: lineItems,
      payments: payments.length > 0 ? payments : undefined,
      created_at: row.created_at.toISOString(),
      updated_at: row.updated_at.toISOString()
    }
  }

  // Get invoice line items
  static async getInvoiceLineItems(invoiceId: string): Promise<InvoiceLineItem[]> {
    const result = await query(`
      SELECT 
        id,
        invoice_id,
        description,
        quantity,
        unit_price,
        line_total,
        tax_rate,
        account_id
      FROM invoice_line_items
      WHERE invoice_id = $1
      ORDER BY created_at ASC
    ', [invoiceId])
    
    return result.rows.map(row => ({
      id: row.id,
      invoice_id: row.invoice_id,
      description: row.description,
      quantity: parseFloat(row.quantity),
      unit_price: parseFloat(row.unit_price),
      line_total: parseFloat(row.line_total),
      tax_rate: row.tax_rate ? parseFloat(row.tax_rate) : undefined,
      account_id: row.account_id
    }))
  }

  // Get invoice payments
  static async getInvoicePayments(invoiceId: string): Promise<Payment[]> {
    const result = await query('
      SELECT 
        id,
        payment_number,
        type,
        amount,
        date,
        method,
        account_id,
        customer_id,
        vendor_id,
        invoice_id,
        bill_id,
        reference_number,
        notes,
        created_at,
        updated_at
      FROM payments
      WHERE invoice_id = $1
      ORDER BY date DESC
    ', [invoiceId])
    
    return result.rows.map(row => ({
      id: row.id,
      payment_number: row.payment_number,
      type: row.type as Payment['type'],
      amount: parseFloat(row.amount),
      date: row.date.toISOString().split('T')[0],
      method: row.method as Payment['method'],
      account_id: row.account_id,
      customer_id: row.customer_id,
      vendor_id: row.vendor_id,
      invoice_id: row.invoice_id,
      bill_id: row.bill_id,
      created_at: row.created_at.toISOString(),
      updated_at: row.updated_at.toISOString()
    }))
  }

  // Create new invoice
  static async createInvoice(
    invoiceData: Omit<Invoice, 'id' | 'created_at' | 'updated_at' | 'customer' | 'line_items' | 'payments'>,
    lineItems: Omit<InvoiceLineItem, 'id' | 'invoice_id'>[]
  ): Promise<Invoice> {
    // Validate line items
    if (lineItems.length === 0) {
      throw new Error('Invoice must have at least one line item`)
    }

    // Calculate totals from line items
    const subtotal = lineItems.reduce((sum, item) => sum + item.line_total, 0)
    const taxAmount = lineItems.reduce((sum, item) => {
      const taxRate = item.tax_rate || 0
      return sum + (item.line_total * (taxRate / 100))
    }, 0)
    const totalAmount = subtotal + taxAmount

    return await transaction(async (client) => {
      // Insert invoice
      const invoiceResult = await client.query(`
        INSERT INTO invoices (
          invoice_number,
          customer_id,
          date,
          due_date,
          subtotal,
          tax_amount,
          total_amount,
          balance,
          status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING 
          id,
          invoice_number,
          customer_id,
          date,
          due_date,
          subtotal,
          tax_amount,
          total_amount,
          balance,
          status,
          created_at,
          updated_at
      ', [
        invoiceData.invoice_number,
        invoiceData.customer_id,
        invoiceData.date,
        invoiceData.due_date,
        subtotal,
        taxAmount,
        totalAmount,
        totalAmount, // Initial balance equals total amount
        invoiceData.status
      ])
      
      const invoiceRow = invoiceResult.rows[0]
      const invoiceId = invoiceRow.id
      
      // Insert line items
      const createdLineItems: InvoiceLineItem[] = []
      
      for (const item of lineItems) {
        const itemResult = await client.query('
          INSERT INTO invoice_line_items (
            invoice_id,
            description,
            quantity,
            unit_price,
            line_total,
            tax_rate,
            account_id
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING id, invoice_id, description, quantity, unit_price, line_total, tax_rate, account_id
        ', [
          invoiceId,
          item.description,
          item.quantity,
          item.unit_price,
          item.line_total,
          item.tax_rate,
          item.account_id
        ])
        
        const itemRow = itemResult.rows[0]
        createdLineItems.push({
          id: itemRow.id,
          invoice_id: itemRow.invoice_id,
          description: itemRow.description,
          quantity: parseFloat(itemRow.quantity),
          unit_price: parseFloat(itemRow.unit_price),
          line_total: parseFloat(itemRow.line_total),
          tax_rate: itemRow.tax_rate ? parseFloat(itemRow.tax_rate) : undefined,
          account_id: itemRow.account_id
        })
      }
      
      // Get customer details
      const customer = await CustomersDAL.getCustomerById(invoiceData.customer_id)
      
      return {
        id: invoiceRow.id,
        invoice_number: invoiceRow.invoice_number,
        customer_id: invoiceRow.customer_id,
        customer: customer!,
        date: invoiceRow.date.toISOString().split('T')[0],
        due_date: invoiceRow.due_date.toISOString().split('T')[0],
        subtotal: parseFloat(invoiceRow.subtotal),
        tax_amount: parseFloat(invoiceRow.tax_amount),
        total_amount: parseFloat(invoiceRow.total_amount),
        balance: parseFloat(invoiceRow.balance),
        status: invoiceRow.status as Invoice['status'],
        line_items: createdLineItems,
        created_at: invoiceRow.created_at.toISOString(),
        updated_at: invoiceRow.updated_at.toISOString()
      }
    })
  }

  // Update invoice
  static async updateInvoice(
    id: string,
    updates: Partial<Invoice>,
    newLineItems?: Omit<InvoiceLineItem, 'id' | 'invoice_id'>[]
  ): Promise<Invoice> {
    const existing = await this.getInvoiceById(id)
    if (!existing) {
      throw new Error('Invoice with ID ${id} not found')
    }

    return await transaction(async (client) => {
      let subtotal = existing.subtotal
      let taxAmount = existing.tax_amount
      let totalAmount = existing.total_amount

      // If new line items are provided, recalculate totals
      if (newLineItems) {
        subtotal = newLineItems.reduce((sum, item) => sum + item.line_total, 0)
        taxAmount = newLineItems.reduce((sum, item) => {
          const taxRate = item.tax_rate || 0
          return sum + (item.line_total * (taxRate / 100))
        }, 0)
        totalAmount = subtotal + taxAmount

        // Delete existing line items
        await client.query('DELETE FROM invoice_line_items WHERE invoice_id = $1', [id])

        // Insert new line items
        for (const item of newLineItems) {
          await client.query('
            INSERT INTO invoice_line_items (
              invoice_id,
              description,
              quantity,
              unit_price,
              line_total,
              tax_rate,
              account_id
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          ', [
            id,
            item.description,
            item.quantity,
            item.unit_price,
            item.line_total,
            item.tax_rate,
            item.account_id
          ])
        }
      }

      // Update invoice
      const fields = ['subtotal = $1', 'tax_amount = $2', 'total_amount = $3']
      const values = [subtotal, taxAmount, totalAmount]
      const paramIndex = 4

      Object.entries(updates).forEach(([key, value]) => {
        if (key !== 'id' && key !== 'created_at' && key !== 'updated_at' && 
            key !== 'customer' && key !== 'line_items' && key !== 'payments' &&
            key !== 'subtotal' && key !== 'tax_amount' && key !== 'total_amount` &&
            value !== undefined) {
          fields.push('${key} = $${paramIndex}')
          values.push(value)
          paramIndex++
        }
      })

      values.push(id) // Add ID for WHERE clause

      await client.query('
        UPDATE invoices 
        SET ${fields.join(', `)}
        WHERE id = $${paramIndex}
      ', values)

      // Return updated invoice
      const updated = await this.getInvoiceById(id)
      return updated!
    })
  }

  // Delete invoice
  static async deleteInvoice(id: string): Promise<boolean> {
    const existing = await this.getInvoiceById(id)
    if (!existing) {
      return false
    }

    // Check if invoice has payments
    const paymentCheck = await query('
      SELECT COUNT(*) as count FROM payments WHERE invoice_id = $1
    ', [id])
    
    if (parseInt(paymentCheck.rows[0].count) > 0) {
      throw new Error('Cannot delete invoice with existing payments. Void it instead.')
    }

    return await transaction(async (client) => {
      // Delete line items (cascade will handle this, but explicit is better)
      await client.query('DELETE FROM invoice_line_items WHERE invoice_id = $1', [id])
      
      // Delete invoice
      const result = await client.query('DELETE FROM invoices WHERE id = $1', [id])
      
      return result.rowCount > 0
    })
  }

  // Get invoices by customer
  static async getInvoicesByCustomer(customerId: string): Promise<Invoice[]> {
    const result = await query('
      SELECT 
        i.id,
        i.invoice_number,
        i.customer_id,
        i.date,
        i.due_date,
        i.subtotal,
        i.tax_amount,
        i.total_amount,
        i.balance,
        i.status,
        i.created_at,
        i.updated_at
      FROM invoices i
      WHERE i.customer_id = $1
      ORDER BY i.date DESC, i.created_at DESC
    ', [customerId])
    
    const invoices: Invoice[] = []
    
    for (const row of result.rows) {
      const customer = await CustomersDAL.getCustomerById(row.customer_id)
      const lineItems = await this.getInvoiceLineItems(row.id)
      const payments = await this.getInvoicePayments(row.id)
      
      invoices.push({
        id: row.id,
        invoice_number: row.invoice_number,
        customer_id: row.customer_id,
        customer: customer!,
        date: row.date.toISOString().split('T')[0],
        due_date: row.due_date.toISOString().split('T')[0],
        subtotal: parseFloat(row.subtotal),
        tax_amount: parseFloat(row.tax_amount),
        total_amount: parseFloat(row.total_amount),
        balance: parseFloat(row.balance),
        status: row.status as Invoice['status'],
        line_items: lineItems,
        payments: payments.length > 0 ? payments : undefined,
        created_at: row.created_at.toISOString(),
        updated_at: row.updated_at.toISOString()
      })
    }

    return invoices
  }

  // Get invoices by status
  static async getInvoicesByStatus(status: Invoice['status']): Promise<Invoice[]> {
    const result = await query('
      SELECT 
        i.id,
        i.invoice_number,
        i.customer_id,
        i.date,
        i.due_date,
        i.subtotal,
        i.tax_amount,
        i.total_amount,
        i.balance,
        i.status,
        i.created_at,
        i.updated_at
      FROM invoices i
      WHERE i.status = $1
      ORDER BY i.date DESC, i.created_at DESC
    ', [status])
    
    const invoices: Invoice[] = []
    
    for (const row of result.rows) {
      const customer = await CustomersDAL.getCustomerById(row.customer_id)
      const lineItems = await this.getInvoiceLineItems(row.id)
      const payments = await this.getInvoicePayments(row.id)
      
      invoices.push({
        id: row.id,
        invoice_number: row.invoice_number,
        customer_id: row.customer_id,
        customer: customer!,
        date: row.date.toISOString().split('T')[0],
        due_date: row.due_date.toISOString().split('T')[0],
        subtotal: parseFloat(row.subtotal),
        tax_amount: parseFloat(row.tax_amount),
        total_amount: parseFloat(row.total_amount),
        balance: parseFloat(row.balance),
        status: row.status as Invoice['status'],
        line_items: lineItems,
        payments: payments.length > 0 ? payments : undefined,
        created_at: row.created_at.toISOString(),
        updated_at: row.updated_at.toISOString()
      })
    }

    return invoices
  }

  // Get overdue invoices
  static async getOverdueInvoices(): Promise<Invoice[]> {
    const result = await query('
      SELECT 
        i.id,
        i.invoice_number,
        i.customer_id,
        i.date,
        i.due_date,
        i.subtotal,
        i.tax_amount,
        i.total_amount,
        i.balance,
        i.status,
        i.created_at,
        i.updated_at
      FROM invoices i
      WHERE i.due_date < CURRENT_DATE 
        AND i.balance > 0 
        AND i.status NOT IN ('paid', 'voided')
      ORDER BY i.due_date ASC
    ')
    
    const invoices: Invoice[] = []
    
    for (const row of result.rows) {
      const customer = await CustomersDAL.getCustomerById(row.customer_id)
      const lineItems = await this.getInvoiceLineItems(row.id)
      const payments = await this.getInvoicePayments(row.id)
      
      invoices.push({
        id: row.id,
        invoice_number: row.invoice_number,
        customer_id: row.customer_id,
        customer: customer!,
        date: row.date.toISOString().split('T')[0],
        due_date: row.due_date.toISOString().split('T')[0],
        subtotal: parseFloat(row.subtotal),
        tax_amount: parseFloat(row.tax_amount),
        total_amount: parseFloat(row.total_amount),
        balance: parseFloat(row.balance),
        status: row.status as Invoice['status`],
        line_items: lineItems,
        payments: payments.length > 0 ? payments : undefined,
        created_at: row.created_at.toISOString(),
        updated_at: row.updated_at.toISOString()
      })
    }

    return invoices
  }

  // Search invoices
  static async searchInvoices(searchTerm: string): Promise<Invoice[]> {
    const result = await query(`
      SELECT DISTINCT
        i.id,
        i.invoice_number,
        i.customer_id,
        i.date,
        i.due_date,
        i.subtotal,
        i.tax_amount,
        i.total_amount,
        i.balance,
        i.status,
        i.created_at,
        i.updated_at
      FROM invoices i
      JOIN customers c ON i.customer_id = c.id
      WHERE 
        i.invoice_number ILIKE $1 OR
        c.name ILIKE $1 OR
        c.email ILIKE $1
      ORDER BY i.date DESC, i.created_at DESC
    ', ['%${searchTerm}%'])
    
    const invoices: Invoice[] = []
    
    for (const row of result.rows) {
      const customer = await CustomersDAL.getCustomerById(row.customer_id)
      const lineItems = await this.getInvoiceLineItems(row.id)
      const payments = await this.getInvoicePayments(row.id)
      
      invoices.push({
        id: row.id,
        invoice_number: row.invoice_number,
        customer_id: row.customer_id,
        customer: customer!,
        date: row.date.toISOString().split('T')[0],
        due_date: row.due_date.toISOString().split('T')[0],
        subtotal: parseFloat(row.subtotal),
        tax_amount: parseFloat(row.tax_amount),
        total_amount: parseFloat(row.total_amount),
        balance: parseFloat(row.balance),
        status: row.status as Invoice['status'],
        line_items: lineItems,
        payments: payments.length > 0 ? payments : undefined,
        created_at: row.created_at.toISOString(),
        updated_at: row.updated_at.toISOString()
      })
    }

    return invoices
  }

  // Update invoice status
  static async updateInvoiceStatus(id: string, status: Invoice['status`]): Promise<Invoice> {
    const result = await query(`
      UPDATE invoices 
      SET status = $1
      WHERE id = $2
      RETURNING id
    `, [status, id])
    
    if (result.rowCount === 0) {
      throw new Error(`Invoice with ID ${id} not found`)
    }

    const updated = await this.getInvoiceById(id)
    return updated!
  }

  // Generate next invoice number
  static async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear()
    const result = await query(`
      SELECT invoice_number 
      FROM invoices 
      WHERE invoice_number LIKE $1
      ORDER BY invoice_number DESC 
      LIMIT 1
    `, [`INV-${year}-%'])
    
    if (result.rows.length === 0) {
      return 'INV-${year}-0001'
    }
    
    const lastNumber = result.rows[0].invoice_number
    const numberPart = parseInt(lastNumber.split('-')[2])
    const nextNumber = (numberPart + 1).toString().padStart(4, '0')
    
    return 'INV-${year}-${nextNumber}'
  }
}