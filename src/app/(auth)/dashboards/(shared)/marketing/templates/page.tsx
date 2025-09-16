"use client";

import { useState } from "react";
;
import { 
  FileText,
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
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';


interface CampaignTemplate {
  id: string;
  name: string;
  description: string;
  category: "email" | "social" | "landing" | "ads" | "automation" | "seo" | "content";
  type: "campaign" | "sequence" | "page" | "creative" | "workflow" | "strategy";
  industry: "ecommerce" | "saas" | "agency" | "education" | "healthcare" | "finance" | "general";
  status: "published" | "draft" | "archived";
  popularity: number;
  rating: number;
  reviews: number;
  uses: number;
  createdAt: string;
  lastModified: string;
  author: string;
  tags: string[];
  isPremium: boolean;
  isBookmarked: boolean;
  preview: {
    thumbnail: string;
    images: string[];
    description: string;
    features: string[];
  };
  metrics?: {
    avgOpenRate?: number;
    avgClickRate?: number;
    avgConversionRate?: number;
    performance: "excellent" | "good" | "average" | "poor";
  };
  content: {
    structure: string[];
    components: string[];
    duration?: string;
    channels?: string[];
  };
}

interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  count: number;
  icon: any;
  color: string;
}

const mockTemplates: CampaignTemplate[] = [
  {
    id: "1",
    name: "Welcome Email Series",
    description: "5-part automated welcome sequence for new subscribers with personalization",
    category: "email",
    type: "sequence",
    industry: "general",
    status: "published",
    popularity: 95,
    rating: 4.8,
    reviews: 234,
    uses: 1520,
    createdAt: "2024-01-01T00:00:00Z",
    lastModified: "2024-01-20T00:00:00Z",
    author: "Marketing Team",
    tags: ["onboarding", "automation", "personalization", "engagement"],
    isPremium: false,
    isBookmarked: true,
    preview: {
      thumbnail: "/templates/welcome-series.jpg",
      images: ["/templates/welcome-1.jpg", "/templates/welcome-2.jpg"],
      description: "Comprehensive onboarding sequence that introduces your brand and guides new users",
      features: ["Personalized content", "Automated scheduling", "A/B test ready", "Mobile optimized"]
    },
    metrics: {
      avgOpenRate: 45.2,
      avgClickRate: 12.8,
      avgConversionRate: 8.5,
      performance: "excellent"
    },
    content: {
      structure: ["Welcome Message", "Company Introduction", "Product Tour", "Social Proof", "Next Steps"],
      components: ["Hero Banner", "CTA Buttons", "Social Links", "Personalization Tokens"],
      duration: "5 days",
      channels: ["Email"]
    }
  },
  {
    id: "2",
    name: "Product Launch Campaign",
    description: "Multi-channel campaign template for product launches with email, social, and ads",
    category: "automation",
    type: "campaign",
    industry: "ecommerce",
    status: "published",
    popularity: 92,
    rating: 4.7,
    reviews: 189,
    uses: 892,
    createdAt: "2024-01-05T00:00:00Z",
    lastModified: "2024-01-22T00:00:00Z",
    author: "E-commerce Experts",
    tags: ["product-launch", "multi-channel", "automation", "sales"],
    isPremium: true,
    isBookmarked: false,
    preview: {
      thumbnail: "/templates/product-launch.jpg",
      images: ["/templates/launch-1.jpg", "/templates/launch-2.jpg", "/templates/launch-3.jpg"],
      description: "Complete product launch sequence across email, social media, and paid advertising",
      features: ["Multi-channel coordination", "Countdown timers", "Social proof widgets", "Analytics tracking"]
    },
    metrics: {
      avgOpenRate: 38.9,
      avgClickRate: 15.2,
      avgConversionRate: 12.3,
      performance: "excellent"
    },
    content: {
      structure: ["Teaser Phase", "Announcement", "Launch Day", "Follow-up", "Success Stories"],
      components: ["Email Templates", "Social Posts", "Ad Creatives", "Landing Pages"],
      duration: "14 days",
      channels: ["Email", "Social Media", "Paid Ads", "Website"]
    }
  },
  {
    id: "3",
    name: "Conversion Landing Page",
    description: "High-converting landing page template with proven elements and sections",
    category: "landing",
    type: "page",
    industry: "saas",
    status: "published",
    popularity: 88,
    rating: 4.6,
    reviews: 156,
    uses: 634,
    createdAt: "2024-01-10T00:00:00Z",
    lastModified: "2024-01-18T00:00:00Z",
    author: "Conversion Specialists",
    tags: ["landing-page", "conversion", "saas", "optimization"],
    isPremium: false,
    isBookmarked: true,
    preview: {
      thumbnail: "/templates/landing-page.jpg",
      images: ["/templates/landing-1.jpg", "/templates/landing-2.jpg"],
      description: "Proven landing page structure with high conversion rates for SaaS products",
      features: ["Mobile responsive", "Fast loading", "A/B test variants", "Form optimization"]
    },
    metrics: {
      avgConversionRate: 18.7,
      performance: "excellent"
    },
    content: {
      structure: ["Hero Section", "Benefits", "Social Proof", "Features", "FAQ", "CTA"],
      components: ["Hero Banner", "Feature Grid", "Testimonials", "Pricing Table", "Contact Form"],
      channels: ["Website"]
    }
  },
  {
    id: "4",
    name: "Social Media Content Calendar",
    description: "30-day content calendar template with post ideas and scheduling guidelines",
    category: "social",
    type: "strategy",
    industry: "general",
    status: "published",
    popularity: 85,
    rating: 4.5,
    reviews: 203,
    uses: 745,
    createdAt: "2024-01-08T00:00:00Z",
    lastModified: "2024-01-25T00:00:00Z",
    author: "Social Media Team",
    tags: ["social-media", "content-calendar", "planning", "engagement"],
    isPremium: false,
    isBookmarked: false,
    preview: {
      thumbnail: "/templates/social-calendar.jpg",
      images: ["/templates/social-1.jpg", "/templates/social-2.jpg"],
      description: "Comprehensive social media content calendar with post templates and scheduling",
      features: ["Post templates", "Hashtag suggestions", "Best time analytics", "Multi-platform"]
    },
    metrics: {
      performance: "good"
    },
    content: {
      structure: ["Week 1", "Week 2", "Week 3", "Week 4", "Bonus Content"],
      components: ["Post Templates", "Image Guidelines", "Hashtag Lists", "Engagement Scripts"],
      duration: "30 days",
      channels: ["Facebook", "Instagram", "Twitter", "LinkedIn", "TikTok"]
    }
  },
  {
    id: "5",
    name: "Lead Nurturing Workflow",
    description: "Automated lead scoring and nurturing workflow for B2B sales teams",
    category: "automation",
    type: "workflow",
    industry: "saas",
    status: "published",
    popularity: 90,
    rating: 4.9,
    reviews: 167,
    uses: 423,
    createdAt: "2024-01-12T00:00:00Z",
    lastModified: "2024-01-24T00:00:00Z",
    author: "Sales Automation Pro",
    tags: ["lead-nurturing", "b2b", "automation", "sales"],
    isPremium: true,
    isBookmarked: true,
    preview: {
      thumbnail: "/templates/lead-nurturing.jpg",
      images: ["/templates/nurturing-1.jpg", "/templates/nurturing-2.jpg"],
      description: "Advanced lead nurturing system with scoring, segmentation, and automated follow-up",
      features: ["Lead scoring", "Dynamic segmentation", "Trigger-based emails", "CRM integration"]
    },
    metrics: {
      avgOpenRate: 52.3,
      avgClickRate: 18.9,
      avgConversionRate: 24.1,
      performance: "excellent"
    },
    content: {
      structure: ["Lead Capture", "Qualification", "Education", "Consideration", "Decision", "Close"],
      components: ["Scoring Rules", "Email Sequences", "Content Offers", "Sales Alerts"],
      duration: "Variable",
      channels: ["Email", "CRM", "Website", "Content Hub"]
    }
  },
  {
    id: "6",
    name: "Black Friday Campaign",
    description: "Complete Black Friday promotional campaign with countdown and urgency elements",
    category: "email",
    type: "campaign",
    industry: "ecommerce",
    status: "published",
    popularity: 87,
    rating: 4.4,
    reviews: 145,
    uses: 298,
    createdAt: "2024-01-15T00:00:00Z",
    lastModified: "2024-01-21T00:00:00Z",
    author: "E-commerce Team",
    tags: ["black-friday", "promotion", "urgency", "sales"],
    isPremium: false,
    isBookmarked: false,
    preview: {
      thumbnail: "/templates/black-friday.jpg",
      images: ["/templates/bf-1.jpg", "/templates/bf-2.jpg"],
      description: "High-impact promotional campaign template perfect for holiday sales",
      features: ["Countdown timers", "Urgency elements", "Deal highlights", "Mobile optimized"]
    },
    metrics: {
      avgOpenRate: 41.7,
      avgClickRate: 22.8,
      avgConversionRate: 15.4,
      performance: "excellent"
    },
    content: {
      structure: ["Pre-announcement", "Early Access", "Launch Day", "Reminder", "Last Chance"],
      components: ["Deal Banners", "Product Grids", "Countdown Timers", "Urgency Text"],
      duration: "7 days",
      channels: ["Email", "SMS", "Social Media"]
    }
  }
];

const mockCategories: TemplateCategory[] = [
  {
    id: "email",
    name: "Email Templates",
    description: "Email campaigns, sequences, and newsletters",
    count: 145,
    icon: Mail,
    color: "bg-blue-100 text-blue-700"
  },
  {
    id: "social",
    name: "Social Media",
    description: "Social posts, campaigns, and content calendars",
    count: 89,
    icon: MessageSquare,
    color: "bg-purple-100 text-purple-700"
  },
  {
    id: "landing",
    name: "Landing Pages",
    description: "High-converting landing page designs",
    count: 67,
    icon: Monitor,
    color: "bg-green-100 text-green-700"
  },
  {
    id: "ads",
    name: "Ad Campaigns",
    description: "Paid advertising templates and strategies",
    count: 78,
    icon: Megaphone,
    color: "bg-orange-100 text-orange-700"
  },
  {
    id: "automation",
    name: "Marketing Automation",
    description: "Workflow templates and automation sequences",
    count: 92,
    icon: Zap,
    color: "bg-yellow-100 text-yellow-700"
  },
  {
    id: "content",
    name: "Content Marketing",
    description: "Blog posts, guides, and content strategies",
    count: 156,
    icon: FileText,
    color: "bg-indigo-100 text-indigo-700"
  }
];

export default function CampaignTemplatesPage() {
  const [templates, setTemplates] = useState<CampaignTemplate[]>(mockTemplates);
  const [categories, setCategories] = useState<TemplateCategory[]>(mockCategories);
  const [activeTab, setActiveTab] = useState<"browse" | "favorites" | "my-templates" | "create">("browse");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "published": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "draft": return <Clock className="h-4 w-4 text-yellow-600" />;
      case "archived": return <XCircle className="h-4 w-4 text-gray-600" />;
      default: return null;
    }
  };

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case "excellent": return "text-green-600 bg-green-100";
      case "good": return "text-blue-600 bg-blue-100";
      case "average": return "text-yellow-600 bg-yellow-100";
      case "poor": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "email": return <Mail className="h-4 w-4" />;
      case "social": return <MessageSquare className="h-4 w-4" />;
      case "landing": return <Monitor className="h-4 w-4" />;
      case "ads": return <Megaphone className="h-4 w-4" />;
      case "automation": return <Zap className="h-4 w-4" />;
      case "seo": return <TrendingUp className="h-4 w-4" />;
      case "content": return <FileText className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    const matchesIndustry = selectedIndustry === "all" || template.industry === selectedIndustry;
    const matchesTab = activeTab === "browse" || 
                      (activeTab === "favorites" && template.isBookmarked) ||
                      (activeTab === "my-templates" && template.author === "You");
    
    return matchesSearch && matchesCategory && matchesIndustry && matchesTab;
  });

  const toggleBookmark = (templateId: string) => {
    setTemplates(prev => prev.map(template =>
      template.id === templateId 
        ? { ...template, isBookmarked: !template.isBookmarked }
        : template
    ));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaign Templates</h1>
          <p className="text-muted-foreground">
            Pre-built marketing campaign templates to accelerate your marketing efforts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import Template
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b">
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === "browse" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("browse")}
        >
          Browse Templates
        </button>
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === "favorites" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("favorites")}
        >
          Favorites
        </button>
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === "my-templates" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("my-templates")}
        >
          My Templates
        </button>
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === "create" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("create")}
        >
          Create New
        </button>
      </div>

      {/* Browse Templates Tab */}
      {(activeTab === "browse" || activeTab === "favorites" || activeTab === "my-templates") && (
        <>
          {/* Search and Filters */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search templates..."
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
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            <select 
              className="px-3 py-2 border rounded-md bg-background"
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
            >
              <option value="all">All Industries</option>
              <option value="ecommerce">E-commerce</option>
              <option value="saas">SaaS</option>
              <option value="agency">Agency</option>
              <option value="education">Education</option>
              <option value="healthcare">Healthcare</option>
              <option value="finance">Finance</option>
              <option value="general">General</option>
            </select>
            <div className="flex items-center border rounded-md">
              <button
                className={`p-2 ${viewMode === "grid" ? "bg-muted" : ""}`}
                onClick={() => setViewMode("grid")}
              >
                <Layout className="h-4 w-4" />
              </button>
              <button
                className={`p-2 ${viewMode === "list" ? "bg-muted" : ""}`}
                onClick={() => setViewMode("list")}
              >
                <BarChart3 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Template Categories */}
          {activeTab === "browse" && (
            <div className="grid gap-4 md:grid-cols-6">
              {categories.map((category) => (
                <Card 
                  key={category.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedCategory === category.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedCategory(selectedCategory === category.id ? "all" : category.id)}
                >
                  <CardContent className="p-4 text-center">
                    <div className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center ${category.color}`}>
                      <category.icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-medium text-sm mb-1">{category.name}</h3>
                    <p className="text-xs text-muted-foreground">{category.count} templates</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Templates Grid/List */}
          {viewMode === "grid" ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="group hover:shadow-lg transition-all">
                  <CardContent className="p-0">
                    {/* Template Preview */}
                    <div className="relative aspect-video bg-gradient-to-br from-primary/5 to-primary/10 rounded-t-lg overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        {getCategoryIcon(template.category)}
                      </div>
                      <div className="absolute top-3 right-3 flex items-center gap-2">
                        {template.isPremium && (
                          <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
                            PRO
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmark(template.id);
                          }}
                          className={`p-1.5 rounded-full transition-all ${
                            template.isBookmarked 
                              ? "bg-red-100 text-red-600" 
                              : "bg-white/80 text-gray-600 hover:bg-white"
                          }`}
                        >
                          <Heart className={`h-4 w-4 ${template.isBookmarked ? "fill-current" : ""}`} />
                        </button>
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(template.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            template.metrics?.performance 
                              ? getPerformanceColor(template.metrics.performance)
                              : "bg-gray-100 text-gray-700"
                          }`}>
                            {template.metrics?.performance || template.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Template Info */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                            {template.name}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {template.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          {template.rating}
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {template.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-muted rounded text-xs">
                            {tag}
                          </span>
                        ))}
                        {template.tags.length > 3 && (
                          <span className="px-2 py-1 bg-muted rounded text-xs">
                            +{template.tags.length - 3}
                          </span>
                        )}
                      </div>

                      {/* Metrics */}
                      {template.metrics && (
                        <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                          <div>
                            <p className="text-muted-foreground">Open Rate</p>
                            <p className="font-medium">{template.metrics.avgOpenRate}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Click Rate</p>
                            <p className="font-medium">{template.metrics.avgClickRate}%</p>
                          </div>
                        </div>
                      )}

                      {/* Usage Stats */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                        <span>{template.uses.toLocaleString()} uses</span>
                        <span>{template.reviews} reviews</span>
                        <span className="capitalize">{template.industry}</span>
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
          ) : (
            <div className="space-y-4">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="hover:shadow-md transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg flex items-center justify-center">
                          {getCategoryIcon(template.category)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{template.name}</h3>
                            {template.isPremium && (
                              <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
                                PRO
                              </span>
                            )}
                            <div className="flex items-center gap-1 text-sm">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              {template.rating}
                              <span className="text-muted-foreground">({template.reviews})</span>
                            </div>
                          </div>
                          <p className="text-muted-foreground text-sm mb-2">{template.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                            <span className="capitalize">{template.category}</span>
                            <span className="capitalize">{template.type}</span>
                            <span className="capitalize">{template.industry}</span>
                            <span>{template.uses.toLocaleString()} uses</span>
                            <span>By {template.author}</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {template.tags.slice(0, 4).map((tag, index) => (
                              <span key={index} className="px-2 py-1 bg-muted rounded text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => toggleBookmark(template.id)}
                          className={`p-2 rounded-full transition-all ${
                            template.isBookmarked 
                              ? "bg-red-100 text-red-600" 
                              : "hover:bg-muted"
                          }`}
                        >
                          <Heart className={`h-4 w-4 ${template.isBookmarked ? "fill-current" : ""}'} />
                        </button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                        <Button size="sm">
                          <Copy className="h-4 w-4 mr-2" />
                          Use Template
                        </Button>
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    {template.metrics && (
                      <div className="grid gap-4 md:grid-cols-4 pt-4 border-t">
                        <div>
                          <p className="text-sm text-muted-foreground">Performance</p>
                          <span className={'px-2 py-1 rounded-full text-xs font-medium capitalize ${getPerformanceColor(template.metrics.performance)}'}>
                            {template.metrics.performance}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Open Rate</p>
                          <p className="font-medium">{template.metrics.avgOpenRate}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Click Rate</p>
                          <p className="font-medium">{template.metrics.avgClickRate}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Conversion Rate</p>
                          <p className="font-medium">{template.metrics.avgConversionRate}%</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {filteredTemplates.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Templates Found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {activeTab === "favorites" 
                    ? "You haven't bookmarked any templates yet."
                    : activeTab === "my-templates"
                      ? "You haven't created any templates yet."
                      : "No templates match your current filters."
                  }
                </p>
                <div className="flex gap-2">
                  {activeTab !== "browse" && (
                    <Button variant="outline" onClick={() => setActiveTab("browse")}>
                      Browse Templates
                    </Button>
                  )}
                  <Button onClick={() => setActiveTab("create")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Create Template Tab */}
      {activeTab === "create" && (
        <>
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Create Campaign Template</h3>
            <p className="text-muted-foreground mb-6">
              Build reusable templates from your best-performing campaigns.
            </p>
          </div>

          {/* Template Creation Options */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Email Template",
                description: "Create email campaign templates with drag-and-drop builder",
                icon: Mail,
                color: "bg-blue-100 text-blue-700",
                features: ["Visual editor", "Responsive design", "A/B test ready"]
              },
              {
                title: "Landing Page Template",
                description: "Build high-converting landing page templates",
                icon: Monitor,
                color: "bg-green-100 text-green-700",
                features: ["Mobile responsive", "Conversion optimized", "Fast loading"]
              },
              {
                title: "Social Media Template",
                description: "Create social media post and campaign templates",
                icon: MessageSquare,
                color: "bg-purple-100 text-purple-700",
                features: ["Multi-platform", "Brand guidelines", "Engagement focused"]
              },
              {
                title: "Automation Workflow",
                description: "Build automated marketing workflow templates",
                icon: Zap,
                color: "bg-yellow-100 text-yellow-700",
                features: ["Trigger-based", "Multi-channel", "Personalization"]
              },
              {
                title: "Ad Campaign Template",
                description: "Create paid advertising campaign templates",
                icon: Megaphone,
                color: "bg-orange-100 text-orange-700",
                features: ["Platform optimized", "Audience targeting", "ROI tracking"]
              },
              {
                title: "Content Strategy",
                description: "Build content marketing strategy templates",
                icon: FileText,
                color: "bg-indigo-100 text-indigo-700",
                features: ["Content calendar", "SEO optimized", "Multi-format"]
              }
            ].map((option, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className={'w-12 h-12 rounded-lg ${option.color} flex items-center justify-center mb-4'}>
                    <option.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-2">{option.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{option.description}</p>
                  <div className="space-y-2 mb-4">
                    {option.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Import from Campaign */}
          <Card>
            <CardHeader>
              <CardTitle>Import from Existing Campaign</CardTitle>
              <CardDescription>
                Turn your successful campaigns into reusable templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <select className="flex-1 px-3 py-2 border rounded-md bg-background">
                  <option value="">Select a campaign to convert...</option>
                  <option value="1">Q1 Product Launch Campaign</option>
                  <option value="2">Welcome Email Series</option>
                  <option value="3">Black Friday Promotion</option>
                  <option value="4">Lead Nurturing Sequence</option>
                </select>
                <Button>
                  <Copy className="h-4 w-4 mr-2" />
                  Import Campaign
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}