# Thorbis Idempotency Strategy

A comprehensive idempotency implementation for safe request retries and duplicate operation prevention in the Thorbis Business OS.

## 🎯 Overview

Idempotency ensures that multiple identical requests have the same effect as making the request once. This is critical for:

- **Network retries**: Prevent duplicate bookings from connection issues
- **User double-clicks**: Avoid accidental duplicate estimates  
- **External integrations**: Safe retry mechanisms for AI agents and partners
- **System reliability**: Graceful handling of distributed system failures

## 🔑 Idempotency Key Format

### Standard Format
```
{tenant_id}:{route_pattern}:{content_hash}
```

### Components

#### Tenant ID
- **Purpose**: Ensures keys are scoped to individual businesses
- **Format**: UUID without hyphens (32 chars)
- **Example**: `11111111111111111111111111111111`

#### Route Pattern  
- **Purpose**: Identifies the specific operation type
- **Format**: HTTP method + simplified route path
- **Examples**:
  - `POST:bookings-hold`
  - `POST:estimates-draft` 
  - `POST:payments-link`
  - `PUT:customers-{id}`

#### Content Hash
- **Purpose**: Detects request body changes for conflict detection
- **Format**: SHA-256 hash of normalized JSON (first 16 chars)
- **Algorithm**: 
  1. Sort JSON keys recursively
  2. Remove whitespace and formatting
  3. Exclude timestamp/metadata fields
  4. Generate SHA-256, take first 16 characters

### Examples
```
# Booking hold request
11111111111111111111111111111111:POST:bookings-hold:a1b2c3d4e5f6g7h8

# Estimate draft  
22222222222222222222222222222222:POST:estimates-draft:x9y8z7w6v5u4t3s2

# Payment link
11111111111111111111111111111111:POST:payments-link:m1n2o3p4q5r6s7t8
```

## ⏱️ TTL Strategy

### TTL by Operation Type

| Operation Type | TTL | Reasoning |
|---------------|-----|-----------|
| **Booking Holds** | 30 minutes | Matches booking hold expiration |
| **Estimates** | 24 hours | Allows for business review cycle |
| **Payment Links** | 7 days | Payment processing window |
| **Customer Updates** | 1 hour | Quick conflict resolution |
| **Job Updates** | 4 hours | Work day completion cycle |

### TTL Implementation
```sql
-- Automatic cleanup via PostgreSQL
CREATE INDEX idx_idempotency_expires ON idempotency_keys (expires_at) 
WHERE expires_at IS NOT NULL;

-- Cleanup job (run every hour)
DELETE FROM idempotency_keys WHERE expires_at < NOW();
```

### Dynamic TTL Calculation
```typescript
function calculateTTL(route: string, body: any): number {
  const baseTTLs = {
    'POST:bookings-hold': 30 * 60,        // 30 minutes
    'POST:estimates-draft': 24 * 60 * 60,  // 24 hours  
    'POST:payments-link': 7 * 24 * 60 * 60, // 7 days
    'PUT:customers': 60 * 60,              // 1 hour
    'PUT:jobs': 4 * 60 * 60,               // 4 hours
  }
  
  return baseTTLs[route] || 60 * 60 // Default 1 hour
}
```

## ⚡ Conflict Detection & Resolution

### Conflict Scenarios

#### 1. Exact Duplicate (Same Key)
**Condition**: Identical tenant_id + route + content_hash
**Response**: `200 OK` with original response payload
**Headers**: `X-Idempotency-Replay: true`

#### 2. Same Key, Different Body (Conflict)
**Condition**: Same tenant_id + route, different content_hash  
**Response**: `409 CONFLICT` with detailed diff
**Headers**: `X-Idempotency-Conflict: body-mismatch`

#### 3. Expired Key, Same Request
**Condition**: Key exists but TTL expired
**Response**: Process as new request, generate new response
**Headers**: `X-Idempotency-Expired: true`

### Conflict Response Format
```json
{
  "error": {
    "code": "IDEMPOTENCY_CONFLICT",
    "message": "Request body differs from original request with same idempotency key",
    "details": {
      "original_key": "11111111111111111111111111111111:POST:bookings-hold:a1b2c3d4e5f6g7h8",
      "current_hash": "x9y8z7w6v5u4t3s2",
      "original_hash": "a1b2c3d4e5f6g7h8",
      "diff_summary": [
        "customer_info.phone: '+1-512-555-0100' → '+1-512-555-0200'",
        "requested_time: '2024-02-16T10:00:00Z' → '2024-02-16T11:00:00Z'"
      ],
      "original_timestamp": "2024-02-15T10:30:00Z",
      "retry_after": 1800
    }
  }
}
```

## 🗄️ Database Schema

### Idempotency Keys Table
```sql
CREATE TABLE idempotency_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Core idempotency data
  tenant_id uuid NOT NULL,
  idempotency_key text NOT NULL,
  route_pattern text NOT NULL,
  content_hash text NOT NULL,
  
  -- Request/response data
  request_method text NOT NULL,
  request_path text NOT NULL,
  request_body jsonb NOT NULL,
  request_headers jsonb,
  
  -- Response data
  response_status_code integer,
  response_body jsonb,
  response_headers jsonb,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  completed_at timestamptz,
  
  -- Unique constraint for idempotency
  CONSTRAINT uk_idempotency_keys UNIQUE (tenant_id, idempotency_key),
  
  -- Foreign key to businesses table
  CONSTRAINT fk_idempotency_tenant FOREIGN KEY (tenant_id) REFERENCES businesses(id)
);

-- Performance indexes
CREATE INDEX idx_idempotency_tenant ON idempotency_keys(tenant_id);
CREATE INDEX idx_idempotency_expires ON idempotency_keys(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_idempotency_route ON idempotency_keys(tenant_id, route_pattern);

-- Enable RLS for multi-tenancy
ALTER TABLE idempotency_keys ENABLE ROW LEVEL SECURITY;

-- RLS policy: Users can only access their tenant's keys
CREATE POLICY "idempotency_keys_tenant_isolation" ON idempotency_keys
  FOR ALL
  USING (tenant_id = current_user_business_id())
  WITH CHECK (tenant_id = current_user_business_id());
```

### Cleanup Function
```sql
CREATE OR REPLACE FUNCTION cleanup_expired_idempotency_keys()
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM idempotency_keys 
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Log cleanup activity
  INSERT INTO audit_log (
    business_id, action, table_name, after_data, created_at
  ) VALUES (
    NULL, -- System cleanup
    'cleanup_idempotency_keys',
    'idempotency_keys',
    json_build_object('deleted_count', deleted_count),
    now()
  );
  
  RETURN deleted_count;
END;
$$;
```

## 🔄 Request Processing Flow

### 1. Incoming Request Validation
```typescript
async function validateIdempotencyKey(
  tenantId: string,
  method: string,
  path: string, 
  body: any,
  headers: Record<string, string>
): Promise<IdempotencyResult> {
  
  // Extract or generate idempotency key
  const clientKey = headers['idempotency-key']
  const contentHash = generateContentHash(body)
  const routePattern = `${method}:${simplifyPath(path)}`
  const idempotencyKey = clientKey || generateIdempotencyKey(tenantId, routePattern, contentHash)
  
  // Check for existing key
  const existing = await findIdempotencyKey(tenantId, idempotencyKey)
  
  if (!existing) {
    return { action: 'process', key: idempotencyKey, ttl: calculateTTL(routePattern, body) }
  }
  
  if (existing.expires_at < new Date()) {
    return { action: 'process', key: idempotencyKey, ttl: calculateTTL(routePattern, body) }
  }
  
  if (existing.content_hash === contentHash) {
    return { 
      action: 'replay', 
      response: existing.response_body,
      status: existing.response_status_code,
      headers: { 'X-Idempotency-Replay': 'true' }
    }
  }
  
  return {
    action: 'conflict',
    error: generateConflictResponse(existing, contentHash, body)
  }
}
```

### 2. Content Hash Generation
```typescript
function generateContentHash(body: any): string {
  // Normalize request body for consistent hashing
  const normalized = normalizeRequestBody(body)
  
  // Generate SHA-256 hash
  const hash = crypto.createHash('sha256')
  hash.update(JSON.stringify(normalized))
  
  // Return first 16 characters
  return hash.digest('hex').substring(0, 16)
}

function normalizeRequestBody(body: any): any {
  if (Array.isArray(body)) {
    return body.map(normalizeRequestBody).sort()
  }
  
  if (typeof body === 'object' && body !== null) {
    const result: any = {}
    
    // Exclude timestamp and metadata fields
    const excludeFields = [
      'created_at', 'updated_at', 'timestamp', '_metadata',
      'request_id', 'trace_id', 'session_id'
    ]
    
    Object.keys(body)
      .filter(key => !excludeFields.includes(key))
      .sort()
      .forEach(key => {
        result[key] = normalizeRequestBody(body[key])
      })
    
    return result
  }
  
  return body
}
```

### 3. Response Storage
```typescript
async function storeIdempotencyResponse(
  tenantId: string,
  idempotencyKey: string,
  routePattern: string,
  request: {
    method: string
    path: string
    body: any
    headers: Record<string, string>
  },
  response: {
    statusCode: number
    body: any
    headers: Record<string, string>
  },
  ttlSeconds: number
): Promise<void> {
  
  const expiresAt = new Date(Date.now() + (ttlSeconds * 1000))
  
  await db.query(`
    INSERT INTO idempotency_keys (
      tenant_id, idempotency_key, route_pattern, content_hash,
      request_method, request_path, request_body, request_headers,
      response_status_code, response_body, response_headers,
      expires_at, completed_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
    )
    ON CONFLICT (tenant_id, idempotency_key) 
    DO UPDATE SET
      response_status_code = EXCLUDED.response_status_code,
      response_body = EXCLUDED.response_body,
      response_headers = EXCLUDED.response_headers,
      completed_at = EXCLUDED.completed_at
  `, [
    tenantId, idempotencyKey, routePattern, generateContentHash(request.body),
    request.method, request.path, request.body, request.headers,
    response.statusCode, response.body, response.headers,
    expiresAt, new Date()
  ])
}
```

## 🛡️ Security Considerations

### Tenant Isolation
- **RLS enforcement**: Idempotency keys automatically scoped by tenant_id
- **Cross-tenant protection**: Impossible to access other businesses' idempotency data
- **Key namespace**: Tenant ID embedded in key format prevents collisions

### Key Strength
- **Cryptographic hashing**: SHA-256 for content hash generation
- **Collision resistance**: 16-character hash provides adequate uniqueness  
- **Predictable generation**: Same input always produces same key

### Data Protection
- **Request body storage**: Full request stored for conflict detection
- **Response caching**: Complete response stored for replay
- **TTL enforcement**: Automatic cleanup prevents indefinite storage
- **Audit trail**: All idempotency operations logged

## 📊 Monitoring & Observability

### Key Metrics
```typescript
interface IdempotencyMetrics {
  total_requests: number
  replayed_requests: number
  conflict_requests: number
  expired_keys: number
  cleanup_operations: number
  
  // Performance metrics
  avg_lookup_time: number
  avg_storage_time: number
  cache_hit_rate: number
  
  // Error rates
  key_generation_errors: number
  storage_failures: number
  cleanup_failures: number
}
```

### Monitoring Queries
```sql
-- Idempotency usage by tenant
SELECT 
  tenant_id,
  route_pattern,
  COUNT(*) as total_keys,
  COUNT(CASE WHEN completed_at IS NOT NULL THEN 1 END) as completed,
  AVG(EXTRACT(EPOCH FROM (completed_at - created_at))) as avg_processing_time
FROM idempotency_keys 
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY tenant_id, route_pattern
ORDER BY total_keys DESC;

-- Conflict detection
SELECT 
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) as conflicts
FROM audit_log 
WHERE action = 'idempotency_conflict'
  AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY hour
ORDER BY hour;

-- TTL effectiveness
SELECT 
  route_pattern,
  COUNT(*) as total_keys,
  COUNT(CASE WHEN expires_at < NOW() THEN 1 END) as expired,
  AVG(EXTRACT(EPOCH FROM (expires_at - created_at))) as avg_ttl_seconds
FROM idempotency_keys
GROUP BY route_pattern;
```

## 🚀 Implementation Phases

### Phase 1: Core Infrastructure
- [ ] Create idempotency_keys table
- [ ] Implement basic key generation
- [ ] Add RLS policies
- [ ] Create cleanup procedures

### Phase 2: Request Processing
- [ ] Implement request validation middleware
- [ ] Add content hash generation
- [ ] Build conflict detection logic
- [ ] Create response storage system

### Phase 3: SDK Integration  
- [ ] Add withIdempotencyKey() helper
- [ ] Implement automatic key generation
- [ ] Add conflict handling
- [ ] Create retry mechanisms

### Phase 4: Advanced Features
- [ ] Monitoring and metrics
- [ ] Performance optimization
- [ ] Advanced TTL strategies
- [ ] Cross-service coordination

## 🧪 Testing Strategy

### Unit Tests
- Key generation consistency
- Content hash stability  
- TTL calculation accuracy
- Conflict detection logic

### Integration Tests
- End-to-end request processing
- Database storage and retrieval
- RLS policy enforcement
- Cleanup functionality

### Load Tests
- High-volume duplicate requests
- Concurrent key operations
- TTL expiration under load
- Storage performance limits

### Security Tests
- Cross-tenant key isolation
- Key collision resistance
- SQL injection prevention
- Data privacy validation

This idempotency strategy ensures reliable, secure, and performant duplicate request handling across the entire Thorbis Business OS platform.
