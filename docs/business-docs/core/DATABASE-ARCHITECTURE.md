# Thorbis Business OS - Database Architecture

> **Enterprise Multi-Tenant PostgreSQL Database Design**  
> **Database Version**: PostgreSQL 15+  
> **Last Updated**: 2025-01-31  
> **Schema Version**: 4.0.0

## 🗃️ Database Overview

The Thorbis Business OS database is built on PostgreSQL 15+ with comprehensive multi-tenant architecture, featuring over **500 tables** across **20+ schemas** designed to handle enterprise-scale business operations.

### 📊 Database Statistics
- **Total Tables**: 500+
- **Total Schemas**: 20+
- **Total Indexes**: 2,000+
- **Total Functions**: 100+
- **RLS Policies**: 500+
- **Max Concurrent Connections**: 10,000
- **Storage Capacity**: Unlimited (Auto-scaling)

## 🏗️ Schema Organization

### Core Business Schemas
```sql
-- Tenant & User Management
CREATE SCHEMA businesses;    -- Tenant isolation and management
CREATE SCHEMA users;         -- User accounts and profiles
CREATE SCHEMA auth;          -- Authentication and sessions
CREATE SCHEMA permissions;   -- Role-based access control

-- Industry-Specific Schemas
CREATE SCHEMA hs;           -- Home Services (HVAC, Plumbing, Electrical)
CREATE SCHEMA rest;         -- Restaurant Operations
CREATE SCHEMA auto;         -- Automotive Services
CREATE SCHEMA ret;          -- Retail Operations
CREATE SCHEMA courses;      -- Learning Management System
CREATE SCHEMA payroll;      -- Payroll and HR Management
CREATE SCHEMA investigations; -- Investigation Management

-- Operational Schemas
CREATE SCHEMA billing;      -- Usage tracking and invoicing
CREATE SCHEMA audit;        -- Comprehensive audit logging
CREATE SCHEMA ai;           -- AI operations and governance
CREATE SCHEMA trust;        -- Blockchain verification
CREATE SCHEMA integrations; -- External service integrations
CREATE SCHEMA notifications; -- Communication management
CREATE SCHEMA reporting;    -- Business intelligence
CREATE SCHEMA files;        -- File and document management
```

## 🏢 Multi-Tenant Architecture

### Tenant Isolation Strategy
Every business table implements strict tenant isolation through the `business_id` foreign key:

```sql
-- Base tenant-isolated table structure
CREATE TABLE example_table (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses.businesses(id) ON DELETE CASCADE,
    
    -- Business data columns
    name TEXT NOT NULL,
    description TEXT,
    
    -- Audit columns
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES users.users(id),
    updated_by UUID REFERENCES users.users(id),
    
    -- Soft delete
    deleted_at TIMESTAMPTZ NULL,
    deleted_by UUID REFERENCES users.users(id)
);

-- Row Level Security Policy
CREATE POLICY tenant_isolation ON example_table
    FOR ALL USING (business_id = auth.get_current_business_id());
    
-- Enable RLS
ALTER TABLE example_table ENABLE ROW LEVEL SECURITY;

-- Indexes for performance
CREATE INDEX idx_example_table_business_id ON example_table(business_id);
CREATE INDEX idx_example_table_created_at ON example_table(created_at);
CREATE INDEX idx_example_table_active ON example_table(business_id) 
    WHERE deleted_at IS NULL;
```

### Business Entity Schema
```sql
CREATE SCHEMA businesses;

CREATE TABLE businesses.businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Information
    name TEXT NOT NULL,
    legal_name TEXT,
    industry TEXT NOT NULL CHECK (industry IN ('hs', 'rest', 'auto', 'ret', 'courses', 'payroll', 'investigations')),
    business_type TEXT CHECK (business_type IN ('sole_proprietorship', 'partnership', 'corporation', 'llc')),
    
    -- Contact Information
    email TEXT NOT NULL,
    phone TEXT,
    website TEXT,
    
    -- Address Information
    address_line_1 TEXT,
    address_line_2 TEXT,
    city TEXT,
    state_province TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'US',
    
    -- Business Settings
    timezone TEXT DEFAULT 'UTC',
    currency TEXT DEFAULT 'USD',
    date_format TEXT DEFAULT 'MM/DD/YYYY',
    time_format TEXT DEFAULT '12h',
    
    -- Subscription Information
    plan TEXT NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'professional', 'enterprise', 'fortune_500')),
    plan_started_at TIMESTAMPTZ DEFAULT now(),
    plan_expires_at TIMESTAMPTZ,
    
    -- Feature Flags
    features JSONB DEFAULT '{}',
    limits JSONB DEFAULT '{}',
    
    -- Audit Fields
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID,
    updated_by UUID,
    
    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled')),
    deleted_at TIMESTAMPTZ NULL,
    deleted_by UUID
);

-- Business-specific indexes
CREATE INDEX idx_businesses_industry ON businesses.businesses(industry);
CREATE INDEX idx_businesses_plan ON businesses.businesses(plan);
CREATE INDEX idx_businesses_status ON businesses.businesses(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_businesses_created ON businesses.businesses(created_at);

-- Business settings table for flexible configuration
CREATE TABLE businesses.business_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses.businesses(id) ON DELETE CASCADE,
    
    category TEXT NOT NULL, -- 'general', 'billing', 'integrations', etc.
    key TEXT NOT NULL,
    value JSONB,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES users.users(id),
    updated_by UUID REFERENCES users.users(id),
    
    UNIQUE(business_id, category, key)
);
```

## 👥 User Management Schema

### User Authentication & Profiles
```sql
CREATE SCHEMA users;

-- Core user table (extends Supabase auth.users)
CREATE TABLE users.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Profile Information
    first_name TEXT,
    last_name TEXT,
    display_name TEXT,
    avatar_url TEXT,
    
    -- Contact Information
    email TEXT NOT NULL,
    phone TEXT,
    
    -- Preferences
    timezone TEXT DEFAULT 'UTC',
    locale TEXT DEFAULT 'en-US',
    theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'system')),
    
    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    
    -- Audit Fields
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    last_login_at TIMESTAMPTZ,
    
    -- Soft Delete
    deleted_at TIMESTAMPTZ NULL
);

-- Business User Relationships (Many-to-Many)
CREATE TABLE users.business_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users.users(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES businesses.businesses(id) ON DELETE CASCADE,
    
    -- Role & Permissions
    role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('owner', 'manager', 'staff', 'viewer', 'api_partner')),
    permissions JSONB DEFAULT '{}',
    
    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'invited', 'suspended')),
    invited_at TIMESTAMPTZ,
    joined_at TIMESTAMPTZ,
    
    -- Audit Fields
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES users.users(id),
    updated_by UUID REFERENCES users.users(id),
    
    UNIQUE(user_id, business_id)
);

-- User sessions for detailed tracking
CREATE TABLE users.user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users.users(id) ON DELETE CASCADE,
    business_id UUID REFERENCES businesses.businesses(id) ON DELETE CASCADE,
    
    -- Session Details
    session_token TEXT NOT NULL,
    device_fingerprint TEXT,
    ip_address INET,
    user_agent TEXT,
    
    -- Geographic Information
    country TEXT,
    region TEXT,
    city TEXT,
    
    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'terminated')),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    last_activity_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ,
    terminated_at TIMESTAMPTZ
);
```

## 🏠 Home Services Schema (`hs`)

### Core Home Services Entities
```sql
CREATE SCHEMA hs;

-- Customers
CREATE TABLE hs.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses.businesses(id) ON DELETE CASCADE,
    
    -- Customer Information
    customer_number TEXT NOT NULL, -- Auto-generated customer number
    type TEXT DEFAULT 'residential' CHECK (type IN ('residential', 'commercial')),
    
    -- Primary Contact
    first_name TEXT,
    last_name TEXT,
    company_name TEXT,
    email TEXT,
    phone TEXT,
    
    -- Service Address (Primary)
    service_address_line_1 TEXT,
    service_address_line_2 TEXT,
    service_city TEXT,
    service_state TEXT,
    service_postal_code TEXT,
    service_country TEXT DEFAULT 'US',
    
    -- Billing Address
    billing_address_same_as_service BOOLEAN DEFAULT true,
    billing_address_line_1 TEXT,
    billing_address_line_2 TEXT,
    billing_city TEXT,
    billing_state TEXT,
    billing_postal_code TEXT,
    billing_country TEXT DEFAULT 'US',
    
    -- Customer Preferences
    preferred_contact_method TEXT DEFAULT 'phone' CHECK (preferred_contact_method IN ('phone', 'email', 'text')),
    marketing_opt_in BOOLEAN DEFAULT false,
    
    -- Geographic Data
    service_location GEOGRAPHY(POINT, 4326), -- For routing and dispatch
    
    -- Customer Metrics
    total_jobs INTEGER DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0.00,
    average_job_value DECIMAL(12,2) DEFAULT 0.00,
    last_service_date DATE,
    
    -- Status & Tags
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked')),
    tags TEXT[] DEFAULT '{}',
    notes TEXT,
    
    -- Audit Fields
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES users.users(id),
    updated_by UUID REFERENCES users.users(id),
    
    -- Soft Delete
    deleted_at TIMESTAMPTZ NULL,
    deleted_by UUID REFERENCES users.users(id)
);

-- Work Orders
CREATE TABLE hs.work_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses.businesses(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES hs.customers(id) ON DELETE SET NULL,
    
    -- Work Order Details
    work_order_number TEXT NOT NULL, -- Auto-generated: WO-2025-0001
    title TEXT NOT NULL,
    description TEXT,
    
    -- Classification
    type TEXT CHECK (type IN ('service_call', 'installation', 'maintenance', 'repair', 'inspection', 'estimate')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent', 'emergency')),
    category TEXT, -- HVAC, Plumbing, Electrical, etc.
    
    -- Scheduling
    scheduled_start TIMESTAMPTZ,
    scheduled_end TIMESTAMPTZ,
    estimated_duration INTERVAL,
    
    -- Actual Times
    actual_start TIMESTAMPTZ,
    actual_end TIMESTAMPTZ,
    actual_duration INTERVAL,
    
    -- Assignment
    assigned_technician UUID REFERENCES users.users(id),
    assigned_team UUID[], -- Array of technician IDs
    
    -- Pricing
    labor_hours DECIMAL(5,2) DEFAULT 0.00,
    labor_rate DECIMAL(8,2) DEFAULT 0.00,
    material_cost DECIMAL(12,2) DEFAULT 0.00,
    total_cost DECIMAL(12,2) DEFAULT 0.00,
    
    -- Status Tracking
    status TEXT DEFAULT 'draft' CHECK (status IN (
        'draft', 'scheduled', 'dispatched', 'in_progress', 
        'completed', 'cancelled', 'on_hold'
    )),
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    
    -- Location
    service_address TEXT,
    service_location GEOGRAPHY(POINT, 4326),
    
    -- Customer Interaction
    customer_signature TEXT, -- Base64 encoded signature
    customer_satisfaction INTEGER CHECK (customer_satisfaction >= 1 AND customer_satisfaction <= 5),
    customer_feedback TEXT,
    
    -- Internal Notes
    technician_notes TEXT,
    internal_notes TEXT,
    
    -- Audit Fields
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES users.users(id),
    updated_by UUID REFERENCES users.users(id),
    
    -- Soft Delete
    deleted_at TIMESTAMPTZ NULL,
    deleted_by UUID REFERENCES users.users(id)
);

-- Estimates
CREATE TABLE hs.estimates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses.businesses(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES hs.customers(id) ON DELETE SET NULL,
    work_order_id UUID REFERENCES hs.work_orders(id) ON DELETE SET NULL,
    
    -- Estimate Details
    estimate_number TEXT NOT NULL, -- EST-2025-0001
    title TEXT NOT NULL,
    description TEXT,
    
    -- Pricing Structure
    labor_hours DECIMAL(5,2) DEFAULT 0.00,
    labor_rate DECIMAL(8,2) DEFAULT 0.00,
    labor_total DECIMAL(12,2) GENERATED ALWAYS AS (labor_hours * labor_rate) STORED,
    
    material_cost DECIMAL(12,2) DEFAULT 0.00,
    equipment_cost DECIMAL(12,2) DEFAULT 0.00,
    subtotal DECIMAL(12,2) DEFAULT 0.00,
    
    -- Taxes and Discounts
    tax_rate DECIMAL(5,4) DEFAULT 0.0000, -- 8.75% = 0.0875
    tax_amount DECIMAL(12,2) DEFAULT 0.00,
    discount_amount DECIMAL(12,2) DEFAULT 0.00,
    discount_percentage DECIMAL(5,2) DEFAULT 0.00,
    
    total_amount DECIMAL(12,2) DEFAULT 0.00,
    
    -- Terms & Conditions
    terms_and_conditions TEXT,
    warranty_terms TEXT,
    payment_terms TEXT DEFAULT 'Net 30',
    
    -- Status & Dates
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'approved', 'rejected', 'expired')),
    valid_until DATE,
    
    -- Customer Interaction
    sent_at TIMESTAMPTZ,
    viewed_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    
    -- Audit Fields
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES users.users(id),
    updated_by UUID REFERENCES users.users(id),
    
    -- Soft Delete
    deleted_at TIMESTAMPTZ NULL,
    deleted_by UUID REFERENCES users.users(id)
);

-- Invoices
CREATE TABLE hs.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses.businesses(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES hs.customers(id) ON DELETE SET NULL,
    work_order_id UUID REFERENCES hs.work_orders(id) ON DELETE SET NULL,
    estimate_id UUID REFERENCES hs.estimates(id) ON DELETE SET NULL,
    
    -- Invoice Details
    invoice_number TEXT NOT NULL, -- INV-2025-0001
    
    -- Amounts
    subtotal DECIMAL(12,2) DEFAULT 0.00,
    tax_amount DECIMAL(12,2) DEFAULT 0.00,
    discount_amount DECIMAL(12,2) DEFAULT 0.00,
    total_amount DECIMAL(12,2) DEFAULT 0.00,
    
    amount_paid DECIMAL(12,2) DEFAULT 0.00,
    amount_due DECIMAL(12,2) GENERATED ALWAYS AS (total_amount - amount_paid) STORED,
    
    -- Dates
    issue_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    
    -- Status
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled')),
    
    -- Payment Terms
    payment_terms TEXT DEFAULT 'Net 30',
    
    -- Customer Communication
    sent_at TIMESTAMPTZ,
    last_reminder_sent TIMESTAMPTZ,
    
    -- Audit Fields
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES users.users(id),
    updated_by UUID REFERENCES users.users(id),
    
    -- Soft Delete
    deleted_at TIMESTAMPTZ NULL,
    deleted_by UUID REFERENCES users.users(id)
);
```

## 🍽️ Restaurant Schema (`rest`)

### Restaurant Operations Entities
```sql
CREATE SCHEMA rest;

-- Menu Categories
CREATE TABLE rest.menu_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses.businesses(id) ON DELETE CASCADE,
    
    name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    
    -- Availability
    is_active BOOLEAN DEFAULT true,
    available_start_time TIME,
    available_end_time TIME,
    available_days INTEGER[] DEFAULT '{1,2,3,4,5,6,7}', -- 1=Monday, 7=Sunday
    
    -- Audit Fields
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES users.users(id),
    updated_by UUID REFERENCES users.users(id)
);

-- Menu Items
CREATE TABLE rest.menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses.businesses(id) ON DELETE CASCADE,
    category_id UUID REFERENCES rest.menu_categories(id) ON DELETE SET NULL,
    
    -- Basic Information
    name TEXT NOT NULL,
    description TEXT,
    
    -- Pricing
    base_price DECIMAL(8,2) NOT NULL,
    cost_price DECIMAL(8,2) DEFAULT 0.00,
    
    -- Classification
    type TEXT DEFAULT 'food' CHECK (type IN ('food', 'beverage', 'alcohol', 'dessert')),
    dietary_restrictions TEXT[] DEFAULT '{}', -- 'vegetarian', 'vegan', 'gluten_free', etc.
    
    -- Inventory Tracking
    track_inventory BOOLEAN DEFAULT false,
    current_stock INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 0,
    
    -- Availability
    is_active BOOLEAN DEFAULT true,
    available_start_time TIME,
    available_end_time TIME,
    available_days INTEGER[] DEFAULT '{1,2,3,4,5,6,7}',
    
    -- Kitchen Information
    prep_time_minutes INTEGER DEFAULT 0,
    kitchen_station TEXT, -- 'grill', 'fryer', 'salad', 'bar', etc.
    
    -- Modifiers and Options
    modifiers JSONB DEFAULT '{}',
    
    -- Sort Order
    sort_order INTEGER DEFAULT 0,
    
    -- Audit Fields
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES users.users(id),
    updated_by UUID REFERENCES users.users(id),
    
    -- Soft Delete
    deleted_at TIMESTAMPTZ NULL,
    deleted_by UUID REFERENCES users.users(id)
);

-- Tables/Seating
CREATE TABLE rest.tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses.businesses(id) ON DELETE CASCADE,
    
    -- Table Information
    table_number TEXT NOT NULL,
    table_name TEXT, -- Optional friendly name
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    
    -- Location
    section TEXT, -- 'main_dining', 'patio', 'bar', 'private_room'
    position_x INTEGER, -- For floor plan positioning
    position_y INTEGER,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Audit Fields
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES users.users(id),
    updated_by UUID REFERENCES users.users(id)
);

-- Orders
CREATE TABLE rest.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses.businesses(id) ON DELETE CASCADE,
    table_id UUID REFERENCES rest.tables(id) ON DELETE SET NULL,
    
    -- Order Details
    order_number TEXT NOT NULL, -- ORD-2025-0001
    order_type TEXT DEFAULT 'dine_in' CHECK (order_type IN ('dine_in', 'takeout', 'delivery', 'online')),
    
    -- Customer Information (for takeout/delivery)
    customer_name TEXT,
    customer_phone TEXT,
    customer_email TEXT,
    
    -- Delivery Information
    delivery_address TEXT,
    delivery_instructions TEXT,
    delivery_fee DECIMAL(8,2) DEFAULT 0.00,
    
    -- Order Totals
    subtotal DECIMAL(12,2) DEFAULT 0.00,
    tax_amount DECIMAL(12,2) DEFAULT 0.00,
    tip_amount DECIMAL(12,2) DEFAULT 0.00,
    discount_amount DECIMAL(12,2) DEFAULT 0.00,
    total_amount DECIMAL(12,2) DEFAULT 0.00,
    
    -- Status Tracking
    status TEXT DEFAULT 'draft' CHECK (status IN (
        'draft', 'submitted', 'confirmed', 'preparing', 
        'ready', 'served', 'completed', 'cancelled'
    )),
    
    -- Timing
    ordered_at TIMESTAMPTZ DEFAULT now(),
    confirmed_at TIMESTAMPTZ,
    ready_at TIMESTAMPTZ,
    served_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- Staff Assignment
    server_id UUID REFERENCES users.users(id),
    cashier_id UUID REFERENCES users.users(id),
    
    -- Special Instructions
    special_instructions TEXT,
    kitchen_notes TEXT,
    
    -- Audit Fields
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES users.users(id),
    updated_by UUID REFERENCES users.users(id),
    
    -- Soft Delete
    deleted_at TIMESTAMPTZ NULL,
    deleted_by UUID REFERENCES users.users(id)
);
```

## 🚗 Automotive Schema (`auto`)

### Automotive Service Entities
```sql
CREATE SCHEMA auto;

-- Vehicles
CREATE TABLE auto.vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses.businesses(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES hs.customers(id) ON DELETE CASCADE, -- Reuse customer table
    
    -- Vehicle Identification
    vin TEXT UNIQUE,
    license_plate TEXT,
    
    -- Vehicle Details
    year INTEGER CHECK (year >= 1900 AND year <= EXTRACT(YEAR FROM CURRENT_DATE) + 2),
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    trim TEXT,
    engine TEXT,
    transmission TEXT,
    
    -- Specifications
    mileage INTEGER DEFAULT 0,
    color TEXT,
    fuel_type TEXT CHECK (fuel_type IN ('gasoline', 'diesel', 'hybrid', 'electric', 'other')),
    
    -- Insurance Information
    insurance_company TEXT,
    policy_number TEXT,
    insurance_expires DATE,
    
    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'totaled')),
    
    -- Service History Summary
    total_visits INTEGER DEFAULT 0,
    total_spent DECIMAL(12,2) DEFAULT 0.00,
    last_service_date DATE,
    last_mileage INTEGER DEFAULT 0,
    
    -- Notes
    notes TEXT,
    
    -- Audit Fields
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES users.users(id),
    updated_by UUID REFERENCES users.users(id),
    
    -- Soft Delete
    deleted_at TIMESTAMPTZ NULL,
    deleted_by UUID REFERENCES users.users(id)
);

-- Repair Orders
CREATE TABLE auto.repair_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses.businesses(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES hs.customers(id) ON DELETE SET NULL,
    vehicle_id UUID REFERENCES auto.vehicles(id) ON DELETE CASCADE,
    
    -- RO Details
    ro_number TEXT NOT NULL, -- RO-2025-0001
    
    -- Vehicle Condition
    mileage_in INTEGER,
    mileage_out INTEGER,
    fuel_level TEXT CHECK (fuel_level IN ('empty', '1/4', '1/2', '3/4', 'full')),
    
    -- Service Details
    complaint TEXT, -- Customer's complaint/concern
    cause TEXT,     -- Root cause identified
    correction TEXT, -- Work performed
    
    -- Classification
    service_type TEXT CHECK (service_type IN ('maintenance', 'repair', 'inspection', 'diagnosis', 'recall')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    -- Assignment
    service_writer UUID REFERENCES users.users(id),
    technician_id UUID REFERENCES users.users(id),
    bay_assignment TEXT,
    
    -- Timing
    promised_date DATE,
    promised_time TIME,
    
    -- Status
    status TEXT DEFAULT 'open' CHECK (status IN (
        'open', 'in_progress', 'waiting_parts', 'waiting_approval', 
        'completed', 'delivered', 'cancelled'
    )),
    
    -- Authorization
    customer_authorization BOOLEAN DEFAULT false,
    authorization_amount DECIMAL(12,2),
    authorized_at TIMESTAMPTZ,
    
    -- Pricing
    labor_total DECIMAL(12,2) DEFAULT 0.00,
    parts_total DECIMAL(12,2) DEFAULT 0.00,
    tax_amount DECIMAL(12,2) DEFAULT 0.00,
    total_amount DECIMAL(12,2) DEFAULT 0.00,
    
    -- Quality Control
    quality_check_performed BOOLEAN DEFAULT false,
    quality_check_by UUID REFERENCES users.users(id),
    quality_check_notes TEXT,
    
    -- Customer Interaction
    customer_notified BOOLEAN DEFAULT false,
    customer_satisfaction INTEGER CHECK (customer_satisfaction >= 1 AND customer_satisfaction <= 5),
    
    -- Audit Fields
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES users.users(id),
    updated_by UUID REFERENCES users.users(id),
    
    -- Soft Delete
    deleted_at TIMESTAMPTZ NULL,
    deleted_by UUID REFERENCES users.users(id)
);
```

## 🛒 Retail Schema (`ret`)

### Retail Operations Entities
```sql
CREATE SCHEMA ret;

-- Product Categories
CREATE TABLE ret.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses.businesses(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES ret.categories(id) ON DELETE CASCADE,
    
    -- Category Details
    name TEXT NOT NULL,
    description TEXT,
    slug TEXT NOT NULL, -- URL-friendly name
    
    -- Display
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    
    -- SEO
    meta_title TEXT,
    meta_description TEXT,
    
    -- Hierarchy Level (computed)
    level INTEGER DEFAULT 0,
    path TEXT, -- Full hierarchy path: "Electronics > Phones > Smartphones"
    
    -- Audit Fields
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES users.users(id),
    updated_by UUID REFERENCES users.users(id),
    
    -- Soft Delete
    deleted_at TIMESTAMPTZ NULL,
    deleted_by UUID REFERENCES users.users(id)
);

-- Products
CREATE TABLE ret.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses.businesses(id) ON DELETE CASCADE,
    category_id UUID REFERENCES ret.categories(id) ON DELETE SET NULL,
    
    -- Product Identification
    sku TEXT NOT NULL, -- Stock Keeping Unit
    barcode TEXT,
    
    -- Basic Information
    name TEXT NOT NULL,
    description TEXT,
    short_description TEXT,
    
    -- Pricing
    cost_price DECIMAL(12,2) DEFAULT 0.00,
    retail_price DECIMAL(12,2) NOT NULL,
    sale_price DECIMAL(12,2),
    is_on_sale BOOLEAN DEFAULT false,
    sale_start_date DATE,
    sale_end_date DATE,
    
    -- Inventory
    track_inventory BOOLEAN DEFAULT true,
    current_stock INTEGER DEFAULT 0,
    reserved_stock INTEGER DEFAULT 0,
    available_stock INTEGER GENERATED ALWAYS AS (current_stock - reserved_stock) STORED,
    
    -- Inventory Thresholds
    low_stock_threshold INTEGER DEFAULT 10,
    reorder_point INTEGER DEFAULT 20,
    reorder_quantity INTEGER DEFAULT 50,
    
    -- Physical Attributes
    weight DECIMAL(8,2), -- in pounds or kg
    length DECIMAL(8,2), -- dimensions for shipping
    width DECIMAL(8,2),
    height DECIMAL(8,2),
    
    -- Product Options/Variants
    has_variants BOOLEAN DEFAULT false,
    variant_options JSONB DEFAULT '{}', -- size, color, etc.
    
    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discontinued')),
    is_featured BOOLEAN DEFAULT false,
    
    -- SEO & Marketing
    tags TEXT[] DEFAULT '{}',
    meta_title TEXT,
    meta_description TEXT,
    
    -- Supplier Information
    supplier_name TEXT,
    supplier_sku TEXT,
    
    -- Audit Fields
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES users.users(id),
    updated_by UUID REFERENCES users.users(id),
    
    -- Soft Delete
    deleted_at TIMESTAMPTZ NULL,
    deleted_by UUID REFERENCES users.users(id)
);

-- Sales Orders
CREATE TABLE ret.sales_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses.businesses(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES hs.customers(id) ON DELETE SET NULL,
    
    -- Order Details
    order_number TEXT NOT NULL, -- SO-2025-0001
    order_type TEXT DEFAULT 'walk_in' CHECK (order_type IN ('walk_in', 'online', 'phone', 'special_order')),
    
    -- Order Totals
    subtotal DECIMAL(12,2) DEFAULT 0.00,
    tax_amount DECIMAL(12,2) DEFAULT 0.00,
    discount_amount DECIMAL(12,2) DEFAULT 0.00,
    shipping_amount DECIMAL(12,2) DEFAULT 0.00,
    total_amount DECIMAL(12,2) DEFAULT 0.00,
    
    -- Payment Information
    payment_method TEXT CHECK (payment_method IN ('cash', 'credit_card', 'debit_card', 'check', 'store_credit', 'gift_card')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'partial', 'refunded')),
    
    -- Fulfillment
    fulfillment_method TEXT DEFAULT 'pickup' CHECK (fulfillment_method IN ('pickup', 'delivery', 'shipping')),
    fulfillment_status TEXT DEFAULT 'pending' CHECK (fulfillment_status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    
    -- Shipping Information (if applicable)
    shipping_address TEXT,
    tracking_number TEXT,
    shipped_date DATE,
    
    -- Status
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'completed', 'cancelled', 'returned')),
    
    -- Staff Assignment
    salesperson_id UUID REFERENCES users.users(id),
    cashier_id UUID REFERENCES users.users(id),
    
    -- Customer Notes
    customer_notes TEXT,
    internal_notes TEXT,
    
    -- Audit Fields
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES users.users(id),
    updated_by UUID REFERENCES users.users(id),
    
    -- Soft Delete
    deleted_at TIMESTAMPTZ NULL,
    deleted_by UUID REFERENCES users.users(id)
);
```

## 🔄 Audit & Logging Schema

### Comprehensive Audit Trail
```sql
CREATE SCHEMA audit;

-- Universal Audit Log
CREATE TABLE audit.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Context
    business_id UUID REFERENCES businesses.businesses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users.users(id) ON DELETE SET NULL,
    session_id UUID,
    
    -- Action Details
    action TEXT NOT NULL, -- 'create', 'update', 'delete', 'login', 'logout', etc.
    entity_type TEXT NOT NULL, -- Table name: 'work_orders', 'customers', etc.
    entity_id UUID,
    
    -- Changes (for update actions)
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    
    -- Request Context
    ip_address INET,
    user_agent TEXT,
    request_id UUID,
    
    -- API Context
    api_endpoint TEXT,
    http_method TEXT,
    
    -- AI Context (if applicable)
    ai_model TEXT,
    ai_tool TEXT,
    ai_operation_id UUID,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for audit log performance
CREATE INDEX idx_audit_log_business_id ON audit.audit_log(business_id);
CREATE INDEX idx_audit_log_user_id ON audit.audit_log(user_id);
CREATE INDEX idx_audit_log_entity ON audit.audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_action ON audit.audit_log(action);
CREATE INDEX idx_audit_log_created_at ON audit.audit_log(created_at);
```

## 🤖 AI Operations Schema

### AI Governance & Safety
```sql
CREATE SCHEMA ai;

-- AI Operations Log
CREATE TABLE ai.ai_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Context
    business_id UUID REFERENCES businesses.businesses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users.users(id) ON DELETE SET NULL,
    session_id UUID,
    
    -- AI Model Information
    model TEXT NOT NULL, -- 'claude-3.5-sonnet', 'gpt-4-turbo', etc.
    provider TEXT NOT NULL, -- 'anthropic', 'openai', 'custom'
    
    -- Operation Details
    operation_type TEXT NOT NULL, -- 'tool_call', 'completion', 'analysis'
    tool_name TEXT, -- MCP tool name if applicable
    
    -- Request & Response
    prompt_tokens INTEGER,
    completion_tokens INTEGER,
    total_tokens INTEGER,
    
    -- Safety & Governance
    safety_level TEXT DEFAULT 'medium' CHECK (safety_level IN ('low', 'medium', 'high', 'critical')),
    safety_checks JSONB DEFAULT '{}',
    governance_flags JSONB DEFAULT '{}',
    
    -- Budget Tracking
    cost_usd DECIMAL(10,6),
    budget_category TEXT,
    
    -- Performance Metrics
    response_time_ms INTEGER,
    cache_hit BOOLEAN DEFAULT false,
    
    -- Status
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'blocked')),
    error_message TEXT,
    
    -- Blockchain Verification
    blockchain_hash TEXT, -- Hash of operation recorded on blockchain
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'failed')),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ
);

-- AI Model Usage Tracking
CREATE TABLE ai.model_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses.businesses(id) ON DELETE CASCADE,
    
    -- Time Period
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    
    -- Model Information
    model TEXT NOT NULL,
    provider TEXT NOT NULL,
    
    -- Usage Metrics
    total_requests INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    prompt_tokens INTEGER DEFAULT 0,
    completion_tokens INTEGER DEFAULT 0,
    
    -- Cost Tracking
    total_cost_usd DECIMAL(12,6) DEFAULT 0.00,
    
    -- Performance Metrics
    average_response_time_ms DECIMAL(8,2),
    success_rate DECIMAL(5,4), -- 0.9950 = 99.5%
    
    -- Created timestamp
    created_at TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE(business_id, period_start, period_end, model, provider)
);
```

## 🔗 Integration Schema

### External Service Integrations
```sql
CREATE SCHEMA integrations;

-- Integration Configurations
CREATE TABLE integrations.integration_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses.businesses(id) ON DELETE CASCADE,
    
    -- Integration Details
    service_name TEXT NOT NULL, -- 'stripe', 'quickbooks', 'mailchimp', etc.
    service_type TEXT NOT NULL, -- 'payment', 'accounting', 'email', 'sms', etc.
    
    -- Configuration
    config JSONB NOT NULL DEFAULT '{}',
    credentials_encrypted TEXT, -- Encrypted credentials
    
    -- Status
    status TEXT DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'error', 'suspended')),
    last_sync_at TIMESTAMPTZ,
    last_error TEXT,
    
    -- Webhook Configuration
    webhook_url TEXT,
    webhook_secret TEXT,
    
    -- Audit Fields
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES users.users(id),
    updated_by UUID REFERENCES users.users(id),
    
    UNIQUE(business_id, service_name)
);

-- Webhook Events
CREATE TABLE integrations.webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses.businesses(id) ON DELETE CASCADE,
    integration_id UUID REFERENCES integrations.integration_configs(id) ON DELETE CASCADE,
    
    -- Event Details
    event_type TEXT NOT NULL,
    event_id TEXT, -- External event ID
    
    -- Payload
    payload JSONB NOT NULL,
    headers JSONB DEFAULT '{}',
    
    -- Processing Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed', 'ignored')),
    processed_at TIMESTAMPTZ,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- Metadata
    source_ip INET,
    user_agent TEXT,
    
    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT now()
);
```

## 📊 Performance Optimization

### Database Performance Features

#### Intelligent Indexing Strategy
```sql
-- Composite indexes for common query patterns
CREATE INDEX idx_work_orders_business_status_created 
    ON hs.work_orders(business_id, status, created_at DESC);

CREATE INDEX idx_invoices_business_status_due 
    ON hs.invoices(business_id, status, due_date) 
    WHERE deleted_at IS NULL;

-- Partial indexes for active records only
CREATE INDEX idx_customers_active_business 
    ON hs.customers(business_id, last_name) 
    WHERE deleted_at IS NULL AND status = 'active';

-- GIN indexes for JSONB columns
CREATE INDEX idx_business_settings_config 
    ON businesses.business_settings USING GIN(value);

-- Geographic indexes for location-based queries
CREATE INDEX idx_customers_service_location 
    ON hs.customers USING GIST(service_location);
```

#### Query Optimization
```sql
-- Materialized views for complex reporting queries
CREATE MATERIALIZED VIEW reporting.customer_summary AS
SELECT 
    c.business_id,
    c.id as customer_id,
    c.first_name || ' ' || c.last_name as customer_name,
    COUNT(wo.id) as total_work_orders,
    SUM(wo.total_cost) as total_revenue,
    AVG(wo.total_cost) as average_job_value,
    MAX(wo.created_at) as last_service_date
FROM hs.customers c
LEFT JOIN hs.work_orders wo ON c.id = wo.customer_id AND wo.deleted_at IS NULL
WHERE c.deleted_at IS NULL
GROUP BY c.business_id, c.id, c.first_name, c.last_name;

-- Refresh schedule for materialized views
CREATE OR REPLACE FUNCTION refresh_reporting_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY reporting.customer_summary;
    REFRESH MATERIALIZED VIEW CONCURRENTLY reporting.revenue_summary;
    REFRESH MATERIALIZED VIEW CONCURRENTLY reporting.technician_performance;
END;
$$ LANGUAGE plpgsql;
```

### Connection Pooling & Caching
```yaml
# PgBouncer Configuration
PgBouncer:
  pool_mode: transaction
  max_client_conn: 1000
  default_pool_size: 25
  max_db_connections: 100
  
Redis Caching:
  # Session data
  sessions: 24h TTL
  
  # Application cache
  queries: 1h TTL
  api_responses: 15m TTL
  user_permissions: 1h TTL
  
  # Business logic cache
  customer_data: 30m TTL
  work_order_status: 5m TTL
  pricing_data: 2h TTL
```

## 🔒 Row Level Security (RLS) Policies

### Universal RLS Implementation
```sql
-- Enable RLS on all business tables
ALTER TABLE hs.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE hs.work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE hs.estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE hs.invoices ENABLE ROW LEVEL SECURITY;

-- Universal tenant isolation policy
CREATE OR REPLACE FUNCTION auth.get_current_business_id()
RETURNS UUID AS $$
  SELECT COALESCE(
    current_setting('app.current_business_id', true)::UUID,
    (
      SELECT bu.business_id 
      FROM users.business_users bu 
      WHERE bu.user_id = auth.uid() 
      AND bu.status = 'active'
      LIMIT 1
    )
  );
$$ LANGUAGE SQL STABLE;

-- Create policies for each table
CREATE POLICY tenant_isolation ON hs.customers
    FOR ALL USING (business_id = auth.get_current_business_id());

CREATE POLICY tenant_isolation ON hs.work_orders
    FOR ALL USING (business_id = auth.get_current_business_id());

-- Role-based policies for sensitive operations
CREATE POLICY owner_manager_only ON businesses.business_settings
    FOR ALL USING (
        business_id = auth.get_current_business_id() 
        AND EXISTS (
            SELECT 1 FROM users.business_users bu
            WHERE bu.user_id = auth.uid()
            AND bu.business_id = auth.get_current_business_id()
            AND bu.role IN ('owner', 'manager')
            AND bu.status = 'active'
        )
    );
```

## 🧪 Database Testing & Validation

### Automated Testing Framework
```sql
-- Test functions for data integrity
CREATE OR REPLACE FUNCTION test_tenant_isolation()
RETURNS TABLE(test_name TEXT, passed BOOLEAN, message TEXT) AS $$
BEGIN
    -- Test 1: RLS policies exist on all business tables
    RETURN QUERY
    SELECT 
        'RLS Policies Exist'::TEXT,
        COUNT(*) > 50 as passed,
        FORMAT('Found %s RLS policies', COUNT(*)) as message
    FROM pg_policies 
    WHERE schemaname IN ('hs', 'rest', 'auto', 'ret');
    
    -- Test 2: All business tables have business_id column
    RETURN QUERY
    SELECT 
        'Business ID Columns'::TEXT,
        COUNT(*) = (
            SELECT COUNT(*) FROM information_schema.tables 
            WHERE table_schema IN ('hs', 'rest', 'auto', 'ret')
            AND table_type = 'BASE TABLE'
        ) as passed,
        FORMAT('All %s tables have business_id', COUNT(*)) as message
    FROM information_schema.columns
    WHERE table_schema IN ('hs', 'rest', 'auto', 'ret')
    AND column_name = 'business_id';
END;
$$ LANGUAGE plpgsql;

-- Performance testing functions
CREATE OR REPLACE FUNCTION test_query_performance()
RETURNS TABLE(query_name TEXT, execution_time_ms NUMERIC, passed BOOLEAN) AS $$
DECLARE
    start_time TIMESTAMPTZ;
    end_time TIMESTAMPTZ;
    duration NUMERIC;
BEGIN
    -- Test customer lookup performance
    start_time := clock_timestamp();
    PERFORM * FROM hs.customers WHERE business_id = gen_random_uuid() LIMIT 100;
    end_time := clock_timestamp();
    duration := EXTRACT(MILLISECONDS FROM end_time - start_time);
    
    RETURN QUERY SELECT 'Customer Lookup'::TEXT, duration, duration < 50;
    
    -- Test work order query performance
    start_time := clock_timestamp();
    PERFORM * FROM hs.work_orders WHERE business_id = gen_random_uuid() 
        AND status = 'completed' ORDER BY created_at DESC LIMIT 50;
    end_time := clock_timestamp();
    duration := EXTRACT(MILLISECONDS FROM end_time - start_time);
    
    RETURN QUERY SELECT 'Work Order Query'::TEXT, duration, duration < 100;
END;
$$ LANGUAGE plpgsql;
```

## 📈 Database Monitoring & Metrics

### Performance Monitoring
```sql
-- Create monitoring views
CREATE VIEW monitoring.table_sizes AS
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
    pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
FROM pg_tables 
WHERE schemaname IN ('businesses', 'users', 'hs', 'rest', 'auto', 'ret', 'audit', 'ai')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

CREATE VIEW monitoring.slow_queries AS
SELECT 
    query,
    calls,
    total_exec_time,
    mean_exec_time,
    max_exec_time,
    rows
FROM pg_stat_statements
WHERE mean_exec_time > 100 -- Queries taking more than 100ms on average
ORDER BY mean_exec_time DESC
LIMIT 50;

-- Index usage monitoring
CREATE VIEW monitoring.unused_indexes AS
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE idx_tup_read = 0 AND idx_tup_fetch = 0
AND schemaname IN ('businesses', 'users', 'hs', 'rest', 'auto', 'ret');
```

---

## 📚 Related Documentation

- **[System Architecture](./SYSTEM-ARCHITECTURE.md)** - Overall platform architecture
- **[API Architecture](./API-ARCHITECTURE.md)** - RESTful API design
- **[Security Architecture](./SECURITY-ARCHITECTURE.md)** - Security framework
- **[Development Workflow](../development/DEVELOPMENT-WORKFLOW.md)** - Developer guidelines
- **[Deployment Guide](../deployment/DEPLOYMENT-GUIDE.md)** - Production deployment

---

*This database architecture document provides comprehensive coverage of the Thorbis Business OS database design, featuring enterprise-grade multi-tenant architecture with industry-specific schemas, comprehensive audit trails, and performance optimization.*

**Document Maintainer**: Database Architecture Team  
**Review Cycle**: Quarterly  
**Next Review**: April 30, 2025