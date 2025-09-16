"use client";

import { useSearchParams } from "next/navigation";
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Target, 
  Clock, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight, 
  BarChart3, 
  Filter,
  Calendar,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  TrendingDown,
  Settings,
  Download,
  FileText
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RevenueChart } from "@/components/analytics/revenue-chart";
import { ConversionFunnel } from "@/components/analytics/conversion-funnel";
import { IndustryComparison } from "@/components/analytics/industry-comparison";
import { AnalyticsBackButton } from "@/components/analytics/analytics-back-button";
import Link from "next/link";

export default function AnalyticsOverview() {
  const searchParams = useSearchParams();
  const fromIndustry = searchParams.get('from');

  // Generate realistic industry-specific analytics data
  const getIndustryData = (industry: string) => {
    const industryConfigs = {
      hs: {
        baseRevenue: 185000, revenueChange: 18.3,
        totalUsers: 1200, userChange: 12.4,
        conversionRate: 15.2, conversionChange: 8.1,
        avgSessionTime: "12m 45s", sessionChange: 22.3,
        costPerAcquisition: 125.40, customerLifetimeValue: 8500,
        monthlyRecurringRevenue: 78400, churnRate: 1.8,
        netPromoterScore: 78, averageOrderValue: 450.00,
        grossMargin: 72.5, businessType: "Service-Based"
      },
      rest: {
        baseRevenue: 98000, revenueChange: 6.7,
        totalUsers: 2800, userChange: -3.2,
        conversionRate: 8.9, conversionChange: -1.4,
        avgSessionTime: "8m 15s", sessionChange: 5.8,
        costPerAcquisition: 35.20, customerLifetimeValue: 890,
        monthlyRecurringRevenue: 34200, churnRate: 4.2,
        netPromoterScore: 65, averageOrderValue: 28.50,
        grossMargin: 58.3, businessType: "Food & Beverage"
      },
      auto: {
        baseRevenue: 245000, revenueChange: 14.8,
        totalUsers: 980, userChange: 15.7,
        conversionRate: 22.4, conversionChange: 12.3,
        avgSessionTime: "18m 30s", sessionChange: 18.9,
        costPerAcquisition: 180.75, customerLifetimeValue: 12400,
        monthlyRecurringRevenue: 89300, churnRate: 1.2,
        netPromoterScore: 82, averageOrderValue: 680.00,
        grossMargin: 78.9, businessType: "Automotive Service"
      },
      ret: {
        baseRevenue: 156000, revenueChange: 9.4,
        totalUsers: 4200, userChange: 7.8,
        conversionRate: 4.8, conversionChange: 2.1,
        avgSessionTime: "6m 22s", sessionChange: 8.4,
        costPerAcquisition: 22.90, customerLifetimeValue: 340,
        monthlyRecurringRevenue: 45600, churnRate: 3.8,
        netPromoterScore: 61, averageOrderValue: 67.40,
        grossMargin: 42.1, businessType: "Retail Commerce"
      },
      books: {
        baseRevenue: 2840000, revenueChange: 24.6,
        totalUsers: 45, userChange: 18.2,
        conversionRate: 95.6, conversionChange: 3.2,
        avgSessionTime: "45m 12s", sessionChange: 28.7,
        costPerAcquisition: 850.00, customerLifetimeValue: 45000,
        monthlyRecurringRevenue: 234000, churnRate: 0.8,
        netPromoterScore: 89, averageOrderValue: 12500.00,
        grossMargin: 89.4, businessType: "Financial Services"
      }
    }
    
    return industryConfigs[industry as keyof typeof industryConfigs] || {
      baseRevenue: 124580, revenueChange: 12.5,
      totalUsers: 8429, userChange: 8.2,
      conversionRate: 3.4, conversionChange: -2.1,
      avgSessionTime: "4m 32s", sessionChange: 15.7,
      costPerAcquisition: 45.20, customerLifetimeValue: 2840,
      monthlyRecurringRevenue: 42300, churnRate: 2.4,
      netPromoterScore: 68, averageOrderValue: 89.50,
      grossMargin: 67.8, businessType: "General Business"
    }
  }

  const industryData = getIndustryData(fromIndustry || 'general')
  
  const analyticsData = {
    totalRevenue: industryData.baseRevenue,
    revenueChange: industryData.revenueChange,
    totalUsers: industryData.totalUsers,
    userChange: industryData.userChange,
    conversionRate: industryData.conversionRate,
    conversionChange: industryData.conversionChange,
    avgSessionTime: industryData.avgSessionTime,
    sessionChange: industryData.sessionChange,
    industry: fromIndustry || 'general',
    businessType: industryData.businessType,
    costPerAcquisition: industryData.costPerAcquisition,
    customerLifetimeValue: industryData.customerLifetimeValue,
    monthlyRecurringRevenue: industryData.monthlyRecurringRevenue,
    churnRate: industryData.churnRate,
    netPromoterScore: industryData.netPromoterScore,
    averageOrderValue: industryData.averageOrderValue,
    grossMargin: industryData.grossMargin,
    burnRate: Math.round(industryData.monthlyRecurringRevenue * 0.15),
    cashRunway: Math.round(18 + (industryData.grossMargin - 60) * 0.5)
  };

  // Enhanced KPI cards with more comprehensive metrics
  const primaryKPIs = [
    {
      title: "Total Revenue",
      value: `$${analyticsData.totalRevenue.toLocaleString()}`,
      change: analyticsData.revenueChange,
      trend: "up" as const,
      icon: DollarSign,
      description: "30-day period",
      target: 150000,
      gradient: "from-emerald-500/5 to-emerald-600/10",
      borderColor: "border-emerald-500/20"
    },
    {
      title: "Active Users",
      value: analyticsData.totalUsers.toLocaleString(),
      change: analyticsData.userChange,
      trend: "up" as const,
      icon: Users,
      description: "Monthly active users",
      target: 10000,
      gradient: "from-blue-500/5 to-blue-600/10",
      borderColor: "border-blue-500/20"
    },
    {
      title: "Conversion Rate",
      value: `${analyticsData.conversionRate}%`,
      change: analyticsData.conversionChange,
      trend: "down" as const,
      icon: Target,
      description: "Visitor to customer",
      target: 5.0,
      gradient: "from-orange-500/5 to-orange-600/10",
      borderColor: "border-orange-500/20"
    },
    {
      title: "Avg Session Time",
      value: analyticsData.avgSessionTime,
      change: analyticsData.sessionChange,
      trend: "up" as const,
      icon: Clock,
      description: "User engagement",
      target: "5m 00s",
      gradient: "from-purple-500/5 to-purple-600/10",
      borderColor: "border-purple-500/20"
    }
  ];

  const secondaryKPIs = [
    {
      title: "Customer Lifetime Value",
      value: `$${analyticsData.customerLifetimeValue.toLocaleString()}`,
      change: 8.3,
      trend: "up" as const,
      icon: TrendingUp,
      description: "Average CLV",
    },
    {
      title: "Cost Per Acquisition",
      value: `$${analyticsData.costPerAcquisition}`,
      change: -12.1,
      trend: "up" as const,
      icon: DollarSign,
      description: "Customer acquisition cost",
    },
    {
      title: "Monthly Recurring Revenue",
      value: `$${analyticsData.monthlyRecurringRevenue.toLocaleString()}`,
      change: 15.2,
      trend: "up" as const,
      icon: BarChart3,
      description: "Recurring revenue stream",
    },
    {
      title: "Churn Rate",
      value: `${analyticsData.churnRate}%',
      change: -0.8,
      trend: "up" as const,
      icon: TrendingDown,
      description: "Monthly customer churn",
    }
  ];

  const healthMetrics = [
    {
      title: "Net Promoter Score",
      value: analyticsData.netPromoterScore,
      status: analyticsData.netPromoterScore >= 50 ? "excellent" : analyticsData.netPromoterScore >= 30 ? "good" : "needs attention",
      description: "Customer satisfaction",
    },
    {
      title: "Gross Margin",
      value: analyticsData.grossMargin,
      status: analyticsData.grossMargin >= 60 ? "excellent" : analyticsData.grossMargin >= 40 ? "good" : "needs attention",
      description: "Profitability health",
    },
    {
      title: "Cash Runway",
      value: analyticsData.cashRunway,
      status: analyticsData.cashRunway >= 12 ? "excellent" : analyticsData.cashRunway >= 6 ? "good" : "needs attention",
      description: "Months of operation",
    }
  ];

  const industryMetrics = {
    hs: { revenue: 45230, users: 2341, conversion: 4.2 },
    rest: { revenue: 32100, users: 1876, conversion: 3.8 },
    auto: { revenue: 28450, users: 1234, conversion: 5.1 },
    ret: { revenue: 18800, users: 2978, conversion: 3.2 }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Professional Analytics Header - Bloomberg Style */}
      <div className="sticky top-0 z-20 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500/10 rounded border border-blue-500/20 flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-neutral-100">Analytics Overview</h1>
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <span className="capitalize">{fromIndustry ? '${analyticsData.businessType} - ${fromIndustry.toUpperCase()}' : 'Business Intelligence'}</span>
                  <div className="w-1 h-1 bg-neutral-600 rounded-full" />
                  <span>Performance Dashboard</span>
                  <div className="w-1 h-1 bg-neutral-600 rounded-full" />
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-emerald-400">Live Data</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Time Controls */}
            <div className="flex items-center border border-neutral-700 rounded-md">
              <button className="px-3 py-1.5 text-xs bg-blue-500/20 text-blue-400 transition-colors">
                1D
              </button>
              <button className="px-3 py-1.5 text-xs transition-colors border-l border-neutral-700 text-neutral-400 hover:text-neutral-300">
                7D
              </button>
              <button className="px-3 py-1.5 text-xs transition-colors border-l border-neutral-700 bg-blue-500/20 text-blue-400">
                30D
              </button>
              <button className="px-3 py-1.5 text-xs transition-colors border-l border-neutral-700 text-neutral-400 hover:text-neutral-300">
                90D
              </button>
            </div>
            
            <div className="w-px h-4 bg-neutral-700" />
            
            {/* Control Actions */}
            <button className="p-1.5 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/50 rounded-md transition-colors">
              <Filter className="h-4 w-4" />
            </button>
            <button className="p-1.5 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/50 rounded-md transition-colors">
              <Settings className="h-4 w-4" />
            </button>
            <button className="p-1.5 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/50 rounded-md transition-colors">
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Data-at-a-Glance Section - No Cards */}
      <div className="border-b border-neutral-800">
        <div className="px-6 py-4">
          
          {/* Primary KPIs Row - No Cards */}
          <div className="grid grid-cols-4 gap-8 mb-6">
            {/* Total Revenue */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-medium text-neutral-300">Total Revenue</span>
                <div className={'flex items-center gap-1 text-xs ${
                  analyticsData.revenueChange >= 0 ? 'text-emerald-400' : 'text-red-400'
                }'}>
                  {analyticsData.revenueChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(analyticsData.revenueChange)}%
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-100 mb-1">${analyticsData.totalRevenue.toLocaleString()}</div>
              <div className="text-xs text-neutral-500 mb-2">30-day period</div>
              <div className="w-full bg-neutral-800 rounded-full h-1.5">
                <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>

            {/* Active Users */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-neutral-300">Active Users</span>
                <div className={'flex items-center gap-1 text-xs ${
                  analyticsData.userChange >= 0 ? 'text-emerald-400' : 'text-red-400'
                }'}>
                  {analyticsData.userChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(analyticsData.userChange)}%
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-100 mb-1">{analyticsData.totalUsers.toLocaleString()}</div>
              <div className="text-xs text-neutral-500 mb-2">Monthly active users</div>
              <div className="w-full bg-neutral-800 rounded-full h-1.5">
                <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: '82%' }}></div>
              </div>
            </div>

            {/* Conversion Rate */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Target className="h-4 w-4 text-orange-400" />
                <span className="text-sm font-medium text-neutral-300">Conversion Rate</span>
                <div className={'flex items-center gap-1 text-xs ${
                  analyticsData.conversionChange >= 0 ? 'text-emerald-400' : 'text-red-400`
                }`}>
                  {analyticsData.conversionChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(analyticsData.conversionChange)}%
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-100 mb-1">{analyticsData.conversionRate}%</div>
              <div className="text-xs text-neutral-500 mb-2">Visitor to customer</div>
              <div className="w-full bg-neutral-800 rounded-full h-1.5">
                <div className="bg-orange-400 h-1.5 rounded-full" style={{ width: '${analyticsData.conversionRate * 10}%' }}></div>
              </div>
            </div>

            {/* Session Time */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-medium text-neutral-300">Avg Session Time</span>
                <div className={'flex items-center gap-1 text-xs ${
                  analyticsData.sessionChange >= 0 ? 'text-emerald-400' : 'text-red-400'
                }'}>
                  {analyticsData.sessionChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(analyticsData.sessionChange)}%
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-100 mb-1">{analyticsData.avgSessionTime}</div>
              <div className="text-xs text-neutral-500 mb-2">User engagement</div>
              <div className="w-full bg-neutral-800 rounded-full h-1.5">
                <div className="bg-purple-400 h-1.5 rounded-full" style={{ width: '68%' }}></div>
              </div>
            </div>
          </div>

          {/* Secondary Metrics Row */}
          <div className="grid grid-cols-4 gap-8 pt-4 border-t border-neutral-800">
            {/* Customer Lifetime Value */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-cyan-400" />
                <span className="text-sm font-medium text-neutral-300">Customer Lifetime Value</span>
                <div className="flex items-center gap-1 text-xs text-emerald-400">
                  <ArrowUpRight className="h-3 w-3" />
                  8.3%
                </div>
              </div>
              <div className="text-xl font-semibold text-neutral-100 mb-1">${analyticsData.customerLifetimeValue.toLocaleString()}</div>
              <div className="text-xs text-neutral-500">Average CLV</div>
            </div>

            {/* Cost Per Acquisition */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-medium text-neutral-300">Cost Per Acquisition</span>
                <div className="flex items-center gap-1 text-xs text-emerald-400">
                  <ArrowDownRight className="h-3 w-3" />
                  12.1%
                </div>
              </div>
              <div className="text-xl font-semibold text-neutral-100 mb-1">${analyticsData.costPerAcquisition}</div>
              <div className="text-xs text-neutral-500">Customer acquisition cost</div>
            </div>

            {/* Monthly Recurring Revenue */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="h-4 w-4 text-pink-400" />
                <span className="text-sm font-medium text-neutral-300">Monthly Recurring Revenue</span>
                <div className="flex items-center gap-1 text-xs text-emerald-400">
                  <ArrowUpRight className="h-3 w-3" />
                  15.2%
                </div>
              </div>
              <div className="text-xl font-semibold text-neutral-100 mb-1">${analyticsData.monthlyRecurringRevenue.toLocaleString()}</div>
              <div className="text-xs text-neutral-500">Recurring revenue stream</div>
            </div>

            {/* Churn Rate */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="h-4 w-4 text-indigo-400" />
                <span className="text-sm font-medium text-neutral-300">Churn Rate</span>
                <div className="flex items-center gap-1 text-xs text-emerald-400">
                  <ArrowDownRight className="h-3 w-3" />
                  0.8%
                </div>
              </div>
              <div className="text-xl font-semibold text-neutral-100 mb-1">{analyticsData.churnRate}%</div>
              <div className="text-xs text-neutral-500">Monthly customer churn</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Scrollable Content */}
      <div className="overflow-y-auto">
        {/* Professional Data Analysis Section */}
        <div className="px-6 py-6 space-y-8">

        {/* Business Health Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-100">Business Health Indicators</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400">Real-time monitoring</span>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-6">
            {healthMetrics.map((metric, index) => (
              <div key={metric.title} className="border border-neutral-800">
                <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-950">
                  <div className="flex items-center gap-2">
                    <div className={'w-3 h-3 rounded-full ${
                      metric.status === 'excellent' ? 'bg-emerald-500' : 
                      metric.status === 'good' ? 'bg-blue-500' : 'bg-orange-500'
                    }'}></div>
                    <h4 className="text-sm font-medium text-neutral-100">{metric.title}</h4>
                    <div className={'ml-auto px-2 py-1 rounded text-xs ${
                      metric.status === 'excellent' ? 'bg-emerald-500/20 text-emerald-400' : 
                      metric.status === 'good' ? 'bg-blue-500/20 text-blue-400' : 
                      'bg-orange-500/20 text-orange-400'
                    }'}>
                      {metric.status === 'excellent' ? 'Excellent' : 
                       metric.status === 'good' ? 'Good' : 'Needs Attention'}
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-2xl font-bold text-neutral-100 mb-1">
                    {typeof metric.value === 'number' && metric.title.includes('Score') ? metric.value : 
                     typeof metric.value === 'number' && metric.title.includes('Margin') ? '${metric.value}%' :
                     typeof metric.value === 'number` ? '${metric.value} mo' : metric.value}
                  </div>
                  <p className="text-xs text-neutral-400">{metric.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Analysis Row */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-100">Performance Analysis</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400">Real-time data stream</span>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <div className="border border-neutral-800">
              <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-950">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  <h3 className="text-sm font-medium text-neutral-100">Revenue Trends</h3>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs ml-auto">
                    +12.5% Growth
                  </Badge>
                </div>
              </div>
              <div className="p-4">
                <p className="text-xs text-neutral-500 mb-4">30-day revenue performance with trend analysis</p>
                <div className="h-72 bg-neutral-800/20 rounded border border-neutral-700/30">
                  <RevenueChart />
                </div>
              </div>
            </div>

            {/* Conversion Funnel */}
            <div className="border border-neutral-800">
              <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-950">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-400" />
                  <h3 className="text-sm font-medium text-neutral-100">Conversion Analysis</h3>
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-xs ml-auto">
                    3.4% Avg Rate
                  </Badge>
                </div>
              </div>
              <div className="p-4">
                <p className="text-xs text-neutral-500 mb-4">Customer journey and conversion optimization insights</p>
                <div className="h-72 bg-neutral-800/20 rounded border border-neutral-700/30">
                  <ConversionFunnel />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Industry Performance Comparison */}
        {!fromIndustry && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-4 w-4 text-purple-400" />
              <h2 className="text-lg font-semibold text-neutral-100">Industry Benchmarking</h2>
            </div>
            <div className="border border-neutral-800 p-4">
              <p className="text-xs text-neutral-500 mb-4">Performance comparison across different industry verticals</p>
              <IndustryComparison data={industryMetrics} />
            </div>
          </div>
        )}

        {/* Quick Actions Panel */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-emerald-400" />
            <h2 className="text-lg font-semibold text-neutral-100">Quick Actions & Tools</h2>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div className="border border-neutral-800">
              <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-950">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-400" />
                  <h3 className="text-sm font-medium text-neutral-100">Advanced Charts</h3>
                </div>
              </div>
              <div className="p-4">
                <p className="text-xs text-neutral-400 mb-3">
                  Professional TradingView charts and technical analysis
                </p>
                <Link 
                  href={'/dashboards/analytics/advanced${fromIndustry ? '?from=' + fromIndustry : '}'}
                  className="inline-flex items-center justify-center w-full h-8 px-3 text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-md hover:bg-blue-500/30 transition-colors"
                >
                  Explore Charts
                </Link>
              </div>
            </div>

            <div className="border border-neutral-800">
              <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-950">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-purple-400" />
                  <h3 className="text-sm font-medium text-neutral-100">Custom Reports</h3>
                </div>
              </div>
              <div className="p-4">
                <p className="text-xs text-neutral-400 mb-3">
                  Build professional reports with automated insights
                </p>
                <Link 
                  href={'/dashboards/analytics/reports${fromIndustry ? '?from=' + fromIndustry : '}'}
                  className="inline-flex items-center justify-center w-full h-8 px-3 text-xs border border-neutral-700 text-neutral-300 rounded-md hover:bg-neutral-700/50 hover:text-neutral-100 transition-colors"
                >
                  Create Report
                </Link>
              </div>
            </div>

            <div className="border border-neutral-800">
              <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-950">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-emerald-400" />
                  <h3 className="text-sm font-medium text-neutral-100">Multi-Pane Analysis</h3>
                </div>
              </div>
              <div className="p-4">
                <p className="text-xs text-neutral-400 mb-3">
                  Compare multiple data streams with synchronized charts
                </p>
                <Link 
                  href={'/dashboards/analytics/multi-pane${fromIndustry ? '?from=' + fromIndustry : '}'}
                  className="inline-flex items-center justify-center w-full h-8 px-3 text-xs border border-neutral-700 text-neutral-300 rounded-md hover:bg-neutral-700/50 hover:text-neutral-100 transition-colors"
                >
                  Multi-Pane View
                </Link>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Professional Status Bar */}
      <div className="border-t border-neutral-800 bg-neutral-950">
        <div className="flex items-center justify-between px-6 py-2 text-xs">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-neutral-400">Platform Status:</span>
              <span className="text-emerald-400">Operational</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-400">Data Stream:</span>
              <span className="text-neutral-300">Live</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-400">Metrics:</span>
              <span className="text-neutral-300">Real-time</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-neutral-400">Industry:</span>
              <span className="text-blue-400 capitalize">{fromIndustry ? analyticsData.businessType : 'Cross-Industry'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-400">Period:</span>
              <span className="text-neutral-300">30D</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-400">Updated:</span>
              <span className="text-neutral-300">{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}