# GraphQL Integration Patterns

> **Last Updated**: 2025-01-31  
> **Version**: 1.0.0  
> **Status**: Production Ready

This guide provides comprehensive patterns for integrating GraphQL into your applications using the Thorbis Business OS GraphQL API.

## Table of Contents

1. [Client Library Integration](#client-library-integration)
2. [Code Generation](#code-generation)
3. [Caching Strategies](#caching-strategies)
4. [Framework Integration](#framework-integration)
5. [Real-time Features](#real-time-features)
6. [Performance Optimization](#performance-optimization)

## Client Library Integration

### Apollo Client Integration

#### Basic Setup

```typescript
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: 'https://api.thorbis.com/v1/graphql',
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache({
    typePolicies: {
      HSCustomer: {
        fields: {
          workOrders: {
            merge(existing = [], incoming) {
              return [...existing, ...incoming];
            }
          }
        }
      }
    }
  })
});
```

#### Industry-Specific Cache Configuration

```typescript
// Home Services cache policies
const homeServicesCache = new InMemoryCache({
  typePolicies: {
    HSWorkOrder: {
      fields: {
        status: {
          merge: false, // Always replace status updates
        },
        items: {
          merge(existing = [], incoming, { args }) {
            // Custom merge logic for work order items
            return incoming;
          }
        }
      }
    },
    HSCustomer: {
      keyFields: ["id", "businessId"],
      fields: {
        workOrders: relayStylePagination(),
      }
    }
  }
});
```

### React Integration Patterns

#### Custom Hooks for Home Services

```typescript
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { 
  GET_HS_WORK_ORDERS,
  CREATE_HS_WORK_ORDER,
  WORK_ORDER_UPDATES
} from './graphql/home-services';

export const useHomeServicesData = (businessId: string) => {
  // Query work orders
  const { data, loading, error, refetch } = useQuery(GET_HS_WORK_ORDERS, {
    variables: { 
      businessId,
      pagination: { first: 20 },
      filters: [{ field: "status", operator: "NOT_EQUALS", value: "CANCELLED" }]
    },
    pollInterval: 30000, // Poll every 30 seconds
  });

  // Create work order mutation
  const [createWorkOrder] = useMutation(CREATE_HS_WORK_ORDER, {
    update(cache, { data }) {
      const newWorkOrder = data?.createHSWorkOrder;
      if (newWorkOrder) {
        cache.modify({
          fields: {
            hsWorkOrders(existingOrders = { edges: [] }) {
              const newEdge = {
                __typename: 'HSWorkOrderEdge',
                cursor: newWorkOrder.id,
                node: newWorkOrder
              };
              return {
                ...existingOrders,
                edges: [newEdge, ...existingOrders.edges]
              };
            }
          }
        });
      }
    }
  });

  // Real-time updates
  useSubscription(WORK_ORDER_UPDATES, {
    variables: { businessId },
    onSubscriptionData: ({ subscriptionData }) => {
      // Handle real-time work order updates
      const workOrder = subscriptionData.data?.workOrderUpdates;
      if (workOrder) {
        refetch(); // Simple refetch, or update cache directly
      }
    }
  });

  return {
    workOrders: data?.hsWorkOrders?.edges?.map(edge => edge.node) || [],
    loading,
    error,
    createWorkOrder,
    refetch
  };
};
```

## Code Generation

### GraphQL Code Generator Setup

```yaml
# codegen.yml
overwrite: true
schema: "https://api.thorbis.com/v1/graphql"
documents: "src/**/*.graphql"
generates:
  src/generated/graphql.ts:
    plugins:
      - "typescript"
      - "typescript-operations"
      - "typescript-react-apollo"
    config:
      withHooks: true
      withComponent: false
      withHOC: false
      skipTypename: false
      namingConvention:
        typeNames: pascal-case#pascalCase
        enumValues: upper-case#upperCase
```

### Generated Types Usage

```typescript
// Generated types provide full type safety
import { 
  HSWorkOrderStatus,
  WorkOrderPriority,
  useGetHsWorkOrdersQuery,
  useCreateHsWorkOrderMutation 
} from '../generated/graphql';

interface CreateWorkOrderProps {
  customerId: string;
  businessId: string;
}

export const CreateWorkOrderForm: React.FC<CreateWorkOrderProps> = ({
  customerId,
  businessId
}) => {
  const [createWorkOrder] = useCreateHsWorkOrderMutation();

  const handleSubmit = async (formData: WorkOrderFormData) => {
    try {
      const { data } = await createWorkOrder({
        variables: {
          input: {
            customerId,
            title: formData.title,
            description: formData.description,
            serviceType: formData.serviceType,
            priority: WorkOrderPriority.Medium,
            status: HSWorkOrderStatus.Draft
          }
        }
      });
      
      console.log('Created work order:', data?.createHSWorkOrder);
    } catch (error) {
      console.error('Error creating work order:', error);
    }
  };

  // Form implementation...
};
```

## Caching Strategies

### Multi-Level Caching

```typescript
// 1. Query-level caching
const GET_CUSTOMER_WITH_CACHE = gql`
  query GetCustomer($id: ID!) {
    hsCustomer(id: $id) @cached(ttl: 300) {
      id
      firstName
      lastName
      email
      workOrders(pagination: { first: 5 }) {
        edges {
          node {
            id
            title
            status
            scheduledDate
          }
        }
      }
    }
  }
`;

// 2. Field-level caching with different TTLs
const GET_DASHBOARD_DATA = gql`
  query GetDashboardData($businessId: ID!) {
    analytics(businessId: $businessId) @cached(ttl: 600) {
      revenue @cached(ttl: 300) {
        total
        growth
        byPeriod {
          period
          value
        }
      }
      customers @cached(ttl: 60) {
        total
        new
        returning
      }
    }
  }
`;
```

### Cache Update Patterns

```typescript
// Optimistic updates for better UX
const [updateWorkOrderStatus] = useMutation(UPDATE_WORK_ORDER_STATUS, {
  optimisticResponse: (variables) => ({
    updateHSWorkOrder: {
      __typename: 'HSWorkOrder',
      id: variables.id,
      status: variables.status,
      updatedAt: new Date().toISOString()
    }
  }),
  update(cache, { data }) {
    // Update all related queries
    cache.modify({
      id: cache.identify({ __typename: 'HSWorkOrder', id: variables.id }),
      fields: {
        status: () => data?.updateHSWorkOrder?.status
      }
    });
  }
});
```

## Framework Integration

### Next.js App Router Integration

```typescript
// app/providers.tsx
'use client';
import { ApolloClient, ApolloProvider } from '@apollo/client';
import { client } from '../lib/apollo-client';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  );
}

// app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

### Server-Side Data Fetching

```typescript
// app/dashboard/page.tsx
import { getClient } from '../lib/apollo-client-ssr';
import { GET_DASHBOARD_DATA } from '../graphql/dashboard';

export default async function DashboardPage() {
  const client = getClient();
  
  const { data } = await client.query({
    query: GET_DASHBOARD_DATA,
    variables: { businessId: 'business-123' },
    context: {
      headers: {
        authorization: `Bearer ${getServerToken()}`
      }
    }
  });

  return (
    <div>
      <h1>Dashboard</h1>
      <Analytics data={data.analytics} />
    </div>
  );
}
```

## Real-time Features

### WebSocket Subscriptions

```typescript
// Real-time work order tracking
export const useWorkOrderTracking = (businessId: string) => {
  const { data, loading } = useSubscription(
    WORK_ORDER_UPDATES_SUBSCRIPTION,
    {
      variables: { businessId },
      shouldResubscribe: true,
      onSubscriptionData: ({ subscriptionData }) => {
        const update = subscriptionData.data?.workOrderUpdates;
        
        // Show toast notification
        if (update?.status === 'COMPLETED') {
          showNotification({
            title: 'Work Order Completed',
            message: `${update.title} has been completed`,
            type: 'success'
          });
        }
      }
    }
  );

  return { liveUpdates: data?.workOrderUpdates, loading };
};
```

### Live Data Synchronization

```typescript
// Live customer list with real-time updates
const CustomerList: React.FC = () => {
  const { data, loading, refetch } = useQuery(GET_CUSTOMERS);
  
  // Subscribe to customer updates
  useSubscription(CUSTOMER_UPDATES, {
    onSubscriptionData: ({ subscriptionData, client }) => {
      const customerUpdate = subscriptionData.data?.customerUpdates;
      
      if (customerUpdate) {
        // Update Apollo cache directly
        client.cache.modify({
          id: client.cache.identify(customerUpdate),
          fields: {
            // Merge updated fields
            ...customerUpdate
          }
        });
      }
    }
  });

  if (loading) return <LoadingSkeleton />;

  return (
    <div>
      {data?.hsCustomers?.edges.map(({ node: customer }) => (
        <CustomerCard key={customer.id} customer={customer} />
      ))}
    </div>
  );
};
```

## Performance Optimization

### Query Batching and Deduplication

```typescript
import { BatchHttpLink } from '@apollo/client/link/batch-http';

// Batch multiple queries into single HTTP requests
const batchLink = new BatchHttpLink({
  uri: 'https://api.thorbis.com/v1/graphql',
  batchMax: 5, // Max 5 queries per batch
  batchInterval: 20, // Wait 20ms to batch queries
});

const client = new ApolloClient({
  link: batchLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});
```

### Selective Field Querying

```typescript
// Query only needed fields for list views
const GET_CUSTOMERS_LIST = gql`
  query GetCustomersList($businessId: ID!) {
    hsCustomers(businessId: $businessId) {
      edges {
        node {
          id
          firstName
          lastName
          email
          status
          # Don't query heavy fields like workOrders in list view
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

// Query full details only when needed
const GET_CUSTOMER_DETAILS = gql`
  query GetCustomerDetails($id: ID!) {
    hsCustomer(id: $id) {
      id
      firstName
      lastName
      email
      phone
      address {
        street
        city
        state
        zipCode
      }
      workOrders(pagination: { first: 10 }) {
        edges {
          node {
            id
            title
            status
            scheduledDate
            total
          }
        }
      }
      totalSpent
      lastOrderDate
      notes
    }
  }
`;
```

### Memory Management

```typescript
// Cleanup subscriptions and prevent memory leaks
export const useCleanupSubscriptions = () => {
  const subscriptionsRef = useRef<ZenObservable.Subscription[]>([]);

  const addSubscription = (subscription: ZenObservable.Subscription) => {
    subscriptionsRef.current.push(subscription);
  };

  useEffect(() => {
    return () => {
      // Cleanup all subscriptions on component unmount
      subscriptionsRef.current.forEach(sub => sub.unsubscribe());
    };
  }, []);

  return { addSubscription };
};
```

## Testing Integration

### Testing GraphQL Components

```typescript
import { MockedProvider } from '@apollo/client/testing';
import { render, screen, waitFor } from '@testing-library/react';
import { GET_CUSTOMERS } from '../graphql/customers';
import { CustomerList } from '../components/CustomerList';

const mocks = [
  {
    request: {
      query: GET_CUSTOMERS,
      variables: { businessId: 'test-business' }
    },
    result: {
      data: {
        hsCustomers: {
          edges: [
            {
              node: {
                id: '1',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com'
              }
            }
          ]
        }
      }
    }
  }
];

test('renders customer list', async () => {
  render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <CustomerList businessId="test-business" />
    </MockedProvider>
  );

  await waitFor(() => {
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
```

## Best Practices Summary

### Query Design
- Use fragments for reusable field selections
- Implement proper pagination with cursor-based approach
- Query only necessary fields to minimize payload
- Use variables for dynamic queries instead of string interpolation

### Cache Management
- Configure appropriate cache policies for different data types
- Use optimistic updates for better perceived performance
- Implement proper cache invalidation strategies
- Leverage cache normalization for related data

### Error Handling
- Implement comprehensive error boundaries
- Handle network errors gracefully with retry logic
- Provide meaningful error messages to users
- Log errors for monitoring and debugging

### Performance
- Implement query batching for multiple simultaneous queries
- Use subscription cleanup to prevent memory leaks
- Monitor query performance and optimize slow queries
- Implement proper loading states and skeleton screens

This integration guide provides the foundation for building robust, scalable applications with the Thorbis GraphQL API. Each pattern can be adapted to specific industry requirements while maintaining consistency across the platform.