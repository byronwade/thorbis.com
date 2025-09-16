// Supported file types for uploads
export const SUPPORTED_FILE_TYPES = {
  // Images
  'image/jpeg': { extension: '.jpg', category: 'image', maxSize: 10 * 1024 * 1024 }, // 10MB
  'image/jpg': { extension: '.jpg', category: 'image', maxSize: 10 * 1024 * 1024 },
  'image/png': { extension: '.png', category: 'image', maxSize: 10 * 1024 * 1024 },
  'image/gif': { extension: '.gif', category: 'image', maxSize: 5 * 1024 * 1024 }, // 5MB
  'image/webp': { extension: '.webp', category: 'image', maxSize: 10 * 1024 * 1024 },
  
  // Documents
  'application/pdf': { extension: '.pdf', category: 'document', maxSize: 25 * 1024 * 1024 }, // 25MB
  'text/plain': { extension: '.txt', category: 'document', maxSize: 1 * 1024 * 1024 }, // 1MB
  'text/csv': { extension: '.csv', category: 'document', maxSize: 10 * 1024 * 1024 },
  
  // Microsoft Office
  'application/msword': { extension: '.doc', category: 'document', maxSize: 25 * 1024 * 1024 },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { extension: '.docx', category: 'document', maxSize: 25 * 1024 * 1024 },
  'application/vnd.ms-excel': { extension: '.xls', category: 'document', maxSize: 25 * 1024 * 1024 },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { extension: '.xlsx', category: 'document', maxSize: 25 * 1024 * 1024 },
  'application/vnd.ms-powerpoint': { extension: '.ppt', category: 'document', maxSize: 25 * 1024 * 1024 },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': { extension: '.pptx', category: 'document', maxSize: 25 * 1024 * 1024 },
  
  // Archives
  'application/zip': { extension: '.zip', category: 'archive', maxSize: 50 * 1024 * 1024 }, // 50MB
  'application/x-rar-compressed': { extension: '.rar', category: 'archive', maxSize: 50 * 1024 * 1024 },
  'application/x-7z-compressed': { extension: '.7z', category: 'archive', maxSize: 50 * 1024 * 1024 }
} as const

export type SupportedMimeType = keyof typeof SUPPORTED_FILE_TYPES
export type FileCategory = typeof SUPPORTED_FILE_TYPES[SupportedMimeType]['category']

// File upload contexts - where files can be uploaded
export enum UploadContext {
  TRANSACTION_RECEIPT = 'transaction_receipt',
  INVOICE_ATTACHMENT = 'invoice_attachment',
  BILL_ATTACHMENT = 'bill_attachment',
  CUSTOMER_DOCUMENT = 'customer_document',
  VENDOR_DOCUMENT = 'vendor_document',
  ACCOUNT_STATEMENT = 'account_statement',
  TAX_DOCUMENT = 'tax_document',
  GENERAL_DOCUMENT = 'general_document'
}

// File metadata interface
export interface FileMetadata {
  id: string
  filename: string
  originalFilename: string
  mimeType: string
  size: number
  category: FileCategory
  uploadedAt: Date
  uploadedBy: string
  context: UploadContext
  entityId?: string // ID of related entity (transaction, invoice, etc.)
  entityType?: string
  description?: string
  tags?: string[]
  isPublic?: boolean
  checksum?: string
  thumbnailUrl?: string
  url: string
}

// File upload options
export interface FileUploadOptions {
  context: UploadContext
  entityId?: string
  entityType?: string
  description?: string
  tags?: string[]
  isPublic?: boolean
  generateThumbnail?: boolean
  allowedTypes?: SupportedMimeType[]
  maxSize?: number
}

// File validation result
export interface FileValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

// File upload progress
export interface FileUploadProgress {
  fileId: string
  progress: number // 0-100
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'failed'
  error?: string
  metadata?: Partial<FileMetadata>
}

// Validate file before upload
export function validateFile(
  file: File, 
  options: FileUploadOptions = { context: UploadContext.GENERAL_DOCUMENT }
): FileValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Check if file type is supported
  const supportedType = SUPPORTED_FILE_TYPES[file.type as SupportedMimeType]
  if (!supportedType) {
    errors.push('File type '${file.type}' is not supported')
    return { isValid: false, errors, warnings }
  }

  // Check allowed types for this context
  if (options.allowedTypes && !options.allowedTypes.includes(file.type as SupportedMimeType)) {
    errors.push('File type '${file.type}' is not allowed for this upload context')
  }

  // Check file size
  const maxSize = options.maxSize || supportedType.maxSize
  if (file.size > maxSize) {
    errors.push('File size (${formatFileSize(file.size)}) exceeds maximum allowed size (${formatFileSize(maxSize)})')
  }

  // Check file name
  if (file.name.length > 255) {
    errors.push('File name is too long (maximum 255 characters)')
  }

  // Check for potentially malicious file names
  if (/[<>:"/\\|?*]/.test(file.name)) {"
    errors.push('File name contains invalid characters')
  }

  // Warnings for large files
  if (file.size > 10 * 1024 * 1024) { // 10MB
    warnings.push('Large file detected. Upload may take longer.')
  }

  // Warnings for certain file types in certain contexts
  if (options.context === UploadContext.TRANSACTION_RECEIPT && supportedType.category !== 'image' && file.type !== 'application/pdf') {
    warnings.push('Receipt uploads typically work best with images or PDF files')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Get file icon based on type
export function getFileIcon(mimeType: string): string {
  const supportedType = SUPPORTED_FILE_TYPES[mimeType as SupportedMimeType]
  if (!supportedType) return 'file'

  switch (supportedType.category) {
    case 'image':
      return 'image'
    case 'document':
      if (mimeType === 'application/pdf') return 'file-pdf'
      if (mimeType.includes('word')) return 'file-word'
      if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'file-excel'
      if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'file-powerpoint'
      return 'file-text'
    case 'archive':
      return 'archive'
    default:
      return 'file'
  }
}

// Generate secure filename
export function generateSecureFilename(originalFilename: string, mimeType: string): string {
  const supportedType = SUPPORTED_FILE_TYPES[mimeType as SupportedMimeType]
  const extension = supportedType?.extension || '
  
  // Remove extension from original filename
  const nameWithoutExtension = originalFilename.replace(/\.[^/.]+$/, ')
  
  // Sanitize filename
  const sanitized = nameWithoutExtension
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^_+|_+$/g, ') // Remove leading/trailing underscores
    .substring(0, 100) // Limit length
  
  // Add timestamp to ensure uniqueness
  const timestamp = Date.now()
  const randomId = Math.random().toString(36).substring(2, 8)
  
  return '${sanitized}_${timestamp}_${randomId}${extension}'
}

// Calculate file checksum (simplified version - in production use crypto.subtle)
export async function calculateChecksum(file: File): Promise<string> {
  // Simple checksum based on file properties
  // In production, you'd want to use actual SHA-256 or similar'
  const data = '${file.name}-${file.size}-${file.lastModified}-${file.type}'
  
  // Simple hash function (use crypto.subtle.digest in production)
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(16)
}

// Get upload context display name
export function getUploadContextDisplayName(context: UploadContext): string {
  switch (context) {
    case UploadContext.TRANSACTION_RECEIPT:
      return 'Transaction Receipt'
    case UploadContext.INVOICE_ATTACHMENT:
      return 'Invoice Attachment'
    case UploadContext.BILL_ATTACHMENT:
      return 'Bill Attachment'
    case UploadContext.CUSTOMER_DOCUMENT:
      return 'Customer Document'
    case UploadContext.VENDOR_DOCUMENT:
      return 'Vendor Document'
    case UploadContext.ACCOUNT_STATEMENT:
      return 'Account Statement'
    case UploadContext.TAX_DOCUMENT:
      return 'Tax Document'
    case UploadContext.GENERAL_DOCUMENT:
      return 'General Document'
    default:
      return 'Document'
  }
}

// Get allowed file types for context
export function getAllowedTypesForContext(context: UploadContext): SupportedMimeType[] {
  switch (context) {
    case UploadContext.TRANSACTION_RECEIPT:
      return [
        'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
        'application/pdf'
      ]
    case UploadContext.INVOICE_ATTACHMENT:
    case UploadContext.BILL_ATTACHMENT:
      return [
        'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
      ]
    case UploadContext.TAX_DOCUMENT:
      return [
        'application/pdf',
        'image/jpeg', 'image/jpg', 'image/png',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ]
    case UploadContext.ACCOUNT_STATEMENT:
      return [
        'application/pdf',
        'text/csv',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ]
    default:
      return Object.keys(SUPPORTED_FILE_TYPES) as SupportedMimeType[]
  }
}