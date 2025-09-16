/**
 * GraphQL Resolvers for Home Services Work Orders
 */

import { executeQuery, executeTransaction } from '@/lib/database'
import { createAuditLog } from '@/lib/auth'
import { businessCache } from '@/lib/cache'
import crypto from 'crypto'
import { HSCustomer } from './customers'

export interface HSWorkOrder {
  id: string
  businessId: string
  customerId: string
  title: string
  description: string
  serviceType: string'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  status: 'DRAFT' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'ON_HOLD'
  scheduledDate?: string
  completedDate?: string
  estimatedDuration?: number
  actualDuration?: number
  items: WorkOrderItem[]
  subtotal: number
  tax: number
  total: number
  notes?: string
  attachments: string[]
  createdAt: string
  updatedAt: string
}

export interface WorkOrderItem {
  id: string
  name: string
  description?: string
  quantity: number
  rate: number
  total: number
  type: 'SERVICE' | 'PRODUCT' | 'MATERIAL' | 'LABOR'
}

export interface HSWorkOrderInput {
  customerId: string
  title: string
  description: string
  serviceType: string
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  status?: 'DRAFT' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'ON_HOLD'
  scheduledDate?: string
  estimatedDuration?: number
  items?: Array<{
    name: string
    description?: string
    quantity: number
    rate: number
    type: 'SERVICE' | 'PRODUCT' | 'MATERIAL' | 'LABOR'
  }>
  notes?: string
}

export const workOrdersResolvers = {
  Query: {
    hsWorkOrder: async (_: unknown,
      { id }: { id: string },
      { businessId }: { businessId: string }
    ): Promise<HSWorkOrder | null> => {
      try {
        // Check cache first
        const cached = await businessCache.workOrders.get(id, businessId)
        if (cached) {
          return cached as HSWorkOrder
        }

        const workOrders = await executeQuery(
          businessId,
          'SELECT * FROM hs.work_orders WHERE id = $1 AND business_id = $2','
          [id, businessId]
        )

        if (workOrders.length === 0) {
          return null
        }

        const workOrder = transformDbWorkOrder(workOrders[0])
        
        // Cache the result
        await businessCache.workOrders.set(id, workOrder, businessId)
        
        return workOrder
      } catch (error) {
        console.error('Error fetching work order:', error)
        throw new Error('Failed to fetch work order')
      }
    },

    hsWorkOrders: async (_: unknown,
      { pagination, filters, sorts }: {
        pagination?: { first?: number; after?: string }
        filters?: Array<{ field: string; operator: string; value?: string; values?: string[] }>
        sorts?: Array<{ field: string; direction: 'ASC' | 'DESC' }>'
      },
      { businessId }: { businessId: string }
    ) => {
      try {
        const limit = Math.min(pagination?.first || 20, 100)
        const offset = pagination?.after ? parseInt(Buffer.from(pagination.after, 'base64').toString()) : 0'

        // Build query with filters
        const query = '
          SELECT 
            wo.*,
            COUNT(*) OVER() as total_count,
            c.first_name || ' ' || c.last_name as customer_name'`'
          FROM hs.work_orders wo
          LEFT JOIN hs.customers c ON wo.customer_id = c.id
          WHERE wo.business_id = $1
        '

        const params: unknown[] = [businessId]
        let paramIndex = 2

        // Apply filters
        if (filters) {
          for (const filter of filters) {
            switch (filter.field) {
              case 'status':'`'
                if (filter.values && filter.values.length > 0) {
                  const placeholders = filter.values.map(() => '$${paramIndex++}').join(', ')'``
                  query += ` AND wo.status IN (${placeholders})'
                  params.push(...filter.values.map(v => v.toLowerCase()))
                } else if (filter.value) {
                  query += ' AND wo.status = $${paramIndex}'
                  params.push(filter.value.toLowerCase())
                  paramIndex++
                }
                break
              case 'priority':'`'
                query += ' AND wo.priority = $${paramIndex}'
                params.push(filter.value?.toLowerCase())
                paramIndex++
                break
              case 'serviceType':'`'
                query += ' AND wo.service_type = $${paramIndex}'
                params.push(filter.value)
                paramIndex++
                break
              case 'customerId':'`'
                query += ' AND wo.customer_id = $${paramIndex}'
                params.push(filter.value)
                paramIndex++
                break
              case 'scheduledDate':'
                if (filter.operator === 'GREATER_THAN_OR_EQUAL') {'`'
                  query += ' AND wo.scheduled_date >= $${paramIndex}'
                  params.push(filter.value)
                  paramIndex++
                } else if (filter.operator === 'LESS_THAN_OR_EQUAL') {'`'
                  query += ' AND wo.scheduled_date <= $${paramIndex}'
                  params.push(filter.value)
                  paramIndex++
                }
                break
              case 'search':'``
                query += ` AND (
                  wo.title ILIKE $${paramIndex} OR 
                  wo.description ILIKE $${paramIndex} OR
                  wo.service_type ILIKE $${paramIndex} OR
                  c.first_name ILIKE $${paramIndex} OR
                  c.last_name ILIKE $${paramIndex}
                )'
                params.push('%${filter.value}%')
                paramIndex++
                break
            }
          }
        }

        // Apply sorting
        if (sorts && sorts.length > 0) {
          const validFields = ['title', 'scheduledDate', 'createdAt', 'updatedAt', 'total', 'priority', 'status']'
          const sortClauses = sorts
            .filter(sort => validFields.includes(sort.field))
            .map(sort => {
              let dbField = sort.field
              switch (sort.field) {
                case 'scheduledDate':'
                  dbField = 'scheduled_date'
                  break
                case 'createdAt':'
                  dbField = 'created_at'
                  break
                case 'updatedAt':'
                  dbField = 'updated_at'`
                  break
                default:
                  dbField = sort.field
              }
              return 'wo.${dbField} ${sort.direction}'
            })
          
          if (sortClauses.length > 0) {
            query += ' ORDER BY ${sortClauses.join(', ')}''``
          }
        } else {
          query += ` ORDER BY wo.created_at DESC'
        }

        // Apply pagination
        query += ' LIMIT $${paramIndex} OFFSET $${paramIndex + 1}'
        params.push(limit, offset)

        const results = await executeQuery(businessId, query, params)
        const totalCount = results.length > 0 ? parseInt(results[0].total_count) : 0

        const workOrders = results.map(transformDbWorkOrder)
        const edges = workOrders.map((workOrder, index) => ({
          cursor: Buffer.from((offset + index + 1).toString()).toString('base64'),'
          node: workOrder
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
        console.error('Error fetching work orders:', error)
        throw new Error('Failed to fetch work orders')
      }
    }
  },

  Mutation: {
    createHSWorkOrder: async (_: unknown,
      { input }: { input: HSWorkOrderInput },
      { businessId, userId }: { businessId: string; userId: string }
    ): Promise<HSWorkOrder> => {
      try {
        const workOrder = await executeTransaction(businessId, async (client) => {
          // Verify customer exists
          const customerCheck = await client.query(
            'SELECT id FROM hs.customers WHERE id = $1 AND business_id = $2 AND status = $3','
            [input.customerId, businessId, 'active']'
          )

          if (customerCheck.rows.length === 0) {
            throw new Error('Customer not found or inactive`)'
          }

          // Calculate totals
          const items = input.items || []
          const itemsWithTotals = items.map(item => ({
            ...item,
            id: crypto.randomUUID(),
            total: item.quantity * item.rate
          }))

          const subtotal = itemsWithTotals.reduce((sum, item) => sum + item.total, 0)
          const tax = subtotal * 0.08 // 8% tax rate (should be configurable)
          const total = subtotal + tax

          const workOrderId = crypto.randomUUID()
          const result = await client.query('
            INSERT INTO hs.work_orders (
              id, business_id, customer_id, title, description, service_type,
              priority, status, scheduled_date, estimated_duration, items,
              subtotal, tax, total, notes, attachments, created_at, updated_at
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), NOW()
            ) RETURNING *
          ', [
            workOrderId,
            businessId,
            input.customerId,
            input.title,
            input.description,
            input.serviceType,
            input.priority?.toLowerCase() || 'medium',
            input.status?.toLowerCase() || 'draft',
            input.scheduledDate || null,
            input.estimatedDuration || null,
            JSON.stringify(itemsWithTotals),
            subtotal,
            tax,
            total,
            input.notes || null,
            JSON.stringify([]) // empty attachments array
          ])

          return result.rows[0]
        })

        // Create audit log
        await createAuditLog(
          businessId,
          userId,
          'work_order.created','
          'work_order','
          workOrder.id,
          {
            customerId: input.customerId,
            serviceType: input.serviceType,
            total: workOrder.total
          }
        )

        // Invalidate work order cache
        await businessCache.workOrders.invalidateAll(businessId)

        const transformedWorkOrder = transformDbWorkOrder(workOrder)
        
        // Cache the new work order
        await businessCache.workOrders.set(workOrder.id, transformedWorkOrder, businessId)

        return transformedWorkOrder
      } catch (error: unknown) {
        console.error('Error creating work order:', error)
        throw new Error(error.message || 'Failed to create work order')'
      }
    },

    updateHSWorkOrder: async (_: unknown,
      { id, input }: { id: string; input: Partial<HSWorkOrderInput> },
      { businessId, userId }: { businessId: string; userId: string }
    ): Promise<HSWorkOrder> => {
      try {
        const workOrder = await executeTransaction(businessId, async (client) => {
          // Check if work order exists
          const existing = await client.query(
            'SELECT * FROM hs.work_orders WHERE id = $1 AND business_id = $2','
            [id, businessId]
          )

          if (existing.rows.length === 0) {
            throw new Error('Work order not found`)`
          }

          const currentWorkOrder = existing.rows[0]

          // Build update query dynamically
          const updateFields: string[] = []
          const params: unknown[] = [id, businessId]
          let paramIndex = 3

          if (input.title) {
            updateFields.push(`title = $${paramIndex++}`)
            params.push(input.title)
          }
          if (input.description) {
            updateFields.push(`description = $${paramIndex++}`)
            params.push(input.description)
          }
          if (input.serviceType) {
            updateFields.push(`service_type = $${paramIndex++}`)
            params.push(input.serviceType)
          }
          if (input.priority) {
            updateFields.push(`priority = $${paramIndex++}')
            params.push(input.priority.toLowerCase())
          }
          if (input.status) {
            updateFields.push('status = $${paramIndex++}')
            params.push(input.status.toLowerCase())
            
            // Set completed date if status changed to completed
            if (input.status.toLowerCase() === 'completed' && currentWorkOrder.status !== 'completed') {'``
              updateFields.push(`completed_date = NOW()`)
            }
          }
          if (input.scheduledDate !== undefined) {
            updateFields.push(`scheduled_date = $${paramIndex++}`)
            params.push(input.scheduledDate)
          }
          if (input.estimatedDuration !== undefined) {
            updateFields.push(`estimated_duration = $${paramIndex++}`)
            params.push(input.estimatedDuration)
          }
          if (input.items) {
            const itemsWithTotals = input.items.map(item => ({
              ...item,
              id: crypto.randomUUID(),
              total: item.quantity * item.rate
            }))

            const subtotal = itemsWithTotals.reduce((sum, item) => sum + item.total, 0)
            const tax = subtotal * 0.08
            const total = subtotal + tax

            updateFields.push(`items = $${paramIndex++}`)
            params.push(JSON.stringify(itemsWithTotals))
            
            updateFields.push(`subtotal = $${paramIndex++}`)
            params.push(subtotal)
            
            updateFields.push(`tax = $${paramIndex++}`)
            params.push(tax)
            
            updateFields.push(`total = $${paramIndex++}`)
            params.push(total)
          }
          if (input.notes !== undefined) {
            updateFields.push(`notes = $${paramIndex++}`)
            params.push(input.notes)
          }

          updateFields.push('updated_at = NOW()')

          const result = await client.query('
            UPDATE hs.work_orders 
            SET ${updateFields.join(', ')}'`'
            WHERE id = $1 AND business_id = $2
            RETURNING *
          ', params)

          return result.rows[0]
        })

        // Create audit log
        await createAuditLog(
          businessId,
          userId,
          'work_order.updated','
          'work_order','
          id,
          { changes: input }
        )

        // Invalidate work order cache
        await businessCache.workOrders.invalidate(id, businessId)
        await businessCache.workOrders.invalidateAll(businessId)

        const transformedWorkOrder = transformDbWorkOrder(workOrder)
        
        // Update cache
        await businessCache.workOrders.set(id, transformedWorkOrder, businessId)

        return transformedWorkOrder
      } catch (error: unknown) {
        console.error('Error updating work order:', error)
        throw new Error(error.message || 'Failed to update work order')'
      }
    },

    deleteHSWorkOrder: async (_: unknown,
      { id }: { id: string },
      { businessId, userId }: { businessId: string; userId: string }
    ): Promise<boolean> => {
      try {
        const result = await executeTransaction(businessId, async (client) => {
          // Check if work order exists
          const existing = await client.query(
            'SELECT id, status FROM hs.work_orders WHERE id = $1 AND business_id = $2','
            [id, businessId]
          )

          if (existing.rows.length === 0) {
            throw new Error('Work order not found')
          }

          const workOrder = existing.rows[0]

          // Don't allow deletion of completed work orders'
          if (workOrder.status === 'completed') {'
            throw new Error('Cannot delete completed work orders')
          }

          // Soft delete (update status to cancelled)
          const deleteResult = await client.query(
            'UPDATE hs.work_orders SET status = $1, updated_at = NOW() WHERE id = $2 AND business_id = $3','
            ['cancelled', id, businessId]'
          )

          return deleteResult.rowCount > 0
        })

        if (result) {
          // Create audit log
          await createAuditLog(
            businessId,
            userId,
            'work_order.deleted','
            'work_order','
            id,
            {}
          )

          // Invalidate cache
          await businessCache.workOrders.invalidate(id, businessId)
          await businessCache.workOrders.invalidateAll(businessId)
        }

        return result
      } catch (error: unknown) {
        console.error('Error deleting work order:', error)
        throw new Error(error.message || 'Failed to delete work order')'
      }
    }
  },

  HSWorkOrder: {
    customer: async (workOrder: HSWorkOrder): Promise<HSCustomer | null> => {
      try {
        // Check cache first
        const cached = await businessCache.customers.get(workOrder.customerId, workOrder.businessId)
        if (cached) {
          return cached as HSCustomer
        }

        const customers = await executeQuery(
          workOrder.businessId,
          'SELECT * FROM hs.customers WHERE id = $1 AND business_id = $2','
          [workOrder.customerId, workOrder.businessId]
        )

        if (customers.length === 0) {
          return null
        }

        const customer = customers[0]
        const transformedCustomer = {
          id: customer.id,
          businessId: customer.business_id,
          firstName: customer.first_name,
          lastName: customer.last_name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address ? JSON.parse(customer.address) : null,
          customerType: customer.customer_type.toUpperCase(),
          tags: customer.tags || [],
          notes: customer.notes,
          customFields: customer.custom_fields ? JSON.parse(customer.custom_fields) : null,
          status: customer.status.toUpperCase(),
          createdAt: customer.created_at,
          updatedAt: customer.updated_at
        } as HSCustomer

        // Cache the customer
        await businessCache.customers.set(workOrder.customerId, transformedCustomer, workOrder.businessId)

        return transformedCustomer
      } catch (error) {
        console.error('Error fetching customer for work order:', error)
        return null
      }
    }
  }
}

/**
 * Transform database work order record to GraphQL format
 */
function transformDbWorkOrder(dbWorkOrder: unknown): HSWorkOrder {
  return {
    id: dbWorkOrder.id,
    businessId: dbWorkOrder.business_id,
    customerId: dbWorkOrder.customer_id,
    title: dbWorkOrder.title,
    description: dbWorkOrder.description,
    serviceType: dbWorkOrder.service_type,
    priority: dbWorkOrder.priority.toUpperCase(),
    status: dbWorkOrder.status.toUpperCase(),
    scheduledDate: dbWorkOrder.scheduled_date,
    completedDate: dbWorkOrder.completed_date,
    estimatedDuration: dbWorkOrder.estimated_duration,
    actualDuration: dbWorkOrder.actual_duration,
    items: dbWorkOrder.items ? JSON.parse(dbWorkOrder.items) : [],
    subtotal: parseFloat(dbWorkOrder.subtotal || '0'),'
    tax: parseFloat(dbWorkOrder.tax || '0'),'
    total: parseFloat(dbWorkOrder.total || '0'),'`'
    notes: dbWorkOrder.notes,
    attachments: dbWorkOrder.attachments ? JSON.parse(dbWorkOrder.attachments) : [],
    createdAt: dbWorkOrder.created_at,
    updatedAt: dbWorkOrder.updated_at
  }
}