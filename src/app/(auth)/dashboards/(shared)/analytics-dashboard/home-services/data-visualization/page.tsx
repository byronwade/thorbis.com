"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { TradingViewWrapper, TradingViewWrapperRef, TradingViewChartData } from '@/components/analytics/advanced-charts/trading-view-wrapper'
import { TimeFrameControls, TimeRange } from '@/components/analytics/controls/time-frame-controls'
import { cn } from '@/lib/utils'
import {
  BarChart3,
  PieChart,
  LineChart,
  TrendingUp,
  TrendingDown,
  Activity,
  Eye,
  Layers,
  Grid,
  Layout,
  Palette,
  Settings,
  Download,
  Upload,
  Save,
  Share2,
  Filter,
  Maximize2,
  Minimize2,
  RotateCcw,
  RefreshCw,
  Calendar,
  Clock,
  Target,
  Zap,
  Brain,
  Database,
  Network,
  Cpu,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Map,
  Star,
  Award,
  Trophy,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Plus,
  Minus,
  X,
  Check,
  AlertTriangle,
  Info,
  HelpCircle,
  Sparkles,
  Radar,
  Crosshair,
  Gauge,
  Thermometer,
  Droplets,
  Wind,
  Sun,
  Moon,
  Users,
  DollarSign,
  Package,
  Truck,
  Wrench,
  Phone,
  Mail,
  MapPin,
  Building,
  Car,
  Home
} from 'lucide-react'

interface VisualizationWidget {
  id: string
  type: 'chart' | 'metric' | 'table' | 'map' | 'gauge' | 'timeline'
  title: string
  description: string
  size: 'small' | 'medium' | 'large' | 'xlarge'
  position: { x: number; y: number }
  data_source: string
  chart_type?: 'line' | 'area' | 'bar' | 'pie' | 'scatter' | 'heatmap' | 'candlestick'
  config: Record<string, unknown>
  last_updated: string
  performance_score: number
  is_real_time: boolean
  custom_styling: Record<string, unknown>
}

interface DataSource {
  id: string
  name: string
  type: 'api' | 'database' | 'file' | 'real-time' | 'ai-generated'
  status: 'connected' | 'disconnected' | 'error' | 'syncing'
  update_frequency: string
  last_sync: string
  records_count: number
  data_quality: number
  latency_ms: number
  icon: React.ComponentType<{ className?: string }>
  color: string
}

interface ChartTemplate {
  id: string
  name: string
  category: 'business' | 'technical' | 'financial' | 'operational'
  description: string
  chart_type: string
  use_cases: string[]
  complexity: 'basic' | 'intermediate' | 'advanced'
  estimated_setup_time: string
  preview_data: TradingViewChartData[]
  icon: React.ComponentType<{ className?: string }>
}

interface VisualizationTheme {
  id: string
  name: string
  description: string
  primary_color: string
  secondary_color: string
  accent_color: string
  background_color: string
  text_color: string
  grid_color: string
  is_dark: boolean
}

interface AnalyticsInsight {
  id: string
  type: 'trend' | 'anomaly' | 'correlation' | 'prediction' | 'recommendation'
  title: string
  description: string
  confidence: number
  impact: 'high' | 'medium' | 'low'
  data_points: number
  time_range: string
  suggested_action: string
  business_value: string
  icon: React.ComponentType<{ className?: string }>
}

const visualizationWidgets: VisualizationWidget[] = [
  {
    id: 'revenue-performance',
    type: 'chart',
    title: 'Revenue Performance Analysis',
    description: 'Multi-dimensional revenue analysis with predictive forecasting',
    size: 'xlarge',
    position: { x: 0, y: 0 },
    data_source: 'financial_api',
    chart_type: 'area',
    config: {
      show_forecast: true,
      enable_drill_down: true,
      auto_refresh: true,
      comparison_mode: 'year_over_year'
    },
    last_updated: '2 minutes ago',
    performance_score: 97.2,
    is_real_time: true,
    custom_styling: {
      gradient_fill: true,
      animation_speed: 'smooth',
      hover_effects: 'enhanced'
    }
  },
  {
    id: 'customer-satisfaction',
    type: 'gauge',
    title: 'Customer Satisfaction Score',
    description: 'Real-time customer satisfaction monitoring with trend analysis',
    size: 'medium',
    position: { x: 2, y: 0 },
    data_source: 'customer_feedback_stream',
    config: {
      target_value: 85,
      warning_threshold: 70,
      critical_threshold: 60,
      show_trend: true
    },
    last_updated: '30 seconds ago',
    performance_score: 94.8,
    is_real_time: true,
    custom_styling: {
      gauge_style: 'modern',
      color_zones: true,
      animated_needle: true
    }
  },
  {
    id: 'service-operations-map',
    type: 'map',
    title: 'Live Service Operations Map',
    description: 'Real-time technician locations and service area performance',
    size: 'large',
    position: { x: 0, y: 2 },
    data_source: 'gps_tracking_api',
    config: {
      show_technician_locations: true,
      show_service_areas: true,
      heat_map_overlay: true,
      traffic_integration: true
    },
    last_updated: '15 seconds ago',
    performance_score: 89.5,
    is_real_time: true,
    custom_styling: {
      map_style: 'dark',
      marker_animations: true,
      cluster_icons: true
    }
  },
  {
    id: 'equipment-health',
    type: 'timeline',
    title: 'Equipment Health Timeline',
    description: 'Predictive maintenance timeline with AI-powered insights',
    size: 'large',
    position: { x: 2, y: 1 },
    data_source: 'iot_sensor_data',
    config: {
      prediction_horizon: '90_days',
      show_maintenance_events: true,
      alert_thresholds: true,
      ai_recommendations: true
    },
    last_updated: '5 minutes ago',
    performance_score: 92.1,
    is_real_time: true,
    custom_styling: {
      timeline_style: 'modern',
      event_clustering: true,
      predictive_highlighting: true
    }
  }
]

const dataSources: DataSource[] = [
  {
    id: 'financial_api',
    name: 'Financial Data API',
    type: 'api',
    status: 'connected',
    update_frequency: 'Real-time',
    last_sync: '2 minutes ago',
    records_count: 1250000,
    data_quality: 98.7,
    latency_ms: 45,
    icon: DollarSign,
    color: 'text-green-400'
  },
  {
    id: 'customer_feedback_stream',
    name: 'Customer Feedback Stream',
    type: 'real-time',
    status: 'connected',
    update_frequency: 'Live stream',
    last_sync: '30 seconds ago',
    records_count: 89000,
    data_quality: 94.2,
    latency_ms: 120,
    icon: Star,
    color: 'text-yellow-400'
  },
  {
    id: 'gps_tracking_api',
    name: 'GPS Tracking API',
    type: 'api',
    status: 'connected',
    update_frequency: '15 seconds',
    last_sync: '15 seconds ago',
    records_count: 2450,
    data_quality: 96.8,
    latency_ms: 85,
    icon: MapPin,
    color: 'text-blue-400'
  },
  {
    id: 'iot_sensor_data',
    name: 'IoT Sensor Network',
    type: 'real-time',
    status: 'connected',
    update_frequency: '1 minute',
    last_sync: '1 minute ago',
    records_count: 450000,
    data_quality: 91.5,
    latency_ms: 200,
    icon: Cpu,
    color: 'text-purple-400'
  },
  {
    id: 'crm_database',
    name: 'CRM Database',
    type: 'database',
    status: 'syncing',
    update_frequency: '1 hour',
    last_sync: '45 minutes ago',
    records_count: 67000,
    data_quality: 89.3,
    latency_ms: 350,
    icon: Users,
    color: 'text-orange-400'
  },
  {
    id: 'ai_insights_engine',
    name: 'AI Insights Engine',
    type: 'ai-generated',
    status: 'connected',
    update_frequency: '5 minutes',
    last_sync: '3 minutes ago',
    records_count: 15420,
    data_quality: 95.7,
    latency_ms: 180,
    icon: Brain,
    color: 'text-cyan-400'
  }
]

const chartTemplates: ChartTemplate[] = [
  {
    id: 'revenue-forecast-template',
    name: 'Revenue Forecasting Chart',
    category: 'financial',
    description: 'Advanced revenue prediction with confidence intervals and scenario analysis',
    chart_type: 'area',
    use_cases: ['Revenue Planning', 'Budget Forecasting', 'Growth Analysis', 'Risk Assessment'],
    complexity: 'advanced',
    estimated_setup_time: '10 minutes',
    preview_data: [],
    icon: TrendingUp
  },
  {
    id: 'customer-journey-template',
    name: 'Customer Journey Funnel',
    category: 'business',
    description: 'Multi-stage customer journey analysis with conversion tracking',
    chart_type: 'bar',
    use_cases: ['Conversion Analysis', 'Customer Experience', 'Marketing Optimization'],
    complexity: 'intermediate',
    estimated_setup_time: '7 minutes',
    preview_data: [],
    icon: Users
  },
  {
    id: 'equipment-performance-template',
    name: 'Equipment Performance Matrix',
    category: 'operational',
    description: 'Real-time equipment monitoring with predictive maintenance alerts',
    chart_type: 'heatmap',
    use_cases: ['Maintenance Planning', 'Performance Monitoring', 'Cost Optimization'],
    complexity: 'intermediate',
    estimated_setup_time: '8 minutes',
    preview_data: [],
    icon: Gauge
  },
  {
    id: 'market-analysis-template',
    name: 'Competitive Market Analysis',
    category: 'business',
    description: 'Market position analysis with competitor benchmarking',
    chart_type: 'scatter',
    use_cases: ['Market Research', 'Competitive Analysis', 'Strategic Planning'],
    complexity: 'advanced',
    estimated_setup_time: '12 minutes',
    preview_data: [],
    icon: Target
  }
]

const visualizationThemes: VisualizationTheme[] = [
  {
    id: 'thorbis-dark',
    name: 'Thorbis Dark (Default)',
    description: 'Professional dark theme with electric blue accents',
    primary_color: '#1C8BFF',
    secondary_color: '#0A0A0A',
    accent_color: '#00E5FF',
    background_color: '#0A0A0A',
    text_color: '#F5F5F5',
    grid_color: '#1F1F1F',
    is_dark: true
  },
  {
    id: 'executive-minimal',
    name: 'Executive Minimal',
    description: 'Clean minimal theme for executive presentations',
    primary_color: '#2563EB',
    secondary_color: '#F8FAFC',
    accent_color: '#059669',
    background_color: '#FFFFFF',
    text_color: '#1E293B',
    grid_color: '#E2E8F0',
    is_dark: false
  },
  {
    id: 'high-contrast',
    name: 'High Contrast Analytics',
    description: 'High contrast theme optimized for data analysis',
    primary_color: '#FF6B35',
    secondary_color: '#000000',
    accent_color: '#00FF94',
    background_color: '#000000',
    text_color: '#FFFFFF',
    grid_color: '#333333',
    is_dark: true
  },
  {
    id: 'financial-professional',
    name: 'Financial Professional',
    description: 'Traditional financial industry color scheme',
    primary_color: '#059669',
    secondary_color: '#F0FDF4',
    accent_color: '#DC2626',
    background_color: '#FFFFFF',
    text_color: '#064E3B',
    grid_color: '#D1FAE5',
    is_dark: false
  }
]

const analyticsInsights: AnalyticsInsight[] = [
  {
    id: 'revenue-trend-analysis',
    type: 'trend',
    title: 'Strong Q4 Revenue Growth Pattern Detected',
    description: 'AI analysis reveals a consistent 18% revenue increase pattern emerging in Q4 across all service categories, suggesting effective seasonal strategy implementation.',
    confidence: 94.2,
    impact: 'high',
    data_points: 15420,
    time_range: 'Last 24 months',
    suggested_action: 'Optimize resource allocation for Q4 to maximize revenue potential',
    business_value: '+$280K potential additional revenue',
    icon: TrendingUp
  },
  {
    id: 'customer-churn-prediction',
    type: 'prediction',
    title: 'Customer Churn Risk Identified',
    description: 'Machine learning models predict 8.4% customer churn risk in the premium service segment within next 60 days based on engagement patterns.',
    confidence: 87.9,
    impact: 'high',
    data_points: 8920,
    time_range: 'Next 60 days',
    suggested_action: 'Implement targeted retention campaign for at-risk premium customers',
    business_value: 'Prevent $150K potential revenue loss',
    icon: AlertTriangle
  },
  {
    id: 'operational-efficiency-correlation',
    type: 'correlation',
    title: 'Weather-Performance Correlation Discovered',
    description: 'Strong correlation (r=0.82) found between weather patterns and technician efficiency. Temperature drops below 45°F correlate with 12% efficiency decrease.',
    confidence: 91.7,
    impact: 'medium',
    data_points: 25600,
    time_range: 'Last 18 months',
    suggested_action: 'Develop weather-adaptive scheduling and equipment protocols',
    business_value: '+15% operational efficiency potential',
    icon: Network
  },
  {
    id: 'anomaly-equipment-failure',
    type: 'anomaly',
    title: 'Equipment Failure Anomaly Pattern',
    description: 'Unusual equipment failure pattern detected in Zone 3 vehicles - 340% above baseline. Pattern suggests potential maintenance protocol issue.',
    confidence: 96.1,
    impact: 'high',
    data_points: 4850,
    time_range: 'Last 30 days',
    suggested_action: 'Immediate inspection of Zone 3 maintenance procedures and equipment',
    business_value: 'Prevent $85K in potential equipment costs',
    icon: AlertTriangle
  }
]

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('en-US').format(num)
}

const formatLatency = (ms: number) => {
  return '${ms}ms'
}

export default function DataVisualizationFrameworkPage() {
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null)
  const [selectedTheme, setSelectedTheme] = useState('thorbis-dark')
  const [selectedDataSource, setSelectedDataSource] = useState<string | null>(null)
  const [currentTimeRange, setCurrentTimeRange] = useState<TimeRange>()
  const [isEditMode, setIsEditMode] = useState(false)
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false)
  const [showDataSources, setShowDataSources] = useState(false)
  const [revenueChartData, setRevenueChartData] = useState<TradingViewChartData[]>([])
  const tradingViewRef = useRef<TradingViewWrapperRef>(null)

  // Generate sample revenue chart data for the framework
  useEffect(() => {
    const generateRevenueData = () => {
      const data: TradingViewChartData[] = []
      const now = new Date()
      const startTime = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) // 3 months ago
      
      const baseRevenue = 485000
      
      for (const i = 0; i < 90; i++) {
        const time = new Date(startTime.getTime() + i * 24 * 60 * 60 * 1000)
        
        // Add realistic business patterns with AI enhancements
        const seasonalFactor = 1 + 0.1 * Math.sin((i / 365) * Math.PI * 2)
        const trendGrowth = 1 + (i / 2000) // Growth trend
        const aiOptimization = 1.08 // 8% AI-driven improvement
        const randomVariation = 0.95 + Math.random() * 0.1
        
        const dailyRevenue = baseRevenue * seasonalFactor * trendGrowth * aiOptimization * randomVariation
        
        data.push({
          time: Math.floor(time.getTime() / 1000) as any,
          value: Math.max(420000, dailyRevenue),
        })
      }
      
      return data
    }

    setRevenueChartData(generateRevenueData())
  }, [])

  const handleTimeRangeChange = (range: TimeRange) => {
    setCurrentTimeRange(range)
  }

  const currentTheme = visualizationThemes.find(t => t.id === selectedTheme) || visualizationThemes[0]

  return (
    <div className="h-full bg-neutral-950 text-neutral-100 p-6 space-y-6 overflow-auto">
      {/* Advanced Data Visualization Framework Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Eye className="h-6 w-6 text-cyan-400" />
            <h1 className="text-2xl font-bold text-neutral-100">Advanced Data Visualization Framework</h1>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Enhanced
              </Badge>
              <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                <Layers className="h-3 w-3 mr-1" />
                Multi-Dimensional
              </Badge>
              <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                <RefreshCw className="h-3 w-3 mr-1" />
                Real-Time
              </Badge>
            </div>
          </div>
          <p className="text-neutral-400 mt-1">Advanced visualization platform with AI-powered insights, custom themes, and real-time data integration</p>
        </div>
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-neutral-700">
                <Palette className="h-4 w-4 mr-2" />
                {currentTheme.name}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-neutral-900 border-neutral-700">
              {visualizationThemes.map((theme) => (
                <DropdownMenuItem 
                  key={theme.id}
                  className="text-neutral-300"
                  onClick={() => setSelectedTheme(theme.id)}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: theme.primary_color }}
                    />
                    {theme.name}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button 
            variant={isEditMode ? "default" : "outline"} 
            size="sm" 
            className={isEditMode ? "bg-blue-600 hover:bg-blue-700" : "border-neutral-700"}
            onClick={() => setIsEditMode(!isEditMode)}
          >
            <Layout className="h-4 w-4 mr-2" />
            {isEditMode ? 'Exit Edit' : 'Edit Mode'}
          </Button>
          <Button variant="outline" size="sm" className="border-neutral-700">
            <Download className="h-4 w-4 mr-2" />
            Export Dashboard
          </Button>
          <Button variant="outline" size="sm" className="border-neutral-700">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Framework Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Button 
          variant={showTemplateLibrary ? "default" : "outline"}
          className={showTemplateLibrary ? "bg-purple-600 hover:bg-purple-700" : "border-neutral-700"}
          onClick={() => setShowTemplateLibrary(!showTemplateLibrary)}
        >
          <Grid className="h-4 w-4 mr-2" />
          Chart Templates
        </Button>
        <Button 
          variant={showDataSources ? "default" : "outline"}
          className={showDataSources ? "bg-green-600 hover:bg-green-700" : "border-neutral-700"}
          onClick={() => setShowDataSources(!showDataSources)}
        >
          <Database className="h-4 w-4 mr-2" />
          Data Sources
        </Button>
        <Button variant="outline" className="border-neutral-700">
          <Settings className="h-4 w-4 mr-2" />
          Framework Settings
        </Button>
        <Button variant="outline" className="border-neutral-700">
          <Monitor className="h-4 w-4 mr-2" />
          Performance Monitor
        </Button>
      </div>

      {/* Chart Templates Library */}
      {showTemplateLibrary && (
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Grid className="h-5 w-5 text-purple-400" />
            <h3 className="text-lg font-medium text-neutral-100">Chart Template Library</h3>
            <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
              Professional Templates
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {chartTemplates.map((template) => {
              const Icon = template.icon
              return (
                <div key={template.id} className="bg-neutral-800/50 border border-neutral-700 p-4 space-y-3 hover:border-purple-500/50 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <Icon className="h-5 w-5 text-purple-400" />
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        "text-xs",
                        template.complexity === 'basic' ? "bg-green-600/20 text-green-400" :
                        template.complexity === 'intermediate' ? "bg-yellow-600/20 text-yellow-400" :
                        "bg-red-600/20 text-red-400"
                      )}
                    >
                      {template.complexity}
                    </Badge>
                  </div>
                  <div>
                    <div className="font-medium text-neutral-200">{template.name}</div>
                    <div className="text-sm text-neutral-400 mt-1">{template.description}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs text-neutral-500">Setup Time: {template.estimated_setup_time}</div>
                    <div className="text-xs text-neutral-500">Category: {template.category}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-neutral-400">Use Cases:</div>
                    <div className="flex flex-wrap gap-1">
                      {template.use_cases.slice(0, 2).map((useCase, index) => (
                        <Badge key={index} variant="secondary" className="bg-neutral-700/50 text-neutral-300 text-xs">
                          {useCase}
                        </Badge>
                      ))}
                      {template.use_cases.length > 2 && (
                        <Badge variant="secondary" className="bg-neutral-700/50 text-neutral-300 text-xs">
                          +{template.use_cases.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700">
                    <Plus className="h-3 w-3 mr-1" />
                    Use Template
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Data Sources Panel */}
      {showDataSources && (
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Database className="h-5 w-5 text-green-400" />
            <h3 className="text-lg font-medium text-neutral-100">Data Source Management</h3>
            <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
              Live Connections
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dataSources.map((source) => {
              const Icon = source.icon
              return (
                <div key={source.id} className="bg-neutral-800/50 border border-neutral-700 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={cn("h-4 w-4", source.color)} />
                      <span className="font-medium text-neutral-200">{source.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        source.status === 'connected' ? "bg-green-500" :
                        source.status === 'syncing' ? "bg-yellow-500 animate-pulse" :
                        source.status === 'error' ? "bg-red-500" : "bg-neutral-500"
                      )} />
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-xs",
                          source.status === 'connected' ? "bg-green-600/20 text-green-400 border-green-600/30" :
                          source.status === 'syncing' ? "bg-yellow-600/20 text-yellow-400 border-yellow-600/30" :
                          source.status === 'error' ? "bg-red-600/20 text-red-400 border-red-600/30" :
                          "bg-neutral-600/20 text-neutral-400 border-neutral-600/30"
                        )}
                      >
                        {source.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-neutral-400">Records</div>
                      <div className="font-medium text-neutral-200">{formatNumber(source.records_count)}</div>
                    </div>
                    <div>
                      <div className="text-neutral-400">Quality</div>
                      <div className="font-medium text-neutral-200">{source.data_quality}%</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-neutral-400">Update Freq.</div>
                      <div className="font-medium text-neutral-200">{source.update_frequency}</div>
                    </div>
                    <div>
                      <div className="text-neutral-400">Latency</div>
                      <div className="font-medium text-neutral-200">{formatLatency(source.latency_ms)}</div>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 transition-all duration-300"
                        style={{ width: '${source.data_quality}%' }}
                      />
                    </div>
                  </div>
                  <div className="text-xs text-neutral-500">
                    Last sync: {source.last_sync}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Advanced Visualization Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart - Revenue Performance with AI Forecasting */}
        <div className="lg:col-span-2 bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-cyan-400" />
              <h3 className="text-lg font-medium text-neutral-100">Advanced Revenue Analytics</h3>
              <Badge variant="outline" className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                AI Powered
              </Badge>
              <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                Real-Time
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <TimeFrameControls
                onTimeRangeChange={handleTimeRangeChange}
                currentRange={currentTimeRange}
                enableRealTime={true}
                compact={true}
              />
              <Button variant="outline" size="sm" className="border-neutral-700">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="h-80">
            <TradingViewWrapper
              ref={tradingViewRef}
              data={revenueChartData}
              type="area"
              height="100%"
              theme="dark"
              enableRealTime={true}
              className="h-full w-full"
            />
          </div>
          <div className="flex items-center justify-between text-sm text-neutral-400">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                <span>Live Data Stream</span>
              </div>
              <div className="flex items-center gap-1">
                <Brain className="h-3 w-3" />
                <span>AI Enhanced: 97.2% Accuracy</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => tradingViewRef.current?.exportToPDF()}>
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Visualization Widgets */}
        <div className="space-y-4">
          {/* Customer Satisfaction Gauge */}
          <div className="bg-neutral-900/50 border border-neutral-800 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-yellow-400" />
                <span className="font-medium text-neutral-200">Customer Satisfaction</span>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-yellow-400">4.8</div>
              <div className="text-sm text-neutral-400">out of 5.0</div>
              <Badge variant="secondary" className="bg-green-600/20 text-green-400">
                +0.3 this month
              </Badge>
            </div>
            <div className="relative">
              <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-500 transition-all duration-300"
                  style={{ width: '96%' }}
                />
              </div>
            </div>
          </div>

          {/* Live Operations Status */}
          <div className="bg-neutral-900/50 border border-neutral-800 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-400" />
                <span className="font-medium text-neutral-200">Live Operations</span>
              </div>
              <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                All Systems Online
              </Badge>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-400">Active Technicians</span>
                <span className="font-medium text-neutral-200">47</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-400">Open Service Calls</span>
                <span className="font-medium text-neutral-200">89</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-400">Average Response</span>
                <span className="font-medium text-neutral-200">18 min</span>
              </div>
            </div>
          </div>

          {/* Performance Score */}
          <div className="bg-neutral-900/50 border border-neutral-800 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-purple-400" />
                <span className="font-medium text-neutral-200">Framework Performance</span>
              </div>
              <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                Excellent
              </Badge>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-purple-400">94.8%</div>
              <div className="text-sm text-neutral-400">Overall Score</div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500">Render Speed</span>
                <span className="text-green-400">98.2%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500">Data Accuracy</span>
                <span className="text-green-400">96.7%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500">User Experience</span>
                <span className="text-green-400">89.5%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights & Analytics Intelligence */}
      <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-5 w-5 text-cyan-400" />
          <h3 className="text-lg font-medium text-neutral-100">AI-Powered Analytics Intelligence</h3>
          <Badge variant="outline" className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
            Advanced Analytics
          </Badge>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {analyticsInsights.map((insight) => {
            const Icon = insight.icon
            return (
              <div 
                key={insight.id} 
                className={cn(
                  "p-4 rounded-lg border",
                  insight.type === 'trend' ? "bg-blue-600/10 border-blue-600/20" :
                  insight.type === 'prediction' ? "bg-purple-600/10 border-purple-600/20" :
                  insight.type === 'correlation' ? "bg-green-600/10 border-green-600/20" :
                  insight.type === 'anomaly' ? "bg-red-600/10 border-red-600/20" :
                  "bg-orange-600/10 border-orange-600/20"
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon className={cn(
                      "h-5 w-5",
                      insight.type === 'trend' ? "text-blue-400" :
                      insight.type === 'prediction' ? "text-purple-400" :
                      insight.type === 'correlation' ? "text-green-400" :
                      insight.type === 'anomaly' ? "text-red-400" :
                      "text-orange-400"
                    )} />
                    <span className="font-medium text-neutral-200">{insight.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs",
                        insight.impact === 'high' ? "bg-red-600/20 text-red-400 border-red-600/30" :
                        insight.impact === 'medium' ? "bg-yellow-600/20 text-yellow-400 border-yellow-600/30" :
                        "bg-green-600/20 text-green-400 border-green-600/30"
                      )}
                    >
                      {insight.impact} impact
                    </Badge>
                    <Badge variant="secondary" className="bg-neutral-700/50 text-neutral-300 text-xs">
                      {insight.confidence}% confidence
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-neutral-400 mb-3">{insight.description}</p>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="text-neutral-500">Suggested Action: </span>
                    <span className="text-neutral-200">{insight.suggested_action}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-neutral-500">Business Value: </span>
                    <span className="text-neutral-200">{insight.business_value}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span>Data Points: {formatNumber(insight.data_points)}</span>
                    <span>Time Range: {insight.time_range}</span>
                  </div>
                </div>
                <div className="relative mt-3">
                  <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full transition-all duration-300",
                        insight.type === 'trend' ? "bg-blue-500" :
                        insight.type === 'prediction' ? "bg-purple-500" :
                        insight.type === 'correlation' ? "bg-green-500" :
                        insight.type === 'anomaly' ? "bg-red-500" :
                        "bg-orange-500"
                      )}
                      style={{ width: '${insight.confidence}%' }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}