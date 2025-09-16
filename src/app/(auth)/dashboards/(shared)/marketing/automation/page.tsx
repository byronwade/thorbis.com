"use client";

import { useState } from "react";
;
import { 
  Workflow,
  Plus,
  Play,
  Pause,
  Edit3,
  Copy,
  Trash2,
  MoreHorizontal,
  Users,
  Mail,
  Share2,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Filter,
  Search,
  Zap,
  Target,
  ArrowRight,
  Settings,
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


interface AutomationWorkflow {
  id: string;
  name: string;
  description: string;
  status: "active" | "paused" | "draft";
  trigger: {
    type: "email_opened" | "link_clicked" | "form_submitted" | "tag_added" | "date_based" | "page_visited";
    description: string;
  };
  actions: {
    type: "send_email" | "add_tag" | "remove_tag" | "send_sms" | "create_deal" | "wait" | "social_post";
    description: string;
    delay?: string;
  }[];
  metrics: {
    enrolled: number;
    completed: number;
    active: number;
    conversionRate: number;
  };
  createdAt: string;
  lastModified: string;
}

const mockWorkflows: AutomationWorkflow[] = [
  {
    id: "1",
    name: "Welcome Email Series",
    description: "5-email series to onboard new subscribers",
    status: "active",
    trigger: {
      type: "form_submitted",
      description: "When someone subscribes to newsletter"
    },
    actions: [
      { type: "wait", description: "Wait 5 minutes", delay: "5 min" },
      { type: "send_email", description: "Send welcome email" },
      { type: "wait", description: "Wait 2 days", delay: "2 days" },
      { type: "send_email", description: "Send getting started guide" },
      { type: "wait", description: "Wait 3 days", delay: "3 days" },
      { type: "send_email", description: "Send feature highlights" },
    ],
    metrics: {
      enrolled: 1240,
      completed: 856,
      active: 384,
      conversionRate: 24.5,
    },
    createdAt: "2 weeks ago",
    lastModified: "3 days ago",
  },
  {
    id: "2",
    name: "Abandoned Cart Recovery",
    description: "Re-engage customers who left items in cart",
    status: "active",
    trigger: {
      type: "page_visited",
      description: "When cart is abandoned for 1 hour"
    },
    actions: [
      { type: "wait", description: "Wait 1 hour", delay: "1 hour" },
      { type: "send_email", description: "Send cart reminder" },
      { type: "wait", description: "Wait 24 hours", delay: "24 hours" },
      { type: "send_email", description: "Send discount offer" },
      { type: "add_tag", description: "Add 'Cart Abandoner' tag" },
    ],
    metrics: {
      enrolled: 890,
      completed: 234,
      active: 156,
      conversionRate: 18.2,
    },
    createdAt: "1 month ago",
    lastModified: "1 week ago",
  },
  {
    id: "3",
    name: "Customer Feedback Loop",
    description: "Follow up with customers after purchase",
    status: "paused",
    trigger: {
      type: "tag_added",
      description: "When 'Customer' tag is added"
    },
    actions: [
      { type: "wait", description: "Wait 7 days", delay: "7 days" },
      { type: "send_email", description: "Send feedback request" },
      { type: "wait", description: "Wait 3 days", delay: "3 days" },
      { type: "send_email", description: "Send review invitation" },
    ],
    metrics: {
      enrolled: 456,
      completed: 289,
      active: 0,
      conversionRate: 12.8,
    },
    createdAt: "3 months ago",
    lastModified: "2 weeks ago",
  },
  {
    id: "4",
    name: "Social Media Cross-Promotion",
    description: "Promote email content on social channels",
    status: "draft",
    trigger: {
      type: "email_opened",
      description: "When newsletter is opened"
    },
    actions: [
      { type: "wait", description: "Wait 30 minutes", delay: "30 min" },
      { type: "social_post", description: "Post on LinkedIn" },
      { type: "social_post", description: "Post on Twitter" },
    ],
    metrics: {
      enrolled: 0,
      completed: 0,
      active: 0,
      conversionRate: 0,
    },
    createdAt: "1 week ago",
    lastModified: "Yesterday",
  },
];

export default function AutomationPage() {
  const [workflows, setWorkflows] = useState<AutomationWorkflow[]>(mockWorkflows);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workflow.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || workflow.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <Play className="h-4 w-4 text-green-600" />;
      case "paused": return <Pause className="h-4 w-4 text-yellow-600" />;
      case "draft": return <Edit3 className="h-4 w-4 text-gray-600" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-green-600 bg-green-100 border-green-200";
      case "paused": return "text-yellow-600 bg-yellow-100 border-yellow-200";
      case "draft": return "text-gray-600 bg-gray-100 border-gray-200";
      default: return "text-gray-600 bg-gray-100 border-gray-200";
    }
  };

  const getTriggerIcon = (type: string) => {
    switch (type) {
      case "email_opened": return <Mail className="h-4 w-4" />;
      case "link_clicked": return <Target className="h-4 w-4" />;
      case "form_submitted": return <Users className="h-4 w-4" />;
      case "tag_added": return <Zap className="h-4 w-4" />;
      case "date_based": return <Calendar className="h-4 w-4" />;
      case "page_visited": return <TrendingUp className="h-4 w-4" />;
      default: return <Workflow className="h-4 w-4" />;
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case "send_email": return <Mail className="h-3 w-3" />;
      case "send_sms": return <Mail className="h-3 w-3" />;
      case "add_tag": return <Plus className="h-3 w-3" />;
      case "remove_tag": return <Trash2 className="h-3 w-3" />;
      case "wait": return <Clock className="h-3 w-3" />;
      case "social_post": return <Share2 className="h-3 w-3" />;
      case "create_deal": return <TrendingUp className="h-3 w-3" />;
      default: return <Settings className="h-3 w-3" />;
    }
  };

  const toggleWorkflowStatus = (id: string) => {
    setWorkflows(prev => prev.map(workflow => 
      workflow.id === id 
        ? { ...workflow, status: workflow.status === "active" ? "paused" : "active" as any }
        : workflow
    ));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marketing Automation</h1>
          <p className="text-muted-foreground">
            Create automated workflows to nurture leads and engage customers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/automation/templates">
              Templates
            </Link>
          </Button>
          <Button asChild>
            <Link href="/automation/builder">
              <Plus className="h-4 w-4 mr-2" />
              Create Workflow
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workflows.filter(w => w.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground">
              {workflows.filter(w => w.status === "paused").length} paused
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enrolled</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workflows.reduce((sum, w) => sum + w.metrics.enrolled, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {workflows.reduce((sum, w) => sum + w.metrics.active, 0)} currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68.9%</div>
            <p className="text-xs text-muted-foreground">
              Average across all workflows
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18.5%</div>
            <p className="text-xs text-muted-foreground">
              +3.2% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Popular Workflow Templates</CardTitle>
          <CardDescription>Quick start with proven automation templates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3 p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">Welcome Series</h4>
                <p className="text-sm text-muted-foreground">Onboard new subscribers</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">Lead Nurturing</h4>
                <p className="text-sm text-muted-foreground">Convert prospects to customers</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">Re-engagement</h4>
                <p className="text-sm text-muted-foreground">Win back inactive contacts</p>
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
            placeholder="Search workflows..."
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
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Workflows List */}
      <div className="space-y-4">
        {filteredWorkflows.map((workflow) => (
          <Card key={workflow.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    {getTriggerIcon(workflow.trigger.type)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{workflow.name}</CardTitle>
                    <CardDescription>{workflow.description}</CardDescription>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(workflow.status)}`}>
                        {getStatusIcon(workflow.status)}
                        <span className="ml-1 capitalize">{workflow.status}</span>
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Modified {workflow.lastModified}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => toggleWorkflowStatus(workflow.id)}
                  >
                    {workflow.status === "active" ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
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
              {/* Trigger */}
              <div>
                <h4 className="font-medium mb-2">Trigger</h4>
                <div className="flex items-center gap-2 text-sm bg-muted/50 rounded-lg p-3">
                  {getTriggerIcon(workflow.trigger.type)}
                  <span>{workflow.trigger.description}</span>
                </div>
              </div>

              {/* Actions Flow */}
              <div>
                <h4 className="font-medium mb-2">Actions</h4>
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {workflow.actions.map((action, index) => (
                    <div key={index} className="flex items-center gap-2 flex-shrink-0">
                      <div className="flex items-center gap-2 bg-background border rounded-lg px-3 py-2">
                        <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
                          {getActionIcon(action.type)}
                        </div>
                        <div className="text-sm">
                          <div className="font-medium">{action.description}</div>
                          {action.delay && (
                            <div className="text-xs text-muted-foreground">
                              Delay: {action.delay}
                            </div>
                          )}
                        </div>
                      </div>
                      {index < workflow.actions.length - 1 && (
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {workflow.metrics.enrolled.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Enrolled</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">
                    {workflow.metrics.completed.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">
                    {workflow.metrics.active.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Active</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">
                    {workflow.metrics.conversionRate}%
                  </div>
                  <div className="text-xs text-muted-foreground">Conversion</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t">
                <Button size="sm" asChild>
                  <Link href={`/automation/builder/${workflow.id}'}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Workflow
                  </Link>
                </Button>
                <Button size="sm" variant="outline">
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link href={'/automation/analytics/${workflow.id}'}>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Analytics
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredWorkflows.length === 0 && (
        <div className="text-center py-12">
          <Workflow className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No workflows found</h3>
          <p className="text-muted-foreground">
            {searchQuery || statusFilter !== "all" 
              ? "Try adjusting your search or filters"
              : "Create your first automation workflow to get started"}
          </p>
          {(!searchQuery && statusFilter === "all") && (
            <Button className="mt-4" asChild>
              <Link href="/automation/builder">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Workflow
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}