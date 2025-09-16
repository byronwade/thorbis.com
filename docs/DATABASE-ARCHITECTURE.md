# Thorbis Business OS - Complete Database Architecture

## Overview

This document outlines the comprehensive database architecture for Thorbis Business OS - a multi-industry platform supporting Home Services, Restaurants, Auto Services, Retail, Courses, Payroll, Books (Accounting), and Trust verification systems.

## Core Architecture Principles

### 1. Multi-Tenant by Design
- **Tenant Isolation**: Every table includes tenant-scoped RLS policies
- **Industry Separation**: Logical separation while sharing infrastructure
- **Scalable**: Designed to handle thousands of businesses per industry

### 2. Industry-Agnostic Foundation
- **Shared Core**: Common tables for users, tenants, billing, audit logs
- **Industry-Specific Extensions**: Specialized schemas for each vertical
- **Flexible Schema**: JSONB fields for custom data without schema changes

### 3. Performance & Security First
- **Row Level Security (RLS)**: On every single table
- **Optimized Indexing**: Strategic indexes for query performance
- **Audit Everything**: Complete audit trail for compliance
- **Soft Deletes**: Trash/restore pattern for all destructive operations

---

## I. CORE FOUNDATION TABLES

### 1.1 Tenant Management

```sql
-- Organizations (Top-level tenants)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    industry TEXT NOT NULL CHECK (industry IN ('hs', 'rest', 'auto', 'ret', 'general')),
    tier TEXT NOT NULL DEFAULT 'starter' CHECK (tier IN ('starter', 'professional', 'enterprise')),
    settings JSONB DEFAULT '{}',
    billing_settings JSONB DEFAULT '{}',
    
    -- Status and lifecycle
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled')),
    trial_ends_at TIMESTAMPTZ,
    
    -- Contact and location
    primary_contact_email TEXT,
    primary_contact_phone TEXT,
    timezone TEXT DEFAULT 'UTC',
    address JSONB,
    
    -- Metadata
    custom_fields JSONB DEFAULT '{}',
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- Organization features (feature flags per tenant)
CREATE TABLE organization_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    feature_key TEXT NOT NULL,
    enabled BOOLEAN DEFAULT FALSE,
    settings JSONB DEFAULT '{}',
    enabled_at TIMESTAMPTZ,
    enabled_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(organization_id, feature_key)
);
```

### 1.2 User Management & Authentication

```sql
-- User profiles (extends Supabase auth.users)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Basic info
    first_name TEXT,
    last_name TEXT,
    display_name TEXT GENERATED ALWAYS AS (COALESCE(first_name || ' ' || last_name, email)) STORED,
    email TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    
    -- Role and permissions
    role TEXT NOT NULL DEFAULT 'user',
    permissions JSONB DEFAULT '{}',
    
    -- Status and access
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    last_seen_at TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    
    -- Preferences
    timezone TEXT DEFAULT 'UTC',
    language TEXT DEFAULT 'en',
    theme TEXT DEFAULT 'system',
    notification_preferences JSONB DEFAULT '{}',
    
    -- Profile completion
    onboarding_completed BOOLEAN DEFAULT FALSE,
    profile_completion_score INTEGER DEFAULT 0 CHECK (profile_completion_score >= 0 AND profile_completion_score <= 100),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(organization_id, email)
);

-- User roles and permissions
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '{}',
    is_system_role BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(organization_id, name)
);

-- User role assignments
CREATE TABLE user_role_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES user_profiles(id),
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    
    UNIQUE(user_id, role_id)
);
```

### 1.3 Billing & Subscription Management

```sql
-- Subscription plans
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    industry TEXT CHECK (industry IN ('hs', 'rest', 'auto', 'ret', 'general')),
    
    -- Pricing
    price_monthly INTEGER NOT NULL, -- in cents
    price_yearly INTEGER NOT NULL,  -- in cents
    trial_days INTEGER DEFAULT 14,
    
    -- Limits and features
    limits JSONB DEFAULT '{}',
    features JSONB DEFAULT '{}',
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    
    -- Metadata
    stripe_product_id TEXT,
    stripe_price_id_monthly TEXT,
    stripe_price_id_yearly TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization subscriptions
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES subscription_plans(id),
    
    -- Subscription details
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('trialing', 'active', 'past_due', 'canceled', 'unpaid')),
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    trial_start TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    canceled_at TIMESTAMPTZ,
    
    -- Billing
    stripe_subscription_id TEXT UNIQUE,
    stripe_customer_id TEXT,
    
    -- Usage tracking
    usage_limits JSONB DEFAULT '{}',
    current_usage JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage meters (for usage-based billing)
CREATE TABLE usage_meters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    meter_type TEXT NOT NULL, -- 'api_calls', 'ai_operations', 'storage_gb', etc.
    value INTEGER NOT NULL DEFAULT 0,
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(organization_id, meter_type, period_start)
);
```

---

## II. SHARED BUSINESS ENTITIES

### 2.1 Customer Management (Cross-Industry)

```sql
-- Customers (shared across all industries)
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Basic information
    customer_number TEXT NOT NULL, -- Auto-generated: CUST-000001
    type TEXT DEFAULT 'individual' CHECK (type IN ('individual', 'business')),
    
    -- Individual fields
    first_name TEXT,
    last_name TEXT,
    full_name TEXT GENERATED ALWAYS AS (TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, ''))) STORED,
    
    -- Business fields
    business_name TEXT,
    
    -- Contact information
    email TEXT,
    phone TEXT,
    mobile TEXT,
    website TEXT,
    
    -- Address
    primary_address JSONB,
    billing_address JSONB,
    shipping_address JSONB,
    
    -- Status and classification
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'prospect', 'suspended')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'vip')),
    
    -- Financial information
    credit_limit DECIMAL(12,2) DEFAULT 0,
    payment_terms INTEGER DEFAULT 30, -- days
    tax_exempt BOOLEAN DEFAULT FALSE,
    tax_id TEXT,
    
    -- Marketing and communication
    marketing_opt_in BOOLEAN DEFAULT FALSE,
    preferred_contact_method TEXT DEFAULT 'email' CHECK (preferred_contact_method IN ('email', 'phone', 'sms', 'mail')),
    communication_preferences JSONB DEFAULT '{}',
    
    -- Relationship management
    source TEXT, -- How they found us
    assigned_to UUID REFERENCES user_profiles(id),
    
    -- Industry-specific data
    industry_data JSONB DEFAULT '{}',
    
    -- Metadata
    tags TEXT[] DEFAULT '{}',
    custom_fields JSONB DEFAULT '{}',
    notes TEXT,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id),
    updated_by UUID REFERENCES user_profiles(id),
    
    -- Soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES user_profiles(id),
    
    -- Indexes will be created separately
    UNIQUE(organization_id, customer_number)
);

-- Customer contacts (multiple contacts per customer)
CREATE TABLE customer_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    title TEXT,
    department TEXT,
    email TEXT,
    phone TEXT,
    mobile TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    is_billing_contact BOOLEAN DEFAULT FALSE,
    is_decision_maker BOOLEAN DEFAULT FALSE,
    
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customer notes and interactions
CREATE TABLE customer_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    
    type TEXT NOT NULL CHECK (type IN ('note', 'call', 'email', 'meeting', 'task', 'complaint', 'compliment')),
    subject TEXT,
    content TEXT NOT NULL,
    direction TEXT CHECK (direction IN ('inbound', 'outbound')),
    
    -- Interaction details
    occurred_at TIMESTAMPTZ DEFAULT NOW(),
    duration_minutes INTEGER,
    
    -- Association
    associated_record_type TEXT,
    associated_record_id UUID,
    
    -- Follow-up
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date TIMESTAMPTZ,
    follow_up_assigned_to UUID REFERENCES user_profiles(id),
    
    -- Metadata
    attachments JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES user_profiles(id)
);
```

### 2.2 Financial Management (Invoicing, Payments)

```sql
-- Invoices (cross-industry)
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Basic information
    invoice_number TEXT NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id),
    
    -- Industry context
    industry TEXT NOT NULL CHECK (industry IN ('hs', 'rest', 'auto', 'ret')),
    source_type TEXT, -- 'work_order', 'order', 'manual', etc.
    source_id UUID,   -- ID of the source record
    
    -- Dates
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    sent_at TIMESTAMPTZ,
    
    -- Status
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'paid', 'partial', 'overdue', 'cancelled', 'void')),
    
    -- Financial details
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    amount_paid DECIMAL(12,2) DEFAULT 0,
    balance_due DECIMAL(12,2) GENERATED ALWAYS AS (total_amount - amount_paid) STORED,
    
    -- Terms and notes
    payment_terms INTEGER DEFAULT 30,
    terms_and_conditions TEXT,
    notes TEXT,
    internal_notes TEXT,
    
    -- Reference information
    po_number TEXT, -- Purchase order from customer
    project_name TEXT,
    
    -- Metadata
    custom_fields JSONB DEFAULT '{}',
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES user_profiles(id),
    updated_by UUID REFERENCES user_profiles(id),
    
    -- Soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES user_profiles(id),
    
    UNIQUE(organization_id, invoice_number)
);

-- Invoice line items
CREATE TABLE invoice_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    
    -- Line item details
    sort_order INTEGER NOT NULL DEFAULT 0,
    description TEXT NOT NULL,
    quantity DECIMAL(10,3) NOT NULL DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    line_total DECIMAL(12,2) NOT NULL,
    
    -- Tax information
    taxable BOOLEAN DEFAULT TRUE,
    tax_rate DECIMAL(5,4) DEFAULT 0,
    
    -- Product/service reference
    product_id UUID, -- Reference to products table if applicable
    service_type TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Basic information
    payment_number TEXT NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id),
    
    -- Payment details
    amount DECIMAL(12,2) NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'check', 'credit_card', 'debit_card', 'bank_transfer', 'online', 'other')),
    
    -- Reference information
    reference_number TEXT,
    check_number TEXT,
    confirmation_number TEXT,
    
    -- Processing information
    processor TEXT, -- 'stripe', 'square', 'manual', etc.
    processor_transaction_id TEXT,
    processor_fee DECIMAL(12,2) DEFAULT 0,
    net_amount DECIMAL(12,2) GENERATED ALWAYS AS (amount - processor_fee) STORED,
    
    -- Status
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')),
    
    -- Notes
    notes TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    processed_by UUID NOT NULL REFERENCES user_profiles(id),
    
    UNIQUE(organization_id, payment_number)
);

-- Payment allocations (which invoices this payment applies to)
CREATE TABLE payment_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    
    amount DECIMAL(12,2) NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES user_profiles(id)
);
```

---

## III. INDUSTRY-SPECIFIC SCHEMAS

### 3.1 Home Services (HS) Schema

```sql
-- Work orders for home services
CREATE TABLE hs_work_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Basic information
    work_order_number TEXT NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id),
    property_id UUID REFERENCES hs_properties(id),
    
    -- Service details
    title TEXT NOT NULL,
    description TEXT,
    service_type TEXT NOT NULL CHECK (service_type IN ('plumbing', 'electrical', 'hvac', 'roofing', 'flooring', 'painting', 'landscaping', 'cleaning', 'pest_control', 'appliance_repair')),
    job_type TEXT DEFAULT 'service_call' CHECK (job_type IN ('service_call', 'installation', 'repair', 'maintenance', 'inspection', 'estimate')),
    
    -- Assignment and scheduling
    assigned_technician_id UUID REFERENCES user_profiles(id),
    scheduled_start TIMESTAMPTZ,
    scheduled_end TIMESTAMPTZ,
    actual_start TIMESTAMPTZ,
    actual_end TIMESTAMPTZ,
    
    -- Status and priority
    status TEXT DEFAULT 'created' CHECK (status IN ('created', 'scheduled', 'assigned', 'in_progress', 'completed', 'cancelled', 'on_hold')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent', 'emergency')),
    
    -- Financial estimates
    estimated_duration_hours DECIMAL(5,2),
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    
    -- Location and access
    service_address JSONB,
    access_instructions TEXT,
    access_codes TEXT,
    key_location TEXT,
    
    -- Documentation
    photos TEXT[] DEFAULT '{}',
    completion_photos TEXT[] DEFAULT '{}',
    customer_signature_url TEXT,
    
    -- Customer interaction
    customer_present BOOLEAN,
    customer_satisfaction INTEGER CHECK (customer_satisfaction >= 1 AND customer_satisfaction <= 5),
    customer_feedback TEXT,
    
    -- Follow-up
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    follow_up_notes TEXT,
    
    -- Warranty
    warranty_period_days INTEGER DEFAULT 0,
    warranty_terms TEXT,
    
    -- Notes and instructions
    special_instructions TEXT,
    safety_notes TEXT,
    completion_notes TEXT,
    internal_notes TEXT,
    
    -- Metadata
    tags TEXT[] DEFAULT '{}',
    custom_fields JSONB DEFAULT '{}',
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES user_profiles(id),
    updated_by UUID REFERENCES user_profiles(id),
    
    -- Soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES user_profiles(id),
    
    UNIQUE(organization_id, work_order_number)
);

-- Customer properties for home services
CREATE TABLE hs_properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    
    -- Basic information
    property_name TEXT,
    property_type TEXT DEFAULT 'residential' CHECK (property_type IN ('residential', 'commercial', 'industrial', 'multi_unit')),
    
    -- Address
    address JSONB NOT NULL,
    
    -- Property details
    square_footage INTEGER,
    year_built INTEGER,
    bedrooms INTEGER,
    bathrooms DECIMAL(3,1),
    stories INTEGER,
    lot_size DECIMAL(10,2),
    
    -- Systems information
    hvac_details JSONB DEFAULT '{}',
    plumbing_details JSONB DEFAULT '{}',
    electrical_details JSONB DEFAULT '{}',
    other_systems JSONB DEFAULT '{}',
    
    -- Access information
    access_instructions TEXT,
    gate_codes TEXT,
    alarm_codes TEXT,
    key_location TEXT,
    pet_information TEXT,
    special_considerations TEXT,
    
    -- Emergency contacts
    emergency_contacts JSONB DEFAULT '[]',
    
    -- Status
    is_primary BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    notes TEXT,
    custom_fields JSONB DEFAULT '{}',
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id),
    
    -- Soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES user_profiles(id)
);

-- Equipment tracking for home services
CREATE TABLE hs_equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    property_id UUID REFERENCES hs_properties(id),
    
    -- Equipment details
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    brand TEXT,
    model TEXT,
    serial_number TEXT,
    year_installed INTEGER,
    
    -- Location
    location_description TEXT, -- "Basement", "Attic", "Kitchen", etc.
    room TEXT,
    
    -- Specifications
    specifications JSONB DEFAULT '{}',
    
    -- Maintenance
    warranty_expires_at DATE,
    last_service_date DATE,
    next_service_due DATE,
    maintenance_notes TEXT,
    
    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'needs_service', 'out_of_service', 'replaced')),
    
    -- Metadata
    notes TEXT,
    photos TEXT[] DEFAULT '{}',
    manuals JSONB DEFAULT '[]',
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id),
    
    -- Soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES user_profiles(id)
);

-- Estimates for home services
CREATE TABLE hs_estimates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Basic information
    estimate_number TEXT NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id),
    property_id UUID REFERENCES hs_properties(id),
    work_order_id UUID REFERENCES hs_work_orders(id),
    
    -- Service details
    title TEXT NOT NULL,
    description TEXT,
    service_type TEXT NOT NULL,
    
    -- Status and dates
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'approved', 'declined', 'expired', 'converted')),
    valid_until DATE,
    sent_at TIMESTAMPTZ,
    viewed_at TIMESTAMPTZ,
    responded_at TIMESTAMPTZ,
    
    -- Financial details
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    
    -- Terms
    terms_and_conditions TEXT,
    notes TEXT,
    internal_notes TEXT,
    
    -- Options and add-ons
    options JSONB DEFAULT '[]',
    
    -- Scheduling
    estimated_start_date DATE,
    estimated_duration_hours DECIMAL(5,2),
    
    -- Metadata
    tags TEXT[] DEFAULT '{}',
    custom_fields JSONB DEFAULT '{}',
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES user_profiles(id),
    updated_by UUID REFERENCES user_profiles(id),
    
    -- Soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES user_profiles(id),
    
    UNIQUE(organization_id, estimate_number)
);

-- Estimate line items
CREATE TABLE hs_estimate_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    estimate_id UUID NOT NULL REFERENCES hs_estimates(id) ON DELETE CASCADE,
    
    sort_order INTEGER NOT NULL DEFAULT 0,
    item_type TEXT DEFAULT 'service' CHECK (item_type IN ('labor', 'material', 'equipment', 'permit', 'other')),
    description TEXT NOT NULL,
    quantity DECIMAL(10,3) NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    line_total DECIMAL(10,2) NOT NULL,
    
    -- Additional details
    unit_of_measure TEXT,
    cost DECIMAL(10,2), -- cost to company
    markup_percentage DECIMAL(5,2),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.2 Restaurant (REST) Schema

```sql
-- Menu categories
CREATE TABLE rest_menu_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Display settings
    display_settings JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(organization_id, name)
);

-- Menu items
CREATE TABLE rest_menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    category_id UUID REFERENCES rest_menu_categories(id),
    
    -- Basic information
    name TEXT NOT NULL,
    description TEXT,
    short_description TEXT,
    
    -- Pricing
    base_price DECIMAL(8,2) NOT NULL,
    cost DECIMAL(8,2), -- Cost to make
    
    -- Status and availability
    is_active BOOLEAN DEFAULT TRUE,
    is_available BOOLEAN DEFAULT TRUE,
    available_from TIME,
    available_to TIME,
    available_days INTEGER[] DEFAULT '{1,2,3,4,5,6,7}', -- 1=Monday, 7=Sunday
    
    -- Details
    preparation_time_minutes INTEGER,
    calories INTEGER,
    allergens TEXT[] DEFAULT '{}',
    dietary_restrictions TEXT[] DEFAULT '{}', -- vegan, gluten-free, etc.
    
    -- Inventory tracking
    track_inventory BOOLEAN DEFAULT FALSE,
    current_stock INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 0,
    
    -- Images and media
    images TEXT[] DEFAULT '{}',
    
    -- Modifiers and variations
    has_modifiers BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    tags TEXT[] DEFAULT '{}',
    custom_fields JSONB DEFAULT '{}',
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id),
    
    -- Soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES user_profiles(id)
);

-- Menu item modifiers (add-ons, size options, etc.)
CREATE TABLE rest_menu_modifiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    name TEXT NOT NULL,
    type TEXT DEFAULT 'single' CHECK (type IN ('single', 'multiple')),
    required BOOLEAN DEFAULT FALSE,
    max_selections INTEGER DEFAULT 1,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(organization_id, name)
);

-- Menu item modifier options
CREATE TABLE rest_menu_modifier_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    modifier_id UUID NOT NULL REFERENCES rest_menu_modifiers(id) ON DELETE CASCADE,
    
    name TEXT NOT NULL,
    price_adjustment DECIMAL(6,2) DEFAULT 0, -- Can be negative for discounts
    is_default BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Junction table for menu items and their modifiers
CREATE TABLE rest_menu_item_modifiers (
    menu_item_id UUID NOT NULL REFERENCES rest_menu_items(id) ON DELETE CASCADE,
    modifier_id UUID NOT NULL REFERENCES rest_menu_modifiers(id) ON DELETE CASCADE,
    
    PRIMARY KEY (menu_item_id, modifier_id)
);

-- Restaurant orders
CREATE TABLE rest_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Basic information
    order_number TEXT NOT NULL,
    customer_id UUID REFERENCES customers(id),
    
    -- Order details
    order_type TEXT NOT NULL CHECK (order_type IN ('dine_in', 'takeout', 'delivery', 'drive_through')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')),
    
    -- Timing
    ordered_at TIMESTAMPTZ DEFAULT NOW(),
    promised_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- Location details
    table_number TEXT,
    seat_number TEXT,
    
    -- Delivery information (if applicable)
    delivery_address JSONB,
    delivery_instructions TEXT,
    delivery_fee DECIMAL(6,2) DEFAULT 0,
    
    -- Financial details
    subtotal DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    tip_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) DEFAULT 0,
    
    -- Payment information
    payment_method TEXT,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    
    -- Staff assignment
    server_id UUID REFERENCES user_profiles(id),
    cashier_id UUID REFERENCES user_profiles(id),
    
    -- Special instructions
    special_instructions TEXT,
    kitchen_notes TEXT,
    
    -- Metadata
    custom_fields JSONB DEFAULT '{}',
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id),
    
    -- Soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES user_profiles(id),
    
    UNIQUE(organization_id, order_number)
);

-- Order items
CREATE TABLE rest_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES rest_orders(id) ON DELETE CASCADE,
    menu_item_id UUID NOT NULL REFERENCES rest_menu_items(id),
    
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(8,2) NOT NULL,
    total_price DECIMAL(8,2) NOT NULL,
    
    -- Customizations
    special_instructions TEXT,
    
    -- Status tracking
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'served')),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order item modifiers (what modifiers were selected)
CREATE TABLE rest_order_item_modifiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    order_item_id UUID NOT NULL REFERENCES rest_order_items(id) ON DELETE CASCADE,
    modifier_option_id UUID NOT NULL REFERENCES rest_menu_modifier_options(id),
    
    price_adjustment DECIMAL(6,2) DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Restaurant tables
CREATE TABLE rest_tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    table_number TEXT NOT NULL,
    section TEXT,
    capacity INTEGER NOT NULL DEFAULT 4,
    shape TEXT DEFAULT 'rectangle' CHECK (shape IN ('rectangle', 'round', 'square', 'booth')),
    
    -- Status
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'cleaning', 'out_of_service')),
    
    -- Location
    x_position INTEGER DEFAULT 0,
    y_position INTEGER DEFAULT 0,
    
    -- Metadata
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(organization_id, table_number)
);

-- Reservations
CREATE TABLE rest_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id),
    table_id UUID REFERENCES rest_tables(id),
    
    -- Reservation details
    party_size INTEGER NOT NULL,
    reserved_at TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 120,
    
    -- Contact information
    contact_name TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    
    -- Status
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('requested', 'confirmed', 'seated', 'no_show', 'cancelled')),
    
    -- Special requests
    special_requests TEXT,
    dietary_restrictions TEXT,
    
    -- Timing
    arrived_at TIMESTAMPTZ,
    seated_at TIMESTAMPTZ,
    
    -- Metadata
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);
```

### 3.3 Auto Services (AUTO) Schema

```sql
-- Customer vehicles
CREATE TABLE auto_vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    
    -- Vehicle identification
    vin TEXT,
    license_plate TEXT,
    
    -- Vehicle details
    year INTEGER,
    make TEXT,
    model TEXT,
    trim TEXT,
    color TEXT,
    engine_type TEXT,
    transmission_type TEXT,
    drive_type TEXT,
    fuel_type TEXT,
    
    -- Odometer
    current_mileage INTEGER,
    last_service_mileage INTEGER,
    
    -- Vehicle status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'sold', 'totaled')),
    
    -- Insurance and registration
    insurance_company TEXT,
    insurance_policy_number TEXT,
    registration_expires_at DATE,
    
    -- Metadata
    notes TEXT,
    photos TEXT[] DEFAULT '{}',
    custom_fields JSONB DEFAULT '{}',
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id),
    
    -- Soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES user_profiles(id)
);

-- Auto service work orders
CREATE TABLE auto_work_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Basic information
    work_order_number TEXT NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id),
    vehicle_id UUID NOT NULL REFERENCES auto_vehicles(id),
    
    -- Service details
    title TEXT NOT NULL,
    description TEXT,
    service_type TEXT NOT NULL CHECK (service_type IN ('maintenance', 'repair', 'inspection', 'diagnostic', 'bodywork', 'tire_service', 'oil_change', 'brake_service', 'engine_repair')),
    
    -- Assignment
    assigned_technician_id UUID REFERENCES user_profiles(id),
    service_advisor_id UUID REFERENCES user_profiles(id),
    
    -- Scheduling
    scheduled_start TIMESTAMPTZ,
    scheduled_completion TIMESTAMPTZ,
    actual_start TIMESTAMPTZ,
    actual_completion TIMESTAMPTZ,
    
    -- Status and priority
    status TEXT DEFAULT 'created' CHECK (status IN ('created', 'scheduled', 'in_progress', 'completed', 'cancelled', 'on_hold', 'waiting_parts', 'waiting_approval')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    -- Vehicle information at time of service
    mileage_in INTEGER,
    mileage_out INTEGER,
    fuel_level TEXT,
    
    -- Financial estimates
    estimated_cost DECIMAL(10,2),
    estimated_hours DECIMAL(5,2),
    actual_cost DECIMAL(10,2),
    actual_hours DECIMAL(5,2),
    
    -- Authorization
    customer_authorization BOOLEAN DEFAULT FALSE,
    authorization_limit DECIMAL(10,2),
    authorization_notes TEXT,
    
    -- Quality control
    final_inspection_passed BOOLEAN,
    road_test_completed BOOLEAN,
    customer_satisfaction_rating INTEGER CHECK (customer_satisfaction_rating >= 1 AND customer_satisfaction_rating <= 5),
    
    -- Documentation
    photos_before TEXT[] DEFAULT '{}',
    photos_after TEXT[] DEFAULT '{}',
    customer_signature_url TEXT,
    
    -- Warranty
    warranty_period_months INTEGER DEFAULT 12,
    warranty_mileage INTEGER DEFAULT 12000,
    warranty_terms TEXT,
    
    -- Notes
    customer_concerns TEXT,
    technician_findings TEXT,
    recommendations TEXT,
    internal_notes TEXT,
    
    -- Metadata
    tags TEXT[] DEFAULT '{}',
    custom_fields JSONB DEFAULT '{}',
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES user_profiles(id),
    updated_by UUID REFERENCES user_profiles(id),
    
    -- Soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES user_profiles(id),
    
    UNIQUE(organization_id, work_order_number)
);

-- Auto service repair orders (more detailed than work orders)
CREATE TABLE auto_repair_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    work_order_id UUID NOT NULL REFERENCES auto_work_orders(id),
    
    -- Diagnostic information
    diagnostic_codes JSONB DEFAULT '[]', -- OBD codes
    symptoms_reported TEXT,
    root_cause_analysis TEXT,
    
    -- Parts information
    parts_needed JSONB DEFAULT '[]',
    parts_ordered BOOLEAN DEFAULT FALSE,
    parts_received BOOLEAN DEFAULT FALSE,
    
    -- Labor breakdown
    labor_operations JSONB DEFAULT '[]',
    
    -- Testing and validation
    pre_repair_tests TEXT,
    post_repair_tests TEXT,
    test_drive_notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto parts inventory
CREATE TABLE auto_parts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Part identification
    part_number TEXT NOT NULL,
    manufacturer_part_number TEXT,
    interchange_numbers TEXT[] DEFAULT '{}',
    
    -- Part details
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    manufacturer TEXT,
    brand TEXT,
    
    -- Fitment information
    compatible_makes TEXT[] DEFAULT '{}',
    compatible_models TEXT[] DEFAULT '{}',
    compatible_years INTEGER[] DEFAULT '{}',
    
    -- Pricing
    cost DECIMAL(10,2),
    wholesale_price DECIMAL(10,2),
    retail_price DECIMAL(10,2),
    core_charge DECIMAL(10,2) DEFAULT 0,
    
    -- Inventory
    quantity_on_hand INTEGER DEFAULT 0,
    quantity_committed INTEGER DEFAULT 0,
    quantity_available INTEGER GENERATED ALWAYS AS (quantity_on_hand - quantity_committed) STORED,
    reorder_level INTEGER DEFAULT 0,
    reorder_quantity INTEGER DEFAULT 0,
    
    -- Physical properties
    weight DECIMAL(8,3),
    dimensions JSONB, -- {length, width, height}
    hazmat BOOLEAN DEFAULT FALSE,
    
    -- Vendor information
    preferred_vendor_id UUID,
    vendor_part_number TEXT,
    lead_time_days INTEGER,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_special_order BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    notes TEXT,
    images TEXT[] DEFAULT '{}',
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id),
    
    -- Soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES user_profiles(id),
    
    UNIQUE(organization_id, part_number)
);

-- Vehicle service history
CREATE TABLE auto_service_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES auto_vehicles(id) ON DELETE CASCADE,
    work_order_id UUID REFERENCES auto_work_orders(id),
    
    service_date DATE NOT NULL,
    service_type TEXT NOT NULL,
    mileage INTEGER,
    description TEXT NOT NULL,
    
    -- Service provider (if done elsewhere)
    performed_by TEXT, -- If not performed by this shop
    external_service BOOLEAN DEFAULT FALSE,
    
    -- Next service recommendations
    next_service_due_date DATE,
    next_service_due_mileage INTEGER,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);
```

### 3.4 Retail (RET) Schema

```sql
-- Product categories
CREATE TABLE ret_product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES ret_product_categories(id),
    
    name TEXT NOT NULL,
    description TEXT,
    slug TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Display settings
    image_url TEXT,
    banner_url TEXT,
    meta_description TEXT,
    
    -- Commission settings
    commission_rate DECIMAL(5,2) DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(organization_id, slug)
);

-- Products
CREATE TABLE ret_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    category_id UUID REFERENCES ret_product_categories(id),
    
    -- Basic information
    name TEXT NOT NULL,
    description TEXT,
    short_description TEXT,
    sku TEXT NOT NULL,
    barcode TEXT,
    
    -- Pricing
    cost DECIMAL(10,2),
    wholesale_price DECIMAL(10,2),
    retail_price DECIMAL(10,2) NOT NULL,
    sale_price DECIMAL(10,2),
    sale_price_starts_at TIMESTAMPTZ,
    sale_price_ends_at TIMESTAMPTZ,
    
    -- Inventory tracking
    track_inventory BOOLEAN DEFAULT TRUE,
    quantity_on_hand INTEGER DEFAULT 0,
    quantity_committed INTEGER DEFAULT 0,
    quantity_available INTEGER GENERATED ALWAYS AS (quantity_on_hand - quantity_committed) STORED,
    reorder_level INTEGER DEFAULT 0,
    reorder_quantity INTEGER DEFAULT 0,
    
    -- Physical properties
    weight DECIMAL(8,3),
    dimensions JSONB,
    requires_shipping BOOLEAN DEFAULT TRUE,
    
    -- Tax and compliance
    taxable BOOLEAN DEFAULT TRUE,
    tax_category TEXT,
    
    -- Status and visibility
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'hidden')),
    
    -- SEO
    slug TEXT,
    meta_title TEXT,
    meta_description TEXT,
    
    -- Vendor information
    vendor_id UUID,
    vendor_sku TEXT,
    
    -- Images and media
    images TEXT[] DEFAULT '{}',
    
    -- Variants and options
    has_variants BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    tags TEXT[] DEFAULT '{}',
    custom_fields JSONB DEFAULT '{}',
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id),
    
    -- Soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES user_profiles(id),
    
    UNIQUE(organization_id, sku)
);

-- Product variants (size, color, etc.)
CREATE TABLE ret_product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES ret_products(id) ON DELETE CASCADE,
    
    -- Variant details
    name TEXT NOT NULL,
    sku TEXT NOT NULL,
    barcode TEXT,
    
    -- Pricing (can override parent product)
    cost DECIMAL(10,2),
    retail_price DECIMAL(10,2),
    sale_price DECIMAL(10,2),
    
    -- Inventory
    quantity_on_hand INTEGER DEFAULT 0,
    quantity_committed INTEGER DEFAULT 0,
    quantity_available INTEGER GENERATED ALWAYS AS (quantity_on_hand - quantity_committed) STORED,
    
    -- Physical properties
    weight DECIMAL(8,3),
    dimensions JSONB,
    
    -- Variant attributes
    attributes JSONB DEFAULT '{}', -- {color: "red", size: "large"}
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Images
    images TEXT[] DEFAULT '{}',
    
    -- Metadata
    sort_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(organization_id, sku)
);

-- Sales orders
CREATE TABLE ret_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Basic information
    order_number TEXT NOT NULL,
    customer_id UUID REFERENCES customers(id),
    
    -- Order details
    order_type TEXT DEFAULT 'sale' CHECK (order_type IN ('sale', 'return', 'exchange', 'layaway')),
    channel TEXT DEFAULT 'in_store' CHECK (channel IN ('in_store', 'online', 'phone', 'mobile_app')),
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded')),
    fulfillment_status TEXT DEFAULT 'unfulfilled' CHECK (fulfillment_status IN ('unfulfilled', 'partial', 'fulfilled')),
    
    -- Financial details
    subtotal DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    shipping_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) DEFAULT 0,
    
    -- Payment information
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'authorized', 'paid', 'partial', 'refunded', 'failed')),
    
    -- Shipping information
    shipping_address JSONB,
    billing_address JSONB,
    shipping_method TEXT,
    tracking_number TEXT,
    shipping_carrier TEXT,
    
    -- Dates
    ordered_at TIMESTAMPTZ DEFAULT NOW(),
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    
    -- Staff assignment
    sales_rep_id UUID REFERENCES user_profiles(id),
    cashier_id UUID REFERENCES user_profiles(id),
    
    -- Notes
    notes TEXT,
    internal_notes TEXT,
    shipping_instructions TEXT,
    
    -- Metadata
    tags TEXT[] DEFAULT '{}',
    custom_fields JSONB DEFAULT '{}',
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id),
    
    -- Soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES user_profiles(id),
    
    UNIQUE(organization_id, order_number)
);

-- Order line items
CREATE TABLE ret_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES ret_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES ret_products(id),
    variant_id UUID REFERENCES ret_product_variants(id),
    
    -- Item details
    product_name TEXT NOT NULL,
    sku TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(6,2) DEFAULT 0,
    
    -- Fulfillment
    quantity_fulfilled INTEGER DEFAULT 0,
    quantity_returned INTEGER DEFAULT 0,
    
    -- Tax
    taxable BOOLEAN DEFAULT TRUE,
    tax_rate DECIMAL(5,4) DEFAULT 0,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory transactions
CREATE TABLE ret_inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    product_id UUID REFERENCES ret_products(id),
    variant_id UUID REFERENCES ret_product_variants(id),
    
    -- Transaction details
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'sale', 'adjustment', 'transfer', 'return', 'shrinkage', 'damage')),
    quantity INTEGER NOT NULL,
    unit_cost DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    
    -- Reference information
    reference_type TEXT, -- 'order', 'purchase_order', 'adjustment', etc.
    reference_id UUID,
    reference_number TEXT,
    
    -- Location
    location TEXT,
    bin_location TEXT,
    
    -- Notes
    reason TEXT,
    notes TEXT,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES user_profiles(id)
);
```

---

## IV. LEARNING MANAGEMENT SYSTEM

### 4.1 Courses Schema

```sql
-- Course categories
CREATE TABLE course_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES course_categories(id),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES course_categories(id),
    
    -- Basic information
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    short_description TEXT,
    
    -- Course details
    difficulty TEXT DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    duration_hours DECIMAL(5,2),
    language TEXT DEFAULT 'en',
    
    -- Instructor information
    instructor_name TEXT,
    instructor_bio TEXT,
    instructor_avatar_url TEXT,
    
    -- Content and structure
    total_lessons INTEGER DEFAULT 0,
    total_quizzes INTEGER DEFAULT 0,
    
    -- Pricing
    is_free BOOLEAN DEFAULT TRUE,
    price DECIMAL(8,2) DEFAULT 0,
    
    -- Certification
    provides_certificate BOOLEAN DEFAULT FALSE,
    certificate_template TEXT,
    
    -- Status and visibility
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    is_featured BOOLEAN DEFAULT FALSE,
    
    -- Enrollment settings
    max_students INTEGER,
    enrollment_start DATE,
    enrollment_end DATE,
    course_start DATE,
    course_end DATE,
    
    -- Media
    thumbnail_url TEXT,
    video_preview_url TEXT,
    
    -- Metadata
    tags TEXT[] DEFAULT '{}',
    learning_objectives TEXT[] DEFAULT '{}',
    prerequisites TEXT[] DEFAULT '{}',
    target_audience TEXT[] DEFAULT '{}',
    
    -- SEO
    meta_title TEXT,
    meta_description TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- Course lessons/modules
CREATE TABLE course_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    
    -- Basic information
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    
    -- Structure
    section_number INTEGER NOT NULL,
    lesson_number INTEGER NOT NULL,
    sort_order INTEGER NOT NULL,
    
    -- Content
    content_type TEXT DEFAULT 'video' CHECK (content_type IN ('video', 'text', 'quiz', 'assignment', 'download', 'interactive')),
    content_url TEXT,
    content_data JSONB DEFAULT '{}',
    
    -- Duration and effort
    duration_minutes INTEGER,
    estimated_effort TEXT,
    
    -- Settings
    is_preview BOOLEAN DEFAULT FALSE, -- Can be accessed without enrollment
    is_mandatory BOOLEAN DEFAULT TRUE,
    
    -- Status
    is_published BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id),
    
    UNIQUE(course_id, section_number, lesson_number),
    UNIQUE(course_id, slug)
);

-- Course enrollments
CREATE TABLE course_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Enrollment details
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped', 'suspended')),
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    
    -- Dates
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    last_accessed_at TIMESTAMPTZ,
    
    -- Completion tracking
    lessons_completed INTEGER DEFAULT 0,
    quizzes_passed INTEGER DEFAULT 0,
    current_lesson_id UUID REFERENCES course_lessons(id),
    
    -- Performance
    average_score DECIMAL(5,2),
    total_study_time_minutes INTEGER DEFAULT 0,
    
    -- Certification
    certificate_issued BOOLEAN DEFAULT FALSE,
    certificate_url TEXT,
    certificate_issued_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(course_id, user_id)
);

-- Lesson progress tracking
CREATE TABLE lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID NOT NULL REFERENCES course_enrollments(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Progress details
    status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'skipped')),
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    
    -- Timing
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    time_spent_minutes INTEGER DEFAULT 0,
    
    -- Interaction data
    interactions JSONB DEFAULT '{}',
    bookmarks JSONB DEFAULT '[]',
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(enrollment_id, lesson_id)
);

-- Quizzes and assessments
CREATE TABLE course_quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES course_lessons(id) ON DELETE CASCADE,
    
    title TEXT NOT NULL,
    description TEXT,
    instructions TEXT,
    
    -- Quiz settings
    time_limit_minutes INTEGER,
    attempts_allowed INTEGER DEFAULT 1,
    passing_score INTEGER DEFAULT 70,
    randomize_questions BOOLEAN DEFAULT FALSE,
    show_correct_answers BOOLEAN DEFAULT TRUE,
    
    -- Availability
    available_from TIMESTAMPTZ,
    available_until TIMESTAMPTZ,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- Quiz questions
CREATE TABLE quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES course_quizzes(id) ON DELETE CASCADE,
    
    question_text TEXT NOT NULL,
    question_type TEXT DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer', 'essay', 'fill_blank')),
    
    -- Options (for multiple choice, true/false)
    options JSONB DEFAULT '[]',
    correct_answer JSONB,
    explanation TEXT,
    
    -- Scoring
    points INTEGER DEFAULT 1,
    
    -- Order
    sort_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz attempts
CREATE TABLE quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES course_quizzes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    enrollment_id UUID NOT NULL REFERENCES course_enrollments(id) ON DELETE CASCADE,
    
    -- Attempt details
    attempt_number INTEGER NOT NULL,
    status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'timed_out', 'abandoned')),
    
    -- Scoring
    score DECIMAL(5,2),
    max_score DECIMAL(5,2),
    percentage_score DECIMAL(5,2),
    passed BOOLEAN DEFAULT FALSE,
    
    -- Timing
    started_at TIMESTAMPTZ DEFAULT NOW(),
    submitted_at TIMESTAMPTZ,
    time_spent_minutes INTEGER,
    
    -- Answers
    answers JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(quiz_id, user_id, attempt_number)
);
```

---

## V. PAYROLL & HR SYSTEM

### 5.1 Employee Management

```sql
-- Employees (extends user_profiles for employees)
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_profile_id UUID UNIQUE REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Employee identification
    employee_number TEXT NOT NULL,
    badge_number TEXT,
    
    -- Employment details
    hire_date DATE NOT NULL,
    termination_date DATE,
    employment_status TEXT DEFAULT 'active' CHECK (employment_status IN ('active', 'inactive', 'terminated', 'on_leave')),
    employment_type TEXT DEFAULT 'full_time' CHECK (employment_type IN ('full_time', 'part_time', 'contractor', 'intern', 'temporary')),
    
    -- Job information
    job_title TEXT NOT NULL,
    department TEXT,
    location TEXT,
    manager_id UUID REFERENCES employees(id),
    reports_to_id UUID REFERENCES employees(id),
    
    -- Compensation
    pay_type TEXT DEFAULT 'salary' CHECK (pay_type IN ('salary', 'hourly', 'commission', 'piece_rate')),
    salary_amount DECIMAL(10,2),
    hourly_rate DECIMAL(8,2),
    overtime_rate DECIMAL(8,2),
    commission_rate DECIMAL(5,2),
    
    -- Personal information
    date_of_birth DATE,
    ssn TEXT, -- Encrypted
    gender TEXT,
    marital_status TEXT,
    
    -- Address
    home_address JSONB,
    mailing_address JSONB,
    
    -- Emergency contact
    emergency_contacts JSONB DEFAULT '[]',
    
    -- Benefits eligibility
    benefits_eligible BOOLEAN DEFAULT TRUE,
    benefits_start_date DATE,
    
    -- Tax information
    federal_allowances INTEGER DEFAULT 0,
    state_allowances INTEGER DEFAULT 0,
    additional_withholding DECIMAL(8,2) DEFAULT 0,
    exempt_federal BOOLEAN DEFAULT FALSE,
    exempt_state BOOLEAN DEFAULT FALSE,
    
    -- Direct deposit
    direct_deposit_enabled BOOLEAN DEFAULT FALSE,
    bank_accounts JSONB DEFAULT '[]',
    
    -- PTO balances
    vacation_hours DECIMAL(6,2) DEFAULT 0,
    sick_hours DECIMAL(6,2) DEFAULT 0,
    personal_hours DECIMAL(6,2) DEFAULT 0,
    
    -- Work schedule
    standard_hours_per_week DECIMAL(4,1) DEFAULT 40,
    work_schedule JSONB DEFAULT '{}',
    
    -- Profile and documents
    profile_photo_url TEXT,
    documents JSONB DEFAULT '[]',
    
    -- Metadata
    custom_fields JSONB DEFAULT '{}',
    notes TEXT,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id),
    
    -- Soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES user_profiles(id),
    
    UNIQUE(organization_id, employee_number)
);

-- Departments
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    name TEXT NOT NULL,
    code TEXT,
    description TEXT,
    manager_id UUID REFERENCES employees(id),
    parent_department_id UUID REFERENCES departments(id),
    
    -- Budget information
    annual_budget DECIMAL(12,2),
    cost_center TEXT,
    
    -- Location
    location TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(organization_id, name)
);
```

### 5.2 Time Tracking

```sql
-- Time entries
CREATE TABLE time_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    
    -- Time details
    clock_in_time TIMESTAMPTZ NOT NULL,
    clock_out_time TIMESTAMPTZ,
    break_minutes INTEGER DEFAULT 0,
    total_hours DECIMAL(4,2),
    
    -- Hours breakdown
    regular_hours DECIMAL(4,2) DEFAULT 0,
    overtime_hours DECIMAL(4,2) DEFAULT 0,
    double_time_hours DECIMAL(4,2) DEFAULT 0,
    
    -- Location tracking
    clock_in_location JSONB,
    clock_out_location JSONB,
    clock_in_ip_address INET,
    clock_out_ip_address INET,
    
    -- Project/task tracking
    project_id UUID,
    task_description TEXT,
    billable BOOLEAN DEFAULT FALSE,
    
    -- Status
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected', 'paid')),
    
    -- Approval
    approved_by UUID REFERENCES user_profiles(id),
    approved_at TIMESTAMPTZ,
    approval_notes TEXT,
    
    -- Adjustments
    adjusted_hours DECIMAL(4,2),
    adjustment_reason TEXT,
    adjusted_by UUID REFERENCES user_profiles(id),
    adjusted_at TIMESTAMPTZ,
    
    -- Notes
    employee_notes TEXT,
    manager_notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Time off requests
CREATE TABLE time_off_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    
    -- Request details
    request_type TEXT NOT NULL CHECK (request_type IN ('vacation', 'sick', 'personal', 'bereavement', 'jury_duty', 'military', 'unpaid')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_hours DECIMAL(5,2) NOT NULL,
    
    -- Partial day details
    is_partial_day BOOLEAN DEFAULT FALSE,
    start_time TIME,
    end_time TIME,
    
    -- Request information
    reason TEXT,
    employee_notes TEXT,
    
    -- Approval workflow
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'cancelled')),
    approver_id UUID REFERENCES user_profiles(id),
    approved_at TIMESTAMPTZ,
    approval_notes TEXT,
    
    -- Balance tracking
    balance_before DECIMAL(5,2),
    balance_after DECIMAL(5,2),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure end date is not before start date
    CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);
```

### 5.3 Payroll Processing

```sql
-- Pay periods
CREATE TABLE pay_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    pay_date DATE NOT NULL,
    
    -- Processing status
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'processing', 'calculated', 'approved', 'paid', 'closed')),
    
    -- Totals
    total_gross_pay DECIMAL(12,2) DEFAULT 0,
    total_net_pay DECIMAL(12,2) DEFAULT 0,
    total_taxes DECIMAL(12,2) DEFAULT 0,
    total_deductions DECIMAL(12,2) DEFAULT 0,
    employee_count INTEGER DEFAULT 0,
    
    -- Processing information
    calculated_at TIMESTAMPTZ,
    calculated_by UUID REFERENCES user_profiles(id),
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES user_profiles(id),
    paid_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(organization_id, start_date, end_date)
);

-- Payroll records
CREATE TABLE payroll_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    pay_period_id UUID NOT NULL REFERENCES pay_periods(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    
    -- Hours worked
    regular_hours DECIMAL(5,2) DEFAULT 0,
    overtime_hours DECIMAL(5,2) DEFAULT 0,
    double_time_hours DECIMAL(5,2) DEFAULT 0,
    pto_hours DECIMAL(5,2) DEFAULT 0,
    holiday_hours DECIMAL(5,2) DEFAULT 0,
    
    -- Pay rates (at time of payroll)
    regular_rate DECIMAL(8,2),
    overtime_rate DECIMAL(8,2),
    double_time_rate DECIMAL(8,2),
    
    -- Gross pay breakdown
    regular_pay DECIMAL(10,2) DEFAULT 0,
    overtime_pay DECIMAL(10,2) DEFAULT 0,
    double_time_pay DECIMAL(10,2) DEFAULT 0,
    pto_pay DECIMAL(10,2) DEFAULT 0,
    holiday_pay DECIMAL(10,2) DEFAULT 0,
    bonus_pay DECIMAL(10,2) DEFAULT 0,
    commission_pay DECIMAL(10,2) DEFAULT 0,
    other_pay DECIMAL(10,2) DEFAULT 0,
    gross_pay DECIMAL(10,2) DEFAULT 0,
    
    -- Pre-tax deductions
    health_insurance DECIMAL(8,2) DEFAULT 0,
    dental_insurance DECIMAL(8,2) DEFAULT 0,
    vision_insurance DECIMAL(8,2) DEFAULT 0,
    retirement_401k DECIMAL(8,2) DEFAULT 0,
    retirement_401k_match DECIMAL(8,2) DEFAULT 0,
    hsa_contribution DECIMAL(8,2) DEFAULT 0,
    other_pretax_deductions DECIMAL(8,2) DEFAULT 0,
    total_pretax_deductions DECIMAL(8,2) DEFAULT 0,
    
    -- Taxable wages
    federal_taxable_wages DECIMAL(10,2) DEFAULT 0,
    state_taxable_wages DECIMAL(10,2) DEFAULT 0,
    social_security_wages DECIMAL(10,2) DEFAULT 0,
    medicare_wages DECIMAL(10,2) DEFAULT 0,
    unemployment_wages DECIMAL(10,2) DEFAULT 0,
    
    -- Tax withholdings
    federal_income_tax DECIMAL(8,2) DEFAULT 0,
    state_income_tax DECIMAL(8,2) DEFAULT 0,
    social_security_tax DECIMAL(8,2) DEFAULT 0,
    medicare_tax DECIMAL(8,2) DEFAULT 0,
    additional_medicare_tax DECIMAL(8,2) DEFAULT 0,
    state_disability_tax DECIMAL(8,2) DEFAULT 0,
    total_taxes DECIMAL(8,2) DEFAULT 0,
    
    -- Post-tax deductions
    union_dues DECIMAL(8,2) DEFAULT 0,
    garnishments DECIMAL(8,2) DEFAULT 0,
    other_posttax_deductions DECIMAL(8,2) DEFAULT 0,
    total_posttax_deductions DECIMAL(8,2) DEFAULT 0,
    
    -- Net pay
    net_pay DECIMAL(10,2) DEFAULT 0,
    
    -- Employer costs
    employer_social_security DECIMAL(8,2) DEFAULT 0,
    employer_medicare DECIMAL(8,2) DEFAULT 0,
    employer_unemployment DECIMAL(8,2) DEFAULT 0,
    workers_compensation DECIMAL(8,2) DEFAULT 0,
    total_employer_taxes DECIMAL(8,2) DEFAULT 0,
    
    -- Payment information
    check_number TEXT,
    payment_method TEXT DEFAULT 'direct_deposit' CHECK (payment_method IN ('direct_deposit', 'check', 'cash', 'card')),
    payment_date DATE,
    
    -- Status
    status TEXT DEFAULT 'calculated' CHECK (status IN ('calculated', 'approved', 'paid', 'voided')),
    void_reason TEXT,
    voided_at TIMESTAMPTZ,
    voided_by UUID REFERENCES user_profiles(id),
    
    -- Year-to-date totals (calculated)
    ytd_gross_pay DECIMAL(12,2) DEFAULT 0,
    ytd_net_pay DECIMAL(12,2) DEFAULT 0,
    ytd_federal_tax DECIMAL(10,2) DEFAULT 0,
    ytd_state_tax DECIMAL(10,2) DEFAULT 0,
    ytd_social_security_tax DECIMAL(10,2) DEFAULT 0,
    ytd_medicare_tax DECIMAL(10,2) DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(pay_period_id, employee_id)
);
```

---

## VI. TRUST & VERIFICATION SYSTEM

### 6.1 Trust Metrics

```sql
-- Trust metrics (public-facing trust indicators)
CREATE TABLE trust_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Metric identification
    metric_type TEXT NOT NULL, -- 'response_time', 'completion_rate', 'customer_satisfaction', etc.
    industry TEXT NOT NULL CHECK (industry IN ('hs', 'rest', 'auto', 'ret')),
    
    -- Metric values
    current_value DECIMAL(10,4) NOT NULL,
    previous_value DECIMAL(10,4),
    
    -- Time period
    period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Sample size and confidence
    sample_size INTEGER NOT NULL DEFAULT 1,
    confidence_level DECIMAL(5,2) DEFAULT 95.0,
    margin_of_error DECIMAL(8,4),
    
    -- Verification
    verified BOOLEAN DEFAULT FALSE,
    verification_method TEXT,
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES user_profiles(id),
    
    -- Public visibility
    is_public BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    
    -- Metadata
    calculation_method TEXT,
    data_sources JSONB DEFAULT '[]',
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(organization_id, metric_type, period_start, period_end)
);

-- Trust capsules (immutable trust records)
CREATE TABLE trust_capsules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Capsule identification
    capsule_hash TEXT UNIQUE NOT NULL, -- SHA-256 hash of capsule content
    version INTEGER DEFAULT 1,
    
    -- Content
    title TEXT NOT NULL,
    description TEXT,
    data JSONB NOT NULL, -- The actual trust data
    
    -- Time bounds
    valid_from TIMESTAMPTZ NOT NULL,
    valid_until TIMESTAMPTZ NOT NULL,
    
    -- Verification chain
    previous_capsule_id UUID REFERENCES trust_capsules(id),
    signature TEXT, -- Digital signature
    
    -- Public accessibility
    is_public BOOLEAN DEFAULT TRUE,
    public_url TEXT,
    
    -- Metadata
    created_by_system TEXT, -- Which system generated this capsule
    data_sources JSONB DEFAULT '[]',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure valid time range
    CONSTRAINT valid_time_range CHECK (valid_until > valid_from)
);

-- Trust badge definitions
CREATE TABLE trust_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Badge identification
    name TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    icon_url TEXT,
    
    -- Criteria
    industry TEXT CHECK (industry IN ('hs', 'rest', 'auto', 'ret', 'general')),
    criteria JSONB NOT NULL, -- The rules for earning this badge
    
    -- Display
    color_scheme JSONB DEFAULT '{}',
    sort_order INTEGER DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization trust badges (earned badges)
CREATE TABLE organization_trust_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES trust_badges(id) ON DELETE CASCADE,
    
    -- Award details
    awarded_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    
    -- Verification
    verification_data JSONB DEFAULT '{}',
    verified_by TEXT, -- System or auditor
    
    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
    revoked_at TIMESTAMPTZ,
    revoked_reason TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(organization_id, badge_id)
);
```

---

## VII. AI & AUTOMATION SYSTEM

### 7.1 AI Operations Tracking

```sql
-- AI operations log (for audit and billing)
CREATE TABLE ai_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id),
    
    -- Operation details
    operation_type TEXT NOT NULL, -- 'completion', 'embedding', 'classification', 'analysis', etc.
    model TEXT NOT NULL, -- 'gpt-4', 'claude-3', 'text-embedding-ada-002', etc.
    provider TEXT NOT NULL, -- 'openai', 'anthropic', 'voyage', etc.
    
    -- Request details
    input_tokens INTEGER DEFAULT 0,
    output_tokens INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    
    -- Performance metrics
    latency_ms INTEGER,
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    error_code TEXT,
    
    -- Cost tracking
    cost_usd DECIMAL(10,6) DEFAULT 0,
    
    -- Context and purpose
    context_type TEXT, -- 'customer_insight', 'invoice_processing', 'classification', etc.
    context_id UUID, -- ID of the record being processed
    purpose TEXT,
    
    -- Request/response metadata
    request_metadata JSONB DEFAULT '{}',
    response_metadata JSONB DEFAULT '{}',
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- MCP tool calls (Model Context Protocol)
CREATE TABLE mcp_tool_calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id),
    
    -- Tool identification
    tool_name TEXT NOT NULL,
    tool_version TEXT,
    
    -- Call details
    input_parameters JSONB NOT NULL,
    output_result JSONB,
    
    -- Execution
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'timeout')),
    execution_time_ms INTEGER,
    error_message TEXT,
    
    -- Idempotency
    idempotency_key TEXT,
    
    -- Context
    conversation_id UUID,
    parent_call_id UUID REFERENCES mcp_tool_calls(id),
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    -- Index for duplicate detection
    UNIQUE NULLS NOT DISTINCT (organization_id, idempotency_key)
);

-- AI-generated insights and recommendations
CREATE TABLE ai_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Insight classification
    insight_type TEXT NOT NULL, -- 'trend', 'anomaly', 'opportunity', 'warning', 'recommendation'
    category TEXT NOT NULL, -- 'financial', 'operational', 'customer', 'inventory', etc.
    severity TEXT DEFAULT 'info' CHECK (severity IN ('low', 'info', 'medium', 'high', 'critical')),
    
    -- Content
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    
    -- Confidence and impact
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    impact_score DECIMAL(3,2) CHECK (impact_score >= 0 AND impact_score <= 1),
    
    -- Associated data
    entity_type TEXT, -- 'customer', 'invoice', 'work_order', etc.
    entity_id UUID,
    data_snapshot JSONB DEFAULT '{}',
    
    -- Recommendations
    recommended_actions JSONB DEFAULT '[]',
    
    -- Status and lifecycle
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'viewed', 'acknowledged', 'dismissed', 'resolved')),
    acknowledged_by UUID REFERENCES user_profiles(id),
    acknowledged_at TIMESTAMPTZ,
    
    -- Validity
    valid_until TIMESTAMPTZ,
    
    -- AI model information
    generated_by TEXT, -- Model name/version
    generation_metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## VIII. AUDIT & COMPLIANCE SYSTEM

### 8.1 Comprehensive Audit Logging

```sql
-- Audit logs (tracks all data changes)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- What was changed
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE', 'SOFT_DELETE', 'RESTORE')),
    
    -- Change details
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[] DEFAULT '{}',
    
    -- Who made the change
    user_id UUID REFERENCES user_profiles(id),
    impersonated_by UUID REFERENCES user_profiles(id), -- If admin is acting as another user
    
    -- When and where
    created_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    session_id TEXT,
    
    -- Context
    request_id TEXT, -- UUID for tracing requests
    api_endpoint TEXT,
    http_method TEXT,
    
    -- Additional metadata
    metadata JSONB DEFAULT '{}',
    
    -- Search optimization
    search_vector tsvector
);

-- System events log (application-level events)
CREATE TABLE system_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    
    -- Event classification
    event_type TEXT NOT NULL,
    event_category TEXT NOT NULL, -- 'security', 'performance', 'business', 'system', etc.
    severity TEXT DEFAULT 'info' CHECK (severity IN ('debug', 'info', 'warning', 'error', 'critical')),
    
    -- Event details
    title TEXT NOT NULL,
    description TEXT,
    details JSONB DEFAULT '{}',
    
    -- Context
    user_id UUID REFERENCES user_profiles(id),
    entity_type TEXT,
    entity_id UUID,
    
    -- Request tracing
    request_id TEXT,
    correlation_id TEXT,
    parent_event_id UUID REFERENCES system_events(id),
    
    -- Timing
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    
    -- Source
    source_system TEXT,
    source_version TEXT,
    environment TEXT DEFAULT 'production',
    
    -- Geographic and network info
    ip_address INET,
    user_agent TEXT,
    country_code TEXT,
    region TEXT,
    
    -- Search optimization
    search_vector tsvector
);

-- Data retention policies
CREATE TABLE data_retention_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    
    -- Policy details
    name TEXT NOT NULL,
    description TEXT,
    
    -- Scope
    applies_to_tables TEXT[] NOT NULL,
    applies_to_data_types TEXT[] DEFAULT '{}',
    
    -- Retention rules
    retention_period_months INTEGER NOT NULL,
    auto_delete BOOLEAN DEFAULT FALSE,
    anonymize_before_delete BOOLEAN DEFAULT TRUE,
    
    -- Legal basis
    legal_basis TEXT,
    regulatory_requirements TEXT[] DEFAULT '{}',
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);
```

---

## IX. PERFORMANCE OPTIMIZATION

### 9.1 Strategic Indexing

```sql
-- Core entity indexes
CREATE INDEX CONCURRENTLY idx_organizations_industry ON organizations(industry) WHERE deleted_at IS NULL;
CREATE INDEX CONCURRENTLY idx_organizations_status ON organizations(status) WHERE status = 'active';
CREATE INDEX CONCURRENTLY idx_user_profiles_org_email ON user_profiles(organization_id, email) WHERE deleted_at IS NULL;
CREATE INDEX CONCURRENTLY idx_user_profiles_status ON user_profiles(organization_id, status) WHERE status = 'active';

-- Customer indexes
CREATE INDEX CONCURRENTLY idx_customers_org_status ON customers(organization_id, status) WHERE deleted_at IS NULL;
CREATE INDEX CONCURRENTLY idx_customers_search ON customers USING gin(to_tsvector('english', coalesce(first_name, '') || ' ' || coalesce(last_name, '') || ' ' || coalesce(business_name, '') || ' ' || coalesce(email, ''))) WHERE deleted_at IS NULL;
CREATE INDEX CONCURRENTLY idx_customers_phone ON customers(phone) WHERE phone IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX CONCURRENTLY idx_customers_email ON customers(email) WHERE email IS NOT NULL AND deleted_at IS NULL;

-- Invoice indexes
CREATE INDEX CONCURRENTLY idx_invoices_org_status ON invoices(organization_id, status) WHERE deleted_at IS NULL;
CREATE INDEX CONCURRENTLY idx_invoices_customer_date ON invoices(customer_id, invoice_date DESC) WHERE deleted_at IS NULL;
CREATE INDEX CONCURRENTLY idx_invoices_due_date ON invoices(due_date) WHERE status IN ('sent', 'partial') AND deleted_at IS NULL;
CREATE INDEX CONCURRENTLY idx_invoices_number_search ON invoices(organization_id, invoice_number) WHERE deleted_at IS NULL;

-- Work order indexes (industry-specific)
CREATE INDEX CONCURRENTLY idx_hs_work_orders_org_status ON hs_work_orders(organization_id, status) WHERE deleted_at IS NULL;
CREATE INDEX CONCURRENTLY idx_hs_work_orders_tech_date ON hs_work_orders(assigned_technician_id, scheduled_start) WHERE deleted_at IS NULL;
CREATE INDEX CONCURRENTLY idx_hs_work_orders_customer ON hs_work_orders(customer_id, created_at DESC) WHERE deleted_at IS NULL;

-- Restaurant order indexes
CREATE INDEX CONCURRENTLY idx_rest_orders_org_status_date ON rest_orders(organization_id, status, ordered_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX CONCURRENTLY idx_rest_orders_table ON rest_orders(organization_id, table_number, ordered_at DESC) WHERE order_type = 'dine_in' AND deleted_at IS NULL;

-- Auto work order indexes
CREATE INDEX CONCURRENTLY idx_auto_work_orders_org_status ON auto_work_orders(organization_id, status) WHERE deleted_at IS NULL;
CREATE INDEX CONCURRENTLY idx_auto_work_orders_vehicle ON auto_work_orders(vehicle_id, created_at DESC) WHERE deleted_at IS NULL;

-- Retail order indexes
CREATE INDEX CONCURRENTLY idx_ret_orders_org_status_date ON ret_orders(organization_id, status, ordered_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX CONCURRENTLY idx_ret_products_org_active ON ret_products(organization_id, is_active) WHERE is_active = TRUE AND deleted_at IS NULL;

-- Time tracking indexes
CREATE INDEX CONCURRENTLY idx_time_entries_employee_date ON time_entries(employee_id, clock_in_time::date) WHERE organization_id IS NOT NULL;
CREATE INDEX CONCURRENTLY idx_time_entries_approval ON time_entries(organization_id, status) WHERE status = 'submitted';

-- Course indexes
CREATE INDEX CONCURRENTLY idx_course_enrollments_user ON course_enrollments(user_id, status);
CREATE INDEX CONCURRENTLY idx_course_enrollments_progress ON course_enrollments(organization_id, progress DESC);

-- Audit and compliance indexes
CREATE INDEX CONCURRENTLY idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX CONCURRENTLY idx_audit_logs_org_date ON audit_logs(organization_id, created_at DESC);
CREATE INDEX CONCURRENTLY idx_audit_logs_user ON audit_logs(user_id, created_at DESC) WHERE user_id IS NOT NULL;
CREATE INDEX CONCURRENTLY idx_system_events_org_type ON system_events(organization_id, event_type, created_at DESC);

-- AI operations indexes
CREATE INDEX CONCURRENTLY idx_ai_operations_org_date ON ai_operations(organization_id, created_at DESC);
CREATE INDEX CONCURRENTLY idx_ai_operations_cost ON ai_operations(organization_id, cost_usd) WHERE cost_usd > 0;

-- Trust metrics indexes
CREATE INDEX CONCURRENTLY idx_trust_metrics_org_public ON trust_metrics(organization_id, is_public) WHERE is_public = TRUE;
CREATE INDEX CONCURRENTLY idx_trust_capsules_org_valid ON trust_capsules(organization_id, valid_from, valid_until) WHERE is_public = TRUE;
```

### 9.2 Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tenant-scoped tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE hs_work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE rest_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE ret_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_operations ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (implement for all tables)
CREATE POLICY tenant_isolation_organizations ON organizations
    FOR ALL TO authenticated
    USING (
        id IN (
            SELECT organization_id 
            FROM user_profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY tenant_isolation_customers ON customers
    FOR ALL TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id 
            FROM user_profiles 
            WHERE id = auth.uid()
        )
    );

-- Similar policies needed for all tenant-scoped tables...
```

### 9.3 Database Functions & Triggers

```sql
-- Updated timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language plpgsql;

-- Soft delete function
CREATE OR REPLACE FUNCTION soft_delete()
RETURNS TRIGGER AS $$
BEGIN
    NEW.deleted_at = NOW();
    NEW.deleted_by = auth.uid();
    RETURN NEW;
END;
$$ language plpgsql;

-- Audit logging trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
    old_data JSONB;
    new_data JSONB;
    changed_fields TEXT[];
BEGIN
    IF TG_OP = 'DELETE' THEN
        old_data = to_jsonb(OLD);
        INSERT INTO audit_logs (
            organization_id, table_name, record_id, operation, 
            old_values, user_id, ip_address
        ) VALUES (
            COALESCE(OLD.organization_id, NULL),
            TG_TABLE_NAME, OLD.id, TG_OP, 
            old_data, auth.uid(), inet_client_addr()
        );
        RETURN OLD;
    ELSIF TG_OP = 'INSERT' THEN
        new_data = to_jsonb(NEW);
        INSERT INTO audit_logs (
            organization_id, table_name, record_id, operation, 
            new_values, user_id, ip_address
        ) VALUES (
            COALESCE(NEW.organization_id, NULL),
            TG_TABLE_NAME, NEW.id, TG_OP, 
            new_data, auth.uid(), inet_client_addr()
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        old_data = to_jsonb(OLD);
        new_data = to_jsonb(NEW);
        
        -- Calculate changed fields
        SELECT array_agg(key) INTO changed_fields
        FROM jsonb_each(old_data) o
        WHERE o.value IS DISTINCT FROM (new_data->o.key);
        
        INSERT INTO audit_logs (
            organization_id, table_name, record_id, operation,
            old_values, new_values, changed_fields, user_id, ip_address
        ) VALUES (
            COALESCE(NEW.organization_id, OLD.organization_id),
            TG_TABLE_NAME, NEW.id, TG_OP,
            old_data, new_data, changed_fields, auth.uid(), inet_client_addr()
        );
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply triggers to all audited tables
CREATE TRIGGER audit_trigger AFTER INSERT OR UPDATE OR DELETE ON organizations FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_trigger AFTER INSERT OR UPDATE OR DELETE ON user_profiles FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_trigger AFTER INSERT OR UPDATE OR DELETE ON customers FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
-- ... (apply to all other tables)
```

---

## X. DEPLOYMENT & MAINTENANCE

### 10.1 Migration Strategy

```sql
-- Migration tracking table
CREATE TABLE schema_migrations (
    version TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    description TEXT,
    checksum TEXT
);

-- Example migration structure
-- migrations/001_initial_schema.sql
-- migrations/002_add_trust_system.sql
-- migrations/003_add_payroll_system.sql
-- etc.
```

### 10.2 Backup and Recovery

- **Daily automated backups** with point-in-time recovery
- **Cross-region backup replication** for disaster recovery
- **Regular restore testing** to ensure backup integrity
- **Automated backup verification** and monitoring

### 10.3 Monitoring and Alerting

- **Performance monitoring** for slow queries
- **Connection pool monitoring** and optimization
- **Storage growth tracking** and alerts
- **RLS policy performance** monitoring
- **Audit log retention** management

---

## Conclusion

This database architecture provides:

✅ **Multi-tenant scalability** with proper tenant isolation
✅ **Industry-specific optimization** while maintaining shared infrastructure  
✅ **Complete audit trail** for compliance and debugging
✅ **AI operation tracking** for billing and optimization
✅ **Trust verification system** for public credibility
✅ **Performance optimization** through strategic indexing
✅ **Security-first design** with RLS on every table
✅ **Flexible schema evolution** with JSONB fields for custom data

The architecture supports all current Thorbis applications (Home Services, Restaurants, Auto Services, Retail, Courses, Payroll, Books) while providing a foundation for future expansion into additional industries or features.

Each table includes proper audit trails, soft delete capabilities, and multi-tenant isolation. The design balances normalization for data integrity with denormalization for query performance, particularly in high-traffic areas like order processing and time tracking.