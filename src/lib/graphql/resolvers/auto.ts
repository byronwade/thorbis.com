/**
 * GraphQL Resolvers for Automotive Services
 * Comprehensive resolvers for repair orders, customers, vehicles, parts, service bays, diagnostics
 */

import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || 'http://localhost:54321',
  process.env.SUPABASE_ANON_KEY || 'dummy-key'
)

interface GraphQLContext {
  businessId: string
  userId: string
  permissions: string[]
  isAuthenticated: boolean
}

export const autoResolvers = {
  Query: {
    // Vehicle Queries
    vehicle: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const { data, error } = await supabase
        .from('auto.vehicles')
        .select('
          *,
          customer:auto.customers!vehicles_customer_id_fkey (*)
        ')
        .eq('id', id)
        .eq('business_id', context.businessId)
        .single()

      if (error) throw new Error('Failed to fetch vehicle: ${error.message}')
      return data
    },

    vehicles: async (_: unknown, { customerId, pagination, filters, sorts }: any, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      let query = supabase
        .from('auto.vehicles')
        .select('
          *,
          customer:auto.customers!vehicles_customer_id_fkey (*)
        ', { count: 'exact' })
        .eq('business_id', context.businessId)

      // Filter by customer if specified
      if (customerId) {
        query = query.eq('customer_id', customerId)
      }

      // Apply filters
      if (filters && filters.length > 0) {
        filters.forEach((filter: unknown) => {
          switch (filter.operator) {
            case 'EQUALS':
              query = query.eq(filter.field, filter.value)
              break
            case 'CONTAINS':
              query = query.ilike(filter.field, '%${filter.value}%')
              break
            case 'IN':
              query = query.in(filter.field, filter.values)
              break
            case 'GREATER_THAN':
              query = query.gt(filter.field, filter.value)
              break
            case 'LESS_THAN':
              query = query.lt(filter.field, filter.value)
              break
          }
        })
      }

      // Apply sorting
      if (sorts && sorts.length > 0) {
        sorts.forEach((sort: unknown) => {
          query = query.order(sort.field, { ascending: sort.direction === 'ASC' })
        })
      } else {
        query = query.order('created_at`, { ascending: false })
      }

      // Apply pagination
      const limit = pagination?.first || 20
      const offset = 0 // Implement cursor-based pagination logic here
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) throw new Error(`Failed to fetch vehicles: ${error.message}')

      return {
        edges: data.map((vehicle: unknown, index: number) => ({
          cursor: Buffer.from('${offset + index}').toString('base64'),
          node: vehicle
        })),
        pageInfo: {
          hasNextPage: (count || 0) > offset + limit,
          hasPreviousPage: offset > 0,
          startCursor: data.length > 0 ? Buffer.from('${offset}').toString('base64') : null,
          endCursor: data.length > 0 ? Buffer.from('${offset + data.length - 1}').toString('base64') : null
        },
        totalCount: count || 0
      }
    },

    // Auto Customer Queries
    autoCustomer: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const { data, error } = await supabase
        .from('auto.customers')
        .select('*')
        .eq('id', id)
        .eq('business_id', context.businessId)
        .single()

      if (error) throw new Error('Failed to fetch auto customer: ${error.message}')
      return data
    },

    autoCustomers: async (_: unknown, { pagination, filters, sorts }: any, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      let query = supabase
        .from('auto.customers')
        .select('*', { count: 'exact' })
        .eq('business_id', context.businessId)

      // Apply filters
      if (filters && filters.length > 0) {
        filters.forEach((filter: unknown) => {
          switch (filter.operator) {
            case 'EQUALS':
              query = query.eq(filter.field, filter.value)
              break
            case 'CONTAINS':
              query = query.ilike(filter.field, '%${filter.value}%')
              break
            case 'IN':
              query = query.in(filter.field, filter.values)
              break
          }
        })
      }

      // Apply sorting
      if (sorts && sorts.length > 0) {
        sorts.forEach((sort: unknown) => {
          query = query.order(sort.field, { ascending: sort.direction === 'ASC' })
        })
      } else {
        query = query.order('last_name`)
      }

      // Apply pagination
      const limit = pagination?.first || 20
      const offset = 0
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) throw new Error(`Failed to fetch auto customers: ${error.message}')

      return {
        edges: data.map((customer: unknown, index: number) => ({
          cursor: Buffer.from('${offset + index}').toString('base64'),
          node: customer
        })),
        pageInfo: {
          hasNextPage: (count || 0) > offset + limit,
          hasPreviousPage: offset > 0,
          startCursor: data.length > 0 ? Buffer.from('${offset}').toString('base64') : null,
          endCursor: data.length > 0 ? Buffer.from('${offset + data.length - 1}').toString('base64') : null
        },
        totalCount: count || 0
      }
    },

    // Repair Order Queries
    repairOrder: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const { data, error } = await supabase
        .from('auto.repair_orders')
        .select('
          *,
          customer:auto.customers!repair_orders_customer_id_fkey (*),
          vehicle:auto.vehicles!repair_orders_vehicle_id_fkey (*),
          service_bay:auto.service_bays!repair_orders_service_bay_id_fkey (*)
        ')
        .eq('id', id)
        .eq('business_id', context.businessId)
        .single()

      if (error) throw new Error('Failed to fetch repair order: ${error.message}')
      return data
    },

    repairOrders: async (_: unknown, { customerId, vehicleId, status, pagination, filters, sorts }: any, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      let query = supabase
        .from('auto.repair_orders')
        .select('
          *,
          customer:auto.customers!repair_orders_customer_id_fkey (*),
          vehicle:auto.vehicles!repair_orders_vehicle_id_fkey (*),
          service_bay:auto.service_bays!repair_orders_service_bay_id_fkey (*)
        ', { count: 'exact' })
        .eq('business_id', context.businessId)

      // Apply specific filters
      if (customerId) {
        query = query.eq('customer_id', customerId)
      }
      if (vehicleId) {
        query = query.eq('vehicle_id', vehicleId)
      }
      if (status) {
        query = query.eq('status', status)
      }

      // Apply additional filters
      if (filters && filters.length > 0) {
        filters.forEach((filter: unknown) => {
          switch (filter.operator) {
            case 'EQUALS':
              query = query.eq(filter.field, filter.value)
              break
            case 'CONTAINS':
              query = query.ilike(filter.field, '%${filter.value}%')
              break
            case 'IN':
              query = query.in(filter.field, filter.values)
              break
            case 'GREATER_THAN_OR_EQUAL':
              query = query.gte(filter.field, filter.value)
              break
            case 'LESS_THAN_OR_EQUAL':
              query = query.lte(filter.field, filter.value)
              break
          }
        })
      }

      // Apply sorting
      if (sorts && sorts.length > 0) {
        sorts.forEach((sort: unknown) => {
          query = query.order(sort.field, { ascending: sort.direction === 'ASC' })
        })
      } else {
        query = query.order('created_at`, { ascending: false })
      }

      // Apply pagination
      const limit = pagination?.first || 20
      const offset = 0
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) throw new Error(`Failed to fetch repair orders: ${error.message}')

      return {
        edges: data.map((order: unknown, index: number) => ({
          cursor: Buffer.from('${offset + index}').toString('base64'),
          node: order
        })),
        pageInfo: {
          hasNextPage: (count || 0) > offset + limit,
          hasPreviousPage: offset > 0,
          startCursor: data.length > 0 ? Buffer.from('${offset}').toString('base64') : null,
          endCursor: data.length > 0 ? Buffer.from('${offset + data.length - 1}').toString('base64') : null
        },
        totalCount: count || 0
      }
    },

    // Service Bay Queries
    serviceBays: async (_: unknown, { type, status, pagination, filters }: any, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      let query = supabase
        .from('auto.service_bays')
        .select('
          *,
          current_repair_order:auto.repair_orders!service_bays_current_repair_order_id_fkey (*)
        ')
        .eq('business_id', context.businessId)

      if (type) {
        query = query.eq('type', type)
      }
      if (status) {
        query = query.eq('status', status)
      }

      // Apply filters
      if (filters && filters.length > 0) {
        filters.forEach((filter: unknown) => {
          if (filter.operator === 'EQUALS') {
            query = query.eq(filter.field, filter.value)
          }
        })
      }

      query = query.order('name')

      const { data, error } = await query

      if (error) throw new Error('Failed to fetch service bays: ${error.message}')
      return data
    },

    // Auto Parts Queries
    autoParts: async (_: unknown, { category, pagination, filters, sorts }: any, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      let query = supabase
        .from('auto.parts')
        .select('*', { count: 'exact' })
        .eq('business_id', context.businessId)

      if (category) {
        query = query.eq('category', category)
      }

      // Apply filters
      if (filters && filters.length > 0) {
        filters.forEach((filter: unknown) => {
          switch (filter.operator) {
            case 'EQUALS':
              query = query.eq(filter.field, filter.value)
              break
            case 'CONTAINS':
              query = query.ilike(filter.field, '%${filter.value}%')
              break
            case 'GREATER_THAN':
              query = query.gt(filter.field, filter.value)
              break
            case 'LESS_THAN':
              query = query.lt(filter.field, filter.value)
              break
          }
        })
      }

      // Apply sorting
      if (sorts && sorts.length > 0) {
        sorts.forEach((sort: unknown) => {
          query = query.order(sort.field, { ascending: sort.direction === 'ASC' })
        })
      } else {
        query = query.order('name`)
      }

      // Apply pagination
      const limit = pagination?.first || 20
      const offset = 0
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) throw new Error(`Failed to fetch auto parts: ${error.message}')

      return {
        edges: data.map((part: unknown, index: number) => ({
          cursor: Buffer.from('${offset + index}').toString('base64'),
          node: part
        })),
        pageInfo: {
          hasNextPage: (count || 0) > offset + limit,
          hasPreviousPage: offset > 0,
          startCursor: data.length > 0 ? Buffer.from('${offset}').toString('base64') : null,
          endCursor: data.length > 0 ? Buffer.from('${offset + data.length - 1}').toString('base64') : null
        },
        totalCount: count || 0
      }
    },

    // VIN Lookup
    vehicleByVin: async (_: unknown, { vin }: { vin: string }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      // First check if vehicle exists in our system
      const { data: existingVehicle } = await supabase
        .from('auto.vehicles')
        .select('*')
        .eq('vin', vin)
        .eq('business_id', context.businessId)
        .single()

      if (existingVehicle) {
        return {
          found: true,
          vehicle: {
            vin: existingVehicle.vin,
            year: existingVehicle.year,
            make: existingVehicle.make,
            model: existingVehicle.model,
            submodel: existingVehicle.submodel,
            trim: existingVehicle.trim,
            engine: existingVehicle.engine,
            transmission: existingVehicle.transmission,
            drivetrain: existingVehicle.drivetrain,
            fuelType: existingVehicle.fuel_type,
            bodyStyle: existingVehicle.body_style,
            doors: existingVehicle.doors
          },
          suggestions: []
        }
      }

      // If not found, this would integrate with a VIN decode service
      // For now, return a mock response
      return {
        found: false,
        vehicle: null,
        suggestions: []
      }
    }
  },

  Mutation: {
    // Vehicle Management
    createVehicle: async (_: unknown, { input }: { input: any }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const vehicleId = crypto.randomUUID()

      const { data, error } = await supabase
        .from('auto.vehicles')
        .insert([{
          id: vehicleId,
          business_id: context.businessId,
          customer_id: input.customerId,
          vin: input.vin,
          year: input.year,
          make: input.make,
          model: input.model,
          submodel: input.submodel,
          trim: input.trim,
          engine: input.engine,
          transmission: input.transmission,
          drivetrain: input.drivetrain,
          fuel_type: input.fuelType,
          color: input.color,
          mileage: input.mileage,
          license_plate: input.licensePlate,
          registration_state: input.registrationState,
          is_fleet: input.isFleet || false,
          fleet_number: input.fleetNumber,
          insurance_company: input.insuranceCompany,
          policy_number: input.policyNumber,
          notes: input.notes,
          custom_fields: input.customFields || {},
          status: 'ACTIVE',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw new Error('Failed to create vehicle: ${error.message}')
      return data
    },

    // Auto Customer Management
    createAutoCustomer: async (_: unknown, { input }: { input: any }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const customerId = crypto.randomUUID()

      const { data, error } = await supabase
        .from('auto.customers')
        .insert([{
          id: customerId,
          business_id: context.businessId,
          first_name: input.firstName,
          last_name: input.lastName,
          email: input.email,
          phone: input.phone,
          alternate_phone: input.alternatePhone,
          address: input.address,
          billing_address: input.billingAddress,
          customer_type: input.customerType,
          customer_since: new Date().toISOString(),
          referral_source: input.referralSource,
          tags: input.tags || [],
          notes: input.notes,
          company_name: input.companyName,
          tax_id: input.taxId,
          fleet_size: input.fleetSize,
          preferred_contact: input.preferredContact,
          communication_preferences: input.communicationPreferences || {},
          credit_limit: input.creditLimit,
          credit_terms: input.creditTerms,
          payment_terms: input.paymentTerms,
          status: 'ACTIVE',
          loyalty_points: 0,
          is_vip: false,
          custom_fields: input.customFields || {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw new Error('Failed to create auto customer: ${error.message}')
      return data
    },

    // Repair Order Management
    createRepairOrder: async (_: unknown, { input }: { input: any }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const orderId = crypto.randomUUID()
      const orderNumber = 'RO-${Date.now()}'

      const { data, error } = await supabase
        .from('auto.repair_orders')
        .insert([{
          id: orderId,
          business_id: context.businessId,
          order_number: orderNumber,
          customer_id: input.customerId,
          vehicle_id: input.vehicleId,
          title: input.title,
          description: input.description,
          customer_concerns: input.customerConcerns,
          symptoms: input.symptoms || [],
          status: 'DRAFT',
          priority: input.priority || 'NORMAL',
          category: input.category,
          scheduled_date: input.scheduledDate,
          assigned_technician: input.assignedTechnician,
          service_advisor: input.serviceAdvisor,
          mileage_in: input.mileageIn,
          fuel_level: input.fuelLevel,
          vehicle_condition: input.vehicleCondition,
          requires_authorization: input.requiresAuthorization || false,
          is_authorized: false,
          authorization_limit: input.authorizationLimit,
          labor_items: [],
          part_items: [],
          sublet_items: [],
          diagnostics: [],
          inspection_results: [],
          labor_total: 0,
          parts_total: 0,
          sublet_total: 0,
          subtotal: 0,
          tax_amount: 0,
          discount_amount: 0,
          total: 0,
          payment_status: 'PENDING',
          paid_amount: 0,
          balance_due: 0,
          work_performed: ',
          recommendations: [],
          notes: input.notes,
          internal_notes: ',
          images: [],
          attachments: [],
          custom_fields: input.customFields || {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw new Error('Failed to create repair order: ${error.message}')
      return data
    },

    updateRepairOrderStatus: async (_: unknown, { id, status, notes }: { id: string, status: string, notes?: string }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const updateData: unknown = {
        status,
        updated_at: new Date().toISOString()
      }

      // Set timestamps based on status
      switch (status) {
        case 'IN_PROGRESS':
          updateData.started_at = new Date().toISOString()
          break
        case 'COMPLETED':
          updateData.completed_at = new Date().toISOString()
          break
      }

      if (notes) {
        updateData.notes = notes
      }

      const { data, error } = await supabase
        .from('auto.repair_orders')
        .update(updateData)
        .eq('id', id)
        .eq('business_id', context.businessId)
        .select()
        .single()

      if (error) throw new Error('Failed to update repair order status: ${error.message}')
      return data
    },

    // Service Bay Management
    createServiceBay: async (_: unknown, { input }: { input: any }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const bayId = crypto.randomUUID()

      const { data, error } = await supabase
        .from('auto.service_bays')
        .insert([{
          id: bayId,
          business_id: context.businessId,
          name: input.name,
          number: input.number,
          type: input.type,
          capabilities: input.capabilities,
          lift: input.lift,
          tools: input.tools || [],
          equipment: input.equipment || [],
          status: 'AVAILABLE',
          is_active: true,
          capacity: 1,
          utilization_rate: 0,
          average_job_time: 0,
          completed_jobs: 0,
          notes: input.notes,
          custom_fields: input.customFields || {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw new Error('Failed to create service bay: ${error.message}')
      return data
    },

    // Parts Management
    createAutoPart: async (_: unknown, { input }: { input: any }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const partId = crypto.randomUUID()

      const { data, error } = await supabase
        .from('auto.parts')
        .insert([{
          id: partId,
          business_id: context.businessId,
          part_number: input.partNumber,
          manufacturer_part_number: input.manufacturerPartNumber,
          alternate_part_numbers: input.alternatePartNumbers || [],
          name: input.name,
          description: input.description,
          category: input.category,
          sub_category: input.subCategory,
          brand: input.brand,
          manufacturer: input.manufacturer,
          applications: input.applications || [],
          is_universal: input.isUniversal || false,
          quantity_on_hand: input.quantityOnHand,
          quantity_reserved: 0,
          quantity_available: input.quantityOnHand,
          reorder_point: input.reorderPoint || 0,
          reorder_quantity: input.reorderQuantity || 0,
          bin_location: input.binLocation,
          shelf_location: input.shelfLocation,
          cost: input.cost,
          price: input.price,
          msrp: input.msrp,
          core_charge: input.coreCharge || 0,
          weight: input.weight,
          dimensions: input.dimensions,
          specifications: input.specifications || {},
          status: 'ACTIVE',
          is_active: true,
          is_obsolete: false,
          is_core: input.isCore || false,
          is_hazardous: input.isHazardous || false,
          requires_special_handling: false,
          warranty: input.warranty,
          average_monthly_sales: 0,
          turnover_rate: 0,
          images: [],
          documents: [],
          notes: input.notes,
          custom_fields: input.customFields || {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw new Error('Failed to create auto part: ${error.message}')
      return data
    }
  },

  // Field Resolvers
  Vehicle: {
    customer: async (parent: unknown) => {
      const { data, error } = await supabase
        .from('auto.customers')
        .select('*')
        .eq('id', parent.customer_id)
        .single()

      return error ? null : data
    },

    repairOrders: async (parent: unknown, { pagination, filters, sorts }: any) => {
      let query = supabase
        .from('auto.repair_orders')
        .select('*', { count: 'exact' })
        .eq('vehicle_id', parent.id)

      // Apply filters and sorting (similar to main queries)
      if (sorts && sorts.length > 0) {
        sorts.forEach((sort: unknown) => {
          query = query.order(sort.field, { ascending: sort.direction === 'ASC' })
        })
      } else {
        query = query.order('created_at', { ascending: false })
      }

      const limit = pagination?.first || 10
      const offset = 0
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) return { edges: [], pageInfo: { hasNextPage: false, hasPreviousPage: false }, totalCount: 0 }

      return {
        edges: data.map((order: unknown, index: number) => ({
          cursor: Buffer.from('${offset + index}').toString('base64'),
          node: order
        })),
        pageInfo: {
          hasNextPage: (count || 0) > offset + limit,
          hasPreviousPage: offset > 0,
          startCursor: data.length > 0 ? Buffer.from('${offset}').toString('base64') : null,
          endCursor: data.length > 0 ? Buffer.from('${offset + data.length - 1}').toString('base64') : null
        },
        totalCount: count || 0
      }
    },

    age: (parent: unknown) => {
      return new Date().getFullYear() - parent.year
    },

    totalRepairCost: async (parent: unknown) => {
      const { data, error } = await supabase
        .from('auto.repair_orders')
        .select('total')
        .eq('vehicle_id', parent.id)
        .eq('status', 'COMPLETED')

      if (error) return 0

      return data.reduce((sum, order) => sum + (order.total || 0), 0)
    }
  },

  AutoCustomer: {
    fullName: (parent: unknown) => {
      return '${parent.first_name} ${parent.last_name}'
    },

    vehicles: async (parent: unknown, { pagination, filters, sorts }: any) => {
      let query = supabase
        .from('auto.vehicles')
        .select('*', { count: 'exact' })
        .eq('customer_id', parent.id)

      // Apply filters and sorting
      if (sorts && sorts.length > 0) {
        sorts.forEach((sort: unknown) => {
          query = query.order(sort.field, { ascending: sort.direction === 'ASC' })
        })
      } else {
        query = query.order('year', { ascending: false })
      }

      const limit = pagination?.first || 10
      const offset = 0
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) return { edges: [], pageInfo: { hasNextPage: false, hasPreviousPage: false }, totalCount: 0 }

      return {
        edges: data.map((vehicle: unknown, index: number) => ({
          cursor: Buffer.from('${offset + index}').toString('base64'),
          node: vehicle
        })),
        pageInfo: {
          hasNextPage: (count || 0) > offset + limit,
          hasPreviousPage: offset > 0,
          startCursor: data.length > 0 ? Buffer.from('${offset}').toString('base64') : null,
          endCursor: data.length > 0 ? Buffer.from('${offset + data.length - 1}').toString('base64') : null
        },
        totalCount: count || 0
      }
    },

    vehicleCount: async (parent: unknown) => {
      const { count, error } = await supabase
        .from('auto.vehicles')
        .select('*', { count: 'exact', head: true })
        .eq('customer_id', parent.id)
        .eq('status', 'ACTIVE')

      return error ? 0 : count || 0
    },

    totalSpent: async (parent: unknown) => {
      const { data, error } = await supabase
        .from('auto.repair_orders')
        .select('total')
        .eq('customer_id', parent.id)
        .eq('payment_status', 'PAID')

      if (error) return 0

      return data.reduce((sum, order) => sum + (order.total || 0), 0)
    }
  },

  RepairOrder: {
    customer: async (parent: unknown) => {
      const { data, error } = await supabase
        .from('auto.customers')
        .select('*')
        .eq('id', parent.customer_id)
        .single()

      return error ? null : data
    },

    vehicle: async (parent: unknown) => {
      const { data, error } = await supabase
        .from('auto.vehicles')
        .select('*')
        .eq('id', parent.vehicle_id)
        .single()

      return error ? null : data
    },

    serviceBay: async (parent: unknown) => {
      if (!parent.service_bay_id) return null

      const { data, error } = await supabase
        .from('auto.service_bays')
        .select('*')
        .eq('id', parent.service_bay_id)
        .single()

      return error ? null : data
    },

    isOverdue: (parent: unknown) => {
      if (!parent.scheduled_date) return false
      return new Date(parent.scheduled_date) < new Date() && parent.status !== 'COMPLETED'
    },

    daysSinceCreated: (parent: unknown) => {
      const created = new Date(parent.created_at)
      const now = new Date()
      return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
    }
  }
}

export default autoResolvers