"use client";

import React, { useState } from "react";

import {
  Brain,
  DollarSign,
  TrendingUp,
  Calculator,
  FileText,
  Calendar,
  PiggyBank,
  Shield,
  Zap,
  Target,
  Award,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  Star,
  Plus,
  Eye,
  Settings,
  Download,
  Upload,
  Send,
  Briefcase,
  Home,
  CreditCard,
  Receipt,
  Percent,
  Building2,
  Lightbulb,
  Rocket,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  BarChart3,
  LineChart,
  Users,
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
const soloStats = {
  monthlyRevenue: 12500,
  yearlyRevenue: 145000,
  taxesSaved: 18400,
  deductionsFound: 47,
  quarterlyTaxes: 3200,
  retirementSaved: 24000,
  effectiveTaxRate: 14.2,
  aiOptimizationSavings: 31200
};

const taxOptimizations = [
  {
    id: "home-office",
    category: "Home Office Deduction",
    description: "Dedicated workspace in primary residence",
    potentialSavings: 3600,
    confidence: 96.8,
    status: "active",
    documentation: ["Floor plan", "Utility bills", "Photos"],
    aiRecommendation: "Maximize square footage allocation for highest deduction",
    requirements: "Exclusive business use required",
    riskLevel: "low"
  },
  {
    id: "business-meals",
    category: "Business Meal Deductions",
    description: "AI-categorized business meals and entertainment",
    potentialSavings: 2800,
    confidence: 89.4,
    status: "active",
    documentation: ["Receipts", "Meeting notes", "Attendee list"],
    aiRecommendation: "Track all client meetings and business discussions",
    requirements: "Business purpose required",
    riskLevel: "medium"
  },
  {
    id: "equipment-depreciation",
    category: "Equipment Depreciation",
    description: "Business equipment and technology depreciation",
    potentialSavings: 4200,
    confidence: 98.1,
    status: "active",
    documentation: ["Purchase receipts", "Business use percentage"],
    aiRecommendation: "Consider Section 179 immediate expensing",
    requirements: "Business use >50%",
    riskLevel: "low"
  },
  {
    id: "professional-development",
    category: "Professional Development",
    description: "Courses, conferences, and skills training",
    potentialSavings: 1800,
    confidence: 92.3,
    status: "pending",
    documentation: ["Course certificates", "Conference tickets"],
    aiRecommendation: "Track all skill-building activities",
    requirements: "Directly related to business",
    riskLevel: "low"
  },
  {
    id: "vehicle-expenses",
    category: "Vehicle Business Use",
    description: "Business miles and vehicle expenses",
    potentialSavings: 5400,
    confidence: 87.6,
    status: "incomplete",
    documentation: ["Mileage log", "Gas receipts", "Maintenance records"],
    aiRecommendation: "Enable automatic mileage tracking",
    requirements: "Detailed mileage log required",
    riskLevel: "medium"
  }
];

const quarterlyTaxPlanning = {
  q1: {
    due: "2024-04-15",
    estimated: 3200,
    paid: 3200,
    status: "paid",
    penalties: 0
  },
  q2: {
    due: "2024-06-17",
    estimated: 3400,
    paid: 0,
    status: "pending",
    penalties: 0
  },
  q3: {
    due: "2024-09-16",
    estimated: 3600,
    paid: 0,
    status: "calculated",
    penalties: 0
  },
  q4: {
    due: "2024-01-15",
    estimated: 3800,
    paid: 0,
    status: "projected",
    penalties: 0
  }
};

const businessExpenseCategories = [
  {
    category: "Office Expenses",
    monthlyBudget: 400,
    spent: 342,
    transactions: 12,
    topDeduction: "Software subscriptions",
    aiOptimization: "15% potential savings identified"
  },
  {
    category: "Professional Services",
    monthlyBudget: 800,
    spent: 650,
    transactions: 6,
    topDeduction: "Legal consultations",
    aiOptimization: "Consider bundling services"
  },
  {
    category: "Marketing & Advertising",
    monthlyBudget: 600,
    spent: 780,
    transactions: 18,
    topDeduction: "Digital advertising",
    aiOptimization: "ROI tracking recommended"
  },
  {
    category: "Travel & Transportation",
    monthlyBudget: 300,
    spent: 245,
    transactions: 8,
    topDeduction: "Business mileage",
    aiOptimization: "Enable GPS tracking"
  }
];

const retirementOptions = [
  {
    type: "Solo 401(k)",
    maxContribution: 69000,
    employeeLimit: 23000,
    employerLimit: 46000,
    currentContribution: 24000,
    taxSavings: 8160,
    recommended: true,
    aiInsight: "Maximize both employee and employer contributions"
  },
  {
    type: "SEP-IRA",
    maxContribution: 36250,
    employeeLimit: 0,
    employerLimit: 36250,
    currentContribution: 0,
    taxSavings: 0,
    recommended: false,
    aiInsight: "Less flexible than Solo 401(k) for your income level"
  },
  {
    type: "Traditional IRA",
    maxContribution: 7000,
    employeeLimit: 7000,
    employerLimit: 0,
    currentContribution: 7000,
    taxSavings: 2380,
    recommended: false,
    aiInsight: "Income too high for tax deduction"
  }
];

const aiInsights = [
  {
    type: "tax-optimization",
    title: "Quarterly Tax Underpayment Risk",
    description: "Based on Q1 revenue growth, Q2 estimated taxes should increase by $600 to avoid penalties. AI suggests adjusting payment to $4,000.",
    priority: "high",
    potentialSavings: 150,
    confidence: 94.2,
    action: "Adjust Q2 payment"
  },
  {
    type: "deduction-opportunity",
    title: "Missed Home Office Square Footage",
    description: "Analysis suggests you could claim additional 80 sq ft of home office space based on floor plan. Potential $800 annual savings.",
    priority: "medium",
    potentialSavings: 800,
    confidence: 87.6,
    action: "Update home office calculation"
  },
  {
    type: "retirement-optimization",
    title: "Solo 401(k) Contribution Gap",
    description: "You can contribute an additional $45,000 to your Solo 401(k) this year, saving $15,300 in taxes.",
    priority: "high",
    potentialSavings: 15300,
    confidence: 99.1,
    action: "Increase retirement contributions"
  },
  {
    type: "expense-categorization",
    title: "Business Meal Classification",
    description: "12 expenses totaling $840 could be reclassified as business meals instead of general expenses, improving deduction rate from 50% to 100%.",
    priority: "medium",
    potentialSavings: 420,
    confidence: 91.8,
    action: "Reclassify meal expenses"
  }
];

export function SoloDashboard() {
  const [selectedQuarter, setSelectedQuarter] = useState("q2");
  const [expenseCategory, setExpenseCategory] = useState("all");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Rocket className="mr-3 h-8 w-8 text-payroll-primary" />
            Thorbis Solo
          </h1>
          <p className="text-muted-foreground mt-2">
            AI-powered tax optimization and business management for solopreneurs
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Tax Package
          </Button>
          <Button className="bg-gradient-to-r from-payroll-primary to-payroll-secondary">
            <Calculator className="mr-2 h-4 w-4" />
            Tax Optimizer
          </Button>
        </div>
      </div>

      {/* AI Tax Assistant */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-lg p-6 border border-emerald-200 dark:border-emerald-800"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <Brain className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-emerald-900 dark:text-emerald-100">AI Tax Optimization Engine</h3>
              <p className="text-emerald-700 dark:text-emerald-300 text-sm">
                {soloStats.deductionsFound} deductions found • {soloStats.effectiveTaxRate}% effective rate • ${soloStats.quarterlyTaxes.toLocaleString()} quarterly
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 mb-1">
              ${soloStats.aiOptimizationSavings.toLocaleString()}
            </div>
            <div className="text-sm text-emerald-700 dark:text-emerald-300">Annual AI Tax Savings</div>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Annual Revenue</p>
                <p className="text-2xl font-bold">${soloStats.yearlyRevenue.toLocaleString()}</p>
                <p className="text-xs text-green-600">+23% vs last year</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxes Saved</p>
                <p className="text-2xl font-bold text-green-600">${soloStats.taxesSaved.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Through AI optimization</p>
              </div>
              <Percent className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Effective Tax Rate</p>
                <p className="text-2xl font-bold text-payroll-primary">{soloStats.effectiveTaxRate}%</p>
                <p className="text-xs text-green-600">5.2% below average</p>
              </div>
              <Calculator className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Retirement Savings</p>
                <p className="text-2xl font-bold text-blue-600">${soloStats.retirementSaved.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Solo 401(k) contributions</p>
              </div>
              <PiggyBank className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tax-optimization" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="tax-optimization">Tax Optimization</TabsTrigger>
          <TabsTrigger value="quarterly-taxes">Quarterly Taxes</TabsTrigger>
          <TabsTrigger value="expenses">Business Expenses</TabsTrigger>
          <TabsTrigger value="retirement">Retirement Planning</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="tax-optimization" className="space-y-6">
          <div className="grid gap-4">
            {taxOptimizations.map((optimization, index) => (
              <Card key={optimization.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`p-2 rounded-full ${
                          optimization.status === "active" 
                            ? "bg-green-100 dark:bg-green-900/20" 
                            : optimization.status === "pending"
                            ? "bg-yellow-100 dark:bg-yellow-900/20"
                            : "bg-neutral-100 dark:bg-neutral-900/20"
                        }`}>
                          {optimization.status === "active" ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : optimization.status === "pending" ? (
                            <Clock className="h-5 w-5 text-yellow-600" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-neutral-600" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold">{optimization.category}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant={
                              optimization.status === "active" ? "default" :
                              optimization.status === "pending" ? "secondary" : "outline"
                            }>
                              {optimization.status}
                            </Badge>
                            <Badge variant="outline" className={
                              optimization.riskLevel === "low" ? "text-green-600" :
                              optimization.riskLevel === "medium" ? "text-yellow-600" : "text-red-600"
                            }>
                              {optimization.riskLevel} risk
                            </Badge>
                            <Badge variant="outline" className="text-purple-600">
                              <Brain className="mr-1 h-3 w-3" />
                              {optimization.confidence}% confident
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-4">{optimization.description}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground mb-2 block">Required Documentation</label>
                          <div className="flex flex-wrap gap-2">
                            {optimization.documentation.map((doc, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                <FileText className="mr-1 h-2 w-2" />
                                {doc}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground mb-2 block">Requirements</label>
                          <p className="text-sm">{optimization.requirements}</p>
                        </div>
                      </div>

                      <Alert>
                        <Brain className="h-4 w-4" />
                        <AlertDescription>
                          <strong>AI Recommendation:</strong> {optimization.aiRecommendation}
                        </AlertDescription>
                      </Alert>
                    </div>
                    
                    <div className="text-right ml-6">
                      <div className="mb-4">
                        <div className="text-2xl font-bold text-green-600 mb-1">
                          ${optimization.potentialSavings.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">Annual Savings</div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="mr-2 h-3 w-3" />
                          Details
                        </Button>
                        {optimization.status !== "active" && (
                          <Button size="sm">
                            <Zap className="mr-2 h-3 w-3" />
                            Activate
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

        <TabsContent value="quarterly-taxes" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  2024 Quarterly Tax Schedule
                </CardTitle>
                <CardDescription>
                  AI-calculated estimated tax payments to avoid penalties
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(quarterlyTaxPlanning).map(([quarter, data]) => (
                    <div key={quarter} className="flex items-center justify-between p-4 rounded-lg border border-border">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${
                          data.status === "paid" 
                            ? "bg-green-100 dark:bg-green-900/20" 
                            : data.status === "pending"
                            ? "bg-orange-100 dark:bg-orange-900/20"
                            : "bg-neutral-100 dark:bg-neutral-900/20"
                        }`}>
                          {data.status === "paid" ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : data.status === "pending" ? (
                            <Clock className="h-4 w-4 text-orange-600" />
                          ) : (
                            <Calculator className="h-4 w-4 text-neutral-600" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold">{quarter.toUpperCase()} 2024</h4>
                          <p className="text-sm text-muted-foreground">
                            Due: {new Date(data.due).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">${data.estimated.toLocaleString()}</div>
                        <Badge variant={
                          data.status === "paid" ? "default" :
                          data.status === "pending" ? "secondary" : "outline"
                        }>
                          {data.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Alert className="mt-6">
                  <Brain className="h-4 w-4" />
                  <AlertDescription>
                    <strong>AI Recommendation:</strong> Based on Q1 performance, consider increasing Q2 payment to $4,000 to avoid underpayment penalties.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tax Payment History</CardTitle>
                <CardDescription>
                  Track your quarterly payments and penalties
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950/20">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        ${quarterlyTaxPlanning.q1.paid.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Q1 Paid</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        $0
                      </div>
                      <div className="text-sm text-muted-foreground">Penalties</div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-3">Payment Options</h4>
                    <div className="space-y-2">
                      <Button className="w-full justify-start">
                        <CreditCard className="mr-2 h-4 w-4" />
                        Pay with Bank Account
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Calendar className="mr-2 h-4 w-4" />
                        Schedule Auto-Pay
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-6">
          <div className="grid gap-4">
            {businessExpenseCategories.map((category, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
                          <Receipt className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold">{category.category}</h4>
                          <p className="text-sm text-muted-foreground">{category.transactions} transactions this month</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="text-xs text-muted-foreground">Monthly Budget</label>
                          <p className="text-lg font-semibold">${category.monthlyBudget}</p>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Spent</label>
                          <p className="text-lg font-semibold">${category.spent}</p>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Top Deduction</label>
                          <p className="text-sm font-medium">{category.topDeduction}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">Budget Usage</span>
                          <span className="text-sm text-muted-foreground">
                            {Math.round((category.spent / category.monthlyBudget) * 100)}%
                          </span>
                        </div>
                        <Progress value={(category.spent / category.monthlyBudget) * 100} className="h-2" />
                      </div>

                      <Alert>
                        <Lightbulb className="h-4 w-4" />
                        <AlertDescription>
                          <strong>AI Insight:</strong> {category.aiOptimization}
                        </AlertDescription>
                      </Alert>
                    </div>
                    
                    <div className="text-right ml-6">
                      <div className="mb-4">
                        <div className="text-lg font-bold text-green-600 mb-1">
                          ${category.monthlyBudget - category.spent}
                        </div>
                        <div className="text-sm text-muted-foreground">Remaining Budget</div>
                      </div>
                      
                      <Button size="sm" variant="outline">
                        <Plus className="mr-2 h-3 w-3" />
                        Add Expense
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="retirement" className="space-y-6">
          <div className="grid gap-6">
            {retirementOptions.map((option, index) => (
              <Card key={index} className={`hover:shadow-lg transition-shadow ${
                option.recommended ? "ring-2 ring-payroll-primary" : ""
              }'}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/20">
                          <PiggyBank className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="text-xl font-semibold">{option.type}</h4>
                          {option.recommended && (
                            <Badge variant="default" className="mt-1">
                              <Star className="mr-1 h-3 w-3" />
                              AI Recommended
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <label className="text-xs text-muted-foreground">Max Contribution</label>
                          <p className="text-lg font-bold text-green-600">${option.maxContribution.toLocaleString()}</p>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Current Contribution</label>
                          <p className="text-lg font-semibold">${option.currentContribution.toLocaleString()}</p>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Tax Savings</label>
                          <p className="text-lg font-semibold text-blue-600">${option.taxSavings.toLocaleString()}</p>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Remaining Capacity</label>
                          <p className="text-lg font-semibold">
                            ${(option.maxContribution - option.currentContribution).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">Contribution Progress</span>
                          <span className="text-sm text-muted-foreground">
                            {Math.round((option.currentContribution / option.maxContribution) * 100)}%
                          </span>
                        </div>
                        <Progress value={(option.currentContribution / option.maxContribution) * 100} className="h-2" />
                      </div>

                      <Alert>
                        <Brain className="h-4 w-4" />
                        <AlertDescription>
                          <strong>AI Insight:</strong> {option.aiInsight}
                        </AlertDescription>
                      </Alert>
                    </div>
                    
                    <div className="text-right ml-6">
                      <div className="mb-4">
                        <div className="text-2xl font-bold text-payroll-primary mb-1">
                          {Math.round((option.currentContribution / option.maxContribution) * 100)}%
                        </div>
                        <div className="text-sm text-muted-foreground">Utilized</div>
                      </div>
                      
                      <Button size="sm" disabled={!option.recommended}>
                        <Plus className="mr-2 h-3 w-3" />
                        {option.currentContribution === 0 ? "Start Contributing" : "Increase"}
                      </Button>
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
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={'p-2 rounded-full ${
                      insight.type === "tax-optimization" 
                        ? "bg-red-100 dark:bg-red-900/20" 
                        : insight.type === "deduction-opportunity"
                        ? "bg-green-100 dark:bg-green-900/20"
                        : insight.type === "retirement-optimization"
                        ? "bg-blue-100 dark:bg-blue-900/20"
                        : "bg-purple-100 dark:bg-purple-900/20"
                    }'}>
                      {insight.type === "tax-optimization" ? (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      ) : insight.type === "deduction-opportunity" ? (
                        <DollarSign className="h-4 w-4 text-green-600" />
                      ) : insight.type === "retirement-optimization" ? (
                        <PiggyBank className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Receipt className="h-4 w-4 text-purple-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{insight.title}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge variant={insight.priority === "high" ? "destructive" : "secondary"}>
                            {insight.priority} priority
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
                          Potential Savings: ${insight.potentialSavings.toLocaleString()}
                        </div>
                        <Button size="sm" variant={insight.priority === "high" ? "destructive" : "default"}>
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