"use client";

import { motion } from "framer-motion";
import { 
  BookOpen, 
  Users, 
  BarChart3, 
  Settings, 
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  Play,
  Pause,
  MoreHorizontal
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { allCourses } from "@/lib/course-data";
import Link from "next/link";
import { useState } from "react";

const adminStats = {
  totalCourses: allCourses.length,
  activeLearners: 1847,
  completionRate: 87,
  avgRating: 4.7,
  totalEnrollments: 12456,
  newEnrollmentsThisWeek: 234
};

const recentActivity = [
  { type: "course_completed", user: "Mike Johnson", course: "Plumbing Fundamentals", time: "2 min ago" },
  { type: "new_enrollment", user: "Sarah Chen", course: "Customer Service Excellence", time: "5 min ago" },
  { type: "quiz_failed", user: "Tom Rodriguez", course: "Safety Protocols", time: "8 min ago" },
  { type: "badge_earned", user: "Lisa Park", course: "Advanced Pipe Systems", time: "12 min ago" },
  { type: "course_started", user: "David Kim", course: "Thorbis Work Orders 101", time: "15 min ago" }
];

const getActivityColor = (type: string) => {
  switch (type) {
    case "course_completed": return "text-green-600 bg-green-50 dark:bg-green-900/20";
    case "new_enrollment": return "text-blue-600 bg-blue-50 dark:bg-blue-900/20";
    case "quiz_failed": return "text-red-600 bg-red-50 dark:bg-red-900/20";
    case "badge_earned": return "text-purple-600 bg-purple-50 dark:bg-purple-900/20";
    case "course_started": return "text-orange-600 bg-orange-50 dark:bg-orange-900/20";
    default: return "text-muted-foreground bg-muted";
  }
};

const getActivityIcon = (type: string) => {
  switch (type) {
    case "course_completed": return "✅";
    case "new_enrollment": return "🆕";
    case "quiz_failed": return "❌";
    case "badge_earned": return "🏆";
    case "course_started": return "▶️";
    default: return "📝";
  }
};

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredCourses = allCourses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Course Administration</h1>
            <p className="text-muted-foreground">Manage courses, learners, and analytics</p>
          </div>
        
        <div className="flex items-center space-x-3">
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Course
          </Button>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
        </div>
        </div>
      </motion.div>

      {/* Overview Stats */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: "Total Courses", value: adminStats.totalCourses, icon: BookOpen, color: "text-blue-600" },
          { label: "Active Learners", value: adminStats.activeLearners.toLocaleString(), icon: Users, color: "text-green-600" },
          { label: "Completion Rate", value: `${adminStats.completionRate}%`, icon: BarChart3, color: "text-purple-600" },
          { label: "Avg Rating", value: adminStats.avgRating, icon: "⭐", color: "text-yellow-600" },
          { label: "Total Enrollments", value: adminStats.totalEnrollments.toLocaleString(), icon: "📊", color: "text-indigo-600" },
          { label: "New This Week", value: adminStats.newEnrollmentsThisWeek, icon: "🆕", color: "text-emerald-600" }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card className="glass-card">
              <CardContent className="p-4 text-center">
                {typeof stat.icon === "string" ? (
                  <div className="text-2xl mb-2">{stat.icon}</div>
                ) : (
                  <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
                )}
                <div className="text-lg font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Tabs defaultValue="courses" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="courses">Course Management</TabsTrigger>
            <TabsTrigger value="learners">Learner Analytics</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Course Management</CardTitle>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search courses..."
                        className="pl-10 w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Enrolled</TableHead>
                      <TableHead>Completion</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCourses.map((course) => (
                      <TableRow key={course.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg flex items-center justify-center">
                              <BookOpen className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">{course.title}</p>
                              <p className="text-sm text-muted-foreground">by {course.instructor}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {course.category}
                          </Badge>
                        </TableCell>
                        <TableCell>{course.enrolled}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-muted rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${Math.floor(Math.random() * 40 + 60)}%` }}
                              />
                            </div>
                            <span className="text-sm">78%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <span>{course.rating}</span>
                            <div className="text-yellow-500">⭐</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            Active
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Course
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Play className="h-4 w-4 mr-2" />
                                Preview
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="learners" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Learner Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold text-blue-600">1,847</div>
                    <p className="text-sm text-muted-foreground">Total Active</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold text-green-600">234</div>
                    <p className="text-sm text-muted-foreground">New This Week</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold text-purple-600">87%</div>
                    <p className="text-sm text-muted-foreground">Avg Completion</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold text-orange-600">42h</div>
                    <p className="text-sm text-muted-foreground">Avg Study Time</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Top Performers</h3>
                  {["Mike Johnson - 2,850 XP", "Sarah Chen - 2,750 XP", "Tom Rodriguez - 2,650 XP"].map((performer, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <span className="font-medium">{performer}</span>
                      <Badge variant="secondary">Elite</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Live Activity Feed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {recentActivity.map((activity, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <div className={`p-3 rounded-lg border ${getActivityColor(activity.type)}`}>
                        <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">{getActivityIcon(activity.type)}</span>
                          <div>
                            <p className="font-medium text-sm">
                              {activity.user} - {activity.course}
                            </p>
                            <p className="text-xs text-muted-foreground">{activity.time}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Course Auto-Enrollment</p>
                      <p className="text-sm text-muted-foreground">Automatically enroll new users</p>
                    </div>
                    <Button variant="outline" size="sm">Enable</Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Gamification Features</p>
                      <p className="text-sm text-muted-foreground">XP, badges, and leaderboards</p>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">Active</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">Course reminders and updates</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Content Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full justify-start" variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Bulk Upload Content
                  </Button>
                  
                  <Button className="w-full justify-start" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Course Data
                  </Button>
                  
                  <Button className="w-full justify-start" variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Content Templates
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}