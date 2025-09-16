"use client";

import React, { useState } from "react";

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

import { Label } from '@/components/ui/label';

import { Checkbox } from '@/components/ui/checkbox';

import {
  Alert,
  AlertDescription
} from '@/components/ui/alert';
// Removed Tabs and Dialog imports per overlay-free design guidelines
import {
  Brain,
  CheckCircle,
  Clock,
  FileText,
  Mail,
  Plus,
  Send,
  Shield,
  Upload,
  User,
  Users,
  Zap,
  AlertCircle,
  Calendar,
  Building2,
  CreditCard,
  Phone,
  MapPin,
  Briefcase,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';


const onboardingSteps = [
  {
    id: "personal",
    title: "Personal Information",
    description: "Basic employee details and contact information",
    status: "completed",
    aiAssisted: true
  },
  {
    id: "employment",
    title: "Employment Details",
    description: "Job title, department, salary, and start date",
    status: "completed",
    aiAssisted: true
  },
  {
    id: "tax",
    title: "Tax Information",
    description: "W-4 form and withholding preferences",
    status: "in-progress",
    aiAssisted: true
  },
  {
    id: "benefits",
    title: "Benefits Enrollment",
    description: "Health insurance, retirement, and other benefits",
    status: "pending",
    aiAssisted: true
  },
  {
    id: "documents",
    title: "Document Verification",
    description: "I-9 verification and document uploads",
    status: "pending",
    aiAssisted: true
  },
  {
    id: "setup",
    title: "Account Setup",
    description: "Direct deposit, employee portal, and system access",
    status: "pending",
    aiAssisted: false
  }
];

const newEmployees = [
  {
    id: 1,
    name: "Alex Rodriguez",
    email: "alex.rodriguez@company.com",
    department: "Engineering",
    position: "Senior Software Engineer",
    startDate: "2024-03-01",
    status: "in-progress",
    completionRate: 65,
    aiRecommendations: 3,
    currentStep: "tax"
  },
  {
    id: 2,
    name: "Sarah Kim",
    email: "sarah.kim@company.com",
    department: "Marketing",
    position: "Marketing Manager",
    startDate: "2024-03-15",
    status: "pending",
    completionRate: 20,
    aiRecommendations: 5,
    currentStep: "personal"
  },
  {
    id: 3,
    name: "Michael Chen",
    email: "michael.chen@company.com",
    department: "Sales",
    position: "Account Executive",
    startDate: "2024-02-28",
    status: "completed",
    completionRate: 100,
    aiRecommendations: 0,
    currentStep: "completed"
  }
];

const aiRecommendations = [
  {
    employee: "Alex Rodriguez",
    type: "tax-optimization",
    title: "W-4 Withholding Optimization",
    description: "Based on similar roles and filing status, recommend 2 allowances to optimize take-home pay",
    confidence: 94.5,
    impact: "medium"
  },
  {
    employee: "Sarah Kim",
    type: "benefits",
    title: "Health Plan Recommendation",
    description: "PPO plan recommended based on family size and medical history patterns",
    confidence: 87.2,
    impact: "high"
  },
  {
    employee: "Alex Rodriguez",
    type: "compliance",
    title: "I-9 Document Requirements",
    description: "Driver's license + Social Security card combination will satisfy I-9 requirements",'
    confidence: 99.1,
    impact: "high"
  }
];

export function EmployeeOnboarding() {
  const [selectedEmployee, setSelectedEmployee] = useState(newEmployees[0]);
  const [isProcessingStep, setIsProcessingStep] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(2);
  const [showAddPanel, setShowAddPanel] = useState(false);

  const handleCompleteStep = async () => {
    setIsProcessingStep(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessingStep(false);
    
    if (currentStepIndex < onboardingSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const currentStep = onboardingSteps[currentStepIndex];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Employee Onboarding</h1>
          <p className="text-muted-foreground mt-2">
            AI-powered onboarding with compliance-first workflows
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Onboarding Templates
          </Button>
          <Button onClick={() => setShowAddPanel((v) => !v)}>
            <Plus className="mr-2 h-4 w-4" />
            {showAddPanel ? "Close" : "New Employee"}
          </Button>
        </div>
      </div>

      {/* AI status banner (no gradients) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg p-4 border bg-neutral-900"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-blue-500/10">
              <Brain className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold">AI Onboarding Assistant</h3>
              <p className="text-sm text-muted-foreground">
                3 in progress • 87% automated • 8 AI recommendations
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              <CheckCircle className="mr-1 h-3 w-3" />
              Compliant
            </Badge>
            <Badge variant="outline">
              <Zap className="mr-1 h-3 w-3" />
              AI-Powered
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Two-pane layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: employees list and add panel */}
        <aside className="lg:col-span-4 space-y-4">
          {showAddPanel && (
            <Card>
              <CardHeader>
                <CardTitle>Add New Employee</CardTitle>
                <CardDescription>Start onboarding for a new team member</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="Enter first name" />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Enter last name" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="employee@company.com" />
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                        <SelectItem value="operations">Operations</SelectItem>
                        <SelectItem value="hr">Human Resources</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="position">Position</Label>
                    <Input id="position" placeholder="Job title" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input id="startDate" type="date" />
                  </div>
                  <div>
                    <Label htmlFor="salary">Annual Salary</Label>
                    <Input id="salary" type="number" placeholder="75000" />
                  </div>
                </div>
                <Alert>
                  <Brain className="h-4 w-4" />
                  <AlertDescription>
                    AI will pre-fill forms and generate a personalized checklist.
                  </AlertDescription>
                </Alert>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowAddPanel(false)}>Cancel</Button>
                  <Button>
                    <Zap className="mr-2 h-4 w-4" />
                    Start AI Onboarding
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Active Employees</CardTitle>
              <CardDescription>Select an employee to view progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {newEmployees.filter(e => e.status !== "completed").map((employee) => {
                const selected = selectedEmployee.id === employee.id
                return (
                  <button
                    key={employee.id}
                    onClick={() => setSelectedEmployee(employee)}
                    className={'w-full text-left border rounded-lg p-3 transition-colors ${selected ? 'border-blue-500 bg-blue-500/10' : 'hover:bg-muted`} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-900'}'
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-blue-500" />
                          <h4 className="font-medium truncate">{employee.name}</h4>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {employee.position} • {employee.department}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Current: {employee.currentStep}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-semibold">{employee.completionRate}%</div>
                        <Progress value={employee.completionRate} className="w-24 h-2" />
                      </div>
                    </div>
                  </button>
                )
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">AI Recommendations</CardTitle>
              <CardDescription>Automated insights across employees</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {aiRecommendations.map((rec, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-start gap-3">
                    <div className={'p-2 rounded-full ${
                      rec.type === 'tax-optimization' ? 'bg-green-100 dark:bg-green-900/20' : rec.type === 'benefits' ? 'bg-blue-100 dark:bg-blue-900/20' : 'bg-purple-100 dark:bg-purple-900/20'
              }'}>'
                      {rec.type === 'tax-optimization' ? (
                        <CreditCard className="h-4 w-4 text-green-600" />
                      ) : rec.type === 'benefits' ? (
                        <Shield className="h-4 w-4 text-blue-600" />
                      ) : (
                        <FileText className="h-4 w-4 text-purple-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="font-medium truncate">{rec.title}</h4>
                          <p className="text-xs text-muted-foreground truncate">{rec.employee}</p>
                        </div>
                        <Badge variant={rec.impact === 'high' ? 'default' : 'secondary'}>{rec.impact}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                      <div className="flex gap-2 mt-2">
                        <Button size="sm">Apply</Button>
                        <Button size="sm" variant="outline">Learn More</Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </aside>

        {/* Right: stepper and details */}
        <section className="lg:col-span-8 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                {selectedEmployee.name} — Onboarding Progress
              </CardTitle>
              <CardDescription>Step {currentStepIndex + 1} of {onboardingSteps.length}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                <div>
                  <p className="text-sm text-muted-foreground">Overall</p>
                  <div className="text-xl font-semibold text-blue-500">{selectedEmployee.completionRate}%</div>
                </div>
                <Progress value={selectedEmployee.completionRate} className="w-40 h-2" />
              </div>

              <div className="space-y-3">
                {onboardingSteps.map((step, index) => (
                  <div
                    key={step.id}
                    className={'p-3 rounded-md border ${
                      index === currentStepIndex
                        ? 'border-blue-500 bg-blue-500/10'
                        : step.status === 'completed'
                        ? 'border-green-500 bg-green-500/10'
                        : 'border-border`
              }'}'
                  >
                    <div className="flex items-center gap-3">
                      <div className={'p-2 rounded-full ${
                        step.status === 'completed' ? 'bg-green-500/10' : index === currentStepIndex ? 'bg-blue-500/10' : 'bg-muted'
              }'}>'
                        {step.status === 'completed' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : index === currentStepIndex ? (
                          <Clock className="h-4 w-4 text-blue-500" />
                        ) : (
                          <div className="h-4 w-4 rounded-full bg-muted-foreground/30" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium truncate">{step.title}</h4>
                          {step.aiAssisted && (
                            <Badge variant="outline" className="text-xs">
                              <Brain className="mr-1 h-3 w-3" /> AI
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{step.description}</p>
                      </div>
                      {index === currentStepIndex && (
                        <Button onClick={handleCompleteStep} disabled={isProcessingStep} size="sm">
                          {isProcessingStep ? (
                            <>
                              <Clock className="mr-2 h-3 w-3 animate-spin" /> Processing
                            </>
                          ) : (
                            <>Complete Step</>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5" /> {currentStep.title}
                  </CardTitle>
                  <CardDescription>{currentStep.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {currentStep.id === 'tax' && (
                    <div className="space-y-4">
                      <Alert>
                        <Brain className="h-4 w-4" />
                        <AlertDescription>
                          AI has pre-filled this W-4 form based on similar profiles. Review and confirm.
                        </AlertDescription>
                      </Alert>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="filingStatus">Filing Status</Label>
                          <Select defaultValue="single">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="single">Single</SelectItem>
                              <SelectItem value="married-jointly">Married Filing Jointly</SelectItem>
                              <SelectItem value="married-separately">Married Filing Separately</SelectItem>
                              <SelectItem value="head">Head of Household</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="allowances">Allowances</Label>
                          <Input id="allowances" type="number" defaultValue="2" />
                          <p className="text-xs text-muted-foreground mt-1">AI recommends 2 allowances</p>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="additionalWithholding">Additional Withholding</Label>
                        <Input id="additionalWithholding" type="number" placeholder="0.00" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox id="exempt" />
                        <Label htmlFor="exempt">Claim exempt status</Label>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
}