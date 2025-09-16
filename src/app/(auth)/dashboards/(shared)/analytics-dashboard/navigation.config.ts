/**
 * Analytics Navigation Configuration
 * 
 * Defines the navigation structure for advanced analytics and business intelligence.
 * This is a shared feature available across all industries with TradingView integration.
 */

import {
  BarChart3,
  TrendingUp,
  Home,
  Settings2,
  FileText,
  Target,
  Activity,
  PieChart,
  LineChart,
  Calendar,
  Filter,
  Download,
  Wrench,
  Car,
  Store,
  ChefHat,
  DollarSign,
  Building2,
  Users,
  MapPin,
  Clock,
  Star,
  Zap,
  Phone,
  ShoppingCart,
  Package,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Timer,
  Truck,
  Utensils,
  Gauge,
  Settings,
  Calendar as CalendarIcon,
  Droplets,
  Calculator,
  GraduationCap,
  Shield
} from 'lucide-react'

export interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
  description?: string
  isNew?: boolean
  priority?: 'high' | 'medium' | 'low'
}

export interface NavigationSection {
  title?: string
  items: NavigationItem[]
  collapsible?: boolean
  defaultExpanded?: boolean
}

export interface SidebarConfig {
  defaultOpen?: boolean
  showToggleIcon?: boolean
  collapsible?: boolean
  variant?: 'sidebar' | 'floating' | 'inset'
  width?: string
  position?: 'left' | 'right'
}

export const analyticsNavigationConfig = {
  appName: 'Analytics Platform',
  industry: 'analytics' as const,
  primaryColor: '#1C8BFF',
  icon: BarChart3,
  
  // Main dashboard route for Analytics
  dashboardHref: '/dashboards/analytics',
  
  // Sidebar configuration
  sidebar: {
    defaultOpen: false,  // Always start closed for clean interface
    showToggleIcon: true,
    collapsible: true,
    variant: 'inset' as const,
    width: '320px',  // Wider for analytics tools
    position: 'left' as const
  } as SidebarConfig,
  
  // Header configuration
  header: {
    title: 'Advanced Analytics',
    subtitle: 'TradingView-powered business intelligence and data visualization',
    actions: [
      {
        label: 'Overview',
        href: '/dashboards/analytics/overview',
        icon: 'Home'
      },
      {
        label: 'Charts',
        href: '/dashboards/analytics/advanced',
        icon: 'TrendingUp'
      },
      {
        label: 'Reports',
        href: '/dashboards/analytics/reports',
        icon: 'FileText'
      }
    ]
  },

  // Analytics-specific navigation sections - reorganized structure
  sections: [
    {
      title: 'Core Analytics',
      defaultExpanded: true,
      collapsible: true,
      items: [
        { 
          name: 'Overview', 
          href: '/dashboards/analytics/overview', 
          icon: Home, 
          description: 'Business metrics and key performance indicators',
          priority: 'high' as const
        },
        { 
          name: 'Advanced Charts', 
          href: '/dashboards/analytics/advanced', 
          icon: TrendingUp, 
          description: 'TradingView charts with drawing tools and goal setting',
          isNew: true,
          priority: 'high' as const
        },
        { 
          name: 'Multi-Pane Analysis', 
          href: '/dashboards/analytics/multi-pane', 
          icon: BarChart3, 
          description: 'Synchronized charts for data comparison',
          priority: 'high' as const
        },
        {
          name: 'QuickBooks Analytics',
          href: '/dashboards/analytics/quickbooks',
          icon: DollarSign,
          description: 'Financial health, P&L, tax planning, and reconciliation',
          isNew: true
        },
        {
          name: 'Banking Analytics',
          href: '/dashboards/analytics/banking',
          icon: Building2,
          description: 'Multi-account tracking, cash flow analysis, and fraud detection',
          isNew: true
        },
        {
          name: 'Marketing Analytics',
          href: '/dashboards/analytics/marketing',
          icon: Target,
          description: 'Campaign ROI, attribution tracking, and conversion analytics',
          isNew: true
        }
      ]
    },
    {
      title: 'Tools & Builders',
      collapsible: true,
      defaultExpanded: true,
      items: [
        { 
          name: 'Chart Builder', 
          href: '/dashboards/analytics/builder', 
          icon: Settings2, 
          description: 'AI-powered custom chart creation',
          isNew: true
        },
        { 
          name: 'Report Builder', 
          href: '/dashboards/analytics/reports', 
          icon: FileText, 
          description: 'Professional business reports and templates' 
        },
        { 
          name: 'Controls & Settings', 
          href: '/dashboards/analytics/controls', 
          icon: Filter, 
          description: 'Time controls, data sources, and export settings' 
        }
      ]
    },
    {
      title: 'Home Services Analytics',
      collapsible: true,
      defaultExpanded: true,
      items: [
        { 
          name: 'Overview Dashboard', 
          href: '/dashboards/analytics/industry/home-services', 
          icon: Home, 
          description: 'Comprehensive service industry performance overview',
          priority: 'high' as const
        },
        { 
          name: 'Dispatch & Scheduling', 
          href: '/dashboards/analytics/industry/home-services/dispatch', 
          icon: CalendarIcon, 
          description: 'Real-time dispatch operations and scheduling analytics',
          isNew: true
        },
        { 
          name: 'Technician Performance', 
          href: '/dashboards/analytics/industry/home-services/technicians', 
          icon: Users, 
          description: 'Individual and team performance tracking',
          isNew: true
        },
        { 
          name: 'Customer Service Analytics', 
          href: '/dashboards/analytics/industry/home-services/customer-service', 
          icon: Phone, 
          description: 'Customer satisfaction, ratings, and service quality',
          isNew: true
        },
        { 
          name: 'Revenue & Profitability', 
          href: '/dashboards/analytics/industry/home-services/revenue', 
          icon: DollarSign, 
          description: 'Financial performance and profit margin analysis',
          priority: 'high' as const
        },
        { 
          name: 'Job Completion Analytics', 
          href: '/dashboards/analytics/industry/home-services/job-completion', 
          icon: CheckCircle, 
          description: 'Job completion rates, first-fix rates, and efficiency',
          isNew: true
        },
        { 
          name: 'Service Area Performance', 
          href: '/dashboards/analytics/industry/home-services/service-areas', 
          icon: MapPin, 
          description: 'Geographic performance and territory optimization',
          isNew: true
        },
        { 
          name: 'HVAC Analytics', 
          href: '/dashboards/analytics/industry/home-services/hvac', 
          icon: Gauge, 
          description: 'Heating, ventilation, and air conditioning service metrics',
          isNew: true
        },
        { 
          name: 'Plumbing Analytics', 
          href: '/dashboards/analytics/industry/home-services/plumbing', 
          icon: Droplets, 
          description: 'Plumbing service operations and emergency response',
          isNew: true
        },
        { 
          name: 'Electrical Analytics', 
          href: '/dashboards/analytics/industry/home-services/electrical', 
          icon: Zap, 
          description: 'Electrical service performance and safety metrics',
          isNew: true
        },
        { 
          name: 'Emergency Services', 
          href: '/dashboards/analytics/industry/home-services/emergency', 
          icon: AlertTriangle, 
          description: 'Emergency response times and after-hours performance',
          isNew: true
        },
        { 
          name: 'Maintenance Contracts', 
          href: '/dashboards/analytics/industry/home-services/maintenance', 
          icon: Settings, 
          description: 'Recurring maintenance and service contract analytics',
          isNew: true
        },
        { 
          name: 'Parts & Inventory', 
          href: '/dashboards/analytics/industry/home-services/inventory', 
          icon: Package, 
          description: 'Parts usage, inventory levels, and supply chain',
          isNew: true
        },
        { 
          name: 'Response Time Analytics', 
          href: '/dashboards/analytics/industry/home-services/response-times', 
          icon: Timer, 
          description: 'Service response time tracking and optimization',
          isNew: true
        },
        { 
          name: 'Fleet & Vehicle Analytics', 
          href: '/dashboards/analytics/industry/home-services/fleet', 
          icon: Truck, 
          description: 'Vehicle utilization, fuel costs, and maintenance',
          isNew: true
        },
        { 
          name: 'Seasonal Performance', 
          href: '/dashboards/analytics/industry/home-services/seasonal', 
          icon: CalendarIcon, 
          description: 'Seasonal demand patterns and capacity planning',
          isNew: true
        },
        { 
          name: 'Customer Acquisition', 
          href: '/dashboards/analytics/industry/home-services/acquisition', 
          icon: Target, 
          description: 'Lead generation, conversion rates, and marketing ROI',
          isNew: true
        },
        { 
          name: 'Quality Assurance', 
          href: '/dashboards/analytics/industry/home-services/quality', 
          icon: Star, 
          description: 'Service quality metrics and customer feedback',
          isNew: true
        },
        { 
          name: 'Competitive Analysis', 
          href: '/dashboards/analytics/industry/home-services/competitive', 
          icon: TrendingUp, 
          description: 'Market positioning and competitive benchmarking',
          isNew: true
        },
        { 
          name: 'Cost Analysis', 
          href: '/dashboards/analytics/industry/home-services/costs', 
          icon: Calculator, 
          description: 'Labor costs, overhead, and profitability by service type',
          isNew: true
        },
        { 
          name: 'Training & Development', 
          href: '/dashboards/analytics/industry/home-services/training', 
          icon: GraduationCap, 
          description: 'Technician training progress and skill development',
          isNew: true
        },
        { 
          name: 'Safety & Compliance', 
          href: '/dashboards/analytics/industry/home-services/safety', 
          icon: Shield, 
          description: 'Safety incidents, compliance tracking, and certifications',
          isNew: true
        },
        { 
          name: 'Customer Lifetime Value', 
          href: '/dashboards/analytics/industry/home-services/clv', 
          icon: TrendingUp, 
          description: 'Customer retention, repeat business, and lifetime value',
          isNew: true
        },
        { 
          name: 'Service Contracts Analytics', 
          href: '/dashboards/analytics/industry/home-services/contracts', 
          icon: FileText, 
          description: 'Service agreement performance and contract renewals',
          isNew: true
        },
        { 
          name: 'Technology & Tools', 
          href: '/dashboards/analytics/industry/home-services/technology', 
          icon: Settings2, 
          description: 'Technology adoption, tool effectiveness, and ROI',
          isNew: true
        }
      ]
    },
    {
      title: 'Custom Dashboards',
      collapsible: true,
      defaultExpanded: false,
      items: [
        {
          name: 'Executive Performance Dashboard',
          href: '/dashboards/analytics/custom/executive-overview',
          icon: TrendingUp,
          description: 'High-level KPIs, business performance metrics, and board-ready insights',
          badge: 'Executive',
          priority: 'high' as const
        },
        {
          name: 'ServiceTitan Competitor Analysis',
          href: '/dashboards/analytics/custom/servicetitan-benchmark',
          icon: Target,
          description: 'Compare performance against ServiceTitan industry benchmarks and best practices',
          badge: 'Benchmark',
          isNew: true,
          priority: 'high' as const
        },
        {
          name: 'Multi-Location Performance',
          href: '/dashboards/analytics/custom/multi-location',
          icon: MapPin,
          description: 'Cross-location performance comparison and territory optimization',
          badge: 'Multi-Site',
          isNew: true
        },
        {
          name: 'Real-Time Operations Center',
          href: '/dashboards/analytics/custom/operations-center',
          icon: Activity,
          description: 'Live operational dashboard with real-time alerts and KPI monitoring',
          badge: 'Live',
          priority: 'high' as const
        },
        {
          name: 'Seasonal Business Intelligence',
          href: '/dashboards/analytics/custom/seasonal-intelligence',
          icon: CalendarIcon,
          description: 'Seasonal demand forecasting, capacity planning, and weather impact analysis',
          badge: 'Seasonal'
        },
        {
          name: 'Emergency Response Command',
          href: '/dashboards/analytics/custom/emergency-command',
          icon: AlertTriangle,
          description: 'Emergency dispatch optimization, after-hours performance, and crisis management',
          badge: 'Critical',
          priority: 'high' as const
        },
        {
          name: 'Technician Excellence Index',
          href: '/dashboards/analytics/custom/technician-excellence',
          icon: Users,
          description: 'Comprehensive technician scoring system with performance rankings and development',
          badge: 'Performance'
        },
        {
          name: 'Customer Journey Analytics',
          href: '/dashboards/analytics/custom/customer-journey',
          icon: Star,
          description: 'End-to-end customer lifecycle tracking from lead to lifetime value',
          badge: 'Journey',
          isNew: true
        },
        {
          name: 'Smart Inventory Predictor',
          href: '/dashboards/analytics/custom/smart-inventory',
          icon: Package,
          description: 'AI-powered parts demand forecasting and automated inventory optimization',
          badge: 'AI-Powered',
          isNew: true
        },
        {
          name: 'Fleet Operations Command',
          href: '/dashboards/analytics/custom/fleet-command',
          icon: Truck,
          description: 'Vehicle tracking, route optimization, fuel analytics, and maintenance scheduling',
          badge: 'Fleet'
        },
        {
          name: 'Marketing ROI Maximizer',
          href: '/dashboards/analytics/custom/marketing-roi',
          icon: Target,
          description: 'Multi-channel attribution, campaign optimization, and lead source analysis',
          badge: 'Marketing'
        },
        {
          name: 'Quality Assurance Monitor',
          href: '/dashboards/analytics/custom/quality-monitor',
          icon: CheckCircle,
          description: 'Service quality tracking, customer feedback analysis, and improvement insights',
          badge: 'Quality'
        },
        {
          name: 'Predictive Revenue Engine',
          href: '/dashboards/analytics/custom/revenue-engine',
          icon: DollarSign,
          description: 'Advanced revenue forecasting with market trends and economic indicators',
          badge: 'Forecast',
          isNew: true
        },
        {
          name: 'Training & Development ROI',
          href: '/dashboards/analytics/custom/training-development',
          icon: GraduationCap,
          description: 'Training program effectiveness, skill development tracking, and certification ROI',
          badge: 'Learning'
        },
        {
          name: 'Competitive Intelligence Hub',
          href: '/dashboards/analytics/custom/competitive-intelligence',
          icon: Building2,
          description: 'Market analysis, competitor tracking, pricing intelligence, and positioning',
          badge: 'Intelligence',
          isNew: true
        },
        {
          name: 'Service Contract Optimizer',
          href: '/dashboards/analytics/custom/contract-optimizer',
          icon: FileText,
          description: 'Contract renewal prediction, pricing optimization, and retention strategies',
          badge: 'Contracts'
        },
        {
          name: 'Profitability Deep Dive',
          href: '/dashboards/analytics/custom/profitability-analysis',
          icon: Calculator,
          description: 'Granular profitability analysis by service, technician, location, and time period',
          badge: 'Profit'
        },
        {
          name: 'Operational Efficiency Scanner',
          href: '/dashboards/analytics/custom/efficiency-scanner',
          icon: Gauge,
          description: 'Identify bottlenecks, inefficiencies, and optimization opportunities across operations',
          badge: 'Efficiency',
          isNew: true
        },
        {
          name: 'Customer Retention Predictor',
          href: '/dashboards/analytics/custom/retention-predictor',
          icon: Shield,
          description: 'Churn prediction, retention strategies, and customer health scoring',
          badge: 'Retention',
          isNew: true
        },
        {
          name: 'Financial Health Monitor',
          href: '/dashboards/analytics/custom/financial-health',
          icon: Activity,
          description: 'Cash flow analysis, financial ratios, budget variance, and financial forecasting',
          badge: 'Finance'
        },
        {
          name: 'Service Area Expansion',
          href: '/dashboards/analytics/custom/expansion-analysis',
          icon: MapPin,
          description: 'Market expansion opportunities, demographic analysis, and territory planning',
          badge: 'Growth',
          isNew: true
        },
        {
          name: 'Pricing Strategy Optimizer',
          href: '/dashboards/analytics/custom/pricing-optimizer',
          icon: TrendingUp,
          description: 'Dynamic pricing analysis, competitive pricing intelligence, and margin optimization',
          badge: 'Pricing',
          isNew: true
        },
        {
          name: 'Custom Dashboard Builder',
          href: '/dashboards/analytics/builder?template=custom',
          icon: Settings2,
          description: 'Create personalized dashboards with drag-and-drop widgets and custom metrics',
          badge: 'Build',
          priority: 'high' as const
        }
      ]
    }
  ] as NavigationSection[]
}

export type AnalyticsNavigationConfig = typeof analyticsNavigationConfig