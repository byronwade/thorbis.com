'use client'

import React, { useState } from 'react'

import { 
  Wallet,
  PiggyBank,
  CreditCard,
  TrendingUp,
  Eye,
  EyeOff,
  MoreHorizontal,
  Plus,
  Building2,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Shield,
  Target,
  CheckCircle,
  AlertCircle,
  Zap,
  Users,
  Settings,
  HelpCircle
} from 'lucide-react'
import { Badge } from '@/components/ui/badge';

// Simple Card components
const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={'rounded-lg border ${className}'}>
    {children}
  </div>
)

const CardContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={className}>
    {children}
  </div>
)

// Simple Button component
const Button = ({ children, className, variant, size, onClick, ...props }: { 
  children: React.ReactNode; 
  className?: string; 
  variant?: string; 
  size?: string;
  onClick?: () => void;
  [key: string]: any;
}) => (
  <button 
    className={'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors duration-200 ${
      variant === 'outline' 
        ? 'border border-neutral-700 bg-transparent hover:bg-neutral-800' 
        : 'bg-blue-600 hover:bg-blue-700 text-white'
    } ${
      size === 'sm' ? 'h-8 px-3 text-xs' : 'h-10 px-4'} ${className}'}
    onClick={onClick}
    {...props}
  >
    {children}
  </button>
)

export default function AccountsPage() {
  const [showBalance, setShowBalance] = useState(true)
  const [selectedAccount, setSelectedAccount] = useState<string>(')

  // Sample account data
  const accounts = [
    {
      id: '1',
      name: 'Main Business Checking',
      type: 'checking',
      balance: 45250.80,
      available: 45250.80,
      accountNumber: '****7890',
      routingNumber: '123456789',
      isLinked: true,
      lastActivity: '2024-01-16T10:30:00Z'
    },
    {
      id: '2',
      name: 'Business Savings',
      type: 'savings',
      balance: 125780.50,
      available: 125780.50,
      accountNumber: '****1234',
      routingNumber: '123456789',
      isLinked: true,
      lastActivity: '2024-01-15T14:20:00Z'
    },
    {
      id: '3',
      name: 'Payroll Account',
      type: 'checking',
      balance: 28950.00,
      available: 28950.00,
      accountNumber: '****5678',
      routingNumber: '123456789',
      isLinked: true,
      lastActivity: '2024-01-16T09:15:00Z'
    }
  ]

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'checking':
        return <Wallet className="h-5 w-5" />
      case 'savings':
        return <PiggyBank className="h-5 w-5" />
      case 'credit':
        return <CreditCard className="h-5 w-5" />
      default:
        return <Building2 className="h-5 w-5" />
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const AccountCard = ({ account }: { account: typeof accounts[0] }) => {
    return (
      <Card className="bg-neutral-900 border-neutral-800 hover:bg-neutral-800/50 transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                {getAccountIcon(account.type)}
              </div>
              <div>
                <h3 className="font-semibold text-white">{account.name}</h3>
                <p className="text-sm text-neutral-400">
                  {account.accountNumber} • {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBalance(!showBalance)}
                className="text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800"
              >
                {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-neutral-400">Available Balance</p>
              <p className="text-2xl font-bold text-white">
                {showBalance ? formatCurrency(account.available) : '••••••'}
              </p>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-400">Current Balance</span>
              <span className="text-white font-medium">
                {showBalance ? formatCurrency(account.balance) : '••••••'}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-400">Status</span>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-green-400"></div>
                <span className="text-green-400">Active</span>
              </div>
            </div>
            
            <div className="pt-3 border-t border-neutral-700">
              <div className="flex items-center justify-between">
                <Button variant="outline" size="sm" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  Transfer
                </Button>
                <Button variant="outline" size="sm" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                  <Activity className="h-4 w-4 mr-1" />
                  Activity
                </Button>
                <Button variant="outline" size="sm" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                  <Settings className="h-4 w-4 mr-1" />
                  Manage
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Accounts</h1>
          <p className="text-neutral-400 text-sm md:text-base">
            Manage your bank accounts and financial connections
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Connect Bank
          </Button>
        </div>
      </div>

      {/* Account Summary */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card className="bg-gradient-to-r from-green-600 to-green-700 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Balance</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(accounts.reduce((sum, account) => sum + account.balance, 0))}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-blue-600 to-blue-700 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Active Accounts</p>
                <p className="text-2xl font-bold text-white">{accounts.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-600 to-purple-700 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">This Month</p>
                <p className="text-2xl font-bold text-white">+$12,450</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-600 to-orange-700 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Connections</p>
                <p className="text-2xl font-bold text-white">3 Active</p>
              </div>
              <Shield className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accounts Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Your Accounts</h2>
          <Button variant="outline" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
            <Eye className="h-4 w-4 mr-2" />
            {showBalance ? 'Hide Balances' : 'Show Balances'}
          </Button>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map(account => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>
      </div>

      {/* Additional features would go here */}
    </div>
  )
}