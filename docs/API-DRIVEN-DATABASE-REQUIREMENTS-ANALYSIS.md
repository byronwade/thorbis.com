# API-Driven Database Requirements Analysis

## Executive Summary

This document provides a comprehensive analysis of database table requirements extracted from existing API route files across the Thorbis Business OS monorepo. The analysis covers 7 major industries: Home Services (HS), Auto Services, Restaurant, Retail, Courses, Payroll, and Investigations, plus cross-cutting concerns like AI Chat and auditing.

**Key Findings:**
- **80+ distinct table structures** identified across industries
- **Multi-tenant architecture** with business_id isolation on all tables
- **Complex relational models** with deep industry-specific requirements
- **Advanced features** including AI integration, audit trails, and real-time capabilities
- **Scalability patterns** with pagination, caching, and performance optimization

## Database Architecture Overview

### Core Principles
- **Multi-tenant by default**: Every table includes `business_id` for tenant isolation
- **Row Level Security (RLS)**: All operations enforce RLS policies
- **Audit logging**: Every mutation tracked with full context
- **Soft deletes**: Trash/restore pattern for all destructive operations
- **Industry separation**: Schema-based separation (hs.*, auto.*, rest.*, retail.*, etc.)

### Cross-Cutting Shared Tables

#### 1. **shared.users**
```sql
CREATE TABLE shared.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES shared.businesses(id),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(50) NOT NULL DEFAULT 'staff',
  permissions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  password_hash VARCHAR(255),
  avatar_url TEXT,
  timezone VARCHAR(50) DEFAULT 'UTC',
  locale VARCHAR(10) DEFAULT 'en',
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES shared.users(id),
  updated_by UUID REFERENCES shared.users(id),
  version INTEGER DEFAULT 1
);
```

#### 2. **shared.businesses**
```sql
CREATE TABLE shared.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  legal_name VARCHAR(255),
  industry VARCHAR(50) NOT NULL,
  business_type VARCHAR(50),
  tax_id VARCHAR(50),
  phone VARCHAR(20),
  email VARCHAR(255),
  website TEXT,
  address JSONB, -- {street, city, state, zip, country}
  billing_address JSONB,
  logo_url TEXT,
  settings JSONB DEFAULT '{}',
  subscription_plan VARCHAR(50) DEFAULT 'starter',
  subscription_status VARCHAR(20) DEFAULT 'active',
  trial_ends_at TIMESTAMPTZ,
  usage_limits JSONB DEFAULT '{}',
  custom_fields JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  version INTEGER DEFAULT 1
);
```

#### 3. **shared.audit_logs**
```sql
CREATE TABLE shared.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES shared.businesses(id),
  user_id UUID NOT NULL REFERENCES shared.users(id),
  action VARCHAR(100) NOT NULL, -- 'created', 'updated', 'deleted', etc.
  entity_type VARCHAR(50) NOT NULL, -- 'work_order', 'customer', etc.
  entity_id UUID NOT NULL,
  old_values JSONB,
  new_values JSONB,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  request_id VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 4. **shared.notifications**
```sql
CREATE TABLE shared.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES shared.businesses(id),
  user_id UUID NOT NULL REFERENCES shared.users(id),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  channels VARCHAR[] DEFAULT ARRAY['app'], -- ['app', 'email', 'sms', 'push']
  priority VARCHAR(20) DEFAULT 'normal',
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Industry-Specific Database Requirements

## 1. Home Services (HS) Industry

### Core Tables

#### **hs.customers**
```sql
CREATE TABLE hs.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES shared.businesses(id),
  status VARCHAR(20) DEFAULT 'active', -- 'lead', 'active', 'inactive', 'archived'
  type VARCHAR(20) DEFAULT 'residential', -- 'residential', 'commercial'
  
  -- Contact Information
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  company_name VARCHAR(255),
  email VARCHAR(255),
  phone_primary VARCHAR(20) NOT NULL,
  phone_secondary VARCHAR(20),
  
  -- Address Information
  service_address JSONB NOT NULL, -- {street, street2, city, state, zip, coordinates: {lat, lng}, property_type, access_notes}
  billing_address JSONB, -- {street, street2, city, state, zip}
  
  -- Customer Preferences
  preferred_contact_method VARCHAR(20) DEFAULT 'phone', -- 'phone', 'email', 'text', 'app'
  communication_preferences JSONB DEFAULT '{}', -- {appointment_reminders, marketing_communications, service_updates}
  service_preferences JSONB DEFAULT '{}', -- {preferred_technician_id, preferred_time_window, special_instructions}
  
  -- Business Metrics
  lifetime_value DECIMAL(10,2) DEFAULT 0,
  total_jobs INTEGER DEFAULT 0,
  last_service_date TIMESTAMPTZ,
  next_service_due TIMESTAMPTZ,
  credit_limit DECIMAL(10,2),
  payment_terms VARCHAR(20), -- 'net_15', 'net_30', 'cod', 'credit_card'
  
  -- Equipment and Property
  equipment JSONB DEFAULT '[]', -- Array of equipment objects
  
  -- Classification and Marketing
  tags VARCHAR[] DEFAULT '{}',
  source VARCHAR(50) DEFAULT 'other', -- 'referral', 'website', 'marketing', 'cold_call', 'repeat', 'other'
  referral_source VARCHAR(255),
  
  -- AI and Analytics
  risk_score INTEGER, -- 0-100, higher = more likely to churn
  satisfaction_score INTEGER, -- 1-5 star equivalent
  ai_insights JSONB, -- {upsell_opportunities, churn_risk_factors, recommended_services, optimal_contact_time}
  
  -- Hardware Integration
  mobile_app_user BOOLEAN DEFAULT false,
  hardware_interactions JSONB, -- {qr_code_scanned, beacon_proximity, last_mobile_checkin}
  
  -- Audit fields
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES shared.users(id),
  updated_by UUID NOT NULL REFERENCES shared.users(id),
  version INTEGER DEFAULT 1
);
```

#### **hs.work_orders**
```sql
CREATE TABLE hs.work_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES shared.businesses(id),
  work_order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES hs.customers(id),
  assigned_technician_id UUID REFERENCES shared.users(id),
  
  -- Basic Information
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'emergency'
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'scheduled', 'in_progress', 'completed', 'cancelled'
  work_type VARCHAR(100),
  
  -- Scheduling
  scheduled_date DATE,
  scheduled_time_start TIME,
  scheduled_time_end TIME,
  actual_start_time TIMESTAMPTZ,
  actual_end_time TIMESTAMPTZ,
  estimated_duration INTEGER, -- minutes
  
  -- Location
  service_address JSONB, -- Can override customer's default address
  
  -- Financial
  estimated_total DECIMAL(10,2),
  actual_total DECIMAL(10,2),
  
  -- Customer Interaction
  notes TEXT,
  internal_notes TEXT,
  photos VARCHAR[] DEFAULT '{}', -- Array of photo URLs
  signature_url TEXT,
  customer_rating INTEGER, -- 1-5 stars
  customer_feedback TEXT,
  
  -- Metadata
  tags VARCHAR[] DEFAULT '{}',
  custom_fields JSONB DEFAULT '{}',
  
  -- Audit fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES shared.users(id),
  updated_by UUID NOT NULL REFERENCES shared.users(id),
  version INTEGER DEFAULT 1
);
```

#### **hs.work_order_items**
```sql
CREATE TABLE hs.work_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id UUID NOT NULL REFERENCES hs.work_orders(id),
  service_id UUID, -- Reference to service catalog
  type VARCHAR(20) NOT NULL, -- 'service', 'part', 'labor', 'material'
  name VARCHAR(255) NOT NULL,
  description TEXT,
  quantity DECIMAL(10,3) DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  tax_rate DECIMAL(5,4) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  is_taxable BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **hs.technicians**
```sql
CREATE TABLE hs.technicians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES shared.businesses(id),
  user_id UUID NOT NULL REFERENCES shared.users(id),
  employee_id VARCHAR(50),
  
  -- Professional Information
  skills VARCHAR[] DEFAULT '{}', -- Array of skill codes
  certifications JSONB DEFAULT '[]', -- Array of certification objects
  service_areas VARCHAR[] DEFAULT '{}', -- ZIP codes or regions
  hourly_rate DECIMAL(8,2),
  
  -- Scheduling
  working_hours JSONB, -- {monday: {start, end, available}, ...}
  max_daily_appointments INTEGER DEFAULT 8,
  travel_radius_miles INTEGER DEFAULT 25,
  
  -- Vehicle and Equipment
  vehicle_info JSONB, -- {make, model, year, license_plate, capacity}
  tools_equipment JSONB DEFAULT '[]',
  
  -- Performance
  avg_completion_time INTEGER, -- minutes
  customer_rating DECIMAL(3,2), -- average rating
  total_jobs_completed INTEGER DEFAULT 0,
  
  -- Status
  current_status VARCHAR(20) DEFAULT 'available', -- 'available', 'busy', 'offline', 'on_break'
  last_location JSONB, -- {lat, lng, updated_at}
  
  -- Audit fields
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Scheduling and Dispatch Tables

#### **hs.scheduled_appointments**
```sql
CREATE TABLE hs.scheduled_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES shared.businesses(id),
  work_order_id UUID NOT NULL REFERENCES hs.work_orders(id),
  customer_id UUID NOT NULL REFERENCES hs.customers(id),
  technician_id UUID NOT NULL REFERENCES hs.technicians(id),
  
  -- Scheduling Information
  scheduled_date DATE NOT NULL,
  scheduled_start_time TIME NOT NULL,
  scheduled_end_time TIME NOT NULL,
  estimated_duration INTEGER NOT NULL, -- minutes
  actual_start_time TIMESTAMPTZ,
  actual_end_time TIMESTAMPTZ,
  actual_duration INTEGER,
  
  -- Status and Priority
  status VARCHAR(20) DEFAULT 'scheduled', -- 'scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rescheduled', 'no_show'
  priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'emergency'
  urgency_score INTEGER DEFAULT 50, -- 0-100, calculated by AI
  
  -- Service Details
  service_type VARCHAR(100) NOT NULL,
  service_codes VARCHAR[] DEFAULT '{}',
  required_skills VARCHAR[] DEFAULT '{}',
  required_parts JSONB DEFAULT '[]',
  
  -- Location and Travel
  service_address JSONB NOT NULL,
  travel_time_to INTEGER, -- minutes from previous appointment
  travel_time_from INTEGER, -- minutes to next appointment
  mileage DECIMAL(8,2),
  
  -- Customer Communication
  customer_contact JSONB NOT NULL, -- {name, phone, email, preferred_contact_method}
  appointment_window JSONB, -- {type, start_time, end_time}
  
  -- Notifications and Reminders
  reminder_sent BOOLEAN DEFAULT false,
  reminder_sent_date TIMESTAMPTZ,
  confirmation_requested BOOLEAN DEFAULT false,
  confirmation_received BOOLEAN,
  confirmation_date TIMESTAMPTZ,
  
  -- Special Requirements
  special_instructions TEXT,
  requires_ladder BOOLEAN DEFAULT false,
  requires_permit BOOLEAN DEFAULT false,
  customer_must_be_present BOOLEAN DEFAULT true,
  pet_on_site BOOLEAN,
  senior_customer BOOLEAN DEFAULT false,
  
  -- AI Optimization Data
  ai_scheduled BOOLEAN DEFAULT false,
  optimization_score INTEGER, -- How well this fits the schedule
  alternative_slots JSONB, -- Array of alternative time slot objects
  
  -- Performance Tracking
  sla_target INTEGER, -- minutes
  sla_actual INTEGER,
  sla_met BOOLEAN,
  customer_satisfaction_score INTEGER, -- 1-5
  
  -- Integration Data
  calendar_event_id VARCHAR(255),
  external_booking_id VARCHAR(255),
  dispatch_notes TEXT,
  
  -- Audit fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES shared.users(id),
  updated_by UUID NOT NULL REFERENCES shared.users(id),
  schedule_version INTEGER DEFAULT 1
);
```

#### **hs.technician_availability**
```sql
CREATE TABLE hs.technician_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES shared.businesses(id),
  technician_id UUID NOT NULL REFERENCES hs.technicians(id),
  date DATE NOT NULL,
  
  -- Time Slot Management
  time_slots JSONB NOT NULL, -- Array of time slot objects
  working_hours JSONB NOT NULL, -- {start, end}
  max_appointments INTEGER DEFAULT 8,
  
  -- Capacity and Skills
  skills VARCHAR[] DEFAULT '{}',
  service_areas VARCHAR[] DEFAULT '{}',
  vehicle_capacity JSONB, -- {max_parts_weight, max_parts_volume}
  
  -- Status
  is_available BOOLEAN DEFAULT true,
  reason_unavailable TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(technician_id, date)
);
```

## 2. Auto Services Industry

### Core Tables

#### **auto.customers**
```sql
CREATE TABLE auto.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES shared.businesses(id),
  
  -- Basic Information
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  company_name VARCHAR(255),
  customer_type VARCHAR(20) DEFAULT 'individual', -- 'individual', 'business', 'fleet'
  
  -- Contact Information
  email VARCHAR(255),
  phone_primary VARCHAR(20) NOT NULL,
  phone_secondary VARCHAR(20),
  preferred_contact_method VARCHAR(20) DEFAULT 'phone',
  
  -- Address
  address JSONB NOT NULL, -- {street, city, state, zip}
  billing_address JSONB,
  
  -- Business Metrics
  total_visits INTEGER DEFAULT 0,
  lifetime_value DECIMAL(10,2) DEFAULT 0,
  last_visit_date TIMESTAMPTZ,
  
  -- Preferences
  communication_preferences JSONB DEFAULT '{}',
  service_preferences JSONB DEFAULT '{}',
  
  -- Marketing
  tags VARCHAR[] DEFAULT '{}',
  source VARCHAR(50) DEFAULT 'walk_in',
  referral_source VARCHAR(255),
  
  -- Audit fields
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES shared.users(id),
  updated_by UUID NOT NULL REFERENCES shared.users(id)
);
```

#### **auto.vehicles**
```sql
CREATE TABLE auto.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES shared.businesses(id),
  customer_id UUID NOT NULL REFERENCES auto.customers(id),
  
  -- Vehicle Identification
  vin VARCHAR(17) UNIQUE,
  year INTEGER NOT NULL,
  make VARCHAR(50) NOT NULL,
  model VARCHAR(50) NOT NULL,
  trim VARCHAR(50),
  engine VARCHAR(100),
  transmission VARCHAR(100),
  drive_type VARCHAR(20), -- 'FWD', 'RWD', 'AWD', '4WD'
  
  -- Registration
  license_plate VARCHAR(20),
  registration_state VARCHAR(2),
  registration_expires DATE,
  
  -- Physical Attributes
  color VARCHAR(50),
  mileage INTEGER,
  fuel_type VARCHAR(20), -- 'gasoline', 'diesel', 'hybrid', 'electric'
  
  -- Service Information
  last_service_date TIMESTAMPTZ,
  next_service_due_date TIMESTAMPTZ,
  next_service_due_mileage INTEGER,
  service_interval_miles INTEGER DEFAULT 5000,
  service_interval_months INTEGER DEFAULT 6,
  
  -- Insurance
  insurance_company VARCHAR(255),
  policy_number VARCHAR(100),
  insurance_expires DATE,
  
  -- Notes and History
  notes TEXT,
  service_history_summary TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **auto.repair_orders**
```sql
CREATE TABLE auto.repair_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES shared.businesses(id),
  ro_number VARCHAR(50) UNIQUE NOT NULL,
  
  -- Vehicle and Customer Information
  vehicle_id UUID NOT NULL REFERENCES auto.vehicles(id),
  customer_id UUID NOT NULL REFERENCES auto.customers(id),
  vin VARCHAR(17),
  year INTEGER NOT NULL,
  make VARCHAR(50) NOT NULL,
  model VARCHAR(50) NOT NULL,
  engine VARCHAR(100),
  transmission VARCHAR(100),
  mileage_in INTEGER NOT NULL,
  mileage_out INTEGER,
  license_plate VARCHAR(20),
  color VARCHAR(50),
  
  -- Service Information
  service_advisor_id UUID NOT NULL REFERENCES shared.users(id),
  technician_id UUID REFERENCES shared.users(id),
  service_type VARCHAR(50) NOT NULL, -- 'maintenance', 'repair', 'diagnostic', 'inspection', 'bodywork', 'tire_service'
  
  -- Status and Workflow
  status VARCHAR(30) DEFAULT 'estimate', -- 'estimate', 'awaiting_authorization', 'authorized', 'in_progress', 'waiting_parts', 'waiting_customer', 'completed', 'invoiced', 'delivered', 'warranty', 'cancelled'
  priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'emergency', 'insurance_rental'
  
  -- Customer Input and Findings
  customer_concerns TEXT[] DEFAULT '{}',
  customer_requests TEXT[] DEFAULT '{}',
  cause_findings TEXT[] DEFAULT '{}',
  corrections_made TEXT[] DEFAULT '{}',
  
  -- Authorization and Timing
  estimated_completion_date TIMESTAMPTZ,
  actual_completion_date TIMESTAMPTZ,
  authorization_limit DECIMAL(10,2),
  customer_authorized_amount DECIMAL(10,2),
  authorization_date TIMESTAMPTZ,
  authorized_by VARCHAR(255),
  
  -- Financial Totals
  labor_total DECIMAL(10,2) DEFAULT 0,
  parts_total DECIMAL(10,2) DEFAULT 0,
  sublet_total DECIMAL(10,2) DEFAULT 0,
  shop_supplies_total DECIMAL(10,2) DEFAULT 0,
  subtotal DECIMAL(10,2) DEFAULT 0,
  tax_rate DECIMAL(5,4) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) DEFAULT 0,
  
  -- Payment Information
  payment_method VARCHAR(20), -- 'cash', 'check', 'credit_card', 'insurance', 'warranty', 'internal'
  insurance_claim_number VARCHAR(100),
  insurance_company VARCHAR(255),
  deductible_amount DECIMAL(10,2),
  
  -- Vehicle Condition
  vehicle_condition_in TEXT,
  vehicle_condition_out TEXT,
  
  -- Service Bay and Scheduling
  service_bay VARCHAR(20),
  scheduled_start_time TIMESTAMPTZ,
  actual_start_time TIMESTAMPTZ,
  scheduled_end_time TIMESTAMPTZ,
  actual_end_time TIMESTAMPTZ,
  
  -- Quality Control
  quality_control_performed BOOLEAN DEFAULT false,
  quality_control_by UUID REFERENCES shared.users(id),
  quality_control_date TIMESTAMPTZ,
  customer_satisfaction_rating INTEGER, -- 1-5
  
  -- Warranty and Comebacks
  warranty_work BOOLEAN DEFAULT false,
  warranty_claim_number VARCHAR(100),
  comeback_related_to VARCHAR(50), -- Previous RO number
  is_comeback BOOLEAN DEFAULT false,
  
  -- Documentation
  photos JSONB DEFAULT '[]', -- Array of photo objects
  documents JSONB DEFAULT '[]', -- Array of document objects
  
  -- Environmental and Safety
  hazmat_disposed TEXT[] DEFAULT '{}',
  environmental_fees DECIMAL(8,2) DEFAULT 0,
  safety_concerns TEXT[] DEFAULT '{}',
  
  -- Integration Data
  diagnostic_codes JSONB DEFAULT '[]', -- Array of diagnostic code objects
  scan_tool_data JSONB, -- {tool_used, data_file_url, extracted_date}
  
  -- Customer Communication
  customer_notifications_sent VARCHAR[] DEFAULT '{}',
  last_customer_update TIMESTAMPTZ,
  customer_contact_preference VARCHAR(20) DEFAULT 'phone',
  
  -- Internal Notes
  internal_notes TEXT,
  technician_notes TEXT,
  service_advisor_notes TEXT,
  
  -- Audit fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES shared.users(id),
  updated_by UUID NOT NULL REFERENCES shared.users(id),
  version INTEGER DEFAULT 1
);
```

#### **auto.repair_order_line_items**
```sql
CREATE TABLE auto.repair_order_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repair_order_id UUID NOT NULL REFERENCES auto.repair_orders(id),
  type VARCHAR(20) NOT NULL, -- 'labor', 'part', 'sublet', 'shop_supply', 'diagnostic', 'environmental_fee'
  
  -- Labor Items
  labor_operation_code VARCHAR(20), -- Mitchell, AllData, etc.
  labor_description TEXT,
  labor_hours_quoted DECIMAL(5,2),
  labor_hours_actual DECIMAL(5,2),
  labor_rate DECIMAL(8,2),
  technician_id UUID REFERENCES shared.users(id),
  skill_level CHAR(1), -- 'a', 'b', 'c', 'd'
  
  -- Part Items
  part_number VARCHAR(100),
  part_description TEXT,
  manufacturer VARCHAR(100),
  part_type VARCHAR(20), -- 'oem', 'aftermarket', 'used', 'remanufactured'
  quantity DECIMAL(8,3) NOT NULL DEFAULT 1,
  unit_cost DECIMAL(10,2) NOT NULL,
  markup_percentage DECIMAL(5,2) DEFAULT 0,
  total_cost DECIMAL(10,2) NOT NULL,
  
  -- Part Sourcing
  supplier VARCHAR(255),
  supplier_part_number VARCHAR(100),
  expected_delivery_date DATE,
  actual_delivery_date DATE,
  part_status VARCHAR(20) DEFAULT 'quoted', -- 'quoted', 'ordered', 'backordered', 'delivered', 'installed', 'returned'
  
  -- Warranty Information
  warranty_months INTEGER,
  warranty_miles INTEGER,
  warranty_type VARCHAR(20), -- 'parts', 'labor', 'parts_and_labor'
  
  -- Quality and Compliance
  core_required BOOLEAN DEFAULT false,
  core_charge DECIMAL(8,2),
  environmental_fee DECIMAL(8,2),
  hazmat BOOLEAN DEFAULT false,
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **auto.vehicle_inspections**
```sql
CREATE TABLE auto.vehicle_inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES shared.businesses(id),
  repair_order_id UUID REFERENCES auto.repair_orders(id),
  vehicle_id UUID NOT NULL REFERENCES auto.vehicles(id),
  inspection_type VARCHAR(30) NOT NULL, -- 'multipoint', 'safety', 'emissions', 'pre_delivery', 'quality_control'
  inspector_id UUID NOT NULL REFERENCES shared.users(id),
  inspection_date TIMESTAMPTZ DEFAULT NOW(),
  
  -- Inspection Results
  overall_condition VARCHAR(20) NOT NULL, -- 'excellent', 'good', 'fair', 'poor', 'unsafe'
  systems_checked JSONB NOT NULL, -- Array of system check objects
  
  -- Recommendations
  immediate_repairs TEXT[] DEFAULT '{}',
  recommended_services TEXT[] DEFAULT '{}',
  future_maintenance JSONB DEFAULT '[]', -- Array of future maintenance objects
  
  -- Customer Interaction
  customer_notified BOOLEAN DEFAULT false,
  customer_approved TEXT[] DEFAULT '{}', -- Which recommendations were approved
  
  -- Digital Signature
  digital_signature JSONB, -- {signature_data, signed_date, ip_address}
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **auto.parts**
```sql
CREATE TABLE auto.parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES shared.businesses(id),
  part_number VARCHAR(100) NOT NULL,
  manufacturer_part_number VARCHAR(100),
  
  -- Basic Information
  name VARCHAR(255) NOT NULL,
  description TEXT,
  manufacturer VARCHAR(100),
  category VARCHAR(100),
  part_type VARCHAR(20) DEFAULT 'oem', -- 'oem', 'aftermarket', 'used', 'remanufactured'
  
  -- Inventory
  quantity_on_hand INTEGER DEFAULT 0,
  quantity_reserved INTEGER DEFAULT 0,
  quantity_on_order INTEGER DEFAULT 0,
  reorder_level INTEGER DEFAULT 0,
  reorder_quantity INTEGER DEFAULT 0,
  
  -- Pricing
  cost DECIMAL(10,2) NOT NULL,
  list_price DECIMAL(10,2),
  markup_percentage DECIMAL(5,2) DEFAULT 0,
  
  -- Physical Properties
  weight DECIMAL(8,3),
  dimensions JSONB, -- {length, width, height, unit}
  
  -- Supplier Information
  preferred_supplier VARCHAR(255),
  supplier_part_number VARCHAR(100),
  lead_time_days INTEGER,
  
  -- Core and Warranty
  core_required BOOLEAN DEFAULT false,
  core_charge DECIMAL(8,2),
  warranty_months INTEGER,
  warranty_miles INTEGER,
  
  -- Compatibility
  vehicle_applications JSONB DEFAULT '[]', -- Array of vehicle application objects
  
  -- Status and Metadata
  is_active BOOLEAN DEFAULT true,
  is_hazmat BOOLEAN DEFAULT false,
  bin_location VARCHAR(50),
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(business_id, part_number)
);
```

#### **auto.service_bays**
```sql
CREATE TABLE auto.service_bays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES shared.businesses(id),
  bay_number VARCHAR(20) NOT NULL,
  bay_name VARCHAR(100),
  
  -- Capabilities
  bay_type VARCHAR(30) NOT NULL, -- 'general', 'lift', 'alignment', 'tire', 'express', 'diagnostic'
  max_vehicle_length DECIMAL(6,2), -- feet
  max_vehicle_height DECIMAL(6,2), -- feet
  lift_capacity INTEGER, -- pounds
  
  -- Equipment
  equipment JSONB DEFAULT '[]', -- Array of equipment objects
  tools_available JSONB DEFAULT '[]',
  
  -- Scheduling
  is_available BOOLEAN DEFAULT true,
  maintenance_scheduled BOOLEAN DEFAULT false,
  hourly_rate DECIMAL(8,2),
  
  -- Status
  current_status VARCHAR(20) DEFAULT 'available', -- 'available', 'occupied', 'maintenance', 'blocked'
  current_repair_order_id UUID REFERENCES auto.repair_orders(id),
  occupied_since TIMESTAMPTZ,
  
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(business_id, bay_number)
);
```

## 3. Restaurant Industry

### Core Tables

#### **rest.customers**
```sql
CREATE TABLE rest.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES shared.businesses(id),
  
  -- Basic Information
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  date_of_birth DATE,
  
  -- Preferences
  dietary_restrictions TEXT[] DEFAULT '{}',
  allergies TEXT[] DEFAULT '{}',
  preferred_seating VARCHAR(30), -- 'booth', 'table', 'bar', 'patio', 'private_room'
  communication_preferences JSONB DEFAULT '{}',
  
  -- Loyalty and Marketing
  loyalty_points INTEGER DEFAULT 0,
  total_visits INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  first_visit_date TIMESTAMPTZ,
  last_visit_date TIMESTAMPTZ,
  average_order_value DECIMAL(8,2),
  favorite_items JSONB DEFAULT '[]',
  
  -- Contact Information
  address JSONB,
  emergency_contact JSONB, -- {name, phone, relationship}
  
  -- Status
  is_vip BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **rest.tables**
```sql
CREATE TABLE rest.tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES shared.businesses(id),
  table_number VARCHAR(20) NOT NULL,
  
  -- Physical Properties
  capacity INTEGER NOT NULL,
  location VARCHAR(50), -- 'dining_room', 'bar', 'patio', 'private_room'
  section VARCHAR(50),
  shape VARCHAR(20), -- 'round', 'square', 'rectangle', 'booth'
  
  -- Features
  is_accessible BOOLEAN DEFAULT false,
  has_power_outlet BOOLEAN DEFAULT false,
  has_tv_view BOOLEAN DEFAULT false,
  is_window_seat BOOLEAN DEFAULT false,
  
  -- Status
  status VARCHAR(20) DEFAULT 'available', -- 'available', 'occupied', 'reserved', 'cleaning', 'out_of_service'
  current_order_id UUID,
  occupied_since TIMESTAMPTZ,
  last_cleaned TIMESTAMPTZ,
  
  -- Metadata
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(business_id, table_number)
);
```

#### **rest.orders**
```sql
CREATE TABLE rest.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES shared.businesses(id),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  
  -- Customer and Table Information
  table_id UUID REFERENCES rest.tables(id),
  customer_id UUID REFERENCES rest.customers(id),
  order_type VARCHAR(20) DEFAULT 'dine_in', -- 'dine_in', 'takeout', 'delivery', 'curbside'
  
  -- Order Details
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled'
  customer_count INTEGER DEFAULT 1,
  server_name VARCHAR(100),
  
  -- Financial Information
  subtotal DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  tip_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) DEFAULT 0,
  
  -- Payment Information
  payment_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'refunded', 'failed'
  payment_method VARCHAR(20), -- 'cash', 'credit_card', 'debit_card', 'gift_card', 'comp'
  
  -- Service Information
  special_instructions TEXT,
  delivery_address JSONB, -- {street, city, state, zip, instructions}
  estimated_ready_time TIMESTAMPTZ,
  actual_ready_time TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
```

#### **rest.order_items**
```sql
CREATE TABLE rest.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES rest.orders(id),
  menu_item_id UUID, -- References menu items table
  
  -- Item Information
  name VARCHAR(255) NOT NULL,
  price DECIMAL(8,2) NOT NULL,
  quantity INTEGER DEFAULT 1,
  
  -- Customization
  modifiers JSONB DEFAULT '[]', -- Array of modifier objects {name, price}
  special_instructions TEXT,
  
  -- Kitchen Status
  status VARCHAR(20) DEFAULT 'ordered', -- 'ordered', 'preparing', 'ready', 'served', 'cancelled'
  kitchen_notes TEXT,
  prep_time_minutes INTEGER,
  
  -- Timestamps
  ordered_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  served_at TIMESTAMPTZ
);
```

#### **rest.menu_categories**
```sql
CREATE TABLE rest.menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES shared.businesses(id),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(business_id, name)
);
```

#### **rest.menu_items**
```sql
CREATE TABLE rest.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES shared.businesses(id),
  category_id UUID NOT NULL REFERENCES rest.menu_categories(id),
  
  -- Basic Information
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(8,2) NOT NULL,
  cost DECIMAL(8,2), -- Cost to make
  
  -- Classification
  item_type VARCHAR(30), -- 'appetizer', 'entree', 'dessert', 'beverage', 'side'
  dietary_tags VARCHAR[] DEFAULT '{}', -- 'vegetarian', 'vegan', 'gluten_free', 'dairy_free', 'spicy'
  
  -- Kitchen Information
  prep_time_minutes INTEGER DEFAULT 15,
  cooking_method VARCHAR(50), -- 'grilled', 'fried', 'baked', 'raw', 'steamed'
  kitchen_station VARCHAR(30), -- 'grill', 'saute', 'fryer', 'cold', 'pastry'
  
  -- Inventory
  track_inventory BOOLEAN DEFAULT false,
  current_stock INTEGER,
  ingredients JSONB DEFAULT '[]', -- Array of ingredient objects
  
  -- Availability
  is_available BOOLEAN DEFAULT true,
  available_days INTEGER DEFAULT 127, -- Bitmask for days of week (1=Monday, 2=Tuesday, etc.)
  available_times JSONB, -- {start_time, end_time} or array for multiple periods
  
  -- Modifiers
  available_modifiers JSONB DEFAULT '[]', -- Array of modifier group objects
  
  -- Marketing
  is_featured BOOLEAN DEFAULT false,
  is_popular BOOLEAN DEFAULT false,
  calories INTEGER,
  image_url TEXT,
  
  -- Display
  display_order INTEGER DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **rest.reservations**
```sql
CREATE TABLE rest.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES shared.businesses(id),
  customer_id UUID REFERENCES rest.customers(id),
  
  -- Reservation Details
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  party_size INTEGER NOT NULL,
  duration_minutes INTEGER DEFAULT 90,
  
  -- Contact Information (for walk-ins without customer record)
  contact_name VARCHAR(100),
  contact_phone VARCHAR(20),
  contact_email VARCHAR(255),
  
  -- Preferences
  seating_preference VARCHAR(30),
  special_requests TEXT,
  occasion VARCHAR(50), -- 'birthday', 'anniversary', 'business', 'date', 'family'
  
  -- Status
  status VARCHAR(20) DEFAULT 'confirmed', -- 'pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show'
  table_id UUID REFERENCES rest.tables(id),
  seated_at TIMESTAMPTZ,
  
  -- Internal Notes
  internal_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 4. Retail Industry

### Core Tables

#### **retail.categories**
```sql
CREATE TABLE retail.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES shared.businesses(id),
  parent_category_id UUID REFERENCES retail.categories(id),
  
  -- Basic Information
  name VARCHAR(100) NOT NULL,
  description TEXT,
  handle VARCHAR(100), -- URL slug
  
  -- SEO
  seo_title VARCHAR(255),
  seo_description TEXT,
  meta_keywords TEXT,
  
  -- Display
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(business_id, handle)
);
```

#### **retail.brands**
```sql
CREATE TABLE retail.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES shared.businesses(id),
  
  -- Basic Information
  name VARCHAR(100) NOT NULL,
  description TEXT,
  logo_url TEXT,
  website TEXT,
  
  -- Contact
  contact_person VARCHAR(100),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  
  -- Business Terms
  payment_terms VARCHAR(50),
  shipping_terms VARCHAR(100),
  return_policy TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(business_id, name)
);
```

#### **retail.products**
```sql
CREATE TABLE retail.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES shared.businesses(id),
  
  -- Basic Information
  name VARCHAR(255) NOT NULL,
  description TEXT,
  product_type VARCHAR(100),
  vendor VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'archived', 'draft'
  
  -- Classification
  category_id UUID REFERENCES retail.categories(id),
  brand_id UUID REFERENCES retail.brands(id),
  
  -- SEO
  handle VARCHAR(255), -- URL slug
  seo_title VARCHAR(255),
  seo_description TEXT,
  
  -- Media
  images TEXT[] DEFAULT '{}',
  
  -- Physical Properties
  weight DECIMAL(8,3),
  dimensions JSONB, -- {length, width, height, unit}
  requires_shipping BOOLEAN DEFAULT true,
  
  -- Inventory Management
  track_inventory BOOLEAN DEFAULT true,
  allow_backorders BOOLEAN DEFAULT false,
  
  -- Organization
  tags VARCHAR[] DEFAULT '{}',
  custom_fields JSONB DEFAULT '{}',
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(business_id, handle)
);
```

#### **retail.product_variants**
```sql
CREATE TABLE retail.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES retail.products(id),
  
  -- Identification
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100),
  barcode VARCHAR(100),
  
  -- Pricing
  price DECIMAL(10,2) NOT NULL,
  compare_at_price DECIMAL(10,2), -- MSRP or original price
  cost DECIMAL(10,2), -- Cost of goods sold
  
  -- Inventory
  inventory_quantity INTEGER DEFAULT 0,
  inventory_policy VARCHAR(20) DEFAULT 'deny', -- 'deny', 'continue'
  
  -- Physical Properties
  weight DECIMAL(8,3),
  requires_shipping BOOLEAN DEFAULT true,
  taxable BOOLEAN DEFAULT true,
  
  -- Variant Attributes
  attributes JSONB DEFAULT '{}', -- {size: "Large", color: "Red"}
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(sku) WHERE sku IS NOT NULL,
  UNIQUE(barcode) WHERE barcode IS NOT NULL
);
```

#### **retail.customers**
```sql
CREATE TABLE retail.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES shared.businesses(id),
  
  -- Basic Information
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  date_of_birth DATE,
  
  -- Customer Type
  customer_type VARCHAR(20) DEFAULT 'individual', -- 'individual', 'business'
  company_name VARCHAR(255),
  tax_id VARCHAR(50),
  
  -- Addresses
  default_address_id UUID,
  billing_address_id UUID,
  
  -- Marketing
  accepts_marketing BOOLEAN DEFAULT false,
  tags VARCHAR[] DEFAULT '{}',
  source VARCHAR(50) DEFAULT 'store',
  
  -- Business Metrics
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  average_order_value DECIMAL(10,2) DEFAULT 0,
  last_order_date TIMESTAMPTZ,
  
  -- Loyalty
  loyalty_points INTEGER DEFAULT 0,
  vip_status BOOLEAN DEFAULT false,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **retail.customer_addresses**
```sql
CREATE TABLE retail.customer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES retail.customers(id),
  
  -- Address Information
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  company VARCHAR(255),
  address1 VARCHAR(255) NOT NULL,
  address2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  province VARCHAR(100), -- State/Province
  country VARCHAR(100) NOT NULL,
  zip VARCHAR(20) NOT NULL,
  phone VARCHAR(20),
  
  -- Address Type
  is_default BOOLEAN DEFAULT false,
  address_type VARCHAR(20) DEFAULT 'shipping', -- 'billing', 'shipping', 'both'
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **retail.sales**
```sql
CREATE TABLE retail.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES shared.businesses(id),
  sale_number VARCHAR(50) UNIQUE NOT NULL,
  
  -- Customer Information
  customer_id UUID REFERENCES retail.customers(id),
  customer_email VARCHAR(255),
  customer_phone VARCHAR(20),
  
  -- Sale Information
  sale_type VARCHAR(20) DEFAULT 'sale', -- 'sale', 'return', 'exchange'
  channel VARCHAR(20) DEFAULT 'pos', -- 'pos', 'online', 'phone', 'mobile'
  
  -- Financial Information
  subtotal DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) DEFAULT 0,
  
  -- Payment Information
  payment_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'partially_paid', 'refunded', 'cancelled'
  payment_method VARCHAR(30), -- 'cash', 'credit_card', 'debit_card', 'check', 'gift_card', 'store_credit'
  
  -- Fulfillment
  fulfillment_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'fulfilled', 'partially_fulfilled', 'cancelled'
  shipping_address JSONB,
  billing_address JSONB,
  
  -- Staff and Location
  cashier_id UUID REFERENCES shared.users(id),
  register_id VARCHAR(50),
  location VARCHAR(100),
  
  -- Notes
  notes TEXT,
  internal_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
```

#### **retail.sale_items**
```sql
CREATE TABLE retail.sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES retail.sales(id),
  product_variant_id UUID REFERENCES retail.product_variants(id),
  
  -- Item Information
  product_name VARCHAR(255) NOT NULL,
  variant_name VARCHAR(255),
  sku VARCHAR(100),
  
  -- Pricing
  quantity INTEGER DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  cost DECIMAL(10,2), -- COGS
  discount_amount DECIMAL(10,2) DEFAULT 0,
  tax_rate DECIMAL(5,4) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  line_total DECIMAL(10,2) NOT NULL,
  
  -- Fulfillment
  fulfillment_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'fulfilled', 'cancelled'
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 5. Courses/Learning Management

### Core Tables

#### **courses.courses**
```sql
CREATE TABLE courses.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES shared.businesses(id),
  instructor_id UUID NOT NULL REFERENCES shared.users(id),
  
  -- Basic Information
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  difficulty_level VARCHAR(20) DEFAULT 'beginner', -- 'beginner', 'intermediate', 'advanced'
  
  -- Content
  estimated_hours INTEGER DEFAULT 1,
  thumbnail_url TEXT,
  trailer_url TEXT,
  
  -- Prerequisites and Requirements
  prerequisites TEXT[] DEFAULT '{}',
  requirements TEXT[] DEFAULT '{}',
  target_audience TEXT,
  
  -- Pricing
  price DECIMAL(8,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',
  is_free BOOLEAN DEFAULT false,
  
  -- Organization
  tags VARCHAR[] DEFAULT '{}',
  language VARCHAR(10) DEFAULT 'en',
  
  -- Status and Visibility
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  publication_date TIMESTAMPTZ,
  
  -- Analytics
  total_enrollments INTEGER DEFAULT 0,
  total_completions INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2),
  total_reviews INTEGER DEFAULT 0,
  
  -- SEO
  slug VARCHAR(255),
  meta_title VARCHAR(255),
  meta_description TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(business_id, slug)
);
```

#### **courses.lessons**
```sql
CREATE TABLE courses.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses.courses(id),
  
  -- Basic Information
  title VARCHAR(255) NOT NULL,
  description TEXT,
  lesson_type VARCHAR(20) NOT NULL, -- 'video', 'text', 'quiz', 'assignment', 'live_session'
  duration_minutes INTEGER,
  
  -- Content
  content_url TEXT, -- Video URL, document URL, etc.
  content_text TEXT, -- For text-based lessons
  resources JSONB DEFAULT '[]', -- Additional resources
  
  -- Structure
  lesson_order INTEGER NOT NULL,
  chapter_id UUID, -- Optional chapter grouping
  
  -- Prerequisites
  prerequisite_lessons UUID[] DEFAULT '{}',
  
  -- Settings
  is_published BOOLEAN DEFAULT false,
  is_free_preview BOOLEAN DEFAULT false,
  allow_comments BOOLEAN DEFAULT true,
  
  -- Completion Tracking
  completion_criteria JSONB, -- What constitutes completion
  passing_score INTEGER, -- For quizzes/assignments
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **courses.course_enrollments**
```sql
CREATE TABLE courses.course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses.courses(id),
  user_id UUID NOT NULL REFERENCES shared.users(id),
  
  -- Enrollment Information
  enrollment_date TIMESTAMPTZ DEFAULT NOW(),
  enrollment_type VARCHAR(20) DEFAULT 'paid', -- 'free', 'paid', 'scholarship', 'bulk'
  price_paid DECIMAL(8,2),
  
  -- Progress Tracking
  progress DECIMAL(5,2) DEFAULT 0, -- Percentage completed (0-100)
  lessons_completed INTEGER DEFAULT 0,
  current_lesson_id UUID REFERENCES courses.lessons(id),
  
  -- Completion
  completed_at TIMESTAMPTZ,
  completion_rate DECIMAL(5,2), -- Final completion percentage
  certificate_issued BOOLEAN DEFAULT false,
  certificate_url TEXT,
  
  -- Engagement
  total_time_spent INTEGER DEFAULT 0, -- minutes
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  access_count INTEGER DEFAULT 0,
  
  -- Status
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'dropped', 'refunded'
  
  -- Notes
  student_notes TEXT,
  instructor_feedback TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(course_id, user_id)
);
```

#### **courses.lesson_progress**
```sql
CREATE TABLE courses.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES courses.course_enrollments(id),
  lesson_id UUID NOT NULL REFERENCES courses.lessons(id),
  user_id UUID NOT NULL REFERENCES shared.users(id),
  
  -- Progress Information
  status VARCHAR(20) DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed', 'skipped'
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  time_spent_minutes INTEGER DEFAULT 0,
  
  -- Completion Details
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ,
  
  -- Quiz/Assignment Results
  score DECIMAL(5,2), -- For quizzes or assignments
  max_score DECIMAL(5,2),
  attempts INTEGER DEFAULT 0,
  
  -- Notes
  student_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(enrollment_id, lesson_id)
);
```

#### **courses.study_groups**
```sql
CREATE TABLE courses.study_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES shared.businesses(id),
  course_id UUID REFERENCES courses.courses(id),
  
  -- Basic Information
  name VARCHAR(255) NOT NULL,
  description TEXT,
  max_members INTEGER DEFAULT 10,
  current_members INTEGER DEFAULT 0,
  
  -- Group Settings
  is_public BOOLEAN DEFAULT true,
  requires_approval BOOLEAN DEFAULT false,
  allow_member_invites BOOLEAN DEFAULT true,
  
  -- Schedule
  meeting_schedule JSONB, -- {days, time, timezone, recurring}
  next_meeting TIMESTAMPTZ,
  
  -- Status
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'archived'
  
  -- Moderation
  creator_id UUID NOT NULL REFERENCES shared.users(id),
  moderators UUID[] DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **courses.study_group_members**
```sql
CREATE TABLE courses.study_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_group_id UUID NOT NULL REFERENCES courses.study_groups(id),
  user_id UUID NOT NULL REFERENCES shared.users(id),
  
  -- Membership Information
  role VARCHAR(20) DEFAULT 'member', -- 'member', 'moderator', 'admin'
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'active', -- 'pending', 'active', 'left', 'removed'
  
  -- Participation
  last_active TIMESTAMPTZ DEFAULT NOW(),
  message_count INTEGER DEFAULT 0,
  
  UNIQUE(study_group_id, user_id)
);
```

#### **courses.study_group_messages**
```sql
CREATE TABLE courses.study_group_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_group_id UUID NOT NULL REFERENCES courses.study_groups(id),
  user_id UUID NOT NULL REFERENCES shared.users(id),
  
  -- Message Content
  message TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text', -- 'text', 'image', 'file', 'link'
  attachments JSONB DEFAULT '[]',
  
  -- Thread Support
  parent_message_id UUID REFERENCES courses.study_group_messages(id),
  
  -- Status
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMPTZ,
  is_deleted BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **courses.user_profiles**
```sql
CREATE TABLE courses.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES shared.users(id),
  business_id UUID NOT NULL REFERENCES shared.businesses(id),
  
  -- Profile Information
  display_name VARCHAR(100),
  bio TEXT,
  avatar_url TEXT,
  cover_image_url TEXT,
  
  -- Learning Preferences
  learning_style VARCHAR(20), -- 'visual', 'auditory', 'kinesthetic', 'reading'
  preferred_pace VARCHAR(20), -- 'slow', 'normal', 'fast'
  study_schedule JSONB, -- Preferred study times
  
  -- Gamification
  total_points INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  badges_earned JSONB DEFAULT '[]',
  streak_days INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  
  -- Statistics
  courses_enrolled INTEGER DEFAULT 0,
  courses_completed INTEGER DEFAULT 0,
  total_study_time_hours DECIMAL(8,2) DEFAULT 0,
  
  -- Social Features
  is_public BOOLEAN DEFAULT true,
  allow_messages BOOLEAN DEFAULT true,
  show_progress BOOLEAN DEFAULT true,
  
  -- Notifications
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  reminder_frequency VARCHAR(20) DEFAULT 'daily',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, business_id)
);
```

#### **courses.badges**
```sql
CREATE TABLE courses.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES shared.businesses(id),
  
  -- Badge Information
  name VARCHAR(100) NOT NULL,
  description TEXT,
  badge_type VARCHAR(30), -- 'completion', 'streak', 'participation', 'achievement'
  icon_url TEXT,
  color VARCHAR(7), -- Hex color code
  
  -- Criteria
  criteria JSONB NOT NULL, -- Requirements to earn this badge
  points_value INTEGER DEFAULT 0,
  
  -- Rarity and Display
  rarity VARCHAR(20) DEFAULT 'common', -- 'common', 'uncommon', 'rare', 'legendary'
  display_order INTEGER DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **courses.user_badges**
```sql
CREATE TABLE courses.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES shared.users(id),
  badge_id UUID NOT NULL REFERENCES courses.badges(id),
  
  -- Earning Information
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  criteria_met JSONB, -- What specific criteria were met
  
  -- Display
  is_displayed BOOLEAN DEFAULT true,
  display_order INTEGER,
  
  UNIQUE(user_id, badge_id)
);
```

## 6. Payroll Industry

### Core Tables

#### **payroll.employees**
```sql
CREATE TABLE payroll.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES shared.businesses(id),
  user_id UUID REFERENCES shared.users(id), -- If employee has system access
  
  -- Personal Information
  employee_number VARCHAR(50) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  preferred_name VARCHAR(100),
  date_of_birth DATE,
  social_security_number VARCHAR(11), -- Encrypted
  
  -- Contact Information
  personal_email VARCHAR(255),
  work_email VARCHAR(255),
  personal_phone VARCHAR(20),
  work_phone VARCHAR(20),
  emergency_contact JSONB, -- {name, relationship, phone, email}
  
  -- Address Information
  home_address JSONB NOT NULL, -- {street, city, state, zip}
  mailing_address JSONB, -- If different from home
  
  -- Employment Information
  hire_date DATE NOT NULL,
  termination_date DATE,
  employment_status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'terminated', 'on_leave'
  employee_type VARCHAR(20) NOT NULL, -- 'full_time', 'part_time', 'contractor', 'intern', 'temporary'
  employment_classification VARCHAR(20) DEFAULT 'non_exempt', -- 'exempt', 'non_exempt'
  
  -- Job Information
  job_title VARCHAR(100) NOT NULL,
  department VARCHAR(100),
  manager_id UUID REFERENCES payroll.employees(id),
  location VARCHAR(100),
  
  -- Compensation
  base_salary DECIMAL(12,2), -- Annual salary for salaried employees
  hourly_rate DECIMAL(8,2), -- Hourly rate for hourly employees
  overtime_rate DECIMAL(8,2), -- Usually 1.5x hourly rate
  pay_frequency VARCHAR(20) DEFAULT 'bi_weekly', -- 'weekly', 'bi_weekly', 'semi_monthly', 'monthly'
  pay_type VARCHAR(20) NOT NULL, -- 'hourly', 'salary', 'commission', 'contract'
  
  -- Benefits Eligibility
  benefits_eligible BOOLEAN DEFAULT true,
  benefits_start_date DATE,
  vacation_accrual_rate DECIMAL(5,4), -- Hours per pay period
  sick_accrual_rate DECIMAL(5,4),
  current_vacation_balance DECIMAL(8,2) DEFAULT 0,
  current_sick_balance DECIMAL(8,2) DEFAULT 0,
  
  -- Tax Information
  federal_filing_status VARCHAR(30), -- 'single', 'married_jointly', 'married_separately', 'head_of_household'
  federal_allowances INTEGER DEFAULT 0,
  state_filing_status VARCHAR(30),
  state_allowances INTEGER DEFAULT 0,
  additional_federal_withholding DECIMAL(8,2) DEFAULT 0,
  additional_state_withholding DECIMAL(8,2) DEFAULT 0,
  
  -- Direct Deposit
  direct_deposit JSONB, -- {bank_name, routing_number, account_number, account_type}
  
  -- I9 and Eligibility
  work_authorization_status VARCHAR(50),
  i9_completed_date DATE,
  i9_expiration_date DATE,
  
  -- Performance and Reviews
  last_review_date DATE,
  next_review_date DATE,
  performance_rating VARCHAR(20),
  
  -- Custom Fields
  custom_fields JSONB DEFAULT '{}',
  
  -- Notes
  notes TEXT,
  
  -- Audit Fields
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES shared.users(id),
  updated_by UUID NOT NULL REFERENCES shared.users(id)
);
```

#### **payroll.timesheets**
```sql
CREATE TABLE payroll.timesheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES shared.businesses(id),
  employee_id UUID NOT NULL REFERENCES payroll.employees(id),
  
  -- Pay Period Information
  pay_period_start DATE NOT NULL,
  pay_period_end DATE NOT NULL,
  pay_period_id VARCHAR(50), -- e.g., "2024-01" for January 2024
  
  -- Status
  status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'submitted', 'approved', 'rejected', 'processed'
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES shared.users(id),
  
  -- Time Totals (in hours)
  regular_hours DECIMAL(8,2) DEFAULT 0,
  overtime_hours DECIMAL(8,2) DEFAULT 0,
  double_time_hours DECIMAL(8,2) DEFAULT 0,
  sick_hours DECIMAL(8,2) DEFAULT 0,
  vacation_hours DECIMAL(8,2) DEFAULT 0,
  holiday_hours DECIMAL(8,2) DEFAULT 0,
  personal_hours DECIMAL(8,2) DEFAULT 0,
  other_hours DECIMAL(8,2) DEFAULT 0,
  
  -- Total Hours
  total_hours DECIMAL(8,2) DEFAULT 0,
  total_billable_hours DECIMAL(8,2) DEFAULT 0,
  
  -- Rates (captured at time of timesheet)
  regular_rate DECIMAL(8,2),
  overtime_rate DECIMAL(8,2),
  double_time_rate DECIMAL(8,2),
  
  -- Gross Pay Calculation
  regular_pay DECIMAL(10,2) DEFAULT 0,
  overtime_pay DECIMAL(10,2) DEFAULT 0,
  double_time_pay DECIMAL(10,2) DEFAULT 0,
  holiday_pay DECIMAL(10,2) DEFAULT 0,
  gross_pay DECIMAL(10,2) DEFAULT 0,
  
  -- Adjustments
  bonus_amount DECIMAL(10,2) DEFAULT 0,
  commission_amount DECIMAL(10,2) DEFAULT 0,
  reimbursement_amount DECIMAL(10,2) DEFAULT 0,
  other_earnings DECIMAL(10,2) DEFAULT 0,
  
  -- Notes
  employee_notes TEXT,
  manager_notes TEXT,
  payroll_notes TEXT,
  
  -- Audit Fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES shared.users(id),
  updated_by UUID REFERENCES shared.users(id),
  
  UNIQUE(employee_id, pay_period_start, pay_period_end)
);
```

#### **payroll.time_entries**
```sql
CREATE TABLE payroll.time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES shared.businesses(id),
  timesheet_id UUID NOT NULL REFERENCES payroll.timesheets(id),
  employee_id UUID NOT NULL REFERENCES payroll.employees(id),
  
  -- Entry Details
  entry_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  break_minutes INTEGER DEFAULT 0,
  
  -- Time Categorization
  entry_type VARCHAR(20) NOT NULL, -- 'regular', 'overtime', 'sick', 'vacation', 'holiday', 'personal', 'other'
  hours DECIMAL(8,2) NOT NULL,
  
  -- Project/Department Tracking
  project_code VARCHAR(50),
  department_code VARCHAR(50),
  cost_center VARCHAR(50),
  
  -- Location Tracking
  location VARCHAR(100),
  gps_coordinates JSONB, -- {lat, lng, accuracy}
  
  -- Approval
  requires_approval BOOLEAN DEFAULT false,
  approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES shared.users(id),
  approved_at TIMESTAMPTZ,
  
  -- Notes
  description TEXT,
  notes TEXT,
  
  -- Source
  entry_source VARCHAR(20) DEFAULT 'manual', -- 'manual', 'time_clock', 'mobile', 'import', 'auto'
  time_clock_id VARCHAR(50),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **payroll.pay_stubs**
```sql
CREATE TABLE payroll.pay_stubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES shared.businesses(id),
  employee_id UUID NOT NULL REFERENCES payroll.employees(id),
  timesheet_id UUID REFERENCES payroll.timesheets(id),
  
  -- Pay Period
  pay_period_start DATE NOT NULL,
  pay_period_end DATE NOT NULL,
  pay_date DATE NOT NULL,
  check_number VARCHAR(50),
  
  -- Earnings
  regular_hours DECIMAL(8,2) DEFAULT 0,
  regular_rate DECIMAL(8,2) DEFAULT 0,
  regular_pay DECIMAL(10,2) DEFAULT 0,
  
  overtime_hours DECIMAL(8,2) DEFAULT 0,
  overtime_rate DECIMAL(8,2) DEFAULT 0,
  overtime_pay DECIMAL(10,2) DEFAULT 0,
  
  sick_hours DECIMAL(8,2) DEFAULT 0,
  sick_pay DECIMAL(10,2) DEFAULT 0,
  
  vacation_hours DECIMAL(8,2) DEFAULT 0,
  vacation_pay DECIMAL(10,2) DEFAULT 0,
  
  holiday_hours DECIMAL(8,2) DEFAULT 0,
  holiday_pay DECIMAL(10,2) DEFAULT 0,
  
  bonus_pay DECIMAL(10,2) DEFAULT 0,
  commission_pay DECIMAL(10,2) DEFAULT 0,
  other_pay DECIMAL(10,2) DEFAULT 0,
  
  gross_pay DECIMAL(10,2) NOT NULL,
  
  -- Deductions
  federal_income_tax DECIMAL(10,2) DEFAULT 0,
  state_income_tax DECIMAL(10,2) DEFAULT 0,
  social_security_tax DECIMAL(10,2) DEFAULT 0,
  medicare_tax DECIMAL(10,2) DEFAULT 0,
  state_disability_tax DECIMAL(10,2) DEFAULT 0,
  
  health_insurance DECIMAL(10,2) DEFAULT 0,
  dental_insurance DECIMAL(10,2) DEFAULT 0,
  vision_insurance DECIMAL(10,2) DEFAULT 0,
  life_insurance DECIMAL(10,2) DEFAULT 0,
  retirement_401k DECIMAL(10,2) DEFAULT 0,
  
  other_deductions DECIMAL(10,2) DEFAULT 0,
  total_deductions DECIMAL(10,2) DEFAULT 0,
  
  -- Net Pay
  net_pay DECIMAL(10,2) NOT NULL,
  
  -- Year to Date Totals
  ytd_gross_pay DECIMAL(12,2) DEFAULT 0,
  ytd_federal_tax DECIMAL(12,2) DEFAULT 0,
  ytd_state_tax DECIMAL(12,2) DEFAULT 0,
  ytd_social_security DECIMAL(12,2) DEFAULT 0,
  ytd_medicare DECIMAL(12,2) DEFAULT 0,
  ytd_deductions DECIMAL(12,2) DEFAULT 0,
  ytd_net_pay DECIMAL(12,2) DEFAULT 0,
  
  -- Balances
  vacation_balance DECIMAL(8,2) DEFAULT 0,
  sick_balance DECIMAL(8,2) DEFAULT 0,
  
  -- Status
  status VARCHAR(20) DEFAULT 'processed', -- 'draft', 'processed', 'paid', 'voided'
  
  -- PDF Generation
  pdf_generated BOOLEAN DEFAULT false,
  pdf_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 7. Investigations Industry

### Core Tables

#### **investigations.cases**
```sql
CREATE TABLE investigations.cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES shared.businesses(id),
  case_number VARCHAR(50) UNIQUE NOT NULL,
  
  -- Basic Information
  title VARCHAR(255) NOT NULL,
  description TEXT,
  case_type VARCHAR(50) NOT NULL, -- 'criminal', 'civil', 'insurance', 'corporate', 'background', 'surveillance'
  
  -- Status and Priority
  status VARCHAR(30) DEFAULT 'active', -- 'open', 'active', 'closed', 'suspended', 'archived'
  priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  
  -- Assignment
  assigned_to UUID[] DEFAULT '{}', -- Array of user IDs
  assigned_name VARCHAR(255), -- Display name for assignments
  created_by UUID NOT NULL REFERENCES shared.users(id),
  
  -- Client Information
  client_id UUID, -- References clients table
  client_name VARCHAR(255),
  client_contact JSONB, -- {email, phone, address}
  
  -- Case Details
  incident_date TIMESTAMPTZ,
  report_date TIMESTAMPTZ DEFAULT NOW(),
  location JSONB, -- {address, coordinates, jurisdiction}
  jurisdiction VARCHAR(100),
  
  -- People Involved
  involved_persons JSONB DEFAULT '[]', -- Array of person objects
  witnesses JSONB DEFAULT '[]',
  suspects JSONB DEFAULT '[]',
  victims JSONB DEFAULT '[]',
  
  -- Evidence and Documentation
  evidence JSONB DEFAULT '[]', -- Array of evidence objects
  documents JSONB DEFAULT '[]', -- Array of document references
  photos JSONB DEFAULT '[]', -- Array of photo references
  videos JSONB DEFAULT '[]', -- Array of video references
  
  -- Timeline and Activities
  timeline JSONB DEFAULT '[]', -- Array of timeline events
  activities JSONB DEFAULT '[]', -- Array of investigation activities
  
  -- Related Cases
  related_cases UUID[] DEFAULT '{}',
  parent_case_id UUID REFERENCES investigations.cases(id),
  
  -- Legal and Compliance
  confidentiality_level VARCHAR(30) DEFAULT 'internal', -- 'public', 'internal', 'confidential', 'restricted'
  legal_hold BOOLEAN DEFAULT false,
  court_case_number VARCHAR(100),
  attorney_info JSONB, -- {name, firm, contact}
  
  -- Financial
  budget DECIMAL(10,2),
  expenses DECIMAL(10,2) DEFAULT 0,
  billing_rate DECIMAL(8,2),
  is_billable BOOLEAN DEFAULT true,
  
  -- Metadata
  tags VARCHAR[] DEFAULT '{}',
  custom_fields JSONB DEFAULT '{}',
  notes TEXT,
  
  -- Tracking
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  estimated_completion TIMESTAMPTZ,
  actual_completion TIMESTAMPTZ,
  
  -- Audit Fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  version INTEGER DEFAULT 1
);
```

#### **investigations.evidence**
```sql
CREATE TABLE investigations.evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES shared.businesses(id),
  case_id UUID NOT NULL REFERENCES investigations.cases(id),
  
  -- Evidence Identification
  evidence_number VARCHAR(50) NOT NULL,
  evidence_type VARCHAR(50) NOT NULL, -- 'physical', 'digital', 'document', 'photo', 'video', 'audio', 'witness_statement'
  
  -- Description
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Source Information
  source VARCHAR(255), -- Where evidence was obtained
  collected_by UUID REFERENCES shared.users(id),
  collected_date TIMESTAMPTZ DEFAULT NOW(),
  collection_method VARCHAR(100),
  
  -- Location Information
  found_location JSONB, -- Where evidence was discovered
  current_location VARCHAR(255), -- Current storage location
  
  -- Chain of Custody
  chain_of_custody JSONB DEFAULT '[]', -- Array of custody transfer objects
  custody_status VARCHAR(30) DEFAULT 'collected', -- 'collected', 'analyzed', 'stored', 'destroyed', 'returned'
  
  -- Digital Evidence
  file_hash VARCHAR(128), -- For digital evidence integrity
  file_size BIGINT,
  file_type VARCHAR(50),
  file_url TEXT,
  
  -- Physical Evidence
  container_info VARCHAR(255), -- Bag, box, etc.
  weight DECIMAL(8,3),
  dimensions VARCHAR(100),
  condition_notes TEXT,
  
  -- Analysis
  analyzed_by UUID REFERENCES shared.users(id),
  analysis_date TIMESTAMPTZ,
  analysis_results TEXT,
  analysis_status VARCHAR(30), -- 'pending', 'in_progress', 'completed', 'inconclusive'
  
  -- Legal Status
  admissible BOOLEAN,
  privilege_claimed BOOLEAN DEFAULT false,
  privilege_type VARCHAR(50),
  
  -- Related Evidence
  related_evidence UUID[] DEFAULT '{}',
  parent_evidence_id UUID REFERENCES investigations.evidence(id),
  
  -- Tags and Classification
  tags VARCHAR[] DEFAULT '{}',
  classification VARCHAR(30) DEFAULT 'unclassified', -- 'unclassified', 'confidential', 'secret'
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  notes TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(business_id, evidence_number)
);
```

#### **investigations.timeline_events**
```sql
CREATE TABLE investigations.timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES shared.businesses(id),
  case_id UUID NOT NULL REFERENCES investigations.cases(id),
  
  -- Event Information
  event_date TIMESTAMPTZ NOT NULL,
  event_type VARCHAR(50) NOT NULL, -- 'incident', 'interview', 'evidence_collection', 'analysis', 'meeting', 'court_date'
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Location
  location JSONB, -- {address, coordinates}
  
  -- People Involved
  participants JSONB DEFAULT '[]', -- Array of person objects
  conducted_by UUID REFERENCES shared.users(id),
  
  -- Related Items
  related_evidence UUID[] DEFAULT '{}',
  related_documents UUID[] DEFAULT '{}',
  
  -- Duration
  duration_minutes INTEGER,
  end_time TIMESTAMPTZ,
  
  -- Results and Outcomes
  outcome TEXT,
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_date TIMESTAMPTZ,
  follow_up_notes TEXT,
  
  -- Verification
  verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES shared.users(id),
  verification_date TIMESTAMPTZ,
  verification_method VARCHAR(100),
  
  -- Source Information
  source VARCHAR(255), -- How this information was obtained
  reliability_score INTEGER, -- 1-10 scale
  
  -- Metadata
  tags VARCHAR[] DEFAULT '{}',
  custom_fields JSONB DEFAULT '{}',
  attachments JSONB DEFAULT '[]',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES shared.users(id)
);
```

#### **investigations.case_reports**
```sql
CREATE TABLE investigations.case_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES shared.businesses(id),
  case_id UUID NOT NULL REFERENCES investigations.cases(id),
  
  -- Report Information
  report_type VARCHAR(50) NOT NULL, -- 'initial', 'progress', 'final', 'supplemental', 'summary'
  report_number VARCHAR(50),
  title VARCHAR(255) NOT NULL,
  
  -- Content
  executive_summary TEXT,
  methodology TEXT,
  findings TEXT NOT NULL,
  conclusions TEXT,
  recommendations TEXT,
  
  -- Authors and Review
  authored_by UUID NOT NULL REFERENCES shared.users(id),
  reviewed_by UUID REFERENCES shared.users(id),
  approved_by UUID REFERENCES shared.users(id),
  
  -- Status
  status VARCHAR(30) DEFAULT 'draft', -- 'draft', 'review', 'approved', 'published', 'archived'
  
  -- Distribution
  distribution_list JSONB DEFAULT '[]', -- Who has access to this report
  confidentiality_level VARCHAR(30) DEFAULT 'internal',
  
  -- Dates
  report_date TIMESTAMPTZ DEFAULT NOW(),
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  
  -- File Management
  document_url TEXT,
  file_size BIGINT,
  file_hash VARCHAR(128),
  
  -- Version Control
  version INTEGER DEFAULT 1,
  parent_report_id UUID REFERENCES investigations.case_reports(id),
  
  -- Metadata
  tags VARCHAR[] DEFAULT '{}',
  custom_fields JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 8. Cross-Cutting AI and Communication Tables

### AI Services Tables

#### **ai.chat_sessions**
```sql
CREATE TABLE ai.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES shared.businesses(id),
  user_id UUID NOT NULL REFERENCES shared.users(id),
  
  -- Session Information
  title VARCHAR(255),
  industry VARCHAR(20) NOT NULL DEFAULT 'general', -- 'hs', 'rest', 'auto', 'retail', 'courses', 'payroll', 'general'
  
  -- Context and Configuration
  context JSONB, -- Business context, customer info, etc.
  system_prompt TEXT,
  model_config JSONB DEFAULT '{}', -- {model, temperature, maxTokens, topP}
  
  -- Usage Tracking
  total_tokens_used INTEGER DEFAULT 0,
  message_count INTEGER DEFAULT 0,
  
  -- Organization
  tags VARCHAR[] DEFAULT '{}',
  is_private BOOLEAN DEFAULT false,
  custom_fields JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **ai.chat_messages**
```sql
CREATE TABLE ai.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES ai.chat_sessions(id),
  
  -- Message Information
  role VARCHAR(20) NOT NULL, -- 'user', 'assistant', 'system'
  content TEXT NOT NULL,
  
  -- Attachments and Context
  attachments JSONB DEFAULT '[]', -- Array of attachment objects
  metadata JSONB DEFAULT '{}',
  
  -- AI-specific Information
  model_used VARCHAR(50),
  tokens_used INTEGER,
  processing_time_ms INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Performance and Indexing Strategy

### Primary Indexes
Every table includes these standard indexes:
- Primary key (UUID) with btree index
- Business ID for multi-tenant isolation
- Created/updated timestamps for temporal queries
- Foreign key constraints with corresponding indexes

### Industry-Specific Critical Indexes

#### Home Services
```sql
-- Customer lookup by phone/email
CREATE INDEX idx_hs_customers_phone ON hs.customers USING btree (business_id, phone_primary);
CREATE INDEX idx_hs_customers_email ON hs.customers USING btree (business_id, email);

-- Work order status and scheduling
CREATE INDEX idx_hs_work_orders_status ON hs.work_orders USING btree (business_id, status, created_at);
CREATE INDEX idx_hs_work_orders_technician ON hs.work_orders USING btree (business_id, assigned_technician_id, scheduled_date);
CREATE INDEX idx_hs_work_orders_customer ON hs.work_orders USING btree (business_id, customer_id, created_at);

-- Scheduling optimization
CREATE INDEX idx_hs_appointments_date_tech ON hs.scheduled_appointments USING btree (business_id, technician_id, scheduled_date, scheduled_start_time);
```

#### Auto Services
```sql
-- Vehicle lookup by VIN and license plate
CREATE INDEX idx_auto_vehicles_vin ON auto.vehicles USING btree (business_id, vin);
CREATE INDEX idx_auto_vehicles_plate ON auto.vehicles USING btree (business_id, license_plate);

-- Repair order status and workflow
CREATE INDEX idx_auto_repair_orders_status ON auto.repair_orders USING btree (business_id, status, created_at);
CREATE INDEX idx_auto_repair_orders_vehicle ON auto.repair_orders USING btree (business_id, vehicle_id, created_at);

-- Parts inventory
CREATE INDEX idx_auto_parts_number ON auto.parts USING btree (business_id, part_number);
CREATE INDEX idx_auto_parts_inventory ON auto.parts USING btree (business_id, quantity_on_hand, is_active);
```

#### Restaurant
```sql
-- Order management and kitchen workflow
CREATE INDEX idx_rest_orders_status ON rest.orders USING btree (business_id, status, created_at);
CREATE INDEX idx_rest_orders_table ON rest.orders USING btree (business_id, table_id, status);

-- Menu item availability
CREATE INDEX idx_rest_menu_items_available ON rest.menu_items USING btree (business_id, is_available, category_id);

-- Table management
CREATE INDEX idx_rest_tables_status ON rest.tables USING btree (business_id, status, location);
```

#### Retail
```sql
-- Product search and filtering
CREATE INDEX idx_retail_products_search ON retail.products USING gin (business_id, to_tsvector('english', name || ' ' || coalesce(description, '')));
CREATE INDEX idx_retail_products_category ON retail.products USING btree (business_id, category_id, status);

-- Inventory management
CREATE INDEX idx_retail_variants_inventory ON retail.product_variants USING btree (product_id, inventory_quantity, is_active);
CREATE INDEX idx_retail_variants_sku ON retail.product_variants USING btree (sku) WHERE sku IS NOT NULL;

-- Sales analysis
CREATE INDEX idx_retail_sales_date ON retail.sales USING btree (business_id, created_at, payment_status);
```

### Performance Optimization Features

1. **Partitioning Strategy**
   - Audit logs partitioned by month
   - Time-series data (timesheets, appointments) partitioned by quarter
   - Large transaction tables partitioned by business_id

2. **Caching Strategy**
   - Redis for session storage and real-time data
   - Application-level caching for frequently accessed lookups
   - CDN for static assets and documents

3. **Query Optimization**
   - Prepared statements for all repeated queries
   - Connection pooling with read replicas
   - Materialized views for complex reporting queries

## Security and Compliance

### Row Level Security (RLS) Policies
Every table implements RLS based on business_id:

```sql
-- Example RLS policy template
ALTER TABLE [schema].[table] ENABLE ROW LEVEL SECURITY;

CREATE POLICY business_isolation ON [schema].[table]
  FOR ALL TO authenticated
  USING (business_id = current_setting('app.current_business_id')::uuid);
```

### Data Encryption
- PII fields encrypted at rest (SSNs, financial data)
- Passwords hashed using bcrypt
- API keys encrypted with business-specific keys
- File uploads encrypted in S3 with KMS

### Audit Trail Requirements
- All mutations logged with full context
- IP address and user agent tracking
- Data retention policies by industry
- GDPR compliance with data deletion capabilities

## Scalability Considerations

### Horizontal Scaling Strategy
- Read replicas for reporting and analytics
- Microservice boundaries aligned with industry domains  
- Event-driven architecture for cross-service communication
- Database sharding by business_id for largest tenants

### Data Archiving
- Automated archiving of old records based on business rules
- Separate analytics database for historical reporting
- Cold storage integration for document and media files

### Monitoring and Observability
- Query performance monitoring with slow query alerts
- Business metrics dashboards per industry
- Real-time health checks for all critical tables
- Automated capacity planning based on growth trends

## Integration Requirements

### Third-Party Integrations
Each industry requires specific external integrations:

- **Home Services**: QuickBooks, ServiceTitan, GPS tracking
- **Auto**: Mitchell, AllData, parts suppliers
- **Restaurant**: POS systems, delivery platforms, payment processors  
- **Retail**: Shopify, Amazon, payment gateways
- **Courses**: LMS platforms, video hosting, payment processors
- **Payroll**: ADP, tax authorities, banking systems

### API Design Patterns
- RESTful APIs with OpenAPI documentation
- GraphQL for flexible client queries
- WebSocket connections for real-time updates
- Webhook support for external integrations

## Summary

This analysis reveals a sophisticated multi-tenant database architecture supporting 7+ distinct industries with shared infrastructure. The system requires:

- **80+ production tables** with complex relationships
- **Advanced multi-tenancy** with strict data isolation
- **Industry-specific workflows** with shared patterns
- **Real-time capabilities** for operational efficiency
- **Comprehensive audit trails** for compliance
- **AI integration** throughout the platform
- **Scalable architecture** supporting enterprise growth

The database design balances flexibility with performance, enabling each industry vertical to operate independently while sharing common infrastructure and cross-cutting concerns like user management, auditing, and AI services.