# Thorbis Row Level Security (RLS) Test Matrix

Comprehensive test suite for multi-tenant Row Level Security policies ensuring proper data isolation and role-based access control across all Thorbis resources.

## RLS Test Architecture

### Security Model Overview
- **Multi-tenancy**: Complete data isolation between tenants
- **Role-based Access**: Hierarchical permissions within tenants
- **Resource-level Security**: Fine-grained access to specific records
- **Cross-tenant Protection**: Absolute prevention of data leakage

### Test Categories
- **Tenant Isolation**: Cross-tenant access prevention
- **Role Permissions**: Role-based access validation  
- **Resource Ownership**: Record-level access control
- **API Endpoint Security**: Route-level authorization
- **Data Modification**: Insert/Update/Delete permissions
- **Query Filtering**: Automatic data filtering by RLS

## Access Control Matrix

### Role Hierarchy
```
Owner (tenant_admin)
├── Full access to all tenant resources
├── User management (create/delete/modify roles)
├── Billing and subscription management
└── Tenant settings and configuration

Manager (business_manager)
├── Business operations (invoices, jobs, customers)  
├── Staff scheduling and assignment
├── Reporting and analytics
└── Limited user management (staff only)

Staff (field_worker, server, cashier)
├── Assigned jobs/orders/tasks
├── Customer interactions for assigned work
├── Basic reporting (own activities)
└── Profile management

Viewer (read_only)
├── Read access to business data
├── Reporting and analytics
└── No modification permissions

API Partner (external_integration)
├── Specific API endpoints only
├── Read access to shared resources
└── No direct database access
```

### Resource Access Matrix
```
Resource Type    | Owner | Manager | Staff | Viewer | API Partner
-----------------|-------|---------|-------|--------|------------
Invoices         | CRUD  | CRUD    | R     | R      | R*
Jobs/Appointments| CRUD  | CRUD    | RU**  | R      | R*
Customers        | CRUD  | CRUD    | R***  | R      | R*
Staff/Users      | CRUD  | CRU     | R     | R      | -
Reports          | CRUD  | CRUD    | R     | R      | -
Settings         | CRUD  | RU      | R     | R      | -
Billing          | CRUD  | R       | -     | -      | -
Integrations     | CRUD  | RU      | -     | R      | R*

Legend:
C = Create, R = Read, U = Update, D = Delete
* = Limited to specific endpoints and data fields
** = Update only assigned jobs
*** = Read only customers for assigned jobs
- = No access
```

## Tenant Isolation Tests

### Cross-Tenant Data Access Prevention
```yaml
test_suite: tenant_isolation
description: Ensure complete data isolation between tenants

test_cases:
  - name: "Invoice cross-tenant access blocked"
    setup:
      tenant_a:
        id: "tenant_a_123"
        invoices: 
          - id: "inv_a_001"
            customer_id: "cust_a_001"
            amount: 500.00
      tenant_b:
        id: "tenant_b_456" 
        user_id: "user_b_001"
        role: "owner"
    
    test_queries:
      - query: "SELECT * FROM invoices WHERE id = 'inv_a_001'"
        user_context: "user_b_001" (tenant_b)
        expected_result: "EMPTY_SET"
        expected_count: 0
        assertion: "User from tenant_b cannot see tenant_a invoices"
        
      - query: "SELECT * FROM invoices"
        user_context: "user_b_001" (tenant_b)  
        expected_result: "ONLY_TENANT_B_INVOICES"
        assertion: "Only sees invoices from own tenant"
        
      - query: "INSERT INTO invoices (customer_id, amount, tenant_id) VALUES ('cust_a_001', 100.00, 'tenant_a_123')"
        user_context: "user_b_001" (tenant_b)
        expected_result: "RLS_VIOLATION_ERROR"
        assertion: "Cannot insert invoices for other tenants"

  - name: "Customer data cross-tenant isolation"
    setup:
      tenant_a:
        customers:
          - id: "cust_a_001"
            name: "Alice Johnson"
            email: "alice@example.com"
      tenant_b:
        user_id: "user_b_001"
        role: "manager"
        
    test_queries:
      - query: "SELECT email FROM customers WHERE name LIKE 'Alice%'"
        user_context: "user_b_001" (tenant_b)
        expected_result: "EMPTY_SET"
        assertion: "Cannot search customers across tenants"
        
      - query: "UPDATE customers SET email = 'hacked@evil.com' WHERE id = 'cust_a_001'"
        user_context: "user_b_001" (tenant_b)
        expected_result: "RLS_VIOLATION_ERROR"
        assertion: "Cannot modify other tenant's customers"

  - name: "Job assignment cross-tenant protection"
    setup:
      tenant_a:
        jobs:
          - id: "job_a_001"
            customer_id: "cust_a_001"
            technician_id: "tech_a_001"
            status: "in_progress"
      tenant_b:
        user_id: "tech_b_001"
        role: "staff"
        
    test_queries:
      - query: "UPDATE jobs SET technician_id = 'tech_b_001' WHERE id = 'job_a_001'"
        user_context: "tech_b_001" (tenant_b)
        expected_result: "RLS_VIOLATION_ERROR"
        assertion: "Cannot assign jobs across tenants"
        
      - query: "SELECT * FROM jobs WHERE technician_id = 'tech_a_001'"
        user_context: "tech_b_001" (tenant_b)
        expected_result: "EMPTY_SET"
        assertion: "Cannot view other tenant's job assignments"

test_matrix_results:
  tenant_a_to_tenant_b: "❌ BLOCKED"
  tenant_b_to_tenant_a: "❌ BLOCKED"
  tenant_a_to_tenant_a: "✅ ALLOWED"
  tenant_b_to_tenant_b: "✅ ALLOWED"
```

## Role-Based Access Tests

### Owner Role Tests
```yaml
test_suite: owner_role_permissions
description: Validate owner role has full tenant access

test_cases:
  - name: "Owner full CRUD access"
    setup:
      user_id: "owner_001"
      tenant_id: "tenant_123"
      role: "owner"
      
    test_queries:
      - operation: "CREATE"
        query: "INSERT INTO invoices (customer_id, amount) VALUES ('cust_001', 500.00)"
        expected_result: "SUCCESS"
        
      - operation: "READ"
        query: "SELECT * FROM invoices"
        expected_result: "ALL_TENANT_INVOICES"
        
      - operation: "UPDATE"  
        query: "UPDATE invoices SET amount = 600.00 WHERE id = 'inv_001'"
        expected_result: "SUCCESS"
        
      - operation: "DELETE"
        query: "DELETE FROM invoices WHERE id = 'inv_001'"
        expected_result: "SUCCESS"

  - name: "Owner user management"
    test_queries:
      - query: "INSERT INTO users (email, role, tenant_id) VALUES ('new@example.com', 'staff', 'tenant_123')"
        expected_result: "SUCCESS"
        
      - query: "UPDATE users SET role = 'manager' WHERE email = 'staff@example.com'"
        expected_result: "SUCCESS"
        
      - query: "DELETE FROM users WHERE role = 'staff' AND tenant_id = 'tenant_123'"
        expected_result: "SUCCESS"

  - name: "Owner billing access"
    test_queries:
      - query: "SELECT * FROM billing_usage WHERE tenant_id = 'tenant_123'"
        expected_result: "ALL_BILLING_DATA"
        
      - query: "UPDATE tenant_settings SET plan_type = 'enterprise' WHERE tenant_id = 'tenant_123'"
        expected_result: "SUCCESS"

test_results:
  create_permissions: "✅ GRANTED"
  read_permissions: "✅ GRANTED"  
  update_permissions: "✅ GRANTED"
  delete_permissions: "✅ GRANTED"
  user_management: "✅ GRANTED"
  billing_access: "✅ GRANTED"
```

### Manager Role Tests  
```yaml
test_suite: manager_role_permissions
description: Validate manager role business operations access

test_cases:
  - name: "Manager business operations"
    setup:
      user_id: "manager_001"
      tenant_id: "tenant_123"
      role: "manager"
      
    test_queries:
      - operation: "CREATE_INVOICE"
        query: "INSERT INTO invoices (customer_id, amount) VALUES ('cust_001', 300.00)"
        expected_result: "SUCCESS"
        
      - operation: "SCHEDULE_JOB"
        query: "INSERT INTO jobs (customer_id, technician_id, service_type) VALUES ('cust_001', 'tech_001', 'HVAC')"
        expected_result: "SUCCESS"
        
      - operation: "MANAGE_CUSTOMERS"
        query: "UPDATE customers SET phone = '555-0123' WHERE id = 'cust_001'"
        expected_result: "SUCCESS"

  - name: "Manager user management limits"
    test_queries:
      - query: "INSERT INTO users (email, role) VALUES ('newstaff@example.com', 'staff')"
        expected_result: "SUCCESS"
        
      - query: "INSERT INTO users (email, role) VALUES ('newowner@example.com', 'owner')"
        expected_result: "RLS_VIOLATION_ERROR"
        assertion: "Cannot create owner accounts"
        
      - query: "UPDATE users SET role = 'owner' WHERE email = 'staff@example.com'"
        expected_result: "RLS_VIOLATION_ERROR" 
        assertion: "Cannot promote users to owner"
        
      - query: "DELETE FROM users WHERE role = 'owner'"
        expected_result: "RLS_VIOLATION_ERROR"
        assertion: "Cannot delete owner accounts"

  - name: "Manager billing restrictions"
    test_queries:
      - query: "SELECT * FROM billing_usage WHERE tenant_id = 'tenant_123'"
        expected_result: "LIMITED_BILLING_DATA"
        assertion: "Can view usage but not modify billing"
        
      - query: "UPDATE tenant_settings SET plan_type = 'enterprise'"
        expected_result: "RLS_VIOLATION_ERROR"
        assertion: "Cannot modify subscription plans"

test_results:
  business_operations: "✅ GRANTED"
  staff_management: "✅ GRANTED"
  owner_management: "❌ BLOCKED"
  billing_modifications: "❌ BLOCKED"
  billing_viewing: "✅ LIMITED"
```

### Staff Role Tests
```yaml
test_suite: staff_role_permissions
description: Validate staff role limited access to assigned work

test_cases:
  - name: "Staff job access - assigned jobs"
    setup:
      user_id: "staff_001" 
      tenant_id: "tenant_123"
      role: "staff"
      assigned_jobs:
        - id: "job_assigned_001"
          technician_id: "staff_001"
          customer_id: "cust_001"
        - id: "job_assigned_002"
          technician_id: "staff_001"
          customer_id: "cust_002"
      unassigned_jobs:
        - id: "job_other_001"
          technician_id: "other_tech_001"
          customer_id: "cust_003"
          
    test_queries:
      - query: "SELECT * FROM jobs WHERE technician_id = 'staff_001'"
        expected_result: "ASSIGNED_JOBS_ONLY"
        expected_count: 2
        assertion: "Can see own assigned jobs"
        
      - query: "SELECT * FROM jobs"
        expected_result: "ASSIGNED_JOBS_ONLY"  
        expected_count: 2
        assertion: "RLS filters to show only assigned jobs"
        
      - query: "UPDATE jobs SET status = 'completed' WHERE id = 'job_assigned_001'"
        expected_result: "SUCCESS"
        assertion: "Can update assigned jobs"
        
      - query: "UPDATE jobs SET status = 'completed' WHERE id = 'job_other_001'"
        expected_result: "RLS_VIOLATION_ERROR"
        assertion: "Cannot update other technician's jobs"

  - name: "Staff customer access - job-related only"
    setup:
      accessible_customers:  # Customers for assigned jobs
        - id: "cust_001"
        - id: "cust_002" 
      inaccessible_customers:  # Customers for other jobs
        - id: "cust_003"
        - id: "cust_004"
        
    test_queries:
      - query: "SELECT * FROM customers WHERE id IN ('cust_001', 'cust_002')"
        expected_result: "SUCCESS"
        expected_count: 2
        assertion: "Can view customers for assigned jobs"
        
      - query: "SELECT * FROM customers WHERE id = 'cust_003'"
        expected_result: "EMPTY_SET"
        assertion: "Cannot view customers for unassigned jobs"
        
      - query: "SELECT * FROM customers"
        expected_result: "JOB_RELATED_CUSTOMERS_ONLY"
        expected_count: 2
        assertion: "RLS filters to job-related customers only"

  - name: "Staff invoice restrictions"
    test_queries:
      - query: "SELECT * FROM invoices"
        expected_result: "ASSIGNED_JOB_INVOICES_ONLY"
        assertion: "Can only see invoices for assigned jobs"
        
      - query: "INSERT INTO invoices (customer_id, amount) VALUES ('cust_001', 200.00)"
        expected_result: "RLS_VIOLATION_ERROR"
        assertion: "Cannot create invoices"
        
      - query: "UPDATE invoices SET amount = 250.00 WHERE customer_id = 'cust_001'"
        expected_result: "RLS_VIOLATION_ERROR"  
        assertion: "Cannot modify invoices"

test_results:
  assigned_job_access: "✅ GRANTED"
  unassigned_job_access: "❌ BLOCKED"
  job_customer_access: "✅ LIMITED"
  invoice_creation: "❌ BLOCKED"
  invoice_viewing: "✅ LIMITED"
```

### Viewer Role Tests
```yaml
test_suite: viewer_role_permissions  
description: Validate viewer role read-only access

test_cases:
  - name: "Viewer read-only access"
    setup:
      user_id: "viewer_001"
      tenant_id: "tenant_123"
      role: "viewer"
      
    test_queries:
      - query: "SELECT * FROM invoices"
        expected_result: "ALL_TENANT_INVOICES"
        assertion: "Can read all tenant invoices"
        
      - query: "SELECT * FROM jobs" 
        expected_result: "ALL_TENANT_JOBS"
        assertion: "Can read all tenant jobs"
        
      - query: "SELECT * FROM customers"
        expected_result: "ALL_TENANT_CUSTOMERS"
        assertion: "Can read all tenant customers"

  - name: "Viewer write restrictions"
    test_queries:
      - query: "INSERT INTO invoices (customer_id, amount) VALUES ('cust_001', 100.00)"
        expected_result: "RLS_VIOLATION_ERROR"
        assertion: "Cannot create invoices"
        
      - query: "UPDATE jobs SET status = 'completed' WHERE id = 'job_001'"
        expected_result: "RLS_VIOLATION_ERROR"
        assertion: "Cannot update jobs"
        
      - query: "DELETE FROM customers WHERE id = 'cust_001'"
        expected_result: "RLS_VIOLATION_ERROR"
        assertion: "Cannot delete customers"

  - name: "Viewer sensitive data restrictions"
    test_queries:
      - query: "SELECT * FROM users"
        expected_result: "RLS_VIOLATION_ERROR"
        assertion: "Cannot view user management data"
        
      - query: "SELECT * FROM billing_usage"
        expected_result: "RLS_VIOLATION_ERROR"
        assertion: "Cannot view billing information"

test_results:
  read_business_data: "✅ GRANTED"
  write_operations: "❌ BLOCKED"
  user_management_access: "❌ BLOCKED"
  billing_access: "❌ BLOCKED"
```

### API Partner Role Tests
```yaml
test_suite: api_partner_permissions
description: Validate API partner limited endpoint access

test_cases:
  - name: "API partner allowed endpoints"
    setup:
      user_id: "api_partner_001"
      tenant_id: "tenant_123"
      role: "api_partner"
      api_key: "ak_live_123456789"
      
    test_queries:
      - endpoint: "GET /api/truth-layer/businesses/tenant_123"
        expected_result: "SUCCESS"
        expected_fields: ["id", "name", "industry", "public_info"]
        restricted_fields: ["billing_info", "internal_notes", "user_data"]
        assertion: "Can access public business information"
        
      - endpoint: "GET /api/truth-layer/availability/tenant_123"
        expected_result: "SUCCESS"
        assertion: "Can check business availability"
        
      - endpoint: "POST /api/truth-layer/bookings/hold"
        payload:
          business_id: "tenant_123"
          service: "HVAC Maintenance"
          requested_time: "2024-09-01T10:00:00Z"
        expected_result: "SUCCESS"
        assertion: "Can create booking holds"

  - name: "API partner restricted endpoints"
    test_queries:
      - endpoint: "GET /api/internal/users"
        expected_result: "RLS_VIOLATION_ERROR"
        assertion: "Cannot access internal user data"
        
      - endpoint: "POST /api/invoices"
        expected_result: "RLS_VIOLATION_ERROR"
        assertion: "Cannot create invoices directly"
        
      - endpoint: "GET /api/billing/usage"
        expected_result: "RLS_VIOLATION_ERROR"
        assertion: "Cannot access billing information"
        
      - endpoint: "DELETE /api/customers/cust_001"
        expected_result: "RLS_VIOLATION_ERROR"
        assertion: "Cannot delete customer records"

  - name: "API partner data filtering"
    test_queries:
      - endpoint: "GET /api/truth-layer/reviews/tenant_123"
        expected_result: "PUBLIC_REVIEWS_ONLY"
        assertion: "Can only see public reviews"
        excluded_fields: ["customer_email", "internal_notes", "private_feedback"]
        
      - endpoint: "GET /api/truth-layer/services/tenant_123"
        expected_result: "PUBLIC_SERVICES_ONLY"
        assertion: "Can only see publicly available services"

test_results:
  truth_layer_endpoints: "✅ GRANTED"
  internal_api_endpoints: "❌ BLOCKED"
  public_data_access: "✅ GRANTED"
  private_data_access: "❌ BLOCKED"
```

## Resource-Level Security Tests

### Record Ownership Validation
```yaml
test_suite: record_ownership
description: Validate record-level ownership and access controls

test_cases:
  - name: "Invoice ownership validation"
    setup:
      tenant_123:
        user_manager_001:
          role: "manager"
          created_invoices: ["inv_001", "inv_002"]
        user_staff_001:
          role: "staff"
          
    test_queries:
      - query: "SELECT * FROM invoices WHERE created_by = 'user_manager_001'"
        user_context: "user_manager_001"
        expected_result: "SUCCESS"
        expected_count: 2
        
      - query: "UPDATE invoices SET notes = 'Updated' WHERE id = 'inv_001'"
        user_context: "user_manager_001" 
        expected_result: "SUCCESS"
        assertion: "Can update own invoices"
        
      - query: "UPDATE invoices SET notes = 'Hacked' WHERE id = 'inv_001'"
        user_context: "user_staff_001"
        expected_result: "RLS_VIOLATION_ERROR"
        assertion: "Staff cannot update manager's invoices"

  - name: "Job assignment validation"
    setup:
      jobs:
        - id: "job_001"
          technician_id: "tech_001" 
          assigned_by: "manager_001"
        - id: "job_002"
          technician_id: "tech_002"
          assigned_by: "manager_001"
          
    test_queries:
      - query: "UPDATE jobs SET status = 'completed' WHERE id = 'job_001'"
        user_context: "tech_001"
        expected_result: "SUCCESS"
        assertion: "Technician can update assigned job"
        
      - query: "UPDATE jobs SET status = 'completed' WHERE id = 'job_002'"
        user_context: "tech_001"  
        expected_result: "RLS_VIOLATION_ERROR"
        assertion: "Technician cannot update others' jobs"
        
      - query: "UPDATE jobs SET technician_id = 'tech_001' WHERE id = 'job_002'"
        user_context: "tech_001"
        expected_result: "RLS_VIOLATION_ERROR"
        assertion: "Technician cannot reassign jobs"
```

## Complex RLS Scenarios

### Multi-Role Access Tests
```yaml
test_suite: complex_access_patterns
description: Test complex real-world access scenarios with multi_role and complex_access_patterns

test_cases:
  - name: "Manager creating invoice for staff job"
    setup:
      staff_job:
        id: "job_001"
        technician_id: "staff_001"  
        customer_id: "cust_001"
        status: "completed"
        
    test_queries:
      - query: "INSERT INTO invoices (job_id, customer_id, amount) VALUES ('job_001', 'cust_001', 250.00)"
        user_context: "manager_001"
        expected_result: "SUCCESS"
        assertion: "Manager can create invoice for staff job"
        
      - query: "SELECT * FROM invoices WHERE job_id = 'job_001'"
        user_context: "staff_001" 
        expected_result: "SUCCESS"
        assertion: "Staff can view invoice for their job"

  - name: "Customer data access across roles"
    setup:
      customer_with_multiple_jobs:
        id: "cust_001"
        jobs:
          - id: "job_001"
            technician_id: "tech_001"
          - id: "job_002" 
            technician_id: "tech_002"
            
    test_queries:
      - query: "SELECT * FROM customers WHERE id = 'cust_001'"
        user_context: "tech_001"
        expected_result: "SUCCESS"
        assertion: "Tech 1 can see customer (has assigned job)"
        
      - query: "SELECT * FROM customers WHERE id = 'cust_001'"
        user_context: "tech_002"
        expected_result: "SUCCESS" 
        assertion: "Tech 2 can see customer (has assigned job)"
        
      - query: "SELECT * FROM customers WHERE id = 'cust_001'"
        user_context: "tech_003"
        expected_result: "EMPTY_SET"
        assertion: "Tech 3 cannot see customer (no assigned jobs)"
```

## Test Execution Framework

### RLS Test Runner Configuration
```yaml
rls_test_config:
  database: "test_thorbis_rls"
  isolation_level: "test_per_tenant"
  cleanup_strategy: "truncate_after_test"
  
  test_users:
    - tenant_id: "tenant_test_123"
      users:
        - id: "owner_test_001"
          role: "owner"
          email: "owner@test.com"
        - id: "manager_test_001" 
          role: "manager"
          email: "manager@test.com"
        - id: "staff_test_001"
          role: "staff"
          email: "staff@test.com"
        - id: "viewer_test_001"
          role: "viewer"
          email: "viewer@test.com"
        - id: "api_partner_test_001"
          role: "api_partner"
          api_key: "ak_test_123456789"
          
    - tenant_id: "tenant_test_456"  # For cross-tenant tests
      users:
        - id: "owner_test_002"
          role: "owner"
          email: "owner2@test.com"

  test_data:
    invoices: 50
    customers: 100  
    jobs: 75
    users: 10
    
  performance_requirements:
    max_query_time_ms: 100
    max_setup_time_ms: 5000
    max_cleanup_time_ms: 2000
```

### CI Test Matrix Format
```yaml
# ci-rls-test-matrix.yml
rls_test_results:
  summary:
    total_tests: 145
    passed: 145
    failed: 0
    skipped: 0
    duration: "2m 34s"
    
  by_category:
    tenant_isolation:
      tests: 25
      passed: 25
      failed: 0
      status: "✅ PASS"
      
    role_permissions:
      tests: 60
      passed: 60  
      failed: 0
      status: "✅ PASS"
      
    resource_ownership:
      tests: 35
      passed: 35
      failed: 0
      status: "✅ PASS"
      
    complex_scenarios:
      tests: 25
      passed: 25
      failed: 0
      status: "✅ PASS"

  security_validation:
    cross_tenant_protection: "✅ SECURE"
    role_isolation: "✅ SECURE" 
    data_leakage_prevention: "✅ SECURE"
    privilege_escalation: "❌ BLOCKED"
    
  performance_metrics:
    avg_query_time_ms: 45
    max_query_time_ms: 89
    rls_overhead_percent: 12
    
  compliance:
    gdpr_data_isolation: "✅ COMPLIANT"
    sox_access_controls: "✅ COMPLIANT"  
    iso27001_requirements: "✅ COMPLIANT"
```

This comprehensive RLS test suite ensures complete multi-tenant security with role-based access controls, preventing data leakage and unauthorized access across the entire Thorbis platform.
