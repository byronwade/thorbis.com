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
  Users,
  User,
  Crown,
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
  Award,
  Briefcase,
  Building,
  GitBranch,
  Network,
  Layers,
  TreePine,
  Zap,
  Target,
  TrendingUp,
  BarChart3,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Star,
  UserPlus,
  UserMinus,
  UserCheck,
  UserX,
  Shuffle,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  ArrowLeft,
  Move,
  Share2,
  Copy,
  Printer,
  Save,
  RefreshCw,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Home,
  Compass,
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
const orgOverview = {
  totalEmployees: 47,
  departments: 8,
  managementLevels: 4,
  directReports: 23,
  avgTeamSize: 5.9,
  vacantPositions: 3,
  recentChanges: 7,
  aiSuggestions: 12
};

const employees = [
  {
    id: "EMP-001",
    name: "Robert Chen",
    title: "Chief Executive Officer",
    department: "Executive",
    level: 1,
    managerId: null,
    directReports: 3,
    email: "robert.chen@company.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    startDate: "2019-03-15",
    avatar: "/avatars/robert-chen.jpg",
    status: "active",
    workMode: "hybrid",
    skills: ["Leadership", "Strategy", "Vision"],
    performanceRating: 4.8,
    teamSize: 47,
    span: "Company-wide",
    nextReview: "2024-03-15",
    aiInsights: [
      "Strong leadership with consistent team growth",
      "High employee satisfaction under their management",
      "Consider succession planning for key positions"
    ]
  },
  {
    id: "EMP-002",
    name: "Sarah Johnson",
    title: "Chief Technology Officer",
    department: "Engineering",
    level: 2,
    managerId: "EMP-001",
    directReports: 12,
    email: "sarah.johnson@company.com",
    phone: "+1 (555) 234-5678",
    location: "San Francisco, CA",
    startDate: "2020-01-20",
    avatar: "/avatars/sarah-johnson.jpg",
    status: "active",
    workMode: "hybrid",
    skills: ["Engineering Leadership", "Architecture", "Innovation"],
    performanceRating: 4.7,
    teamSize: 15,
    span: "Engineering",
    nextReview: "2024-01-20",
    aiInsights: [
      "Technical excellence with strong team development",
      "Leading key innovation initiatives successfully",
      "Potential candidate for expanded leadership role"
    ]
  },
  {
    id: "EMP-003",
    name: "Michael Rodriguez",
    title: "Chief Marketing Officer",
    department: "Marketing",
    level: 2,
    managerId: "EMP-001",
    directReports: 8,
    email: "michael.rodriguez@company.com",
    phone: "+1 (555) 345-6789",
    location: "New York, NY",
    startDate: "2020-06-10",
    avatar: "/avatars/michael-rodriguez.jpg",
    status: "active",
    workMode: "hybrid",
    skills: ["Digital Marketing", "Brand Strategy", "Analytics"],
    performanceRating: 4.5,
    teamSize: 10,
    span: "Marketing & Sales",
    nextReview: "2024-06-10",
    aiInsights: [
      "Strong marketing performance with measurable results",
      "Excellent cross-functional collaboration",
      "Consider expanding team to support growth"
    ]
  },
  {
    id: "EMP-004",
    name: "Jennifer Davis",
    title: "VP of Human Resources",
    department: "HR",
    level: 2,
    managerId: "EMP-001",
    directReports: 4,
    email: "jennifer.davis@company.com",
    phone: "+1 (555) 456-7890",
    location: "San Francisco, CA",
    startDate: "2019-11-05",
    avatar: "/avatars/jennifer-davis.jpg",
    status: "active",
    workMode: "office",
    skills: ["People Management", "Culture", "Compliance"],
    performanceRating: 4.6,
    teamSize: 6,
    span: "HR & Operations",
    nextReview: "2024-11-05",
    aiInsights: [
      "Excellent people leadership and culture building",
      "Strong compliance record and employee satisfaction",
      "Key contributor to company culture initiatives"
    ]
  },
  {
    id: "EMP-005",
    name: "David Wilson",
    title: "Senior Engineering Manager",
    department: "Engineering",
    level: 3,
    managerId: "EMP-002",
    directReports: 8,
    email: "david.wilson@company.com",
    phone: "+1 (555) 567-8901",
    location: "San Francisco, CA",
    startDate: "2021-02-15",
    avatar: "/avatars/david-wilson.jpg",
    status: "active",
    workMode: "hybrid",
    skills: ["Team Leadership", "Software Architecture", "Mentoring"],
    performanceRating: 4.4,
    teamSize: 8,
    span: "Backend Engineering",
    nextReview: "2024-02-15",
    aiInsights: [
      "Strong technical leadership with growing team",
      "Excellent mentoring skills for junior developers",
      "Ready for senior leadership opportunities"
    ]
  },
  {
    id: "EMP-006",
    name: "Lisa Wang",
    title: "Senior Product Manager",
    department: "Product",
    level: 3,
    managerId: "EMP-002",
    directReports: 3,
    email: "lisa.wang@company.com",
    phone: "+1 (555) 678-9012",
    location: "San Francisco, CA",
    startDate: "2021-08-01",
    avatar: "/avatars/lisa-wang.jpg",
    status: "active",
    workMode: "hybrid",
    skills: ["Product Strategy", "User Research", "Data Analysis"],
    performanceRating: 4.6,
    teamSize: 3,
    span: "Product Development",
    nextReview: "2024-08-01",
    aiInsights: [
      "Outstanding product leadership with user focus",
      "Strong data-driven decision making",
      "High potential for VP-level role"
    ]
  },
  {
    id: "EMP-007",
    name: "Alex Kim",
    title: "Software Engineer",
    department: "Engineering",
    level: 4,
    managerId: "EMP-005",
    directReports: 0,
    email: "alex.kim@company.com",
    phone: "+1 (555) 789-0123",
    location: "San Francisco, CA",
    startDate: "2022-05-20",
    avatar: "/avatars/alex-kim.jpg",
    status: "active",
    workMode: "remote",
    skills: ["React", "Node.js", "TypeScript"],
    performanceRating: 4.3,
    teamSize: 1,
    span: "Individual Contributor",
    nextReview: "2024-05-20",
    aiInsights: [
      "High-performing individual contributor",
      "Strong technical skills with growth potential",
      "Consider leadership development opportunities"
    ]
  }
];

const departments = [
  {
    id: "executive",
    name: "Executive",
    head: "Robert Chen",
    headId: "EMP-001",
    employeeCount: 1,
    budget: 500000,
    description: "Executive leadership and strategic direction",
    color: "purple",
    locations: ["San Francisco"],
    subDepartments: []
  },
  {
    id: "engineering", 
    name: "Engineering",
    head: "Sarah Johnson",
    headId: "EMP-002",
    employeeCount: 15,
    budget: 2400000,
    description: "Product development and technical innovation",
    color: "blue",
    locations: ["San Francisco", "Remote"],
    subDepartments: ["Frontend", "Backend", "DevOps", "QA"]
  },
  {
    id: "marketing",
    name: "Marketing",
    head: "Michael Rodriguez", 
    headId: "EMP-003",
    employeeCount: 8,
    budget: 800000,
    description: "Brand, growth, and customer acquisition",
    color: "green",
    locations: ["New York", "San Francisco"],
    subDepartments: ["Digital Marketing", "Content", "Design", "Analytics"]
  },
  {
    id: "sales",
    name: "Sales",
    head: "TBD",
    headId: null,
    employeeCount: 6,
    budget: 600000,
    description: "Revenue generation and client relationships",
    color: "orange",
    locations: ["New York", "Chicago"],
    subDepartments: ["Enterprise Sales", "SMB Sales", "Sales Development"]
  },
  {
    id: "hr",
    name: "Human Resources",
    head: "Jennifer Davis",
    headId: "EMP-004", 
    employeeCount: 4,
    budget: 400000,
    description: "People operations and culture",
    color: "pink",
    locations: ["San Francisco"],
    subDepartments: ["Recruiting", "People Ops", "Compliance"]
  },
  {
    id: "finance",
    name: "Finance",
    head: "TBD",
    headId: null,
    employeeCount: 3,
    budget: 350000,
    description: "Financial planning and operations",
    color: "indigo",
    locations: ["San Francisco"],
    subDepartments: ["Accounting", "FP&A", "Payroll"]
  },
  {
    id: "operations",
    name: "Operations", 
    head: "TBD",
    headId: null,
    employeeCount: 5,
    budget: 450000,
    description: "Business operations and infrastructure",
    color: "teal",
    locations: ["San Francisco"],
    subDepartments: ["IT", "Facilities", "Security"]
  },
  {
    id: "legal",
    name: "Legal & Compliance",
    head: "TBD",
    headId: null,
    employeeCount: 2,
    budget: 300000,
    description: "Legal affairs and regulatory compliance",
    color: "red",
    locations: ["San Francisco"],
    subDepartments: ["Legal", "Compliance", "Contracts"]
  }
];

const openPositions = [
  {
    id: "POS-001",
    title: "VP of Sales",
    department: "Sales",
    level: 2,
    reportsTo: "EMP-001",
    priority: "high",
    budget: 180000,
    location: "New York, NY",
    requiredSkills: ["Sales Leadership", "Enterprise Sales", "Team Building"],
    description: "Lead sales organization and drive revenue growth",
    posted: "2024-01-15",
    candidates: 8,
    status: "active"
  },
  {
    id: "POS-002", 
    title: "Senior Frontend Engineer",
    department: "Engineering",
    level: 4,
    reportsTo: "EMP-005",
    priority: "medium",
    budget: 140000,
    location: "Remote",
    requiredSkills: ["React", "TypeScript", "Frontend Architecture"],
    description: "Senior frontend developer for product development",
    posted: "2024-02-01",
    candidates: 12,
    status: "active"
  },
  {
    id: "POS-003",
    title: "Finance Director", 
    department: "Finance",
    level: 3,
    reportsTo: "EMP-001",
    priority: "high",
    budget: 160000,
    location: "San Francisco, CA",
    requiredSkills: ["Financial Planning", "Accounting", "Analytics"],
    description: "Lead financial planning and analysis functions",
    posted: "2024-02-10",
    candidates: 5,
    status: "active"
  }
];

const organizationInsights = [
  {
    type: "structure",
    title: "Management Span Optimization",
    description: "Engineering department has optimal span of control (8 reports), while Marketing has high span (12 reports). Consider adding middle management layer.",
    confidence: 89.4,
    impact: "medium",
    affectedDepartments: 2,
    recommendation: "Add Senior Marketing Manager role",
    metrics: {
      currentSpan: "12 reports",
      optimalSpan: "6-8 reports",
      efficiency: "15% improvement expected"
    }
  },
  {
    type: "succession",
    title: "Leadership Succession Gap",
    description: "3 key leadership positions lack identified successors. High risk for business continuity if departures occur.",
    confidence: 94.2,
    impact: "high",
    affectedPositions: 3,
    recommendation: "Implement succession planning program",
    riskLevel: "high",
    timeframe: "6 months"
  },
  {
    type: "growth",
    title: "Department Growth Imbalance",
    description: "Engineering team growing 35% faster than support functions. Potential for operational bottlenecks and scaling issues.",
    confidence: 91.7,
    impact: "high",
    affectedDepartments: 4,
    recommendation: "Accelerate hiring in HR and Operations",
    growthRate: "35% vs 10%",
    projectedImpact: "Q3 2024"
  },
  {
    type: "performance",
    title: "Cross-Department Collaboration Strength",
    description: "Strong collaboration patterns between Engineering and Product teams. Model should be replicated across other departments.",
    confidence: 87.1,
    impact: "medium",
    affectedTeams: 6,
    recommendation: "Implement cross-functional team structure",
    successMetric: "25% improvement in project delivery"
  }
];

const teamAnalytics = [
  {
    metric: "Average Team Size",
    current: 5.9,
    optimal: 7.2,
    trend: "increasing",
    change: "+0.8"
  },
  {
    metric: "Management Levels", 
    current: 4,
    optimal: 4,
    trend: "stable",
    change: "0"
  },
  {
    metric: "Span of Control",
    current: 6.8,
    optimal: 7.5,
    trend: "increasing",
    change: "+1.2"
  },
  {
    metric: "Vacant Positions",
    current: 3,
    optimal: 1,
    trend: "decreasing",
    change: "-2"
  }
];

export function OrgChart() {
  const [selectedEmployee, setSelectedEmployee] = useState(employees[0]);
  const [viewMode, setViewMode] = useState("tree");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === "all" || emp.department.toLowerCase() === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  const getEmployeesByLevel = (level: number) => {
    return employees.filter(emp => emp.level === level);
  };

  const getDirectReports = (managerId: string) => {
    return employees.filter(emp => emp.managerId === managerId);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Organization Chart</h1>
          <p className="text-muted-foreground mt-2">
            Interactive organizational structure with AI-powered insights and management analytics
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Chart
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-payroll-primary to-payroll-secondary">
                <UserPlus className="mr-2 h-4 w-4" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
                <DialogDescription>
                  Add an employee to the organization with AI-powered role suggestions
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="employeeName">Full Name</Label>
                    <Input id="employeeName" placeholder="John Smith" />
                  </div>
                  <div>
                    <Label htmlFor="employeeTitle">Job Title</Label>
                    <Input id="employeeTitle" placeholder="Software Engineer" />
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
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="manager">Reports To</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select manager..." />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.filter(emp => emp.directReports > 0).map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.name} - {emp.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" placeholder="San Francisco, CA" />
                  </div>
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input id="startDate" type="date" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="john.smith@company.com" />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" placeholder="+1 (555) 123-4567" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="skills">Skills (comma-separated)</Label>
                  <Input id="skills" placeholder="React, TypeScript, Leadership" />
                </div>
                <Alert>
                  <Brain className="h-4 w-4" />
                  <AlertDescription>
                    AI will analyze the organizational structure and suggest optimal reporting relationships and team placement.
                  </AlertDescription>
                </Alert>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline">Save Draft</Button>
                  <Button>
                    <Zap className="mr-2 h-4 w-4" />
                    Add with AI Optimization
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* AI Organization Intelligence */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-lg p-6 border border-emerald-200 dark:border-emerald-800"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <Network className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-emerald-900 dark:text-emerald-100">AI Organization Intelligence</h3>
              <p className="text-emerald-700 dark:text-emerald-300 text-sm">
                {orgOverview.totalEmployees} employees • {orgOverview.departments} departments • {orgOverview.managementLevels} levels • {orgOverview.aiSuggestions} AI suggestions
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 mb-1">
              {orgOverview.avgTeamSize}
            </div>
            <div className="text-sm text-emerald-700 dark:text-emerald-300">Average Team Size</div>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{orgOverview.totalEmployees}</p>
                <p className="text-xs text-muted-foreground">Total Employees</p>
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
                <p className="text-2xl font-bold text-green-600">{orgOverview.departments}</p>
                <p className="text-xs text-muted-foreground">Departments</p>
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
                <p className="text-2xl font-bold text-purple-600">{orgOverview.directReports}</p>
                <p className="text-xs text-muted-foreground">Managers</p>
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
                <p className="text-2xl font-bold text-orange-600">{orgOverview.vacantPositions}</p>
                <p className="text-xs text-muted-foreground">Open Positions</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="chart" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="chart">Organization Chart</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="positions">Open Positions</TabsTrigger>
          <TabsTrigger value="analytics">Team Analytics</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="succession">Succession Planning</TabsTrigger>
        </TabsList>

        <TabsContent value="chart" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={viewMode} onValueChange={setViewMode}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="View mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tree">Tree View</SelectItem>
                  <SelectItem value="grid">Grid View</SelectItem>
                  <SelectItem value="list">List View</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <ZoomOut className="mr-2 h-3 w-3" />
                Zoom Out
              </Button>
              <Button variant="outline" size="sm">
                <ZoomIn className="mr-2 h-3 w-3" />
                Zoom In
              </Button>
              <Button variant="outline" size="sm">
                <Maximize2 className="mr-2 h-3 w-3" />
                Full Screen
              </Button>
            </div>
          </div>

          {viewMode === "tree" && (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-8">
                  {/* Level 1 - CEO */}
                  <div className="flex justify-center">
                    {getEmployeesByLevel(1).map((employee) => (
                      <motion.div
                        key={employee.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center cursor-pointer"
                        onClick={() => setSelectedEmployee(employee)}
                      >
                        <div className="p-4 border-2 border-purple-200 rounded-lg bg-purple-50 dark:bg-purple-950/20 hover:shadow-lg transition-shadow">
                          <div className="w-16 h-16 bg-purple-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                            <Crown className="h-8 w-8 text-white" />
                          </div>
                          <h4 className="font-semibold text-lg">{employee.name}</h4>
                          <p className="text-sm text-muted-foreground">{employee.title}</p>
                          <div className="flex items-center justify-center space-x-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {employee.directReports} reports
                            </Badge>
                            <Badge variant="outline" className="text-xs text-green-600">
                              ★ {employee.performanceRating}
                            </Badge>
                          </div>
                        </div>
                        <div className="w-px h-8 bg-border mx-auto"></div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Level 2 - C-Level */}
                  <div className="flex justify-center space-x-8">
                    {getEmployeesByLevel(2).map((employee, index) => (
                      <motion.div
                        key={employee.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="text-center cursor-pointer"
                        onClick={() => setSelectedEmployee(employee)}
                      >
                        <div className="w-px h-8 bg-border mx-auto"></div>
                        <div className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-950/20 hover:shadow-lg transition-shadow">
                          <div className="w-12 h-12 bg-blue-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                            <Shield className="h-6 w-6 text-white" />
                          </div>
                          <h5 className="font-semibold">{employee.name}</h5>
                          <p className="text-xs text-muted-foreground">{employee.title}</p>
                          <div className="flex items-center justify-center space-x-1 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {employee.directReports} reports
                            </Badge>
                            <Badge variant="outline" className="text-xs text-green-600">
                              ★ {employee.performanceRating}
                            </Badge>
                          </div>
                        </div>
                        {employee.directReports > 0 && (
                          <div className="w-px h-8 bg-border mx-auto"></div>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {/* Level 3 - Directors/Senior Managers */}
                  <div className="flex justify-center space-x-6">
                    {getEmployeesByLevel(3).map((employee, index) => (
                      <motion.div
                        key={employee.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + 0.1 * index }}
                        className="text-center cursor-pointer"
                        onClick={() => setSelectedEmployee(employee)}
                      >
                        <div className="w-px h-8 bg-border mx-auto"></div>
                        <div className="p-3 border border-green-200 rounded-lg bg-green-50 dark:bg-green-950/20 hover:shadow-lg transition-shadow">
                          <div className="w-10 h-10 bg-green-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                            <Users className="h-5 w-5 text-white" />
                          </div>
                          <h6 className="font-semibold text-sm">{employee.name}</h6>
                          <p className="text-xs text-muted-foreground">{employee.title}</p>
                          <div className="flex items-center justify-center space-x-1 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {employee.directReports} reports
                            </Badge>
                          </div>
                        </div>
                        {employee.directReports > 0 && (
                          <div className="w-px h-6 bg-border mx-auto"></div>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {/* Level 4+ - Individual Contributors */}
                  <div className="flex justify-center flex-wrap gap-4">
                    {getEmployeesByLevel(4).slice(0, 8).map((employee, index) => (
                      <motion.div
                        key={employee.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + 0.05 * index }}
                        className="cursor-pointer"
                        onClick={() => setSelectedEmployee(employee)}
                      >
                        <div className="p-2 border border-gray-200 rounded bg-gray-50 dark:bg-gray-950/20 hover:shadow-md transition-shadow w-32">
                          <div className="w-8 h-8 bg-gray-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                            <User className="h-4 w-4 text-white" />
                          </div>
                          <h6 className="font-medium text-xs text-center">{employee.name.split(' ')[0]}</h6>
                          <p className="text-xs text-muted-foreground text-center truncate">{employee.title.split(' ')[0]}</p>
                        </div>
                      </motion.div>
                    ))}
                    {getEmployeesByLevel(4).length > 8 && (
                      <div className="p-2 border border-dashed border-gray-300 rounded bg-gray-50/50 w-32 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-lg font-bold text-muted-foreground">
                            +{getEmployeesByLevel(4).length - 8}
                          </div>
                          <div className="text-xs text-muted-foreground">more</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {viewMode === "grid" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredEmployees.map((employee, index) => (
                <motion.div
                  key={employee.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 * index }}
                >
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedEmployee(employee)}>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={'w-12 h-12 rounded-full flex items-center justify-center ${
                          employee.level === 1 ? "bg-purple-600" :
                          employee.level === 2 ? "bg-blue-600" :
                          employee.level === 3 ? "bg-green-600" : "bg-gray-600"
                        }'}>
                          {employee.level === 1 ? (
                            <Crown className="h-6 w-6 text-white" />
                          ) : employee.level === 2 ? (
                            <Shield className="h-6 w-6 text-white" />
                          ) : employee.level === 3 ? (
                            <Users className="h-6 w-6 text-white" />
                          ) : (
                            <User className="h-6 w-6 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold">{employee.name}</h5>
                          <p className="text-sm text-muted-foreground truncate">{employee.title}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Department</span>
                          <Badge variant="outline" className="text-xs">
                            {employee.department}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Reports</span>
                          <span className="font-medium">{employee.directReports}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Performance</span>
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span className="font-medium">{employee.performanceRating}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Location</span>
                          <span className="font-medium text-xs">{employee.location.split(',`)[0]}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {viewMode === "list" && (
            <Card>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Manager</TableHead>
                      <TableHead>Reports</TableHead>
                      <TableHead>Performance</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              employee.level === 1 ? "bg-purple-600" :
                              employee.level === 2 ? "bg-blue-600" :
                              employee.level === 3 ? "bg-green-600" : "bg-gray-600"
                            }`}>
                              {employee.level === 1 ? (
                                <Crown className="h-4 w-4 text-white" />
                              ) : employee.level === 2 ? (
                                <Shield className="h-4 w-4 text-white" />
                              ) : employee.level === 3 ? (
                                <Users className="h-4 w-4 text-white" />
                              ) : (
                                <User className="h-4 w-4 text-white" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{employee.name}</p>
                              <p className="text-xs text-muted-foreground">{employee.location}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{employee.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{employee.department}</Badge>
                        </TableCell>
                        <TableCell>
                          {employee.managerId ? (
                            <span className="text-sm">
                              {employees.find(e => e.id === employee.managerId)?.name || "Unknown"}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">None</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {employee.directReports}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span className="text-sm font-medium">{employee.performanceRating}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button size="sm" variant="ghost" onClick={() => setSelectedEmployee(employee)}>
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Mail className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Selected Employee Details */}
          {selectedEmployee && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  {selectedEmployee.name} - Employee Details
                </CardTitle>
                <CardDescription>
                  Detailed information and AI insights for selected employee
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="col-span-2">
                    <h5 className="font-semibold mb-3">Employee Information</h5>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Title</label>
                        <p>{selectedEmployee.title}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Department</label>
                        <p>{selectedEmployee.department}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Manager</label>
                        <p>{selectedEmployee.managerId ? 
                            employees.find(e => e.id === selectedEmployee.managerId)?.name || "Unknown" : 
                            "None"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Direct Reports</label>
                        <p>{selectedEmployee.directReports}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                        <p>{new Date(selectedEmployee.startDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Performance Rating</label>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="font-medium">{selectedEmployee.performanceRating}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label className="text-sm font-medium text-muted-foreground">Contact Information</label>
                      <div className="space-y-2 mt-2">
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-blue-600" />
                          <span className="text-sm">{selectedEmployee.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-green-600" />
                          <span className="text-sm">{selectedEmployee.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-purple-600" />
                          <span className="text-sm">{selectedEmployee.location}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Skills</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedEmployee.skills.map((skill, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold mb-3">AI Insights</h5>
                    <div className="space-y-3">
                      {selectedEmployee.aiInsights.map((insight, i) => (
                        <Alert key={i} className="text-xs">
                          <Brain className="h-3 w-3" />
                          <AlertDescription>{insight}</AlertDescription>
                        </Alert>
                      ))}
                    </div>
                    
                    <div className="mt-6">
                      <h6 className="font-semibold mb-3">Team Overview</h6>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Team Size</span>
                          <span className="font-medium">{selectedEmployee.teamSize}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Span</span>
                          <span className="font-medium text-xs">{selectedEmployee.span}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Next Review</span>
                          <span className="font-medium text-xs">{new Date(selectedEmployee.nextReview).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <div className="grid gap-4">
            {departments.map((department, index) => (
              <motion.div
                key={department.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className={`p-3 rounded-full ${
                            department.color === "purple" ? "bg-purple-100 dark:bg-purple-900/20" :
                            department.color === "blue" ? "bg-blue-100 dark:bg-blue-900/20" :
                            department.color === "green" ? "bg-green-100 dark:bg-green-900/20" :
                            department.color === "orange" ? "bg-orange-100 dark:bg-orange-900/20" :
                            department.color === "pink" ? "bg-pink-100 dark:bg-pink-900/20" :
                            department.color === "indigo" ? "bg-indigo-100 dark:bg-indigo-900/20" :
                            department.color === "teal" ? "bg-teal-100 dark:bg-teal-900/20" :
                            "bg-red-100 dark:bg-red-900/20"
                          }`}>
                            <Building className={`h-6 w-6 ${
                              department.color === "purple" ? "text-purple-600" :
                              department.color === "blue" ? "text-blue-600" :
                              department.color === "green" ? "text-green-600" :
                              department.color === "orange" ? "text-orange-600" :
                              department.color === "pink" ? "text-pink-600" :
                              department.color === "indigo" ? "text-indigo-600" :
                              department.color === "teal" ? "text-teal-600" :
                              "text-red-600"
                            }`} />
                          </div>
                          <div>
                            <h4 className="text-xl font-semibold">{department.name}</h4>
                            <p className="text-sm text-muted-foreground">{department.description}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <div className="text-sm">
                                <strong>Head:</strong> {department.head || "TBD"}
                              </div>
                              <div className="text-sm">
                                <strong>Budget:</strong> ${department.budget.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <label className="text-xs text-muted-foreground">Employees</label>
                            <p className="text-lg font-bold text-blue-600">{department.employeeCount}</p>
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Locations</label>
                            <p className="text-sm font-medium">{department.locations.length}</p>
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Sub-departments</label>
                            <p className="text-sm font-medium">{department.subDepartments.length}</p>
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Budget/Employee</label>
                            <p className="text-sm font-medium">${Math.round(department.budget / department.employeeCount).toLocaleString()}</p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <label className="text-sm font-medium text-muted-foreground mb-2 block">Locations</label>
                          <div className="flex flex-wrap gap-2">
                            {department.locations.map((location, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                <MapPin className="mr-1 h-2 w-2" />
                                {location}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-muted-foreground mb-2 block">Sub-departments</label>
                          <div className="flex flex-wrap gap-2">
                            {department.subDepartments.map((subDept, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {subDept}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right ml-6">
                        <div className="flex space-x-2 mb-4">
                          <Button size="sm" variant="outline">
                            <Eye className="mr-2 h-3 w-3" />
                            View Team
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="mr-2 h-3 w-3" />
                            Manage
                          </Button>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {department.head ? "Active" : "Vacant Leadership"}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="positions" className="space-y-4">
          <div className="grid gap-4">
            {openPositions.map((position, index) => (
              <motion.div
                key={position.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className={`p-3 rounded-full ${
                            position.priority === "high" ? "bg-red-100 dark:bg-red-900/20" :
                            position.priority === "medium" ? "bg-yellow-100 dark:bg-yellow-900/20" :
                            "bg-green-100 dark:bg-green-900/20"
                          }`}>
                            <UserPlus className={`h-6 w-6 ${
                              position.priority === "high" ? "text-red-600" :
                              position.priority === "medium" ? "text-yellow-600" :
                              "text-green-600"
                            }`} />
                          </div>
                          <div>
                            <h4 className="text-xl font-semibold">{position.title}</h4>
                            <p className="text-sm text-muted-foreground">{position.description}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <div className="text-sm">
                                <strong>Department:</strong> {position.department}
                              </div>
                              <div className="text-sm">
                                <strong>Budget:</strong> ${position.budget.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <label className="text-xs text-muted-foreground">Priority</label>
                            <Badge variant={
                              position.priority === "high" ? "destructive" :
                              position.priority === "medium" ? "default" : "secondary"
                            }>
                              {position.priority}
                            </Badge>
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Candidates</label>
                            <p className="text-lg font-bold text-blue-600">{position.candidates}</p>
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Posted</label>
                            <p className="text-sm font-medium">{new Date(position.posted).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Location</label>
                            <p className="text-sm font-medium">{position.location}</p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <label className="text-sm font-medium text-muted-foreground mb-2 block">Required Skills</label>
                          <div className="flex flex-wrap gap-2">
                            {position.requiredSkills.map((skill, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="text-sm text-muted-foreground">
                          Reports to: {employees.find(emp => emp.id === position.reportsTo)?.name || "TBD"}
                        </div>
                      </div>
                      
                      <div className="text-right ml-6">
                        <div className="flex space-x-2 mb-4">
                          <Button size="sm" variant="outline">
                            <Eye className="mr-2 h-3 w-3" />
                            View Candidates
                          </Button>
                          <Button size="sm">
                            <UserPlus className="mr-2 h-3 w-3" />
                            Post Job
                          </Button>
                        </div>
                        <Badge variant={position.status === "active" ? "default" : "secondary"}>
                          {position.status}
                        </Badge>
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
                  Team Structure Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamAnalytics.map((metric, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{metric.metric}</span>
                          <div className="flex items-center space-x-2">
                            {metric.trend === "increasing" ? (
                              <TrendingUp className="h-3 w-3 text-green-600" />
                            ) : metric.trend === "decreasing" ? (
                              <TrendingUp className="h-3 w-3 text-red-600 transform rotate-180" />
                            ) : (
                              <div className="h-3 w-3 bg-gray-400 rounded-full" />
                            )}
                            <span className="text-xs text-muted-foreground">{metric.change}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="text-lg font-bold">{metric.current}</div>
                          <div className="text-xs text-muted-foreground">/ {metric.optimal} optimal</div>
                          <Progress value={(metric.current / metric.optimal) * 100} className="flex-1 h-1" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Department Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {departments.slice(0, 5).map((dept, index) => (
                    <div key={dept.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                          dept.color === "purple" ? "bg-purple-500" :
                          dept.color === "blue" ? "bg-blue-500" :
                          dept.color === "green" ? "bg-green-500" :
                          dept.color === "orange" ? "bg-orange-500" :
                          "bg-gray-500"
                        }'}></div>
                        <span className="text-sm">{dept.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress value={(dept.employeeCount / orgOverview.totalEmployees) * 100} className="w-16 h-2" />
                        <span className="text-sm font-medium">{dept.employeeCount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4">
            {organizationInsights.map((insight, index) => (
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
                        insight.type === "structure" 
                          ? "bg-blue-100 dark:bg-blue-900/20" 
                          : insight.type === "succession"
                          ? "bg-red-100 dark:bg-red-900/20"
                          : insight.type === "growth"
                          ? "bg-green-100 dark:bg-green-900/20"
                          : "bg-purple-100 dark:bg-purple-900/20"
                      }'}>
                        {insight.type === "structure" ? (
                          <Network className="h-4 w-4 text-blue-600" />
                        ) : insight.type === "succession" ? (
                          <Crown className="h-4 w-4 text-red-600" />
                        ) : insight.type === "growth" ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <Users className="h-4 w-4 text-purple-600" />
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
                        
                        {insight.metrics && (
                          <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-muted/50 rounded-lg">
                            <div className="text-center">
                              <div className="text-lg font-bold text-blue-600">{insight.metrics.currentSpan}</div>
                              <div className="text-xs text-muted-foreground">Current</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-green-600">{insight.metrics.optimalSpan}</div>
                              <div className="text-xs text-muted-foreground">Optimal</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-purple-600">{insight.metrics.efficiency}</div>
                              <div className="text-xs text-muted-foreground">Expected Gain</div>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="text-sm">
                            {insight.affectedDepartments && (
                              <span className="font-medium">Affects: {insight.affectedDepartments} departments</span>
                            )}
                            {insight.affectedPositions && (
                              <span className="font-medium">Affects: {insight.affectedPositions} positions</span>
                            )}
                            {insight.affectedTeams && (
                              <span className="font-medium">Affects: {insight.affectedTeams} teams</span>
                            )}
                            {insight.riskLevel && (
                              <span className="font-medium text-red-600 ml-4">Risk: {insight.riskLevel}</span>
                            )}
                          </div>
                          <Button size="sm" variant={insight.impact === "high" ? "destructive" : "default"}>
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

        <TabsContent value="succession" className="space-y-4">
          <Alert>
            <Crown className="h-4 w-4" />
            <AlertDescription>
              Succession planning helps ensure business continuity by identifying and developing future leaders for key positions.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="mr-2 h-5 w-5" />
                  Leadership Succession Matrix
                </CardTitle>
                <CardDescription>
                  Key leadership positions and potential successors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-4 p-3 bg-muted/50 rounded-lg">
                    <div>
                      <h6 className="font-semibold">Current Leader</h6>
                      <p className="text-sm">Sarah Johnson</p>
                      <p className="text-xs text-muted-foreground">Chief Technology Officer</p>
                    </div>
                    <div>
                      <h6 className="font-semibold">Successor 1</h6>
                      <p className="text-sm">David Wilson</p>
                      <p className="text-xs text-muted-foreground">Senior Engineering Manager</p>
                      <Badge variant="outline" className="text-xs mt-1">Ready: 80%</Badge>
                    </div>
                    <div>
                      <h6 className="font-semibold">Successor 2</h6>
                      <p className="text-sm">Lisa Wang</p>
                      <p className="text-xs text-muted-foreground">Senior Product Manager</p>
                      <Badge variant="outline" className="text-xs mt-1">Ready: 65%</Badge>
                    </div>
                    <div>
                      <h6 className="font-semibold">Risk Level</h6>
                      <Badge variant="secondary">Low</Badge>
                      <p className="text-xs text-muted-foreground mt-1">2 qualified successors</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                    <div>
                      <h6 className="font-semibold">Current Leader</h6>
                      <p className="text-sm">Michael Rodriguez</p>
                      <p className="text-xs text-muted-foreground">Chief Marketing Officer</p>
                    </div>
                    <div>
                      <h6 className="font-semibold">Successor 1</h6>
                      <p className="text-sm text-muted-foreground">None Identified</p>
                      <Badge variant="destructive" className="text-xs mt-1">Gap</Badge>
                    </div>
                    <div>
                      <h6 className="font-semibold">Successor 2</h6>
                      <p className="text-sm text-muted-foreground">None Identified</p>
                      <Badge variant="destructive" className="text-xs mt-1">Gap</Badge>
                    </div>
                    <div>
                      <h6 className="font-semibold">Risk Level</h6>
                      <Badge variant="destructive">High</Badge>
                      <p className="text-xs text-muted-foreground mt-1">No successors</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                    <div>
                      <h6 className="font-semibold">Current Leader</h6>
                      <p className="text-sm">Jennifer Davis</p>
                      <p className="text-xs text-muted-foreground">VP of Human Resources</p>
                    </div>
                    <div>
                      <h6 className="font-semibold">Successor 1</h6>
                      <p className="text-sm text-muted-foreground">External Hire</p>
                      <Badge variant="outline" className="text-xs mt-1">Planned</Badge>
                    </div>
                    <div>
                      <h6 className="font-semibold">Successor 2</h6>
                      <p className="text-sm text-muted-foreground">Under Development</p>
                      <Badge variant="outline" className="text-xs mt-1">TBD</Badge>
                    </div>
                    <div>
                      <h6 className="font-semibold">Risk Level</h6>
                      <Badge variant="default">Medium</Badge>
                      <p className="text-xs text-muted-foreground mt-1">Plan in progress</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}