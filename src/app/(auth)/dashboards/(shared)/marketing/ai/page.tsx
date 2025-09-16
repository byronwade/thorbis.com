"use client";

import { useState } from "react";
;
import { 
  Brain,
  Wand2,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit3,
  Copy,
  Trash2,
  MoreHorizontal,
  FileText,
  Mail,
  MessageSquare,
  Globe,
  Image,
  Video,
  Target,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Zap,
  RefreshCw,
  Settings,
  Star,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  PenTool,
  Hash,
  Type,
  Layout,
  Palette,
  BarChart3,
  Users,
  Calendar,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';


interface AIContent {
  id: string;
  title: string;
  type: "email" | "social" | "blog" | "ad" | "landing" | "seo" | "subject";
  content: string;
  platform?: string;
  status: "generated" | "reviewed" | "approved" | "published" | "archived";
  createdAt: string;
  updatedAt: string;
  prompt: string;
  model: string;
  tokens: number;
  rating?: number;
  feedback?: string;
  variant?: number;
  campaign?: string;
  tags: string[];
}

interface AITemplate {
  id: string;
  name: string;
  description: string;
  category: "email" | "social" | "blog" | "ads" | "landing" | "seo";
  prompt: string;
  variables: string[];
  usageCount: number;
  rating: number;
  isCustom: boolean;
  createdBy?: string;
  createdAt: string;
}

interface AIModel {
  id: string;
  name: string;
  provider: "openai" | "anthropic" | "google" | "custom";
  type: "text" | "image" | "video";
  capabilities: string[];
  tokensPerMinute: number;
  cost: number;
  status: "active" | "inactive" | "limited";
  lastUsed?: string;
}

const mockContent: AIContent[] = [
  {
    id: "1",
    title: "Summer Sale Email Campaign",
    type: "email",
    content: "🌞 Summer Sale Alert! Get ready to heat up your savings with our biggest sale of the season. For a limited time, enjoy 40% off our entire collection. From trendy swimwear to comfortable loungewear, we've got everything you need to make this summer unforgettable. Don't let this opportunity slip away - shop now and save big!",
    status: "approved",
    createdAt: "2024-01-23T10:30:00Z",
    updatedAt: "2024-01-23T11:15:00Z",
    prompt: "Create an engaging summer sale email with 40% discount, casual tone, include urgency",
    model: "GPT-4",
    tokens: 127,
    rating: 4,
    variant: 1,
    campaign: "Summer 2024 Sale",
    tags: ["sale", "summer", "email", "discount"]
  },
  {
    id: "2", 
    title: "LinkedIn Thought Leadership Post",
    type: "social",
    content: "The future of marketing isn't just about reaching customers—it's about understanding them. AI-powered personalization is transforming how brands connect with their audience, creating experiences that feel genuinely tailored. What strategies are you using to make your marketing more personal? #MarketingTech #AI #Personalization",
    platform: "linkedin",
    status: "published",
    createdAt: "2024-01-23T09:15:00Z",
    updatedAt: "2024-01-23T09:45:00Z",
    prompt: "Write a LinkedIn thought leadership post about AI in marketing personalization",
    model: "Claude-3",
    tokens: 89,
    rating: 5,
    campaign: "Thought Leadership Q1",
    tags: ["linkedin", "thought leadership", "AI", "marketing"]
  },
  {
    id: "3",
    title: "Product Launch Blog Introduction",
    type: "blog",
    content: "Introducing the Future of Business Management: After months of development and countless hours of user research, we're thrilled to unveil our most ambitious project yet. This isn't just another software update—it's a complete reimagining of how modern businesses operate. Built with cutting-edge AI and designed for scalability, our new platform represents everything we've learned about what businesses truly need to thrive in today's competitive landscape.",
    status: "reviewed",
    createdAt: "2024-01-22T14:20:00Z",
    updatedAt: "2024-01-23T08:30:00Z",
    prompt: "Write an engaging blog post introduction for a major product launch, professional tone",
    model: "GPT-4",
    tokens: 156,
    rating: 4,
    feedback: "Great intro, maybe add more specific benefits",
    campaign: "Product Launch Blog Series",
    tags: ["blog", "product launch", "introduction", "business"]
  },
  {
    id: "4",
    title: "Google Ads Headline Set",
    type: "ad",
    content: "Transform Your Business Operations Today | Streamline Workflows, Boost Productivity | Get Started Free",
    platform: "google",
    status: "generated",
    createdAt: "2024-01-23T12:00:00Z",
    updatedAt: "2024-01-23T12:00:00Z",
    prompt: "Create Google Ads headlines for business management software, include call-to-action",
    model: "GPT-3.5",
    tokens: 34,
    variant: 3,
    tags: ["google ads", "headlines", "business", "CTA"]
  }
];

const mockTemplates: AITemplate[] = [
  {
    id: "1",
    name: "Product Launch Email",
    description: "Announcement email template for new product launches",
    category: "email",
    prompt: "Write a product launch email for {{product_name}} targeting {{audience}}. Highlight key features: {{features}}. Use a {{tone}} tone and include a clear call-to-action.",
    variables: ["product_name", "audience", "features", "tone"],
    usageCount: 45,
    rating: 4.8,
    isCustom: false,
    createdAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "2",
    name: "Social Media Engagement Post",
    description: "Interactive social media post to boost engagement",
    category: "social",
    prompt: "Create an engaging {{platform}} post about {{topic}}. Ask a thought-provoking question to encourage comments. Use relevant hashtags and maintain a {{tone}} tone.",
    variables: ["platform", "topic", "tone"],
    usageCount: 123,
    rating: 4.6,
    isCustom: false,
    createdAt: "2024-01-05T00:00:00Z"
  },
  {
    id: "3",
    name: "SEO Blog Post Outline",
    description: "SEO-optimized blog post structure with headings",
    category: "blog",
    prompt: "Create a blog post outline for '{{title}}' targeting the keyword '{{keyword}}'. Include H2 and H3 headings, target {{word_count}} words, and focus on {{audience}}.",
    variables: ["title", "keyword", "word_count", "audience"],
    usageCount: 78,
    rating: 4.9,
    isCustom: false,
    createdAt: "2024-01-10T00:00:00Z"
  },
  {
    id: "4",
    name: "Custom Sales Funnel Copy",
    description: "Personalized sales funnel copy for my SaaS product",
    category: "landing",
    prompt: "Write landing page copy for {{product_name}} SaaS targeting {{target_market}}. Focus on pain points: {{pain_points}}. Include social proof and strong CTA.",
    variables: ["product_name", "target_market", "pain_points"],
    usageCount: 12,
    rating: 5.0,
    isCustom: true,
    createdBy: "Sarah Wilson",
    createdAt: "2024-01-20T00:00:00Z"
  }
];

const mockModels: AIModel[] = [
  {
    id: "1",
    name: "GPT-4",
    provider: "openai",
    type: "text",
    capabilities: ["content generation", "editing", "translation", "analysis"],
    tokensPerMinute: 10000,
    cost: 0.03,
    status: "active",
    lastUsed: "2024-01-23T12:00:00Z"
  },
  {
    id: "2",
    name: "Claude-3 Sonnet",
    provider: "anthropic",
    type: "text", 
    capabilities: ["content generation", "analysis", "reasoning", "code"],
    tokensPerMinute: 8000,
    cost: 0.025,
    status: "active",
    lastUsed: "2024-01-23T09:15:00Z"
  },
  {
    id: "3",
    name: "DALL-E 3",
    provider: "openai",
    type: "image",
    capabilities: ["image generation", "concept art", "logos", "social media"],
    tokensPerMinute: 50,
    cost: 0.04,
    status: "active",
    lastUsed: "2024-01-22T16:30:00Z"
  },
  {
    id: "4",
    name: "Gemini Pro",
    provider: "google",
    type: "text",
    capabilities: ["content generation", "multimodal", "analysis"],
    tokensPerMinute: 12000,
    cost: 0.02,
    status: "limited"
  }
];

export default function AIPage() {
  const [content, setContent] = useState<AIContent[]>(mockContent);
  const [templates, setTemplates] = useState<AITemplate[]>(mockTemplates);
  const [models, setModels] = useState<AIModel[]>(mockModels);
  const [activeTab, setActiveTab] = useState<"generate" | "content" | "templates" | "models" | "analytics">("generate");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModel, setSelectedModel] = useState("GPT-4");
  const [generationPrompt, setGenerationPrompt] = useState("");
  const [contentType, setContentType] = useState<"email" | "social" | "blog" | "ad" | "landing" | "seo">("email");
  const [isGenerating, setIsGenerating] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "generated": return <Clock className="h-4 w-4 text-blue-600" />;
      case "reviewed": return <Eye className="h-4 w-4 text-yellow-600" />;
      case "approved": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "published": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "archived": return <AlertTriangle className="h-4 w-4 text-gray-600" />;
      default: return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "email": return <Mail className="h-4 w-4" />;
      case "social": return <MessageSquare className="h-4 w-4" />;
      case "blog": return <FileText className="h-4 w-4" />;
      case "ad": return <Target className="h-4 w-4" />;
      case "landing": return <Layout className="h-4 w-4" />;
      case "seo": return <Search className="h-4 w-4" />;
      case "subject": return <Type className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case "openai": return "bg-green-100 text-green-700";
      case "anthropic": return "bg-orange-100 text-orange-700";
      case "google": return "bg-blue-100 text-blue-700";
      case "custom": return "bg-purple-100 text-purple-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const filteredContent = content.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleGenerate = async () => {
    if (!generationPrompt.trim()) return;
    
    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      const newContent: AIContent = {
        id: Date.now().toString(),
        title: `Generated ${contentType} content`,
        type: contentType,
        content: "This is AI-generated content based on your prompt. In a real implementation, this would be generated using the selected AI model.",
        status: "generated",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        prompt: generationPrompt,
        model: selectedModel,
        tokens: Math.floor(Math.random() * 200) + 50,
        tags: [contentType, "ai-generated", "new"]
      };
      
      setContent(prev => [newContent, ...prev]);
      setGenerationPrompt("");
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            AI Content Studio
          </h1>
          <p className="text-muted-foreground">
            Generate, manage, and optimize marketing content with AI-powered tools.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            AI Settings
          </Button>
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Usage Stats
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b">
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === "generate" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("generate")}
        >
          <Wand2 className="h-4 w-4 mr-2 inline" />
          Generate
        </button>
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === "content" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("content")}
        >
          <FileText className="h-4 w-4 mr-2 inline" />
          Content Library
        </button>
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === "templates" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("templates")}
        >
          <Layout className="h-4 w-4 mr-2 inline" />
          Templates
        </button>
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === "models" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("models")}
        >
          <Brain className="h-4 w-4 mr-2 inline" />
          AI Models
        </button>
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === "analytics" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("analytics")}
        >
          <TrendingUp className="h-4 w-4 mr-2 inline" />
          Analytics
        </button>
      </div>

      {/* Generate Tab */}
      {activeTab === "generate" && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Content Generation Panel */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  AI Content Generator
                </CardTitle>
                <CardDescription>Create marketing content with AI assistance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Content Type Selection */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Content Type</label>
                  <div className="grid gap-2 md:grid-cols-3">
                    {[
                      { value: "email", label: "Email", icon: Mail },
                      { value: "social", label: "Social Post", icon: MessageSquare },
                      { value: "blog", label: "Blog Post", icon: FileText },
                      { value: "ad", label: "Advertisement", icon: Target },
                      { value: "landing", label: "Landing Page", icon: Layout },
                      { value: "seo", label: "SEO Content", icon: Search }
                    ].map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setContentType(type.value as any)}
                        className={`flex items-center gap-2 p-3 border rounded-lg text-sm hover:bg-muted/50 transition-colors ${
                          contentType === type.value ? "border-primary bg-primary/5" : ""
                        }`}
                      >
                        <type.icon className="h-4 w-4" />
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* AI Model Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">AI Model</label>
                  <select
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                  >
                    {models.filter(m => m.type === "text" && m.status === "active").map(model => (
                      <option key={model.id} value={model.name}>
                        {model.name} - {model.provider} (${model.cost}/1K tokens)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Prompt Input */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Content Prompt</label>
                  <textarea
                    className="w-full px-3 py-2 border rounded-md bg-background min-h-24"
                    placeholder="Describe what you want to create. Be specific about tone, audience, key points, and style."
                    value={generationPrompt}
                    onChange={(e) => setGenerationPrompt(e.target.value)}
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    Tip: Include details about tone, target audience, key benefits, and call-to-action
                  </div>
                </div>

                {/* Generation Settings */}
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tone</label>
                    <select className="w-full px-3 py-2 border rounded-md bg-background">
                      <option value="professional">Professional</option>
                      <option value="casual">Casual</option>
                      <option value="friendly">Friendly</option>
                      <option value="urgent">Urgent</option>
                      <option value="playful">Playful</option>
                      <option value="authoritative">Authoritative</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Length</label>
                    <select className="w-full px-3 py-2 border rounded-md bg-background">
                      <option value="short">Short (50-150 words)</option>
                      <option value="medium">Medium (150-300 words)</option>
                      <option value="long">Long (300-500 words)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Variants</label>
                    <select className="w-full px-3 py-2 border rounded-md bg-background">
                      <option value="1">1 Version</option>
                      <option value="3">3 Versions</option>
                      <option value="5">5 Versions</option>
                    </select>
                  </div>
                </div>

                {/* Generate Button */}
                <Button 
                  onClick={handleGenerate} 
                  disabled={!generationPrompt.trim() || isGenerating}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating Content...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Generate Content
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Recent */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Templates</CardTitle>
                <CardDescription>Popular content templates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {templates.slice(0, 4).map((template) => (
                    <button
                      key={template.id}
                      className="w-full text-left p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      onClick={() => setGenerationPrompt(template.prompt)}
                    >
                      <div className="font-medium text-sm">{template.name}</div>
                      <div className="text-xs text-muted-foreground">{template.description}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        <span className="text-xs">{template.rating}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{template.usageCount} uses</span>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Generations</CardTitle>
                <CardDescription>Your latest AI content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {content.slice(0, 3).map((item) => (
                    <div key={item.id} className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        {getTypeIcon(item.type)}
                        <span className="text-sm font-medium">{item.title}</span>
                        {getStatusIcon(item.status)}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {item.content}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span>{item.model}</span>
                        <span>•</span>
                        <span>{item.tokens} tokens</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Content Library Tab */}
      {activeTab === "content" && (
        <>
          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search content..."
                className="w-full pl-10 pr-4 py-2 border rounded-md bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select className="px-3 py-2 border rounded-md bg-background">
              <option value="all">All Types</option>
              <option value="email">Email</option>
              <option value="social">Social</option>
              <option value="blog">Blog</option>
              <option value="ad">Ads</option>
            </select>
            <select className="px-3 py-2 border rounded-md bg-background">
              <option value="all">All Status</option>
              <option value="generated">Generated</option>
              <option value="reviewed">Reviewed</option>
              <option value="approved">Approved</option>
              <option value="published">Published</option>
            </select>
          </div>

          {/* Content Library */}
          <div className="space-y-4">
            {filteredContent.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        {getTypeIcon(item.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{item.title}</h3>
                          {getStatusIcon(item.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                            item.status === "approved" || item.status === "published"
                              ? "bg-green-100 text-green-700"
                              : item.status === "reviewed"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-blue-100 text-blue-700"
                          }`}>
                            {item.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="capitalize">{item.type}</span>
                          {item.platform && <span>{item.platform}</span>}
                          {item.campaign && <span>{item.campaign}</span>}
                          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-muted rounded text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Content Preview */}
                  <div className="bg-muted/30 rounded-lg p-4 mb-4">
                    <p className="text-sm line-clamp-3">{item.content}</p>
                  </div>

                  {/* Generation Details */}
                  <div className="grid gap-4 md:grid-cols-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Model:</span>
                      <div className="font-medium">{item.model}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Tokens:</span>
                      <div className="font-medium">{item.tokens}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Prompt:</span>
                      <div className="font-medium truncate">{item.prompt}</div>
                    </div>
                  </div>

                  {/* Rating and Feedback */}
                  {item.rating && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Rating:</span>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-3 w-3 ${i < item.rating! ? "text-yellow-500 fill-current" : "text-gray-300"}`} />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <ThumbsUp className="h-4 w-4 mr-2" />
                          Useful
                        </Button>
                        <Button size="sm" variant="outline">
                          <ThumbsDown className="h-4 w-4 mr-2" />
                          Poor
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Templates Tab */}
      {activeTab === "templates" && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              Create and manage reusable AI content templates for consistent results.
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {template.isCustom ? (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">Custom</span>
                      ) : (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Built-in</span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Template Variables</h4>
                      <div className="flex flex-wrap gap-1">
                        {template.variables.map((variable, index) => (
                          <span key={index} className="px-2 py-1 bg-muted rounded text-xs font-mono">
                            {`{{${variable}}}`}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm mb-2">Prompt Preview</h4>
                      <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded line-clamp-3">
                        {template.prompt}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          <span>{template.rating}</span>
                        </div>
                        <span className="text-muted-foreground">{template.usageCount} uses</span>
                        {template.isCustom && template.createdBy && (
                          <span className="text-muted-foreground">by {template.createdBy}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        <Wand2 className="h-4 w-4 mr-2" />
                        Use Template
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        <Copy className="h-4 w-4 mr-2" />
                        Clone
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* AI Models Tab */}
      {activeTab === "models" && (
        <>
          <div className="text-muted-foreground mb-6">
            Manage AI models and their configurations for content generation.
          </div>

          <div className="space-y-4">
            {models.map((model) => (
              <Card key={model.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Brain className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{model.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getProviderColor(model.provider)}`}>
                            {model.provider}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            model.status === "active" 
                              ? "bg-green-100 text-green-700"
                              : model.status === "limited"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-700"
                          }'}>
                            {model.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="capitalize">{model.type} generation</span>
                          <span>${model.cost}/1K tokens</span>
                          <span>{model.tokensPerMinute.toLocaleString()} TPM</span>
                          {model.lastUsed && (
                            <span>Last used: {new Date(model.lastUsed).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                      {model.status === "active" ? (
                        <Button size="sm" variant="outline">
                          <Pause className="h-4 w-4 mr-2" />
                          Pause
                        </Button>
                      ) : (
                        <Button size="sm">
                          <Play className="h-4 w-4 mr-2" />
                          Activate
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="font-medium text-sm mb-2">Capabilities</h4>
                    <div className="flex flex-wrap gap-2">
                      {model.capabilities.map((capability, index) => (
                        <span key={index} className="px-2 py-1 bg-muted rounded text-xs">
                          {capability}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && (
        <div className="grid gap-6">
          {/* Usage Overview */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Content Generated</CardTitle>
                <Wand2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,247</div>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +23% this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tokens Used</CardTitle>
                <Hash className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">145.2K</div>
                <p className="text-xs text-muted-foreground">
                  $4.35 cost this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.2</div>
                <p className="text-xs text-green-600">
                  +0.3 from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Published Content</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">892</div>
                <p className="text-xs text-muted-foreground">
                  71.5% publish rate
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Content Generation Trends</CardTitle>
                <CardDescription>Daily content creation over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  [Chart: Daily content generation trends]
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content Type Distribution</CardTitle>
                <CardDescription>Breakdown by content type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { type: "Email", count: 456, percentage: 36.5, color: "bg-blue-500" },
                    { type: "Social", count: 342, percentage: 27.4, color: "bg-green-500" },
                    { type: "Blog", count: 234, percentage: 18.8, color: "bg-purple-500" },
                    { type: "Ads", count: 156, percentage: 12.5, color: "bg-orange-500" },
                    { type: "Landing", count: 59, percentage: 4.7, color: "bg-pink-500" }
                  ].map((item) => (
                    <div key={item.type} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={'w-3 h-3 rounded-full ${item.color}'} />
                        <span className="text-sm font-medium">{item.type}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{item.count}</div>
                        <div className="text-xs text-muted-foreground">{item.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}