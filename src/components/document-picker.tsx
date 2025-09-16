'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search,
  Filter,
  FileText,
  Image,
  Video,
  Music,
  File,
  CheckCircle,
  Loader2,
  X,
  Grid,
  List,
  Calendar,
  Tag,
  User,
  Building,
  Eye,
  Plus
} from 'lucide-react';

import { useOfflineDocuments } from '@/lib/offline-document-manager';
import type { DocumentMetadata, DocumentFilter, DocumentCategory } from '@/lib/offline-document-manager';

interface DocumentPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (documents: DocumentMetadata[]) => void;
  selectedDocuments?: DocumentMetadata[];
  multiSelect?: boolean;
  filter?: Partial<DocumentFilter>;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  emptyText?: string;
  maxSelection?: number;
  showPreview?: boolean;
  viewMode?: 'grid' | 'list';
}

export default function DocumentPicker({
  open,
  onOpenChange,
  onSelect,
  selectedDocuments = [],
  multiSelect = true,
  filter: initialFilter = {},
  title = 'Select Documents',
  description = 'Choose documents from your library',
  confirmText = 'Select',
  cancelText = 'Cancel',
  emptyText = 'No documents found',
  maxSelection,
  showPreview = true,
  viewMode: initialViewMode = 'grid'
}: DocumentPickerProps) {
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(');
  const [categoryFilter, setCategoryFilter] = useState<DocumentCategory | '>(');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(initialViewMode);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(selectedDocuments.map(doc => doc.id))
  );
  const [previewDocument, setPreviewDocument] = useState<DocumentMetadata | null>(null);

  const documentManager = useOfflineDocuments();

  // Load documents
  const loadDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const filter: DocumentFilter = {
        ...initialFilter,
        category: categoryFilter || undefined,
        searchQuery: searchQuery || undefined
      };

      const searchResults = await documentManager.searchDocuments(filter, {
        sortBy: 'uploadedAt',
        sortOrder: 'desc',
        limit: 100
      });

      setDocuments(searchResults.documents);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, [documentManager, initialFilter, categoryFilter, searchQuery]);

  // Load documents when filters change
  useEffect(() => {
    if (open) {
      loadDocuments();
    }
  }, [open, loadDocuments]);

  // Reset search when dialog opens
  useEffect(() => {
    if (open) {
      setSearchQuery(');
      setCategoryFilter(');
      setSelectedIds(new Set(selectedDocuments.map(doc => doc.id)));
    }
  }, [open, selectedDocuments]);

  const handleDocumentToggle = (document: DocumentMetadata) => {
    if (!multiSelect) {
      // Single select mode
      setSelectedIds(new Set([document.id]));
      return;
    }

    // Multi-select mode
    const newSelected = new Set(selectedIds);
    
    if (newSelected.has(document.id)) {
      newSelected.delete(document.id);
    } else {
      // Check max selection limit
      if (maxSelection && newSelected.size >= maxSelection) {
        setError('Maximum ${maxSelection} documents can be selected');
        return;
      }
      newSelected.add(document.id);
    }
    
    setSelectedIds(newSelected);
    setError(null);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === documents.length) {
      // Deselect all
      setSelectedIds(new Set());
    } else {
      // Select all (respecting max limit)
      const documentsToSelect = maxSelection 
        ? documents.slice(0, maxSelection)
        : documents;
      setSelectedIds(new Set(documentsToSelect.map(doc => doc.id)));
    }
  };

  const handleConfirm = () => {
    const selectedDocuments = documents.filter(doc => selectedIds.has(doc.id));
    onSelect(selectedDocuments);
    onOpenChange(false);
  };

  const getFileIcon = (document: DocumentMetadata) => {
    const type = document.type.toLowerCase();
    
    if (type.startsWith('image/')) return Image;
    if (type.startsWith('video/')) return Video;
    if (type.startsWith('audio/')) return Music;
    if (type === 'application/pdf' || type.includes('document')) return FileText;
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
      invoice: 'bg-green-500/20 text-green-400 border-green-500/30',
      estimate: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      receipt: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      contract: 'bg-red-500/20 text-red-400 border-red-500/30',
      photo: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      video: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      audio: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      document: 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30',
      form: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      signature: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
    };
    return colors[category as keyof typeof colors] || colors.document;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] bg-neutral-900 border-neutral-800">
        <DialogHeader>
          <DialogTitle className="text-white">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-neutral-800 border-neutral-700"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as DocumentCategory | ')}>
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

              <div className="flex border rounded-md bg-neutral-800 border-neutral-700">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Selection Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <p className="text-sm text-neutral-400">
                {documents.length} documents available
                {selectedIds.size > 0 && (
                  <span className="text-white ml-2">• {selectedIds.size} selected</span>
                )}
                {maxSelection && (
                  <span className="text-neutral-500 ml-2">• Max {maxSelection}</span>
                )}
              </p>
              
              {multiSelect && documents.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  disabled={loading}
                >
                  {selectedIds.size === documents.length ? 'Deselect All' : 'Select All'}
                </Button>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={loadDocuments}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
            </Button>
          </div>

          {/* Document List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-400">{error}</p>
                <Button variant="outline" onClick={loadDocuments} className="mt-2">
                  Try Again
                </Button>
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
                <p className="text-neutral-400">{emptyText}</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {documents.map(document => {
                  const Icon = getFileIcon(document);
                  const isSelected = selectedIds.has(document.id);
                  
                  return (
                    <Card 
                      key={document.id}
                      className={'cursor-pointer transition-colors hover:border-neutral-600 ${
                        isSelected 
                          ? 'bg-blue-500/20 border-blue-500/50' 
                          : 'bg-neutral-900 border-neutral-800`
                      }`}
                      onClick={() => handleDocumentToggle(document)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <Icon className="h-6 w-6 text-blue-500" />
                          <div className="flex gap-1">
                            {showPreview && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPreviewDocument(document);
                                }}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                            )}
                            <Checkbox
                              checked={isSelected}
                              onChange={() => handleDocumentToggle(document)}
                              className="h-4 w-4"
                            />
                          </div>
                        </div>
                        
                        <h4 className="text-white text-xs font-medium mb-1 truncate" title={document.name}>
                          {document.name}
                        </h4>
                        
                        <div className="space-y-1">
                          <Badge variant="outline" className={'text-xs ${getCategoryColor(document.category)}'}>
                            {document.category}
                          </Badge>
                          
                          <div className="text-xs text-neutral-400">
                            <div>{formatFileSize(document.size)}</div>
                            <div>{document.uploadedAt.toLocaleDateString()}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map(document => {
                  const Icon = getFileIcon(document);
                  const isSelected = selectedIds.has(document.id);
                  
                  return (
                    <Card 
                      key={document.id}
                      className={'cursor-pointer transition-colors hover:border-neutral-600 ${
                        isSelected 
                          ? 'bg-blue-500/20 border-blue-500/50' 
                          : 'bg-neutral-900 border-neutral-800`
                      }`}
                      onClick={() => handleDocumentToggle(document)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={isSelected}
                            onChange={() => handleDocumentToggle(document)}
                            className="h-4 w-4"
                          />
                          
                          <Icon className="h-6 w-6 text-blue-500" />
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-medium truncate">{document.name}</h4>
                            <div className="flex items-center gap-4 text-sm text-neutral-400">
                              <span>{formatFileSize(document.size)}</span>
                              <span>{document.uploadedAt.toLocaleDateString()}</span>
                              <Badge variant="outline" className={'text-xs ${getCategoryColor(document.category)}'}>
                                {document.category}
                              </Badge>
                            </div>
                          </div>
                          
                          {showPreview && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewDocument(document);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
            <div className="text-sm text-neutral-400">
              {selectedIds.size > 0 && '${selectedIds.size} document${selectedIds.size !== 1 ? 's' : '} selected'}
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {cancelText}
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={selectedIds.size === 0}
              >
                {confirmText} {selectedIds.size > 0 && '(${selectedIds.size})'}
              </Button>
            </div>
          </div>
        </div>

        {/* Document Preview Dialog */}
        {previewDocument && (
          <Dialog open={!!previewDocument} onOpenChange={() => setPreviewDocument(null)}>
            <DialogContent className="max-w-2xl bg-neutral-900 border-neutral-800">
              <DialogHeader>
                <DialogTitle className="text-white">{previewDocument.name}</DialogTitle>
                <DialogDescription>
                  {previewDocument.description || 'Document preview'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-neutral-400">Size:</span>
                    <span className="text-white ml-2">{formatFileSize(previewDocument.size)}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400">Type:</span>
                    <span className="text-white ml-2">{previewDocument.type}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400">Category:</span>
                    <Badge variant="outline" className={'ml-2 ${getCategoryColor(previewDocument.category)}'}>
                      {previewDocument.category}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-neutral-400">Uploaded:</span>
                    <span className="text-white ml-2">{previewDocument.uploadedAt.toLocaleString()}</span>
                  </div>
                </div>
                
                {previewDocument.tags.length > 0 && (
                  <div>
                    <span className="text-neutral-400">Tags:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {previewDocument.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => {
                      handleDocumentToggle(previewDocument);
                      setPreviewDocument(null);
                    }}
                    variant={selectedIds.has(previewDocument.id) ? 'outline' : 'default'}
                  >
                    {selectedIds.has(previewDocument.id) ? 'Remove from Selection' : 'Add to Selection'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}