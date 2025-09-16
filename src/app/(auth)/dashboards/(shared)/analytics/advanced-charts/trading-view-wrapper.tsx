"use client";

import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { 
  createChart, 
  IChartApi, 
  ISeriesApi,
  DeepPartial,
  ChartOptions,
  Time,
  LineData,
  CandlestickData,
  HistogramData,
  AreaData,
  BarData,
  ColorType,
  CrosshairMode,
  LineStyle
} from 'lightweight-charts';

export interface TradingViewChartData {
  time: Time;
  value?: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
}

export interface TradingViewWrapperProps {
  data: TradingViewChartData[];
  type: 'line' | 'area' | 'candlestick' | 'histogram' | 'bar';
  height?: number | string;
  width?: number | string;
  options?: DeepPartial<ChartOptions>;
  onCrosshairMove?: (param: unknown) => void;
  onVisibleTimeRangeChange?: (param: unknown) => void;
  theme?: 'dark' | 'light';
  enablePanning?: boolean;
  enableZooming?: boolean;
  showTimeScale?: boolean;
  showPriceScale?: boolean;
  enableCrosshair?: boolean;
  customIndicators?: unknown[];
  realTimeUpdates?: boolean;
  enableRealTime?: boolean;
  className?: string;
}

export interface TradingViewWrapperRef {
  chart: IChartApi | null;
  series: ISeriesApi<unknown> | null;
  updateData: (data: TradingViewChartData[]) => void;
  addRealTimeData: (data: TradingViewChartData) => void;
  fitContent: () => void;
  takeScreenshot: () => string;
  exportToPDF: () => Promise<void>;
  setTimeRange: (from: Time, to: Time) => void;
  addCustomIndicator: (indicator: unknown) => void;
  removeCustomIndicator: (indicatorId: string) => void;
  getVisibleRange: () => any;
}

export const TradingViewWrapper = forwardRef<TradingViewWrapperRef, TradingViewWrapperProps>(({
  data,
  type,
  height = 400,
  width,
  options = {},
  onCrosshairMove,
  onVisibleTimeRangeChange,
  theme = 'dark',
  enablePanning = true,
  enableZooming = true,
  showTimeScale = true,
  showPriceScale = true,
  enableCrosshair = true,
  customIndicators = [],
  realTimeUpdates = false,
  enableRealTime = false,
  className = "",
}, ref) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<unknown> | null>(null);
  const customIndicatorsRef = useRef<Map<string, any>>(new Map());

  // Default theme configurations
  const defaultOptions: DeepPartial<ChartOptions> = {
    layout: {
      background: {
        type: ColorType.Solid,
        color: theme === 'dark' ? '#0a0a0a' : '#ffffff',
      },
      textColor: theme === 'dark' ? '#d1d5db' : '#374151',
    },
    grid: {
      vertLines: {
        color: theme === 'dark' ? 'rgba(75, 85, 99, 0.2)' : 'rgba(209, 213, 219, 0.5)',
      },
      horzLines: {
        color: theme === 'dark' ? 'rgba(75, 85, 99, 0.2)' : 'rgba(209, 213, 219, 0.5)',
      },
    },
    crosshair: {
      mode: enableCrosshair ? CrosshairMode.Normal : CrosshairMode.Hidden,
      vertLine: {
        color: theme === 'dark' ? '#1C8BFF' : '#3b82f6',
        width: 1,
        style: LineStyle.Solid,
        labelVisible: true,
      },
      horzLine: {
        color: theme === 'dark' ? '#1C8BFF' : '#3b82f6',
        width: 1,
        style: LineStyle.Solid,
        labelVisible: true,
      },
    },
    timeScale: {
      visible: showTimeScale,
      borderColor: theme === 'dark' ? '#374151' : '#d1d5db',
      timeVisible: true,
      secondsVisible: false,
    },
    rightPriceScale: {
      visible: showPriceScale,
      borderColor: theme === 'dark' ? '#374151' : '#d1d5db',
      scaleMargins: {
        top: 0.1,
        bottom: 0.1,
      },
    },
    handleScroll: {
      mouseWheel: enableZooming,
      pressedMouseMove: enablePanning,
      horzTouchDrag: enablePanning,
      vertTouchDrag: false,
    },
    handleScale: {
      axisPressedMouseMove: {
        time: enablePanning,
        price: enablePanning,
      },
      axisDoubleClickReset: {
        time: true,
        price: true,
      },
      mouseWheel: enableZooming,
      pinch: enableZooming,
    },
  };

  const mergedOptions = { ...defaultOptions, ...options };

  useImperativeHandle(ref, () => ({
    chart: chartRef.current,
    series: seriesRef.current,
    updateData: (newData: TradingViewChartData[]) => {
      if (seriesRef.current) {
        seriesRef.current.setData(newData as any);
      }
    },
    addRealTimeData: (newDataPoint: TradingViewChartData) => {
      if (seriesRef.current) {
        seriesRef.current.update(newDataPoint as any);
      }
    },
    fitContent: () => {
      if (chartRef.current) {
        chartRef.current.timeScale().fitContent();
      }
    },
    takeScreenshot: () => {
      if (chartContainerRef.current) {
        const canvas = chartContainerRef.current.querySelector('canvas');
        return canvas?.toDataURL() || '';
      }
      return '';
    },
    exportToPDF: async () => {
      if (typeof window !== 'undefined') {
        const html2pdf = (await import('html2pdf.js')).default;
        if (chartContainerRef.current) {
          const element = chartContainerRef.current;
          const opt = {
            margin: 1,
            filename: 'chart-${Date.now()}.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
              scale: 2,
              backgroundColor: theme === 'dark' ? '#0a0a0a' : '#ffffff'
            },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' }
          };
          html2pdf().set(opt).from(element).save();
        }
      }
    },
    setTimeRange: (from: Time, to: Time) => {
      if (chartRef.current) {
        chartRef.current.timeScale().setVisibleRange({ from, to });
      }
    },
    addCustomIndicator: (indicator: unknown) => {
      // Implementation for custom indicators
      if (chartRef.current && indicator) {
        const indicatorSeries = chartRef.current.addLineSeries({
          color: indicator.color || '#1C8BFF',
          lineWidth: indicator.lineWidth || 2,
          title: indicator.title || 'Custom Indicator',
        });
        indicatorSeries.setData(indicator.data || []);
        customIndicatorsRef.current.set(indicator.id, indicatorSeries);
      }
    },
    removeCustomIndicator: (indicatorId: string) => {
      const indicator = customIndicatorsRef.current.get(indicatorId);
      if (indicator && chartRef.current) {
        chartRef.current.removeSeries(indicator);
        customIndicatorsRef.current.delete(indicatorId);
      }
    },
    getVisibleRange: () => {
      if (chartRef.current) {
        return chartRef.current.timeScale().getVisibleRange();
      }
      return null;
    },
  }));

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Calculate height and width
    const containerHeight = typeof height === 'string' && height === '100%' 
      ? chartContainerRef.current.clientHeight || 400
      : typeof height === 'string' 
        ? parseInt(height) || 400
        : height || 400;
    
    const containerWidth = typeof width === 'string' && width === '100%'
      ? chartContainerRef.current.clientWidth
      : typeof width === 'string'
        ? parseInt(width) || chartContainerRef.current.clientWidth
        : width || chartContainerRef.current.clientWidth;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      ...mergedOptions,
      height: containerHeight,
      width: containerWidth,
    });

    chartRef.current = chart;

    // Create series based on type
    let series: ISeriesApi<unknown>;
    const seriesOptions = {
      title: '${type.charAt(0).toUpperCase() + type.slice(1)} Series',
    };

    switch (type) {
      case 'line':
        series = chart.addLineSeries({
          ...seriesOptions,
          color: theme === 'dark' ? '#1C8BFF' : '#3b82f6',
          lineWidth: 2,
        });
        break;
      case 'area':
        series = chart.addAreaSeries({
          ...seriesOptions,
          topColor: theme === 'dark' ? 'rgba(28, 139, 255, 0.4)' : 'rgba(59, 130, 246, 0.4)',
          bottomColor: theme === 'dark' ? 'rgba(28, 139, 255, 0.0)' : 'rgba(59, 130, 246, 0.0)',
          lineColor: theme === 'dark' ? '#1C8BFF' : '#3b82f6',
          lineWidth: 2,
        });
        break;
      case 'candlestick':
        series = chart.addCandlestickSeries({
          ...seriesOptions,
          upColor: '#10b981',
          downColor: '#ef4444',
          borderVisible: false,
          wickUpColor: '#10b981',
          wickDownColor: '#ef4444',
        });
        break;
      case 'histogram':
        series = chart.addHistogramSeries({
          ...seriesOptions,
          color: theme === 'dark' ? '#1C8BFF' : '#3b82f6',
        });
        break;
      case 'bar':
        series = chart.addBarSeries({
          ...seriesOptions,
          upColor: '#10b981',
          downColor: '#ef4444',
        });
        break;
      default:
        series = chart.addLineSeries(seriesOptions);
    }

    seriesRef.current = series;

    // Set initial data with validation
    if (data && data.length > 0) {
      // Filter and validate data based on chart type
      const validatedData = data.filter(item => {
        if (!item.time) return false;
        
        if (type === 'candlestick' || type === 'bar') {
          return item.open != null && item.high != null && item.low != null && item.close != null;
        } else {
          return item.value != null;
        }
      });
      
      if (validatedData.length > 0) {
        series.setData(validatedData as any);
      }
    }

    // Add custom indicators
    customIndicators.forEach((indicator) => {
      if (indicator) {
        const indicatorSeries = chart.addLineSeries({
          color: indicator.color || '#1C8BFF',
          lineWidth: indicator.lineWidth || 2,
          title: indicator.title || 'Custom Indicator',
        });
        indicatorSeries.setData(indicator.data || []);
        customIndicatorsRef.current.set(indicator.id, indicatorSeries);
      }
    });

    // Event handlers
    if (onCrosshairMove) {
      chart.subscribeCrosshairMove(onCrosshairMove);
    }

    if (onVisibleTimeRangeChange) {
      chart.timeScale().subscribeVisibleTimeRangeChange(onVisibleTimeRangeChange);
    }

    // Auto-fit content
    setTimeout(() => {
      chart.timeScale().fitContent();
    }, 100);

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        const newHeight = typeof height === 'string' && height === '100%' 
          ? chartContainerRef.current.clientHeight || 400
          : typeof height === 'string' 
            ? parseInt(height) || 400
            : height || 400;
        
        const newWidth = typeof width === 'string' && width === '100%'
          ? chartContainerRef.current.clientWidth
          : typeof width === 'string'
            ? parseInt(width) || chartContainerRef.current.clientWidth
            : width || chartContainerRef.current.clientWidth;

        chart.applyOptions({
          width: newWidth,
          height: newHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (onCrosshairMove) {
        chart.unsubscribeCrosshairMove(onCrosshairMove);
      }
      if (onVisibleTimeRangeChange) {
        chart.timeScale().unsubscribeVisibleTimeRangeChange(onVisibleTimeRangeChange);
      }
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
      customIndicatorsRef.current.clear();
    };
  }, [
    data,
    type,
    height,
    width,
    theme,
    enablePanning,
    enableZooming,
    showTimeScale,
    showPriceScale,
    enableCrosshair,
  ]);

  // Update data when it changes
  useEffect(() => {
    if (seriesRef.current && data && data.length > 0) {
      // Filter and validate data based on chart type
      const validatedData = data.filter(item => {
        if (!item.time) return false;
        
        if (type === 'candlestick' || type === 'bar') {
          return item.open != null && item.high != null && item.low != null && item.close != null;
        } else {
          return item.value != null;
        }
      });
      
      if (validatedData.length > 0) {
        seriesRef.current.setData(validatedData as any);
      }
    }
  }, [data, type]);

  return (
    <div 
      ref={chartContainerRef} 
      className={'trading-view-chart ${className}'}
      style={{ 
        height: typeof height === 'string' ? height : '${height}px', 
        width: typeof width === 'string' ? width : width ? '${width}px' : '100%',
        position: 'relative',
      }}
    />
  );
});

TradingViewWrapper.displayName = 'TradingViewWrapper';