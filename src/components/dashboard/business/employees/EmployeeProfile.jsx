"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
  DollarSign,
  Clock,
  Heart,
  FileText,
  Edit,
  Save,
  X,
  CheckCircle,
  TrendingUp,
  Award,
  Target
} from "lucide-react"

export default function EmployeeProfile({ employeeId, onClose }) {
  const [isEditing, setIsEditing] = useState(false)
  const [currentTab, setCurrentTab] = useState("overview")

  // Sample employee data - would come from API
  const employee = {
    id: employeeId || "emp-001",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@company.com",
    phone: "(555) 123-4567",
    position: "Operations Manager",
    department: "Operations",
    hireDate: "2022-03-15",
    status: "active",
    hourlyRate: 28.50,
    avatar: "/professional-woman-headshot.png",
    address: {
      street: "123 Main Street",
      city: "Springfield",
      state: "IL",
      zipCode: "62701"
    },
    emergencyContact: {
      name: "Michael Johnson",
      relationship: "Spouse",
      phone: "(555) 234-5678"
    },
    benefits: {
      healthPlan: "Premium",
      retirement401k: true,
      paidTimeOff: 22,
      lifeInsurance: true,
      dentalInsurance: true,
      visionInsurance: true
    },
    performance: {
      rating: 4.8,
      goals: 12,
      completed: 10,
      reviews: 3,
      certifications: 5
    },
    timeTracking: {
      hoursThisWeek: 42,
      hoursThisMonth: 168,
      overtimeHours: 8,
      ptoUsed: 3.5,
      ptoRemaining: 18.5
    },
    skills: [
      { name: "Project Management", level: 90 },
      { name: "Team Leadership", level: 85 },
      { name: "Process Optimization", level: 88 },
      { name: "Customer Service", level: 92 },
      { name: "Data Analysis", level: 78 }
    ]
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Employee Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={employee.avatar} />
                <AvatarFallback className="text-lg">
                  {employee.firstName[0]}{employee.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{employee.firstName} {employee.lastName}</h2>
                <p className="text-muted-foreground">{employee.position}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={employee.status === "active" ? "default" : "secondary"}>
                    {employee.status}
                  </Badge>
                  <Badge variant="outline">{employee.department}</Badge>
                </div>
              </div>
            </div>
            <Button 
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "destructive" : "outline"}
            >
              {isEditing ? <X className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
              {isEditing ? "Cancel" : "Edit"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <User className="h-4 w-4" />
                Contact Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {isEditing ? (
                    <Input defaultValue={employee.email} />
                  ) : (
                    <span>{employee.email}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {isEditing ? (
                    <Input defaultValue={employee.phone} />
                  ) : (
                    <span>{employee.phone}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {isEditing ? (
                    <Input defaultValue={`${employee.address.street}, ${employee.address.city}, ${employee.address.state} ${employee.address.zipCode}`} />
                  ) : (
                    <span>{employee.address.street}, {employee.address.city}, {employee.address.state} {employee.address.zipCode}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Employment Details */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Building className="h-4 w-4" />
                Employment Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hire Date:</span>
                  <span>{new Date(employee.hireDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hourly Rate:</span>
                  <span className="font-semibold">${employee.hourlyRate}/hr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Department:</span>
                  <span>{employee.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Years of Service:</span>
                  <span>{Math.floor((new Date() - new Date(employee.hireDate)) / (365 * 24 * 60 * 60 * 1000))} years</span>
                </div>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="mt-6 pt-6 border-t flex gap-2">
              <Button>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Performance Rating</p>
                <p className="text-2xl font-bold">{employee.performance.rating}/5</p>
              </div>
              <Award className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Goals Completed</p>
                <p className="text-2xl font-bold">{employee.performance.completed}/{employee.performance.goals}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Hours This Month</p>
                <p className="text-2xl font-bold">{employee.timeTracking.hoursThisMonth}</p>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">PTO Remaining</p>
                <p className="text-2xl font-bold">{employee.timeTracking.ptoRemaining}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skills Assessment */}
      <Card>
        <CardHeader>
          <CardTitle>Skills & Competencies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {employee.skills.map((skill, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{skill.name}</span>
                  <span>{skill.level}%</span>
                </div>
                <Progress value={skill.level} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderBenefits = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Health & Wellness
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Health Insurance</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Plan:</span>
                  <Badge variant="default">{employee.benefits.healthPlan}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Monthly Premium:</span>
                  <span className="text-sm">$285</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Deductible:</span>
                  <span className="text-sm">$1,500</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Additional Coverage</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Dental Insurance</span>
                  {employee.benefits.dentalInsurance ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Vision Insurance</span>
                  {employee.benefits.visionInsurance ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Life Insurance</span>
                  {employee.benefits.lifeInsurance ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Retirement & Financial
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">401(k) Plan</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Enrollment:</span>
                  <Badge variant={employee.benefits.retirement401k ? "default" : "secondary"}>
                    {employee.benefits.retirement401k ? "Enrolled" : "Not Enrolled"}
                  </Badge>
                </div>
                {employee.benefits.retirement401k && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Employee Contribution:</span>
                      <span className="text-sm">6%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Company Match:</span>
                      <span className="text-sm">3%</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Time Off & Leave
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Annual PTO Allocation</span>
              <span className="font-semibold">{employee.benefits.paidTimeOff} days</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Used This Year</span>
              <span>{employee.timeTracking.ptoUsed} days</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Remaining Balance</span>
              <span className="font-semibold text-green-600">{employee.timeTracking.ptoRemaining} days</span>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h4 className="font-medium">PTO Usage This Year</h4>
              <Progress 
                value={(employee.timeTracking.ptoUsed / employee.benefits.paidTimeOff) * 100} 
                className="h-3" 
              />
              <div className="text-xs text-muted-foreground text-right">
                {((employee.timeTracking.ptoUsed / employee.benefits.paidTimeOff) * 100).toFixed(1)}% used
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Employee Profile</h1>
          <p className="text-muted-foreground">Manage employee information, benefits, and performance</p>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="benefits">Benefits</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="benefits" className="space-y-6">
          {renderBenefits()}
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Performance Reviews</h3>
                <p className="text-muted-foreground">Performance management features coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Employee Documents</h3>
                <p className="text-muted-foreground">Document management features coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
