import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
'use client'

import React, { useState } from 'react'

import { Button } from '@/components/ui'
import { Badge } from '@/components/ui'

import { Progress } from '@/components/ui'
import { 
  CreditCard,
  Smartphone,
  Building2,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Calendar,
  DollarSign,
  TrendingUp,
  Activity,
  ArrowUpRight,
  Send,
  Repeat,
  Settings,
  Filter,
  Search,
  Download,
  Eye,
  Edit,
  Trash2,
  Pause,
  Play,
  Copy,
  Bell,
  MoreHorizontal,
  FileText,
  Target,
  Wallet,
  Receipt,
  Users,
  ArrowDownRight,
  RefreshCw,
  Shield,
  Zap,
  History
} from 'lucide-react'

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')

  // Payment Center Data
  const paymentSummary = {
    totalScheduled: 28450.75,
    totalCompleted: 47899.99,
    pendingApproval: 3,
    activePayments: 15,
    recurringPayments: 8,
    oneTimePayments: 7,
    successRate: 98.5,
    averageProcessingTime: '2.3 days'
  }

  // Comprehensive Payment Methods
  const paymentMethods = [
    {
      id: 1,
      type: 'Business Credit Card',
      name: 'Platinum Business Visa',
      lastFour: '1234',
      status: 'active',
      default: true,
      icon: CreditCard,
      color: 'text-blue-400',
      limit: 50000,
      available: 43500,
      expiryDate: '12/27',
      issuer: 'Chase Bank'
    },
    {
      id: 2,
      type: 'Business Checking',
      name: 'Primary Business Account',
      lastFour: '5678',
      status: 'active',
      default: false,
      icon: Building2,
      color: 'text-green-400',
      balance: 125430.50,
      routingNumber: '124001545',
      bankName: 'Wells Fargo'
    },
    {
      id: 3,
      type: 'Digital Wallet',
      name: 'Apple Pay Business',
      lastFour: 'N/A',
      status: 'active',
      default: false,
      icon: Smartphone,
      color: 'text-purple-400',
      linkedCards: 2,
      provider: 'Apple Pay'
    },
    {
      id: 4,
      type: 'Wire Transfer',
      name: 'Domestic Wire Account',
      lastFour: '9012',
      status: 'active',
      default: false,
      icon: Zap,
      color: 'text-orange-400',
      dailyLimit: 100000,
      bankName: 'JP Morgan Chase'
    }
  ]

  // Scheduled Payments with comprehensive data
  const scheduledPayments = [
    {
      id: 1,
      payee: 'Metropolitan Office Leasing',
      category: 'Rent & Facilities',
      amount: 4500.00,
      nextDueDate: '2024-02-01',
      frequency: 'monthly',
      status: 'active',
      paymentMethodId: 2,
      paymentMethod: 'Business Checking *5678',
      autopay: true,
      reminderDays: 3,
      totalPaid: 54000.00,
      paymentsCount: 12,
      lastPayment: '2024-01-01',
      notes: 'Monthly rent payment with 5% annual increase clause'
    },
    {
      id: 2,
      payee: 'TechStack Solutions',
      category: 'Software & Subscriptions',
      amount: 899.99,
      nextDueDate: '2024-01-25',
      frequency: 'monthly',
      status: 'active',
      paymentMethodId: 1,
      paymentMethod: 'Platinum Visa *1234',
      autopay: true,
      reminderDays: 5,
      totalPaid: 10799.88,
      paymentsCount: 12,
      lastPayment: '2023-12-25',
      notes: 'Enterprise software licenses and cloud services'
    },
    {
      id: 3,
      payee: 'City Utilities Department',
      category: 'Utilities',
      amount: 650.25,
      nextDueDate: '2024-01-28',
      frequency: 'monthly',
      status: 'pending_approval',
      paymentMethodId: 2,
      paymentMethod: 'Business Checking *5678',
      autopay: false,
      reminderDays: 7,
      totalPaid: 7802.95,
      paymentsCount: 12,
      lastPayment: '2023-12-28',
      notes: 'Combined electricity, gas, and water services'
    },
    {
      id: 4,
      payee: 'QuickBooks Payroll',
      category: 'Payroll Services',
      amount: 149.00,
      nextDueDate: '2024-02-15',
      frequency: 'monthly',
      status: 'active',
      paymentMethodId: 1,
      paymentMethod: 'Platinum Visa *1234',
      autopay: true,
      reminderDays: 3,
      totalPaid: 1788.00,
      paymentsCount: 12,
      lastPayment: '2024-01-15',
      notes: 'Payroll processing and tax filing services'
    },
    {
      id: 5,
      payee: 'Insurance Partners LLC',
      category: 'Insurance',
      amount: 1250.00,
      nextDueDate: '2024-03-01',
      frequency: 'quarterly',
      status: 'active',
      paymentMethodId: 2,
      paymentMethod: 'Business Checking *5678',
      autopay: true,
      reminderDays: 10,
      totalPaid: 5000.00,
      paymentsCount: 4,
      lastPayment: '2023-12-01',
      notes: 'General liability and property insurance premium'
    }
  ]

  // Payment Templates
  const paymentTemplates = [
    {
      id: 1,
      name: 'Office Supplier Payment',
      category: 'Office Supplies',
      payee: 'Staples Business Solutions',
      defaultAmount: 250.00,
      paymentMethodId: 1,
      description: 'Standard office supplies order payment',
      usageCount: 24,
      lastUsed: '2024-01-15'
    },
    {
      id: 2,
      name: 'Freelancer Payment',
      category: 'Professional Services',
      payee: 'Various Contractors',
      defaultAmount: 1500.00,
      paymentMethodId: 2,
      description: 'Standard contractor payment template',
      usageCount: 18,
      lastUsed: '2024-01-10'
    },
    {
      id: 3,
      name: 'Marketing Campaign',
      category: 'Marketing',
      payee: 'Google Ads',
      defaultAmount: 2000.00,
      paymentMethodId: 1,
      description: 'Monthly marketing spend allocation',
      usageCount: 12,
      lastUsed: '2024-01-01'
    },
    {
      id: 4,
      name: 'Equipment Purchase',
      category: 'Capital Expenses',
      payee: 'Various Vendors',
      defaultAmount: 5000.00,
      paymentMethodId: 4,
      description: 'Large equipment and capital purchases',
      usageCount: 6,
      lastUsed: '2023-12-20'
    }
  ]

  // Payment Status Tracking
  const paymentHistory = [
    {
      id: 1,
      payee: 'Metropolitan Office Leasing',
      amount: 4500.00,
      date: '2024-01-01',
      status: 'completed',
      method: 'ACH Transfer',
      confirmationNumber: 'ACH-240101-4501',
      processingTime: '2 days',
      category: 'Rent & Facilities'
    },
    {
      id: 2,
      payee: 'TechStack Solutions',
      amount: 899.99,
      date: '2023-12-25',
      status: 'completed',
      method: 'Credit Card',
      confirmationNumber: 'CC-231225-8999',
      processingTime: 'Instant',
      category: 'Software & Subscriptions'
    },
    {
      id: 3,
      payee: 'City Utilities Department',
      amount: 650.25,
      date: '2024-01-16',
      status: 'failed',
      method: 'ACH Transfer',
      confirmationNumber: 'ACH-240116-FAIL',
      processingTime: 'N/A',
      errorReason: 'Insufficient funds',
      category: 'Utilities'
    },
    {
      id: 4,
      payee: 'QuickBooks Payroll',
      amount: 149.00,
      date: '2024-01-15',
      status: 'completed',
      method: 'Credit Card',
      confirmationNumber: 'CC-240115-1490',
      processingTime: 'Instant',
      category: 'Payroll Services'
    },
    {
      id: 5,
      payee: 'Office Depot',
      amount: 325.50,
      date: '2024-01-14',
      status: 'processing',
      method: 'ACH Transfer',
      confirmationNumber: 'ACH-240114-PROC',
      processingTime: 'Pending',
      category: 'Office Supplies'
    }
  ]

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Payment Center</h1>
            <p className="text-neutral-400">
              Comprehensive payment management and automation hub
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-neutral-700 text-white hover:bg-neutral-800">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" className="border-neutral-700 text-white hover:bg-neutral-800">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button className="bg-[#1C8BFF] hover:bg-[#1C8BFF]/90 text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Payment
            </Button>
          </div>
        </div>
      </div>

      {/* Payment Overview KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-neutral-900 border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-500/10">
              <Calendar className="w-6 h-6 text-blue-500" />
            </div>
            <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
              {paymentSummary.activePayments} Active
            </Badge>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-neutral-400">Scheduled Payments</h3>
            <p className="text-2xl font-bold text-white">
              ${paymentSummary.totalScheduled.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <div className="flex items-center text-sm text-blue-500">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              <span>This month</span>
            </div>
          </div>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-500/10">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
              {paymentSummary.successRate}%
            </Badge>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-neutral-400">Completed Payments</h3>
            <p className="text-2xl font-bold text-white">
              ${paymentSummary.totalCompleted.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <div className="flex items-center text-sm text-green-500">
              <CheckCircle className="w-4 h-4 mr-1" />
              <span>Success rate</span>
            </div>
          </div>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-orange-500/10">
              <Clock className="w-6 h-6 text-orange-500" />
            </div>
            <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">
              {paymentSummary.pendingApproval}
            </Badge>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-neutral-400">Pending Approval</h3>
            <p className="text-2xl font-bold text-white">{paymentSummary.pendingApproval}</p>
            <div className="flex items-center text-sm text-orange-500">
              <AlertCircle className="w-4 h-4 mr-1" />
              <span>Requires action</span>
            </div>
          </div>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-purple-500/10">
              <Repeat className="w-6 h-6 text-purple-500" />
            </div>
            <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">
              {paymentSummary.recurringPayments}
            </Badge>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-neutral-400">Recurring Payments</h3>
            <p className="text-2xl font-bold text-white">{paymentSummary.recurringPayments}</p>
            <div className="flex items-center text-sm text-purple-500">
              <RefreshCw className="w-4 h-4 mr-1" />
              <span>Automated</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="scheduled" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-neutral-900 border-neutral-800">
          <TabsTrigger value="scheduled" className="data-[state=active]:bg-[#1C8BFF] data-[state=active]:text-white">
            Scheduled
          </TabsTrigger>
          <TabsTrigger value="recurring" className="data-[state=active]:bg-[#1C8BFF] data-[state=active]:text-white">
            Recurring
          </TabsTrigger>
          <TabsTrigger value="templates" className="data-[state=active]:bg-[#1C8BFF] data-[state=active]:text-white">
            Templates
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-[#1C8BFF] data-[state=active]:text-white">
            History
          </TabsTrigger>
          <TabsTrigger value="methods" className="data-[state=active]:bg-[#1C8BFF] data-[state=active]:text-white">
            Methods
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scheduled" className="mt-6">
          <div className="space-y-6">
            <Card className="bg-neutral-900 border-neutral-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Scheduled Payments Management</h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                    <Search className="w-4 h-4 mr-1" />
                    Search
                  </Button>
                  <Button className="bg-[#1C8BFF] hover:bg-[#1C8BFF]/90">
                    <Plus className="w-4 h-4 mr-1" />
                    Schedule Payment
                  </Button>
                </div>
              </div>
              <div className="space-y-4">
                {scheduledPayments.map((payment) => (
                  <div key={payment.id} className="p-4 bg-neutral-800 rounded-lg hover:bg-neutral-750 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-lg bg-neutral-700">
                          {payment.status === 'active' ? (
                            <CheckCircle className="h-5 w-5 text-green-400" />
                          ) : payment.status === 'pending_approval' ? (
                            <AlertCircle className="h-5 w-5 text-orange-400" />
                          ) : (
                            <Clock className="h-5 w-5 text-blue-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{payment.payee}</h4>
                          <p className="text-sm text-neutral-400">{payment.category} • {payment.paymentMethod}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs text-neutral-400">
                              Next: {payment.nextDueDate} ({payment.frequency})
                            </span>
                            {payment.autopay && (
                              <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                                <Zap className="w-3 h-3 mr-1" />
                                Auto-pay
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-lg font-bold text-white">
                            ${payment.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </p>
                          <p className="text-xs text-neutral-400">
                            {payment.paymentsCount} payments • ${payment.totalPaid.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                            <Edit className="w-4 h-4" />
                          </Button>
                          {payment.status === 'active' ? (
                            <Button variant="outline" size="sm" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                              <Pause className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button variant="outline" size="sm" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                              <Play className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {payment.notes && (
                      <div className="mt-3 pt-3 border-t border-neutral-700">
                        <p className="text-xs text-neutral-400">{payment.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recurring" className="mt-6">
          <div className="space-y-6">
            <Card className="bg-neutral-900 border-neutral-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Recurring Payments Setup</h3>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-sm text-neutral-400">
                    <Repeat className="w-4 h-4" />
                    <span>Frequency Controls</span>
                  </div>
                  <Button className="bg-[#1C8BFF] hover:bg-[#1C8BFF]/90">
                    <Plus className="w-4 h-4 mr-1" />
                    Create Recurring
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-4 bg-neutral-800 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-medium">Monthly Payments</h4>
                    <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">5</Badge>
                  </div>
                  <Progress value={83} className="h-2 bg-neutral-700 mb-2" />
                  <p className="text-xs text-neutral-400">$8,749.24 total monthly</p>
                </div>
                
                <div className="p-4 bg-neutral-800 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-medium">Quarterly Payments</h4>
                    <Badge className="bg-green-500/10 text-green-400 border-green-500/20">2</Badge>
                  </div>
                  <Progress value={45} className="h-2 bg-neutral-700 mb-2" />
                  <p className="text-xs text-neutral-400">$3,750.00 total quarterly</p>
                </div>
                
                <div className="p-4 bg-neutral-800 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-medium">Annual Payments</h4>
                    <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20">1</Badge>
                  </div>
                  <Progress value={25} className="h-2 bg-neutral-700 mb-2" />
                  <p className="text-xs text-neutral-400">$12,500.00 total annually</p>
                </div>
              </div>

              <div className="space-y-4">
                {scheduledPayments.filter(p => p.frequency !== 'once').map((payment) => (
                  <div key={payment.id} className="p-4 bg-neutral-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 rounded-lg bg-neutral-700">
                          <Repeat className="h-4 w-4 text-blue-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{payment.payee}</h4>
                          <div className="flex items-center gap-4 text-sm text-neutral-400">
                            <span>Every {payment.frequency}</span>
                            <span>•</span>
                            <span>Next: {payment.nextDueDate}</span>
                            <span>•</span>
                            <span>Reminder: {payment.reminderDays} days</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-lg font-bold text-white">
                            ${payment.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </p>
                          <div className="flex items-center text-xs text-neutral-400">
                            {payment.autopay ? (
                              <>
                                <Zap className="w-3 h-3 mr-1 text-green-400" />
                                <span>Automated</span>
                              </>
                            ) : (
                              <>
                                <Bell className="w-3 h-3 mr-1 text-orange-400" />
                                <span>Manual approval</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <div className="space-y-6">
            <Card className="bg-neutral-900 border-neutral-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Payment Templates</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-400">Quick setup for common transactions</span>
                  <Button className="bg-[#1C8BFF] hover:bg-[#1C8BFF]/90">
                    <Plus className="w-4 h-4 mr-1" />
                    Create Template
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {paymentTemplates.map((template) => (
                  <div key={template.id} className="p-4 bg-neutral-800 rounded-lg hover:bg-neutral-750 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-neutral-700">
                          <FileText className="h-5 w-5 text-purple-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{template.name}</h4>
                          <p className="text-sm text-neutral-400">{template.category}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-400">Default Payee:</span>
                        <span className="text-white">{template.payee}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-400">Default Amount:</span>
                        <span className="text-white">${template.defaultAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-400">Usage:</span>
                        <span className="text-white">{template.usageCount} times</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-400">Last used: {template.lastUsed}</span>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" className="bg-[#1C8BFF] hover:bg-[#1C8BFF]/90">
                          <Send className="w-4 h-4 mr-1" />
                          Use Template
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <div className="space-y-6">
            <Card className="bg-neutral-900 border-neutral-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Payment Status Tracking</h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                    <Download className="w-4 h-4 mr-1" />
                    Export
                  </Button>
                  <Button variant="outline" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                    <Filter className="w-4 h-4 mr-1" />
                    Filter
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                {paymentHistory.map((payment) => (
                  <div key={payment.id} className="p-4 bg-neutral-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 rounded-lg bg-neutral-700">
                          {payment.status === 'completed' ? (
                            <CheckCircle className="h-5 w-5 text-green-400" />
                          ) : payment.status === 'failed' ? (
                            <AlertCircle className="h-5 w-5 text-red-400" />
                          ) : (
                            <Clock className="h-5 w-5 text-orange-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{payment.payee}</h4>
                          <div className="flex items-center gap-4 text-sm text-neutral-400">
                            <span>{payment.date}</span>
                            <span>•</span>
                            <span>{payment.method}</span>
                            <span>•</span>
                            <span>{payment.category}</span>
                          </div>
                          {payment.errorReason && (
                            <p className="text-xs text-red-400 mt-1">Error: {payment.errorReason}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-lg font-bold text-white">
                            ${payment.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </p>
                          <div className="flex items-center text-xs text-neutral-400">
                            <span>{payment.confirmationNumber}</span>
                          </div>
                        </div>
                        <Badge className={
                          payment.status === 'completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                          payment.status === 'failed' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                          'bg-orange-500/10 text-orange-400 border-orange-500/20'
                        }>
                          {payment.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {payment.status === 'failed' && <AlertCircle className="w-3 h-3 mr-1" />}
                          {payment.status === 'processing' && <Clock className="w-3 h-3 mr-1" />}
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="methods" className="mt-6">
          <div className="space-y-6">
            <Card className="bg-neutral-900 border-neutral-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Payment Methods Management</h3>
                <Button className="bg-[#1C8BFF] hover:bg-[#1C8BFF]/90">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Payment Method
                </Button>
              </div>
              
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="p-4 bg-neutral-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={'p-3 rounded-lg bg-neutral-700 ${method.color}'}>
                          <method.icon className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{method.name}</h4>
                          <p className="text-sm text-neutral-400">{method.type} ending in {method.lastFour}</p>
                          <div className="flex items-center gap-4 mt-2">
                            {method.balance && (
                              <span className="text-xs text-neutral-400">
                                Balance: ${method.balance.toLocaleString()}
                              </span>
                            )}
                            {method.limit && (
                              <span className="text-xs text-neutral-400">
                                Available: ${method.available.toLocaleString()}
                              </span>
                            )}
                            {method.expiryDate && (
                              <span className="text-xs text-neutral-400">
                                Expires: {method.expiryDate}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center gap-2">
                          {method.default && (
                            <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                              Default
                            </Badge>
                          )}
                          <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                            <Activity className="w-3 h-3 mr-1" />
                            {method.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}