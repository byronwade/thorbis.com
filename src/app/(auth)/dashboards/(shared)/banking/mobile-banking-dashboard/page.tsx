import {
  Card,
  CardContent
} from '@/components/ui/card';
'use client'

import React, { useState } from 'react'

import { Button } from '@/components/ui'
import { Badge } from '@/components/ui'
import { MobileNavigation } from '@/components/banking/mobile-navigation'
import { GestureNavigation } from '@/components/banking/gesture-navigation'
import { FloatingActionButton, SpeedDial } from '@/components/banking/floating-action-button'
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
  Target,
  Users,
  ShoppingCart,
  Coffee,
  Fuel,
  Utensils,
  Car,
  Home,
  Briefcase,
  PieChart,
  BarChart3,
  Activity,
  CheckCircle,
  Bell,
  Calendar,
  Receipt,
  Camera,
  Globe,
  Fingerprint,
  Shield,
  Star,
  HelpCircle
} from 'lucide-react'

export default function MobileBankingDashboard() {
  const [showBalance, setShowBalance] = useState(true)
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [refreshing, setRefreshing] = useState(false)

  // Enhanced mobile user data
  const user = {
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    avatar: undefined,
    tier: 'premium' as const
  }

  // Enhanced account data
  const accounts = [
    {
      id: 1,
      name: 'Premium Checking',
      balance: 15247.89,
      accountNumber: '****2847',
      type: 'checking',
      trend: 'up',
      change: '+4.2%',
      recent: '+$1,250.00',
      color: 'from-blue-600 to-blue-700'
    },
    {
      id: 2,
      name: 'High-Yield Savings',
      balance: 34592.33,
      accountNumber: '****8291',
      type: 'savings',
      trend: 'up',
      change: '+2.8%',
      recent: '+$890.00',
      color: 'from-green-600 to-green-700'
    },
    {
      id: 3,
      name: 'Business Credit',
      balance: -2400.00,
      accountNumber: '****5573',
      type: 'credit',
      trend: 'down',
      change: '18% utilization',
      recent: '-$400.00',
      color: 'from-purple-600 to-purple-700'
    }
  ]

  // Enhanced transaction data
  const recentTransactions = [
    {
      id: 1,
      merchant: 'Apple Store',
      amount: -1299.00,
      date: 'Today, 3:45 PM',
      category: 'Electronics',
      icon: Smartphone,
      status: 'completed',
      location: 'San Francisco, CA'
    },
    {
      id: 2,
      merchant: 'Starbucks',
      amount: -6.75,
      date: 'Today, 9:15 AM',
      category: 'Food & Drink',
      icon: Coffee,
      status: 'completed',
      location: 'Downtown'
    },
    {
      id: 3,
      merchant: 'Client Payment',
      amount: 5000.00,
      date: 'Yesterday',
      category: 'Income',
      icon: Building2,
      status: 'completed',
      location: 'Wire Transfer'
    },
    {
      id: 4,
      merchant: 'Shell Gas Station',
      amount: -52.30,
      date: '2 days ago',
      category: 'Transportation',
      icon: Fuel,
      status: 'completed',
      location: 'Highway 101'
    },
    {
      id: 5,
      merchant: 'Uber Trip',
      amount: -28.50,
      date: '2 days ago',
      category: 'Transportation',
      icon: Car,
      status: 'pending',
      location: 'Downtown to Airport'
    }
  ]

  // AI insights
  const insights = [
    {
      title: 'Spending Alert',
      subtitle: 'You\'ve spent 25% more on dining this month','
      type: 'warning',
      icon: Utensils,
      action: 'View Details',
      priority: 'medium'
    },
    {
      title: 'Investment Opportunity',
      subtitle: 'Your savings could earn 2.1% more in high-yield account',
      type: 'success',
      icon: TrendingUp,
      action: 'Learn More',
      priority: 'high'
    },
    {
      title: 'Bill Reminder',
      subtitle: 'Credit card payment due in 3 days ($2,400)',
      type: 'info',
      icon: Calendar,
      action: 'Pay Now',
      priority: 'high'
    },
    {
      title: 'Security Update',
      subtitle: 'Enable biometric login for enhanced security',
      type: 'info',
      icon: Fingerprint,
      action: 'Enable',
      priority: 'low'
    }
  ]

  // Haptic feedback
  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [15],
        heavy: [25]
      }
      navigator.vibrate(patterns[type])
    }
  }

  // Navigation handler
  const handleNavigation = (path: string) => {
    console.log('Navigate to:', path)
    const page = path.split('/').pop() || 'dashboard'
    setCurrentPage(page)
  }

  // Gesture handlers
  const handleSwipeLeft = () => {
    console.log('Swipe left - next page')
    triggerHaptic('light')
  }

  const handleSwipeRight = () => {
    console.log('Swipe right - previous page')
    triggerHaptic('light')
  }

  const handlePullToRefresh = () => {
    setRefreshing(true)
    triggerHaptic('medium')
    
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false)
      console.log('Data refreshed')
    }, 2000)
  }

  const handleLongPress = (x: number, y: number) => {
    console.log('Long press at:', x, y)
    // Show contextual menu or options
  }

  // Custom FAB actions
  const fabActions = [
    {
      id: 'transfer',
      label: 'Quick Transfer',
      icon: ArrowUpDown,
      color: 'bg-blue-600 hover:bg-blue-700',
      onClick: () => {
        console.log('Quick transfer')
        triggerHaptic('medium')
      }
    },
    {
      id: 'pay',
      label: 'Pay Bills',
      icon: Receipt,
      color: 'bg-green-600 hover:bg-green-700',
      onClick: () => {
        console.log('Pay bills')
        triggerHaptic('medium')
      }
    },
    {
      id: 'deposit',
      label: 'Mobile Deposit',
      icon: Camera,
      color: 'bg-purple-600 hover:bg-purple-700',
      onClick: () => {
        console.log('Mobile deposit')
        triggerHaptic('medium')
      }
    },
    {
      id: 'scan',
      label: 'Scan Payment',
      icon: QrCode,
      color: 'bg-orange-600 hover:bg-orange-700',
      onClick: () => {
        console.log('Scan payment')
        triggerHaptic('medium')
      }
    }
  ]

  return (
    <GestureNavigation
      onSwipeLeft={handleSwipeLeft}
      onSwipeRight={handleSwipeRight}
      onPullToRefresh={handlePullToRefresh}
      onLongPress={handleLongPress}
      className="min-h-screen bg-neutral-950 text-white"
    >
      {/* Mobile Navigation Header */}
      <MobileNavigation
        currentPage={currentPage}
        onNavigate={handleNavigation}
        showBalance={showBalance}
        onBalanceToggle={() => setShowBalance(!showBalance)}
        user={user}
      />

      {/* Main Content */}
      <main className="pt-20 pb-32 px-4 space-y-6">
        {/* Balance Overview */}
        <Card className="bg-gradient-to-r from-blue-600 to-blue-700 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-2">Total Balance</p>
                <div className="flex items-center space-x-3">
                  {showBalance ? (
                    <p className="text-3xl font-bold text-white">$47,440.22</p>
                  ) : (
                    <p className="text-3xl font-bold text-white">••••••••</p>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowBalance(!showBalance)
                      triggerHaptic('light')
                    }}
                    className="p-2 text-blue-100 hover:bg-blue-500/20"
                  >
                    <Eye className="w-5 h-5" />
                  </Button>
                </div>
                <div className="flex items-center text-sm text-blue-200 mt-2">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>+3.2% this month</span>
                </div>
              </div>
              <div className="text-right">
                <Badge className="bg-blue-500/20 text-blue-100 border-blue-500/30 mb-2">
                  <Shield className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
                <p className="text-xs text-blue-200">Updated 1 min ago</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { icon: ArrowUpDown, label: 'Transfer', color: 'bg-blue-600' },
            { icon: Receipt, label: 'Pay Bills', color: 'bg-green-600' },
            { icon: QrCode, label: 'Scan QR', color: 'bg-purple-600' },
            { icon: Plus, label: 'More', color: 'bg-neutral-600' }
          ].map((action, index) => (
            <Button
              key={index}
              onClick={() => triggerHaptic('light')}
              className={`flex flex-col items-center space-y-2 h-20 ${action.color} border-0 text-white active:scale-95 transition-transform'}
            >
              <action.icon className="w-6 h-6" />
              <span className="text-xs font-medium">{action.label}</span>
            </Button>
          ))}
        </div>

        {/* Account Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">My Accounts</h2>
            <Button variant="ghost" size="sm" className="text-blue-400 hover:bg-blue-500/10">
              View All
            </Button>
          </div>
          
          <div className="space-y-3">
            {accounts.map((account) => (
              <Card key={account.id} className={'bg-gradient-to-r ${account.color} border-0'}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold text-white">{account.name}</h4>
                        {account.trend === 'up' ? (
                          <TrendingUp className="w-4 h-4 text-white" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mb-1">
                        {showBalance ? (
                          <p className="text-2xl font-bold text-white">
                            {account.balance < 0 ? '-' : '}${Math.abs(account.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </p>
                        ) : (
                          <p className="text-2xl font-bold text-white">••••••••</p>
                        )}
                      </div>
                      <p className="text-xs text-white/80">{account.accountNumber} • {account.change}</p>
                    </div>
                    <div className="text-right">
                      <div className={'w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-2'}>
                        {account.type === 'checking' ? <Wallet className="w-6 h-6 text-white" /> :
                         account.type === 'savings' ? <Building2 className="w-6 h-6 text-white" /> :
                         <CreditCard className="w-6 h-6 text-white" />}
                      </div>
                      <p className="text-xs text-white/70">{account.recent}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
            <Button variant="ghost" size="sm" className="text-blue-400 hover:bg-blue-500/10">
              View All
            </Button>
          </div>
          
          <div className="space-y-2">
            {recentTransactions.slice(0, 5).map((transaction) => (
              <Card key={transaction.id} className="bg-neutral-900 border-neutral-800">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-full bg-neutral-800">
                      <transaction.icon className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-white truncate">{transaction.merchant}</p>
                        <p className={'font-semibold text-sm ${
                          transaction.amount > 0 ? 'text-green-400' : 'text-white`
              }'}>'
                          {showBalance 
                            ? '${transaction.amount > 0 ? '+' : '}$${Math.abs(transaction.amount).toFixed(2)}'}
                            : '••••'
                          }
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-neutral-400 truncate">
                          {transaction.date} • {transaction.category}
                        </p>
                        <div className="flex items-center space-x-2">
                          {transaction.status === 'pending' ? (
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
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* AI Insights */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <Zap className="w-5 h-5 text-blue-400 mr-2" />
              Smart Insights
            </h2>
            <Button variant="ghost" size="sm" className="text-blue-400 hover:bg-blue-500/10">
              More
            </Button>
          </div>
          
          <div className="space-y-3">
            {insights.slice(0, 3).map((insight, index) => (
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
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-white text-sm">{insight.title}</h4>
                          <p className="text-xs text-neutral-400 mt-1">{insight.subtitle}</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => triggerHaptic('light')}
                          className="border-neutral-700 text-neutral-300 hover:bg-neutral-800 text-xs h-7"
                        >
                          {insight.action}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Spending Overview */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <PieChart className="w-5 h-5 text-blue-400 mr-2" />
            This Month's Spending'
          </h2>
          
          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="p-4">
              <div className="space-y-4">
                {[
                  { category: 'Food & Dining', amount: 1285, percentage: 32, color: 'bg-red-500', icon: Utensils },
                  { category: 'Transportation', amount: 890, percentage: 22, color: 'bg-blue-500', icon: Car },
                  { category: 'Shopping', amount: 720, percentage: 18, color: 'bg-green-500', icon: ShoppingCart },
                  { category: 'Bills & Utilities', amount: 680, percentage: 17, color: 'bg-purple-500', icon: Home },
                  { category: 'Entertainment', amount: 425, percentage: 11, color: 'bg-orange-500`, icon: Briefcase }
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
                    {showBalance ? '$4,000' : '••••••'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Floating Action Button */}
      <FloatingActionButton
        actions={fabActions}
        position="bottom-right"
        size="medium"
        triggerHaptic={triggerHaptic}
      />

      {/* Alternative Speed Dial (uncomment to use instead of FAB) */}
      {/* <SpeedDial
        actions={fabActions}
        position="bottom-right"
        triggerHaptic={triggerHaptic}
      /> */}
    </GestureNavigation>
  )
}