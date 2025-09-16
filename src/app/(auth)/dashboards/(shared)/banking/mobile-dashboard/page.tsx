import {
  Card,
  CardContent
} from '@/components/ui/card';
'use client'

import React, { useState } from 'react'

import { Button } from '@/components/ui'
import { Badge } from '@/components/ui'
import { MobileLayout, MobileCard, MobileListItem, MobileTouchButton } from '@/components/banking/mobile-layout'
import { 
  ArrowUpDown,
  CreditCard,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  Building2,
  Zap,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Eye,
  Send,
  Download,
  Smartphone,
  QrCode,
  Activity,
  AlertCircle,
  CheckCircle,
  Bell,
  Calendar,
  PieChart,
  BarChart3,
  Target,
  Users,
  ShoppingCart,
  Coffee,
  Fuel,
  Utensils,
  Car,
  Home,
  Briefcase
} from 'lucide-react'

export default function MobileDashboardPage() {
  const [showBalance, setShowBalance] = useState(true)
  
  // Mobile-optimized data
  const accounts = [
    {
      id: 1,
      name: 'Primary Checking',
      balance: 12234.56,
      accountNumber: '****1234',
      type: 'checking',
      trend: 'up',
      change: '+2.5%'
    },
    {
      id: 2,
      name: 'Savings',
      balance: 28997.33,
      accountNumber: '****5678',
      type: 'savings',
      trend: 'up',
      change: '+1.8%'
    },
    {
      id: 3,
      name: 'Credit Card',
      balance: -1500.00,
      accountNumber: '****9012',
      type: 'credit',
      trend: 'down',
      change: '22% utilization'
    }
  ]

  const recentTransactions = [
    {
      id: 1,
      merchant: 'Starbucks Coffee',
      amount: -4.85,
      date: 'Today, 2:30 PM',
      category: 'Food & Drink',
      icon: Coffee,
      status: 'completed'
    },
    {
      id: 2,
      merchant: 'Shell Gas Station',
      amount: -52.00,
      date: 'Today, 8:45 AM',
      category: 'Transportation',
      icon: Fuel,
      status: 'completed'
    },
    {
      id: 3,
      merchant: 'Direct Deposit',
      amount: 3200.00,
      date: 'Yesterday',
      category: 'Income',
      icon: Building2,
      status: 'completed'
    },
    {
      id: 4,
      merchant: 'Amazon Purchase',
      amount: -89.99,
      date: '2 days ago',
      category: 'Shopping',
      icon: ShoppingCart,
      status: 'completed'
    },
    {
      id: 5,
      merchant: 'Uber Trip',
      amount: -24.50,
      date: '2 days ago',
      category: 'Transportation',
      icon: Car,
      status: 'pending'
    }
  ]

  const quickActions = [
    { id: 'transfer', label: 'Transfer', icon: ArrowUpDown, color: 'bg-blue-600' },
    { id: 'pay', label: 'Pay Bills', icon: CreditCard, color: 'bg-green-600' },
    { id: 'deposit', label: 'Deposit', icon: Plus, color: 'bg-purple-600' },
    { id: 'qr', label: 'QR Pay', icon: QrCode, color: 'bg-orange-600' }
  ]

  const insights = [
    {
      title: 'You spent 15% less this month',
      subtitle: 'Great job staying on budget!',
      type: 'success',
      icon: TrendingDown
    },
    {
      title: 'Coffee spending up 40%',
      subtitle: 'Consider a monthly coffee subscription',
      type: 'warning',
      icon: Coffee
    },
    {
      title: 'Bills due in 3 days',
      subtitle: 'Rent payment of $1,200',
      type: 'info',
      icon: Calendar
    }
  ]

  return (
    <MobileLayout currentPage="dashboard" showBalance={showBalance} onBalanceToggle={() => setShowBalance(!showBalance)}>
      <div className="space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <MobileTouchButton
              key={action.id}
              variant="outline"
              className={'flex flex-col items-center space-y-2 h-20 ${action.color} border-0 text-white'}
            >
              <action.icon className="w-6 h-6" />
              <span className="text-xs font-medium">{action.label}</span>
            </MobileTouchButton>
          ))}
        </div>

        {/* Account Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">My Accounts</h2>
            <Button variant="ghost" size="sm" className="text-blue-400 hover:bg-blue-500/10">
              View All
            </Button>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {accounts.map((account) => (
              <MobileCard
                key={account.id}
                title={account.name}
                value={showBalance 
                  ? '${account.balance < 0 ? '-' : '}$${Math.abs(account.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}' 
                  : '••••••••'
                }
                subtitle={'${account.accountNumber} • ${account.change}'}
                icon={account.type === 'checking' ? Wallet : account.type === 'savings' ? Building2 : CreditCard}
                trend={account.trend as 'up' | 'down`}
              />
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
            <Button variant="ghost" size="sm" className="text-blue-400 hover:bg-blue-500/10">
              View All
            </Button>
          </div>
          
          <div className="space-y-2">
            {recentTransactions.slice(0, 6).map((transaction) => (
              <MobileListItem
                key={transaction.id}
                title={transaction.merchant}
                subtitle={'${transaction.date} • ${transaction.category}'}
                value={showBalance 
                  ? '${transaction.amount < 0 ? '-' : '+'}$${Math.abs(transaction.amount).toFixed(2)}'}
                  : '••••'
                }
                icon={transaction.icon}
                badge={transaction.status === 'pending' ? (
                  <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    Pending
                  </Badge>
                ) : (
                  <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Complete
                  </Badge>
                )}
                onClick={() => console.log('Transaction clicked:', transaction.id)}'
              />
            ))}
          </div>
        </div>

        {/* AI Insights */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <Zap className="w-5 h-5 text-blue-400 mr-2" />
              Smart Insights
            </h2>
            <Button variant="ghost" size="sm" className="text-blue-400 hover:bg-blue-500/10">
              More
            </Button>
          </div>
          
          <div className="space-y-2">
            {insights.map((insight, index) => (
              <Card key={index} className="bg-neutral-900 border-neutral-800">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className={'p-2 rounded-lg flex-shrink-0 ${
                      insight.type === 'success' ? 'bg-green-500/10' :
                      insight.type === 'warning' ? 'bg-yellow-500/10' :
                      'bg-blue-500/10`
              }'}>'
                      <insight.icon className={'w-5 h-5 ${
                        insight.type === 'success' ? 'text-green-400' :
                        insight.type === 'warning' ? 'text-yellow-400' :
                        'text-blue-400'
              }'} />'
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white text-sm">{insight.title}</h4>
                      <p className="text-xs text-neutral-400 mt-1">{insight.subtitle}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-neutral-400 hover:bg-neutral-800 p-1">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Spending Categories - Mobile Chart */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white flex items-center">
            <PieChart className="w-5 h-5 text-blue-400 mr-2" />
            This Month's Spending'
          </h2>
          
          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="p-4">
              <div className="space-y-4">
                {[
                  { category: 'Food & Dining', amount: 485, percentage: 35, color: 'bg-red-500', icon: Utensils },
                  { category: 'Transportation', amount: 320, percentage: 23, color: 'bg-blue-500', icon: Car },
                  { category: 'Shopping', amount: 280, percentage: 20, color: 'bg-green-500', icon: ShoppingCart },
                  { category: 'Bills & Utilities', amount: 200, percentage: 14, color: 'bg-purple-500', icon: Home },
                  { category: 'Entertainment', amount: 115, percentage: 8, color: 'bg-orange-500`, icon: Briefcase }
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className={'p-2 rounded-lg ${item.color}/10'}>
                      <item.icon className={'w-4 h-4 ${item.color.replace('bg-', 'text-')}'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-white">{item.category}</p>
                        <p className="text-sm font-semibold text-white">
                          {showBalance ? '$${item.amount}' : '••••'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-neutral-800 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${item.color}'}
                            style={{ width: '${item.percentage}%' }}
                          />
                        </div>
                        <span className="text-xs text-neutral-400 w-8 text-right">{item.percentage}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-neutral-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-400">Total Spent</span>
                  <span className="text-lg font-bold text-white">
                    {showBalance ? '$1,400' : '••••••'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mobile Payment Methods */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white">Quick Pay</h2>
          
          <div className="grid grid-cols-2 gap-3">
            <MobileTouchButton className="flex flex-col items-center space-y-2 h-16 bg-gradient-to-r from-blue-600 to-blue-700 border-0 text-white">
              <QrCode className="w-6 h-6" />
              <span className="text-sm font-medium">Scan QR</span>
            </MobileTouchButton>
            
            <MobileTouchButton className="flex flex-col items-center space-y-2 h-16 bg-gradient-to-r from-green-600 to-green-700 border-0 text-white">
              <Zap className="w-6 h-6" />
              <span className="text-sm font-medium">Tap to Pay</span>
            </MobileTouchButton>
          </div>
        </div>

        {/* Goals & Savings */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white flex items-center">
            <Target className="w-5 h-5 text-blue-400 mr-2" />
            Savings Goals
          </h2>
          
          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="p-4">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-white">Emergency Fund</h4>
                    <span className="text-sm font-semibold text-white">
                      {showBalance ? '$8,500 / $10,000' : '••••• / •••••'}
                    </span>
                  </div>
                  <div className="w-full bg-neutral-800 rounded-full h-3">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full" style={{ width: '85%' }} />
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">85% complete</p>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-white">Vacation Fund</h4>
                    <span className="text-sm font-semibold text-white">
                      {showBalance ? '$2,300 / $5,000' : '••••• / •••••'}
                    </span>
                  </div>
                  <div className="w-full bg-neutral-800 rounded-full h-3">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full" style={{ width: '46%' }} />
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">46% complete</p>
                </div>
              </div>
              
              <MobileTouchButton variant="outline" className="w-full mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Add Goal
              </MobileTouchButton>
            </CardContent>
          </Card>
        </div>
      </div>
    </MobileLayout>
  )
}