"use client";

import React, { useState } from "react";

import {
  Brain,
  Target,
  Trophy,
  TrendingUp,
  Users,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Star,
  Plus,
  Eye,
  Settings,
  Search,
  Filter,
  BarChart3,
  LineChart,
  Activity,
  Award,
  BookOpen,
  Briefcase,
  Clock,
  DollarSign,
  FileText,
  Mail,
  MessageSquare,
  PenTool,
  Zap,
  Edit,
  Send,
  ArrowUp,
  ArrowDown,
  Minus,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  Flag,
  Clipboard,
  UserCheck,
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
const performanceOverview = {
  totalEmployees: 24,
  activeReviews: 8,
  completedReviews: 156,
  averageRating: 4.2,
  goalCompletionRate: 78,
  engagementScore: 8.3,
  aiInsights: 23,
  upcomingReviews: 6
};

const employees = [
  {
    id: "EMP-001",
    name: "Sarah Johnson",
    position: "Senior Software Engineer",
    department: "Engineering",
    manager: "John Smith",
    hireDate: "2022-03-15",
    lastReview: "2023-12-15",
    nextReview: "2024-06-15",
    currentRating: 4.8,
    goalProgress: 92,
    engagementScore: 9.1,
    strengths: ["Technical Leadership", "Problem Solving", "Mentoring"],
    improvementAreas: ["Public Speaking", "Documentation"],
    careerGoals: ["Tech Lead", "Architecture", "Team Management"],
    reviewStatus: "completed",
    totalGoals: 5,
    completedGoals: 4,
    aiInsights: [
      "Exceeding performance expectations consistently",
      "Ready for senior leadership role",
      "High flight risk due to exceptional performance"
    ]
  },
  {
    id: "EMP-002",
    name: "Mike Chen",
    position: "Software Engineer",
    department: "Engineering", 
    manager: "John Smith",
    hireDate: "2023-01-10",
    lastReview: "2023-07-10",
    nextReview: "2024-01-10",
    currentRating: 3.9,
    goalProgress: 67,
    engagementScore: 7.8,
    strengths: ["Code Quality", "Testing", "Collaboration"],
    improvementAreas: ["Feature Planning", "Time Management"],
    careerGoals: ["Senior Engineer", "Full Stack", "Product Knowledge"],
    reviewStatus: "in-progress",
    totalGoals: 4,
    completedGoals: 3,
    aiInsights: [
      "Strong technical foundation, needs leadership development",
      "Good candidate for stretch assignments",
      "Engagement declining - check workload"
    ]
  },
  {
    id: "EMP-003",
    name: "Lisa Wang",
    position: "Marketing Manager",
    department: "Marketing",
    manager: "Jennifer Davis",
    hireDate: "2021-11-20",
    lastReview: "2023-11-20",
    nextReview: "2024-05-20",
    currentRating: 4.3,
    goalProgress: 85,
    engagementScore: 8.7,
    strengths: ["Campaign Strategy", "Analytics", "Cross-functional Collaboration"],
    improvementAreas: ["Budget Management", "Vendor Relations"],
    careerGoals: ["Senior Manager", "Director", "Brand Strategy"],
    reviewStatus: "upcoming",
    totalGoals: 6,
    completedGoals: 5,
    aiInsights: [
      "Consistent high performance with growth potential",
      "Consider for advanced marketing training",
      "Strong contributor to team morale"
    ]
  },
  {
    id: "EMP-004",
    name: "David Wilson",
    position: "Sales Representative",
    department: "Sales",
    manager: "Robert Taylor",
    hireDate: "2023-06-01",
    lastReview: null,
    nextReview: "2024-03-01",
    currentRating: 3.5,
    goalProgress: 45,
    engagementScore: 6.9,
    strengths: ["Client Relationships", "Product Knowledge"],
    improvementAreas: ["Closing Techniques", "Pipeline Management", "CRM Usage"],
    careerGoals: ["Senior Sales", "Account Management", "Sales Training"],
    reviewStatus: "overdue",
    totalGoals: 3,
    completedGoals: 1,
    aiInsights: [
      "Performance below expectations - needs immediate attention",
      "Missing sales targets consistently",
      "Requires additional training and support"
    ]
  }
];

const reviewTemplates = [
  {
    id: "annual-review",
    name: "Annual Performance Review",
    type: "Annual",
    duration: "60 minutes",
    sections: 8,
    questions: 24,
    aiOptimized: true,
    usage: 156,
    averageTime: "45 minutes",
    description: "Comprehensive yearly performance evaluation"
  },
  {
    id: "quarterly-checkin",
    name: "Quarterly Check-in",
    type: "Quarterly",
    duration: "30 minutes", 
    sections: 4,
    questions: 12,
    aiOptimized: true,
    usage: 89,
    averageTime: "25 minutes",
    description: "Regular progress review and goal adjustment"
  },
  {
    id: "probationary-review",
    name: "Probationary Review",
    type: "Probationary",
    duration: "45 minutes",
    sections: 6,
    questions: 18,
    aiOptimized: false,
    usage: 23,
    averageTime: "40 minutes",
    description: "New hire performance assessment"
  },
  {
    id: "360-feedback",
    name: "360° Feedback Review",
    type: "360°",
    duration: "90 minutes",
    sections: 10,
    questions: 35,
    aiOptimized: true,
    usage: 45,
    averageTime: "75 minutes",
    description: "Multi-source feedback evaluation"
  }
];

const goalCategories = [
  {
    id: "professional-development",
    name: "Professional Development",
    icon: "📚",
    description: "Skills, certifications, and career growth",
    goals: 89,
    completionRate: 76,
    aiRecommendations: 12
  },
  {
    id: "performance-metrics",
    name: "Performance Metrics",
    icon: "📊", 
    description: "KPIs, targets, and measurable outcomes",
    goals: 124,
    completionRate: 83,
    aiRecommendations: 8
  },
  {
    id: "collaboration",
    name: "Team Collaboration",
    icon: "🤝",
    description: "Teamwork, communication, and leadership",
    goals: 67,
    completionRate: 71,
    aiRecommendations: 15
  },
  {
    id: "innovation",
    name: "Innovation & Process",
    icon: "💡",
    description: "Process improvements and creative solutions",
    goals: 45,
    completionRate: 68,
    aiRecommendations: 9
  }
];

const aiInsights = [
  {
    type: "performance-trend",
    title: "Engineering Team Performance Spike",
    description: "Engineering team ratings increased 23% this quarter. AI analysis shows correlation with new mentorship program and flexible work policies.",
    impact: "high",
    affectedEmployees: 8,
    confidence: 94.3,
    action: "Expand mentorship program company-wide",
    trend: "positive"
  },
  {
    type: "retention-risk",
    title: "High Performer Flight Risk Alert",
    description: "3 top-rated employees showing decreased engagement scores. AI predicts 67% probability of departure within 6 months without intervention.",
    impact: "critical",
    affectedEmployees: 3,
    confidence: 89.7,
    action: "Schedule retention conversations immediately",
    trend: "negative"
  },
  {
    type: "goal-optimization",
    title: "Goal Completion Patterns",
    description: "Employees with 4-6 goals show 23% higher completion rates than those with 7+ goals. AI suggests optimal goal range of 4-5 per quarter.",
    impact: "medium",
    affectedEmployees: 16,
    confidence: 91.2,
    action: "Adjust goal-setting guidelines",
    trend: "neutral"
  },
  {
    type: "development-opportunity",
    title: "Leadership Pipeline Gap",
    description: "Only 18% of senior employees have leadership development goals. AI recommends increasing this to 40% for succession planning.",
    impact: "medium",
    affectedEmployees: 6,
    confidence: 87.4,
    action: "Create leadership development track",
    trend: "opportunity"
  }
];

const performanceMetrics = [
  {
    metric: "Overall Performance Score",
    current: 4.2,
    previous: 3.9,
    target: 4.5,
    trend: "up",
    change: "+7.7%"
  },
  {
    metric: "Goal Completion Rate",
    current: 78,
    previous: 71,
    target: 85,
    trend: "up",
    change: "+9.9%"
  },
  {
    metric: "Employee Engagement",
    current: 8.3,
    previous: 8.1,
    target: 8.5,
    trend: "up",
    change: "+2.5%"
  },
  {
    metric: "Review Completion",
    current: 95,
    previous: 88,
    target: 100,
    trend: "up",
    change: "+8.0%"
  }
];

export function PerformanceManagement() {
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || emp.reviewStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Management</h1>
          <p className="text-muted-foreground mt-2">
            AI-powered performance reviews, goal tracking, and employee development
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Performance Report
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-payroll-primary to-payroll-secondary">
                <Plus className="mr-2 h-4 w-4" />
                Start Review
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Start New Performance Review</DialogTitle>
                <DialogDescription>
                  Create a new performance review with AI-powered template suggestions
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
                        {employees.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.name} - {emp.position}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="template-select">Review Template</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select template..." />
                      </SelectTrigger>
                      <SelectContent>
                        {reviewTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="review-period">Review Period</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select period..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="q1-2024">Q1 2024</SelectItem>
                      <SelectItem value="annual-2023">Annual 2023</SelectItem>
                      <SelectItem value="probationary">Probationary Period</SelectItem>
                      <SelectItem value="custom">Custom Period</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Alert>
                  <Brain className="h-4 w-4" />
                  <AlertDescription>
                    AI will pre-populate review sections based on employee data, goals, and performance history.
                  </AlertDescription>
                </Alert>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline">Save Draft</Button>
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

      {/* AI Performance Assistant */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-purple-900 dark:text-purple-100">AI Performance Intelligence</h3>
              <p className="text-purple-700 dark:text-purple-300 text-sm">
                {performanceOverview.activeReviews} active reviews • {performanceOverview.averageRating}/5 avg rating • {performanceOverview.goalCompletionRate}% goal completion
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-purple-900 dark:text-purple-100 mb-1">
              {performanceOverview.aiInsights}
            </div>
            <div className="text-sm text-purple-700 dark:text-purple-300">AI Insights Generated</div>
          </div>
        </div>
      </motion.div>

      {/* Performance Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {performanceMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{metric.metric}</p>
                  <p className="text-2xl font-bold">{metric.current}{metric.metric.includes("Rate") ? "%" : ""}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    {metric.trend === "up" ? (
                      <ArrowUp className="h-3 w-3 text-green-600" />
                    ) : metric.trend === "down" ? (
                      <ArrowDown className="h-3 w-3 text-red-600" />
                    ) : (
                      <Minus className="h-3 w-3 text-neutral-600" />
                    )}
                    <span className={`text-xs ${
                      metric.trend === "up" ? "text-green-600" : 
                      metric.trend === "down" ? "text-red-600" : "text-neutral-600"
                    }'}>
                      {metric.change}
                    </span>
                  </div>
                </div>
                <div>
                  <Progress 
                    value={(metric.current / metric.target) * 100} 
                    className="w-16 h-2 mb-2" 
                  />
                  <div className="text-xs text-muted-foreground">
                    Target: {metric.target}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="employees" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="employees">Employee Reviews</TabsTrigger>
          <TabsTrigger value="goals">Goal Management</TabsTrigger>
          <TabsTrigger value="templates">Review Templates</TabsTrigger>
          <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-6">
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
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredEmployees.length} of {employees.length} employees
            </div>
          </div>

          <div className="grid gap-4">
            {filteredEmployees.map((employee, index) => (
              <Card key={employee.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
                          <UserCheck className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold">{employee.name}</h4>
                          <p className="text-sm text-muted-foreground">{employee.position} • {employee.department}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant={
                              employee.reviewStatus === "completed" ? "default" :
                              employee.reviewStatus === "in-progress" ? "secondary" :
                              employee.reviewStatus === "upcoming" ? "outline" : "destructive"
                            }>
                              {employee.reviewStatus}
                            </Badge>
                            <Badge variant="outline" className="text-purple-600">
                              <Brain className="mr-1 h-3 w-3" />
                              {employee.aiInsights.length} AI insights
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <label className="text-xs text-muted-foreground">Current Rating</label>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-lg font-bold">{employee.currentRating}</span>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Goal Progress</label>
                          <div className="flex items-center space-x-2">
                            <Progress value={employee.goalProgress} className="flex-1 h-2" />
                            <span className="text-sm font-medium">{employee.goalProgress}%</span>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Engagement</label>
                          <p className="text-lg font-bold text-green-600">{employee.engagementScore}/10</p>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Next Review</label>
                          <p className="text-sm font-medium">
                            {employee.nextReview ? new Date(employee.nextReview).toLocaleDateString() : "Not scheduled"}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground mb-2 block">Top Strengths</label>
                          <div className="flex flex-wrap gap-2">
                            {employee.strengths.slice(0, 3).map((strength, i) => (
                              <Badge key={i} variant="outline" className="text-xs text-green-600">
                                <ThumbsUp className="mr-1 h-2 w-2" />
                                {strength}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground mb-2 block">Development Areas</label>
                          <div className="flex flex-wrap gap-2">
                            {employee.improvementAreas.slice(0, 2).map((area, i) => (
                              <Badge key={i} variant="outline" className="text-xs text-orange-600">
                                <Lightbulb className="mr-1 h-2 w-2" />
                                {area}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <Alert>
                        <Brain className="h-4 w-4" />
                        <AlertDescription>
                          <strong>AI Insight:</strong> {employee.aiInsights[0]}
                        </AlertDescription>
                      </Alert>
                    </div>
                    
                    <div className="text-right ml-6">
                      <div className="mb-4">
                        <div className="text-lg font-bold text-blue-600 mb-1">
                          {employee.completedGoals}/{employee.totalGoals}
                        </div>
                        <div className="text-sm text-muted-foreground">Goals Complete</div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="mr-2 h-3 w-3" />
                          View Profile
                        </Button>
                        {employee.reviewStatus === "upcoming" || employee.reviewStatus === "overdue" ? (
                          <Button size="sm">
                            <PenTool className="mr-2 h-3 w-3" />
                            Start Review
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline">
                            <Edit className="mr-2 h-3 w-3" />
                            Update
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

        <TabsContent value="goals" className="space-y-6">
          <div className="grid gap-6">
            {goalCategories.map((category, index) => (
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
                            <strong>{category.goals}</strong> active goals
                          </div>
                          <div className="text-sm">
                            <strong>{category.aiRecommendations}</strong> AI suggestions
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="mb-4">
                        <div className="text-2xl font-bold text-green-600 mb-1">
                          {category.completionRate}%
                        </div>
                        <div className="text-sm text-muted-foreground">Completion Rate</div>
                        <Progress value={category.completionRate} className="w-24 mt-2" />
                      </div>
                      
                      <Button size="sm" variant="outline">
                        <Target className="mr-2 h-3 w-3" />
                        View Goals
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
            {reviewTemplates.map((template, index) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/20">
                          <Clipboard className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold">{template.name}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline">{template.type}</Badge>
                            {template.aiOptimized && (
                              <Badge variant="outline" className="text-purple-600">
                                <Brain className="mr-1 h-3 w-3" />
                                AI Optimized
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-4">{template.description}</p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className="text-xs text-muted-foreground">Duration</label>
                          <p className="text-sm font-medium">{template.duration}</p>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Sections</label>
                          <p className="text-sm font-medium">{template.sections}</p>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Questions</label>
                          <p className="text-sm font-medium">{template.questions}</p>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Usage</label>
                          <p className="text-sm font-medium">{template.usage} times</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right ml-6">
                      <div className="mb-4">
                        <div className="text-lg font-bold text-blue-600 mb-1">
                          {template.averageTime}
                        </div>
                        <div className="text-sm text-muted-foreground">Avg Completion</div>
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

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Performance Distribution
                </CardTitle>
                <CardDescription>
                  Employee performance ratings across the organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span className="text-sm">Exceeds (4.5+)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={25} className="w-24 h-2" />
                      <span className="text-sm font-medium">6 employees</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span className="text-sm">Meets (3.5-4.4)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={58} className="w-24 h-2" />
                      <span className="text-sm font-medium">14 employees</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                      <span className="text-sm">Developing (2.5-3.4)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={17} className="w-24 h-2" />
                      <span className="text-sm font-medium">4 employees</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Goal Completion Trends
                </CardTitle>
                <CardDescription>
                  Monthly goal completion rates by department
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Engineering</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={89} className="w-24 h-2" />
                      <span className="text-sm font-medium">89%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Marketing</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={76} className="w-24 h-2" />
                      <span className="text-sm font-medium">76%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sales</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={62} className="w-24 h-2" />
                      <span className="text-sm font-medium">62%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Operations</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={83} className="w-24 h-2" />
                      <span className="text-sm font-medium">83%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4">
            {aiInsights.map((insight, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={'p-2 rounded-full ${
                      insight.type === "performance-trend" 
                        ? "bg-green-100 dark:bg-green-900/20" 
                        : insight.type === "retention-risk"
                        ? "bg-red-100 dark:bg-red-900/20"
                        : insight.type === "goal-optimization"
                        ? "bg-blue-100 dark:bg-blue-900/20"
                        : "bg-purple-100 dark:bg-purple-900/20"
                    }'}>
                      {insight.type === "performance-trend" ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : insight.type === "retention-risk" ? (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      ) : insight.type === "goal-optimization" ? (
                        <Target className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Lightbulb className="h-4 w-4 text-purple-600" />
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
                      <p className="text-sm text-muted-foreground mb-3">
                        {insight.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-blue-600">
                          Affects: {insight.affectedEmployees} employees
                        </div>
                        <Button size="sm" variant={insight.impact === "critical" ? "destructive" : "default"}>
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