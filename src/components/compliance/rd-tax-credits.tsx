"use client";

import React, { useState } from "react";
;
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Progress } from '@/components/ui';
;
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
;
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
;
import {
  Brain,
  DollarSign,
  TrendingUp,
  FileText,
  CheckCircle,
  Clock,
  Eye,
  Search,
  Calculator,
  Lightbulb,
  Target,
  Award,
  Building2,
  Code,
  Beaker,
  Zap,
  Download,
  Upload,
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
import {  } from '@/components/ui';


const rdData = {
  totalCreditsIdentified: 185750,
  creditsClaimed: 142300,
  creditsRemaining: 43450,
  eligibleExpenses: 928750,
  aiConfidenceScore: 94.2,
  quarterlyAllocation: 500000,
  payrollOffsetAvailable: 142300,
  currentYear: 2024
};

const identifiedActivities = [
  {
    id: 1,
    category: "Software Development",
    description: "Development of AI-powered payroll automation system",
    expenses: 285000,
    creditAmount: 57000,
    confidence: 98.5,
    status: "approved",
    quarter: "Q1 2024",
    employees: ["Engineering Team", "AI Research Team"],
    aiJustification: "Clearly meets IRS Four-Part Test - technological uncertainty in AI model training, systematic experimentation with different algorithms"
  },
  {
    id: 2,
    category: "Product Innovation", 
    description: "Research and development of real-time compliance monitoring",
    expenses: 165000,
    creditAmount: 33000,
    confidence: 92.1,
    status: "approved",
    quarter: "Q1 2024",
    employees: ["Compliance Team", "Engineering Team"],
    aiJustification: "Meets permitted purpose criteria - eliminating uncertainty in regulatory compliance automation"
  },
  {
    id: 3,
    category: "Process Improvement",
    description: "Development of automated break suggestion algorithms",
    expenses: 95000,
    creditAmount: 19000,
    confidence: 87.3,
    status: "under-review",
    quarter: "Q2 2024",
    employees: ["Data Science Team"],
    aiJustification: "Technological in nature - developing novel algorithms for human productivity optimization"
  },
  {
    id: 4,
    category: "Infrastructure",
    description: "Cloud architecture optimization for real-time processing",
    expenses: 125000,
    creditAmount: 25000,
    confidence: 89.7,
    status: "approved", 
    quarter: "Q2 2024",
    employees: ["DevOps Team", "Engineering Team"],
    aiJustification: "Process of experimentation - testing various cloud configurations to eliminate performance uncertainty"
  }
];

const eligibilityRequirements = [
  {
    requirement: "Permitted Purpose",
    description: "Developing new or improved business components",
    status: "met",
    details: "All identified activities involve developing new AI-powered features or improving existing systems"
  },
  {
    requirement: "Technological in Nature",
    description: "Must rely on hard sciences (computer science, engineering)",
    status: "met", 
    details: "Activities involve computer science, AI/ML, and software engineering principles"
  },
  {
    requirement: "Elimination of Uncertainty",
    description: "Must involve uncertainty about capability, method, or design",
    status: "met",
    details: "Each project addresses technical uncertainties in AI implementation, algorithm optimization, or system design"
  },
  {
    requirement: "Process of Experimentation",
    description: "Must involve systematic trial and error or modeling",
    status: "met",
    details: "All activities involve iterative development, A/B testing, and systematic experimentation"
  }
];

const quarterlyBreakdown = [
  {
    quarter: "Q1 2024",
    expenses: 450000,
    credits: 90000,
    activities: 2,
    status: "claimed"
  },
  {
    quarter: "Q2 2024", 
    expenses: 220000,
    credits: 44000,
    activities: 2,
    status: "processing"
  },
  {
    quarter: "Q3 2024",
    expenses: 180000,
    credits: 36000,
    activities: 3,
    status: "identified"
  },
  {
    quarter: "Q4 2024",
    expenses: 78750,
    credits: 15750,
    activities: 1,
    status: "projected"
  }
];

export function RDTaxCredits() {
  const [selectedActivity, setSelectedActivity] = useState(identifiedActivities[0]);
  const [selectedQuarter, setSelectedQuarter] = useState("all");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">R&D Tax Credits</h1>
          <p className="text-muted-foreground mt-2">
            AI-powered research and development tax credit identification and optimization
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
          <Button className="bg-gradient-to-r from-payroll-primary to-payroll-secondary">
            <Calculator className="mr-2 h-4 w-4" />
            Run AI Analysis
          </Button>
        </div>
      </div>

      {/* AI R&D Assistant */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-lg p-6 border border-emerald-200 dark:border-emerald-800"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <Lightbulb className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-emerald-900 dark:text-emerald-100">AI R&D Credit Hunter</h3>
              <p className="text-emerald-700 dark:text-emerald-300 text-sm">
                Scanning {identifiedActivities.length} activities • ${rdData.totalCreditsIdentified.toLocaleString()} in credits identified • {rdData.aiConfidenceScore}% confidence
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 mb-1">
              ${rdData.totalCreditsIdentified.toLocaleString()}
            </div>
            <div className="text-sm text-emerald-700 dark:text-emerald-300">Total Credits Available</div>
          </div>
        </div>
      </motion.div>

      {/* Credit Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Credits Identified</p>
                  <p className="text-2xl font-bold text-emerald-600">${rdData.totalCreditsIdentified.toLocaleString()}</p>
                  <p className="text-xs text-green-600">AI-verified eligible</p>
                </div>
                <Target className="h-8 w-8 text-muted-foreground" />
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
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Credits Claimed</p>
                  <p className="text-2xl font-bold text-blue-600">${rdData.creditsClaimed.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Filed with IRS</p>
                </div>
                <CheckCircle className="h-8 w-8 text-muted-foreground" />
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
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Remaining Credits</p>
                  <p className="text-2xl font-bold text-orange-600">${rdData.creditsRemaining.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Ready to claim</p>
                </div>
                <Clock className="h-8 w-8 text-muted-foreground" />
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
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">AI Confidence</p>
                  <p className="text-2xl font-bold text-payroll-primary">{rdData.aiConfidenceScore}%</p>
                  <p className="text-xs text-muted-foreground">Audit-ready</p>
                </div>
                <Brain className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="activities" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="activities">Qualifying Activities</TabsTrigger>
          <TabsTrigger value="eligibility">IRS Eligibility Check</TabsTrigger>
          <TabsTrigger value="quarterly">Quarterly Breakdown</TabsTrigger>
          <TabsTrigger value="optimization">AI Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="activities" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <input placeholder="Search activities..." className="pl-8 w-64 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors" />
              </div>
              <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by quarter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Quarters</SelectItem>
                  <SelectItem value="q1">Q1 2024</SelectItem>
                  <SelectItem value="q2">Q2 2024</SelectItem>
                  <SelectItem value="q3">Q3 2024</SelectItem>
                  <SelectItem value="q4">Q4 2024</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Activities
            </Button>
          </div>

          <div className="grid gap-4">
            {identifiedActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className={'p-2 rounded-full ${
                          activity.category === "Software Development" 
                            ? "bg-blue-100 dark:bg-blue-900/20" 
                            : activity.category === "Product Innovation"
                            ? "bg-green-100 dark:bg-green-900/20"
                            : activity.category === "Process Improvement"
                            ? "bg-purple-100 dark:bg-purple-900/20"
                            : "bg-orange-100 dark:bg-orange-900/20"
                        }'}>
                          {activity.category === "Software Development" ? (
                            <Code className="h-5 w-5 text-blue-600" />
                          ) : activity.category === "Product Innovation" ? (
                            <Lightbulb className="h-5 w-5 text-green-600" />
                          ) : activity.category === "Process Improvement" ? (
                            <TrendingUp className="h-5 w-5 text-purple-600" />
                          ) : (
                            <Building2 className="h-5 w-5 text-orange-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-semibold">{activity.category}</h4>
                            <Badge variant={activity.status === "approved" ? "default" : "secondary"}>
                              {activity.status}
                            </Badge>
                            <Badge variant="outline">
                              <Brain className="mr-1 h-3 w-3 text-green-600" />
                              {activity.confidence}% confident
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">{activity.description}</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <label className="text-xs text-muted-foreground">Quarter</label>
                              <p className="text-sm font-medium">{activity.quarter}</p>
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">Eligible Expenses</label>
                              <p className="text-sm font-medium">${activity.expenses.toLocaleString()}</p>
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">Credit Amount</label>
                              <p className="text-sm font-medium text-emerald-600">${activity.creditAmount.toLocaleString()}</p>
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">Team</label>
                              <p className="text-sm font-medium">{activity.employees.length} teams</p>
                            </div>
                          </div>
                          <Alert>
                            <Beaker className="h-4 w-4" />
                            <AlertDescription>
                              <strong>AI Qualification:</strong> {activity.aiJustification}
                            </AlertDescription>
                          </Alert>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" onClick={() => setSelectedActivity(activity)}>
                              <Eye className="mr-2 h-3 w-3" />
                              Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>{activity.category} - R&D Credit Analysis</DialogTitle>
                              <DialogDescription>
                                Detailed AI analysis and IRS compliance verification
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-semibold mb-3">Activity Details</h4>
                                <div className="space-y-3">
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                                    <p className="text-sm">{activity.description}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">Category</label>
                                    <p className="text-sm">{activity.category}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">Quarter</label>
                                    <p className="text-sm">{activity.quarter}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">Teams Involved</label>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {activity.employees.map((team, i) => (
                                        <Badge key={i} variant="outline" className="text-xs">
                                          {team}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-3">Financial Impact</h4>
                                <div className="space-y-3">
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">Eligible Expenses</label>
                                    <p className="text-lg font-semibold">${activity.expenses.toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">Tax Credit Amount</label>
                                    <p className="text-lg font-semibold text-emerald-600">${activity.creditAmount.toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">AI Confidence Score</label>
                                    <div className="flex items-center space-x-2 mt-1">
                                      <Progress value={activity.confidence} className="flex-1" />
                                      <span className="text-sm font-medium">{activity.confidence}%</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="mt-6">
                              <h4 className="font-semibold mb-3">IRS Four-Part Test Compliance</h4>
                              <Alert>
                                <CheckCircle className="h-4 w-4" />
                                <AlertDescription>
                                  <strong>AI Analysis:</strong> {activity.aiJustification}
                                </AlertDescription>
                              </Alert>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button size="sm">
                          <FileText className="mr-2 h-3 w-3" />
                          Claim Credit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="eligibility" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
                IRS Four-Part Test Compliance
              </CardTitle>
              <CardDescription>
                AI verification of eligibility requirements for R&D tax credits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {eligibilityRequirements.map((req, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="p-4 rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/20"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/20">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{req.requirement}</h4>
                          <Badge className="bg-green-100 text-green-800">
                            {req.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{req.description}</p>
                        <p className="text-sm font-medium text-green-700">{req.details}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Alert>
            <Award className="h-4 w-4" />
            <AlertDescription>
              <strong>Compliance Status:</strong> All activities meet IRS requirements with 94.2% AI confidence.
              Documentation is audit-ready and backed by systematic tracking of qualifying activities.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="quarterly" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>2024 Quarterly R&D Credit Breakdown</CardTitle>
              <CardDescription>
                Quarter-by-quarter analysis of R&D activities and credit opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quarter</TableHead>
                    <TableHead>Activities</TableHead>
                    <TableHead>Eligible Expenses</TableHead>
                    <TableHead>Credit Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quarterlyBreakdown.map((quarter) => (
                    <TableRow key={quarter.quarter}>
                      <TableCell className="font-medium">{quarter.quarter}</TableCell>
                      <TableCell>{quarter.activities}</TableCell>
                      <TableCell>${quarter.expenses.toLocaleString()}</TableCell>
                      <TableCell className="font-semibold text-emerald-600">
                        ${quarter.credits.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          quarter.status === "claimed" ? "default" :
                          quarter.status === "processing" ? "secondary" :
                          quarter.status === "identified" ? "outline" : "secondary"
                        }>
                          {quarter.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="ghost">
                            <Eye className="h-3 w-3" />
                          </Button>
                          {quarter.status === "identified" && (
                            <Button size="sm">
                              <FileText className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600 mb-1">
                    ${quarterlyBreakdown.reduce((sum, q) => sum + q.expenses, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Expenses</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    ${quarterlyBreakdown.reduce((sum, q) => sum + q.credits, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Credits</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {quarterlyBreakdown.reduce((sum, q) => sum + q.activities, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Activities</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600 mb-1">
                    20%
                  </div>
                  <div className="text-sm text-muted-foreground">Credit Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="mr-2 h-5 w-5 text-payroll-primary" />
                  AI Credit Optimization Recommendations
                </CardTitle>
                <CardDescription>
                  Machine learning insights to maximize your R&D tax credit opportunities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <TrendingUp className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Quarterly Redemption Strategy:</strong> AI recommends claiming $125,000 in credits quarterly 
                      to optimize cash flow while staying within the $500,000 annual limit for payroll tax offset.
                    </AlertDescription>
                  </Alert>
                  
                  <Alert>
                    <Target className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Documentation Enhancement:</strong> Add 2-3 more engineering experiments to Q3 activities 
                      to strengthen IRS Four-Part Test compliance and increase credit confidence to 96%+.
                    </AlertDescription>
                  </Alert>
                  
                  <Alert>
                    <Lightbulb className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Future Opportunities:</strong> Machine learning model training activities starting Q4 
                      could generate an additional $35,000 in credits based on projected development efforts.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payroll Tax Offset</CardTitle>
                  <CardDescription>Real-time credit application to payroll taxes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Quarterly Allocation</span>
                      <span className="font-semibold">${rdData.quarterlyAllocation.toLocaleString()}</span>
                    </div>
                    <Progress value={28} />
                    <div className="text-sm text-muted-foreground">
                      ${rdData.payrollOffsetAvailable.toLocaleString()} available for immediate payroll tax offset
                    </div>
                    <Button className="w-full">
                      <Calculator className="mr-2 h-4 w-4" />
                      Apply to Next Payroll
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Credit Forecasting</CardTitle>
                  <CardDescription>AI-predicted credits for upcoming quarters</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Q3 2024 (Projected)</span>
                      <span className="font-medium">$36,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Q4 2024 (Projected)</span>
                      <span className="font-medium">$15,750</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Q1 2025 (Forecast)</span>
                      <span className="font-medium">$42,000</span>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex justify-between font-semibold">
                        <span>Total Forecast</span>
                        <span className="text-emerald-600">$93,750</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}