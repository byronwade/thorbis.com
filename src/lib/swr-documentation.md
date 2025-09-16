# SWR Implementation Documentation

## Overview

This implementation provides comprehensive server state management for the Thorbis Business OS using SWR (Stale-While-Revalidate). It includes:

- **Automatic caching** with intelligent revalidation
- **Performance monitoring** integration
- **Error handling** with retry logic
- **Industry-specific APIs** for different business verticals
- **Optimistic updates** for better UX
- **Real-time data** synchronization
- **TypeScript support** with comprehensive types

## Architecture

### Core Files

1. **`/src/lib/swr-config.ts`** - Global SWR configuration and utilities
2. **`/src/components/providers/swr-provider.tsx`** - SWR provider wrapper
3. **`/src/hooks/use-api.ts`** - Generic API hooks for data fetching and mutations
4. **`/src/hooks/use-industry-api.ts`** - Industry-specific API hooks

### Key Features

#### 1. Enhanced Fetcher with Retry Logic

```typescript
export const swrFetcher = async <T = any>(
  url: string,
  options: SWRFetcherOptions = {}
): Promise<APIResponse<T>> => {
  // Automatic retry with exponential backoff
  // Performance tracking
  // Error handling with monitoring integration
}
```

#### 2. Smart Cache Key Generation

```typescript
export const createSWRKey = (
  endpoint: string,
  params?: Record<string, any>,
  userId?: string
) => {
  // Generates consistent, user-scoped cache keys
}
```

#### 3. Performance Integration

- Tracks API call durations
- Monitors success/error rates
- Integrates with Web Vitals tracking
- Reports slow loading times

#### 4. Error Handling

- Automatic retry with exponential backoff
- Global error state management
- Monitoring service integration
- User-friendly error notifications

## Usage Examples

### Basic Data Fetching

```typescript
import { useAPI } from '@/hooks/use-api'

function UserProfile() {
  const { data, error, isLoading, refresh } = useAPI('/api/user/profile')
  
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  
  return <div>{data?.data?.name}</div>
}
```

### Paginated Data

```typescript
import { usePaginatedAPI } from '@/hooks/use-api'

function CustomerList() {
  const {
    data,
    isLoading,
    hasNextPage,
    hasPreviousPage,
    totalItems,
    currentPage
  } = usePaginatedAPI('/api/customers', 1, 20)
  
  return (
    <div>
      {data?.data?.map(customer => (
        <div key={customer.id}>{customer.name}</div>
      ))}
      <Pagination 
        hasNext={hasNextPage}
        hasPrev={hasPreviousPage}
        current={currentPage}
        total={totalItems}
      />
    </div>
  )
}
```

### Data Mutations

```typescript
import { useAPIMutation } from '@/hooks/use-api'

function CreateCustomerForm() {
  const { trigger, isMutating, error } = useAPIMutation(
    '/api/customers',
    'POST',
    {
      onSuccess: (data) => {
        console.log('Customer created:', data)
      },
      relatedKeys: ['/api/customers'] // Auto-revalidate customer list
    }
  )
  
  const handleSubmit = async (formData) => {
    try {
      await trigger(formData)
    } catch (err) {
      console.error('Failed to create customer:', err)
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button disabled={isMutating} type="submit">
        {isMutating ? 'Creating...' : 'Create Customer'}
      </button>
    </form>
  )
}
```

### Real-time Data

```typescript
import { useRealTimeAPI } from '@/hooks/use-api'

function LiveDashboard() {
  const { data, isLoading } = useRealTimeAPI('/api/dashboard/stats', 5000) // Poll every 5 seconds
  
  return (
    <div>
      <h2>Live Statistics</h2>
      <div>Active Users: {data?.data?.activeUsers}</div>
      <div>Revenue: ${data?.data?.revenue}</div>
    </div>
  )
}
```

### Industry-Specific APIs

```typescript
import { useHomeServicesAPI } from '@/hooks/use-industry-api'

function WorkOrderList() {
  const hsAPI = useHomeServicesAPI()
  const { data: workOrders, isLoading } = hsAPI.useWorkOrders(1, { 
    status: 'in_progress' 
  })
  
  return (
    <div>
      {workOrders?.data?.map(order => (
        <WorkOrderCard key={order.id} order={order} />
      ))}
    </div>
  )
}
```

## Industry-Specific Hooks

### Home Services (`useHomeServicesAPI`)

- `useWorkOrders()` - Paginated work orders with filtering
- `useWorkOrder(id)` - Individual work order details
- `useCreateWorkOrder()` - Create new work orders
- `useUpdateWorkOrder(id)` - Update existing work orders
- `useCustomers()` - Customer management
- `useDashboardStats()` - Real-time dashboard statistics

### Restaurant (`useRestaurantAPI`)

- `useMenuItems()` - Menu item management
- `useOrders()` - Order management with real-time updates
- `useKitchenOrders()` - Kitchen display system with frequent polling
- `useCreateOrder()` - Order creation with inventory updates
- `useUpdateOrderStatus()` - Order status management

### Auto Services (`useAutoServicesAPI`)

- `useVehicles()` - Vehicle management
- `useVehicleByVIN()` - VIN-based vehicle lookup
- `useRepairOrders()` - Repair order management
- `useServiceBays()` - Service bay availability tracking

### Retail (`useRetailAPI`)

- `useProducts()` - Product catalog management
- `useProductBySKU()` - SKU-based product lookup
- `useSales()` - Sales transaction history
- `useInventory()` - Inventory management with stock alerts
- `usePOSSession()` - Point-of-sale session management

## Configuration

### Global SWR Config

```typescript
export const swrConfig: SWRConfiguration = {
  fetcher: swrFetcher,
  dedupingInterval: 2000,
  focusThrottleInterval: 5000,
  errorRetryInterval: 5000,
  errorRetryCount: 3,
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  revalidateIfStale: true,
  refreshWhenHidden: false,
  refreshWhenOffline: false,
  loadingTimeout: 3000,
  // ... additional configuration
}
```

### Performance Monitoring

The SWR implementation automatically tracks:

- API call durations
- Success/failure rates
- Cache hit/miss ratios
- Slow loading endpoints
- Error patterns

All metrics are integrated with the Web Vitals tracking system.

### Error Handling

#### Automatic Retry Logic

- Exponential backoff for failed requests
- No retry for client errors (4xx)
- Configurable retry counts and delays
- Integration with error monitoring service

#### Error States

- Global error state management via Zustand
- Component-level error handling
- User-friendly error notifications
- Detailed error logging for debugging

### Cache Management

#### Cache Invalidation

```typescript
import { useCacheManager } from '@/hooks/use-api'

function AdminPanel() {
  const { invalidate, clear, prefetch } = useCacheManager()
  
  const handleRefreshData = () => {
    invalidate('/api/customers') // Refresh specific endpoint
  }
  
  const handleClearCache = () => {
    clear(/user:/) // Clear user-specific cache
  }
  
  const handlePrefetchData = async () => {
    await prefetch('/api/reports/analytics')
  }
}
```

#### Cache Statistics

- Monitor cache size and usage
- Track cache hit rates
- Debug cache keys and data
- Performance optimization insights

## Best Practices

### 1. Cache Key Strategy

- Use consistent naming patterns
- Include user context when needed
- Parameterize for filtering/pagination
- Avoid overly complex keys

### 2. Error Handling

- Always handle loading and error states
- Provide user-friendly error messages
- Use retry mechanisms appropriately
- Log errors for debugging

### 3. Performance Optimization

- Use appropriate polling intervals
- Implement proper pagination
- Prefetch critical data
- Monitor cache performance

### 4. Type Safety

- Define comprehensive TypeScript interfaces
- Use generic types for reusability
- Validate API responses with Zod schemas
- Maintain type consistency across the application

### 5. Testing

- Mock SWR responses in tests
- Test error scenarios and edge cases
- Validate cache behavior
- Test real-time updates and polling

## Integration with Other Systems

### Zustand State Management

SWR handles server state while Zustand manages client state:

- User authentication and preferences
- UI state (modals, sidebar, notifications)
- Application-level configuration
- Temporary form data

### Error Monitoring

Automatic integration with error monitoring:

- API error tracking
- Performance metric collection
- Failed request logging
- User session context

### Web Vitals Tracking

Performance metrics for API calls:

- Request duration tracking
- Success/failure rates
- Slow endpoint identification
- Cache performance metrics

This comprehensive SWR implementation provides robust server state management that integrates seamlessly with the overall Thorbis Business OS architecture, ensuring optimal performance, reliability, and developer experience.