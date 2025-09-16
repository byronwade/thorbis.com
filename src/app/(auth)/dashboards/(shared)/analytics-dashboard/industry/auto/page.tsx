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
  Car,
  Wrench,
  Timer,
  Star,
  MapPin,
  Phone,
  Calendar as CalendarIcon,
  Package,
  Truck,
  Gauge,
  UserCheck,
  Percent,
  FileText,
  Shield,
  Tool,
  Battery,
  Fuel,
  Thermometer
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

export default function AutoServicesAnalyticsPlatform() {
  const searchParams = useSearchParams();
  const region = searchParams.get('region') || 'all';

  // State management for auto services dashboard
  const [isRealTimeActive, setIsRealTimeActive] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [dashboardData, setDashboardData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const realTimeStreamRef = useRef(null);
  
  // Initialize dashboard data on component mount
  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      
      // Generate auto services specific data
      const autoGenerator = chartsModule.generators.automotive || chartsModule.generators.financial;
      const rawData = autoGenerator(30, true);
      
      // Process data for auto services KPIs
      setDashboardData({
        revenue: rawData.revenue || [],
        workOrders: rawData.volume || rawData.transactions || [],
        customerRetention: rawData.customers || rawData.visits || [],
        technicalData: chartsModule.formatters.candlestick(rawData.revenue || [], 0.20),
        volumeData: chartsModule.formatters.histogram(rawData.volume || rawData.transactions || [], 0.28),
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
  
  // Real-time data streaming for work orders
  useEffect(() => {
    if (isRealTimeActive) {
      realTimeStreamRef.current = new chartsModule.realTime('automotive', 6000);
      
      realTimeStreamRef.current.subscribe('workOrders', (dataPoint) => {
        setDashboardData(prev => ({
          ...prev,
          workOrders: [...prev.workOrders.slice(-29), dataPoint]
        }));
      });
      
      return () => {
        if (realTimeStreamRef.current) {
          realTimeStreamRef.current.stop();
        }
      };
    }
  }, [isRealTimeActive]);

  // Auto Services specific data
  const serviceTypeData = [
    {
      service: 'Oil Changes',
      revenue: '$89,450',
      orders: 1847,
      avgPrice: '$48.50',
      margin: '45.2%',
      timeToComplete: '35 min',
      satisfaction: 4.8,
      color: 'text-yellow-400'
    },
    {
      service: 'Brake Service',
      revenue: '$134,780',
      orders: 892,
      avgPrice: '$151.10',
      margin: '62.3%',
      timeToComplete: '95 min',
      satisfaction: 4.9,
      color: 'text-red-400'
    },
    {
      service: 'Engine Diagnostics',
      revenue: '$76,320',
      orders: 534,
      avgPrice: '$143.00',
      margin: '78.1%',
      timeToComplete: '75 min',
      satisfaction: 4.7,
      color: 'text-blue-400'
    },
    {
      service: 'Tire Service',
      revenue: '$112,590',
      orders: 678,
      avgPrice: '$166.00',
      margin: '38.4%',
      timeToComplete: '45 min',
      satisfaction: 4.6,
      color: 'text-green-400'
    }
  ];

  const technicianPerformanceData = [
    {
      name: 'Carlos Martinez',
      specialty: 'Engine Specialist',
      certifications: ['ASE Master', 'BMW Certified'],
      workOrders: 127,
      revenue: '$18,940',
      avgTicket: '$149',
      efficiency: '94.2%',
      customerRating: 4.9,
      comebackRate: '2.1%'
    },
    {
      name: 'Jennifer Park',
      specialty: 'Transmission Expert',
      certifications: ['ASE L1', 'Honda Certified'],
      workOrders: 89,
      revenue: '$21,450',
      avgTicket: '$241',
      efficiency: '96.8%',
      customerRating: 4.8,
      comebackRate: '1.8%'
    },
    {
      name: 'Michael Johnson',
      specialty: 'Electrical Systems',
      certifications: ['ASE A6', 'Ford Certified'],
      workOrders: 112,
      revenue: '$15,670',
      avgTicket: '$140',
      efficiency: '91.5%',
      customerRating: 4.7,
      comebackRate: '3.2%'
    },
    {
      name: 'Robert Chen',
      specialty: 'General Repair',
      certifications: ['ASE A1-A8', 'Toyota Certified'],
      workOrders: 156,
      revenue: '$16,890',
      avgTicket: '$108',
      efficiency: '93.1%',
      customerRating: 4.6,
      comebackRate: '2.8%'
    }
  ];

  const bayUtilizationData = [
    { bay: 'Bay 1 (Quick Service)', utilization: 92, avgTime: '35 min', jobsToday: 18, revenue: '$1,240' },
    { bay: 'Bay 2 (General Repair)', utilization: 87, avgTime: '95 min', jobsToday: 12, revenue: '$2,180' },
    { bay: 'Bay 3 (Heavy Duty)', utilization: 78, avgTime: '185 min', jobsToday: 6, revenue: '$1,890' },
    { bay: 'Bay 4 (Diagnostics)', utilization: 84, avgTime: '75 min', jobsToday: 9, revenue: '$1,670' },
    { bay: 'Bay 5 (Express)', utilization: 96, avgTime: '25 min', jobsToday: 22, revenue: '$980' },
    { bay: 'Bay 6 (Specialty)', utilization: 73, avgTime: '120 min', jobsToday: 8, revenue: '$2,340' }
  ];

  const vehicleMakeAnalysis = [
    { make: 'Toyota', count: 234, avgSpend: '$187', topService: 'Oil Change', satisfaction: 4.8 },
    { make: 'Honda', count: 198, avgSpend: '$165', topService: 'Brake Service', satisfaction: 4.7 },
    { make: 'Ford', count: 167, avgSpend: '$201', topService: 'Engine Repair', satisfaction: 4.6 },
    { make: 'Chevrolet', count: 145, avgSpend: '$189', topService: 'Transmission', satisfaction: 4.5 },
    { make: 'BMW', count: 98, avgSpend: '$298', topService: 'Diagnostics', satisfaction: 4.9 },
    { make: 'Mercedes', count: 76, avgSpend: '$367', topService: 'Electrical', satisfaction: 4.8 }
  ];

  const inventoryMetrics = [
    { item: 'Motor Oil (5W-30)', stock: 847, reorderLevel: 200, turnover: '12.4x/year', cost: '$3,450' },
    { item: 'Brake Pads (Standard)', stock: 156, reorderLevel: 50, turnover: '8.7x/year', cost: '$2,890' },
    { item: 'Air Filters', stock: 234, reorderLevel: 75, turnover: '15.2x/year', cost: '$1,670' },
    { item: 'Spark Plugs', stock: 567, reorderLevel: 150, turnover: '9.8x/year', cost: '$2,340' },
    { item: 'Transmission Fluid', stock: 89, reorderLevel: 25, turnover: '6.3x/year', cost: '$1,230' }
  ];

  // Generate sample data for abstract visualizations
  const generateSparkData = (count: number) => 
    Array.from({ length: count }, (_, i) => ({
      time: Date.now() - (count - i) * 86400000,
      value: 40 + Math.random() * 60
    }));

  const abstractData = {
    sparklines: [
      generateSparkData(15),
      generateSparkData(15),
      generateSparkData(15)
    ],
    performanceMetrics: [
      { label: 'Service Quality', value: 93, maxValue: 100, color: '#10b981' },
      { label: 'Shop Efficiency', value: 89, maxValue: 100, color: '#1C8BFF' },
      { label: 'Customer Retention', value: 85, maxValue: 100, color: '#f59e0b' }
    ],
    systemHealth: [
      { name: 'Shop Management', metrics: [96, 94, 97, 95] },
      { name: 'Diagnostic Tools', metrics: [92, 95, 91, 93] },
      { name: 'Inventory System', metrics: [88, 91, 89, 90] }
    ],
    dataFlows: [
      { from: 'Appointments', to: 'Work Orders', volume: 1450, color: '#10b981' },
      { from: 'Diagnostics', to: 'Repairs', volume: 1280, color: '#1C8BFF' },
      { from: 'Completed', to: 'Invoiced', volume: 1230, color: '#f59e0b' }
    ]
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-neutral-950 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-neutral-400">Loading Auto Services analytics...</span>
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
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Car className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-neutral-100">Auto Services Analytics</h1>
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <span className="capitalize">Automotive Service Intelligence</span>
                <div className="w-1 h-1 bg-neutral-600 rounded-full" />
                <span>Shop & Bay Analytics</span>
                <div className="w-1 h-1 bg-neutral-600 rounded-full" />
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-blue-400">Live Work Orders</span>
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
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-300'
            }'}
          >
            7D
          </button>
          <button
            onClick={() => setSelectedTimeframe('30d')}
            className={'px-3 py-1.5 text-xs rounded-md transition-colors ${
              selectedTimeframe === '30d'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-300'
            }'}
          >
            30D
          </button>
          <button
            onClick={() => setSelectedTimeframe('90d')}
            className={'px-3 py-1.5 text-xs rounded-md transition-colors ${
              selectedTimeframe === '90d'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
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
        {/* Auto Services KPIs */}
        <div className="px-8 py-6 bg-neutral-950">
          <div className="grid grid-cols-4 gap-6">
            {/* Daily Revenue */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium text-neutral-300">Daily Revenue</span>
                <div className="flex items-center gap-1 text-xs text-green-400">
                  <ArrowUpRight className="h-3 w-3" />
                  +15.7%
                </div>
              </div>
              <div className="text-3xl font-bold text-green-400">$12,840</div>
              <div className="text-xs text-neutral-500 mb-3">Today</div>
              <SparkLine 
                data={abstractData.sparklines[0]} 
                width={120} 
                height={24} 
                color="#10b981"
              />
            </div>

            {/* Work Orders Completed */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-neutral-300">Work Orders</span>
                <div className="flex items-center gap-1 text-xs text-green-400">
                  <ArrowUpRight className="h-3 w-3" />
                  +9.2%
                </div>
              </div>
              <div className="text-3xl font-bold text-blue-400">47</div>
              <div className="text-xs text-neutral-500 mb-3">Completed today</div>
              <div className="w-full bg-neutral-800 rounded-full h-2">
                <div className="bg-blue-400 h-2 rounded-full transition-all duration-1000" style={{ width: '85%' }}></div>
              </div>
            </div>

            {/* Average Ticket */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-medium text-neutral-300">Avg Ticket</span>
                <div className="flex items-center gap-1 text-xs text-green-400">
                  <ArrowUpRight className="h-3 w-3" />
                  +6.4%
                </div>
              </div>
              <div className="text-3xl font-bold text-yellow-400">$273</div>
              <div className="text-xs text-neutral-500 mb-3">Per work order</div>
              <SparkLine 
                data={abstractData.sparklines[1]} 
                width={120} 
                height={24} 
                color="#f59e0b"
              />
            </div>

            {/* Bay Utilization */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <Gauge className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-medium text-neutral-300">Bay Utilization</span>
                <div className="flex items-center gap-1 text-xs text-green-400">
                  <ArrowUpRight className="h-3 w-3" />
                  +4.1%
                </div>
              </div>
              <div className="text-3xl font-bold text-purple-400">85.2%</div>
              <div className="text-xs text-neutral-500 mb-3">Average across bays</div>
              <div className="w-full bg-neutral-800 rounded-full h-2">
                <div className="bg-purple-400 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Performance Chart - Full Width */}
        <div className="w-full bg-neutral-950 relative">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-400" />
                <h3 className="text-lg font-medium text-neutral-100">Revenue Performance & Work Order Flow</h3>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">Live Shop Data</Badge>
              </div>
            </div>
          </div>
          <div className="h-96 w-full pointer-events-auto">
            {dashboardData.revenue && (
              <TradingViewWrapper
                data={dashboardData.revenue as TradingViewChartData[]}
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

        {/* Auto Services Analytics Sections */}
        <div className="space-y-8 px-8 py-6 bg-neutral-950">
          
          {/* Service Type Performance */}
          <div className="bg-neutral-900/50 border border-neutral-800 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Wrench className="h-4 w-4 text-cyan-400" />
              <h3 className="text-lg font-medium text-neutral-100">Service Type Performance</h3>
              <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-xs">Service Analysis</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-800">
                    <th className="text-left py-3 px-4 font-medium text-neutral-300">Service Type</th>
                    <th className="text-right py-3 px-4 font-medium text-neutral-300">Revenue</th>
                    <th className="text-right py-3 px-4 font-medium text-neutral-300">Orders</th>
                    <th className="text-right py-3 px-4 font-medium text-neutral-300">Avg Price</th>
                    <th className="text-right py-3 px-4 font-medium text-neutral-300">Margin</th>
                    <th className="text-right py-3 px-4 font-medium text-neutral-300">Avg Time</th>
                    <th className="text-right py-3 px-4 font-medium text-neutral-300">Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceTypeData.map((service, index) => (
                    <tr key={index} className="border-b border-neutral-800/50">
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <div className={'h-3 w-3 rounded-full mr-3 ${
                            service.service === 'Oil Changes' ? 'bg-yellow-500' :
                            service.service === 'Brake Service' ? 'bg-red-500' :
                            service.service === 'Engine Diagnostics' ? 'bg-blue-500' : 'bg-green-500'
                          }'}></div>
                          <span className="text-white font-medium">{service.service}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right text-white">{service.revenue}</td>
                      <td className="py-4 px-4 text-right text-neutral-300">{service.orders}</td>
                      <td className="py-4 px-4 text-right text-neutral-300">{service.avgPrice}</td>
                      <td className="py-4 px-4 text-right">
                        <span className={'${
                          parseFloat(service.margin) > 60 ? 'text-green-400' : 
                          parseFloat(service.margin) > 40 ? 'text-yellow-400' : 'text-red-400'
                        }'}>
                          {service.margin}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right text-neutral-300">{service.timeToComplete}</td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end">
                          <Star className="h-4 w-4 text-yellow-400 mr-1" />
                          <span className="text-white">{service.satisfaction}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Technician Performance and Bay Utilization */}
          <div className="grid grid-cols-2 gap-6">
            {/* Technician Performance */}
            <div className="bg-neutral-900/50 border border-neutral-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-medium text-neutral-100">Technician Performance</h3>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">Top Performers</Badge>
              </div>
              <div className="space-y-4">
                {technicianPerformanceData.map((tech, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-neutral-800/30 rounded-lg">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-medium text-sm mr-3">
                        {tech.name.split(' ').map(n => n[0]).join(')}
                      </div>
                      <div>
                        <div className="text-white font-medium">{tech.name}</div>
                        <div className="text-sm text-neutral-400">{tech.specialty}</div>
                        <div className="text-xs text-neutral-500">
                          {tech.certifications.join(' • ')}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-medium">{tech.revenue}</div>
                      <div className="text-sm text-neutral-400">{tech.workOrders} orders • {tech.avgTicket} avg</div>
                      <div className="text-xs text-emerald-400 flex items-center justify-end gap-1">
                        <Star className="h-3 w-3" />
                        {tech.customerRating} • {tech.efficiency}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bay Utilization */}
            <div className="bg-neutral-900/50 border border-neutral-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Gauge className="h-4 w-4 text-orange-400" />
                <h3 className="text-sm font-medium text-neutral-100">Bay Utilization</h3>
                <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">Real-time</Badge>
              </div>
              <div className="space-y-3">
                {bayUtilizationData.map((bay, index) => (
                  <div key={index} className="p-3 bg-neutral-800/20 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-neutral-100">{bay.bay}</div>
                      <div className="text-sm text-neutral-400">{bay.revenue}</div>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-neutral-400">{bay.jobsToday} jobs • {bay.avgTime}</div>
                      <div className={'text-sm ${bay.utilization > 90 ? 'text-green-400' : bay.utilization > 75 ? 'text-yellow-400' : 'text-red-400'}'}>
                        {bay.utilization}%
                      </div>
                    </div>
                    <div className="w-full bg-neutral-700 rounded-full h-1.5">
                      <div 
                        className={'h-1.5 rounded-full ${bay.utilization > 90 ? 'bg-green-400' : bay.utilization > 75 ? 'bg-yellow-400' : 'bg-red-400'}`} 
                        style={{ width: '${bay.utilization}%' }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Vehicle Analysis and Inventory */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-neutral-900/50 border border-neutral-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Car className="h-4 w-4 text-blue-400" />
                <h3 className="text-sm font-medium text-neutral-100">Vehicle Make Analysis</h3>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">Customer Insights</Badge>
              </div>
              <div className="space-y-3">
                {vehicleMakeAnalysis.map((vehicle, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-neutral-800/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded bg-blue-500/10 flex items-center justify-center text-xs font-medium text-blue-400">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-neutral-100">{vehicle.make}</div>
                        <div className="text-sm text-neutral-400">{vehicle.count} vehicles • {vehicle.topService}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-neutral-100">{vehicle.avgSpend}</div>
                      <div className="text-xs text-yellow-400 flex items-center justify-end gap-1">
                        <Star className="h-3 w-3" />
                        {vehicle.satisfaction}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-neutral-900/50 border border-neutral-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Package className="h-4 w-4 text-purple-400" />
                <h3 className="text-sm font-medium text-neutral-100">Inventory Management</h3>
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">Stock Levels</Badge>
              </div>
              <div className="space-y-3">
                {inventoryMetrics.map((item, index) => (
                  <div key={index} className="p-3 bg-neutral-800/20 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-neutral-100">{item.item}</div>
                      <div className="text-sm text-neutral-300">{item.cost}</div>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-neutral-400">Stock: {item.stock} units</div>
                      <div className="text-sm text-neutral-400">{item.turnover}</div>
                    </div>
                    <div className="w-full bg-neutral-700 rounded-full h-1.5">
                      <div 
                        className={'h-1.5 rounded-full ${item.stock > item.reorderLevel * 2 ? 'bg-green-400' : item.stock > item.reorderLevel ? 'bg-yellow-400' : 'bg-red-400'}'} 
                        style={{ width: '${Math.min((item.stock / (item.reorderLevel * 3)) * 100, 100)}%' }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Service Distribution and Revenue Breakdown */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-neutral-900/50 border border-neutral-800">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <PieChart className="h-4 w-4 text-cyan-400" />
                  <h3 className="text-sm font-medium text-neutral-100">Service Type Distribution</h3>
                  <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-xs">Work Order Analysis</Badge>
                </div>
                {dashboardData.workOrders && (
                  <ModernDoughnutChart
                    data={dashboardData.workOrders.slice(-6)}
                    segments={['Oil Change', 'Brake Service', 'Engine Repair', 'Diagnostics', 'Tire Service', 'Other']}
                    height={240}
                  />
                )}
              </div>
            </div>

            <div className="bg-neutral-900/50 border border-neutral-800">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="h-4 w-4 text-blue-400" />
                  <h3 className="text-sm font-medium text-neutral-100">Monthly Revenue Trend</h3>
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">Performance Tracking</Badge>
                </div>
                {dashboardData.customerRetention && (
                  <ModernBarChart
                    data={dashboardData.customerRetention.slice(-12)}
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
                <h3 className="text-sm font-medium text-neutral-100">Work Flow</h3>
              </div>
              <DataFlowViz flows={abstractData.dataFlows} />
            </div>

            <div className="bg-neutral-900/50 border border-neutral-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-4 w-4 text-orange-400" />
                <h3 className="text-sm font-medium text-neutral-100">Shop Performance</h3>
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
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-neutral-400">Shop Management: </span>
            <span className="text-blue-400">Active</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-neutral-400">Bays in Use: </span>
            <span className="text-neutral-300">5 of 6</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-neutral-400">Pending Work Orders: </span>
            <span className="text-neutral-300">8 scheduled</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-neutral-400">Avg Ticket: </span>
            <span className="text-emerald-400">$273</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-neutral-400">Bay Utilization: </span>
            <span className="text-yellow-300">85.2%</span>
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