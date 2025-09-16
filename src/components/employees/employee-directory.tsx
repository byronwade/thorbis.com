"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";

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
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/components/ui/avatar';

import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  Calendar,
  DollarSign,
  Eye,
  Edit,
  MessageCircle,
  FileUser,
  Users,
  TrendingUp,
  Brain
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';


// Mock employee data
const employees = [
  {
    id: "EMP001",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@company.com",
    phone: "(555) 123-4567",
    position: "Senior Software Engineer",
    department: "Engineering",
    hireDate: "2022-03-15",
    salary: 95000,
    status: "active",
    location: "San Francisco, CA",
    manager: "John Smith",
    profileImage: null,
    lastActive: "2024-03-01T14:30:00Z",
    skills: ["React", "TypeScript", "Node.js", "Python"],
    certifications: ["AWS Certified Developer"]
  },
  {
    id: "EMP002",
    firstName: "Mike",
    lastName: "Davis",
    email: "mike.davis@company.com",
    phone: "(555) 234-5678",
    position: "Sales Manager",
    department: "Sales",
    hireDate: "2021-08-20",
    salary: 75000,
    status: "active",
    location: "Austin, TX",
    manager: "Lisa Chen",
    profileImage: null,
    lastActive: "2024-03-01T16:45:00Z",
    skills: ["CRM", "Lead Generation", "Negotiation", "Salesforce"],
    certifications: ["Salesforce Certified Administrator"]
  },
  {
    id: "EMP003",
    firstName: "Lisa",
    lastName: "Chen",
    email: "lisa.chen@company.com",
    phone: "(555) 345-6789",
    position: "Marketing Director",
    department: "Marketing",
    hireDate: "2020-11-10",
    salary: 85000,
    status: "active",
    location: "New York, NY",
    manager: "David Wilson",
    profileImage: null,
    lastActive: "2024-03-01T12:15:00Z",
    skills: ["Digital Marketing", "Analytics", "Brand Management", "SEO"],
    certifications: ["Google Analytics Certified", "HubSpot Marketing"]
  },
  {
    id: "EMP004",
    firstName: "David",
    lastName: "Wilson",
    email: "david.wilson@company.com",
    phone: "(555) 456-7890",
    position: "VP of Operations",
    department: "Operations",
    hireDate: "2019-05-05",
    salary: 110000,
    status: "active",
    location: "Seattle, WA",
    manager: "CEO",
    profileImage: null,
    lastActive: "2024-03-01T09:30:00Z",
    skills: ["Operations Management", "Process Improvement", "Leadership", "Strategic Planning"],
    certifications: ["PMP Certified", "Six Sigma Black Belt"]
  }
];

export function EmployeeDirectory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedEmployee, setSelectedEmployee] = useState(employees[0]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const matchesSearch = 
        employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDepartment = departmentFilter === "all" || employee.department === departmentFilter;
      const matchesStatus = statusFilter === "all" || employee.status === statusFilter;
      
      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [searchTerm, departmentFilter, statusFilter]);

  const departments = [...new Set(employees.map(emp => emp.department))];
  
  const getInitials = (firstName: string, lastName: string) => {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  };

  const stats = {
    totalEmployees: employees.length,
    activeEmployees: employees.filter(emp => emp.status === "active").length,
    departments: departments.length,
    averageTenure: 2.8
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Employee Directory</h1>
          <p className="text-muted-foreground mt-2">
            Complete employee database with AI-powered search and analytics
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Directory
          </Button>
          <Button className="bg-gradient-to-r from-payroll-primary to-payroll-secondary">
            <Plus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        </div>
      </div>

      {/* AI Directory Assistant */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
              <Brain className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">Smart Directory Assistant</h3>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                AI-powered search • Skill matching • Org chart insights • Contact recommendations
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-right">
            <div>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.activeEmployees}</div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Active Employees</div>
            </div>
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
                  <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
                  <p className="text-2xl font-bold">{stats.totalEmployees}</p>
                  <p className="text-xs text-green-600">+2 this month</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Active Employees</p>
                  <p className="text-2xl font-bold text-green-600">{stats.activeEmployees}</p>
                  <p className="text-xs text-muted-foreground">100% active rate</p>
                </div>
                <User className="h-8 w-8 text-muted-foreground" />
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
                  <p className="text-sm font-medium text-muted-foreground">Departments</p>
                  <p className="text-2xl font-bold text-payroll-primary">{stats.departments}</p>
                  <p className="text-xs text-muted-foreground">Cross-functional teams</p>
                </div>
                <Building2 className="h-8 w-8 text-muted-foreground" />
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
                  <p className="text-sm font-medium text-muted-foreground">Avg Tenure</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.averageTenure} yrs</p>
                  <p className="text-xs text-purple-600">Above industry avg</p>
                </div>
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search Employees</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Name, email, position, ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="department">Department</Label>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end space-x-2">
              <Button variant="outline" className="flex-1">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map((employee, index) => (
          <motion.div
            key={employee.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={employee.profileImage || undefined} alt={'${employee.firstName} ${employee.lastName}'} />
                    <AvatarFallback className="text-lg font-semibold">
                      {getInitials(employee.firstName, employee.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg truncate">
                        {employee.firstName} {employee.lastName}
                      </h3>
                      <Badge variant={employee.status === "active" ? "default" : "secondary"} className="text-xs">
                        {employee.status}
                      </Badge>
                    </div>
                    
                    <p className="text-muted-foreground text-sm mb-1 truncate">{employee.position}</p>
                    <p className="text-muted-foreground text-xs mb-3">{employee.department}</p>
                    
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <Mail className="h-3 w-3 mr-2" />
                        <span className="truncate">{employee.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-3 w-3 mr-2" />
                        <span>{employee.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-2" />
                        <span>{employee.location}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-2" />
                        <span>Hired {formatDate(employee.hireDate)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {employee.skills.slice(0, 2).map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {employee.skills.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{employee.skills.length - 2} more
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex space-x-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedEmployee(employee)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle className="flex items-center">
                              <Avatar className="h-10 w-10 mr-3">
                                <AvatarFallback>
                                  {getInitials(selectedEmployee.firstName, selectedEmployee.lastName)}
                                </AvatarFallback>
                              </Avatar>
                              {selectedEmployee.firstName} {selectedEmployee.lastName}
                            </DialogTitle>
                            <DialogDescription>
                              {selectedEmployee.position} • {selectedEmployee.department}
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-semibold mb-3">Contact Information</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center">
                                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                                  <span>{selectedEmployee.email}</span>
                                </div>
                                <div className="flex items-center">
                                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                                  <span>{selectedEmployee.phone}</span>
                                </div>
                                <div className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                                  <span>{selectedEmployee.location}</span>
                                </div>
                                <div className="flex items-center">
                                  <User className="h-4 w-4 mr-2 text-muted-foreground" />
                                  <span>Manager: {selectedEmployee.manager}</span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold mb-3">Employment Details</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Employee ID:</span>
                                  <span className="font-medium">{selectedEmployee.id}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Hire Date:</span>
                                  <span className="font-medium">{formatDate(selectedEmployee.hireDate)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Salary:</span>
                                  <span className="font-medium">{formatCurrency(selectedEmployee.salary)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Status:</span>
                                  <Badge variant={selectedEmployee.status === "active" ? "default" : "secondary"}>
                                    {selectedEmployee.status}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mt-6">
                            <h4 className="font-semibold mb-3">Skills & Certifications</h4>
                            <div className="grid grid-cols-2 gap-6">
                              <div>
                                <h5 className="font-medium mb-2 text-sm">Skills</h5>
                                <div className="flex flex-wrap gap-1">
                                  {selectedEmployee.skills.map((skill) => (
                                    <Badge key={skill} variant="outline" className="text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              
                              <div>
                                <h5 className="font-medium mb-2 text-sm">Certifications</h5>
                                <div className="flex flex-wrap gap-1">
                                  {selectedEmployee.certifications.map((cert) => (
                                    <Badge key={cert} variant="secondary" className="text-xs">
                                      {cert}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end space-x-2 mt-6">
                            <Button variant="outline">
                              <MessageCircle className="mr-2 h-4 w-4" />
                              Message
                            </Button>
                            <Button variant="outline">
                              <FileUser className="mr-2 h-4 w-4" />
                              View Profile
                            </Button>
                            <Button>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Employee
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Button size="sm" variant="ghost">
                        <MessageCircle className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredEmployees.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Employees Found</h3>
            <p className="text-muted-foreground mb-4">
              No employees match your current search criteria.
            </p>
            <Button onClick={() => {
              setSearchTerm("");
              setDepartmentFilter("all");
              setStatusFilter("all");
            }}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}