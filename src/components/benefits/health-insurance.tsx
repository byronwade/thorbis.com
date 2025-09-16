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
  TrendingUp, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit,
  Stethoscope,
  Pill,
  Activity,
  Hospital,
  UserCheck,
  CreditCard,
  Calculator,
  BarChart3,
  PieChart,
  Target,
  Award,
  HelpCircle,
  ExternalLink,
  Download
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


// Mock health insurance data
const healthPlans = [
  {
    id: "hmo-basic",
    name: "Basic HMO Plan",
    type: "HMO",
    carrier: "Blue Cross Blue Shield",
    monthlyPremium: {
      employee: 125.00,
      employeeSpouse: 275.00,
      employeeChild: 225.00,
      family: 425.00
    },
    annualPremium: {
      employee: 1500.00,
      employeeSpouse: 3300.00,
      employeeChild: 2700.00,
      family: 5100.00
    },
    deductible: {
      individual: 2500,
      family: 5000
    },
    outOfPocketMax: {
      individual: 5000,
      family: 10000
    },
    copays: {
      primaryCare: 25,
      specialist: 40,
      urgentCare: 75,
      emergencyRoom: 250
    },
    coinsurance: 80,
    features: [
      "Primary care physician required",
      "Referrals needed for specialists",
      "Lower premiums",
      "In-network providers only"
    ],
    network: "BCBS HMO Network",
    enrollment: 1247,
    satisfaction: 4.2,
    aiScore: 85,
    bestFor: ["Budget-conscious", "Preventive care focused"],
    pros: ["Lower cost", "Comprehensive preventive care", "No claim forms"],
    cons: ["Limited provider choice", "Referrals required", "No out-of-network coverage"]
  },
  {
    id: "ppo-standard",
    name: "Standard PPO Plan",
    type: "PPO",
    carrier: "Aetna",
    monthlyPremium: {
      employee: 185.00,
      employeeSpouse: 385.00,
      employeeChild: 325.00,
      family: 585.00
    },
    annualPremium: {
      employee: 2220.00,
      employeeSpouse: 4620.00,
      employeeChild: 3900.00,
      family: 7020.00
    },
    deductible: {
      individual: 1500,
      family: 3000
    },
    outOfPocketMax: {
      individual: 4000,
      family: 8000
    },
    copays: {
      primaryCare: 20,
      specialist: 35,
      urgentCare: 60,
      emergencyRoom: 200
    },
    coinsurance: 85,
    features: [
      "No referrals required",
      "In and out-of-network coverage",
      "Direct specialist access",
      "Flexible provider choice"
    ],
    network: "Aetna Choice POS II",
    enrollment: 2156,
    satisfaction: 4.5,
    aiScore: 92,
    bestFor: ["Flexibility seekers", "Frequent specialists visits"],
    pros: ["Provider flexibility", "No referrals needed", "Out-of-network coverage"],
    cons: ["Higher premiums", "Deductibles apply", "Out-of-network costs more"]
  },
  {
    id: "ppo-premium",
    name: "Premium PPO Plan",
    type: "PPO",
    carrier: "United Healthcare",
    monthlyPremium: {
      employee: 245.00,
      employeeSpouse: 545.00,
      employeeChild: 445.00,
      family: 745.00
    },
    annualPremium: {
      employee: 2940.00,
      employeeSpouse: 6540.00,
      employeeChild: 5340.00,
      family: 8940.00
    },
    deductible: {
      individual: 500,
      family: 1000
    },
    outOfPocketMax: {
      individual: 2000,
      family: 4000
    },
    copays: {
      primaryCare: 15,
      specialist: 25,
      urgentCare: 50,
      emergencyRoom: 150
    },
    coinsurance: 90,
    features: [
      "Lowest deductibles",
      "Highest coverage levels",
      "Premium provider network",
      "Enhanced benefits"
    ],
    network: "UHC Choice Plus",
    enrollment: 892,
    satisfaction: 4.7,
    aiScore: 88,
    bestFor: ["High utilizers", "Premium care seekers"],
    pros: ["Excellent coverage", "Low out-of-pocket costs", "Premium providers"],
    cons: ["Highest premiums", "May be over-insurance", "Complex benefits"]
  },
  {
    id: "hdhp-hsa",
    name: "High Deductible + HSA",
    type: "HDHP",
    carrier: "Kaiser Permanente",
    monthlyPremium: {
      employee: 95.00,
      employeeSpouse: 205.00,
      employeeChild: 175.00,
      family: 315.00
    },
    annualPremium: {
      employee: 1140.00,
      employeeSpouse: 2460.00,
      employeeChild: 2100.00,
      family: 3780.00
    },
    deductible: {
      individual: 3000,
      family: 6000
    },
    outOfPocketMax: {
      individual: 6000,
      family: 12000
    },
    copays: {
      primaryCare: 0,
      specialist: 0,
      urgentCare: 0,
      emergencyRoom: 0
    },
    coinsurance: 100,
    features: [
      "HSA eligible",
      "Employer HSA contribution",
      "Tax advantages",
      "Lower premiums"
    ],
    network: "Kaiser Permanente",
    enrollment: 743,
    satisfaction: 4.1,
    aiScore: 78,
    bestFor: ["Healthy individuals", "Tax savers", "HSA maximizers"],
    pros: ["Lowest premiums", "HSA benefits", "Tax savings", "Preventive care covered"],
    cons: ["High deductible", "More out-of-pocket initially", "Complex to understand"],
    hsaContribution: {
      individual: 1500,
      family: 3000
    }
  }
];

const enrollmentStats = {
  totalEnrolled: 5038,
  averageSatisfaction: 4.4,
  mostPopular: "ppo-standard",
  topFeatures: ["Provider flexibility", "Low copays", "Comprehensive coverage"],
  utilizationRate: 78,
  costTrend: "+3.2%"
};

const aiInsights = [
  {
    type: "recommendation",
    title: "Optimal Plan Match",
    description: "Based on your age, family size, and health history, the Standard PPO plan offers the best value",
    priority: "high",
    confidence: "94%",
    savings: "$1,200 annually",
    planId: "ppo-standard"
  },
  {
    type: "cost-analysis",
    title: "Total Cost of Ownership",
    description: "Including premiums and estimated out-of-pocket costs, your annual healthcare spend would be lowest with PPO Standard",
    priority: "medium",
    details: "Factors in historical usage patterns and premium costs",
    estimatedSavings: "$800"
  },
  {
    type: "utilization",
    title: "Usage Pattern Analysis",
    description: "Your specialist visit frequency suggests a PPO plan would provide better value than HMO",
    priority: "medium",
    visits: "6 specialist visits/year",
    savings: "$420 in copay differences"
  },
  {
    type: "network",
    title: "Provider Network Match",
    description: "Your current doctors are all in-network for PPO Standard, ensuring continuity of care",
    priority: "low",
    providersInNetwork: "100%",
    currentDoctors: 3
  }
];

const commonServices = [
  {
    service: "Annual Physical",
    hmoBasic: "$0",
    ppoStandard: "$0",
    ppoPremium: "$0",
    hdhpHsa: "$0",
    note: "Covered as preventive care"
  },
  {
    service: "Primary Care Visit",
    hmoBasic: "$25",
    ppoStandard: "$20",
    ppoPremium: "$15",
    hdhpHsa: "Full cost until deductible",
    note: "Copay per visit"
  },
  {
    service: "Specialist Visit",
    hmoBasic: "$40",
    ppoStandard: "$35",
    ppoPremium: "$25",
    hdhpHsa: "Full cost until deductible",
    note: "May require referral for HMO"
  },
  {
    service: "Urgent Care",
    hmoBasic: "$75",
    ppoStandard: "$60",
    ppoPremium: "$50",
    hdhpHsa: "Full cost until deductible",
    note: "Walk-in clinic visits"
  },
  {
    service: "Emergency Room",
    hmoBasic: "$250",
    ppoStandard: "$200",
    ppoPremium: "$150",
    hdhpHsa: "Full cost until deductible",
    note: "May be waived if admitted"
  },
  {
    service: "Prescription Drugs (Generic)",
    hmoBasic: "$10",
    ppoStandard: "$10",
    ppoPremium: "$5",
    hdhpHsa: "Full cost until deductible",
    note: "30-day supply"
  }
];

const providerNetworks = [
  {
    planId: "hmo-basic",
    name: "BCBS HMO Network",
    providers: 15000,
    hospitals: 120,
    pharmacies: 8500,
    coverage: "Regional"
  },
  {
    planId: "ppo-standard",
    name: "Aetna Choice POS II",
    providers: 28000,
    hospitals: 180,
    pharmacies: 12000,
    coverage: "National"
  },
  {
    planId: "ppo-premium",
    name: "UHC Choice Plus",
    providers: 32000,
    hospitals: 220,
    pharmacies: 14000,
    coverage: "National+"
  },
  {
    planId: "hdhp-hsa",
    name: "Kaiser Permanente",
    providers: 12000,
    hospitals: 85,
    pharmacies: 6000,
    coverage: "Integrated"
  }
];

export function HealthInsurance() {
  const [selectedCoverage, setSelectedCoverage] = useState<"employee" | "employeeSpouse" | "employeeChild" | "family">("employee");
  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"premium" | "deductible" | "satisfaction" | "ai-score">("ai-score");
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const sortedPlans = useMemo(() => {
    const filtered = healthPlans.filter(plan =>
      plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.carrier.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "premium":
          return a.monthlyPremium[selectedCoverage] - b.monthlyPremium[selectedCoverage];
        case "deductible":
          return a.deductible.individual - b.deductible.individual;
        case "satisfaction":
          return b.satisfaction - a.satisfaction;
        case "ai-score":
          return b.aiScore - a.aiScore;
        default:
          return 0;
      }
    });
  }, [searchTerm, sortBy, selectedCoverage]);

  const togglePlanComparison = (planId: string) => {
    setSelectedPlans(prev => 
      prev.includes(planId) 
        ? prev.filter(id => id !== planId)
        : prev.length < 3 ? [...prev, planId] : prev
    );
  };

  const getPlanById = (id: string) => healthPlans.find(plan => plan.id === id);

  const getAIRecommendation = (plan: unknown) => {
    if (plan.aiScore >= 90) return { text: "Highly Recommended", color: "bg-green-100 text-green-800 dark:bg-green-900/20" };
    if (plan.aiScore >= 80) return { text: "Recommended", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20" };
    if (plan.aiScore >= 70) return { text: "Good Option", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20" };
    return { text: "Consider Carefully", color: "bg-neutral-100 text-neutral-800 dark:bg-neutral-900/20" };
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Health Insurance Plans</h1>
          <p className="text-muted-foreground mt-2">
            Compare and analyze health insurance options with AI-powered insights and personalized recommendations
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Calculator className="mr-2 h-4 w-4" />
            Cost Calculator
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Plan Summaries
          </Button>
          <Dialog open={showComparison} onOpenChange={setShowComparison}>
            <DialogTrigger asChild>
              <Button 
                variant="outline"
                disabled={selectedPlans.length < 2}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Compare Plans ({selectedPlans.length})
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-7xl">
              <DialogHeader>
                <DialogTitle>Plan Comparison</DialogTitle>
                <DialogDescription>
                  Side-by-side comparison of selected health insurance plans
                </DialogDescription>
              </DialogHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Feature</th>
                      {selectedPlans.map(planId => {
                        const plan = getPlanById(planId);
                        return (
                          <th key={planId} className="text-center py-3 px-4">
                            {plan?.name}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Monthly Premium</td>
                      {selectedPlans.map(planId => {
                        const plan = getPlanById(planId);
                        return (
                          <td key={planId} className="text-center py-3 px-4">
                            {formatCurrency(plan?.monthlyPremium[selectedCoverage] || 0)}
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Deductible</td>
                      {selectedPlans.map(planId => {
                        const plan = getPlanById(planId);
                        return (
                          <td key={planId} className="text-center py-3 px-4">
                            {formatCurrency(plan?.deductible.individual || 0)}
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Out-of-Pocket Max</td>
                      {selectedPlans.map(planId => {
                        const plan = getPlanById(planId);
                        return (
                          <td key={planId} className="text-center py-3 px-4">
                            {formatCurrency(plan?.outOfPocketMax.individual || 0)}
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Primary Care Copay</td>
                      {selectedPlans.map(planId => {
                        const plan = getPlanById(planId);
                        return (
                          <td key={planId} className="text-center py-3 px-4">
                            {plan?.copays.primaryCare === 0 ? "No copay after deductible" : formatCurrency(plan?.copays.primaryCare || 0)}
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </DialogContent>
          </Dialog>
          <Button className="bg-gradient-to-r from-payroll-primary to-payroll-secondary">
            <Plus className="mr-2 h-4 w-4" />
            Enroll in Plan
          </Button>
        </div>
      </div>

      {/* AI Health Intelligence Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20 rounded-lg p-6 border border-rose-200 dark:border-rose-800"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-rose-100 dark:bg-rose-900/30">
              <Heart className="h-6 w-6 text-rose-600" />
            </div>
            <div>
              <h3 className="font-semibold text-rose-900 dark:text-rose-100">AI Health Intelligence</h3>
              <p className="text-rose-700 dark:text-rose-300 text-sm">
                Personalized plan analysis • Cost predictions • Provider network matching • Smart recommendations
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-rose-900 dark:text-rose-100 mb-1">
              {enrollmentStats.averageSatisfaction}/5.0
            </div>
            <div className="text-sm text-rose-700 dark:text-rose-300">Avg Satisfaction</div>
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
                  <p className="text-sm font-medium text-muted-foreground">Total Enrolled</p>
                  <p className="text-2xl font-bold">{enrollmentStats.totalEnrolled.toLocaleString()}</p>
                  <p className="text-xs text-green-600">{enrollmentStats.utilizationRate}% utilization</p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground" />
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
                  <p className="text-sm font-medium text-muted-foreground">Plan Options</p>
                  <p className="text-2xl font-bold">{healthPlans.length}</p>
                  <p className="text-xs text-blue-600">3 carriers available</p>
                </div>
                <Building2 className="h-8 w-8 text-muted-foreground" />
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
                  <p className="text-sm font-medium text-muted-foreground">Avg Satisfaction</p>
                  <p className="text-2xl font-bold">{enrollmentStats.averageSatisfaction}/5.0</p>
                  <p className="text-xs text-green-600">Above industry avg</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Cost Trend</p>
                  <p className="text-2xl font-bold text-orange-600">{enrollmentStats.costTrend}</p>
                  <p className="text-xs text-muted-foreground">vs last year</p>
                </div>
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="plans" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="plans">Health Plans</TabsTrigger>
          <TabsTrigger value="comparison">Service Comparison</TabsTrigger>
          <TabsTrigger value="networks">Provider Networks</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-6">
          {/* Coverage Selection & Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="coverage">Coverage Level</Label>
                  <Select value={selectedCoverage} onValueChange={(value) => setSelectedCoverage(value as typeof selectedCoverage)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Employee Only</SelectItem>
                      <SelectItem value="employeeSpouse">Employee + Spouse</SelectItem>
                      <SelectItem value="employeeChild">Employee + Child(ren)</SelectItem>
                      <SelectItem value="family">Family</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="search">Search Plans</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by name or carrier..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="sort">Sort By</Label>
                  <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ai-score">AI Recommendation</SelectItem>
                      <SelectItem value="premium">Monthly Premium</SelectItem>
                      <SelectItem value="deductible">Deductible</SelectItem>
                      <SelectItem value="satisfaction">Satisfaction Score</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button className="w-full">
                    <Filter className="mr-2 h-4 w-4" />
                    Apply Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Health Plans Grid */}
          <div className="grid gap-6">
            {sortedPlans.map((plan, index) => {
              const aiRec = getAIRecommendation(plan);
              const monthlyCost = plan.monthlyPremium[selectedCoverage];
              const annualCost = plan.annualPremium[selectedCoverage];
              const isComparing = selectedPlans.includes(plan.id);
              
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Card className={`hover:shadow-lg transition-all ${isComparing ? "ring-2 ring-payroll-primary" : ""}'}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <Heart className="h-6 w-6 text-rose-600" />
                            <div>
                              <h3 className="text-xl font-semibold">{plan.name}</h3>
                              <p className="text-muted-foreground">{plan.carrier} • {plan.type}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 mb-3">
                            <Badge className={aiRec.color}>
                              <Brain className="mr-1 h-2 w-2" />
                              {aiRec.text}
                            </Badge>
                            <Badge variant="outline">
                              <Star className="mr-1 h-2 w-2" />
                              {plan.satisfaction}/5.0
                            </Badge>
                            <Badge variant="outline">
                              <Users className="mr-1 h-2 w-2" />
                              {plan.enrollment} enrolled
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-2xl font-bold text-payroll-primary mb-1">
                            {formatCurrency(monthlyCost)}
                          </div>
                          <div className="text-sm text-muted-foreground">per month</div>
                          <div className="text-xs text-muted-foreground">
                            {formatCurrency(annualCost)} annually
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <div className="text-lg font-bold">{formatCurrency(plan.deductible.individual)}</div>
                          <div className="text-xs text-muted-foreground">Deductible</div>
                        </div>
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <div className="text-lg font-bold">{formatCurrency(plan.outOfPocketMax.individual)}</div>
                          <div className="text-xs text-muted-foreground">Out-of-Pocket Max</div>
                        </div>
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <div className="text-lg font-bold">{formatCurrency(plan.copays.primaryCare)}</div>
                          <div className="text-xs text-muted-foreground">Primary Care</div>
                        </div>
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <div className="text-lg font-bold">{plan.coinsurance}%</div>
                          <div className="text-xs text-muted-foreground">Coinsurance</div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="font-semibold mb-2">Key Features</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {plan.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center text-sm">
                              <CheckCircle className="mr-2 h-3 w-3 text-green-600" />
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant={isComparing ? "default" : "outline"}
                            onClick={() => togglePlanComparison(plan.id)}
                            disabled={!isComparing && selectedPlans.length >= 3}
                          >
                            <BarChart3 className="mr-2 h-3 w-3" />
                            {isComparing ? "Comparing" : "Compare"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowDetails(showDetails === plan.id ? null : plan.id)}
                          >
                            <Eye className="mr-2 h-3 w-3" />
                            Details
                          </Button>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm">
                            <Plus className="mr-2 h-3 w-3" />
                            Enroll
                          </Button>
                        </div>
                      </div>

                      {/* Detailed Information */}
                      <AnimatePresence>
                        {showDetails === plan.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 pt-4 border-t space-y-4"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h5 className="font-semibold text-green-700 dark:text-green-400 mb-2">Pros</h5>
                                <ul className="space-y-1">
                                  {plan.pros.map((pro, idx) => (
                                    <li key={idx} className="flex items-center text-sm">
                                      <CheckCircle className="mr-2 h-3 w-3 text-green-600" />
                                      {pro}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h5 className="font-semibold text-red-700 dark:text-red-400 mb-2">Cons</h5>
                                <ul className="space-y-1">
                                  {plan.cons.map((con, idx) => (
                                    <li key={idx} className="flex items-center text-sm">
                                      <AlertTriangle className="mr-2 h-3 w-3 text-red-600" />
                                      {con}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                            
                            <div>
                              <h5 className="font-semibold mb-2">Best For</h5>
                              <div className="flex flex-wrap gap-2">
                                {plan.bestFor.map((category, idx) => (
                                  <Badge key={idx} variant="outline">
                                    {category}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            {plan.hsaContribution && (
                              <Alert>
                                <DollarSign className="h-4 w-4" />
                                <AlertDescription>
                                  <strong>HSA Bonus:</strong> Employer contributes {formatCurrency(plan.hsaContribution.individual)} 
                                  annually to your Health Savings Account, reducing your effective cost.
                                </AlertDescription>
                              </Alert>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Stethoscope className="mr-2 h-5 w-5" />
                Common Services Comparison
              </CardTitle>
              <CardDescription>
                Compare out-of-pocket costs for common healthcare services across all plans
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Service</th>
                      <th className="text-center py-3 px-4">HMO Basic</th>
                      <th className="text-center py-3 px-4">PPO Standard</th>
                      <th className="text-center py-3 px-4">PPO Premium</th>
                      <th className="text-center py-3 px-4">HDHP + HSA</th>
                      <th className="text-center py-3 px-4">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commonServices.map((service, index) => (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">{service.service}</td>
                        <td className="text-center py-3 px-4">{service.hmoBasic}</td>
                        <td className="text-center py-3 px-4">{service.ppoStandard}</td>
                        <td className="text-center py-3 px-4">{service.ppoPremium}</td>
                        <td className="text-center py-3 px-4">{service.hdhpHsa}</td>
                        <td className="text-center py-3 px-4 text-muted-foreground text-xs">{service.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="networks" className="space-y-6">
          <div className="grid gap-6">
            {providerNetworks.map((network, index) => {
              const plan = healthPlans.find(p => p.id === network.planId);
              return (
                <motion.div
                  key={network.planId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">{network.name}</h3>
                          <p className="text-muted-foreground">{plan?.name} Network</p>
                        </div>
                        <Badge variant="outline">{network.coverage}</Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600 mb-1">
                            {network.providers.toLocaleString()}
                          </div>
                          <div className="text-sm text-muted-foreground">Providers</div>
                        </div>
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600 mb-1">
                            {network.hospitals}
                          </div>
                          <div className="text-sm text-muted-foreground">Hospitals</div>
                        </div>
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600 mb-1">
                            {network.pharmacies.toLocaleString()}
                          </div>
                          <div className="text-sm text-muted-foreground">Pharmacies</div>
                        </div>
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                          <Button size="sm" variant="outline" className="w-full">
                            <ExternalLink className="mr-2 h-3 w-3" />
                            Find Providers
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
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
                        insight.type === "recommendation" 
                          ? "bg-blue-100 dark:bg-blue-900/20" 
                          : insight.type === "cost-analysis"
                          ? "bg-green-100 dark:bg-green-900/20"
                          : insight.type === "utilization"
                          ? "bg-purple-100 dark:bg-purple-900/20"
                          : "bg-orange-100 dark:bg-orange-900/20"
                      }'}>
                        {insight.type === "recommendation" ? (
                          <Target className="h-4 w-4 text-blue-600" />
                        ) : insight.type === "cost-analysis" ? (
                          <Calculator className="h-4 w-4 text-green-600" />
                        ) : insight.type === "utilization" ? (
                          <Activity className="h-4 w-4 text-purple-600" />
                        ) : (
                          <Building2 className="h-4 w-4 text-orange-600" />
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
                          <div className="text-sm space-y-1">
                            {"confidence" in insight && (
                              <div>
                                <span className="font-medium text-blue-600">
                                  Confidence: {insight.confidence}
                                </span>
                              </div>
                            )}
                            {"savings" in insight && (
                              <div>
                                <span className="font-medium text-green-600">
                                  Potential savings: {insight.savings}
                                </span>
                              </div>
                            )}
                            {"visits" in insight && (
                              <div>
                                <span className="font-medium text-purple-600">
                                  Usage: {insight.visits}
                                </span>
                              </div>
                            )}
                            {"providersInNetwork" in insight && (
                              <div>
                                <span className="font-medium text-orange-600">
                                  Network match: {insight.providersInNetwork}
                                </span>
                              </div>
                            )}
                          </div>
                          <Button size="sm" variant="outline">
                            Learn More
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
      </Tabs>
    </div>
  );
}