# Performance Management Guide

> **Version**: 1.0.0  
> **Last Updated**: January 2025  
> **Maintained By**: Thorbis Performance Team  
> **Review Schedule**: Weekly  

## Overview

This comprehensive guide covers all aspects of performance management for the Thorbis Business OS platform, including the NextFaster doctrine implementation, performance monitoring, optimization strategies, capacity planning, and continuous performance improvement processes.

## NextFaster Performance Doctrine

### Core Performance Principles
```typescript
interface NextFasterDoctrine {
  navigation: {
    target: '< 300ms total navigation time',
    implementation: 'Aggressive prefetching and caching',
    measurement: 'Time to Interactive (TTI)',
    userExperience: 'Instant perceived performance'
  },
  
  loading: {
    policy: 'No loading spinners or skeleton screens',
    strategy: 'Stale-while-revalidate (SWR)',
    fallback: 'Show last known data immediately',
    update: 'Background updates with smooth transitions'
  },
  
  bundleSize: {
    limit: '170KB total JavaScript per route',
    strategy: 'Code splitting and tree shaking',
    measurement: 'First-party JavaScript only',
    optimization: 'Dynamic imports for non-critical code'
  },
  
  rendering: {
    primary: 'Server-side rendering (SSR)',
    hydration: 'Selective hydration for interactive elements',
    caching: 'Edge caching with intelligent invalidation',
    streaming: 'React 18 streaming for faster TTFB'
  }
}
```

### Performance Targets
```typescript
interface PerformanceTargets {
  coreWebVitals: {
    lcp: {
      target: 1800,        // 1.8 seconds
      good: 1500,          // Under 1.5s is excellent
      poor: 4000,          // Over 4s needs immediate attention
      measurement: 'Largest Contentful Paint'
    },
    fid: {
      target: 100,         // 100ms
      good: 50,           // Under 50ms is excellent
      poor: 300,          // Over 300ms needs immediate attention
      measurement: 'First Input Delay'
    },
    cls: {
      target: 0.1,         // 0.1 cumulative layout shift
      good: 0.05,         // Under 0.05 is excellent
      poor: 0.25,         // Over 0.25 needs immediate attention
      measurement: 'Cumulative Layout Shift'
    }
  },
  
  apiPerformance: {
    responseTime: {
      target: 300,         // 300ms for API responses
      database: 150,       // 150ms for database queries
      cache: 50,          // 50ms for cache hits
      authentication: 200  // 200ms for auth operations
    },
    throughput: {
      concurrent: 1000,    // 1000 concurrent requests
      peak: 5000,         // 5000 requests/minute peak capacity
      sustained: 2000     // 2000 requests/minute sustained
    },
    availability: {
      uptime: 99.99,      // 99.99% uptime SLA
      errorRate: 0.01,    // 1% error rate maximum
      timeout: 10000      // 10 second timeout limit
    }
  },
  
  resourceUtilization: {
    memory: {
      heap: '< 512MB per Node.js process',
      growth: '< 10MB/hour memory leak tolerance',
      garbage: 'GC pauses < 50ms'
    },
    cpu: {
      average: '< 70% CPU utilization',
      peak: '< 90% CPU during traffic spikes',
      blocking: 'No CPU-blocking operations > 10ms'
    },
    network: {
      bandwidth: '< 100MB/month per user',
      requests: '< 100 HTTP requests per page load',
      compression: 'Gzip/Brotli for all text content'
    }
  }
}
```

## Performance Monitoring System

### Real-Time Performance Monitoring
```typescript
// Performance Monitoring Implementation
interface PerformanceMonitoringSystem {
  realUserMonitoring: {
    provider: 'DataDog RUM',
    sampling: 100,           // 100% sampling for complete visibility
    metrics: [
      'Core Web Vitals',
      'Custom performance marks',
      'User journey timings',
      'Error correlation'
    ]
  },
  
  syntheticMonitoring: {
    frequency: '1 minute intervals',
    locations: ['US East', 'US West', 'Europe', 'Asia'],
    scenarios: [
      'Homepage load',
      'Login flow',
      'Work order creation',
      'Invoice generation',
      'Dashboard navigation'
    ]
  },
  
  serverMonitoring: {
    metrics: [
      'Response time percentiles (p50, p95, p99)',
      'Throughput (requests/second)',
      'Error rates by endpoint',
      'Database query performance',
      'Cache hit ratios'
    ],
    alerting: 'Immediate alerts for SLA violations'
  }
}

// Custom Performance Tracking
export class PerformanceTracker {
  private static instance: PerformanceTracker;
  private performanceEntries: Map<string, PerformanceEntry[]> = new Map();
  
  static getInstance(): PerformanceTracker {
    if (!this.instance) {
      this.instance = new PerformanceTracker();
    }
    return this.instance;
  }
  
  // Track navigation performance
  trackNavigation(routeName: string): void {
    const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    const metrics = {
      route: routeName,
      ttfb: navigationTiming.responseStart - navigationTiming.fetchStart,
      domContentLoaded: navigationTiming.domContentLoadedEventEnd - navigationTiming.fetchStart,
      loadComplete: navigationTiming.loadEventEnd - navigationTiming.fetchStart,
      timestamp: Date.now()
    };
    
    // Send to monitoring service
    this.sendMetrics('navigation', metrics);
    
    // Alert if NextFaster threshold exceeded
    if (metrics.loadComplete > 300) {
      this.alertSlowNavigation(routeName, metrics.loadComplete);
    }
  }
  
  // Track API performance
  trackAPICall(endpoint: string, startTime: number, status: number): void {
    const duration = performance.now() - startTime;
    
    const metrics = {
      endpoint,
      duration,
      status,
      timestamp: Date.now()
    };
    
    this.sendMetrics('api', metrics);
    
    // Alert if API exceeds performance target
    if (duration > 300) {
      this.alertSlowAPI(endpoint, duration);
    }
  }
  
  // Track Core Web Vitals
  trackWebVitals(): void {
    // LCP tracking
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      this.sendMetrics('web_vitals', {
        metric: 'lcp',
        value: lastEntry.startTime,
        timestamp: Date.now()
      });
      
      if (lastEntry.startTime > 1800) {
        this.alertPoorWebVital('LCP', lastEntry.startTime);
      }
    }).observe({type: 'largest-contentful-paint', buffered: true});
    
    // FID tracking
    new PerformanceObserver((list) => {
      const firstInput = list.getEntries()[0];
      
      this.sendMetrics('web_vitals', {
        metric: 'fid',
        value: firstInput.processingStart - firstInput.startTime,
        timestamp: Date.now()
      });
    }).observe({type: 'first-input', buffered: true});
    
    // CLS tracking
    let clsValue = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      
      this.sendMetrics('web_vitals', {
        metric: 'cls',
        value: clsValue,
        timestamp: Date.now()
      });
      
      if (clsValue > 0.1) {
        this.alertPoorWebVital('CLS', clsValue);
      }
    }).observe({type: 'layout-shift', buffered: true});
  }
  
  private sendMetrics(type: string, metrics: any): void {
    // Send to DataDog
    if (typeof DD_RUM !== 'undefined') {
      DD_RUM.addAction(`performance_${type}`, metrics);
    }
    
    // Send to custom analytics endpoint
    fetch('/api/analytics/performance', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({type, metrics})
    }).catch(console.error);
  }
  
  private alertSlowNavigation(route: string, duration: number): void {
    console.warn(`Slow navigation detected: ${route} took ${duration}ms`);
    // Trigger alert to monitoring system
  }
  
  private alertSlowAPI(endpoint: string, duration: number): void {
    console.warn(`Slow API call detected: ${endpoint} took ${duration}ms`);
    // Trigger alert to monitoring system
  }
  
  private alertPoorWebVital(metric: string, value: number): void {
    console.warn(`Poor ${metric} detected: ${value}`);
    // Trigger alert to monitoring system
  }
}
```

### Database Performance Monitoring
```sql
-- Database Performance Monitoring Procedures

-- 1. Query Performance Dashboard
CREATE OR REPLACE VIEW performance_dashboard AS
WITH query_stats AS (
    SELECT 
        left(query, 100) as query_sample,
        calls,
        total_time,
        mean_time,
        stddev_time,
        min_time,
        max_time,
        shared_blks_hit,
        shared_blks_read,
        shared_blks_hit::numeric / (shared_blks_hit + shared_blks_read) * 100 as cache_hit_ratio
    FROM pg_stat_statements
    WHERE calls > 10
),
slow_queries AS (
    SELECT 
        query_sample,
        calls,
        round(mean_time::numeric, 2) as avg_time_ms,
        round(total_time::numeric, 2) as total_time_ms,
        round(cache_hit_ratio, 2) as cache_hit_pct
    FROM query_stats
    WHERE mean_time > 100  -- Queries slower than 100ms
    ORDER BY total_time DESC
    LIMIT 20
),
connection_stats AS (
    SELECT 
        count(*) as total_connections,
        count(*) FILTER (WHERE state = 'active') as active_connections,
        count(*) FILTER (WHERE state = 'idle') as idle_connections,
        count(*) FILTER (WHERE wait_event IS NOT NULL) as waiting_connections
    FROM pg_stat_activity
    WHERE pid != pg_backend_pid()
)
SELECT 
    'slow_queries' as metric_type,
    jsonb_agg(
        jsonb_build_object(
            'query', query_sample,
            'calls', calls,
            'avg_time_ms', avg_time_ms,
            'total_time_ms', total_time_ms,
            'cache_hit_pct', cache_hit_pct
        )
    ) as metrics
FROM slow_queries
UNION ALL
SELECT 
    'connection_stats' as metric_type,
    jsonb_build_object(
        'total_connections', total_connections,
        'active_connections', active_connections,
        'idle_connections', idle_connections,
        'waiting_connections', waiting_connections
    ) as metrics
FROM connection_stats;

-- 2. Real-time Performance Monitoring
CREATE OR REPLACE FUNCTION monitor_database_performance()
RETURNS TABLE (
    check_time timestamp,
    active_queries int,
    slow_queries int,
    blocked_queries int,
    cache_hit_ratio numeric,
    connection_utilization numeric
) AS $$
DECLARE
    max_connections int;
BEGIN
    -- Get max_connections setting
    SELECT setting::int FROM pg_settings WHERE name = 'max_connections' INTO max_connections;
    
    RETURN QUERY
    SELECT 
        now() as check_time,
        (SELECT count(*)::int FROM pg_stat_activity WHERE state = 'active') as active_queries,
        (SELECT count(*)::int FROM pg_stat_activity 
         WHERE state = 'active' AND query_start < now() - interval '5 seconds') as slow_queries,
        (SELECT count(*)::int FROM pg_stat_activity WHERE wait_event IS NOT NULL) as blocked_queries,
        (SELECT round(
            (sum(heap_blks_hit)::numeric / NULLIF(sum(heap_blks_hit) + sum(heap_blks_read), 0)) * 100,
            2
        ) FROM pg_statio_user_tables) as cache_hit_ratio,
        (SELECT round(
            (count(*)::numeric / max_connections::numeric) * 100,
            2
        ) FROM pg_stat_activity WHERE pid != pg_backend_pid()) as connection_utilization;
END;
$$ LANGUAGE plpgsql;

-- 3. Performance Alert Triggers
CREATE OR REPLACE FUNCTION check_performance_thresholds()
RETURNS void AS $$
DECLARE
    slow_query_count int;
    high_connection_usage numeric;
    low_cache_ratio numeric;
BEGIN
    -- Check for slow queries
    SELECT count(*) FROM pg_stat_activity 
    WHERE state = 'active' AND query_start < now() - interval '10 seconds'
    INTO slow_query_count;
    
    IF slow_query_count > 5 THEN
        INSERT INTO performance_alerts (alert_type, severity, message, created_at)
        VALUES ('slow_queries', 'high', 
                'Multiple slow queries detected: ' || slow_query_count, now());
    END IF;
    
    -- Check connection usage
    SELECT (count(*)::numeric / (SELECT setting::int FROM pg_settings WHERE name = 'max_connections')) * 100
    FROM pg_stat_activity WHERE pid != pg_backend_pid()
    INTO high_connection_usage;
    
    IF high_connection_usage > 80 THEN
        INSERT INTO performance_alerts (alert_type, severity, message, created_at)
        VALUES ('high_connections', 'medium',
                'High connection usage: ' || round(high_connection_usage, 2) || '%', now());
    END IF;
    
    -- Check cache hit ratio
    SELECT (sum(heap_blks_hit)::numeric / NULLIF(sum(heap_blks_hit) + sum(heap_blks_read), 0)) * 100
    FROM pg_statio_user_tables INTO low_cache_ratio;
    
    IF low_cache_ratio < 90 THEN
        INSERT INTO performance_alerts (alert_type, severity, message, created_at)
        VALUES ('low_cache_ratio', 'medium',
                'Low cache hit ratio: ' || round(low_cache_ratio, 2) || '%', now());
    END IF;
END;
$$ LANGUAGE plpgsql;
```

## Performance Optimization Strategies

### Frontend Performance Optimization
```typescript
interface FrontendOptimizationStrategies {
  codeOptimization: {
    bundleSplitting: {
      strategy: 'Route-based and feature-based splitting',
      implementation: 'Next.js automatic splitting + manual optimization',
      monitoring: 'Webpack Bundle Analyzer for size tracking'
    },
    treeShaking: {
      strategy: 'Eliminate unused code',
      implementation: 'ES6 modules with proper imports',
      tools: ['Rollup', 'Terser', 'Webpack optimizations']
    },
    lazyLoading: {
      components: 'React.lazy() for non-critical components',
      images: 'Intersection Observer API implementation',
      routes: 'Dynamic imports for route components'
    }
  },
  
  assetOptimization: {
    images: {
      formats: 'AVIF with WebP fallback',
      sizing: 'Responsive images with srcset',
      compression: 'Optimal compression per image type',
      placeholders: 'Blur placeholders during loading'
    },
    fonts: {
      preloading: 'Critical fonts preloaded',
      subsetting: 'Character subset for faster loading',
      display: 'font-display: swap for better UX'
    },
    css: {
      critical: 'Inline critical CSS',
      splitting: 'CSS code splitting by route',
      compression: 'CSS minification and compression'
    }
  },
  
  cachingStrategy: {
    staticAssets: {
      strategy: 'Aggressive caching with cache busting',
      duration: '1 year for immutable assets',
      versioning: 'Hash-based versioning'
    },
    apiResponses: {
      strategy: 'Stale-while-revalidate',
      duration: 'Based on data volatility',
      invalidation: 'Tag-based cache invalidation'
    },
    pageCache: {
      strategy: 'Edge caching with ISR',
      duration: 'Dynamic based on content type',
      personalization: 'User-specific content handling'
    }
  }
}
```

### Backend Performance Optimization
```bash
#!/bin/bash
# Backend Performance Optimization Scripts

# 1. Database Query Optimization
optimize_database_queries() {
  echo "=== DATABASE QUERY OPTIMIZATION ==="
  
  # Identify slow queries
  echo "Analyzing slow queries..."
  supabase exec sql --query "
    SELECT 
      substring(query for 100) as query_sample,
      calls,
      total_time,
      mean_time,
      rows,
      100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
    FROM pg_stat_statements 
    WHERE calls > 50 
    ORDER BY mean_time DESC 
    LIMIT 10;
  " > /tmp/slow_queries.txt
  
  echo "Top 10 slow queries:"
  cat /tmp/slow_queries.txt
  
  # Check for missing indexes
  echo "Checking for missing indexes..."
  supabase exec sql --query "
    SELECT 
      schemaname,
      tablename,
      attname,
      n_distinct,
      correlation
    FROM pg_stats
    WHERE schemaname NOT IN ('information_schema', 'pg_catalog')
    AND n_distinct > 100
    AND correlation < 0.1
    ORDER BY n_distinct DESC;
  " > /tmp/missing_indexes.txt
  
  echo "Potential missing indexes:"
  cat /tmp/missing_indexes.txt
}

# 2. Connection Pool Optimization
optimize_connection_pool() {
  echo "=== CONNECTION POOL OPTIMIZATION ==="
  
  # Analyze connection patterns
  current_connections=$(supabase exec sql --query "
    SELECT 
      state,
      count(*) as connections
    FROM pg_stat_activity 
    GROUP BY state
  ")
  
  echo "Current connection distribution:"
  echo "$current_connections"
  
  # Kill idle connections older than 30 minutes
  echo "Cleaning up idle connections..."
  idle_killed=$(supabase exec sql --query "
    SELECT count(pg_terminate_backend(pid))
    FROM pg_stat_activity
    WHERE state = 'idle'
    AND state_change < now() - interval '30 minutes'
    AND pid != pg_backend_pid()
  ")
  
  echo "Terminated $idle_killed idle connections"
}

# 3. Cache Optimization
optimize_cache() {
  echo "=== CACHE OPTIMIZATION ==="
  
  # Redis cache analysis (if using Redis)
  if command -v redis-cli >/dev/null; then
    echo "Analyzing Redis cache performance..."
    
    # Get cache stats
    redis_info=$(redis-cli info stats)
    keyspace_hits=$(echo "$redis_info" | grep keyspace_hits | cut -d: -f2)
    keyspace_misses=$(echo "$redis_info" | grep keyspace_misses | cut -d: -f2)
    
    if [ "$keyspace_misses" -gt 0 ]; then
      hit_ratio=$(echo "scale=2; $keyspace_hits * 100 / ($keyspace_hits + $keyspace_misses)" | bc)
      echo "Cache hit ratio: ${hit_ratio}%"
      
      if [ "$(echo "$hit_ratio < 80" | bc)" -eq 1 ]; then
        echo "WARNING: Low cache hit ratio detected"
      fi
    fi
    
    # Clean expired keys
    redis-cli eval "return redis.call('del', unpack(redis.call('keys', ARGV[1])))" 0 "*:expired:*"
  fi
  
  # Application cache optimization
  echo "Optimizing application cache..."
  
  # Clear stale cache entries (implementation depends on caching solution)
  # This is a placeholder for cache-specific optimizations
}

# 4. API Performance Optimization
optimize_api_performance() {
  echo "=== API PERFORMANCE OPTIMIZATION ==="
  
  # Analyze API response times
  echo "Analyzing API performance..."
  
  # Test critical endpoints
  critical_endpoints=(
    "https://thorbis.com/api/health"
    "https://thorbis.com/api/hs/app/v1/work-orders"
    "https://thorbis.com/api/auth/session"
  )
  
  for endpoint in "${critical_endpoints[@]}"; do
    echo "Testing $endpoint..."
    
    # Measure response time
    response_time=$(curl -o /dev/null -s -w "%{time_total}" "$endpoint")
    http_code=$(curl -o /dev/null -s -w "%{http_code}" "$endpoint")
    
    echo "Response: ${response_time}s (HTTP $http_code)"
    
    # Alert if exceeds performance target
    if (( $(echo "$response_time > 0.5" | bc -l) )); then
      echo "⚠️  Endpoint exceeds performance target: $endpoint"
    fi
  done
}
```

### Automated Performance Optimization
```typescript
// Automated Performance Optimization Service
export class PerformanceOptimizationService {
  private metrics: Map<string, number[]> = new Map();
  private optimizationRules: OptimizationRule[] = [];
  
  constructor() {
    this.initializeOptimizationRules();
    this.startContinuousOptimization();
  }
  
  private initializeOptimizationRules(): void {
    this.optimizationRules = [
      {
        name: 'cache_optimization',
        condition: (metrics) => metrics.cacheHitRatio < 80,
        action: () => this.optimizeCache(),
        frequency: '5 minutes'
      },
      {
        name: 'query_optimization',
        condition: (metrics) => metrics.avgQueryTime > 200,
        action: () => this.optimizeQueries(),
        frequency: '10 minutes'
      },
      {
        name: 'connection_pool_optimization',
        condition: (metrics) => metrics.connectionUtilization > 80,
        action: () => this.optimizeConnectionPool(),
        frequency: '1 minute'
      },
      {
        name: 'bundle_optimization',
        condition: (metrics) => metrics.bundleSize > 170000, // 170KB
        action: () => this.optimizeBundle(),
        frequency: '1 hour'
      }
    ];
  }
  
  private startContinuousOptimization(): void {
    setInterval(() => {
      this.collectMetrics()
        .then(metrics => this.analyzeAndOptimize(metrics))
        .catch(console.error);
    }, 60000); // Run every minute
  }
  
  private async collectMetrics(): Promise<PerformanceMetrics> {
    // Collect various performance metrics
    const [
      webVitals,
      apiMetrics,
      databaseMetrics,
      cacheMetrics
    ] = await Promise.all([
      this.collectWebVitals(),
      this.collectAPIMetrics(),
      this.collectDatabaseMetrics(),
      this.collectCacheMetrics()
    ]);
    
    return {
      ...webVitals,
      ...apiMetrics,
      ...databaseMetrics,
      ...cacheMetrics,
      timestamp: Date.now()
    };
  }
  
  private analyzeAndOptimize(metrics: PerformanceMetrics): void {
    for (const rule of this.optimizationRules) {
      if (rule.condition(metrics)) {
        console.log(`Triggering optimization: ${rule.name}`);
        rule.action();
      }
    }
  }
  
  private async optimizeCache(): Promise<void> {
    // Implement cache optimization logic
    console.log('Optimizing cache performance...');
    
    // Example optimizations:
    // - Increase cache TTL for stable data
    // - Preload frequently accessed data
    // - Clear stale cache entries
    
    await fetch('/api/internal/optimize-cache', {
      method: 'POST',
      headers: {'Authorization': `Bearer ${process.env.INTERNAL_API_KEY}`}
    });
  }
  
  private async optimizeQueries(): Promise<void> {
    console.log('Optimizing database queries...');
    
    // Example optimizations:
    // - Add database indexes for slow queries
    // - Optimize query plans
    // - Enable query result caching
    
    await fetch('/api/internal/optimize-queries', {
      method: 'POST',
      headers: {'Authorization': `Bearer ${process.env.INTERNAL_API_KEY}`}
    });
  }
  
  private async optimizeConnectionPool(): Promise<void> {
    console.log('Optimizing connection pool...');
    
    // Example optimizations:
    // - Adjust pool size based on usage patterns
    // - Close idle connections
    // - Load balance across database replicas
    
    await fetch('/api/internal/optimize-connections', {
      method: 'POST',
      headers: {'Authorization': `Bearer ${process.env.INTERNAL_API_KEY}`}
    });
  }
  
  private async optimizeBundle(): Promise<void> {
    console.log('Bundle size exceeded threshold, triggering optimization...');
    
    // Example optimizations:
    // - Analyze bundle for unused code
    // - Suggest code splitting opportunities
    // - Recommend library alternatives
    
    await fetch('/api/internal/analyze-bundle', {
      method: 'POST',
      headers: {'Authorization': `Bearer ${process.env.INTERNAL_API_KEY}`}
    });
  }
}
```

## Capacity Planning

### Resource Forecasting
```typescript
interface CapacityPlanningModel {
  trafficGrowth: {
    historical: 'Analyze 12 months of traffic patterns',
    seasonal: 'Account for seasonal business variations',
    projected: 'Forecast 6-12 months future growth',
    scenarios: ['Conservative 20%', 'Expected 50%', 'Aggressive 100%']
  },
  
  resourceRequirements: {
    compute: {
      current: 'Monitor current CPU and memory usage',
      scaling: 'Plan for auto-scaling thresholds',
      limits: 'Define maximum scale-out limits',
      costs: 'Factor in compute costs per scenario'
    },
    storage: {
      database: 'Project database growth based on user activity',
      files: 'Estimate file storage needs per user',
      backups: 'Account for backup storage requirements',
      archival: 'Plan for data archival strategies'
    },
    network: {
      bandwidth: 'Calculate bandwidth needs per user',
      requests: 'Estimate API request volume growth',
      cdn: 'Plan CDN usage and costs',
      regions: 'Consider geographic expansion needs'
    }
  },
  
  costOptimization: {
    reserved: 'Use reserved instances for predictable workloads',
    spot: 'Leverage spot instances for non-critical tasks',
    scheduling: 'Schedule non-urgent tasks during off-peak',
    rightsizing: 'Continuously optimize resource allocation'
  }
}
```

### Automated Capacity Management
```bash
#!/bin/bash
# Automated Capacity Management

monitor_capacity_usage() {
  echo "=== CAPACITY USAGE MONITORING ==="
  
  # 1. Database Capacity
  echo "Checking database capacity..."
  
  db_size=$(supabase exec sql --query "
    SELECT pg_size_pretty(pg_database_size(current_database()))
  " | tail -1)
  
  db_connections=$(supabase exec sql --query "
    SELECT count(*) FROM pg_stat_activity WHERE pid != pg_backend_pid()
  " | tail -1)
  
  max_connections=$(supabase exec sql --query "
    SELECT setting FROM pg_settings WHERE name = 'max_connections'
  " | tail -1)
  
  connection_utilization=$(echo "scale=2; $db_connections * 100 / $max_connections" | bc)
  
  echo "Database size: $db_size"
  echo "Connection utilization: ${connection_utilization}%"
  
  # Alert if approaching limits
  if (( $(echo "$connection_utilization > 80" | bc -l) )); then
    send_capacity_alert "Database connections at ${connection_utilization}%"
  fi
  
  # 2. API Request Volume
  echo "Analyzing API request volume..."
  
  # Get request volume from last hour (implementation depends on logging)
  current_hour_requests=$(grep "$(date '+%Y-%m-%d %H')" /var/log/nginx/access.log | wc -l)
  requests_per_minute=$(echo "scale=2; $current_hour_requests / 60" | bc)
  
  echo "Current requests/minute: $requests_per_minute"
  
  # Compare to capacity limits
  if (( $(echo "$requests_per_minute > 1500" | bc -l) )); then
    send_capacity_alert "API requests approaching capacity: $requests_per_minute/min"
  fi
  
  # 3. Storage Capacity
  echo "Checking storage capacity..."
  
  # File storage usage
  storage_usage=$(du -sh /var/lib/storage 2>/dev/null | cut -f1)
  echo "File storage usage: $storage_usage"
  
  # Log storage usage
  log_usage=$(du -sh /var/log | cut -f1)
  echo "Log storage usage: $log_usage"
  
  # Check disk space
  disk_usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
  echo "Disk usage: ${disk_usage}%"
  
  if [ "$disk_usage" -gt 85 ]; then
    send_capacity_alert "Disk usage critical: ${disk_usage}%"
  fi
}

# Predictive scaling based on usage patterns
predictive_scaling() {
  echo "=== PREDICTIVE SCALING ANALYSIS ==="
  
  # Analyze traffic patterns for auto-scaling
  echo "Analyzing traffic patterns..."
  
  # Get hourly traffic for the past 7 days
  for i in {0..6}; do
    date_check=$(date -d "$i days ago" '+%Y-%m-%d')
    hourly_traffic=$(grep "$date_check" /var/log/nginx/access.log | \
      awk '{print $4}' | cut -d: -f2 | sort | uniq -c)
    
    echo "Traffic pattern for $date_check:"
    echo "$hourly_traffic"
  done
  
  # Predict scaling needs based on patterns
  current_hour=$(date '+%H')
  echo "Current hour: $current_hour"
  
  # This would implement machine learning or statistical analysis
  # to predict scaling needs based on historical patterns
}

# Resource optimization recommendations
resource_optimization() {
  echo "=== RESOURCE OPTIMIZATION RECOMMENDATIONS ==="
  
  # Database optimization opportunities
  echo "Database optimization opportunities:"
  supabase exec sql --query "
    SELECT 
      schemaname,
      tablename,
      pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
    FROM pg_tables 
    WHERE schemaname NOT IN ('information_schema', 'pg_catalog')
    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
    LIMIT 10;
  "
  
  # Cache optimization opportunities
  echo "Cache optimization opportunities:"
  # This would analyze cache hit ratios and suggest optimizations
  
  # Resource utilization analysis
  echo "Resource utilization analysis:"
  echo "Average CPU usage: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//')%"
  echo "Memory usage: $(free | grep Mem | awk '{printf "%.2f", $3/$2 * 100}')%"
}

send_capacity_alert() {
  local message="$1"
  echo "CAPACITY ALERT: $message"
  
  # Send to monitoring system
  curl -X POST "https://api.datadog.com/api/v1/events" \
    -H "DD-API-KEY: $DD_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{
      \"title\": \"Capacity Alert\",
      \"text\": \"$message\",
      \"alert_type\": \"warning\",
      \"source_type_name\": \"capacity_monitor\"
    }"
  
  # Send to Slack
  curl -X POST "$SLACK_WEBHOOK_URL" \
    -H 'Content-type: application/json' \
    --data "{
      \"text\": \"⚠️ Capacity Alert: $message\",
      \"channel\": \"#operations\"
    }"
}
```

## Performance Reporting

### Automated Performance Reports
```typescript
interface PerformanceReportingSystem {
  dailyReports: {
    metrics: [
      'Core Web Vitals summary',
      'API response time percentiles',
      'Error rate analysis',
      'Top performing/slowest pages'
    ],
    distribution: ['Engineering team', 'Product team', 'Leadership'],
    format: 'Email with dashboard links'
  },
  
  weeklyReports: {
    metrics: [
      'Performance trend analysis',
      'Capacity utilization trends',
      'Performance vs business metrics correlation',
      'Optimization recommendations'
    ],
    distribution: ['All stakeholders', 'Performance team'],
    format: 'Comprehensive PDF report'
  },
  
  incidentReports: {
    triggers: 'Any performance SLA violation',
    timeline: 'Within 2 hours of incident',
    content: [
      'Impact assessment',
      'Root cause analysis',
      'Resolution timeline',
      'Prevention measures'
    ]
  }
}
```

This comprehensive performance management guide ensures the Thorbis Business OS platform maintains optimal performance while supporting business growth and providing exceptional user experience through the NextFaster doctrine implementation.