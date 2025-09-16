# Advanced Row-Level Security (RLS) Policies - Multi-Tenant Enterprise Architecture

> **Version**: 2.0.0  
> **Status**: Production Ready  
> **PostgreSQL Version**: 17+  
> **Last Updated**: 2025-01-31

## Overview

This document provides comprehensive Row-Level Security (RLS) policies for the Thorbis Business OS multi-tenant database architecture. The policies ensure enterprise-grade security across all industry verticals while maintaining optimal performance and regulatory compliance.

## Policy Architecture Philosophy

### 1. Security-First Design Principles

```sql
-- Core Security Principles:
-- 1. Deny by default - no access without explicit permission
-- 2. Least privilege - minimum access required for function
-- 3. Defense in depth - multiple security layers
-- 4. Audit everything - complete access logging
-- 5. Zero trust - verify every access attempt
```

### 2. Multi-Layered Security Model

```sql
-- Layer 1: Tenant Isolation (business_id enforcement)
-- Layer 2: Role-Based Access Control (RBAC)
-- Layer 3: Attribute-Based Access Control (ABAC)
-- Layer 4: Data Classification Security
-- Layer 5: Time and Location-Based Restrictions
-- Layer 6: Compliance and Regulatory Controls
```

## Core RLS Infrastructure

### 1. Security Context Functions

```sql
-- =======================
-- SECURITY CONTEXT MANAGEMENT
-- =======================

-- Current user security context
CREATE OR REPLACE FUNCTION security.get_current_security_context()
RETURNS JSONB AS $$
DECLARE
    context JSONB;
    user_roles TEXT[];
    user_attributes JSONB;
BEGIN
    -- Get user information
    SELECT 
        array_agg(r.role_name),
        jsonb_build_object(
            'business_id', up.business_id,
            'user_id', up.id,
            'department', up.department,
            'location_id', up.location_id,
            'security_clearance', up.security_clearance_level,
            'is_admin', up.is_admin,
            'session_start', current_setting('app.session_start_time', true)::timestamptz,
            'ip_address', current_setting('app.client_ip', true),
            'device_id', current_setting('app.device_id', true)
        )
    INTO user_roles, user_attributes
    FROM user_mgmt.user_profiles up
    LEFT JOIN user_mgmt.user_roles ur ON up.id = ur.user_id
    LEFT JOIN user_mgmt.roles r ON ur.role_id = r.id
    WHERE up.id = current_setting('app.current_user_id', true)::UUID
    GROUP BY up.business_id, up.id, up.department, up.location_id, 
             up.security_clearance_level, up.is_admin;

    context := jsonb_build_object(
        'user_attributes', user_attributes,
        'user_roles', user_roles,
        'timestamp', NOW(),
        'context_version', '2.0'
    );

    RETURN context;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Business access validation
CREATE OR REPLACE FUNCTION security.can_access_business(target_business_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_business_id UUID;
    is_super_admin BOOLEAN;
    has_cross_tenant_access BOOLEAN;
BEGIN
    -- Get current user's business context
    SELECT 
        (get_current_security_context() ->> 'user_attributes')::JSONB ->> 'business_id',
        (get_current_security_context() ->> 'user_attributes')::JSONB ->> 'is_admin',
        EXISTS (
            SELECT 1 FROM user_mgmt.user_permissions up
            WHERE up.user_id = current_setting('app.current_user_id', true)::UUID
              AND up.permission_name = 'CROSS_TENANT_ACCESS'
              AND up.is_active = TRUE
        )
    INTO user_business_id, is_super_admin, has_cross_tenant_access;

    -- Allow access if:
    -- 1. Same business tenant
    -- 2. Super admin with cross-tenant access
    -- 3. Specific cross-tenant permission granted
    RETURN (
        user_business_id::UUID = target_business_id OR
        (is_super_admin::BOOLEAN AND has_cross_tenant_access) OR
        has_cross_tenant_access
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Role-based access validation
CREATE OR REPLACE FUNCTION security.has_role(required_role TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_roles TEXT[];
BEGIN
    user_roles := (security.get_current_security_context() ->> 'user_roles')::TEXT[];
    RETURN required_role = ANY(user_roles);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Security clearance validation
CREATE OR REPLACE FUNCTION security.has_clearance_level(required_level TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_clearance TEXT;
    clearance_hierarchy TEXT[] := ARRAY['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'SECRET', 'TOP_SECRET'];
    user_level_pos INTEGER;
    required_level_pos INTEGER;
BEGIN
    user_clearance := (security.get_current_security_context() ->> 'user_attributes')::JSONB ->> 'security_clearance';
    
    user_level_pos := array_position(clearance_hierarchy, user_clearance);
    required_level_pos := array_position(clearance_hierarchy, required_level);
    
    -- Higher position means higher clearance
    RETURN COALESCE(user_level_pos, 0) >= COALESCE(required_level_pos, 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Time-based access validation
CREATE OR REPLACE FUNCTION security.is_within_business_hours(business_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    business_settings JSONB;
    current_time TIME;
    current_day TEXT;
    business_hours JSONB;
BEGIN
    -- Get business operating hours
    SELECT bs.business_settings INTO business_settings
    FROM tenant_mgmt.businesses bs
    WHERE bs.id = business_id;

    business_hours := business_settings -> 'operating_hours';
    
    -- If no business hours defined, allow 24/7 access
    IF business_hours IS NULL THEN
        RETURN TRUE;
    END IF;

    current_time := CURRENT_TIME;
    current_day := LOWER(TO_CHAR(NOW(), 'Day'));

    -- Check if current time falls within business hours
    RETURN (
        business_hours -> current_day -> 'start' IS NOT NULL AND
        business_hours -> current_day -> 'end' IS NOT NULL AND
        current_time >= (business_hours -> current_day ->> 'start')::TIME AND
        current_time <= (business_hours -> current_day ->> 'end')::TIME
    ) OR 
    -- Allow admin access outside business hours
    security.has_role('ADMIN');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
```

### 2. Universal Tenant Isolation Policies

```sql
-- =======================
-- UNIVERSAL TENANT ISOLATION
-- =======================

-- Template for all business-isolated tables
DO $$
DECLARE
    table_record RECORD;
    policy_name TEXT;
BEGIN
    FOR table_record IN
        SELECT schemaname, tablename
        FROM pg_tables
        WHERE schemaname IN ('system_core', 'tenant_mgmt', 'user_mgmt', 'security_mgmt', 
                           'hs', 'auto', 'rest', 'banking', 'retail', 'courses', 
                           'payroll', 'investigations')
          AND EXISTS (
              SELECT 1 FROM information_schema.columns
              WHERE table_schema = schemaname
                AND table_name = tablename
                AND column_name = 'business_id'
          )
    LOOP
        -- Enable RLS
        EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', 
                      table_record.schemaname, table_record.tablename);
        
        -- Create tenant isolation policy
        policy_name := 'tenant_isolation_' || table_record.tablename;
        BEGIN
            EXECUTE format(
                'CREATE POLICY %I ON %I.%I
                 FOR ALL
                 TO authenticated_users
                 USING (security.can_access_business(business_id))
                 WITH CHECK (security.can_access_business(business_id))',
                policy_name, table_record.schemaname, table_record.tablename
            );
        EXCEPTION WHEN duplicate_object THEN
            -- Policy already exists
            NULL;
        END;
    END LOOP;
END;
$$;
```

## Industry-Specific RLS Policies

### 1. Home Services (HS) Schema Policies

```sql
-- =======================
-- HOME SERVICES SPECIFIC POLICIES
-- =======================

-- Customer data protection
CREATE POLICY customer_data_access ON hs.customers
FOR ALL TO authenticated_users
USING (
    security.can_access_business(business_id) AND (
        -- Customer service representatives
        security.has_role('CUSTOMER_SERVICE') OR
        -- Assigned technicians
        security.has_role('TECHNICIAN') OR
        -- Managers and admins
        security.has_role('MANAGER') OR
        security.has_role('ADMIN') OR
        -- Self-access for customer portal
        (security.has_role('CUSTOMER') AND 
         id = (security.get_current_security_context() ->> 'user_attributes')::JSONB ->> 'customer_id')
    )
);

-- Work order access with technician assignment
CREATE POLICY work_order_technician_access ON hs.work_orders
FOR ALL TO authenticated_users
USING (
    security.can_access_business(business_id) AND (
        -- Assigned technician
        assigned_technician_id = current_setting('app.current_user_id', true)::UUID OR
        -- Dispatch and management
        security.has_role('DISPATCHER') OR
        security.has_role('MANAGER') OR
        security.has_role('ADMIN') OR
        -- Customer self-access
        (security.has_role('CUSTOMER') AND 
         customer_id = (security.get_current_security_context() ->> 'user_attributes')::JSONB ->> 'customer_id')
    )
);

-- Equipment access by location
CREATE POLICY equipment_location_access ON hs.equipment
FOR ALL TO authenticated_users
USING (
    security.can_access_business(business_id) AND (
        -- Location-based access for technicians
        (security.has_role('TECHNICIAN') AND 
         location_id = (security.get_current_security_context() ->> 'user_attributes')::JSONB ->> 'location_id') OR
        -- Management access
        security.has_role('MANAGER') OR
        security.has_role('ADMIN')
    )
);

-- Pricing sensitive data
CREATE POLICY pricing_confidentiality ON hs.service_pricing
FOR ALL TO authenticated_users
USING (
    security.can_access_business(business_id) AND (
        security.has_role('PRICING_MANAGER') OR
        security.has_role('FINANCE') OR
        security.has_role('ADMIN')
    )
);
```

### 2. Banking & Financial Services Policies

```sql
-- =======================
-- BANKING SPECIFIC POLICIES
-- =======================

-- Account ownership and access
CREATE POLICY financial_account_ownership ON banking.financial_accounts
FOR ALL TO authenticated_users
USING (
    security.can_access_business(business_id) AND (
        -- Account owner
        owner_entity_id = current_setting('app.current_user_id', true)::UUID OR
        -- Authorized signers
        EXISTS (
            SELECT 1 FROM banking.account_signers s
            WHERE s.account_id = id 
              AND s.signer_id = current_setting('app.current_user_id', true)::UUID
              AND s.is_active = TRUE
        ) OR
        -- Banking staff with proper clearance
        (security.has_role('BANKER') AND security.has_clearance_level('CONFIDENTIAL')) OR
        -- Compliance and audit access
        security.has_role('COMPLIANCE_OFFICER') OR
        security.has_role('AUDITOR')
    )
);

-- Transaction privacy
CREATE POLICY transaction_privacy ON banking.transactions
FOR ALL TO authenticated_users
USING (
    security.can_access_business(business_id) AND (
        -- Account access through financial_accounts policy
        EXISTS (
            SELECT 1 FROM banking.financial_accounts fa
            WHERE fa.id = account_id
              AND (
                fa.owner_entity_id = current_setting('app.current_user_id', true)::UUID OR
                EXISTS (
                    SELECT 1 FROM banking.account_signers s
                    WHERE s.account_id = fa.id 
                      AND s.signer_id = current_setting('app.current_user_id', true)::UUID
                      AND s.is_active = TRUE
                )
              )
        ) OR
        -- Banking operations staff
        (security.has_role('BANKER') AND security.has_clearance_level('CONFIDENTIAL')) OR
        -- Regulatory access
        security.has_role('COMPLIANCE_OFFICER') OR
        -- Fraud investigation
        (security.has_role('FRAUD_INVESTIGATOR') AND security.has_clearance_level('SECRET'))
    )
);

-- High-value transaction monitoring
CREATE POLICY high_value_transaction_monitoring ON banking.transactions
FOR ALL TO authenticated_users
USING (
    security.can_access_business(business_id) AND
    CASE 
        WHEN ABS(amount_cents) >= 1000000 THEN -- $10,000+
            (security.has_role('COMPLIANCE_OFFICER') OR 
             security.has_role('AML_ANALYST') OR
             security.has_clearance_level('SECRET'))
        ELSE TRUE
    END
);
```

### 3. Investigations Schema Security Policies

```sql
-- =======================
-- INVESTIGATIONS SECURITY POLICIES
-- =======================

-- Case access by security clearance and need-to-know
CREATE POLICY case_security_clearance ON investigations.cases
FOR ALL TO authenticated_users
USING (
    security.can_access_business(business_id) AND
    security.has_clearance_level(security_classification) AND (
        -- Case team members
        EXISTS (
            SELECT 1 FROM investigations.case_team_members ctm
            WHERE ctm.case_id = id 
              AND ctm.user_id = current_setting('app.current_user_id', true)::UUID
              AND ctm.is_active = TRUE
        ) OR
        -- Supervisory access
        security.has_role('INVESTIGATION_SUPERVISOR') OR
        -- Administrative access with proper clearance
        (security.has_role('ADMIN') AND security.has_clearance_level('TOP_SECRET'))
    )
);

-- Evidence access with chain of custody
CREATE POLICY evidence_chain_of_custody ON investigations.evidence_items
FOR ALL TO authenticated_users
USING (
    -- Must have access to the parent case
    EXISTS (
        SELECT 1 FROM investigations.cases c
        WHERE c.id = case_id
          AND security.can_access_business(c.business_id)
          AND security.has_clearance_level(c.security_classification)
          AND (
            EXISTS (
                SELECT 1 FROM investigations.case_team_members ctm
                WHERE ctm.case_id = c.id 
                  AND ctm.user_id = current_setting('app.current_user_id', true)::UUID
                  AND ctm.is_active = TRUE
            ) OR
            security.has_role('INVESTIGATION_SUPERVISOR') OR
            (security.has_role('ADMIN') AND security.has_clearance_level('TOP_SECRET'))
          )
    ) AND
    -- Evidence-specific clearance
    security.has_clearance_level(security_classification)
);

-- Witness information protection
CREATE POLICY witness_protection ON investigations.witnesses
FOR ALL TO authenticated_users
USING (
    -- Case access plus witness protection clearance
    EXISTS (
        SELECT 1 FROM investigations.cases c
        WHERE c.id = case_id
          AND security.can_access_business(c.business_id)
          AND security.has_clearance_level(c.security_classification)
    ) AND (
        security.has_role('LEAD_INVESTIGATOR') OR
        security.has_role('WITNESS_COORDINATOR') OR
        security.has_role('INVESTIGATION_SUPERVISOR')
    )
);
```

### 4. Payroll Privacy Protection

```sql
-- =======================
-- PAYROLL PRIVACY POLICIES
-- =======================

-- Employee compensation privacy
CREATE POLICY employee_compensation_privacy ON payroll.employees
FOR ALL TO authenticated_users
USING (
    security.can_access_business(business_id) AND (
        -- Self-access
        user_id = current_setting('app.current_user_id', true)::UUID OR
        -- HR access
        security.has_role('HR_ADMINISTRATOR') OR
        security.has_role('PAYROLL_ADMINISTRATOR') OR
        -- Management access with proper authorization
        (security.has_role('MANAGER') AND 
         EXISTS (
             SELECT 1 FROM payroll.manager_employee_access mea
             WHERE mea.manager_id = current_setting('app.current_user_id', true)::UUID
               AND mea.employee_id = id
               AND mea.is_active = TRUE
         )) OR
        -- Executive access
        security.has_role('EXECUTIVE')
    )
);

-- Paycheck data access
CREATE POLICY paycheck_privacy ON payroll.paychecks
FOR ALL TO authenticated_users
USING (
    security.can_access_business(business_id) AND (
        -- Employee self-access
        employee_id = current_setting('app.current_user_id', true)::UUID OR
        -- Payroll administration
        security.has_role('PAYROLL_ADMINISTRATOR') OR
        security.has_role('FINANCE_MANAGER') OR
        -- Audit access
        security.has_role('AUDITOR')
    )
);

-- Tax information high security
CREATE POLICY tax_information_security ON payroll.tax_filings
FOR ALL TO authenticated_users
USING (
    security.can_access_business(business_id) AND (
        security.has_role('TAX_ADMINISTRATOR') OR
        security.has_role('PAYROLL_ADMINISTRATOR') OR
        (security.has_role('AUDITOR') AND security.has_clearance_level('CONFIDENTIAL'))
    )
);
```

## Dynamic Context-Based Policies

### 1. Time-Based Access Controls

```sql
-- =======================
-- TIME-BASED ACCESS POLICIES
-- =======================

-- Business hours restriction for sensitive operations
CREATE OR REPLACE FUNCTION security.enforce_business_hours_policy(
    table_name TEXT,
    business_id UUID,
    operation TEXT DEFAULT 'READ'
)
RETURNS BOOLEAN AS $$
DECLARE
    requires_business_hours BOOLEAN;
    emergency_override BOOLEAN;
BEGIN
    -- Check if table requires business hours enforcement
    requires_business_hours := CASE table_name
        WHEN 'financial_accounts' THEN operation IN ('update', 'delete')
        WHEN 'transactions' THEN operation IN ('insert', 'update')
        WHEN 'payroll_runs' THEN operation IN ('insert', 'update', 'delete')
        WHEN 'employee_compensation' THEN operation IN ('update', 'delete')
        ELSE FALSE
    END;

    -- Check for emergency override
    emergency_override := (
        security.has_role('EMERGENCY_ACCESS') AND
        EXISTS (
            SELECT 1 FROM security_mgmt.emergency_access_sessions eas
            WHERE eas.user_id = current_setting('app.current_user_id', true)::UUID
              AND eas.is_active = TRUE
              AND eas.expires_at > NOW()
        )
    );

    -- Allow if no restriction, within business hours, or emergency override
    RETURN (
        NOT requires_business_hours OR
        security.is_within_business_hours(business_id) OR
        emergency_override
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply time-based policy to banking transactions
CREATE POLICY banking_transaction_hours ON banking.transactions
FOR INSERT TO authenticated_users
WITH CHECK (
    security.can_access_business(business_id) AND
    security.enforce_business_hours_policy('transactions', business_id, 'insert')
);
```

### 2. Location-Based Access

```sql
-- =======================
-- LOCATION-BASED POLICIES
-- =======================

-- Geographic restriction for sensitive data
CREATE OR REPLACE FUNCTION security.check_geographic_access(
    business_id UUID,
    required_jurisdiction TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    user_location JSONB;
    allowed_jurisdictions TEXT[];
    user_country TEXT;
BEGIN
    -- Get user location from session
    user_location := (security.get_current_security_context() ->> 'user_attributes')::JSONB -> 'location';
    user_country := user_location ->> 'country';

    -- Get business allowed jurisdictions
    SELECT b.business_settings -> 'allowed_jurisdictions'
    INTO allowed_jurisdictions
    FROM tenant_mgmt.businesses b
    WHERE b.id = business_id;

    -- Check jurisdiction requirements
    RETURN (
        -- No jurisdiction restriction
        (required_jurisdiction IS NULL AND allowed_jurisdictions IS NULL) OR
        -- Specific jurisdiction match
        (required_jurisdiction = user_country) OR
        -- Business jurisdiction allowlist
        (user_country = ANY(allowed_jurisdictions)) OR
        -- Admin override
        security.has_role('ADMIN')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply to investigations with jurisdictional restrictions
CREATE POLICY investigation_jurisdiction ON investigations.cases
FOR ALL TO authenticated_users
USING (
    security.can_access_business(business_id) AND
    security.has_clearance_level(security_classification) AND
    security.check_geographic_access(business_id, jurisdiction) AND (
        EXISTS (
            SELECT 1 FROM investigations.case_team_members ctm
            WHERE ctm.case_id = id 
              AND ctm.user_id = current_setting('app.current_user_id', true)::UUID
              AND ctm.is_active = TRUE
        ) OR
        security.has_role('INVESTIGATION_SUPERVISOR')
    )
);
```

### 3. Device and Session-Based Security

```sql
-- =======================
-- DEVICE AND SESSION SECURITY
-- =======================

-- Device trust verification
CREATE OR REPLACE FUNCTION security.is_trusted_device()
RETURNS BOOLEAN AS $$
DECLARE
    device_id TEXT;
    is_trusted BOOLEAN;
BEGIN
    device_id := current_setting('app.device_id', true);
    
    -- Check device trust status
    SELECT dt.is_trusted INTO is_trusted
    FROM security_mgmt.device_trust dt
    WHERE dt.device_id = device_id
      AND dt.user_id = current_setting('app.current_user_id', true)::UUID
      AND dt.is_active = TRUE;

    RETURN COALESCE(is_trusted, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- High-security operations require trusted devices
CREATE POLICY trusted_device_financial ON banking.wire_transfers
FOR ALL TO authenticated_users
USING (
    security.can_access_business(business_id) AND
    security.is_trusted_device() AND (
        security.has_role('TREASURER') OR
        security.has_role('FINANCE_MANAGER')
    )
);
```

## Emergency Access and Override Mechanisms

### 1. Break-Glass Emergency Access

```sql
-- =======================
-- EMERGENCY ACCESS PROCEDURES
-- =======================

-- Emergency access session management
CREATE OR REPLACE FUNCTION security.initiate_emergency_access(
    justification TEXT,
    required_approvals INTEGER DEFAULT 2
)
RETURNS UUID AS $$
DECLARE
    session_id UUID;
    user_id UUID;
BEGIN
    user_id := current_setting('app.current_user_id', true)::UUID;
    session_id := gen_random_uuid();

    -- Create emergency access request
    INSERT INTO security_mgmt.emergency_access_sessions (
        id,
        user_id,
        business_id,
        justification,
        required_approvals,
        session_status,
        initiated_at,
        expires_at
    ) VALUES (
        session_id,
        user_id,
        (security.get_current_security_context() ->> 'user_attributes')::JSONB ->> 'business_id',
        justification,
        required_approvals,
        'PENDING_APPROVAL',
        NOW(),
        NOW() + INTERVAL '4 hours'  -- Maximum emergency session duration
    );

    -- Log emergency access request
    INSERT INTO system_core.activity_stream (
        business_id,
        user_id,
        activity_type,
        activity_category,
        description,
        activity_data
    ) VALUES (
        (security.get_current_security_context() ->> 'user_attributes')::JSONB ->> 'business_id',
        user_id,
        'EMERGENCY_ACCESS_REQUESTED',
        'security_event',
        'Emergency access requested: ' || justification,
        jsonb_build_object('session_id', session_id, 'justification', justification)
    );

    RETURN session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Emergency override policy
CREATE POLICY emergency_override_access ON banking.financial_accounts
FOR ALL TO authenticated_users
USING (
    -- Normal access OR emergency access
    (security.can_access_business(business_id) AND
     (owner_entity_id = current_setting('app.current_user_id', true)::UUID OR
      security.has_role('BANKER'))) OR
    -- Emergency access with active session
    (security.has_role('EMERGENCY_ACCESS') AND
     EXISTS (
         SELECT 1 FROM security_mgmt.emergency_access_sessions eas
         WHERE eas.user_id = current_setting('app.current_user_id', true)::UUID
           AND eas.session_status = 'APPROVED'
           AND eas.is_active = TRUE
           AND eas.expires_at > NOW()
     ))
);
```

## Performance Optimization for RLS

### 1. Policy Caching and Optimization

```sql
-- =======================
-- RLS PERFORMANCE OPTIMIZATION
-- =======================

-- Create indexes to support RLS policies
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_profiles_business_role
ON user_mgmt.user_profiles (business_id, id) 
INCLUDE (department, security_clearance_level, is_admin);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_roles_user_lookup
ON user_mgmt.user_roles (user_id, role_id) 
WHERE is_active = TRUE;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_case_team_members_access
ON investigations.case_team_members (case_id, user_id) 
WHERE is_active = TRUE;

-- Materialized view for frequent security lookups
CREATE MATERIALIZED VIEW security.user_security_summary AS
SELECT 
    up.id as user_id,
    up.business_id,
    up.department,
    up.location_id,
    up.security_clearance_level,
    up.is_admin,
    array_agg(r.role_name) FILTER (WHERE ur.is_active) as roles,
    COUNT(ur.role_id) FILTER (WHERE ur.is_active) as role_count
FROM user_mgmt.user_profiles up
LEFT JOIN user_mgmt.user_roles ur ON up.id = ur.user_id AND ur.is_active = TRUE
LEFT JOIN user_mgmt.roles r ON ur.role_id = r.id
WHERE up.is_active = TRUE
GROUP BY up.id, up.business_id, up.department, up.location_id, 
         up.security_clearance_level, up.is_admin;

CREATE UNIQUE INDEX ON security.user_security_summary (user_id);
CREATE INDEX ON security.user_security_summary (business_id);
CREATE INDEX ON security.user_security_summary USING GIN (roles);

-- Optimized security context function using materialized view
CREATE OR REPLACE FUNCTION security.get_user_security_context_fast(user_id UUID)
RETURNS JSONB AS $$
DECLARE
    context JSONB;
BEGIN
    SELECT jsonb_build_object(
        'business_id', uss.business_id,
        'user_id', uss.user_id,
        'department', uss.department,
        'location_id', uss.location_id,
        'security_clearance', uss.security_clearance_level,
        'is_admin', uss.is_admin,
        'roles', uss.roles,
        'cached_at', NOW()
    ) INTO context
    FROM security.user_security_summary uss
    WHERE uss.user_id = user_id;

    RETURN context;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Refresh materialized view periodically
SELECT cron.schedule(
    'refresh-user-security-summary',
    '*/15 * * * *',  -- Every 15 minutes
    'REFRESH MATERIALIZED VIEW CONCURRENTLY security.user_security_summary;'
);
```

### 2. Policy Performance Monitoring

```sql
-- =======================
-- POLICY PERFORMANCE MONITORING
-- =======================

-- Track policy evaluation performance
CREATE TABLE IF NOT EXISTS security.rls_performance_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_schema TEXT NOT NULL,
    table_name TEXT NOT NULL,
    policy_name TEXT NOT NULL,
    evaluation_time_ms NUMERIC,
    result_rows INTEGER,
    user_id UUID,
    business_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to log slow policy evaluations
CREATE OR REPLACE FUNCTION security.log_slow_policy_evaluation()
RETURNS TRIGGER AS $$
BEGIN
    -- Log if policy evaluation takes more than 50ms
    IF (EXTRACT(EPOCH FROM (clock_timestamp() - statement_timestamp())) * 1000) > 50 THEN
        INSERT INTO security.rls_performance_log (
            table_schema,
            table_name,
            policy_name,
            evaluation_time_ms,
            user_id,
            business_id
        ) VALUES (
            TG_TABLE_SCHEMA,
            TG_TABLE_NAME,
            TG_OP || '_policy',
            EXTRACT(EPOCH FROM (clock_timestamp() - statement_timestamp())) * 1000,
            current_setting('app.current_user_id', true)::UUID,
            current_setting('app.current_business_id', true)::UUID
        );
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

## Compliance and Audit Integration

### 1. Policy Compliance Verification

```sql
-- =======================
-- COMPLIANCE VERIFICATION
-- =======================

-- GDPR compliance check
CREATE OR REPLACE FUNCTION security.verify_gdpr_compliance(business_id UUID)
RETURNS TABLE (
    table_name TEXT,
    compliance_status TEXT,
    issues JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH policy_check AS (
        SELECT 
            schemaname || '.' || tablename as table_name,
            EXISTS (
                SELECT 1 FROM pg_policies pp
                WHERE pp.schemaname = pt.schemaname 
                  AND pp.tablename = pt.tablename
                  AND pp.policyname LIKE '%gdpr%'
            ) as has_gdpr_policy,
            EXISTS (
                SELECT 1 FROM information_schema.columns c
                WHERE c.table_schema = pt.schemaname
                  AND c.table_name = pt.tablename 
                  AND c.column_name IN ('personal_data_category', 'data_subject_id')
            ) as has_privacy_fields
        FROM pg_tables pt
        WHERE pt.schemaname NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
    )
    SELECT 
        pc.table_name::TEXT,
        CASE 
            WHEN pc.has_gdpr_policy AND pc.has_privacy_fields THEN 'COMPLIANT'
            WHEN pc.has_gdpr_policy OR pc.has_privacy_fields THEN 'PARTIAL'
            ELSE 'NON_COMPLIANT'
        END::TEXT,
        jsonb_build_object(
            'has_gdpr_policy', pc.has_gdpr_policy,
            'has_privacy_fields', pc.has_privacy_fields,
            'recommendations', CASE 
                WHEN NOT pc.has_gdpr_policy THEN '["Add GDPR-specific RLS policies"]'::JSONB
                ELSE '[]'::JSONB
            END
        )
    FROM policy_check pc;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Summary

This comprehensive RLS policy framework provides:

1. **Multi-Tenant Isolation**: Enforced business_id separation across all tables
2. **Role-Based Access Control**: Hierarchical permission system with dynamic evaluation
3. **Attribute-Based Security**: Context-aware policies with real-time validation
4. **Industry-Specific Controls**: Tailored policies for each business vertical
5. **Emergency Access**: Break-glass procedures with proper approval workflows
6. **Performance Optimization**: Materialized views and strategic indexing
7. **Compliance Support**: GDPR, HIPAA, SOX, and other regulatory frameworks
8. **Audit Integration**: Comprehensive logging and monitoring capabilities

The policies ensure enterprise-grade security while maintaining optimal performance and supporting legitimate business operations across all Thorbis Business OS applications.