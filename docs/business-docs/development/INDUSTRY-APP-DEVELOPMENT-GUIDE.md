# Industry App Development Guide

> **Complete guide for building industry-specific applications in the Thorbis Business OS**
>
> **Time to first feature**: 30 minutes  
> **Time to production**: 2-3 hours

## 🏗️ Industry App Architecture

Thorbis Business OS uses industry-separated applications, each serving a specific vertical:

- **Home Services** (`/hs/`) - Dispatch, work orders, estimates
- **Restaurant** (`/rest/`) - POS, KDS, reservations, inventory
- **Auto Services** (`/auto/`) - Repair orders, parts, estimates
- **Retail** (`/ret/`) - POS, inventory, customers, orders

Each app follows the same architectural patterns while serving industry-specific needs.

## 🚀 Quick Start: Adding a Feature

### 1. Choose Your Industry App

```bash
# Start your target industry app
pnpm dev:hs      # Home Services
pnpm dev:rest    # Restaurant  
pnpm dev:auto    # Auto Services
pnpm dev:ret     # Retail
```

### 2. Understanding App Structure

```
apps/[industry]/
├── src/
│   ├── app/                     # Next.js 15 App Router
│   │   ├── (dashboard)/         # Dashboard layout group
│   │   │   ├── layout.tsx       # Dashboard layout
│   │   │   └── page.tsx         # Dashboard home
│   │   ├── [feature]/           # Feature-specific routes
│   │   │   ├── layout.tsx       # Feature layout
│   │   │   ├── page.tsx         # Main feature page
│   │   │   └── [id]/            # Dynamic routes
│   │   │       └── page.tsx     # Detail pages
│   │   ├── api/                 # API routes
│   │   │   └── [endpoint]/      # RESTful endpoints
│   │   ├── globals.css          # Global styles
│   │   └── layout.tsx           # Root layout
│   ├── components/              # React components
│   │   ├── ui/                  # UI components (from @thorbis/ui)
│   │   ├── forms/               # Form components
│   │   ├── tables/              # Data table components
│   │   └── [feature]/           # Feature-specific components
│   ├── lib/                     # Utility functions
│   │   ├── api/                 # API client functions
│   │   ├── utils.ts             # General utilities
│   │   └── [feature].ts         # Feature-specific logic
│   ├── hooks/                   # Custom React hooks
│   ├── types/                   # TypeScript definitions
│   └── schemas/                 # Zod validation schemas
```

## 🎯 Step-by-Step Feature Development

### Example: Adding a "Service Requests" feature to Home Services

#### Step 1: Create the Page Route

```bash
# Create the route directory
mkdir -p apps/hs/src/app/service-requests
```

**apps/hs/src/app/service-requests/page.tsx**:
```tsx
import { Metadata } from 'next'
import { PageHeader } from '@thorbis/ui/components/page-header'
import { ServiceRequestsList } from '@/components/service-requests/service-requests-list'

export const metadata: Metadata = {
  title: 'Service Requests | Home Services',
  description: 'Manage incoming service requests and customer inquiries',
}

export default function ServiceRequestsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Service Requests"
        description="Manage incoming service requests and customer inquiries"
        action={{
          label: "New Request",
          href: "/service-requests/new"
        }}
      />
      <ServiceRequestsList />
    </div>
  )
}
```

#### Step 2: Create the Layout (if needed)

**apps/hs/src/app/service-requests/layout.tsx**:
```tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Service Requests',
}

interface ServiceRequestsLayoutProps {
  children: React.ReactNode
}

export default function ServiceRequestsLayout({
  children,
}: ServiceRequestsLayoutProps) {
  return (
    <div className="service-requests-layout">
      {children}
    </div>
  )
}
```

#### Step 3: Create the Component

**apps/hs/src/components/service-requests/service-requests-list.tsx**:
```tsx
'use client'

import { useState, useEffect } from 'react'
import { DataTable } from '@thorbis/ui/components/data-table'
import { StatusBadge } from '@thorbis/ui/components/status-badge'
import { Button } from '@thorbis/ui/components/button'
import { useServiceRequests } from '@/hooks/use-service-requests'
import { ServiceRequest } from '@/types/service-requests'

export function ServiceRequestsList() {
  const { serviceRequests, loading, error, fetchServiceRequests } = useServiceRequests()

  useEffect(() => {
    fetchServiceRequests()
  }, [])

  const columns = [
    {
      key: 'request_number' as keyof ServiceRequest,
      label: 'Request #',
      sortable: true,
    },
    {
      key: 'customer_name' as keyof ServiceRequest,
      label: 'Customer',
      sortable: true,
    },
    {
      key: 'service_type' as keyof ServiceRequest,
      label: 'Service Type',
    },
    {
      key: 'status' as keyof ServiceRequest,
      label: 'Status',
      render: (value: string) => (
        <StatusBadge 
          status={value as 'pending' | 'in-progress' | 'completed' | 'cancelled'} 
        />
      ),
    },
    {
      key: 'created_at' as keyof ServiceRequest,
      label: 'Created',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: ServiceRequest) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = `/service-requests/${row.id}`}
          >
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = `/service-requests/${row.id}/edit`}
          >
            Edit
          </Button>
        </div>
      ),
    },
  ]

  if (loading) {
    return <div>Loading service requests...</div>
  }

  if (error) {
    return <div className="text-red-500">Error loading service requests: {error.message}</div>
  }

  return (
    <DataTable
      data={serviceRequests}
      columns={columns}
      searchable
      filterable
      pagination={{
        pageSize: 25,
        showSizeSelector: true,
      }}
    />
  )
}
```

#### Step 4: Create the Hook

**apps/hs/src/hooks/use-service-requests.ts**:
```tsx
import { useState, useCallback } from 'react'
import { ServiceRequest, CreateServiceRequestData } from '@/types/service-requests'
import { serviceRequestsApi } from '@/lib/api/service-requests'

export function useServiceRequests() {
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchServiceRequests = useCallback(async (filters?: any) => {
    try {
      setLoading(true)
      setError(null)
      const data = await serviceRequestsApi.getAll(filters)
      setServiceRequests(data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [])

  const createServiceRequest = useCallback(async (data: CreateServiceRequestData) => {
    try {
      setLoading(true)
      setError(null)
      const newRequest = await serviceRequestsApi.create(data)
      setServiceRequests(prev => [newRequest, ...prev])
      return newRequest
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateServiceRequest = useCallback(async (id: string, data: Partial<ServiceRequest>) => {
    try {
      setLoading(true)
      setError(null)
      const updated = await serviceRequestsApi.update(id, data)
      setServiceRequests(prev => 
        prev.map(req => req.id === id ? updated : req)
      )
      return updated
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    serviceRequests,
    loading,
    error,
    fetchServiceRequests,
    createServiceRequest,
    updateServiceRequest,
  }
}
```

#### Step 5: Create the API Client

**apps/hs/src/lib/api/service-requests.ts**:
```tsx
import { supabase } from '@/lib/supabase'
import { ServiceRequest, CreateServiceRequestData } from '@/types/service-requests'

export const serviceRequestsApi = {
  async getAll(filters?: any): Promise<ServiceRequest[]> {
    let query = supabase
      .from('service_requests')
      .select(`
        *,
        customer:customers(id, name, email, phone),
        assigned_technician:technicians(id, name, email)
      `)
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    
    if (filters?.service_type) {
      query = query.eq('service_type', filters.service_type)
    }

    const { data, error } = await query

    if (error) throw error
    return data as ServiceRequest[]
  },

  async getById(id: string): Promise<ServiceRequest | null> {
    const { data, error } = await supabase
      .from('service_requests')
      .select(`
        *,
        customer:customers(id, name, email, phone),
        assigned_technician:technicians(id, name, email)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data as ServiceRequest
  },

  async create(data: CreateServiceRequestData): Promise<ServiceRequest> {
    const { data: created, error } = await supabase
      .from('service_requests')
      .insert(data)
      .select(`
        *,
        customer:customers(id, name, email, phone),
        assigned_technician:technicians(id, name, email)
      `)
      .single()

    if (error) throw error
    return created as ServiceRequest
  },

  async update(id: string, data: Partial<ServiceRequest>): Promise<ServiceRequest> {
    const { data: updated, error } = await supabase
      .from('service_requests')
      .update(data)
      .eq('id', id)
      .select(`
        *,
        customer:customers(id, name, email, phone),
        assigned_technician:technicians(id, name, email)
      `)
      .single()

    if (error) throw error
    return updated as ServiceRequest
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('service_requests')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}
```

#### Step 6: Create Types

**apps/hs/src/types/service-requests.ts**:
```tsx
export interface ServiceRequest {
  id: string
  request_number: string
  customer_id: string
  customer_name: string
  service_type: 'plumbing' | 'electrical' | 'hvac' | 'general_maintenance'
  description: string
  urgency: 'low' | 'medium' | 'high' | 'emergency'
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled'
  assigned_technician_id?: string
  scheduled_date?: string
  estimated_duration?: number
  notes?: string
  created_at: string
  updated_at: string

  // Relations
  customer?: {
    id: string
    name: string
    email: string
    phone: string
  }
  assigned_technician?: {
    id: string
    name: string
    email: string
  }
}

export interface CreateServiceRequestData {
  customer_id: string
  service_type: ServiceRequest['service_type']
  description: string
  urgency: ServiceRequest['urgency']
  scheduled_date?: string
  estimated_duration?: number
  notes?: string
}

export interface ServiceRequestFilters {
  status?: ServiceRequest['status']
  service_type?: ServiceRequest['service_type']
  urgency?: ServiceRequest['urgency']
  assigned_technician_id?: string
  date_range?: {
    start: string
    end: string
  }
}
```

#### Step 7: Add Navigation

Update the app navigation to include your new feature:

**apps/hs/src/components/navigation.tsx** (or wherever navigation is defined):
```tsx
const navigationItems = [
  // ... existing items
  {
    name: 'Service Requests',
    href: '/service-requests',
    icon: ClipboardListIcon,
    badge: pendingRequestsCount, // optional
  },
  // ... rest of items
]
```

#### Step 8: Create API Route (Optional)

If you need server-side API endpoints:

**apps/hs/src/app/api/service-requests/route.ts**:
```tsx
import { NextRequest, NextResponse } from 'next/server'
import { serviceRequestsApi } from '@/lib/api/service-requests'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const filters = {
      status: searchParams.get('status'),
      service_type: searchParams.get('service_type'),
    }

    const serviceRequests = await serviceRequestsApi.getAll(filters)
    
    return NextResponse.json(serviceRequests)
  } catch (error) {
    console.error('Error fetching service requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch service requests' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const serviceRequest = await serviceRequestsApi.create(data)
    
    return NextResponse.json(serviceRequest, { status: 201 })
  } catch (error) {
    console.error('Error creating service request:', error)
    return NextResponse.json(
      { error: 'Failed to create service request' },
      { status: 500 }
    )
  }
}
```

## 🎨 Using Shared UI Components

### Key Components from @thorbis/ui

```tsx
import {
  Button,
  Card,
  DataTable,
  PageHeader,
  StatusBadge,
  InlinePanel,
  EmptyState,
  LoadingSkeleton,
} from '@thorbis/ui'
```

### Example: Creating a Form

```tsx
import { useState } from 'react'
import { Button } from '@thorbis/ui/components/button'
import { Card } from '@thorbis/ui/components/card'
import { Input } from '@thorbis/ui/components/input'
import { Select } from '@thorbis/ui/components/select'
import { Textarea } from '@thorbis/ui/components/textarea'

export function ServiceRequestForm({ onSubmit, initialData }) {
  const [formData, setFormData] = useState(initialData || {})

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Service Type
            </label>
            <Select
              value={formData.service_type}
              onValueChange={(value) => 
                setFormData(prev => ({ ...prev, service_type: value }))
              }
            >
              <option value="plumbing">Plumbing</option>
              <option value="electrical">Electrical</option>
              <option value="hvac">HVAC</option>
              <option value="general_maintenance">General Maintenance</option>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Urgency
            </label>
            <Select
              value={formData.urgency}
              onValueChange={(value) => 
                setFormData(prev => ({ ...prev, urgency: value }))
              }
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="emergency">Emergency</option>
            </Select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => 
                setFormData(prev => ({ ...prev, description: e.target.value }))
              }
              rows={4}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <Button variant="outline" type="button">
            Cancel
          </Button>
          <Button type="submit">
            Create Request
          </Button>
        </div>
      </form>
    </Card>
  )
}
```

## 🔗 Industry Schema Integration

### Using Shared Schemas

```tsx
import { homeServicesSchemas } from '@thorbis/schemas/hs'
import { z } from 'zod'

// Use predefined schemas
const ServiceRequestSchema = homeServicesSchemas.serviceRequest
const CreateServiceRequestSchema = homeServicesSchemas.createServiceRequest

// Validate data
const validateServiceRequest = (data: unknown) => {
  return ServiceRequestSchema.parse(data)
}

// Use in forms
const formSchema = z.object({
  customer_id: z.string().uuid(),
  service_type: z.enum(['plumbing', 'electrical', 'hvac', 'general_maintenance']),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  urgency: z.enum(['low', 'medium', 'high', 'emergency']),
})

type FormData = z.infer<typeof formSchema>
```

### Creating Industry-Specific Schemas

If you need new schemas, add them to the appropriate industry package:

**packages/schemas/src/hs/service-requests.ts**:
```tsx
import { z } from 'zod'

export const serviceRequestSchema = z.object({
  id: z.string().uuid(),
  request_number: z.string(),
  customer_id: z.string().uuid(),
  service_type: z.enum(['plumbing', 'electrical', 'hvac', 'general_maintenance']),
  description: z.string(),
  urgency: z.enum(['low', 'medium', 'high', 'emergency']),
  status: z.enum(['pending', 'in-progress', 'completed', 'cancelled']),
  assigned_technician_id: z.string().uuid().optional(),
  scheduled_date: z.string().datetime().optional(),
  estimated_duration: z.number().optional(),
  notes: z.string().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const createServiceRequestSchema = serviceRequestSchema.omit({
  id: true,
  request_number: true,
  created_at: true,
  updated_at: true,
})

export const updateServiceRequestSchema = serviceRequestSchema.partial()
```

## 📊 Database Integration Patterns

### Row Level Security (RLS) Policies

When creating new features, ensure RLS policies exist:

```sql
-- Enable RLS on the table
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;

-- Policy for viewing service requests (tenant isolation)
CREATE POLICY "view_service_requests" ON service_requests
  FOR SELECT
  USING (tenant_id = auth.jwt() ->> 'tenant_id');

-- Policy for creating service requests
CREATE POLICY "create_service_requests" ON service_requests
  FOR INSERT
  WITH CHECK (
    tenant_id = auth.jwt() ->> 'tenant_id' AND
    auth.jwt() ->> 'role' IN ('admin', 'dispatcher', 'technician')
  );

-- Policy for updating service requests
CREATE POLICY "update_service_requests" ON service_requests
  FOR UPDATE
  USING (
    tenant_id = auth.jwt() ->> 'tenant_id' AND
    auth.jwt() ->> 'role' IN ('admin', 'dispatcher', 'technician')
  );
```

### Supabase Client Configuration

**apps/hs/src/lib/supabase.ts**:
```tsx
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database'

export const supabase = createClientComponentClient<Database>()
```

## 🎯 Performance Best Practices

### NextFaster Compliance

1. **Server-Side Rendering**: Use RSC for initial data loading
2. **No Loading States**: Use Suspense boundaries and loading.tsx
3. **Prefetch Links**: Implement hover prefetching
4. **Bundle Size**: Keep component bundles under budget

### Example: Optimized Page

```tsx
import { Suspense } from 'react'
import { ServiceRequestsList } from '@/components/service-requests/service-requests-list'
import { LoadingSkeleton } from '@thorbis/ui/components/loading-skeleton'

export default async function ServiceRequestsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Service Requests"
        description="Manage incoming service requests and customer inquiries"
      />
      
      <Suspense fallback={<LoadingSkeleton />}>
        <ServiceRequestsList />
      </Suspense>
    </div>
  )
}
```

### Data Fetching Patterns

```tsx
// Server Component - Fetch on server
export default async function ServiceRequestPage({ params }: { params: { id: string } }) {
  const serviceRequest = await getServiceRequest(params.id)
  
  return (
    <ServiceRequestDetail serviceRequest={serviceRequest} />
  )
}

// Client Component - Fetch on client with SWR pattern
'use client'

import useSWR from 'swr'

export function ServiceRequestDetail({ initialData }: { initialData: ServiceRequest }) {
  const { data: serviceRequest, mutate } = useSWR(
    `/api/service-requests/${initialData.id}`,
    fetcher,
    {
      fallbackData: initialData,
      revalidateOnFocus: false,
    }
  )

  return (
    <div>
      {/* Component content */}
    </div>
  )
}
```

## 🧪 Testing Your Feature

### Unit Testing

**apps/hs/src/components/service-requests/__tests__/service-requests-list.test.tsx**:
```tsx
import { render, screen } from '@testing-library/react'
import { ServiceRequestsList } from '../service-requests-list'
import { mockServiceRequests } from '@/lib/test-utils/mock-data'

jest.mock('@/hooks/use-service-requests', () => ({
  useServiceRequests: () => ({
    serviceRequests: mockServiceRequests,
    loading: false,
    error: null,
    fetchServiceRequests: jest.fn(),
  }),
}))

describe('ServiceRequestsList', () => {
  it('renders service requests table', () => {
    render(<ServiceRequestsList />)
    
    expect(screen.getByText('Request #')).toBeInTheDocument()
    expect(screen.getByText('Customer')).toBeInTheDocument()
    expect(screen.getByText('Service Type')).toBeInTheDocument()
  })

  it('displays service request data', () => {
    render(<ServiceRequestsList />)
    
    expect(screen.getByText('SR-001')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })
})
```

### Integration Testing

```tsx
import { test, expect } from '@playwright/test'

test.describe('Service Requests', () => {
  test('can create a new service request', async ({ page }) => {
    await page.goto('/service-requests')
    
    await page.click('text=New Request')
    await page.fill('[name="customer_id"]', 'customer-1')
    await page.selectOption('[name="service_type"]', 'plumbing')
    await page.fill('[name="description"]', 'Kitchen sink is leaking')
    await page.selectOption('[name="urgency"]', 'high')
    
    await page.click('text=Create Request')
    
    await expect(page.getByText('Request created successfully')).toBeVisible()
  })

  test('can view service request details', async ({ page }) => {
    await page.goto('/service-requests')
    await page.click('text=View', { first: true })
    
    await expect(page.getByText('Service Request Details')).toBeVisible()
  })
})
```

## 🚀 Deployment and Production

### Environment Variables

Ensure your feature-specific environment variables are documented:

```env
# Feature-specific variables
NEXT_PUBLIC_ENABLE_SERVICE_REQUESTS=true
SERVICE_REQUEST_WEBHOOK_URL=https://api.thorbis.com/webhooks/service-requests
SERVICE_REQUEST_EMAIL_TEMPLATE_ID=template-123
```

### Database Migrations

Create migration files for your database changes:

**supabase/migrations/20240131000000_create_service_requests_table.sql**:
```sql
-- Create service_requests table
CREATE TABLE service_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  request_number text NOT NULL,
  customer_id uuid NOT NULL REFERENCES customers(id),
  service_type text NOT NULL CHECK (service_type IN ('plumbing', 'electrical', 'hvac', 'general_maintenance')),
  description text NOT NULL,
  urgency text NOT NULL CHECK (urgency IN ('low', 'medium', 'high', 'emergency')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'cancelled')),
  assigned_technician_id uuid REFERENCES technicians(id),
  scheduled_date timestamptz,
  estimated_duration integer,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  UNIQUE(tenant_id, request_number)
);

-- Create indexes
CREATE INDEX idx_service_requests_tenant_id ON service_requests(tenant_id);
CREATE INDEX idx_service_requests_customer_id ON service_requests(customer_id);
CREATE INDEX idx_service_requests_status ON service_requests(status);
CREATE INDEX idx_service_requests_created_at ON service_requests(created_at);

-- Create RLS policies
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "view_service_requests" ON service_requests
  FOR SELECT
  USING (tenant_id = auth.jwt() ->> 'tenant_id');

CREATE POLICY "create_service_requests" ON service_requests
  FOR INSERT
  WITH CHECK (
    tenant_id = auth.jwt() ->> 'tenant_id' AND
    auth.jwt() ->> 'role' IN ('admin', 'dispatcher', 'technician')
  );

CREATE POLICY "update_service_requests" ON service_requests
  FOR UPDATE
  USING (
    tenant_id = auth.jwt() ->> 'tenant_id' AND
    auth.jwt() ->> 'role' IN ('admin', 'dispatcher', 'technician')
  );

-- Create updated_at trigger
CREATE TRIGGER update_service_requests_updated_at
  BEFORE UPDATE ON service_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Build and Test

```bash
# Run all quality checks
pnpm lint
pnpm type-check
pnpm test

# Build for production
pnpm build:apps

# Test the specific app
pnpm build --filter=@thorbis/hs
```

## 📚 Industry-Specific Examples

### Restaurant App Pattern

```tsx
// apps/rest/src/app/orders/page.tsx
export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="Manage restaurant orders and kitchen tickets"
      />
      <OrdersList />
    </div>
  )
}
```

### Auto Services Pattern

```tsx
// apps/auto/src/app/repair-orders/page.tsx
export default function RepairOrdersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Repair Orders"
        description="Manage vehicle repair orders and estimates"
      />
      <RepairOrdersList />
    </div>
  )
}
```

### Retail Pattern

```tsx
// apps/ret/src/app/inventory/page.tsx
export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        description="Manage products and stock levels"
      />
      <InventoryList />
    </div>
  )
}
```

## 🎯 Next Steps

After completing your first feature:

1. **Add Error Handling**: Implement comprehensive error boundaries
2. **Add Loading States**: Use proper Suspense and loading patterns
3. **Add Accessibility**: Ensure WCAG compliance
4. **Add Analytics**: Implement usage tracking
5. **Add Documentation**: Update API docs and user guides
6. **Add Tests**: Write comprehensive test coverage

## 📖 Additional Resources

- [Shared Package Development Guide](./SHARED-PACKAGE-DEVELOPMENT-GUIDE.md)
- [Performance Optimization Guide](./PERFORMANCE-OPTIMIZATION-GUIDE.md)
- [Security Implementation Guide](./SECURITY-IMPLEMENTATION-GUIDE.md)
- [Next.js 15 App Router Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)

---

*This guide covers the complete development cycle for industry-specific features. For questions, see our [development documentation](./README.md) or reach out to the team.*