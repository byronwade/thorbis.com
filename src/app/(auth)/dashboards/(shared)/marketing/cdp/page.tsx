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
  Database,
  Users,
  Target,
  Activity,
  Eye,
  Settings,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  Filter,
  Search,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  LineChart,
  Globe,
  Mail,
  MessageSquare,
  ShoppingCart,
  Star,
  Heart,
  Share2,
  Calendar,
  MapPin,
  Smartphone,
  Monitor,
  Tablet,
  RefreshCw,
  Zap,
  Link,
  Code,
  Play,
  Pause,
  ArrowRight,
  Layers,
  GitMerge,
  Shield,
  Key,
  Workflow,
  Brain,
  Fingerprint,
  UserCheck
} from "lucide-react";
import { Button } from '@/components/ui/button';


// Mock CDP data structures
interface CustomerProfile {
  id: string;
  unified_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  created_date: string;
  last_activity: string;
  status: 'active' | 'inactive' | 'churned' | 'prospect';
  lifetime_value: number;
  total_orders: number;
  segments: string[];
  data_sources: string[];
  attributes: Record<string, unknown>;
  journey_stage: 'awareness' | 'consideration' | 'purchase' | 'retention' | 'advocacy';
}

interface DataSource {
  id: string;
  name: string;
  type: 'website' | 'mobile_app' | 'email' | 'crm' | 'ecommerce' | 'social' | 'support';
  status: 'connected' | 'syncing' | 'error' | 'paused';
  last_sync: string;
  records_processed: number;
  data_quality_score: number;
  schema: {
    fields: number;
    mapped: number;
    unmapped: number;
  };
  connection_health: number;
}

interface IdentityGraph {
  id: string;
  customer_id: string;
  identities: {
    type: 'email' | 'phone' | 'device_id' | 'social_id' | 'customer_id';
    value: string;
    source: string;
    confidence: number;
    verified: boolean;
  }[];
  unified_profile: string;
  merge_history: {
    date: string;
    action: 'merged' | 'split' | 'updated';
    source_profiles: string[];
    confidence: number;
  }[];
}

interface Segment {
  id: string;
  name: string;
  description: string;
  type: 'behavioral' | 'demographic' | 'transactional' | 'predictive';
  criteria: {
    conditions: string[];
    logic: 'AND' | 'OR';
  };
  size: number;
  growth_rate: number;
  last_updated: string;
  activation_rate: number;
  revenue_per_customer: number;
  status: 'active' | 'draft' | 'archived';
}

interface DataFlow {
  id: string;
  name: string;
  source: string;
  destination: string;
  status: 'running' | 'paused' | 'error' | 'completed';
  frequency: string;
  last_run: string;
  records_processed: number;
  error_rate: number;
  transformations: string[];
}

const mockCustomers: CustomerProfile[] = [
  {
    id: "1",
    unified_id: "unif_123456789",
    email: "sarah.johnson@example.com",
    first_name: "Sarah",
    last_name: "Johnson",
    phone: "+1-555-0123",
    created_date: "2024-03-15",
    last_activity: "2025-01-03 14:30:00",
    status: "active",
    lifetime_value: 2450.75,
    total_orders: 8,
    segments: ["High Value", "Frequent Buyer", "Mobile User"],
    data_sources: ["Website", "Mobile App", "Email", "CRM"],
    attributes: {
      age: 34,
      location: "San Francisco, CA",
      preferred_channel: "email",
      avg_order_value: 306.34
    },
    journey_stage: "retention"
  },
  {
    id: "2",
    unified_id: "unif_234567890", 
    email: "michael.chen@company.com",
    first_name: "Michael",
    last_name: "Chen",
    created_date: "2024-08-22",
    last_activity: "2025-01-02 16:45:00",
    status: "active",
    lifetime_value: 890.25,
    total_orders: 3,
    segments: ["B2B Customer", "Tech Industry", "Premium Plan"],
    data_sources: ["Website", "CRM", "Support"],
    attributes: {
      company: "TechCorp Inc",
      industry: "Technology",
      employees: 250,
      plan_type: "Premium"
    },
    journey_stage: "consideration"
  },
  {
    id: "3",
    unified_id: "unif_345678901",
    email: "emma.williams@email.com", 
    first_name: "Emma",
    last_name: "Williams",
    created_date: "2024-12-01",
    last_activity: "2024-12-15 10:20:00",
    status: "churned",
    lifetime_value: 156.50,
    total_orders: 1,
    segments: ["New Customer", "Single Purchase", "At Risk"],
    data_sources: ["Website", "Email"],
    attributes: {
      age: 28,
      location: "Austin, TX",
      churn_risk: 0.85,
      days_since_purchase: 50
    },
    journey_stage: "awareness"
  }
];

const mockDataSources: DataSource[] = [
  {
    id: "1",
    name: "Website Analytics",
    type: "website",
    status: "connected",
    last_sync: "2025-01-03 14:30:00",
    records_processed: 1250000,
    data_quality_score: 95.2,
    schema: {
      fields: 42,
      mapped: 38,
      unmapped: 4
    },
    connection_health: 98.5
  },
  {
    id: "2",
    name: "Mobile App Events",
    type: "mobile_app",
    status: "syncing",
    last_sync: "2025-01-03 14:25:00",
    records_processed: 890000,
    data_quality_score: 92.8,
    schema: {
      fields: 35,
      mapped: 32,
      unmapped: 3
    },
    connection_health: 96.2
  },
  {
    id: "3",
    name: "E-commerce Platform",
    type: "ecommerce",
    status: "connected",
    last_sync: "2025-01-03 14:28:00",
    records_processed: 567000,
    data_quality_score: 98.1,
    schema: {
      fields: 28,
      mapped: 28,
      unmapped: 0
    },
    connection_health: 99.1
  },
  {
    id: "4",
    name: "Email Marketing",
    type: "email",
    status: "error",
    last_sync: "2025-01-03 12:15:00",
    records_processed: 234000,
    data_quality_score: 87.3,
    schema: {
      fields: 18,
      mapped: 15,
      unmapped: 3
    },
    connection_health: 65.4
  }
];

const mockSegments: Segment[] = [
  {
    id: "1",
    name: "High-Value Customers",
    description: "Customers with >$1000 lifetime value and multiple purchases",
    type: "transactional",
    criteria: {
      conditions: ["LTV > $1000", "Orders > 2", "Last Purchase < 90 days"],
      logic: "AND"
    },
    size: 2340,
    growth_rate: 12.5,
    last_updated: "2025-01-03 10:00:00",
    activation_rate: 78.9,
    revenue_per_customer: 1856.34,
    status: "active"
  },
  {
    id: "2",
    name: "Mobile-First Users",
    description: "Users who primarily engage via mobile devices",
    type: "behavioral",
    criteria: {
      conditions: ["Mobile Sessions > 80%", "Mobile Purchases > 70%"],
      logic: "AND"
    },
    size: 4567,
    growth_rate: 18.3,
    last_updated: "2025-01-03 09:30:00",
    activation_rate: 65.2,
    revenue_per_customer: 445.78,
    status: "active"
  },
  {
    id: "3",
    name: "Churn Risk - High",
    description: "Customers at high risk of churning based on behavior",
    type: "predictive",
    criteria: {
      conditions: ["Churn Score > 0.7", "Days Since Last Purchase > 60", "Email Engagement < 10%"],
      logic: "AND"
    },
    size: 890,
    growth_rate: -5.2,
    last_updated: "2025-01-03 08:45:00",
    activation_rate: 23.1,
    revenue_per_customer: 234.56,
    status: "active"
  }
];

const mockDataFlows: DataFlow[] = [
  {
    id: "1",
    name: "Website to CDP Sync",
    source: "Website Analytics",
    destination: "Customer Profiles",
    status: "running",
    frequency: "Real-time",
    last_run: "2025-01-03 14:30:00",
    records_processed: 15678,
    error_rate: 0.2,
    transformations: ["Data Cleansing", "Identity Resolution", "Schema Mapping"]
  },
  {
    id: "2",
    name: "E-commerce Order Integration",
    source: "E-commerce Platform", 
    destination: "Transaction History",
    status: "running",
    frequency: "Every 5 minutes",
    last_run: "2025-01-03 14:25:00",
    records_processed: 3456,
    error_rate: 0.1,
    transformations: ["Currency Normalization", "Product Categorization", "Customer Matching"]
  },
  {
    id: "3",
    name: "Email Engagement Sync",
    source: "Email Marketing",
    destination: "Engagement Scores",
    status: "error",
    frequency: "Hourly",
    last_run: "2025-01-03 12:15:00",
    records_processed: 0,
    error_rate: 15.3,
    transformations: ["Engagement Scoring", "Preference Updates", "Unsubscribe Handling"]
  }
];

export default function CDPPage() {
  const [activeTab, setActiveTab] = useState("overview");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'connected':
      case 'running':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'inactive':
      case 'paused':
        return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'churned':
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      case 'syncing':
        return <RefreshCw className="h-4 w-4 text-blue-400 animate-spin" />;
      default:
        return <AlertCircle className="h-4 w-4 text-neutral-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-green-400/20 text-green-400 border-green-400/30",
      connected: "bg-green-400/20 text-green-400 border-green-400/30",
      running: "bg-green-400/20 text-green-400 border-green-400/30",
      inactive: "bg-neutral-400/20 text-neutral-400 border-neutral-400/30",
      paused: "bg-yellow-400/20 text-yellow-400 border-yellow-400/30",
      churned: "bg-red-400/20 text-red-400 border-red-400/30",
      error: "bg-red-400/20 text-red-400 border-red-400/30",
      syncing: "bg-blue-400/20 text-blue-400 border-blue-400/30",
      prospect: "bg-purple-400/20 text-purple-400 border-purple-400/30",
      draft: "bg-neutral-400/20 text-neutral-400 border-neutral-400/30",
      archived: "bg-neutral-600/20 text-neutral-500 border-neutral-600/30",
      completed: "bg-green-400/20 text-green-400 border-green-400/30"
    };
    
    return (
      <Badge className={'${variants[status as keyof typeof variants]} border'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getDataTypeIcon = (type: string) => {
    const icons = {
      website: Globe,
      mobile_app: Smartphone,
      email: Mail,
      crm: Users,
      ecommerce: ShoppingCart,
      social: Share2,
      support: MessageSquare
    };
    
    const IconComponent = icons[type as keyof typeof icons] || Database;
    return <IconComponent className="h-4 w-4" />;
  };

  const getJourneyIcon = (stage: string) => {
    const icons = {
      awareness: Eye,
      consideration: Target,
      purchase: ShoppingCart,
      retention: Heart,
      advocacy: Star
    };
    
    const IconComponent = icons[stage as keyof typeof icons] || Activity;
    return <IconComponent className="h-4 w-4" />;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Customer Data Platform</h1>
          <p className="text-neutral-400 mt-2">
            Unified customer profiles, identity resolution, and data orchestration
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Data
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Data Source
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Unified Profiles</p>
                <p className="text-2xl font-bold text-white">2.4M</p>
              </div>
              <UserCheck className="h-8 w-8 text-blue-400" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3 text-green-400" />
              <span className="text-xs text-green-400">+18% this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Data Sources</p>
                <p className="text-2xl font-bold text-white">24</p>
              </div>
              <Database className="h-8 w-8 text-green-400" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <CheckCircle className="h-3 w-3 text-green-400" />
              <span className="text-xs text-green-400">22 active, 95% health</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Identity Resolution</p>
                <p className="text-2xl font-bold text-white">94.2%</p>
              </div>
              <Fingerprint className="h-8 w-8 text-purple-400" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3 text-green-400" />
              <span className="text-xs text-green-400">+2.1% accuracy</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Real-time Events</p>
                <p className="text-2xl font-bold text-white">1.8M</p>
              </div>
              <Activity className="h-8 w-8 text-orange-400" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <Activity className="h-3 w-3 text-orange-400" />
              <span className="text-xs text-orange-400">Per day average</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="profiles">Profiles</TabsTrigger>
          <TabsTrigger value="sources">Data Sources</TabsTrigger>
          <TabsTrigger value="segments">Segments</TabsTrigger>
          <TabsTrigger value="flows">Data Flows</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Data Quality Dashboard</CardTitle>
                <CardDescription>Overall health and quality metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { metric: "Profile Completeness", score: 92.5, status: "excellent" },
                    { metric: "Identity Match Rate", score: 94.2, status: "excellent" },
                    { metric: "Data Freshness", score: 87.8, status: "good" },
                    { metric: "Schema Compliance", score: 96.1, status: "excellent" },
                    { metric: "Duplicate Detection", score: 89.3, status: "good" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-white">{item.metric}</span>
                          <span className="text-sm text-white">{item.score}%</span>
                        </div>
                        <div className="w-full bg-neutral-800 rounded-full h-2">
                          <div
                            className={'h-2 rounded-full ${
                              item.score >= 90 ? 'bg-green-400' : 
                              item.score >= 80 ? 'bg-yellow-400' : 'bg-red-400`
              }'}
                            style={{ width: '${item.score}%' }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest data processing and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { action: "Profile Merged", details: "Combined 2 profiles for sarah.johnson@example.com", time: "2 min ago" },
                    { action: "New Data Source", details: "Connected Social Media Analytics", time: "15 min ago" },
                    { action: "Segment Updated", details: "High-Value Customers +234 profiles", time: "1 hour ago" },
                    { action: "Identity Resolved", details: "Matched email to mobile device ID", time: "2 hours ago" },
                    { action: "Data Quality Alert", details: "Email source showing increased errors", time: "3 hours ago" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border border-neutral-800 rounded-lg">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium text-white text-sm">{item.action}</p>
                        <p className="text-xs text-neutral-400">{item.details}</p>
                        <p className="text-xs text-neutral-500 mt-1">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Customer Journey Distribution</CardTitle>
              <CardDescription>Customer distribution across journey stages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { stage: "awareness", count: "456K", percentage: "28.5%", color: "bg-blue-400" },
                  { stage: "consideration", count: "234K", percentage: "14.6%", color: "bg-yellow-400" },
                  { stage: "purchase", count: "89K", percentage: "5.6%", color: "bg-green-400" },
                  { stage: "retention", count: "678K", percentage: "42.3%", color: "bg-purple-400" },
                  { stage: "advocacy", count: "143K", percentage: "9.0%", color: "bg-orange-400" }
                ].map((item, index) => (
                  <div key={index} className="text-center p-4 border border-neutral-800 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      {getJourneyIcon(item.stage)}
                    </div>
                    <div className="text-xl font-bold text-white">{item.count}</div>
                    <div className="text-sm text-neutral-400 capitalize">{item.stage}</div>
                    <div className="text-xs text-neutral-500">{item.percentage}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profiles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Unified Customer Profiles</CardTitle>
              <CardDescription>Complete 360-degree customer view</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockCustomers.map((customer) => (
                  <div key={customer.id} className="border border-neutral-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-400/20 rounded-full flex items-center justify-center">
                          <span className="text-blue-400 font-medium">
                            {customer.first_name[0]}{customer.last_name[0]}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-white">
                              {customer.first_name} {customer.last_name}
                            </p>
                            {getStatusBadge(customer.status)}
                            <Badge className="bg-neutral-700 text-neutral-300 border-neutral-600 capitalize">
                              {customer.journey_stage}
                            </Badge>
                          </div>
                          <p className="text-sm text-neutral-400">{customer.email}</p>
                          <p className="text-xs text-neutral-500">ID: {customer.unified_id}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                      <div>
                        <p className="text-neutral-400">Lifetime Value:</p>
                        <p className="text-white font-medium">${customer.lifetime_value.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-neutral-400">Total Orders:</p>
                        <p className="text-white font-medium">{customer.total_orders}</p>
                      </div>
                      <div>
                        <p className="text-neutral-400">Last Activity:</p>
                        <p className="text-white font-medium">{customer.last_activity}</p>
                      </div>
                      <div>
                        <p className="text-neutral-400">Data Sources:</p>
                        <p className="text-white font-medium">{customer.data_sources.length} connected</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-neutral-400 mb-2">Segments:</p>
                        <div className="flex flex-wrap gap-1">
                          {customer.segments.map((segment) => (
                            <Badge key={segment} variant="outline" className="text-xs">
                              {segment}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-neutral-400 mb-2">Data Sources:</p>
                        <div className="flex flex-wrap gap-1">
                          {customer.data_sources.map((source) => (
                            <Badge key={source} className="bg-blue-400/20 text-blue-400 border-blue-400/30 border text-xs">
                              {source}
                            </Badge>
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

        <TabsContent value="sources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Source Connections</CardTitle>
              <CardDescription>Manage and monitor data integrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockDataSources.map((source) => (
                  <div key={source.id} className="border border-neutral-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center">
                          {getDataTypeIcon(source.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-white">{source.name}</p>
                            {getStatusBadge(source.status)}
                          </div>
                          <p className="text-sm text-neutral-400 capitalize">
                            {source.type.replace('_', ' ')} data source
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="gap-1">
                          <RefreshCw className="h-3 w-3" />
                          Sync
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Settings className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                      <div>
                        <p className="text-neutral-400">Records:</p>
                        <p className="text-white font-medium">{source.records_processed.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-neutral-400">Data Quality:</p>
                        <p className="text-white font-medium">{source.data_quality_score}%</p>
                      </div>
                      <div>
                        <p className="text-neutral-400">Connection Health:</p>
                        <p className="text-white font-medium">{source.connection_health}%</p>
                      </div>
                      <div>
                        <p className="text-neutral-400">Last Sync:</p>
                        <p className="text-white font-medium">{source.last_sync}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <span className="text-neutral-400">
                          Schema: {source.schema.mapped}/{source.schema.fields} fields mapped
                        </span>
                        {source.schema.unmapped > 0 && (
                          <Badge className="bg-yellow-400/20 text-yellow-400 border-yellow-400/30 border text-xs">
                            {source.schema.unmapped} unmapped
                          </Badge>
                        )}
                      </div>
                      <Button size="sm" variant="outline">
                        Configure Schema
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="segments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Segments</CardTitle>
              <CardDescription>Dynamic customer segmentation and targeting</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockSegments.map((segment) => (
                  <div key={segment.id} className="border border-neutral-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-purple-400/20 rounded-lg flex items-center justify-center">
                          <Target className="h-5 w-5 text-purple-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-white">{segment.name}</p>
                            {getStatusBadge(segment.status)}
                            <Badge className="bg-neutral-700 text-neutral-300 border-neutral-600 capitalize">
                              {segment.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-neutral-400">{segment.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">Target</Button>
                        <Button size="sm" variant="ghost">
                          <Settings className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                      <div>
                        <p className="text-neutral-400">Size:</p>
                        <p className="text-white font-medium">{segment.size.toLocaleString()} customers</p>
                      </div>
                      <div>
                        <p className="text-neutral-400">Growth Rate:</p>
                        <div className="flex items-center gap-1">
                          {segment.growth_rate > 0 ? (
                            <TrendingUp className="h-3 w-3 text-green-400" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-red-400" />
                          )}
                          <p className="text-white font-medium">{Math.abs(segment.growth_rate)}%</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-neutral-400">Activation Rate:</p>
                        <p className="text-white font-medium">{segment.activation_rate}%</p>
                      </div>
                      <div>
                        <p className="text-neutral-400">Revenue/Customer:</p>
                        <p className="text-white font-medium">${segment.revenue_per_customer}</p>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-neutral-900 rounded text-sm">
                      <p className="text-neutral-400 mb-2">Criteria ({segment.criteria.logic}):</p>
                      <div className="space-y-1">
                        {segment.criteria.conditions.map((condition, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Code className="h-3 w-3 text-neutral-500" />
                            <span className="text-neutral-300 font-mono text-xs">{condition}</span>
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

        <TabsContent value="flows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Flow Management</CardTitle>
              <CardDescription>Monitor and configure data processing pipelines</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockDataFlows.map((flow) => (
                  <div key={flow.id} className="border border-neutral-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-green-400/20 rounded-lg flex items-center justify-center">
                          <Workflow className="h-5 w-5 text-green-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-white">{flow.name}</p>
                            {getStatusBadge(flow.status)}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-neutral-400">
                            <span>{flow.source}</span>
                            <ArrowRight className="h-3 w-3" />
                            <span>{flow.destination}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {flow.status === 'running' ? (
                          <Button size="sm" variant="outline" className="gap-1">
                            <Pause className="h-3 w-3" />
                            Pause
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" className="gap-1">
                            <Play className="h-3 w-3" />
                            Start
                          </Button>
                        )}
                        <Button size="sm" variant="ghost">
                          <Settings className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                      <div>
                        <p className="text-neutral-400">Frequency:</p>
                        <p className="text-white font-medium">{flow.frequency}</p>
                      </div>
                      <div>
                        <p className="text-neutral-400">Records:</p>
                        <p className="text-white font-medium">{flow.records_processed.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-neutral-400">Error Rate:</p>
                        <p className={'font-medium ${flow.error_rate > 5 ? 'text-red-400' : flow.error_rate > 1 ? 'text-yellow-400' : 'text-green-400'
              }'}>'
                          {flow.error_rate}%
                        </p>
                      </div>
                      <div>
                        <p className="text-neutral-400">Last Run:</p>
                        <p className="text-white font-medium">{flow.last_run}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-neutral-400 mb-2 text-sm">Transformations:</p>
                      <div className="flex flex-wrap gap-1">
                        {flow.transformations.map((transform) => (
                          <Badge key={transform} className="bg-blue-400/20 text-blue-400 border-blue-400/30 border text-xs">
                            {transform}
                          </Badge>
                        ))}
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
              <CardTitle>CDP Configuration</CardTitle>
              <CardDescription>Configure customer data platform settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium text-white mb-3">Identity Resolution</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Auto-merge Profiles</p>
                      <p className="text-sm text-neutral-400">Automatically merge profiles with high confidence matches</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Match Confidence Threshold</p>
                      <p className="text-sm text-neutral-400">Minimum confidence score for profile matching</p>
                    </div>
                    <Button variant="outline" size="sm">Settings</Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium text-white mb-3">Data Quality</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Data Validation Rules</p>
                      <p className="text-sm text-neutral-400">Configure data quality and validation rules</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Duplicate Detection</p>
                      <p className="text-sm text-neutral-400">Automatic duplicate record detection and handling</p>
                    </div>
                    <Button variant="outline" size="sm">Settings</Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium text-white mb-3">Privacy & Compliance</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Data Retention Policy</p>
                      <p className="text-sm text-neutral-400">Configure data retention and deletion policies</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Consent Management</p>
                      <p className="text-sm text-neutral-400">Manage customer consent and preferences</p>
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