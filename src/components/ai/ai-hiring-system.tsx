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
import {
  Brain,
  Briefcase,
  Users,
  Star,
  CheckCircle,
  Clock,
  Eye,
  MessageSquare,
  Phone,
  Mail,
  Download,
  Upload,
  Filter,
  Search,
  TrendingUp,
  Target,
  Zap,
  FileText,
  Calendar,
  Award,
  Plus,
  Settings,
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
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
const jobOpenings = [
  {
    id: 1,
    title: "Senior Software Engineer",
    department: "Engineering",
    location: "San Francisco, CA",
    type: "Full-time",
    status: "active",
    posted: "2024-02-01",
    applications: 47,
    aiScreened: 35,
    qualified: 12,
    interviewed: 5,
    salaryRange: "$140,000 - $180,000",
    urgency: "high",
    aiScore: 94.2
  },
  {
    id: 2,
    title: "Marketing Manager",
    department: "Marketing",
    location: "Remote",
    type: "Full-time", 
    status: "active",
    posted: "2024-02-05",
    applications: 23,
    aiScreened: 18,
    qualified: 8,
    interviewed: 2,
    salaryRange: "$85,000 - $110,000",
    urgency: "medium",
    aiScore: 87.5
  },
  {
    id: 3,
    title: "Product Designer",
    department: "Design",
    location: "New York, NY",
    type: "Full-time",
    status: "paused",
    posted: "2024-01-28",
    applications: 31,
    aiScreened: 24,
    qualified: 6,
    interviewed: 3,
    salaryRange: "$95,000 - $125,000",
    urgency: "low",
    aiScore: 91.8
  }
];

const candidates = [
  {
    id: 1,
    name: "Sarah Chen",
    email: "sarah.chen@email.com",
    position: "Senior Software Engineer",
    experience: "7 years",
    location: "San Francisco, CA",
    status: "interview",
    stage: "Technical Interview",
    aiScore: 96.5,
    skills: ["React", "Node.js", "Python", "AWS"],
    education: "MS Computer Science - Stanford",
    previousCompany: "Google",
    appliedDate: "2024-02-03",
    aiInsights: [
      "Excellent technical background with relevant experience",
      "Strong cultural fit based on communication style",
      "Salary expectations align with budget"
    ],
    resumeScore: 94,
    interviewScore: 92,
    reference: "Strong references from previous managers"
  },
  {
    id: 2,
    name: "Michael Rodriguez",
    email: "m.rodriguez@email.com",
    position: "Senior Software Engineer", 
    experience: "5 years",
    location: "Austin, TX",
    status: "screening",
    stage: "AI Phone Screen",
    aiScore: 88.3,
    skills: ["JavaScript", "React", "GraphQL", "Docker"],
    education: "BS Computer Engineering - UT Austin",
    previousCompany: "Meta",
    appliedDate: "2024-02-04",
    aiInsights: [
      "Strong technical skills but limited senior-level experience",
      "Enthusiastic about company mission",
      "Open to relocation"
    ],
    resumeScore: 87,
    interviewScore: null,
    reference: "Pending"
  },
  {
    id: 3,
    name: "Emily Johnson",
    email: "emily.j@email.com",
    position: "Marketing Manager",
    experience: "8 years",
    location: "Remote",
    status: "offer",
    stage: "Reference Check",
    aiScore: 93.7,
    skills: ["Digital Marketing", "Analytics", "Content Strategy", "SEO"],
    education: "MBA Marketing - Northwestern Kellogg",
    previousCompany: "HubSpot",
    appliedDate: "2024-02-06",
    aiInsights: [
      "Exceptional marketing background with B2B SaaS experience",
      "Leadership potential with team management experience",
      "Cultural values alignment score: 96%"
    ],
    resumeScore: 95,
    interviewScore: 94,
    reference: "Excellent references verified"
  }
];

const aiRecommendations = [
  {
    type: "candidate-match",
    title: "Top Candidate for Senior Engineer Role",
    description: "Sarah Chen shows 96.5% match for Senior Software Engineer position. AI analysis suggests immediate interview.",
    candidate: "Sarah Chen",
    position: "Senior Software Engineer", 
    confidence: 96.5,
    action: "Schedule Interview"
  },
  {
    type: "process-optimization",
    title: "Interview Process Bottleneck Detected",
    description: "Average time from application to interview is 12 days, 4 days above industry standard. Consider streamlining.",
    confidence: 89.2,
    impact: "Reduce time-to-hire by 35%",
    action: "Optimize Process"
  },
  {
    type: "salary-analysis",
    title: "Competitive Salary Adjustment Needed",
    description: "Senior Engineer salary range is 8% below market rate. Risk of losing top candidates.",
    confidence: 94.1,
    impact: "Increase qualified applications by 25%",
    action: "Adjust Salary Range"
  }
];

export function AIHiringSystem() {
  const [selectedCandidate, setSelectedCandidate] = useState(candidates[0]);
  const [filterStatus, setFilterStatus] = useState("all");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI-Powered Hiring & ATS</h1>
          <p className="text-muted-foreground mt-2">
            Intelligent applicant tracking with AI-powered candidate screening and matching
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Interview Settings
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-payroll-primary to-payroll-secondary">
                <Plus className="mr-2 h-4 w-4" />
                Post New Job
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Job Posting</DialogTitle>
                <DialogDescription>
                  AI will help optimize your job description and requirements
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input id="jobTitle" placeholder="e.g. Senior Software Engineer" />
                  </div>
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="engineering">Engineering</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="sales">Sales</SelectItem>
                        <SelectItem value="design">Design</SelectItem>
                        <SelectItem value="operations">Operations</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" placeholder="San Francisco, CA or Remote" />
                  </div>
                  <div>
                    <Label htmlFor="type">Employment Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="salaryRange">Salary Range</Label>
                  <Input id="salaryRange" placeholder="$100,000 - $130,000" />
                </div>
                <div>
                  <Label htmlFor="description">Job Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Describe the role, responsibilities, and requirements..."
                    rows={4}
                  />
                </div>
                <Alert>
                  <Brain className="h-4 w-4" />
                  <AlertDescription>
                    AI will analyze your job description for bias, optimize for SEO, and suggest improvements to attract top candidates.
                  </AlertDescription>
                </Alert>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline">Save as Draft</Button>
                  <Button>
                    <Zap className="mr-2 h-4 w-4" />
                    AI Optimize & Post
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* AI Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 rounded-lg p-6 border border-indigo-200 dark:border-indigo-800"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/30">
              <Brain className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-indigo-900 dark:text-indigo-100">AI Recruitment Assistant</h3>
              <p className="text-indigo-700 dark:text-indigo-300 text-sm">
                Screening 101 applications • 3 high-match candidates identified • Interview scheduling optimized
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-indigo-900 dark:text-indigo-100 mb-1">
              92%
            </div>
            <div className="text-sm text-indigo-700 dark:text-indigo-300">AI Accuracy Rate</div>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">3</p>
                <p className="text-xs text-muted-foreground">Active Jobs</p>
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
                <p className="text-2xl font-bold text-green-600">101</p>
                <p className="text-xs text-muted-foreground">Total Applications</p>
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
                <p className="text-2xl font-bold text-purple-600">77</p>
                <p className="text-xs text-muted-foreground">AI Screened</p>
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
                <p className="text-2xl font-bold text-orange-600">26</p>
                <p className="text-xs text-muted-foreground">Qualified</p>
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
                <p className="text-2xl font-bold text-payroll-primary">10</p>
                <p className="text-xs text-muted-foreground">In Process</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="candidates" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="candidates">AI-Matched Candidates</TabsTrigger>
          <TabsTrigger value="jobs">Job Openings</TabsTrigger>
          <TabsTrigger value="analytics">Hiring Analytics</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="candidates" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search candidates..." className="pl-8 w-64" />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Candidates</SelectItem>
                  <SelectItem value="screening">AI Screening</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="offer">Offer Stage</SelectItem>
                  <SelectItem value="hired">Hired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-3 w-3" />
                Advanced Filters
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-3 w-3" />
                Export
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {candidates.map((candidate, index) => (
              <motion.div
                key={candidate.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedCandidate(candidate)}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-semibold">{candidate.name}</h4>
                            <Badge variant="outline">
                              <Brain className="mr-1 h-3 w-3 text-green-600" />
                              AI Match: {candidate.aiScore}%
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {candidate.position} • {candidate.experience} • {candidate.location}
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <label className="text-xs text-muted-foreground">Education</label>
                              <p className="text-sm font-medium">{candidate.education}</p>
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">Previous Company</label>
                              <p className="text-sm font-medium">{candidate.previousCompany}</p>
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">Resume Score</label>
                              <p className="text-sm font-medium">{candidate.resumeScore}%</p>
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">Applied</label>
                              <p className="text-sm font-medium">{new Date(candidate.appliedDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {candidate.skills.map((skill, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <strong>Top AI Insight:</strong> {candidate.aiInsights[0]}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={
                          candidate.status === "offer" ? "bg-green-100 text-green-800" :
                          candidate.status === "interview" ? "bg-blue-100 text-blue-800" :
                          candidate.status === "screening" ? "bg-orange-100 text-orange-800" :
                          "bg-neutral-100 text-neutral-800"
                        }>
                          {candidate.stage}
                        </Badge>
                        <div className="flex space-x-2 mt-4">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Eye className="mr-2 h-3 w-3" />
                                View Profile
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                              <DialogHeader>
                                <DialogTitle>{candidate.name} - Candidate Profile</DialogTitle>
                                <DialogDescription>
                                  Comprehensive AI-powered candidate analysis and scoring
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid grid-cols-3 gap-6">
                                <div className="col-span-2">
                                  <h4 className="font-semibold mb-3">Candidate Details</h4>
                                  <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                                        <p>{candidate.email}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-muted-foreground">Experience</label>
                                        <p>{candidate.experience}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-muted-foreground">Location</label>
                                        <p>{candidate.location}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-muted-foreground">Current Stage</label>
                                        <p>{candidate.stage}</p>
                                      </div>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-muted-foreground">Skills</label>
                                      <div className="flex flex-wrap gap-2 mt-1">
                                        {candidate.skills.map((skill, i) => (
                                          <Badge key={i} variant="outline">
                                            {skill}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-3">AI Analysis</h4>
                                  <div className="space-y-4">
                                    <div>
                                      <label className="text-sm font-medium text-muted-foreground">Overall Match Score</label>
                                      <div className="flex items-center space-x-2 mt-1">
                                        <Progress value={candidate.aiScore} className="flex-1" />
                                        <span className="text-sm font-medium">{candidate.aiScore}%</span>
                                      </div>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-muted-foreground">Resume Score</label>
                                      <div className="flex items-center space-x-2 mt-1">
                                        <Progress value={candidate.resumeScore} className="flex-1" />
                                        <span className="text-sm font-medium">{candidate.resumeScore}%</span>
                                      </div>
                                    </div>
                                    {candidate.interviewScore && (
                                      <div>
                                        <label className="text-sm font-medium text-muted-foreground">Interview Score</label>
                                        <div className="flex items-center space-x-2 mt-1">
                                          <Progress value={candidate.interviewScore} className="flex-1" />
                                          <span className="text-sm font-medium">{candidate.interviewScore}%</span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="mt-6">
                                <h4 className="font-semibold mb-3">AI Insights</h4>
                                <div className="space-y-2">
                                  {candidate.aiInsights.map((insight, i) => (
                                    <Alert key={i}>
                                      <Brain className="h-4 w-4" />
                                      <AlertDescription>{insight}</AlertDescription>
                                    </Alert>
                                  ))}
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button size="sm">
                            <MessageSquare className="mr-2 h-3 w-3" />
                            Contact
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

        <TabsContent value="jobs" className="space-y-4">
          <div className="grid gap-4">
            {jobOpenings.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/20">
                          <Briefcase className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-xl font-semibold">{job.title}</h4>
                            <Badge variant={
                              job.status === "active" ? "default" :
                              job.status === "paused" ? "secondary" : "outline"
                            }>
                              {job.status}
                            </Badge>
                            <Badge variant={
                              job.urgency === "high" ? "destructive" :
                              job.urgency === "medium" ? "default" : "secondary"
                            } className="text-xs">
                              {job.urgency} urgency
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">
                            {job.department} • {job.location} • {job.type} • {job.salaryRange}
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">{job.applications}</div>
                              <div className="text-xs text-muted-foreground">Applications</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-600">{job.aiScreened}</div>
                              <div className="text-xs text-muted-foreground">AI Screened</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600">{job.qualified}</div>
                              <div className="text-xs text-muted-foreground">Qualified</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-orange-600">{job.interviewed}</div>
                              <div className="text-xs text-muted-foreground">Interviewed</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="mb-4">
                          <Brain className="mr-1 h-3 w-3 text-green-600" />
                          AI Score: {job.aiScore}%
                        </Badge>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="mr-2 h-3 w-3" />
                            View Details
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
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Hiring Pipeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Applications</span>
                    <span className="font-semibold">101</span>
                  </div>
                  <Progress value={100} />
                  
                  <div className="flex justify-between items-center">
                    <span>AI Screened</span>
                    <span className="font-semibold">77 (76%)</span>
                  </div>
                  <Progress value={76} />
                  
                  <div className="flex justify-between items-center">
                    <span>Qualified</span>
                    <span className="font-semibold">26 (26%)</span>
                  </div>
                  <Progress value={26} />
                  
                  <div className="flex justify-between items-center">
                    <span>Interviewed</span>
                    <span className="font-semibold">10 (10%)</span>
                  </div>
                  <Progress value={10} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  Time to Hire Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Average Time to Hire</span>
                    <span className="font-semibold">28 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>AI Screening Time</span>
                    <span className="font-semibold">2 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Interview Scheduling</span>
                    <span className="font-semibold">3.5 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Offer to Acceptance</span>
                    <span className="font-semibold">4.2 days</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4">
            {aiRecommendations.map((rec, index) => (
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
                        rec.type === "candidate-match" 
                          ? "bg-green-100 dark:bg-green-900/20" 
                          : rec.type === "process-optimization"
                          ? "bg-blue-100 dark:bg-blue-900/20"
                          : "bg-orange-100 dark:bg-orange-900/20"
                      }'}>
                        {rec.type === "candidate-match" ? (
                          <Target className="h-4 w-4 text-green-600" />
                        ) : rec.type === "process-optimization" ? (
                          <TrendingUp className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Award className="h-4 w-4 text-orange-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{rec.title}</h4>
                          <Badge variant="outline" className="text-green-600">
                            <Brain className="mr-1 h-2 w-2" />
                            {rec.confidence}% confident
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {rec.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="text-sm">
                            {rec.candidate && (
                              <span className="font-medium">Candidate: {rec.candidate}</span>
                            )}
                            {rec.impact && (
                              <span className="font-medium text-green-600">Impact: {rec.impact}</span>
                            )}
                          </div>
                          <Button size="sm">{rec.action}</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}