# GraphQL Training Materials

> **Version**: 3.0.0  
> **Last Updated**: 2025-01-31  
> **Status**: Production Ready  
> **Target Audience**: Developers, Technical Staff, System Integrators

## Table of Contents

1. [Training Overview](#training-overview)
2. [Learning Paths](#learning-paths)
3. [Module 1: GraphQL Fundamentals](#module-1-graphql-fundamentals)
4. [Module 2: Thorbis GraphQL API](#module-2-thorbis-graphql-api)
5. [Module 3: Client Integration](#module-3-client-integration)
6. [Module 4: Advanced Features](#module-4-advanced-features)
7. [Module 5: Industry-Specific Applications](#module-5-industry-specific-applications)
8. [Module 6: Performance & Security](#module-6-performance--security)
9. [Hands-On Labs](#hands-on-labs)
10. [Assessment & Certification](#assessment--certification)
11. [Advanced Specializations](#advanced-specializations)
12. [Resources & References](#resources--references)

---

## Training Overview

### Training Objectives

Upon completion of this comprehensive GraphQL training program, participants will:

- **Master GraphQL fundamentals** and understand how it differs from REST
- **Navigate the Thorbis GraphQL API** with confidence across all industry verticals
- **Build production-ready applications** using GraphQL clients and best practices
- **Implement real-time features** with GraphQL subscriptions
- **Optimize performance** through caching, batching, and query optimization
- **Apply security best practices** for GraphQL implementations
- **Develop industry-specific solutions** for Home Services, Restaurant, Auto, and Retail sectors

### Prerequisites

- **Basic JavaScript/TypeScript knowledge** (ES6+ features)
- **React experience** (hooks, state management)
- **REST API understanding** (HTTP methods, status codes)
- **JSON handling** and data manipulation
- **Basic understanding** of databases and data relationships

### Training Duration

- **Total Duration**: 5 days (40 hours)
- **Format**: Instructor-led with hands-on labs
- **Schedule**: 8 hours/day with breaks and practical exercises
- **Class Size**: Maximum 12 participants for optimal interaction

---

## Learning Paths

### Path 1: Frontend Developer (React Focus)

**Duration**: 3 days  
**Focus**: Client-side GraphQL integration with React applications

```
Day 1: GraphQL Fundamentals + Thorbis API Overview
Day 2: Apollo Client Integration + React Hooks
Day 3: Real-time Features + Performance Optimization
```

### Path 2: Full-Stack Developer (Complete Coverage)

**Duration**: 5 days  
**Focus**: Complete GraphQL ecosystem including server-side concepts

```
Day 1: GraphQL Fundamentals + Schema Design
Day 2: Thorbis API Deep Dive + Authentication
Day 3: Client Integration (Apollo, urql, Relay)
Day 4: Advanced Features + Real-time Applications
Day 5: Performance, Security + Industry Applications
```

### Path 3: Backend/API Developer (Server Focus)

**Duration**: 4 days  
**Focus**: GraphQL server concepts, schema design, and API optimization

```
Day 1: GraphQL Server Fundamentals + Schema Design
Day 2: Thorbis API Architecture + Security
Day 3: Performance Optimization + Caching
Day 4: Industry-Specific Implementations
```

### Path 4: DevOps/System Administrator (Operations Focus)

**Duration**: 2 days  
**Focus**: GraphQL deployment, monitoring, and operational concerns

```
Day 1: GraphQL Operations + Monitoring
Day 2: Performance Tuning + Security Hardening
```

---

## Module 1: GraphQL Fundamentals

### Learning Objectives

- Understand GraphQL core concepts and advantages over REST
- Learn GraphQL syntax for queries, mutations, and subscriptions  
- Master the GraphQL type system
- Practice with GraphiQL IDE

### 1.1 What is GraphQL?

GraphQL is a query language and runtime for APIs that enables clients to request exactly the data they need.

#### Key Benefits Over REST

```graphql
# REST: Multiple requests needed
# GET /api/customers/123
# GET /api/customers/123/orders
# GET /api/orders/456/items

# GraphQL: Single request
query GetCustomerWithOrders {
  customer(id: "123") {
    id
    name
    email
    orders {
      id
      total
      items {
        name
        price
        quantity
      }
    }
  }
}
```

**Advantages:**
- **Single Request**: Fetch related data in one round trip
- **No Over-fetching**: Request only needed fields
- **Strong Typing**: Schema-driven development with validation
- **Real-time**: Built-in subscription support
- **Developer Experience**: Interactive documentation and tooling

### 1.2 GraphQL Type System

```graphql
# Scalar Types
scalar DateTime
scalar JSON
scalar Upload

# Object Types
type Customer {
  id: ID!                    # Non-null ID
  name: String!              # Non-null String
  email: String
  phone: String
  createdAt: DateTime!
  metadata: JSON
}

# Input Types (for mutations)
input CustomerInput {
  name: String!
  email: String
  phone: String
}

# Enums
enum CustomerStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
}

# Interfaces
interface Node {
  id: ID!
}

# Unions
union SearchResult = Customer | Order | Product
```

### 1.3 Query Structure

#### Basic Query
```graphql
query GetCustomers {
  customers {
    id
    name
    email
  }
}
```

#### Query with Variables
```graphql
query GetCustomer($id: ID!, $includeOrders: Boolean = false) {
  customer(id: $id) {
    id
    name
    email
    orders @include(if: $includeOrders) {
      id
      total
    }
  }
}

# Variables
{
  "id": "123",
  "includeOrders": true
}
```

#### Query with Fragments
```graphql
fragment CustomerDetails on Customer {
  id
  name
  email
  phone
}

query GetCustomers {
  activeCustomers: customers(status: ACTIVE) {
    ...CustomerDetails
  }
  
  inactiveCustomers: customers(status: INACTIVE) {
    ...CustomerDetails
  }
}
```

### 1.4 Mutations

```graphql
mutation CreateCustomer($input: CustomerInput!) {
  createCustomer(input: $input) {
    id
    name
    email
    createdAt
  }
}

# Variables
{
  "input": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1-555-0123"
  }
}
```

### 1.5 Subscriptions

```graphql
subscription CustomerUpdates {
  customerUpdates {
    id
    name
    status
    updatedAt
  }
}
```

### 1.6 Hands-On Exercise 1.1

**Task**: Use GraphiQL to explore the Thorbis GraphQL schema

1. Navigate to `https://thorbis.com/api/v1/graphql`
2. Explore the schema documentation
3. Write your first query to fetch work orders
4. Add customer information to the query
5. Practice with variables and fragments

**Solution**:
```graphql
fragment WorkOrderInfo on HSWorkOrder {
  id
  title
  status
  total
  scheduledDate
}

query GetWorkOrders($status: WorkOrderStatus) {
  hsWorkOrders(filters: [{ field: "status", operator: EQUALS, value: $status }]) {
    edges {
      node {
        ...WorkOrderInfo
        customer {
          id
          fullName
          phone
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

---

## Module 2: Thorbis GraphQL API

### Learning Objectives

- Navigate the Thorbis GraphQL schema structure
- Understand industry-specific types and operations
- Master authentication and authorization
- Learn pagination and filtering patterns

### 2.1 Schema Architecture Overview

```graphql
# Schema composition
schema = mergeSchemas([
  baseSchema,         # Common types, scalars, interfaces
  coreSchema,         # Tenant, user, role management
  hsSchema,           # Home Services entities
  autoSchema,         # Automotive entities
  restaurantSchema,   # Restaurant entities
  retailSchema,       # Retail entities
  aiSchema,          # AI insights and recommendations
  analyticsSchema,   # Cross-industry analytics
  searchSchema       # Global search capabilities
])
```

### 2.2 Authentication & Context

```typescript
// GraphQL context structure
interface GraphQLContext {
  businessId: string        // Tenant ID for data isolation
  userId: string           // Authenticated user ID
  permissions: string[]    // Granular permissions array
  isAuthenticated: boolean // Authentication status
  industry: Industry       // User's primary industry vertical
}

// Request headers
{
  "Authorization": "Bearer <jwt_token>",
  "X-Business-ID": "<business_id>",
  "Idempotency-Key": "<unique_key>"  // Required for mutations
}
```

### 2.3 Industry-Specific Types

#### Home Services Schema
```graphql
type HSWorkOrder implements Node & Timestamped & BusinessOwned {
  id: ID!
  businessId: ID!
  customer: HSCustomer!
  title: String!
  description: String
  status: WorkOrderStatus!
  priority: WorkOrderPriority!
  scheduledDate: DateTime
  items: [WorkOrderItem!]!
  technician: HSEmployee
  total: Float!
  createdAt: DateTime!
  updatedAt: DateTime!
}

enum WorkOrderStatus {
  CREATED
  ASSIGNED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum WorkOrderPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}
```

#### Restaurant Schema
```graphql
type RestOrder implements Node & Timestamped & BusinessOwned {
  id: ID!
  businessId: ID!
  orderNumber: String!
  orderType: RestOrderType!
  status: RestOrderStatus!
  items: [RestOrderItem!]!
  subtotal: Float!
  tax: Float!
  tip: Float
  total: Float!
  paymentStatus: PaymentStatus!
  scheduledTime: DateTime
  createdAt: DateTime!
  updatedAt: DateTime!
}

enum RestOrderType {
  DINE_IN
  TAKEOUT
  DELIVERY
}
```

### 2.4 Pagination Patterns

```graphql
# Cursor-based pagination
type HSWorkOrderConnection {
  edges: [HSWorkOrderEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type HSWorkOrderEdge {
  node: HSWorkOrder!
  cursor: String!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}

# Usage
query GetWorkOrders($first: Int, $after: String) {
  hsWorkOrders(pagination: { first: $first, after: $after }) {
    edges {
      node {
        id
        title
        status
      }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

### 2.5 Filtering System

```graphql
input FilterInput {
  field: String!
  operator: FilterOperator!
  value: String
  values: [String!]
}

enum FilterOperator {
  EQUALS
  NOT_EQUALS
  IN
  NOT_IN
  CONTAINS
  GREATER_THAN
  LESS_THAN
  GREATER_THAN_OR_EQUAL
  LESS_THAN_OR_EQUAL
}

# Usage
query FilteredWorkOrders {
  hsWorkOrders(
    filters: [
      { field: "status", operator: IN, values: ["CREATED", "ASSIGNED"] }
      { field: "priority", operator: EQUALS, value: "HIGH" }
      { field: "total", operator: GREATER_THAN, value: "1000" }
    ]
  ) {
    edges {
      node {
        id
        title
        status
        priority
        total
      }
    }
  }
}
```

### 2.6 Hands-On Exercise 2.1

**Task**: Build a comprehensive work order query with filters and pagination

1. Query work orders with specific status filters
2. Include customer and technician information
3. Add pagination with proper cursor handling
4. Apply sorting by creation date

**Solution**:
```graphql
query GetWorkOrdersWithPagination(
  $first: Int = 20,
  $after: String,
  $status: [WorkOrderStatus!],
  $priority: WorkOrderPriority
) {
  hsWorkOrders(
    pagination: { first: $first, after: $after }
    filters: [
      { field: "status", operator: IN, values: $status }
      { field: "priority", operator: EQUALS, value: $priority }
    ]
    orderBy: { field: CREATED_AT, direction: DESC }
  ) {
    edges {
      node {
        id
        title
        description
        status
        priority
        customer {
          id
          fullName
          phone
          email
          address {
            street
            city
            state
            zip
          }
        }
        technician {
          id
          fullName
          phone
        }
        items {
          name
          description
          quantity
          rate
          total
        }
        scheduledDate
        total
        createdAt
        updatedAt
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

---

## Module 3: Client Integration

### Learning Objectives

- Set up Apollo Client with authentication
- Implement React hooks for GraphQL operations
- Handle loading states and errors gracefully
- Build reusable GraphQL components

### 3.1 Apollo Client Setup

```typescript
// apollo-client.ts
import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'

const httpLink = createHttpLink({
  uri: 'https://thorbis.com/api/v1/graphql'
})

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('thorbis_token')
  const businessId = localStorage.getItem('thorbis_business_id')

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
      'x-business-id': businessId || '',
      'idempotency-key': generateIdempotencyKey()
    }
  }
})

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, extensions }) => {
      if (extensions?.code === 'UNAUTHENTICATED') {
        // Redirect to login
        window.location.href = '/login'
      }
    })
  }
})

export const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          hsWorkOrders: {
            keyArgs: ['filters'],
            merge: paginationMerge
          }
        }
      }
    }
  })
})
```

### 3.2 React Integration Patterns

#### Basic Query Hook
```typescript
import { useQuery } from '@apollo/client'
import { GET_WORK_ORDERS } from '../graphql/queries'

function WorkOrderList() {
  const { data, loading, error, refetch } = useQuery(GET_WORK_ORDERS, {
    variables: {
      pagination: { first: 20 },
      filters: [{ field: 'status', operator: 'IN', values: ['CREATED', 'ASSIGNED'] }]
    }
  })

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} onRetry={refetch} />

  return (
    <div className="work-order-list">
      {data?.hsWorkOrders?.edges?.map(({ node: workOrder }) => (
        <WorkOrderCard key={workOrder.id} workOrder={workOrder} />
      ))}
    </div>
  )
}
```

#### Custom Hooks Pattern
```typescript
// hooks/use-work-orders.ts
import { useQuery, useMutation } from '@apollo/client'
import { GET_WORK_ORDERS, CREATE_WORK_ORDER } from '../graphql/work-orders'

export function useWorkOrders(filters = []) {
  const { data, loading, error, fetchMore, refetch } = useQuery(GET_WORK_ORDERS, {
    variables: { 
      pagination: { first: 20 },
      filters 
    },
    notifyOnNetworkStatusChange: true
  })

  const loadMore = () => {
    if (data?.hsWorkOrders?.pageInfo?.hasNextPage) {
      fetchMore({
        variables: {
          pagination: {
            first: 20,
            after: data.hsWorkOrders.pageInfo.endCursor
          }
        }
      })
    }
  }

  return {
    workOrders: data?.hsWorkOrders?.edges?.map(edge => edge.node) || [],
    loading,
    error,
    loadMore,
    hasMore: data?.hsWorkOrders?.pageInfo?.hasNextPage || false,
    refetch
  }
}

export function useCreateWorkOrder() {
  const [createWorkOrder, { loading, error }] = useMutation(CREATE_WORK_ORDER, {
    update: (cache, { data: { createHSWorkOrder } }) => {
      cache.modify({
        fields: {
          hsWorkOrders: (existing) => {
            const newEdge = { 
              node: createHSWorkOrder, 
              __typename: 'HSWorkOrderEdge' 
            }
            return {
              ...existing,
              edges: [newEdge, ...existing.edges]
            }
          }
        }
      })
    }
  })

  return { createWorkOrder, loading, error }
}
```

### 3.3 Error Handling Strategies

```typescript
// components/error-boundary.tsx
import React from 'react'
import { ApolloError } from '@apollo/client'

interface ErrorBoundaryProps {
  error: ApolloError
  retry?: () => void
}

export function GraphQLErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  const handleError = (error: ApolloError) => {
    return error.graphQLErrors.map(({ message, extensions }) => {
      switch (extensions?.code) {
        case 'UNAUTHENTICATED':
          return 'Please log in to access this resource'
        case 'FORBIDDEN':
          return 'You do not have permission to access this resource'
        case 'VALIDATION_ERROR':
          return `Validation error: ${extensions.details}`
        case 'RESOURCE_NOT_FOUND':
          return 'The requested resource was not found'
        default:
          return message
      }
    })
  }

  const errorMessages = handleError(error)

  return (
    <div className="error-container">
      <h3>Something went wrong</h3>
      <ul>
        {errorMessages.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
      {retry && (
        <button onClick={retry} className="retry-button">
          Try Again
        </button>
      )}
    </div>
  )
}
```

### 3.4 Loading States

```typescript
// components/loading-states.tsx
import React from 'react'

export function LoadingSpinner() {
  return (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <p>Loading...</p>
    </div>
  )
}

export function WorkOrderSkeleton() {
  return (
    <div className="work-order-skeleton">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="skeleton-card">
          <div className="skeleton-title"></div>
          <div className="skeleton-customer"></div>
          <div className="skeleton-amount"></div>
        </div>
      ))}
    </div>
  )
}

// Usage with conditional rendering
function WorkOrderList() {
  const { workOrders, loading, error } = useWorkOrders()

  if (loading) return <WorkOrderSkeleton />
  if (error) return <GraphQLErrorBoundary error={error} />
  if (workOrders.length === 0) return <EmptyState />

  return (
    <div className="work-order-list">
      {workOrders.map(workOrder => (
        <WorkOrderCard key={workOrder.id} workOrder={workOrder} />
      ))}
    </div>
  )
}
```

### 3.5 Hands-On Exercise 3.1

**Task**: Build a complete work order management component

1. Create a work order list with pagination
2. Add filtering by status and priority  
3. Implement create work order functionality
4. Add proper error handling and loading states

**Solution**:
```typescript
// components/work-order-manager.tsx
import React, { useState } from 'react'
import { useWorkOrders, useCreateWorkOrder } from '../hooks/use-work-orders'

export function WorkOrderManager() {
  const [statusFilter, setStatusFilter] = useState(['CREATED', 'ASSIGNED'])
  const [priorityFilter, setPriorityFilter] = useState('')
  
  const filters = [
    { field: 'status', operator: 'IN', values: statusFilter },
    ...(priorityFilter ? [{ field: 'priority', operator: 'EQUALS', value: priorityFilter }] : [])
  ]

  const { workOrders, loading, error, loadMore, hasMore } = useWorkOrders(filters)
  const { createWorkOrder, loading: creating } = useCreateWorkOrder()

  const handleCreateWorkOrder = async (workOrderData) => {
    try {
      await createWorkOrder({
        variables: { input: workOrderData }
      })
      // Success notification would go here
    } catch (error) {
      console.error('Failed to create work order:', error)
    }
  }

  return (
    <div className="work-order-manager">
      <div className="filters">
        <WorkOrderFilters
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          priorityFilter={priorityFilter}
          onPriorityChange={setPriorityFilter}
        />
      </div>

      <div className="actions">
        <CreateWorkOrderForm
          onSubmit={handleCreateWorkOrder}
          loading={creating}
        />
      </div>

      <div className="list">
        <WorkOrderList
          workOrders={workOrders}
          loading={loading}
          error={error}
          onLoadMore={loadMore}
          hasMore={hasMore}
        />
      </div>
    </div>
  )
}
```

---

## Module 4: Advanced Features

### Learning Objectives

- Implement real-time updates with GraphQL subscriptions
- Optimize performance with caching strategies
- Handle complex mutations and optimistic updates
- Build advanced UI patterns with GraphQL

### 4.1 GraphQL Subscriptions

#### Setting Up WebSocket Connection
```typescript
// subscription-client.ts
import { createClient } from 'graphql-ws'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'

const wsClient = createClient({
  url: 'wss://thorbis.com/api/v1/graphql',
  connectionParams: () => ({
    Authorization: `Bearer ${getAuthToken()}`,
    'X-Business-ID': getBusinessId()
  }),
  retryAttempts: 5,
  shouldRetry: (errOrCloseEvent) => {
    return [1006, 1011, 1012, 1013].includes(errOrCloseEvent?.code)
  }
})

const subscriptionLink = new GraphQLWsLink(wsClient)

// Use subscription link for subscriptions, HTTP for queries/mutations
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    )
  },
  subscriptionLink,
  httpLink
)
```

#### Real-time Work Order Updates
```typescript
// components/real-time-work-orders.tsx
import React, { useEffect } from 'react'
import { useSubscription, useQuery } from '@apollo/client'
import { WORK_ORDER_UPDATES } from '../graphql/subscriptions'

export function RealTimeWorkOrders({ businessId }) {
  const { data: workOrders } = useQuery(GET_WORK_ORDERS, {
    variables: { businessId }
  })

  const { data: updateData } = useSubscription(WORK_ORDER_UPDATES, {
    variables: { businessId },
    onSubscriptionData: ({ subscriptionData, client }) => {
      const updatedWorkOrder = subscriptionData.data?.workOrderUpdates
      
      if (updatedWorkOrder) {
        // Update Apollo cache
        client.cache.modify({
          id: client.cache.identify(updatedWorkOrder),
          fields: {
            status: () => updatedWorkOrder.status,
            updatedAt: () => updatedWorkOrder.updatedAt
          }
        })

        // Show notification
        showNotification(
          `Work order ${updatedWorkOrder.title} updated to ${updatedWorkOrder.status}`
        )
      }
    }
  })

  return (
    <div className="real-time-work-orders">
      {workOrders?.hsWorkOrders?.edges?.map(({ node }) => (
        <WorkOrderCard
          key={node.id}
          workOrder={node}
          isUpdating={updateData?.workOrderUpdates?.id === node.id}
        />
      ))}
    </div>
  )
}

// GraphQL subscription
const WORK_ORDER_UPDATES = gql`
  subscription WorkOrderUpdates($businessId: ID!) {
    workOrderUpdates(businessId: $businessId) {
      id
      title
      status
      priority
      assignedTechnician {
        id
        fullName
      }
      updatedAt
    }
  }
`
```

### 4.2 Optimistic Updates

```typescript
// hooks/use-optimistic-updates.ts
import { useMutation } from '@apollo/client'
import { UPDATE_WORK_ORDER_STATUS } from '../graphql/mutations'

export function useUpdateWorkOrderStatus() {
  const [updateStatus, { loading, error }] = useMutation(UPDATE_WORK_ORDER_STATUS, {
    optimisticResponse: (variables) => ({
      updateHSWorkOrderStatus: {
        __typename: 'HSWorkOrder',
        id: variables.id,
        status: variables.status,
        updatedAt: new Date().toISOString()
      }
    }),
    update: (cache, { data: { updateHSWorkOrderStatus } }) => {
      // Update the cache optimistically
      cache.modify({
        id: cache.identify(updateHSWorkOrderStatus),
        fields: {
          status: () => updateHSWorkOrderStatus.status,
          updatedAt: () => updateHSWorkOrderStatus.updatedAt
        }
      })
    },
    onError: (error, variables) => {
      // Revert optimistic update on error
      console.error('Failed to update work order status:', error)
      
      // Could implement rollback logic here
      showErrorNotification('Failed to update status. Please try again.')
    }
  })

  return { updateStatus, loading, error }
}

// Usage in component
function WorkOrderStatusButton({ workOrder }) {
  const { updateStatus, loading } = useUpdateWorkOrderStatus()

  const handleStatusChange = (newStatus) => {
    updateStatus({
      variables: {
        id: workOrder.id,
        status: newStatus
      }
    })
  }

  return (
    <button
      onClick={() => handleStatusChange('IN_PROGRESS')}
      disabled={loading}
      className={`status-button ${loading ? 'updating' : ''}`}
    >
      {loading ? 'Updating...' : 'Start Work'}
    </button>
  )
}
```

### 4.3 Complex Cache Management

```typescript
// cache-management.ts
import { InMemoryCache, Reference } from '@apollo/client'

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        hsWorkOrders: {
          keyArgs: ['filters', 'orderBy'],
          merge: (existing, incoming, { args }) => {
            // Handle pagination merge
            if (!existing) return incoming
            
            if (args?.pagination?.after) {
              // Load more - append new edges
              return {
                ...incoming,
                edges: [...existing.edges, ...incoming.edges]
              }
            } else {
              // New query - replace existing
              return incoming
            }
          }
        }
      }
    },
    HSWorkOrder: {
      fields: {
        items: {
          merge: false // Replace array completely
        },
        customer: {
          merge: (existing, incoming) => {
            // Deep merge customer data
            return { ...existing, ...incoming }
          }
        }
      }
    }
  }
})

// Cache manipulation utilities
export class CacheManager {
  constructor(private cache: InMemoryCache) {}

  addWorkOrderToList(newWorkOrder: any, filters: any[]) {
    this.cache.modify({
      fields: {
        hsWorkOrders: (existing, { readField }) => {
          const newEdge = {
            node: newWorkOrder,
            cursor: newWorkOrder.id,
            __typename: 'HSWorkOrderEdge'
          }
          
          return {
            ...existing,
            edges: [newEdge, ...existing.edges],
            totalCount: existing.totalCount + 1
          }
        }
      }
    })
  }

  removeWorkOrderFromList(workOrderId: string) {
    this.cache.modify({
      fields: {
        hsWorkOrders: (existing, { readField }) => {
          return {
            ...existing,
            edges: existing.edges.filter(
              edge => readField('id', edge.node) !== workOrderId
            ),
            totalCount: existing.totalCount - 1
          }
        }
      }
    })
  }

  updateWorkOrderInPlace(workOrderId: string, updates: any) {
    this.cache.modify({
      id: this.cache.identify({ __typename: 'HSWorkOrder', id: workOrderId }),
      fields: {
        ...Object.keys(updates).reduce((acc, key) => {
          acc[key] = () => updates[key]
          return acc
        }, {})
      }
    })
  }
}
```

### 4.4 Hands-On Exercise 4.1

**Task**: Implement a real-time work order dashboard with optimistic updates

1. Set up GraphQL subscriptions for real-time updates
2. Implement optimistic updates for status changes
3. Add proper cache management
4. Handle connection errors gracefully

**Solution**:
```typescript
// components/real-time-dashboard.tsx
import React, { useState, useEffect } from 'react'
import { useQuery, useSubscription, useMutation } from '@apollo/client'

export function RealTimeDashboard({ businessId }) {
  const [connectionStatus, setConnectionStatus] = useState('connecting')
  
  // Initial data load
  const { data, loading, error } = useQuery(GET_DASHBOARD_DATA, {
    variables: { businessId }
  })

  // Real-time updates
  const { data: updates, error: subscriptionError } = useSubscription(
    DASHBOARD_UPDATES, 
    {
      variables: { businessId },
      onSubscriptionComplete: () => setConnectionStatus('connected'),
      onSubscriptionError: () => setConnectionStatus('error')
    }
  )

  // Status update mutation with optimistic response
  const [updateStatus] = useMutation(UPDATE_WORK_ORDER_STATUS, {
    optimisticResponse: (variables) => ({
      updateHSWorkOrderStatus: {
        __typename: 'HSWorkOrder',
        id: variables.id,
        status: variables.status,
        updatedAt: new Date().toISOString()
      }
    })
  })

  const handleStatusUpdate = async (workOrderId, newStatus) => {
    try {
      await updateStatus({
        variables: { id: workOrderId, status: newStatus }
      })
    } catch (error) {
      console.error('Status update failed:', error)
    }
  }

  if (loading) return <DashboardSkeleton />
  if (error) return <ErrorBoundary error={error} />

  return (
    <div className="real-time-dashboard">
      <div className="connection-status">
        <ConnectionIndicator status={connectionStatus} />
      </div>
      
      <div className="dashboard-content">
        <WorkOrderQueue
          workOrders={data?.activeWorkOrders}
          onStatusUpdate={handleStatusUpdate}
        />
        <TechnicianMap
          technicians={data?.activeTechnicians}
        />
        <RevenueMetrics
          metrics={data?.todayMetrics}
        />
      </div>
    </div>
  )
}

const DASHBOARD_UPDATES = gql`
  subscription DashboardUpdates($businessId: ID!) {
    workOrderUpdates(businessId: $businessId) {
      id
      status
      priority
      technician {
        id
        location
      }
      updatedAt
    }
    
    revenueUpdates(businessId: $businessId) {
      total
      todayTotal
      updatedAt
    }
  }
`
```

---

## Module 5: Industry-Specific Applications

### Learning Objectives

- Build Home Services dispatch application
- Create Restaurant kitchen display system
- Develop Auto Services work order management
- Implement Retail inventory management

### 5.1 Home Services: Dispatch Application

```typescript
// home-services/dispatch-app.tsx
import React, { useState } from 'react'
import { useQuery, useMutation, useSubscription } from '@apollo/client'

export function DispatchApplication() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [filterStatus, setFilterStatus] = useState(['ASSIGNED', 'IN_PROGRESS'])

  // Get work orders for the day
  const { data, loading } = useQuery(GET_SCHEDULED_WORK_ORDERS, {
    variables: {
      date: selectedDate.toISOString().split('T')[0],
      status: filterStatus
    },
    pollInterval: 30000 // Refresh every 30 seconds
  })

  // Real-time updates
  const { data: updates } = useSubscription(WORK_ORDER_LOCATION_UPDATES, {
    variables: { date: selectedDate.toISOString().split('T')[0] }
  })

  // Assign technician mutation
  const [assignTechnician] = useMutation(ASSIGN_TECHNICIAN_TO_WORK_ORDER, {
    optimisticResponse: (variables) => ({
      assignTechnicianToWorkOrder: {
        __typename: 'HSWorkOrder',
        id: variables.workOrderId,
        assignedTechnician: {
          __typename: 'HSEmployee',
          id: variables.technicianId,
          fullName: 'Assigning...'
        }
      }
    })
  })

  const handleTechnicianAssignment = (workOrderId, technicianId) => {
    assignTechnician({
      variables: { workOrderId, technicianId }
    })
  }

  return (
    <div className="dispatch-app">
      <div className="dispatch-header">
        <DateSelector
          selectedDate={selectedDate}
          onChange={setSelectedDate}
        />
        <StatusFilter
          selectedStatuses={filterStatus}
          onChange={setFilterStatus}
        />
      </div>

      <div className="dispatch-layout">
        <div className="work-order-queue">
          <h3>Work Orders</h3>
          {data?.scheduledWorkOrders?.map(workOrder => (
            <WorkOrderDispatchCard
              key={workOrder.id}
              workOrder={workOrder}
              onAssignTechnician={handleTechnicianAssignment}
            />
          ))}
        </div>

        <div className="technician-map">
          <TechnicianLocationMap
            technicians={data?.activeTechnicians}
            workOrders={data?.scheduledWorkOrders}
          />
        </div>

        <div className="dispatch-metrics">
          <DispatchMetrics
            metrics={data?.dispatchMetrics}
          />
        </div>
      </div>
    </div>
  )
}

const GET_SCHEDULED_WORK_ORDERS = gql`
  query GetScheduledWorkOrders($date: String!, $status: [WorkOrderStatus!]) {
    scheduledWorkOrders(date: $date, status: $status) {
      id
      title
      priority
      status
      scheduledDate
      estimatedDuration
      customer {
        id
        fullName
        phone
        address {
          street
          city
          coordinates
        }
      }
      assignedTechnician {
        id
        fullName
        phone
        currentLocation
        skills
      }
      items {
        name
        estimatedTime
      }
    }
    
    activeTechnicians {
      id
      fullName
      currentLocation
      status
      activeWorkOrder {
        id
        title
      }
    }
    
    dispatchMetrics {
      totalWorkOrders
      completedToday
      averageResponseTime
      technicianUtilization
    }
  }
`
```

### 5.2 Restaurant: Kitchen Display System

```typescript
// restaurant/kitchen-display.tsx
import React, { useEffect, useState } from 'react'
import { useSubscription, useMutation } from '@apollo/client'

export function KitchenDisplaySystem({ stationId }) {
  const [orderQueue, setOrderQueue] = useState([])
  const [completedOrders, setCompletedOrders] = useState([])

  // Real-time order updates
  const { data } = useSubscription(KITCHEN_ORDER_STREAM, {
    variables: { stationId },
    onSubscriptionData: ({ subscriptionData }) => {
      const order = subscriptionData.data?.kitchenOrderStream
      if (order) {
        updateOrderQueue(order)
        playNotificationIfNeeded(order)
      }
    }
  })

  // Update order status
  const [updateOrderStatus] = useMutation(UPDATE_KITCHEN_ORDER_STATUS, {
    optimisticResponse: (variables) => ({
      updateKitchenOrderStatus: {
        __typename: 'RestOrder',
        id: variables.orderId,
        status: variables.status,
        updatedAt: new Date().toISOString()
      }
    })
  })

  const updateOrderQueue = (updatedOrder) => {
    if (updatedOrder.status === 'COMPLETED') {
      setCompletedOrders(prev => [updatedOrder, ...prev.slice(0, 9)])
      setOrderQueue(prev => prev.filter(order => order.id !== updatedOrder.id))
    } else {
      setOrderQueue(prev => {
        const existing = prev.findIndex(order => order.id === updatedOrder.id)
        if (existing >= 0) {
          const newQueue = [...prev]
          newQueue[existing] = updatedOrder
          return newQueue
        }
        return [updatedOrder, ...prev]
      })
    }
  }

  const playNotificationIfNeeded = (order) => {
    if (order.status === 'PENDING' && !order.previouslyNotified) {
      playNewOrderSound()
    }
  }

  const handleStatusChange = (orderId, newStatus) => {
    updateOrderStatus({
      variables: { orderId, status: newStatus }
    })
  }

  const getOrderPriorityClass = (order) => {
    const elapsed = Date.now() - new Date(order.createdAt).getTime()
    const target = order.estimatedPrepTime * 60 * 1000

    if (elapsed > target * 1.2) return 'priority-critical'
    if (elapsed > target) return 'priority-warning'
    return 'priority-normal'
  }

  return (
    <div className="kitchen-display">
      <div className="display-header">
        <h2>Kitchen Display - {getStationName(stationId)}</h2>
        <div className="queue-stats">
          <span>Active: {orderQueue.length}</span>
          <span>Completed: {completedOrders.length}</span>
        </div>
      </div>

      <div className="order-grid">
        {orderQueue.map(order => (
          <div
            key={order.id}
            className={`order-ticket ${getOrderPriorityClass(order)}`}
          >
            <div className="order-header">
              <span className="order-number">#{order.orderNumber}</span>
              <span className="order-type">{order.orderType}</span>
              <span className="elapsed-time">
                {formatElapsedTime(order.createdAt)}
              </span>
            </div>

            <div className="order-items">
              {order.items.map(item => (
                <div key={item.id} className="order-item">
                  <div className="item-main">
                    <span className="quantity">{item.quantity}x</span>
                    <span className="name">{item.menuItem.name}</span>
                  </div>
                  
                  {item.modifiers?.length > 0 && (
                    <div className="modifiers">
                      {item.modifiers.map(mod => (
                        <span key={mod.id} className="modifier">
                          {mod.name}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {item.specialInstructions && (
                    <div className="instructions">
                      {item.specialInstructions}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="order-actions">
              <button
                onClick={() => handleStatusChange(order.id, 'IN_PREPARATION')}
                disabled={order.status !== 'PENDING'}
                className="btn-start"
              >
                Start
              </button>
              <button
                onClick={() => handleStatusChange(order.id, 'READY')}
                disabled={order.status !== 'IN_PREPARATION'}
                className="btn-ready"
              >
                Ready
              </button>
              <button
                onClick={() => handleStatusChange(order.id, 'COMPLETED')}
                disabled={order.status !== 'READY'}
                className="btn-complete"
              >
                Served
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="completed-orders">
        <h3>Recently Completed</h3>
        <div className="completed-list">
          {completedOrders.map(order => (
            <div key={order.id} className="completed-order">
              #{order.orderNumber} - {formatTime(order.updatedAt)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const KITCHEN_ORDER_STREAM = gql`
  subscription KitchenOrderStream($stationId: ID!) {
    kitchenOrderStream(stationId: $stationId) {
      id
      orderNumber
      orderType
      status
      items {
        id
        quantity
        menuItem {
          id
          name
          category
          cookingInstructions
        }
        modifiers {
          id
          name
          type
        }
        specialInstructions
        allergens
      }
      estimatedPrepTime
      createdAt
      updatedAt
      previouslyNotified
    }
  }
`
```

### 5.3 Hands-On Exercise 5.1

**Task**: Build a retail POS system with inventory integration

1. Create product search and selection interface
2. Implement real-time inventory updates
3. Add shopping cart with automatic price calculation
4. Handle payment processing workflow

**Solution**:
```typescript
// retail/pos-system.tsx
import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useSubscription } from '@apollo/client'

export function RetailPOSSystem() {
  const [cart, setCart] = useState([])
  const [customer, setCustomer] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('CASH')

  // Product search
  const [searchTerm, setSearchTerm] = useState('')
  const { data: products } = useQuery(SEARCH_PRODUCTS, {
    variables: { search: searchTerm },
    skip: searchTerm.length < 2
  })

  // Real-time inventory updates
  const { data: inventoryUpdates } = useSubscription(INVENTORY_UPDATES, {
    onSubscriptionData: ({ subscriptionData }) => {
      const update = subscriptionData.data?.inventoryUpdates
      if (update && cart.some(item => item.product.id === update.productId)) {
        updateCartWithNewInventory(update)
      }
    }
  })

  // Process sale mutation
  const [processSale, { loading: processing }] = useMutation(PROCESS_RETAIL_SALE, {
    onCompleted: (data) => {
      printReceipt(data.processRetailSale)
      setCart([])
      setCustomer(null)
    }
  })

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.product.id === product.id)
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, { product, quantity: 1 }])
    }
  }

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product.id !== productId))
  }

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId)
    } else {
      setCart(cart.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      ))
    }
  }

  const calculateTotal = () => {
    const subtotal = cart.reduce((sum, item) => 
      sum + (item.product.price * item.quantity), 0
    )
    const tax = subtotal * 0.08 // 8% tax
    return { subtotal, tax, total: subtotal + tax }
  }

  const handleCheckout = async () => {
    const { total } = calculateTotal()
    
    try {
      await processSale({
        variables: {
          input: {
            customerId: customer?.id,
            items: cart.map(item => ({
              productId: item.product.id,
              quantity: item.quantity,
              price: item.product.price
            })),
            paymentMethod,
            total
          }
        }
      })
    } catch (error) {
      console.error('Sale processing failed:', error)
    }
  }

  return (
    <div className="pos-system">
      <div className="product-search">
        <ProductSearch
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          products={products?.searchProducts}
          onAddToCart={addToCart}
        />
      </div>

      <div className="cart-section">
        <ShoppingCart
          cart={cart}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeFromCart}
        />
        
        <div className="cart-totals">
          <CartTotals totals={calculateTotal()} />
        </div>

        <div className="customer-section">
          <CustomerSelector
            customer={customer}
            onCustomerChange={setCustomer}
          />
        </div>

        <div className="payment-section">
          <PaymentMethodSelector
            selectedMethod={paymentMethod}
            onMethodChange={setPaymentMethod}
          />
          
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || processing}
            className="checkout-button"
          >
            {processing ? 'Processing...' : `Checkout $${calculateTotal().total.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  )
}
```

---

## Module 6: Performance & Security

### Learning Objectives

- Implement query optimization techniques
- Set up proper caching strategies
- Apply GraphQL security best practices
- Monitor and debug performance issues

### 6.1 Query Optimization

#### Fragment Composition
```graphql
# Reusable fragments
fragment CustomerBasic on HSCustomer {
  id
  fullName
  email
  phone
}

fragment CustomerDetailed on HSCustomer {
  ...CustomerBasic
  address {
    street
    city
    state
    zip
  }
  totalSpent
  preferredTechnician {
    id
    fullName
  }
}

# Efficient query composition
query GetWorkOrdersOptimized($includeCustomerDetails: Boolean = false) {
  hsWorkOrders(pagination: { first: 20 }) {
    edges {
      node {
        id
        title
        status
        total
        customer @include(if: $includeCustomerDetails) {
          ...CustomerDetailed
        }
        customer @skip(if: $includeCustomerDetails) {
          ...CustomerBasic
        }
      }
    }
  }
}
```

#### Query Complexity Analysis
```typescript
// query-complexity.ts
import { createComplexityLimitRule } from 'graphql-query-complexity'

const complexityLimitRule = createComplexityLimitRule(1000, {
  // Field complexity scoring
  fieldComplexity: (args, childComplexity) => {
    // Simple fields
    if (childComplexity === 0) return 1
    
    // List fields with pagination
    if (args.first || args.last) {
      const limit = args.first || args.last || 10
      return Math.min(limit, 100) * childComplexity
    }
    
    // Regular nested fields
    return childComplexity + 1
  },
  
  // Error handling
  onComplete: (complexity) => {
    console.log(`Query complexity: ${complexity}`)
  },
  
  createError: (max, actual) => {
    return new Error(`Query complexity ${actual} exceeds maximum ${max}`)
  }
})

// Usage in Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  validationRules: [complexityLimitRule]
})
```

### 6.2 Caching Strategies

#### Multi-Level Caching
```typescript
// advanced-cache.ts
import { InMemoryCache, FieldPolicy } from '@apollo/client'
import LRUCache from 'lru-cache'

// L1: Memory cache (React state/context)
// L2: Apollo InMemoryCache
// L3: Browser storage
// L4: CDN/Server cache

class MultiLevelCache {
  private l1Cache = new LRUCache<string, any>({ max: 100 })
  private l3Storage = localStorage

  // Field policy with multi-level caching
  createFieldPolicy<T>(
    key: string,
    ttl: number = 300000 // 5 minutes
  ): FieldPolicy<T> {
    return {
      read: (existing, { args, readField }) => {
        const cacheKey = `${key}-${JSON.stringify(args)}`
        
        // Check L1 cache first
        const l1Data = this.l1Cache.get(cacheKey)
        if (l1Data && l1Data.timestamp > Date.now() - ttl) {
          return l1Data.value
        }

        // Check L3 storage
        try {
          const l3Data = JSON.parse(this.l3Storage.getItem(cacheKey) || 'null')
          if (l3Data && l3Data.timestamp > Date.now() - ttl) {
            // Promote to L1
            this.l1Cache.set(cacheKey, l3Data)
            return l3Data.value
          }
        } catch (e) {
          console.warn('L3 cache read error:', e)
        }

        return existing
      },

      merge: (existing, incoming, { args }) => {
        const cacheKey = `${key}-${JSON.stringify(args)}`
        const cacheData = { value: incoming, timestamp: Date.now() }
        
        // Store in L1
        this.l1Cache.set(cacheKey, cacheData)
        
        // Store in L3
        try {
          this.l3Storage.setItem(cacheKey, JSON.stringify(cacheData))
        } catch (e) {
          console.warn('L3 cache write error:', e)
        }

        return incoming
      }
    }
  }
}

const multiCache = new MultiLevelCache()

// Cache configuration
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        hsCustomers: multiCache.createFieldPolicy('customers', 300000),
        restMenuItems: multiCache.createFieldPolicy('menu', 600000),
        retailProducts: multiCache.createFieldPolicy('products', 180000)
      }
    }
  }
})
```

### 6.3 Security Implementation

#### Query Depth Limiting
```typescript
// security/depth-limiter.ts
import { ValidationRule } from 'graphql'

function createDepthLimitRule(maxDepth: number): ValidationRule {
  return (context) => ({
    Field(node, key, parent, path, ancestors) {
      const depths = ancestors.filter(
        ancestor => ancestor.kind === 'Field'
      )
      
      if (depths.length >= maxDepth) {
        context.reportError(
          new Error(`Query depth ${depths.length} exceeds maximum depth ${maxDepth}`)
        )
      }
    }
  })
}

// Query whitelisting for production
const allowedQueries = new Set([
  'GetWorkOrders',
  'GetCustomers',
  'CreateWorkOrder',
  'UpdateWorkOrderStatus'
])

function createQueryWhitelistRule(allowedOperations: Set<string>): ValidationRule {
  return (context) => ({
    OperationDefinition(node) {
      if (node.name && !allowedOperations.has(node.name.value)) {
        context.reportError(
          new Error(`Operation ${node.name.value} is not allowed`)
        )
      }
    }
  })
}
```

#### Rate Limiting
```typescript
// security/rate-limiter.ts
import { RateLimiter } from 'graphql-rate-limit'

const rateLimiter = RateLimiter({
  identifyContext: (context) => {
    return context.userId || context.req.ip
  },
  formatError: ({ max, window, current }) => {
    return `Rate limit exceeded: ${current}/${max} requests per ${window}ms`
  }
})

// Field-level rate limiting
const resolvers = {
  Query: {
    expensiveOperation: rateLimiter({
      max: 5,
      window: '1m'
    })(async (parent, args, context) => {
      // Expensive operation here
    })
  },
  
  Mutation: {
    createWorkOrder: rateLimiter({
      max: 10,
      window: '1m'
    })(async (parent, args, context) => {
      // Create work order logic
    })
  }
}
```

### 6.4 Performance Monitoring

```typescript
// monitoring/performance-tracker.ts
import { ApolloLink } from '@apollo/client'

const performanceLink = new ApolloLink((operation, forward) => {
  const startTime = Date.now()
  
  return forward(operation).map(result => {
    const endTime = Date.now()
    const duration = endTime - startTime
    
    // Log slow queries
    if (duration > 1000) {
      console.warn(`Slow query detected: ${operation.operationName}`, {
        duration,
        variables: operation.variables,
        query: operation.query.loc?.source?.body
      })
      
      // Send to monitoring service
      sendToMonitoring({
        type: 'slow_query',
        operationName: operation.operationName,
        duration,
        timestamp: endTime
      })
    }
    
    // Track query metrics
    trackQueryMetrics({
      operationName: operation.operationName,
      operationType: operation.query.definitions[0]?.operation,
      duration,
      success: !result.errors,
      errorCount: result.errors?.length || 0
    })
    
    return result
  })
})

// Usage in Apollo Client
const client = new ApolloClient({
  link: from([performanceLink, authLink, httpLink]),
  cache
})
```

### 6.5 Hands-On Exercise 6.1

**Task**: Implement a comprehensive performance and security layer

1. Add query complexity analysis
2. Implement multi-level caching
3. Set up rate limiting
4. Add performance monitoring

**Solution**:
```typescript
// advanced-client-setup.ts
import { ApolloClient, InMemoryCache, from, createHttpLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'

// Security and performance configuration
const secureClient = new ApolloClient({
  link: from([
    // Performance monitoring
    createPerformanceMonitoringLink(),
    
    // Error handling with security logging
    onError(({ graphQLErrors, networkError, operation }) => {
      if (graphQLErrors) {
        graphQLErrors.forEach(({ message, extensions }) => {
          // Security event logging
          if (extensions?.code === 'FORBIDDEN' || extensions?.code === 'RATE_LIMITED') {
            logSecurityEvent({
              type: extensions.code,
              operation: operation.operationName,
              message,
              timestamp: new Date().toISOString()
            })
          }
        })
      }
    }),
    
    // Authentication with token refresh
    createAuthLink(),
    
    // Rate limiting on client side
    createClientRateLimitingLink(),
    
    // HTTP link with retry and timeout
    createHttpLink({
      uri: 'https://thorbis.com/api/v1/graphql',
      timeout: 10000
    })
  ]),
  
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          // Complex caching with TTL
          hsWorkOrders: createAdvancedFieldPolicy('workorders', {
            ttl: 30000,
            maxSize: 100,
            keyArgs: ['filters', 'orderBy']
          }),
          
          // Customer data with longer TTL
          hsCustomers: createAdvancedFieldPolicy('customers', {
            ttl: 300000,
            maxSize: 50,
            keyArgs: ['search', 'filters']
          })
        }
      }
    }
  }),
  
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-and-network'
    },
    query: {
      errorPolicy: 'all'
    }
  }
})

function createAdvancedFieldPolicy(namespace: string, options: CacheOptions) {
  return {
    keyArgs: options.keyArgs,
    merge: createCacheMergeFunction(namespace, options),
    read: createCacheReadFunction(namespace, options)
  }
}
```

---

## Hands-On Labs

### Lab 1: Basic GraphQL Integration

**Duration**: 2 hours  
**Objective**: Set up a complete GraphQL client integration

**Tasks**:
1. Configure Apollo Client with authentication
2. Create reusable hooks for common operations
3. Implement error handling and loading states
4. Build a simple CRUD interface

### Lab 2: Real-Time Dashboard

**Duration**: 3 hours  
**Objective**: Build a real-time business dashboard

**Tasks**:
1. Set up GraphQL subscriptions
2. Implement real-time data updates
3. Add optimistic UI updates
4. Create responsive layout with multiple data sources

### Lab 3: Industry-Specific Application

**Duration**: 4 hours  
**Objective**: Build a complete industry-specific application

**Tasks**:
1. Choose an industry vertical (Home Services, Restaurant, Auto, Retail)
2. Implement core business workflows
3. Add real-time collaboration features
4. Optimize for mobile devices

### Lab 4: Performance Optimization

**Duration**: 2 hours  
**Objective**: Optimize GraphQL application performance

**Tasks**:
1. Implement query batching and caching
2. Add performance monitoring
3. Optimize bundle size and loading
4. Test with realistic data volumes

### Lab 5: Security Implementation

**Duration**: 2 hours  
**Objective**: Secure GraphQL application

**Tasks**:
1. Implement proper authentication flow
2. Add input validation and sanitization
3. Set up rate limiting and query analysis
4. Test security measures

---

## Assessment & Certification

### Assessment Methods

#### 1. Practical Coding Assessment (60%)
- **Duration**: 4 hours
- **Format**: Hands-on coding challenge
- **Tasks**: Build a complete GraphQL application with specific requirements

#### 2. Theory Examination (25%)
- **Duration**: 1 hour
- **Format**: Multiple choice and short answer questions
- **Topics**: GraphQL concepts, Thorbis API knowledge, best practices

#### 3. Architecture Design (15%)
- **Duration**: 1 hour
- **Format**: Design document and presentation
- **Task**: Design a GraphQL integration architecture for a specific business scenario

### Certification Levels

#### Level 1: GraphQL Associate
**Requirements**:
- Complete Modules 1-3
- Pass theory exam (70% minimum)
- Complete basic practical assessment

**Skills Demonstrated**:
- GraphQL fundamentals
- Basic client integration
- Simple CRUD operations

#### Level 2: GraphQL Professional
**Requirements**:
- Complete Modules 1-5
- Pass comprehensive practical assessment
- Demonstrate industry-specific knowledge

**Skills Demonstrated**:
- Advanced client integration
- Real-time applications
- Industry-specific implementations
- Performance optimization basics

#### Level 3: GraphQL Expert
**Requirements**:
- Complete all modules
- Pass advanced practical assessment
- Complete architecture design challenge
- Demonstrate teaching ability

**Skills Demonstrated**:
- Complete GraphQL ecosystem mastery
- Advanced performance optimization
- Security implementation
- Architecture design
- Team leadership and training

### Sample Assessment Questions

#### Theory Questions
1. **What are the main advantages of GraphQL over REST APIs?**
2. **Explain the difference between queries, mutations, and subscriptions in GraphQL.**
3. **How does the Apollo Client cache work, and what are the different fetch policies?**
4. **What security considerations are important when implementing GraphQL?**
5. **Describe the pagination patterns used in the Thorbis GraphQL API.**

#### Practical Challenges
1. **Build a work order management interface** with real-time updates and optimistic UI
2. **Implement a restaurant order system** with kitchen display integration
3. **Create a performance monitoring dashboard** with custom metrics
4. **Design a secure GraphQL integration** with proper authentication and rate limiting

---

## Advanced Specializations

### Specialization 1: GraphQL Architecture

**Duration**: 2 additional days  
**Focus**: Server-side GraphQL implementation and schema design

**Topics**:
- Schema design principles
- Resolver performance optimization
- Federation and microservices
- Custom directives and middleware

### Specialization 2: Mobile GraphQL

**Duration**: 2 additional days  
**Focus**: GraphQL in mobile applications

**Topics**:
- React Native GraphQL integration
- Offline-first architectures
- Mobile-specific caching strategies
- Performance optimization for mobile

### Specialization 3: Enterprise Integration

**Duration**: 3 additional days  
**Focus**: Large-scale GraphQL deployments

**Topics**:
- Microservices federation
- Enterprise security patterns
- Monitoring and observability
- DevOps and deployment strategies

### Specialization 4: GraphQL Testing

**Duration**: 1 additional day  
**Focus**: Testing GraphQL applications

**Topics**:
- Unit testing GraphQL operations
- Integration testing strategies
- Mock data generation
- End-to-end testing with GraphQL

---

## Resources & References

### Official Documentation
- [GraphQL Official Documentation](https://graphql.org/)
- [Apollo Client Documentation](https://www.apollographql.com/docs/react/)
- [Thorbis GraphQL API Reference](../../API-GRAPHQL-INDEX.md)

### Recommended Reading
- "Learning GraphQL" by Eve Porcello and Alex Banks
- "Production Ready GraphQL" by Marc-André Giroux
- "GraphQL in Action" by Samer Buna

### Online Resources
- [Apollo GraphQL Blog](https://blog.apollographql.com/)
- [GraphQL Weekly Newsletter](https://www.graphqlweekly.com/)
- [How to GraphQL](https://www.howtographql.com/)

### Tools and Libraries
- **Clients**: Apollo Client, urql, Relay
- **Development**: GraphiQL, Apollo DevTools
- **Testing**: Apollo Testing Utils, GraphQL Testing Library
- **Code Generation**: GraphQL Code Generator

### Community and Support
- [Thorbis Developer Community](https://community.thorbis.com)
- [GraphQL Slack Community](https://graphql-slack.herokuapp.com/)
- [Apollo Community](https://community.apollographql.com/)

---

## Next Steps After Training

### Immediate Actions (Week 1)
1. **Set up development environment** with GraphQL tools
2. **Explore Thorbis GraphQL schema** using GraphiQL
3. **Build first GraphQL integration** following training examples
4. **Join developer community** for ongoing support

### Short-term Goals (Month 1)
1. **Complete certification assessment**
2. **Implement GraphQL in current project**
3. **Share knowledge** with team members
4. **Contribute to** internal GraphQL best practices

### Long-term Development (Ongoing)
1. **Stay updated** with GraphQL ecosystem developments
2. **Attend advanced workshops** and conferences  
3. **Contribute to** open-source GraphQL projects
4. **Mentor other developers** in GraphQL adoption

---

**Training Status**: ✅ Production Ready  
**Last Updated**: 2025-01-31  
**Next Review**: 2025-02-28  
**Training Coordinator**: training@thorbis.com