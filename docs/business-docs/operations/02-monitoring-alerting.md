# Monitoring & Alerting Guide

> **Version**: 1.0.0  
> **Last Updated**: January 2025  
> **Maintained By**: Thorbis SRE Team  
> **Review Schedule**: Bi-weekly  

## Overview

This comprehensive guide covers the complete monitoring and alerting strategy for the Thorbis Business OS platform. It includes performance monitoring, error tracking, security monitoring, business metrics, and automated alerting systems designed to ensure platform reliability and optimal user experience.

## Monitoring Architecture

### Three Pillars of Observability
```typescript
interface ObservabilityStack {
  metrics: {
    collection: 'DataDog APM, Custom Metrics',
    visualization: 'DataDog Dashboards, Grafana',
    aggregation: 'Time-series data with 1s resolution',
    retention: '15 months for compliance'
  },
  logs: {
    collection: 'DataDog Logs, Vercel Logs, Supabase Logs',
    aggregation: 'Centralized log aggregation',
    analysis: 'Real-time log analysis and pattern detection',
    retention: '90 days active, 2 years archived'
  },
  traces: {
    collection: 'DataDog APM, Custom Instrumentation',
    sampling: 'Intelligent sampling for performance',
    correlation: 'Request tracing across all services',
    analysis: 'Root cause analysis and bottleneck identification'
  }
}
```

### Monitoring Layers
```typescript
interface MonitoringLayers {
  infrastructure: {
    providers: ['Vercel', 'Supabase', 'Cloudflare'],
    metrics: ['CPU', 'Memory', 'Network', 'Storage'],
    alerts: 'Provider-specific thresholds and notifications'
  },
  application: {
    performance: 'Response times, throughput, error rates',
    business: 'User engagement, conversion rates, revenue impact',
    user: 'Real User Monitoring (RUM), Core Web Vitals',
    api: 'Endpoint performance, rate limiting, quotas'
  },
  security: {
    authentication: 'Failed login attempts, token usage',
    authorization: 'Permission violations, escalation attempts',
    network: 'DDoS protection, WAF triggers, suspicious traffic',
    data: 'Data access patterns, unusual queries'
  }
}
```

## Performance Monitoring

### NextFaster Performance Metrics
```typescript
interface NextFasterMetrics {
  navigation: {
    ttfb: {
      target: 100,        // 100ms Time to First Byte
      warning: 150,       // Warning threshold
      critical: 300,      // Critical threshold
      measurement: 'Server response time'
    },
    lcp: {
      target: 1800,       // 1.8s Largest Contentful Paint
      warning: 1500,      // Warning threshold
      critical: 2500,     // Critical threshold
      measurement: 'Largest element render time'
    },
    fid: {
      target: 100,        // 100ms First Input Delay
      warning: 80,        // Warning threshold
      critical: 300,      // Critical threshold
      measurement: 'Input responsiveness'
    },
    cls: {
      target: 0.1,        // 0.1 Cumulative Layout Shift
      warning: 0.05,      // Warning threshold
      critical: 0.25,     // Critical threshold
      measurement: 'Visual stability'
    }
  },
  resources: {
    jsBundle: {
      target: 170,        // 170KB JavaScript budget
      warning: 150,       // Warning at 150KB
      critical: 200,      // Critical at 200KB
      measurement: 'Total JS payload size'
    },
    images: {
      optimization: 'AVIF/WebP with proper sizing',
      lazyLoading: 'Intersection Observer implementation',
      placeholders: 'Blur placeholders for loading states'
    }
  }
}
```

### Real User Monitoring Setup
```typescript
// RUM Implementation
interface RUMConfiguration {
  datadog: {
    applicationId: process.env.DD_APPLICATION_ID,
    clientToken: process.env.DD_CLIENT_TOKEN,
    site: 'datadoghq.com',
    service: 'thorbis-business-os',
    env: process.env.NODE_ENV,
    sessionSampleRate: 100,
    sessionReplaySampleRate: 20,
    trackUserInteractions: true,
    trackResources: true,
    trackLongTasks: true
  },
  customMetrics: {
    businessMetrics: [
      'work_orders_created',
      'invoices_generated', 
      'customers_added',
      'revenue_processed'
    ],
    performanceMetrics: [
      'api_response_time',
      'database_query_time',
      'cache_hit_ratio',
      'error_rate'
    ]
  }
}

// Custom Performance Monitoring
export const performanceMonitor = {
  trackPageLoad: (pageName: string) => {
    const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    const metrics = {
      page: pageName,
      ttfb: navigationTiming.responseStart - navigationTiming.fetchStart,
      domContentLoaded: navigationTiming.domContentLoadedEventEnd - navigationTiming.fetchStart,
      loadComplete: navigationTiming.loadEventEnd - navigationTiming.fetchStart,
      timestamp: Date.now()
    };
    
    // Send to DataDog
    DD_RUM.addAction('page_load_metrics', metrics);
  },
  
  trackApiCall: (endpoint: string, duration: number, status: number) => {
    DD_RUM.addAction('api_call', {
      endpoint,
      duration,
      status,
      timestamp: Date.now()
    });
    
    // Alert if API call exceeds NextFaster threshold
    if (duration > 300) {
      DD_RUM.addError(new Error(`Slow API call: ${endpoint} took ${duration}ms`));
    }
  },
  
  trackBusinessEvent: (event: string, properties: Record<string, any>) => {
    DD_RUM.addAction(event, {
      ...properties,
      timestamp: Date.now()
    });
  }
};
```

## Application Performance Monitoring

### Database Monitoring
```sql
-- Database Performance Monitoring Queries

-- 1. Query Performance Analysis
CREATE OR REPLACE FUNCTION monitor_query_performance()
RETURNS TABLE (
  query_hash text,
  avg_duration numeric,
  total_calls bigint,
  cache_hit_ratio numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    substr(query, 1, 100) as query_hash,
    round(mean_time::numeric, 2) as avg_duration,
    calls as total_calls,
    round((shared_blks_hit::numeric / (shared_blks_hit + shared_blks_read)) * 100, 2) as cache_hit_ratio
  FROM pg_stat_statements
  WHERE mean_time > 100  -- Queries taking more than 100ms
  ORDER BY mean_time DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql;

-- 2. Connection Monitoring
CREATE OR REPLACE FUNCTION monitor_connections()
RETURNS TABLE (
  total_connections int,
  active_connections int,
  idle_connections int,
  waiting_connections int
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    count(*)::int as total_connections,
    count(*) FILTER (WHERE state = 'active')::int as active_connections,
    count(*) FILTER (WHERE state = 'idle')::int as idle_connections,
    count(*) FILTER (WHERE wait_event_type IS NOT NULL)::int as waiting_connections
  FROM pg_stat_activity
  WHERE pid != pg_backend_pid();
END;
$$ LANGUAGE plpgsql;

-- 3. Table Growth Monitoring
CREATE OR REPLACE FUNCTION monitor_table_growth()
RETURNS TABLE (
  schema_name text,
  table_name text,
  size_mb numeric,
  row_count bigint,
  growth_rate numeric
) AS $$
BEGIN
  RETURN QUERY
  WITH current_stats AS (
    SELECT 
      schemaname,
      tablename,
      pg_total_relation_size(schemaname||'.'||tablename)::numeric / 1024 / 1024 as size_mb,
      n_tup_ins + n_tup_upd + n_tup_del as total_operations
    FROM pg_stat_user_tables
  )
  SELECT 
    cs.schemaname::text,
    cs.tablename::text,
    cs.size_mb,
    pg_class.reltuples::bigint as row_count,
    cs.total_operations::numeric as growth_rate
  FROM current_stats cs
  JOIN pg_class ON pg_class.relname = cs.tablename
  ORDER BY cs.size_mb DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql;
```

### API Monitoring Configuration
```typescript
interface APIMonitoringConfig {
  endpoints: {
    '/api/health': {
      method: 'GET',
      timeout: 5000,
      expectedStatus: 200,
      alertThreshold: '2 failures in 5 minutes'
    },
    '/api/hs/app/v1/work-orders': {
      method: 'GET',
      timeout: 1000,
      expectedStatus: 200,
      alertThreshold: 'Response time > 300ms'
    },
    '/api/auth/session': {
      method: 'GET',
      timeout: 2000,
      expectedStatus: [200, 401],
      alertThreshold: '5xx errors > 1%'
    }
  },
  metrics: {
    responseTime: {
      percentiles: [50, 90, 95, 99],
      aggregation: '1 minute intervals',
      retention: '30 days detailed, 1 year summarized'
    },
    errorRates: {
      tracking: ['4xx', '5xx', 'timeouts', 'connection errors'],
      threshold: '1% error rate triggers warning',
      escalation: '5% error rate triggers critical alert'
    },
    throughput: {
      measurement: 'requests per second',
      baseline: 'Historical average with seasonal adjustment',
      anomalies: 'Statistical deviation detection'
    }
  }
}
```

## Security Monitoring

### Authentication & Authorization Monitoring
```typescript
interface SecurityMonitoring {
  authentication: {
    failedLogins: {
      threshold: '5 failures per IP per minute',
      action: 'Temporary IP block',
      duration: '15 minutes increasing exponentially',
      monitoring: 'Real-time analysis with geographic correlation'
    },
    suspiciousActivity: {
      multipleLocations: 'Same user from different countries within 1 hour',
      velocityAttacks: 'High-frequency login attempts',
      credentialStuffing: 'Common password patterns',
      bruteForce: 'Sequential username attempts'
    }
  },
  authorization: {
    privilegeEscalation: {
      detection: 'Attempts to access higher-privilege resources',
      monitoring: 'Role-based access pattern analysis',
      alerting: 'Immediate notification for escalation attempts'
    },
    dataAccess: {
      patterns: 'Unusual data access volumes or patterns',
      crossTenant: 'Attempts to access other tenant data',
      bulk: 'Large data export or download activities'
    }
  },
  network: {
    ddosProtection: {
      provider: 'Cloudflare DDoS Protection',
      thresholds: 'Adaptive based on traffic patterns',
      response: 'Automatic mitigation with manual override'
    },
    wafTriggers: {
      sqlInjection: 'SQL injection attempt detection',
      xss: 'Cross-site scripting attempt detection',
      fileInclusion: 'File inclusion vulnerability attempts'
    }
  }
}
```

### Security Event Processing
```typescript
// Security Event Handler
export class SecurityEventMonitor {
  private readonly alertThresholds = {
    failedLogins: 5,
    suspiciousIPs: 10,
    privilegeEscalation: 1,
    dataExfiltration: 1000 // records
  };
  
  async processAuthenticationEvent(event: AuthEvent): Promise<void> {
    const { type, userId, ip, userAgent, timestamp } = event;
    
    switch (type) {
      case 'login_failed':
        await this.handleFailedLogin(userId, ip, timestamp);
        break;
        
      case 'login_success':
        await this.analyzeLoginLocation(userId, ip, timestamp);
        break;
        
      case 'token_refresh':
        await this.monitorTokenUsage(userId, timestamp);
        break;
        
      case 'password_change':
        await this.alertPasswordChange(userId, ip, timestamp);
        break;
    }
  }
  
  private async handleFailedLogin(userId: string, ip: string, timestamp: Date): Promise<void> {
    const recentFailures = await this.getRecentFailures(ip, timestamp);
    
    if (recentFailures >= this.alertThresholds.failedLogins) {
      // Block IP temporarily
      await this.blockIP(ip, '15 minutes');
      
      // Send security alert
      await this.sendSecurityAlert({
        type: 'bruteforce_attempt',
        ip,
        userId,
        failureCount: recentFailures,
        severity: 'high'
      });
    }
  }
  
  private async analyzeLoginLocation(userId: string, ip: string, timestamp: Date): Promise<void> {
    const recentLogins = await this.getRecentLogins(userId, timestamp);
    
    for (const login of recentLogins) {
      const distance = await this.calculateDistance(ip, login.ip);
      const timeDiff = timestamp.getTime() - login.timestamp.getTime();
      
      // Impossible travel detection
      if (distance > 500 && timeDiff < 3600000) { // 500km in 1 hour
        await this.sendSecurityAlert({
          type: 'impossible_travel',
          userId,
          locations: [ip, login.ip],
          timeWindow: timeDiff,
          severity: 'critical'
        });
      }
    }
  }
}
```

## Business Metrics Monitoring

### Revenue & Transaction Monitoring
```typescript
interface BusinessMetricsConfig {
  revenue: {
    tracking: {
      invoiceCreation: 'Track invoice generation rates',
      paymentProcessing: 'Monitor payment completion rates',
      subscriptionChanges: 'Track plan upgrades/downgrades',
      churn: 'Customer cancellation monitoring'
    },
    alerts: {
      revenueDrops: '20% decrease from baseline triggers alert',
      paymentFailures: '>5% payment failure rate',
      highValueTransactions: 'Transactions >$10,000 require verification'
    }
  },
  usage: {
    activeUsers: {
      daily: 'Daily active users per tenant',
      monthly: 'Monthly active users growth',
      retention: 'User retention rate analysis'
    },
    features: {
      adoption: 'Feature usage analytics',
      performance: 'Feature performance correlation',
      feedback: 'User satisfaction per feature'
    }
  },
  operational: {
    workOrders: {
      creation: 'Work order creation rate',
      completion: 'Average completion time',
      value: 'Average work order value'
    },
    customers: {
      acquisition: 'New customer acquisition rate',
      satisfaction: 'Customer satisfaction scores',
      support: 'Support ticket volume and resolution'
    }
  }
}
```

### Industry-Specific Metrics
```typescript
interface IndustryMetrics {
  homeServices: {
    dispatch: {
      averageResponseTime: 'Time from job creation to technician dispatch',
      completionRate: 'Percentage of jobs completed same day',
      customerSatisfaction: 'Post-job satisfaction scores'
    },
    revenue: {
      averageJobValue: 'Mean value per work order',
      monthlyRecurring: 'Subscription-based recurring revenue',
      seasonalTrends: 'Revenue patterns by season'
    }
  },
  restaurants: {
    pos: {
      transactionVolume: 'Transactions per hour peak analysis',
      averageTicket: 'Average transaction value',
      paymentMethods: 'Payment method distribution'
    },
    kitchen: {
      orderFulfillment: 'Average order preparation time',
      accuracy: 'Order accuracy rate',
      waste: 'Food waste tracking'
    }
  },
  automotive: {
    service: {
      bayUtilization: 'Service bay utilization rates',
      partsTurnover: 'Parts inventory turnover',
      customerRetention: 'Repeat customer rate'
    },
    estimates: {
      conversionRate: 'Estimate to work order conversion',
      accuracy: 'Estimate vs actual cost variance',
      approval: 'Customer approval rate for estimates'
    }
  },
  retail: {
    sales: {
      conversionRate: 'Visitor to customer conversion',
      basketSize: 'Average transaction value',
      returnRate: 'Product return rate analysis'
    },
    inventory: {
      turnover: 'Inventory turnover rates',
      stockouts: 'Out of stock incident tracking',
      shrinkage: 'Inventory loss monitoring'
    }
  }
}
```

## Alerting System

### Alert Severity Classification
```typescript
interface AlertSeverity {
  critical: {
    description: 'Service outage or security breach',
    responseTime: '≤ 5 minutes',
    channels: ['PagerDuty', 'SMS', 'Phone Call', 'Slack'],
    escalation: 'Immediate manager escalation',
    examples: [
      'Platform completely down',
      'Database unavailable',
      'Security breach detected',
      'Data loss incident'
    ]
  },
  high: {
    description: 'Significant performance degradation',
    responseTime: '≤ 15 minutes',
    channels: ['PagerDuty', 'Slack', 'Email'],
    escalation: 'After 30 minutes if unresolved',
    examples: [
      'API response times > 1 second',
      'Error rate > 5%',
      'Authentication failures',
      'Payment processing issues'
    ]
  },
  medium: {
    description: 'Minor performance issues',
    responseTime: '≤ 1 hour',
    channels: ['Slack', 'Email'],
    escalation: 'Business hours only',
    examples: [
      'API response times > 500ms',
      'Error rate > 1%',
      'Feature-specific issues',
      'Third-party integration problems'
    ]
  },
  low: {
    description: 'Informational alerts',
    responseTime: '≤ 4 hours',
    channels: ['Email'],
    escalation: 'No escalation',
    examples: [
      'Capacity thresholds approaching',
      'Unusual traffic patterns',
      'Maintenance reminders',
      'Performance optimization opportunities'
    ]
  }
}
```

### Alert Configuration
```typescript
// Alert Rules Configuration
export const alertRules: AlertRule[] = [
  // Performance Alerts
  {
    name: 'API Response Time Critical',
    condition: 'avg(api_response_time) > 1000ms for 5 minutes',
    severity: 'critical',
    channels: ['pagerduty', 'slack'],
    runbook: 'https://docs.thorbis.com/runbooks/api-performance'
  },
  {
    name: 'Database Connection Pool Exhaustion',
    condition: 'database_connections > 90% for 2 minutes',
    severity: 'high',
    channels: ['pagerduty', 'slack'],
    runbook: 'https://docs.thorbis.com/runbooks/database-connections'
  },
  
  // Error Rate Alerts
  {
    name: 'High Error Rate',
    condition: 'error_rate > 5% for 3 minutes',
    severity: 'high',
    channels: ['pagerduty', 'slack'],
    runbook: 'https://docs.thorbis.com/runbooks/high-error-rate'
  },
  {
    name: 'Authentication Failures',
    condition: 'auth_failures > 10 per minute for 5 minutes',
    severity: 'medium',
    channels: ['slack', 'email'],
    runbook: 'https://docs.thorbis.com/runbooks/auth-failures'
  },
  
  // Security Alerts
  {
    name: 'Suspicious Login Activity',
    condition: 'failed_logins > 20 per minute from single IP',
    severity: 'high',
    channels: ['pagerduty', 'security-slack'],
    runbook: 'https://docs.thorbis.com/runbooks/security-incidents'
  },
  {
    name: 'Data Exfiltration Attempt',
    condition: 'data_export_volume > 1GB per user per hour',
    severity: 'critical',
    channels: ['pagerduty', 'security-slack', 'sms'],
    runbook: 'https://docs.thorbis.com/runbooks/data-protection'
  },
  
  // Business Metrics Alerts
  {
    name: 'Revenue Drop Alert',
    condition: 'daily_revenue < 80% of 7-day average',
    severity: 'medium',
    channels: ['email', 'business-slack'],
    runbook: 'https://docs.thorbis.com/runbooks/revenue-analysis'
  },
  {
    name: 'High Value Transaction',
    condition: 'transaction_amount > $10000',
    severity: 'low',
    channels: ['email'],
    runbook: 'https://docs.thorbis.com/runbooks/transaction-verification'
  }
];
```

## Dashboard Configuration

### Executive Dashboard
```typescript
interface ExecutiveDashboard {
  kpis: {
    revenue: {
      daily: 'Current day revenue vs target',
      monthly: 'Month-to-date vs previous month',
      annually: 'Year-over-year growth'
    },
    users: {
      active: 'Daily/Monthly active users',
      growth: 'User growth rate',
      churn: 'Customer churn rate'
    },
    system: {
      availability: '99.99% uptime SLA tracking',
      performance: 'Platform response times',
      incidents: 'Open incidents and resolution times'
    }
  },
  visualizations: {
    revenueChart: 'Time series with trend lines',
    userGrowth: 'Cohort analysis visualization',
    systemHealth: 'Real-time status indicators'
  }
}
```

### Operations Dashboard
```typescript
interface OperationsDashboard {
  realTime: {
    systemStatus: 'All services health status',
    activeIncidents: 'Current incidents with severity',
    performanceMetrics: 'Response times, error rates, throughput',
    securityEvents: 'Recent security events and alerts'
  },
  trends: {
    performance: '24-hour performance trends',
    errors: 'Error rate patterns and categories',
    usage: 'Resource utilization trends',
    capacity: 'Capacity planning metrics'
  },
  alerts: {
    active: 'Currently active alerts',
    recent: 'Recently resolved alerts',
    escalated: 'Escalated alerts requiring attention',
    trends: 'Alert frequency analysis'
  }
}
```

## Monitoring Automation

### Automated Response Systems
```typescript
interface AutomatedResponses {
  performance: {
    slowQueries: {
      detection: 'Query execution time > 5 seconds',
      action: 'Automatic query optimization suggestions',
      escalation: 'DBA notification if optimization fails'
    },
    memoryLeaks: {
      detection: 'Memory usage growth > 10% per hour',
      action: 'Automatic garbage collection trigger',
      escalation: 'Application restart if memory critical'
    }
  },
  security: {
    bruteForce: {
      detection: 'Failed login threshold exceeded',
      action: 'Automatic IP blocking',
      duration: 'Progressive blocking periods'
    },
    ddos: {
      detection: 'Traffic spike > 500% baseline',
      action: 'Cloudflare DDoS protection activation',
      escalation: 'Manual review for false positives'
    }
  },
  capacity: {
    scaling: {
      detection: 'Resource utilization > 80%',
      action: 'Automatic horizontal scaling',
      limits: 'Cost-based scaling limits'
    },
    cleanup: {
      detection: 'Storage usage > 85%',
      action: 'Automatic log rotation and cleanup',
      retention: 'Policy-based data retention'
    }
  }
}
```

This comprehensive monitoring and alerting system ensures proactive identification and resolution of issues before they impact users, while providing detailed insights into system performance, security, and business metrics for continuous improvement of the Thorbis Business OS platform.