"use client";

import { useState } from "react";
;
import { 
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit3,
  Copy,
  Trash2,
  MoreHorizontal,
  FileText,
  Users,
  BarChart3,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Settings,
  Share2,
  Code,
  Smartphone,
  Monitor,
  Mail,
  Target,
  Zap,
  MousePointer,
  TrendingUp,
  Calendar,
  ExternalLink,
  ArrowRight,
  DragHandleDots2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';


interface Form {
  id: string;
  name: string;
  description: string;
  type: "contact" | "newsletter" | "survey" | "registration" | "feedback" | "lead-gen";
  status: "draft" | "published" | "paused" | "archived";
  fields: FormField[];
  submissions: number;
  conversionRate: number;
  views: number;
  createdAt: string;
  lastModified: string;
  embedCode?: string;
  thankYouMessage: string;
  redirectUrl?: string;
  notifications: string[];
}

interface FormField {
  id: string;
  type: "text" | "email" | "textarea" | "select" | "radio" | "checkbox" | "number" | "tel" | "url" | "date";
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: string;
  order: number;
}

interface FormSubmission {
  id: string;
  formId: string;
  data: Record<string, unknown>;
  submittedAt: string;
  source: string;
  ipAddress: string;
  userAgent: string;
  status: "new" | "contacted" | "qualified" | "converted";
}

const mockForms: Form[] = [
  {
    id: "1",
    name: "Contact Us Form",
    description: "Main contact form for website inquiries",
    type: "contact",
    status: "published",
    fields: [
      { id: "1", type: "text", label: "Full Name", required: true, order: 1 },
      { id: "2", type: "email", label: "Email Address", required: true, order: 2 },
      { id: "3", type: "text", label: "Company", required: false, order: 3 },
      { id: "4", type: "textarea", label: "Message", required: true, order: 4 }
    ],
    submissions: 324,
    conversionRate: 12.8,
    views: 2531,
    createdAt: "2024-01-10T00:00:00Z",
    lastModified: "2024-01-18T10:30:00Z",
    thankYouMessage: "Thank you for your inquiry! We'll get back to you within 24 hours.",
    notifications: ["sales@company.com"]
  },
  {
    id: "2", 
    name: "Newsletter Signup",
    description: "Email subscription form for blog sidebar",
    type: "newsletter",
    status: "published",
    fields: [
      { id: "1", type: "email", label: "Email Address", placeholder: "Enter your email", required: true, order: 1 },
      { id: "2", type: "text", label: "First Name", required: false, order: 2 }
    ],
    submissions: 1289,
    conversionRate: 8.7,
    views: 14820,
    createdAt: "2024-01-05T00:00:00Z",
    lastModified: "2024-01-15T14:20:00Z",
    thankYouMessage: "Welcome! Please check your email to confirm your subscription.",
    notifications: ["marketing@company.com"]
  },
  {
    id: "3",
    name: "Product Demo Request",
    description: "Lead generation form for demo requests",
    type: "lead-gen", 
    status: "published",
    fields: [
      { id: "1", type: "text", label: "Full Name", required: true, order: 1 },
      { id: "2", type: "email", label: "Work Email", required: true, order: 2 },
      { id: "3", type: "text", label: "Company Name", required: true, order: 3 },
      { id: "4", type: "select", label: "Company Size", required: true, order: 4, options: ["1-10", "11-50", "51-200", "201-1000", "1000+"] },
      { id: "5", type: "textarea", label: "What would you like to see in the demo?", required: false, order: 5 }
    ],
    submissions: 89,
    conversionRate: 24.5,
    views: 363,
    createdAt: "2024-01-12T00:00:00Z",
    lastModified: "2024-01-20T09:15:00Z",
    thankYouMessage: "Thanks! Our sales team will contact you within 2 business days to schedule your demo.",
    notifications: ["sales@company.com", "demos@company.com"]
  },
  {
    id: "4",
    name: "Customer Feedback Survey",
    description: "Post-purchase satisfaction survey",
    type: "survey",
    status: "draft",
    fields: [
      { id: "1", type: "radio", label: "How satisfied are you with our product?", required: true, order: 1, options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"] },
      { id: "2", type: "radio", label: "How likely are you to recommend us?", required: true, order: 2, options: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"] },
      { id: "3", type: "textarea", label: "What could we improve?", required: false, order: 3 }
    ],
    submissions: 0,
    conversionRate: 0,
    views: 0,
    createdAt: "2024-01-22T00:00:00Z",
    lastModified: "2024-01-22T16:45:00Z",
    thankYouMessage: "Thank you for your feedback! Your input helps us improve our service.",
    notifications: ["feedback@company.com"]
  }
];

const mockSubmissions: FormSubmission[] = [
  {
    id: "1",
    formId: "1", 
    data: {
      "Full Name": "John Smith",
      "Email Address": "john.smith@example.com",
      "Company": "Acme Corp",
      "Message": "Interested in learning more about your enterprise solutions."
    },
    submittedAt: "2024-01-23T10:30:00Z",
    source: "Website",
    ipAddress: "192.168.1.1",
    userAgent: "Mozilla/5.0...",
    status: "new"
  },
  {
    id: "2",
    formId: "2",
    data: {
      "Email Address": "sarah.wilson@email.com",
      "First Name": "Sarah"
    },
    submittedAt: "2024-01-23T09:15:00Z",
    source: "Blog Sidebar",
    ipAddress: "192.168.1.2", 
    userAgent: "Mozilla/5.0...",
    status: "new"
  }
];

export default function FormsPage() {
  const [forms, setForms] = useState<Form[]>(mockForms);
  const [submissions, setSubmissions] = useState<FormSubmission[]>(mockSubmissions);
  const [activeTab, setActiveTab] = useState<"forms" | "submissions" | "builder">("forms");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [builderForm, setBuilderForm] = useState<Form | null>(null);

  const filteredForms = forms.filter(form =>
    form.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    form.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "published": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "draft": return <Clock className="h-4 w-4 text-gray-600" />;
      case "paused": return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "archived": return <XCircle className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  const getFormTypeIcon = (type: string) => {
    switch (type) {
      case "contact": return <Mail className="h-4 w-4" />;
      case "newsletter": return <Users className="h-4 w-4" />;
      case "survey": return <BarChart3 className="h-4 w-4" />;
      case "registration": return <FileText className="h-4 w-4" />;
      case "feedback": return <MessageSquare className="h-4 w-4" />;
      case "lead-gen": return <Target className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getFieldTypeIcon = (type: string) => {
    switch (type) {
      case "email": return <Mail className="h-3 w-3" />;
      case "tel": return <Phone className="h-3 w-3" />;
      case "url": return <ExternalLink className="h-3 w-3" />;
      case "date": return <Calendar className="h-3 w-3" />;
      case "textarea": return <FileText className="h-3 w-3" />;
      case "select": return <ChevronDown className="h-3 w-3" />;
      case "radio": return <RadioButton className="h-3 w-3" />;
      case "checkbox": return <CheckSquare className="h-3 w-3" />;
      default: return <Type className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Form Builder</h1>
          <p className="text-muted-foreground">
            Create custom forms to capture leads, feedback, and customer information.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button onClick={() => setActiveTab("builder")}>
            <Plus className="h-4 w-4 mr-2" />
            Create Form
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b">
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === "forms" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("forms")}
        >
          Forms
        </button>
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === "submissions" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("submissions")}
        >
          Submissions
        </button>
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === "builder" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("builder")}
        >
          Form Builder
        </button>
      </div>

      {/* Forms Tab */}
      {activeTab === "forms" && (
        <>
          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search forms..."
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

          {/* Forms Overview */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Forms</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{forms.length}</div>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +2 this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {forms.reduce((sum, form) => sum + form.submissions, 0).toLocaleString()}
                </div>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +15% vs last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Conversion Rate</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(forms.reduce((sum, form) => sum + form.conversionRate, 0) / forms.length).toFixed(1)}%
                </div>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +2.1% improvement
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Forms</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {forms.filter(form => form.status === "published").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Currently collecting data
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Forms List */}
          <div className="space-y-4">
            {filteredForms.map((form) => (
              <Card key={form.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        {getFormTypeIcon(form.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{form.name}</h3>
                          {getStatusIcon(form.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                            form.status === "published" 
                              ? "bg-green-100 text-green-700"
                              : form.status === "draft"
                                ? "bg-gray-100 text-gray-700"
                                : form.status === "paused"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                          }`}>
                            {form.status}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-sm mt-1">{form.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{form.fields.length} fields</span>
                          <span>Updated {new Date(form.lastModified).toLocaleDateString()}</span>
                          <span className="capitalize">{form.type} form</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => setSelectedForm(form)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setBuilderForm(form)}>
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Form Metrics */}
                  <div className="grid gap-6 md:grid-cols-4">
                    <div>
                      <div className="text-2xl font-bold">{form.views.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Views</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{form.submissions.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Submissions</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{form.conversionRate}%</div>
                      <div className="text-sm text-muted-foreground">Conversion Rate</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">
                        {form.submissions > 0 ? Math.round(form.views / form.submissions) : 0}:1
                      </div>
                      <div className="text-sm text-muted-foreground">View to Submit</div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                    <Button size="sm">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    <Button size="sm" variant="outline">
                      <Code className="h-4 w-4 mr-2" />
                      Embed Code
                    </Button>
                    <Button size="sm" variant="outline">
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </Button>
                    <Button size="sm" variant="outline">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Submissions Tab */}
      {activeTab === "submissions" && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              Review and manage form submissions from all your forms.
            </p>
            <div className="flex items-center gap-2">
              <select className="px-3 py-2 border rounded-md bg-background">
                <option value="all">All Forms</option>
                {forms.map(form => (
                  <option key={form.id} value={form.id}>{form.name}</option>
                ))}
              </select>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Submissions</CardTitle>
              <CardDescription>Latest form submissions across all forms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {submissions.map((submission) => {
                  const form = forms.find(f => f.id === submission.formId);
                  return (
                    <div key={submission.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{form?.name}</h4>
                          <div className="text-sm text-muted-foreground">
                            Submitted {new Date(submission.submittedAt).toLocaleString()} • {submission.source}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            submission.status === "new" 
                              ? "bg-blue-100 text-blue-700"
                              : submission.status === "contacted"
                                ? "bg-yellow-100 text-yellow-700"
                                : submission.status === "qualified"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-purple-100 text-purple-700"
                          }'}>
                            {submission.status}
                          </span>
                          <Button size="sm" variant="outline">
                            <Mail className="h-4 w-4 mr-2" />
                            Contact
                          </Button>
                        </div>
                      </div>

                      <div className="grid gap-2 md:grid-cols-2">
                        {Object.entries(submission.data).map(([key, value]) => (
                          <div key={key} className="text-sm">
                            <span className="font-medium text-muted-foreground">{key}:</span>
                            <span className="ml-2">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Form Builder Tab */}
      {activeTab === "builder" && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Form Builder Panel */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Form Builder</CardTitle>
                <CardDescription>
                  {builderForm ? 'Editing: ${builderForm.name}' : "Create a new form by adding fields"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Form Settings */}
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium">Form Name</label>
                      <input 
                        type="text" 
                        className="w-full mt-1 px-3 py-2 border rounded-md" 
                        placeholder="Enter form name"
                        defaultValue={builderForm?.name}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Form Type</label>
                      <select className="w-full mt-1 px-3 py-2 border rounded-md" defaultValue={builderForm?.type}>
                        <option value="contact">Contact Form</option>
                        <option value="newsletter">Newsletter Signup</option>
                        <option value="survey">Survey</option>
                        <option value="registration">Registration</option>
                        <option value="feedback">Feedback</option>
                        <option value="lead-gen">Lead Generation</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <input 
                      type="text" 
                      className="w-full mt-1 px-3 py-2 border rounded-md" 
                      placeholder="Brief description of the form"
                      defaultValue={builderForm?.description}
                    />
                  </div>
                </div>

                {/* Form Fields */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Form Fields</h4>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Field
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {(builderForm?.fields || []).sort((a, b) => a.order - b.order).map((field) => (
                      <div key={field.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <DragHandleDots2 className="h-4 w-4 text-muted-foreground cursor-move" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {getFieldTypeIcon(field.type)}
                            <span className="font-medium">{field.label}</span>
                            {field.required && <span className="text-red-500">*</span>}
                          </div>
                          <div className="text-sm text-muted-foreground capitalize">{field.type} field</div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost">
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    {(!builderForm?.fields || builderForm.fields.length === 0) && (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No fields added yet</p>
                        <p className="text-sm">Add fields to start building your form</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <Button variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Form
                  </Button>
                  <div className="flex items-center gap-2">
                    <Button variant="outline">Save Draft</Button>
                    <Button>Publish Form</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Field Types Panel */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Field Types</CardTitle>
                <CardDescription>Drag fields to add them to your form</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {[
                    { type: "text", label: "Text Input", icon: Type },
                    { type: "email", label: "Email", icon: Mail },
                    { type: "textarea", label: "Textarea", icon: FileText },
                    { type: "select", label: "Dropdown", icon: ChevronDown },
                    { type: "radio", label: "Radio Buttons", icon: RadioButton },
                    { type: "checkbox", label: "Checkbox", icon: CheckSquare },
                    { type: "number", label: "Number", icon: Hash },
                    { type: "tel", label: "Phone", icon: Phone },
                    { type: "url", label: "URL", icon: ExternalLink },
                    { type: "date", label: "Date", icon: Calendar },
                  ].map((fieldType) => (
                    <div
                      key={fieldType.type}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <fieldType.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{fieldType.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Form Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Thank You Message</label>
                  <textarea 
                    className="w-full mt-1 px-3 py-2 border rounded-md text-sm" 
                    rows={3}
                    placeholder="Message shown after form submission"
                    defaultValue={builderForm?.thankYouMessage}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Redirect URL (optional)</label>
                  <input 
                    type="url" 
                    className="w-full mt-1 px-3 py-2 border rounded-md" 
                    placeholder="https://example.com/thank-you"
                    defaultValue={builderForm?.redirectUrl}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email Notifications</label>
                  <input 
                    type="text" 
                    className="w-full mt-1 px-3 py-2 border rounded-md" 
                    placeholder="email@example.com (comma separated)"
                    defaultValue={builderForm?.notifications?.join(", ")}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}