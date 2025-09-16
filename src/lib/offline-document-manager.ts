// Comprehensive offline document storage and management system
// Supports file compression, categorization, version control, and sync capabilities

import { EventEmitter } from 'events';

interface DocumentMetadata {
  id: string;
  name: string;
  originalName: string;
  type: string; // MIME type
  size: number;
  compressedSize?: number;
  category: DocumentCategory;
  tags: string[];
  description?: string;
  uploadedAt: Date;
  lastModified: Date;
  version: number;
  organizationId: string;
  industry: 'hs' | 'rest' | 'auto' | 'ret' | 'courses' | 'payroll';
  relatedEntityId?: string; // work order, customer, appointment, etc.
  relatedEntityType?: string;
  isPublic: boolean;
  permissions: DocumentPermissions;
  checksum: string;
  thumbnailUrl?: string;
  previewAvailable: boolean;
  isEncrypted: boolean;
  encryptionKey?: string;
  isSynced: boolean;
  syncedAt?: Date;
  lastSyncAttempt?: Date;
  syncStatus: 'pending' | 'syncing' | 'completed' | 'failed';
  syncError?: string;
  compressionRatio?: number;
  downloadUrl?: string;
  expiresAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
}

interface DocumentContent {
  data: ArrayBuffer;
  compressed: boolean;
  encoding: string;
}

interface DocumentVersion {
  id: string;
  documentId: string;
  version: number;
  size: number;
  uploadedAt: Date;
  uploadedBy: string;
  changes: string;
  checksum: string;
  isActive: boolean;
}

interface DocumentPermissions {
  read: string[]; // user IDs or roles
  write: string[]; 
  delete: string[];
  share: string[];
  owner: string;
}

type DocumentCategory = 
  | 'invoice' | 'estimate' | 'receipt' | 'contract' | 'photo' | 'video'
  | 'audio' | 'document' | 'form' | 'signature' | 'license' | 'certification'
  | 'work_order' | 'appointment' | 'customer_file' | 'employee_file'
  | 'vehicle_document' | 'menu_item' | 'recipe' | 'inventory' | 'compliance'
  | 'training' | 'marketing' | 'communication' | 'other';

interface DocumentFilter {
  category?: DocumentCategory;
  tags?: string[];
  organizationId?: string;
  industry?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  sizeRange?: {
    min: number;
    max: number;
  };
  type?: string;
  isPublic?: boolean;
  isSynced?: boolean;
  searchQuery?: string;
}

interface DocumentSearchResult {
  documents: DocumentMetadata[];
  totalCount: number;
  totalSize: number;
  categories: Record<string, number>;
  tags: Record<string, number>;
}

interface DocumentStorageStats {
  totalDocuments: number;
  totalSize: number;
  compressedSize: number;
  compressionRatio: number;
  categoryCounts: Record<DocumentCategory, number>;
  syncedCount: number;
  pendingCount: number;
  failedCount: number;
  averageFileSize: number;
  storageUsed: number;
  storageLimit: number;
  oldestDocument?: Date;
  newestDocument?: Date;
}

interface DocumentCompressionOptions {
  quality?: number; // 0-100 for images
  maxWidth?: number;
  maxHeight?: number;
  format?: string;
  stripMetadata?: boolean;
}

export class OfflineDocumentManager extends EventEmitter {
  private static instance: OfflineDocumentManager | null = null;
  
  private dbName = 'offline_documents';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  
  private metadata: Map<string, DocumentMetadata> = new Map();
  private content: Map<string, DocumentContent> = new Map();
  private versions: Map<string, DocumentVersion[]> = new Map();
  
  private initialized = false;
  private storageLimit = 500 * 1024 * 1024; // 500MB default
  private compressionEnabled = true;
  private encryptionEnabled = true;
  private currentUserId = 'default';
  private currentOrganizationId = 'default';

  private constructor() {
    super();
    this.initialize();
  }

  static getInstance(): OfflineDocumentManager {
    if (!OfflineDocumentManager.instance) {
      OfflineDocumentManager.instance = new OfflineDocumentManager();
    }
    return OfflineDocumentManager.instance;
  }

  // Initialize IndexedDB and load existing data
  private async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await this.initializeDatabase();
      await this.loadMetadataFromStorage();
      await this.setupCleanupTasks();
      
      this.initialized = true;
      this.emit('manager_initialized');
    } catch (error) {
      console.error('Failed to initialize document manager:', error);
      throw new Error('Document manager initialization failed');
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

        // Document metadata store
        if (!db.objectStoreNames.contains('metadata')) {
          const metadataStore = db.createObjectStore('metadata', { keyPath: 'id' });
          metadataStore.createIndex('organizationId', 'organizationId', { unique: false });
          metadataStore.createIndex('category', 'category', { unique: false });
          metadataStore.createIndex('industry', 'industry', { unique: false });
          metadataStore.createIndex('uploadedAt', 'uploadedAt', { unique: false });
          metadataStore.createIndex('relatedEntity', ['relatedEntityType', 'relatedEntityId'], { unique: false });
          metadataStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        }

        // Document content store
        if (!db.objectStoreNames.contains('content')) {
          db.createObjectStore('content', { keyPath: 'id' });
        }

        // Document versions store
        if (!db.objectStoreNames.contains('versions')) {
          const versionsStore = db.createObjectStore('versions', { keyPath: 'id' });
          versionsStore.createIndex('documentId', 'documentId', { unique: false });
          versionsStore.createIndex('version', ['documentId', 'version'], { unique: true });
        }

        // Thumbnails store
        if (!db.objectStoreNames.contains('thumbnails')) {
          db.createObjectStore('thumbnails', { keyPath: 'documentId' });
        }
      };
    });
  }

  // Document upload and storage
  async uploadDocument(
    file: File,
    options: {
      category: DocumentCategory;
      tags?: string[];
      description?: string;
      relatedEntityId?: string;
      relatedEntityType?: string;
      isPublic?: boolean;
      permissions?: Partial<DocumentPermissions>;
      compressionOptions?: DocumentCompressionOptions;
    }
  ): Promise<string> {
    if (!this.initialized) await this.initialize();

    try {
      // Check storage limits
      await this.checkStorageCapacity(file.size);

      const documentId = this.generateId();
      const now = new Date();

      // Process file content
      const arrayBuffer = await file.arrayBuffer();
      let processedContent: ArrayBuffer = arrayBuffer;
      let compressed = false;
      let compressedSize = file.size;

      // Compress if enabled and file type supports it
      if (this.compressionEnabled && this.isCompressible(file.type)) {
        const compressionResult = await this.compressFile(file, options.compressionOptions);
        if (compressionResult.size < file.size * 0.9) { // Only use if >10% reduction
          processedContent = compressionResult.data;
          compressed = true;
          compressedSize = compressionResult.size;
        }
      }

      // Calculate checksum
      const checksum = await this.calculateChecksum(processedContent);

      // Check for duplicates
      const existingDoc = await this.findDuplicateByChecksum(checksum);
      if (existingDoc) {
        throw new Error('Duplicate document found: ${existingDoc.name}');
      }

      // Create metadata
      const metadata: DocumentMetadata = {
        id: documentId,
        name: this.generateDocumentName(file.name, options.category),
        originalName: file.name,
        type: file.type,
        size: file.size,
        compressedSize: compressed ? compressedSize : undefined,
        category: options.category,
        tags: options.tags || [],
        description: options.description,
        uploadedAt: now,
        lastModified: now,
        version: 1,
        organizationId: this.currentOrganizationId,
        industry: this.getCurrentIndustry(),
        relatedEntityId: options.relatedEntityId,
        relatedEntityType: options.relatedEntityType,
        isPublic: options.isPublic || false,
        permissions: {
          owner: this.currentUserId,
          read: [this.currentUserId],
          write: [this.currentUserId],
          delete: [this.currentUserId],
          share: [this.currentUserId],
          ...options.permissions
        },
        checksum,
        previewAvailable: this.canGeneratePreview(file.type),
        isEncrypted: false,
        isSynced: false,
        syncStatus: 'pending',
        compressionRatio: compressed ? file.size / compressedSize : 1,
        isDeleted: false
      };

      // Encrypt if enabled
      if (this.encryptionEnabled && this.isSensitive(options.category)) {
        const encryptionResult = await this.encryptContent(processedContent);
        processedContent = encryptionResult.data;
        metadata.isEncrypted = true;
        metadata.encryptionKey = encryptionResult.key;
      }

      // Store content
      const documentContent: DocumentContent = {
        data: processedContent,
        compressed,
        encoding: 'binary'
      };

      // Create initial version
      const version: DocumentVersion = {
        id: this.generateId(),
        documentId,
        version: 1,
        size: file.size,
        uploadedAt: now,
        uploadedBy: this.currentUserId,
        changes: 'Initial upload',
        checksum,
        isActive: true
      };

      // Store in IndexedDB
      await this.storeInDatabase('metadata', metadata);
      await this.storeInDatabase('content', { id: documentId, ...documentContent });
      await this.storeInDatabase('versions', version);

      // Generate thumbnail if possible
      if (this.canGenerateThumbnail(file.type)) {
        try {
          const thumbnail = await this.generateThumbnail(file);
          await this.storeInDatabase('thumbnails', { documentId, data: thumbnail });
          metadata.thumbnailUrl = 'thumbnail://${documentId}';
        } catch (error) {
          console.warn('Failed to generate thumbnail:', error);
        }
      }

      // Update in-memory caches
      this.metadata.set(documentId, metadata);
      this.content.set(documentId, documentContent);
      this.versions.set(documentId, [version]);

      // Emit events
      this.emit('document_uploaded', { documentId, metadata });
      this.emit('storage_updated', await this.getStorageStats());

      return documentId;
    } catch (error) {
      this.emit('upload_failed', { error: error.message, file: file.name });
      throw error;
    }
  }

  // Document retrieval
  async getDocument(documentId: string): Promise<{ metadata: DocumentMetadata; content?: ArrayBuffer } | null> {
    if (!this.initialized) await this.initialize();

    const metadata = this.metadata.get(documentId) || await this.loadMetadataFromDatabase(documentId);
    if (!metadata || metadata.isDeleted) return null;

    // Check permissions
    if (!this.hasPermission(metadata, 'read')) {
      throw new Error('Insufficient permissions to read document');
    }

    const contentRecord = this.content.get(documentId) || await this.loadContentFromDatabase(documentId);
    if (!contentRecord) return { metadata };

    let content = contentRecord.data;

    // Decrypt if encrypted
    if (metadata.isEncrypted && metadata.encryptionKey) {
      content = await this.decryptContent(content, metadata.encryptionKey);
    }

    // Decompress if compressed
    if (contentRecord.compressed) {
      content = await this.decompressContent(content, metadata.type);
    }

    return { metadata, content };
  }

  // Document search and filtering
  async searchDocuments(filter: DocumentFilter, options?: {
    limit?: number;
    offset?: number;
    sortBy?: 'name' | 'uploadedAt' | 'size' | 'category';
    sortOrder?: 'asc' | 'desc';
  }): Promise<DocumentSearchResult> {
    if (!this.initialized) await this.initialize();

    const { limit = 50, offset = 0, sortBy = 'uploadedAt', sortOrder = 'desc' } = options || {};

    // Get all documents matching filter
    let documents = Array.from(this.metadata.values()).filter(doc => {
      if (doc.isDeleted) return false;

      // Check permissions
      if (!this.hasPermission(doc, 'read')) return false;

      // Apply filters
      if (filter.category && doc.category !== filter.category) return false;
      if (filter.organizationId && doc.organizationId !== filter.organizationId) return false;
      if (filter.industry && doc.industry !== filter.industry) return false;
      if (filter.relatedEntityType && doc.relatedEntityType !== filter.relatedEntityType) return false;
      if (filter.relatedEntityId && doc.relatedEntityId !== filter.relatedEntityId) return false;
      if (filter.isPublic !== undefined && doc.isPublic !== filter.isPublic) return false;
      if (filter.isSynced !== undefined && doc.isSynced !== filter.isSynced) return false;
      if (filter.type && doc.type !== filter.type) return false;

      // Date range filter
      if (filter.dateRange) {
        const uploadDate = doc.uploadedAt;
        if (uploadDate < filter.dateRange.start || uploadDate > filter.dateRange.end) {
          return false;
        }
      }

      // Size range filter
      if (filter.sizeRange) {
        if (doc.size < filter.sizeRange.min || doc.size > filter.sizeRange.max) {
          return false;
        }
      }

      // Tags filter
      if (filter.tags && filter.tags.length > 0) {
        const hasAllTags = filter.tags.every(tag => doc.tags.includes(tag));
        if (!hasAllTags) return false;
      }

      // Search query filter
      if (filter.searchQuery) {
        const query = filter.searchQuery.toLowerCase();
        const searchableText = [
          doc.name,
          doc.originalName,
          doc.description || ',
          ...doc.tags
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(query)) return false;
      }

      return true;
    });

    // Sort documents
    documents.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'uploadedAt':
          comparison = a.uploadedAt.getTime() - b.uploadedAt.getTime();
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    const totalCount = documents.length;
    const totalSize = documents.reduce((sum, doc) => sum + doc.size, 0);

    // Apply pagination
    const paginatedDocuments = documents.slice(offset, offset + limit);

    // Calculate aggregations
    const categories: Record<string, number> = {};
    const tags: Record<string, number> = {};

    documents.forEach(doc => {
      categories[doc.category] = (categories[doc.category] || 0) + 1;
      doc.tags.forEach(tag => {
        tags[tag] = (tags[tag] || 0) + 1;
      });
    });

    return {
      documents: paginatedDocuments,
      totalCount,
      totalSize,
      categories,
      tags
    };
  }

  // Document update and versioning
  async updateDocument(
    documentId: string, 
    updates: Partial<Pick<DocumentMetadata, 'name' | 'description' | 'tags' | 'category' | 'isPublic'>>,
    newContent?: File
  ): Promise<void> {
    if (!this.initialized) await this.initialize();

    const metadata = this.metadata.get(documentId);
    if (!metadata || metadata.isDeleted) {
      throw new Error('Document not found');
    }

    if (!this.hasPermission(metadata, 'write')) {
      throw new Error('Insufficient permissions to update document');
    }

    const now = new Date();
    let newVersion = metadata.version;

    // If new content is provided, create a new version
    if (newContent) {
      newVersion = metadata.version + 1;

      // Process new content similar to upload
      const arrayBuffer = await newContent.arrayBuffer();
      let processedContent: ArrayBuffer = arrayBuffer;
      let compressed = false;
      let compressedSize = newContent.size;

      if (this.compressionEnabled && this.isCompressible(newContent.type)) {
        const compressionResult = await this.compressFile(newContent);
        if (compressionResult.size < newContent.size * 0.9) {
          processedContent = compressionResult.data;
          compressed = true;
          compressedSize = compressionResult.size;
        }
      }

      const checksum = await this.calculateChecksum(processedContent);

      // Encrypt if needed
      if (metadata.isEncrypted) {
        const encryptionResult = await this.encryptContent(processedContent);
        processedContent = encryptionResult.data;
      }

      // Store new content
      const documentContent: DocumentContent = {
        data: processedContent,
        compressed,
        encoding: 'binary'
      };

      await this.storeInDatabase('content', { id: documentId, ...documentContent });
      this.content.set(documentId, documentContent);

      // Create version record
      const version: DocumentVersion = {
        id: this.generateId(),
        documentId,
        version: newVersion,
        size: newContent.size,
        uploadedAt: now,
        uploadedBy: this.currentUserId,
        changes: 'Content updated',
        checksum,
        isActive: true
      };

      // Deactivate previous version
      const versions = this.versions.get(documentId) || [];
      versions.forEach(v => v.isActive = false);
      versions.push(version);

      await this.storeInDatabase('versions', version);
      this.versions.set(documentId, versions);

      // Update metadata with new content info
      updates = {
        ...updates,
        size: newContent.size,
        compressedSize: compressed ? compressedSize : undefined,
        type: newContent.type,
        checksum
      };
    }

    // Update metadata
    const updatedMetadata: DocumentMetadata = {
      ...metadata,
      ...updates,
      lastModified: now,
      version: newVersion,
      isSynced: false,
      syncStatus: 'pending'
    };

    await this.storeInDatabase('metadata', updatedMetadata);
    this.metadata.set(documentId, updatedMetadata);

    this.emit('document_updated', { documentId, metadata: updatedMetadata, hasNewContent: !!newContent });
  }

  // Document deletion
  async deleteDocument(documentId: string, permanent = false): Promise<void> {
    if (!this.initialized) await this.initialize();

    const metadata = this.metadata.get(documentId);
    if (!metadata) {
      throw new Error('Document not found');
    }

    if (!this.hasPermission(metadata, 'delete')) {
      throw new Error('Insufficient permissions to delete document');
    }

    if (permanent) {
      // Permanent deletion - remove from storage
      await this.deleteFromDatabase('metadata', documentId);
      await this.deleteFromDatabase('content', documentId);
      await this.deleteFromDatabase('thumbnails', documentId);

      // Delete all versions
      const versions = this.versions.get(documentId) || [];
      for (const version of versions) {
        await this.deleteFromDatabase('versions', version.id);
      }

      this.metadata.delete(documentId);
      this.content.delete(documentId);
      this.versions.delete(documentId);

      this.emit('document_deleted_permanently', { documentId });
    } else {
      // Soft deletion - mark as deleted
      const deletedMetadata: DocumentMetadata = {
        ...metadata,
        isDeleted: true,
        deletedAt: new Date(),
        lastModified: new Date(),
        isSynced: false,
        syncStatus: 'pending'
      };

      await this.storeInDatabase('metadata', deletedMetadata);
      this.metadata.set(documentId, deletedMetadata);

      this.emit('document_deleted', { documentId });
    }
  }

  // Document restoration
  async restoreDocument(documentId: string): Promise<void> {
    if (!this.initialized) await this.initialize();

    const metadata = this.metadata.get(documentId);
    if (!metadata || !metadata.isDeleted) {
      throw new Error('Document not found or not deleted');
    }

    if (!this.hasPermission(metadata, 'write')) {
      throw new Error('Insufficient permissions to restore document');
    }

    const restoredMetadata: DocumentMetadata = {
      ...metadata,
      isDeleted: false,
      deletedAt: undefined,
      lastModified: new Date(),
      isSynced: false,
      syncStatus: 'pending'
    };

    await this.storeInDatabase('metadata', restoredMetadata);
    this.metadata.set(documentId, restoredMetadata);

    this.emit('document_restored', { documentId });
  }

  // Thumbnail generation
  private async generateThumbnail(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Thumbnail generation only supports images'));
        return;
      }

      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      img.onload = () => {
        // Calculate thumbnail dimensions (max 200x200, maintain aspect ratio)
        const maxSize = 200;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            blob.arrayBuffer().then(resolve).catch(reject);
          } else {
            reject(new Error('Failed to generate thumbnail blob'));
          }
        }, 'image/jpeg', 0.8);
      };

      img.onerror = () => reject(new Error('Failed to load image for thumbnail'));
      img.src = URL.createObjectURL(file);
    });
  }

  // File compression
  private async compressFile(file: File, options?: DocumentCompressionOptions): Promise<{ data: ArrayBuffer; size: number }> {
    if (file.type.startsWith('image/')) {
      return this.compressImage(file, options);
    }

    // For other file types, we could implement different compression strategies
    // For now, return original file
    const data = await file.arrayBuffer();
    return { data, size: data.byteLength };
  }

  private async compressImage(file: File, options?: DocumentCompressionOptions): Promise<{ data: ArrayBuffer; size: number }> {
    return new Promise((resolve, reject) => {
      const {
        quality = 80,
        maxWidth = 1920,
        maxHeight = 1080,
        format = 'image/jpeg',
        stripMetadata = true
      } = options || {};

      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      img.onload = () => {
        let { width, height } = img;

        // Resize if needed
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;
        
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            blob.arrayBuffer().then(data => {
              resolve({ data, size: data.byteLength });
            }).catch(reject);
          } else {
            reject(new Error('Failed to compress image'));
          }
        }, format, quality / 100);
      };

      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.src = URL.createObjectURL(file);
    });
  }

  // Content encryption/decryption
  private async encryptContent(data: ArrayBuffer): Promise<{ data: ArrayBuffer; key: string }> {
    const key = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    const exportedKey = await crypto.subtle.exportKey('raw', key);
    const keyString = btoa(String.fromCharCode(...new Uint8Array(exportedKey)));

    return {
      data: combined.buffer,
      key: keyString
    };
  }

  private async decryptContent(encryptedData: ArrayBuffer, keyString: string): Promise<ArrayBuffer> {
    const keyData = new Uint8Array(atob(keyString).split(').map(char => char.charCodeAt(0)));
    
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );

    const dataArray = new Uint8Array(encryptedData);
    const iv = dataArray.slice(0, 12);
    const encrypted = dataArray.slice(12);

    return await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    );
  }

  // Content decompression
  private async decompressContent(compressedData: ArrayBuffer, mimeType: string): Promise<ArrayBuffer> {
    // This is a simplified implementation
    // In a real scenario, you'd use appropriate decompression libraries
    return compressedData;
  }

  // Storage management
  async getStorageStats(): Promise<DocumentStorageStats> {
    if (!this.initialized) await this.initialize();

    const documents = Array.from(this.metadata.values()).filter(doc => !doc.isDeleted);
    
    const totalSize = documents.reduce((sum, doc) => sum + doc.size, 0);
    const compressedSize = documents.reduce((sum, doc) => sum + (doc.compressedSize || doc.size), 0);
    
    const categoryCounts = documents.reduce((counts, doc) => {
      counts[doc.category] = (counts[doc.category] || 0) + 1;
      return counts;
    }, {} as Record<DocumentCategory, number>);

    const syncedCount = documents.filter(doc => doc.isSynced).length;
    const pendingCount = documents.filter(doc => doc.syncStatus === 'pending').length;
    const failedCount = documents.filter(doc => doc.syncStatus === 'failed').length;

    const uploadDates = documents.map(doc => doc.uploadedAt);
    const oldestDocument = uploadDates.length > 0 ? new Date(Math.min(...uploadDates.map(d => d.getTime()))) : undefined;
    const newestDocument = uploadDates.length > 0 ? new Date(Math.max(...uploadDates.map(d => d.getTime()))) : undefined;

    return {
      totalDocuments: documents.length,
      totalSize,
      compressedSize,
      compressionRatio: totalSize > 0 ? totalSize / compressedSize : 1,
      categoryCounts,
      syncedCount,
      pendingCount,
      failedCount,
      averageFileSize: documents.length > 0 ? totalSize / documents.length : 0,
      storageUsed: compressedSize,
      storageLimit: this.storageLimit,
      oldestDocument,
      newestDocument
    };
  }

  private async checkStorageCapacity(newFileSize: number): Promise<void> {
    const stats = await this.getStorageStats();
    if (stats.storageUsed + newFileSize > this.storageLimit) {
      throw new Error('Storage limit exceeded. Used: ${this.formatFileSize(stats.storageUsed)}, Limit: ${this.formatFileSize(this.storageLimit)}');
    }
  }

  // Cleanup and maintenance
  private async setupCleanupTasks(): Promise<void> {
    // Clean up deleted documents older than 30 days
    setInterval(async () => {
      await this.cleanupDeletedDocuments();
    }, 24 * 60 * 60 * 1000); // Daily

    // Clean up failed uploads
    setInterval(async () => {
      await this.cleanupFailedUploads();
    }, 60 * 60 * 1000); // Hourly
  }

  private async cleanupDeletedDocuments(): Promise<void> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const toDelete = Array.from(this.metadata.values()).filter(doc => 
      doc.isDeleted && doc.deletedAt && doc.deletedAt < thirtyDaysAgo
    );

    for (const doc of toDelete) {
      await this.deleteDocument(doc.id, true);
    }

    if (toDelete.length > 0) {
      this.emit('cleanup_completed', { deletedCount: toDelete.length });
    }
  }

  private async cleanupFailedUploads(): Promise<void> {
    // Implementation for cleaning up failed uploads
    // This would involve removing orphaned content without metadata
  }

  // Database operations
  private async storeInDatabase(storeName: string, data: unknown): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async loadFromDatabase<T>(storeName: string, key: string): Promise<T | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  private async deleteFromDatabase(storeName: string, key: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async loadMetadataFromStorage(): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['metadata'], 'readonly');
      const store = transaction.objectStore('metadata');
      const request = store.getAll();

      request.onsuccess = () => {
        const documents: DocumentMetadata[] = request.result || [];
        documents.forEach(doc => {
          // Convert date strings back to Date objects
          doc.uploadedAt = new Date(doc.uploadedAt);
          doc.lastModified = new Date(doc.lastModified);
          if (doc.syncedAt) doc.syncedAt = new Date(doc.syncedAt);
          if (doc.lastSyncAttempt) doc.lastSyncAttempt = new Date(doc.lastSyncAttempt);
          if (doc.deletedAt) doc.deletedAt = new Date(doc.deletedAt);
          if (doc.expiresAt) doc.expiresAt = new Date(doc.expiresAt);
          
          this.metadata.set(doc.id, doc);
        });
        resolve();
      };

      request.onerror = () => reject(request.error);
    });
  }

  private async loadMetadataFromDatabase(documentId: string): Promise<DocumentMetadata | null> {
    const metadata = await this.loadFromDatabase<DocumentMetadata>('metadata', documentId);
    if (metadata) {
      // Convert date strings back to Date objects
      metadata.uploadedAt = new Date(metadata.uploadedAt);
      metadata.lastModified = new Date(metadata.lastModified);
      if (metadata.syncedAt) metadata.syncedAt = new Date(metadata.syncedAt);
      if (metadata.lastSyncAttempt) metadata.lastSyncAttempt = new Date(metadata.lastSyncAttempt);
      if (metadata.deletedAt) metadata.deletedAt = new Date(metadata.deletedAt);
      if (metadata.expiresAt) metadata.expiresAt = new Date(metadata.expiresAt);
      
      this.metadata.set(documentId, metadata);
    }
    return metadata;
  }

  private async loadContentFromDatabase(documentId: string): Promise<DocumentContent | null> {
    const content = await this.loadFromDatabase<DocumentContent & { id: string }>('content', documentId);
    if (content) {
      const documentContent = { data: content.data, compressed: content.compressed, encoding: content.encoding };
      this.content.set(documentId, documentContent);
      return documentContent;
    }
    return null;
  }

  // Utility methods
  private generateId(): string {
    return 'doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}';
  }

  private generateDocumentName(originalName: string, category: DocumentCategory): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const extension = originalName.split('.').pop();
    const baseName = originalName.replace(/\.[^/.]+$/, ');
    return '${category}_${baseName}_${timestamp}${extension ? '.' + extension : '}';
  }

  private async calculateChecksum(data: ArrayBuffer): Promise<string> {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join(');
  }

  private async findDuplicateByChecksum(checksum: string): Promise<DocumentMetadata | null> {
    for (const doc of this.metadata.values()) {
      if (doc.checksum === checksum && !doc.isDeleted) {
        return doc;
      }
    }
    return null;
  }

  private isCompressible(mimeType: string): boolean {
    return mimeType.startsWith('image/') && !mimeType.includes('svg');
  }

  private canGeneratePreview(mimeType: string): boolean {
    return mimeType.startsWith('image/') || mimeType.startsWith('text/') || mimeType === 'application/pdf';
  }

  private canGenerateThumbnail(mimeType: string): boolean {
    return mimeType.startsWith('image/') && !mimeType.includes('svg');
  }

  private isSensitive(category: DocumentCategory): boolean {
    const sensitiveCategories = ['contract', 'license', 'certification', 'employee_file', 'customer_file'];
    return sensitiveCategories.includes(category);
  }

  private hasPermission(document: DocumentMetadata, action: 'read' | 'write' | 'delete' | 'share'): boolean {
    const permissions = document.permissions;
    
    // Owner has all permissions
    if (permissions.owner === this.currentUserId) return true;
    
    // Check specific permission
    return permissions[action].includes(this.currentUserId) || 
           permissions[action].includes('*') ||
           permissions[action].some(role => this.userHasRole(role));
  }

  private userHasRole(role: string): boolean {
    // Mock implementation - would integrate with actual role system
    return false;
  }

  private getCurrentIndustry(): 'hs' | 'rest' | 'auto' | 'ret' | 'courses' | 'payroll' {
    // Mock implementation - would get from context or URL
    return 'hs';
  }

  private formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  // Sync operations (to be implemented with background sync)
  async markForSync(documentIds: string[]): Promise<void> {
    for (const documentId of documentIds) {
      const metadata = this.metadata.get(documentId);
      if (metadata && !metadata.isDeleted) {
        metadata.syncStatus = 'pending';
        metadata.isSynced = false;
        await this.storeInDatabase('metadata', metadata);
        this.emit('sync_queued', { documentId });
      }
    }
  }

  async getPendingSyncDocuments(): Promise<DocumentMetadata[]> {
    return Array.from(this.metadata.values()).filter(doc => 
      !doc.isDeleted && doc.syncStatus === 'pending'
    );
  }

  // Public API methods
  getDocumentsByCategory(category: DocumentCategory): DocumentMetadata[] {
    return Array.from(this.metadata.values()).filter(doc => 
      doc.category === category && !doc.isDeleted && this.hasPermission(doc, 'read')
    );
  }

  getDocumentsByEntity(entityType: string, entityId: string): DocumentMetadata[] {
    return Array.from(this.metadata.values()).filter(doc => 
      doc.relatedEntityType === entityType && 
      doc.relatedEntityId === entityId && 
      !doc.isDeleted && 
      this.hasPermission(doc, 'read')
    );
  }

  async getDocumentVersions(documentId: string): Promise<DocumentVersion[]> {
    if (!this.initialized) await this.initialize();
    
    const metadata = this.metadata.get(documentId);
    if (!metadata || !this.hasPermission(metadata, 'read')) {
      return [];
    }

    return this.versions.get(documentId) || [];
  }

  async getThumbnail(documentId: string): Promise<ArrayBuffer | null> {
    if (!this.initialized) await this.initialize();
    
    const metadata = this.metadata.get(documentId);
    if (!metadata || !this.hasPermission(metadata, 'read')) {
      return null;
    }

    const thumbnail = await this.loadFromDatabase<{ documentId: string; data: ArrayBuffer }>('thumbnails', documentId);
    return thumbnail?.data || null;
  }
}

// Factory function
export function createDocumentManager(): OfflineDocumentManager {
  return OfflineDocumentManager.getInstance();
}

// React hook
export function useOfflineDocuments() {
  const manager = OfflineDocumentManager.getInstance();
  
  return {
    uploadDocument: manager.uploadDocument.bind(manager),
    getDocument: manager.getDocument.bind(manager),
    searchDocuments: manager.searchDocuments.bind(manager),
    updateDocument: manager.updateDocument.bind(manager),
    deleteDocument: manager.deleteDocument.bind(manager),
    restoreDocument: manager.restoreDocument.bind(manager),
    getStorageStats: manager.getStorageStats.bind(manager),
    getDocumentsByCategory: manager.getDocumentsByCategory.bind(manager),
    getDocumentsByEntity: manager.getDocumentsByEntity.bind(manager),
    getDocumentVersions: manager.getDocumentVersions.bind(manager),
    getThumbnail: manager.getThumbnail.bind(manager),
    markForSync: manager.markForSync.bind(manager),
    getPendingSyncDocuments: manager.getPendingSyncDocuments.bind(manager),
    on: manager.on.bind(manager),
    off: manager.off.bind(manager)
  };
}