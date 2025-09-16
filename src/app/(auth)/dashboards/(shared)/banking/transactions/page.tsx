'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@thorbis/ui'
import { Button } from '@thorbis/ui'
import { Badge } from '@thorbis/ui'
import { Input } from '@thorbis/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@thorbis/ui'
import { Progress } from '@thorbis/ui'
import { SidebarTrigger } from '@thorbis/ui/client'
import { TransactionStream } from '../../components/transaction-stream'
import { 
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter,
  Download,
  Calendar,
  Building2,
  Coffee,
  Fuel,
  ShoppingCart,
  Utensils,
  Wifi,
  DollarSign,
  TrendingUp,
  Activity,
  Tags,
  Settings,
  Plus,
  Edit,
  Eye,
  Trash2,
  Check,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Target,
  Brain,
  MoreHorizontal,
  Archive,
  RefreshCw,
  FileText,
  PieChart
} from 'lucide-react'

export default function TransactionsPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([])
  const [showBulkActions, setShowBulkActions] = useState(false)

  // Enhanced transaction data with categorization
  const transactions = [
    {
      id: '1',
      type: 'inbound' as const,
      amount: 5000.00,
      description: 'Client Payment - Project Alpha',
      merchant: 'ABC Corporation',
      category: 'Income',
      subcategory: 'Professional Services',
      date: '2024-01-16',
      time: '2:30 PM',
      status: 'completed' as const,
      account: 'Business Checking',
      location: 'San Francisco, CA',
      confidence: 0.95,
      isAiCategorized: true,
      needsReview: false,
      tags: ['recurring', 'project-alpha', 'high-value']
    },
    {
      id: '2',
      type: 'outbound' as const,
      amount: 299.99,
      description: 'Software Subscription',
      merchant: 'Adobe Creative Suite',
      category: 'Software & Tools',
      subcategory: 'Design Software',
      date: '2024-01-16',
      time: '10:15 AM',
      status: 'completed' as const,
      account: 'Business Credit Card',
      cardLastFour: '1234',
      isRecurring: true,
      confidence: 0.98,
      isAiCategorized: true,
      needsReview: false,
      tags: ['recurring', 'subscription', 'tools']
    },
    {
      id: '3',
      type: 'outbound' as const,
      amount: 156.78,
      description: 'Office Coffee Supply',
      merchant: 'Starbucks Business',
      category: 'Office Supplies',
      subcategory: 'Food & Beverages',
      date: '2024-01-15',
      time: '9:15 AM',
      status: 'completed' as const,
      account: 'Business Credit Card',
      cardLastFour: '5678',
      location: 'Downtown Office',
      confidence: 0.92,
      isAiCategorized: true,
      needsReview: false,
      tags: ['office', 'recurring']
    },
    {
      id: '4',
      type: 'outbound' as const,
      amount: 425.00,
      description: 'Unknown Merchant Transaction',
      merchant: 'PAYPAL *UNKNOWN',
      category: 'Uncategorized',
      subcategory: null,
      date: '2024-01-15',
      time: '3:22 PM',
      status: 'completed' as const,
      account: 'Business Credit Card',
      cardLastFour: '1234',
      confidence: 0.45,
      isAiCategorized: false,
      needsReview: true,
      tags: ['needs-review', 'unknown-merchant']
    },
    {
      id: '5',
      type: 'outbound' as const,
      amount: 67.50,
      description: 'Gas Station - Shell',
      merchant: 'Shell Gas Station',
      category: 'Travel & Transportation',
      subcategory: 'Fuel',
      date: '2024-01-13',
      time: '8:30 AM',
      status: 'pending' as const,
      account: 'Business Credit Card',
      cardLastFour: '1234',
      location: 'Highway 101',
      confidence: 0.89,
      isAiCategorized: true,
      needsReview: false,
      tags: ['travel', 'fuel']
    }
  ]

  // Category definitions with ML insights
  const categories = [
    {
      id: 'income',
      name: 'Income',
      color: 'bg-green-500',
      icon: TrendingUp,
      subcategories: ['Professional Services', 'Sales Revenue', 'Investment Income', 'Other Income'],
      transactionCount: 12,
      totalAmount: 28500.00,
      rules: [
        { type: 'merchant', contains: ['client', 'customer'], confidence: 0.9 },
        { type: 'description', contains: ['payment', 'invoice', 'project'], confidence: 0.85 }
      ]
    },
    {
      id: 'software',
      name: 'Software & Tools',
      color: 'bg-blue-500',
      icon: Settings,
      subcategories: ['Design Software', 'Development Tools', 'Productivity Apps', 'Cloud Services'],
      transactionCount: 8,
      totalAmount: 1247.92,
      rules: [
        { type: 'merchant', contains: ['adobe', 'microsoft', 'google', 'slack'], confidence: 0.95 },
        { type: 'description', contains: ['subscription', 'license', 'saas'], confidence: 0.88 }
      ]
    },
    {
      id: 'office-supplies',
      name: 'Office Supplies',
      color: 'bg-purple-500',
      icon: Building2,
      subcategories: ['Food & Beverages', 'Equipment', 'Furniture', 'Stationery'],
      transactionCount: 15,
      totalAmount: 892.45,
      rules: [
        { type: 'merchant', contains: ['office depot', 'staples', 'starbucks', 'coffee'], confidence: 0.8 },
        { type: 'description', contains: ['office', 'supply', 'equipment'], confidence: 0.75 }
      ]
    },
    {
      id: 'travel',
      name: 'Travel & Transportation',
      color: 'bg-orange-500',
      icon: Fuel,
      subcategories: ['Fuel', 'Public Transport', 'Flights', 'Hotels', 'Rideshare'],
      transactionCount: 22,
      totalAmount: 1456.78,
      rules: [
        { type: 'merchant', contains: ['shell', 'chevron', 'uber', 'lyft', 'delta'], confidence: 0.92 },
        { type: 'description', contains: ['gas', 'fuel', 'transport', 'flight'], confidence: 0.87 }
      ]
    },
    {
      id: 'meals',
      name: 'Meals & Entertainment',
      color: 'bg-pink-500',
      icon: Utensils,
      subcategories: ['Business Meals', 'Team Events', 'Client Entertainment', 'Office Catering'],
      transactionCount: 18,
      totalAmount: 2134.90,
      rules: [
        { type: 'merchant', contains: ['restaurant', 'cafe', 'bar', 'catering'], confidence: 0.85 },
        { type: 'description', contains: ['lunch', 'dinner', 'meeting', 'event'], confidence: 0.8 }
      ]
    },
    {
      id: 'uncategorized',
      name: 'Uncategorized',
      color: 'bg-gray-500',
      icon: AlertCircle,
      subcategories: [],
      transactionCount: 5,
      totalAmount: 876.34,
      rules: []
    }
  ]

  // Categorization insights and statistics
  const categorizationStats = {
    totalTransactions: transactions.length,
    categorizedTransactions: transactions.filter(t => t.category !== 'Uncategorized').length,
    aiCategorizedTransactions: transactions.filter(t => t.isAiCategorized).length,
    needsReviewTransactions: transactions.filter(t => t.needsReview).length,
    averageConfidence: transactions.reduce((sum, t) => sum + t.confidence, 0) / transactions.length,
    topCategories: categories.slice(0, 3)
  }

  // ML categorization rules
  const categorizationRules = [
    {
      id: 'rule-1',
      name: 'Software Subscriptions Auto-Categorize',
      description: 'Automatically categorize recurring software subscriptions',
      isActive: true,
      conditions: [
        { field: 'merchant', operator: 'contains', value: 'adobe|microsoft|google|slack' },
        { field: 'isRecurring', operator: 'equals', value: 'true' },
        { field: 'amount', operator: 'between', value: '10-500' }
      ],
      category: 'Software & Tools',
      subcategory: 'Productivity Apps',
      confidence: 0.92,
      matchedTransactions: 23,
      created: '2024-01-10',
      lastModified: '2024-01-15'
    },
    {
      id: 'rule-2',
      name: 'Fuel Expense Classification',
      description: 'Classify gas station transactions as travel expenses',
      isActive: true,
      conditions: [
        { field: 'merchant', operator: 'contains', value: 'shell|chevron|bp|exxon|mobil' },
        { field: 'description', operator: 'contains', value: 'gas|fuel' }
      ],
      category: 'Travel & Transportation',
      subcategory: 'Fuel',
      confidence: 0.95,
      matchedTransactions: 45,
      created: '2024-01-05',
      lastModified: '2024-01-12'
    },
    {
      id: 'rule-3',
      name: 'Client Payment Recognition',
      description: 'Identify client payments and invoices as income',
      isActive: true,
      conditions: [
        { field: 'type', operator: 'equals', value: 'inbound' },
        { field: 'description', operator: 'contains', value: 'client|payment|invoice|project' },
        { field: 'amount', operator: 'greater_than', value: '1000' }
      ],
      category: 'Income',
      subcategory: 'Professional Services',
      confidence: 0.88,
      matchedTransactions: 12,
      created: '2024-01-08',
      lastModified: '2024-01-16'
    }
  ]

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header with SidebarTrigger */}
      <div className="flex items-center gap-4 mb-6">
        <div className="inline-flex items-center justify-center rounded-md text-neutral-400 hover:text-neutral-100 bg-neutral-800/50 hover:bg-neutral-700/50 transition-all duration-200 h-8 w-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
          <SidebarTrigger />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Transaction Categorization</h1>
          <p className="text-neutral-400 text-sm md:text-base">
            Manage transaction categories, rules, and bulk categorization
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3">
          <Button variant="outline" className="border-neutral-700 text-white hover:bg-neutral-800 h-10 md:h-auto">
            <Download className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button variant="outline" className="border-neutral-700 text-white hover:bg-neutral-800 h-10 md:h-auto">
            <Settings className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Settings</span>
          </Button>
          <Button className="bg-[#1C8BFF] hover:bg-[#1C8BFF]/90 text-white h-10 md:h-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Rule
          </Button>
        </div>
      </div>

      {/* Categorization Statistics - Mobile Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        <Card className="bg-neutral-900 border-neutral-800 p-4 md:p-6">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="p-2 md:p-3 rounded-lg bg-green-500/10">
              <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-500" />
            </div>
            <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-xs">
              {Math.round((categorizationStats.categorizedTransactions / categorizationStats.totalTransactions) * 100)}%
            </Badge>
          </div>
          <div className="space-y-2">
            <h3 className="text-xs md:text-sm font-medium text-neutral-400">Categorized Transactions</h3>
            <p className="text-xl md:text-2xl font-bold text-white">
              {categorizationStats.categorizedTransactions}/{categorizationStats.totalTransactions}
            </p>
            <div className="flex items-center text-xs md:text-sm text-green-500">
              <CheckCircle className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              <span>Classification complete</span>
            </div>
          </div>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800 p-4 md:p-6">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="p-2 md:p-3 rounded-lg bg-blue-500/10">
              <Brain className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />
            </div>
            <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 text-xs">
              AI-Powered
            </Badge>
          </div>
          <div className="space-y-2">
            <h3 className="text-xs md:text-sm font-medium text-neutral-400">AI Categorized</h3>
            <p className="text-xl md:text-2xl font-bold text-white">{categorizationStats.aiCategorizedTransactions}</p>
            <div className="flex items-center text-xs md:text-sm text-blue-500">
              <Zap className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              <span>{Math.round(categorizationStats.averageConfidence * 100)}% avg confidence</span>
            </div>
          </div>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800 p-4 md:p-6">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="p-2 md:p-3 rounded-lg bg-orange-500/10">
              <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-orange-500" />
            </div>
            <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 text-xs">
              Review
            </Badge>
          </div>
          <div className="space-y-2">
            <h3 className="text-xs md:text-sm font-medium text-neutral-400">Needs Review</h3>
            <p className="text-xl md:text-2xl font-bold text-white">{categorizationStats.needsReviewTransactions}</p>
            <div className="flex items-center text-xs md:text-sm text-orange-500">
              <Clock className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              <span>Manual review required</span>
            </div>
          </div>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800 p-4 md:p-6">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="p-2 md:p-3 rounded-lg bg-purple-500/10">
              <Target className="w-5 h-5 md:w-6 md:h-6 text-purple-500" />
            </div>
            <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20 text-xs">
              Active
            </Badge>
          </div>
          <div className="space-y-2">
            <h3 className="text-xs md:text-sm font-medium text-neutral-400">Active Rules</h3>
            <p className="text-xl md:text-2xl font-bold text-white">{categorizationRules.filter(r => r.isActive).length}</p>
            <div className="flex items-center text-xs md:text-sm text-purple-500">
              <RefreshCw className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              <span>Automated processing</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Tabs - Mobile Responsive */}
      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-neutral-900 border-neutral-800">
          <TabsTrigger value="transactions" className="data-[state=active]:bg-[#1C8BFF] data-[state=active]:text-white text-xs md:text-sm">
            <span className="hidden sm:inline">Transactions</span>
            <span className="sm:hidden">Trans.</span>
          </TabsTrigger>
          <TabsTrigger value="categories" className="data-[state=active]:bg-[#1C8BFF] data-[state=active]:text-white text-xs md:text-sm">
            <span className="hidden sm:inline">Categories</span>
            <span className="sm:hidden">Cat.</span>
          </TabsTrigger>
          <TabsTrigger value="rules" className="data-[state=active]:bg-[#1C8BFF] data-[state=active]:text-white text-xs md:text-sm">
            <span className="hidden sm:inline">ML Rules</span>
            <span className="sm:hidden">Rules</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-[#1C8BFF] data-[state=active]:text-white text-xs md:text-sm">
            <span className="hidden sm:inline">Analytics</span>
            <span className="sm:hidden">Stats</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="mt-4 md:mt-6">
          <div className="space-y-4 md:space-y-6">
            {/* Bulk Actions Bar - Mobile Responsive */}
            {selectedTransactions.length > 0 && (
              <Card className="bg-blue-900/20 border-blue-500/20 p-3 md:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
                  <div className="flex items-center gap-4">
                    <span className="text-blue-400 font-medium text-sm">
                      {selectedTransactions.length} transaction{selectedTransactions.length > 1 ? 's' : '} selected
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8 md:h-auto">
                      <Tags className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                      <span className="hidden sm:inline">Bulk Categorize</span>
                      <span className="sm:hidden">Categorize</span>
                    </Button>
                    <Button size="sm" variant="outline" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800 h-8 md:h-auto">
                      <Edit className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                      <span className="hidden sm:inline">Edit</span>
                    </Button>
                    <Button size="sm" variant="outline" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800 h-8 md:h-auto">
                      <Archive className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                      <span className="hidden sm:inline">Archive</span>
                    </Button>
                    <Button size="sm" variant="outline" className="border-red-700 text-red-300 hover:bg-red-800 h-8 md:h-auto">
                      <X className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                      <span className="hidden sm:inline">Clear</span>
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Transaction List with Categorization */}
            <Card className="bg-neutral-900 border-neutral-800">
              <div className="p-6 border-b border-neutral-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Transaction Categorization</h3>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <Input 
                        placeholder="Search transactions..."
                        className="pl-10 bg-neutral-800 border-neutral-700 text-white w-64"
                      />
                    </div>
                    <Button variant="outline" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                      <Filter className="w-4 h-4 mr-1" />
                      Filter
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 bg-neutral-800 rounded-lg hover:bg-neutral-750 transition-colors">
                      <div className="flex items-center space-x-4">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-neutral-600 bg-neutral-700 text-blue-500"
                          checked={selectedTransactions.includes(transaction.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTransactions([...selectedTransactions, transaction.id])
                            } else {
                              setSelectedTransactions(selectedTransactions.filter(id => id !== transaction.id))
                            }
                          }}
                        />
                        <div className="p-3 rounded-lg bg-neutral-700">
                          {transaction.type === 'inbound' ? (
                            <ArrowUpRight className="h-5 w-5 text-green-400" />
                          ) : (
                            <ArrowDownRight className="h-5 w-5 text-red-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{transaction.description}</h4>
                          <p className="text-sm text-neutral-400">{transaction.merchant} • {transaction.date}</p>
                          <div className="flex items-center gap-2 mt-2">
                            {transaction.needsReview && (
                              <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20 text-xs">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Needs Review
                              </Badge>
                            )}
                            {transaction.isAiCategorized && (
                              <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">
                                <Brain className="w-3 h-3 mr-1" />
                                AI: {Math.round(transaction.confidence * 100)}%
                              </Badge>
                            )}
                            <Badge className="bg-neutral-700 text-neutral-300 text-xs">
                              {transaction.category}
                              {transaction.subcategory && ' • ${transaction.subcategory}'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className={'text-lg font-bold ${transaction.type === 'inbound' ? 'text-green-500' : 'text-red-400'}'}>
                            {transaction.type === 'inbound' ? '+' : '-'}${transaction.amount.toLocaleString('en-US`, { minimumFractionDigits: 2 })}
                          </p>
                          <p className="text-xs text-neutral-400">{transaction.account}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                            <Tags className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          <div className="space-y-6">
            <Card className="bg-neutral-900 border-neutral-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Category Management</h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                    <FileText className="w-4 h-4 mr-1" />
                    Export
                  </Button>
                  <Button className="bg-[#1C8BFF] hover:bg-[#1C8BFF]/90">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Category
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => {
                  const IconComponent = category.icon
                  return (
                    <div key={category.id} className="p-4 bg-neutral-800 rounded-lg hover:bg-neutral-750 transition-colors">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={'p-3 rounded-lg ${category.color}/20'}>
                            <IconComponent className={'h-6 w-6 text-${category.color.split('-')[1]}-500'} />
                          </div>
                          <div>
                            <h4 className="font-medium text-white">{category.name}</h4>
                            <p className="text-xs text-neutral-400">{category.transactionCount} transactions</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="outline" size="sm" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-neutral-400">Total Amount</span>
                            <span className="font-medium text-white">
                              ${category.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                        
                        {category.subcategories.length > 0 && (
                          <div>
                            <p className="text-xs text-neutral-400 mb-2">Subcategories ({category.subcategories.length})</p>
                            <div className="flex flex-wrap gap-1">
                              {category.subcategories.slice(0, 3).map((sub) => (
                                <Badge key={sub} className="bg-neutral-700 text-neutral-300 text-xs">
                                  {sub}
                                </Badge>
                              ))}
                              {category.subcategories.length > 3 && (
                                <Badge className="bg-neutral-700 text-neutral-300 text-xs">
                                  +{category.subcategories.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {category.rules.length > 0 && (
                          <div>
                            <p className="text-xs text-neutral-400 mb-2">Auto-categorization Rules</p>
                            <div className="space-y-1">
                              {category.rules.map((rule, index) => (
                                <div key={index} className="text-xs text-neutral-300 bg-neutral-700 rounded px-2 py-1">
                                  {rule.type}: {rule.contains.join(', ')} ({Math.round(rule.confidence * 100)}%)
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rules" className="mt-6">
          <div className="space-y-6">
            <Card className="bg-neutral-900 border-neutral-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Machine Learning Categorization Rules</h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                    <Brain className="w-4 h-4 mr-1" />
                    Train Model
                  </Button>
                  <Button className="bg-[#1C8BFF] hover:bg-[#1C8BFF]/90">
                    <Plus className="w-4 h-4 mr-1" />
                    Create Rule
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                {categorizationRules.map((rule) => (
                  <div key={rule.id} className="p-4 bg-neutral-800 rounded-lg hover:bg-neutral-750 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-lg bg-neutral-700">
                          <Target className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{rule.name}</h4>
                          <p className="text-sm text-neutral-400">{rule.description}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <Badge className={rule.isActive ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'}>
                              {rule.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                              {Math.round(rule.confidence * 100)}% confidence
                            </Badge>
                            <span className="text-xs text-neutral-400">{rule.matchedTransactions} matches</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="border-red-700 text-red-300 hover:bg-red-800">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-sm font-medium text-white mb-2">Conditions</h5>
                        <div className="space-y-2">
                          {rule.conditions.map((condition, index) => (
                            <div key={index} className="text-xs text-neutral-300 bg-neutral-700 rounded px-3 py-2">
                              <span className="font-medium">{condition.field}</span> {condition.operator} "{condition.value}"
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="text-sm font-medium text-white mb-2">Target Classification</h5>
                        <div className="space-y-2">
                          <div className="text-sm text-neutral-300">
                            <span className="font-medium">Category:</span> {rule.category}
                          </div>
                          <div className="text-sm text-neutral-300">
                            <span className="font-medium">Subcategory:</span> {rule.subcategory}
                          </div>
                          <div className="text-xs text-neutral-400">
                            Created: {rule.created} • Modified: {rule.lastModified}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="space-y-6">
            {/* Category Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-neutral-900 border-neutral-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Category Distribution</h3>
                  <PieChart className="w-5 h-5 text-neutral-400" />
                </div>
                <div className="space-y-4">
                  {categories.slice(0, 5).map((category, index) => {
                    const percentage = (category.transactionCount / transactions.length) * 100
                    return (
                      <div key={category.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-neutral-300">{category.name}</span>
                          <span className="text-sm font-medium text-white">{Math.round(percentage)}%</span>
                        </div>
                        <Progress value={percentage} className="h-2 bg-neutral-800" />
                      </div>
                    )
                  })}
                </div>
              </Card>

              <Card className="bg-neutral-900 border-neutral-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Categorization Performance</h3>
                  <BarChart3 className="w-5 h-5 text-neutral-400" />
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-400">Overall Accuracy</span>
                    <span className="text-lg font-bold text-green-400">
                      {Math.round(categorizationStats.averageConfidence * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-400">Auto-Categorization Rate</span>
                    <span className="text-lg font-bold text-blue-400">
                      {Math.round((categorizationStats.aiCategorizedTransactions / categorizationStats.totalTransactions) * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-400">Manual Review Required</span>
                    <span className="text-lg font-bold text-orange-400">
                      {Math.round((categorizationStats.needsReviewTransactions / categorizationStats.totalTransactions) * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-400">Active ML Rules</span>
                    <span className="text-lg font-bold text-purple-400">
                      {categorizationRules.filter(r => r.isActive).length}
                    </span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Monthly Trends */}
            <Card className="bg-neutral-900 border-neutral-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Categorization Trends</h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                    <Calendar className="w-4 h-4 mr-1" />
                    This Month
                  </Button>
                  <Button variant="outline" size="sm" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="h-64 bg-neutral-800 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-neutral-500 mx-auto mb-2" />
                  <p className="text-neutral-400">Categorization Trends Chart</p>
                  <p className="text-xs text-neutral-500">Monthly breakdown of transaction categorization performance</p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}