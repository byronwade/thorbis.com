/**
 * Portal Metrics Card
 * Individual metric display component for analytics dashboards
 */

'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Info,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PortalMetricsCardProps {
  title: string;
  value: number | string;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  icon?: React.ReactNode;
  formatter?: (value: number | string) => string;
  target?: number;
  status?: 'good' | 'warning' | 'critical';
  description?: string;
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
}

const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
  if (!trend || trend === 'stable') return <Minus className="h-3 w-3" />;
  return trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />;
};

const getTrendColor = (trend?: 'up' | 'down' | 'stable') => {
  if (!trend || trend === 'stable') return 'text-neutral-500';
  return trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
};

const getStatusColor = (status?: 'good' | 'warning' | 'critical') => {
  switch (status) {
    case 'good': return 'text-green-600 dark:text-green-400';
    case 'warning': return 'text-yellow-600 dark:text-yellow-400';
    case 'critical': return 'text-red-600 dark:text-red-400';
    default: return 'text-neutral-500';
  }
};

const getStatusIcon = (status?: 'good' | 'warning' | 'critical') => {
  switch (status) {
    case 'good': return <CheckCircle className="h-4 w-4" />;
    case 'warning': return <AlertTriangle className="h-4 w-4" />;
    case 'critical': return <AlertTriangle className="h-4 w-4" />;
    default: return <Info className="h-4 w-4" />;
  }
};

const getTargetProgress = (value: number, target?: number) => {
  if (!target) return null;
  const progress = (value / target) * 100;
  return Math.min(Math.max(progress, 0), 100);
};

export function PortalMetricsCard({
  title,
  value,
  change,
  trend,
  icon,
  formatter,
  target,
  status,
  description,
  variant = 'default',
  className
}: PortalMetricsCardProps) {
  const formattedValue = formatter && typeof value === 'number' 
    ? formatter(value) 
    : value.toString();
  
  const targetProgress = typeof value === 'number' && target 
    ? getTargetProgress(value, target) 
    : null;

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center justify-between p-3", className)}>
        <div className="flex items-center gap-2">
          {icon}
          <div>
            <div className="text-sm font-medium text-muted-foreground">{title}</div>
            <div className="text-lg font-bold">{formattedValue}</div>
          </div>
        </div>
        
        {change !== undefined && (
          <div className={cn("flex items-center gap-1 text-xs", getTrendColor(trend))}>
            {getTrendIcon(trend)}
            {Math.abs(change).toFixed(1)}%
          </div>
        )}
      </div>
    );
  }

  // Detailed variant
  if (variant === 'detailed') {
    return (
      <Card className={className}>
        <CardContent className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {icon}
              <span className="text-sm font-medium text-muted-foreground">{title}</span>
            </div>
            {status && (
              <div className={cn("flex items-center gap-1", getStatusColor(status))}>
                {getStatusIcon(status)}
              </div>
            )}
          </div>

          {/* Main Value */}
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold">{formattedValue}</span>
            {change !== undefined && (
              <div className={cn("flex items-center gap-1 text-sm", getTrendColor(trend))}>
                {getTrendIcon(trend)}
                <span>{change > 0 ? '+' : '}{change.toFixed(1)}%</span>
              </div>
            )}
          </div>

          {/* Target Progress */}
          {targetProgress !== null && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progress to target</span>
                <span className="font-medium">{targetProgress.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-2">
                <div 
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    targetProgress >= 100 ? "bg-green-500" :
                    targetProgress >= 75 ? "bg-blue-500" :
                    targetProgress >= 50 ? "bg-yellow-500" : "bg-red-500"
                  )}
                  style={{ width: '${targetProgress}%' }}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                Target: {formatter && typeof target === 'number' ? formatter(target) : target}
              </div>
            </div>
          )}

          {/* Description */}
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}

          {/* Status Badge */}
          {status && (
            <div className="flex justify-end">
              <Badge 
                variant={status === 'good' ? 'default' : status === 'warning' ? 'secondary' : 'destructive'}
                className="text-xs"
              >
                {status === 'good' ? 'Healthy' : status === 'warning' ? 'Warning' : 'Critical`}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-sm font-medium text-muted-foreground">{title}</span>
          </div>
          {change !== undefined && (
            <div className={cn("flex items-center gap-1 text-xs", getTrendColor(trend))}>
              {getTrendIcon(trend)}
              {Math.abs(change).toFixed(1)}%
            </div>
          )}
        </div>
        
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold">{formattedValue}</span>
          {status && (
            <div className={cn("flex items-center gap-1", getStatusColor(status))}>
              {getStatusIcon(status)}
            </div>
          )}
        </div>

        {/* Target indicator */}
        {targetProgress !== null && (
          <div className="mt-2 space-y-1">
            <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-1">
              <div 
                className={cn(
                  "h-1 rounded-full transition-all duration-300",
                  targetProgress >= 100 ? "bg-green-500" :
                  targetProgress >= 75 ? "bg-blue-500" :
                  targetProgress >= 50 ? "bg-yellow-500" : "bg-red-500"
                )}
                style={{ width: `${targetProgress}%' }}
              />
            </div>
            <div className="text-xs text-muted-foreground">
              {targetProgress.toFixed(0)}% of target
            </div>
          </div>
        )}

        {description && (
          <p className="text-xs text-muted-foreground mt-2">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

// Pre-configured metric cards for common use cases
export const ActiveUsersCard = (props: Partial<PortalMetricsCardProps> & { value: number }) => (
  <PortalMetricsCard
    title="Active Users"
    icon={<TrendingUp className="h-4 w-4" />}
    formatter={(value) => value.toLocaleString()}
    status="good"
    {...props}
  />
);

export const SessionDurationCard = (props: Partial<PortalMetricsCardProps> & { value: number }) => (
  <PortalMetricsCard
    title="Avg Session Duration"
    icon={<Info className="h-4 w-4" />}
    formatter={(value) => '${value.toFixed(1)}m'}
    target={5} // 5 minutes target
    status={props.value >= 4 ? 'good' : props.value >= 2 ? 'warning' : 'critical'}
    {...props}
  />
);

export const ConversionRateCard = (props: Partial<PortalMetricsCardProps> & { value: number }) => (
  <PortalMetricsCard
    title="Conversion Rate"
    icon={<CheckCircle className="h-4 w-4" />}
    formatter={(value) => '${(value * 100).toFixed(1)}%'}
    target={0.15} // 15% target conversion rate
    status={props.value >= 0.12 ? 'good' : props.value >= 0.08 ? 'warning' : 'critical'}
    {...props}
  />
);

export const BounceRateCard = (props: Partial<PortalMetricsCardProps> & { value: number }) => (
  <PortalMetricsCard
    title="Bounce Rate"
    icon={<AlertTriangle className="h-4 w-4" />}
    formatter={(value) => '${(value * 100).toFixed(1)}%'}
    target={0.25} // 25% or lower is good
    status={props.value <= 0.25 ? 'good' : props.value <= 0.5 ? 'warning' : 'critical'}
    trend={props.change && props.change < 0 ? 'up' : props.change && props.change > 0 ? 'down' : 'stable'} // Lower bounce rate is better
    {...props}
  />
);