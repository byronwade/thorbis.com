# Thorbis Business OS - RLS Policy Tests

Comprehensive test suite for Row Level Security policies ensuring proper multi-tenancy and role-based access controls.

## 🗄️ Test Data Setup

Before running tests, seed the database with this test data:

```sql
-- Create test businesses
INSERT INTO businesses (id, name, slug, industry, status, visibility) VALUES
('11111111-1111-1111-1111-111111111111', 'Smith Plumbing Co', 'smith-plumbing', 'plumbing', 'active', 'public'),
('22222222-2222-2222-2222-222222222222', 'Johnson Electric', 'johnson-electric', 'electrical', 'active', 'public');

-- Create test users for Business 1 (Smith Plumbing)
INSERT INTO users (id, business_id, email, role, name) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'owner@smithplumbing.com', 'owner', 'John Smith'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'manager@smithplumbing.com', 'manager', 'Jane Manager'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'tech@smithplumbing.com', 'staff', 'Bob Technician'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', 'viewer@smithplumbing.com', 'viewer', 'Alice Viewer');

-- Create test users for Business 2 (Johnson Electric)  
INSERT INTO users (id, business_id, email, role, name) VALUES
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '22222222-2222-2222-2222-222222222222', 'owner@johnsonelectric.com', 'owner', 'Mike Johnson'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', '22222222-2222-2222-2222-222222222222', 'manager@johnsonelectric.com', 'manager', 'Sarah Manager'),
('gggggggg-gggg-gggg-gggg-gggggggggggg', '22222222-2222-2222-2222-222222222222', 'electrician@johnsonelectric.com', 'staff', 'Tom Electrician'),
('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', '22222222-2222-2222-2222-222222222222', 'reports@johnsonelectric.com', 'viewer', 'Lisa Reports');

-- Create API partner user
INSERT INTO users (id, business_id, email, role, name) VALUES
('iiiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', NULL, 'api@truthlayer.com', 'api_partner', 'Truth Layer API');

-- Create sample customers
INSERT INTO customers (id, business_id, name, email, phone) VALUES
('c1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Customer A', 'customerA@email.com', '+1-512-555-0001'),
('c2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Customer B', 'customerB@email.com', '+1-512-555-0002');

-- Create sample jobs
INSERT INTO jobs (id, business_id, customer_id, title, description, assigned_to, status) VALUES
('j1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Kitchen Sink Repair', 'Fix leaking kitchen sink', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'in_progress'),
('j2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'Outlet Installation', 'Install new electrical outlet', 'gggggggg-gggg-gggg-gggg-gggggggggggg', 'scheduled');

-- Create sample estimates
INSERT INTO estimates (id, business_id, customer_id, title, total, status) VALUES
('e1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Bathroom Renovation', 4500.00, 'sent'),
('e2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'Panel Upgrade', 3200.00, 'draft');

-- Create sample reviews
INSERT INTO reviews (id, business_id, rating, content, verified, service_type) VALUES
('r1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 5, 'Excellent plumbing work', true, 'repair'),
('r2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 4, 'Professional electrical service', true, 'installation');
```

## ✅ Test Cases That MUST Pass (Valid Operations)

### Test 1: Owner Can Read All Data in Their Business
```sql
-- Set auth context to Smith Plumbing owner
SELECT set_config('request.jwt.claims', '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"}', true);

-- Test: Owner can read all customers in their business
SELECT id, name FROM customers;
-- Expected: Returns Customer A only (not Customer B from other business)

-- Test: Owner can read all jobs in their business  
SELECT id, title FROM jobs;
-- Expected: Returns Kitchen Sink Repair only

-- Test: Owner can read business profile
SELECT name, industry FROM businesses;
-- Expected: Returns Smith Plumbing Co only
```

### Test 2: Manager Can Perform Management Operations
```sql
-- Set auth context to Smith Plumbing manager
SELECT set_config('request.jwt.claims', '{"sub": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"}', true);

-- Test: Manager can update customer information
UPDATE customers 
SET phone = '+1-512-555-9999' 
WHERE id = 'c1111111-1111-1111-1111-111111111111';
-- Expected: Success (1 row updated)

-- Test: Manager can create new jobs
INSERT INTO jobs (id, business_id, customer_id, title, description, status) 
VALUES ('j3333333-3333-3333-3333-333333333333', current_user_business_id(), 'c1111111-1111-1111-1111-111111111111', 'New Job', 'Test job', 'scheduled');
-- Expected: Success (1 row inserted)

-- Test: Manager can update business profile
UPDATE businesses 
SET description = 'Updated description' 
WHERE id = current_user_business_id();
-- Expected: Success (1 row updated)
```

### Test 3: Staff Can Access Their Assigned Work
```sql
-- Set auth context to Smith Plumbing technician
SELECT set_config('request.jwt.claims', '{"sub": "cccccccc-cccc-cccc-cccc-cccccccccccc"}', true);

-- Test: Staff can read jobs assigned to them
SELECT id, title, description FROM jobs WHERE assigned_to = auth.uid();
-- Expected: Returns Kitchen Sink Repair job

-- Test: Staff can update jobs assigned to them
UPDATE jobs 
SET status = 'completed', notes = 'Job completed successfully' 
WHERE id = 'j1111111-1111-1111-1111-111111111111' AND assigned_to = auth.uid();
-- Expected: Success (1 row updated)

-- Test: Staff can create customer records
INSERT INTO customers (id, business_id, name, email) 
VALUES ('c3333333-3333-3333-3333-333333333333', current_user_business_id(), 'New Customer', 'new@email.com');
-- Expected: Success (1 row inserted)
```

### Test 4: Viewer Can Read But Not Modify
```sql
-- Set auth context to Smith Plumbing viewer
SELECT set_config('request.jwt.claims', '{"sub": "dddddddd-dddd-dddd-dddd-dddddddddddd"}', true);

-- Test: Viewer can read customers
SELECT id, name, email FROM customers;
-- Expected: Returns customers from Smith Plumbing only

-- Test: Viewer can read jobs
SELECT id, title, status FROM jobs;
-- Expected: Returns jobs from Smith Plumbing only

-- Test: Viewer can read estimates
SELECT id, title, total FROM estimates;
-- Expected: Returns estimates from Smith Plumbing only
```

### Test 5: Users Can Update Their Own Profile
```sql
-- Set auth context to staff member
SELECT set_config('request.jwt.claims', '{"sub": "cccccccc-cccc-cccc-cccc-cccccccccccc"}', true);

-- Test: Staff can update their own profile
UPDATE users 
SET name = 'Bob Updated Technician', phone = '+1-512-555-1234' 
WHERE id = auth.uid();
-- Expected: Success (1 row updated)

-- Test: Staff can read their own profile
SELECT name, email, phone FROM users WHERE id = auth.uid();
-- Expected: Returns updated profile data
```

### Test 6: API Partner Can Read Public Business Data
```sql
-- Set auth context to API partner
SELECT set_config('request.jwt.claims', '{"sub": "iiiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii"}', true);

-- Test: API partner can read public business profiles
SELECT name, industry, slug FROM public_business_profiles;
-- Expected: Returns both Smith Plumbing and Johnson Electric

-- Test: API partner can read verified reviews
SELECT rating, service_type, content_preview FROM public_reviews;
-- Expected: Returns anonymized verified reviews from both businesses
```

### Test 7: Cross-Role User Management (Owner Creates Users)
```sql
-- Set auth context to Smith Plumbing owner
SELECT set_config('request.jwt.claims', '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"}', true);

-- Test: Owner can create new staff user
INSERT INTO users (id, business_id, email, role, name) 
VALUES ('newstaff-1111-1111-1111-111111111111', current_user_business_id(), 'newstaff@smithplumbing.com', 'staff', 'New Staff Member');
-- Expected: Success (1 row inserted)

-- Test: Owner can read all users in their business
SELECT name, email, role FROM users WHERE business_id = current_user_business_id();
-- Expected: Returns all Smith Plumbing users including newly created one
```

### Test 8: Manager Can Create Limited User Roles
```sql
-- Set auth context to Smith Plumbing manager  
SELECT set_config('request.jwt.claims', '{"sub": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"}', true);

-- Test: Manager can create staff user
INSERT INTO users (id, business_id, email, role, name) 
VALUES ('newstaff2-111-1111-1111-111111111111', current_user_business_id(), 'staff2@smithplumbing.com', 'staff', 'Another Staff');
-- Expected: Success (1 row inserted)

-- Test: Manager can create viewer user
INSERT INTO users (id, business_id, email, role, name) 
VALUES ('newviewer-111-1111-1111-111111111111', current_user_business_id(), 'viewer2@smithplumbing.com', 'viewer', 'Another Viewer');
-- Expected: Success (1 row inserted)
```

### Test 9: Financial Data Access by Role
```sql
-- Set auth context to Smith Plumbing manager
SELECT set_config('request.jwt.claims', '{"sub": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"}', true);

-- Test: Manager can create invoices
INSERT INTO invoices (id, business_id, customer_id, estimate_id, total, status) 
VALUES ('inv11111-1111-1111-1111-111111111111', current_user_business_id(), 'c1111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', 4500.00, 'sent');
-- Expected: Success (1 row inserted)

-- Test: Manager can update estimates
UPDATE estimates 
SET status = 'approved', notes = 'Customer approved estimate' 
WHERE id = 'e1111111-1111-1111-1111-111111111111';
-- Expected: Success (1 row updated)
```

### Test 10: Audit Log Access by Role
```sql
-- Set auth context to Smith Plumbing owner
SELECT set_config('request.jwt.claims', '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"}', true);

-- Test: Owner can read all audit logs for their business
SELECT action, table_name, user_id FROM audit_log 
WHERE business_id = current_user_business_id()
ORDER BY created_at DESC LIMIT 10;
-- Expected: Returns recent audit log entries for Smith Plumbing

-- Set auth context to staff member
SELECT set_config('request.jwt.claims', '{"sub": "cccccccc-cccc-cccc-cccc-cccccccccccc"}', true);

-- Test: Staff can read their own audit log entries
SELECT action, table_name FROM audit_log 
WHERE business_id = current_user_business_id() AND user_id = auth.uid()
ORDER BY created_at DESC LIMIT 5;
-- Expected: Returns audit entries for actions performed by this staff member
```

---

## ❌ Test Cases That MUST Be Denied (Invalid Operations)

### Test 1: Cross-Tenant Data Access Denied
```sql
-- Set auth context to Smith Plumbing owner
SELECT set_config('request.jwt.claims', '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"}', true);

-- Test: Owner cannot read customers from other business
SELECT name FROM customers WHERE business_id = '22222222-2222-2222-2222-222222222222';
-- Expected: Returns 0 rows (data filtered by RLS)

-- Test: Owner cannot update other business's data
UPDATE businesses 
SET name = 'Hacked Name' 
WHERE id = '22222222-2222-2222-2222-222222222222';
-- Expected: 0 rows affected (no permission to update other business)
```

### Test 2: Role Hierarchy Violations Denied  
```sql
-- Set auth context to Smith Plumbing staff
SELECT set_config('request.jwt.claims', '{"sub": "cccccccc-cccc-cccc-cccc-cccccccccccc"}', true);

-- Test: Staff cannot create invoices (manager+ only)
INSERT INTO invoices (id, business_id, customer_id, total, status) 
VALUES ('badinv11-1111-1111-1111-111111111111', current_user_business_id(), 'c1111111-1111-1111-1111-111111111111', 1000.00, 'draft');
-- Expected: Error - RLS policy denies insert

-- Test: Staff cannot delete customers
DELETE FROM customers WHERE id = 'c1111111-1111-1111-1111-111111111111';
-- Expected: Error - RLS policy denies delete
```

### Test 3: Viewer Write Operations Denied
```sql
-- Set auth context to Smith Plumbing viewer
SELECT set_config('request.jwt.claims', '{"sub": "dddddddd-dddd-dddd-dddd-dddddddddddd"}', true);

-- Test: Viewer cannot create customers
INSERT INTO customers (id, business_id, name, email) 
VALUES ('badcust1-1111-1111-1111-111111111111', current_user_business_id(), 'Bad Customer', 'bad@email.com');
-- Expected: Error - RLS policy denies insert

-- Test: Viewer cannot update jobs
UPDATE jobs 
SET status = 'completed' 
WHERE id = 'j1111111-1111-1111-1111-111111111111';
-- Expected: Error - RLS policy denies update

-- Test: Viewer cannot update business settings
UPDATE businesses 
SET description = 'Unauthorized change' 
WHERE id = current_user_business_id();
-- Expected: Error - RLS policy denies update
```

### Test 4: Staff Role Limitations Denied
```sql
-- Set auth context to Smith Plumbing staff
SELECT set_config('request.jwt.claims', '{"sub": "cccccccc-cccc-cccc-cccc-cccccccccccc"}', true);

-- Test: Staff cannot create other users
INSERT INTO users (id, business_id, email, role, name) 
VALUES ('baduser1-1111-1111-1111-111111111111', current_user_business_id(), 'baduser@smithplumbing.com', 'staff', 'Unauthorized User');
-- Expected: Error - RLS policy denies insert

-- Test: Staff cannot update jobs not assigned to them
UPDATE jobs 
SET status = 'completed' 
WHERE id = 'j2222222-2222-2222-2222-222222222222'; -- This is assigned to Johnson Electric employee
-- Expected: Error - RLS policy denies update (wrong business)

-- Test: Staff cannot access payroll data
SELECT * FROM payroll WHERE business_id = current_user_business_id();
-- Expected: Error - RLS policy denies select
```

### Test 5: Manager Limitations Denied
```sql
-- Set auth context to Smith Plumbing manager
SELECT set_config('request.jwt.claims', '{"sub": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"}', true);

-- Test: Manager cannot create owner-level users
INSERT INTO users (id, business_id, email, role, name) 
VALUES ('badowner1-111-1111-1111-111111111111', current_user_business_id(), 'badowner@smithplumbing.com', 'owner', 'Fake Owner');
-- Expected: Error - RLS policy denies insert (only owners can create owners)

-- Test: Manager cannot delete the business
DELETE FROM businesses WHERE id = current_user_business_id();
-- Expected: Error - RLS policy denies delete (owner only)

-- Test: Manager cannot access billing settings (if separate table)
UPDATE billing_settings 
SET plan = 'enterprise' 
WHERE business_id = current_user_business_id();
-- Expected: Error - RLS policy denies update (owner only)
```

### Test 6: API Partner Write Operations Denied
```sql
-- Set auth context to API partner
SELECT set_config('request.jwt.claims', '{"sub": "iiiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii"}', true);

-- Test: API partner cannot create customers
INSERT INTO customers (id, business_id, name, email) 
VALUES ('apicust1-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'API Customer', 'api@email.com');
-- Expected: Error - RLS policy denies insert

-- Test: API partner cannot update business data
UPDATE businesses 
SET description = 'API hack attempt' 
WHERE id = '11111111-1111-1111-1111-111111111111';
-- Expected: Error - RLS policy denies update

-- Test: API partner cannot read private customer data
SELECT email, phone, address FROM customers;
-- Expected: Error - RLS policy denies select (or returns 0 rows)
```

### Test 7: Cross-User Profile Access Denied
```sql
-- Set auth context to Smith Plumbing staff
SELECT set_config('request.jwt.claims', '{"sub": "cccccccc-cccc-cccc-cccc-cccccccccccc"}', true);

-- Test: Staff cannot update other user's profiles
UPDATE users 
SET role = 'owner' 
WHERE id = 'dddddddd-dddd-dddd-dddd-dddddddddddd'; -- Trying to modify viewer
-- Expected: Error - RLS policy denies update

-- Test: Staff cannot read sensitive user data from other businesses
SELECT email, phone FROM users 
WHERE business_id = '22222222-2222-2222-2222-222222222222';
-- Expected: Returns 0 rows (cross-tenant access denied)
```

### Test 8: Audit Log Tampering Denied
```sql
-- Set auth context to any user
SELECT set_config('request.jwt.claims', '{"sub": "cccccccc-cccc-cccc-cccc-cccccccccccc"}', true);

-- Test: Cannot update audit logs (immutable)
UPDATE audit_log 
SET action = 'modified_action' 
WHERE id = (SELECT id FROM audit_log LIMIT 1);
-- Expected: Error - RLS policy denies update

-- Test: Cannot delete audit logs (immutable)
DELETE FROM audit_log WHERE business_id = current_user_business_id();
-- Expected: Error - RLS policy denies delete

-- Test: Staff cannot read other users' audit logs
SELECT * FROM audit_log 
WHERE business_id = current_user_business_id() 
  AND user_id != auth.uid();
-- Expected: Error - RLS policy denies select (or returns 0 rows)
```

### Test 9: Financial Data Restrictions Denied
```sql
-- Set auth context to Smith Plumbing staff
SELECT set_config('request.jwt.claims', '{"sub": "cccccccc-cccc-cccc-cccc-cccccccccccc"}', true);

-- Test: Staff cannot delete payments (no one can)
DELETE FROM payments WHERE business_id = current_user_business_id();
-- Expected: Error - RLS policy denies delete (payments are permanent)

-- Test: Staff cannot access payroll information
SELECT salary, hourly_rate FROM payroll 
WHERE business_id = current_user_business_id();
-- Expected: Error - RLS policy denies select
```

### Test 10: Business Isolation Violations Denied
```sql
-- Set auth context to Johnson Electric owner
SELECT set_config('request.jwt.claims', '{"sub": "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee"}', true);

-- Test: Cannot insert data with wrong business_id
INSERT INTO customers (id, business_id, name, email) 
VALUES ('badcust2-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Cross Tenant Customer', 'cross@email.com');
-- Expected: Error - business_id mismatch detected by trigger/RLS

-- Test: Cannot access Smith Plumbing's jobs
SELECT title, description FROM jobs 
WHERE business_id = '11111111-1111-1111-1111-111111111111';
-- Expected: Returns 0 rows (tenant isolation enforced)

-- Test: Cannot modify Smith Plumbing's reviews
UPDATE reviews 
SET rating = 1, content = 'Sabotage review' 
WHERE business_id = '11111111-1111-1111-1111-111111111111';
-- Expected: 0 rows affected (cannot access other business data)
```

---

## 🧪 Running the Tests

### Prerequisites
1. Database with RLS policies applied
2. Test data seeded as shown above
3. Auth system configured to set `auth.uid()` from JWT claims

### Test Execution
Run each test case and verify the expected results:

**For PASS tests**: Operations should complete successfully with expected data returned/modified.

**For DENY tests**: Operations should either:
- Return an error (policy violation)
- Return 0 rows (data filtered by RLS)
- Affect 0 rows (update/delete blocked by RLS)

### Automated Testing Script
```sql
-- Test runner function
CREATE OR REPLACE FUNCTION run_rls_tests()
RETURNS TABLE(test_name text, expected text, actual text, status text)
LANGUAGE plpgsql
AS $$
BEGIN
  -- This would contain automated versions of all test cases
  -- Returning structured results for validation
  RETURN;
END;
$$;
```

### Performance Verification
After tests pass, verify performance:
```sql
-- Check that queries use business_id indexes
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM customers WHERE business_id = current_user_business_id();

-- Verify RLS overhead is minimal
SELECT pg_stat_get_db_tuples_fetched(oid) FROM pg_database WHERE datname = current_database();
```

## 📊 Success Criteria

- **All 10 PASS tests succeed** without errors
- **All 10 DENY tests fail** as expected (blocked by RLS)
- **Cross-tenant data isolation** is complete (0 data leakage)
- **Role hierarchy** is properly enforced
- **Performance impact** is acceptable (< 10ms overhead per query)
- **Audit trail** captures all attempted policy violations

This test suite ensures the Thorbis RLS implementation provides bulletproof multi-tenancy with proper role-based access controls.
