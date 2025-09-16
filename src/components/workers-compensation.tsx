"use client";

import React, { useState } from "react";
;
import {
  Brain,
  Shield,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Users,
  Building2,
  Calculator,
  Eye,
  Settings,
  Download,
  Activity,
  Zap,
  Target,
  BarChart3,
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
import {  } from '@/components/ui';


const workersCompData = {
  totalPremium: 28450,
  monthlyEstimate: 2371,
  actualPayroll: 96500,
  adjustedPayroll: 94200,
  currentRate: 0.294,
  industryAverage: 0.312,
  savingsToDate: 3280,
  claims: 0,
  experienceModifier: 0.92,
  policyStatus: "active"
};

const payrollBreakdown = [
  {
    employee: "Sarah Johnson",
    classCode: "8810", // Computer programming
    description: "Software Engineer",
    payroll: 15000,
    rate: 0.18,
    premium: 27,
    riskLevel: "low"
  },
  {
    employee: "Michael Chen",
    classCode: "8742", // Marketing
    description: "Marketing Manager", 
    payroll: 9500,
    rate: 0.22,
    premium: 21,
    riskLevel: "low"
  },
  {
    employee: "David Wilson",
    classCode: "8810", // Operations/Admin
    description: "Operations Manager",
    payroll: 8200,
    rate: 0.35,
    premium: 29,
    riskLevel: "medium"
  },
  {
    employee: "Emily Rodriguez", 
    classCode: "8742", // Sales
    description: "Sales Executive",
    payroll: 7800,
    rate: 0.28,
    premium: 22,
    riskLevel: "low"
  },
  {
    employee: "Lisa Thompson",
    classCode: "8810", // HR/Admin
    description: "HR Manager",
    payroll: 9200,
    rate: 0.31,
    premium: 29,
    riskLevel: "medium"
  }
];

const riskAssessment = [
  {
    category: "Workplace Safety",
    score: 94,
    status: "excellent",
    factors: ["Remote work policy", "Ergonomic assessments", "Safety training"],
    aiRecommendation: "Continue current safety protocols"
  },
  {
    category: "Claims History",
    score: 100,
    status: "excellent", 
    factors: ["Zero claims in 24 months", "Proactive injury prevention"],
    aiRecommendation: "Maintain preventive measures"
  },
  {
    category: "Industry Risk",
    score: 88,
    status: "good",
    factors: ["Tech industry - low risk", "Office environment"],
    aiRecommendation: "Consider additional ergonomic equipment"
  },
  {
    category: "Employee Training",
    score: 92,
    status: "excellent",
    factors: ["Regular safety training", "Incident reporting system"],
    aiRecommendation: "Add mental health awareness training"
  }
];

const monthlyPayments = [
  {
    month: "January 2024",
    payroll: 96500,
    premium: 2387,
    adjustment: -45,
    finalPremium: 2342,
    status: "paid"
  },
  {
    month: "February 2024", 
    payroll: 98200,
    premium: 2429,
    adjustment: 12,
    finalPremium: 2441,
    status: "paid"
  },
  {
    month: "March 2024",
    payroll: 94800,
    premium: 2343,
    adjustment: -28,
    finalPremium: 2315,
    status: "processing"
  },
  {
    month: "April 2024",
    payroll: 97100,
    premium: 2394,
    adjustment: 0,
    finalPremium: 2394,
    status: "projected"
  }
];

const aiInsights = [
  {
    type: "cost-optimization",
    title: "Experience Modifier Improvement",
    description: "Zero claims for 24+ months qualifies you for a 0.92 experience modifier, saving $3,280 annually",
    impact: "high",
    savings: "$3,280/year",
    confidence: 96.8
  },
  {
    type: "risk-management",
    title: "Remote Work Risk Reduction", 
    description: "68% of workforce is remote, reducing workplace injury risk by 45% compared to office-only operations",
    impact: "medium",
    savings: "Lower premiums",
    confidence: 89.4
  },
  {
    type: "classification",
    title: "Class Code Optimization",
    description: "AI analysis suggests 3 employees could qualify for lower-risk class codes, potentially saving $890/year",
    impact: "medium", 
    savings: "$890/year",
    confidence: 82.1
  }
];

export function WorkersCompensation() {
  const [selectedPeriod, setSelectedPeriod] = useState("current");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workers' Compensation</h1>'
          <p className="text-muted-foreground mt-2">
            AI-powered pay-as-you-go workers' comp with real-time premium adjustments'
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Certificate of Coverage
          </Button>
          <Button className="bg-gradient-to-r from-payroll-primary to-payroll-secondary">
            <Calculator className="mr-2 h-4 w-4" />
            Adjust Coverage
          </Button>
        </div>
      </div>

      {/* AI Workers' Comp Assistant */}'
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-lg p-6 border border-orange-200 dark:border-orange-800"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/30">
              <Shield className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-orange-900 dark:text-orange-100">AI Risk Management</h3>
              <p className="text-orange-700 dark:text-orange-300 text-sm">
                Monitoring 24 employees • 0 claims in 24 months • Premium optimized with 0.92 modifier
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-orange-900 dark:text-orange-100 mb-1">
              ${workersCompData.savingsToDate.toLocaleString()}
            </div>
            <div className="text-sm text-orange-700 dark:text-orange-300">Annual Savings</div>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
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
                  <p className="text-sm font-medium text-muted-foreground">Annual Premium</p>
                  <p className="text-2xl font-bold">${workersCompData.totalPremium.toLocaleString()}</p>
                  <p className="text-xs text-green-600">{((1 - workersCompData.currentRate / workersCompData.industryAverage) * 100).toFixed(0)}% below industry avg</p>
                </div>
                <DollarSign className="h-8 w-8 text-muted-foreground" />
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
                  <p className="text-sm font-medium text-muted-foreground">Experience Modifier</p>
                  <p className="text-2xl font-bold text-green-600">{workersCompData.experienceModifier}</p>
                  <p className="text-xs text-green-600">8% discount applied</p>
                </div>
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
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
                  <p className="text-sm font-medium text-muted-foreground">Claims History</p>
                  <p className="text-2xl font-bold text-green-600">{workersCompData.claims}</p>
                  <p className="text-xs text-muted-foreground">Past 24 months</p>
                </div>
                <CheckCircle className="h-8 w-8 text-muted-foreground" />
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
                  <p className="text-sm font-medium text-muted-foreground">Current Rate</p>
                  <p className="text-2xl font-bold text-payroll-primary">{(workersCompData.currentRate * 100).toFixed(2)}%</p>
                  <p className="text-xs text-muted-foreground">Per $100 payroll</p>
                </div>
                <Calculator className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Coverage Overview</TabsTrigger>
          <TabsTrigger value="payroll">Payroll Breakdown</TabsTrigger>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
          <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-5 w-5 text-green-600" />
                  Policy Summary
                </CardTitle>
                <CardDescription>
                  Current workers' compensation coverage details'
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Policy Status</span>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      {workersCompData.policyStatus}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Annual Payroll</span>
                    <span className="font-semibold">${workersCompData.actualPayroll.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Experience Modifier</span>
                    <span className="font-semibold text-green-600">{workersCompData.experienceModifier}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Current Rate</span>
                    <span className="font-semibold">${workersCompData.currentRate.toFixed(3)} per $100</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Monthly Premium</span>
                    <span className="font-semibold text-payroll-primary">${workersCompData.monthlyEstimate}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Premium Comparison
                </CardTitle>
                <CardDescription>
                  Your rates vs industry average
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Your Rate</span>
                      <span className="font-medium">{(workersCompData.currentRate * 100).toFixed(2)}%</span>
                    </div>
                    <Progress value={(workersCompData.currentRate / workersCompData.industryAverage) * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Industry Average</span>
                      <span className="font-medium">{(workersCompData.industryAverage * 100).toFixed(2)}%</span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                  <Alert>
                    <TrendingUp className="h-4 w-4" />
                    <AlertDescription>
                      You're paying <strong>{((1 - workersCompData.currentRate / workersCompData.industryAverage) * 100).toFixed(0)}% less</strong> than '
                      the industry average, saving approximately <strong>${workersCompData.savingsToDate.toLocaleString()}</strong> annually.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Pay-As-You-Go Benefits</CardTitle>
              <CardDescription>
                Advantages of real-time premium adjustments based on actual payroll
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950/20">
                  <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <h4 className="font-semibold mb-2">No Large Deposits</h4>
                  <p className="text-sm text-muted-foreground">Pay based on actual payroll, not estimates</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <h4 className="font-semibold mb-2">Real-Time Adjustments</h4>
                  <p className="text-sm text-muted-foreground">Premiums adjust automatically with payroll changes</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                  <Zap className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <h4 className="font-semibold mb-2">AI Optimization</h4>
                  <p className="text-sm text-muted-foreground">Continuous monitoring and rate optimization</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Employee Premium Breakdown</h3>
              <p className="text-sm text-muted-foreground">Current month premium allocation by employee and class code</p>
            </div>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Current Month</SelectItem>
                <SelectItem value="last">Last Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Class Code</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Monthly Payroll</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Premium</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrollBreakdown.map((employee, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{employee.employee}</TableCell>
                      <TableCell>{employee.classCode}</TableCell>
                      <TableCell>{employee.description}</TableCell>
                      <TableCell>${employee.payroll.toLocaleString()}</TableCell>
                      <TableCell>{(employee.rate * 100).toFixed(2)}%</TableCell>
                      <TableCell className="font-semibold">${employee.premium}</TableCell>
                      <TableCell>
                        <Badge variant={
                          employee.riskLevel === "low" ? "default" :
                          employee.riskLevel === "medium" ? "secondary" : "destructive"
                        }>
                          {employee.riskLevel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Alert>
            <Brain className="h-4 w-4" />
            <AlertDescription>
              <strong>AI Analysis:</strong> Class codes are automatically assigned based on job descriptions. 
              AI monitoring detects when employees' roles change and suggests class code updates to optimize rates.'
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                Payment History
              </CardTitle>
              <CardDescription>
                Monthly premium payments with real-time payroll adjustments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Payroll</TableHead>
                    <TableHead>Base Premium</TableHead>
                    <TableHead>Adjustment</TableHead>
                    <TableHead>Final Premium</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlyPayments.map((payment, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{payment.month}</TableCell>
                      <TableCell>${payment.payroll.toLocaleString()}</TableCell>
                      <TableCell>${payment.premium}</TableCell>
                      <TableCell className={payment.adjustment >= 0 ? "text-red-600" : "text-green-600"}>
                        {payment.adjustment >= 0 ? "+" : ""}${payment.adjustment}
                      </TableCell>
                      <TableCell className="font-semibold">${payment.finalPremium}</TableCell>
                      <TableCell>
                        <Badge variant={
                          payment.status === "paid" ? "default" :
                          payment.status === "processing" ? "secondary" : "outline"
                        }>
                          {payment.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    ${monthlyPayments.reduce((sum, p) => sum + p.finalPremium, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Paid YTD</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    ${monthlyPayments.reduce((sum, p) => sum + Math.abs(p.adjustment), 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Adjustments</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    ${(monthlyPayments.reduce((sum, p) => sum + p.finalPremium, 0) / monthlyPayments.length).toFixed(0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Monthly Premium</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600 mb-1">
                    {((monthlyPayments.filter(p => p.adjustment < 0).length / monthlyPayments.length) * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Months with Discounts</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-6">
          <div className="grid gap-4">
            {riskAssessment.map((assessment, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className={`p-2 rounded-full ${
                            assessment.status === "excellent" 
                              ? "bg-green-100 dark:bg-green-900/20" 
                              : assessment.status === "good"
                              ? "bg-blue-100 dark:bg-blue-900/20"
                              : "bg-orange-100 dark:bg-orange-900/20"
                          }'}>
                            {assessment.status === "excellent" ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : assessment.status === "good" ? (
                              <Target className="h-5 w-5 text-blue-600" />
                            ) : (
                              <AlertTriangle className="h-5 w-5 text-orange-600" />
                            )}
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold">{assessment.category}</h4>
                            <Badge variant={
                              assessment.status === "excellent" ? "default" : 
                              assessment.status === "good" ? "secondary" : "outline"
                            }>
                              {assessment.status}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Risk Score</span>
                            <span className="font-semibold">{assessment.score}/100</span>
                          </div>
                          <Progress value={assessment.score} className="h-2" />
                        </div>

                        <div className="mb-4">
                          <label className="text-sm font-medium text-muted-foreground mb-2 block">Contributing Factors</label>
                          <div className="flex flex-wrap gap-2">
                            {assessment.factors.map((factor, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {factor}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <Alert>
                          <Brain className="h-4 w-4" />
                          <AlertDescription>
                            <strong>AI Recommendation:</strong> {assessment.aiRecommendation}
                          </AlertDescription>
                        </Alert>
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
                        insight.type === "cost-optimization" 
                          ? "bg-green-100 dark:bg-green-900/20" 
                          : insight.type === "risk-management"
                          ? "bg-blue-100 dark:bg-blue-900/20"
                          : "bg-purple-100 dark:bg-purple-900/20"
                      }'}>
                        {insight.type === "cost-optimization" ? (
                          <DollarSign className="h-4 w-4 text-green-600" />
                        ) : insight.type === "risk-management" ? (
                          <Shield className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Building2 className="h-4 w-4 text-purple-600" />
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
                          <div className="text-sm font-medium text-green-600">
                            Potential Savings: {insight.savings}
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">Learn More</Button>
                            <Button size="sm">Apply Recommendation</Button>
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
      </Tabs>
    </div>
  );
}