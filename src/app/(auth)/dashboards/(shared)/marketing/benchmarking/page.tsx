"use client";

import { useState } from "react";
;
import { 
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Separator,
} from '@/components/ui';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  Users,
  DollarSign,
  Activity,
  Eye,
  Settings,
  Plus,
  Download,
  Upload,
  Filter,
  Search,
  CheckCircle,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Minus,
  Star,
  Globe,
  Mail,
  Share2,
  Calendar,
  Clock,
  Zap,
  ShoppingCart,
  MessageSquare,
  Play,
  Pause,
  RefreshCw,
  Info,
  Lightbulb,
  Flag,
  LineChart,
  PieChart,
  BarChart,
  Database
} from "lucide-react";
import { Button } from '@/components/ui/button';


// Mock benchmarking data
interface Benchmark {
  id: string;
  metric: string;
  category: 'email' | 'social' | 'paid_ads' | 'seo' | 'content' | 'conversion';
  your_value: number;
  industry_avg: number;
  top_quartile: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  benchmark_status: 'excellent' | 'good' | 'average' | 'below_average' | 'poor';
  description: string;
  recommendations: string[];
}

interface IndustryData {
  industry: string;
  company_size: 'startup' | 'small' | 'medium' | 'enterprise';
  region: string;
  benchmarks: Benchmark[];
  last_updated: string;
}

interface CompetitorAnalysis {
  id: string;
  competitor_name: string;
  domain: string;
  category: string;
  metrics: {
    traffic_estimate: number;
    social_followers: number;
    email_subscribers: number;
    ad_spend_estimate: number;
    content_frequency: number;
  };
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
}

interface Report {
  id: string;
  name: string;
  type: 'comprehensive' | 'category_specific' | 'competitor_analysis';
  created_date: string;
  status: 'ready' | 'processing' | 'scheduled';
  metrics_included: number;
  insights_count: number;
  file_url?: string;
}

const mockBenchmarks: Benchmark[] = [
  {
    id: "1",
    metric: "Email Open Rate",
    category: "email",
    your_value: 24.5,
    industry_avg: 21.3,
    top_quartile: 28.7,
    unit: "%",
    trend: "up",
    benchmark_status: "good",
    description: "Percentage of recipients who open your email campaigns",
    recommendations: [
      "Test different subject lines",
      "Optimize send times",
      "Segment your audience better"
    ]
  },
  {
    id: "2",
    metric: "Click-Through Rate",
    category: "email",
    your_value: 2.8,
    industry_avg: 2.6,
    top_quartile: 3.9,
    unit: "%",
    trend: "stable",
    benchmark_status: "average",
    description: "Percentage of recipients who click links in your emails",
    recommendations: [
      "Improve email design and layout",
      "Use more compelling CTAs",
      "Personalize content better"
    ]
  },
  {
    id: "3",
    metric: "Social Media Engagement",
    category: "social",
    your_value: 3.2,
    industry_avg: 4.1,
    top_quartile: 6.8,
    unit: "%",
    trend: "down",
    benchmark_status: "below_average",
    description: "Average engagement rate across social media platforms",
    recommendations: [
      "Post more engaging content",
      "Increase posting frequency",
      "Use more video content",
      "Engage with followers more actively"
    ]
  },
  {
    id: "4",
    metric: "Cost Per Click",
    category: "paid_ads",
    your_value: 1.85,
    industry_avg: 2.34,
    top_quartile: 1.12,
    unit: "$",
    trend: "up",
    benchmark_status: "good",
    description: "Average cost per click for paid advertising campaigns",
    recommendations: [
      "Optimize ad targeting",
      "Improve ad quality scores",
      "Test different ad formats"
    ]
  },
  {
    id: "5",
    metric: "Organic Traffic Growth",
    category: "seo",
    your_value: 8.3,
    industry_avg: 12.7,
    top_quartile: 18.9,
    unit: "% MoM",
    trend: "stable",
    benchmark_status: "below_average",
    description: "Month-over-month organic traffic growth rate",
    recommendations: [
      "Improve content quality",
      "Target long-tail keywords",
      "Build more quality backlinks",
      "Optimize technical SEO"
    ]
  }
];

const mockCompetitors: CompetitorAnalysis[] = [
  {
    id: "1",
    competitor_name: "MarketingHub Pro",
    domain: "marketinghub.com",
    category: "Direct Competitor",
    metrics: {
      traffic_estimate: 245000,
      social_followers: 89000,
      email_subscribers: 45000,
      ad_spend_estimate: 125000,
      content_frequency: 12
    },
    strengths: [
      "Strong social media presence",
      "High-quality content marketing",
      "Excellent SEO performance"
    ],
    weaknesses: [
      "Limited video content",
      "Slow website speed",
      "Poor mobile experience"
    ],
    opportunities: [
      "Expand into video marketing",
      "Improve mobile optimization",
      "Target emerging markets"
    ]
  },
  {
    id: "2", 
    competitor_name: "Growth Analytics",
    domain: "growthanalytics.io",
    category: "Indirect Competitor",
    metrics: {
      traffic_estimate: 156000,
      social_followers: 34000,
      email_subscribers: 28000,
      ad_spend_estimate: 78000,
      content_frequency: 8
    },
    strengths: [
      "Data-driven approach",
      "Strong thought leadership",
      "Premium pricing strategy"
    ],
    weaknesses: [
      "Limited social engagement",
      "Complex user interface",
      "High customer acquisition cost"
    ],
    opportunities: [
      "Simplify product offerings",
      "Increase social media activity",
      "Develop partnerships"
    ]
  }
];

const mockReports: Report[] = [
  {
    id: "1",
    name: "Q1 2025 Marketing Performance Benchmark",
    type: "comprehensive",
    created_date: "2025-01-01",
    status: "ready",
    metrics_included: 15,
    insights_count: 23,
    file_url: "/reports/q1-2025-benchmark.pdf"
  },
  {
    id: "2",
    name: "Email Marketing Deep Dive",
    type: "category_specific",
    created_date: "2024-12-28",
    status: "ready",
    metrics_included: 8,
    insights_count: 12,
    file_url: "/reports/email-marketing-analysis.pdf"
  },
  {
    id: "3",
    name: "Competitor Analysis Report",
    type: "competitor_analysis",
    created_date: "2025-01-03",
    status: "processing",
    metrics_included: 12,
    insights_count: 18
  }
];

export default function BenchmarkingPage() {
  const [activeTab, setActiveTab] = useState("overview");

  const getBenchmarkIcon = (status: string) => {
    switch (status) {
      case 'excellent':
        return <Award className="h-4 w-4 text-yellow-400" />;
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'average':
        return <Minus className="h-4 w-4 text-blue-400" />;
      case 'below_average':
        return <AlertCircle className="h-4 w-4 text-orange-400" />;
      case 'poor':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Minus className="h-4 w-4 text-neutral-400" />;
    }
  };

  const getBenchmarkBadge = (status: string) => {
    const variants = {
      excellent: "bg-yellow-400/20 text-yellow-400 border-yellow-400/30",
      good: "bg-green-400/20 text-green-400 border-green-400/30",
      average: "bg-blue-400/20 text-blue-400 border-blue-400/30",
      below_average: "bg-orange-400/20 text-orange-400 border-orange-400/30",
      poor: "bg-red-400/20 text-red-400 border-red-400/30"
    };
    
    return (
      <Badge className={'${variants[status as keyof typeof variants]} border'}>
        {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
      </Badge>
    );
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-400" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-400" />;
      default:
        return <Minus className="h-4 w-4 text-neutral-400" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      email: Mail,
      social: Share2,
      paid_ads: Target,
      seo: Globe,
      content: MessageSquare,
      conversion: ShoppingCart
    };
    
    const IconComponent = icons[category as keyof typeof icons] || BarChart3;
    return <IconComponent className="h-4 w-4" />;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Marketing Benchmarking</h1>
          <p className="text-neutral-400 mt-2">
            Compare your marketing performance against industry standards
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
          <Button className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Update Benchmarks
          </Button>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Overall Score</p>
                <p className="text-2xl font-bold text-white">7.3/10</p>
              </div>
              <Star className="h-8 w-8 text-yellow-400 fill-current" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3 text-green-400" />
              <span className="text-xs text-green-400">+0.4 this quarter</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Above Industry Avg</p>
                <p className="text-2xl font-bold text-white">68%</p>
              </div>
              <Target className="h-8 w-8 text-green-400" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <CheckCircle className="h-3 w-3 text-green-400" />
              <span className="text-xs text-green-400">11 out of 16 metrics</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Top Quartile</p>
                <p className="text-2xl font-bold text-white">25%</p>
              </div>
              <Award className="h-8 w-8 text-purple-400" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <Award className="h-3 w-3 text-purple-400" />
              <span className="text-xs text-purple-400">4 out of 16 metrics</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Improvement Ops</p>
                <p className="text-2xl font-bold text-white">12</p>
              </div>
              <Lightbulb className="h-8 w-8 text-orange-400" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <Lightbulb className="h-3 w-3 text-orange-400" />
              <span className="text-xs text-orange-400">High impact potential</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="competitors">Competitors</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
                <CardDescription>How you compare across key metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { category: "Email Marketing", score: 8.2, status: "good", metrics: 4 },
                    { category: "Social Media", score: 6.1, status: "below_average", metrics: 3 },
                    { category: "Paid Advertising", score: 7.8, status: "good", metrics: 3 },
                    { category: "SEO & Organic", score: 6.9, status: "average", metrics: 4 },
                    { category: "Content Marketing", score: 7.5, status: "good", metrics: 2 }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 border border-neutral-800 rounded-lg">
                      <div className="flex-shrink-0">
                        {getBenchmarkIcon(item.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-white">{item.category}</p>
                          {getBenchmarkBadge(item.status)}
                        </div>
                        <p className="text-sm text-neutral-400">{item.metrics} metrics tracked</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-white text-lg">{item.score}/10</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Improvement Priorities</CardTitle>
                <CardDescription>Areas with highest impact potential</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { metric: "Social Media Engagement", impact: "High", effort: "Medium", potential: "+15% reach" },
                    { metric: "Organic Traffic Growth", impact: "High", effort: "High", potential: "+8% monthly growth" },
                    { metric: "Email Click Rate", impact: "Medium", effort: "Low", potential: "+1.2% CTR" },
                    { metric: "Ad Conversion Rate", impact: "Medium", effort: "Medium", potential: "+0.8% conversion" }
                  ].map((item, index) => (
                    <div key={index} className="p-3 border border-neutral-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-white">{item.metric}</p>
                        <Badge className="bg-blue-400/20 text-blue-400 border-blue-400/30 border text-xs">
                          {item.impact} Impact
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-400">Effort: {item.effort}</span>
                        <span className="text-green-400">{item.potential}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Industry Comparison</CardTitle>
              <CardDescription>Your position relative to industry benchmarks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border border-neutral-800 rounded-lg">
                  <BarChart3 className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-white">68%</div>
                  <div className="text-xs text-neutral-400">Above Industry Average</div>
                </div>
                <div className="text-center p-4 border border-neutral-800 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-white">+12%</div>
                  <div className="text-xs text-neutral-400">Performance Improvement</div>
                </div>
                <div className="text-center p-4 border border-neutral-800 rounded-lg">
                  <Target className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-white">Top 25%</div>
                  <div className="text-xs text-neutral-400">In Key Metrics</div>
                </div>
                <div className="text-center p-4 border border-neutral-800 rounded-lg">
                  <Users className="h-8 w-8 text-orange-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-white">2,340</div>
                  <div className="text-xs text-neutral-400">Companies Compared</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Benchmarks</CardTitle>
              <CardDescription>Compare your performance across all key metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockBenchmarks.map((benchmark) => (
                  <div key={benchmark.id} className="border border-neutral-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center">
                          {getCategoryIcon(benchmark.category)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-white">{benchmark.metric}</p>
                            {getBenchmarkBadge(benchmark.benchmark_status)}
                          </div>
                          <p className="text-sm text-neutral-400">{benchmark.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(benchmark.trend)}
                        {getBenchmarkIcon(benchmark.benchmark_status)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                      <div className="text-center p-3 bg-blue-400/10 rounded-lg">
                        <p className="text-blue-400 font-bold text-lg">
                          {benchmark.your_value}{benchmark.unit}
                        </p>
                        <p className="text-neutral-400">Your Performance</p>
                      </div>
                      <div className="text-center p-3 bg-neutral-800 rounded-lg">
                        <p className="text-white font-bold text-lg">
                          {benchmark.industry_avg}{benchmark.unit}
                        </p>
                        <p className="text-neutral-400">Industry Average</p>
                      </div>
                      <div className="text-center p-3 bg-green-400/10 rounded-lg">
                        <p className="text-green-400 font-bold text-lg">
                          {benchmark.top_quartile}{benchmark.unit}
                        </p>
                        <p className="text-neutral-400">Top Quartile</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-white">Recommendations:</p>
                      <div className="space-y-1">
                        {benchmark.recommendations.map((rec, index) => (
                          <div key={index} className="flex items-start gap-2 text-sm">
                            <Lightbulb className="h-3 w-3 text-orange-400 mt-0.5 flex-shrink-0" />
                            <span className="text-neutral-300">{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competitors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Competitor Analysis</CardTitle>
              <CardDescription>Analyze your competition and identify opportunities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockCompetitors.map((competitor) => (
                  <div key={competitor.id} className="border border-neutral-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-purple-400/20 rounded-lg flex items-center justify-center">
                          <Globe className="h-6 w-6 text-purple-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">{competitor.competitor_name}</p>
                          <p className="text-sm text-neutral-400">{competitor.domain}</p>
                          <Badge className="bg-purple-400/20 text-purple-400 border-purple-400/30 border text-xs">
                            {competitor.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4 text-sm">
                      <div>
                        <p className="text-neutral-400">Traffic:</p>
                        <p className="text-white font-medium">{competitor.metrics.traffic_estimate.toLocaleString()}/mo</p>
                      </div>
                      <div>
                        <p className="text-neutral-400">Social:</p>
                        <p className="text-white font-medium">{competitor.metrics.social_followers.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-neutral-400">Email:</p>
                        <p className="text-white font-medium">{competitor.metrics.email_subscribers.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-neutral-400">Ad Spend:</p>
                        <p className="text-white font-medium">${competitor.metrics.ad_spend_estimate.toLocaleString()}/mo</p>
                      </div>
                      <div>
                        <p className="text-neutral-400">Content:</p>
                        <p className="text-white font-medium">{competitor.metrics.content_frequency}/mo</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-green-400 font-medium mb-2">Strengths:</p>
                        <div className="space-y-1">
                          {competitor.strengths.map((strength, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <CheckCircle className="h-3 w-3 text-green-400 mt-0.5 flex-shrink-0" />
                              <span className="text-neutral-300">{strength}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-red-400 font-medium mb-2">Weaknesses:</p>
                        <div className="space-y-1">
                          {competitor.weaknesses.map((weakness, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <AlertCircle className="h-3 w-3 text-red-400 mt-0.5 flex-shrink-0" />
                              <span className="text-neutral-300">{weakness}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-blue-400 font-medium mb-2">Opportunities:</p>
                        <div className="space-y-1">
                          {competitor.opportunities.map((opportunity, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <Lightbulb className="h-3 w-3 text-blue-400 mt-0.5 flex-shrink-0" />
                              <span className="text-neutral-300">{opportunity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Benchmark Reports</CardTitle>
              <CardDescription>Generated reports and scheduled analyses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockReports.map((report) => (
                  <div key={report.id} className="border border-neutral-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-green-400/20 rounded-lg flex items-center justify-center">
                          <BarChart3 className="h-5 w-5 text-green-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">{report.name}</p>
                          <p className="text-sm text-neutral-400 capitalize">
                            {report.type.replace('_', ' ')} • {report.created_date}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {report.status === 'ready' ? (
                          <Button size="sm" variant="outline" className="gap-1">
                            <Download className="h-3 w-3" />
                            Download
                          </Button>
                        ) : report.status === 'processing' ? (
                          <Badge className="bg-blue-400/20 text-blue-400 border-blue-400/30 border">
                            Processing
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-400/20 text-yellow-400 border-yellow-400/30 border">
                            Scheduled
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-neutral-400">Metrics Included:</p>
                        <p className="text-white font-medium">{report.metrics_included}</p>
                      </div>
                      <div>
                        <p className="text-neutral-400">Insights Generated:</p>
                        <p className="text-white font-medium">{report.insights_count}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Generate Report
                </Button>
                <Button variant="outline" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  Schedule Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Benchmarking Settings</CardTitle>
              <CardDescription>Configure benchmarking parameters and data sources</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium text-white mb-3">Industry Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Industry Classification</p>
                      <p className="text-sm text-neutral-400">Set your primary industry for benchmarking</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Company Size</p>
                      <p className="text-sm text-neutral-400">Define company size for peer comparison</p>
                    </div>
                    <Button variant="outline" size="sm">Settings</Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium text-white mb-3">Data Sources</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Data Update Frequency</p>
                      <p className="text-sm text-neutral-400">How often to refresh benchmark data</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">External Data Sources</p>
                      <p className="text-sm text-neutral-400">Connect additional benchmark sources</p>
                    </div>
                    <Button variant="outline" size="sm">Manage</Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium text-white mb-3">Reporting</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Auto-generated Reports</p>
                      <p className="text-sm text-neutral-400">Schedule automatic benchmark reports</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Alert Thresholds</p>
                      <p className="text-sm text-neutral-400">Set alerts for performance changes</p>
                    </div>
                    <Button variant="outline" size="sm">Settings</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}