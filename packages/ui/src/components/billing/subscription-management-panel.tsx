/**
 * Subscription Management Panel Component
 * Allows users to view and manage their subscription plans
 * Dark-first design with plan comparison and upgrade options
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  CheckCircle2,
  Circle,
  Crown,
  Zap,
  Building,
  CreditCard,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { useState } from 'react';

interface SubscriptionPlan {
  id: string;
  name: string;
  tier: 'basic' | 'pro' | 'enterprise';
  description: string;
  monthlyPrice: number; // in cents
  yearlyPrice: number; // in cents
  apiQuota: number;
  features: string[];
  isPopular?: boolean;
  isCurrentPlan?: boolean;
}

interface SubscriptionManagementProps {
  currentPlan: SubscriptionPlan;
  availablePlans: SubscriptionPlan[];
  billingInterval: 'monthly' | 'yearly';
  onBillingIntervalChange: (interval: 'monthly' | 'yearly') => void;
  onPlanSelect: (planId: string) => void;
  onManagePayment: () => void;
  nextBillingDate: Date;
  isLoading?: boolean;
}

const tierIcons = {
  basic: Circle,
  pro: Zap,
  enterprise: Crown,
};

const tierColors = {
  basic: {
    bg: 'bg-neutral-700',
    text: 'text-neutral-300',
    border: 'border-neutral-600',
  },
  pro: {
    bg: 'bg-blue-600',
    text: 'text-blue-400',
    border: 'border-blue-500',
  },
  enterprise: {
    bg: 'bg-purple-600',
    text: 'text-purple-400',
    border: 'border-purple-500',
  },
};

export function SubscriptionManagementPanel({
  currentPlan,
  availablePlans,
  billingInterval,
  onBillingIntervalChange,
  onPlanSelect,
  onManagePayment,
  nextBillingDate,
  isLoading = false,
}: SubscriptionManagementProps) {
  const [selectedInterval, setSelectedInterval] = useState(billingInterval);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const getPlanPrice = (plan: SubscriptionPlan, interval: 'monthly' | 'yearly') => {
    return interval === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
  };

  const getYearlySavings = (plan: SubscriptionPlan) => {
    const monthlyTotal = plan.monthlyPrice * 12;
    const savings = monthlyTotal - plan.yearlyPrice;
    const savingsPercentage = (savings / monthlyTotal) * 100;
    return { savings, savingsPercentage };
  };

  const handleIntervalChange = (yearly: boolean) => {
    const newInterval = yearly ? 'yearly' : 'monthly';
    setSelectedInterval(newInterval);
    onBillingIntervalChange(newInterval);
  };

  return (
    <div className="space-y-6">
      {/* Current Plan Status */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-xl text-neutral-100">
            Current Subscription
          </CardTitle>
          <CardDescription className="text-neutral-400">
            Manage your billing and subscription details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-neutral-800 border border-neutral-700">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${tierColors[currentPlan.tier].bg}`}>
                {(() => {
                  const Icon = tierIcons[currentPlan.tier];
                  return <Icon className="w-5 h-5 text-white" />;
                })()}
              </div>
              <div>
                <div className="text-lg font-semibold text-neutral-100">
                  {currentPlan.name}
                </div>
                <div className="text-sm text-neutral-400">
                  {formatCurrency(getPlanPrice(currentPlan, billingInterval))} per {billingInterval.replace('ly', '')}
                </div>
              </div>
            </div>
            <Badge className={`${tierColors[currentPlan.tier].bg} text-white border-0`}>
              Current Plan
            </Badge>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-neutral-400">
              <Calendar className="w-4 h-4" />
              <span>Next billing date: {formatDate(nextBillingDate)}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onManagePayment}
              className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Manage Payment
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Billing Interval Toggle */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-medium text-neutral-100">
                Billing Frequency
              </div>
              <div className="text-sm text-neutral-400">
                Save up to 20% with annual billing
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-sm ${selectedInterval === 'monthly' ? 'text-neutral-100' : 'text-neutral-500'}`}>
                Monthly
              </span>
              <Switch 
                checked={selectedInterval === 'yearly'}
                onCheckedChange={handleIntervalChange}
                className="data-[state=checked]:bg-blue-600"
              />
              <span className={`text-sm ${selectedInterval === 'yearly' ? 'text-neutral-100' : 'text-neutral-500'}`}>
                Yearly
              </span>
              {selectedInterval === 'yearly' && (
                <Badge className="bg-emerald-600 text-white border-0 ml-2">
                  Save 20%
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div className="space-y-4">
        <div className="text-xl font-semibold text-neutral-100">
          Available Plans
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {availablePlans.map((plan) => {
            const TierIcon = tierIcons[plan.tier];
            const colors = tierColors[plan.tier];
            const price = getPlanPrice(plan, selectedInterval);
            const { savings, savingsPercentage } = getYearlySavings(plan);
            const isUpgrade = getPlanPrice(plan, selectedInterval) > getPlanPrice(currentPlan, selectedInterval);
            const isDowngrade = getPlanPrice(plan, selectedInterval) < getPlanPrice(currentPlan, selectedInterval);
            
            return (
              <Card 
                key={plan.id}
                className={`relative bg-neutral-900 transition-all duration-200 hover:scale-105 ${
                  plan.isCurrentPlan 
                    ? `border-blue-500 shadow-lg shadow-blue-500/20` 
                    : 'border-neutral-800 hover:border-neutral-700'
                } ${plan.isPopular ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white border-0">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className={`w-12 h-12 mx-auto rounded-lg ${colors.bg} flex items-center justify-center mb-4`}>
                    <TierIcon className="w-6 h-6 text-white" />
                  </div>
                  
                  <CardTitle className="text-xl text-neutral-100">
                    {plan.name}
                  </CardTitle>
                  
                  <div className="text-3xl font-bold text-neutral-100">
                    {formatCurrency(price)}
                    <span className="text-base font-normal text-neutral-400">
                      /{selectedInterval.replace('ly', '')}
                    </span>
                  </div>
                  
                  {selectedInterval === 'yearly' && savings > 0 && (
                    <div className="text-sm text-emerald-400">
                      Save {formatCurrency(savings)} ({savingsPercentage.toFixed(0)}%)
                    </div>
                  )}
                  
                  <CardDescription className="text-neutral-400">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="text-center p-3 rounded-lg bg-neutral-800 border border-neutral-700">
                    <div className="text-2xl font-bold text-neutral-100">
                      {plan.apiQuota.toLocaleString()}
                    </div>
                    <div className="text-sm text-neutral-400">
                      API calls per month
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-neutral-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-4">
                    {plan.isCurrentPlan ? (
                      <Button 
                        className="w-full bg-neutral-700 text-neutral-300 cursor-not-allowed"
                        disabled
                      >
                        Current Plan
                      </Button>
                    ) : (
                      <Button 
                        className={`w-full ${
                          isUpgrade 
                            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                            : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700'
                        }`}
                        onClick={() => onPlanSelect(plan.id)}
                        disabled={isLoading}
                      >
                        {isUpgrade && <ArrowRight className="w-4 h-4 mr-2" />}
                        {isUpgrade ? 'Upgrade' : isDowngrade ? 'Downgrade' : 'Select Plan'}
                        {isUpgrade && <Crown className="w-4 h-4 ml-2" />}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Plan Comparison Note */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Building className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <div className="text-sm font-medium text-neutral-200 mb-1">
                Need a custom plan?
              </div>
              <div className="text-sm text-neutral-400 mb-3">
                Contact our sales team for enterprise pricing, custom API quotas, and dedicated support.
              </div>
              <Button 
                variant="outline" 
                size="sm"
                className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
              >
                Contact Sales
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SubscriptionManagementPanel;