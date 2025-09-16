"use client";

import { useState } from "react";
;
import { 
  Video,
  Plus,
  Search,
  Filter,
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Play,
  Pause,
  Trash2,
  Edit3,
  Eye,
  Copy,
  RefreshCw,
  Activity,
  TrendingUp,
  BarChart3,
  Download,
  Upload,
  Share2,
  Star,
  Heart,
  Bookmark,
  Tag,
  Calendar,
  Mail,
  MessageSquare,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Image,
  Layout,
  Type,
  Palette,
  Zap,
  Target,
  Award,
  Users,
  ShoppingBag,
  Megaphone,
  MousePointer,
  Layers,
  Code,
  Sparkles,
  Camera,
  Mic,
  Volume2,
  Scissors,
  Wand2,
  FileVideo,
  Tv,
  Youtube,
  Film,
  PlayCircle,
  PauseCircle,
  StopCircle,
  RotateCcw,
  SkipBack,
  SkipForward,
  VolumeX,
  Maximize,
  Minimize,
  PictureInPicture,
  Cast,
  Subtitles,
  MoreHorizontal,
  Crop,
  Sliders,
  Blend,
  Sun,
  Moon,
  Contrast,
  Music,
  Headphones,
  Radio,
  Waves,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';


interface VideoProject {
  id: string;
  title: string;
  description: string;
  status: "draft" | "editing" | "rendering" | "completed" | "published";
  type: "campaign" | "social" | "tutorial" | "testimonial" | "product" | "ad";
  duration: number;
  resolution: "720p" | "1080p" | "4K" | "vertical" | "square";
  createdAt: string;
  lastModified: string;
  author: string;
  thumbnail: string;
  tags: string[];
  platforms: string[];
  analytics?: {
    views: number;
    engagement: number;
    clickRate: number;
    conversions: number;
    revenue: number;
  };
  timeline: VideoClip[];
  assets: VideoAsset[];
}

interface VideoClip {
  id: string;
  type: "video" | "audio" | "image" | "text" | "transition" | "effect";
  name: string;
  startTime: number;
  endTime: number;
  duration: number;
  source?: string;
  properties?: {
    volume?: number;
    opacity?: number;
    x?: number;
    y?: number;
    scale?: number;
    rotation?: number;
    text?: string;
    font?: string;
    color?: string;
    backgroundColor?: string;
  };
}

interface VideoAsset {
  id: string;
  name: string;
  type: "video" | "audio" | "image" | "font" | "template";
  size: number;
  duration?: number;
  resolution?: string;
  uploadedAt: string;
  url: string;
  thumbnail?: string;
}

interface VideoTemplate {
  id: string;
  name: string;
  description: string;
  category: "social" | "ad" | "tutorial" | "testimonial" | "product" | "brand";
  type: "intro" | "outro" | "full" | "overlay" | "transition";
  duration: number;
  resolution: string;
  thumbnail: string;
  tags: string[];
  popularity: number;
  rating: number;
  uses: number;
  isPremium: boolean;
  features: string[];
}

interface VideoAnalytics {
  totalVideos: number;
  totalViews: number;
  totalEngagement: number;
  avgCompletionRate: number;
  topPerformingVideos: {
    id: string;
    title: string;
    views: number;
    engagement: number;
  }[];
  platformBreakdown: {
    platform: string;
    views: number;
    engagement: number;
  }[];
  performanceMetrics: {
    date: string;
    views: number;
    engagement: number;
    conversions: number;
  }[];
}

const mockProjects: VideoProject[] = [
  {
    id: "1",
    title: "Q1 Product Launch Video",
    description: "Main promotional video for new product launch campaign",
    status: "completed",
    type: "campaign",
    duration: 90,
    resolution: "1080p",
    createdAt: "2024-01-15T00:00:00Z",
    lastModified: "2024-01-23T10:30:00Z",
    author: "Marketing Team",
    thumbnail: "/videos/product-launch-thumb.jpg",
    tags: ["product-launch", "promotional", "campaign", "q1"],
    platforms: ["YouTube", "LinkedIn", "Website"],
    analytics: {
      views: 45200,
      engagement: 12.8,
      clickRate: 8.5,
      conversions: 342,
      revenue: 28400
    },
    timeline: [],
    assets: []
  },
  {
    id: "2",
    title: "Social Media Stories Pack",
    description: "Collection of 15-second stories for Instagram and Facebook",
    status: "editing",
    type: "social",
    duration: 15,
    resolution: "vertical",
    createdAt: "2024-01-20T00:00:00Z",
    lastModified: "2024-01-23T11:15:00Z",
    author: "Social Media Team",
    thumbnail: "/videos/stories-thumb.jpg",
    tags: ["social", "stories", "instagram", "facebook"],
    platforms: ["Instagram", "Facebook", "TikTok"],
    timeline: [],
    assets: []
  },
  {
    id: "3",
    title: "Customer Testimonial Series",
    description: "Customer success stories and testimonials compilation",
    status: "rendering",
    type: "testimonial",
    duration: 180,
    resolution: "1080p",
    createdAt: "2024-01-18T00:00:00Z",
    lastModified: "2024-01-23T09:45:00Z",
    author: "Content Team",
    thumbnail: "/videos/testimonial-thumb.jpg",
    tags: ["testimonial", "customer-success", "trust"],
    platforms: ["Website", "YouTube", "LinkedIn"],
    analytics: {
      views: 12800,
      engagement: 18.4,
      clickRate: 15.2,
      conversions: 89,
      revenue: 12600
    },
    timeline: [],
    assets: []
  },
  {
    id: "4",
    title: "Product Demo Tutorial",
    description: "Step-by-step product walkthrough and tutorial",
    status: "draft",
    type: "tutorial",
    duration: 300,
    resolution: "1080p",
    createdAt: "2024-01-22T00:00:00Z",
    lastModified: "2024-01-23T08:20:00Z",
    author: "Product Team",
    thumbnail: "/videos/demo-thumb.jpg",
    tags: ["tutorial", "product-demo", "education"],
    platforms: ["YouTube", "Help Center"],
    timeline: [],
    assets: []
  }
];

const mockTemplates: VideoTemplate[] = [
  {
    id: "1",
    name: "Modern Product Intro",
    description: "Clean, modern introduction template for product videos",
    category: "product",
    type: "intro",
    duration: 10,
    resolution: "1080p",
    thumbnail: "/templates/modern-intro.jpg",
    tags: ["intro", "modern", "product", "clean"],
    popularity: 95,
    rating: 4.8,
    uses: 1234,
    isPremium: false,
    features: ["Text animations", "Logo reveal", "Music sync", "Color customization"]
  },
  {
    id: "2",
    name: "Social Media Story Template",
    description: "Engaging template for Instagram and Facebook stories",
    category: "social",
    type: "full",
    duration: 15,
    resolution: "vertical",
    thumbnail: "/templates/story-template.jpg",
    tags: ["social", "story", "instagram", "vertical"],
    popularity: 89,
    rating: 4.6,
    uses: 892,
    isPremium: true,
    features: ["Vertical format", "Animated text", "Trending effects", "Swipe animations"]
  },
  {
    id: "3",
    name: "Customer Testimonial Frame",
    description: "Professional frame for customer testimonial videos",
    category: "testimonial",
    type: "overlay",
    duration: 0,
    resolution: "1080p",
    thumbnail: "/templates/testimonial-frame.jpg",
    tags: ["testimonial", "professional", "overlay", "trust"],
    popularity: 76,
    rating: 4.4,
    uses: 445,
    isPremium: false,
    features: ["Lower thirds", "Quote animations", "Star ratings", "Company logos"]
  },
  {
    id: "4",
    name: "Promotional Ad Template",
    description: "High-impact template for promotional advertisements",
    category: "ad",
    type: "full",
    duration: 30,
    resolution: "1080p",
    thumbnail: "/templates/ad-template.jpg",
    tags: ["ad", "promotional", "sale", "cta"],
    popularity: 93,
    rating: 4.7,
    uses: 667,
    isPremium: true,
    features: ["Call-to-action", "Countdown timer", "Price display", "Urgency effects"]
  }
];

const mockAnalytics: VideoAnalytics = {
  totalVideos: 156,
  totalViews: 892450,
  totalEngagement: 14.2,
  avgCompletionRate: 68.5,
  topPerformingVideos: [
    { id: "1", title: "Q1 Product Launch Video", views: 45200, engagement: 12.8 },
    { id: "3", title: "Customer Testimonial Series", views: 12800, engagement: 18.4 },
    { id: "5", title: "Brand Story Video", views: 8900, engagement: 16.2 }
  ],
  platformBreakdown: [
    { platform: "YouTube", views: 425600, engagement: 15.8 },
    { platform: "LinkedIn", views: 234500, engagement: 12.4 },
    { platform: "Instagram", views: 156700, engagement: 18.9 },
    { platform: "Facebook", views: 75650, engagement: 9.8 }
  ],
  performanceMetrics: []
};

export default function VideoMarketingPage() {
  const [projects, setProjects] = useState<VideoProject[]>(mockProjects);
  const [templates, setTemplates] = useState<VideoTemplate[]>(mockTemplates);
  const [analytics, setAnalytics] = useState<VideoAnalytics>(mockAnalytics);
  const [activeTab, setActiveTab] = useState<"projects" | "editor" | "templates" | "analytics" | "library">("projects");
  const [selectedProject, setSelectedProject] = useState<VideoProject | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "editing": return <Edit3 className="h-4 w-4 text-blue-600" />;
      case "rendering": return <RefreshCw className="h-4 w-4 text-yellow-600 animate-spin" />;
      case "published": return <Globe className="h-4 w-4 text-purple-600" />;
      case "draft": return <Clock className="h-4 w-4 text-gray-600" />;
      default: return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "campaign": return <Megaphone className="h-4 w-4" />;
      case "social": return <MessageSquare className="h-4 w-4" />;
      case "tutorial": return <PlayCircle className="h-4 w-4" />;
      case "testimonial": return <Star className="h-4 w-4" />;
      case "product": return <ShoppingBag className="h-4 w-4" />;
      case "ad": return <Target className="h-4 w-4" />;
      default: return <Video className="h-4 w-4" />;
    }
  };

  const getResolutionBadge = (resolution: string) => {
    const colors = {
      "4K": "bg-purple-100 text-purple-700",
      "1080p": "bg-blue-100 text-blue-700",
      "720p": "bg-green-100 text-green-700",
      "vertical": "bg-orange-100 text-orange-700",
      "square": "bg-yellow-100 text-yellow-700"
    };
    return colors[resolution as keyof typeof colors] || "bg-gray-100 text-gray-700";
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return '${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || project.type === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Video Marketing Platform</h1>
          <p className="text-muted-foreground">
            Create, edit, and optimize video content for all your marketing channels.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Upload Media
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b">
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === "projects" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("projects")}
        >
          Projects
        </button>
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === "editor" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("editor")}
        >
          Video Editor
        </button>
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === "templates" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("templates")}
        >
          Templates
        </button>
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === "library" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("library")}
        >
          Media Library
        </button>
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === "analytics" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("analytics")}
        >
          Analytics
        </button>
      </div>

      {/* Projects Tab */}
      {activeTab === "projects" && (
        <>
          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search projects..."
                className="w-full pl-10 pr-4 py-2 border rounded-md bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select 
              className="px-3 py-2 border rounded-md bg-background"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="campaign">Campaign</option>
              <option value="social">Social</option>
              <option value="tutorial">Tutorial</option>
              <option value="testimonial">Testimonial</option>
              <option value="product">Product</option>
              <option value="ad">Advertisement</option>
            </select>
            <select className="px-3 py-2 border rounded-md bg-background">
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="editing">Editing</option>
              <option value="rendering">Rendering</option>
              <option value="completed">Completed</option>
              <option value="published">Published</option>
            </select>
          </div>

          {/* Project Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                <Video className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{projects.length}</div>
                <p className="text-xs text-muted-foreground">Video projects</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <Edit3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {projects.filter(p => p.status === "editing" || p.status === "rendering").length}
                </div>
                <p className="text-xs text-blue-600">Active projects</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {projects.reduce((sum, p) => sum + (p.analytics?.views || 0), 0).toLocaleString()}
                </div>
                <p className="text-xs text-green-600">Across all videos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${projects.reduce((sum, p) => sum + (p.analytics?.revenue || 0), 0).toLocaleString()}
                </div>
                <p className="text-xs text-green-600">Video-attributed</p>
              </CardContent>
            </Card>
          </div>

          {/* Projects Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="group hover:shadow-lg transition-all cursor-pointer" onClick={() => setSelectedProject(project)}>
                <CardContent className="p-0">
                  {/* Video Thumbnail */}
                  <div className="relative aspect-video bg-gradient-to-br from-primary/5 to-primary/10 rounded-t-lg overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-neutral-950/20 flex items-center justify-center group-hover:bg-neutral-950/40 transition-all">
                        <Play className="h-8 w-8 text-white ml-1" />
                      </div>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getResolutionBadge(project.resolution)}'}>
                        {project.resolution}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <span className="bg-neutral-950/80 text-white px-2 py-1 rounded text-xs font-medium">
                        {formatDuration(project.duration)}
                      </span>
                    </div>
                    <div className="absolute bottom-3 right-3 flex items-center gap-2">
                      {getStatusIcon(project.status)}
                    </div>
                  </div>

                  {/* Project Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getTypeIcon(project.type)}
                          <h3 className="font-semibold group-hover:text-primary transition-colors">
                            {project.title}
                          </h3>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {project.description}
                        </p>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {project.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-muted rounded text-xs">
                          {tag}
                        </span>
                      ))}
                      {project.tags.length > 3 && (
                        <span className="px-2 py-1 bg-muted rounded text-xs">
                          +{project.tags.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Analytics */}
                    {project.analytics && (
                      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                        <div>
                          <p className="text-muted-foreground">Views</p>
                          <p className="font-medium">{project.analytics.views.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Engagement</p>
                          <p className="font-medium">{project.analytics.engagement}%</p>
                        </div>
                      </div>
                    )}

                    {/* Platforms */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        {project.platforms.slice(0, 3).map((platform, index) => (
                          <span key={index} className="px-1 py-0.5 bg-muted rounded">
                            {platform}
                          </span>
                        ))}
                      </div>
                      <span className="capitalize">{project.type}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {project.status === "draft" || project.status === "editing" ? (
                        <Button size="sm" className="flex-1">
                          <Edit3 className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      ) : (
                        <Button size="sm" className="flex-1">
                          <Play className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Video Editor Tab */}
      {activeTab === "editor" && (
        <>
          {selectedProject ? (
            <div className="space-y-6">
              {/* Editor Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{selectedProject.title}</h2>
                  <p className="text-muted-foreground">Video Editor</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button size="sm">
                    <Zap className="h-4 w-4 mr-2" />
                    Render
                  </Button>
                </div>
              </div>

              {/* Video Editor Interface */}
              <div className="grid gap-6 lg:grid-cols-4">
                {/* Preview Area */}
                <div className="lg:col-span-3">
                  <Card>
                    <CardContent className="p-6">
                      {/* Video Preview */}
                      <div className="aspect-video bg-neutral-950 rounded-lg mb-4 relative overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center text-white">
                            <Play className="h-16 w-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg">Video Preview</p>
                            <p className="text-sm opacity-75">{selectedProject.resolution} • {formatDuration(selectedProject.duration)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Video Controls */}
                      <div className="flex items-center gap-4 mb-6">
                        <Button size="sm" variant="outline">
                          <SkipBack className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <SkipForward className="h-4 w-4" />
                        </Button>
                        <div className="flex-1 bg-muted h-2 rounded-full relative">
                          <div className="bg-primary h-2 rounded-full w-1/3"></div>
                        </div>
                        <span className="text-sm text-muted-foreground">00:30 / {formatDuration(selectedProject.duration)}</span>
                        <Button size="sm" variant="outline">
                          <Volume2 className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Maximize className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Timeline */}
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-medium">Timeline</h3>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">
                              <Scissors className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {/* Video Track */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground w-12">Video</span>
                            <div className="flex-1 h-8 bg-blue-100 rounded flex items-center px-2">
                              <Video className="h-4 w-4 text-blue-600 mr-2" />
                              <span className="text-xs text-blue-700">Main Video Clip</span>
                            </div>
                          </div>
                          {/* Audio Track */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground w-12">Audio</span>
                            <div className="flex-1 h-6 bg-green-100 rounded flex items-center px-2">
                              <Waves className="h-3 w-3 text-green-600 mr-2" />
                              <span className="text-xs text-green-700">Background Music</span>
                            </div>
                          </div>
                          {/* Text Track */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground w-12">Text</span>
                            <div className="flex-1 h-6 bg-purple-100 rounded flex items-center px-2">
                              <Type className="h-3 w-3 text-purple-600 mr-2" />
                              <span className="text-xs text-purple-700">Title Text</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Tools Panel */}
                <div className="space-y-6">
                  {/* Media Library */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Media</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-2">
                      {[
                        { name: "Video Clip 1", type: "video", duration: "0:45" },
                        { name: "Background Music", type: "audio", duration: "1:30" },
                        { name: "Logo Image", type: "image", duration: "Static" },
                        { name: "Intro Template", type: "template", duration: "0:10" }
                      ].map((asset, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-muted">
                          {asset.type === "video" && <FileVideo className="h-4 w-4 text-blue-600" />}
                          {asset.type === "audio" && <Music className="h-4 w-4 text-green-600" />}
                          {asset.type === "image" && <Image className="h-4 w-4 text-purple-600" />}
                          {asset.type === "template" && <Layout className="h-4 w-4 text-orange-600" />}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{asset.name}</p>
                            <p className="text-xs text-muted-foreground">{asset.duration}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Effects Panel */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Effects</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-2">
                      {[
                        { name: "Fade In", icon: Sun },
                        { name: "Fade Out", icon: Moon },
                        { name: "Blur", icon: Blend },
                        { name: "Color Adjust", icon: Sliders },
                        { name: "Crop", icon: Crop },
                        { name: "Zoom", icon: Maximize }
                      ].map((effect, index) => (
                        <Button key={index} variant="outline" size="sm" className="w-full justify-start">
                          <effect.icon className="h-4 w-4 mr-2" />
                          {effect.name}
                        </Button>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Properties Panel */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Properties</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      <div>
                        <label className="text-xs font-medium">Opacity</label>
                        <div className="flex items-center gap-2 mt-1">
                          <input type="range" className="flex-1" defaultValue={100} />
                          <span className="text-xs w-8">100%</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium">Volume</label>
                        <div className="flex items-center gap-2 mt-1">
                          <input type="range" className="flex-1" defaultValue={80} />
                          <span className="text-xs w-8">80%</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium">Speed</label>
                        <select className="w-full text-xs border rounded px-2 py-1 mt-1">
                          <option>0.5x</option>
                          <option>1x</option>
                          <option>1.5x</option>
                          <option>2x</option>
                        </select>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Video className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Project Selected</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Select a project from the projects tab to start editing.
                </p>
                <Button onClick={() => setActiveTab("projects")}>
                  View Projects
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Templates Tab */}
      {activeTab === "templates" && (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-all cursor-pointer">
                <CardContent className="p-0">
                  {/* Template Preview */}
                  <div className="relative aspect-video bg-gradient-to-br from-primary/5 to-primary/10 rounded-t-lg overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Play className="h-8 w-8 text-primary" />
                    </div>
                    <div className="absolute top-3 right-3">
                      {template.isPremium && (
                        <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
                          PRO
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <span className="bg-neutral-950/80 text-white px-2 py-1 rounded text-xs font-medium">
                        {formatDuration(template.duration)}
                      </span>
                    </div>
                  </div>

                  {/* Template Info */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{template.name}</h3>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        {template.rating}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                    
                    {/* Features */}
                    <div className="space-y-2 mb-4">
                      {template.features.slice(0, 3).map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {template.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-muted rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                      <span>{template.uses.toLocaleString()} uses</span>
                      <span className="capitalize">{template.category}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        <Copy className="h-4 w-4 mr-2" />
                        Use Template
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Media Library Tab */}
      {activeTab === "library" && (
        <>
          <div className="text-center py-8">
            <FileVideo className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Media Library</h3>
            <p className="text-muted-foreground mb-4">
              Manage your video assets, audio files, images, and templates.
            </p>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload Media
            </Button>
          </div>

          {/* Media Categories */}
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { name: "Videos", count: 45, icon: FileVideo, color: "bg-blue-100 text-blue-700" },
              { name: "Audio", count: 23, icon: Music, color: "bg-green-100 text-green-700" },
              { name: "Images", count: 156, icon: Image, color: "bg-purple-100 text-purple-700" },
              { name: "Templates", count: 12, icon: Layout, color: "bg-orange-100 text-orange-700" }
            ].map((category) => (
              <Card key={category.name} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className={'w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${category.color}'}>
                    <category.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-1">{category.name}</h3>
                  <p className="text-2xl font-bold text-primary">{category.count}</p>
                  <p className="text-xs text-muted-foreground">files</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && (
        <>
          {/* Analytics Overview */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
                <Video className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalVideos}</div>
                <p className="text-xs text-muted-foreground">Published videos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalViews.toLocaleString()}</div>
                <p className="text-xs text-green-600">+12.5% vs last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Engagement</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalEngagement}%</div>
                <p className="text-xs text-green-600">Above industry avg</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <PlayCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.avgCompletionRate}%</div>
                <p className="text-xs text-muted-foreground">Average completion</p>
              </CardContent>
            </Card>
          </div>

          {/* Top Performing Videos */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Videos</CardTitle>
              <CardDescription>Videos with highest engagement rates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topPerformingVideos.map((video, index) => (
                  <div key={video.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium">{video.title}</p>
                        <p className="text-sm text-muted-foreground">{video.views.toLocaleString()} views</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">{video.engagement}%</p>
                      <p className="text-xs text-muted-foreground">engagement</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Platform Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Performance</CardTitle>
              <CardDescription>Video performance across different platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.platformBreakdown.map((platform, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">{platform.platform}</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="font-medium">{platform.views.toLocaleString()}</p>
                        <p className="text-muted-foreground">views</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{platform.engagement}%</p>
                        <p className="text-muted-foreground">engagement</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}