'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  Brain,
  TrendingUp,
  Users,
  Target,
  Shield,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  BarChart3,
  Lightbulb,
  Settings,
  RefreshCw
} from 'lucide-react'

interface BusinessIntelligence {
  organization_id: string;
  analysis_timestamp: string;
  intelligence_summary: {
    overall_business_health_score: number;
    key_insights_count: number;
    critical_alerts: number;
    opportunities_identified: number;
    risk_level: string;
    confidence_level: number;
  };
  predictive_analytics: any;
  machine_learning_insights: any;
  industry_benchmarking: any;
  data_quality_assessment: any;
}

export default function BusinessAIDashboard() {
  const [intelligenceData, setIntelligenceData] = useState<BusinessIntelligence | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchBusinessIntelligence()
  }, [])

  const fetchBusinessIntelligence = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/v1/intelligence/business-ai?organization_id=org_example&analysis_type=comprehensive')
      
      if (!response.ok) {
        throw new Error('Failed to fetch business intelligence')
      }
      
      const result = await response.json()
      setIntelligenceData(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
              <span>Analyzing business intelligence...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Alert className="border-red-500 bg-red-950/50">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertTitle className="text-red-500">Error Loading Intelligence</AlertTitle>
            <AlertDescription className="text-neutral-300">{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  if (!intelligenceData) return null

  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low': return 'text-green-500'
      case 'medium': return 'text-yellow-500'
      case 'high': return 'text-red-500'
      default: return 'text-neutral-500'
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">AI Business Intelligence</h1>
            <p className="text-neutral-400 mt-2">Advanced predictive analytics and strategic insights</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="border-blue-500 text-blue-400">
              <Brain className="h-3 w-3 mr-1" />
              AI-Powered
            </Badge>
            <Button onClick={fetchBusinessIntelligence} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Analysis
            </Button>
          </div>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-neutral-900 border-neutral-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-400">Business Health Score</p>
                  <p className="text-2xl font-bold text-white">
                    {intelligenceData.intelligence_summary.overall_business_health_score.toFixed(1)}
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
              </div>
              <Progress 
                value={intelligenceData.intelligence_summary.overall_business_health_score} 
                className="mt-3 h-2" 
              />
            </CardContent>
          </Card>

          <Card className="bg-neutral-900 border-neutral-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-400">Key Insights</p>
                  <p className="text-2xl font-bold text-white">
                    {intelligenceData.intelligence_summary.key_insights_count}
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Lightbulb className="h-6 w-6 text-blue-500" />
                </div>
              </div>
              <p className="text-xs text-neutral-500 mt-2">Actionable recommendations</p>
            </CardContent>
          </Card>

          <Card className="bg-neutral-900 border-neutral-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-400">Critical Alerts</p>
                  <p className="text-2xl font-bold text-white">
                    {intelligenceData.intelligence_summary.critical_alerts}
                  </p>
                </div>
                <div className="h-12 w-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                </div>
              </div>
              <p className="text-xs text-neutral-500 mt-2">Requires immediate attention</p>
            </CardContent>
          </Card>

          <Card className="bg-neutral-900 border-neutral-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-400">Opportunities</p>
                  <p className="text-2xl font-bold text-white">
                    {intelligenceData.intelligence_summary.opportunities_identified}
                  </p>
                </div>
                <div className="h-12 w-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <Target className="h-6 w-6 text-emerald-500" />
                </div>
              </div>
              <p className="text-xs text-neutral-500 mt-2">Growth opportunities identified</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-neutral-900 border-neutral-700 p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-neutral-800">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="predictions" className="data-[state=active]:bg-neutral-800">
              <TrendingUp className="h-4 w-4 mr-2" />
              Predictions
            </TabsTrigger>
            <TabsTrigger value="customers" className="data-[state=active]:bg-neutral-800">
              <Users className="h-4 w-4 mr-2" />
              Customer Intelligence
            </TabsTrigger>
            <TabsTrigger value="market" className="data-[state=active]:bg-neutral-800">
              <Target className="h-4 w-4 mr-2" />
              Market Analysis
            </TabsTrigger>
            <TabsTrigger value="operations" className="data-[state=active]:bg-neutral-800">
              <Settings className="h-4 w-4 mr-2" />
              Operations
            </TabsTrigger>
            <TabsTrigger value="strategy" className="data-[state=active]:bg-neutral-800">
              <Zap className="h-4 w-4 mr-2" />
              Strategy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Risk Assessment */}
              <Card className="bg-neutral-900 border-neutral-700">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Shield className="h-5 w-5 mr-2" />
                    Risk Assessment
                  </CardTitle>
                  <CardDescription>Overall business risk evaluation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-400">Risk Level</span>
                      <Badge 
                        variant="outline" 
                        className={'${getRiskColor(intelligenceData.intelligence_summary.risk_level)} border-current'}
                      >
                        {intelligenceData.intelligence_summary.risk_level.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-400">Confidence</span>
                      <span className="text-sm text-white">
                        {intelligenceData.intelligence_summary.confidence_level.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={intelligenceData.intelligence_summary.confidence_level} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Data Quality */}
              <Card className="bg-neutral-900 border-neutral-700">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Data Quality Assessment
                  </CardTitle>
                  <CardDescription>AI model data quality metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-400">Overall Score</span>
                      <span className="text-sm font-medium text-white">
                        {intelligenceData.data_quality_assessment.overall_score.toFixed(1)}%
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs text-neutral-500">Completeness</span>
                        <span className="text-xs text-white">
                          {intelligenceData.data_quality_assessment.data_completeness.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={intelligenceData.data_quality_assessment.data_completeness} className="h-1" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs text-neutral-500">Accuracy</span>
                        <span className="text-xs text-white">
                          {intelligenceData.data_quality_assessment.data_accuracy.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={intelligenceData.data_quality_assessment.data_accuracy} className="h-1" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs text-neutral-500">Freshness</span>
                        <span className="text-xs text-white">
                          {intelligenceData.data_quality_assessment.data_freshness.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={intelligenceData.data_quality_assessment.data_freshness} className="h-1" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Strategic Recommendations */}
            <Card className="bg-neutral-900 border-neutral-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Lightbulb className="h-5 w-5 mr-2" />
                  AI-Generated Strategic Recommendations
                </CardTitle>
                <CardDescription>Top strategic initiatives based on predictive analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {intelligenceData.predictive_analytics.strategic_recommendations.map((rec: unknown, index: number) => (
                    <div key={index} className="border border-neutral-700 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-white">{rec.title}</h4>
                          <Badge 
                            variant="outline" 
                            className={'mt-1 text-xs ${
                              rec.priority === 'high' ? 'border-red-500 text-red-400' : 
                              rec.priority === 'medium' ? 'border-yellow-500 text-yellow-400' : 
                              'border-green-500 text-green-400'
                            }'}
                          >
                            {rec.priority.toUpperCase()} PRIORITY
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-white">ROI: {rec.implementation.expected_roi_percent.toFixed(1)}%</p>
                          <p className="text-xs text-neutral-400">Success: {rec.implementation.success_probability.toFixed(1)}%</p>
                        </div>
                      </div>
                      <p className="text-sm text-neutral-300 mb-3">{rec.description}</p>
                      <div className="flex items-center justify-between text-xs text-neutral-400">
                        <span>Investment: ${(rec.implementation.investment_required_usd / 1000).toFixed(0)}K</span>
                        <span>Timeline: {rec.implementation.timeline_months} months</span>
                        <span>Revenue Impact: ${(rec.expected_outcomes.revenue_increase_usd / 1000).toFixed(0)}K</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="predictions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Forecasting */}
              <Card className="bg-neutral-900 border-neutral-700">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Revenue Forecasting
                  </CardTitle>
                  <CardDescription>AI-powered revenue predictions with confidence intervals</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-white mb-2">Next 30 Days</h4>
                      <div className="bg-neutral-800 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-2xl font-bold text-white">
                            ${(intelligenceData.predictive_analytics.revenue_forecasting.predictions.next_30_days.predicted_revenue_usd / 1000000).toFixed(2)}M
                          </span>
                          <Badge variant="outline" className="border-green-500 text-green-400">
                            {intelligenceData.predictive_analytics.revenue_forecasting.predictions.next_30_days.confidence_score.toFixed(1)}% Confidence
                          </Badge>
                        </div>
                        <div className="text-xs text-neutral-400">
                          Range: ${(intelligenceData.predictive_analytics.revenue_forecasting.predictions.next_30_days.confidence_interval.lower / 1000000).toFixed(2)}M - ${(intelligenceData.predictive_analytics.revenue_forecasting.predictions.next_30_days.confidence_interval.upper / 1000000).toFixed(2)}M
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-white mb-2">Key Revenue Drivers</h4>
                      <div className="space-y-2">
                        {intelligenceData.predictive_analytics.revenue_forecasting.predictions.next_30_days.key_drivers.map((driver: unknown, index: number) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm text-neutral-300">{driver.factor.replace('_', ' ')}</span>
                            <div className="flex items-center space-x-2">
                              <Progress value={driver.impact_percent} className="w-16 h-2" />
                              <span className="text-xs text-white w-8">{driver.impact_percent.toFixed(0)}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-white mb-2">Model Performance</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-neutral-400">Accuracy</span>
                          <p className="text-white font-medium">
                            {intelligenceData.predictive_analytics.revenue_forecasting.model_performance.accuracy_last_30_days.toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <span className="text-neutral-400">Error Rate</span>
                          <p className="text-white font-medium">
                            {intelligenceData.predictive_analytics.revenue_forecasting.model_performance.mean_absolute_error_percent.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ML Model Performance */}
              <Card className="bg-neutral-900 border-neutral-700">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Brain className="h-5 w-5 mr-2" />
                    ML Model Performance
                  </CardTitle>
                  <CardDescription>Ensemble model analytics and feature importance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-white mb-3">Model Ensemble</h4>
                      <div className="space-y-3">
                        {intelligenceData.machine_learning_insights.model_ensemble_performance.primary_models.map((model: unknown, index: number) => (
                          <div key={index} className="bg-neutral-800 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-white">{model.model_type.replace('_', ' ')}</span>
                              <span className="text-sm text-green-400">{model.accuracy_score.toFixed(1)}%</span>
                            </div>
                            {model.feature_importance_top_5 && (
                              <div className="space-y-1">
                                {model.feature_importance_top_5.slice(0, 3).map((feature: unknown, fidx: number) => (
                                  <div key={fidx} className="flex items-center justify-between text-xs">
                                    <span className="text-neutral-400">{feature.feature.replace('_', ' ')}</span>
                                    <span className="text-neutral-300">{(feature.importance * 100).toFixed(0)}%</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-white mb-2">Automated Insights</h4>
                      <div className="space-y-2">
                        {intelligenceData.machine_learning_insights.automated_insights.slice(0, 2).map((insight: unknown, index: number) => (
                          <Alert key={index} className="border-blue-500/50 bg-blue-950/20">
                            <Lightbulb className="h-4 w-4 text-blue-500" />
                            <AlertDescription className="text-sm text-neutral-300">
                              {insight.description}
                              <div className="mt-1">
                                <Badge variant="outline" className="border-blue-500 text-blue-400 text-xs">
                                  {insight.confidence.toFixed(0)}% Confidence
                                </Badge>
                              </div>
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="customers" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Churn Prediction */}
              <Card className="bg-neutral-900 border-neutral-700">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Users className="h-5 w-5 mr-2" />
                    Churn Prediction Analysis
                  </CardTitle>
                  <CardDescription>AI-powered customer retention insights</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-white mb-3">Risk Distribution</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-neutral-400">Low Risk</span>
                          <div className="flex items-center space-x-2">
                            <Progress 
                              value={intelligenceData.predictive_analytics.customer_behavior_analysis.churn_prediction.churn_probability_distribution.low_risk.percentage} 
                              className="w-24 h-2" 
                            />
                            <span className="text-sm text-white w-12">
                              {intelligenceData.predictive_analytics.customer_behavior_analysis.churn_prediction.churn_probability_distribution.low_risk.count.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-neutral-400">Medium Risk</span>
                          <div className="flex items-center space-x-2">
                            <Progress 
                              value={intelligenceData.predictive_analytics.customer_behavior_analysis.churn_prediction.churn_probability_distribution.medium_risk.percentage * 5} 
                              className="w-24 h-2" 
                            />
                            <span className="text-sm text-white w-12">
                              {intelligenceData.predictive_analytics.customer_behavior_analysis.churn_prediction.churn_probability_distribution.medium_risk.count.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-neutral-400">High Risk</span>
                          <div className="flex items-center space-x-2">
                            <Progress 
                              value={intelligenceData.predictive_analytics.customer_behavior_analysis.churn_prediction.churn_probability_distribution.high_risk.percentage * 20} 
                              className="w-24 h-2" 
                            />
                            <span className="text-sm text-white w-12">
                              {intelligenceData.predictive_analytics.customer_behavior_analysis.churn_prediction.churn_probability_distribution.high_risk.count.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-white mb-3">Retention Strategies</h4>
                      <div className="space-y-3">
                        {intelligenceData.predictive_analytics.customer_behavior_analysis.churn_prediction.churn_prevention_recommendations.map((rec: unknown, index: number) => (
                          <div key={index} className="bg-neutral-800 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-white">{rec.recommended_action.replace('_', ' ')}</span>
                              <span className="text-sm text-green-400">{rec.expected_retention_rate.toFixed(1)}%</span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-neutral-400">
                              <span>{rec.customers_affected} customers</span>
                              <span>Revenue: ${(rec.estimated_revenue_saved / 1000).toFixed(0)}K</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Lifetime Value */}
              <Card className="bg-neutral-900 border-neutral-700">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Customer Lifetime Value
                  </CardTitle>
                  <CardDescription>CLV predictions and high-value segments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-white mb-3">CLV Trajectory</h4>
                      <div className="bg-neutral-800 rounded-lg p-4">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-sm text-neutral-400">Current</p>
                            <p className="text-xl font-bold text-white">
                              ${intelligenceData.predictive_analytics.customer_behavior_analysis.lifetime_value_prediction.average_clv_prediction.current_average.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-neutral-400">6 Months</p>
                            <p className="text-xl font-bold text-green-400">
                              ${intelligenceData.predictive_analytics.customer_behavior_analysis.lifetime_value_prediction.average_clv_prediction.predicted_6_months.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-neutral-400">12 Months</p>
                            <p className="text-xl font-bold text-blue-400">
                              ${intelligenceData.predictive_analytics.customer_behavior_analysis.lifetime_value_prediction.average_clv_prediction.predicted_12_months.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-white mb-3">High-Value Segments</h4>
                      <div className="space-y-3">
                        {intelligenceData.predictive_analytics.customer_behavior_analysis.lifetime_value_prediction.high_value_segments.map((segment: unknown, index: number) => (
                          <div key={index} className="bg-neutral-800 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-white">{segment.segment.replace('_', ' ')}</span>
                              <Badge 
                                variant="outline" 
                                className={'text-xs ${
                                  segment.investment_priority === 'very_high' ? 'border-red-500 text-red-400' :
                                  segment.investment_priority === 'high' ? 'border-orange-500 text-orange-400' :
                                  'border-yellow-500 text-yellow-400'
                                }'}
                              >
                                {segment.investment_priority.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-xs text-neutral-400">
                              <span>CLV: ${segment.average_clv.toLocaleString()}</span>
                              <span>Growth: {segment.growth_potential.toFixed(1)}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="market" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Demand Forecasting */}
              <Card className="bg-neutral-900 border-neutral-700">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Demand Forecasting
                  </CardTitle>
                  <CardDescription>AI-powered demand predictions and capacity planning</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-white mb-3">Next Quarter Prediction</h4>
                      <div className="bg-neutral-800 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-2xl font-bold text-white">
                            {intelligenceData.predictive_analytics.market_intelligence.demand_forecasting.next_quarter_demand.predicted_units.toLocaleString()} units
                          </span>
                          <Badge variant="outline" className="border-blue-500 text-blue-400">
                            {intelligenceData.predictive_analytics.market_intelligence.demand_forecasting.next_quarter_demand.confidence_score.toFixed(1)}% Confidence
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                          <div>
                            <span className="text-neutral-400">Current Utilization</span>
                            <p className="text-white font-medium">
                              {intelligenceData.predictive_analytics.market_intelligence.demand_forecasting.capacity_recommendations.current_utilization.toFixed(1)}%
                            </p>
                          </div>
                          <div>
                            <span className="text-neutral-400">Optimal Utilization</span>
                            <p className="text-white font-medium">
                              {intelligenceData.predictive_analytics.market_intelligence.demand_forecasting.capacity_recommendations.optimal_utilization.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-white mb-3">Demand Drivers</h4>
                      <div className="space-y-2">
                        {intelligenceData.predictive_analytics.market_intelligence.demand_forecasting.next_quarter_demand.demand_drivers.map((driver: unknown, index: number) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm text-neutral-300">{driver.driver.replace('_', ' `)}</span>
                            <div className="flex items-center space-x-2">
                              <div className={'w-16 h-2 bg-neutral-800 rounded-full overflow-hidden'}>
                                <div 
                                  className={'h-full ${driver.impact_correlation > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                                  style={{ width: '${Math.abs(driver.impact_correlation) * 100}%' }}
                                />
                              </div>
                              <span className={'text-xs w-12 ${driver.impact_correlation > 0 ? 'text-green-400' : 'text-red-400'}'}>
                                {driver.impact_correlation > 0 ? '+' : '}{(driver.impact_correlation * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Competitive Analysis */}
              <Card className="bg-neutral-900 border-neutral-700">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Target className="h-5 w-5 mr-2" />
                    Competitive Intelligence
                  </CardTitle>
                  <CardDescription>Market position and competitor analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-white mb-3">Market Position</h4>
                      <div className="bg-neutral-800 rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <span className="text-neutral-400 text-sm">Current Position</span>
                            <p className="text-xl font-bold text-white">
                              #{intelligenceData.predictive_analytics.market_intelligence.competitive_positioning.market_share_analysis.current_position}
                            </p>
                          </div>
                          <div>
                            <span className="text-neutral-400 text-sm">Market Share</span>
                            <p className="text-xl font-bold text-blue-400">
                              {intelligenceData.predictive_analytics.market_intelligence.competitive_positioning.market_share_analysis.market_share_percent.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                        <div className="text-sm">
                          <span className="text-neutral-400">6-Month Projection: </span>
                          <span className="text-green-400 font-medium">
                            {intelligenceData.predictive_analytics.market_intelligence.competitive_positioning.market_share_analysis.predicted_6_months.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-white mb-3">Key Differentiators</h4>
                      <div className="space-y-2">
                        {intelligenceData.predictive_analytics.market_intelligence.competitive_positioning.market_share_analysis.key_differentiators.map((diff: unknown, index: number) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm text-neutral-300">{diff.factor.replace('_', ' ')}</span>
                            <div className="flex items-center space-x-2">
                              <Progress value={diff.strength_score} className="w-16 h-2" />
                              <span className="text-xs text-white w-8">{diff.strength_score}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-white mb-3">Industry Benchmarks</h4>
                      <div className="space-y-2 text-sm">
                        {Object.entries(intelligenceData.industry_benchmarking.performance_comparison).map(([key, value]: [string, any]) => (
                          <div key={key} className="flex items-center justify-between">
                            <span className="text-neutral-400">{key.replace('_', ' ')}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-white">{value.your_performance.toFixed(1)}</span>
                              <span className="text-neutral-500">vs</span>
                              <span className="text-neutral-400">{value.industry_average.toFixed(1)}</span>
                              <Badge 
                                variant="outline" 
                                className={'text-xs ${
                                  value.percentile >= 75 ? 'border-green-500 text-green-400' :
                                  value.percentile >= 50 ? 'border-yellow-500 text-yellow-400' :
                                  'border-red-500 text-red-400'
                                }'}
                              >
                                {value.percentile}th
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="operations" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Resource Optimization */}
              <Card className="bg-neutral-900 border-neutral-700">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Settings className="h-5 w-5 mr-2" />
                    Resource Optimization
                  </CardTitle>
                  <CardDescription>AI-powered operational efficiency insights</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-white mb-3">Staff Efficiency</h4>
                      <div className="bg-neutral-800 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-neutral-400">Current Efficiency Score</span>
                          <span className="text-lg font-bold text-white">
                            {intelligenceData.predictive_analytics.operational_intelligence.resource_optimization.staff_optimization.current_efficiency_score.toFixed(1)}%
                          </span>
                        </div>
                        <Progress 
                          value={intelligenceData.predictive_analytics.operational_intelligence.resource_optimization.staff_optimization.current_efficiency_score} 
                          className="mb-3 h-2" 
                        />
                        <div className="text-sm">
                          <span className="text-neutral-400">Improvement Potential: </span>
                          <span className="text-green-400 font-medium">
                            {intelligenceData.predictive_analytics.operational_intelligence.resource_optimization.staff_optimization.optimal_staffing_model.productivity_improvement_potential.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-white mb-3">Skills Gap Analysis</h4>
                      <div className="space-y-3">
                        {intelligenceData.predictive_analytics.operational_intelligence.resource_optimization.staff_optimization.optimal_staffing_model.skills_gap_analysis.map((skill: unknown, index: number) => (
                          <div key={index} className="bg-neutral-800 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-white">{skill.skill.replace('_', ' ')}</span>
                              <span className="text-sm text-neutral-400">
                                {skill.current_level.toFixed(1)}/{skill.required_level.toFixed(1)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-neutral-400">
                              <span>Training Investment</span>
                              <span>${(skill.training_investment_needed / 1000).toFixed(0)}K</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Risk Assessment */}
              <Card className="bg-neutral-900 border-neutral-700">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Shield className="h-5 w-5 mr-2" />
                    Operational Risk Analysis
                  </CardTitle>
                  <CardDescription>AI-identified risks and mitigation strategies</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-white mb-3">Top Operational Risks</h4>
                      <div className="space-y-3">
                        {intelligenceData.predictive_analytics.operational_intelligence.risk_assessment.operational_risks.map((risk: unknown, index: number) => (
                          <div key={index} className="border border-neutral-700 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-white">{risk.risk_type.replace('_', ' ')}</span>
                              <div className="flex items-center space-x-2">
                                <Badge 
                                  variant="outline" 
                                  className={'text-xs ${
                                    risk.risk_score >= 70 ? 'border-red-500 text-red-400' :
                                    risk.risk_score >= 40 ? 'border-yellow-500 text-yellow-400' :
                                    'border-green-500 text-green-400'
                                  }'}
                                >
                                  {risk.risk_score.toFixed(0)} Risk Score
                                </Badge>
                              </div>
                            </div>
                            <div className="text-xs text-neutral-400 mb-2">
                              Probability: {risk.probability.toFixed(1)}% | Impact: ${(risk.potential_impact_usd / 1000).toFixed(0)}K
                            </div>
                            <div>
                              <span className="text-xs text-neutral-500">Top Mitigation:</span>
                              <p className="text-xs text-neutral-300">{risk.mitigation_strategies[0]}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-white mb-3">Financial Risk Overview</h4>
                      <div className="bg-neutral-800 rounded-lg p-4">
                        {intelligenceData.predictive_analytics.operational_intelligence.risk_assessment.financial_risks.map((risk: unknown, index: number) => (
                          <div key={index}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-white">{risk.risk_type.replace('_', ' ')}</span>
                              <Badge 
                                variant="outline" 
                                className={'text-xs ${
                                  risk.current_level === 'high' ? 'border-red-500 text-red-400' :
                                  risk.current_level === 'medium' ? 'border-yellow-500 text-yellow-400' :
                                  'border-green-500 text-green-400'
                                }'}
                              >
                                {risk.current_level.toUpperCase()}
                              </Badge>
                            </div>
                            <div className="text-xs text-neutral-400">
                              Stress Probability: {risk.probability_of_stress.toFixed(1)}% | 
                              Recommended Reserve: ${(risk.recommended_cash_reserve / 1000000).toFixed(2)}M
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="strategy" className="space-y-6">
            {/* Strategic Recommendations Detail */}
            <Card className="bg-neutral-900 border-neutral-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Zap className="h-5 w-5 mr-2" />
                  AI-Generated Strategic Roadmap
                </CardTitle>
                <CardDescription>Comprehensive strategic recommendations with implementation details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {intelligenceData.predictive_analytics.strategic_recommendations.map((rec: unknown, index: number) => (
                    <div key={index} className="border border-neutral-700 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-white">{rec.title}</h3>
                            <Badge 
                              variant="outline" 
                              className={'${
                                rec.priority === 'high' ? 'border-red-500 text-red-400' : 
                                rec.priority === 'medium' ? 'border-yellow-500 text-yellow-400' : 
                                'border-green-500 text-green-400'
                              }'}
                            >
                              {rec.priority.toUpperCase()} PRIORITY
                            </Badge>
                          </div>
                          <p className="text-neutral-300 mb-4">{rec.description}</p>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-2xl font-bold text-green-400">
                            {rec.implementation.expected_roi_percent.toFixed(1)}%
                          </div>
                          <div className="text-sm text-neutral-400">Expected ROI</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-neutral-800 rounded-lg p-3">
                          <div className="text-sm text-neutral-400">Investment Required</div>
                          <div className="text-lg font-semibold text-white">
                            ${(rec.implementation.investment_required_usd / 1000).toFixed(0)}K
                          </div>
                        </div>
                        <div className="bg-neutral-800 rounded-lg p-3">
                          <div className="text-sm text-neutral-400">Timeline</div>
                          <div className="text-lg font-semibold text-white">
                            {rec.implementation.timeline_months} months
                          </div>
                        </div>
                        <div className="bg-neutral-800 rounded-lg p-3">
                          <div className="text-sm text-neutral-400">Success Probability</div>
                          <div className="text-lg font-semibold text-white">
                            {rec.implementation.success_probability.toFixed(1)}%
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-white mb-2">Key Actions</h4>
                          <ul className="space-y-1 text-sm text-neutral-300">
                            {rec.key_actions.map((action: string, actionIndex: number) => (
                              <li key={actionIndex} className="flex items-start">
                                <span className="text-blue-500 mr-2">•</span>
                                {action}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-white mb-2">Expected Outcomes</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-neutral-400">Revenue Increase</span>
                              <span className="text-white">${(rec.expected_outcomes.revenue_increase_usd / 1000).toFixed(0)}K</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neutral-400">Customer Satisfaction</span>
                              <span className="text-green-400">+{rec.expected_outcomes.customer_satisfaction_improvement.toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neutral-400">Market Position</span>
                              <span className="text-blue-400">+{rec.expected_outcomes.market_position_improvement.toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Predictive Alerts */}
            <Card className="bg-neutral-900 border-neutral-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Predictive Alerts & Opportunities
                </CardTitle>
                <CardDescription>Time-sensitive insights requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {intelligenceData.machine_learning_insights.predictive_alerts.map((alert: unknown, index: number) => (
                    <Alert 
                      key={index} 
                      className={'${
                        alert.priority === 'high' ? 'border-red-500 bg-red-950/20' :
                        alert.priority === 'medium' ? 'border-yellow-500 bg-yellow-950/20' :
                        'border-blue-500 bg-blue-950/20'
                      }'}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <AlertTitle className="flex items-center space-x-2">
                            {alert.alert_type === 'revenue_opportunity' ? 
                              <DollarSign className="h-4 w-4" /> : 
                              <AlertTriangle className="h-4 w-4" />
                            }
                            <span>{alert.alert_type.replace('_', ' ').toUpperCase()}</span>
                            <Badge 
                              variant="outline" 
                              className={'text-xs ${
                                alert.priority === 'high' ? 'border-red-500 text-red-400' :
                                alert.priority === 'medium' ? 'border-yellow-500 text-yellow-400' :
                                'border-blue-500 text-blue-400'
                              }'}
                            >
                              {alert.priority.toUpperCase()}
                            </Badge>
                          </AlertTitle>
                          <AlertDescription className="mt-2 text-neutral-300">
                            {alert.message}
                          </AlertDescription>
                          <div className="mt-2 flex items-center space-x-4 text-xs text-neutral-400">
                            <span>Confidence: {alert.confidence.toFixed(1)}%</span>
                            {alert.potential_impact_usd && (
                              <span>Impact: ${(alert.potential_impact_usd / 1000).toFixed(0)}K</span>
                            )}
                            {alert.action_deadline && (
                              <span>Deadline: {new Date(alert.action_deadline).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}