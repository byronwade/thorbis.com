"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
;
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui';
;
import { Label } from '@/components/ui';
;
import { Badge } from '@/components/ui';
import { Alert, AlertDescription } from '@/components/ui';
;
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui';
;
import { Checkbox } from '@/components/ui';
// RadioGroup component inline since it's not available in UI package'
const RadioGroup = ({ value, onValueChange, className, children }: { 
  value: string; 
  onValueChange: (value: string) => void; 
  className?: string; 
  children: React.ReactNode 
}) => (
  <div className={className} role="radiogroup">
    {children}
  </div>
);

const RadioGroupItem = ({ value, id }: { value: string; id: string }) => (
  <input
    type="radio"
    id={id}
    name="coverage"
    value={value}
    className="h-4 w-4 border-neutral-300 text-payroll-primary focus:ring-payroll-primary"
    onChange={(e) => {
      // This will be handled by the parent RadioGroup onValueChange
    }}
  />
);
import { 
  Heart, 
  Shield, 
  DollarSign, 
  Users, 
  User, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Brain, 
  Zap, 
  Star, 
  Award, 
  Target, 
  Calendar, 
  FileText, 
  Plus, 
  Compare, 
  Calculator, 
  TrendingUp, 
  Building2, 
  Eye, 
  ChevronRight,
  HelpCircle,
  Gift,
  Briefcase,
  Home,
  Car,
  Smartphone,
  Coffee
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


// Mock enrollment data
const enrollmentPeriod = {
  isOpen: true,
  startDate: "2024-03-01",
  endDate: "2024-03-31",
  effectiveDate: "2024-04-01",
  daysRemaining: 25
};

const benefitCategories = [
  {
    id: "health",
    name: "Health Insurance",
    description: "Medical, dental, and vision coverage",
    icon: Heart,
    color: "red",
    required: true,
    plans: [
      {
        id: "health-basic",
        name: "Basic Health Plan",
        type: "HMO",
        monthlyPremium: {
          employee: 125.00,
          employeeSpouse: 275.00,
          employeeChild: 225.00,
          family: 425.00
        },
        deductible: 2500,
        outOfPocketMax: 5000,
        copayPrimary: 25,
        copaySpecialist: 40,
        coverage: "In-network providers only",
        aiRecommendation: "budget-friendly",
        popularChoice: false
      },
      {
        id: "health-standard",
        name: "Standard Health Plan",
        type: "PPO",
        monthlyPremium: {
          employee: 185.00,
          employeeSpouse: 385.00,
          employeeChild: 325.00,
          family: 585.00
        },
        deductible: 1500,
        outOfPocketMax: 4000,
        copayPrimary: 20,
        copaySpecialist: 35,
        coverage: "In-network and out-of-network",
        aiRecommendation: "balanced",
        popularChoice: true
      },
      {
        id: "health-premium",
        name: "Premium Health Plan",
        type: "PPO",
        monthlyPremium: {
          employee: 245.00,
          employeeSpouse: 545.00,
          employeeChild: 445.00,
          family: 745.00
        },
        deductible: 500,
        outOfPocketMax: 2000,
        copayPrimary: 15,
        copaySpecialist: 25,
        coverage: "Comprehensive in and out-of-network",
        aiRecommendation: "comprehensive",
        popularChoice: false
      }
    ]
  },
  {
    id: "dental",
    name: "Dental Insurance",
    description: "Preventive, basic, and major dental services",
    icon: Star,
    color: "blue",
    required: false,
    plans: [
      {
        id: "dental-basic",
        name: "Basic Dental",
        type: "DHMO",
        monthlyPremium: {
          employee: 25.00,
          employeeSpouse: 55.00,
          employeeChild: 45.00,
          family: 85.00
        },
        coverage: "Preventive 100%, Basic 80%, Major 50%",
        annualMaximum: 1000,
        aiRecommendation: "essential",
        popularChoice: true
      },
      {
        id: "dental-premium",
        name: "Premium Dental",
        type: "DPPO",
        monthlyPremium: {
          employee: 45.00,
          employeeSpouse: 95.00,
          employeeChild: 75.00,
          family: 145.00
        },
        coverage: "Preventive 100%, Basic 90%, Major 70%",
        annualMaximum: 2000,
        aiRecommendation: "comprehensive",
        popularChoice: false
      }
    ]
  },
  {
    id: "vision",
    name: "Vision Insurance",
    description: "Eye exams, glasses, and contact lenses",
    icon: Eye,
    color: "purple",
    required: false,
    plans: [
      {
        id: "vision-standard",
        name: "Vision Plan",
        type: "Vision",
        monthlyPremium: {
          employee: 12.00,
          employeeSpouse: 24.00,
          employeeChild: 18.00,
          family: 36.00
        },
        coverage: "Annual eye exam, frames allowance $150, contact allowance $120",
        aiRecommendation: "recommended",
        popularChoice: true
      }
    ]
  },
  {
    id: "life",
    name: "Life Insurance",
    description: "Financial protection for your beneficiaries",
    icon: Shield,
    color: "green",
    required: false,
    plans: [
      {
        id: "life-basic",
        name: "Basic Life Insurance",
        type: "Term Life",
        monthlyPremium: {
          employee: 0.00,
          employeeSpouse: 15.00,
          employeeChild: 5.00,
          family: 20.00
        },
        coverage: "1x Annual Salary (Company Paid)",
        aiRecommendation: "included",
        popularChoice: true
      },
      {
        id: "life-supplemental",
        name: "Supplemental Life Insurance",
        type: "Term Life",
        monthlyPremium: {
          employee: 25.00,
          employeeSpouse: 45.00,
          employeeChild: 15.00,
          family: 65.00
        },
        coverage: "Additional coverage up to 5x Annual Salary",
        aiRecommendation: "optional",
        popularChoice: false
      }
    ]
  },
  {
    id: "disability",
    name: "Disability Insurance",
    description: "Income protection if unable to work",
    icon: Briefcase,
    color: "orange",
    required: false,
    plans: [
      {
        id: "std-basic",
        name: "Short-term Disability",
        type: "STD",
        monthlyPremium: {
          employee: 15.50,
          employeeSpouse: 0,
          employeeChild: 0,
          family: 15.50
        },
        coverage: "60% of salary for up to 26 weeks",
        aiRecommendation: "recommended",
        popularChoice: true
      },
      {
        id: "ltd-basic",
        name: "Long-term Disability", 
        type: "LTD",
        monthlyPremium: {
          employee: 35.00,
          employeeSpouse: 0,
          employeeChild: 0,
          family: 35.00
        },
        coverage: "60% of salary until retirement age",
        aiRecommendation: "important",
        popularChoice: false
      }
    ]
  },
  {
    id: "flexible",
    name: "Flexible Spending",
    description: "Pre-tax savings for healthcare and dependent care",
    icon: Calculator,
    color: "indigo",
    required: false,
    plans: [
      {
        id: "fsa-healthcare",
        name: "Healthcare FSA",
        type: "FSA",
        monthlyPremium: {
          employee: 0,
          employeeSpouse: 0,
          employeeChild: 0,
          family: 0
        },
        coverage: "Pre-tax dollars for medical expenses (up to $3,200/year)",
        aiRecommendation: "tax-saver",
        popularChoice: true
      },
      {
        id: "fsa-dependent",
        name: "Dependent Care FSA",
        type: "FSA",
        monthlyPremium: {
          employee: 0,
          employeeSpouse: 0,
          employeeChild: 0,
          family: 0
        },
        coverage: "Pre-tax dollars for dependent care (up to $5,000/year)",
        aiRecommendation: "family-saver",
        popularChoice: false
      }
    ]
  }
];

const aiInsights = [
  {
    type: "savings",
    title: "Maximize Tax Savings",
    description: "Healthcare FSA can save you $800 annually based on your medical expenses",
    priority: "high",
    savings: "$800/year",
    category: "flexible"
  },
  {
    type: "recommendation",
    title: "Optimal Health Plan Match",
    description: "Standard PPO plan offers best value for your family size and health profile",
    priority: "medium",
    category: "health",
    confidence: "92%"
  },
  {
    type: "comparison",
    title: "Similar Employee Choices",
    description: "Employees in your department typically choose Standard Health + Basic Dental",
    priority: "low",
    category: "trends",
    percentage: "78%"
  }
];

const currentSelections = {
  health: null,
  dental: null,
  vision: null,
  life: "life-basic",
  disability: null,
  flexible: null
};

export function BenefitsEnrollment() {
  const [selectedCoverage, setSelectedCoverage] = useState<"employee" | "employeeSpouse" | "employeeChild" | "family">("employee");
  const [enrollmentSelections, setEnrollmentSelections] = useState(currentSelections);
  const [showComparison, setShowComparison] = useState(false);
  const [activeCategory, setActiveCategory] = useState("health");
  const [showAIRecommendations, setShowAIRecommendations] = useState(true);

  const totalMonthlyCost = useMemo(() => {
    const total = 0;
    Object.entries(enrollmentSelections).forEach(([categoryId, planId]) => {
      if (planId) {
        const category = benefitCategories.find(cat => cat.id === categoryId);
        const plan = category?.plans.find(p => p.id === planId);
        if (plan?.monthlyPremium) {
          total += plan.monthlyPremium[selectedCoverage] || 0;
        }
      }
    });
    return total;
  }, [enrollmentSelections, selectedCoverage]);

  const handlePlanSelection = (categoryId: string, planId: string) => {
    setEnrollmentSelections(prev => ({
      ...prev,
      [categoryId]: planId
    }));
  };

  const getRecommendationColor = (recommendation: string) => {
    const colors = {
      "budget-friendly": "text-green-600 bg-green-100 dark:bg-green-900/20",
      "balanced": "text-blue-600 bg-blue-100 dark:bg-blue-900/20",
      "comprehensive": "text-purple-600 bg-purple-100 dark:bg-purple-900/20",
      "essential": "text-orange-600 bg-orange-100 dark:bg-orange-900/20",
      "recommended": "text-payroll-primary bg-payroll-primary/10",
      "included": "text-green-600 bg-green-100 dark:bg-green-900/20",
      "optional": "text-neutral-600 bg-neutral-100 dark:bg-neutral-900/20",
      "important": "text-red-600 bg-red-100 dark:bg-red-900/20",
      "tax-saver": "text-indigo-600 bg-indigo-100 dark:bg-indigo-900/20",
      "family-saver": "text-pink-600 bg-pink-100 dark:bg-pink-900/20"
    };
    return colors[recommendation as keyof typeof colors] || colors.recommended;
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = benefitCategories.find(cat => cat.id === categoryId);
    return category?.icon || Heart;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Benefits Enrollment</h1>
          <p className="text-muted-foreground mt-2">
            Choose your benefits with AI-powered recommendations and smart plan comparisons
          </p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={showComparison} onOpenChange={setShowComparison}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Compare className="mr-2 h-4 w-4" />
                Compare Plans
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl">
              <DialogHeader>
                <DialogTitle>Plan Comparison</DialogTitle>
                <DialogDescription>
                  Side-by-side comparison of all available benefit plans
                </DialogDescription>
              </DialogHeader>
              <div className="overflow-x-auto">
                <div className="text-center py-12">
                  <Compare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Plan Comparison Tool</h3>
                  <p className="text-muted-foreground">
                    Interactive comparison of all benefit plans with cost analysis
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline">
            <Calculator className="mr-2 h-4 w-4" />
            Cost Calculator
          </Button>
          <Button className="bg-gradient-to-r from-payroll-primary to-payroll-secondary">
            <CheckCircle className="mr-2 h-4 w-4" />
            Enroll in Benefits
          </Button>
        </div>
      </div>

      {/* Enrollment Period Alert */}
      {enrollmentPeriod.isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
            <Clock className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800 dark:text-orange-300">
              <strong>Open Enrollment Period:</strong> You have {enrollmentPeriod.daysRemaining} days remaining to make your benefits selections. 
              Enrollment closes on {formatDate(enrollmentPeriod.endDate)}. 
              Benefits become effective {formatDate(enrollmentPeriod.effectiveDate)}.
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* AI Benefits Intelligence Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 rounded-lg p-6 border border-violet-200 dark:border-violet-800"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-violet-100 dark:bg-violet-900/30">
              <Brain className="h-6 w-6 text-violet-600" />
            </div>
            <div>
              <h3 className="font-semibold text-violet-900 dark:text-violet-100">AI Benefits Intelligence</h3>
              <p className="text-violet-700 dark:text-violet-300 text-sm">
                Personalized plan recommendations • Cost optimization • Coverage gap analysis • Smart comparisons
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-violet-900 dark:text-violet-100 mb-1">
              {formatCurrency(totalMonthlyCost)}
            </div>
            <div className="text-sm text-violet-700 dark:text-violet-300">Monthly Cost</div>
          </div>
        </div>
      </motion.div>

      {/* Coverage Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Who needs coverage?
          </CardTitle>
          <CardDescription>
            Select your coverage level to see personalized plan options and pricing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={selectedCoverage} 
            onValueChange={(value) => setSelectedCoverage(value as typeof selectedCoverage)}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <div className="flex items-center space-x-2 p-4 border rounded-lg">
              <RadioGroupItem value="employee" id="employee" />
              <Label htmlFor="employee" className="flex-1 cursor-pointer">
                <div className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <div>
                    <div className="font-semibold">Employee Only</div>
                    <div className="text-sm text-muted-foreground">Just me</div>
                  </div>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-4 border rounded-lg">
              <RadioGroupItem value="employeeSpouse" id="employeeSpouse" />
              <Label htmlFor="employeeSpouse" className="flex-1 cursor-pointer">
                <div className="flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  <div>
                    <div className="font-semibold">Employee + Spouse</div>
                    <div className="text-sm text-muted-foreground">Me and spouse</div>
                  </div>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-4 border rounded-lg">
              <RadioGroupItem value="employeeChild" id="employeeChild" />
              <Label htmlFor="employeeChild" className="flex-1 cursor-pointer">
                <div className="flex items-center">
                  <Heart className="mr-2 h-4 w-4" />
                  <div>
                    <div className="font-semibold">Employee + Child(ren)</div>
                    <div className="text-sm text-muted-foreground">Me and children</div>
                  </div>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-4 border rounded-lg">
              <RadioGroupItem value="family" id="family" />
              <Label htmlFor="family" className="flex-1 cursor-pointer">
                <div className="flex items-center">
                  <Home className="mr-2 h-4 w-4" />
                  <div>
                    <div className="font-semibold">Family</div>
                    <div className="text-sm text-muted-foreground">Me, spouse, and children</div>
                  </div>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Category Navigation */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Benefit Categories
          </h3>
          {benefitCategories.map((category) => {
            const Icon = category.icon;
            const isSelected = activeCategory === category.id;
            const hasSelection = enrollmentSelections[category.id as keyof typeof enrollmentSelections];
            
            return (
              <motion.button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full p-4 rounded-lg border text-left transition-all ${
                  isSelected 
                    ? "border-payroll-primary bg-payroll-primary/5" 
                    : "border-border hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Icon className={`h-5 w-5 ${isSelected ? "text-payroll-primary" : "text-muted-foreground"}`} />
                    <div>
                      <div className="font-semibold text-sm">{category.name}</div>
                      <div className="text-xs text-muted-foreground">{category.description}</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    {category.required && (
                      <Badge variant="outline" className="text-xs mb-1">Required</Badge>
                    )}
                    {hasSelection && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Plan Selection */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {benefitCategories.map((category) => (
              activeCategory === category.id && (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <category.icon className="mr-2 h-5 w-5" />
                        {category.name}
                        {category.required && (
                          <Badge variant="destructive" className="ml-2 text-xs">Required</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {category.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {category.plans.map((plan) => {
                          const isSelected = enrollmentSelections[category.id as keyof typeof enrollmentSelections] === plan.id;
                          const monthlyCost = plan.monthlyPremium[selectedCoverage] || 0;
                          
                          return (
                            <motion.div
                              key={plan.id}
                              whileHover={{ scale: 1.01 }}
                              className={`p-6 border rounded-lg cursor-pointer transition-all ${
                                isSelected 
                                  ? "border-payroll-primary bg-payroll-primary/5" 
                                  : "border-border hover:bg-muted/50"
                              }'}
                              onClick={() => handlePlanSelection(category.id, plan.id)}
                            >
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3 mb-2">
                                    <h4 className="text-lg font-semibold">{plan.name}</h4>
                                    <Badge variant="outline" className="text-xs">{plan.type}</Badge>
                                    {plan.popularChoice && (
                                      <Badge className="text-xs">
                                        <Star className="mr-1 h-2 w-2" />
                                        Popular Choice
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center space-x-2 mb-3">
                                    <Badge className={getRecommendationColor(plan.aiRecommendation)} variant="outline">
                                      <Brain className="mr-1 h-2 w-2" />
                                      AI: {plan.aiRecommendation}
                                    </Badge>
                                  </div>
                                  
                                  <p className="text-sm text-muted-foreground mb-3">
                                    {plan.coverage}
                                  </p>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    {"deductible" in plan && (
                                      <div>
                                        <span className="font-medium text-muted-foreground">Deductible:</span>
                                        <p>{formatCurrency(plan.deductible)}</p>
                                      </div>
                                    )}
                                    {"outOfPocketMax" in plan && (
                                      <div>
                                        <span className="font-medium text-muted-foreground">Out-of-Pocket Max:</span>
                                        <p>{formatCurrency(plan.outOfPocketMax)}</p>
                                      </div>
                                    )}
                                    {"copayPrimary" in plan && (
                                      <div>
                                        <span className="font-medium text-muted-foreground">Primary Care:</span>
                                        <p>{formatCurrency(plan.copayPrimary)} copay</p>
                                      </div>
                                    )}
                                    {"annualMaximum" in plan && (
                                      <div>
                                        <span className="font-medium text-muted-foreground">Annual Maximum:</span>
                                        <p>{formatCurrency(plan.annualMaximum)}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="text-right ml-6">
                                  <div className="text-2xl font-bold text-payroll-primary mb-1">
                                    {monthlyCost === 0 ? "FREE" : formatCurrency(monthlyCost)}
                                  </div>
                                  <div className="text-sm text-muted-foreground">per month</div>
                                  {isSelected && (
                                    <CheckCircle className="h-5 w-5 text-green-600 mt-2 ml-auto" />
                                  )}
                                </div>
                              </div>
                              
                              {isSelected && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  className="border-t pt-4"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center text-green-600">
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      <span className="font-medium">Selected Plan</span>
                                    </div>
                                    <Button size="sm" variant="outline">
                                      <Eye className="mr-2 h-3 w-3" />
                                      View Details
                                    </Button>
                                  </div>
                                </motion.div>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* AI Insights */}
      {showAIRecommendations && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Brain className="mr-2 h-5 w-5" />
                AI Benefits Insights
              </div>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setShowAIRecommendations(false)}
              >
                ×
              </Button>
            </CardTitle>
            <CardDescription>
              Personalized recommendations based on your profile and similar employees
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {aiInsights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="p-4 border rounded-lg"
                >
                  <div className="flex items-start space-x-4">
                    <div className={'p-2 rounded-full ${
                      insight.type === "savings" 
                        ? "bg-green-100 dark:bg-green-900/20" 
                        : insight.type === "recommendation"
                        ? "bg-blue-100 dark:bg-blue-900/20"
                        : "bg-purple-100 dark:bg-purple-900/20"
                    }'}>
                      {insight.type === "savings" ? (
                        <DollarSign className="h-4 w-4 text-green-600" />
                      ) : insight.type === "recommendation" ? (
                        <Target className="h-4 w-4 text-blue-600" />
                      ) : (
                        <TrendingUp className="h-4 w-4 text-purple-600" />
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
                      <p className="text-sm text-muted-foreground mb-3">
                        {insight.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          {"savings" in insight && (
                            <span className="font-medium text-green-600">
                              Potential savings: {insight.savings}
                            </span>
                          )}
                          {"confidence" in insight && (
                            <span className="font-medium text-blue-600">
                              Confidence: {insight.confidence}
                            </span>
                          )}
                          {"percentage" in insight && (
                            <span className="font-medium text-purple-600">
                              {insight.percentage} of similar employees
                            </span>
                          )}
                        </div>
                        <Button size="sm" variant="outline">
                          <ChevronRight className="mr-2 h-3 w-3" />
                          Learn More
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enrollment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Enrollment Summary
          </CardTitle>
          <CardDescription>
            Review your selections before finalizing your enrollment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Selected Benefits</h4>
                <div className="space-y-2">
                  {Object.entries(enrollmentSelections).map(([categoryId, planId]) => {
                    const category = benefitCategories.find(cat => cat.id === categoryId);
                    const plan = category?.plans.find(p => p.id === planId);
                    const Icon = getCategoryIcon(categoryId);
                    
                    return (
                      <div key={categoryId} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{category?.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {plan ? plan.name : "No selection"}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          {plan ? (
                            <div className="font-semibold">
                              {plan.monthlyPremium[selectedCoverage] === 0 
                                ? "FREE" 
                                : formatCurrency(plan.monthlyPremium[selectedCoverage] || 0)
                              }
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">Not selected</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Cost Summary</h4>
                <div className="space-y-3">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Monthly Cost:</span>
                      <span className="text-xl font-bold text-payroll-primary">
                        {formatCurrency(totalMonthlyCost)}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Annual cost: {formatCurrency(totalMonthlyCost * 12)}
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <p>Coverage: {selectedCoverage.replace(/([A-Z])/g, ' $1').trim()}</p>
                    <p>Effective Date: {formatDate(enrollmentPeriod.effectiveDate)}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="confirm" />
                  <Label htmlFor="confirm" className="text-sm">
                    I confirm my benefit selections and understand the terms and conditions
                  </Label>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline">
                    Save as Draft
                  </Button>
                  <Button className="bg-gradient-to-r from-green-600 to-emerald-600">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Finalize Enrollment
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}