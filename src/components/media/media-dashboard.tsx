'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Upload,
  Image,
  Video,
  FileText,
  Mic,
  Search,
  Filter,
  Grid,
  List,
  Download,
  Trash2,
  Eye,
  Edit,
  Share2,
  Settings,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Zap,
  HardDrive,
  Compress,
  Tag,
  Users,
  Camera,
  Folder,
  MoreHorizontal,
  X,
  Plus,
  RotateCcw,
  Archive,
  Star,
  Copy
} from 'lucide-react';

import { useOfflineMedia } from '@/lib/offline-media-manager';
import type { 
  MediaMetadata,
  MediaBatch,
  MediaSearchFilters,
  MediaStatistics,
  MediaCategory,
  MediaCompressionSettings
} from '@/lib/offline-media-manager';

interface MediaDashboardProps {
  organizationId?: string;
  workOrderId?: string;
  customerId?: string;
  onMediaSelect?: (media: MediaMetadata) => void;
  allowUploads?: boolean;
  categories?: MediaCategory[];
}

export default function MediaDashboard({
  organizationId = 'default',
  workOrderId,
  customerId,
  onMediaSelect,
  allowUploads = true,
  categories
}: MediaDashboardProps) {
  const [activeTab, setActiveTab] = useState('gallery');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedMedia, setSelectedMedia] = useState<MediaMetadata[]>([]);
  const [media, setMedia] = useState<MediaMetadata[]>([]);
  const [batches, setBatches] = useState<MediaBatch[]>([]);
  const [stats, setStats] = useState<MediaStatistics | null>(null);
  const [compressionSettings, setCompressionSettings] = useState<MediaCompressionSettings | null>(null);
  
  // Search and filters
  const [searchQuery, setSearchQuery] = useState(');
  const [filters, setFilters] = useState<MediaSearchFilters>({
    organizationId,
    workOrderId,
    customerId
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // Upload states
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [isUploading, setIsUploading] = useState(false);
  
  // UI states
  const [showPreview, setShowPreview] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<MediaMetadata | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const mediaManager = useOfflineMedia();

  useEffect(() => {
    loadData();
    setupEventListeners();
    
    return () => {
      cleanup();
    };
  }, [organizationId, workOrderId, customerId]);

  useEffect(() => {
    searchMedia();
  }, [searchQuery, filters]);

  const setupEventListeners = () => {
    mediaManager.on('file_uploaded', handleFileUploaded);
    mediaManager.on('batch_progress', handleBatchProgress);
    mediaManager.on('batch_completed', handleBatchCompleted);
    mediaManager.on('media_updated', handleMediaUpdated);
    mediaManager.on('media_deleted', handleMediaDeleted);
    mediaManager.on('upload_failed', handleUploadFailed);
  };

  const cleanup = () => {
    mediaManager.off('file_uploaded', handleFileUploaded);
    mediaManager.off('batch_progress', handleBatchProgress);
    mediaManager.off('batch_completed', handleBatchCompleted);
    mediaManager.off('media_updated', handleMediaUpdated);
    mediaManager.off('media_deleted', handleMediaDeleted);
    mediaManager.off('upload_failed', handleUploadFailed);
  };

  const handleFileUploaded = (data: unknown) => {
    setMedia(prev => [data.metadata, ...prev]);
    loadStats();
  };

  const handleBatchProgress = (data: unknown) => {
    setUploadProgress(prev => ({
      ...prev,
      [data.batchId]: data.progress
    }));
  };

  const handleBatchCompleted = (data: unknown) => {
    setBatches(prev => prev.map(batch => 
      batch.id === data.batchId ? data.batch : batch
    ));
    setUploadProgress(prev => {
      const updated = { ...prev };
      delete updated[data.batchId];
      return updated;
    });
    setIsUploading(false);
    loadData();
  };

  const handleMediaUpdated = (data: unknown) => {
    setMedia(prev => prev.map(m => 
      m.id === data.mediaId ? data.media : m
    ));
  };

  const handleMediaDeleted = (data: unknown) => {
    setMedia(prev => prev.filter(m => m.id !== data.mediaId));
    setSelectedMedia(prev => prev.filter(m => m.id !== data.mediaId));
  };

  const handleUploadFailed = (data: unknown) => {
    setError('Upload failed: ${data.error.message}');
    setIsUploading(false);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, settingsData] = await Promise.all([
        mediaManager.getStatistics(organizationId),
        mediaManager.getCompressionSettings()
      ]);

      setStats(statsData);
      setCompressionSettings(settingsData);
      await searchMedia();
    } catch (error) {
      setError('Failed to load media data');
      console.error('Failed to load media data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await mediaManager.getStatistics(organizationId);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const searchMedia = async () => {
    try {
      const searchFilters = { ...filters };
      
      if (searchQuery) {
        // For simplicity, we'll just search by loading all and filtering client-side
        // In production, this would be server-side search
      }

      const results = await mediaManager.searchMedia(searchFilters);
      
      if (searchQuery) {
        const filtered = results.filter(m =>
          m.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        setMedia(filtered);
      } else {
        setMedia(results);
      }
    } catch (error) {
      console.error('Failed to search media:', error);
    }
  };

  // File Upload Handlers

  const handleFileSelect = async (files: File[]) => {
    if (!allowUploads) return;

    setIsUploading(true);
    setError(null);

    try {
      if (files.length === 1) {
        // Single file upload
        await mediaManager.uploadFile(files[0], {
          category: categories?.[0],
          associatedId: workOrderId || customerId,
          associatedType: workOrderId ? 'work_order' : customerId ? 'customer' : undefined,
          compress: true,
          generateThumbnail: true,
          generatePreview: true
        });
      } else {
        // Batch upload
        const batchId = await mediaManager.uploadBatch(files, {
          category: categories?.[0],
          associatedId: workOrderId || customerId,
          associatedType: workOrderId ? 'work_order' : customerId ? 'customer' : undefined,
          compress: true,
          generateThumbnail: true,
          generatePreview: true
        });

        setUploadProgress(prev => ({ ...prev, [batchId]: 0 }));
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Upload failed');
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // Media Management

  const handleMediaClick = (mediaItem: MediaMetadata) => {
    if (onMediaSelect) {
      onMediaSelect(mediaItem);
    } else {
      setPreviewMedia(mediaItem);
      setShowPreview(true);
    }
  };

  const handleMediaSelection = (mediaItem: MediaMetadata, selected: boolean) => {
    if (selected) {
      setSelectedMedia(prev => [...prev, mediaItem]);
    } else {
      setSelectedMedia(prev => prev.filter(m => m.id !== mediaItem.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedMedia.length === 0) return;
    
    if (!confirm('Delete ${selectedMedia.length} selected items?')) return;

    try {
      for (const media of selectedMedia) {
        await mediaManager.deleteMedia(media.id);
      }
      setSelectedMedia([]);
    } catch (_error) {
      setError('Failed to delete media');
    }
  };

  const handleDownloadSelected = async () => {
    for (const media of selectedMedia) {
      try {
        const blob = await mediaManager.getFileContent(media.id, 'original');
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = media.originalName;
          a.click();
          URL.revokeObjectURL(url);
        }
      } catch (error) {
        console.error('Failed to download media:', error);
      }
    }
  };

  // UI Helpers

  const getMediaIcon = (media: MediaMetadata) => {
    if (media.mimeType.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (media.mimeType.startsWith('video/')) return <Video className="h-4 w-4" />;
    if (media.mimeType.startsWith('audio/')) return <Mic className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const getMediaStatusColor = (status: MediaMetadata['status']) => {
    switch (status) {
      case 'ready': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'synced': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'uploading': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'processing': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'failed': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
    }
  };

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Media Management</h2>
          <p className="text-neutral-400">Upload, organize, and manage your media files</p>
        </div>
        
        <div className="flex items-center gap-2">
          {selectedMedia.length > 0 && (
            <>
              <Button variant="outline" size="sm" onClick={handleDownloadSelected}>
                <Download className="h-4 w-4 mr-2" />
                Download ({selectedMedia.length})
              </Button>
              <Button variant="outline" size="sm" onClick={handleDeleteSelected}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete ({selectedMedia.length})
              </Button>
            </>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>
          
          {allowUploads && (
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-400 text-sm">Total Files</p>
                  <p className="text-2xl font-bold text-white">{stats.totalFiles}</p>
                </div>
                <Folder className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-400 text-sm">Storage Used</p>
                  <p className="text-2xl font-bold text-white">{formatFileSize(stats.storageUsed)}</p>
                </div>
                <HardDrive className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-400 text-sm">Compression Savings</p>
                  <p className="text-2xl font-bold text-white">{formatFileSize(stats.compressionSavings)}</p>
                </div>
                <Compress className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-400 text-sm">Pending Sync</p>
                  <p className="text-2xl font-bold text-white">{stats.pendingSync}</p>
                </div>
                <RotateCcw className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-4">
            <div className="space-y-3">
              <h3 className="font-medium text-white">Upload Progress</h3>
              {Object.entries(uploadProgress).map(([batchId, progress]) => (
                <div key={batchId} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-400">Batch {batchId.slice(-8)}</span>
                    <span className="text-neutral-400">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 bg-neutral-800 border-neutral-700">
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
          <TabsTrigger value="batches">Batches</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="gallery" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  placeholder="Search media files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-neutral-800 border-neutral-700"
                />
              </div>
            </div>

            {showFilters && (
              <Card className="bg-neutral-900 border-neutral-800">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-neutral-400">Category</Label>
                      <Select 
                        value={filters.category || 'all'} 
                        onValueChange={(value) => setFilters(prev => ({ 
                          ...prev, 
                          category: value === 'all' ? undefined : value as MediaCategory 
                        }))}
                      >
                        <SelectTrigger className="bg-neutral-800 border-neutral-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="work_order_photo">Work Order Photos</SelectItem>
                          <SelectItem value="before_after">Before/After</SelectItem>
                          <SelectItem value="parts">Parts</SelectItem>
                          <SelectItem value="customer_signature">Signatures</SelectItem>
                          <SelectItem value="document">Documents</SelectItem>
                          <SelectItem value="video">Videos</SelectItem>
                          <SelectItem value="audio">Audio</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-neutral-400">File Type</Label>
                      <Select 
                        value={filters.mimeType || 'all'} 
                        onValueChange={(value) => setFilters(prev => ({ 
                          ...prev, 
                          mimeType: value === 'all' ? undefined : value 
                        }))}
                      >
                        <SelectTrigger className="bg-neutral-800 border-neutral-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="image/">Images</SelectItem>
                          <SelectItem value="video/">Videos</SelectItem>
                          <SelectItem value="audio/">Audio</SelectItem>
                          <SelectItem value="application/">Documents</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-neutral-400">Status</Label>
                      <Select 
                        value={filters.status || 'all'} 
                        onValueChange={(value) => setFilters(prev => ({ 
                          ...prev, 
                          status: value === 'all' ? undefined : value as MediaMetadata['status']
                        }))}
                      >
                        <SelectTrigger className="bg-neutral-800 border-neutral-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="ready">Ready</SelectItem>
                          <SelectItem value="synced">Synced</SelectItem>
                          <SelectItem value="uploading">Uploading</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-end">
                      <Button 
                        variant="outline" 
                        onClick={() => setFilters({ organizationId, workOrderId, customerId })}
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Drop Zone */}
          {allowUploads && (
            <div
              ref={dropZoneRef}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={'border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging 
                  ? 'border-blue-500 bg-blue-500/10' 
                  : 'border-neutral-700 hover:border-neutral-600'
              }'}
            >
              <Upload className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
              <p className="text-white mb-2">Drop files here or click to browse</p>
              <p className="text-neutral-400 text-sm">
                Supports images, videos, audio files, and documents
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Browse Files'}
              </Button>
            </div>
          )}

          {/* Media Grid/List */}
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
              : 'space-y-2'
          }>
            {media.map((mediaItem) => (
              <Card 
                key={mediaItem.id} 
                className={'bg-neutral-900 border-neutral-800 hover:border-neutral-700 transition-colors cursor-pointer ${
                  selectedMedia.find(m => m.id === mediaItem.id) ? 'ring-2 ring-blue-500' : '
                }'}
                onClick={() => handleMediaClick(mediaItem)}
              >
                <CardContent className={viewMode === 'grid' ? 'p-4' : 'p-3'}>
                  {viewMode === 'grid' ? (
                    <div className="space-y-3">
                      {/* Thumbnail */}
                      <div className="aspect-video bg-neutral-800 rounded-lg flex items-center justify-center overflow-hidden">
                        {mediaItem.thumbnailPath ? (
                          <div className="w-full h-full bg-neutral-700 flex items-center justify-center">
                            {getMediaIcon(mediaItem)}
                            <span className="ml-2 text-xs text-neutral-400">Thumbnail</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            {getMediaIcon(mediaItem)}
                            <span className="text-xs text-neutral-400">
                              {mediaItem.mimeType.split('/')[0]}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Metadata */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-white truncate text-sm">
                            {mediaItem.originalName}
                          </h4>
                          <input
                            type="checkbox"
                            checked={selectedMedia.find(m => m.id === mediaItem.id) !== undefined}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleMediaSelection(mediaItem, e.target.checked);
                            }}
                            className="rounded border-neutral-600"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className={getMediaStatusColor(mediaItem.status)}>
                            {mediaItem.status}
                          </Badge>
                          <span className="text-xs text-neutral-400">
                            {formatFileSize(mediaItem.size)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs text-neutral-500">
                          <span>{formatDate(mediaItem.capturedAt)}</span>
                          {mediaItem.compressionRatio && (
                            <span>-{mediaItem.compressionRatio}%</span>
                          )}
                        </div>

                        {mediaItem.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {mediaItem.tags.slice(0, 2).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {mediaItem.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{mediaItem.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        {getMediaIcon(mediaItem)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-white truncate">
                          {mediaItem.originalName}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-neutral-400">
                          <span>{formatFileSize(mediaItem.size)}</span>
                          <span>{formatDate(mediaItem.capturedAt)}</span>
                          <Badge variant="outline" className={getMediaStatusColor(mediaItem.status)}>
                            {mediaItem.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedMedia.find(m => m.id === mediaItem.id) !== undefined}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleMediaSelection(mediaItem, e.target.checked);
                          }}
                          className="rounded border-neutral-600"
                        />
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {media.length === 0 && !loading && (
            <div className="text-center py-12">
              <Folder className="h-16 w-16 text-neutral-600 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">No media files found</h3>
              <p className="text-neutral-400 mb-4">
                {allowUploads ? 'Upload your first file to get started' : 'No files match your current filters'}
              </p>
              {allowUploads && (
                <Button onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Files
                </Button>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="batches" className="space-y-4">
          <div className="space-y-4">
            {batches.map((batch) => (
              <Card key={batch.id} className="bg-neutral-900 border-neutral-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-white">
                        Batch Upload - {batch.files.length} files
                      </h4>
                      <p className="text-sm text-neutral-400">
                        Created {formatDate(batch.createdAt)}
                      </p>
                    </div>
                    <Badge variant="outline" className={
                      batch.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      batch.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                      batch.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-neutral-500/20 text-neutral-400'
                    }>
                      {batch.status}
                    </Badge>
                  </div>

                  {batch.status === 'processing' && (
                    <Progress value={batch.progress} className="mb-3" />
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-neutral-400">Files:</span>
                      <span className="ml-2 text-white">{batch.files.length}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400">Completed:</span>
                      <span className="ml-2 text-white">{batch.results.length}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400">Errors:</span>
                      <span className="ml-2 text-white">{batch.errors.length}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400">Progress:</span>
                      <span className="ml-2 text-white">{batch.progress}%</span>
                    </div>
                  </div>

                  {batch.errors.length > 0 && (
                    <div className="mt-3 p-3 bg-red-500/10 rounded-lg">
                      <h5 className="font-medium text-red-400 mb-2">Errors:</h5>
                      <ul className="text-sm text-red-300 space-y-1">
                        {batch.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {batches.length === 0 && (
              <div className="text-center py-8">
                <Archive className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No batch uploads</h3>
                <p className="text-neutral-400">Batch uploads will appear here</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          {compressionSettings && (
            <div className="space-y-6">
              <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader>
                  <CardTitle className="text-white">Image Compression Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-neutral-400">Quality (%)</Label>
                      <Input
                        type="number"
                        value={compressionSettings.images.quality}
                        onChange={(e) => {
                          const updated = {
                            ...compressionSettings,
                            images: {
                              ...compressionSettings.images,
                              quality: parseInt(e.target.value)
                            }
                          };
                          setCompressionSettings(updated);
                        }}
                        min="1"
                        max="100"
                        className="bg-neutral-800 border-neutral-700"
                      />
                    </div>
                    <div>
                      <Label className="text-neutral-400">Max Width (px)</Label>
                      <Input
                        type="number"
                        value={compressionSettings.images.maxWidth}
                        onChange={(e) => {
                          const updated = {
                            ...compressionSettings,
                            images: {
                              ...compressionSettings.images,
                              maxWidth: parseInt(e.target.value)
                            }
                          };
                          setCompressionSettings(updated);
                        }}
                        className="bg-neutral-800 border-neutral-700"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button 
                  onClick={() => {
                    if (compressionSettings) {
                      mediaManager.updateCompressionSettings(compressionSettings);
                    }
                  }}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Save Settings
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length > 0) {
            handleFileSelect(files);
          }
        }}
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
      />
    </div>
  );
}