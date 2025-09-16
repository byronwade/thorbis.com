# Security Implementation Guide

> **Complete security implementation guide for the Thorbis Business OS**
>
> **Security-first architecture with multi-tenant isolation, RLS enforcement, and zero-trust principles**

## 🔒 Security Architecture Overview

The Thorbis Business OS implements a comprehensive security model:

- **Multi-tenant architecture** with complete data isolation
- **Row Level Security (RLS)** on all database tables
- **Zero-trust security model** with verification at every layer
- **AI safety frameworks** with confirmation workflows
- **Blockchain verification** for critical operations
- **GDPR/CCPA compliance** built into data handling

## 🛡️ Multi-Tenant Security Setup

### Database Schema Design

Every table must include tenant isolation:

```sql
-- Standard tenant isolation pattern
CREATE TABLE customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  address jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  -- Ensure unique emails per tenant
  UNIQUE(tenant_id, email)
);

-- Always create tenant index for performance
CREATE INDEX idx_customers_tenant_id ON customers(tenant_id);

-- Enable RLS on every table
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
```

### RLS Policies Implementation

**Standard RLS Policy Pattern**:

```sql
-- View policy - users can only see their tenant's data
CREATE POLICY "tenant_isolation_select" ON customers
  FOR SELECT
  USING (tenant_id = auth.jwt() ->> 'tenant_id'::text);

-- Insert policy - users can only insert for their tenant
CREATE POLICY "tenant_isolation_insert" ON customers
  FOR INSERT
  WITH CHECK (
    tenant_id = auth.jwt() ->> 'tenant_id'::text AND
    auth.jwt() ->> 'role' IN ('admin', 'manager', 'staff')
  );

-- Update policy - users can only update their tenant's data
CREATE POLICY "tenant_isolation_update" ON customers
  FOR UPDATE
  USING (
    tenant_id = auth.jwt() ->> 'tenant_id'::text AND
    auth.jwt() ->> 'role' IN ('admin', 'manager', 'staff')
  )
  WITH CHECK (
    tenant_id = auth.jwt() ->> 'tenant_id'::text
  );

-- Delete policy - only admins can delete
CREATE POLICY "tenant_isolation_delete" ON customers
  FOR DELETE
  USING (
    tenant_id = auth.jwt() ->> 'tenant_id'::text AND
    auth.jwt() ->> 'role' = 'admin'
  );
```

### Role-Based Access Control (RBAC)

**User Role Hierarchy**:

```sql
-- Create roles enum
CREATE TYPE user_role AS ENUM (
  'super_admin',    -- Platform administrator
  'admin',          -- Tenant administrator
  'manager',        -- Department manager
  'staff',          -- Regular employee
  'readonly',       -- View-only access
  'customer'        -- Customer portal access
);

-- Users table with role-based access
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  email text NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'staff',
  permissions jsonb NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS policies for users table
CREATE POLICY "users_tenant_isolation" ON users
  FOR SELECT
  USING (
    tenant_id = auth.jwt() ->> 'tenant_id'::text OR
    auth.jwt() ->> 'role' = 'super_admin'
  );
```

### Permission System Implementation

**Granular Permissions**:

```tsx
// types/permissions.ts
export interface Permission {
  resource: string    // e.g., 'customers', 'work_orders'
  action: string     // e.g., 'read', 'write', 'delete'
  conditions?: {     // Optional conditions
    own_only?: boolean
    department?: string[]
  }
}

export interface UserPermissions {
  role: 'admin' | 'manager' | 'staff' | 'readonly' | 'customer'
  permissions: Permission[]
  restrictions?: {
    ip_whitelist?: string[]
    time_restrictions?: {
      start: string
      end: string
      days: number[]
    }
  }
}

// lib/permissions.ts
export class PermissionManager {
  private permissions: UserPermissions

  constructor(permissions: UserPermissions) {
    this.permissions = permissions
  }

  can(resource: string, action: string, context?: any): boolean {
    // Check role-based permissions
    if (this.permissions.role === 'admin') {
      return true // Admins can do everything in their tenant
    }

    // Check specific permissions
    const permission = this.permissions.permissions.find(
      p => p.resource === resource && p.action === action
    )

    if (!permission) {
      return false
    }

    // Apply conditions
    if (permission.conditions?.own_only && context?.user_id !== context?.resource_owner_id) {
      return false
    }

    if (permission.conditions?.department) {
      return permission.conditions.department.includes(context?.department)
    }

    return true
  }

  hasAnyPermission(resource: string, actions: string[]): boolean {
    return actions.some(action => this.can(resource, action))
  }

  getPermittedActions(resource: string): string[] {
    return this.permissions.permissions
      .filter(p => p.resource === resource)
      .map(p => p.action)
  }
}
```

## 🔐 Authentication Integration

### Supabase Auth Configuration

**supabase/config.toml**:

```toml
[auth]
enabled = true
site_url = "http://localhost:3000"
additional_redirect_urls = ["https://app.thorbis.com"]

# JWT settings
jwt_expiry = 3600
jwt_secret = "your-jwt-secret"

# Password requirements
password_min_length = 12
password_require_uppercase = true
password_require_lowercase = true
password_require_numbers = true
password_require_symbols = true

# Email settings
enable_signup = false  # Only admins can create accounts
enable_confirmations = true
enable_email_confirmations = true

# Security settings
security_captcha_enabled = true
security_captcha_provider = "hcaptcha"

[auth.email]
enable_signup = false
double_confirm_changes = true
secure_email_change_enabled = true

[auth.external.google]
enabled = true
client_id = "your-google-client-id"
secret = "your-google-client-secret"
```

### Authentication Client Implementation

**lib/auth.ts**:

```tsx
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { PermissionManager } from './permissions'
import type { Database } from '@/types/database'

interface AuthUser {
  id: string
  email: string
  tenant_id: string
  role: string
  permissions: UserPermissions
}

export class AuthService {
  private supabase = createClientComponentClient<Database>()
  private permissionManager?: PermissionManager

  async signIn(email: string, password: string): Promise<AuthUser> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // Log security events
      await this.logSecurityEvent('failed_login', { email, error: error.message })
      throw error
    }

    // Verify user is active
    const user = await this.getUserWithPermissions(data.user.id)
    if (!user.is_active) {
      await this.supabase.auth.signOut()
      await this.logSecurityEvent('inactive_user_login', { email })
      throw new Error('Account is inactive')
    }

    // Initialize permission manager
    this.permissionManager = new PermissionManager(user.permissions)

    return user
  }

  async signOut(): Promise<void> {
    await this.logSecurityEvent('user_logout', {})
    await this.supabase.auth.signOut()
    this.permissionManager = undefined
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    const { data: { session } } = await this.supabase.auth.getSession()
    
    if (!session) return null

    return await this.getUserWithPermissions(session.user.id)
  }

  private async getUserWithPermissions(userId: string): Promise<AuthUser> {
    const { data: user, error } = await this.supabase
      .from('users')
      .select(`
        id,
        email,
        tenant_id,
        role,
        permissions,
        is_active,
        tenant:tenants(id, name, settings)
      `)
      .eq('id', userId)
      .single()

    if (error || !user) {
      throw new Error('User not found')
    }

    return {
      id: user.id,
      email: user.email,
      tenant_id: user.tenant_id,
      role: user.role,
      permissions: user.permissions as UserPermissions,
    }
  }

  can(resource: string, action: string, context?: any): boolean {
    return this.permissionManager?.can(resource, action, context) ?? false
  }

  private async logSecurityEvent(event: string, metadata: any): Promise<void> {
    await this.supabase.from('security_logs').insert({
      event,
      metadata,
      ip_address: await this.getClientIP(),
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    })
  }

  private async getClientIP(): Promise<string> {
    try {
      const response = await fetch('/api/ip')
      const { ip } = await response.json()
      return ip
    } catch {
      return 'unknown'
    }
  }
}

export const authService = new AuthService()
```

### Session Management

**middleware.ts**:

```tsx
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protected routes
  const protectedPaths = ['/dashboard', '/admin', '/api/protected']
  const isProtectedPath = protectedPaths.some(path => 
    req.nextUrl.pathname.startsWith(path)
  )

  if (isProtectedPath) {
    if (!session) {
      // Redirect to login
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/auth/login'
      redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Validate session and user status
    const { data: user } = await supabase
      .from('users')
      .select('is_active, role, tenant_id')
      .eq('id', session.user.id)
      .single()

    if (!user?.is_active) {
      await supabase.auth.signOut()
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/auth/login'
      redirectUrl.searchParams.set('error', 'account_inactive')
      return NextResponse.redirect(redirectUrl)
    }

    // Add user info to headers for API routes
    res.headers.set('x-user-id', session.user.id)
    res.headers.set('x-tenant-id', user.tenant_id)
    res.headers.set('x-user-role', user.role)
  }

  // CSRF protection for state-changing requests
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const origin = req.headers.get('origin')
    const host = req.headers.get('host')
    
    if (!origin || !host || !origin.endsWith(host)) {
      return new NextResponse('CSRF validation failed', { status: 403 })
    }
  }

  // Security headers
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)')

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
```

## 🔒 API Security

### Secure API Route Pattern

**app/api/customers/route.ts**:

```tsx
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { rateLimit } from '@/lib/rate-limit'
import { auditLog } from '@/lib/audit-log'
import { validatePermissions } from '@/lib/permissions'

// Input validation schema
const createCustomerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zip: z.string(),
  }).optional(),
})

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const { success, limit, remaining, reset } = await rateLimit(
      request.ip ?? 'unknown',
      { limit: 100, window: 60000 } // 100 requests per minute
    )

    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          }
        }
      )
    }

    // Authentication
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Permission validation
    const hasPermission = await validatePermissions(
      session.user.id,
      'customers',
      'read'
    )

    if (!hasPermission) {
      await auditLog({
        user_id: session.user.id,
        action: 'unauthorized_access_attempt',
        resource: 'customers',
        details: { route: '/api/customers', method: 'GET' }
      })
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Query parameters validation
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '25')))
    const search = searchParams.get('search')

    // Data retrieval with RLS automatically applied
    let query = supabase
      .from('customers')
      .select('id, name, email, phone, created_at, updated_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    const { data: customers, count, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }

    // Audit successful access
    await auditLog({
      user_id: session.user.id,
      action: 'customers_list',
      resource: 'customers',
      details: { count: customers?.length ?? 0, page, limit }
    })

    return NextResponse.json({
      data: customers,
      pagination: {
        page,
        limit,
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / limit),
      }
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting for write operations (more restrictive)
    const { success } = await rateLimit(
      request.ip ?? 'unknown',
      { limit: 20, window: 60000 } // 20 requests per minute
    )

    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    // Authentication and permission checks
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hasPermission = await validatePermissions(
      session.user.id,
      'customers',
      'write'
    )

    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Input validation
    const body = await request.json()
    const validatedData = createCustomerSchema.parse(body)

    // Additional business logic validation
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('email', validatedData.email)
      .single()

    if (existingCustomer) {
      return NextResponse.json(
        { error: 'Customer with this email already exists' },
        { status: 409 }
      )
    }

    // Create customer (RLS automatically adds tenant_id)
    const { data: customer, error } = await supabase
      .from('customers')
      .insert(validatedData)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create customer' },
        { status: 500 }
      )
    }

    // Audit log
    await auditLog({
      user_id: session.user.id,
      action: 'customer_created',
      resource: 'customers',
      resource_id: customer.id,
      details: { name: customer.name, email: customer.email }
    })

    return NextResponse.json(customer, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Input Validation and Sanitization

**lib/validation.ts**:

```tsx
import { z } from 'zod'
import DOMPurify from 'isomorphic-dompurify'

// Common validation schemas
export const commonSchemas = {
  id: z.string().uuid(),
  email: z.string().email().toLowerCase(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
  name: z.string().min(2).max(100).trim(),
  description: z.string().max(1000).trim(),
  url: z.string().url().optional(),
  date: z.string().datetime(),
}

// Sanitization functions
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [],
  })
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .substring(0, 1000) // Limit length
}

// SQL injection prevention (handled by Supabase, but additional validation)
export function validateSqlInput(input: string): boolean {
  const sqlInjectionPattern = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i
  return !sqlInjectionPattern.test(input)
}

// XSS prevention
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, char => map[char])
}

// Path traversal prevention
export function validateFilePath(path: string): boolean {
  const normalizedPath = path.replace(/\\/g, '/')
  return !normalizedPath.includes('../') && !normalizedPath.includes('..')
}
```

### Rate Limiting Implementation

**lib/rate-limit.ts**:

```tsx
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

interface RateLimitOptions {
  limit: number // Number of requests
  window: number // Time window in milliseconds
}

interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

export async function rateLimit(
  identifier: string,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const key = `rate_limit:${identifier}`
  const now = Date.now()
  const window = options.window
  const limit = options.limit

  // Use Redis pipeline for atomic operations
  const pipeline = redis.pipeline()
  
  // Remove expired entries
  pipeline.zremrangebyscore(key, 0, now - window)
  
  // Count current requests in window
  pipeline.zcard(key)
  
  // Add current request
  pipeline.zadd(key, { score: now, member: `${now}-${Math.random()}` })
  
  // Set expiration
  pipeline.expire(key, Math.ceil(window / 1000))

  const results = await pipeline.exec()
  const requestCount = results[1] as number

  const success = requestCount < limit
  const remaining = Math.max(0, limit - requestCount - 1)
  const reset = now + window

  return {
    success,
    limit,
    remaining,
    reset,
  }
}

// Usage in API routes
export function withRateLimit(options: RateLimitOptions) {
  return function (handler: Function) {
    return async function (req: NextRequest, ...args: any[]) {
      const ip = req.ip ?? req.headers.get('x-forwarded-for') ?? 'unknown'
      const result = await rateLimit(ip, options)

      if (!result.success) {
        return NextResponse.json(
          { error: 'Rate limit exceeded' },
          {
            status: 429,
            headers: {
              'X-RateLimit-Limit': result.limit.toString(),
              'X-RateLimit-Remaining': result.remaining.toString(),
              'X-RateLimit-Reset': result.reset.toString(),
            }
          }
        )
      }

      return handler(req, ...args)
    }
  }
}
```

## 🔍 Security Monitoring and Logging

### Audit Logging System

**lib/audit-log.ts**:

```tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

interface AuditLogEntry {
  user_id?: string
  tenant_id?: string
  action: string
  resource: string
  resource_id?: string
  ip_address?: string
  user_agent?: string
  details?: Record<string, any>
  timestamp?: string
}

export async function auditLog(entry: AuditLogEntry): Promise<void> {
  try {
    const supabase = createServerComponentClient({ cookies })
    
    // Get current session if not provided
    if (!entry.user_id) {
      const { data: { session } } = await supabase.auth.getSession()
      entry.user_id = session?.user?.id
    }

    // Get tenant_id from user if not provided
    if (!entry.tenant_id && entry.user_id) {
      const { data: user } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', entry.user_id)
        .single()
      
      entry.tenant_id = user?.tenant_id
    }

    await supabase.from('audit_logs').insert({
      ...entry,
      timestamp: entry.timestamp || new Date().toISOString(),
    })
  } catch (error) {
    console.error('Failed to write audit log:', error)
    // Don't throw - audit logging should never break application flow
  }
}

// Security event logging
export async function logSecurityEvent(
  event: 'failed_login' | 'account_lockout' | 'permission_denied' | 'suspicious_activity',
  details: Record<string, any>
): Promise<void> {
  await auditLog({
    action: `security_${event}`,
    resource: 'security',
    details: {
      ...details,
      severity: getSeverity(event),
      timestamp: new Date().toISOString(),
    },
  })

  // Send alert for critical events
  if (['account_lockout', 'suspicious_activity'].includes(event)) {
    await sendSecurityAlert(event, details)
  }
}

function getSeverity(event: string): 'low' | 'medium' | 'high' | 'critical' {
  switch (event) {
    case 'failed_login':
      return 'low'
    case 'permission_denied':
      return 'medium'
    case 'account_lockout':
      return 'high'
    case 'suspicious_activity':
      return 'critical'
    default:
      return 'medium'
  }
}

async function sendSecurityAlert(event: string, details: any): Promise<void> {
  // Implementation for sending security alerts
  // Could be email, Slack, PagerDuty, etc.
  console.warn(`Security Alert: ${event}`, details)
}
```

### Security Monitoring Dashboard

**Database tables for security monitoring**:

```sql
-- Security logs table
CREATE TABLE security_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id),
  user_id uuid REFERENCES users(id),
  event text NOT NULL,
  ip_address inet,
  user_agent text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Failed login attempts
CREATE TABLE failed_login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  ip_address inet NOT NULL,
  user_agent text,
  attempt_count integer NOT NULL DEFAULT 1,
  first_attempt timestamptz NOT NULL DEFAULT now(),
  last_attempt timestamptz NOT NULL DEFAULT now()
);

-- Account lockouts
CREATE TABLE account_lockouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  reason text NOT NULL,
  locked_at timestamptz NOT NULL DEFAULT now(),
  locked_until timestamptz,
  locked_by uuid REFERENCES users(id)
);

-- Create indexes for performance
CREATE INDEX idx_security_logs_tenant_id ON security_logs(tenant_id);
CREATE INDEX idx_security_logs_event ON security_logs(event);
CREATE INDEX idx_security_logs_created_at ON security_logs(created_at);
CREATE INDEX idx_failed_login_attempts_email ON failed_login_attempts(email);
CREATE INDEX idx_failed_login_attempts_ip ON failed_login_attempts(ip_address);
```

## 🔐 Data Protection and Privacy

### Data Encryption

**lib/encryption.ts**:

```tsx
import crypto from 'crypto'

const algorithm = 'aes-256-gcm'
const secretKey = process.env.ENCRYPTION_SECRET_KEY! // 32 bytes key

export function encrypt(text: string): { encrypted: string; iv: string; tag: string } {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipher(algorithm, secretKey, iv)
  
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  const tag = cipher.getAuthTag()
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    tag: tag.toString('hex')
  }
}

export function decrypt(encrypted: string, iv: string, tag: string): string {
  const decipher = crypto.createDecipher(algorithm, secretKey, Buffer.from(iv, 'hex'))
  decipher.setAuthTag(Buffer.from(tag, 'hex'))
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}

// Hash sensitive data (one-way)
export function hashSensitiveData(data: string): string {
  return crypto.createHash('sha256').update(data + process.env.HASH_SALT!).digest('hex')
}
```

### PII Data Handling

**lib/pii-protection.ts**:

```tsx
// PII detection patterns
const piiPatterns = {
  ssn: /\b\d{3}-?\d{2}-?\d{4}\b/g,
  creditCard: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
  phone: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
}

export function detectPII(text: string): string[] {
  const detected: string[] = []
  
  Object.entries(piiPatterns).forEach(([type, pattern]) => {
    if (pattern.test(text)) {
      detected.push(type)
    }
  })
  
  return detected
}

export function redactPII(text: string): string {
  let redacted = text
  
  // Redact SSNs
  redacted = redacted.replace(piiPatterns.ssn, 'XXX-XX-XXXX')
  
  // Redact credit cards
  redacted = redacted.replace(piiPatterns.creditCard, 'XXXX-XXXX-XXXX-XXXX')
  
  // Redact phone numbers
  redacted = redacted.replace(piiPatterns.phone, 'XXX-XXX-XXXX')
  
  // Redact emails (keep domain for context)
  redacted = redacted.replace(piiPatterns.email, (match) => {
    const [local, domain] = match.split('@')
    return `${local.slice(0, 2)}***@${domain}`
  })
  
  return redacted
}

// Data retention policies
export interface DataRetentionPolicy {
  resource: string
  retentionPeriod: number // days
  archiveAfter?: number // days
  deleteAfter: number // days
}

const retentionPolicies: DataRetentionPolicy[] = [
  {
    resource: 'audit_logs',
    retentionPeriod: 2555, // 7 years
    archiveAfter: 365,
    deleteAfter: 2555,
  },
  {
    resource: 'customers',
    retentionPeriod: 1825, // 5 years after last activity
    deleteAfter: 1825,
  },
  {
    resource: 'work_orders',
    retentionPeriod: 2555, // 7 years
    archiveAfter: 1095, // 3 years
    deleteAfter: 2555,
  },
]

export async function enforceDataRetention(): Promise<void> {
  for (const policy of retentionPolicies) {
    await enforceRetentionPolicy(policy)
  }
}

async function enforceRetentionPolicy(policy: DataRetentionPolicy): Promise<void> {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - policy.deleteAfter)

  // Archive old records if specified
  if (policy.archiveAfter) {
    const archiveCutoff = new Date()
    archiveCutoff.setDate(archiveCutoff.getDate() - policy.archiveAfter)
    
    // Move to archive table
    await supabase.rpc('archive_old_records', {
      table_name: policy.resource,
      cutoff_date: archiveCutoff.toISOString(),
    })
  }

  // Delete very old records
  const { error } = await supabase
    .from(policy.resource)
    .delete()
    .lt('created_at', cutoffDate.toISOString())

  if (error) {
    console.error(`Failed to enforce retention policy for ${policy.resource}:`, error)
  }
}
```

## 🛡️ Security Testing

### RLS Policy Testing

**tests/security/rls-security.test.ts**:

```tsx
import { createClient } from '@supabase/supabase-js'
import { describe, it, expect, beforeEach } from 'vitest'

// Test with different user contexts
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const supabaseUser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

describe('RLS Security Tests', () => {
  beforeEach(async () => {
    // Set up test data
    await setupTestData()
  })

  describe('Customer Table RLS', () => {
    it('should prevent users from accessing other tenants data', async () => {
      // Set JWT for tenant A
      await supabaseUser.auth.setSession({
        access_token: generateTestJWT({ tenant_id: 'tenant-a', role: 'staff' }),
        refresh_token: 'fake-refresh-token'
      })

      // Try to access tenant B's customers
      const { data, error } = await supabaseUser
        .from('customers')
        .select('*')
        .eq('tenant_id', 'tenant-b')

      // Should return empty array, not error (RLS filters results)
      expect(data).toEqual([])
    })

    it('should allow users to access their own tenant data', async () => {
      await supabaseUser.auth.setSession({
        access_token: generateTestJWT({ tenant_id: 'tenant-a', role: 'staff' }),
        refresh_token: 'fake-refresh-token'
      })

      const { data, error } = await supabaseUser
        .from('customers')
        .select('*')

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data!.every(customer => customer.tenant_id === 'tenant-a')).toBe(true)
    })

    it('should prevent non-admin users from deleting customers', async () => {
      await supabaseUser.auth.setSession({
        access_token: generateTestJWT({ tenant_id: 'tenant-a', role: 'staff' }),
        refresh_token: 'fake-refresh-token'
      })

      const { error } = await supabaseUser
        .from('customers')
        .delete()
        .eq('id', 'customer-1')

      expect(error).toBeDefined()
      expect(error?.message).toContain('Policy')
    })

    it('should allow admin users to delete customers', async () => {
      await supabaseUser.auth.setSession({
        access_token: generateTestJWT({ tenant_id: 'tenant-a', role: 'admin' }),
        refresh_token: 'fake-refresh-token'
      })

      const { error } = await supabaseUser
        .from('customers')
        .delete()
        .eq('id', 'customer-1')

      expect(error).toBeNull()
    })
  })

  describe('Cross-tenant Data Isolation', () => {
    it('should prevent SQL injection attempts', async () => {
      await supabaseUser.auth.setSession({
        access_token: generateTestJWT({ tenant_id: 'tenant-a', role: 'staff' }),
        refresh_token: 'fake-refresh-token'
      })

      // Attempt SQL injection
      const { data, error } = await supabaseUser
        .from('customers')
        .select('*')
        .ilike('name', "'; DROP TABLE customers; --")

      // Should not cause error, just return empty results
      expect(data).toEqual([])
    })
  })
})

function generateTestJWT(payload: { tenant_id: string; role: string }): string {
  // Generate test JWT with test secret
  const jwt = require('jsonwebtoken')
  return jwt.sign(payload, process.env.JWT_SECRET || 'test-secret')
}

async function setupTestData(): Promise<void> {
  // Create test tenants and customers
  await supabaseAdmin.from('tenants').upsert([
    { id: 'tenant-a', name: 'Tenant A' },
    { id: 'tenant-b', name: 'Tenant B' },
  ])

  await supabaseAdmin.from('customers').upsert([
    { id: 'customer-1', tenant_id: 'tenant-a', name: 'Customer A1', email: 'a1@test.com' },
    { id: 'customer-2', tenant_id: 'tenant-b', name: 'Customer B1', email: 'b1@test.com' },
  ])
}
```

### Penetration Testing Checklist

```markdown
## Security Testing Checklist

### Authentication & Authorization
- [ ] Test weak password policies
- [ ] Test account lockout mechanisms
- [ ] Test session management
- [ ] Test JWT token validation
- [ ] Test privilege escalation attempts
- [ ] Test multi-tenant isolation

### Input Validation
- [ ] Test SQL injection vulnerabilities
- [ ] Test XSS attacks
- [ ] Test CSRF attacks
- [ ] Test file upload vulnerabilities
- [ ] Test path traversal attacks
- [ ] Test command injection

### API Security
- [ ] Test rate limiting
- [ ] Test API authentication
- [ ] Test parameter tampering
- [ ] Test API versioning security
- [ ] Test error information disclosure
- [ ] Test HTTP method tampering

### Data Protection
- [ ] Test data encryption at rest
- [ ] Test data encryption in transit
- [ ] Test PII data protection
- [ ] Test audit trail integrity
- [ ] Test data retention policies
- [ ] Test backup security

### Infrastructure Security
- [ ] Test HTTPS enforcement
- [ ] Test security headers
- [ ] Test CORS configuration
- [ ] Test server configuration
- [ ] Test database security
- [ ] Test environment variable protection
```

## 🚨 Security Incident Response

### Incident Response Plan

**lib/incident-response.ts**:

```tsx
export interface SecurityIncident {
  id: string
  type: 'data_breach' | 'unauthorized_access' | 'ddos_attack' | 'malware' | 'phishing'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  affectedTenants: string[]
  affectedUsers: string[]
  detectedAt: Date
  reportedBy: string
  status: 'open' | 'investigating' | 'contained' | 'resolved'
  actions: IncidentAction[]
}

export interface IncidentAction {
  action: string
  takenBy: string
  takenAt: Date
  result: string
}

export class IncidentResponseManager {
  async reportIncident(incident: Omit<SecurityIncident, 'id' | 'detectedAt' | 'status' | 'actions'>): Promise<string> {
    const incidentId = crypto.randomUUID()
    
    const securityIncident: SecurityIncident = {
      ...incident,
      id: incidentId,
      detectedAt: new Date(),
      status: 'open',
      actions: [],
    }

    // Store incident
    await this.storeIncident(securityIncident)

    // Send immediate alerts
    await this.sendIncidentAlert(securityIncident)

    // Auto-containment for critical incidents
    if (incident.severity === 'critical') {
      await this.initiateAutoContainment(securityIncident)
    }

    return incidentId
  }

  private async storeIncident(incident: SecurityIncident): Promise<void> {
    await supabase.from('security_incidents').insert({
      id: incident.id,
      type: incident.type,
      severity: incident.severity,
      description: incident.description,
      affected_tenants: incident.affectedTenants,
      affected_users: incident.affectedUsers,
      detected_at: incident.detectedAt.toISOString(),
      reported_by: incident.reportedBy,
      status: incident.status,
    })
  }

  private async sendIncidentAlert(incident: SecurityIncident): Promise<void> {
    // Send to security team
    // Implementation depends on your alerting system (email, Slack, PagerDuty, etc.)
    console.error(`SECURITY INCIDENT [${incident.severity.toUpperCase()}]: ${incident.description}`)
  }

  private async initiateAutoContainment(incident: SecurityIncident): Promise<void> {
    // Automatic containment actions for critical incidents
    const actions: string[] = []

    if (incident.type === 'unauthorized_access') {
      // Lock affected user accounts
      for (const userId of incident.affectedUsers) {
        await this.lockUserAccount(userId, incident.id)
        actions.push(`Locked user account: ${userId}`)
      }
    }

    if (incident.type === 'data_breach') {
      // Enable additional monitoring
      await this.enableEnhancedMonitoring(incident.affectedTenants)
      actions.push('Enabled enhanced monitoring for affected tenants')
    }

    // Log containment actions
    for (const action of actions) {
      await this.addIncidentAction(incident.id, action, 'system', 'Auto-containment successful')
    }
  }

  private async lockUserAccount(userId: string, reason: string): Promise<void> {
    await supabase.from('account_lockouts').insert({
      user_id: userId,
      reason: `Security incident: ${reason}`,
      locked_until: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      locked_by: null, // System lockout
    })

    // Invalidate all sessions for this user
    await supabase.auth.admin.signOut(userId, 'global')
  }

  private async enableEnhancedMonitoring(tenantIds: string[]): Promise<void> {
    // Implement enhanced monitoring for affected tenants
    // This could include more frequent audit logging, additional alerts, etc.
    console.log('Enhanced monitoring enabled for tenants:', tenantIds)
  }

  async addIncidentAction(
    incidentId: string,
    action: string,
    takenBy: string,
    result: string
  ): Promise<void> {
    await supabase.from('security_incident_actions').insert({
      incident_id: incidentId,
      action,
      taken_by: takenBy,
      taken_at: new Date().toISOString(),
      result,
    })
  }
}

export const incidentResponse = new IncidentResponseManager()
```

## 📋 Security Checklist

### Development Security Checklist

```markdown
## Pre-Deployment Security Checklist

### Code Security
- [ ] All inputs validated with Zod schemas
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (input sanitization)
- [ ] CSRF protection enabled
- [ ] Error messages don't expose sensitive information
- [ ] Secrets not hardcoded in source code

### Authentication & Authorization
- [ ] RLS policies enabled on all tables
- [ ] Multi-tenant isolation verified
- [ ] Role-based access control implemented
- [ ] Session management secure
- [ ] Password policies enforced
- [ ] Account lockout mechanisms in place

### API Security
- [ ] Rate limiting implemented
- [ ] API authentication required
- [ ] Input validation on all endpoints
- [ ] Error handling doesn't leak information
- [ ] CORS properly configured
- [ ] Security headers implemented

### Data Protection
- [ ] Sensitive data encrypted at rest
- [ ] HTTPS enforced everywhere
- [ ] PII data identified and protected
- [ ] Data retention policies implemented
- [ ] Audit logging comprehensive
- [ ] Backup security verified

### Infrastructure Security
- [ ] Environment variables properly secured
- [ ] Database access restricted
- [ ] Network security configured
- [ ] Monitoring and alerting active
- [ ] Incident response plan ready
- [ ] Security testing completed
```

## 📚 Security Resources

### Internal Documentation
- [Database Architecture Security](./DATABASE-ARCHITECTURE.md#security)
- [API Security Best Practices](./API-DEVELOPMENT.md#security)
- [Performance vs Security Trade-offs](./PERFORMANCE-OPTIMIZATION-GUIDE.md#security-considerations)

### External Resources
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Security](https://nextjs.org/docs/going-to-production#security)
- [JWT Security Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)

---

*This security implementation guide provides comprehensive security measures for the Thorbis Business OS. Security is an ongoing process - regularly review and update security measures as the platform evolves.*