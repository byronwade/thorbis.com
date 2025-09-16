import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
'use client'

'use client'

import { useState } from 'react'

import { Button } from '@/components/ui'
import { Badge } from '@/components/ui'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { 
  Building2,
  DollarSign,
  TrendingUp,
  Calendar,
  Calculator,
  Plus,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  CreditCard,
  TrendingDown,
  Activity,
  Shield,
  Banknote,
  BarChart3,
  PieChart,
  Target,
  Users,
  Download,
  Upload,
  Eye,
  Settings,
  Percent,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  RefreshCw,
  Bell,
  Star,
  Info,
  MapPin,
  Phone,
  Mail,
  Globe
} from 'lucide-react'

export default function LoansPage() {
  const [selectedLoan, setSelectedLoan] = useState(null)
  const [showAmortizationSchedule, setShowAmortizationSchedule] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  
  const loans = [
    {
      id: 1,
      type: 'Business Term Loan',
      amount: 250000.00,
      balance: 187500.00,
      rate: 4.25,
      term: 60,
      remainingTerm: 42,
      monthlyPayment: 4687.50,
      nextDue: '2024-02-01',
      status: 'Active',
      purpose: 'Equipment Purchase',
      lender: 'First Business Bank',
      originationDate: '2021-06-15',
      maturityDate: '2026-06-15',
      totalInterest: 31250.00,
      principalPaid: 62500.00,
      interestPaid: 15750.00,
      paymentHistory: [
        { date: '2024-01-01', amount: 4687.50, principal: 3850.25, interest: 837.25, balance: 191350.25 },
        { date: '2023-12-01', amount: 4687.50, principal: 3834.12, interest: 853.38, balance: 195184.37 },
        { date: '2023-11-01', amount: 4687.50, principal: 3817.83, interest: 869.67, balance: 199002.20 }
      ],
      documents: ['Loan Agreement', 'Promissory Note', 'Security Agreement'],
      collateral: 'Manufacturing Equipment - $300,000 value',
      guarantors: ['John Smith (CEO)', 'Jane Doe (CFO)']
    },
    {
      id: 2,
      type: 'Line of Credit',
      amount: 50000.00,
      balance: 12500.00,
      available: 37500.00,
      rate: 6.75,
      term: 0,
      monthlyPayment: 0,
      minimumPayment: 250.00,
      nextDue: '2024-01-28',
      status: 'Active',
      purpose: 'Working Capital',
      lender: 'Business Credit Union',
      originationDate: '2023-01-15',
      maturityDate: '2025-01-15',
      totalInterest: 2100.00,
      interestPaid: 1850.00,
      paymentHistory: [
        { date: '2024-01-01', amount: 500.00, principal: 431.25, interest: 68.75, balance: 12500.00 },
        { date: '2023-12-01', amount: 750.00, principal: 685.15, interest: 64.85, balance: 12931.25 }
      ],
      documents: ['Credit Line Agreement', 'Personal Guarantee'],
      utilizationRate: 25.0
    },
    {
      id: 3,
      type: 'SBA 7(a) Loan',
      amount: 100000.00,
      balance: 89250.00,
      rate: 3.75,
      term: 84,
      remainingTerm: 78,
      monthlyPayment: 1425.30,
      nextDue: '2024-01-25',
      status: 'Active',
      purpose: 'Business Expansion',
      lender: 'SBA Preferred Lender',
      originationDate: '2023-07-01',
      maturityDate: '2030-07-01',
      totalInterest: 19799.20,
      principalPaid: 10750.00,
      interestPaid: 1651.80,
      paymentHistory: [
        { date: '2024-01-01', amount: 1425.30, principal: 1146.05, interest: 279.25, balance: 89250.00 },
        { date: '2023-12-01', amount: 1425.30, principal: 1142.45, interest: 282.85, balance: 90396.05 }
      ],
      documents: ['SBA Authorization', 'Loan Agreement', 'Environmental Assessment'],
      sbaGuaranteePercentage: 75,
      collateral: 'Real Estate - $120,000 value'
    },
    {
      id: 4,
      type: 'Equipment Financing',
      amount: 75000.00,
      balance: 45000.00,
      rate: 5.25,
      term: 60,
      remainingTerm: 36,
      monthlyPayment: 1421.75,
      nextDue: '2024-02-05',
      status: 'Active',
      purpose: 'Fleet Vehicles',
      lender: 'Equipment Finance Corp',
      originationDate: '2022-02-01',
      maturityDate: '2027-02-01',
      totalInterest: 10260.00,
      principalPaid: 30000.00,
      interestPaid: 4122.00,
      paymentHistory: [
        { date: '2024-01-05', amount: 1421.75, principal: 1224.50, interest: 197.25, balance: 45000.00 },
        { date: '2023-12-05', amount: 1421.75, principal: 1219.12, interest: 202.63, balance: 46224.50 }
      ],
      documents: ['Equipment Purchase Agreement', 'Security Interest'],
      collateral: '3 Delivery Vehicles - $75,000 value'
    }
  ]

  const loanApplications = [
    {
      id: 1,
      type: 'Equipment Financing',
      amount: 75000.00,
      status: 'Under Review',
      submittedDate: '2024-01-10',
      expectedDecision: '2024-01-25',
      progress: 65,
      stage: 'Credit Analysis',
      nextStep: 'Awaiting credit bureau report',
      lender: 'Equipment Finance Corp',
      documentsRequired: ['Tax Returns (2 years)', 'Equipment Quote', 'Business Plan'],
      documentsUploaded: ['Tax Returns (2 years)', 'Equipment Quote']
    },
    {
      id: 2,
      type: 'Real Estate Loan',
      amount: 500000.00,
      status: 'Documentation Required',
      submittedDate: '2024-01-08',
      expectedDecision: '2024-02-15',
      progress: 30,
      stage: 'Document Collection',
      nextStep: 'Upload property appraisal and environmental report',
      lender: 'Commercial Real Estate Bank',
      documentsRequired: ['Property Appraisal', 'Environmental Report', 'Business Financial Statements', 'Personal Financial Statements'],
      documentsUploaded: ['Business Financial Statements']
    }
  ]

  // Calculate comprehensive metrics
  const totalLoaned = loans.reduce((sum, loan) => sum + loan.amount, 0)
  const totalBalance = loans.reduce((sum, loan) => sum + loan.balance, 0)
  const totalMonthlyPayment = loans.reduce((sum, loan) => sum + loan.monthlyPayment, 0)
  const totalInterestPaid = loans.reduce((sum, loan) => sum + (loan.interestPaid || 0), 0)
  const totalPrincipalPaid = loans.reduce((sum, loan) => sum + (loan.principalPaid || 0), 0)
  const availableCredit = loans.filter(loan => loan.type.includes('Credit')).reduce((sum, loan) => sum + (loan.available || 0), 0)
  
  // Payment schedule for next 12 months
  const upcomingPayments = loans.filter(loan => loan.monthlyPayment > 0).map(loan => ({
    ...loan,
    nextPaymentDate: new Date(loan.nextDue),
    upcomingPayments: Array.from({ length: 12 }, (_, i) => {
      const date = new Date(loan.nextDue)
      date.setMonth(date.getMonth() + i)
      return {
        date: date.toISOString().split('T')[0],
        amount: loan.monthlyPayment,
        principal: loan.monthlyPayment * 0.8,
        interest: loan.monthlyPayment * 0.2
      }
    })
  })).sort((a, b) => a.nextPaymentDate - b.nextPaymentDate)

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6">
      {/* Enhanced Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Loans & Credit Portfolio</h1>
            <p className="text-neutral-400">
              Comprehensive loan management, payment tracking, and performance analytics
            </p>
            <div className="flex items-center gap-4 mt-3">
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <CheckCircle className="w-3 h-3 mr-1" />
                {loans.filter(loan => loan.status === 'Active').length} Active Loans
              </Badge>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                <DollarSign className="w-3 h-3 mr-1" />
                ${totalBalance.toLocaleString()} Outstanding
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-neutral-700 text-white hover:bg-neutral-800">
              <Calculator className="w-4 h-4 mr-2" />
              Loan Calculator
            </Button>
            <Button variant="outline" className="border-neutral-700 text-white hover:bg-neutral-800">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button className="bg-[#1C8BFF] hover:bg-[#1C8BFF]/90 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Apply for Loan
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="bg-neutral-900 border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-neutral-400">Total Portfolio Value</h3>
            <Banknote className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-white">
              ${totalLoaned.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <div className="flex items-center text-sm">
              <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
              <span className="text-red-500">${(totalLoaned - totalBalance).toLocaleString()} repaid</span>
            </div>
          </div>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-neutral-400">Outstanding Balance</h3>
            <DollarSign className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-white">
              ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <div className="flex items-center text-sm">
              <TrendingDown className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-500">
                {((1 - totalBalance / totalLoaned) * 100).toFixed(1)}% paid down
              </span>
            </div>
          </div>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-neutral-400">Monthly Obligations</h3>
            <Calendar className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-white">
              ${totalMonthlyPayment.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-neutral-400">
              {loans.filter(loan => loan.monthlyPayment > 0).length} active payments
            </p>
          </div>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-neutral-400">Available Credit</h3>
            <CreditCard className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-[#1C8BFF]">
              ${availableCredit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-neutral-400">Ready to deploy</p>
          </div>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6 bg-neutral-900 border-neutral-800">
          <TabsTrigger value="overview" className="data-[state=active]:bg-[#1C8BFF] data-[state=active]:text-white">
            Overview
          </TabsTrigger>
          <TabsTrigger value="payments" className="data-[state=active]:bg-[#1C8BFF] data-[state=active]:text-white">
            Payments
          </TabsTrigger>
          <TabsTrigger value="amortization" className="data-[state=active]:bg-[#1C8BFF] data-[state=active]:text-white">
            Schedule
          </TabsTrigger>
          <TabsTrigger value="applications" className="data-[state=active]:bg-[#1C8BFF] data-[state=active]:text-white">
            Applications
          </TabsTrigger>
          <TabsTrigger value="documents" className="data-[state=active]:bg-[#1C8BFF] data-[state=active]:text-white">
            Documents
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-[#1C8BFF] data-[state=active]:text-white">
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Active Loans Portfolio */}
            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-[#1C8BFF]">
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-white">Active Loans</CardTitle>
                  </div>
                  <Button variant="outline" size="sm" className="border-neutral-700 text-neutral-300">
                    <Settings className="w-4 h-4 mr-1" />
                    Manage
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {loans.map((loan) => (
                  <div key={loan.id} className="p-4 rounded-lg bg-neutral-800 space-y-4 border border-neutral-700 hover:border-neutral-600 transition-colors cursor-pointer" onClick={() => setSelectedLoan(loan)}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-white">{loan.type}</p>
                        <p className="text-xs text-neutral-400">{loan.purpose} • {loan.lender}</p>
                      </div>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {loan.status}
                      </Badge>
                    </div>
                    
                    {/* Enhanced Progress Bar with Details */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-neutral-400">Loan Progress</span>
                        <span className="text-white">
                          {(() => {
                            const percentage = ((loan.amount - loan.balance) / loan.amount) * 100
                            return '${percentage.toFixed(1)}% paid'
                          })()}
                        </span>
                      </div>
                      <Progress 
                        value={((loan.amount - loan.balance) / loan.amount) * 100} 
                        className="h-2 bg-neutral-700" 
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 bg-neutral-700/50 rounded-lg">
                        <p className="text-xs text-neutral-400 mb-1">Balance</p>
                        <p className="text-sm font-semibold text-white">
                          ${loan.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="p-3 bg-neutral-700/50 rounded-lg">
                        <p className="text-xs text-neutral-400 mb-1">Rate</p>
                        <p className="text-sm font-semibold text-[#1C8BFF]">{loan.rate}% APR</p>
                      </div>
                      <div className="p-3 bg-neutral-700/50 rounded-lg">
                        <p className="text-xs text-neutral-400 mb-1">Payment</p>
                        <p className="text-sm font-semibold text-green-400">
                          ${loan.monthlyPayment.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>

                    {loan.monthlyPayment > 0 && (
                      <div className="flex items-center justify-between p-3 bg-[#1C8BFF]/10 rounded-lg border border-[#1C8BFF]/30">
                        <div>
                          <p className="text-xs text-[#1C8BFF]">Next Payment Due</p>
                          <p className="text-sm font-semibold text-white">{loan.nextDue}</p>
                        </div>
                        <Button size="sm" className="bg-[#1C8BFF] hover:bg-[#1C8BFF]/90">
                          <DollarSign className="w-4 h-4 mr-1" />
                          Pay Now
                        </Button>
                      </div>
                    )}

                    {/* Loan Details Preview */}
                    {selectedLoan?.id === loan.id && (
                      <div className="mt-4 p-4 bg-neutral-700/30 rounded-lg border border-neutral-600">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-neutral-400">Origination Date</p>
                            <p className="text-white">{loan.originationDate}</p>
                          </div>
                          <div>
                            <p className="text-neutral-400">Maturity Date</p>
                            <p className="text-white">{loan.maturityDate}</p>
                          </div>
                          <div>
                            <p className="text-neutral-400">Principal Paid</p>
                            <p className="text-green-400">${loan.principalPaid?.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-neutral-400">Interest Paid</p>
                            <p className="text-red-400">${loan.interestPaid?.toLocaleString()}</p>
                          </div>
                        </div>
                        {loan.collateral && (
                          <div className="mt-3 pt-3 border-t border-neutral-600">
                            <p className="text-neutral-400 text-xs">Collateral</p>
                            <p className="text-white text-sm">{loan.collateral}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Portfolio Analytics */}
            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-green-600">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-white">Portfolio Analytics</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Loan Distribution */}
                <div>
                  <h4 className="text-sm font-medium text-white mb-3">Loan Type Distribution</h4>
                  <div className="space-y-3">
                    {loans.map((loan, index) => {
                      const percentage = (loan.balance / totalBalance) * 100
                      return (
                        <div key={loan.id} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-neutral-300">{loan.type}</span>
                            <span className="text-white font-medium">{percentage.toFixed(1)}%</span>
                          </div>
                          <Progress value={percentage} className="h-2 bg-neutral-700" />
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Interest Rate Analysis */}
                <div>
                  <h4 className="text-sm font-medium text-white mb-3">Interest Rate Analysis</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-neutral-800 rounded-lg">
                      <p className="text-xs text-neutral-400">Weighted Avg Rate</p>
                      <p className="text-lg font-bold text-[#1C8BFF]">
                        {(loans.reduce((sum, loan) => sum + (loan.rate * loan.balance), 0) / totalBalance).toFixed(2)}%
                      </p>
                    </div>
                    <div className="p-3 bg-neutral-800 rounded-lg">
                      <p className="text-xs text-neutral-400">Interest Paid YTD</p>
                      <p className="text-lg font-bold text-red-400">
                        ${totalInterestPaid.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Performance */}
                <div>
                  <h4 className="text-sm font-medium text-white mb-3">Payment Performance</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-neutral-400">On-Time Payments</span>
                      <span className="text-sm font-medium text-green-400">100%</span>
                    </div>
                    <Progress value={100} className="h-2 bg-neutral-700" />
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-neutral-500">Last 12 months: 36/36 payments</span>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Excellent
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Credit Utilization */}
                {availableCredit > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-white mb-3">Credit Utilization</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-neutral-300">Used Credit</span>
                        <span className="text-white">${(loans.find(l => l.type.includes('Credit'))?.balance || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-neutral-300">Available Credit</span>
                        <span className="text-green-400">${availableCredit.toLocaleString()}</span>
                      </div>
                      <Progress value={25} className="h-2 bg-neutral-700" />
                      <p className="text-xs text-neutral-500">25% utilization - Excellent standing</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="mt-6">
          <div className="grid gap-6">
            {/* Upcoming Payments */}
            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-orange-600">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-white">Upcoming Payments</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="border-neutral-700 text-neutral-300">
                      <Bell className="w-4 h-4 mr-1" />
                      Set Reminders
                    </Button>
                    <Button size="sm" className="bg-[#1C8BFF] hover:bg-[#1C8BFF]/90">
                      <Plus className="w-4 h-4 mr-1" />
                      Schedule Payment
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingPayments.map((loan) => (
                    <div key={loan.id} className="flex items-center justify-between p-4 rounded-lg bg-neutral-800 border border-neutral-700 hover:border-neutral-600 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-lg bg-neutral-700">
                          <Calendar className="h-5 w-5 text-orange-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{loan.type}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                              <Clock className="h-3 w-3 mr-1" />
                              Due {loan.nextDue}
                            </Badge>
                            <span className="text-xs text-neutral-400">{loan.lender}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-lg font-bold text-white">
                            ${loan.monthlyPayment.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </p>
                          <p className="text-xs text-neutral-400">Monthly payment</p>
                        </div>
                        <Button className="bg-green-600 hover:bg-green-700">
                          <DollarSign className="h-4 w-4 mr-1" />
                          Pay Now
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment History */}
            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-blue-600">
                      <Activity className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-white">Payment History</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="border-neutral-700 text-neutral-300">
                      <Filter className="w-4 h-4 mr-1" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm" className="border-neutral-700 text-neutral-300">
                      <Download className="w-4 h-4 mr-1" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loans.filter(loan => loan.paymentHistory).map(loan => (
                    <div key={loan.id} className="space-y-3">
                      <h4 className="text-sm font-medium text-white border-b border-neutral-700 pb-2">
                        {loan.type} - {loan.lender}
                      </h4>
                      <div className="space-y-2">
                        {loan.paymentHistory?.map((payment, index) => (
                          <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-neutral-800/50">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 rounded-lg bg-green-500/20">
                                <CheckCircle className="h-4 w-4 text-green-400" />
                              </div>
                              <div>
                                <p className="text-sm text-white">{payment.date}</p>
                                <p className="text-xs text-neutral-400">Payment processed successfully</p>
                              </div>
                            </div>
                            <div className="text-right space-y-1">
                              <p className="text-sm font-medium text-white">
                                ${payment.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </p>
                              <div className="flex items-center gap-2 text-xs">
                                <span className="text-green-400">Principal: ${payment.principal.toLocaleString()}</span>
                                <span className="text-red-400">Interest: ${payment.interest.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Amortization Schedule Tab */}
        <TabsContent value="amortization" className="mt-6">
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-purple-600">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-white">Amortization Schedules</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <select className="bg-neutral-800 border-neutral-700 text-white rounded px-3 py-1 text-sm">
                    <option value="">Select Loan</option>
                    {loans.filter(loan => loan.term > 0).map(loan => (
                      <option key={loan.id} value={loan.id}>{loan.type}</option>
                    ))}
                  </select>
                  <Button variant="outline" size="sm" className="border-neutral-700 text-neutral-300">
                    <Download className="w-4 h-4 mr-1" />
                    Export Schedule
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Sample amortization for Business Term Loan */}
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-white">Business Term Loan</h4>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-neutral-400">Original: $250,000</span>
                    <span className="text-neutral-400">•</span>
                    <span className="text-neutral-400">Rate: 4.25% APR</span>
                    <span className="text-neutral-400">•</span>
                    <span className="text-neutral-400">60 months</span>
                  </div>
                </div>

                {/* Amortization Chart Visualization */}
                <div className="p-6 bg-neutral-800 rounded-lg">
                  <h5 className="text-sm font-medium text-white mb-4">Payment Breakdown Over Time</h5>
                  <div className="h-64 bg-neutral-700 rounded-lg flex items-center justify-center">
                    <p className="text-neutral-400">Interactive Amortization Chart</p>
                  </div>
                </div>

                {/* Payment Schedule Table */}
                <div className="overflow-hidden rounded-lg border border-neutral-700">
                  <table className="w-full">
                    <thead className="bg-neutral-800">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400">Payment #</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400">Payment</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400">Principal</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400">Interest</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-700">
                      {Array.from({ length: 12 }, (_, i) => {
                        const paymentNum = i + 19
                        const balance = 187500 - (i * 3850)
                        const principal = 3850 + (i * 15)
                        const interest = 4687.50 - principal
                        const date = new Date('2024-02-01')
                        date.setMonth(date.getMonth() + i)
                        
                        return (
                          <tr key={i} className="hover:bg-neutral-800/50">
                            <td className="px-4 py-3 text-sm text-white">{paymentNum}</td>
                            <td className="px-4 py-3 text-sm text-white">{date.toISOString().split('T')[0]}</td>
                            <td className="px-4 py-3 text-sm font-medium text-white">$4,687.50</td>
                            <td className="px-4 py-3 text-sm text-green-400">${principal.toLocaleString()}</td>
                            <td className="px-4 py-3 text-sm text-red-400">${interest.toFixed(2)}</td>
                            <td className="px-4 py-3 text-sm text-white">${Math.max(0, balance).toLocaleString()}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="p-4 bg-neutral-800 rounded-lg">
                    <p className="text-sm text-neutral-400">Total Interest</p>
                    <p className="text-lg font-bold text-red-400">$31,250.00</p>
                  </div>
                  <div className="p-4 bg-neutral-800 rounded-lg">
                    <p className="text-sm text-neutral-400">Total Payments</p>
                    <p className="text-lg font-bold text-white">$281,250.00</p>
                  </div>
                  <div className="p-4 bg-neutral-800 rounded-lg">
                    <p className="text-sm text-neutral-400">Remaining Payments</p>
                    <p className="text-lg font-bold text-[#1C8BFF]">42</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications" className="mt-6">
          <div className="grid gap-6">
            {/* Application Status */}
            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-green-600">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-white">Loan Applications</CardTitle>
                  </div>
                  <Button className="bg-[#1C8BFF] hover:bg-[#1C8BFF]/90">
                    <Plus className="w-4 h-4 mr-2" />
                    New Application
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {loanApplications.map((application) => (
                    <div key={application.id} className="p-6 rounded-lg bg-neutral-800 border border-neutral-700">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-semibold text-white">{application.type}</h4>
                          <p className="text-2xl font-bold text-[#1C8BFF] mt-1">
                            ${application.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </p>
                          <p className="text-sm text-neutral-400 mt-1">{application.lender}</p>
                        </div>
                        <Badge 
                          className={
                            application.status === 'Under Review' 
                              ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' 
                              : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                          }
                        >
                          {application.status === 'Under Review' && <RefreshCw className="h-3 w-3 mr-1 animate-spin" />}
                          {application.status === 'Documentation Required' && <Upload className="h-3 w-3 mr-1" />}
                          {application.status}
                        </Badge>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-neutral-400">Application Progress</span>
                          <span className="text-sm font-medium text-white">{application.progress}%</span>
                        </div>
                        <Progress value={application.progress} className="h-2 bg-neutral-700" />
                        <div className="flex items-center justify-between mt-2 text-xs">
                          <span className="text-neutral-500">Stage: {application.stage}</span>
                          <span className="text-neutral-500">Expected: {application.expectedDecision}</span>
                        </div>
                      </div>

                      {/* Application Details */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="p-3 bg-neutral-700/50 rounded-lg">
                          <p className="text-xs text-neutral-400 mb-1">Submitted</p>
                          <p className="text-sm font-medium text-white">{application.submittedDate}</p>
                        </div>
                        <div className="p-3 bg-neutral-700/50 rounded-lg">
                          <p className="text-xs text-neutral-400 mb-1">Expected Decision</p>
                          <p className="text-sm font-medium text-[#1C8BFF]">{application.expectedDecision}</p>
                        </div>
                      </div>

                      {/* Next Steps */}
                      <div className="p-4 bg-neutral-700/30 rounded-lg border border-neutral-600 mb-4">
                        <h5 className="text-sm font-medium text-white mb-2">Next Steps</h5>
                        <p className="text-sm text-neutral-300">{application.nextStep}</p>
                      </div>

                      {/* Document Status */}
                      <div className="space-y-3">
                        <h5 className="text-sm font-medium text-white">Document Status</h5>
                        <div className="space-y-2">
                          {application.documentsRequired.map((doc, index) => {
                            const isUploaded = application.documentsUploaded.includes(doc)
                            return (
                              <div key={index} className="flex items-center justify-between p-2 rounded bg-neutral-700/50">
                                <span className="text-sm text-white">{doc}</span>
                                {isUploaded ? (
                                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Uploaded
                                  </Badge>
                                ) : (
                                  <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                                    <Upload className="w-3 h-3 mr-1" />
                                    Required
                                  </Badge>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {application.status === 'Documentation Required' && (
                        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-neutral-700">
                          <Button className="bg-[#1C8BFF] hover:bg-[#1C8BFF]/90 flex-1">
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Documents
                          </Button>
                          <Button variant="outline" className="border-neutral-700 text-neutral-300">
                            <Phone className="w-4 h-4 mr-2" />
                            Contact Lender
                          </Button>
                        </div>
                      )}

                      {application.status === 'Under Review' && (
                        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-neutral-700">
                          <Button variant="outline" className="border-neutral-700 text-neutral-300 flex-1">
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                          <Button variant="outline" className="border-neutral-700 text-neutral-300">
                            <Mail className="w-4 h-4 mr-2" />
                            Message Lender
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* New Application CTA */}
                  <div className="text-center py-8 bg-neutral-800/50 rounded-lg border-2 border-dashed border-neutral-600">
                    <div className="p-4 rounded-full bg-[#1C8BFF] w-fit mx-auto mb-4">
                      <Plus className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">Need Additional Funding?</h3>
                    <p className="text-neutral-400 mb-6 max-w-md mx-auto">
                      Apply for business loans, lines of credit, equipment financing, and SBA loans
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <Button className="bg-[#1C8BFF] hover:bg-[#1C8BFF]/90">
                        <Plus className="w-4 h-4 mr-2" />
                        Start Application
                      </Button>
                      <Button variant="outline" className="border-neutral-700 text-neutral-300">
                        <Calculator className="w-4 h-4 mr-2" />
                        Loan Calculator
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="mt-6">
          <div className="grid gap-6">
            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-purple-600">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-white">Loan Documents</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="border-neutral-700 text-neutral-300">
                      <Search className="w-4 h-4 mr-1" />
                      Search
                    </Button>
                    <Button size="sm" className="bg-[#1C8BFF] hover:bg-[#1C8BFF]/90">
                      <Upload className="w-4 h-4 mr-1" />
                      Upload
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {loans.map(loan => (
                    <div key={loan.id} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-medium text-white">
                          {loan.type} - {loan.lender}
                        </h4>
                        <Badge className="bg-[#1C8BFF]/20 text-[#1C8BFF] border-[#1C8BFF]/30">
                          {loan.documents?.length || 0} Documents
                        </Badge>
                      </div>
                      
                      <div className="grid gap-3">
                        {loan.documents?.map((doc, index) => (
                          <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-neutral-800 border border-neutral-700 hover:border-neutral-600 transition-colors">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 rounded-lg bg-neutral-700">
                                <FileText className="h-5 w-5 text-[#1C8BFF]" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white">{doc}</p>
                                <p className="text-xs text-neutral-400">
                                  Uploaded {loan.originationDate} • PDF • 2.4 MB
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" className="border-neutral-700 text-neutral-300">
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                              <Button variant="outline" size="sm" className="border-neutral-700 text-neutral-300">
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Additional Information */}
                      {loan.collateral && (
                        <div className="p-4 bg-neutral-800/50 rounded-lg">
                          <h5 className="text-sm font-medium text-white mb-2">Collateral Information</h5>
                          <p className="text-sm text-neutral-300">{loan.collateral}</p>
                        </div>
                      )}

                      {loan.guarantors && (
                        <div className="p-4 bg-neutral-800/50 rounded-lg">
                          <h5 className="text-sm font-medium text-white mb-2">Guarantors</h5>
                          <div className="space-y-1">
                            {loan.guarantors.map((guarantor, idx) => (
                              <p key={idx} className="text-sm text-neutral-300">{guarantor}</p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-6">
          <div className="grid gap-6">
            {/* Performance Metrics */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-green-600">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-white">Portfolio Performance</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-neutral-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-neutral-400">Total Borrowed</span>
                        <Banknote className="w-4 h-4 text-neutral-400" />
                      </div>
                      <p className="text-xl font-bold text-white">
                        ${totalLoaned.toLocaleString()}
                      </p>
                      <p className="text-xs text-neutral-500">Since inception</p>
                    </div>
                    
                    <div className="p-4 bg-neutral-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-neutral-400">Interest Paid</span>
                        <DollarSign className="w-4 h-4 text-neutral-400" />
                      </div>
                      <p className="text-xl font-bold text-red-400">
                        ${totalInterestPaid.toLocaleString()}
                      </p>
                      <p className="text-xs text-neutral-500">Total to date</p>
                    </div>

                    <div className="p-4 bg-neutral-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-neutral-400">Avg Interest Rate</span>
                        <Percent className="w-4 h-4 text-neutral-400" />
                      </div>
                      <p className="text-xl font-bold text-[#1C8BFF]">
                        {(loans.reduce((sum, loan) => sum + (loan.rate * loan.balance), 0) / totalBalance).toFixed(2)}%
                      </p>
                      <p className="text-xs text-neutral-500">Weighted average</p>
                    </div>

                    <div className="p-4 bg-neutral-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-neutral-400">Payment Record</span>
                        <CheckCircle className="w-4 h-4 text-neutral-400" />
                      </div>
                      <p className="text-xl font-bold text-green-400">100%</p>
                      <p className="text-xs text-neutral-500">On-time payments</p>
                    </div>
                  </div>

                  {/* Loan Performance Chart */}
                  <div>
                    <h4 className="text-sm font-medium text-white mb-3">Paydown Progress</h4>
                    <div className="h-48 bg-neutral-800 rounded-lg flex items-center justify-center">
                      <p className="text-neutral-400">Loan Paydown Chart</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-orange-600">
                      <PieChart className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-white">Cash Flow Impact</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Monthly Cash Flow */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-white">Monthly Obligations</h4>
                    <div className="space-y-3">
                      {loans.filter(loan => loan.monthlyPayment > 0).map(loan => (
                        <div key={loan.id} className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
                          <span className="text-sm text-white">{loan.type}</span>
                          <span className="text-sm font-medium text-white">
                            ${loan.monthlyPayment.toLocaleString()}
                          </span>
                        </div>
                      ))}
                      <div className="flex items-center justify-between p-3 bg-[#1C8BFF]/10 rounded-lg border border-[#1C8BFF]/30">
                        <span className="text-sm font-medium text-white">Total Monthly</span>
                        <span className="text-lg font-bold text-[#1C8BFF]">
                          ${totalMonthlyPayment.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Projected Payments */}
                  <div>
                    <h4 className="text-sm font-medium text-white mb-3">12-Month Projection</h4>
                    <div className="p-4 bg-neutral-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-neutral-400">Projected Payments</span>
                        <span className="text-lg font-bold text-white">
                          ${(totalMonthlyPayment * 12).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-neutral-400">Principal</span>
                        <span className="text-sm font-medium text-green-400">
                          ${(totalMonthlyPayment * 12 * 0.8).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-400">Interest</span>
                        <span className="text-sm font-medium text-red-400">
                          ${(totalMonthlyPayment * 12 * 0.2).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payoff Timeline */}
                  <div>
                    <h4 className="text-sm font-medium text-white mb-3">Payoff Timeline</h4>
                    <div className="space-y-2">
                      {loans.filter(loan => loan.remainingTerm).map(loan => (
                        <div key={loan.id} className="flex items-center justify-between text-sm">
                          <span className="text-neutral-300">{loan.type}</span>
                          <span className="text-white">{loan.remainingTerm} months remaining</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Analytics */}
            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-blue-600">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-white">Advanced Analytics</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 lg:grid-cols-3">
                  {/* Interest Rate Comparison */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-white">Interest Rate Analysis</h4>
                    <div className="space-y-3">
                      {loans.map(loan => {
                        const marketRate = 5.5 // Example market rate
                        const savings = loan.balance * ((marketRate - loan.rate) / 100) / 12
                        return (
                          <div key={loan.id} className="p-3 bg-neutral-800 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-neutral-400">{loan.type}</span>
                              <span className="text-xs font-medium text-white">{loan.rate}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-neutral-500">vs Market</span>
                              <span className={'text-xs font-medium ${savings > 0 ? 'text-green-400' : 'text-red-400'
              }'}>'
                                {savings > 0 ? 'Save' : 'Cost'} ${Math.abs(savings).toFixed(0)}/mo
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Credit Score Impact */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-white">Credit Impact</h4>
                    <div className="p-4 bg-neutral-800 rounded-lg">
                      <div className="text-center mb-4">
                        <div className="text-2xl font-bold text-green-400 mb-1">Excellent</div>
                        <div className="text-sm text-neutral-400">Payment history impact</div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-400">Payment History</span>
                          <span className="text-green-400">+45 points</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-400">Credit Mix</span>
                          <span className="text-green-400">+15 points</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-400">Credit Age</span>
                          <span className="text-green-400">+10 points</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Optimization Opportunities */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-white">Optimization Tips</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-neutral-800 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <Target className="w-4 h-4 text-[#1C8BFF] mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-white">Refinance Opportunity</p>
                            <p className="text-xs text-neutral-400">
                              Equipment loan at 5.25% could save $150/mo at 4.25%
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-neutral-800 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <DollarSign className="w-4 h-4 text-green-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-white">Extra Payment Impact</p>
                            <p className="text-xs text-neutral-400">
                              $500/mo extra would save $12,000 in interest
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-neutral-800 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <CreditCard className="w-4 h-4 text-orange-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-white">Credit Utilization</p>
                            <p className="text-xs text-neutral-400">
                              25% usage is optimal, consider increasing limit
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}