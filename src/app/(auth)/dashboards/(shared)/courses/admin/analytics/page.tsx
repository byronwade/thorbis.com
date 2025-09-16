"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  BarChart3,
  Users,
  BookOpen,
  Trophy,
  Clock,
  TrendingUp,
  Download,
  Calendar,
  Target,
  Award,
  Activity,
  Filter
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";

const enrollmentData = [
  { month: "Jan", enrollments: 45, completions: 32, revenue: 1200 },
  { month: "Feb", enrollments: 52, completions: 41, revenue: 1450 },
  { month: "Mar", enrollments: 78, completions: 58, revenue: 2100 },
  { month: "Apr", enrollments: 65, completions: 52, revenue: 1850 },
  { month: "May", enrollments: 89, completions: 71, revenue: 2650 },
  { month: "Jun", enrollments: 95, completions: 78, revenue: 2890 },
];

const coursePopularity = [
  { name: "Advanced Pipe Systems", students: 156, completion: 78 },
  { name: "Customer Service Excellence", students: 143, completion: 85 },
  { name: "Thorbis Dispatching Pro", students: 127, completion: 72 },
  { name: "New Employee Orientation", students: 198, completion: 91 },
  { name: "Safety Protocols", students: 134, completion: 88 },
];

const industryBreakdown = [
  { name: "Plumbing", value: 45, color: "#3B82F6" },
  { name: "Retail", value: 25, color: "#10B981" },
  { name: "Software", value: 20, color: "#8B5CF6" },
  { name: "Onboarding", value: 10, color: "#F59E0B" },
];

const learningPaths = [
  { name: "Beginner Track", enrolled: 234, completed: 189, avgTime: "3.2 weeks" },
  { name: "Intermediate Track", enrolled: 156, completed: 134, avgTime: "4.1 weeks" },
  { name: "Advanced Track", enrolled: 89, completed: 67, avgTime: "5.8 weeks" },
  { name: "Expert Track", enrolled: 45, completed: 32, avgTime: "7.2 weeks" },
];

const topInstructors = [
  { name: "Mike Rodriguez", courses: 8, students: 456, rating: 4.9 },
  { name: "Emma Wilson", courses: 6, students: 378, rating: 4.8 },
  { name: "Alex Chen", courses: 5, students: 234, rating: 4.7 },
  { name: "Sarah Johnson", courses: 4, students: 189, rating: 4.9 },
];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("6months");
  const [selectedMetric, setSelectedMetric] = useState("all");

  const analyticsStats = {
    totalStudents: 1247,
    activeCourses: 23,
    completionRate: 76,
    avgEngagement: 4.2,
    monthlyGrowth: 15.8,
    totalRevenue: 12450
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Comprehensive insights into your learning platform</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">Last Month</SelectItem>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="1year">Last Year</SelectItem>
              </SelectContent>
            </Select>
            
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="h-8 w-8 text-blue-500" />
                <Badge variant="secondary" className="text-green-600">
                  +{analyticsStats.monthlyGrowth}%
                </Badge>
              </div>
              <div className="text-2xl font-bold text-blue-600">{analyticsStats.totalStudents.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">Total Students</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <BookOpen className="h-8 w-8 text-green-500" />
                <Badge variant="secondary">Active</Badge>
              </div>
              <div className="text-2xl font-bold text-green-600">{analyticsStats.activeCourses}</div>
              <p className="text-sm text-muted-foreground">Active Courses</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Trophy className="h-8 w-8 text-amber-500" />
                <Badge variant="secondary" className="text-green-600">
                  +3%
                </Badge>
              </div>
              <div className="text-2xl font-bold text-amber-600">{analyticsStats.completionRate}%</div>
              <p className="text-sm text-muted-foreground">Completion Rate</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Activity className="h-8 w-8 text-purple-500" />
                <Badge variant="secondary">High</Badge>
              </div>
              <div className="text-2xl font-bold text-purple-600">{analyticsStats.avgEngagement}/5</div>
              <p className="text-sm text-muted-foreground">Avg Engagement</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="h-8 w-8 text-rose-500" />
                <Badge variant="secondary" className="text-green-600">
                  +{analyticsStats.monthlyGrowth}%
                </Badge>
              </div>
              <div className="text-2xl font-bold text-rose-600">{analyticsStats.monthlyGrowth}%</div>
              <p className="text-sm text-muted-foreground">Monthly Growth</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Target className="h-8 w-8 text-emerald-500" />
                <Badge variant="secondary">Revenue</Badge>
              </div>
              <div className="text-2xl font-bold text-emerald-600">${analyticsStats.totalRevenue.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">Monthly Revenue</p>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Enrollment Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={enrollmentData}>
                      <defs>
                        <linearGradient id="enrollmentGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Area
                        type="monotone"
                        dataKey="enrollments"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        fill="url(#enrollmentGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Industry Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={industryBreakdown}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={(entry) => `${entry.name} (${entry.value}%)`}
                      >
                        {industryBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Course Popularity & Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {coursePopularity.map((course, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{course.name}</h4>
                        <p className="text-sm text-muted-foreground">{course.students} enrolled students</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="mb-1">
                        {course.completion}% completion
                      </Badge>
                      <div className="w-24 h-2 bg-muted rounded-full">
                        <div 
                          className="h-full bg-green-500 rounded-full" 
                          style={{ width: `${course.completion}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Learning Path Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {learningPaths.map((path, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{path.name}</span>
                      <span className="text-sm text-muted-foreground">{path.avgTime} avg</span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-blue-600">{path.enrolled} enrolled</span>
                      <span className="text-green-600">{path.completed} completed</span>
                      <span className="text-muted-foreground">
                        {Math.round((path.completed / path.enrolled) * 100)}% rate
                      </span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full" 
                        style={{ width: `${(path.completed / path.enrolled) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Top Instructors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {topInstructors.map((instructor, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center">
                        <Award className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{instructor.name}</h4>
                        <p className="text-sm text-muted-foreground">{instructor.courses} courses • {instructor.students} students</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-amber-100 text-amber-700">
                      ⭐ {instructor.rating}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Completion Rates Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={enrollmentData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Line
                      type="monotone"
                      dataKey="completions"
                      stroke="#10B981"
                      strokeWidth={3}
                      dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Revenue Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={enrollmentData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Bar dataKey="revenue" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}