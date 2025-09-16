/**
 * Document Management GraphQL Resolvers
 * 
 * Complete resolver implementation for document management, templates, PDF generation,
 * digital signatures, versioning, and collaboration features
 */

import { createClient } from '@supabase/supabase-js'
import type { GraphQLContext } from '../context'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const documentManagementResolvers = {
  Query: {
    // Document Queries
    document: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const { data, error } = await supabase
        .from('document_management.documents')
        .select('
          *,
          template:document_management.templates!documents_template_id_fkey (*),
          parent:document_management.documents!documents_parent_id_fkey (*),
          versions:document_management.document_versions!document_versions_document_id_fkey (*),
          signatures:document_management.digital_signatures!digital_signatures_document_id_fkey (*),
          collaborators:document_management.document_collaborators!document_collaborators_document_id_fkey (*),
          comments:document_management.document_comments!document_comments_document_id_fkey (*),
          attachments:document_management.document_attachments!document_attachments_document_id_fkey (*)
        ')
        .eq('id', id)
        .eq('business_id', context.businessId)
        .single()

      if (error) throw new Error(error.message)
      return data
    },

    documents: async (_: unknown, { 
      documentType,
      category,
      status,
      visibility,
      templateId,
      tags,
      dateRange,
      pagination, 
      filters, 
      sorts 
    }: any, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      let query = supabase
        .from('document_management.documents')
        .select('*, template:document_management.templates!documents_template_id_fkey (*)', { count: 'exact' })
        .eq('business_id', context.businessId)

      // Apply filters
      if (documentType) query = query.eq('document_type', documentType)
      if (category) query = query.eq('category', category)
      if (status) query = query.eq('status', status)
      if (visibility) query = query.eq('visibility', visibility)
      if (templateId) query = query.eq('template_id', templateId)
      if (tags?.length) query = query.overlaps('tags', tags)
      if (dateRange) {
        if (dateRange.from) query = query.gte('created_at', dateRange.from)
        if (dateRange.to) query = query.lte('created_at', dateRange.to)
      }

      // Apply pagination
      const limit = pagination?.first || 25
      const offset = pagination?.after ? parseInt(Buffer.from(pagination.after, 'base64').toString()) : 0
      query = query.range(offset, offset + limit - 1)

      // Apply sorts
      if (sorts?.length) {
        sorts.forEach((sort: unknown) => {
          query = query.order(sort.field, { ascending: sort.direction === 'ASC' })
        })
      } else {
        query = query.order('updated_at', { ascending: false })
      }

      const { data, error, count } = await query

      if (error) throw new Error(error.message)

      const edges = data?.map((document, index) => ({
        cursor: Buffer.from((offset + index).toString()).toString('base64'),
        node: document
      })) || []

      return {
        edges,
        pageInfo: {
          hasNextPage: (count || 0) > offset + limit,
          hasPreviousPage: offset > 0,
          startCursor: edges[0]?.cursor,
          endCursor: edges[edges.length - 1]?.cursor
        },
        totalCount: count || 0,
        facets: [] // TODO: Implement facet aggregation
      }
    },

    // Document Template Queries
    documentTemplate: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const { data, error } = await supabase
        .from('document_management.templates')
        .select('
          *,
          documents:document_management.documents!documents_template_id_fkey (count)
        ')
        .eq('id', id)
        .eq('business_id', context.businessId)
        .single()

      if (error) throw new Error(error.message)
      return data
    },

    documentTemplates: async (_: unknown, { 
      templateType,
      category,
      format,
      status,
      isPublic,
      pagination, 
      filters, 
      sorts 
    }: any, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      let query = supabase
        .from('document_management.templates')
        .select('*, documents:document_management.documents!documents_template_id_fkey (count)', { count: 'exact' })
        .eq('business_id', context.businessId)

      // Apply filters
      if (templateType) query = query.eq('template_type', templateType)
      if (category) query = query.eq('category', category)
      if (format) query = query.eq('format', format)
      if (status) query = query.eq('status', status)
      if (typeof isPublic === 'boolean') query = query.eq('is_public', isPublic)

      // Apply pagination
      const limit = pagination?.first || 25
      const offset = pagination?.after ? parseInt(Buffer.from(pagination.after, 'base64').toString()) : 0
      query = query.range(offset, offset + limit - 1)

      // Apply sorts
      if (sorts?.length) {
        sorts.forEach((sort: unknown) => {
          query = query.order(sort.field, { ascending: sort.direction === 'ASC' })
        })
      } else {
        query = query.order('updated_at', { ascending: false })
      }

      const { data, error, count } = await query

      if (error) throw new Error(error.message)

      const edges = data?.map((template, index) => ({
        cursor: Buffer.from((offset + index).toString()).toString('base64'),
        node: template
      })) || []

      return {
        edges,
        pageInfo: {
          hasNextPage: (count || 0) > offset + limit,
          hasPreviousPage: offset > 0,
          startCursor: edges[0]?.cursor,
          endCursor: edges[edges.length - 1]?.cursor
        },
        totalCount: count || 0
      }
    },

    // Digital Signature Queries
    digitalSignature: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const { data, error } = await supabase
        .from('document_management.digital_signatures')
        .select('*')
        .eq('id', id)
        .eq('business_id', context.businessId)
        .single()

      if (error) throw new Error(error.message)
      return data
    },

    // PDF Generation Job Queries
    pdfGenerationJob: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const { data, error } = await supabase
        .from('document_management.pdf_generation_jobs')
        .select('
          *,
          template:document_management.templates!pdf_generation_jobs_template_id_fkey (*),
          document:document_management.documents!pdf_generation_jobs_document_id_fkey (*)
        ')
        .eq('id', id)
        .eq('business_id', context.businessId)
        .single()

      if (error) throw new Error(error.message)
      return data
    },

    pdfGenerationJobs: async (_: unknown, { 
      status,
      templateId,
      pagination, 
      sorts 
    }: any, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      let query = supabase
        .from('document_management.pdf_generation_jobs')
        .select('*, template:document_management.templates!pdf_generation_jobs_template_id_fkey (*)', { count: 'exact' })
        .eq('business_id', context.businessId)

      // Apply filters
      if (status) query = query.eq('status', status)
      if (templateId) query = query.eq('template_id', templateId)

      // Apply pagination
      const limit = pagination?.first || 25
      const offset = pagination?.after ? parseInt(Buffer.from(pagination.after, 'base64').toString()) : 0
      query = query.range(offset, offset + limit - 1)

      // Apply sorts
      if (sorts?.length) {
        sorts.forEach((sort: unknown) => {
          query = query.order(sort.field, { ascending: sort.direction === 'ASC' })
        })
      } else {
        query = query.order('created_at', { ascending: false })
      }

      const { data, error, count } = await query

      if (error) throw new Error(error.message)

      const edges = data?.map((job, index) => ({
        cursor: Buffer.from((offset + index).toString()).toString('base64'),
        node: job
      })) || []

      return {
        edges,
        pageInfo: {
          hasNextPage: (count || 0) > offset + limit,
          hasPreviousPage: offset > 0,
          startCursor: edges[0]?.cursor,
          endCursor: edges[edges.length - 1]?.cursor
        },
        totalCount: count || 0
      }
    },

    // Retention Policy Queries
    retentionPolicies: async (_: unknown, { status, policyType }: any, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      let query = supabase
        .from('document_management.retention_policies')
        .select('*')
        .eq('business_id', context.businessId)
        .order('created_at', { ascending: false })

      if (status) query = query.eq('status', status)
      if (policyType) query = query.eq('policy_type', policyType)

      const { data, error } = await query
      if (error) throw new Error(error.message)
      return data || []
    }
  },

  Mutation: {
    // Document Mutations
    createDocument: async (_: unknown, { input }: { input: any }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const documentData = {
        ...input,
        business_id: context.businessId,
        created_by: context.userId,
        updated_by: context.userId,
        version: '1.0',
        is_latest_version: true,
        view_count: 0,
        download_count: 0,
        share_count: 0,
        processing_status: 'PENDING',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('document_management.documents')
        .insert(documentData)
        .select()
        .single()

      if (error) throw new Error(error.message)

      // Create audit entry
      await supabase
        .from('document_management.audit_entries')
        .insert({
          document_id: data.id,
          action: 'CREATED',
          user_id: context.userId,
          timestamp: new Date().toISOString(),
          details: { initial_creation: true }
        })

      return data
    },

    updateDocument: async (_: unknown, { id, input }: { id: string, input: any }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      // Get current document for audit trail
      const { data: currentDoc } = await supabase
        .from('document_management.documents')
        .select('*')
        .eq('id', id)
        .eq('business_id', context.businessId)
        .single()

      const updateData = {
        ...input,
        updated_by: context.userId,
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('document_management.documents')
        .update(updateData)
        .eq('id', id)
        .eq('business_id', context.businessId)
        .select()
        .single()

      if (error) throw new Error(error.message)

      // Create audit entry
      await supabase
        .from('document_management.audit_entries')
        .insert({
          document_id: id,
          action: 'UPDATED',
          user_id: context.userId,
          timestamp: new Date().toISOString(),
          before_state: currentDoc,
          after_state: data,
          details: { fields_changed: Object.keys(input) }
        })

      return data
    },

    deleteDocument: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      // Soft delete - update status instead of actual deletion
      const { data, error } = await supabase
        .from('document_management.documents')
        .update({ 
          status: 'DELETED',
          updated_by: context.userId,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('business_id', context.businessId)
        .select()
        .single()

      if (error) throw new Error(error.message)

      // Create audit entry
      await supabase
        .from('document_management.audit_entries')
        .insert({
          document_id: id,
          action: 'DELETED',
          user_id: context.userId,
          timestamp: new Date().toISOString(),
          details: { soft_delete: true }
        })

      return true
    },

    // Document Template Mutations
    createDocumentTemplate: async (_: unknown, { input }: { input: any }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const templateData = {
        ...input,
        business_id: context.businessId,
        created_by: context.userId,
        version: '1.0',
        usage_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('document_management.templates')
        .insert(templateData)
        .select()
        .single()

      if (error) throw new Error(error.message)
      return data
    },

    updateDocumentTemplate: async (_: unknown, { id, input }: { id: string, input: any }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const updateData = {
        ...input,
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('document_management.templates')
        .update(updateData)
        .eq('id', id)
        .eq('business_id', context.businessId)
        .select()
        .single()

      if (error) throw new Error(error.message)
      return data
    },

    // Document Generation
    generateDocumentFromTemplate: async (_: unknown, { templateId, parameters, documentInput }: { templateId: string, parameters: unknown, documentInput?: any }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      try {
        // Get template
        const { data: template, error: templateError } = await supabase
          .from('document_management.templates')
          .select('*')
          .eq('id', templateId)
          .eq('business_id', context.businessId)
          .single()

        if (templateError) throw new Error(templateError.message)

        // Create document
        const documentData = {
          ...documentInput,
          business_id: context.businessId,
          template_id: templateId,
          document_type: template.template_type,
          category: template.category,
          industry: template.industry,
          status: 'DRAFT',
          processing_status: 'PROCESSING',
          created_by: context.userId,
          updated_by: context.userId,
          version: '1.0',
          is_latest_version: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        const { data: document, error: docError } = await supabase
          .from('document_management.documents')
          .insert(documentData)
          .select()
          .single()

        if (docError) throw new Error(docError.message)

        // Update template usage count
        await supabase
          .from('document_management.templates')
          .update({ 
            usage_count: template.usage_count + 1,
            last_used_at: new Date().toISOString()
          })
          .eq('id', templateId)

        // TODO: Implement actual document generation logic
        // This would involve processing the template with parameters
        // and generating the final document content

        return {
          success: true,
          documentId: document.id,
          document,
          errors: []
        }
      } catch (error) {
        return {
          success: false,
          documentId: null,
          document: null,
          errors: [error.message]
        }
      }
    },

    // PDF Generation
    generatePDF: async (_: unknown, { input }: { input: any }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const jobData = {
        ...input,
        business_id: context.businessId,
        status: 'QUEUED',
        progress: 0,
        retry_count: 0,
        max_retries: 3,
        requested_by: context.userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('document_management.pdf_generation_jobs')
        .insert(jobData)
        .select()
        .single()

      if (error) throw new Error(error.message)

      // TODO: Queue actual PDF generation job
      // This would typically involve:
      // 1. Adding job to a queue (Redis, Bull, etc.)
      // 2. Processing the template with parameters
      // 3. Generating PDF using a library like Puppeteer or wkhtmltopdf
      // 4. Uploading to storage
      // 5. Updating job status

      return data
    },

    // Digital Signatures
    requestDigitalSignature: async (_: unknown, { documentId, input }: { documentId: string, input: any }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const signatureData = {
        document_id: documentId,
        ...input,
        business_id: context.businessId,
        status: 'PENDING',
        verification_status: 'UNVERIFIED',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('document_management.digital_signatures')
        .insert(signatureData)
        .select()
        .single()

      if (error) throw new Error(error.message)

      // TODO: Generate signature request URL and send notification
      const requestUrl = '${process.env.NEXT_PUBLIC_APP_URL}/sign/${data.id}'
      const expirationDate = new Date()
      expirationDate.setDate(expirationDate.getDate() + 30) // 30 days expiration

      return {
        success: true,
        signatureId: data.id,
        signature: data,
        requestUrl,
        expirationDate: expirationDate.toISOString(),
        errors: []
      }
    },

    // Document Collaboration
    addDocumentCollaborator: async (_: unknown, { documentId, input }: { documentId: string, input: any }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const collaboratorData = {
        document_id: documentId,
        ...input,
        business_id: context.businessId,
        status: 'INVITED',
        invited_by: context.userId,
        invited_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('document_management.document_collaborators')
        .insert(collaboratorData)
        .select()
        .single()

      if (error) throw new Error(error.message)

      // TODO: Send collaboration invitation
      return data
    },

    // Document Comments
    addDocumentComment: async (_: unknown, { documentId, input }: { documentId: string, input: any }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const commentData = {
        document_id: documentId,
        ...input,
        business_id: context.businessId,
        created_by: context.userId,
        status: 'OPEN',
        resolved: false,
        thread_id: input.parentId || 'thread_${Date.now()}',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('document_management.document_comments')
        .insert(commentData)
        .select()
        .single()

      if (error) throw new Error(error.message)

      // TODO: Send notifications to mentions and collaborators
      return data
    },

    // Document Versioning
    createDocumentVersion: async (_: unknown, { documentId, changeType, changeDescription }: { documentId: string, changeType: string, changeDescription?: string }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      // Get current document
      const { data: currentDoc, error: docError } = await supabase
        .from('document_management.documents')
        .select('*')
        .eq('id', documentId)
        .eq('business_id', context.businessId)
        .single()

      if (docError) throw new Error(docError.message)

      // Get current version number
      const { data: versions } = await supabase
        .from('document_management.document_versions')
        .select('version_number')
        .eq('document_id', documentId)
        .order('version_number', { ascending: false })
        .limit(1)

      const nextVersionNumber = (versions?.[0]?.version_number || 0) + 1
      const nextVersion = '${Math.floor(nextVersionNumber / 100)}.${nextVersionNumber % 100}'

      const versionData = {
        document_id: documentId,
        version: nextVersion,
        version_number: nextVersionNumber,
        change_type: changeType,
        change_description: changeDescription,
        file_url: currentDoc.file_url,
        file_size: currentDoc.file_size,
        checksum: currentDoc.checksum,
        status: 'ACTIVE',
        is_current: true,
        created_by: context.userId,
        created_at: new Date().toISOString()
      }

      // Mark previous versions as not current
      await supabase
        .from('document_management.document_versions')
        .update({ is_current: false })
        .eq('document_id', documentId)

      const { data, error } = await supabase
        .from('document_management.document_versions')
        .insert(versionData)
        .select()
        .single()

      if (error) throw new Error(error.message)

      // Update document version
      await supabase
        .from('document_management.documents')
        .update({ 
          version: nextVersion,
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId)

      return data
    },

    // Retention Policy
    createRetentionPolicy: async (_: unknown, { input }: { input: any }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const policyData = {
        ...input,
        business_id: context.businessId,
        applied_documents: 0,
        created_by: context.userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('document_management.retention_policies')
        .insert(policyData)
        .select()
        .single()

      if (error) throw new Error(error.message)
      return data
    }
  },

  Subscription: {
    documentUpdates: {
      subscribe: async (_: unknown, { businessId }: { businessId: string }) => {
        // TODO: Implement real-time subscription logic
        return {}
      }
    },

    documentCommentUpdates: {
      subscribe: async (_: unknown, { documentId }: { documentId: string }) => {
        // TODO: Implement real-time subscription logic
        return {}
      }
    },

    pdfGenerationUpdates: {
      subscribe: async (_: unknown, { jobId }: { jobId: string }) => {
        // TODO: Implement real-time subscription logic
        return {}
      }
    }
  },

  // Field Resolvers
  Document: {
    template: async (document: unknown) => {
      if (!document.template_id) return null

      const { data, error } = await supabase
        .from('document_management.templates')
        .select('*')
        .eq('id', document.template_id)
        .single()

      if (error) return null
      return data
    },

    versions: async (document: unknown, { pagination }: any) => {
      let query = supabase
        .from('document_management.document_versions')
        .select('*', { count: 'exact' })
        .eq('document_id', document.id)
        .order('version_number', { ascending: false })

      const limit = pagination?.first || 25
      const offset = pagination?.after ? parseInt(Buffer.from(pagination.after, 'base64').toString()) : 0
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query
      if (error) throw new Error(error.message)

      const edges = data?.map((version, index) => ({
        cursor: Buffer.from((offset + index).toString()).toString('base64'),
        node: version
      })) || []

      return {
        edges,
        pageInfo: {
          hasNextPage: (count || 0) > offset + limit,
          hasPreviousPage: offset > 0,
          startCursor: edges[0]?.cursor,
          endCursor: edges[edges.length - 1]?.cursor
        },
        totalCount: count || 0
      }
    },

    signatures: async (document: unknown, { pagination }: any) => {
      let query = supabase
        .from('document_management.digital_signatures')
        .select('*', { count: 'exact' })
        .eq('document_id', document.id)
        .order('created_at', { ascending: false })

      const limit = pagination?.first || 25
      const offset = pagination?.after ? parseInt(Buffer.from(pagination.after, 'base64').toString()) : 0
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query
      if (error) throw new Error(error.message)

      const edges = data?.map((signature, index) => ({
        cursor: Buffer.from((offset + index).toString()).toString('base64'),
        node: signature
      })) || []

      return {
        edges,
        pageInfo: {
          hasNextPage: (count || 0) > offset + limit,
          hasPreviousPage: offset > 0,
          startCursor: edges[0]?.cursor,
          endCursor: edges[edges.length - 1]?.cursor
        },
        totalCount: count || 0
      }
    },

    collaborators: async (document: unknown, { pagination }: any) => {
      let query = supabase
        .from('document_management.document_collaborators')
        .select('*', { count: 'exact' })
        .eq('document_id', document.id)
        .order('created_at', { ascending: false })

      const limit = pagination?.first || 25
      const offset = pagination?.after ? parseInt(Buffer.from(pagination.after, 'base64').toString()) : 0
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query
      if (error) throw new Error(error.message)

      const edges = data?.map((collaborator, index) => ({
        cursor: Buffer.from((offset + index).toString()).toString('base64'),
        node: collaborator
      })) || []

      return {
        edges,
        pageInfo: {
          hasNextPage: (count || 0) > offset + limit,
          hasPreviousPage: offset > 0,
          startCursor: edges[0]?.cursor,
          endCursor: edges[edges.length - 1]?.cursor
        },
        totalCount: count || 0
      }
    },

    comments: async (document: unknown, { pagination }: any) => {
      let query = supabase
        .from('document_management.document_comments')
        .select('*', { count: 'exact' })
        .eq('document_id', document.id)
        .order('created_at', { ascending: false })

      const limit = pagination?.first || 25
      const offset = pagination?.after ? parseInt(Buffer.from(pagination.after, 'base64').toString()) : 0
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query
      if (error) throw new Error(error.message)

      const edges = data?.map((comment, index) => ({
        cursor: Buffer.from((offset + index).toString()).toString('base64'),
        node: comment
      })) || []

      return {
        edges,
        pageInfo: {
          hasNextPage: (count || 0) > offset + limit,
          hasPreviousPage: offset > 0,
          startCursor: edges[0]?.cursor,
          endCursor: edges[edges.length - 1]?.cursor
        },
        totalCount: count || 0
      }
    },

    attachments: async (document: unknown, { pagination }: any) => {
      let query = supabase
        .from('document_management.document_attachments')
        .select('*', { count: 'exact' })
        .eq('document_id', document.id)
        .order('created_at', { ascending: false })

      const limit = pagination?.first || 25
      const offset = pagination?.after ? parseInt(Buffer.from(pagination.after, 'base64').toString()) : 0
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query
      if (error) throw new Error(error.message)

      const edges = data?.map((attachment, index) => ({
        cursor: Buffer.from((offset + index).toString()).toString('base64'),
        node: attachment
      })) || []

      return {
        edges,
        pageInfo: {
          hasNextPage: (count || 0) > offset + limit,
          hasPreviousPage: offset > 0,
          startCursor: edges[0]?.cursor,
          endCursor: edges[edges.length - 1]?.cursor
        },
        totalCount: count || 0
      }
    }
  },

  DocumentTemplate: {
    documents: async (template: unknown, { pagination, filters }: any) => {
      let query = supabase
        .from('document_management.documents')
        .select('*', { count: 'exact' })
        .eq('template_id', template.id)
        .order('updated_at', { ascending: false })

      const limit = pagination?.first || 25
      const offset = pagination?.after ? parseInt(Buffer.from(pagination.after, 'base64').toString()) : 0
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query
      if (error) throw new Error(error.message)

      const edges = data?.map((document, index) => ({
        cursor: Buffer.from((offset + index).toString()).toString('base64'),
        node: document
      })) || []

      return {
        edges,
        pageInfo: {
          hasNextPage: (count || 0) > offset + limit,
          hasPreviousPage: offset > 0,
          startCursor: edges[0]?.cursor,
          endCursor: edges[edges.length - 1]?.cursor
        },
        totalCount: count || 0
      }
    }
  },

  DocumentComment: {
    replies: async (comment: unknown, { pagination }: any) => {
      let query = supabase
        .from('document_management.document_comments')
        .select('*', { count: 'exact' })
        .eq('parent_id', comment.id)
        .order('created_at', { ascending: true })

      const limit = pagination?.first || 25
      const offset = pagination?.after ? parseInt(Buffer.from(pagination.after, 'base64').toString()) : 0
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query
      if (error) throw new Error(error.message)

      const edges = data?.map((reply, index) => ({
        cursor: Buffer.from((offset + index).toString()).toString('base64'),
        node: reply
      })) || []

      return {
        edges,
        pageInfo: {
          hasNextPage: (count || 0) > offset + limit,
          hasPreviousPage: offset > 0,
          startCursor: edges[0]?.cursor,
          endCursor: edges[edges.length - 1]?.cursor
        },
        totalCount: count || 0
      }
    }
  }
}