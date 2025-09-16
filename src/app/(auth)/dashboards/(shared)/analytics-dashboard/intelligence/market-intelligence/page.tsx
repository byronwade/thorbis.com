'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Globe, 
  Users, 
  DollarSign, 
  BarChart3, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Eye,
  Activity,
  Map
} from 'lucide-react';

interface MarketIntelligenceData {
  competitive_landscape: {
    primary_competitors: Array<{
      name: string;
      market_share: number;
      threat_level: 'low' | 'medium' | 'high';
      strengths: string[];
      weaknesses: string[];
      recent_activities: string[];
    }>;
    market_positioning: {
      our_position: string;
      competitive_advantages: string[];
      improvement_areas: string[];
    };
  };
  market_trends: {
    trending_topics: Array<{
      topic: string;
      growth_rate: number;
      relevance_score: number;
      opportunity_size: string;
    }>;
    industry_forecast: {
      next_quarter: string;
      next_year: string;
      key_drivers: string[];
    };
  };
  pricing_intelligence: {
    competitor_pricing: Array<{
      competitor: string;
      service_category: string;
      price_range: string;
      pricing_strategy: string;
    }>;
    market_averages: {
      premium_tier: number;
      standard_tier: number;
      budget_tier: number;
    };
    pricing_recommendations: string[];
  };
  opportunities: Array<{
    opportunity: string;
    market_size: string;
    competition_level: 'low' | 'medium' | 'high';
    time_to_market: string;
    roi_potential: number;
    strategic_fit: number;
  }>;
  sentiment_analysis: {
    overall_sentiment: 'positive' | 'neutral' | 'negative';
    sentiment_score: number;
    key_themes: Array<{
      theme: string;
      mentions: number;
      sentiment: 'positive' | 'neutral' | 'negative';
    }>;
  };
  alerts: Array<{
    type: 'competitor_activity' | 'market_shift' | 'opportunity' | 'threat';
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    timestamp: string;
  }>;
}

interface IntelligenceConfig {
  analysis_types: Array<'competitive_landscape' | 'market_trends' | 'pricing_analysis' | 'sentiment_analysis' | 'opportunity_identification' | 'industry_benchmarking' | 'market_sizing' | 'customer_analysis'>;
  market_scope: 'local' | 'regional' | 'national' | 'global';
  industry_focus: string[];
  competitor_list: string[];
  time_frame: 'real_time' | '24h' | '7d' | '30d' | '90d';
}

export default function MarketIntelligencePage() {
  const [intelligenceData, setIntelligenceData] = useState<MarketIntelligenceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [organizationId] = useState('550e8400-e29b-41d4-a716-446655440000');
  
  // Configuration state
  const [config, setConfig] = useState<IntelligenceConfig>({
    analysis_types: ['competitive_landscape', 'market_trends', 'opportunity_identification'],
    market_scope: 'national',
    industry_focus: [],
    competitor_list: [],
    time_frame: '30d'
  });

  const [showConfig, setShowConfig] = useState(false);
  const [configLoading, setConfigLoading] = useState(false);

  useEffect(() => {
    fetchMarketIntelligence();
  }, []);

  const fetchMarketIntelligence = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/intelligence/market-intelligence?organization_id=${organizationId}&request_type=comprehensive_analysis');
      const result = await response.json();
      
      if (response.ok) {
        setIntelligenceData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch market intelligence:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateCustomAnalysis = async () => {
    try {
      setConfigLoading(true);
      const response = await fetch('/api/v1/intelligence/market-intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization_id: organizationId,
          intelligence_config: config
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        setIntelligenceData(result.data);
        setShowConfig(false);
      }
    } catch (error) {
      console.error('Failed to generate custom analysis:', error);
    } finally {
      setConfigLoading(false);
    }
  };

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'destructive';
      case 'medium': return 'outline';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Clock className="h-4 w-4" />;
    }
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
          <h1 className="text-3xl font-bold text-white">Market Intelligence</h1>
          <p className="text-neutral-400">Real-time competitive analysis and market insights</p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setShowConfig(!showConfig)}
          >
            Configure Analysis
          </Button>
          <Button onClick={fetchMarketIntelligence}>
            <Activity className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Configuration Panel */}
      {showConfig && (
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-white">Intelligence Configuration</CardTitle>
            <CardDescription>Customize your market analysis parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-white">Analysis Types</Label>
                  <div className="mt-2 space-y-2">
                    {[
                      { id: 'competitive_landscape', label: 'Competitive Landscape' },
                      { id: 'market_trends', label: 'Market Trends' },
                      { id: 'pricing_analysis', label: 'Pricing Analysis' },
                      { id: 'sentiment_analysis', label: 'Sentiment Analysis' },
                      { id: 'opportunity_identification', label: 'Opportunity Identification' },
                      { id: 'industry_benchmarking', label: 'Industry Benchmarking' },
                      { id: 'market_sizing', label: 'Market Sizing' },
                      { id: 'customer_analysis', label: 'Customer Analysis' }
                    ].map(({ id, label }) => (
                      <div key={id} className="flex items-center space-x-2">
                        <Switch
                          id={id}
                          checked={config.analysis_types.includes(id as any)}
                          onCheckedChange={(checked) => {
                            setConfig(prev => ({
                              ...prev,
                              analysis_types: checked
                                ? [...prev.analysis_types, id as any]
                                : prev.analysis_types.filter(t => t !== id)
                            }));
                          }}
                        />
                        <Label htmlFor={id} className="text-neutral-300">{label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="market_scope" className="text-white">Market Scope</Label>
                  <Select
                    value={config.market_scope}
                    onValueChange={(value) => setConfig(prev => ({ ...prev, market_scope: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">Local</SelectItem>
                      <SelectItem value="regional">Regional</SelectItem>
                      <SelectItem value="national">National</SelectItem>
                      <SelectItem value="global">Global</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="time_frame" className="text-white">Time Frame</Label>
                  <Select
                    value={config.time_frame}
                    onValueChange={(value) => setConfig(prev => ({ ...prev, time_frame: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="real_time">Real Time</SelectItem>
                      <SelectItem value="24h">24 Hours</SelectItem>
                      <SelectItem value="7d">7 Days</SelectItem>
                      <SelectItem value="30d">30 Days</SelectItem>
                      <SelectItem value="90d">90 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="industry_focus" className="text-white">Industry Focus</Label>
                  <Textarea
                    id="industry_focus"
                    placeholder="Enter industry keywords (one per line)"
                    value={config.industry_focus.join('\n')}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      industry_focus: e.target.value.split('\n').filter(Boolean)
                    }))}
                    className="bg-neutral-800 border-neutral-700 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="competitor_list" className="text-white">Competitor List</Label>
                  <Textarea
                    id="competitor_list"
                    placeholder="Enter competitor names (one per line)"
                    value={config.competitor_list.join('\n')}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      competitor_list: e.target.value.split('\n').filter(Boolean)
                    }))}
                    className="bg-neutral-800 border-neutral-700 text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => setShowConfig(false)}>
                Cancel
              </Button>
              <Button onClick={generateCustomAnalysis} disabled={configLoading}>
                {configLoading ? 'Generating...' : 'Generate Analysis'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerts Bar */}
      {intelligenceData?.alerts && intelligenceData.alerts.length > 0 && (
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-5 w-5 text-yellow-500" />
              <h3 className="text-lg font-semibold text-white">Recent Alerts</h3>
            </div>
            <div className="space-y-2">
              {intelligenceData.alerts.slice(0, 3).map((alert, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getSeverityIcon(alert.severity)}
                    <div>
                      <p className="text-white font-medium">{alert.title}</p>
                      <p className="text-sm text-neutral-400">{alert.description}</p>
                    </div>
                  </div>
                  <Badge variant={alert.severity === 'high' ? 'destructive' : 'secondary'}>
                    {alert.type.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="competitors">Competitors</TabsTrigger>
          <TabsTrigger value="trends">Market Trends</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-neutral-900 border-neutral-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-blue-500" />
                  <h3 className="font-semibold text-white">Market Position</h3>
                </div>
                <p className="text-2xl font-bold text-white mt-2">
                  {intelligenceData?.competitive_landscape?.market_positioning?.our_position || 'Strong Challenger'}
                </p>
                <p className="text-sm text-neutral-400">Current market standing</p>
              </CardContent>
            </Card>

            <Card className="bg-neutral-900 border-neutral-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-500" />
                  <h3 className="font-semibold text-white">Sentiment Score</h3>
                </div>
                <p className="text-2xl font-bold text-white mt-2">
                  {intelligenceData?.sentiment_analysis?.sentiment_score || 78}/100
                </p>
                <p className="text-sm text-neutral-400">
                  {intelligenceData?.sentiment_analysis?.overall_sentiment || 'Positive'} market sentiment
                </p>
              </CardContent>
            </Card>

            <Card className="bg-neutral-900 border-neutral-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-500" />
                  <h3 className="font-semibold text-white">Opportunities</h3>
                </div>
                <p className="text-2xl font-bold text-white mt-2">
                  {intelligenceData?.opportunities?.length || 12}
                </p>
                <p className="text-sm text-neutral-400">Active market opportunities</p>
              </CardContent>
            </Card>
          </div>

          {/* Competitive Advantages */}
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="text-white">Competitive Advantages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-green-400 mb-3">Our Strengths</h4>
                  <div className="space-y-2">
                    {intelligenceData?.competitive_landscape?.market_positioning?.competitive_advantages?.map((advantage, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-neutral-300">{advantage}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-yellow-400 mb-3">Improvement Areas</h4>
                  <div className="space-y-2">
                    {intelligenceData?.competitive_landscape?.market_positioning?.improvement_areas?.map((area, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        <span className="text-neutral-300">{area}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competitors" className="space-y-6">
          <div className="grid gap-6">
            {intelligenceData?.competitive_landscape?.primary_competitors?.map((competitor, index) => (
              <Card key={index} className="bg-neutral-900 border-neutral-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">{competitor.name}</CardTitle>
                    <Badge variant={getThreatLevelColor(competitor.threat_level)}>
                      {competitor.threat_level} threat
                    </Badge>
                  </div>
                  <CardDescription>
                    {competitor.market_share}% market share
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-semibold text-green-400 mb-2">Strengths</h4>
                      <ul className="space-y-1">
                        {competitor.strengths.map((strength, i) => (
                          <li key={i} className="text-sm text-neutral-300">• {strength}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-red-400 mb-2">Weaknesses</h4>
                      <ul className="space-y-1">
                        {competitor.weaknesses.map((weakness, i) => (
                          <li key={i} className="text-sm text-neutral-300">• {weakness}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-400 mb-2">Recent Activities</h4>
                      <ul className="space-y-1">
                        {competitor.recent_activities.map((activity, i) => (
                          <li key={i} className="text-sm text-neutral-300">• {activity}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid gap-6">
            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader>
                <CardTitle className="text-white">Trending Topics</CardTitle>
                <CardDescription>Current market trends and their growth potential</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {intelligenceData?.market_trends?.trending_topics?.map((trend, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-neutral-800 rounded-lg">
                      <div>
                        <h4 className="font-medium text-white">{trend.topic}</h4>
                        <p className="text-sm text-neutral-400">Opportunity size: {trend.opportunity_size}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span className="text-green-400 font-medium">{trend.growth_rate}%</span>
                          </div>
                          <p className="text-xs text-neutral-400">Relevance: {trend.relevance_score}/100</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader>
                <CardTitle className="text-white">Industry Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-blue-400 mb-2">Next Quarter</h4>
                    <p className="text-neutral-300">{intelligenceData?.market_trends?.industry_forecast?.next_quarter}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-purple-400 mb-2">Next Year</h4>
                    <p className="text-neutral-300">{intelligenceData?.market_trends?.industry_forecast?.next_year}</p>
                  </div>
                </div>
                <div className="mt-6">
                  <h4 className="font-semibold text-yellow-400 mb-2">Key Growth Drivers</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {intelligenceData?.market_trends?.industry_forecast?.key_drivers?.map((driver, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-yellow-500" />
                        <span className="text-neutral-300">{driver}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6">
          <div className="grid gap-6">
            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader>
                <CardTitle className="text-white">Market Pricing Overview</CardTitle>
                <CardDescription>Competitive pricing analysis and market averages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-4 bg-neutral-800 rounded-lg">
                    <DollarSign className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">
                      ${intelligenceData?.pricing_intelligence?.market_averages?.premium_tier || 299}
                    </p>
                    <p className="text-sm text-neutral-400">Premium Tier</p>
                  </div>
                  <div className="text-center p-4 bg-neutral-800 rounded-lg">
                    <DollarSign className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">
                      ${intelligenceData?.pricing_intelligence?.market_averages?.standard_tier || 149}
                    </p>
                    <p className="text-sm text-neutral-400">Standard Tier</p>
                  </div>
                  <div className="text-center p-4 bg-neutral-800 rounded-lg">
                    <DollarSign className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">
                      ${intelligenceData?.pricing_intelligence?.market_averages?.budget_tier || 79}
                    </p>
                    <p className="text-sm text-neutral-400">Budget Tier</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-white">Competitor Pricing</h4>
                  {intelligenceData?.pricing_intelligence?.competitor_pricing?.map((pricing, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-neutral-800 rounded-lg">
                      <div>
                        <h5 className="font-medium text-white">{pricing.competitor}</h5>
                        <p className="text-sm text-neutral-400">{pricing.service_category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-white">{pricing.price_range}</p>
                        <p className="text-sm text-neutral-400">{pricing.pricing_strategy}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <h4 className="font-semibold text-green-400 mb-2">Pricing Recommendations</h4>
                  <ul className="space-y-1">
                    {intelligenceData?.pricing_intelligence?.pricing_recommendations?.map((rec, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-neutral-300">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="opportunities" className="space-y-6">
          <div className="grid gap-4">
            {intelligenceData?.opportunities?.map((opportunity, index) => (
              <Card key={index} className="bg-neutral-900 border-neutral-800">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-white">{opportunity.opportunity}</h4>
                    <Badge variant={opportunity.competition_level === 'low' ? 'default' : 'outline'}>
                      {opportunity.competition_level} competition
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-neutral-400">Market Size</p>
                      <p className="font-medium text-white">{opportunity.market_size}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-400">Time to Market</p>
                      <p className="font-medium text-white">{opportunity.time_to_market}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-400">ROI Potential</p>
                      <p className="font-medium text-green-400">{opportunity.roi_potential}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-400">Strategic Fit</p>
                      <div className="flex items-center gap-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={'w-2 h-2 rounded-full ${
                                i < opportunity.strategic_fit ? 'bg-blue-500' : 'bg-neutral-600'
                              }'}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-white ml-1">{opportunity.strategic_fit}/5</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}