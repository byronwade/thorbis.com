# Database Documentation

> **Version**: 1.0.0  
> **Last Updated**: January 2025  
> **Target Audience**: Database Administrators, Backend Developers, System Engineers  

## Overview

This documentation provides comprehensive guidance for the database architecture, schema design, and operational procedures for the Thorbis Business OS platform. Built on PostgreSQL with Supabase, the database implements multi-tenant architecture with industry-separated schemas and comprehensive security controls.

## Database Architecture

### Multi-Tenant Design Philosophy
```typescript
interface DatabaseArchitecture {
  tenancy: {
    model: 'Multi-tenant with industry separation',
    isolation: 'Row Level Security (RLS) for tenant data isolation',
    schema: 'Industry-specific schemas for business logic separation',
    sharing: 'Shared utilities and common tables'
  },
  
  industries: {
    homeServices: 'home_services schema for dispatch and field service',
    restaurants: 'restaurants schema for POS and kitchen operations',
    automotive: 'automotive schema for repair orders and inventory',
    retail: 'retail schema for point of sale and inventory',
    shared: 'shared schema for common entities (users, customers, tenants)'
  },
  
  security: {
    rls: 'Row Level Security policies on all tenant tables',
    encryption: 'Column-level encryption for sensitive data',
    audit: 'Comprehensive audit logging for all data changes',
    backup: 'Encrypted backups with point-in-time recovery'
  }
}
```

### Schema Organization
```sql
-- Database schema structure
SELECT 
    schema_name,
    schema_owner,
    CASE schema_name
        WHEN 'shared' THEN 'Common entities: tenants, users, customers, billing'
        WHEN 'home_services' THEN 'Work orders, technicians, service calls, equipment'
        WHEN 'restaurants' THEN 'Orders, menu items, tables, kitchen operations'
        WHEN 'automotive' THEN 'Repair orders, vehicles, parts inventory'
        WHEN 'retail' THEN 'Products, sales, inventory, customer loyalty'
        WHEN 'rbac' THEN 'Role-based access control system'
        WHEN 'audit' THEN 'Security and data change audit logs'
        WHEN 'gdpr' THEN 'GDPR compliance and data protection'
        WHEN 'analytics' THEN 'Business intelligence and reporting'
        ELSE 'System or extension schema'
    END as description
FROM information_schema.schemata
WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
ORDER BY schema_name;
```

## Documentation Structure

### [Database Migrations](./MIGRATIONS.md)
Schema evolution and version control:
- **Migration Strategy**: Forward-only migrations with rollback procedures
- **Version Control**: Git-based migration tracking and deployment
- **Environment Management**: Development, staging, production migration procedures
- **Data Migration**: Safe data transformation and migration procedures
- **Rollback Procedures**: Emergency rollback and recovery procedures

### [Database Functions](./FUNCTIONS.md)
Stored procedures and database functions:
- **Business Logic Functions**: Core business rule implementations
- **Utility Functions**: Helper functions for common operations
- **Trigger Functions**: Event-driven data processing functions
- **Security Functions**: Authentication and authorization helpers
- **Analytics Functions**: Data aggregation and reporting functions

### [Database Triggers](./TRIGGERS.md)
Event-driven database automation:
- **Audit Triggers**: Automatic audit logging for data changes
- **Validation Triggers**: Data validation and constraint enforcement
- **Notification Triggers**: Real-time event notifications
- **Maintenance Triggers**: Automatic cleanup and maintenance tasks
- **Business Rule Triggers**: Complex business logic enforcement

### [Database Policies](./POLICIES.md)
Row Level Security and access control:
- **Tenant Isolation Policies**: Multi-tenant data separation
- **Role-Based Policies**: User role and permission enforcement
- **Industry-Specific Policies**: Business-specific access rules
- **Time-Based Policies**: Temporal access restrictions
- **Data Sensitivity Policies**: Protection for sensitive information

### [Database Views](./VIEWS.md)
Query optimization and data abstraction:
- **Business Views**: Industry-specific business logic views
- **Reporting Views**: Pre-aggregated data for analytics
- **Security Views**: Filtered and masked data views
- **Integration Views**: API-ready data presentations
- **Administrative Views**: System monitoring and management

### [Database Indexes](./INDEXES.md)
Performance optimization and query acceleration:
- **Primary Indexes**: Unique identification and relationships
- **Performance Indexes**: Query optimization for common patterns
- **Composite Indexes**: Multi-column query optimization
- **Partial Indexes**: Conditional indexing for specific use cases
- **Full-Text Indexes**: Search optimization for text content

## Core Database Concepts

### Tenant Isolation Strategy
```sql
-- Tenant isolation implementation
-- 1. Every tenant-related table includes tenant_id
-- 2. RLS policies enforce tenant boundary
-- 3. Application sets tenant context per request

-- Example tenant-isolated table
CREATE TABLE shared.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES shared.tenants(id) ON DELETE CASCADE,
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

-- Enable RLS
ALTER TABLE shared.customers ENABLE ROW LEVEL SECURITY;

-- Tenant isolation policy
CREATE POLICY "tenant_isolation_customers" ON shared.customers
    USING (tenant_id = get_current_tenant_id());

-- Tenant context function
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID AS $$
BEGIN
    RETURN COALESCE(
        -- From explicit session variable
        (current_setting('app.current_tenant_id', true))::uuid,
        -- From JWT token
        (auth.jwt() ->> 'tenant_id')::uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Industry Schema Separation
```sql
-- Industry-specific table examples

-- Home Services: Work Orders
CREATE TABLE home_services.work_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES shared.tenants(id),
    customer_id UUID NOT NULL REFERENCES shared.customers(id),
    technician_id UUID REFERENCES shared.users(id),
    service_type TEXT NOT NULL,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'in_progress', 'completed', 'cancelled')),
    scheduled_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    estimated_duration INTERVAL,
    actual_duration INTERVAL,
    service_address JSONB,
    notes TEXT,
    internal_notes TEXT,
    equipment JSONB DEFAULT '[]',
    parts_used JSONB DEFAULT '[]',
    labor_cost DECIMAL(10,2) DEFAULT 0.00,
    parts_cost DECIMAL(10,2) DEFAULT 0.00,
    total_cost DECIMAL(10,2) DEFAULT 0.00,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Restaurant: Orders
CREATE TABLE restaurants.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES shared.tenants(id),
    order_number SERIAL,
    table_number INTEGER,
    customer_id UUID REFERENCES shared.customers(id),
    server_id UUID REFERENCES shared.users(id),
    order_type TEXT DEFAULT 'dine_in' CHECK (order_type IN ('dine_in', 'takeout', 'delivery', 'online')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'served', 'paid', 'cancelled')),
    items JSONB NOT NULL DEFAULT '[]',
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    tip_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    payment_method TEXT,
    payment_status TEXT DEFAULT 'pending',
    special_instructions TEXT,
    estimated_ready_time TIMESTAMPTZ,
    served_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Automotive: Repair Orders
CREATE TABLE automotive.repair_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES shared.tenants(id),
    customer_id UUID NOT NULL REFERENCES shared.customers(id),
    vehicle_id UUID NOT NULL REFERENCES automotive.vehicles(id),
    technician_id UUID REFERENCES shared.users(id),
    order_number SERIAL,
    status TEXT DEFAULT 'estimate' CHECK (status IN ('estimate', 'approved', 'in_progress', 'completed', 'delivered')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    complaint_description TEXT NOT NULL,
    diagnosis TEXT,
    recommended_services JSONB DEFAULT '[]',
    approved_services JSONB DEFAULT '[]',
    parts_needed JSONB DEFAULT '[]',
    labor_hours DECIMAL(5,2) DEFAULT 0.00,
    labor_rate DECIMAL(7,2) DEFAULT 0.00,
    parts_cost DECIMAL(10,2) DEFAULT 0.00,
    estimated_total DECIMAL(10,2) DEFAULT 0.00,
    final_total DECIMAL(10,2) DEFAULT 0.00,
    mileage_in INTEGER,
    mileage_out INTEGER,
    drop_off_date TIMESTAMPTZ,
    promised_date TIMESTAMPTZ,
    completed_date TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Common Table Patterns
```sql
-- Standard table structure patterns used across all tables

-- 1. Base columns for all entities
-- id: UUID primary key with auto-generation
-- tenant_id: Foreign key for multi-tenant isolation (where applicable)
-- created_at: Timestamp of creation
-- updated_at: Timestamp of last modification

-- 2. Soft delete pattern (optional)
-- deleted_at: Timestamp of deletion (NULL for active records)

-- 3. Audit trail pattern (optional)
-- created_by: User who created the record
-- updated_by: User who last modified the record

-- 4. Metadata pattern
-- metadata: JSONB column for extensible data

-- Example implementation
CREATE TABLE example_table (
    -- Base columns
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES shared.tenants(id) ON DELETE CASCADE,
    
    -- Business-specific columns
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active',
    
    -- Extensible metadata
    metadata JSONB DEFAULT '{}',
    
    -- Audit columns
    created_by UUID REFERENCES shared.users(id),
    updated_by UUID REFERENCES shared.users(id),
    
    -- Timestamp columns
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ -- NULL for active records
);

-- RLS and constraints
ALTER TABLE example_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON example_table
    USING (tenant_id = get_current_tenant_id());

-- Indexes for performance
CREATE INDEX idx_example_table_tenant_status ON example_table(tenant_id, status)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_example_table_created_at ON example_table(created_at)
    WHERE deleted_at IS NULL;

-- Update trigger for updated_at
CREATE TRIGGER set_updated_at_example_table
    BEFORE UPDATE ON example_table
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at_column();
```

## Data Types and Standards

### Standard Data Types
```sql
-- Common data types used throughout the schema

-- Identifiers
-- UUID: All primary keys and foreign key references
-- SERIAL/BIGSERIAL: Sequential numbers (order numbers, invoice numbers)

-- Text and Characters
-- TEXT: Variable length text (preferred over VARCHAR)
-- CHAR(n): Fixed length (codes, statuses with fixed format)

-- Numeric Types
-- DECIMAL(precision, scale): Monetary amounts, precise calculations
-- INTEGER/BIGINT: Counts, quantities, IDs
-- REAL/DOUBLE PRECISION: Measurements, ratios (less precise)

-- Date and Time
-- TIMESTAMPTZ: All datetime values (timezone-aware)
-- DATE: Date-only values
-- TIME: Time-only values
-- INTERVAL: Duration values

-- Structured Data
-- JSONB: Flexible/extensible data, metadata, settings
-- ARRAY: Lists of values of same type
-- ENUM: Predefined value sets

-- Boolean
-- BOOLEAN: True/false values

-- Network and Specialized
-- INET: IP addresses
-- UUID: Unique identifiers
-- BYTEA: Binary data
```

### Naming Conventions
```sql
-- Database naming conventions

-- Tables: snake_case, plural nouns
-- Examples: users, work_orders, repair_estimates

-- Columns: snake_case, descriptive names
-- Examples: first_name, created_at, tenant_id

-- Primary Keys: Always 'id'
-- Foreign Keys: [referenced_table]_id (e.g., customer_id, user_id)

-- Indexes: idx_[table]_[columns] or idx_[table]_[purpose]
-- Examples: idx_users_email, idx_work_orders_tenant_status

-- Constraints: [table]_[column]_[type]
-- Examples: users_email_unique, orders_status_check

-- Functions: snake_case with verb prefix
-- Examples: get_current_tenant_id(), calculate_order_total()

-- Triggers: [event]_[table]_[purpose]
-- Examples: update_work_orders_timestamp, audit_customer_changes

-- Policies: [table]_[purpose] or descriptive name
-- Examples: tenant_isolation_customers, admin_full_access
```

## Performance Optimization

### Indexing Strategy
```sql
-- Performance indexing patterns

-- 1. Tenant isolation indexes (most important)
-- Every tenant-filtered query needs these
CREATE INDEX idx_table_tenant_id ON table_name(tenant_id);

-- 2. Composite indexes for common query patterns
-- Status filtering within tenant
CREATE INDEX idx_work_orders_tenant_status 
    ON home_services.work_orders(tenant_id, status)
    WHERE deleted_at IS NULL;

-- Date range queries with tenant
CREATE INDEX idx_orders_tenant_created 
    ON restaurants.orders(tenant_id, created_at DESC);

-- 3. Partial indexes for specific conditions
-- Active records only (very common pattern)
CREATE INDEX idx_customers_tenant_active 
    ON shared.customers(tenant_id, email)
    WHERE deleted_at IS NULL;

-- 4. Full-text search indexes
-- Search across multiple text columns
CREATE INDEX idx_customers_search 
    ON shared.customers 
    USING gin(to_tsvector('english', first_name || ' ' || last_name || ' ' || COALESCE(email, '')));

-- 5. JSON/JSONB indexes
-- Queries on specific JSON keys
CREATE INDEX idx_work_orders_metadata_priority 
    ON home_services.work_orders 
    USING gin((metadata -> 'priority'));

-- 6. Unique constraints and indexes
-- Business rules enforcement
CREATE UNIQUE INDEX idx_users_tenant_email 
    ON shared.users(tenant_id, email)
    WHERE deleted_at IS NULL;
```

### Query Optimization Patterns
```sql
-- Common optimized query patterns

-- 1. Tenant-scoped queries (always filter by tenant first)
SELECT wo.*, c.first_name, c.last_name
FROM home_services.work_orders wo
JOIN shared.customers c ON c.id = wo.customer_id
WHERE wo.tenant_id = $1  -- Tenant filter first
  AND wo.status = 'pending'
  AND wo.created_at >= NOW() - INTERVAL '7 days'
ORDER BY wo.created_at DESC
LIMIT 50;

-- 2. Efficient counting with window functions
SELECT 
    status,
    COUNT(*) as count,
    COUNT(*) * 100.0 / SUM(COUNT(*)) OVER() as percentage
FROM home_services.work_orders
WHERE tenant_id = $1
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY status;

-- 3. Efficient pagination with cursor-based pagination
SELECT *
FROM shared.customers
WHERE tenant_id = $1
  AND (created_at, id) > ($2, $3)  -- Cursor values
  AND deleted_at IS NULL
ORDER BY created_at, id
LIMIT 25;

-- 4. Efficient aggregation with proper GROUP BY
SELECT 
    DATE_TRUNC('day', created_at) as day,
    status,
    COUNT(*) as order_count,
    SUM(total_amount) as revenue
FROM restaurants.orders
WHERE tenant_id = $1
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at), status
ORDER BY day DESC, status;
```

## Security and Compliance

### Row Level Security Implementation
```sql
-- Comprehensive RLS implementation

-- 1. Base tenant isolation (applied to all tenant tables)
CREATE POLICY "tenant_isolation" ON table_name
    USING (tenant_id = get_current_tenant_id());

-- 2. Role-based access with tenant isolation
CREATE POLICY "admin_full_access" ON shared.customers
    FOR ALL
    USING (
        tenant_id = get_current_tenant_id() 
        AND has_permission(auth.uid(), 'customers', 'admin')
    );

CREATE POLICY "employee_read_customers" ON shared.customers
    FOR SELECT
    USING (
        tenant_id = get_current_tenant_id()
        AND has_permission(auth.uid(), 'customers', 'read')
    );

-- 3. User-specific access (users can see their own data)
CREATE POLICY "users_own_data" ON shared.users
    FOR ALL
    USING (
        tenant_id = get_current_tenant_id()
        AND (
            id = auth.uid() 
            OR has_permission(auth.uid(), 'users', 'admin')
        )
    );

-- 4. Time-based access policies
CREATE POLICY "business_hours_access" ON home_services.work_orders
    FOR SELECT
    USING (
        tenant_id = get_current_tenant_id()
        AND (
            has_permission(auth.uid(), 'work_orders', 'admin')
            OR EXTRACT(HOUR FROM NOW() AT TIME ZONE 'UTC') BETWEEN 6 AND 22
        )
    );

-- 5. Data sensitivity policies
CREATE POLICY "sensitive_customer_data" ON shared.customers
    FOR ALL
    USING (
        tenant_id = get_current_tenant_id()
        AND (
            has_permission(auth.uid(), 'customers', 'admin')
            OR (
                has_permission(auth.uid(), 'customers', 'read')
                AND NOT (settings ? 'pii_restricted')
            )
        )
    );
```

### Data Encryption and Protection
```sql
-- Sensitive data encryption patterns

-- 1. Column-level encryption for PII
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Function to encrypt sensitive data
CREATE OR REPLACE FUNCTION encrypt_pii(plaintext TEXT)
RETURNS TEXT AS $$
BEGIN
    IF plaintext IS NULL OR plaintext = '' THEN
        RETURN NULL;
    END IF;
    
    RETURN encode(
        pgp_sym_encrypt(
            plaintext, 
            current_setting('app.encryption_key'),
            'compress-algo=1, cipher-algo=aes256'
        ),
        'base64'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrypt sensitive data
CREATE OR REPLACE FUNCTION decrypt_pii(ciphertext TEXT)
RETURNS TEXT AS $$
BEGIN
    IF ciphertext IS NULL OR ciphertext = '' THEN
        RETURN NULL;
    END IF;
    
    RETURN pgp_sym_decrypt(
        decode(ciphertext, 'base64'),
        current_setting('app.encryption_key')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Transparent encryption triggers
CREATE OR REPLACE FUNCTION encrypt_customer_pii()
RETURNS TRIGGER AS $$
BEGIN
    -- Encrypt email if it's being inserted/updated
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.email IS DISTINCT FROM OLD.email) THEN
        NEW.email_encrypted = encrypt_pii(NEW.email);
    END IF;
    
    -- Encrypt phone if it's being inserted/updated
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.phone IS DISTINCT FROM OLD.phone) THEN
        NEW.phone_encrypted = encrypt_pii(NEW.phone);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply encryption trigger
CREATE TRIGGER encrypt_customer_pii_trigger
    BEFORE INSERT OR UPDATE ON shared.customers
    FOR EACH ROW EXECUTE FUNCTION encrypt_customer_pii();
```

## Backup and Recovery

### Backup Strategy
```bash
#!/bin/bash
# Comprehensive database backup script

# Configuration
BACKUP_DIR="/var/backups/postgresql"
RETENTION_DAYS=30
COMPRESS=true
ENCRYPT=true

# Create timestamped backup
backup_database() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$BACKUP_DIR/backup_$timestamp.sql"
    
    echo "Starting database backup: $backup_file"
    
    # Full database backup with specific options
    pg_dump \
        --host="$DB_HOST" \
        --port="$DB_PORT" \
        --username="$DB_USER" \
        --dbname="$DB_NAME" \
        --verbose \
        --format=plain \
        --no-owner \
        --no-privileges \
        --exclude-schema=information_schema \
        --exclude-schema=pg_catalog \
        --exclude-table-data=audit.security_events \
        > "$backup_file"
    
    if [ $? -eq 0 ]; then
        echo "Backup completed successfully"
        
        # Compress if enabled
        if [ "$COMPRESS" = true ]; then
            gzip "$backup_file"
            backup_file="${backup_file}.gz"
            echo "Backup compressed: $backup_file"
        fi
        
        # Encrypt if enabled
        if [ "$ENCRYPT" = true ]; then
            gpg --symmetric --cipher-algo AES256 --output "${backup_file}.gpg" "$backup_file"
            rm "$backup_file"
            backup_file="${backup_file}.gpg"
            echo "Backup encrypted: $backup_file"
        fi
        
        # Upload to cloud storage
        upload_backup "$backup_file"
        
        # Cleanup old backups
        cleanup_old_backups
        
    else
        echo "Backup failed!"
        exit 1
    fi
}

# Upload backup to cloud storage
upload_backup() {
    local backup_file="$1"
    local cloud_path="s3://thorbis-backups/database/$(basename $backup_file)"
    
    aws s3 cp "$backup_file" "$cloud_path" --storage-class GLACIER
    
    if [ $? -eq 0 ]; then
        echo "Backup uploaded to cloud: $cloud_path"
    else
        echo "Cloud upload failed!"
    fi
}

# Cleanup old backups
cleanup_old_backups() {
    find "$BACKUP_DIR" -name "backup_*.sql*" -mtime +$RETENTION_DAYS -delete
    echo "Cleaned up backups older than $RETENTION_DAYS days"
}

# Point-in-time recovery preparation
create_recovery_info() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local recovery_file="$BACKUP_DIR/recovery_info_$timestamp.json"
    
    cat > "$recovery_file" << EOF
{
    "backup_time": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "wal_position": "$(psql -t -c "SELECT pg_current_wal_lsn();")",
    "database_version": "$(psql -t -c "SELECT version();")",
    "schema_versions": {
$(psql -t -c "SELECT json_agg(json_build_object('schema', schemaname, 'tables', table_count)) FROM (SELECT schemaname, count(*) as table_count FROM pg_tables WHERE schemaname NOT IN ('information_schema', 'pg_catalog') GROUP BY schemaname) t;")
    }
}
EOF
    
    echo "Recovery information saved: $recovery_file"
}

# Execute backup
backup_database
create_recovery_info
```

## Best Practices

### Schema Design
- **Consistent Naming**: Follow established naming conventions throughout
- **Tenant Isolation**: Every tenant-related table must include tenant_id
- **RLS Everywhere**: Enable RLS on all tenant-isolated tables  
- **Audit Trail**: Include created_at, updated_at on all tables
- **Soft Deletes**: Use deleted_at for recoverable deletions

### Performance
- **Index Strategy**: Index all foreign keys and frequent query patterns
- **Query Optimization**: Always filter by tenant_id first in queries
- **Connection Pooling**: Use connection pooling for scalability
- **Monitoring**: Monitor slow queries and optimize regularly
- **Partitioning**: Consider partitioning for very large tables

### Security
- **Principle of Least Privilege**: Grant minimum necessary permissions
- **Input Validation**: Validate all inputs at database level
- **Encryption**: Encrypt sensitive data at rest and in transit
- **Audit Logging**: Comprehensive audit trail for sensitive operations
- **Regular Updates**: Keep database and extensions updated

## Troubleshooting

### Common Database Issues
- **Connection Exhaustion**: Too many database connections
- **Slow Queries**: Missing indexes or inefficient queries
- **Lock Contention**: Blocking queries and deadlocks
- **RLS Policy Conflicts**: Conflicting or overly restrictive policies
- **Migration Failures**: Schema change conflicts or data issues

### Diagnostic Queries
```sql
-- Check database connections
SELECT pid, usename, application_name, client_addr, state, query_start, query
FROM pg_stat_activity 
WHERE state = 'active' AND pid <> pg_backend_pid()
ORDER BY query_start;

-- Identify slow queries
SELECT query, calls, total_exec_time, total_exec_time/calls as avg_time, rows
FROM pg_stat_statements 
ORDER BY total_exec_time DESC 
LIMIT 10;

-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
    pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
FROM pg_tables 
WHERE schemaname NOT IN ('information_schema', 'pg_catalog')
ORDER BY size_bytes DESC;

-- Check index usage
SELECT 
    schemaname, 
    tablename, 
    indexname, 
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes 
ORDER BY idx_scan DESC;

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
ORDER BY schemaname, tablename, policyname;
```

---

*This database documentation ensures reliable, secure, and high-performance data management for the Thorbis Business OS platform.*