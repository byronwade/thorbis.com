"use client";

import { useSearchParams } from "next/navigation";
import { Settings2, Brain, Zap, Plus, BarChart3, TrendingUp, Target, Activity, DollarSign, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartBuilder, ChartConfig } from "@/components/analytics/builders/chart-builder";
import { TradingViewChartData } from "@/components/analytics/advanced-charts/trading-view-wrapper";
import { AnalyticsBackButton } from "@/components/analytics/analytics-back-button";
import { useState } from "react";

export default function AnalyticsBuilder() {
  const searchParams = useSearchParams();
  const fromIndustry = searchParams.get('from');
  const template = searchParams.get('template');
  
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCustomDashboardForm, setShowCustomDashboardForm] = useState(template === 'custom');
  
  // Custom dashboard form state
  const [dashboardForm, setDashboardForm] = useState({
    name: ',
    description: ',
    template: ',
    industry: fromIndustry || ',
    dataSources: [] as string[],
    chartTypes: [] as string[]
  });

  // Mock data sources for chart builder
  const availableDataSources = [
    {
      id: 'analytics',
      name: 'Analytics Data',
      fields: [
        { name: 'timestamp', type: 'date', description: 'Event timestamp' },
        { name: 'revenue', type: 'number', description: 'Revenue amount' },
        { name: 'users', type: 'number', description: 'User count' },
        { name: 'sessions', type: 'number', description: 'Session count' },
        { name: 'conversions', type: 'number', description: 'Conversion count' },
        { name: 'page_views', type: 'number', description: 'Page view count' },
        { name: 'source', type: 'string', description: 'Traffic source' },
        { name: 'device', type: 'string', description: 'Device type' },
      ] as Array<{ name: string; type: 'string' | 'number' | 'date' | 'boolean'; description?: string }>,
    },
    {
      id: 'field_service',
      name: 'Field Service Data',
      fields: [
        { name: 'job_date', type: 'date', description: 'Job completion date' },
        { name: 'job_value', type: 'number', description: 'Job value' },
        { name: 'technician_id', type: 'string', description: 'Technician identifier' },
        { name: 'completion_time', type: 'number', description: 'Time to complete (minutes)' },
        { name: 'customer_rating', type: 'number', description: 'Customer satisfaction rating' },
        { name: 'industry', type: 'string', description: 'Industry type' },
      ] as Array<{ name: string; type: 'string' | 'number' | 'date' | 'boolean'; description?: string }>,
    },
    {
      id: 'financial',
      name: 'Financial Data',
      fields: [
        { name: 'transaction_date', type: 'date', description: 'Transaction date' },
        { name: 'amount', type: 'number', description: 'Transaction amount' },
        { name: 'category', type: 'string', description: 'Expense/Revenue category' },
        { name: 'payment_method', type: 'string', description: 'Payment method used' },
        { name: 'customer_id', type: 'string', description: 'Customer identifier' },
        { name: 'profit_margin', type: 'number', description: 'Profit margin percentage' },
      ] as Array<{ name: string; type: 'string' | 'number' | 'date' | 'boolean'; description?: string }>,
    },
    {
      id: 'customer_behavior',
      name: 'Customer Behavior',
      fields: [
        { name: 'visit_date', type: 'date', description: 'Customer visit date' },
        { name: 'session_duration', type: 'number', description: 'Session duration in minutes' },
        { name: 'pages_visited', type: 'number', description: 'Number of pages visited' },
        { name: 'bounce_rate', type: 'number', description: 'Bounce rate percentage' },
        { name: 'conversion_funnel_stage', type: 'string', description: 'Current funnel stage' },
        { name: 'ltv', type: 'number', description: 'Customer lifetime value' },
      ] as Array<{ name: string; type: 'string' | 'number' | 'date' | 'boolean'; description?: string }>,
    }
  ];

  // Custom dashboard templates
  const dashboardTemplates = [
    {
      id: 'revenue-analysis',
      name: 'Revenue Analysis Dashboard',
      description: 'Track revenue trends, forecasting, and growth metrics',
      icon: DollarSign,
      charts: ['line-chart', 'bar-chart', 'trend-analysis'],
      color: 'emerald'
    },
    {
      id: 'customer-insights',
      name: 'Customer Insights Dashboard', 
      description: 'Customer behavior, segmentation, and lifetime value analysis',
      icon: Users,
      charts: ['funnel-chart', 'pie-chart', 'cohort-analysis'],
      color: 'blue'
    },
    {
      id: 'performance-metrics',
      name: 'Performance Metrics Dashboard',
      description: 'KPI tracking, goal setting, and performance monitoring',
      icon: Target,
      charts: ['gauge-chart', 'metric-cards', 'comparison-charts'],
      color: 'purple'
    },
    {
      id: 'operational-analytics',
      name: 'Operational Analytics Dashboard',
      description: 'Business operations, efficiency, and workflow analysis',
      icon: Activity,
      charts: ['timeline-chart', 'heat-map', 'process-flow'],
      color: 'orange'
    }
  ];

  const handleCustomDashboardSubmit = async () => {
    setIsSaving(true);
    try {
      // Simulate dashboard creation
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Custom dashboard created:', dashboardForm);
      
      // Reset form and hide
      setDashboardForm({
        name: ',
        description: ',
        template: ',
        industry: fromIndustry || ',
        dataSources: [],
        chartTypes: []
      });
      setShowCustomDashboardForm(false);
      
      // Here you would navigate to the new dashboard or continue with chart builder
    } finally {
      setIsSaving(false);
    }
  };

  const handleChartSave = async (config: ChartConfig) => {
    setIsSaving(true);
    try {
      // Simulate save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Chart saved:', config);
      // Here you would typically save to backend
    } finally {
      setIsSaving(false);
    }
  };

  const handleChartPreview = async (config: ChartConfig): Promise<TradingViewChartData[]> => {
    setIsGenerating(true);
    // Mock preview data generation
    return new Promise((resolve) => {
      setTimeout(() => {
        // Generate sample data based on config and chart type
        const data: TradingViewChartData[] = [];
        const now = new Date();
        const days = 30;
        
        let baseValue = 50000 + Math.random() * 50000;
        
        for (const i = 0; i < days; i++) {
          const date = new Date(now.getTime() - (days - i) * 24 * 60 * 60 * 1000);
          const time = Math.floor(date.getTime() / 1000) as any;
          
          // Generate data based on chart type
          if (config.type === 'candlestick') {
            // For candlestick charts, need open, high, low, close
            const variation = (Math.random() - 0.5) * 5000;
            baseValue += variation;
            
            const open = baseValue;
            const volatility = Math.random() * 3000 + 1000;
            const high = open + Math.random() * volatility;
            const low = open - Math.random() * volatility;
            const close = low + Math.random() * (high - low);
            
            data.push({
              time,
              open: Math.max(1000, open),
              high: Math.max(1000, high),
              low: Math.max(1000, low),
              close: Math.max(1000, close),
            });
            
            baseValue = close;
          } else if (config.type === 'bar') {
            // For bar charts, need open, high, low, close
            const variation = (Math.random() - 0.5) * 5000;
            baseValue += variation;
            
            const open = baseValue;
            const volatility = Math.random() * 2000 + 500;
            const high = open + Math.random() * volatility;
            const low = open - Math.random() * volatility;
            const close = low + Math.random() * (high - low);
            
            data.push({
              time,
              open: Math.max(1000, open),
              high: Math.max(1000, high),
              low: Math.max(1000, low),
              close: Math.max(1000, close),
            });
            
            baseValue = close;
          } else if (config.type === 'histogram') {
            // For histogram, just need value
            const variation = (Math.random() - 0.5) * 10000;
            baseValue += variation;
            
            data.push({
              time,
              value: Math.max(1000, baseValue + Math.random() * 20000),
            });
          } else {
            // For line and area charts, just need value
            const variation = (Math.random() - 0.5) * 5000;
            baseValue += variation;
            
            data.push({
              time,
              value: Math.max(1000, baseValue + Math.random() * 15000),
            });
          }
        }
        
        setIsGenerating(false);
        resolve(data);
      }, 800);
    });
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header with back button - full width edge-to-edge */}
      <div className="border-b bg-card">
        <div className="flex items-center gap-4 p-4">
          <AnalyticsBackButton />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">
                {showCustomDashboardForm ? 'Create Custom Dashboard' : 'Chart Builder'}
              </h1>
              <Badge variant="outline" className="bg-green-500/20 text-green-600 border-green-500/30">
                AI Powered
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {showCustomDashboardForm 
                ? 'Build a custom analytics dashboard with pre-designed templates and data sources'
                : (fromIndustry ? 'Custom chart builder for ${fromIndustry.toUpperCase()} Industry' : 'Create custom analytics dashboards with AI assistance and drag-and-drop interface')
              }
            </p>
          </div>
          
          {/* Builder Controls */}
          <div className="flex items-center gap-2">
            {isGenerating && (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-600 rounded-full border border-blue-500/20">
                <Brain className="h-3 w-3 animate-pulse" />
                Generating Preview...
              </div>
            )}
            {isSaving && (
              <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-600 rounded-full border border-green-500/20">
                <Zap className="h-3 w-3 animate-pulse" />
                {showCustomDashboardForm ? 'Creating Dashboard...' : 'Saving Chart...'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Features Info Bar */}
      <div className="border-b bg-gradient-to-r from-green-500/5 via-blue-500/5 to-purple-500/5 px-4 py-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-green-600">
              <Brain className="h-3 w-3" />
              {showCustomDashboardForm ? 'AI Template Suggestions' : 'AI Chart Suggestions'}
            </div>
            <div className="flex items-center gap-2 text-blue-600">
              <Zap className="h-3 w-3" />
              {showCustomDashboardForm ? 'Smart Layout Generation' : 'Smart Data Mapping'}
            </div>
            <div className="flex items-center gap-2 text-purple-600">
              <Settings2 className="h-3 w-3" />
              {showCustomDashboardForm ? 'Auto-configuration' : 'Auto-optimization`}
            </div>
          </div>
          <div className="text-muted-foreground">
            {showCustomDashboardForm 
              ? `${dashboardTemplates.length} templates • ${availableDataSources.length} data sources`
              : '${availableDataSources.length} data sources • AI-powered recommendations'
            }
          </div>
        </div>
      </div>

      {/* Main Builder Area - Full screen, edge-to-edge */}
      <div className="flex-1 overflow-hidden">
        {showCustomDashboardForm ? (
          /* Custom Dashboard Creation Form */
          <div className="h-full overflow-y-auto p-6">
            <div className="max-w-6xl mx-auto space-y-8">
              {/* Dashboard Details Section */}
              <div className="bg-neutral-900/50 border border-neutral-700/50 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-4 w-4 text-blue-400" />
                  </div>
                  <h2 className="text-lg font-semibold text-neutral-100">Dashboard Configuration</h2>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-200 mb-2">
                        Dashboard Name
                      </label>
                      <Input
                        placeholder="Enter dashboard name"
                        value={dashboardForm.name}
                        onChange={(e) => setDashboardForm({...dashboardForm, name: e.target.value})}
                        className="bg-neutral-800/50 border-neutral-700 text-neutral-100"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-200 mb-2">
                        Description
                      </label>
                      <Input
                        placeholder="Brief description of the dashboard purpose"
                        value={dashboardForm.description}
                        onChange={(e) => setDashboardForm({...dashboardForm, description: e.target.value})}
                        className="bg-neutral-800/50 border-neutral-700 text-neutral-100"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-200 mb-2">
                        Industry Focus
                      </label>
                      <Select 
                        value={dashboardForm.industry} 
                        onValueChange={(value) => setDashboardForm({...dashboardForm, industry: value})}
                      >
                        <SelectTrigger className="bg-neutral-800/50 border-neutral-700 text-neutral-100">
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-800 border-neutral-700">
                          <SelectItem value="hs">Home Services</SelectItem>
                          <SelectItem value="rest">Restaurant</SelectItem>
                          <SelectItem value="auto">Auto Services</SelectItem>
                          <SelectItem value="ret">Retail</SelectItem>
                          <SelectItem value="books">Financial Services</SelectItem>
                          <SelectItem value="general">General Business</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Template Selection */}
              <div className="bg-neutral-900/50 border border-neutral-700/50 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Target className="h-4 w-4 text-purple-400" />
                  </div>
                  <h2 className="text-lg font-semibold text-neutral-100">Choose Template</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dashboardTemplates.map((template) => {
                    const Icon = template.icon
                    const isSelected = dashboardForm.template === template.id
                    
                    return (
                      <div
                        key={template.id}
                        onClick={() => setDashboardForm({...dashboardForm, template: template.id})}
                        className={'
                          p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:scale-[1.02]
                          ${isSelected 
                            ? 'border-blue-500/50 bg-blue-500/10' 
                            : 'border-neutral-700/50 bg-neutral-800/30 hover:border-neutral-600/50 hover:bg-neutral-800/50'
                          }
                        '}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className={'w-10 h-10 rounded-lg flex items-center justify-center ${
                            template.color === 'emerald' ? 'bg-emerald-500/20' :
                            template.color === 'blue' ? 'bg-blue-500/20' :
                            template.color === 'purple' ? 'bg-purple-500/20' :
                            'bg-orange-500/20'
                          }'}>
                            <Icon className={'h-5 w-5 ${
                              template.color === 'emerald' ? 'text-emerald-400' :
                              template.color === 'blue' ? 'text-blue-400' :
                              template.color === 'purple' ? 'text-purple-400' :
                              'text-orange-400'
                            }'} />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold text-neutral-100">{template.name}</h3>
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-neutral-400 mb-3">{template.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {template.charts.map((chart) => (
                            <span 
                              key={chart}
                              className="px-2 py-1 text-xs bg-neutral-700/50 text-neutral-400 rounded"
                            >
                              {chart.replace('-', ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-neutral-700/50">
                <Button
                  variant="outline"
                  onClick={() => setShowCustomDashboardForm(false)}
                  className="bg-transparent border-neutral-700 text-neutral-300 hover:bg-neutral-800/60 hover:text-neutral-100"
                >
                  Switch to Chart Builder
                </Button>
                
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDashboardForm({
                        name: ',
                        description: ',
                        template: ',
                        industry: fromIndustry || ',
                        dataSources: [],
                        chartTypes: []
                      })
                    }}
                    className="bg-transparent border-neutral-700 text-neutral-300 hover:bg-neutral-800/60 hover:text-neutral-100"
                  >
                    Reset Form
                  </Button>
                  
                  <Button
                    onClick={handleCustomDashboardSubmit}
                    disabled={!dashboardForm.name || !dashboardForm.template || isSaving}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isSaving ? (
                      <>
                        <Zap className="h-4 w-4 mr-2 animate-pulse" />
                        Creating Dashboard...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Dashboard
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Chart Builder Interface */
          <div className="h-full">
            <ChartBuilder
              availableDataSources={availableDataSources}
              onSave={handleChartSave}
              onPreview={handleChartPreview}
              className="h-full border-0"
            />
          </div>
        )}
      </div>
    </div>
  );
}