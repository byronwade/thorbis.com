"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Settings2, Clock, Database, Download, Zap, Calendar, Filter, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TimeFrameControls, TimeRange } from "@/components/analytics/controls/time-frame-controls";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AnalyticsBackButton } from "@/components/analytics/analytics-back-button";

export default function AnalyticsControls() {
  const searchParams = useSearchParams();
  const fromIndustry = searchParams.get('from');
  
  const [currentTimeRange, setCurrentTimeRange] = useState<TimeRange>();
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [dataRetention, setDataRetention] = useState('90');

  // Mock data sources for controls
  const availableDataSources = [
    {
      id: 'analytics',
      name: 'Analytics Data',
      status: 'connected',
      lastSync: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      fields: 8
    },
    {
      id: 'field_service',
      name: 'Field Service Data', 
      status: 'connected',
      lastSync: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
      fields: 6
    },
    {
      id: 'financial',
      name: 'Financial Data',
      status: 'syncing',
      lastSync: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      fields: 6
    },
    {
      id: 'customer_behavior',
      name: 'Customer Behavior',
      status: 'connected',
      lastSync: new Date(Date.now() - 1 * 60 * 1000), // 1 minute ago
      fields: 6
    }
  ];

  const handleTimeRangeChange = (range: TimeRange) => {
    setCurrentTimeRange(range);
    console.log('Time range changed:', range);
  };

  const handleExportSettings = () => {
    console.log('Export settings:', { format: exportFormat, range: currentTimeRange });
  };

  const handleDataSync = (sourceId: string) => {
    console.log('Syncing data source:', sourceId);
    // Here you would trigger a data sync
  };

  const formatLastSync = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    return `${Math.floor(diffMins / 60)}h ago';
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header with back button - full width edge-to-edge */}
      <div className="border-b bg-card">
        <div className="flex items-center gap-4 p-4">
          <AnalyticsBackButton />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">Analytics Controls</h1>
              <Badge variant="outline" className="bg-slate-500/20 text-slate-600 border-slate-500/30">
                Time & Export Settings
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {fromIndustry ? 'Control settings for ${fromIndustry.toUpperCase()} Industry analytics' : 'Configure time ranges, data sources, export options, and system settings'}
            </p>
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportSettings}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh All
            </Button>
          </div>
        </div>
      </div>

      {/* System Status Bar */}
      <div className="border-b bg-muted/30 px-4 py-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>System Status: Operational</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span>Last Update: {formatLastSync(new Date())}</span>
            </div>
            <div className="flex items-center gap-2">
              <Database className="h-3 w-3" />
              <span>{availableDataSources.filter(s => s.status === 'connected').length}/{availableDataSources.length} Sources Connected</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {realTimeEnabled && (
              <div className="flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-600 rounded border border-green-500/20">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                Real-time Active
              </div>
            )}
            {autoRefresh && (
              <div className="text-muted-foreground">
                Auto-refresh: {refreshInterval}s
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Controls Area - Full screen layout */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Time Frame Controls */}
          <div>
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  Time Frame Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <TimeFrameControls
                  onTimeRangeChange={handleTimeRangeChange}
                  currentRange={currentTimeRange}
                  enableRealTime={true}
                  enableComparison={true}
                  enableCustom={true}
                  refreshInterval={refreshInterval}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Real-time Updates</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={realTimeEnabled}
                        onCheckedChange={setRealTimeEnabled}
                      />
                      <span className="text-sm text-muted-foreground">
                        {realTimeEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Auto-refresh</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={autoRefresh}
                        onCheckedChange={setAutoRefresh}
                      />
                      <span className="text-sm text-muted-foreground">
                        Every {refreshInterval}s
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Refresh Interval (seconds)</Label>
                    <Input
                      type="number"
                      value={refreshInterval}
                      onChange={(e) => setRefreshInterval(parseInt(e.target.value) || 30)}
                      min="5"
                      max="300"
                      className="w-full"
                      disabled={!autoRefresh}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Data Sources Management */}
          <div>
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-green-500" />
                  Data Sources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableDataSources.map((source) => (
                    <div key={source.id} className="p-4 border rounded-lg bg-muted/30">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={'w-2 h-2 rounded-full ${
                            source.status === 'connected' ? 'bg-green-500' :
                            source.status === 'syncing' ? 'bg-yellow-500 animate-pulse' :
                            'bg-red-500'
                          }'}></div>
                          <span className="font-medium">{source.name}</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDataSync(source.id)}
                          disabled={source.status === 'syncing'}
                        >
                          <RefreshCw className={'h-3 w-3 mr-1 ${source.status === 'syncing' ? 'animate-spin' : '}'} />
                          Sync
                        </Button>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>Status: <span className="capitalize">{source.status}</span></div>
                        <div>Fields: {source.fields}</div>
                        <div>Last sync: {formatLastSync(source.lastSync)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Export Settings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-orange-500" />
                  Export Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Default Export Format</Label>
                  <Select value={exportFormat} onValueChange={setExportFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Report</SelectItem>
                      <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                      <SelectItem value="csv">CSV Data</SelectItem>
                      <SelectItem value="json">JSON Data</SelectItem>
                      <SelectItem value="png">PNG Image</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Data Retention (days)</Label>
                  <Select value={dataRetention} onValueChange={setDataRetention}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="180">6 months</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                      <SelectItem value="unlimited">Unlimited</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button className="flex-1" onClick={handleExportSettings}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Current View
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Zap className="h-4 w-4 mr-2" />
                    Schedule Export
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-purple-500" />
                  Global Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Industry Filter</Label>
                  <Select defaultValue={fromIndustry || 'all'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Industries</SelectItem>
                      <SelectItem value="hs">Home Services</SelectItem>
                      <SelectItem value="rest">Restaurant</SelectItem>
                      <SelectItem value="auto">Automotive</SelectItem>
                      <SelectItem value="ret">Retail</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Minimum Data Points</Label>
                  <Input type="number" placeholder="100" min="1" />
                </div>

                <div className="space-y-2">
                  <Label>Custom Filter Query</Label>
                  <Textarea 
                    placeholder="e.g., revenue > 1000 AND source = 'organic'"
                    rows={2}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1">
                    Apply Filters
                  </Button>
                  <Button variant="ghost" className="flex-1">
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Configuration */}
          <div>
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings2 className="h-5 w-5 text-slate-500" />
                  System Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Performance</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Cache Size:</span>
                        <span className="font-medium">2.4 GB</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Memory Usage:</span>
                        <span className="font-medium">187 MB</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Active Connections:</span>
                        <span className="font-medium">4/10</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Chart Settings</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Default Theme:</span>
                        <span className="font-medium">Dark</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Animation:</span>
                        <span className="font-medium">Enabled</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Max Data Points:</span>
                        <span className="font-medium">10,000</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Security</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>SSL Status:</span>
                        <span className="font-medium text-green-600">Active</span>
                      </div>
                      <div className="flex justify-between">
                        <span>API Rate Limit:</span>
                        <span className="font-medium">1000/hour</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Session Timeout:</span>
                        <span className="font-medium">4 hours</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}