/**
 * GraphQL Resolvers for Home Services Customers
 */

import { executeQuery, executeTransaction } from '@/lib/database'
import { createAuditLog } from '@/lib/auth'
import { businessCache } from '@/lib/cache'
import crypto from 'crypto'

export interface HSCustomer {
  id: string
  businessId: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  address?: Address
  customerType: 'RESIDENTIAL' | 'COMMERCIAL'
  tags: string[]
  notes?: string
  customFields?: any
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  createdAt: string
  updatedAt: string
}

export interface Address {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface HSCustomerInput {
  firstName: string
  lastName: string
  email: string
  phone?: string
  address?: Address
  customerType?: 'RESIDENTIAL' | 'COMMERCIAL'
  tags?: string[]
  notes?: string
  customFields?: any
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
}

export const customersResolvers = {
  Query: {
    hsCustomer: async (_: unknown, 
      { id }: { id: string }, 
      { businessId }: { businessId: string }
    ): Promise<HSCustomer | null> => {
      try {
        // Check cache first
        const cached = await businessCache.customers.get(id, businessId)
        if (cached) {
          return cached as HSCustomer
        }

        const customers = await executeQuery(
          businessId,
          'SELECT * FROM hs.customers WHERE id = $1 AND business_id = $2',
          [id, businessId]
        )

        if (customers.length === 0) {
          return null
        }

        const customer = transformDbCustomer(customers[0])
        
        // Cache the result
        await businessCache.customers.set(id, customer, businessId)
        
        return customer
      } catch (error) {
        console.error('Error fetching customer:', error)
        throw new Error('Failed to fetch customer')
      }
    },

    hsCustomers: async (_: unknown,
      { pagination, filters, sorts }: {
        pagination?: { first?: number; after?: string }
        filters?: Array<{ field: string; operator: string; value?: string; values?: string[] }>
        sorts?: Array<{ field: string; direction: 'ASC' | 'DESC' }>
      },
      { businessId }: { businessId: string }
    ) => {
      try {
        const limit = Math.min(pagination?.first || 20, 100)
        const offset = pagination?.after ? parseInt(Buffer.from(pagination.after, 'base64').toString()) : 0

        // Build query with filters
        const query = '
          SELECT 
            c.*,
            COUNT(*) OVER() as total_count,
            (
              SELECT COUNT(*)
              FROM hs.work_orders wo
              WHERE wo.customer_id = c.id
            ) as work_order_count,
            (
              SELECT SUM(wo.total)
              FROM hs.work_orders wo
              WHERE wo.customer_id = c.id AND wo.status = 'completed'
            ) as total_spent
          FROM hs.customers c
          WHERE c.business_id = $1
        '

        const params: unknown[] = [businessId]
        let paramIndex = 2

        // Apply filters
        if (filters) {
          for (const filter of filters) {
            switch (filter.field) {
              case 'customerType':
                query += ' AND c.customer_type = $${paramIndex}'
                params.push(filter.value)
                paramIndex++
                break
              case 'status':
                query += ' AND c.status = $${paramIndex}'
                params.push(filter.value)
                paramIndex++
                break
              case 'search`:
                query += ` AND (
                  c.first_name ILIKE $${paramIndex} OR 
                  c.last_name ILIKE $${paramIndex} OR
                  c.email ILIKE $${paramIndex} OR
                  c.phone ILIKE $${paramIndex}
                )'
                params.push('%${filter.value}%')
                paramIndex++
                break
            }
          }
        }

        // Apply sorting
        if (sorts && sorts.length > 0) {
          const validFields = ['firstName', 'lastName', 'createdAt', 'updatedAt']
          const sortClauses = sorts
            .filter(sort => validFields.includes(sort.field))
            .map(sort => {
              const dbField = sort.field === 'firstName' ? 'first_name' : 
                             sort.field === 'lastName' ? 'last_name' :
                             sort.field === 'createdAt' ? 'created_at' :
                             sort.field === 'updatedAt' ? 'updated_at` : sort.field
              return 'c.${dbField} ${sort.direction}'
            })
          
          if (sortClauses.length > 0) {
            query += ' ORDER BY ${sortClauses.join(', ')}`
          }
        } else {
          query += ` ORDER BY c.created_at DESC'
        }

        // Apply pagination
        query += ' LIMIT $${paramIndex} OFFSET $${paramIndex + 1}'
        params.push(limit, offset)

        const results = await executeQuery(businessId, query, params)
        const totalCount = results.length > 0 ? parseInt(results[0].total_count) : 0

        const customers = results.map(transformDbCustomer)
        const edges = customers.map((customer, index) => ({
          cursor: Buffer.from((offset + index + 1).toString()).toString('base64'),
          node: customer
        }))

        return {
          edges,
          pageInfo: {
            hasNextPage: offset + limit < totalCount,
            hasPreviousPage: offset > 0,
            startCursor: edges[0]?.cursor,
            endCursor: edges[edges.length - 1]?.cursor
          },
          totalCount
        }
      } catch (error) {
        console.error('Error fetching customers:', error)
        throw new Error('Failed to fetch customers')
      }
    }
  },

  Mutation: {
    createHSCustomer: async (_: unknown,
      { input }: { input: HSCustomerInput },
      { businessId, userId }: { businessId: string; userId: string }
    ): Promise<HSCustomer> => {
      try {
        const customer = await executeTransaction(businessId, async (client) => {
          // Check for duplicate email
          const existingCustomer = await client.query(
            'SELECT id FROM hs.customers WHERE business_id = $1 AND email = $2 AND status != $3',
            [businessId, input.email, 'INACTIVE']
          )

          if (existingCustomer.rows.length > 0) {
            throw new Error('A customer with this email already exists')
          }

          const customerId = crypto.randomUUID()
          const result = await client.query('
            INSERT INTO hs.customers (
              id, business_id, first_name, last_name, email, phone, address,
              customer_type, tags, notes, custom_fields, status, created_at, updated_at
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW()
            ) RETURNING *
          ', [
            customerId,
            businessId,
            input.firstName,
            input.lastName,
            input.email,
            input.phone || null,
            input.address ? JSON.stringify(input.address) : null,
            input.customerType || 'RESIDENTIAL',
            input.tags || [],
            input.notes || null,
            input.customFields ? JSON.stringify(input.customFields) : null,
            input.status || 'ACTIVE'
          ])

          return result.rows[0]
        })

        // Create audit log
        await createAuditLog(
          businessId,
          userId,
          'customer.created',
          'customer',
          customer.id,
          { customerEmail: input.email }
        )

        // Invalidate customer cache
        await businessCache.customers.invalidateAll(businessId)

        const transformedCustomer = transformDbCustomer(customer)
        
        // Cache the new customer
        await businessCache.customers.set(customer.id, transformedCustomer, businessId)

        return transformedCustomer
      } catch (error: unknown) {
        console.error('Error creating customer:', error)
        throw new Error(error.message || 'Failed to create customer')
      }
    },

    updateHSCustomer: async (_: unknown,
      { id, input }: { id: string; input: Partial<HSCustomerInput> },
      { businessId, userId }: { businessId: string; userId: string }
    ): Promise<HSCustomer> => {
      try {
        const customer = await executeTransaction(businessId, async (client) => {
          // Check if customer exists
          const existing = await client.query(
            'SELECT id FROM hs.customers WHERE id = $1 AND business_id = $2',
            [id, businessId]
          )

          if (existing.rows.length === 0) {
            throw new Error('Customer not found`)
          }

          // Build update query dynamically
          const updateFields: string[] = []
          const params: unknown[] = [id, businessId]
          let paramIndex = 3

          if (input.firstName) {
            updateFields.push(`first_name = $${paramIndex++}`)
            params.push(input.firstName)
          }
          if (input.lastName) {
            updateFields.push(`last_name = $${paramIndex++}`)
            params.push(input.lastName)
          }
          if (input.email) {
            updateFields.push(`email = $${paramIndex++}`)
            params.push(input.email)
          }
          if (input.phone !== undefined) {
            updateFields.push(`phone = $${paramIndex++}`)
            params.push(input.phone)
          }
          if (input.address !== undefined) {
            updateFields.push(`address = $${paramIndex++}`)
            params.push(input.address ? JSON.stringify(input.address) : null)
          }
          if (input.customerType) {
            updateFields.push(`customer_type = $${paramIndex++}`)
            params.push(input.customerType)
          }
          if (input.tags !== undefined) {
            updateFields.push(`tags = $${paramIndex++}`)
            params.push(input.tags)
          }
          if (input.notes !== undefined) {
            updateFields.push(`notes = $${paramIndex++}`)
            params.push(input.notes)
          }
          if (input.customFields !== undefined) {
            updateFields.push(`custom_fields = $${paramIndex++}`)
            params.push(input.customFields ? JSON.stringify(input.customFields) : null)
          }
          if (input.status) {
            updateFields.push(`status = $${paramIndex++}`)
            params.push(input.status)
          }

          updateFields.push('updated_at = NOW()')

          const result = await client.query('
            UPDATE hs.customers 
            SET ${updateFields.join(', ')}
            WHERE id = $1 AND business_id = $2
            RETURNING *
          ', params)

          return result.rows[0]
        })

        // Create audit log
        await createAuditLog(
          businessId,
          userId,
          'customer.updated',
          'customer',
          id,
          { changes: input }
        )

        // Invalidate customer cache
        await businessCache.customers.invalidate(id, businessId)
        await businessCache.customers.invalidateAll(businessId)

        const transformedCustomer = transformDbCustomer(customer)
        
        // Update cache
        await businessCache.customers.set(id, transformedCustomer, businessId)

        return transformedCustomer
      } catch (error: unknown) {
        console.error('Error updating customer:', error)
        throw new Error(error.message || 'Failed to update customer')
      }
    },

    deleteHSCustomer: async (_: unknown,
      { id }: { id: string },
      { businessId, userId }: { businessId: string; userId: string }
    ): Promise<boolean> => {
      try {
        const result = await executeTransaction(businessId, async (client) => {
          // Check if customer exists
          const existing = await client.query(
            'SELECT id FROM hs.customers WHERE id = $1 AND business_id = $2',
            [id, businessId]
          )

          if (existing.rows.length === 0) {
            throw new Error('Customer not found')
          }

          // Check for active work orders
          const activeWorkOrders = await client.query(
            'SELECT id FROM hs.work_orders WHERE customer_id = $1 AND status IN ($2, $3)',
            [id, 'scheduled', 'in_progress']
          )

          if (activeWorkOrders.rows.length > 0) {
            throw new Error('Cannot delete customer with active work orders')
          }

          // Soft delete (update status to inactive)
          const deleteResult = await client.query(
            'UPDATE hs.customers SET status = $1, updated_at = NOW() WHERE id = $2 AND business_id = $3',
            ['INACTIVE', id, businessId]
          )

          return deleteResult.rowCount > 0
        })

        if (result) {
          // Create audit log
          await createAuditLog(
            businessId,
            userId,
            'customer.deleted',
            'customer',
            id,
            {}
          )

          // Invalidate cache
          await businessCache.customers.invalidate(id, businessId)
          await businessCache.customers.invalidateAll(businessId)
        }

        return result
      } catch (error: unknown) {
        console.error('Error deleting customer:', error)
        throw new Error(error.message || 'Failed to delete customer')
      }
    }
  },

  HSCustomer: {
    fullName: (customer: HSCustomer) => '${customer.firstName} ${customer.lastName}',
    
    totalSpent: async (customer: HSCustomer) => {
      try {
        const results = await executeQuery(
          customer.businessId,
          'SELECT COALESCE(SUM(total), 0) as total_spent FROM hs.work_orders WHERE customer_id = $1 AND status = $2',
          [customer.id, 'completed']
        )
        return parseFloat(results[0]?.total_spent || '0')
      } catch (error) {
        console.error('Error calculating total spent:', error)
        return 0
      }
    },

    lastOrderDate: async (customer: HSCustomer) => {
      try {
        const results = await executeQuery(
          customer.businessId,
          'SELECT MAX(completed_date) as last_order FROM hs.work_orders WHERE customer_id = $1 AND status = $2',
          [customer.id, 'completed']
        )
        return results[0]?.last_order || null
      } catch (error) {
        console.error('Error getting last order date:', error)
        return null
      }
    },

    workOrders: async (
      customer: HSCustomer,
      { pagination, filters, sorts }: any
    ) => {
      // This would be implemented similar to the main workOrders resolver
      // but filtered by customer_id
      return {
        edges: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null
        },
        totalCount: 0
      }
    }
  }
}

/**
 * Transform database customer record to GraphQL format
 */
function transformDbCustomer(dbCustomer: unknown): HSCustomer {
  return {
    id: dbCustomer.id,
    businessId: dbCustomer.business_id,
    firstName: dbCustomer.first_name,
    lastName: dbCustomer.last_name,
    email: dbCustomer.email,
    phone: dbCustomer.phone,
    address: dbCustomer.address ? JSON.parse(dbCustomer.address) : null,
    customerType: dbCustomer.customer_type.toUpperCase(),
    tags: dbCustomer.tags || [],
    notes: dbCustomer.notes,
    customFields: dbCustomer.custom_fields ? JSON.parse(dbCustomer.custom_fields) : null,
    status: dbCustomer.status.toUpperCase(),
    createdAt: dbCustomer.created_at,
    updatedAt: dbCustomer.updated_at
  }
}