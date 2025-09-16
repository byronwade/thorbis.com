"use client";

import { useState } from "react";
;
import { 
  Zap,
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
  Globe,
  Code,
  Download,
  Upload,
  Link,
  ExternalLink,
  Activity,
  Calendar,
  Mail,
  Database,
  BarChart3,
  Users,
  ShoppingCart,
  MessageSquare,
  FileText,
  Target,
  Webhook,
  Key,
  Shield,
  Server,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';


interface Integration {
  id: string;
  name: string;
  description: string;
  category: "crm" | "analytics" | "ecommerce" | "email" | "social" | "automation" | "storage";
  provider: string;
  status: "connected" | "disconnected" | "error" | "pending";
  lastSync?: string;
  syncFrequency?: string;
  dataPoints: string[];
  webhooksEnabled: boolean;
  apiKey?: string;
  createdAt: string;
  syncedRecords?: number;
  errorCount?: number;
}

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: "active" | "inactive" | "error";
  method: "POST" | "PUT" | "PATCH";
  headers: Record<string, string>;
  lastTriggered?: string;
  successCount: number;
  errorCount: number;
  createdAt: string;
  retryPolicy: {
    enabled: boolean;
    maxRetries: number;
    retryDelay: number;
  };
}

interface APIKey {
  id: string;
  name: string;
  keyPrefix: string;
  permissions: string[];
  status: "active" | "expired" | "revoked";
  lastUsed?: string;
  usageCount: number;
  createdAt: string;
  expiresAt?: string;
  ipWhitelist?: string[];
}

const mockIntegrations: Integration[] = [
  {
    id: "1",
    name: "Salesforce CRM",
    description: "Sync customer data and lead information with Salesforce",
    category: "crm",
    provider: "Salesforce",
    status: "connected",
    lastSync: "2024-01-23T10:30:00Z",
    syncFrequency: "realtime",
    dataPoints: ["contacts", "leads", "opportunities", "accounts"],
    webhooksEnabled: true,
    createdAt: "2024-01-01T00:00:00Z",
    syncedRecords: 12450,
    errorCount: 0
  },
  {
    id: "2",
    name: "Google Analytics",
    description: "Track website performance and user behavior analytics",
    category: "analytics", 
    provider: "Google",
    status: "connected",
    lastSync: "2024-01-23T11:15:00Z",
    syncFrequency: "hourly",
    dataPoints: ["page views", "sessions", "conversions", "demographics"],
    webhooksEnabled: false,
    createdAt: "2024-01-05T00:00:00Z",
    syncedRecords: 89320,
    errorCount: 2
  },
  {
    id: "3",
    name: "Shopify Store",
    description: "Synchronize product catalog and order data from Shopify",
    category: "ecommerce",
    provider: "Shopify",
    status: "error",
    lastSync: "2024-01-22T09:20:00Z",
    syncFrequency: "hourly",
    dataPoints: ["products", "orders", "customers", "inventory"],
    webhooksEnabled: true,
    createdAt: "2024-01-10T00:00:00Z",
    syncedRecords: 5680,
    errorCount: 15
  },
  {
    id: "4",
    name: "Mailchimp",
    description: "Sync email subscribers and campaign data",
    category: "email",
    provider: "Mailchimp",
    status: "connected",
    lastSync: "2024-01-23T08:45:00Z", 
    syncFrequency: "daily",
    dataPoints: ["subscribers", "campaigns", "segments", "automation"],
    webhooksEnabled: true,
    createdAt: "2023-12-20T00:00:00Z",
    syncedRecords: 25600,
    errorCount: 1
  },
  {
    id: "5",
    name: "HubSpot",
    description: "Marketing automation and CRM integration",
    category: "crm",
    provider: "HubSpot",
    status: "pending",
    syncFrequency: "realtime",
    dataPoints: ["contacts", "companies", "deals", "tickets"],
    webhooksEnabled: false,
    createdAt: "2024-01-22T00:00:00Z",
    errorCount: 0
  }
];

const mockWebhooks: Webhook[] = [
  {
    id: "1",
    name: "CRM Lead Sync",
    url: "https://api.salesforce.com/webhooks/leads",
    events: ["form.submitted", "lead.created", "lead.qualified"],
    status: "active",
    method: "POST",
    headers: {
      "Authorization": "Bearer xxx-xxx-xxx",
      "Content-Type": "application/json"
    },
    lastTriggered: "2024-01-23T10:30:00Z",
    successCount: 1245,
    errorCount: 12,
    createdAt: "2024-01-01T00:00:00Z",
    retryPolicy: {
      enabled: true,
      maxRetries: 3,
      retryDelay: 5000
    }
  },
  {
    id: "2",
    name: "Email Subscription Webhook",
    url: "https://api.mailchimp.com/webhooks/subscribe",
    events: ["email.subscribed", "email.unsubscribed"],
    status: "active",
    method: "POST",
    headers: {
      "X-API-Key": "mc-xxx-xxx",
      "Content-Type": "application/json"
    },
    lastTriggered: "2024-01-23T09:15:00Z",
    successCount: 3450,
    errorCount: 8,
    createdAt: "2024-01-05T00:00:00Z",
    retryPolicy: {
      enabled: true,
      maxRetries: 5,
      retryDelay: 3000
    }
  },
  {
    id: "3",
    name: "Analytics Event Tracker",
    url: "https://analytics.example.com/events",
    events: ["conversion.completed", "purchase.made", "goal.achieved"],
    status: "error",
    method: "POST",
    headers: {
      "Authorization": "Bearer analytics-token",
      "Content-Type": "application/json"
    },
    lastTriggered: "2024-01-22T14:20:00Z",
    successCount: 892,
    errorCount: 45,
    createdAt: "2024-01-10T00:00:00Z",
    retryPolicy: {
      enabled: true,
      maxRetries: 2,
      retryDelay: 10000
    }
  }
];

const mockAPIKeys: APIKey[] = [
  {
    id: "1",
    name: "Marketing Dashboard API",
    keyPrefix: "mk_live_123...",
    permissions: ["read:campaigns", "read:analytics", "write:leads"],
    status: "active",
    lastUsed: "2024-01-23T10:30:00Z",
    usageCount: 12450,
    createdAt: "2024-01-01T00:00:00Z",
    ipWhitelist: ["192.168.1.100", "10.0.0.50"]
  },
  {
    id: "2",
    name: "Mobile App Integration",
    keyPrefix: "mk_live_456...",
    permissions: ["read:forms", "write:submissions", "read:media"],
    status: "active",
    lastUsed: "2024-01-23T11:15:00Z",
    usageCount: 8920,
    createdAt: "2024-01-15T00:00:00Z"
  },
  {
    id: "3",
    name: "Analytics Export Key",
    keyPrefix: "mk_live_789...",
    permissions: ["read:analytics", "read:reports"],
    status: "expired",
    lastUsed: "2024-01-10T09:20:00Z",
    usageCount: 2340,
    createdAt: "2023-12-01T00:00:00Z",
    expiresAt: "2024-01-20T00:00:00Z"
  }
];

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>(mockIntegrations);
  const [webhooks, setWebhooks] = useState<Webhook[]>(mockWebhooks);
  const [apiKeys, setAPIKeys] = useState<APIKey[]>(mockAPIKeys);
  const [activeTab, setActiveTab] = useState<"integrations" | "webhooks" | "api-keys" | "marketplace">("integrations");
  const [searchQuery, setSearchQuery] = useState("");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
      case "active": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "disconnected":
      case "inactive": return <XCircle className="h-4 w-4 text-gray-600" />;
      case "error": return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "pending": return <Clock className="h-4 w-4 text-yellow-600" />;
      case "expired":
      case "revoked": return <XCircle className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "crm": return <Users className="h-4 w-4" />;
      case "analytics": return <BarChart3 className="h-4 w-4" />;
      case "ecommerce": return <ShoppingCart className="h-4 w-4" />;
      case "email": return <Mail className="h-4 w-4" />;
      case "social": return <MessageSquare className="h-4 w-4" />;
      case "automation": return <Zap className="h-4 w-4" />;
      case "storage": return <Database className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  const filteredIntegrations = integrations.filter(integration =>
    integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    integration.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integrations & API</h1>
          <p className="text-muted-foreground">
            Connect with third-party services and manage API access for your marketing platform.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Code className="h-4 w-4 mr-2" />
            API Docs
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Integration
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b">
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === "integrations" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("integrations")}
        >
          Integrations
        </button>
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === "webhooks" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("webhooks")}
        >
          Webhooks
        </button>
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === "api-keys" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("api-keys")}
        >
          API Keys
        </button>
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === "marketplace" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("marketplace")}
        >
          Marketplace
        </button>
      </div>

      {/* Integrations Tab */}
      {activeTab === "integrations" && (
        <>
          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search integrations..."
                className="w-full pl-10 pr-4 py-2 border rounded-md bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select className="px-3 py-2 border rounded-md bg-background">
              <option value="all">All Categories</option>
              <option value="crm">CRM</option>
              <option value="analytics">Analytics</option>
              <option value="ecommerce">E-commerce</option>
              <option value="email">Email</option>
              <option value="social">Social</option>
              <option value="automation">Automation</option>
            </select>
            <select className="px-3 py-2 border rounded-md bg-background">
              <option value="all">All Status</option>
              <option value="connected">Connected</option>
              <option value="disconnected">Disconnected</option>
              <option value="error">Error</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {/* Integration Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Integrations</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {integrations.filter(i => i.status === "connected").length}
                </div>
                <p className="text-xs text-green-600">
                  {integrations.filter(i => i.status === "connected").length} of {integrations.length} connected
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Data Synced</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {integrations.reduce((sum, i) => sum + (i.syncedRecords || 0), 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Records synchronized
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sync Errors</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {integrations.reduce((sum, i) => sum + (i.errorCount || 0), 0)}
                </div>
                <p className="text-xs text-red-600">
                  Require attention
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Webhooks Active</CardTitle>
                <Webhook className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {integrations.filter(i => i.webhooksEnabled).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Real-time data sync
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Integrations List */}
          <div className="space-y-4">
            {filteredIntegrations.map((integration) => (
              <Card key={integration.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        {getCategoryIcon(integration.category)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{integration.name}</h3>
                          {getStatusIcon(integration.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                            integration.status === "connected" 
                              ? "bg-green-100 text-green-700"
                              : integration.status === "error"
                                ? "bg-red-100 text-red-700"
                                : integration.status === "pending"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-gray-100 text-gray-700"
                          }`}>
                            {integration.status}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-sm mt-1">{integration.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="capitalize">{integration.category}</span>
                          <span>{integration.provider}</span>
                          {integration.lastSync && (
                            <span>Last sync: {new Date(integration.lastSync).toLocaleDateString()}</span>
                          )}
                          {integration.syncFrequency && (
                            <span className="capitalize">{integration.syncFrequency} sync</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {integration.status === "connected" && (
                        <Button size="sm" variant="outline">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Sync Now
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                      {integration.status === "disconnected" && (
                        <Button size="sm">
                          <Play className="h-4 w-4 mr-2" />
                          Connect
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Integration Details */}
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <h4 className="font-medium mb-2">Data Points</h4>
                      <div className="flex flex-wrap gap-1">
                        {integration.dataPoints.map((point, index) => (
                          <span key={index} className="px-2 py-1 bg-muted rounded text-xs">
                            {point}
                          </span>
                        ))}
                      </div>
                    </div>

                    {integration.syncedRecords && (
                      <div>
                        <h4 className="font-medium mb-2">Sync Stats</h4>
                        <div className="text-sm space-y-1">
                          <div>Records: {integration.syncedRecords.toLocaleString()}</div>
                          {integration.errorCount && integration.errorCount > 0 && (
                            <div className="text-red-600">Errors: {integration.errorCount}</div>
                          )}
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="font-medium mb-2">Features</h4>
                      <div className="text-sm space-y-1">
                        <div className="flex items-center gap-2">
                          <Webhook className="h-3 w-3" />
                          <span>Webhooks: {integration.webhooksEnabled ? "Enabled" : "Disabled"}</span>
                        </div>
                        {integration.syncFrequency && (
                          <div className="flex items-center gap-2">
                            <RefreshCw className="h-3 w-3" />
                            <span className="capitalize">Sync: {integration.syncFrequency}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Error State */}
                  {integration.status === "error" && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 text-red-800">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="font-medium">Integration Error</span>
                      </div>
                      <p className="text-sm text-red-700 mt-1">
                        Unable to sync data. Please check your API credentials and try reconnecting.
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" variant="outline">
                          View Error Details
                        </Button>
                        <Button size="sm">
                          Reconnect
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

      {/* Webhooks Tab */}
      {activeTab === "webhooks" && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              Configure webhooks to receive real-time notifications when events occur.
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Webhook
            </Button>
          </div>

          <div className="space-y-4">
            {webhooks.map((webhook) => (
              <Card key={webhook.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{webhook.name}</h3>
                        {getStatusIcon(webhook.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                          webhook.status === "active" 
                            ? "bg-green-100 text-green-700"
                            : webhook.status === "error"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                        }'}>
                          {webhook.status}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {webhook.method} {webhook.url}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>{webhook.events.length} events</span>
                        {webhook.lastTriggered && (
                          <span>Last triggered: {new Date(webhook.lastTriggered).toLocaleString()}</span>
                        )}
                        <span>Success: {webhook.successCount}</span>
                        {webhook.errorCount > 0 && (
                          <span className="text-red-600">Errors: {webhook.errorCount}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        Test
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      {webhook.status === "active" ? (
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

                  {/* Webhook Details */}
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <h4 className="font-medium mb-2">Events</h4>
                      <div className="space-y-1">
                        {webhook.events.map((event, index) => (
                          <div key={index} className="text-sm bg-muted px-2 py-1 rounded">
                            {event}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Performance</h4>
                      <div className="text-sm space-y-1">
                        <div>Success Rate: {Math.round((webhook.successCount / (webhook.successCount + webhook.errorCount)) * 100) || 0}%</div>
                        <div>Total Requests: {webhook.successCount + webhook.errorCount}</div>
                        <div>Avg Response Time: ~200ms</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Retry Policy</h4>
                      <div className="text-sm space-y-1">
                        <div>Enabled: {webhook.retryPolicy.enabled ? "Yes" : "No"}</div>
                        <div>Max Retries: {webhook.retryPolicy.maxRetries}</div>
                        <div>Delay: {webhook.retryPolicy.retryDelay}ms</div>
                      </div>
                    </div>
                  </div>

                  {/* Error State */}
                  {webhook.status === "error" && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 text-red-800">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="font-medium">Webhook Failing</span>
                      </div>
                      <p className="text-sm text-red-700 mt-1">
                        Multiple failed delivery attempts detected. Check endpoint availability.
                      </p>
                      <Button size="sm" className="mt-2">
                        View Error Logs
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* API Keys Tab */}
      {activeTab === "api-keys" && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              Manage API keys for programmatic access to your marketing platform.
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Generate API Key
            </Button>
          </div>

          <div className="space-y-4">
            {apiKeys.map((apiKey) => (
              <Card key={apiKey.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{apiKey.name}</h3>
                        {getStatusIcon(apiKey.status)}
                        <span className={'px-2 py-1 rounded-full text-xs font-medium capitalize ${
                          apiKey.status === "active" 
                            ? "bg-green-100 text-green-700"
                            : apiKey.status === "expired"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                        }'}>
                          {apiKey.status}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1 font-mono">
                        {apiKey.keyPrefix}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Created: {new Date(apiKey.createdAt).toLocaleDateString()}</span>
                        {apiKey.lastUsed && (
                          <span>Last used: {new Date(apiKey.lastUsed).toLocaleDateString()}</span>
                        )}
                        <span>Usage: {apiKey.usageCount.toLocaleString()} requests</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Revoke
                      </Button>
                    </div>
                  </div>

                  {/* API Key Details */}
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <h4 className="font-medium mb-2">Permissions</h4>
                      <div className="space-y-1">
                        {apiKey.permissions.map((permission, index) => (
                          <div key={index} className="text-sm bg-muted px-2 py-1 rounded">
                            {permission}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Usage Stats</h4>
                      <div className="text-sm space-y-1">
                        <div>Total Requests: {apiKey.usageCount.toLocaleString()}</div>
                        <div>Rate Limit: 1000/hour</div>
                        <div>Current Usage: 245/hour</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Security</h4>
                      <div className="text-sm space-y-1">
                        {apiKey.expiresAt && (
                          <div>Expires: {new Date(apiKey.expiresAt).toLocaleDateString()}</div>
                        )}
                        {apiKey.ipWhitelist && apiKey.ipWhitelist.length > 0 ? (
                          <div>IP Restricted: {apiKey.ipWhitelist.length} IPs</div>
                        ) : (
                          <div>IP Restriction: None</div>
                        )}
                        <div>HTTPS Required: Yes</div>
                      </div>
                    </div>
                  </div>

                  {/* Expiry Warning */}
                  {apiKey.status === "expired" && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 text-red-800">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="font-medium">API Key Expired</span>
                      </div>
                      <p className="text-sm text-red-700 mt-1">
                        This API key has expired and can no longer be used for authentication.
                      </p>
                      <Button size="sm" className="mt-2">
                        Generate New Key
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Marketplace Tab */}
      {activeTab === "marketplace" && (
        <>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Discover and install pre-built integrations from our marketplace.
            </p>
            <Button>
              <ExternalLink className="h-4 w-4 mr-2" />
              Browse Marketplace
            </Button>
          </div>

          {/* Popular Integrations */}
          <Card>
            <CardHeader>
              <CardTitle>Popular Integrations</CardTitle>
              <CardDescription>Most requested integrations by users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  { name: "Zapier", description: "Connect with 5000+ apps", category: "automation", rating: 4.8 },
                  { name: "Stripe", description: "Payment processing and billing", category: "ecommerce", rating: 4.9 },
                  { name: "Slack", description: "Team notifications and alerts", category: "communication", rating: 4.7 },
                  { name: "Facebook Ads", description: "Social media advertising", category: "social", rating: 4.6 },
                  { name: "Google Sheets", description: "Spreadsheet data sync", category: "storage", rating: 4.5 },
                  { name: "Twilio", description: "SMS and voice communications", category: "communication", rating: 4.8 }
                ].map((integration, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">{integration.name}</h4>
                      <div className="flex items-center gap-1 text-xs">
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        {integration.rating}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{integration.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-muted px-2 py-1 rounded capitalize">
                        {integration.category}
                      </span>
                      <Button size="sm">Install</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}