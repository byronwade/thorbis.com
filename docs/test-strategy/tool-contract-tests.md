# Thorbis Tool Contract Tests

Comprehensive test suite for all AI tools in the Thorbis system, covering input validation, output formats, error handling, and edge cases.

## Test Framework Structure

### Test Categories
- **Happy Path**: Valid inputs with expected outputs
- **Edge Cases**: Boundary conditions and unusual but valid inputs
- **Error Scenarios**: Invalid inputs and system failures
- **Security Tests**: Authorization, tenant isolation, input sanitization
- **Performance Tests**: Response times, rate limits, resource usage

### Test Execution Matrix
```
Tool Name           | Happy Path | Edge Cases | Errors | Security | Performance
--------------------|------------|------------|--------|----------|------------
ping                | ✅         | ✅         | ✅     | ✅       | ✅
whoAmI              | ✅         | ✅         | ✅     | ✅       | ✅
getCapabilities     | ✅         | ✅         | ✅     | ✅       | ✅
semanticSearch      | ✅         | ✅         | ✅     | ✅       | ✅
keywordSearch       | ✅         | ✅         | ✅     | ✅       | ✅
createInvoice       | ✅         | ✅         | ✅     | ✅       | ✅
scheduleAppointment | ✅         | ✅         | ✅     | ✅       | ✅
updateJobStatus     | ✅         | ✅         | ✅     | ✅       | ✅
processPayment      | ✅         | ✅         | ✅     | ✅       | ✅
managePOSOrder      | ✅         | ✅         | ✅     | ✅       | ✅
```

## Core Tool Tests

### ping Tool
```yaml
tool_name: ping
description: Health check and connectivity test
contract_tests:
  
  happy_path:
    - name: "Basic ping"
      input: {}
      expected_output:
        status: "success"
        message: "Thorbis AI is operational"
        timestamp: "2024-08-27T22:15:00.000Z"
        response_time_ms: number
      assertions:
        - response.status === "success"
        - response.timestamp is valid ISO string
        - response.response_time_ms < 100
      validation:
        - status field is required
        - timestamp format is ISO 8601
    
    - name: "Ping with echo data"
      input:
        echo: "test-message-123"
      expected_output:
        status: "success"
        message: "Thorbis AI is operational"
        echo: "test-message-123"
        timestamp: "2024-08-27T22:15:00.000Z"
        response_time_ms: number
      assertions:
        - response.echo === "test-message-123"
  
  edge_cases:
    - name: "Ping with large echo data"
      input:
        echo: "a".repeat(10000)
      expected_output:
        status: "success"
        echo: "a".repeat(10000)
      assertions:
        - response.echo.length === 10000
        - response.response_time_ms < 500
    
    - name: "Ping with special characters"
      input:
        echo: "测试🎉<script>alert('xss')</script>"
      expected_output:
        status: "success"
        echo: "测试🎉<script>alert('xss')</script>"
      assertions:
        - response.echo contains unicode and HTML safely
  
  error_scenarios:
    - name: "Ping during system maintenance"
      setup: simulate_maintenance_mode()
      input: {}
      expected_output:
        status: "error"
        error_code: "SYSTEM_MAINTENANCE"
        message: "System is currently under maintenance"
        retry_after: number
      assertions:
        - response.status === "error"
        - response.retry_after > 0
  
  security_tests:
    - name: "Ping without authentication"
      setup: remove_auth_headers()
      input: {}
      expected_output:
        status: "error"
        error_code: "AUTH_ERROR"
        message: "Authentication required"
      assertions:
        - response.status === "error"
        - response.error_code === "AUTH_ERROR"
  
  performance_tests:
    - name: "Ping response time"
      input: {}
      requirements:
        max_response_time_ms: 50
        min_availability_percent: 99.9
      test_iterations: 1000
```

### whoAmI Tool
```yaml
tool_name: whoAmI
description: Current user context and permissions
contract_tests:
  
  happy_path:
    - name: "Get current user context"
      input: {}
      expected_output:
        user:
          id: "user_123"
          name: "John Doe"
          email: "john@example.com"
          role: "admin"
        tenant:
          id: "tenant_456"
          name: "Acme HVAC"
          industry: "hs"
          plan: "professional"
        permissions:
          - "invoices.read"
          - "invoices.write"
          - "jobs.read"
          - "jobs.write"
        session:
          id: "sess_789"
          expires_at: "2024-08-28T22:15:00.000Z"
      assertions:
        - response.user.id is valid UUID
        - response.tenant.industry in ["hs", "rest", "auto", "ret"]
        - response.permissions is array of strings
        - response.session.expires_at > current_time
  
  edge_cases:
    - name: "User with limited permissions"
      setup: create_limited_user()
      input: {}
      expected_output:
        user:
          role: "viewer"
        permissions:
          - "invoices.read"
          - "jobs.read"
      assertions:
        - response.permissions.length >= 1
        - not response.permissions.includes("*.write")
    
    - name: "Multi-tenant user"
      setup: create_multi_tenant_user()
      input: {}
      expected_output:
        user:
          id: "user_123"
        tenant:
          id: "current_tenant_id"
        available_tenants:
          - id: "tenant_1"
          - id: "tenant_2"
      assertions:
        - response.available_tenants.length > 1
  
  error_scenarios:
    - name: "Expired session"
      setup: expire_user_session()
      input: {}
      expected_output:
        status: "error"
        error_code: "SESSION_EXPIRED"
        message: "Your session has expired. Please log in again."
      assertions:
        - response.error_code === "SESSION_EXPIRED"
    
    - name: "Deactivated user"
      setup: deactivate_user()
      input: {}
      expected_output:
        status: "error"
        error_code: "USER_DEACTIVATED"
        message: "Your account has been deactivated."
      assertions:
        - response.error_code === "USER_DEACTIVATED"
  
  security_tests:
    - name: "Cross-tenant access attempt"
      setup: switch_to_unauthorized_tenant()
      input: {}
      expected_output:
        status: "error"
        error_code: "UNAUTHORIZED_TENANT"
        message: "You don't have access to this tenant."
      assertions:
        - response.error_code === "UNAUTHORIZED_TENANT"
```

### getCapabilities Tool
```yaml
tool_name: getCapabilities
description: System capabilities and feature availability
contract_tests:
  
  happy_path:
    - name: "Get all capabilities"
      input: {}
      expected_output:
        industry: "hs"
        capabilities:
          invoicing:
            available: true
            features: ["create", "edit", "send", "track"]
          scheduling:
            available: true
            features: ["appointments", "recurring", "reminders"]
          pos:
            available: false
            reason: "Not available for home services"
        integrations:
          quickbooks: "connected"
          stripe: "connected"
          google_calendar: "available"
        limits:
          monthly_invoices: 1000
          api_calls_per_hour: 5000
        version: "2.1.0"
      assertions:
        - response.industry in ["hs", "rest", "auto", "ret"]
        - response.capabilities is object
        - response.version matches semver pattern
    
    - name: "Get capabilities for specific feature"
      input:
        feature: "invoicing"
      expected_output:
        feature: "invoicing"
        available: true
        features: ["create", "edit", "send", "track"]
        limits:
          monthly_invoices: 1000
        configuration:
          default_template: "professional"
          auto_send: false
      assertions:
        - response.feature === "invoicing"
        - response.available === true
  
  edge_cases:
    - name: "Capabilities for trial account"
      setup: switch_to_trial_account()
      input: {}
      expected_output:
        capabilities:
          invoicing:
            available: true
            features: ["create", "edit"]  # Limited features
        limits:
          monthly_invoices: 25
          trial_expires_at: "2024-09-01T00:00:00.000Z"
      assertions:
        - response.limits.monthly_invoices <= 25
        - response.limits.trial_expires_at exists
    
    - name: "Capabilities for suspended account"
      setup: suspend_account()
      input: {}
      expected_output:
        capabilities:
          invoicing:
            available: false
            reason: "Account suspended"
        account_status: "suspended"
      assertions:
        - all capabilities.available === false
        - response.account_status === "suspended"
  
  error_scenarios:
    - name: "Unknown feature query"
      input:
        feature: "nonexistent_feature"
      expected_output:
        status: "error"
        error_code: "FEATURE_NOT_FOUND"
        message: "Feature 'nonexistent_feature' not found"
        available_features: ["invoicing", "scheduling", "pos"]
      assertions:
        - response.error_code === "FEATURE_NOT_FOUND"
        - response.available_features is array
```

## Search Tool Tests

### semanticSearch Tool
```yaml
tool_name: semanticSearch
description: Vector-based semantic search with RAG
contract_tests:
  
  happy_path:
    - name: "Basic semantic search"
      input:
        query: "How do I create an invoice?"
        context: "help"
        limit: 5
      expected_output:
        results:
          - title: "Creating Your First Invoice"
            content: "To create an invoice, navigate to..."
            score: 0.95
            source: "help_docs"
            url: "/help/invoicing/create"
          - title: "Invoice Templates"
            content: "Choose from professional templates..."
            score: 0.87
            source: "help_docs"
            url: "/help/invoicing/templates"
        query_embedding: [0.1, 0.2, ...]  # Vector representation
        total_results: 12
        search_time_ms: 150
      assertions:
        - response.results.length <= 5
        - all results have score >= 0.5
        - results sorted by score descending
        - response.search_time_ms < 500
    
    - name: "Industry-specific search"
      input:
        query: "schedule HVAC maintenance"
        context: "business_operations"
        industry: "hs"
      expected_output:
        results:
          - title: "HVAC Maintenance Scheduling"
            content: "Schedule regular HVAC maintenance..."
            industry_relevance: "hs"
            score: 0.93
      assertions:
        - all results.industry_relevance === "hs" or null
        - results contain industry-specific terminology
  
  edge_cases:
    - name: "Empty query"
      input:
        query: ""
      expected_output:
        status: "error"
        error_code: "VALIDATION_ERROR"
        message: "Query cannot be empty"
      assertions:
        - response.error_code === "VALIDATION_ERROR"
    
    - name: "Very long query"
      input:
        query: "word ".repeat(1000)  # 5000 characters
        limit: 10
      expected_output:
        results: []
        query_truncated: true
        search_time_ms: number
      assertions:
        - response.query_truncated === true
        - response.search_time_ms < 2000
    
    - name: "No results found"
      input:
        query: "asdfghjklqwertyuiop"  # Gibberish
      expected_output:
        results: []
        suggestions: ["Did you mean: ...", "Try: ..."]
        total_results: 0
      assertions:
        - response.results.length === 0
        - response.suggestions is array
  
  error_scenarios:
    - name: "Search service unavailable"
      setup: disable_voyage_service()
      input:
        query: "test search"
      expected_output:
        status: "error"
        error_code: "SEARCH_UNAVAILABLE"
        message: "Search service is temporarily unavailable. Please try again later."
        fallback_suggestions: ["Check FAQ", "Contact Support"]
      assertions:
        - response.error_code === "SEARCH_UNAVAILABLE"
        - response.fallback_suggestions exists
    
    - name: "Rate limit exceeded"
      setup: exceed_search_rate_limit()
      input:
        query: "test"
      expected_output:
        status: "error"
        error_code: "RATE_LIMIT_EXCEEDED"
        message: "Search rate limit exceeded"
        retry_after_seconds: 60
      assertions:
        - response.error_code === "RATE_LIMIT_EXCEEDED"
        - response.retry_after_seconds > 0
  
  security_tests:
    - name: "Cross-tenant data isolation"
      setup: create_tenant_specific_data()
      input:
        query: "confidential information"
      expected_output:
        results: []  # Should not return other tenant's data
      assertions:
        - no results contain other_tenant_id
        - all results.tenant_id === current_tenant_id
  
  performance_tests:
    - name: "Search response time"
      input:
        query: "typical business query"
      requirements:
        max_response_time_ms: 500
        min_relevance_score: 0.7
      test_iterations: 100
```

### keywordSearch Tool
```yaml
tool_name: keywordSearch
description: Traditional keyword-based search
contract_tests:
  
  happy_path:
    - name: "Basic keyword search"
      input:
        query: "invoice template"
        filters:
          type: "documentation"
          category: "invoicing"
      expected_output:
        results:
          - title: "Invoice Templates Guide"
            excerpt: "...invoice template..."
            type: "documentation"
            category: "invoicing"
            relevance_score: 0.92
            last_updated: "2024-08-15T10:00:00.000Z"
        total_results: 8
        search_time_ms: 45
        facets:
          type: ["documentation": 5, "tutorial": 3]
          category: ["invoicing": 8]
      assertions:
        - response.results.length > 0
        - response.search_time_ms < 200
        - all results match filters
    
    - name: "Wildcard search"
      input:
        query: "invoice*"
        exact_match: false
      expected_output:
        results:
          - title: "Invoice Creation"
          - title: "Invoicing Best Practices"
          - title: "Invoice Templates"
        query_expanded: "invoice OR invoicing OR invoices"
      assertions:
        - results contain variations of "invoice"
        - response.query_expanded exists
  
  edge_cases:
    - name: "Boolean operators"
      input:
        query: "invoice AND template NOT draft"
      expected_output:
        results: []  # Results containing "invoice" and "template" but not "draft"
        query_parsed: 
          must: ["invoice", "template"]
          must_not: ["draft"]
      assertions:
        - no results contain "draft"
        - all results contain "invoice" and "template"
    
    - name: "Special characters in query"
      input:
        query: "customer@email.com $1,234.56 #invoice"
      expected_output:
        results: []
        query_sanitized: "customer email 1234 56 invoice"
      assertions:
        - response.query_sanitized exists
        - no special characters in processed query
  
  error_scenarios:
    - name: "Malformed query syntax"
      input:
        query: "((invoice AND"  # Unclosed parenthesis
      expected_output:
        status: "error"
        error_code: "QUERY_SYNTAX_ERROR"
        message: "Invalid query syntax: unclosed parenthesis"
        suggestion: "Try: invoice AND template"
      assertions:
        - response.error_code === "QUERY_SYNTAX_ERROR"
        - response.suggestion exists
```

## Business Tool Tests

### createInvoice Tool
```yaml
tool_name: createInvoice
description: Create new invoice with line items and calculations
contract_tests:
  
  happy_path:
    - name: "Create basic invoice"
      input:
        customer_id: "cust_123"
        line_items:
          - description: "HVAC Service Call"
            quantity: 1
            unit_price: 150.00
        due_date: "2024-09-15"
        notes: "Service completed on 8/27/2024"
      expected_output:
        invoice:
          id: "inv_456"
          number: "INV-2024-001"
          customer_id: "cust_123"
          line_items:
            - description: "HVAC Service Call"
              quantity: 1
              unit_price: 150.00
              total: 150.00
          subtotal: 150.00
          tax_amount: 12.75
          total_amount: 162.75
          status: "draft"
          created_at: "2024-08-27T22:15:00.000Z"
          due_date: "2024-09-15T23:59:59.000Z"
        pdf_url: "https://storage.thorbis.com/invoices/inv_456.pdf"
        share_url: "https://thorbis.com/invoices/inv_456/view"
      assertions:
        - response.invoice.id starts with "inv_"
        - response.invoice.total_amount === 162.75
        - response.pdf_url is valid URL
        - response.share_url is valid URL
    
    - name: "Create invoice with multiple items"
      input:
        customer_id: "cust_123"
        line_items:
          - description: "Labor"
            quantity: 2
            unit_price: 75.00
          - description: "Parts"
            quantity: 1
            unit_price: 50.00
        discount_percent: 10
      expected_output:
        invoice:
          line_items:
            - total: 150.00
            - total: 50.00
          subtotal: 200.00
          discount_amount: 20.00
          tax_amount: 15.30  # Tax on discounted amount
          total_amount: 195.30
      assertions:
        - response.invoice.discount_amount === 20.00
        - response.invoice.total_amount === 195.30
  
  edge_cases:
    - name: "Invoice with zero amount"
      input:
        customer_id: "cust_123"
        line_items:
          - description: "Free consultation"
            quantity: 1
            unit_price: 0.00
      expected_output:
        invoice:
          subtotal: 0.00
          tax_amount: 0.00
          total_amount: 0.00
          status: "draft"
      assertions:
        - response.invoice.total_amount === 0.00
        - response.invoice.status === "draft"
    
    - name: "Invoice with large amounts"
      input:
        customer_id: "cust_123"
        line_items:
          - description: "Commercial HVAC Installation"
            quantity: 1
            unit_price: 99999.99
      expected_output:
        invoice:
          subtotal: 99999.99
          total_amount: number  # Should handle large numbers
      assertions:
        - response.invoice.total_amount > 100000
        - no precision errors in calculations
  
  error_scenarios:
    - name: "Invalid customer ID"
      input:
        customer_id: "nonexistent"
        line_items:
          - description: "Service"
            quantity: 1
            unit_price: 100.00
      expected_output:
        status: "error"
        error_code: "CUSTOMER_NOT_FOUND"
        message: "Customer with ID 'nonexistent' not found"
      assertions:
        - response.error_code === "CUSTOMER_NOT_FOUND"
    
    - name: "Negative unit price"
      input:
        customer_id: "cust_123"
        line_items:
          - description: "Invalid item"
            quantity: 1
            unit_price: -50.00
      expected_output:
        status: "error"
        error_code: "VALIDATION_ERROR"
        message: "Unit price cannot be negative"
        field: "line_items[0].unit_price"
      assertions:
        - response.error_code === "VALIDATION_ERROR"
        - response.field exists
    
    - name: "Missing required fields"
      input:
        line_items: []  # Missing customer_id and empty line_items
      expected_output:
        status: "error"
        error_code: "VALIDATION_ERROR"
        message: "Validation failed"
        errors:
          - field: "customer_id"
            message: "Customer ID is required"
          - field: "line_items"
            message: "At least one line item is required"
      assertions:
        - response.errors.length === 2
        - response.errors contains customer_id and line_items errors
    
    - name: "QuickBooks integration failure"
      setup: disable_quickbooks_integration()
      input:
        customer_id: "cust_123"
        line_items:
          - description: "Service"
            quantity: 1
            unit_price: 100.00
        sync_to_quickbooks: true
      expected_output:
        invoice:
          id: "inv_456"
          status: "draft"
          sync_status: "failed"
          sync_error: "QuickBooks integration temporarily unavailable"
        warnings:
          - "Invoice created but not synced to QuickBooks"
      assertions:
        - response.invoice.sync_status === "failed"
        - response.warnings exists
  
  security_tests:
    - name: "Cross-tenant customer access"
      setup: create_customer_in_different_tenant()
      input:
        customer_id: "other_tenant_customer"
        line_items:
          - description: "Service"
            quantity: 1
            unit_price: 100.00
      expected_output:
        status: "error"
        error_code: "UNAUTHORIZED_RESOURCE"
        message: "You don't have access to this customer"
      assertions:
        - response.error_code === "UNAUTHORIZED_RESOURCE"
    
    - name: "Invoice creation permission check"
      setup: remove_invoice_write_permission()
      input:
        customer_id: "cust_123"
        line_items:
          - description: "Service"
            quantity: 1
            unit_price: 100.00
      expected_output:
        status: "error"
        error_code: "PERMISSION_DENIED"
        message: "You don't have permission to create invoices"
      assertions:
        - response.error_code === "PERMISSION_DENIED"
  
  performance_tests:
    - name: "Invoice creation performance"
      input:
        customer_id: "cust_123"
        line_items:
          - description: "Service"
            quantity: 1
            unit_price: 100.00
      requirements:
        max_response_time_ms: 2000
        pdf_generation_time_ms: 1000
      assertions:
        - total response time < 2000ms
        - PDF generation time < 1000ms
    
    - name: "Bulk line items performance"
      input:
        customer_id: "cust_123"
        line_items: []  # Generate 100 line items
      setup: generate_100_line_items()
      requirements:
        max_response_time_ms: 5000
        max_memory_usage_mb: 50
      assertions:
        - handles 100 line items efficiently
        - memory usage remains reasonable
```

### scheduleAppointment Tool
```yaml
tool_name: scheduleAppointment
description: Schedule customer appointments with technician assignment
contract_tests:
  
  happy_path:
    - name: "Schedule basic appointment"
      input:
        customer_id: "cust_123"
        service_type: "HVAC Maintenance"
        requested_date: "2024-09-01"
        requested_time: "10:00"
        duration_minutes: 120
        priority: "normal"
        notes: "Annual maintenance checkup"
      expected_output:
        appointment:
          id: "appt_456"
          customer_id: "cust_123"
          technician_id: "tech_789"
          scheduled_at: "2024-09-01T10:00:00.000Z"
          duration_minutes: 120
          status: "scheduled"
          confirmation_sent: true
          estimated_cost: 150.00
        notifications:
          customer_sms: true
          technician_notification: true
          calendar_event: true
      assertions:
        - response.appointment.id starts with "appt_"
        - response.appointment.technician_id assigned
        - response.notifications.customer_sms === true
    
    - name: "Schedule emergency appointment"
      input:
        customer_id: "cust_123"
        service_type: "Emergency Repair"
        priority: "emergency"
        notes: "No heat, elderly resident"
      expected_output:
        appointment:
          priority: "emergency"
          scheduled_at: "2024-08-27T23:00:00.000Z"  # ASAP
          technician_id: "tech_emergency"
          emergency_fee: 75.00
        notifications:
          immediate_dispatch: true
      assertions:
        - response.appointment.priority === "emergency"
        - scheduled within 2 hours
        - response.notifications.immediate_dispatch === true
  
  edge_cases:
    - name: "Schedule outside business hours"
      input:
        customer_id: "cust_123"
        service_type: "Routine Service"
        requested_date: "2024-09-01"
        requested_time: "22:00"  # After hours
      expected_output:
        appointment:
          scheduled_at: "2024-09-02T08:00:00.000Z"  # Next business day
          after_hours_fee: 50.00
        warnings:
          - "Requested time outside business hours, scheduled for next available slot"
      assertions:
        - appointment rescheduled to business hours
        - response.warnings exists
    
    - name: "No available technicians"
      setup: book_all_technicians()
      input:
        customer_id: "cust_123"
        service_type: "Service"
        requested_date: "2024-09-01"
        requested_time: "10:00"
      expected_output:
        appointment:
          status: "waitlist"
          waitlist_position: 3
        alternative_dates:
          - "2024-09-02T10:00:00.000Z"
          - "2024-09-02T14:00:00.000Z"
      assertions:
        - response.appointment.status === "waitlist"
        - response.alternative_dates exists
  
  error_scenarios:
    - name: "Invalid date format"
      input:
        customer_id: "cust_123"
        requested_date: "invalid-date"
      expected_output:
        status: "error"
        error_code: "VALIDATION_ERROR"
        message: "Invalid date format. Expected YYYY-MM-DD"
        field: "requested_date"
      assertions:
        - response.error_code === "VALIDATION_ERROR"
        - response.field === "requested_date"
    
    - name: "Scheduling in the past"
      input:
        customer_id: "cust_123"
        requested_date: "2024-08-01"  # Past date
      expected_output:
        status: "error"
        error_code: "VALIDATION_ERROR"
        message: "Cannot schedule appointments in the past"
      assertions:
        - response.error_code === "VALIDATION_ERROR"
```

## Test Execution Configuration

### CI/CD Test Pipeline
```yaml
# test-pipeline.yml
test_pipeline:
  stages:
    - lint_and_validate
    - unit_tests
    - integration_tests
    - contract_tests
    - security_tests
    - performance_tests
    - e2e_tests
  
  contract_tests:
    parallel: true
    timeout: 300  # 5 minutes per test suite
    retry: 2
    
    test_suites:
      - name: core_tools
        tests:
          - ping
          - whoAmI  
          - getCapabilities
        expected_duration: 60
        
      - name: search_tools
        tests:
          - semanticSearch
          - keywordSearch
        expected_duration: 120
        dependencies:
          - voyage_service
          
      - name: business_tools
        tests:
          - createInvoice
          - scheduleAppointment
          - updateJobStatus
          - processPayment
          - managePOSOrder
        expected_duration: 180
        dependencies:
          - database
          - stripe_service
          - quickbooks_service
  
  success_criteria:
    - all_tests_pass: true
    - test_coverage: ">= 90%"
    - performance_requirements_met: true
    - security_tests_pass: true
    - no_critical_vulnerabilities: true
  
  failure_handling:
    retry_flaky_tests: true
    max_retries: 3
    notify_on_failure:
      - slack: "#engineering-alerts"
      - email: ["dev-team@thorbis.com"]
```

### Test Data Management
```yaml
test_data:
  fixtures:
    customers:
      - id: "cust_123"
        name: "John Doe"
        email: "john@example.com"
        tenant_id: "tenant_456"
      - id: "cust_multi_tenant"
        name: "Jane Smith"
        tenant_id: "other_tenant"
        
    technicians:
      - id: "tech_789"
        name: "Bob Wilson"
        specialties: ["HVAC", "Electrical"]
        availability: "full_time"
      - id: "tech_emergency"
        name: "Emergency Tech"
        specialties: ["Emergency"]
        availability: "on_call"
        
    tenants:
      - id: "tenant_456"
        name: "Acme HVAC"
        industry: "hs"
        plan: "professional"
      - id: "other_tenant"
        name: "Different Company"
        industry: "rest"
        
  test_isolation:
    - create_test_tenant_per_suite: true
    - cleanup_after_tests: true
    - use_test_database: true
    - mock_external_services: true
```

### Mock Services Configuration
```yaml
mock_services:
  voyage_service:
    enabled: true
    responses:
      semantic_search:
        - query: "How do I create an invoice?"
          response:
            results: []
            embedding: [0.1, 0.2, 0.3]
            search_time_ms: 150
    failures:
      - type: "timeout"
        probability: 0.02
      - type: "service_unavailable"
        probability: 0.01
        
  stripe_service:
    enabled: true
    test_mode: true
    responses:
      process_payment:
        - amount: 100.00
          response:
            id: "ch_test_123"
            status: "succeeded"
    failures:
      - type: "card_declined"
        probability: 0.05
      - type: "network_error"
        probability: 0.01
        
  quickbooks_service:
    enabled: true
    responses:
      create_invoice:
        - response:
            id: "qb_inv_123"
            sync_token: "1"
    failures:
      - type: "authentication_error"
        probability: 0.02
      - type: "rate_limit"
        probability: 0.03
```

This comprehensive tool contract test suite ensures all AI tools in the Thorbis system are thoroughly validated with proper input/output contracts, error handling, security checks, and performance requirements.
