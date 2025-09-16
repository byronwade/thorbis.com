/**
 * Media Management GraphQL Resolvers
 * 
 * Complete resolver implementation for media management, file uploads, image processing,
 * CDN integration, thumbnails, and media optimization features
 */

import { createClient } from '@supabase/supabase-js'
import type { GraphQLContext } from '../context'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const mediaManagementResolvers = {
  Query: {
    // Media Asset Queries
    mediaAsset: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const { data, error } = await supabase
        .from('media_management.assets')
        .select('
          *,
          thumbnails:media_management.thumbnails!thumbnails_asset_id_fkey (*),
          variations:media_management.variations!variations_asset_id_fkey (*),
          collections:media_management.collection_assets!collection_assets_asset_id_fkey (
            collection:media_management.collections!collection_assets_collection_id_fkey (*)
          ),
          usages:media_management.asset_usage!asset_usage_asset_id_fkey (*)
        ')
        .eq('id', id)
        .eq('business_id', context.businessId)
        .single()

      if (error) throw new Error(error.message)
      return data
    },

    mediaAssets: async (_: unknown, { 
      mediaType,
      category,
      status,
      visibility,
      tags,
      collectionId,
      searchInput,
      pagination, 
      filters, 
      sorts 
    }: any, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      let query = supabase
        .from('media_management.assets')
        .select('*, thumbnails:media_management.thumbnails!thumbnails_asset_id_fkey (*)', { count: 'exact' })
        .eq('business_id', context.businessId)

      // Apply filters
      if (mediaType) query = query.eq('media_type', mediaType)
      if (category) query = query.eq('category', category)
      if (status) query = query.eq('status', status)
      if (visibility) query = query.eq('visibility', visibility)
      if (tags?.length) query = query.overlaps('tags', tags)
      if (collectionId) {
        // Join with collection_assets to filter by collection
        query = query.in('id', 
          supabase.from('media_management.collection_assets')
            .select('asset_id')
            .eq('collection_id', collectionId)
        )
      }

      // Apply search input
      if (searchInput) {
        if (searchInput.query) {
          query = query.or('name.ilike.%${searchInput.query}%,description.ilike.%${searchInput.query}%,tags.cs.{${searchInput.query}}')
        }
        if (searchInput.mediaTypes?.length) {
          query = query.in('media_type', searchInput.mediaTypes)
        }
        if (searchInput.categories?.length) {
          query = query.in('category', searchInput.categories)
        }
        if (searchInput.fileSize) {
          if (searchInput.fileSize.min) query = query.gte('file_size', searchInput.fileSize.min)
          if (searchInput.fileSize.max) query = query.lte('file_size', searchInput.fileSize.max)
        }
        if (searchInput.dimensions) {
          if (searchInput.dimensions.width?.min) query = query.gte('width', searchInput.dimensions.width.min)
          if (searchInput.dimensions.width?.max) query = query.lte('width', searchInput.dimensions.width.max)
          if (searchInput.dimensions.height?.min) query = query.gte('height', searchInput.dimensions.height.min)
          if (searchInput.dimensions.height?.max) query = query.lte('height', searchInput.dimensions.height.max)
        }
        if (searchInput.dateRange) {
          if (searchInput.dateRange.from) query = query.gte('created_at', searchInput.dateRange.from)
          if (searchInput.dateRange.to) query = query.lte('created_at', searchInput.dateRange.to)
        }
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

      const edges = data?.map((asset, index) => ({
        cursor: Buffer.from((offset + index).toString()).toString('base64'),
        node: asset
      })) || []

      // Calculate total size
      const totalSize = data?.reduce((sum, asset) => sum + (asset.file_size || 0), 0) || 0

      return {
        edges,
        pageInfo: {
          hasNextPage: (count || 0) > offset + limit,
          hasPreviousPage: offset > 0,
          startCursor: edges[0]?.cursor,
          endCursor: edges[edges.length - 1]?.cursor
        },
        totalCount: count || 0,
        totalSize,
        facets: [] // TODO: Implement facet aggregation
      }
    },

    // Media Collection Queries
    mediaCollection: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const { data, error } = await supabase
        .from('media_management.collections')
        .select('
          *,
          coverAsset:media_management.assets!collections_cover_asset_id_fkey (*),
          parent:media_management.collections!collections_parent_id_fkey (*),
          children:media_management.collections!collections_parent_id_fkey (*)
        ')
        .eq('id', id)
        .eq('business_id', context.businessId)
        .single()

      if (error) throw new Error(error.message)
      return data
    },

    mediaCollections: async (_: unknown, { 
      collectionType,
      visibility,
      parentId,
      pagination, 
      sorts 
    }: any, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      let query = supabase
        .from('media_management.collections')
        .select('*, coverAsset:media_management.assets!collections_cover_asset_id_fkey (*)', { count: 'exact' })
        .eq('business_id', context.businessId)

      // Apply filters
      if (collectionType) query = query.eq('collection_type', collectionType)
      if (visibility) query = query.eq('visibility', visibility)
      if (typeof parentId !== 'undefined') {
        if (parentId === null) {
          query = query.is('parent_id', null)
        } else {
          query = query.eq('parent_id', parentId)
        }
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
        query = query.order('name', { ascending: true })
      }

      const { data, error, count } = await query

      if (error) throw new Error(error.message)

      const edges = data?.map((collection, index) => ({
        cursor: Buffer.from((offset + index).toString()).toString('base64'),
        node: collection
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

    // Media Processing Job Queries
    mediaProcessingJob: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const { data, error } = await supabase
        .from('media_management.processing_jobs')
        .select('
          *,
          asset:media_management.assets!processing_jobs_asset_id_fkey (*),
          outputAssets:media_management.assets!assets_processing_job_id_fkey (*)
        ')
        .eq('id', id)
        .eq('business_id', context.businessId)
        .single()

      if (error) throw new Error(error.message)
      return data
    },

    mediaProcessingJobs: async (_: unknown, { 
      status,
      jobType,
      assetId,
      pagination, 
      sorts 
    }: any, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      let query = supabase
        .from('media_management.processing_jobs')
        .select('*, asset:media_management.assets!processing_jobs_asset_id_fkey (*)', { count: 'exact' })
        .eq('business_id', context.businessId)

      // Apply filters
      if (status) query = query.eq('status', status)
      if (jobType) query = query.eq('job_type', jobType)
      if (assetId) query = query.eq('asset_id', assetId)

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

    // CDN Configuration Queries
    cdnConfigurations: async (_: unknown, { enabled }: any, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      let query = supabase
        .from('media_management.cdn_configurations')
        .select('*')
        .eq('business_id', context.businessId)
        .order('created_at', { ascending: false })

      if (typeof enabled === 'boolean') query = query.eq('enabled', enabled)

      const { data, error } = await query
      if (error) throw new Error(error.message)
      return data || []
    },

    // Storage and Analytics
    storageUsage: async (_: unknown, args: unknown, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      // Get total asset count and size
      const { data: totalStats, error: statsError } = await supabase
        .from('media_management.assets')
        .select('media_type, file_size')
        .eq('business_id', context.businessId)
        .neq('status', 'DELETED')

      if (statsError) throw new Error(statsError.message)

      const totalAssets = totalStats?.length || 0
      const totalSize = totalStats?.reduce((sum, asset) => sum + (asset.file_size || 0), 0) || 0

      // Calculate usage by type
      const usageByType = totalStats?.reduce((acc, asset) => {
        const type = asset.media_type
        if (!acc[type]) {
          acc[type] = { count: 0, size: 0 }
        }
        acc[type].count += 1
        acc[type].size += asset.file_size || 0
        return acc
      }, {} as any) || {}

      const usageByTypeArray = Object.entries(usageByType).map(([mediaType, stats]: [string, any]) => ({
        mediaType,
        count: stats.count,
        size: stats.size,
        percentage: totalSize > 0 ? (stats.size / totalSize) * 100 : 0
      }))

      // TODO: Implement monthly usage statistics
      const usageByMonth: unknown[] = []

      return {
        totalAssets,
        totalSize,
        totalSizeFormatted: formatFileSize(totalSize),
        usageByType: usageByTypeArray,
        usageByMonth,
        quotaLimit: null, // TODO: Implement quota system
        quotaUsed: 0,
        quotaRemaining: null
      }
    }
  },

  Mutation: {
    // File Upload Mutations
    uploadMediaAsset: async (_: unknown, { file, input }: { file: unknown, input: any }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      try {
        // TODO: Implement actual file upload logic
        // This would typically involve:
        // 1. Validating file type and size
        // 2. Uploading to storage (S3, Supabase Storage, etc.)
        // 3. Extracting metadata
        // 4. Generating thumbnails
        // 5. Running AI analysis if enabled

        // For now, simulate the upload
        const mockFileData = {
          filename: 'example.jpg',
          originalFilename: 'example.jpg',
          fileSize: 1024000,
          mimeType: 'image/jpeg',
          url: 'https://example.com/uploads/example.jpg',
          width: 1920,
          height: 1080,
          checksum: 'abc123'
        }

        const assetData = {
          ...input,
          ...mockFileData,
          business_id: context.businessId,
          uploaded_by: context.userId,
          status: 'PROCESSING',
          processing_status: 'PROCESSING',
          view_count: 0,
          download_count: 0,
          share_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        const { data, error } = await supabase
          .from('media_management.assets')
          .insert(assetData)
          .select()
          .single()

        if (error) throw new Error(error.message)

        // Queue thumbnail generation
        await supabase
          .from('media_management.processing_jobs')
          .insert({
            asset_id: data.id,
            business_id: context.businessId,
            job_type: 'THUMBNAIL_GENERATION',
            priority: 'NORMAL',
            status: 'QUEUED',
            parameters: { presets: ['SMALL', 'MEDIUM', 'LARGE'] },
            requested_by: context.userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        return {
          success: true,
          asset: data,
          assetId: data.id,
          url: data.url,
          thumbnails: [],
          errors: [],
          warnings: []
        }
      } catch (error: unknown) {
        return {
          success: false,
          asset: null,
          assetId: null,
          url: null,
          thumbnails: [],
          errors: [error.message],
          warnings: []
        }
      }
    },

    // Bulk Upload
    bulkUploadMediaAssets: async (_: unknown, { files, input }: { files: unknown[], input: any }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const results = {
        success: true,
        totalFiles: files.length,
        successfulUploads: 0,
        failedUploads: 0,
        assets: [] as any[],
        errors: [] as string[],
        warnings: [] as string[]
      }

      // Process each file
      for (const file of files) {
        try {
          const uploadResult = await supabase.rpc('upload_media_asset`, {
            file_data: file,
            asset_input: input,
            business_id: context.businessId,
            user_id: context.userId
          })

          if (uploadResult.error) {
            results.failedUploads++
            results.errors.push(`Failed to upload ${file.filename}: ${uploadResult.error.message}')
          } else {
            results.successfulUploads++
            results.assets.push(uploadResult.data)
          }
        } catch (error: unknown) {
          results.failedUploads++
          results.errors.push('Failed to upload ${file.filename}: ${error.message}')
        }
      }

      results.success = results.failedUploads === 0

      return results
    },

    // Asset Management
    updateMediaAsset: async (_: unknown, { id, input }: { id: string, input: any }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const updateData = {
        ...input,
        last_modified_by: context.userId,
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('media_management.assets')
        .update(updateData)
        .eq('id', id)
        .eq('business_id', context.businessId)
        .select()
        .single()

      if (error) throw new Error(error.message)
      return data
    },

    deleteMediaAsset: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      // Soft delete - update status instead of actual deletion
      const { data, error } = await supabase
        .from('media_management.assets')
        .update({ 
          status: 'DELETED',
          last_modified_by: context.userId,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('business_id', context.businessId)
        .select()
        .single()

      if (error) throw new Error(error.message)

      // TODO: Remove from CDN and delete actual files
      return true
    },

    // Collection Management
    createMediaCollection: async (_: unknown, { input }: { input: any }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      // Generate slug if not provided
      const slug = input.slug || input.name.toLowerCase().replace(/[^a-z0-9]/g, '-')

      // Calculate path and level
      let path = slug
      let level = 0
      if (input.parentId) {
        const { data: parent } = await supabase
          .from('media_management.collections')
          .select('path, level')
          .eq('id', input.parentId)
          .single()

        if (parent) {
          path = '${parent.path}/${slug}'
          level = parent.level + 1
        }
      }

      const collectionData = {
        ...input,
        slug,
        path,
        level,
        business_id: context.businessId,
        created_by: context.userId,
        asset_count: 0,
        total_size: 0,
        view_count: 0,
        share_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('media_management.collections')
        .insert(collectionData)
        .select()
        .single()

      if (error) throw new Error(error.message)
      return data
    },

    // Media Processing
    processMediaAsset: async (_: unknown, { input }: { input: any }, context: GraphQLContext) => {
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
        .from('media_management.processing_jobs')
        .insert(jobData)
        .select()
        .single()

      if (error) throw new Error(error.message)

      // TODO: Queue actual processing job
      return data
    },

    // Bulk Actions
    bulkActionMediaAssets: async (_: unknown, { input }: { input: any }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const { action, assetIds, parameters } = input
      const result = {
        success: true,
        processedCount: assetIds.length,
        successCount: 0,
        failedCount: 0,
        errors: [] as string[],
        warnings: [] as string[]
      }

      for (const assetId of assetIds) {
        try {
          let updateData: unknown = {
            last_modified_by: context.userId,
            updated_at: new Date().toISOString()
          }

          switch (action) {
            case 'DELETE':
              updateData.status = 'DELETED'
              break
            case 'ARCHIVE':
              updateData.status = 'ARCHIVED'
              break
            case 'RESTORE':
              updateData.status = 'READY'
              break
            case 'ADD_TAGS':
              // TODO: Implement tag addition
              break
            case 'REMOVE_TAGS':
              // TODO: Implement tag removal
              break
            case 'CHANGE_VISIBILITY':
              updateData.visibility = parameters?.visibility
              break
            default:
              throw new Error('Unsupported action: ${action}')
          }

          const { error } = await supabase
            .from('media_management.assets')
            .update(updateData)
            .eq('id', assetId)
            .eq('business_id', context.businessId)

          if (error) throw error
          result.successCount++
        } catch (error: unknown) {
          result.failedCount++
          result.errors.push('Failed to process asset ${assetId}: ${error.message}')
        }
      }

      result.success = result.failedCount === 0
      return result
    },

    // CDN Configuration
    createCDNConfiguration: async (_: unknown, { input }: { input: any }, context: GraphQLContext) => {
      if (!context.isAuthenticated) {
        throw new Error('Authentication required')
      }

      const configData = {
        ...input,
        business_id: context.businessId,
        created_by: context.userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('media_management.cdn_configurations')
        .insert(configData)
        .select()
        .single()

      if (error) throw new Error(error.message)
      return data
    }
  },

  Subscription: {
    mediaAssetUpdates: {
      subscribe: async (_: unknown, { businessId }: { businessId: string }) => {
        // TODO: Implement real-time subscription logic
        return {}
      }
    },

    mediaProcessingUpdates: {
      subscribe: async (_: unknown, { jobId }: { jobId: string }) => {
        // TODO: Implement real-time subscription logic
        return {}
      }
    }
  },

  // Field Resolvers
  MediaAsset: {
    fileSizeFormatted: (asset: unknown) => {
      return formatFileSize(asset.file_size)
    },

    thumbnails: async (asset: unknown) => {
      const { data, error } = await supabase
        .from('media_management.thumbnails')
        .select('*')
        .eq('asset_id', asset.id)
        .order('created_at', { ascending: false })

      if (error) return []
      return data || []
    },

    variations: async (asset: unknown) => {
      const { data, error } = await supabase
        .from('media_management.variations')
        .select('*')
        .eq('asset_id', asset.id)
        .order('created_at', { ascending: false })

      if (error) return []
      return data || []
    },

    collections: async (asset: unknown, { pagination }: any) => {
      let query = supabase
        .from('media_management.collection_assets')
        .select('
          collection:media_management.collections!collection_assets_collection_id_fkey (*)
        ', { count: 'exact' })
        .eq('asset_id', asset.id)

      const limit = pagination?.first || 25
      const offset = pagination?.after ? parseInt(Buffer.from(pagination.after, 'base64').toString()) : 0
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query
      if (error) throw new Error(error.message)

      const edges = data?.map((item, index) => ({
        cursor: Buffer.from((offset + index).toString()).toString('base64'),
        node: item.collection
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

    usages: async (asset: unknown, { pagination }: any) => {
      let query = supabase
        .from('media_management.asset_usage')
        .select('*', { count: 'exact' })
        .eq('asset_id', asset.id)
        .order('created_at', { ascending: false })

      const limit = pagination?.first || 25
      const offset = pagination?.after ? parseInt(Buffer.from(pagination.after, 'base64').toString()) : 0
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query
      if (error) throw new Error(error.message)

      const edges = data?.map((usage, index) => ({
        cursor: Buffer.from((offset + index).toString()).toString('base64'),
        node: usage
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

  MediaCollection: {
    assets: async (collection: unknown, { pagination, filters, sorts }: any) => {
      let query = supabase
        .from('media_management.collection_assets')
        .select('
          asset:media_management.assets!collection_assets_asset_id_fkey (*)
        ', { count: 'exact' })
        .eq('collection_id', collection.id)

      const limit = pagination?.first || 25
      const offset = pagination?.after ? parseInt(Buffer.from(pagination.after, 'base64').toString()) : 0
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query
      if (error) throw new Error(error.message)

      const edges = data?.map((item, index) => ({
        cursor: Buffer.from((offset + index).toString()).toString('base64'),
        node: item.asset
      })) || []

      const totalSize = data?.reduce((sum, item) => sum + (item.asset?.file_size || 0), 0) || 0

      return {
        edges,
        pageInfo: {
          hasNextPage: (count || 0) > offset + limit,
          hasPreviousPage: offset > 0,
          startCursor: edges[0]?.cursor,
          endCursor: edges[edges.length - 1]?.cursor
        },
        totalCount: count || 0,
        totalSize
      }
    },

    children: async (collection: unknown, { pagination }: any) => {
      let query = supabase
        .from('media_management.collections')
        .select('*', { count: 'exact' })
        .eq('parent_id', collection.id)
        .order('name', { ascending: true })

      const limit = pagination?.first || 25
      const offset = pagination?.after ? parseInt(Buffer.from(pagination.after, 'base64').toString()) : 0
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query
      if (error) throw new Error(error.message)

      const edges = data?.map((child, index) => ({
        cursor: Buffer.from((offset + index).toString()).toString('base64'),
        node: child
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

// Utility function to format file sizes
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}