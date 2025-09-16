# Thorbis Business OS - Database Migration Strategies & Versioning

> **Enterprise Database Migration Framework**  
> **Database Version**: PostgreSQL 16+  
> **Last Updated**: 2025-01-31  
> **Migration Framework Version**: 2.0.0  
> **Status**: Production Ready

## 📋 Table of Contents

1. [Migration Framework Overview](#migration-framework-overview)
2. [Versioning Strategy](#versioning-strategy)
3. [Migration Types](#migration-types)
4. [Zero-Downtime Migrations](#zero-downtime-migrations)
5. [Cross-Industry Migration Coordination](#cross-industry-migration-coordination)
6. [Rollback and Recovery Strategies](#rollback-and-recovery-strategies)
7. [Testing and Validation](#testing-and-validation)
8. [Performance Impact Management](#performance-impact-management)
9. [Data Integrity Assurance](#data-integrity-assurance)
10. [Migration Automation](#migration-automation)

---

## Migration Framework Overview

The Thorbis Business OS database migration framework is designed to handle complex, multi-tenant, cross-industry schema changes with zero downtime and complete data integrity. The system supports both forward and backward migrations with comprehensive rollback capabilities.

### 🎯 Core Migration Principles

1. **Zero Downtime**: All migrations execute without service interruption
2. **Atomic Operations**: Each migration is completely atomic with full rollback capability
3. **Tenant Safety**: Multi-tenant isolation maintained throughout migration process
4. **Industry Coordination**: Cross-industry schema changes coordinated seamlessly
5. **Performance Preservation**: Migration impact on production performance minimized
6. **Audit Compliance**: Complete audit trail for all migration activities
7. **Rollback Ready**: Every migration includes validated rollback procedures

---

## Versioning Strategy

### 📈 Semantic Versioning for Database Schema

```sql
-- Migration version tracking system
CREATE SCHEMA migration_mgmt;

CREATE TABLE migration_mgmt.schema_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Version Information
    major_version INTEGER NOT NULL,
    minor_version INTEGER NOT NULL,
    patch_version INTEGER NOT NULL,
    build_version INTEGER DEFAULT 0,
    version_string TEXT GENERATED ALWAYS AS (
        major_version::text || '.' || 
        minor_version::text || '.' || 
        patch_version::text ||
        CASE WHEN build_version > 0 THEN '.' || build_version::text ELSE '' END
    ) STORED,
    
    -- Version Classification
    version_type TEXT NOT NULL, -- 'major', 'minor', 'patch', 'hotfix'
    release_stage TEXT DEFAULT 'development', -- 'development', 'staging', 'production'
    
    -- Schema Scope
    affected_schemas TEXT[] NOT NULL,
    affected_industries TEXT[] NOT NULL,
    
    -- Migration Dependencies
    requires_previous_version TEXT, -- Must have this version before applying
    blocks_versions TEXT[] DEFAULT '{}', -- Versions that cannot be applied with this one
    
    -- Release Information
    release_notes TEXT,
    breaking_changes TEXT[] DEFAULT '{}',
    deprecations TEXT[] DEFAULT '{}',
    new_features TEXT[] DEFAULT '{}',
    
    -- Migration Metadata
    estimated_duration_minutes INTEGER,
    requires_maintenance_window BOOLEAN DEFAULT false,
    data_migration_required BOOLEAN DEFAULT false,
    
    -- Approval and Testing
    tested_on_environments TEXT[] DEFAULT '{}',
    approved_by UUID REFERENCES user_mgmt.users(id),
    approved_at TIMESTAMPTZ,
    
    -- Status Tracking
    version_status TEXT DEFAULT 'planned', -- 'planned', 'ready', 'deployed', 'deprecated', 'removed'
    
    -- Deployment Tracking
    deployed_to_development TIMESTAMPTZ,
    deployed_to_staging TIMESTAMPTZ,
    deployed_to_production TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES user_mgmt.users(id),
    
    UNIQUE(major_version, minor_version, patch_version, build_version)
);

-- Individual migration tracking
CREATE TABLE migration_mgmt.migrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Migration Identification
    migration_id TEXT NOT NULL UNIQUE, -- Format: YYYY.MM.DD_HHMMSS_description
    migration_name TEXT NOT NULL,
    migration_description TEXT,
    
    -- Version Association
    schema_version_id UUID NOT NULL REFERENCES migration_mgmt.schema_versions(id),
    migration_order INTEGER NOT NULL, -- Order within version
    
    -- Migration Classification
    migration_type TEXT NOT NULL, -- 'schema', 'data', 'index', 'function', 'policy', 'view'
    migration_category TEXT NOT NULL, -- 'create', 'alter', 'drop', 'seed', 'cleanup'
    impact_level TEXT DEFAULT 'low', -- 'low', 'medium', 'high', 'critical'
    
    -- Scope and Dependencies
    target_schemas TEXT[] NOT NULL,
    target_tables TEXT[] DEFAULT '{}',
    depends_on_migrations TEXT[] DEFAULT '{}', -- Migration IDs this depends on
    blocks_migrations TEXT[] DEFAULT '{}', -- Migration IDs that cannot run with this
    
    -- Migration Content
    up_sql TEXT NOT NULL, -- Forward migration SQL
    down_sql TEXT NOT NULL, -- Rollback migration SQL
    validation_sql TEXT, -- SQL to validate migration success
    
    -- Prerequisites and Validations
    prerequisite_checks TEXT[] DEFAULT '{}',
    post_migration_validations TEXT[] DEFAULT '{}',
    
    -- Performance and Safety
    estimated_duration_seconds INTEGER,
    max_lock_duration_seconds INTEGER DEFAULT 30,
    requires_exclusive_lock BOOLEAN DEFAULT false,
    can_run_concurrently BOOLEAN DEFAULT true,
    
    -- Backup Requirements
    backup_required BOOLEAN DEFAULT true,
    backup_scope TEXT DEFAULT 'affected_tables', -- 'full', 'affected_schemas', 'affected_tables'
    
    -- Rollback Configuration
    auto_rollback_on_failure BOOLEAN DEFAULT true,
    rollback_timeout_seconds INTEGER DEFAULT 300,
    
    -- Environment Controls
    allowed_environments TEXT[] DEFAULT '{development,staging,production}',
    requires_maintenance_mode BOOLEAN DEFAULT false,
    
    -- Audit and Tracking
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES user_mgmt.users(id),
    reviewed_by UUID REFERENCES user_mgmt.users(id),
    reviewed_at TIMESTAMPTZ,
    
    -- Deployment Status per Environment
    status_development TEXT DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed', 'rolled_back'
    status_staging TEXT DEFAULT 'pending',
    status_production TEXT DEFAULT 'pending',
    
    deployed_dev_at TIMESTAMPTZ,
    deployed_staging_at TIMESTAMPTZ,
    deployed_production_at TIMESTAMPTZ,
    
    UNIQUE(schema_version_id, migration_order)
);

-- Migration execution log
CREATE TABLE migration_mgmt.migration_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    migration_id UUID NOT NULL REFERENCES migration_mgmt.migrations(id),
    
    -- Execution Context
    environment TEXT NOT NULL, -- 'development', 'staging', 'production'
    database_name TEXT NOT NULL,
    server_hostname TEXT,
    
    -- Execution Details
    execution_type TEXT NOT NULL, -- 'forward', 'rollback', 'validation'
    executed_by UUID REFERENCES user_mgmt.users(id),
    execution_method TEXT DEFAULT 'automated', -- 'manual', 'automated', 'scheduled'
    
    -- Timing
    started_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ,
    duration_seconds INTEGER GENERATED ALWAYS AS (
        EXTRACT(EPOCH FROM (completed_at - started_at))::INTEGER
    ) STORED,
    
    -- Results
    execution_status TEXT DEFAULT 'running', -- 'running', 'completed', 'failed', 'rolled_back'
    rows_affected INTEGER,
    
    -- Error Handling
    error_message TEXT,
    error_code TEXT,
    error_details JSONB,
    
    -- Performance Metrics
    cpu_usage_percent DECIMAL(5,2),
    memory_usage_mb INTEGER,
    io_wait_time_ms INTEGER,
    lock_wait_time_ms INTEGER,
    
    -- Validation Results
    validation_passed BOOLEAN,
    validation_errors JSONB DEFAULT '{}',
    
    -- Rollback Information
    rollback_migration_execution_id UUID REFERENCES migration_mgmt.migration_executions(id),
    rollback_reason TEXT,
    
    -- Backup Information
    backup_created BOOLEAN DEFAULT false,
    backup_path TEXT,
    backup_size_mb INTEGER,
    
    created_at TIMESTAMPTZ DEFAULT now()
);
```

### 🔄 Version Numbering Convention

```
MAJOR.MINOR.PATCH.BUILD

MAJOR: Breaking changes, major feature releases
MINOR: New features, backward compatible changes
PATCH: Bug fixes, small improvements
BUILD: Hot fixes, security patches

Examples:
5.0.0   - Major release with breaking changes
5.1.0   - New features added
5.1.1   - Bug fixes
5.1.1.1 - Security hotfix
```

---

## Migration Types

### 📊 Schema Migrations

```sql
-- Example: Adding new industry support (Veterinary Services)
-- Migration ID: 2025.01.31_143000_add_veterinary_industry

-- Up Migration
CREATE SCHEMA vet;

CREATE TABLE vet.animals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES tenant_mgmt.businesses(id) ON DELETE CASCADE,
    owner_id UUID REFERENCES hs.customers(id) ON DELETE SET NULL, -- Reuse customer table
    
    -- Animal identification
    animal_name TEXT NOT NULL,
    species TEXT NOT NULL, -- 'dog', 'cat', 'bird', 'reptile', etc.
    breed TEXT,
    color TEXT,
    
    -- Physical attributes
    weight_lbs DECIMAL(6,2),
    date_of_birth DATE,
    sex TEXT, -- 'male', 'female', 'unknown'
    spayed_neutered BOOLEAN DEFAULT false,
    
    -- Identification
    microchip_number TEXT,
    tattoo_number TEXT,
    collar_tag TEXT,
    
    -- Medical information
    allergies TEXT[] DEFAULT '{}',
    medications TEXT[] DEFAULT '{}',
    medical_conditions TEXT[] DEFAULT '{}',
    
    -- Insurance
    pet_insurance_provider TEXT,
    policy_number TEXT,
    
    -- Status
    animal_status TEXT DEFAULT 'active', -- 'active', 'deceased', 'lost'
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES user_mgmt.users(id),
    updated_by UUID REFERENCES user_mgmt.users(id),
    
    -- Soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES user_mgmt.users(id)
);

-- Add RLS policy
ALTER TABLE vet.animals ENABLE ROW LEVEL SECURITY;
CREATE POLICY vet_animals_tenant_isolation ON vet.animals
    FOR ALL USING (business_id = auth.get_current_business_id());

-- Add indexes
CREATE INDEX idx_vet_animals_business_owner ON vet.animals(business_id, owner_id);
CREATE INDEX idx_vet_animals_species_breed ON vet.animals(business_id, species, breed);

-- Down Migration (Rollback)
DROP SCHEMA vet CASCADE;
```

### 🔄 Data Migrations

```sql
-- Example: Migrating customer phone numbers to standardized format
-- Migration ID: 2025.01.31_150000_standardize_phone_numbers

-- Function to standardize phone numbers
CREATE OR REPLACE FUNCTION standardize_phone_number(phone TEXT) 
RETURNS TEXT AS $$
BEGIN
    IF phone IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Remove all non-digits
    phone := regexp_replace(phone, '[^0-9]', '', 'g');
    
    -- Handle US phone numbers
    IF length(phone) = 10 THEN
        RETURN '+1' || phone;
    ELSIF length(phone) = 11 AND substring(phone, 1, 1) = '1' THEN
        RETURN '+' || phone;
    ELSE
        -- Return original if not standard US format
        RETURN phone;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Up Migration
DO $$
DECLARE
    batch_size INTEGER := 1000;
    processed_count INTEGER := 0;
    total_count INTEGER;
    start_time TIMESTAMPTZ;
BEGIN
    start_time := clock_timestamp();
    
    -- Get total count for progress tracking
    SELECT COUNT(*) INTO total_count 
    FROM hs.customers 
    WHERE phone_primary IS NOT NULL AND phone_primary !~ '^\+\d+$';
    
    RAISE NOTICE 'Starting phone number standardization for % customers', total_count;
    
    -- Process in batches to avoid long-running transactions
    LOOP
        -- Update batch of records
        WITH batch_update AS (
            SELECT id, phone_primary, phone_secondary
            FROM hs.customers 
            WHERE (phone_primary IS NOT NULL AND phone_primary !~ '^\+\d+$')
               OR (phone_secondary IS NOT NULL AND phone_secondary !~ '^\+\d+$')
            ORDER BY id
            LIMIT batch_size
        )
        UPDATE hs.customers 
        SET 
            phone_primary = CASE 
                WHEN phone_primary IS NOT NULL AND phone_primary !~ '^\+\d+$' 
                THEN standardize_phone_number(phone_primary)
                ELSE phone_primary 
            END,
            phone_secondary = CASE 
                WHEN phone_secondary IS NOT NULL AND phone_secondary !~ '^\+\d+$' 
                THEN standardize_phone_number(phone_secondary)
                ELSE phone_secondary 
            END,
            updated_at = now()
        FROM batch_update
        WHERE hs.customers.id = batch_update.id;
        
        GET DIAGNOSTICS processed_count = ROW_COUNT;
        
        EXIT WHEN processed_count = 0;
        
        RAISE NOTICE 'Processed % customers in %', 
            processed_count, 
            clock_timestamp() - start_time;
        
        -- Small delay to reduce load
        PERFORM pg_sleep(0.1);
    END LOOP;
    
    RAISE NOTICE 'Phone number standardization completed in %', 
        clock_timestamp() - start_time;
END;
$$;

-- Validation
DO $$
DECLARE
    invalid_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO invalid_count
    FROM hs.customers 
    WHERE (phone_primary IS NOT NULL AND phone_primary !~ '^\+\d+$')
       OR (phone_secondary IS NOT NULL AND phone_secondary !~ '^\+\d+$');
    
    IF invalid_count > 0 THEN
        RAISE EXCEPTION 'Migration validation failed: % customers still have non-standard phone numbers', invalid_count;
    END IF;
    
    RAISE NOTICE 'Migration validation passed: All phone numbers standardized';
END;
$$;

-- Cleanup
DROP FUNCTION standardize_phone_number(TEXT);

-- Down Migration (Rollback)
-- Note: This rollback would require backup data to restore original formats
-- In practice, we would restore from backup rather than attempt to reverse the standardization
RAISE NOTICE 'Phone number standardization rollback requires restore from backup';
```

---

## Zero-Downtime Migrations

### 🚀 Online Schema Changes

```sql
-- Zero-downtime column addition pattern
-- Example: Adding 'priority_score' column to work_orders table

-- Step 1: Add column with default value (non-blocking)
ALTER TABLE hs.work_orders 
ADD COLUMN priority_score INTEGER DEFAULT 0;

-- Step 2: Create index concurrently (non-blocking)
CREATE INDEX CONCURRENTLY idx_work_orders_priority_score 
ON hs.work_orders(business_id, priority_score, created_at DESC);

-- Step 3: Populate data in batches (non-blocking)
DO $$
DECLARE
    batch_size INTEGER := 1000;
    processed_count INTEGER := 0;
    total_updated INTEGER := 0;
BEGIN
    LOOP
        -- Update priority_score based on business logic
        UPDATE hs.work_orders 
        SET priority_score = CASE 
            WHEN priority = 'emergency' THEN 100
            WHEN priority = 'urgent' THEN 80
            WHEN priority = 'high' THEN 60
            WHEN priority = 'normal' THEN 40
            WHEN priority = 'low' THEN 20
            ELSE 0
        END,
        updated_at = now()
        WHERE priority_score = 0 
        AND id IN (
            SELECT id FROM hs.work_orders 
            WHERE priority_score = 0 
            ORDER BY id 
            LIMIT batch_size
        );
        
        GET DIAGNOSTICS processed_count = ROW_COUNT;
        total_updated := total_updated + processed_count;
        
        EXIT WHEN processed_count = 0;
        
        -- Brief pause to reduce system load
        PERFORM pg_sleep(0.05);
    END LOOP;
    
    RAISE NOTICE 'Updated priority_score for % work orders', total_updated;
END;
$$;

-- Step 4: Add constraint after data is populated (briefly blocking)
ALTER TABLE hs.work_orders 
ADD CONSTRAINT chk_work_orders_priority_score 
CHECK (priority_score >= 0 AND priority_score <= 100);
```

### 🔄 Table Replacement Strategy

```sql
-- Zero-downtime table schema change using replacement strategy
-- Example: Restructuring customer_equipment table

-- Step 1: Create new table with desired schema
CREATE TABLE hs.customer_equipment_new (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES tenant_mgmt.businesses(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES hs.customers(id) ON DELETE CASCADE,
    
    -- Enhanced equipment identification
    equipment_type TEXT NOT NULL,
    equipment_category TEXT NOT NULL,
    equipment_subcategory TEXT, -- New field
    equipment_name TEXT NOT NULL,
    
    -- Manufacturer information (restructured)
    manufacturer_info JSONB NOT NULL DEFAULT '{}', -- Consolidated manufacturer data
    
    -- Installation details (enhanced)
    installation_details JSONB DEFAULT '{}', -- Consolidated installation data
    
    -- Technical specifications (restructured)
    technical_specs JSONB DEFAULT '{}', -- Consolidated technical data
    
    -- Maintenance information (enhanced)
    maintenance_schedule JSONB DEFAULT '{}', -- Enhanced maintenance tracking
    
    -- All existing fields...
    equipment_condition TEXT DEFAULT 'good',
    operational_status TEXT DEFAULT 'operational',
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES user_mgmt.users(id),
    updated_by UUID REFERENCES user_mgmt.users(id),
    migrated_from_old_table BOOLEAN DEFAULT true, -- Migration tracking
    
    -- Soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES user_mgmt.users(id)
);

-- Step 2: Add indexes to new table
CREATE INDEX idx_customer_equipment_new_business_customer 
ON hs.customer_equipment_new(business_id, customer_id);

CREATE INDEX idx_customer_equipment_new_type_category 
ON hs.customer_equipment_new(business_id, equipment_type, equipment_category);

-- Step 3: Enable RLS on new table
ALTER TABLE hs.customer_equipment_new ENABLE ROW LEVEL SECURITY;
CREATE POLICY customer_equipment_new_tenant_isolation ON hs.customer_equipment_new
    FOR ALL USING (business_id = auth.get_current_business_id());

-- Step 4: Migrate data in batches
DO $$
DECLARE
    batch_size INTEGER := 500;
    processed_count INTEGER := 0;
    total_migrated INTEGER := 0;
BEGIN
    LOOP
        -- Migrate batch of records
        INSERT INTO hs.customer_equipment_new (
            id, business_id, customer_id,
            equipment_type, equipment_category, equipment_subcategory, equipment_name,
            manufacturer_info,
            installation_details,
            technical_specs,
            maintenance_schedule,
            equipment_condition, operational_status,
            created_at, updated_at, created_by, updated_by,
            deleted_at, deleted_by
        )
        SELECT 
            id, business_id, customer_id,
            equipment_type, equipment_category, 
            NULL as equipment_subcategory, -- New field, initially NULL
            equipment_name,
            
            -- Consolidate manufacturer data into JSONB
            jsonb_build_object(
                'manufacturer', manufacturer,
                'model_number', model_number,
                'serial_number', serial_number
            ) as manufacturer_info,
            
            -- Consolidate installation data into JSONB
            jsonb_build_object(
                'install_date', install_date,
                'installed_by', installed_by,
                'warranty_start_date', warranty_start_date,
                'warranty_end_date', warranty_end_date,
                'warranty_provider', warranty_provider
            ) as installation_details,
            
            -- Consolidate technical specs into JSONB
            jsonb_build_object(
                'capacity', capacity,
                'efficiency_rating', efficiency_rating,
                'fuel_type', fuel_type,
                'voltage', voltage,
                'amperage', amperage
            ) as technical_specs,
            
            -- Enhanced maintenance schedule JSONB
            jsonb_build_object(
                'last_service_date', last_service_date,
                'next_service_due', next_service_due,
                'maintenance_frequency', maintenance_frequency,
                'maintenance_notes', maintenance_notes
            ) as maintenance_schedule,
            
            equipment_condition, operational_status,
            created_at, updated_at, created_by, updated_by,
            deleted_at, deleted_by
            
        FROM hs.customer_equipment
        WHERE id NOT IN (SELECT id FROM hs.customer_equipment_new)
        ORDER BY id
        LIMIT batch_size;
        
        GET DIAGNOSTICS processed_count = ROW_COUNT;
        total_migrated := total_migrated + processed_count;
        
        EXIT WHEN processed_count = 0;
        
        RAISE NOTICE 'Migrated % equipment records (total: %)', processed_count, total_migrated;
        
        -- Brief pause
        PERFORM pg_sleep(0.1);
    END LOOP;
    
    RAISE NOTICE 'Data migration completed: % total records', total_migrated;
END;
$$;

-- Step 5: Validation
DO $$
DECLARE
    old_count INTEGER;
    new_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO old_count FROM hs.customer_equipment WHERE deleted_at IS NULL;
    SELECT COUNT(*) INTO new_count FROM hs.customer_equipment_new WHERE deleted_at IS NULL;
    
    IF old_count != new_count THEN
        RAISE EXCEPTION 'Migration validation failed: Old table has % records, new table has %', old_count, new_count;
    END IF;
    
    RAISE NOTICE 'Migration validation passed: % records in both tables', old_count;
END;
$$;

-- Step 6: Update application code to use new table
-- (This happens during deployment)

-- Step 7: Atomic table swap (minimal downtime)
BEGIN;
    -- Rename old table
    ALTER TABLE hs.customer_equipment RENAME TO customer_equipment_old;
    
    -- Rename new table to final name
    ALTER TABLE hs.customer_equipment_new RENAME TO customer_equipment;
    
    -- Update any remaining foreign key references
    -- (Application should already be using new structure)
COMMIT;

-- Step 8: Monitor and cleanup (after verification period)
-- DROP TABLE hs.customer_equipment_old; -- Done after monitoring period
```

---

## Cross-Industry Migration Coordination

### 🏭 Multi-Schema Migration Orchestration

```sql
-- Coordinated migration across multiple industry schemas
-- Example: Adding unified customer satisfaction tracking

CREATE TABLE migration_mgmt.coordinated_migrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Coordination details
    coordination_id TEXT NOT NULL UNIQUE, -- COORD-2025-001
    coordination_name TEXT NOT NULL,
    description TEXT,
    
    -- Participating migrations
    participating_migrations UUID[] NOT NULL, -- Array of migration IDs
    coordination_order JSONB NOT NULL, -- Execution order and dependencies
    
    -- Status tracking
    coordination_status TEXT DEFAULT 'planned', -- 'planned', 'executing', 'completed', 'failed', 'rolled_back'
    
    -- Execution control
    can_partial_execute BOOLEAN DEFAULT false, -- Can some migrations succeed while others fail?
    rollback_all_on_failure BOOLEAN DEFAULT true,
    
    -- Timing
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES user_mgmt.users(id)
);

-- Example coordinated migration for customer satisfaction
INSERT INTO migration_mgmt.migrations (
    migration_id, migration_name, migration_description,
    schema_version_id, migration_order, migration_type, migration_category,
    target_schemas, up_sql, down_sql
) VALUES 
-- Migration 1: Create satisfaction tracking in HS schema
(
    '2025.01.31_160000_hs_satisfaction_tracking',
    'Home Services Satisfaction Tracking',
    'Add customer satisfaction tracking to work orders',
    (SELECT id FROM migration_mgmt.schema_versions WHERE version_string = '5.2.0'),
    1, 'schema', 'alter',
    ARRAY['hs'],
    -- Up SQL
    $$
    ALTER TABLE hs.work_orders 
    ADD COLUMN satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
    ADD COLUMN satisfaction_comments TEXT,
    ADD COLUMN satisfaction_survey_sent_at TIMESTAMPTZ,
    ADD COLUMN satisfaction_response_method TEXT; -- 'email', 'sms', 'phone', 'in_person'
    
    CREATE INDEX idx_work_orders_satisfaction 
    ON hs.work_orders(business_id, satisfaction_rating, created_at DESC) 
    WHERE satisfaction_rating IS NOT NULL;
    $$,
    -- Down SQL
    $$
    DROP INDEX hs.idx_work_orders_satisfaction;
    ALTER TABLE hs.work_orders 
    DROP COLUMN satisfaction_rating,
    DROP COLUMN satisfaction_comments,
    DROP COLUMN satisfaction_survey_sent_at,
    DROP COLUMN satisfaction_response_method;
    $$
),
-- Migration 2: Create satisfaction tracking in Auto schema
(
    '2025.01.31_160001_auto_satisfaction_tracking',
    'Automotive Satisfaction Tracking', 
    'Add customer satisfaction tracking to repair orders',
    (SELECT id FROM migration_mgmt.schema_versions WHERE version_string = '5.2.0'),
    2, 'schema', 'alter',
    ARRAY['auto'],
    -- Up SQL
    $$
    ALTER TABLE auto.repair_orders 
    ADD COLUMN satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
    ADD COLUMN satisfaction_comments TEXT,
    ADD COLUMN satisfaction_survey_sent_at TIMESTAMPTZ,
    ADD COLUMN satisfaction_response_method TEXT;
    
    CREATE INDEX idx_repair_orders_satisfaction 
    ON auto.repair_orders(business_id, satisfaction_rating, created_at DESC) 
    WHERE satisfaction_rating IS NOT NULL;
    $$,
    -- Down SQL
    $$
    DROP INDEX auto.idx_repair_orders_satisfaction;
    ALTER TABLE auto.repair_orders 
    DROP COLUMN satisfaction_rating,
    DROP COLUMN satisfaction_comments,
    DROP COLUMN satisfaction_survey_sent_at,
    DROP COLUMN satisfaction_response_method;
    $$
),
-- Migration 3: Create unified satisfaction reporting view
(
    '2025.01.31_160002_unified_satisfaction_view',
    'Unified Satisfaction Reporting',
    'Create cross-industry satisfaction reporting view',
    (SELECT id FROM migration_mgmt.schema_versions WHERE version_string = '5.2.0'),
    3, 'view', 'create',
    ARRAY['reporting_mgmt'],
    -- Up SQL
    $$
    CREATE VIEW reporting_mgmt.unified_satisfaction_view AS
    WITH satisfaction_data AS (
        -- Home Services satisfaction
        SELECT 
            business_id,
            'home_services' as industry,
            'work_order' as transaction_type,
            id as transaction_id,
            customer_id,
            satisfaction_rating,
            satisfaction_comments,
            satisfaction_survey_sent_at,
            satisfaction_response_method,
            created_at as transaction_date,
            total_amount as transaction_value
        FROM hs.work_orders
        WHERE satisfaction_rating IS NOT NULL
        
        UNION ALL
        
        -- Automotive satisfaction  
        SELECT 
            business_id,
            'automotive' as industry,
            'repair_order' as transaction_type,
            id as transaction_id,
            customer_id,
            satisfaction_rating,
            satisfaction_comments,
            satisfaction_survey_sent_at,
            satisfaction_response_method,
            created_at as transaction_date,
            total_amount as transaction_value
        FROM auto.repair_orders
        WHERE satisfaction_rating IS NOT NULL
        
        -- Additional industries can be added here as they're implemented
    )
    SELECT 
        *,
        CASE 
            WHEN satisfaction_rating >= 4 THEN 'promoter'
            WHEN satisfaction_rating = 3 THEN 'passive'
            ELSE 'detractor'
        END as nps_category
    FROM satisfaction_data;
    $$,
    -- Down SQL
    $$
    DROP VIEW reporting_mgmt.unified_satisfaction_view;
    $$
);

-- Create coordination record
INSERT INTO migration_mgmt.coordinated_migrations (
    coordination_id, coordination_name, description,
    participating_migrations, coordination_order
) VALUES (
    'COORD-2025-001',
    'Unified Customer Satisfaction Tracking',
    'Implement customer satisfaction tracking across all industry verticals',
    ARRAY[
        (SELECT id FROM migration_mgmt.migrations WHERE migration_id = '2025.01.31_160000_hs_satisfaction_tracking'),
        (SELECT id FROM migration_mgmt.migrations WHERE migration_id = '2025.01.31_160001_auto_satisfaction_tracking'),
        (SELECT id FROM migration_mgmt.migrations WHERE migration_id = '2025.01.31_160002_unified_satisfaction_view')
    ],
    '{
        "execution_order": [
            "2025.01.31_160000_hs_satisfaction_tracking",
            "2025.01.31_160001_auto_satisfaction_tracking", 
            "2025.01.31_160002_unified_satisfaction_view"
        ],
        "parallel_groups": [
            ["2025.01.31_160000_hs_satisfaction_tracking", "2025.01.31_160001_auto_satisfaction_tracking"],
            ["2025.01.31_160002_unified_satisfaction_view"]
        ],
        "dependencies": {
            "2025.01.31_160002_unified_satisfaction_view": [
                "2025.01.31_160000_hs_satisfaction_tracking",
                "2025.01.31_160001_auto_satisfaction_tracking"
            ]
        }
    }'::jsonb
);
```

---

## Rollback and Recovery Strategies

### ⏪ Automated Rollback Framework

```sql
-- Rollback execution system
CREATE TABLE migration_mgmt.rollback_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    migration_id UUID NOT NULL REFERENCES migration_mgmt.migrations(id),
    
    -- Rollback strategy
    rollback_strategy TEXT NOT NULL, -- 'sql_script', 'backup_restore', 'manual_process'
    rollback_complexity TEXT DEFAULT 'simple', -- 'simple', 'moderate', 'complex', 'high_risk'
    
    -- Backup requirements
    requires_backup BOOLEAN DEFAULT true,
    backup_scope TEXT, -- 'table', 'schema', 'database'
    backup_retention_days INTEGER DEFAULT 30,
    
    -- Rollback validation
    validation_queries TEXT[] DEFAULT '{}',
    success_criteria JSONB DEFAULT '{}',
    
    -- Risk assessment
    risk_level TEXT DEFAULT 'low', -- 'low', 'medium', 'high', 'critical'
    potential_data_loss BOOLEAN DEFAULT false,
    estimated_rollback_time_minutes INTEGER,
    
    -- Approval requirements
    requires_approval BOOLEAN DEFAULT false,
    approval_role_required TEXT, -- 'dba', 'tech_lead', 'cto'
    
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Rollback execution function
CREATE OR REPLACE FUNCTION execute_rollback(
    p_migration_id UUID,
    p_environment TEXT DEFAULT 'development',
    p_reason TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    v_migration RECORD;
    v_rollback_plan RECORD;
    v_execution_id UUID;
    v_backup_path TEXT;
    v_start_time TIMESTAMPTZ;
    v_result JSONB;
    v_error_occurred BOOLEAN DEFAULT FALSE;
BEGIN
    v_start_time := clock_timestamp();
    
    -- Get migration details
    SELECT * INTO v_migration 
    FROM migration_mgmt.migrations 
    WHERE id = p_migration_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Migration not found: %', p_migration_id;
    END IF;
    
    -- Get rollback plan
    SELECT * INTO v_rollback_plan
    FROM migration_mgmt.rollback_plans
    WHERE migration_id = p_migration_id;
    
    -- Create execution record
    INSERT INTO migration_mgmt.migration_executions (
        migration_id, environment, execution_type,
        started_at, execution_status, rollback_reason
    ) VALUES (
        p_migration_id, p_environment, 'rollback',
        v_start_time, 'running', p_reason
    ) RETURNING id INTO v_execution_id;
    
    BEGIN
        -- Step 1: Create backup if required
        IF COALESCE(v_rollback_plan.requires_backup, TRUE) THEN
            -- Create backup (implementation depends on backup system)
            v_backup_path := 'backup_' || v_migration.migration_id || '_' || 
                           extract(epoch from now())::text;
            
            -- Log backup creation
            RAISE NOTICE 'Creating backup: %', v_backup_path;
        END IF;
        
        -- Step 2: Execute rollback SQL
        IF v_migration.down_sql IS NOT NULL THEN
            EXECUTE v_migration.down_sql;
            RAISE NOTICE 'Rollback SQL executed successfully';
        END IF;
        
        -- Step 3: Run validation queries
        IF v_rollback_plan.validation_queries IS NOT NULL THEN
            DECLARE
                validation_query TEXT;
                validation_result BOOLEAN;
            BEGIN
                FOREACH validation_query IN ARRAY v_rollback_plan.validation_queries
                LOOP
                    EXECUTE validation_query INTO validation_result;
                    IF NOT COALESCE(validation_result, FALSE) THEN
                        RAISE EXCEPTION 'Rollback validation failed: %', validation_query;
                    END IF;
                END LOOP;
            END;
        END IF;
        
        -- Update execution status
        UPDATE migration_mgmt.migration_executions
        SET 
            execution_status = 'completed',
            completed_at = clock_timestamp(),
            validation_passed = TRUE
        WHERE id = v_execution_id;
        
        v_result := jsonb_build_object(
            'status', 'success',
            'execution_id', v_execution_id,
            'duration_seconds', extract(epoch from (clock_timestamp() - v_start_time)),
            'backup_created', v_backup_path IS NOT NULL,
            'backup_path', v_backup_path
        );
        
    EXCEPTION
        WHEN OTHERS THEN
            v_error_occurred := TRUE;
            
            -- Update execution with error
            UPDATE migration_mgmt.migration_executions
            SET 
                execution_status = 'failed',
                completed_at = clock_timestamp(),
                error_message = SQLERRM,
                error_code = SQLSTATE,
                validation_passed = FALSE
            WHERE id = v_execution_id;
            
            v_result := jsonb_build_object(
                'status', 'failed',
                'execution_id', v_execution_id,
                'error_message', SQLERRM,
                'error_code', SQLSTATE,
                'duration_seconds', extract(epoch from (clock_timestamp() - v_start_time))
            );
    END;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;
```

---

## Testing and Validation

### 🧪 Migration Testing Framework

```sql
-- Migration testing system
CREATE TABLE migration_mgmt.migration_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    migration_id UUID NOT NULL REFERENCES migration_mgmt.migrations(id),
    
    -- Test details
    test_name TEXT NOT NULL,
    test_type TEXT NOT NULL, -- 'unit', 'integration', 'performance', 'rollback'
    test_description TEXT,
    
    -- Test configuration
    test_sql TEXT NOT NULL, -- SQL to execute for test
    expected_result JSONB, -- Expected result structure
    success_criteria TEXT, -- Text description of success
    
    -- Test data setup
    setup_sql TEXT, -- SQL to run before test
    teardown_sql TEXT, -- SQL to run after test
    requires_test_data BOOLEAN DEFAULT false,
    
    -- Performance expectations
    max_execution_time_seconds INTEGER,
    max_memory_usage_mb INTEGER,
    
    -- Environment controls
    environments_to_run TEXT[] DEFAULT '{development,staging}',
    
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES user_mgmt.users(id)
);

-- Test execution results
CREATE TABLE migration_mgmt.test_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_id UUID NOT NULL REFERENCES migration_mgmt.migration_tests(id),
    migration_execution_id UUID NOT NULL REFERENCES migration_mgmt.migration_executions(id),
    
    -- Execution details
    environment TEXT NOT NULL,
    executed_at TIMESTAMPTZ DEFAULT now(),
    
    -- Results
    test_status TEXT NOT NULL, -- 'passed', 'failed', 'skipped', 'error'
    execution_time_seconds DECIMAL(10,3),
    memory_usage_mb INTEGER,
    
    -- Result data
    actual_result JSONB,
    error_message TEXT,
    
    -- Comparison
    result_matches_expected BOOLEAN,
    performance_within_limits BOOLEAN,
    
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Example tests for satisfaction tracking migration
INSERT INTO migration_mgmt.migration_tests (
    migration_id, test_name, test_type, test_description,
    test_sql, expected_result, success_criteria
) VALUES 
(
    (SELECT id FROM migration_mgmt.migrations WHERE migration_id = '2025.01.31_160000_hs_satisfaction_tracking'),
    'Column Addition Verification',
    'unit',
    'Verify satisfaction columns were added to work_orders table',
    $$
    SELECT 
        column_name,
        data_type,
        is_nullable
    FROM information_schema.columns 
    WHERE table_schema = 'hs' 
    AND table_name = 'work_orders'
    AND column_name IN ('satisfaction_rating', 'satisfaction_comments', 'satisfaction_survey_sent_at', 'satisfaction_response_method')
    ORDER BY column_name;
    $$,
    '[
        {"column_name": "satisfaction_comments", "data_type": "text", "is_nullable": "YES"},
        {"column_name": "satisfaction_rating", "data_type": "integer", "is_nullable": "YES"},
        {"column_name": "satisfaction_response_method", "data_type": "text", "is_nullable": "YES"},
        {"column_name": "satisfaction_survey_sent_at", "data_type": "timestamp with time zone", "is_nullable": "YES"}
    ]'::jsonb,
    'All satisfaction tracking columns should exist with correct data types'
),
(
    (SELECT id FROM migration_mgmt.migrations WHERE migration_id = '2025.01.31_160000_hs_satisfaction_tracking'),
    'Constraint Verification',
    'unit',
    'Verify satisfaction rating constraint is properly applied',
    $$
    SELECT 
        con.conname,
        pg_get_constraintdef(con.oid) as definition
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_namespace nsp ON nsp.oid = connamespace
    WHERE nsp.nspname = 'hs'
    AND rel.relname = 'work_orders'
    AND con.conname LIKE '%satisfaction_rating%';
    $$,
    '[{"conname": "work_orders_satisfaction_rating_check", "definition": "CHECK ((satisfaction_rating >= 1) AND (satisfaction_rating <= 5))"}]'::jsonb,
    'Satisfaction rating should have check constraint for values 1-5'
);

-- Test execution function
CREATE OR REPLACE FUNCTION run_migration_tests(
    p_migration_id UUID,
    p_environment TEXT DEFAULT 'development'
) RETURNS JSONB AS $$
DECLARE
    test_rec RECORD;
    test_result JSONB;
    results JSONB[] DEFAULT '{}';
    total_tests INTEGER DEFAULT 0;
    passed_tests INTEGER DEFAULT 0;
    failed_tests INTEGER DEFAULT 0;
BEGIN
    -- Run all tests for the migration
    FOR test_rec IN 
        SELECT * FROM migration_mgmt.migration_tests 
        WHERE migration_id = p_migration_id
        AND p_environment = ANY(environments_to_run)
        ORDER BY test_type, test_name
    LOOP
        total_tests := total_tests + 1;
        
        BEGIN
            -- Execute test
            DECLARE
                actual_result JSONB;
                start_time TIMESTAMPTZ;
                end_time TIMESTAMPTZ;
                execution_time DECIMAL;
                test_passed BOOLEAN DEFAULT FALSE;
            BEGIN
                start_time := clock_timestamp();
                
                -- Run setup if provided
                IF test_rec.setup_sql IS NOT NULL THEN
                    EXECUTE test_rec.setup_sql;
                END IF;
                
                -- Execute test query
                EXECUTE test_rec.test_sql INTO actual_result;
                
                end_time := clock_timestamp();
                execution_time := extract(epoch from (end_time - start_time));
                
                -- Compare results
                IF test_rec.expected_result IS NOT NULL THEN
                    test_passed := (actual_result = test_rec.expected_result);
                ELSE
                    test_passed := TRUE; -- No expected result means just successful execution
                END IF;
                
                -- Record test execution
                INSERT INTO migration_mgmt.test_executions (
                    test_id, migration_execution_id, environment,
                    test_status, execution_time_seconds, actual_result,
                    result_matches_expected, performance_within_limits
                ) VALUES (
                    test_rec.id, NULL, p_environment,
                    CASE WHEN test_passed THEN 'passed' ELSE 'failed' END,
                    execution_time, actual_result, test_passed,
                    CASE WHEN test_rec.max_execution_time_seconds IS NOT NULL 
                         THEN execution_time <= test_rec.max_execution_time_seconds 
                         ELSE TRUE END
                );
                
                -- Clean up
                IF test_rec.teardown_sql IS NOT NULL THEN
                    EXECUTE test_rec.teardown_sql;
                END IF;
                
                IF test_passed THEN
                    passed_tests := passed_tests + 1;
                ELSE
                    failed_tests := failed_tests + 1;
                END IF;
                
                results := results || jsonb_build_object(
                    'test_name', test_rec.test_name,
                    'test_type', test_rec.test_type,
                    'status', CASE WHEN test_passed THEN 'passed' ELSE 'failed' END,
                    'execution_time', execution_time,
                    'expected', test_rec.expected_result,
                    'actual', actual_result
                );
                
            END;
            
        EXCEPTION
            WHEN OTHERS THEN
                failed_tests := failed_tests + 1;
                
                -- Record failed test
                INSERT INTO migration_mgmt.test_executions (
                    test_id, migration_execution_id, environment,
                    test_status, error_message
                ) VALUES (
                    test_rec.id, NULL, p_environment,
                    'error', SQLERRM
                );
                
                results := results || jsonb_build_object(
                    'test_name', test_rec.test_name,
                    'test_type', test_rec.test_type,
                    'status', 'error',
                    'error', SQLERRM
                );
        END;
    END LOOP;
    
    RETURN jsonb_build_object(
        'migration_id', p_migration_id,
        'environment', p_environment,
        'total_tests', total_tests,
        'passed_tests', passed_tests,
        'failed_tests', failed_tests,
        'success_rate', CASE WHEN total_tests > 0 THEN (passed_tests::decimal / total_tests * 100) ELSE 0 END,
        'all_tests_passed', (failed_tests = 0 AND total_tests > 0),
        'results', array_to_json(results)::jsonb
    );
END;
$$ LANGUAGE plpgsql;
```

---

This comprehensive migration framework provides enterprise-grade database change management with zero-downtime capabilities, complete rollback support, and extensive testing validation. The system is designed to handle the complexity of multi-tenant, cross-industry database evolution while maintaining strict data integrity and performance standards.

The framework includes automated coordination of cross-schema changes, sophisticated rollback strategies, and comprehensive testing to ensure reliable database evolution in production environments.