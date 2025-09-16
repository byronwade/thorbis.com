"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';

import { Label } from '@/components/ui/label';

import { Badge } from '@/components/ui/badge';
import {
  Alert,
  AlertDescription
} from '@/components/ui/alert';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';

import { Checkbox } from '@/components/ui/checkbox';
// Slider component inline since it's not available in UI package'
const Slider = ({ value, onValueChange, max, min, step, className }: {
  value: number[];
  onValueChange: (value: number[]) => void;
  max: number;
  min: number;
  step: number;
  className?: string;
}) => (
  <input
    type="range"
    min={min}
    max={max}
    step={step}
    value={value[0]}
    onChange={(e) => onValueChange([parseInt(e.target.value)])}
    className={'w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 ${className}'}
  />
);
import { 
  PiggyBank, 
  TrendingUp, 
  Target, 
  DollarSign, 
  Calculator, 
  Brain, 
  Zap, 
  Award, 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  FileText, 
  BarChart3, 
  PieChart, 
  Settings, 
  Plus, 
  Minus, 
  Eye, 
  Download, 
  ExternalLink,
  Building2,
  Users,
  Star,
  HelpCircle,
  Lightbulb,
  ArrowRight,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';


// Mock retirement data
const employeeProfile = {
  age: 32,
  salary: 125000,
  yearsToRetirement: 33,
  currentContribution: 8, // percentage
  currentBalance: 45670,
  employerMatch: 6, // percentage
  vestingSchedule: "Immediate",
  hireDate: "2022-03-15"
};

const retirementGoals = {
  targetRetirementAge: 65,
  desiredAnnualIncome: 100000,
  estimatedRetirementNeeds: 2500000,
  currentTrajectory: 1890000,
  shortfall: 610000,
  monthsAhead: 8 // if on track, negative if behind
};

const investmentOptions = [
  {
    id: "target-date-2055",
    name: "Target Date 2055 Fund",
    type: "Target Date",
    riskLevel: "Moderate",
    expenseRatio: 0.15,
    returnRate: 7.2,
    allocation: {
      stocks: 90,
      bonds: 10,
      international: 35,
      domestic: 65
    },
    description: "Automatically adjusts allocation as you approach retirement",
    minInvestment: 0,
    aiScore: 95,
    enrolled: 2847,
    performance: {
      "1year": 12.4,
      "3year": 8.9,
      "5year": 7.8,
      "10year": 9.1
    },
    fees: 0.15
  },
  {
    id: "sp500-index",
    name: "S&P 500 Index Fund",
    type: "Large Cap Equity",
    riskLevel: "Moderate-High",
    expenseRatio: 0.03,
    returnRate: 8.1,
    allocation: {
      stocks: 100,
      bonds: 0,
      international: 0,
      domestic: 100
    },
    description: "Tracks the performance of the S&P 500 index",
    minInvestment: 0,
    aiScore: 88,
    enrolled: 1923,
    performance: {
      "1year": 15.2,
      "3year": 10.7,
      "5year": 9.4,
      "10year": 10.2
    },
    fees: 0.03
  },
  {
    id: "total-market",
    name: "Total Stock Market Index",
    type: "Broad Market",
    riskLevel: "Moderate-High",
    expenseRatio: 0.04,
    returnRate: 7.9,
    allocation: {
      stocks: 100,
      bonds: 0,
      international: 0,
      domestic: 100
    },
    description: "Diversified across entire U.S. stock market",
    minInvestment: 0,
    aiScore: 86,
    enrolled: 1567,
    performance: {
      "1year": 14.8,
      "3year": 10.2,
      "5year": 9.1,
      "10year": 9.8
    },
    fees: 0.04
  },
  {
    id: "international-index",
    name: "International Index Fund",
    type: "International Equity",
    riskLevel: "Moderate-High",
    expenseRatio: 0.08,
    returnRate: 6.8,
    allocation: {
      stocks: 100,
      bonds: 0,
      international: 100,
      domestic: 0
    },
    description: "Exposure to international developed markets",
    minInvestment: 0,
    aiScore: 78,
    enrolled: 892,
    performance: {
      "1year": 8.9,
      "3year": 6.4,
      "5year": 5.8,
      "10year": 6.2
    },
    fees: 0.08
  },
  {
    id: "bond-index",
    name: "Total Bond Market Index",
    type: "Fixed Income",
    riskLevel: "Conservative",
    expenseRatio: 0.05,
    returnRate: 3.2,
    allocation: {
      stocks: 0,
      bonds: 100,
      international: 15,
      domestic: 85
    },
    description: "Broad exposure to U.S. bond market",
    minInvestment: 0,
    aiScore: 72,
    enrolled: 734,
    performance: {
      "1year": -2.1,
      "3year": 1.8,
      "5year": 2.4,
      "10year": 3.1
    },
    fees: 0.05
  },
  {
    id: "stable-value",
    name: "Stable Value Fund",
    type: "Stable Value",
    riskLevel: "Conservative",
    expenseRatio: 0.85,
    returnRate: 2.8,
    allocation: {
      stocks: 0,
      bonds: 0,
      stableValue: 100,
      international: 0,
      domestic: 100
    },
    description: "Principal protection with steady returns",
    minInvestment: 0,
    aiScore: 65,
    enrolled: 456,
    performance: {
      "1year": 2.9,
      "3year": 2.7,
      "5year": 2.8,
      "10year": 3.2
    },
    fees: 0.85
  }
];

const aiInsights = [
  {
    type: "optimization",
    title: "Contribution Opportunity",
    description: "Increase contribution to 12% to maximize employer match and boost retirement savings by $487,000",
    priority: "high",
    impact: "$487,000 by retirement",
    currentValue: "8%",
    recommendedValue: "12%",
    monthlyIncrease: "$416"
  },
  {
    type: "allocation",
    title: "Portfolio Rebalancing",
    description: "Your current allocation is too conservative for your age. Consider 90% stocks for better long-term growth",
    priority: "medium",
    impact: "$156,000 additional growth",
    currentAllocation: "70% stocks, 30% bonds",
    recommendedAllocation: "90% stocks, 10% bonds"
  },
  {
    type: "fees",
    title: "Fee Optimization",
    description: "Switch to lower-cost index funds could save $47,000 in fees over your career",
    priority: "medium",
    impact: "$47,000 in fee savings",
    currentFees: "0.65% average",
    recommendedFees: "0.15% average"
  },
  {
    type: "timeline",
    title: "Retirement Timeline Analysis",
    description: "At current contribution rate, you're on track to retire 2 years early with your target income",'
    priority: "low",
    impact: "2 years early retirement",
    projectedBalance: "$2,680,000",
    targetBalance: "$2,500,000"
  }
];

const currentAllocations = [
  { fund: "Target Date 2055 Fund", percentage: 60, amount: 27402 },
  { fund: "S&P 500 Index Fund", percentage: 25, amount: 11417.50 },
  { fund: "International Index Fund", percentage: 10, amount: 4567 },
  { fund: "Bond Index Fund", percentage: 5, amount: 2283.50 }
];

const contributionHistory = [
  { year: 2024, employee: 10000, employer: 7500, total: 17500, balance: 45670 },
  { year: 2023, employee: 9600, employer: 7200, total: 16800, balance: 38420 },
  { year: 2022, employee: 4800, employer: 3600, total: 8400, balance: 24150 },
];

export function RetirementPlans() {
  const [contributionPercentage, setContributionPercentage] = useState([employeeProfile.currentContribution]);
  const [selectedFund, setSelectedFund] = useState<string | null>(null);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showRebalancing, setShowRebalancing] = useState(false);
  const [retirementAge, setRetirementAge] = useState([retirementGoals.targetRetirementAge]);
  const [targetIncome, setTargetIncome] = useState([retirementGoals.desiredAnnualIncome]);

  const projectedBalance = useMemo(() => {
    const contribution = contributionPercentage[0];
    const annualContribution = (employeeProfile.salary * contribution / 100) + 
                              (employeeProfile.salary * Math.min(contribution, employeeProfile.employerMatch) / 100);
    const years = retirementAge[0] - employeeProfile.age;
    const futureValue = employeeProfile.currentBalance * Math.pow(1.072, years) + 
                       (annualContribution * (Math.pow(1.072, years) - 1) / 0.072);
    return futureValue;
  }, [contributionPercentage, retirementAge]);

  const monthlyContribution = useMemo(() => {
    return (employeeProfile.salary * contributionPercentage[0] / 100) / 12;
  }, [contributionPercentage]);

  const employerMatch = useMemo(() => {
    const matchRate = Math.min(contributionPercentage[0], employeeProfile.employerMatch);
    return (employeeProfile.salary * matchRate / 100) / 12;
  }, [contributionPercentage]);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Conservative": return "text-green-600 bg-green-100 dark:bg-green-900/20";
      case "Moderate": return "text-blue-600 bg-blue-100 dark:bg-blue-900/20";
      case "Moderate-High": return "text-orange-600 bg-orange-100 dark:bg-orange-900/20";
      case "High": return "text-red-600 bg-red-100 dark:bg-red-900/20";
      default: return "text-gray-600 bg-gray-100 dark:bg-gray-900/20";
    }
  };

  const getPerformanceColor = (performance: number) => {
    if (performance > 8) return "text-green-600";
    if (performance > 5) return "text-blue-600";
    if (performance > 0) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Retirement Plans</h1>
          <p className="text-muted-foreground mt-2">
            AI-powered 401(k) management with smart allocation recommendations and contribution optimization
          </p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={showCalculator} onOpenChange={setShowCalculator}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Calculator className="mr-2 h-4 w-4" />
                Retirement Calculator
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Retirement Planning Calculator</DialogTitle>
                <DialogDescription>
                  Adjust your contributions and see the impact on your retirement savings
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div>
                  <Label>Contribution Percentage: {contributionPercentage[0]}%</Label>
                  <Slider
                    value={contributionPercentage}
                    onValueChange={setContributionPercentage}
                    max={25}
                    min={1}
                    step={1}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label>Retirement Age: {retirementAge[0]}</Label>
                  <Slider
                    value={retirementAge}
                    onValueChange={setRetirementAge}
                    max={70}
                    min={60}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <div className="text-sm text-muted-foreground">Monthly Contribution</div>
                    <div className="text-lg font-bold">{formatCurrency(monthlyContribution)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Employer Match</div>
                    <div className="text-lg font-bold">{formatCurrency(employerMatch)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Projected Balance at {retirementAge[0]}</div>
                    <div className="text-xl font-bold text-payroll-primary">{formatCurrency(projectedBalance)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Monthly Retirement Income</div>
                    <div className="text-lg font-bold">{formatCurrency(projectedBalance * 0.04 / 12)}</div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button className="bg-gradient-to-r from-payroll-primary to-payroll-secondary">
            <Settings className="mr-2 h-4 w-4" />
            Update Plan
          </Button>
        </div>
      </div>

      {/* AI Retirement Intelligence Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 rounded-lg p-6 border border-amber-200 dark:border-amber-800"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/30">
              <Brain className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-900 dark:text-amber-100">AI Retirement Intelligence</h3>
              <p className="text-amber-700 dark:text-amber-300 text-sm">
                Optimized contributions • Smart rebalancing • Fee minimization • Goal tracking
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-amber-900 dark:text-amber-100 mb-1">
              {formatCurrency(employeeProfile.currentBalance)}
            </div>
            <div className="text-sm text-amber-700 dark:text-amber-300">Current Balance</div>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
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
                  <p className="text-sm font-medium text-muted-foreground">Current Balance</p>
                  <p className="text-2xl font-bold">{formatCurrency(employeeProfile.currentBalance)}</p>
                  <p className="text-xs text-green-600">+12.4% this year</p>
                </div>
                <PiggyBank className="h-8 w-8 text-muted-foreground" />
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
                  <p className="text-sm font-medium text-muted-foreground">Monthly Contribution</p>
                  <p className="text-2xl font-bold">{formatCurrency(monthlyContribution)}</p>
                  <p className="text-xs text-blue-600">{contributionPercentage[0]}% of salary</p>
                </div>
                <DollarSign className="h-8 w-8 text-muted-foreground" />
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
                  <p className="text-sm font-medium text-muted-foreground">Employer Match</p>
                  <p className="text-2xl font-bold">{formatCurrency(employerMatch)}</p>
                  <p className="text-xs text-green-600">Free money!</p>
                </div>
                <Award className="h-8 w-8 text-muted-foreground" />
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
                  <p className="text-sm font-medium text-muted-foreground">Projected at 65</p>
                  <p className="text-2xl font-bold">{formatCurrency(retirementGoals.currentTrajectory)}</p>
                  <p className="text-xs text-orange-600">{retirementGoals.monthsAhead} months ahead</p>
                </div>
                <Target className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="investments">Investments</TabsTrigger>
          <TabsTrigger value="contributions">Contributions</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="planning">Planning</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Current Allocation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="mr-2 h-5 w-5" />
                  Current Portfolio Allocation
                </CardTitle>
                <CardDescription>
                  Your current 401(k) investment distribution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentAllocations.map((allocation, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{allocation.fund}</span>
                        <div className="text-right">
                          <div className="font-semibold">{allocation.percentage}%</div>
                          <div className="text-muted-foreground text-xs">
                            {formatCurrency(allocation.amount)}
                          </div>
                        </div>
                      </div>
                      <Progress value={allocation.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-4 border-t">
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => setShowRebalancing(true)}
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Rebalance Portfolio
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Retirement Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="mr-2 h-5 w-5" />
                  Retirement Progress
                </CardTitle>
                <CardDescription>
                  How you're tracking toward your retirement goals'
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Progress to Retirement Goal</span>
                      <span className="text-sm text-muted-foreground">
                        {Math.round((retirementGoals.currentTrajectory / retirementGoals.estimatedRetirementNeeds) * 100)}%
                      </span>
                    </div>
                    <Progress value={75.6} className="h-3 mb-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{formatCurrency(employeeProfile.currentBalance)}</span>
                      <span>{formatCurrency(retirementGoals.estimatedRetirementNeeds)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">
                        {employeeProfile.yearsToRetirement}
                      </div>
                      <div className="text-sm text-muted-foreground">Years to Go</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-lg font-bold text-payroll-primary">
                        {formatCurrency(retirementGoals.desiredAnnualIncome)}
                      </div>
                      <div className="text-sm text-muted-foreground">Target Income</div>
                    </div>
                  </div>

                  <Alert>
                    <TrendingUp className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Great progress!</strong> You're currently on track to exceed your retirement goal `
                      by {formatCurrency(retirementGoals.currentTrajectory - retirementGoals.estimatedRetirementNeeds)}.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contribution History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5" />
                Contribution History
              </CardTitle>
              <CardDescription>
                Your annual contribution history and account growth
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Year</th>
                      <th className="text-center py-3 px-4">Employee Contribution</th>
                      <th className="text-center py-3 px-4">Employer Match</th>
                      <th className="text-center py-3 px-4">Total Contribution</th>
                      <th className="text-center py-3 px-4">Year-End Balance</th>
                      <th className="text-center py-3 px-4">Growth</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contributionHistory.map((year, index) => (
                      <tr key={year.year} className="border-b">
                        <td className="py-3 px-4 font-medium">{year.year}</td>
                        <td className="text-center py-3 px-4">{formatCurrency(year.employee)}</td>
                        <td className="text-center py-3 px-4">{formatCurrency(year.employer)}</td>
                        <td className="text-center py-3 px-4">{formatCurrency(year.total)}</td>
                        <td className="text-center py-3 px-4 font-semibold">{formatCurrency(year.balance)}</td>
                        <td className="text-center py-3 px-4">
                          {index > 0 && (
                            <span className="text-green-600 font-medium">
                              +{(((year.balance - contributionHistory[index - 1].balance) / contributionHistory[index - 1].balance) * 100).toFixed(1)}%
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="investments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="mr-2 h-5 w-5" />
                Available Investment Options
              </CardTitle>
              <CardDescription>
                Choose from our curated selection of low-cost investment funds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {investmentOptions.map((fund, index) => (
                  <motion.div
                    key={fund.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className={`p-6 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      selectedFund === fund.id ? "border-payroll-primary bg-payroll-primary/5" : ""
                    }`}
                    onClick={() => setSelectedFund(selectedFund === fund.id ? null : fund.id)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold">{fund.name}</h3>
                          <Badge variant="outline">{fund.type}</Badge>
                          <Badge className={getRiskColor(fund.riskLevel)}>
                            {fund.riskLevel}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">
                          {fund.description}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-sm">
                          <div>
                            <span className="font-medium">Expense Ratio:</span>
                            <span className="ml-1">{fund.expenseRatio}%</span>
                          </div>
                          <div>
                            <span className="font-medium">Expected Return:</span>
                            <span className="ml-1">{fund.returnRate}%</span>
                          </div>
                          <div>
                            <span className="font-medium">Enrolled:</span>
                            <span className="ml-1">{fund.enrolled.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <Badge className="mb-2">
                          <Brain className="mr-1 h-2 w-2" />
                          AI Score: {fund.aiScore}
                        </Badge>
                        <div className="text-2xl font-bold text-payroll-primary">
                          {fund.performance["1year"] > 0 ? "+" : ""}{fund.performance["1year"]}%
                        </div>
                        <div className="text-sm text-muted-foreground">1-Year Return</div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {selectedFund === fund.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border-t pt-4 space-y-4"
                        >
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <div className="text-sm font-medium text-muted-foreground">1 Year</div>
                              <div className={`text-lg font-bold ${getPerformanceColor(fund.performance["1year"])}`}>
                                {fund.performance["1year"] > 0 ? "+" : ""}{fund.performance["1year"]}%
                              </div>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-muted-foreground">3 Year</div>
                              <div className={`text-lg font-bold ${getPerformanceColor(fund.performance["3year"])}`}>
                                {fund.performance["3year"] > 0 ? "+" : ""}{fund.performance["3year"]}%
                              </div>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-muted-foreground">5 Year</div>
                              <div className={`text-lg font-bold ${getPerformanceColor(fund.performance["5year"])}`}>
                                {fund.performance["5year"] > 0 ? "+" : ""}{fund.performance["5year"]}%
                              </div>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-muted-foreground">10 Year</div>
                              <div className={`text-lg font-bold ${getPerformanceColor(fund.performance["10year"])}'}>
                                {fund.performance["10year"] > 0 ? "+" : ""}{fund.performance["10year"]}%
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold mb-2">Asset Allocation</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="flex justify-between">
                                <span>Stocks:</span>
                                <span>{fund.allocation.stocks || 0}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Bonds:</span>
                                <span>{fund.allocation.bonds || 0}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span>International:</span>
                                <span>{fund.allocation.international || 0}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Domestic:</span>
                                <span>{fund.allocation.domestic || 0}%</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contributions" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Contribution Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="mr-2 h-5 w-5" />
                  Contribution Settings
                </CardTitle>
                <CardDescription>
                  Adjust your 401(k) contribution amount
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <Label className="flex items-center justify-between">
                      <span>Contribution Percentage</span>
                      <span className="font-bold">{contributionPercentage[0]}%</span>
                    </Label>
                    <Slider
                      value={contributionPercentage}
                      onValueChange={setContributionPercentage}
                      max={25}
                      min={1}
                      step={1}
                      className="mt-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>1%</span>
                      <span>25%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div>
                      <div className="text-sm text-muted-foreground">Your Contribution</div>
                      <div className="text-lg font-bold">{formatCurrency(monthlyContribution)}/month</div>
                      <div className="text-xs text-muted-foreground">
                        {formatCurrency(monthlyContribution * 12)}/year
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Employer Match</div>
                      <div className="text-lg font-bold text-green-600">{formatCurrency(employerMatch)}/month</div>
                      <div className="text-xs text-muted-foreground">
                        {formatCurrency(employerMatch * 12)}/year
                      </div>
                    </div>
                  </div>

                  {contributionPercentage[0] < employeeProfile.employerMatch && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Missing free money!</strong> Increase to {employeeProfile.employerMatch}% 
                        to get the full employer match of {formatCurrency((employeeProfile.salary * employeeProfile.employerMatch / 100) / 12)}/month.
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button className="w-full">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Update Contribution
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Vesting Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  Vesting Schedule
                </CardTitle>
                <CardDescription>
                  Your employer match vesting information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-6 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                      Fully Vested
                    </h3>
                    <p className="text-green-700 dark:text-green-300 text-sm mt-1">
                      100% of employer contributions are immediately vested
                    </p>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>Vesting Schedule:</span>
                      <span className="font-medium">{employeeProfile.vestingSchedule}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Hire Date:</span>
                      <span className="font-medium">{formatDate(employeeProfile.hireDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Years of Service:</span>
                      <span className="font-medium">
                        {Math.floor((new Date().getTime() - new Date(employeeProfile.hireDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years
                      </span>
                    </div>
                  </div>

                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      All employer contributions are yours to keep, regardless of when you leave the company.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
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
                        insight.type === "optimization" 
                          ? "bg-blue-100 dark:bg-blue-900/20" 
                          : insight.type === "allocation"
                          ? "bg-purple-100 dark:bg-purple-900/20"
                          : insight.type === "fees"
                          ? "bg-green-100 dark:bg-green-900/20"
                          : "bg-orange-100 dark:bg-orange-900/20"
                      }'}>
                        {insight.type === "optimization" ? (
                          <Zap className="h-4 w-4 text-blue-600" />
                        ) : insight.type === "allocation" ? (
                          <PieChart className="h-4 w-4 text-purple-600" />
                        ) : insight.type === "fees" ? (
                          <DollarSign className="h-4 w-4 text-green-600" />
                        ) : (
                          <Clock className="h-4 w-4 text-orange-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{insight.title}</h4>
                          <Badge variant={
                            insight.priority === "high" ? "default" : 
                            insight.priority === "medium" ? "secondary" : "outline"
                          }>
                            {insight.priority} priority
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          {insight.description}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <h5 className="font-medium text-sm mb-1">Impact</h5>
                            <p className="text-lg font-bold text-green-600">{insight.impact}</p>
                          </div>
                          <div>
                            <h5 className="font-medium text-sm mb-1">
                              {insight.type === "optimization" ? "Monthly Increase" :
                               insight.type === "allocation" ? "Current vs Recommended" :
                               insight.type === "fees" ? "Fee Comparison" : "Timeline"}
                            </h5>
                            <div className="text-sm">
                              {"monthlyIncrease" in insight && (
                                <p className="font-medium">{insight.monthlyIncrease}</p>
                              )}
                              {"currentAllocation" in insight && (
                                <>
                                  <p className="text-muted-foreground">Current: {insight.currentAllocation}</p>
                                  <p className="font-medium">Recommended: {insight.recommendedAllocation}</p>
                                </>
                              )}
                              {"currentFees" in insight && (
                                <>
                                  <p className="text-muted-foreground">Current: {insight.currentFees}</p>
                                  <p className="font-medium">Optimized: {insight.recommendedFees}</p>
                                </>
                              )}
                              {"projectedBalance" in insight && (
                                <p className="font-medium">{formatCurrency(insight.projectedBalance)}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button size="sm" variant="outline">
                            <Lightbulb className="mr-2 h-3 w-3" />
                            Learn More
                          </Button>
                          <Button size="sm">
                            <ArrowRight className="mr-2 h-3 w-3" />
                            Apply Suggestion
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

        <TabsContent value="planning" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="mr-2 h-5 w-5" />
                Retirement Planning Scenarios
              </CardTitle>
              <CardDescription>
                Explore different scenarios and their impact on your retirement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Advanced Planning Tools</h3>
                <p className="text-muted-foreground mb-4">
                  Model different contribution strategies, retirement ages, and market scenarios
                </p>
                <Button>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open Planning Tool
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}