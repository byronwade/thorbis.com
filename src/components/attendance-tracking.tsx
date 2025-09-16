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

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  AlertTriangle,
  Brain,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Eye,
  MapPin,
  Settings,
  Smartphone,
  TrendingUp,
  Users,
  Zap,
  Coffee,
  Timer,
  Activity,
  BarChart3,
  FileText,
  AlertCircle,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
const attendanceData = {
  totalEmployees: 24,
  presentToday: 22,
  lateArrivals: 3,
  earlyDepartures: 1,
  onBreak: 5,
  remote: 8,
  overtime: 4,
  aiAnomalies: 2
};

const todayAttendance = [
  {
    id: 1,
    name: "Sarah Johnson",
    department: "Engineering",
    clockIn: "8:45 AM",
    clockOut: null,
    location: "Office - SF",
    status: "present",
    breaks: 2,
    hoursWorked: 5.25,
    overtime: 0,
    aiNotes: null,
    geolocation: { lat: 37.7749, lng: -122.4194 }
  },
  {
    id: 2,
    name: "Michael Chen",
    department: "Marketing",
    clockIn: "9:15 AM",
    clockOut: null,
    location: "Remote",
    status: "present",
    breaks: 1,
    hoursWorked: 4.75,
    overtime: 0,
    aiNotes: "15 minutes late - traffic pattern analyzed",
    geolocation: null
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    department: "Sales",
    clockIn: "8:30 AM",
    clockOut: null,
    location: "Office - SF",
    status: "on-break",
    breaks: 3,
    hoursWorked: 5.5,
    overtime: 0,
    aiNotes: "Break pattern suggests high productivity periods",
    geolocation: { lat: 37.7749, lng: -122.4194 }
  },
  {
    id: 4,
    name: "David Wilson",
    department: "Operations",
    clockIn: "8:00 AM",
    clockOut: null,
    location: "Office - SF",
    status: "present",
    breaks: 1,
    hoursWorked: 6.0,
    overtime: 1.0,
    aiNotes: null,
    geolocation: { lat: 37.7749, lng: -122.4194 }
  },
  {
    id: 5,
    name: "Lisa Thompson",
    department: "HR",
    clockIn: "9:30 AM",
    clockOut: "5:45 PM",
    location: "Office - SF",
    status: "departed",
    breaks: 2,
    hoursWorked: 8.25,
    overtime: 0.25,
    aiNotes: "Left 15 minutes early - doctor appointment noted",
    geolocation: { lat: 37.7749, lng: -122.4194 }
  }
];

const aiInsights = [
  {
    type: "anomaly",
    title: "Unusual Break Pattern Detected",
    employee: "Emily Rodriguez",
    description: "Taking breaks every 90 minutes instead of usual 3-hour intervals. AI suggests possible workload stress.",
    confidence: 87.3,
    impact: "medium",
    recommendation: "Schedule 1:1 check-in to assess workload"
  },
  {
    type: "efficiency",
    title: "Optimal Break Timing Identified",
    employee: "David Wilson",
    description: "Most productive work occurs between 9-11 AM. AI recommends scheduling important tasks during this window.",
    confidence: 94.1,
    impact: "high",
    recommendation: "Block calendar for deep work 9-11 AM"
  },
  {
    type: "attendance",
    title: "Consistent Late Arrival Pattern",
    employee: "Michael Chen",
    description: "Arriving 10-15 minutes late daily due to public transit delays. Pattern identified over 2 weeks.",
    confidence: 99.2,
    impact: "low",
    recommendation: "Adjust start time by 30 minutes or suggest earlier commute"
  }
];

const breakSuggestions = [
  {
    employee: "Sarah Johnson",
    nextBreak: "2:30 PM",
    reason: "Screen time exceeded 2 hours",
    type: "eye-rest",
    duration: "5 minutes"
  },
  {
    employee: "Michael Chen",
    nextBreak: "3:15 PM",
    reason: "Productivity dip detected",
    type: "movement",
    duration: "10 minutes"
  },
  {
    employee: "David Wilson",
    nextBreak: "4:00 PM",
    reason: "Extended focus period",
    type: "mental",
    duration: "15 minutes"
  }
];

export function AttendanceTracking() {
  const [selectedEmployee, setSelectedEmployee] = useState(todayAttendance[0]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Attendance & Time Tracking</h1>
          <p className="text-muted-foreground mt-2">
            AI-powered attendance monitoring with smart break suggestions and anomaly detection
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button className="bg-gradient-to-r from-payroll-primary to-payroll-secondary">
            <Settings className="mr-2 h-4 w-4" />
            Tracking Settings
          </Button>
        </div>
      </div>

      {/* AI Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
              <Brain className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-purple-900 dark:text-purple-100">AI Attendance Monitor</h3>
              <p className="text-purple-700 dark:text-purple-300 text-sm">
                Monitoring {attendanceData.totalEmployees} employees • {attendanceData.aiAnomalies} anomalies detected • Break suggestions active
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
              <CheckCircle className="mr-1 h-3 w-3" />
              Real-time Tracking
            </Badge>
            <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
              <Zap className="mr-1 h-3 w-3" />
              AI Insights
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{attendanceData.presentToday}</p>
                <p className="text-xs text-muted-foreground">Present</p>
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
                <p className="text-2xl font-bold text-orange-600">{attendanceData.lateArrivals}</p>
                <p className="text-xs text-muted-foreground">Late</p>
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
                <p className="text-2xl font-bold text-blue-600">{attendanceData.onBreak}</p>
                <p className="text-xs text-muted-foreground">On Break</p>
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
                <p className="text-2xl font-bold text-purple-600">{attendanceData.remote}</p>
                <p className="text-xs text-muted-foreground">Remote</p>
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
                <p className="text-2xl font-bold text-red-600">{attendanceData.overtime}</p>
                <p className="text-xs text-muted-foreground">Overtime</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-neutral-600">{attendanceData.earlyDepartures}</p>
                <p className="text-xs text-muted-foreground">Early Out</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{attendanceData.aiAnomalies}</p>
                <p className="text-xs text-muted-foreground">Anomalies</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-payroll-primary">92%</p>
                <p className="text-xs text-muted-foreground">On Time</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="live" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="live">Live Attendance</TabsTrigger>
          <TabsTrigger value="breaks">AI Break Suggestions</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="mr-2 h-5 w-5" />
                Today's Attendance - {new Date().toLocaleDateString()}'
              </CardTitle>
              <CardDescription>
                Real-time tracking with AI-powered geolocation and behavioral analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Clock In</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Breaks</TableHead>
                    <TableHead>AI Notes</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {todayAttendance.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.name}</TableCell>
                      <TableCell>{record.department}</TableCell>
                      <TableCell>{record.clockIn}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          {record.geolocation && (
                            <MapPin className="h-3 w-3 text-green-600" />
                          )}
                          <span className="text-sm">{record.location}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {record.status === "present" ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="mr-1 h-2 w-2" />
                            Present
                          </Badge>
                        ) : record.status === "on-break" ? (
                          <Badge className="bg-blue-100 text-blue-800">
                            <Coffee className="mr-1 h-2 w-2" />
                            On Break
                          </Badge>
                        ) : record.status === "departed" ? (
                          <Badge variant="secondary">
                            <Clock className="mr-1 h-2 w-2" />
                            Departed
                          </Badge>
                        ) : (
                          <Badge variant="outline">Unknown</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <span className="font-medium">{record.hoursWorked}h</span>
                          {record.overtime > 0 && (
                            <Badge variant="outline" className="ml-1 text-xs">
                              +{record.overtime}h OT
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {record.breaks} breaks
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {record.aiNotes ? (
                          <div className="flex items-center space-x-1">
                            <Brain className="h-3 w-3 text-purple-600" />
                            <span className="text-xs text-muted-foreground truncate max-w-32">
                              {record.aiNotes}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="ghost" onClick={() => setSelectedEmployee(record)}>
                                <Eye className="h-3 w-3" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>{record.name} - Attendance Details</DialogTitle>
                                <DialogDescription>
                                  Detailed time tracking and AI analysis for today
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">Clock In</label>
                                    <p className="text-lg">{record.clockIn}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Clock Out</label>
                                    <p className="text-lg">{record.clockOut || "Still working"}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Hours Worked</label>
                                    <p className="text-lg font-semibold">{record.hoursWorked}h</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Breaks Taken</label>
                                    <p className="text-lg font-semibold">{record.breaks}</p>
                                  </div>
                                </div>
                                {record.geolocation && (
                                  <Alert>
                                    <MapPin className="h-4 w-4" />
                                    <AlertDescription>
                                      Location verified via GPS: {record.location}
                                    </AlertDescription>
                                  </Alert>
                                )}
                                {record.aiNotes && (
                                  <Alert>
                                    <Brain className="h-4 w-4" />
                                    <AlertDescription>
                                      AI Insight: {record.aiNotes}
                                    </AlertDescription>
                                  </Alert>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button size="sm" variant="ghost">
                            <FileText className="h-3 w-3" />
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

        <TabsContent value="breaks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Coffee className="mr-2 h-5 w-5 text-blue-600" />
                AI-Powered Break Suggestions
              </CardTitle>
              <CardDescription>
                Intelligent break recommendations based on productivity patterns and wellbeing indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {breakSuggestions.map((suggestion, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${
                          suggestion.type === "eye-rest" 
                            ? "bg-blue-100 dark:bg-blue-900/20" 
                            : suggestion.type === "movement"
                            ? "bg-green-100 dark:bg-green-900/20"
                            : "bg-purple-100 dark:bg-purple-900/20"
                        }'}>
                          {suggestion.type === "eye-rest" ? (
                            <Eye className="h-4 w-4 text-blue-600" />
                          ) : suggestion.type === "movement" ? (
                            <Activity className="h-4 w-4 text-green-600" />
                          ) : (
                            <Brain className="h-4 w-4 text-purple-600" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold">{suggestion.employee}</h4>
                          <p className="text-sm text-muted-foreground">{suggestion.reason}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              <Timer className="mr-1 h-2 w-2" />
                              {suggestion.duration}
                            </Badge>
                            <Badge variant={
                              suggestion.type === "eye-rest" ? "default" :
                              suggestion.type === "movement" ? "secondary" : "outline"
                            } className="text-xs">
                              {suggestion.type.replace("-", " ")}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-payroll-primary mb-1">
                          {suggestion.nextBreak}
                        </div>
                        <Button size="sm">
                          <Smartphone className="mr-2 h-3 w-3" />
                          Send Notification
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Alert>
            <Brain className="h-4 w-4" />
            <AlertDescription>
              Break suggestions are generated using AI analysis of productivity patterns, screen time, 
              and health recommendations. Employees receive gentle mobile notifications.
            </AlertDescription>
          </Alert>
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
                        insight.type === "anomaly" 
                          ? "bg-red-100 dark:bg-red-900/20" 
                          : insight.type === "efficiency"
                          ? "bg-green-100 dark:bg-green-900/20"
                          : "bg-blue-100 dark:bg-blue-900/20"
                      }'}>
                        {insight.type === "anomaly" ? (
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        ) : insight.type === "efficiency" ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <Clock className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{insight.title}</h4>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {insight.employee}
                            </Badge>
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
                          <div className="text-sm font-medium text-blue-600">
                            Recommendation: {insight.recommendation}
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">Dismiss</Button>
                            <Button size="sm">Apply Action</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Weekly Attendance Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Attendance analytics chart will be displayed here</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Timer className="mr-2 h-5 w-5" />
                  Break Pattern Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Timer className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Break pattern analytics will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Attendance Summary</CardTitle>
              <CardDescription>
                Overall attendance metrics with AI-generated insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">94.5%</div>
                  <div className="text-sm text-muted-foreground">Average Attendance</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">7.8h</div>
                  <div className="text-sm text-muted-foreground">Avg Daily Hours</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">12min</div>
                  <div className="text-sm text-muted-foreground">Avg Late Time</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">2.3</div>
                  <div className="text-sm text-muted-foreground">Avg Breaks/Day</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}