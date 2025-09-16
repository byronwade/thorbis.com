# Thorbis Business OS - Comprehensive GraphQL API Documentation

> **Version**: 3.0.0  
> **Last Updated**: 2025-01-31  
> **Status**: Production Ready  
> **GraphQL Endpoint**: `https://thorbis.com/api/v1/graphql`

## Table of Contents

1. [GraphQL API Overview](#graphql-api-overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [Schema Architecture](#schema-architecture)
4. [Industry-Specific Operations](#industry-specific-operations)
5. [Query & Mutation Examples](#query--mutation-examples)
6. [Subscriptions & Real-time Updates](#subscriptions--real-time-updates)
7. [Error Handling](#error-handling)
8. [Performance Optimization](#performance-optimization)
9. [Integration Patterns](#integration-patterns)
10. [Best Practices](#best-practices)

---

## GraphQL API Overview

### Design Philosophy

The Thorbis Business OS GraphQL API provides a unified, type-safe interface to all business operations across industries while maintaining the same **"Dark-First, Overlay-Free, Industry-Separated, AI-Governed, Blockchain-Verified"** architecture as our REST APIs.

### Key Features

- **Unified Schema**: Single GraphQL endpoint serving all industries (HS, Auto, Restaurant, Retail, Education, Payroll)
- **Type Safety**: Complete TypeScript integration with auto-generated types
- **Real-time Updates**: GraphQL subscriptions for live data synchronization
- **Intelligent Caching**: Field-level caching with @cacheControl directives
- **Industry Separation**: Industry-specific types and resolvers with secure tenant isolation
- **AI Integration**: GraphQL interfaces to AI insights and recommendations
- **Performance Optimized**: DataLoader implementation prevents N+1 queries
- **Security First**: Row-Level Security (RLS) integration with granular permissions

### GraphQL Endpoint

```
Production: https://thorbis.com/api/v1/graphql
GraphiQL:   https://thorbis.com/api/v1/graphql (browser-based IDE)
```

### Core Benefits Over REST

1. **Single Request**: Fetch related data in one query instead of multiple REST calls
2. **Field Selection**: Request only the data you need
3. **Strong Typing**: Complete type safety with schema introspection
4. **Real-time**: Built-in subscription support for live updates
5. **Developer Experience**: Interactive GraphiQL IDE with documentation

---

## Authentication & Authorization

### JWT Authentication

All GraphQL operations require JWT authentication with industry-specific claims:

```typescript
interface GraphQLContext {
  businessId: string        // Tenant ID for data isolation
  userId: string           // Authenticated user ID
  permissions: string[]    // Granular permissions array
  isAuthenticated: boolean // Authentication status
  industry: Industry       // User's primary industry vertical
}
```

### Authorization Headers

```javascript
// GraphQL request headers
{
  "Authorization": "Bearer <jwt_token>",
  "Content-Type": "application/json",
  "Idempotency-Key": "<unique_key>"  // Required for mutations
}
```

### Permission System

GraphQL resolvers enforce the same granular permission system as REST APIs:

```typescript
// Permission patterns: {industry}:{resource}:{action}
const permissions = [
  'hs:work_orders:read',
  'hs:customers:write',
  'auto:repair_orders:read',
  'rest:orders:write'
]
```

---

## Schema Architecture

### Core Schema Structure

The GraphQL schema is modularly organized by domain:

```typescript
// Schema composition
schema = mergeSchemas([
  baseSchema,         // Common types, scalars, interfaces
  coreSchema,         // Tenant, user, role management
  hsSchema,           // Home Services entities
  autoSchema,         // Automotive entities
  restaurantSchema,   // Restaurant entities
  retailSchema,       // Retail entities
  aiSchema,          // AI insights and recommendations
  analyticsSchema,   // Cross-industry analytics
  searchSchema       // Global search capabilities
])
```

### Common Types & Interfaces

```graphql
# Base interfaces for consistency
interface Node {
  id: ID!
}

interface Timestamped {
  createdAt: DateTime!
  updatedAt: DateTime!
}

interface BusinessOwned {
  businessId: ID!
}

# Pagination standard
type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}

# Custom scalars
scalar DateTime
scalar JSON
scalar Upload
```

### Industry-Specific Type Examples

```graphql
# Home Services
type HSWorkOrder implements Node & Timestamped & BusinessOwned {
  id: ID!
  businessId: ID!
  customer: HSCustomer!
  title: String!
  status: WorkOrderStatus!
  priority: WorkOrderPriority!
  scheduledDate: DateTime
  items: [WorkOrderItem!]!
  total: Float!
  createdAt: DateTime!
  updatedAt: DateTime!
}

# Restaurant
type RestOrder implements Node & Timestamped & BusinessOwned {
  id: ID!
  businessId: ID!
  orderNumber: String!
  orderType: RestOrderType!
  status: RestOrderStatus!
  items: [RestOrderItem!]!
  total: Float!
  paymentStatus: PaymentStatus!
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

---

## Industry-Specific Operations

### Home Services GraphQL Operations

#### Query Examples

```graphql
# Fetch work orders with customer details
query GetWorkOrders($pagination: PaginationInput, $filters: [FilterInput!]) {
  hsWorkOrders(pagination: $pagination, filters: $filters) {
    edges {
      node {
        id
        title
        status
        priority
        total
        customer {
          id
          fullName
          email
          phone
        }
        items {
          name
          quantity
          rate
          total
        }
        scheduledDate
        createdAt
      }
      cursor
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    totalCount
  }
}
```

#### Mutation Examples

```graphql
# Create new work order
mutation CreateWorkOrder($input: HSWorkOrderInput!) {
  createHSWorkOrder(input: $input) {
    id
    title
    status
    customer {
      fullName
      phone
    }
    total
    createdAt
  }
}
```

### Auto Services GraphQL Operations

```graphql
# Fetch repair orders with vehicle details
query GetRepairOrders {
  autoRepairOrders(pagination: { first: 20 }) {
    edges {
      node {
        id
        workOrderNumber
        status
        vehicle {
          vin
          year
          make
          model
          mileage
        }
        customer {
          fullName
          phone
        }
        estimatedCompletion
        laborHours
        partsTotal
        grandTotal
      }
    }
    totalCount
  }
}

# Create repair order
mutation CreateRepairOrder($input: AutoRepairOrderInput!) {
  createAutoRepairOrder(input: $input) {
    id
    workOrderNumber
    status
    vehicle {
      vin
      year
      make
      model
    }
    estimatedCompletion
    grandTotal
  }
}
```

### Restaurant GraphQL Operations

```graphql
# Fetch restaurant orders with menu details
query GetRestaurantOrders($status: RestOrderStatus) {
  restOrders(filters: [{ field: "status", operator: EQUALS, value: $status }]) {
    edges {
      node {
        id
        orderNumber
        orderType
        status
        items {
          menuItem {
            name
            category
            price
          }
          quantity
          modifiers {
            name
            price
          }
          total
        }
        subtotal
        tax
        tip
        total
        paymentStatus
        scheduledTime
      }
    }
  }
}

# Create restaurant order
mutation CreateRestaurantOrder($input: RestOrderInput!) {
  createRestOrder(input: $input) {
    id
    orderNumber
    status
    items {
      name
      quantity
      total
    }
    total
    estimatedPrepTime
  }
}
```

### Retail GraphQL Operations

```graphql
# Fetch retail products with inventory
query GetRetailProducts($category: String) {
  retailProducts(filters: [{ field: "category", operator: EQUALS, value: $category }]) {
    edges {
      node {
        id
        name
        description
        sku
        category
        price
        costPrice
        stockQuantity
        active
        attributes
        images
      }
    }
  }
}

# Update product inventory
mutation UpdateProductStock($id: ID!, $input: RetailProductInput!) {
  updateRetailProduct(id: $id, input: $input) {
    id
    name
    sku
    stockQuantity
    updatedAt
  }
}
```

---

## Query & Mutation Examples

### Complex Queries with Relations

```graphql
# Cross-industry customer analytics
query CustomerAnalytics($timeframe: AnalyticsTimeframe!, $industry: String!) {
  analytics(timeframe: $timeframe, industry: $industry) {
    customers {
      total
      new
      returning
      churnRate
      lifetimeValue
      satisfaction
      bySegment {
        segment
        count
        value
      }
    }
    revenue {
      total
      growth
      byPeriod {
        period
        value
      }
      forecast {
        period
        value
      }
    }
  }
}
```

### Batch Operations

```graphql
# Bulk operations example
mutation BulkUpdateWorkOrders($updates: [WorkOrderBulkUpdate!]!) {
  bulkUpdateHSWorkOrders(updates: $updates) {
    successCount
    errorCount
    errors {
      id
      message
    }
    updatedItems {
      id
      status
      updatedAt
    }
  }
}
```

### Search Operations

```graphql
# Global search across industries
query GlobalSearch($input: SearchInput!) {
  globalSearch(input: $input) {
    results {
      industry
      entity
      result {
        data {
          ... on HSCustomer {
            id
            fullName
            email
            totalSpent
          }
          ... on HSWorkOrder {
            id
            title
            status
            total
          }
          ... on RestOrder {
            id
            orderNumber
            status
            total
          }
        }
        meta {
          total
          took
        }
      }
    }
    totalResults
    took
  }
}
```

---

## Subscriptions & Real-time Updates

### Setting Up Subscriptions

```graphql
# Work order status updates
subscription WorkOrderUpdates($businessId: ID!) {
  workOrderUpdates(businessId: $businessId) {
    id
    status
    priority
    assignedTechnician {
      name
      phone
    }
    estimatedCompletion
    updatedAt
  }
}

# Restaurant order updates
subscription OrderUpdates($businessId: ID!) {
  orderUpdates(businessId: $businessId) {
    id
    orderNumber
    status
    items {
      name
      quantity
    }
    updatedAt
  }
}

# System-wide alerts
subscription SystemAlerts {
  systemAlerts {
    level
    message
    timestamp
    source
  }
}
```

### Client Implementation

```typescript
// Apollo Client subscription example
import { useSubscription } from '@apollo/client'

function WorkOrderMonitor({ businessId }: { businessId: string }) {
  const { data, loading } = useSubscription(WORK_ORDER_UPDATES, {
    variables: { businessId }
  })

  React.useEffect(() => {
    if (data?.workOrderUpdates) {
      // Handle real-time work order update
      console.log('Work order updated:', data.workOrderUpdates)
    }
  }, [data])

  return <WorkOrderList />
}
```

---

## Error Handling

### GraphQL Error Format

```graphql
# GraphQL errors follow standard format
{
  "errors": [
    {
      "message": "Customer not found",
      "extensions": {
        "code": "RESOURCE_NOT_FOUND",
        "businessId": "biz_123",
        "requestId": "req_456",
        "timestamp": "2024-01-31T10:00:00Z",
        "path": ["hsCustomer"],
        "suggestedAction": "Verify customer ID exists in your business"
      }
    }
  ],
  "data": null
}
```

### Error Codes

```typescript
enum GraphQLErrorCode {
  // Authentication & Authorization
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  
  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  
  // Business Logic
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  DUPLICATE_RESOURCE = 'DUPLICATE_RESOURCE',
  
  // System
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED'
}
```

### Error Handling in Clients

```typescript
// Apollo Client error handling
import { ApolloError } from '@apollo/client'

function handleGraphQLError(error: ApolloError) {
  error.graphQLErrors.forEach(({ message, extensions }) => {
    switch (extensions?.code) {
      case 'UNAUTHENTICATED':
        redirectToLogin()
        break
      case 'FORBIDDEN':
        showPermissionError()
        break
      case 'VALIDATION_ERROR':
        showValidationErrors(extensions.details)
        break
      default:
        showGenericError(message)
    }
  })
}
```

---

## Performance Optimization

### Caching Directives

```graphql
type Query {
  # Cache customer data for 5 minutes
  hsCustomers: HSCustomerConnection! @cacheControl(maxAge: 300)
  
  # Cache menu items for 10 minutes
  restMenuItems: [RestMenuItem!]! @cacheControl(maxAge: 600)
  
  # Private cache for sensitive data
  user(id: ID!): User @cacheControl(maxAge: 60, scope: PRIVATE)
}
```

### Query Complexity Analysis

```typescript
// Automatic query complexity limits
const complexityLimits = {
  maxComplexity: 1000,      // Maximum query complexity
  maxDepth: 10,             // Maximum query depth
  introspection: true       // Allow schema introspection
}
```

### DataLoader Implementation

```typescript
// Efficient data loading with DataLoader
const workOrderLoader = new DataLoader(async (ids: string[]) => {
  const workOrders = await db.workOrders.findMany({
    where: { id: { in: ids } }
  })
  return ids.map(id => workOrders.find(wo => wo.id === id))
})

// Usage in resolver
const resolvers = {
  HSCustomer: {
    workOrders: (parent) => workOrderLoader.load(parent.customerId)
  }
}
```

### Query Optimization Tips

```graphql
# Good: Specific field selection
query OptimizedQuery {
  hsWorkOrders(pagination: { first: 10 }) {
    edges {
      node {
        id
        title
        status
        total
      }
    }
  }
}

# Avoid: Over-fetching with deep nesting
query AvoidThis {
  hsWorkOrders {
    edges {
      node {
        id
        customer {
          workOrders {
            edges {
              node {
                customer {
                  # This creates N+1 queries
                }
              }
            }
          }
        }
      }
    }
  }
}
```

---

## Integration Patterns

### Apollo Client Setup

```typescript
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'

const httpLink = createHttpLink({
  uri: 'https://thorbis.com/api/v1/graphql'
})

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('thorbis_token')
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
      'idempotency-key': generateIdempotencyKey()
    }
  }
})

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache({
    typePolicies: {
      HSWorkOrder: {
        fields: {
          items: {
            merge: false // Replace array instead of merging
          }
        }
      }
    }
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all'
    }
  }
})
```

### React Integration

```typescript
import { useQuery, useMutation } from '@apollo/client'
import { GET_WORK_ORDERS, CREATE_WORK_ORDER } from './queries'

function WorkOrderList() {
  const { data, loading, error, refetch } = useQuery(GET_WORK_ORDERS, {
    variables: {
      pagination: { first: 20 },
      filters: [{ field: 'status', operator: 'IN', values: ['created', 'assigned'] }]
    },
    pollInterval: 30000 // Refresh every 30 seconds
  })

  const [createWorkOrder] = useMutation(CREATE_WORK_ORDER, {
    onCompleted: () => {
      refetch() // Refresh list after creation
    },
    update: (cache, { data: { createHSWorkOrder } }) => {
      // Optimistic cache update
      cache.modify({
        fields: {
          hsWorkOrders: (existing) => {
            return {
              ...existing,
              edges: [{ node: createHSWorkOrder }, ...existing.edges]
            }
          }
        }
      })
    }
  })

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorDisplay error={error} />

  return (
    <div>
      {data?.hsWorkOrders?.edges?.map(({ node: workOrder }) => (
        <WorkOrderCard key={workOrder.id} workOrder={workOrder} />
      ))}
    </div>
  )
}
```

### Server-Side Integration

```typescript
// Next.js API route with GraphQL
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'

const client = new ApolloClient({
  link: createHttpLink({
    uri: 'https://thorbis.com/api/v1/graphql',
    headers: {
      authorization: `Bearer ${process.env.THORBIS_API_TOKEN}`
    }
  }),
  cache: new InMemoryCache(),
  ssrMode: true
})

export async function getServerSideProps() {
  const { data } = await client.query({
    query: GET_DASHBOARD_DATA,
    variables: { businessId: 'biz_123' }
  })

  return {
    props: {
      dashboardData: data
    }
  }
}
```

---

## Best Practices

### 1. Query Design

```graphql
# Use fragments for reusable field selections
fragment WorkOrderDetails on HSWorkOrder {
  id
  title
  status
  priority
  total
  scheduledDate
  customer {
    id
    fullName
    phone
  }
}

query GetWorkOrders {
  hsWorkOrders {
    edges {
      node {
        ...WorkOrderDetails
      }
    }
  }
}

query GetWorkOrder($id: ID!) {
  hsWorkOrder(id: $id) {
    ...WorkOrderDetails
    description
    items {
      name
      quantity
      rate
    }
  }
}
```

### 2. Error Boundaries

```typescript
import { ErrorBoundary } from 'react-error-boundary'

function GraphQLErrorBoundary({ children }) {
  return (
    <ErrorBoundary
      fallback={<ErrorFallback />}
      onError={(error, errorInfo) => {
        console.error('GraphQL Error:', error)
        // Report to monitoring service
      }}
    >
      {children}
    </ErrorBoundary>
  )
}
```

### 3. Optimistic Updates

```typescript
const [updateWorkOrder] = useMutation(UPDATE_WORK_ORDER, {
  optimisticResponse: (variables) => ({
    updateHSWorkOrder: {
      __typename: 'HSWorkOrder',
      id: variables.id,
      status: variables.input.status,
      updatedAt: new Date().toISOString()
    }
  })
})
```

### 4. Query Batching

```typescript
// Enable automatic query batching
const client = new ApolloClient({
  link: from([
    new BatchHttpLink({
      uri: 'https://thorbis.com/api/v1/graphql',
      batchMax: 5,
      batchInterval: 20
    })
  ])
})
```

### 5. Schema Validation

```typescript
// Client-side schema validation
import { buildClientSchema, validate } from 'graphql'

const schema = buildClientSchema(introspectionResult)

function validateQuery(queryDocument) {
  const errors = validate(schema, queryDocument)
  if (errors.length > 0) {
    throw new Error(`Query validation failed: ${errors.map(e => e.message).join(', ')}`)
  }
}
```

---

## Migration from REST to GraphQL

### Gradual Migration Strategy

1. **Start with Queries**: Replace REST GET requests with GraphQL queries
2. **Add Mutations**: Convert REST POST/PUT/DELETE to GraphQL mutations  
3. **Implement Subscriptions**: Replace polling with real-time subscriptions
4. **Optimize Performance**: Use GraphQL-specific optimizations

### Side-by-Side Comparison

```typescript
// REST approach
const customer = await fetch('/api/v1/hs/customers/123')
const workOrders = await fetch('/api/v1/hs/work-orders?customer_id=123')
const invoices = await fetch('/api/v1/hs/invoices?customer_id=123')

// GraphQL approach
const { customer, workOrders, invoices } = await client.query({
  query: gql`
    query GetCustomerDetails($id: ID!) {
      hsCustomer(id: $id) {
        id
        fullName
        email
        workOrders {
          edges {
            node {
              id
              title
              status
              total
            }
          }
        }
        invoices {
          edges {
            node {
              id
              amount
              status
            }
          }
        }
      }
    }
  `,
  variables: { id: '123' }
})
```

---

## Developer Tools

### 1. GraphiQL IDE

Access the interactive GraphQL IDE at `https://thorbis.com/api/v1/graphql` with features:
- Schema exploration and documentation
- Query composition with autocomplete
- Real-time query validation
- Response formatting and inspection

### 2. Apollo Client DevTools

Browser extension providing:
- Query and mutation inspection
- Cache visualization
- Performance monitoring
- Error tracking

### 3. Code Generation

Generate TypeScript types from GraphQL schema:

```bash
# Install GraphQL Code Generator
npm install @graphql-codegen/cli

# Generate types
graphql-codegen --config codegen.yml
```

```yaml
# codegen.yml
schema: 'https://thorbis.com/api/v1/graphql'
documents: 'src/**/*.graphql'
generates:
  src/generated/graphql.ts:
    plugins:
      - typescript
      - typescript-operations
      - typescript-react-apollo
```

---

## Monitoring & Analytics

### Query Performance Monitoring

```typescript
// Built-in query performance tracking
const performanceMonitoring = {
  logQueries: true,
  slowQueryThreshold: 500,  // Log queries slower than 500ms
  complexityLimit: 1000,    // Reject overly complex queries
  depthLimit: 10           // Maximum query depth
}
```

### Usage Analytics

```graphql
# Query execution metrics
{
  "data": { ... },
  "extensions": {
    "tracing": {
      "version": 1,
      "startTime": "2024-01-31T10:00:00.000Z",
      "endTime": "2024-01-31T10:00:00.150Z",
      "duration": 150000000,
      "execution": {
        "resolvers": [
          {
            "path": ["hsWorkOrders"],
            "parentType": "Query",
            "fieldName": "hsWorkOrders",
            "returnType": "HSWorkOrderConnection!",
            "startOffset": 1000000,
            "duration": 145000000
          }
        ]
      }
    }
  }
}
```

---

## Security Considerations

### Query Depth Limiting

```typescript
// Prevent deeply nested queries that could cause DoS
const depthLimit = require('graphql-depth-limit')(10)

const server = new ApolloServer({
  typeDefs,
  resolvers,
  validationRules: [depthLimit]
})
```

### Query Cost Analysis

```typescript
// Assign costs to different operations
const costAnalysis = createComplexityLimitRule(1000, {
  maximumCost: 1000,
  createError: (max, actual) => {
    return `Query cost ${actual} exceeds maximum cost ${max}`
  }
})
```

### Rate Limiting

```typescript
// GraphQL-specific rate limiting
const rateLimitDirective = new RateLimiterDirective({
  identifyContext: (context) => context.userId,
  formatError: ({ max, window }) => 
    `Too many requests: ${max} per ${window} exceeded`
})
```

---

## Conclusion

The Thorbis Business OS GraphQL API provides a powerful, type-safe, and efficient interface for building modern business applications. With its industry-separated architecture, real-time capabilities, and comprehensive tooling, it enables developers to create sophisticated integrations while maintaining security and performance standards.

### Next Steps

1. **Explore the Schema**: Use GraphiQL to explore available types and operations
2. **Set Up Authentication**: Configure JWT tokens for your industry vertical
3. **Start with Simple Queries**: Begin with basic read operations
4. **Implement Real-time Features**: Add subscriptions for live updates
5. **Optimize Performance**: Use fragments, caching, and query analysis

### Resources

- **GraphiQL IDE**: `https://thorbis.com/api/v1/graphql`
- **Schema Documentation**: Auto-generated from type definitions
- **Developer Support**: `graphql-support@thorbis.com`
- **Community Forum**: `https://community.thorbis.com/graphql`

---

**API Status**: [![API Status](https://img.shields.io/badge/API-Production-green)](https://status.thorbis.com)  
**Schema Version**: v3.0.0  
**Last Updated**: 2025-01-31