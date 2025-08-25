"use client";

import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Search,
  Filter,
  SortAsc,
  MoreVertical,
  Puzzle,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  ExternalLink,
  Download,
  Upload,
  Key,
  Shield,
  Zap,
  Database,
  Cloud,
  Mail,
  MessageSquare,
  CreditCard,
  ShoppingCart,
  Calendar,
  Users,
  BarChart3,
  FileText,
  Camera,
  Phone,
  Globe,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Archive,
  Star,
  StarOff,
  Info,
  HelpCircle,
  Wrench,
  RotateCcw,
  Play,
  Pause,
  StopCircle,
  Activity,
  TrendingUp,
  TrendingDown,
  Circle,
  Check,
  X,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  ChevronDown,
  Link,
  Link2,
  Unlink,
  Wifi,
  WifiOff,
  Server,
  HardDrive,
  Cpu,
  Memory,
  HardDriveIcon,
  Network,
  Bluetooth,
  BluetoothOff,
  Smartphone,
  Monitor,
  Tablet,
  Laptop,
  Desktop,
  Printer,
  Scanner,
  Fax,
  Projector,
  Speaker,
  Headphones,
  Microphone,
  Webcam,
  Keyboard,
  Mouse,
  Gamepad2,
  Watch,
  Heart,
  Activity as ActivityIcon
} from 'lucide-react';
import { cn } from '@utils';

// Sample data
const INTEGRATIONS = [
  {
    id: 1,
    name: "Stripe Payment",
    category: "payment",
    status: "connected",
    description: "Process payments and manage subscriptions",
    icon: CreditCard,
    color: "text-blue-600",
    lastSync: "2024-01-15T10:30:00Z",
    syncStatus: "success",
    apiCalls: 1247,
    errorRate: 0.1,
    isActive: true,
    isVerified: true,
    version: "2.1.0",
    provider: "Stripe",
    webhookUrl: "https://api.stripe.com/webhooks",
    apiKey: "sk_live_...",
    features: ["Payments", "Subscriptions", "Refunds", "Analytics"],
    settings: {
      webhookEnabled: true,
      autoSync: true,
      sandboxMode: false
    }
  },
  {
    id: 2,
    name: "Slack Notifications",
    category: "communication",
    status: "connected",
    description: "Send notifications and alerts to Slack channels",
    icon: MessageSquare,
    color: "text-purple-600",
    lastSync: "2024-01-15T09:15:00Z",
    syncStatus: "success",
    apiCalls: 892,
    errorRate: 0.0,
    isActive: true,
    isVerified: true,
    version: "1.5.2",
    provider: "Slack",
    webhookUrl: "https://hooks.slack.com/services/...",
    apiKey: "xoxb-...",
    features: ["Notifications", "Alerts", "Team Chat", "File Sharing"],
    settings: {
      webhookEnabled: true,
      autoSync: true,
      notificationsEnabled: true
    }
  },
  {
    id: 3,
    name: "Google Calendar",
    category: "calendar",
    status: "connected",
    description: "Sync events and manage scheduling",
    icon: Calendar,
    color: "text-green-600",
    lastSync: "2024-01-15T08:45:00Z",
    syncStatus: "success",
    apiCalls: 567,
    errorRate: 0.2,
    isActive: true,
    isVerified: true,
    version: "3.0.1",
    provider: "Google",
    webhookUrl: "https://calendar.google.com/api/...",
    apiKey: "AIza...",
    features: ["Event Sync", "Scheduling", "Reminders", "Calendar Sharing"],
    settings: {
      webhookEnabled: true,
      autoSync: true,
      twoWaySync: true
    }
  },
  {
    id: 4,
    name: "QuickBooks Accounting",
    category: "accounting",
    status: "disconnected",
    description: "Sync financial data and manage accounting",
    icon: FileText,
    color: "text-orange-600",
    lastSync: "2024-01-10T14:20:00Z",
    syncStatus: "error",
    apiCalls: 0,
    errorRate: 0.0,
    isActive: false,
    isVerified: false,
    version: "2.0.0",
    provider: "Intuit",
    webhookUrl: "",
    apiKey: "",
    features: ["Invoicing", "Expense Tracking", "Financial Reports", "Tax Preparation"],
    settings: {
      webhookEnabled: false,
      autoSync: false,
      sandboxMode: true
    }
  },
  {
    id: 5,
    name: "Mailchimp Marketing",
    category: "marketing",
    status: "connected",
    description: "Manage email campaigns and subscriber lists",
    icon: Mail,
    color: "text-yellow-600",
    lastSync: "2024-01-15T11:00:00Z",
    syncStatus: "success",
    apiCalls: 234,
    errorRate: 0.0,
    isActive: true,
    isVerified: true,
    version: "1.8.3",
    provider: "Mailchimp",
    webhookUrl: "https://us1.api.mailchimp.com/...",
    apiKey: "us1-...",
    features: ["Email Campaigns", "Subscriber Lists", "Automation", "Analytics"],
    settings: {
      webhookEnabled: true,
      autoSync: true,
      doubleOptIn: true
    }
  },
  {
    id: 6,
    name: "Shopify E-commerce",
    category: "ecommerce",
    status: "pending",
    description: "Connect your online store and sync products",
    icon: ShoppingCart,
    color: "text-green-600",
    lastSync: null,
    syncStatus: "pending",
    apiCalls: 0,
    errorRate: 0.0,
    isActive: false,
    isVerified: false,
    version: "1.2.0",
    provider: "Shopify",
    webhookUrl: "",
    apiKey: "",
    features: ["Product Sync", "Order Management", "Inventory", "Customer Data"],
    settings: {
      webhookEnabled: false,
      autoSync: false,
      sandboxMode: true
    }
  }
];

const CATEGORIES = [
  { id: "payment", name: "Payment", icon: CreditCard, color: "text-blue-600" },
  { id: "communication", name: "Communication", icon: MessageSquare, color: "text-purple-600" },
  { id: "calendar", name: "Calendar", icon: Calendar, color: "text-green-600" },
  { id: "accounting", name: "Accounting", icon: FileText, color: "text-orange-600" },
  { id: "marketing", name: "Marketing", icon: Mail, color: "text-yellow-600" },
  { id: "ecommerce", name: "E-commerce", icon: ShoppingCart, color: "text-green-600" }
];

const API_ENDPOINTS = [
  {
    id: 1,
    name: "Payment Processing",
    endpoint: "/api/payments",
    method: "POST",
    status: "active",
    calls: 1247,
    errors: 1,
    avgResponseTime: 245
  },
  {
    id: 2,
    name: "User Authentication",
    endpoint: "/api/auth",
    method: "POST",
    status: "active",
    calls: 892,
    errors: 0,
    avgResponseTime: 180
  },
  {
    id: 3,
    name: "Data Sync",
    endpoint: "/api/sync",
    method: "GET",
    status: "active",
    calls: 567,
    errors: 2,
    avgResponseTime: 320
  }
];

export default function IntegrationManager() {
  const [activeTab, setActiveTab] = useState("integrations");
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showCreateIntegration, setShowCreateIntegration] = useState(false);
  const [showApiKeys, setShowApiKeys] = useState(false);

  const filteredIntegrations = useMemo(() => {
    return INTEGRATIONS.filter(integration => {
      const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           integration.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           integration.provider.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || integration.status === statusFilter;
      const matchesCategory = categoryFilter === "all" || integration.category === categoryFilter;
      
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [searchQuery, statusFilter, categoryFilter]);

  const getStatusColor = (status) => {
    switch (status) {
      case "connected": return "bg-green-500";
      case "disconnected": return "bg-red-500";
      case "pending": return "bg-yellow-500";
      case "error": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getSyncStatusColor = (status) => {
    switch (status) {
      case "success": return "text-green-600";
      case "error": return "text-red-600";
      case "pending": return "text-yellow-600";
      default: return "text-gray-600";
    }
  };

  const getCategoryIcon = (category) => {
    const cat = CATEGORIES.find(c => c.id === category);
    return cat ? cat.icon : Puzzle;
  };

  const getCategoryColor = (category) => {
    const cat = CATEGORIES.find(c => c.id === category);
    return cat ? cat.color : "text-gray-600";
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "Never";
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const handleConnect = (integration) => {
    // Handle connection logic
    console.log("Connecting to:", integration.name);
  };

  const handleDisconnect = (integration) => {
    // Handle disconnection logic
    console.log("Disconnecting from:", integration.name);
  };

  if (selectedIntegration) {
    return (
      <div className="flex h-[calc(100vh-120px)] -mx-4 -my-6 lg:-mx-8">
        {/* Integration List */}
        <div className="w-96 border-r bg-muted/30">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Integrations</h2>
              <Button size="sm" onClick={() => setShowCreateIntegration(true)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search integrations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <ScrollArea className="h-full">
            <div className="p-2 space-y-2">
              {filteredIntegrations.map((integration) => (
                <div
                  key={integration.id}
                  className={cn(
                    "p-3 rounded-lg cursor-pointer transition-colors",
                    selectedIntegration?.id === integration.id
                      ? "bg-background border shadow-sm"
                      : "hover:bg-background/50"
                  )}
                  onClick={() => setSelectedIntegration(integration)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{integration.name}</p>
                      <p className="text-xs text-muted-foreground">{integration.provider}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {integration.isVerified && <CheckCircle className="h-3 w-3 text-green-500" />}
                      {integration.isActive && <Activity className="h-3 w-3 text-blue-500" />}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {integration.category}
                    </Badge>
                    <div className={cn("w-2 h-2 rounded-full", getStatusColor(integration.status))} />
                    <span className="text-xs text-muted-foreground">{integration.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Integration Details */}
        <div className="flex-1 flex flex-col">
          {/* Integration Header */}
          <div className="flex-shrink-0 p-6 border-b">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className={cn("p-2 rounded-lg", selectedIntegration.color.replace("text-", "bg-").replace("-600", "-100"))}>
                    <selectedIntegration.icon className={cn("h-6 w-6", selectedIntegration.color)} />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold">{selectedIntegration.name}</h1>
                    <p className="text-sm text-muted-foreground">{selectedIntegration.provider}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {selectedIntegration.category}
                  </Badge>
                  <div className={cn("w-3 h-3 rounded-full", getStatusColor(selectedIntegration.status))} />
                  {selectedIntegration.isVerified && <Badge className="text-xs">Verified</Badge>}
                </div>
                <p className="text-muted-foreground">{selectedIntegration.description}</p>
              </div>
              <div className="flex items-center gap-2">
                {selectedIntegration.isActive ? (
                  <Button variant="outline" size="sm" onClick={() => handleDisconnect(selectedIntegration)}>
                    <Unlink className="h-4 w-4 mr-2" />
                    Disconnect
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => handleConnect(selectedIntegration)}>
                    <Link className="h-4 w-4 mr-2" />
                    Connect
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Sync Now
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Archive className="h-4 w-4 mr-2" />
                      Archive
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Version:</span>
                <p className="font-medium">{selectedIntegration.version}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Last Sync:</span>
                <p className="font-medium">{formatTime(selectedIntegration.lastSync)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">API Calls:</span>
                <p className="font-medium">{selectedIntegration.apiCalls.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Error Rate:</span>
                <p className="font-medium">{selectedIntegration.errorRate}%</p>
              </div>
            </div>
          </div>

          {/* Integration Content */}
          <div className="flex-1 p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList className="mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="api">API</TabsTrigger>
                <TabsTrigger value="logs">Logs</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Features */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Features</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {selectedIntegration.features.map((feature) => (
                          <Badge key={feature} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Status */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Connection Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Status</span>
                          <Badge variant={selectedIntegration.isActive ? "default" : "secondary"}>
                            {selectedIntegration.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Auto Sync</span>
                          <Switch checked={selectedIntegration.settings.autoSync} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Webhook Enabled</span>
                          <Switch checked={selectedIntegration.settings.webhookEnabled} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* API Keys */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        API Configuration
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowApiKeys(!showApiKeys)}
                        >
                          {showApiKeys ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm text-muted-foreground">API Key:</span>
                          <p className="text-sm font-mono bg-muted p-2 rounded mt-1">
                            {showApiKeys ? selectedIntegration.apiKey : "••••••••••••••••"}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Webhook URL:</span>
                          <p className="text-sm font-mono bg-muted p-2 rounded mt-1">
                            {selectedIntegration.webhookUrl || "Not configured"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Performance */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>API Calls (24h)</span>
                          <span className="font-medium">{selectedIntegration.apiCalls.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Error Rate</span>
                          <span className={cn("font-medium", selectedIntegration.errorRate > 1 ? "text-red-600" : "text-green-600")}>
                            {selectedIntegration.errorRate}%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Last Sync</span>
                          <span className="font-medium">{formatTime(selectedIntegration.lastSync)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="flex-1">
                <div className="text-center py-12">
                  <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Integration Settings</h3>
                  <p className="text-muted-foreground mb-4">
                    Configure advanced settings and preferences for this integration.
                  </p>
                  <Button>
                    <Edit className="h-4 w-4 mr-2" />
                    Configure Settings
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="api" className="flex-1">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">API Endpoints</h3>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Endpoint
                    </Button>
                  </div>
                  {API_ENDPOINTS.map((endpoint) => (
                    <Card key={endpoint.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{endpoint.name}</p>
                            <p className="text-sm text-muted-foreground font-mono">{endpoint.method} {endpoint.endpoint}</p>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-muted-foreground">{endpoint.calls} calls</span>
                            <span className="text-muted-foreground">{endpoint.errors} errors</span>
                            <span className="text-muted-foreground">{endpoint.avgResponseTime}ms</span>
                            <Badge variant={endpoint.status === "active" ? "default" : "secondary"}>
                              {endpoint.status}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="logs" className="flex-1">
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Integration Logs</h3>
                  <p className="text-muted-foreground mb-4">
                    View detailed logs and activity history for this integration.
                  </p>
                  <Button>
                    <Eye className="h-4 w-4 mr-2" />
                    View Logs
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] -mx-4 -my-6 lg:-mx-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-b">
          <div>
            <h1 className="text-2xl font-bold">Integrations</h1>
            <p className="text-muted-foreground">Connect and manage third-party services and APIs</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync All
            </Button>
            <Button onClick={() => setShowCreateIntegration(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Integration
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex-shrink-0 p-6 border-b">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search integrations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter("all")}>All</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("connected")}>Connected</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("disconnected")}>Disconnected</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("pending")}>Pending</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <SortAsc className="h-4 w-4 mr-2" />
                  Category
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setCategoryFilter("all")}>All Categories</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCategoryFilter("payment")}>Payment</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCategoryFilter("communication")}>Communication</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCategoryFilter("calendar")}>Calendar</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCategoryFilter("accounting")}>Accounting</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCategoryFilter("marketing")}>Marketing</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCategoryFilter("ecommerce")}>E-commerce</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex-shrink-0 px-6 pt-4">
          <TabsList>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="api">API Management</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <TabsContent value={activeTab} className="h-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredIntegrations.map((integration) => (
                <Card key={integration.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedIntegration(integration)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-lg", integration.color.replace("text-", "bg-").replace("-600", "-100"))}>
                          <integration.icon className={cn("h-5 w-5", integration.color)} />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{integration.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{integration.provider}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {integration.isVerified && <CheckCircle className="h-4 w-4 text-green-500" />}
                        {integration.isActive && <Activity className="h-4 w-4 text-blue-500" />}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{integration.description}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {integration.category}
                      </Badge>
                      <div className={cn("w-2 h-2 rounded-full", getStatusColor(integration.status))} />
                      <span className="text-xs text-muted-foreground">{integration.status}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>API Calls: {integration.apiCalls.toLocaleString()}</span>
                      <span>v{integration.version}</span>
                    </div>
                    <div className="flex gap-2">
                      {integration.isActive ? (
                        <Button variant="outline" size="sm" className="flex-1" onClick={(e) => { e.stopPropagation(); handleDisconnect(integration); }}>
                          <Unlink className="h-4 w-4 mr-2" />
                          Disconnect
                        </Button>
                      ) : (
                        <Button size="sm" className="flex-1" onClick={(e) => { e.stopPropagation(); handleConnect(integration); }}>
                          <Link className="h-4 w-4 mr-2" />
                          Connect
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Archive className="h-4 w-4 mr-2" />
                            Archive
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {filteredIntegrations.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <Puzzle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No integrations found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery ? "Try adjusting your search criteria." : "Connect your first third-party service to get started."}
                  </p>
                  <Button onClick={() => setShowCreateIntegration(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Integration
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
