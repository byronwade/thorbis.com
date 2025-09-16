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
  Zap,
  Plus,
  Play,
  Pause,
  Settings,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Clock,
  Activity,
  TrendingUp,
  Users,
  DollarSign,
  Download,
  Upload,
  Code,
  Database,
  Globe,
  Mail,
  MessageSquare,
  Share2,
  BarChart3,
  Calendar,
  FileText,
  CreditCard,
  Slack,
  Target,
  Search,
  Filter,
  GitBranch,
  RefreshCw,
  Eye,
  ArrowRight,
  Workflow
} from "lucide-react";
import { Button } from '@/components/ui/button';


// Mock Zapier-style integration data
interface ZapWorkflow {
  id: string;
  name: string;
  description: string;
  trigger: {
    app: string;
    event: string;
    icon: string;
  };
  actions: {
    app: string;
    action: string;
    icon: string;
  }[];
  status: 'active' | 'paused' | 'error';
  runs: number;
  success_rate: number;
  last_run: string;
  created_date: string;
  folder: string;
}

interface IntegrationApp {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'marketing' | 'crm' | 'ecommerce' | 'productivity' | 'analytics';
  triggers: string[];
  actions: string[];
  status: 'connected' | 'available' | 'premium';
  usage_count: number;
  rating: number;
}

interface WorkflowExecution {
  id: string;
  workflow_id: string;
  workflow_name: string;
  status: 'success' | 'failed' | 'running';
  started_at: string;
  completed_at: string;
  duration: number;
  steps_completed: number;
  total_steps: number;
  error_message?: string;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  trigger_app: string;
  action_apps: string[];
  usage_count: number;
  rating: number;
  is_premium: boolean;
}

const mockWorkflows: ZapWorkflow[] = [
  {
    id: "1",
    name: "New Lead to CRM & Email",
    description: "Add new form submissions to CRM and send welcome email",
    trigger: {
      app: "Website Forms",
      event: "New Form Submission",
      icon: "FileText"
    },
    actions: [
      {
        app: "HubSpot",
        action: "Create Contact",
        icon: "Users"
      },
      {
        app: "Mailchimp",
        action: "Add to Email List",
        icon: "Mail"
      }
    ],
    status: "active",
    runs: 1234,
    success_rate: 98.5,
    last_run: "2025-01-03 14:30:00",
    created_date: "2024-12-15",
    folder: "Lead Management"
  },
  {
    id: "2",
    name: "Social Post to Analytics",
    description: "Track social media posts in analytics dashboard",
    trigger: {
      app: "Instagram",
      event: "New Post Published",
      icon: "Share2"
    },
    actions: [
      {
        app: "Google Analytics",
        action: "Create Event",
        icon: "BarChart3"
      },
      {
        app: "Slack",
        action: "Send Notification",
        icon: "MessageSquare"
      }
    ],
    status: "active",
    runs: 567,
    success_rate: 94.2,
    last_run: "2025-01-03 13:45:00",
    created_date: "2024-12-20",
    folder: "Social Media"
  },
  {
    id: "3",
    name: "Campaign Performance Alert",
    description: "Alert team when campaign performance drops",
    trigger: {
      app: "Google Ads",
      event: "Low CTR Alert",
      icon: "Target"
    },
    actions: [
      {
        app: "Slack",
        action: "Send Channel Message",
        icon: "MessageSquare"
      }
    ],
    status: "paused",
    runs: 89,
    success_rate: 87.6,
    last_run: "2025-01-02 16:20:00",
    created_date: "2025-01-01",
    folder: "Alerts"
  }
];

const mockApps: IntegrationApp[] = [
  {
    id: "1",
    name: "HubSpot",
    description: "CRM and marketing automation platform",
    icon: "Users",
    category: "crm",
    triggers: ["New Contact", "Deal Updated", "Form Submission"],
    actions: ["Create Contact", "Update Deal", "Send Email"],
    status: "connected",
    usage_count: 234,
    rating: 4.8
  },
  {
    id: "2",
    name: "Mailchimp",
    description: "Email marketing and automation",
    icon: "Mail",
    category: "marketing",
    triggers: ["New Subscriber", "Campaign Sent", "List Updated"],
    actions: ["Add to List", "Send Campaign", "Update Contact"],
    status: "connected",
    usage_count: 189,
    rating: 4.6
  },
  {
    id: "3",
    name: "Shopify",
    description: "E-commerce platform",
    icon: "CreditCard",
    category: "ecommerce",
    triggers: ["New Order", "Customer Created", "Product Updated"],
    actions: ["Create Product", "Update Order", "Send Notification"],
    status: "available",
    usage_count: 156,
    rating: 4.7
  },
  {
    id: "4",
    name: "Google Analytics",
    description: "Web analytics and reporting",
    icon: "BarChart3",
    category: "analytics",
    triggers: ["Goal Completed", "Custom Event", "Traffic Spike"],
    actions: ["Create Event", "Send Report", "Set Goal"],
    status: "connected",
    usage_count: 312,
    rating: 4.5
  }
];

const mockExecutions: WorkflowExecution[] = [
  {
    id: "1",
    workflow_id: "1",
    workflow_name: "New Lead to CRM & Email",
    status: "success",
    started_at: "2025-01-03 14:30:00",
    completed_at: "2025-01-03 14:30:15",
    duration: 15,
    steps_completed: 3,
    total_steps: 3
  },
  {
    id: "2", 
    workflow_id: "2",
    workflow_name: "Social Post to Analytics",
    status: "success",
    started_at: "2025-01-03 13:45:00",
    completed_at: "2025-01-03 13:45:08",
    duration: 8,
    steps_completed: 2,
    total_steps: 2
  },
  {
    id: "3",
    workflow_id: "1",
    workflow_name: "New Lead to CRM & Email", 
    status: "failed",
    started_at: "2025-01-03 12:20:00",
    completed_at: "2025-01-03 12:20:12",
    duration: 12,
    steps_completed: 1,
    total_steps: 3,
    error_message: "HubSpot API rate limit exceeded"
  }
];

const mockTemplates: WorkflowTemplate[] = [
  {
    id: "1",
    name: "Lead Nurturing Sequence",
    description: "Automatically nurture new leads with email sequence",
    category: "Lead Management",
    trigger_app: "Forms",
    action_apps: ["CRM", "Email"],
    usage_count: 567,
    rating: 4.8,
    is_premium: false
  },
  {
    id: "2",
    name: "E-commerce Order Processing",
    description: "Process new orders and update inventory",
    category: "E-commerce",
    trigger_app: "Shopify",
    action_apps: ["Inventory", "Email", "Accounting"],
    usage_count: 234,
    rating: 4.6,
    is_premium: true
  }
];

export default function ZapierIntegrationsPage() {
  const [activeTab, setActiveTab] = useState("workflows");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'success':
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'paused':
      case 'running':
        return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'error':
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-neutral-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-green-400/20 text-green-400 border-green-400/30",
      success: "bg-green-400/20 text-green-400 border-green-400/30",
      connected: "bg-green-400/20 text-green-400 border-green-400/30",
      paused: "bg-yellow-400/20 text-yellow-400 border-yellow-400/30",
      running: "bg-blue-400/20 text-blue-400 border-blue-400/30",
      error: "bg-red-400/20 text-red-400 border-red-400/30",
      failed: "bg-red-400/20 text-red-400 border-red-400/30",
      available: "bg-neutral-400/20 text-neutral-400 border-neutral-400/30",
      premium: "bg-purple-400/20 text-purple-400 border-purple-400/30"
    };
    
    return (
      <Badge className={'${variants[status as keyof typeof variants]} border'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getAppIcon = (iconName: string) => {
    const iconMap = {
      FileText: FileText,
      Users: Users,
      Mail: Mail,
      Share2: Share2,
      BarChart3: BarChart3,
      MessageSquare: MessageSquare,
      Target: Target,
      CreditCard: CreditCard
    };
    
    const IconComponent = iconMap[iconName as keyof typeof iconMap] || Code;
    return <IconComponent className="h-4 w-4" />;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Advanced Integrations</h1>
          <p className="text-neutral-400 mt-2">
            Zapier-style workflow automation and app integrations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Workflows
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Workflow
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Active Workflows</p>
                <p className="text-2xl font-bold text-white">127</p>
              </div>
              <Workflow className="h-8 w-8 text-blue-400" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3 text-green-400" />
              <span className="text-xs text-green-400">+15% this week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Monthly Executions</p>
                <p className="text-2xl font-bold text-white">45,678</p>
              </div>
              <Activity className="h-8 w-8 text-green-400" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <Activity className="h-3 w-3 text-green-400" />
              <span className="text-xs text-green-400">96.8% success rate</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Connected Apps</p>
                <p className="text-2xl font-bold text-white">34</p>
              </div>
              <Globe className="h-8 w-8 text-purple-400" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <Globe className="h-3 w-3 text-purple-400" />
              <span className="text-xs text-purple-400">12 new this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Time Saved</p>
                <p className="text-2xl font-bold text-white">284hrs</p>
              </div>
              <Clock className="h-8 w-8 text-orange-400" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <Clock className="h-3 w-3 text-orange-400" />
              <span className="text-xs text-orange-400">Per month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="apps">Apps</TabsTrigger>
          <TabsTrigger value="executions">Executions</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Active Workflows</CardTitle>
                  <CardDescription>Automation workflows and their status</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Search className="h-4 w-4" />
                    Search
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockWorkflows.map((workflow) => (
                  <div key={workflow.id} className="border border-neutral-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          {getStatusIcon(workflow.status)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-white">{workflow.name}</p>
                            {getStatusBadge(workflow.status)}
                          </div>
                          <p className="text-sm text-neutral-400">{workflow.description}</p>
                          <p className="text-xs text-neutral-500">Folder: {workflow.folder}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Settings className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3 p-3 bg-neutral-900 rounded-lg">
                      <div className="flex items-center gap-2 px-3 py-1 bg-neutral-800 rounded">
                        {getAppIcon(workflow.trigger.icon)}
                        <span className="text-sm text-white">{workflow.trigger.app}</span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-neutral-500" />
                      {workflow.actions.map((action, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="flex items-center gap-2 px-3 py-1 bg-neutral-800 rounded">
                            {getAppIcon(action.icon)}
                            <span className="text-sm text-white">{action.app}</span>
                          </div>
                          {index < workflow.actions.length - 1 && (
                            <ArrowRight className="h-4 w-4 text-neutral-500" />
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-neutral-400">Runs:</p>
                        <p className="text-white font-medium">{workflow.runs.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-neutral-400">Success Rate:</p>
                        <p className="text-white font-medium">{workflow.success_rate}%</p>
                      </div>
                      <div>
                        <p className="text-neutral-400">Last Run:</p>
                        <p className="text-white font-medium">{workflow.last_run}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {workflow.status === 'active' ? (
                          <Button size="sm" variant="outline" className="gap-1">
                            <Pause className="h-3 w-3" />
                            Pause
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" className="gap-1">
                            <Play className="h-3 w-3" />
                            Resume
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="apps" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integration Apps</CardTitle>
              <CardDescription>Available apps and their integration capabilities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockApps.map((app) => (
                  <div key={app.id} className="border border-neutral-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center">
                          {getAppIcon(app.icon)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-white">{app.name}</p>
                            {getStatusBadge(app.status)}
                          </div>
                          <p className="text-sm text-neutral-400">{app.description}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-neutral-400 mb-2">Triggers ({app.triggers.length}):</p>
                        <div className="flex flex-wrap gap-1">
                          {app.triggers.slice(0, 3).map((trigger) => (
                            <Badge key={trigger} variant="outline" className="text-xs">
                              {trigger}
                            </Badge>
                          ))}
                          {app.triggers.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{app.triggers.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-neutral-400 mb-2">Actions ({app.actions.length}):</p>
                        <div className="flex flex-wrap gap-1">
                          {app.actions.slice(0, 3).map((action) => (
                            <Badge key={action} variant="outline" className="text-xs">
                              {action}
                            </Badge>
                          ))}
                          {app.actions.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{app.actions.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-neutral-400">Used in {app.usage_count} workflows</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {app.status === 'connected' ? (
                            <Button size="sm" variant="outline">Configure</Button>
                          ) : (
                            <Button size="sm">Connect</Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="executions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Executions</CardTitle>
              <CardDescription>Workflow execution history and results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockExecutions.map((execution) => (
                  <div key={execution.id} className="border border-neutral-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(execution.status)}
                        <div>
                          <p className="font-semibold text-white">{execution.workflow_name}</p>
                          <p className="text-sm text-neutral-400">
                            {execution.steps_completed}/{execution.total_steps} steps completed
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(execution.status)}
                        <span className="text-xs text-neutral-400">{execution.duration}s</span>
                      </div>
                    </div>
                    
                    {execution.error_message && (
                      <div className="mb-3 p-2 bg-red-400/10 border border-red-400/30 rounded text-sm text-red-400">
                        {execution.error_message}
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-neutral-400">Started:</p>
                        <p className="text-white font-medium">{execution.started_at}</p>
                      </div>
                      <div>
                        <p className="text-neutral-400">Completed:</p>
                        <p className="text-white font-medium">{execution.completed_at || 'In progress'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" className="gap-1">
                          <Eye className="h-3 w-3" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Templates</CardTitle>
              <CardDescription>Pre-built workflow templates to get started quickly</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockTemplates.map((template) => (
                  <div key={template.id} className="border border-neutral-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-lg flex items-center justify-center">
                          <GitBranch className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-white">{template.name}</p>
                            {template.is_premium && (
                              <Badge className="bg-purple-400/20 text-purple-400 border-purple-400/30 border">
                                Premium
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-neutral-400">{template.description}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-neutral-400">Trigger:</span>
                        <Badge variant="outline" className="text-xs">{template.trigger_app}</Badge>
                        <ArrowRight className="h-3 w-3 text-neutral-500" />
                        <div className="flex gap-1">
                          {template.action_apps.map((app) => (
                            <Badge key={app} variant="outline" className="text-xs">{app}</Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-neutral-400">Used {template.usage_count} times</span>
                          <span className="text-neutral-400">•</span>
                          <span className="text-neutral-400">{template.rating} ⭐</span>
                        </div>
                        <Badge className="bg-neutral-700 text-neutral-300 border-neutral-600">
                          {template.category}
                        </Badge>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1 gap-1">
                          <Eye className="h-3 w-3" />
                          Preview
                        </Button>
                        <Button size="sm" className="flex-1 gap-1">
                          <Copy className="h-3 w-3" />
                          Use Template
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
              <CardTitle>Integration Settings</CardTitle>
              <CardDescription>Configure advanced integration and automation settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium text-white mb-3">Execution Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Retry Failed Workflows</p>
                      <p className="text-sm text-neutral-400">Automatically retry failed workflow executions</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Execution Timeout</p>
                      <p className="text-sm text-neutral-400">Maximum time before workflow times out</p>
                    </div>
                    <Button variant="outline" size="sm">Settings</Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium text-white mb-3">API Management</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Rate Limiting</p>
                      <p className="text-sm text-neutral-400">Configure API rate limits for integrations</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">API Keys</p>
                      <p className="text-sm text-neutral-400">Manage integration API keys and tokens</p>
                    </div>
                    <Button variant="outline" size="sm">Manage</Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium text-white mb-3">Monitoring & Alerts</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Workflow Alerts</p>
                      <p className="text-sm text-neutral-400">Get notified when workflows fail or succeed</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Performance Monitoring</p>
                      <p className="text-sm text-neutral-400">Monitor workflow performance and usage</p>
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