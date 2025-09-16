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
  Brain,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Target,
  Zap,
  Bot,
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
  Sparkles,
  Gauge,
  FileText,
  Search,
  Lightbulb,
  FlaskConical,
  Atom,
  CircuitBoard,
  Microscope,
  Telescope,
  Beaker,
  Dna,
  Workflow,
  GitBranch,
  Merge,
  Split,
  Boxes,
  Puzzle,
  Crosshair,
  Focus,
  Scan,
  ScanLine,
  Radar as RadarIcon,
  Satellite,
  Orbit,
  Rocket,
  Zap as Lightning,
  Flame,
  Wind,
  Waves,
  Mountain,
  Compass,
  Map,
  Route,
  Navigation,
  Anchor,
  Crown,
  Diamond,
  Gem,
  TrendingUpDown,
  ArrowUpDown,
  BarChart,
  ScatterChart,
  AreaChart,
  Maximize,
  Minimize,
  Expand,
  Shrink,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  RotateCcw,
  RotateCw,
  Shuffle,
  GitMerge,
  GitPullRequest
} from 'lucide-react'

interface AIModule {
  id: string
  name: string
  category: 'nlp' | 'computer_vision' | 'predictive' | 'optimization' | 'recommendation' | 'anomaly_detection'
  status: 'active' | 'training' | 'testing' | 'deployed'
  accuracy: number
  confidence: number
  processing_speed: number
  insights_generated: number
  value_created: number
  last_trained: string
  model_type: string
  data_sources: string[]
  icon: React.ComponentType<{ className?: string }>
}

interface IntelligenceStream {
  id: string
  source: string
  type: 'insight' | 'recommendation' | 'alert' | 'opportunity' | 'optimization'
  priority: 'critical' | 'high' | 'medium' | 'low'
  title: string
  description: string
  confidence: number
  impact_score: number
  potential_value: number
  timeframe: string
  auto_actionable: boolean
  dependencies: string[]
  timestamp: string
  status: 'new' | 'reviewed' | 'acting' | 'completed'
}

interface KnowledgeGraph {
  entity: string
  relationships: { target: string; type: string; strength: number }[]
  insights_count: number
  connections: number
  influence_score: number
  category: 'customer' | 'service' | 'operational' | 'financial' | 'competitive'
}

interface AIPerformanceMetric {
  model_name: string
  predictions_today: number
  accuracy_score: number
  processing_time: number
  value_generated: number
  confidence_level: number
  training_data_size: number
  last_improvement: string
  status: 'optimal' | 'good' | 'needs_attention'
}

interface CognitiveInsight {
  id: string
  reasoning_type: 'deductive' | 'inductive' | 'abductive' | 'causal' | 'correlational'
  hypothesis: string
  evidence: string[]
  confidence: number
  implications: string[]
  recommended_actions: string[]
  potential_outcomes: { scenario: string; probability: number; impact: string }[]
  complexity_score: number
  novelty_score: number
}

const aiModules: AIModule[] = [
  {
    id: 'nlp-analyzer',
    name: 'Natural Language Processor',
    category: 'nlp',
    status: 'active',
    accuracy: 94.7,
    confidence: 91.2,
    processing_speed: 1250,
    insights_generated: 15420,
    value_created: 340000,
    last_trained: '6 hours ago',
    model_type: 'Transformer (BERT-based)',
    data_sources: ['Customer Communications', 'Service Reports', 'Review Text', 'Support Tickets'],
    icon: MessageSquare
  },
  {
    id: 'vision-recognition',
    name: 'Computer Vision System',
    category: 'computer_vision',
    status: 'active',
    accuracy: 97.3,
    confidence: 95.8,
    processing_speed: 890,
    insights_generated: 8920,
    value_created: 180000,
    last_trained: '12 hours ago',
    model_type: 'Convolutional Neural Network',
    data_sources: ['Equipment Photos', 'Job Site Images', 'Damage Assessment', 'Quality Control'],
    icon: Eye
  },
  {
    id: 'predictive-engine',
    name: 'Predictive Analytics Engine',
    category: 'predictive',
    status: 'active',
    accuracy: 89.4,
    confidence: 87.6,
    processing_speed: 2100,
    insights_generated: 22140,
    value_created: 520000,
    last_trained: '3 hours ago',
    model_type: 'Ensemble (XGBoost + LSTM)',
    data_sources: ['Historical Data', 'Weather API', 'Market Trends', 'Seasonal Patterns'],
    icon: Telescope
  },
  {
    id: 'optimization-solver',
    name: 'Route & Resource Optimizer',
    category: 'optimization',
    status: 'active',
    accuracy: 92.8,
    confidence: 94.1,
    processing_speed: 450,
    insights_generated: 5680,
    value_created: 280000,
    last_trained: '8 hours ago',
    model_type: 'Genetic Algorithm + RL',
    data_sources: ['GPS Data', 'Traffic Patterns', 'Technician Skills', 'Job Requirements'],
    icon: Route
  },
  {
    id: 'recommendation-ai',
    name: 'Intelligent Recommendation System',
    category: 'recommendation',
    status: 'active',
    accuracy: 88.9,
    confidence: 86.3,
    processing_speed: 1850,
    insights_generated: 18750,
    value_created: 420000,
    last_trained: '4 hours ago',
    model_type: 'Collaborative Filtering + Deep Learning',
    data_sources: ['Customer Behavior', 'Service History', 'Preferences', 'Market Segments'],
    icon: Lightbulb
  },
  {
    id: 'anomaly-detector',
    name: 'Anomaly Detection System',
    category: 'anomaly_detection',
    status: 'active',
    accuracy: 96.2,
    confidence: 93.7,
    processing_speed: 3200,
    insights_generated: 3420,
    value_created: 150000,
    last_trained: '2 hours ago',
    model_type: 'Isolation Forest + Autoencoders',
    data_sources: ['System Metrics', 'Performance Data', 'User Behavior', 'Financial Transactions'],
    icon: Radar
  }
]

const intelligenceStreams: IntelligenceStream[] = [
  {
    id: 'stream-001',
    source: 'Predictive Analytics Engine',
    type: 'opportunity',
    priority: 'critical',
    title: 'High-Value Service Window Identified',
    description: 'AI detected optimal 72-hour window for premium HVAC services with 40% higher conversion rates',
    confidence: 94.2,
    impact_score: 9.4,
    potential_value: 125000,
    timeframe: '72 hours',
    auto_actionable: true,
    dependencies: ['Weather forecast accuracy', 'Technician availability'],
    timestamp: '2 minutes ago',
    status: 'new'
  },
  {
    id: 'stream-002',
    source: 'NLP Analyzer',
    type: 'insight',
    priority: 'high',
    title: 'Customer Sentiment Shift Detected',
    description: 'Natural language processing reveals 23% improvement in customer sentiment related to response time',
    confidence: 87.8,
    impact_score: 8.1,
    potential_value: 85000,
    timeframe: '30 days',
    auto_actionable: false,
    dependencies: ['Customer feedback integration'],
    timestamp: '8 minutes ago',
    status: 'reviewed'
  },
  {
    id: 'stream-003',
    source: 'Optimization Solver',
    type: 'optimization',
    priority: 'high',
    title: 'Route Efficiency Breakthrough',
    description: 'AI discovered 31% efficiency gain through dynamic multi-factor route optimization',
    confidence: 91.5,
    impact_score: 8.9,
    potential_value: 180000,
    timeframe: '90 days',
    auto_actionable: true,
    dependencies: ['GPS system integration', 'Real-time traffic data'],
    timestamp: '15 minutes ago',
    status: 'acting'
  },
  {
    id: 'stream-004',
    source: 'Anomaly Detection System',
    type: 'alert',
    priority: 'medium',
    title: 'Equipment Performance Pattern',
    description: 'Unusual equipment failure pattern suggests preventive maintenance opportunity',
    confidence: 89.3,
    impact_score: 7.2,
    potential_value: 45000,
    timeframe: '45 days',
    auto_actionable: false,
    dependencies: ['Equipment sensor data', 'Maintenance scheduling'],
    timestamp: '22 minutes ago',
    status: 'new'
  },
  {
    id: 'stream-005',
    source: 'Recommendation System',
    type: 'recommendation',
    priority: 'medium',
    title: 'Cross-Sell Opportunity Matrix',
    description: 'AI identified optimal cross-selling opportunities with 67% success probability',
    confidence: 82.6,
    impact_score: 7.8,
    potential_value: 95000,
    timeframe: '60 days',
    auto_actionable: true,
    dependencies: ['Customer segmentation', 'Service catalog'],
    timestamp: '35 minutes ago',
    status: 'completed'
  }
]

const knowledgeGraph: KnowledgeGraph[] = [
  {
    entity: 'Emergency HVAC Services',
    relationships: [
      { target: 'Weather Patterns', type: 'correlates_with', strength: 0.89 },
      { target: 'Customer Satisfaction', type: 'influences', strength: 0.94 },
      { target: 'Revenue Spikes', type: 'drives', strength: 0.76 }
    ],
    insights_count: 42,
    connections: 15,
    influence_score: 8.7,
    category: 'service'
  },
  {
    entity: 'Premium Customer Segment',
    relationships: [
      { target: 'Service Quality', type: 'demands', strength: 0.92 },
      { target: 'Response Time', type: 'sensitive_to', strength: 0.85 },
      { target: 'Profit Margins', type: 'enhances', strength: 0.81 }
    ],
    insights_count: 67,
    connections: 23,
    influence_score: 9.2,
    category: 'customer'
  },
  {
    entity: 'Technician Efficiency',
    relationships: [
      { target: 'Training Programs', type: 'improved_by', strength: 0.78 },
      { target: 'Route Optimization', type: 'enhanced_by', strength: 0.86 },
      { target: 'Equipment Quality', type: 'depends_on', strength: 0.73 }
    ],
    insights_count: 38,
    connections: 18,
    influence_score: 8.4,
    category: 'operational'
  }
]

const aiPerformanceMetrics: AIPerformanceMetric[] = [
  {
    model_name: 'Revenue Predictor',
    predictions_today: 2840,
    accuracy_score: 94.2,
    processing_time: 120,
    value_generated: 85000,
    confidence_level: 91.8,
    training_data_size: 125000,
    last_improvement: '2 days ago',
    status: 'optimal'
  },
  {
    model_name: 'Customer Churn Detector',
    predictions_today: 1560,
    accuracy_score: 87.9,
    processing_time: 85,
    value_generated: 42000,
    confidence_level: 84.6,
    training_data_size: 89000,
    last_improvement: '5 days ago',
    status: 'good'
  },
  {
    model_name: 'Demand Forecaster',
    predictions_today: 3920,
    accuracy_score: 92.1,
    processing_time: 95,
    value_generated: 125000,
    confidence_level: 89.4,
    training_data_size: 156000,
    last_improvement: '1 day ago',
    status: 'optimal'
  },
  {
    model_name: 'Quality Predictor',
    predictions_today: 890,
    accuracy_score: 79.3,
    processing_time: 140,
    value_generated: 18000,
    confidence_level: 76.2,
    training_data_size: 45000,
    last_improvement: '8 days ago',
    status: 'needs_attention'
  }
]

const cognitiveInsights: CognitiveInsight[] = [
  {
    id: 'cognitive-001',
    reasoning_type: 'causal',
    hypothesis: 'Technician certification level directly impacts customer satisfaction and repeat business probability',
    evidence: [
      'Level 3 certified technicians show 23% higher customer satisfaction scores',
      'Customers served by certified technicians have 34% higher repeat rate',
      'Premium service requests increase 45% when certified technicians are available'
    ],
    confidence: 89.7,
    implications: [
      'Investment in technician certification programs yields measurable ROI',
      'Customer loyalty correlates with service expertise level',
      'Premium pricing is justified and accepted when expertise is evident'
    ],
    recommended_actions: [
      'Accelerate certification programs for all technicians',
      'Highlight technician credentials in customer communications',
      'Implement certification-based service tiers'
    ],
    potential_outcomes: [
      { scenario: 'Full certification rollout', probability: 0.85, impact: '+$340K annual revenue' },
      { scenario: 'Partial implementation', probability: 0.95, impact: '+$180K annual revenue' },
      { scenario: 'Status quo maintained', probability: 1.0, impact: 'Missed opportunity cost: $220K' }
    ],
    complexity_score: 7.8,
    novelty_score: 8.4
  },
  {
    id: 'cognitive-002',
    reasoning_type: 'inductive',
    hypothesis: 'Weather pattern analysis combined with historical demand data can predict service spikes with 72-hour accuracy',
    evidence: [
      'Temperature drops below 35°F correlate with 340% HVAC emergency calls',
      'Heat waves above 95°F trigger 280% AC service requests within 48 hours',
      'Storm systems create 180% electrical service demand 24-72 hours post-event'
    ],
    confidence: 92.3,
    implications: [
      'Proactive scheduling can dramatically improve response times',
      'Inventory pre-positioning based on weather forecasts optimizes service delivery',
      'Dynamic pricing during predicted high-demand periods maximizes revenue'
    ],
    recommended_actions: [
      'Integrate weather API with scheduling system',
      'Develop automated pre-positioning algorithms',
      'Create dynamic pricing model for weather-driven demand'
    ],
    potential_outcomes: [
      { scenario: 'Full weather integration', probability: 0.78, impact: '+$420K revenue, +18% satisfaction' },
      { scenario: 'Manual weather monitoring', probability: 0.92, impact: '+$180K revenue, +8% satisfaction' },
      { scenario: 'No weather consideration', probability: 1.0, impact: 'Current reactive approach maintained' }
    ],
    complexity_score: 8.9,
    novelty_score: 9.1
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

export default function AIIntelligencePage() {
  const [currentTimeRange, setCurrentTimeRange] = useState<TimeRange>()
  const [aiProcessingChart, setAiProcessingChart] = useState<TradingViewChartData[]>([])
  const [intelligenceChart, setIntelligenceChart] = useState<TradingViewChartData[]>([])
  const [selectedModule, setSelectedModule] = useState<string | null>(null)
  const [streamFilter, setStreamFilter] = useState<string>('all')
  const processingRef = useRef<TradingViewWrapperRef>(null)
  const intelligenceRef = useRef<TradingViewWrapperRef>(null)

  // Generate AI processing and intelligence charts
  useEffect(() => {
    const generateAIProcessingChart = () => {
      const data: TradingViewChartData[] = []
      const now = new Date()
      const startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000) // 24 hours ago
      
      const baseProcessing = 2400
      
      for (let i = 0; i < 1440; i += 10) { // Every 10 minutes for 24 hours
        const time = new Date(startTime.getTime() + i * 60 * 1000)
        
        // Simulate AI processing patterns
        const hour = time.getHours()
        const businessHours = hour >= 8 && hour <= 18 ? 1.4 : 0.7
        const learningCycles = 1 + 0.1 * Math.sin((i / 180) * Math.PI) // Learning improvement cycles
        const dataInflux = 1 + 0.2 * Math.sin((i / 360) * Math.PI * 2) // Data volume changes
        const processingBoost = Math.random() > 0.9 ? 1.5 : 1.0 // Random processing spikes
        
        const minuteProcessing = baseProcessing * businessHours * learningCycles * dataInflux * processingBoost
        
        data.push({
          time: Math.floor(time.getTime() / 1000) as any,
          value: Math.max(800, minuteProcessing),
        })
      }
      
      return data
    }

    const generateIntelligenceChart = () => {
      const data: TradingViewChartData[] = []
      const now = new Date()
      const startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      
      const baseIntelligence = 85
      
      for (let i = 0; i < 7 * 24; i += 2) { // Every 2 hours for 7 days
        const time = new Date(startTime.getTime() + i * 60 * 60 * 1000)
        
        // Simulate intelligence score improvements
        const learningProgress = 1 + (i / 5000) // Gradual learning improvement
        const dataQuality = 1 + 0.05 * Math.sin((i / 48) * Math.PI) // Daily data quality cycles
        const modelUpdates = Math.random() > 0.95 ? 1.1 : 1.0 // Occasional model improvements
        const complexityHandling = 1 + (i / 8000) // Better handling of complex scenarios
        
        const intelligenceScore = baseIntelligence * learningProgress * dataQuality * modelUpdates * complexityHandling
        
        data.push({
          time: Math.floor(time.getTime() / 1000) as any,
          value: Math.max(75, Math.min(98, intelligenceScore)),
        })
      }
      
      return data
    }

    const updateCharts = () => {
      setAiProcessingChart(generateAIProcessingChart())
      setIntelligenceChart(generateIntelligenceChart())
    }

    updateCharts()
    
    // Update charts every 45 seconds for real-time effect
    const interval = setInterval(updateCharts, 45000)
    return () => clearInterval(interval)
  }, [])

  const handleTimeRangeChange = (range: TimeRange) => {
    setCurrentTimeRange(range)
  }

  const filteredStreams = streamFilter === 'all' 
    ? intelligenceStreams 
    : intelligenceStreams.filter(stream => stream.type === streamFilter)

  return (
    <div className="h-full bg-neutral-950 text-neutral-100 p-6 space-y-6 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Brain className="h-6 w-6 text-purple-400" />
            <h1 className="text-2xl font-bold text-neutral-100">AI-Powered Business Intelligence Suite</h1>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                <Cpu className="h-3 w-3 mr-1 animate-pulse" />
                Cognitive AI
              </Badge>
              <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                <Sparkles className="h-3 w-3 mr-1" />
                Self-Learning
              </Badge>
              <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                <Zap className="h-3 w-3 mr-1" />
                Auto-Insights
              </Badge>
            </div>
          </div>
          <p className="text-neutral-400 mt-1">Unified artificial intelligence platform for autonomous business insights and cognitive analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-neutral-700">
                <Filter className="h-4 w-4 mr-2" />
                Intelligence View
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-neutral-900 border-neutral-700">
              <DropdownMenuItem className="text-neutral-300">Cognitive Overview</DropdownMenuItem>
              <DropdownMenuItem className="text-neutral-300">Learning Progress</DropdownMenuItem>
              <DropdownMenuItem className="text-neutral-300">Model Performance</DropdownMenuItem>
              <DropdownMenuItem className="text-neutral-300">Knowledge Graph</DropdownMenuItem>
              <DropdownMenuItem className="text-neutral-300">Reasoning Engine</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" className="border-neutral-700">
            <Download className="h-4 w-4 mr-2" />
            Export Intelligence
          </Button>
          <Button variant="outline" size="sm" className="border-neutral-700">
            <Maximize2 className="h-4 w-4 mr-2" />
            Full Screen
          </Button>
        </div>
      </div>

      {/* AI Module Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {aiModules.map((module) => {
          const Icon = module.icon
          return (
            <div 
              key={module.id} 
              className={cn(
                "bg-neutral-900/50 border border-neutral-800 p-4 space-y-3 cursor-pointer transition-all",
                selectedModule === module.id ? "ring-2 ring-purple-500/50 bg-purple-900/20" : "hover:bg-neutral-800/50"
              )}
              onClick={() => setSelectedModule(selectedModule === module.id ? null : module.id)}
            >
              <div className="flex items-center justify-between">
                <Icon className={cn(
                  "h-5 w-5",
                  module.category === 'nlp' ? "text-blue-400" :
                  module.category === 'computer_vision' ? "text-green-400" :
                  module.category === 'predictive' ? "text-purple-400" :
                  module.category === 'optimization' ? "text-orange-400" :
                  module.category === 'recommendation' ? "text-yellow-400" :
                  "text-red-400"
                )} />
                <div className="flex items-center gap-1">
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      "text-xs",
                      module.status === 'active' ? "bg-green-600/20 text-green-400" :
                      module.status === 'training' ? "bg-yellow-600/20 text-yellow-400" :
                      module.status === 'testing' ? "bg-blue-600/20 text-blue-400" :
                      "bg-purple-600/20 text-purple-400"
                    )}
                  >
                    {module.status}
                  </Badge>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                </div>
              </div>
              <div className="text-lg font-semibold text-neutral-100">{module.name}</div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-neutral-500">Accuracy</div>
                  <div className="font-medium text-neutral-200">{module.accuracy}%</div>
                </div>
                <div>
                  <div className="text-neutral-500">Confidence</div>
                  <div className="font-medium text-neutral-200">{module.confidence}%</div>
                </div>
                <div>
                  <div className="text-neutral-500">Speed</div>
                  <div className="font-medium text-neutral-200">{formatNumber(module.processing_speed)}/s</div>
                </div>
                <div>
                  <div className="text-neutral-500">Value</div>
                  <div className="font-medium text-green-400">{formatCurrency(module.value_created)}</div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-500">Performance</span>
                  <span className="text-green-400">{module.accuracy}%</span>
                </div>
                <div className="relative">
                  <div className="h-1 bg-neutral-800 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full transition-all duration-300",
                        module.category === 'nlp' ? "bg-blue-500" :
                        module.category === 'computer_vision' ? "bg-green-500" :
                        module.category === 'predictive' ? "bg-purple-500" :
                        module.category === 'optimization' ? "bg-orange-500" :
                        module.category === 'recommendation' ? "bg-yellow-500" :
                        "bg-red-500"
                      )}
                      style={{ width: '${module.accuracy}%' }}
                    />
                  </div>
                </div>
                <div className="text-xs text-neutral-600">
                  {formatNumber(module.insights_generated)} insights • Updated: {module.last_trained}
                </div>
              </div>
              
              {selectedModule === module.id && (
                <div className="mt-3 pt-3 border-t border-neutral-700 space-y-2">
                  <div className="text-sm">
                    <span className="text-neutral-500">Model Type: </span>
                    <span className="text-neutral-300">{module.model_type}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-neutral-500">Data Sources: </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {module.data_sources.map((source, index) => (
                        <Badge key={index} variant="secondary" className="bg-neutral-700/50 text-neutral-300 text-xs">
                          {source}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* AI Processing Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Processing Volume Chart */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-blue-400" />
              <h3 className="text-lg font-medium text-neutral-100">AI Processing Volume (24H)</h3>
              <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                Real-time Processing
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
              ref={processingRef}
              data={aiProcessingChart}
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
                <span>Live Processing</span>
              </div>
              <div className="flex items-center gap-1">
                <span>Avg: 2.4K ops/min</span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => processingRef.current?.exportToPDF()}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>

        {/* Intelligence Score Evolution */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-400" />
              <h3 className="text-lg font-medium text-neutral-100">Intelligence Score Evolution</h3>
              <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                Learning Progress
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
              ref={intelligenceRef}
              data={intelligenceChart}
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
                <span>Cognitive Growth</span>
              </div>
              <div className="flex items-center gap-1">
                <span>Current IQ: 94.7</span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => intelligenceRef.current?.exportToPDF()}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Intelligence Streams */}
      <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Workflow className="h-5 w-5 text-cyan-400" />
            <h3 className="text-lg font-medium text-neutral-100">Live Intelligence Streams</h3>
            <Badge variant="outline" className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
              {intelligenceStreams.filter(s => s.status === 'new').length} New Insights
            </Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-neutral-700">
                <Filter className="h-4 w-4 mr-2" />
                {streamFilter === 'all' ? 'All Types' : streamFilter.charAt(0).toUpperCase() + streamFilter.slice(1)}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-neutral-900 border-neutral-700">
              <DropdownMenuItem onClick={() => setStreamFilter('all')} className="text-neutral-300">All Types</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStreamFilter('insight')} className="text-neutral-300">Insights</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStreamFilter('recommendation')} className="text-neutral-300">Recommendations</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStreamFilter('opportunity')} className="text-neutral-300">Opportunities</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStreamFilter('optimization')} className="text-neutral-300">Optimizations</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStreamFilter('alert')} className="text-neutral-300">Alerts</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
          {filteredStreams.map((stream) => (
            <div 
              key={stream.id} 
              className={cn(
                "p-4 rounded-lg border",
                stream.type === 'opportunity' ? "bg-green-600/10 border-green-600/20" :
                stream.type === 'insight' ? "bg-blue-600/10 border-blue-600/20" :
                stream.type === 'recommendation' ? "bg-purple-600/10 border-purple-600/20" :
                stream.type === 'optimization' ? "bg-orange-600/10 border-orange-600/20" :
                "bg-red-600/10 border-red-600/20"
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-3 h-3 rounded-full",
                    stream.status === 'new' ? "bg-green-500 animate-pulse" :
                    stream.status === 'reviewed' ? "bg-yellow-500" :
                    stream.status === 'acting' ? "bg-blue-500 animate-pulse" :
                    "bg-gray-500"
                  )} />
                  <span className="font-medium text-neutral-200">{stream.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs",
                      stream.priority === 'critical' ? "bg-red-600/20 text-red-400 border-red-600/30" :
                      stream.priority === 'high' ? "bg-orange-600/20 text-orange-400 border-orange-600/30" :
                      stream.priority === 'medium' ? "bg-yellow-600/20 text-yellow-400 border-yellow-600/30" :
                      "bg-green-600/20 text-green-400 border-green-600/30"
                    )}
                  >
                    {stream.priority}
                  </Badge>
                  <span className="text-xs text-neutral-500">{stream.timestamp}</span>
                </div>
              </div>
              
              <p className="text-sm text-neutral-400 mb-3">{stream.description}</p>
              
              <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                <div>
                  <div className="text-neutral-500">Confidence</div>
                  <div className="font-medium text-neutral-200">{stream.confidence}%</div>
                </div>
                <div>
                  <div className="text-neutral-500">Impact</div>
                  <div className="font-medium text-neutral-200">{stream.impact_score}/10</div>
                </div>
                <div>
                  <div className="text-neutral-500">Value</div>
                  <div className="font-medium text-green-400">{formatCurrency(stream.potential_value)}</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-neutral-500 mb-3">
                <span>Source: {stream.source}</span>
                <span>Timeframe: {stream.timeframe}</span>
              </div>
              
              {stream.auto_actionable && (
                <div className="flex items-center gap-1 text-xs text-green-400 mb-2">
                  <Zap className="h-3 w-3" />
                  Auto-actionable insight
                </div>
              )}
              
              <div className="relative">
                <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full transition-all duration-300",
                      stream.type === 'opportunity' ? "bg-green-500" :
                      stream.type === 'insight' ? "bg-blue-500" :
                      stream.type === 'recommendation' ? "bg-purple-500" :
                      stream.type === 'optimization' ? "bg-orange-500" :
                      "bg-red-500"
                    )}
                    style={{ width: '${stream.confidence}%' }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Knowledge Graph & Cognitive Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Knowledge Graph */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Network className="h-5 w-5 text-green-400" />
            <h3 className="text-lg font-medium text-neutral-100">Knowledge Graph</h3>
            <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
              {knowledgeGraph.length} Entities
            </Badge>
          </div>
          <div className="space-y-4">
            {knowledgeGraph.map((entity, index) => (
              <div key={index} className="p-4 rounded-lg bg-neutral-800/30 border border-neutral-700/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-neutral-200">{entity.entity}</span>
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      "text-xs capitalize",
                      entity.category === 'customer' ? "bg-blue-600/20 text-blue-400" :
                      entity.category === 'service' ? "bg-green-600/20 text-green-400" :
                      entity.category === 'operational' ? "bg-orange-600/20 text-orange-400" :
                      entity.category === 'financial' ? "bg-purple-600/20 text-purple-400" :
                      "bg-red-600/20 text-red-400"
                    )}
                  >
                    {entity.category}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <div className="text-neutral-500">Insights</div>
                    <div className="font-medium text-neutral-200">{entity.insights_count}</div>
                  </div>
                  <div>
                    <div className="text-neutral-500">Connections</div>
                    <div className="font-medium text-neutral-200">{entity.connections}</div>
                  </div>
                  <div>
                    <div className="text-neutral-500">Influence</div>
                    <div className="font-medium text-neutral-200">{entity.influence_score}/10</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm text-neutral-500">Key Relationships:</div>
                  <div className="space-y-1">
                    {entity.relationships.slice(0, 2).map((rel, relIndex) => (
                      <div key={relIndex} className="flex items-center justify-between text-sm">
                        <span className="text-neutral-300">{rel.target}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-neutral-500">{rel.type.replace('_', ' ')}</span>
                          <div className="relative w-12 h-1 bg-neutral-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-500 transition-all duration-300"
                              style={{ width: '${rel.strength * 100}%' }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cognitive Insights */}
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Microscope className="h-5 w-5 text-purple-400" />
            <h3 className="text-lg font-medium text-neutral-100">Cognitive Reasoning</h3>
            <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
              Deep Analysis
            </Badge>
          </div>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {cognitiveInsights.map((insight) => (
              <div key={insight.id} className="p-4 rounded-lg bg-neutral-800/30 border border-neutral-700/50 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      "text-xs capitalize",
                      insight.reasoning_type === 'causal' ? "bg-red-600/20 text-red-400" :
                      insight.reasoning_type === 'inductive' ? "bg-blue-600/20 text-blue-400" :
                      insight.reasoning_type === 'deductive' ? "bg-green-600/20 text-green-400" :
                      insight.reasoning_type === 'abductive' ? "bg-yellow-600/20 text-yellow-400" :
                      "bg-purple-600/20 text-purple-400"
                    )}
                  >
                    {insight.reasoning_type} reasoning
                  </Badge>
                  <span className="text-xs text-neutral-500">Confidence: {insight.confidence}%</span>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium text-neutral-200">Hypothesis:</div>
                  <p className="text-sm text-neutral-400">{insight.hypothesis}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium text-neutral-200">Key Evidence:</div>
                  <div className="space-y-1">
                    {insight.evidence.slice(0, 2).map((evidence, index) => (
                      <div key={index} className="text-xs text-neutral-400 flex items-start gap-2">
                        <div className="w-1 h-1 bg-neutral-500 rounded-full mt-2 flex-shrink-0" />
                        {evidence}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-neutral-500">Complexity</div>
                    <div className="font-medium text-neutral-200">{insight.complexity_score}/10</div>
                  </div>
                  <div>
                    <div className="text-neutral-500">Novelty</div>
                    <div className="font-medium text-neutral-200">{insight.novelty_score}/10</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium text-neutral-200">Top Outcome:</div>
                  <div className="text-xs text-neutral-400">
                    {insight.potential_outcomes[0].scenario} - {insight.potential_outcomes[0].impact}
                    <span className="text-green-400 ml-2">({Math.round(insight.potential_outcomes[0].probability * 100)}% probability)</span>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 transition-all duration-300"
                      style={{ width: '${insight.confidence}%' }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Performance Metrics */}
      <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Gauge className="h-5 w-5 text-orange-400" />
          <h3 className="text-lg font-medium text-neutral-100">AI Model Performance Metrics</h3>
          <Badge variant="outline" className="bg-orange-500/20 text-orange-400 border-orange-500/30">
            Live Monitoring
          </Badge>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
          {aiPerformanceMetrics.map((metric, index) => (
            <div key={index} className={cn(
              "p-4 rounded-lg border",
              metric.status === 'optimal' ? "bg-green-600/10 border-green-600/20" :
              metric.status === 'good' ? "bg-blue-600/10 border-blue-600/20" :
              "bg-orange-600/10 border-orange-600/20"
            )}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-neutral-200">{metric.model_name}</span>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs",
                    metric.status === 'optimal' ? "bg-green-600/20 text-green-400 border-green-600/30" :
                    metric.status === 'good' ? "bg-blue-600/20 text-blue-400 border-blue-600/30" :
                    "bg-orange-600/20 text-orange-400 border-orange-600/30"
                  )}
                >
                  {metric.status}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div>
                  <div className="text-neutral-500">Predictions</div>
                  <div className="font-medium text-neutral-200">{formatNumber(metric.predictions_today)}</div>
                </div>
                <div>
                  <div className="text-neutral-500">Accuracy</div>
                  <div className="font-medium text-neutral-200">{metric.accuracy_score}%</div>
                </div>
                <div>
                  <div className="text-neutral-500">Speed</div>
                  <div className="font-medium text-neutral-200">{metric.processing_time}ms</div>
                </div>
                <div>
                  <div className="text-neutral-500">Value</div>
                  <div className="font-medium text-green-400">{formatCurrency(metric.value_generated)}</div>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-500">Confidence</span>
                  <span className="text-neutral-300">{metric.confidence_level}%</span>
                </div>
                <div className="relative">
                  <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full transition-all duration-300",
                        metric.status === 'optimal' ? "bg-green-500" :
                        metric.status === 'good' ? "bg-blue-500" :
                        "bg-orange-500"
                      )}
                      style={{ width: '${metric.confidence_level}%' }}
                    />
                  </div>
                </div>
                <div className="text-xs text-neutral-600">
                  {formatNumber(metric.training_data_size)} training samples • Improved: {metric.last_improvement}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}