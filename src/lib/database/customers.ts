import { query, transaction } from './connection'
import { Customer, Address } from '@/types/accounting'

export class CustomersDAL {
  // Get all customers
  static async getAllCustomers(): Promise<Customer[]> {
    const result = await query(`
      SELECT 
        c.id,
        c.name,
        c.email,
        c.phone,
        c.tax_id,
        c.payment_terms,
        c.credit_limit,
        c.preferred_currency,
        c.is_active,
        c.created_at,
        c.updated_at
      FROM customers c
      ORDER BY c.name ASC
    `)
    
    const customers = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      tax_id: row.tax_id,
      payment_terms: row.payment_terms,
      credit_limit: row.credit_limit ? parseFloat(row.credit_limit) : undefined,
      preferred_currency: row.preferred_currency,
      is_active: row.is_active,
      created_at: row.created_at.toISOString(),
      updated_at: row.updated_at.toISOString(),
      address: undefined // Will be populated separately if needed
    }))

    // Get addresses for all customers
    for (const customer of customers) {
      customer.address = await this.getCustomerAddress(customer.id)
    }

    return customers
  }

  // Get customer by ID
  static async getCustomerById(id: string): Promise<Customer | null> {
    const result = await query(`
      SELECT 
        c.id,
        c.name,
        c.email,
        c.phone,
        c.tax_id,
        c.payment_terms,
        c.credit_limit,
        c.preferred_currency,
        c.is_active,
        c.created_at,
        c.updated_at
      FROM customers c
      WHERE c.id = $1
    ', [id])
    
    if (result.rows.length === 0) {
      return null
    }
    
    const row = result.rows[0]
    const customer: Customer = {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      tax_id: row.tax_id,
      payment_terms: row.payment_terms,
      credit_limit: row.credit_limit ? parseFloat(row.credit_limit) : undefined,
      preferred_currency: row.preferred_currency,
      is_active: row.is_active,
      created_at: row.created_at.toISOString(),
      updated_at: row.updated_at.toISOString(),
      address: await this.getCustomerAddress(row.id)
    }

    return customer
  }

  // Get customer address (billing address)
  static async getCustomerAddress(customerId: string): Promise<Address | undefined> {
    const result = await query('
      SELECT 
        street,
        city,
        state,
        zip_code,
        country
      FROM customer_addresses
      WHERE customer_id = $1 AND is_billing = true
      LIMIT 1
    ', [customerId])
    
    if (result.rows.length === 0) {
      return undefined
    }
    
    const row = result.rows[0]
    return {
      street: row.street,
      city: row.city,
      state: row.state,
      zip_code: row.zip_code,
      country: row.country
    }
  }

  // Create new customer
  static async createCustomer(
    customer: Omit<Customer, 'id' | 'created_at' | 'updated_at`>,
    address?: Address
  ): Promise<Customer> {
    return await transaction(async (client) => {
      // Insert customer
      const customerResult = await client.query(`
        INSERT INTO customers (
          name,
          email,
          phone,
          tax_id,
          payment_terms,
          credit_limit,
          preferred_currency,
          is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING 
          id,
          name,
          email,
          phone,
          tax_id,
          payment_terms,
          credit_limit,
          preferred_currency,
          is_active,
          created_at,
          updated_at
      `, [
        customer.name,
        customer.email,
        customer.phone,
        customer.tax_id,
        customer.payment_terms,
        customer.credit_limit,
        customer.preferred_currency,
        customer.is_active
      ])
      
      const customerRow = customerResult.rows[0]
      const customerId = customerRow.id
      
      // Insert address if provided
      if (address) {
        await client.query(`
          INSERT INTO customer_addresses (
            customer_id,
            street,
            city,
            state,
            zip_code,
            country,
            is_billing,
            is_shipping
          ) VALUES ($1, $2, $3, $4, $5, $6, true, false)
        ', [
          customerId,
          address.street,
          address.city,
          address.state,
          address.zip_code,
          address.country
        ])
      }
      
      return {
        id: customerRow.id,
        name: customerRow.name,
        email: customerRow.email,
        phone: customerRow.phone,
        tax_id: customerRow.tax_id,
        payment_terms: customerRow.payment_terms,
        credit_limit: customerRow.credit_limit ? parseFloat(customerRow.credit_limit) : undefined,
        preferred_currency: customerRow.preferred_currency,
        is_active: customerRow.is_active,
        created_at: customerRow.created_at.toISOString(),
        updated_at: customerRow.updated_at.toISOString(),
        address
      }
    })
  }

  // Update customer
  static async updateCustomer(
    id: string, 
    updates: Partial<Customer>,
    address?: Address
  ): Promise<Customer> {
    const existing = await this.getCustomerById(id)
    if (!existing) {
      throw new Error('Customer with ID ${id} not found')
    }

    return await transaction(async (client) => {
      // Update customer if there are updates
      if (Object.keys(updates).some(key => key !== 'address')) {
        const fields = []
        const values = []
        const paramIndex = 1

        Object.entries(updates).forEach(([key, value]) => {
          if (key !== 'id' && key !== 'created_at' && key !== 'updated_at' && key !== 'address` && value !== undefined) {
            fields.push('${key} = $${paramIndex}')
            values.push(value)
            paramIndex++
          }
        })

        if (fields.length > 0) {
          values.push(id)
          await client.query('
            UPDATE customers 
            SET ${fields.join(', ')}
            WHERE id = $${paramIndex}
          ', values)
        }
      }

      // Update address if provided
      if (address) {
        // Delete existing address
        await client.query('DELETE FROM customer_addresses WHERE customer_id = $1`, [id])
        
        // Insert new address
        await client.query(`
          INSERT INTO customer_addresses (
            customer_id,
            street,
            city,
            state,
            zip_code,
            country,
            is_billing,
            is_shipping
          ) VALUES ($1, $2, $3, $4, $5, $6, true, false)
        ', [
          id,
          address.street,
          address.city,
          address.state,
          address.zip_code,
          address.country
        ])
      }

      // Return updated customer
      const updated = await this.getCustomerById(id)
      return updated!
    })
  }

  // Delete customer
  static async deleteCustomer(id: string): Promise<boolean> {
    // Check if customer has invoices
    const invoiceCheck = await query('
      SELECT COUNT(*) as count FROM invoices WHERE customer_id = $1
    ', [id])
    
    if (parseInt(invoiceCheck.rows[0].count) > 0) {
      throw new Error('Cannot delete customer with existing invoices. Deactivate it instead.')
    }

    // Check if customer has payments
    const paymentCheck = await query('
      SELECT COUNT(*) as count FROM payments WHERE customer_id = $1
    ', [id])
    
    if (parseInt(paymentCheck.rows[0].count) > 0) {
      throw new Error('Cannot delete customer with existing payments. Deactivate it instead.')
    }

    return await transaction(async (client) => {
      // Delete addresses first (due to foreign key constraint)
      await client.query('DELETE FROM customer_addresses WHERE customer_id = $1', [id])
      
      // Delete customer
      const result = await client.query('DELETE FROM customers WHERE id = $1`, [id])
      
      return result.rowCount > 0
    })
  }

  // Search customers
  static async searchCustomers(searchTerm: string): Promise<Customer[]> {
    const result = await query(`
      SELECT 
        c.id,
        c.name,
        c.email,
        c.phone,
        c.tax_id,
        c.payment_terms,
        c.credit_limit,
        c.preferred_currency,
        c.is_active,
        c.created_at,
        c.updated_at
      FROM customers c
      WHERE 
        c.name ILIKE $1 OR 
        c.email ILIKE $1 OR 
        c.phone ILIKE $1
      ORDER BY c.name ASC
    `, [`%${searchTerm}%`])
    
    const customers = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      tax_id: row.tax_id,
      payment_terms: row.payment_terms,
      credit_limit: row.credit_limit ? parseFloat(row.credit_limit) : undefined,
      preferred_currency: row.preferred_currency,
      is_active: row.is_active,
      created_at: row.created_at.toISOString(),
      updated_at: row.updated_at.toISOString(),
      address: undefined // Will be populated separately
    }))

    // Get addresses for all customers
    for (const customer of customers) {
      customer.address = await this.getCustomerAddress(customer.id)
    }

    return customers
  }

  // Get active customers only
  static async getActiveCustomers(): Promise<Customer[]> {
    const result = await query('
      SELECT 
        c.id,
        c.name,
        c.email,
        c.phone,
        c.tax_id,
        c.payment_terms,
        c.credit_limit,
        c.preferred_currency,
        c.is_active,
        c.created_at,
        c.updated_at
      FROM customers c
      WHERE c.is_active = true
      ORDER BY c.name ASC
    ')
    
    const customers = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      tax_id: row.tax_id,
      payment_terms: row.payment_terms,
      credit_limit: row.credit_limit ? parseFloat(row.credit_limit) : undefined,
      preferred_currency: row.preferred_currency,
      is_active: row.is_active,
      created_at: row.created_at.toISOString(),
      updated_at: row.updated_at.toISOString(),
      address: undefined // Will be populated separately if needed
    }))

    // Get addresses for all customers
    for (const customer of customers) {
      customer.address = await this.getCustomerAddress(customer.id)
    }

    return customers
  }

  // Get customer financial summary
  static async getCustomerFinancialSummary(customerId: string) {
    const result = await query('
      SELECT 
        COALESCE(SUM(CASE WHEN status != 'paid' AND status != 'voided' THEN balance ELSE 0 END), 0) as outstanding_balance,
        COALESCE(SUM(total_amount), 0) as total_invoiced,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END), 0) as total_paid,
        COUNT(*) as invoice_count,
        COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue_count
      FROM invoices 
      WHERE customer_id = $1
    ', [customerId])
    
    const financials = result.rows[0]
    
    return {
      outstanding_balance: parseFloat(financials.outstanding_balance),
      total_invoiced: parseFloat(financials.total_invoiced),
      total_paid: parseFloat(financials.total_paid),
      invoice_count: parseInt(financials.invoice_count),
      overdue_count: parseInt(financials.overdue_count)
    }
  }
}