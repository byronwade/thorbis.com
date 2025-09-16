# Database Development Guide

This guide covers comprehensive database development for Thorbis Business OS, including PostgreSQL with Row Level Security (RLS), multi-tenant architecture, performance optimization, and industry-specific data modeling.

## Database Architecture Overview

### Multi-Tenant PostgreSQL Design

Thorbis Business OS uses a shared database architecture with tenant isolation achieved through Row Level Security (RLS) policies.

```sql
-- Core multi-tenant architecture
-- Every business table includes business_id for tenant isolation

-- Business table (tenant boundary)
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  industry TEXT NOT NULL CHECK (industry IN ('home-services', 'restaurant', 'automotive', 'retail')),
  subdomain TEXT UNIQUE NOT NULL,
  settings JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled')),
  subscription_tier TEXT NOT NULL DEFAULT 'starter',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS enabled on all business tables
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX idx_businesses_industry ON businesses(industry);
CREATE INDEX idx_businesses_status ON businesses(status);
CREATE INDEX idx_businesses_created_at ON businesses(created_at);
```

### Essential Extensions and Functions

```sql
-- Required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";        -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";         -- Cryptographic functions
CREATE EXTENSION IF NOT EXISTS "pgjwt";            -- JWT token handling
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements"; -- Query performance monitoring
CREATE EXTENSION IF NOT EXISTS "btree_gin";        -- Advanced indexing
CREATE EXTENSION IF NOT EXISTS "pg_trgm";          -- Text similarity matching

-- Helper function to get current business context
CREATE OR REPLACE FUNCTION get_current_business_id()
RETURNS UUID AS $$
DECLARE
  business_id UUID;
BEGIN
  -- Get business_id from JWT token or session
  business_id := current_setting('app.current_business_id', true)::UUID;
  
  IF business_id IS NULL THEN
    RAISE EXCEPTION 'No business context set';
  END IF;
  
  RETURN business_id;
EXCEPTION 
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Invalid business context: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to set business context
CREATE OR REPLACE FUNCTION set_business_context(business_uuid UUID)
RETURNS VOID AS $$
BEGIN
  -- Verify business exists and is active
  IF NOT EXISTS (
    SELECT 1 FROM businesses 
    WHERE id = business_uuid 
    AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'Business not found or inactive: %', business_uuid;
  END IF;
  
  -- Set the business context
  PERFORM set_config('app.current_business_id', business_uuid::text, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Audit trail function
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into audit table
  INSERT INTO audit_log (
    table_name,
    operation,
    old_data,
    new_data,
    changed_by,
    business_id,
    changed_at
  ) VALUES (
    TG_TABLE_NAME,
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    current_setting('app.current_user_id', true)::UUID,
    COALESCE(NEW.business_id, OLD.business_id),
    now()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Row Level Security Implementation

### RLS Policy Templates

```sql
-- Template for creating RLS policies on business tables
CREATE OR REPLACE FUNCTION create_business_table_policies(table_name TEXT)
RETURNS VOID AS $$
BEGIN
  -- Enable RLS
  EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);
  
  -- Policy for business users - can only access their own business data
  EXECUTE format('
    CREATE POLICY "business_isolation" ON %I
    FOR ALL 
    USING (business_id = get_current_business_id())
  ', table_name);
  
  -- Policy for service role - bypass RLS for system operations
  EXECUTE format('
    CREATE POLICY "service_role_bypass" ON %I
    FOR ALL
    TO service_role
    USING (true)
  ', table_name);
  
  -- Policy for authenticated users - must have business context
  EXECUTE format('
    CREATE POLICY "authenticated_users" ON %I
    FOR ALL
    TO authenticated
    USING (business_id = get_current_business_id())
  ', table_name);
  
  -- Policy for anonymous users - no access
  EXECUTE format('
    CREATE POLICY "anonymous_users_denied" ON %I
    FOR ALL
    TO anon
    USING (false)
  ', table_name);
END;
$$ LANGUAGE plpgsql;

-- Apply policies to a table
-- SELECT create_business_table_policies('customers');
```

### Advanced RLS Patterns

```sql
-- Role-based access control within business
CREATE OR REPLACE FUNCTION user_has_permission(
  required_permission TEXT,
  target_business_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  user_permissions TEXT[];
  user_role TEXT;
  business_id UUID;
BEGIN
  business_id := COALESCE(target_business_id, get_current_business_id());
  
  -- Get user role and permissions
  SELECT role, permissions INTO user_role, user_permissions
  FROM user_profiles
  WHERE user_id = auth.uid()
  AND business_id = get_current_business_id();
  
  -- Owner has all permissions
  IF user_role = 'owner' THEN
    RETURN true;
  END IF;
  
  -- Check specific permission
  RETURN required_permission = ANY(user_permissions) OR '*' = ANY(user_permissions);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Complex RLS policy with role-based permissions
CREATE POLICY "financial_data_access" ON invoices
FOR ALL
USING (
  business_id = get_current_business_id() 
  AND (
    user_has_permission('invoices:read') 
    OR (
      user_has_permission('invoices:read_own') 
      AND created_by = auth.uid()
    )
  )
);
```

## Core Database Schema

### User Management Schema

```sql
-- User profiles (extends Supabase auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'staff', 'viewer', 'api_partner')),
  permissions TEXT[] NOT NULL DEFAULT '{}',
  display_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  timezone TEXT DEFAULT 'UTC',
  preferences JSONB DEFAULT '{}',
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Constraints
  UNIQUE(user_id, business_id),
  CHECK (array_length(permissions, 1) >= 0)
);

-- RLS policies for user profiles
SELECT create_business_table_policies('user_profiles');

-- Additional policy: users can read their own profile across businesses
CREATE POLICY "own_profile_access" ON user_profiles
FOR SELECT
USING (user_id = auth.uid());

-- Audit trail
CREATE TRIGGER user_profiles_audit 
AFTER INSERT OR UPDATE OR DELETE ON user_profiles
FOR EACH ROW EXECUTE FUNCTION audit_trigger();
```

### Customer Management Schema

```sql
-- Base customers table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  
  -- Basic information
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  
  -- Address information
  address JSONB DEFAULT '{}',
  billing_address JSONB DEFAULT '{}',
  
  -- Customer classification
  customer_type TEXT NOT NULL DEFAULT 'individual' 
    CHECK (customer_type IN ('individual', 'business')),
  
  -- Industry-specific fields
  industry_data JSONB DEFAULT '{}',
  
  -- Relationship management
  assigned_to UUID REFERENCES user_profiles(id),
  customer_status TEXT NOT NULL DEFAULT 'active' 
    CHECK (customer_status IN ('active', 'inactive', 'prospect', 'archived')),
  
  -- Customer value
  lifetime_value DECIMAL(12,2) DEFAULT 0,
  credit_limit DECIMAL(12,2),
  payment_terms INTEGER DEFAULT 30, -- Net 30 days
  
  -- Preferences and notes
  preferences JSONB DEFAULT '{}',
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  
  -- Search and indexing
  search_vector tsvector,
  
  -- Metadata
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Constraints
  CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CHECK (phone IS NULL OR phone ~* '^\+?[\d\s\-\(\)]+$')
);

-- Indexes for performance
CREATE INDEX idx_customers_business_id ON customers(business_id);
CREATE INDEX idx_customers_email ON customers(email) WHERE email IS NOT NULL;
CREATE INDEX idx_customers_phone ON customers(phone) WHERE phone IS NOT NULL;
CREATE INDEX idx_customers_status ON customers(customer_status);
CREATE INDEX idx_customers_assigned_to ON customers(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX idx_customers_created_at ON customers(created_at);

-- Full-text search index
CREATE INDEX idx_customers_search ON customers USING GIN(search_vector);
CREATE INDEX idx_customers_tags ON customers USING GIN(tags);

-- Update search vector trigger
CREATE OR REPLACE FUNCTION update_customer_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', 
    COALESCE(NEW.name, '') || ' ' ||
    COALESCE(NEW.email, '') || ' ' ||
    COALESCE(NEW.phone, '') || ' ' ||
    COALESCE(array_to_string(NEW.tags, ' '), '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER customers_search_update
BEFORE INSERT OR UPDATE ON customers
FOR EACH ROW EXECUTE FUNCTION update_customer_search_vector();

-- RLS policies
SELECT create_business_table_policies('customers');

-- Additional policy: staff can only see assigned customers
CREATE POLICY "assigned_customers_only" ON customers
FOR ALL
USING (
  business_id = get_current_business_id() 
  AND (
    user_has_permission('customers:read_all')
    OR assigned_to = auth.uid()
    OR created_by = auth.uid()
  )
);

-- Audit trail
CREATE TRIGGER customers_audit 
AFTER INSERT OR UPDATE OR DELETE ON customers
FOR EACH ROW EXECUTE FUNCTION audit_trigger();
```

## Industry-Specific Schemas

### Home Services Schema

```sql
-- Work orders for home services
CREATE TABLE work_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  
  -- Order identification
  order_number TEXT NOT NULL,
  
  -- Customer relationship
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  property_id UUID REFERENCES properties(id),
  
  -- Service details
  service_type TEXT NOT NULL,
  service_category TEXT,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal' 
    CHECK (priority IN ('low', 'normal', 'high', 'emergency')),
  
  -- Scheduling
  scheduled_date DATE,
  scheduled_time_start TIME,
  scheduled_time_end TIME,
  estimated_duration INTERVAL,
  
  -- Assignment
  assigned_technician UUID REFERENCES user_profiles(id),
  team_members UUID[] DEFAULT '{}',
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (
    status IN ('scheduled', 'dispatched', 'in_progress', 'completed', 'cancelled', 'on_hold')
  ),
  
  -- Location and access
  service_address JSONB NOT NULL,
  access_instructions TEXT,
  gate_code TEXT,
  
  -- Pricing and billing
  labor_rate DECIMAL(10,2),
  estimated_labor_hours DECIMAL(5,2),
  actual_labor_hours DECIMAL(5,2),
  parts_total DECIMAL(12,2) DEFAULT 0,
  labor_total DECIMAL(12,2) DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) DEFAULT 0,
  
  -- Parts and materials
  parts_used JSONB DEFAULT '[]',
  materials_used JSONB DEFAULT '[]',
  
  -- Quality and completion
  completion_notes TEXT,
  customer_signature BYTEA,
  before_photos TEXT[] DEFAULT '{}',
  after_photos TEXT[] DEFAULT '{}',
  warranty_period INTERVAL,
  warranty_notes TEXT,
  
  -- Customer feedback
  customer_satisfaction INTEGER CHECK (customer_satisfaction BETWEEN 1 AND 5),
  customer_feedback TEXT,
  
  -- Metadata
  created_by UUID NOT NULL REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  
  -- Constraints
  UNIQUE(business_id, order_number),
  CHECK (scheduled_time_end > scheduled_time_start),
  CHECK (actual_labor_hours IS NULL OR actual_labor_hours >= 0),
  CHECK (total_amount >= 0)
);

-- Properties for home services
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  
  -- Property details
  property_type TEXT NOT NULL CHECK (property_type IN ('house', 'apartment', 'condo', 'commercial')),
  address JSONB NOT NULL,
  square_footage INTEGER,
  year_built INTEGER,
  
  -- Service history
  first_service_date DATE,
  last_service_date DATE,
  total_services_completed INTEGER DEFAULT 0,
  
  -- Property-specific information
  equipment JSONB DEFAULT '[]', -- HVAC units, water heaters, etc.
  access_information JSONB DEFAULT '{}',
  special_instructions TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for home services
CREATE INDEX idx_work_orders_business_id ON work_orders(business_id);
CREATE INDEX idx_work_orders_customer_id ON work_orders(customer_id);
CREATE INDEX idx_work_orders_status ON work_orders(status);
CREATE INDEX idx_work_orders_scheduled_date ON work_orders(scheduled_date);
CREATE INDEX idx_work_orders_assigned_technician ON work_orders(assigned_technician);
CREATE INDEX idx_work_orders_created_at ON work_orders(created_at);

CREATE INDEX idx_properties_business_id ON properties(business_id);
CREATE INDEX idx_properties_customer_id ON properties(customer_id);

-- RLS policies
SELECT create_business_table_policies('work_orders');
SELECT create_business_table_policies('properties');

-- Technician assignment policy
CREATE POLICY "technician_assigned_orders" ON work_orders
FOR ALL
USING (
  business_id = get_current_business_id() 
  AND (
    user_has_permission('work_orders:read_all')
    OR assigned_technician = auth.uid()
    OR auth.uid() = ANY(team_members)
    OR created_by = auth.uid()
  )
);
```

### Restaurant Schema

```sql
-- Menu items
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  
  -- Item details
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  subcategory TEXT,
  
  -- Pricing
  price DECIMAL(8,2) NOT NULL CHECK (price >= 0),
  cost DECIMAL(8,2), -- Cost to make
  
  -- Availability
  is_available BOOLEAN NOT NULL DEFAULT true,
  available_days INTEGER[] DEFAULT '{0,1,2,3,4,5,6}', -- 0=Sunday
  available_times JSONB DEFAULT '{"start": "00:00", "end": "23:59"}',
  
  -- Dietary information
  allergens TEXT[] DEFAULT '{}',
  dietary_flags TEXT[] DEFAULT '{}', -- vegetarian, vegan, gluten-free, etc.
  calories INTEGER,
  
  -- Kitchen information
  prep_time INTEGER, -- minutes
  cooking_station TEXT, -- grill, fryer, salad, dessert
  ingredients JSONB DEFAULT '[]',
  recipe JSONB DEFAULT '{}',
  
  -- Media
  image_url TEXT,
  
  -- Ordering
  sort_order INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Restaurant orders
CREATE TABLE restaurant_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  
  -- Order identification
  order_number TEXT NOT NULL,
  
  -- Customer information
  customer_id UUID REFERENCES customers(id),
  customer_name TEXT,
  customer_phone TEXT,
  
  -- Order type
  order_type TEXT NOT NULL CHECK (order_type IN ('dine_in', 'takeout', 'delivery', 'catering')),
  
  -- Dining information
  table_number INTEGER,
  party_size INTEGER,
  
  -- Delivery information
  delivery_address JSONB,
  delivery_instructions TEXT,
  delivery_fee DECIMAL(8,2) DEFAULT 0,
  
  -- Order items
  items JSONB NOT NULL DEFAULT '[]',
  
  -- Pricing
  subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  tip_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'confirmed', 'preparing', 'ready', 'served', 'delivered', 'cancelled')
  ),
  
  -- Kitchen timing
  ordered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  estimated_ready_time TIMESTAMPTZ,
  ready_at TIMESTAMPTZ,
  served_at TIMESTAMPTZ,
  
  -- Payment
  payment_method TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (
    payment_status IN ('pending', 'paid', 'failed', 'refunded')
  ),
  payment_reference TEXT,
  
  -- Staff assignment
  server_id UUID REFERENCES user_profiles(id),
  chef_id UUID REFERENCES user_profiles(id),
  
  -- Special instructions
  special_requests TEXT,
  kitchen_notes TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reservations
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  
  -- Customer information
  customer_id UUID REFERENCES customers(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  
  -- Reservation details
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  party_size INTEGER NOT NULL CHECK (party_size > 0),
  duration_minutes INTEGER DEFAULT 90,
  
  -- Table assignment
  table_number INTEGER,
  table_section TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (
    status IN ('confirmed', 'seated', 'completed', 'cancelled', 'no_show')
  ),
  
  -- Special requests
  special_requests TEXT,
  occasion TEXT, -- birthday, anniversary, etc.
  
  -- Confirmation
  confirmation_sent_at TIMESTAMPTZ,
  reminder_sent_at TIMESTAMPTZ,
  
  -- Check-in
  checked_in_at TIMESTAMPTZ,
  seated_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for restaurant
CREATE INDEX idx_menu_items_business_id ON menu_items(business_id);
CREATE INDEX idx_menu_items_category ON menu_items(category);
CREATE INDEX idx_menu_items_available ON menu_items(is_available);

CREATE INDEX idx_restaurant_orders_business_id ON restaurant_orders(business_id);
CREATE INDEX idx_restaurant_orders_status ON restaurant_orders(status);
CREATE INDEX idx_restaurant_orders_order_type ON restaurant_orders(order_type);
CREATE INDEX idx_restaurant_orders_ordered_at ON restaurant_orders(ordered_at);

CREATE INDEX idx_reservations_business_id ON reservations(business_id);
CREATE INDEX idx_reservations_date_time ON reservations(reservation_date, reservation_time);
CREATE INDEX idx_reservations_status ON reservations(status);

-- RLS policies
SELECT create_business_table_policies('menu_items');
SELECT create_business_table_policies('restaurant_orders');
SELECT create_business_table_policies('reservations');
```

## Advanced Database Features

### Full-Text Search Implementation

```sql
-- Advanced search configuration
CREATE TEXT SEARCH CONFIGURATION business_search (COPY = pg_catalog.english);

-- Create search function for customers
CREATE OR REPLACE FUNCTION search_customers(
  search_query TEXT,
  business_uuid UUID,
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  email TEXT,
  phone TEXT,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.email,
    c.phone,
    ts_rank(c.search_vector, to_tsquery('business_search', search_query)) as rank
  FROM customers c
  WHERE 
    c.business_id = business_uuid
    AND (
      c.search_vector @@ to_tsquery('business_search', search_query)
      OR c.name ILIKE '%' || search_query || '%'
      OR c.email ILIKE '%' || search_query || '%'
    )
  ORDER BY 
    rank DESC,
    c.name ASC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Similarity search using pg_trgm
CREATE INDEX idx_customers_name_trgm ON customers USING GIN(name gin_trgm_ops);
CREATE INDEX idx_customers_email_trgm ON customers USING GIN(email gin_trgm_ops);

CREATE OR REPLACE FUNCTION fuzzy_search_customers(
  search_query TEXT,
  business_uuid UUID,
  similarity_threshold REAL DEFAULT 0.3
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  email TEXT,
  similarity REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.email,
    GREATEST(
      similarity(c.name, search_query),
      COALESCE(similarity(c.email, search_query), 0)
    ) as sim
  FROM customers c
  WHERE 
    c.business_id = business_uuid
    AND (
      c.name % search_query 
      OR c.email % search_query
    )
    AND GREATEST(
      similarity(c.name, search_query),
      COALESCE(similarity(c.email, search_query), 0)
    ) >= similarity_threshold
  ORDER BY sim DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Analytics and Reporting Functions

```sql
-- Business analytics functions
CREATE OR REPLACE FUNCTION get_business_metrics(
  business_uuid UUID,
  start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  end_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB AS $$
DECLARE
  result JSONB := '{}';
  customer_count INTEGER;
  total_revenue DECIMAL(12,2);
  avg_order_value DECIMAL(12,2);
  order_count INTEGER;
BEGIN
  -- Customer metrics
  SELECT COUNT(*) INTO customer_count
  FROM customers 
  WHERE business_id = business_uuid
    AND created_at::DATE BETWEEN start_date AND end_date;
  
  result := jsonb_set(result, '{customers,new_customers}', customer_count::TEXT::JSONB);
  
  -- Revenue metrics (industry-agnostic)
  SELECT 
    COALESCE(SUM(total_amount), 0),
    COALESCE(AVG(total_amount), 0),
    COUNT(*)
  INTO total_revenue, avg_order_value, order_count
  FROM (
    -- Home services
    SELECT total_amount, created_at
    FROM work_orders 
    WHERE business_id = business_uuid 
      AND status = 'completed'
      AND created_at::DATE BETWEEN start_date AND end_date
    
    UNION ALL
    
    -- Restaurant orders
    SELECT total_amount, created_at
    FROM restaurant_orders 
    WHERE business_id = business_uuid 
      AND status IN ('served', 'delivered')
      AND created_at::DATE BETWEEN start_date AND end_date
    
    -- Add other industry-specific revenue sources here
  ) revenue_sources;
  
  result := jsonb_set(result, '{revenue,total}', total_revenue::TEXT::JSONB);
  result := jsonb_set(result, '{revenue,average_order_value}', avg_order_value::TEXT::JSONB);
  result := jsonb_set(result, '{revenue,order_count}', order_count::TEXT::JSONB);
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Industry-specific analytics
CREATE OR REPLACE FUNCTION get_home_services_metrics(
  business_uuid UUID,
  start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  end_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB AS $$
DECLARE
  result JSONB := '{}';
  completion_rate DECIMAL(5,2);
  avg_job_value DECIMAL(10,2);
  technician_utilization JSONB;
BEGIN
  -- Job completion rate
  SELECT 
    ROUND(
      (COUNT(*) FILTER (WHERE status = 'completed')::DECIMAL / 
       NULLIF(COUNT(*), 0)) * 100, 
      2
    )
  INTO completion_rate
  FROM work_orders 
  WHERE business_id = business_uuid
    AND created_at::DATE BETWEEN start_date AND end_date;
  
  result := jsonb_set(result, '{completion_rate}', completion_rate::TEXT::JSONB);
  
  -- Average job value
  SELECT COALESCE(AVG(total_amount), 0)
  INTO avg_job_value
  FROM work_orders
  WHERE business_id = business_uuid 
    AND status = 'completed'
    AND created_at::DATE BETWEEN start_date AND end_date;
    
  result := jsonb_set(result, '{average_job_value}', avg_job_value::TEXT::JSONB);
  
  -- Technician utilization
  SELECT jsonb_agg(
    jsonb_build_object(
      'technician_id', assigned_technician,
      'jobs_completed', job_count,
      'total_hours', total_hours,
      'revenue_generated', total_revenue
    )
  )
  INTO technician_utilization
  FROM (
    SELECT 
      assigned_technician,
      COUNT(*) as job_count,
      SUM(actual_labor_hours) as total_hours,
      SUM(total_amount) as total_revenue
    FROM work_orders
    WHERE business_id = business_uuid
      AND status = 'completed'
      AND assigned_technician IS NOT NULL
      AND created_at::DATE BETWEEN start_date AND end_date
    GROUP BY assigned_technician
  ) tech_stats;
  
  result := jsonb_set(result, '{technician_utilization}', technician_utilization);
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Data Integrity and Constraints

```sql
-- Advanced constraint functions
CREATE OR REPLACE FUNCTION validate_business_hours(hours JSONB)
RETURNS BOOLEAN AS $$
DECLARE
  day_record JSONB;
BEGIN
  -- Validate business hours format
  FOR day_record IN SELECT * FROM jsonb_array_elements(hours)
  LOOP
    -- Check required fields
    IF NOT (day_record ? 'day' AND day_record ? 'open' AND day_record ? 'close') THEN
      RETURN FALSE;
    END IF;
    
    -- Validate time format
    IF NOT (day_record->>'open' ~ '^\d{2}:\d{2}$' AND day_record->>'close' ~ '^\d{2}:\d{2}$') THEN
      RETURN FALSE;
    END IF;
  END LOOP;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add constraint to businesses table
ALTER TABLE businesses 
ADD CONSTRAINT valid_business_hours 
CHECK (
  settings->>'business_hours' IS NULL 
  OR validate_business_hours((settings->>'business_hours')::JSONB)
);

-- Email validation function
CREATE OR REPLACE FUNCTION is_valid_email(email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Phone validation function  
CREATE OR REPLACE FUNCTION is_valid_phone(phone TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Allow various phone formats
  RETURN phone ~* '^\+?[\d\s\-\(\)\.]{10,}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Currency validation
CREATE OR REPLACE FUNCTION is_valid_currency_amount(amount DECIMAL)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN amount IS NULL OR (amount >= 0 AND amount < 999999999.99);
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

## Performance Optimization

### Indexing Strategy

```sql
-- Comprehensive indexing strategy

-- Composite indexes for common query patterns
CREATE INDEX idx_customers_business_status_created 
ON customers(business_id, customer_status, created_at);

CREATE INDEX idx_work_orders_business_status_scheduled 
ON work_orders(business_id, status, scheduled_date) 
WHERE scheduled_date IS NOT NULL;

-- Partial indexes for filtered queries
CREATE INDEX idx_customers_active 
ON customers(business_id, created_at) 
WHERE customer_status = 'active';

CREATE INDEX idx_work_orders_pending 
ON work_orders(business_id, scheduled_date, assigned_technician)
WHERE status IN ('scheduled', 'dispatched');

-- Expression indexes for calculated values
CREATE INDEX idx_work_orders_total_revenue 
ON work_orders((total_amount + COALESCE(tax_amount, 0)))
WHERE status = 'completed';

-- JSONB indexes for industry-specific data
CREATE INDEX idx_customers_industry_data_gin 
ON customers USING GIN(industry_data);

CREATE INDEX idx_businesses_settings_gin 
ON businesses USING GIN(settings);

-- Covering indexes to avoid table lookups
CREATE INDEX idx_customers_list_covering 
ON customers(business_id, customer_status) 
INCLUDE (name, email, phone, created_at);
```

### Query Optimization Functions

```sql
-- Optimized customer search with proper indexing
CREATE OR REPLACE FUNCTION get_customers_optimized(
  business_uuid UUID,
  search_text TEXT DEFAULT NULL,
  status_filter TEXT DEFAULT NULL,
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0,
  sort_column TEXT DEFAULT 'created_at',
  sort_direction TEXT DEFAULT 'DESC'
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  email TEXT,
  phone TEXT,
  customer_status TEXT,
  created_at TIMESTAMPTZ,
  total_count BIGINT
) AS $$
DECLARE
  base_query TEXT;
  count_query TEXT;
  order_clause TEXT;
BEGIN
  -- Build order clause with validation
  IF sort_column NOT IN ('name', 'email', 'created_at', 'customer_status') THEN
    sort_column := 'created_at';
  END IF;
  
  IF sort_direction NOT IN ('ASC', 'DESC') THEN
    sort_direction := 'DESC';
  END IF;
  
  order_clause := format('ORDER BY %I %s', sort_column, sort_direction);
  
  -- Build base query
  base_query := '
    SELECT 
      c.id,
      c.name,
      c.email, 
      c.phone,
      c.customer_status,
      c.created_at,
      COUNT(*) OVER() as total_count
    FROM customers c
    WHERE c.business_id = $1
  ';
  
  -- Add status filter
  IF status_filter IS NOT NULL THEN
    base_query := base_query || ' AND c.customer_status = $4';
  END IF;
  
  -- Add search filter
  IF search_text IS NOT NULL THEN
    base_query := base_query || ' AND (
      c.search_vector @@ plainto_tsquery($3)
      OR c.name ILIKE $3
      OR c.email ILIKE $3
    )';
  END IF;
  
  -- Add ordering and pagination
  base_query := base_query || format(' %s LIMIT $2 OFFSET $5', order_clause);
  
  -- Execute query with appropriate parameters
  IF search_text IS NOT NULL AND status_filter IS NOT NULL THEN
    RETURN QUERY EXECUTE base_query 
    USING business_uuid, limit_count, '%' || search_text || '%', status_filter, offset_count;
  ELSIF search_text IS NOT NULL THEN
    RETURN QUERY EXECUTE base_query 
    USING business_uuid, limit_count, '%' || search_text || '%', offset_count;
  ELSIF status_filter IS NOT NULL THEN
    RETURN QUERY EXECUTE base_query 
    USING business_uuid, limit_count, status_filter, offset_count;
  ELSE
    RETURN QUERY EXECUTE base_query 
    USING business_uuid, limit_count, offset_count;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Connection Pooling and Performance

```sql
-- Connection and performance monitoring
CREATE OR REPLACE VIEW connection_stats AS
SELECT 
  datname as database_name,
  usename as username,
  client_addr,
  state,
  COUNT(*) as connection_count
FROM pg_stat_activity 
WHERE state IS NOT NULL
GROUP BY datname, usename, client_addr, state;

-- Query performance monitoring
CREATE OR REPLACE VIEW slow_queries AS
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows,
  100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements 
ORDER BY mean_time DESC;

-- Table size monitoring
CREATE OR REPLACE VIEW table_sizes AS
SELECT 
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_stats s
JOIN pg_tables t ON s.tablename = t.tablename
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Database Migrations

### Migration Framework

```sql
-- Migration tracking table
CREATE TABLE IF NOT EXISTS migrations (
  version TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  applied_by TEXT NOT NULL DEFAULT current_user,
  checksum TEXT
);

-- Migration function
CREATE OR REPLACE FUNCTION apply_migration(
  migration_version TEXT,
  migration_description TEXT,
  migration_sql TEXT
)
RETURNS VOID AS $$
DECLARE
  migration_checksum TEXT;
BEGIN
  -- Check if migration already applied
  IF EXISTS (SELECT 1 FROM migrations WHERE version = migration_version) THEN
    RAISE NOTICE 'Migration % already applied', migration_version;
    RETURN;
  END IF;
  
  -- Calculate checksum
  migration_checksum := encode(digest(migration_sql, 'sha256'), 'hex');
  
  -- Execute migration
  EXECUTE migration_sql;
  
  -- Record migration
  INSERT INTO migrations (version, description, checksum)
  VALUES (migration_version, migration_description, migration_checksum);
  
  RAISE NOTICE 'Applied migration %: %', migration_version, migration_description;
END;
$$ LANGUAGE plpgsql;
```

### Sample Migration

```sql
-- Migration: 001_add_customer_preferences.sql
SELECT apply_migration(
  '001',
  'Add customer preferences and notification settings',
  $$
    -- Add preferences column if not exists
    DO $migration$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'notification_preferences'
      ) THEN
        ALTER TABLE customers ADD COLUMN notification_preferences JSONB DEFAULT '{}';
      END IF;
    END $migration$;
    
    -- Add index for preferences
    CREATE INDEX IF NOT EXISTS idx_customers_notification_preferences 
    ON customers USING GIN(notification_preferences);
    
    -- Update existing customers with default preferences
    UPDATE customers 
    SET notification_preferences = '{
      "email": true,
      "sms": false,
      "push": true,
      "marketing": false
    }'
    WHERE notification_preferences = '{}' OR notification_preferences IS NULL;
  $$
);
```

## Backup and Recovery

### Automated Backup Strategy

```sql
-- Backup configuration function
CREATE OR REPLACE FUNCTION configure_backups()
RETURNS VOID AS $$
BEGIN
  -- Enable WAL archiving for point-in-time recovery
  PERFORM pg_reload_conf();
  
  -- Log backup configuration
  INSERT INTO audit_log (
    table_name,
    operation,
    new_data,
    changed_by,
    changed_at
  ) VALUES (
    'system',
    'BACKUP_CONFIG',
    '{"action": "configure_backups", "wal_enabled": true}',
    'system',
    now()
  );
END;
$$ LANGUAGE plpgsql;

-- Point-in-time recovery function
CREATE OR REPLACE FUNCTION create_recovery_point(
  recovery_name TEXT
)
RETURNS TEXT AS $$
DECLARE
  recovery_point TEXT;
BEGIN
  -- Create named recovery point
  recovery_point := pg_create_restore_point(recovery_name);
  
  -- Log recovery point creation
  INSERT INTO audit_log (
    table_name,
    operation,
    new_data,
    changed_by,
    changed_at
  ) VALUES (
    'system',
    'RECOVERY_POINT',
    json_build_object(
      'recovery_name', recovery_name,
      'recovery_point', recovery_point
    ),
    current_user,
    now()
  );
  
  RETURN recovery_point;
END;
$$ LANGUAGE plpgsql;
```

## Testing Database Code

### Unit Testing Framework

```sql
-- Simple testing framework
CREATE SCHEMA IF NOT EXISTS testing;

CREATE TABLE testing.test_results (
  test_name TEXT PRIMARY KEY,
  status TEXT NOT NULL CHECK (status IN ('pass', 'fail')),
  message TEXT,
  executed_at TIMESTAMPTZ DEFAULT now()
);

CREATE OR REPLACE FUNCTION testing.assert_equals(
  test_name TEXT,
  expected ANYELEMENT,
  actual ANYELEMENT
)
RETURNS VOID AS $$
BEGIN
  IF expected = actual OR (expected IS NULL AND actual IS NULL) THEN
    INSERT INTO testing.test_results (test_name, status, message)
    VALUES (test_name, 'pass', format('Expected: %s, Got: %s', expected, actual))
    ON CONFLICT (test_name) DO UPDATE SET
      status = 'pass',
      message = format('Expected: %s, Got: %s', expected, actual),
      executed_at = now();
  ELSE
    INSERT INTO testing.test_results (test_name, status, message)
    VALUES (test_name, 'fail', format('Expected: %s, Got: %s', expected, actual))
    ON CONFLICT (test_name) DO UPDATE SET
      status = 'fail', 
      message = format('Expected: %s, Got: %s', expected, actual),
      executed_at = now();
    
    RAISE NOTICE 'TEST FAILED: % - Expected: %, Got: %', test_name, expected, actual;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Test RLS policies
CREATE OR REPLACE FUNCTION testing.test_rls_policies()
RETURNS VOID AS $$
DECLARE
  test_business_id UUID;
  test_user_id UUID;
  customer_count INTEGER;
BEGIN
  -- Setup test data
  INSERT INTO businesses (name, industry, subdomain)
  VALUES ('Test Business', 'home-services', 'test-business-rls')
  RETURNING id INTO test_business_id;
  
  -- Set business context
  PERFORM set_config('app.current_business_id', test_business_id::TEXT, true);
  
  -- Create test customer
  INSERT INTO customers (business_id, name, email)
  VALUES (test_business_id, 'Test Customer', 'test@example.com');
  
  -- Test that customer is visible with correct business context
  SELECT COUNT(*) INTO customer_count
  FROM customers 
  WHERE business_id = test_business_id;
  
  PERFORM testing.assert_equals('rls_customer_visibility', 1, customer_count);
  
  -- Test that customer is not visible with wrong business context
  PERFORM set_config('app.current_business_id', gen_random_uuid()::TEXT, true);
  
  SELECT COUNT(*) INTO customer_count
  FROM customers 
  WHERE name = 'Test Customer';
  
  PERFORM testing.assert_equals('rls_customer_isolation', 0, customer_count);
  
  -- Cleanup
  PERFORM set_config('app.current_business_id', test_business_id::TEXT, true);
  DELETE FROM customers WHERE business_id = test_business_id;
  DELETE FROM businesses WHERE id = test_business_id;
END;
$$ LANGUAGE plpgsql;

-- Run tests
SELECT testing.test_rls_policies();

-- View test results
SELECT * FROM testing.test_results ORDER BY executed_at DESC;
```

## Next Steps

After mastering database development:

1. **[Testing Strategy](./06-testing-strategy.md)**: Implement comprehensive database and application testing
2. **[Performance Optimization](./07-performance-optimization.md)**: Advanced performance tuning techniques
3. **[Deployment Guide](./08-deployment-guide.md)**: Production database deployment and management

## Database Development Resources

### Tools and Utilities
- **PostgreSQL Documentation**: Official PostgreSQL documentation
- **Supabase CLI**: Local development and migration tools
- **pgAdmin**: Database administration and monitoring
- **Database Design Tools**: ERD creation and schema visualization

### Monitoring and Maintenance
- **Performance Monitoring**: Query analysis and optimization
- **Backup Strategies**: Automated backup and recovery procedures
- **Security Auditing**: Regular security assessment and hardening
- **Capacity Planning**: Growth monitoring and scaling strategies

---

*Last Updated: 2025-01-31*  
*Version: 1.0.0*  
*Previous: [Frontend Development](./04-frontend-development.md) | Next: [Testing Strategy](./06-testing-strategy.md)*