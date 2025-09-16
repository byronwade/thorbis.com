import { useState, useCallback, useRef } from 'react'
import { 
  FileMetadata, 
  FileUploadOptions, 
  FileUploadProgress,
  UploadContext,
  validateFile
} from '@/lib/file-handling/file-types'
import { FileService } from '@/lib/file-handling/file-service'
import { useErrorHandling } from '@/hooks/use-error-handling'
import { useToast } from '@/components/feedback/toast-notification'

interface UseFileUploadOptions {
  context: UploadContext
  entityId?: string
  entityType?: string
  multiple?: boolean
  maxFiles?: number
  autoUpload?: boolean
  onUploadComplete?: (files: FileMetadata[]) => void
  onUploadError?: (error: unknown) => void
}

export function useFileUpload({
  context,
  entityId,
  entityType,
  multiple = false,
  maxFiles = 10,
  autoUpload = true,
  onUploadComplete,
  onUploadError
}: UseFileUploadOptions) {
  const [files, setFiles] = useState<FileMetadata[]>([])
  const [uploadProgress, setUploadProgress] = useState<FileUploadProgress[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const { handleError } = useErrorHandling()
  const { showSuccess, showError, showWarning } = useToast()
  
  // Use ref to track ongoing uploads for cleanup
  const uploadAbortControllers = useRef<Map<string, AbortController>>(new Map())

  // Add files to upload queue
  const addFiles = useCallback(async (fileList: FileList | File[]) => {
    const fileArray = Array.from(fileList)
    
    // Validate file count
    const totalFiles = files.length + uploadProgress.length + fileArray.length
    if (totalFiles > maxFiles) {
      showError('Maximum ${maxFiles} files allowed')
      return
    }

    const validFiles: File[] = []
    const invalidFiles: { file: File; errors: string[] }[] = []

    // Validate each file
    fileArray.forEach(file => {
      const validation = validateFile(file, { context, entityId, entityType })
      
      if (validation.isValid) {
        validFiles.push(file)
        // Show warnings
        validation.warnings.forEach(warning => showWarning(warning))
      } else {
        invalidFiles.push({ file, errors: validation.errors })
      }
    })

    // Show errors for invalid files
    invalidFiles.forEach(({ file, errors }) => {
      showError('Invalid file "${file.name}": ${errors.join(', ')}')
    })

    if (validFiles.length === 0) return

    // Create progress items for valid files
    const progressItems: FileUploadProgress[] = validFiles.map(file => ({
      fileId: 'temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}',
      progress: 0,
      status: 'pending',
      metadata: {
        filename: file.name,
        originalFilename: file.name,
        mimeType: file.type,
        size: file.size
      }
    }))

    setUploadProgress(prev => [...prev, ...progressItems])

    // Auto-upload if enabled
    if (autoUpload) {
      await uploadFiles(validFiles, progressItems)
    }

    return progressItems
  }, [files.length, uploadProgress.length, maxFiles, context, entityId, entityType, showError, showWarning, autoUpload])

  // Upload files
  const uploadFiles = useCallback(async (
    filesToUpload: File[], 
    progressItems: FileUploadProgress[]
  ) => {
    setIsUploading(true)

    try {
      const uploadOptions: FileUploadOptions = {
        context,
        entityId,
        entityType
      }

      const uploadPromises = filesToUpload.map(async (file, index) => {
        const progressItem = progressItems[index]
        const abortController = new AbortController()
        uploadAbortControllers.current.set(progressItem.fileId, abortController)

        try {
          // Update progress to uploading
          updateProgress(progressItem.fileId, { status: 'uploading', progress: 0 })

          // Upload file
          const metadata = await FileService.uploadFile(file, uploadOptions)

          // Update progress to completed
          updateProgress(progressItem.fileId, { 
            status: 'completed', 
            progress: 100,
            metadata 
          })

          // Add to files list
          setFiles(prev => [...prev, metadata])

          return metadata
        } catch (error) {
          // Update progress to failed
          const errorMessage = error instanceof Error ? error.message : 'Upload failed'
          updateProgress(progressItem.fileId, { 
            status: 'failed', 
            progress: 0,
            error: errorMessage 
          })

          await handleError(error)
          onUploadError?.(error)
          throw error
        } finally {
          uploadAbortControllers.current.delete(progressItem.fileId)
        }
      })

      const results = await Promise.allSettled(uploadPromises)
      const successfulUploads = results
        .filter((result): result is PromisedFulfilledResult<FileMetadata> => 
          result.status === 'fulfilled')
        .map(result => result.value)

      if (successfulUploads.length > 0) {
        showSuccess('${successfulUploads.length} file(s) uploaded successfully')
        onUploadComplete?.(successfulUploads)
      }

      // Remove completed/failed items from progress after delay
      setTimeout(() => {
        setUploadProgress(prev => 
          prev.filter(item => 
            !progressItems.some(pi => pi.fileId === item.fileId)
          )
        )
      }, 3000)

    } catch (_error) {
      await handleError(error)
    } finally {
      setIsUploading(false)
    }
  }, [context, entityId, entityType, handleError, onUploadComplete, onUploadError, showSuccess])

  // Update progress for a specific upload
  const updateProgress = useCallback((fileId: string, updates: Partial<FileUploadProgress>) => {
    setUploadProgress(prev => 
      prev.map(item => 
        item.fileId === fileId ? { ...item, ...updates } : item
      )
    )
  }, [])

  // Remove file from uploaded files
  const removeFile = useCallback(async (fileId: string) => {
    try {
      await FileService.deleteFile(fileId)
      setFiles(prev => prev.filter(file => file.id !== fileId))
      showSuccess('File removed successfully')
    } catch (_error) {
      await handleError(error)
    }
  }, [handleError, showSuccess])

  // Cancel upload
  const cancelUpload = useCallback((fileId: string) => {
    const abortController = uploadAbortControllers.current.get(fileId)
    if (abortController) {
      abortController.abort()
      uploadAbortControllers.current.delete(fileId)
    }
    
    setUploadProgress(prev => prev.filter(item => item.fileId !== fileId))
  }, [])

  // Load existing files
  const loadFiles = useCallback(async () => {
    if (!entityId) return

    try {
      const existingFiles = await FileService.getFilesByEntity(context, entityId, entityType)
      setFiles(existingFiles)
    } catch (_error) {
      await handleError(error)
    }
  }, [context, entityId, entityType, handleError])

  // Clear all files
  const clearFiles = useCallback(() => {
    // Cancel any ongoing uploads
    uploadAbortControllers.current.forEach(controller => controller.abort())
    uploadAbortControllers.current.clear()
    
    setFiles([])
    setUploadProgress([])
    setIsUploading(false)
  }, [])

  // Get file preview URL
  const getPreviewUrl = useCallback(async (fileId: string): Promise<string> => {
    try {
      return await FileService.getPreviewUrl(fileId)
    } catch (_error) {
      await handleError(error)
      throw error
    }
  }, [handleError])

  // Get file download URL
  const getDownloadUrl = useCallback(async (fileId: string): Promise<string> => {
    try {
      return await FileService.getDownloadUrl(fileId)
    } catch (_error) {
      await handleError(error)
      throw error
    }
  }, [handleError])

  // Update file metadata
  const updateFileMetadata = useCallback(async (
    fileId: string,
    updates: Partial<Pick<FileMetadata, 'description' | 'tags' | 'isPublic'>>
  ): Promise<void> => {
    try {
      const updatedFile = await FileService.updateFile(fileId, updates)
      setFiles(prev => 
        prev.map(file => file.id === fileId ? updatedFile : file)
      )
      showSuccess('File updated successfully')
    } catch (_error) {
      await handleError(error)
    }
  }, [handleError, showSuccess])

  return {
    // State
    files,
    uploadProgress,
    isUploading,
    
    // Actions
    addFiles,
    uploadFiles,
    removeFile,
    cancelUpload,
    loadFiles,
    clearFiles,
    updateFileMetadata,
    
    // Utilities
    getPreviewUrl,
    getDownloadUrl,
    
    // Computed
    hasFiles: files.length > 0,
    canAddMore: files.length + uploadProgress.length < maxFiles,
    totalSize: files.reduce((sum, file) => sum + file.size, 0),
    completedUploads: uploadProgress.filter(p => p.status === 'completed').length,
    failedUploads: uploadProgress.filter(p => p.status === 'failed').length
  }
}

// Hook for file search and management
export function useFileManager() {
  const [searchResults, setSearchResults] = useState<{
    files: FileMetadata[]
    total: number
  }>({ files: [], total: 0 })
  const [isSearching, setIsSearching] = useState(false)
  const { handleError } = useErrorHandling()

  const searchFiles = useCallback(async (query: {
    context?: UploadContext
    entityType?: string
    filename?: string
    mimeType?: string
    tags?: string[]
    uploadedAfter?: Date
    uploadedBefore?: Date
    limit?: number
    offset?: number
  }) => {
    setIsSearching(true)
    try {
      const results = await FileService.searchFiles(query)
      setSearchResults(results)
      return results
    } catch (_error) {
      await handleError(error)
      return { files: [], total: 0 }
    } finally {
      setIsSearching(false)
    }
  }, [handleError])

  const getFileStats = useCallback(async (
    context?: UploadContext,
    entityType?: string
  ) => {
    try {
      return await FileService.getFileStats(context, entityType)
    } catch (_error) {
      await handleError(error)
      return null
    }
  }, [handleError])

  return {
    searchResults,
    isSearching,
    searchFiles,
    getFileStats
  }
}