"use client";

import { useState } from "react";
;
import { 
  Target,
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
  Users,
  Activity,
  TrendingUp,
  BarChart3,
  Brain,
  Zap,
  User,
  Globe,
  Mail,
  MessageSquare,
  ShoppingBag,
  Calendar,
  Sparkles,
  MousePointer,
  Heart,
  Star,
  Award,
  Database,
  Code,
  Layers,
  GitBranch,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';


interface PersonalizationRule {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive" | "draft" | "error";
  type: "content" | "email" | "product" | "experience" | "journey";
  audience: string;
  trigger: string;
  action: string;
  priority: number;
  createdAt: string;
  lastTriggered?: string;
  impressions: number;
  conversions: number;
  conversionRate: number;
  aiConfidence: number;
  testResults?: {
    variant: string;
    performance: number;
    significance: number;
  }[];
}

interface PersonalizationSegment {
  id: string;
  name: string;
  description: string;
  criteria: string[];
  size: number;
  growth: number;
  status: "active" | "inactive";
  createdAt: string;
  lastUpdated: string;
  engagement: {
    emailOpenRate: number;
    clickRate: number;
    conversionRate: number;
    avgOrderValue: number;
  };
  demographics: {
    ageRange: string;
    location: string[];
    interests: string[];
    behavior: string[];
  };
}

interface AIModel {
  id: string;
  name: string;
  type: "recommendation" | "prediction" | "classification" | "clustering";
  status: "training" | "active" | "inactive" | "error";
  accuracy: number;
  lastTrained: string;
  trainingData: number;
  predictions: number;
  confidence: number;
  features: string[];
  performance: {
    precision: number;
    recall: number;
    f1Score: number;
  };
}

const mockRules: PersonalizationRule[] = [
  {
    id: "1",
    name: "High-Value Customer Content",
    description: "Show premium content and offers to customers with high lifetime value",
    status: "active",
    type: "content",
    audience: "High LTV Customers",
    trigger: "Page Visit",
    action: "Show Premium Content",
    priority: 1,
    createdAt: "2024-01-15T00:00:00Z",
    lastTriggered: "2024-01-23T10:30:00Z",
    impressions: 15420,
    conversions: 892,
    conversionRate: 5.78,
    aiConfidence: 94,
    testResults: [
      { variant: "Premium Banner", performance: 6.2, significance: 95 },
      { variant: "Standard Banner", performance: 4.1, significance: 92 }
    ]
  },
  {
    id: "2",
    name: "Cart Abandonment Recovery",
    description: "Personalized email sequence for users who abandoned their cart",
    status: "active",
    type: "email",
    audience: "Cart Abandoners",
    trigger: "Cart Abandonment",
    action: "Send Recovery Email",
    priority: 2,
    createdAt: "2024-01-10T00:00:00Z",
    lastTriggered: "2024-01-23T11:15:00Z",
    impressions: 3240,
    conversions: 486,
    conversionRate: 15.0,
    aiConfidence: 89
  },
  {
    id: "3",
    name: "Product Recommendation Engine",
    description: "AI-powered product recommendations based on browsing behavior",
    status: "active",
    type: "product",
    audience: "All Visitors",
    trigger: "Product View",
    action: "Show Recommendations",
    priority: 3,
    createdAt: "2024-01-05T00:00:00Z",
    lastTriggered: "2024-01-23T11:45:00Z",
    impressions: 45680,
    conversions: 2284,
    conversionRate: 5.0,
    aiConfidence: 87
  },
  {
    id: "4",
    name: "New Visitor Onboarding",
    description: "Guided experience for first-time visitors to increase engagement",
    status: "draft",
    type: "experience",
    audience: "New Visitors",
    trigger: "First Visit",
    action: "Show Onboarding Flow",
    priority: 4,
    createdAt: "2024-01-20T00:00:00Z",
    impressions: 0,
    conversions: 0,
    conversionRate: 0,
    aiConfidence: 0
  },
  {
    id: "5",
    name: "Re-engagement Campaign",
    description: "Personalized journey to re-engage dormant customers",
    status: "inactive",
    type: "journey",
    audience: "Inactive Customers",
    trigger: "30 Days Inactive",
    action: "Start Re-engagement Journey",
    priority: 5,
    createdAt: "2024-01-01T00:00:00Z",
    lastTriggered: "2024-01-20T08:30:00Z",
    impressions: 1240,
    conversions: 186,
    conversionRate: 15.0,
    aiConfidence: 85
  }
];

const mockSegments: PersonalizationSegment[] = [
  {
    id: "1",
    name: "High-Value Customers",
    description: "Customers with high lifetime value and frequent purchases",
    criteria: ["LTV > $1000", "Purchases > 5", "Last Purchase < 30 days"],
    size: 2350,
    growth: 12.5,
    status: "active",
    createdAt: "2024-01-01T00:00:00Z",
    lastUpdated: "2024-01-23T00:00:00Z",
    engagement: {
      emailOpenRate: 45.2,
      clickRate: 12.8,
      conversionRate: 8.5,
      avgOrderValue: 245.50
    },
    demographics: {
      ageRange: "35-55",
      location: ["California", "New York", "Texas"],
      interests: ["Premium Products", "Technology", "Lifestyle"],
      behavior: ["Frequent Buyer", "Email Subscriber", "Mobile User"]
    }
  },
  {
    id: "2",
    name: "Cart Abandoners",
    description: "Users who added items to cart but didn't complete purchase",
    criteria: ["Added to Cart", "No Purchase in 24h", "Email Available"],
    size: 5680,
    growth: -3.2,
    status: "active",
    createdAt: "2024-01-05T00:00:00Z",
    lastUpdated: "2024-01-23T00:00:00Z",
    engagement: {
      emailOpenRate: 32.1,
      clickRate: 8.4,
      conversionRate: 15.2,
      avgOrderValue: 89.25
    },
    demographics: {
      ageRange: "25-45",
      location: ["California", "Florida", "Illinois"],
      interests: ["Shopping", "Deals", "Fashion"],
      behavior: ["Price Conscious", "Comparison Shopper", "Mobile User"]
    }
  },
  {
    id: "3",
    name: "New Subscribers",
    description: "Recently subscribed users in their first 30 days",
    criteria: ["Subscribed < 30 days", "Email Confirmed", "No Purchase Yet"],
    size: 1240,
    growth: 25.8,
    status: "active",
    createdAt: "2024-01-15T00:00:00Z",
    lastUpdated: "2024-01-23T00:00:00Z",
    engagement: {
      emailOpenRate: 58.7,
      clickRate: 18.3,
      conversionRate: 12.1,
      avgOrderValue: 67.50
    },
    demographics: {
      ageRange: "25-35",
      location: ["New York", "California", "Washington"],
      interests: ["New Products", "Trends", "Deals"],
      behavior: ["Engaged", "Social Media Active", "Content Consumer"]
    }
  },
  {
    id: "4",
    name: "VIP Members",
    description: "Premium tier customers with exclusive benefits",
    criteria: ["VIP Status", "Annual Spend > $5000", "Member > 1 year"],
    size: 450,
    growth: 8.9,
    status: "active",
    createdAt: "2023-12-01T00:00:00Z",
    lastUpdated: "2024-01-23T00:00:00Z",
    engagement: {
      emailOpenRate: 62.4,
      clickRate: 24.1,
      conversionRate: 18.7,
      avgOrderValue: 425.75
    },
    demographics: {
      ageRange: "45-65",
      location: ["California", "New York", "Massachusetts"],
      interests: ["Luxury", "Premium Services", "Exclusivity"],
      behavior: ["Brand Loyal", "High Engagement", "Referral Source"]
    }
  }
];

const mockAIModels: AIModel[] = [
  {
    id: "1",
    name: "Customer Lifetime Value Predictor",
    type: "prediction",
    status: "active",
    accuracy: 94.2,
    lastTrained: "2024-01-20T00:00:00Z",
    trainingData: 125000,
    predictions: 45670,
    confidence: 92,
    features: ["Purchase History", "Engagement Metrics", "Demographics", "Behavior Patterns"],
    performance: {
      precision: 93.5,
      recall: 91.8,
      f1Score: 92.6
    }
  },
  {
    id: "2",
    name: "Product Recommendation Engine",
    type: "recommendation",
    status: "active",
    accuracy: 87.8,
    lastTrained: "2024-01-22T00:00:00Z",
    trainingData: 89000,
    predictions: 234560,
    confidence: 89,
    features: ["Product Views", "Purchase History", "Similar Users", "Category Preferences"],
    performance: {
      precision: 88.2,
      recall: 85.4,
      f1Score: 86.8
    }
  },
  {
    id: "3",
    name: "Churn Risk Classifier",
    type: "classification",
    status: "active",
    accuracy: 91.5,
    lastTrained: "2024-01-18T00:00:00Z",
    trainingData: 67000,
    predictions: 12450,
    confidence: 88,
    features: ["Engagement Decline", "Support Tickets", "Usage Patterns", "Payment History"],
    performance: {
      precision: 90.8,
      recall: 92.1,
      f1Score: 91.4
    }
  },
  {
    id: "4",
    name: "Customer Segmentation Clusterer",
    type: "clustering",
    status: "training",
    accuracy: 0,
    lastTrained: "2024-01-23T00:00:00Z",
    trainingData: 156000,
    predictions: 0,
    confidence: 0,
    features: ["Demographics", "Behavior", "Preferences", "Transaction History"],
    performance: {
      precision: 0,
      recall: 0,
      f1Score: 0
    }
  }
];

export default function PersonalizationPage() {
  const [rules, setRules] = useState<PersonalizationRule[]>(mockRules);
  const [segments, setSegments] = useState<PersonalizationSegment[]>(mockSegments);
  const [aiModels, setAIModels] = useState<AIModel[]>(mockAIModels);
  const [activeTab, setActiveTab] = useState<"engine" | "segments" | "rules" | "models">("engine");
  const [searchQuery, setSearchQuery] = useState("");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "inactive": return <XCircle className="h-4 w-4 text-gray-600" />;
      case "draft": return <Clock className="h-4 w-4 text-yellow-600" />;
      case "error": return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "training": return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      default: return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "content": return <MessageSquare className="h-4 w-4" />;
      case "email": return <Mail className="h-4 w-4" />;
      case "product": return <ShoppingBag className="h-4 w-4" />;
      case "experience": return <User className="h-4 w-4" />;
      case "journey": return <GitBranch className="h-4 w-4" />;
      case "recommendation": return <Target className="h-4 w-4" />;
      case "prediction": return <TrendingUp className="h-4 w-4" />;
      case "classification": return <Layers className="h-4 w-4" />;
      case "clustering": return <Users className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Personalization Engine</h1>
          <p className="text-muted-foreground">
            AI-powered personalization to deliver targeted experiences for every customer.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Brain className="h-4 w-4 mr-2" />
            AI Insights
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Rule
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b">
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === "engine" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("engine")}
        >
          Overview
        </button>
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === "rules" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("rules")}
        >
          Rules
        </button>
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === "segments" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("segments")}
        >
          Segments
        </button>
        <button
          className={'px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === "models" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }'}
          onClick={() => setActiveTab("models")}
        >
          AI Models
        </button>
      </div>

      {/* Engine Overview Tab */}
      {activeTab === "engine" && (
        <>
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {rules.filter(r => r.status === "active").length}
                </div>
                <p className="text-xs text-green-600">
                  {rules.filter(r => r.status === "active").length} of {rules.length} rules active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Conversion Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(rules.reduce((sum, r) => sum + r.conversionRate, 0) / rules.length).toFixed(1)}%
                </div>
                <p className="text-xs text-green-600">
                  +2.3% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Segments</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{segments.length}</div>
                <p className="text-xs text-muted-foreground">
                  {segments.reduce((sum, s) => sum + s.size, 0).toLocaleString()} total users
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AI Confidence</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(rules.reduce((sum, r) => sum + r.aiConfidence, 0) / rules.filter(r => r.aiConfidence > 0).length).toFixed(0)}%
                </div>
                <p className="text-xs text-green-600">
                  High confidence level
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Overview */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Rules</CardTitle>
                <CardDescription>Rules with highest conversion rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rules
                    .filter(r => r.status === "active" && r.conversionRate > 0)
                    .sort((a, b) => b.conversionRate - a.conversionRate)
                    .slice(0, 3)
                    .map((rule) => (
                      <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getTypeIcon(rule.type)}
                          <div>
                            <p className="font-medium">{rule.name}</p>
                            <p className="text-sm text-muted-foreground">{rule.audience}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">{rule.conversionRate}%</p>
                          <p className="text-xs text-muted-foreground">{rule.conversions} conversions</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Segment Growth</CardTitle>
                <CardDescription>Fastest growing customer segments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {segments
                    .sort((a, b) => b.growth - a.growth)
                    .slice(0, 3)
                    .map((segment) => (
                      <div key={segment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{segment.name}</p>
                          <p className="text-sm text-muted-foreground">{segment.size.toLocaleString()} users</p>
                        </div>
                        <div className="text-right">
                          <p className={'font-semibold ${segment.growth > 0 ? 'text-green-600' : 'text-red-600'}'}>
                            {segment.growth > 0 ? '+' : `}{segment.growth}%
                          </p>
                          <p className="text-xs text-muted-foreground">30-day growth</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Model Status */}
          <Card>
            <CardHeader>
              <CardTitle>AI Model Performance</CardTitle>
              <CardDescription>Current status of AI models powering personalization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {aiModels.map((model) => (
                  <div key={model.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(model.type)}
                        <div>
                          <h4 className="font-medium">{model.name}</h4>
                          <p className="text-sm text-muted-foreground capitalize">{model.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(model.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                          model.status === "active" 
                            ? "bg-green-100 text-green-700"
                            : model.status === "training"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                        }`}>
                          {model.status}
                        </span>
                      </div>
                    </div>
                    {model.status === "active" && (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Accuracy</p>
                          <p className="font-medium">{model.accuracy}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Predictions</p>
                          <p className="font-medium">{model.predictions.toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Rules Tab */}
      {activeTab === "rules" && (
        <>
          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search rules..."
                className="w-full pl-10 pr-4 py-2 border rounded-md bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select className="px-3 py-2 border rounded-md bg-background">
              <option value="all">All Types</option>
              <option value="content">Content</option>
              <option value="email">Email</option>
              <option value="product">Product</option>
              <option value="experience">Experience</option>
              <option value="journey">Journey</option>
            </select>
            <select className="px-3 py-2 border rounded-md bg-background">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
              <option value="error">Error</option>
            </select>
          </div>

          {/* Rules List */}
          <div className="space-y-4">
            {rules.map((rule) => (
              <Card key={rule.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        {getTypeIcon(rule.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{rule.name}</h3>
                          {getStatusIcon(rule.status)}
                          <span className={'px-2 py-1 rounded-full text-xs font-medium capitalize ${
                            rule.status === "active" 
                              ? "bg-green-100 text-green-700"
                              : rule.status === "error"
                                ? "bg-red-100 text-red-700"
                                : rule.status === "draft"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-gray-100 text-gray-700"
                          }'}>
                            {rule.status}
                          </span>
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded capitalize">
                            Priority {rule.priority}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-sm mt-1">{rule.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="capitalize">{rule.type} Rule</span>
                          <span>Audience: {rule.audience}</span>
                          <span>Trigger: {rule.trigger}</span>
                          {rule.aiConfidence > 0 && (
                            <span>AI Confidence: {rule.aiConfidence}%</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {rule.status === "active" && (
                        <Button size="sm" variant="outline">
                          <Pause className="h-4 w-4 mr-2" />
                          Pause
                        </Button>
                      )}
                      {(rule.status === "inactive" || rule.status === "draft") && (
                        <Button size="sm">
                          <Play className="h-4 w-4 mr-2" />
                          Activate
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  {rule.status === "active" && rule.impressions > 0 && (
                    <div className="grid gap-4 md:grid-cols-4 mb-4">
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Impressions</p>
                        <p className="text-lg font-semibold">{rule.impressions.toLocaleString()}</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Conversions</p>
                        <p className="text-lg font-semibold">{rule.conversions.toLocaleString()}</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Conversion Rate</p>
                        <p className="text-lg font-semibold text-green-600">{rule.conversionRate}%</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Last Triggered</p>
                        <p className="text-sm font-medium">
                          {rule.lastTriggered ? new Date(rule.lastTriggered).toLocaleDateString() : "Never"}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* A/B Test Results */}
                  {rule.testResults && rule.testResults.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">A/B Test Results</h4>
                      <div className="space-y-2">
                        {rule.testResults.map((result, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                            <span className="text-sm">{result.variant}</span>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="font-medium">{result.performance}% conversion</span>
                              <span className="text-muted-foreground">{result.significance}% significance</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Rule Configuration */}
                  <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                    <h4 className="font-medium mb-2">Configuration</h4>
                    <div className="grid gap-2 md:grid-cols-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">When:</span> {rule.trigger}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Who:</span> {rule.audience}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Then:</span> {rule.action}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Segments Tab */}
      {activeTab === "segments" && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              Manage customer segments for targeted personalization.
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Segment
            </Button>
          </div>

          <div className="space-y-4">
            {segments.map((segment) => (
              <Card key={segment.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{segment.name}</h3>
                        {getStatusIcon(segment.status)}
                        <span className={'px-2 py-1 rounded-full text-xs font-medium ${
                          segment.growth > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }'}>
                          {segment.growth > 0 ? '+' : '}{segment.growth}% growth
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm mt-1">{segment.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>{segment.size.toLocaleString()} users</span>
                        <span>Updated: {new Date(segment.lastUpdated).toLocaleDateString()}</span>
                        <span>Age: {segment.demographics.ageRange}</span>
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
                    </div>
                  </div>

                  {/* Segment Details */}
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Criteria */}
                    <div>
                      <h4 className="font-medium mb-2">Criteria</h4>
                      <div className="space-y-1">
                        {segment.criteria.map((criterion, index) => (
                          <div key={index} className="text-sm bg-muted px-2 py-1 rounded">
                            {criterion}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Engagement Metrics */}
                    <div>
                      <h4 className="font-medium mb-2">Engagement</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Email Open Rate</p>
                          <p className="font-medium">{segment.engagement.emailOpenRate}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Click Rate</p>
                          <p className="font-medium">{segment.engagement.clickRate}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Conversion Rate</p>
                          <p className="font-medium">{segment.engagement.conversionRate}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Avg Order Value</p>
                          <p className="font-medium">${segment.engagement.avgOrderValue}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Demographics */}
                  <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                    <h4 className="font-medium mb-2">Demographics & Behavior</h4>
                    <div className="grid gap-4 md:grid-cols-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Top Locations</p>
                        <div className="flex flex-wrap gap-1">
                          {segment.demographics.location.slice(0, 3).map((loc, index) => (
                            <span key={index} className="px-1 py-0.5 bg-muted rounded text-xs">{loc}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Interests</p>
                        <div className="flex flex-wrap gap-1">
                          {segment.demographics.interests.slice(0, 3).map((interest, index) => (
                            <span key={index} className="px-1 py-0.5 bg-muted rounded text-xs">{interest}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Behavior</p>
                        <div className="flex flex-wrap gap-1">
                          {segment.demographics.behavior.slice(0, 3).map((behavior, index) => (
                            <span key={index} className="px-1 py-0.5 bg-muted rounded text-xs">{behavior}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Age Range</p>
                        <span className="px-1 py-0.5 bg-muted rounded text-xs">{segment.demographics.ageRange}</span>
                      </div>
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
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              AI models powering intelligent personalization and predictions.
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Train New Model
            </Button>
          </div>

          <div className="space-y-4">
            {aiModels.map((model) => (
              <Card key={model.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        {getTypeIcon(model.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{model.name}</h3>
                          {getStatusIcon(model.status)}
                          <span className={'px-2 py-1 rounded-full text-xs font-medium capitalize ${
                            model.status === "active" 
                              ? "bg-green-100 text-green-700"
                              : model.status === "training"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-700"
                          }'}>
                            {model.status}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-sm mt-1 capitalize">{model.type} Model</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Training Data: {model.trainingData.toLocaleString()}</span>
                          <span>Last Trained: {new Date(model.lastTrained).toLocaleDateString()}</span>
                          {model.status === "active" && (
                            <span>Predictions: {model.predictions.toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {model.status === "active" && (
                        <Button size="sm" variant="outline">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Retrain
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                    </div>
                  </div>

                  {/* Model Performance */}
                  {model.status === "active" && (
                    <div className="grid gap-4 md:grid-cols-4 mb-4">
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Accuracy</p>
                        <p className="text-lg font-semibold text-green-600">{model.accuracy}%</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Precision</p>
                        <p className="text-lg font-semibold">{model.performance.precision}%</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Recall</p>
                        <p className="text-lg font-semibold">{model.performance.recall}%</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">F1 Score</p>
                        <p className="text-lg font-semibold">{model.performance.f1Score}%</p>
                      </div>
                    </div>
                  )}

                  {/* Features */}
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Input Features</h4>
                    <div className="flex flex-wrap gap-2">
                      {model.features.map((feature, index) => (
                        <span key={index} className="px-2 py-1 bg-muted rounded text-sm">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Training Status */}
                  {model.status === "training" && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-800">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span className="font-medium">Training in Progress</span>
                      </div>
                      <p className="text-sm text-blue-700 mt-1">
                        Model is currently training on {model.trainingData.toLocaleString()} data points. Estimated completion: 2 hours.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}