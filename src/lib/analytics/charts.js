/**
 * Centralized Charts JavaScript Module
 * Enterprise-grade analytics data generation and chart management
 * 
 * Features:
 * - Industry-specific data generators
 * - Multiple chart type support
 * - Real-time data simulation
 * - Professional metrics calculation
 * - Cross-chart synchronization utilities
 */

// ============================================================================
// INDUSTRY-SPECIFIC DATA GENERATORS
// ============================================================================

/**
 * Home Services Industry Data Generator
 * Generates realistic metrics for HVAC, plumbing, electrical services
 */
export const generateHomeServicesData = (days = 30, includeSeasonality = true) => {
  const data = {
    revenue: [],
    jobsCompleted: [],
    customerSatisfaction: [],
    techniciansUtilization: [],
    emergencyCallouts: [],
    averageJobValue: []
  };

  const baseRevenue = 15000; // Daily base revenue
  const baseJobs = 25; // Daily base job count
  const baseSatisfaction = 4.2; // Base satisfaction rating
  
  for (let i = 0; i < days; i++) {
    const date = new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000);
    const time = Math.floor(date.getTime() / 1000);
    
    // Seasonal adjustments (HVAC peaks in summer/winter)
    const monthMultiplier = includeSeasonality ? getSeasonalMultiplier(date.getMonth(), 'homeservices') : 1;
    
    // Weekend patterns (less commercial, more residential emergency)
    const weekendMultiplier = [0, 6].includes(date.getDay()) ? 0.7 : 1;
    
    // Weather impact simulation
    const weatherImpact = 1 + (Math.random() - 0.5) * 0.3;
    
    const dailyRevenue = Math.round(baseRevenue * monthMultiplier * weekendMultiplier * weatherImpact * (1 + (Math.random() - 0.5) * 0.4));
    const dailyJobs = Math.round(baseJobs * monthMultiplier * weekendMultiplier * (1 + (Math.random() - 0.5) * 0.3));
    const avgJobValue = dailyJobs > 0 ? Math.round(dailyRevenue / dailyJobs) : 0;
    
    data.revenue.push({ time, value: Math.max(5000, dailyRevenue) });
    data.jobsCompleted.push({ time, value: Math.max(5, dailyJobs) });
    data.customerSatisfaction.push({ time, value: Math.max(3.0, Math.min(5.0, baseSatisfaction + (Math.random() - 0.5) * 0.8)) });
    data.techniciansUtilization.push({ time, value: Math.max(45, Math.min(95, 75 + (Math.random() - 0.5) * 30)) });
    data.emergencyCallouts.push({ time, value: Math.round(dailyJobs * (0.15 + Math.random() * 0.25)) });
    data.averageJobValue.push({ time, value: Math.max(200, avgJobValue) });
  }
  
  return data;
};

/**
 * Restaurant Industry Data Generator
 * Generates realistic metrics for food service operations
 */
export const generateRestaurantData = (days = 30, includeSeasonality = true) => {
  const data = {
    revenue: [],
    orderVolume: [],
    averageOrderValue: [],
    tableTurnover: [],
    foodCostPercentage: [],
    peakHourRevenue: []
  };

  const baseRevenue = 8500; // Daily base revenue
  const baseOrders = 180; // Daily base orders
  const baseAOV = 47; // Base average order value
  
  for (let i = 0; i < days; i++) {
    const date = new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000);
    const time = Math.floor(date.getTime() / 1000);
    
    // Seasonal adjustments (holiday seasons, summer patterns)
    const monthMultiplier = includeSeasonality ? getSeasonalMultiplier(date.getMonth(), 'restaurant') : 1;
    
    // Weekend boost for restaurants
    const weekendMultiplier = [5, 6].includes(date.getDay()) ? 1.4 : [0].includes(date.getDay()) ? 0.6 : 1;
    
    // Weather impact (rain increases delivery, sunny increases patio dining)
    const weatherImpact = 1 + (Math.random() - 0.5) * 0.2;
    
    const dailyRevenue = Math.round(baseRevenue * monthMultiplier * weekendMultiplier * weatherImpact * (1 + (Math.random() - 0.5) * 0.3));
    const dailyOrders = Math.round(baseOrders * monthMultiplier * weekendMultiplier * (1 + (Math.random() - 0.5) * 0.25));
    const aov = dailyOrders > 0 ? Math.round(dailyRevenue / dailyOrders * 100) / 100 : baseAOV;
    
    data.revenue.push({ time, value: Math.max(3000, dailyRevenue) });
    data.orderVolume.push({ time, value: Math.max(50, dailyOrders) });
    data.averageOrderValue.push({ time, value: Math.max(25, aov) });
    data.tableTurnover.push({ time, value: Math.max(2.0, Math.min(6.0, 3.2 + (Math.random() - 0.5) * 1.5)) });
    data.foodCostPercentage.push({ time, value: Math.max(25, Math.min(35, 30 + (Math.random() - 0.5) * 8)) });
    data.peakHourRevenue.push({ time, value: Math.round(dailyRevenue * (0.35 + Math.random() * 0.15)) });
  }
  
  return data;
};

/**
 * Automotive Services Data Generator
 * Generates realistic metrics for auto repair and service
 */
export const generateAutomotiveData = (days = 30, includeSeasonality = true) => {
  const data = {
    revenue: [],
    serviceOrders: [],
    averageRepairValue: [],
    partsRevenue: [],
    laborRevenue: [],
    customerRetention: []
  };

  const baseRevenue = 22000; // Daily base revenue
  const baseOrders = 35; // Daily base service orders
  const baseRepairValue = 628; // Base average repair value
  
  for (let i = 0; i < days; i++) {
    const date = new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000);
    const time = Math.floor(date.getTime() / 1000);
    
    // Seasonal adjustments (winter = more repairs, summer = more maintenance)
    const monthMultiplier = includeSeasonality ? getSeasonalMultiplier(date.getMonth(), 'automotive') : 1;
    
    // Weekend patterns (less commercial fleet, more individual repairs)
    const weekendMultiplier = [0, 6].includes(date.getDay()) ? 0.8 : 1;
    
    // Economic impact simulation
    const economicImpact = 1 + (Math.random() - 0.5) * 0.15;
    
    const dailyRevenue = Math.round(baseRevenue * monthMultiplier * weekendMultiplier * economicImpact * (1 + (Math.random() - 0.5) * 0.25));
    const dailyOrders = Math.round(baseOrders * monthMultiplier * weekendMultiplier * (1 + (Math.random() - 0.5) * 0.2));
    const avgRepairValue = dailyOrders > 0 ? Math.round(dailyRevenue / dailyOrders) : baseRepairValue;
    
    const partsRevenue = Math.round(dailyRevenue * (0.45 + Math.random() * 0.15));
    const laborRevenue = dailyRevenue - partsRevenue;
    
    data.revenue.push({ time, value: Math.max(8000, dailyRevenue) });
    data.serviceOrders.push({ time, value: Math.max(15, dailyOrders) });
    data.averageRepairValue.push({ time, value: Math.max(300, avgRepairValue) });
    data.partsRevenue.push({ time, value: Math.max(2000, partsRevenue) });
    data.laborRevenue.push({ time, value: Math.max(4000, laborRevenue) });
    data.customerRetention.push({ time, value: Math.max(65, Math.min(85, 75 + (Math.random() - 0.5) * 15)) });
  }
  
  return data;
};

/**
 * Retail Industry Data Generator
 * Generates realistic metrics for retail operations
 */
export const generateRetailData = (days = 30, includeSeasonality = true) => {
  const data = {
    revenue: [],
    transactions: [],
    averageBasketSize: [],
    conversionRate: [],
    inventory: [],
    footTraffic: []
  };

  const baseRevenue = 12500; // Daily base revenue
  const baseTransactions = 285; // Daily base transactions
  const baseBasketSize = 43.86; // Base average basket size
  
  for (let i = 0; i < days; i++) {
    const date = new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000);
    const time = Math.floor(date.getTime() / 1000);
    
    // Seasonal adjustments (holiday shopping, back-to-school, etc.)
    const monthMultiplier = includeSeasonality ? getSeasonalMultiplier(date.getMonth(), 'retail') : 1;
    
    // Weekend shopping patterns
    const weekendMultiplier = [5, 6].includes(date.getDay()) ? 1.3 : [0].includes(date.getDay()) ? 0.9 : 1;
    
    // Marketing campaign impact simulation
    const marketingImpact = Math.random() > 0.8 ? 1.15 : 1; // 20% chance of campaign boost
    
    const dailyRevenue = Math.round(baseRevenue * monthMultiplier * weekendMultiplier * marketingImpact * (1 + (Math.random() - 0.5) * 0.3));
    const dailyTransactions = Math.round(baseTransactions * monthMultiplier * weekendMultiplier * (1 + (Math.random() - 0.5) * 0.25));
    const basketSize = dailyTransactions > 0 ? Math.round(dailyRevenue / dailyTransactions * 100) / 100 : baseBasketSize;
    
    const footTraffic = Math.round(dailyTransactions * (2.5 + Math.random() * 1.5)); // 2.5-4x transactions as foot traffic
    const conversionRate = Math.round((dailyTransactions / footTraffic) * 100 * 100) / 100; // Percentage with 2 decimals
    
    data.revenue.push({ time, value: Math.max(5000, dailyRevenue) });
    data.transactions.push({ time, value: Math.max(100, dailyTransactions) });
    data.averageBasketSize.push({ time, value: Math.max(20, basketSize) });
    data.conversionRate.push({ time, value: Math.max(10, Math.min(40, conversionRate)) });
    data.inventory.push({ time, value: Math.max(100000, 850000 + (Math.random() - 0.5) * 200000) });
    data.footTraffic.push({ time, value: Math.max(200, footTraffic) });
  }
  
  return data;
};

// ============================================================================
// SEASONAL MULTIPLIERS
// ============================================================================

/**
 * Calculate seasonal multipliers based on industry and month
 */
function getSeasonalMultiplier(month, industry) {
  const seasonalPatterns = {
    homeservices: [1.3, 1.2, 1.0, 0.9, 0.8, 1.4, 1.5, 1.4, 1.0, 0.9, 1.1, 1.3], // HVAC seasonal
    restaurant: [0.9, 0.9, 1.0, 1.1, 1.2, 1.2, 1.1, 1.1, 1.0, 1.0, 1.3, 1.4], // Holiday dining
    automotive: [1.2, 1.1, 1.0, 1.0, 1.1, 1.2, 1.1, 1.0, 1.0, 1.0, 1.1, 1.3], // Winter repairs
    retail: [1.4, 0.8, 1.0, 1.0, 1.1, 1.0, 0.9, 1.2, 1.0, 1.1, 1.3, 1.6] // Holiday shopping
  };
  
  return seasonalPatterns[industry]?.[month] || 1.0;
}

// ============================================================================
// PROFESSIONAL CHART DATA FORMATTERS
// ============================================================================

/**
 * Format data for TradingView candlestick charts
 */
export const formatForCandlestick = (data, volatilityMultiplier = 0.15) => {
  return data.map(point => {
    const baseValue = point.value;
    const volatility = baseValue * volatilityMultiplier;
    
    const open = baseValue + (Math.random() - 0.5) * volatility * 0.5;
    const variation = (Math.random() - 0.5) * volatility;
    const high = Math.max(open, baseValue + Math.abs(variation));
    const low = Math.min(open, baseValue - Math.abs(variation));
    const close = low + Math.random() * (high - low);
    
    return {
      time: point.time,
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
    };
  });
};

/**
 * Format data for volume/histogram charts
 */
export const formatForHistogram = (data, baselineMultiplier = 0.3) => {
  return data.map(point => ({
    time: point.time,
    value: Math.round(point.value * (baselineMultiplier + Math.random() * 0.7)),
    color: point.value > (point.previousValue || point.value) ? '#10b981' : '#ef4444'
  }));
};

/**
 * Add trend lines and moving averages to data
 */
export const addTechnicalIndicators = (data, config = {}) => {
  const { 
    smaLength = 7, 
    emaLength = 14,
    addBollingerBands = false,
    addRSI = false 
  } = config;
  
  const result = {
    original: data,
    sma: calculateSMA(data, smaLength),
    ema: calculateEMA(data, emaLength)
  };
  
  if (addBollingerBands) {
    result.bollingerBands = calculateBollingerBands(data, smaLength, 2);
  }
  
  if (addRSI) {
    result.rsi = calculateRSI(data, 14);
  }
  
  return result;
};

// ============================================================================
// TECHNICAL INDICATORS CALCULATIONS
// ============================================================================

function calculateSMA(data, length) {
  const sma = [];
  for (let i = length - 1; i < data.length; i++) {
    const slice = data.slice(i - length + 1, i + 1);
    const average = slice.reduce((sum, point) => sum + point.value, 0) / length;
    sma.push({ time: data[i].time, value: Math.round(average * 100) / 100 });
  }
  return sma;
}

function calculateEMA(data, length) {
  const ema = [];
  const multiplier = 2 / (length + 1);
  
  // Start with SMA for first value
  const firstSMA = data.slice(0, length).reduce((sum, point) => sum + point.value, 0) / length;
  ema.push({ time: data[length - 1].time, value: firstSMA });
  
  for (let i = length; i < data.length; i++) {
    const emaValue = (data[i].value * multiplier) + (ema[ema.length - 1].value * (1 - multiplier));
    ema.push({ time: data[i].time, value: Math.round(emaValue * 100) / 100 });
  }
  
  return ema;
}

function calculateBollingerBands(data, period, standardDeviations) {
  const sma = calculateSMA(data, period);
  const bands = { upper: [], middle: sma, lower: [] };
  
  for (let i = 0; i < sma.length; i++) {
    const dataIndex = i + period - 1;
    const slice = data.slice(dataIndex - period + 1, dataIndex + 1);
    const mean = sma[i].value;
    const variance = slice.reduce((sum, point) => sum + Math.pow(point.value - mean, 2), 0) / period;
    const stdDev = Math.sqrt(variance);
    
    bands.upper.push({
      time: sma[i].time,
      value: Math.round((mean + (standardDeviations * stdDev)) * 100) / 100
    });
    
    bands.lower.push({
      time: sma[i].time,
      value: Math.round((mean - (standardDeviations * stdDev)) * 100) / 100
    });
  }
  
  return bands;
}

function calculateRSI(data, period) {
  const rsi = [];
  let gains = 0;
  let losses = 0;
  
  // Calculate initial average gain and loss
  for (let i = 1; i <= period; i++) {
    const change = data[i].value - data[i - 1].value;
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }
  
  let avgGain = gains / period;
  let avgLoss = losses / period;
  let rs = avgGain / avgLoss;
  rsi.push({ time: data[period].time, value: Math.round(100 - (100 / (1 + rs))) });
  
  // Calculate RSI for remaining data points
  for (let i = period + 1; i < data.length; i++) {
    const change = data[i].value - data[i - 1].value;
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;
    
    avgGain = ((avgGain * (period - 1)) + gain) / period;
    avgLoss = ((avgLoss * (period - 1)) + loss) / period;
    rs = avgGain / avgLoss;
    
    rsi.push({ time: data[i].time, value: Math.round(100 - (100 / (1 + rs))) });
  }
  
  return rsi;
}

// ============================================================================
// REAL-TIME DATA SIMULATION
// ============================================================================

/**
 * Create real-time data stream for live dashboard updates
 */
export class RealTimeDataStream {
  constructor(industry, updateInterval = 5000) {
    this.industry = industry;
    this.updateInterval = updateInterval;
    this.subscribers = new Map();
    this.isRunning = false;
    this.lastValues = new Map();
  }
  
  subscribe(metricName, callback) {
    if (!this.subscribers.has(metricName)) {
      this.subscribers.set(metricName, new Set());
    }
    this.subscribers.get(metricName).add(callback);
    
    // Start streaming if this is the first subscription
    if (!this.isRunning) {
      this.start();
    }
  }
  
  unsubscribe(metricName, callback) {
    if (this.subscribers.has(metricName)) {
      this.subscribers.get(metricName).delete(callback);
      if (this.subscribers.get(metricName).size === 0) {
        this.subscribers.delete(metricName);
      }
    }
    
    // Stop streaming if no subscribers
    if (this.subscribers.size === 0) {
      this.stop();
    }
  }
  
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.streamData();
  }
  
  stop() {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
  
  streamData() {
    this.intervalId = setInterval(() => {
      const time = Math.floor(Date.now() / 1000);
      
      // Generate new data points for subscribed metrics
      for (const metricName of this.subscribers.keys()) {
        const newValue = this.generateRealTimeValue(metricName);
        const dataPoint = { time, value: newValue };
        
        // Notify all subscribers for this metric
        for (const callback of this.subscribers.get(metricName)) {
          callback(dataPoint);
        }
        
        this.lastValues.set(metricName, newValue);
      }
    }, this.updateInterval);
  }
  
  generateRealTimeValue(metricName) {
    const lastValue = this.lastValues.get(metricName);
    const baseValues = this.getBaseValues();
    
    if (!lastValue) {
      return baseValues[metricName] || 1000;
    }
    
    // Generate realistic fluctuations based on metric type
    const volatility = this.getMetricVolatility(metricName);
    const trend = this.getMetricTrend(metricName);
    const seasonalImpact = this.getSeasonalImpact();
    
    const change = (Math.random() - 0.5) * volatility * lastValue;
    const trendAdjustment = trend * lastValue * 0.001; // 0.1% trend per update
    const seasonalAdjustment = (seasonalImpact - 1) * lastValue * 0.0005;
    
    return Math.max(0, lastValue + change + trendAdjustment + seasonalAdjustment);
  }
  
  getBaseValues() {
    const values = {
      homeservices: { revenue: 15000, jobs: 25, satisfaction: 4.2 },
      restaurant: { revenue: 8500, orders: 180, aov: 47 },
      automotive: { revenue: 22000, orders: 35, repairValue: 628 },
      retail: { revenue: 12500, transactions: 285, basketSize: 43.86 }
    };
    
    return values[this.industry] || values.retail;
  }
  
  getMetricVolatility(metricName) {
    const volatilities = {
      revenue: 0.05, // 5% volatility
      jobs: 0.08, // 8% volatility
      orders: 0.07, // 7% volatility
      satisfaction: 0.02, // 2% volatility
      transactions: 0.06 // 6% volatility
    };
    
    return volatilities[metricName] || 0.05;
  }
  
  getMetricTrend(metricName) {
    // Simulate different trend scenarios
    const trends = {
      revenue: Math.random() > 0.6 ? 1 : -0.5, // Generally positive
      orders: Math.random() > 0.5 ? 1 : -1, // Mixed
      satisfaction: Math.random() > 0.7 ? 1 : -0.3 // Generally stable/positive
    };
    
    return trends[metricName] || 0;
  }
  
  getSeasonalImpact() {
    const hour = new Date().getHours();
    const month = new Date().getMonth();
    
    // Simple seasonal multiplier based on current time
    return getSeasonalMultiplier(month, this.industry) * 
           (hour >= 9 && hour <= 17 ? 1.1 : 0.9); // Business hours boost
  }
}

// ============================================================================
// CHART SYNCHRONIZATION UTILITIES
// ============================================================================

/**
 * Chart synchronization manager for multi-pane dashboards
 */
export class ChartSyncManager {
  constructor() {
    this.charts = new Map();
    this.syncGroups = new Map();
  }
  
  registerChart(chartId, chartRef, syncGroupId = 'default') {
    this.charts.set(chartId, chartRef);
    
    if (!this.syncGroups.has(syncGroupId)) {
      this.syncGroups.set(syncGroupId, new Set());
    }
    this.syncGroups.get(syncGroupId).add(chartId);
    
    // Setup crosshair sync for this group
    if (chartRef.current?.chart) {
      chartRef.current.chart.subscribeCrosshairMove((param) => {
        this.syncCrosshair(syncGroupId, chartId, param);
      });
    }
  }
  
  unregisterChart(chartId) {
    this.charts.delete(chartId);
    
    // Remove from sync groups
    for (const [groupId, charts] of this.syncGroups) {
      charts.delete(chartId);
      if (charts.size === 0) {
        this.syncGroups.delete(groupId);
      }
    }
  }
  
  syncCrosshair(syncGroupId, sourceChartId, param) {
    const group = this.syncGroups.get(syncGroupId);
    if (!group) return;
    
    for (const chartId of group) {
      if (chartId !== sourceChartId) {
        const chartRef = this.charts.get(chartId);
        if (chartRef?.current?.chart) {
          // Sync crosshair position
          if (param.time) {
            chartRef.current.chart.setCrosshairPosition(param.price || 0, param.time, param.seriesData?.get(param.series) || null);
          } else {
            chartRef.current.chart.clearCrosshairPosition();
          }
        }
      }
    }
  }
  
  syncTimeRange(syncGroupId, timeRange) {
    const group = this.syncGroups.get(syncGroupId);
    if (!group) return;
    
    for (const chartId of group) {
      const chartRef = this.charts.get(chartId);
      if (chartRef?.current?.chart) {
        chartRef.current.chart.timeScale().setVisibleRange(timeRange);
      }
    }
  }
  
  fitAllContent(syncGroupId = 'default') {
    const group = this.syncGroups.get(syncGroupId);
    if (!group) return;
    
    for (const chartId of group) {
      const chartRef = this.charts.get(chartId);
      if (chartRef?.current?.fitContent) {
        chartRef.current.fitContent();
      }
    }
  }
}

// ============================================================================
// EXPORT UTILITIES
// ============================================================================

/**
 * Professional data export utilities
 */
export const exportUtilities = {
  /**
   * Export data as CSV with proper formatting
   */
  toCSV(data, filename = 'analytics-data.csv') {
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') ? '"${value}"' : value;
      }).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
  
  /**
   * Export chart as image
   */
  async toImage(chartRef, filename = 'chart.png', format = 'png') {
    if (chartRef.current?.takeScreenshot) {
      const dataUrl = chartRef.current.takeScreenshot();
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  },
  
  /**
   * Export multiple charts as PDF report
   */
  async toPDFReport(chartRefs, title = 'Analytics Report') {
    if (typeof window !== 'undefined') {
      const html2pdf = (await import('html2pdf.js')).default;
      
      // Create report container
      const container = document.createElement('div');
      container.style.width = '210mm';
      container.style.padding = '20mm';
      container.style.backgroundColor = 'white';
      container.style.color = 'black';
      
      // Add title
      const titleElement = document.createElement('h1');
      titleElement.textContent = title;
      titleElement.style.textAlign = 'center';
      titleElement.style.marginBottom = '30px';
      container.appendChild(titleElement);
      
      // Add charts
      for (const [index, chartRef] of chartRefs.entries()) {
        if (chartRef.current?.takeScreenshot) {
          const img = document.createElement('img');
          img.src = chartRef.current.takeScreenshot();
          img.style.width = '100%';
          img.style.marginBottom = '20px';
          container.appendChild(img);
        }
      }
      
      // Generate PDF
      const opt = {
        margin: 10,
        filename: '${title.toLowerCase().replace(/\s+/g, '-')}.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      
      document.body.appendChild(container);
      await html2pdf().set(opt).from(container).save();
      document.body.removeChild(container);
    }
  }
};

// Default export with all utilities
export default {
  generators: {
    homeServices: generateHomeServicesData,
    restaurant: generateRestaurantData,
    automotive: generateAutomotiveData,
    retail: generateRetailData
  },
  formatters: {
    candlestick: formatForCandlestick,
    histogram: formatForHistogram,
    technicalIndicators: addTechnicalIndicators
  },
  realTime: RealTimeDataStream,
  sync: ChartSyncManager,
  export: exportUtilities
};