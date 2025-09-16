# Comprehensive Database Documentation & ERD Diagrams
**Complete Database Architecture Documentation for Thorbis Business OS**

## Overview
Comprehensive database documentation including Entity Relationship Diagrams (ERDs), table specifications, relationship mappings, and architectural patterns for the Thorbis Business OS multi-tenant, multi-industry platform.

### Documentation Scope
- **Complete Schema Architecture**: All schemas, tables, relationships, and constraints
- **Visual ERD Diagrams**: Industry-specific and cross-industry relationship diagrams
- **API Integration Mappings**: Database-to-API endpoint relationships
- **Performance Optimization**: Index strategies, partitioning, and query patterns
- **Security & Compliance**: RLS policies, encryption, and audit requirements

---

## Database Architecture Overview

### High-Level Schema Organization
```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    Thorbis Business OS Database                                       │
├─────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                       │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │                              System Core Schemas                                             │   │
│  ├──────────────────────────────────────────────────────────────────────────────────────────────┤   │
│  │  system_core  │  tenant_mgmt  │  user_mgmt  │  security_mgmt  │  monitoring_obs  │  perf_mgmt  │   │
│  └──────────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                            │                                                          │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │                              Industry-Specific Schemas                                       │   │
│  ├──────────────────────────────────────────────────────────────────────────────────────────────┤   │
│  │    hs        │    auto       │    rest       │    banking    │    ret       │   courses      │   │
│  │ (Home Svc)   │ (Automotive)  │ (Restaurant)  │ (Financial)   │ (Retail)     │ (Learning)     │   │
│  ├──────────────────────────────────────────────────────────────────────────────────────────────┤   │
│  │              payroll         │             investigations            │      security_hardening │   │
│  └──────────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                       │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Core Schema ERD Diagrams

### System Core Schema ERD
```mermaid
erDiagram
    SYSTEM_CONFIG {
        UUID id PK
        VARCHAR config_key UK
        TEXT config_value
        VARCHAR config_type
        JSONB validation_rules
        BOOLEAN is_encrypted
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
        UUID created_by FK
    }
    
    SYSTEM_EVENTS {
        UUID id PK
        VARCHAR event_type
        VARCHAR event_subtype
        JSONB event_data
        VARCHAR severity
        TIMESTAMPTZ created_at
        UUID tenant_id FK
        UUID user_id FK
        VARCHAR correlation_id
    }
    
    API_ENDPOINTS {
        UUID id PK
        VARCHAR endpoint_path UK
        VARCHAR method
        VARCHAR handler_function
        JSONB request_schema
        JSONB response_schema
        BOOLEAN requires_auth
        TEXT[] required_permissions
        BOOLEAN is_active
    }
    
    FEATURE_FLAGS {
        UUID id PK
        VARCHAR flag_key UK
        VARCHAR flag_name
        TEXT description
        BOOLEAN is_enabled
        JSONB targeting_rules
        VARCHAR rollout_strategy
        TIMESTAMPTZ expires_at
    }

    SYSTEM_CONFIG ||--o{ SYSTEM_EVENTS : "configures"
    API_ENDPOINTS ||--o{ SYSTEM_EVENTS : "generates"
    FEATURE_FLAGS ||--o{ SYSTEM_EVENTS : "triggers"
```

### Multi-Tenant Management ERD
```mermaid
erDiagram
    TENANTS {
        UUID id PK
        VARCHAR name
        VARCHAR slug UK
        VARCHAR domain
        JSONB settings
        VARCHAR status
        TIMESTAMPTZ created_at
        TIMESTAMPTZ trial_ends_at
        UUID parent_tenant_id FK
    }
    
    TENANT_SUBSCRIPTIONS {
        UUID id PK
        UUID tenant_id FK
        VARCHAR plan_id
        VARCHAR billing_cycle
        NUMERIC amount
        VARCHAR currency
        VARCHAR status
        TIMESTAMPTZ current_period_start
        TIMESTAMPTZ current_period_end
        JSONB feature_limits
    }
    
    TENANT_USAGE_METRICS {
        UUID id PK
        UUID tenant_id FK
        VARCHAR metric_name
        NUMERIC metric_value
        VARCHAR metric_unit
        TIMESTAMPTZ recorded_at
        JSONB metadata
    }
    
    TENANT_BILLING_HISTORY {
        UUID id PK
        UUID tenant_id FK
        UUID subscription_id FK
        NUMERIC amount_charged
        VARCHAR currency
        VARCHAR charge_type
        TIMESTAMPTZ charge_date
        VARCHAR external_charge_id
        JSONB charge_details
    }

    TENANTS ||--|| TENANT_SUBSCRIPTIONS : "has"
    TENANTS ||--o{ TENANT_USAGE_METRICS : "generates"
    TENANT_SUBSCRIPTIONS ||--o{ TENANT_BILLING_HISTORY : "creates"
    TENANTS ||--o{ TENANTS : "parent_of"
```

### User Management & RBAC ERD
```mermaid
erDiagram
    USERS {
        UUID id PK
        VARCHAR email UK
        VARCHAR username
        TEXT password_hash
        JSONB profile_data
        VARCHAR status
        TIMESTAMPTZ last_login_at
        UUID tenant_id FK
        TIMESTAMPTZ created_at
    }
    
    ROLES {
        UUID id PK
        VARCHAR name UK
        TEXT description
        TEXT[] permissions
        JSONB role_config
        VARCHAR role_type
        UUID tenant_id FK
        BOOLEAN is_system_role
    }
    
    USER_ROLES {
        UUID id PK
        UUID user_id FK
        UUID role_id FK
        UUID assigned_by FK
        TIMESTAMPTZ assigned_at
        TIMESTAMPTZ expires_at
        JSONB assignment_context
    }
    
    USER_SESSIONS {
        UUID id PK
        UUID user_id FK
        VARCHAR session_token
        INET client_ip
        TEXT user_agent
        TIMESTAMPTZ created_at
        TIMESTAMPTZ expires_at
        BOOLEAN is_active
    }
    
    USER_PREFERENCES {
        UUID id PK
        UUID user_id FK
        VARCHAR preference_key
        JSONB preference_value
        VARCHAR preference_type
        TIMESTAMPTZ updated_at
    }

    USERS ||--o{ USER_ROLES : "assigned"
    ROLES ||--o{ USER_ROLES : "grants"
    USERS ||--o{ USER_SESSIONS : "creates"
    USERS ||--o{ USER_PREFERENCES : "configures"
```

---

## Industry-Specific Schema ERDs

### Home Services (HS) Schema ERD
```mermaid
erDiagram
    HS_CUSTOMERS {
        UUID id PK
        UUID business_id FK
        VARCHAR first_name
        VARCHAR last_name
        VARCHAR email
        VARCHAR phone
        JSONB address_info
        VARCHAR customer_type
        JSONB preferences
        TIMESTAMPTZ created_at
    }
    
    HS_WORK_ORDERS {
        UUID id PK
        UUID business_id FK
        UUID customer_id FK
        VARCHAR work_order_number UK
        VARCHAR service_type
        TEXT description
        VARCHAR priority
        VARCHAR status
        TIMESTAMPTZ scheduled_at
        TIMESTAMPTZ completed_at
        NUMERIC estimated_cost
        NUMERIC final_cost
    }
    
    HS_TECHNICIANS {
        UUID id PK
        UUID business_id FK
        UUID user_id FK
        VARCHAR employee_id
        TEXT[] skills
        JSONB certifications
        VARCHAR employment_status
        POINT current_location
        TIMESTAMPTZ created_at
    }
    
    HS_WORK_ORDER_ASSIGNMENTS {
        UUID id PK
        UUID work_order_id FK
        UUID technician_id FK
        UUID assigned_by FK
        TIMESTAMPTZ assigned_at
        TIMESTAMPTZ started_at
        TIMESTAMPTZ completed_at
        VARCHAR assignment_status
        TEXT notes
    }
    
    HS_INVOICES {
        UUID id PK
        UUID business_id FK
        UUID work_order_id FK
        UUID customer_id FK
        VARCHAR invoice_number UK
        NUMERIC subtotal
        NUMERIC tax_amount
        NUMERIC total_amount
        VARCHAR currency
        VARCHAR status
        TIMESTAMPTZ issued_at
        TIMESTAMPTZ due_at
        TIMESTAMPTZ paid_at
    }
    
    HS_INVOICE_LINE_ITEMS {
        UUID id PK
        UUID invoice_id FK
        VARCHAR item_type
        TEXT description
        INTEGER quantity
        NUMERIC unit_price
        NUMERIC total_price
        UUID service_id FK
        UUID part_id FK
    }
    
    HS_INVENTORY_ITEMS {
        UUID id PK
        UUID business_id FK
        VARCHAR sku UK
        VARCHAR name
        TEXT description
        VARCHAR category
        INTEGER quantity_on_hand
        INTEGER reorder_point
        NUMERIC cost_price
        NUMERIC selling_price
        VARCHAR supplier_info
    }

    HS_CUSTOMERS ||--o{ HS_WORK_ORDERS : "requests"
    HS_WORK_ORDERS ||--o{ HS_WORK_ORDER_ASSIGNMENTS : "assigned_to"
    HS_TECHNICIANS ||--o{ HS_WORK_ORDER_ASSIGNMENTS : "performs"
    HS_WORK_ORDERS ||--|| HS_INVOICES : "generates"
    HS_INVOICES ||--o{ HS_INVOICE_LINE_ITEMS : "contains"
    HS_INVENTORY_ITEMS ||--o{ HS_INVOICE_LINE_ITEMS : "used_in"
```

### Restaurant (REST) Schema ERD
```mermaid
erDiagram
    REST_MENU_CATEGORIES {
        UUID id PK
        UUID business_id FK
        VARCHAR name
        TEXT description
        INTEGER sort_order
        BOOLEAN is_active
        TIMESTAMPTZ created_at
    }
    
    REST_MENU_ITEMS {
        UUID id PK
        UUID business_id FK
        UUID category_id FK
        VARCHAR name
        TEXT description
        NUMERIC price
        VARCHAR currency
        TEXT[] allergens
        TEXT[] dietary_restrictions
        BOOLEAN is_available
        INTEGER prep_time_minutes
        JSONB nutritional_info
    }
    
    REST_TABLES {
        UUID id PK
        UUID business_id FK
        VARCHAR table_number UK
        INTEGER capacity
        VARCHAR status
        VARCHAR section
        POINT location_coordinates
        TIMESTAMPTZ created_at
    }
    
    REST_ORDERS {
        UUID id PK
        UUID business_id FK
        UUID table_id FK
        VARCHAR order_number UK
        VARCHAR order_type
        VARCHAR status
        NUMERIC subtotal
        NUMERIC tax_amount
        NUMERIC tip_amount
        NUMERIC total_amount
        TIMESTAMPTZ created_at
        TIMESTAMPTZ completed_at
        UUID server_id FK
    }
    
    REST_ORDER_ITEMS {
        UUID id PK
        UUID order_id FK
        UUID menu_item_id FK
        INTEGER quantity
        NUMERIC unit_price
        NUMERIC total_price
        TEXT special_instructions
        VARCHAR status
        TIMESTAMPTZ ordered_at
        TIMESTAMPTZ completed_at
    }
    
    REST_KITCHEN_QUEUE {
        UUID id PK
        UUID order_id FK
        UUID order_item_id FK
        VARCHAR station
        VARCHAR status
        INTEGER prep_time_estimated
        INTEGER prep_time_actual
        TIMESTAMPTZ started_at
        TIMESTAMPTZ completed_at
        UUID chef_id FK
    }
    
    REST_PAYMENTS {
        UUID id PK
        UUID business_id FK
        UUID order_id FK
        VARCHAR payment_method
        NUMERIC amount
        VARCHAR currency
        VARCHAR status
        TIMESTAMPTZ processed_at
        VARCHAR external_payment_id
        JSONB payment_details
    }

    REST_MENU_CATEGORIES ||--o{ REST_MENU_ITEMS : "contains"
    REST_TABLES ||--o{ REST_ORDERS : "placed_at"
    REST_ORDERS ||--o{ REST_ORDER_ITEMS : "includes"
    REST_MENU_ITEMS ||--o{ REST_ORDER_ITEMS : "ordered"
    REST_ORDER_ITEMS ||--o{ REST_KITCHEN_QUEUE : "queued"
    REST_ORDERS ||--o{ REST_PAYMENTS : "paid_by"
```

### Automotive (AUTO) Schema ERD
```mermaid
erDiagram
    AUTO_CUSTOMERS {
        UUID id PK
        UUID business_id FK
        VARCHAR first_name
        VARCHAR last_name
        VARCHAR email
        VARCHAR phone
        JSONB address_info
        VARCHAR customer_type
        TIMESTAMPTZ created_at
    }
    
    AUTO_VEHICLES {
        UUID id PK
        UUID business_id FK
        UUID customer_id FK
        VARCHAR vin UK
        VARCHAR make
        VARCHAR model
        INTEGER year
        VARCHAR engine_type
        VARCHAR transmission
        INTEGER mileage
        VARCHAR license_plate
        JSONB vehicle_specs
        TIMESTAMPTZ created_at
    }
    
    AUTO_SERVICE_APPOINTMENTS {
        UUID id PK
        UUID business_id FK
        UUID customer_id FK
        UUID vehicle_id FK
        VARCHAR appointment_type
        TEXT description
        TIMESTAMPTZ scheduled_at
        INTEGER estimated_duration
        VARCHAR status
        UUID technician_id FK
        VARCHAR bay_assignment
        TIMESTAMPTZ created_at
    }
    
    AUTO_REPAIR_ORDERS {
        UUID id PK
        UUID business_id FK
        UUID appointment_id FK
        UUID customer_id FK
        UUID vehicle_id FK
        VARCHAR repair_order_number UK
        TEXT problem_description
        TEXT diagnosis
        VARCHAR status
        NUMERIC estimated_cost
        NUMERIC final_cost
        TIMESTAMPTZ started_at
        TIMESTAMPTZ completed_at
    }
    
    AUTO_REPAIR_TASKS {
        UUID id PK
        UUID repair_order_id FK
        VARCHAR task_description
        NUMERIC labor_hours
        NUMERIC labor_rate
        VARCHAR status
        UUID technician_id FK
        TIMESTAMPTZ started_at
        TIMESTAMPTZ completed_at
        TEXT notes
    }
    
    AUTO_PARTS_USED {
        UUID id PK
        UUID repair_order_id FK
        UUID part_id FK
        INTEGER quantity_used
        NUMERIC unit_cost
        NUMERIC total_cost
        VARCHAR part_condition
        TIMESTAMPTZ used_at
    }
    
    AUTO_PARTS_INVENTORY {
        UUID id PK
        UUID business_id FK
        VARCHAR part_number UK
        VARCHAR name
        TEXT description
        VARCHAR manufacturer
        INTEGER quantity_on_hand
        NUMERIC cost_price
        NUMERIC selling_price
        VARCHAR location
        INTEGER reorder_point
    }

    AUTO_CUSTOMERS ||--o{ AUTO_VEHICLES : "owns"
    AUTO_CUSTOMERS ||--o{ AUTO_SERVICE_APPOINTMENTS : "books"
    AUTO_VEHICLES ||--o{ AUTO_SERVICE_APPOINTMENTS : "scheduled_for"
    AUTO_SERVICE_APPOINTMENTS ||--|| AUTO_REPAIR_ORDERS : "generates"
    AUTO_REPAIR_ORDERS ||--o{ AUTO_REPAIR_TASKS : "contains"
    AUTO_REPAIR_ORDERS ||--o{ AUTO_PARTS_USED : "consumes"
    AUTO_PARTS_INVENTORY ||--o{ AUTO_PARTS_USED : "supplies"
```

---

## Cross-Schema Integration ERD

### Banking & Financial Services Integration
```mermaid
erDiagram
    BANKING_ACCOUNTS {
        UUID id PK
        UUID business_id FK
        VARCHAR account_number UK
        VARCHAR account_type
        VARCHAR financial_institution
        VARCHAR currency
        NUMERIC current_balance
        NUMERIC available_balance
        VARCHAR status
        JSONB account_details
        TIMESTAMPTZ created_at
    }
    
    BANKING_TRANSACTIONS {
        UUID id PK
        UUID business_id FK
        UUID account_id FK
        VARCHAR transaction_type
        NUMERIC amount
        VARCHAR currency
        TEXT description
        VARCHAR status
        TIMESTAMPTZ transaction_date
        TIMESTAMPTZ created_at
        VARCHAR external_reference_id
        JSONB metadata
    }
    
    BANKING_PAYMENT_METHODS {
        UUID id PK
        UUID business_id FK
        UUID customer_id FK
        VARCHAR method_type
        JSONB method_details
        BOOLEAN is_default
        VARCHAR status
        TIMESTAMPTZ created_at
        TIMESTAMPTZ expires_at
    }
    
    BANKING_INVOICES_INTEGRATION {
        UUID id PK
        UUID business_id FK
        VARCHAR industry_schema
        UUID industry_invoice_id FK
        UUID banking_account_id FK
        VARCHAR payment_status
        NUMERIC amount_due
        NUMERIC amount_paid
        TIMESTAMPTZ payment_due_date
        TIMESTAMPTZ payment_processed_date
        JSONB payment_details
    }

    BANKING_ACCOUNTS ||--o{ BANKING_TRANSACTIONS : "records"
    BANKING_PAYMENT_METHODS ||--o{ BANKING_TRANSACTIONS : "processes"
    BANKING_INVOICES_INTEGRATION ||--|| BANKING_ACCOUNTS : "debited_from"
    BANKING_INVOICES_INTEGRATION ||--|| BANKING_TRANSACTIONS : "creates"
```

---

## Table Specifications & Data Dictionary

### System Core Tables Detailed Specifications

#### system_config
**Purpose**: Centralized configuration management for the entire platform
- **Primary Key**: `id` (UUID)
- **Unique Constraints**: `config_key`
- **Indexes**: 
  - `idx_system_config_key` on `config_key`
  - `idx_system_config_type` on `config_type`
- **Row Level Security**: Admin access only
- **Audit Trail**: Full audit logging enabled
- **Data Retention**: Permanent (configuration history)

```sql
CREATE TABLE system_core.system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key VARCHAR(255) NOT NULL,
  config_value TEXT,
  config_type config_type_enum NOT NULL,
  validation_rules JSONB,
  is_encrypted BOOLEAN DEFAULT false,
  environment VARCHAR(50) DEFAULT 'production',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  
  CONSTRAINT uk_system_config_key UNIQUE (config_key, environment),
  CONSTRAINT chk_config_value_not_empty CHECK (config_value IS NOT NULL AND config_value != ''),
  CONSTRAINT chk_environment CHECK (environment IN ('development', 'staging', 'production'))
);
```

#### system_events
**Purpose**: Centralized event logging and audit trail for the entire platform
- **Primary Key**: `id` (UUID)
- **Partitioning**: Range partitioned by `created_at` (monthly partitions)
- **Indexes**:
  - `idx_system_events_timestamp` on `created_at`
  - `idx_system_events_tenant` on `tenant_id`
  - `idx_system_events_type` on `event_type`
  - `idx_system_events_correlation` on `correlation_id`
- **Row Level Security**: Tenant isolation enabled
- **Data Retention**: 7 years (compliance requirement)

```sql
CREATE TABLE system_core.system_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(100) NOT NULL,
  event_subtype VARCHAR(100),
  event_data JSONB NOT NULL,
  severity severity_enum NOT NULL DEFAULT 'INFO',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  tenant_id UUID REFERENCES tenant_mgmt.tenants(id),
  user_id UUID REFERENCES auth.users(id),
  correlation_id UUID,
  source_system VARCHAR(100) DEFAULT 'thorbis_platform',
  ip_address INET,
  user_agent TEXT,
  session_id VARCHAR(255),
  
  -- Partitioning support
  event_date DATE GENERATED ALWAYS AS (DATE(created_at)) STORED
) PARTITION BY RANGE (event_date);
```

### Industry-Specific Table Specifications

#### Home Services: hs_work_orders
**Purpose**: Central work order management for home services businesses
- **Primary Key**: `id` (UUID)
- **Business Key**: `work_order_number` (tenant-scoped unique)
- **Foreign Keys**: 
  - `business_id` → `tenant_mgmt.tenants(id)`
  - `customer_id` → `hs.customers(id)`
- **Indexes**:
  - `idx_hs_work_orders_business_customer` on `(business_id, customer_id)`
  - `idx_hs_work_orders_status` on `status`
  - `idx_hs_work_orders_scheduled` on `scheduled_at`
  - `idx_hs_work_orders_number` on `work_order_number`
- **Row Level Security**: Business tenant isolation
- **Audit Trail**: All changes tracked in `hs_work_orders_audit`

```sql
CREATE TABLE hs.work_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES tenant_mgmt.tenants(id),
  customer_id UUID NOT NULL REFERENCES hs.customers(id),
  work_order_number VARCHAR(100) NOT NULL,
  service_type service_type_enum NOT NULL,
  description TEXT NOT NULL,
  priority priority_enum DEFAULT 'MEDIUM',
  status work_order_status_enum DEFAULT 'PENDING',
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  estimated_cost NUMERIC(10,2),
  final_cost NUMERIC(10,2),
  location_address JSONB,
  special_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  
  CONSTRAINT uk_hs_work_order_number UNIQUE (business_id, work_order_number),
  CONSTRAINT chk_hs_work_order_costs CHECK (estimated_cost >= 0 AND final_cost >= 0),
  CONSTRAINT chk_hs_work_order_completion CHECK (
    (status = 'COMPLETED' AND completed_at IS NOT NULL) OR 
    (status != 'COMPLETED' AND completed_at IS NULL)
  )
);
```

---

## API to Database Mapping

### Home Services API Endpoints to Database Tables

| API Endpoint | HTTP Method | Primary Tables | Related Tables | Performance Notes |
|--------------|-------------|---------------|----------------|-------------------|
| `/api/hs/work-orders` | GET | `hs.work_orders` | `hs.customers`, `hs.technicians` | Uses composite index on `(business_id, status)` |
| `/api/hs/work-orders` | POST | `hs.work_orders` | `hs.customers`, `hs.work_order_assignments` | Triggers sequence number generation |
| `/api/hs/work-orders/{id}` | PUT | `hs.work_orders` | `hs.work_order_assignments`, `hs.invoices` | Updates trigger audit trail |
| `/api/hs/customers` | GET | `hs.customers` | `hs.work_orders` | Full-text search on name fields |
| `/api/hs/technicians/availability` | GET | `hs.technicians`, `hs.technician_availability` | `hs.work_order_assignments` | Uses spatial queries for location |
| `/api/hs/invoices/{id}/pdf` | GET | `hs.invoices`, `hs.invoice_line_items` | `hs.work_orders`, `hs.customers` | Generates PDF from template |

### Restaurant API Endpoints to Database Tables

| API Endpoint | HTTP Method | Primary Tables | Related Tables | Performance Notes |
|--------------|-------------|---------------|----------------|-------------------|
| `/api/rest/orders` | POST | `rest.orders`, `rest.order_items` | `rest.menu_items`, `rest.tables` | Atomic transaction required |
| `/api/rest/kitchen/queue` | GET | `rest.kitchen_queue` | `rest.order_items`, `rest.orders` | Real-time updates via WebSocket |
| `/api/rest/menu/items` | GET | `rest.menu_items` | `rest.menu_categories` | Cached heavily, TTL 5 minutes |
| `/api/rest/pos/payment` | POST | `rest.payments` | `rest.orders`, `banking.transactions` | Integrates with payment processor |

### Banking API Endpoints to Database Tables

| API Endpoint | HTTP Method | Primary Tables | Related Tables | Performance Notes |
|--------------|-------------|---------------|----------------|-------------------|
| `/api/banking/accounts` | GET | `banking.accounts` | `banking.transactions` | Balance calculation optimized |
| `/api/banking/transactions` | GET | `banking.transactions` | `banking.accounts` | Paginated, uses time-series index |
| `/api/banking/payments/process` | POST | `banking.transactions`, `banking.payment_methods` | Industry invoice tables | High-security transaction |

---

## Query Performance Optimization

### Common Query Patterns & Optimizations

#### Home Services - Work Order Lookup
```sql
-- Optimized query for work order dashboard
EXPLAIN (ANALYZE, BUFFERS) 
SELECT 
  wo.id,
  wo.work_order_number,
  wo.status,
  wo.scheduled_at,
  c.first_name || ' ' || c.last_name as customer_name,
  t.name as technician_name
FROM hs.work_orders wo
JOIN hs.customers c ON wo.customer_id = c.id
LEFT JOIN hs.work_order_assignments woa ON wo.id = woa.work_order_id
LEFT JOIN hs.technicians t ON woa.technician_id = t.id
WHERE wo.business_id = $1
  AND wo.scheduled_at >= CURRENT_DATE
  AND wo.scheduled_at < CURRENT_DATE + INTERVAL '7 days'
ORDER BY wo.scheduled_at ASC;

-- Supporting indexes:
-- CREATE INDEX idx_hs_work_orders_business_scheduled ON hs.work_orders (business_id, scheduled_at);
-- CREATE INDEX idx_hs_work_order_assignments_work_order ON hs.work_order_assignments (work_order_id);
```

#### Restaurant - Kitchen Queue Management
```sql
-- Optimized real-time kitchen queue query
EXPLAIN (ANALYZE, BUFFERS)
SELECT 
  kq.id,
  kq.status,
  kq.prep_time_estimated,
  oi.quantity,
  mi.name as item_name,
  o.order_number,
  t.table_number
FROM rest.kitchen_queue kq
JOIN rest.order_items oi ON kq.order_item_id = oi.id
JOIN rest.menu_items mi ON oi.menu_item_id = mi.id
JOIN rest.orders o ON oi.order_id = o.id
JOIN rest.tables t ON o.table_id = t.id
WHERE kq.business_id = $1
  AND kq.status IN ('PENDING', 'IN_PROGRESS')
ORDER BY 
  CASE kq.status WHEN 'IN_PROGRESS' THEN 1 WHEN 'PENDING' THEN 2 END,
  kq.started_at ASC NULLS LAST,
  kq.created_at ASC;

-- Supporting indexes:
-- CREATE INDEX idx_rest_kitchen_queue_status_business ON rest.kitchen_queue (business_id, status, started_at, created_at);
```

#### Banking - Account Balance Calculation
```sql
-- Optimized account balance query with running totals
EXPLAIN (ANALYZE, BUFFERS)
WITH balance_calculation AS (
  SELECT 
    account_id,
    SUM(CASE WHEN transaction_type = 'CREDIT' THEN amount ELSE -amount END) as balance_change
  FROM banking.transactions
  WHERE account_id = $1
    AND status = 'COMPLETED'
    AND transaction_date <= $2
  GROUP BY account_id
)
SELECT 
  a.account_number,
  a.account_type,
  COALESCE(bc.balance_change, 0) as current_balance
FROM banking.accounts a
LEFT JOIN balance_calculation bc ON a.id = bc.account_id
WHERE a.id = $1;

-- Supporting indexes:
-- CREATE INDEX idx_banking_transactions_account_date_status ON banking.transactions (account_id, transaction_date, status);
```

---

## Security & Compliance Mappings

### Row Level Security (RLS) Policies

#### Multi-Tenant Isolation Policy Template
```sql
-- Standard tenant isolation policy applied to all business tables
CREATE POLICY tenant_isolation ON {schema}.{table}
  FOR ALL TO authenticated_users
  USING (business_id = current_setting('app.current_tenant_id')::UUID)
  WITH CHECK (business_id = current_setting('app.current_tenant_id')::UUID);
```

#### Role-Based Data Access Policy
```sql
-- Example: Technicians can only see their assigned work orders
CREATE POLICY technician_work_orders ON hs.work_orders
  FOR SELECT TO technician_role
  USING (
    id IN (
      SELECT work_order_id 
      FROM hs.work_order_assignments woa
      JOIN hs.technicians t ON woa.technician_id = t.id
      WHERE t.user_id = auth.uid()
    )
  );
```

### Data Classification & Encryption Requirements

| Table | Columns | Classification | Encryption | Compliance |
|-------|---------|---------------|------------|------------|
| `hs.customers` | `email`, `phone` | CONFIDENTIAL | Column-level | PCI DSS, GDPR |
| `auto.vehicles` | `vin` | INTERNAL | Column-level | Industry Standard |
| `banking.accounts` | `account_number` | RESTRICTED | Column-level | PCI DSS, SOX |
| `banking.transactions` | `amount`, `external_reference_id` | CONFIDENTIAL | Column-level | PCI DSS |
| `user_mgmt.users` | `password_hash`, `email` | RESTRICTED | Column-level | GDPR, CCPA |
| `rest.payments` | `external_payment_id` | RESTRICTED | Column-level | PCI DSS |

---

## Development Guidelines & Best Practices

### Naming Conventions

#### Table Naming
- **Schema Prefix**: Industry code (`hs_`, `auto_`, `rest_`, `banking_`)
- **Descriptive Names**: Use full words, avoid abbreviations
- **Plural Nouns**: Tables represent collections (`customers`, `work_orders`)
- **Junction Tables**: Use both table names (`work_order_assignments`)

#### Column Naming
- **Snake Case**: Use underscores for word separation
- **Descriptive**: Full words preferred over abbreviations
- **Consistent Patterns**: 
  - `_id` suffix for foreign keys
  - `_at` suffix for timestamps
  - `_count` suffix for counters
  - `is_` prefix for booleans

#### Index Naming
- **Pattern**: `idx_{table}_{columns}_{type}`
- **Examples**: 
  - `idx_hs_work_orders_business_status`
  - `idx_rest_orders_created_at_desc`
  - `idx_banking_transactions_account_date`

### Code Generation Templates

#### API Endpoint Generation
```sql
-- Generate CRUD API endpoints from table metadata
SELECT 
  'export const ' || table_name || 'API = {' as api_definition,
  '  list: (params) => api.get("/api/' || schema_name || '/' || table_name || '", { params }),' as list_method,
  '  create: (data) => api.post("/api/' || schema_name || '/' || table_name || '", data),' as create_method,
  '  update: (id, data) => api.put("/api/' || schema_name || '/' || table_name || '/${id}", data),' as update_method,
  '  delete: (id) => api.delete("/api/' || schema_name || '/' || table_name || '/${id}")' as delete_method,
  '};' as closing
FROM information_schema.tables 
WHERE table_schema IN ('hs', 'auto', 'rest', 'banking', 'ret', 'courses', 'payroll', 'investigations')
  AND table_type = 'BASE TABLE';
```

#### TypeScript Interface Generation
```sql
-- Generate TypeScript interfaces from table columns
SELECT 
  'export interface ' || 
  INITCAP(table_name) || ' {' as interface_start,
  array_to_string(
    array_agg(
      '  ' || column_name || 
      CASE WHEN is_nullable = 'YES' THEN '?: ' ELSE ': ' END ||
      CASE data_type 
        WHEN 'uuid' THEN 'string'
        WHEN 'character varying' THEN 'string'
        WHEN 'text' THEN 'string'
        WHEN 'integer' THEN 'number'
        WHEN 'numeric' THEN 'number'
        WHEN 'boolean' THEN 'boolean'
        WHEN 'timestamp with time zone' THEN 'Date'
        WHEN 'jsonb' THEN 'Record<string, any>'
        ELSE 'any'
      END || ';'
      ORDER BY ordinal_position
    ), E'\n'
  ) as interface_body,
  '}' as interface_end
FROM information_schema.columns 
WHERE table_schema = 'hs' AND table_name = 'work_orders'
GROUP BY table_name;
```

---

## Implementation Checklist

### Phase 1: Core Infrastructure
- [ ] Deploy all core system schemas
- [ ] Implement multi-tenant isolation
- [ ] Configure Row Level Security policies
- [ ] Set up audit logging framework
- [ ] Create performance monitoring

### Phase 2: Industry Schemas
- [ ] Deploy Home Services schema
- [ ] Deploy Restaurant schema
- [ ] Deploy Automotive schema
- [ ] Deploy Banking/Financial schema
- [ ] Deploy Retail schema

### Phase 3: Integration & Optimization
- [ ] Implement cross-schema integrations
- [ ] Optimize query performance
- [ ] Configure data encryption
- [ ] Set up automated backups
- [ ] Deploy monitoring dashboards

### Phase 4: Documentation & Training
- [ ] Complete API documentation
- [ ] Create developer guides
- [ ] Generate ERD diagrams
- [ ] Conduct team training
- [ ] Establish maintenance procedures

---

This comprehensive database documentation provides complete coverage of the Thorbis Business OS database architecture, including detailed ERDs, table specifications, API mappings, performance optimizations, and security requirements across all industry verticals.