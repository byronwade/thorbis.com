# Database Migrations Guide

> **Version**: 1.0.0  
> **Last Updated**: January 2025  
> **Target Audience**: Database Administrators, Backend Developers, DevOps Engineers  

## Overview

This guide covers database schema evolution through migrations for the Thorbis Business OS platform. Migrations ensure consistent, versioned, and reversible database schema changes across all environments while maintaining data integrity and zero-downtime deployments.

## Migration Strategy

### Forward-Only Philosophy
```typescript
interface MigrationStrategy {
  approach: 'Forward-only migrations with rollback procedures';
  versioning: 'Sequential timestamped migration files';
  environments: 'Consistent migration path: dev → staging → production';
  rollback: 'Emergency rollback procedures with data preservation';
  testing: 'Comprehensive testing in staging before production';
}
```

### Migration File Structure
```bash
# Migration file naming convention
# Format: YYYYMMDDHHMMSS_descriptive_migration_name.sql
# Example: 20250115143000_add_customer_preferences_table.sql

migrations/
├── 20250101120000_initial_schema_setup.sql
├── 20250102140000_add_rbac_system.sql
├── 20250103160000_add_audit_logging.sql
├── 20250104100000_add_home_services_schema.sql
├── 20250104110000_add_restaurant_schema.sql
├── 20250104120000_add_automotive_schema.sql
├── 20250104130000_add_retail_schema.sql
├── 20250105090000_add_customer_preferences.sql
├── 20250106140000_add_work_order_scheduling.sql
├── 20250107110000_optimize_customer_indexes.sql
├── 20250108150000_add_payment_processing.sql
└── rollbacks/
    ├── 20250108150000_rollback_payment_processing.sql
    └── 20250107110000_rollback_customer_indexes.sql
```

## Migration Templates

### Schema Creation Template
```sql
-- Migration: 20250115143000_add_inventory_management.sql
-- Description: Add inventory management tables for retail operations
-- Author: Database Team
-- Date: 2025-01-15

-- Ensure we're in the correct database
\c thorbis_business_os;

-- Start transaction for atomicity
BEGIN;

-- Set migration metadata
INSERT INTO shared.migration_log (
    version, 
    name, 
    description, 
    started_at
) VALUES (
    '20250115143000',
    'add_inventory_management',
    'Add inventory management tables for retail operations',
    NOW()
);

-- Create new schema if needed
CREATE SCHEMA IF NOT EXISTS retail_inventory;

-- Create new tables
CREATE TABLE retail_inventory.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES shared.tenants(id) ON DELETE CASCADE,
    sku TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    brand TEXT,
    cost_price DECIMAL(10,4) NOT NULL DEFAULT 0.00,
    retail_price DECIMAL(10,4) NOT NULL DEFAULT 0.00,
    weight DECIMAL(8,3),
    dimensions JSONB, -- {length, width, height, unit}
    attributes JSONB DEFAULT '{}',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT products_sku_tenant_unique UNIQUE (tenant_id, sku),
    CONSTRAINT products_cost_positive CHECK (cost_price >= 0),
    CONSTRAINT products_price_positive CHECK (retail_price >= 0)
);

CREATE TABLE retail_inventory.stock_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES shared.tenants(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES retail_inventory.products(id) ON DELETE CASCADE,
    location_id UUID REFERENCES shared.locations(id),
    quantity_on_hand INTEGER NOT NULL DEFAULT 0,
    quantity_allocated INTEGER NOT NULL DEFAULT 0,
    quantity_available INTEGER GENERATED ALWAYS AS (quantity_on_hand - quantity_allocated) STORED,
    reorder_level INTEGER DEFAULT 0,
    max_stock_level INTEGER,
    last_counted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT stock_levels_tenant_product_location_unique UNIQUE (tenant_id, product_id, location_id),
    CONSTRAINT stock_levels_quantities_non_negative CHECK (
        quantity_on_hand >= 0 AND 
        quantity_allocated >= 0 AND
        quantity_allocated <= quantity_on_hand
    )
);

-- Enable RLS
ALTER TABLE retail_inventory.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE retail_inventory.stock_levels ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "tenant_isolation_products" ON retail_inventory.products
    USING (tenant_id = get_current_tenant_id());

CREATE POLICY "tenant_isolation_stock_levels" ON retail_inventory.stock_levels
    USING (tenant_id = get_current_tenant_id());

-- Create indexes for performance
CREATE INDEX idx_products_tenant_sku ON retail_inventory.products(tenant_id, sku);
CREATE INDEX idx_products_tenant_category ON retail_inventory.products(tenant_id, category) WHERE active = TRUE;
CREATE INDEX idx_stock_levels_tenant_product ON retail_inventory.stock_levels(tenant_id, product_id);
CREATE INDEX idx_stock_levels_low_stock ON retail_inventory.stock_levels(tenant_id) 
    WHERE quantity_available <= reorder_level;

-- Create triggers
CREATE TRIGGER set_updated_at_products
    BEFORE UPDATE ON retail_inventory.products
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at_column();

CREATE TRIGGER set_updated_at_stock_levels
    BEFORE UPDATE ON retail_inventory.stock_levels
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at_column();

-- Create audit triggers
CREATE TRIGGER audit_products_changes
    AFTER INSERT OR UPDATE OR DELETE ON retail_inventory.products
    FOR EACH ROW
    EXECUTE FUNCTION audit.log_table_changes();

CREATE TRIGGER audit_stock_levels_changes
    AFTER INSERT OR UPDATE OR DELETE ON retail_inventory.stock_levels
    FOR EACH ROW
    EXECUTE FUNCTION audit.log_table_changes();

-- Update migration log
UPDATE shared.migration_log 
SET completed_at = NOW(), status = 'completed'
WHERE version = '20250115143000';

-- Commit transaction
COMMIT;

-- Verify migration
SELECT 
    table_schema, 
    table_name, 
    table_type
FROM information_schema.tables 
WHERE table_schema = 'retail_inventory'
ORDER BY table_name;
```

### Data Migration Template
```sql
-- Migration: 20250115150000_migrate_legacy_customer_data.sql
-- Description: Migrate customer data from legacy format to new structure
-- Author: Database Team
-- Date: 2025-01-15

BEGIN;

-- Set migration metadata
INSERT INTO shared.migration_log (
    version, 
    name, 
    description, 
    started_at
) VALUES (
    '20250115150000',
    'migrate_legacy_customer_data',
    'Migrate customer data from legacy format to new structure',
    NOW()
);

-- Create temporary table for data transformation
CREATE TEMP TABLE legacy_customer_migration AS
SELECT 
    id,
    tenant_id,
    -- Split full_name into first_name and last_name
    CASE 
        WHEN full_name ~ '\s' THEN 
            TRIM(SUBSTRING(full_name FROM '^([^\\s]+)'))
        ELSE full_name
    END as first_name,
    CASE 
        WHEN full_name ~ '\s' THEN 
            TRIM(SUBSTRING(full_name FROM '\s(.+)$'))
        ELSE ''
    END as last_name,
    email,
    phone,
    -- Transform address string to JSONB
    CASE 
        WHEN address_line_1 IS NOT NULL THEN
            jsonb_build_object(
                'street', COALESCE(address_line_1, ''),
                'street2', COALESCE(address_line_2, ''),
                'city', COALESCE(city, ''),
                'state', COALESCE(state, ''),
                'postal_code', COALESCE(postal_code, ''),
                'country', COALESCE(country, 'US')
            )
        ELSE NULL
    END as address_json,
    created_at,
    updated_at
FROM legacy_customers
WHERE migrated = FALSE;

-- Validate data before migration
DO $$
DECLARE
    invalid_count INTEGER;
    total_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_count FROM legacy_customer_migration;
    
    SELECT COUNT(*) INTO invalid_count 
    FROM legacy_customer_migration
    WHERE first_name = '' OR first_name IS NULL;
    
    IF invalid_count > 0 THEN
        RAISE EXCEPTION 'Migration validation failed: % customers have invalid names', invalid_count;
    END IF;
    
    RAISE NOTICE 'Migration validation passed: % customers ready for migration', total_count;
END $$;

-- Perform data migration in batches
DO $$
DECLARE
    batch_size INTEGER := 1000;
    batch_count INTEGER := 0;
    total_migrated INTEGER := 0;
    batch_rec RECORD;
BEGIN
    -- Process in batches to avoid long-running transactions
    FOR batch_rec IN 
        SELECT 
            (ROW_NUMBER() OVER () - 1) / batch_size as batch_num,
            *
        FROM legacy_customer_migration
    LOOP
        -- Insert new customer record
        INSERT INTO shared.customers (
            id,
            tenant_id,
            first_name,
            last_name,
            email,
            phone,
            address,
            created_at,
            updated_at
        ) VALUES (
            batch_rec.id,
            batch_rec.tenant_id,
            batch_rec.first_name,
            batch_rec.last_name,
            batch_rec.email,
            batch_rec.phone,
            batch_rec.address_json,
            batch_rec.created_at,
            batch_rec.updated_at
        ) ON CONFLICT (id) DO NOTHING; -- Skip if already exists
        
        total_migrated := total_migrated + 1;
        
        -- Commit every batch_size records
        IF total_migrated % batch_size = 0 THEN
            batch_count := batch_count + 1;
            RAISE NOTICE 'Migrated batch %: % total customers', batch_count, total_migrated;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Migration completed: % customers migrated', total_migrated;
END $$;

-- Mark legacy records as migrated
UPDATE legacy_customers 
SET migrated = TRUE, migrated_at = NOW()
WHERE id IN (SELECT id FROM legacy_customer_migration);

-- Update migration log
UPDATE shared.migration_log 
SET completed_at = NOW(), status = 'completed'
WHERE version = '20250115150000';

COMMIT;

-- Verification query
SELECT 
    'legacy_customers' as source_table,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE migrated = TRUE) as migrated_count
FROM legacy_customers
UNION ALL
SELECT 
    'shared.customers' as target_table,
    COUNT(*) as total_count,
    NULL as migrated_count
FROM shared.customers;
```

### Index Creation Template
```sql
-- Migration: 20250115155000_optimize_query_performance.sql
-- Description: Add indexes to improve query performance for common operations
-- Author: Database Team
-- Date: 2025-01-15

BEGIN;

-- Set migration metadata
INSERT INTO shared.migration_log (
    version, 
    name, 
    description, 
    started_at
) VALUES (
    '20250115155000',
    'optimize_query_performance',
    'Add indexes to improve query performance for common operations',
    NOW()
);

-- Create indexes concurrently to avoid locking
-- Note: CONCURRENT index creation cannot be used in transactions
-- This template shows the pattern; actual execution may need to be done outside transaction

-- Performance indexes for work orders
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_work_orders_tenant_status_scheduled 
    ON home_services.work_orders(tenant_id, status, scheduled_at)
    WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_work_orders_technician_date
    ON home_services.work_orders(technician_id, scheduled_at)
    WHERE status IN ('scheduled', 'in_progress') AND deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_work_orders_customer_recent
    ON home_services.work_orders(customer_id, created_at DESC)
    WHERE deleted_at IS NULL;

-- Performance indexes for restaurant orders
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_restaurant_orders_tenant_status_table
    ON restaurants.orders(tenant_id, status, table_number)
    WHERE order_type = 'dine_in';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_restaurant_orders_server_date
    ON restaurants.orders(server_id, created_at DESC)
    WHERE status IN ('pending', 'preparing');

-- Performance indexes for customer search
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_tenant_name_search
    ON shared.customers USING gin(
        to_tsvector('english', first_name || ' ' || last_name)
    ) WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_tenant_email_partial
    ON shared.customers(tenant_id, lower(email))
    WHERE deleted_at IS NULL;

-- Performance indexes for audit queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_events_user_time_desc
    ON audit.security_events(user_id, timestamp DESC)
    WHERE result != 'success';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_events_tenant_type_time
    ON audit.security_events(tenant_id, event_type, timestamp DESC);

-- Update migration log
UPDATE shared.migration_log 
SET completed_at = NOW(), status = 'completed'
WHERE version = '20250115155000';

COMMIT;

-- Analyze tables to update statistics
ANALYZE home_services.work_orders;
ANALYZE restaurants.orders;
ANALYZE shared.customers;
ANALYZE audit.security_events;
```

## Migration Execution

### Development Environment
```bash
#!/bin/bash
# Development migration script

DB_HOST="localhost"
DB_PORT="54321"
DB_NAME="postgres"
DB_USER="postgres"
DB_PASSWORD="postgres"

# Function to run migration
run_migration() {
    local migration_file="$1"
    local migration_name=$(basename "$migration_file" .sql)
    
    echo "Running migration: $migration_name"
    
    # Check if migration already applied
    local applied=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c \
        "SELECT EXISTS(SELECT 1 FROM shared.migration_log WHERE version = '${migration_name:0:14}');")
    
    if [ "$applied" = " t" ]; then
        echo "Migration $migration_name already applied, skipping"
        return 0
    fi
    
    # Run migration
    if psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$migration_file"; then
        echo "Migration $migration_name completed successfully"
        return 0
    else
        echo "Migration $migration_name failed!"
        return 1
    fi
}

# Run all pending migrations
for migration_file in migrations/*.sql; do
    if [ -f "$migration_file" ]; then
        run_migration "$migration_file" || exit 1
    fi
done

echo "All migrations completed successfully"
```

### Production Environment
```bash
#!/bin/bash
# Production migration script with safety checks

# Configuration
DB_HOST="$PROD_DB_HOST"
DB_PORT="5432"
DB_NAME="postgres"
DB_USER="$PROD_DB_USER"
DB_PASSWORD="$PROD_DB_PASSWORD"
BACKUP_DIR="/var/backups/pre-migration"

# Safety checks
safety_checks() {
    echo "Performing pre-migration safety checks..."
    
    # Check database connection
    if ! psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1;" > /dev/null 2>&1; then
        echo "ERROR: Cannot connect to database"
        exit 1
    fi
    
    # Check for active connections
    local active_connections=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c \
        "SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active' AND pid <> pg_backend_pid();")
    
    if [ "$active_connections" -gt 10 ]; then
        echo "WARNING: High number of active connections: $active_connections"
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    # Check disk space
    local disk_usage=$(df /var/lib/postgresql/data | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ "$disk_usage" -gt 80 ]; then
        echo "ERROR: Disk usage too high: ${disk_usage}%"
        exit 1
    fi
    
    echo "Safety checks passed"
}

# Create backup before migration
create_backup() {
    echo "Creating pre-migration backup..."
    
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$BACKUP_DIR/pre_migration_$timestamp.sql"
    
    mkdir -p "$BACKUP_DIR"
    
    pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME \
        --format=plain \
        --no-owner \
        --no-privileges \
        --verbose \
        > "$backup_file"
    
    if [ $? -eq 0 ]; then
        gzip "$backup_file"
        echo "Backup created: ${backup_file}.gz"
    else
        echo "ERROR: Backup failed!"
        exit 1
    fi
}

# Run migration with monitoring
run_migration_with_monitoring() {
    local migration_file="$1"
    local migration_name=$(basename "$migration_file" .sql)
    
    echo "Running production migration: $migration_name"
    
    # Start monitoring
    monitor_migration &
    local monitor_pid=$!
    
    # Run migration
    local start_time=$(date +%s)
    if psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$migration_file"; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        echo "Migration $migration_name completed in ${duration}s"
        
        # Stop monitoring
        kill $monitor_pid 2>/dev/null
        return 0
    else
        echo "ERROR: Migration $migration_name failed!"
        kill $monitor_pid 2>/dev/null
        return 1
    fi
}

# Monitor migration progress
monitor_migration() {
    while true; do
        local connections=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c \
            "SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active';")
        local locks=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c \
            "SELECT COUNT(*) FROM pg_locks WHERE NOT granted;")
        
        echo "$(date): Active connections: $connections, Blocked locks: $locks"
        sleep 30
    done
}

# Main execution
main() {
    safety_checks
    create_backup
    
    # Run migrations
    for migration_file in migrations/*.sql; do
        if [ -f "$migration_file" ]; then
            run_migration_with_monitoring "$migration_file" || {
                echo "Migration failed, check backup at $BACKUP_DIR"
                exit 1
            }
        fi
    done
    
    echo "All production migrations completed successfully"
}

main "$@"
```

## Rollback Procedures

### Rollback Template
```sql
-- Rollback: rollbacks/20250115143000_rollback_inventory_management.sql
-- Description: Rollback inventory management tables
-- Author: Database Team
-- Date: 2025-01-15

-- WARNING: This rollback will destroy data!
-- Ensure you have a backup before proceeding

BEGIN;

-- Log rollback start
INSERT INTO shared.migration_log (
    version, 
    name, 
    description, 
    started_at,
    migration_type
) VALUES (
    '20250115143000_rollback',
    'rollback_inventory_management',
    'Rollback inventory management tables - DATA WILL BE LOST',
    NOW(),
    'rollback'
);

-- Remove triggers first
DROP TRIGGER IF EXISTS audit_stock_levels_changes ON retail_inventory.stock_levels;
DROP TRIGGER IF EXISTS audit_products_changes ON retail_inventory.products;
DROP TRIGGER IF EXISTS set_updated_at_stock_levels ON retail_inventory.stock_levels;
DROP TRIGGER IF EXISTS set_updated_at_products ON retail_inventory.products;

-- Remove indexes
DROP INDEX IF EXISTS retail_inventory.idx_stock_levels_low_stock;
DROP INDEX IF EXISTS retail_inventory.idx_stock_levels_tenant_product;
DROP INDEX IF EXISTS retail_inventory.idx_products_tenant_category;
DROP INDEX IF EXISTS retail_inventory.idx_products_tenant_sku;

-- Remove RLS policies
DROP POLICY IF EXISTS "tenant_isolation_stock_levels" ON retail_inventory.stock_levels;
DROP POLICY IF EXISTS "tenant_isolation_products" ON retail_inventory.products;

-- Drop tables (foreign key constraints will prevent drops in wrong order)
DROP TABLE IF EXISTS retail_inventory.stock_levels CASCADE;
DROP TABLE IF EXISTS retail_inventory.products CASCADE;

-- Drop schema if empty
DROP SCHEMA IF EXISTS retail_inventory CASCADE;

-- Update migration log
UPDATE shared.migration_log 
SET completed_at = NOW(), status = 'completed'
WHERE version = '20250115143000_rollback';

-- Mark original migration as rolled back
UPDATE shared.migration_log 
SET status = 'rolled_back', rolled_back_at = NOW()
WHERE version = '20250115143000';

COMMIT;

RAISE NOTICE 'Rollback completed - inventory management tables removed';
```

### Emergency Rollback Script
```bash
#!/bin/bash
# Emergency rollback script

# Configuration
MIGRATION_VERSION="$1"
DB_HOST="$PROD_DB_HOST"
DB_PORT="5432"
DB_NAME="postgres"
DB_USER="$PROD_DB_USER"
DB_PASSWORD="$PROD_DB_PASSWORD"

if [ -z "$MIGRATION_VERSION" ]; then
    echo "Usage: $0 <migration_version>"
    echo "Example: $0 20250115143000"
    exit 1
fi

# Confirm rollback
echo "WARNING: You are about to rollback migration $MIGRATION_VERSION"
echo "This may result in data loss!"
read -p "Are you sure you want to continue? (type 'ROLLBACK' to confirm): " confirmation

if [ "$confirmation" != "ROLLBACK" ]; then
    echo "Rollback cancelled"
    exit 1
fi

# Create emergency backup
echo "Creating emergency backup..."
timestamp=$(date +%Y%m%d_%H%M%S)
backup_file="/var/backups/emergency_rollback_${MIGRATION_VERSION}_${timestamp}.sql"

pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME > "$backup_file"

if [ $? -eq 0 ]; then
    echo "Emergency backup created: $backup_file"
else
    echo "ERROR: Emergency backup failed!"
    exit 1
fi

# Execute rollback
rollback_file="rollbacks/${MIGRATION_VERSION}_rollback.sql"

if [ ! -f "$rollback_file" ]; then
    echo "ERROR: Rollback file not found: $rollback_file"
    exit 1
fi

echo "Executing rollback..."
if psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$rollback_file"; then
    echo "Rollback completed successfully"
    echo "Backup available at: $backup_file"
else
    echo "ERROR: Rollback failed!"
    echo "Emergency backup available at: $backup_file"
    exit 1
fi
```

## Migration Testing

### Test Migration Script
```bash
#!/bin/bash
# Test migrations in isolated environment

# Create test database
create_test_database() {
    local test_db="test_migrations_$(date +%s)"
    
    echo "Creating test database: $test_db"
    createdb -h localhost -p 54321 -U postgres "$test_db"
    
    # Restore from production backup
    if [ -f "production_backup.sql" ]; then
        psql -h localhost -p 54321 -U postgres -d "$test_db" < production_backup.sql
    fi
    
    echo "$test_db"
}

# Test migration
test_migration() {
    local test_db="$1"
    local migration_file="$2"
    
    echo "Testing migration: $(basename $migration_file)"
    
    # Run migration
    if psql -h localhost -p 54321 -U postgres -d "$test_db" -f "$migration_file"; then
        echo "Migration test passed"
        return 0
    else
        echo "Migration test failed"
        return 1
    fi
}

# Cleanup test database
cleanup_test_database() {
    local test_db="$1"
    echo "Cleaning up test database: $test_db"
    dropdb -h localhost -p 54321 -U postgres "$test_db"
}

# Main test execution
main() {
    local test_db=$(create_test_database)
    local failed=0
    
    # Test all migrations
    for migration_file in migrations/*.sql; do
        if [ -f "$migration_file" ]; then
            if ! test_migration "$test_db" "$migration_file"; then
                failed=1
                break
            fi
        fi
    done
    
    cleanup_test_database "$test_db"
    
    if [ $failed -eq 0 ]; then
        echo "All migration tests passed"
        exit 0
    else
        echo "Migration tests failed"
        exit 1
    fi
}

main "$@"
```

## Best Practices

### Migration Development
- **Atomic Changes**: Each migration should be a single, atomic change
- **Backward Compatibility**: Ensure migrations don't break existing code
- **Data Validation**: Always validate data before and after migrations
- **Rollback Planning**: Every migration should have a tested rollback procedure
- **Documentation**: Thoroughly document complex migrations

### Production Safety
- **Staging Testing**: Test all migrations in staging environment first
- **Backup First**: Always create backup before production migrations
- **Off-Peak Timing**: Run migrations during low-traffic periods
- **Monitoring**: Monitor system performance during migration
- **Rollback Ready**: Have rollback procedures tested and ready

### Performance Considerations
- **Batch Processing**: Process large data migrations in batches
- **Index Creation**: Create indexes concurrently to avoid locks
- **Lock Minimization**: Minimize table locks during migrations
- **Resource Monitoring**: Monitor CPU, memory, and I/O during migrations
- **Connection Limits**: Be aware of connection pool limits

## Troubleshooting

### Common Migration Issues
- **Lock Timeout**: Long-running migrations causing locks
- **Constraint Violations**: Data constraint violations during migration
- **Out of Memory**: Large data migrations consuming too much memory
- **Dependency Issues**: Missing dependencies or wrong execution order
- **Rollback Failures**: Rollback procedures failing due to data changes

### Diagnostic Commands
```sql
-- Check migration status
SELECT version, name, status, started_at, completed_at, 
       CASE WHEN completed_at IS NOT NULL 
            THEN completed_at - started_at 
            ELSE NOW() - started_at 
       END as duration
FROM shared.migration_log 
ORDER BY version DESC;

-- Check for locked tables
SELECT 
    l.locktype,
    l.database,
    l.relation::regclass,
    l.page,
    l.tuple,
    l.virtualxid,
    l.transactionid,
    l.mode,
    l.granted,
    a.query
FROM pg_locks l 
LEFT JOIN pg_stat_activity a ON l.pid = a.pid
WHERE NOT l.granted
ORDER BY l.relation;

-- Check migration progress (for data migrations)
SELECT 
    schemaname,
    tablename,
    n_live_tup as live_rows,
    n_dead_tup as dead_rows,
    last_vacuum,
    last_autovacuum
FROM pg_stat_user_tables 
WHERE schemaname NOT IN ('information_schema', 'pg_catalog')
ORDER BY n_live_tup DESC;
```

---

*This migration guide ensures safe, reliable, and reversible database schema evolution for the Thorbis Business OS platform.*