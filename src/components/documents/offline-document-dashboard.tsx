'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  FileText,
  Upload,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  FolderOpen,
  Image,
  Video,
  Audio,
  File,
  Archive,
  Paperclip,
  Calendar,
  User,
  Building,
  Tag,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Plus,
  Grid,
  List,
  SortAsc,
  SortDesc,
  MoreHorizontal,
  Share,
  Copy,
  Star,
  Archive as ArchiveIcon,
  Restore,
  Zap,
  HardDrive,
  BarChart3,
  Settings,
  X,
  ChevronDown,
  ChevronRight,
  Folder,
  ImageIcon,
  PlayCircle,
  Headphones,
  FileImage,
  Maximize2,
  Info
} from 'lucide-react';

import { useOfflineDocuments } from '@/lib/offline-document-manager';
import type { DocumentMetadata, DocumentFilter, DocumentSearchResult, DocumentStorageStats } from '@/lib/offline-document-manager';

type DocumentCategory = 
  | 'invoice' | 'estimate' | 'receipt' | 'contract' | 'photo' | 'video'
  | 'audio' | 'document' | 'form' | 'signature' | 'license' | 'certification'
  | 'work_order' | 'appointment' | 'customer_file' | 'employee_file'
  | 'vehicle_document' | 'menu_item' | 'recipe' | 'inventory' | 'compliance'
  | 'training' | 'marketing' | 'communication' | 'other';

interface DocumentDashboardState {
  documents: DocumentMetadata[];
  searchResults: DocumentSearchResult | null;
  storageStats: DocumentStorageStats | null;
  loading: boolean;
  uploading: boolean;
  error: string | null;
  selectedDocuments: Set<string>;
  viewMode: 'grid' | 'list';
  sortBy: 'name' | 'uploadedAt' | 'size' | 'category';
  sortOrder: 'asc' | 'desc';
  filter: DocumentFilter;
  searchQuery: string;
  showDeleted: boolean;
  uploadProgress: number;
  previewDocument: DocumentMetadata | null;
  editDocument: DocumentMetadata | null;
}

export default function OfflineDocumentDashboard() {
  const [state, setState] = useState<DocumentDashboardState>({
    documents: [],
    searchResults: null,
    storageStats: null,
    loading: false,
    uploading: false,
    error: null,
    selectedDocuments: new Set(),
    viewMode: 'grid',
    sortBy: 'uploadedAt',
    sortOrder: 'desc',
    filter: Record<string, unknown>,
    searchQuery: ',
    showDeleted: false,
    uploadProgress: 0,
    previewDocument: null,
    editDocument: null
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);

  const documentManager = useOfflineDocuments();

  // Load documents and stats
  const loadData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const filter: DocumentFilter = {
        ...state.filter,
        searchQuery: state.searchQuery || undefined
      };

      const [searchResults, storageStats] = await Promise.all([
        documentManager.searchDocuments(filter, {
          sortBy: state.sortBy,
          sortOrder: state.sortOrder,
          limit: 50
        }),
        documentManager.getStorageStats()
      ]);

      setState(prev => ({
        ...prev,
        searchResults,
        storageStats,
        documents: searchResults.documents,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load documents',
        loading: false
      }));
    }
  }, [documentManager, state.filter, state.searchQuery, state.sortBy, state.sortOrder]);

  // Set up event listeners
  useEffect(() => {
    loadData();

    const handleDocumentUploaded = () => loadData();
    const handleDocumentUpdated = () => loadData();
    const handleDocumentDeleted = () => loadData();
    const handleStorageUpdated = () => loadData();

    documentManager.on('document_uploaded', handleDocumentUploaded);
    documentManager.on('document_updated', handleDocumentUpdated);
    documentManager.on('document_deleted', handleDocumentDeleted);
    documentManager.on('storage_updated', handleStorageUpdated);

    return () => {
      documentManager.off('document_uploaded', handleDocumentUploaded);
      documentManager.off('document_updated', handleDocumentUpdated);
      documentManager.off('document_deleted', handleDocumentDeleted);
      documentManager.off('storage_updated', handleStorageUpdated);
    };
  }, [loadData, documentManager]);

  // File upload handling
  const handleFileUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    setState(prev => ({ ...prev, uploading: true, uploadProgress: 0 }));

    try {
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        
        await documentManager.uploadDocument(file, {
          category: inferCategory(file),
          tags: [],
          description: 'Uploaded ${file.name}',
          isPublic: false
        });

        setState(prev => ({ ...prev, uploadProgress: ((i + 1) / fileArray.length) * 100 }));
      }

      setState(prev => ({ ...prev, uploading: false, uploadProgress: 0 }));
      await loadData();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Upload failed',
        uploading: false,
        uploadProgress: 0
      }));
    }
  };

  // Drag and drop handling
  useEffect(() => {
    const dropzone = dropzoneRef.current;
    if (!dropzone) return;

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      dropzone.classList.add('drag-over');
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dropzone.classList.remove('drag-over');
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      dropzone.classList.remove('drag-over');
      
      if (e.dataTransfer?.files) {
        handleFileUpload(e.dataTransfer.files);
      }
    };

    dropzone.addEventListener('dragover', handleDragOver);
    dropzone.addEventListener('dragleave', handleDragLeave);
    dropzone.addEventListener('drop', handleDrop);

    return () => {
      dropzone.removeEventListener('dragover', handleDragOver);
      dropzone.removeEventListener('dragleave', handleDragLeave);
      dropzone.removeEventListener('drop', handleDrop);
    };
  }, []);

  const inferCategory = (file: File): DocumentCategory => {
    const type = file.type.toLowerCase();
    const name = file.name.toLowerCase();

    if (type.startsWith('image/')) return 'photo';
    if (type.startsWith('video/')) return 'video';
    if (type.startsWith('audio/')) return 'audio';
    if (type === 'application/pdf') {
      if (name.includes('invoice')) return 'invoice';
      if (name.includes('estimate')) return 'estimate';
      if (name.includes('receipt')) return 'receipt';
      if (name.includes('contract')) return 'contract';
      return 'document';
    }
    return 'document';
  };

  const getFileIcon = (document: DocumentMetadata) => {
    const type = document.type.toLowerCase();
    
    if (type.startsWith('image/')) return ImageIcon;
    if (type.startsWith('video/')) return PlayCircle;
    if (type.startsWith('audio/')) return Headphones;
    if (type === 'application/pdf') return FileText;
    if (type.includes('word')) return FileText;
    if (type.includes('excel')) return BarChart3;
    if (type.includes('powerpoint')) return FileText;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getCategoryColor = (category: DocumentCategory) => {
    const colors = {
      invoice: 'bg-green-500',
      estimate: 'bg-blue-500',
      receipt: 'bg-purple-500',
      contract: 'bg-red-500',
      photo: 'bg-pink-500',
      video: 'bg-cyan-500',
      audio: 'bg-orange-500',
      document: 'bg-neutral-500',
      form: 'bg-yellow-500',
      signature: 'bg-indigo-500'
    };
    return colors[category as keyof typeof colors] || 'bg-neutral-500';
  };

  const handleDocumentAction = async (action: string, documentId: string) => {
    try {
      switch (action) {
        case 'delete':
          await documentManager.deleteDocument(documentId);
          break;
        case 'restore':
          await documentManager.restoreDocument(documentId);
          break;
        case 'download':
          const docData = await documentManager.getDocument(documentId);
          if (docData?.content) {
            const blob = new Blob([docData.content], { type: docData.metadata.type });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = docData.metadata.originalName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }
          break;
      }
      await loadData();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to ${action} document'
      }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Document Manager</h1>
          <p className="text-neutral-400">Upload, organize, and manage all your business documents</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Files
          </Button>
          <Button variant="outline" onClick={loadData} disabled={state.loading}>
            {state.loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Storage Stats */}
      {state.storageStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-400">Total Documents</p>
                  <p className="text-2xl font-bold text-white">{state.storageStats.totalDocuments}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-400">Storage Used</p>
                  <p className="text-2xl font-bold text-white">{formatFileSize(state.storageStats.storageUsed)}</p>
                  <p className="text-xs text-neutral-500">
                    {formatFileSize(state.storageStats.storageLimit)} limit
                  </p>
                </div>
                <HardDrive className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-400">Compression Ratio</p>
                  <p className="text-2xl font-bold text-white">
                    {state.storageStats.compressionRatio.toFixed(1)}x
                  </p>
                  <p className="text-xs text-neutral-500">Space saved</p>
                </div>
                <Archive className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-400">Sync Status</p>
                  <p className="text-2xl font-bold text-white">{state.storageStats.syncedCount}</p>
                  <p className="text-xs text-neutral-500">
                    {state.storageStats.pendingCount} pending
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Storage Usage Progress */}
      {state.storageStats && (
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-400">Storage Usage</span>
                <span className="text-white">
                  {formatFileSize(state.storageStats.storageUsed)} / {formatFileSize(state.storageStats.storageLimit)}
                  ({((state.storageStats.storageUsed / state.storageStats.storageLimit) * 100).toFixed(1)}%)
                </span>
              </div>
              <Progress 
                value={(state.storageStats.storageUsed / state.storageStats.storageLimit) * 100} 
                className="h-2" 
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  placeholder="Search documents..."
                  value={state.searchQuery}
                  onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
                  className="pl-10 bg-neutral-800 border-neutral-700"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select 
                value={state.filter.category || '`} 
                onValueChange={(value) => setState(prev => ({ 
                  ...prev, 
                  filter: { ...prev.filter, category: value as DocumentCategory || undefined }
                }))}
              >
                <SelectTrigger className="w-40 bg-neutral-800 border-neutral-700">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  <SelectItem value="invoice">Invoice</SelectItem>
                  <SelectItem value="estimate">Estimate</SelectItem>
                  <SelectItem value="receipt">Receipt</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="photo">Photo</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="form">Form</SelectItem>
                  <SelectItem value="signature">Signature</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={'${state.sortBy}_${state.sortOrder}'} 
                onValueChange={(value) => {
                  const [sortBy, sortOrder] = value.split('_');
                  setState(prev => ({ 
                    ...prev, 
                    sortBy: sortBy as any, 
                    sortOrder: sortOrder as any 
                  }));
                }}
              >
                <SelectTrigger className="w-40 bg-neutral-800 border-neutral-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="uploadedAt_desc">Newest First</SelectItem>
                  <SelectItem value="uploadedAt_asc">Oldest First</SelectItem>
                  <SelectItem value="name_asc">Name A-Z</SelectItem>
                  <SelectItem value="name_desc">Name Z-A</SelectItem>
                  <SelectItem value="size_desc">Largest First</SelectItem>
                  <SelectItem value="size_asc">Smallest First</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex border rounded-md bg-neutral-800 border-neutral-700">
                <Button
                  variant={state.viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setState(prev => ({ ...prev, viewMode: 'grid' }))}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={state.viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setState(prev => ({ ...prev, viewMode: 'list' }))}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Dropzone */}
      <div
        ref={dropzoneRef}
        className="border-2 border-dashed border-neutral-700 rounded-lg p-8 text-center transition-colors hover:border-neutral-600 drag-over:border-blue-500 drag-over:bg-blue-500/10"
      >
        <Upload className="h-12 w-12 text-neutral-500 mx-auto mb-4" />
        <p className="text-lg text-white mb-2">Drop files here to upload</p>
        <p className="text-neutral-400 mb-4">or click the button to browse</p>
        <Button onClick={() => fileInputRef.current?.click()}>
          Choose Files
        </Button>
        
        {state.uploading && (
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-neutral-400">Uploading...</span>
              <span className="text-white">{Math.round(state.uploadProgress)}%</span>
            </div>
            <Progress value={state.uploadProgress} className="h-2" />
          </div>
        )}
      </div>

      {/* Document Grid/List */}
      <div className="space-y-4">
        {state.searchResults && (
          <div className="flex items-center justify-between">
            <p className="text-neutral-400">
              {state.searchResults.totalCount} documents found
              {state.searchResults.totalSize > 0 && (
                <span> • {formatFileSize(state.searchResults.totalSize)} total</span>
              )}
            </p>
          </div>
        )}

        {state.viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {state.documents.map(document => {
              const Icon = getFileIcon(document);
              
              return (
                <Card key={document.id} className="bg-neutral-900 border-neutral-800 hover:border-neutral-700 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <Icon className="h-8 w-8 text-blue-500" />
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setState(prev => ({ ...prev, previewDocument: document }))}>
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDocumentAction('download', document.id)}>
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDocumentAction('delete`, document.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <h3 className="text-white font-medium text-sm mb-1 truncate" title={document.name}>
                      {document.name}
                    </h3>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-xs ${getCategoryColor(document.category)}'}>
                          {document.category}
                        </Badge>
                        {!document.isSynced && (
                          <Badge variant="outline" className="text-xs">
                            {document.syncStatus}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-xs text-neutral-400 space-y-1">
                        <div>{formatFileSize(document.size)}</div>
                        <div>{document.uploadedAt.toLocaleDateString()}</div>
                        {document.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {document.tags.slice(0, 2).map(tag => (
                              <span key={tag} className="bg-neutral-800 px-1 rounded text-xs">
                                {tag}
                              </span>
                            ))}
                            {document.tags.length > 2 && (
                              <span className="text-xs">+{document.tags.length - 2}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {state.documents.map(document => {
              const Icon = getFileIcon(document);
              
              return (
                <Card key={document.id} className="bg-neutral-900 border-neutral-800">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Icon className="h-8 w-8 text-blue-500" />
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium truncate">{document.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-neutral-400">
                          <span>{formatFileSize(document.size)}</span>
                          <span>{document.uploadedAt.toLocaleDateString()}</span>
                          <Badge variant="outline" className={'text-xs ${getCategoryColor(document.category)}'}>
                            {document.category}
                          </Badge>
                          {!document.isSynced && (
                            <Badge variant="outline" className="text-xs">
                              {document.syncStatus}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setState(prev => ({ ...prev, previewDocument: document }))}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDocumentAction('download', document.id)}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setState(prev => ({ ...prev, editDocument: document }))}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDocumentAction('delete', document.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {state.documents.length === 0 && !state.loading && (
          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="p-8 text-center">
              <FolderOpen className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
              <p className="text-neutral-400">No documents found</p>
              <p className="text-neutral-500 text-sm">Upload your first document to get started</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) {
            handleFileUpload(e.target.files);
            e.target.value = ';
          }
        }}
      />

      {/* Document Preview Dialog */}
      {state.previewDocument && (
        <Dialog open={!!state.previewDocument} onOpenChange={() => setState(prev => ({ ...prev, previewDocument: null }))}>
          <DialogContent className="max-w-4xl bg-neutral-900 border-neutral-800">
            <DialogHeader>
              <DialogTitle className="text-white">{state.previewDocument.name}</DialogTitle>
              <DialogDescription>
                {state.previewDocument.description || 'Document preview'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-neutral-400">Size:</span>
                  <span className="text-white ml-2">{formatFileSize(state.previewDocument.size)}</span>
                </div>
                <div>
                  <span className="text-neutral-400">Type:</span>
                  <span className="text-white ml-2">{state.previewDocument.type}</span>
                </div>
                <div>
                  <span className="text-neutral-400">Category:</span>
                  <Badge variant="outline" className={'ml-2 ${getCategoryColor(state.previewDocument.category)}'}>
                    {state.previewDocument.category}
                  </Badge>
                </div>
                <div>
                  <span className="text-neutral-400">Uploaded:</span>
                  <span className="text-white ml-2">{state.previewDocument.uploadedAt.toLocaleString()}</span>
                </div>
              </div>
              
              {state.previewDocument.tags.length > 0 && (
                <div>
                  <span className="text-neutral-400">Tags:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {state.previewDocument.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button onClick={() => handleDocumentAction('download', state.previewDocument!.id)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" onClick={() => setState(prev => ({ ...prev, editDocument: prev.previewDocument, previewDocument: null }))}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Error Display */}
      {state.error && (
        <Card className="bg-red-900/20 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-400">{state.error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setState(prev => ({ ...prev, error: null }))}
                className="ml-auto"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}