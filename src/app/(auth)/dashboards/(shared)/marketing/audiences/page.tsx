"use client";

import { useState } from "react";
;
import { 
  Users,
  Plus,
  Filter,
  Download,
  Upload,
  Search,
  Target,
  BarChart3,
  Mail,
  Share2,
  Calendar,
  Eye,
  Edit3,
  Copy,
  Trash2,
  MoreHorizontal,
  UserPlus,
  TrendingUp,
  MapPin,
  Smartphone,
  Monitor,
  ShoppingBag,
  Clock,
  Star,
  Zap,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';


interface Segment {
  id: string;
  name: string;
  description: string;
  size: number;
  growth: number;
  criteria: SegmentCriteria[];
  lastUpdated: string;
  campaigns: number;
  conversions: number;
  conversionRate: number;
  avgOrderValue: number;
  status: "active" | "inactive" | "draft";
}

interface SegmentCriteria {
  field: string;
  operator: string;
  value: string | number;
  type: "demographic" | "behavioral" | "geographic" | "technographic";
}

interface Persona {
  id: string;
  name: string;
  description: string;
  avatar: string;
  demographics: {
    ageRange: string;
    gender: string;
    income: string;
    occupation: string;
    location: string;
  };
  psychographics: {
    interests: string[];
    values: string[];
    lifestyle: string;
  };
  behaviors: {
    preferredChannels: string[];
    purchaseFrequency: string;
    deviceUsage: string[];
    contentPreferences: string[];
  };
  painPoints: string[];
  goals: string[];
  segment: string;
}

const mockSegments: Segment[] = [
  {
    id: "1",
    name: "High-Value Customers",
    description: "Customers who have made purchases over $500 in the last 6 months",
    size: 1245,
    growth: 12.5,
    criteria: [
      { field: "Total Spent", operator: ">", value: 500, type: "behavioral" },
      { field: "Last Purchase", operator: "within", value: "6 months", type: "behavioral" }
    ],
    lastUpdated: "2 hours ago",
    campaigns: 8,
    conversions: 89,
    conversionRate: 7.15,
    avgOrderValue: 750,
    status: "active"
  },
  {
    id: "2", 
    name: "Newsletter Subscribers",
    description: "Engaged email subscribers who open emails regularly",
    size: 8920,
    growth: 8.3,
    criteria: [
      { field: "Email Subscriber", operator: "=", value: "true", type: "behavioral" },
      { field: "Open Rate", operator: ">", value: 25, type: "behavioral" }
    ],
    lastUpdated: "4 hours ago", 
    campaigns: 15,
    conversions: 234,
    conversionRate: 2.62,
    avgOrderValue: 85,
    status: "active"
  },
  {
    id: "3",
    name: "Mobile Users",
    description: "Users who primarily access the platform via mobile devices",
    size: 5670,
    growth: -2.1,
    criteria: [
      { field: "Device Type", operator: "=", value: "mobile", type: "technographic" },
      { field: "Sessions", operator: ">", value: 5, type: "behavioral" }
    ],
    lastUpdated: "1 day ago",
    campaigns: 6,
    conversions: 145,
    conversionRate: 2.56,
    avgOrderValue: 65,
    status: "active"
  },
  {
    id: "4",
    name: "Enterprise Prospects",
    description: "Large companies showing interest in enterprise features",
    size: 342,
    growth: 25.8,
    criteria: [
      { field: "Company Size", operator: ">", value: 500, type: "demographic" },
      { field: "Page Views", operator: "contains", value: "/enterprise", type: "behavioral" }
    ],
    lastUpdated: "3 hours ago",
    campaigns: 3,
    conversions: 28,
    conversionRate: 8.19,
    avgOrderValue: 2400,
    status: "active"
  }
];

const mockPersonas: Persona[] = [
  {
    id: "1",
    name: "Sarah - The Busy Entrepreneur",
    description: "Small business owner looking for efficient tools to scale operations",
    avatar: "👩‍💼",
    demographics: {
      ageRange: "32-45",
      gender: "Female",
      income: "$75K-150K",
      occupation: "Small Business Owner",
      location: "Urban/Suburban US"
    },
    psychographics: {
      interests: ["Business growth", "Productivity", "Technology"],
      values: ["Efficiency", "Quality", "Work-life balance"],
      lifestyle: "Fast-paced, goal-oriented"
    },
    behaviors: {
      preferredChannels: ["Email", "LinkedIn", "Google Search"],
      purchaseFrequency: "Quarterly",
      deviceUsage: ["Desktop", "Mobile"],
      contentPreferences: ["Case studies", "How-to guides", "Webinars"]
    },
    painPoints: [
      "Limited time for research",
      "Tight budget constraints", 
      "Need for reliable solutions"
    ],
    goals: [
      "Increase business efficiency",
      "Reduce operational costs",
      "Scale business growth"
    ],
    segment: "High-Value Customers"
  },
  {
    id: "2",
    name: "Marcus - The Tech-Savvy Manager",
    description: "IT manager at a mid-size company evaluating business tools",
    avatar: "👨‍💻",
    demographics: {
      ageRange: "28-40",
      gender: "Male", 
      income: "$60K-100K",
      occupation: "IT Manager",
      location: "Major metropolitan areas"
    },
    psychographics: {
      interests: ["Technology trends", "Data analytics", "Process optimization"],
      values: ["Innovation", "Security", "Scalability"],
      lifestyle: "Tech-focused, analytical"
    },
    behaviors: {
      preferredChannels: ["Technical blogs", "YouTube", "Industry forums"],
      purchaseFrequency: "Annually",
      deviceUsage: ["Desktop", "Mobile", "Tablet"],
      contentPreferences: ["Technical documentation", "Product demos", "Comparison guides"]
    },
    painPoints: [
      "Integration complexity",
      "Security concerns",
      "Budget approval processes"
    ],
    goals: [
      "Implement reliable solutions",
      "Ensure data security",
      "Streamline workflows"
    ],
    segment: "Enterprise Prospects"
  }
];

export default function AudiencesPage() {
  const [segments, setSegments] = useState<Segment[]>(mockSegments);
  const [personas, setPersonas] = useState<Persona[]>(mockPersonas);
  const [activeTab, setActiveTab] = useState<"segments" | "personas" | "insights">("segments");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSegments = segments.filter(segment =>
    segment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    segment.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCriteriaIcon = (type: string) => {
    switch (type) {
      case "demographic": return <Users className="h-3 w-3" />;
      case "behavioral": return <BarChart3 className="h-3 w-3" />;
      case "geographic": return <MapPin className="h-3 w-3" />;
      case "technographic": return <Smartphone className="h-3 w-3" />;
      default: return <Target className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audience Management</h1>
          <p className="text-muted-foreground">
            Create customer segments and personas to target your marketing campaigns effectively.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Segment
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b">
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === "segments" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("segments")}
        >
          Customer Segments
        </button>
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === "personas" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("personas")}
        >
          Buyer Personas
        </button>
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === "insights" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("insights")}
        >
          Audience Insights
        </button>
      </div>

      {/* Customer Segments Tab */}
      {activeTab === "segments" && (
        <>
          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search segments..."
                className="w-full pl-10 pr-4 py-2 border rounded-md bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Segments Overview */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Segments</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{segments.length}</div>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +2 this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Audience</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {segments.reduce((sum, seg) => sum + seg.size, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all segments
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Conversion Rate</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(segments.reduce((sum, seg) => sum + seg.conversionRate, 0) / segments.length).toFixed(2)}%
                </div>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +0.8% vs last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {segments.reduce((sum, seg) => sum + seg.campaigns, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Targeting segments
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Segments List */}
          <div className="space-y-4">
            {filteredSegments.map((segment) => (
              <Card key={segment.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{segment.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          segment.status === "active" 
                            ? "bg-green-100 text-green-700"
                            : segment.status === "inactive"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                        }`}>
                          {segment.status}
                        </span>
                      </div>
                      <p className="text-muted-foreground mt-1">{segment.description}</p>
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
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Segment Metrics */}
                  <div className="grid gap-6 md:grid-cols-5 mb-4">
                    <div>
                      <div className="text-2xl font-bold">{segment.size.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Total Users</div>
                      <div className={`text-xs flex items-center gap-1 mt-1 ${
                        segment.growth >= 0 ? "text-green-600" : "text-red-600"
                      }'}>
                        <TrendingUp className={'h-3 w-3 ${segment.growth < 0 ? "rotate-180" : ""}'} />
                        {segment.growth > 0 ? "+" : ""}{segment.growth}%
                      </div>
                    </div>

                    <div>
                      <div className="text-2xl font-bold">{segment.campaigns}</div>
                      <div className="text-sm text-muted-foreground">Active Campaigns</div>
                    </div>

                    <div>
                      <div className="text-2xl font-bold">{segment.conversions}</div>
                      <div className="text-sm text-muted-foreground">Conversions</div>
                    </div>

                    <div>
                      <div className="text-2xl font-bold">{segment.conversionRate}%</div>
                      <div className="text-sm text-muted-foreground">Conversion Rate</div>
                    </div>

                    <div>
                      <div className="text-2xl font-bold">${segment.avgOrderValue}</div>
                      <div className="text-sm text-muted-foreground">Avg Order Value</div>
                    </div>
                  </div>

                  {/* Segment Criteria */}
                  <div>
                    <h4 className="font-medium mb-2">Segment Criteria</h4>
                    <div className="flex flex-wrap gap-2">
                      {segment.criteria.map((criteria, index) => (
                        <div key={index} className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full text-sm">
                          {getCriteriaIcon(criteria.type)}
                          <span>{criteria.field} {criteria.operator} {criteria.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                    <Button size="sm">
                      <Mail className="h-4 w-4 mr-2" />
                      Create Email Campaign
                    </Button>
                    <Button size="sm" variant="outline">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Export List
                    </Button>
                    <Button size="sm" variant="outline">
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Buyer Personas Tab */}
      {activeTab === "personas" && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              Detailed buyer personas based on customer research and data analysis.
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Persona
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {personas.map((persona) => (
              <Card key={persona.id}>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-2xl">
                      {persona.avatar}
                    </div>
                    <div>
                      <CardTitle>{persona.name}</CardTitle>
                      <CardDescription>{persona.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Demographics */}
                  <div>
                    <h4 className="font-medium mb-3">Demographics</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-muted-foreground">Age:</span> {persona.demographics.ageRange}</div>
                      <div><span className="text-muted-foreground">Gender:</span> {persona.demographics.gender}</div>
                      <div><span className="text-muted-foreground">Income:</span> {persona.demographics.income}</div>
                      <div><span className="text-muted-foreground">Occupation:</span> {persona.demographics.occupation}</div>
                    </div>
                  </div>

                  {/* Behaviors */}
                  <div>
                    <h4 className="font-medium mb-3">Behaviors</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Preferred Channels:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {persona.behaviors.preferredChannels.map((channel, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                              {channel}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Device Usage:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {persona.behaviors.deviceUsage.map((device, index) => (
                            <span key={index} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                              {device}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pain Points */}
                  <div>
                    <h4 className="font-medium mb-3">Pain Points</h4>
                    <ul className="space-y-1">
                      {persona.painPoints.map((point, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <div className="w-1 h-1 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Goals */}
                  <div>
                    <h4 className="font-medium mb-3">Goals</h4>
                    <ul className="space-y-1">
                      {persona.goals.map((goal, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <Star className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                          {goal}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button size="sm" variant="outline">
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    <Button size="sm" variant="outline">
                      <Target className="h-4 w-4 mr-2" />
                      Target Campaign
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Audience Insights Tab */}
      {activeTab === "insights" && (
        <div className="grid gap-6">
          {/* Demographic Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Demographic Insights</CardTitle>
              <CardDescription>Understanding your audience composition</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div>
                  <h4 className="font-medium mb-3">Age Distribution</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">18-24</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-muted rounded-full h-2">
                          <div className="w-3/12 bg-primary rounded-full h-2" />
                        </div>
                        <span className="text-sm text-muted-foreground w-8">15%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">25-34</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-muted rounded-full h-2">
                          <div className="w-9/12 bg-primary rounded-full h-2" />
                        </div>
                        <span className="text-sm text-muted-foreground w-8">35%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">35-44</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-muted rounded-full h-2">
                          <div className="w-7/12 bg-primary rounded-full h-2" />
                        </div>
                        <span className="text-sm text-muted-foreground w-8">28%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">45+</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-muted rounded-full h-2">
                          <div className="w-5/12 bg-primary rounded-full h-2" />
                        </div>
                        <span className="text-sm text-muted-foreground w-8">22%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Gender Split</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Female</span>
                      <span className="font-medium">52%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Male</span>
                      <span className="font-medium">46%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Other</span>
                      <span className="font-medium">2%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Top Locations</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">🇺🇸 United States</span>
                      <span className="text-sm text-muted-foreground">45%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">🇬🇧 United Kingdom</span>
                      <span className="text-sm text-muted-foreground">18%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">🇨🇦 Canada</span>
                      <span className="text-sm text-muted-foreground">12%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">🇦🇺 Australia</span>
                      <span className="text-sm text-muted-foreground">8%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Behavioral Insights */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Device Preferences</CardTitle>
                <CardDescription>How your audience accesses content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      <span>Desktop</span>
                    </div>
                    <span className="font-medium">54%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      <span>Mobile</span>
                    </div>
                    <span className="font-medium">38%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      <span>Tablet</span>
                    </div>
                    <span className="font-medium">8%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Purchase Behavior</CardTitle>
                <CardDescription>Customer buying patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Avg. Session Duration</span>
                    <span className="font-medium">4m 32s</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Pages per Session</span>
                    <span className="font-medium">3.8</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Return Visitor Rate</span>
                    <span className="font-medium">68%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Avg. Time to Purchase</span>
                    <span className="font-medium">5.2 days</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}