# Home Services Data Management Guide

> **Version**: 1.0.0  
> **Last Updated**: January 2025  
> **Maintained By**: Thorbis Data Management Team  
> **Review Schedule**: Quarterly  

## Overview

This comprehensive data management guide covers all aspects of data handling, storage, and governance specifically for home services businesses. It addresses industry-specific data models, compliance requirements, performance optimization, and data lifecycle management to ensure efficient operations and regulatory compliance.

## Home Services Data Architecture

### Core Data Entities
```typescript
interface HomeServicesDataModel {
  customers: {
    profile: {
      personalInfo: 'Name, contact information, communication preferences',
      propertyDetails: 'Service locations, access instructions, property characteristics',
      serviceHistory: 'Complete history of services provided',
      equipmentRegistry: 'Customer equipment inventory and specifications',
      preferences: 'Service preferences, scheduling availability, payment methods'
    },
    relationships: [
      'properties (1:many)', 
      'workOrders (1:many)', 
      'equipment (1:many)', 
      'invoices (1:many)',
      'contacts (1:many)'
    ]
  },

  properties: {
    locationDetails: {
      address: 'Complete property address with GPS coordinates',
      propertyType: 'Residential, commercial, multi-unit classification',
      accessInstructions: 'Entry codes, key locations, special instructions',
      safetyNotes: 'Hazards, pets, special considerations',
      utilityInformation: 'Electrical panels, water shutoffs, gas meters'
    },
    relationships: [
      'customer (many:1)', 
      'equipment (1:many)', 
      'workOrders (1:many)',
      'serviceAreas (many:many)'
    ]
  },

  workOrders: {
    jobDetails: {
      serviceType: 'HVAC, plumbing, electrical, general maintenance',
      priority: 'Emergency, urgent, routine, scheduled',
      description: 'Detailed problem description and scope',
      diagnosis: 'Technical diagnosis and findings',
      resolution: 'Work performed and parts used'
    },
    scheduling: {
      requestedDate: 'Customer preferred date/time',
      scheduledDate: 'Confirmed appointment date/time',
      estimatedDuration: 'Expected job completion time',
      actualDuration: 'Actual time spent on job',
      technicianAssignment: 'Assigned technician and backup'
    },
    relationships: [
      'customer (many:1)', 
      'property (many:1)', 
      'technician (many:1)',
      'parts (many:many)', 
      'invoices (1:many)'
    ]
  },

  technicians: {
    profile: {
      personalInfo: 'Name, contact, emergency contacts',
      certifications: 'Trade licenses, certifications, training records',
      specializations: 'HVAC, plumbing, electrical expertise levels',
      availability: 'Work schedule, on-call availability',
      serviceArea: 'Geographic coverage areas'
    },
    performance: {
      efficiency: 'Jobs completed per day/week metrics',
      quality: 'Customer satisfaction scores and feedback',
      safety: 'Safety incidents and training compliance',
      revenue: 'Revenue generated and profitability metrics'
    },
    relationships: [
      'workOrders (1:many)', 
      'serviceAreas (many:many)', 
      'certifications (many:many)',
      'schedules (1:many)', 
      'equipment (many:many)'
    ]
  },

  equipment: {
    specifications: {
      type: 'HVAC, plumbing, electrical equipment category',
      manufacturer: 'Equipment manufacturer and brand',
      model: 'Model number and specifications',
      serialNumber: 'Unique equipment identifier',
      installationDate: 'Installation or service start date'
    },
    maintenance: {
      warrantyInfo: 'Warranty terms and expiration dates',
      maintenanceSchedule: 'Preventive maintenance intervals',
      serviceHistory: 'Complete maintenance and repair history',
      parts: 'Compatible parts and components',
      manuals: 'Service manuals and documentation'
    },
    relationships: [
      'customer (many:1)', 
      'property (many:1)', 
      'workOrders (many:many)',
      'maintenanceAgreements (many:many)', 
      'parts (many:many)'
    ]
  }
}
```

### Industry-Specific Data Requirements
```sql
-- Home Services Industry Schema Extensions

-- Customer property characteristics
CREATE TABLE customer_properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id),
    business_id UUID NOT NULL REFERENCES businesses(id),
    
    -- Property identification
    property_name VARCHAR(255),
    property_type VARCHAR(50) NOT NULL CHECK (property_type IN ('residential', 'commercial', 'multi_unit', 'industrial')),
    
    -- Location details
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    country VARCHAR(50) DEFAULT 'US',
    gps_coordinates POINT,
    
    -- Property characteristics
    square_footage INTEGER,
    year_built INTEGER,
    construction_type VARCHAR(100),
    hvac_zones INTEGER DEFAULT 1,
    electrical_service_size INTEGER,
    water_pressure_rating INTEGER,
    
    -- Access and safety information
    access_instructions TEXT,
    gate_codes VARCHAR(255),
    key_location TEXT,
    pet_information TEXT,
    safety_hazards TEXT,
    special_instructions TEXT,
    
    -- Utility information
    electrical_panel_location TEXT,
    water_shutoff_location TEXT,
    gas_shutoff_location TEXT,
    utility_room_access TEXT,
    
    -- System metadata
    is_primary BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    CONSTRAINT unique_customer_property UNIQUE (customer_id, business_id, property_name)
);

-- Customer equipment registry
CREATE TABLE customer_equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id),
    property_id UUID NOT NULL REFERENCES customer_properties(id),
    business_id UUID NOT NULL REFERENCES businesses(id),
    
    -- Equipment identification
    equipment_type VARCHAR(100) NOT NULL,
    equipment_category VARCHAR(50) NOT NULL CHECK (equipment_category IN ('hvac', 'plumbing', 'electrical', 'appliance', 'other')),
    
    -- Manufacturer information
    make VARCHAR(100),
    model VARCHAR(100),
    serial_number VARCHAR(100),
    model_year INTEGER,
    
    -- Installation details
    installation_date DATE,
    installed_by VARCHAR(255),
    installation_location TEXT,
    
    -- Specifications
    capacity VARCHAR(50),
    efficiency_rating VARCHAR(50),
    fuel_type VARCHAR(50),
    voltage VARCHAR(20),
    amperage VARCHAR(20),
    btu_rating INTEGER,
    
    -- Warranty and service information
    warranty_expiry DATE,
    warranty_provider VARCHAR(255),
    last_service_date DATE,
    next_service_due DATE,
    service_interval_months INTEGER DEFAULT 12,
    
    -- Documentation
    manual_url TEXT,
    specification_sheet_url TEXT,
    installation_photos TEXT[],
    
    -- Status and notes
    condition VARCHAR(50) DEFAULT 'good' CHECK (condition IN ('excellent', 'good', 'fair', 'poor', 'needs_replacement')),
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Work order specific to home services
CREATE TABLE work_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id),
    customer_id UUID NOT NULL REFERENCES customers(id),
    property_id UUID NOT NULL REFERENCES customer_properties(id),
    
    -- Work order identification
    work_order_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Service classification
    service_category VARCHAR(50) NOT NULL CHECK (service_category IN ('hvac', 'plumbing', 'electrical', 'general')),
    service_type VARCHAR(100) NOT NULL,
    priority_level VARCHAR(20) DEFAULT 'routine' CHECK (priority_level IN ('emergency', 'urgent', 'routine', 'maintenance')),
    work_order_type VARCHAR(50) DEFAULT 'service' CHECK (work_order_type IN ('service', 'installation', 'maintenance', 'inspection', 'estimate')),
    
    -- Scheduling information
    requested_date TIMESTAMPTZ,
    scheduled_date TIMESTAMPTZ,
    arrival_window_start TIME,
    arrival_window_end TIME,
    estimated_duration INTERVAL,
    
    -- Assignment and status
    assigned_technician_id UUID REFERENCES user_profiles(id),
    status VARCHAR(50) DEFAULT 'created' CHECK (status IN (
        'created', 'scheduled', 'assigned', 'in_progress', 
        'on_hold', 'completed', 'cancelled', 'requires_parts'
    )),
    
    -- Technical information
    problem_description TEXT,
    diagnosis TEXT,
    work_performed TEXT,
    recommendations TEXT,
    
    -- Equipment involved
    equipment_ids UUID[],
    
    -- Financial information
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    labor_cost DECIMAL(10,2),
    parts_cost DECIMAL(10,2),
    
    -- Completion information
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    actual_duration INTERVAL,
    
    -- Quality and satisfaction
    quality_check_passed BOOLEAN,
    customer_signature_url TEXT,
    customer_satisfaction_rating INTEGER CHECK (customer_satisfaction_rating BETWEEN 1 AND 5),
    
    -- Photos and documentation
    before_photos TEXT[],
    after_photos TEXT[],
    diagnostic_data JSONB,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Home services specific inventory categories
CREATE TABLE inventory_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category_type VARCHAR(50) CHECK (category_type IN ('parts', 'tools', 'supplies', 'safety', 'consumables')),
    service_category VARCHAR(50) CHECK (service_category IN ('hvac', 'plumbing', 'electrical', 'general')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    CONSTRAINT unique_business_category UNIQUE (business_id, name)
);

-- Parts and inventory items
CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id),
    category_id UUID NOT NULL REFERENCES inventory_categories(id),
    
    -- Item identification
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(100),
    part_number VARCHAR(100),
    upc_code VARCHAR(50),
    
    -- Supplier information
    preferred_vendor VARCHAR(255),
    vendor_part_number VARCHAR(100),
    alternative_vendors JSONB,
    
    -- Pricing
    unit_cost DECIMAL(10,2),
    unit_price DECIMAL(10,2),
    markup_percentage DECIMAL(5,2),
    
    -- Inventory management
    quantity_on_hand INTEGER DEFAULT 0,
    quantity_available INTEGER DEFAULT 0,
    quantity_committed INTEGER DEFAULT 0,
    reorder_point INTEGER DEFAULT 0,
    reorder_quantity INTEGER DEFAULT 0,
    max_stock_level INTEGER,
    
    -- Physical characteristics
    unit_of_measure VARCHAR(20) DEFAULT 'each',
    weight DECIMAL(8,3),
    dimensions VARCHAR(50),
    
    -- Equipment compatibility
    compatible_equipment_types TEXT[],
    compatible_makes TEXT[],
    compatible_models TEXT[],
    
    -- Documentation
    specification_url TEXT,
    installation_guide_url TEXT,
    warranty_info TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_serialized BOOLEAN DEFAULT false,
    is_hazardous BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    CONSTRAINT unique_business_item UNIQUE (business_id, sku)
);

-- Technician certifications and qualifications
CREATE TABLE technician_certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    technician_id UUID NOT NULL REFERENCES user_profiles(id),
    business_id UUID NOT NULL REFERENCES businesses(id),
    
    -- Certification details
    certification_name VARCHAR(255) NOT NULL,
    certification_type VARCHAR(100) NOT NULL,
    issuing_organization VARCHAR(255),
    certification_number VARCHAR(100),
    
    -- Dates and validity
    issued_date DATE,
    expiry_date DATE,
    renewal_required BOOLEAN DEFAULT true,
    renewal_notification_days INTEGER DEFAULT 30,
    
    -- Documentation
    certificate_url TEXT,
    verification_url TEXT,
    
    -- Status
    is_current BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create comprehensive indexes for performance
CREATE INDEX idx_customer_properties_customer ON customer_properties(customer_id);
CREATE INDEX idx_customer_properties_location ON customer_properties USING GIST(gps_coordinates);
CREATE INDEX idx_customer_equipment_customer ON customer_equipment(customer_id, property_id);
CREATE INDEX idx_work_orders_customer ON work_orders(customer_id, property_id);
CREATE INDEX idx_work_orders_technician ON work_orders(assigned_technician_id);
CREATE INDEX idx_work_orders_scheduled ON work_orders(scheduled_date) WHERE status IN ('scheduled', 'assigned');
CREATE INDEX idx_work_orders_status ON work_orders(status, business_id);
CREATE INDEX idx_inventory_items_availability ON inventory_items(quantity_available) WHERE is_active = true;
CREATE INDEX idx_certifications_expiry ON technician_certifications(expiry_date) WHERE is_current = true;
```

## Data Governance and Compliance

### GDPR and Privacy Compliance
```typescript
interface DataPrivacyCompliance {
  personalDataClassification: {
    highRisk: {
      dataTypes: [
        'Customer social security numbers',
        'Financial account information',
        'Medical information',
        'Background check results'
      ],
      retention: '7 years after service termination',
      encryption: 'AES-256 encryption at rest and in transit',
      access: 'Role-based access with audit logging',
      deletion: 'Automated deletion after retention period'
    },
    
    mediumRisk: {
      dataTypes: [
        'Customer contact information',
        'Property access codes',
        'Service history',
        'Payment information'
      ],
      retention: '5 years after last service',
      encryption: 'Standard encryption protocols',
      access: 'Business need basis with logging',
      deletion: 'Customer-requested or automatic deletion'
    },
    
    lowRisk: {
      dataTypes: [
        'Service preferences',
        'Appointment history',
        'Equipment specifications',
        'Work order details'
      ],
      retention: '3 years for business analytics',
      encryption: 'Standard security measures',
      access: 'Normal business operations',
      deletion: 'Batch deletion processes'
    }
  },

  consentManagement: {
    dataCollection: 'Explicit consent for personal data collection',
    marketing: 'Opt-in consent for marketing communications',
    analytics: 'Cookie consent for analytics and tracking',
    sharing: 'Explicit consent for data sharing with partners',
    retention: 'Clear communication about data retention periods'
  },

  rightToErasure: {
    implementation: 'Customer portal self-service data deletion',
    verification: 'Identity verification before data deletion',
    scope: 'Complete data erasure across all systems',
    exceptions: 'Legal retention requirements and active disputes',
    timeline: '30 days maximum for data deletion completion'
  }
}
```

### Industry-Specific Compliance Requirements
```sql
-- Compliance tracking and audit systems
CREATE TABLE compliance_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id),
    
    -- Event identification
    event_type VARCHAR(100) NOT NULL,
    compliance_framework VARCHAR(100) NOT NULL,
    event_description TEXT NOT NULL,
    
    -- Data subject information
    customer_id UUID REFERENCES customers(id),
    data_subject_type VARCHAR(50),
    
    -- Event details
    event_timestamp TIMESTAMPTZ DEFAULT now(),
    initiated_by UUID REFERENCES user_profiles(id),
    automated BOOLEAN DEFAULT false,
    
    -- Compliance metadata
    legal_basis VARCHAR(100),
    data_categories TEXT[],
    retention_period INTERVAL,
    
    -- Status and verification
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    verification_required BOOLEAN DEFAULT false,
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES user_profiles(id),
    
    -- Documentation
    supporting_documents TEXT[],
    audit_trail JSONB,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Data retention policy implementation
CREATE TABLE data_retention_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id),
    
    -- Policy identification
    policy_name VARCHAR(255) NOT NULL,
    policy_description TEXT,
    data_category VARCHAR(100) NOT NULL,
    
    -- Retention rules
    retention_period INTERVAL NOT NULL,
    retention_basis VARCHAR(255) NOT NULL,
    deletion_trigger VARCHAR(100),
    
    -- Legal and compliance
    legal_basis VARCHAR(255),
    compliance_frameworks TEXT[],
    exceptions TEXT[],
    
    -- Implementation
    automated_deletion BOOLEAN DEFAULT true,
    deletion_schedule VARCHAR(50),
    notification_before_deletion INTERVAL DEFAULT '30 days',
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    effective_date DATE NOT NULL,
    review_date DATE,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Privacy consent tracking
CREATE TABLE privacy_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id),
    business_id UUID NOT NULL REFERENCES businesses(id),
    
    -- Consent details
    consent_type VARCHAR(100) NOT NULL,
    consent_purpose TEXT NOT NULL,
    legal_basis VARCHAR(100) NOT NULL,
    
    -- Consent status
    granted BOOLEAN NOT NULL,
    granted_at TIMESTAMPTZ,
    withdrawn_at TIMESTAMPTZ,
    
    -- Data categories covered
    data_categories TEXT[],
    processing_purposes TEXT[],
    
    -- Consent collection method
    collection_method VARCHAR(100) NOT NULL,
    consent_text TEXT,
    privacy_policy_version VARCHAR(50),
    
    -- Verification and audit
    consent_evidence JSONB,
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

## Data Quality Management

### Data Validation and Cleansing
```sql
-- Data quality monitoring functions
CREATE OR REPLACE FUNCTION validate_customer_data(
    customer_record customers
) RETURNS JSONB AS $$
DECLARE
    validation_results JSONB := '{}'::JSONB;
    score INTEGER := 100;
BEGIN
    -- Validate required fields
    IF customer_record.name IS NULL OR LENGTH(TRIM(customer_record.name)) < 2 THEN
        validation_results := validation_results || '{"name": "Invalid or missing customer name"}'::JSONB;
        score := score - 20;
    END IF;
    
    -- Validate phone number format
    IF customer_record.phone IS NOT NULL AND NOT customer_record.phone ~ '^[\d\s\-\+\(\)]{10,15}$' THEN
        validation_results := validation_results || '{"phone": "Invalid phone number format"}'::JSONB;
        score := score - 10;
    END IF;
    
    -- Validate email format
    IF customer_record.email IS NOT NULL AND NOT customer_record.email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
        validation_results := validation_results || '{"email": "Invalid email address format"}'::JSONB;
        score := score - 10;
    END IF;
    
    -- Check for duplicate detection
    IF EXISTS (
        SELECT 1 FROM customers 
        WHERE business_id = customer_record.business_id 
        AND id != customer_record.id
        AND (
            (phone IS NOT NULL AND phone = customer_record.phone) OR
            (email IS NOT NULL AND email = customer_record.email)
        )
    ) THEN
        validation_results := validation_results || '{"duplicate": "Potential duplicate customer found"}'::JSONB;
        score := score - 15;
    END IF;
    
    -- Return validation summary
    RETURN jsonb_build_object(
        'quality_score', score,
        'validation_issues', validation_results,
        'validated_at', NOW(),
        'is_valid', (score >= 70)
    );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION cleanse_customer_data()
RETURNS TABLE (
    customer_id UUID,
    changes_applied TEXT[],
    quality_improvement INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH data_cleansing AS (
        UPDATE customers SET
            phone = REGEXP_REPLACE(phone, '[^\d]', '', 'g'),
            email = LOWER(TRIM(email)),
            name = INITCAP(TRIM(name)),
            updated_at = NOW()
        WHERE 
            phone ~ '[^\d\s\-\+\(\)]' OR  -- Phone has non-standard characters
            email != LOWER(TRIM(email)) OR  -- Email not normalized
            name != INITCAP(TRIM(name))     -- Name not properly capitalized
        RETURNING 
            id,
            ARRAY[
                CASE WHEN phone IS DISTINCT FROM OLD.phone THEN 'phone_normalized' END,
                CASE WHEN email IS DISTINCT FROM OLD.email THEN 'email_normalized' END,
                CASE WHEN name IS DISTINCT FROM OLD.name THEN 'name_capitalized' END
            ] FILTER (WHERE NOT NULL) as changes,
            15 as improvement  -- Estimated quality score improvement
    )
    SELECT 
        dc.id,
        dc.changes,
        dc.improvement
    FROM data_cleansing dc;
END;
$$ LANGUAGE plpgsql;

-- Automated data quality monitoring
CREATE OR REPLACE FUNCTION monitor_data_quality(
    business_id UUID
) RETURNS TABLE (
    entity_type VARCHAR,
    total_records BIGINT,
    quality_issues BIGINT,
    average_quality_score DECIMAL,
    recommendations TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    WITH quality_metrics AS (
        -- Customer data quality
        SELECT 
            'customers' as entity_type,
            COUNT(*) as total_records,
            COUNT(*) FILTER (WHERE 
                name IS NULL OR LENGTH(TRIM(name)) < 2 OR
                (phone IS NULL AND email IS NULL) OR
                (phone IS NOT NULL AND NOT phone ~ '^[\d\s\-\+\(\)]{10,15}$') OR
                (email IS NOT NULL AND NOT email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
            ) as quality_issues,
            AVG(CASE 
                WHEN name IS NULL OR LENGTH(TRIM(name)) < 2 THEN 60
                WHEN phone IS NULL AND email IS NULL THEN 70
                WHEN phone IS NOT NULL AND NOT phone ~ '^[\d\s\-\+\(\)]{10,15}$' THEN 80
                WHEN email IS NOT NULL AND NOT email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN 80
                ELSE 100
            END) as avg_quality_score,
            ARRAY[
                'Implement phone number validation',
                'Add email verification process',
                'Require minimum name length',
                'Enable duplicate detection'
            ] as recommendations
        FROM customers c
        WHERE c.business_id = monitor_data_quality.business_id
        
        UNION ALL
        
        -- Work order data quality
        SELECT 
            'work_orders' as entity_type,
            COUNT(*) as total_records,
            COUNT(*) FILTER (WHERE 
                description IS NULL OR LENGTH(TRIM(description)) < 10 OR
                service_category IS NULL OR
                (status = 'completed' AND work_performed IS NULL)
            ) as quality_issues,
            AVG(CASE 
                WHEN description IS NULL OR LENGTH(TRIM(description)) < 10 THEN 70
                WHEN service_category IS NULL THEN 60
                WHEN status = 'completed' AND work_performed IS NULL THEN 80
                ELSE 100
            END) as avg_quality_score,
            ARRAY[
                'Require detailed job descriptions',
                'Mandate service category selection',
                'Enforce work completion documentation',
                'Add quality check requirements'
            ] as recommendations
        FROM work_orders wo
        WHERE wo.business_id = monitor_data_quality.business_id
        
        UNION ALL
        
        -- Equipment data quality
        SELECT 
            'customer_equipment' as entity_type,
            COUNT(*) as total_records,
            COUNT(*) FILTER (WHERE 
                make IS NULL OR model IS NULL OR
                installation_date IS NULL OR
                equipment_type IS NULL
            ) as quality_issues,
            AVG(CASE 
                WHEN make IS NULL OR model IS NULL THEN 70
                WHEN installation_date IS NULL THEN 80
                WHEN equipment_type IS NULL THEN 60
                ELSE 100
            END) as avg_quality_score,
            ARRAY[
                'Require equipment make and model',
                'Track installation dates',
                'Standardize equipment type categories',
                'Implement equipment photo requirements'
            ] as recommendations
        FROM customer_equipment ce
        WHERE ce.business_id = monitor_data_quality.business_id
    )
    SELECT * FROM quality_metrics;
END;
$$ LANGUAGE plpgsql;
```

## Performance Optimization

### Database Performance Tuning
```sql
-- Performance optimization for home services queries
CREATE MATERIALIZED VIEW customer_service_summary AS
SELECT 
    c.id as customer_id,
    c.business_id,
    c.name,
    c.email,
    c.phone,
    
    -- Service statistics
    COUNT(wo.id) as total_work_orders,
    COUNT(wo.id) FILTER (WHERE wo.status = 'completed') as completed_jobs,
    COUNT(wo.id) FILTER (WHERE wo.created_at >= NOW() - INTERVAL '90 days') as recent_jobs,
    
    -- Financial metrics
    COALESCE(SUM(wo.actual_cost), 0) as total_revenue,
    COALESCE(AVG(wo.actual_cost), 0) as average_job_value,
    MAX(wo.completed_at) as last_service_date,
    
    -- Service categories
    array_agg(DISTINCT wo.service_category) FILTER (WHERE wo.service_category IS NOT NULL) as service_categories,
    
    -- Customer satisfaction
    AVG(wo.customer_satisfaction_rating) as average_rating,
    COUNT(wo.customer_satisfaction_rating) as rating_count,
    
    -- Equipment count
    (SELECT COUNT(*) FROM customer_equipment ce WHERE ce.customer_id = c.id) as equipment_count,
    
    -- Property count
    (SELECT COUNT(*) FROM customer_properties cp WHERE cp.customer_id = c.id) as property_count,
    
    -- Last update timestamp
    NOW() as last_updated
    
FROM customers c
LEFT JOIN work_orders wo ON c.id = wo.customer_id
WHERE c.is_active = true
GROUP BY c.id, c.business_id, c.name, c.email, c.phone;

-- Create unique index for faster refreshes
CREATE UNIQUE INDEX idx_customer_service_summary_customer 
ON customer_service_summary(customer_id, business_id);

-- Technician performance summary
CREATE MATERIALIZED VIEW technician_performance_summary AS
SELECT 
    up.id as technician_id,
    up.business_id,
    up.name,
    up.email,
    
    -- Job statistics
    COUNT(wo.id) as total_jobs,
    COUNT(wo.id) FILTER (WHERE wo.status = 'completed') as completed_jobs,
    COUNT(wo.id) FILTER (WHERE wo.completed_at >= NOW() - INTERVAL '30 days') as jobs_last_month,
    
    -- Time efficiency
    AVG(EXTRACT(EPOCH FROM wo.actual_duration) / 3600.0) as avg_job_hours,
    SUM(EXTRACT(EPOCH FROM wo.actual_duration) / 3600.0) as total_job_hours,
    
    -- Revenue metrics
    COALESCE(SUM(wo.actual_cost), 0) as total_revenue,
    COALESCE(AVG(wo.actual_cost), 0) as average_job_value,
    
    -- Quality metrics
    AVG(wo.customer_satisfaction_rating) as average_customer_rating,
    COUNT(wo.customer_satisfaction_rating) as rating_count,
    
    -- Service categories
    array_agg(DISTINCT wo.service_category) FILTER (WHERE wo.service_category IS NOT NULL) as specializations,
    
    -- First call resolution rate
    COUNT(*) FILTER (WHERE wo.status = 'completed' AND wo.work_order_type != 'follow_up') * 100.0 / 
    NULLIF(COUNT(*) FILTER (WHERE wo.status = 'completed'), 0) as first_call_resolution_rate,
    
    -- Last update timestamp
    NOW() as last_updated
    
FROM user_profiles up
LEFT JOIN work_orders wo ON up.id = wo.assigned_technician_id
WHERE up.role = 'technician' AND up.is_active = true
GROUP BY up.id, up.business_id, up.name, up.email;

CREATE UNIQUE INDEX idx_technician_performance_summary_tech 
ON technician_performance_summary(technician_id, business_id);

-- Equipment maintenance tracking
CREATE MATERIALIZED VIEW equipment_maintenance_summary AS
SELECT 
    ce.id as equipment_id,
    ce.business_id,
    ce.customer_id,
    ce.property_id,
    ce.equipment_type,
    ce.make,
    ce.model,
    ce.installation_date,
    ce.last_service_date,
    ce.next_service_due,
    
    -- Maintenance statistics
    COUNT(wo.id) as total_services,
    COUNT(wo.id) FILTER (WHERE wo.work_order_type = 'maintenance') as preventive_services,
    COUNT(wo.id) FILTER (WHERE wo.work_order_type = 'service') as repair_services,
    
    -- Service costs
    COALESCE(SUM(wo.actual_cost), 0) as total_service_cost,
    COALESCE(AVG(wo.actual_cost), 0) as average_service_cost,
    
    -- Equipment age and condition
    EXTRACT(YEAR FROM AGE(COALESCE(ce.last_service_date, NOW()), ce.installation_date)) as equipment_age_years,
    ce.condition,
    
    -- Maintenance compliance
    CASE 
        WHEN ce.next_service_due < NOW() THEN 'overdue'
        WHEN ce.next_service_due < NOW() + INTERVAL '30 days' THEN 'due_soon'
        ELSE 'current'
    END as maintenance_status,
    
    -- Last update timestamp
    NOW() as last_updated
    
FROM customer_equipment ce
LEFT JOIN work_orders wo ON ce.id = ANY(wo.equipment_ids)
WHERE ce.is_active = true
GROUP BY 
    ce.id, ce.business_id, ce.customer_id, ce.property_id, 
    ce.equipment_type, ce.make, ce.model, ce.installation_date,
    ce.last_service_date, ce.next_service_due, ce.condition;

CREATE UNIQUE INDEX idx_equipment_maintenance_summary_equipment 
ON equipment_maintenance_summary(equipment_id, business_id);

-- Automated materialized view refresh
CREATE OR REPLACE FUNCTION refresh_performance_views()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY customer_service_summary;
    REFRESH MATERIALIZED VIEW CONCURRENTLY technician_performance_summary;
    REFRESH MATERIALIZED VIEW CONCURRENTLY equipment_maintenance_summary;
END;
$$ LANGUAGE plpgsql;

-- Schedule automatic refresh every hour
SELECT cron.schedule('refresh-performance-views', '0 * * * *', 'SELECT refresh_performance_views();');
```

### Data Archiving and Lifecycle Management
```sql
-- Data archiving functions for home services
CREATE OR REPLACE FUNCTION archive_old_work_orders(
    archive_after_months INTEGER DEFAULT 36,
    dry_run BOOLEAN DEFAULT true
) RETURNS TABLE (
    archived_count BIGINT,
    archived_size_mb BIGINT,
    oldest_archived DATE,
    newest_archived DATE
) AS $$
DECLARE
    archive_cutoff DATE := NOW() - (archive_after_months || ' months')::INTERVAL;
    archive_table_name TEXT := 'work_orders_archive_' || TO_CHAR(NOW(), 'YYYY');
BEGIN
    -- Create archive table if it doesn't exist
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I (
            LIKE work_orders INCLUDING ALL,
            archived_at TIMESTAMPTZ DEFAULT NOW()
        )', archive_table_name);
    
    IF NOT dry_run THEN
        -- Move old completed work orders to archive
        EXECUTE format('
            WITH archived_orders AS (
                DELETE FROM work_orders 
                WHERE status = ''completed'' 
                AND completed_at < %L
                RETURNING *
            )
            INSERT INTO %I 
            SELECT *, NOW() as archived_at FROM archived_orders',
            archive_cutoff, archive_table_name);
    END IF;
    
    -- Return statistics
    RETURN QUERY
    EXECUTE format('
        SELECT 
            COUNT(*)::BIGINT as archived_count,
            (pg_total_relation_size(%L) / 1024 / 1024)::BIGINT as archived_size_mb,
            MIN(completed_at)::DATE as oldest_archived,
            MAX(completed_at)::DATE as newest_archived
        FROM %I 
        WHERE archived_at::DATE = CURRENT_DATE',
        archive_table_name, archive_table_name);
        
    IF dry_run THEN
        RAISE NOTICE 'DRY RUN: Would archive % work orders older than %', 
            (SELECT COUNT(*) FROM work_orders WHERE status = 'completed' AND completed_at < archive_cutoff),
            archive_cutoff;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Customer data retention management
CREATE OR REPLACE FUNCTION apply_data_retention_policies(
    business_id UUID,
    dry_run BOOLEAN DEFAULT true
) RETURNS TABLE (
    policy_name VARCHAR,
    affected_records BIGINT,
    retention_action VARCHAR,
    next_review_date DATE
) AS $$
BEGIN
    RETURN QUERY
    WITH retention_actions AS (
        SELECT 
            drp.policy_name,
            drp.retention_period,
            drp.data_category,
            drp.automated_deletion,
            COUNT(*) as affected_count,
            CASE 
                WHEN drp.automated_deletion THEN 'auto_delete'
                ELSE 'manual_review'
            END as action_type
        FROM data_retention_policies drp
        JOIN LATERAL (
            SELECT COUNT(*) as record_count
            FROM customers c
            WHERE c.business_id = apply_data_retention_policies.business_id
            AND c.updated_at < (NOW() - drp.retention_period)
            AND drp.data_category = 'customer_data'
            
            UNION ALL
            
            SELECT COUNT(*) as record_count  
            FROM work_orders wo
            WHERE wo.business_id = apply_data_retention_policies.business_id
            AND wo.completed_at < (NOW() - drp.retention_period)
            AND drp.data_category = 'service_records'
        ) rc ON true
        WHERE drp.business_id = apply_data_retention_policies.business_id
        AND drp.is_active = true
        GROUP BY drp.policy_name, drp.retention_period, drp.data_category, drp.automated_deletion
    )
    SELECT 
        ra.policy_name::VARCHAR,
        ra.affected_count,
        ra.action_type::VARCHAR,
        (CURRENT_DATE + INTERVAL '90 days')::DATE as next_review_date
    FROM retention_actions ra
    WHERE ra.affected_count > 0;
    
    IF NOT dry_run THEN
        -- Implement actual retention policy actions
        RAISE NOTICE 'Retention policies would be applied here';
    END IF;
END;
$$ LANGUAGE plpgsql;
```

## Data Integration and ETL

### Customer Data Integration
```typescript
interface CustomerDataIntegration {
  externalSources: {
    quickbooksCustomers: {
      syncFrequency: 'Every 15 minutes',
      mapping: {
        'QB.Name': 'customer.name',
        'QB.CompanyName': 'customer.company_name',
        'QB.BillAddr': 'customer.billing_address',
        'QB.Phone': 'customer.phone',
        'QB.Email': 'customer.email'
      },
      conflicts: 'Last modified wins with audit trail',
      dataFlow: 'Bidirectional with business rules'
    },
    
    marketingPlatforms: {
      mailchimp: 'Customer email preferences and campaign data',
      hubspot: 'Lead scoring and marketing attribution',
      googleAds: 'Campaign attribution and lead source tracking'
    },
    
    servicePartnerships: {
      manufacturerWarranties: 'Equipment warranty status and coverage',
      supplierCatalogs: 'Parts availability and pricing updates',
      referralPartners: 'Lead sharing and customer referrals'
    }
  },

  dataTransformation: {
    normalization: {
      phoneNumbers: 'Standardize to E.164 international format',
      addresses: 'Validate and standardize using USPS APIs',
      names: 'Proper case formatting and duplicate detection',
      equipment: 'Standardize make/model naming conventions'
    },
    
    enrichment: {
      geoLocation: 'Add GPS coordinates from addresses',
      demographics: 'Append demographic data from third-party sources',
      creditScoring: 'Integrate credit scoring for payment terms',
      propertyData: 'Public records for property characteristics'
    },
    
    validation: {
      businessRules: 'Apply industry-specific validation rules',
      dataQuality: 'Score and flag low-quality records',
      duplicateDetection: 'Fuzzy matching for duplicate prevention',
      completeness: 'Flag incomplete records for follow-up'
    }
  }
}
```

### ETL Pipeline Implementation
```bash
#!/bin/bash
# Home Services Data Integration Pipeline

# Main ETL pipeline orchestration
home_services_etl_pipeline() {
  echo "=== HOME SERVICES ETL PIPELINE ==="
  local pipeline_id=$(uuidgen)
  local start_time=$(date -u +%Y-%m-%dT%H:%M:%SZ)
  
  echo "Pipeline ID: $pipeline_id"
  echo "Start time: $start_time"
  
  # Phase 1: Data extraction
  extract_external_data() {
    echo "Phase 1: Data Extraction"
    
    # Extract QuickBooks customer data
    echo "Extracting QuickBooks customer data..."
    qb_extract_result=$(extract_quickbooks_customers)
    echo "QuickBooks extraction: $qb_extract_result"
    
    # Extract equipment manufacturer data
    echo "Extracting manufacturer warranty data..."
    warranty_extract_result=$(extract_warranty_data)
    echo "Warranty extraction: $warranty_extract_result"
    
    # Extract supplier catalog updates
    echo "Extracting supplier catalog data..."
    catalog_extract_result=$(extract_supplier_catalogs)
    echo "Catalog extraction: $catalog_extract_result"
  }
  
  # Phase 2: Data transformation
  transform_extracted_data() {
    echo "Phase 2: Data Transformation"
    
    # Normalize customer data
    echo "Normalizing customer data..."
    supabase exec sql --query "
      UPDATE staging_customers SET
        phone = REGEXP_REPLACE(phone, '[^\d]', '', 'g'),
        email = LOWER(TRIM(email)),
        name = INITCAP(TRIM(name)),
        address = standardize_address(address)
      WHERE processing_status = 'extracted';
    "
    
    # Enrich with geolocation data
    echo "Enriching with geolocation..."
    geocode_customer_addresses
    
    # Validate data quality
    echo "Validating data quality..."
    validate_staging_data
  }
  
  # Phase 3: Data loading
  load_transformed_data() {
    echo "Phase 3: Data Loading"
    
    # Load customers with conflict resolution
    echo "Loading customer data..."
    supabase exec sql --query "
      INSERT INTO customers (business_id, name, email, phone, address_line1, city, state, zip_code)
      SELECT 
        business_id, name, email, phone, address_line1, city, state, zip_code
      FROM staging_customers sc
      WHERE processing_status = 'validated'
      ON CONFLICT (business_id, email) DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address_line1 = EXCLUDED.address_line1,
        updated_at = NOW()
      WHERE customers.updated_at < sc.last_modified;
    "
    
    # Load equipment data
    echo "Loading equipment data..."
    load_equipment_data
    
    # Load parts catalog updates
    echo "Loading parts catalog..."
    load_parts_catalog_updates
  }
  
  # Phase 4: Data quality validation
  validate_pipeline_results() {
    echo "Phase 4: Pipeline Validation"
    
    # Check data integrity
    data_integrity_result=$(supabase exec sql --query "
      SELECT 
        COUNT(*) as total_customers,
        COUNT(*) FILTER (WHERE phone IS NOT NULL) as customers_with_phone,
        COUNT(*) FILTER (WHERE email IS NOT NULL) as customers_with_email,
        COUNT(DISTINCT business_id) as business_count
      FROM customers;
    " --csv | tail -1)
    
    echo "Data integrity check: $data_integrity_result"
    
    # Validate referential integrity
    referential_check=$(supabase exec sql --query "
      SELECT 
        COUNT(*) as orphaned_work_orders
      FROM work_orders wo
      LEFT JOIN customers c ON wo.customer_id = c.id
      WHERE c.id IS NULL;
    " --csv | tail -1)
    
    echo "Referential integrity: $referential_check orphaned records"
    
    # Check for duplicates
    duplicate_check=$(supabase exec sql --query "
      WITH duplicates AS (
        SELECT email, COUNT(*) as duplicate_count
        FROM customers 
        WHERE email IS NOT NULL
        GROUP BY email, business_id
        HAVING COUNT(*) > 1
      )
      SELECT COUNT(*) FROM duplicates;
    " --csv | tail -1)
    
    echo "Duplicate check: $duplicate_check potential duplicates"
  }
  
  # Execute pipeline phases
  extract_external_data
  transform_extracted_data
  load_transformed_data
  validate_pipeline_results
  
  local end_time=$(date -u +%Y-%m-%dT%H:%M:%SZ)
  local duration=$(($(date -d "$end_time" +%s) - $(date -d "$start_time" +%s)))
  
  echo "✅ ETL Pipeline completed"
  echo "Duration: ${duration} seconds"
  echo "End time: $end_time"
  
  # Log pipeline execution
  log_etl_execution "$pipeline_id" "$start_time" "$end_time" "$duration"
}

# Extract QuickBooks customer data
extract_quickbooks_customers() {
  local qb_data=$(curl -s -X GET \
    "https://sandbox-quickbooks.api.intuit.com/v3/company/$QB_COMPANY_ID/customers" \
    -H "Authorization: Bearer $QB_ACCESS_TOKEN" \
    -H "Accept: application/json")
  
  if echo "$qb_data" | jq -e '.fault' > /dev/null; then
    echo "ERROR: $(echo "$qb_data" | jq -r '.fault.error[0].detail')"
    return 1
  fi
  
  # Transform and stage QuickBooks data
  echo "$qb_data" | jq -r '.QueryResponse.Customer[] | 
    [.Name, .CompanyName, .PrimaryEmailAddr.Address, .PrimaryPhone.FreeFormNumber, .BillAddr.Line1, .BillAddr.City, .BillAddr.PostalCode] | 
    @csv' > /tmp/qb_customers.csv
  
  # Load into staging table
  supabase exec sql --query "
    TRUNCATE staging_quickbooks_customers;
    \copy staging_quickbooks_customers(name, company_name, email, phone, address, city, zip_code) 
    FROM '/tmp/qb_customers.csv' WITH CSV;
    
    UPDATE staging_quickbooks_customers SET
      processing_status = 'extracted',
      extracted_at = NOW();
  "
  
  local record_count=$(wc -l < /tmp/qb_customers.csv)
  echo "SUCCESS: $record_count records extracted"
}

# Geocode customer addresses
geocode_customer_addresses() {
  echo "Geocoding customer addresses..."
  
  # Get addresses that need geocoding
  addresses=$(supabase exec sql --query "
    SELECT id, address_line1 || ', ' || city || ', ' || state || ' ' || zip_code as full_address
    FROM staging_customers 
    WHERE gps_coordinates IS NULL 
    AND processing_status = 'transformed'
    LIMIT 100;
  " --csv)
  
  echo "$addresses" | tail -n +2 | while IFS=',' read -r customer_id full_address; do
    # Call geocoding API (Google Maps or similar)
    geocode_result=$(curl -s "https://maps.googleapis.com/maps/api/geocode/json?address=$(echo "$full_address" | sed 's/ /%20/g')&key=$GOOGLE_MAPS_API_KEY")
    
    if echo "$geocode_result" | jq -e '.results[0]' > /dev/null; then
      lat=$(echo "$geocode_result" | jq -r '.results[0].geometry.location.lat')
      lng=$(echo "$geocode_result" | jq -r '.results[0].geometry.location.lng')
      
      # Update customer with coordinates
      supabase exec sql --query "
        UPDATE staging_customers SET
          gps_coordinates = POINT($lng, $lat),
          geocoded_at = NOW()
        WHERE id = '$customer_id';
      "
      
      echo "Geocoded customer $customer_id: $lat, $lng"
    else
      echo "Failed to geocode customer $customer_id"
    fi
    
    # Rate limiting
    sleep 0.1
  done
}

# Log ETL execution for monitoring
log_etl_execution() {
  local pipeline_id="$1"
  local start_time="$2"
  local end_time="$3"
  local duration="$4"
  
  supabase exec sql --query "
    INSERT INTO etl_execution_logs (
      pipeline_id, pipeline_type, start_time, end_time, 
      duration_seconds, status, created_at
    ) VALUES (
      '$pipeline_id', 'home_services_main', '$start_time', '$end_time',
      $duration, 'completed', NOW()
    );
  "
}
```

This comprehensive data management guide provides all the necessary frameworks, procedures, and implementations for managing data effectively in home services businesses, ensuring data quality, compliance, and optimal performance while supporting business growth and operational efficiency.