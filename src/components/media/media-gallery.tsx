'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
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
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  Maximize,
  Minimize,
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Calendar,
  MapPin,
  Tag,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Star,
  Copy,
  ExternalLink
} from 'lucide-react';

import { useOfflineMedia } from '@/lib/offline-media-manager';
import type { MediaMetadata, MediaSearchFilters } from '@/lib/offline-media-manager';

interface MediaGalleryProps {
  organizationId?: string;
  workOrderId?: string;
  customerId?: string;
  filters?: MediaSearchFilters;
  allowSelection?: boolean;
  allowDeletion?: boolean;
  onMediaSelect?: (media: MediaMetadata[]) => void;
  onClose?: () => void;
}

interface MediaViewerState {
  isOpen: boolean;
  currentIndex: number;
  zoom: number;
  rotation: number;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
}

export default function MediaGallery({
  organizationId = 'default',
  workOrderId,
  customerId,
  filters: initialFilters,
  allowSelection = false,
  allowDeletion = false,
  onMediaSelect,
  onClose
}: MediaGalleryProps) {
  const [media, setMedia] = useState<MediaMetadata[]>([]);
  const [filteredMedia, setFilteredMedia] = useState<MediaMetadata[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState(');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Media viewer state
  const [viewer, setViewer] = useState<MediaViewerState>({
    isOpen: false,
    currentIndex: 0,
    zoom: 1,
    rotation: 0,
    isPlaying: false,
    volume: 1,
    currentTime: 0,
    duration: 0
  });

  // File content cache
  const [mediaContent, setMediaContent] = useState<Map<string, string>>(new Map());
  
  const mediaRef = useRef<HTMLImageElement | HTMLVideoElement | HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mediaManager = useOfflineMedia();

  useEffect(() => {
    loadMedia();
  }, [organizationId, workOrderId, customerId, initialFilters]);

  useEffect(() => {
    filterAndSortMedia();
  }, [media, searchQuery, sortBy, sortOrder]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!viewer.isOpen) return;

      switch (e.key) {
        case 'Escape':
          closeViewer();
          break;
        case 'ArrowLeft':
          navigateMedia(-1);
          break;
        case 'ArrowRight':
          navigateMedia(1);
          break;
        case ' ':
          e.preventDefault();
          togglePlayback();
          break;
        case '+':
        case '=':
          zoomIn();
          break;
        case '-':
          zoomOut();
          break;
        case 'r':
          rotateMedia();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewer]);

  const loadMedia = async () => {
    setLoading(true);
    setError(null);

    try {
      const searchFilters: MediaSearchFilters = {
        organizationId,
        workOrderId,
        customerId,
        ...initialFilters
      };

      const results = await mediaManager.searchMedia(searchFilters);
      setMedia(results);
    } catch (error) {
      console.error('Failed to load media:', error);
      setError('Failed to load media');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortMedia = () => {
    let filtered = [...media];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(m =>
        m.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.originalName.localeCompare(b.originalName);
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
        case 'type':
          comparison = a.mimeType.localeCompare(b.mimeType);
          break;
        case 'date':
        default:
          comparison = a.capturedAt.getTime() - b.capturedAt.getTime();
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredMedia(filtered);
  };

  const openViewer = async (index: number) => {
    const mediaItem = filteredMedia[index];
    if (!mediaItem) return;

    setViewer(prev => ({
      ...prev,
      isOpen: true,
      currentIndex: index,
      zoom: 1,
      rotation: 0
    }));

    // Load media content if not cached
    if (!mediaContent.has(mediaItem.id)) {
      try {
        const blob = await mediaManager.getFileContent(mediaItem.id, 'original');
        if (blob) {
          const url = URL.createObjectURL(blob);
          setMediaContent(prev => new Map(prev.set(mediaItem.id, url)));
        }
      } catch (error) {
        console.error('Failed to load media content:', error);
        setError('Failed to load media content');
      }
    }
  };

  const closeViewer = () => {
    setViewer(prev => ({
      ...prev,
      isOpen: false,
      isPlaying: false
    }));
  };

  const navigateMedia = (direction: number) => {
    const newIndex = viewer.currentIndex + direction;
    if (newIndex >= 0 && newIndex < filteredMedia.length) {
      openViewer(newIndex);
    }
  };

  const zoomIn = () => {
    setViewer(prev => ({
      ...prev,
      zoom: Math.min(prev.zoom * 1.2, 5)
    }));
  };

  const zoomOut = () => {
    setViewer(prev => ({
      ...prev,
      zoom: Math.max(prev.zoom / 1.2, 0.1)
    }));
  };

  const rotateMedia = () => {
    setViewer(prev => ({
      ...prev,
      rotation: (prev.rotation + 90) % 360
    }));
  };

  const togglePlayback = () => {
    if (mediaRef.current) {
      const element = mediaRef.current as HTMLVideoElement | HTMLAudioElement;
      if (viewer.isPlaying) {
        element.pause();
      } else {
        element.play();
      }
      setViewer(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
    }
  };

  const handleMediaSelection = (mediaId: string) => {
    if (!allowSelection) return;

    const newSelection = new Set(selectedMedia);
    if (newSelection.has(mediaId)) {
      newSelection.delete(mediaId);
    } else {
      newSelection.add(mediaId);
    }

    setSelectedMedia(newSelection);
    
    if (onMediaSelect) {
      const selectedItems = media.filter(m => newSelection.has(m.id));
      onMediaSelect(selectedItems);
    }
  };

  const deleteSelectedMedia = async () => {
    if (!allowDeletion || selectedMedia.size === 0) return;

    if (!confirm('Delete ${selectedMedia.size} selected items?')) return;

    try {
      for (const mediaId of selectedMedia) {
        await mediaManager.deleteMedia(mediaId);
      }
      
      setMedia(prev => prev.filter(m => !selectedMedia.has(m.id)));
      setSelectedMedia(new Set());
    } catch (error) {
      console.error('Failed to delete media:', error);
      setError('Failed to delete media');
    }
  };

  const downloadMedia = async (mediaItem: MediaMetadata) => {
    try {
      const blob = await mediaManager.getFileContent(mediaItem.id, 'original');
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = mediaItem.originalName;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to download media:', error);
      setError('Failed to download media');
    }
  };

  const getMediaIcon = (media: MediaMetadata) => {
    if (media.mimeType.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (media.mimeType.startsWith('video/')) return <Video className="h-4 w-4" />;
    if (media.mimeType.startsWith('audio/')) return <Mic className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
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

  const currentMedia = viewer.isOpen ? filteredMedia[viewer.currentIndex] : null;
  const currentMediaUrl = currentMedia ? mediaContent.get(currentMedia.id) : null;

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Media Gallery</h2>
          <p className="text-neutral-400">
            {filteredMedia.length} items
            {selectedMedia.size > 0 && ' • ${selectedMedia.size} selected'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {allowSelection && selectedMedia.size > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const selectedItems = media.filter(m => selectedMedia.has(m.id));
                  selectedItems.forEach(downloadMedia);
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download ({selectedMedia.size})
              </Button>
              
              {allowDeletion && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={deleteSelectedMedia}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete ({selectedMedia.size})
                </Button>
              )}
            </>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>

          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Search and Filters */}
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

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm"
        >
          <option value="date">Sort by Date</option>
          <option value="name">Sort by Name</option>
          <option value="size">Sort by Size</option>
          <option value="type">Sort by Type</option>
        </select>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
        >
          {sortOrder === 'asc' ? '↑' : '↓'}
        </Button>
      </div>

      {/* Media Grid/List */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="text-center py-12">
            <Image className="h-16 w-16 text-neutral-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No media found</h3>
            <p className="text-neutral-400">No files match your current search and filters</p>
          </div>
        ) : (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'
              : 'space-y-2'
          }>
            {filteredMedia.map((mediaItem, index) => (
              <Card
                key={mediaItem.id}
                className={'bg-neutral-900 border-neutral-800 hover:border-neutral-700 transition-colors cursor-pointer ${
                  selectedMedia.has(mediaItem.id) ? 'ring-2 ring-blue-500' : '
                }'}
                onClick={() => openViewer(index)}
              >
                <CardContent className={viewMode === 'grid' ? 'p-3' : 'p-4'}>
                  {viewMode === 'grid' ? (
                    <div className="space-y-2">
                      {/* Thumbnail */}
                      <div className="aspect-square bg-neutral-800 rounded-lg flex items-center justify-center overflow-hidden relative group">
                        {mediaItem.thumbnailPath ? (
                          <div className="w-full h-full bg-neutral-700 flex items-center justify-center">
                            {getMediaIcon(mediaItem)}
                            <span className="ml-2 text-xs text-neutral-400">Preview</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            {getMediaIcon(mediaItem)}
                            <span className="text-xs text-neutral-400">
                              {mediaItem.mimeType.split('/')[0]}
                            </span>
                          </div>
                        )}

                        {/* Overlay controls */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadMedia(mediaItem);
                            }}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                          {allowDeletion && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('Delete this media file?')) {
                                  mediaManager.deleteMedia(mediaItem.id);
                                }
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>

                        {/* Selection checkbox */}
                        {allowSelection && (
                          <div className="absolute top-2 right-2">
                            <input
                              type="checkbox"
                              checked={selectedMedia.has(mediaItem.id)}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleMediaSelection(mediaItem.id);
                              }}
                              className="rounded border-neutral-600"
                            />
                          </div>
                        )}
                      </div>

                      {/* Metadata */}
                      <div className="space-y-1">
                        <h4 className="font-medium text-white truncate text-sm">
                          {mediaItem.originalName}
                        </h4>
                        
                        <div className="flex items-center justify-between text-xs text-neutral-400">
                          <span>{formatFileSize(mediaItem.size)}</span>
                          <span>{formatDate(mediaItem.capturedAt)}</span>
                        </div>

                        {mediaItem.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {mediaItem.tags.slice(0, 2).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                                {tag}
                              </Badge>
                            ))}
                            {mediaItem.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs px-1 py-0">
                                +{mediaItem.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-neutral-800 rounded-lg flex items-center justify-center">
                        {getMediaIcon(mediaItem)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-white truncate">
                          {mediaItem.originalName}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-neutral-400">
                          <span>{formatFileSize(mediaItem.size)}</span>
                          <span>{formatDate(mediaItem.capturedAt)}</span>
                          <span className="capitalize">{mediaItem.category.replace('_', ' ')}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {allowSelection && (
                          <input
                            type="checkbox"
                            checked={selectedMedia.has(mediaItem.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleMediaSelection(mediaItem.id);
                            }}
                            className="rounded border-neutral-600"
                          />
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadMedia(mediaItem);
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>

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
        )}
      </ScrollArea>

      {/* Media Viewer Modal */}
      {viewer.isOpen && currentMedia && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          {/* Header */}
          <div className="p-4 bg-neutral-900/80 backdrop-blur-sm border-b border-neutral-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h3 className="font-medium text-white">{currentMedia.originalName}</h3>
                <Badge variant="outline" className="text-xs">
                  {viewer.currentIndex + 1} of {filteredMedia.length}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadMedia(currentMedia)}
                >
                  <Download className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={closeViewer}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Media Content */}
          <div className="flex-1 flex items-center justify-center relative" ref={containerRef}>
            {currentMediaUrl && (
              <>
                {currentMedia.mimeType.startsWith('image/') && (
                  <img
                    ref={mediaRef as React.RefObject<HTMLImageElement>}
                    src={currentMediaUrl}
                    alt={currentMedia.originalName}
                    className="max-w-full max-h-full object-contain"
                    style={{
                      transform: 'scale(${viewer.zoom}) rotate(${viewer.rotation}deg)'
                    }}
                  />
                )}

                {currentMedia.mimeType.startsWith('video/') && (
                  <video
                    ref={mediaRef as React.RefObject<HTMLVideoElement>}
                    src={currentMediaUrl}
                    className="max-w-full max-h-full"
                    controls
                    onPlay={() => setViewer(prev => ({ ...prev, isPlaying: true }))}
                    onPause={() => setViewer(prev => ({ ...prev, isPlaying: false }))}
                    onTimeUpdate={(e) => {
                      const video = e.target as HTMLVideoElement;
                      setViewer(prev => ({
                        ...prev,
                        currentTime: video.currentTime,
                        duration: video.duration
                      }));
                    }}
                    style={{
                      transform: 'scale(${viewer.zoom}) rotate(${viewer.rotation}deg)'
                    }}
                  />
                )}

                {currentMedia.mimeType.startsWith('audio/') && (
                  <div className="bg-neutral-800 rounded-lg p-8">
                    <div className="flex flex-col items-center gap-4">
                      <Mic className="h-16 w-16 text-neutral-400" />
                      <h3 className="text-xl font-medium text-white">{currentMedia.originalName}</h3>
                      <audio
                        ref={mediaRef as React.RefObject<HTMLAudioElement>}
                        src={currentMediaUrl}
                        controls
                        className="w-full max-w-md"
                        onPlay={() => setViewer(prev => ({ ...prev, isPlaying: true }))}
                        onPause={() => setViewer(prev => ({ ...prev, isPlaying: false }))}
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Navigation */}
            <Button
              variant="outline"
              size="sm"
              className="absolute left-4 top-1/2 transform -translate-y-1/2"
              onClick={() => navigateMedia(-1)}
              disabled={viewer.currentIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="absolute right-4 top-1/2 transform -translate-y-1/2"
              onClick={() => navigateMedia(1)}
              disabled={viewer.currentIndex === filteredMedia.length - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Controls */}
          <div className="p-4 bg-neutral-900/80 backdrop-blur-sm border-t border-neutral-800">
            <div className="flex items-center justify-center gap-4">
              {currentMedia.mimeType.startsWith('image/') && (
                <>
                  <Button variant="outline" size="sm" onClick={zoomOut}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={zoomIn}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={rotateMedia}>
                    <RotateCw className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-neutral-400">
                    {Math.round(viewer.zoom * 100)}%
                  </span>
                </>
              )}

              {(currentMedia.mimeType.startsWith('video/') || currentMedia.mimeType.startsWith('audio/')) && (
                <>
                  <Button variant="outline" size="sm" onClick={togglePlayback}>
                    {viewer.isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  
                  {viewer.duration > 0 && (
                    <span className="text-sm text-neutral-400">
                      {Math.floor(viewer.currentTime / 60)}:{(Math.floor(viewer.currentTime) % 60).toString().padStart(2, '0')} / {Math.floor(viewer.duration / 60)}:{(Math.floor(viewer.duration) % 60).toString().padStart(2, '0')}
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Media Info */}
            <div className="mt-4 text-center">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-neutral-400">
                <div>
                  <Clock className="h-4 w-4 inline mr-1" />
                  {formatDate(currentMedia.capturedAt)}
                </div>
                <div>
                  <Tag className="h-4 w-4 inline mr-1" />
                  {formatFileSize(currentMedia.size)}
                </div>
                {currentMedia.dimensions && (
                  <div>
                    <Image className="h-4 w-4 inline mr-1" />
                    {currentMedia.dimensions.width} × {currentMedia.dimensions.height}
                  </div>
                )}
                {currentMedia.location && (
                  <div>
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Location data
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}