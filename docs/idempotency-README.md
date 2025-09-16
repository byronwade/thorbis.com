# Thorbis Idempotency Implementation

Complete idempotency strategy implementation for the Thorbis Business OS, ensuring safe request retries and preventing duplicate operations across the multi-tenant platform.

## 📁 Files

- **`idempotency-design.md`** - Comprehensive design document with key format, TTL strategy, and conflict semantics
- **`idempotency-table.sql`** - Database schema and helper functions for idempotency keys storage
- **`sdk-idempotency-examples.ts`** - Enhanced SDK examples with full idempotency support

## 🎯 Quick Start

### 1. Database Setup
```sql
-- Run the idempotency table creation
\i idempotency-table.sql

-- Verify table was created
SELECT * FROM get_idempotency_stats();
```

### 2. SDK Usage
```typescript
import { 
  createBookingHoldWithIdempotency,
  createEstimateDraftWithIdempotency 
} from './sdk-idempotency-examples'

// Create booking with automatic idempotency
const booking = await createBookingHoldWithIdempotency(
  'business-tenant-id',
  bookingRequest,
  {
    onReplay: (data) => console.log('Request was safely replayed'),
    onConflict: (details) => console.log('Conflict detected:', details)
  }
)
```

## 🔑 Key Format

Thorbis uses a structured idempotency key format:
```
{tenant_id}:{route_pattern}:{content_hash}
```

### Example Keys
```
# Booking hold
11111111111111111111111111111111:POST:bookings-hold:a1b2c3d4e5f6g7h8

# Estimate draft  
11111111111111111111111111111111:POST:estimates-draft:x9y8z7w6v5u4t3s2
```

## ⏱️ TTL Strategy

| Operation | TTL | Purpose |
|-----------|-----|---------|
| Booking Holds | 30 minutes | Matches booking expiration |
| Estimates | 24 hours | Business review cycle |
| Payment Links | 7 days | Payment processing window |
| Customer Updates | 1 hour | Quick conflict resolution |

## 🔄 Response Behaviors

### ✅ Exact Duplicate (200 OK)
Same key, same content → Returns original response
```json
{
  "data": { "hold_id": "...", "confirm_url": "..." },
  "headers": { "X-Idempotency-Replay": "true" }
}
```

### ⚠️ Conflict (409 CONFLICT)
Same key, different content → Returns detailed diff
```json
{
  "error": {
    "code": "IDEMPOTENCY_CONFLICT",
    "message": "Request body differs from original",
    "details": {
      "diff_summary": [
        "customer_info.phone: '+1-512-555-0100' → '+1-512-555-0200'",
        "requested_time: '2024-02-16T10:00:00Z' → '2024-02-16T11:00:00Z'"
      ],
      "retry_after": 1800
    }
  }
}
```

## 🧪 Testing Examples

### Double POST Test (Should Return 200)
```typescript
const bookingData = {
  business_slug: 'test-business',
  service_code: 'plumbing',
  customer_info: { name: 'John Doe', phone: '+1-555-0100' },
  // ... other fields
}

// First request
const result1 = await createBookingHoldWithIdempotency('tenant-id', bookingData)
console.log('First request:', result1.success) // true

// Exact duplicate - should replay
const result2 = await createBookingHoldWithIdempotency('tenant-id', bookingData) 
console.log('Second request replayed:', result2.replayed) // true
console.log('Same response:', result2.data.hold_id === result1.data.hold_id) // true
```

### Conflict Detection Test (Should Return 409)
```typescript
const originalData = {
  business_slug: 'test-business',
  customer_info: { name: 'John Doe', phone: '+1-555-0100' }
}

const modifiedData = {
  business_slug: 'test-business', 
  customer_info: { name: 'John Doe', phone: '+1-555-0200' } // Different phone
}

// First request
const result1 = await createBookingHoldWithIdempotency('tenant-id', originalData)

// Modified request with same key - should conflict
const result2 = await createBookingHoldWithIdempotency('tenant-id', modifiedData)
console.log('Conflict detected:', result2.error === 'IDEMPOTENCY_CONFLICT') // true
console.log('Diff summary:', result2.conflictDetails?.diff_summary)
```

## 🛡️ Security Features

### Tenant Isolation
- All idempotency keys scoped by `tenant_id`
- RLS policies prevent cross-tenant access
- Automatic business context validation

### Content Integrity
- SHA-256 hashing for collision resistance
- Normalized request body for consistent hashing
- Excludes metadata fields that shouldn't affect idempotency

### TTL Enforcement
- Automatic cleanup of expired keys
- Configurable TTL per operation type
- Prevents indefinite storage

## 📊 Monitoring

### Key Metrics
```sql
-- Idempotency usage statistics
SELECT * FROM get_idempotency_stats('tenant-id');

-- Recent conflicts
SELECT * FROM audit_log 
WHERE action = 'idempotency_conflict' 
  AND created_at > NOW() - INTERVAL '24 hours';

-- Cleanup effectiveness  
SELECT * FROM cleanup_expired_idempotency_keys();
```

### Performance Monitoring
```sql
-- Average processing times by route
SELECT 
  route_pattern,
  COUNT(*) as requests,
  AVG(processing_time_ms) as avg_time,
  MAX(processing_time_ms) as max_time
FROM idempotency_keys 
WHERE created_at > NOW() - INTERVAL '1 day'
GROUP BY route_pattern;
```

## 🚀 Advanced Usage

### Custom Conflict Resolution
```typescript
const result = await createEstimateDraftWithIdempotency(
  tenantId,
  estimateData,
  {
    conflictResolution: 'retry_with_new_key', // Auto-retry with new key
    maxRetries: 3
  }
)
```

### Manual Key Management
```typescript
const customKey = generateIdempotencyKey(
  tenantId,
  'POST:bookings-hold', 
  requestData,
  'my-custom-key-suffix'
)

const result = await createBookingHoldWithIdempotency(
  tenantId,
  requestData,
  { providedIdempotencyKey: customKey }
)
```

### Batch Operations with Idempotency
```typescript
const promises = bookingRequests.map(async (request, index) => {
  const customKey = `batch-booking-${Date.now()}-${index}`
  return createBookingHoldWithIdempotency(
    tenantId,
    request,
    { providedIdempotencyKey: customKey }
  )
})

const results = await Promise.allSettled(promises)
```

## 🔧 Configuration

### Environment Variables
```bash
# Required
THORBIS_API_KEY=your-api-key
THORBIS_API_URL=https://api.thorbis.com/v1

# Optional
IDEMPOTENCY_DEFAULT_TTL=3600
IDEMPOTENCY_CLEANUP_INTERVAL=3600
IDEMPOTENCY_MAX_RETRIES=3
```

### Database Configuration
```sql
-- Adjust cleanup frequency (default: hourly)
SELECT cron.schedule('idempotency-cleanup', '0 * * * *', 
  'SELECT cleanup_expired_idempotency_keys();'
);

-- Monitor table size
SELECT 
  schemaname,
  tablename,
  n_tup_ins as inserts,
  n_tup_del as deletes,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_stat_user_tables 
WHERE tablename = 'idempotency_keys';
```

## ❗ Important Notes

### Do Not Use Idempotency Keys For
- Read operations (GET requests)
- Operations that should be repeated (like health checks)
- Time-sensitive operations where staleness matters

### Always Use Idempotency Keys For  
- Financial operations (payments, invoices)
- Customer-facing actions (bookings, estimates)
- State-changing operations
- External API calls

### Best Practices
1. **Generate keys client-side** when possible for consistency
2. **Include relevant context** in key generation (tenant, operation type)
3. **Handle conflicts gracefully** with clear user messaging
4. **Monitor key usage** for patterns and abuse
5. **Set appropriate TTLs** based on business logic

## 🐛 Troubleshooting

### Common Issues

**Problem**: Keys not working across requests
```typescript
// ❌ Wrong - generates different key each time
const key = generateIdempotencyKey(tenantId, route, { timestamp: Date.now() })

// ✅ Correct - consistent key for same request
const key = generateIdempotencyKey(tenantId, route, stableRequestData)
```

**Problem**: Conflicts on identical requests  
```sql
-- Check for timing issues in key generation
SELECT idempotency_key, content_hash, created_at 
FROM idempotency_keys 
WHERE tenant_id = 'tenant-id'
ORDER BY created_at DESC LIMIT 10;
```

**Problem**: Performance issues
```sql
-- Verify indexes are being used
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM check_idempotency_key('tenant-id', 'key', 'hash');
```

## 📞 Support

- 📚 **Full documentation**: `idempotency-design.md`
- 🗃️ **Database schema**: `idempotency-table.sql`  
- 💻 **SDK examples**: `sdk-idempotency-examples.ts`
- 🧪 **Test cases**: See examples in each file

This idempotency implementation provides enterprise-grade duplicate request handling for the Thorbis Business OS platform.
