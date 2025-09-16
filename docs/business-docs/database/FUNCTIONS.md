# Database Functions Guide

> **Version**: 1.0.0  
> **Last Updated**: January 2025  
> **Target Audience**: Database Developers, Backend Engineers, Database Administrators  

## Overview

This guide covers stored procedures and database functions for the Thorbis Business OS platform. Functions encapsulate business logic, provide data validation, enable complex calculations, and ensure consistent data processing across all applications.

## Function Categories

### Function Organization
```typescript
interface FunctionCategories {
  businessLogic: 'Core business rule implementations and calculations';
  utilities: 'Helper functions for common operations and data manipulation';
  triggers: 'Event-driven functions for automated data processing';
  security: 'Authentication, authorization, and access control functions';
  analytics: 'Data aggregation, reporting, and business intelligence functions';
  validation: 'Data validation and constraint enforcement functions';
  integration: 'External system integration and API helper functions';
}
```

## Business Logic Functions

### Tenant Management Functions
```sql
-- Get current tenant context
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN COALESCE(
        -- From explicit session variable (preferred)
        (current_setting('app.current_tenant_id', true))::uuid,
        -- From JWT token
        (auth.jwt() ->> 'tenant_id')::uuid,
        -- From user lookup (fallback)
        (
            SELECT u.tenant_id 
            FROM shared.users u 
            WHERE u.id = auth.uid()
            LIMIT 1
        )
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$;

-- Set tenant context for session
CREATE OR REPLACE FUNCTION set_tenant_context(
    tenant_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Validate tenant exists and user has access
    IF NOT EXISTS (
        SELECT 1 FROM shared.tenants t
        JOIN shared.users u ON u.tenant_id = t.id
        WHERE t.id = set_tenant_context.tenant_id
        AND u.id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Invalid tenant or access denied';
    END IF;
    
    -- Set session variable
    PERFORM set_config('app.current_tenant_id', tenant_id::text, false);
    
    -- Log context change for audit
    INSERT INTO audit.security_events (
        event_type,
        user_id,
        tenant_id,
        details
    ) VALUES (
        'tenant_context_change',
        auth.uid(),
        tenant_id,
        jsonb_build_object('previous_tenant', current_setting('app.current_tenant_id', true))
    );
END;
$$;

-- Get tenant configuration
CREATE OR REPLACE FUNCTION get_tenant_config(
    config_key TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    tenant_id UUID := get_current_tenant_id();
    config_data JSONB;
BEGIN
    IF tenant_id IS NULL THEN
        RAISE EXCEPTION 'No tenant context available';
    END IF;
    
    SELECT settings INTO config_data
    FROM shared.tenants
    WHERE id = tenant_id;
    
    IF config_key IS NOT NULL THEN
        RETURN config_data -> config_key;
    END IF;
    
    RETURN config_data;
END;
$$;
```

### Work Order Management Functions
```sql
-- Calculate work order total cost
CREATE OR REPLACE FUNCTION calculate_work_order_total(
    work_order_id UUID
)
RETURNS DECIMAL(10,2)
LANGUAGE plpgsql
AS $$
DECLARE
    labor_cost DECIMAL(10,2) := 0.00;
    parts_cost DECIMAL(10,2) := 0.00;
    tax_rate DECIMAL(5,4) := 0.00;
    total_cost DECIMAL(10,2);
    tenant_settings JSONB;
BEGIN
    -- Get work order costs
    SELECT 
        wo.labor_cost,
        wo.parts_cost
    INTO labor_cost, parts_cost
    FROM home_services.work_orders wo
    WHERE wo.id = work_order_id
    AND wo.tenant_id = get_current_tenant_id();
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Work order not found or access denied';
    END IF;
    
    -- Get tenant tax settings
    SELECT get_tenant_config('tax_settings') INTO tenant_settings;
    
    -- Calculate tax rate
    tax_rate := COALESCE((tenant_settings ->> 'default_tax_rate')::DECIMAL(5,4), 0.00);
    
    -- Calculate total
    total_cost := (labor_cost + parts_cost) * (1 + tax_rate);
    
    RETURN total_cost;
END;
$$;

-- Schedule work order with conflict detection
CREATE OR REPLACE FUNCTION schedule_work_order(
    work_order_id UUID,
    technician_id UUID,
    scheduled_at TIMESTAMPTZ,
    estimated_duration INTERVAL DEFAULT '2 hours'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    conflict_count INTEGER;
    tenant_id UUID := get_current_tenant_id();
BEGIN
    -- Check for scheduling conflicts
    SELECT COUNT(*) INTO conflict_count
    FROM home_services.work_orders wo
    WHERE wo.technician_id = schedule_work_order.technician_id
    AND wo.tenant_id = tenant_id
    AND wo.status IN ('scheduled', 'in_progress')
    AND wo.id != work_order_id
    AND (
        -- Overlap detection
        (wo.scheduled_at, wo.scheduled_at + COALESCE(wo.estimated_duration, '2 hours'::INTERVAL))
        OVERLAPS
        (scheduled_at, scheduled_at + estimated_duration)
    );
    
    IF conflict_count > 0 THEN
        RAISE EXCEPTION 'Scheduling conflict: technician has % conflicting appointments', conflict_count;
    END IF;
    
    -- Update work order
    UPDATE home_services.work_orders
    SET 
        technician_id = schedule_work_order.technician_id,
        scheduled_at = schedule_work_order.scheduled_at,
        estimated_duration = schedule_work_order.estimated_duration,
        status = 'scheduled',
        updated_at = NOW()
    WHERE id = work_order_id
    AND tenant_id = get_current_tenant_id();
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Work order not found or access denied';
    END IF;
    
    -- Log scheduling event
    INSERT INTO audit.work_order_events (
        work_order_id,
        event_type,
        user_id,
        details
    ) VALUES (
        work_order_id,
        'scheduled',
        auth.uid(),
        jsonb_build_object(
            'technician_id', technician_id,
            'scheduled_at', scheduled_at,
            'estimated_duration', estimated_duration
        )
    );
    
    RETURN TRUE;
END;
$$;

-- Auto-assign technician based on availability and skills
CREATE OR REPLACE FUNCTION auto_assign_technician(
    work_order_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    selected_technician UUID;
    work_order_rec RECORD;
    required_skills TEXT[];
BEGIN
    -- Get work order details
    SELECT * INTO work_order_rec
    FROM home_services.work_orders
    WHERE id = work_order_id
    AND tenant_id = get_current_tenant_id();
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Work order not found';
    END IF;
    
    -- Extract required skills from service type
    required_skills := CASE work_order_rec.service_type
        WHEN 'electrical' THEN ARRAY['electrical', 'safety']
        WHEN 'plumbing' THEN ARRAY['plumbing', 'water_systems']
        WHEN 'hvac' THEN ARRAY['hvac', 'electrical']
        ELSE ARRAY['general']
    END;
    
    -- Find available technician with required skills
    SELECT u.id INTO selected_technician
    FROM shared.users u
    JOIN shared.user_skills us ON us.user_id = u.id
    WHERE u.tenant_id = get_current_tenant_id()
    AND u.role = 'technician'
    AND u.active = TRUE
    AND us.skill = ANY(required_skills)
    AND NOT EXISTS (
        -- Check for conflicts in next 24 hours
        SELECT 1 FROM home_services.work_orders wo
        WHERE wo.technician_id = u.id
        AND wo.status IN ('scheduled', 'in_progress')
        AND wo.scheduled_at BETWEEN NOW() AND NOW() + INTERVAL '24 hours'
    )
    GROUP BY u.id, u.first_name, u.last_name
    HAVING COUNT(DISTINCT us.skill) >= ARRAY_LENGTH(required_skills, 1) / 2.0
    ORDER BY COUNT(DISTINCT us.skill) DESC, u.last_login_at DESC
    LIMIT 1;
    
    IF selected_technician IS NOT NULL THEN
        -- Update work order
        UPDATE home_services.work_orders
        SET 
            technician_id = selected_technician,
            status = 'assigned',
            updated_at = NOW()
        WHERE id = work_order_id;
        
        -- Log assignment
        INSERT INTO audit.work_order_events (
            work_order_id,
            event_type,
            user_id,
            details
        ) VALUES (
            work_order_id,
            'auto_assigned',
            auth.uid(),
            jsonb_build_object('technician_id', selected_technician)
        );
    END IF;
    
    RETURN selected_technician;
END;
$$;
```

### Financial Calculation Functions
```sql
-- Calculate order total with taxes and discounts
CREATE OR REPLACE FUNCTION calculate_order_total(
    order_items JSONB,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    tax_rate DECIMAL(5,4) DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    subtotal DECIMAL(10,2) := 0.00;
    tax_amount DECIMAL(10,2) := 0.00;
    total_amount DECIMAL(10,2);
    item JSONB;
    effective_tax_rate DECIMAL(5,4);
BEGIN
    -- Calculate subtotal from items
    FOR item IN SELECT jsonb_array_elements(order_items)
    LOOP
        subtotal := subtotal + (
            (item ->> 'quantity')::DECIMAL * 
            (item ->> 'unit_price')::DECIMAL
        );
    END LOOP;
    
    -- Apply discount
    subtotal := GREATEST(subtotal - discount_amount, 0.00);
    
    -- Get tax rate (use provided or tenant default)
    IF tax_rate IS NULL THEN
        SELECT COALESCE(
            (get_tenant_config('tax_settings') ->> 'default_tax_rate')::DECIMAL(5,4),
            0.00
        ) INTO effective_tax_rate;
    ELSE
        effective_tax_rate := tax_rate;
    END IF;
    
    -- Calculate tax
    tax_amount := subtotal * effective_tax_rate;
    total_amount := subtotal + tax_amount;
    
    RETURN jsonb_build_object(
        'subtotal', subtotal,
        'discount_amount', discount_amount,
        'tax_rate', effective_tax_rate,
        'tax_amount', tax_amount,
        'total_amount', total_amount
    );
END;
$$;

-- Apply loyalty discount
CREATE OR REPLACE FUNCTION calculate_loyalty_discount(
    customer_id UUID,
    order_amount DECIMAL(10,2)
)
RETURNS DECIMAL(10,2)
LANGUAGE plpgsql
AS $$
DECLARE
    customer_tier TEXT;
    discount_rate DECIMAL(5,4) := 0.00;
    max_discount DECIMAL(10,2) := 0.00;
    calculated_discount DECIMAL(10,2);
BEGIN
    -- Get customer loyalty tier
    SELECT 
        CASE 
            WHEN total_spent >= 10000 THEN 'platinum'
            WHEN total_spent >= 5000 THEN 'gold'
            WHEN total_spent >= 1000 THEN 'silver'
            ELSE 'bronze'
        END INTO customer_tier
    FROM (
        SELECT COALESCE(SUM(total_amount), 0) as total_spent
        FROM restaurants.orders o
        WHERE o.customer_id = calculate_loyalty_discount.customer_id
        AND o.tenant_id = get_current_tenant_id()
        AND o.payment_status = 'paid'
        AND o.created_at >= NOW() - INTERVAL '1 year'
    ) customer_stats;
    
    -- Get discount rate based on tier
    SELECT 
        CASE customer_tier
            WHEN 'platinum' THEN 0.15  -- 15%
            WHEN 'gold' THEN 0.10      -- 10%
            WHEN 'silver' THEN 0.05    -- 5%
            ELSE 0.00                  -- No discount
        END INTO discount_rate;
    
    -- Calculate discount with maximum limits
    calculated_discount := order_amount * discount_rate;
    max_discount := CASE customer_tier
        WHEN 'platinum' THEN 100.00
        WHEN 'gold' THEN 50.00
        WHEN 'silver' THEN 25.00
        ELSE 0.00
    END;
    
    RETURN LEAST(calculated_discount, max_discount);
END;
$$;
```

## Utility Functions

### Date and Time Utilities
```sql
-- Convert business hours to UTC
CREATE OR REPLACE FUNCTION convert_business_hours_to_utc(
    local_time TIME,
    business_timezone TEXT DEFAULT 'America/New_York'
)
RETURNS TIMESTAMPTZ
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    RETURN (CURRENT_DATE + local_time) AT TIME ZONE business_timezone;
END;
$$;

-- Check if current time is within business hours
CREATE OR REPLACE FUNCTION is_business_hours(
    tenant_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    current_tenant UUID := COALESCE(tenant_id, get_current_tenant_id());
    business_hours JSONB;
    current_day TEXT := TO_CHAR(NOW(), 'Day');
    current_time TIME := NOW()::TIME;
    day_hours JSONB;
BEGIN
    -- Get tenant business hours
    SELECT get_tenant_config('business_hours') INTO business_hours;
    
    IF business_hours IS NULL THEN
        -- Default business hours: 9 AM - 5 PM, Monday - Friday
        RETURN EXTRACT(DOW FROM NOW()) BETWEEN 1 AND 5 
               AND current_time BETWEEN '09:00:00'::TIME AND '17:00:00'::TIME;
    END IF;
    
    -- Get hours for current day
    day_hours := business_hours -> LOWER(TRIM(current_day));
    
    IF day_hours IS NULL OR (day_hours ->> 'closed')::BOOLEAN = TRUE THEN
        RETURN FALSE;
    END IF;
    
    RETURN current_time BETWEEN 
           (day_hours ->> 'open')::TIME AND 
           (day_hours ->> 'close')::TIME;
END;
$$;

-- Get next business day
CREATE OR REPLACE FUNCTION get_next_business_day(
    from_date DATE DEFAULT CURRENT_DATE,
    tenant_id UUID DEFAULT NULL
)
RETURNS DATE
LANGUAGE plpgsql
AS $$
DECLARE
    next_date DATE := from_date + 1;
    business_hours JSONB;
    max_iterations INTEGER := 14; -- Prevent infinite loop
    iterations INTEGER := 0;
BEGIN
    business_hours := get_tenant_config('business_hours');
    
    WHILE iterations < max_iterations LOOP
        -- Check if this day has business hours
        IF business_hours IS NULL THEN
            -- Default: Monday-Friday
            IF EXTRACT(DOW FROM next_date) BETWEEN 1 AND 5 THEN
                RETURN next_date;
            END IF;
        ELSE
            -- Check tenant-specific business hours
            DECLARE
                day_name TEXT := LOWER(TO_CHAR(next_date, 'Day'));
                day_config JSONB := business_hours -> TRIM(day_name);
            BEGIN
                IF day_config IS NOT NULL AND 
                   COALESCE((day_config ->> 'closed')::BOOLEAN, FALSE) = FALSE THEN
                    RETURN next_date;
                END IF;
            END;
        END IF;
        
        next_date := next_date + 1;
        iterations := iterations + 1;
    END LOOP;
    
    -- Fallback: return the date even if no business day found
    RETURN next_date;
END;
$$;
```

### Data Validation Utilities
```sql
-- Validate email address format
CREATE OR REPLACE FUNCTION validate_email(
    email_address TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    IF email_address IS NULL OR LENGTH(email_address) = 0 THEN
        RETURN FALSE;
    END IF;
    
    -- Basic email validation using regex
    RETURN email_address ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
           AND LENGTH(email_address) <= 255
           AND email_address !~ '\s'; -- No whitespace
END;
$$;

-- Validate phone number format
CREATE OR REPLACE FUNCTION validate_phone(
    phone_number TEXT,
    country_code TEXT DEFAULT 'US'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    IF phone_number IS NULL OR LENGTH(phone_number) = 0 THEN
        RETURN FALSE;
    END IF;
    
    -- Remove common formatting characters
    phone_number := REGEXP_REPLACE(phone_number, '[^\d+]', '', 'g');
    
    -- Validate based on country
    CASE country_code
        WHEN 'US' THEN
            RETURN phone_number ~ '^(\+?1)?[2-9]\d{2}[2-9]\d{2}\d{4}$';
        WHEN 'CA' THEN
            RETURN phone_number ~ '^(\+?1)?[2-9]\d{2}[2-9]\d{2}\d{4}$';
        ELSE
            -- International format: + followed by 7-15 digits
            RETURN phone_number ~ '^\+[1-9]\d{6,14}$';
    END CASE;
END;
$$;

-- Sanitize user input
CREATE OR REPLACE FUNCTION sanitize_input(
    input_text TEXT,
    max_length INTEGER DEFAULT 1000,
    allow_html BOOLEAN DEFAULT FALSE
)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    cleaned_text TEXT;
BEGIN
    IF input_text IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Trim whitespace
    cleaned_text := TRIM(input_text);
    
    -- Remove or escape HTML if not allowed
    IF NOT allow_html THEN
        cleaned_text := REGEXP_REPLACE(cleaned_text, '<[^>]*>', '', 'g');
    END IF;
    
    -- Remove potentially dangerous characters
    cleaned_text := REGEXP_REPLACE(cleaned_text, '[<>''";]', '', 'g');
    
    -- Limit length
    IF LENGTH(cleaned_text) > max_length THEN
        cleaned_text := LEFT(cleaned_text, max_length);
    END IF;
    
    RETURN cleaned_text;
END;
$$;
```

## Security Functions

### Authentication and Authorization
```sql
-- Check if user has specific permission
CREATE OR REPLACE FUNCTION has_permission(
    user_id UUID,
    resource TEXT,
    action TEXT,
    context JSONB DEFAULT '{}'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    has_access BOOLEAN := FALSE;
    user_roles UUID[];
    role_id UUID;
BEGIN
    -- Get user roles
    SELECT ARRAY_AGG(ur.role_id) INTO user_roles
    FROM rbac.user_roles ur
    WHERE ur.user_id = has_permission.user_id
    AND ur.tenant_id = get_current_tenant_id()
    AND (ur.expires_at IS NULL OR ur.expires_at > NOW());
    
    -- Check each role for permission
    FOREACH role_id IN ARRAY user_roles
    LOOP
        SELECT TRUE INTO has_access
        FROM rbac.permissions p
        JOIN rbac.role_permissions rp ON rp.permission_id = p.id
        WHERE rp.role_id = role_id
        AND p.resource = has_permission.resource
        AND p.action = has_permission.action
        AND rp.granted = TRUE
        AND rbac.check_permission_conditions(p.conditions, context)
        LIMIT 1;
        
        -- Exit early if permission found
        IF has_access THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN COALESCE(has_access, FALSE);
END;
$$;

-- Check permission conditions (time, location, etc.)
CREATE OR REPLACE FUNCTION check_permission_conditions(
    conditions JSONB,
    context JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    condition_key TEXT;
    condition_value JSONB;
BEGIN
    -- If no conditions, allow access
    IF conditions IS NULL OR conditions = '{}' THEN
        RETURN TRUE;
    END IF;
    
    -- Check each condition
    FOR condition_key IN SELECT jsonb_object_keys(conditions)
    LOOP
        condition_value := conditions -> condition_key;
        
        CASE condition_key
            WHEN 'time_range' THEN
                IF NOT check_time_condition(condition_value) THEN
                    RETURN FALSE;
                END IF;
                
            WHEN 'ip_range' THEN
                IF NOT check_ip_condition(condition_value, context -> 'ip_address') THEN
                    RETURN FALSE;
                END IF;
                
            WHEN 'location' THEN
                IF NOT check_location_condition(condition_value, context -> 'location') THEN
                    RETURN FALSE;
                END IF;
                
            WHEN 'max_amount' THEN
                IF (context ->> 'amount')::DECIMAL > (condition_value ->> 'value')::DECIMAL THEN
                    RETURN FALSE;
                END IF;
                
            ELSE
                -- Unknown condition type, be conservative
                RETURN FALSE;
        END CASE;
    END LOOP;
    
    RETURN TRUE;
END;
$$;

-- Generate secure random token
CREATE OR REPLACE FUNCTION generate_secure_token(
    length INTEGER DEFAULT 32
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
    -- Generate cryptographically secure random token
    RETURN encode(
        gen_random_bytes(length),
        'base64'
    );
END;
$$;
```

## Analytics Functions

### Business Intelligence Functions
```sql
-- Calculate customer lifetime value
CREATE OR REPLACE FUNCTION calculate_customer_ltv(
    customer_id UUID,
    period_months INTEGER DEFAULT 12
)
RETURNS DECIMAL(10,2)
LANGUAGE plpgsql
AS $$
DECLARE
    total_revenue DECIMAL(10,2);
    order_count INTEGER;
    avg_order_value DECIMAL(10,2);
    frequency_per_month DECIMAL(8,4);
    ltv DECIMAL(10,2);
BEGIN
    -- Get customer statistics for the period
    SELECT 
        COALESCE(SUM(total_amount), 0),
        COUNT(*),
        COALESCE(AVG(total_amount), 0)
    INTO total_revenue, order_count, avg_order_value
    FROM restaurants.orders o
    WHERE o.customer_id = calculate_customer_ltv.customer_id
    AND o.tenant_id = get_current_tenant_id()
    AND o.payment_status = 'paid'
    AND o.created_at >= NOW() - (period_months || ' months')::INTERVAL;
    
    -- Calculate purchase frequency per month
    frequency_per_month := order_count::DECIMAL / period_months;
    
    -- Estimate LTV (simple model: avg_order_value * frequency * 24 months)
    ltv := avg_order_value * frequency_per_month * 24;
    
    RETURN GREATEST(ltv, 0.00);
END;
$$;

-- Generate revenue analytics
CREATE OR REPLACE FUNCTION get_revenue_analytics(
    start_date DATE,
    end_date DATE,
    grouping_period TEXT DEFAULT 'day' -- day, week, month
)
RETURNS TABLE(
    period_start DATE,
    revenue DECIMAL(10,2),
    order_count BIGINT,
    avg_order_value DECIMAL(10,2),
    unique_customers BIGINT
)
LANGUAGE plpgsql
AS $$
DECLARE
    date_trunc_format TEXT;
BEGIN
    -- Validate grouping period
    IF grouping_period NOT IN ('day', 'week', 'month') THEN
        RAISE EXCEPTION 'Invalid grouping period. Must be day, week, or month.';
    END IF;
    
    date_trunc_format := grouping_period;
    
    RETURN QUERY
    SELECT 
        DATE_TRUNC(date_trunc_format, o.created_at)::DATE as period_start,
        SUM(o.total_amount) as revenue,
        COUNT(*) as order_count,
        AVG(o.total_amount) as avg_order_value,
        COUNT(DISTINCT o.customer_id) as unique_customers
    FROM restaurants.orders o
    WHERE o.tenant_id = get_current_tenant_id()
    AND o.payment_status = 'paid'
    AND o.created_at::DATE BETWEEN start_date AND end_date
    GROUP BY DATE_TRUNC(date_trunc_format, o.created_at)::DATE
    ORDER BY period_start;
END;
$$;

-- Get top performing items/services
CREATE OR REPLACE FUNCTION get_top_performing_items(
    start_date DATE,
    end_date DATE,
    item_limit INTEGER DEFAULT 10
)
RETURNS TABLE(
    item_name TEXT,
    total_quantity BIGINT,
    total_revenue DECIMAL(10,2),
    avg_price DECIMAL(10,2),
    order_frequency DECIMAL(8,4)
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH order_items AS (
        SELECT 
            item ->> 'name' as name,
            (item ->> 'quantity')::INTEGER as quantity,
            (item ->> 'unit_price')::DECIMAL * (item ->> 'quantity')::INTEGER as revenue,
            (item ->> 'unit_price')::DECIMAL as price
        FROM restaurants.orders o,
             jsonb_array_elements(o.items) as item
        WHERE o.tenant_id = get_current_tenant_id()
        AND o.payment_status = 'paid'
        AND o.created_at::DATE BETWEEN start_date AND end_date
    ),
    item_stats AS (
        SELECT 
            name,
            SUM(quantity) as total_qty,
            SUM(revenue) as total_rev,
            AVG(price) as avg_price,
            COUNT(DISTINCT name) as appearances
        FROM order_items
        GROUP BY name
    ),
    total_orders AS (
        SELECT COUNT(*) as order_count
        FROM restaurants.orders o
        WHERE o.tenant_id = get_current_tenant_id()
        AND o.payment_status = 'paid'
        AND o.created_at::DATE BETWEEN start_date AND end_date
    )
    SELECT 
        s.name,
        s.total_qty,
        s.total_rev,
        s.avg_price,
        s.appearances::DECIMAL / t.order_count::DECIMAL as frequency
    FROM item_stats s, total_orders t
    ORDER BY s.total_rev DESC
    LIMIT item_limit;
END;
$$;
```

## Trigger Functions

### Audit and Change Tracking
```sql
-- Generic audit trigger function
CREATE OR REPLACE FUNCTION audit_table_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    old_data JSONB;
    new_data JSONB;
    audit_record JSONB;
BEGIN
    -- Prepare data based on operation
    CASE TG_OP
        WHEN 'DELETE' THEN
            old_data := to_jsonb(OLD);
            new_data := NULL;
        WHEN 'INSERT' THEN
            old_data := NULL;
            new_data := to_jsonb(NEW);
        WHEN 'UPDATE' THEN
            old_data := to_jsonb(OLD);
            new_data := to_jsonb(NEW);
    END CASE;
    
    -- Build audit record
    audit_record := jsonb_build_object(
        'table_name', TG_TABLE_NAME,
        'schema_name', TG_TABLE_SCHEMA,
        'operation', TG_OP,
        'old_data', old_data,
        'new_data', new_data,
        'changed_fields', (
            CASE WHEN TG_OP = 'UPDATE' 
            THEN audit.get_changed_fields(old_data, new_data)
            ELSE NULL END
        )
    );
    
    -- Insert audit record
    INSERT INTO audit.table_changes (
        table_name,
        table_schema,
        operation,
        record_id,
        tenant_id,
        user_id,
        old_data,
        new_data,
        changed_fields,
        changed_at
    ) VALUES (
        TG_TABLE_NAME,
        TG_TABLE_SCHEMA,
        TG_OP,
        COALESCE((new_data ->> 'id')::UUID, (old_data ->> 'id')::UUID),
        COALESCE((new_data ->> 'tenant_id')::UUID, (old_data ->> 'tenant_id')::UUID),
        auth.uid(),
        old_data,
        new_data,
        audit.get_changed_fields(old_data, new_data),
        NOW()
    );
    
    RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$;

-- Set updated_at timestamp
CREATE OR REPLACE FUNCTION set_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Validate business rules on update
CREATE OR REPLACE FUNCTION validate_work_order_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Prevent status regression
    IF OLD.status = 'completed' AND NEW.status != 'completed' THEN
        RAISE EXCEPTION 'Cannot change status of completed work order';
    END IF;
    
    -- Require technician assignment for scheduled status
    IF NEW.status = 'scheduled' AND NEW.technician_id IS NULL THEN
        RAISE EXCEPTION 'Cannot schedule work order without assigned technician';
    END IF;
    
    -- Validate completion requirements
    IF NEW.status = 'completed' THEN
        IF NEW.completed_at IS NULL THEN
            NEW.completed_at = NOW();
        END IF;
        
        IF NEW.actual_duration IS NULL AND NEW.scheduled_at IS NOT NULL THEN
            NEW.actual_duration = NEW.completed_at - NEW.scheduled_at;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;
```

## Best Practices

### Function Development
- **Single Responsibility**: Each function should have one clear purpose
- **Error Handling**: Use proper exception handling with meaningful messages
- **Security**: Use SECURITY DEFINER carefully and validate all inputs
- **Documentation**: Include comprehensive comments and examples
- **Testing**: Write test cases for all business logic functions

### Performance Optimization
- **Query Planning**: Use EXPLAIN to optimize function queries
- **Indexing**: Ensure supporting indexes exist for function queries
- **Caching**: Cache expensive calculations where appropriate
- **Batch Processing**: Process large datasets in batches
- **Connection Limits**: Be mindful of connection usage in functions

### Security Considerations
- **Input Validation**: Validate and sanitize all function parameters
- **SQL Injection**: Use parameterized queries and proper escaping
- **Access Control**: Implement proper authorization checks
- **Audit Logging**: Log sensitive function executions
- **Least Privilege**: Grant minimal necessary permissions

## Troubleshooting

### Common Function Issues
- **Permission Errors**: Insufficient privileges or SECURITY DEFINER issues
- **Performance Problems**: Inefficient queries or missing indexes
- **Data Type Errors**: Type mismatches or conversion issues
- **Exception Handling**: Unhandled exceptions or poor error messages
- **Concurrency Issues**: Lock conflicts or race conditions

### Debugging Functions
```sql
-- Debug function execution
-- Enable function logging
SET log_statement = 'all';
SET log_min_duration_statement = 0;

-- Test function with explain
EXPLAIN (ANALYZE, BUFFERS) 
SELECT calculate_customer_ltv('550e8400-e29b-41d4-a716-446655440000'::UUID);

-- Check function performance
SELECT 
    schemaname,
    funcname,
    calls,
    total_time,
    total_time / calls as avg_time_ms
FROM pg_stat_user_functions 
WHERE funcname LIKE '%calculate%'
ORDER BY total_time DESC;

-- View function source
SELECT 
    p.proname,
    p.prosrc
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
AND p.proname = 'calculate_customer_ltv';
```

---

*This functions guide ensures consistent, reliable, and performant business logic implementation across the Thorbis Business OS platform.*