"use client";

import { useState } from "react";
;
import { 
  GitBranch,
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
  MousePointer,
  Mail,
  MessageSquare,
  ShoppingBag,
  Calendar,
  Sparkles,
  Target,
  ArrowRight,
  ArrowDown,
  Diamond,
  Circle,
  Square,
  Triangle,
  Zap,
  Heart,
  Star,
  Award,
  Timer,
  MapPin,
  Route,
  Navigation,
  Compass,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';


interface JourneyStage {
  id: string;
  name: string;
  type: "touchpoint" | "decision" | "action" | "outcome" | "delay";
  position: { x: number; y: number };
  connections: string[];
  metrics?: {
    visitors: number;
    conversions: number;
    conversionRate: number;
    avgTime: number;
    dropoffRate: number;
  };
  content?: {
    title: string;
    description: string;
    channel: "email" | "website" | "app" | "social" | "sms" | "call";
  };
  conditions?: string[];
}

interface CustomerJourney {
  id: string;
  name: string;
  description: string;
  status: "active" | "draft" | "paused" | "archived";
  type: "acquisition" | "onboarding" | "retention" | "winback" | "support";
  target: string;
  createdAt: string;
  lastModified: string;
  stages: JourneyStage[];
  metrics: {
    totalVisitors: number;
    completions: number;
    completionRate: number;
    avgJourneyTime: number;
    revenue: number;
    roi: number;
  };
  triggers: string[];
  goals: string[];
}

interface JourneyTemplate {
  id: string;
  name: string;
  description: string;
  category: "ecommerce" | "saas" | "lead-gen" | "support" | "engagement";
  stages: number;
  estimatedSetupTime: string;
  popularity: number;
  preview: string[];
}

interface JourneyAnalytics {
  id: string;
  journeyId: string;
  date: string;
  visitors: number;
  conversions: number;
  revenue: number;
  avgTime: number;
  topDropoffStage: string;
  deviceBreakdown: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
}

const mockJourneys: CustomerJourney[] = [
  {
    id: "1",
    name: "E-commerce Onboarding Flow",
    description: "Complete customer onboarding from signup to first purchase",
    status: "active",
    type: "onboarding",
    target: "New Signups",
    createdAt: "2024-01-15T00:00:00Z",
    lastModified: "2024-01-23T10:30:00Z",
    stages: [
      {
        id: "start",
        name: "Sign Up",
        type: "touchpoint",
        position: { x: 100, y: 100 },
        connections: ["welcome"],
        metrics: {
          visitors: 2450,
          conversions: 1960,
          conversionRate: 80.0,
          avgTime: 180,
          dropoffRate: 20.0
        },
        content: {
          title: "Account Registration",
          description: "User creates account with email and password",
          channel: "website"
        }
      },
      {
        id: "welcome",
        name: "Welcome Email",
        type: "action",
        position: { x: 300, y: 100 },
        connections: ["profile"],
        metrics: {
          visitors: 1960,
          conversions: 1764,
          conversionRate: 90.0,
          avgTime: 60,
          dropoffRate: 10.0
        },
        content: {
          title: "Welcome & Getting Started",
          description: "Personalized welcome email with next steps",
          channel: "email"
        }
      },
      {
        id: "profile",
        name: "Complete Profile",
        type: "touchpoint",
        position: { x: 500, y: 100 },
        connections: ["browse"],
        metrics: {
          visitors: 1764,
          conversions: 1235,
          conversionRate: 70.0,
          avgTime: 300,
          dropoffRate: 30.0
        },
        content: {
          title: "Profile Completion",
          description: "Collect preferences and personal information",
          channel: "website"
        }
      },
      {
        id: "browse",
        name: "Browse Products",
        type: "touchpoint",
        position: { x: 700, y: 100 },
        connections: ["purchase", "abandon"],
        metrics: {
          visitors: 1235,
          conversions: 741,
          conversionRate: 60.0,
          avgTime: 480,
          dropoffRate: 40.0
        },
        content: {
          title: "Product Discovery",
          description: "Personalized product recommendations",
          channel: "website"
        }
      },
      {
        id: "purchase",
        name: "First Purchase",
        type: "outcome",
        position: { x: 900, y: 50 },
        connections: [],
        metrics: {
          visitors: 741,
          conversions: 741,
          conversionRate: 100.0,
          avgTime: 240,
          dropoffRate: 0
        },
        content: {
          title: "Successful Purchase",
          description: "Customer completes first transaction",
          channel: "website"
        }
      },
      {
        id: "abandon",
        name: "Cart Abandonment",
        type: "decision",
        position: { x: 900, y: 150 },
        connections: ["recovery"],
        metrics: {
          visitors: 494,
          conversions: 148,
          conversionRate: 30.0,
          avgTime: 0,
          dropoffRate: 70.0
        }
      },
      {
        id: "recovery",
        name: "Recovery Email",
        type: "action",
        position: { x: 1100, y: 150 },
        connections: [],
        metrics: {
          visitors: 494,
          conversions: 148,
          conversionRate: 30.0,
          avgTime: 60,
          dropoffRate: 70.0
        },
        content: {
          title: "Cart Recovery Campaign",
          description: "Automated email sequence to recover abandoned carts",
          channel: "email"
        }
      }
    ],
    metrics: {
      totalVisitors: 2450,
      completions: 741,
      completionRate: 30.2,
      avgJourneyTime: 1260,
      revenue: 58420,
      roi: 245.8
    },
    triggers: ["User Signup", "Account Created"],
    goals: ["Complete First Purchase", "Profile Completion", "Email Engagement"]
  },
  {
    id: "2",
    name: "Lead Nurturing Sequence",
    description: "Convert leads through educational content and targeted offers",
    status: "active",
    type: "acquisition",
    target: "Marketing Qualified Leads",
    createdAt: "2024-01-10T00:00:00Z",
    lastModified: "2024-01-22T15:20:00Z",
    stages: [],
    metrics: {
      totalVisitors: 1850,
      completions: 425,
      completionRate: 23.0,
      avgJourneyTime: 2160,
      revenue: 85200,
      roi: 340.5
    },
    triggers: ["Lead Score > 50", "Downloaded Content", "Webinar Attendance"],
    goals: ["Schedule Demo", "Request Quote", "Start Trial"]
  },
  {
    id: "3",
    name: "Customer Winback Campaign",
    description: "Re-engage inactive customers with personalized offers",
    status: "draft",
    type: "winback",
    target: "Churned Customers",
    createdAt: "2024-01-20T00:00:00Z",
    lastModified: "2024-01-23T09:15:00Z",
    stages: [],
    metrics: {
      totalVisitors: 0,
      completions: 0,
      completionRate: 0,
      avgJourneyTime: 0,
      revenue: 0,
      roi: 0
    },
    triggers: ["No Purchase in 60 Days", "Subscription Cancelled"],
    goals: ["Reactivate Account", "Complete Purchase", "Upgrade Plan"]
  },
  {
    id: "4",
    name: "VIP Customer Experience",
    description: "Exclusive journey for high-value customers",
    status: "paused",
    type: "retention",
    target: "VIP Customers",
    createdAt: "2024-01-05T00:00:00Z",
    lastModified: "2024-01-18T11:45:00Z",
    stages: [],
    metrics: {
      totalVisitors: 145,
      completions: 89,
      completionRate: 61.4,
      avgJourneyTime: 720,
      revenue: 45600,
      roi: 456.0
    },
    triggers: ["VIP Status Achieved", "High LTV", "Referral Made"],
    goals: ["Increase Loyalty", "Generate Referrals", "Upsell Premium"]
  }
];

const mockTemplates: JourneyTemplate[] = [
  {
    id: "1",
    name: "E-commerce Welcome Series",
    description: "Complete onboarding flow for new e-commerce customers",
    category: "ecommerce",
    stages: 7,
    estimatedSetupTime: "2-3 hours",
    popularity: 95,
    preview: ["Signup", "Welcome Email", "Profile Setup", "Product Browse", "First Purchase"]
  },
  {
    id: "2",
    name: "SaaS Trial to Paid",
    description: "Convert trial users to paid subscriptions",
    category: "saas",
    stages: 9,
    estimatedSetupTime: "3-4 hours",
    popularity: 92,
    preview: ["Trial Start", "Onboarding", "Feature Discovery", "Value Realization", "Upgrade"]
  },
  {
    id: "3",
    name: "Lead Nurturing Campaign",
    description: "Educational series to convert leads to customers",
    category: "lead-gen",
    stages: 6,
    estimatedSetupTime: "1-2 hours",
    popularity: 88,
    preview: ["Lead Capture", "Educational Content", "Case Studies", "Demo Offer", "Close"]
  },
  {
    id: "4",
    name: "Customer Support Journey",
    description: "Proactive support and issue resolution flow",
    category: "support",
    stages: 5,
    estimatedSetupTime: "1-2 hours",
    popularity: 78,
    preview: ["Issue Identified", "Initial Contact", "Resolution", "Follow-up", "Feedback"]
  },
  {
    id: "5",
    name: "Re-engagement Campaign",
    description: "Win back inactive customers with targeted offers",
    category: "engagement",
    stages: 4,
    estimatedSetupTime: "1 hour",
    popularity: 85,
    preview: ["Inactivity Trigger", "Personalized Offer", "Reminder", "Final Attempt"]
  }
];

export default function CustomerJourneyPage() {
  const [journeys, setJourneys] = useState<CustomerJourney[]>(mockJourneys);
  const [templates, setTemplates] = useState<JourneyTemplate[]>(mockTemplates);
  const [activeTab, setActiveTab] = useState<"journeys" | "builder" | "templates" | "analytics">("journeys");
  const [selectedJourney, setSelectedJourney] = useState<CustomerJourney | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "draft": return <Clock className="h-4 w-4 text-yellow-600" />;
      case "paused": return <Pause className="h-4 w-4 text-gray-600" />;
      case "archived": return <XCircle className="h-4 w-4 text-gray-600" />;
      default: return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "acquisition": return <Target className="h-4 w-4" />;
      case "onboarding": return <Users className="h-4 w-4" />;
      case "retention": return <Heart className="h-4 w-4" />;
      case "winback": return <RefreshCw className="h-4 w-4" />;
      case "support": return <MessageSquare className="h-4 w-4" />;
      default: return <GitBranch className="h-4 w-4" />;
    }
  };

  const getStageIcon = (type: string) => {
    switch (type) {
      case "touchpoint": return <Circle className="h-6 w-6" />;
      case "decision": return <Diamond className="h-6 w-6" />;
      case "action": return <Square className="h-6 w-6" />;
      case "outcome": return <Star className="h-6 w-6" />;
      case "delay": return <Timer className="h-6 w-6" />;
      default: return <Circle className="h-6 w-6" />;
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "email": return <Mail className="h-4 w-4" />;
      case "website": return <MousePointer className="h-4 w-4" />;
      case "app": return <MessageSquare className="h-4 w-4" />;
      case "social": return <Users className="h-4 w-4" />;
      case "sms": return <MessageSquare className="h-4 w-4" />;
      case "call": return <MessageSquare className="h-4 w-4" />;
      default: return <Circle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Journey Mapping</h1>
          <p className="text-muted-foreground">
            Visualize and optimize customer experiences across all touchpoints.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Route className="h-4 w-4 mr-2" />
            Journey Analytics
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Journey
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b">
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === "journeys" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("journeys")}
        >
          All Journeys
        </button>
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === "builder" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("builder")}
        >
          Journey Builder
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
            activeTab === "analytics" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("analytics")}
        >
          Analytics
        </button>
      </div>

      {/* Journeys Tab */}
      {activeTab === "journeys" && (
        <>
          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search journeys..."
                className="w-full pl-10 pr-4 py-2 border rounded-md bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select className="px-3 py-2 border rounded-md bg-background">
              <option value="all">All Types</option>
              <option value="acquisition">Acquisition</option>
              <option value="onboarding">Onboarding</option>
              <option value="retention">Retention</option>
              <option value="winback">Winback</option>
              <option value="support">Support</option>
            </select>
            <select className="px-3 py-2 border rounded-md bg-background">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="paused">Paused</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Journey Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Journeys</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {journeys.filter(j => j.status === "active").length}
                </div>
                <p className="text-xs text-green-600">
                  {journeys.filter(j => j.status === "active").length} of {journeys.length} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {journeys.reduce((sum, j) => sum + j.metrics.totalVisitors, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all journeys
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Completion Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(journeys.reduce((sum, j) => sum + j.metrics.completionRate, 0) / journeys.filter(j => j.metrics.completionRate > 0).length).toFixed(1)}%
                </div>
                <p className="text-xs text-green-600">
                  +5.2% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${journeys.reduce((sum, j) => sum + j.metrics.revenue, 0).toLocaleString()}
                </div>
                <p className="text-xs text-green-600">
                  Journey-attributed revenue
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Journeys List */}
          <div className="space-y-4">
            {journeys.map((journey) => (
              <Card key={journey.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedJourney(journey)}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        {getTypeIcon(journey.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{journey.name}</h3>
                          {getStatusIcon(journey.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                            journey.status === "active" 
                              ? "bg-green-100 text-green-700"
                              : journey.status === "draft"
                                ? "bg-yellow-100 text-yellow-700"
                                : journey.status === "paused"
                                  ? "bg-gray-100 text-gray-700"
                                  : "bg-gray-100 text-gray-700"
                          }`}>
                            {journey.status}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-sm mt-1">{journey.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="capitalize">{journey.type} Journey</span>
                          <span>Target: {journey.target}</span>
                          <span>{journey.stages.length} stages</span>
                          <span>Modified: {new Date(journey.lastModified).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {journey.status === "active" && (
                        <Button size="sm" variant="outline">
                          <Pause className="h-4 w-4 mr-2" />
                          Pause
                        </Button>
                      )}
                      {(journey.status === "paused" || journey.status === "draft") && (
                        <Button size="sm">
                          <Play className="h-4 w-4 mr-2" />
                          Activate
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </div>

                  {/* Journey Metrics */}
                  {journey.status === "active" && journey.metrics.totalVisitors > 0 && (
                    <div className="grid gap-4 md:grid-cols-5 mb-4">
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Visitors</p>
                        <p className="text-lg font-semibold">{journey.metrics.totalVisitors.toLocaleString()}</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Completions</p>
                        <p className="text-lg font-semibold">{journey.metrics.completions.toLocaleString()}</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Completion Rate</p>
                        <p className="text-lg font-semibold text-green-600">{journey.metrics.completionRate}%</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Avg Time</p>
                        <p className="text-lg font-semibold">{Math.floor(journey.metrics.avgJourneyTime / 60)}m</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Revenue</p>
                        <p className="text-lg font-semibold text-green-600">${journey.metrics.revenue.toLocaleString()}</p>
                      </div>
                    </div>
                  )}

                  {/* Journey Configuration */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-medium mb-2">Triggers</h4>
                      <div className="flex flex-wrap gap-1">
                        {journey.triggers.map((trigger, index) => (
                          <span key={index} className="px-2 py-1 bg-muted rounded text-xs">
                            {trigger}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Goals</h4>
                      <div className="flex flex-wrap gap-1">
                        {journey.goals.map((goal, index) => (
                          <span key={index} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                            {goal}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Journey Builder Tab */}
      {activeTab === "builder" && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              Visual journey builder with drag-and-drop interface.
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button size="sm">
                <Play className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </div>
          </div>

          {/* Journey Builder Canvas */}
          {selectedJourney && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedJourney.name}</CardTitle>
                    <CardDescription>Visual journey editor</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </Button>
                    <Button size="sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative bg-gray-50 rounded-lg p-8 min-h-[600px] overflow-auto">
                  {/* Journey Stages Visualization */}
                  {selectedJourney.stages.map((stage, index) => (
                    <div
                      key={stage.id}
                      className="absolute bg-white border-2 border-primary/20 rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md transition-all"
                      style={{ 
                        left: `${stage.position.x}px', 
                        top: '${stage.position.y}px',
                        width: '180px'
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {getStageIcon(stage.type)}
                        <h4 className="font-medium text-sm">{stage.name}</h4>
                      </div>
                      {stage.content && (
                        <div className="mb-2">
                          <div className="flex items-center gap-1 mb-1">
                            {getChannelIcon(stage.content.channel)}
                            <span className="text-xs text-muted-foreground capitalize">
                              {stage.content.channel}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {stage.content.description}
                          </p>
                        </div>
                      )}
                      {stage.metrics && (
                        <div className="grid grid-cols-2 gap-1 text-xs">
                          <div>
                            <p className="text-muted-foreground">Visitors</p>
                            <p className="font-medium">{stage.metrics.visitors}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Conv Rate</p>
                            <p className="font-medium text-green-600">{stage.metrics.conversionRate}%</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Connection Lines */}
                  {selectedJourney.stages.map((stage) =>
                    stage.connections.map((connectionId) => {
                      const targetStage = selectedJourney.stages.find(s => s.id === connectionId);
                      if (!targetStage) return null;
                      
                      return (
                        <svg
                          key={'${stage.id}-${connectionId}'}
                          className="absolute pointer-events-none"
                          style={{
                            left: 0,
                            top: 0,
                            width: '100%',
                            height: '100%'
                          }}
                        >
                          <defs>
                            <marker
                              id="arrowhead"
                              markerWidth="10"
                              markerHeight="7"
                              refX="9"
                              refY="3.5"
                              orient="auto"
                            >
                              <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
                            </marker>
                          </defs>
                          <line
                            x1={stage.position.x + 180}
                            y1={stage.position.y + 50}
                            x2={targetStage.position.x}
                            y2={targetStage.position.y + 50}
                            stroke="#3b82f6"
                            strokeWidth="2"
                            markerEnd="url(#arrowhead)"
                          />
                        </svg>
                      );
                    })
                  )}

                  {/* Toolbar */}
                  <div className="absolute top-4 left-4 bg-white border rounded-lg p-2 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Circle className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Diamond className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Square className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Star className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Default Builder View */}
          {!selectedJourney && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <GitBranch className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Journey Selected</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Select a journey from the list or create a new one to start building.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setActiveTab("journeys")}>
                    Select Journey
                  </Button>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Journey
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Templates Tab */}
      {activeTab === "templates" && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              Pre-built journey templates to get started quickly.
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold mb-1">{template.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="capitalize bg-muted px-2 py-1 rounded">{template.category}</span>
                        <span>{template.stages} stages</span>
                        <span>{template.estimatedSetupTime}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      {template.popularity}
                    </div>
                  </div>

                  {/* Template Preview */}
                  <div className="mb-4">
                    <h4 className="font-medium mb-2 text-sm">Journey Preview</h4>
                    <div className="flex items-center gap-2 text-xs">
                      {template.preview.map((step, index) => (
                        <div key={index} className="flex items-center gap-1">
                          <span className="bg-muted px-2 py-1 rounded">{step}</span>
                          {index < template.preview.length - 1 && (
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      Use Template
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && (
        <>
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Journey Analytics Dashboard</h3>
            <p className="text-muted-foreground mb-4">
              Comprehensive analytics and insights for all customer journeys.
            </p>
            <Button>
              <TrendingUp className="h-4 w-4 mr-2" />
              View Full Analytics
            </Button>
          </div>

          {/* Quick Analytics Overview */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Journeys</CardTitle>
                <CardDescription>Journeys with highest completion rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {journeys
                    .filter(j => j.metrics.completionRate > 0)
                    .sort((a, b) => b.metrics.completionRate - a.metrics.completionRate)
                    .slice(0, 3)
                    .map((journey) => (
                      <div key={journey.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getTypeIcon(journey.type)}
                          <div>
                            <p className="font-medium">{journey.name}</p>
                            <p className="text-sm text-muted-foreground">{journey.target}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">{journey.metrics.completionRate}%</p>
                          <p className="text-xs text-muted-foreground">{journey.metrics.completions} completions</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Leaders</CardTitle>
                <CardDescription>Journeys generating the most revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {journeys
                    .filter(j => j.metrics.revenue > 0)
                    .sort((a, b) => b.metrics.revenue - a.metrics.revenue)
                    .slice(0, 3)
                    .map((journey) => (
                      <div key={journey.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getTypeIcon(journey.type)}
                          <div>
                            <p className="font-medium">{journey.name}</p>
                            <p className="text-sm text-muted-foreground">ROI: {journey.metrics.roi}%</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">${journey.metrics.revenue.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">{journey.metrics.completions} completions</p>
                        </div>
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