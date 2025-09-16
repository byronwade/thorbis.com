"use client";

import { useState, useEffect } from 'react';
import { format, subDays, subMonths, subYears, startOfDay, endOfDay, parseISO, isValid } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  RefreshCw, 
  Play, 
  Pause,
  TrendingUp,
  TrendingDown,
  ArrowRight
} from 'lucide-react';

export interface TimeRange {
  from: Date;
  to: Date;
  label: string;
  value: string;
}

export interface TimeFrameControlsProps {
  onTimeRangeChange: (range: TimeRange) => void;
  currentRange?: TimeRange;
  enableRealTime?: boolean;
  enableComparison?: boolean;
  enableCustom?: boolean;
  refreshInterval?: number; // in seconds
  className?: string;
}

const PRESET_RANGES = [
  { 
    label: 'Last 15 minutes', 
    value: '15m', 
    getRange: () => ({ 
      from: subDays(new Date(), 0).setMinutes(new Date().getMinutes() - 15),
      to: new Date() 
    })
  },
  { 
    label: 'Last hour', 
    value: '1h', 
    getRange: () => ({ 
      from: subDays(new Date(), 0).setHours(new Date().getHours() - 1),
      to: new Date() 
    })
  },
  { 
    label: 'Last 24 hours', 
    value: '24h', 
    getRange: () => ({ 
      from: subDays(new Date(), 1), 
      to: new Date() 
    })
  },
  { 
    label: 'Last 7 days', 
    value: '7d', 
    getRange: () => ({ 
      from: subDays(new Date(), 7), 
      to: new Date() 
    })
  },
  { 
    label: 'Last 30 days', 
    value: '30d', 
    getRange: () => ({ 
      from: subDays(new Date(), 30), 
      to: new Date() 
    })
  },
  { 
    label: 'Last 90 days', 
    value: '90d', 
    getRange: () => ({ 
      from: subDays(new Date(), 90), 
      to: new Date() 
    })
  },
  { 
    label: 'Last 6 months', 
    value: '6m', 
    getRange: () => ({ 
      from: subMonths(new Date(), 6), 
      to: new Date() 
    })
  },
  { 
    label: 'Last year', 
    value: '1y', 
    getRange: () => ({ 
      from: subYears(new Date(), 1), 
      to: new Date() 
    })
  },
  { 
    label: 'Year to date', 
    value: 'ytd', 
    getRange: () => ({ 
      from: new Date(new Date().getFullYear(), 0, 1), 
      to: new Date() 
    })
  },
];

const COMPARISON_OPTIONS = [
  { label: 'Previous Period', value: 'previous' },
  { label: 'Same Period Last Year', value: 'year_over_year' },
  { label: 'Same Period Last Month', value: 'month_over_month' },
  { label: 'Custom Comparison', value: 'custom' },
];

const REFRESH_INTERVALS = [
  { label: 'Off', value: 0 },
  { label: '30s', value: 30 },
  { label: '1m', value: 60 },
  { label: '5m', value: 300 },
  { label: '15m', value: 900 },
  { label: '30m', value: 1800 },
  { label: '1h', value: 3600 },
];

export function TimeFrameControls({
  onTimeRangeChange,
  currentRange,
  enableRealTime = false,
  enableComparison = false,
  enableCustom = true,
  refreshInterval = 0,
  className = "",
}: TimeFrameControlsProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>('30d');
  const [customFromDate, setCustomFromDate] = useState<Date>();
  const [customToDate, setCustomToDate] = useState<Date>();
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(false);
  const [currentRefreshInterval, setCurrentRefreshInterval] = useState(refreshInterval);
  const [comparisonEnabled, setComparisonEnabled] = useState(false);
  const [comparisonType, setComparisonType] = useState<string>('previous');
  const [comparisonRange, setComparisonRange] = useState<TimeRange | null>(null);
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  // Auto refresh effect
  useEffect(() => {
    if (!isRealTimeEnabled || currentRefreshInterval === 0) return;

    const interval = setInterval(() => {
      if (currentRange) {
        // Update the current range to extend to "now" for real-time data
        const updatedRange = {
          ...currentRange,
          to: new Date(),
        };
        onTimeRangeChange(updatedRange);
      }
    }, currentRefreshInterval * 1000);

    return () => clearInterval(interval);
  }, [isRealTimeEnabled, currentRefreshInterval, currentRange, onTimeRangeChange]);

  const handlePresetChange = (presetValue: string) => {
    setSelectedPreset(presetValue);
    setShowCustomPicker(false);
    
    const preset = PRESET_RANGES.find(r => r.value === presetValue);
    if (preset) {
      const range = preset.getRange();
      const timeRange: TimeRange = {
        from: new Date(range.from),
        to: new Date(range.to),
        label: preset.label,
        value: preset.value,
      };
      onTimeRangeChange(timeRange);
      
      // Calculate comparison range if enabled
      if (comparisonEnabled) {
        calculateComparisonRange(timeRange);
      }
    }
  };

  const handleCustomRange = () => {
    if (customFromDate && customToDate) {
      const timeRange: TimeRange = {
        from: startOfDay(customFromDate),
        to: endOfDay(customToDate),
        label: '${format(customFromDate, 'MMM d')} - ${format(customToDate, 'MMM d, yyyy')}',
        value: 'custom',
      };
      onTimeRangeChange(timeRange);
      setShowCustomPicker(false);
      setSelectedPreset('custom');
      
      if (comparisonEnabled) {
        calculateComparisonRange(timeRange);
      }
    }
  };

  const calculateComparisonRange = (primaryRange: TimeRange) => {
    const daysDifference = Math.ceil((primaryRange.to.getTime() - primaryRange.from.getTime()) / (1000 * 60 * 60 * 24));
    let comparisonFrom: Date;
    let comparisonTo: Date;

    switch (comparisonType) {
      case 'previous':
        comparisonTo = new Date(primaryRange.from);
        comparisonFrom = subDays(comparisonTo, daysDifference);
        break;
      case 'year_over_year':
        comparisonFrom = subYears(primaryRange.from, 1);
        comparisonTo = subYears(primaryRange.to, 1);
        break;
      case 'month_over_month':
        comparisonFrom = subMonths(primaryRange.from, 1);
        comparisonTo = subMonths(primaryRange.to, 1);
        break;
      default:
        comparisonFrom = subDays(primaryRange.from, daysDifference);
        comparisonTo = new Date(primaryRange.from);
    }

    const compRange: TimeRange = {
      from: comparisonFrom,
      to: comparisonTo,
      label: 'Comparison: ${format(comparisonFrom, 'MMM d')} - ${format(comparisonTo, 'MMM d, yyyy')}',
      value: 'comparison`,
    };

    setComparisonRange(compRange);
  };

  const toggleRealTime = () => {
    setIsRealTimeEnabled(!isRealTimeEnabled);
  };

  const handleRefreshIntervalChange = (interval: string) => {
    const intervalValue = parseInt(interval);
    setCurrentRefreshInterval(intervalValue);
    
    if (intervalValue === 0) {
      setIsRealTimeEnabled(false);
    }
  };

  const toggleComparison = () => {
    setComparisonEnabled(!comparisonEnabled);
    if (!comparisonEnabled && currentRange) {
      calculateComparisonRange(currentRange);
    } else {
      setComparisonRange(null);
    }
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago';
  };

  return (
    <Card className={'time-frame-controls ${className}'}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Time Range</CardTitle>
          <div className="flex items-center gap-2">
            {isRealTimeEnabled && (
              <Badge variant="outline" className="text-green-500 border-green-500">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
                Live
              </Badge>
            )}
            {comparisonEnabled && (
              <Badge variant="outline" className="text-blue-500 border-blue-500">
                <TrendingUp className="w-3 h-3 mr-1" />
                Compare
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preset Time Ranges */}
        <div className="grid grid-cols-3 gap-2">
          {PRESET_RANGES.slice(0, 9).map((preset) => (
            <Button
              key={preset.value}
              variant={selectedPreset === preset.value ? "default" : "outline"}
              size="sm"
              onClick={() => handlePresetChange(preset.value)}
              className="text-xs"
            >
              {preset.label}
            </Button>
          ))}
        </div>

        {/* Custom Date Picker */}
        {enableCustom && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Button
                variant={showCustomPicker ? "default" : "outline"}
                size="sm"
                onClick={() => setShowCustomPicker(!showCustomPicker)}
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                Custom Range
              </Button>
            </div>

            {showCustomPicker && (
              <div className="space-y-3 p-3 border rounded-lg bg-muted/30">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>From Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          {customFromDate ? format(customFromDate, 'MMM d, yyyy') : 'Select date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={customFromDate}
                          onSelect={setCustomFromDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>To Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          {customToDate ? format(customToDate, 'MMM d, yyyy') : 'Select date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={customToDate}
                          onSelect={setCustomToDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <Button 
                  onClick={handleCustomRange}
                  disabled={!customFromDate || !customToDate}
                  className="w-full"
                >
                  Apply Custom Range
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Real-time Controls */}
        {enableRealTime && (
          <div className="space-y-3 p-3 border rounded-lg bg-muted/30">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Real-time Updates</Label>
              <Button
                variant={isRealTimeEnabled ? "default" : "outline"}
                size="sm"
                onClick={toggleRealTime}
              >
                {isRealTimeEnabled ? (
                  <Pause className="h-4 w-4 mr-2" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                {isRealTimeEnabled ? 'Pause' : 'Start'}
              </Button>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Refresh Interval</Label>
              <Select 
                value={currentRefreshInterval.toString()} 
                onValueChange={handleRefreshIntervalChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REFRESH_INTERVALS.map((interval) => (
                    <SelectItem key={interval.value} value={interval.value.toString()}>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {interval.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isRealTimeEnabled && currentRange && (
              <div className="text-xs text-muted-foreground">
                Last updated: {formatRelativeTime(currentRange.to)}
              </div>
            )}
          </div>
        )}

        {/* Comparison Controls */}
        {enableComparison && (
          <div className="space-y-3 p-3 border rounded-lg bg-muted/30">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Compare Periods</Label>
              <Button
                variant={comparisonEnabled ? "default" : "outline"}
                size="sm"
                onClick={toggleComparison}
              >
                {comparisonEnabled ? (
                  <TrendingDown className="h-4 w-4 mr-2" />
                ) : (
                  <TrendingUp className="h-4 w-4 mr-2" />
                )}
                {comparisonEnabled ? 'Disable' : 'Enable'}
              </Button>
            </div>

            {comparisonEnabled && (
              <>
                <div className="space-y-2">
                  <Label className="text-sm">Comparison Type</Label>
                  <Select value={comparisonType} onValueChange={setComparisonType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPARISON_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {comparisonRange && (
                  <div className="text-xs text-muted-foreground border rounded p-2 bg-background/50">
                    <div className="font-medium mb-1">Comparison Period:</div>
                    <div>{comparisonRange.label}</div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Current Range Display */}
        {currentRange && (
          <div className="text-sm text-muted-foreground border rounded p-3 bg-background/50">
            <div className="font-medium mb-1">Current Range:</div>
            <div className="flex items-center gap-2">
              <span>{format(currentRange.from, 'MMM d, yyyy HH:mm')}</span>
              <ArrowRight className="h-3 w-3" />
              <span>{format(currentRange.to, 'MMM d, yyyy HH:mm')}</span>
            </div>
            {isRealTimeEnabled && (
              <div className="text-xs text-green-500 mt-1">
                • Auto-refreshing every {currentRefreshInterval}s
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}