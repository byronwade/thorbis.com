"use client";

import React, { useState } from "react";

import {
  Brain,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  AlertTriangle,
  Star,
  Plus,
  Eye,
  Settings,
  Search,
  Filter,
  Plane,
  Coffee,
  Heart,
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
  TrendingUp,
  DollarSign,
  FileText,
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
const ptoOverview = {
  totalEmployees: 24,
  pendingRequests: 7,
  approvedThisMonth: 18,
  totalPtoDays: 528,
  usedPtoDays: 287,
  utilizationRate: 54.4,
  averageBalance: 22,
  costSavings: 8400 // AI optimization savings
};

const ptoTypes = [
  {
    id: "vacation",
    name: "Vacation",
    icon: "🏖️",
    description: "Paid time off for rest and relaxation",
    defaultDays: 20,
    carryover: 5,
    color: "blue",
    requests: 45,
    approved: 42,
    pending: 3
  },
  {
    id: "sick",
    name: "Sick Leave",
    icon: "🤒",
    description: "Medical leave for illness or medical appointments",
    defaultDays: 10,
    carryover: 0,
    color: "red",
    requests: 23,
    approved: 23,
    pending: 0
  },
  {
    id: "personal",
    name: "Personal Days",
    icon: "🏠",
    description: "Personal time off for individual needs",
    defaultDays: 5,
    carryover: 2,
    color: "green",
    requests: 18,
    approved: 16,
    pending: 2
  },
  {
    id: "bereavement",
    name: "Bereavement",
    icon: "🕊️",
    description: "Time off for mourning and funeral arrangements",
    defaultDays: 3,
    carryover: 0,
    color: "gray",
    requests: 2,
    approved: 2,
    pending: 0
  },
  {
    id: "parental",
    name: "Parental Leave",
    icon: "👶",
    description: "Maternity/paternity leave for new parents",
    defaultDays: 84,
    carryover: 0,
    color: "purple",
    requests: 1,
    approved: 1,
    pending: 0
  }
];

const recentRequests = [
  {
    id: "req-001",
    employee: "Sarah Johnson",
    employeeId: "EMP-001",
    type: "vacation",
    startDate: "2024-02-15",
    endDate: "2024-02-19",
    totalDays: 5,
    status: "pending",
    requestDate: "2024-01-20T10:30:00Z",
    reason: "Family vacation to Hawaii",
    manager: "John Smith",
    aiRecommendation: "Approve - Good coverage available, low impact period",
    aiScore: 94.2,
    coverage: ["Mike Chen", "Lisa Wang"],
    workload: "low"
  },
  {
    id: "req-002",
    employee: "Mike Chen",
    employeeId: "EMP-002",
    type: "sick",
    startDate: "2024-01-22",
    endDate: "2024-01-22",
    totalDays: 1,
    status: "approved",
    requestDate: "2024-01-22T08:15:00Z",
    reason: "Doctor appointment",
    manager: "John Smith",
    aiRecommendation: "Auto-approved - Single sick day within policy",
    aiScore: 100,
    coverage: [],
    workload: "minimal"
  },
  {
    id: "req-003",
    employee: "Lisa Wang",
    employeeId: "EMP-003",
    type: "personal",
    startDate: "2024-02-28",
    endDate: "2024-02-28",
    totalDays: 1,
    status: "approved",
    requestDate: "2024-01-25T14:20:00Z",
    reason: "DMV appointment",
    manager: "John Smith",
    aiRecommendation: "Approved - No conflicts detected",
    aiScore: 96.8,
    coverage: ["Sarah Johnson"],
    workload: "low"
  },
  {
    id: "req-004",
    employee: "David Wilson",
    employeeId: "EMP-004",
    type: "vacation",
    startDate: "2024-03-10",
    endDate: "2024-03-17",
    totalDays: 6,
    status: "pending",
    requestDate: "2024-01-28T09:45:00Z",
    reason: "Spring break with family",
    manager: "Jennifer Davis",
    aiRecommendation: "Caution - Multiple team members out same period",
    aiScore: 67.3,
    coverage: ["Emily Rodriguez"],
    workload: "high"
  },
  {
    id: "req-005",
    employee: "Emily Rodriguez",
    employeeId: "EMP-005",
    type: "parental",
    startDate: "2024-04-01",
    endDate: "2024-06-23",
    totalDays: 84,
    status: "approved",
    requestDate: "2024-01-15T16:00:00Z",
    reason: "Maternity leave",
    manager: "Jennifer Davis",
    aiRecommendation: "Pre-approved - Legal requirement, coverage plan in place",
    aiScore: 100,
    coverage: ["Temp Employee", "David Wilson"],
    workload: "critical"
  }
];

const employeeBalances = [
  {
    employeeId: "EMP-001",
    name: "Sarah Johnson",
    department: "Engineering",
    vacation: { available: 18, used: 7, carryover: 5 },
    sick: { available: 10, used: 2, carryover: 0 },
    personal: { available: 4, used: 1, carryover: 0 },
    totalAvailable: 32,
    utilizationRate: 23.5
  },
  {
    employeeId: "EMP-002",
    name: "Mike Chen",
    department: "Engineering",
    vacation: { available: 15, used: 10, carryover: 0 },
    sick: { available: 8, used: 4, carryover: 0 },
    personal: { available: 3, used: 2, carryover: 0 },
    totalAvailable: 26,
    utilizationRate: 61.5
  },
  {
    employeeId: "EMP-003",
    name: "Lisa Wang",
    department: "Marketing",
    vacation: { available: 20, used: 5, carryover: 0 },
    sick: { available: 10, used: 1, carryover: 0 },
    personal: { available: 5, used: 0, carryover: 0 },
    totalAvailable: 35,
    utilizationRate: 17.1
  },
  {
    employeeId: "EMP-004",
    name: "David Wilson",
    department: "Sales",
    vacation: { available: 22, used: 8, carryover: 2 },
    sick: { available: 10, used: 3, carryover: 0 },
    personal: { available: 5, used: 2, carryover: 0 },
    totalAvailable: 37,
    utilizationRate: 35.1
  }
];

const aiInsights = [
  {
    type: "utilization",
    title: "Low PTO Utilization Alert",
    description: "Average utilization is 54%, well below the healthy 70-80% range. Consider encouraging time off to prevent burnout.",
    impact: "medium",
    recommendation: "Send wellness reminders to employees with low utilization",
    confidence: 87.3,
    affectedEmployees: 8
  },
  {
    type: "scheduling",
    title: "March Coverage Gap Risk",
    description: "AI detected potential coverage gap in Engineering team during March 10-17. 3 team members have overlapping requests.",
    impact: "high",
    recommendation: "Stagger vacation dates or arrange temporary coverage",
    confidence: 94.8,
    affectedEmployees: 3
  },
  {
    type: "policy",
    title: "Carryover Optimization",
    description: "12 employees will lose unused vacation days at year-end. AI suggests policy adjustment or proactive notifications.",
    impact: "medium", 
    recommendation: "Implement use-it-or-lose-it reminders 60 days before year-end",
    confidence: 91.2,
    affectedEmployees: 12
  }
];

export function TimeOffManagement() {
  const [selectedTab, setSelectedTab] = useState("requests");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRequests = recentRequests.filter(req => {
    const matchesSearch = req.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Time Off Management</h1>
          <p className="text-muted-foreground mt-2">
            AI-powered PTO tracking with intelligent scheduling and coverage management
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            PTO Report
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-payroll-primary to-payroll-secondary">
                <Plus className="mr-2 h-4 w-4" />
                Request Time Off
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>New Time Off Request</DialogTitle>
                <DialogDescription>
                  Submit a new PTO request with AI-powered conflict detection
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="employee-select">Employee</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee..." />
                      </SelectTrigger>
                      <SelectContent>
                        {employeeBalances.map((emp) => (
                          <SelectItem key={emp.employeeId} value={emp.employeeId}>
                            {emp.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="pto-type">PTO Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type..." />
                      </SelectTrigger>
                      <SelectContent>
                        {ptoTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            <span className="mr-2">{type.icon}</span>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input type="date" id="start-date" />
                  </div>
                  <div>
                    <Label htmlFor="end-date">End Date</Label>
                    <Input type="date" id="end-date" />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="reason">Reason (Optional)</Label>
                  <Input
                    id="reason"
                    placeholder="Brief description of time off..."
                  />
                </div>
                
                <Alert>
                  <Brain className="h-4 w-4" />
                  <AlertDescription>
                    AI will automatically check for scheduling conflicts and suggest coverage options.
                  </AlertDescription>
                </Alert>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline">Save Draft</Button>
                  <Button>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Request
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* AI PTO Assistant */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-cyan-950/20 dark:to-teal-950/20 rounded-lg p-6 border border-cyan-200 dark:border-cyan-800"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-cyan-100 dark:bg-cyan-900/30">
              <Calendar className="h-6 w-6 text-cyan-600" />
            </div>
            <div>
              <h3 className="font-semibold text-cyan-900 dark:text-cyan-100">AI Time Off Manager</h3>
              <p className="text-cyan-700 dark:text-cyan-300 text-sm">
                {ptoOverview.pendingRequests} pending requests • {ptoOverview.utilizationRate}% utilization • {ptoOverview.averageBalance} avg balance
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-cyan-900 dark:text-cyan-100 mb-1">
              ${ptoOverview.costSavings.toLocaleString()}
            </div>
            <div className="text-sm text-cyan-700 dark:text-cyan-300">Annual Optimization Savings</div>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Requests</p>
                <p className="text-2xl font-bold text-orange-600">{ptoOverview.pendingRequests}</p>
                <p className="text-xs text-orange-600">Need manager approval</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Utilization Rate</p>
                <p className="text-2xl font-bold text-payroll-primary">{ptoOverview.utilizationRate}%</p>
                <p className="text-xs text-muted-foreground">{ptoOverview.usedPtoDays} of {ptoOverview.totalPtoDays} days</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Balance</p>
                <p className="text-2xl font-bold text-green-600">{ptoOverview.averageBalance}</p>
                <p className="text-xs text-muted-foreground">days per employee</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold text-blue-600">{ptoOverview.approvedThisMonth}</p>
                <p className="text-xs text-muted-foreground">requests approved</p>
              </div>
              <CheckCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="requests" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="balances">Employee Balances</TabsTrigger>
          <TabsTrigger value="calendar">Team Calendar</TabsTrigger>
          <TabsTrigger value="policies">PTO Policies</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search requests..."
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="denied">Denied</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredRequests.length} of {recentRequests.length} requests
            </div>
          </div>

          <div className="grid gap-4">
            {filteredRequests.map((request, index) => (
              <Card key={request.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
                          <span className="text-lg">
                            {ptoTypes.find(t => t.id === request.type)?.icon || "📅"}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold">{request.employee}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline">
                              {ptoTypes.find(t => t.id === request.type)?.name || request.type}
                            </Badge>
                            <Badge variant={
                              request.status === "approved" ? "default" :
                              request.status === "pending" ? "secondary" : "destructive"
                            }>
                              {request.status}
                            </Badge>
                            <Badge variant="outline" className="text-purple-600">
                              <Brain className="mr-1 h-3 w-3" />
                              AI Score: {request.aiScore}%
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <label className="text-xs text-muted-foreground">Start Date</label>
                          <p className="text-sm font-medium">
                            {new Date(request.startDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">End Date</label>
                          <p className="text-sm font-medium">
                            {new Date(request.endDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Total Days</label>
                          <p className="text-sm font-medium">{request.totalDays} days</p>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Manager</label>
                          <p className="text-sm font-medium">{request.manager}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="text-sm font-medium text-muted-foreground">Reason</label>
                        <p className="text-sm mt-1">{request.reason}</p>
                      </div>

                      {request.coverage.length > 0 && (
                        <div className="mb-4">
                          <label className="text-sm font-medium text-muted-foreground mb-2 block">Coverage Plan</label>
                          <div className="flex flex-wrap gap-2">
                            {request.coverage.map((person, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                <Users className="mr-1 h-3 w-3" />
                                {person}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <Alert>
                        <Brain className="h-4 w-4" />
                        <AlertDescription>
                          <strong>AI Recommendation:</strong> {request.aiRecommendation}
                        </AlertDescription>
                      </Alert>
                    </div>
                    
                    <div className="text-right ml-6">
                      <div className="mb-4">
                        <div className="text-lg font-bold text-blue-600 mb-1">
                          {request.workload}
                        </div>
                        <div className="text-sm text-muted-foreground">Impact Level</div>
                      </div>
                      
                      <div className="flex space-x-2">
                        {request.status === "pending" && (
                          <>
                            <Button size="sm" variant="outline">
                              <CheckCircle className="mr-2 h-3 w-3" />
                              Approve
                            </Button>
                            <Button size="sm" variant="destructive">
                              <AlertTriangle className="mr-2 h-3 w-3" />
                              Deny
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="outline">
                          <Eye className="mr-2 h-3 w-3" />
                          Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="balances" className="space-y-6">
          <div className="grid gap-4">
            {employeeBalances.map((employee, index) => (
              <Card key={employee.employeeId} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/20">
                          <UserCheck className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold">{employee.name}</h4>
                          <p className="text-sm text-muted-foreground">{employee.department}</p>
                        </div>
                        <Badge variant="outline" className="ml-auto">
                          {employee.utilizationRate}% utilized
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                          <div className="text-2xl font-bold text-blue-600 mb-1">
                            {employee.vacation.available}
                          </div>
                          <div className="text-sm text-muted-foreground mb-2">Vacation Days</div>
                          <div className="text-xs text-muted-foreground">
                            Used: {employee.vacation.used} | Carryover: {employee.vacation.carryover}
                          </div>
                        </div>
                        
                        <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-950/20">
                          <div className="text-2xl font-bold text-red-600 mb-1">
                            {employee.sick.available}
                          </div>
                          <div className="text-sm text-muted-foreground mb-2">Sick Days</div>
                          <div className="text-xs text-muted-foreground">
                            Used: {employee.sick.used}
                          </div>
                        </div>
                        
                        <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950/20">
                          <div className="text-2xl font-bold text-green-600 mb-1">
                            {employee.personal.available}
                          </div>
                          <div className="text-sm text-muted-foreground mb-2">Personal Days</div>
                          <div className="text-xs text-muted-foreground">
                            Used: {employee.personal.used}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right ml-6">
                      <div className="mb-4">
                        <div className="text-2xl font-bold text-payroll-primary mb-1">
                          {employee.totalAvailable}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Available</div>
                      </div>
                      
                      <Button size="sm" variant="outline">
                        <Settings className="mr-2 h-3 w-3" />
                        Adjust Balance
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Team Time Off Calendar
              </CardTitle>
              <CardDescription>
                Visual overview of team availability and scheduled time off
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Interactive Calendar View</h3>
                <p className="text-muted-foreground mb-4">
                  Calendar component would integrate here showing team schedules and time off requests
                </p>
                <div className="flex justify-center space-x-4">
                  <Badge variant="default" className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    Approved
                  </Badge>
                  <Badge variant="secondary" className="flex items-center">
                    <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                    Pending
                  </Badge>
                  <Badge variant="outline" className="flex items-center">
                    <div className="w-3 h-3 bg-neutral-400 rounded-full mr-2"></div>
                    Available
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" className="space-y-6">
          <div className="grid gap-6">
            {ptoTypes.map((type, index) => (
              <Card key={type.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-3xl">{type.icon}</span>
                      <div>
                        <h4 className="text-xl font-semibold">{type.name}</h4>
                        <p className="text-sm text-muted-foreground">{type.description}</p>
                        
                        <div className="grid grid-cols-3 gap-4 mt-4">
                          <div>
                            <label className="text-xs text-muted-foreground">Annual Allocation</label>
                            <p className="text-sm font-medium">{type.defaultDays} days</p>
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Carryover</label>
                            <p className="text-sm font-medium">{type.carryover} days</p>
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">This Year</label>
                            <p className="text-sm font-medium">{type.requests} requests</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="mb-4">
                        <div className="text-lg font-bold text-green-600 mb-1">
                          {Math.round((type.approved / type.requests) * 100)}%
                        </div>
                        <div className="text-sm text-muted-foreground">Approval Rate</div>
                      </div>
                      
                      <Button size="sm" variant="outline">
                        <Settings className="mr-2 h-3 w-3" />
                        Edit Policy
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4">
            {aiInsights.map((insight, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={'p-2 rounded-full ${
                      insight.type === "utilization" 
                        ? "bg-orange-100 dark:bg-orange-900/20" 
                        : insight.type === "scheduling"
                        ? "bg-red-100 dark:bg-red-900/20"
                        : "bg-blue-100 dark:bg-blue-900/20"
                    }'}>
                      {insight.type === "utilization" ? (
                        <TrendingUp className="h-4 w-4 text-orange-600" />
                      ) : insight.type === "scheduling" ? (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      ) : (
                        <FileText className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{insight.title}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge variant={insight.impact === "high" ? "destructive" : "secondary"}>
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
                        <div className="text-sm font-medium text-blue-600">
                          Affects: {insight.affectedEmployees} employees
                        </div>
                        <Button size="sm">
                          {insight.recommendation}
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