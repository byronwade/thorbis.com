'use client'

import React from 'react'
import { MetricsGridProps } from '@/types/charts'
import { 
  DollarSign, 
  FileText, 
  Users, 
  Wrench,
  Calendar,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  Star,
  Target,
  Zap,
  Info
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function MetricsGrid({ kpis, loading = false }: MetricsGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="bg-neutral-925 border border-neutral-800 rounded-lg p-4">
            <div className="animate-pulse">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 bg-neutral-800 rounded-lg" />
                <div className="w-12 h-4 bg-neutral-800 rounded" />
              </div>
              <div className="w-20 h-4 bg-neutral-800 rounded mb-1" />
              <div className="w-16 h-8 bg-neutral-800 rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!kpis) {
    return (
      <div className="text-center py-8 text-neutral-400">
        Unable to load metrics data
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return '${value.toFixed(1)}%'
  }

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="w-3 h-3 text-green-400" />
    if (value < 0) return <TrendingDown className="w-3 h-3 text-red-400" />
    return null
  }

  const getTrendColor = (value: number) => {
    if (value > 0) return 'text-green-400'
    if (value < 0) return 'text-red-400'
    return 'text-neutral-400'
  }

  const metrics = [
    // Financial Row 1
    {
      label: "Today's Revenue",
      value: formatCurrency(kpis.todayRevenue),
      icon: DollarSign,
      change: '+12.3%',
      trend: 1,
      color: 'green',
      tooltip: 'Total revenue generated today from completed jobs. Higher values indicate strong daily performance.'
    },
    {
      label: 'Weekly Revenue',
      value: formatCurrency(kpis.weeklyRevenue),
      icon: DollarSign,
      change: '+8.7%',
      trend: 1,
      color: 'green',
      tooltip: 'Total revenue for the current week. Track weekly trends and seasonal patterns.'
    },
    {
      label: 'Average Ticket',
      value: formatCurrency(kpis.averageTicket),
      icon: FileText,
      change: '+5.2%',
      trend: 1,
      color: 'blue',
      tooltip: 'Average revenue per job. Focus on upselling and higher-value services to increase this metric.'
    },
    {
      label: 'Conversion Rate',
      value: formatPercentage(kpis.conversionRate),
      icon: Target,
      change: '+2.1%',
      trend: 1,
      color: 'blue',
      tooltip: 'Percentage of estimates that convert to completed jobs. Higher rates mean better sales effectiveness.'
    },
    
    // Operations Row 2
    {
      label: 'Active Work Orders',
      value: kpis.activeWorkOrders.toString(),
      icon: Wrench,
      change: '+6',
      trend: 1,
      color: 'orange',
      tooltip: 'Jobs currently in progress. Monitor to ensure adequate capacity and avoid bottlenecks.'
    },
    {
      label: 'Completed Today',
      value: kpis.completedWorkOrders.toString(),
      icon: CheckCircle,
      change: '+3',
      trend: 1,
      color: 'green',
      tooltip: 'Jobs completed today. Track daily productivity and team performance.'
    },
    {
      label: 'Scheduled Jobs',
      value: kpis.scheduledWorkOrders.toString(),
      icon: Calendar,
      change: '+2',
      trend: 1,
      color: 'blue',
      tooltip: 'Future jobs scheduled. Maintain healthy pipeline for consistent revenue flow.'
    },
    {
      label: 'Available Techs',
      value: '${kpis.availableTechnicians}/${kpis.activeTechnicians}',
      icon: Users,
      change: formatPercentage(kpis.techUtilization),
      trend: 1,
      color: 'purple',
      tooltip: 'Available technicians out of total active staff. Optimize scheduling to maximize utilization.'
    },
    
    // Performance Row 3
    {
      label: 'Avg Response Time',
      value: kpis.avgResponseTime,
      icon: Clock,
      change: '${kpis.responseTimeChange > 0 ? '+' : '}${kpis.responseTimeChange.toFixed(1)}%',
      trend: -kpis.responseTimeChange, // Negative is good for response time
      color: 'yellow',
      tooltip: 'Average time from customer call to technician arrival. Faster response improves customer satisfaction.'
    },
    {
      label: 'Customer Satisfaction',
      value: '${kpis.customerSatisfaction.toFixed(1)}/10',
      icon: Star,
      change: '+0.2',
      trend: 1,
      color: 'green',
      tooltip: 'Average customer rating based on post-service surveys. Key indicator of service quality.'
    },
    {
      label: 'First Time Fix Rate',
      value: formatPercentage(kpis.firstTimeFixRate),
      icon: Zap,
      change: '+1.5%',
      trend: 1,
      color: 'blue',
      tooltip: 'Percentage of jobs completed on the first visit. Higher rates reduce costs and improve satisfaction.'
    },
    {
      label: 'Net Promoter Score',
      value: kpis.netPromoterScore.toString(),
      icon: TrendingUp,
      change: '+4',
      trend: 1,
      color: 'green',
      tooltip: 'Likelihood customers will recommend your service. Scores above 50 are excellent, above 70 are world-class.'
    }
  ]

  const getIconColor = (color: string) => {
    switch (color) {
      case 'green': return 'text-green-400'
      case 'blue': return 'text-blue-400'
      case 'orange': return 'text-orange-400'
      case 'purple': return 'text-purple-400'
      case 'yellow': return 'text-yellow-400'
      default: return 'text-neutral-400'
    }
  }

  const getIconBg = (color: string) => {
    switch (color) {
      case 'green': return 'bg-green-500/10'
      case 'blue': return 'bg-blue-500/10'
      case 'orange': return 'bg-orange-500/10'
      case 'purple': return 'bg-purple-500/10'
      case 'yellow': return 'bg-yellow-500/10'
      default: return 'bg-neutral-500/10`
    }
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Business Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {metrics.map((metric, index) => (
            <Tooltip key={metric.label}>
              <TooltipTrigger asChild>
                <div className="bg-neutral-925 border border-neutral-800 rounded-lg p-4 hover:bg-neutral-900/50 hover:border-neutral-700 transition-all duration-200 cursor-help">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-lg ${getIconBg(metric.color)}`}>
                      <metric.icon className={`w-4 h-4 ${getIconColor(metric.color)}'} />
                    </div>
                    <div className="flex items-center gap-1">
                      <div className={'flex items-center text-xs ${getTrendColor(metric.trend)}'}>
                        {getTrendIcon(metric.trend)}
                        <span className="ml-1">{metric.change}</span>
                      </div>
                      <Info className="w-3 h-3 text-neutral-500" />
                    </div>
                  </div>
                  <div>
                    <p className="text-neutral-400 text-sm mb-1">{metric.label}</p>
                    <p className="text-2xl font-bold text-white">{metric.value}</p>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="text-sm">{metric.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  )
}