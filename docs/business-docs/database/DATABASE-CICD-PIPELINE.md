# Database CI/CD Pipeline for Automated Migrations
**Enterprise Database Deployment & Migration Management for Thorbis Business OS**

## Overview
Comprehensive CI/CD pipeline for automated database migrations, schema validation, testing, and deployment across multiple environments with zero-downtime deployment strategies and comprehensive rollback capabilities.

### Pipeline Objectives
- **Automated Migration Management**: Safe, automated database schema changes across environments
- **Zero-Downtime Deployments**: Blue-green deployment strategies for database changes
- **Comprehensive Testing**: Automated testing of migrations, performance impact, and data integrity
- **Environment Parity**: Consistent database state across development, staging, and production
- **Rollback Capabilities**: Safe rollback mechanisms for failed deployments

---

## CI/CD Architecture Overview

### Pipeline Architecture
```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                Database CI/CD Pipeline                                               │
├─────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                       │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │                              Source Control & Triggers                                       │   │
│  ├──────────────────────────────────────────────────────────────────────────────────────────────┤   │
│  │  Git Repository │ PR Reviews │ Branch Policies │ Automated Triggers │ Manual Approvals     │   │
│  └──────────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                            │                                                          │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │                              Validation & Testing Pipeline                                   │   │
│  ├──────────────────────────────────────────────────────────────────────────────────────────────┤   │
│  │ Schema Validation │ Migration Testing │ Performance Testing │ Security Scanning │ Rollback Test│   │
│  └──────────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                            │                                                          │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │                              Environment Deployment                                          │   │
│  ├──────────────────────────────────────────────────────────────────────────────────────────────┤   │
│  │   Development   │    Staging     │   Pre-Production   │    Production    │   Post-Deploy     │   │
│  │   (Immediate)   │ (Auto-Deploy)  │  (Manual Approval) │ (Manual Approval)│   (Monitoring)    │   │
│  └──────────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                       │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Migration Management Framework

### Migration Schema and Tracking
```sql
-- Database Migration Management Schema
CREATE SCHEMA IF NOT EXISTS migration_mgmt;

-- Migration Registry
CREATE TABLE migration_mgmt.migrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  migration_name VARCHAR(255) NOT NULL,
  migration_version VARCHAR(50) NOT NULL,
  migration_type migration_type_enum NOT NULL, -- 'SCHEMA', 'DATA', 'INDEX', 'SECURITY', 'PERFORMANCE'
  
  -- Migration Content
  up_sql TEXT NOT NULL,
  down_sql TEXT NOT NULL,
  migration_description TEXT,
  author_email VARCHAR(255) NOT NULL,
  
  -- Dependencies & Ordering
  depends_on_migrations TEXT[],
  migration_priority INTEGER DEFAULT 100,
  can_run_in_transaction BOOLEAN DEFAULT true,
  estimated_duration_seconds INTEGER,
  
  -- Environment & Targeting
  target_environments TEXT[] DEFAULT ARRAY['development', 'staging', 'production'],
  tenant_specific BOOLEAN DEFAULT false,
  industry_specific TEXT[], -- NULL means applies to all industries
  
  -- Validation & Testing
  pre_migration_validation TEXT,
  post_migration_validation TEXT,
  performance_impact_assessment TEXT,
  rollback_validation TEXT,
  
  -- Status & Lifecycle
  migration_status migration_status_enum DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED', 'DEPRECATED'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  
  -- Risk Assessment
  risk_level risk_level_enum NOT NULL, -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
  breaking_change BOOLEAN DEFAULT false,
  data_loss_risk BOOLEAN DEFAULT false,
  downtime_required BOOLEAN DEFAULT false,
  
  CONSTRAINT uk_migration_name_version UNIQUE (migration_name, migration_version),
  CONSTRAINT chk_migration_priority CHECK (migration_priority BETWEEN 1 AND 1000)
);

-- Migration Execution History
CREATE TABLE migration_mgmt.migration_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  migration_id UUID REFERENCES migration_mgmt.migrations(id) NOT NULL,
  environment VARCHAR(50) NOT NULL,
  
  -- Execution Details
  execution_status execution_status_enum NOT NULL, -- 'RUNNING', 'COMPLETED', 'FAILED', 'ROLLED_BACK'
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  
  -- Execution Context
  executed_by VARCHAR(255) NOT NULL, -- CI/CD system or user
  git_commit_hash VARCHAR(64),
  pipeline_id VARCHAR(255),
  deployment_id VARCHAR(255),
  
  -- Results & Metrics
  rows_affected BIGINT,
  execution_output TEXT,
  error_message TEXT,
  performance_metrics JSONB,
  
  -- Pre/Post State
  pre_execution_schema_hash VARCHAR(64),
  post_execution_schema_hash VARCHAR(64),
  schema_changes_detected JSONB,
  
  -- Rollback Information
  rollback_migration_id UUID REFERENCES migration_mgmt.migrations(id),
  rollback_executed_at TIMESTAMPTZ,
  rollback_successful BOOLEAN,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Environment State Tracking
CREATE TABLE migration_mgmt.environment_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  environment VARCHAR(50) NOT NULL,
  
  -- Current State
  current_migration_version VARCHAR(50) NOT NULL,
  schema_hash VARCHAR(64) NOT NULL,
  last_migration_at TIMESTAMPTZ,
  
  -- Health & Status
  environment_status environment_status_enum DEFAULT 'HEALTHY', -- 'HEALTHY', 'MIGRATING', 'DEGRADED', 'FAILED'
  pending_migrations_count INTEGER DEFAULT 0,
  failed_migrations_count INTEGER DEFAULT 0,
  
  -- Database Metrics
  database_size_bytes BIGINT,
  table_count INTEGER,
  index_count INTEGER,
  constraint_count INTEGER,
  
  -- Performance Baseline
  avg_query_response_time_ms NUMERIC(10,3),
  connection_pool_usage_percent NUMERIC(5,2),
  
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT uk_environment_state UNIQUE (environment)
);

-- Migration Approvals Workflow
CREATE TABLE migration_mgmt.migration_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  migration_id UUID REFERENCES migration_mgmt.migrations(id) NOT NULL,
  
  -- Approval Details
  approver_id UUID REFERENCES auth.users(id) NOT NULL,
  approval_status approval_status_enum NOT NULL, -- 'PENDING', 'APPROVED', 'REJECTED', 'CONDITIONAL'
  approval_notes TEXT,
  conditions TEXT,
  
  -- Review Context
  reviewed_at TIMESTAMPTZ DEFAULT NOW(),
  review_duration_minutes INTEGER,
  approval_level approval_level_enum NOT NULL, -- 'TECHNICAL', 'SECURITY', 'BUSINESS', 'DBA'
  
  -- Additional Context
  security_review_passed BOOLEAN,
  performance_review_passed BOOLEAN,
  business_impact_assessed BOOLEAN,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Automated Migration Generation
```sql
-- Migration Template Generator
CREATE OR REPLACE FUNCTION migration_mgmt.generate_migration_template(
  p_migration_name VARCHAR,
  p_migration_type VARCHAR,
  p_description TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_migration_id UUID;
  v_version VARCHAR(50);
  v_template JSONB;
BEGIN
  v_migration_id := gen_random_uuid();
  v_version := to_char(NOW(), 'YYYYMMDD_HH24MISS');
  
  -- Generate migration template based on type
  CASE p_migration_type
    WHEN 'SCHEMA' THEN
      v_template := jsonb_build_object(
        'migration_id', v_migration_id,
        'migration_name', p_migration_name,
        'version', v_version,
        'type', 'SCHEMA',
        'up_sql_template', format('
-- Migration: %s
-- Version: %s
-- Description: %s

-- Add your schema changes here
-- Example: CREATE TABLE example_table (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   name VARCHAR(255) NOT NULL,
--   created_at TIMESTAMPTZ DEFAULT NOW()
-- );

', p_migration_name, v_version, COALESCE(p_description, 'Schema modification')),
        'down_sql_template', format('
-- Rollback Migration: %s
-- Version: %s

-- Add your rollback logic here
-- Example: DROP TABLE IF EXISTS example_table;

', p_migration_name, v_version),
        'validation_queries', ARRAY[
          'SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = ''target_schema'';'
        ]
      );
      
    WHEN 'DATA' THEN
      v_template := jsonb_build_object(
        'migration_id', v_migration_id,
        'migration_name', p_migration_name,
        'version', v_version,
        'type', 'DATA',
        'up_sql_template', format('
-- Data Migration: %s
-- Version: %s
-- Description: %s

-- Add your data migration here
-- Example: INSERT INTO target_table (column1, column2) 
--          SELECT source_column1, source_column2 
--          FROM source_table;

', p_migration_name, v_version, COALESCE(p_description, 'Data modification')),
        'down_sql_template', format('
-- Data Rollback: %s
-- Version: %s

-- Add your data rollback logic here
-- Example: DELETE FROM target_table WHERE condition;

', p_migration_name, v_version),
        'pre_migration_checks', ARRAY[
          'SELECT COUNT(*) FROM source_table;',
          'SELECT COUNT(*) FROM target_table;'
        ]
      );
      
    WHEN 'SECURITY' THEN
      v_template := jsonb_build_object(
        'migration_id', v_migration_id,
        'migration_name', p_migration_name,
        'version', v_version,
        'type', 'SECURITY',
        'up_sql_template', format('
-- Security Migration: %s
-- Version: %s
-- Description: %s

-- Add your security changes here
-- Example: ALTER TABLE sensitive_table ENABLE ROW LEVEL SECURITY;
--          CREATE POLICY tenant_isolation ON sensitive_table
--            FOR ALL TO authenticated_users
--            USING (tenant_id = current_setting(''app.current_tenant_id'')::UUID);

', p_migration_name, v_version, COALESCE(p_description, 'Security enhancement')),
        'down_sql_template', format('
-- Security Rollback: %s
-- Version: %s

-- Add your security rollback logic here
-- Example: DROP POLICY IF EXISTS tenant_isolation ON sensitive_table;
--          ALTER TABLE sensitive_table DISABLE ROW LEVEL SECURITY;

', p_migration_name, v_version),
        'security_validation', ARRAY[
          'SELECT COUNT(*) FROM pg_policies WHERE tablename = ''target_table'';'
        ]
      );
  END CASE;
  
  RETURN v_template;
END;
$$ LANGUAGE plpgsql;

-- Schema Diff Generator
CREATE OR REPLACE FUNCTION migration_mgmt.generate_schema_diff(
  p_source_environment VARCHAR,
  p_target_environment VARCHAR
) RETURNS JSONB AS $$
DECLARE
  v_diff JSONB := '{"tables": [], "indexes": [], "constraints": [], "functions": []}'::JSONB;
  v_table_diff RECORD;
  v_index_diff RECORD;
BEGIN
  -- Generate table differences
  FOR v_table_diff IN
    WITH source_tables AS (
      SELECT schemaname, tablename, 
             array_agg(columnname ORDER BY ordinal_position) as columns
      FROM information_schema.columns 
      WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
      GROUP BY schemaname, tablename
    ),
    target_tables AS (
      -- This would query the target environment
      -- For now, using same environment as example
      SELECT schemaname, tablename,
             array_agg(columnname ORDER BY ordinal_position) as columns  
      FROM information_schema.columns 
      WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
      GROUP BY schemaname, tablename
    )
    SELECT 
      COALESCE(s.schemaname, t.schemaname) as schema_name,
      COALESCE(s.tablename, t.tablename) as table_name,
      CASE 
        WHEN s.tablename IS NULL THEN 'MISSING_IN_SOURCE'
        WHEN t.tablename IS NULL THEN 'MISSING_IN_TARGET'  
        WHEN s.columns != t.columns THEN 'COLUMN_DIFF'
        ELSE 'IDENTICAL'
      END as diff_type,
      s.columns as source_columns,
      t.columns as target_columns
    FROM source_tables s
    FULL OUTER JOIN target_tables t ON s.schemaname = t.schemaname AND s.tablename = t.tablename
    WHERE s.tablename IS NULL OR t.tablename IS NULL OR s.columns != t.columns
  LOOP
    v_diff := jsonb_set(
      v_diff, 
      '{tables}', 
      v_diff->'tables' || jsonb_build_object(
        'schema', v_table_diff.schema_name,
        'table', v_table_diff.table_name,
        'diff_type', v_table_diff.diff_type,
        'source_columns', v_table_diff.source_columns,
        'target_columns', v_table_diff.target_columns
      )
    );
  END LOOP;
  
  RETURN v_diff;
END;
$$ LANGUAGE plpgsql;
```

---

## CI/CD Pipeline Configuration

### GitHub Actions Workflow
```yaml
# .github/workflows/database-migrations.yml
name: Database Migrations CI/CD

on:
  push:
    branches: [main, develop]
    paths: ['migrations/**']
  pull_request:
    branches: [main]
    paths: ['migrations/**']
  workflow_dispatch:
    inputs:
      environment:
        description: 'Target Environment'
        required: true
        default: 'staging'
        type: choice
        options:
        - development
        - staging
        - production
      migration_type:
        description: 'Migration Type'
        required: false
        default: 'all'
        type: choice
        options:
        - all
        - schema
        - data
        - security
        - performance

env:
  DATABASE_URL_DEV: ${{ secrets.DATABASE_URL_DEV }}
  DATABASE_URL_STAGING: ${{ secrets.DATABASE_URL_STAGING }}
  DATABASE_URL_PROD: ${{ secrets.DATABASE_URL_PROD }}

jobs:
  validate-migrations:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup PostgreSQL
        uses: harmon758/postgresql-action@v1
        with:
          postgresql version: '17'
          postgresql db: thorbis_test
          postgresql user: test_user
          postgresql password: test_password
          
      - name: Install dependencies
        run: |
          sudo apt-get update
          sudo apt-get install -y postgresql-client-17
          npm install -g @dbmate/dbmate
          
      - name: Validate migration syntax
        run: |
          find migrations -name "*.sql" -exec pg_prove --host localhost --port 5432 --username test_user --dbname thorbis_test {} \;
          
      - name: Check migration naming convention
        run: |
          ./scripts/validate-migration-names.sh
          
      - name: Detect destructive changes
        run: |
          ./scripts/detect-destructive-changes.sh
          
      - name: Generate migration documentation
        run: |
          ./scripts/generate-migration-docs.sh
          
  test-migrations:
    runs-on: ubuntu-latest
    needs: validate-migrations
    strategy:
      matrix:
        environment: [development, staging]
        
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup test database
        run: |
          docker run -d \
            --name postgres-test \
            -e POSTGRES_DB=thorbis_test_${{ matrix.environment }} \
            -e POSTGRES_USER=test_user \
            -e POSTGRES_PASSWORD=test_password \
            -p 5432:5432 \
            postgres:17-alpine
            
      - name: Wait for database
        run: |
          until pg_isready -h localhost -p 5432 -U test_user; do
            echo "Waiting for PostgreSQL to be ready..."
            sleep 2
          done
          
      - name: Apply migrations
        run: |
          DATABASE_URL="postgresql://test_user:test_password@localhost:5432/thorbis_test_${{ matrix.environment }}" \
          ./scripts/run-migrations.sh --environment ${{ matrix.environment }}
          
      - name: Test rollback capability
        run: |
          DATABASE_URL="postgresql://test_user:test_password@localhost:5432/thorbis_test_${{ matrix.environment }}" \
          ./scripts/test-rollback.sh --last-n-migrations 3
          
      - name: Performance impact assessment
        run: |
          DATABASE_URL="postgresql://test_user:test_password@localhost:5432/thorbis_test_${{ matrix.environment }}" \
          ./scripts/performance-test.sh
          
      - name: Security validation
        run: |
          DATABASE_URL="postgresql://test_user:test_password@localhost:5432/thorbis_test_${{ matrix.environment }}" \
          ./scripts/security-audit.sh

  deploy-development:
    runs-on: ubuntu-latest
    needs: test-migrations
    if: github.ref == 'refs/heads/develop' || github.event_name == 'workflow_dispatch'
    environment: development
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Deploy to development
        run: |
          ./scripts/deploy-migrations.sh \
            --environment development \
            --database-url "${{ env.DATABASE_URL_DEV }}" \
            --dry-run false
            
      - name: Post-deployment validation
        run: |
          ./scripts/post-deployment-validation.sh \
            --environment development \
            --database-url "${{ env.DATABASE_URL_DEV }}"
            
      - name: Update environment state
        run: |
          ./scripts/update-environment-state.sh \
            --environment development \
            --commit-hash ${{ github.sha }}

  deploy-staging:
    runs-on: ubuntu-latest
    needs: deploy-development
    if: github.ref == 'refs/heads/main' || github.event_name == 'workflow_dispatch'
    environment: staging
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Pre-deployment backup
        run: |
          ./scripts/backup-database.sh \
            --environment staging \
            --backup-type pre-deployment
            
      - name: Deploy to staging
        run: |
          ./scripts/deploy-migrations.sh \
            --environment staging \
            --database-url "${{ env.DATABASE_URL_STAGING }}" \
            --backup-first true
            
      - name: Integration tests
        run: |
          ./scripts/run-integration-tests.sh \
            --environment staging
            
      - name: Performance regression tests
        run: |
          ./scripts/performance-regression-tests.sh \
            --environment staging

  deploy-production:
    runs-on: ubuntu-latest
    needs: deploy-staging
    if: github.ref == 'refs/heads/main' && github.event_name == 'workflow_dispatch'
    environment: production
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Production deployment approval
        uses: trstringer/manual-approval@v1
        with:
          secret: ${{ github.TOKEN }}
          approvers: dba-team,lead-engineers
          minimum-approvals: 2
          
      - name: Pre-production backup
        run: |
          ./scripts/backup-database.sh \
            --environment production \
            --backup-type pre-deployment \
            --retention-days 90
            
      - name: Blue-green deployment preparation
        run: |
          ./scripts/prepare-blue-green-deployment.sh \
            --environment production
            
      - name: Deploy to production (Blue)
        run: |
          ./scripts/deploy-migrations.sh \
            --environment production-blue \
            --database-url "${{ env.DATABASE_URL_PROD }}" \
            --zero-downtime true
            
      - name: Smoke tests on Blue
        run: |
          ./scripts/smoke-tests.sh \
            --environment production-blue
            
      - name: Switch to Blue (Zero-downtime)
        run: |
          ./scripts/switch-blue-green.sh \
            --environment production \
            --target blue
            
      - name: Post-deployment monitoring
        run: |
          ./scripts/post-deployment-monitoring.sh \
            --environment production \
            --duration-minutes 30
```

---

## Migration Execution Scripts

### Core Migration Runner
```bash
#!/bin/bash
# scripts/run-migrations.sh

set -euo pipefail

ENVIRONMENT=""
DATABASE_URL=""
DRY_RUN="false"
MIGRATION_TYPE="all"
ROLLBACK_ON_FAILURE="true"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --environment)
      ENVIRONMENT="$2"
      shift 2
      ;;
    --database-url)
      DATABASE_URL="$2"
      shift 2
      ;;
    --dry-run)
      DRY_RUN="$2"
      shift 2
      ;;
    --migration-type)
      MIGRATION_TYPE="$2"
      shift 2
      ;;
    --rollback-on-failure)
      ROLLBACK_ON_FAILURE="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Validate required parameters
if [[ -z "$ENVIRONMENT" ]] || [[ -z "$DATABASE_URL" ]]; then
    echo "Error: --environment and --database-url are required"
    exit 1
fi

echo "Starting migration deployment to $ENVIRONMENT environment"
echo "Migration type: $MIGRATION_TYPE"
echo "Dry run: $DRY_RUN"

# Function to log migration events
log_migration_event() {
    local event_type="$1"
    local message="$2"
    local migration_id="${3:-}"
    
    psql "$DATABASE_URL" -c "
        INSERT INTO migration_mgmt.migration_executions (
            migration_id, environment, execution_status, 
            executed_by, git_commit_hash, pipeline_id,
            execution_output
        ) VALUES (
            CASE WHEN '$migration_id' = '' THEN NULL ELSE '$migration_id'::UUID END,
            '$ENVIRONMENT',
            '$event_type',
            'CI/CD-Pipeline',
            '${GITHUB_SHA:-unknown}',
            '${GITHUB_RUN_ID:-unknown}',
            '$message'
        );
    " 2>/dev/null || echo "Failed to log migration event: $event_type"
}

# Function to execute a single migration
execute_migration() {
    local migration_file="$1"
    local migration_name=$(basename "$migration_file" .sql)
    
    echo "Executing migration: $migration_name"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        echo "DRY RUN: Would execute migration $migration_name"
        echo "Content preview:"
        head -20 "$migration_file"
        return 0
    fi
    
    # Start migration execution
    log_migration_event "RUNNING" "Starting migration $migration_name"
    
    local start_time=$(date +%s)
    
    # Execute the migration
    if psql "$DATABASE_URL" -f "$migration_file" -v ON_ERROR_STOP=1; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        
        echo "Migration $migration_name completed successfully in ${duration}s"
        log_migration_event "COMPLETED" "Migration completed in ${duration}s" 
        
        # Update environment state
        psql "$DATABASE_URL" -c "
            INSERT INTO migration_mgmt.environment_state (
                environment, current_migration_version, 
                schema_hash, last_migration_at, environment_status
            ) VALUES (
                '$ENVIRONMENT', '$migration_name',
                md5(random()::text), NOW(), 'HEALTHY'
            )
            ON CONFLICT (environment) 
            DO UPDATE SET 
                current_migration_version = '$migration_name',
                last_migration_at = NOW(),
                updated_at = NOW();
        "
        
        return 0
    else
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        
        echo "Migration $migration_name failed after ${duration}s"
        log_migration_event "FAILED" "Migration failed after ${duration}s"
        
        if [[ "$ROLLBACK_ON_FAILURE" == "true" ]]; then
            echo "Attempting automatic rollback..."
            rollback_migration "$migration_file"
        fi
        
        return 1
    fi
}

# Function to rollback a migration
rollback_migration() {
    local migration_file="$1"
    local migration_name=$(basename "$migration_file" .sql)
    local rollback_file="${migration_file%.sql}_rollback.sql"
    
    if [[ -f "$rollback_file" ]]; then
        echo "Executing rollback for migration: $migration_name"
        
        if psql "$DATABASE_URL" -f "$rollback_file" -v ON_ERROR_STOP=1; then
            echo "Rollback successful for migration: $migration_name"
            log_migration_event "ROLLED_BACK" "Migration rolled back successfully"
        else
            echo "Rollback failed for migration: $migration_name"
            log_migration_event "ROLLBACK_FAILED" "Migration rollback failed"
        fi
    else
        echo "No rollback file found for migration: $migration_name"
        log_migration_event "ROLLBACK_UNAVAILABLE" "No rollback file available"
    fi
}

# Function to validate migration prerequisites
validate_prerequisites() {
    echo "Validating migration prerequisites..."
    
    # Check database connectivity
    if ! psql "$DATABASE_URL" -c "SELECT 1;" >/dev/null 2>&1; then
        echo "Error: Cannot connect to database"
        exit 1
    fi
    
    # Check if migration management schema exists
    if ! psql "$DATABASE_URL" -c "SELECT 1 FROM information_schema.schemata WHERE schema_name = 'migration_mgmt';" | grep -q 1; then
        echo "Creating migration management schema..."
        psql "$DATABASE_URL" -f "scripts/setup-migration-schema.sql"
    fi
    
    # Check for pending migrations from other processes
    local pending_count=$(psql "$DATABASE_URL" -t -c "
        SELECT COUNT(*) FROM migration_mgmt.migration_executions 
        WHERE environment = '$ENVIRONMENT' 
        AND execution_status = 'RUNNING'
        AND started_at > NOW() - INTERVAL '1 hour';
    " | tr -d ' ')
    
    if [[ "$pending_count" -gt 0 ]]; then
        echo "Error: There are $pending_count pending migrations in $ENVIRONMENT environment"
        echo "Please wait for them to complete or investigate potential issues"
        exit 1
    fi
    
    echo "Prerequisites validation completed successfully"
}

# Function to get pending migrations
get_pending_migrations() {
    local migration_files=()
    
    # Find all migration files based on type
    case "$MIGRATION_TYPE" in
        "all")
            readarray -t migration_files < <(find migrations -name "*.sql" ! -name "*_rollback.sql" | sort)
            ;;
        "schema")
            readarray -t migration_files < <(find migrations -name "*schema*.sql" ! -name "*_rollback.sql" | sort)
            ;;
        "data")
            readarray -t migration_files < <(find migrations -name "*data*.sql" ! -name "*_rollback.sql" | sort)
            ;;
        "security")
            readarray -t migration_files < <(find migrations -name "*security*.sql" ! -name "*_rollback.sql" | sort)
            ;;
        *)
            echo "Unknown migration type: $MIGRATION_TYPE"
            exit 1
            ;;
    esac
    
    # Filter out already executed migrations
    local pending_migrations=()
    for migration_file in "${migration_files[@]}"; do
        local migration_name=$(basename "$migration_file" .sql)
        
        local executed_count=$(psql "$DATABASE_URL" -t -c "
            SELECT COUNT(*) FROM migration_mgmt.migration_executions 
            WHERE migration_id IN (
                SELECT id FROM migration_mgmt.migrations 
                WHERE migration_name = '$migration_name'
            )
            AND environment = '$ENVIRONMENT'
            AND execution_status = 'COMPLETED';
        " | tr -d ' ')
        
        if [[ "$executed_count" -eq 0 ]]; then
            pending_migrations+=("$migration_file")
        fi
    done
    
    echo "${pending_migrations[@]}"
}

# Main execution flow
main() {
    echo "=== Database Migration Deployment Started ==="
    echo "Environment: $ENVIRONMENT"
    echo "Timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
    echo "Git Commit: ${GITHUB_SHA:-unknown}"
    echo "Pipeline ID: ${GITHUB_RUN_ID:-unknown}"
    
    validate_prerequisites
    
    # Get pending migrations
    readarray -t pending_migrations < <(get_pending_migrations)
    
    if [[ ${#pending_migrations[@]} -eq 0 ]]; then
        echo "No pending migrations found for environment: $ENVIRONMENT"
        exit 0
    fi
    
    echo "Found ${#pending_migrations[@]} pending migrations:"
    for migration in "${pending_migrations[@]}"; do
        echo "  - $(basename "$migration")"
    done
    
    # Execute migrations
    local success_count=0
    local failure_count=0
    
    for migration_file in "${pending_migrations[@]}"; do
        if execute_migration "$migration_file"; then
            ((success_count++))
        else
            ((failure_count++))
            
            if [[ "$ROLLBACK_ON_FAILURE" != "true" ]]; then
                echo "Migration failed and rollback is disabled. Stopping execution."
                break
            fi
        fi
    done
    
    echo "=== Migration Deployment Summary ==="
    echo "Successful migrations: $success_count"
    echo "Failed migrations: $failure_count"
    echo "Environment: $ENVIRONMENT"
    echo "Completion time: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
    
    if [[ $failure_count -gt 0 ]]; then
        exit 1
    fi
    
    echo "All migrations completed successfully!"
}

# Execute main function
main "$@"
```

### Rollback Management Script
```bash
#!/bin/bash
# scripts/rollback-migrations.sh

set -euo pipefail

ENVIRONMENT=""
DATABASE_URL=""
ROLLBACK_COUNT="1"
ROLLBACK_TO_VERSION=""
DRY_RUN="false"
FORCE="false"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --environment)
      ENVIRONMENT="$2"
      shift 2
      ;;
    --database-url)
      DATABASE_URL="$2"
      shift 2
      ;;
    --rollback-count)
      ROLLBACK_COUNT="$2"
      shift 2
      ;;
    --rollback-to-version)
      ROLLBACK_TO_VERSION="$2"
      shift 2
      ;;
    --dry-run)
      DRY_RUN="$2"
      shift 2
      ;;
    --force)
      FORCE="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Function to get migrations to rollback
get_rollback_migrations() {
    if [[ -n "$ROLLBACK_TO_VERSION" ]]; then
        # Rollback to specific version
        psql "$DATABASE_URL" -t -c "
            WITH rollback_migrations AS (
                SELECT m.migration_name, me.completed_at
                FROM migration_mgmt.migrations m
                JOIN migration_mgmt.migration_executions me ON m.id = me.migration_id
                WHERE me.environment = '$ENVIRONMENT'
                    AND me.execution_status = 'COMPLETED'
                    AND me.completed_at > (
                        SELECT MIN(me2.completed_at)
                        FROM migration_mgmt.migrations m2
                        JOIN migration_mgmt.migration_executions me2 ON m2.id = me2.migration_id
                        WHERE m2.migration_name = '$ROLLBACK_TO_VERSION'
                            AND me2.environment = '$ENVIRONMENT'
                            AND me2.execution_status = 'COMPLETED'
                    )
                ORDER BY me.completed_at DESC
            )
            SELECT migration_name FROM rollback_migrations;
        "
    else
        # Rollback last N migrations
        psql "$DATABASE_URL" -t -c "
            SELECT m.migration_name
            FROM migration_mgmt.migrations m
            JOIN migration_mgmt.migration_executions me ON m.id = me.migration_id
            WHERE me.environment = '$ENVIRONMENT'
                AND me.execution_status = 'COMPLETED'
            ORDER BY me.completed_at DESC
            LIMIT $ROLLBACK_COUNT;
        "
    fi
}

# Function to execute rollback
execute_rollback() {
    local migration_name="$1"
    local rollback_file="migrations/${migration_name}_rollback.sql"
    
    echo "Rolling back migration: $migration_name"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        echo "DRY RUN: Would rollback migration $migration_name"
        if [[ -f "$rollback_file" ]]; then
            echo "Rollback script preview:"
            head -20 "$rollback_file"
        else
            echo "WARNING: No rollback script found for $migration_name"
        fi
        return 0
    fi
    
    if [[ ! -f "$rollback_file" ]]; then
        echo "ERROR: No rollback script found for migration $migration_name"
        return 1
    fi
    
    # Execute rollback
    local start_time=$(date +%s)
    
    if psql "$DATABASE_URL" -f "$rollback_file" -v ON_ERROR_STOP=1; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        
        echo "Rollback completed successfully for $migration_name in ${duration}s"
        
        # Update migration execution record
        psql "$DATABASE_URL" -c "
            UPDATE migration_mgmt.migration_executions 
            SET rollback_executed_at = NOW(),
                rollback_successful = true,
                execution_status = 'ROLLED_BACK'
            WHERE migration_id IN (
                SELECT id FROM migration_mgmt.migrations WHERE migration_name = '$migration_name'
            )
            AND environment = '$ENVIRONMENT'
            AND execution_status = 'COMPLETED';
        "
        
        return 0
    else
        echo "Rollback failed for migration: $migration_name"
        
        # Update migration execution record
        psql "$DATABASE_URL" -c "
            UPDATE migration_mgmt.migration_executions 
            SET rollback_executed_at = NOW(),
                rollback_successful = false
            WHERE migration_id IN (
                SELECT id FROM migration_mgmt.migrations WHERE migration_name = '$migration_name'
            )
            AND environment = '$ENVIRONMENT'
            AND execution_status = 'COMPLETED';
        "
        
        return 1
    fi
}

# Main rollback execution
main() {
    echo "=== Database Migration Rollback Started ==="
    echo "Environment: $ENVIRONMENT"
    echo "Rollback count: $ROLLBACK_COUNT"
    echo "Rollback to version: ${ROLLBACK_TO_VERSION:-N/A}"
    echo "Dry run: $DRY_RUN"
    
    # Safety check for production
    if [[ "$ENVIRONMENT" == "production" ]] && [[ "$FORCE" != "true" ]]; then
        echo "WARNING: You are about to rollback migrations in PRODUCTION!"
        echo "This operation may cause data loss and service disruption."
        echo "Use --force true to proceed with production rollback."
        exit 1
    fi
    
    # Get migrations to rollback
    readarray -t rollback_migrations < <(get_rollback_migrations)
    
    if [[ ${#rollback_migrations[@]} -eq 0 ]]; then
        echo "No migrations found to rollback"
        exit 0
    fi
    
    echo "Migrations to rollback:"
    for migration in "${rollback_migrations[@]}"; do
        echo "  - $migration"
    done
    
    # Execute rollbacks
    local success_count=0
    local failure_count=0
    
    for migration_name in "${rollback_migrations[@]}"; do
        migration_name=$(echo "$migration_name" | tr -d ' ')
        
        if execute_rollback "$migration_name"; then
            ((success_count++))
        else
            ((failure_count++))
            echo "Rollback failed for $migration_name. Stopping rollback process."
            break
        fi
    done
    
    echo "=== Rollback Summary ==="
    echo "Successful rollbacks: $success_count"
    echo "Failed rollbacks: $failure_count"
    
    if [[ $failure_count -gt 0 ]]; then
        exit 1
    fi
    
    echo "All rollbacks completed successfully!"
}

main "$@"
```

---

## Zero-Downtime Deployment Strategies

### Blue-Green Database Deployment
```sql
-- Blue-Green Deployment Management
CREATE TABLE migration_mgmt.blue_green_deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  environment VARCHAR(50) NOT NULL,
  deployment_type VARCHAR(20) NOT NULL, -- 'BLUE', 'GREEN'
  
  -- Deployment State
  current_active BOOLEAN DEFAULT false,
  deployment_status VARCHAR(50) DEFAULT 'PREPARING', -- 'PREPARING', 'DEPLOYING', 'TESTING', 'ACTIVE', 'RETIRED'
  
  -- Database Configuration
  database_url VARCHAR(500) NOT NULL,
  schema_version VARCHAR(50),
  migration_batch_id UUID,
  
  -- Deployment Timeline
  started_at TIMESTAMPTZ DEFAULT NOW(),
  deployed_at TIMESTAMPTZ,
  activated_at TIMESTAMPTZ,
  retired_at TIMESTAMPTZ,
  
  -- Health & Metrics
  health_check_url VARCHAR(500),
  last_health_check TIMESTAMPTZ,
  health_status VARCHAR(20) DEFAULT 'UNKNOWN', -- 'HEALTHY', 'UNHEALTHY', 'UNKNOWN'
  performance_metrics JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blue-Green Switch Function
CREATE OR REPLACE FUNCTION migration_mgmt.execute_blue_green_switch(
  p_environment VARCHAR,
  p_target_deployment VARCHAR
) RETURNS JSONB AS $$
DECLARE
  v_current_deployment RECORD;
  v_target_deployment RECORD;
  v_switch_result JSONB;
BEGIN
  -- Get current active deployment
  SELECT * INTO v_current_deployment
  FROM migration_mgmt.blue_green_deployments
  WHERE environment = p_environment 
    AND current_active = true;
  
  -- Get target deployment
  SELECT * INTO v_target_deployment
  FROM migration_mgmt.blue_green_deployments
  WHERE environment = p_environment 
    AND deployment_type = UPPER(p_target_deployment)
    AND deployment_status = 'TESTING';
  
  IF v_target_deployment IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Target deployment not found or not ready for switch'
    );
  END IF;
  
  -- Health check on target deployment
  -- (This would integrate with external health check service)
  
  BEGIN
    -- Deactivate current deployment
    UPDATE migration_mgmt.blue_green_deployments
    SET current_active = false,
        deployment_status = 'RETIRED',
        retired_at = NOW()
    WHERE id = v_current_deployment.id;
    
    -- Activate target deployment
    UPDATE migration_mgmt.blue_green_deployments
    SET current_active = true,
        deployment_status = 'ACTIVE',
        activated_at = NOW()
    WHERE id = v_target_deployment.id;
    
    -- Log switch event
    INSERT INTO migration_mgmt.deployment_events (
      event_type, environment, event_details, created_at
    ) VALUES (
      'BLUE_GREEN_SWITCH',
      p_environment,
      jsonb_build_object(
        'from_deployment', v_current_deployment.deployment_type,
        'to_deployment', v_target_deployment.deployment_type,
        'switch_time', NOW()
      ),
      NOW()
    );
    
    v_switch_result := jsonb_build_object(
      'success', true,
      'from_deployment', v_current_deployment.deployment_type,
      'to_deployment', v_target_deployment.deployment_type,
      'switch_time', NOW()
    );
    
  EXCEPTION
    WHEN OTHERS THEN
      v_switch_result := jsonb_build_object(
        'success', false,
        'error', SQLERRM
      );
  END;
  
  RETURN v_switch_result;
END;
$$ LANGUAGE plpgsql;
```

---

## Monitoring & Alerting Integration

### Migration Monitoring Dashboard
```sql
-- Migration Monitoring Views
CREATE OR REPLACE VIEW migration_mgmt.migration_dashboard AS
SELECT 
  e.environment,
  COUNT(*) as total_migrations,
  COUNT(CASE WHEN me.execution_status = 'COMPLETED' THEN 1 END) as completed_migrations,
  COUNT(CASE WHEN me.execution_status = 'FAILED' THEN 1 END) as failed_migrations,
  COUNT(CASE WHEN me.execution_status = 'RUNNING' THEN 1 END) as running_migrations,
  MAX(me.completed_at) as last_migration_time,
  AVG(me.duration_seconds) as avg_migration_duration,
  es.environment_status,
  es.pending_migrations_count
FROM migration_mgmt.environment_state es
LEFT JOIN migration_mgmt.migration_executions me ON es.environment = me.environment
GROUP BY e.environment, es.environment_status, es.pending_migrations_count
ORDER BY e.environment;

-- Migration Performance Metrics
CREATE OR REPLACE VIEW migration_mgmt.migration_performance_metrics AS
SELECT 
  m.migration_name,
  m.migration_type,
  me.environment,
  AVG(me.duration_seconds) as avg_duration,
  MIN(me.duration_seconds) as min_duration,
  MAX(me.duration_seconds) as max_duration,
  COUNT(*) as execution_count,
  COUNT(CASE WHEN me.execution_status = 'FAILED' THEN 1 END) as failure_count,
  (COUNT(CASE WHEN me.execution_status = 'FAILED' THEN 1 END)::NUMERIC / COUNT(*) * 100) as failure_rate_percent
FROM migration_mgmt.migrations m
JOIN migration_mgmt.migration_executions me ON m.id = me.migration_id
WHERE me.completed_at >= NOW() - INTERVAL '30 days'
GROUP BY m.migration_name, m.migration_type, me.environment
ORDER BY failure_rate_percent DESC, avg_duration DESC;

-- Alert Configuration for Migration Issues
CREATE TABLE migration_mgmt.migration_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_name VARCHAR(255) NOT NULL,
  alert_condition TEXT NOT NULL, -- SQL condition that triggers alert
  alert_severity VARCHAR(20) NOT NULL, -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
  notification_channels JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sample Alert Configurations
INSERT INTO migration_mgmt.migration_alerts (alert_name, alert_condition, alert_severity, notification_channels) VALUES
('Failed Migration Alert', 
 'SELECT COUNT(*) FROM migration_mgmt.migration_executions WHERE execution_status = ''FAILED'' AND started_at >= NOW() - INTERVAL ''1 hour''', 
 'HIGH', 
 '{"slack": "#alerts", "email": ["dba-team@company.com"]}'),

('Long Running Migration Alert',
 'SELECT COUNT(*) FROM migration_mgmt.migration_executions WHERE execution_status = ''RUNNING'' AND started_at <= NOW() - INTERVAL ''30 minutes''',
 'MEDIUM',
 '{"slack": "#monitoring"}'),

('Production Migration Alert',
 'SELECT COUNT(*) FROM migration_mgmt.migration_executions WHERE environment = ''production'' AND execution_status = ''RUNNING''',
 'CRITICAL',
 '{"slack": "#critical-alerts", "email": ["leadership@company.com"], "pagerduty": "database-team"}');
```

---

This comprehensive CI/CD pipeline framework provides enterprise-grade automated database migration management with zero-downtime deployment capabilities, comprehensive testing, monitoring, and rollback mechanisms for the Thorbis Business OS platform.