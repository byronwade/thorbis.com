"use client";

import React, { useState } from "react";
;
import {
  Brain,
  FileText,
  Upload,
  Download,
  Share2,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Star,
  Plus,
  Eye,
  Settings,
  Search,
  Filter,
  Folder,
  Calendar,
  Building2,
  Shield,
  Zap,
  Edit,
  Trash2,
  Archive,
  Mail,
  Phone,
  MapPin,
  UserCheck,
  Award,
  Activity,
  Target,
  Briefcase,
  Heart,
  PenTool,
  Signature,
  Lock,
  Unlock,
  Send,
  History,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Alert,
  AlertDescription
} from '@/components/ui/alert';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {  } from '@/components/ui';


const documentStats = {
  totalDocuments: 1247,
  pendingSignatures: 8,
  completedThisMonth: 156,
  averageProcessingTime: 2.3, // days
  complianceScore: 98.7,
  aiAutomation: 89 // percentage of documents automated
};

const documentCategories = [
  {
    id: "employment",
    name: "Employment Documents",
    count: 342,
    icon: "👥",
    description: "Contracts, offers, agreements, and onboarding documents",
    compliance: 99.2,
    templates: 12,
    recentActivity: 24
  },
  {
    id: "tax-forms",
    name: "Tax Forms",
    count: 289,
    icon: "📋",
    description: "W-2s, W-4s, 1099s, and tax compliance documents",
    compliance: 100,
    templates: 8,
    recentActivity: 45
  },
  {
    id: "benefits",
    name: "Benefits Enrollment",
    count: 187,
    icon: "💼",
    description: "Health insurance, retirement, and benefits documentation",
    compliance: 97.8,
    templates: 15,
    recentActivity: 18
  },
  {
    id: "policies",
    name: "Company Policies",
    count: 156,
    icon: "📖",
    description: "Employee handbook, policies, and procedural documents",
    compliance: 98.5,
    templates: 23,
    recentActivity: 12
  },
  {
    id: "legal",
    name: "Legal Documents",
    count: 123,
    icon: "⚖️",
    description: "NDAs, legal agreements, and compliance documents",
    compliance: 99.8,
    templates: 18,
    recentActivity: 8
  },
  {
    id: "performance",
    name: "Performance Reviews",
    count: 98,
    icon: "📊",
    description: "Annual reviews, goal setting, and performance documentation",
    compliance: 96.4,
    templates: 6,
    recentActivity: 32
  }
];

const recentDocuments = [
  {
    id: "doc-001",
    name: "Employment Agreement - Sarah Johnson",
    type: "Employment Contract",
    status: "pending-signature",
    assignee: "Sarah Johnson",
    assigneeEmail: "sarah.johnson@company.com",
    created: "2024-01-15T10:30:00Z",
    lastActivity: "2024-01-15T14:45:00Z",
    dueDate: "2024-01-18T23:59:59Z",
    priority: "high",
    aiProcessed: true,
    signatures: [
      { name: "HR Manager", status: "signed", timestamp: "2024-01-15T11:00:00Z" },
      { name: "Sarah Johnson", status: "pending", timestamp: null }
    ]
  },
  {
    id: "doc-002", 
    name: "2024 W-4 Form - Multiple Employees",
    type: "Tax Form",
    status: "in-progress",
    assignee: "HR Team",
    assigneeEmail: "hr@company.com",
    created: "2024-01-14T09:15:00Z",
    lastActivity: "2024-01-15T16:20:00Z",
    dueDate: "2024-01-25T23:59:59Z",
    priority: "medium",
    aiProcessed: true,
    signaturesRequired: 15,
    signaturesCompleted: 12
  },
  {
    id: "doc-003",
    name: "Benefits Enrollment - Q1 2024",
    type: "Benefits",
    status: "completed",
    assignee: "All Employees",
    assigneeEmail: null,
    created: "2024-01-10T08:00:00Z",
    lastActivity: "2024-01-15T17:30:00Z",
    dueDate: "2024-01-31T23:59:59Z",
    priority: "low",
    aiProcessed: true,
    completionRate: 87
  },
  {
    id: "doc-004",
    name: "NDA - Contractor Agreement",
    type: "Legal Document",
    status: "draft",
    assignee: "Legal Team",
    assigneeEmail: "legal@company.com", 
    created: "2024-01-15T13:20:00Z",
    lastActivity: "2024-01-15T13:20:00Z",
    dueDate: "2024-01-20T23:59:59Z",
    priority: "medium",
    aiProcessed: false
  }
];

const documentTemplates = [
  {
    id: "template-001",
    name: "Employee Offer Letter",
    category: "Employment",
    usage: 89,
    lastUpdated: "2024-01-10T00:00:00Z",
    aiOptimized: true,
    fields: 12,
    averageTime: "5 minutes",
    compliance: 100
  },
  {
    id: "template-002",
    name: "Contractor Agreement",
    category: "Legal",
    usage: 67,
    lastUpdated: "2024-01-08T00:00:00Z",
    aiOptimized: true,
    fields: 18,
    averageTime: "8 minutes",
    compliance: 99.5
  },
  {
    id: "template-003",
    name: "Benefits Enrollment Form",
    category: "Benefits",
    usage: 95,
    lastUpdated: "2024-01-12T00:00:00Z",
    aiOptimized: true,
    fields: 24,
    averageTime: "12 minutes",
    compliance: 98.2
  },
  {
    id: "template-004",
    name: "Performance Review Template",
    category: "Performance",
    usage: 78,
    lastUpdated: "2024-01-05T00:00:00Z",
    aiOptimized: false,
    fields: 16,
    averageTime: "20 minutes",
    compliance: 95.8
  }
];

const workflowSteps = [
  {
    step: 1,
    name: "Document Creation",
    description: "AI-powered template selection and auto-fill",
    icon: "📄",
    status: "active",
    processing: 92
  },
  {
    step: 2,
    name: "Compliance Check",
    description: "Automated legal and regulatory compliance validation",
    icon: "⚖️",
    status: "active",
    processing: 98.7
  },
  {
    step: 3,
    name: "Routing & Assignment",
    description: "Smart routing to appropriate stakeholders",
    icon: "🎯",
    status: "active",
    processing: 95
  },
  {
    step: 4,
    name: "Digital Signature",
    description: "Secure e-signature collection and verification",
    icon: "✍️",
    status: "active",
    processing: 89
  },
  {
    step: 5,
    name: "Storage & Archival",
    description: "Secure cloud storage with instant retrieval",
    icon: "🗄️",
    status: "active",
    processing: 100
  }
];

const aiInsights = [
  {
    type: "efficiency",
    title: "Template Optimization Opportunity",
    description: "Performance Review template completion time is 62% longer than AI-optimized templates. Implementing AI suggestions could save 12 minutes per review.",
    impact: "high",
    savings: "12 hours/month",
    confidence: 94.2,
    action: "Optimize template"
  },
  {
    type: "compliance",
    title: "Missing Signature Alerts",
    description: "8 documents have pending signatures past due date. AI can send automated reminders and escalation notifications.",
    impact: "medium",
    savings: "Risk reduction",
    confidence: 98.1,
    action: "Enable auto-reminders"
  },
  {
    type: "automation",
    title: "W-4 Processing Automation",
    description: "Tax form processing is only 67% automated. AI can pre-fill employee information and validate data completeness.",
    impact: "high",
    savings: "8 hours/week",
    confidence: 91.7,
    action: "Enable AI automation"
  }
];

export function DocumentManagement() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredDocuments = recentDocuments.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Document Management</h1>
          <p className="text-muted-foreground mt-2">
            AI-powered document creation, e-signatures, and automated workflows
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export All
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-payroll-primary to-payroll-secondary">
                <Plus className="mr-2 h-4 w-4" />
                New Document
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Document</DialogTitle>
                <DialogDescription>
                  Choose a template or start from scratch with AI assistance
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="template-select">Template</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose template..." />
                      </SelectTrigger>
                      <SelectContent>
                        {documentTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="category-select">Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Document category..." />
                      </SelectTrigger>
                      <SelectContent>
                        {documentCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="doc-name">Document Name</Label>
                  <Input
                    id="doc-name"
                    placeholder="Enter document name..."
                  />
                </div>
                
                <Alert>
                  <Brain className="h-4 w-4" />
                  <AlertDescription>
                    AI will auto-populate fields based on employee data and suggest compliance requirements.
                  </AlertDescription>
                </Alert>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline">Save as Draft</Button>
                  <Button>
                    <Zap className="mr-2 h-4 w-4" />
                    Create with AI
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* AI Document Assistant */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">AI Document Engine</h3>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                {documentStats.totalDocuments.toLocaleString()} documents • {documentStats.pendingSignatures} pending signatures • {documentStats.complianceScore}% compliant
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-1">
              {documentStats.aiAutomation}%
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">AI Automation Rate</div>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Documents</p>
                <p className="text-2xl font-bold">{documentStats.totalDocuments.toLocaleString()}</p>
                <p className="text-xs text-green-600">+{documentStats.completedThisMonth} this month</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Signatures</p>
                <p className="text-2xl font-bold text-orange-600">{documentStats.pendingSignatures}</p>
                <p className="text-xs text-orange-600">Requires attention</p>
              </div>
              <PenTool className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Processing Time</p>
                <p className="text-2xl font-bold text-payroll-primary">{documentStats.averageProcessingTime}</p>
                <p className="text-xs text-muted-foreground">days</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Compliance Score</p>
                <p className="text-2xl font-bold text-green-600">{documentStats.complianceScore}%</p>
                <p className="text-xs text-muted-foreground">AI-verified</p>
              </div>
              <Shield className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="documents" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="pending-signature">Pending Signature</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredDocuments.length} of {recentDocuments.length} documents
            </div>
          </div>

          <div className="grid gap-4">
            {filteredDocuments.map((doc, index) => (
              <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold">{doc.name}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline">{doc.type}</Badge>
                            <Badge variant={
                              doc.status === "completed" ? "default" :
                              doc.status === "pending-signature" ? "secondary" :
                              doc.status === "in-progress" ? "outline" : "destructive"
                            }>
                              {doc.status}
                            </Badge>
                            {doc.aiProcessed && (
                              <Badge variant="outline" className="text-purple-600">
                                <Brain className="mr-1 h-3 w-3" />
                                AI Processed
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <label className="text-xs text-muted-foreground">Assignee</label>
                          <p className="text-sm font-medium">{doc.assignee}</p>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Created</label>
                          <p className="text-sm font-medium">
                            {new Date(doc.created).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Due Date</label>
                          <p className="text-sm font-medium">
                            {new Date(doc.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Priority</label>
                          <Badge variant={
                            doc.priority === "high" ? "destructive" :
                            doc.priority === "medium" ? "secondary" : "outline"
                          }>
                            {doc.priority}
                          </Badge>
                        </div>
                      </div>

                      {doc.signatures && (
                        <div className="mb-4">
                          <label className="text-sm font-medium text-muted-foreground mb-2 block">Signature Progress</label>
                          <div className="space-y-2">
                            {doc.signatures.map((sig, i) => (
                              <div key={i} className="flex items-center justify-between text-sm">
                                <span>{sig.name}</span>
                                <div className="flex items-center space-x-2">
                                  {sig.status === "signed" ? (
                                    <Badge variant="default" className="text-xs">
                                      <CheckCircle className="mr-1 h-3 w-3" />
                                      Signed
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary" className="text-xs">
                                      <Clock className="mr-1 h-3 w-3" />
                                      Pending
                                    </Badge>
                                  )}
                                  {sig.timestamp && (
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(sig.timestamp).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right ml-6">
                      <div className="mb-4">
                        <div className="text-lg font-bold text-blue-600 mb-1">
                          {doc.status === "completed" ? "100%" : 
                           doc.completionRate ? `${doc.completionRate}%` :
                           doc.signatures ? 
                           `${Math.round((doc.signatures.filter(s => s.status === "signed").length / doc.signatures.length) * 100)}%' :
                           "0%"}
                        </div>
                        <div className="text-sm text-muted-foreground">Completion</div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="mr-2 h-3 w-3" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="mr-2 h-3 w-3" />
                          Edit
                        </Button>
                        {doc.status === "pending-signature" && (
                          <Button size="sm">
                            <Send className="mr-2 h-3 w-3" />
                            Send Reminder
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid gap-6">
            {documentCategories.map((category, index) => (
              <Card key={category.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-3xl">{category.icon}</span>
                      <div>
                        <h4 className="text-xl font-semibold">{category.name}</h4>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="text-sm">
                            <strong>{category.count}</strong> documents
                          </div>
                          <div className="text-sm">
                            <strong>{category.templates}</strong> templates
                          </div>
                          <div className="text-sm">
                            <strong>{category.recentActivity}</strong> recent
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="mb-4">
                        <div className="text-lg font-bold text-green-600 mb-1">
                          {category.compliance}%
                        </div>
                        <div className="text-sm text-muted-foreground">Compliance</div>
                      </div>
                      
                      <Button size="sm" variant="outline">
                        <Folder className="mr-2 h-3 w-3" />
                        View All
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid gap-4">
            {documentTemplates.map((template, index) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/20">
                          <FileText className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold">{template.name}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline">{template.category}</Badge>
                            {template.aiOptimized && (
                              <Badge variant="outline" className="text-purple-600">
                                <Brain className="mr-1 h-3 w-3" />
                                AI Optimized
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <label className="text-xs text-muted-foreground">Usage Count</label>
                          <p className="text-sm font-medium">{template.usage} times</p>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Form Fields</label>
                          <p className="text-sm font-medium">{template.fields} fields</p>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Avg Time</label>
                          <p className="text-sm font-medium">{template.averageTime}</p>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Compliance</label>
                          <p className="text-sm font-medium text-green-600">{template.compliance}%</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right ml-6">
                      <div className="mb-4">
                        <div className="text-sm text-muted-foreground">Last Updated</div>
                        <div className="text-sm font-medium">
                          {new Date(template.lastUpdated).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="mr-2 h-3 w-3" />
                          Preview
                        </Button>
                        <Button size="sm">
                          <Plus className="mr-2 h-3 w-3" />
                          Use Template
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="workflow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Document Workflow</CardTitle>
              <CardDescription>
                Automated document processing pipeline with intelligent routing and compliance validation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {workflowSteps.map((step, index) => (
                  <div key={step.step} className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">{step.step}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{step.name}</h4>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">{step.processing}%</div>
                          <div className="text-xs text-muted-foreground">Automated</div>
                        </div>
                      </div>
                      <Progress value={step.processing} className="mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4">
            {aiInsights.map((insight, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={'p-2 rounded-full ${
                      insight.type === "efficiency" 
                        ? "bg-green-100 dark:bg-green-900/20" 
                        : insight.type === "compliance"
                        ? "bg-blue-100 dark:bg-blue-900/20"
                        : "bg-purple-100 dark:bg-purple-900/20"
                    }'}>
                      {insight.type === "efficiency" ? (
                        <Zap className="h-4 w-4 text-green-600" />
                      ) : insight.type === "compliance" ? (
                        <Shield className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Target className="h-4 w-4 text-purple-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{insight.title}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge variant={insight.impact === "high" ? "default" : "secondary"}>
                            {insight.impact} impact
                          </Badge>
                          <Badge variant="outline" className="text-green-600">
                            <Brain className="mr-1 h-2 w-2" />
                            {insight.confidence}% confident
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {insight.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-green-600">
                          Potential Benefit: {insight.savings}
                        </div>
                        <Button size="sm">
                          {insight.action}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}