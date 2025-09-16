# Thorbis Business OS - Comprehensive RLS Implementation Guide

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Security Framework](#security-framework)
4. [Industry-Specific Policies](#industry-specific-policies)
5. [Compliance Integration](#compliance-integration)
6. [Performance Optimization](#performance-optimization)
7. [Testing Framework](#testing-framework)
8. [Deployment Procedures](#deployment-procedures)
9. [Maintenance and Monitoring](#maintenance-and-monitoring)
10. [Emergency Procedures](#emergency-procedures)
11. [Troubleshooting](#troubleshooting)
12. [Appendices](#appendices)

## Overview

The Thorbis Business OS Row-Level Security (RLS) implementation provides enterprise-grade, multi-tenant database security with industry-specific access controls, compliance automation, and advanced threat detection capabilities.

### Key Features

- **Multi-Tenant Isolation**: Complete data separation between business entities
- **Industry-Specific Controls**: Tailored access patterns for 7+ industry verticals
- **Attribute-Based Access Control (ABAC)**: Dynamic policy evaluation based on context
- **Compliance Automation**: Built-in support for GDPR, HIPAA, SOX, PCI-DSS, FERPA
- **Behavioral Analytics Integration**: AI-powered anomaly detection and response
- **Data Watermarking**: Cryptographic tracking of sensitive data access
- **Emergency Access Controls**: Break-glass procedures with proper oversight
- **Performance Optimization**: Cached permissions and query optimization

### Compliance Frameworks Supported

| Framework | Description | Implementation Level |
|-----------|-------------|---------------------|
| GDPR Article 32 | Technical and organizational measures | Complete |
| HIPAA Security Rule | Healthcare data protection | Complete |
| SOX Section 404 | Financial data controls | Complete |
| PCI-DSS v4.0 | Payment card data security | Complete |
| FERPA | Educational records privacy | Complete |
| NIST CSF 2.0 | Cybersecurity framework alignment | Complete |
| ISO 27001 | Information security management | Partial |
| CCPA | California consumer privacy | Partial |

## Architecture

### Core Components

```mermaid
graph TB
    A[Client Request] --> B[Authentication Layer]
    B --> C[Security Context Engine]
    C --> D[Permission Cache]
    C --> E[Behavioral Analytics]
    C --> F[Compliance Engine]
    D --> G[RLS Policy Engine]
    E --> G
    F --> G
    G --> H[Database Access]
    G --> I[Audit Logger]
    I --> J[Immutable Audit Trail]
```

### Security Context Architecture

The security context engine evaluates multiple factors for each request:

1. **User Identity and Roles**: Hierarchical role system with inheritance
2. **Business Context**: Multi-tenant isolation and industry classification
3. **Temporal Factors**: Business hours, time zones, seasonal restrictions
4. **Geographic Factors**: Location-based access controls (PostGIS integration)
5. **Behavioral Factors**: Risk scoring and anomaly detection
6. **Device Trust**: Device registration and trust scoring
7. **Data Classification**: Sensitivity-based access controls
8. **Compliance Requirements**: Regulatory framework enforcement

### Data Flow Security

```
Request → Authentication → Context Evaluation → Policy Decision → Access Control → Audit Logging
```

Each step includes:
- **Authentication**: JWT validation and session verification
- **Context Evaluation**: Multi-factor security context assembly
- **Policy Decision**: ABAC engine with caching
- **Access Control**: Row-level filtering with performance optimization
- **Audit Logging**: Immutable trail with cryptographic integrity

## Security Framework

### Multi-Layered Security Model

#### Layer 1: Network Security
- IP-based access restrictions
- Geographic access controls
- VPN requirement for sensitive operations
- Rate limiting and DDoS protection

#### Layer 2: Authentication and Authorization
- Multi-factor authentication (MFA) enforcement
- Biometric authentication support (FIDO2/WebAuthn)
- Role-based access control (RBAC) with inheritance
- Attribute-based access control (ABAC) for dynamic policies

#### Layer 3: Data Protection
- Row-level security (RLS) policies
- Column-level encryption for PII
- Data masking for non-production environments
- Tokenization for sensitive identifiers

#### Layer 4: Audit and Compliance
- Immutable audit trails with cryptographic integrity
- Real-time compliance monitoring
- Automated violation detection and response
- Data lineage tracking

### Security Context Functions

#### Core Context Retrieval
```sql
-- Get comprehensive user context with caching
SELECT * FROM security.get_current_business_context();

-- Returns:
-- business_id, user_id, role_hierarchy, permissions, industry,
-- location, time_zone, security_clearance, data_classification_level,
-- department_ids, team_ids, session_risk_score, device_trusted,
-- mfa_verified, ip_address
```

#### Permission Checking
```sql
-- Check specific permission with context
SELECT security.has_permission(
    'read_customer_data',  -- Permission name
    'customer',            -- Resource type
    customer_id,          -- Resource ID
    'department'          -- Context type
);
```

#### Time-Based Access Control
```sql
-- Check business hours compliance
SELECT security.is_within_business_hours(business_id, override_emergency);
```

#### Geographic Access Control
```sql
-- Check location-based access (PostGIS integration)
SELECT security.is_within_allowed_location(business_id, current_location);
```

## Industry-Specific Policies

### Home Services Industry

#### Work Order Access Control
- **Technicians**: Access only to assigned work orders in their service area
- **Dispatchers**: Full access to all work orders for scheduling optimization
- **Managers**: Complete oversight with reporting capabilities
- **Office Staff**: Read-only access for customer service support

```sql
-- Example: Technician accessing work order
CREATE POLICY "hs_work_orders_field_access" ON hs.work_orders
    FOR ALL TO authenticated
    USING (
        business_id = (SELECT business_id FROM security.get_cached_user_permissions() LIMIT 1)
        AND security.hs_can_access_work_order(id, 'read')
        AND security.check_behavioral_anomalies()
    );
```

#### Customer Data Protection
- **Residential Customers**: Enhanced PII protection (Level 3 classification)
- **Commercial Customers**: Standard business data protection (Level 2)
- **Territory-Based Access**: Service advisors limited to their assigned territories

### Restaurant Industry

#### Point of Sale (POS) Data Security
- **Shift-Based Access**: Employees can only access data from their current shift
- **Tip Privacy Protection**: Employees can only see their own tip information
- **Manager Override**: Managers can access cross-shift data for operational needs

```sql
-- Example: Shift-based POS access
CREATE POLICY "rest_pos_shift_based_access" ON rest.pos_transactions
    FOR ALL TO authenticated
    USING (
        business_id = (SELECT business_id FROM security.get_cached_user_permissions() LIMIT 1)
        AND security.rest_can_access_pos_data(id, 'read')
        AND security.is_within_business_hours(business_id)
    );
```

#### Kitchen Display System (KDS) Integration
- **Kitchen Staff**: Access to order details only (no financial data)
- **Servers**: Access to their assigned table orders
- **Managers**: Full visibility for operational oversight

### Automotive Services

#### VIN-Based Access Control
- **Service Advisors**: Access to vehicles in their customer portfolio
- **Technicians**: Access to vehicles with active work orders assigned to them
- **Parts Department**: Read-only access for parts lookup and ordering

```sql
-- Example: VIN-based vehicle access
CREATE POLICY "auto_vehicles_vin_based_access" ON auto.vehicles
    FOR ALL TO authenticated
    USING (
        business_id = (SELECT business_id FROM security.get_cached_user_permissions() LIMIT 1)
        AND security.auto_can_access_vehicle_data(id, 'read')
        AND security.can_access_data_classification(3, 'vehicle_data')
    );
```

### Banking and Financial Services

#### Enhanced Security Requirements
- **Dual Control**: High-value transactions require two-person authorization
- **MFA Enforcement**: All banking data access requires multi-factor authentication
- **Time-Based Restrictions**: After-hours access requires additional approval
- **Regulatory Compliance**: Automated SOX, BSA, and other regulatory controls

```sql
-- Example: Banking account access with enhanced security
CREATE POLICY "banking_accounts_regulatory_compliance" ON banking.bank_accounts
    FOR ALL TO authenticated
    USING (
        business_id = (SELECT business_id FROM security.get_cached_user_permissions() LIMIT 1)
        AND (SELECT mfa_verified FROM security.get_current_business_context() LIMIT 1) = true
        AND security.banking_can_access_account(id, 'read')
        AND security.check_behavioral_anomalies()
    );
```

### Educational Institutions

#### FERPA Compliance
- **Students**: Access to their own educational records
- **Instructors**: Access to records for their enrolled students only
- **Administrators**: Broader access with legitimate educational interest
- **Directory Information**: Controlled disclosure of public directory data

```sql
-- Example: FERPA-compliant student record access
CREATE POLICY "courses_student_records_ferpa" ON courses.student_records
    FOR ALL TO authenticated
    USING (
        business_id = (SELECT business_id FROM security.get_cached_user_permissions() LIMIT 1)
        AND (
            student_id = auth.uid() -- Students access own records
            OR security.has_educational_interest(id) -- Legitimate educational interest
        )
        AND (SELECT privacy_impact FROM security.log_security_event('ferpa_record_access', 'privacy') IS NOT NULL)
    );
```

### Healthcare (HIPAA Compliance)

#### Minimum Necessary Rule
- **Healthcare Providers**: Access limited to information necessary for treatment
- **Administrative Staff**: Access limited to information necessary for operations
- **Patients**: Full access to their own health information
- **Emergency Access**: Override capabilities for medical emergencies

### Retail and E-commerce

#### Inventory and Pricing Security
- **Location-Based Access**: Store employees limited to their assigned locations
- **Pricing Confidentiality**: Sensitive pricing data restricted to management
- **Customer Data**: PCI-DSS compliance for payment information

## Compliance Integration

### GDPR Implementation

#### Data Subject Rights
```sql
-- Right to Access (Article 15)
SELECT * FROM gdpr.export_user_data(user_id);

-- Right to Rectification (Article 16)
CALL gdpr.update_user_data(user_id, updated_data);

-- Right to Erasure (Article 17)
CALL gdpr.erase_user_data(user_id, erasure_reason);

-- Right to Data Portability (Article 20)
SELECT * FROM gdpr.export_portable_data(user_id, format);
```

#### Consent Management
- **Granular Consent**: Track consent for specific data processing purposes
- **Consent Withdrawal**: Immediate effect on data processing activities
- **Proof of Consent**: Immutable audit trail of consent actions

#### Data Protection Impact Assessments (DPIA)
- **Automated Risk Assessment**: Built-in DPIA triggers for high-risk processing
- **Privacy by Design**: Default privacy-protective settings
- **Data Minimization**: Automatic data retention and deletion

### HIPAA Implementation

#### Administrative Safeguards
- **Access Management**: Role-based access with minimum necessary principle
- **Audit Controls**: Comprehensive logging of all PHI access
- **Training**: Automated compliance training tracking

#### Physical Safeguards
- **Location-Based Access**: Geographic restrictions on data access
- **Device Controls**: Trusted device requirements for PHI access

#### Technical Safeguards
- **Encryption**: At-rest and in-transit encryption for all PHI
- **Access Control**: Unique user identification and authentication
- **Audit Logs**: Immutable audit trails with integrity protection

### SOX Implementation

#### Internal Controls over Financial Reporting (ICFR)
- **Segregation of Duties**: Automated enforcement of financial controls
- **Authorization Controls**: Multi-level approval workflows
- **Documentation**: Comprehensive audit trails for all financial data changes

#### Management Assessment
- **Control Testing**: Automated testing of financial data controls
- **Deficiency Tracking**: Real-time monitoring of control weaknesses
- **Remediation**: Automated workflows for control deficiency resolution

## Performance Optimization

### Caching Strategy

#### Permission Caching
```sql
-- Materialized view for user permissions (refreshed every 15 minutes)
CREATE MATERIALIZED VIEW security.user_permissions_cache AS
SELECT 
    user_id,
    business_id,
    roles,
    permissions,
    department_ids,
    team_ids,
    industry,
    cached_at
FROM user_permission_calculations;
```

#### Query Optimization
- **Index Strategy**: Specialized indexes for RLS policy filters
- **Query Rewriting**: Optimized query plans for common access patterns
- **Statistics Collection**: Regular analysis of query performance

#### Connection Pooling
- **Role-Based Pooling**: Separate connection pools for different user roles
- **Session State Management**: Efficient management of security context
- **Connection Limits**: Resource management for high-concurrency scenarios

### Index Strategy

```sql
-- Business context indexes
CREATE INDEX CONCURRENTLY idx_work_orders_business_technician 
ON hs.work_orders(business_id, assigned_technician_id) WHERE assigned_technician_id IS NOT NULL;

-- Time-based access indexes
CREATE INDEX CONCURRENTLY idx_pos_transactions_business_shift 
ON rest.pos_transactions(business_id, shift_id, employee_id);

-- Geographic access indexes (PostGIS)
CREATE INDEX CONCURRENTLY idx_service_locations_geog 
ON hs.service_locations USING GIST(service_area);

-- Security context indexes
CREATE INDEX CONCURRENTLY idx_user_sessions_active 
ON auth_mgmt.user_sessions(user_id, is_active, expires_at) WHERE is_active = true;
```

### Performance Monitoring

#### Query Performance Metrics
- **RLS Policy Overhead**: Measurement of policy evaluation impact
- **Cache Hit Rates**: Monitoring of permission cache effectiveness
- **Slow Query Detection**: Automated detection of performance regressions

#### Optimization Recommendations
- **Automatic Index Suggestions**: AI-powered index recommendations
- **Query Plan Analysis**: Regular analysis of RLS query execution plans
- **Performance Alerts**: Real-time alerting for performance issues

## Testing Framework

### Automated Policy Testing

```sql
-- Test RLS policy effectiveness
SELECT * FROM security.test_rls_policies(
    'hs.work_orders',
    '{
        "technician_own_orders": {
            "where_clause": "assigned_technician_id = current_user_id()",
            "expected_count": 5
        },
        "technician_other_orders": {
            "where_clause": "assigned_technician_id != current_user_id()",
            "expected_count": 0
        }
    }'::jsonb
);
```

### Compliance Testing

#### GDPR Testing
```sql
-- Test data subject access request
SELECT gdpr.test_data_subject_access(test_user_id);

-- Test right to erasure
SELECT gdpr.test_data_erasure(test_user_id);

-- Test consent withdrawal
SELECT gdpr.test_consent_withdrawal(test_user_id, consent_type);
```

#### HIPAA Testing
```sql
-- Test minimum necessary access
SELECT hipaa.test_minimum_necessary_access(test_patient_id, test_provider_id);

-- Test audit trail completeness
SELECT hipaa.test_audit_trail_completeness(start_date, end_date);
```

### Security Testing

#### Penetration Testing
- **Automated Security Scans**: Regular vulnerability assessments
- **Access Control Testing**: Verification of RLS policy effectiveness
- **Data Leakage Prevention**: Testing for unauthorized data access

#### Compliance Auditing
- **Regular Compliance Scans**: Automated compliance validation
- **Control Testing**: Verification of security control effectiveness
- **Gap Analysis**: Identification of compliance gaps

## Deployment Procedures

### Pre-Deployment Checklist

1. **Database Preparation**
   - [ ] PostgreSQL 17+ with required extensions
   - [ ] Backup completion and verification
   - [ ] Performance baseline establishment
   - [ ] Index optimization completion

2. **Security Validation**
   - [ ] RLS policy syntax validation
   - [ ] Permission model verification
   - [ ] Test user creation and validation
   - [ ] Audit logging verification

3. **Compliance Verification**
   - [ ] GDPR compliance testing
   - [ ] HIPAA safeguard verification
   - [ ] SOX control testing
   - [ ] Industry-specific compliance validation

### Deployment Steps

#### Phase 1: Schema Deployment
```bash
# Deploy core security functions
psql -d thorbis_production -f security-functions.sql

# Deploy RLS policies
psql -d thorbis_production -f comprehensive-rls-policies-2025.sql

# Validate deployment
psql -d thorbis_production -c "SELECT security.validate_rls_deployment();"
```

#### Phase 2: Permission Cache Setup
```bash
# Initialize permission cache
psql -d thorbis_production -c "SELECT security.initialize_permission_cache();"

# Set up cache refresh schedule
psql -d thorbis_production -c "SELECT cron.schedule('refresh-permissions', '*/15 * * * *', 'SELECT security.refresh_permissions_cache();');"
```

#### Phase 3: Monitoring Setup
```bash
# Deploy monitoring functions
psql -d thorbis_production -f monitoring-setup.sql

# Configure alerting
psql -d thorbis_production -c "SELECT monitoring.setup_rls_alerts();"
```

#### Phase 4: Validation and Testing
```bash
# Run comprehensive test suite
pytest tests/security/rls_tests.py

# Validate compliance
python scripts/compliance_validation.py

# Performance validation
python scripts/performance_tests.py
```

### Post-Deployment Verification

1. **Functional Testing**
   - [ ] User login and context establishment
   - [ ] Role-based access verification
   - [ ] Industry-specific policy testing
   - [ ] Emergency access procedures

2. **Performance Validation**
   - [ ] Query performance measurement
   - [ ] Cache effectiveness verification
   - [ ] Resource utilization monitoring
   - [ ] Concurrent user testing

3. **Security Verification**
   - [ ] Access control effectiveness
   - [ ] Audit logging verification
   - [ ] Data leakage prevention
   - [ ] Behavioral analytics integration

## Maintenance and Monitoring

### Regular Maintenance Tasks

#### Daily Tasks
- [ ] Performance metrics review
- [ ] Security event analysis
- [ ] Compliance violation monitoring
- [ ] Audit log integrity verification

#### Weekly Tasks
- [ ] Permission cache optimization
- [ ] Security policy effectiveness review
- [ ] User access pattern analysis
- [ ] Threat intelligence integration

#### Monthly Tasks
- [ ] Comprehensive compliance audit
- [ ] Security policy updates
- [ ] Performance optimization
- [ ] Incident response plan testing

### Monitoring Dashboard

#### Key Performance Indicators (KPIs)
- **Policy Evaluation Time**: Average time for RLS policy evaluation
- **Cache Hit Rate**: Percentage of permission cache hits
- **Compliance Score**: Overall compliance framework adherence
- **Security Incidents**: Number and severity of security events

#### Alerting Thresholds
- **Performance Degradation**: >100ms average policy evaluation time
- **Security Events**: High-risk score events (>0.8)
- **Compliance Violations**: Any critical compliance violations
- **Audit Failures**: Audit log integrity issues

### Health Checks

```sql
-- Daily health check query
SELECT 
    'RLS Health Check' as check_type,
    COUNT(*) as total_policies,
    COUNT(*) FILTER (WHERE enabled = true) as enabled_policies,
    AVG(avg_execution_time_ms) as avg_performance_ms,
    COUNT(*) FILTER (WHERE last_error IS NOT NULL) as policies_with_errors
FROM security.policy_performance_stats
WHERE check_date = CURRENT_DATE;

-- Permission cache health
SELECT 
    'Permission Cache Health' as check_type,
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE cached_at > NOW() - INTERVAL '1 hour') as fresh_cache,
    AVG(EXTRACT(EPOCH FROM (NOW() - cached_at))) as avg_cache_age_seconds
FROM security.user_permissions_cache;

-- Compliance monitoring
SELECT 
    framework,
    compliance_percentage,
    critical_violations,
    last_audit_date
FROM security.compliance_status_overview
WHERE business_id = current_business_id();
```

## Emergency Procedures

### Break-Glass Access

#### Emergency Access Activation
```sql
-- Activate emergency access with justification
SELECT security.break_glass_access(
    'Database corruption affecting customer operations',  -- Justification
    'emergency_code_xyz789',                             -- Approval code
    4                                                    -- Duration in hours
);
```

#### Emergency Access Validation
- **Immediate Notification**: Security team and management alerts
- **Audit Trail**: Comprehensive logging of emergency access usage
- **Time Limitation**: Automatic expiration of emergency permissions
- **Review Process**: Post-incident review and documentation

### Incident Response

#### Security Incident Detection
```sql
-- Automated security event detection
SELECT * FROM security.detect_security_anomalies()
WHERE risk_score > 0.8
ORDER BY created_at DESC;

-- Behavioral anomaly alerts
SELECT * FROM analytics_mgmt.risk_assessments
WHERE risk_level IN ('high', 'very_high', 'critical')
AND assessed_at > NOW() - INTERVAL '1 hour';
```

#### Incident Response Workflow
1. **Detection**: Automated monitoring and alerting
2. **Assessment**: Risk evaluation and impact analysis
3. **Containment**: Immediate threat mitigation
4. **Investigation**: Forensic analysis and evidence collection
5. **Recovery**: System restoration and validation
6. **Lessons Learned**: Process improvement and policy updates

### Disaster Recovery

#### RLS Policy Backup and Recovery
```bash
# Backup RLS policies and functions
pg_dump -d thorbis_production --schema=security > rls_backup_$(date +%Y%m%d).sql

# Recovery procedures
psql -d thorbis_production_recovery -f rls_backup_20250131.sql

# Validation after recovery
psql -d thorbis_production_recovery -c "SELECT security.validate_rls_deployment();"
```

#### Business Continuity
- **Read-Only Mode**: Emergency read-only access during system issues
- **Degraded Operations**: Reduced functionality with essential access maintained
- **Full Recovery**: Complete system restoration with validation

## Troubleshooting

### Common Issues and Solutions

#### Performance Issues

**Problem**: Slow query performance with RLS policies
```sql
-- Diagnosis
EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM hs.work_orders WHERE business_id = 'xxx';

-- Solution: Add appropriate indexes
CREATE INDEX CONCURRENTLY idx_work_orders_business_user 
ON hs.work_orders(business_id, assigned_technician_id);
```

**Problem**: Permission cache staleness
```sql
-- Diagnosis
SELECT cached_at, NOW() - cached_at as age 
FROM security.user_permissions_cache 
WHERE user_id = auth.uid();

-- Solution: Force cache refresh
SELECT security.refresh_permissions_cache();
```

#### Access Control Issues

**Problem**: User cannot access expected data
```sql
-- Diagnosis
SELECT 
    user_id,
    roles,
    permissions,
    'Expected permission not found' as issue
FROM security.user_permissions_cache 
WHERE user_id = 'problem_user_id';

-- Solution: Check role assignments and permissions
SELECT * FROM security.debug_user_access('problem_user_id', 'resource_type');
```

**Problem**: Emergency access not working
```sql
-- Diagnosis
SELECT * FROM security_mgmt.emergency_access_grants 
WHERE user_id = 'user_id' 
AND is_active = true;

-- Solution: Verify approval codes and expiration
SELECT security.validate_emergency_access('user_id');
```

#### Compliance Issues

**Problem**: GDPR compliance violation detected
```sql
-- Diagnosis
SELECT * FROM security_mgmt.compliance_violations 
WHERE framework_name = 'GDPR' 
AND status = 'open'
ORDER BY severity DESC;

-- Solution: Execute remediation plan
CALL gdpr.execute_remediation_plan(violation_id);
```

### Debug Functions

```sql
-- Debug user access for specific resource
CREATE OR REPLACE FUNCTION security.debug_user_access(
    debug_user_id UUID,
    resource_type TEXT
)
RETURNS TABLE(
    check_type TEXT,
    result BOOLEAN,
    details JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Implementation would provide detailed access check results
    RETURN QUERY SELECT 
        'role_check'::TEXT,
        true,
        jsonb_build_object('user_roles', user_roles)
    FROM security.user_permissions_cache 
    WHERE user_id = debug_user_id;
END;
$$;
```

### Performance Troubleshooting

#### Query Plan Analysis
```sql
-- Analyze RLS policy impact on queries
SELECT 
    schemaname,
    tablename,
    attname,
    avg_width,
    n_distinct,
    correlation
FROM pg_stats 
WHERE schemaname IN ('hs', 'rest', 'auto', 'banking')
ORDER BY tablename, attname;

-- Check for missing indexes
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats s
WHERE NOT EXISTS (
    SELECT 1 FROM pg_indexes i 
    WHERE i.schemaname = s.schemaname 
    AND i.tablename = s.tablename 
    AND i.indexdef LIKE '%' || s.attname || '%'
)
AND s.tablename LIKE '%work_orders%';
```

## Appendices

### Appendix A: Security Function Reference

#### Core Security Functions
- `security.get_current_business_context()`: Retrieve complete security context
- `security.has_permission(permission, resource, id, context)`: Check specific permission
- `security.is_within_business_hours(business_id, emergency)`: Time-based access control
- `security.can_access_data_classification(level, type)`: Data classification access
- `security.check_behavioral_anomalies()`: Behavioral risk assessment

#### Industry-Specific Functions
- `security.hs_can_access_work_order(id, type)`: Home services work order access
- `security.rest_can_access_pos_data(id, type)`: Restaurant POS data access
- `security.auto_can_access_vehicle_data(id, type)`: Automotive vehicle data access
- `security.banking_can_access_account(id, type)`: Banking account access

#### Emergency and Audit Functions
- `security.grant_emergency_access(user, level, duration, reason)`: Grant emergency access
- `security.break_glass_access(reason, code, duration)`: Break-glass emergency access
- `security.apply_data_watermark(table, id, reason)`: Apply data watermarking
- `security.log_security_event(type, category, data)`: Log security events

### Appendix B: Compliance Mapping

#### GDPR Article Mapping
| Article | Requirement | Implementation | Status |
|---------|-------------|----------------|---------|
| Article 5 | Data minimization | Column-level access control | ✅ |
| Article 6 | Lawful basis | Consent management system | ✅ |
| Article 15 | Right to access | Data export functions | ✅ |
| Article 17 | Right to erasure | Automated deletion procedures | ✅ |
| Article 20 | Data portability | Structured data export | ✅ |
| Article 25 | Data protection by design | Default privacy settings | ✅ |
| Article 32 | Security of processing | Comprehensive RLS policies | ✅ |

#### HIPAA Safeguard Mapping
| Safeguard | Requirement | Implementation | Status |
|-----------|-------------|----------------|---------|
| 164.308(a)(1) | Security Officer | Role-based access control | ✅ |
| 164.308(a)(3) | Access management | User authentication system | ✅ |
| 164.308(a)(4) | Training | Automated training tracking | ✅ |
| 164.310(a)(1) | Facility access | Location-based access control | ✅ |
| 164.312(a)(1) | Access control | Unique user identification | ✅ |
| 164.312(b) | Audit controls | Immutable audit logging | ✅ |
| 164.312(c)(1) | Integrity | Cryptographic data protection | ✅ |

### Appendix C: Performance Benchmarks

#### Baseline Performance Metrics
- **Policy Evaluation Time**: < 10ms average
- **Permission Cache Hit Rate**: > 95%
- **Query Performance Overhead**: < 20% additional time
- **Concurrent User Support**: 10,000+ simultaneous users
- **Audit Log Throughput**: 100,000+ events/second

#### Optimization Targets
- **Sub-5ms Policy Evaluation**: Advanced caching and optimization
- **99% Cache Hit Rate**: Predictive cache pre-loading
- **<10% Performance Overhead**: Query plan optimization
- **100,000+ Concurrent Users**: Horizontal scaling support
- **1M+ Events/Second**: Distributed audit logging

### Appendix D: Security Baseline Configuration

#### Required PostgreSQL Settings
```postgresql
# Security settings
row_security = on
log_statement = 'all'
log_connections = on
log_disconnections = on
log_checkpoints = on
log_lock_waits = on

# Performance settings
shared_preload_libraries = 'pg_stat_statements'
track_activity_query_size = 2048
log_min_duration_statement = 1000

# Audit settings
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
log_statement = 'mod'
log_min_error_statement = error
```

#### Required Extensions
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- For geographic access controls
CREATE EXTENSION IF NOT EXISTS "pg_cron"; -- For maintenance tasks
```

---

**Document Version**: 2025.1.0  
**Last Updated**: January 31, 2025  
**Next Review**: April 30, 2025  

**Classification**: Internal Use  
**Compliance**: GDPR, HIPAA, SOX, PCI-DSS Compliant