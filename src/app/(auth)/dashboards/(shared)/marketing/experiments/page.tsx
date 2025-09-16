"use client";

import { useState } from "react";
;
import { 
  FlaskConical,
  Plus,
  Play,
  Pause,
  Stop,
  TrendingUp,
  TrendingDown,
  Target,
  Users,
  MousePointer,
  Eye,
  ShoppingCart,
  Calendar,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  Crown,
  Edit3,
  Copy,
  BarChart3,
  Search,
  Filter,
  MoreHorizontal,
} from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';


interface Experiment {
  id: string;
  name: string;
  type: "email" | "landing_page" | "social_post" | "ad_campaign" | "website";
  status: "draft" | "running" | "paused" | "completed" | "stopped";
  objective: "conversion" | "click_rate" | "open_rate" | "signup" | "purchase" | "engagement";
  variants: {
    id: string;
    name: string;
    traffic: number; // percentage
    metrics: {
      visitors?: number;
      conversions?: number;
      clicks?: number;
      opens?: number;
      revenue?: number;
    };
    isWinner?: boolean;
  }[];
  startDate?: string;
  endDate?: string;
  duration: string;
  confidence: number;
  significance: boolean;
  lift: number;
  totalParticipants: number;
  createdAt: string;
}

const mockExperiments: Experiment[] = [
  {
    id: "1",
    name: "Hero Section CTA Button",
    type: "landing_page",
    status: "completed",
    objective: "conversion",
    variants: [
      {
        id: "control",
        name: "Control (Get Started)",
        traffic: 50,
        metrics: {
          visitors: 2456,
          conversions: 187,
        },
        isWinner: false,
      },
      {
        id: "variant-a",
        name: "Variant A (Start Free Trial)",
        traffic: 50,
        metrics: {
          visitors: 2398,
          conversions: 234,
        },
        isWinner: true,
      },
    ],
    startDate: "2 weeks ago",
    endDate: "Yesterday",
    duration: "14 days",
    confidence: 95.8,
    significance: true,
    lift: 25.1,
    totalParticipants: 4854,
    createdAt: "3 weeks ago",
  },
  {
    id: "2",
    name: "Email Subject Line Test",
    type: "email",
    status: "running",
    objective: "open_rate",
    variants: [
      {
        id: "control",
        name: "Control (Your Weekly Update)",
        traffic: 33,
        metrics: {
          visitors: 1680,
          opens: 420,
        },
      },
      {
        id: "variant-a",
        name: "Variant A (🚀 This Week's Highlights)",
        traffic: 33,
        metrics: {
          visitors: 1654,
          opens: 496,
        },
      },
      {
        id: "variant-b",
        name: "Variant B (Don't Miss These Updates)",
        traffic: 34,
        metrics: {
          visitors: 1721,
          opens: 456,
        },
      },
    ],
    startDate: "5 days ago",
    duration: "7 days remaining",
    confidence: 67.2,
    significance: false,
    lift: 18.1,
    totalParticipants: 5055,
    createdAt: "1 week ago",
  },
  {
    id: "3",
    name: "Social Ad Creative Test",
    type: "ad_campaign",
    status: "paused",
    objective: "click_rate",
    variants: [
      {
        id: "control",
        name: "Control (Product Focus)",
        traffic: 50,
        metrics: {
          visitors: 15420,
          clicks: 892,
        },
      },
      {
        id: "variant-a",
        name: "Variant A (Lifestyle Focus)",
        traffic: 50,
        metrics: {
          visitors: 15180,
          clicks: 743,
        },
      },
    ],
    startDate: "1 week ago",
    duration: "Paused",
    confidence: 78.9,
    significance: false,
    lift: -16.7,
    totalParticipants: 30600,
    createdAt: "2 weeks ago",
  },
  {
    id: "4",
    name: "Pricing Page Layout",
    type: "website",
    status: "draft",
    objective: "signup",
    variants: [
      {
        id: "control",
        name: "Control (3-column)",
        traffic: 50,
        metrics: Record<string, unknown>,
      },
      {
        id: "variant-a",
        name: "Variant A (Single column)",
        traffic: 50,
        metrics: Record<string, unknown>,
      },
    ],
    duration: "Not started",
    confidence: 0,
    significance: false,
    lift: 0,
    totalParticipants: 0,
    createdAt: "2 days ago",
  },
];

export default function ExperimentsPage() {
  const [experiments, setExperiments] = useState<Experiment[]>(mockExperiments);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredExperiments = experiments.filter(experiment => {
    const matchesSearch = experiment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         experiment.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || experiment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "running": return <Play className="h-4 w-4 text-blue-600" />;
      case "paused": return <Pause className="h-4 w-4 text-yellow-600" />;
      case "stopped": return <Stop className="h-4 w-4 text-red-600" />;
      case "draft": return <Edit3 className="h-4 w-4 text-gray-600" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-600 bg-green-100 border-green-200";
      case "running": return "text-blue-600 bg-blue-100 border-blue-200";
      case "paused": return "text-yellow-600 bg-yellow-100 border-yellow-200";
      case "stopped": return "text-red-600 bg-red-100 border-red-200";
      case "draft": return "text-gray-600 bg-gray-100 border-gray-200";
      default: return "text-gray-600 bg-gray-100 border-gray-200";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "email": return "📧";
      case "landing_page": return "🖥️";
      case "social_post": return "📱";
      case "ad_campaign": return "📊";
      case "website": return "🌐";
      default: return "🧪";
    }
  };

  const getObjectiveIcon = (objective: string) => {
    switch (objective) {
      case "conversion": return <Target className="h-4 w-4" />;
      case "click_rate": return <MousePointer className="h-4 w-4" />;
      case "open_rate": return <Eye className="h-4 w-4" />;
      case "signup": return <Users className="h-4 w-4" />;
      case "purchase": return <ShoppingCart className="h-4 w-4" />;
      case "engagement": return <TrendingUp className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const calculateConversionRate = (variant: unknown) => {
    if (variant.metrics.visitors && variant.metrics.conversions) {
      return ((variant.metrics.conversions / variant.metrics.visitors) * 100).toFixed(1);
    }
    if (variant.metrics.visitors && variant.metrics.clicks) {
      return ((variant.metrics.clicks / variant.metrics.visitors) * 100).toFixed(1);
    }
    if (variant.metrics.visitors && variant.metrics.opens) {
      return ((variant.metrics.opens / variant.metrics.visitors) * 100).toFixed(1);
    }
    return "0.0";
  };

  const getWinnerVariant = (experiment: Experiment) => {
    return experiment.variants.find(v => v.isWinner);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">A/B Testing & Experiments</h1>
          <p className="text-muted-foreground">
            Test variations to optimize your marketing performance with data-driven insights.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/experiments/templates">
              Templates
            </Link>
          </Button>
          <Button asChild>
            <Link href="/experiments/new">
              <Plus className="h-4 w-4 mr-2" />
              New Experiment
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Experiments</CardTitle>
            <FlaskConical className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{experiments.length}</div>
            <p className="text-xs text-muted-foreground">
              {experiments.filter(e => e.status === "running").length} currently running
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Confidence</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">81.2%</div>
            <p className="text-xs text-muted-foreground">
              Across completed tests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {experiments.reduce((sum, e) => sum + e.totalParticipants, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              All-time participants
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Significant Results</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {experiments.filter(e => e.significance).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Out of {experiments.filter(e => e.status === "completed").length} completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Start Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Popular Experiment Types</CardTitle>
          <CardDescription>Start with common A/B test scenarios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3 p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                📧
              </div>
              <div className="flex-1">
                <h4 className="font-medium">Email Subject Lines</h4>
                <p className="text-sm text-muted-foreground">Test different subject lines for better open rates</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                🖥️
              </div>
              <div className="flex-1">
                <h4 className="font-medium">Landing Page CTAs</h4>
                <p className="text-sm text-muted-foreground">Optimize call-to-action buttons and text</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                📱
              </div>
              <div className="flex-1">
                <h4 className="font-medium">Social Ad Creative</h4>
                <p className="text-sm text-muted-foreground">Test different ad visuals and copy</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search experiments..."
            className="w-full pl-10 pr-4 py-2 border rounded-md bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            className="px-3 py-2 border rounded-md bg-background"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="running">Running</option>
            <option value="completed">Completed</option>
            <option value="paused">Paused</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Experiments List */}
      <div className="space-y-4">
        {filteredExperiments.map((experiment) => {
          const winner = getWinnerVariant(experiment);
          
          return (
            <Card key={experiment.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-lg">
                      {getTypeIcon(experiment.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{experiment.name}</CardTitle>
                        {experiment.significance && (
                          <Crown className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        {getObjectiveIcon(experiment.objective)}
                        <span className="capitalize">{experiment.objective.replace("_", " ")} optimization</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="capitalize">{experiment.type.replace("_", " ")}</span>
                      </CardDescription>
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(experiment.status)}`}>
                          {getStatusIcon(experiment.status)}
                          <span className="ml-1 capitalize">{experiment.status}</span>
                        </span>
                        {experiment.status === "running" && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {experiment.duration}
                          </span>
                        )}
                        {experiment.startDate && (
                          <span className="text-xs text-muted-foreground">
                            Started {experiment.startDate}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Key Metrics */}
                {experiment.status !== "draft" && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold">{experiment.totalParticipants.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Participants</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-lg font-bold flex items-center justify-center gap-1 ${
                        experiment.lift > 0 ? "text-green-600" : experiment.lift < 0 ? "text-red-600" : "text-muted-foreground"
                      }`}>
                        {experiment.lift > 0 ? <TrendingUp className="h-4 w-4" /> : 
                         experiment.lift < 0 ? <TrendingDown className="h-4 w-4" /> : null}
                        {experiment.lift > 0 ? "+" : ""}{experiment.lift}%
                      </div>
                      <div className="text-xs text-muted-foreground">Lift</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">{experiment.confidence}%</div>
                      <div className="text-xs text-muted-foreground">Confidence</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-lg font-bold ${
                        experiment.significance ? "text-green-600" : "text-muted-foreground"
                      }`}>
                        {experiment.significance ? "Yes" : "No"}
                      </div>
                      <div className="text-xs text-muted-foreground">Significant</div>
                    </div>
                  </div>
                )}

                {/* Variants */}
                <div>
                  <h4 className="font-medium mb-3">Variants Performance</h4>
                  <div className="space-y-3">
                    {experiment.variants.map((variant) => (
                      <div 
                        key={variant.id} 
                        className={`border rounded-lg p-4 ${
                          variant.isWinner ? "border-green-500 bg-green-50" : ""
                        }'}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <h5 className="font-medium">{variant.name}</h5>
                            {variant.isWinner && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-green-600 bg-green-100">
                                <Crown className="h-3 w-3 mr-1" />
                                Winner
                              </span>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {variant.traffic}% traffic
                          </span>
                        </div>
                        
                        {experiment.status !== "draft" && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <div className="text-muted-foreground">Visitors</div>
                              <div className="font-medium">
                                {variant.metrics.visitors?.toLocaleString() || "0"}
                              </div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">
                                {experiment.objective === "click_rate" ? "Clicks" :
                                 experiment.objective === "open_rate" ? "Opens" : "Conversions"}
                              </div>
                              <div className="font-medium">
                                {(variant.metrics.conversions || variant.metrics.clicks || variant.metrics.opens || 0).toLocaleString()}
                              </div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Rate</div>
                              <div className="font-medium">{calculateConversionRate(variant)}%</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Revenue</div>
                              <div className="font-medium">
                                ${variant.metrics.revenue?.toLocaleString() || "0"}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t">
                  {experiment.status === "draft" && (
                    <Button size="sm">
                      <Play className="h-4 w-4 mr-2" />
                      Start Test
                    </Button>
                  )}
                  {experiment.status === "running" && (
                    <>
                      <Button size="sm" variant="outline">
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </Button>
                      <Button size="sm" variant="outline">
                        <Stop className="h-4 w-4 mr-2" />
                        Stop Test
                      </Button>
                    </>
                  )}
                  {(experiment.status === "completed" || experiment.status === "stopped") && winner && (
                    <Button size="sm">
                      <Crown className="h-4 w-4 mr-2" />
                      Apply Winner
                    </Button>
                  )}
                  <Button size="sm" variant="outline" asChild>
                    <Link href={'/experiments/${experiment.id}/analytics'}>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Details
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline">
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredExperiments.length === 0 && (
        <div className="text-center py-12">
          <FlaskConical className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No experiments found</h3>
          <p className="text-muted-foreground">
            {searchQuery || statusFilter !== "all" 
              ? "Try adjusting your search or filters"
              : "Create your first A/B test to start optimizing your marketing"}
          </p>
          {(!searchQuery && statusFilter === "all") && (
            <Button className="mt-4" asChild>
              <Link href="/experiments/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Experiment
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}