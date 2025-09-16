"use client";

import { useState } from "react";
;
import { 
  TrendingUp,
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
  BarChart3,
  Download,
  Share2,
  Brain,
  Zap,
  Target,
  Users,
  Mail,
  MessageSquare,
  ShoppingBag,
  Calendar,
  Globe,
  Sparkles,
  Award,
  Star,
  ArrowUp,
  ArrowDown,
  Minus,
  TrendingDown,
  PieChart,
  LineChart,
  BarChart,
  ScatterChart,
  Database,
  FileText,
  MousePointer,
  DollarSign,
  Percent,
  Timer,
  Lightbulb,
  AlertCircle,
  Info,
  CheckSquare,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';


interface PredictiveInsight {
  id: string;
  title: string;
  description: string;
  type: "prediction" | "recommendation" | "alert" | "trend" | "anomaly";
  category: "performance" | "audience" | "content" | "conversion" | "revenue" | "engagement";
  priority: "low" | "medium" | "high" | "urgent";
  confidence: number;
  impact: "low" | "medium" | "high";
  timeframe: string;
  status: "new" | "reviewed" | "acting" | "dismissed";
  createdAt: string;
  data: {
    current: number;
    predicted: number;
    change: number;
    metric: string;
    unit: string;
  };
  actions: InsightAction[];
  sources: string[];
  tags: string[];
}

interface InsightAction {
  id: string;
  title: string;
  description: string;
  type: "optimize" | "experiment" | "content" | "audience" | "budget";
  effort: "low" | "medium" | "high";
  expectedImpact: number;
  timeline: string;
  completed?: boolean;
}

interface AnalyticsMetric {
  name: string;
  value: number;
  change: number;
  trend: "up" | "down" | "stable";
  prediction: number;
  confidence: number;
  unit: string;
}

interface ModelPrediction {
  id: string;
  name: string;
  type: "revenue" | "conversion" | "churn" | "ltv" | "engagement";
  accuracy: number;
  lastUpdated: string;
  nextUpdate: string;
  predictions: {
    period: string;
    value: number;
    confidence: number;
  }[];
}

const mockInsights: PredictiveInsight[] = [
  {
    id: "1",
    title: "Email Open Rates Predicted to Drop 15%",
    description: "AI analysis suggests email open rates will decline next month due to seasonal patterns and deliverability issues.",
    type: "prediction",
    category: "engagement",
    priority: "high",
    confidence: 89,
    impact: "high",
    timeframe: "Next 30 days",
    status: "new",
    createdAt: "2024-01-23T10:30:00Z",
    data: {
      current: 24.5,
      predicted: 20.8,
      change: -15.1,
      metric: "Open Rate",
      unit: "%"
    },
    actions: [
      {
        id: "1",
        title: "Optimize Subject Lines",
        description: "A/B test different subject line approaches to improve open rates",
        type: "experiment",
        effort: "medium",
        expectedImpact: 8.5,
        timeline: "1-2 weeks"
      },
      {
        id: "2",
        title: "Review Send Times",
        description: "Analyze and optimize send times based on audience behavior",
        type: "optimize",
        effort: "low",
        expectedImpact: 4.2,
        timeline: "1 week"
      }
    ],
    sources: ["Email Analytics", "Historical Data", "Industry Benchmarks"],
    tags: ["email", "engagement", "optimization"]
  },
  {
    id: "2",
    title: "High-Value Customer Segment Growing",
    description: "Premium customer segment is expanding faster than predicted, presenting upselling opportunities.",
    type: "trend",
    category: "audience",
    priority: "medium",
    confidence: 94,
    impact: "high",
    timeframe: "Next 60 days",
    status: "reviewed",
    createdAt: "2024-01-22T14:15:00Z",
    data: {
      current: 1250,
      predicted: 1580,
      change: 26.4,
      metric: "Premium Customers",
      unit: "users"
    },
    actions: [
      {
        id: "3",
        title: "Create VIP Campaign",
        description: "Develop targeted campaign for premium segment expansion",
        type: "content",
        effort: "high",
        expectedImpact: 15.8,
        timeline: "2-3 weeks"
      }
    ],
    sources: ["Customer Analytics", "Purchase Data", "Behavior Tracking"],
    tags: ["audience", "premium", "growth"]
  },
  {
    id: "3",
    title: "Social Media Engagement Anomaly Detected",
    description: "Unusual spike in social media engagement on posts with user-generated content. Investigate for optimization.",
    type: "anomaly",
    category: "engagement",
    priority: "medium",
    confidence: 76,
    impact: "medium",
    timeframe: "Current",
    status: "acting",
    createdAt: "2024-01-23T08:45:00Z",
    data: {
      current: 4.8,
      predicted: 2.3,
      change: 108.7,
      metric: "Engagement Rate",
      unit: "%"
    },
    actions: [
      {
        id: "4",
        title: "Scale UGC Strategy",
        description: "Increase user-generated content campaigns based on performance spike",
        type: "content",
        effort: "medium",
        expectedImpact: 12.3,
        timeline: "2 weeks",
        completed: true
      }
    ],
    sources: ["Social Analytics", "Content Performance", "Engagement Metrics"],
    tags: ["social", "ugc", "engagement"]
  },
  {
    id: "4",
    title: "Conversion Rate Optimization Opportunity",
    description: "Landing page conversion rates could increase by 23% with recommended changes to checkout flow.",
    type: "recommendation",
    category: "conversion",
    priority: "high",
    confidence: 82,
    impact: "high",
    timeframe: "Implementation dependent",
    status: "new",
    createdAt: "2024-01-21T16:20:00Z",
    data: {
      current: 3.4,
      predicted: 4.2,
      change: 23.5,
      metric: "Conversion Rate",
      unit: "%"
    },
    actions: [
      {
        id: "5",
        title: "Simplify Checkout Flow",
        description: "Remove unnecessary steps in checkout process",
        type: "optimize",
        effort: "medium",
        expectedImpact: 18.7,
        timeline: "1-2 weeks"
      },
      {
        id: "6",
        title: "Add Trust Signals",
        description: "Include security badges and customer testimonials",
        type: "content",
        effort: "low",
        expectedImpact: 7.2,
        timeline: "3-5 days"
      }
    ],
    sources: ["Conversion Analytics", "User Behavior", "A/B Test Results"],
    tags: ["conversion", "checkout", "optimization"]
  },
  {
    id: "5",
    title: "Budget Reallocation Alert",
    description: "Current ad spend allocation is suboptimal. Shifting budget to high-performing channels could improve ROAS by 34%.",
    type: "alert",
    category: "performance",
    priority: "urgent",
    confidence: 91,
    impact: "high",
    timeframe: "Immediate action needed",
    status: "new",
    createdAt: "2024-01-23T11:00:00Z",
    data: {
      current: 2.1,
      predicted: 2.8,
      change: 33.3,
      metric: "ROAS",
      unit: "x"
    },
    actions: [
      {
        id: "7",
        title: "Reallocate Ad Budget",
        description: "Move budget from underperforming to high-performing channels",
        type: "budget",
        effort: "low",
        expectedImpact: 28.5,
        timeline: "Immediate"
      }
    ],
    sources: ["Ad Performance", "Attribution Data", "Channel Analytics"],
    tags: ["budget", "roas", "advertising"]
  }
];

const mockMetrics: AnalyticsMetric[] = [
  {
    name: "Total Revenue",
    value: 156750,
    change: 12.4,
    trend: "up",
    prediction: 175280,
    confidence: 87,
    unit: "$"
  },
  {
    name: "Conversion Rate",
    value: 3.4,
    change: -2.8,
    trend: "down",
    prediction: 4.1,
    confidence: 82,
    unit: "%"
  },
  {
    name: "Customer Acquisition Cost",
    value: 45,
    change: 8.9,
    trend: "up",
    prediction: 38,
    confidence: 79,
    unit: "$"
  },
  {
    name: "Customer Lifetime Value",
    value: 420,
    change: 5.7,
    trend: "up",
    prediction: 485,
    confidence: 91,
    unit: "$"
  },
  {
    name: "Email Open Rate",
    value: 24.5,
    change: -5.2,
    trend: "down",
    prediction: 20.8,
    confidence: 89,
    unit: "%"
  },
  {
    name: "Social Engagement",
    value: 4.8,
    change: 18.7,
    trend: "up",
    prediction: 5.2,
    confidence: 75,
    unit: "%"
  }
];

const mockPredictions: ModelPrediction[] = [
  {
    id: "1",
    name: "Revenue Forecasting Model",
    type: "revenue",
    accuracy: 92.3,
    lastUpdated: "2024-01-23T06:00:00Z",
    nextUpdate: "2024-01-24T06:00:00Z",
    predictions: [
      { period: "This Week", value: 45200, confidence: 94 },
      { period: "Next Week", value: 48100, confidence: 89 },
      { period: "This Month", value: 178500, confidence: 87 },
      { period: "Next Month", value: 195800, confidence: 82 }
    ]
  },
  {
    id: "2",
    name: "Customer Churn Predictor",
    type: "churn",
    accuracy: 88.7,
    lastUpdated: "2024-01-23T06:00:00Z",
    nextUpdate: "2024-01-24T06:00:00Z",
    predictions: [
      { period: "7 Days", value: 2.3, confidence: 91 },
      { period: "14 Days", value: 4.1, confidence: 87 },
      { period: "30 Days", value: 7.8, confidence: 83 },
      { period: "90 Days", value: 15.2, confidence: 76 }
    ]
  },
  {
    id: "3",
    name: "Conversion Rate Optimizer",
    type: "conversion",
    accuracy: 85.1,
    lastUpdated: "2024-01-23T06:00:00Z",
    nextUpdate: "2024-01-24T06:00:00Z",
    predictions: [
      { period: "Current", value: 3.4, confidence: 95 },
      { period: "With Optimization", value: 4.2, confidence: 82 },
      { period: "Best Case", value: 4.8, confidence: 71 },
      { period: "Conservative", value: 3.8, confidence: 89 }
    ]
  }
];

export default function PredictiveInsightsPage() {
  const [insights, setInsights] = useState<PredictiveInsight[]>(mockInsights);
  const [metrics, setMetrics] = useState<AnalyticsMetric[]>(mockMetrics);
  const [predictions, setPredictions] = useState<ModelPrediction[]>(mockPredictions);
  const [activeTab, setActiveTab] = useState<"insights" | "predictions" | "models" | "settings">("insights");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "prediction": return <TrendingUp className="h-4 w-4" />;
      case "recommendation": return <Lightbulb className="h-4 w-4" />;
      case "alert": return <AlertTriangle className="h-4 w-4" />;
      case "trend": return <LineChart className="h-4 w-4" />;
      case "anomaly": return <Zap className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent": return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "high": return <ArrowUp className="h-4 w-4 text-orange-600" />;
      case "medium": return <Minus className="h-4 w-4 text-yellow-600" />;
      case "low": return <ArrowDown className="h-4 w-4 text-green-600" />;
      default: return null;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "new": return <Star className="h-4 w-4 text-blue-600" />;
      case "reviewed": return <Eye className="h-4 w-4 text-purple-600" />;
      case "acting": return <Play className="h-4 w-4 text-green-600" />;
      case "dismissed": return <XCircle className="h-4 w-4 text-gray-600" />;
      default: return null;
    }
  };

  const getTrendIcon = (trend: string, change: number) => {
    if (trend === "up") return <ArrowUp className="h-4 w-4 text-green-600" />;
    if (trend === "down") return <ArrowDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "performance": return <BarChart3 className="h-4 w-4" />;
      case "audience": return <Users className="h-4 w-4" />;
      case "content": return <FileText className="h-4 w-4" />;
      case "conversion": return <Target className="h-4 w-4" />;
      case "revenue": return <DollarSign className="h-4 w-4" />;
      case "engagement": return <MessageSquare className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high": return "text-red-600 bg-red-100";
      case "medium": return "text-yellow-600 bg-yellow-100";
      case "low": return "text-green-600 bg-green-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const filteredInsights = insights.filter(insight => {
    const matchesSearch = insight.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         insight.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         insight.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || insight.category === selectedCategory;
    const matchesPriority = selectedPriority === "all" || insight.priority === selectedPriority;
    
    return matchesSearch && matchesCategory && matchesPriority;
  });

  const updateInsightStatus = (insightId: string, status: string) => {
    setInsights(prev => prev.map(insight =>
      insight.id === insightId 
        ? { ...insight, status: status as any }
        : insight
    ));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Predictive Analytics & Insights</h1>
          <p className="text-muted-foreground">
            AI-powered insights and predictions to optimize your marketing performance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Models
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b">
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === "insights" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("insights")}
        >
          AI Insights
        </button>
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === "predictions" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("predictions")}
        >
          Predictions
        </button>
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === "models" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("models")}
        >
          Models
        </button>
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === "settings" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("settings")}
        >
          Settings
        </button>
      </div>

      {/* Insights Tab */}
      {activeTab === "insights" && (
        <>
          {/* Key Metrics Overview */}
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            {metrics.map((metric, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">{metric.name}</p>
                    {getTrendIcon(metric.trend, metric.change)}
                  </div>
                  <div className="mb-2">
                    <p className="text-lg font-bold">
                      {metric.unit === "$" ? "$" : ""}{metric.value.toLocaleString()}{metric.unit !== "$" ? metric.unit : ""}
                    </p>
                    <p className={`text-xs ${metric.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {metric.change >= 0 ? "+" : ""}{metric.change}% vs last period
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <p>Predicted: {metric.unit === "$" ? "$" : ""}{metric.prediction.toLocaleString()}{metric.unit !== "$" ? metric.unit : ""}</p>
                    <p>Confidence: {metric.confidence}%</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search insights..."
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
              <option value="performance">Performance</option>
              <option value="audience">Audience</option>
              <option value="content">Content</option>
              <option value="conversion">Conversion</option>
              <option value="revenue">Revenue</option>
              <option value="engagement">Engagement</option>
            </select>
            <select 
              className="px-3 py-2 border rounded-md bg-background"
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Insights Summary */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Insights</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{insights.length}</div>
                <p className="text-xs text-muted-foreground">AI-generated insights</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">High Priority</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {insights.filter(i => i.priority === "high" || i.priority === "urgent").length}
                </div>
                <p className="text-xs text-orange-600">Need attention</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length)}%
                </div>
                <p className="text-xs text-green-600">High accuracy</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Actions Pending</CardTitle>
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {insights.reduce((sum, i) => sum + i.actions.filter(a => !a.completed).length, 0)}
                </div>
                <p className="text-xs text-muted-foreground">Recommended actions</p>
              </CardContent>
            </Card>
          </div>

          {/* Insights List */}
          <div className="space-y-4">
            {filteredInsights.map((insight) => (
              <Card key={insight.id} className="hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        {getInsightIcon(insight.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{insight.title}</h3>
                          {getPriorityIcon(insight.priority)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                            insight.priority === "urgent" 
                              ? "bg-red-100 text-red-700"
                              : insight.priority === "high"
                                ? "bg-orange-100 text-orange-700"
                                : insight.priority === "medium"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-green-100 text-green-700"
                          }`}>
                            {insight.priority}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getImpactColor(insight.impact)}`}>
                            {insight.impact} impact
                          </span>
                        </div>
                        <p className="text-muted-foreground text-sm mb-3">{insight.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            {getCategoryIcon(insight.category)}
                            <span className="capitalize">{insight.category}</span>
                          </div>
                          <span>Confidence: {insight.confidence}%</span>
                          <span>{insight.timeframe}</span>
                          <span>Created: {new Date(insight.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {insight.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-muted rounded text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {getStatusIcon(insight.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                        insight.status === "new" 
                          ? "bg-blue-100 text-blue-700"
                          : insight.status === "reviewed"
                            ? "bg-purple-100 text-purple-700"
                            : insight.status === "acting"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                      }`}>
                        {insight.status}
                      </span>
                    </div>
                  </div>

                  {/* Data Prediction */}
                  <div className="grid gap-4 md:grid-cols-4 mb-4 p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Current Value</p>
                      <p className="font-semibold">
                        {insight.data.unit === "$" ? "$" : ""}{insight.data.current.toLocaleString()}{insight.data.unit !== "$" ? insight.data.unit : ""}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Predicted Value</p>
                      <p className="font-semibold">
                        {insight.data.unit === "$" ? "$" : ""}{insight.data.predicted.toLocaleString()}{insight.data.unit !== "$" ? insight.data.unit : ""}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Expected Change</p>
                      <p className={`font-semibold ${insight.data.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {insight.data.change >= 0 ? "+" : ""}{insight.data.change.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Metric</p>
                      <p className="font-semibold">{insight.data.metric}</p>
                    </div>
                  </div>

                  {/* Recommended Actions */}
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Recommended Actions</h4>
                    <div className="space-y-2">
                      {insight.actions.map((action) => (
                        <div key={action.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="font-medium text-sm">{action.title}</h5>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                action.effort === "high" 
                                  ? "bg-red-100 text-red-700"
                                  : action.effort === "medium"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-green-100 text-green-700"
                              }`}>
                                {action.effort} effort
                              </span>
                              {action.completed && (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">{action.description}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Expected Impact: +{action.expectedImpact}%</span>
                              <span>Timeline: {action.timeline}</span>
                              <span className="capitalize">{action.type}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {!action.completed && (
                              <Button size="sm" variant="outline">
                                <Play className="h-4 w-4 mr-2" />
                                Start
                              </Button>
                            )}
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Insight Actions */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-xs text-muted-foreground">
                      Sources: {insight.sources.join(", ")}
                    </div>
                    <div className="flex items-center gap-2">
                      {insight.status === "new" && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateInsightStatus(insight.id, "dismissed")}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Dismiss
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => updateInsightStatus(insight.id, "reviewed")}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark Reviewed
                          </Button>
                        </>
                      )}
                      {insight.status === "reviewed" && (
                        <Button 
                          size="sm"
                          onClick={() => updateInsightStatus(insight.id, "acting")}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Take Action
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredInsights.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Brain className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Insights Found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  No insights match your current filters. Try adjusting your search criteria.
                </p>
                <Button onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSelectedPriority("all");
                }}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Predictions Tab */}
      {activeTab === "predictions" && (
        <>
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {predictions.map((model) => (
              <Card key={model.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{model.name}</CardTitle>
                      <CardDescription className="capitalize">
                        {model.type} prediction model - {model.accuracy}% accuracy
                      </CardDescription>
                    </div>
                    <Button size="sm" variant="outline">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {model.predictions.map((prediction, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{prediction.period}</p>
                          <p className="text-sm text-muted-foreground">
                            Confidence: {prediction.confidence}%
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">
                            {model.type === "revenue" 
                              ? `$${prediction.value.toLocaleString()}`
                              : `${prediction.value}${model.type === "churn" ? "%" : ""}'
                            }
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                    <p>Last updated: {new Date(model.lastUpdated).toLocaleString()}</p>
                    <p>Next update: {new Date(model.nextUpdate).toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Models Tab */}
      {activeTab === "models" && (
        <>
          <div className="text-center py-8">
            <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">AI Model Management</h3>
            <p className="text-muted-foreground mb-4">
              Manage and monitor AI models powering predictive analytics.
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Train New Model
            </Button>
          </div>

          {/* Model Performance */}
          <div className="grid gap-4 md:grid-cols-3">
            {predictions.map((model) => (
              <Card key={model.id}>
                <CardHeader>
                  <CardTitle className="text-base">{model.name}</CardTitle>
                  <CardDescription className="capitalize">{model.type} Model</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Accuracy</span>
                      <span className="font-medium">{model.accuracy}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: '${model.accuracy}%' }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <p>Last trained: {new Date(model.lastUpdated).toLocaleDateString()}</p>
                      <p>Status: Active</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retrain
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Settings Tab */}
      {activeTab === "settings" && (
        <>
          <div className="text-center py-8">
            <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Predictive Analytics Settings</h3>
            <p className="text-muted-foreground mb-4">
              Configure AI model parameters, data sources, and notification preferences.
            </p>
          </div>

          {/* Settings Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Data Sources</CardTitle>
                <CardDescription>Configure which data sources to include in AI analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Email Analytics", enabled: true },
                    { name: "Social Media Metrics", enabled: true },
                    { name: "Website Analytics", enabled: true },
                    { name: "Customer Data", enabled: true },
                    { name: "Sales Data", enabled: false },
                    { name: "Support Tickets", enabled: false }
                  ].map((source, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{source.name}</span>
                      <input 
                        type="checkbox" 
                        checked={source.enabled}
                        className="rounded"
                        readOnly
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Configure when to receive AI insights notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "High Priority Insights", enabled: true },
                    { name: "Weekly Summary Report", enabled: true },
                    { name: "Model Performance Updates", enabled: false },
                    { name: "Anomaly Detection Alerts", enabled: true },
                    { name: "Budget Optimization Alerts", enabled: true },
                    { name: "Trend Analysis Updates", enabled: false }
                  ].map((setting, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{setting.name}</span>
                      <input 
                        type="checkbox" 
                        checked={setting.enabled}
                        className="rounded"
                        readOnly
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}