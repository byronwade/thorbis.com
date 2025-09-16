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

// Avatar component inline since it's not available in UI package'
const Avatar = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={`relative inline-flex items-center justify-center overflow-hidden rounded-full ${className}'}>
    {children}
  </div>
);

const AvatarImage = ({ src }: { src?: string }) => (
  src ? <img src={src} alt="Avatar" className="h-full w-full object-cover" /> : null
);

const AvatarFallback = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={'flex items-center justify-center h-full w-full bg-muted text-muted-foreground ${className}'}>
    {children}
  </div>
);
import { 
  User, 
  Download, 
  Eye, 
  Bell, 
  Settings, 
  CreditCard, 
  FileText, 
  Calendar, 
  Shield, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Edit, 
  Camera, 
  Key, 
  Heart, 
  Brain,
  Star,
  Award,
  Target,
  Briefcase,
  GraduationCap,
  Users,
  Gift,
  Plus,
  Search,
  Filter,
  ChevronRight,
  Home,
  Zap
} from "lucide-react";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
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
import { Switch } from '@/components/ui/switch`;


// Mock employee data
const employeeProfile = {
  id: "EMP001",
  firstName: "Sarah",
  lastName: "Johnson",
  email: "sarah.johnson@company.com",
  phone: "(555) 123-4567",
  avatar: "/avatars/sarah-johnson.jpg",
  position: "Senior Software Engineer",
  department: "Engineering",
  manager: "Alex Chen",
  startDate: "2022-03-15",
  employmentType: "Full-time",
  status: "active",
  address: {
    street: "123 Main Street",
    city: "San Francisco",
    state: "CA",
    zipCode: "94102"
  },
  emergencyContact: {
    name: "John Johnson",
    relationship: "Spouse",
    phone: "(555) 987-6543"
  },
  compensation: {
    baseSalary: 125000,
    hourlyRate: null,
    payFrequency: "bi-weekly",
    nextPayDate: "2024-03-15"
  }
};

const recentPayStubs = [
  {
    id: "PS-2024-006",
    payPeriodStart: "2024-02-15",
    payPeriodEnd: "2024-02-29",
    payDate: "2024-03-01",
    grossPay: 4807.69,
    netPay: 3421.15,
    federalTax: 721.15,
    stateTax: 240.38,
    socialSecurity: 298.08,
    medicare: 69.71,
    benefits: 157.22,
    status: "paid"
  },
  {
    id: "PS-2024-005",
    payPeriodStart: "2024-02-01",
    payPeriodEnd: "2024-02-14",
    payDate: "2024-02-16",
    grossPay: 4807.69,
    netPay: 3421.15,
    federalTax: 721.15,
    stateTax: 240.38,
    socialSecurity: 298.08,
    medicare: 69.71,
    benefits: 157.22,
    status: "paid"
  },
  {
    id: "PS-2024-004",
    payPeriodStart: "2024-01-15",
    payPeriodEnd: "2024-01-31",
    payDate: "2024-02-01",
    grossPay: 4807.69,
    netPay: 3421.15,
    federalTax: 721.15,
    stateTax: 240.38,
    socialSecurity: 298.08,
    medicare: 69.71,
    benefits: 157.22,
    status: "paid"
  }
];

const benefitsSummary = [
  {
    type: "health",
    name: "Health Insurance",
    plan: "Blue Cross PPO",
    coverage: "Employee + Family",
    monthlyPremium: 450.50,
    status: "active",
    icon: Heart
  },
  {
    type: "dental",
    name: "Dental Insurance",
    plan: "Delta Dental",
    coverage: "Employee + Family",
    monthlyPremium: 89.50,
    status: "active",
    icon: Star
  },
  {
    type: "retirement",
    name: "401(k) Plan",
    plan: "Company 401(k)",
    contribution: "8%",
    match: "6%",
    balance: 45670,
    status: "active",
    icon: Target
  },
  {
    type: "life",
    name: "Life Insurance",
    plan: "Basic Life",
    coverage: "2x Annual Salary",
    monthlyPremium: 25.00,
    status: "active",
    icon: Shield
  }
];

const timeOffBalances = [
  {
    type: "pto",
    name: "Paid Time Off",
    available: 18.5,
    used: 5.5,
    total: 24,
    unit: "days"
  },
  {
    type: "sick",
    name: "Sick Leave",
    available: 10,
    used: 2,
    total: 12,
    unit: "days"
  },
  {
    type: "personal",
    name: "Personal Days",
    available: 3,
    used: 1,
    total: 4,
    unit: "days"
  }
];

const notifications = [
  {
    id: "1",
    type: "payroll",
    title: "Pay Stub Available",
    message: "Your pay stub for period Feb 15 - Feb 29 is now available",
    timestamp: "2024-03-01T09:00:00Z",
    read: false,
    priority: "normal"
  },
  {
    id: "2",
    type: "benefits",
    title: "Benefits Enrollment Reminder",
    message: "Open enrollment period ends in 10 days. Review your benefits.",
    timestamp: "2024-02-28T14:30:00Z",
    read: false,
    priority: "high"
  },
  {
    id: "3",
    type: "system",
    title: "Profile Update Required",
    message: "Please update your emergency contact information",
    timestamp: "2024-02-27T11:15:00Z",
    read: true,
    priority: "medium"
  }
];

const yearToDateSummary = {
  grossPay: 28846.14,
  netPay: 20526.90,
  federalTax: 4326.90,
  stateTax: 1442.30,
  socialSecurity: 1788.46,
  medicare: 418.27,
  benefits: 943.44,
  retirement401k: 2307.69
};

export function EmployeePortal() {
  const [selectedPayStub, setSelectedPayStub] = useState(recentPayStubs[0]);
  const [activeNotifications, setActiveNotifications] = useState(notifications);
  const [searchTerm, setSearchTerm] = useState("");
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);

  const unreadNotifications = activeNotifications.filter(n => !n.read).length;

  const markNotificationAsRead = (id: string) => {
    setActiveNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setActiveNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "payroll": return DollarSign;
      case "benefits": return Heart;
      case "system": return Settings;
      default: return Bell;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-600 bg-red-100 dark:bg-red-900/20";
      case "medium": return "text-orange-600 bg-orange-100 dark:bg-orange-900/20";
      default: return "text-blue-600 bg-blue-100 dark:bg-blue-900/20";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with Employee Info */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <Avatar className="h-20 w-20">
              <AvatarImage src={employeeProfile.avatar} />
              <AvatarFallback className="text-xl">
                {employeeProfile.firstName[0]}{employeeProfile.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <Button 
              size="icon" 
              className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
              variant="outline"
            >
              <Camera className="h-3 w-3" />
            </Button>
          </div>
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, {employeeProfile.firstName}!
            </h1>
            <p className="text-muted-foreground mt-2">
              {employeeProfile.position} • {employeeProfile.department}
            </p>
            <div className="flex items-center space-x-4 mt-2">
              <Badge variant="outline" className="text-xs">
                <Briefcase className="mr-1 h-2 w-2" />
                {employeeProfile.employmentType}
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Calendar className="mr-1 h-2 w-2" />
                Started {formatDate(employeeProfile.startDate)}
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Dialog open={showNotificationSettings} onOpenChange={setShowNotificationSettings}>
            <DialogTrigger asChild>
              <Button variant="outline" className="relative">
                <Bell className="mr-2 h-4 w-4" />
                Notifications
                {unreadNotifications > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">
                    {unreadNotifications}
                  </Badge>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  Notifications
                  {unreadNotifications > 0 && (
                    <Button size="sm" variant="outline" onClick={markAllAsRead}>
                      Mark All Read
                    </Button>
                  )}
                </DialogTitle>
                <DialogDescription>
                  Stay updated with important payroll and benefits information
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {activeNotifications.map((notification) => {
                  const Icon = getNotificationIcon(notification.type);
                  return (
                    <div 
                      key={notification.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        !notification.read ? "bg-muted/50" : "hover:bg-muted/30"
                      }`}
                      onClick={() => markNotificationAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full ${getPriorityColor(notification.priority)}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-sm">{notification.title}</h4>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                {notification.priority}
                              </Badge>
                              {!notification.read && (
                                <div className="h-2 w-2 bg-blue-600 rounded-full" />
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDateTime(notification.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={showProfileEdit} onOpenChange={setShowProfileEdit}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
                <DialogDescription>
                  Update your personal information and preferences
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      defaultValue={employeeProfile.firstName}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      defaultValue={employeeProfile.lastName}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue={employeeProfile.email}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      defaultValue={employeeProfile.phone}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    defaultValue={`${employeeProfile.address.street}, ${employeeProfile.address.city}, ${employeeProfile.address.state} ${employeeProfile.address.zipCode}'}
                  />
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Emergency Contact</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="emergencyName">Name</Label>
                      <Input
                        id="emergencyName"
                        defaultValue={employeeProfile.emergencyContact.name}
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergencyPhone">Phone</Label>
                      <Input
                        id="emergencyPhone"
                        type="tel"
                        defaultValue={employeeProfile.emergencyContact.phone}
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="relationship">Relationship</Label>
                    <Input
                      id="relationship"
                      defaultValue={employeeProfile.emergencyContact.relationship}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowProfileEdit(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setShowProfileEdit(false)}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button className="bg-gradient-to-r from-payroll-primary to-payroll-secondary">
            <Settings className="mr-2 h-4 w-4" />
            Account Settings
          </Button>
        </div>
      </div>

      {/* AI Personal Insights Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 rounded-lg p-6 border border-emerald-200 dark:border-emerald-800"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <Brain className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-emerald-900 dark:text-emerald-100">Personal AI Insights</h3>
              <p className="text-emerald-700 dark:text-emerald-300 text-sm">
                Your retirement contributions are optimized • Consider using remaining PTO • Health savings tip available
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 mb-1">
              {formatCurrency(yearToDateSummary.netPay)}
            </div>
            <div className="text-sm text-emerald-700 dark:text-emerald-300">YTD Net Pay</div>
          </div>
        </div>
      </motion.div>

      {/* Quick Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Next Pay Date</p>
                  <p className="text-xl font-bold">{formatDate(employeeProfile.compensation.nextPayDate)}</p>
                  <p className="text-xs text-blue-600">In 3 days</p>
                </div>
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Available PTO</p>
                  <p className="text-xl font-bold">{timeOffBalances[0].available}</p>
                  <p className="text-xs text-green-600">of {timeOffBalances[0].total} days</p>
                </div>
                <Gift className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">401(k) Balance</p>
                  <p className="text-xl font-bold">{formatCurrency(benefitsSummary[2].balance)}</p>
                  <p className="text-xs text-payroll-primary">8% contribution</p>
                </div>
                <Target className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">YTD Gross Pay</p>
                  <p className="text-xl font-bold">{formatCurrency(yearToDateSummary.grossPay)}</p>
                  <p className="text-xs text-green-600">+12% vs last year</p>
                </div>
                <DollarSign className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="paystubs" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="paystubs">Pay Stubs</TabsTrigger>
          <TabsTrigger value="benefits">Benefits</TabsTrigger>
          <TabsTrigger value="timeoff">Time Off</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="tax">Tax Info</TabsTrigger>
        </TabsList>

        <TabsContent value="paystubs" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Pay Stubs List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Recent Pay Stubs
                </CardTitle>
                <CardDescription>
                  View and download your recent pay stubs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentPayStubs.map((stub) => (
                  <div
                    key={stub.id}
                    className={'p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                      selectedPayStub.id === stub.id ? "border-payroll-primary bg-payroll-primary/5" : ""
                    }'}
                    onClick={() => setSelectedPayStub(stub)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold">{stub.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(stub.payPeriodStart)} - {formatDate(stub.payPeriodEnd)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">
                          {formatCurrency(stub.netPay)}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          <CheckCircle className="mr-1 h-2 w-2" />
                          {stub.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Gross: {formatCurrency(stub.grossPay)}</span>
                      <Button size="sm" variant="outline">
                        <Download className="mr-2 h-3 w-3" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Pay Stub Detail */}
            <Card>
              <CardHeader>
                <CardTitle>Pay Stub Details</CardTitle>
                <CardDescription>
                  Detailed breakdown for {selectedPayStub.id}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Pay Period Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-muted-foreground">Pay Period:</span>
                      <p>{formatDate(selectedPayStub.payPeriodStart)} - {formatDate(selectedPayStub.payPeriodEnd)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Pay Date:</span>
                      <p>{formatDate(selectedPayStub.payDate)}</p>
                    </div>
                  </div>

                  {/* Earnings */}
                  <div>
                    <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2">Earnings</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Gross Pay:</span>
                        <span className="font-medium">{formatCurrency(selectedPayStub.grossPay)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Deductions */}
                  <div>
                    <h4 className="font-semibold text-red-700 dark:text-red-400 mb-2">Deductions</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Federal Tax:</span>
                        <span className="font-medium">{formatCurrency(selectedPayStub.federalTax)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>State Tax:</span>
                        <span className="font-medium">{formatCurrency(selectedPayStub.stateTax)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Social Security:</span>
                        <span className="font-medium">{formatCurrency(selectedPayStub.socialSecurity)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Medicare:</span>
                        <span className="font-medium">{formatCurrency(selectedPayStub.medicare)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Benefits:</span>
                        <span className="font-medium">{formatCurrency(selectedPayStub.benefits)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Net Pay */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Net Pay:</span>
                      <span className="text-payroll-primary">{formatCurrency(selectedPayStub.netPay)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Button className="flex-1">
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Eye className="mr-2 h-4 w-4" />
                      Print
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* YTD Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Year-to-Date Summary
              </CardTitle>
              <CardDescription>
                Your earnings and deductions summary for {new Date().getFullYear()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    {formatCurrency(yearToDateSummary.grossPay)}
                  </div>
                  <div className="text-sm text-muted-foreground">Gross Pay</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {formatCurrency(yearToDateSummary.netPay)}
                  </div>
                  <div className="text-sm text-muted-foreground">Net Pay</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600 mb-2">
                    {formatCurrency(yearToDateSummary.federalTax + yearToDateSummary.stateTax)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Taxes</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 mb-2">
                    {formatCurrency(yearToDateSummary.retirement401k)}
                  </div>
                  <div className="text-sm text-muted-foreground">401(k) Contributions</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benefits" className="space-y-6">
          <div className="grid gap-6">
            {benefitsSummary.map((benefit, index) => (
              <motion.div
                key={benefit.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-full bg-gradient-to-br from-payroll-primary/20 to-payroll-secondary/20">
                          <benefit.icon className="h-6 w-6 text-payroll-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{benefit.name}</h3>
                          <p className="text-muted-foreground">{benefit.plan}</p>
                          {benefit.coverage && (
                            <p className="text-sm text-muted-foreground">{benefit.coverage}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <Badge variant="default" className="mb-2">
                          <CheckCircle className="mr-1 h-2 w-2" />
                          {benefit.status}
                        </Badge>
                        <div className="text-sm">
                          {benefit.monthlyPremium && (
                            <div>
                              <span className="font-semibold">{formatCurrency(benefit.monthlyPremium)}</span>
                              <span className="text-muted-foreground">/month</span>
                            </div>
                          )}
                          {benefit.balance && (
                            <div>
                              <span className="font-semibold">{formatCurrency(benefit.balance)}</span>
                              <span className="text-muted-foreground"> balance</span>
                            </div>
                          )}
                          {benefit.contribution && (
                            <div>
                              <span className="font-semibold">{benefit.contribution}</span>
                              <span className="text-muted-foreground"> contribution</span>
                              {benefit.match && (
                                <div className="text-xs text-green-600">
                                  {benefit.match} company match
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-end space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="mr-2 h-3 w-3" />
                          View Details
                        </Button>
                        <Button size="sm">
                          <Settings className="mr-2 h-3 w-3" />
                          Manage Plan
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="timeoff" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Time Off Balances */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  Time Off Balances
                </CardTitle>
                <CardDescription>
                  Your current time off availability
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {timeOffBalances.map((balance) => (
                  <div key={balance.type}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{balance.name}</h4>
                      <span className="text-sm text-muted-foreground">
                        {balance.available} of {balance.total} {balance.unit}
                      </span>
                    </div>
                    <Progress 
                      value={(balance.available / balance.total) * 100} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Used: {balance.used} {balance.unit}</span>
                      <span>Available: {balance.available} {balance.unit}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Request Time Off */}
            <Card>
              <CardHeader>
                <CardTitle>Request Time Off</CardTitle>
                <CardDescription>
                  Submit a new time off request
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="timeOffType">Type of Time Off</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pto">Paid Time Off</SelectItem>
                        <SelectItem value="sick">Sick Leave</SelectItem>
                        <SelectItem value="personal">Personal Day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="reason">Reason (Optional)</Label>
                    <Input
                      id="reason"
                      placeholder="Vacation, medical appointment, etc."
                    />
                  </div>

                  <Alert>
                    <Calendar className="h-4 w-4" />
                    <AlertDescription>
                      Your manager will be notified and you'll receive a confirmation once approved.'
                    </AlertDescription>
                  </Alert>

                  <Button className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Submit Request
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-muted-foreground">Employee ID:</span>
                    <p className="font-mono">{employeeProfile.id}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Full Name:</span>
                    <p>{employeeProfile.firstName} {employeeProfile.lastName}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Email:</span>
                    <p className="break-all">{employeeProfile.email}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Phone:</span>
                    <p>{employeeProfile.phone}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium text-muted-foreground">Address:</span>
                    <p>
                      {employeeProfile.address.street}<br />
                      {employeeProfile.address.city}, {employeeProfile.address.state} {employeeProfile.address.zipCode}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Employment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="mr-2 h-5 w-5" />
                  Employment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-muted-foreground">Position:</span>
                    <p>{employeeProfile.position}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Department:</span>
                    <p>{employeeProfile.department}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Manager:</span>
                    <p>{employeeProfile.manager}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Start Date:</span>
                    <p>{formatDate(employeeProfile.startDate)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Employment Type:</span>
                    <p>{employeeProfile.employmentType}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Status:</span>
                    <Badge variant="default" className="text-xs">
                      <CheckCircle className="mr-1 h-2 w-2" />
                      {employeeProfile.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Phone className="mr-2 h-5 w-5" />
                Emergency Contact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-muted-foreground">Name:</span>
                  <p>{employeeProfile.emergencyContact.name}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Relationship:</span>
                  <p>{employeeProfile.emergencyContact.relationship}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Phone:</span>
                  <p>{employeeProfile.emergencyContact.phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tax" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Tax Information & Documents
              </CardTitle>
              <CardDescription>
                Manage your tax withholdings and access tax documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Tax Information</h3>
                <p className="text-muted-foreground mb-4">
                  Access your W-2 forms, update tax withholdings, and manage tax preferences
                </p>
                <div className="flex justify-center space-x-2">
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download W-2
                  </Button>
                  <Button>
                    <Settings className="mr-2 h-4 w-4" />
                    Tax Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}