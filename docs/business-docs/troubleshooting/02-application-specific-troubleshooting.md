# Application-Specific Troubleshooting

> **Last Updated**: 2025-01-31  
> **Version**: 1.0.0  
> **Status**: Production Ready

This guide provides detailed troubleshooting solutions for specific issues within each Thorbis Business OS application.

## Quick Navigation
- [Home Services (HS) Issues](#1-home-services-hs-issues)
- [AI Chat Interface Problems](#2-ai-chat-interface-problems)
- [Database RLS Policy Failures](#3-database-rls-policy-failures)
- [API Integration Difficulties](#4-api-integration-difficulties)
- [Shared Package Conflicts](#5-shared-package-version-conflicts)

---

## 1. Home Services (HS) Issues

### Work Order Management Problems

#### Symptoms
- Work orders not saving or loading
- Status updates not persisting
- Customer information missing from work orders
- Dispatch assignments not working

#### Diagnostic Steps
```bash
# Check HS app logs
cd apps/hs
pnpm dev 2>&1 | grep -i error

# Test work order API endpoints
curl -X GET http://localhost:3001/api/work-orders \
  -H "Authorization: Bearer $JWT_TOKEN"

# Check database connectivity
psql $DATABASE_URL -c "SELECT COUNT(*) FROM work_orders WHERE deleted_at IS NULL;"
```

#### Resolution Process

**Step 1: Verify Database Schema**
```sql
-- Check work_orders table structure
\d work_orders

-- Verify RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'work_orders';

-- Check for missing indexes
SELECT schemaname, tablename, indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'work_orders';
```

**Step 2: Test RLS Policies**
```typescript
// Test RLS access from app
// apps/hs/src/lib/database.ts
export async function testWorkOrderAccess(userId: string) {
  const { data, error } = await supabase
    .from('work_orders')
    .select('id, status, customer_id')
    .eq('assigned_to', userId)
    .limit(5)
  
  if (error) {
    console.error('RLS Policy Error:', error.message, error.details)
    return { success: false, error }
  }
  
  return { success: true, data }
}
```

**Step 3: Fix Common Issues**

**Missing Foreign Key Constraints**:
```sql
-- Add missing customer relationship
ALTER TABLE work_orders 
ADD CONSTRAINT fk_work_orders_customer 
FOREIGN KEY (customer_id) REFERENCES customers(id);

-- Add user assignment constraint
ALTER TABLE work_orders 
ADD CONSTRAINT fk_work_orders_user 
FOREIGN KEY (assigned_to) REFERENCES auth.users(id);
```

**Status Enumeration Errors**:
```typescript
// Create proper status type
// packages/schemas/src/hs/work-orders.ts
export const WorkOrderStatus = z.enum([
  'pending',
  'scheduled',
  'in_progress', 
  'completed',
  'cancelled'
])

export const WorkOrderSchema = z.object({
  id: z.string().uuid(),
  customer_id: z.string().uuid(),
  status: WorkOrderStatus,
  scheduled_date: z.date().optional(),
  assigned_to: z.string().uuid().optional(),
  // ... other fields
})
```

### Dispatch System Issues

#### Symptoms  
- Technicians not receiving assignments
- Real-time updates not working
- Location services failing
- Schedule conflicts not detected

#### Resolution Steps

**Step 1: Check Realtime Subscription**
```typescript
// apps/hs/src/hooks/use-dispatch-updates.ts
import { useEffect, useState } from 'react'
import { supabase } from '@thorbis/database'

export function useDispatchUpdates(userId: string) {
  const [assignments, setAssignments] = useState([])
  
  useEffect(() => {
    const channel = supabase
      .channel('dispatch_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'work_orders',
          filter: `assigned_to=eq.${userId}`
        },
        (payload) => {
          console.log('Dispatch update:', payload)
          // Handle real-time updates
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Dispatch channel connected')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Dispatch channel error')
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])
}
```

**Step 2: Location Services Debugging**
```typescript
// Check geolocation permissions and accuracy
export async function testLocationServices() {
  if (!navigator.geolocation) {
    throw new Error('Geolocation not supported')
  }
  
  const position = await new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes
    })
  })
  
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy: position.coords.accuracy
  }
}
```

**Step 3: Schedule Conflict Detection**
```sql
-- Create function to detect scheduling conflicts
CREATE OR REPLACE FUNCTION detect_schedule_conflicts(
  p_technician_id UUID,
  p_start_date TIMESTAMP,
  p_end_date TIMESTAMP,
  p_exclude_id UUID DEFAULT NULL
)
RETURNS TABLE(conflicting_work_order_id UUID, overlap_minutes INTEGER)
LANGUAGE SQL
AS $$
  SELECT 
    id as conflicting_work_order_id,
    EXTRACT(EPOCH FROM LEAST(scheduled_end, p_end_date) - 
            GREATEST(scheduled_start, p_start_date)) / 60 as overlap_minutes
  FROM work_orders 
  WHERE assigned_to = p_technician_id
    AND status IN ('scheduled', 'in_progress')
    AND (p_exclude_id IS NULL OR id != p_exclude_id)
    AND scheduled_start < p_end_date 
    AND scheduled_end > p_start_date
    AND deleted_at IS NULL;
$$;
```

---

## 2. AI Chat Interface Problems

### Message Streaming Issues

#### Symptoms
- Messages appear all at once instead of streaming
- Partial messages getting cut off
- Streaming indicator stuck
- Connection timeouts during long responses

#### Diagnostic Steps
```bash
# Check AI chat API endpoint
curl -N -H "Accept: text/event-stream" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -X POST http://localhost:3030/api/chat \
  -d '{"message": "Hello", "stream": true}'

# Monitor WebSocket connections in browser DevTools
# Network tab → WS filter → Check connection status
```

#### Resolution Process

**Step 1: Verify Streaming Implementation**
```typescript
// apps/ai/src/app/api/chat/route.ts
import { StreamingTextResponse } from 'ai'

export async function POST(request: Request) {
  const { message } = await request.json()
  
  try {
    const stream = await generateStreamingResponse(message)
    
    return new StreamingTextResponse(stream, {
      headers: {
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    })
  } catch (error) {
    console.error('Streaming error:', error)
    return Response.json(
      { error: 'Streaming failed' }, 
      { status: 500 }
    )
  }
}
```

**Step 2: Client-Side Streaming Handler**
```typescript
// apps/ai/src/hooks/use-chat-stream.ts
import { useCallback, useState } from 'react'

export function useChatStream() {
  const [isStreaming, setIsStreaming] = useState(false)
  
  const sendStreamingMessage = useCallback(async (
    message: string, 
    onChunk: (chunk: string) => void
  ) => {
    setIsStreaming(true)
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, stream: true })
      })
      
      if (!response.ok || !response.body) {
        throw new Error('Streaming response failed')
      }
      
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            if (data === '[DONE]') continue
            
            try {
              const parsed = JSON.parse(data)
              onChunk(parsed.content || '')
            } catch (e) {
              console.warn('Failed to parse stream chunk:', data)
            }
          }
        }
      }
    } finally {
      setIsStreaming(false)
    }
  }, [])
  
  return { sendStreamingMessage, isStreaming }
}
```

### File Upload Problems

#### Symptoms
- File uploads timing out
- Unsupported file types not properly rejected
- Large files causing memory issues
- Upload progress not updating

#### Resolution Steps

**Step 1: Configure Upload Limits**
```typescript
// apps/ai/next.config.ts
const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
  experimental: {
    serverComponentsExternalPackages: ['sharp'],
  }
}

export default config
```

**Step 2: Implement Proper File Validation**
```typescript
// apps/ai/src/lib/file-validation.ts
const ALLOWED_TYPES = {
  'text/plain': '.txt',
  'text/markdown': '.md', 
  'application/pdf': '.pdf',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp'
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export function validateFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_TYPES[file.type as keyof typeof ALLOWED_TYPES]) {
    return { 
      valid: false, 
      error: `File type ${file.type} not supported` 
    }
  }
  
  if (file.size > MAX_FILE_SIZE) {
    return { 
      valid: false, 
      error: `File size ${(file.size / 1024 / 1024).toFixed(1)}MB exceeds 10MB limit` 
    }
  }
  
  return { valid: true }
}
```

**Step 3: Progress Tracking**
```typescript
// apps/ai/src/components/file-upload-progress.tsx
export function useFileUploadProgress() {
  const [progress, setProgress] = useState<{ [fileId: string]: number }>({})
  
  const uploadWithProgress = useCallback(async (file: File, fileId: string) => {
    const formData = new FormData()
    formData.append('file', file)
    
    return new Promise<Response>((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100
          setProgress(prev => ({ ...prev, [fileId]: percentComplete }))
        }
      })
      
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          setProgress(prev => ({ ...prev, [fileId]: 100 }))
          resolve(new Response(xhr.response))
        } else {
          reject(new Error(`Upload failed: ${xhr.status}`))
        }
      })
      
      xhr.addEventListener('error', () => reject(new Error('Upload failed')))
      
      xhr.open('POST', '/api/upload')
      xhr.send(formData)
    })
  }, [])
  
  return { uploadWithProgress, progress }
}
```

---

## 3. Database RLS Policy Failures

### Common RLS Issues

#### Symptoms
- "Row Level Security policy violation" errors
- Users seeing data they shouldn't access
- API calls returning empty results
- Permission denied on database operations

#### Diagnostic Commands
```sql
-- Check current user and role
SELECT current_user, current_setting('role');

-- List all RLS policies for a table
SELECT * FROM pg_policies WHERE tablename = 'work_orders';

-- Test policy with specific user context
SET row_security = on;
SET ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "user-id-here", "role": "technician"}', true);
SELECT * FROM work_orders LIMIT 5;
```

#### Resolution Process

**Step 1: Verify Policy Structure**
```sql
-- Example: Proper work order RLS policy
CREATE POLICY "work_orders_select_policy" ON work_orders
  FOR SELECT 
  TO authenticated
  USING (
    -- Technicians can see their assigned work orders
    (auth.jwt() ->> 'role' = 'technician' AND assigned_to = auth.uid())
    OR
    -- Managers can see all work orders for their business
    (auth.jwt() ->> 'role' = 'manager' AND 
     business_id = (SELECT business_id FROM user_profiles WHERE id = auth.uid()))
    OR
    -- Admins can see everything
    (auth.jwt() ->> 'role' = 'admin')
  );
```

**Step 2: Debug Policy Logic**
```sql
-- Create debug function to test policies
CREATE OR REPLACE FUNCTION debug_rls_policy(
  table_name TEXT,
  user_id UUID,
  user_role TEXT
)
RETURNS TABLE(
  policy_name TEXT,
  policy_result BOOLEAN,
  debug_info JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- Set user context
  PERFORM set_config('request.jwt.claims', 
    json_build_object('sub', user_id, 'role', user_role)::text, 
    true);
  
  -- Test each policy condition
  RETURN QUERY
  WITH policy_tests AS (
    SELECT 
      'technician_access' as policy_name,
      (user_role = 'technician') as condition_result,
      json_build_object(
        'user_role', user_role,
        'required_role', 'technician'
      ) as debug_info
    UNION ALL
    SELECT 
      'manager_access' as policy_name,
      (user_role = 'manager') as condition_result,
      json_build_object(
        'user_role', user_role,
        'required_role', 'manager'
      ) as debug_info
  )
  SELECT * FROM policy_tests;
END;
$$;
```

**Step 3: Fix Common Policy Issues**

**Missing JWT Claims**:
```sql
-- Ensure JWT contains required claims
CREATE OR REPLACE FUNCTION auth.jwt()
RETURNS JSONB
LANGUAGE sql
AS $$
  SELECT 
    CASE 
      WHEN current_setting('request.jwt.claims', true) IS NULL 
      THEN '{}'::jsonb
      ELSE current_setting('request.jwt.claims', true)::jsonb
    END;
$$;
```

**Business Context Policies**:
```sql
-- Multi-tenant policy with business context
CREATE POLICY "business_isolation_policy" ON work_orders
  FOR ALL
  TO authenticated
  USING (
    business_id IN (
      SELECT business_id 
      FROM user_business_access 
      WHERE user_id = auth.uid() 
        AND access_level >= 'read'
        AND revoked_at IS NULL
    )
  )
  WITH CHECK (
    business_id IN (
      SELECT business_id 
      FROM user_business_access 
      WHERE user_id = auth.uid() 
        AND access_level >= 'write'
        AND revoked_at IS NULL
    )
  );
```

### RLS Performance Issues

#### Symptoms
- Slow query performance with RLS enabled
- Queries timing out
- High CPU usage on database

#### Optimization Strategies

**Step 1: Add Proper Indexes**
```sql
-- Index on frequently filtered columns in RLS policies
CREATE INDEX idx_work_orders_assigned_to_business 
ON work_orders(assigned_to, business_id) 
WHERE deleted_at IS NULL;

-- Partial index for active work orders
CREATE INDEX idx_work_orders_active_status 
ON work_orders(status, scheduled_date) 
WHERE deleted_at IS NULL AND status IN ('pending', 'scheduled', 'in_progress');

-- Index on user business access for multi-tenant queries
CREATE INDEX idx_user_business_access_lookup 
ON user_business_access(user_id, business_id, access_level) 
WHERE revoked_at IS NULL;
```

**Step 2: Optimize Policy Logic**
```sql
-- Use function-based policies for complex logic
CREATE OR REPLACE FUNCTION can_access_work_order(
  work_order_id UUID,
  user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM work_orders wo
    JOIN user_business_access uba ON wo.business_id = uba.business_id
    WHERE wo.id = work_order_id
      AND uba.user_id = user_id
      AND uba.access_level >= 'read'
      AND uba.revoked_at IS NULL
      AND wo.deleted_at IS NULL
  );
$$;

-- Use function in policy
CREATE POLICY "work_orders_optimized_access" ON work_orders
  FOR SELECT
  TO authenticated
  USING (can_access_work_order(id));
```

---

## 4. API Integration Difficulties

### External API Timeout Issues

#### Symptoms
- Requests to external services timing out
- Inconsistent API response times
- Rate limiting errors
- Authentication failures with third-party APIs

#### Resolution Process

**Step 1: Implement Retry Logic**
```typescript
// packages/api-utils/src/retry-client.ts
export class RetryClient {
  private maxRetries: number
  private baseDelay: number
  
  constructor(maxRetries = 3, baseDelay = 1000) {
    this.maxRetries = maxRetries
    this.baseDelay = baseDelay
  }
  
  async request<T>(
    url: string, 
    options: RequestInit = {},
    retryCondition?: (response: Response) => boolean
  ): Promise<T> {
    let lastError: Error
    
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          timeout: 10000, // 10 second timeout
        })
        
        if (!response.ok) {
          const shouldRetry = retryCondition ? 
            retryCondition(response) : 
            response.status >= 500 || response.status === 429
            
          if (shouldRetry && attempt < this.maxRetries) {
            await this.delay(this.baseDelay * Math.pow(2, attempt))
            continue
          }
          
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        return await response.json()
      } catch (error) {
        lastError = error as Error
        
        if (attempt < this.maxRetries) {
          console.warn(`Request attempt ${attempt + 1} failed:`, error.message)
          await this.delay(this.baseDelay * Math.pow(2, attempt))
        }
      }
    }
    
    throw lastError!
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
```

**Step 2: Rate Limiting Handler**
```typescript
// Rate limiting with token bucket
export class RateLimiter {
  private tokens: number
  private capacity: number
  private refillRate: number
  private lastRefill: number
  
  constructor(capacity: number, refillRate: number) {
    this.capacity = capacity
    this.tokens = capacity
    this.refillRate = refillRate
    this.lastRefill = Date.now()
  }
  
  async acquire(): Promise<void> {
    this.refillTokens()
    
    if (this.tokens < 1) {
      const waitTime = (1 / this.refillRate) * 1000
      await new Promise(resolve => setTimeout(resolve, waitTime))
      return this.acquire()
    }
    
    this.tokens--
  }
  
  private refillTokens(): void {
    const now = Date.now()
    const timePassed = now - this.lastRefill
    const tokensToAdd = (timePassed / 1000) * this.refillRate
    
    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd)
    this.lastRefill = now
  }
}
```

### Webhook Delivery Issues

#### Symptoms
- Webhooks not being received
- Duplicate webhook deliveries
- Webhook signature verification failures
- Processing timeouts

#### Resolution Steps

**Step 1: Webhook Signature Verification**
```typescript
// apps/api/src/lib/webhook-verification.ts
import { createHmac } from 'crypto'

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
  
  const providedSignature = signature.replace(/^sha256=/, '')
  
  return expectedSignature === providedSignature
}

export function createIdempotencyKey(payload: string): string {
  return createHmac('sha256', process.env.WEBHOOK_SECRET!)
    .update(payload)
    .digest('hex')
    .substring(0, 32)
}
```

**Step 2: Webhook Processing with Idempotency**
```typescript
// apps/api/src/app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const payload = await request.text()
  const signature = request.headers.get('stripe-signature')
  
  if (!verifyWebhookSignature(payload, signature!, process.env.STRIPE_WEBHOOK_SECRET!)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }
  
  const event = JSON.parse(payload)
  const idempotencyKey = createIdempotencyKey(payload)
  
  // Check if we've already processed this webhook
  const existingProcess = await getWebhookProcessing(idempotencyKey)
  if (existingProcess) {
    return NextResponse.json({ received: true, cached: true })
  }
  
  // Record that we're processing this webhook
  await recordWebhookProcessing(idempotencyKey, event)
  
  try {
    await processWebhookEvent(event)
    await markWebhookComplete(idempotencyKey)
    
    return NextResponse.json({ received: true })
  } catch (error) {
    await markWebhookFailed(idempotencyKey, error)
    throw error
  }
}
```

---

## 5. Shared Package Version Conflicts

### Package Resolution Issues

#### Symptoms
- "Multiple versions of React detected" warnings
- Styling inconsistencies between apps
- TypeScript errors about conflicting types
- Build failures due to version mismatches

#### Resolution Process

**Step 1: Audit Package Versions**
```bash
# Check for duplicate packages across workspace
pnpm list --depth=999 | grep -E "react|@types/react" | sort | uniq -c

# Generate dependency graph
pnpm why react react-dom @types/react

# Check for peer dependency conflicts
pnpm install --dry-run 2>&1 | grep -i "peer dep"
```

**Step 2: Enforce Version Consistency**
```json
// package.json (root)
{
  "pnpm": {
    "overrides": {
      "react": "19.1.0",
      "react-dom": "19.1.0",
      "@types/react": "^19.0.2",
      "@types/react-dom": "^19.0.2"
    }
  },
  "resolutions": {
    "react": "19.1.0",
    "react-dom": "19.1.0"
  }
}
```

**Step 3: Fix Workspace Dependencies**
```json
// Each app's package.json should use workspace protocol
{
  "dependencies": {
    "@thorbis/ui": "workspace:*",
    "@thorbis/design": "workspace:*",
    "@thorbis/schemas": "workspace:*",
    "react": "19.1.0",
    "react-dom": "19.1.0"
  }
}
```

### Design Token Conflicts

#### Symptoms
- Colors appearing differently between apps
- Inconsistent spacing and typography
- CSS custom properties not loading
- Tailwind classes not working

#### Resolution Steps

**Step 1: Verify Design Token Import**
```typescript
// apps/*/src/app/globals.css
@import '@thorbis/design/globals.css';

/* Ensure design tokens are loaded first */
@import 'tailwindcss/base';
@import 'tailwindcss/components'; 
@import 'tailwindcss/utilities';
```

**Step 2: Check Tailwind Configuration**
```javascript
// apps/*/tailwind.config.ts
import { createTailwindConfig } from '@thorbis/design/tailwind-config'

const config = createTailwindConfig({
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // App-specific overrides
  theme: {
    extend: {
      // Only add app-specific tokens here
    }
  }
})

export default config
```

**Step 3: Debug Token Resolution**
```typescript
// Create debug utility for design tokens
// packages/design/src/debug-tokens.ts
export function debugDesignTokens() {
  const styles = getComputedStyle(document.documentElement)
  
  const tokens = {
    colors: {
      primary: styles.getPropertyValue('--color-primary'),
      secondary: styles.getPropertyValue('--color-secondary'),
      background: styles.getPropertyValue('--color-background'),
    },
    spacing: {
      xs: styles.getPropertyValue('--space-xs'),
      sm: styles.getPropertyValue('--space-sm'),
      md: styles.getPropertyValue('--space-md'),
    }
  }
  
  console.table(tokens)
  return tokens
}

// Use in development
if (process.env.NODE_ENV === 'development') {
  window.debugTokens = debugDesignTokens
}
```

### Component Prop Type Conflicts

#### Symptoms
- TypeScript errors about incompatible component props
- Components not accepting expected props
- Build failures due to type conflicts

#### Resolution Steps

**Step 1: Standardize Component APIs**
```typescript
// packages/ui/src/types/component-props.ts
import { ComponentPropsWithoutRef, ElementRef } from 'react'

// Base prop types for all components
export interface BaseComponentProps {
  className?: string
  id?: string
  'data-testid'?: string
}

// Common variant patterns
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost'
export type ComponentSize = 'sm' | 'md' | 'lg'

// Generic component prop type
export type ComponentProps<T extends keyof JSX.IntrinsicElements> = 
  BaseComponentProps & ComponentPropsWithoutRef<T>
```

**Step 2: Use Consistent Forwarded Ref Pattern**
```typescript
// packages/ui/src/components/button.tsx
import { forwardRef } from 'react'
import type { ComponentProps, ButtonVariant, ComponentSize } from '../types'

interface ButtonProps extends ComponentProps<'button'> {
  variant?: ButtonVariant
  size?: ComponentSize
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading ? <LoadingSpinner /> : children}
      </button>
    )
  }
)

Button.displayName = 'Button'
```

---

## 6. Prevention Strategies

### Automated Testing for App-Specific Issues

#### Component Integration Tests
```typescript
// apps/hs/src/__tests__/work-order-flow.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WorkOrderForm } from '../components/work-order-form'
import { TestProviders } from '../test-utils'

describe('Work Order Flow', () => {
  test('creates work order with customer selection', async () => {
    const user = userEvent.setup()
    
    render(
      <TestProviders>
        <WorkOrderForm />
      </TestProviders>
    )
    
    // Test customer selection
    await user.click(screen.getByLabelText('Select Customer'))
    await user.type(screen.getByRole('combobox'), 'John Doe')
    await user.click(screen.getByText('John Doe'))
    
    // Test service selection
    await user.click(screen.getByLabelText('Service Type'))
    await user.click(screen.getByText('Plumbing'))
    
    // Submit form
    await user.click(screen.getByRole('button', { name: 'Create Work Order' }))
    
    // Verify success
    await waitFor(() => {
      expect(screen.getByText('Work order created successfully')).toBeInTheDocument()
    })
  })
})
```

#### Database Integration Tests
```typescript
// apps/hs/src/__tests__/database-integration.test.ts
import { createTestClient } from '../test-utils/supabase'
import { testWorkOrderAccess } from '../lib/database'

describe('Database RLS Policies', () => {
  const testClient = createTestClient()
  
  test('technician can only see assigned work orders', async () => {
    const technicianId = 'test-technician-id'
    
    // Mock technician JWT
    testClient.auth.setSession({
      access_token: createTestJWT({ 
        sub: technicianId, 
        role: 'technician' 
      })
    })
    
    const result = await testWorkOrderAccess(technicianId)
    
    expect(result.success).toBe(true)
    expect(result.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          assigned_to: technicianId
        })
      ])
    )
  })
})
```

### Monitoring App Health

#### Custom Health Checks
```typescript
// Create app-specific health check
// apps/hs/src/app/api/health/route.ts
export async function GET() {
  const checks = {
    database: await checkDatabaseConnection(),
    rls_policies: await testRLSPolicies(),
    external_apis: await checkExternalAPIs(),
    critical_features: await testCriticalFeatures()
  }
  
  const allHealthy = Object.values(checks).every(check => check.healthy)
  
  return Response.json({
    status: allHealthy ? 'healthy' : 'degraded',
    checks,
    timestamp: new Date().toISOString(),
    app: 'home-services'
  }, {
    status: allHealthy ? 200 : 503
  })
}
```

---

*Last Updated: 2025-01-31*  
*Version: 1.0.0*  
*Previous: [Common Development Issues](./01-common-development-issues.md)*  
*Next: [Environment and Deployment Issues](./03-environment-deployment-issues.md)*