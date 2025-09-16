# Thorbis Business OS - Supabase RLS Configuration

Comprehensive Row Level Security (RLS) configuration for multi-tenant Thorbis Business OS with role-based access controls.

## 🎯 Overview

This configuration ensures complete data isolation between businesses while providing fine-grained role-based access controls. Every query is automatically filtered by tenant (`business_id`) and user permissions.

## 📁 Files

- **`role-matrix.md`** - Comprehensive permissions matrix for all 5 roles
- **`rls-policies.sql`** - Complete RLS policies for all tables  
- **`test-rls.md`** - 20 test cases (10 pass, 10 deny) with seed data
- **`README.md`** - This documentation

## 👥 Role Hierarchy

```
owner > manager > staff > viewer
                        ↗ api_partner (special read-only)
```

### Role Definitions
- **Owner**: Full business control, user management, financial access
- **Manager**: Operational management, most features except user/billing
- **Staff**: Day-to-day operations, customer service, assigned work
- **Viewer**: Read-only access for reporting and oversight  
- **API Partner**: Truth Layer public data access only

## 🔒 Security Model

### Multi-Tenancy
- **Complete Isolation**: Users can only access their business data
- **Automatic Filtering**: All queries filtered by `business_id`
- **Cross-Tenant Prevention**: Impossible to access other business data

### Role-Based Access
- **Hierarchical Permissions**: Higher roles inherit lower role permissions
- **Table-Level Controls**: Different access patterns per table type
- **Action-Level Restrictions**: Read/Write/Delete permissions per role

### Special Cases
- **Self-Access**: Users can always read/update their own profile
- **API Partners**: Read-only access to anonymized public data
- **Audit Immutability**: Audit logs are append-only, no modifications
- **Financial Restrictions**: Enhanced protection for financial data

## 🗄️ Database Schema Requirements

### Required Columns
Every business-scoped table must have:
```sql
CREATE TABLE example_table (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id),
  -- other columns...
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### Required Indexes
For optimal RLS performance:
```sql
CREATE INDEX idx_example_table_business_id ON example_table(business_id);
CREATE INDEX idx_example_table_business_date ON example_table(business_id, created_at);
```

### Required Functions
Essential utility functions are included in `rls-policies.sql`:
- `current_user_business_id()` - Get user's business ID
- `current_user_role()` - Get user's role
- `is_api_partner()` - Check if user is API partner
- `can_read_user_data()` - Check user data access permissions

## 🚀 Implementation Guide

### 1. Create Tables
```sql
-- Example table creation with RLS requirements
CREATE TABLE customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id),
  name text NOT NULL,
  email text,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Create index for performance
CREATE INDEX idx_customers_business_id ON customers(business_id);
```

### 2. Apply RLS Policies
```sql
-- Run all policies from rls-policies.sql
\i rls-policies.sql
```

### 3. Create Utility Functions
```sql
-- Create the utility functions first (included in rls-policies.sql)
-- These are referenced by the RLS policies
```

### 4. Set Up Triggers
```sql
-- Auto-set business_id trigger
CREATE TRIGGER auto_set_business_id_trigger
  BEFORE INSERT ON customers
  FOR EACH ROW EXECUTE FUNCTION auto_set_business_id();

-- Audit trail trigger  
CREATE TRIGGER audit_customers_trigger
  AFTER INSERT OR UPDATE OR DELETE ON customers
  FOR EACH ROW EXECUTE FUNCTION audit_data_changes();
```

### 5. Seed Test Data
```sql
-- Run the test data setup from test-rls.md
-- This creates 2 businesses with 4 users each
```

### 6. Run Tests
Execute all test cases from `test-rls.md` to verify policies work correctly.

## 🧪 Testing & Validation

### Quick Validation
```sql
-- Test tenant isolation
SELECT set_config('request.jwt.claims', '{"sub": "owner-user-id"}', true);
SELECT count(*) FROM customers; -- Should only return own business data

-- Test role permissions
SELECT set_config('request.jwt.claims', '{"sub": "viewer-user-id"}', true);
INSERT INTO customers (name) VALUES ('Test'); -- Should fail
```

### Full Test Suite
Run all 20 test cases from `test-rls.md`:
- ✅ **10 PASS tests** - Valid operations that should succeed
- ❌ **10 DENY tests** - Invalid operations that should be blocked

### Performance Testing
```sql
-- Verify indexes are being used
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM customers WHERE business_id = current_user_business_id();

-- Check for sequential scans (bad)
SELECT schemaname, tablename, seq_scan, seq_tup_read, idx_scan, idx_tup_fetch 
FROM pg_stat_user_tables 
WHERE seq_scan > idx_scan;
```

## 📊 Permission Matrix Summary

| Resource | Owner | Manager | Staff | Viewer | API Partner |
|----------|--------|---------|-------|--------|-------------|
| **Business Data** | ✅ Full | ✅ Most | ✅ Limited | ✅ Read | ✅ Public Only |
| **User Management** | ✅ All Users | ⚠️ Staff/Viewer | ❌ None | ❌ None | ❌ None |
| **Customer Data** | ✅ Full | ✅ Full | ✅ Full | ⚠️ Read | ❌ None |
| **Financial Data** | ✅ Full | ✅ Most | ⚠️ Basic | ✅ Read | ❌ None |
| **Jobs & Scheduling** | ✅ Full | ✅ Full | ✅ Assigned | ✅ Read | ❌ None |
| **Reviews & Ratings** | ✅ Full | ✅ Full | ⚠️ Response | ✅ Read | ✅ Verified |
| **Audit Logs** | ✅ All | ✅ All | ⚠️ Own Only | ⚠️ Summary | ❌ None |

**Legend**: ✅ Full Access, ⚠️ Limited Access, ❌ No Access

## 🔧 Configuration Options

### Environment Variables
```bash
# Authentication
SUPABASE_JWT_SECRET=your-jwt-secret
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Database
DATABASE_URL=postgresql://user:pass@host:port/db
POSTGRES_PASSWORD=your-postgres-password

# Feature Flags (optional)
ENABLE_AUDIT_LOGGING=true
ENABLE_CROSS_BUSINESS_OWNER_ACCESS=false
AUDIT_LOG_RETENTION_DAYS=90
```

### Feature Flags
Control RLS behavior via business settings:
```sql
-- Example feature flag usage in policies
CREATE POLICY "enhanced_audit_access" ON audit_log
  FOR SELECT
  USING (
    business_id = current_user_business_id()
    AND (
      current_user_role() IN ('owner', 'manager')
      OR (
        get_business_feature('detailed_audit_access') = true
        AND current_user_role() = 'staff'
      )
    )
  );
```

## ⚡ Performance Considerations

### Index Strategy
- **Primary**: `business_id` on all tables
- **Composite**: `(business_id, created_at)` for time-series data
- **Covering**: Include frequently selected columns
- **Partial**: For specific business statuses or types

### Query Patterns
```sql
-- Good: Uses business_id index
SELECT * FROM customers WHERE business_id = current_user_business_id();

-- Good: Composite index usage  
SELECT * FROM jobs 
WHERE business_id = current_user_business_id() 
  AND created_at > '2024-01-01';

-- Avoid: Cross-tenant queries (automatically filtered anyway)
SELECT * FROM customers; -- RLS adds WHERE business_id = ... automatically
```

### Monitoring
```sql
-- Check RLS overhead
SELECT 
  schemaname, 
  tablename,
  n_tup_ins + n_tup_upd + n_tup_del as writes,
  n_tup_fetch + n_tup_read as reads,
  seq_scan,
  idx_scan
FROM pg_stat_user_tables 
ORDER BY writes DESC;

-- Monitor policy violations (failed queries)
SELECT * FROM pg_stat_database WHERE datname = current_database();
```

## 🛡️ Security Best Practices

### JWT Token Security
- Include `business_id` and `role` in JWT claims
- Use short token expiry (15 minutes) with refresh tokens
- Validate tokens server-side before database access

### RLS Policy Security
- Never trust client-side role claims
- Always verify business_id matches authenticated user
- Use SECURITY DEFINER functions for sensitive operations

### Audit Requirements
- Log all data modifications automatically
- Include before/after values for updates
- Track policy violations and access attempts
- Retain logs per compliance requirements

## 🚨 Emergency Procedures

### Disable RLS (Emergency Only)
```sql
-- DANGER: Only for emergency maintenance
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
-- Remember to re-enable: ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
```

### Emergency Access
```sql
-- Owner can grant temporary elevated access
SELECT enable_emergency_access('user-id', 24); -- 24 hours
```

### Policy Rollback
```sql
-- Drop specific policy
DROP POLICY "customers_select" ON customers;

-- Recreate with fixes
CREATE POLICY "customers_select" ON customers FOR SELECT USING (...);
```

## 📈 Migration Guide

### Adding New Tables
1. Create table with `business_id` column
2. Enable RLS: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY`
3. Create indexes on `business_id`
4. Add policies following established patterns
5. Add audit triggers if needed
6. Test with all role types

### Modifying Existing Policies
1. Test changes on staging environment
2. Backup existing policies
3. Drop old policy: `DROP POLICY policy_name ON table_name`
4. Create new policy with modifications
5. Run full test suite
6. Monitor performance impact

## 🔗 Integration Points

### Application Layer
- Use `auth.uid()` in application queries (set by Supabase Auth)
- Handle RLS errors gracefully (empty results vs. errors)
- Cache user role/business_id to avoid repeated lookups

### API Layer
- Validate JWT tokens contain required claims
- Set appropriate `request.jwt.claims` for RLS context
- Return appropriate HTTP status codes for policy violations

### External APIs (Truth Layer)
- Use service role key for API partner contexts
- Apply additional filtering for public data only
- Rate limit and monitor API partner usage

## 📞 Troubleshooting

### Common Issues

**Problem**: Queries return empty results
```sql
-- Check user context
SELECT current_user_business_id(), current_user_role();

-- Verify business_id exists
SELECT id FROM businesses WHERE id = current_user_business_id();
```

**Problem**: Policy violations
```sql
-- Check specific policy
\d+ table_name  -- Shows policies

-- Test policy logic
SELECT policy_condition_result;
```

**Problem**: Performance issues
```sql
-- Check for missing indexes
SELECT tablename FROM pg_tables WHERE schemaname = 'public'
AND tablename NOT IN (
  SELECT tablename FROM pg_indexes WHERE indexname LIKE '%business_id%'
);
```

### Support
- 📚 **Documentation**: Full RLS guides and examples
- 🐛 **Issues**: Report bugs with query examples
- 💬 **Discussion**: Architecture and performance questions
- 🚨 **Security**: Report security concerns privately

---

**Ready for Production**: This RLS configuration provides enterprise-grade multi-tenancy with comprehensive role-based access controls, tested across all scenarios and optimized for performance.
