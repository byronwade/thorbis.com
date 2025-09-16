"use client";

import React, { useState } from "react";
;
import {
  Brain,
  Building2,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Globe,
  MapPin,
  Plus,
  Settings,
  Shield,
  Zap,
  Eye,
  ExternalLink,
  Download,
  Upload,
  Calculator,
  DollarSign,
  Calendar,
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


const registrationData = {
  totalStates: 8,
  activeRegistrations: 6,
  pendingRegistrations: 2,
  complianceScore: 94.2,
  monthlyFees: 245,
  nextDeadline: "March 15, 2024"
};

const stateRegistrations = [
  {
    state: "California",
    status: "active",
    registrationDate: "2023-01-15",
    ein: "XX-XXXXXXX",
    accountNumber: "CA-123456789",
    filingFrequency: "Quarterly",
    nextFiling: "2024-04-30",
    monthlyFee: 45,
    employees: 12,
    requirements: ["SUI", "SDI", "ETT", "New Hire Reporting"],
    aiRecommendation: "All requirements met - no action needed",
    complianceScore: 100
  },
  {
    state: "New York",
    status: "active", 
    registrationDate: "2023-02-20",
    ein: "XX-XXXXXXX",
    accountNumber: "NY-987654321",
    filingFrequency: "Quarterly",
    nextFiling: "2024-04-30",
    monthlyFee: 38,
    employees: 8,
    requirements: ["SUI", "PFL", "New Hire Reporting"],
    aiRecommendation: "Consider registering for voluntary disability insurance",
    complianceScore: 95
  },
  {
    state: "Texas",
    status: "active",
    registrationDate: "2023-03-10",
    ein: "XX-XXXXXXX", 
    accountNumber: "TX-456789123",
    filingFrequency: "Quarterly",
    nextFiling: "2024-04-30",
    monthlyFee: 25,
    employees: 3,
    requirements: ["SUI", "New Hire Reporting"],
    aiRecommendation: "Low-maintenance state - automated filing recommended",
    complianceScore: 98
  },
  {
    state: "Florida",
    status: "active",
    registrationDate: "2023-04-05",
    ein: "XX-XXXXXXX",
    accountNumber: "FL-789123456", 
    filingFrequency: "Quarterly",
    nextFiling: "2024-04-30",
    monthlyFee: 32,
    employees: 2,
    requirements: ["SUI", "New Hire Reporting"],
    aiRecommendation: "Consider bulk registration for efficiency",
    complianceScore: 96
  },
  {
    state: "Illinois",
    status: "pending",
    registrationDate: null,
    ein: "Pending",
    accountNumber: "Pending",
    filingFrequency: "TBD",
    nextFiling: "TBD",
    monthlyFee: 0,
    employees: 1,
    requirements: ["SUI", "New Hire Reporting"],
    aiRecommendation: "Registration required within 30 days of hire",
    complianceScore: 0
  },
  {
    state: "Washington",
    status: "pending",
    registrationDate: null,
    ein: "Pending", 
    accountNumber: "Pending",
    filingFrequency: "TBD",
    nextFiling: "TBD",
    monthlyFee: 0,
    employees: 1,
    requirements: ["SUI", "PFL", "WA Cares", "New Hire Reporting"],
    aiRecommendation: "Complex requirements - AI assistance recommended",
    complianceScore: 0
  }
];

const availableStates = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "Colorado", "Connecticut", "Delaware", 
  "Georgia", "Hawaii", "Idaho", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
  "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri",
  "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "North Carolina",
  "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", 
  "South Dakota", "Tennessee", "Utah", "Vermont", "Virginia", "West Virginia", "Wisconsin", "Wyoming"
];

const registrationRequirements = {
  "Illinois": {
    forms: ["REG-1", "UI-3/40"],
    fees: "$25 registration",
    timeline: "10-15 business days",
    requirements: ["State unemployment insurance", "New hire reporting"],
    complexity: "Medium",
    aiEstimate: "87% automated"
  },
  "Washington": {
    forms: ["ESD Business Registration", "Paid Family Medical Leave Registration"],
    fees: "$50 registration",
    timeline: "15-20 business days", 
    requirements: ["State unemployment insurance", "Paid family leave", "WA Cares Fund", "New hire reporting"],
    complexity: "High",
    aiEstimate: "71% automated"
  }
};

const aiInsights = [
  {
    type: "registration",
    title: "Illinois Registration Overdue",
    description: "Employee hired 25 days ago in Illinois. State registration required within 30 days to avoid penalties.",
    urgency: "high",
    impact: "$500 potential penalty",
    confidence: 98.2,
    action: "Register immediately"
  },
  {
    type: "optimization", 
    title: "Multi-State Filing Consolidation",
    description: "6 states with quarterly filings. AI can synchronize all filings to save 4 hours monthly.",
    urgency: "medium",
    impact: "4 hours/month saved",
    confidence: 91.7,
    action: "Enable sync"
  },
  {
    type: "compliance",
    title: "Washington State Complexity Alert",
    description: "WA has 4 separate requirements including new WA Cares Fund. AI guidance recommended.",
    urgency: "medium", 
    impact: "Avoid compliance gaps",
    confidence: 94.5,
    action: "Start guided setup"
  }
];

export function StateTaxRegistration() {
  const [selectedState, setSelectedState] = useState<string>("");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">State Tax Registration</h1>
          <p className="text-muted-foreground mt-2">
            AI-powered multi-state payroll tax registration and compliance management
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Registrations
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-payroll-primary to-payroll-secondary">
                <Plus className="mr-2 h-4 w-4" />
                Register New State
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Register in New State</DialogTitle>
                <DialogDescription>
                  AI will guide you through state-specific requirements and handle the registration process
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="newState">Select State</Label>
                  <Select value={selectedState} onValueChange={setSelectedState}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a state..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-48">
                      {availableStates.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedState && registrationRequirements[selectedState as keyof typeof registrationRequirements] && (
                  <div className="space-y-4">
                    <Alert>
                      <Brain className="h-4 w-4" />
                      <AlertDescription>
                        <strong>AI Analysis for {selectedState}:</strong> This registration is{" "}
                        {registrationRequirements[selectedState as keyof typeof registrationRequirements].aiEstimate} automated.
                        Estimated completion time: {registrationRequirements[selectedState as keyof typeof registrationRequirements].timeline}
                      </AlertDescription>
                    </Alert>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Required Forms</Label>
                        <ul className="text-sm mt-1">
                          {registrationRequirements[selectedState as keyof typeof registrationRequirements].forms.map((form, i) => (
                            <li key={i}>• {form}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Requirements</Label>
                        <ul className="text-sm mt-1">
                          {registrationRequirements[selectedState as keyof typeof registrationRequirements].requirements.map((req, i) => (
                            <li key={i}>• {req}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm font-medium">Registration Fees:</span>
                      <span className="font-semibold">{registrationRequirements[selectedState as keyof typeof registrationRequirements].fees}</span>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end space-x-2 mt-4">
                  <Button variant="outline">Save for Later</Button>
                  <Button disabled={!selectedState}>
                    <Zap className="mr-2 h-4 w-4" />
                    Start AI Registration
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* AI Registration Assistant */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-950/20 rounded-lg p-6 border border-teal-200 dark:border-teal-800"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-teal-100 dark:bg-teal-900/30">
              <Globe className="h-6 w-6 text-teal-600" />
            </div>
            <div>
              <h3 className="font-semibold text-teal-900 dark:text-teal-100">AI State Registration Manager</h3>
              <p className="text-teal-700 dark:text-teal-300 text-sm">
                Managing {registrationData.activeRegistrations} active states • {registrationData.pendingRegistrations} pending registrations • {registrationData.complianceScore}% compliant
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-teal-900 dark:text-teal-100 mb-1">
              ${registrationData.monthlyFees}
            </div>
            <div className="text-sm text-teal-700 dark:text-teal-300">Monthly Compliance Costs</div>
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
                  <p className="text-sm font-medium text-muted-foreground">Active States</p>
                  <p className="text-2xl font-bold text-green-600">{registrationData.activeRegistrations}</p>
                  <p className="text-xs text-green-600">Fully compliant</p>
                </div>
                <CheckCircle className="h-8 w-8 text-muted-foreground" />
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
                  <p className="text-sm font-medium text-muted-foreground">Pending Registrations</p>
                  <p className="text-2xl font-bold text-orange-600">{registrationData.pendingRegistrations}</p>
                  <p className="text-xs text-orange-600">Action required</p>
                </div>
                <Clock className="h-8 w-8 text-muted-foreground" />
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
                  <p className="text-sm font-medium text-muted-foreground">Compliance Score</p>
                  <p className="text-2xl font-bold text-payroll-primary">{registrationData.complianceScore}%</p>
                  <p className="text-xs text-muted-foreground">AI-verified</p>
                </div>
                <Brain className="h-8 w-8 text-muted-foreground" />
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
                  <p className="text-sm font-medium text-muted-foreground">Next Deadline</p>
                  <p className="text-2xl font-bold text-blue-600">5</p>
                  <p className="text-xs text-muted-foreground">days remaining</p>
                </div>
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="registrations" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="registrations">State Registrations</TabsTrigger>
          <TabsTrigger value="requirements">Requirements by State</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="deadlines">Filing Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="registrations" className="space-y-4">
          <div className="grid gap-4">
            {stateRegistrations.map((registration, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
                          <MapPin className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <h4 className="text-xl font-semibold">{registration.state}</h4>
                            <Badge variant={registration.status === "active" ? "default" : "secondary"}>
                              {registration.status}
                            </Badge>
                            <Badge variant="outline">
                              <Brain className="mr-1 h-3 w-3 text-green-600" />
                              {registration.complianceScore}% compliant
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <label className="text-xs text-muted-foreground">Account Number</label>
                              <p className="text-sm font-medium">{registration.accountNumber}</p>
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">Employees</label>
                              <p className="text-sm font-medium">{registration.employees}</p>
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">Filing Frequency</label>
                              <p className="text-sm font-medium">{registration.filingFrequency}</p>
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">Monthly Fee</label>
                              <p className="text-sm font-medium">${registration.monthlyFee}</p>
                            </div>
                          </div>

                          <div className="mb-4">
                            <label className="text-sm font-medium text-muted-foreground mb-2 block">Requirements</label>
                            <div className="flex flex-wrap gap-2">
                              {registration.requirements.map((req, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {req}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <Alert>
                            <Brain className="h-4 w-4" />
                            <AlertDescription>
                              <strong>AI Recommendation:</strong> {registration.aiRecommendation}
                            </AlertDescription>
                          </Alert>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        {registration.status === "active" ? (
                          <div className="mb-4">
                            <div className="text-lg font-bold text-green-600 mb-1">
                              {registration.nextFiling}
                            </div>
                            <div className="text-sm text-muted-foreground">Next Filing</div>
                          </div>
                        ) : (
                          <div className="mb-4">
                            <div className="text-lg font-bold text-orange-600 mb-1">
                              Action Required
                            </div>
                            <div className="text-sm text-muted-foreground">Registration Pending</div>
                          </div>
                        )}
                        
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="mr-2 h-3 w-3" />
                            Details
                          </Button>
                          {registration.status === "pending" ? (
                            <Button size="sm">
                              <Zap className="mr-2 h-3 w-3" />
                              Register
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline">
                              <Settings className="mr-2 h-3 w-3" />
                              Manage
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="requirements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>State-by-State Requirements</CardTitle>
              <CardDescription>
                Comprehensive breakdown of registration and compliance requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>State</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Key Requirements</TableHead>
                    <TableHead>Filing Frequency</TableHead>
                    <TableHead>Registration Fee</TableHead>
                    <TableHead>Complexity</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stateRegistrations.map((state) => (
                    <TableRow key={state.state}>
                      <TableCell className="font-medium">{state.state}</TableCell>
                      <TableCell>
                        <Badge variant={state.status === "active" ? "default" : "secondary"}>
                          {state.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {state.requirements.slice(0, 2).map((req, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {req}
                            </Badge>
                          ))}
                          {state.requirements.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{state.requirements.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{state.filingFrequency}</TableCell>
                      <TableCell>${state.monthlyFee || "Varies"}</TableCell>
                      <TableCell>
                        <Badge variant={
                          state.requirements.length <= 2 ? "default" :
                          state.requirements.length <= 3 ? "secondary" : "outline"
                        }>
                          {state.requirements.length <= 2 ? "Low" :
                           state.requirements.length <= 3 ? "Medium" : "High"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="ghost">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <ExternalLink className="h-3 w-3" />
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
                        insight.urgency === "high" 
                          ? "bg-red-100 dark:bg-red-900/20" 
                          : insight.type === "optimization"
                          ? "bg-green-100 dark:bg-green-900/20"
                          : "bg-blue-100 dark:bg-blue-900/20"
                      }'}>
                        {insight.urgency === "high" ? (
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        ) : insight.type === "optimization" ? (
                          <DollarSign className="h-4 w-4 text-green-600" />
                        ) : (
                          <Shield className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{insight.title}</h4>
                          <div className="flex items-center space-x-2">
                            <Badge variant={insight.urgency === "high" ? "destructive" : "secondary"}>
                              {insight.urgency} urgency
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
                            Impact: {insight.impact}
                          </div>
                          <Button size="sm" variant={insight.urgency === "high" ? "default" : "outline"}>
                            {insight.action}
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

        <TabsContent value="deadlines" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Upcoming Filing Deadlines
              </CardTitle>
              <CardDescription>
                AI-synchronized filing calendar across all registered states
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stateRegistrations.filter(s => s.status === "active").map((state, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{state.state} Quarterly Filing</h4>
                        <p className="text-sm text-muted-foreground">
                          {state.filingFrequency} • {state.employees} employees
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-blue-600">{state.nextFiling}</div>
                      <div className="text-sm text-muted-foreground">
                        {Math.ceil((new Date(state.nextFiling).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days remaining
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Alert className="mt-6">
                <Zap className="h-4 w-4" />
                <AlertDescription>
                  <strong>AI Sync Available:</strong> Synchronize all state filings to the same date to save time and reduce complexity. 
                  Estimated time savings: 4 hours per month.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}