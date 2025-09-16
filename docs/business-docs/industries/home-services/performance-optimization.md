# Home Services Performance Optimization Guide

> **Version**: 1.0.0  
> **Last Updated**: January 2025  
> **Maintained By**: Thorbis Performance Engineering Team  
> **Review Schedule**: Monthly  

## Overview

This comprehensive performance optimization guide focuses on maximizing the efficiency, speed, and reliability of the Thorbis Business OS platform specifically for home services operations. It covers NextFaster doctrine implementation, industry-specific optimizations, mobile performance enhancements, and operational efficiency improvements to ensure optimal user experience and business outcomes.

## NextFaster Doctrine for Home Services

### Core Performance Principles
```typescript
interface NextFasterHomeServices {
  fieldTechnicianOptimization: {
    jobLoadTime: 'Complete job details load in under 1 second',
    offlineSync: 'Instant offline mode switching with zero data loss',
    photoUpload: 'Progressive upload with immediate UI feedback',
    formSubmission: 'Instant form validation and submission confirmation',
    navigationSpeed: 'Sub-300ms navigation between all screens'
  },

  dispatcherOptimization: {
    dashboardLoad: 'Full technician dashboard in under 2 seconds',
    scheduleView: 'Interactive schedule loads in under 1.5 seconds',
    customerLookup: 'Customer search results in under 500ms',
    realTimeUpdates: 'Live job status updates with WebSocket efficiency',
    bulkOperations: 'Batch operations complete in under 3 seconds'
  },

  customerPortalOptimization: {
    bookingFlow: 'Complete service booking in under 60 seconds',
    paymentProcessing: 'Payment forms load and submit in under 2 seconds',
    serviceHistory: 'Full service history loads in under 1 second',
    documentAccess: 'Invoices and estimates load instantly',
    communicationSpeed: 'Messages send and receive in real-time'
  },

  systemWideOptimizations: {
    apiResponseTime: 'All API endpoints respond in under 200ms',
    databaseQueries: 'Complex queries execute in under 100ms',
    imageOptimization: 'Images load progressively with WebP format',
    cacheStrategy: 'Aggressive caching with smart invalidation',
    bundleOptimization: '170KB JavaScript budget per route'
  }
}
```

### Performance Budget Implementation
```typescript
interface PerformanceBudgets {
  mobileApplication: {
    javascriptBundle: '170KB maximum per route',
    imageAssets: '500KB maximum per screen',
    totalPageWeight: '1MB maximum including all assets',
    renderTime: 'First meaningful paint under 1.5 seconds',
    interactivityTime: 'Time to interactive under 2.5 seconds'
  },

  webApplication: {
    initialBundle: '200KB maximum for critical path',
    routeChunks: '150KB maximum per lazy-loaded route',
    staticAssets: '2MB maximum per page',
    cumulativeLayoutShift: 'CLS score under 0.1',
    largestContentfulPaint: 'LCP under 1.8 seconds'
  },

  apiPerformance: {
    responseTime: '200ms maximum for standard endpoints',
    complexQueries: '500ms maximum for reporting endpoints',
    fileUploads: '5MB maximum file size with streaming',
    databaseConnections: '50ms maximum connection establishment',
    cacheHitRatio: '95% minimum for frequently accessed data'
  }
}
```

## Database Performance Optimization

### Home Services Query Optimization
```sql
-- High-performance queries for home services operations

-- Optimized technician availability query
CREATE OR REPLACE FUNCTION get_available_technicians(
    service_date DATE,
    service_category VARCHAR,
    service_area_id UUID,
    duration_minutes INTEGER DEFAULT 120
) RETURNS TABLE (
    technician_id UUID,
    technician_name VARCHAR,
    specialization TEXT[],
    travel_time_minutes INTEGER,
    availability_score INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH technician_schedules AS (
        SELECT 
            up.id,
            up.name,
            up.specializations,
            COALESCE(ts.available_start, '08:00'::TIME) as start_time,
            COALESCE(ts.available_end, '17:00'::TIME) as end_time,
            COUNT(wo.id) as scheduled_jobs
        FROM user_profiles up
        LEFT JOIN technician_schedules ts ON up.id = ts.technician_id 
            AND ts.date = service_date
        LEFT JOIN work_orders wo ON up.id = wo.assigned_technician_id 
            AND wo.scheduled_date::DATE = service_date
            AND wo.status IN ('scheduled', 'in_progress')
        WHERE up.role = 'technician' 
        AND up.is_active = true
        AND (service_category = ANY(up.specializations) OR 'general' = ANY(up.specializations))
        GROUP BY up.id, up.name, up.specializations, ts.available_start, ts.available_end
    ),
    travel_calculations AS (
        SELECT 
            ts.id,
            ts.name,
            ts.specializations,
            ts.scheduled_jobs,
            -- Calculate travel time from technician's current/home location
            EXTRACT(EPOCH FROM (
                calculate_travel_time(
                    COALESCE(current_location.coordinates, home_location.coordinates),
                    (SELECT coordinates FROM service_areas WHERE id = service_area_id)
                )
            )) / 60 as travel_minutes
        FROM technician_schedules ts
        LEFT JOIN technician_locations current_location ON ts.id = current_location.technician_id 
            AND current_location.timestamp > NOW() - INTERVAL '30 minutes'
        LEFT JOIN user_profiles up ON ts.id = up.id
        LEFT JOIN addresses home_location ON up.home_address_id = home_location.id
    )
    SELECT 
        tc.id,
        tc.name,
        tc.specializations,
        tc.travel_minutes::INTEGER,
        -- Availability score based on travel time, workload, and specialization match
        CASE 
            WHEN service_category = ANY(tc.specializations) THEN 100
            ELSE 80
        END - 
        (tc.travel_minutes * 0.5)::INTEGER - 
        (tc.scheduled_jobs * 10) as availability_score
    FROM travel_calculations tc
    WHERE tc.travel_minutes <= 60  -- Max 1 hour travel time
    ORDER BY availability_score DESC, tc.travel_minutes ASC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- Optimized customer service history query with materialized view
CREATE MATERIALIZED VIEW customer_service_performance AS
SELECT 
    c.id as customer_id,
    c.business_id,
    c.name,
    
    -- Service statistics (last 24 months)
    COUNT(wo.id) FILTER (WHERE wo.created_at >= NOW() - INTERVAL '24 months') as total_services,
    COUNT(wo.id) FILTER (WHERE wo.created_at >= NOW() - INTERVAL '12 months') as services_last_year,
    COUNT(wo.id) FILTER (WHERE wo.created_at >= NOW() - INTERVAL '90 days') as services_recent,
    
    -- Financial metrics
    COALESCE(SUM(wo.actual_cost) FILTER (WHERE wo.status = 'completed'), 0) as lifetime_value,
    COALESCE(AVG(wo.actual_cost) FILTER (WHERE wo.status = 'completed'), 0) as average_job_value,
    
    -- Service quality metrics
    AVG(wo.customer_satisfaction_rating) as average_rating,
    COUNT(wo.customer_satisfaction_rating) as rating_count,
    
    -- Response time metrics
    AVG(EXTRACT(EPOCH FROM (wo.completed_at - wo.created_at)) / 3600.0) as avg_resolution_hours,
    
    -- Equipment and property information
    array_agg(DISTINCT ce.equipment_type) FILTER (WHERE ce.equipment_type IS NOT NULL) as equipment_types,
    COUNT(DISTINCT cp.id) as property_count,
    
    -- Service categories
    array_agg(DISTINCT wo.service_category) FILTER (WHERE wo.service_category IS NOT NULL) as service_categories,
    
    -- Last service information
    MAX(wo.completed_at) as last_service_date,
    
    -- Risk indicators
    COUNT(*) FILTER (WHERE wo.priority_level = 'emergency') as emergency_calls,
    COUNT(*) FILTER (WHERE wo.customer_satisfaction_rating <= 3) as low_satisfaction_jobs,
    
    -- Update timestamp
    NOW() as last_updated
    
FROM customers c
LEFT JOIN work_orders wo ON c.id = wo.customer_id
LEFT JOIN customer_equipment ce ON c.id = ce.customer_id
LEFT JOIN customer_properties cp ON c.id = cp.customer_id
WHERE c.is_active = true
GROUP BY c.id, c.business_id, c.name;

-- Create indexes for optimal performance
CREATE UNIQUE INDEX idx_customer_service_performance_customer 
ON customer_service_performance(customer_id, business_id);

CREATE INDEX idx_customer_service_performance_business 
ON customer_service_performance(business_id, lifetime_value DESC);

-- Optimized work order dispatch query
CREATE OR REPLACE FUNCTION get_dispatch_dashboard(
    business_id UUID,
    dashboard_date DATE DEFAULT CURRENT_DATE
) RETURNS TABLE (
    unassigned_jobs INTEGER,
    emergency_jobs INTEGER,
    in_progress_jobs INTEGER,
    overdue_jobs INTEGER,
    technician_utilization JSONB,
    service_category_breakdown JSONB,
    revenue_today DECIMAL,
    avg_response_time DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    WITH dashboard_metrics AS (
        SELECT 
            COUNT(*) FILTER (WHERE assigned_technician_id IS NULL) as unassigned_count,
            COUNT(*) FILTER (WHERE priority_level = 'emergency') as emergency_count,
            COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_count,
            COUNT(*) FILTER (WHERE scheduled_date < NOW() AND status NOT IN ('completed', 'cancelled')) as overdue_count,
            
            -- Technician utilization
            jsonb_object_agg(
                COALESCE(up.name, 'Unassigned'),
                jsonb_build_object(
                    'jobs', COUNT(wo.id),
                    'completed', COUNT(*) FILTER (WHERE wo.status = 'completed'),
                    'in_progress', COUNT(*) FILTER (WHERE wo.status = 'in_progress')
                )
            ) as tech_utilization,
            
            -- Service category breakdown
            jsonb_object_agg(
                COALESCE(wo.service_category, 'other'),
                COUNT(wo.id)
            ) as category_breakdown,
            
            -- Revenue metrics
            COALESCE(SUM(wo.actual_cost) FILTER (WHERE wo.status = 'completed'), 0) as daily_revenue,
            
            -- Response time
            AVG(EXTRACT(EPOCH FROM (wo.started_at - wo.created_at)) / 3600.0) as avg_response_hrs
            
        FROM work_orders wo
        LEFT JOIN user_profiles up ON wo.assigned_technician_id = up.id
        WHERE wo.business_id = get_dispatch_dashboard.business_id
        AND wo.scheduled_date::DATE = dashboard_date
    )
    SELECT 
        dm.unassigned_count::INTEGER,
        dm.emergency_count::INTEGER,
        dm.in_progress_count::INTEGER,
        dm.overdue_count::INTEGER,
        dm.tech_utilization,
        dm.category_breakdown,
        dm.daily_revenue,
        dm.avg_response_hrs::DECIMAL
    FROM dashboard_metrics dm;
END;
$$ LANGUAGE plpgsql;

-- Performance monitoring for slow queries
CREATE TABLE query_performance_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_type VARCHAR(100) NOT NULL,
    execution_time_ms INTEGER NOT NULL,
    query_hash VARCHAR(64),
    business_id UUID REFERENCES businesses(id),
    user_id UUID REFERENCES user_profiles(id),
    parameters JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Automatic query performance logging
CREATE OR REPLACE FUNCTION log_slow_query(
    query_type VARCHAR,
    start_time TIMESTAMPTZ,
    query_hash VARCHAR DEFAULT NULL,
    business_id UUID DEFAULT NULL,
    user_id UUID DEFAULT NULL,
    parameters JSONB DEFAULT '{}'::JSONB
) RETURNS VOID AS $$
DECLARE
    execution_time_ms INTEGER;
BEGIN
    execution_time_ms := EXTRACT(EPOCH FROM (NOW() - start_time)) * 1000;
    
    -- Only log queries that take longer than 100ms
    IF execution_time_ms > 100 THEN
        INSERT INTO query_performance_log (
            query_type, execution_time_ms, query_hash, 
            business_id, user_id, parameters
        ) VALUES (
            query_type, execution_time_ms, query_hash,
            business_id, user_id, parameters
        );
    END IF;
END;
$$ LANGUAGE plpgsql;
```

### Connection Pool Optimization
```typescript
interface DatabaseConnectionOptimization {
  connectionPooling: {
    minConnections: 5,
    maxConnections: 25,
    acquireTimeoutMs: 10000,
    idleTimeoutMs: 300000,
    reapIntervalMs: 1000,
    createRetryIntervalMs: 200,
    createTimeoutMs: 30000
  },

  queryOptimization: {
    preparedStatements: 'Use prepared statements for repeated queries',
    indexStrategy: 'Comprehensive indexing for home services queries',
    partitioning: 'Partition large tables by business_id and date',
    materialized: 'Materialized views for complex aggregations',
    caching: 'Application-level caching for read-heavy operations'
  },

  readReplicas: {
    strategy: 'Route read queries to read replicas',
    loadBalancing: 'Round-robin with health check fallback',
    replicationLag: 'Monitor and alert on replication lag > 1 second',
    failover: 'Automatic failover to primary on replica failure'
  }
}
```

## Frontend Performance Optimization

### Mobile App Performance
```typescript
// Mobile performance optimization implementation
class MobilePerformanceOptimizer {
  private cacheManager: CacheManager;
  private imageOptimizer: ImageOptimizer;
  private networkManager: NetworkManager;

  constructor() {
    this.cacheManager = new CacheManager({
      maxCacheSize: 100 * 1024 * 1024, // 100MB
      ttl: 24 * 60 * 60 * 1000, // 24 hours
      strategy: 'lru'
    });

    this.imageOptimizer = new ImageOptimizer({
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 0.8,
      format: 'webp'
    });

    this.networkManager = new NetworkManager({
      timeout: 10000,
      retryAttempts: 3,
      retryDelay: 1000
    });
  }

  async optimizeJobDataLoading(jobId: string): Promise<JobData> {
    const cacheKey = `job_data_${jobId}`;
    
    // Check cache first
    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData && this.isCacheValid(cachedData)) {
      return cachedData;
    }

    // Fetch core job data immediately
    const coreDataPromise = this.fetchCoreJobData(jobId);
    
    // Fetch additional data in parallel
    const [coreData, customerData, equipmentData] = await Promise.allSettled([
      coreDataPromise,
      this.fetchCustomerData(jobId),
      this.fetchEquipmentData(jobId)
    ]);

    // Combine successful results
    const jobData = this.combineJobData(
      this.extractResult(coreData),
      this.extractResult(customerData),
      this.extractResult(equipmentData)
    );

    // Cache for future use
    await this.cacheManager.set(cacheKey, jobData);

    return jobData;
  }

  async optimizeImageHandling(images: Image[]): Promise<OptimizedImage[]> {
    const optimizationPromises = images.map(async (image) => {
      // Check if optimized version exists in cache
      const cacheKey = `optimized_${image.id}`;
      const cachedImage = await this.cacheManager.get(cacheKey);
      
      if (cachedImage) {
        return cachedImage;
      }

      // Optimize image
      const optimizedImage = await this.imageOptimizer.optimize({
        source: image.source,
        maxWidth: 800, // Smaller for mobile
        quality: 0.7,
        format: 'webp',
        progressive: true
      });

      // Generate thumbnail
      const thumbnail = await this.imageOptimizer.optimize({
        source: image.source,
        maxWidth: 150,
        maxHeight: 150,
        quality: 0.6,
        format: 'webp'
      });

      const result = {
        ...optimizedImage,
        thumbnail,
        originalSize: image.size,
        optimizedSize: optimizedImage.size,
        compressionRatio: optimizedImage.size / image.size
      };

      // Cache optimized image
      await this.cacheManager.set(cacheKey, result);

      return result;
    });

    return Promise.all(optimizationPromises);
  }

  async implementProgressiveSync(): Promise<SyncResult> {
    const syncQueue = await this.getSyncQueue();
    const prioritizedQueue = this.prioritizeSyncItems(syncQueue);

    const syncResults = {
      completed: 0,
      failed: 0,
      total: prioritizedQueue.length,
      errors: []
    };

    // Process high-priority items first
    for (const item of prioritizedQueue.filter(i => i.priority === 'high')) {
      try {
        await this.processSyncItem(item);
        syncResults.completed++;
        
        // Update UI immediately for high-priority syncs
        this.notifyUI('sync_progress', {
          item: item.type,
          status: 'completed'
        });
        
      } catch (error) {
        syncResults.failed++;
        syncResults.errors.push({
          item: item.id,
          error: error.message
        });
      }
    }

    // Process remaining items in batches
    const remainingItems = prioritizedQueue.filter(i => i.priority !== 'high');
    const batchSize = 5;
    
    for (let i = 0; i < remainingItems.length; i += batchSize) {
      const batch = remainingItems.slice(i, i + batchSize);
      
      const batchResults = await Promise.allSettled(
        batch.map(item => this.processSyncItem(item))
      );

      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          syncResults.completed++;
        } else {
          syncResults.failed++;
          syncResults.errors.push({
            item: batch[index].id,
            error: result.reason?.message || 'Unknown error'
          });
        }
      });

      // Small delay between batches to prevent overwhelming the device
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return syncResults;
  }

  private prioritizeSyncItems(items: SyncItem[]): PrioritizedSyncItem[] {
    return items
      .map(item => ({
        ...item,
        priority: this.calculateSyncPriority(item)
      }))
      .sort((a, b) => {
        const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
  }

  private calculateSyncPriority(item: SyncItem): 'high' | 'medium' | 'low' {
    if (item.type === 'work_order_status' || item.type === 'customer_signature') {
      return 'high';
    }
    if (item.type === 'photos' || item.type === 'measurements') {
      return 'medium';
    }
    return 'low';
  }

  async optimizeOfflineStorage(): Promise<void> {
    const storageUsage = await this.calculateStorageUsage();
    
    if (storageUsage.percentage > 80) {
      // Clean up old cached data
      await this.cleanupOldCache();
      
      // Compress large files
      await this.compressLargeFiles();
      
      // Remove unnecessary offline data
      await this.cleanupOfflineData();
    }
  }

  private async cleanupOldCache(): Promise<void> {
    const cacheKeys = await this.cacheManager.getAllKeys();
    const now = Date.now();
    
    for (const key of cacheKeys) {
      const cacheData = await this.cacheManager.get(key);
      if (cacheData && cacheData.timestamp) {
        const age = now - cacheData.timestamp;
        const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
        
        if (age > maxAge) {
          await this.cacheManager.delete(key);
        }
      }
    }
  }
}
```

### Web Application Optimization
```typescript
interface WebApplicationOptimization {
  bundleOptimization: {
    codesplitting: {
      routeLevel: 'Dynamic imports for each major route',
      componentLevel: 'Lazy loading for heavy components',
      vendorSplitting: 'Separate vendor bundle from application code',
      criticalPath: 'Inline critical CSS and JavaScript'
    },

    treeShaking: {
      deadCodeElimination: 'Remove unused code from bundles',
      libraryOptimization: 'Import only required library functions',
      cssOptimization: 'Remove unused CSS selectors',
      imageOptimization: 'Automatic image format selection'
    },

    compression: {
      gzipCompression: 'Enable gzip for all text-based assets',
      brotliCompression: 'Use Brotli compression for modern browsers',
      assetMinification: 'Minify JavaScript, CSS, and HTML',
      sourcemapOptimization: 'External sourcemaps in production'
    }
  },

  renderingOptimization: {
    serverSideRendering: 'SSR for critical above-the-fold content',
    staticGeneration: 'ISR for frequently accessed pages',
    clientHydration: 'Selective hydration for interactive components',
    prefetching: 'Intelligent prefetching based on user behavior'
  }
}
```

## Caching Strategy Implementation

### Multi-Level Caching
```typescript
interface CachingStrategy {
  edgeCache: {
    provider: 'Cloudflare CDN with global edge locations',
    ttl: '1 hour for static assets, 5 minutes for API responses',
    purging: 'Automatic purging on content updates',
    rules: 'Custom cache rules for different content types'
  },

  applicationCache: {
    redisCluster: 'Redis cluster for session and application data',
    inMemoryCache: 'Node.js memory cache for frequently accessed data',
    databaseCache: 'Query result caching at database level',
    invalidation: 'Smart cache invalidation strategies'
  },

  browserCache: {
    serviceWorker: 'Service worker for offline functionality',
    localStorage: 'User preferences and session data',
    sessionStorage: 'Temporary form data and navigation state',
    indexedDB: 'Offline data storage for mobile applications'
  }
}
```

### Cache Implementation
```typescript
// Advanced caching implementation
class AdvancedCacheManager {
  private redis: RedisCluster;
  private memoryCache: Map<string, CacheEntry>;
  private compressionEnabled: boolean;

  constructor(config: CacheConfig) {
    this.redis = new RedisCluster(config.redis);
    this.memoryCache = new Map();
    this.compressionEnabled = config.compression || true;
    
    // Set up cache warming
    this.setupCacheWarming();
    
    // Set up cache monitoring
    this.setupCacheMonitoring();
  }

  async get(key: string, options: CacheOptions = {}): Promise<any> {
    const startTime = Date.now();
    
    try {
      // Try memory cache first (fastest)
      if (options.useMemoryCache !== false) {
        const memoryResult = this.memoryCache.get(key);
        if (memoryResult && this.isCacheEntryValid(memoryResult)) {
          this.recordCacheHit('memory', Date.now() - startTime);
          return memoryResult.data;
        }
      }

      // Try Redis cache (network call but still fast)
      const redisResult = await this.redis.get(key);
      if (redisResult) {
        const data = this.deserializeData(redisResult);
        
        // Populate memory cache for next access
        if (options.useMemoryCache !== false) {
          this.memoryCache.set(key, {
            data,
            timestamp: Date.now(),
            ttl: options.ttl || 3600000
          });
        }
        
        this.recordCacheHit('redis', Date.now() - startTime);
        return data;
      }

      // Cache miss
      this.recordCacheMiss(key, Date.now() - startTime);
      return null;

    } catch (error) {
      console.error('Cache get error:', error);
      this.recordCacheError('get', key, error);
      return null;
    }
  }

  async set(
    key: string, 
    data: any, 
    options: CacheSetOptions = {}
  ): Promise<void> {
    const startTime = Date.now();
    
    try {
      const ttl = options.ttl || 3600000; // 1 hour default
      const serializedData = this.serializeData(data);

      // Set in Redis with TTL
      await this.redis.setex(key, Math.floor(ttl / 1000), serializedData);

      // Set in memory cache if requested
      if (options.useMemoryCache !== false) {
        this.memoryCache.set(key, {
          data,
          timestamp: Date.now(),
          ttl
        });
      }

      // Schedule cache warming for related keys
      if (options.warmRelated) {
        this.scheduleRelatedCacheWarming(key, data);
      }

      this.recordCacheSet(key, Date.now() - startTime);

    } catch (error) {
      console.error('Cache set error:', error);
      this.recordCacheError('set', key, error);
    }
  }

  async invalidate(pattern: string): Promise<void> {
    try {
      // Invalidate memory cache
      for (const key of this.memoryCache.keys()) {
        if (this.matchesPattern(key, pattern)) {
          this.memoryCache.delete(key);
        }
      }

      // Invalidate Redis cache
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }

      console.log(`Invalidated ${keys.length} cache entries matching pattern: ${pattern}`);

    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }

  setupCacheWarming(): void {
    // Warm cache for commonly accessed data
    setInterval(async () => {
      await this.warmFrequentlyAccessedData();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  private async warmFrequentlyAccessedData(): Promise<void> {
    const commonQueries = [
      'active_technicians',
      'service_categories',
      'business_settings',
      'inventory_summary'
    ];

    for (const query of commonQueries) {
      try {
        const cached = await this.get(query);
        if (!cached) {
          // Fetch and cache the data
          const data = await this.fetchDataForWarming(query);
          await this.set(query, data, { ttl: 30 * 60 * 1000 }); // 30 minutes
        }
      } catch (error) {
        console.error(`Cache warming failed for ${query}:`, error);
      }
    }
  }

  private setupCacheMonitoring(): void {
    setInterval(() => {
      const stats = this.getCacheStats();
      console.log('Cache Performance Stats:', stats);
      
      // Alert if cache hit rate is too low
      if (stats.hitRate < 0.8) {
        console.warn('Low cache hit rate detected:', stats.hitRate);
      }
      
      // Clean up expired memory cache entries
      this.cleanupExpiredMemoryCache();
      
    }, 60 * 1000); // Every minute
  }

  private getCacheStats(): CacheStats {
    return {
      memorySize: this.memoryCache.size,
      hitRate: this.calculateHitRate(),
      avgResponseTime: this.calculateAvgResponseTime(),
      errorRate: this.calculateErrorRate()
    };
  }
}
```

## Real-Time Performance Monitoring

### Performance Metrics Collection
```typescript
interface PerformanceMetrics {
  userExperience: {
    pageLoadTimes: 'Track Core Web Vitals for all user interactions',
    apiResponseTimes: 'Monitor API endpoint performance with percentiles',
    errorRates: 'Track application errors and their impact on users',
    userFlows: 'Measure completion rates for critical user journeys'
  },

  technicalMetrics: {
    serverPerformance: 'CPU, memory, and disk usage monitoring',
    databasePerformance: 'Query execution times and connection pooling',
    networkMetrics: 'Bandwidth usage and connection quality',
    cacheEffectiveness: 'Cache hit rates and invalidation patterns'
  },

  businessMetrics: {
    serviceDeliverySpeed: 'Time from job creation to completion',
    customerSatisfaction: 'Real-time satisfaction score tracking',
    operationalEfficiency: 'Technician productivity and route optimization',
    systemReliability: 'Uptime and service availability metrics'
  }
}
```

### Performance Monitoring Implementation
```bash
#!/bin/bash
# Performance Monitoring Setup for Home Services

setup_performance_monitoring() {
  echo "=== PERFORMANCE MONITORING SETUP ==="
  
  # Configure application performance monitoring
  setup_application_monitoring() {
    echo "Setting up application performance monitoring..."
    
    # Install and configure DataDog agent
    curl -s https://raw.githubusercontent.com/DataDog/datadog-agent/main/cmd/agent/install_script.sh | bash
    
    # Configure DataDog for Next.js application
    cat > /etc/datadog-agent/conf.d/nodejs.d/conf.yaml << EOF
logs:
  - type: file
    path: "/var/log/thorbis/*.log"
    service: thorbis-home-services
    source: nodejs
    tags:
      - env:production
      - industry:home-services

apm_config:
  enabled: true
  env: production
  
process_config:
  enabled: true
EOF

    # Configure custom performance metrics
    supabase exec sql --query "
      CREATE TABLE IF NOT EXISTS performance_metrics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        metric_type VARCHAR(100) NOT NULL,
        metric_name VARCHAR(100) NOT NULL,
        value DECIMAL(10,4) NOT NULL,
        unit VARCHAR(20),
        tags JSONB,
        business_id UUID REFERENCES businesses(id),
        recorded_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      CREATE INDEX idx_performance_metrics_type_time 
      ON performance_metrics(metric_type, recorded_at);
      
      CREATE INDEX idx_performance_metrics_business 
      ON performance_metrics(business_id, recorded_at);
    "
  }
  
  # Set up real-time performance alerts
  setup_performance_alerts() {
    echo "Configuring performance alerts..."
    
    # Create performance monitoring script
    cat > /usr/local/bin/monitor-performance.sh << 'EOF'
#!/bin/bash

# Check API response times
check_api_performance() {
  local api_url="https://api.thorbis.com/health"
  local response_time=$(curl -w "%{time_total}" -s "$api_url" | tail -1)
  local response_time_ms=$(echo "$response_time * 1000" | bc)
  
  echo "API response time: ${response_time_ms}ms"
  
  # Alert if response time > 500ms
  if (( $(echo "$response_time_ms > 500" | bc -l) )); then
    send_performance_alert "API" "High response time: ${response_time_ms}ms"
  fi
  
  # Log metric to database
  log_performance_metric "api_response_time" "$response_time_ms" "ms"
}

# Check database performance
check_database_performance() {
  local db_response_time=$(supabase exec sql --query "
    SELECT EXTRACT(EPOCH FROM NOW() - query_start) * 1000 as duration_ms
    FROM pg_stat_activity 
    WHERE state = 'active' 
    ORDER BY duration_ms DESC 
    LIMIT 1;
  " --csv | tail -1)
  
  if [ ! -z "$db_response_time" ] && (( $(echo "$db_response_time > 1000" | bc -l) )); then
    send_performance_alert "DATABASE" "Long running query: ${db_response_time}ms"
  fi
}

# Check system resources
check_system_resources() {
  local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
  local memory_usage=$(free | grep Mem | awk '{printf("%.1f", ($3/$2) * 100.0)}')
  local disk_usage=$(df -h / | awk 'NR==2{print $5}' | cut -d'%' -f1)
  
  echo "System resources - CPU: ${cpu_usage}%, Memory: ${memory_usage}%, Disk: ${disk_usage}%"
  
  # Log metrics
  log_performance_metric "cpu_usage" "$cpu_usage" "percent"
  log_performance_metric "memory_usage" "$memory_usage" "percent"
  log_performance_metric "disk_usage" "$disk_usage" "percent"
  
  # Alerts for high resource usage
  if (( $(echo "$cpu_usage > 80" | bc -l) )); then
    send_performance_alert "SYSTEM" "High CPU usage: ${cpu_usage}%"
  fi
  
  if (( $(echo "$memory_usage > 85" | bc -l) )); then
    send_performance_alert "SYSTEM" "High memory usage: ${memory_usage}%"
  fi
  
  if (( $(echo "$disk_usage > 90" | bc -l) )); then
    send_performance_alert "SYSTEM" "High disk usage: ${disk_usage}%"
  fi
}

# Log performance metric to database
log_performance_metric() {
  local metric_name="$1"
  local value="$2"
  local unit="$3"
  
  supabase exec sql --query "
    INSERT INTO performance_metrics (metric_type, metric_name, value, unit, tags)
    VALUES ('system', '$metric_name', $value, '$unit', '{\"source\": \"monitoring_script\"}');
  "
}

# Send performance alert
send_performance_alert() {
  local alert_type="$1"
  local message="$2"
  
  # Send to Slack
  curl -X POST "$SLACK_WEBHOOK_URL" \
    -H 'Content-type: application/json' \
    --data "{
      \"text\": \"⚠️ Performance Alert: $alert_type\",
      \"attachments\": [{
        \"color\": \"warning\",
        \"fields\": [{
          \"title\": \"Message\",
          \"value\": \"$message\",
          \"short\": false
        }, {
          \"title\": \"Timestamp\",
          \"value\": \"$(date)\",
          \"short\": true
        }]
      }],
      \"channel\": \"#performance-alerts\"
    }"
  
  # Log alert to database
  supabase exec sql --query "
    INSERT INTO performance_alerts (alert_type, message, severity, created_at)
    VALUES ('$alert_type', '$message', 'warning', NOW());
  "
}

# Main monitoring loop
main() {
  echo "=== Performance Check $(date) ==="
  check_api_performance
  check_database_performance
  check_system_resources
  echo "=== Performance Check Complete ==="
}

main
EOF

    chmod +x /usr/local/bin/monitor-performance.sh
    
    # Add to crontab for regular execution
    (crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/monitor-performance.sh") | crontab -
  }
  
  # Configure Core Web Vitals monitoring
  setup_web_vitals_monitoring() {
    echo "Setting up Core Web Vitals monitoring..."
    
    # Create web vitals monitoring script
    cat > /var/www/html/monitor-web-vitals.js << 'EOF'
// Core Web Vitals monitoring for home services
import { getLCP, getFID, getCLS, getFCP, getTTFB } from 'web-vitals';

class WebVitalsMonitor {
  constructor() {
    this.metrics = {};
    this.setupMonitoring();
  }

  setupMonitoring() {
    // Largest Contentful Paint
    getLCP((metric) => {
      this.recordMetric('LCP', metric);
      if (metric.value > 2500) {
        this.sendAlert('LCP', metric.value, 'Critical');
      } else if (metric.value > 1800) {
        this.sendAlert('LCP', metric.value, 'Warning');
      }
    });

    // First Input Delay
    getFID((metric) => {
      this.recordMetric('FID', metric);
      if (metric.value > 300) {
        this.sendAlert('FID', metric.value, 'Critical');
      } else if (metric.value > 100) {
        this.sendAlert('FID', metric.value, 'Warning');
      }
    });

    // Cumulative Layout Shift
    getCLS((metric) => {
      this.recordMetric('CLS', metric);
      if (metric.value > 0.25) {
        this.sendAlert('CLS', metric.value, 'Critical');
      } else if (metric.value > 0.1) {
        this.sendAlert('CLS', metric.value, 'Warning');
      }
    });

    // Additional metrics
    getFCP((metric) => this.recordMetric('FCP', metric));
    getTTFB((metric) => this.recordMetric('TTFB', metric));
  }

  recordMetric(name, metric) {
    this.metrics[name] = metric;
    
    // Send to analytics
    this.sendToAnalytics(name, metric);
  }

  sendToAnalytics(name, metric) {
    fetch('/api/analytics/web-vitals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        metric: name,
        value: metric.value,
        id: metric.id,
        delta: metric.delta,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now()
      })
    });
  }

  sendAlert(metric, value, severity) {
    fetch('/api/alerts/web-vitals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        metric,
        value,
        severity,
        url: window.location.href,
        timestamp: Date.now()
      })
    });
  }
}

// Initialize monitoring
new WebVitalsMonitor();
EOF
  }
  
  setup_application_monitoring
  setup_performance_alerts
  setup_web_vitals_monitoring
  
  echo "✅ Performance monitoring setup completed"
}
```

## Industry-Specific Optimizations

### Home Services Performance Patterns
```typescript
interface HomeServicesOptimizations {
  fieldTechnicianWorkflows: {
    jobPreloading: {
      strategy: 'Preload next 3 scheduled jobs during current job',
      triggers: ['Job completion at 80%', 'Check-in to job location'],
      dataScope: 'Customer info, property details, equipment specs, parts list',
      storage: 'IndexedDB with automatic cleanup'
    },
    
    offlineFirst: {
      architecture: 'Offline-first with sync when connected',
      criticalPaths: 'All job execution functions work offline',
      syncPriority: 'Photos > Signatures > Job updates > Time tracking',
      conflictResolution: 'Server wins for customer data, field wins for job data'
    }
  },

  dispatchOptimization: {
    realTimeDashboard: {
      updateFrequency: 'WebSocket updates every 10 seconds',
      dataAggregation: 'Pre-calculated metrics updated every 5 minutes',
      filterPerformance: 'Client-side filtering with server-side pagination',
      mapOptimization: 'Clustered markers with dynamic loading'
    },
    
    scheduleOptimization: {
      routeCalculation: 'Background route optimization every 15 minutes',
      dragDropPerformance: 'Optimistic UI updates with rollback capability',
      bulkOperations: 'Batch API calls for multiple job assignments',
      autoSave: 'Auto-save schedule changes every 30 seconds'
    }
  },

  customerPortalOptimization: {
    bookingFlow: {
      stepOptimization: 'Reduce booking to 3 steps maximum',
      validation: 'Real-time validation without blocking UI',
      availability: 'Cached availability with 5-minute updates',
      paymentFlow: 'One-click payment for returning customers'
    },
    
    serviceHistory: {
      pagination: 'Virtual scrolling for large service histories',
      imageLoading: 'Progressive image loading with placeholder',
      documentAccess: 'PDF streaming for large invoices',
      searchOptimization: 'Client-side search with server-side fallback'
    }
  }
}
```

This comprehensive performance optimization guide ensures the Thorbis Business OS platform delivers exceptional performance specifically tailored for home services operations, maximizing efficiency for field technicians, dispatchers, and customers while maintaining system reliability and scalability.