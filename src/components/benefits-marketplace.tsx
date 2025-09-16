"use client";

import React, { useState } from "react";
;
import {
  Brain,
  Heart,
  Shield,
  DollarSign,
  Users,
  Star,
  CheckCircle,
  TrendingUp,
  Calendar,
  Phone,
  Clock,
  Zap,
  Eye,
  Dental,
  Building2,
  PiggyBank,
  Award,
  Activity,
  Plus,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {  } from '@/components/ui';


const healthPlans = [
  {
    id: 1,
    name: "Premier Health PPO",
    type: "PPO",
    carrier: "Anthem",
    monthlyPremium: 650,
    employeeContribution: 125,
    deductible: 1500,
    outOfPocketMax: 8000,
    coverage: 90,
    networkSize: "Large",
    aiScore: 94.5,
    aiRecommendation: "Excellent choice for families with existing relationships with specialists",
    features: ["Large provider network", "No referrals needed", "Prescription coverage", "Mental health benefits"],
    suitable: ["Families", "Frequent travelers", "Chronic conditions"],
    enrollment: 67
  },
  {
    id: 2,
    name: "Smart Health HMO",
    type: "HMO",
    carrier: "Kaiser Permanente",
    monthlyPremium: 520,
    employeeContribution: 85,
    deductible: 1000,
    outOfPocketMax: 6000,
    coverage: 85,
    networkSize: "Medium",
    aiScore: 87.2,
    aiRecommendation: "Cost-effective option with integrated care model",
    features: ["Lower costs", "Integrated care", "Wellness programs", "Preventive care"],
    suitable: ["Young professionals", "Cost-conscious", "Preventive care focused"],
    enrollment: 23
  },
  {
    id: 3,
    name: "Essential Health Plan",
    type: "HDHP",
    carrier: "UnitedHealthcare",
    monthlyPremium: 380,
    employeeContribution: 65,
    deductible: 3000,
    outOfPocketMax: 7000,
    coverage: 80,
    networkSize: "Large",
    aiScore: 78.9,
    aiRecommendation: "Best for healthy individuals who want HSA benefits",
    features: ["HSA eligible", "Lower premiums", "Preventive care covered", "Telemedicine"],
    suitable: ["Healthy individuals", "HSA contributors", "Lower premium seekers"],
    enrollment: 10
  }
];

const additionalBenefits = [
  {
    id: 1,
    name: "Dental Plus",
    type: "Dental",
    carrier: "Delta Dental",
    monthlyPremium: 45,
    employeeContribution: 15,
    coverage: "Preventive 100%, Basic 80%, Major 50%",
    aiScore: 91.3,
    features: ["Preventive care", "Orthodontics", "Large network"],
    enrollment: 85
  },
  {
    id: 2,
    name: "Vision Care Pro",
    type: "Vision", 
    carrier: "VSP",
    monthlyPremium: 18,
    employeeContribution: 8,
    coverage: "Exams, frames, lenses, contacts",
    aiScore: 88.7,
    features: ["Annual exams", "Designer frames", "Contact allowance"],
    enrollment: 72
  },
  {
    id: 3,
    name: "Life Insurance",
    type: "Life",
    carrier: "MetLife",
    monthlyPremium: 25,
    employeeContribution: 0,
    coverage: "2x annual salary up to $500K",
    aiScore: 95.1,
    features: ["Employer paid", "Portable coverage", "AD&D included"],
    enrollment: 100
  }
];

const retirementPlans = [
  {
    id: 1,
    name: "401(k) Smart Plan",
    provider: "Human Interest",
    matchRate: "100% match up to 6%",
    vestingSchedule: "Immediate",
    managementFee: 0.55,
    investmentOptions: 25,
    aiScore: 92.8,
    features: ["Low fees", "Target date funds", "Auto-enrollment", "Financial advice"],
    enrollment: 78,
    averageBalance: 85420
  }
];

const aiInsights = [
  {
    type: "cost-optimization",
    title: "PPO vs HMO Cost Analysis",
    description: "Based on employee demographics, switching 30% of employees from PPO to HMO could save $45,000 annually",
    impact: "high",
    savings: "$45,000/year",
    confidence: 89.4
  },
  {
    type: "enrollment",
    title: "Dental Plan Utilization",
    description: "85% enrollment suggests strong demand. Consider negotiating better rates with Delta Dental",
    impact: "medium", 
    savings: "$12,000/year",
    confidence: 76.2
  },
  {
    type: "wellness",
    title: "Mental Health Benefits Gap",
    description: "Current plan mental health coverage is below industry average. Consider enhanced benefits",
    impact: "high",
    savings: "Employee retention",
    confidence: 91.8
  }
];

export function BenefitsMarketplace() {
  const [selectedPlan, setSelectedPlan] = useState(healthPlans[0]);
  const [filterType, setFilterType] = useState("all");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Benefits Marketplace</h1>
          <p className="text-muted-foreground mt-2">
            AI-powered benefits selection with personalized recommendations and cost optimization
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Open Enrollment
          </Button>
          <Button className="bg-gradient-to-r from-payroll-primary to-payroll-secondary">
            <Plus className="mr-2 h-4 w-4" />
            Add Benefits
          </Button>
        </div>
      </div>

      {/* AI Benefits Assistant */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg p-6 border border-green-200 dark:border-green-800"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
              <Brain className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-green-900 dark:text-green-100">AI Benefits Advisor</h3>
              <p className="text-green-700 dark:text-green-300 text-sm">
                Analyzing employee demographics • 3 cost optimization opportunities • Personalized plan matching active
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-900 dark:text-green-100 mb-1">
              $57K
            </div>
            <div className="text-sm text-green-700 dark:text-green-300">Potential Annual Savings</div>
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
                  <p className="text-sm font-medium text-muted-foreground">Total Benefits Cost</p>
                  <p className="text-2xl font-bold">$18,450</p>
                  <p className="text-xs text-green-600">12% below market avg</p>
                </div>
                <Heart className="h-8 w-8 text-muted-foreground" />
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
                  <p className="text-sm font-medium text-muted-foreground">Enrollment Rate</p>
                  <p className="text-2xl font-bold">87%</p>
                  <p className="text-xs text-blue-600">Above industry avg</p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground" />
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
                  <p className="text-sm font-medium text-muted-foreground">Employee Satisfaction</p>
                  <p className="text-2xl font-bold text-green-600">4.2/5</p>
                  <p className="text-xs text-muted-foreground">AI satisfaction score</p>
                </div>
                <Star className="h-8 w-8 text-muted-foreground" />
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
                  <p className="text-sm font-medium text-muted-foreground">AI Optimization</p>
                  <p className="text-2xl font-bold text-payroll-primary">94%</p>
                  <p className="text-xs text-muted-foreground">Plans optimized</p>
                </div>
                <Brain className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="health" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="health">Health Insurance</TabsTrigger>
          <TabsTrigger value="additional">Additional Benefits</TabsTrigger>
          <TabsTrigger value="retirement">Retirement Plans</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Health Insurance Plans</h3>
              <p className="text-sm text-muted-foreground">AI-recommended plans based on employee demographics</p>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="ppo">PPO Plans</SelectItem>
                <SelectItem value="hmo">HMO Plans</SelectItem>
                <SelectItem value="hdhp">HDHP Plans</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-6">
            {healthPlans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
                            <Shield className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="text-xl font-semibold">{plan.name}</h4>
                            <p className="text-sm text-muted-foreground">{plan.carrier} • {plan.type}</p>
                          </div>
                          <Badge variant="outline" className="ml-auto">
                            <Brain className="mr-1 h-3 w-3 text-green-600" />
                            AI Score: {plan.aiScore}%
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Monthly Premium</label>
                            <p className="text-lg font-semibold">${plan.monthlyPremium}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Employee Cost</label>
                            <p className="text-lg font-semibold text-payroll-primary">${plan.employeeContribution}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Deductible</label>
                            <p className="text-lg font-semibold">${plan.deductible}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Network</label>
                            <p className="text-lg font-semibold">{plan.networkSize}</p>
                          </div>
                        </div>

                        <Alert className="mb-4">
                          <Brain className="h-4 w-4" />
                          <AlertDescription>
                            <strong>AI Recommendation:</strong> {plan.aiRecommendation}
                          </AlertDescription>
                        </Alert>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {plan.features.map((feature, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="text-sm">
                              <span className="font-medium">Best for:</span>
                              <span className="text-muted-foreground ml-1">
                                {plan.suitable.join(", ")}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="text-sm text-muted-foreground">
                              {plan.enrollment}% enrolled
                            </div>
                            <Progress value={plan.enrollment} className="w-20 h-2" />
                          </div>
                        </div>
                      </div>

                      <div className="ml-6 flex flex-col space-y-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedPlan(plan)}>
                              <Eye className="mr-2 h-3 w-3" />
                              Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>{plan.name} - Detailed Information</DialogTitle>
                              <DialogDescription>
                                Complete plan details with AI analysis and cost breakdown
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-semibold mb-3">Plan Details</h4>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span>Plan Type:</span>
                                    <span className="font-medium">{plan.type}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Carrier:</span>
                                    <span className="font-medium">{plan.carrier}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Monthly Premium:</span>
                                    <span className="font-medium">${plan.monthlyPremium}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Employee Contribution:</span>
                                    <span className="font-medium text-payroll-primary">${plan.employeeContribution}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Deductible:</span>
                                    <span className="font-medium">${plan.deductible}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Out-of-Pocket Max:</span>
                                    <span className="font-medium">${plan.outOfPocketMax}</span>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-3">AI Analysis</h4>
                                <div className="space-y-3">
                                  <div>
                                    <label className="text-sm font-medium">AI Recommendation Score</label>
                                    <div className="flex items-center space-x-2 mt-1">
                                      <Progress value={plan.aiScore} className="flex-1" />
                                      <span className="text-sm font-medium">{plan.aiScore}%</span>
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Current Enrollment</label>
                                    <div className="flex items-center space-x-2 mt-1">
                                      <Progress value={plan.enrollment} className="flex-1" />
                                      <span className="text-sm font-medium">{plan.enrollment}%</span>
                                    </div>
                                  </div>
                                  <Alert>
                                    <Brain className="h-4 w-4" />
                                    <AlertDescription>
                                      {plan.aiRecommendation}
                                    </AlertDescription>
                                  </Alert>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button size="sm">
                          <Zap className="mr-2 h-3 w-3" />
                          Enroll
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="additional" className="space-y-6">
          <div className="grid gap-4">
            {additionalBenefits.map((benefit, index) => (
              <motion.div
                key={benefit.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${
                          benefit.type === "Dental" 
                            ? "bg-blue-100 dark:bg-blue-900/20" 
                            : benefit.type === "Vision"
                            ? "bg-green-100 dark:bg-green-900/20"
                            : "bg-purple-100 dark:bg-purple-900/20"
                        }'}>
                          {benefit.type === "Dental" ? (
                            <Dental className="h-5 w-5 text-blue-600" />
                          ) : benefit.type === "Vision" ? (
                            <Eye className="h-5 w-5 text-green-600" />
                          ) : (
                            <Shield className="h-5 w-5 text-purple-600" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg">{benefit.name}</h4>
                          <p className="text-sm text-muted-foreground">{benefit.carrier} • {benefit.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">${benefit.employeeContribution}/month</div>
                        <div className="text-sm text-muted-foreground">Employee cost</div>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            <Brain className="mr-1 h-2 w-2 text-green-600" />
                            AI: {benefit.aiScore}%
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {benefit.enrollment}% enrolled
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Coverage</label>
                          <p className="text-sm">{benefit.coverage}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Key Features</label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {benefit.features.map((feature, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
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

        <TabsContent value="retirement" className="space-y-6">
          {retirementPlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
                        <PiggyBank className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="text-xl font-semibold">{plan.name}</h4>
                        <p className="text-sm text-muted-foreground">{plan.provider}</p>
                        <Badge variant="outline" className="mt-1">
                          <Brain className="mr-1 h-3 w-3 text-green-600" />
                          AI Score: {plan.aiScore}%
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">{plan.enrollment}%</div>
                      <div className="text-sm text-muted-foreground">Participation Rate</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Company Match</label>
                      <p className="text-lg font-semibold">{plan.matchRate}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Vesting</label>
                      <p className="text-lg font-semibold">{plan.vestingSchedule}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Management Fee</label>
                      <p className="text-lg font-semibold">{plan.managementFee}%</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Avg Balance</label>
                      <p className="text-lg font-semibold">${plan.averageBalance.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {plan.features.map((feature, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>

                  <Alert>
                    <Award className="h-4 w-4" />
                    <AlertDescription>
                      This plan ranks in the top 10% for low fees and investment options variety.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </motion.div>
          ))}
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
                          : insight.type === "enrollment"
                          ? "bg-blue-100 dark:bg-blue-900/20"
                          : "bg-purple-100 dark:bg-purple-900/20"
                      }'}>
                        {insight.type === "cost-optimization" ? (
                          <DollarSign className="h-4 w-4 text-green-600" />
                        ) : insight.type === "enrollment" ? (
                          <Users className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Activity className="h-4 w-4 text-purple-600" />
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
                            <Button size="sm">Implement</Button>
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

        <TabsContent value="enrollment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Benefits Enrollment Status
              </CardTitle>
              <CardDescription>
                Employee enrollment rates and upcoming deadlines
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-payroll-primary mb-2">87%</div>
                  <div className="text-sm text-muted-foreground">Overall Enrollment</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">3</div>
                  <div className="text-sm text-muted-foreground">Pending Enrollments</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">45</div>
                  <div className="text-sm text-muted-foreground">Days Until Deadline</div>
                </div>
              </div>

              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  <strong>Open Enrollment Reminder:</strong> Benefits enrollment closes in 45 days. 
                  AI has identified 3 employees who haven't completed their enrollment.'
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}