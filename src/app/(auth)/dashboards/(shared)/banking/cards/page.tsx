import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { SidebarTrigger } from '@/components/ui';
'use client'


import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { ModernCard } from '@/components/banking/modern-card'
import { AdvancedCardControls } from '@/components/banking/advanced-card-controls'
import { 
  CreditCard,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Plus,
  MoreHorizontal,
  AlertCircle,
  CheckCircle,
  Settings,
  TrendingUp,
  DollarSign,
  Activity
} from 'lucide-react'

export default function CardsPage() {
  const modernCards = [
    {
      id: '1',
      type: 'credit' as const,
      name: 'Business Platinum',
      lastFour: '1234',
      balance: 15000.00,
      limit: 50000.00,
      status: 'active' as const,
      expiry: '12/27',
      brand: 'visa',
      isVirtual: false
    },
    {
      id: '2',
      type: 'debit' as const,
      name: 'Business Checking',
      lastFour: '5678',
      balance: 25000.00,
      status: 'active' as const,
      expiry: '08/26',
      brand: 'mastercard',
      isVirtual: false
    },
    {
      id: '3',
      type: 'virtual' as const,
      name: 'Marketing Spend',
      lastFour: '9012',
      balance: 2500.00,
      limit: 10000.00,
      status: 'frozen' as const,
      expiry: '03/26',
      brand: 'visa',
      isVirtual: true
    }
  ]

  const sampleCardControls = {
    id: '1',
    cardId: '1',
    cardName: 'Business Platinum',
    cardLastFour: '1234',
    spendingLimits: {
      daily: 5000,
      weekly: 25000,
      monthly: 100000,
      perTransaction: 10000
    },
    merchantControls: {
      allowedMCC: ['5814', '5541'],
      blockedMCC: ['7995'],
      allowedMerchants: [],
      blockedMerchants: []
    },
    locationControls: {
      domesticOnly: false,
      allowedCountries: ['US', 'CA'],
      blockedCountries: [],
      requiresLocation: true
    },
    timeControls: {
      businessHoursOnly: false,
      allowedDays: [0, 1, 2, 3, 4],
      startTime: '09:00',
      endTime: '17:00'
    },
    features: {
      contactless: true,
      online: true,
      atm: true,
      international: false,
      recurring: true
    },
    status: 'active' as const
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header with SidebarTrigger */}
      <div className="flex items-center gap-4 mb-6">
        <div className="inline-flex items-center justify-center rounded-md text-neutral-400 hover:text-neutral-100 bg-neutral-800/50 hover:bg-neutral-700/50 transition-all duration-200 h-8 w-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
          <SidebarTrigger />
        </div>
        <div className="flex-1">
          <h2 className="text-3xl font-bold tracking-tight text-white">Cards</h2>
          <p className="text-neutral-400">Manage your debit and credit cards</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
            <Settings className="mr-2 h-4 w-4" />
            Card Settings
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Request Card
          </Button>
        </div>
      </div>

      {/* Cards Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-r from-blue-600 to-blue-700 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Credit Available</p>
                <p className="text-2xl font-bold text-white">$43,500.00</p>
                <p className="text-xs text-blue-200">72% available</p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-red-600 to-red-700 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Outstanding Balance</p>
                <p className="text-2xl font-bold text-white">$17,500.00</p>
                <p className="text-xs text-red-200">Across all cards</p>
              </div>
              <DollarSign className="h-8 w-8 text-red-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-600 to-green-700 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Active Cards</p>
                <p className="text-2xl font-bold text-white">{modernCards.filter(c => c.status === 'active').length}</p>
                <p className="text-xs text-green-200">{modernCards.filter(c => c.status === 'frozen').length} frozen</p>
              </div>
              <Activity className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-600 to-purple-700 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Rewards Earned</p>
                <p className="text-2xl font-bold text-white">$1,245.67</p>
                <p className="text-xs text-purple-200">This year</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modern Card Display */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Your Cards</h2>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Virtual Card
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {modernCards.map(card => (
            <ModernCard 
              key={card.id} 
              card={card}
              showBalance={true}
              onToggleVisibility={() => {}}
              onFreeze={() => {}}
              onCopy={() => {}}
            />
          ))}
        </div>
      </div>

      {/* Advanced Card Controls */}
      <AdvancedCardControls 
        cardControls={sampleCardControls}
        onUpdateControl={() => {}}
        onCreateVirtualCard={() => {}}
        onFreezeCard={() => {}}
      />

      {/* Quick Actions */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button className="flex flex-col items-center space-y-2 h-20 bg-blue-600 hover:bg-blue-700">
              <Plus className="h-5 w-5" />
              <span className="text-sm">Virtual Card</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center space-y-2 h-20 border-neutral-700 text-neutral-300 hover:bg-neutral-800">
              <Lock className="h-5 w-5" />
              <span className="text-sm">Freeze Card</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center space-y-2 h-20 border-neutral-700 text-neutral-300 hover:bg-neutral-800">
              <Shield className="h-5 w-5" />
              <span className="text-sm">Security</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center space-y-2 h-20 border-neutral-700 text-neutral-300 hover:bg-neutral-800">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">Report Issue</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}