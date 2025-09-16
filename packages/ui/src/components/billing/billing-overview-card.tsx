/**
 * Billing Overview Card Component
 * Displays current subscription status, usage, and costs
 * Dark-first design with electric blue accents
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  CreditCard, 
  TrendingUp, 
  Calendar, 
  AlertTriangle,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface BillingOverviewProps {
  organizationName: string;
  currentPlan: {
    name: string;
    tier: 'basic' | 'pro' | 'enterprise';
    price: number; // in cents
    currency: string;
    billingInterval: 'monthly' | 'yearly';
  };
  subscription: {
    status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'suspended';
    currentPeriodEnd: Date;
    trialEnd?: Date;
  };
  usage: {
    apiCalls: {
      current: number;
      quota: number;
      overage: number;
    };
    dataExports: {
      current: number;
      quota: number;
    };
    aiRequests: {
      current: number;
      quota: number;
    };
  };
  costs: {
    subscriptionFee: number; // in cents
    overageFee: number; // in cents
    totalEstimated: number; // in cents
  };
  onManageSubscription?: () => void;
  onViewUsageDetails?: () => void;
}

const statusConfig = {
  active: {
    label: 'Active',
    color: 'bg-emerald-500',
    textColor: 'text-emerald-400',
    icon: CheckCircle2,
  },
  trialing: {
    label: 'Trial',
    color: 'bg-blue-500',
    textColor: 'text-blue-400',
    icon: Clock,
  },
  past_due: {
    label: 'Past Due',
    color: 'bg-red-500',
    textColor: 'text-red-400',
    icon: AlertTriangle,
  },
  canceled: {
    label: 'Canceled',
    color: 'bg-neutral-500',
    textColor: 'text-neutral-400',
    icon: AlertTriangle,
  },
  suspended: {
    label: 'Suspended',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-400',
    icon: AlertTriangle,
  },
} as const;

const planConfig = {
  basic: { color: 'bg-neutral-600', label: 'Basic' },
  pro: { color: 'bg-blue-600', label: 'Professional' },
  enterprise: { color: 'bg-purple-600', label: 'Enterprise' },
} as const;

export function BillingOverviewCard({
  organizationName,
  currentPlan,
  subscription,
  usage,
  costs,
  onManageSubscription,
  onViewUsageDetails,
}: BillingOverviewProps) {
  const statusInfo = statusConfig[subscription.status];
  const planInfo = planConfig[currentPlan.tier];
  const StatusIcon = statusInfo.icon;
  
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currentPlan.currency,
    }).format(cents / 100);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const apiUsagePercentage = Math.min((usage.apiCalls.current / usage.apiCalls.quota) * 100, 100);
  const isOverQuota = usage.apiCalls.current > usage.apiCalls.quota;

  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-neutral-100">
              {organizationName}
            </CardTitle>
            <CardDescription className="text-neutral-400">
              Billing Overview
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <StatusIcon className={`h-5 w-5 ${statusInfo.textColor}`} />
            <Badge 
              variant="secondary" 
              className={`${statusInfo.color} text-white border-0`}
            >
              {statusInfo.label}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Plan */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-neutral-800 border border-neutral-700">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${planInfo.color}`} />
            <div>
              <div className="text-neutral-100 font-medium">
                {currentPlan.name}
              </div>
              <div className="text-sm text-neutral-400">
                {formatCurrency(currentPlan.price)} per {currentPlan.billingInterval.replace('ly', '')}
              </div>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onManageSubscription}
            className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Manage
          </Button>
        </div>

        {/* API Usage */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-300">
              API Usage This Month
            </span>
            <span className={`text-sm font-mono ${isOverQuota ? 'text-red-400' : 'text-neutral-400'}`}>
              {usage.apiCalls.current.toLocaleString()} / {usage.apiCalls.quota.toLocaleString()}
            </span>
          </div>
          <Progress 
            value={apiUsagePercentage} 
            className={`h-2 ${isOverQuota ? 'bg-red-900' : 'bg-neutral-700'}`}
          />
          {isOverQuota && (
            <div className="flex items-center gap-2 text-sm text-red-400">
              <AlertTriangle className="w-4 h-4" />
              <span>
                {usage.apiCalls.overage.toLocaleString()} calls over quota
              </span>
            </div>
          )}
        </div>

        {/* Additional Usage Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-neutral-800 border border-neutral-700">
            <div className="text-xs text-neutral-500 uppercase tracking-wide">
              Data Exports
            </div>
            <div className="text-lg font-semibold text-neutral-200">
              {usage.dataExports.current}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-neutral-800 border border-neutral-700">
            <div className="text-xs text-neutral-500 uppercase tracking-wide">
              AI Requests
            </div>
            <div className="text-lg font-semibold text-neutral-200">
              {usage.aiRequests.current}
            </div>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="space-y-3 p-4 rounded-lg bg-neutral-800 border border-neutral-700">
          <div className="text-sm font-medium text-neutral-300 mb-2">
            Current Month Estimate
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">Subscription</span>
              <span className="text-neutral-300">{formatCurrency(costs.subscriptionFee)}</span>
            </div>
            
            {costs.overageFee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-neutral-400">Usage Overage</span>
                <span className="text-orange-400">{formatCurrency(costs.overageFee)}</span>
              </div>
            )}
            
            <div className="border-t border-neutral-700 pt-2 mt-2">
              <div className="flex justify-between font-medium">
                <span className="text-neutral-200">Total Estimated</span>
                <span className="text-emerald-400">{formatCurrency(costs.totalEstimated)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Billing Cycle */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-neutral-400">
            <Calendar className="w-4 h-4" />
            <span>
              {subscription.status === 'trialing' && subscription.trialEnd
                ? `Trial ends ${formatDate(subscription.trialEnd)}`
                : `Next billing ${formatDate(subscription.currentPeriodEnd)}`
              }
            </span>
          </div>
          <Button 
            variant="link" 
            size="sm" 
            onClick={onViewUsageDetails}
            className="text-blue-400 hover:text-blue-300 p-0 h-auto"
          >
            <TrendingUp className="w-4 h-4 mr-1" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default BillingOverviewCard;