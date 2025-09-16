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
  ChefHat,
  Utensils,
  Timer,
  Star,
  MapPin,
  Phone,
  Calendar as CalendarIcon,
  ShoppingCart,
  Package,
  Truck,
  Thermometer,
  UserCheck,
  Percent,
  TrendingDown as Down
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

export default function RestaurantAnalyticsPlatform() {
  const searchParams = useSearchParams();
  const region = searchParams.get('region') || 'all';

  // State management for restaurant dashboard
  const [isRealTimeActive, setIsRealTimeActive] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [dashboardData, setDashboardData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const realTimeStreamRef = useRef(null);
  
  // Initialize dashboard data on component mount
  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      
      // Generate restaurant specific data
      const restaurantGenerator = chartsModule.generators.restaurant || chartsModule.generators.financial;
      const rawData = restaurantGenerator(30, true);
      
      // Process data for restaurant KPIs
      setDashboardData({
        sales: rawData.revenue || [],
        orders: rawData.volume || rawData.transactions || [],
        customerTraffic: rawData.visits || rawData.customers || [],
        technicalData: chartsModule.formatters.candlestick(rawData.revenue || [], 0.15),
        volumeData: chartsModule.formatters.histogram(rawData.volume || rawData.transactions || [], 0.22),
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
  
  // Real-time data streaming for orders
  useEffect(() => {
    if (isRealTimeActive) {
      realTimeStreamRef.current = new chartsModule.realTime('restaurant', 5000);
      
      realTimeStreamRef.current.subscribe('orders', (dataPoint) => {
        setDashboardData(prev => ({
          ...prev,
          orders: [...prev.orders.slice(-29), dataPoint]
        }));
      });
      
      return () => {
        if (realTimeStreamRef.current) {
          realTimeStreamRef.current.stop();
        }
      };
    }
  }, [isRealTimeActive]);

  // Restaurant specific data
  const menuPerformanceData = [
    {
      category: 'Appetizers',
      revenue: '$45,280',
      orders: 1847,
      avgPrice: '$24.52',
      margin: '78.3%',
      topItem: 'Truffle Arancini',
      popularity: 94,
      color: 'text-amber-400'
    },
    {
      category: 'Entrees',
      revenue: '$156,940',
      orders: 3241,
      avgPrice: '$48.42',
      margin: '65.7%',
      topItem: 'Ribeye Steak',
      popularity: 89,
      color: 'text-red-400'
    },
    {
      category: 'Desserts',
      revenue: '$28,750',
      orders: 1156,
      avgPrice: '$24.87',
      margin: '82.1%',
      topItem: 'Chocolate Lava Cake',
      popularity: 91,
      color: 'text-purple-400'
    },
    {
      category: 'Beverages',
      revenue: '$89,320',
      orders: 4582,
      avgPrice: '$19.50',
      margin: '89.4%',
      topItem: 'Craft Cocktails',
      popularity: 96,
      color: 'text-blue-400'
    }
  ];

  const staffPerformanceData = [
    {
      name: 'Maria Gonzalez',
      role: 'Server',
      shift: 'Dinner',
      tables: 28,
      revenue: '$3,840',
      avgCheck: '$137',
      rating: 4.9,
      tips: '$576',
      efficiency: '96.2%'
    },
    {
      name: 'James Wilson',
      role: 'Bartender',
      shift: 'Evening',
      tables: 45,
      revenue: '$2,970',
      avgCheck: '$66',
      rating: 4.8,
      tips: '$445',
      efficiency: '94.1%'
    },
    {
      name: 'Sarah Chen',
      role: 'Server',
      shift: 'Lunch',
      tables: 32,
      revenue: '$2,240',
      avgCheck: '$70',
      rating: 4.7,
      tips: '$336',
      efficiency: '92.8%'
    },
    {
      name: 'Michael Torres',
      role: 'Server',
      shift: 'Brunch',
      tables: 24,
      revenue: '$1,920',
      avgCheck: '$80',
      rating: 4.6,
      tips: '$288',
      efficiency: '91.5%'
    }
  ];

  const kitchenMetrics = [
    { metric: 'Avg Prep Time', value: '14 min', trend: 'down', change: '-8%', color: 'text-green-400' },
    { metric: 'Order Accuracy', value: '96.8%', trend: 'up', change: '+2.1%', color: 'text-emerald-400' },
    { metric: 'Food Waste', value: '3.2%', trend: 'down', change: '-0.8%', color: 'text-green-400' },
    { metric: 'Ticket Time', value: '18 min', trend: 'down', change: '-5%', color: 'text-green-400' },
    { metric: 'Food Cost %', value: '28.5%', trend: 'up', change: '+1.2%', color: 'text-yellow-400' },
    { metric: 'Labor Cost %', value: '32.1%', trend: 'down', change: '-2.3%', color: 'text-green-400' }
  ];

  const tableAnalytics = [
    { table: 'Table 12', turns: 8, revenue: '$1,240', avgParty: 3.2, avgTime: '85 min', satisfaction: 4.9 },
    { table: 'Table 8', turns: 7, revenue: '$1,165', avgParty: 2.8, avgTime: '92 min', satisfaction: 4.8 },
    { table: 'Table 15', turns: 6, revenue: '$1,080', avgParty: 4.1, avgTime: '105 min', satisfaction: 4.7 },
    { table: 'Table 5', turns: 7, revenue: '$980', avgParty: 2.4, avgTime: '78 min', satisfaction: 4.8 },
    { table: 'Table 22', turns: 5, revenue: '$920', avgParty: 3.8, avgTime: '118 min', satisfaction: 4.6 }
  ];

  const peakHoursData = [
    { hour: '11:00', orders: 45, revenue: '$1,980', staff: 8, avgWait: '12 min' },
    { hour: '12:00', orders: 89, revenue: '$4,230', staff: 12, avgWait: '18 min' },
    { hour: '13:00', orders: 76, revenue: '$3,610', staff: 12, avgWait: '15 min' },
    { hour: '18:00', orders: 134, revenue: '$8,240', staff: 18, avgWait: '25 min' },
    { hour: '19:00', orders: 156, revenue: '$9,480', staff: 20, avgWait: '32 min' },
    { hour: '20:00', orders: 142, revenue: '$8,970', staff: 20, avgWait: '28 min' }
  ];

  // Generate sample data for abstract visualizations
  const generateSparkData = (count: number) => 
    Array.from({ length: count }, (_, i) => ({
      time: Date.now() - (count - i) * 86400000,
      value: 35 + Math.random() * 65
    }));

  const abstractData = {
    sparklines: [
      generateSparkData(15),
      generateSparkData(15),
      generateSparkData(15)
    ],
    performanceMetrics: [
      { label: 'Service Quality', value: 91, maxValue: 100, color: '#10b981' },
      { label: 'Kitchen Efficiency', value: 87, maxValue: 100, color: '#1C8BFF' },
      { label: 'Customer Satisfaction', value: 94, maxValue: 100, color: '#f59e0b' }
    ],
    systemHealth: [
      { name: 'POS System', metrics: [98, 96, 99, 97] },
      { name: 'Kitchen Display', metrics: [94, 97, 95, 96] },
      { name: 'Online Orders', metrics: [92, 89, 93, 91] }
    ],
    dataFlows: [
      { from: 'Orders', to: 'Kitchen', volume: 2340, color: '#10b981' },
      { from: 'Kitchen', to: 'Service', volume: 2280, color: '#1C8BFF' },
      { from: 'Service', to: 'Payment', volume: 2250, color: '#f59e0b' }
    ]
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-neutral-950 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-red-500 rounded-full animate-pulse" />
          <span className="text-neutral-400">Loading Restaurant analytics...</span>
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
            <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
              <ChefHat className="h-4 w-4 text-red-400" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-neutral-100">Restaurant Analytics</h1>
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <span className="capitalize">Food Service Intelligence</span>
                <div className="w-1 h-1 bg-neutral-600 rounded-full" />
                <span>Kitchen & Service Analytics</span>
                <div className="w-1 h-1 bg-neutral-600 rounded-full" />
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-red-400">Live Orders</span>
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
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-300'
            }'}
          >
            7D
          </button>
          <button
            onClick={() => setSelectedTimeframe('30d')}
            className={'px-3 py-1.5 text-xs rounded-md transition-colors ${
              selectedTimeframe === '30d'
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-300'
            }'}
          >
            30D
          </button>
          <button
            onClick={() => setSelectedTimeframe('90d')}
            className={'px-3 py-1.5 text-xs rounded-md transition-colors ${
              selectedTimeframe === '90d'
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
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
        {/* Restaurant KPIs */}
        <div className="px-8 py-6 bg-neutral-950">
          <div className="grid grid-cols-4 gap-6">
            {/* Daily Sales */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium text-neutral-300">Daily Sales</span>
                <div className="flex items-center gap-1 text-xs text-green-400">
                  <ArrowUpRight className="h-3 w-3" />
                  +12.3%
                </div>
              </div>
              <div className="text-3xl font-bold text-green-400">$18,450</div>
              <div className="text-xs text-neutral-500 mb-3">Today</div>
              <SparkLine 
                data={abstractData.sparklines[0]} 
                width={120} 
                height={24} 
                color="#10b981"
              />
            </div>

            {/* Table Turnover */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <RefreshCw className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-neutral-300">Table Turnover</span>
                <div className="flex items-center gap-1 text-xs text-green-400">
                  <ArrowUpRight className="h-3 w-3" />
                  +5.8%
                </div>
              </div>
              <div className="text-3xl font-bold text-blue-400">3.2x</div>
              <div className="text-xs text-neutral-500 mb-3">Per table/day</div>
              <div className="w-full bg-neutral-800 rounded-full h-2">
                <div className="bg-blue-400 h-2 rounded-full transition-all duration-1000" style={{ width: '76%' }}></div>
              </div>
            </div>

            {/* Average Check */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingCart className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-medium text-neutral-300">Avg Check</span>
                <div className="flex items-center gap-1 text-xs text-green-400">
                  <ArrowUpRight className="h-3 w-3" />
                  +3.7%
                </div>
              </div>
              <div className="text-3xl font-bold text-yellow-400">$87.50</div>
              <div className="text-xs text-neutral-500 mb-3">Per customer</div>
              <SparkLine 
                data={abstractData.sparklines[1]} 
                width={120} 
                height={24} 
                color="#f59e0b"
              />
            </div>

            {/* Customer Satisfaction */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-medium text-neutral-300">Customer Rating</span>
                <div className="flex items-center gap-1 text-xs text-green-400">
                  <ArrowUpRight className="h-3 w-3" />
                  +1.9%
                </div>
              </div>
              <div className="text-3xl font-bold text-purple-400">4.7/5</div>
              <div className="text-xs text-neutral-500 mb-3">Average rating</div>
              <div className="w-full bg-neutral-800 rounded-full h-2">
                <div className="bg-purple-400 h-2 rounded-full" style={{ width: '94%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Sales Performance Chart - Full Width */}
        <div className="w-full bg-neutral-950 relative">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-red-400" />
                <h3 className="text-lg font-medium text-neutral-100">Sales Performance & Order Flow</h3>
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">Live Order Data</Badge>
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

        {/* Restaurant Analytics Sections */}
        <div className="space-y-8 px-8 py-6 bg-neutral-950">
          
          {/* Menu Performance */}
          <div className="bg-neutral-900/50 border border-neutral-800 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Utensils className="h-4 w-4 text-amber-400" />
              <h3 className="text-lg font-medium text-neutral-100">Menu Performance Analytics</h3>
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">Category Analysis</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-800">
                    <th className="text-left py-3 px-4 font-medium text-neutral-300">Category</th>
                    <th className="text-right py-3 px-4 font-medium text-neutral-300">Revenue</th>
                    <th className="text-right py-3 px-4 font-medium text-neutral-300">Orders</th>
                    <th className="text-right py-3 px-4 font-medium text-neutral-300">Avg Price</th>
                    <th className="text-right py-3 px-4 font-medium text-neutral-300">Margin</th>
                    <th className="text-right py-3 px-4 font-medium text-neutral-300">Top Item</th>
                    <th className="text-right py-3 px-4 font-medium text-neutral-300">Popularity</th>
                  </tr>
                </thead>
                <tbody>
                  {menuPerformanceData.map((category, index) => (
                    <tr key={index} className="border-b border-neutral-800/50">
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <div className={'h-3 w-3 rounded-full mr-3 ${
                            category.category === 'Appetizers' ? 'bg-amber-500' :
                            category.category === 'Entrees' ? 'bg-red-500' :
                            category.category === 'Desserts' ? 'bg-purple-500' : 'bg-blue-500'
                          }'}></div>
                          <span className="text-white font-medium">{category.category}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right text-white">{category.revenue}</td>
                      <td className="py-4 px-4 text-right text-neutral-300">{category.orders}</td>
                      <td className="py-4 px-4 text-right text-neutral-300">{category.avgPrice}</td>
                      <td className="py-4 px-4 text-right">
                        <span className={'${
                          parseFloat(category.margin) > 80 ? 'text-green-400' : 
                          parseFloat(category.margin) > 70 ? 'text-yellow-400' : 'text-red-400`
                        }'}>
                          {category.margin}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right text-neutral-300">{category.topItem}</td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end">
                          <div className="w-16 bg-neutral-700 rounded-full h-1.5 mr-2">
                            <div className="bg-green-400 h-1.5 rounded-full" style={{ width: '${category.popularity}%' }}></div>
                          </div>
                          <span className="text-green-400 text-sm">{category.popularity}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Staff Performance and Kitchen Metrics */}
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
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center text-white font-medium text-sm mr-3">
                        {staff.name.split(' ').map(n => n[0]).join(')}
                      </div>
                      <div>
                        <div className="text-white font-medium">{staff.name}</div>
                        <div className="text-sm text-neutral-400 flex items-center gap-2">
                          <span>{staff.role}</span>
                          <div className="w-1 h-1 bg-neutral-600 rounded-full" />
                          <span>{staff.shift}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-medium">{staff.revenue}</div>
                      <div className="text-sm text-neutral-400">{staff.tables} tables • {staff.avgCheck} avg</div>
                      <div className="text-xs text-emerald-400 flex items-center justify-end gap-1">
                        <Star className="h-3 w-3" />
                        {staff.rating} • {staff.efficiency}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Kitchen Metrics */}
            <div className="bg-neutral-900/50 border border-neutral-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <ChefHat className="h-4 w-4 text-orange-400" />
                <h3 className="text-sm font-medium text-neutral-100">Kitchen Operations</h3>
                <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">Real-time</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {kitchenMetrics.map((metric, index) => (
                  <div key={index} className="p-3 bg-neutral-800/20 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-neutral-400">{metric.metric}</span>
                      <div className={'flex items-center gap-1 text-xs ${metric.color}'}>
                        {metric.trend === 'up` ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {metric.change}
                      </div>
                    </div>
                    <div className={`text-lg font-semibold ${metric.color}'}>{metric.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Table Analytics and Peak Hours */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-neutral-900/50 border border-neutral-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-4 w-4 text-blue-400" />
                <h3 className="text-sm font-medium text-neutral-100">Table Performance</h3>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">Seating Analytics</Badge>
              </div>
              <div className="space-y-3">
                {tableAnalytics.map((table, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-neutral-800/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded bg-blue-500/10 flex items-center justify-center text-xs font-medium text-blue-400">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-neutral-100">{table.table}</div>
                        <div className="text-sm text-neutral-400">{table.turns} turns • {table.avgParty} avg party</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-neutral-100">{table.revenue}</div>
                      <div className="text-sm text-neutral-400">{table.avgTime}</div>
                      <div className="text-xs text-yellow-400 flex items-center justify-end gap-1">
                        <Star className="h-3 w-3" />
                        {table.satisfaction}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-neutral-900/50 border border-neutral-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-4 w-4 text-purple-400" />
                <h3 className="text-sm font-medium text-neutral-100">Peak Hours Analysis</h3>
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">Hourly Breakdown</Badge>
              </div>
              <div className="space-y-3">
                {peakHoursData.map((hour, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-neutral-800/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 text-center">
                        <div className="font-medium text-neutral-100">{hour.hour}</div>
                      </div>
                      <div>
                        <div className="font-medium text-neutral-100">{hour.orders} orders</div>
                        <div className="text-sm text-neutral-400">{hour.staff} staff • {hour.avgWait} wait</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-neutral-100">{hour.revenue}</div>
                      <div className="w-20 bg-neutral-700 rounded-full h-1.5 mt-1">
                        <div className="bg-purple-400 h-1.5 rounded-full" style={{ width: '${Math.min((hour.orders / 156) * 100, 100)}%' }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Distribution and Revenue Breakdown */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-neutral-900/50 border border-neutral-800">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <PieChart className="h-4 w-4 text-amber-400" />
                  <h3 className="text-sm font-medium text-neutral-100">Order Channel Distribution</h3>
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">Source Analysis</Badge>
                </div>
                {dashboardData.customerTraffic && (
                  <ModernDoughnutChart
                    data={dashboardData.customerTraffic.slice(-6)}
                    segments={['Dine-in', 'Takeout', 'Delivery', 'Online', 'Phone', 'Walk-in']}
                    height={240}
                  />
                )}
              </div>
            </div>

            <div className="bg-neutral-900/50 border border-neutral-800">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="h-4 w-4 text-red-400" />
                  <h3 className="text-sm font-medium text-neutral-100">Revenue Trend by Category</h3>
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">Daily Comparison</Badge>
                </div>
                {dashboardData.orders && (
                  <ModernBarChart
                    data={dashboardData.orders.slice(-12)}
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
                <h3 className="text-sm font-medium text-neutral-100">Order Flow</h3>
              </div>
              <DataFlowViz flows={abstractData.dataFlows} />
            </div>

            <div className="bg-neutral-900/50 border border-neutral-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-4 w-4 text-orange-400" />
                <h3 className="text-sm font-medium text-neutral-100">Performance</h3>
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
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-neutral-400">POS System: </span>
            <span className="text-red-400">Active</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-neutral-400">Orders Today: </span>
            <span className="text-neutral-300">267 processed</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-neutral-400">Kitchen Load: </span>
            <span className="text-neutral-300">12 pending</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-neutral-400">Avg Check: </span>
            <span className="text-emerald-400">$87.50</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-neutral-400">Customer Rating: </span>
            <span className="text-yellow-300">4.7/5</span>
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