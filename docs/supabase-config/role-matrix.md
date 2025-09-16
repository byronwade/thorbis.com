# Thorbis Business OS - Role-Based Permissions Matrix

This document defines the complete permissions matrix for Thorbis's multi-tenant architecture with Row-Level Security (RLS) enforcement.

## 🎯 Core Principles

1. **Tenant Isolation**: All data is scoped to `business_id` - users can never access data from other businesses
2. **Role Hierarchy**: `owner` > `manager` > `staff` > `viewer` (with `api_partner` as special case)
3. **Principle of Least Privilege**: Each role has minimum permissions needed for their function
4. **Immutable Audit**: Audit logs are append-only, no updates/deletes allowed
5. **Public Truth Layer**: `api_partner` has read-only access to verified public data

## 👥 Role Definitions

### Owner
**Scope**: Full business control and administration
**Use Case**: Business owner, primary administrator
**Key Permissions**: Everything within their business

### Manager  
**Scope**: Operational management and oversight
**Use Case**: General manager, operations manager
**Key Permissions**: Most operations except user management and critical business settings

### Staff
**Scope**: Day-to-day operations and customer service
**Use Case**: Technicians, customer service reps, front-desk staff
**Key Permissions**: Customer interactions, job management, basic reporting

### Viewer
**Scope**: Read-only access for reporting and oversight
**Use Case**: Accountants, external consultants, read-only dashboards
**Key Permissions**: Read most data, no modifications

### API Partner
**Scope**: Truth Layer public data access
**Use Case**: External AI agents, partner integrations
**Key Permissions**: Read verified public business data only

## 📊 Permissions Matrix

### Business & Settings

| Resource | Owner | Manager | Staff | Viewer | API Partner |
|----------|--------|---------|-------|--------|-------------|
| **Business Profile** |
| Read business info | ✅ | ✅ | ✅ | ✅ | ✅ (public only) |
| Update business profile | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update business hours | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update service areas | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete business | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Settings & Configuration** |
| Read settings | ✅ | ✅ | ⚠️ (basic) | ⚠️ (basic) | ❌ |
| Update integrations | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update billing settings | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage feature flags | ✅ | ❌ | ❌ | ❌ | ❌ |

### User Management

| Resource | Owner | Manager | Staff | Viewer | API Partner |
|----------|--------|---------|-------|--------|-------------|
| **Users & Roles** |
| Read all users | ✅ | ✅ | ⚠️ (basic info) | ⚠️ (basic info) | ❌ |
| Create users | ✅ | ⚠️ (staff/viewer only) | ❌ | ❌ | ❌ |
| Update user roles | ✅ | ❌ | ❌ | ❌ | ❌ |
| Delete users | ✅ | ❌ | ❌ | ❌ | ❌ |
| Update own profile | ✅ | ✅ | ✅ | ✅ | ❌ |
| Reset passwords | ✅ | ⚠️ (staff/viewer only) | ❌ | ❌ | ❌ |

### Customer Data

| Resource | Owner | Manager | Staff | Viewer | API Partner |
|----------|--------|---------|-------|--------|-------------|
| **Customer Records** |
| Read customers | ✅ | ✅ | ✅ | ✅ | ❌ |
| Create customers | ✅ | ✅ | ✅ | ❌ | ❌ |
| Update customers | ✅ | ✅ | ✅ | ❌ | ❌ |
| Delete customers | ✅ | ✅ | ❌ | ❌ | ❌ |
| View customer PII | ✅ | ✅ | ✅ | ⚠️ (masked) | ❌ |
| Export customer data | ✅ | ✅ | ❌ | ❌ | ❌ |

### Jobs & Scheduling

| Resource | Owner | Manager | Staff | Viewer | API Partner |
|----------|--------|---------|-------|--------|-------------|
| **Jobs & Work Orders** |
| Read jobs | ✅ | ✅ | ✅ | ✅ | ❌ |
| Create jobs | ✅ | ✅ | ✅ | ❌ | ❌ |
| Update jobs | ✅ | ✅ | ✅ | ❌ | ❌ |
| Complete jobs | ✅ | ✅ | ✅ | ❌ | ❌ |
| Delete jobs | ✅ | ✅ | ❌ | ❌ | ❌ |
| Assign technicians | ✅ | ✅ | ⚠️ (to self) | ❌ | ❌ |
| **Appointments** |
| Read appointments | ✅ | ✅ | ✅ | ✅ | ✅ (availability only) |
| Create appointments | ✅ | ✅ | ✅ | ❌ | ❌ |
| Update appointments | ✅ | ✅ | ✅ | ❌ | ❌ |
| Cancel appointments | ✅ | ✅ | ✅ | ❌ | ❌ |
| View scheduling conflicts | ✅ | ✅ | ✅ | ❌ | ❌ |

### Financial Data

| Resource | Owner | Manager | Staff | Viewer | API Partner |
|----------|--------|---------|-------|--------|-------------|
| **Estimates** |
| Read estimates | ✅ | ✅ | ✅ | ✅ | ❌ |
| Create estimates | ✅ | ✅ | ⚠️ (basic) | ❌ | ❌ |
| Update estimates | ✅ | ✅ | ⚠️ (basic) | ❌ | ❌ |
| Send estimates | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete estimates | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Invoices** |
| Read invoices | ✅ | ✅ | ✅ | ✅ | ❌ |
| Create invoices | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update invoices | ✅ | ✅ | ❌ | ❌ | ❌ |
| Send invoices | ✅ | ✅ | ❌ | ❌ | ❌ |
| Process payments | ✅ | ✅ | ⚠️ (record only) | ❌ | ❌ |
| **Pricing & Costs** |
| Read pricebook | ✅ | ✅ | ✅ | ⚠️ (no costs) | ✅ (pricing bands only) |
| Update pricebook | ✅ | ✅ | ❌ | ❌ | ❌ |
| View profit margins | ✅ | ✅ | ❌ | ❌ | ❌ |

### Reviews & Ratings

| Resource | Owner | Manager | Staff | Viewer | API Partner |
|----------|--------|---------|-------|--------|-------------|
| **Reviews** |
| Read reviews | ✅ | ✅ | ✅ | ✅ | ✅ (verified only) |
| Respond to reviews | ✅ | ✅ | ⚠️ (with approval) | ❌ | ❌ |
| Request reviews | ✅ | ✅ | ✅ | ❌ | ❌ |
| Dispute reviews | ✅ | ✅ | ❌ | ❌ | ❌ |
| View review analytics | ✅ | ✅ | ⚠️ (basic) | ✅ | ✅ (public metrics) |

### Marketing & Communications

| Resource | Owner | Manager | Staff | Viewer | API Partner |
|----------|--------|---------|-------|--------|-------------|
| **Marketing Campaigns** |
| Read campaigns | ✅ | ✅ | ⚠️ (assigned only) | ✅ | ❌ |
| Create campaigns | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update campaigns | ✅ | ✅ | ❌ | ❌ | ❌ |
| Send campaigns | ✅ | ✅ | ❌ | ❌ | ❌ |
| View analytics | ✅ | ✅ | ⚠️ (basic) | ✅ | ❌ |
| **Google Business Profile** |
| Read GBP data | ✅ | ✅ | ✅ | ✅ | ✅ (public data) |
| Update GBP | ✅ | ✅ | ❌ | ❌ | ❌ |
| Sync GBP data | ✅ | ✅ | ❌ | ❌ | ❌ |

### Restaurant Domain (if enabled)

| Resource | Owner | Manager | Staff | Viewer | API Partner |
|----------|--------|---------|-------|--------|-------------|
| **Point of Sale** |
| Read POS data | ✅ | ✅ | ✅ | ✅ | ❌ |
| Process transactions | ✅ | ✅ | ✅ | ❌ | ❌ |
| Void transactions | ✅ | ✅ | ⚠️ (own only) | ❌ | ❌ |
| Access cash drawer | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Menu Management** |
| Read menus | ✅ | ✅ | ✅ | ✅ | ✅ (public menus) |
| Update menus | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update pricing | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Inventory** |
| Read inventory | ✅ | ✅ | ✅ | ✅ | ❌ |
| Update inventory | ✅ | ✅ | ✅ | ❌ | ❌ |
| Create purchase orders | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Reservations** |
| Read reservations | ✅ | ✅ | ✅ | ✅ | ✅ (availability only) |
| Create reservations | ✅ | ✅ | ✅ | ❌ | ❌ |
| Update reservations | ✅ | ✅ | ✅ | ❌ | ❌ |
| Cancel reservations | ✅ | ✅ | ✅ | ❌ | ❌ |

### Payroll & HR

| Resource | Owner | Manager | Staff | Viewer | API Partner |
|----------|--------|---------|-------|--------|-------------|
| **Payroll** |
| Read payroll data | ✅ | ⚠️ (summary only) | ⚠️ (own only) | ❌ | ❌ |
| Process payroll | ✅ | ❌ | ❌ | ❌ | ❌ |
| Update pay rates | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Time Clock** |
| Read timesheets | ✅ | ✅ | ⚠️ (own only) | ⚠️ (summary) | ❌ |
| Clock in/out | ✅ | ✅ | ✅ | ❌ | ❌ |
| Edit timesheets | ✅ | ✅ | ⚠️ (own only) | ❌ | ❌ |
| Approve timesheets | ✅ | ✅ | ❌ | ❌ | ❌ |

### Audit & Compliance

| Resource | Owner | Manager | Staff | Viewer | API Partner |
|----------|--------|---------|-------|--------|-------------|
| **Audit Logs** |
| Read audit logs | ✅ | ✅ | ⚠️ (own actions) | ⚠️ (summary) | ❌ |
| Export audit logs | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Insurance & Licenses** |
| Read credentials | ✅ | ✅ | ⚠️ (basic info) | ⚠️ (basic info) | ✅ (verification status) |
| Update credentials | ✅ | ⚠️ (upload only) | ❌ | ❌ | ❌ |
| Verify credentials | ✅ | ✅ | ❌ | ❌ | ❌ |

### Integration & API

| Resource | Owner | Manager | Staff | Viewer | API Partner |
|----------|--------|---------|-------|--------|-------------|
| **Truth Layer API** |
| Business profile | ✅ | ✅ | ✅ | ✅ | ✅ |
| Availability data | ✅ | ✅ | ✅ | ✅ | ✅ |
| Pricing bands | ✅ | ✅ | ✅ | ✅ | ✅ |
| Reviews (verified) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create booking holds | ✅ | ✅ | ✅ | ❌ | ✅ |
| Create estimates | ✅ | ✅ | ⚠️ | ❌ | ✅ |
| Create payment links | ✅ | ✅ | ❌ | ❌ | ✅ |
| **Internal APIs** |
| Read endpoints | ✅ | ✅ | ✅ | ✅ | ❌ |
| Write endpoints | ✅ | ✅ | ⚠️ | ❌ | ❌ |
| Admin endpoints | ✅ | ❌ | ❌ | ❌ | ❌ |

## 🔐 Special Access Rules

### Self-Access Rules
- **All roles** can read/update their own user profile
- **Staff** can read/update their own timesheets and tasks
- **Staff** can view jobs assigned to them with full details

### Business-Scoped Rules
- All permissions are automatically scoped to the user's `business_id`
- Users can never see or modify data from other businesses
- Cross-business queries are automatically filtered by RLS

### API Partner Rules
- Read-only access to public Truth Layer endpoints
- Cannot access internal business data or PII
- Rate limited per API key
- All data returned is anonymized/aggregated where applicable

### Audit Trail Rules
- All actions are logged in `audit_log` table
- Audit logs are immutable (insert-only)
- Users can only read their own audit entries (except owners/managers)

### Data Masking Rules
- **Viewer** role sees masked PII (phone numbers, email addresses)
- **API Partner** sees no PII, only aggregated/anonymized data
- **Staff** sees full customer data for assigned jobs only

## 🚨 Security Boundaries

### Hard Boundaries (Cannot be overridden)
1. **Tenant Isolation**: `business_id` filtering on all tables
2. **Audit Immutability**: No updates/deletes on audit logs
3. **API Partner Restrictions**: Read-only access only
4. **PII Protection**: Automatic masking for restricted roles

### Soft Boundaries (Configurable per business)
1. **Role Permissions**: Can be customized via feature flags
2. **Domain Access**: Restaurant features can be enabled/disabled
3. **Integration Access**: Third-party integrations can be restricted

### Emergency Access
- **Owner** role can override most restrictions in emergency mode
- Emergency access is logged and requires confirmation
- Temporary elevated access expires after 24 hours

## 📝 Implementation Notes

### Database Design
- Every table has `business_id` column for tenant isolation
- User roles stored in `users` table with `role` enum
- RLS policies reference `current_user_business_id()` function
- Special handling for `api_partner` role in policies

### Performance Considerations
- Indexes on `business_id` for all tables
- Composite indexes on `(business_id, created_at)` for time-based queries
- RLS policies optimized to use indexes effectively

### Migration Path
- Existing data migration includes `business_id` population
- New RLS policies applied gradually with testing
- Rollback procedures documented for each policy

This permissions matrix ensures secure multi-tenancy while providing appropriate access levels for each role in the Thorbis Business OS ecosystem.
