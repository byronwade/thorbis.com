// Offline photo and media management with compression and optimization
// Provides comprehensive media handling for photos, videos, documents with offline storage

import { EventEmitter } from 'events';

export interface MediaMetadata {
  id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  compressedSize?: number;
  compressionRatio?: number;
  dimensions?: {
    width: number;
    height: number;
  };
  duration?: number; // for videos/audio
  organizationId: string;
  workOrderId?: string;
  customerId?: string;
  appointmentId?: string;
  conversationId?: string;
  category: MediaCategory;
  tags: string[];
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  capturedAt: Date;
  uploadedAt?: Date;
  syncedAt?: Date;
  status: MediaStatus;
  thumbnailPath?: string;
  previewPath?: string;
  originalPath: string;
  compressedPath?: string;
  backupPath?: string;
  encryption?: {
    algorithm: string;
    keyId: string;
    iv: string;
  };
  metadata: Record<string, unknown>;
  exifData?: Record<string, unknown>;
  isPublic: boolean;
  accessPermissions: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MediaCompressionSettings {
  images: {
    quality: number; // 0-100
    maxWidth: number;
    maxHeight: number;
    format: 'webp' | 'jpeg' | 'png' | 'auto';
    progressive: boolean;
    stripMetadata: boolean;
  };
  videos: {
    quality: 'low' | 'medium' | 'high' | 'original';
    maxBitrate: number;
    maxDuration: number;
    format: 'mp4' | 'webm' | 'auto';
    resolution: '480p' | '720p' | '1080p' | 'auto';
  };
  audio: {
    quality: 'low' | 'medium' | 'high' | 'original';
    bitrate: number;
    format: 'mp3' | 'aac' | 'webm' | 'auto';
  };
  documents: {
    maxFileSize: number;
    allowedFormats: string[];
    generatePreviews: boolean;
  };
}

export interface MediaUploadOptions {
  compress?: boolean;
  generateThumbnail?: boolean;
  generatePreview?: boolean;
  extractMetadata?: boolean;
  encrypt?: boolean;
  category?: MediaCategory;
  tags?: string[];
  location?: {
    latitude: number;
    longitude: number;
  };
  associatedId?: string;
  associatedType?: 'work_order' | 'customer' | 'appointment' | 'conversation';
  isPublic?: boolean;
}

export interface MediaSearchFilters {
  category?: MediaCategory;
  mimeType?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
  workOrderId?: string;
  customerId?: string;
  appointmentId?: string;
  location?: {
    latitude: number;
    longitude: number;
    radiusKm: number;
  };
  status?: MediaStatus;
  organizationId?: string;
}

export interface MediaBatch {
  id: string;
  files: File[];
  options: MediaUploadOptions;
  progress: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  results: MediaMetadata[];
  errors: string[];
  createdAt: Date;
  completedAt?: Date;
}

export interface MediaSyncOperation {
  id: string;
  type: 'upload' | 'download' | 'update' | 'delete';
  mediaId: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
  attempts: number;
  maxAttempts: number;
  lastAttempt?: Date;
  error?: string;
  data: unknown;
  createdAt: Date;
}

export interface MediaStatistics {
  totalFiles: number;
  totalSize: number;
  totalCompressedSize: number;
  compressionSavings: number;
  byCategory: Record<MediaCategory, {
    count: number;
    size: number;
  }>;
  byMimeType: Record<string, {
    count: number;
    size: number;
  }>;
  pendingSync: number;
  syncErrors: number;
  storageUsed: number;
  storageLimit: number;
}

export type MediaCategory = 
  | 'work_order_photo'
  | 'before_after'
  | 'diagnostic'
  | 'parts'
  | 'customer_signature'
  | 'invoice_receipt'
  | 'product_photo'
  | 'staff_photo'
  | 'facility_photo'
  | 'equipment_photo'
  | 'inspection_photo'
  | 'damage_photo'
  | 'repair_photo'
  | 'compliance_photo'
  | 'promotional'
  | 'training'
  | 'document'
  | 'video'
  | 'audio'
  | 'other';

export type MediaStatus = 
  | 'uploading'
  | 'processing'
  | 'ready'
  | 'synced'
  | 'failed'
  | 'deleted'
  | 'archived';

export class OfflineMediaManager extends EventEmitter {
  private static instance: OfflineMediaManager | null = null;
  private dbName = 'offline_media';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  
  private media: Map<string, MediaMetadata> = new Map();
  private batches: Map<string, MediaBatch> = new Map();
  private syncQueue: Map<string, MediaSyncOperation> = new Map();
  
  private compressionSettings: MediaCompressionSettings = {
    images: {
      quality: 85,
      maxWidth: 1920,
      maxHeight: 1080,
      format: 'webp',
      progressive: true,
      stripMetadata: false
    },
    videos: {
      quality: 'medium',
      maxBitrate: 2000000, // 2Mbps
      maxDuration: 300, // 5 minutes
      format: 'mp4',
      resolution: '720p'
    },
    audio: {
      quality: 'medium',
      bitrate: 128000, // 128kbps
      format: 'mp3'
    },
    documents: {
      maxFileSize: 50 * 1024 * 1024, // 50MB
      allowedFormats: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'],
      generatePreviews: true
    }
  };

  private initialized = false;
  private storageQuota = 1024 * 1024 * 1024; // 1GB default
  private currentStorageUsed = 0;

  private constructor() {
    super();
    this.initialize();
  }

  static getInstance(): OfflineMediaManager {
    if (!OfflineMediaManager.instance) {
      OfflineMediaManager.instance = new OfflineMediaManager();
    }
    return OfflineMediaManager.instance;
  }

  private async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await this.initializeDatabase();
      await this.loadStoredMedia();
      await this.calculateStorageUsage();
      this.setupPeriodicSync();
      this.initialized = true;
      this.emit('initialized');
    } catch (error) {
      console.error('Failed to initialize media manager:', error);
      throw new Error('Media manager initialization failed');
    }
  }

  private async initializeDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Media metadata store
        if (!db.objectStoreNames.contains('media')) {
          const mediaStore = db.createObjectStore('media', { keyPath: 'id' });
          mediaStore.createIndex('category', 'category');
          mediaStore.createIndex('status', 'status');
          mediaStore.createIndex('organizationId', 'organizationId');
          mediaStore.createIndex('capturedAt', 'capturedAt');
          mediaStore.createIndex('workOrderId', 'workOrderId');
          mediaStore.createIndex('customerId', 'customerId');
          mediaStore.createIndex('tags', 'tags', { multiEntry: true });
        }

        // Batch operations store
        if (!db.objectStoreNames.contains('batches')) {
          const batchStore = db.createObjectStore('batches', { keyPath: 'id' });
          batchStore.createIndex('status', 'status');
          batchStore.createIndex('createdAt', 'createdAt');
        }

        // Sync queue store
        if (!db.objectStoreNames.contains('sync_queue')) {
          const syncStore = db.createObjectStore('sync_queue', { keyPath: 'id' });
          syncStore.createIndex('type', 'type');
          syncStore.createIndex('priority', 'priority');
          syncStore.createIndex('mediaId', 'mediaId');
          syncStore.createIndex('attempts', 'attempts');
        }

        // File content store (for large files)
        if (!db.objectStoreNames.contains('file_content')) {
          db.createObjectStore('file_content', { keyPath: 'id' });
        }
      };
    });
  }

  private async loadStoredMedia(): Promise<void> {
    const transaction = this.db!.transaction(['media', 'batches', 'sync_queue'], 'readonly');
    
    // Load media
    const mediaStore = transaction.objectStore('media');
    const mediaRequest = mediaStore.getAll();
    
    // Load batches
    const batchStore = transaction.objectStore('batches');
    const batchRequest = batchStore.getAll();
    
    // Load sync queue
    const syncStore = transaction.objectStore('sync_queue');
    const syncRequest = syncStore.getAll();

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        mediaRequest.result.forEach((media: MediaMetadata) => {
          this.media.set(media.id, media);
        });

        batchRequest.result.forEach((batch: MediaBatch) => {
          this.batches.set(batch.id, batch);
        });

        syncRequest.result.forEach((operation: MediaSyncOperation) => {
          this.syncQueue.set(operation.id, operation);
        });

        resolve();
      };

      transaction.onerror = () => reject(transaction.error);
    });
  }

  // Media Upload and Processing

  async uploadFile(file: File, options: MediaUploadOptions = {}): Promise<string> {
    const mediaId = 'media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}';
    
    try {
      // Validate file
      await this.validateFile(file, options);
      
      // Check storage quota
      await this.checkStorageQuota(file.size);

      // Create media metadata
      const metadata: MediaMetadata = {
        id: mediaId,
        fileName: this.generateFileName(file.name, options),
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        organizationId: options.category?.includes('organization') ? 'default' : 'default',
        category: options.category || this.categorizeFile(file),
        tags: options.tags || [],
        location: options.location,
        capturedAt: new Date(),
        status: 'uploading',
        originalPath: 'uploads/${mediaId}/${file.name}',
        isPublic: options.isPublic || false,
        accessPermissions: [],
        createdBy: 'current_user',
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: Record<string, unknown>
      };

      // Process file based on type
      const processedFile = await this.processFile(file, metadata, options);
      
      // Store file and metadata
      await this.storeFile(processedFile, metadata);
      
      // Update metadata after processing
      metadata.status = 'ready';
      metadata.updatedAt = new Date();
      
      if (options.associatedId && options.associatedType) {
        metadata['${options.associatedType}Id' as keyof MediaMetadata] = options.associatedId as any;
      }

      // Save to database
      await this.saveMediaMetadata(metadata);
      this.media.set(mediaId, metadata);

      // Queue for sync if online
      if (navigator.onLine) {
        await this.queueForSync(mediaId, 'upload');
      }

      this.emit('file_uploaded', { mediaId, metadata });
      return mediaId;
    } catch (_error) {
      this.emit('upload_failed', { mediaId, error });
      throw error;
    }
  }

  async uploadBatch(files: File[], options: MediaUploadOptions = {}): Promise<string> {
    const batchId = 'batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}';
    
    const batch: MediaBatch = {
      id: batchId,
      files,
      options,
      progress: 0,
      status: 'pending',
      results: [],
      errors: [],
      createdAt: new Date()
    };

    this.batches.set(batchId, batch);
    await this.saveBatch(batch);

    // Process files in parallel with concurrency limit
    this.processBatch(batch);
    
    return batchId;
  }

  private async processBatch(batch: MediaBatch): Promise<void> {
    batch.status = 'processing';
    await this.saveBatch(batch);

    const concurrencyLimit = 3;
    const processed = 0;

    const processFile = async (file: File, index: number): Promise<void> => {
      try {
        const mediaId = await this.uploadFile(file, batch.options);
        const metadata = this.media.get(mediaId);
        if (metadata) {
          batch.results.push(metadata);
        }
      } catch (_error) {
        batch.errors.push('File ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}');
      }

      processed++;
      batch.progress = Math.round((processed / batch.files.length) * 100);
      await this.saveBatch(batch);
      
      this.emit('batch_progress', { batchId: batch.id, progress: batch.progress });
    };

    // Process files with concurrency limit
    const promises: Promise<void>[] = [];
    for (let i = 0; i < batch.files.length; i++) {
      if (promises.length >= concurrencyLimit) {
        await Promise.race(promises);
        promises.splice(promises.findIndex(p => p === undefined), 1);
      }
      promises.push(processFile(batch.files[i], i));
    }

    await Promise.all(promises);

    batch.status = batch.errors.length === 0 ? 'completed' : 'failed';
    batch.completedAt = new Date();
    await this.saveBatch(batch);

    this.emit('batch_completed', { batchId: batch.id, batch });
  }

  // File Processing and Compression

  private async processFile(
    file: File,
    metadata: MediaMetadata,
    options: MediaUploadOptions
  ): Promise<{ original: Blob; compressed?: Blob; thumbnail?: Blob; preview?: Blob }> {
    const result: { original: Blob; compressed?: Blob; thumbnail?: Blob; preview?: Blob } = {
      original: file
    };

    if (file.type.startsWith('image/')) {
      result.compressed = options.compress !== false ? await this.compressImage(file) : undefined;
      result.thumbnail = options.generateThumbnail !== false ? await this.generateImageThumbnail(file) : undefined;
      result.preview = options.generatePreview !== false ? await this.generateImagePreview(file) : undefined;
      
      if (options.extractMetadata !== false) {
        metadata.exifData = await this.extractImageMetadata(file);
        metadata.dimensions = await this.getImageDimensions(file);
      }
    } else if (file.type.startsWith('video/')) {
      result.compressed = options.compress !== false ? await this.compressVideo(file) : undefined;
      result.thumbnail = options.generateThumbnail !== false ? await this.generateVideoThumbnail(file) : undefined;
      
      if (options.extractMetadata !== false) {
        metadata.duration = await this.getVideoDuration(file);
        metadata.dimensions = await this.getVideoDimensions(file);
      }
    } else if (file.type.startsWith('audio/')) {
      result.compressed = options.compress !== false ? await this.compressAudio(file) : undefined;
      
      if (options.extractMetadata !== false) {
        metadata.duration = await this.getAudioDuration(file);
      }
    } else if (this.isDocument(file)) {
      result.preview = options.generatePreview !== false ? await this.generateDocumentPreview(file) : undefined;
    }

    // Calculate compression ratio
    if (result.compressed) {
      metadata.compressedSize = result.compressed.size;
      metadata.compressionRatio = Math.round((1 - result.compressed.size / file.size) * 100);
    }

    return result;
  }

  private async compressImage(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        const { maxWidth, maxHeight, quality, format } = this.compressionSettings.images;
        
        // Calculate new dimensions
        let { width, height } = this.calculateDimensions(
          img.width,
          img.height,
          maxWidth,
          maxHeight
        );

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        const outputFormat = format === 'auto' ? this.getOptimalImageFormat(file.type) : 'image/${format}';
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          outputFormat,
          quality / 100
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  private async generateImageThumbnail(file: File, size = 150): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = size;
        canvas.height = size;

        // Calculate crop dimensions for square thumbnail
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;

        ctx?.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to generate thumbnail'));
            }
          },
          'image/webp',
          0.8
        );
      };

      img.onerror = () => reject(new Error('Failed to load image for thumbnail'));
      img.src = URL.createObjectURL(file);
    });
  }

  private async generateImagePreview(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        const { width, height } = this.calculateDimensions(img.width, img.height, 600, 600);
        
        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to generate preview'));
            }
          },
          'image/webp',
          0.85
        );
      };

      img.onerror = () => reject(new Error('Failed to load image for preview'));
      img.src = URL.createObjectURL(file);
    });
  }

  private async compressVideo(file: File): Promise<Blob> {
    // Video compression would require a library like FFmpeg.wasm
    // For now, return original file if under size limit
    const { maxBitrate, maxDuration } = this.compressionSettings.videos;
    
    if (file.size <= maxBitrate * maxDuration / 8) {
      return file;
    }

    // Placeholder for actual video compression
    throw new Error('Video compression not implemented - requires FFmpeg.wasm');
  }

  private async generateVideoThumbnail(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      video.onloadedmetadata = () => {
        video.currentTime = Math.min(1, video.duration / 2); // Seek to middle or 1 second
      };

      video.onseeked = () => {
        const { width, height } = this.calculateDimensions(video.videoWidth, video.videoHeight, 300, 300);
        
        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(video, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to generate video thumbnail'));
            }
          },
          'image/webp',
          0.8
        );
      };

      video.onerror = () => reject(new Error('Failed to load video for thumbnail'));
      video.src = URL.createObjectURL(file);
    });
  }

  private async compressAudio(file: File): Promise<Blob> {
    // Audio compression would require Web Audio API processing
    // For now, return original if under bitrate limit
    const { bitrate } = this.compressionSettings.audio;
    const estimatedBitrate = (file.size * 8) / await this.getAudioDuration(file);
    
    if (estimatedBitrate <= bitrate) {
      return file;
    }

    // Placeholder for actual audio compression
    throw new Error('Audio compression not implemented - requires Web Audio API processing');
  }

  private async generateDocumentPreview(file: File): Promise<Blob> {
    // Document preview generation would depend on file type
    // For PDFs, could use PDF.js; for Office docs, would need a service
    throw new Error('Document preview generation not implemented`);
  }

  // File Validation and Utilities

  private async validateFile(file: File, options: MediaUploadOptions): Promise<void> {
    // Check file size
    const maxSize = this.getMaxFileSize(file.type);
    if (file.size > maxSize) {
      throw new Error(`File too large. Maximum size: ${this.formatFileSize(maxSize)}');
    }

    // Check file type
    if (!this.isAllowedFileType(file.type)) {
      throw new Error('File type not allowed: ${file.type}');
    }

    // Check storage quota
    if (this.currentStorageUsed + file.size > this.storageQuota) {
      throw new Error('Storage quota exceeded');
    }

    // Validate file content (basic checks)
    if (file.type.startsWith('image/')) {
      await this.validateImageFile(file);
    }
  }

  private async validateImageFile(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const { maxWidth, maxHeight } = this.compressionSettings.images;
        if (img.width > maxWidth * 2 || img.height > maxHeight * 2) {
          reject(new Error('Image dimensions too large: ${img.width}x${img.height}'));
        } else {
          resolve();
        }
      };
      img.onerror = () => reject(new Error('Invalid image file'));
      img.src = URL.createObjectURL(file);
    });
  }

  private categorizeFile(file: File): MediaCategory {
    const type = file.type.toLowerCase();
    const name = file.name.toLowerCase();

    if (type.startsWith('image/')) {
      if (name.includes('before') || name.includes('after')) return 'before_after';
      if (name.includes('damage')) return 'damage_photo';
      if (name.includes('repair')) return 'repair_photo';
      if (name.includes('part')) return 'parts';
      if (name.includes('signature')) return 'customer_signature';
      return 'work_order_photo';
    }

    if (type.startsWith('video/')) return 'video';
    if (type.startsWith('audio/')) return 'audio';
    if (this.isDocument(file)) return 'document';

    return 'other';
  }

  private isDocument(file: File): boolean {
    const documentTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ];
    return documentTypes.includes(file.type);
  }

  private isAllowedFileType(mimeType: string): boolean {
    const allowedTypes = [
      // Images
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/bmp',
      // Videos
      'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo',
      // Audio
      'audio/mpeg', 'audio/wav', 'audio/webm', 'audio/aac',
      // Documents
      'application/pdf', 'text/plain',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    return allowedTypes.includes(mimeType);
  }

  private getMaxFileSize(mimeType: string): number {
    if (mimeType.startsWith('image/')) return 20 * 1024 * 1024; // 20MB
    if (mimeType.startsWith('video/')) return 100 * 1024 * 1024; // 100MB
    if (mimeType.startsWith('audio/')) return 50 * 1024 * 1024; // 50MB
    return this.compressionSettings.documents.maxFileSize;
  }

  private generateFileName(originalName: string, options: MediaUploadOptions): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const extension = originalName.split('.').pop() || ';
    const category = options.category || 'unknown';
    
    return '${category}_${timestamp}.${extension}';
  }

  private calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    let width = originalWidth;
    let height = originalHeight;

    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }

    if (height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }

    return { width: Math.round(width), height: Math.round(height) };
  }

  private getOptimalImageFormat(originalType: string): string {
    // Use WebP for most images, fallback to JPEG for compatibility
    if (originalType === 'image/png' && this.supportsWebP()) {
      return 'image/webp';
    }
    return originalType.startsWith('image/') ? originalType : 'image/jpeg';
  }

  private supportsWebP(): boolean {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('image/webp') === 5;
  }

  // Metadata Extraction

  private async extractImageMetadata(file: File): Promise<Record<string, unknown>> {
    // Basic metadata extraction - in production would use exif-js or similar
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
          aspectRatio: img.width / img.height,
          fileSize: file.size,
          lastModified: file.lastModified
        });
      };
      img.onerror = () => resolve({});
      img.src = URL.createObjectURL(file);
    });
  }

  private async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = () => reject(new Error('Failed to get image dimensions'));
      img.src = URL.createObjectURL(file);
    });
  }

  private async getVideoDuration(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.onloadedmetadata = () => resolve(video.duration);
      video.onerror = () => reject(new Error('Failed to get video duration'));
      video.src = URL.createObjectURL(file);
    });
  }

  private async getVideoDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.onloadedmetadata = () => {
        resolve({ width: video.videoWidth, height: video.videoHeight });
      };
      video.onerror = () => reject(new Error('Failed to get video dimensions'));
      video.src = URL.createObjectURL(file);
    });
  }

  private async getAudioDuration(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
      const audio = document.createElement('audio');
      audio.onloadedmetadata = () => resolve(audio.duration);
      audio.onerror = () => reject(new Error('Failed to get audio duration'));
      audio.src = URL.createObjectURL(file);
    });
  }

  // Storage Management

  private async storeFile(
    processedFile: { original: Blob; compressed?: Blob; thumbnail?: Blob; preview?: Blob },
    metadata: MediaMetadata
  ): Promise<void> {
    const transaction = this.db!.transaction(['file_content'], 'readwrite');
    const store = transaction.objectStore('file_content`);

    // Store original file
    await this.putFileContent(store, `${metadata.id}_original`, processedFile.original);

    // Store compressed version if available
    if (processedFile.compressed) {
      await this.putFileContent(store, `${metadata.id}_compressed`, processedFile.compressed);
      metadata.compressedPath = `${metadata.id}_compressed`;
    }

    // Store thumbnail if available
    if (processedFile.thumbnail) {
      await this.putFileContent(store, `${metadata.id}_thumbnail`, processedFile.thumbnail);
      metadata.thumbnailPath = `${metadata.id}_thumbnail`;
    }

    // Store preview if available
    if (processedFile.preview) {
      await this.putFileContent(store, `${metadata.id}_preview', processedFile.preview);
      metadata.previewPath = '${metadata.id}_preview';
    }

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  private async putFileContent(store: IDBObjectStore, id: string, blob: Blob): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = store.put({ id, content: blob, size: blob.size, type: blob.type });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async checkStorageQuota(additionalSize: number): Promise<void> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const available = (estimate.quota || 0) - (estimate.usage || 0);
      
      if (additionalSize > available) {
        throw new Error('Insufficient storage space');
      }
    }
  }

  private async calculateStorageUsage(): Promise<void> {
    const totalSize = 0;
    
    for (const media of this.media.values()) {
      totalSize += media.size;
      if (media.compressedSize) {
        totalSize += media.compressedSize;
      }
    }

    this.currentStorageUsed = totalSize;
  }

  // Database Operations

  private async saveMediaMetadata(metadata: MediaMetadata): Promise<void> {
    const transaction = this.db!.transaction(['media'], 'readwrite');
    const store = transaction.objectStore('media');
    
    return new Promise((resolve, reject) => {
      const request = store.put(metadata);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async saveBatch(batch: MediaBatch): Promise<void> {
    const transaction = this.db!.transaction(['batches'], 'readwrite');
    const store = transaction.objectStore('batches');
    
    return new Promise((resolve, reject) => {
      const request = store.put(batch);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Public API Methods

  async getMedia(mediaId: string): Promise<MediaMetadata | null> {
    return this.media.get(mediaId) || null;
  }

  async getFileContent(mediaId: string, type: 'original' | 'compressed' | 'thumbnail' | 'preview' = 'original'): Promise<Blob | null> {
    const transaction = this.db!.transaction(['file_content'], 'readonly');
    const store = transaction.objectStore('file_content');
    const key = '${mediaId}_${type}';
    
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.content : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async searchMedia(filters: MediaSearchFilters): Promise<MediaMetadata[]> {
    let results = Array.from(this.media.values());

    if (filters.category) {
      results = results.filter(m => m.category === filters.category);
    }

    if (filters.mimeType) {
      results = results.filter(m => m.mimeType.startsWith(filters.mimeType!));
    }

    if (filters.dateRange) {
      results = results.filter(m => 
        m.capturedAt >= filters.dateRange!.start && 
        m.capturedAt <= filters.dateRange!.end
      );
    }

    if (filters.tags?.length) {
      results = results.filter(m => 
        filters.tags!.some(tag => m.tags.includes(tag))
      );
    }

    if (filters.workOrderId) {
      results = results.filter(m => m.workOrderId === filters.workOrderId);
    }

    if (filters.customerId) {
      results = results.filter(m => m.customerId === filters.customerId);
    }

    if (filters.status) {
      results = results.filter(m => m.status === filters.status);
    }

    if (filters.organizationId) {
      results = results.filter(m => m.organizationId === filters.organizationId);
    }

    // Location-based filtering
    if (filters.location) {
      results = results.filter(m => {
        if (!m.location) return false;
        const distance = this.calculateDistance(
          filters.location!.latitude,
          filters.location!.longitude,
          m.location.latitude,
          m.location.longitude
        );
        return distance <= filters.location!.radiusKm;
      });
    }

    return results.sort((a, b) => b.capturedAt.getTime() - a.capturedAt.getTime());
  }

  async deleteMedia(mediaId: string): Promise<void> {
    const media = this.media.get(mediaId);
    if (!media) return;

    // Mark as deleted
    media.status = 'deleted';
    media.updatedAt = new Date();
    
    await this.saveMediaMetadata(media);
    this.media.set(mediaId, media);

    // Queue for sync
    await this.queueForSync(mediaId, 'delete');

    this.emit('media_deleted', { mediaId, media });
  }

  async updateMediaMetadata(mediaId: string, updates: Partial<MediaMetadata>): Promise<void> {
    const media = this.media.get(mediaId);
    if (!media) throw new Error('Media not found');

    Object.assign(media, updates, { updatedAt: new Date() });
    
    await this.saveMediaMetadata(media);
    this.media.set(mediaId, media);

    // Queue for sync
    await this.queueForSync(mediaId, 'update');

    this.emit('media_updated', { mediaId, media });
  }

  async getBatch(batchId: string): Promise<MediaBatch | null> {
    return this.batches.get(batchId) || null;
  }

  async getStatistics(organizationId?: string): Promise<MediaStatistics> {
    const mediaList = organizationId 
      ? Array.from(this.media.values()).filter(m => m.organizationId === organizationId)
      : Array.from(this.media.values());

    const stats: MediaStatistics = {
      totalFiles: mediaList.length,
      totalSize: mediaList.reduce((sum, m) => sum + m.size, 0),
      totalCompressedSize: mediaList.reduce((sum, m) => sum + (m.compressedSize || 0), 0),
      compressionSavings: 0,
      byCategory: Record<string, unknown> as Record<MediaCategory, { count: number; size: number }>,
      byMimeType: Record<string, unknown>,
      pendingSync: Array.from(this.syncQueue.values()).length,
      syncErrors: Array.from(this.syncQueue.values()).filter(op => op.error).length,
      storageUsed: this.currentStorageUsed,
      storageLimit: this.storageQuota
    };

    stats.compressionSavings = stats.totalSize - stats.totalCompressedSize;

    // Calculate by category
    for (const media of mediaList) {
      if (!stats.byCategory[media.category]) {
        stats.byCategory[media.category] = { count: 0, size: 0 };
      }
      stats.byCategory[media.category].count++;
      stats.byCategory[media.category].size += media.size;

      // Calculate by mime type
      if (!stats.byMimeType[media.mimeType]) {
        stats.byMimeType[media.mimeType] = { count: 0, size: 0 };
      }
      stats.byMimeType[media.mimeType].count++;
      stats.byMimeType[media.mimeType].size += media.size;
    }

    return stats;
  }

  // Sync Operations

  private async queueForSync(mediaId: string, type: 'upload' | 'update' | 'delete'): Promise<void> {
    const operation: MediaSyncOperation = {
      id: 'sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}',
      type,
      mediaId,
      priority: type === 'delete' ? 'low' : 'normal',
      attempts: 0,
      maxAttempts: 3,
      data: { mediaId, type },
      createdAt: new Date()
    };

    this.syncQueue.set(operation.id, operation);
    
    const transaction = this.db!.transaction(['sync_queue'], 'readwrite');
    const store = transaction.objectStore('sync_queue');
    
    return new Promise((resolve, reject) => {
      const request = store.put(operation);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private setupPeriodicSync(): void {
    // Sync every 30 seconds when online
    setInterval(() => {
      if (navigator.onLine && this.syncQueue.size > 0) {
        this.processSyncQueue();
      }
    }, 30000);

    // Handle online/offline events
    window.addEventListener('online', () => {
      this.processSyncQueue();
    });
  }

  private async processSyncQueue(): Promise<void> {
    const operations = Array.from(this.syncQueue.values())
      .filter(op => !op.error || op.attempts < op.maxAttempts)
      .sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      })
      .slice(0, 5); // Process max 5 at a time

    for (const operation of operations) {
      try {
        await this.processSyncOperation(operation);
        this.syncQueue.delete(operation.id);
        
        // Remove from database
        const transaction = this.db!.transaction(['sync_queue'], 'readwrite');
        const store = transaction.objectStore('sync_queue');
        store.delete(operation.id);
        
      } catch (error) {
        operation.attempts++;
        operation.lastAttempt = new Date();
        operation.error = error instanceof Error ? error.message : 'Unknown error';
        
        if (operation.attempts >= operation.maxAttempts) {
          this.emit('sync_failed', { operation, error });
        }
        
        // Update in database
        const transaction = this.db!.transaction(['sync_queue'], 'readwrite');
        const store = transaction.objectStore('sync_queue');
        store.put(operation);
      }
    }
  }

  private async processSyncOperation(operation: MediaSyncOperation): Promise<void> {
    // This would integrate with your backend API
    // For now, simulate sync operation
    const media = this.media.get(operation.mediaId);
    if (!media) return;

    switch (operation.type) {
      case 'upload':
        // Upload media to server
        await this.syncUpload(media);
        break;
      case 'update':
        // Update media metadata on server
        await this.syncUpdate(media);
        break;
      case 'delete':
        // Delete media from server
        await this.syncDelete(media);
        break;
    }

    // Update sync status
    media.syncedAt = new Date();
    media.status = operation.type === 'delete' ? 'deleted' : 'synced';
    await this.saveMediaMetadata(media);
    
    this.emit('media_synced', { mediaId: media.id, operation: operation.type });
  }

  private async syncUpload(media: MediaMetadata): Promise<void> {
    // Simulate upload - in production would use fetch API
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Uploaded media:', media.id);
  }

  private async syncUpdate(media: MediaMetadata): Promise<void> {
    // Simulate update - in production would use fetch API
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Updated media:', media.id);
  }

  private async syncDelete(media: MediaMetadata): Promise<void> {
    // Simulate delete - in production would use fetch API
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log('Deleted media:', media.id);
  }

  // Utility Methods

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.degToRad(lat2 - lat1);
    const dLon = this.degToRad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.degToRad(lat1)) * Math.cos(this.degToRad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private degToRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  // Configuration

  updateCompressionSettings(settings: Partial<MediaCompressionSettings>): void {
    Object.assign(this.compressionSettings, settings);
    this.emit('settings_updated', { settings: this.compressionSettings });
  }

  getCompressionSettings(): MediaCompressionSettings {
    return { ...this.compressionSettings };
  }

  setStorageQuota(quota: number): void {
    this.storageQuota = quota;
  }

  // Cleanup

  destroy(): void {
    if (this.db) {
      this.db.close();
    }
    this.removeAllListeners();
  }
}

// Factory function
export function createOfflineMediaManager(): OfflineMediaManager {
  return OfflineMediaManager.getInstance();
}

// React hook
export function useOfflineMedia() {
  const manager = OfflineMediaManager.getInstance();
  
  return {
    // Upload operations
    uploadFile: manager.uploadFile.bind(manager),
    uploadBatch: manager.uploadBatch.bind(manager),
    
    // Media retrieval
    getMedia: manager.getMedia.bind(manager),
    getFileContent: manager.getFileContent.bind(manager),
    searchMedia: manager.searchMedia.bind(manager),
    
    // Media management
    deleteMedia: manager.deleteMedia.bind(manager),
    updateMediaMetadata: manager.updateMediaMetadata.bind(manager),
    
    // Batch operations
    getBatch: manager.getBatch.bind(manager),
    
    // Statistics
    getStatistics: manager.getStatistics.bind(manager),
    
    // Configuration
    updateCompressionSettings: manager.updateCompressionSettings.bind(manager),
    getCompressionSettings: manager.getCompressionSettings.bind(manager),
    setStorageQuota: manager.setStorageQuota.bind(manager),
    
    // Events
    on: manager.on.bind(manager),
    off: manager.off.bind(manager)
  };
}