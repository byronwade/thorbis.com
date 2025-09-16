'use client'

import React, { useState, useRef, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Upload, 
  X, 
  File, 
  Image, 
  FileText, 
  Archive,
  AlertCircle,
  CheckCircle,
  Loader2,
  Eye,
  Download,
  Trash2
} from 'lucide-react'
import { 
  FileMetadata, 
  FileUploadOptions, 
  FileUploadProgress,
  UploadContext,
  validateFile,
  formatFileSize,
  getFileIcon,
  getAllowedTypesForContext,
  getUploadContextDisplayName
} from '@/lib/file-handling/file-types'
import { useToast } from '@/components/feedback/toast-notification'

interface FileUploadProps {
  context: UploadContext
  entityId?: string
  entityType?: string
  multiple?: boolean
  maxFiles?: number
  onUploadComplete?: (files: FileMetadata[]) => void
  onUploadProgress?: (progress: FileUploadProgress[]) => void
  onFileRemove?: (fileId: string) => void
  existingFiles?: FileMetadata[]
  disabled?: boolean
  className?: string
}

export function FileUpload({
  context,
  entityId,
  entityType,
  multiple = false,
  maxFiles = 10,
  onUploadComplete,
  onUploadProgress,
  onFileRemove,
  existingFiles = [],
  disabled = false,
  className = ''
}: FileUploadProps) {
  const [uploadProgress, setUploadProgress] = useState<FileUploadProgress[]>([])
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { showError, showSuccess, showWarning } = useToast()

  const allowedTypes = useMemo(() => getAllowedTypesForContext(context), [context])
  const contextDisplayName = useMemo(() => getUploadContextDisplayName(context), [context])

  const handleFileSelect = useCallback(async (files: FileList) => {
    if (disabled) return

    const fileArray = Array.from(files)
    
    // Check file count limits
    const totalFiles = existingFiles.length + uploadProgress.length + fileArray.length
    if (totalFiles > maxFiles) {
      showError('Maximum ${maxFiles} files allowed. You can upload ${maxFiles - existingFiles.length - uploadProgress.length} more file(s).')
      return
    }

    const validFiles: File[] = []
    const invalidFiles: { file: File; errors: string[] }[] = []

    // Validate each file
    fileArray.forEach(file => {
      const validation = validateFile(file, {
        context,
        allowedTypes,
        entityId,
        entityType
      })

      if (validation.isValid) {
        validFiles.push(file)
        // Show warnings if any
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

    // Initialize upload progress for valid files
    const initialProgress: FileUploadProgress[] = validFiles.map(file => ({
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

    setUploadProgress(prev => [...prev, ...initialProgress])
    onUploadProgress?.(initialProgress)

    // Start uploads
    await Promise.all(
      validFiles.map((file, index) => 
        uploadFile(file, initialProgress[index])
      )
    )
  }, [disabled, existingFiles.length, uploadProgress.length, maxFiles, context, allowedTypes, entityId, entityType, showError, showSuccess, showWarning, onUploadProgress])

  const uploadFile = async (file: File, progressItem: FileUploadProgress) => {
    try {
      // Update status to uploading
      updateProgress(progressItem.fileId, { status: 'uploading', progress: 0 })

      // Create FormData
      const formData = new FormData()
      formData.append('file', file)
      formData.append('context', context)
      if (entityId) formData.append('entityId', entityId)
      if (entityType) formData.append('entityType', entityType)

      // TODO: Replace with actual upload endpoint
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
        // Add progress tracking
      })

      if (!response.ok) {
        throw new Error('Upload failed: ${response.statusText}')
      }

      const metadata: FileMetadata = await response.json()

      // Update progress to completed
      updateProgress(progressItem.fileId, {
        status: 'completed',
        progress: 100,
        metadata
      })

      showSuccess('File "${file.name}" uploaded successfully')
      
      // Call completion callback
      onUploadComplete?.([metadata])

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      updateProgress(progressItem.fileId, {
        status: 'failed',
        progress: 0,
        error: errorMessage
      })
      showError('Failed to upload "${file.name}": ${errorMessage}')
    }
  }

  const updateProgress = (fileId: string, updates: Partial<FileUploadProgress>) => {
    setUploadProgress(prev => 
      prev.map(item => 
        item.fileId === fileId 
          ? { ...item, ...updates }
          : item
      )
    )
  }

  const removeProgressItem = (fileId: string) => {
    setUploadProgress(prev => prev.filter(item => item.fileId !== fileId))
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) setDragOver(true)
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
    
    if (!disabled && e.dataTransfer.files) {
      handleFileSelect(e.dataTransfer.files)
    }
  }, [disabled, handleFileSelect])

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileSelect(e.target.files)
    }
    // Clear input to allow selecting same file again
    e.target.value = ''
  }

  const openFileDialog = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  const getFileIconComponent = (mimeType: string) => {
    const iconType = getFileIcon(mimeType)
    switch (iconType) {
      case 'image': return <Image className="h-5 w-5" />
      case 'file-pdf': return <FileText className="h-5 w-5" />
      case 'archive': return <Archive className="h-5 w-5" />
      default: return <File className="h-5 w-5" />
    }
  }

  const acceptTypes = allowedTypes.join(',`)

  return (
    <div className={'space-y-4 ${className}'}>
      {/* Upload Area */}
      <Card className={'
        transition-colors duration-200
        ${dragOver ? 'border-primary bg-primary/5' : 'border-dashed border-2 border-border'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary/50`
              }'}'
      '}>
        <CardContent 
          className="p-6"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Upload {contextDisplayName}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {dragOver 
                ? 'Drop files here to upload'
                : 'Drag and drop files here, or click to browse'
              }
            </p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>
                Supported formats: {allowedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')}
              </p>
              <p>
                Maximum {multiple ? '${maxFiles} files' : '1 file'}, up to {formatFileSize(25 * 1024 * 1024)} each
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="mt-4"
              disabled={disabled}
            >
              <Upload className="mr-2 h-4 w-4" />
              Choose Files
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={acceptTypes}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Upload Progress */}
      {uploadProgress.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">Uploading Files</h4>
          {uploadProgress.map(item => (
            <FileUploadItem
              key={item.fileId}
              progress={item}
              onRemove={() => removeProgressItem(item.fileId)}
            />
          ))}
        </div>
      )}

      {/* Existing Files */}
      {existingFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">
            Uploaded Files ({existingFiles.length})
          </h4>
          {existingFiles.map(file => (
            <ExistingFileItem
              key={file.id}
              file={file}
              onRemove={onFileRemove}
              onPreview={(fileId) => {
                // TODO: Implement file preview
                console.log('Preview file:', fileId)
              }}
              onDownload={(fileId) => {
                // TODO: Implement file download
                console.log('Download file:', fileId)
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Component for upload progress items
interface FileUploadItemProps {
  progress: FileUploadProgress
  onRemove: () => void
}

function FileUploadItem({ progress, onRemove }: FileUploadItemProps) {
  const getStatusColor = () => {
    switch (progress.status) {
      case 'completed': return 'text-green-600'
      case 'failed': return 'text-red-600'
      case 'uploading': return 'text-primary'
      default: return 'text-muted-foreground'
    }
  }

  const getStatusIcon = () => {
    switch (progress.status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'uploading':
        return <Loader2 className="h-4 w-4 text-primary animate-spin" />
      default:
        return <File className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <Card className="p-3">
      <div className="flex items-center space-x-3">
        {getStatusIcon()}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {progress.metadata?.filename || 'Unknown file'}
          </p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{progress.metadata?.size ? formatFileSize(progress.metadata.size) : '}</span>'
            <span className={getStatusColor()}>
              {progress.status === 'failed' ? progress.error : 
               progress.status === 'uploading' ? '${progress.progress}%' :
               progress.status}
            </span>
          </div>
          {progress.status === 'uploading' && (
            <div className="mt-1 w-full bg-muted rounded-full h-1">
              <div 
                className="bg-primary h-1 rounded-full transition-all duration-300"
                style={{ width: '${progress.progress}%' }}
              />
            </div>
          )}
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={onRemove}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  )
}

// Component for existing files
interface ExistingFileItemProps {
  file: FileMetadata
  onRemove?: (fileId: string) => void
  onPreview: (fileId: string) => void
  onDownload: (fileId: string) => void
}

function ExistingFileItem({ file, onRemove, onPreview, onDownload }: ExistingFileItemProps) {
  const getFileIconComponent = (mimeType: string) => {
    const iconType = getFileIcon(mimeType)
    switch (iconType) {
      case 'image': return <Image className="h-5 w-5 text-blue-600" />
      case 'file-pdf': return <FileText className="h-5 w-5 text-red-600" />
      case 'archive': return <Archive className="h-5 w-5 text-amber-600" />
      default: return <File className="h-5 w-5 text-muted-foreground" />
    }
  }

  return (
    <Card className="p-3">
      <div className="flex items-center space-x-3">
        {getFileIconComponent(file.mimeType)}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {file.originalFilename}
          </p>
          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            <span>{formatFileSize(file.size)}</span>
            <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
            {file.description && (
              <span className="truncate">{file.description}</span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onPreview(file.id)}
            className="h-8 w-8 p-0"
            title="Preview"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDownload(file.id)}
            className="h-8 w-8 p-0"
            title="Download"
          >
            <Download className="h-4 w-4" />
          </Button>
          {onRemove && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onRemove(file.id)}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
              title="Remove"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}