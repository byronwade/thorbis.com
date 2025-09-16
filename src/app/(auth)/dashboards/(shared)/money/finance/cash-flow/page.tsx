/**
 * Cash Flow Forecasting Dashboard
 * Comprehensive cash flow analysis with working capital optimization
 * 
 * Features: Predictive analytics, scenario modeling, optimization recommendations
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Target,
  BarChart3,
  PieChart,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Settings,
  RefreshCw,
  Download,
  LineChart,
  Calculator,
  Banknote,
  CreditCard,
  Wallet,
  Building2,
  Car,
  UtensilsCrossed,
  ShoppingBag,
  ArrowUp,
  ArrowDown,
  Minus,
  Eye,
  FileText,
  Activity
} from 'lucide-react';

// Mock organization ID - replace with actual auth
const MOCK_ORG_ID = '550e8400-e29b-41d4-a716-446655440001';

interface CashFlowForecast {
  forecastPeriods: Array<{
    month: number;
    projected_inflows: number;
    projected_outflows: number;
    net_flow: number;
    cumulative_cash: number;
    confidence_level: number;
    key_assumptions: string[];
  }>;
  cashPositions: number[];
  totalProjectedInflow: number;
  totalProjectedOutflow: number;
  methodology: string;
  dataQuality: number;
}

interface WorkingCapitalMetrics {
  working_capital: number;
  working_capital_ratio: number;
  current_ratio: number;
  quick_ratio: number;
  cash_conversion_cycle: {
    days_sales_outstanding: number;
    days_inventory_outstanding: number;
    days_payable_outstanding: number;
    total_cycle_days: number;
  };
  cash_to_working_capital: number;
  working_capital_turnover: number;
}

interface ForecastScenario {
  scenario_name: string;
  revenue_growth: number;
  expense_growth: number;
  description: string;
  probability: number;
}

export default function CashFlowForecastingPage() {
  const [activeTab, setActiveTab] = useState('forecast');
  const [forecastData, setForecastData] = useState<CashFlowForecast | null>(null);
  const [workingCapitalData, setWorkingCapitalData] = useState<WorkingCapitalMetrics | null>(null);
  const [scenarios, setScenarios] = useState<ForecastScenario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(12);
  const [selectedScenario, setSelectedScenario] = useState('base');

  // Forecast configuration state
  const [forecastConfig, setForecastConfig] = useState({
    forecast_period_months: 12,
    confidence_level: 'medium' as const,
    include_scenarios: true,
    seasonal_adjustments: true,
    industry_benchmarks: true
  });

  const verticalIcons = {
    hs: Building2,
    auto: Car,
    rest: UtensilsCrossed,
    ret: ShoppingBag
  };

  useEffect(() => {
    loadCashFlowData();
  }, [selectedPeriod]);

  const loadCashFlowData = async () => {
    try {
      const params = new URLSearchParams({
        organization_id: MOCK_ORG_ID,
        period_months: selectedPeriod.toString(),
        forecast_type: 'standard'
      });

      const response = await fetch('/api/v1/finance/cash-flow?${params}');
      if (response.ok) {
        const result = await response.json();
        setForecastData(result.data.cash_flow_forecast);
        setWorkingCapitalData(result.data.working_capital_metrics);
        setScenarios(result.data.scenarios || []);
      }
    } catch (error) {
      console.error('Failed to load cash flow data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateAdvancedForecast = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/v1/finance/cash-flow/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization_id: MOCK_ORG_ID,
          forecast_config: forecastConfig,
          historical_periods: {
            include_months: 12,
            exclude_outliers: true,
            weight_recent_data: true
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        setForecastData(result.data.cash_flow_forecast);
        await loadCashFlowData(); // Refresh all data
      }
    } catch (error) {
      console.error('Failed to generate advanced forecast:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const formatCurrency = (cents: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);

  const formatPercentage = (value: number) => '${value.toFixed(1)}%';

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <ArrowUp className="w-4 h-4 text-green-600" />;
    if (current < previous) return <ArrowDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  const getHealthColor = (ratio: number, goodThreshold: number, warningThreshold: number) => {
    if (ratio >= goodThreshold) return 'text-green-600';
    if (ratio >= warningThreshold) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCashFlowTrend = () => {
    if (!forecastData?.cashPositions) return { trend: 'stable', color: 'text-gray-600' };
    
    const positions = forecastData.cashPositions;
    const start = positions[0];
    const end = positions[positions.length - 1];
    
    if (end > start * 1.1) return { trend: 'growing', color: 'text-green-600' };
    if (end < start * 0.9) return { trend: 'declining', color: 'text-red-600' };
    return { trend: 'stable', color: 'text-blue-600' };
  };

  const cashFlowTrend = getCashFlowTrend();

  // Calculate summary metrics
  const forecastSummary = forecastData ? {
    projectedCashFlow: forecastData.totalProjectedInflow - forecastData.totalProjectedOutflow,
    averageMonthlyInflow: forecastData.totalProjectedInflow / forecastData.forecastPeriods.length,
    averageMonthlyOutflow: forecastData.totalProjectedOutflow / forecastData.forecastPeriods.length,
    finalCashPosition: forecastData.cashPositions[forecastData.cashPositions.length - 1],
    lowestCashPosition: Math.min(...forecastData.cashPositions),
    highestCashPosition: Math.max(...forecastData.cashPositions)
  } : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Cash Flow Forecasting</h1>
          <p className="text-muted-foreground mt-2">
            Advanced cash flow analysis with working capital optimization and predictive insights
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod.toString()} onValueChange={(value) => setSelectedPeriod(parseInt(value))}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6">6 Months</SelectItem>
              <SelectItem value="12">12 Months</SelectItem>
              <SelectItem value="18">18 Months</SelectItem>
              <SelectItem value="24">24 Months</SelectItem>
            </SelectContent>
          </Select>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Advanced Forecast
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Advanced Forecast Configuration</DialogTitle>
                <DialogDescription>
                  Configure advanced forecasting parameters for more detailed analysis
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Forecast Period</Label>
                    <Select 
                      value={forecastConfig.forecast_period_months.toString()}
                      onValueChange={(value) => setForecastConfig(prev => ({
                        ...prev,
                        forecast_period_months: parseInt(value)
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6">6 Months</SelectItem>
                        <SelectItem value="12">12 Months</SelectItem>
                        <SelectItem value="18">18 Months</SelectItem>
                        <SelectItem value="24">24 Months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Confidence Level</Label>
                    <Select 
                      value={forecastConfig.confidence_level}
                      onValueChange={(value: 'low' | 'medium' | 'high') => setForecastConfig(prev => ({
                        ...prev,
                        confidence_level: value
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low (Conservative)</SelectItem>
                        <SelectItem value="medium">Medium (Balanced)</SelectItem>
                        <SelectItem value="high">High (Aggressive)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={forecastConfig.include_scenarios}
                      onChange={(e) => setForecastConfig(prev => ({
                        ...prev,
                        include_scenarios: e.target.checked
                      }))}
                      className="rounded"
                    />
                    <span className="text-sm">Include scenario analysis</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={forecastConfig.seasonal_adjustments}
                      onChange={(e) => setForecastConfig(prev => ({
                        ...prev,
                        seasonal_adjustments: e.target.checked
                      }))}
                      className="rounded"
                    />
                    <span className="text-sm">Apply seasonal adjustments</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={forecastConfig.industry_benchmarks}
                      onChange={(e) => setForecastConfig(prev => ({
                        ...prev,
                        industry_benchmarks: e.target.checked
                      }))}
                      className="rounded"
                    />
                    <span className="text-sm">Include industry benchmarks</span>
                  </label>
                </div>

                <Button 
                  onClick={handleGenerateAdvancedForecast}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating Forecast...
                    </>
                  ) : (
                    <>
                      <Calculator className="w-4 h-4 mr-2" />
                      Generate Advanced Forecast
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <Wallet className="w-6 h-6 text-blue-600" />
              <span className="text-sm font-medium">Projected Cash Flow</span>
            </div>
            <p className={'text-2xl font-bold ${forecastSummary?.projectedCashFlow && forecastSummary.projectedCashFlow > 0 ? 'text-green-600' : 'text-red-600'}'}>
              {forecastSummary ? formatCurrency(forecastSummary.projectedCashFlow) : '$0'}
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className={cashFlowTrend.color}>
                {cashFlowTrend.trend === 'growing' ? <TrendingUp className="w-3 h-3" /> :
                 cashFlowTrend.trend === 'declining' ? <TrendingDown className="w-3 h-3" /> :
                 <Minus className="w-3 h-3" />}
              </span>
              {selectedPeriod} month outlook
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-6 h-6 text-green-600" />
              <span className="text-sm font-medium">Working Capital Ratio</span>
            </div>
            <p className={'text-2xl font-bold ${getHealthColor(workingCapitalData?.current_ratio || 0, 2.0, 1.5)}'}>
              {workingCapitalData ? workingCapitalData.current_ratio.toFixed(2) : '0.00`}
            </p>
            <p className="text-xs text-muted-foreground">
              Target: 2.0+ (Healthy)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-6 h-6 text-orange-600" />
              <span className="text-sm font-medium">Cash Conversion Cycle</span>
            </div>
            <p className={`text-2xl font-bold ${getHealthColor(workingCapitalData?.cash_conversion_cycle.total_cycle_days || 0, 30, 60)}`}>
              {workingCapitalData ? Math.round(
                workingCapitalData.cash_conversion_cycle.days_sales_outstanding +
                workingCapitalData.cash_conversion_cycle.days_inventory_outstanding -
                workingCapitalData.cash_conversion_cycle.days_payable_outstanding
              ) : 0}
            </p>
            <p className="text-xs text-muted-foreground">
              Days (lower is better)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-6 h-6 text-purple-600" />
              <span className="text-sm font-medium">Data Quality</span>
            </div>
            <p className={`text-2xl font-bold ${getHealthColor(forecastData?.dataQuality || 0, 80, 60)}'}>
              {forecastData ? '${forecastData.dataQuality}%' : '0%'}
            </p>
            <p className="text-xs text-muted-foreground">
              Forecast reliability
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="forecast">Cash Flow Forecast</TabsTrigger>
          <TabsTrigger value="working-capital">Working Capital</TabsTrigger>
          <TabsTrigger value="scenarios">Scenario Analysis</TabsTrigger>
          <TabsTrigger value="insights">Insights & Alerts</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="forecast" className="space-y-6">
          {/* Cash Flow Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="w-5 h-5" />
                {selectedPeriod}-Month Cash Flow Projection
              </CardTitle>
              <CardDescription>
                Monthly cash inflows, outflows, and cumulative position forecast
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                  <p className="text-muted-foreground">Loading cash flow data...</p>
                </div>
              ) : forecastData ? (
                <div className="space-y-6">
                  {/* Mock Chart Area */}
                  <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                    <div className="text-center">
                      <LineChart className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p className="text-gray-500">Cash Flow Chart</p>
                      <p className="text-sm text-gray-400">Interactive forecast visualization would appear here</p>
                    </div>
                  </div>

                  {/* Forecast Summary Table */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Monthly Breakdown</h4>
                    <div className="max-h-96 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="text-left p-2">Month</th>
                            <th className="text-right p-2">Projected Inflows</th>
                            <th className="text-right p-2">Projected Outflows</th>
                            <th className="text-right p-2">Net Flow</th>
                            <th className="text-right p-2">Cumulative Cash</th>
                            <th className="text-center p-2">Confidence</th>
                          </tr>
                        </thead>
                        <tbody>
                          {forecastData.forecastPeriods.map((period) => (
                            <tr key={period.month} className="border-b hover:bg-gray-50">
                              <td className="p-2">Month {period.month}</td>
                              <td className="text-right p-2 text-green-600">
                                {formatCurrency(period.projected_inflows)}
                              </td>
                              <td className="text-right p-2 text-red-600">
                                {formatCurrency(period.projected_outflows)}
                              </td>
                              <td className={'text-right p-2 font-medium ${
                                period.net_flow >= 0 ? 'text-green-600' : 'text-red-600'
                              }'}>
                                {formatCurrency(period.net_flow)}
                              </td>
                              <td className={'text-right p-2 font-medium ${
                                period.cumulative_cash >= 0 ? 'text-blue-600' : 'text-red-600'
                              }'}>
                                {formatCurrency(period.cumulative_cash)}
                              </td>
                              <td className="text-center p-2">
                                <Badge variant="outline" className={
                                  period.confidence_level >= 80 ? 'border-green-200 text-green-800' :
                                  period.confidence_level >= 60 ? 'border-yellow-200 text-yellow-800' :
                                  'border-red-200 text-red-800'
                                }>
                                  {period.confidence_level}%
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-medium mb-2">No Forecast Data Available</h3>
                  <p className="text-muted-foreground mb-4">
                    Generate a cash flow forecast to see projections
                  </p>
                  <Button onClick={loadCashFlowData}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Load Forecast
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="working-capital" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Working Capital Metrics</CardTitle>
                <CardDescription>Key liquidity and efficiency ratios</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {workingCapitalData ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Working Capital</span>
                      <span className={'font-medium ${workingCapitalData.working_capital >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(workingCapitalData.working_capital)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Current Ratio</span>
                      <span className={`font-medium ${getHealthColor(workingCapitalData.current_ratio, 2.0, 1.5)}`}>
                        {workingCapitalData.current_ratio.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Quick Ratio</span>
                      <span className={`font-medium ${getHealthColor(workingCapitalData.quick_ratio, 1.5, 1.0)}`}>
                        {workingCapitalData.quick_ratio.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Working Capital Ratio</span>
                      <span className={`font-medium ${getHealthColor(workingCapitalData.working_capital_ratio, 2.0, 1.5)}'}>
                        {workingCapitalData.working_capital_ratio.toFixed(2)}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">Loading working capital data...</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cash Conversion Cycle</CardTitle>
                <CardDescription>How quickly you convert investments to cash</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {workingCapitalData ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Days Sales Outstanding (DSO)</span>
                      <span className="font-medium">
                        {Math.round(workingCapitalData.cash_conversion_cycle.days_sales_outstanding)} days
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Days Inventory Outstanding (DIO)</span>
                      <span className="font-medium">
                        {Math.round(workingCapitalData.cash_conversion_cycle.days_inventory_outstanding)} days
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Days Payable Outstanding (DPO)</span>
                      <span className="font-medium">
                        {Math.round(workingCapitalData.cash_conversion_cycle.days_payable_outstanding)} days
                      </span>
                    </div>
                    <hr />
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Cycle</span>
                      <span className={'font-bold ${getHealthColor(
                        workingCapitalData.cash_conversion_cycle.days_sales_outstanding +
                        workingCapitalData.cash_conversion_cycle.days_inventory_outstanding -
                        workingCapitalData.cash_conversion_cycle.days_payable_outstanding,
                        30, 60
                      )}'}>
                        {Math.round(
                          workingCapitalData.cash_conversion_cycle.days_sales_outstanding +
                          workingCapitalData.cash_conversion_cycle.days_inventory_outstanding -
                          workingCapitalData.cash_conversion_cycle.days_payable_outstanding
                        )} days
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">Loading cycle data...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Working Capital Trend Analysis</CardTitle>
              <CardDescription>Historical working capital performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-500">Working Capital Trend Chart</p>
                  <p className="text-sm text-gray-400">Historical working capital analysis would appear here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scenario Analysis</CardTitle>
              <CardDescription>
                Compare different business scenarios and their impact on cash flow
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {scenarios.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {scenarios.map((scenario, index) => (
                    <Card key={index} className="relative">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{scenario.scenario_name}</h4>
                          <Badge variant="outline">{scenario.probability}%</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          {scenario.description}
                        </p>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Revenue:</span>
                            <span className={scenario.revenue_growth >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {scenario.revenue_growth > 0 ? '+' : '}{scenario.revenue_growth}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Expenses:</span>
                            <span className={scenario.expense_growth <= 0 ? 'text-green-600' : 'text-red-600'}>
                              {scenario.expense_growth > 0 ? '+' : '}{scenario.expense_growth}%
                            </span>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full mt-4"
                          onClick={() => setSelectedScenario(scenario.scenario_name.toLowerCase().replace(' ', '_'))}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Impact
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <PieChart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-medium mb-2">No Scenarios Available</h3>
                  <p className="text-muted-foreground mb-4">
                    Generate an advanced forecast to see scenario analysis
                  </p>
                  <Button onClick={handleGenerateAdvancedForecast}>
                    <Calculator className="w-4 h-4 mr-2" />
                    Generate Scenarios
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  Key Insights
                </CardTitle>
                <CardDescription>Important observations from your cash flow analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Strong cash position projected for the next 6 months with consistent positive flow
                  </AlertDescription>
                </Alert>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Working capital ratio below industry benchmark - consider optimizing inventory levels
                  </AlertDescription>
                </Alert>
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Days sales outstanding within target range, indicating efficient collections
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-600" />
                  Recommended Actions
                </CardTitle>
                <CardDescription>Prioritized recommendations to improve cash flow</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-sm">Optimize Payment Terms</h4>
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-200">High Priority</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Negotiate better payment terms with suppliers to extend DPO by 10 days
                  </p>
                  <p className="text-xs text-green-600">Potential impact: +$15,000 cash flow</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-sm">Improve Collections</h4>
                    <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Medium Priority</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Implement automated follow-up for overdue invoices
                  </p>
                  <p className="text-xs text-green-600">Potential impact: +$8,000 cash flow</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-sm">Review Inventory Levels</h4>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Low Priority</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Reduce excess inventory to free up working capital
                  </p>
                  <p className="text-xs text-green-600">Potential impact: +$5,000 cash flow</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cash Flow Optimization Plan</CardTitle>
              <CardDescription>
                Comprehensive strategies to improve cash flow and working capital efficiency
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-red-600" />
                    Immediate Actions (Next 30 Days)
                  </h4>
                  <div className="space-y-2 pl-6">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Set up automated invoice reminders</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm">Review and collect overdue receivables</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm">Negotiate extended payment terms with key suppliers</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-yellow-600" />
                    Medium-term Initiatives (30-90 Days)
                  </h4>
                  <div className="space-y-2 pl-6">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm">Implement inventory optimization system</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm">Set up line of credit for cash flow smoothing</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm">Review pricing strategy for margin improvement</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-600" />
                    Long-term Strategy (3-12 Months)
                  </h4>
                  <div className="space-y-2 pl-6">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm">Develop recurring revenue streams</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm">Implement advanced cash flow forecasting</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm">Explore invoice factoring for immediate cash</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-medium mb-2 text-blue-800">Projected Impact</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-blue-600 font-medium">Cash Flow Improvement</p>
                      <p className="text-2xl font-bold text-blue-800">+$28,000</p>
                    </div>
                    <div>
                      <p className="text-blue-600 font-medium">Working Capital Efficiency</p>
                      <p className="text-2xl font-bold text-blue-800">+15%</p>
                    </div>
                    <div>
                      <p className="text-blue-600 font-medium">Cash Conversion Cycle</p>
                      <p className="text-2xl font-bold text-blue-800">-12 Days</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}