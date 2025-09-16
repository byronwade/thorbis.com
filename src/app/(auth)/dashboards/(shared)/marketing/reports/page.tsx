"use client";

import { useState } from "react";
;
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  Filter,
  Plus,
  Eye,
  Edit3,
  Copy,
  Trash2,
  MoreHorizontal,
  FileText,
  Mail,
  Users,
  Target,
  DollarSign,
  MousePointer,
  Share2,
  Globe,
  Smartphone,
  Monitor,
  Clock,
  RefreshCw,
  Settings,
  Star,
  Zap,
  CheckCircle,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Equal,
  PieChart,
  LineChart,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';


interface Report {
  id: string;
  name: string;
  description: string;
  type: "performance" | "conversion" | "audience" | "channel" | "roi" | "custom";
  schedule: "manual" | "daily" | "weekly" | "monthly";
  lastRun: string;
  nextRun?: string;
  recipients: string[];
  metrics: ReportMetric[];
  filters: ReportFilter[];
  status: "active" | "paused" | "draft";
  createdBy: string;
  createdAt: string;
}

interface ReportMetric {
  id: string;
  name: string;
  value: number;
  previousValue?: number;
  change?: number;
  changeType?: "up" | "down" | "stable";
  unit: "number" | "percentage" | "currency" | "time";
  format?: string;
}

interface ReportFilter {
  field: string;
  operator: string;
  value: string | number;
}

interface DashboardWidget {
  id: string;
  title: string;
  type: "metric" | "chart" | "table" | "progress";
  size: "small" | "medium" | "large";
  data: unknown;
  position: { x: number; y: number };
}

const mockReports: Report[] = [
  {
    id: "1",
    name: "Weekly Marketing Performance",
    description: "Comprehensive overview of all marketing channels and campaigns",
    type: "performance",
    schedule: "weekly",
    lastRun: "2024-01-22T09:00:00Z",
    nextRun: "2024-01-29T09:00:00Z",
    recipients: ["marketing@company.com", "ceo@company.com"],
    metrics: [
      { id: "1", name: "Total Revenue", value: 42500, previousValue: 38200, change: 11.25, changeType: "up", unit: "currency" },
      { id: "2", name: "Conversions", value: 245, previousValue: 220, change: 11.36, changeType: "up", unit: "number" },
      { id: "3", name: "Conversion Rate", value: 3.8, previousValue: 3.2, change: 18.75, changeType: "up", unit: "percentage" },
      { id: "4", name: "Cost per Acquisition", value: 45, previousValue: 52, change: -13.46, changeType: "down", unit: "currency" }
    ],
    filters: [
      { field: "date_range", operator: "last", value: 7 },
      { field: "status", operator: "=", value: "published" }
    ],
    status: "active",
    createdBy: "Sarah Wilson",
    createdAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "2",
    name: "Email Campaign Analysis",
    description: "Detailed analysis of email marketing performance and engagement",
    type: "channel",
    schedule: "weekly", 
    lastRun: "2024-01-21T10:30:00Z",
    nextRun: "2024-01-28T10:30:00Z",
    recipients: ["marketing@company.com"],
    metrics: [
      { id: "1", name: "Total Sent", value: 15420, previousValue: 14200, change: 8.59, changeType: "up", unit: "number" },
      { id: "2", name: "Open Rate", value: 24.5, previousValue: 22.8, change: 7.46, changeType: "up", unit: "percentage" },
      { id: "3", name: "Click Rate", value: 4.2, previousValue: 3.8, change: 10.53, changeType: "up", unit: "percentage" },
      { id: "4", name: "Revenue from Email", value: 8950, previousValue: 7200, change: 24.31, changeType: "up", unit: "currency" }
    ],
    filters: [
      { field: "channel", operator: "=", value: "email" },
      { field: "date_range", operator: "last", value: 7 }
    ],
    status: "active", 
    createdBy: "John Doe",
    createdAt: "2024-01-05T00:00:00Z"
  },
  {
    id: "3",
    name: "ROI by Channel",
    description: "Return on investment analysis across all marketing channels",
    type: "roi",
    schedule: "monthly",
    lastRun: "2024-01-01T08:00:00Z", 
    nextRun: "2024-02-01T08:00:00Z",
    recipients: ["finance@company.com", "marketing@company.com", "ceo@company.com"],
    metrics: [
      { id: "1", name: "Total Ad Spend", value: 12500, previousValue: 11800, change: 5.93, changeType: "up", unit: "currency" },
      { id: "2", name: "Total Revenue", value: 52800, previousValue: 45600, change: 15.79, changeType: "up", unit: "currency" },
      { id: "3", name: "Overall ROI", value: 322, previousValue: 286, change: 12.59, changeType: "up", unit: "percentage" },
      { id: "4", name: "Best Performing Channel", value: 0, unit: "number", format: "Email Marketing" }
    ],
    filters: [
      { field: "date_range", operator: "last", value: 30 }
    ],
    status: "active",
    createdBy: "Mike Johnson", 
    createdAt: "2023-12-15T00:00:00Z"
  },
  {
    id: "4",
    name: "Custom Conversion Funnel",
    description: "Custom report tracking user journey from awareness to purchase",
    type: "custom",
    schedule: "manual",
    lastRun: "2024-01-20T14:15:00Z",
    recipients: ["growth@company.com"],
    metrics: [
      { id: "1", name: "Website Visitors", value: 18500, previousValue: 16200, change: 14.20, changeType: "up", unit: "number" },
      { id: "2", name: "Leads Generated", value: 650, previousValue: 520, change: 25.0, changeType: "up", unit: "number" },
      { id: "3", name: "Qualified Leads", value: 180, previousValue: 145, change: 24.14, changeType: "up", unit: "number" },
      { id: "4", name: "Customers", value: 45, previousValue: 38, change: 18.42, changeType: "up", unit: "number" }
    ],
    filters: [
      { field: "source", operator: "in", value: "organic,paid,social" },
      { field: "date_range", operator: "last", value: 14 }
    ],
    status: "draft",
    createdBy: "Sarah Wilson",
    createdAt: "2024-01-18T00:00:00Z"
  }
];

const mockWidgets: DashboardWidget[] = [
  {
    id: "1",
    title: "Revenue This Month", 
    type: "metric",
    size: "small",
    data: { value: "$124,500", change: "+12.5%", trend: "up" },
    position: { x: 0, y: 0 }
  },
  {
    id: "2",
    title: "Conversions",
    type: "metric", 
    size: "small",
    data: { value: "1,245", change: "+8.2%", trend: "up" },
    position: { x: 1, y: 0 }
  },
  {
    id: "3",
    title: "Channel Performance",
    type: "chart",
    size: "medium",
    data: {
      labels: ["Email", "Social", "Search", "Direct"],
      values: [35, 25, 28, 12]
    },
    position: { x: 0, y: 1 }
  },
  {
    id: "4", 
    title: "Conversion Funnel",
    type: "progress",
    size: "medium",
    data: {
      steps: [
        { name: "Visitors", value: 10000, percentage: 100 },
        { name: "Leads", value: 800, percentage: 8 },
        { name: "Qualified", value: 240, percentage: 2.4 },
        { name: "Customers", value: 60, percentage: 0.6 }
      ]
    },
    position: { x: 2, y: 1 }
  }
];

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>(mockReports);
  const [widgets, setWidgets] = useState<DashboardWidget[]>(mockWidgets);
  const [activeTab, setActiveTab] = useState<"dashboard" | "reports" | "builder">("dashboard");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [dateRange, setDateRange] = useState("30d");

  const getTrendIcon = (changeType: string) => {
    switch (changeType) {
      case "up": return <ArrowUpRight className="h-3 w-3 text-green-600" />;
      case "down": return <ArrowDownRight className="h-3 w-3 text-red-600" />;
      case "stable": return <Equal className="h-3 w-3 text-gray-600" />;
      default: return null;
    }
  };

  const getTrendColor = (changeType: string) => {
    switch (changeType) {
      case "up": return "text-green-600";
      case "down": return "text-red-600";
      case "stable": return "text-gray-600";
      default: return "text-muted-foreground";
    }
  };

  const formatValue = (value: number, unit: string, format?: string) => {
    if (format) return format;
    
    switch (unit) {
      case "currency": return `$${value.toLocaleString()}`;
      case "percentage": return `${value}%`;
      case "time": return `${value}s`;
      default: return value.toLocaleString();
    }
  };

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case "performance": return <BarChart3 className="h-4 w-4" />;
      case "conversion": return <Target className="h-4 w-4" />;
      case "audience": return <Users className="h-4 w-4" />;
      case "channel": return <Share2 className="h-4 w-4" />;
      case "roi": return <DollarSign className="h-4 w-4" />;
      case "custom": return <Settings className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Create custom reports and dashboards to track your marketing performance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="px-3 py-2 border rounded-md bg-background"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="365d">Last year</option>
          </select>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Report
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b">
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === "dashboard" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("dashboard")}
        >
          Dashboard
        </button>
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === "reports" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("reports")}
        >
          Saved Reports
        </button>
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === "builder" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("builder")}
        >
          Report Builder
        </button>
      </div>

      {/* Dashboard Tab */}
      {activeTab === "dashboard" && (
        <>
          {/* Dashboard Overview */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$124,500</div>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +12.5% from last period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversions</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,245</div>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +8.2% from last period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Website Traffic</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">45,230</div>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +15.3% from last period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ROI</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.2x</div>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +0.8x from last period
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Custom Dashboard Widgets */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Channel Performance
                </CardTitle>
                <CardDescription>Revenue contribution by channel</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>Email Marketing</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">35%</div>
                      <div className="text-sm text-green-600">+12%</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Share2 className="h-4 w-4" />
                      <span>Social Media</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">28%</div>
                      <div className="text-sm text-green-600">+5%</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MousePointer className="h-4 w-4" />
                      <span>Paid Search</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">25%</div>
                      <div className="text-sm text-red-600">-3%</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <span>Direct Traffic</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">12%</div>
                      <div className="text-sm text-gray-600">0%</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Conversion Funnel
                </CardTitle>
                <CardDescription>User journey from visitor to customer</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Website Visitors", value: 10000, percentage: 100 },
                    { name: "Leads Generated", value: 800, percentage: 8 },
                    { name: "Qualified Leads", value: 240, percentage: 2.4 },
                    { name: "Customers", value: 60, percentage: 0.6 }
                  ].map((step, index) => (
                    <div key={step.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{step.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {step.value.toLocaleString()} ({step.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary rounded-full h-2 transition-all duration-300"
                          style={{ width: `${step.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest marketing activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                    <div>
                      <div className="text-sm font-medium">Email campaign sent</div>
                      <div className="text-xs text-muted-foreground">15,420 recipients • 2h ago</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                    <div>
                      <div className="text-sm font-medium">Social post published</div>
                      <div className="text-xs text-muted-foreground">LinkedIn, Twitter • 4h ago</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-2" />
                    <div>
                      <div className="text-sm font-medium">A/B test completed</div>
                      <div className="text-xs text-muted-foreground">CTA button test • 6h ago</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-orange-500 mt-2" />
                    <div>
                      <div className="text-sm font-medium">Form submission</div>
                      <div className="text-xs text-muted-foreground">Demo request form • 8h ago</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Saved Reports Tab */}
      {activeTab === "reports" && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              Manage your saved reports and automated reporting schedules.
            </p>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export All
            </Button>
          </div>

          <div className="space-y-4">
            {reports.map((report) => (
              <Card key={report.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        {getReportTypeIcon(report.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{report.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                            report.status === "active" 
                              ? "bg-green-100 text-green-700"
                              : report.status === "paused"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-700"
                          }'}>
                            {report.status}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-sm mt-1">{report.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="capitalize">{report.type} report</span>
                          <span className="capitalize">{report.schedule} schedule</span>
                          <span>Last run: {new Date(report.lastRun).toLocaleDateString()}</span>
                          <span>{report.recipients.length} recipients</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => setSelectedReport(report)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Report Metrics Preview */}
                  <div className="grid gap-4 md:grid-cols-4 mb-4">
                    {report.metrics.slice(0, 4).map((metric) => (
                      <div key={metric.id} className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-lg font-bold">
                          {formatValue(metric.value, metric.unit, metric.format)}
                        </div>
                        <div className="text-sm text-muted-foreground">{metric.name}</div>
                        {metric.change && (
                          <div className={'text-xs flex items-center justify-center gap-1 mt-1 ${getTrendColor(metric.changeType || "stable")}'}>
                            {getTrendIcon(metric.changeType || "stable")}
                            {metric.change > 0 ? "+" : ""}{metric.change}%
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t">
                    <Button size="sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Run Now
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline">
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </Button>
                    <Button size="sm" variant="outline">
                      <Mail className="h-4 w-4 mr-2" />
                      Send Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Report Builder Tab */}
      {activeTab === "builder" && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Report Configuration */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Report Builder</CardTitle>
                <CardDescription>Create custom reports with your preferred metrics and filters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Report Settings */}
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium">Report Name</label>
                      <input 
                        type="text" 
                        className="w-full mt-1 px-3 py-2 border rounded-md" 
                        placeholder="Enter report name"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Report Type</label>
                      <select className="w-full mt-1 px-3 py-2 border rounded-md">
                        <option value="performance">Performance Report</option>
                        <option value="conversion">Conversion Report</option>
                        <option value="audience">Audience Report</option>
                        <option value="channel">Channel Report</option>
                        <option value="roi">ROI Report</option>
                        <option value="custom">Custom Report</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <textarea 
                      className="w-full mt-1 px-3 py-2 border rounded-md" 
                      placeholder="Brief description of the report"
                      rows={2}
                    />
                  </div>
                </div>

                {/* Metrics Selection */}
                <div>
                  <h4 className="font-medium mb-4">Select Metrics</h4>
                  <div className="grid gap-2 md:grid-cols-2">
                    {[
                      { id: "revenue", name: "Total Revenue", category: "Financial" },
                      { id: "conversions", name: "Conversions", category: "Performance" },
                      { id: "conversion_rate", name: "Conversion Rate", category: "Performance" },
                      { id: "cpa", name: "Cost per Acquisition", category: "Financial" },
                      { id: "roas", name: "Return on Ad Spend", category: "Financial" },
                      { id: "traffic", name: "Website Traffic", category: "Audience" },
                      { id: "bounce_rate", name: "Bounce Rate", category: "Audience" },
                      { id: "session_duration", name: "Avg Session Duration", category: "Audience" }
                    ].map((metric) => (
                      <label key={metric.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                        <input type="checkbox" className="rounded" />
                        <div>
                          <div className="font-medium">{metric.name}</div>
                          <div className="text-sm text-muted-foreground">{metric.category}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Filters */}
                <div>
                  <h4 className="font-medium mb-4">Filters</h4>
                  <div className="space-y-3">
                    <div className="grid gap-3 md:grid-cols-3">
                      <select className="px-3 py-2 border rounded-md">
                        <option value="">Select Field</option>
                        <option value="date_range">Date Range</option>
                        <option value="channel">Channel</option>
                        <option value="campaign">Campaign</option>
                        <option value="source">Traffic Source</option>
                        <option value="device">Device Type</option>
                      </select>
                      <select className="px-3 py-2 border rounded-md">
                        <option value="">Select Operator</option>
                        <option value="=">=</option>
                        <option value="!=">&ne;</option>
                        <option value=">">&gt;</option>
                        <option value="<">&lt;</option>
                        <option value="contains">Contains</option>
                        <option value="in">In</option>
                      </select>
                      <input 
                        type="text" 
                        className="px-3 py-2 border rounded-md" 
                        placeholder="Value"
                      />
                    </div>
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Filter
                    </Button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <Button variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Report
                  </Button>
                  <div className="flex items-center gap-2">
                    <Button variant="outline">Save Draft</Button>
                    <Button>Create Report</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Templates & Schedule */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Report Templates</CardTitle>
                <CardDescription>Start with a pre-built template</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: "Marketing Performance", description: "Overall marketing metrics" },
                    { name: "Email Analytics", description: "Email campaign performance" },
                    { name: "Social Media ROI", description: "Social media return on investment" },
                    { name: "Conversion Funnel", description: "User journey analysis" },
                    { name: "Traffic Sources", description: "Website traffic breakdown" }
                  ].map((template, index) => (
                    <div key={index} className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                      <div className="font-medium">{template.name}</div>
                      <div className="text-sm text-muted-foreground">{template.description}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Schedule & Delivery</CardTitle>
                <CardDescription>Automate report generation and delivery</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Schedule</label>
                  <select className="w-full mt-1 px-3 py-2 border rounded-md">
                    <option value="manual">Manual</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Recipients</label>
                  <input 
                    type="text" 
                    className="w-full mt-1 px-3 py-2 border rounded-md" 
                    placeholder="email@example.com (comma separated)"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Format</label>
                  <select className="w-full mt-1 px-3 py-2 border rounded-md">
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                    <option value="csv">CSV</option>
                    <option value="email">Email Summary</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}