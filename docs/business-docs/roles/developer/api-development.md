# API Development Guide

> **Version**: 1.0.0  
> **Last Updated**: January 2025  
> **Audience**: Backend developers, full-stack developers, API architects  

## Overview

This comprehensive guide covers API development for the Thorbis Business OS platform, including RESTful API design, GraphQL implementation, authentication patterns, and security best practices. The platform uses a multi-tenant, industry-separated architecture that requires specific attention to data isolation and security.

## Table of Contents

1. [API Architecture Overview](#api-architecture-overview)
2. [RESTful API Development](#restful-api-development)
3. [GraphQL Implementation](#graphql-implementation)
4. [Authentication and Authorization](#authentication-and-authorization)
5. [Multi-Tenant Data Isolation](#multi-tenant-data-isolation)
6. [Rate Limiting and Security](#rate-limiting-and-security)
7. [Error Handling and Validation](#error-handling-and-validation)
8. [Testing API Endpoints](#testing-api-endpoints)
9. [Documentation and Versioning](#documentation-and-versioning)
10. [Performance Optimization](#performance-optimization)

## API Architecture Overview

### Industry-Separated API Structure
```
api/
├── hs/                    # Home Services APIs
│   ├── app/v1/           # Authenticated app APIs
│   ├── public/v1/        # Public trust APIs
│   └── ai/               # AI/MCP tool endpoints
├── rest/                 # Restaurant APIs
│   ├── app/v1/
│   ├── public/v1/
│   └── ai/
├── auto/                 # Automotive APIs
│   ├── app/v1/
│   ├── public/v1/
│   └── ai/
└── ret/                  # Retail APIs
    ├── app/v1/
    ├── public/v1/
    └── ai/
```

### API Design Principles
```typescript
interface APIDesignPrinciples {
  industryIsolation: 'Complete separation between industry APIs';
  multiTenant: 'Built-in tenant isolation at the database level';
  security: 'Authentication and authorization for all endpoints';
  performance: 'Optimized for sub-200ms response times';
  consistency: 'Consistent patterns across all industry APIs';
  scalability: 'Designed for horizontal scaling and high availability';
}
```

## RESTful API Development

### Next.js App Router API Routes
```typescript
// app/api/hs/app/v1/customers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Request validation schema
const CreateCustomerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string()
  }).optional()
});

// GET /api/hs/app/v1/customers
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's business context
    const businessId = request.headers.get('x-business-id');
    if (!businessId) {
      return NextResponse.json(
        { error: 'Business context required' },
        { status: 400 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '25'), 100);
    const search = searchParams.get('search') || '';

    // Build query
    let query = supabase
      .from('hs_customers')
      .select('*', { count: 'exact' })
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch customers' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/hs/app/v1/customers
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get business context
    const businessId = request.headers.get('x-business-id');
    if (!businessId) {
      return NextResponse.json(
        { error: 'Business context required' },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = CreateCustomerSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { name, email, phone, address } = validationResult.data;

    // Create customer
    const { data, error } = await supabase
      .from('hs_customers')
      .insert([
        {
          business_id: businessId,
          name,
          email,
          phone,
          address,
          created_by: user.id
        }
      ])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Customer with this email already exists' },
          { status: 409 }
        );
      }
      
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create customer' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Dynamic Route Handlers
```typescript
// app/api/hs/app/v1/customers/[id]/route.ts
interface Params {
  id: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Verify authentication and business context
    const { user, businessId } = await verifyAuthAndBusiness(request, supabase);
    if (!user || !businessId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('hs_customers')
      .select(`
        *,
        work_orders:hs_work_orders(
          id,
          title,
          status,
          created_at
        )
      `)
      .eq('business_id', businessId)
      .eq('id', params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Customer not found' },
          { status: 404 }
        );
      }
      
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch customer' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### API Helper Functions
```typescript
// lib/api-helpers.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export async function verifyAuthAndBusiness(
  request: NextRequest,
  supabase?: any
) {
  if (!supabase) {
    supabase = createRouteHandlerClient({ cookies });
  }

  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { user: null, businessId: null, error: 'Unauthorized' };
  }

  // Get business context
  const businessId = request.headers.get('x-business-id');
  if (!businessId) {
    return { user, businessId: null, error: 'Business context required' };
  }

  // Verify user has access to business
  const { data: membership } = await supabase
    .from('business_memberships')
    .select('role')
    .eq('business_id', businessId)
    .eq('user_id', user.id)
    .eq('active', true)
    .single();

  if (!membership) {
    return { user, businessId, error: 'Access denied to business' };
  }

  return { user, businessId, role: membership.role, error: null };
}

export function withAuth(handler: Function) {
  return async (request: NextRequest, context: any) => {
    const supabase = createRouteHandlerClient({ cookies });
    const { user, businessId, role, error } = await verifyAuthAndBusiness(request, supabase);

    if (error) {
      return NextResponse.json({ error }, { status: 401 });
    }

    // Add auth context to request
    (request as any).user = user;
    (request as any).businessId = businessId;
    (request as any).userRole = role;
    (request as any).supabase = supabase;

    return handler(request, context);
  };
}
```

## GraphQL Implementation

### GraphQL Schema Definition
```typescript
// lib/graphql/schema.ts
import { gql } from 'graphql-tag';

export const typeDefs = gql`
  type Customer {
    id: ID!
    businessId: ID!
    name: String!
    email: String!
    phone: String
    address: Address
    workOrders: [WorkOrder!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Address {
    street: String!
    city: String!
    state: String!
    zipCode: String!
  }

  type WorkOrder {
    id: ID!
    customerId: ID!
    title: String!
    description: String
    status: WorkOrderStatus!
    priority: Priority!
    scheduledAt: DateTime
    completedAt: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum WorkOrderStatus {
    PENDING
    SCHEDULED
    IN_PROGRESS
    COMPLETED
    CANCELLED
  }

  enum Priority {
    LOW
    MEDIUM
    HIGH
    URGENT
  }

  input CreateCustomerInput {
    name: String!
    email: String!
    phone: String
    address: AddressInput
  }

  input AddressInput {
    street: String!
    city: String!
    state: String!
    zipCode: String!
  }

  type Query {
    customers(page: Int = 1, limit: Int = 25, search: String): CustomerConnection!
    customer(id: ID!): Customer
    workOrders(customerId: ID, status: WorkOrderStatus, page: Int = 1, limit: Int = 25): WorkOrderConnection!
  }

  type Mutation {
    createCustomer(input: CreateCustomerInput!): Customer!
    updateCustomer(id: ID!, input: UpdateCustomerInput!): Customer!
    deleteCustomer(id: ID!): Boolean!
  }

  type CustomerConnection {
    nodes: [Customer!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  scalar DateTime
`;
```

### GraphQL Resolvers
```typescript
// lib/graphql/resolvers.ts
import { GraphQLError } from 'graphql';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const resolvers = {
  Query: {
    customers: async (_parent: any, args: any, context: any) => {
      const { user, businessId } = context;
      
      if (!user || !businessId) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      const { page = 1, limit = 25, search } = args;
      const offset = (page - 1) * limit;

      let query = context.supabase
        .from('hs_customers')
        .select('*', { count: 'exact' })
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
      }

      const { data, error, count } = await query;

      if (error) {
        throw new GraphQLError('Failed to fetch customers', {
          extensions: { code: 'INTERNAL_ERROR' }
        });
      }

      return {
        nodes: data || [],
        pageInfo: {
          hasNextPage: (offset + limit) < (count || 0),
          hasPreviousPage: page > 1,
        },
        totalCount: count || 0
      };
    },

    customer: async (_parent: any, { id }: { id: string }, context: any) => {
      const { user, businessId } = context;
      
      if (!user || !businessId) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      const { data, error } = await context.supabase
        .from('hs_customers')
        .select(`
          *,
          work_orders:hs_work_orders(*)
        `)
        .eq('business_id', businessId)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new GraphQLError('Customer not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }
        throw new GraphQLError('Failed to fetch customer', {
          extensions: { code: 'INTERNAL_ERROR' }
        });
      }

      return data;
    },
  },

  Mutation: {
    createCustomer: async (_parent: any, { input }: any, context: any) => {
      const { user, businessId } = context;
      
      if (!user || !businessId) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      const { data, error } = await context.supabase
        .from('hs_customers')
        .insert([
          {
            business_id: businessId,
            created_by: user.id,
            ...input
          }
        ])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new GraphQLError('Customer with this email already exists', {
            extensions: { code: 'DUPLICATE_EMAIL' }
          });
        }
        throw new GraphQLError('Failed to create customer', {
          extensions: { code: 'INTERNAL_ERROR' }
        });
      }

      return data;
    },
  },

  Customer: {
    workOrders: async (parent: any, _args: any, context: any) => {
      const { data, error } = await context.supabase
        .from('hs_work_orders')
        .select('*')
        .eq('customer_id', parent.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw new GraphQLError('Failed to fetch work orders', {
          extensions: { code: 'INTERNAL_ERROR' }
        });
      }

      return data || [];
    },
  },
};
```

### GraphQL Context Setup
```typescript
// lib/graphql/context.ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function createContext(request: Request) {
  const supabase = createServerComponentClient({ cookies });
  
  // Get authentication
  const { data: { user } } = await supabase.auth.getUser();
  
  // Get business context from headers
  const businessId = request.headers.get('x-business-id');
  
  return {
    user,
    businessId,
    supabase
  };
}
```

## Authentication and Authorization

### JWT Token Validation
```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });

  // Refresh session if expired
  const { data: { session } } = await supabase.auth.getSession();

  // Protect API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Skip public routes
    if (request.nextUrl.pathname.includes('/public/')) {
      return res;
    }

    // Require authentication for app routes
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Add user context to headers
    res.headers.set('x-user-id', session.user.id);
  }

  return res;
}

export const config = {
  matcher: ['/api/:path*']
};
```

### Role-Based Access Control
```typescript
// lib/auth/rbac.ts
export enum UserRole {
  OWNER = 'owner',
  MANAGER = 'manager', 
  STAFF = 'staff',
  VIEWER = 'viewer'
}

export enum Permission {
  READ_CUSTOMERS = 'read:customers',
  WRITE_CUSTOMERS = 'write:customers',
  READ_WORK_ORDERS = 'read:work_orders',
  WRITE_WORK_ORDERS = 'write:work_orders',
  READ_FINANCIALS = 'read:financials',
  WRITE_FINANCIALS = 'write:financials',
  MANAGE_USERS = 'manage:users',
  MANAGE_SETTINGS = 'manage:settings'
}

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.OWNER]: [
    Permission.READ_CUSTOMERS,
    Permission.WRITE_CUSTOMERS,
    Permission.READ_WORK_ORDERS,
    Permission.WRITE_WORK_ORDERS,
    Permission.READ_FINANCIALS,
    Permission.WRITE_FINANCIALS,
    Permission.MANAGE_USERS,
    Permission.MANAGE_SETTINGS
  ],
  [UserRole.MANAGER]: [
    Permission.READ_CUSTOMERS,
    Permission.WRITE_CUSTOMERS,
    Permission.READ_WORK_ORDERS,
    Permission.WRITE_WORK_ORDERS,
    Permission.READ_FINANCIALS
  ],
  [UserRole.STAFF]: [
    Permission.READ_CUSTOMERS,
    Permission.READ_WORK_ORDERS,
    Permission.WRITE_WORK_ORDERS
  ],
  [UserRole.VIEWER]: [
    Permission.READ_CUSTOMERS,
    Permission.READ_WORK_ORDERS
  ]
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
}

export function requirePermission(permission: Permission) {
  return (handler: Function) => {
    return async (request: NextRequest, context: any) => {
      const { userRole } = request as any;
      
      if (!hasPermission(userRole, permission)) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }

      return handler(request, context);
    };
  };
}
```

## Multi-Tenant Data Isolation

### Database Row Level Security
```sql
-- Create RLS policy for customers table
CREATE POLICY "Users can only access their business customers"
ON hs_customers FOR ALL USING (
  business_id IN (
    SELECT business_id FROM business_memberships 
    WHERE user_id = auth.uid() AND active = true
  )
);

-- Set business context in application
SET app.current_business_id = 'business-uuid';
```

### TypeScript Business Context
```typescript
// lib/database/context.ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

export class DatabaseContext {
  private supabase: any;
  private businessId: string;

  constructor(businessId: string) {
    this.supabase = createServerComponentClient({ cookies });
    this.businessId = businessId;
    
    // Set business context for RLS
    this.supabase.rpc('set_business_context', { 
      business_id: businessId 
    });
  }

  // All queries automatically include business_id filter
  async getCustomers(filters: any = {}) {
    return this.supabase
      .from('hs_customers')
      .select('*')
      .eq('business_id', this.businessId)
      .match(filters);
  }

  async createCustomer(data: any) {
    return this.supabase
      .from('hs_customers')
      .insert([
        {
          ...data,
          business_id: this.businessId
        }
      ]);
  }
}
```

## Rate Limiting and Security

### Rate Limiting Implementation
```typescript
// lib/middleware/rate-limit.ts
import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (request: NextRequest) => string;
}

export function rateLimit(config: RateLimitConfig) {
  return async (request: NextRequest) => {
    const key = config.keyGenerator ? 
      config.keyGenerator(request) : 
      request.ip || 'anonymous';

    const identifier = `rate_limit:${key}`;
    const window = Math.floor(Date.now() / config.windowMs);
    const windowKey = `${identifier}:${window}`;

    try {
      const current = await redis.incr(windowKey);
      
      if (current === 1) {
        await redis.expire(windowKey, config.windowMs / 1000);
      }

      if (current > config.maxRequests) {
        return NextResponse.json(
          { 
            error: 'Rate limit exceeded',
            retryAfter: config.windowMs / 1000
          },
          { 
            status: 429,
            headers: {
              'Retry-After': String(config.windowMs / 1000),
              'X-RateLimit-Limit': String(config.maxRequests),
              'X-RateLimit-Remaining': String(Math.max(0, config.maxRequests - current)),
              'X-RateLimit-Reset': String(window * config.windowMs + config.windowMs)
            }
          }
        );
      }

      return null; // Continue processing
    } catch (error) {
      console.error('Rate limiting error:', error);
      return null; // Fail open
    }
  };
}

// Usage in API route
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // Limit each IP to 100 requests per windowMs
  keyGenerator: (request) => {
    const businessId = request.headers.get('x-business-id');
    return businessId || request.ip || 'anonymous';
  }
});

export async function GET(request: NextRequest) {
  const rateLimitResponse = await limiter(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  // Continue with normal processing
  // ...
}
```

### Input Validation and Sanitization
```typescript
// lib/validation/schemas.ts
import { z } from 'zod';
import xss from 'xss';

// Custom sanitization transform
const sanitize = (input: string) => xss(input.trim());

export const CreateCustomerSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name too long')
    .transform(sanitize),
  email: z.string()
    .email('Invalid email address')
    .transform((email) => email.toLowerCase().trim()),
  phone: z.string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number')
    .optional()
    .transform((phone) => phone?.replace(/\D/g, '')),
  address: z.object({
    street: z.string().min(1, 'Street is required').transform(sanitize),
    city: z.string().min(1, 'City is required').transform(sanitize),
    state: z.string().length(2, 'State must be 2 characters').transform(sanitize),
    zipCode: z.string()
      .regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code')
      .transform(sanitize)
  }).optional()
});

export const UpdateCustomerSchema = CreateCustomerSchema.partial();
```

## Error Handling and Validation

### Comprehensive Error Handler
```typescript
// lib/errors/api-error.ts
export class APIError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: any;

  constructor(message: string, statusCode: number = 500, code?: string, details?: any) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.code = code || 'INTERNAL_ERROR';
    this.details = details;
  }
}

export class ValidationError extends APIError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class NotFoundError extends APIError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class UnauthorizedError extends APIError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

// Error handler wrapper
export function withErrorHandler(handler: Function) {
  return async (request: NextRequest, context: any) => {
    try {
      return await handler(request, context);
    } catch (error) {
      console.error('API error:', error);

      if (error instanceof APIError) {
        return NextResponse.json(
          { 
            error: error.message,
            code: error.code,
            details: error.details
          },
          { status: error.statusCode }
        );
      }

      // Log unexpected errors
      if (process.env.NODE_ENV === 'production') {
        // Send to error monitoring service
      }

      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}
```

## Testing API Endpoints

### Unit Testing with Vitest
```typescript
// tests/api/customers.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMocks } from 'node-mocks-http';
import { GET, POST } from '../../../app/api/hs/app/v1/customers/route';

// Mock Supabase client
vi.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(() => ({ 
        data: { user: { id: 'user-123' } },
        error: null
      }))
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            range: vi.fn(() => ({
              data: [{ id: '1', name: 'Test Customer' }],
              error: null,
              count: 1
            }))
          }))
        }))
      }))
    }))
  }))
}));

describe('/api/hs/app/v1/customers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('should return customers for authenticated user', async () => {
      const { req } = createMocks({
        method: 'GET',
        url: '/api/hs/app/v1/customers',
        headers: {
          'x-business-id': 'business-123'
        }
      });

      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toEqual([{ id: '1', name: 'Test Customer' }]);
    });

    it('should return 401 for unauthenticated requests', async () => {
      // Mock unauthenticated user
      vi.mocked(createRouteHandlerClient).mockReturnValue({
        auth: {
          getUser: vi.fn(() => ({ data: { user: null }, error: null }))
        }
      } as any);

      const { req } = createMocks({
        method: 'GET',
        headers: {
          'x-business-id': 'business-123'
        }
      });

      const response = await GET(req as any);
      expect(response.status).toBe(401);
    });
  });

  describe('POST', () => {
    it('should create customer with valid data', async () => {
      const customerData = {
        name: 'New Customer',
        email: 'new@example.com'
      };

      const { req } = createMocks({
        method: 'POST',
        headers: {
          'x-business-id': 'business-123',
          'content-type': 'application/json'
        },
        body: customerData
      });

      const response = await POST(req as any);
      expect(response.status).toBe(201);
    });

    it('should return validation errors for invalid data', async () => {
      const invalidData = { name: '' }; // Missing required fields

      const { req } = createMocks({
        method: 'POST',
        headers: {
          'x-business-id': 'business-123',
          'content-type': 'application/json'
        },
        body: invalidData
      });

      const response = await POST(req as any);
      expect(response.status).toBe(400);
    });
  });
});
```

### Integration Testing
```typescript
// tests/integration/customers-api.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

describe('Customers API Integration', () => {
  let testBusinessId: string;
  let testUserId: string;

  beforeAll(async () => {
    // Set up test data
    const { data: business } = await supabase
      .from('businesses')
      .insert([{ name: 'Test Business' }])
      .select()
      .single();
    
    testBusinessId = business.id;

    // Create test user
    const { data: auth } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'testpassword'
    });
    
    testUserId = auth.user!.id;

    // Add user to business
    await supabase
      .from('business_memberships')
      .insert([{
        business_id: testBusinessId,
        user_id: testUserId,
        role: 'owner',
        active: true
      }]);
  });

  afterAll(async () => {
    // Clean up test data
    await supabase
      .from('businesses')
      .delete()
      .eq('id', testBusinessId);
  });

  it('should handle complete customer lifecycle', async () => {
    // Create customer
    const createResponse = await fetch('/api/hs/app/v1/customers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-business-id': testBusinessId,
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
      },
      body: JSON.stringify({
        name: 'Integration Test Customer',
        email: 'integration@test.com'
      })
    });

    expect(createResponse.status).toBe(201);
    const createData = await createResponse.json();
    const customerId = createData.data.id;

    // Get customer
    const getResponse = await fetch(`/api/hs/app/v1/customers/${customerId}`, {
      headers: {
        'x-business-id': testBusinessId,
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
      }
    });

    expect(getResponse.status).toBe(200);
    const getData = await getResponse.json();
    expect(getData.data.name).toBe('Integration Test Customer');

    // List customers
    const listResponse = await fetch('/api/hs/app/v1/customers', {
      headers: {
        'x-business-id': testBusinessId,
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
      }
    });

    expect(listResponse.status).toBe(200);
    const listData = await listResponse.json();
    expect(listData.data.length).toBeGreaterThan(0);
  });
});
```

## Documentation and Versioning

### OpenAPI/Swagger Documentation
```typescript
// lib/docs/openapi.ts
import { OpenAPIV3 } from 'openapi-types';

export const openAPISpec: OpenAPIV3.Document = {
  openapi: '3.0.0',
  info: {
    title: 'Thorbis Home Services API',
    version: '1.0.0',
    description: 'RESTful API for home services management'
  },
  servers: [
    {
      url: 'https://app.thorbis.com/api/hs/app/v1',
      description: 'Production server'
    },
    {
      url: 'http://localhost:3000/api/hs/app/v1',
      description: 'Development server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      Customer: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          businessId: { type: 'string', format: 'uuid' },
          name: { type: 'string', minLength: 1, maxLength: 100 },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string', pattern: '^[\\+]?[1-9][\\d]{0,15}$' },
          address: { $ref: '#/components/schemas/Address' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        },
        required: ['id', 'businessId', 'name', 'email', 'createdAt', 'updatedAt']
      },
      Address: {
        type: 'object',
        properties: {
          street: { type: 'string', minLength: 1 },
          city: { type: 'string', minLength: 1 },
          state: { type: 'string', minLength: 2, maxLength: 2 },
          zipCode: { type: 'string', pattern: '^\\d{5}(-\\d{4})?$' }
        },
        required: ['street', 'city', 'state', 'zipCode']
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          code: { type: 'string' },
          details: { type: 'object' }
        },
        required: ['error']
      }
    }
  },
  paths: {
    '/customers': {
      get: {
        summary: 'List customers',
        description: 'Retrieve a paginated list of customers for the authenticated business',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'x-business-id',
            in: 'header',
            required: true,
            schema: { type: 'string', format: 'uuid' }
          },
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', minimum: 1, default: 1 }
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 25 }
          },
          {
            name: 'search',
            in: 'query',
            schema: { type: 'string' }
          }
        ],
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Customer' }
                    },
                    pagination: {
                      type: 'object',
                      properties: {
                        page: { type: 'integer' },
                        limit: { type: 'integer' },
                        total: { type: 'integer' },
                        totalPages: { type: 'integer' }
                      }
                    }
                  }
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      },
      post: {
        summary: 'Create customer',
        description: 'Create a new customer for the authenticated business',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'x-business-id',
            in: 'header',
            required: true,
            schema: { type: 'string', format: 'uuid' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', minLength: 1, maxLength: 100 },
                  email: { type: 'string', format: 'email' },
                  phone: { type: 'string', pattern: '^[\\+]?[1-9][\\d]{0,15}$' },
                  address: { $ref: '#/components/schemas/Address' }
                },
                required: ['name', 'email']
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Customer created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { $ref: '#/components/schemas/Customer' }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          },
          '409': {
            description: 'Customer already exists',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      }
    }
  }
};
```

### API Versioning Strategy
```typescript
// lib/versioning/version-handler.ts
export enum APIVersion {
  V1 = 'v1',
  V2 = 'v2'
}

export function getAPIVersion(request: NextRequest): APIVersion {
  // Check URL path
  const pathVersion = request.nextUrl.pathname.match(/\/v(\d+)\//)?.[1];
  if (pathVersion) {
    return `v${pathVersion}` as APIVersion;
  }

  // Check header
  const headerVersion = request.headers.get('API-Version');
  if (headerVersion && Object.values(APIVersion).includes(headerVersion as APIVersion)) {
    return headerVersion as APIVersion;
  }

  // Default to v1
  return APIVersion.V1;
}

export function versionedHandler(handlers: Partial<Record<APIVersion, Function>>) {
  return async (request: NextRequest, context: any) => {
    const version = getAPIVersion(request);
    const handler = handlers[version];

    if (!handler) {
      return NextResponse.json(
        { error: `API version ${version} not supported` },
        { status: 400 }
      );
    }

    return handler(request, context);
  };
}

// Usage
export const GET = versionedHandler({
  [APIVersion.V1]: handleV1,
  [APIVersion.V2]: handleV2
});
```

## Performance Optimization

### Database Query Optimization
```typescript
// lib/database/optimized-queries.ts
export class OptimizedQueries {
  private supabase: any;

  constructor(supabase: any) {
    this.supabase = supabase;
  }

  // Use select to limit returned fields
  async getCustomersList(businessId: string, options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}) {
    const { page = 1, limit = 25, search } = options;

    // Only select needed fields
    let query = this.supabase
      .from('hs_customers')
      .select(`
        id,
        name,
        email,
        phone,
        created_at,
        work_orders:hs_work_orders(count)
      `, { count: 'exact' })
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    return query.range((page - 1) * limit, page * limit - 1);
  }

  // Use proper indexing and joins
  async getCustomerWithWorkOrders(businessId: string, customerId: string) {
    return this.supabase
      .from('hs_customers')
      .select(`
        *,
        work_orders:hs_work_orders(
          id,
          title,
          status,
          priority,
          scheduled_at,
          created_at
        )
      `)
      .eq('business_id', businessId)
      .eq('id', customerId)
      .single();
  }

  // Batch operations for better performance
  async createMultipleCustomers(businessId: string, customers: any[]) {
    const customersWithBusinessId = customers.map(customer => ({
      ...customer,
      business_id: businessId
    }));

    return this.supabase
      .from('hs_customers')
      .insert(customersWithBusinessId)
      .select();
  }
}
```

### Response Caching
```typescript
// lib/cache/api-cache.ts
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export class APICache {
  private static generateKey(request: NextRequest): string {
    const url = new URL(request.url);
    const businessId = request.headers.get('x-business-id') || 'no-business';
    const userId = request.headers.get('x-user-id') || 'no-user';
    
    return `api:${businessId}:${userId}:${url.pathname}:${url.search}`;
  }

  static async get(request: NextRequest): Promise<any | null> {
    try {
      const key = this.generateKey(request);
      const cached = await redis.get(key);
      return cached ? JSON.parse(cached as string) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  static async set(
    request: NextRequest,
    data: any,
    ttlSeconds: number = 300
  ): Promise<void> {
    try {
      const key = this.generateKey(request);
      await redis.setex(key, ttlSeconds, JSON.stringify(data));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  static async invalidate(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }
}

// Cache wrapper for API handlers
export function withCache(options: {
  ttl?: number;
  keyGenerator?: (request: NextRequest) => string;
} = {}) {
  return (handler: Function) => {
    return async (request: NextRequest, context: any) => {
      // Only cache GET requests
      if (request.method !== 'GET') {
        return handler(request, context);
      }

      // Try to get from cache
      const cached = await APICache.get(request);
      if (cached) {
        return NextResponse.json(cached.data, {
          status: cached.status,
          headers: {
            'X-Cache': 'HIT',
            'Cache-Control': 'public, max-age=300'
          }
        });
      }

      // Execute handler
      const response = await handler(request, context);
      
      // Cache successful responses
      if (response.status === 200) {
        const data = await response.json();
        await APICache.set(request, { data, status: 200 }, options.ttl);
        
        return NextResponse.json(data, {
          status: 200,
          headers: {
            'X-Cache': 'MISS',
            'Cache-Control': 'public, max-age=300'
          }
        });
      }

      return response;
    };
  };
}
```

---

*This API Development Guide provides comprehensive guidance for building scalable, secure, and performant APIs for the Thorbis Business OS platform while maintaining industry separation and multi-tenant data isolation.*