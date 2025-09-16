"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Activity,
  RefreshCw,
  Settings,
  Plug,
  Unplug,
  Clock,
  TrendingUp,
  Zap,
  Shield
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

interface IntegrationCardProps {
  integration: Integration;
  variant?: 'connected' | 'available' | 'featured';
  onConnect: () => void;
  onDisconnect: () => void;
  onConfigure: () => void;
  onSync: () => void;
  className?: string;
}

export function IntegrationCard({
  integration,
  variant = 'available',
  onConnect,
  onDisconnect,
  onConfigure,
  onSync,
  className
}: IntegrationCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const getStatusIcon = (status: string, health: string) => {
    if (status === 'connected' && health === 'healthy') return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (status === 'warning' || health === 'degraded') return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    if (status === 'disconnected' || health === 'offline') return <XCircle className="h-4 w-4 text-red-500" />;
    return <Activity className="h-4 w-4 text-neutral-400" />;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      connected: 'bg-green-500/10 text-green-500 border-green-500/20',
      disconnected: 'bg-red-500/10 text-red-500 border-red-500/20',
      warning: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      available: 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20'
    };
    
    return variants[status as keyof typeof variants] || variants.available;
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Easy': return 'text-green-500';
      case 'Medium': return 'text-yellow-500';
      case 'Hard': return 'text-red-500';
      default: return 'text-neutral-400';
    }
  };

  const handleAction = async (action: () => void) => {
    setIsLoading(true);
    try {
      await action();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={'relative transition-all duration-200 hover:shadow-lg ${className}'}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{integration.icon}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">{integration.name}</CardTitle>
                {variant === 'featured' && (
                  <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-500 border-blue-500/20">
                    Featured
                  </Badge>
                )}
              </div>
              <CardDescription className="text-sm capitalize">
                {integration.category}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(integration.status, integration.health)}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {integration.description}
        </p>
        
        {/* Status and Setup Info */}
        <div className="flex items-center justify-between">
          <Badge className={getStatusBadge(integration.status)} variant="outline">
            {integration.status}
          </Badge>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>Setup:</span>
            <span className={getComplexityColor(integration.setupComplexity)}>
              {integration.setupComplexity}
            </span>
          </div>
        </div>

        {/* Connected Integration Details */}
        {integration.isConnected && (
          <div className="space-y-3 pt-2 border-t border-border/50">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="flex items-center gap-1 text-muted-foreground mb-1">
                  <Clock className="h-3 w-3" />
                  <span>Last Sync</span>
                </div>
                <div className="font-medium">
                  {integration.lastSync ? 
                    integration.lastSync.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    }) : 'Never'
                  }
                </div>
              </div>
              
              <div>
                <div className="flex items-center gap-1 text-muted-foreground mb-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>Records</span>
                </div>
                <div className="font-medium">
                  {integration.syncedRecords.toLocaleString()}
                </div>
              </div>
              
              <div>
                <div className="flex items-center gap-1 text-muted-foreground mb-1">
                  <Zap className="h-3 w-3" />
                  <span>Success Rate</span>
                </div>
                <div className="font-medium">
                  {integration.metrics.successRate}%
                </div>
              </div>
              
              <div>
                <div className="flex items-center gap-1 text-muted-foreground mb-1">
                  <Activity className="h-3 w-3" />
                  <span>Response</span>
                </div>
                <div className="font-medium">
                  {integration.metrics.avgResponseTime}ms
                </div>
              </div>
            </div>

            {/* AI Features */}
            {integration.aiFeatures.length > 0 && (
              <div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                  <Shield className="h-3 w-3" />
                  <span>AI Features</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {integration.aiFeatures.slice(0, 2).map((feature, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="text-xs bg-purple-500/10 text-purple-400 border-purple-500/20"
                    >
                      {feature}
                    </Badge>
                  ))}
                  {integration.aiFeatures.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{integration.aiFeatures.length - 2}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {integration.isConnected ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAction(onSync)}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-1" />
                )}
                Sync
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAction(onConfigure)}
                disabled={isLoading}
              >
                <Settings className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAction(onDisconnect)}
                disabled={isLoading}
                className="text-red-500 hover:text-red-600 hover:border-red-500/50"
              >
                <Unplug className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button
              onClick={() => handleAction(onConnect)}
              disabled={isLoading}
              className="w-full"
              size="sm"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Plug className="h-4 w-4 mr-2" />
              )}
              Connect
            </Button>
          )}
        </div>

        {/* Error/Warning Indicators */}
        {integration.errorCount > 0 && (
          <div className="flex items-center gap-2 p-2 rounded-md bg-yellow-500/10 border border-yellow-500/20">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <span className="text-sm text-yellow-600">
              {integration.errorCount} error{integration.errorCount > 1 ? 's' : '} in last 24h
            </span>
          </div>
        )}

        {integration.incidents.length > 0 && (
          <div className="flex items-center gap-2 p-2 rounded-md bg-red-500/10 border border-red-500/20">
            <XCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm text-red-600">
              {integration.incidents.length} active incident{integration.incidents.length > 1 ? 's' : '}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}