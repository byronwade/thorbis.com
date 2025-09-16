"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { 
  TrendingUp, 
  TrendingDown,
  Activity, 
  DollarSign, 
  Users, 
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Calendar,
  RefreshCw,
  Download,
  Settings,
  MoreHorizontal,
  Maximize2,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  LineChart,
  PieChart,
  Zap,
  Store,
  ShoppingCart,
  Package,
  Timer,
  Star,
  MapPin,
  Phone,
  Calendar as CalendarIcon,
  Truck,
  UserCheck,
  Percent,
  FileText,
  Shield,
  CreditCard,
  Tag,
  ShoppingBag,
  Eye,
  Heart,
  ThumbsUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TradingViewWrapper, TradingViewChartData } from "@/components/analytics/advanced-charts/trading-view-wrapper";
import chartsModule from "@/lib/analytics/charts.js";

// Import our enhanced chart components
import { 
  EnhancedLineChart,
  ModernBarChart,
  ModernDoughnutChart
} from '@/components/analytics/chart-components';

import {
  SparkLine,
  TrendIndicator,
  ActivityPulse,
  MetricGrid,
  StatusDots,
  DataFlowViz,
  SystemHealthMatrix,
  PerformanceRing
} from '@/components/analytics/abstract-visualizations';

export default function RetailAnalyticsPlatform() {
  const searchParams = useSearchParams();
  const region = searchParams.get('region') || 'all';

  // State management for retail dashboard
  const [isRealTimeActive, setIsRealTimeActive] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [dashboardData, setDashboardData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const realTimeStreamRef = useRef(null);
  
  // Initialize dashboard data on component mount
  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      
      // Generate retail specific data
      const retailGenerator = chartsModule.generators.retail || chartsModule.generators.financial;
      const rawData = retailGenerator(30, true);
      
      // Process data for retail KPIs
      setDashboardData({
        sales: rawData.revenue || [],
        transactions: rawData.volume || rawData.transactions || [],
        customerTraffic: rawData.customers || rawData.visits || [],
        technicalData: chartsModule.formatters.candlestick(rawData.revenue || [], 0.18),
        volumeData: chartsModule.formatters.histogram(rawData.volume || rawData.transactions || [], 0.24),
        indicators: chartsModule.formatters.technicalIndicators(rawData.revenue || [], {
          smaLength: 7,
          emaLength: 14,
          addBollingerBands: true,
          addRSI: true
        })
      });
      
      setIsLoading(false);
    };
    
    loadDashboardData();
  }, [region]);
  
  // Real-time data streaming for transactions
  useEffect(() => {
    if (isRealTimeActive) {
      realTimeStreamRef.current = new chartsModule.realTime('retail', 3000);
      
      realTimeStreamRef.current.subscribe('transactions', (dataPoint) => {
        setDashboardData(prev => ({
          ...prev,
          transactions: [...prev.transactions.slice(-29), dataPoint]
        }));
      });
      
      return () => {
        if (realTimeStreamRef.current) {
          realTimeStreamRef.current.stop();
        }
      };
    }
  }, [isRealTimeActive]);

  // Retail specific data
  const productCategoryData = [
    {
      category: 'Electronics',
      revenue: '$245,890',
      units: 1247,
      avgPrice: '$197.20',
      margin: '28.5%',
      turnover: '6.2x/year',
      topProduct: 'Wireless Earbuds',
      color: 'text-blue-400'
    },
    {
      category: 'Clothing',
      revenue: '$189,450',
      units: 3421,
      avgPrice: '$55.38',
      margin: '65.7%',
      turnover: '8.9x/year',
      topProduct: 'Designer Jeans',
      color: 'text-purple-400'
    },
    {
      category: 'Home & Garden',
      revenue: '$134,680',
      units: 987,
      avgPrice: '$136.50',
      margin: '45.2%',
      turnover: '4.8x/year',
      topProduct: 'Garden Tools',
      color: 'text-green-400'
    },
    {
      category: 'Health & Beauty',
      revenue: '$98,320',
      units: 2156,
      avgPrice: '$45.60',
      margin: '78.3%',
      turnover: '12.4x/year',
      topProduct: 'Skincare Set',
      color: 'text-pink-400'
    }
  ];

  const staffPerformanceData = [
    {
      name: 'Ashley Johnson',
      role: 'Sales Associate',
      department: 'Electronics',
      transactions: 234,
      revenue: '$28,450',
      conversionRate: '32.8%',
      avgTransaction: '$121.58',
      customerRating: 4.9,
      hoursWorked: 168
    },
    {
      name: 'Marcus Williams',
      role: 'Department Manager',
      department: 'Clothing',
      transactions: 189,
      revenue: '$34,890',
      conversionRate: '29.4%',
      avgTransaction: '$184.60',
      customerRating: 4.8,
      hoursWorked: 172
    },
    {
      name: 'Sofia Rodriguez',
      role: 'Sales Associate',
      department: 'Home & Garden',
      transactions: 156,
      revenue: '$21,340',
      conversionRate: '31.2%',
      avgTransaction: '$136.80',
      customerRating: 4.7,
      hoursWorked: 160
    },
    {
      name: 'David Kim',
      role: 'Cashier',
      department: 'All Departments',
      transactions: 287,
      revenue: '$15,670',
      conversionRate: '45.6%',
      avgTransaction: '$54.60',
      customerRating: 4.6,
      hoursWorked: 165
    }
  ];

  const customerBehaviorData = [
    {
      segment: 'Premium Shoppers',
      count: 1247,
      avgSpend: '$287',
      frequency: '2.3x/month',
      lifetime: '$3,450',
      satisfaction: 4.9,
      growthRate: '+12.4%'
    },
    {
      segment: 'Regular Customers',
      count: 3421,
      avgSpend: '$89',
      frequency: '1.8x/month',
      lifetime: '$1,230',
      satisfaction: 4.6,
      growthRate: '+8.7%'
    },
    {
      segment: 'Occasional Buyers',
      count: 2156,
      avgSpend: '$54',
      frequency: '0.9x/month',
      lifetime: '$340',
      satisfaction: 4.3,
      growthRate: '+5.2%'
    },
    {
      segment: 'New Customers',
      count: 987,
      avgSpend: '$73',
      frequency: '0.5x/month',
      lifetime: '$73',
      satisfaction: 4.4,
      growthRate: '+18.9%'
    }
  ];

  const inventoryMetrics = [
    { item: 'Wireless Earbuds Pro', stock: 234, sold: 89, turnover: '15.2x/year', margin: '32%', trend: 'up' },
    { item: 'Designer Jeans', stock: 156, sold: 67, turnover: '12.8x/year', margin: '68%', trend: 'up' },
    { item: 'Smart Watch Series', stock: 89, sold: 45, turnover: '18.4x/year', margin: '28%', trend: 'down' },
    { item: 'Garden Tool Set', stock: 67, sold: 23, turnover: '8.7x/year', margin: '45%', trend: 'up' },
    { item: 'Skincare Essentials', stock: 123, sold: 78, turnover: '24.6x/year', margin: '82%', trend: 'up' }
  ];

  const storeMetrics = [
    { store: 'Downtown Main', sales: '$45,890', transactions: 1247, conversion: '34.2%', traffic: 3650, avgBasket: '$36.80' },
    { store: 'Mall Location', sales: '$38,450', transactions: 987, conversion: '28.9%', traffic: 3420, avgBasket: '$38.95' },
    { store: 'Suburban Plaza', sales: '$32,170', transactions: 834, conversion: '31.5%', traffic: 2650, avgBasket: '$38.57' },
    { store: 'Shopping Center', sales: '$28,760', transactions: 698, conversion: '29.8%', traffic: 2340, avgBasket: '$41.20' }
  ];

  const paymentMethodData = [
    { method: 'Credit Card', percentage: 45.2, transactions: 1247, avgAmount: '$89.50' },
    { method: 'Debit Card', percentage: 28.7, transactions: 789, avgAmount: '$65.20' },
    { method: 'Cash', percentage: 15.8, transactions: 434, avgAmount: '$42.30' },
    { method: 'Mobile Pay', percentage: 8.9, transactions: 245, avgAmount: '$78.90' },
    { method: 'Gift Cards', percentage: 1.4, transactions: 38, avgAmount: '$56.70' }
  ];

  // Generate sample data for abstract visualizations
  const generateSparkData = (count: number) => 
    Array.from({ length: count }, (_, i) => ({
      time: Date.now() - (count - i) * 86400000,
      value: 30 + Math.random() * 70
    }));

  const abstractData = {
    sparklines: [
      generateSparkData(15),
      generateSparkData(15),
      generateSparkData(15)
    ],
    performanceMetrics: [
      { label: 'Sales Performance', value: 92, maxValue: 100, color: '#10b981' },
      { label: 'Customer Satisfaction', value: 88, maxValue: 100, color: '#1C8BFF' },
      { label: 'Inventory Turnover', value: 85, maxValue: 100, color: '#f59e0b' }
    ],
    systemHealth: [
      { name: 'POS Systems', metrics: [98, 97, 99, 96] },
      { name: 'Inventory Management', metrics: [94, 96, 93, 95] },
      { name: 'Customer Analytics', metrics: [91, 89, 92, 90] }
    ],
    dataFlows: [
      { from: 'Customers', to: 'Transactions', volume: 2840, color: '#10b981' },
      { from: 'Inventory', to: 'Sales', volume: 2650, color: '#1C8BFF' },
      { from: 'Sales', to: 'Revenue', volume: 2580, color: '#f59e0b' }
    ]
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-neutral-950 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-purple-500 rounded-full animate-pulse" />
          <span className="text-neutral-400">Loading Retail analytics...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Fixed Analytics Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-neutral-900/95 backdrop-blur border-b border-neutral-800">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Store className="h-4 w-4 text-purple-400" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-neutral-100">Retail Analytics</h1>
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <span className="capitalize">Retail Intelligence Platform</span>
                <div className="w-1 h-1 bg-neutral-600 rounded-full" />
                <span>Multi-Store Analytics</span>
                <div className="w-1 h-1 bg-neutral-600 rounded-full" />
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                  <span className="text-purple-400">Live Transactions</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedTimeframe('7d')}
            className={'px-3 py-1.5 text-xs rounded-md transition-colors ${
              selectedTimeframe === '7d'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-300'
            }'}
          >
            7D
          </button>
          <button
            onClick={() => setSelectedTimeframe('30d')}
            className={'px-3 py-1.5 text-xs rounded-md transition-colors ${
              selectedTimeframe === '30d'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-300'
            }'}
          >
            30D
          </button>
          <button
            onClick={() => setSelectedTimeframe('90d')}
            className={'px-3 py-1.5 text-xs rounded-md transition-colors ${
              selectedTimeframe === '90d'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-300'
            }'}
          >
            90D
          </button>
          
          <div className="w-px h-4 bg-neutral-700 mx-2" />
          
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

      {/* Main Scrollable Content */}
      <div className="overflow-y-auto">
        {/* Retail KPIs */}
        <div className="px-8 py-6 bg-neutral-950">
          <div className="grid grid-cols-4 gap-6">
            {/* Daily Sales */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium text-neutral-300">Daily Sales</span>
                <div className="flex items-center gap-1 text-xs text-green-400">
                  <ArrowUpRight className="h-3 w-3" />
                  +18.4%
                </div>
              </div>
              <div className="text-3xl font-bold text-green-400">$34,670</div>
              <div className="text-xs text-neutral-500 mb-3">Today</div>
              <SparkLine 
                data={abstractData.sparklines[0]} 
                width={120} 
                height={24} 
                color="#10b981"
              />
            </div>

            {/* Transactions */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingCart className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-neutral-300">Transactions</span>
                <div className="flex items-center gap-1 text-xs text-green-400">
                  <ArrowUpRight className="h-3 w-3" />
                  +11.2%
                </div>
              </div>
              <div className="text-3xl font-bold text-blue-400">287</div>
              <div className="text-xs text-neutral-500 mb-3">Today</div>
              <div className="w-full bg-neutral-800 rounded-full h-2">
                <div className="bg-blue-400 h-2 rounded-full transition-all duration-1000" style={{ width: '82%' }}></div>
              </div>
            </div>

            {/* Average Basket */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingBag className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-medium text-neutral-300">Avg Basket</span>
                <div className="flex items-center gap-1 text-xs text-green-400">
                  <ArrowUpRight className="h-3 w-3" />
                  +7.8%
                </div>
              </div>
              <div className="text-3xl font-bold text-yellow-400">$120.80</div>
              <div className="text-xs text-neutral-500 mb-3">Per transaction</div>
              <SparkLine 
                data={abstractData.sparklines[1]} 
                width={120} 
                height={24} 
                color="#f59e0b"
              />
            </div>

            {/* Conversion Rate */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-medium text-neutral-300">Conversion Rate</span>
                <div className="flex items-center gap-1 text-xs text-green-400">
                  <ArrowUpRight className="h-3 w-3" />
                  +3.2%
                </div>
              </div>
              <div className="text-3xl font-bold text-purple-400">31.4%</div>
              <div className="text-xs text-neutral-500 mb-3">Visitors to buyers</div>
              <div className="w-full bg-neutral-800 rounded-full h-2">
                <div className="bg-purple-400 h-2 rounded-full" style={{ width: '31%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Sales Performance Chart - Full Width */}
        <div className="w-full bg-neutral-950 relative">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-purple-400" />
                <h3 className="text-lg font-medium text-neutral-100">Sales Performance & Transaction Flow</h3>
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">Live POS Data</Badge>
              </div>
            </div>
          </div>
          <div className="h-96 w-full pointer-events-auto">
            {dashboardData.sales && (
              <TradingViewWrapper
                data={dashboardData.sales as TradingViewChartData[]}
                type="area"
                height="100%"
                theme="dark"
                className="w-full"
                showTimeScale={false}
                showPriceScale={true}
              />
            )}
          </div>
        </div>

        {/* Retail Analytics Sections */}
        <div className="space-y-8 px-8 py-6 bg-neutral-950">
          
          {/* Product Category Performance */}
          <div className="bg-neutral-900/50 border border-neutral-800 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Package className="h-4 w-4 text-amber-400" />
              <h3 className="text-lg font-medium text-neutral-100">Product Category Performance</h3>
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">Category Analysis</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-800">
                    <th className="text-left py-3 px-4 font-medium text-neutral-300">Category</th>
                    <th className="text-right py-3 px-4 font-medium text-neutral-300">Revenue</th>
                    <th className="text-right py-3 px-4 font-medium text-neutral-300">Units Sold</th>
                    <th className="text-right py-3 px-4 font-medium text-neutral-300">Avg Price</th>
                    <th className="text-right py-3 px-4 font-medium text-neutral-300">Margin</th>
                    <th className="text-right py-3 px-4 font-medium text-neutral-300">Turnover</th>
                    <th className="text-right py-3 px-4 font-medium text-neutral-300">Top Product</th>
                  </tr>
                </thead>
                <tbody>
                  {productCategoryData.map((category, index) => (
                    <tr key={index} className="border-b border-neutral-800/50">
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <div className={'h-3 w-3 rounded-full mr-3 ${
                            category.category === 'Electronics' ? 'bg-blue-500' :
                            category.category === 'Clothing' ? 'bg-purple-500' :
                            category.category === 'Home & Garden' ? 'bg-green-500' : 'bg-pink-500'
                          }'}></div>
                          <span className="text-white font-medium">{category.category}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right text-white">{category.revenue}</td>
                      <td className="py-4 px-4 text-right text-neutral-300">{category.units}</td>
                      <td className="py-4 px-4 text-right text-neutral-300">{category.avgPrice}</td>
                      <td className="py-4 px-4 text-right">
                        <span className={'${
                          parseFloat(category.margin) > 60 ? 'text-green-400' : 
                          parseFloat(category.margin) > 40 ? 'text-yellow-400' : 'text-red-400'
                        }'}>
                          {category.margin}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right text-neutral-300">{category.turnover}</td>
                      <td className="py-4 px-4 text-right text-neutral-300">{category.topProduct}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Staff Performance and Customer Behavior */}
          <div className="grid grid-cols-2 gap-6">
            {/* Staff Performance */}
            <div className="bg-neutral-900/50 border border-neutral-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-medium text-neutral-100">Staff Performance</h3>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">Top Performers</Badge>
              </div>
              <div className="space-y-4">
                {staffPerformanceData.map((staff, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-neutral-800/30 rounded-lg">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium text-sm mr-3">
                        {staff.name.split(' ').map(n => n[0]).join(')}
                      </div>
                      <div>
                        <div className="text-white font-medium">{staff.name}</div>
                        <div className="text-sm text-neutral-400">{staff.role} • {staff.department}</div>
                        <div className="text-xs text-neutral-500">
                          Conv: {staff.conversionRate} • {staff.hoursWorked}h
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-medium">{staff.revenue}</div>
                      <div className="text-sm text-neutral-400">{staff.transactions} sales • {staff.avgTransaction} avg</div>
                      <div className="text-xs text-emerald-400 flex items-center justify-end gap-1">
                        <Star className="h-3 w-3" />
                        {staff.customerRating}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Behavior */}
            <div className="bg-neutral-900/50 border border-neutral-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <UserCheck className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-medium text-neutral-100">Customer Segments</h3>
                <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-xs">Behavioral Analysis</Badge>
              </div>
              <div className="space-y-4">
                {customerBehaviorData.map((segment, index) => (
                  <div key={index} className="p-4 bg-neutral-800/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-neutral-100">{segment.segment}</div>
                      <div className={'text-sm ${segment.growthRate.startsWith('+') ? 'text-green-400' : 'text-red-400'}'}>
                        {segment.growthRate}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-neutral-400">Customers: <span className="text-white">{segment.count}</span></div>
                        <div className="text-neutral-400">Avg Spend: <span className="text-white">{segment.avgSpend}</span></div>
                        <div className="text-neutral-400">Frequency: <span className="text-white">{segment.frequency}</span></div>
                      </div>
                      <div>
                        <div className="text-neutral-400">LTV: <span className="text-white">{segment.lifetime}</span></div>
                        <div className="text-neutral-400 flex items-center gap-1">
                          Rating: <Star className="h-3 w-3 text-yellow-400" /> <span className="text-white">{segment.satisfaction}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Store Comparison and Inventory */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-neutral-900/50 border border-neutral-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-4 w-4 text-blue-400" />
                <h3 className="text-sm font-medium text-neutral-100">Store Performance Comparison</h3>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">Multi-Location</Badge>
              </div>
              <div className="space-y-3">
                {storeMetrics.map((store, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-neutral-800/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded bg-blue-500/10 flex items-center justify-center text-xs font-medium text-blue-400">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-neutral-100">{store.store}</div>
                        <div className="text-sm text-neutral-400">{store.transactions} sales • {store.conversion} conv</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-neutral-100">{store.sales}</div>
                      <div className="text-sm text-neutral-400">{store.avgBasket} avg basket</div>
                      <div className="text-xs text-neutral-500">{store.traffic} visitors</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-neutral-900/50 border border-neutral-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Package className="h-4 w-4 text-orange-400" />
                <h3 className="text-sm font-medium text-neutral-100">Top Inventory Items</h3>
                <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">Stock Performance</Badge>
              </div>
              <div className="space-y-3">
                {inventoryMetrics.map((item, index) => (
                  <div key={index} className="p-3 bg-neutral-800/20 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-neutral-100">{item.item}</div>
                      <div className={'flex items-center gap-1 text-xs ${item.trend === 'up' ? 'text-green-400' : 'text-red-400'}'}>
                        {item.trend === 'up` ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {item.margin} margin
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-neutral-400">Stock: {item.stock} • Sold: {item.sold}</div>
                      <div className="text-sm text-neutral-400">{item.turnover}</div>
                    </div>
                    <div className="w-full bg-neutral-700 rounded-full h-1.5">
                      <div className="bg-orange-400 h-1.5 rounded-full" style={{ width: `${Math.min((item.sold / item.stock) * 100, 100)}%' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Methods and Sales Distribution */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-neutral-900/50 border border-neutral-800">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="h-4 w-4 text-green-400" />
                  <h3 className="text-sm font-medium text-neutral-100">Payment Method Distribution</h3>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">Transaction Analysis</Badge>
                </div>
                <div className="space-y-3">
                  {paymentMethodData.map((method, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-neutral-800/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-medium text-neutral-100">{method.method}</div>
                        <div className="text-xs text-neutral-400">{method.transactions} txns</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-sm text-neutral-300">{method.avgAmount} avg</div>
                        <div className="w-12 text-right">
                          <div className="text-sm font-medium text-neutral-100">{method.percentage}%</div>
                          <div className="w-full bg-neutral-700 rounded-full h-1">
                            <div className="bg-green-400 h-1 rounded-full" style={{ width: '${method.percentage}%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-neutral-900/50 border border-neutral-800">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <PieChart className="h-4 w-4 text-purple-400" />
                  <h3 className="text-sm font-medium text-neutral-100">Sales Channel Distribution</h3>
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">Channel Analysis</Badge>
                </div>
                {dashboardData.customerTraffic && (
                  <ModernDoughnutChart
                    data={dashboardData.customerTraffic.slice(-6)}
                    segments={['In-Store', 'Online', 'Mobile App', 'Phone Orders', 'Curbside', 'Other']}
                    height={240}
                  />
                )}
              </div>
            </div>
          </div>

          {/* System Health and Operations Flow */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-neutral-900/50 border border-neutral-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="h-4 w-4 text-purple-400" />
                <h3 className="text-sm font-medium text-neutral-100">System Health</h3>
              </div>
              <SystemHealthMatrix systems={abstractData.systemHealth} />
            </div>

            <div className="bg-neutral-900/50 border border-neutral-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-medium text-neutral-100">Sales Flow</h3>
              </div>
              <DataFlowViz flows={abstractData.dataFlows} />
            </div>

            <div className="bg-neutral-900/50 border border-neutral-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-4 w-4 text-orange-400" />
                <h3 className="text-sm font-medium text-neutral-100">Store Performance</h3>
              </div>
              <div className="flex items-center justify-center h-32">
                <PerformanceRing 
                  metrics={abstractData.performanceMetrics}
                  size={120}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-neutral-900/50 border-t border-neutral-800 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
            <span className="text-neutral-400">POS Systems: </span>
            <span className="text-purple-400">All Online</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-neutral-400">Transactions Today: </span>
            <span className="text-neutral-300">287 processed</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-neutral-400">Store Traffic: </span>
            <span className="text-neutral-300">1,247 visitors</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-neutral-400">Avg Basket: </span>
            <span className="text-emerald-400">$120.80</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-neutral-400">Conversion Rate: </span>
            <span className="text-yellow-300">31.4%</span>
          </div>
          <button className="flex items-center gap-1 text-neutral-400 hover:text-neutral-100 transition-colors">
            <RefreshCw className="h-3 w-3" />
            Update Now
          </button>
        </div>
      </div>
    </div>
  );
}