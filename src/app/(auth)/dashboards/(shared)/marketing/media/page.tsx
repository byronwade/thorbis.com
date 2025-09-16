"use client";

import { useState, useCallback, useRef } from "react";
;
import { 
  Upload,
  Search,
  Filter,
  Grid3x3,
  List,
  Image,
  Video,
  FileText,
  Download,
  ExternalLink,
  Copy,
  Trash2,
  Edit3,
  Plus,
  FolderPlus,
  Star,
  Eye,
  MoreHorizontal,
  Tag,
  Calendar,
  User,
  ChevronDown
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';


interface MediaAsset {
  id: string;
  name: string;
  type: "image" | "video" | "document";
  url: string;
  thumbnail: string;
  size: string;
  dimensions?: string;
  uploadedAt: string;
  uploadedBy: string;
  tags: string[];
  folder?: string;
  isFavorite?: boolean;
  usageCount: number;
}

const mockAssets: MediaAsset[] = [
  {
    id: "1",
    name: "hero-banner-summer.jpg",
    type: "image",
    url: "/images/hero-banner.jpg",
    thumbnail: "/images/hero-banner-thumb.jpg",
    size: "2.4 MB",
    dimensions: "1920x1080",
    uploadedAt: "2 hours ago",
    uploadedBy: "John Doe",
    tags: ["banner", "summer", "hero"],
    folder: "Campaigns",
    isFavorite: true,
    usageCount: 12,
  },
  {
    id: "2", 
    name: "product-demo-video.mp4",
    type: "video",
    url: "/videos/demo.mp4",
    thumbnail: "/images/video-thumb.jpg",
    size: "45.2 MB",
    dimensions: "1280x720",
    uploadedAt: "1 day ago",
    uploadedBy: "Jane Smith",
    tags: ["demo", "product", "tutorial"],
    folder: "Videos",
    usageCount: 8,
  },
  {
    id: "3",
    name: "brand-guidelines.pdf",
    type: "document",
    url: "/docs/brand-guidelines.pdf",
    thumbnail: "/images/pdf-thumb.jpg",
    size: "1.8 MB",
    uploadedAt: "3 days ago",
    uploadedBy: "Mike Johnson",
    tags: ["brand", "guidelines", "design"],
    folder: "Brand Assets",
    usageCount: 25,
  },
  {
    id: "4",
    name: "social-post-template.png",
    type: "image",
    url: "/images/social-template.png",
    thumbnail: "/images/social-template-thumb.jpg",
    size: "890 KB",
    dimensions: "1080x1080",
    uploadedAt: "1 week ago",
    uploadedBy: "Sarah Wilson",
    tags: ["social", "template", "instagram"],
    folder: "Templates",
    usageCount: 15,
  },
];

export default function MediaPage() {
  const [assets, setAssets] = useState<MediaAsset[]>(mockAssets);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [folderFilter, setFolderFilter] = useState<string>("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         asset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = typeFilter === "all" || asset.type === typeFilter;
    const matchesFolder = folderFilter === "all" || asset.folder === folderFilter;
    return matchesSearch && matchesType && matchesFolder;
  });

  const folders = Array.from(new Set(assets.map(a => a.folder).filter(Boolean))) as string[];

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const newAsset: MediaAsset = {
        id: Date.now().toString() + Math.random(),
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : 
              file.type.startsWith('video/') ? 'video' : 'document',
        url: URL.createObjectURL(file),
        thumbnail: URL.createObjectURL(file),
        size: '${(file.size / 1024 / 1024).toFixed(1)} MB',
        uploadedAt: "Just now",
        uploadedBy: "You",
        tags: [],
        usageCount: 0,
      };
      setAssets(prev => [newAsset, ...prev]);
    });
  }, []);

  const toggleAssetSelection = (assetId: string) => {
    setSelectedAssets(prev => 
      prev.includes(assetId) 
        ? prev.filter(id => id !== assetId)
        : [...prev, assetId]
    );
  };

  const toggleFavorite = (assetId: string) => {
    setAssets(prev => prev.map(asset => 
      asset.id === assetId 
        ? { ...asset, isFavorite: !asset.isFavorite }
        : asset
    ));
  };

  const deleteAsset = (assetId: string) => {
    setAssets(prev => prev.filter(asset => asset.id !== assetId));
    setSelectedAssets(prev => prev.filter(id => id !== assetId));
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "image": return <Image className="h-4 w-4" />;
      case "video": return <Video className="h-4 w-4" />;
      case "document": return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case "image": return "bg-blue-100 text-blue-800";
      case "video": return "bg-purple-100 text-purple-800";
      case "document": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Media Library</h1>
          <p className="text-muted-foreground">
            Manage your images, videos, and documents with automatic optimization and variants.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Media
          </Button>
          <Button>
            <FolderPlus className="h-4 w-4 mr-2" />
            New Folder
          </Button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*,.pdf,.doc,.docx"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search media..."
            className="w-full pl-10 pr-4 py-2 border rounded-md bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            className="px-3 py-2 border rounded-md bg-background"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="document">Documents</option>
          </select>
          
          <select
            className="px-3 py-2 border rounded-md bg-background"
            value={folderFilter}
            onChange={(e) => setFolderFilter(e.target.value)}
          >
            <option value="all">All Folders</option>
            {folders.map(folder => (
              <option key={folder} value={folder}>{folder}</option>
            ))}
          </select>

          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedAssets.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {selectedAssets.length} item{selectedAssets.length > 1 ? 's' : '} selected
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm">
                <Tag className="h-4 w-4 mr-2" />
                Add Tags
              </Button>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Media Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredAssets.map((asset) => (
            <Card key={asset.id} className="group hover:shadow-lg transition-all">
              <div className="relative">
                {/* Thumbnail */}
                <div className="aspect-square bg-muted rounded-t-lg relative overflow-hidden">
                  {asset.type === "image" ? (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <Image className="h-12 w-12 text-gray-400" />
                    </div>
                  ) : asset.type === "video" ? (
                    <div className="w-full h-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                      <Video className="h-12 w-12 text-purple-400" />
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                      <FileText className="h-12 w-12 text-green-400" />
                    </div>
                  )}
                  
                  {/* Overlay actions */}
                  <div className="absolute inset-0 bg-neutral-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Selection checkbox */}
                  <div className="absolute top-2 left-2">
                    <input
                      type="checkbox"
                      checked={selectedAssets.includes(asset.id)}
                      onChange={() => toggleAssetSelection(asset.id)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </div>

                  {/* Favorite button */}
                  <div className="absolute top-2 right-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() => toggleFavorite(asset.id)}
                    >
                      <Star className={'h-3 w-3 ${asset.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
              }`} />`
                    </Button>
                  </div>

                  {/* Type badge */}
                  <div className="absolute bottom-2 left-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getFileTypeColor(asset.type)}`}>
                      {getFileIcon(asset.type)}
                      <span className="ml-1 capitalize">{asset.type}</span>
                    </span>
                  </div>
                </div>

                <CardHeader className="pb-2">
                  <CardTitle className="text-sm truncate">{asset.name}</CardTitle>
                  <CardDescription className="text-xs">
                    {asset.size} {asset.dimensions && `• ${asset.dimensions}'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0 pb-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{asset.uploadedAt}</span>
                      <span>{asset.usageCount} uses</span>
                    </div>
                    
                    {asset.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {asset.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            {tag}
                          </span>
                        ))}
                        {asset.tags.length > 2 && (
                          <span className="text-xs text-muted-foreground">
                            +{asset.tags.length - 2} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {filteredAssets.map((asset) => (
                <div key={asset.id} className="flex items-center gap-4 p-4 hover:bg-muted/50">
                  <input
                    type="checkbox"
                    checked={selectedAssets.includes(asset.id)}
                    onChange={() => toggleAssetSelection(asset.id)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  
                  <div className="flex-shrink-0">
                    <div className={'w-10 h-10 rounded flex items-center justify-center ${getFileTypeColor(asset.type)}'}>
                      {getFileIcon(asset.type)}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium truncate">{asset.name}</h3>
                      {asset.isFavorite && <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{asset.size}</span>
                      {asset.dimensions && <span>{asset.dimensions}</span>}
                      <span>{asset.uploadedAt}</span>
                      <span>by {asset.uploadedBy}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {asset.folder && (
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                        {asset.folder}
                      </span>
                    )}
                    <span>{asset.usageCount} uses</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Edit3 className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {filteredAssets.length === 0 && (
        <div className="text-center py-12">
          <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No media found</h3>
          <p className="text-muted-foreground">
            {searchQuery || typeFilter !== "all" || folderFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Start by uploading your first media files"}
          </p>
          {(!searchQuery && typeFilter === "all" && folderFilter === "all") && (
            <Button className="mt-4" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Media
            </Button>
          )}
        </div>
      )}
    </div>
  );
}