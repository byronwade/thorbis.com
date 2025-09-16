'use client'

import React from 'react'
import { 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Music, 
  Archive, 
  Code, 
  FileSpreadsheet,
  FileType,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface FilePreviewProps {
  file: File
  onRemove?: () => void
  className?: string
}

export function FilePreview({ file, onRemove, className }: FilePreviewProps) {
  const getFileIcon = (file: File) => {
    const type = file.type.toLowerCase()
    const extension = file.name.split('.').pop()?.toLowerCase()

    // Images
    if (type.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4 text-green-400" />
    }

    // Videos
    if (type.startsWith('video/')) {
      return <Video className="h-4 w-4 text-purple-400" />
    }

    // Audio
    if (type.startsWith('audio/')) {
      return <Music className="h-4 w-4 text-blue-400" />
    }

    // Documents
    if (type.includes('pdf')) {
      return <FileText className="h-4 w-4 text-red-400" />
    }

    // Spreadsheets
    if (type.includes('sheet') || type.includes('excel') || extension === 'csv') {
      return <FileSpreadsheet className="h-4 w-4 text-green-400" />
    }

    // Code files
    const codeExtensions = ['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'html', 'css', 'json', 'xml']
    if (codeExtensions.includes(extension || ')) {
      return <Code className="h-4 w-4 text-cyan-400" />
    }

    // Archives
    const archiveExtensions = ['zip', 'rar', '7z', 'tar', 'gz']
    if (archiveExtensions.includes(extension || ')) {
      return <Archive className="h-4 w-4 text-orange-400" />
    }

    // Default
    return <FileType className="h-4 w-4 text-neutral-400" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const getFileTypeColor = (file: File) => {
    const type = file.type.toLowerCase()
    
    if (type.startsWith('image/')) return 'border-green-500/30 bg-green-500/10'
    if (type.startsWith('video/')) return 'border-purple-500/30 bg-purple-500/10'
    if (type.startsWith('audio/')) return 'border-blue-500/30 bg-blue-500/10'
    if (type.includes('pdf')) return 'border-red-500/30 bg-red-500/10'
    if (type.includes('sheet') || type.includes('excel')) return 'border-green-500/30 bg-green-500/10'
    
    return 'border-neutral-600 bg-neutral-700/50'
  }

  return (
    <div className={cn(
      "flex items-center gap-2 p-2 rounded-lg border transition-all group",
      getFileTypeColor(file),
      "hover:border-opacity-50",
      className
    )}>
      {/* File Icon */}
      <div className="flex-shrink-0">
        {getFileIcon(file)}
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-neutral-100 truncate">
          {file.name}
        </div>
        <div className="text-xs text-neutral-400">
          {formatFileSize(file.size)}
        </div>
      </div>

      {/* Remove Button */}
      {onRemove && (
        <button
          onClick={onRemove}
          className="flex-shrink-0 p-1 rounded hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
          title="Remove file"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  )
}

interface FilePreviewGridProps {
  files: File[]
  onRemoveFile?: (index: number) => void
  className?: string
}

export function FilePreviewGrid({ files, onRemoveFile, className }: FilePreviewGridProps) {
  if (files.length === 0) return null

  return (
    <div className={cn("space-y-2", className)}>
      <div className="text-xs text-neutral-400 font-medium">
        Attached Files ({files.length})
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {files.map((file, index) => (
          <FilePreview
            key={'${file.name}-${index}'}
            file={file}
            onRemove={onRemoveFile ? () => onRemoveFile(index) : undefined}
          />
        ))}
      </div>
    </div>
  )
}
