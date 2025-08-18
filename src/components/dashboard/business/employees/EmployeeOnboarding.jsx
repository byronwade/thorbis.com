"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  UserPlus,
  CheckCircle,
  Clock,
  FileText,
  Heart,
  Shield,
  AlertCircle,
  User,
  Briefcase
} from "lucide-react"

export default function EmployeeOnboarding() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    personalInfo: {},
    employmentInfo: {},
    benefits: {},
    documents: {}
  })

  // Sample onboarding checklist data
  const onboardingSteps = [
    {
      id: 1,
      title: "Personal Information",
      description: "Basic employee details and contact information",
      icon: User,
      status: "completed"
    },
    {
      id: 2,
      title: "Employment Details",
      description: "Position, department, and compensation information",
      icon: Briefcase,
      status: "in_progress"
    },
    {
      id: 3,
      title: "Benefits Enrollment",
      description: "Health insurance, retirement, and other benefits",
      icon: Heart,
      status: "pending"
    },
    {
      id: 4,
      title: "Documentation",
      description: "Required forms and legal documents",
      icon: FileText,
      status: "pending"
    },
    {
      id: 5,
      title: "Account Setup",
      description: "System access and security setup",
      icon: Shield,
      status: "pending"
    }
  ]

  // Sample new hires
  const newHires = [
    {
      id: "nh-001",
      name: "Alex Thompson",
      position: "Field Technician",
      department: "Operations",
      startDate: "2024-02-15",
      progress: 75,
      status: "in_progress",
      avatar: "/professional-headshot.png",
      completedSteps: 3,
      totalSteps: 5,
      assignedTo: "Sarah Johnson"
    },
    {
      id: "nh-002",
      name: "Maria Garcia",
      position: "Customer Service Rep",
      department: "Customer Service",
      startDate: "2024-02-20",
      progress: 25,
      status: "pending",
      avatar: "/professional-woman-ux-designer.png",
      completedSteps: 1,
      totalSteps: 5,
      assignedTo: "Lisa Wang"
    },
    {
      id: "nh-003",
      name: "James Wilson",
      position: "Senior Technician",
      department: "Field Services",
      startDate: "2024-02-12",
      progress: 100,
      status: "completed",
      avatar: "/professional-product-manager.png",
      completedSteps: 5,
      totalSteps: 5,
      assignedTo: "Michael Rodriguez"
    }
  ]

  const renderOnboardingProgress = () => (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">New Hires</p>
                <p className="text-2xl font-bold">{newHires.length}</p>
              </div>
              <UserPlus className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-orange-600">
                  {newHires.filter(h => h.status === "in_progress").length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {newHires.filter(h => h.status === "completed").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Progress</p>
                <p className="text-2xl font-bold">
                  {Math.floor(newHires.reduce((acc, hire) => acc + hire.progress, 0) / newHires.length)}%
                </p>
              </div>
              <FileText className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Hires List */}
      <Card>
        <CardHeader>
          <CardTitle>Current Onboarding</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {newHires.map(hire => (
              <div key={hire.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={hire.avatar} />
                      <AvatarFallback>
                        {hire.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{hire.name}</h3>
                      <p className="text-sm text-muted-foreground">{hire.position} • {hire.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={
                      hire.status === "completed" ? "default" :
                      hire.status === "in_progress" ? "secondary" : "outline"
                    }>
                      {hire.status.replace('_', ' ')}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Start: {new Date(hire.startDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress ({hire.completedSteps}/{hire.totalSteps} steps)</span>
                    <span>{hire.progress}%</span>
                  </div>
                  <Progress value={hire.progress} className="h-2" />
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Assigned to: {hire.assignedTo}</span>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderOnboardingChecklist = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Onboarding Checklist Template</CardTitle>
          <p className="text-sm text-muted-foreground">
            Standard steps for new employee onboarding process
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {onboardingSteps.map((step, idx) => {
              const Icon = step.icon
              const isActive = currentStep === step.id
              return (
                <div
                  key={step.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    isActive ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                  }`}
                  onClick={() => setCurrentStep(step.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      step.status === "completed" ? "bg-green-100 text-green-600" :
                      step.status === "in_progress" ? "bg-blue-100 text-blue-600" : 
                      "bg-gray-100 text-gray-600"
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        step.status === "completed" ? "default" :
                        step.status === "in_progress" ? "secondary" : "outline"
                      }>
                        {step.status.replace('_', ' ')}
                      </Badge>
                      {step.status === "completed" && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      {step.status === "in_progress" && (
                        <Clock className="h-5 w-5 text-blue-500" />
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step Details */}
      {currentStep && (
        <Card>
          <CardHeader>
            <CardTitle>Step {currentStep} Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h4 className="font-medium">Personal Information Required:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Full legal name
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Contact information (phone, email, address)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Emergency contact details
                    </li>
                    <li className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      Social Security Number (for payroll)
                    </li>
                  </ul>
                </div>
              )}
              
              {currentStep === 2 && (
                <div className="space-y-4">
                  <h4 className="font-medium">Employment Details:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      Job title and department assignment
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      Salary/hourly rate confirmation
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      Work schedule and location
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      Reporting structure
                    </li>
                  </ul>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <h4 className="font-medium">Benefits Enrollment:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      Health insurance plan selection
                    </li>
                    <li className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      401(k) enrollment and contribution setup
                    </li>
                    <li className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      Life and disability insurance
                    </li>
                    <li className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      PTO policy acknowledgment
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <UserPlus className="h-6 w-6 mr-3 text-primary" />
            Employee Onboarding
          </h1>
          <p className="text-muted-foreground">
            Manage new employee onboarding process and checklist
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Templates
          </Button>
          <Button size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Add New Hire
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {renderOnboardingProgress()}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {renderOnboardingChecklist()}
        </div>
      </div>
    </div>
  )
}
