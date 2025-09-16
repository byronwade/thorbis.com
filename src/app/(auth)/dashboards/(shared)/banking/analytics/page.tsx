'use client'

import React, { useState } from 'react'

import { Progress } from '@/components/ui'

import { 
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Zap,
  Brain,
  Target,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Percent,
  Calendar,
  Filter,
  Download,
  Settings,
  Eye,
  RefreshCw,
  Sparkles,
  Lightbulb,
  BarChart2,
  Users,
  CreditCard,
  Wallet,
  Building2,
  ShoppingCart,
  Car,
  Home,
  Coffee,
  Fuel,
  Utensils,
  Globe,
  Smartphone,
  Wifi,
  Play,
  Pause,
  MoreHorizontal
} from 'lucide-react'

// Simple Card components
const Card = ({ children, className }: { children: React.ReactNode;
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
 className?: string }) => (
  <div className={`rounded-lg border ${className}`}>
    {children}
  </div>
)

const CardContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={className}>
    {children}
  </div>
)

const CardHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 pb-0 ${className}`}>
    {children}
  </div>
)

const CardTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <h3 className={'text-lg font-semibold leading-none tracking-tight ${className}'}>
    {children}
  </h3>
)

// Simple Button component
const Button = ({ children, className, variant, onClick, disabled, ...props }: { 
  children: React.ReactNode; 
  className?: string; 
  variant?: string; 
  onClick?: () => void;
  disabled?: boolean;
  [key: string]: any;
}) => (
  <button 
    className={'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors duration-200 ${
      variant === 'outline' 
        ? 'border border-neutral-700 bg-transparent hover:bg-neutral-800 text-neutral-300' 
        : 'bg-blue-600 hover:bg-blue-700 text-white'
    } h-10 px-4 ${disabled ? 'opacity-50 cursor-not-allowed' : '`} ${className}'}
    onClick={disabled ? undefined : onClick}
    disabled={disabled}
    {...props}
  >
    {children}
  </button>
)

export default function AdvancedAnalyticsPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedTimeframe, setSelectedTimeframe] = useState('6months')
  const [selectedModel, setSelectedModel] = useState('ensemble')
  const [isRunningPrediction, setIsRunningPrediction] = useState(false)

  // Advanced Analytics Data
  const predictiveMetrics = {
    cashFlowForecast: {
      nextMonth: {
        predicted: 25400.00,
        confidence: 87,
        trend: 'up',
        variance: 2100.00
      },
      next3Months: {
        predicted: 78900.00,
        confidence: 82,
        trend: 'up',
        variance: 6200.00
      },
      next6Months: {
        predicted: 165200.00,
        confidence: 75,
        trend: 'stable',
        variance: 12800.00
      }
    },
    spendingPredictions: {
      categories: [
        { name: 'Operating Expenses', predicted: 15200, actual: 14800, variance: 400, confidence: 92 },
        { name: 'Marketing', predicted: 8500, actual: 9100, variance: -600, confidence: 85 },
        { name: 'Technology', predicted: 4200, actual: 3900, variance: 300, confidence: 90 },
        { name: 'Travel', predicted: 3800, actual: 4200, variance: -400, confidence: 78 }
      ],
      totalPredicted: 31700,
      totalActual: 32000,
      overallAccuracy: 88
    },
    riskAnalysis: {
      overallScore: 72,
      factors: [
        { name: 'Cash Flow Volatility', score: 68, impact: 'medium', trend: 'stable' },
        { name: 'Revenue Concentration', score: 81, impact: 'low', trend: 'improving' },
        { name: 'Expense Growth Rate', score: 75, impact: 'medium', trend: 'improving' },
        { name: 'Market Conditions', score: 63, impact: 'high', trend: 'declining' }
      ]
    }
  }

  // AI-Powered Insights
  const aiInsights = [
    {
      id: 1,
      type: 'opportunity',
      title: 'Optimize Recurring Subscriptions',
      description: 'Analysis shows $2,400/month in underutilized software subscriptions. Consider consolidating or canceling unused services.',
      impact: '$28,800 annual savings',
      confidence: 94,
      category: 'Cost Optimization',
      priority: 'high',
      actionable: true
    },
    {
      id: 2,
      type: 'risk',
      title: 'Cash Flow Gap Predicted',
      description: 'Model predicts a potential cash flow gap in Q2 2024 based on seasonal patterns and current burn rate.',
      impact: '$15,000 shortfall risk',
      confidence: 82,
      category: 'Cash Management',
      priority: 'high',
      actionable: true
    },
    {
      id: 3,
      type: 'trend',
      title: 'Revenue Growth Acceleration',
      description: 'Current trajectory suggests 25% YoY growth, exceeding initial 18% target by significant margin.',
      impact: '+$45,000 additional revenue',
      confidence: 89,
      category: 'Revenue Analysis',
      priority: 'medium',
      actionable: false
    },
    {
      id: 4,
      type: 'anomaly',
      title: 'Unusual Expense Pattern Detected',
      description: 'Marketing spend increased 40% in December with no corresponding revenue increase. Investigate campaign ROI.',
      impact: 'ROI investigation needed',
      confidence: 91,
      category: 'Expense Analysis',
      priority: 'medium',
      actionable: true
    }
  ]

  // Spending Pattern Analysis
  const spendingPatterns = {
    categories: [
      { 
        name: 'Software & SaaS', 
        amount: 4200, 
        trend: 'up', 
        growth: 12, 
        transactions: 23,
        avgTransaction: 182.61,
        topMerchants: ['Adobe', 'Microsoft', 'Salesforce'],
        seasonality: 'consistent',
        anomalies: 2
      },
      { 
        name: 'Marketing & Advertising', 
        amount: 8900, 
        trend: 'up', 
        growth: 35, 
        transactions: 15,
        avgTransaction: 593.33,
        topMerchants: ['Google Ads', 'Facebook', 'LinkedIn'],
        seasonality: 'high Q4',
        anomalies: 1
      },
      { 
        name: 'Office & Supplies', 
        amount: 1200, 
        trend: 'stable', 
        growth: -2, 
        transactions: 18,
        avgTransaction: 66.67,
        topMerchants: ['Amazon Business', 'Staples', 'Office Depot'],
        seasonality: 'low Q1',
        anomalies: 0
      },
      { 
        name: 'Travel & Entertainment', 
        amount: 3800, 
        trend: 'down', 
        growth: -15, 
        transactions: 12,
        avgTransaction: 316.67,
        topMerchants: ['United Airlines', 'Marriott', 'Uber'],
        seasonality: 'high Q2/Q3',
        anomalies: 3
      }
    ],
    anomalies: [
      {
        date: '2024-01-15',
        category: 'Marketing',
        merchant: 'Facebook Ads',
        amount: 5200,
        expectedRange: '1500-2500',
        deviation: 180,
        explanation: 'Holiday campaign extension'
      },
      {
        date: '2024-01-12',
        category: 'Travel',
        merchant: 'Delta Airlines',
        amount: 2400,
        expectedRange: '200-800',
        deviation: 250,
        explanation: 'Last-minute business travel'
      }
    ]
  }

  // Cash Flow Forecasting Data
  const cashFlowForecast = {
    historicalAccuracy: 87,
    models: [
      { name: 'Linear Regression', accuracy: 82, speed: 'fast' },
      { name: 'ARIMA Time Series', accuracy: 85, speed: 'medium' },
      { name: 'Random Forest', accuracy: 89, speed: 'medium' },
      { name: 'Neural Network', accuracy: 91, speed: 'slow' },
      { name: 'Ensemble Model', accuracy: 94, speed: 'medium' }
    ],
    scenarios: [
      {
        name: 'Conservative',
        probability: 70,
        cashFlow: { '1m': 23100, '3m': 72400, '6m': 156800 },
        assumptions: ['10% revenue decline', 'Cost reduction measures', 'Delayed expansion']
      },
      {
        name: 'Base Case',
        probability: 60,
        cashFlow: { '1m': 25400, '3m': 78900, '6m': 165200 },
        assumptions: ['Current trajectory', 'Planned investments', 'Market stability']
      },
      {
        name: 'Optimistic',
        probability: 40,
        cashFlow: { '1m': 28900, '3m': 89200, '6m': 186500 },
        assumptions: ['15% revenue growth', 'Successful campaigns', 'Market expansion']
      }
    ],
    weeklyForecasts: [
      { week: 'Week 1', predicted: 6200, actual: 5800, confidence: 92 },
      { week: 'Week 2', predicted: 7100, actual: 7300, confidence: 89 },
      { week: 'Week 3', predicted: 5900, actual: null, confidence: 87 },
      { week: 'Week 4', predicted: 6200, actual: null, confidence: 84 }
    ]
  }

  const runPredictiveAnalysis = () => {
    setIsRunningPrediction(true)
    setTimeout(() => {
      setIsRunningPrediction(false)
    }, 3000)
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* AI-Powered Insights Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white flex items-center">
            <Brain className="w-5 h-5 text-blue-400 mr-2" />
            AI-Powered Financial Insights
          </h3>
          <p className="text-neutral-400 mt-1">
            Advanced analytics powered by machine learning and predictive modeling
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            onClick={runPredictiveAnalysis}
            disabled={isRunningPrediction}
            className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
          >
            {isRunningPrediction ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Running Analysis...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Run Analysis
              </>
            )}
          </Button>
          <Button className="bg-[#1C8BFF] hover:bg-[#1C8BFF]/90">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Predictive Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-green-500/10">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                {predictiveMetrics.cashFlowForecast.nextMonth.confidence}% confidence
              </Badge>
            </div>
            <h4 className="text-sm font-medium text-neutral-400 mb-2">Next Month Forecast</h4>
            <p className="text-2xl font-bold text-white mb-1">
              ${predictiveMetrics.cashFlowForecast.nextMonth.predicted.toLocaleString()}
            </p>
            <div className="flex items-center text-sm">
              <ArrowUpRight className="w-4 h-4 text-green-400 mr-1" />
              <span className="text-green-400">
                +${predictiveMetrics.cashFlowForecast.nextMonth.variance.toLocaleString()} variance
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <Target className="w-6 h-6 text-blue-400" />
              </div>
              <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                {predictiveMetrics.spendingPredictions.overallAccuracy}% accurate
              </Badge>
            </div>
            <h4 className="text-sm font-medium text-neutral-400 mb-2">Spending Accuracy</h4>
            <p className="text-2xl font-bold text-white mb-1">
              ${predictiveMetrics.spendingPredictions.totalPredicted.toLocaleString()}
            </p>
            <div className="flex items-center text-sm">
              <Activity className="w-4 h-4 text-blue-400 mr-1" />
              <span className="text-blue-400">vs ${predictiveMetrics.spendingPredictions.totalActual.toLocaleString()} actual</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-orange-500/10">
                <AlertCircle className="w-6 h-6 text-orange-400" />
              </div>
              <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20">
                Risk Level: Medium
              </Badge>
            </div>
            <h4 className="text-sm font-medium text-neutral-400 mb-2">Risk Assessment</h4>
            <p className="text-2xl font-bold text-white mb-1">
              {predictiveMetrics.riskAnalysis.overallScore}/100
            </p>
            <div className="flex items-center text-sm">
              <Activity className="w-4 h-4 text-orange-400 mr-1" />
              <span className="text-orange-400">4 factors analyzed</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center">
              <Sparkles className="w-5 h-5 text-blue-400 mr-2" />
              AI-Generated Insights
            </CardTitle>
            <Button variant="outline" size="sm" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
              View All ({aiInsights.length})
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {aiInsights.slice(0, 3).map((insight) => (
              <div key={insight.id} className="p-4 bg-neutral-800 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={'p-2 rounded-lg ${
                      insight.type === 'opportunity' ? 'bg-green-500/10' :
                      insight.type === 'risk' ? 'bg-red-500/10' :
                      insight.type === 'trend' ? 'bg-blue-500/10' :
                      'bg-yellow-500/10'
              }'}>'
                      {insight.type === 'opportunity' && <Lightbulb className="w-4 h-4 text-green-400" />}
                      {insight.type === 'risk' && <AlertCircle className="w-4 h-4 text-red-400" />}
                      {insight.type === 'trend' && <TrendingUp className="w-4 h-4 text-blue-400" />}
                      {insight.type === 'anomaly' && <Eye className="w-4 h-4 text-yellow-400" />}
                    </div>
                    <div>
                      <h5 className="font-semibold text-white">{insight.title}</h5>
                      <Badge className="bg-neutral-700 text-neutral-300 text-xs mt-1">
                        {insight.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={'${
                      insight.priority === 'high' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      insight.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                      'bg-green-500/10 text-green-400 border-green-500/20'
              }'}>'
                      {insight.priority}
                    </Badge>
                    <Badge className="bg-neutral-600/20 text-neutral-300 border-neutral-600/20">
                      {insight.confidence}% confidence
                    </Badge>
                  </div>
                </div>
                <p className="text-neutral-300 text-sm mb-2">{insight.description}</p>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-white">{insight.impact}</p>
                  {insight.actionable && (
                    <Button size="sm" variant="outline" className="border-neutral-600 text-neutral-300 hover:bg-neutral-700">
                      Take Action
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Model Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <BarChart3 className="w-5 h-5 text-blue-400 mr-2" />
              Prediction Model Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cashFlowForecast.models.map((model, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
                  <div>
                    <h6 className="font-medium text-white">{model.name}</h6>
                    <p className="text-xs text-neutral-400">Speed: {model.speed}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-24">
                      <Progress value={model.accuracy} className="h-2" />
                    </div>
                    <span className="text-sm font-medium text-white w-10">{model.accuracy}%</span>
                    {model.name === 'Ensemble Model' && (
                      <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                        Active
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Activity className="w-5 h-5 text-blue-400 mr-2" />
              Risk Factor Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {predictiveMetrics.riskAnalysis.factors.map((factor, index) => (
                <div key={index} className="p-3 bg-neutral-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h6 className="font-medium text-white">{factor.name}</h6>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-white">{factor.score}/100</span>
                      {factor.trend === 'improving' && <TrendingUp className="w-4 h-4 text-green-400" />}
                      {factor.trend === 'declining' && <TrendingDown className="w-4 h-4 text-red-400" />}
                      {factor.trend === 'stable' && <Activity className="w-4 h-4 text-blue-400" />}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Progress value={factor.score} className="flex-1 h-2" />
                    <Badge className={'${
                      factor.impact === 'high' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      factor.impact === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                      'bg-green-500/10 text-green-400 border-green-500/20`
              }'}>'
                      {factor.impact}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderSpendingPatterns = () => (
    <div className="space-y-6">
      {/* Spending Categories Analysis */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center">
              <PieChart className="w-5 h-5 text-blue-400 mr-2" />
              Spending Pattern Analysis
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                <Filter className="w-4 h-4 mr-1" />
                Filter
              </Button>
              <Button variant="outline" size="sm" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                <Calendar className="w-4 h-4 mr-1" />
                6 Months
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {spendingPatterns.categories.map((category, index) => (
              <div key={index} className="p-4 bg-neutral-800 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-semibold text-white">{category.name}</h5>
                  <div className="flex items-center space-x-2">
                    <Badge className={'${
                      category.trend === 'up' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                      category.trend === 'down' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      'bg-blue-500/10 text-blue-400 border-blue-500/20'
              }'}>'
                      {category.trend === 'up' && <TrendingUp className="w-3 h-3 mr-1" />}
                      {category.trend === 'down' && <TrendingDown className="w-3 h-3 mr-1" />}
                      {category.trend === 'stable' && <Activity className="w-3 h-3 mr-1" />}
                      {Math.abs(category.growth)}%
                    </Badge>
                    {category.anomalies > 0 && (
                      <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                        {category.anomalies} anomalies
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-400">Total Spent</span>
                    <span className="font-semibold text-white">${category.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-400">Transactions</span>
                    <span className="font-medium text-white">{category.transactions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-400">Avg Transaction</span>
                    <span className="font-medium text-white">${category.avgTransaction.toFixed(2)}</span>
                  </div>
                  <div className="pt-2 border-t border-neutral-700">
                    <p className="text-xs text-neutral-400 mb-1">Top Merchants:</p>
                    <div className="flex flex-wrap gap-1">
                      {category.topMerchants.map((merchant, i) => (
                        <Badge key={i} className="bg-neutral-700 text-neutral-300 text-xs">
                          {merchant}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-xs text-neutral-400">
                    <span className="font-medium">Seasonality:</span> {category.seasonality}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Anomaly Detection */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Eye className="w-5 h-5 text-yellow-400 mr-2" />
            Spending Anomalies Detected
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {spendingPatterns.anomalies.map((anomaly, index) => (
              <div key={index} className="p-4 bg-neutral-800 rounded-lg border-l-4 border-yellow-500">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h6 className="font-semibold text-white">{anomaly.merchant}</h6>
                    <p className="text-sm text-neutral-400">{anomaly.date} • {anomaly.category}</p>
                  </div>
                  <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                    {anomaly.deviation}% deviation
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-neutral-400">Amount</p>
                    <p className="font-semibold text-white">${anomaly.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400">Expected Range</p>
                    <p className="font-medium text-neutral-300">${anomaly.expectedRange}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400">Explanation</p>
                    <p className="font-medium text-neutral-300">{anomaly.explanation}</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="border-neutral-600 text-neutral-300 hover:bg-neutral-700">
                  Investigate Transaction
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderCashFlowForecasting = () => (
    <div className="space-y-6">
      {/* Scenario Planning */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center">
              <LineChart className="w-5 h-5 text-blue-400 mr-2" />
              Cash Flow Scenario Planning
            </CardTitle>
            <div className="flex items-center space-x-2">
              <select 
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="px-3 py-1 bg-neutral-800 border border-neutral-700 rounded text-white text-sm"
              >
                <option value="ensemble">Ensemble Model</option>
                <option value="neural">Neural Network</option>
                <option value="arima">ARIMA</option>
                <option value="random_forest">Random Forest</option>
              </select>
              <Button variant="outline" size="sm" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {cashFlowForecast.scenarios.map((scenario, index) => (
              <Card key={index} className={'border ${
                scenario.name === 'Base Case' ? 'border-blue-500 bg-blue-500/5' : 'border-neutral-700 bg-neutral-800`
              }'}>'
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-semibold text-white">{scenario.name}</h5>
                    <Badge className={'${
                      scenario.name === 'Conservative' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      scenario.name === 'Base Case' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      'bg-green-500/10 text-green-400 border-green-500/20'
              }'}>'
                      {scenario.probability}% likely
                    </Badge>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-400">1 Month</span>
                      <span className="font-semibold text-white">${scenario.cashFlow['1m'].toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-400">3 Months</span>
                      <span className="font-semibold text-white">${scenario.cashFlow['3m'].toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-400">6 Months</span>
                      <span className="font-semibold text-white">${scenario.cashFlow['6m'].toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-neutral-400 mb-2">Key Assumptions:</p>
                    <ul className="text-xs text-neutral-300 space-y-1">
                      {scenario.assumptions.map((assumption, i) => (
                        <li key={i} className="flex items-start">
                          <span className="text-neutral-500 mr-1">•</span>
                          {assumption}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Forecasts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Calendar className="w-5 h-5 text-blue-400 mr-2" />
              Weekly Cash Flow Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cashFlowForecast.weeklyForecasts.map((week, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
                  <div>
                    <h6 className="font-medium text-white">{week.week}</h6>
                    <p className="text-sm text-neutral-400">{week.confidence}% confidence</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-white">${week.predicted.toLocaleString()}</p>
                    {week.actual && (
                      <p className="text-sm text-neutral-400">
                        Actual: ${week.actual.toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div>
                    {week.actual ? (
                      <Badge className={week.actual >= week.predicted ? 
                        'bg-green-500/10 text-green-400 border-green-500/20' : 
                        'bg-red-500/10 text-red-400 border-red-500/20'
                      }>
                        {week.actual >= week.predicted ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      </Badge>
                    ) : (
                      <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                        <Clock className="w-3 h-3" />
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Target className="w-5 h-5 text-blue-400 mr-2" />
              Model Accuracy Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-white mb-2">{cashFlowForecast.historicalAccuracy}%</div>
              <p className="text-neutral-400">Historical Accuracy</p>
            </div>
            
            <div className="space-y-4">
              <div className="p-3 bg-neutral-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-neutral-400">Last 30 Days</span>
                  <span className="font-medium text-white">91%</span>
                </div>
                <Progress value={91} className="h-2" />
              </div>
              
              <div className="p-3 bg-neutral-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-neutral-400">Last 90 Days</span>
                  <span className="font-medium text-white">87%</span>
                </div>
                <Progress value={87} className="h-2" />
              </div>
              
              <div className="p-3 bg-neutral-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-neutral-400">Last 12 Months</span>
                  <span className="font-medium text-white">84%</span>
                </div>
                <Progress value={84} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-4 md:p-6">
      {/* Header - Mobile Responsive */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Advanced Analytics</h1>
            <p className="text-neutral-400 text-sm md:text-base">
              AI-powered financial insights with predictive modeling and forecasting
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3">
            <Button variant="outline" className="border-neutral-700 text-white hover:bg-neutral-800 h-10 md:h-auto">
              <Filter className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Filters</span>
            </Button>
            <Button variant="outline" className="border-neutral-700 text-white hover:bg-neutral-800 h-10 md:h-auto">
              <Settings className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Settings</span>
            </Button>
            <Button className="bg-[#1C8BFF] hover:bg-[#1C8BFF]/90 text-white h-10 md:h-auto">
              <Download className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Export Analytics</span>
              <span className="sm:hidden">Export</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Tabs - Mobile Responsive */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 bg-neutral-900 border-neutral-800">
          <TabsTrigger value="overview" className="data-[state=active]:bg-[#1C8BFF] data-[state=active]:text-white text-xs md:text-sm">
            <span className="hidden sm:inline">AI Overview</span>
            <span className="sm:hidden">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="patterns" className="data-[state=active]:bg-[#1C8BFF] data-[state=active]:text-white text-xs md:text-sm">
            <span className="hidden sm:inline">Spending Patterns</span>
            <span className="sm:hidden">Patterns</span>
          </TabsTrigger>
          <TabsTrigger value="forecasting" className="data-[state=active]:bg-[#1C8BFF] data-[state=active]:text-white text-xs md:text-sm">
            <span className="hidden sm:inline">Cash Flow Forecasting</span>
            <span className="sm:hidden">Forecast</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 md:mt-6">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="patterns" className="mt-4 md:mt-6">
          {renderSpendingPatterns()}
        </TabsContent>

        <TabsContent value="forecasting" className="mt-4 md:mt-6">
          {renderCashFlowForecasting()}
        </TabsContent>
      </Tabs>
    </div>
  )
}