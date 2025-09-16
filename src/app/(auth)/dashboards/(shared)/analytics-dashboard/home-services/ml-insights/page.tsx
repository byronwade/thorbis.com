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
  Bot,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Target,
  Zap,
  Brain,
  LineChart,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  Filter,
  Download,
  Maximize2,
  Star,
  Calendar,
  Cpu,
  Radar,
  Settings,
  BarChart3,
  PieChart,
  Globe,
  Building,
  Calculator,
  Award,
  Briefcase,
  Phone,
  Mail,
  Package,
  Truck,
  Wrench,
  MapPin,
  Shield,
  Eye,
  Network,
  Database,
  Layers,
  GitBranch,
  Sparkles,
  Gauge,
  FileText,
  Search,
  Lightbulb,
  FlaskConical,
  Atom,
  CircuitBoard
} from 'lucide-react'

interface MLInsight {
  id: string
  category: 'performance' | 'customer' | 'operational' | 'financial' | 'predictive'
  title: string
  description: string
  impact_score: number
  confidence: number
  model_used: string
  data_points: number
  insight_type: 'correlation' | 'anomaly' | 'pattern' | 'recommendation'
  priority: 'critical' | 'high' | 'medium' | 'low'
  action_items: string[]
  potential_value: number
  timeframe: string
  icon: React.ComponentType<{ className?: string }>
}

interface ModelPerformance {
  id: string
  name: string
  algorithm: string
  accuracy: number
  precision: number
  recall: number
  f1_score: number
  training_data_size: number
  last_updated: string
  status: 'production' | 'testing' | 'training' | 'deprecated'
  predictions_today: number
  success_rate: number
}

interface DataInsight {
  id: string
  metric: string
  current_value: number
  predicted_value: number
  confidence_interval: { min: number; max: number }
  contributing_factors: string[]
  correlation_strength: number
  trend_direction: 'increasing' | 'decreasing' | 'stable'
  significance: number
}

interface AnomalyDetection {
  id: string
  type: 'revenue' | 'demand' | 'efficiency' | 'quality'
  description: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  detection_time: string
  confidence: number
  expected_value: number
  actual_value: number
  deviation_percentage: number
  root_cause_analysis: string[]
  recommended_actions: string[]
}

const mlInsights: MLInsight[] = [
  {
    id: 'customer-segmentation',
    category: 'customer',
    title: 'High-Value Customer Segment Identified',
    description: 'ML analysis reveals a distinct customer segment (8.4% of base) generating 34% of revenue with unique service patterns.',
    impact_score: 9.2,
    confidence: 87.4,
    model_used: 'K-Means Clustering + Random Forest',
    data_points: 45000,
    insight_type: 'pattern',
    priority: 'critical',
    action_items: [
      'Create targeted retention program for high-value segment',
      'Develop premium service tier matching their preferences',
      'Implement personalized communication strategy'
    ],
    potential_value: 285000,
    timeframe: '90 days',
    icon: Users
  },
  {
    id: 'seasonal-demand-pattern',
    category: 'predictive',
    title: 'Complex Seasonal Demand Pattern Discovered',
    description: 'Advanced time-series analysis uncovered hidden seasonal patterns beyond weather, including local event correlations.',
    impact_score: 8.7,
    confidence: 92.1,
    model_used: 'LSTM Neural Network',
    data_points: 78000,
    insight_type: 'pattern',
    priority: 'high',
    action_items: [
      'Adjust staffing models for discovered micro-seasons',
      'Optimize inventory based on hidden demand cycles',
      'Implement dynamic pricing for peak periods'
    ],
    potential_value: 195000,
    timeframe: '120 days',
    icon: Calendar
  },
  {
    id: 'efficiency-optimization',
    category: 'operational',
    title: 'Route Efficiency Breakthrough',
    description: 'ML optimization identified 31% efficiency gain through dynamic routing considering traffic, technician skills, and job complexity.',
    impact_score: 8.9,
    confidence: 89.6,
    model_used: 'Genetic Algorithm + Reinforcement Learning',
    data_points: 125000,
    insight_type: 'recommendation',
    priority: 'high',
    action_items: [
      'Deploy AI-powered route optimization system',
      'Train dispatchers on new routing logic',
      'Integrate real-time traffic and weather data'
    ],
    potential_value: 320000,
    timeframe: '60 days',
    icon: MapPin
  },
  {
    id: 'quality-predictor',
    category: 'performance',
    title: 'Service Quality Prediction Model',
    description: 'Deep learning model can predict job satisfaction scores with 91% accuracy before service completion.',
    impact_score: 8.5,
    confidence: 91.3,
    model_used: 'Deep Neural Network',
    data_points: 67000,
    insight_type: 'correlation',
    priority: 'medium',
    action_items: [
      'Implement real-time quality prediction alerts',
      'Create intervention protocols for at-risk jobs',
      'Train team leads on predictive quality indicators'
    ],
    potential_value: 140000,
    timeframe: '45 days',
    icon: Star
  },
  {
    id: 'pricing-elasticity',
    category: 'financial',
    title: 'Dynamic Pricing Opportunity',
    description: 'Price elasticity analysis reveals 12-18% revenue increase potential through intelligent dynamic pricing strategies.',
    impact_score: 9.1,
    confidence: 85.7,
    model_used: 'Bayesian Regression + Market Analysis',
    data_points: 89000,
    insight_type: 'recommendation',
    priority: 'critical',
    action_items: [
      'Implement dynamic pricing engine',
      'A/B test pricing strategies by service type',
      'Monitor competitor pricing in real-time'
    ],
    potential_value: 420000,
    timeframe: '180 days',
    icon: DollarSign
  }
]

const modelPerformance: ModelPerformance[] = [
  {
    id: 'customer-lifetime-value',
    name: 'Customer Lifetime Value Predictor',
    algorithm: 'XGBoost + Feature Engineering',
    accuracy: 89.4,
    precision: 87.2,
    recall: 91.6,
    f1_score: 89.3,
    training_data_size: 125000,
    last_updated: '6 hours ago',
    status: 'production',
    predictions_today: 1240,
    success_rate: 91.8
  },
  {
    id: 'demand-forecasting',
    name: 'Service Demand Forecaster',
    algorithm: 'LSTM + Multi-variate Analysis',
    accuracy: 92.7,
    precision: 90.1,
    recall: 94.3,
    f1_score: 92.2,
    training_data_size: 89000,
    last_updated: '2 hours ago',
    status: 'production',
    predictions_today: 3280,
    success_rate: 93.1
  },
  {
    id: 'churn-prediction',
    name: 'Customer Churn Predictor',
    algorithm: 'Random Forest + Ensemble',
    accuracy: 86.8,
    precision: 84.5,
    recall: 89.2,
    f1_score: 86.8,
    training_data_size: 67000,
    last_updated: '1 day ago',
    status: 'production',
    predictions_today: 892,
    success_rate: 87.4
  },
  {
    id: 'anomaly-detection',
    name: 'Business Anomaly Detector',
    algorithm: 'Isolation Forest + Statistical Analysis',
    accuracy: 94.2,
    precision: 92.8,
    recall: 95.6,
    f1_score: 94.2,
    training_data_size: 156000,
    last_updated: '30 minutes ago',
    status: 'production',
    predictions_today: 5680,
    success_rate: 94.7
  }
]

const dataInsights: DataInsight[] = [
  {
    id: 'weekend-premium',
    metric: 'Weekend Service Premium',
    current_value: 15.4,
    predicted_value: 22.8,
    confidence_interval: { min: 18.2, max: 27.4 },
    contributing_factors: ['Higher demand', 'Limited technician availability', 'Emergency service requirements'],
    correlation_strength: 0.84,
    trend_direction: 'increasing',
    significance: 0.92
  },
  {
    id: 'first-call-resolution',
    metric: 'First Call Resolution Rate',
    current_value: 78.6,
    predicted_value: 84.2,
    confidence_interval: { min: 81.5, max: 86.9 },
    contributing_factors: ['Technician training improvements', 'Better diagnostic tools', 'Enhanced preparation'],
    correlation_strength: 0.78,
    trend_direction: 'increasing',
    significance: 0.88
  },
  {
    id: 'customer-acquisition-cost',
    metric: 'Customer Acquisition Cost',
    current_value: 142.8,
    predicted_value: 118.6,
    confidence_interval: { min: 112.3, max: 124.9 },
    contributing_factors: ['Improved targeting', 'Word-of-mouth increase', 'Digital marketing optimization'],
    correlation_strength: 0.71,
    trend_direction: 'decreasing',
    significance: 0.85
  }
]

const anomalies: AnomalyDetection[] = [
  {
    id: 'revenue-spike-anomaly',
    type: 'revenue',
    description: 'Unusual revenue spike in North district (+47% above normal)',
    severity: 'medium',
    detection_time: '2 hours ago',
    confidence: 89.4,
    expected_value: 45600,
    actual_value: 67100,
    deviation_percentage: 47.1,
    root_cause_analysis: [
      'Large commercial client emergency service',
      'Weather-related HVAC demand surge',
      'Competitor service outage in area'
    ],
    recommended_actions: [
      'Monitor for sustained increased demand',
      'Prepare additional technician capacity',
      'Investigate commercial client opportunities'
    ]
  },
  {
    id: 'efficiency-drop',
    type: 'efficiency',
    description: 'Technician efficiency drop in Team C (-23% below average)',
    severity: 'high',
    detection_time: '4 hours ago',
    confidence: 92.1,
    expected_value: 87.4,
    actual_value: 67.3,
    deviation_percentage: -23.0,
    root_cause_analysis: [
      'Equipment malfunction affecting team',
      'Training gap in new service protocols',
      'Scheduling conflicts and travel time'
    ],
    recommended_actions: [
      'Immediate equipment inspection and replacement',
      'Provide supplemental training for team',
      'Optimize scheduling for affected technicians'
    ]
  }
]

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('en-US').format(num)
}

export default function MLInsightsPage() {
  const [currentTimeRange, setCurrentTimeRange] = useState<TimeRange>()
  const [performanceChart, setPerformanceChart] = useState<TradingViewChartData[]>([])
  const [predictionChart, setPredictionChart] = useState<TradingViewChartData[]>([])
  const performanceRef = useRef<TradingViewWrapperRef>(null)
  const predictionRef = useRef<TradingViewWrapperRef>(null)

  // Generate ML performance and prediction charts
  useEffect(() => {
    const generatePerformanceChart = () => {
      const data: TradingViewChartData[] = []
      const now = new Date()
      const startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
      
      const baseAccuracy = 84.2
      
      for (let i = 0; i < 30; i++) {
        const time = new Date(startTime.getTime() + i * 24 * 60 * 60 * 1000)
        
        // Simulate improving ML model accuracy over time
        const improvementTrend = 1 + (i / 1000) // Gradual improvement
        const trainingImpact = 1 + 0.02 * Math.sin((i / 7) * Math.PI) // Weekly training cycles
        const dataQualityImpact = 1 + (i / 2000) // Data quality improvements
        const randomVariation = 0.98 + Math.random() * 0.04 // ±2% variation
        
        const dailyAccuracy = baseAccuracy * improvementTrend * trainingImpact * dataQualityImpact * randomVariation
        
        data.push({
          time: Math.floor(time.getTime() / 1000) as any,
          value: Math.max(80, Math.min(96, dailyAccuracy)),
        })
      }
      
      return data
    }

    const generatePredictionChart = () => {
      const data: TradingViewChartData[] = []
      const now = new Date()
      const startTime = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000) // 14 days ago
      
      const basePredictions = 2400
      
      for (let i = 0; i < 28; i++) { // Include 14 days of forecast
        const time = new Date(startTime.getTime() + i * 24 * 60 * 60 * 1000)
        const isForecast = time > now
        
        if (isForecast) {
          // Forecast increasing ML usage
          const adoptionGrowth = 1 + (i / 400) // Growing adoption
          const efficiencyGains = 1.15 // 15% efficiency boost
          const weekdayFactor = [0.7, 1.0, 1.0, 1.0, 1.0, 1.0, 0.8][time.getDay()]
          const dailyPredictions = basePredictions * adoptionGrowth * efficiencyGains * weekdayFactor
          
          data.push({
            time: Math.floor(time.getTime() / 1000) as any,
            value: Math.max(2000, dailyPredictions),
          })
        } else {
          // Historical prediction volume
          const weekdayFactor = [0.7, 1.0, 1.0, 1.0, 1.0, 1.0, 0.8][time.getDay()]
          const randomVariation = 0.9 + Math.random() * 0.2
          const dailyPredictions = basePredictions * weekdayFactor * randomVariation
          
          data.push({
            time: Math.floor(time.getTime() / 1000) as any,
            value: Math.max(1800, dailyPredictions),
          })
        }
      }
      
      return data
    }

    setPerformanceChart(generatePerformanceChart())
    setPredictionChart(generatePredictionChart())
  }, [])

  const handleTimeRangeChange = (range: TimeRange) => {
    setCurrentTimeRange(range)
  }

  return (
    <div className="h-full bg-neutral-950 text-neutral-100 p-6 space-y-6 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Bot className="h-6 w-6 text-purple-400" />
            <h1 className="text-2xl font-bold text-neutral-100">Machine Learning Insights Dashboard</h1>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                <Cpu className="h-3 w-3 mr-1" />
                AI Powered
              </Badge>
              <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                <Database className="h-3 w-3 mr-1" />
                Deep Learning
              </Badge>
            </div>
          </div>
          <p className="text-neutral-400 mt-1">Advanced machine learning insights and automated business intelligence discovery</p>
        </div>
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-neutral-700">
                <Filter className="h-4 w-4 mr-2" />
                ML Categories
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-neutral-900 border-neutral-700">
              <DropdownMenuItem className="text-neutral-300">All Insights</DropdownMenuItem>
              <DropdownMenuItem className="text-neutral-300">Customer Intelligence</DropdownMenuItem>
              <DropdownMenuItem className="text-neutral-300">Operational Optimization</DropdownMenuItem>
              <DropdownMenuItem className="text-neutral-300">Financial Modeling</DropdownMenuItem>
              <DropdownMenuItem className="text-neutral-300">Predictive Analytics</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" className="border-neutral-700">
            <Download className="h-4 w-4 mr-2" />
            Export Insights
          </Button>
          <Button variant="outline" size="sm" className="border-neutral-700">
            <Maximize2 className="h-4 w-4 mr-2" />
            Full Screen
          </Button>
        </div>
      </div>

      {/* ML Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-neutral-900/50 border border-neutral-800 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Brain className="h-5 w-5 text-purple-400" />
            <Badge variant="secondary" className="bg-purple-600/20 text-purple-400 text-xs">
              Active
            </Badge>
          </div>
          <div className="text-2xl font-bold text-neutral-100">12</div>
          <div className="text-sm text-neutral-400">ML Models Deployed</div>
          <div className="text-xs text-neutral-500">98.2% Uptime</div>
        </div>

        <div className="bg-neutral-900/50 border border-neutral-800 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Activity className="h-5 w-5 text-blue-400" />
            <Badge variant="secondary" className="bg-blue-600/20 text-blue-400 text-xs">
              +24.7%
            </Badge>
          </div>
          <div className="text-2xl font-bold text-neutral-100">15.2K</div>
          <div className="text-sm text-neutral-400">Daily Predictions</div>
          <div className="text-xs text-neutral-500">91.4% Accuracy</div>
        </div>

        <div className="bg-neutral-900/50 border border-neutral-800 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Lightbulb className="h-5 w-5 text-yellow-400" />
            <Badge variant="secondary" className="bg-green-600/20 text-green-400 text-xs">
              High Impact
            </Badge>
          </div>
          <div className="text-2xl font-bold text-neutral-100">47</div>
          <div className="text-sm text-neutral-400">Active Insights</div>
          <div className="text-xs text-neutral-500">8.9 Avg Impact Score</div>
        </div>

        <div className="bg-neutral-900/50 border border-neutral-800 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <DollarSign className="h-5 w-5 text-green-400" />
            <Badge variant="secondary" className="bg-green-600/20 text-green-400 text-xs">
              ROI 340%
            </Badge>
          </div>
          <div className="text-2xl font-bold text-neutral-100">$1.4M</div>
          <div className="text-sm text-neutral-400">Value Generated YTD</div>
          <div className="text-xs text-neutral-500">$285K This Quarter</div>
        </div>
      </div>

      {/* ML Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model Performance Chart */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Gauge className="h-5 w-5 text-purple-400" />
              <h3 className="text-lg font-medium text-neutral-100">ML Model Accuracy Trends</h3>
              <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                Performance Tracking
              </Badge>
            </div>
            <TimeFrameControls
              onTimeRangeChange={handleTimeRangeChange}
              currentRange={currentTimeRange}
              enableRealTime={true}
              compact={true}
            />
          </div>
          <div className="h-80">
            <TradingViewWrapper
              ref={performanceRef}
              data={performanceChart}
              type="line"
              height="100%"
              theme="dark"
              enableRealTime={true}
              className="h-full w-full"
            />
          </div>
          <div className="flex items-center justify-between text-sm text-neutral-400">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <span>Live Model Performance</span>
              </div>
              <div className="flex items-center gap-1">
                <span>Avg Accuracy: 91.4%</span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => performanceRef.current?.exportToPDF()}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>

        {/* Prediction Volume Chart */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-400" />
              <h3 className="text-lg font-medium text-neutral-100">Daily Prediction Volume</h3>
              <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                Usage Analytics
              </Badge>
            </div>
            <TimeFrameControls
              onTimeRangeChange={handleTimeRangeChange}
              currentRange={currentTimeRange}
              enableRealTime={true}
              compact={true}
            />
          </div>
          <div className="h-80">
            <TradingViewWrapper
              ref={predictionRef}
              data={predictionChart}
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
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>Real-time Usage</span>
              </div>
              <div className="flex items-center gap-1">
                <span>Growth: +24.7%</span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => predictionRef.current?.exportToPDF()}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* ML Insights Grid */}
      <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="h-5 w-5 text-cyan-400" />
          <h3 className="text-lg font-medium text-neutral-100">AI-Generated Business Insights</h3>
          <Badge variant="outline" className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
            Actionable Intelligence
          </Badge>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {mlInsights.map((insight) => {
            const Icon = insight.icon
            return (
              <div 
                key={insight.id} 
                className={cn(
                  "p-4 rounded-lg border",
                  insight.category === 'customer' ? "bg-blue-600/10 border-blue-600/20" :
                  insight.category === 'financial' ? "bg-green-600/10 border-green-600/20" :
                  insight.category === 'operational' ? "bg-orange-600/10 border-orange-600/20" :
                  insight.category === 'performance' ? "bg-purple-600/10 border-purple-600/20" :
                  "bg-cyan-600/10 border-cyan-600/20"
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon className={cn(
                      "h-5 w-5",
                      insight.category === 'customer' ? "text-blue-400" :
                      insight.category === 'financial' ? "text-green-400" :
                      insight.category === 'operational' ? "text-orange-400" :
                      insight.category === 'performance' ? "text-purple-400" :
                      "text-cyan-400"
                    )} />
                    <span className="font-medium text-neutral-200">{insight.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs",
                        insight.priority === 'critical' ? "bg-red-600/20 text-red-400 border-red-600/30" :
                        insight.priority === 'high' ? "bg-orange-600/20 text-orange-400 border-orange-600/30" :
                        insight.priority === 'medium' ? "bg-yellow-600/20 text-yellow-400 border-yellow-600/30" :
                        "bg-green-600/20 text-green-400 border-green-600/30"
                      )}
                    >
                      {insight.priority}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-sm text-neutral-400 mb-3">{insight.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <div className="text-neutral-500">Impact Score</div>
                    <div className="font-medium text-neutral-200">{insight.impact_score}/10</div>
                  </div>
                  <div>
                    <div className="text-neutral-500">Confidence</div>
                    <div className="font-medium text-neutral-200">{insight.confidence}%</div>
                  </div>
                  <div>
                    <div className="text-neutral-500">Potential Value</div>
                    <div className="font-medium text-green-400">{formatCurrency(insight.potential_value)}</div>
                  </div>
                  <div>
                    <div className="text-neutral-500">Timeframe</div>
                    <div className="font-medium text-neutral-200">{insight.timeframe}</div>
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="text-sm text-neutral-500">Key Actions:</div>
                  <div className="space-y-1">
                    {insight.action_items.slice(0, 2).map((action, index) => (
                      <div key={index} className="text-xs text-neutral-300 flex items-center gap-2">
                        <div className="w-1 h-1 bg-neutral-500 rounded-full" />
                        {action}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <span>Model: {insight.model_used}</span>
                  <span>{formatNumber(insight.data_points)} data points</span>
                </div>

                <div className="relative mt-3">
                  <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full transition-all duration-300",
                        insight.category === 'customer' ? "bg-blue-500" :
                        insight.category === 'financial' ? "bg-green-500" :
                        insight.category === 'operational' ? "bg-orange-500" :
                        insight.category === 'performance' ? "bg-purple-500" :
                        "bg-cyan-500"
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

      {/* Model Performance & Anomaly Detection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model Performance Table */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <CircuitBoard className="h-5 w-5 text-purple-400" />
            <h3 className="text-lg font-medium text-neutral-100">Model Performance Metrics</h3>
            <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
              Production Models
            </Badge>
          </div>
          <div className="space-y-4">
            {modelPerformance.map((model) => (
              <div key={model.id} className="space-y-3 p-3 bg-neutral-800/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Atom className="h-4 w-4 text-purple-400" />
                    <span className="font-medium text-neutral-200">{model.name}</span>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs",
                      model.status === 'production' ? "bg-green-600/20 text-green-400 border-green-600/30" :
                      model.status === 'training' ? "bg-yellow-600/20 text-yellow-400 border-yellow-600/30" :
                      model.status === 'testing' ? "bg-blue-600/20 text-blue-400 border-blue-600/30" :
                      "bg-neutral-600/20 text-neutral-400 border-neutral-600/30"
                    )}
                  >
                    {model.status}
                  </Badge>
                </div>
                <div className="text-sm text-neutral-400">{model.algorithm}</div>
                <div className="grid grid-cols-4 gap-3 text-sm">
                  <div>
                    <div className="text-neutral-500">Accuracy</div>
                    <div className="font-medium text-neutral-200">{model.accuracy}%</div>
                  </div>
                  <div>
                    <div className="text-neutral-500">F1 Score</div>
                    <div className="font-medium text-neutral-200">{model.f1_score}%</div>
                  </div>
                  <div>
                    <div className="text-neutral-500">Today</div>
                    <div className="font-medium text-neutral-200">{formatNumber(model.predictions_today)}</div>
                  </div>
                  <div>
                    <div className="text-neutral-500">Success</div>
                    <div className="font-medium text-green-400">{model.success_rate}%</div>
                  </div>
                </div>
                <div className="relative">
                  <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 transition-all duration-300"
                      style={{ width: '${model.accuracy}%' }}
                    />
                  </div>
                </div>
                <div className="text-xs text-neutral-600">
                  Updated: {model.last_updated} • Training data: {formatNumber(model.training_data_size)} records
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Anomaly Detection */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-orange-400" />
            <h3 className="text-lg font-medium text-neutral-100">Anomaly Detection</h3>
            <Badge variant="outline" className="bg-orange-500/20 text-orange-400 border-orange-500/30">
              Real-time Monitoring
            </Badge>
          </div>
          <div className="space-y-4">
            {anomalies.map((anomaly) => (
              <div 
                key={anomaly.id} 
                className={cn(
                  "p-4 rounded-lg border",
                  anomaly.severity === 'critical' ? "bg-red-600/10 border-red-600/20" :
                  anomaly.severity === 'high' ? "bg-orange-600/10 border-orange-600/20" :
                  anomaly.severity === 'medium' ? "bg-yellow-600/10 border-yellow-600/20" :
                  "bg-blue-600/10 border-blue-600/20"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-neutral-200 capitalize">{anomaly.type} Anomaly</span>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs",
                        anomaly.severity === 'critical' ? "bg-red-600/20 text-red-400 border-red-600/30" :
                        anomaly.severity === 'high' ? "bg-orange-600/20 text-orange-400 border-orange-600/30" :
                        anomaly.severity === 'medium' ? "bg-yellow-600/20 text-yellow-400 border-yellow-600/30" :
                        "bg-blue-600/20 text-blue-400 border-blue-600/30"
                      )}
                    >
                      {anomaly.severity}
                    </Badge>
                    <span className="text-xs text-neutral-500">{anomaly.detection_time}</span>
                  </div>
                </div>
                <p className="text-sm text-neutral-400 mb-3">{anomaly.description}</p>
                <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                  <div>
                    <div className="text-neutral-500">Expected</div>
                    <div className="font-medium text-neutral-200">{formatNumber(anomaly.expected_value)}</div>
                  </div>
                  <div>
                    <div className="text-neutral-500">Actual</div>
                    <div className={cn(
                      "font-medium",
                      anomaly.deviation_percentage > 0 ? "text-green-400" : "text-red-400"
                    )}>
                      {formatNumber(anomaly.actual_value)}
                    </div>
                  </div>
                  <div>
                    <div className="text-neutral-500">Deviation</div>
                    <div className={cn(
                      "font-medium",
                      anomaly.deviation_percentage > 0 ? "text-green-400" : "text-red-400"
                    )}>
                      {anomaly.deviation_percentage > 0 ? '+' : '}{anomaly.deviation_percentage}%
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-neutral-500">Root Causes:</div>
                  <div className="flex flex-wrap gap-1">
                    {anomaly.root_cause_analysis.map((cause, index) => (
                      <Badge key={index} variant="secondary" className="bg-neutral-700/50 text-neutral-300 text-xs">
                        {cause}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="relative mt-3">
                  <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full transition-all duration-300",
                        anomaly.severity === 'critical' ? "bg-red-500" :
                        anomaly.severity === 'high' ? "bg-orange-500" :
                        anomaly.severity === 'medium' ? "bg-yellow-500" :
                        "bg-blue-500"
                      )}
                      style={{ width: '${anomaly.confidence}%' }}
                    />
                  </div>
                </div>
                <div className="text-xs text-neutral-600 mt-2">
                  Confidence: {anomaly.confidence}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}