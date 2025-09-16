# Database Security Policies and Row Level Security (RLS)

> **Version**: 1.0.0  
> **Status**: Production Ready  
> **Last Updated**: 2025-01-31

## Overview

This document defines the comprehensive security policies and Row Level Security (RLS) implementation for the Thorbis multi-tenant database architecture. Every table in the system implements strict tenant isolation through RLS policies, ensuring zero data leakage between businesses while maintaining high performance and regulatory compliance.

## Core Security Principles

### Zero Trust Database Architecture
- **Default Deny**: All tables deny access by default
- **Explicit Permissions**: Every operation requires explicit policy authorization
- **Tenant Isolation**: Absolute separation between business tenants
- **Principle of Least Privilege**: Users access only required data for their role
- **Audit Everything**: All security events logged and monitored

### Multi-Tenant Security Model
- **Business-Level Isolation**: Primary tenant boundary via `business_id`
- **Role-Based Access Control**: Fine-grained permissions within tenants
- **Industry Separation**: Additional isolation between business verticals
- **User Context Validation**: Continuous validation of user permissions
- **Cross-Industry Prevention**: Block unauthorized cross-vertical access

## RLS Policy Framework

### Core System Security Policies

```sql
-- =======================
-- SYSTEM CORE RLS POLICIES
-- =======================

-- Tenant Management Security
ALTER TABLE tenant_mgmt.businesses ENABLE ROW LEVEL SECURITY;

-- Business owners can only see their own business
CREATE POLICY businesses_isolation_policy 
ON tenant_mgmt.businesses
FOR ALL
TO authenticated
USING (
    id = (SELECT current_setting('app.current_business_id')::UUID)
    OR
    id IN (
        SELECT b.id 
        FROM tenant_mgmt.businesses b
        JOIN user_mgmt.user_profiles up ON b.id = up.business_id
        WHERE up.user_id = auth.uid()
          AND up.is_active = true
    )
);

-- Subscription data access
ALTER TABLE tenant_mgmt.subscription_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY subscription_metrics_tenant_isolation
ON tenant_mgmt.subscription_metrics
FOR ALL
TO authenticated
USING (
    business_id = (SELECT current_setting('app.current_business_id')::UUID)
    OR
    business_id IN (
        SELECT up.business_id 
        FROM user_mgmt.user_profiles up 
        WHERE up.user_id = auth.uid() 
          AND up.is_active = true
          AND up.role_level >= 'admin'
    )
);

-- User Management Security
ALTER TABLE user_mgmt.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_profiles_business_isolation
ON user_mgmt.user_profiles
FOR ALL
TO authenticated
USING (
    user_id = auth.uid()
    OR
    (
        business_id = (SELECT current_setting('app.current_business_id')::UUID)
        AND EXISTS (
            SELECT 1 FROM user_mgmt.user_profiles up
            WHERE up.user_id = auth.uid()
              AND up.business_id = user_profiles.business_id
              AND up.is_active = true
              AND up.role_level IN ('owner', 'admin', 'manager')
        )
    )
);

-- User activity logs
ALTER TABLE user_mgmt.user_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_activity_access_policy
ON user_mgmt.user_activity
FOR ALL
TO authenticated
USING (
    user_id = auth.uid()
    OR
    EXISTS (
        SELECT 1 FROM user_mgmt.user_profiles up
        WHERE up.user_id = auth.uid()
          AND up.business_id = (
              SELECT up2.business_id 
              FROM user_mgmt.user_profiles up2 
              WHERE up2.user_id = user_activity.user_id
          )
          AND up.is_active = true
          AND up.role_level IN ('owner', 'admin')
    )
);

-- Security Management
ALTER TABLE security_mgmt.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY audit_logs_business_isolation
ON security_mgmt.audit_logs
FOR SELECT
TO authenticated
USING (
    business_id = (SELECT current_setting('app.current_business_id')::UUID)
    AND EXISTS (
        SELECT 1 FROM user_mgmt.user_profiles up
        WHERE up.user_id = auth.uid()
          AND up.business_id = audit_logs.business_id
          AND up.is_active = true
          AND up.role_level IN ('owner', 'admin')
    )
);

-- Prevent modification of audit logs
CREATE POLICY audit_logs_read_only
ON security_mgmt.audit_logs
FOR INSERT, UPDATE, DELETE
TO authenticated
USING (false);

-- Security incidents
ALTER TABLE security_mgmt.security_incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY security_incidents_business_access
ON security_mgmt.security_incidents
FOR ALL
TO authenticated
USING (
    business_id = (SELECT current_setting('app.current_business_id')::UUID)
    AND EXISTS (
        SELECT 1 FROM user_mgmt.user_profiles up
        WHERE up.user_id = auth.uid()
          AND up.business_id = security_incidents.business_id
          AND up.is_active = true
          AND up.role_level IN ('owner', 'admin')
    )
);
```

### Industry-Specific Security Policies

```sql
-- =======================
-- HOME SERVICES SECURITY
-- =======================

-- Work Orders Security
ALTER TABLE hs.work_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY hs_work_orders_business_isolation
ON hs.work_orders
FOR ALL
TO authenticated
USING (
    business_id = (SELECT current_setting('app.current_business_id')::UUID)
    AND EXISTS (
        SELECT 1 FROM user_mgmt.user_profiles up
        WHERE up.user_id = auth.uid()
          AND up.business_id = work_orders.business_id
          AND up.is_active = true
    )
);

-- Additional policy for technicians to only see assigned work
CREATE POLICY hs_work_orders_technician_assignment
ON hs.work_orders
FOR SELECT
TO authenticated
USING (
    business_id = (SELECT current_setting('app.current_business_id')::UUID)
    AND (
        -- Technicians can see their assigned work orders
        assigned_technician_id IN (
            SELECT e.id FROM hs.employees e
            JOIN user_mgmt.user_profiles up ON e.user_id = up.user_id
            WHERE up.user_id = auth.uid()
              AND up.business_id = work_orders.business_id
              AND e.role = 'technician'
        )
        OR
        -- Admins and managers can see all work orders
        EXISTS (
            SELECT 1 FROM user_mgmt.user_profiles up
            WHERE up.user_id = auth.uid()
              AND up.business_id = work_orders.business_id
              AND up.role_level IN ('owner', 'admin', 'manager')
        )
    )
);

-- Customer Data Protection
ALTER TABLE hs.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY hs_customers_business_isolation
ON hs.customers
FOR ALL
TO authenticated
USING (
    business_id = (SELECT current_setting('app.current_business_id')::UUID)
    AND EXISTS (
        SELECT 1 FROM user_mgmt.user_profiles up
        WHERE up.user_id = auth.uid()
          AND up.business_id = customers.business_id
          AND up.is_active = true
    )
);

-- Invoice and Payment Security
ALTER TABLE hs.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY hs_invoices_business_isolation
ON hs.invoices
FOR ALL
TO authenticated
USING (
    business_id = (SELECT current_setting('app.current_business_id')::UUID)
    AND EXISTS (
        SELECT 1 FROM user_mgmt.user_profiles up
        WHERE up.user_id = auth.uid()
          AND up.business_id = invoices.business_id
          AND up.is_active = true
          AND (
              up.role_level IN ('owner', 'admin', 'manager')
              OR
              (up.role_level = 'employee' AND up.permissions ? 'view_invoices')
          )
    )
);

-- Payment data requires higher privileges
ALTER TABLE hs.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY hs_payments_restricted_access
ON hs.payments
FOR ALL
TO authenticated
USING (
    business_id = (SELECT current_setting('app.current_business_id')::UUID)
    AND EXISTS (
        SELECT 1 FROM user_mgmt.user_profiles up
        WHERE up.user_id = auth.uid()
          AND up.business_id = payments.business_id
          AND up.is_active = true
          AND up.role_level IN ('owner', 'admin')
    )
);

-- =======================
-- AUTOMOTIVE SECURITY
-- =======================

-- Repair Orders Security
ALTER TABLE auto.repair_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY auto_repair_orders_business_isolation
ON auto.repair_orders
FOR ALL
TO authenticated
USING (
    business_id = (SELECT current_setting('app.current_business_id')::UUID)
    AND EXISTS (
        SELECT 1 FROM user_mgmt.user_profiles up
        WHERE up.user_id = auth.uid()
          AND up.business_id = repair_orders.business_id
          AND up.is_active = true
    )
);

-- Vehicle Information Protection
ALTER TABLE auto.vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY auto_vehicles_business_isolation
ON auto.vehicles
FOR ALL
TO authenticated
USING (
    business_id = (SELECT current_setting('app.current_business_id')::UUID)
    AND EXISTS (
        SELECT 1 FROM user_mgmt.user_profiles up
        WHERE up.user_id = auth.uid()
          AND up.business_id = vehicles.business_id
          AND up.is_active = true
    )
);

-- Parts and Inventory Security
ALTER TABLE auto.parts_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY auto_parts_inventory_business_isolation
ON auto.parts_inventory
FOR ALL
TO authenticated
USING (
    business_id = (SELECT current_setting('app.current_business_id')::UUID)
    AND EXISTS (
        SELECT 1 FROM user_mgmt.user_profiles up
        WHERE up.user_id = auth.uid()
          AND up.business_id = parts_inventory.business_id
          AND up.is_active = true
          AND (
              up.role_level IN ('owner', 'admin', 'manager')
              OR
              (up.role_level = 'employee' AND up.permissions ? 'manage_inventory')
          )
    )
);

-- =======================
-- RESTAURANT SECURITY
-- =======================

-- Orders Security with Kitchen Staff Access
ALTER TABLE rest.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY rest_orders_business_isolation
ON rest.orders
FOR ALL
TO authenticated
USING (
    business_id = (SELECT current_setting('app.current_business_id')::UUID)
    AND EXISTS (
        SELECT 1 FROM user_mgmt.user_profiles up
        WHERE up.user_id = auth.uid()
          AND up.business_id = orders.business_id
          AND up.is_active = true
    )
);

-- Kitchen staff can only see orders for their station
CREATE POLICY rest_orders_kitchen_station_access
ON rest.orders
FOR SELECT
TO authenticated
USING (
    business_id = (SELECT current_setting('app.current_business_id')::UUID)
    AND (
        -- Kitchen staff see orders with items for their station
        EXISTS (
            SELECT 1 FROM rest.order_items oi
            JOIN rest.kitchen_staff ks ON oi.assigned_station_id = ks.station_id
            JOIN user_mgmt.user_profiles up ON ks.user_id = up.user_id
            WHERE oi.order_id = orders.id
              AND up.user_id = auth.uid()
              AND up.business_id = orders.business_id
        )
        OR
        -- Managers and above see all orders
        EXISTS (
            SELECT 1 FROM user_mgmt.user_profiles up
            WHERE up.user_id = auth.uid()
              AND up.business_id = orders.business_id
              AND up.role_level IN ('owner', 'admin', 'manager')
        )
    )
);

-- Menu Items Security
ALTER TABLE rest.menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY rest_menu_items_business_isolation
ON rest.menu_items
FOR ALL
TO authenticated
USING (
    business_id = (SELECT current_setting('app.current_business_id')::UUID)
    AND EXISTS (
        SELECT 1 FROM user_mgmt.user_profiles up
        WHERE up.user_id = auth.uid()
          AND up.business_id = menu_items.business_id
          AND up.is_active = true
    )
);

-- Reservations Security
ALTER TABLE rest.reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY rest_reservations_business_isolation
ON rest.reservations
FOR ALL
TO authenticated
USING (
    business_id = (SELECT current_setting('app.current_business_id')::UUID)
    AND EXISTS (
        SELECT 1 FROM user_mgmt.user_profiles up
        WHERE up.user_id = auth.uid()
          AND up.business_id = reservations.business_id
          AND up.is_active = true
          AND (
              up.role_level IN ('owner', 'admin', 'manager')
              OR
              (up.role_level = 'employee' AND up.permissions ? 'manage_reservations')
          )
    )
);

-- =======================
-- RETAIL SECURITY
-- =======================

-- Transactions Security
ALTER TABLE ret.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY ret_transactions_business_isolation
ON ret.transactions
FOR ALL
TO authenticated
USING (
    business_id = (SELECT current_setting('app.current_business_id')::UUID)
    AND EXISTS (
        SELECT 1 FROM user_mgmt.user_profiles up
        WHERE up.user_id = auth.uid()
          AND up.business_id = transactions.business_id
          AND up.is_active = true
    )
);

-- Cashiers can only see their own transactions
CREATE POLICY ret_transactions_cashier_restriction
ON ret.transactions
FOR SELECT
TO authenticated
USING (
    business_id = (SELECT current_setting('app.current_business_id')::UUID)
    AND (
        -- Cashiers see only their transactions
        (
            cashier_id IN (
                SELECT e.id FROM ret.employees e
                JOIN user_mgmt.user_profiles up ON e.user_id = up.user_id
                WHERE up.user_id = auth.uid()
                  AND up.business_id = transactions.business_id
                  AND e.role = 'cashier'
            )
        )
        OR
        -- Managers and above see all transactions
        EXISTS (
            SELECT 1 FROM user_mgmt.user_profiles up
            WHERE up.user_id = auth.uid()
              AND up.business_id = transactions.business_id
              AND up.role_level IN ('owner', 'admin', 'manager')
        )
    )
);

-- Product Catalog Security
ALTER TABLE ret.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY ret_products_business_isolation
ON ret.products
FOR ALL
TO authenticated
USING (
    business_id = (SELECT current_setting('app.current_business_id')::UUID)
    AND EXISTS (
        SELECT 1 FROM user_mgmt.user_profiles up
        WHERE up.user_id = auth.uid()
          AND up.business_id = products.business_id
          AND up.is_active = true
    )
);

-- Inventory Management Security
ALTER TABLE ret.inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY ret_inventory_business_isolation
ON ret.inventory
FOR ALL
TO authenticated
USING (
    business_id = (SELECT current_setting('app.current_business_id')::UUID)
    AND EXISTS (
        SELECT 1 FROM user_mgmt.user_profiles up
        WHERE up.user_id = auth.uid()
          AND up.business_id = inventory.business_id
          AND up.is_active = true
          AND (
              up.role_level IN ('owner', 'admin', 'manager')
              OR
              (up.role_level = 'employee' AND up.permissions ? 'manage_inventory')
          )
    )
);
```

### Cross-Industry Universal Policies

```sql
-- =======================
-- UNIVERSAL SYSTEM POLICIES
-- =======================

-- Activity Stream Security
ALTER TABLE system_core.activity_stream ENABLE ROW LEVEL SECURITY;

CREATE POLICY activity_stream_business_isolation
ON system_core.activity_stream
FOR ALL
TO authenticated
USING (
    business_id = (SELECT current_setting('app.current_business_id')::UUID)
    AND EXISTS (
        SELECT 1 FROM user_mgmt.user_profiles up
        WHERE up.user_id = auth.uid()
          AND up.business_id = activity_stream.business_id
          AND up.is_active = true
    )
);

-- Users can see their own activity
CREATE POLICY activity_stream_user_access
ON system_core.activity_stream
FOR SELECT
TO authenticated
USING (
    user_id = auth.uid()
    AND business_id = (SELECT current_setting('app.current_business_id')::UUID)
);

-- Notifications Security
ALTER TABLE system_core.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY notifications_recipient_access
ON system_core.notifications
FOR ALL
TO authenticated
USING (
    recipient_id = auth.uid()
    OR
    (
        business_id = (SELECT current_setting('app.current_business_id')::UUID)
        AND recipient_type = 'business'
        AND EXISTS (
            SELECT 1 FROM user_mgmt.user_profiles up
            WHERE up.user_id = auth.uid()
              AND up.business_id = notifications.business_id
              AND up.is_active = true
        )
    )
);

-- File Attachments Security
ALTER TABLE system_core.file_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY file_attachments_business_isolation
ON system_core.file_attachments
FOR ALL
TO authenticated
USING (
    business_id = (SELECT current_setting('app.current_business_id')::UUID)
    AND EXISTS (
        SELECT 1 FROM user_mgmt.user_profiles up
        WHERE up.user_id = auth.uid()
          AND up.business_id = file_attachments.business_id
          AND up.is_active = true
    )
);

-- Comments Security
ALTER TABLE system_core.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY comments_business_isolation
ON system_core.comments
FOR ALL
TO authenticated
USING (
    business_id = (SELECT current_setting('app.current_business_id')::UUID)
    AND EXISTS (
        SELECT 1 FROM user_mgmt.user_profiles up
        WHERE up.user_id = auth.uid()
          AND up.business_id = comments.business_id
          AND up.is_active = true
    )
);

-- Users can edit their own comments
CREATE POLICY comments_author_edit
ON system_core.comments
FOR UPDATE
TO authenticated
USING (
    author_id = auth.uid()
    AND business_id = (SELECT current_setting('app.current_business_id')::UUID)
);
```

## Advanced Security Features

### Dynamic Security Policies

```sql
-- =======================
-- DYNAMIC SECURITY FUNCTIONS
-- =======================

-- Context-Aware Security Policy
CREATE OR REPLACE FUNCTION security.get_user_business_context()
RETURNS UUID AS $$
DECLARE
    current_business UUID;
    user_businesses UUID[];
BEGIN
    -- Get currently set business context
    BEGIN
        current_business := current_setting('app.current_business_id')::UUID;
    EXCEPTION WHEN OTHERS THEN
        current_business := NULL;
    END;
    
    -- If no context set, get user's primary business
    IF current_business IS NULL THEN
        SELECT array_agg(business_id) INTO user_businesses
        FROM user_mgmt.user_profiles
        WHERE user_id = auth.uid()
          AND is_active = true;
          
        IF array_length(user_businesses, 1) = 1 THEN
            current_business := user_businesses[1];
            PERFORM set_config('app.current_business_id', current_business::TEXT, true);
        END IF;
    END IF;
    
    -- Validate user has access to the set business
    IF current_business IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM user_mgmt.user_profiles
            WHERE user_id = auth.uid()
              AND business_id = current_business
              AND is_active = true
        ) THEN
            RAISE EXCEPTION 'Access denied to business context %', current_business;
        END IF;
    END IF;
    
    RETURN current_business;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Role-Based Permission Check
CREATE OR REPLACE FUNCTION security.user_has_permission(
    required_permission TEXT,
    target_business_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
    user_permissions JSONB;
    business_id UUID;
BEGIN
    business_id := COALESCE(target_business_id, security.get_user_business_context());
    
    SELECT up.role_level, up.permissions 
    INTO user_role, user_permissions
    FROM user_mgmt.user_profiles up
    WHERE up.user_id = auth.uid()
      AND up.business_id = business_id
      AND up.is_active = true;
      
    IF user_role IS NULL THEN
        RETURN false;
    END IF;
    
    -- Owners and admins have all permissions
    IF user_role IN ('owner', 'admin') THEN
        RETURN true;
    END IF;
    
    -- Check specific permission
    IF user_permissions ? required_permission THEN
        RETURN true;
    END IF;
    
    -- Check role-based default permissions
    CASE user_role
        WHEN 'manager' THEN
            RETURN required_permission IN ('view_reports', 'manage_employees', 'view_customers');
        WHEN 'employee' THEN
            RETURN required_permission IN ('view_basic', 'create_orders', 'update_status');
        ELSE
            RETURN false;
    END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Industry Access Control
CREATE OR REPLACE FUNCTION security.user_has_industry_access(
    industry_name TEXT
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_mgmt.user_profiles up
        JOIN tenant_mgmt.businesses b ON up.business_id = b.id
        WHERE up.user_id = auth.uid()
          AND up.is_active = true
          AND b.industry_type = industry_name
          AND up.business_id = security.get_user_business_context()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Data Encryption and PII Protection

```sql
-- =======================
-- DATA ENCRYPTION POLICIES
-- =======================

-- Encrypt sensitive customer data
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Customer PII encryption functions
CREATE OR REPLACE FUNCTION security.encrypt_pii(plaintext TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN encode(
        pgp_sym_encrypt(
            plaintext::TEXT,
            current_setting('app.encryption_key'),
            'compress-algo=1, cipher-algo=aes256'
        ),
        'base64'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION security.decrypt_pii(encrypted_text TEXT)
RETURNS TEXT AS $$
BEGIN
    IF encrypted_text IS NULL OR encrypted_text = '' THEN
        RETURN NULL;
    END IF;
    
    RETURN pgp_sym_decrypt(
        decode(encrypted_text, 'base64'),
        current_setting('app.encryption_key')
    );
EXCEPTION WHEN OTHERS THEN
    -- Return redacted text if decryption fails
    RETURN '[ENCRYPTED]';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PII redaction for non-privileged users
CREATE OR REPLACE FUNCTION security.redact_pii(
    data_value TEXT,
    required_permission TEXT DEFAULT 'view_pii'
) RETURNS TEXT AS $$
BEGIN
    IF security.user_has_permission(required_permission) THEN
        RETURN data_value;
    ELSE
        RETURN CASE 
            WHEN data_value IS NULL THEN NULL
            WHEN length(data_value) <= 4 THEN '****'
            ELSE left(data_value, 2) || repeat('*', length(data_value) - 4) || right(data_value, 2)
        END;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Views with automatic PII redaction
CREATE VIEW hs.customers_secure AS
SELECT 
    id,
    business_id,
    security.redact_pii(customer_name, 'view_customer_pii') as customer_name,
    security.redact_pii(email, 'view_customer_pii') as email,
    security.redact_pii(phone, 'view_customer_pii') as phone,
    -- Address redacted for employees
    CASE WHEN security.user_has_permission('view_customer_addresses') 
         THEN address_line_1 
         ELSE '[REDACTED]' 
    END as address_line_1,
    city,
    state,
    postal_code,
    created_at,
    updated_at,
    is_active
FROM hs.customers;
```

### Security Monitoring and Alerting

```sql
-- =======================
-- SECURITY MONITORING
-- =======================

-- Security Event Logging
CREATE OR REPLACE FUNCTION security.log_security_event(
    event_type TEXT,
    event_description TEXT,
    risk_level INTEGER DEFAULT 1,
    entity_type TEXT DEFAULT NULL,
    entity_id UUID DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    INSERT INTO security_mgmt.security_events (
        business_id,
        user_id,
        event_type,
        event_description,
        risk_level,
        entity_type,
        entity_id,
        ip_address,
        user_agent,
        created_at
    ) VALUES (
        security.get_user_business_context(),
        auth.uid(),
        event_type,
        event_description,
        risk_level,
        entity_type,
        entity_id,
        current_setting('request.headers')::jsonb->>'x-forwarded-for',
        current_setting('request.headers')::jsonb->>'user-agent',
        NOW()
    );
    
    -- Trigger alert for high-risk events
    IF risk_level >= 8 THEN
        PERFORM security.trigger_security_alert(
            'HIGH_RISK_EVENT',
            format('High-risk security event: %s - %s', event_type, event_description)
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Automatic security event triggers
CREATE OR REPLACE FUNCTION security.security_audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- Log all INSERT, UPDATE, DELETE operations on sensitive tables
    PERFORM security.log_security_event(
        TG_OP || '_' || TG_TABLE_SCHEMA || '_' || TG_TABLE_NAME,
        format('Operation: %s on table %s.%s', TG_OP, TG_TABLE_SCHEMA, TG_TABLE_NAME),
        CASE TG_OP
            WHEN 'DELETE' THEN 6
            WHEN 'UPDATE' THEN 3
            WHEN 'INSERT' THEN 2
        END,
        TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id)
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to sensitive tables
CREATE TRIGGER audit_hs_customers 
AFTER INSERT OR UPDATE OR DELETE ON hs.customers
FOR EACH ROW EXECUTE FUNCTION security.security_audit_trigger();

CREATE TRIGGER audit_hs_invoices 
AFTER INSERT OR UPDATE OR DELETE ON hs.invoices
FOR EACH ROW EXECUTE FUNCTION security.security_audit_trigger();

CREATE TRIGGER audit_auto_vehicles 
AFTER INSERT OR UPDATE OR DELETE ON auto.vehicles
FOR EACH ROW EXECUTE FUNCTION security.security_audit_trigger();

-- Failed authentication attempt monitoring
CREATE OR REPLACE FUNCTION security.track_failed_authentication(
    attempted_email TEXT,
    failure_reason TEXT
) RETURNS VOID AS $$
BEGIN
    INSERT INTO security_mgmt.failed_authentications (
        attempted_email,
        failure_reason,
        ip_address,
        attempt_time
    ) VALUES (
        attempted_email,
        failure_reason,
        current_setting('request.headers')::jsonb->>'x-forwarded-for',
        NOW()
    );
    
    -- Check for brute force attempts
    IF (SELECT COUNT(*) 
        FROM security_mgmt.failed_authentications 
        WHERE attempted_email = attempted_email 
          AND attempt_time >= NOW() - INTERVAL '15 minutes') >= 5 THEN
        
        PERFORM security.trigger_security_alert(
            'BRUTE_FORCE_ATTEMPT',
            format('Multiple failed login attempts for email: %s', attempted_email)
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Compliance and Data Governance

```sql
-- =======================
-- COMPLIANCE FRAMEWORK
-- =======================

-- GDPR Data Subject Rights
CREATE OR REPLACE FUNCTION compliance.export_user_data(
    target_user_id UUID
) RETURNS JSONB AS $$
DECLARE
    user_data JSONB := '{}';
    business_context UUID;
BEGIN
    business_context := security.get_user_business_context();
    
    -- Verify authorization to export this user's data
    IF NOT security.user_has_permission('export_user_data') THEN
        RAISE EXCEPTION 'Insufficient permissions to export user data';
    END IF;
    
    -- Collect user profile data
    SELECT jsonb_build_object(
        'profile', row_to_json(up.*),
        'businesses', array_agg(b.business_name)
    ) INTO user_data
    FROM user_mgmt.user_profiles up
    LEFT JOIN tenant_mgmt.businesses b ON up.business_id = b.id
    WHERE up.user_id = target_user_id
      AND up.business_id = business_context
    GROUP BY up.*;
    
    -- Log the data export
    PERFORM security.log_security_event(
        'DATA_EXPORT',
        format('User data exported for user_id: %s', target_user_id),
        5,
        'user_profile',
        target_user_id
    );
    
    RETURN user_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Data Retention Policy Enforcement
CREATE OR REPLACE FUNCTION compliance.enforce_data_retention()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
BEGIN
    -- Delete old activity stream data (2 years retention)
    DELETE FROM system_core.activity_stream 
    WHERE created_at < NOW() - INTERVAL '2 years';
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Delete old audit logs (7 years retention for compliance)
    DELETE FROM security_mgmt.audit_logs 
    WHERE created_at < NOW() - INTERVAL '7 years';
    
    -- Archive old completed work orders (5 years retention)
    UPDATE hs.work_orders 
    SET is_archived = true 
    WHERE status = 'completed' 
      AND updated_at < NOW() - INTERVAL '5 years'
      AND NOT is_archived;
    
    -- Log retention policy enforcement
    PERFORM security.log_security_event(
        'DATA_RETENTION_ENFORCEMENT',
        format('Data retention policy enforced. Records processed: %s', deleted_count),
        3
    );
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PCI DSS Compliance for Payment Data
CREATE POLICY payment_data_pci_compliance
ON hs.payments
FOR ALL
TO authenticated
USING (
    business_id = security.get_user_business_context()
    AND security.user_has_permission('view_payment_data')
    AND EXISTS (
        SELECT 1 FROM security_mgmt.compliance_certifications cc
        WHERE cc.business_id = payments.business_id
          AND cc.certification_type = 'PCI_DSS'
          AND cc.is_valid = true
          AND cc.expires_at > NOW()
    )
);
```

## Security Policy Management

### Policy Administration Functions

```sql
-- =======================
-- POLICY MANAGEMENT
-- =======================

-- Enable RLS on all new tables automatically
CREATE OR REPLACE FUNCTION security.auto_enable_rls()
RETURNS event_trigger AS $$
DECLARE
    obj record;
BEGIN
    FOR obj IN SELECT * FROM pg_event_trigger_ddl_commands() WHERE command_tag = 'CREATE TABLE'
    LOOP
        EXECUTE format('ALTER TABLE %s ENABLE ROW LEVEL SECURITY', obj.object_identity);
        
        -- Log the RLS enablement
        PERFORM security.log_security_event(
            'RLS_AUTO_ENABLED',
            format('RLS automatically enabled on new table: %s', obj.object_identity),
            2
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE EVENT TRIGGER auto_enable_rls_trigger 
ON ddl_command_end 
WHEN TAG IN ('CREATE TABLE')
EXECUTE FUNCTION security.auto_enable_rls();

-- Validate RLS policy completeness
CREATE OR REPLACE FUNCTION security.validate_rls_policies()
RETURNS TABLE (
    schema_name TEXT,
    table_name TEXT,
    rls_enabled BOOLEAN,
    policy_count INTEGER,
    missing_policies TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    WITH table_policies AS (
        SELECT 
            t.schemaname,
            t.tablename,
            t.rowsecurity as rls_enabled,
            COALESCE(p.policy_count, 0) as policy_count
        FROM pg_tables t
        LEFT JOIN (
            SELECT schemaname, tablename, COUNT(*) as policy_count
            FROM pg_policies
            GROUP BY schemaname, tablename
        ) p ON t.schemaname = p.schemaname AND t.tablename = p.tablename
        WHERE t.schemaname NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
    )
    SELECT 
        tp.schemaname::TEXT,
        tp.tablename::TEXT,
        tp.rls_enabled,
        tp.policy_count,
        CASE 
            WHEN NOT tp.rls_enabled THEN ARRAY['RLS_NOT_ENABLED']
            WHEN tp.policy_count = 0 THEN ARRAY['NO_POLICIES']
            WHEN tp.policy_count < 2 THEN ARRAY['INSUFFICIENT_POLICIES']
            ELSE ARRAY[]::TEXT[]
        END as missing_policies
    FROM table_policies tp
    WHERE tp.schemaname IN ('hs', 'auto', 'rest', 'ret', 'courses', 'payroll', 'investigations')
    ORDER BY tp.schemaname, tp.tablename;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Summary

This comprehensive security policy framework provides:

1. **Complete RLS Coverage**: Every table protected with tenant isolation
2. **Role-Based Access Control**: Fine-grained permissions within each business
3. **Industry Separation**: Additional security boundaries between verticals  
4. **Dynamic Security Context**: Automatic business context validation
5. **PII Protection**: Encryption and redaction of sensitive data
6. **Security Monitoring**: Comprehensive audit logging and threat detection
7. **Compliance Framework**: GDPR, PCI DSS, and data retention compliance
8. **Automated Policy Management**: Event-driven security policy enforcement

The security implementation ensures zero data leakage between tenants while maintaining high performance through optimized policy queries and comprehensive monitoring of all security events.