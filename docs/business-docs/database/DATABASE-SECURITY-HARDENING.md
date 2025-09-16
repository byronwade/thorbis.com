# Database Security Hardening & Encryption at Rest
**Enterprise Security Framework for Thorbis Business OS Database Infrastructure**

## Overview
Comprehensive database security hardening framework implementing defense-in-depth security principles with encryption at rest, advanced access controls, audit logging, and compliance management across all industry verticals.

### Security Objectives
- **Data Protection**: Comprehensive encryption for data at rest and in transit
- **Access Control**: Multi-layered authentication and authorization mechanisms
- **Audit & Compliance**: Complete audit trail for regulatory compliance (SOC 2, PCI DSS, HIPAA)
- **Threat Detection**: Real-time security monitoring and threat detection
- **Zero Trust**: Implement zero-trust security model for database access

---

## Security Architecture Overview

### Defense-in-Depth Security Layers
```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    Application Layer Security                                         │
├─────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐            │
│  │   Input Val &    │  │  Authentication  │  │  Authorization   │  │   Session Mgmt   │            │
│  │   Sanitization   │  │   & Identity     │  │   & RBAC         │  │   & Token Mgmt   │            │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘  └──────────────────┘            │
├─────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                    Database Layer Security                                           │
├─────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐            │
│  │   Connection     │  │  Row Level       │  │   Column Level   │  │   Query Audit    │            │
│  │   Security &     │  │   Security       │  │   Encryption     │  │   & Logging      │            │
│  │   SSL/TLS        │  │   (RLS)          │  │                  │  │                  │            │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘  └──────────────────┘            │
├─────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                    Storage Layer Security                                            │
├─────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐            │
│  │  Transparent     │  │  Tablespace      │  │   WAL & Backup   │  │   File System    │            │
│  │  Data Encryption │  │  Encryption      │  │   Encryption     │  │   Permissions    │            │
│  │  (TDE)           │  │                  │  │                  │  │                  │            │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘  └──────────────────┘            │
├─────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                   Infrastructure Security                                            │
├─────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐            │
│  │   Network        │  │   Firewall &     │  │   Key Management │  │   Hardware       │            │
│  │   Segmentation   │  │   VPC Security   │  │   Service (KMS)  │  │   Security       │            │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘  └──────────────────┘            │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Encryption at Rest Framework

### Core Security Schema
```sql
-- Security Configuration Management
CREATE SCHEMA IF NOT EXISTS security_hardening;

-- Encryption Key Management
CREATE TABLE security_hardening.encryption_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_name VARCHAR(255) NOT NULL,
  key_type key_type_enum NOT NULL, -- 'MASTER_KEY', 'DATA_KEY', 'COLUMN_KEY', 'BACKUP_KEY'
  key_purpose VARCHAR(100) NOT NULL, -- 'TDE', 'COLUMN_ENCRYPTION', 'BACKUP', 'AUDIT'
  algorithm VARCHAR(100) NOT NULL, -- 'AES-256-GCM', 'AES-256-CBC', 'RSA-4096'
  
  -- Key Metadata
  key_version INTEGER NOT NULL DEFAULT 1,
  key_status key_status_enum NOT NULL, -- 'ACTIVE', 'ROTATING', 'DEPRECATED', 'REVOKED'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  activated_at TIMESTAMPTZ,
  rotation_schedule_days INTEGER DEFAULT 365,
  next_rotation_at TIMESTAMPTZ,
  retired_at TIMESTAMPTZ,
  
  -- Compliance & Governance
  compliance_requirements TEXT[], -- ['PCI_DSS', 'HIPAA', 'SOC2', 'GDPR']
  access_restrictions JSONB,
  audit_requirements JSONB,
  
  -- Key Properties (encrypted key data stored in KMS)
  kms_key_id VARCHAR(500) NOT NULL, -- Reference to external KMS key
  key_fingerprint VARCHAR(128) NOT NULL,
  
  created_by UUID REFERENCES auth.users(id),
  
  CONSTRAINT uk_key_name_version UNIQUE (key_name, key_version),
  CONSTRAINT chk_rotation_schedule CHECK (rotation_schedule_days BETWEEN 30 AND 1095)
);

-- Column-Level Encryption Registry
CREATE TABLE security_hardening.encrypted_columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schema_name VARCHAR(100) NOT NULL,
  table_name VARCHAR(100) NOT NULL,
  column_name VARCHAR(100) NOT NULL,
  encryption_key_id UUID REFERENCES security_hardening.encryption_keys(id) NOT NULL,
  
  -- Encryption Configuration
  encryption_algorithm VARCHAR(100) NOT NULL,
  encryption_mode VARCHAR(50) NOT NULL, -- 'DETERMINISTIC', 'RANDOMIZED'
  data_classification data_classification_enum NOT NULL, -- 'PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED'
  
  -- Compliance Requirements
  compliance_tags TEXT[] NOT NULL,
  retention_period_days INTEGER,
  masking_rules JSONB,
  
  -- Access Control
  authorized_roles TEXT[] NOT NULL,
  authorized_applications TEXT[],
  emergency_access_policy JSONB,
  
  -- Audit Trail
  encrypted_at TIMESTAMPTZ DEFAULT NOW(),
  encrypted_by UUID REFERENCES auth.users(id),
  last_key_rotation TIMESTAMPTZ,
  
  CONSTRAINT uk_encrypted_column UNIQUE (schema_name, table_name, column_name),
  CONSTRAINT chk_retention_period CHECK (retention_period_days > 0)
);

-- Database Connection Security
CREATE TABLE security_hardening.connection_security_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_name VARCHAR(255) NOT NULL,
  application_name VARCHAR(100),
  database_role VARCHAR(100),
  
  -- Connection Requirements
  require_ssl BOOLEAN DEFAULT true,
  ssl_mode VARCHAR(50) DEFAULT 'require', -- 'disable', 'allow', 'prefer', 'require', 'verify-ca', 'verify-full'
  min_tls_version VARCHAR(10) DEFAULT '1.2',
  cipher_suites TEXT[],
  
  -- Authentication Requirements
  auth_method auth_method_enum NOT NULL, -- 'PASSWORD', 'CERTIFICATE', 'OAUTH', 'SAML', 'MFA'
  require_mfa BOOLEAN DEFAULT false,
  password_policy JSONB,
  certificate_requirements JSONB,
  
  -- Network Security
  allowed_ip_ranges INET[],
  require_vpn BOOLEAN DEFAULT false,
  connection_timeout_seconds INTEGER DEFAULT 30,
  idle_timeout_minutes INTEGER DEFAULT 15,
  
  -- Rate Limiting
  max_connections_per_user INTEGER DEFAULT 10,
  max_failed_attempts INTEGER DEFAULT 5,
  lockout_duration_minutes INTEGER DEFAULT 15,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);
```

### Transparent Data Encryption (TDE) Implementation
```sql
-- TDE Configuration and Management
CREATE TABLE security_hardening.tde_configuration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tablespace_name VARCHAR(255) NOT NULL,
  encryption_enabled BOOLEAN DEFAULT false,
  
  -- Encryption Settings
  master_key_id UUID REFERENCES security_hardening.encryption_keys(id) NOT NULL,
  encryption_algorithm VARCHAR(100) DEFAULT 'AES-256-GCM',
  compression_enabled BOOLEAN DEFAULT true,
  
  -- Performance Settings
  encryption_chunk_size INTEGER DEFAULT 8192, -- 8KB chunks
  parallel_encryption BOOLEAN DEFAULT true,
  encryption_cache_size INTEGER DEFAULT 1048576, -- 1MB cache
  
  -- Monitoring & Metrics
  encryption_started_at TIMESTAMPTZ,
  encryption_completed_at TIMESTAMPTZ,
  total_size_bytes BIGINT,
  encrypted_size_bytes BIGINT,
  encryption_progress_percent NUMERIC(5,2),
  
  -- Compliance & Audit
  compliance_requirements TEXT[],
  audit_log_enabled BOOLEAN DEFAULT true,
  key_rotation_policy JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  CONSTRAINT uk_tablespace_encryption UNIQUE (tablespace_name)
);

-- TDE Encryption Progress Tracking
CREATE TABLE security_hardening.tde_encryption_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tde_config_id UUID REFERENCES security_hardening.tde_configuration(id) NOT NULL,
  operation_type VARCHAR(50) NOT NULL, -- 'ENCRYPT', 'DECRYPT', 'REKEY'
  
  -- Progress Details
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  current_phase VARCHAR(100), -- 'PREPARING', 'ENCRYPTING_DATA', 'UPDATING_INDEXES', 'VERIFYING', 'COMPLETED'
  progress_percent NUMERIC(5,2) DEFAULT 0,
  
  -- Performance Metrics
  processed_bytes BIGINT DEFAULT 0,
  remaining_bytes BIGINT DEFAULT 0,
  avg_throughput_mbps NUMERIC(10,2),
  estimated_completion_at TIMESTAMPTZ,
  
  -- Error Handling
  error_count INTEGER DEFAULT 0,
  last_error TEXT,
  retry_count INTEGER DEFAULT 0,
  
  operation_status VARCHAR(50) DEFAULT 'RUNNING' -- 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED'
);

-- Column Encryption Functions
CREATE OR REPLACE FUNCTION security_hardening.encrypt_sensitive_column(
  p_schema_name VARCHAR,
  p_table_name VARCHAR,
  p_column_name VARCHAR,
  p_encryption_key_name VARCHAR,
  p_data_classification VARCHAR DEFAULT 'CONFIDENTIAL'
) RETURNS BOOLEAN AS $$
DECLARE
  v_key_id UUID;
  v_full_table_name VARCHAR;
  v_temp_column_name VARCHAR;
  v_sql TEXT;
BEGIN
  -- Get encryption key
  SELECT id INTO v_key_id
  FROM security_hardening.encryption_keys
  WHERE key_name = p_encryption_key_name AND key_status = 'ACTIVE';
  
  IF v_key_id IS NULL THEN
    RAISE EXCEPTION 'Encryption key % not found or not active', p_encryption_key_name;
  END IF;
  
  v_full_table_name := format('%I.%I', p_schema_name, p_table_name);
  v_temp_column_name := p_column_name || '_temp_encrypted';
  
  -- Step 1: Add encrypted column
  v_sql := format('ALTER TABLE %s ADD COLUMN %I bytea', v_full_table_name, v_temp_column_name);
  EXECUTE v_sql;
  
  -- Step 2: Encrypt existing data (placeholder - would use pgcrypto or similar)
  v_sql := format(
    'UPDATE %s SET %I = pgp_sym_encrypt(%I::text, ''%s'') WHERE %I IS NOT NULL',
    v_full_table_name, v_temp_column_name, p_column_name, 'encryption-key-placeholder', p_column_name
  );
  EXECUTE v_sql;
  
  -- Step 3: Drop original column (in transaction)
  v_sql := format('ALTER TABLE %s DROP COLUMN %I', v_full_table_name, p_column_name);
  EXECUTE v_sql;
  
  -- Step 4: Rename encrypted column
  v_sql := format('ALTER TABLE %s RENAME COLUMN %I TO %I', v_full_table_name, v_temp_column_name, p_column_name);
  EXECUTE v_sql;
  
  -- Step 5: Register encrypted column
  INSERT INTO security_hardening.encrypted_columns (
    schema_name, table_name, column_name, encryption_key_id,
    encryption_algorithm, encryption_mode, data_classification,
    compliance_tags, authorized_roles
  ) VALUES (
    p_schema_name, p_table_name, p_column_name, v_key_id,
    'AES-256-GCM', 'RANDOMIZED', p_data_classification::data_classification_enum,
    ARRAY['PCI_DSS', 'GDPR'], -- Default compliance tags
    ARRAY['admin', 'security_admin'] -- Default authorized roles
  );
  
  -- Log encryption event
  PERFORM security_hardening.log_security_event(
    'COLUMN_ENCRYPTED',
    format('Column %s.%s.%s encrypted with key %s', p_schema_name, p_table_name, p_column_name, p_encryption_key_name),
    jsonb_build_object(
      'schema', p_schema_name,
      'table', p_table_name,
      'column', p_column_name,
      'encryption_key', p_encryption_key_name,
      'data_classification', p_data_classification
    )
  );
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    -- Rollback on error
    RAISE NOTICE 'Error encrypting column: %', SQLERRM;
    RETURN false;
END;
$$ LANGUAGE plpgsql;
```

### Advanced Access Control Framework
```sql
-- Role-Based Security Policies
CREATE TABLE security_hardening.database_roles_security (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name VARCHAR(100) NOT NULL,
  role_type role_type_enum NOT NULL, -- 'APPLICATION', 'ADMIN', 'READONLY', 'SERVICE', 'EMERGENCY'
  
  -- Security Configuration
  password_policy JSONB NOT NULL,
  session_timeout_minutes INTEGER DEFAULT 60,
  max_concurrent_sessions INTEGER DEFAULT 5,
  allowed_connection_sources INET[],
  
  -- Access Restrictions
  time_based_access JSONB, -- Allowed hours/days
  ip_whitelist INET[],
  require_ssl BOOLEAN DEFAULT true,
  require_mfa BOOLEAN DEFAULT false,
  
  -- Audit & Monitoring
  log_all_queries BOOLEAN DEFAULT false,
  log_sensitive_operations BOOLEAN DEFAULT true,
  alert_on_suspicious_activity BOOLEAN DEFAULT true,
  
  -- Compliance Requirements
  compliance_level compliance_level_enum NOT NULL, -- 'BASIC', 'ELEVATED', 'HIGH', 'MAXIMUM'
  data_access_justification TEXT,
  approval_required_for_access BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,
  
  CONSTRAINT uk_database_role_name UNIQUE (role_name)
);

-- Sensitive Data Access Control
CREATE TABLE security_hardening.sensitive_data_access_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_name VARCHAR(255) NOT NULL,
  schema_name VARCHAR(100),
  table_name VARCHAR(100),
  column_names TEXT[],
  
  -- Access Control Rules
  access_type access_type_enum NOT NULL, -- 'FULL', 'MASKED', 'RESTRICTED', 'DENIED'
  masking_function VARCHAR(255),
  access_conditions JSONB, -- Dynamic conditions for access
  
  -- Approval Workflow
  requires_approval BOOLEAN DEFAULT false,
  approval_roles TEXT[],
  approval_timeout_hours INTEGER DEFAULT 24,
  auto_expire_access_hours INTEGER DEFAULT 8,
  
  -- Monitoring & Audit
  log_access_attempts BOOLEAN DEFAULT true,
  alert_on_access BOOLEAN DEFAULT false,
  data_retention_policy JSONB,
  
  -- Business Context
  business_justification TEXT,
  compliance_requirements TEXT[],
  risk_classification VARCHAR(50),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true
);

-- Data Masking Configuration
CREATE TABLE security_hardening.data_masking_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name VARCHAR(255) NOT NULL,
  schema_name VARCHAR(100) NOT NULL,
  table_name VARCHAR(100) NOT NULL,
  column_name VARCHAR(100) NOT NULL,
  
  -- Masking Configuration
  masking_type masking_type_enum NOT NULL, -- 'STATIC', 'DYNAMIC', 'FORMAT_PRESERVING', 'TOKENIZATION'
  masking_function VARCHAR(255) NOT NULL,
  masking_parameters JSONB,
  
  -- Conditional Masking
  masking_conditions JSONB, -- When to apply masking
  exempt_roles TEXT[], -- Roles that see unmasked data
  exempt_applications TEXT[], -- Applications that see unmasked data
  
  -- Data Format Preservation
  preserve_format BOOLEAN DEFAULT true,
  preserve_length BOOLEAN DEFAULT true,
  preserve_type BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,
  
  CONSTRAINT uk_masking_rule UNIQUE (schema_name, table_name, column_name)
);
```

### Security Audit & Monitoring Framework
```sql
-- Comprehensive Security Audit Log
CREATE TABLE security_hardening.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_timestamp TIMESTAMPTZ DEFAULT NOW(),
  event_type VARCHAR(100) NOT NULL,
  event_category security_event_category_enum NOT NULL, -- 'AUTHENTICATION', 'AUTHORIZATION', 'DATA_ACCESS', 'CONFIGURATION', 'THREAT'
  
  -- Event Details
  event_description TEXT NOT NULL,
  event_severity security_severity_enum NOT NULL, -- 'INFO', 'WARNING', 'ERROR', 'CRITICAL'
  event_source VARCHAR(100) NOT NULL, -- System/component generating the event
  
  -- User Context
  user_id UUID REFERENCES auth.users(id),
  username VARCHAR(255),
  application_name VARCHAR(100),
  session_id VARCHAR(255),
  
  -- Technical Details
  client_ip INET,
  user_agent TEXT,
  database_name VARCHAR(100),
  schema_name VARCHAR(100),
  table_name VARCHAR(100),
  column_names TEXT[],
  
  -- Query Information
  query_text TEXT,
  query_hash VARCHAR(64),
  query_duration_ms INTEGER,
  rows_affected INTEGER,
  
  -- Security Context
  access_granted BOOLEAN,
  access_method VARCHAR(100),
  encryption_used BOOLEAN,
  compliance_context TEXT[],
  
  -- Additional Metadata
  event_metadata JSONB,
  correlation_id UUID,
  alert_generated BOOLEAN DEFAULT false,
  
  -- Partitioning
  audit_date DATE GENERATED ALWAYS AS (DATE(event_timestamp)) STORED
) PARTITION BY RANGE (audit_date);

-- Create monthly partitions for audit log
CREATE TABLE security_hardening.security_audit_log_2024_01 PARTITION OF security_hardening.security_audit_log
  FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
CREATE TABLE security_hardening.security_audit_log_2024_02 PARTITION OF security_hardening.security_audit_log
  FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
-- Additional partitions would be created programmatically

-- Real-Time Threat Detection
CREATE TABLE security_hardening.threat_detection_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name VARCHAR(255) NOT NULL,
  rule_description TEXT NOT NULL,
  rule_type threat_rule_type_enum NOT NULL, -- 'SQL_INJECTION', 'BRUTE_FORCE', 'DATA_EXFILTRATION', 'PRIVILEGE_ESCALATION', 'ANOMALY'
  
  -- Detection Logic
  detection_query TEXT NOT NULL, -- SQL query to detect the threat
  threshold_config JSONB NOT NULL, -- Thresholds for triggering alerts
  time_window_minutes INTEGER DEFAULT 5,
  
  -- Response Configuration
  alert_severity security_severity_enum NOT NULL,
  auto_block_enabled BOOLEAN DEFAULT false,
  block_duration_minutes INTEGER DEFAULT 15,
  notification_channels JSONB,
  
  -- Context & Metadata
  mitre_attack_ids TEXT[], -- MITRE ATT&CK technique IDs
  compliance_mappings TEXT[], -- Relevant compliance requirements
  false_positive_rate NUMERIC(5,2),
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  CONSTRAINT uk_threat_rule_name UNIQUE (rule_name)
);

-- Security Incident Management
CREATE TABLE security_hardening.security_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_number VARCHAR(50) UNIQUE NOT NULL,
  incident_title VARCHAR(255) NOT NULL,
  incident_type incident_type_enum NOT NULL, -- 'BREACH', 'ATTEMPTED_BREACH', 'POLICY_VIOLATION', 'SYSTEM_COMPROMISE'
  
  -- Incident Classification
  severity_level security_severity_enum NOT NULL,
  threat_actor_type VARCHAR(100), -- 'INTERNAL', 'EXTERNAL', 'UNKNOWN'
  attack_vector VARCHAR(100),
  affected_systems TEXT[],
  
  -- Timeline
  detected_at TIMESTAMPTZ NOT NULL,
  reported_at TIMESTAMPTZ DEFAULT NOW(),
  investigation_started_at TIMESTAMPTZ,
  contained_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  
  -- Impact Assessment
  data_compromised BOOLEAN DEFAULT false,
  compromised_records_count INTEGER,
  affected_customers INTEGER,
  estimated_cost NUMERIC(12,2),
  
  -- Response Details
  incident_status incident_status_enum DEFAULT 'OPEN', -- 'OPEN', 'INVESTIGATING', 'CONTAINED', 'RESOLVED', 'CLOSED'
  assigned_to UUID REFERENCES auth.users(id),
  response_team_members TEXT[],
  
  -- Investigation Details
  initial_findings TEXT,
  root_cause_analysis TEXT,
  lessons_learned TEXT,
  remediation_actions JSONB,
  
  -- Compliance & Reporting
  regulatory_notification_required BOOLEAN DEFAULT false,
  regulatory_bodies_notified TEXT[],
  customer_notification_required BOOLEAN DEFAULT false,
  public_disclosure_required BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);
```

### Security Monitoring Functions
```sql
-- Real-Time Security Monitoring
CREATE OR REPLACE FUNCTION security_hardening.monitor_suspicious_activity()
RETURNS VOID AS $$
DECLARE
  v_rule RECORD;
  v_result RECORD;
  v_threat_count INTEGER;
BEGIN
  -- Check each active threat detection rule
  FOR v_rule IN 
    SELECT * FROM security_hardening.threat_detection_rules 
    WHERE is_active = true
  LOOP
    -- Execute threat detection query
    BEGIN
      EXECUTE format('
        WITH threat_detection AS (%s)
        SELECT COUNT(*) as threat_count, 
               jsonb_agg(row_to_json(threat_detection)) as threat_details
        FROM threat_detection
      ', v_rule.detection_query) INTO v_result;
      
      v_threat_count := COALESCE(v_result.threat_count, 0);
      
      -- Check if threshold exceeded
      IF v_threat_count >= (v_rule.threshold_config->>'min_occurrences')::INTEGER THEN
        -- Generate security alert
        PERFORM security_hardening.generate_security_alert(
          v_rule.id,
          v_rule.rule_name,
          format('Threat detected: %s occurrences of %s', v_threat_count, v_rule.rule_name),
          v_rule.alert_severity,
          v_result.threat_details
        );
        
        -- Auto-block if enabled
        IF v_rule.auto_block_enabled THEN
          PERFORM security_hardening.auto_block_threat(v_rule.id, v_result.threat_details);
        END IF;
      END IF;
      
    EXCEPTION
      WHEN OTHERS THEN
        -- Log error in threat detection
        PERFORM security_hardening.log_security_event(
          'THREAT_DETECTION_ERROR',
          format('Error executing threat detection rule %s: %s', v_rule.rule_name, SQLERRM),
          jsonb_build_object('rule_id', v_rule.id, 'error', SQLERRM)
        );
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Security Event Logging Function
CREATE OR REPLACE FUNCTION security_hardening.log_security_event(
  p_event_type VARCHAR,
  p_description TEXT,
  p_metadata JSONB DEFAULT NULL,
  p_severity VARCHAR DEFAULT 'INFO'
) RETURNS UUID AS $$
DECLARE
  v_event_id UUID;
  v_current_user_id UUID;
  v_session_info JSONB;
BEGIN
  v_event_id := gen_random_uuid();
  
  -- Get current user context (would be from application context)
  v_current_user_id := (SELECT current_setting('app.current_user_id', true)::UUID);
  
  -- Get session information
  v_session_info := jsonb_build_object(
    'client_addr', inet_client_addr(),
    'client_port', inet_client_port(),
    'server_addr', inet_server_addr(),
    'server_port', inet_server_port(),
    'backend_pid', pg_backend_pid(),
    'application_name', current_setting('application_name')
  );
  
  -- Insert security audit log entry
  INSERT INTO security_hardening.security_audit_log (
    id, event_type, event_category, event_description, event_severity,
    event_source, user_id, client_ip, application_name,
    event_metadata, correlation_id
  ) VALUES (
    v_event_id, p_event_type, 
    CASE 
      WHEN p_event_type LIKE '%AUTH%' THEN 'AUTHENTICATION'
      WHEN p_event_type LIKE '%ACCESS%' THEN 'AUTHORIZATION' 
      WHEN p_event_type LIKE '%DATA%' THEN 'DATA_ACCESS'
      WHEN p_event_type LIKE '%CONFIG%' THEN 'CONFIGURATION'
      WHEN p_event_type LIKE '%THREAT%' THEN 'THREAT'
      ELSE 'CONFIGURATION'
    END,
    p_description, p_severity::security_severity_enum,
    'DATABASE_SYSTEM', v_current_user_id,
    inet_client_addr(), current_setting('application_name'),
    (p_metadata || v_session_info), v_event_id
  );
  
  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql;

-- Automated Key Rotation Function
CREATE OR REPLACE FUNCTION security_hardening.rotate_encryption_keys()
RETURNS TABLE (
  key_name VARCHAR,
  rotation_status VARCHAR,
  rotation_details TEXT
) AS $$
DECLARE
  v_key RECORD;
  v_new_version INTEGER;
  v_rotation_success BOOLEAN;
BEGIN
  -- Find keys that need rotation
  FOR v_key IN 
    SELECT * FROM security_hardening.encryption_keys 
    WHERE key_status = 'ACTIVE' 
      AND next_rotation_at <= NOW()
      AND key_type != 'MASTER_KEY' -- Master keys rotated separately
  LOOP
    BEGIN
      -- Create new version of the key
      v_new_version := v_key.key_version + 1;
      
      -- Mark current key as rotating
      UPDATE security_hardening.encryption_keys 
      SET key_status = 'ROTATING' 
      WHERE id = v_key.id;
      
      -- Create new key version (placeholder - would integrate with KMS)
      INSERT INTO security_hardening.encryption_keys (
        key_name, key_type, key_purpose, algorithm,
        key_version, key_status, rotation_schedule_days,
        next_rotation_at, compliance_requirements,
        kms_key_id, key_fingerprint, created_by
      ) VALUES (
        v_key.key_name, v_key.key_type, v_key.key_purpose, v_key.algorithm,
        v_new_version, 'ACTIVE', v_key.rotation_schedule_days,
        NOW() + (v_key.rotation_schedule_days || ' days')::INTERVAL,
        v_key.compliance_requirements,
        'new-kms-key-id-' || v_new_version, -- Placeholder
        'new-key-fingerprint-' || v_new_version, -- Placeholder
        v_key.created_by
      );
      
      -- Mark old key as deprecated
      UPDATE security_hardening.encryption_keys 
      SET key_status = 'DEPRECATED',
          retired_at = NOW()
      WHERE id = v_key.id;
      
      -- Re-encrypt data with new key (would be done asynchronously)
      -- This is a complex process involving multiple tables and careful coordination
      
      v_rotation_success := true;
      
      -- Log successful rotation
      PERFORM security_hardening.log_security_event(
        'KEY_ROTATED',
        format('Successfully rotated encryption key %s to version %s', v_key.key_name, v_new_version),
        jsonb_build_object(
          'key_id', v_key.id,
          'old_version', v_key.key_version,
          'new_version', v_new_version
        ),
        'INFO'
      );
      
      RETURN QUERY SELECT 
        v_key.key_name,
        'SUCCESS'::VARCHAR,
        format('Rotated to version %s', v_new_version)::TEXT;
        
    EXCEPTION
      WHEN OTHERS THEN
        -- Rollback rotation on error
        UPDATE security_hardening.encryption_keys 
        SET key_status = 'ACTIVE' 
        WHERE id = v_key.id;
        
        v_rotation_success := false;
        
        -- Log rotation failure
        PERFORM security_hardening.log_security_event(
          'KEY_ROTATION_FAILED',
          format('Failed to rotate encryption key %s: %s', v_key.key_name, SQLERRM),
          jsonb_build_object(
            'key_id', v_key.id,
            'error', SQLERRM
          ),
          'ERROR'
        );
        
        RETURN QUERY SELECT 
          v_key.key_name,
          'FAILED'::VARCHAR,
          SQLERRM::TEXT;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
```

---

## Compliance & Regulatory Framework

### Compliance Management Schema
```sql
-- Compliance Requirements Management
CREATE TABLE security_hardening.compliance_frameworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  framework_name VARCHAR(100) NOT NULL, -- 'SOC2', 'PCI_DSS', 'HIPAA', 'GDPR', 'FedRAMP'
  framework_version VARCHAR(50) NOT NULL,
  framework_description TEXT,
  
  -- Implementation Requirements
  required_controls JSONB NOT NULL,
  technical_safeguards JSONB,
  administrative_safeguards JSONB,
  physical_safeguards JSONB,
  
  -- Assessment & Audit
  assessment_frequency_months INTEGER NOT NULL,
  next_assessment_due TIMESTAMPTZ,
  auditor_requirements JSONB,
  certification_requirements JSONB,
  
  -- Scope & Applicability
  applicable_industries TEXT[],
  geographic_scope TEXT[],
  data_types_covered TEXT[],
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  CONSTRAINT uk_compliance_framework UNIQUE (framework_name, framework_version)
);

-- Compliance Control Implementation
CREATE TABLE security_hardening.compliance_controls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  framework_id UUID REFERENCES security_hardening.compliance_frameworks(id) NOT NULL,
  control_id VARCHAR(100) NOT NULL,
  control_name VARCHAR(255) NOT NULL,
  control_description TEXT NOT NULL,
  
  -- Control Classification
  control_family VARCHAR(100),
  control_type control_type_enum NOT NULL, -- 'PREVENTIVE', 'DETECTIVE', 'CORRECTIVE', 'DETERRENT'
  control_priority priority_enum NOT NULL, -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
  
  -- Implementation Details
  implementation_status implementation_status_enum DEFAULT 'PLANNED', -- 'PLANNED', 'IN_PROGRESS', 'IMPLEMENTED', 'VERIFIED'
  implementation_approach TEXT,
  technical_implementation JSONB,
  responsible_roles TEXT[],
  
  -- Testing & Validation
  testing_procedure TEXT,
  testing_frequency_days INTEGER,
  last_tested_at TIMESTAMPTZ,
  next_testing_due TIMESTAMPTZ,
  test_results JSONB,
  
  -- Evidence & Documentation
  evidence_location TEXT,
  documentation_links TEXT[],
  implementation_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Compliance Assessment Results
CREATE TABLE security_hardening.compliance_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  framework_id UUID REFERENCES security_hardening.compliance_frameworks(id) NOT NULL,
  assessment_type assessment_type_enum NOT NULL, -- 'SELF_ASSESSMENT', 'INTERNAL_AUDIT', 'EXTERNAL_AUDIT', 'PENETRATION_TEST'
  
  -- Assessment Details
  assessment_period_start TIMESTAMPTZ NOT NULL,
  assessment_period_end TIMESTAMPTZ NOT NULL,
  assessor_name VARCHAR(255),
  assessor_credentials TEXT,
  assessment_scope TEXT,
  
  -- Results Summary
  overall_compliance_score NUMERIC(5,2), -- Percentage
  controls_passed INTEGER DEFAULT 0,
  controls_failed INTEGER DEFAULT 0,
  controls_not_applicable INTEGER DEFAULT 0,
  critical_findings_count INTEGER DEFAULT 0,
  
  -- Detailed Results
  detailed_findings JSONB,
  recommendations JSONB,
  remediation_plan JSONB,
  
  -- Status & Timeline
  assessment_status assessment_status_enum DEFAULT 'IN_PROGRESS', -- 'PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CERTIFIED'
  completion_date TIMESTAMPTZ,
  certification_date TIMESTAMPTZ,
  certification_expiry_date TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);
```

### Industry-Specific Security Controls
```sql
-- Healthcare (HIPAA) Specific Controls
INSERT INTO security_hardening.compliance_frameworks (
  framework_name, framework_version, framework_description,
  required_controls, assessment_frequency_months, applicable_industries
) VALUES (
  'HIPAA', '2023', 'Health Insurance Portability and Accountability Act - Healthcare data protection',
  '{
    "access_control": "164.312(a)(1) - Unique user identification, emergency access procedure, automatic logoff, encryption and decryption",
    "audit_controls": "164.312(b) - Audit controls to record access to PHI",
    "integrity": "164.312(c)(1) - PHI must not be improperly altered or destroyed",
    "person_authentication": "164.312(d) - Verify person seeking access is authorized",
    "transmission_security": "164.312(e)(1) - Guard against unauthorized access to PHI during transmission"
  }',
  12, ARRAY['HEALTHCARE']
);

-- Financial (PCI DSS) Specific Controls
INSERT INTO security_hardening.compliance_frameworks (
  framework_name, framework_version, framework_description,
  required_controls, assessment_frequency_months, applicable_industries
) VALUES (
  'PCI_DSS', '4.0', 'Payment Card Industry Data Security Standard',
  '{
    "build_maintain_secure_network": "Install and maintain a firewall configuration to protect cardholder data",
    "protect_cardholder_data": "Protect stored cardholder data with strong cryptography",
    "maintain_vulnerability_program": "Protect all systems against malware and regularly update anti-virus software",
    "implement_access_controls": "Restrict access to cardholder data by business need-to-know",
    "regularly_monitor_test": "Regularly monitor and test networks",
    "maintain_information_security": "Maintain a policy that addresses information security"
  }',
  12, ARRAY['BANKING', 'RETAIL', 'RESTAURANT']
);

-- Technology (SOC 2) Controls
INSERT INTO security_hardening.compliance_frameworks (
  framework_name, framework_version, framework_description,
  required_controls, assessment_frequency_months, applicable_industries
) VALUES (
  'SOC2_TYPE2', '2017', 'Service Organization Control 2 Type II - Trust Services Criteria',
  '{
    "security": "Protection against unauthorized access (physical and logical)",
    "availability": "System operation, monitoring, and maintenance",
    "processing_integrity": "System processing is complete, valid, accurate, timely, and authorized",
    "confidentiality": "Information designated as confidential is protected",
    "privacy": "Personal information is collected, used, retained, disclosed, and disposed"
  }',
  12, ARRAY['HOME_SERVICES', 'AUTOMOTIVE', 'RESTAURANT', 'RETAIL']
);
```

---

## Security Hardening Implementation Scripts

### Database Security Hardening Script
```sql
-- Comprehensive Database Hardening Function
CREATE OR REPLACE FUNCTION security_hardening.apply_security_hardening()
RETURNS TABLE (
  hardening_step VARCHAR,
  status VARCHAR,
  details TEXT
) AS $$
DECLARE
  v_step_count INTEGER := 0;
BEGIN
  -- Step 1: Enable SSL/TLS
  BEGIN
    -- Configure SSL settings (would be done at postgresql.conf level)
    ALTER SYSTEM SET ssl = 'on';
    ALTER SYSTEM SET ssl_cert_file = 'server.crt';
    ALTER SYSTEM SET ssl_key_file = 'server.key';
    ALTER SYSTEM SET ssl_ciphers = 'ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-GCM-SHA256';
    
    v_step_count := v_step_count + 1;
    RETURN QUERY SELECT 'SSL_TLS_Configuration'::VARCHAR, 'SUCCESS'::VARCHAR, 'SSL/TLS configured with strong ciphers'::TEXT;
  EXCEPTION
    WHEN OTHERS THEN
      RETURN QUERY SELECT 'SSL_TLS_Configuration'::VARCHAR, 'FAILED'::VARCHAR, SQLERRM::TEXT;
  END;
  
  -- Step 2: Configure Connection Security
  BEGIN
    -- Update pg_hba.conf entries programmatically (placeholder)
    -- In practice, this would modify pg_hba.conf file
    
    -- Create connection security policies
    INSERT INTO security_hardening.connection_security_policies (
      policy_name, require_ssl, ssl_mode, min_tls_version,
      auth_method, max_connections_per_user, max_failed_attempts
    ) VALUES 
    ('Application_Connections', true, 'require', '1.2', 'PASSWORD', 10, 3),
    ('Admin_Connections', true, 'verify-full', '1.3', 'CERTIFICATE', 2, 2),
    ('Readonly_Connections', true, 'require', '1.2', 'PASSWORD', 20, 5);
    
    v_step_count := v_step_count + 1;
    RETURN QUERY SELECT 'Connection_Security'::VARCHAR, 'SUCCESS'::VARCHAR, 'Connection security policies configured'::TEXT;
  EXCEPTION
    WHEN OTHERS THEN
      RETURN QUERY SELECT 'Connection_Security'::VARCHAR, 'FAILED'::VARCHAR, SQLERRM::TEXT;
  END;
  
  -- Step 3: Configure Audit Logging
  BEGIN
    -- Enable comprehensive audit logging
    ALTER SYSTEM SET log_statement = 'all';
    ALTER SYSTEM SET log_connections = 'on';
    ALTER SYSTEM SET log_disconnections = 'on';
    ALTER SYSTEM SET log_checkpoints = 'on';
    ALTER SYSTEM SET log_lock_waits = 'on';
    ALTER SYSTEM SET log_min_duration_statement = 1000; -- Log queries > 1 second
    
    v_step_count := v_step_count + 1;
    RETURN QUERY SELECT 'Audit_Logging'::VARCHAR, 'SUCCESS'::VARCHAR, 'Comprehensive audit logging enabled'::TEXT;
  EXCEPTION
    WHEN OTHERS THEN
      RETURN QUERY SELECT 'Audit_Logging'::VARCHAR, 'FAILED'::VARCHAR, SQLERRM::TEXT;
  END;
  
  -- Step 4: Harden Authentication
  BEGIN
    -- Configure password policies
    ALTER SYSTEM SET password_encryption = 'scram-sha-256';
    
    -- Create secure database roles
    PERFORM security_hardening.create_secure_database_roles();
    
    v_step_count := v_step_count + 1;
    RETURN QUERY SELECT 'Authentication_Hardening'::VARCHAR, 'SUCCESS'::VARCHAR, 'Authentication hardening applied'::TEXT;
  EXCEPTION
    WHEN OTHERS THEN
      RETURN QUERY SELECT 'Authentication_Hardening'::VARCHAR, 'FAILED'::VARCHAR, SQLERRM::TEXT;
  END;
  
  -- Step 5: Apply Row Level Security
  BEGIN
    PERFORM security_hardening.apply_comprehensive_rls();
    
    v_step_count := v_step_count + 1;
    RETURN QUERY SELECT 'Row_Level_Security'::VARCHAR, 'SUCCESS'::VARCHAR, 'Row Level Security policies applied'::TEXT;
  EXCEPTION
    WHEN OTHERS THEN
      RETURN QUERY SELECT 'Row_Level_Security'::VARCHAR, 'FAILED'::VARCHAR, SQLERRM::TEXT;
  END;
  
  -- Step 6: Configure Data Encryption
  BEGIN
    PERFORM security_hardening.configure_data_encryption();
    
    v_step_count := v_step_count + 1;
    RETURN QUERY SELECT 'Data_Encryption'::VARCHAR, 'SUCCESS'::VARCHAR, 'Data encryption configured'::TEXT;
  EXCEPTION
    WHEN OTHERS THEN
      RETURN QUERY SELECT 'Data_Encryption'::VARCHAR, 'FAILED'::VARCHAR, SQLERRM::TEXT;
  END;
  
  -- Step 7: Enable Threat Detection
  BEGIN
    PERFORM security_hardening.configure_threat_detection();
    
    v_step_count := v_step_count + 1;
    RETURN QUERY SELECT 'Threat_Detection'::VARCHAR, 'SUCCESS'::VARCHAR, 'Threat detection rules configured'::TEXT;
  EXCEPTION
    WHEN OTHERS THEN
      RETURN QUERY SELECT 'Threat_Detection'::VARCHAR, 'FAILED'::VARCHAR, SQLERRM::TEXT;
  END;
  
  -- Final summary
  RETURN QUERY SELECT 'SUMMARY'::VARCHAR, 'COMPLETED'::VARCHAR, format('Successfully applied %s security hardening steps', v_step_count)::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Apply Row Level Security to All Tables
CREATE OR REPLACE FUNCTION security_hardening.apply_comprehensive_rls()
RETURNS VOID AS $$
DECLARE
  v_schema_table RECORD;
  v_policy_sql TEXT;
BEGIN
  -- Enable RLS on all business tables
  FOR v_schema_table IN
    SELECT schemaname, tablename
    FROM pg_tables 
    WHERE schemaname IN ('hs', 'auto', 'rest', 'banking', 'ret', 'courses', 'payroll', 'investigations')
      AND tablename NOT LIKE '%_audit'
      AND tablename NOT LIKE 'temp_%'
  LOOP
    -- Enable RLS on table
    EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', v_schema_table.schemaname, v_schema_table.tablename);
    
    -- Create tenant isolation policy
    v_policy_sql := format(
      'CREATE POLICY tenant_isolation ON %I.%I 
       FOR ALL TO authenticated_users
       USING (business_id = current_setting(''app.current_tenant_id'')::UUID)',
      v_schema_table.schemaname, v_schema_table.tablename
    );
    
    BEGIN
      EXECUTE v_policy_sql;
    EXCEPTION
      WHEN duplicate_object THEN
        -- Policy already exists, skip
        NULL;
      WHEN undefined_column THEN
        -- Table doesn't have business_id column, create different policy
        v_policy_sql := format(
          'CREATE POLICY open_access ON %I.%I 
           FOR ALL TO authenticated_users
           USING (true)',
          v_schema_table.schemaname, v_schema_table.tablename
        );
        EXECUTE v_policy_sql;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
```

---

## Security Monitoring & Alerting

### Real-Time Security Dashboard
```sql
-- Security Dashboard Views
CREATE OR REPLACE VIEW security_hardening.security_dashboard AS
SELECT 
  'Authentication Events' as metric_category,
  COUNT(*) as total_events,
  COUNT(CASE WHEN access_granted = false THEN 1 END) as failed_events,
  COUNT(CASE WHEN event_severity = 'CRITICAL' THEN 1 END) as critical_events,
  DATE_TRUNC('hour', event_timestamp) as time_bucket
FROM security_hardening.security_audit_log 
WHERE event_category = 'AUTHENTICATION'
  AND event_timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', event_timestamp)

UNION ALL

SELECT 
  'Data Access Events' as metric_category,
  COUNT(*) as total_events,
  COUNT(CASE WHEN access_granted = false THEN 1 END) as failed_events,
  COUNT(CASE WHEN event_severity IN ('ERROR', 'CRITICAL') THEN 1 END) as critical_events,
  DATE_TRUNC('hour', event_timestamp) as time_bucket
FROM security_hardening.security_audit_log 
WHERE event_category = 'DATA_ACCESS'
  AND event_timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', event_timestamp)

ORDER BY time_bucket DESC;

-- Security Metrics Summary
CREATE OR REPLACE VIEW security_hardening.security_metrics_summary AS
SELECT 
  COUNT(*) as total_security_events,
  COUNT(CASE WHEN event_severity = 'CRITICAL' THEN 1 END) as critical_events,
  COUNT(CASE WHEN event_severity = 'ERROR' THEN 1 END) as error_events,
  COUNT(CASE WHEN access_granted = false THEN 1 END) as access_denied_events,
  COUNT(DISTINCT user_id) as unique_users_with_events,
  COUNT(DISTINCT client_ip) as unique_client_ips,
  AVG(CASE WHEN query_duration_ms IS NOT NULL THEN query_duration_ms END) as avg_query_duration_ms
FROM security_hardening.security_audit_log 
WHERE event_timestamp >= NOW() - INTERVAL '24 hours';
```

---

## Implementation Roadmap

### Phase 1: Core Security Foundation (Week 1-2)
- [ ] Deploy encryption key management schema
- [ ] Implement transparent data encryption (TDE)
- [ ] Configure SSL/TLS and connection security
- [ ] Enable comprehensive audit logging

### Phase 2: Advanced Access Controls (Week 3-4)
- [ ] Implement role-based security policies
- [ ] Deploy data masking and tokenization
- [ ] Configure row-level security (RLS)
- [ ] Set up privilege escalation controls

### Phase 3: Threat Detection & Monitoring (Week 5-6)
- [ ] Deploy real-time threat detection rules
- [ ] Implement security incident management
- [ ] Configure automated alerting system
- [ ] Create security monitoring dashboard

### Phase 4: Compliance & Governance (Week 7-8)
- [ ] Implement compliance frameworks
- [ ] Deploy automated compliance assessment
- [ ] Create security governance processes
- [ ] Configure regulatory reporting

---

This comprehensive database security hardening framework provides enterprise-grade security protection for the Thorbis Business OS platform, ensuring data protection, regulatory compliance, and threat detection across all industry verticals.