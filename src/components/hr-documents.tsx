"use client";

import React, { useState } from "react";

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';

import { Label } from '@/components/ui/label';

import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

import {
  Brain,
  FileText,
  Folder,
  Shield,
  CheckCircle,
  AlertTriangle,
  Plus,
  Edit,
  Eye,
  Settings,
  Download,
  Upload,
  Search,
  Filter,
  Bell,
  Archive,
  Lock,
  Unlock,
  Calendar,
  Clock,
  User,
  Users,
  Building,
  Award,
  Briefcase,
  GraduationCap,
  Heart,
  Scale,
  Zap,
  Target,
  TrendingUp,
  BarChart3,
  AlertCircle,
  Trash2,
  Share2,
  Copy,
  Printer,
  Send,
  Save,
  RefreshCw,
  Database,
  Cloud,
  HardDrive,
  Key,
  Fingerprint,
  Scan,
  FileCheck,
  FilePlus,
  FileX,
  FolderOpen,
  FolderPlus,
  Tag,
  Tags,
  Star,
  Bookmark,
  Flag,
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
import {
  Alert,
  AlertDescription
} from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
const documentsOverview = {
  totalDocuments: 1247,
  pendingReview: 23,
  expiringSoon: 8,
  complianceRate: 98.7,
  storageUsed: 2.4, // GB
  storageLimit: 10, // GB
  aiTagged: 1089,
  recentUploads: 15,
  accessRequests: 3
};

const documents = [
  {
    id: "DOC-001",
    title: "Employee Handbook 2024",
    category: "policies",
    type: "handbook",
    fileName: "employee-handbook-2024.pdf",
    fileSize: 2.3, // MB
    uploadDate: "2024-01-15T10:30:00Z",
    lastModified: "2024-02-10T14:20:00Z",
    uploadedBy: "HR Admin",
    status: "active",
    version: "v2.1",
    compliance: {
      required: true,
      acknowledged: 18,
      pending: 6,
      rate: 75
    },
    access: {
      level: "all-employees",
      viewCount: 234,
      downloadCount: 89
    },
    tags: ["handbook", "policies", "2024", "mandatory"],
    department: "HR",
    expiryDate: "2024-12-31",
    aiInsights: [
      "High engagement rate - 89% of employees have accessed",
      "Policy updates needed based on recent legal changes",
      "Consider adding video summary for key sections"
    ]
  },
  {
    id: "DOC-002",
    title: "Sarah Johnson - Performance Review Q4 2023",
    category: "reviews",
    type: "performance",
    fileName: "sarah-johnson-q4-2023-review.pdf",
    fileSize: 0.8,
    uploadDate: "2024-01-05T16:45:00Z",
    lastModified: "2024-01-05T16:45:00Z",
    uploadedBy: "John Smith",
    status: "confidential",
    version: "v1.0",
    compliance: {
      required: false,
      acknowledged: 1,
      pending: 0,
      rate: 100
    },
    access: {
      level: "manager-employee",
      viewCount: 5,
      downloadCount: 2
    },
    tags: ["performance", "review", "q4-2023", "engineering"],
    department: "Engineering",
    expiryDate: "2031-01-05", // 7 years for performance docs
    aiInsights: [
      "Exceeds expectations in all categories",
      "Ready for promotion consideration",
      "High retention risk - recommend career development discussion"
    ]
  },
  {
    id: "DOC-003",
    title: "Remote Work Policy Update",
    category: "policies",
    type: "policy",
    fileName: "remote-work-policy-2024.pdf",
    fileSize: 1.1,
    uploadDate: "2024-02-01T09:15:00Z",
    lastModified: "2024-02-12T11:30:00Z",
    uploadedBy: "HR Admin",
    status: "pending-review",
    version: "v1.2",
    compliance: {
      required: true,
      acknowledged: 8,
      pending: 16,
      rate: 33
    },
    access: {
      level: "all-employees",
      viewCount: 67,
      downloadCount: 23
    },
    tags: ["remote-work", "policy", "2024", "covid-update"],
    department: "HR",
    expiryDate: "2024-12-31",
    aiInsights: [
      "Low acknowledgment rate requires attention",
      "Consider mandatory training session",
      "Popular download suggests high interest"
    ]
  },
  {
    id: "DOC-004",
    title: "Mike Chen - Training Certificate - AWS Solutions Architect",
    category: "training",
    type: "certificate",
    fileName: "mike-chen-aws-cert.pdf",
    fileSize: 0.3,
    uploadDate: "2024-02-14T13:20:00Z",
    lastModified: "2024-02-14T13:20:00Z",
    uploadedBy: "Mike Chen",
    status: "active",
    version: "v1.0",
    compliance: {
      required: false,
      acknowledged: 1,
      pending: 0,
      rate: 100
    },
    access: {
      level: "employee-manager",
      viewCount: 3,
      downloadCount: 1
    },
    tags: ["training", "aws", "certification", "engineering"],
    department: "Engineering",
    expiryDate: "2027-02-14", // 3 years for AWS cert
    aiInsights: [
      "Valuable skill addition for cloud projects",
      "Consider promoting advanced cloud initiatives",
      "Certification aligns with company tech roadmap"
    ]
  },
  {
    id: "DOC-005",
    title: "Compliance Report - Q1 2024",
    category: "compliance",
    type: "report",
    fileName: "compliance-q1-2024.pdf",
    fileSize: 4.2,
    uploadDate: "2024-02-15T17:00:00Z",
    lastModified: "2024-02-15T17:00:00Z",
    uploadedBy: "Compliance Officer",
    status: "confidential",
    version: "v1.0",
    compliance: {
      required: true,
      acknowledged: 3,
      pending: 2,
      rate: 60
    },
    access: {
      level: "leadership-only",
      viewCount: 8,
      downloadCount: 3
    },
    tags: ["compliance", "q1-2024", "confidential", "audit"],
    department: "Legal",
    expiryDate: "2031-02-15", // 7 years for compliance docs
    aiInsights: [
      "All major compliance areas green",
      "Minor improvement needed in data retention",
      "Recommended quarterly review schedule"
    ]
  }
];

const documentCategories = [
  {
    id: "policies",
    name: "Policies & Procedures",
    icon: "📋",
    description: "Company policies, procedures, and guidelines",
    documentCount: 45,
    complianceRate: 87,
    color: "blue",
    subcategories: ["Employee Handbook", "HR Policies", "IT Policies", "Safety Procedures"]
  },
  {
    id: "reviews",
    name: "Performance Reviews",
    icon: "⭐",
    description: "Employee performance evaluations and feedback",
    documentCount: 156,
    complianceRate: 95,
    color: "green",
    subcategories: ["Annual Reviews", "Quarterly Check-ins", "360 Reviews", "Goal Setting"]
  },
  {
    id: "training",
    name: "Training & Development",
    icon: "🎓",
    description: "Certificates, training materials, and development plans",
    documentCount: 234,
    complianceRate: 78,
    color: "purple",
    subcategories: ["Certifications", "Training Materials", "Development Plans", "Compliance Training"]
  },
  {
    id: "contracts",
    name: "Contracts & Agreements",
    icon: "📄",
    description: "Employment contracts, NDAs, and legal agreements",
    documentCount: 89,
    complianceRate: 99,
    color: "orange",
    subcategories: ["Employment Contracts", "NDAs", "Non-compete", "Client Agreements"]
  },
  {
    id: "compliance",
    name: "Compliance & Legal",
    icon: "⚖️",
    description: "Legal documents, audit reports, and compliance records",
    documentCount: 67,
    complianceRate: 96,
    color: "red",
    subcategories: ["Audit Reports", "Legal Documents", "Regulatory Filings", "Insurance"]
  },
  {
    id: "benefits",
    name: "Benefits & Payroll",
    icon: "💰",
    description: "Benefits information, payroll documents, and tax forms",
    documentCount: 123,
    complianceRate: 92,
    color: "indigo",
    subcategories: ["Benefits Enrollment", "Pay Stubs", "Tax Forms", "Insurance Documents"]
  }
];

const accessLevels = [
  {
    id: "all-employees",
    name: "All Employees",
    description: "Accessible to all company employees",
    userCount: 24,
    color: "green"
  },
  {
    id: "department-specific",
    name: "Department Specific",
    description: "Restricted to specific departments",
    userCount: 8,
    color: "blue"
  },
  {
    id: "manager-employee",
    name: "Manager & Employee",
    description: "Manager and specific employee only",
    userCount: 2,
    color: "yellow"
  },
  {
    id: "leadership-only",
    name: "Leadership Only",
    description: "C-level and senior management only",
    userCount: 5,
    color: "purple"
  },
  {
    id: "confidential",
    name: "Confidential",
    description: "Highly restricted access",
    userCount: 3,
    color: "red"
  }
];

const complianceAlerts = [
  {
    id: "ALERT-001",
    type: "expiring",
    title: "Employee Handbook Acknowledgments Due",
    description: "6 employees have not acknowledged the updated employee handbook (due: Feb 20, 2024)",
    priority: "high",
    dueDate: "2024-02-20",
    affectedEmployees: 6,
    documentId: "DOC-001",
    action: "Send reminder notifications"
  },
  {
    id: "ALERT-002", 
    type: "expired",
    title: "Safety Training Certificates Expired",
    description: "3 employees have expired safety training certificates requiring renewal",
    priority: "critical",
    expiredDate: "2024-02-10",
    affectedEmployees: 3,
    documentId: null,
    action: "Schedule mandatory training"
  },
  {
    id: "ALERT-003",
    type: "review",
    title: "Remote Work Policy Review Required",
    description: "Remote work policy requires quarterly review and updates based on new regulations",
    priority: "medium",
    reviewDate: "2024-02-15",
    affectedEmployees: 24,
    documentId: "DOC-003",
    action: "Schedule policy review meeting"
  }
];

const aiInsights = [
  {
    type: "compliance",
    title: "Document Acknowledgment Pattern Analysis",
    description: "AI analysis shows policy documents sent on Friday have 34% lower acknowledgment rates than those sent on Tuesday. Recommend optimal sending schedule.",
    confidence: 91.2,
    impact: "medium",
    affectedDocuments: 12,
    recommendation: "Implement smart scheduling for policy distribution",
    improvementMetric: "34% higher engagement"
  },
  {
    type: "storage",
    title: "Duplicate Document Detection",
    description: "AI identified 23 potential duplicate documents across departments, representing 180MB of unnecessary storage. Automated deduplication recommended.",
    confidence: 96.8,
    impact: "low",
    affectedDocuments: 23,
    recommendation: "Run automated deduplication process",
    storageSaving: "180MB"
  },
  {
    type: "security",
    title: "Access Pattern Anomaly",
    description: "Unusual access pattern detected: confidential documents accessed outside normal hours. Enhanced monitoring recommended for sensitive files.",
    confidence: 87.4,
    impact: "high",
    affectedDocuments: 5,
    recommendation: "Enable advanced access monitoring",
    riskLevel: "medium"
  },
  {
    type: "content",
    title: "Document Content Gap Analysis",
    description: "AI content analysis suggests missing documentation for 3 key business processes. Automated template generation can fill these gaps.",
    confidence: 89.6,
    impact: "medium",
    affectedProcesses: 3,
    recommendation: "Generate missing process documentation",
    completionGain: "15%"
  }
];

export function HRDocuments() {
  const [selectedDocument, setSelectedDocument] = useState(documents[0]);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("list");

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === "all" || doc.category === filterCategory;
    const matchesStatus = filterStatus === "all" || doc.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">HR Document Management</h1>
          <p className="text-muted-foreground mt-2">
            AI-powered document management with compliance tracking and intelligent organization
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Document Settings
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-payroll-primary to-payroll-secondary">
                <Plus className="mr-2 h-4 w-4" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Upload New Document</DialogTitle>
                <DialogDescription>
                  Upload documents with AI-powered categorization and compliance checking
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="file">Document File</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Drag & drop files here or click to browse
                    </p>
                    <Button variant="outline" size="sm">
                      <FilePlus className="mr-2 h-4 w-4" />
                      Choose Files
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category..." />
                      </SelectTrigger>
                      <SelectContent>
                        {documentCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.icon} {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="access">Access Level</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select access..." />
                      </SelectTrigger>
                      <SelectContent>
                        {accessLevels.map((level) => (
                          <SelectItem key={level.id} value={level.id}>
                            {level.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hr">Human Resources</SelectItem>
                        <SelectItem value="engineering">Engineering</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="sales">Sales</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                    <Input id="expiryDate" type="date" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <Input id="tags" placeholder="Enter tags separated by commas..." />
                </div>
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea id="description" placeholder="Brief description of the document..." rows={3} />
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="complianceRequired" />
                  <Label htmlFor="complianceRequired">Require employee acknowledgment</Label>
                </div>
                <Alert>
                  <Brain className="h-4 w-4" />
                  <AlertDescription>
                    AI will automatically analyze document content, suggest tags, categorization, and detect compliance requirements.
                  </AlertDescription>
                </Alert>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline">Save Draft</Button>
                  <Button>
                    <Zap className="mr-2 h-4 w-4" />
                    Upload with AI Analysis
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* AI Document Intelligence */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-purple-900 dark:text-purple-100">AI Document Intelligence</h3>
              <p className="text-purple-700 dark:text-purple-300 text-sm">
                {documentsOverview.totalDocuments} documents • {documentsOverview.aiTagged} AI-tagged • {documentsOverview.complianceRate}% compliant
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-purple-900 dark:text-purple-100 mb-1">
              {documentsOverview.storageUsed}GB
            </div>
            <div className="text-sm text-purple-700 dark:text-purple-300">of {documentsOverview.storageLimit}GB used</div>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{documentsOverview.totalDocuments}</p>
                <p className="text-xs text-muted-foreground">Total Documents</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{documentsOverview.pendingReview}</p>
                <p className="text-xs text-muted-foreground">Pending Review</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{documentsOverview.expiringSoon}</p>
                <p className="text-xs text-muted-foreground">Expiring Soon</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{documentsOverview.complianceRate}%</p>
                <p className="text-xs text-muted-foreground">Compliance</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Compliance Alerts */}
      {complianceAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-orange-600" />
              Compliance Alerts
            </CardTitle>
            <CardDescription>
              Documents requiring immediate attention for compliance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {complianceAlerts.map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className={`p-4 rounded-lg border-l-4 ${
                    alert.priority === "critical" ? "border-red-500 bg-red-50 dark:bg-red-950/20" :
                    alert.priority === "high" ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20" :
                    "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h5 className="font-semibold">{alert.title}</h5>
                        <Badge variant={
                          alert.priority === "critical" ? "destructive" :
                          alert.priority === "high" ? "default" : "secondary"
                        }>
                          {alert.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                      <div className="text-xs text-muted-foreground">
                        Affects {alert.affectedEmployees} employees
                        {alert.dueDate && ` • Due: ${new Date(alert.dueDate).toLocaleDateString()}`}
                        {alert.expiredDate && ` • Expired: ${new Date(alert.expiredDate).toLocaleDateString()}'}
                        {alert.reviewDate && ' • Review: ${new Date(alert.reviewDate).toLocaleDateString()}'}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="mr-2 h-3 w-3" />
                        View
                      </Button>
                      <Button size="sm">
                        {alert.action.split(' `)[0]}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="documents" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="access">Access Control</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
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
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {documentCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending-review">Pending Review</SelectItem>
                  <SelectItem value="confidential">Confidential</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-3 w-3" />
                Advanced Filter
              </Button>
              <Button variant="outline" size="sm" onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}>
                {viewMode === "list" ? "Grid View" : "List View"}
              </Button>
            </div>
          </div>

          {viewMode === "list" ? (
            <Card>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Compliance</TableHead>
                      <TableHead>Modified</TableHead>
                      <TableHead>Access</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.map((document) => (
                      <TableRow key={document.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
                              <FileText className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">{document.title}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="text-xs text-muted-foreground">{document.fileName}</span>
                                <span className="text-xs text-muted-foreground">• {document.fileSize}MB</span>
                                {document.version && (
                                  <Badge variant="outline" className="text-xs">
                                    {document.version}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {documentCategories.find(c => c.id === document.category)?.icon}{" "}
                            {documentCategories.find(c => c.id === document.category)?.name}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {document.status === "active" ? (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Active
                            </Badge>
                          ) : document.status === "pending-review" ? (
                            <Badge className="bg-orange-100 text-orange-800">
                              <Clock className="mr-1 h-3 w-3" />
                              Pending Review
                            </Badge>
                          ) : document.status === "confidential" ? (
                            <Badge className="bg-red-100 text-red-800">
                              <Lock className="mr-1 h-3 w-3" />
                              Confidential
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              <Archive className="mr-1 h-3 w-3" />
                              Archived
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {document.compliance.required ? (
                            <div className="flex items-center space-x-2">
                              <Progress value={document.compliance.rate} className="w-16 h-2" />
                              <span className="text-xs font-medium">{document.compliance.rate}%</span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">Not required</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(document.lastModified).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            by {document.uploadedBy}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {accessLevels.find(l => l.id === document.access.level)?.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {document.access.viewCount} views
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="ghost" onClick={() => setSelectedDocument(document)}>
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl">
                                <DialogHeader>
                                  <DialogTitle>{document.title}</DialogTitle>
                                  <DialogDescription>
                                    Document details and AI-powered insights
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid grid-cols-3 gap-6">
                                  <div className="col-span-2">
                                    <h5 className="font-semibold mb-3">Document Information</h5>
                                    <div className="space-y-3">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <label className="text-sm font-medium text-muted-foreground">Category</label>
                                          <p>{documentCategories.find(c => c.id === document.category)?.name}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-muted-foreground">Department</label>
                                          <p>{document.department}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-muted-foreground">File Size</label>
                                          <p>{document.fileSize} MB</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-muted-foreground">Version</label>
                                          <p>{document.version}</p>
                                        </div>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-muted-foreground">Tags</label>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                          {document.tags.map((tag, i) => (
                                            <Badge key={i} variant="outline" className="text-xs">
                                              <Tag className="mr-1 h-2 w-2" />
                                              {tag}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                      {document.compliance.required && (
                                        <div>
                                          <label className="text-sm font-medium text-muted-foreground">Compliance Status</label>
                                          <div className="flex items-center space-x-4 mt-2">
                                            <div className="text-center">
                                              <div className="text-lg font-bold text-green-600">{document.compliance.acknowledged}</div>
                                              <div className="text-xs text-muted-foreground">Acknowledged</div>
                                            </div>
                                            <div className="text-center">
                                              <div className="text-lg font-bold text-orange-600">{document.compliance.pending}</div>
                                              <div className="text-xs text-muted-foreground">Pending</div>
                                            </div>
                                            <div className="text-center">
                                              <div className="text-lg font-bold text-blue-600">{document.compliance.rate}%</div>
                                              <div className="text-xs text-muted-foreground">Rate</div>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <h5 className="font-semibold mb-3">AI Insights</h5>
                                    <div className="space-y-3">
                                      {document.aiInsights.map((insight, i) => (
                                        <Alert key={i} className="text-xs">
                                          <Brain className="h-3 w-3" />
                                          <AlertDescription>{insight}</AlertDescription>
                                        </Alert>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t">
                                  <div className="text-sm text-muted-foreground">
                                    Last modified: {new Date(document.lastModified).toLocaleString()}
                                  </div>
                                  <div className="flex space-x-2">
                                    <Button size="sm" variant="outline">
                                      <Download className="mr-2 h-3 w-3" />
                                      Download
                                    </Button>
                                    <Button size="sm" variant="outline">
                                      <Share2 className="mr-2 h-3 w-3" />
                                      Share
                                    </Button>
                                    <Button size="sm">
                                      <Edit className="mr-2 h-3 w-3" />
                                      Edit
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button size="sm" variant="ghost">
                              <Download className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocuments.map((document, index) => (
                <motion.div
                  key={document.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedDocument(document)}>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3 mb-3">
                        <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold truncate">{document.title}</h5>
                          <p className="text-xs text-muted-foreground truncate">{document.fileName}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline" className="text-xs">
                          {documentCategories.find(c => c.id === document.category)?.icon}{" "}
                          {document.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{document.fileSize}MB</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {document.tags.slice(0, 3).map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {document.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{document.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          {new Date(document.lastModified).toLocaleDateString()}
                        </div>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="ghost">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid gap-4">
            {documentCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="text-4xl">{category.icon}</div>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold">{category.name}</h4>
                          <p className="text-sm text-muted-foreground mb-3">{category.description}</p>
                          
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="text-xs text-muted-foreground">Document Count</label>
                              <p className="text-lg font-bold text-blue-600">{category.documentCount}</p>
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">Compliance Rate</label>
                              <div className="flex items-center space-x-2">
                                <Progress value={category.complianceRate} className="w-16 h-2" />
                                <span className="text-sm font-medium">{category.complianceRate}%</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="text-sm font-medium text-muted-foreground mb-2 block">Subcategories</label>
                            <div className="flex flex-wrap gap-2">
                              {category.subcategories.map((subcategory, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {subcategory}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <Button size="sm" variant="outline" className="mb-2">
                          <FolderOpen className="mr-2 h-3 w-3" />
                          View All
                        </Button>
                        <Button size="sm" variant="outline">
                          <Settings className="mr-2 h-3 w-3" />
                          Configure
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="access" className="space-y-4">
          <div className="grid gap-4">
            {accessLevels.map((level, index) => (
              <motion.div
                key={level.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-full ${
                          level.color === "green" ? "bg-green-100 dark:bg-green-900/20" :
                          level.color === "blue" ? "bg-blue-100 dark:bg-blue-900/20" :
                          level.color === "yellow" ? "bg-yellow-100 dark:bg-yellow-900/20" :
                          level.color === "purple" ? "bg-purple-100 dark:bg-purple-900/20" :
                          "bg-red-100 dark:bg-red-900/20"
                        }'}>
                          {level.color === "green" ? (
                            <Users className="h-6 w-6 text-green-600" />
                          ) : level.color === "blue" ? (
                            <Building className="h-6 w-6 text-blue-600" />
                          ) : level.color === "yellow" ? (
                            <User className="h-6 w-6 text-yellow-600" />
                          ) : level.color === "purple" ? (
                            <Award className="h-6 w-6 text-purple-600" />
                          ) : (
                            <Lock className="h-6 w-6 text-red-600" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold">{level.name}</h4>
                          <p className="text-sm text-muted-foreground">{level.description}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600 mb-1">
                          {level.userCount}
                        </div>
                        <div className="text-sm text-muted-foreground">Users</div>
                        <Button size="sm" variant="outline" className="mt-2">
                          <Settings className="mr-2 h-3 w-3" />
                          Manage
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-5 w-5" />
                  Compliance Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Overall Compliance Rate</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={documentsOverview.complianceRate} className="w-24 h-2" />
                      <span className="font-medium">{documentsOverview.complianceRate}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Documents Requiring Acknowledgment</span>
                    <span className="font-medium">12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Pending Acknowledgments</span>
                    <span className="font-medium text-orange-600">{documentsOverview.pendingReview}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Expired Documents</span>
                    <span className="font-medium text-red-600">2</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  Expiring Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-red-50 dark:bg-red-950/20 rounded">
                    <div>
                      <div className="text-sm font-medium">Safety Training Cert</div>
                      <div className="text-xs text-muted-foreground">Expires in 2 days</div>
                    </div>
                    <Badge variant="destructive" className="text-xs">Critical</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-orange-50 dark:bg-orange-950/20 rounded">
                    <div>
                      <div className="text-sm font-medium">Employee Handbook</div>
                      <div className="text-xs text-muted-foreground">Expires in 1 week</div>
                    </div>
                    <Badge variant="default" className="text-xs">High</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded">
                    <div>
                      <div className="text-sm font-medium">IT Security Policy</div>
                      <div className="text-xs text-muted-foreground">Expires in 2 weeks</div>
                    </div>
                    <Badge variant="secondary" className="text-xs">Medium</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4">
            {aiInsights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={'p-2 rounded-full ${
                        insight.type === "compliance" 
                          ? "bg-blue-100 dark:bg-blue-900/20" 
                          : insight.type === "storage"
                          ? "bg-green-100 dark:bg-green-900/20"
                          : insight.type === "security"
                          ? "bg-red-100 dark:bg-red-900/20"
                          : "bg-purple-100 dark:bg-purple-900/20"
                      }'}>
                        {insight.type === "compliance" ? (
                          <Shield className="h-4 w-4 text-blue-600" />
                        ) : insight.type === "storage" ? (
                          <HardDrive className="h-4 w-4 text-green-600" />
                        ) : insight.type === "security" ? (
                          <Lock className="h-4 w-4 text-red-600" />
                        ) : (
                          <FileText className="h-4 w-4 text-purple-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{insight.title}</h4>
                          <div className="flex items-center space-x-2">
                            <Badge variant={insight.impact === "high" ? "destructive" : 
                                           insight.impact === "medium" ? "default" : "secondary"}>
                              {insight.impact} impact
                            </Badge>
                            <Badge variant="outline" className="text-green-600">
                              <Brain className="mr-1 h-2 w-2" />
                              {insight.confidence}% confident
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          {insight.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="text-sm">
                            {insight.affectedDocuments && (
                              <span className="font-medium">Affects: {insight.affectedDocuments} documents</span>
                            )}
                            {insight.affectedProcesses && (
                              <span className="font-medium">Affects: {insight.affectedProcesses} processes</span>
                            )}
                            {insight.storageSaving && (
                              <span className="font-medium text-green-600 ml-4">Saves: {insight.storageSaving}</span>
                            )}
                            {insight.improvementMetric && (
                              <span className="font-medium text-blue-600 ml-4">{insight.improvementMetric}</span>
                            )}
                          </div>
                          <Button size="sm">
                            <Zap className="mr-2 h-3 w-3" />
                            {insight.recommendation.split(' ').slice(0, 2).join(' ')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Document Activity
                </CardTitle>
                <CardDescription>
                  Upload, access, and modification trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Document activity analytics will be displayed here</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Compliance Trends
                </CardTitle>
                <CardDescription>
                  Acknowledgment rates and compliance progression
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Compliance trend analytics will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Document Management Summary</CardTitle>
              <CardDescription>
                Overall document system metrics and performance indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">{documentsOverview.complianceRate}%</div>
                  <div className="text-sm text-muted-foreground">Compliance Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{Math.round((documentsOverview.aiTagged / documentsOverview.totalDocuments) * 100)}%</div>
                  <div className="text-sm text-muted-foreground">AI Tagged</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">{Math.round((documentsOverview.storageUsed / documentsOverview.storageLimit) * 100)}%</div>
                  <div className="text-sm text-muted-foreground">Storage Used</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">{documentsOverview.recentUploads}</div>
                  <div className="text-sm text-muted-foreground">Recent Uploads</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}