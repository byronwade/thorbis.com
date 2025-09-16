"use client";

import { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { 
  createChart, 
  IChartApi,
  ISeriesApi, 
  DeepPartial,
  ChartOptions,
  Time,
  ColorType,
  CrosshairMode,
  LineStyle
} from 'lightweight-charts';
import { TradingViewChartData } from './trading-view-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Maximize2, 
  Minimize2, 
  Download, 
  Settings, 
  TrendingUp,
  BarChart3,
  LineChart,
  PieChart
} from 'lucide-react';

export interface PaneConfig {
  id: string;
  title: string;
  data: TradingViewChartData[];
  type: 'line' | 'area' | 'candlestick' | 'histogram' | 'bar';
  height: number;
  color?: string;
  indicators?: unknown[];
  visible: boolean;
  stretchFactor?: number;
}

export interface MultiPaneChartProps {
  panes: PaneConfig[];
  width?: number;
  totalHeight?: number;
  theme?: 'dark' | 'light';
  syncCrosshair?: boolean;
  syncTimeScale?: boolean;
  enableResize?: boolean;
  onPaneUpdate?: (paneId: string, updates: Partial<PaneConfig>) => void;
  onCrosshairMove?: (param: unknown) => void;
  className?: string;
}

export interface MultiPaneChartRef {
  charts: Map<string, IChartApi>;
  series: Map<string, ISeriesApi<unknown>>;
  fitContent: () => void;
  exportToPDF: () => Promise<void>;
  takeScreenshot: () => string;
  syncTimeRange: (from: Time, to: Time) => void;
  updatePaneData: (paneId: string, data: TradingViewChartData[]) => void;
  addPane: (config: PaneConfig) => void;
  removePane: (paneId: string) => void;
  togglePaneVisibility: (paneId: string) => void;
}

export const MultiPaneChart = forwardRef<MultiPaneChartRef, MultiPaneChartProps>(({
  panes,
  width,
  totalHeight = 800,
  theme = 'dark',
  syncCrosshair = true,
  syncTimeScale = true,
  enableResize = true,
  onPaneUpdate,
  onCrosshairMove,
  className = "",
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartsRef = useRef<Map<string, IChartApi>>(new Map());
  const seriesRef = useRef<Map<string, ISeriesApi<unknown>>>(new Map());
  const paneContainersRef = useRef<Map<string, HTMLDivElement>>(new Map());
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [visiblePanes, setVisiblePanes] = useState<Set<string>>(
    new Set(panes.filter(p => p.visible).map(p => p.id))
  );

  // Calculate pane heights based on stretch factors
  const calculatePaneHeights = () => {
    const visiblePaneConfigs = panes.filter(p => visiblePanes.has(p.id));
    const totalStretchFactor = visiblePaneConfigs.reduce(
      (sum, pane) => sum + (pane.stretchFactor || 1), 
      0
    );
    
    const headerHeight = 60; // Height for pane headers
    const separatorHeight = 4; // Height for separators
    const totalSeparatorHeight = (visiblePaneConfigs.length - 1) * separatorHeight;
    const totalHeaderHeight = visiblePaneConfigs.length * headerHeight;
    const availableHeight = totalHeight - totalHeaderHeight - totalSeparatorHeight;

    return visiblePaneConfigs.map(pane => ({
      ...pane,
      calculatedHeight: Math.floor(
        (availableHeight * (pane.stretchFactor || 1)) / totalStretchFactor
      ),
    }));
  };

  const getChartOptions = (pane: PaneConfig): DeepPartial<ChartOptions> => ({
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
      mode: CrosshairMode.Normal,
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
      visible: true,
      borderColor: theme === 'dark' ? '#374151' : '#d1d5db',
      timeVisible: true,
      secondsVisible: false,
    },
    rightPriceScale: {
      visible: true,
      borderColor: theme === 'dark' ? '#374151' : '#d1d5db',
      scaleMargins: {
        top: 0.1,
        bottom: 0.1,
      },
    },
    handleScroll: {
      mouseWheel: true,
      pressedMouseMove: true,
      horzTouchDrag: true,
      vertTouchDrag: false,
    },
    handleScale: {
      axisPressedMouseMove: {
        time: true,
        price: true,
      },
      axisDoubleClickReset: {
        time: true,
        price: true,
      },
      mouseWheel: true,
      pinch: true,
    },
  });

  const createSeries = (chart: IChartApi, pane: PaneConfig) => {
    let series: ISeriesApi<unknown>;
    const color = pane.color || (theme === 'dark' ? '#1C8BFF' : '#3b82f6');

    switch (pane.type) {
      case 'line':
        series = chart.addLineSeries({
          color,
          lineWidth: 2,
          title: pane.title,
        });
        break;
      case 'area':
        series = chart.addAreaSeries({
          topColor: `${color}66',
          bottomColor: '${color}00',
          lineColor: color,
          lineWidth: 2,
          title: pane.title,
        });
        break;
      case 'candlestick':
        series = chart.addCandlestickSeries({
          upColor: '#10b981',
          downColor: '#ef4444',
          borderVisible: false,
          wickUpColor: '#10b981',
          wickDownColor: '#ef4444',
          title: pane.title,
        });
        break;
      case 'histogram':
        series = chart.addHistogramSeries({
          color,
          title: pane.title,
        });
        break;
      case 'bar':
        series = chart.addBarSeries({
          upColor: '#10b981',
          downColor: '#ef4444',
          title: pane.title,
        });
        break;
      default:
        series = chart.addLineSeries({
          color,
          lineWidth: 2,
          title: pane.title,
        });
    }

    if (pane.data && pane.data.length > 0) {
      series.setData(pane.data as any);
    }

    return series;
  };

  const syncCrosshairHandler = (chart: IChartApi, param: unknown) => {
    if (!syncCrosshair) return;

    chartsRef.current.forEach((otherChart, paneId) => {
      if (otherChart !== chart) {
        otherChart.setCrosshairPosition(param.point?.x || 0, param.point?.y || 0, param.time);
      }
    });

    if (onCrosshairMove) {
      onCrosshairMove(param);
    }
  };

  const syncTimeScaleHandler = (chart: IChartApi) => {
    if (!syncTimeScale) return;

    const visibleRange = chart.timeScale().getVisibleRange();
    if (visibleRange) {
      chartsRef.current.forEach((otherChart) => {
        if (otherChart !== chart) {
          otherChart.timeScale().setVisibleRange(visibleRange);
        }
      });
    }
  };

  useImperativeHandle(ref, () => ({
    charts: chartsRef.current,
    series: seriesRef.current,
    fitContent: () => {
      chartsRef.current.forEach((chart) => {
        chart.timeScale().fitContent();
      });
    },
    exportToPDF: async () => {
      if (typeof window !== 'undefined') {
        const html2pdf = (await import('html2pdf.js')).default;
        if (containerRef.current) {
          const element = containerRef.current;
          const opt = {
            margin: 1,
            filename: 'multi-pane-chart-${Date.now()}.pdf',
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
    takeScreenshot: () => {
      if (containerRef.current) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Combine all chart canvases into one
          const chartCanvases = containerRef.current.querySelectorAll('canvas');
          // Implementation for combining canvases would go here
          return canvas.toDataURL();
        }
      }
      return ';
    },
    syncTimeRange: (from: Time, to: Time) => {
      chartsRef.current.forEach((chart) => {
        chart.timeScale().setVisibleRange({ from, to });
      });
    },
    updatePaneData: (paneId: string, data: TradingViewChartData[]) => {
      const series = seriesRef.current.get(paneId);
      if (series) {
        series.setData(data as any);
      }
    },
    addPane: (config: PaneConfig) => {
      setVisiblePanes(prev => new Set([...prev, config.id]));
    },
    removePane: (paneId: string) => {
      const chart = chartsRef.current.get(paneId);
      const series = seriesRef.current.get(paneId);
      
      if (chart) {
        if (series) {
          chart.removeSeries(series);
          seriesRef.current.delete(paneId);
        }
        chart.remove();
        chartsRef.current.delete(paneId);
      }
      
      setVisiblePanes(prev => {
        const newSet = new Set(prev);
        newSet.delete(paneId);
        return newSet;
      });
    },
    togglePaneVisibility: (paneId: string) => {
      setVisiblePanes(prev => {
        const newSet = new Set(prev);
        if (newSet.has(paneId)) {
          newSet.delete(paneId);
        } else {
          newSet.add(paneId);
        }
        return newSet;
      });
    },
  }));

  useEffect(() => {
    if (!containerRef.current) return;

    // Clean up existing charts
    chartsRef.current.forEach((chart) => chart.remove());
    chartsRef.current.clear();
    seriesRef.current.clear();

    const visiblePaneConfigs = calculatePaneHeights();

    visiblePaneConfigs.forEach((paneConfig) => {
      const paneContainer = paneContainersRef.current.get(paneConfig.id);
      if (!paneContainer) return;

      const chart = createChart(paneContainer, {
        ...getChartOptions(paneConfig),
        height: paneConfig.calculatedHeight,
        width: width || containerRef.current?.clientWidth || 800,
      });

      const series = createSeries(chart, paneConfig);

      // Add indicators
      if (paneConfig.indicators) {
        paneConfig.indicators.forEach((indicator) => {
          const indicatorSeries = chart.addLineSeries({
            color: indicator.color || '#fbbf24',
            lineWidth: indicator.lineWidth || 1,
            title: indicator.title || 'Indicator',
          });
          if (indicator.data) {
            indicatorSeries.setData(indicator.data);
          }
        });
      }

      // Set up event handlers
      chart.subscribeCrosshairMove((param) => syncCrosshairHandler(chart, param));
      chart.timeScale().subscribeVisibleTimeRangeChange(() => syncTimeScaleHandler(chart));

      chartsRef.current.set(paneConfig.id, chart);
      seriesRef.current.set(paneConfig.id, series);

      // Auto-fit content
      setTimeout(() => {
        chart.timeScale().fitContent();
      }, 100);
    });

    // Handle resize
    const handleResize = () => {
      if (containerRef.current) {
        const newWidth = width || containerRef.current.clientWidth;
        chartsRef.current.forEach((chart) => {
          chart.applyOptions({ width: newWidth });
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartsRef.current.forEach((chart) => chart.remove());
      chartsRef.current.clear();
      seriesRef.current.clear();
    };
  }, [panes, visiblePanes, width, totalHeight, theme, syncCrosshair, syncTimeScale]);

  const getChartIcon = (type: string) => {
    switch (type) {
      case 'line':
        return <TrendingUp className="h-4 w-4" />;
      case 'area':
        return <BarChart3 className="h-4 w-4" />;
      case 'candlestick':
        return <LineChart className="h-4 w-4" />;
      case 'histogram':
      case 'bar':
        return <BarChart3 className="h-4 w-4" />;
      default:
        return <PieChart className="h-4 w-4" />;
    }
  };

  const exportToPDF = async () => {
    if (typeof window !== 'undefined') {
      const html2pdf = (await import('html2pdf.js')).default;
      if (containerRef.current) {
        const element = containerRef.current;
        const opt = {
          margin: 1,
          filename: 'multi-pane-chart-${Date.now()}.pdf',
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
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const visiblePaneConfigs = calculatePaneHeights();

  return (
    <div 
      ref={containerRef}
      className={'multi-pane-chart ${className} ${
        isFullscreen ? 'fixed inset-0 z-50 bg-background' : `
      }'}
      style={{ 
        width: width ? '${width}px' : '100%',
        height: isFullscreen ? '100vh' : '${totalHeight}px',
      }}
    >
      {/* Chart Controls */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Multi-Pane Analytics</h3>
          <Badge variant="secondary">{visiblePaneConfigs.length} Panes</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportToPDF}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" size="sm" onClick={toggleFullscreen}>
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4 mr-2" />
            ) : (
              <Maximize2 className="h-4 w-4 mr-2" />
            )}
            {isFullscreen ? 'Exit' : 'Fullscreen'}
          </Button>
        </div>
      </div>

      {/* Chart Panes */}
      <div className="flex-1 overflow-hidden">
        {visiblePaneConfigs.map((paneConfig, index) => (
          <div key={paneConfig.id} className="relative">
            {/* Pane Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-b">
              <div className="flex items-center gap-2">
                {getChartIcon(paneConfig.type)}
                <span className="font-medium">{paneConfig.title}</span>
                <Badge variant="outline" className="text-xs">
                  {paneConfig.type.toUpperCase()}
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm">
                  <Settings className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Chart Container */}
            <div
              ref={(el) => {
                if (el) {
                  paneContainersRef.current.set(paneConfig.id, el);
                }
              }}
              style={{ height: '${paneConfig.calculatedHeight}px' }}
              className="relative"
            />

            {/* Pane Separator */}
            {index < visiblePaneConfigs.length - 1 && enableResize && (
              <div className="h-1 bg-border cursor-row-resize hover:bg-primary/50 transition-colors" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
});

MultiPaneChart.displayName = 'MultiPaneChart';