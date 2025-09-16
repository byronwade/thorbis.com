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
  Clock,
  Calendar,
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
  Save,
  Send,
  FileText,
  Activity,
  Timer,
  PlayCircle,
  PauseCircle,
  StopCircle,
  TrendingUp,
  BarChart3,
  Zap,
  Target,
  AlertCircle,
  Users,
  MapPin,
  Coffee,
  User,
  Building,
  CalendarDays,
  DollarSign,
  Award,
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
const timesheetOverview = {
  totalEmployees: 24,
  activeTimesheets: 18,
  completedThisWeek: 156,
  pendingApprovals: 8,
  averageHoursPerWeek: 42.3,
  overtimeHours: 23.5,
  billableHours: 892.5,
  aiAnomalies: 3,
  approvalRate: 94.2
};

const timeEntries = [
  {
    id: "TE-001",
    employeeId: "EMP-001",
    employeeName: "Sarah Johnson",
    department: "Engineering",
    date: "2024-02-15",
    project: "Mobile App Redesign",
    task: "Frontend Development", 
    startTime: "09:00",
    endTime: "17:30",
    breakTime: 60,
    totalHours: 7.5,
    billableHours: 7.5,
    hourlyRate: 85,
    status: "approved",
    location: "Office - SF",
    notes: "Implemented new user interface components",
    approvedBy: "John Smith",
    approvedDate: "2024-02-16",
    aiScore: 98.2,
    aiInsights: [
      "Consistent work pattern - high productivity",
      "Project on track with time estimates",
      "No overtime concerns"
    ]
  },
  {
    id: "TE-002", 
    employeeId: "EMP-002",
    employeeName: "Mike Chen",
    department: "Engineering",
    date: "2024-02-15",
    project: "API Integration",
    task: "Backend Services",
    startTime: "08:30",
    endTime: "19:15",
    breakTime: 75,
    totalHours: 9.5,
    billableHours: 8.0,
    hourlyRate: 75,
    status: "pending",
    location: "Remote",
    notes: "Extended debugging session for payment gateway integration",
    approvedBy: null,
    approvedDate: null,
    aiScore: 85.7,
    aiInsights: [
      "Overtime detected - verify necessity",
      "Extended work session may indicate complexity issues", 
      "Consider task breakdown for future estimates"
    ]
  },
  {
    id: "TE-003",
    employeeId: "EMP-003", 
    employeeName: "Lisa Wang",
    department: "Marketing",
    date: "2024-02-15",
    project: "Q1 Campaign",
    task: "Content Creation",
    startTime: "09:15",
    endTime: "17:00",
    breakTime: 45,
    totalHours: 7.25,
    billableHours: 6.5,
    hourlyRate: 65,
    status: "submitted",
    location: "Office - NYC",
    notes: "Created campaign materials and coordinated with design team",
    approvedBy: null,
    approvedDate: null,
    aiScore: 92.1,
    aiInsights: [
      "Good time allocation across tasks",
      "Collaborative work pattern identified",
      "Meeting project deadlines consistently"
    ]
  },
  {
    id: "TE-004",
    employeeId: "EMP-004",
    employeeName: "David Wilson", 
    department: "Sales",
    date: "2024-02-14",
    project: "Client Meetings",
    task: "Sales Calls",
    startTime: "08:00",
    endTime: "16:30",
    breakTime: 90,
    totalHours: 7.0,
    billableHours: 7.0,
    hourlyRate: 55,
    status: "rejected",
    location: "Field Work",
    notes: "Client visits and follow-up calls",
    approvedBy: "Robert Taylor",
    approvedDate: "2024-02-15",
    rejectionReason: "Missing mileage documentation",
    aiScore: 78.3,
    aiInsights: [
      "Field work hours pattern normal",
      "Documentation gaps detected",
      "Follow company expense policy"
    ]
  }
];

const projects = [
  {
    id: "PROJ-001",
    name: "Mobile App Redesign",
    client: "TechCorp Inc",
    budget: 120000,
    hourlyRate: 85,
    hoursAllocated: 800,
    hoursUsed: 456,
    status: "active",
    deadline: "2024-04-15",
    team: ["Sarah Johnson", "Mike Chen", "Alex Rivera"],
    billable: true
  },
  {
    id: "PROJ-002", 
    name: "API Integration",
    client: "StartupXYZ",
    budget: 45000,
    hourlyRate: 75,
    hoursAllocated: 400,
    hoursUsed: 234,
    status: "active",
    deadline: "2024-03-20",
    team: ["Mike Chen", "Jennifer Lee"],
    billable: true
  },
  {
    id: "PROJ-003",
    name: "Q1 Marketing Campaign",
    client: "Internal",
    budget: 25000,
    hourlyRate: 65,
    hoursAllocated: 300,
    hoursUsed: 189,
    status: "active",
    deadline: "2024-03-31",
    team: ["Lisa Wang", "Marketing Team"],
    billable: false
  }
];

const approvalWorkflow = [
  {
    id: "pending-001",
    employeeName: "Mike Chen",
    department: "Engineering",
    weekEnding: "2024-02-16",
    totalHours: 42.5,
    overtimeHours: 2.5,
    billableAmount: 3187.50,
    submittedDate: "2024-02-16",
    approver: "John Smith",
    priority: "normal",
    aiFlags: ["Overtime detected", "Late submission"],
    aiRecommendation: "Approve with overtime justification review"
  },
  {
    id: "pending-002",
    employeeName: "Lisa Wang", 
    department: "Marketing",
    weekEnding: "2024-02-16",
    totalHours: 40.0,
    overtimeHours: 0,
    billableAmount: 2600.00,
    submittedDate: "2024-02-16",
    approver: "Jennifer Davis",
    priority: "normal", 
    aiFlags: [],
    aiRecommendation: "Approve - no issues detected"
  },
  {
    id: "pending-003",
    employeeName: "Tom Garcia",
    department: "Design",
    weekEnding: "2024-02-16", 
    totalHours: 38.0,
    overtimeHours: 0,
    billableAmount: 2660.00,
    submittedDate: "2024-02-17",
    approver: "Sarah Martinez",
    priority: "urgent",
    aiFlags: ["Inconsistent hours pattern", "Missing project codes"],
    aiRecommendation: "Request clarification before approval"
  }
];

const aiInsights = [
  {
    type: "efficiency",
    title: "Project Time Allocation Optimization",
    description: "Mobile App Redesign project showing 15% faster completion than estimated. AI recommends adjusting future estimates for similar projects.",
    confidence: 94.2,
    impact: "medium",
    affectedProjects: 1,
    recommendation: "Update project templates with refined estimates"
  },
  {
    type: "anomaly",
    title: "Unusual Overtime Pattern Detected", 
    description: "Engineering team showing 23% increase in overtime hours this week. AI analysis suggests workload redistribution needed.",
    confidence: 88.7,
    impact: "high",
    affectedEmployees: 4,
    recommendation: "Review project priorities and resource allocation"
  },
  {
    type: "billing",
    title: "Billable Hours Optimization",
    description: "Non-billable administrative tasks consuming 12% of total time. AI suggests streamlining admin processes.",
    confidence: 91.3,
    impact: "high", 
    potentialSavings: 8500,
    recommendation: "Implement automated admin task workflows"
  },
  {
    type: "compliance",
    title: "Break Time Compliance Issue",
    description: "3 employees consistently taking breaks shorter than required by labor law. Automated reminders recommended.",
    confidence: 96.1,
    impact: "medium",
    affectedEmployees: 3,
    recommendation: "Enable smart break notifications"
  }
];

export function TimesheetManagement() {
  const [selectedEntry, setSelectedEntry] = useState(timeEntries[0]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTimer, setActiveTimer] = useState(false);
  const [currentTime, setCurrentTime] = useState("00:00:00");

  const filteredEntries = timeEntries.filter(entry => {
    const matchesSearch = entry.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.project.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || entry.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Timer logic would be implemented here
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTimer) {
      interval = setInterval(() => {
        const now = new Date();
        setCurrentTime(now.toLocaleTimeString());
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimer]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Timesheet Management</h1>
          <p className="text-muted-foreground mt-2">
            AI-powered time tracking with smart approvals and project insights
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Timesheets
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-payroll-primary to-payroll-secondary">
                <Plus className="mr-2 h-4 w-4" />
                Add Time Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Time Entry</DialogTitle>
                <DialogDescription>
                  Create a new time entry with AI-powered project suggestions
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="employee">Employee</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="emp-001">Sarah Johnson</SelectItem>
                        <SelectItem value="emp-002">Mike Chen</SelectItem>
                        <SelectItem value="emp-003">Lisa Wang</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" type="date" defaultValue="2024-02-15" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="project">Project</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project..." />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="task">Task</Label>
                    <Input id="task" placeholder="Brief task description" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input id="startTime" type="time" />
                  </div>
                  <div>
                    <Label htmlFor="endTime">End Time</Label>
                    <Input id="endTime" type="time" />
                  </div>
                  <div>
                    <Label htmlFor="breakTime">Break (minutes)</Label>
                    <Input id="breakTime" type="number" placeholder="60" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" placeholder="Describe work completed..." rows={3} />
                </div>
                <Alert>
                  <Brain className="h-4 w-4" />
                  <AlertDescription>
                    AI will validate time entries, suggest project codes, and flag potential issues.
                  </AlertDescription>
                </Alert>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline">Save Draft</Button>
                  <Button>
                    <Zap className="mr-2 h-4 w-4" />
                    Submit with AI Check
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* AI Timer Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
              <Timer className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">Smart Time Tracker</h3>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                AI-powered time tracking • Project auto-detection • Break reminders
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-900 dark:text-blue-100 font-mono">
                {currentTime}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Current Session</div>
            </div>
            <div className="flex space-x-2">
              <Button 
                size="sm" 
                variant={activeTimer ? "destructive" : "default"}
                onClick={() => setActiveTimer(!activeTimer)}
              >
                {activeTimer ? (
                  <><StopCircle className="mr-2 h-4 w-4" /> Stop</>
                ) : (
                  <><PlayCircle className="mr-2 h-4 w-4" /> Start</>
                )}
              </Button>
              <Button size="sm" variant="outline">
                <PauseCircle className="mr-2 h-4 w-4" />
                Break
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{timesheetOverview.activeTimesheets}</p>
                <p className="text-xs text-muted-foreground">Active</p>
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
                <p className="text-2xl font-bold text-blue-600">{timesheetOverview.pendingApprovals}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
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
                <p className="text-2xl font-bold text-purple-600">{timesheetOverview.billableHours}h</p>
                <p className="text-xs text-muted-foreground">Billable</p>
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
                <p className="text-2xl font-bold text-orange-600">{timesheetOverview.overtimeHours}h</p>
                <p className="text-xs text-muted-foreground">Overtime</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{timesheetOverview.aiAnomalies}</p>
                <p className="text-xs text-muted-foreground">AI Alerts</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="entries" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="entries">Time Entries</TabsTrigger>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="entries" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-3 w-3" />
                Advanced Filter
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="mr-2 h-3 w-3" />
                Bulk Import
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                Time Entries - Week of {new Date().toLocaleDateString()}
              </CardTitle>
              <CardDescription>
                Real-time time tracking with AI validation and smart project matching
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Billable</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>AI Score</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{entry.employeeName}</p>
                          <p className="text-xs text-muted-foreground">{entry.department}</p>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{entry.project}</p>
                          <p className="text-xs text-muted-foreground">{entry.task}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{entry.totalHours}h</span>
                          {entry.totalHours > 8 && (
                            <Badge variant="outline" className="text-orange-600">
                              OT
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-3 w-3 text-green-600" />
                          <span>{(entry.billableHours * entry.hourlyRate).toLocaleString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {entry.status === "approved" ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Approved
                          </Badge>
                        ) : entry.status === "pending" ? (
                          <Badge className="bg-orange-100 text-orange-800">
                            <Clock className="mr-1 h-3 w-3" />
                            Pending
                          </Badge>
                        ) : entry.status === "submitted" ? (
                          <Badge className="bg-blue-100 text-blue-800">
                            <Send className="mr-1 h-3 w-3" />
                            Submitted
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <AlertCircle className="mr-1 h-3 w-3" />
                            Rejected
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Brain className="h-3 w-3 text-purple-600" />
                          <span className="text-sm font-medium">{entry.aiScore}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="ghost" onClick={() => setSelectedEntry(entry)}>
                                <Eye className="h-3 w-3" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl">
                              <DialogHeader>
                                <DialogTitle>Time Entry Details - {entry.employeeName}</DialogTitle>
                                <DialogDescription>
                                  Detailed view with AI analysis and approval workflow
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid grid-cols-2 gap-6">
                                <div>
                                  <h4 className="font-semibold mb-3">Entry Information</h4>
                                  <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <label className="text-sm font-medium text-muted-foreground">Date</label>
                                        <p>{new Date(entry.date).toLocaleDateString()}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-muted-foreground">Location</label>
                                        <p className="flex items-center space-x-1">
                                          <MapPin className="h-3 w-3" />
                                          <span>{entry.location}</span>
                                        </p>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                      <div>
                                        <label className="text-sm font-medium text-muted-foreground">Start</label>
                                        <p className="font-medium">{entry.startTime}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-muted-foreground">End</label>
                                        <p className="font-medium">{entry.endTime}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-muted-foreground">Break</label>
                                        <p className="font-medium">{entry.breakTime}m</p>
                                      </div>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-muted-foreground">Notes</label>
                                      <p className="text-sm">{entry.notes}</p>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-3">AI Analysis</h4>
                                  <div className="space-y-3">
                                    <div>
                                      <label className="text-sm font-medium text-muted-foreground">AI Confidence Score</label>
                                      <div className="flex items-center space-x-2 mt-1">
                                        <Progress value={entry.aiScore} className="flex-1" />
                                        <span className="text-sm font-medium">{entry.aiScore}%</span>
                                      </div>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-muted-foreground">AI Insights</label>
                                      <div className="space-y-2 mt-2">
                                        {entry.aiInsights.map((insight, i) => (
                                          <Alert key={i}>
                                            <Brain className="h-4 w-4" />
                                            <AlertDescription className="text-xs">{insight}</AlertDescription>
                                          </Alert>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex justify-between items-center pt-4 border-t">
                                <div className="text-sm text-muted-foreground">
                                  Total: {entry.totalHours}h • Billable: ${(entry.billableHours * entry.hourlyRate).toLocaleString()}
                                </div>
                                <div className="flex space-x-2">
                                  <Button size="sm" variant="outline">
                                    <Edit className="mr-2 h-3 w-3" />
                                    Edit
                                  </Button>
                                  {entry.status === "pending" && (
                                    <>
                                      <Button size="sm" variant="destructive">
                                        Reject
                                      </Button>
                                      <Button size="sm">
                                        <CheckCircle className="mr-2 h-3 w-3" />
                                        Approve
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
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
        </TabsContent>

        <TabsContent value="approvals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
                Pending Approvals
              </CardTitle>
              <CardDescription>
                AI-powered approval workflow with smart recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {approvalWorkflow.map((approval, index) => (
                  <motion.div
                    key={approval.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{approval.employeeName}</h4>
                          <p className="text-sm text-muted-foreground">{approval.department}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <div className="text-xs text-muted-foreground">
                              Week ending {new Date(approval.weekEnding).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Submitted {new Date(approval.submittedDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="grid grid-cols-3 gap-4 mb-2">
                          <div className="text-center">
                            <div className="text-lg font-bold text-blue-600">{approval.totalHours}h</div>
                            <div className="text-xs text-muted-foreground">Total</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-orange-600">{approval.overtimeHours}h</div>
                            <div className="text-xs text-muted-foreground">Overtime</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-600">${approval.billableAmount.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">Amount</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {approval.aiFlags.length > 0 && (
                            <Badge variant="outline" className="text-orange-600">
                              <AlertTriangle className="mr-1 h-3 w-3" />
                              {approval.aiFlags.length} flags
                            </Badge>
                          )}
                          <Badge variant={approval.priority === "urgent" ? "destructive" : "default"}>
                            {approval.priority}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    {approval.aiFlags.length > 0 && (
                      <div className="mt-3 p-3 rounded bg-orange-50 dark:bg-orange-950/20">
                        <div className="flex items-start space-x-2">
                          <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-orange-800 dark:text-orange-200">AI Flags Detected</p>
                            <ul className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                              {approval.aiFlags.map((flag, i) => (
                                <li key={i}>• {flag}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    <Alert className="mt-3">
                      <Brain className="h-4 w-4" />
                      <AlertDescription>
                        <strong>AI Recommendation:</strong> {approval.aiRecommendation}
                      </AlertDescription>
                    </Alert>

                    <div className="flex justify-between items-center mt-4">
                      <div className="text-sm text-muted-foreground">
                        Approver: {approval.approver}
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="mr-2 h-3 w-3" />
                          Review Details
                        </Button>
                        <Button size="sm" variant="destructive">
                          Reject
                        </Button>
                        <Button size="sm">
                          <CheckCircle className="mr-2 h-3 w-3" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <div className="grid gap-4">
            {projects.map((project, index) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/20">
                          <Briefcase className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold">{project.name}</h4>
                          <p className="text-sm text-muted-foreground">{project.client}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant={project.status === "active" ? "default" : "secondary"}>
                              {project.status}
                            </Badge>
                            <Badge variant="outline" className={project.billable ? "text-green-600" : "text-neutral-600"}>
                              {project.billable ? "Billable" : "Internal"}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <label className="text-xs text-muted-foreground">Budget</label>
                          <p className="text-lg font-bold text-green-600">${project.budget.toLocaleString()}</p>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Hours Used</label>
                          <p className="text-lg font-bold text-blue-600">{project.hoursUsed}h</p>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Hours Remaining</label>
                          <p className="text-lg font-bold text-orange-600">{project.hoursAllocated - project.hoursUsed}h</p>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Hourly Rate</label>
                          <p className="text-lg font-bold text-purple-600">${project.hourlyRate}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="text-sm font-medium text-muted-foreground">Progress</label>
                        <div className="flex items-center space-x-2 mt-1">
                          <Progress value={(project.hoursUsed / project.hoursAllocated) * 100} className="flex-1" />
                          <span className="text-sm font-medium">
                            {Math.round((project.hoursUsed / project.hoursAllocated) * 100)}%
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Team</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {project.team.map((member, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              <Users className="mr-1 h-2 w-2" />
                              {member}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right ml-6">
                      <div className="mb-4">
                        <div className="text-sm text-muted-foreground mb-1">Deadline</div>
                        <div className="text-lg font-bold text-red-600">
                          {new Date(project.deadline).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <BarChart3 className="mr-2 h-3 w-3" />
                          Analytics
                        </Button>
                        <Button size="sm">
                          <Settings className="mr-2 h-3 w-3" />
                          Manage
                        </Button>
                      </div>
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
                        insight.type === "efficiency" 
                          ? "bg-green-100 dark:bg-green-900/20" 
                          : insight.type === "anomaly"
                          ? "bg-red-100 dark:bg-red-900/20"
                          : insight.type === "billing"
                          ? "bg-blue-100 dark:bg-blue-900/20"
                          : "bg-orange-100 dark:bg-orange-900/20"
                      }'}>
                        {insight.type === "efficiency" ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : insight.type === "anomaly" ? (
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        ) : insight.type === "billing" ? (
                          <DollarSign className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Target className="h-4 w-4 text-orange-600" />
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
                          <div className="text-sm">
                            {insight.affectedEmployees && (
                              <span className="font-medium">Affects: {insight.affectedEmployees} employees</span>
                            )}
                            {insight.affectedProjects && (
                              <span className="font-medium">Affects: {insight.affectedProjects} projects</span>
                            )}
                            {insight.potentialSavings && (
                              <span className="font-medium text-green-600">Potential savings: ${insight.potentialSavings.toLocaleString()}</span>
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
                  Weekly Time Distribution
                </CardTitle>
                <CardDescription>
                  Hours breakdown across projects and departments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Weekly time analytics chart will be displayed here</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Productivity Trends
                </CardTitle>
                <CardDescription>
                  AI-powered productivity analysis and forecasting
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Productivity trend analysis will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Time Tracking Summary</CardTitle>
              <CardDescription>
                Overall metrics with AI-generated insights and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">{timesheetOverview.averageHoursPerWeek}h</div>
                  <div className="text-sm text-muted-foreground">Average Weekly Hours</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{timesheetOverview.approvalRate}%</div>
                  <div className="text-sm text-muted-foreground">Approval Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">{timesheetOverview.billableHours}h</div>
                  <div className="text-sm text-muted-foreground">Total Billable Hours</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">{Math.round((timesheetOverview.billableHours / (timesheetOverview.billableHours + timesheetOverview.overtimeHours)) * 100)}%</div>
                  <div className="text-sm text-muted-foreground">Billable Ratio</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}