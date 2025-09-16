// Chart Types for TradingView Lightweight Charts Integration
// ServiceTitan-inspired dashboard for home services businesses

export interface ChartDataPoint {
  time: number; // Unix timestamp
  value: number;
  color?: string;
}

export interface VolumeDataPoint {
  time: number;
  value: number;
  color: 'up' | 'down' | 'neutral';
}

export interface MetricsDataPoint {
  time: number;
  value: number;
}

// Chart Configuration Types
export interface ChartConfig {
  timeframe: 'day' | 'week' | 'month' | 'quarter' | 'year';
  showLegend?: boolean;
  showCrosshair?: boolean;
  enableZoom?: boolean;
  theme?: 'dark' | 'light';
}

// Home Services KPIs - ServiceTitan inspired
export interface DashboardKPIs {
  // Financial Metrics
  todayRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  averageTicket: number;
  conversionRate: number;
  
  // Operational Metrics  
  todayWorkOrders: number;
  completedWorkOrders: number;
  activeWorkOrders: number;
  scheduledWorkOrders: number;
  
  // Technician Metrics
  activeTechnicians: number;
  availableTechnicians: number;
  onRouteTechnicians: number;
  techUtilization: number;
  
  // Performance Metrics
  avgResponseTime: string;
  responseTimeChange: number;
  callbackRate: number;
  customerSatisfaction: number;
  netPromoterScore: number;
  
  // Service Quality Metrics
  slaCompliance: number;
  firstTimeFixRate: number;
  referralRate: number;
}

// Chart Data Collections
export interface ChartDatasets {
  revenue: {
    daily: ChartDataPoint[];
    weekly: ChartDataPoint[];
    monthly: ChartDataPoint[];
  };
  workOrders: {
    volumes: VolumeDataPoint[];
    completionRates: MetricsDataPoint[];
  };
  technicians: {
    utilization: MetricsDataPoint[];
    responseTime: MetricsDataPoint[];
    satisfaction: MetricsDataPoint[];
  };
  customers: {
    satisfaction: MetricsDataPoint[];
    nps: MetricsDataPoint[];
    callbacks: MetricsDataPoint[];
  };
}

// User Information for Welcome Header
export interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'manager' | 'supervisor' | 'technician';
  company: string;
  lastLogin: string;
}

// System Status for Dashboard
export interface SystemStatus {
  isOnline: boolean;
  hardwareConnected: {
    printer: boolean;
    scanner: boolean;
  };
  aiSafetyStatus: 'safe' | 'warning' | 'error';
  usageLimits: {
    apiCalls: { current: number; limit: number };
    workOrders: { current: number; limit: number };
    storage: { current: number; limit: number };
  };
  lastSync: string;
}

// API Response Types
export interface DashboardMetricsResponse {
  success: boolean;
  data: {
    kpis: DashboardKPIs;
    charts: ChartDatasets;
  };
  timestamp: string;
}

// Component Props Types
export interface BaseChartProps {
  data: ChartDataPoint[] | VolumeDataPoint[] | MetricsDataPoint[];
  config: ChartConfig;
  className?: string;
  loading?: boolean;
  error?: string | null;
}

export interface RevenueChartProps extends Omit<BaseChartProps, 'data'> {
  data: ChartDataPoint[];
  showTargetLine?: boolean;
  targetValue?: number;
}

export interface VolumeChartProps extends Omit<BaseChartProps, 'data'> {
  data: VolumeDataPoint[];
  colorScheme?: 'default' | 'performance' | 'custom';
}

export interface MetricsChartProps extends Omit<BaseChartProps, 'data'> {
  data: MetricsDataPoint[];
  metrics: string[];
  compareMode?: boolean;
}

export interface WelcomeHeaderProps {
  user: UserInfo | null;
  systemStatus: SystemStatus | null;
  onNewWorkOrder?: () => void;
}

export interface MetricsGridProps {
  kpis: DashboardKPIs | null;
  loading?: boolean;
}

// Utility Types for Chart Components
export interface BaseChartComponentProps {
  data: unknown[];
  config: ChartConfig;
  className?: string;
  loading?: boolean;
  error?: string | null;
  onChartReady?: (chart: unknown) => void;
}