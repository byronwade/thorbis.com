"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  UserPlus,
  DollarSign,
  Clock,
  Calendar,
  FileText,
  Building2,
  AlertCircle,
  CheckCircle,
  Search,
  Eye,
  Edit,
  Settings,
  MoreHorizontal,
  Mail,
  Phone
} from "lucide-react"

// Sample employee data
const sampleEmployees = [
  {
    id: "emp-001",
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
    totalHours: 168,
    overtimeHours: 8,
    ptoBalance: 18.5,
    benefits: {
      healthPlan: "Premium",
      retirement401k: true,
      paidTimeOff: 22
    }
  },
  {
    id: "emp-002",
    firstName: "Michael",
    lastName: "Rodriguez",
    email: "m.rodriguez@company.com",
    phone: "(555) 234-5678",
    position: "Field Technician",
    department: "Field Services",
    hireDate: "2021-11-08",
    status: "active",
    hourlyRate: 24.75,
    avatar: "/professional-asian-man-headshot.png",
    totalHours: 172,
    overtimeHours: 12,
    ptoBalance: 15.0,
    benefits: {
      healthPlan: "Basic",
      retirement401k: true,
      paidTimeOff: 18
    }
  },
  {
    id: "emp-003",
    firstName: "Emily",
    lastName: "Chen",
    email: "emily.chen@company.com",
    phone: "(555) 345-6789",
    position: "Customer Success Manager",
    department: "Customer Service",
    hireDate: "2023-01-20",
    status: "active",
    hourlyRate: 26.00,
    avatar: "/professional-woman-ux-designer.png",
    totalHours: 160,
    overtimeHours: 0,
    ptoBalance: 12.5,
    benefits: {
      healthPlan: "Premium",
      retirement401k: false,
      paidTimeOff: 15
    }
  },
  {
    id: "emp-004",
    firstName: "David",
    lastName: "Thompson",
    email: "david.thompson@company.com",
    phone: "(555) 456-7890",
    position: "Senior Technician",
    department: "Field Services",
    hireDate: "2020-05-12",
    status: "active",
    hourlyRate: 31.25,
    avatar: "/professional-headshot.png",
    totalHours: 176,
    overtimeHours: 16,
    ptoBalance: 24.0,
    benefits: {
      healthPlan: "Family",
      retirement401k: true,
      paidTimeOff: 25
    }
  },
  {
    id: "emp-005",
    firstName: "Lisa",
    lastName: "Wang",
    email: "lisa.wang@company.com",
    phone: "(555) 567-8901",
    position: "HR Coordinator",
    department: "Human Resources",
    hireDate: "2022-08-03",
    status: "on-leave",
    hourlyRate: 23.50,
    avatar: "/professional-product-manager.png",
    totalHours: 120,
    overtimeHours: 0,
    ptoBalance: 8.5,
    benefits: {
      healthPlan: "Premium",
      retirement401k: true,
      paidTimeOff: 20
    }
  }
]

// Sample payroll data
const generatePayrollData = () => {
  return sampleEmployees.map(emp => ({
    id: `pay-${emp.id}`,
    employeeId: emp.id,
    period: "2024-02",
    hoursWorked: emp.totalHours,
    overtimeHours: emp.overtimeHours,
    grossPay: (emp.totalHours * emp.hourlyRate) + (emp.overtimeHours * emp.hourlyRate * 1.5),
    deductions: Math.floor(Math.random() * 500) + 200,
    status: Math.random() > 0.3 ? "approved" : "pending"
  }))
}

export default function EmployeeManagement() {
  const [currentTab, setCurrentTab] = useState("overview")
  const [employees] = useState(sampleEmployees)
  const [payrollData] = useState(generatePayrollData())
  const [searchTerm, setSearchTerm] = useState("")

  // Calculate metrics
  const metrics = {
    totalEmployees: employees.length,
    activeEmployees: employees.filter(emp => emp.status === "active").length,
    onLeaveEmployees: employees.filter(emp => emp.status === "on-leave").length,
    totalPayroll: payrollData.reduce((sum, pay) => sum + (pay.grossPay - pay.deductions), 0),
    pendingPayroll: payrollData.filter(pay => pay.status === "pending").length,
    avgHourlyRate: employees.reduce((sum, emp) => sum + emp.hourlyRate, 0) / employees.length,
    totalHoursWorked: employees.reduce((sum, emp) => sum + emp.totalHours, 0),
    totalOvertimeHours: employees.reduce((sum, emp) => sum + emp.overtimeHours, 0)
  }

  const filteredEmployees = employees.filter(emp => 
    emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.position.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold">{metrics.totalEmployees}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-success">{metrics.activeEmployees}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Payroll</p>
                <p className="text-2xl font-bold">${Math.floor(metrics.totalPayroll).toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Hourly Rate</p>
                <p className="text-2xl font-bold">${metrics.avgHourlyRate.toFixed(2)}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Department Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {["Operations", "Field Services", "Customer Service", "Human Resources"].map(dept => {
                const deptEmployees = employees.filter(emp => emp.department === dept)
                const percentage = (deptEmployees.length / employees.length) * 100
                return (
                  <div key={dept} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{dept}</span>
                      <span>{deptEmployees.length} employees</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Payroll Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Approved Payroll</span>
                <div className="flex items-center gap-2">
                  <Badge variant="default">{payrollData.filter(p => p.status === "approved").length}</Badge>
                  <span className="text-sm font-medium">
                    ${payrollData.filter(p => p.status === "approved").reduce((sum, pay) => sum + (pay.grossPay - pay.deductions), 0).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Pending Approval</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{payrollData.filter(p => p.status === "pending").length}</Badge>
                  <span className="text-sm font-medium">
                    ${payrollData.filter(p => p.status === "pending").reduce((sum, pay) => sum + (pay.grossPay - pay.deductions), 0).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Hours Worked</span>
                <span className="text-sm font-medium">{metrics.totalHoursWorked} hrs</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Overtime Hours</span>
                <span className="text-sm font-medium text-warning">{metrics.totalOvertimeHours} hrs</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common HR tasks and operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <UserPlus className="h-6 w-6" />
              Add Employee
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <DollarSign className="h-6 w-6" />
              Process Payroll
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Calendar className="h-6 w-6" />
              Manage PTO
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <FileText className="h-6 w-6" />
              Generate Reports
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderEmployeeDirectory = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Employee Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map(employee => (
          <Card key={employee.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={employee.avatar} />
                    <AvatarFallback>
                      {employee.firstName[0]}{employee.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{employee.firstName} {employee.lastName}</h3>
                    <p className="text-sm text-muted-foreground">{employee.position}</p>
                  </div>
                </div>
                <Badge variant={
                  employee.status === "active" ? "default" :
                  employee.status === "on-leave" ? "secondary" : "destructive"
                }>
                  {employee.status.replace('-', ' ')}
                </Badge>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  <span className="truncate">{employee.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  <span>{employee.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-3 w-3" />
                  <span>{employee.department}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground">Hourly Rate</span>
                    <div className="font-semibold">${employee.hourlyRate}/hr</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">PTO Balance</span>
                    <div className="font-semibold">{employee.ptoBalance} days</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button size="sm" variant="outline">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderPayroll = () => (
    <div className="space-y-6">
      {/* Payroll Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Payroll</p>
                <p className="text-2xl font-bold">${Math.floor(metrics.totalPayroll).toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Approvals</p>
                <p className="text-2xl font-bold text-warning">{metrics.pendingPayroll}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Hours</p>
                <p className="text-2xl font-bold">{metrics.totalHoursWorked}</p>
              </div>
              <Clock className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payroll Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payroll Details - February 2024</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Employee</th>
                  <th className="text-left p-2">Hours</th>
                  <th className="text-left p-2">Overtime</th>
                  <th className="text-left p-2">Gross Pay</th>
                  <th className="text-left p-2">Deductions</th>
                  <th className="text-left p-2">Net Pay</th>
                  <th className="text-left p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {payrollData.map(pay => {
                  const employee = employees.find(emp => emp.id === pay.employeeId)
                  const netPay = pay.grossPay - pay.deductions
                  return (
                    <tr key={pay.id} className="border-b hover:bg-muted/50">
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={employee?.avatar} />
                            <AvatarFallback className="text-xs">
                              {employee?.firstName[0]}{employee?.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span>{employee?.firstName} {employee?.lastName}</span>
                        </div>
                      </td>
                      <td className="p-2">{pay.hoursWorked}</td>
                      <td className="p-2">{pay.overtimeHours}</td>
                      <td className="p-2">${pay.grossPay.toFixed(2)}</td>
                      <td className="p-2">${pay.deductions.toFixed(2)}</td>
                      <td className="p-2 font-semibold">${netPay.toFixed(2)}</td>
                      <td className="p-2">
                        <Badge variant={pay.status === "approved" ? "default" : "outline"}>
                          {pay.status}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
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
          <h1 className="text-3xl font-bold flex items-center">
            <Users className="h-8 w-8 mr-3 text-primary" />
            Employee Management
          </h1>
          <p className="text-muted-foreground">
            Comprehensive HR management for your business operations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            HR Settings
          </Button>
          <Button size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="employees">Employee Directory</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="employees" className="space-y-6">
          {renderEmployeeDirectory()}
        </TabsContent>

        <TabsContent value="payroll" className="space-y-6">
          {renderPayroll()}
        </TabsContent>
      </Tabs>
    </div>
  )
}
