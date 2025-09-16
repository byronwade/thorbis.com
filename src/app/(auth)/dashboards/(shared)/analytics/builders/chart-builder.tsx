"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TradingViewWrapper, TradingViewWrapperRef, TradingViewChartData } from '../advanced-charts/trading-view-wrapper';
import { 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  Settings2, 
  Palette, 
  BarChart3, 
  LineChart, 
  TrendingUp, 
  Activity,
  PieChart,
  Save,
  Download,
  Share2,
  RefreshCw,
  Filter,
  ArrowUp,
  ArrowDown,
  Zap
} from 'lucide-react';

export interface ChartMetric {
  id: string;
  name: string;
  field: string;
  aggregation: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'median';
  color?: string;
  visible: boolean;
}

export interface ChartFilter {
  id: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in';
  value: string | string[];
  enabled: boolean;
}

export interface ChartDimension {
  id: string;
  field: string;
  name: string;
  type: 'date' | 'string' | 'number';
  groupBy?: 'hour' | 'day' | 'week' | 'month' | 'year';
}

export interface ChartConfig {
  id: string;
  name: string;
  description?: string;
  type: 'line' | 'area' | 'candlestick' | 'histogram' | 'bar';
  dataSource: string;
  metrics: ChartMetric[];
  dimensions: ChartDimension[];
  filters: ChartFilter[];
  options: {
    showLegend: boolean;
    showGrid: boolean;
    enableZoom: boolean;
    enablePan: boolean;
    height: number;
    theme: 'dark' | 'light';
    smoothing: boolean;
    fillArea: boolean;
    showDataPoints: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ChartBuilderProps {
  initialConfig?: ChartConfig;
  availableDataSources: Array<{
    id: string;
    name: string;
    fields: Array<{
      name: string;
      type: 'string' | 'number' | 'date' | 'boolean';
      description?: string;
    }>;
  }>;
  onSave: (config: ChartConfig) => void;
  onPreview: (config: ChartConfig) => Promise<TradingViewChartData[]>;
  className?: string;
}

const CHART_TYPES = [
  { value: 'line', label: 'Line Chart', icon: LineChart },
  { value: 'area', label: 'Area Chart', icon: TrendingUp },
  { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
  { value: 'histogram', label: 'Histogram', icon: Activity },
  { value: 'candlestick', label: 'Candlestick', icon: PieChart },
];

const AGGREGATIONS = [
  { value: 'sum', label: 'Sum' },
  { value: 'avg', label: 'Average' },
  { value: 'count', label: 'Count' },
  { value: 'min', label: 'Minimum' },
  { value: 'max', label: 'Maximum' },
  { value: 'median', label: 'Median' },
];

const FILTER_OPERATORS = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not Equals' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'less_than', label: 'Less Than' },
  { value: 'contains', label: 'Contains' },
  { value: 'in', label: 'In List' },
];

const COLORS = [
  '#1C8BFF', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
];

export function ChartBuilder({
  initialConfig,
  availableDataSources,
  onSave,
  onPreview,
  className = "",
}: ChartBuilderProps) {
  const [config, setConfig] = useState<ChartConfig>(() => 
    initialConfig || {
      id: 'chart_${Date.now()}',
      name: 'New Chart',
      description: ',
      type: 'line',
      dataSource: availableDataSources[0]?.id || ',
      metrics: [],
      dimensions: [],
      filters: [],
      options: {
        showLegend: true,
        showGrid: true,
        enableZoom: true,
        enablePan: true,
        height: 400,
        theme: 'dark',
        smoothing: false,
        fillArea: false,
        showDataPoints: false,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  );

  const [previewData, setPreviewData] = useState<TradingViewChartData[]>([]);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [isDirty, setIsDirty] = useState(false);
  
  const chartRef = useRef<TradingViewWrapperRef>(null);

  const updateConfig = (updates: Partial<ChartConfig>) => {
    setConfig(prev => ({
      ...prev,
      ...updates,
      updatedAt: new Date(),
    }));
    setIsDirty(true);
  };

  const addMetric = () => {
    const currentDataSource = availableDataSources.find(ds => ds.id === config.dataSource);
    const numericFields = currentDataSource?.fields.filter(f => f.type === 'number') || [];
    
    if (numericFields.length === 0) return;

    const newMetric: ChartMetric = {
      id: 'metric_${Date.now()}',
      name: numericFields[0].name,
      field: numericFields[0].name,
      aggregation: 'sum',
      color: COLORS[config.metrics.length % COLORS.length],
      visible: true,
    };

    updateConfig({
      metrics: [...config.metrics, newMetric],
    });
  };

  const updateMetric = (metricId: string, updates: Partial<ChartMetric>) => {
    updateConfig({
      metrics: config.metrics.map(m => 
        m.id === metricId ? { ...m, ...updates } : m
      ),
    });
  };

  const removeMetric = (metricId: string) => {
    updateConfig({
      metrics: config.metrics.filter(m => m.id !== metricId),
    });
  };

  const addDimension = () => {
    const currentDataSource = availableDataSources.find(ds => ds.id === config.dataSource);
    const availableFields = currentDataSource?.fields || [];
    
    if (availableFields.length === 0) return;

    const newDimension: ChartDimension = {
      id: 'dimension_${Date.now()}',
      field: availableFields[0].name,
      name: availableFields[0].name,
      type: availableFields[0].type as 'date' | 'string' | 'number',
      groupBy: availableFields[0].type === 'date' ? 'day' : undefined,
    };

    updateConfig({
      dimensions: [...config.dimensions, newDimension],
    });
  };

  const updateDimension = (dimensionId: string, updates: Partial<ChartDimension>) => {
    updateConfig({
      dimensions: config.dimensions.map(d => 
        d.id === dimensionId ? { ...d, ...updates } : d
      ),
    });
  };

  const removeDimension = (dimensionId: string) => {
    updateConfig({
      dimensions: config.dimensions.filter(d => d.id !== dimensionId),
    });
  };

  const addFilter = () => {
    const currentDataSource = availableDataSources.find(ds => ds.id === config.dataSource);
    const availableFields = currentDataSource?.fields || [];
    
    if (availableFields.length === 0) return;

    const newFilter: ChartFilter = {
      id: 'filter_${Date.now()}',
      field: availableFields[0].name,
      operator: 'equals',
      value: ',
      enabled: true,
    };

    updateConfig({
      filters: [...config.filters, newFilter],
    });
  };

  const updateFilter = (filterId: string, updates: Partial<ChartFilter>) => {
    updateConfig({
      filters: config.filters.map(f => 
        f.id === filterId ? { ...f, ...updates } : f
      ),
    });
  };

  const removeFilter = (filterId: string) => {
    updateConfig({
      filters: config.filters.filter(f => f.id !== filterId),
    });
  };

  const handlePreview = async () => {
    if (config.metrics.length === 0) return;

    setIsPreviewLoading(true);
    try {
      const data = await onPreview(config);
      setPreviewData(data);
    } catch (error) {
      console.error('Preview failed:', error);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleSave = () => {
    onSave(config);
    setIsDirty(false);
  };

  const currentDataSource = availableDataSources.find(ds => ds.id === config.dataSource);
  const availableFields = currentDataSource?.fields || [];

  useEffect(() => {
    if (config.metrics.length > 0) {
      handlePreview();
    }
  }, [config]);

  return (
    <div className={'chart-builder ${className} grid grid-cols-1 lg:grid-cols-2 gap-6'}>
      {/* Configuration Panel */}
      <Card className="h-fit">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              Chart Builder
            </CardTitle>
            <div className="flex items-center gap-2">
              {isDirty && (
                <Badge variant="secondary">
                  <Zap className="h-3 w-3 mr-1" />
                  Unsaved
                </Badge>
              )}
              <Button variant="outline" size="sm" onClick={handleSave} disabled={!isDirty}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
              <TabsTrigger value="filters">Filters</TabsTrigger>
              <TabsTrigger value="style">Style</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label>Chart Name</Label>
                <Input
                  value={config.name}
                  onChange={(e) => updateConfig({ name: e.target.value })}
                  placeholder="Enter chart name"
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={config.description || ''}
                  onChange={(e) => updateConfig({ description: e.target.value })}
                  placeholder="Enter chart description"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Data Source</Label>
                <Select value={config.dataSource} onValueChange={(value) => updateConfig({ dataSource: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDataSources.map((ds) => (
                      <SelectItem key={ds.id} value={ds.id}>
                        {ds.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Chart Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  {CHART_TYPES.map((type) => {
                    const Icon = type.icon;
                    return (
                      <Button
                        key={type.value}
                        variant={config.type === type.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateConfig({ type: type.value as any })}
                        className="flex items-center gap-2"
                      >
                        <Icon className="h-4 w-4" />
                        {type.label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Dimensions</Label>
                <div className="space-y-2">
                  {config.dimensions.map((dimension) => (
                    <div key={dimension.id} className="flex items-center gap-2 p-2 border rounded">
                      <Select 
                        value={dimension.field} 
                        onValueChange={(value) => {
                          const field = availableFields.find(f => f.name === value);
                          updateDimension(dimension.id, { 
                            field: value, 
                            name: value,
                            type: field?.type as any 
                          });
                        }}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {availableFields.map((field) => (
                            <SelectItem key={field.name} value={field.name}>
                              {field.name} ({field.type})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {dimension.type === 'date' && (
                        <Select 
                          value={dimension.groupBy || 'day'} 
                          onValueChange={(value) => updateDimension(dimension.id, { groupBy: value as any })}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hour">Hour</SelectItem>
                            <SelectItem value="day">Day</SelectItem>
                            <SelectItem value="week">Week</SelectItem>
                            <SelectItem value="month">Month</SelectItem>
                            <SelectItem value="year">Year</SelectItem>
                          </SelectContent>
                        </Select>
                      )}

                      <Button variant="ghost" size="sm" onClick={() => removeDimension(dimension.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addDimension} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Dimension
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="metrics" className="space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <Label>Metrics</Label>
                <Button variant="outline" size="sm" onClick={addMetric}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Metric
                </Button>
              </div>

              <div className="space-y-3">
                <AnimatePresence>
                  {config.metrics.map((metric) => (
                    <motion.div
                      key={metric.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-3 border rounded-lg space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: metric.color }}
                          />
                          <span className="font-medium">{metric.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateMetric(metric.id, { visible: !metric.visible })}
                          >
                            {metric.visible ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => removeMetric(metric.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Field</Label>
                          <Select 
                            value={metric.field} 
                            onValueChange={(value) => updateMetric(metric.id, { field: value, name: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {availableFields
                                .filter(f => f.type === 'number')
                                .map((field) => (
                                  <SelectItem key={field.name} value={field.name}>
                                    {field.name}
                                  </SelectItem>
                                ))
                              }
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs">Aggregation</Label>
                          <Select 
                            value={metric.aggregation} 
                            onValueChange={(value) => updateMetric(metric.id, { aggregation: value as any })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {AGGREGATIONS.map((agg) => (
                                <SelectItem key={agg.value} value={agg.value}>
                                  {agg.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Color</Label>
                        <div className="flex gap-1">
                          {COLORS.map((color) => (
                            <button
                              key={color}
                              className={'w-6 h-6 rounded-full border-2 ${
                                metric.color === color ? 'border-foreground' : 'border-transparent'
                              }'}
                              style={{ backgroundColor: color }}
                              onClick={() => updateMetric(metric.id, { color })}
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {config.metrics.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    No metrics defined. Add a metric to get started.
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="filters" className="space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <Label>Filters</Label>
                <Button variant="outline" size="sm" onClick={addFilter}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Filter
                </Button>
              </div>

              <div className="space-y-3">
                <AnimatePresence>
                  {config.filters.map((filter) => (
                    <motion.div
                      key={filter.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-3 border rounded-lg space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <Switch
                          checked={filter.enabled}
                          onCheckedChange={(checked) => updateFilter(filter.id, { enabled: checked })}
                        />
                        <Button variant="ghost" size="sm" onClick={() => removeFilter(filter.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Field</Label>
                          <Select 
                            value={filter.field} 
                            onValueChange={(value) => updateFilter(filter.id, { field: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {availableFields.map((field) => (
                                <SelectItem key={field.name} value={field.name}>
                                  {field.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs">Operator</Label>
                          <Select 
                            value={filter.operator} 
                            onValueChange={(value) => updateFilter(filter.id, { operator: value as any })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {FILTER_OPERATORS.map((op) => (
                                <SelectItem key={op.value} value={op.value}>
                                  {op.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs">Value</Label>
                          <Input
                            value={Array.isArray(filter.value) ? filter.value.join(', ') : filter.value}
                            onChange={(e) => {
                              const value = filter.operator === 'in' 
                                ? e.target.value.split(',').map(v => v.trim())
                                : e.target.value;
                              updateFilter(filter.id, { value });
                            }}
                            placeholder="Enter value"
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {config.filters.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    No filters defined. Add a filter to refine your data.
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="style" className="space-y-4 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Height (px)</Label>
                  <Input
                    type="number"
                    value={config.options.height}
                    onChange={(e) => updateConfig({
                      options: { ...config.options, height: parseInt(e.target.value) || 400 }
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select 
                    value={config.options.theme} 
                    onValueChange={(value) => updateConfig({
                      options: { ...config.options, theme: value as 'dark' | 'light' }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Show Legend</Label>
                  <Switch
                    checked={config.options.showLegend}
                    onCheckedChange={(checked) => updateConfig({
                      options: { ...config.options, showLegend: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Show Grid</Label>
                  <Switch
                    checked={config.options.showGrid}
                    onCheckedChange={(checked) => updateConfig({
                      options: { ...config.options, showGrid: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Enable Zoom</Label>
                  <Switch
                    checked={config.options.enableZoom}
                    onCheckedChange={(checked) => updateConfig({
                      options: { ...config.options, enableZoom: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Enable Pan</Label>
                  <Switch
                    checked={config.options.enablePan}
                    onCheckedChange={(checked) => updateConfig({
                      options: { ...config.options, enablePan: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Line Smoothing</Label>
                  <Switch
                    checked={config.options.smoothing}
                    onCheckedChange={(checked) => updateConfig({
                      options: { ...config.options, smoothing: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Fill Area</Label>
                  <Switch
                    checked={config.options.fillArea}
                    onCheckedChange={(checked) => updateConfig({
                      options: { ...config.options, fillArea: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Show Data Points</Label>
                  <Switch
                    checked={config.options.showDataPoints}
                    onCheckedChange={(checked) => updateConfig({
                      options: { ...config.options, showDataPoints: checked }
                    })}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Preview Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Chart Preview
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePreview} disabled={isPreviewLoading}>
                <RefreshCw className={'h-4 w-4 mr-2 ${isPreviewLoading ? 'animate-spin' : '}'} />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={() => chartRef.current?.exportToPDF()}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {config.metrics.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Add metrics to see chart preview</p>
              </div>
            </div>
          ) : isPreviewLoading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-4">
              {config.description && (
                <p className="text-sm text-muted-foreground">{config.description}</p>
              )}
              
              <TradingViewWrapper
                ref={chartRef}
                data={previewData}
                type={config.type}
                height={config.options.height}
                theme={config.options.theme}
                enablePanning={config.options.enablePan}
                enableZooming={config.options.enableZoom}
                showTimeScale={true}
                showPriceScale={true}
                enableCrosshair={true}
                className="border rounded-lg"
              />

              {config.metrics.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  Preview based on {config.metrics.length} metric{config.metrics.length > 1 ? 's' : '} 
                  {config.filters.filter(f => f.enabled).length > 0 && 
                    ' with ${config.filters.filter(f => f.enabled).length} filter${config.filters.filter(f => f.enabled).length > 1 ? 's' : '}'
                  }
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}