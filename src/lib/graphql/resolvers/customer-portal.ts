/**
 * GraphQL Resolvers for Customer Portal Services
 * Comprehensive resolvers for customer portal management, document access, messaging,
 * support tickets, portal customization, and tenant-isolated customer self-service
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

export const customerPortalResolvers = {
  Query: {
    // Customer Portal Queries
    customerPortal: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const { data, error } = await supabase
        .from('customer_portals.portals')
        .select('
          *,
          customers:customer_portals.customers!customers_portal_id_fkey (*),
          documents:customer_portals.documents!documents_portal_id_fkey (*)
        ')
        .eq('id', id)
        .eq('business_id', context.businessId)
        .single()

      if (error) throw new Error('Failed to fetch customer portal: ${error.message}')
      return data
    },

    customerPortals: async (_: unknown, { portalType, industry, status, pagination, filters, sorts }: any, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      let query = supabase
        .from('customer_portals.portals')
        .select('
          *,
          customers:customer_portals.customers!customers_portal_id_fkey (*),
          documents:customer_portals.documents!documents_portal_id_fkey (*)
        ', { count: 'exact' })
        .eq('business_id', context.businessId)

      // Apply specific filters
      if (portalType) {
        query = query.eq('portal_type', portalType)
      }
      if (industry) {
        query = query.eq('industry', industry)
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
        query = query.order('updated_at`, { ascending: false })
      }

      // Apply pagination
      const limit = pagination?.first || 20
      const offset = 0
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) throw new Error(`Failed to fetch customer portals: ${error.message}')

      return {
        edges: data.map((portal: unknown, index: number) => ({
          cursor: Buffer.from('${offset + index}').toString('base64'),
          node: portal
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

    // Portal Customer Queries
    portalCustomer: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const { data, error } = await supabase
        .from('customer_portals.customers')
        .select('
          *,
          portal:customer_portals.portals!customers_portal_id_fkey (*),
          groups:customer_portals.customer_groups!customer_group_members_customer_id_fkey (*)
        ')
        .eq('id', id)
        .eq('business_id', context.businessId)
        .single()

      if (error) throw new Error('Failed to fetch portal customer: ${error.message}')
      return data
    },

    portalCustomers: async (_: unknown, { portalId, customerType, status, groupId, accessLevel, pagination, filters, sorts }: any, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      let query = supabase
        .from('customer_portals.customers')
        .select('
          *,
          portal:customer_portals.portals!customers_portal_id_fkey (*),
          groups:customer_portals.customer_groups!customer_group_members_customer_id_fkey (*)
        ', { count: 'exact' })
        .eq('business_id', context.businessId)
        .eq('portal_id', portalId)

      // Apply specific filters
      if (customerType) {
        query = query.eq('customer_type', customerType)
      }
      if (status) {
        query = query.eq('status', status)
      }
      if (accessLevel) {
        query = query.eq('access_level', accessLevel)
      }
      if (groupId) {
        // Join with customer_group_members to filter by group
        query = query.contains('groups', [{ id: groupId }])
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

      const limit = pagination?.first || 20
      const offset = 0
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) throw new Error(`Failed to fetch portal customers: ${error.message}')

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

    // Customer Document Queries
    customerDocument: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const { data, error } = await supabase
        .from('customer_portals.documents')
        .select('
          *,
          portal:customer_portals.portals!documents_portal_id_fkey (*),
          folder:customer_portals.document_folders!documents_folder_id_fkey (*)
        ')
        .eq('id', id)
        .eq('business_id', context.businessId)
        .single()

      if (error) throw new Error('Failed to fetch customer document: ${error.message}')
      return data
    },

    customerDocuments: async (_: unknown, { portalId, customerId, documentType, category, visibility, status, pagination, filters, sorts }: any, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      let query = supabase
        .from('customer_portals.documents')
        .select('
          *,
          portal:customer_portals.portals!documents_portal_id_fkey (*),
          folder:customer_portals.document_folders!documents_folder_id_fkey (*)
        ', { count: 'exact' })
        .eq('business_id', context.businessId)
        .eq('portal_id', portalId)

      // Apply specific filters
      if (customerId) {
        query = query.contains('specific_customers', [customerId])
      }
      if (documentType) {
        query = query.eq('document_type', documentType)
      }
      if (category) {
        query = query.eq('category', category)
      }
      if (visibility) {
        query = query.eq('visibility', visibility)
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

      const limit = pagination?.first || 20
      const offset = 0
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) throw new Error(`Failed to fetch customer documents: ${error.message}')

      return {
        edges: data.map((document: unknown, index: number) => ({
          cursor: Buffer.from('${offset + index}').toString('base64'),
          node: document
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

    // Customer Message Queries
    customerMessage: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const { data, error } = await supabase
        .from('customer_portals.messages')
        .select('
          *,
          portal:customer_portals.portals!messages_portal_id_fkey (*),
          sender_customer:customer_portals.customers!messages_sender_id_fkey (*)
        ')
        .eq('id', id)
        .eq('business_id', context.businessId)
        .single()

      if (error) throw new Error('Failed to fetch customer message: ${error.message}')
      return data
    },

    customerMessages: async (_: unknown, { portalId, customerId, conversationId, messageType, status, pagination, filters, sorts }: any, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      let query = supabase
        .from('customer_portals.messages')
        .select('
          *,
          portal:customer_portals.portals!messages_portal_id_fkey (*),
          sender_customer:customer_portals.customers!messages_sender_id_fkey (*)
        ', { count: 'exact' })
        .eq('business_id', context.businessId)
        .eq('portal_id', portalId)

      if (customerId) {
        query = query.eq('sender_id', customerId)
      }
      if (conversationId) {
        query = query.eq('conversation_id', conversationId)
      }
      if (messageType) {
        query = query.eq('message_type', messageType)
      }
      if (status) {
        query = query.eq('status', status)
      }

      // Apply sorting
      if (sorts && sorts.length > 0) {
        sorts.forEach((sort: unknown) => {
          query = query.order(sort.field, { ascending: sort.direction === 'ASC' })
        })
      } else {
        query = query.order('created_at`, { ascending: false })
      }

      const limit = pagination?.first || 20
      const offset = 0
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) throw new Error(`Failed to fetch customer messages: ${error.message}')

      return {
        edges: data.map((message: unknown, index: number) => ({
          cursor: Buffer.from('${offset + index}').toString('base64'),
          node: message
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

    // Support Ticket Queries
    supportTicket: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const { data, error } = await supabase
        .from('customer_portals.support_tickets')
        .select('
          *,
          portal:customer_portals.portals!support_tickets_portal_id_fkey (*),
          customer:customer_portals.customers!support_tickets_customer_id_fkey (*)
        ')
        .eq('id', id)
        .eq('business_id', context.businessId)
        .single()

      if (error) throw new Error('Failed to fetch support ticket: ${error.message}')
      return data
    },

    supportTickets: async (_: unknown, { portalId, customerId, assignedTo, ticketType, priority, status, slaStatus, pagination, filters, sorts }: any, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      let query = supabase
        .from('customer_portals.support_tickets')
        .select('
          *,
          portal:customer_portals.portals!support_tickets_portal_id_fkey (*),
          customer:customer_portals.customers!support_tickets_customer_id_fkey (*)
        ', { count: 'exact' })
        .eq('business_id', context.businessId)
        .eq('portal_id', portalId)

      // Apply specific filters
      if (customerId) {
        query = query.eq('customer_id', customerId)
      }
      if (assignedTo) {
        query = query.eq('assigned_to', assignedTo)
      }
      if (ticketType) {
        query = query.eq('ticket_type', ticketType)
      }
      if (priority) {
        query = query.eq('priority', priority)
      }
      if (status) {
        query = query.eq('status', status)
      }
      if (slaStatus) {
        query = query.eq('sla_status', slaStatus)
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

      const limit = pagination?.first || 20
      const offset = 0
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) throw new Error(`Failed to fetch support tickets: ${error.message}')

      return {
        edges: data.map((ticket: unknown, index: number) => ({
          cursor: Buffer.from('${offset + index}').toString('base64'),
          node: ticket
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

    // Portal Analytics
    portalAnalytics: async (_: unknown, { portalId, timeframe, startDate, endDate }: any, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      // Get basic metrics
      const { data: totalCustomers, error: customersError } = await supabase
        .from('customer_portals.customers')
        .select('*', { count: 'exact', head: true })
        .eq('portal_id', portalId)
        .eq('business_id', context.businessId)

      const { data: activeCustomers, error: activeError } = await supabase
        .from('customer_portals.customers')
        .select('*', { count: 'exact', head: true })
        .eq('portal_id', portalId)
        .eq('business_id', context.businessId)
        .eq('status', 'ACTIVE')

      const { data: totalDocuments, error: documentsError } = await supabase
        .from('customer_portals.documents')
        .select('*', { count: 'exact', head: true })
        .eq('portal_id', portalId)
        .eq('business_id', context.businessId)

      const { data: totalTickets, error: ticketsError } = await supabase
        .from('customer_portals.support_tickets')
        .select('*', { count: 'exact', head: true })
        .eq('portal_id', portalId)
        .eq('business_id', context.businessId)

      if (customersError || activeError || documentsError || ticketsError) {
        throw new Error('Failed to fetch portal analytics')
      }

      return {
        totalCustomers: totalCustomers || 0,
        activeCustomers: activeCustomers || 0,
        newCustomersToday: 0, // Would calculate based on date filters
        documentsViewed: 0, // Would sum from document_downloads table
        documentsDownloaded: 0, // Would sum from document_downloads table
        messagesExchanged: 0, // Would count from messages table
        ticketsCreated: totalTickets || 0,
        ticketsResolved: 0, // Would filter by resolved status
        averageResponseTime: 0, // Would calculate from ticket response times
        customerSatisfactionScore: 0, // Would calculate from feedback
        portalUsageStats: {
          dailyActiveUsers: 0,
          weeklyActiveUsers: 0,
          monthlyActiveUsers: 0,
          averageSessionDuration: 0,
          pageViews: 0,
          uniqueVisitors: 0,
          bounceRate: 0,
          conversionRate: 0
        },
        topDocuments: [],
        customerEngagement: {
          highlyEngaged: 0,
          moderatelyEngaged: 0,
          lowEngagement: 0,
          churnRisk: 0,
          averageEngagementScore: 0
        }
      }
    },

    // Customer Groups
    customerGroups: async (_: unknown, { portalId }: { portalId: string }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const { data, error } = await supabase
        .from('customer_portals.customer_groups')
        .select('
          *,
          customers:customer_portals.customer_group_members!customer_group_members_group_id_fkey (*)
        ')
        .eq('portal_id', portalId)
        .eq('business_id', context.businessId)
        .order('name')

      if (error) throw new Error('Failed to fetch customer groups: ${error.message}')
      return data
    },

    // Document Folders
    documentFolders: async (_: unknown, { portalId, parentFolderId }: { portalId: string, parentFolderId?: string }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      let query = supabase
        .from('customer_portals.document_folders')
        .select('
          *,
          documents:customer_portals.documents!documents_folder_id_fkey (*)
        ')
        .eq('portal_id', portalId)
        .eq('business_id', context.businessId)

      if (parentFolderId) {
        query = query.eq('parent_folder_id', parentFolderId)
      } else {
        query = query.is('parent_folder_id', null)
      }

      query = query.order('name')

      const { data, error } = await query

      if (error) throw new Error('Failed to fetch document folders: ${error.message}')
      return data
    }
  },

  Mutation: {
    // Portal Management
    createCustomerPortal: async (_: unknown, { input }: { input: any }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const portalId = crypto.randomUUID()
      const subdomainPrefix = input.subdomainPrefix || 'portal-${Date.now()}'

      const { data, error } = await supabase
        .from('customer_portals.portals')
        .insert([{
          id: portalId,
          business_id: context.businessId,
          name: input.name,
          title: input.title,
          description: input.description,
          portal_type: input.portalType,
          industry: input.industry,
          subdomain_prefix: subdomainPrefix,
          access_level: input.accessLevel,
          authentication_required: input.authenticationRequired || true,
          sso_enabled: input.ssoEnabled || false,
          mfa_required: input.mfaRequired || false,
          ip_whitelist: [],
          allowed_countries: [],
          branding: input.branding || {
            companyName: input.name,
            primaryColor: '#007bff',
            secondaryColor: '#6c757d',
            accentColor: '#28a745',
            backgroundColor: '#ffffff',
            textColor: '#333333',
            linkColor: '#007bff'
          },
          theme: input.theme || {
            name: 'default',
            mode: 'LIGHT',
            layout: 'SIDEBAR',
            navigation: 'VERTICAL'
          },
          features: input.features || {
            documentCenter: true,
            messaging: true,
            supportTickets: true,
            knowledgeBase: true,
            announcements: true
          },
          support_enabled: input.supportEnabled || true,
          status: 'ACTIVE',
          maintenance_mode: false,
          session_tracking: true,
          seo_settings: {
            title: input.title,
            description: input.description,
            keywords: [],
            robotsIndex: true,
            robotsFollow: true
          },
          tags: input.tags || [],
          custom_fields: input.customFields || {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw new Error('Failed to create customer portal: ${error.message}')
      return data
    },

    updateCustomerPortal: async (_: unknown, { id, input }: { id: string, input: any }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const { data, error } = await supabase
        .from('customer_portals.portals')
        .update({
          name: input.name,
          title: input.title,
          description: input.description,
          portal_type: input.portalType,
          industry: input.industry,
          access_level: input.accessLevel,
          authentication_required: input.authenticationRequired,
          sso_enabled: input.ssoEnabled,
          mfa_required: input.mfaRequired,
          branding: input.branding,
          theme: input.theme,
          features: input.features,
          support_enabled: input.supportEnabled,
          tags: input.tags,
          custom_fields: input.customFields,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('business_id', context.businessId)
        .select()
        .single()

      if (error) throw new Error('Failed to update customer portal: ${error.message}')
      return data
    },

    deleteCustomerPortal: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const { error } = await supabase
        .from('customer_portals.portals')
        .delete()
        .eq('id', id)
        .eq('business_id', context.businessId)

      if (error) throw new Error('Failed to delete customer portal: ${error.message}')
      return true
    },

    togglePortalMaintenanceMode: async (_: unknown, { id, enabled }: { id: string, enabled: boolean }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const { data, error } = await supabase
        .from('customer_portals.portals')
        .update({
          maintenance_mode: enabled,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('business_id', context.businessId)
        .select()
        .single()

      if (error) throw new Error('Failed to toggle maintenance mode: ${error.message}')
      return data
    },

    // Customer Management
    createPortalCustomer: async (_: unknown, { portalId, input }: { portalId: string, input: any }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const customerId = crypto.randomUUID()
      const username = input.username || input.email.split('@')[0]

      const { data, error } = await supabase
        .from('customer_portals.customers')
        .insert([{
          id: customerId,
          business_id: context.businessId,
          portal_id: portalId,
          customer_type: input.customerType,
          customer_id: input.customerId,
          first_name: input.firstName,
          last_name: input.lastName,
          full_name: '${input.firstName} ${input.lastName}',
          email: input.email,
          phone: input.phone,
          company: input.company,
          username: username,
          status: 'PENDING_VERIFICATION',
          email_verified: false,
          phone_verified: false,
          account_locked: false,
          timezone: input.timezone || 'UTC',
          locale: input.locale || 'en',
          access_level: input.accessLevel || 'BASIC',
          login_count: 0,
          session_count: 0,
          engagement_score: 0,
          preferences: {
            language: input.locale || 'en',
            timezone: input.timezone || 'UTC',
            dateFormat: 'MM/DD/YYYY',
            timeFormat: '12h',
            theme: 'LIGHT',
            notifications: {
              newDocuments: true,
              systemMaintenance: true,
              accountUpdates: true,
              supportTicketUpdates: true,
              messageReplies: true,
              promotionalContent: false,
              weeklyDigest: true,
              realTimeAlerts: true
            }
          },
          communication_preferences: {
            emailEnabled: true,
            smsEnabled: false,
            pushEnabled: true,
            marketingEmails: false,
            productUpdates: true,
            securityAlerts: true,
            supportTicketUpdates: true,
            preferredLanguage: input.locale || 'en'
          },
          usage_metrics: {
            loginFrequency: 0,
            sessionDuration: 0,
            pagesViewed: 0,
            documentsAccessed: 0,
            messagesExchanged: 0,
            ticketsSubmitted: 0,
            lastActivityDate: null
          },
          custom_fields: input.customFields || {},
          tags: input.tags || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw new Error('Failed to create portal customer: ${error.message}')
      return data
    },

    invitePortalCustomer: async (_: unknown, { portalId, email, groups }: { portalId: string, email: string, groups: string[] }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const inviteId = crypto.randomUUID()
      const inviteToken = crypto.randomBytes(32).toString('hex')

      const { data, error } = await supabase
        .from('customer_portals.customer_invites')
        .insert([{
          id: inviteId,
          business_id: context.businessId,
          portal_id: portalId,
          email: email,
          invite_token: inviteToken,
          group_ids: groups,
          status: 'SENT',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
          created_by: context.userId,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw new Error('Failed to create customer invite: ${error.message}')

      // In production, this would send an actual invitation email
      return {
        id: crypto.randomUUID(),
        email: email,
        username: email.split('@')[0],
        status: 'PENDING_VERIFICATION'
      }
    },

    // Document Management
    createCustomerDocument: async (_: unknown, { portalId, input }: { portalId: string, input: any }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const documentId = crypto.randomUUID()
      const filename = input.filename || 'document-${Date.now()}.pdf'
      const extension = input.filename ? input.filename.split('.').pop() : 'pdf'
      const checksum = crypto.createHash('sha256').update(input.fileUrl).digest('hex')

      const { data, error } = await supabase
        .from('customer_portals.documents')
        .insert([{
          id: documentId,
          business_id: context.businessId,
          portal_id: portalId,
          title: input.title,
          description: input.description,
          filename: filename,
          original_filename: input.filename || filename,
          document_type: input.documentType,
          category: input.category,
          subcategory: input.subcategory,
          file_size: input.fileSize,
          mime_type: input.mimeType,
          extension: extension,
          file_url: input.fileUrl,
          download_url: input.fileUrl,
          storage_provider: 'LOCAL',
          storage_path: '/documents/${portalId}/${filename}',
          visibility: input.visibility,
          access_level: input.accessLevel,
          customer_groups: input.customerGroupIds || [],
          specific_customers: input.specificCustomerIds || [],
          password_protected: input.passwordProtected || false,
          expiration_date: input.expirationDate,
          version: '1.0',
          version_history: [{
            version: '1.0',
            filename: filename,
            fileSize: input.fileSize,
            checksum: checksum,
            createdAt: new Date().toISOString(),
            createdBy: context.userId,
            notes: 'Initial version'
          }],
          checksum: checksum,
          encrypted: false,
          download_count: 0,
          view_count: 0,
          folder_id: input.folderId,
          ocr_processed: false,
          indexed_for_search: false,
          search_keywords: [],
          status: 'DRAFT',
          approval_required: false,
          tags: input.tags || [],
          custom_fields: input.customFields || {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw new Error('Failed to create customer document: ${error.message}')
      return data
    },

    publishDocument: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const { data, error } = await supabase
        .from('customer_portals.documents')
        .update({
          status: 'PUBLISHED',
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('business_id', context.businessId)
        .select()
        .single()

      if (error) throw new Error('Failed to publish document: ${error.message}')
      return data
    },

    // Messaging
    sendCustomerMessage: async (_: unknown, { portalId, input }: { portalId: string, input: any }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const messageId = crypto.randomUUID()
      const conversationId = input.conversationId || crypto.randomUUID()

      const { data, error } = await supabase
        .from('customer_portals.messages')
        .insert([{
          id: messageId,
          business_id: context.businessId,
          portal_id: portalId,
          subject: input.subject,
          message_type: input.messageType,
          conversation_id: conversationId,
          sender_id: context.userId,
          content: input.content,
          content_type: input.contentType || 'PLAIN_TEXT',
          plain_text_content: input.content,
          status: 'SENT',
          priority: input.priority || 'NORMAL',
          reply_to: input.replyToId,
          encrypted: false,
          requires_secure_reading: false,
          delivery_status: 'DELIVERED',
          attachments: input.attachments || [],
          inline_attachments: [],
          tags: input.tags || [],
          custom_fields: Record<string, unknown>,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw new Error('Failed to send customer message: ${error.message}')

      // Create recipient records
      if (input.recipientIds && input.recipientIds.length > 0) {
        const recipients = input.recipientIds.map((recipientId: string) => ({
          id: crypto.randomUUID(),
          message_id: messageId,
          recipient_id: recipientId,
          recipient_type: 'CUSTOMER',
          delivered_at: new Date().toISOString(),
          status: 'DELIVERED'
        }))

        await supabase
          .from('customer_portals.message_recipients')
          .insert(recipients)
      }

      return data
    },

    // Support Tickets
    createSupportTicket: async (_: unknown, { portalId, input }: { portalId: string, input: any }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const ticketId = crypto.randomUUID()
      const ticketNumber = 'TKT-${Date.now()}'

      const { data, error } = await supabase
        .from('customer_portals.support_tickets')
        .insert([{
          id: ticketId,
          business_id: context.businessId,
          portal_id: portalId,
          ticket_number: ticketNumber,
          title: input.title,
          description: input.description,
          ticket_type: input.ticketType,
          category: input.category,
          subcategory: input.subcategory,
          priority: input.priority || 'NORMAL',
          severity: input.severity || 'MODERATE',
          status: 'NEW',
          customer_id: context.userId, // Assuming customer is creating their own ticket
          contact_method: input.contactMethod,
          escalation_level: 0,
          sla_status: 'WITHIN_SLA',
          view_count: 0,
          update_count: 0,
          escalation_count: 0,
          reopen_count: 0,
          auto_responded: false,
          auto_assigned: false,
          triggered_workflows: [],
          attachments: input.attachments || [],
          tags: input.tags || [],
          custom_fields: input.customFields || {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw new Error('Failed to create support ticket: ${error.message}')
      return data
    },

    updateTicketStatus: async (_: unknown, { ticketId, status, notes }: { ticketId: string, status: string, notes?: string }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const updateData: unknown = {
        status,
        updated_at: new Date().toISOString()
      }

      if (status === 'RESOLVED') {
        updateData.resolved_at = new Date().toISOString()
      }

      if (status === 'CLOSED') {
        updateData.closed_at = new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('customer_portals.support_tickets')
        .update(updateData)
        .eq('id', ticketId)
        .eq('business_id', context.businessId)
        .select()
        .single()

      if (error) throw new Error('Failed to update ticket status: ${error.message}')

      // Add status change comment if notes provided
      if (notes) {
        await supabase
          .from('customer_portals.ticket_messages')
          .insert([{
            id: crypto.randomUUID(),
            ticket_id: ticketId,
            content: notes,
            message_type: 'STATUS_CHANGE',
            is_public: true,
            author_id: context.userId,
            author_name: 'Support Agent',
            author_email: 'support@thorbis.com',
            author_type: 'AGENT',
            created_at: new Date().toISOString()
          }])
      }

      return data
    },

    addTicketComment: async (_: unknown, { ticketId, content, isPublic }: { ticketId: string, content: string, isPublic: boolean }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const commentId = crypto.randomUUID()

      const { data, error } = await supabase
        .from('customer_portals.ticket_messages')
        .insert([{
          id: commentId,
          ticket_id: ticketId,
          content: content,
          message_type: 'COMMENT',
          is_public: isPublic,
          author_id: context.userId,
          author_name: 'User',
          author_email: 'user@example.com',
          author_type: 'CUSTOMER',
          attachments: [],
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw new Error('Failed to add ticket comment: ${error.message}')
      return data
    },

    // Customer Groups
    createCustomerGroup: async (_: unknown, { portalId, name, permissions }: { portalId: string, name: string, permissions: string[] }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const groupId = crypto.randomUUID()

      const { data, error } = await supabase
        .from('customer_portals.customer_groups')
        .insert([{
          id: groupId,
          business_id: context.businessId,
          portal_id: portalId,
          name: name,
          description: 'Customer group: ${name}',
          permissions: permissions,
          access_level: 'STANDARD',
          member_count: 0,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw new Error('Failed to create customer group: ${error.message}')
      return data
    },

    addCustomerToGroup: async (_: unknown, { customerId, groupId }: { customerId: string, groupId: string }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const { error } = await supabase
        .from('customer_portals.customer_group_members')
        .insert([{
          id: crypto.randomUUID(),
          customer_id: customerId,
          group_id: groupId,
          joined_at: new Date().toISOString()
        }])

      if (error) throw new Error('Failed to add customer to group: ${error.message}')
      return true
    },

    // Document Folders
    createDocumentFolder: async (_: unknown, { portalId, name, parentFolderId }: { portalId: string, name: string, parentFolderId?: string }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required`)
      }

      const folderId = crypto.randomUUID()
      const path = parentFolderId ? `/${name}' : '/${name}'

      const { data, error } = await supabase
        .from('customer_portals.document_folders')
        .insert([{
          id: folderId,
          business_id: context.businessId,
          portal_id: portalId,
          name: name,
          path: path,
          parent_folder_id: parentFolderId,
          permissions: ['VIEW', 'DOWNLOAD'],
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw new Error('Failed to create document folder: ${error.message}')
      return data
    },

    // Analytics and Tracking
    trackDocumentDownload: async (_: unknown, { documentId, customerId }: { documentId: string, customerId: string }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const downloadId = crypto.randomUUID()

      const { data, error } = await supabase
        .from('customer_portals.document_downloads')
        .insert([{
          id: downloadId,
          document_id: documentId,
          customer_id: customerId,
          ip_address: '0.0.0.0', // Would get from request
          user_agent: 'Unknown', // Would get from request
          downloaded_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw new Error('Failed to track document download: ${error.message}')

      // Update document download count
      await supabase
        .from('customer_portals.documents')
        .update({
          download_count: supabase.raw('download_count + 1'),
          last_accessed: new Date().toISOString()
        })
        .eq('id', documentId)

      return data
    }
  },

  // Field Resolvers
  CustomerPortal: {
    customers: async (parent: unknown, { pagination }: any) => {
      const limit = pagination?.first || 10
      const { data, error } = await supabase
        .from('customer_portals.customers')
        .select('*')
        .eq('portal_id', parent.id)
        .limit(limit)

      return error ? [] : data
    },

    documents: async (parent: unknown, { pagination }: any) => {
      const limit = pagination?.first || 10
      const { data, error } = await supabase
        .from('customer_portals.documents')
        .select('*')
        .eq('portal_id', parent.id)
        .limit(limit)

      return error ? [] : data
    },

    usageStats: (parent: unknown) => {
      return {
        dailyActiveUsers: 0,
        weeklyActiveUsers: 0,
        monthlyActiveUsers: 0,
        averageSessionDuration: 0,
        pageViews: 0,
        uniqueVisitors: 0,
        bounceRate: 0,
        conversionRate: 0
      }
    }
  },

  PortalCustomer: {
    portal: async (parent: unknown) => {
      const { data, error } = await supabase
        .from('customer_portals.portals')
        .select('*')
        .eq('id', parent.portal_id)
        .single()

      return error ? null : data
    },

    groups: async (parent: unknown) => {
      const { data, error } = await supabase
        .from('customer_portals.customer_group_members')
        .select('
          group:customer_portals.customer_groups!customer_group_members_group_id_fkey (*)
        ')
        .eq('customer_id', parent.id)

      return error ? [] : data.map((item: unknown) => item.group)
    },

    supportTickets: async (parent: unknown, { pagination }: any) => {
      const limit = pagination?.first || 10
      const { data, error } = await supabase
        .from('customer_portals.support_tickets')
        .select('*')
        .eq('customer_id', parent.id)
        .limit(limit)
        .order('created_at', { ascending: false })

      return error ? [] : data
    }
  },

  CustomerDocument: {
    portal: async (parent: unknown) => {
      const { data, error } = await supabase
        .from('customer_portals.portals')
        .select('*')
        .eq('id', parent.portal_id)
        .single()

      return error ? null : data
    },

    folder: async (parent: unknown) => {
      if (!parent.folder_id) return null
      
      const { data, error } = await supabase
        .from('customer_portals.document_folders')
        .select('*')
        .eq('id', parent.folder_id)
        .single()

      return error ? null : data
    }
  },

  SupportTicket: {
    customer: async (parent: unknown) => {
      const { data, error } = await supabase
        .from('customer_portals.customers')
        .select('*')
        .eq('id', parent.customer_id)
        .single()

      return error ? null : data
    },

    messages: async (parent: unknown) => {
      const { data, error } = await supabase
        .from('customer_portals.ticket_messages')
        .select('*')
        .eq('ticket_id', parent.id)
        .order('created_at')

      return error ? [] : data
    }
  }
}

export default customerPortalResolvers