"use client"

import { useState } from 'react'
import Link from 'next/link'
import { 
  ChevronLeft, CreditCard, Download, Calendar, TrendingUp, 
  AlertCircle, Check, Zap, Users, Database, Wifi 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

export default function BillingSettingsPage() {
  const [isLoading, setIsLoading] = useState(false)

  const currentPlan = {
    name: 'Professional',
    price: 49,
    billing: 'monthly',
    features: [
      'Unlimited work orders',
      'Advanced reporting',
      'API access',
      'Priority support',
      '10 team members'
    ]
  }

  const usageMetrics = [
    { name: 'Work Orders', current: 1247, limit: 'Unlimited', percentage: null, color: 'bg-blue-600' },
    { name: 'Team Members', current: 7, limit: 10, percentage: 70, color: 'bg-green-600' },
    { name: 'API Calls', current: 8432, limit: 50000, percentage: 17, color: 'bg-purple-600' },
    { name: 'Storage', current: 2.3, limit: 100, percentage: 2.3, color: 'bg-orange-600', unit: 'GB' },
  ]

  const invoices = [
    { id: 'INV-2024-001', date: '2024-01-01', amount: 49.00, status: 'paid' },
    { id: 'INV-2023-012', date: '2023-12-01', amount: 49.00, status: 'paid' },
    { id: 'INV-2023-011', date: '2023-11-01', amount: 49.00, status: 'paid' },
    { id: 'INV-2023-010', date: '2023-10-01', amount: 49.00, status: 'paid' },
  ]

  const plans = [
    {
      name: 'Starter',
      price: 19,
      features: [
        '100 work orders/month',
        'Basic reporting',
        'Email support',
        '3 team members'
      ]
    },
    {
      name: 'Professional',
      price: 49,
      features: [
        'Unlimited work orders',
        'Advanced reporting',
        'API access',
        'Priority support',
        '10 team members'
      ],
      current: true
    },
    {
      name: 'Enterprise',
      price: 99,
      features: [
        'Everything in Professional',
        'Custom integrations',
        'Dedicated support',
        'Unlimited team members',
        'Advanced security'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="py-8">
          <div className="flex items-center gap-4 mb-2">
            <Link href="/dashboards/settings" className="text-neutral-400 hover:text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-semibold text-white">Billing & Usage</h1>
          </div>
          <p className="text-neutral-400">Manage your subscription, usage, and invoices</p>
        </div>

        <div className="space-y-8 pb-8">
          {/* Current Plan */}
          <Card className="bg-neutral-900/50 border-neutral-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-neutral-400" />
                  <div>
                    <CardTitle className="text-white">Current Plan</CardTitle>
                    <CardDescription className="text-neutral-400">
                      You're currently on the {currentPlan.name} plan
                    </CardDescription>
                  </div>
                </div>
                <Badge className="bg-blue-600 text-white">
                  {currentPlan.name}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">
                    ${currentPlan.price}
                    <span className="text-base font-normal text-neutral-400">/{currentPlan.billing}</span>
                  </p>
                  <p className="text-sm text-neutral-400">Next billing date: February 1, 2024</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="border-neutral-700 hover:bg-neutral-800">
                    Change Plan
                  </Button>
                  <Button variant="outline" className="border-red-700 text-red-400 hover:bg-red-900/20">
                    Cancel Plan
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {currentPlan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-neutral-300">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Usage Metrics */}
          <Card className="bg-neutral-900/50 border-neutral-800">
            <CardHeader>
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-neutral-400" />
                <div>
                  <CardTitle className="text-white">Usage Overview</CardTitle>
                  <CardDescription className="text-neutral-400">
                    Current usage for this billing period
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {usageMetrics.map((metric, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">{metric.name}</span>
                      <span className="text-sm text-neutral-400">
                        {metric.current}{metric.unit || ''} / {metric.limit === 'Unlimited' ? 'Unlimited' : '${metric.limit}${metric.unit || ''}'}
                      </span>
                    </div>
                    {metric.percentage !== null && (
                      <Progress 
                        value={metric.percentage} 
                        className="h-2"
                      />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Available Plans */}
          <Card className="bg-neutral-900/50 border-neutral-800">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-neutral-400" />
                <div>
                  <CardTitle className="text-white">Available Plans</CardTitle>
                  <CardDescription className="text-neutral-400">
                    Choose the plan that best fits your needs
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan, index) => (
                  <div
                    key={index}
                    className={'relative p-6 border rounded-lg ${
                      plan.current
                        ? 'border-blue-600 bg-blue-600/5'
                        : 'border-neutral-800 bg-neutral-900/30'
                    }'}
                  >
                    {plan.current && (
                      <Badge className="absolute -top-2 left-4 bg-blue-600 text-white">
                        Current Plan
                      </Badge>
                    )}
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                        <p className="text-2xl font-bold text-white">
                          ${plan.price}
                          <span className="text-base font-normal text-neutral-400">/month</span>
                        </p>
                      </div>
                      
                      <ul className="space-y-2">
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-400" />
                            <span className="text-sm text-neutral-300">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <Button
                        className={'w-full ${
                          plan.current
                            ? 'bg-neutral-700 text-neutral-300 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                        }'}
                        disabled={plan.current}
                      >
                        {plan.current ? 'Current Plan' : 'Upgrade'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card className="bg-neutral-900/50 border-neutral-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-neutral-400" />
                  <div>
                    <CardTitle className="text-white">Payment Method</CardTitle>
                    <CardDescription className="text-neutral-400">
                      Manage your default payment method
                    </CardDescription>
                  </div>
                </div>
                <Button variant="outline" className="border-neutral-700 hover:bg-neutral-800">
                  Update Payment
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 p-4 border border-neutral-800 rounded-lg">
                <div className="flex items-center justify-center w-12 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded text-white font-bold">
                  VISA
                </div>
                <div>
                  <p className="text-white font-medium">•••• •••• •••• 4242</p>
                  <p className="text-sm text-neutral-400">Expires 12/2025</p>
                </div>
                <Badge variant="outline" className="ml-auto border-green-600 text-green-400">
                  Default
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Invoice History */}
          <Card className="bg-neutral-900/50 border-neutral-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-neutral-400" />
                  <div>
                    <CardTitle className="text-white">Invoice History</CardTitle>
                    <CardDescription className="text-neutral-400">
                      Download and view your past invoices
                    </CardDescription>
                  </div>
                </div>
                <Button variant="outline" className="border-neutral-700 hover:bg-neutral-800">
                  <Download className="w-4 h-4 mr-2" />
                  Download All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border border-neutral-800 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-white font-medium">{invoice.id}</p>
                        <p className="text-sm text-neutral-400">{invoice.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge
                        variant="outline"
                        className={
                          invoice.status === 'paid'
                            ? 'border-green-600 text-green-400'
                            : 'border-yellow-600 text-yellow-400'
                        }
                      >
                        {invoice.status}
                      </Badge>
                      <span className="text-white font-medium">${invoice.amount}</span>
                      <Button variant="outline" size="sm" className="border-neutral-700 hover:bg-neutral-800">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Billing Alerts */}
          <Card className="bg-neutral-900/50 border-neutral-800">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-neutral-400" />
                <div>
                  <CardTitle className="text-white">Billing Alerts</CardTitle>
                  <CardDescription className="text-neutral-400">
                    Stay informed about your account and usage
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-neutral-800 rounded-lg">
                <div>
                  <p className="text-white font-medium">Usage Warnings</p>
                  <p className="text-sm text-neutral-400">Get notified when approaching usage limits</p>
                </div>
                <Button variant="outline" className="border-neutral-700 hover:bg-neutral-800">
                  Configure
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 border border-neutral-800 rounded-lg">
                <div>
                  <p className="text-white font-medium">Payment Reminders</p>
                  <p className="text-sm text-neutral-400">Receive reminders before billing dates</p>
                </div>
                <Button variant="outline" className="border-neutral-700 hover:bg-neutral-800">
                  Configure
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}