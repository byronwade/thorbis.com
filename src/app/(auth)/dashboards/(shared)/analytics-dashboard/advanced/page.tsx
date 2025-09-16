"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { TrendingUp, Download, Zap, Settings2, Crosshair, PenTool, Target, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TradingViewWrapper, TradingViewWrapperRef, TradingViewChartData } from "@/components/analytics/advanced-charts/trading-view-wrapper";
import { TimeFrameControls, TimeRange } from "@/components/analytics/controls/time-frame-controls";
import { AnalyticsBackButton } from "@/components/analytics/analytics-back-button";

export default function AnalyticsAdvanced() {
  const searchParams = useSearchParams();
  const fromIndustry = searchParams.get('from');
  
  const [currentTimeRange, setCurrentTimeRange] = useState<TimeRange>();
  const [advancedChartData, setAdvancedChartData] = useState<TradingViewChartData[]>([]);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [showGoalSetting, setShowGoalSetting] = useState(false);
  
  const tradingViewRef = useRef<TradingViewWrapperRef>(null);

  // Generate sample TradingView data
  useEffect(() => {
    const generateSampleData = () => {
      const data: TradingViewChartData[] = [];
      const now = new Date();
      const startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
      
      const baseValue = 100000;
      
      for (const i = 0; i < 30; i++) {
        const time = new Date(startTime.getTime() + i * 24 * 60 * 60 * 1000);
        const variation = (Math.random() - 0.5) * 10000;
        baseValue += variation;
        
        data.push({
          time: Math.floor(time.getTime() / 1000) as any,
          value: Math.max(50000, baseValue + Math.random() * 20000),
        });
      }
      
      return data;
    };

    setAdvancedChartData(generateSampleData());
  }, []);

  const handleTimeRangeChange = (range: TimeRange) => {
    setCurrentTimeRange(range);
    console.log('Time range changed:', range);
  };

  return (
      <div className="flex flex-col h-screen bg-neutral-950">
      {/* Header with back button and controls - full width edge-to-edge */}
      <div className="border-b border-neutral-800 bg-neutral-950">
        <div className="flex items-center gap-4 p-4">
          <AnalyticsBackButton />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-neutral-100">Advanced Charts</h1>
              <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                TradingView Powered
              </Badge>
            </div>
            <p className="text-neutral-400">
              {fromIndustry ? 'Professional analytics for ${fromIndustry.toUpperCase()} Industry' : 'Professional-grade charts with technical indicators and drawing tools'}
            </p>
          </div>
          
          {/* Chart Controls */}
          <div className="flex items-center gap-2">
            <Button 
              variant={isDrawingMode ? "default" : "outline"} 
              size="sm" 
              onClick={() => setIsDrawingMode(!isDrawingMode)}
            >
              <PenTool className="h-4 w-4 mr-2" />
              Draw
            </Button>
            <Button 
              variant={showGoalSetting ? "default" : "outline"} 
              size="sm" 
              onClick={() => setShowGoalSetting(!showGoalSetting)}
            >
              <Target className="h-4 w-4 mr-2" />
              Goals
            </Button>
            <Button variant="outline" size="sm" onClick={() => tradingViewRef.current?.exportToPDF()}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={() => tradingViewRef.current?.fitContent()}>
              <Zap className="h-4 w-4 mr-2" />
              Auto-fit
            </Button>
          </div>
        </div>
      </div>

      {/* Time Frame Controls Bar */}
      <div className="border-b border-neutral-800 bg-neutral-900/30 px-4 py-2">
        <div className="flex items-center justify-between">
          <TimeFrameControls
            onTimeRangeChange={handleTimeRangeChange}
            currentRange={currentTimeRange}
            enableRealTime={true}
            enableComparison={true}
            enableCustom={true}
            refreshInterval={30}
            compact={true}
          />
          <div className="flex items-center gap-2 text-sm text-neutral-400">
            {isDrawingMode && (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">
                <PenTool className="h-3 w-3" />
                Drawing Mode Active
              </div>
            )}
            {showGoalSetting && (
              <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-400 rounded-full border border-green-500/20">
                <Target className="h-3 w-3" />
                Goal Setting Active
              </div>
            )}
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Real-time
            </div>
          </div>
        </div>
      </div>

      {/* Main Chart Area - Full screen, edge-to-edge */}
      <div className="flex-1 relative overflow-hidden">
        <div className="h-full">
          <TradingViewWrapper
            ref={tradingViewRef}
            data={advancedChartData}
            type="area"
            height="100%"
            theme="dark"
            enableRealTime={true}
            className="h-full w-full border-0"
            onCrosshairMove={(param) => {
              // Handle crosshair move for real-time data display
              console.log('Crosshair moved:', param);
            }}
          />
        </div>

        {/* Drawing Tools Overlay */}
        {isDrawingMode && (
          <div className="absolute left-4 top-4 bg-neutral-900/95 backdrop-blur-sm border border-neutral-700 rounded-lg p-3 shadow-lg">
            <div className="space-y-2">
              <div className="text-sm font-medium mb-2 text-neutral-100">Drawing Tools</div>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <div className="w-3 h-0.5 bg-current mr-2"></div>
                Trend Line
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <div className="w-3 h-3 border border-current rounded mr-2"></div>
                Rectangle
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <div className="w-3 h-3 border border-current rounded-full mr-2"></div>
                Circle
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <BarChart3 className="h-3 w-3 mr-2" />
                Fibonacci
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <Crosshair className="h-3 w-3 mr-2" />
                Crosshair
              </Button>
            </div>
          </div>
        )}

        {/* Goal Setting Overlay */}
        {showGoalSetting && (
          <div className="absolute right-4 top-4 bg-neutral-900/95 backdrop-blur-sm border border-neutral-700 rounded-lg p-3 shadow-lg">
            <div className="space-y-3 w-64">
              <div className="text-sm font-medium mb-2 text-neutral-100">Set Goals & Predictions</div>
              <div className="space-y-2">
                <label className="text-xs text-neutral-400">Target Value</label>
                <input 
                  type="number" 
                  placeholder="150,000"
                  className="w-full px-2 py-1 text-sm border border-neutral-700 rounded bg-neutral-800 text-neutral-100"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-neutral-400">Target Date</label>
                <input 
                  type="date" 
                  className="w-full px-2 py-1 text-sm border border-neutral-700 rounded bg-neutral-800 text-neutral-100"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-neutral-400">Confidence Level</label>
                <select className="w-full px-2 py-1 text-sm border border-neutral-700 rounded bg-neutral-800 text-neutral-100">
                  <option>High (80-90%)</option>
                  <option>Medium (60-80%)</option>
                  <option>Low (40-60%)</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <Button size="sm" className="flex-1">
                  <Target className="h-3 w-3 mr-1" />
                  Set Goal
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Clear
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Chart Info Overlay - Bottom */}
        <div className="absolute bottom-4 left-4 bg-neutral-900/95 backdrop-blur-sm border border-neutral-700 rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-neutral-400">Revenue:</span>
              <span className="font-medium text-neutral-100">$124,580</span>
              <span className="text-green-400">+12.5%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-neutral-400">Volume:</span>
              <span className="font-medium text-neutral-100">8.2K</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-neutral-400">Last:</span>
              <span className="font-medium text-neutral-100">$127,340</span>
            </div>
          </div>
        </div>
      </div>
      </div>
  );
}