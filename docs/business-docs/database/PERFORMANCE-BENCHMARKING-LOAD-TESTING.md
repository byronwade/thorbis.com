# Database Performance Benchmarking & Load Testing Framework
**Enterprise Database Performance Management for Thorbis Business OS**

## Overview
Comprehensive performance benchmarking and load testing framework designed to validate database performance under production workloads, establish performance baselines, and detect performance regressions across all industry schemas.

### Framework Objectives
- **Performance Validation**: Ensure database meets performance SLAs under all load conditions
- **Baseline Establishment**: Create performance baselines for all database operations and industry schemas
- **Regression Detection**: Automated detection of performance degradation in CI/CD pipelines
- **Capacity Planning**: Data-driven insights for infrastructure scaling decisions
- **Load Simulation**: Realistic workload simulation for all industry verticals

---

## Architecture Overview

### Component Architecture
```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                Performance Testing Framework                                          │
├─────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                       │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐            │
│  │  Load Generator  │  │  Metrics Engine  │  │  Baseline Store  │  │  Report Engine   │            │
│  │                  │  │                  │  │                  │  │                  │            │
│  │ • Workload Sim   │  │ • Performance    │  │ • Historical     │  │ • Visual Reports │            │
│  │ • Connection     │  │   Metrics        │  │   Baselines      │  │ • Alerts         │            │
│  │   Management     │  │ • Real-time      │  │ • Regression     │  │ • Comparisons    │            │
│  │ • Industry       │  │   Monitoring     │  │   Detection      │  │ • Recommendations│            │
│  │   Specific       │  │ • Query Analysis │  │ • Trend Analysis │  │ • CI/CD Reports  │            │
│  │   Scenarios      │  │                  │  │                  │  │                  │            │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘  └──────────────────┘            │
│           │                      │                      │                      │                     │
│           └──────────────────────┼──────────────────────┼──────────────────────┘                     │
│                                  │                      │                                            │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────────┤
│  │                              Database Under Test                                                 │
│  └──────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                       │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Performance Benchmarking Schema

### Core Performance Tables
```sql
-- Performance Test Registry
CREATE TABLE perf_mgmt.performance_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_name VARCHAR(255) NOT NULL,
  test_version VARCHAR(50) NOT NULL,
  test_type test_type_enum NOT NULL, -- 'BASELINE', 'LOAD', 'STRESS', 'ENDURANCE', 'SPIKE', 'VOLUME'
  industry_context industry_enum, -- Industry-specific context
  target_schema VARCHAR(100),
  description TEXT,
  test_configuration JSONB NOT NULL,
  baseline_thresholds JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,
  tags TEXT[],
  
  CONSTRAINT uk_perf_test_name_version UNIQUE (test_name, test_version)
);

-- Performance Test Executions
CREATE TABLE perf_mgmt.test_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID REFERENCES perf_mgmt.performance_tests(id) NOT NULL,
  execution_environment VARCHAR(100) NOT NULL, -- 'development', 'staging', 'production'
  database_version VARCHAR(50) NOT NULL,
  postgresql_config JSONB,
  hardware_specs JSONB,
  execution_status execution_status_enum NOT NULL, -- 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED'
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  total_connections INTEGER,
  concurrent_users INTEGER,
  test_data_size BIGINT,
  
  -- Performance Results Summary
  avg_response_time_ms NUMERIC(10,3),
  p50_response_time_ms NUMERIC(10,3),
  p95_response_time_ms NUMERIC(10,3),
  p99_response_time_ms NUMERIC(10,3),
  max_response_time_ms NUMERIC(10,3),
  throughput_tps NUMERIC(10,2),
  error_rate_percent NUMERIC(5,2),
  cpu_usage_percent NUMERIC(5,2),
  memory_usage_percent NUMERIC(5,2),
  disk_io_mb_per_sec NUMERIC(10,2),
  
  -- Comparison with baseline
  baseline_execution_id UUID REFERENCES perf_mgmt.test_executions(id),
  performance_change_percent NUMERIC(10,2),
  regression_detected BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);

-- Detailed Performance Metrics (Time Series)
CREATE TABLE perf_mgmt.performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id UUID REFERENCES perf_mgmt.test_executions(id) NOT NULL,
  metric_timestamp TIMESTAMPTZ NOT NULL,
  metric_type VARCHAR(100) NOT NULL, -- 'response_time', 'throughput', 'cpu', 'memory', 'disk_io', 'connections'
  metric_value NUMERIC(15,6) NOT NULL,
  metric_unit VARCHAR(50) NOT NULL,
  additional_context JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Query Performance Analysis
CREATE TABLE perf_mgmt.query_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id UUID REFERENCES perf_mgmt.test_executions(id) NOT NULL,
  query_hash VARCHAR(64) NOT NULL,
  query_text TEXT NOT NULL,
  query_type VARCHAR(50) NOT NULL, -- 'SELECT', 'INSERT', 'UPDATE', 'DELETE'
  table_names TEXT[] NOT NULL,
  execution_count INTEGER NOT NULL,
  total_time_ms NUMERIC(12,3) NOT NULL,
  avg_time_ms NUMERIC(10,3) NOT NULL,
  min_time_ms NUMERIC(10,3) NOT NULL,
  max_time_ms NUMERIC(10,3) NOT NULL,
  stddev_time_ms NUMERIC(10,3) NOT NULL,
  
  -- PostgreSQL specific metrics
  shared_blks_hit BIGINT,
  shared_blks_read BIGINT,
  shared_blks_dirtied BIGINT,
  shared_blks_written BIGINT,
  local_blks_hit BIGINT,
  local_blks_read BIGINT,
  temp_blks_read BIGINT,
  temp_blks_written BIGINT,
  blk_read_time NUMERIC(10,3),
  blk_write_time NUMERIC(10,3),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Baselines
CREATE TABLE perf_mgmt.performance_baselines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_name VARCHAR(255) NOT NULL,
  baseline_type VARCHAR(50) NOT NULL, -- 'INITIAL', 'ROLLING', 'MANUAL'
  baseline_date TIMESTAMPTZ NOT NULL,
  baseline_execution_id UUID REFERENCES perf_mgmt.test_executions(id) NOT NULL,
  
  -- Baseline Metrics
  baseline_response_time_p95 NUMERIC(10,3) NOT NULL,
  baseline_response_time_p99 NUMERIC(10,3) NOT NULL,
  baseline_throughput_tps NUMERIC(10,2) NOT NULL,
  baseline_error_rate_percent NUMERIC(5,2) NOT NULL,
  baseline_cpu_usage_percent NUMERIC(5,2) NOT NULL,
  baseline_memory_usage_percent NUMERIC(5,2) NOT NULL,
  
  -- Thresholds for regression detection
  response_time_threshold_percent NUMERIC(5,2) DEFAULT 20.0,
  throughput_threshold_percent NUMERIC(5,2) DEFAULT -15.0,
  error_rate_threshold_percent NUMERIC(5,2) DEFAULT 5.0,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  notes TEXT,
  
  CONSTRAINT uk_baseline_test_type UNIQUE (test_name, baseline_type, is_active) DEFERRABLE INITIALLY DEFERRED
);
```

### Load Testing Scenarios Schema
```sql
-- Load Test Scenarios
CREATE TABLE perf_mgmt.load_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_name VARCHAR(255) NOT NULL,
  industry_type industry_enum NOT NULL,
  scenario_description TEXT NOT NULL,
  
  -- Load Parameters
  virtual_users INTEGER NOT NULL,
  ramp_up_duration_seconds INTEGER NOT NULL,
  test_duration_seconds INTEGER NOT NULL,
  ramp_down_duration_seconds INTEGER DEFAULT 60,
  
  -- Workload Distribution
  workload_pattern JSONB NOT NULL, -- Distribution of different operations
  data_size_requirements JSONB, -- Required test data volumes
  
  -- Success Criteria
  max_avg_response_time_ms INTEGER NOT NULL,
  max_p95_response_time_ms INTEGER NOT NULL,
  min_throughput_tps NUMERIC(10,2) NOT NULL,
  max_error_rate_percent NUMERIC(5,2) NOT NULL,
  max_cpu_usage_percent NUMERIC(5,2) DEFAULT 80.0,
  max_memory_usage_percent NUMERIC(5,2) DEFAULT 90.0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true
);

-- Workload Operations
CREATE TABLE perf_mgmt.workload_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id UUID REFERENCES perf_mgmt.load_scenarios(id) NOT NULL,
  operation_name VARCHAR(255) NOT NULL,
  operation_type VARCHAR(100) NOT NULL, -- 'READ', 'write', 'mixed'
  sql_template TEXT NOT NULL,
  parameter_generators JSONB NOT NULL, -- How to generate test parameters
  weight_percentage NUMERIC(5,2) NOT NULL, -- Percentage of total operations
  think_time_ms INTEGER DEFAULT 0,
  
  -- Industry-specific context
  business_context TEXT,
  peak_hours_multiplier NUMERIC(5,2) DEFAULT 1.0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Synthetic Workload Generation

### Industry-Specific Load Patterns
```sql
-- Home Services Load Pattern
INSERT INTO perf_mgmt.load_scenarios (
  scenario_name, industry_type, scenario_description,
  virtual_users, ramp_up_duration_seconds, test_duration_seconds,
  workload_pattern, max_avg_response_time_ms, max_p95_response_time_ms,
  min_throughput_tps, max_error_rate_percent
) VALUES (
  'HS Peak Season Load', 'HOME_SERVICES', 
  'Simulates peak season load with high work order creation and customer interactions',
  500, 300, 1800, -- 500 users, 5 min ramp-up, 30 min test
  '{
    "work_order_creation": 25,
    "customer_queries": 30,
    "technician_updates": 20,
    "invoice_generation": 15,
    "payment_processing": 10
  }',
  200, 500, 100.0, 2.0
);

-- Restaurant Rush Hour Pattern
INSERT INTO perf_mgmt.load_scenarios (
  scenario_name, industry_type, scenario_description,
  virtual_users, ramp_up_duration_seconds, test_duration_seconds,
  workload_pattern, max_avg_response_time_ms, max_p95_response_time_ms,
  min_throughput_tps, max_error_rate_percent
) VALUES (
  'Restaurant Rush Hour', 'RESTAURANT',
  'Simulates lunch/dinner rush with high order volume and kitchen operations',
  800, 180, 2700, -- 800 users, 3 min ramp-up, 45 min test
  '{
    "order_creation": 35,
    "kitchen_updates": 25,
    "pos_transactions": 20,
    "inventory_checks": 10,
    "customer_management": 10
  }',
  150, 300, 200.0, 1.5
);

-- Automotive Service Load
INSERT INTO perf_mgmt.load_scenarios (
  scenario_name, industry_type, scenario_description,
  virtual_users, ramp_up_duration_seconds, test_duration_seconds,
  workload_pattern, max_avg_response_time_ms, max_p95_response_time_ms,
  min_throughput_tps, max_error_rate_percent
) VALUES (
  'Auto Service Peak', 'AUTOMOTIVE',
  'Simulates busy auto service center with multiple concurrent repair orders',
  300, 240, 3600, -- 300 users, 4 min ramp-up, 60 min test
  '{
    "repair_order_creation": 30,
    "diagnostic_updates": 25,
    "parts_inventory": 20,
    "customer_communication": 15,
    "billing_operations": 10
  }',
  250, 600, 75.0, 2.5
);
```

### Workload Operation Templates
```sql
-- Home Services Operations
INSERT INTO perf_mgmt.workload_operations (scenario_id, operation_name, operation_type, sql_template, parameter_generators, weight_percentage) VALUES
((SELECT id FROM perf_mgmt.load_scenarios WHERE scenario_name = 'HS Peak Season Load'),
 'Create Work Order', 'write',
 'INSERT INTO hs.work_orders (business_id, customer_id, service_type, priority, description) VALUES ($1, $2, $3, $4, $5) RETURNING id',
 '{"business_id": "random_tenant", "customer_id": "random_customer", "service_type": "random_service", "priority": "weighted_priority", "description": "generated_description"}',
 25.0),

((SELECT id FROM perf_mgmt.load_scenarios WHERE scenario_name = 'HS Peak Season Load'),
 'Search Available Technicians', 'read',
 'SELECT t.id, t.name, t.skills, t.current_location FROM hs.technicians t JOIN hs.technician_availability ta ON t.id = ta.technician_id WHERE t.business_id = $1 AND ta.available_date = $2 AND ta.is_available = true',
 '{"business_id": "random_tenant", "available_date": "current_date"}',
 20.0),

((SELECT id FROM perf_mgmt.load_scenarios WHERE scenario_name = 'HS Peak Season Load'),
 'Update Work Order Status', 'write',
 'UPDATE hs.work_orders SET status = $1, updated_at = NOW() WHERE id = $2 AND business_id = $3',
 '{"status": "progressive_status", "work_order_id": "existing_work_order", "business_id": "random_tenant"}',
 20.0);

-- Restaurant Operations
INSERT INTO perf_mgmt.workload_operations (scenario_id, operation_name, operation_type, sql_template, parameter_generators, weight_percentage) VALUES
((SELECT id FROM perf_mgmt.load_scenarios WHERE scenario_name = 'Restaurant Rush Hour'),
 'Create Order', 'write',
 'INSERT INTO rest.orders (business_id, table_id, order_items, total_amount, status) VALUES ($1, $2, $3, $4, $5) RETURNING id',
 '{"business_id": "random_tenant", "table_id": "random_table", "order_items": "generated_order_items", "total_amount": "calculated_total", "status": "PENDING"}',
 35.0),

((SELECT id FROM perf_mgmt.load_scenarios WHERE scenario_name = 'Restaurant Rush Hour'),
 'Kitchen Display Update', 'write',
 'UPDATE rest.kitchen_queue SET status = $1, prep_time_actual = $2, updated_at = NOW() WHERE order_id = $3',
 '{"status": "cooking_status", "prep_time_actual": "random_prep_time", "order_id": "active_order"}',
 25.0),

((SELECT id FROM perf_mgmt.load_scenarios WHERE scenario_name = 'Restaurant Rush Hour'),
 'POS Transaction', 'write',
 'INSERT INTO rest.pos_transactions (business_id, order_id, payment_method, amount, transaction_type) VALUES ($1, $2, $3, $4, $5)',
 '{"business_id": "random_tenant", "order_id": "completed_order", "payment_method": "random_payment", "amount": "order_total", "transaction_type": "SALE"}',
 20.0);
```

---

## Performance Testing Engine

### Load Generation Functions
```sql
-- Performance Test Execution Function
CREATE OR REPLACE FUNCTION perf_mgmt.execute_performance_test(
  p_test_name VARCHAR,
  p_execution_environment VARCHAR DEFAULT 'development',
  p_custom_config JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_test_record RECORD;
  v_execution_id UUID;
  v_scenario_record RECORD;
  v_start_time TIMESTAMPTZ;
BEGIN
  -- Get test configuration
  SELECT * INTO v_test_record 
  FROM perf_mgmt.performance_tests 
  WHERE test_name = p_test_name AND is_active = true
  ORDER BY test_version DESC 
  LIMIT 1;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Performance test % not found', p_test_name;
  END IF;
  
  -- Create execution record
  v_execution_id := gen_random_uuid();
  v_start_time := NOW();
  
  INSERT INTO perf_mgmt.test_executions (
    id, test_id, execution_environment, database_version,
    postgresql_config, hardware_specs, execution_status,
    started_at, total_connections, concurrent_users
  ) VALUES (
    v_execution_id, v_test_record.id, p_execution_environment,
    version(), -- PostgreSQL version
    (SELECT setting FROM pg_settings WHERE name = 'shared_buffers'), -- Sample config
    '{"cpu_cores": 8, "memory_gb": 32, "disk_type": "SSD"}', -- Sample specs
    'RUNNING',
    v_start_time,
    COALESCE((p_custom_config->>'total_connections')::INTEGER, 100),
    COALESCE((p_custom_config->>'concurrent_users')::INTEGER, 50)
  );
  
  -- Log test start
  PERFORM perf_mgmt.log_performance_event(
    v_execution_id,
    'TEST_STARTED',
    format('Performance test %s started in %s environment', p_test_name, p_execution_environment)
  );
  
  RETURN v_execution_id;
END;
$$ LANGUAGE plpgsql;

-- Workload Simulation Function
CREATE OR REPLACE FUNCTION perf_mgmt.simulate_workload(
  p_execution_id UUID,
  p_operation_name VARCHAR,
  p_duration_seconds INTEGER DEFAULT 60
) RETURNS VOID AS $$
DECLARE
  v_start_time TIMESTAMPTZ := NOW();
  v_end_time TIMESTAMPTZ := v_start_time + (p_duration_seconds || ' seconds')::INTERVAL;
  v_operation_count INTEGER := 0;
  v_total_time NUMERIC := 0;
  v_min_time NUMERIC := 999999;
  v_max_time NUMERIC := 0;
  v_operation_start TIMESTAMPTZ;
  v_operation_end TIMESTAMPTZ;
  v_operation_time NUMERIC;
BEGIN
  -- Simulate continuous workload
  WHILE NOW() < v_end_time LOOP
    v_operation_start := NOW();
    
    -- Execute simulated operation (placeholder)
    PERFORM pg_sleep(random() * 0.1); -- Simulate 0-100ms operation
    
    v_operation_end := NOW();
    v_operation_time := EXTRACT(EPOCH FROM (v_operation_end - v_operation_start)) * 1000;
    
    -- Update statistics
    v_operation_count := v_operation_count + 1;
    v_total_time := v_total_time + v_operation_time;
    v_min_time := LEAST(v_min_time, v_operation_time);
    v_max_time := GREATEST(v_max_time, v_operation_time);
    
    -- Log metrics every 10 seconds
    IF v_operation_count % 100 = 0 THEN
      INSERT INTO perf_mgmt.performance_metrics (
        execution_id, metric_timestamp, metric_type, metric_value, metric_unit
      ) VALUES (
        p_execution_id, NOW(), 'response_time_avg',
        v_total_time / v_operation_count, 'milliseconds'
      );
    END IF;
    
    -- Small delay to prevent overwhelming
    PERFORM pg_sleep(0.001);
  END LOOP;
  
  -- Record final operation statistics
  INSERT INTO perf_mgmt.query_performance (
    execution_id, query_hash, query_text, query_type,
    table_names, execution_count, total_time_ms,
    avg_time_ms, min_time_ms, max_time_ms
  ) VALUES (
    p_execution_id,
    md5(p_operation_name),
    'Simulated operation: ' || p_operation_name,
    'SIMULATED',
    ARRAY[p_operation_name],
    v_operation_count,
    v_total_time,
    v_total_time / v_operation_count,
    v_min_time,
    v_max_time
  );
END;
$$ LANGUAGE plpgsql;
```

### Automated Baseline Management
```sql
-- Baseline Comparison Function
CREATE OR REPLACE FUNCTION perf_mgmt.compare_with_baseline(
  p_execution_id UUID
) RETURNS TABLE (
  metric_name VARCHAR,
  current_value NUMERIC,
  baseline_value NUMERIC,
  change_percent NUMERIC,
  within_threshold BOOLEAN,
  severity VARCHAR
) AS $$
DECLARE
  v_test_name VARCHAR;
  v_baseline RECORD;
  v_current RECORD;
BEGIN
  -- Get test name for this execution
  SELECT pt.test_name INTO v_test_name
  FROM perf_mgmt.test_executions te
  JOIN perf_mgmt.performance_tests pt ON te.test_id = pt.id
  WHERE te.id = p_execution_id;
  
  -- Get current baseline
  SELECT * INTO v_baseline
  FROM perf_mgmt.performance_baselines
  WHERE test_name = v_test_name AND is_active = true
  ORDER BY baseline_date DESC
  LIMIT 1;
  
  IF NOT FOUND THEN
    RAISE NOTICE 'No baseline found for test %', v_test_name;
    RETURN;
  END IF;
  
  -- Get current execution metrics
  SELECT * INTO v_current
  FROM perf_mgmt.test_executions
  WHERE id = p_execution_id;
  
  -- Compare P95 Response Time
  RETURN QUERY SELECT
    'P95 Response Time'::VARCHAR,
    v_current.p95_response_time_ms,
    v_baseline.baseline_response_time_p95,
    ((v_current.p95_response_time_ms - v_baseline.baseline_response_time_p95) / v_baseline.baseline_response_time_p95 * 100),
    (((v_current.p95_response_time_ms - v_baseline.baseline_response_time_p95) / v_baseline.baseline_response_time_p95 * 100) <= v_baseline.response_time_threshold_percent),
    CASE 
      WHEN ((v_current.p95_response_time_ms - v_baseline.baseline_response_time_p95) / v_baseline.baseline_response_time_p95 * 100) > v_baseline.response_time_threshold_percent * 2 THEN 'CRITICAL'
      WHEN ((v_current.p95_response_time_ms - v_baseline.baseline_response_time_p95) / v_baseline.baseline_response_time_p95 * 100) > v_baseline.response_time_threshold_percent THEN 'WARNING'
      ELSE 'OK'
    END;
  
  -- Compare Throughput
  RETURN QUERY SELECT
    'Throughput TPS'::VARCHAR,
    v_current.throughput_tps,
    v_baseline.baseline_throughput_tps,
    ((v_current.throughput_tps - v_baseline.baseline_throughput_tps) / v_baseline.baseline_throughput_tps * 100),
    (((v_current.throughput_tps - v_baseline.baseline_throughput_tps) / v_baseline.baseline_throughput_tps * 100) >= v_baseline.throughput_threshold_percent),
    CASE 
      WHEN ((v_current.throughput_tps - v_baseline.baseline_throughput_tps) / v_baseline.baseline_throughput_tps * 100) < v_baseline.throughput_threshold_percent * 2 THEN 'CRITICAL'
      WHEN ((v_current.throughput_tps - v_baseline.baseline_throughput_tps) / v_baseline.baseline_throughput_tps * 100) < v_baseline.throughput_threshold_percent THEN 'WARNING'
      ELSE 'OK'
    END;
  
  -- Compare Error Rate
  RETURN QUERY SELECT
    'Error Rate'::VARCHAR,
    v_current.error_rate_percent,
    v_baseline.baseline_error_rate_percent,
    (v_current.error_rate_percent - v_baseline.baseline_error_rate_percent),
    (v_current.error_rate_percent <= (v_baseline.baseline_error_rate_percent + v_baseline.error_rate_threshold_percent)),
    CASE 
      WHEN v_current.error_rate_percent > (v_baseline.baseline_error_rate_percent + v_baseline.error_rate_threshold_percent * 2) THEN 'CRITICAL'
      WHEN v_current.error_rate_percent > (v_baseline.baseline_error_rate_percent + v_baseline.error_rate_threshold_percent) THEN 'WARNING'
      ELSE 'OK'
    END;
END;
$$ LANGUAGE plpgsql;

-- Automatic Baseline Update
CREATE OR REPLACE FUNCTION perf_mgmt.update_rolling_baseline(
  p_test_name VARCHAR
) RETURNS VOID AS $$
DECLARE
  v_avg_metrics RECORD;
  v_existing_baseline UUID;
BEGIN
  -- Calculate rolling average from last 10 successful executions
  SELECT 
    AVG(p95_response_time_ms) as avg_p95_response_time,
    AVG(p99_response_time_ms) as avg_p99_response_time,
    AVG(throughput_tps) as avg_throughput_tps,
    AVG(error_rate_percent) as avg_error_rate,
    AVG(cpu_usage_percent) as avg_cpu_usage,
    AVG(memory_usage_percent) as avg_memory_usage
  INTO v_avg_metrics
  FROM perf_mgmt.test_executions te
  JOIN perf_mgmt.performance_tests pt ON te.test_id = pt.id
  WHERE pt.test_name = p_test_name 
    AND te.execution_status = 'COMPLETED'
    AND te.regression_detected = false
    AND te.completed_at >= NOW() - INTERVAL '30 days'
  ORDER BY te.completed_at DESC
  LIMIT 10;
  
  IF v_avg_metrics.avg_p95_response_time IS NOT NULL THEN
    -- Deactivate current rolling baseline
    UPDATE perf_mgmt.performance_baselines 
    SET is_active = false
    WHERE test_name = p_test_name AND baseline_type = 'ROLLING' AND is_active = true;
    
    -- Create new rolling baseline
    INSERT INTO perf_mgmt.performance_baselines (
      test_name, baseline_type, baseline_date,
      baseline_response_time_p95, baseline_response_time_p99,
      baseline_throughput_tps, baseline_error_rate_percent,
      baseline_cpu_usage_percent, baseline_memory_usage_percent,
      notes
    ) VALUES (
      p_test_name, 'ROLLING', NOW(),
      v_avg_metrics.avg_p95_response_time, v_avg_metrics.avg_p99_response_time,
      v_avg_metrics.avg_throughput_tps, v_avg_metrics.avg_error_rate,
      v_avg_metrics.avg_cpu_usage, v_avg_metrics.avg_memory_usage,
      'Automated rolling baseline update based on last 10 successful executions'
    );
  END IF;
END;
$$ LANGUAGE plpgsql;
```

---

## Automated Reporting & Alerts

### Performance Report Generation
```sql
-- Comprehensive Performance Report Function
CREATE OR REPLACE FUNCTION perf_mgmt.generate_performance_report(
  p_execution_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_report JSONB;
  v_execution RECORD;
  v_baseline_comparison JSONB;
  v_query_analysis JSONB;
  v_recommendations JSONB;
BEGIN
  -- Get execution details
  SELECT 
    te.*,
    pt.test_name,
    pt.industry_context,
    pt.description
  INTO v_execution
  FROM perf_mgmt.test_executions te
  JOIN perf_mgmt.performance_tests pt ON te.test_id = pt.id
  WHERE te.id = p_execution_id;
  
  -- Generate baseline comparison
  SELECT jsonb_agg(
    jsonb_build_object(
      'metric', metric_name,
      'current_value', current_value,
      'baseline_value', baseline_value,
      'change_percent', change_percent,
      'within_threshold', within_threshold,
      'severity', severity
    )
  ) INTO v_baseline_comparison
  FROM perf_mgmt.compare_with_baseline(p_execution_id);
  
  -- Analyze query performance
  SELECT jsonb_agg(
    jsonb_build_object(
      'query_type', query_type,
      'avg_time_ms', avg_time_ms,
      'execution_count', execution_count,
      'total_time_ms', total_time_ms,
      'performance_impact', 
        CASE 
          WHEN avg_time_ms > 1000 THEN 'HIGH'
          WHEN avg_time_ms > 500 THEN 'MEDIUM'
          ELSE 'LOW'
        END
    )
  ) INTO v_query_analysis
  FROM perf_mgmt.query_performance
  WHERE execution_id = p_execution_id
  ORDER BY total_time_ms DESC
  LIMIT 10;
  
  -- Generate recommendations
  v_recommendations := perf_mgmt.generate_performance_recommendations(p_execution_id);
  
  -- Build comprehensive report
  v_report := jsonb_build_object(
    'execution_summary', jsonb_build_object(
      'execution_id', v_execution.id,
      'test_name', v_execution.test_name,
      'industry_context', v_execution.industry_context,
      'execution_environment', v_execution.execution_environment,
      'started_at', v_execution.started_at,
      'completed_at', v_execution.completed_at,
      'duration_minutes', ROUND(v_execution.duration_ms / 60000.0, 2),
      'status', v_execution.execution_status
    ),
    'performance_metrics', jsonb_build_object(
      'avg_response_time_ms', v_execution.avg_response_time_ms,
      'p95_response_time_ms', v_execution.p95_response_time_ms,
      'p99_response_time_ms', v_execution.p99_response_time_ms,
      'throughput_tps', v_execution.throughput_tps,
      'error_rate_percent', v_execution.error_rate_percent,
      'cpu_usage_percent', v_execution.cpu_usage_percent,
      'memory_usage_percent', v_execution.memory_usage_percent,
      'regression_detected', v_execution.regression_detected
    ),
    'baseline_comparison', v_baseline_comparison,
    'query_analysis', v_query_analysis,
    'recommendations', v_recommendations,
    'generated_at', NOW()
  );
  
  RETURN v_report;
END;
$$ LANGUAGE plpgsql;

-- Performance Recommendations Engine
CREATE OR REPLACE FUNCTION perf_mgmt.generate_performance_recommendations(
  p_execution_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_recommendations JSONB := '[]'::JSONB;
  v_execution RECORD;
  v_slow_queries INTEGER;
  v_high_cpu BOOLEAN;
  v_high_memory BOOLEAN;
BEGIN
  -- Get execution metrics
  SELECT * INTO v_execution
  FROM perf_mgmt.test_executions
  WHERE id = p_execution_id;
  
  -- Check for slow queries
  SELECT COUNT(*) INTO v_slow_queries
  FROM perf_mgmt.query_performance
  WHERE execution_id = p_execution_id AND avg_time_ms > 1000;
  
  v_high_cpu := v_execution.cpu_usage_percent > 80;
  v_high_memory := v_execution.memory_usage_percent > 85;
  
  -- Generate recommendations based on findings
  IF v_execution.p95_response_time_ms > 1000 THEN
    v_recommendations := v_recommendations || jsonb_build_object(
      'category', 'RESPONSE_TIME',
      'severity', 'HIGH',
      'recommendation', 'P95 response time exceeds 1 second. Consider query optimization and indexing strategy review.',
      'action_items', ARRAY['Review slow queries', 'Analyze query execution plans', 'Consider additional indexing']
    );
  END IF;
  
  IF v_slow_queries > 0 THEN
    v_recommendations := v_recommendations || jsonb_build_object(
      'category', 'QUERY_PERFORMANCE',
      'severity', 'MEDIUM',
      'recommendation', format('%s queries detected with >1s response time. Review and optimize slow queries.', v_slow_queries),
      'action_items', ARRAY['Analyze slow query patterns', 'Review query execution plans', 'Consider query rewriting or indexing']
    );
  END IF;
  
  IF v_high_cpu THEN
    v_recommendations := v_recommendations || jsonb_build_object(
      'category', 'RESOURCE_USAGE',
      'severity', 'HIGH',
      'recommendation', 'High CPU usage detected. Consider connection pooling optimization or query efficiency improvements.',
      'action_items', ARRAY['Review connection pool settings', 'Analyze CPU-intensive queries', 'Consider read replicas for read-heavy workloads']
    );
  END IF;
  
  IF v_high_memory THEN
    v_recommendations := v_recommendations || jsonb_build_object(
      'category', 'RESOURCE_USAGE',
      'severity', 'MEDIUM',
      'recommendation', 'High memory usage detected. Review memory allocation and consider memory optimization.',
      'action_items', ARRAY['Review shared_buffers configuration', 'Analyze memory-intensive operations', 'Consider result set optimization']
    );
  END IF;
  
  IF v_execution.error_rate_percent > 5 THEN
    v_recommendations := v_recommendations || jsonb_build_object(
      'category', 'ERROR_RATE',
      'severity', 'CRITICAL',
      'recommendation', 'High error rate detected. Investigate error patterns and implement error handling improvements.',
      'action_items', ARRAY['Review error logs', 'Analyze error patterns', 'Implement better error handling', 'Review transaction isolation levels']
    );
  END IF;
  
  -- If no specific issues found, provide general optimization suggestions
  IF jsonb_array_length(v_recommendations) = 0 THEN
    v_recommendations := v_recommendations || jsonb_build_object(
      'category', 'OPTIMIZATION',
      'severity', 'LOW',
      'recommendation', 'Performance metrics within acceptable ranges. Consider proactive optimizations for continued performance.',
      'action_items', ARRAY['Regular index maintenance', 'Monitor query performance trends', 'Consider performance testing schedule']
    );
  END IF;
  
  RETURN v_recommendations;
END;
$$ LANGUAGE plpgsql;
```

### Alert System Integration
```sql
-- Performance Alert Configuration
CREATE TABLE perf_mgmt.alert_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_name VARCHAR(255) NOT NULL,
  alert_type VARCHAR(100) NOT NULL, -- 'REGRESSION', 'THRESHOLD', 'ERROR_RATE'
  industry_context industry_enum,
  
  -- Threshold Configuration
  threshold_config JSONB NOT NULL,
  alert_severity alert_severity_enum NOT NULL, -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
  
  -- Notification Settings
  notification_channels JSONB NOT NULL, -- Email, Slack, etc.
  notification_frequency VARCHAR(50) DEFAULT 'IMMEDIATE', -- 'IMMEDIATE', 'DAILY', 'WEEKLY'
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Alert Trigger Function
CREATE OR REPLACE FUNCTION perf_mgmt.check_performance_alerts(
  p_execution_id UUID
) RETURNS VOID AS $$
DECLARE
  v_alert_config RECORD;
  v_execution RECORD;
  v_baseline_comparison RECORD;
  v_alert_triggered BOOLEAN;
BEGIN
  -- Get execution details
  SELECT * INTO v_execution
  FROM perf_mgmt.test_executions
  WHERE id = p_execution_id;
  
  -- Check each active alert configuration
  FOR v_alert_config IN 
    SELECT * FROM perf_mgmt.alert_configurations 
    WHERE is_active = true
  LOOP
    v_alert_triggered := false;
    
    -- Check regression alerts
    IF v_alert_config.alert_type = 'REGRESSION' THEN
      IF v_execution.regression_detected THEN
        v_alert_triggered := true;
      END IF;
    END IF;
    
    -- Check threshold alerts
    IF v_alert_config.alert_type = 'THRESHOLD' THEN
      IF v_execution.p95_response_time_ms > (v_alert_config.threshold_config->>'max_p95_response_time_ms')::NUMERIC THEN
        v_alert_triggered := true;
      END IF;
      
      IF v_execution.error_rate_percent > (v_alert_config.threshold_config->>'max_error_rate_percent')::NUMERIC THEN
        v_alert_triggered := true;
      END IF;
    END IF;
    
    -- Send alert if triggered
    IF v_alert_triggered THEN
      PERFORM perf_mgmt.send_performance_alert(
        v_alert_config.id,
        p_execution_id,
        v_alert_config.alert_severity,
        format('Performance alert triggered: %s', v_alert_config.alert_name)
      );
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Alert Notification Function
CREATE OR REPLACE FUNCTION perf_mgmt.send_performance_alert(
  p_alert_config_id UUID,
  p_execution_id UUID,
  p_severity alert_severity_enum,
  p_message TEXT
) RETURNS VOID AS $$
DECLARE
  v_alert_record JSONB;
BEGIN
  -- Create alert record
  v_alert_record := jsonb_build_object(
    'alert_config_id', p_alert_config_id,
    'execution_id', p_execution_id,
    'severity', p_severity,
    'message', p_message,
    'triggered_at', NOW(),
    'alert_data', perf_mgmt.generate_performance_report(p_execution_id)
  );
  
  -- Log alert (would integrate with external notification systems)
  INSERT INTO system_core.system_events (
    event_type, event_subtype, event_data,
    severity, created_at
  ) VALUES (
    'PERFORMANCE_ALERT', p_severity::TEXT,
    v_alert_record,
    p_severity::TEXT, NOW()
  );
  
  -- Future: Integration with external notification systems
  -- - Send Slack notification
  -- - Send email alert
  -- - Create monitoring dashboard alert
END;
$$ LANGUAGE plpgsql;
```

---

## CI/CD Integration

### Automated Performance Testing
```sql
-- CI/CD Performance Test Integration
CREATE OR REPLACE FUNCTION perf_mgmt.run_ci_performance_tests(
  p_git_commit_hash VARCHAR,
  p_branch_name VARCHAR,
  p_environment VARCHAR DEFAULT 'staging'
) RETURNS JSONB AS $$
DECLARE
  v_test_results JSONB := '[]'::JSONB;
  v_test_suite RECORD;
  v_execution_id UUID;
  v_test_result JSONB;
  v_overall_status VARCHAR := 'PASSED';
BEGIN
  -- Run all CI-enabled performance tests
  FOR v_test_suite IN 
    SELECT * FROM perf_mgmt.performance_tests 
    WHERE is_active = true 
      AND test_configuration->>'ci_enabled' = 'true'
  LOOP
    -- Execute performance test
    v_execution_id := perf_mgmt.execute_performance_test(
      v_test_suite.test_name,
      p_environment,
      jsonb_build_object(
        'git_commit', p_git_commit_hash,
        'branch', p_branch_name,
        'ci_execution', true
      )
    );
    
    -- Simulate test execution (would be actual load test)
    PERFORM pg_sleep(2); -- Simulate test duration
    
    -- Update execution with simulated results
    UPDATE perf_mgmt.test_executions SET
      execution_status = 'COMPLETED',
      completed_at = NOW(),
      duration_ms = 120000, -- 2 minutes
      avg_response_time_ms = 150 + random() * 100,
      p95_response_time_ms = 400 + random() * 200,
      p99_response_time_ms = 800 + random() * 400,
      throughput_tps = 80 + random() * 40,
      error_rate_percent = random() * 2,
      cpu_usage_percent = 60 + random() * 20,
      memory_usage_percent = 70 + random() * 15
    WHERE id = v_execution_id;
    
    -- Check for regressions
    PERFORM perf_mgmt.detect_performance_regression(v_execution_id);
    
    -- Generate test result
    v_test_result := jsonb_build_object(
      'test_name', v_test_suite.test_name,
      'execution_id', v_execution_id,
      'status', 
        CASE 
          WHEN (SELECT regression_detected FROM perf_mgmt.test_executions WHERE id = v_execution_id) THEN 'FAILED'
          ELSE 'PASSED'
        END,
      'report', perf_mgmt.generate_performance_report(v_execution_id)
    );
    
    -- Update overall status
    IF v_test_result->>'status' = 'FAILED' THEN
      v_overall_status := 'FAILED';
    END IF;
    
    v_test_results := v_test_results || v_test_result;
  END LOOP;
  
  -- Return comprehensive CI results
  RETURN jsonb_build_object(
    'overall_status', v_overall_status,
    'git_commit', p_git_commit_hash,
    'branch', p_branch_name,
    'environment', p_environment,
    'executed_at', NOW(),
    'test_results', v_test_results,
    'summary', jsonb_build_object(
      'total_tests', jsonb_array_length(v_test_results),
      'passed_tests', (
        SELECT COUNT(*) 
        FROM jsonb_array_elements(v_test_results) t 
        WHERE t->>'status' = 'PASSED'
      ),
      'failed_tests', (
        SELECT COUNT(*) 
        FROM jsonb_array_elements(v_test_results) t 
        WHERE t->>'status' = 'FAILED'
      )
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Regression Detection Function
CREATE OR REPLACE FUNCTION perf_mgmt.detect_performance_regression(
  p_execution_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_regression_detected BOOLEAN := false;
  v_comparison RECORD;
BEGIN
  -- Compare with baseline and detect regressions
  FOR v_comparison IN 
    SELECT * FROM perf_mgmt.compare_with_baseline(p_execution_id)
  LOOP
    IF NOT v_comparison.within_threshold THEN
      v_regression_detected := true;
      EXIT; -- Exit loop on first regression
    END IF;
  END LOOP;
  
  -- Update execution record
  UPDATE perf_mgmt.test_executions 
  SET regression_detected = v_regression_detected
  WHERE id = p_execution_id;
  
  -- Trigger alerts if regression detected
  IF v_regression_detected THEN
    PERFORM perf_mgmt.check_performance_alerts(p_execution_id);
  END IF;
  
  RETURN v_regression_detected;
END;
$$ LANGUAGE plpgsql;
```

---

## Performance Monitoring Dashboard

### Real-Time Performance Metrics
```sql
-- Performance Dashboard Views
CREATE OR REPLACE VIEW perf_mgmt.performance_dashboard AS
SELECT 
  pt.test_name,
  pt.industry_context,
  pt.test_type,
  te.execution_environment,
  te.started_at,
  te.execution_status,
  te.avg_response_time_ms,
  te.p95_response_time_ms,
  te.p99_response_time_ms,
  te.throughput_tps,
  te.error_rate_percent,
  te.cpu_usage_percent,
  te.memory_usage_percent,
  te.regression_detected,
  CASE 
    WHEN te.regression_detected THEN 'REGRESSION'
    WHEN te.error_rate_percent > 5 THEN 'HIGH_ERROR_RATE'
    WHEN te.p95_response_time_ms > 1000 THEN 'SLOW_RESPONSE'
    WHEN te.cpu_usage_percent > 80 THEN 'HIGH_CPU'
    ELSE 'HEALTHY'
  END as health_status,
  pb.baseline_response_time_p95,
  pb.baseline_throughput_tps,
  pb.baseline_error_rate_percent
FROM perf_mgmt.test_executions te
JOIN perf_mgmt.performance_tests pt ON te.test_id = pt.id
LEFT JOIN perf_mgmt.performance_baselines pb ON pt.test_name = pb.test_name AND pb.is_active = true
WHERE te.started_at >= NOW() - INTERVAL '7 days'
ORDER BY te.started_at DESC;

-- Performance Trends View
CREATE OR REPLACE VIEW perf_mgmt.performance_trends AS
SELECT 
  pt.test_name,
  pt.industry_context,
  DATE_TRUNC('hour', te.started_at) as time_bucket,
  AVG(te.avg_response_time_ms) as avg_response_time,
  AVG(te.p95_response_time_ms) as avg_p95_response_time,
  AVG(te.throughput_tps) as avg_throughput,
  AVG(te.error_rate_percent) as avg_error_rate,
  COUNT(*) as execution_count,
  COUNT(CASE WHEN te.regression_detected THEN 1 END) as regression_count
FROM perf_mgmt.test_executions te
JOIN perf_mgmt.performance_tests pt ON te.test_id = pt.id
WHERE te.execution_status = 'COMPLETED'
  AND te.started_at >= NOW() - INTERVAL '30 days'
GROUP BY pt.test_name, pt.industry_context, DATE_TRUNC('hour', te.started_at)
ORDER BY time_bucket DESC;

-- Top Performance Issues View
CREATE OR REPLACE VIEW perf_mgmt.top_performance_issues AS
SELECT 
  qp.query_type,
  qp.table_names,
  LEFT(qp.query_text, 100) as query_preview,
  AVG(qp.avg_time_ms) as avg_execution_time,
  SUM(qp.execution_count) as total_executions,
  SUM(qp.total_time_ms) as total_time_consumed,
  COUNT(DISTINCT qp.execution_id) as affected_test_runs,
  MAX(qp.max_time_ms) as max_execution_time
FROM perf_mgmt.query_performance qp
JOIN perf_mgmt.test_executions te ON qp.execution_id = te.id
WHERE te.started_at >= NOW() - INTERVAL '7 days'
  AND qp.avg_time_ms > 100 -- Focus on queries taking more than 100ms
GROUP BY qp.query_type, qp.table_names, LEFT(qp.query_text, 100)
ORDER BY total_time_consumed DESC
LIMIT 50;
```

---

## Usage Examples

### Setting Up Performance Tests
```sql
-- Example: Create Home Services Peak Load Test
INSERT INTO perf_mgmt.performance_tests (
  test_name, test_version, test_type, industry_context,
  description, test_configuration, baseline_thresholds
) VALUES (
  'HS Complete Workflow Test', '1.0', 'LOAD', 'HOME_SERVICES',
  'Complete end-to-end workflow test for home services operations including work orders, scheduling, and billing',
  '{
    "virtual_users": 200,
    "test_duration_seconds": 1800,
    "ramp_up_seconds": 300,
    "workload_mix": {
      "work_order_operations": 40,
      "customer_management": 25,
      "technician_scheduling": 20,
      "billing_operations": 15
    },
    "ci_enabled": true,
    "environments": ["staging", "production"]
  }',
  '{
    "max_avg_response_time_ms": 300,
    "max_p95_response_time_ms": 800,
    "max_p99_response_time_ms": 1500,
    "min_throughput_tps": 50,
    "max_error_rate_percent": 2.0,
    "max_cpu_usage_percent": 75,
    "max_memory_usage_percent": 85
  }'
);

-- Execute Performance Test
SELECT perf_mgmt.execute_performance_test('HS Complete Workflow Test', 'staging');

-- Run CI Performance Testing Suite
SELECT perf_mgmt.run_ci_performance_tests('abc123def', 'main', 'staging');
```

### Performance Analysis Queries
```sql
-- Analyze Recent Performance Trends
SELECT * FROM perf_mgmt.performance_trends 
WHERE test_name = 'HS Complete Workflow Test' 
  AND time_bucket >= NOW() - INTERVAL '24 hours'
ORDER BY time_bucket DESC;

-- Identify Performance Regressions
SELECT 
  te.id,
  pt.test_name,
  te.started_at,
  te.p95_response_time_ms,
  te.throughput_tps,
  te.error_rate_percent,
  te.performance_change_percent
FROM perf_mgmt.test_executions te
JOIN perf_mgmt.performance_tests pt ON te.test_id = pt.id
WHERE te.regression_detected = true
  AND te.started_at >= NOW() - INTERVAL '7 days'
ORDER BY te.started_at DESC;

-- Get Performance Recommendations
SELECT perf_mgmt.generate_performance_recommendations('execution-id-here');
```

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Deploy performance testing schema
- [ ] Implement core load generation functions
- [ ] Create basic industry-specific test scenarios
- [ ] Set up baseline management system

### Phase 2: Advanced Testing (Week 3-4)
- [ ] Implement synthetic workload generation
- [ ] Deploy automated regression detection
- [ ] Create performance reporting system
- [ ] Set up alert configurations

### Phase 3: CI/CD Integration (Week 5-6)
- [ ] Integrate with CI/CD pipelines
- [ ] Implement automated performance gates
- [ ] Create performance dashboard views
- [ ] Deploy monitoring and alerting

### Phase 4: Optimization (Week 7-8)
- [ ] Fine-tune test scenarios based on production data
- [ ] Implement advanced performance analysis
- [ ] Create capacity planning tools
- [ ] Deploy comprehensive documentation

---

## Maintenance & Operations

### Daily Operations
- Monitor performance test execution status
- Review regression alerts and performance trends
- Update baselines based on rolling averages
- Analyze top performance issues

### Weekly Operations
- Review and update test scenarios
- Analyze performance trends across all industries
- Update alert thresholds based on observed patterns
- Generate executive performance reports

### Monthly Operations
- Comprehensive performance analysis and capacity planning
- Update and optimize test configurations
- Review and update performance benchmarks
- Performance testing strategy review and improvements

---

This comprehensive performance benchmarking and load testing framework provides enterprise-grade performance validation capabilities for the Thorbis Business OS platform, ensuring optimal performance across all industry verticals under various load conditions.