# Supabase Configuration Guide

> **Version**: 1.0.0  
> **Last Updated**: January 2025  
> **Target Audience**: Database Administrators, Backend Developers, System Engineers  

## Overview

Supabase serves as the primary Backend-as-a-Service platform for Thorbis Business OS, providing PostgreSQL database, authentication, real-time subscriptions, storage, and edge functions. This guide covers comprehensive configuration for optimal performance, security, and scalability.

## Supabase Architecture

### Core Services
```typescript
interface SupabaseServices {
  database: {
    engine: 'PostgreSQL 15+',
    features: ['JSONB', 'Full-text search', 'PostGIS', 'Row Level Security'],
    extensions: ['uuid-ossp', 'pgcrypto', 'pgjwt', 'pg_stat_statements'],
    pooling: 'PgBouncer connection pooling'
  },
  
  auth: {
    providers: ['Email/Password', 'OAuth', 'Magic Links', 'Phone/SMS'],
    features: ['MFA', 'PKCE', 'JWT tokens', 'Row Level Security integration'],
    customization: 'Custom auth flows and hooks'
  },
  
  realtime: {
    protocol: 'WebSocket with Phoenix Channels',
    features: ['Database changes', 'Presence', 'Broadcast', 'Postgres Changes'],
    scaling: 'Horizontal scaling with multiple nodes'
  },
  
  storage: {
    backend: 'S3-compatible object storage',
    features: ['CDN integration', 'Image transformations', 'Access policies'],
    security: 'RLS-integrated access control'
  },
  
  edgeFunctions: {
    runtime: 'Deno runtime on edge',
    features: ['TypeScript support', 'NPM modules', 'Cron jobs'],
    deployment: 'Global edge deployment'
  }
}
```

## Database Configuration

### Connection Settings
```sql
-- Database connection configuration
ALTER SYSTEM SET max_connections = 100;
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements,pg_cron';
ALTER SYSTEM SET wal_level = logical;
ALTER SYSTEM SET max_wal_senders = 10;
ALTER SYSTEM SET max_replication_slots = 10;

-- Connection pooling with PgBouncer
-- Pool mode: transaction
-- Default pool size: 20
-- Max client connections: 100
-- Server lifetime: 3600s
-- Server idle timeout: 600s
SELECT pg_reload_conf();
```

### Performance Optimization
```sql
-- PostgreSQL performance settings
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET work_mem = '4MB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.7;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;

-- Query optimization
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;

-- Logging configuration
ALTER SYSTEM SET log_min_duration_statement = 1000; -- Log slow queries
ALTER SYSTEM SET log_statement = 'mod'; -- Log data modifications
ALTER SYSTEM SET log_line_prefix = '%t [%p-%l] %q%u@%d ';

SELECT pg_reload_conf();
```

### Extension Setup
```sql
-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pgjwt";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "postgis" SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pg_cron" SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Configure pg_stat_statements
SELECT pg_stat_statements_reset();
```

## Multi-Tenant Database Schema

### Industry-Separated Architecture
```sql
-- Tenant isolation schema
CREATE SCHEMA IF NOT EXISTS home_services;
CREATE SCHEMA IF NOT EXISTS restaurants;
CREATE SCHEMA IF NOT EXISTS automotive;
CREATE SCHEMA IF NOT EXISTS retail;
CREATE SCHEMA IF NOT EXISTS shared;

-- Base tenant table in shared schema
CREATE TABLE IF NOT EXISTS shared.tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    industry TEXT NOT NULL CHECK (industry IN ('home_services', 'restaurants', 'automotive', 'retail')),
    subdomain TEXT UNIQUE NOT NULL,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on tenants table
ALTER TABLE shared.tenants ENABLE ROW LEVEL SECURITY;

-- Tenant access policy
CREATE POLICY "Tenant isolation" ON shared.tenants
    USING (id = (current_setting('app.current_tenant_id'))::uuid);
```

### Industry-Specific Tables
```sql
-- Home Services schema tables
CREATE TABLE IF NOT EXISTS home_services.work_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES shared.tenants(id),
    customer_id UUID NOT NULL,
    technician_id UUID,
    service_type TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    scheduled_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and create policies
ALTER TABLE home_services.work_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant work orders" ON home_services.work_orders
    USING (tenant_id = (current_setting('app.current_tenant_id'))::uuid);

-- Restaurant schema tables  
CREATE TABLE IF NOT EXISTS restaurants.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES shared.tenants(id),
    table_number INTEGER,
    customer_id UUID,
    items JSONB NOT NULL DEFAULT '[]',
    status TEXT DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    tip_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    payment_method TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE restaurants.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant restaurant orders" ON restaurants.orders
    USING (tenant_id = (current_setting('app.current_tenant_id'))::uuid);
```

### Shared Tables with Tenant Isolation
```sql
-- Users table with industry-agnostic design
CREATE TABLE IF NOT EXISTS shared.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES shared.tenants(id),
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    settings JSONB DEFAULT '{}',
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE shared.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant users" ON shared.users
    USING (tenant_id = (current_setting('app.current_tenant_id'))::uuid);

-- Customers table
CREATE TABLE IF NOT EXISTS shared.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES shared.tenants(id),
    email TEXT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    address JSONB,
    preferences JSONB DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE shared.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant customers" ON shared.customers
    USING (tenant_id = (current_setting('app.current_tenant_id'))::uuid);
```

## Row Level Security (RLS) Configuration

### RLS Policy Templates
```sql
-- Function to get current tenant ID from JWT
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID AS $$
BEGIN
    RETURN COALESCE(
        (current_setting('app.current_tenant_id', true))::uuid,
        (auth.jwt() ->> 'tenant_id')::uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Generic RLS policy function
CREATE OR REPLACE FUNCTION create_tenant_policy(
    schema_name TEXT,
    table_name TEXT,
    policy_name TEXT DEFAULT 'tenant_isolation'
) RETURNS VOID AS $$
BEGIN
    EXECUTE format('
        CREATE POLICY %I ON %I.%I
        USING (tenant_id = get_current_tenant_id())
    ', policy_name, schema_name, table_name);
END;
$$ LANGUAGE plpgsql;

-- Apply RLS to all tenant tables
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT schemaname, tablename 
        FROM pg_tables 
        WHERE schemaname IN ('home_services', 'restaurants', 'automotive', 'retail', 'shared')
        AND tablename != 'tenants'
    LOOP
        EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', r.schemaname, r.tablename);
        PERFORM create_tenant_policy(r.schemaname, r.tablename);
    END LOOP;
END;
$$;
```

### Advanced RLS Policies
```sql
-- User role-based policies
CREATE POLICY "Admin full access" ON shared.users
    FOR ALL
    USING (
        tenant_id = get_current_tenant_id() 
        AND (auth.jwt() ->> 'role')::text = 'admin'
    );

CREATE POLICY "User own data" ON shared.users
    FOR ALL
    USING (
        tenant_id = get_current_tenant_id() 
        AND id = (auth.jwt() ->> 'sub')::uuid
    );

-- Time-based access policies
CREATE POLICY "Business hours access" ON home_services.work_orders
    FOR SELECT
    USING (
        tenant_id = get_current_tenant_id()
        AND EXTRACT(HOUR FROM NOW() AT TIME ZONE 'UTC') BETWEEN 6 AND 22
    );

-- Conditional access based on data sensitivity
CREATE POLICY "Sensitive customer data" ON shared.customers
    FOR ALL
    USING (
        tenant_id = get_current_tenant_id()
        AND (
            (auth.jwt() ->> 'role')::text IN ('admin', 'manager')
            OR (
                (auth.jwt() ->> 'role')::text = 'employee'
                AND NOT (settings ? 'pii_restricted')
            )
        )
    );
```

## Authentication Configuration

### Auth Settings
```sql
-- Auth schema configuration
INSERT INTO auth.config (parameter, value) VALUES 
('JWT_SECRET', 'your-jwt-secret-key'),
('JWT_EXP', '3600'), -- 1 hour
('SITE_URL', 'https://app.thorbis.com'),
('EXTERNAL_EMAIL_ENABLED', 'true'),
('EXTERNAL_PHONE_ENABLED', 'true'),
('SMS_PROVIDER', 'twilio'),
('EXTERNAL_GOOGLE_ENABLED', 'true'),
('EXTERNAL_GITHUB_ENABLED', 'true')
ON CONFLICT (parameter) DO UPDATE SET value = EXCLUDED.value;

-- Custom auth hooks
CREATE OR REPLACE FUNCTION auth.custom_access_token_hook(event auth.jwt_claims)
RETURNS auth.jwt_claims AS $$
DECLARE
    claims auth.jwt_claims;
    tenant_info RECORD;
BEGIN
    claims := event;
    
    -- Add tenant information to JWT
    SELECT t.id, t.industry, t.subdomain 
    INTO tenant_info
    FROM shared.tenants t
    JOIN shared.users u ON u.tenant_id = t.id
    WHERE u.id = (claims ->> 'sub')::uuid;
    
    IF tenant_info IS NOT NULL THEN
        claims := claims || jsonb_build_object(
            'tenant_id', tenant_info.id,
            'industry', tenant_info.industry,
            'subdomain', tenant_info.subdomain
        );
    END IF;
    
    RETURN claims;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Multi-Factor Authentication
```sql
-- MFA setup table
CREATE TABLE IF NOT EXISTS auth.mfa_factors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    factor_type TEXT NOT NULL CHECK (factor_type IN ('totp', 'sms', 'email')),
    secret TEXT,
    phone TEXT,
    email TEXT,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MFA verification function
CREATE OR REPLACE FUNCTION auth.verify_mfa_token(
    user_id UUID,
    token TEXT,
    factor_type TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    factor_record RECORD;
    is_valid BOOLEAN := FALSE;
BEGIN
    SELECT * INTO factor_record 
    FROM auth.mfa_factors 
    WHERE mfa_factors.user_id = verify_mfa_token.user_id 
    AND mfa_factors.factor_type = verify_mfa_token.factor_type
    AND verified_at IS NOT NULL;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Verify TOTP token
    IF factor_type = 'totp' THEN
        SELECT auth.verify_totp(factor_record.secret, token) INTO is_valid;
    END IF;
    
    -- Update last used timestamp if valid
    IF is_valid THEN
        UPDATE auth.mfa_factors 
        SET updated_at = NOW()
        WHERE id = factor_record.id;
    END IF;
    
    RETURN is_valid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Real-time Configuration

### Realtime Setup
```sql
-- Enable realtime for specific tables
ALTER PUBLICATION supabase_realtime ADD TABLE shared.customers;
ALTER PUBLICATION supabase_realtime ADD TABLE shared.users;
ALTER PUBLICATION supabase_realtime ADD TABLE home_services.work_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE restaurants.orders;

-- Configure realtime policies
CREATE POLICY "Realtime tenant isolation" ON shared.customers
    FOR SELECT
    USING (
        tenant_id = get_current_tenant_id()
        AND auth.role() = 'authenticated'
    );

-- Realtime presence configuration
CREATE TABLE IF NOT EXISTS shared.presence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES shared.users(id),
    tenant_id UUID NOT NULL REFERENCES shared.tenants(id),
    channel TEXT NOT NULL,
    status TEXT DEFAULT 'online',
    metadata JSONB DEFAULT '{}',
    last_seen TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE shared.presence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Presence tenant isolation" ON shared.presence
    USING (tenant_id = get_current_tenant_id());
```

### Real-time Functions
```sql
-- Real-time notification function
CREATE OR REPLACE FUNCTION notify_realtime_changes()
RETURNS TRIGGER AS $$
DECLARE
    notification_payload JSONB;
BEGIN
    notification_payload := jsonb_build_object(
        'table', TG_TABLE_NAME,
        'schema', TG_TABLE_SCHEMA,
        'operation', TG_OP,
        'tenant_id', COALESCE(NEW.tenant_id, OLD.tenant_id),
        'timestamp', NOW()
    );
    
    IF TG_OP = 'DELETE' THEN
        notification_payload := notification_payload || jsonb_build_object('old', to_jsonb(OLD));
    ELSE
        notification_payload := notification_payload || jsonb_build_object('new', to_jsonb(NEW));
    END IF;
    
    PERFORM pg_notify('realtime_changes', notification_payload::text);
    
    RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to relevant tables
CREATE TRIGGER realtime_changes_trigger
    AFTER INSERT OR UPDATE OR DELETE ON shared.customers
    FOR EACH ROW EXECUTE FUNCTION notify_realtime_changes();

CREATE TRIGGER realtime_changes_trigger
    AFTER INSERT OR UPDATE OR DELETE ON home_services.work_orders
    FOR EACH ROW EXECUTE FUNCTION notify_realtime_changes();
```

## Storage Configuration

### Bucket Setup
```sql
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('avatars', 'avatars', true, 5242880, '{"image/jpeg", "image/png", "image/webp"}'),
    ('documents', 'documents', false, 52428800, '{"application/pdf", "image/jpeg", "image/png", "text/plain"}'),
    ('attachments', 'attachments', false, 104857600, '{"*"}')
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Avatar uploads" ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'avatars'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = (auth.jwt() ->> 'tenant_id')::text
    );

CREATE POLICY "Avatar access" ON storage.objects
    FOR SELECT
    USING (
        bucket_id = 'avatars'
        AND (
            -- Public avatars can be viewed by anyone
            auth.role() = 'anon'
            OR (
                auth.role() = 'authenticated'
                AND (storage.foldername(name))[1] = (auth.jwt() ->> 'tenant_id')::text
            )
        )
    );

CREATE POLICY "Document access" ON storage.objects
    FOR ALL
    USING (
        bucket_id IN ('documents', 'attachments')
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = (auth.jwt() ->> 'tenant_id')::text
    );
```

## Edge Functions Configuration

### Function Deployment
```typescript
// supabase/functions/business-automation/index.ts
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface RequestBody {
  action: string;
  tenant_id: string;
  data: Record<string, any>;
}

serve(async (req: Request) => {
  // CORS handling
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { action, tenant_id, data } = await req.json() as RequestBody;

    // Set tenant context
    await supabase.rpc('set_config', {
      setting_name: 'app.current_tenant_id',
      setting_value: tenant_id
    });

    // Process business automation request
    const result = await processBusinessAction(supabase, action, data);

    return new Response(JSON.stringify(result), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
    });

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
    });
  }
});

async function processBusinessAction(
  supabase: any, 
  action: string, 
  data: Record<string, any>
) {
  switch (action) {
    case 'create_work_order':
      return await createWorkOrder(supabase, data);
    case 'update_customer':
      return await updateCustomer(supabase, data);
    default:
      throw new Error(`Unknown action: ${action}`);
  }
}
```

## Monitoring and Observability

### Database Monitoring
```sql
-- Performance monitoring queries
CREATE OR REPLACE VIEW database_performance AS
SELECT
    schemaname,
    tablename,
    seq_scan,
    seq_tup_read,
    idx_scan,
    idx_tup_fetch,
    n_tup_ins,
    n_tup_upd,
    n_tup_del,
    n_live_tup,
    n_dead_tup,
    vacuum_count,
    autovacuum_count,
    analyze_count,
    autoanalyze_count
FROM pg_stat_user_tables
ORDER BY seq_tup_read DESC;

-- Slow query monitoring
CREATE OR REPLACE VIEW slow_queries AS
SELECT
    query,
    calls,
    total_exec_time,
    total_exec_time / calls AS avg_exec_time,
    rows / calls AS avg_rows,
    100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 50;

-- Connection monitoring
CREATE OR REPLACE VIEW connection_stats AS
SELECT
    datname,
    usename,
    application_name,
    client_addr,
    state,
    COUNT(*) as connection_count,
    MAX(NOW() - query_start) as max_query_duration
FROM pg_stat_activity
WHERE pid <> pg_backend_pid()
GROUP BY datname, usename, application_name, client_addr, state
ORDER BY connection_count DESC;
```

### Custom Metrics Collection
```sql
-- Custom metrics table
CREATE TABLE IF NOT EXISTS shared.metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES shared.tenants(id),
    metric_name TEXT NOT NULL,
    metric_value NUMERIC NOT NULL,
    dimensions JSONB DEFAULT '{}',
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Metrics collection function
CREATE OR REPLACE FUNCTION collect_business_metrics()
RETURNS VOID AS $$
DECLARE
    tenant_rec RECORD;
    metric_value NUMERIC;
BEGIN
    -- Collect metrics for each tenant
    FOR tenant_rec IN SELECT id, industry FROM shared.tenants LOOP
        -- Work order metrics
        IF tenant_rec.industry = 'home_services' THEN
            SELECT COUNT(*) INTO metric_value
            FROM home_services.work_orders
            WHERE tenant_id = tenant_rec.id
            AND created_at >= NOW() - INTERVAL '24 hours';
            
            INSERT INTO shared.metrics (tenant_id, metric_name, metric_value)
            VALUES (tenant_rec.id, 'daily_work_orders', metric_value);
        END IF;
        
        -- Customer metrics
        SELECT COUNT(*) INTO metric_value
        FROM shared.customers
        WHERE tenant_id = tenant_rec.id
        AND created_at >= NOW() - INTERVAL '24 hours';
        
        INSERT INTO shared.metrics (tenant_id, metric_name, metric_value)
        VALUES (tenant_rec.id, 'daily_new_customers', metric_value);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Schedule metrics collection
SELECT cron.schedule('collect-metrics', '0 */6 * * *', 'SELECT collect_business_metrics();');
```

## Backup and Recovery

### Backup Configuration
```bash
#!/bin/bash
# Automated backup script

# Configuration
SUPABASE_PROJECT_ID="your-project-id"
SUPABASE_DB_PASSWORD="your-db-password"
BACKUP_RETENTION_DAYS=30
BACKUP_DIR="/backups/supabase"

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"

pg_dump "postgresql://postgres:$SUPABASE_DB_PASSWORD@db.$SUPABASE_PROJECT_ID.supabase.co:5432/postgres" \
    --verbose \
    --format=plain \
    --no-owner \
    --no-privileges \
    --exclude-schema=auth \
    --exclude-schema=storage \
    --exclude-schema=realtime \
    > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Upload to cloud storage
aws s3 cp $BACKUP_FILE.gz s3://thorbis-backups/database/

# Cleanup old backups
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +$BACKUP_RETENTION_DAYS -delete

echo "Backup completed: $BACKUP_FILE.gz"
```

### Point-in-Time Recovery
```sql
-- Create recovery points for critical operations
CREATE OR REPLACE FUNCTION create_recovery_checkpoint(
    checkpoint_name TEXT,
    description TEXT DEFAULT NULL
) RETURNS TEXT AS $$
DECLARE
    checkpoint_id UUID;
BEGIN
    checkpoint_id := uuid_generate_v4();
    
    INSERT INTO shared.recovery_checkpoints (
        id, name, description, created_at
    ) VALUES (
        checkpoint_id, checkpoint_name, description, NOW()
    );
    
    -- Create database checkpoint
    CHECKPOINT;
    
    RETURN checkpoint_id::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Environment Configuration

### Development Environment
```env
# Development environment variables
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=your-dev-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-dev-service-role-key

# Database settings
DATABASE_URL=postgresql://postgres:postgres@localhost:54321/postgres
DATABASE_POOL_SIZE=10
DATABASE_TIMEOUT=30000

# Realtime settings
REALTIME_ENABLED=true
REALTIME_DEBUG=true

# Storage settings  
STORAGE_BACKEND=local
STORAGE_FILE_SIZE_LIMIT=10485760
```

### Production Environment
```env
# Production environment variables
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-prod-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-prod-service-role-key

# Database settings
DATABASE_POOL_SIZE=25
DATABASE_TIMEOUT=10000
DATABASE_SSL_MODE=require

# Realtime settings
REALTIME_ENABLED=true
REALTIME_DEBUG=false
REALTIME_MAX_CONNECTIONS=1000

# Storage settings
STORAGE_BACKEND=s3
STORAGE_FILE_SIZE_LIMIT=52428800
STORAGE_CDN_URL=https://cdn.thorbis.com
```

## Best Practices

### Security Best Practices
- **RLS Everywhere**: Enable RLS on all tenant-related tables
- **Least Privilege**: Grant minimum necessary permissions
- **JWT Security**: Secure JWT secret management and rotation
- **Input Validation**: Validate all inputs at database level
- **Audit Logging**: Comprehensive audit trail for sensitive operations

### Performance Best Practices
- **Indexing Strategy**: Proper indexing for tenant isolation and queries
- **Connection Pooling**: Optimize connection pool settings
- **Query Optimization**: Monitor and optimize slow queries
- **Caching**: Implement appropriate caching strategies
- **Monitoring**: Continuous performance monitoring

### Operational Best Practices
- **Backup Strategy**: Regular automated backups with testing
- **Monitoring**: Comprehensive monitoring and alerting
- **Documentation**: Keep configuration documentation current
- **Version Control**: Version control for schema changes
- **Testing**: Test all changes in staging environment

## Troubleshooting

### Common Issues
- **Connection Timeouts**: Connection pool exhaustion
- **Performance Issues**: Missing indexes or slow queries
- **RLS Problems**: Policy conflicts or missing policies
- **Migration Errors**: Schema change conflicts
- **Realtime Issues**: WebSocket connection problems

### Diagnostic Queries
```sql
-- Check active connections
SELECT * FROM pg_stat_activity WHERE state = 'active';

-- Identify blocking queries
SELECT blocked_locks.pid AS blocked_pid,
       blocked_activity.usename AS blocked_user,
       blocking_locks.pid AS blocking_pid,
       blocking_activity.usename AS blocking_user,
       blocked_activity.query AS blocked_statement,
       blocking_activity.query AS current_statement_in_blocking_process
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks ON blocking_locks.locktype = blocked_locks.locktype
JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted;

-- Check table statistics
SELECT schemaname, tablename, n_live_tup, n_dead_tup, 
       last_vacuum, last_autovacuum, last_analyze, last_autoanalyze
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC;
```

---

*This Supabase configuration guide ensures optimal performance, security, and scalability for the Thorbis Business OS database and backend services.*