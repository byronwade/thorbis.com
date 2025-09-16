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
  BarChart3,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  FileText,
  DollarSign,
  PieChart,
  Activity,
  Target,
  Eye,
  Settings,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  CreditCard,
  Building2,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Plus,
  Search
} from 'lucide-react'

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedPeriod, setSelectedPeriod] = useState('monthly')
  const [selectedView, setSelectedView] = useState('summary')

  // Financial Overview KPI Data
  const financialOverview = {
    totalAssets: 287432.01,
    totalLiabilities: 125890.45,
    netWorth: 161541.56,
    monthlyRevenue: 45231.89,
    monthlyExpenses: 28456.12,
    netIncome: 16775.77,
    cashFlow: {
      inflow: 52340.12,
      outflow: 35564.35,
      net: 16775.77
    },
    growthMetrics: {
      revenueGrowth: 12.5,
      expenseGrowth: -8.2,
      netWorthGrowth: 15.8,
      assetGrowth: 6.4
    }
  }

  // Cash Flow Chart Data (mock data for visualization)
  const cashFlowData = [
    { month: 'Jan', inflow: 48500, outflow: 32100, net: 16400 },
    { month: 'Feb', inflow: 52200, outflow: 28900, net: 23300 },
    { month: 'Mar', inflow: 49800, outflow: 31200, net: 18600 },
    { month: 'Apr', inflow: 54100, outflow: 29800, net: 24300 },
    { month: 'May', inflow: 51900, outflow: 33600, net: 18300 },
    { month: 'Jun', inflow: 55400, outflow: 30200, net: 25200 },
    { month: 'Jul', inflow: 53200, outflow: 32800, net: 20400 },
    { month: 'Aug', inflow: 56800, outflow: 31500, net: 25300 },
    { month: 'Sep', inflow: 54600, outflow: 34200, net: 20400 },
    { month: 'Oct', inflow: 58200, outflow: 32600, net: 25600 },
    { month: 'Nov', inflow: 56400, outflow: 35100, net: 21300 },
    { month: 'Dec', inflow: 59800, outflow: 33900, net: 25900 }
  ]

  // Performance Metrics
  const performanceMetrics = [
    {
      category: 'Revenue Performance',
      metrics: [
        { name: 'Revenue Growth Rate', value: '12.5%', trend: 'up', target: '15%', progress: 83 },
        { name: 'Monthly Recurring Revenue', value: '$28,450', trend: 'up', target: '$30,000', progress: 95 },
        { name: 'Revenue Per Transaction', value: '$245.67', trend: 'up', target: '$250', progress: 98 }
      ]
    },
    {
      category: 'Cost Management',
      metrics: [
        { name: 'Operating Expense Ratio', value: '62.8%', trend: 'down', target: '60%', progress: 78 },
        { name: 'Cost Per Transaction', value: '$18.45', trend: 'down', target: '$15', progress: 65 },
        { name: 'Fixed Cost Coverage', value: '3.2x', trend: 'up', target: '4x', progress: 80 }
      ]
    },
    {
      category: 'Profitability',
      metrics: [
        { name: 'Gross Margin', value: '68.5%', trend: 'up', target: '70%', progress: 98 },
        { name: 'Net Profit Margin', value: '22.4%', trend: 'up', target: '25%', progress: 90 },
        { name: 'Return on Assets', value: '8.7%', trend: 'up', target: '10%', progress: 87 }
      ]
    }
  ]

  // Expense Categorization Data
  const expenseCategories = [
    { category: 'Operations', budget: 15000, actual: 13200, variance: -1800, percentage: 88 },
    { category: 'Marketing', budget: 8000, actual: 9500, variance: 1500, percentage: 119 },
    { category: 'Technology', budget: 5500, actual: 4800, variance: -700, percentage: 87 },
    { category: 'Personnel', budget: 12000, actual: 11900, variance: -100, percentage: 99 },
    { category: 'Facilities', budget: 3500, actual: 3200, variance: -300, percentage: 91 },
    { category: 'Professional Services', budget: 2500, actual: 2900, variance: 400, percentage: 116 }
  ]

  // Report Templates
  const reportTemplates = [
    {
      id: 1,
      name: 'Executive Financial Summary',
      description: 'High-level financial overview for executives and stakeholders',
      category: 'Executive Reports',
      frequency: 'Monthly',
      lastGenerated: '2024-01-15',
      size: '2.4 MB',
      format: 'PDF',
      status: 'active'
    },
    {
      id: 2,
      name: 'Detailed Cash Flow Analysis',
      description: 'Comprehensive cash flow analysis with forecasting and variance reporting',
      category: 'Financial Analysis',
      frequency: 'Weekly',
      lastGenerated: '2024-01-16',
      size: '3.8 MB',
      format: 'PDF',
      status: 'active'
    },
    {
      id: 3,
      name: 'Budget vs Actual Performance',
      description: 'Budget performance analysis with category-wise variance reporting',
      category: 'Budget Reports',
      frequency: 'Monthly',
      lastGenerated: '2024-01-01',
      size: '1.9 MB',
      format: 'PDF',
      status: 'active'
    },
    {
      id: 4,
      name: 'Transaction Analysis Export',
      description: 'Detailed transaction data with categorization for external analysis',
      category: 'Data Export',
      frequency: 'Daily',
      lastGenerated: '2024-01-16',
      size: '892 KB',
      format: 'CSV',
      status: 'active'
    },
    {
      id: 5,
      name: 'Compliance & Audit Report',
      description: 'Regulatory compliance report with audit trail documentation',
      category: 'Compliance',
      frequency: 'Quarterly',
      lastGenerated: '2024-01-01',
      size: '4.2 MB',
      format: 'PDF',
      status: 'active'
    },
    {
      id: 6,
      name: 'Year-End Tax Summary',
      description: 'Comprehensive tax preparation summary with supporting documentation',
      category: 'Tax Reports',
      frequency: 'Yearly',
      lastGenerated: '2023-12-31',
      size: '5.1 MB',
      format: 'PDF',
      status: 'active'
    }
  ]

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Reports & Analytics</h1>
            <p className="text-neutral-400">
              Comprehensive financial reporting and business intelligence dashboard
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-neutral-700 text-white hover:bg-neutral-800">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <Button variant="outline" className="border-neutral-700 text-white hover:bg-neutral-800">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button className="bg-[#1C8BFF] hover:bg-[#1C8BFF]/90 text-white">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </div>

      {/* Financial Overview KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-neutral-900 border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-500/10">
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
            <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
              +{financialOverview.growthMetrics.revenueGrowth}%
            </Badge>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-neutral-400">Total Revenue</h3>
            <p className="text-2xl font-bold text-white">
              ${financialOverview.monthlyRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <div className="flex items-center text-sm text-green-500">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              <span>vs. last month</span>
            </div>
          </div>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-red-500/10">
              <TrendingDown className="w-6 h-6 text-red-500" />
            </div>
            <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
              {Math.abs(financialOverview.growthMetrics.expenseGrowth)}%
            </Badge>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-neutral-400">Total Expenses</h3>
            <p className="text-2xl font-bold text-white">
              ${financialOverview.monthlyExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <div className="flex items-center text-sm text-green-500">
              <ArrowDownRight className="w-4 h-4 mr-1" />
              <span>reduced from last month</span>
            </div>
          </div>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-500/10">
              <TrendingUp className="w-6 h-6 text-blue-500" />
            </div>
            <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
              +{financialOverview.growthMetrics.netWorthGrowth}%
            </Badge>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-neutral-400">Net Income</h3>
            <p className="text-2xl font-bold text-white">
              ${financialOverview.netIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <div className="flex items-center text-sm text-blue-500">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              <span>profit margin</span>
            </div>
          </div>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-purple-500/10">
              <Wallet className="w-6 h-6 text-purple-500" />
            </div>
            <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">
              +{financialOverview.growthMetrics.assetGrowth}%
            </Badge>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-neutral-400">Net Worth</h3>
            <p className="text-2xl font-bold text-white">
              ${financialOverview.netWorth.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <div className="flex items-center text-sm text-purple-500">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              <span>asset growth</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-neutral-900 border-neutral-800">
          <TabsTrigger value="overview" className="data-[state=active]:bg-[#1C8BFF] data-[state=active]:text-white">
            Overview
          </TabsTrigger>
          <TabsTrigger value="cashflow" className="data-[state=active]:bg-[#1C8BFF] data-[state=active]:text-white">
            Cash Flow
          </TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-[#1C8BFF] data-[state=active]:text-white">
            Performance
          </TabsTrigger>
          <TabsTrigger value="expenses" className="data-[state=active]:bg-[#1C8BFF] data-[state=active]:text-white">
            Expenses
          </TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-[#1C8BFF] data-[state=active]:text-white">
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue & Expense Breakdown */}
            <Card className="bg-neutral-900 border-neutral-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Revenue & Expense Breakdown</h3>
                <PieChart className="w-5 h-5 text-neutral-400" />
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-neutral-300">Total Revenue</span>
                    <span className="text-sm font-medium text-green-500">
                      ${financialOverview.monthlyRevenue.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={100} className="h-3 bg-neutral-800" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-neutral-300">Operating Expenses</span>
                    <span className="text-sm font-medium text-red-400">
                      ${financialOverview.monthlyExpenses.toLocaleString()}
                    </span>
                  </div>
                  <Progress 
                    value={(financialOverview.monthlyExpenses / financialOverview.monthlyRevenue) * 100} 
                    className="h-3 bg-neutral-800"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-neutral-300">Net Income</span>
                    <span className="text-sm font-medium text-blue-400">
                      ${financialOverview.netIncome.toLocaleString()}
                    </span>
                  </div>
                  <Progress 
                    value={(financialOverview.netIncome / financialOverview.monthlyRevenue) * 100} 
                    className="h-3 bg-neutral-800"
                  />
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-neutral-900 border-neutral-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Quick Report Actions</h3>
                <BarChart3 className="w-5 h-5 text-neutral-400" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Button className="h-16 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 flex flex-col items-center justify-center">
                  <FileText className="w-5 h-5 mb-1" />
                  <span className="text-xs">Generate Statement</span>
                </Button>
                <Button variant="outline" className="h-16 border-neutral-700 text-neutral-300 hover:bg-neutral-800 flex flex-col items-center justify-center">
                  <Download className="w-5 h-5 mb-1" />
                  <span className="text-xs">Export Data</span>
                </Button>
                <Button variant="outline" className="h-16 border-neutral-700 text-neutral-300 hover:bg-neutral-800 flex flex-col items-center justify-center">
                  <TrendingUp className="w-5 h-5 mb-1" />
                  <span className="text-xs">View Trends</span>
                </Button>
                <Button variant="outline" className="h-16 border-neutral-700 text-neutral-300 hover:bg-neutral-800 flex flex-col items-center justify-center">
                  <Settings className="w-5 h-5 mb-1" />
                  <span className="text-xs">Customize</span>
                </Button>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cashflow" className="mt-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Cash Flow Chart */}
            <Card className="bg-neutral-900 border-neutral-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Interactive Cash Flow Analysis</h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                    <Calendar className="w-4 h-4 mr-1" />
                    Monthly
                  </Button>
                  <Button variant="outline" size="sm" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                    Quarterly
                  </Button>
                  <Button variant="outline" size="sm" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                    Yearly
                  </Button>
                </div>
              </div>
              <div className="h-80 bg-neutral-800 rounded-lg flex items-center justify-center mb-6">
                <p className="text-neutral-400">Interactive Cash Flow Chart - Chart.js/Recharts Integration</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-neutral-400">Total Inflow</p>
                  <p className="text-xl font-bold text-green-500">${financialOverview.cashFlow.inflow.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-neutral-400">Total Outflow</p>
                  <p className="text-xl font-bold text-red-400">${financialOverview.cashFlow.outflow.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-neutral-400">Net Cash Flow</p>
                  <p className="text-xl font-bold text-blue-400">${financialOverview.cashFlow.net.toLocaleString()}</p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <div className="space-y-6">
            {performanceMetrics.map((category, index) => (
              <Card key={index} className="bg-neutral-900 border-neutral-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">{category.category}</h3>
                  <Target className="w-5 h-5 text-neutral-400" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {category.metrics.map((metric, metricIndex) => (
                    <div key={metricIndex} className="p-4 bg-neutral-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-neutral-400">{metric.name}</span>
                        {metric.trend === 'up' ? (
                          <ArrowUpRight className="w-4 h-4 text-green-500" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      <p className="text-xl font-bold text-white mb-2">{metric.value}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-neutral-400">
                          <span>Target: {metric.target}</span>
                          <span>{metric.progress}%</span>
                        </div>
                        <Progress value={metric.progress} className="h-2 bg-neutral-700" />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="expenses" className="mt-6">
          <div className="space-y-6">
            <Card className="bg-neutral-900 border-neutral-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Budget vs Actual Expense Analysis</h3>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Under Budget</Badge>
                  <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Over Budget</Badge>
                </div>
              </div>
              <div className="space-y-4">
                {expenseCategories.map((category, index) => (
                  <div key={index} className="p-4 bg-neutral-800 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-white font-medium">{category.category}</h4>
                        <div className="flex items-center gap-4 text-sm text-neutral-400">
                          <span>Budget: ${category.budget.toLocaleString()}</span>
                          <span>Actual: ${category.actual.toLocaleString()}</span>
                          <span className={category.variance < 0 ? 'text-green-500' : 'text-red-400'}>
                            Variance: {category.variance > 0 ? '+' : '}${category.variance.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={'text-lg font-bold ${category.percentage <= 100 ? 'text-green-500' : 'text-red-400'
              }'}>'
                          {category.percentage}%
                        </div>
                        <div className="text-xs text-neutral-400">of budget</div>
                      </div>
                    </div>
                    <Progress 
                      value={Math.min(category.percentage, 100)} 
                      className={'h-2 ${category.percentage <= 100 ? 'bg-neutral-700' : 'bg-red-900/20'
              }'} '
                    />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <div className="space-y-6">
            {/* Generated Reports */}
            <Card className="bg-neutral-900 border-neutral-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Report Templates & Generated Reports</h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                    <Search className="w-4 h-4 mr-1" />
                    Search
                  </Button>
                  <Button className="bg-[#1C8BFF] hover:bg-[#1C8BFF]/90">
                    <Plus className="w-4 h-4 mr-1" />
                    Create Report
                  </Button>
                </div>
              </div>
              <div className="space-y-4">
                {reportTemplates.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 bg-neutral-800 rounded-lg hover:bg-neutral-750 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 rounded-lg bg-neutral-700">
                        <FileText className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{report.name}</h4>
                        <p className="text-sm text-neutral-400 mb-2">{report.description}</p>
                        <div className="flex items-center space-x-4">
                          <Badge className={
                            report.category.includes('Executive') ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                            report.category.includes('Financial') ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                            report.category.includes('Budget') ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                            report.category.includes('Compliance') ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                            report.category.includes('Tax') ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                            'bg-neutral-500/10 text-neutral-400 border-neutral-500/20'
                          }>
                            {report.category}
                          </Badge>
                          <span className="text-xs text-neutral-400">{report.frequency}</span>
                          <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {report.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right text-sm">
                        <p className="text-neutral-400">Last Generated</p>
                        <p className="text-white">{report.lastGenerated}</p>
                        <p className="text-neutral-400">{report.size} • {report.format}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" className="bg-[#1C8BFF] hover:bg-[#1C8BFF]/90">
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
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