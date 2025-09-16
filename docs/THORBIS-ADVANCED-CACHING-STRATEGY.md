# Thorbis Business OS Advanced Caching Strategy

> **Version**: 3.0.0  
> **Last Updated**: 2025-01-31  
> **Status**: Production Ready  
> **Architecture**: Multi-tenant, AI-Governed, Enterprise-Scale

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [PostgreSQL Materialized Views Strategy](#postgresql-materialized-views-strategy)
4. [Redis Caching Architecture](#redis-caching-architecture)
5. [Multi-Tenant Cache Isolation](#multi-tenant-cache-isolation)
6. [Industry-Specific Caching Patterns](#industry-specific-caching-patterns)
7. [Cache Invalidation and Dependency Management](#cache-invalidation-and-dependency-management)
8. [Performance Monitoring and Analytics](#performance-monitoring-and-analytics)
9. [High Availability and Disaster Recovery](#high-availability-and-disaster-recovery)
10. [Implementation Guidelines](#implementation-guidelines)
11. [Operational Management](#operational-management)

---

## Executive Summary

The Thorbis Business OS Advanced Caching Strategy implements a sophisticated multi-layered caching architecture designed to optimize performance across all industry verticals (Home Services, Automotive, Restaurant, Banking, Retail, Courses, Payroll, and Investigations) while maintaining strict multi-tenant isolation, security, and compliance requirements.

### Key Performance Targets
- **95% cache hit ratio** for frequently accessed data
- **Sub-10ms cache retrieval** for critical operations
- **99.9% cache availability** with automatic failover
- **Memory utilization optimization** with intelligent eviction
- **Cross-region synchronization** under 100ms

### Core Architecture Principles
- **Dark-first design** with minimal overlay patterns
- **AI-governed cache optimization** with predictive warming
- **Blockchain-verified** cache consistency
- **Industry-separated** caching patterns
- **NextFaster performance** optimization

---

## Architecture Overview

### Multi-Layered Cache Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                    EDGE CACHING LAYER                       │
│  CDN + Geographic Distribution + Static Asset Optimization  │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                 APPLICATION CACHE LAYER                     │
│     Redis Cluster + Session Management + API Response      │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│               BUSINESS LOGIC CACHE LAYER                    │
│    Computed Aggregations + Reports + ML Model Results      │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│               DATABASE QUERY CACHE LAYER                    │
│     PostgreSQL Materialized Views + Query Result Cache     │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                    STORAGE LAYER                           │
│      PostgreSQL 17+ TimescaleDB + Supabase Integration     │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Database**: PostgreSQL 17+ with TimescaleDB and PostGIS extensions
- **Primary Cache**: Redis 7+ with Redis Stack modules
- **Message Queue**: Redis Streams for cache invalidation events
- **Monitoring**: Custom monitoring schema with AI-powered anomaly detection
- **Serialization**: Protocol Buffers + MessagePack for optimal compression
- **Orchestration**: Docker Compose with Kubernetes for production

---

## PostgreSQL Materialized Views Strategy

### Core Materialized Views Architecture

#### 1. Tenant-Specific Aggregation Views

```sql
-- High-frequency customer data aggregations
CREATE MATERIALIZED VIEW mv_tenant_customer_summary AS
SELECT 
    t.id as tenant_id,
    c.id as customer_id,
    c.first_name,
    c.last_name,
    c.email,
    c.phone,
    c.customer_type,
    c.account_status,
    c.payment_status,
    COUNT(wo.id) as total_work_orders,
    COUNT(CASE WHEN wo.status = 'completed' THEN 1 END) as completed_orders,
    SUM(i.total_amount) as lifetime_value,
    MAX(wo.created_at) as last_service_date,
    c.created_at,
    c.updated_at
FROM tenant_mgmt.tenants t
JOIN hs.customers c ON c.tenant_id = t.id
LEFT JOIN hs.work_orders wo ON wo.customer_id = c.id
LEFT JOIN hs.invoices i ON i.work_order_id = wo.id
GROUP BY t.id, c.id, c.first_name, c.last_name, c.email, c.phone, 
         c.customer_type, c.account_status, c.payment_status, c.created_at, c.updated_at;

CREATE UNIQUE INDEX ON mv_tenant_customer_summary (tenant_id, customer_id);
CREATE INDEX ON mv_tenant_customer_summary (tenant_id, account_status);
CREATE INDEX ON mv_tenant_customer_summary (tenant_id, lifetime_value DESC);
```

#### 2. Financial Performance Views

```sql
-- Daily financial aggregations per tenant and industry
CREATE MATERIALIZED VIEW mv_tenant_financial_daily AS
SELECT 
    tenant_id,
    date_trunc('day', created_at) as report_date,
    COUNT(*) as invoice_count,
    SUM(subtotal_amount) as gross_revenue,
    SUM(tax_amount) as total_tax,
    SUM(total_amount) as net_revenue,
    COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_invoices,
    SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END) as collected_revenue,
    AVG(total_amount) as avg_invoice_amount,
    MAX(total_amount) as max_invoice_amount,
    MIN(total_amount) as min_invoice_amount
FROM hs.invoices
WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY tenant_id, date_trunc('day', created_at);

CREATE UNIQUE INDEX ON mv_tenant_financial_daily (tenant_id, report_date);
```

#### 3. Technician Performance Views

```sql
-- Technician productivity and performance metrics
CREATE MATERIALIZED VIEW mv_technician_performance AS
SELECT 
    t.tenant_id,
    u.id as technician_id,
    u.first_name,
    u.last_name,
    COUNT(wo.id) as total_jobs,
    COUNT(CASE WHEN wo.status = 'completed' THEN 1 END) as completed_jobs,
    ROUND(COUNT(CASE WHEN wo.status = 'completed' THEN 1 END)::numeric / 
          NULLIF(COUNT(wo.id), 0) * 100, 2) as completion_rate,
    AVG(EXTRACT(EPOCH FROM (wo.completed_at - wo.started_at))/3600) as avg_job_hours,
    SUM(i.total_amount) as revenue_generated,
    AVG(qc.overall_rating) as avg_quality_rating,
    COUNT(CASE WHEN qc.overall_rating >= 4.5 THEN 1 END) as high_quality_jobs
FROM tenant_mgmt.tenants t
JOIN user_mgmt.users u ON u.tenant_id = t.id
JOIN hs.work_orders wo ON wo.assigned_technician_id = u.id
LEFT JOIN hs.invoices i ON i.work_order_id = wo.id
LEFT JOIN hs.quality_control_inspections qc ON qc.work_order_id = wo.id
WHERE u.role IN ('technician', 'senior_technician', 'field_supervisor')
  AND wo.created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY t.tenant_id, u.id, u.first_name, u.last_name;

CREATE UNIQUE INDEX ON mv_technician_performance (tenant_id, technician_id);
```

#### 4. Service Area Performance Views

```sql
-- Geographic service area analytics
CREATE MATERIALIZED VIEW mv_service_area_metrics AS
SELECT 
    tenant_id,
    service_area_id,
    sa.name as area_name,
    sa.zip_codes,
    COUNT(wo.id) as total_work_orders,
    AVG(wo.travel_time_minutes) as avg_travel_time,
    SUM(i.total_amount) as area_revenue,
    COUNT(DISTINCT c.id) as unique_customers,
    AVG(qc.overall_rating) as avg_quality_rating,
    COUNT(CASE WHEN wo.priority = 'emergency' THEN 1 END) as emergency_calls
FROM hs.service_areas sa
JOIN hs.work_orders wo ON wo.service_area_id = sa.id
LEFT JOIN hs.customers c ON c.id = wo.customer_id
LEFT JOIN hs.invoices i ON i.work_order_id = wo.id
LEFT JOIN hs.quality_control_inspections qc ON qc.work_order_id = wo.id
WHERE wo.created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY tenant_id, service_area_id, sa.name, sa.zip_codes;

CREATE UNIQUE INDEX ON mv_service_area_metrics (tenant_id, service_area_id);
```

### Materialized View Refresh Strategy

#### Concurrent Refresh Schedule

```sql
-- Create pg_cron jobs for automated refresh
SELECT cron.schedule(
    'mv_customer_summary_refresh',
    '*/15 * * * *',  -- Every 15 minutes
    'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_tenant_customer_summary;'
);

SELECT cron.schedule(
    'mv_financial_daily_refresh',
    '0 1 * * *',  -- Daily at 1 AM
    'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_tenant_financial_daily;'
);

SELECT cron.schedule(
    'mv_technician_performance_refresh',
    '0 */4 * * *',  -- Every 4 hours
    'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_technician_performance;'
);

SELECT cron.schedule(
    'mv_service_area_metrics_refresh',
    '0 2 * * *',  -- Daily at 2 AM
    'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_service_area_metrics;'
);
```

#### Smart Refresh Triggers

```sql
-- Function to determine if materialized view refresh is needed
CREATE OR REPLACE FUNCTION check_mv_refresh_needed(
    view_name text,
    threshold_minutes integer DEFAULT 15
) RETURNS boolean AS $$
DECLARE
    last_refresh timestamptz;
    change_count integer;
BEGIN
    -- Get last refresh time from monitoring
    SELECT MAX(refreshed_at) INTO last_refresh
    FROM monitoring.materialized_view_refreshes
    WHERE mv_name = view_name;
    
    -- Count significant changes since last refresh
    CASE view_name
        WHEN 'mv_tenant_customer_summary' THEN
            SELECT COUNT(*) INTO change_count
            FROM hs.customers
            WHERE updated_at > COALESCE(last_refresh, '1970-01-01'::timestamptz);
        -- Add other view-specific logic
    END CASE;
    
    RETURN (
        last_refresh IS NULL OR 
        last_refresh < NOW() - (threshold_minutes || ' minutes')::interval OR
        change_count > 100  -- Threshold for significant changes
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger-based refresh for critical views
CREATE OR REPLACE FUNCTION trigger_mv_refresh()
RETURNS TRIGGER AS $$
BEGIN
    -- Queue refresh job in Redis
    PERFORM pg_notify(
        'mv_refresh_queue',
        json_build_object(
            'view_name', TG_ARGV[0],
            'tenant_id', COALESCE(NEW.tenant_id, OLD.tenant_id),
            'timestamp', NOW()
        )::text
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to key tables
CREATE TRIGGER customers_mv_refresh_trigger
    AFTER INSERT OR UPDATE OR DELETE ON hs.customers
    FOR EACH ROW EXECUTE FUNCTION trigger_mv_refresh('mv_tenant_customer_summary');
```

---

## Redis Caching Architecture

### Redis Cluster Configuration

#### Master Configuration (redis-master.conf)

```conf
# Basic configuration
port 6379
bind 0.0.0.0
protected-mode yes
requirepass ${REDIS_PASSWORD}

# Memory management
maxmemory 8gb
maxmemory-policy volatile-lru
maxmemory-samples 10

# Persistence
save 300 100
save 60 1000
save 10 10000

# Replication
replica-serve-stale-data yes
replica-read-only yes
repl-timeout 60

# Redis Stack modules
loadmodule /opt/redis-stack/lib/redisearch.so
loadmodule /opt/redis-stack/lib/redistimeseries.so
loadmodule /opt/redis-stack/lib/redisjson.so
loadmodule /opt/redis-stack/lib/redisbloom.so

# Cluster configuration
cluster-enabled yes
cluster-config-file nodes.conf
cluster-node-timeout 15000
cluster-announce-hostname redis-master-1.thorbis.internal

# Security
tls-port 6380
tls-cert-file /etc/redis/tls/redis.crt
tls-key-file /etc/redis/tls/redis.key
tls-ca-cert-file /etc/redis/tls/ca.crt
tls-protocols "TLSv1.2 TLSv1.3"

# Monitoring
latency-monitor-threshold 100
slowlog-log-slower-than 10000
slowlog-max-len 1000

# Custom configuration for Thorbis
hash-max-ziplist-entries 512
hash-max-ziplist-value 64
list-max-ziplist-size -2
set-max-intset-entries 512
zset-max-ziplist-entries 128
zset-max-ziplist-value 64
```

### Cache Key Design and Namespace Strategy

#### Hierarchical Key Structure

```typescript
// Cache key namespace design
const CacheKeys = {
  // Tenant-specific prefixes
  tenant: (tenantId: string) => `t:${tenantId}`,
  
  // Industry-specific namespaces
  homeServices: (tenantId: string) => `t:${tenantId}:hs`,
  automotive: (tenantId: string) => `t:${tenantId}:auto`,
  restaurant: (tenantId: string) => `t:${tenantId}:rest`,
  banking: (tenantId: string) => `t:${tenantId}:bank`,
  retail: (tenantId: string) => `t:${tenantId}:ret`,
  courses: (tenantId: string) => `t:${tenantId}:edu`,
  payroll: (tenantId: string) => `t:${tenantId}:pay`,
  
  // Entity-specific keys
  customer: (tenantId: string, customerId: string) => 
    `t:${tenantId}:hs:customer:${customerId}`,
  customerList: (tenantId: string, filters?: string) => 
    `t:${tenantId}:hs:customers:${filters || 'all'}`,
  customerSummary: (tenantId: string, customerId: string) => 
    `t:${tenantId}:hs:customer:${customerId}:summary`,
  
  workOrder: (tenantId: string, workOrderId: string) => 
    `t:${tenantId}:hs:wo:${workOrderId}`,
  workOrderList: (tenantId: string, status?: string, techId?: string) => 
    `t:${tenantId}:hs:wos:${status || 'all'}:${techId || 'all'}`,
  
  // Session and authentication
  session: (sessionId: string) => `session:${sessionId}`,
  userPerms: (userId: string, tenantId: string) => 
    `user:${userId}:perms:${tenantId}`,
  
  // Business intelligence and reports
  report: (tenantId: string, reportType: string, params: string) => 
    `t:${tenantId}:report:${reportType}:${params}`,
  metrics: (tenantId: string, metricType: string, period: string) => 
    `t:${tenantId}:metrics:${metricType}:${period}`,
  
  // Real-time data
  realtime: (tenantId: string, channel: string) => 
    `t:${tenantId}:rt:${channel}`,
  notifications: (userId: string) => `user:${userId}:notifications`,
  
  // ML and AI results
  aiPrediction: (tenantId: string, modelType: string, entityId: string) => 
    `t:${tenantId}:ai:${modelType}:${entityId}`,
  
  // Geographic and location data
  serviceArea: (tenantId: string, areaId: string) => 
    `t:${tenantId}:hs:area:${areaId}`,
  geoIndex: (tenantId: string, bounds: string) => 
    `t:${tenantId}:geo:${bounds}`,
} as const;
```

### Redis Data Structures and Patterns

#### 1. Customer Data Caching

```typescript
// Customer entity caching with JSON
interface CachedCustomer {
  id: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  customerType: 'residential' | 'commercial' | 'industrial';
  accountStatus: 'active' | 'inactive' | 'vip' | 'suspended';
  paymentStatus: 'current' | 'overdue_30' | 'overdue_60' | 'collections';
  totalWorkOrders: number;
  completedOrders: number;
  lifetimeValue: number;
  lastServiceDate: string;
  createdAt: string;
  updatedAt: string;
  version: number; // For optimistic locking
}

// Cache implementation
class CustomerCache {
  private redis: Redis;
  
  async getCustomer(tenantId: string, customerId: string): Promise<CachedCustomer | null> {
    const key = CacheKeys.customer(tenantId, customerId);
    const cached = await this.redis.hgetall(key);
    
    if (Object.keys(cached).length === 0) {
      return null;
    }
    
    return {
      ...cached,
      totalWorkOrders: parseInt(cached.totalWorkOrders),
      completedOrders: parseInt(cached.completedOrders),
      lifetimeValue: parseFloat(cached.lifetimeValue),
      version: parseInt(cached.version),
    } as CachedCustomer;
  }
  
  async setCustomer(customer: CachedCustomer, ttlSeconds = 3600): Promise<void> {
    const key = CacheKeys.customer(customer.tenantId, customer.id);
    const pipeline = this.redis.pipeline();
    
    pipeline.hset(key, {
      ...customer,
      updatedAt: new Date().toISOString(),
      version: customer.version + 1,
    });
    
    pipeline.expire(key, ttlSeconds);
    
    // Add to tenant customer index
    const indexKey = CacheKeys.customerList(customer.tenantId);
    pipeline.zadd(indexKey, Date.now(), customer.id);
    pipeline.expire(indexKey, ttlSeconds);
    
    await pipeline.exec();
  }
  
  async invalidateCustomer(tenantId: string, customerId: string): Promise<void> {
    const keys = [
      CacheKeys.customer(tenantId, customerId),
      CacheKeys.customerSummary(tenantId, customerId),
      CacheKeys.customerList(tenantId),
      CacheKeys.customerList(tenantId, 'active'),
      CacheKeys.customerList(tenantId, 'vip'),
    ];
    
    await this.redis.del(...keys);
    
    // Publish invalidation event
    await this.publishInvalidation('customer', { tenantId, customerId });
  }
}
```

#### 2. Work Order Caching with Sorted Sets

```typescript
// Work order caching with priority and scheduling optimization
class WorkOrderCache {
  private redis: Redis;
  
  async cacheWorkOrdersByStatus(
    tenantId: string,
    status: string,
    workOrders: WorkOrder[],
    ttlSeconds = 1800
  ): Promise<void> {
    const key = CacheKeys.workOrderList(tenantId, status);
    const pipeline = this.redis.pipeline();
    
    // Clear existing entries
    pipeline.del(key);
    
    // Add work orders with priority-based scoring
    for (const wo of workOrders) {
      const score = this.calculateWorkOrderScore(wo);
      pipeline.zadd(key, score, wo.id);
      
      // Cache individual work order
      const woKey = CacheKeys.workOrder(tenantId, wo.id);
      pipeline.hset(woKey, this.serializeWorkOrder(wo));
      pipeline.expire(woKey, ttlSeconds);
    }
    
    pipeline.expire(key, ttlSeconds);
    await pipeline.exec();
  }
  
  private calculateWorkOrderScore(wo: WorkOrder): number {
    // Priority-based scoring for sorted sets
    const priorityScores = {
      'emergency': 1000000,
      'urgent': 100000,
      'high': 10000,
      'standard': 1000,
      'low': 100,
    };
    
    const baseScore = priorityScores[wo.priority] || 1000;
    const timeScore = new Date(wo.scheduledDate).getTime() / 1000;
    
    return baseScore + timeScore;
  }
  
  async getHighPriorityWorkOrders(
    tenantId: string,
    limit = 50
  ): Promise<WorkOrder[]> {
    const keys = [
      CacheKeys.workOrderList(tenantId, 'emergency'),
      CacheKeys.workOrderList(tenantId, 'urgent'),
      CacheKeys.workOrderList(tenantId, 'scheduled'),
    ];
    
    const pipeline = this.redis.pipeline();
    keys.forEach(key => pipeline.zrevrange(key, 0, limit, 'WITHSCORES'));
    
    const results = await pipeline.exec();
    const workOrderIds: string[] = [];
    
    results?.forEach(([err, result]) => {
      if (!err && Array.isArray(result)) {
        for (let i = 0; i < result.length; i += 2) {
          workOrderIds.push(result[i]);
        }
      }
    });
    
    return this.getWorkOrdersByIds(tenantId, workOrderIds);
  }
}
```

#### 3. Session and Authentication Caching

```typescript
// High-performance session management with Redis
class SessionCache {
  private redis: Redis;
  
  async createSession(
    userId: string,
    tenantId: string,
    sessionData: SessionData,
    ttlSeconds = 7200 // 2 hours
  ): Promise<string> {
    const sessionId = uuidv4();
    const sessionKey = CacheKeys.session(sessionId);
    
    const session = {
      id: sessionId,
      userId,
      tenantId,
      ...sessionData,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
    };
    
    const pipeline = this.redis.pipeline();
    
    // Store session data
    pipeline.hset(sessionKey, session);
    pipeline.expire(sessionKey, ttlSeconds);
    
    // Add to user sessions index
    const userSessionsKey = `user:${userId}:sessions`;
    pipeline.sadd(userSessionsKey, sessionId);
    pipeline.expire(userSessionsKey, ttlSeconds);
    
    // Add to tenant active sessions
    const tenantSessionsKey = `t:${tenantId}:active_sessions`;
    pipeline.zadd(tenantSessionsKey, Date.now(), sessionId);
    pipeline.expire(tenantSessionsKey, ttlSeconds);
    
    await pipeline.exec();
    return sessionId;
  }
  
  async getSession(sessionId: string): Promise<SessionData | null> {
    const sessionKey = CacheKeys.session(sessionId);
    const sessionData = await this.redis.hgetall(sessionKey);
    
    if (Object.keys(sessionData).length === 0) {
      return null;
    }
    
    // Update last activity
    await this.redis.hset(sessionKey, 'lastActivity', new Date().toISOString());
    
    return sessionData as SessionData;
  }
  
  async invalidateUserSessions(userId: string): Promise<void> {
    const userSessionsKey = `user:${userId}:sessions`;
    const sessionIds = await this.redis.smembers(userSessionsKey);
    
    if (sessionIds.length > 0) {
      const keys = sessionIds.map(id => CacheKeys.session(id));
      await this.redis.del(...keys, userSessionsKey);
    }
    
    // Publish session invalidation event
    await this.publishInvalidation('user_sessions', { userId });
  }
}
```

#### 4. Real-time Data Caching with Redis Streams

```typescript
// Real-time data streaming and caching
class RealTimeCache {
  private redis: Redis;
  
  async publishWorkOrderUpdate(
    tenantId: string,
    workOrderId: string,
    update: WorkOrderUpdate
  ): Promise<void> {
    const streamKey = CacheKeys.realtime(tenantId, 'work_orders');
    
    await this.redis.xadd(
      streamKey,
      '*', // Auto-generate ID
      'event', 'work_order_update',
      'workOrderId', workOrderId,
      'data', JSON.stringify(update),
      'timestamp', Date.now(),
    );
    
    // Trim stream to last 1000 entries
    await this.redis.xtrim(streamKey, 'MAXLEN', '~', 1000);
  }
  
  async subscribeToRealTimeUpdates(
    tenantId: string,
    channels: string[],
    callback: (event: RealTimeEvent) => void
  ): Promise<void> {
    const streamKeys = channels.map(channel => 
      CacheKeys.realtime(tenantId, channel)
    );
    
    // Consumer group for reliable delivery
    const groupName = `tenant_${tenantId}_consumers`;
    const consumerName = `consumer_${uuidv4()}`;
    
    // Create consumer groups if they don't exist
    for (const streamKey of streamKeys) {
      try {
        await this.redis.xgroup('CREATE', streamKey, groupName, '$', 'MKSTREAM');
      } catch (err) {
        // Group already exists
      }
    }
    
    // Start consuming
    while (true) {
      try {
        const results = await this.redis.xreadgroup(
          'GROUP', groupName, consumerName,
          'COUNT', 10,
          'BLOCK', 1000,
          'STREAMS', ...streamKeys, ...streamKeys.map(() => '>')
        );
        
        if (results) {
          for (const [stream, messages] of results) {
            for (const [id, fields] of messages) {
              const event: RealTimeEvent = {
                id,
                stream,
                data: this.parseStreamFields(fields),
                timestamp: Date.now(),
              };
              
              callback(event);
              
              // Acknowledge message
              await this.redis.xack(stream, groupName, id);
            }
          }
        }
      } catch (error) {
        console.error('Real-time stream error:', error);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }
}
```

### Cache Compression and Serialization

#### Protocol Buffers Implementation

```typescript
// Define Protocol Buffer schema for efficient serialization
// customer.proto
syntax = "proto3";

message Customer {
  string id = 1;
  string tenant_id = 2;
  string first_name = 3;
  string last_name = 4;
  string email = 5;
  string phone = 6;
  string customer_type = 7;
  string account_status = 8;
  string payment_status = 9;
  int32 total_work_orders = 10;
  int32 completed_orders = 11;
  double lifetime_value = 12;
  int64 last_service_date = 13;
  int64 created_at = 14;
  int64 updated_at = 15;
  int32 version = 16;
}

// TypeScript implementation
class ProtoBufCache {
  private redis: Redis;
  
  async setCustomerProtoBuf(customer: Customer): Promise<void> {
    const key = CacheKeys.customer(customer.tenantId, customer.id);
    
    // Serialize to Protocol Buffer
    const message = CustomerProto.create(customer);
    const buffer = CustomerProto.encode(message).finish();
    
    // Compress with gzip
    const compressed = await gzip(buffer);
    
    await this.redis.setex(key, 3600, compressed);
  }
  
  async getCustomerProtoBuf(tenantId: string, customerId: string): Promise<Customer | null> {
    const key = CacheKeys.customer(tenantId, customerId);
    const compressed = await this.redis.getBuffer(key);
    
    if (!compressed) return null;
    
    try {
      // Decompress
      const buffer = await gunzip(compressed);
      
      // Deserialize from Protocol Buffer
      const message = CustomerProto.decode(buffer);
      return CustomerProto.toObject(message) as Customer;
    } catch (error) {
      console.error('Proto deserialization error:', error);
      await this.redis.del(key); // Remove corrupted data
      return null;
    }
  }
}
```

---

## Multi-Tenant Cache Isolation

### Security Architecture

#### Tenant-Based Key Isolation

```typescript
class TenantCacheManager {
  private redis: Redis;
  private encryptionKey: string;
  
  constructor(redis: Redis, encryptionKey: string) {
    this.redis = redis;
    this.encryptionKey = encryptionKey;
  }
  
  // Generate tenant-specific encryption key
  private getTenantKey(tenantId: string): string {
    return crypto
      .createHmac('sha256', this.encryptionKey)
      .update(`tenant:${tenantId}`)
      .digest('hex')
      .substring(0, 32);
  }
  
  // Encrypt sensitive data before caching
  private encryptData(data: string, tenantId: string): string {
    const tenantKey = this.getTenantKey(tenantId);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipherGCM('aes-256-gcm', tenantKey, iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  }
  
  // Decrypt data when retrieving from cache
  private decryptData(encryptedData: string, tenantId: string): string {
    const tenantKey = this.getTenantKey(tenantId);
    const [ivHex, authTagHex, encrypted] = encryptedData.split(':');
    
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipherGCM('aes-256-gcm', tenantKey, iv);
    
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
  
  async setSensitiveData(
    tenantId: string,
    key: string,
    data: any,
    ttlSeconds = 3600
  ): Promise<void> {
    const fullKey = CacheKeys.tenant(tenantId) + ':' + key;
    const serializedData = JSON.stringify(data);
    const encryptedData = this.encryptData(serializedData, tenantId);
    
    await this.redis.setex(fullKey, ttlSeconds, encryptedData);
  }
  
  async getSensitiveData<T>(tenantId: string, key: string): Promise<T | null> {
    const fullKey = CacheKeys.tenant(tenantId) + ':' + key;
    const encryptedData = await this.redis.get(fullKey);
    
    if (!encryptedData) return null;
    
    try {
      const decryptedData = this.decryptData(encryptedData, tenantId);
      return JSON.parse(decryptedData) as T;
    } catch (error) {
      console.error('Decryption error:', error);
      await this.redis.del(fullKey); // Remove corrupted data
      return null;
    }
  }
}
```

#### Access Control and Permission Caching

```typescript
class PermissionCache {
  private redis: Redis;
  
  async cacheUserPermissions(
    userId: string,
    tenantId: string,
    permissions: UserPermissions,
    ttlSeconds = 1800
  ): Promise<void> {
    const key = CacheKeys.userPerms(userId, tenantId);
    
    // Create permission bitmap for efficient storage
    const permissionBits = this.createPermissionBitmap(permissions);
    
    const cacheData = {
      userId,
      tenantId,
      permissions: permissionBits,
      roles: permissions.roles,
      schemas: permissions.schemas,
      cachedAt: Date.now(),
    };
    
    await this.redis.setex(key, ttlSeconds, JSON.stringify(cacheData));
  }
  
  async getUserPermissions(
    userId: string,
    tenantId: string
  ): Promise<UserPermissions | null> {
    const key = CacheKeys.userPerms(userId, tenantId);
    const cached = await this.redis.get(key);
    
    if (!cached) return null;
    
    const cacheData = JSON.parse(cached);
    const permissions = this.parsePermissionBitmap(cacheData.permissions);
    
    return {
      userId,
      tenantId,
      permissions,
      roles: cacheData.roles,
      schemas: cacheData.schemas,
    };
  }
  
  private createPermissionBitmap(permissions: UserPermissions): string {
    // Convert permissions to efficient bitmap representation
    const permissionMap = new Map([
      ['read_customers', 0],
      ['write_customers', 1],
      ['read_work_orders', 2],
      ['write_work_orders', 3],
      ['read_invoices', 4],
      ['write_invoices', 5],
      ['admin_access', 6],
      // ... more permissions
    ]);
    
    let bitmap = 0;
    for (const [perm, bit] of permissionMap) {
      if (permissions.permissions.includes(perm)) {
        bitmap |= (1 << bit);
      }
    }
    
    return bitmap.toString(2);
  }
  
  async invalidateUserPermissions(userId: string, tenantId?: string): Promise<void> {
    if (tenantId) {
      await this.redis.del(CacheKeys.userPerms(userId, tenantId));
    } else {
      // Invalidate across all tenants
      const pattern = `user:${userId}:perms:*`;
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    }
  }
}
```

---

## Industry-Specific Caching Patterns

### Home Services Caching

```typescript
class HomeServicesCaching {
  private redis: Redis;
  
  // Cache technician schedules with geographic optimization
  async cacheTechnicianSchedule(
    tenantId: string,
    technicianId: string,
    date: string,
    schedule: TechnicianSchedule
  ): Promise<void> {
    const key = `t:${tenantId}:hs:tech:${technicianId}:schedule:${date}`;
    
    // Include geographic data for route optimization
    const cacheData = {
      ...schedule,
      geoPoints: schedule.appointments.map(apt => ({
        workOrderId: apt.workOrderId,
        lat: apt.location.latitude,
        lng: apt.location.longitude,
        estimatedDuration: apt.estimatedDuration,
      })),
      routeOptimized: true,
      lastOptimized: Date.now(),
    };
    
    await this.redis.setex(key, 7200, JSON.stringify(cacheData)); // 2 hours
    
    // Cache in geographic index for area-based queries
    const geoKey = `t:${tenantId}:hs:geo:schedule:${date}`;
    for (const point of cacheData.geoPoints) {
      await this.redis.geoadd(
        geoKey,
        point.lng,
        point.lat,
        `${technicianId}:${point.workOrderId}`
      );
    }
    await this.redis.expire(geoKey, 7200);
  }
  
  // Cache customer service history with predictive insights
  async cacheCustomerServiceHistory(
    tenantId: string,
    customerId: string,
    history: ServiceHistory
  ): Promise<void> {
    const key = `t:${tenantId}:hs:customer:${customerId}:history`;
    
    // Include AI-powered insights
    const enrichedHistory = {
      ...history,
      predictedNextService: await this.predictNextService(history),
      riskFactors: await this.analyzeRiskFactors(history),
      upsellOpportunities: await this.identifyUpsellOpportunities(history),
      cachedAt: Date.now(),
    };
    
    await this.redis.setex(key, 3600, JSON.stringify(enrichedHistory));
    
    // Cache in time-series format for trending analysis
    const timeSeriesKey = `t:${tenantId}:hs:customer:${customerId}:ts`;
    for (const service of history.services) {
      await this.redis.zadd(
        timeSeriesKey,
        new Date(service.completedAt).getTime(),
        JSON.stringify({
          serviceType: service.type,
          amount: service.amount,
          satisfaction: service.customerRating,
        })
      );
    }
    await this.redis.expire(timeSeriesKey, 86400); // 24 hours
  }
  
  // Cache service area performance metrics
  async cacheServiceAreaMetrics(
    tenantId: string,
    areaId: string,
    metrics: ServiceAreaMetrics
  ): Promise<void> {
    const key = CacheKeys.serviceArea(tenantId, areaId);
    
    const enrichedMetrics = {
      ...metrics,
      efficiency: this.calculateAreaEfficiency(metrics),
      recommendations: await this.generateAreaRecommendations(metrics),
      lastUpdated: Date.now(),
    };
    
    // Store as hash for partial updates
    await this.redis.hset(key, enrichedMetrics);
    await this.redis.expire(key, 1800); // 30 minutes
    
    // Update geographic bounds cache
    const boundsKey = CacheKeys.geoIndex(tenantId, areaId);
    await this.redis.geoadd(
      boundsKey,
      metrics.centerLongitude,
      metrics.centerLatitude,
      `area:${areaId}`
    );
  }
}
```

### Automotive Services Caching

```typescript
class AutomotiveCaching {
  private redis: Redis;
  
  // Cache vehicle service records with predictive maintenance
  async cacheVehicleHistory(
    tenantId: string,
    vin: string,
    history: VehicleServiceHistory
  ): Promise<void> {
    const key = `t:${tenantId}:auto:vehicle:${vin}:history`;
    
    const enrichedHistory = {
      ...history,
      maintenanceSchedule: await this.generateMaintenanceSchedule(history),
      predictedIssues: await this.predictVehicleIssues(history),
      partsLifeExpectancy: await this.calculatePartsLifespan(history),
      cachedAt: Date.now(),
    };
    
    await this.redis.setex(key, 7200, JSON.stringify(enrichedHistory));
    
    // Cache by make/model for pattern analysis
    const makeModelKey = `t:${tenantId}:auto:patterns:${history.make}:${history.model}`;
    await this.redis.sadd(makeModelKey, vin);
    await this.redis.expire(makeModelKey, 86400);
  }
  
  // Cache parts inventory with demand forecasting
  async cachePartsInventory(
    tenantId: string,
    inventory: PartsInventory
  ): Promise<void> {
    const baseKey = `t:${tenantId}:auto:inventory`;
    
    for (const part of inventory.parts) {
      const partKey = `${baseKey}:${part.partNumber}`;
      
      const enrichedPart = {
        ...part,
        demandForecast: await this.forecastPartDemand(tenantId, part),
        reorderPoint: await this.calculateReorderPoint(tenantId, part),
        alternativeParts: await this.findAlternativeParts(part),
        lastUpdated: Date.now(),
      };
      
      await this.redis.hset(partKey, enrichedPart);
      await this.redis.expire(partKey, 1800);
      
      // Cache in sorted set by stock level for low inventory alerts
      await this.redis.zadd(
        `${baseKey}:by_stock`,
        part.currentStock,
        part.partNumber
      );
    }
  }
  
  // Cache labor rates and time estimates
  async cacheLaborEstimates(
    tenantId: string,
    serviceType: string,
    estimates: LaborEstimates
  ): Promise<void> {
    const key = `t:${tenantId}:auto:labor:${serviceType}`;
    
    const enrichedEstimates = {
      ...estimates,
      seasonalAdjustments: await this.calculateSeasonalAdjustments(estimates),
      competitiveAnalysis: await this.getCompetitiveRates(serviceType),
      profitabilityMetrics: this.calculateProfitability(estimates),
      lastUpdated: Date.now(),
    };
    
    await this.redis.setex(key, 3600, JSON.stringify(enrichedEstimates));
  }
}
```

### Restaurant Services Caching

```typescript
class RestaurantCaching {
  private redis: Redis;
  
  // Cache menu items with dynamic pricing
  async cacheMenu(
    tenantId: string,
    locationId: string,
    menu: RestaurantMenu
  ): Promise<void> {
    const key = `t:${tenantId}:rest:menu:${locationId}`;
    
    const enrichedMenu = {
      ...menu,
      dynamicPricing: await this.calculateDynamicPricing(menu),
      popularityScores: await this.calculatePopularityScores(tenantId, menu),
      profitabilityRanking: this.rankByProfitability(menu),
      lastUpdated: Date.now(),
    };
    
    await this.redis.setex(key, 1800, JSON.stringify(enrichedMenu));
    
    // Cache individual items for quick lookup
    for (const item of menu.items) {
      const itemKey = `t:${tenantId}:rest:item:${item.id}`;
      await this.redis.setex(itemKey, 1800, JSON.stringify(item));
      
      // Cache by category for category-based queries
      const categoryKey = `t:${tenantId}:rest:category:${item.category}`;
      await this.redis.sadd(categoryKey, item.id);
      await this.redis.expire(categoryKey, 1800);
    }
  }
  
  // Cache table availability with real-time updates
  async cacheTableAvailability(
    tenantId: string,
    locationId: string,
    date: string,
    availability: TableAvailability
  ): Promise<void> {
    const key = `t:${tenantId}:rest:tables:${locationId}:${date}`;
    
    // Use Redis hash for efficient partial updates
    for (const table of availability.tables) {
      const tableData = {
        id: table.id,
        capacity: table.capacity,
        status: table.status,
        reservations: JSON.stringify(table.reservations),
        availability: JSON.stringify(table.availableSlots),
      };
      
      await this.redis.hset(`${key}:${table.id}`, tableData);
      await this.redis.expire(`${key}:${table.id}`, 7200);
    }
    
    // Cache availability summary for quick queries
    const summaryKey = `${key}:summary`;
    const summary = {
      totalTables: availability.tables.length,
      availableTables: availability.tables.filter(t => t.status === 'available').length,
      totalCapacity: availability.tables.reduce((sum, t) => sum + t.capacity, 0),
      peakHours: this.identifyPeakHours(availability),
      lastUpdated: Date.now(),
    };
    
    await this.redis.setex(summaryKey, 1800, JSON.stringify(summary));
  }
  
  // Cache kitchen display system data
  async cacheKitchenOrders(
    tenantId: string,
    locationId: string,
    orders: KitchenOrder[]
  ): Promise<void> {
    const baseKey = `t:${tenantId}:rest:kitchen:${locationId}`;
    
    // Clear existing orders
    const existingKeys = await this.redis.keys(`${baseKey}:order:*`);
    if (existingKeys.length > 0) {
      await this.redis.del(...existingKeys);
    }
    
    // Cache orders by station and priority
    const stations = new Map<string, KitchenOrder[]>();
    
    for (const order of orders) {
      const orderKey = `${baseKey}:order:${order.id}`;
      await this.redis.setex(orderKey, 3600, JSON.stringify(order));
      
      // Group by kitchen station
      for (const item of order.items) {
        const station = item.kitchenStation || 'general';
        if (!stations.has(station)) {
          stations.set(station, []);
        }
        stations.get(station)!.push(order);
      }
    }
    
    // Cache by station with priority ordering
    for (const [station, stationOrders] of stations) {
      const stationKey = `${baseKey}:station:${station}`;
      
      // Clear existing station orders
      await this.redis.del(stationKey);
      
      // Add orders with priority-based scoring
      for (const order of stationOrders) {
        const score = this.calculateOrderPriority(order);
        await this.redis.zadd(stationKey, score, order.id);
      }
      
      await this.redis.expire(stationKey, 1800);
    }
  }
}
```

---

## Cache Invalidation and Dependency Management

### Dependency Graph Implementation

```typescript
interface CacheDependency {
  key: string;
  dependencies: string[];
  dependents: string[];
  tags: string[];
  ttl: number;
  priority: number;
}

class CacheDependencyManager {
  private redis: Redis;
  private dependencyGraph = new Map<string, CacheDependency>();
  
  constructor(redis: Redis) {
    this.redis = redis;
    this.initializeDependencyTracking();
  }
  
  // Register cache key with its dependencies
  async registerDependency(
    key: string,
    dependencies: string[] = [],
    tags: string[] = [],
    ttl = 3600,
    priority = 1
  ): Promise<void> {
    const dependency: CacheDependency = {
      key,
      dependencies,
      dependents: [],
      tags,
      ttl,
      priority,
    };
    
    // Store in Redis for persistence
    const depKey = `cache:dep:${key}`;
    await this.redis.setex(depKey, ttl + 3600, JSON.stringify(dependency));
    
    // Update dependency graph
    this.dependencyGraph.set(key, dependency);
    
    // Register reverse dependencies
    for (const dep of dependencies) {
      await this.addDependent(dep, key);
    }
  }
  
  // Add dependent relationship
  private async addDependent(dependencyKey: string, dependentKey: string): Promise<void> {
    const depKey = `cache:dep:${dependencyKey}`;
    const existing = await this.redis.get(depKey);
    
    if (existing) {
      const dependency = JSON.parse(existing) as CacheDependency;
      if (!dependency.dependents.includes(dependentKey)) {
        dependency.dependents.push(dependentKey);
        await this.redis.setex(depKey, dependency.ttl + 3600, JSON.stringify(dependency));
        this.dependencyGraph.set(dependencyKey, dependency);
      }
    }
  }
  
  // Invalidate cache key and all its dependents
  async invalidate(
    key: string,
    options: {
      cascading?: boolean;
      async?: boolean;
      reason?: string;
    } = { cascading: true, async: true }
  ): Promise<void> {
    const invalidationId = uuidv4();
    const startTime = Date.now();
    
    try {
      if (options.async) {
        // Queue invalidation for background processing
        await this.queueInvalidation(key, options, invalidationId);
      } else {
        await this.performInvalidation(key, options, invalidationId);
      }
      
      // Log invalidation event
      await this.logInvalidation(key, options, invalidationId, Date.now() - startTime);
    } catch (error) {
      console.error(`Cache invalidation failed for key ${key}:`, error);
      await this.logInvalidationError(key, options, invalidationId, error);
    }
  }
  
  // Perform actual cache invalidation
  private async performInvalidation(
    key: string,
    options: any,
    invalidationId: string,
    visited = new Set<string>()
  ): Promise<void> {
    if (visited.has(key)) return; // Prevent cycles
    visited.add(key);
    
    // Delete the cache key
    await this.redis.del(key);
    
    // Get dependency information
    const depKey = `cache:dep:${key}`;
    const dependencyData = await this.redis.get(depKey);
    
    if (!dependencyData || !options.cascading) return;
    
    const dependency = JSON.parse(dependencyData) as CacheDependency;
    
    // Invalidate all dependents
    const pipeline = this.redis.pipeline();
    for (const dependent of dependency.dependents) {
      pipeline.del(dependent);
      
      // Recursive invalidation for cascading
      if (options.cascading) {
        await this.performInvalidation(dependent, options, invalidationId, visited);
      }
    }
    
    await pipeline.exec();
    
    // Publish invalidation event
    await this.publishInvalidationEvent(key, dependency.dependents, invalidationId);
  }
  
  // Queue invalidation for background processing
  private async queueInvalidation(
    key: string,
    options: any,
    invalidationId: string
  ): Promise<void> {
    const job = {
      id: invalidationId,
      key,
      options,
      queuedAt: Date.now(),
      attempts: 0,
      maxAttempts: 3,
    };
    
    await this.redis.lpush('cache:invalidation:queue', JSON.stringify(job));
  }
  
  // Process invalidation queue
  async processInvalidationQueue(): Promise<void> {
    while (true) {
      try {
        const jobData = await this.redis.brpop('cache:invalidation:queue', 10);
        
        if (!jobData) continue;
        
        const job = JSON.parse(jobData[1]);
        
        try {
          await this.performInvalidation(job.key, job.options, job.id);
        } catch (error) {
          job.attempts++;
          
          if (job.attempts < job.maxAttempts) {
            // Re-queue with exponential backoff
            setTimeout(async () => {
              await this.redis.lpush('cache:invalidation:queue', JSON.stringify(job));
            }, Math.pow(2, job.attempts) * 1000);
          } else {
            await this.logInvalidationError(job.key, job.options, job.id, error);
          }
        }
      } catch (error) {
        console.error('Invalidation queue processing error:', error);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }
  
  // Tag-based invalidation
  async invalidateByTags(tags: string[]): Promise<void> {
    const keysToInvalidate = new Set<string>();
    
    // Find all cache keys with matching tags
    const pattern = 'cache:dep:*';
    const keys = await this.redis.keys(pattern);
    
    for (const key of keys) {
      const depData = await this.redis.get(key);
      if (depData) {
        const dependency = JSON.parse(depData) as CacheDependency;
        const hasMatchingTag = tags.some(tag => dependency.tags.includes(tag));
        
        if (hasMatchingTag) {
          keysToInvalidate.add(dependency.key);
        }
      }
    }
    
    // Invalidate all matching keys
    for (const key of keysToInvalidate) {
      await this.invalidate(key, { cascading: true, async: true, reason: `tag_invalidation:${tags.join(',')}` });
    }
  }
  
  // Smart invalidation based on database events
  async handleDatabaseEvent(event: DatabaseEvent): Promise<void> {
    const { table, operation, tenantId, entityId } = event;
    
    // Define invalidation patterns based on table and operation
    const invalidationPatterns = this.getInvalidationPatterns(table, operation);
    
    for (const pattern of invalidationPatterns) {
      const keys = this.generateKeysFromPattern(pattern, tenantId, entityId);
      
      for (const key of keys) {
        await this.invalidate(key, {
          cascading: true,
          async: true,
          reason: `database_event:${table}:${operation}`,
        });
      }
    }
  }
  
  private getInvalidationPatterns(table: string, operation: string): string[] {
    const patterns: Record<string, string[]> = {
      'hs.customers': [
        't:{tenantId}:hs:customer:{entityId}',
        't:{tenantId}:hs:customers:*',
        't:{tenantId}:report:*',
      ],
      'hs.work_orders': [
        't:{tenantId}:hs:wo:{entityId}',
        't:{tenantId}:hs:wos:*',
        't:{tenantId}:hs:tech:*:schedule:*',
        't:{tenantId}:metrics:*',
      ],
      'hs.invoices': [
        't:{tenantId}:hs:invoice:{entityId}',
        't:{tenantId}:hs:customer:*:summary',
        't:{tenantId}:report:financial:*',
        't:{tenantId}:metrics:revenue:*',
      ],
    };
    
    return patterns[table] || [];
  }
  
  private generateKeysFromPattern(pattern: string, tenantId: string, entityId: string): string[] {
    if (pattern.includes('*')) {
      // Handle wildcard patterns
      const basePattern = pattern.replace(/\{tenantId\}/g, tenantId).replace(/\{entityId\}/g, entityId);
      return this.expandWildcardPattern(basePattern);
    } else {
      // Direct key substitution
      return [pattern.replace(/\{tenantId\}/g, tenantId).replace(/\{entityId\}/g, entityId)];
    }
  }
  
  private async expandWildcardPattern(pattern: string): Promise<string[]> {
    return await this.redis.keys(pattern);
  }
}
```

### Event-Driven Invalidation System

```typescript
class CacheEventSystem {
  private redis: Redis;
  private pubsub: Redis;
  private dependencyManager: CacheDependencyManager;
  
  constructor(redis: Redis, dependencyManager: CacheDependencyManager) {
    this.redis = redis;
    this.pubsub = redis.duplicate();
    this.dependencyManager = dependencyManager;
    this.setupEventHandlers();
  }
  
  private setupEventHandlers(): void {
    // Listen for database notifications
    this.pubsub.subscribe('db_changes');
    this.pubsub.on('message', async (channel, message) => {
      if (channel === 'db_changes') {
        const event = JSON.parse(message) as DatabaseEvent;
        await this.handleDatabaseChange(event);
      }
    });
    
    // Listen for application-level cache events
    this.pubsub.subscribe('cache_events');
    this.pubsub.on('message', async (channel, message) => {
      if (channel === 'cache_events') {
        const event = JSON.parse(message) as CacheEvent;
        await this.handleCacheEvent(event);
      }
    });
  }
  
  private async handleDatabaseChange(event: DatabaseEvent): Promise<void> {
    // Intelligent invalidation based on the type of change
    switch (event.table) {
      case 'hs.customers':
        await this.invalidateCustomerCache(event);
        break;
      case 'hs.work_orders':
        await this.invalidateWorkOrderCache(event);
        break;
      case 'hs.invoices':
        await this.invalidateInvoiceCache(event);
        break;
      default:
        await this.genericInvalidation(event);
    }
  }
  
  private async invalidateCustomerCache(event: DatabaseEvent): Promise<void> {
    const { tenantId, entityId, operation, oldData, newData } = event;
    
    // Always invalidate the specific customer
    await this.dependencyManager.invalidate(
      CacheKeys.customer(tenantId, entityId),
      { cascading: true, async: true, reason: `customer_${operation}` }
    );
    
    // Conditional invalidation based on what changed
    if (operation === 'UPDATE' && oldData && newData) {
      // Check if significant fields changed
      const significantFields = ['account_status', 'payment_status', 'customer_type'];
      const hasSignificantChange = significantFields.some(
        field => oldData[field] !== newData[field]
      );
      
      if (hasSignificantChange) {
        // Invalidate customer lists and reports
        await this.dependencyManager.invalidateByTags([
          `tenant:${tenantId}`,
          'customer_list',
          'customer_reports',
        ]);
      }
    } else if (operation === 'INSERT' || operation === 'DELETE') {
      // New or deleted customer affects aggregations
      await this.dependencyManager.invalidateByTags([
        `tenant:${tenantId}`,
        'customer_aggregations',
        'dashboard_metrics',
      ]);
    }
  }
  
  private async invalidateWorkOrderCache(event: DatabaseEvent): Promise<void> {
    const { tenantId, entityId, operation, newData } = event;
    
    // Invalidate specific work order
    await this.dependencyManager.invalidate(
      CacheKeys.workOrder(tenantId, entityId),
      { cascading: true, async: true, reason: `work_order_${operation}` }
    );
    
    // Invalidate technician schedules if assigned technician changed
    if (newData?.assigned_technician_id) {
      const scheduleDate = new Date(newData.scheduled_date).toISOString().split('T')[0];
      await this.dependencyManager.invalidate(
        `t:${tenantId}:hs:tech:${newData.assigned_technician_id}:schedule:${scheduleDate}`,
        { cascading: true, async: true }
      );
    }
    
    // Invalidate customer data if work order affects customer metrics
    if (newData?.customer_id) {
      await this.dependencyManager.invalidate(
        CacheKeys.customerSummary(tenantId, newData.customer_id),
        { cascading: false, async: true }
      );
    }
  }
  
  // Publish cache invalidation events for other services
  async publishInvalidationEvent(
    key: string,
    dependents: string[],
    invalidationId: string
  ): Promise<void> {
    const event = {
      type: 'cache_invalidation',
      key,
      dependents,
      invalidationId,
      timestamp: Date.now(),
      source: 'cache_dependency_manager',
    };
    
    await this.pubsub.publish('cache_events', JSON.stringify(event));
  }
  
  // Real-time cache warming based on access patterns
  async warmCache(tenantId: string, patterns: string[]): Promise<void> {
    for (const pattern of patterns) {
      try {
        await this.warmCachePattern(tenantId, pattern);
      } catch (error) {
        console.error(`Cache warming failed for pattern ${pattern}:`, error);
      }
    }
  }
  
  private async warmCachePattern(tenantId: string, pattern: string): Promise<void> {
    switch (pattern) {
      case 'customer_summaries':
        await this.warmCustomerSummaries(tenantId);
        break;
      case 'active_work_orders':
        await this.warmActiveWorkOrders(tenantId);
        break;
      case 'technician_schedules':
        await this.warmTechnicianSchedules(tenantId);
        break;
      default:
        console.warn(`Unknown warming pattern: ${pattern}`);
    }
  }
  
  private async warmCustomerSummaries(tenantId: string): Promise<void> {
    // Get frequently accessed customers
    const customerIds = await this.getFrequentlyAccessedCustomers(tenantId);
    
    for (const customerId of customerIds) {
      // Pre-load customer summary if not cached
      const key = CacheKeys.customerSummary(tenantId, customerId);
      const exists = await this.redis.exists(key);
      
      if (!exists) {
        // Trigger background loading
        await this.redis.lpush(
          'cache:warming:queue',
          JSON.stringify({
            type: 'customer_summary',
            tenantId,
            customerId,
            priority: 1,
          })
        );
      }
    }
  }
}
```

---

## Performance Monitoring and Analytics

### Cache Performance Metrics

```typescript
class CachePerformanceMonitor {
  private redis: Redis;
  private metricsCollector: MetricsCollector;
  
  constructor(redis: Redis, metricsCollector: MetricsCollector) {
    this.redis = redis;
    this.metricsCollector = metricsCollector;
    this.startMetricsCollection();
  }
  
  // Instrument cache operations with performance tracking
  async instrumentedGet<T>(
    key: string,
    fallbackFunction?: () => Promise<T>,
    ttl = 3600
  ): Promise<T | null> {
    const startTime = Date.now();
    const operation = 'GET';
    
    try {
      // Attempt cache retrieval
      const cached = await this.redis.get(key);
      const duration = Date.now() - startTime;
      
      if (cached) {
        // Cache hit
        await this.recordMetric('cache_hit', {
          key,
          operation,
          duration,
          size: Buffer.byteLength(cached, 'utf8'),
        });
        
        return JSON.parse(cached) as T;
      } else {
        // Cache miss
        await this.recordMetric('cache_miss', {
          key,
          operation,
          duration,
        });
        
        if (fallbackFunction) {
          // Execute fallback and cache result
          const fallbackStart = Date.now();
          const result = await fallbackFunction();
          const fallbackDuration = Date.now() - fallbackStart;
          
          // Cache the result
          await this.instrumentedSet(key, result, ttl);
          
          await this.recordMetric('fallback_execution', {
            key,
            duration: fallbackDuration,
            size: Buffer.byteLength(JSON.stringify(result), 'utf8'),
          });
          
          return result;
        }
        
        return null;
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      
      await this.recordMetric('cache_error', {
        key,
        operation,
        duration,
        error: error.message,
      });
      
      throw error;
    }
  }
  
  async instrumentedSet(key: string, value: any, ttl = 3600): Promise<void> {
    const startTime = Date.now();
    const operation = 'SET';
    const serialized = JSON.stringify(value);
    
    try {
      await this.redis.setex(key, ttl, serialized);
      const duration = Date.now() - startTime;
      
      await this.recordMetric('cache_set', {
        key,
        operation,
        duration,
        size: Buffer.byteLength(serialized, 'utf8'),
        ttl,
      });
      
      // Register cache dependency
      await this.registerCacheAccess(key);
    } catch (error) {
      const duration = Date.now() - startTime;
      
      await this.recordMetric('cache_error', {
        key,
        operation,
        duration,
        error: error.message,
      });
      
      throw error;
    }
  }
  
  // Track cache access patterns
  private async registerCacheAccess(key: string): Promise<void> {
    const accessKey = `cache:access:${key}`;
    const timestamp = Date.now();
    
    // Track access frequency
    await this.redis.zincrby('cache:access_frequency', 1, key);
    
    // Track access timeline
    await this.redis.zadd(accessKey, timestamp, timestamp);
    
    // Keep only last 100 accesses
    await this.redis.zremrangebyrank(accessKey, 0, -101);
    await this.redis.expire(accessKey, 86400); // 24 hours
  }
  
  // Calculate cache hit ratio
  async getCacheHitRatio(timeWindow = 3600): Promise<number> {
    const endTime = Date.now();
    const startTime = endTime - (timeWindow * 1000);
    
    const hits = await this.redis.zcount('cache:metrics:hits', startTime, endTime);
    const misses = await this.redis.zcount('cache:metrics:misses', startTime, endTime);
    const total = hits + misses;
    
    if (total === 0) return 0;
    return (hits / total) * 100;
  }
  
  // Get cache performance statistics
  async getCacheStatistics(): Promise<CacheStatistics> {
    const pipeline = this.redis.pipeline();
    
    // Current memory usage
    pipeline.memory('usage', 'cache:*');
    
    // Key count by pattern
    pipeline.eval(`
      local keys = redis.call('keys', 'cache:*')
      local patterns = {}
      for _, key in ipairs(keys) do
        local pattern = string.match(key, '^([^:]*:[^:]*):')
        if pattern then
          patterns[pattern] = (patterns[pattern] or 0) + 1
        end
      end
      return cjson.encode(patterns)
    `, 0);
    
    // Cache hit/miss counts for last hour
    const hourAgo = Date.now() - 3600000;
    pipeline.zcount('cache:metrics:hits', hourAgo, '+inf');
    pipeline.zcount('cache:metrics:misses', hourAgo, '+inf');
    
    // Most accessed keys
    pipeline.zrevrange('cache:access_frequency', 0, 9, 'WITHSCORES');
    
    // Memory usage by key pattern
    pipeline.eval(`
      local keys = redis.call('keys', 't:*')
      local memory = {}
      for _, key in ipairs(keys) do
        local usage = redis.call('memory', 'usage', key)
        local tenant = string.match(key, '^t:([^:]*):')
        if tenant then
          memory[tenant] = (memory[tenant] or 0) + usage
        end
      end
      return cjson.encode(memory)
    `, 0);
    
    const results = await pipeline.exec();
    
    const hitRatio = await this.getCacheHitRatio();
    
    return {
      hitRatio,
      totalMemoryUsage: results[0][1] as number,
      keyPatterns: JSON.parse(results[1][1] as string),
      hits: results[2][1] as number,
      misses: results[3][1] as number,
      mostAccessedKeys: results[4][1] as string[],
      memoryByTenant: JSON.parse(results[5][1] as string),
      timestamp: Date.now(),
    };
  }
  
  // Identify cache hotspots and optimization opportunities
  async analyzeCachePerformance(): Promise<CacheAnalysis> {
    const stats = await this.getCacheStatistics();
    const recommendations: string[] = [];
    
    // Analyze hit ratio
    if (stats.hitRatio < 85) {
      recommendations.push(`Cache hit ratio is low (${stats.hitRatio.toFixed(1)}%). Consider increasing TTL or cache warming.`);
    }
    
    // Analyze memory usage
    const totalMemory = Object.values(stats.memoryByTenant).reduce((sum: number, mem: number) => sum + mem, 0);
    if (totalMemory > 6 * 1024 * 1024 * 1024) { // 6GB
      recommendations.push('High memory usage detected. Consider implementing cache eviction policies.');
    }
    
    // Analyze access patterns
    const accessPatterns = await this.analyzeAccessPatterns();
    if (accessPatterns.unevenDistribution) {
      recommendations.push('Uneven access distribution detected. Consider cache sharding or load balancing.');
    }
    
    // Detect expensive operations
    const expensiveOperations = await this.identifyExpensiveOperations();
    if (expensiveOperations.length > 0) {
      recommendations.push(`Found ${expensiveOperations.length} expensive operations that could benefit from caching.`);
    }
    
    return {
      statistics: stats,
      recommendations,
      accessPatterns,
      expensiveOperations,
      optimizationScore: this.calculateOptimizationScore(stats, recommendations),
      generatedAt: Date.now(),
    };
  }
  
  private async recordMetric(type: string, data: any): Promise<void> {
    const timestamp = Date.now();
    
    // Record in time-series
    await this.redis.zadd(`cache:metrics:${type}`, timestamp, JSON.stringify(data));
    
    // Keep only last 24 hours of data
    const dayAgo = timestamp - 86400000;
    await this.redis.zremrangebyscore(`cache:metrics:${type}`, 0, dayAgo);
    
    // Send to monitoring system
    await this.metricsCollector.record(`cache.${type}`, {
      ...data,
      timestamp,
    });
  }
  
  private startMetricsCollection(): void {
    // Collect Redis info every 30 seconds
    setInterval(async () => {
      try {
        const info = await this.redis.info('memory');
        const stats = this.parseRedisInfo(info);
        
        await this.metricsCollector.record('cache.redis_memory', stats);
      } catch (error) {
        console.error('Failed to collect Redis metrics:', error);
      }
    }, 30000);
    
    // Collect cache statistics every 5 minutes
    setInterval(async () => {
      try {
        const statistics = await this.getCacheStatistics();
        await this.metricsCollector.record('cache.statistics', statistics);
      } catch (error) {
        console.error('Failed to collect cache statistics:', error);
      }
    }, 300000);
  }
}
```

### AI-Powered Cache Optimization

```typescript
class AIOptimizedCaching {
  private redis: Redis;
  private mlModel: CacheOptimizationModel;
  
  constructor(redis: Redis) {
    this.redis = redis;
    this.mlModel = new CacheOptimizationModel();
    this.startOptimizationLoop();
  }
  
  // Predict cache access patterns using machine learning
  async predictAccessPatterns(
    tenantId: string,
    timeHorizon = 3600 // 1 hour
  ): Promise<CacheAccessPrediction[]> {
    // Gather historical access data
    const historicalData = await this.gatherHistoricalData(tenantId, 7 * 24 * 3600); // 7 days
    
    // Feature engineering
    const features = this.extractFeatures(historicalData);
    
    // Predict using ML model
    const predictions = await this.mlModel.predict(features, timeHorizon);
    
    return predictions.map(pred => ({
      key: pred.key,
      accessProbability: pred.probability,
      predictedAccesses: pred.count,
      recommendedTTL: this.calculateOptimalTTL(pred),
      warmingPriority: this.calculateWarmingPriority(pred),
    }));
  }
  
  // Dynamic TTL optimization based on access patterns
  async optimizeTTL(key: string, currentTTL: number): Promise<number> {
    const accessHistory = await this.getAccessHistory(key, 7 * 24 * 3600); // 7 days
    
    if (accessHistory.length === 0) {
      return currentTTL; // No data, keep current TTL
    }
    
    // Calculate access frequency
    const accessFrequency = accessHistory.length / (7 * 24); // accesses per hour
    
    // Calculate access recency
    const lastAccess = Math.max(...accessHistory.map(a => a.timestamp));
    const timeSinceLastAccess = Date.now() - lastAccess;
    
    // Calculate optimal TTL using ML model
    const features = {
      currentTTL,
      accessFrequency,
      timeSinceLastAccess,
      keyPattern: this.extractKeyPattern(key),
      dataSize: await this.getKeySize(key),
      tenantId: this.extractTenantId(key),
    };
    
    const optimalTTL = await this.mlModel.predictOptimalTTL(features);
    
    // Apply bounds and business rules
    return Math.max(300, Math.min(86400, optimalTTL)); // 5 minutes to 24 hours
  }
  
  // Predictive cache warming
  async performPredictiveWarming(): Promise<void> {
    const tenants = await this.getActiveTenants();
    
    for (const tenantId of tenants) {
      try {
        // Predict what data will be needed in the next hour
        const predictions = await this.predictAccessPatterns(tenantId, 3600);
        
        // Filter high-probability predictions
        const warmingCandidates = predictions.filter(p => 
          p.accessProbability > 0.7 && p.warmingPriority > 0.5
        );
        
        // Sort by priority
        warmingCandidates.sort((a, b) => b.warmingPriority - a.warmingPriority);
        
        // Warm top candidates (limit to prevent overload)
        const topCandidates = warmingCandidates.slice(0, 50);
        
        for (const candidate of topCandidates) {
          await this.warmCacheEntry(candidate.key, candidate.recommendedTTL);
        }
        
        console.log(`Warmed ${topCandidates.length} cache entries for tenant ${tenantId}`);
      } catch (error) {
        console.error(`Predictive warming failed for tenant ${tenantId}:`, error);
      }
    }
  }
  
  // Intelligent cache eviction
  async performIntelligentEviction(): Promise<void> {
    const memoryInfo = await this.redis.info('memory');
    const usedMemory = this.parseMemoryInfo(memoryInfo).used_memory;
    const maxMemory = this.parseMemoryInfo(memoryInfo).maxmemory;
    
    const memoryUsageRatio = usedMemory / maxMemory;
    
    if (memoryUsageRatio < 0.85) {
      return; // No eviction needed
    }
    
    console.log(`High memory usage detected (${(memoryUsageRatio * 100).toFixed(1)}%). Starting intelligent eviction.`);
    
    // Get all cache keys with metadata
    const keys = await this.redis.keys('t:*');
    const keyMetadata = await this.gatherKeyMetadata(keys);
    
    // Calculate eviction scores using ML model
    const evictionScores = await this.mlModel.calculateEvictionScores(keyMetadata);
    
    // Sort by eviction score (higher score = more likely to evict)
    const sortedKeys = evictionScores.sort((a, b) => b.score - a.score);
    
    // Evict keys until memory usage is acceptable
    let evictedCount = 0;
    const targetMemoryRatio = 0.75;
    
    for (const keyData of sortedKeys) {
      await this.redis.del(keyData.key);
      evictedCount++;
      
      // Check memory usage periodically
      if (evictedCount % 100 === 0) {
        const currentInfo = await this.redis.info('memory');
        const currentUsage = this.parseMemoryInfo(currentInfo).used_memory / maxMemory;
        
        if (currentUsage <= targetMemoryRatio) {
          break;
        }
      }
    }
    
    console.log(`Evicted ${evictedCount} cache entries. New memory usage: ${((usedMemory / maxMemory) * 100).toFixed(1)}%`);
  }
  
  // Adaptive cache sizing based on demand
  async adaptiveCacheSize(): Promise<void> {
    const tenants = await this.getActiveTenants();
    
    for (const tenantId of tenants) {
      const tenantMetrics = await this.getTenantCacheMetrics(tenantId);
      
      const recommendations = {
        currentSize: tenantMetrics.memoryUsage,
        recommendedSize: await this.calculateRecommendedSize(tenantMetrics),
        reasoning: [],
      };
      
      // Analyze metrics and provide recommendations
      if (tenantMetrics.hitRatio < 0.8) {
        recommendations.reasoning.push('Low hit ratio suggests need for larger cache');
        recommendations.recommendedSize *= 1.2;
      }
      
      if (tenantMetrics.evictionRate > 100) { // per hour
        recommendations.reasoning.push('High eviction rate indicates memory pressure');
        recommendations.recommendedSize *= 1.5;
      }
      
      if (tenantMetrics.averageResponseTime > 10) { // ms
        recommendations.reasoning.push('Slow cache response time suggests bottleneck');
        recommendations.reasoning.push('Consider cache sharding or more memory');
      }
      
      // Store recommendations for review
      await this.storeCacheRecommendations(tenantId, recommendations);
    }
  }
  
  private startOptimizationLoop(): void {
    // Predictive warming every 30 minutes
    setInterval(async () => {
      try {
        await this.performPredictiveWarming();
      } catch (error) {
        console.error('Predictive warming failed:', error);
      }
    }, 30 * 60 * 1000);
    
    // Intelligent eviction every 5 minutes
    setInterval(async () => {
      try {
        await this.performIntelligentEviction();
      } catch (error) {
        console.error('Intelligent eviction failed:', error);
      }
    }, 5 * 60 * 1000);
    
    // Cache size optimization every 4 hours
    setInterval(async () => {
      try {
        await this.adaptiveCacheSize();
      } catch (error) {
        console.error('Adaptive cache sizing failed:', error);
      }
    }, 4 * 60 * 60 * 1000);
  }
}
```

---

## High Availability and Disaster Recovery

### Redis Cluster Configuration

```yaml
# docker-compose.production.yml
version: '3.8'

services:
  redis-master-1:
    image: redis/redis-stack:7.2.0-v9
    container_name: thorbis-redis-master-1
    restart: unless-stopped
    ports:
      - "6379:6379"
      - "6380:6380"  # TLS port
    volumes:
      - redis-master-1-data:/data
      - ./redis/config/redis-master.conf:/usr/local/etc/redis/redis.conf
      - ./redis/tls:/etc/redis/tls:ro
    command: redis-server /usr/local/etc/redis/redis.conf
    environment:
      REDIS_PASSWORD: ${REDIS_PASSWORD}
    networks:
      - thorbis-redis
    healthcheck:
      test: ["CMD", "redis-cli", "--tls", "--cert", "/etc/redis/tls/redis.crt", "--key", "/etc/redis/tls/redis.key", "--cacert", "/etc/redis/tls/ca.crt", "-h", "localhost", "-p", "6380", "ping"]
      interval: 10s
      timeout: 5s
      retries: 3
      start_period: 30s

  redis-master-2:
    image: redis/redis-stack:7.2.0-v9
    container_name: thorbis-redis-master-2
    restart: unless-stopped
    ports:
      - "6381:6379"
      - "6382:6380"
    volumes:
      - redis-master-2-data:/data
      - ./redis/config/redis-master.conf:/usr/local/etc/redis/redis.conf
      - ./redis/tls:/etc/redis/tls:ro
    command: redis-server /usr/local/etc/redis/redis.conf
    environment:
      REDIS_PASSWORD: ${REDIS_PASSWORD}
    networks:
      - thorbis-redis
    healthcheck:
      test: ["CMD", "redis-cli", "--tls", "--cert", "/etc/redis/tls/redis.crt", "--key", "/etc/redis/tls/redis.key", "--cacert", "/etc/redis/tls/ca.crt", "-h", "localhost", "-p", "6380", "ping"]
      interval: 10s
      timeout: 5s
      retries: 3

  redis-master-3:
    image: redis/redis-stack:7.2.0-v9
    container_name: thorbis-redis-master-3
    restart: unless-stopped
    ports:
      - "6383:6379"
      - "6384:6380"
    volumes:
      - redis-master-3-data:/data
      - ./redis/config/redis-master.conf:/usr/local/etc/redis/redis.conf
      - ./redis/tls:/etc/redis/tls:ro
    command: redis-server /usr/local/etc/redis/redis.conf
    environment:
      REDIS_PASSWORD: ${REDIS_PASSWORD}
    networks:
      - thorbis-redis

  # Redis Replicas for read scaling
  redis-replica-1:
    image: redis/redis-stack:7.2.0-v9
    container_name: thorbis-redis-replica-1
    restart: unless-stopped
    volumes:
      - redis-replica-1-data:/data
      - ./redis/config/redis-replica.conf:/usr/local/etc/redis/redis.conf
      - ./redis/tls:/etc/redis/tls:ro
    command: redis-server /usr/local/etc/redis/redis.conf
    environment:
      REDIS_PASSWORD: ${REDIS_PASSWORD}
    networks:
      - thorbis-redis
    depends_on:
      - redis-master-1

  redis-replica-2:
    image: redis/redis-stack:7.2.0-v9
    container_name: thorbis-redis-replica-2
    restart: unless-stopped
    volumes:
      - redis-replica-2-data:/data
      - ./redis/config/redis-replica.conf:/usr/local/etc/redis/redis.conf
      - ./redis/tls:/etc/redis/tls:ro
    command: redis-server /usr/local/etc/redis/redis.conf
    environment:
      REDIS_PASSWORD: ${REDIS_PASSWORD}
    networks:
      - thorbis-redis
    depends_on:
      - redis-master-2

  # Redis Sentinel for high availability
  redis-sentinel-1:
    image: redis:7.2.4
    container_name: thorbis-redis-sentinel-1
    restart: unless-stopped
    volumes:
      - ./redis/config/sentinel.conf:/usr/local/etc/redis/sentinel.conf
    command: redis-sentinel /usr/local/etc/redis/sentinel.conf
    networks:
      - thorbis-redis
    depends_on:
      - redis-master-1
      - redis-master-2
      - redis-master-3

  redis-sentinel-2:
    image: redis:7.2.4
    container_name: thorbis-redis-sentinel-2
    restart: unless-stopped
    volumes:
      - ./redis/config/sentinel.conf:/usr/local/etc/redis/sentinel.conf
    command: redis-sentinel /usr/local/etc/redis/sentinel.conf
    networks:
      - thorbis-redis
    depends_on:
      - redis-master-1
      - redis-master-2
      - redis-master-3

  redis-sentinel-3:
    image: redis:7.2.4
    container_name: thorbis-redis-sentinel-3
    restart: unless-stopped
    volumes:
      - ./redis/config/sentinel.conf:/usr/local/etc/redis/sentinel.conf
    command: redis-sentinel /usr/local/etc/redis/sentinel.conf
    networks:
      - thorbis-redis
    depends_on:
      - redis-master-1
      - redis-master-2
      - redis-master-3

  # Cache proxy for connection pooling and load balancing
  redis-proxy:
    image: haproxy:2.8
    container_name: thorbis-redis-proxy
    restart: unless-stopped
    ports:
      - "6390:6379"  # Main proxy port
      - "6391:6380"  # Read-only port
    volumes:
      - ./redis/haproxy/haproxy.cfg:/usr/local/etc/haproxy/haproxy.cfg:ro
    networks:
      - thorbis-redis
    depends_on:
      - redis-master-1
      - redis-master-2
      - redis-master-3

volumes:
  redis-master-1-data:
  redis-master-2-data:
  redis-master-3-data:
  redis-replica-1-data:
  redis-replica-2-data:

networks:
  thorbis-redis:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

### HAProxy Configuration for Redis Load Balancing

```conf
# redis/haproxy/haproxy.cfg
global
    maxconn 4096
    log stdout local0
    chroot /var/lib/haproxy
    stats socket /run/haproxy/admin.sock mode 660 level admin
    stats timeout 30s
    user haproxy
    group haproxy
    daemon

defaults
    mode tcp
    timeout connect 5000ms
    timeout client 50000ms
    timeout server 50000ms
    option tcplog
    log global

# Redis write operations (master nodes)
frontend redis_write
    bind *:6379
    default_backend redis_masters

backend redis_masters
    balance roundrobin
    option tcp-check
    tcp-check connect
    tcp-check send PING\r\n
    tcp-check expect string +PONG
    
    server redis-master-1 redis-master-1:6379 check inter 5s fall 3 rise 2
    server redis-master-2 redis-master-2:6379 check inter 5s fall 3 rise 2 backup
    server redis-master-3 redis-master-3:6379 check inter 5s fall 3 rise 2 backup

# Redis read operations (includes replicas)
frontend redis_read
    bind *:6380
    default_backend redis_read_pool

backend redis_read_pool
    balance roundrobin
    option tcp-check
    tcp-check connect
    tcp-check send PING\r\n
    tcp-check expect string +PONG
    
    server redis-master-1 redis-master-1:6379 check inter 5s weight 50
    server redis-master-2 redis-master-2:6379 check inter 5s weight 50
    server redis-master-3 redis-master-3:6379 check inter 5s weight 50
    server redis-replica-1 redis-replica-1:6379 check inter 5s weight 100
    server redis-replica-2 redis-replica-2:6379 check inter 5s weight 100

# HAProxy stats interface
frontend stats
    bind *:8404
    stats enable
    stats uri /stats
    stats refresh 30s
    stats admin if TRUE
```

### Redis Sentinel Configuration

```conf
# redis/config/sentinel.conf
port 26379
bind 0.0.0.0

# Monitor multiple master nodes
sentinel monitor thorbis-master-1 redis-master-1 6379 2
sentinel monitor thorbis-master-2 redis-master-2 6379 2
sentinel monitor thorbis-master-3 redis-master-3 6379 2

# Authentication
sentinel auth-pass thorbis-master-1 ${REDIS_PASSWORD}
sentinel auth-pass thorbis-master-2 ${REDIS_PASSWORD}
sentinel auth-pass thorbis-master-3 ${REDIS_PASSWORD}

# Timing configurations
sentinel down-after-milliseconds thorbis-master-1 10000
sentinel down-after-milliseconds thorbis-master-2 10000
sentinel down-after-milliseconds thorbis-master-3 10000

sentinel parallel-syncs thorbis-master-1 1
sentinel parallel-syncs thorbis-master-2 1
sentinel parallel-syncs thorbis-master-3 1

sentinel failover-timeout thorbis-master-1 60000
sentinel failover-timeout thorbis-master-2 60000
sentinel failover-timeout thorbis-master-3 60000

# Notification scripts
sentinel notification-script thorbis-master-1 /etc/redis/scripts/notify.sh
sentinel client-reconfig-script thorbis-master-1 /etc/redis/scripts/reconfig.sh

# Deny scripts for security
sentinel deny-scripts-reconfig yes

logfile /var/log/redis/sentinel.log
loglevel notice
```

### Disaster Recovery Implementation

```typescript
class CacheDisasterRecovery {
  private primaryRedis: Redis;
  private backupRedis: Redis;
  private s3Client: S3Client;
  
  constructor(
    primaryRedis: Redis,
    backupRedis: Redis,
    s3Client: S3Client
  ) {
    this.primaryRedis = primaryRedis;
    this.backupRedis = backupRedis;
    this.s3Client = s3Client;
    this.startBackupSchedule();
  }
  
  // Continuous backup to S3
  async performIncrementalBackup(): Promise<void> {
    const backupId = `cache-backup-${Date.now()}`;
    const startTime = Date.now();
    
    try {
      console.log(`Starting incremental backup: ${backupId}`);
      
      // Get all keys modified since last backup
      const lastBackupTime = await this.getLastBackupTime();
      const modifiedKeys = await this.getModifiedKeys(lastBackupTime);
      
      console.log(`Found ${modifiedKeys.length} modified keys since last backup`);
      
      if (modifiedKeys.length === 0) {
        console.log('No changes detected, skipping backup');
        return;
      }
      
      // Create backup data structure
      const backupData: CacheBackupData = {
        backupId,
        timestamp: Date.now(),
        type: 'incremental',
        keyCount: modifiedKeys.length,
        data: new Map(),
        metadata: {
          redisVersion: await this.getRedisVersion(),
          compressionType: 'gzip',
          encryptionEnabled: true,
        },
      };
      
      // Batch export keys
      const batchSize = 1000;
      for (let i = 0; i < modifiedKeys.length; i += batchSize) {
        const batch = modifiedKeys.slice(i, i + batchSize);
        
        const pipeline = this.primaryRedis.pipeline();
        batch.forEach(key => {
          pipeline.dump(key);
          pipeline.ttl(key);
        });
        
        const results = await pipeline.exec();
        
        // Process results
        for (let j = 0; j < batch.length; j++) {
          const key = batch[j];
          const dumpResult = results[j * 2];
          const ttlResult = results[j * 2 + 1];
          
          if (!dumpResult[0] && dumpResult[1]) {
            backupData.data.set(key, {
              data: dumpResult[1] as Buffer,
              ttl: ttlResult[1] as number,
              type: await this.primaryRedis.type(key),
            });
          }
        }
      }
      
      // Compress and encrypt backup data
      const serialized = JSON.stringify(Array.from(backupData.data.entries()));
      const compressed = await this.compressData(serialized);
      const encrypted = await this.encryptData(compressed);
      
      // Upload to S3
      const s3Key = `cache-backups/${backupId}.backup`;
      await this.uploadToS3(s3Key, encrypted, {
        'backup-id': backupId,
        'backup-type': 'incremental',
        'key-count': modifiedKeys.length.toString(),
        'timestamp': Date.now().toString(),
      });
      
      // Update backup metadata
      await this.updateBackupMetadata(backupId, backupData, Date.now() - startTime);
      
      console.log(`Incremental backup completed: ${backupId} (${Date.now() - startTime}ms)`);
    } catch (error) {
      console.error(`Incremental backup failed: ${backupId}:`, error);
      await this.notifyBackupFailure(backupId, error);
    }
  }
  
  // Full backup for disaster recovery
  async performFullBackup(): Promise<void> {
    const backupId = `cache-full-backup-${Date.now()}`;
    const startTime = Date.now();
    
    try {
      console.log(`Starting full backup: ${backupId}`);
      
      // Create Redis snapshot
      await this.primaryRedis.bgsave();
      
      // Wait for background save to complete
      await this.waitForBackgroundSave();
      
      // Get all keys for metadata
      const allKeys = await this.primaryRedis.keys('*');
      console.log(`Backing up ${allKeys.length} cache keys`);
      
      // Create backup metadata
      const backupData: CacheBackupData = {
        backupId,
        timestamp: Date.now(),
        type: 'full',
        keyCount: allKeys.length,
        data: new Map(),
        metadata: {
          redisVersion: await this.getRedisVersion(),
          compressionType: 'gzip',
          encryptionEnabled: true,
          fullSnapshot: true,
        },
      };
      
      // Upload RDB file to S3
      const rdbPath = await this.getRDBFilePath();
      const rdbData = await fs.readFile(rdbPath);
      const compressedRdb = await this.compressData(rdbData);
      const encryptedRdb = await this.encryptData(compressedRdb);
      
      const s3Key = `cache-backups/${backupId}.rdb`;
      await this.uploadToS3(s3Key, encryptedRdb, {
        'backup-id': backupId,
        'backup-type': 'full',
        'file-type': 'rdb',
        'original-size': rdbData.length.toString(),
        'compressed-size': compressedRdb.length.toString(),
        'timestamp': Date.now().toString(),
      });
      
      // Create key inventory for recovery verification
      const keyInventory = await this.createKeyInventory(allKeys);
      const inventoryKey = `cache-backups/${backupId}.inventory`;
      await this.uploadToS3(inventoryKey, JSON.stringify(keyInventory));
      
      await this.updateBackupMetadata(backupId, backupData, Date.now() - startTime);
      
      console.log(`Full backup completed: ${backupId} (${Date.now() - startTime}ms)`);
    } catch (error) {
      console.error(`Full backup failed: ${backupId}:`, error);
      await this.notifyBackupFailure(backupId, error);
    }
  }
  
  // Disaster recovery from backup
  async recoverFromBackup(backupId: string, targetRedis: Redis = this.primaryRedis): Promise<void> {
    const recoveryId = `recovery-${Date.now()}`;
    const startTime = Date.now();
    
    try {
      console.log(`Starting recovery from backup: ${backupId}`);
      
      // Get backup metadata
      const metadata = await this.getBackupMetadata(backupId);
      if (!metadata) {
        throw new Error(`Backup metadata not found: ${backupId}`);
      }
      
      // Download backup from S3
      const backupData = await this.downloadFromS3(`cache-backups/${backupId}.backup`);
      const decrypted = await this.decryptData(backupData);
      const decompressed = await this.decompressData(decrypted);
      
      const cacheData = JSON.parse(decompressed.toString());
      const keyCount = Array.isArray(cacheData) ? cacheData.length : Object.keys(cacheData).length;
      
      console.log(`Recovering ${keyCount} keys from backup`);
      
      // Clear target Redis (optional, based on recovery strategy)
      const clearExisting = await this.confirmClearExisting();
      if (clearExisting) {
        await targetRedis.flushall();
      }
      
      // Restore data in batches
      const batchSize = 1000;
      let restoredCount = 0;
      
      for (let i = 0; i < cacheData.length; i += batchSize) {
        const batch = cacheData.slice(i, i + batchSize);
        const pipeline = targetRedis.pipeline();
        
        for (const [key, keyData] of batch) {
          try {
            // Restore using RESTORE command
            if (keyData.ttl > 0) {
              pipeline.restore(key, keyData.ttl * 1000, keyData.data, 'REPLACE');
            } else {
              pipeline.restore(key, 0, keyData.data, 'REPLACE');
            }
            
            restoredCount++;
          } catch (error) {
            console.warn(`Failed to restore key ${key}:`, error);
          }
        }
        
        await pipeline.exec();
        
        // Report progress
        const progress = ((i + batch.length) / cacheData.length) * 100;
        console.log(`Recovery progress: ${progress.toFixed(1)}% (${restoredCount} keys restored)`);
      }
      
      // Verify recovery
      const verificationResult = await this.verifyRecovery(backupId, targetRedis);
      
      console.log(`Recovery completed: ${recoveryId} (${Date.now() - startTime}ms)`);
      console.log(`Restored ${restoredCount} keys with ${verificationResult.successRate.toFixed(1)}% success rate`);
      
      await this.logRecoveryEvent(recoveryId, backupId, restoredCount, verificationResult);
    } catch (error) {
      console.error(`Recovery failed: ${recoveryId}:`, error);
      await this.notifyRecoveryFailure(recoveryId, backupId, error);
      throw error;
    }
  }
  
  // Cross-region backup synchronization
  async synchronizeBackupsAcrossRegions(): Promise<void> {
    const regions = ['us-east-1', 'us-west-2', 'eu-west-1'];
    const localRegion = process.env.AWS_REGION || 'us-east-1';
    
    for (const region of regions) {
      if (region === localRegion) continue;
      
      try {
        await this.syncBackupsToRegion(region);
      } catch (error) {
        console.error(`Failed to sync backups to region ${region}:`, error);
      }
    }
  }
  
  private startBackupSchedule(): void {
    // Incremental backup every 15 minutes
    setInterval(async () => {
      try {
        await this.performIncrementalBackup();
      } catch (error) {
        console.error('Scheduled incremental backup failed:', error);
      }
    }, 15 * 60 * 1000);
    
    // Full backup every 6 hours
    setInterval(async () => {
      try {
        await this.performFullBackup();
      } catch (error) {
        console.error('Scheduled full backup failed:', error);
      }
    }, 6 * 60 * 60 * 1000);
    
    // Cross-region sync every 2 hours
    setInterval(async () => {
      try {
        await this.synchronizeBackupsAcrossRegions();
      } catch (error) {
        console.error('Cross-region backup sync failed:', error);
      }
    }, 2 * 60 * 60 * 1000);
    
    // Cleanup old backups daily
    setInterval(async () => {
      try {
        await this.cleanupOldBackups();
      } catch (error) {
        console.error('Backup cleanup failed:', error);
      }
    }, 24 * 60 * 60 * 1000);
  }
}
```

---

## Implementation Guidelines

### Phase 1: Core Infrastructure Setup (Weeks 1-2)

1. **Redis Cluster Deployment**
   - Deploy Redis masters with clustering
   - Configure Redis Sentinel for high availability
   - Set up HAProxy for load balancing
   - Implement TLS encryption

2. **PostgreSQL Materialized Views**
   - Create core materialized views
   - Set up automated refresh schedules
   - Implement concurrent refresh patterns
   - Add performance indexes

3. **Basic Cache Layer**
   - Implement core cache classes
   - Set up key namespacing
   - Configure TTL management
   - Basic invalidation patterns

### Phase 2: Advanced Caching Features (Weeks 3-4)

1. **Multi-Tenant Isolation**
   - Implement tenant-specific encryption
   - Set up permission-based caching
   - Configure security boundaries
   - Audit trail integration

2. **Industry-Specific Patterns**
   - Home Services caching implementation
   - Automotive services optimization
   - Restaurant real-time caching
   - Financial data security patterns

3. **Performance Monitoring**
   - Deploy metrics collection
   - Set up performance dashboards
   - Implement alerting systems
   - Cache analytics framework

### Phase 3: AI-Powered Optimization (Weeks 5-6)

1. **Machine Learning Integration**
   - Deploy ML models for optimization
   - Implement predictive caching
   - Set up intelligent eviction
   - Dynamic TTL optimization

2. **Advanced Invalidation**
   - Dependency graph implementation
   - Event-driven invalidation
   - Cross-service coordination
   - Blockchain verification

3. **Disaster Recovery**
   - Backup automation
   - Cross-region replication
   - Recovery procedures
   - Failover testing

### Phase 4: Production Optimization (Weeks 7-8)

1. **Performance Tuning**
   - Load testing and optimization
   - Memory usage optimization
   - Network latency reduction
   - Compression optimization

2. **Operational Excellence**
   - Monitoring and alerting
   - Runbook development
   - Team training
   - Documentation completion

3. **Security Hardening**
   - Security audit and testing
   - Compliance verification
   - Access control refinement
   - Encryption validation

---

## Operational Management

### Deployment Scripts

```bash
#!/bin/bash
# deploy-cache-infrastructure.sh

set -e

ENVIRONMENT=${1:-production}
REGION=${2:-us-east-1}

echo "Deploying Thorbis cache infrastructure to $ENVIRONMENT in $REGION"

# Generate TLS certificates
echo "Generating TLS certificates..."
./scripts/generate-tls-certs.sh

# Deploy Redis cluster
echo "Deploying Redis cluster..."
docker-compose -f docker-compose.${ENVIRONMENT}.yml up -d

# Wait for Redis cluster to be ready
echo "Waiting for Redis cluster..."
./scripts/wait-for-redis-cluster.sh

# Initialize cluster
echo "Initializing Redis cluster..."
./scripts/init-redis-cluster.sh

# Deploy materialized views
echo "Creating PostgreSQL materialized views..."
psql ${DATABASE_URL} -f sql/materialized-views.sql

# Deploy cache warming
echo "Starting cache warming..."
./scripts/warm-cache.sh

# Verify deployment
echo "Verifying deployment..."
./scripts/verify-cache-deployment.sh

echo "Cache infrastructure deployment completed successfully!"
```

### Monitoring Configuration

```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "cache_alerts.yml"

scrape_configs:
  - job_name: 'redis-cluster'
    static_configs:
      - targets: ['redis-master-1:6379', 'redis-master-2:6379', 'redis-master-3:6379']
    metrics_path: /metrics
    scrape_interval: 10s

  - job_name: 'cache-performance'
    static_configs:
      - targets: ['cache-monitor:8080']
    metrics_path: /metrics
    scrape_interval: 30s

  - job_name: 'postgresql-views'
    static_configs:
      - targets: ['postgres-exporter:9187']
    metrics_path: /metrics
    scrape_interval: 30s

alertmanager:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093
```

### Cache Health Checks

```typescript
// health-checks/cache-health.ts
export class CacheHealthChecker {
  private redis: Redis;
  private postgres: Pool;
  
  async performHealthCheck(): Promise<HealthCheckResult> {
    const checks: HealthCheck[] = [];
    
    // Redis connectivity check
    checks.push(await this.checkRedisConnectivity());
    
    // Redis cluster health
    checks.push(await this.checkRedisClusterHealth());
    
    // Cache hit ratio check
    checks.push(await this.checkCacheHitRatio());
    
    // Memory usage check
    checks.push(await this.checkMemoryUsage());
    
    // Materialized views freshness
    checks.push(await this.checkMaterializedViewsFreshness());
    
    // Backup status check
    checks.push(await this.checkBackupStatus());
    
    // Performance metrics check
    checks.push(await this.checkPerformanceMetrics());
    
    const overallStatus = checks.every(check => check.status === 'healthy') 
      ? 'healthy' : 'unhealthy';
    
    return {
      status: overallStatus,
      timestamp: Date.now(),
      checks,
      summary: this.generateHealthSummary(checks),
    };
  }
  
  private async checkRedisConnectivity(): Promise<HealthCheck> {
    try {
      const start = Date.now();
      await this.redis.ping();
      const duration = Date.now() - start;
      
      return {
        name: 'redis_connectivity',
        status: duration < 100 ? 'healthy' : 'warning',
        message: `Redis ping successful in ${duration}ms`,
        details: { responseTime: duration },
      };
    } catch (error) {
      return {
        name: 'redis_connectivity',
        status: 'unhealthy',
        message: `Redis ping failed: ${error.message}`,
        details: { error: error.message },
      };
    }
  }
  
  private async checkCacheHitRatio(): Promise<HealthCheck> {
    try {
      const hitRatio = await this.getCacheHitRatio(3600); // Last hour
      
      let status: 'healthy' | 'warning' | 'unhealthy';
      if (hitRatio >= 90) status = 'healthy';
      else if (hitRatio >= 75) status = 'warning';
      else status = 'unhealthy';
      
      return {
        name: 'cache_hit_ratio',
        status,
        message: `Cache hit ratio: ${hitRatio.toFixed(1)}%`,
        details: { hitRatio },
      };
    } catch (error) {
      return {
        name: 'cache_hit_ratio',
        status: 'unhealthy',
        message: `Failed to check hit ratio: ${error.message}`,
        details: { error: error.message },
      };
    }
  }
}
```

### Troubleshooting Guide

```markdown
# Cache Troubleshooting Guide

## Common Issues and Solutions

### 1. Low Cache Hit Ratio

**Symptoms:**
- Cache hit ratio below 80%
- Slow application response times
- High database load

**Diagnosis:**
```bash
# Check cache statistics
redis-cli --eval scripts/cache-stats.lua

# Analyze access patterns
redis-cli --eval scripts/access-patterns.lua
```

**Solutions:**
- Increase TTL for stable data
- Implement cache warming
- Review invalidation patterns
- Check for cache key collisions

### 2. Memory Pressure

**Symptoms:**
- Redis memory usage > 85%
- Frequent evictions
- OOM errors

**Diagnosis:**
```bash
# Check memory usage
redis-cli info memory

# Analyze key sizes
redis-cli --eval scripts/memory-analysis.lua
```

**Solutions:**
- Implement intelligent eviction
- Compress large values
- Review TTL settings
- Scale Redis cluster

### 3. Slow Cache Operations

**Symptoms:**
- Cache operations > 10ms
- Timeout errors
- Connection pool exhaustion

**Diagnosis:**
```bash
# Check slow log
redis-cli slowlog get 10

# Monitor connections
redis-cli info clients
```

**Solutions:**
- Optimize Redis configuration
- Review network latency
- Implement connection pooling
- Check for blocking operations

### 4. Materialized View Staleness

**Symptoms:**
- Stale data in reports
- Refresh failures
- Long refresh times

**Diagnosis:**
```sql
-- Check view freshness
SELECT schemaname, matviewname, 
       hasindexes, ispopulated,
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||matviewname)) as size
FROM pg_matviews;
```

**Solutions:**
- Review refresh schedules
- Optimize view queries
- Add proper indexes
- Consider partial refreshes
```

---

## Conclusion

The Thorbis Business OS Advanced Caching Strategy provides a comprehensive, enterprise-grade caching solution that addresses all performance, scalability, and security requirements. The multi-layered architecture with PostgreSQL materialized views and Redis clustering ensures optimal performance while maintaining strict multi-tenant isolation.

Key benefits of this implementation:

1. **Performance Excellence**: Sub-10ms cache retrieval with 95%+ hit ratios
2. **Enterprise Security**: Multi-tenant isolation with encryption and audit trails
3. **AI-Powered Optimization**: Predictive caching and intelligent eviction
4. **High Availability**: Cross-region replication with disaster recovery
5. **Industry-Specific Optimization**: Tailored patterns for each vertical
6. **Operational Excellence**: Comprehensive monitoring and management tools

The phased implementation approach ensures smooth deployment while minimizing risk and maximizing business value. The system is designed to scale with the business and adapt to changing requirements through AI-powered optimization and continuous monitoring.

This caching strategy positions Thorbis Business OS as a leader in performance and reliability, providing the foundation for sustained growth and customer success across all industry verticals.