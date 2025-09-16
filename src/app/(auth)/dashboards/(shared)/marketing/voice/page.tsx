"use client";

import { useState } from "react";
;
import { 
  Mic,
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
  Bot,
  Headphones,
  Volume2,
  VolumeX,
  Radio,
  Waves,
  MicIcon,
  PhoneCall,
  MessageCircle,
  Send,
  Music,
  FileAudio,
  Speaker,
  Podcast,
  Rss,
  Cast,
  Bluetooth,
  Wifi,
  Signal,
  Phone,
  Voicemail,
  CallMissed,
  CallReceived,
  CallMade,
  PersonStanding,
  Brain,
  Lightbulb,
  Wand2,
  FileText,
  Languages,
  ChevronRight,
  PlayCircle,
  PauseCircle,
  StopCircle,
  Square,
  RotateCcw,
  FastForward,
  Rewind,
  SkipBack,
  SkipForward,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';


interface VoiceProject {
  id: string;
  name: string;
  description: string;
  type: "podcast" | "voiceover" | "chatbot" | "ivr" | "audio-ad" | "voice-assistant";
  status: "draft" | "recording" | "processing" | "completed" | "published";
  duration: number;
  language: string;
  voice: {
    id: string;
    name: string;
    gender: "male" | "female" | "neutral";
    accent: string;
    style: string;
  };
  script?: string;
  audioUrl?: string;
  createdAt: string;
  lastModified: string;
  author: string;
  tags: string[];
  analytics?: {
    listens: number;
    completionRate: number;
    engagement: number;
    conversions: number;
    sentiment: number;
  };
  settings: {
    speed: number;
    pitch: number;
    volume: number;
    emphasis: string[];
    pauses: { position: number; duration: number; }[];
  };
}

interface VoiceModel {
  id: string;
  name: string;
  gender: "male" | "female" | "neutral";
  accent: string;
  style: string;
  description: string;
  languages: string[];
  features: string[];
  category: "conversational" | "professional" | "casual" | "energetic" | "calm" | "authoritative";
  rating: number;
  uses: number;
  isPremium: boolean;
  previewUrl: string;
}

interface ConversationFlow {
  id: string;
  name: string;
  description: string;
  type: "customer-service" | "sales" | "survey" | "appointment" | "lead-qualification";
  status: "draft" | "active" | "paused" | "archived";
  nodes: FlowNode[];
  connections: FlowConnection[];
  analytics: {
    totalInteractions: number;
    avgDuration: number;
    completionRate: number;
    satisfaction: number;
    conversions: number;
  };
  settings: {
    timeout: number;
    maxRetries: number;
    fallbackMessage: string;
    transferToHuman: boolean;
  };
}

interface FlowNode {
  id: string;
  type: "greeting" | "question" | "response" | "condition" | "action" | "transfer" | "end";
  position: { x: number; y: number; };
  data: {
    message: string;
    voice?: string;
    options?: string[];
    condition?: string;
    action?: string;
  };
}

interface FlowConnection {
  id: string;
  source: string;
  target: string;
  condition?: string;
  label?: string;
}

interface VoiceAnalytics {
  totalProjects: number;
  totalListens: number;
  avgCompletionRate: number;
  avgSentiment: number;
  topVoices: {
    id: string;
    name: string;
    uses: number;
    rating: number;
  }[];
  languageBreakdown: {
    language: string;
    projects: number;
    listens: number;
  }[];
  performanceMetrics: {
    date: string;
    listens: number;
    completions: number;
    conversions: number;
    sentiment: number;
  }[];
}

const mockProjects: VoiceProject[] = [
  {
    id: "1",
    name: "Product Demo Narration",
    description: "Professional narration for product demonstration video",
    type: "voiceover",
    status: "completed",
    duration: 180,
    language: "English (US)",
    voice: {
      id: "v1",
      name: "Sarah Professional",
      gender: "female",
      accent: "American",
      style: "Professional"
    },
    script: "Welcome to our revolutionary new product that will transform the way you work...",
    audioUrl: "/audio/product-demo.mp3",
    createdAt: "2024-01-15T00:00:00Z",
    lastModified: "2024-01-23T10:30:00Z",
    author: "Marketing Team",
    tags: ["product", "demo", "professional", "narration"],
    analytics: {
      listens: 2450,
      completionRate: 89.5,
      engagement: 92.1,
      conversions: 185,
      sentiment: 4.7
    },
    settings: {
      speed: 1.0,
      pitch: 0.0,
      volume: 0.8,
      emphasis: ["revolutionary", "transform"],
      pauses: [
        { position: 30, duration: 1000 },
        { position: 90, duration: 1500 }
      ]
    }
  },
  {
    id: "2",
    name: "Customer Service Chatbot",
    description: "AI-powered voice assistant for customer support inquiries",
    type: "chatbot",
    status: "active",
    duration: 0,
    language: "English (US)",
    voice: {
      id: "v2",
      name: "Alex Assistant",
      gender: "neutral",
      accent: "American",
      style: "Conversational"
    },
    createdAt: "2024-01-20T00:00:00Z",
    lastModified: "2024-01-23T11:15:00Z",
    author: "Support Team",
    tags: ["customer-service", "ai", "chatbot", "support"],
    analytics: {
      listens: 8920,
      completionRate: 76.3,
      engagement: 85.4,
      conversions: 445,
      sentiment: 4.2
    },
    settings: {
      speed: 0.9,
      pitch: 0.0,
      volume: 0.9,
      emphasis: ["help", "assist", "support"],
      pauses: []
    }
  },
  {
    id: "3",
    name: "Marketing Podcast Intro",
    description: "Energetic intro for weekly marketing podcast series",
    type: "podcast",
    status: "recording",
    duration: 45,
    language: "English (US)",
    voice: {
      id: "v3",
      name: "Mike Energetic",
      gender: "male",
      accent: "American",
      style: "Energetic"
    },
    script: "Welcome to Marketing Masters, the podcast where we dive deep into the latest trends...",
    createdAt: "2024-01-22T00:00:00Z",
    lastModified: "2024-01-23T09:45:00Z",
    author: "Content Team",
    tags: ["podcast", "intro", "marketing", "energetic"],
    settings: {
      speed: 1.1,
      pitch: 0.1,
      volume: 1.0,
      emphasis: ["Marketing Masters", "dive deep", "latest trends"],
      pauses: [{ position: 20, duration: 800 }]
    }
  },
  {
    id: "4",
    name: "IVR System Greeting",
    description: "Professional phone system greeting and menu options",
    type: "ivr",
    status: "draft",
    duration: 60,
    language: "English (US)",
    voice: {
      id: "v1",
      name: "Sarah Professional",
      gender: "female",
      accent: "American",
      style: "Professional"
    },
    script: "Thank you for calling our company. For sales, press 1. For support, press 2...",
    createdAt: "2024-01-24T00:00:00Z",
    lastModified: "2024-01-24T08:20:00Z",
    author: "Operations Team",
    tags: ["ivr", "phone", "greeting", "menu"],
    settings: {
      speed: 0.8,
      pitch: 0.0,
      volume: 0.9,
      emphasis: ["sales", "support", "press"],
      pauses: [
        { position: 15, duration: 1200 },
        { position: 35, duration: 1000 }
      ]
    }
  }
];

const mockVoiceModels: VoiceModel[] = [
  {
    id: "v1",
    name: "Sarah Professional",
    gender: "female",
    accent: "American",
    style: "Professional",
    description: "Clear, professional female voice perfect for business content",
    languages: ["English (US)", "English (UK)"],
    features: ["Natural intonation", "Clear articulation", "Business tone"],
    category: "professional",
    rating: 4.8,
    uses: 1234,
    isPremium: false,
    previewUrl: "/audio/sarah-preview.mp3"
  },
  {
    id: "v2",
    name: "Alex Assistant",
    gender: "neutral",
    accent: "American",
    style: "Conversational",
    description: "Friendly, approachable voice ideal for customer interactions",
    languages: ["English (US)", "Spanish", "French"],
    features: ["Conversational tone", "Multilingual", "Emotion recognition"],
    category: "conversational",
    rating: 4.6,
    uses: 892,
    isPremium: true,
    previewUrl: "/audio/alex-preview.mp3"
  },
  {
    id: "v3",
    name: "Mike Energetic",
    gender: "male",
    accent: "American",
    style: "Energetic",
    description: "High-energy male voice great for marketing and promotional content",
    languages: ["English (US)"],
    features: ["High energy", "Marketing optimized", "Enthusiasm"],
    category: "energetic",
    rating: 4.7,
    uses: 567,
    isPremium: false,
    previewUrl: "/audio/mike-preview.mp3"
  },
  {
    id: "v4",
    name: "Emma Calm",
    gender: "female",
    accent: "British",
    style: "Calm",
    description: "Soothing, calm voice perfect for meditation and wellness content",
    languages: ["English (UK)", "English (US)"],
    features: ["Calming tone", "Wellness optimized", "Mindfulness"],
    category: "calm",
    rating: 4.9,
    uses: 445,
    isPremium: true,
    previewUrl: "/audio/emma-preview.mp3"
  }
];

const mockConversationFlows: ConversationFlow[] = [
  {
    id: "cf1",
    name: "Customer Support Flow",
    description: "Automated customer support conversation flow",
    type: "customer-service",
    status: "active",
    nodes: [],
    connections: [],
    analytics: {
      totalInteractions: 2450,
      avgDuration: 4.2,
      completionRate: 78.5,
      satisfaction: 4.1,
      conversions: 156
    },
    settings: {
      timeout: 30,
      maxRetries: 3,
      fallbackMessage: "I'll connect you with a human agent",
      transferToHuman: true
    }
  },
  {
    id: "cf2",
    name: "Sales Qualification",
    description: "Lead qualification conversation flow",
    type: "sales",
    status: "active",
    nodes: [],
    connections: [],
    analytics: {
      totalInteractions: 1820,
      avgDuration: 6.8,
      completionRate: 65.3,
      satisfaction: 3.9,
      conversions: 243
    },
    settings: {
      timeout: 45,
      maxRetries: 2,
      fallbackMessage: "Let me schedule a call with our sales team",
      transferToHuman: true
    }
  }
];

const mockAnalytics: VoiceAnalytics = {
  totalProjects: 24,
  totalListens: 45620,
  avgCompletionRate: 82.3,
  avgSentiment: 4.4,
  topVoices: [
    { id: "v1", name: "Sarah Professional", uses: 1234, rating: 4.8 },
    { id: "v3", name: "Mike Energetic", uses: 892, rating: 4.7 },
    { id: "v2", name: "Alex Assistant", uses: 567, rating: 4.6 }
  ],
  languageBreakdown: [
    { language: "English (US)", projects: 18, listens: 32400 },
    { language: "Spanish", projects: 4, listens: 8900 },
    { language: "French", projects: 2, listens: 4320 }
  ],
  performanceMetrics: []
};

export default function VoiceAIPage() {
  const [projects, setProjects] = useState<VoiceProject[]>(mockProjects);
  const [voiceModels, setVoiceModels] = useState<VoiceModel[]>(mockVoiceModels);
  const [conversationFlows, setConversationFlows] = useState<ConversationFlow[]>(mockConversationFlows);
  const [analytics, setAnalytics] = useState<VoiceAnalytics>(mockAnalytics);
  const [activeTab, setActiveTab] = useState<"projects" | "studio" | "voices" | "conversations" | "analytics">("projects");
  const [selectedProject, setSelectedProject] = useState<VoiceProject | null>(null);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "recording": return <Mic className="h-4 w-4 text-red-600 animate-pulse" />;
      case "processing": return <RefreshCw className="h-4 w-4 text-yellow-600 animate-spin" />;
      case "published": return <Globe className="h-4 w-4 text-blue-600" />;
      case "active": return <Play className="h-4 w-4 text-green-600" />;
      case "paused": return <Pause className="h-4 w-4 text-yellow-600" />;
      case "draft": return <Clock className="h-4 w-4 text-gray-600" />;
      case "archived": return <XCircle className="h-4 w-4 text-gray-600" />;
      default: return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "podcast": return <Podcast className="h-4 w-4" />;
      case "voiceover": return <Mic className="h-4 w-4" />;
      case "chatbot": return <Bot className="h-4 w-4" />;
      case "ivr": return <Phone className="h-4 w-4" />;
      case "audio-ad": return <Megaphone className="h-4 w-4" />;
      case "voice-assistant": return <MessageCircle className="h-4 w-4" />;
      default: return <Volume2 className="h-4 w-4" />;
    }
  };

  const getVoiceIcon = (gender: string) => {
    switch (gender) {
      case "male": return <PersonStanding className="h-4 w-4 text-blue-600" />;
      case "female": return <PersonStanding className="h-4 w-4 text-pink-600" />;
      case "neutral": return <Bot className="h-4 w-4 text-purple-600" />;
      default: return <Mic className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "professional": return "bg-blue-100 text-blue-700";
      case "conversational": return "bg-green-100 text-green-700";
      case "energetic": return "bg-orange-100 text-orange-700";
      case "calm": return "bg-purple-100 text-purple-700";
      case "authoritative": return "bg-red-100 text-red-700";
      case "casual": return "bg-yellow-100 text-yellow-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return "Live";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return '${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const playPreview = (voiceId: string) => {
    if (isPlaying === voiceId) {
      setIsPlaying(null);
    } else {
      setIsPlaying(voiceId);
      // Simulate audio playback
      setTimeout(() => setIsPlaying(null), 3000);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Voice & Conversational AI</h1>
          <p className="text-muted-foreground">
            Create voice content, AI chatbots, and conversational experiences for your marketing.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Languages className="h-4 w-4 mr-2" />
            Languages
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
            activeTab === "studio" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("studio")}
        >
          Voice Studio
        </button>
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === "voices" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("voices")}
        >
          AI Voices
        </button>
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === "conversations" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("conversations")}
        >
          Conversations
        </button>
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === "analytics" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }'}
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
            <select className="px-3 py-2 border rounded-md bg-background">
              <option value="all">All Types</option>
              <option value="podcast">Podcast</option>
              <option value="voiceover">Voiceover</option>
              <option value="chatbot">Chatbot</option>
              <option value="ivr">IVR System</option>
              <option value="audio-ad">Audio Ad</option>
              <option value="voice-assistant">Voice Assistant</option>
            </select>
            <select className="px-3 py-2 border rounded-md bg-background">
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="recording">Recording</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="published">Published</option>
            </select>
          </div>

          {/* Project Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                <Mic className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{projects.length}</div>
                <p className="text-xs text-muted-foreground">Voice projects</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Listens</CardTitle>
                <Headphones className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {projects.reduce((sum, p) => sum + (p.analytics?.listens || 0), 0).toLocaleString()}
                </div>
                <p className="text-xs text-green-600">+15.2% vs last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Completion</CardTitle>
                <PlayCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(projects.reduce((sum, p) => sum + (p.analytics?.completionRate || 0), 0) / projects.filter(p => p.analytics).length).toFixed(1)}%
                </div>
                <p className="text-xs text-green-600">Above industry avg</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Sentiment</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(projects.reduce((sum, p) => sum + (p.analytics?.sentiment || 0), 0) / projects.filter(p => p.analytics).length).toFixed(1)}/5
                </div>
                <p className="text-xs text-green-600">High satisfaction</p>
              </CardContent>
            </Card>
          </div>

          {/* Projects List */}
          <div className="space-y-4">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-md transition-all cursor-pointer" onClick={() => setSelectedProject(project)}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        {getTypeIcon(project.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{project.name}</h3>
                          {getStatusIcon(project.status)}
                          <span className={'px-2 py-1 rounded-full text-xs font-medium capitalize ${
                            project.status === "completed" 
                              ? "bg-green-100 text-green-700"
                              : project.status === "recording"
                                ? "bg-red-100 text-red-700"
                                : project.status === "processing"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : project.status === "published"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-gray-100 text-gray-700"
                          }'}>
                            {project.status}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-sm mb-2">{project.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            {getVoiceIcon(project.voice.gender)}
                            <span>{project.voice.name}</span>
                          </div>
                          <span className="capitalize">{project.type}</span>
                          <span>{project.language}</span>
                          <span>{formatDuration(project.duration)}</span>
                          <span>By {project.author}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {project.tags.slice(0, 4).map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-muted rounded text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {project.audioUrl && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            playPreview(project.id);
                          }}
                        >
                          {isPlaying === project.id ? (
                            <PauseCircle className="h-4 w-4 mr-2" />
                          ) : (
                            <PlayCircle className="h-4 w-4 mr-2" />
                          )}
                          {isPlaying === project.id ? "Pause" : "Play"}
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </div>

                  {/* Analytics */}
                  {project.analytics && (
                    <div className="grid gap-4 md:grid-cols-5 pt-4 border-t">
                      <div>
                        <p className="text-sm text-muted-foreground">Listens</p>
                        <p className="font-semibold">{project.analytics.listens.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Completion Rate</p>
                        <p className="font-semibold text-green-600">{project.analytics.completionRate}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Engagement</p>
                        <p className="font-semibold">{project.analytics.engagement}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Conversions</p>
                        <p className="font-semibold">{project.analytics.conversions}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Sentiment</p>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="font-semibold">{project.analytics.sentiment}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Voice Studio Tab */}
      {activeTab === "studio" && (
        <>
          {selectedProject ? (
            <div className="space-y-6">
              {/* Studio Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{selectedProject.name}</h2>
                  <p className="text-muted-foreground">Voice Studio Editor</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export Audio
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button size="sm">
                    <Mic className="h-4 w-4 mr-2" />
                    Generate
                  </Button>
                </div>
              </div>

              {/* Studio Interface */}
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Script Editor */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Script Editor</CardTitle>
                      <CardDescription>Edit your script and customize voice settings</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Script Text Area */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">Script</label>
                        <textarea
                          className="w-full h-40 p-3 border rounded-md resize-none"
                          defaultValue={selectedProject.script}
                          placeholder="Enter your script here..."
                        />
                      </div>

                      {/* Voice Controls */}
                      <div className="grid gap-4 md:grid-cols-3">
                        <div>
                          <label className="text-sm font-medium">Speed</label>
                          <div className="flex items-center gap-2 mt-1">
                            <input 
                              type="range" 
                              className="flex-1" 
                              min="0.5" 
                              max="2" 
                              step="0.1" 
                              defaultValue={selectedProject.settings.speed} 
                            />
                            <span className="text-sm w-12">{selectedProject.settings.speed}x</span>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Pitch</label>
                          <div className="flex items-center gap-2 mt-1">
                            <input 
                              type="range" 
                              className="flex-1" 
                              min="-1" 
                              max="1" 
                              step="0.1" 
                              defaultValue={selectedProject.settings.pitch} 
                            />
                            <span className="text-sm w-12">{selectedProject.settings.pitch > 0 ? '+' : `}{selectedProject.settings.pitch}</span>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Volume</label>
                          <div className="flex items-center gap-2 mt-1">
                            <input 
                              type="range" 
                              className="flex-1" 
                              min="0" 
                              max="1" 
                              step="0.1" 
                              defaultValue={selectedProject.settings.volume} 
                            />
                            <span className="text-sm w-12">{Math.round(selectedProject.settings.volume * 100)}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Audio Preview */}
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium">Audio Preview</h4>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">
                              <Rewind className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Play className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <FastForward className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex-1 bg-muted h-3 rounded-full relative">
                            <div className="bg-primary h-3 rounded-full w-1/3"></div>
                          </div>
                          <span className="text-sm text-muted-foreground">1:23 / 3:00</span>
                        </div>
                      </div>

                      {/* Generation Options */}
                      <div className="flex gap-2">
                        <Button className="flex-1">
                          <Wand2 className="h-4 w-4 mr-2" />
                          Generate Audio
                        </Button>
                        <Button variant="outline">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Regenerate
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Settings Panel */}
                <div className="space-y-6">
                  {/* Voice Selection */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Voice Selection</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-3 border rounded-lg bg-primary/5">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getVoiceIcon(selectedProject.voice.gender)}
                            <span className="font-medium">{selectedProject.voice.name}</span>
                          </div>
                          <Button size="sm" variant="outline">
                            <PlayCircle className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">{selectedProject.voice.accent} • {selectedProject.voice.style}</p>
                      </div>
                      <Button variant="outline" className="w-full">
                        <Edit3 className="h-4 w-4 mr-2" />
                        Change Voice
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Language Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Language Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Language</label>
                        <select className="w-full mt-1 p-2 border rounded-md">
                          <option value="en-US">English (US)</option>
                          <option value="en-UK">English (UK)</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Accent</label>
                        <select className="w-full mt-1 p-2 border rounded-md">
                          <option value="american">American</option>
                          <option value="british">British</option>
                          <option value="australian">Australian</option>
                        </select>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Advanced Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Advanced Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Emphasis Words</label>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {selectedProject.settings.emphasis.map((word, index) => (
                            <span key={index} className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                              {word}
                            </span>
                          ))}
                        </div>
                        <input
                          type="text"
                          placeholder="Add emphasis word..."
                          className="w-full text-xs p-2 border rounded-md"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Custom Pauses</label>
                        <div className="space-y-2">
                          {selectedProject.settings.pauses.map((pause, index) => (
                            <div key={index} className="flex items-center justify-between text-xs">
                              <span>At {pause.position}s</span>
                              <span>{pause.duration}ms pause</span>
                            </div>
                          ))}
                        </div>
                        <Button size="sm" variant="outline" className="w-full mt-2">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Pause
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Mic className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Project Selected</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Select a project from the projects tab to start editing in Voice Studio.
                </p>
                <Button onClick={() => setActiveTab("projects")}>
                  View Projects
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* AI Voices Tab */}
      {activeTab === "voices" && (
        <>
          <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground">
              Choose from our collection of AI-powered voices for your projects.
            </p>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Upload Custom Voice
            </Button>
          </div>

          {/* Voice Models Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {voiceModels.map((voice) => (
              <Card key={voice.id} className="hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {getVoiceIcon(voice.gender)}
                      </div>
                      <div>
                        <h3 className="font-semibold">{voice.name}</h3>
                        <p className="text-sm text-muted-foreground">{voice.accent} • {voice.style}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {voice.isPremium && (
                        <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
                          PRO
                        </span>
                      )}
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        {voice.rating}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">{voice.description}</p>

                  {/* Voice Category */}
                  <div className="mb-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getCategoryColor(voice.category)}'}>
                      {voice.category}
                    </span>
                  </div>

                  {/* Features */}
                  <div className="space-y-2 mb-4">
                    {voice.features.slice(0, 3).map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Languages */}
                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground mb-1">Languages</p>
                    <div className="flex flex-wrap gap-1">
                      {voice.languages.map((language, index) => (
                        <span key={index} className="px-1 py-0.5 bg-muted rounded text-xs">
                          {language}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                    <span>{voice.uses.toLocaleString()} uses</span>
                    <span className="capitalize">{voice.gender}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => playPreview(voice.id)}
                    >
                      {isPlaying === voice.id ? (
                        <PauseCircle className="h-4 w-4 mr-2" />
                      ) : (
                        <PlayCircle className="h-4 w-4 mr-2" />
                      )}
                      {isPlaying === voice.id ? "Stop" : "Preview"}
                    </Button>
                    <Button size="sm">
                      <Copy className="h-4 w-4 mr-2" />
                      Use Voice
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Conversations Tab */}
      {activeTab === "conversations" && (
        <>
          <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground">
              Design and manage conversational AI flows for chatbots and voice assistants.
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Conversation Flow
            </Button>
          </div>

          {/* Conversation Flows */}
          <div className="space-y-4">
            {conversationFlows.map((flow) => (
              <Card key={flow.id} className="hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{flow.name}</h3>
                        {getStatusIcon(flow.status)}
                        <span className={'px-2 py-1 rounded-full text-xs font-medium capitalize ${
                          flow.status === "active" 
                            ? "bg-green-100 text-green-700"
                            : flow.status === "paused"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                        }'}>
                          {flow.status}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm mb-2">{flow.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="capitalize">{flow.type.replace('-', ' ')}</span>
                        <span>Timeout: {flow.settings.timeout}s</span>
                        <span>Max Retries: {flow.settings.maxRetries}</span>
                        <span>Human Transfer: {flow.settings.transferToHuman ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit Flow
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                    </div>
                  </div>

                  {/* Flow Analytics */}
                  <div className="grid gap-4 md:grid-cols-5 pt-4 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground">Interactions</p>
                      <p className="font-semibold">{flow.analytics.totalInteractions.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Duration</p>
                      <p className="font-semibold">{flow.analytics.avgDuration.toFixed(1)} min</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Completion Rate</p>
                      <p className="font-semibold text-green-600">{flow.analytics.completionRate}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Satisfaction</p>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="font-semibold">{flow.analytics.satisfaction}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Conversions</p>
                      <p className="font-semibold">{flow.analytics.conversions}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Conversation Flow Builder Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Flow Builder Preview</CardTitle>
              <CardDescription>Visual conversation flow designer</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 bg-muted/20 rounded-lg">
                <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Interactive Flow Builder</h3>
                <p className="text-muted-foreground mb-4">
                  Design conversational flows with drag-and-drop nodes, conditions, and actions.
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Flow
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && (
        <>
          {/* Analytics Overview */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                <Mic className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalProjects}</div>
                <p className="text-xs text-muted-foreground">Voice projects</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Listens</CardTitle>
                <Headphones className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalListens.toLocaleString()}</div>
                <p className="text-xs text-green-600">+18.5% vs last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Completion</CardTitle>
                <PlayCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.avgCompletionRate}%</div>
                <p className="text-xs text-green-600">Above industry avg</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Sentiment</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.avgSentiment}/5</div>
                <p className="text-xs text-green-600">High satisfaction</p>
              </CardContent>
            </Card>
          </div>

          {/* Top Voices */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Voices</CardTitle>
              <CardDescription>Most popular AI voices by usage and rating</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topVoices.map((voice, index) => (
                  <div key={voice.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium">{voice.name}</p>
                        <p className="text-sm text-muted-foreground">{voice.uses.toLocaleString()} uses</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="font-semibold">{voice.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Language Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Language Distribution</CardTitle>
              <CardDescription>Voice content breakdown by language</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.languageBreakdown.map((lang, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Languages className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">{lang.language}</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="font-medium">{lang.projects}</p>
                        <p className="text-muted-foreground">projects</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{lang.listens.toLocaleString()}</p>
                        <p className="text-muted-foreground">listens</p>
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