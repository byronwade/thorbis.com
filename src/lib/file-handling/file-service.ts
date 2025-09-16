import { 
  FileMetadata, 
  FileUploadOptions, 
  UploadContext,
  generateSecureFilename,
  calculateChecksum
} from './file-types'
import { api } from '@/lib/error-handling/api-error-handler'
import { 
  DatabaseError, 
  NotFoundError, 
  ValidationError,
  FileError
} from '@/lib/error-handling/error-types'

export class FileService {
  private static baseUrl = '/api/files'

  // Upload a single file
  static async uploadFile(
    file: File, 
    options: FileUploadOptions
  ): Promise<FileMetadata> {
    try {
      const formData = new FormData()
      
      // Add file
      formData.append('file', file)
      
      // Add metadata
      formData.append('context', options.context)
      if (options.entityId) formData.append('entityId', options.entityId)
      if (options.entityType) formData.append('entityType', options.entityType)
      if (options.description) formData.append('description', options.description)
      if (options.tags) formData.append('tags', JSON.stringify(options.tags))
      if (options.isPublic !== undefined) formData.append('isPublic', String(options.isPublic))
      if (options.generateThumbnail !== undefined) formData.append('generateThumbnail', String(options.generateThumbnail))

      const metadata = await api.post<FileMetadata>('${this.baseUrl}/upload', formData, {
        headers: {
          // Don't set Content-Type - let browser set it with boundary for FormData'
        }
      })

      return metadata
    } catch (_error) {
      throw new FileError('Failed to upload file', 'upload', file.name, { originalError: error })
    }
  }

  // Upload multiple files
  static async uploadFiles(
    files: File[], 
    options: FileUploadOptions
  ): Promise<FileMetadata[]> {
    try {
      // Upload files in parallel (could be configurable)
      const uploadPromises = files.map(file => this.uploadFile(file, options))
      return await Promise.all(uploadPromises)
    } catch (_error) {
      throw new FileError('Failed to upload files', 'batch_upload', undefined, { 
        fileCount: files.length,
        originalError: error 
      })
    }
  }

  // Get file by ID
  static async getFile(fileId: string): Promise<FileMetadata> {
    try {
      return await api.get<FileMetadata>('${this.baseUrl}/${fileId}')
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        throw new NotFoundError('File', fileId)
      }
      throw new FileError('Failed to retrieve file', 'get', undefined, { fileId, originalError: error })
    }
  }

  // Get files by context and entity
  static async getFilesByEntity(
    context: UploadContext,
    entityId: string,
    entityType?: string
  ): Promise<FileMetadata[]> {
    try {
      const params = new URLSearchParams({
        context,
        entityId
      })
      
      if (entityType) {
        params.append('entityType', entityType)
      }

      return await api.get<FileMetadata[]>('${this.baseUrl}?${params}')
    } catch (_error) {
      throw new FileError('Failed to retrieve files', 'list', undefined, { 
        context, 
        entityId, 
        entityType,
        originalError: error 
      })
    }
  }

  // Update file metadata
  static async updateFile(
    fileId: string,
    updates: Partial<Pick<FileMetadata, 'description' | 'tags' | 'isPublic'>>
  ): Promise<FileMetadata> {
    try {
      return await api.patch<FileMetadata>('${this.baseUrl}/${fileId}', updates)
    } catch (_error) {
      throw new FileError('Failed to update file', 'update', undefined, { 
        fileId, 
        updates,
        originalError: error 
      })
    }
  }

  // Delete a file
  static async deleteFile(fileId: string): Promise<void> {
    try {
      await api.delete('${this.baseUrl}/${fileId}')
    } catch (_error) {
      throw new FileError('Failed to delete file', 'delete', undefined, { 
        fileId,
        originalError: error 
      })
    }
  }

  // Get file download URL
  static async getDownloadUrl(fileId: string): Promise<string> {
    try {
      const response = await api.get<{ url: string }>('${this.baseUrl}/${fileId}/download')
      return response.url
    } catch (_error) {
      throw new FileError('Failed to get download URL', 'download', undefined, { 
        fileId,
        originalError: error 
      })
    }
  }

  // Get file preview URL (for images, PDFs, etc.)
  static async getPreviewUrl(fileId: string): Promise<string> {
    try {
      const response = await api.get<{ url: string }>('${this.baseUrl}/${fileId}/preview')
      return response.url
    } catch (_error) {
      throw new FileError('Failed to get preview URL', 'preview', undefined, { 
        fileId,
        originalError: error 
      })
    }
  }

  // Generate thumbnail for image files
  static async generateThumbnail(
    fileId: string,
    width: number = 200,
    height: number = 200
  ): Promise<string> {
    try {
      const response = await api.post<{ url: string }>('${this.baseUrl}/${fileId}/thumbnail', {
        width,
        height
      })
      return response.url
    } catch (_error) {
      throw new FileError('Failed to generate thumbnail', 'thumbnail', undefined, { 
        fileId,
        width,
        height,
        originalError: error 
      })
    }
  }

  // Search files
  static async searchFiles(query: {
    context?: UploadContext
    entityType?: string
    filename?: string
    mimeType?: string
    tags?: string[]
    uploadedAfter?: Date
    uploadedBefore?: Date
    limit?: number
    offset?: number
  }): Promise<{ files: FileMetadata[]; total: number }> {
    try {
      const params = new URLSearchParams()
      
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            params.append(key, JSON.stringify(value))
          } else if (value instanceof Date) {
            params.append(key, value.toISOString())
          } else {
            params.append(key, String(value))
          }
        }
      })

      return await api.get<{ files: FileMetadata[]; total: number }>('${this.baseUrl}/search?${params}')
    } catch (_error) {
      throw new FileError('Failed to search files', 'search', undefined, { 
        query,
        originalError: error 
      })
    }
  }

  // Get file usage statistics
  static async getFileStats(
    context?: UploadContext,
    entityType?: string
  ): Promise<{
    totalFiles: number
    totalSize: number
    averageSize: number
    filesByType: Record<string, number>
    filesByContext: Record<string, number>
  }> {
    try {
      const params = new URLSearchParams()
      if (context) params.append('context', context)
      if (entityType) params.append('entityType', entityType)

      return await api.get('${this.baseUrl}/stats?${params}')
    } catch (_error) {
      throw new FileError('Failed to get file statistics', 'stats', undefined, { 
        context,
        entityType,
        originalError: error 
      })
    }
  }

  // Validate file on server (additional validation beyond client-side)
  static async validateFile(file: File): Promise<{
    isValid: boolean
    errors: string[]
    warnings: string[]
    metadata?: {
      checksum: string
      dimensions?: { width: number; height: number }
      duration?: number // for videos/audio
    }
  }> {
    try {
      const formData = new FormData()
      formData.append('file', file)

      return await api.post('${this.baseUrl}/validate', formData, {
        headers: {
          // Don't set Content-Type - let browser set it with boundary for FormData'
        }
      })
    } catch (_error) {
      throw new FileError('Failed to validate file', 'validate', file.name, { originalError: error })
    }
  }

  // Clean up orphaned files (files not associated with any entity)
  static async cleanupOrphanedFiles(
    daysOld: number = 7
  ): Promise<{ deletedFiles: number; freedSpace: number }> {
    try {
      return await api.post('${this.baseUrl}/cleanup', { daysOld })
    } catch (_error) {
      throw new FileError('Failed to cleanup orphaned files', 'cleanup', undefined, { 
        daysOld,
        originalError: error 
      })
    }
  }

  // Move files between contexts (e.g., from temp to permanent)
  static async moveFiles(
    fileIds: string[],
    newContext: UploadContext,
    newEntityId?: string,
    newEntityType?: string
  ): Promise<FileMetadata[]> {
    try {
      return await api.post('${this.baseUrl}/move', {
        fileIds,
        newContext,
        newEntityId,
        newEntityType
      })
    } catch (_error) {
      throw new FileError('Failed to move files', 'move', undefined, { 
        fileIds,
        newContext,
        newEntityId,
        newEntityType,
        originalError: error 
      })
    }
  }

  // Duplicate file
  static async duplicateFile(
    fileId: string,
    options?: Partial<FileUploadOptions>
  ): Promise<FileMetadata> {
    try {
      return await api.post('${this.baseUrl}/${fileId}/duplicate', options || {})
    } catch (_error) {
      throw new FileError('Failed to duplicate file', 'duplicate', undefined, { 
        fileId,
        options,
        originalError: error 
      })
    }
  }

  // Archive files (soft delete)
  static async archiveFiles(fileIds: string[]): Promise<void> {
    try {
      await api.post('${this.baseUrl}/archive', { fileIds })
    } catch (_error) {
      throw new FileError('Failed to archive files', 'archive', undefined, { 
        fileIds,
        originalError: error 
      })
    }
  }

  // Restore archived files
  static async restoreFiles(fileIds: string[]): Promise<FileMetadata[]> {
    try {
      return await api.post('${this.baseUrl}/restore', { fileIds })
    } catch (_error) {
      throw new FileError('Failed to restore files', 'restore', undefined, { 
        fileIds,
        originalError: error 
      })
    }
  }

  // Bulk update file metadata
  static async bulkUpdateFiles(
    updates: Array<{
      fileId: string
      updates: Partial<Pick<FileMetadata, 'description' | 'tags' | 'isPublic'>>
    }>
  ): Promise<FileMetadata[]> {
    try {
      return await api.post('${this.baseUrl}/bulk-update', { updates })
    } catch (_error) {
      throw new FileError('Failed to bulk update files', 'bulk_update', undefined, { 
        updateCount: updates.length,
        originalError: error 
      })
    }
  }

  // Get file access logs (for audit purposes)
  static async getFileAccessLog(
    fileId: string,
    limit: number = 50
  ): Promise<Array<{
    timestamp: string
    userId: string
    action: 'view' | 'download' | 'upload' | 'update' | 'delete'
    ipAddress: string
    userAgent: string
  }>> {
    try {
      return await api.get('${this.baseUrl}/${fileId}/access-log?limit=${limit}')
    } catch (_error) {
      throw new FileError('Failed to get file access log', 'access_log', undefined, { 
        fileId,
        limit,
        originalError: error 
      })
    }
  }
}

// Client-side file utilities
export class FileUtils {
  // Create file preview (for client-side display)
  static createFilePreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Preview only supported for image files'))
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }

  // Read file as text
  static readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = () => reject(new Error('Failed to read file as text'))
      reader.readAsText(file)
    })
  }

  // Read file as binary
  static readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as ArrayBuffer)
      reader.onerror = () => reject(new Error('Failed to read file as binary'))
      reader.readAsArrayBuffer(file)
    })
  }

  // Compress image file (basic implementation)
  static async compressImage(
    file: File,
    maxWidth: number = 1920,
    maxHeight: number = 1080,
    quality: number = 0.8
  ): Promise<File> {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('File is not an image'))
        return
      }

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }

        canvas.width = width
        canvas.height = height

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'))
              return
            }
            
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            })
            
            resolve(compressedFile)
          },
          file.type,
          quality
        )
      }

      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = URL.createObjectURL(file)
    })
  }

  // Generate file hash (client-side)
  static async generateFileHash(file: File): Promise<string> {
    const arrayBuffer = await this.readFileAsArrayBuffer(file)
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join(')
  }
}