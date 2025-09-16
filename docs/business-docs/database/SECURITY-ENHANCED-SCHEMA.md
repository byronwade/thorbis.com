# Thorbis Business OS - Security-Enhanced Database Schema

> **Enterprise Security Database Architecture**  
> **Database Version**: PostgreSQL 15+  
> **Last Updated**: 2025-01-31  
> **Security Classification**: CONFIDENTIAL

## 🛡️ Security Schema Overview

This enhanced database schema implements comprehensive security controls, role-based access control (RBAC), and industry-specific security requirements across all business verticals.

### Security Schema Organization
```sql
-- Core Security Schemas
CREATE SCHEMA security;          -- RBAC and permission management
CREATE SCHEMA audit_security;    -- Security-specific audit logging
CREATE SCHEMA compliance;        -- Regulatory compliance tracking
CREATE SCHEMA risk_management;   -- Risk assessment and mitigation
CREATE SCHEMA threat_intel;      -- Threat intelligence and monitoring
```

## 🔐 Role-Based Access Control Tables

### Core RBAC Implementation
```sql
CREATE SCHEMA security;

-- Business Role Definitions
CREATE TABLE security.business_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses.businesses(id) ON DELETE CASCADE,
    
    -- Role Definition
    role_name TEXT NOT NULL, -- 'owner', 'manager', 'senior_staff', 'staff', 'viewer', 'api_partner', 'guest'
    role_display_name TEXT NOT NULL,
    role_description TEXT,
    
    -- Role Hierarchy
    parent_role_id UUID REFERENCES security.business_roles(id),
    role_level INTEGER NOT NULL DEFAULT 0, -- 0=highest privilege, 6=lowest
    
    -- Role Configuration
    is_system_role BOOLEAN DEFAULT false, -- Cannot be modified by users
    is_active BOOLEAN DEFAULT true,
    max_users INTEGER, -- Maximum users allowed in this role
    
    -- Security Settings
    requires_mfa BOOLEAN DEFAULT false,
    session_timeout_minutes INTEGER DEFAULT 60,
    concurrent_sessions_allowed INTEGER DEFAULT 1,
    
    -- Geographic and Time Restrictions
    geographic_restrictions JSONB DEFAULT '{}',
    time_restrictions JSONB DEFAULT '{}',
    device_restrictions JSONB DEFAULT '{}',
    
    -- Audit Fields
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES users.users(id),
    updated_by UUID REFERENCES users.users(id),
    
    UNIQUE(business_id, role_name)
);

-- Industry-Specific Role Extensions
CREATE TABLE security.industry_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_role_id UUID NOT NULL REFERENCES security.business_roles(id) ON DELETE CASCADE,
    
    -- Industry Specialization
    industry TEXT NOT NULL, -- 'hs', 'rest', 'auto', 'ret', 'courses', 'payroll', 'investigations'
    specialized_role_name TEXT NOT NULL, -- 'lead_technician', 'sous_chef', 'master_technician', etc.
    
    -- Industry-Specific Permissions
    industry_permissions JSONB DEFAULT '{}',
    certification_requirements JSONB DEFAULT '{}',
    training_requirements JSONB DEFAULT '{}',
    
    -- Operational Scope
    operational_scope JSONB DEFAULT '{}', -- territories, departments, specializations
    financial_limits JSONB DEFAULT '{}', -- spending limits, approval thresholds
    
    -- Equipment/Resource Access
    equipment_access JSONB DEFAULT '{}',
    system_access JSONB DEFAULT '{}',
    data_access_level INTEGER DEFAULT 3, -- 1-6 security classification
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE(business_role_id, industry, specialized_role_name)
);

-- Permission Categories and Definitions
CREATE TABLE security.permission_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Category Definition
    category_name TEXT NOT NULL UNIQUE, -- 'customer_data', 'financial_data', 'staff_management'
    category_display_name TEXT NOT NULL,
    category_description TEXT,
    
    -- Security Classification
    security_level INTEGER NOT NULL DEFAULT 3, -- 1=public to 6=top_secret
    industry_applicable TEXT[] DEFAULT '{}', -- Industries where this category applies
    
    -- Compliance Requirements
    regulatory_frameworks TEXT[] DEFAULT '{}', -- 'PCI_DSS', 'HIPAA', 'GDPR', 'CCPA'
    audit_level TEXT DEFAULT 'medium', -- 'none', 'basic', 'medium', 'high', 'maximum'
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Granular Permissions
CREATE TABLE security.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES security.permission_categories(id) ON DELETE CASCADE,
    
    -- Permission Definition
    permission_name TEXT NOT NULL, -- 'customer_read_basic', 'financial_write', 'staff_schedule'
    permission_display_name TEXT NOT NULL,
    permission_description TEXT,
    
    -- Permission Type
    operation_type TEXT NOT NULL, -- 'create', 'read', 'update', 'delete', 'execute'
    resource_type TEXT NOT NULL, -- 'customer', 'work_order', 'invoice', 'user'
    
    -- Security Requirements
    requires_mfa BOOLEAN DEFAULT false,
    requires_approval BOOLEAN DEFAULT false,
    approval_role_level INTEGER, -- Minimum role level required for approval
    
    -- Conditions and Restrictions
    conditions JSONB DEFAULT '{}', -- Time, location, device restrictions
    data_filters JSONB DEFAULT '{}', -- Row-level security filters
    
    -- Risk Assessment
    risk_level TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    impact_assessment TEXT,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE(category_id, permission_name)
);

-- Role-Permission Assignments
CREATE TABLE security.role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Assignment Details
    business_role_id UUID REFERENCES security.business_roles(id) ON DELETE CASCADE,
    industry_role_id UUID REFERENCES security.industry_roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES security.permissions(id) ON DELETE CASCADE,
    
    -- Grant Configuration
    is_granted BOOLEAN DEFAULT true,
    is_inherited BOOLEAN DEFAULT false, -- From parent role
    grant_level TEXT DEFAULT 'full', -- 'none', 'read_only', 'limited', 'full'
    
    -- Conditional Grants
    conditions JSONB DEFAULT '{}',
    effective_date DATE DEFAULT CURRENT_DATE,
    expiration_date DATE,
    
    -- Approval and Audit
    granted_by UUID REFERENCES users.users(id),
    approved_by UUID REFERENCES users.users(id),
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Ensure only one of business_role_id or industry_role_id is set
    CHECK ((business_role_id IS NOT NULL) != (industry_role_id IS NOT NULL))
);

-- User Role Assignments with Enhanced Tracking
CREATE TABLE security.user_role_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Assignment Details
    user_id UUID NOT NULL REFERENCES users.users(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES businesses.businesses(id) ON DELETE CASCADE,
    business_role_id UUID REFERENCES security.business_roles(id) ON DELETE SET NULL,
    industry_role_id UUID REFERENCES security.industry_roles(id) ON DELETE SET NULL,
    
    -- Assignment Status
    status TEXT DEFAULT 'active', -- 'active', 'inactive', 'suspended', 'pending_approval'
    assignment_reason TEXT,
    
    -- Temporary Assignments
    is_temporary BOOLEAN DEFAULT false,
    temporary_reason TEXT,
    valid_from TIMESTAMPTZ DEFAULT now(),
    valid_until TIMESTAMPTZ,
    
    -- Assignment Approval
    requires_approval BOOLEAN DEFAULT false,
    approved_by UUID REFERENCES users.users(id),
    approved_at TIMESTAMPTZ,
    approval_reason TEXT,
    
    -- Emergency Access
    is_emergency_access BOOLEAN DEFAULT false,
    emergency_justification TEXT,
    emergency_approved_by UUID REFERENCES users.users(id),
    
    -- Geographic and Time Restrictions Override
    location_restrictions JSONB DEFAULT '{}',
    time_restrictions JSONB DEFAULT '{}',
    
    -- Audit Fields
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES users.users(id),
    updated_by UUID REFERENCES users.users(id),
    
    -- Soft Delete
    deleted_at TIMESTAMPTZ NULL,
    deleted_by UUID REFERENCES users.users(id),
    
    UNIQUE(user_id, business_id, business_role_id, industry_role_id) DEFERRABLE
);
```

## 🏠 Home Services Security Tables

```sql
-- Home Services Specific Security
CREATE TABLE security.hs_technician_certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses.businesses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users.users(id) ON DELETE CASCADE,
    
    -- Certification Details
    certification_type TEXT NOT NULL, -- 'hvac_epa_608', 'electrical_license', 'plumbing_master'
    certification_number TEXT,
    issuing_authority TEXT NOT NULL,
    
    -- Validity Period
    issue_date DATE NOT NULL,
    expiration_date DATE NOT NULL,
    renewal_required BOOLEAN DEFAULT true,
    
    -- Verification
    verification_status TEXT DEFAULT 'pending', -- 'pending', 'verified', 'expired', 'revoked'
    verified_by UUID REFERENCES users.users(id),
    verified_at TIMESTAMPTZ,
    
    -- Scope of Work Authorization
    authorized_work_types TEXT[] DEFAULT '{}',
    work_restrictions TEXT[] DEFAULT '{}',
    supervision_required BOOLEAN DEFAULT false,
    
    -- Documentation
    certificate_file_path TEXT,
    verification_document_path TEXT,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Customer Property Access Security
CREATE TABLE security.hs_property_access_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses.businesses(id) ON DELETE CASCADE,
    
    -- Access Details
    customer_id UUID NOT NULL REFERENCES hs.customers(id) ON DELETE CASCADE,
    work_order_id UUID REFERENCES hs.work_orders(id) ON DELETE SET NULL,
    technician_id UUID NOT NULL REFERENCES users.users(id) ON DELETE CASCADE,
    
    -- Access Information
    access_type TEXT NOT NULL, -- 'alarm_code', 'key_location', 'gate_code', 'lockbox_code'
    access_granted_by UUID REFERENCES users.users(id), -- Who provided the access info
    access_granted_at TIMESTAMPTZ DEFAULT now(),
    
    -- Security Measures
    access_method TEXT, -- 'customer_provided', 'emergency_override', 'supervisor_approved'
    witness_present BOOLEAN DEFAULT false,
    witness_name TEXT,
    
    -- Usage Tracking
    access_used BOOLEAN DEFAULT false,
    used_at TIMESTAMPTZ,
    access_notes TEXT,
    
    -- Audit and Compliance
    photo_documentation_path TEXT,
    customer_consent_verified BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ -- Temporary access expiration
);

-- Vehicle and Equipment Security
CREATE TABLE security.hs_vehicle_equipment_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses.businesses(id) ON DELETE CASCADE,
    
    -- Asset Details
    asset_type TEXT NOT NULL, -- 'vehicle', 'diagnostic_equipment', 'specialized_tool'
    asset_identifier TEXT NOT NULL, -- VIN, serial number, asset tag
    asset_description TEXT NOT NULL,
    
    -- Current Assignment
    assigned_to UUID REFERENCES users.users(id), -- Currently assigned technician
    assignment_date TIMESTAMPTZ DEFAULT now(),
    assignment_reason TEXT,
    
    -- Location Tracking
    last_known_location GEOGRAPHY(POINT, 4326),
    location_updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Security Features
    gps_tracking_enabled BOOLEAN DEFAULT false,
    rfid_tag_present BOOLEAN DEFAULT false,
    security_features JSONB DEFAULT '{}',
    
    -- Value and Insurance
    asset_value DECIMAL(12,2),
    insurance_policy_number TEXT,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

## 🍽️ Restaurant Security Tables

```sql
-- Restaurant POS Security
CREATE TABLE security.rest_pos_transaction_monitoring (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses.businesses(id) ON DELETE CASCADE,
    
    -- Transaction Details
    transaction_id UUID NOT NULL,
    pos_terminal_id TEXT NOT NULL,
    employee_id UUID NOT NULL REFERENCES users.users(id),
    
    -- Security Flags
    risk_score INTEGER DEFAULT 0, -- 0-100 risk assessment
    fraud_indicators JSONB DEFAULT '{}',
    requires_manager_approval BOOLEAN DEFAULT false,
    
    -- Manager Override
    manager_override_by UUID REFERENCES users.users(id),
    override_reason TEXT,
    override_timestamp TIMESTAMPTZ,
    
    -- Audit Trail
    transaction_amount DECIMAL(12,2),
    payment_method TEXT,
    unusual_patterns JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Alcohol Service Compliance
CREATE TABLE security.rest_alcohol_service_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses.businesses(id) ON DELETE CASCADE,
    
    -- Service Details
    server_id UUID NOT NULL REFERENCES users.users(id),
    customer_table_id UUID REFERENCES rest.tables(id),
    order_id UUID REFERENCES rest.orders(id),
    
    -- Age Verification
    id_checked BOOLEAN NOT NULL DEFAULT false,
    id_type TEXT, -- 'drivers_license', 'passport', 'state_id'
    id_scanner_used BOOLEAN DEFAULT false,
    customer_birth_date DATE, -- Only stored temporarily for verification
    
    -- Service Decision
    service_approved BOOLEAN NOT NULL,
    denial_reason TEXT, -- If service denied
    
    -- Compliance Tracking
    tips_certification_verified BOOLEAN DEFAULT false,
    server_training_current BOOLEAN DEFAULT false,
    
    -- Legal Hours Compliance
    service_time TIMESTAMPTZ DEFAULT now(),
    legal_service_hours_verified BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Food Safety Compliance Tracking
CREATE TABLE security.rest_food_safety_monitoring (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses.businesses(id) ON DELETE CASCADE,
    
    -- Monitoring Type
    monitoring_type TEXT NOT NULL, -- 'temperature_log', 'cleaning_verification', 'expiration_check'
    station_area TEXT NOT NULL, -- 'walk_in_cooler', 'grill_station', 'prep_area'
    
    -- Employee Responsible
    employee_id UUID NOT NULL REFERENCES users.users(id),
    supervisor_verified_by UUID REFERENCES users.users(id),
    
    -- Compliance Data
    compliance_data JSONB NOT NULL, -- Temperature readings, checklist items, etc.
    compliance_status TEXT DEFAULT 'compliant', -- 'compliant', 'warning', 'violation'
    
    -- Corrective Action
    corrective_action_required BOOLEAN DEFAULT false,
    corrective_action_taken TEXT,
    corrective_action_by UUID REFERENCES users.users(id),
    corrective_action_at TIMESTAMPTZ,
    
    -- Health Department Readiness
    health_inspection_ready BOOLEAN DEFAULT true,
    documentation_path TEXT,
    
    created_at TIMESTAMPTZ DEFAULT now()
);
```

## 🚗 Automotive Security Tables

```sql
-- Vehicle Custody and Security
CREATE TABLE security.auto_vehicle_custody_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses.businesses(id) ON DELETE CASCADE,
    
    -- Vehicle and Customer
    vehicle_id UUID NOT NULL REFERENCES auto.vehicles(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES hs.customers(id) ON DELETE CASCADE,
    repair_order_id UUID REFERENCES auto.repair_orders(id) ON DELETE SET NULL,
    
    -- Custody Transfer
    received_by UUID NOT NULL REFERENCES users.users(id),
    delivered_to UUID REFERENCES users.users(id), -- When returned to customer
    
    -- Vehicle Condition Documentation
    pre_service_photos JSONB DEFAULT '{}', -- Array of photo paths
    post_service_photos JSONB DEFAULT '{}',
    damage_documentation JSONB DEFAULT '{}',
    
    -- Key Management
    keys_received INTEGER DEFAULT 1,
    key_storage_location TEXT,
    key_checked_out_to UUID REFERENCES users.users(id),
    key_return_required_by TIMESTAMPTZ,
    
    -- Personal Property Inventory
    personal_property_inventory JSONB DEFAULT '{}',
    valuable_items_secured BOOLEAN DEFAULT false,
    customer_property_waiver BOOLEAN DEFAULT false,
    
    -- Insurance and Liability
    garage_keepers_coverage_verified BOOLEAN DEFAULT true,
    customer_insurance_notified BOOLEAN DEFAULT false,
    
    -- Status Tracking
    custody_status TEXT DEFAULT 'in_custody', -- 'received', 'in_custody', 'ready_for_delivery', 'delivered'
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Diagnostic Data Security
CREATE TABLE security.auto_diagnostic_data_privacy (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses.businesses(id) ON DELETE CASCADE,
    
    -- Data Source
    vehicle_id UUID NOT NULL REFERENCES auto.vehicles(id) ON DELETE CASCADE,
    repair_order_id UUID NOT NULL REFERENCES auto.repair_orders(id) ON DELETE CASCADE,
    technician_id UUID NOT NULL REFERENCES users.users(id),
    
    -- Diagnostic Information
    diagnostic_tool_used TEXT NOT NULL,
    data_types_collected TEXT[] NOT NULL, -- 'ecu_codes', 'sensor_data', 'driving_patterns'
    
    -- Privacy Compliance
    customer_consent_obtained BOOLEAN NOT NULL DEFAULT false,
    consent_type TEXT, -- 'explicit', 'implied', 'warranty_required'
    data_minimization_applied BOOLEAN DEFAULT true,
    
    -- Data Handling
    data_encrypted BOOLEAN DEFAULT true,
    data_retention_period INTERVAL DEFAULT '30 days',
    auto_delete_scheduled BOOLEAN DEFAULT true,
    
    -- Third Party Sharing
    shared_with_manufacturer BOOLEAN DEFAULT false,
    manufacturer_consent BOOLEAN DEFAULT false,
    sharing_purpose TEXT,
    
    -- Audit and Compliance
    gdpr_compliant BOOLEAN DEFAULT true,
    ccpa_compliant BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    scheduled_deletion_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '30 days')
);

-- Parts Security and Tracking
CREATE TABLE security.auto_high_value_parts_security (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses.businesses(id) ON DELETE CASCADE,
    
    -- Part Identification
    part_number TEXT NOT NULL,
    part_description TEXT NOT NULL,
    part_category TEXT NOT NULL, -- 'catalytic_converter', 'ecm', 'airbag', 'navigation_system'
    
    -- Security Classification
    theft_risk_level TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
    security_requirements JSONB NOT NULL, -- Required security measures
    
    -- Current Status
    current_location TEXT NOT NULL, -- 'secure_storage', 'vehicle_installed', 'awaiting_installation'
    assigned_to_vehicle UUID REFERENCES auto.vehicles(id),
    assigned_to_technician UUID REFERENCES users.users(id),
    
    -- Security Measures
    rfid_tag_id TEXT,
    security_container_id TEXT,
    surveillance_zone TEXT,
    
    -- Tracking History
    last_security_check TIMESTAMPTZ DEFAULT now(),
    next_security_check TIMESTAMPTZ DEFAULT (now() + INTERVAL '24 hours'),
    
    -- Value and Insurance
    part_value DECIMAL(10,2),
    insurance_claim_required BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

## 🛒 Retail Security Tables

```sql
-- Loss Prevention and Fraud Detection
CREATE TABLE security.ret_loss_prevention_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses.businesses(id) ON DELETE CASCADE,
    
    -- Incident Details
    incident_type TEXT NOT NULL, -- 'shoplifting', 'employee_theft', 'return_fraud', 'credit_card_fraud'
    incident_severity TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    
    -- Location and Time
    store_location TEXT,
    incident_area TEXT, -- 'sales_floor', 'checkout', 'stockroom', 'customer_service'
    incident_datetime TIMESTAMPTZ NOT NULL,
    
    -- Parties Involved
    suspect_description TEXT,
    employee_involved UUID REFERENCES users.users(id),
    witness_employees UUID[] DEFAULT '{}',
    
    -- Evidence Collection
    surveillance_footage_available BOOLEAN DEFAULT false,
    footage_retention_period INTERVAL DEFAULT '90 days',
    photos_taken BOOLEAN DEFAULT false,
    documentation_path TEXT,
    
    -- Financial Impact
    estimated_loss DECIMAL(12,2) DEFAULT 0.00,
    recovered_amount DECIMAL(12,2) DEFAULT 0.00,
    insurance_claim_filed BOOLEAN DEFAULT false,
    
    -- Law Enforcement
    police_notified BOOLEAN DEFAULT false,
    case_number TEXT,
    prosecution_pursued BOOLEAN DEFAULT false,
    
    -- Resolution
    incident_status TEXT DEFAULT 'open', -- 'open', 'investigating', 'resolved', 'closed'
    resolution_notes TEXT,
    
    -- Follow-up Actions
    policy_changes_required BOOLEAN DEFAULT false,
    training_required BOOLEAN DEFAULT false,
    security_improvements JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- PCI Compliance Monitoring
CREATE TABLE security.ret_pci_compliance_monitoring (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses.businesses(id) ON DELETE CASCADE,
    
    -- Compliance Area
    pci_requirement TEXT NOT NULL, -- 'network_security', 'cardholder_data_protection', 'access_control'
    compliance_check_type TEXT NOT NULL, -- 'automated_scan', 'manual_audit', 'quarterly_review'
    
    -- Assessment Details
    assessed_by UUID REFERENCES users.users(id),
    assessment_date TIMESTAMPTZ DEFAULT now(),
    
    -- Compliance Status
    compliance_status TEXT NOT NULL, -- 'compliant', 'non_compliant', 'partially_compliant'
    risk_level TEXT DEFAULT 'medium',
    
    -- Findings
    findings JSONB DEFAULT '{}',
    vulnerabilities_identified TEXT[],
    recommendations TEXT[],
    
    -- Remediation
    remediation_required BOOLEAN DEFAULT false,
    remediation_deadline DATE,
    remediation_assigned_to UUID REFERENCES users.users(id),
    remediation_completed BOOLEAN DEFAULT false,
    
    -- External Validation
    external_assessor TEXT,
    qsa_validated BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    next_assessment_due DATE DEFAULT (CURRENT_DATE + INTERVAL '3 months')
);

-- Customer Data Privacy Compliance
CREATE TABLE security.ret_customer_privacy_compliance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses.businesses(id) ON DELETE CASCADE,
    
    -- Customer Reference
    customer_id UUID REFERENCES hs.customers(id) ON DELETE CASCADE,
    
    -- Privacy Consent Tracking
    gdpr_consent_given BOOLEAN DEFAULT false,
    gdpr_consent_date TIMESTAMPTZ,
    ccpa_opt_out_request BOOLEAN DEFAULT false,
    ccpa_request_date TIMESTAMPTZ,
    
    -- Data Processing Purposes
    marketing_consent BOOLEAN DEFAULT false,
    analytics_consent BOOLEAN DEFAULT false,
    personalization_consent BOOLEAN DEFAULT false,
    
    -- Data Subject Requests
    data_portability_requested BOOLEAN DEFAULT false,
    data_deletion_requested BOOLEAN DEFAULT false,
    data_correction_requested BOOLEAN DEFAULT false,
    
    -- Request Processing
    request_processed_by UUID REFERENCES users.users(id),
    request_completed_date TIMESTAMPTZ,
    verification_method TEXT, -- How identity was verified
    
    -- Compliance Documentation
    consent_documentation_path TEXT,
    processing_legal_basis TEXT,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

## 📊 Compliance and Audit Tables

```sql
CREATE SCHEMA compliance;

-- Regulatory Framework Tracking
CREATE TABLE compliance.regulatory_frameworks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Framework Details
    framework_name TEXT NOT NULL UNIQUE, -- 'PCI_DSS', 'HIPAA', 'GDPR', 'CCPA', 'SOX'
    framework_version TEXT NOT NULL,
    jurisdiction TEXT NOT NULL, -- 'US', 'EU', 'CA', 'Global'
    
    -- Applicability
    applicable_industries TEXT[] NOT NULL,
    mandatory_for_industries TEXT[] DEFAULT '{}',
    
    -- Requirements
    total_requirements INTEGER NOT NULL,
    control_categories JSONB NOT NULL,
    assessment_frequency INTERVAL NOT NULL,
    
    -- Updates and Changes
    last_updated DATE NOT NULL,
    next_review_date DATE NOT NULL,
    change_summary TEXT,
    
    -- Implementation Guide
    implementation_guide_url TEXT,
    training_materials_url TEXT,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Business Compliance Status
CREATE TABLE compliance.business_compliance_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses.businesses(id) ON DELETE CASCADE,
    framework_id UUID NOT NULL REFERENCES compliance.regulatory_frameworks(id) ON DELETE CASCADE,
    
    -- Compliance Status
    compliance_status TEXT NOT NULL, -- 'compliant', 'non_compliant', 'partially_compliant', 'not_applicable'
    compliance_percentage DECIMAL(5,2) DEFAULT 0.00, -- 0-100%
    
    -- Assessment Details
    last_assessment_date TIMESTAMPTZ,
    next_assessment_due TIMESTAMPTZ,
    assessed_by UUID REFERENCES users.users(id),
    
    -- Certification Details
    certification_obtained BOOLEAN DEFAULT false,
    certification_number TEXT,
    certification_expiry DATE,
    certification_body TEXT,
    
    -- Gaps and Remediation
    critical_gaps INTEGER DEFAULT 0,
    high_priority_gaps INTEGER DEFAULT 0,
    medium_priority_gaps INTEGER DEFAULT 0,
    low_priority_gaps INTEGER DEFAULT 0,
    
    -- Risk Assessment
    overall_risk_score DECIMAL(5,2), -- 0-100 risk score
    risk_level TEXT, -- 'low', 'medium', 'high', 'critical'
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE(business_id, framework_id)
);

-- Compliance Control Implementation
CREATE TABLE compliance.control_implementations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses.businesses(id) ON DELETE CASCADE,
    framework_id UUID NOT NULL REFERENCES compliance.regulatory_frameworks(id) ON DELETE CASCADE,
    
    -- Control Details
    control_id TEXT NOT NULL, -- Framework-specific control ID
    control_name TEXT NOT NULL,
    control_description TEXT,
    
    -- Implementation Status
    implementation_status TEXT NOT NULL, -- 'not_started', 'in_progress', 'implemented', 'tested', 'verified'
    implementation_percentage DECIMAL(5,2) DEFAULT 0.00,
    
    -- Responsible Parties
    control_owner UUID REFERENCES users.users(id),
    implementation_team UUID[] DEFAULT '{}',
    
    -- Testing and Validation
    last_tested_date TIMESTAMPTZ,
    test_results TEXT,
    effectiveness_rating TEXT, -- 'ineffective', 'partially_effective', 'effective'
    
    -- Evidence and Documentation
    evidence_collected BOOLEAN DEFAULT false,
    documentation_path TEXT,
    
    -- Remediation
    gaps_identified TEXT[],
    remediation_plan TEXT,
    remediation_deadline DATE,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE(business_id, framework_id, control_id)
);
```

## 🔍 Security Monitoring and Threat Intelligence

```sql
CREATE SCHEMA threat_intel;

-- Security Incident Tracking
CREATE TABLE threat_intel.security_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses.businesses(id) ON DELETE CASCADE,
    
    -- Incident Classification
    incident_type TEXT NOT NULL, -- 'data_breach', 'unauthorized_access', 'malware', 'phishing'
    severity_level TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
    incident_category TEXT, -- 'confidentiality', 'integrity', 'availability'
    
    -- Detection Details
    detected_at TIMESTAMPTZ NOT NULL,
    detected_by UUID REFERENCES users.users(id),
    detection_method TEXT, -- 'automated_alert', 'user_report', 'audit_finding'
    
    -- Incident Details
    incident_description TEXT NOT NULL,
    affected_systems TEXT[],
    affected_data_types TEXT[],
    potential_data_exposure BOOLEAN DEFAULT false,
    
    -- Impact Assessment
    estimated_records_affected INTEGER DEFAULT 0,
    financial_impact DECIMAL(12,2),
    operational_impact TEXT,
    reputational_impact TEXT,
    
    -- Response and Resolution
    incident_status TEXT DEFAULT 'open', -- 'open', 'investigating', 'contained', 'resolved', 'closed'
    response_team_activated BOOLEAN DEFAULT false,
    containment_actions TEXT,
    
    -- Timeline
    first_occurred TIMESTAMPTZ,
    last_occurred TIMESTAMPTZ,
    contained_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    
    -- External Notifications
    law_enforcement_notified BOOLEAN DEFAULT false,
    regulators_notified BOOLEAN DEFAULT false,
    customers_notified BOOLEAN DEFAULT false,
    media_notified BOOLEAN DEFAULT false,
    
    -- Lessons Learned
    root_cause_analysis TEXT,
    lessons_learned TEXT,
    preventive_measures TEXT,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Real-time Security Monitoring
CREATE TABLE threat_intel.security_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses.businesses(id) ON DELETE CASCADE,
    
    -- Alert Details
    alert_type TEXT NOT NULL, -- 'authentication_failure', 'privilege_escalation', 'data_exfiltration'
    severity TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
    confidence_level DECIMAL(3,2), -- 0.00-1.00 confidence in alert accuracy
    
    -- Source Information
    source_ip INET,
    source_user_id UUID REFERENCES users.users(id),
    source_device_id TEXT,
    source_location JSONB,
    
    -- Target Information
    target_resource TEXT,
    target_data_classification INTEGER, -- 1-6 security level
    
    -- Alert Data
    alert_data JSONB NOT NULL,
    threat_indicators JSONB DEFAULT '{}',
    
    -- Response Status
    alert_status TEXT DEFAULT 'new', -- 'new', 'investigating', 'false_positive', 'confirmed_threat', 'resolved'
    assigned_to UUID REFERENCES users.users(id),
    response_actions TEXT,
    
    -- Correlation
    related_incidents UUID[], -- Related incident IDs
    correlation_rules_matched TEXT[],
    
    -- Resolution
    resolution TEXT,
    resolved_by UUID REFERENCES users.users(id),
    resolved_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '30 days')
);

-- User Behavior Analytics
CREATE TABLE threat_intel.user_behavior_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses.businesses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users.users(id) ON DELETE CASCADE,
    
    -- Behavior Analysis Period
    analysis_period_start TIMESTAMPTZ NOT NULL,
    analysis_period_end TIMESTAMPTZ NOT NULL,
    
    -- Baseline Behavior
    baseline_login_times TIME[],
    baseline_locations GEOGRAPHY(POINT, 4326)[],
    baseline_devices TEXT[],
    baseline_access_patterns JSONB,
    
    -- Current Behavior
    current_login_times TIME[],
    current_locations GEOGRAPHY(POINT, 4326)[],
    current_devices TEXT[],
    current_access_patterns JSONB,
    
    -- Anomaly Detection
    anomaly_score DECIMAL(5,2), -- 0-100 anomaly score
    anomaly_indicators JSONB DEFAULT '{}',
    risk_factors TEXT[],
    
    -- Behavioral Changes
    significant_changes JSONB DEFAULT '{}',
    change_confidence DECIMAL(3,2), -- Confidence in behavior change detection
    
    -- Alerts Generated
    alerts_generated INTEGER DEFAULT 0,
    high_risk_activities INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT now()
);
```

## 🔒 Enhanced Authentication and Session Management

```sql
-- Extended Session Management with Security Context
CREATE TABLE security.enhanced_user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users.users(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES businesses.businesses(id) ON DELETE CASCADE,
    
    -- Session Details
    session_token_hash TEXT NOT NULL UNIQUE, -- Hashed session token
    refresh_token_hash TEXT UNIQUE, -- Hashed refresh token
    
    -- Device and Client Information
    device_fingerprint TEXT NOT NULL,
    device_type TEXT, -- 'mobile', 'desktop', 'tablet'
    operating_system TEXT,
    browser_info TEXT,
    mobile_app_version TEXT,
    
    -- Network and Location
    ip_address INET NOT NULL,
    user_agent TEXT,
    geolocation GEOGRAPHY(POINT, 4326),
    country_code TEXT,
    city TEXT,
    
    -- Security Assessment
    risk_score INTEGER DEFAULT 0, -- 0-100 risk assessment
    trust_level TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'verified'
    requires_step_up_auth BOOLEAN DEFAULT false,
    
    -- Session Configuration
    session_timeout_minutes INTEGER DEFAULT 60,
    idle_timeout_minutes INTEGER DEFAULT 30,
    absolute_timeout_hours INTEGER DEFAULT 8,
    
    -- Multi-Factor Authentication
    mfa_verified BOOLEAN DEFAULT false,
    mfa_method TEXT, -- 'sms', 'totp', 'hardware_token', 'biometric'
    mfa_verified_at TIMESTAMPTZ,
    
    -- Activity Tracking
    last_activity_at TIMESTAMPTZ DEFAULT now(),
    last_password_verification TIMESTAMPTZ,
    privileged_actions_count INTEGER DEFAULT 0,
    
    -- Session Status
    status TEXT DEFAULT 'active', -- 'active', 'idle', 'locked', 'expired', 'terminated'
    concurrent_session_number INTEGER DEFAULT 1,
    
    -- Termination Details
    terminated_by UUID REFERENCES users.users(id), -- User who terminated session
    termination_reason TEXT, -- 'user_logout', 'timeout', 'security_concern', 'admin_action'
    
    -- Audit Fields
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL,
    terminated_at TIMESTAMPTZ
);

-- Multi-Factor Authentication Management
CREATE TABLE security.mfa_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users.users(id) ON DELETE CASCADE,
    
    -- MFA Method Configuration
    mfa_method TEXT NOT NULL, -- 'totp', 'sms', 'email', 'hardware_token', 'biometric'
    method_name TEXT, -- User-friendly name for the method
    is_primary BOOLEAN DEFAULT false,
    is_backup BOOLEAN DEFAULT false,
    
    -- Method-Specific Configuration
    phone_number TEXT, -- For SMS
    email_address TEXT, -- For email codes
    totp_secret_encrypted TEXT, -- Encrypted TOTP secret
    hardware_token_serial TEXT, -- Hardware token identifier
    
    -- Status and Validation
    is_verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMPTZ,
    verification_code_hash TEXT,
    
    -- Usage Tracking
    last_used_at TIMESTAMPTZ,
    successful_uses INTEGER DEFAULT 0,
    failed_attempts INTEGER DEFAULT 0,
    
    -- Recovery and Backup
    backup_codes_encrypted TEXT, -- Encrypted recovery codes
    backup_codes_used INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

## 📋 Security Indexes and Performance Optimization

```sql
-- Performance indexes for security tables
CREATE INDEX CONCURRENTLY idx_security_user_role_assignments_user_business 
    ON security.user_role_assignments(user_id, business_id) 
    WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY idx_security_user_sessions_active 
    ON security.enhanced_user_sessions(user_id, business_id, status) 
    WHERE status = 'active';

CREATE INDEX CONCURRENTLY idx_security_incidents_business_severity 
    ON threat_intel.security_incidents(business_id, severity_level, incident_status);

CREATE INDEX CONCURRENTLY idx_compliance_status_business_framework 
    ON compliance.business_compliance_status(business_id, framework_id, compliance_status);

-- Geographic indexes for location-based security
CREATE INDEX CONCURRENTLY idx_hs_property_access_location 
    ON security.hs_property_access_log USING GIST(business_id, (customer_id::text));

-- Temporal indexes for audit and compliance
CREATE INDEX CONCURRENTLY idx_security_alerts_created_severity 
    ON threat_intel.security_alerts(created_at DESC, severity) 
    WHERE alert_status != 'resolved';

-- Industry-specific performance indexes
CREATE INDEX CONCURRENTLY idx_auto_vehicle_custody_status 
    ON security.auto_vehicle_custody_log(business_id, custody_status, created_at DESC);

CREATE INDEX CONCURRENTLY idx_rest_alcohol_service_compliance 
    ON security.rest_alcohol_service_log(business_id, service_time DESC) 
    WHERE service_approved = true;

CREATE INDEX CONCURRENTLY idx_ret_loss_prevention_type_severity 
    ON security.ret_loss_prevention_incidents(business_id, incident_type, incident_severity, incident_datetime DESC);
```

## 🛡️ Row Level Security Policies for Security Tables

```sql
-- Enable RLS on all security tables
ALTER TABLE security.business_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE security.industry_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE security.user_role_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance.business_compliance_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE threat_intel.security_incidents ENABLE ROW LEVEL SECURITY;

-- Business role isolation policy
CREATE POLICY security_business_isolation ON security.business_roles
    FOR ALL USING (business_id = auth.get_current_business_id());

-- Industry role access with enhanced security
CREATE POLICY industry_role_access ON security.industry_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM security.business_roles br
            WHERE br.id = industry_roles.business_role_id
            AND br.business_id = auth.get_current_business_id()
        )
    );

-- User role assignment access control
CREATE POLICY user_role_assignment_policy ON security.user_role_assignments
    FOR ALL USING (
        business_id = auth.get_current_business_id()
        AND (
            user_id = auth.uid() OR -- Users can see their own assignments
            EXISTS (
                SELECT 1 FROM security.user_role_assignments ura
                JOIN security.business_roles br ON ura.business_role_id = br.id
                WHERE ura.user_id = auth.uid()
                AND ura.business_id = auth.get_current_business_id()
                AND br.role_level <= 2 -- Manager level and above
            )
        )
    );

-- Compliance data access control
CREATE POLICY compliance_data_access ON compliance.business_compliance_status
    FOR ALL USING (
        business_id = auth.get_current_business_id()
        AND EXISTS (
            SELECT 1 FROM security.user_role_assignments ura
            JOIN security.business_roles br ON ura.business_role_id = br.id
            WHERE ura.user_id = auth.uid()
            AND ura.business_id = auth.get_current_business_id()
            AND br.role_level <= 3 -- Senior staff and above
        )
    );

-- Security incident access control
CREATE POLICY security_incident_access ON threat_intel.security_incidents
    FOR ALL USING (
        business_id = auth.get_current_business_id()
        AND (
            detected_by = auth.uid() OR -- User who detected the incident
            EXISTS (
                SELECT 1 FROM security.user_role_assignments ura
                JOIN security.business_roles br ON ura.business_role_id = br.id
                WHERE ura.user_id = auth.uid()
                AND ura.business_id = auth.get_current_business_id()
                AND br.role_level <= 2 -- Manager level and above for security incidents
            )
        )
    );
```

---

## 📚 Related Documentation

- **[RBAC Security Matrix](./RBAC-SECURITY-MATRIX.md)** - Complete role-based access control framework
- **[Industry Security Policies](./INDUSTRY-SECURITY-POLICIES.md)** - Business vertical security policies
- **[Database Architecture](../core/DATABASE-ARCHITECTURE.md)** - Core database design
- **[Security Architecture](../core/SECURITY-ARCHITECTURE.md)** - Overall security framework

---

*This security-enhanced database schema provides enterprise-grade security controls, comprehensive audit trails, and industry-specific compliance management for the Thorbis Business OS platform.*

**Document Classification**: CONFIDENTIAL  
**Document Maintainer**: Database Security Team  
**Review Cycle**: Quarterly  
**Next Review**: April 30, 2025