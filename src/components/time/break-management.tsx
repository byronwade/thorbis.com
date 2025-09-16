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
  Coffee,
  Clock,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Plus,
  Edit,
  Eye,
  Settings,
  Download,
  Search,
  Filter,
  Bell,
  Shield,
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
  User,
  Building,
  CalendarDays,
  Award,
  BookOpen,
  FileText,
  Smartphone,
  Heart,
  Utensils,
  Moon,
  Sun,
  Palette,
  Scale,
  Flag,
  MessageSquare,
  Briefcase,
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
const breakOverview = {
  totalEmployees: 24,
  onBreakNow: 5,
  complianceRate: 96.8,
  averageBreakTime: 18,
  breakViolations: 2,
  scheduledBreaks: 34,
  aiSuggestions: 12,
  wellnessScore: 8.4
};

const currentBreaks = [
  {
    id: "BRK-001",
    employeeId: "EMP-001",
    employeeName: "Sarah Johnson",
    department: "Engineering",
    breakType: "lunch",
    startTime: "12:30 PM",
    plannedDuration: 60,
    currentDuration: 35,
    location: "Office Cafeteria",
    status: "active",
    autoReturn: true,
    workPattern: "focused-work-session",
    productivityScore: 8.7
  },
  {
    id: "BRK-002",
    employeeId: "EMP-002",
    employeeName: "Mike Chen",
    department: "Engineering",
    breakType: "wellness",
    startTime: "2:15 PM",
    plannedDuration: 15,
    currentDuration: 12,
    location: "Wellness Room",
    status: "active",
    autoReturn: false,
    workPattern: "screen-fatigue",
    productivityScore: 7.2
  },
  {
    id: "BRK-003",
    employeeId: "EMP-003",
    employeeName: "Lisa Wang",
    department: "Marketing",
    breakType: "coffee",
    startTime: "10:45 AM",
    plannedDuration: 10,
    currentDuration: 8,
    location: "Coffee Station",
    status: "active",
    autoReturn: true,
    workPattern: "collaboration-break",
    productivityScore: 8.1
  }
];

const breakSchedule = [
  {
    id: "SCHED-001",
    employeeId: "EMP-004",
    employeeName: "David Wilson",
    department: "Sales",
    breakType: "lunch",
    scheduledTime: "1:00 PM",
    duration: 60,
    recurring: "daily",
    complianceRequired: true,
    aiOptimized: true,
    productivity: "high-energy-period",
    status: "upcoming"
  },
  {
    id: "SCHED-002", 
    employeeId: "EMP-005",
    employeeName: "Jennifer Lee",
    department: "Design",
    breakType: "creative",
    scheduledTime: "3:30 PM",
    duration: 20,
    recurring: "daily",
    complianceRequired: false,
    aiOptimized: true,
    productivity: "creative-recharge",
    status: "upcoming"
  },
  {
    id: "SCHED-003",
    employeeId: "EMP-001",
    employeeName: "Sarah Johnson",
    department: "Engineering", 
    breakType: "wellness",
    scheduledTime: "4:15 PM",
    duration: 15,
    recurring: "daily",
    complianceRequired: false,
    aiOptimized: true,
    productivity: "stress-relief",
    status: "suggested"
  }
];

const complianceRules = [
  {
    id: "COMP-001",
    title: "California Labor Law - Meal Breaks",
    description: "30-minute unpaid meal break required for shifts over 5 hours",
    jurisdiction: "California",
    type: "meal-break",
    minDuration: 30,
    maxWorkHours: 5,
    required: true,
    penalty: "$100 per violation per employee per day",
    complianceRate: 98.5,
    violations: 1,
    lastViolation: "2024-02-10"
  },
  {
    id: "COMP-002", 
    title: "California Labor Law - Rest Breaks",
    description: "10-minute paid rest break for every 4 hours worked",
    jurisdiction: "California",
    type: "rest-break", 
    minDuration: 10,
    maxWorkHours: 4,
    required: true,
    penalty: "$100 per violation per employee per day",
    complianceRate: 96.2,
    violations: 3,
    lastViolation: "2024-02-14"
  },
  {
    id: "COMP-003",
    title: "Federal OSHA - Screen Break Guidelines",
    description: "Recommended 15-minute break for every 2 hours of continuous screen work",
    jurisdiction: "Federal",
    type: "wellness-break",
    minDuration: 15,
    maxWorkHours: 2,
    required: false,
    penalty: "N/A - Recommended only",
    complianceRate: 87.3,
    violations: 0,
    lastViolation: null
  }
];

const breakTypes = [
  {
    id: "lunch",
    name: "Lunch Break",
    icon: "🍽️",
    description: "Meal break for nutrition and social interaction",
    defaultDuration: 60,
    compliance: true,
    aiOptimizations: ["social-time", "nutrition-timing", "energy-recharge"]
  },
  {
    id: "coffee",
    name: "Coffee Break",
    icon: "☕",
    description: "Short break for refreshment and casual interaction",
    defaultDuration: 15,
    compliance: false,
    aiOptimizations: ["energy-boost", "social-connection", "routine-break"]
  },
  {
    id: "wellness",
    name: "Wellness Break",
    icon: "🧘",
    description: "Dedicated time for mental health and stress relief",
    defaultDuration: 20,
    compliance: false,
    aiOptimizations: ["stress-relief", "mindfulness", "physical-activity"]
  },
  {
    id: "creative",
    name: "Creative Break",
    icon: "🎨",
    description: "Inspiration break for creative and design work",
    defaultDuration: 25,
    compliance: false,
    aiOptimizations: ["inspiration-seeking", "idea-generation", "creative-recharge"]
  },
  {
    id: "exercise",
    name: "Exercise Break",
    icon: "💪",
    description: "Physical activity break for health and energy",
    defaultDuration: 30,
    compliance: false,
    aiOptimizations: ["physical-health", "energy-boost", "endorphin-release"]
  },
  {
    id: "rest",
    name: "Rest Break", 
    icon: "😴",
    description: "Quiet rest period for fatigue management",
    defaultDuration: 10,
    compliance: true,
    aiOptimizations: ["fatigue-relief", "mental-reset", "productivity-recovery"]
  }
];

const aiInsights = [
  {
    type: "productivity",
    title: "Optimal Break Timing Identified",
    description: "Engineering team shows 34% higher afternoon productivity when taking 15-minute wellness breaks at 2:30 PM. AI recommends implementing this pattern company-wide.",
    confidence: 93.2,
    impact: "high",
    affectedEmployees: 8,
    recommendation: "Schedule afternoon wellness breaks",
    trend: "positive",
    metrics: {
      productivityIncrease: "34%",
      stressReduction: "23%", 
      focusImprovement: "28%"
    }
  },
  {
    type: "compliance",
    title: "Break Compliance Gap Detected",
    description: "2 employees consistently missing required rest breaks due to meeting schedules. AI suggests automatic calendar blocking to ensure compliance.",
    confidence: 96.7,
    impact: "critical",
    affectedEmployees: 2,
    recommendation: "Implement smart calendar integration",
    trend: "negative",
    violations: 5,
    riskLevel: "high"
  },
  {
    type: "wellness",
    title: "Stress Pattern Analysis",
    description: "Sales team showing elevated stress indicators before lunch. AI recommends earlier meal breaks and stress-relief activities.",
    confidence: 87.8,
    impact: "medium",
    affectedEmployees: 6,
    recommendation: "Adjust meal break timing",
    trend: "concerning",
    wellnessScore: 6.2,
    targetScore: 8.0
  },
  {
    type: "efficiency",
    title: "Break Duration Optimization",
    description: "Analysis shows 18-minute breaks have 15% better productivity return than standard 15-minute breaks. Sweet spot identified for maximum benefit.",
    confidence: 91.4,
    impact: "medium",
    affectedEmployees: 24,
    recommendation: "Adjust default break durations",
    trend: "neutral",
    optimizationGain: "15%"
  }
];

export function BreakManagement() {
  const [selectedBreak, setSelectedBreak] = useState(currentBreaks[0]);
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBreaks = currentBreaks.filter(breakItem => {
    const matchesSearch = breakItem.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         breakItem.breakType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || breakItem.breakType === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Break Management</h1>
          <p className="text-muted-foreground mt-2">
            AI-powered break scheduling with compliance tracking and wellness optimization
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Compliance Report
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-payroll-primary to-payroll-secondary">
                <Plus className="mr-2 h-4 w-4" />
                Schedule Break
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Schedule Employee Break</DialogTitle>
                <DialogDescription>
                  Create smart break schedules with AI optimization and compliance checking
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
                    <Label htmlFor="breakType">Break Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type..." />
                      </SelectTrigger>
                      <SelectContent>
                        {breakTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.icon} {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="time">Scheduled Time</Label>
                    <Input id="time" type="time" />
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input id="duration" type="number" placeholder="15" />
                  </div>
                  <div>
                    <Label htmlFor="recurring">Recurring</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Frequency..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="once">One time</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea id="notes" placeholder="Special instructions or purpose..." rows={2} />
                </div>
                <Alert>
                  <Brain className="h-4 w-4" />
                  <AlertDescription>
                    AI will optimize break timing based on productivity patterns, compliance requirements, and employee wellness data.
                  </AlertDescription>
                </Alert>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline">Save Draft</Button>
                  <Button>
                    <Zap className="mr-2 h-4 w-4" />
                    AI Optimize & Schedule
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* AI Break Assistant */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950/20 dark:to-teal-950/20 rounded-lg p-6 border border-green-200 dark:border-green-800"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
              <Coffee className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-green-900 dark:text-green-100">Smart Break Assistant</h3>
              <p className="text-green-700 dark:text-green-300 text-sm">
                {breakOverview.onBreakNow} employees on break • {breakOverview.complianceRate}% compliance rate • {breakOverview.aiSuggestions} AI suggestions
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-green-900 dark:text-green-100 mb-1">
              {breakOverview.wellnessScore}
            </div>
            <div className="text-sm text-green-700 dark:text-green-300">Wellness Score</div>
          </div>
        </div>
      </motion.div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{breakOverview.onBreakNow}</p>
                <p className="text-xs text-muted-foreground">On Break Now</p>
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
                <p className="text-2xl font-bold text-blue-600">{breakOverview.complianceRate}%</p>
                <p className="text-xs text-muted-foreground">Compliance</p>
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
                <p className="text-2xl font-bold text-purple-600">{breakOverview.averageBreakTime}m</p>
                <p className="text-xs text-muted-foreground">Avg Duration</p>
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
                <p className="text-2xl font-bold text-red-600">{breakOverview.breakViolations}</p>
                <p className="text-xs text-muted-foreground">Violations</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="active">Active Breaks</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="types">Break Types</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search active breaks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="coffee">Coffee</SelectItem>
                  <SelectItem value="wellness">Wellness</SelectItem>
                  <SelectItem value="rest">Rest</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm">
              <Bell className="mr-2 h-3 w-3" />
              Send Break Reminders
            </Button>
          </div>

          <div className="grid gap-4">
            {filteredBreaks.map((breakItem, index) => (
              <motion.div
                key={breakItem.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
                          <Coffee className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold">{breakItem.employeeName}</h4>
                          <p className="text-sm text-muted-foreground">{breakItem.department}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant={
                              breakItem.breakType === "lunch" ? "default" :
                              breakItem.breakType === "wellness" ? "secondary" :
                              breakItem.breakType === "coffee" ? "outline" : "destructive"
                            }>
                              {breakTypes.find(t => t.id === breakItem.breakType)?.icon} {breakItem.breakType}
                            </Badge>
                            <Badge variant="outline" className="text-green-600">
                              Active since {breakItem.startTime}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center space-x-4 mb-2">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {breakItem.currentDuration}m
                            </div>
                            <div className="text-xs text-muted-foreground">Current</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">
                              {breakItem.plannedDuration}m
                            </div>
                            <div className="text-xs text-muted-foreground">Planned</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {breakItem.productivityScore}
                            </div>
                            <div className="text-xs text-muted-foreground">Score</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 mb-3">
                          <Progress 
                            value={(breakItem.currentDuration / breakItem.plannedDuration) * 100} 
                            className="w-24" 
                          />
                          <span className="text-sm font-medium">
                            {Math.round((breakItem.currentDuration / breakItem.plannedDuration) * 100)}%
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{breakItem.location}</span>
                        </div>
                      </div>
                    </div>

                    <Alert className="mt-4">
                      <Brain className="h-4 w-4" />
                      <AlertDescription>
                        <strong>AI Pattern:</strong> {breakItem.workPattern.replace('-', ' ')} detected. 
                        {breakItem.autoReturn && " Auto-return enabled."}
                      </AlertDescription>
                    </Alert>

                    <div className="flex justify-between items-center mt-4">
                      <div className="text-sm text-muted-foreground">
                        {breakItem.autoReturn ? "Auto-return enabled" : "Manual return required"}
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <MessageSquare className="mr-2 h-3 w-3" />
                          Message
                        </Button>
                        <Button size="sm" variant="outline">
                          <Bell className="mr-2 h-3 w-3" />
                          Remind
                        </Button>
                        <Button size="sm">
                          <StopCircle className="mr-2 h-3 w-3" />
                          End Break
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Break Schedule - {new Date().toLocaleDateString()}
              </CardTitle>
              <CardDescription>
                AI-optimized break scheduling with compliance monitoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Break Type</TableHead>
                    <TableHead>Scheduled Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Compliance</TableHead>
                    <TableHead>AI Optimized</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {breakSchedule.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{schedule.employeeName}</p>
                          <p className="text-xs text-muted-foreground">{schedule.department}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {breakTypes.find(t => t.id === schedule.breakType)?.icon} {schedule.breakType}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{schedule.scheduledTime}</TableCell>
                      <TableCell>{schedule.duration}m</TableCell>
                      <TableCell>
                        {schedule.complianceRequired ? (
                          <Badge className="bg-red-100 text-red-800">
                            <Shield className="mr-1 h-3 w-3" />
                            Required
                          </Badge>
                        ) : (
                          <Badge variant="outline">Optional</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {schedule.aiOptimized ? (
                          <Badge className="bg-purple-100 text-purple-800">
                            <Brain className="mr-1 h-3 w-3" />
                            AI Optimized
                          </Badge>
                        ) : (
                          <Badge variant="outline">Manual</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {schedule.status === "upcoming" ? (
                          <Badge className="bg-blue-100 text-blue-800">
                            <Clock className="mr-1 h-3 w-3" />
                            Upcoming
                          </Badge>
                        ) : schedule.status === "suggested" ? (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <Zap className="mr-1 h-3 w-3" />
                            Suggested
                          </Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Confirmed
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="ghost">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Bell className="h-3 w-3" />
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

        <TabsContent value="types" className="space-y-4">
          <div className="grid gap-4">
            {breakTypes.map((type, index) => (
              <motion.div
                key={type.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="text-4xl">{type.icon}</div>
                        <div>
                          <h4 className="text-lg font-semibold">{type.name}</h4>
                          <p className="text-sm text-muted-foreground">{type.description}</p>
                          <div className="flex items-center space-x-3 mt-3">
                            <div className="text-sm">
                              <strong>Default Duration:</strong> {type.defaultDuration} minutes
                            </div>
                            <div className="flex items-center space-x-1">
                              {type.compliance ? (
                                <Badge className="bg-red-100 text-red-800">
                                  <Shield className="mr-1 h-3 w-3" />
                                  Compliance Required
                                </Badge>
                              ) : (
                                <Badge variant="outline">Optional</Badge>
                              )}
                            </div>
                          </div>
                          <div className="mt-3">
                            <p className="text-sm font-medium text-muted-foreground mb-2">AI Optimizations:</p>
                            <div className="flex flex-wrap gap-2">
                              {type.aiOptimizations.map((optimization, i) => (
                                <Badge key={i} variant="outline" className="text-xs text-purple-600">
                                  <Brain className="mr-1 h-2 w-2" />
                                  {optimization.replace('-', ' ')}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <Button size="sm" variant="outline" className="mb-2">
                          <Settings className="mr-2 h-3 w-3" />
                          Configure
                        </Button>
                        <div className="text-sm text-muted-foreground">
                          Used by {Math.floor(Math.random() * 15 + 5)} employees
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid gap-4">
            {complianceRules.map((rule, index) => (
              <motion.div
                key={rule.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className={`p-2 rounded-full ${
                            rule.violations === 0 ? "bg-green-100 dark:bg-green-900/20" : "bg-red-100 dark:bg-red-900/20"
                          }`}>
                            <Shield className={`h-5 w-5 ${rule.violations === 0 ? "text-green-600" : "text-red-600"}`} />
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold">{rule.title}</h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline">{rule.jurisdiction}</Badge>
                              <Badge variant={rule.required ? "destructive" : "secondary"}>
                                {rule.required ? "Required" : "Recommended"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-4">{rule.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <label className="text-xs text-muted-foreground">Min Duration</label>
                            <p className="text-lg font-bold text-blue-600">{rule.minDuration}m</p>
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Max Work Hours</label>
                            <p className="text-lg font-bold text-purple-600">{rule.maxWorkHours}h</p>
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Compliance Rate</label>
                            <p className="text-lg font-bold text-green-600">{rule.complianceRate}%</p>
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Violations</label>
                            <p className={`text-lg font-bold ${rule.violations === 0 ? "text-green-600" : "text-red-600"}'}>
                              {rule.violations}
                            </p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <label className="text-sm font-medium text-muted-foreground">Compliance Progress</label>
                          <div className="flex items-center space-x-2 mt-1">
                            <Progress value={rule.complianceRate} className="flex-1" />
                            <span className="text-sm font-medium">{rule.complianceRate}%</span>
                          </div>
                        </div>

                        {rule.violations > 0 && (
                          <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              <strong>Penalty:</strong> {rule.penalty} | Last violation: {rule.lastViolation}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                      
                      <div className="text-right ml-6">
                        <Button size="sm" variant="outline" className="mb-2">
                          <FileText className="mr-2 h-3 w-3" />
                          View Details
                        </Button>
                        {rule.violations > 0 && (
                          <Button size="sm" variant="destructive">
                            <Flag className="mr-2 h-3 w-3" />
                            Address Violations
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
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
                        insight.type === "productivity" 
                          ? "bg-green-100 dark:bg-green-900/20" 
                          : insight.type === "compliance"
                          ? "bg-red-100 dark:bg-red-900/20"
                          : insight.type === "wellness"
                          ? "bg-blue-100 dark:bg-blue-900/20"
                          : "bg-purple-100 dark:bg-purple-900/20"
                      }'}>
                        {insight.type === "productivity" ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : insight.type === "compliance" ? (
                          <Shield className="h-4 w-4 text-red-600" />
                        ) : insight.type === "wellness" ? (
                          <Heart className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Target className="h-4 w-4 text-purple-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{insight.title}</h4>
                          <div className="flex items-center space-x-2">
                            <Badge variant={insight.impact === "critical" ? "destructive" : 
                                           insight.impact === "high" ? "default" : "secondary"}>
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
                              <div className="text-lg font-bold text-green-600">{insight.metrics.productivityIncrease}</div>
                              <div className="text-xs text-muted-foreground">Productivity</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-blue-600">{insight.metrics.stressReduction}</div>
                              <div className="text-xs text-muted-foreground">Stress Reduction</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-purple-600">{insight.metrics.focusImprovement}</div>
                              <div className="text-xs text-muted-foreground">Focus</div>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="text-sm">
                            <strong>Affects:</strong> {insight.affectedEmployees} employees
                            {insight.violations && <span className="text-red-600 ml-2">• {insight.violations} violations</span>}
                          </div>
                          <Button size="sm" variant={insight.impact === "critical" ? "destructive" : "default"}>
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
                  Break Duration Analysis
                </CardTitle>
                <CardDescription>
                  Average break durations by type and compliance rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Break duration analytics chart will be displayed here</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Wellness Correlation
                </CardTitle>
                <CardDescription>
                  Break patterns vs. productivity and wellness metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Wellness correlation analysis will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Break Management Summary</CardTitle>
              <CardDescription>
                Overall break metrics with AI-powered insights and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">{breakOverview.complianceRate}%</div>
                  <div className="text-sm text-muted-foreground">Compliance Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{breakOverview.averageBreakTime}m</div>
                  <div className="text-sm text-muted-foreground">Average Duration</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">{breakOverview.wellnessScore}/10</div>
                  <div className="text-sm text-muted-foreground">Wellness Score</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">{breakOverview.aiSuggestions}</div>
                  <div className="text-sm text-muted-foreground">AI Suggestions</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}