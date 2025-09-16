'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Zap, 
  DollarSign, 
  Users, 
  BarChart3, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Settings,
  PlayCircle,
  PauseCircle,
  Star,
  Award,
  Lightbulb,
  Rocket,
  Shield,
  Gauge
} from 'lucide-react';

interface PerformanceData {
  organization_performance: {
    overall_score: number;
    performance_grade: string;
    trend_direction: string;
  };
  key_performance_indicators: {
    financial_metrics: {
      revenue_growth_rate: number;
      profit_margin: number;
      cost_efficiency_ratio: number;
      cash_flow_health: string;
      benchmark_vs_industry: string;
    };
    operational_metrics: {
      productivity_index: number;
      resource_utilization: number;
      process_efficiency: number;
      quality_score: number;
      benchmark_vs_industry: string;
    };
    customer_metrics: {
      satisfaction_score: number;
      retention_rate: number;
      acquisition_cost: number;
      lifetime_value: number;
      benchmark_vs_industry: string;
    };
    employee_metrics: {
      satisfaction_score: number;
      productivity_score: number;
      retention_rate: number;
      training_effectiveness: number;
      benchmark_vs_industry: string;
    };
  };
  optimization_opportunities: {
    high_impact_low_effort: Array<{
      opportunity: string;
      impact_score: number;
      effort_score: number;
      estimated_savings: string;
      implementation_time: string;
    }>;
    high_impact_high_effort: Array<{
      opportunity: string;
      impact_score: number;
      effort_score: number;
      estimated_benefit: string;
      implementation_time: string;
    }>;
  };
  actionable_insights: Array<{
    insight: string;
    action: string;
    priority: string;
    expected_impact: string;
  }>;
}

interface RecommendationData {
  immediate_actions: Array<{
    recommendation_id: string;
    title: string;
    category: string;
    description: string;
    impact_analysis: {
      cost_savings_monthly?: number;
      revenue_increase_monthly?: number;
      time_savings_hours?: number;
      accuracy_improvement_percent?: number;
      implementation_effort: string;
    };
    roi_projection: {
      investment_required: number;
      monthly_savings?: number;
      monthly_benefit?: number;
      breakeven_months: number;
      annual_roi_percent: number;
    };
    implementation_steps: string[];
    success_metrics: string[];
    priority: string;
    effort_level: string;
    confidence_score: number;
  }>;
  strategic_initiatives: Array<{
    initiative_id: string;
    title: string;
    category: string;
    description: string;
    impact_analysis: {
      customer_satisfaction_improvement?: number;
      customer_retention_improvement?: number;
      revenue_impact_annual?: number;
      implementation_timeline: string;
    };
    investment_requirements: {
      total_investment: number;
    };
    expected_outcomes: string[];
    success_metrics: string[];
    priority: string;
    strategic_importance: string;
    confidence_score: number;
  }>;
}

export default function PerformanceOptimizationPage() {
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [recommendationData, setRecommendationData] = useState<RecommendationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [organizationId] = useState('550e8400-e29b-41d4-a716-446655440000');
  const [selectedRecommendations, setSelectedRecommendations] = useState<string[]>([]);
  const [implementationLoading, setImplementationLoading] = useState(false);

  useEffect(() => {
    fetchPerformanceData();
    fetchRecommendations();
  }, []);

  const fetchPerformanceData = async () => {
    try {
      const response = await fetch('/api/v1/intelligence/performance-optimization?organization_id=${organizationId}');
      const result = await response.json();
      
      if (response.ok) {
        setPerformanceData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch performance data:', error);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await fetch('/api/v1/intelligence/performance-optimization?organization_id=${organizationId}&analysis_type=recommendations');
      const result = await response.json();
      
      if (response.ok) {
        setRecommendationData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const implementRecommendations = async () => {
    if (selectedRecommendations.length === 0) return;

    try {
      setImplementationLoading(true);
      const response = await fetch('/api/v1/intelligence/performance-optimization', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization_id: organizationId,
          implementation_plan: {
            selected_recommendations: selectedRecommendations,
            implementation_timeline: '90d',
            resource_allocation: {
              priority_level: 'high'
            },
            success_metrics: ['Performance improvement', 'ROI achievement', 'User adoption']
          },
          monitoring_preferences: {
            automated_tracking: true,
            reporting_frequency: 'weekly'
          }
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        // Handle successful implementation
        setSelectedRecommendations([]);
      }
    } catch (error) {
      console.error('Failed to implement recommendations:', error);
    } finally {
      setImplementationLoading(false);
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 85) return 'text-green-500';
    if (score >= 70) return 'text-blue-500';
    if (score >= 55) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'outline';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const formatCurrency = (cents: number) => {
    return '$${(cents / 100).toLocaleString()}';
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Performance Optimization</h1>
          <p className="text-neutral-400">AI-powered business performance analysis and optimization recommendations</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => fetchPerformanceData()}>
            <Activity className="mr-2 h-4 w-4" />
            Refresh Analysis
          </Button>
          {selectedRecommendations.length > 0 && (
            <Button onClick={implementRecommendations} disabled={implementationLoading}>
              <Rocket className="mr-2 h-4 w-4" />
              {implementationLoading ? 'Implementing...' : 'Implement Selected'}
            </Button>
          )}
        </div>
      </div>

      {/* Performance Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-neutral-900 border-neutral-800 col-span-1">
          <CardContent className="pt-6 text-center">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={'text-3xl font-bold ${getPerformanceColor(performanceData?.organization_performance?.overall_score || 0)}'}>
                  {performanceData?.organization_performance?.overall_score || 0}
                </span>
              </div>
              <Progress 
                value={performanceData?.organization_performance?.overall_score || 0} 
                className="w-full h-2" 
              />
            </div>
            <h3 className="text-lg font-semibold text-white">Overall Performance</h3>
            <p className="text-sm text-neutral-400">
              Grade: {performanceData?.organization_performance?.performance_grade || 'N/A'}
            </p>
            <Badge variant={performanceData?.organization_performance?.trend_direction === 'improving' ? 'default' : 'secondary'}>
              {performanceData?.organization_performance?.trend_direction || 'stable'}
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <h3 className="font-semibold text-white">Financial Health</h3>
            </div>
            <p className="text-2xl font-bold text-white mt-2">
              {performanceData?.key_performance_indicators?.financial_metrics?.revenue_growth_rate || 0}%
            </p>
            <p className="text-sm text-neutral-400">Revenue Growth Rate</p>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-400">
                {performanceData?.key_performance_indicators?.financial_metrics?.benchmark_vs_industry || '+0%'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Gauge className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold text-white">Operational Efficiency</h3>
            </div>
            <p className="text-2xl font-bold text-white mt-2">
              {performanceData?.key_performance_indicators?.operational_metrics?.productivity_index || 0}
            </p>
            <p className="text-sm text-neutral-400">Productivity Index</p>
            <div className="flex items-center gap-1 mt-2">
              <Activity className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-blue-400">
                {performanceData?.key_performance_indicators?.operational_metrics?.benchmark_vs_industry || '+0%'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              <h3 className="font-semibold text-white">Customer Satisfaction</h3>
            </div>
            <p className="text-2xl font-bold text-white mt-2">
              {performanceData?.key_performance_indicators?.customer_metrics?.satisfaction_score || 0}/5
            </p>
            <p className="text-sm text-neutral-400">Average Rating</p>
            <div className="flex items-center gap-1 mt-2">
              <Star className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-purple-400">
                {performanceData?.key_performance_indicators?.customer_metrics?.benchmark_vs_industry || '+0%'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="implementation">Implementation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader>
                <CardTitle className="text-white">Performance Metrics</CardTitle>
                <CardDescription>Key performance indicators across all areas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-300">Financial Performance</span>
                    <div className="flex items-center gap-2">
                      <Progress value={85} className="w-20" />
                      <span className="text-white font-medium">85</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-300">Operational Efficiency</span>
                    <div className="flex items-center gap-2">
                      <Progress value={78} className="w-20" />
                      <span className="text-white font-medium">78</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-300">Customer Satisfaction</span>
                    <div className="flex items-center gap-2">
                      <Progress value={72} className="w-20" />
                      <span className="text-white font-medium">72</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-300">Employee Engagement</span>
                    <div className="flex items-center gap-2">
                      <Progress value={81} className="w-20" />
                      <span className="text-white font-medium">81</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader>
                <CardTitle className="text-white">Performance Trends</CardTitle>
                <CardDescription>Performance changes over time</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-300">Last 30 Days</span>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-green-400 font-medium">+5.2%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-300">Last 90 Days</span>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-green-400 font-medium">+12.5%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-300">Year over Year</span>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-green-400 font-medium">+18.7%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="text-white">Detailed Performance Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-neutral-800 rounded-lg">
                  <DollarSign className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">
                    {performanceData?.key_performance_indicators?.financial_metrics?.profit_margin}%
                  </p>
                  <p className="text-sm text-neutral-400">Profit Margin</p>
                </div>
                <div className="text-center p-4 bg-neutral-800 rounded-lg">
                  <Activity className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">
                    {performanceData?.key_performance_indicators?.operational_metrics?.resource_utilization}%
                  </p>
                  <p className="text-sm text-neutral-400">Resource Utilization</p>
                </div>
                <div className="text-center p-4 bg-neutral-800 rounded-lg">
                  <Users className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">
                    {performanceData?.key_performance_indicators?.customer_metrics?.retention_rate}%
                  </p>
                  <p className="text-sm text-neutral-400">Customer Retention</p>
                </div>
                <div className="text-center p-4 bg-neutral-800 rounded-lg">
                  <Award className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">
                    {performanceData?.key_performance_indicators?.operational_metrics?.quality_score}
                  </p>
                  <p className="text-sm text-neutral-400">Quality Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">AI-Powered Recommendations</h2>
            <div className="text-sm text-neutral-400">
              {selectedRecommendations.length} selected for implementation
            </div>
          </div>

          {/* Immediate Actions */}
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="text-white">Immediate Action Items</CardTitle>
              <CardDescription>High-impact recommendations you can implement right away</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recommendationData?.immediate_actions?.map((recommendation) => (
                <div key={recommendation.recommendation_id} className="p-4 bg-neutral-800 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedRecommendations.includes(recommendation.recommendation_id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedRecommendations([...selectedRecommendations, recommendation.recommendation_id]);
                          } else {
                            setSelectedRecommendations(selectedRecommendations.filter(id => id !== recommendation.recommendation_id));
                          }
                        }}
                      />
                      <div>
                        <h4 className="font-semibold text-white">{recommendation.title}</h4>
                        <p className="text-sm text-neutral-300 mt-1">{recommendation.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getPriorityColor(recommendation.priority)}>
                        {recommendation.priority}
                      </Badge>
                      <div className="text-right">
                        <div className="text-sm font-medium text-green-400">
                          {recommendation.roi_projection.annual_roi_percent}% ROI
                        </div>
                        <div className="text-xs text-neutral-400">
                          {recommendation.confidence_score}% confidence
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-neutral-400 mb-1">Investment Required</p>
                      <p className="font-medium text-white">
                        {formatCurrency(recommendation.roi_projection.investment_required)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-400 mb-1">Monthly Savings</p>
                      <p className="font-medium text-green-400">
                        {formatCurrency(recommendation.roi_projection.monthly_savings || recommendation.roi_projection.monthly_benefit || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-400 mb-1">Breakeven</p>
                      <p className="font-medium text-white">
                        {recommendation.roi_projection.breakeven_months} months
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm text-neutral-400 mb-2">Key Benefits:</p>
                    <div className="flex flex-wrap gap-2">
                      {recommendation.success_metrics.map((metric, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {metric}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Strategic Initiatives */}
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="text-white">Strategic Initiatives</CardTitle>
              <CardDescription>Long-term transformation opportunities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recommendationData?.strategic_initiatives?.map((initiative) => (
                <div key={initiative.initiative_id} className="p-4 bg-neutral-800 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedRecommendations.includes(initiative.initiative_id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedRecommendations([...selectedRecommendations, initiative.initiative_id]);
                          } else {
                            setSelectedRecommendations(selectedRecommendations.filter(id => id !== initiative.initiative_id));
                          }
                        }}
                      />
                      <div>
                        <h4 className="font-semibold text-white">{initiative.title}</h4>
                        <p className="text-sm text-neutral-300 mt-1">{initiative.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getPriorityColor(initiative.priority)}>
                        {initiative.strategic_importance}
                      </Badge>
                      <div className="text-right">
                        <div className="text-sm font-medium text-purple-400">
                          {initiative.confidence_score}% confidence
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-neutral-400 mb-1">Total Investment</p>
                      <p className="font-medium text-white">
                        {formatCurrency(initiative.investment_requirements.total_investment)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-400 mb-1">Timeline</p>
                      <p className="font-medium text-white">
                        {initiative.impact_analysis.implementation_timeline}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm text-neutral-400 mb-2">Expected Outcomes:</p>
                    <ul className="space-y-1">
                      {initiative.expected_outcomes.slice(0, 3).map((outcome, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-neutral-300">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          {outcome}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="opportunities" className="space-y-6">
          <div className="grid gap-6">
            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader>
                <CardTitle className="text-white">Quick Wins</CardTitle>
                <CardDescription>High impact, low effort opportunities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {performanceData?.optimization_opportunities?.high_impact_low_effort?.map((opportunity, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-neutral-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Zap className="h-5 w-5 text-yellow-500" />
                      <div>
                        <h4 className="font-medium text-white">{opportunity.opportunity}</h4>
                        <p className="text-sm text-neutral-400">{opportunity.implementation_time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="text-sm">
                          <span className="text-neutral-400">Impact: </span>
                          <span className="text-green-400 font-medium">{opportunity.impact_score}/100</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-neutral-400">Effort: </span>
                          <span className="text-blue-400 font-medium">{opportunity.effort_score}/100</span>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-green-400">{opportunity.estimated_savings}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader>
                <CardTitle className="text-white">Strategic Opportunities</CardTitle>
                <CardDescription>High impact, high effort transformational opportunities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {performanceData?.optimization_opportunities?.high_impact_high_effort?.map((opportunity, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-neutral-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Target className="h-5 w-5 text-purple-500" />
                      <div>
                        <h4 className="font-medium text-white">{opportunity.opportunity}</h4>
                        <p className="text-sm text-neutral-400">{opportunity.implementation_time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="text-sm">
                          <span className="text-neutral-400">Impact: </span>
                          <span className="text-green-400 font-medium">{opportunity.impact_score}/100</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-neutral-400">Effort: </span>
                          <span className="text-orange-400 font-medium">{opportunity.effort_score}/100</span>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-purple-400">{opportunity.estimated_benefit}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="text-white">Actionable Business Insights</CardTitle>
              <CardDescription>AI-powered insights based on your performance data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {performanceData?.actionable_insights?.map((insight, index) => (
                <div key={index} className="p-4 bg-neutral-800 rounded-lg">
                  <div className="flex items-start gap-3 mb-3">
                    <Lightbulb className="h-5 w-5 text-yellow-500 mt-1" />
                    <div>
                      <h4 className="font-medium text-white mb-2">{insight.insight}</h4>
                      <p className="text-sm text-neutral-300 mb-3">{insight.action}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant={getPriorityColor(insight.priority)}>
                          {insight.priority} priority
                        </Badge>
                        <p className="text-sm text-green-400">{insight.expected_impact}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="implementation" className="space-y-6">
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="text-white">Implementation Dashboard</CardTitle>
              <CardDescription>Track progress of your optimization initiatives</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Settings className="h-16 w-16 text-neutral-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No Active Implementations</h3>
                <p className="text-neutral-400 mb-6">
                  Select recommendations from the Recommendations tab to start implementing optimizations
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab('recommendations')}
                >
                  View Recommendations
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}