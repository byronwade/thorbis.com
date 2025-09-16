# GraphQL Developer Quickstart Guide

> **Audience**: Developers new to Thorbis GraphQL API  
> **Time to Complete**: 30-45 minutes  
> **Prerequisites**: Basic GraphQL knowledge, valid Thorbis account

## Table of Contents

1. [Getting Started](#getting-started)
2. [Authentication Setup](#authentication-setup)
3. [Your First GraphQL Query](#your-first-graphql-query)
4. [Working with Mutations](#working-with-mutations)
5. [Real-time Subscriptions](#real-time-subscriptions)
6. [Client Integration](#client-integration)
7. [Common Patterns](#common-patterns)
8. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Overview

The Thorbis GraphQL API provides a single endpoint to access all your business data across industries. Whether you're building a home services app, restaurant management system, or auto repair platform, GraphQL gives you the flexibility to fetch exactly the data you need.

### GraphQL Endpoint

```
Production: https://thorbis.com/api/v1/graphql
```

### Quick Start Checklist

- [ ] Valid Thorbis Business OS account
- [ ] API authentication token
- [ ] GraphQL client (Apollo Client, urql, or basic fetch)
- [ ] Industry vertical access (HS, Auto, Restaurant, Retail)

---

## Authentication Setup

### Step 1: Get Your API Token

First, obtain your JWT token from the Thorbis dashboard:

1. Log into your Thorbis Business OS account
2. Navigate to **Settings** → **API Access**
3. Generate a new API token for your industry
4. Copy the token (it starts with `eyJ...`)

### Step 2: Test Authentication

Use cURL to verify your token works:

```bash
curl -X POST https://thorbis.com/api/v1/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "query": "query { apiVersion }"
  }'
```

Expected response:
```json
{
  "data": {
    "apiVersion": "3.0.0"
  }
}
```

### Step 3: Understand Token Claims

Your JWT token contains important information:

```typescript
interface TokenClaims {
  sub: string              // Your user ID
  business_id: string      // Your business/tenant ID
  role: string            // Your role (owner, manager, staff, viewer)
  industry: string        // Primary industry (hs, auto, rest, ret)
  permissions: string[]   // Specific permissions array
  exp: number            // Token expiration timestamp
}
```

---

## Your First GraphQL Query

### Step 1: Explore the Schema

Open GraphiQL in your browser:
```
https://thorbis.com/api/v1/graphql
```

Paste your authentication token in the headers panel:
```json
{
  "Authorization": "Bearer YOUR_TOKEN_HERE"
}
```

### Step 2: Basic System Query

Start with a simple query to test connectivity:

```graphql
query BasicSystemInfo {
  apiVersion
  systemHealth {
    status
    uptime
    database {
      status
      connections
      latency
    }
  }
}
```

### Step 3: Industry-Specific Query

Now try fetching some business data. Here are examples for each industry:

#### Home Services - Work Orders

```graphql
query GetWorkOrders {
  hsWorkOrders(pagination: { first: 5 }) {
    edges {
      node {
        id
        title
        status
        priority
        total
        customer {
          fullName
          phone
        }
        scheduledDate
        createdAt
      }
    }
    totalCount
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

#### Restaurant - Orders

```graphql
query GetRestaurantOrders {
  restOrders(pagination: { first: 5 }) {
    edges {
      node {
        id
        orderNumber
        orderType
        status
        total
        items {
          name
          quantity
          price
        }
        createdAt
      }
    }
    totalCount
  }
}
```

#### Auto Services - Repair Orders

```graphql
query GetRepairOrders {
  autoRepairOrders(pagination: { first: 5 }) {
    edges {
      node {
        id
        workOrderNumber
        status
        vehicle {
          year
          make
          model
          vin
        }
        customer {
          fullName
          phone
        }
        estimatedCompletion
        grandTotal
      }
    }
  }
}
```

#### Retail - Products

```graphql
query GetProducts {
  retailProducts(pagination: { first: 10 }) {
    edges {
      node {
        id
        name
        sku
        category
        price
        stockQuantity
        active
      }
    }
    totalCount
  }
}
```

### Step 4: Add Filtering and Sorting

Enhance your queries with filters:

```graphql
query FilteredWorkOrders($status: String!) {
  hsWorkOrders(
    pagination: { first: 10 }
    filters: [
      { field: "status", operator: EQUALS, value: $status }
    ]
    sorts: [
      { field: "scheduledDate", direction: ASC }
    ]
  ) {
    edges {
      node {
        id
        title
        status
        scheduledDate
        priority
      }
    }
  }
}
```

Query variables:
```json
{
  "status": "scheduled"
}
```

---

## Working with Mutations

### Step 1: Understanding Idempotency

All write operations require an idempotency key to prevent duplicate operations:

```graphql
mutation CreateWorkOrder($input: HSWorkOrderInput!) {
  createHSWorkOrder(input: $input) {
    id
    title
    status
    customer {
      fullName
    }
    total
    createdAt
  }
}
```

### Step 2: Home Services - Create Work Order

```graphql
mutation CreateWorkOrder($input: HSWorkOrderInput!) {
  createHSWorkOrder(input: $input) {
    id
    title
    status
    priority
    customer {
      id
      fullName
      phone
    }
    items {
      name
      quantity
      rate
      total
    }
    total
    createdAt
  }
}
```

Variables:
```json
{
  "input": {
    "customerId": "cust_12345",
    "title": "HVAC System Maintenance",
    "description": "Annual maintenance check for HVAC system",
    "serviceType": "hvac",
    "priority": "NORMAL",
    "scheduledDate": "2024-02-15T10:00:00Z",
    "estimatedDuration": 120,
    "items": [
      {
        "name": "Filter Replacement",
        "description": "Replace air filter",
        "quantity": 2,
        "rate": 25.00,
        "type": "MATERIAL"
      },
      {
        "name": "System Inspection",
        "description": "Complete system inspection",
        "quantity": 1,
        "rate": 150.00,
        "type": "LABOR"
      }
    ]
  }
}
```

Required headers:
```json
{
  "Authorization": "Bearer YOUR_TOKEN",
  "Idempotency-Key": "create_wo_20240131_001"
}
```

### Step 3: Restaurant - Create Order

```graphql
mutation CreateRestaurantOrder($input: RestOrderInput!) {
  createRestOrder(input: $input) {
    id
    orderNumber
    status
    orderType
    items {
      name
      quantity
      price
      total
    }
    subtotal
    tax
    total
    createdAt
  }
}
```

Variables:
```json
{
  "input": {
    "customerName": "John Doe",
    "customerPhone": "+1-555-0123",
    "orderType": "TAKEOUT",
    "items": [
      {
        "menuItemId": "menu_item_123",
        "quantity": 2,
        "modifiers": [
          {
            "name": "Extra Cheese",
            "price": 2.00
          }
        ]
      }
    ],
    "notes": "Please prepare order for 7:00 PM pickup"
  }
}
```

### Step 4: Update Operations

```graphql
mutation UpdateWorkOrderStatus($id: ID!, $input: HSWorkOrderInput!) {
  updateHSWorkOrder(id: $id, input: $input) {
    id
    status
    updatedAt
  }
}
```

Variables:
```json
{
  "id": "wo_12345",
  "input": {
    "status": "IN_PROGRESS"
  }
}
```

---

## Real-time Subscriptions

### Step 1: Setting Up WebSocket Connection

For real-time updates, you'll need a WebSocket connection. Here's how to set it up with different clients:

#### Apollo Client (React)

```typescript
import { createClient } from 'graphql-ws'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'

const wsLink = new GraphQLWsLink(
  createClient({
    url: 'wss://thorbis.com/api/v1/graphql',
    connectionParams: {
      authToken: 'Bearer YOUR_TOKEN'
    }
  })
)
```

### Step 2: Work Order Updates Subscription

```graphql
subscription WorkOrderUpdates($businessId: ID!) {
  workOrderUpdates(businessId: $businessId) {
    id
    status
    priority
    assignedTechnician {
      id
      name
      phone
    }
    customer {
      fullName
    }
    estimatedCompletion
    updatedAt
  }
}
```

### Step 3: Restaurant Order Updates

```graphql
subscription OrderUpdates($businessId: ID!) {
  orderUpdates(businessId: $businessId) {
    id
    orderNumber
    status
    orderType
    items {
      name
      quantity
    }
    estimatedPrepTime
    updatedAt
  }
}
```

### Step 4: System Alerts

```graphql
subscription SystemAlerts {
  systemAlerts {
    level
    message
    timestamp
    source
  }
}
```

---

## Client Integration

### Apollo Client Setup (React)

```bash
npm install @apollo/client graphql
```

```typescript
// apollo-client.ts
import { ApolloClient, InMemoryCache, createHttpLink, split } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { getMainDefinition } from '@apollo/client/utilities'
import { createClient } from 'graphql-ws'

// HTTP link for queries and mutations
const httpLink = createHttpLink({
  uri: 'https://thorbis.com/api/v1/graphql'
})

// WebSocket link for subscriptions
const wsLink = new GraphQLWsLink(
  createClient({
    url: 'wss://thorbis.com/api/v1/graphql',
    connectionParams: () => ({
      authToken: localStorage.getItem('thorbis_token')
    })
  })
)

// Auth link
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

// Split link based on operation type
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    )
  },
  wsLink,
  authLink.concat(httpLink)
)

export const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          hsWorkOrders: {
            keyArgs: false,
            merge(existing = { edges: [] }, incoming) {
              return {
                ...incoming,
                edges: [...existing.edges, ...incoming.edges]
              }
            }
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

// Helper function
function generateIdempotencyKey() {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
```

### React Component Example

```typescript
// components/WorkOrderList.tsx
import React from 'react'
import { useQuery, useMutation, useSubscription } from '@apollo/client'
import { GET_WORK_ORDERS, CREATE_WORK_ORDER, WORK_ORDER_UPDATES } from './queries'

export function WorkOrderList({ businessId }: { businessId: string }) {
  const { data, loading, error, fetchMore, refetch } = useQuery(GET_WORK_ORDERS, {
    variables: {
      pagination: { first: 20 },
      filters: []
    }
  })

  const [createWorkOrder, { loading: creating }] = useMutation(CREATE_WORK_ORDER, {
    onCompleted: () => {
      refetch() // Refresh the list
    },
    onError: (error) => {
      console.error('Failed to create work order:', error)
    }
  })

  // Subscribe to real-time updates
  useSubscription(WORK_ORDER_UPDATES, {
    variables: { businessId },
    onData: ({ data: subscriptionData }) => {
      console.log('Work order updated:', subscriptionData.data?.workOrderUpdates)
      // Apollo Client will automatically update the cache
    }
  })

  const handleCreateWorkOrder = async (input) => {
    await createWorkOrder({
      variables: { input },
      context: {
        headers: {
          'idempotency-key': `create_wo_${Date.now()}`
        }
      }
    })
  }

  const handleLoadMore = () => {
    fetchMore({
      variables: {
        pagination: {
          first: 20,
          after: data?.hsWorkOrders?.pageInfo?.endCursor
        }
      }
    })
  }

  if (loading) return <div>Loading work orders...</div>
  if (error) return <div>Error: {error.message}</div>

  const workOrders = data?.hsWorkOrders?.edges || []

  return (
    <div>
      <h2>Work Orders ({data?.hsWorkOrders?.totalCount})</h2>
      
      {workOrders.map(({ node: workOrder }) => (
        <div key={workOrder.id} className="work-order-card">
          <h3>{workOrder.title}</h3>
          <p>Status: {workOrder.status}</p>
          <p>Priority: {workOrder.priority}</p>
          <p>Customer: {workOrder.customer.fullName}</p>
          <p>Total: ${workOrder.total}</p>
          <p>Scheduled: {new Date(workOrder.scheduledDate).toLocaleDateString()}</p>
        </div>
      ))}

      {data?.hsWorkOrders?.pageInfo?.hasNextPage && (
        <button onClick={handleLoadMore}>Load More</button>
      )}

      <button 
        onClick={() => handleCreateWorkOrder({
          customerId: 'cust_123',
          title: 'New Work Order',
          description: 'Test work order',
          serviceType: 'general'
        })}
        disabled={creating}
      >
        {creating ? 'Creating...' : 'Create Work Order'}
      </button>
    </div>
  )
}
```

### GraphQL Queries File

```typescript
// queries.ts
import { gql } from '@apollo/client'

export const GET_WORK_ORDERS = gql`
  query GetWorkOrders(
    $pagination: PaginationInput
    $filters: [FilterInput!]
    $sorts: [SortInput!]
  ) {
    hsWorkOrders(pagination: $pagination, filters: $filters, sorts: $sorts) {
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
            phone
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
`

export const CREATE_WORK_ORDER = gql`
  mutation CreateWorkOrder($input: HSWorkOrderInput!) {
    createHSWorkOrder(input: $input) {
      id
      title
      status
      priority
      total
      customer {
        fullName
      }
      createdAt
    }
  }
`

export const WORK_ORDER_UPDATES = gql`
  subscription WorkOrderUpdates($businessId: ID!) {
    workOrderUpdates(businessId: $businessId) {
      id
      status
      priority
      updatedAt
    }
  }
`
```

---

## Common Patterns

### 1. Pagination with Load More

```typescript
const { data, fetchMore } = useQuery(GET_WORK_ORDERS, {
  variables: { pagination: { first: 20 } }
})

const loadMore = () => {
  fetchMore({
    variables: {
      pagination: {
        first: 20,
        after: data?.hsWorkOrders?.pageInfo?.endCursor
      }
    }
  })
}
```

### 2. Optimistic Updates

```typescript
const [updateStatus] = useMutation(UPDATE_WORK_ORDER_STATUS, {
  optimisticResponse: {
    updateHSWorkOrder: {
      __typename: 'HSWorkOrder',
      id: workOrderId,
      status: 'IN_PROGRESS',
      updatedAt: new Date().toISOString()
    }
  }
})
```

### 3. Error Handling

```typescript
function GraphQLErrorHandler({ error }: { error: ApolloError }) {
  const handleError = (error: ApolloError) => {
    error.graphQLErrors.forEach(({ message, extensions }) => {
      switch (extensions?.code) {
        case 'UNAUTHENTICATED':
          // Redirect to login
          window.location.href = '/login'
          break
        case 'FORBIDDEN':
          // Show permission error
          toast.error('You do not have permission for this action')
          break
        case 'VALIDATION_ERROR':
          // Show validation errors
          toast.error(`Validation error: ${message}`)
          break
        default:
          toast.error(`Error: ${message}`)
      }
    })
  }

  React.useEffect(() => {
    if (error) {
      handleError(error)
    }
  }, [error])

  return null
}
```

### 4. Fragment Usage

```typescript
const WORK_ORDER_FRAGMENT = gql`
  fragment WorkOrderDetails on HSWorkOrder {
    id
    title
    status
    priority
    total
    customer {
      id
      fullName
      phone
    }
    scheduledDate
    createdAt
  }
`

const GET_WORK_ORDERS = gql`
  query GetWorkOrders($pagination: PaginationInput) {
    hsWorkOrders(pagination: $pagination) {
      edges {
        node {
          ...WorkOrderDetails
        }
      }
    }
  }
  ${WORK_ORDER_FRAGMENT}
`
```

### 5. Cache Updates

```typescript
const [deleteWorkOrder] = useMutation(DELETE_WORK_ORDER, {
  update: (cache, { data: { deleteHSWorkOrder } }) => {
    if (deleteHSWorkOrder) {
      cache.modify({
        fields: {
          hsWorkOrders: (existing, { readField }) => ({
            ...existing,
            edges: existing.edges.filter(
              (edge) => readField('id', edge.node) !== workOrderId
            )
          })
        }
      })
    }
  }
})
```

---

## Troubleshooting

### Common Issues

#### 1. Authentication Errors

**Error**: `UNAUTHENTICATED: Authentication token required`

**Solution**:
```typescript
// Ensure token is properly formatted
const token = localStorage.getItem('thorbis_token')
if (!token || !token.startsWith('eyJ')) {
  // Token is missing or invalid
  redirectToLogin()
}
```

#### 2. Permission Denied

**Error**: `FORBIDDEN: Insufficient permissions`

**Solution**: Check your user role and permissions:
```graphql
query CheckPermissions {
  user(id: "me") {
    id
    role
    activeRoles {
      role {
        name
        permissions
      }
    }
  }
}
```

#### 3. Validation Errors

**Error**: `VALIDATION_ERROR: Required field missing`

**Solution**: Check the schema documentation and ensure all required fields are provided:
```graphql
# Use introspection to check required fields
{
  __type(name: "HSWorkOrderInput") {
    inputFields {
      name
      type {
        name
        kind
      }
    }
  }
}
```

#### 4. Network Errors

**Error**: `Network error: Failed to fetch`

**Solutions**:
- Check your internet connection
- Verify the GraphQL endpoint URL
- Check for CORS issues in browser console
- Ensure your API token hasn't expired

#### 5. Query Complexity

**Error**: `Query complexity limit exceeded`

**Solution**: Simplify your query or use pagination:
```graphql
# Instead of fetching all data at once
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
                  # This creates deeply nested queries
                }
              }
            }
          }
        }
      }
    }
  }
}

# Use focused queries with pagination
query BetterApproach {
  hsWorkOrders(pagination: { first: 20 }) {
    edges {
      node {
        id
        title
        status
        customer {
          id
          fullName
        }
      }
    }
  }
}
```

### Debugging Tips

#### 1. Use GraphiQL for Testing

Before implementing in your app, test queries in GraphiQL:
```
https://thorbis.com/api/v1/graphql
```

#### 2. Enable Apollo Client DevTools

Install the browser extension for detailed debugging:
- Query and mutation inspection
- Cache state visualization
- Network request monitoring

#### 3. Add Logging

```typescript
const client = new ApolloClient({
  // ... other config
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all'
    }
  }
})

client.onClearStore(() => {
  console.log('Apollo cache cleared')
})

client.onResetStore(() => {
  console.log('Apollo store reset')
})
```

#### 4. Check Network Tab

Monitor the Network tab in browser DevTools to see:
- GraphQL requests and responses
- HTTP status codes
- Response times
- Error details

### Getting Help

If you're still having issues:

1. **Check the documentation**: `https://thorbis.com/docs/graphql`
2. **Search community forum**: `https://community.thorbis.com`
3. **Contact support**: `graphql-support@thorbis.com`
4. **Join Discord**: Live chat with other developers

---

## Next Steps

Congratulations! You've completed the GraphQL quickstart. Here's what to explore next:

### Intermediate Topics
- [ ] Advanced filtering and search
- [ ] File uploads with GraphQL
- [ ] Custom scalars and directives
- [ ] Query optimization techniques

### Advanced Topics
- [ ] Schema stitching for microservices
- [ ] Custom resolvers and middleware
- [ ] Performance monitoring and analytics
- [ ] GraphQL federation patterns

### Industry-Specific Guides
- [ ] [Home Services GraphQL Patterns](./hs-graphql-guide.md)
- [ ] [Restaurant GraphQL Operations](./restaurant-graphql-guide.md)  
- [ ] [Auto Services GraphQL Integration](./auto-graphql-guide.md)
- [ ] [Retail GraphQL Best Practices](./retail-graphql-guide.md)

### Tools and Resources
- **GraphiQL IDE**: Interactive GraphQL explorer
- **Apollo Studio**: Advanced GraphQL tooling
- **GraphQL Code Generator**: Auto-generate TypeScript types
- **Relay Compiler**: Facebook's GraphQL compiler

---

**Quick Links**:
- [Complete GraphQL Documentation](../API-GRAPHQL-INDEX.md)
- [GraphQL Schema Reference](../../apps/api/docs/GRAPHQL-SCHEMA.md)
- [API Status Page](https://status.thorbis.com)
- [Developer Community](https://community.thorbis.com)

Happy coding! 🚀