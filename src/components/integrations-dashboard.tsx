"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  Users,
  Zap,
  RefreshCw
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  status: 'connected' | 'disconnected' | 'warning' | 'available';
  isConnected: boolean;
  lastSync: Date | null;
  health: 'healthy' | 'degraded' | 'offline' | 'unknown';
  dataFlows: string[];
  aiFeatures: string[];
  webhooksEnabled: boolean;
  createdAt: string;
  syncedRecords: number;
  errorCount: number;
  accuracy: number;
  setupComplexity: 'Easy' | 'Medium' | 'Hard';
  monthlyTransactions: number;
  incidents: unknown[];
  metrics: {
    apiCalls: number;
    successRate: number;
    avgResponseTime: number;
  };
  config: Record<string, unknown>;
}

interface Stats {
  totalIntegrations: number;
  connectedIntegrations: number;
  totalApiCalls: number;
  averageHealth: number;
  activeWebhooks: number;
  failedJobs: number;
}

interface Category {
  name: string;
  integrations: number;
  monthlyVolume: number;
  accuracy: number;
  description: string;
}

interface Insight {
  type: 'recommendation' | 'alert' | 'optimization';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'error';
  actionLabel: string;
  timestamp: Date;
}

interface IntegrationsDashboardProps {
  integrations: Integration[];
  stats: Stats;
  categories: Category[];
  insights: Insight[];
  onConnect: (id: string) => void;
  onDisconnect: (id: string) => void;
  onConfigure: (id: string) => void;
  onSync: (id: string) => void;
  className?: string;
}

export function IntegrationsDashboard({
  integrations,
  stats,
  categories,
  insights,
  onConnect,
  onDisconnect,
  onConfigure,
  onSync,
  className
}: IntegrationsDashboardProps) {
  const [searchTerm, setSearchTerm] = useState(');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || integration.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || integration.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusIcon = (status: string, health: string) => {
    if (status === 'connected' && health === 'healthy') return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (status === 'warning' || health === 'degraded') return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    if (status === 'disconnected' || health === 'offline') return <XCircle className="h-4 w-4 text-red-500" />;
    return <Activity className="h-4 w-4 text-neutral-400" />;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      connected: 'bg-green-500/10 text-green-500',
      disconnected: 'bg-red-500/10 text-red-500',
      warning: 'bg-yellow-500/10 text-yellow-500',
      available: 'bg-neutral-500/10 text-neutral-400'
    };
    
    return variants[status as keyof typeof variants] || variants.available;
  };

  return (
    <div className={'space-y-6 ${className}'}>
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Integrations</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalIntegrations}</div>
            <p className="text-xs text-muted-foreground">
              {stats.connectedIntegrations} connected
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Calls</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalApiCalls.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageHealth}%</div>
            <p className="text-xs text-muted-foreground">Average uptime</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Webhooks</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeWebhooks}</div>
            <p className="text-xs text-muted-foreground">
              {stats.failedJobs} failed jobs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search integrations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 rounded-md border border-border bg-background"
          >
            <option value="all">All Categories</option>
            <option value="payments">Payments</option>
            <option value="accounting">Accounting</option>
            <option value="scheduling">Scheduling</option>
            <option value="marketing">Marketing</option>
            <option value="communication">Communication</option>
            <option value="automation">Automation</option>
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-md border border-border bg-background"
          >
            <option value="all">All Status</option>
            <option value="connected">Connected</option>
            <option value="disconnected">Disconnected</option>
            <option value="warning">Warning</option>
            <option value="available">Available</option>
          </select>
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>AI Insights</CardTitle>
            <CardDescription>Smart recommendations and alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.slice(0, 3).map((insight, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className={'p-1 rounded-full ${
                    insight.severity === 'error' ? 'bg-red-500/10' :
                    insight.severity === 'warning' ? 'bg-yellow-500/10' : 'bg-blue-500/10'
                  }'}>
                    {insight.severity === 'error' ? 
                      <XCircle className="h-4 w-4 text-red-500" /> :
                      insight.severity === 'warning' ? 
                      <AlertTriangle className="h-4 w-4 text-yellow-500" /> :
                      <Activity className="h-4 w-4 text-blue-500" />
                    }
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    {insight.actionLabel}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Integrations Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredIntegrations.map((integration) => (
          <Card key={integration.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{integration.icon}</div>
                  <div>
                    <CardTitle className="text-base">{integration.name}</CardTitle>
                    <CardDescription className="text-sm">{integration.category}</CardDescription>
                  </div>
                </div>
                {getStatusIcon(integration.status, integration.health)}
              </div>
            </CardHeader>
            
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{integration.description}</p>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Status</span>
                  <Badge className={getStatusBadge(integration.status)}>
                    {integration.status}
                  </Badge>
                </div>
                
                {integration.isConnected && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span>Last Sync</span>
                      <span className="text-muted-foreground">
                        {integration.lastSync?.toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>Records Synced</span>
                      <span className="text-muted-foreground">
                        {integration.syncedRecords.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>Accuracy</span>
                      <span className="text-muted-foreground">{integration.accuracy}%</span>
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex gap-2 mt-4">
                {integration.isConnected ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSync(integration.id)}
                      className="flex-1"
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Sync
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onConfigure(integration.id)}
                    >
                      Configure
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDisconnect(integration.id)}
                    >
                      Disconnect
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => onConnect(integration.id)}
                    className="w-full"
                    size="sm"
                  >
                    Connect
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredIntegrations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No integrations found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}