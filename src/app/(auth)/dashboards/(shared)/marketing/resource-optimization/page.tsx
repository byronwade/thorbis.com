"use client";

import { useState } from "react";

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  BarChart3,
  Zap,
  Users,
  Calendar,
  Settings,
  Plus,
  Minus,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Download,
  Upload,
  Cpu,
  HardDrive,
  Wifi,
  Activity,
  PieChart,
  LineChart,
  Layers,
  Award,
  AlertCircle,
  Brain,
  Lightbulb,
  Search,
  Filter,
  Eye,
  Edit
} from "lucide-react";
import { Button } from '@/components/ui/button';


// Mock resource optimization data
interface ResourcePool {
  id: string;
  name: string;
  type: 'budget' | 'team' | 'time' | 'tools';
  total_allocation: number;
  used_allocation: number;
  efficiency_score: number;
  roi: number;
  status: 'optimal' | 'underutilized' | 'overallocated' | 'critical';
  channels: string[];
  last_optimized: string;
}

interface OptimizationRecommendation {
  id: string;
  title: string;
  description: string;
  type: 'reallocation' | 'scaling' | 'consolidation' | 'automation';
  priority: 'high' | 'medium' | 'low';
  impact_score: number;
  effort_required: number;
  potential_savings: number;
  affected_resources: string[];
  implementation_time: string;
  confidence: number;
}

interface PerformanceMetric {
  id: string;
  name: string;
  category: 'efficiency' | 'roi' | 'utilization' | 'satisfaction';
  current_value: number;
  target_value: number;
  trend: 'up' | 'down' | 'stable';
  last_period_change: number;
  benchmark_percentile: number;
}

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: string;
  action: string;
  status: 'active' | 'paused' | 'draft';
  executions: number;
  success_rate: number;
  time_saved: number;
  cost_savings: number;
  created_date: string;
}

const mockResourcePools: ResourcePool[] = [
  {
    id: "1",
    name: "Paid Advertising Budget",
    type: "budget",
    total_allocation: 50000,
    used_allocation: 42500,
    efficiency_score: 87.5,
    roi: 4.2,
    status: "optimal",
    channels: ["Google Ads", "Facebook", "LinkedIn"],
    last_optimized: "2025-01-02"
  },
  {
    id: "2", 
    name: "Content Creation Team",
    type: "team",
    total_allocation: 160, // hours per week
    used_allocation: 148,
    efficiency_score: 92.5,
    roi: 3.8,
    status: "optimal",
    channels: ["Blog", "Social Media", "Video"],
    last_optimized: "2025-01-01"
  },
  {
    id: "3",
    name: "Marketing Tools Subscription",
    type: "tools",
    total_allocation: 5000, // monthly cost
    used_allocation: 4200,
    efficiency_score: 68.4,
    roi: 2.1,
    status: "underutilized",
    channels: ["Email", "Analytics", "Automation"],
    last_optimized: "2024-12-28"
  },
  {
    id: "4",
    name: "Campaign Development Time",
    type: "time",
    total_allocation: 80, // hours per week
    used_allocation: 95,
    efficiency_score: 73.2,
    roi: 3.1,
    status: "overallocated",
    channels: ["Email Campaigns", "Social Campaigns", "Display"],
    last_optimized: "2024-12-30"
  }
];

const mockRecommendations: OptimizationRecommendation[] = [
  {
    id: "1",
    title: "Reallocate Google Ads Budget to High-Performing Keywords",
    description: "Move 15% of budget from broad match keywords to high-converting exact match terms",
    type: "reallocation",
    priority: "high",
    impact_score: 8.7,
    effort_required: 3,
    potential_savings: 7500,
    affected_resources: ["Paid Advertising Budget"],
    implementation_time: "2-3 days",
    confidence: 94
  },
  {
    id: "2",
    title: "Automate Social Media Posting Workflow",
    description: "Implement automated content scheduling to free up 12 hours per week of team time",
    type: "automation",
    priority: "high",
    impact_score: 9.2,
    effort_required: 5,
    potential_savings: 2400, // monthly savings
    affected_resources: ["Content Creation Team", "Campaign Development Time"],
    implementation_time: "1-2 weeks",
    confidence: 89
  },
  {
    id: "3",
    title: "Consolidate Analytics Tools",
    description: "Merge overlapping analytics subscriptions into single comprehensive platform",
    type: "consolidation",
    priority: "medium",
    impact_score: 6.8,
    effort_required: 4,
    potential_savings: 1200,
    affected_resources: ["Marketing Tools Subscription"],
    implementation_time: "3-4 weeks",
    confidence: 82
  },
  {
    id: "4",
    title: "Scale High-ROI Email Campaigns",
    description: "Increase budget allocation to top-performing email segments by 25%",
    type: "scaling",
    priority: "medium",
    impact_score: 7.5,
    effort_required: 2,
    potential_savings: 5200,
    affected_resources: ["Paid Advertising Budget", "Content Creation Team"],
    implementation_time: "1 week",
    confidence: 91
  }
];

const mockMetrics: PerformanceMetric[] = [
  {
    id: "1",
    name: "Resource Utilization Rate",
    category: "utilization",
    current_value: 84.2,
    target_value: 90.0,
    trend: "up",
    last_period_change: 5.7,
    benchmark_percentile: 78
  },
  {
    id: "2",
    name: "Marketing ROI",
    category: "roi",
    current_value: 3.45,
    target_value: 4.0,
    trend: "up",
    last_period_change: 0.32,
    benchmark_percentile: 85
  },
  {
    id: "3",
    name: "Campaign Efficiency Score",
    category: "efficiency",
    current_value: 87.3,
    target_value: 92.0,
    trend: "stable",
    last_period_change: -0.8,
    benchmark_percentile: 82
  },
  {
    id: "4",
    name: "Team Satisfaction Index",
    category: "satisfaction",
    current_value: 4.2,
    target_value: 4.5,
    trend: "up",
    last_period_change: 0.3,
    benchmark_percentile: 76
  }
];

const mockAutomationRules: AutomationRule[] = [
  {
    id: "1",
    name: "Budget Rebalancing",
    description: "Automatically reallocate budget from underperforming to high-performing channels",
    trigger: "Campaign ROI drops below 2.5x for 3 days",
    action: "Reduce budget by 20% and redistribute to top performers",
    status: "active",
    executions: 23,
    success_rate: 87.0,
    time_saved: 45, // hours
    cost_savings: 12500,
    created_date: "2024-12-01"
  },
  {
    id: "2",
    name: "Content Performance Optimization",
    description: "Pause low-engagement content and boost high-performing posts",
    trigger: "Post engagement rate below 1.5% after 24 hours",
    action: "Pause promotion and reallocate budget to top 10% performers",
    status: "active",
    executions: 156,
    success_rate: 92.3,
    time_saved: 78,
    cost_savings: 8900,
    created_date: "2024-11-15"
  },
  {
    id: "3",
    name: "Team Workload Balancing",
    description: "Redistribute tasks when team members exceed capacity thresholds",
    trigger: "Individual utilization exceeds 95% for 2+ days",
    action: "Reassign tasks to available team members",
    status: "paused",
    executions: 34,
    success_rate: 79.4,
    time_saved: 23,
    cost_savings: 3200,
    created_date: "2024-12-10"
  }
];

export default function ResourceOptimizationPage() {
  const [activeTab, setActiveTab] = useState("overview");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'optimal':
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'underutilized':
      case 'paused':
        return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'overallocated':
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-neutral-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      optimal: "bg-green-400/20 text-green-400 border-green-400/30",
      active: "bg-green-400/20 text-green-400 border-green-400/30",
      underutilized: "bg-yellow-400/20 text-yellow-400 border-yellow-400/30",
      overallocated: "bg-red-400/20 text-red-400 border-red-400/30",
      critical: "bg-red-400/20 text-red-400 border-red-400/30",
      paused: "bg-neutral-400/20 text-neutral-400 border-neutral-400/30",
      draft: "bg-blue-400/20 text-blue-400 border-blue-400/30"
    };
    
    return (
      <Badge className={`${variants[status as keyof typeof variants]} border'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      high: "bg-red-400/20 text-red-400 border-red-400/30",
      medium: "bg-yellow-400/20 text-yellow-400 border-yellow-400/30",
      low: "bg-green-400/20 text-green-400 border-green-400/30"
    };
    
    return (
      <Badge className={'${variants[priority as keyof typeof variants]} border'}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
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
        return <ArrowRight className="h-4 w-4 text-neutral-400" />;
    }
  };

  const getResourceTypeIcon = (type: string) => {
    switch (type) {
      case 'budget':
        return <DollarSign className="h-5 w-5 text-green-400" />;
      case 'team':
        return <Users className="h-5 w-5 text-blue-400" />;
      case 'time':
        return <Clock className="h-5 w-5 text-orange-400" />;
      case 'tools':
        return <Settings className="h-5 w-5 text-purple-400" />;
      default:
        return <Layers className="h-5 w-5 text-neutral-400" />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Resource Optimization</h1>
          <p className="text-neutral-400 mt-2">
            AI-powered marketing resource allocation and optimization
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Rule
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Total Resources</p>
                <p className="text-2xl font-bold text-white">$127,500</p>
              </div>
              <Cpu className="h-8 w-8 text-blue-400" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3 text-green-400" />
              <span className="text-xs text-green-400">84.2% utilization</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Optimization Score</p>
                <p className="text-2xl font-bold text-white">87.3</p>
              </div>
              <Award className="h-8 w-8 text-yellow-400" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <ArrowUp className="h-3 w-3 text-green-400" />
              <span className="text-xs text-green-400">+5.2 this week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Cost Savings</p>
                <p className="text-2xl font-bold text-white">$24,600</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-400" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3 text-green-400" />
              <span className="text-xs text-green-400">This month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Active Rules</p>
                <p className="text-2xl font-bold text-white">23</p>
              </div>
              <Zap className="h-8 w-8 text-purple-400" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <Activity className="h-3 w-3 text-purple-400" />
              <span className="text-xs text-purple-400">89% success rate</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="metrics">Performance</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resource Pool Status</CardTitle>
              <CardDescription>Current allocation and efficiency across resource categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockResourcePools.map((pool) => (
                  <div key={pool.id} className="border border-neutral-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          {getResourceTypeIcon(pool.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-white">{pool.name}</p>
                            {getStatusBadge(pool.status)}
                          </div>
                          <p className="text-sm text-neutral-400 capitalize">{pool.type} resource</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-neutral-400">Efficiency Score</p>
                        <p className="text-xl font-bold text-white">{pool.efficiency_score}%</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-400">Utilization:</span>
                        <span className="text-white">
                          {pool.type === 'budget' || pool.type === 'tools' ? '$' : '}{pool.used_allocation.toLocaleString()}
                          {pool.type === 'team' || pool.type === 'time' ? 'hrs' : '}
                          {' / '}
                          {pool.type === 'budget' || pool.type === 'tools' ? '$' : '}{pool.total_allocation.toLocaleString()}
                          {pool.type === 'team' || pool.type === 'time' ? 'hrs' : '}
                        </span>
                      </div>
                      <div className="w-full bg-neutral-800 rounded-full h-2">
                        <div
                          className={'h-2 rounded-full ${
                            pool.status === 'optimal' ? 'bg-green-400' :
                            pool.status === 'underutilized' ? 'bg-yellow-400' :
                            'bg-red-400`
              }'}
                          style={{ width: '${(pool.used_allocation / pool.total_allocation) * 100}%' }}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-neutral-400">ROI:</p>
                        <p className="text-white font-medium">{pool.roi}x</p>
                      </div>
                      <div>
                        <p className="text-neutral-400">Channels:</p>
                        <p className="text-white font-medium">{pool.channels.length}</p>
                      </div>
                      <div>
                        <p className="text-neutral-400">Last Optimized:</p>
                        <p className="text-white font-medium">{pool.last_optimized}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">Optimize</Button>
                        <Button size="sm" variant="ghost">
                          <Settings className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resource Allocation Distribution</CardTitle>
              <CardDescription>Visual breakdown of resource allocation across categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {mockResourcePools.map((pool) => (
                  <div key={pool.id} className="text-center p-4 border border-neutral-800 rounded-lg">
                    <div className="flex justify-center mb-2">
                      {getResourceTypeIcon(pool.type)}
                    </div>
                    <div className="text-lg font-bold text-white">
                      {pool.type === 'budget' || pool.type === 'tools' ? '$' : '}{pool.total_allocation.toLocaleString()}
                      {pool.type === 'team' || pool.type === 'time' ? 'hrs' : '}
                    </div>
                    <div className="text-xs text-neutral-400 capitalize">{pool.type}</div>
                    <div className="mt-2">
                      <div className={'text-xs font-medium ${
                        pool.efficiency_score >= 85 ? 'text-green-400' :
                        pool.efficiency_score >= 70 ? 'text-yellow-400' :
                        'text-red-400`
              }'}>'
                        {pool.efficiency_score}% efficient
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>AI-Powered Recommendations</CardTitle>
                  <CardDescription>Optimization suggestions based on performance analysis</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRecommendations.map((rec) => (
                  <div key={rec.id} className="border border-neutral-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Brain className="h-5 w-5 text-blue-400" />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-white">{rec.title}</p>
                            {getPriorityBadge(rec.priority)}
                          </div>
                          <p className="text-sm text-neutral-400">{rec.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-neutral-400">Impact Score</p>
                        <p className="text-xl font-bold text-white">{rec.impact_score}/10</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-neutral-400">Potential Savings:</p>
                        <p className="text-green-400 font-medium">${rec.potential_savings.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-neutral-400">Effort Required:</p>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={'w-2 h-2 rounded-full ${
                                i < rec.effort_required ? 'bg-blue-400' : 'bg-neutral-700'
              }'}
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-neutral-400">Implementation:</p>
                        <p className="text-white font-medium">{rec.implementation_time}</p>
                      </div>
                      <div>
                        <p className="text-neutral-400">Confidence:</p>
                        <p className="text-white font-medium">{rec.confidence}%</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Implement
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-3 p-2 bg-neutral-900 rounded text-xs text-neutral-300">
                      <span className="font-medium">Affected Resources:</span> {rec.affected_resources.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Key performance indicators for resource optimization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockMetrics.map((metric) => (
                  <div key={metric.id} className="border border-neutral-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getTrendIcon(metric.trend)}
                        <div>
                          <p className="font-semibold text-white">{metric.name}</p>
                          <p className="text-sm text-neutral-400 capitalize">{metric.category} metric</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-white">
                          {metric.current_value}
                          {metric.category === 'utilization' ? '%' : '}
                          {metric.category === 'roi' ? 'x' : '}
                          {metric.category === 'satisfaction' ? '/5' : '}
                        </p>
                        <p className="text-sm text-neutral-400">
                          Target: {metric.target_value}
                          {metric.category === 'utilization' ? '%' : '}
                          {metric.category === 'roi' ? 'x' : '}
                          {metric.category === 'satisfaction' ? '/5' : '}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      <div className="w-full bg-neutral-800 rounded-full h-2">
                        <div
                          className={'h-2 rounded-full ${
                            metric.current_value >= metric.target_value ? 'bg-green-400' : 'bg-yellow-400`
              }`}
                          style={{ width: '${Math.min((metric.current_value / metric.target_value) * 100, 100)}%' }}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-neutral-400">Last Period Change:</p>
                        <div className="flex items-center gap-1">
                          {metric.last_period_change > 0 ? (
                            <ArrowUp className="h-3 w-3 text-green-400" />
                          ) : metric.last_period_change < 0 ? (
                            <ArrowDown className="h-3 w-3 text-red-400" />
                          ) : (
                            <ArrowRight className="h-3 w-3 text-neutral-400" />
                          )}
                          <span className={'font-medium ${
                            metric.last_period_change > 0 ? 'text-green-400' :
                            metric.last_period_change < 0 ? 'text-red-400' :
                            'text-neutral-400'
              }'}>'
                            {metric.last_period_change > 0 ? '+' : '}{metric.last_period_change}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-neutral-400">Benchmark Percentile:</p>
                        <p className="text-white font-medium">{metric.benchmark_percentile}th</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">Analyze</Button>
                        <Button size="sm" variant="ghost">
                          <BarChart3 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automation Rules</CardTitle>
              <CardDescription>Automated optimization rules and their performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAutomationRules.map((rule) => (
                  <div key={rule.id} className="border border-neutral-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Zap className="h-5 w-5 text-purple-400" />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-white">{rule.name}</p>
                            {getStatusBadge(rule.status)}
                          </div>
                          <p className="text-sm text-neutral-400">{rule.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-neutral-400">Success Rate</p>
                        <p className="text-xl font-bold text-white">{rule.success_rate}%</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-3 p-3 bg-neutral-900 rounded-lg">
                      <div>
                        <span className="text-xs font-medium text-neutral-400">TRIGGER: </span>
                        <span className="text-xs text-white">{rule.trigger}</span>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-neutral-400">ACTION: </span>
                        <span className="text-xs text-white">{rule.action}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-neutral-400">Executions:</p>
                        <p className="text-white font-medium">{rule.executions}</p>
                      </div>
                      <div>
                        <p className="text-neutral-400">Time Saved:</p>
                        <p className="text-blue-400 font-medium">{rule.time_saved}hrs</p>
                      </div>
                      <div>
                        <p className="text-neutral-400">Cost Savings:</p>
                        <p className="text-green-400 font-medium">${rule.cost_savings.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-neutral-400">Created:</p>
                        <p className="text-white font-medium">{rule.created_date}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Settings className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Optimization Settings</CardTitle>
              <CardDescription>Configure resource optimization parameters and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium text-white mb-3">Automation Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Auto-Rebalancing</p>
                      <p className="text-sm text-neutral-400">Automatically rebalance resources based on performance</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Optimization Frequency</p>
                      <p className="text-sm text-neutral-400">How often to run optimization analysis</p>
                    </div>
                    <Button variant="outline" size="sm">Settings</Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium text-white mb-3">Alert Thresholds</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Efficiency Threshold</p>
                      <p className="text-sm text-neutral-400">Alert when efficiency drops below threshold</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Budget Variance</p>
                      <p className="text-sm text-neutral-400">Alert for significant budget deviations</p>
                    </div>
                    <Button variant="outline" size="sm">Settings</Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium text-white mb-3">Reporting & Analytics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Report Schedule</p>
                      <p className="text-sm text-neutral-400">Automated optimization report frequency</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Data Retention</p>
                      <p className="text-sm text-neutral-400">How long to retain optimization data</p>
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