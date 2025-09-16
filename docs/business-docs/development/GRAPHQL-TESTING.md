# GraphQL Testing Documentation

> **Version**: 3.0.0  
> **Last Updated**: 2025-01-31  
> **Status**: Production Ready  
> **Prerequisites**: [GraphQL API Documentation](../../API-GRAPHQL-INDEX.md), [GraphQL Integration Patterns](./GRAPHQL-INTEGRATION-PATTERNS.md)

## Table of Contents

1. [Testing Strategy Overview](#testing-strategy-overview)
2. [Unit Testing](#unit-testing)
3. [Integration Testing](#integration-testing)
4. [End-to-End Testing](#end-to-end-testing)
5. [Performance Testing](#performance-testing)
6. [Security Testing](#security-testing)
7. [Mock Data & Test Utilities](#mock-data--test-utilities)
8. [Industry-Specific Test Scenarios](#industry-specific-test-scenarios)
9. [Continuous Integration](#continuous-integration)
10. [Testing Best Practices](#testing-best-practices)

---

## Testing Strategy Overview

### Testing Pyramid for GraphQL

```
     /\     E2E Tests (10%)
    /  \    - Full user workflows
   /____\   - Cross-browser testing
  /      \  
 / Integration \ Integration Tests (20%)
/____Tests____\ - API integration
               \ - Database integration
                \
  Unit Tests (70%)
  - Resolvers
  - Schema validation
  - Business logic
  - Client-side operations
```

### Core Testing Principles

1. **Schema-First Testing**: Validate schema integrity before implementation
2. **Operation Coverage**: Test all queries, mutations, and subscriptions
3. **Error Scenario Testing**: Comprehensive error handling validation
4. **Performance Benchmarking**: Regular performance regression testing
5. **Security Validation**: Authentication, authorization, and input validation
6. **Real-World Data**: Test with production-like data volumes and patterns

### Testing Environments

```typescript
// test-environments.ts
export const testEnvironments = {
  unit: {
    database: 'memory',
    authentication: 'mocked',
    externalAPIs: 'mocked',
    realTime: 'disabled'
  },
  
  integration: {
    database: 'test-database',
    authentication: 'test-tokens',
    externalAPIs: 'sandboxed',
    realTime: 'enabled'
  },
  
  e2e: {
    database: 'staging-database',
    authentication: 'full-flow',
    externalAPIs: 'staging',
    realTime: 'enabled'
  }
}
```

---

## Unit Testing

### Testing GraphQL Resolvers

```typescript
// tests/unit/resolvers/work-order.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createMockContext, mockWorkOrder, mockCustomer } from '../test-utils'
import { workOrderResolvers } from '../../../src/resolvers/work-order'

describe('WorkOrder Resolvers', () => {
  let mockContext: ReturnType<typeof createMockContext>
  
  beforeEach(() => {
    mockContext = createMockContext()
  })

  describe('Query.hsWorkOrders', () => {
    it('should return paginated work orders', async () => {
      const mockWorkOrders = [mockWorkOrder(), mockWorkOrder()]
      mockContext.dataSources.workOrders.findMany.mockResolvedValue(mockWorkOrders)

      const result = await workOrderResolvers.Query.hsWorkOrders(
        null,
        { pagination: { first: 20 } },
        mockContext
      )

      expect(result.edges).toHaveLength(2)
      expect(result.edges[0].node).toMatchObject(mockWorkOrders[0])
      expect(mockContext.dataSources.workOrders.findMany).toHaveBeenCalledWith({
        businessId: mockContext.businessId,
        limit: 20,
        offset: 0,
        filters: []
      })
    })

    it('should apply status filters correctly', async () => {
      const filters = [{ field: 'status', operator: 'IN', values: ['CREATED', 'ASSIGNED'] }]
      
      await workOrderResolvers.Query.hsWorkOrders(
        null,
        { filters, pagination: { first: 10 } },
        mockContext
      )

      expect(mockContext.dataSources.workOrders.findMany).toHaveBeenCalledWith({
        businessId: mockContext.businessId,
        limit: 10,
        offset: 0,
        filters: expect.arrayContaining([
          expect.objectContaining({
            field: 'status',
            operator: 'IN',
            values: ['CREATED', 'ASSIGNED']
          })
        ])
      })
    })

    it('should handle empty results', async () => {
      mockContext.dataSources.workOrders.findMany.mockResolvedValue([])

      const result = await workOrderResolvers.Query.hsWorkOrders(
        null,
        { pagination: { first: 20 } },
        mockContext
      )

      expect(result.edges).toHaveLength(0)
      expect(result.totalCount).toBe(0)
      expect(result.pageInfo.hasNextPage).toBe(false)
    })

    it('should throw error for insufficient permissions', async () => {
      mockContext.permissions = [] // No permissions

      await expect(
        workOrderResolvers.Query.hsWorkOrders(
          null,
          { pagination: { first: 20 } },
          mockContext
        )
      ).rejects.toThrow('Insufficient permissions')
    })
  })

  describe('Mutation.createHSWorkOrder', () => {
    it('should create work order with valid input', async () => {
      const input = {
        customerId: 'customer-1',
        title: 'Test Work Order',
        description: 'Test Description',
        priority: 'HIGH',
        items: [
          { name: 'Labor', quantity: 2, rate: 50 }
        ]
      }

      const createdWorkOrder = { ...mockWorkOrder(), ...input, id: 'wo-123' }
      mockContext.dataSources.workOrders.create.mockResolvedValue(createdWorkOrder)

      const result = await workOrderResolvers.Mutation.createHSWorkOrder(
        null,
        { input },
        mockContext
      )

      expect(result).toMatchObject(createdWorkOrder)
      expect(mockContext.dataSources.workOrders.create).toHaveBeenCalledWith({
        ...input,
        businessId: mockContext.businessId,
        createdBy: mockContext.userId
      })
    })

    it('should validate required fields', async () => {
      const invalidInput = {
        customerId: '',
        title: '',
        items: []
      }

      await expect(
        workOrderResolvers.Mutation.createHSWorkOrder(
          null,
          { input: invalidInput },
          mockContext
        )
      ).rejects.toThrow('Validation error')
    })

    it('should check customer exists', async () => {
      const input = {
        customerId: 'non-existent-customer',
        title: 'Test Work Order',
        items: [{ name: 'Labor', quantity: 1, rate: 50 }]
      }

      mockContext.dataSources.customers.findById.mockResolvedValue(null)

      await expect(
        workOrderResolvers.Mutation.createHSWorkOrder(
          null,
          { input },
          mockContext
        )
      ).rejects.toThrow('Customer not found')
    })
  })

  describe('HSWorkOrder.customer', () => {
    it('should resolve customer using DataLoader', async () => {
      const workOrder = mockWorkOrder({ customerId: 'customer-1' })
      const customer = mockCustomer({ id: 'customer-1' })
      
      mockContext.dataSources.customers.byIdLoader.load.mockResolvedValue(customer)

      const result = await workOrderResolvers.HSWorkOrder.customer(
        workOrder,
        {},
        mockContext
      )

      expect(result).toEqual(customer)
      expect(mockContext.dataSources.customers.byIdLoader.load).toHaveBeenCalledWith('customer-1')
    })

    it('should handle null customer', async () => {
      const workOrder = mockWorkOrder({ customerId: null })

      const result = await workOrderResolvers.HSWorkOrder.customer(
        workOrder,
        {},
        mockContext
      )

      expect(result).toBeNull()
    })
  })
})
```

### Testing GraphQL Schema Validation

```typescript
// tests/unit/schema/schema-validation.test.ts
import { describe, it, expect } from 'vitest'
import { buildSchema, validate, parse } from 'graphql'
import { typeDefs } from '../../../src/schema'

describe('Schema Validation', () => {
  const schema = buildSchema(typeDefs)

  it('should have valid schema definition', () => {
    expect(schema).toBeDefined()
    expect(schema.getType('Query')).toBeDefined()
    expect(schema.getType('Mutation')).toBeDefined()
    expect(schema.getType('Subscription')).toBeDefined()
  })

  it('should validate correct queries', () => {
    const query = parse(`
      query GetWorkOrders {
        hsWorkOrders {
          edges {
            node {
              id
              title
              status
              customer {
                fullName
              }
            }
          }
        }
      }
    `)

    const errors = validate(schema, query)
    expect(errors).toHaveLength(0)
  })

  it('should reject invalid field selections', () => {
    const invalidQuery = parse(`
      query GetWorkOrders {
        hsWorkOrders {
          edges {
            node {
              id
              invalidField
            }
          }
        }
      }
    `)

    const errors = validate(schema, invalidQuery)
    expect(errors).toHaveLength(1)
    expect(errors[0].message).toContain('invalidField')
  })

  it('should validate input types', () => {
    const invalidMutation = parse(`
      mutation CreateWorkOrder {
        createHSWorkOrder(input: {
          customerId: 123
          title: "Test"
        }) {
          id
        }
      }
    `)

    const errors = validate(schema, invalidMutation)
    expect(errors).toHaveLength(1)
    expect(errors[0].message).toContain('String cannot represent')
  })
})
```

### Testing Client-Side Operations

```typescript
// tests/unit/hooks/use-work-orders.test.tsx
import { renderHook, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { describe, it, expect } from 'vitest'
import { useWorkOrders } from '../../../src/hooks/use-work-orders'
import { GET_WORK_ORDERS } from '../../../src/graphql/queries'

const mocks = [
  {
    request: {
      query: GET_WORK_ORDERS,
      variables: {
        pagination: { first: 20 },
        filters: []
      }
    },
    result: {
      data: {
        hsWorkOrders: {
          edges: [
            {
              node: {
                id: 'wo-1',
                title: 'Test Work Order',
                status: 'CREATED',
                customer: {
                  id: 'customer-1',
                  fullName: 'John Doe'
                }
              }
            }
          ],
          pageInfo: {
            hasNextPage: false,
            endCursor: 'cursor-1'
          },
          totalCount: 1
        }
      }
    }
  }
]

describe('useWorkOrders hook', () => {
  it('should fetch work orders successfully', async () => {
    const wrapper = ({ children }) => (
      <MockedProvider mocks={mocks} addTypename={false}>
        {children}
      </MockedProvider>
    )

    const { result } = renderHook(() => useWorkOrders(), { wrapper })

    expect(result.current.loading).toBe(true)
    expect(result.current.workOrders).toEqual([])

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.workOrders).toHaveLength(1)
    expect(result.current.workOrders[0]).toMatchObject({
      id: 'wo-1',
      title: 'Test Work Order',
      status: 'CREATED'
    })
  })

  it('should handle errors gracefully', async () => {
    const errorMocks = [
      {
        request: {
          query: GET_WORK_ORDERS,
          variables: {
            pagination: { first: 20 },
            filters: []
          }
        },
        error: new Error('Network error')
      }
    ]

    const wrapper = ({ children }) => (
      <MockedProvider mocks={errorMocks} addTypename={false}>
        {children}
      </MockedProvider>
    )

    const { result } = renderHook(() => useWorkOrders(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBeDefined()
    expect(result.current.error.message).toBe('Network error')
    expect(result.current.workOrders).toEqual([])
  })

  it('should support pagination', async () => {
    const paginationMocks = [
      // Initial load
      {
        request: {
          query: GET_WORK_ORDERS,
          variables: { pagination: { first: 20 }, filters: [] }
        },
        result: {
          data: {
            hsWorkOrders: {
              edges: [{ node: { id: 'wo-1', title: 'Work Order 1' } }],
              pageInfo: { hasNextPage: true, endCursor: 'cursor-1' },
              totalCount: 2
            }
          }
        }
      },
      // Load more
      {
        request: {
          query: GET_WORK_ORDERS,
          variables: { 
            pagination: { first: 20, after: 'cursor-1' }, 
            filters: [] 
          }
        },
        result: {
          data: {
            hsWorkOrders: {
              edges: [{ node: { id: 'wo-2', title: 'Work Order 2' } }],
              pageInfo: { hasNextPage: false, endCursor: 'cursor-2' },
              totalCount: 2
            }
          }
        }
      }
    ]

    const wrapper = ({ children }) => (
      <MockedProvider mocks={paginationMocks} addTypename={false}>
        {children}
      </MockedProvider>
    )

    const { result } = renderHook(() => useWorkOrders(), { wrapper })

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.workOrders).toHaveLength(1)
    expect(result.current.hasMore).toBe(true)

    // Load more
    result.current.loadMore()

    await waitFor(() => {
      expect(result.current.workOrders).toHaveLength(2)
    })

    expect(result.current.hasMore).toBe(false)
  })
})
```

---

## Integration Testing

### API Integration Tests

```typescript
// tests/integration/graphql-api.test.ts
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { createTestClient, TestClient } from './test-client'
import { seedTestData, cleanupTestData } from './test-data'

describe('GraphQL API Integration', () => {
  let testClient: TestClient
  let testBusinessId: string
  let testUserId: string

  beforeAll(async () => {
    testClient = await createTestClient()
    const testData = await seedTestData()
    testBusinessId = testData.businessId
    testUserId = testData.userId
  })

  afterAll(async () => {
    await cleanupTestData()
    await testClient.close()
  })

  describe('Work Order Operations', () => {
    it('should create, update, and delete work order', async () => {
      // Create work order
      const createMutation = `
        mutation CreateWorkOrder($input: HSWorkOrderInput!) {
          createHSWorkOrder(input: $input) {
            id
            title
            status
            customer {
              id
              fullName
            }
            total
          }
        }
      `

      const createResult = await testClient.mutate({
        mutation: createMutation,
        variables: {
          input: {
            customerId: 'test-customer-1',
            title: 'Integration Test Work Order',
            description: 'Test description',
            priority: 'MEDIUM',
            items: [
              { name: 'Labor', quantity: 2, rate: 75.00 }
            ]
          }
        }
      })

      expect(createResult.errors).toBeUndefined()
      expect(createResult.data.createHSWorkOrder).toMatchObject({
        title: 'Integration Test Work Order',
        status: 'CREATED',
        total: 150.00
      })

      const workOrderId = createResult.data.createHSWorkOrder.id

      // Query work order
      const queryResult = await testClient.query({
        query: `
          query GetWorkOrder($id: ID!) {
            hsWorkOrder(id: $id) {
              id
              title
              status
              items {
                name
                quantity
                rate
                total
              }
            }
          }
        `,
        variables: { id: workOrderId }
      })

      expect(queryResult.errors).toBeUndefined()
      expect(queryResult.data.hsWorkOrder.items).toHaveLength(1)

      // Update work order status
      const updateResult = await testClient.mutate({
        mutation: `
          mutation UpdateWorkOrderStatus($id: ID!, $status: WorkOrderStatus!) {
            updateHSWorkOrderStatus(id: $id, status: $status) {
              id
              status
              updatedAt
            }
          }
        `,
        variables: {
          id: workOrderId,
          status: 'IN_PROGRESS'
        }
      })

      expect(updateResult.errors).toBeUndefined()
      expect(updateResult.data.updateHSWorkOrderStatus.status).toBe('IN_PROGRESS')

      // Delete work order
      const deleteResult = await testClient.mutate({
        mutation: `
          mutation DeleteWorkOrder($id: ID!) {
            deleteHSWorkOrder(id: $id) {
              success
              message
            }
          }
        `,
        variables: { id: workOrderId }
      })

      expect(deleteResult.errors).toBeUndefined()
      expect(deleteResult.data.deleteHSWorkOrder.success).toBe(true)
    })

    it('should enforce business isolation', async () => {
      // Create work order in different business
      const otherClient = await createTestClient({ 
        businessId: 'other-business-id' 
      })

      const queryResult = await otherClient.query({
        query: `
          query GetWorkOrders {
            hsWorkOrders {
              edges {
                node {
                  id
                  title
                }
              }
            }
          }
        `
      })

      // Should not see work orders from other businesses
      expect(queryResult.data.hsWorkOrders.edges).toHaveLength(0)
    })

    it('should handle concurrent updates', async () => {
      // Create work order
      const createResult = await testClient.mutate({
        mutation: CREATE_WORK_ORDER_MUTATION,
        variables: {
          input: {
            customerId: 'test-customer-1',
            title: 'Concurrent Test',
            items: [{ name: 'Service', quantity: 1, rate: 100 }]
          }
        }
      })

      const workOrderId = createResult.data.createHSWorkOrder.id

      // Concurrent updates
      const updates = await Promise.allSettled([
        testClient.mutate({
          mutation: UPDATE_WORK_ORDER_STATUS,
          variables: { id: workOrderId, status: 'ASSIGNED' }
        }),
        testClient.mutate({
          mutation: UPDATE_WORK_ORDER_STATUS,
          variables: { id: workOrderId, status: 'IN_PROGRESS' }
        })
      ])

      // At least one should succeed
      const successful = updates.filter(result => result.status === 'fulfilled')
      expect(successful).toHaveLength(1)
    })
  })

  describe('Real-time Subscriptions', () => {
    it('should receive work order updates via subscription', async () => {
      const subscription = testClient.subscribe({
        query: `
          subscription WorkOrderUpdates($businessId: ID!) {
            workOrderUpdates(businessId: $businessId) {
              id
              status
              updatedAt
            }
          }
        `,
        variables: { businessId: testBusinessId }
      })

      const updates: any[] = []
      const unsubscribe = subscription.subscribe({
        next: (data) => updates.push(data)
      })

      // Create work order (should trigger subscription)
      const createResult = await testClient.mutate({
        mutation: CREATE_WORK_ORDER_MUTATION,
        variables: {
          input: {
            customerId: 'test-customer-1',
            title: 'Subscription Test',
            items: [{ name: 'Test', quantity: 1, rate: 50 }]
          }
        }
      })

      const workOrderId = createResult.data.createHSWorkOrder.id

      // Update status (should trigger subscription)
      await testClient.mutate({
        mutation: UPDATE_WORK_ORDER_STATUS,
        variables: { id: workOrderId, status: 'ASSIGNED' }
      })

      // Wait for subscription updates
      await new Promise(resolve => setTimeout(resolve, 1000))

      expect(updates).toHaveLength(1)
      expect(updates[0].data.workOrderUpdates).toMatchObject({
        id: workOrderId,
        status: 'ASSIGNED'
      })

      unsubscribe()
    })
  })

  describe('Error Handling', () => {
    it('should handle validation errors', async () => {
      const result = await testClient.mutate({
        mutation: CREATE_WORK_ORDER_MUTATION,
        variables: {
          input: {
            customerId: '', // Invalid - empty customer ID
            title: '', // Invalid - empty title
            items: [] // Invalid - no items
          }
        }
      })

      expect(result.errors).toBeDefined()
      expect(result.errors[0].extensions.code).toBe('VALIDATION_ERROR')
      expect(result.errors[0].extensions.details).toMatchObject({
        customerId: 'Customer ID is required',
        title: 'Title is required',
        items: 'At least one item is required'
      })
    })

    it('should handle authorization errors', async () => {
      const unauthorizedClient = await createTestClient({ 
        permissions: [] // No permissions
      })

      const result = await unauthorizedClient.query({
        query: `
          query GetWorkOrders {
            hsWorkOrders {
              edges {
                node {
                  id
                }
              }
            }
          }
        `
      })

      expect(result.errors).toBeDefined()
      expect(result.errors[0].extensions.code).toBe('FORBIDDEN')
    })

    it('should handle resource not found', async () => {
      const result = await testClient.query({
        query: `
          query GetWorkOrder($id: ID!) {
            hsWorkOrder(id: $id) {
              id
              title
            }
          }
        `,
        variables: { id: 'non-existent-id' }
      })

      expect(result.errors).toBeDefined()
      expect(result.errors[0].extensions.code).toBe('RESOURCE_NOT_FOUND')
    })
  })
})
```

### Database Integration Tests

```typescript
// tests/integration/database.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createTestDatabase, TestDatabase } from './test-database'
import { WorkOrderRepository } from '../../src/repositories/work-order'

describe('Database Integration', () => {
  let testDb: TestDatabase
  let workOrderRepo: WorkOrderRepository

  beforeEach(async () => {
    testDb = await createTestDatabase()
    workOrderRepo = new WorkOrderRepository(testDb.client)
  })

  afterEach(async () => {
    await testDb.cleanup()
    await testDb.close()
  })

  describe('WorkOrder Repository', () => {
    it('should create work order with proper relationships', async () => {
      const workOrderData = {
        businessId: 'test-business',
        customerId: 'test-customer',
        title: 'Test Work Order',
        status: 'CREATED',
        items: [
          { name: 'Labor', quantity: 2, rate: 50 },
          { name: 'Parts', quantity: 1, rate: 25 }
        ]
      }

      const workOrder = await workOrderRepo.create(workOrderData)

      expect(workOrder.id).toBeDefined()
      expect(workOrder.total).toBe(125) // 2*50 + 1*25
      expect(workOrder.items).toHaveLength(2)

      // Verify database constraints
      const dbWorkOrder = await testDb.client
        .selectFrom('work_orders')
        .selectAll()
        .where('id', '=', workOrder.id)
        .executeTakeFirst()

      expect(dbWorkOrder).toMatchObject({
        business_id: 'test-business',
        customer_id: 'test-customer',
        title: 'Test Work Order',
        status: 'CREATED'
      })

      // Verify items are created
      const dbItems = await testDb.client
        .selectFrom('work_order_items')
        .selectAll()
        .where('work_order_id', '=', workOrder.id)
        .execute()

      expect(dbItems).toHaveLength(2)
    })

    it('should enforce business isolation at database level', async () => {
      const business1Id = 'business-1'
      const business2Id = 'business-2'

      // Create work orders in different businesses
      await workOrderRepo.create({
        businessId: business1Id,
        customerId: 'customer-1',
        title: 'Business 1 Work Order'
      })

      await workOrderRepo.create({
        businessId: business2Id,
        customerId: 'customer-2',
        title: 'Business 2 Work Order'
      })

      // Query should only return work orders for specific business
      const business1Orders = await workOrderRepo.findMany({
        businessId: business1Id
      })

      expect(business1Orders).toHaveLength(1)
      expect(business1Orders[0].title).toBe('Business 1 Work Order')

      const business2Orders = await workOrderRepo.findMany({
        businessId: business2Id
      })

      expect(business2Orders).toHaveLength(1)
      expect(business2Orders[0].title).toBe('Business 2 Work Order')
    })

    it('should handle database transactions properly', async () => {
      await expect(async () => {
        await testDb.client.transaction().execute(async (trx) => {
          // Create work order
          const workOrder = await workOrderRepo
            .withTransaction(trx)
            .create({
              businessId: 'test-business',
              customerId: 'test-customer',
              title: 'Transaction Test'
            })

          // Simulate error after creation
          throw new Error('Simulated error')
        })
      }).rejects.toThrow('Simulated error')

      // Verify rollback - no work order should exist
      const workOrders = await workOrderRepo.findMany({
        businessId: 'test-business'
      })

      expect(workOrders).toHaveLength(0)
    })
  })

  describe('Row Level Security', () => {
    it('should enforce RLS policies', async () => {
      // Create work order as business 1
      const workOrder = await testDb.client
        .insertInto('work_orders')
        .values({
          business_id: 'business-1',
          customer_id: 'customer-1',
          title: 'RLS Test',
          status: 'CREATED'
        })
        .returningAll()
        .executeTakeFirst()

      // Try to access with different business context
      const rlsClient = testDb.client.withSchema('business-2')
      
      const result = await rlsClient
        .selectFrom('work_orders')
        .selectAll()
        .where('id', '=', workOrder.id)
        .execute()

      // Should not return any results due to RLS
      expect(result).toHaveLength(0)
    })
  })
})
```

---

## End-to-End Testing

### E2E Test Setup

```typescript
// tests/e2e/playwright.config.ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] }
    }
  ],

  webServer: {
    command: 'pnpm dev:hs',
    port: 3001,
    reuseExistingServer: !process.env.CI
  }
})
```

### Complete User Workflow Tests

```typescript
// tests/e2e/work-order-workflow.spec.ts
import { test, expect, Page } from '@playwright/test'

test.describe('Work Order Management Workflow', () => {
  let page: Page

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage
    
    // Login and navigate to work orders
    await page.goto('/login')
    await page.fill('[data-testid=email-input]', 'test@example.com')
    await page.fill('[data-testid=password-input]', 'password123')
    await page.click('[data-testid=login-button]')
    
    // Wait for navigation and GraphQL data load
    await page.waitForURL('/hs/dashboard')
    await page.waitForSelector('[data-testid=work-order-list]')
  })

  test('should create work order end-to-end', async () => {
    // Navigate to create work order
    await page.click('[data-testid=create-work-order-button]')
    await page.waitForURL('/hs/work-orders/create')

    // Fill work order form
    await page.fill('[data-testid=work-order-title]', 'E2E Test Work Order')
    await page.fill('[data-testid=work-order-description]', 'End-to-end test description')
    
    // Select customer
    await page.click('[data-testid=customer-select]')
    await page.waitForSelector('[data-testid=customer-dropdown]')
    await page.click('[data-testid=customer-option]:first-child')

    // Add work order item
    await page.click('[data-testid=add-item-button]')
    await page.fill('[data-testid=item-name-0]', 'Test Service')
    await page.fill('[data-testid=item-quantity-0]', '2')
    await page.fill('[data-testid=item-rate-0]', '75.00')

    // Set priority
    await page.click('[data-testid=priority-select]')
    await page.click('[data-testid=priority-high]')

    // Submit form
    await page.click('[data-testid=submit-work-order]')
    
    // Wait for creation and navigation back
    await page.waitForURL('/hs/work-orders')
    
    // Verify work order appears in list
    await page.waitForSelector('[data-testid=work-order-card]')
    const workOrderCards = page.locator('[data-testid=work-order-card]')
    await expect(workOrderCards.first()).toContainText('E2E Test Work Order')
    await expect(workOrderCards.first()).toContainText('$150.00')
  })

  test('should update work order status with real-time updates', async () => {
    // Find first work order
    await page.waitForSelector('[data-testid=work-order-card]')
    const firstCard = page.locator('[data-testid=work-order-card]').first()
    
    // Get initial status
    const initialStatus = await firstCard.locator('[data-testid=status-badge]').textContent()
    
    // Open work order details
    await firstCard.click()
    await page.waitForSelector('[data-testid=work-order-details]')
    
    // Change status
    await page.click('[data-testid=status-dropdown]')
    await page.click('[data-testid=status-in-progress]')
    
    // Verify optimistic update
    await expect(page.locator('[data-testid=status-badge]')).toContainText('In Progress')
    
    // Wait for GraphQL mutation to complete
    await page.waitForResponse(response => 
      response.url().includes('/graphql') && response.request().postData()?.includes('updateHSWorkOrderStatus')
    )
    
    // Navigate back to list
    await page.click('[data-testid=back-button]')
    await page.waitForURL('/hs/work-orders')
    
    // Verify status updated in list (real-time subscription)
    await page.waitForSelector('[data-testid=work-order-card]')
    const updatedCard = page.locator('[data-testid=work-order-card]').first()
    await expect(updatedCard.locator('[data-testid=status-badge]')).toContainText('In Progress')
  })

  test('should handle offline scenarios gracefully', async () => {
    // Go offline
    await page.context().setOffline(true)
    
    // Try to create work order
    await page.click('[data-testid=create-work-order-button]')
    await page.waitForURL('/hs/work-orders/create')
    
    await page.fill('[data-testid=work-order-title]', 'Offline Test')
    await page.click('[data-testid=submit-work-order]')
    
    // Should show offline message
    await expect(page.locator('[data-testid=offline-message]')).toBeVisible()
    
    // Go back online
    await page.context().setOffline(false)
    
    // Should automatically retry and succeed
    await page.waitForURL('/hs/work-orders')
    
    // Verify work order was created when back online
    await expect(page.locator('[data-testid=work-order-card]')).toContainText('Offline Test')
  })

  test('should handle GraphQL errors gracefully', async () => {
    // Mock GraphQL error response
    await page.route('**/graphql', async route => {
      if (route.request().postData()?.includes('createHSWorkOrder')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            errors: [
              {
                message: 'Customer not found',
                extensions: {
                  code: 'RESOURCE_NOT_FOUND'
                }
              }
            ]
          })
        })
      } else {
        await route.continue()
      }
    })
    
    // Try to create work order
    await page.click('[data-testid=create-work-order-button]')
    await page.waitForURL('/hs/work-orders/create')
    
    await page.fill('[data-testid=work-order-title]', 'Error Test')
    await page.click('[data-testid=submit-work-order]')
    
    // Should show error message
    await expect(page.locator('[data-testid=error-message]')).toContainText('Customer not found')
    
    // Should remain on create page
    await expect(page).toHaveURL('/hs/work-orders/create')
  })

  test('should support keyboard navigation', async () => {
    await page.waitForSelector('[data-testid=work-order-list]')
    
    // Focus first work order
    await page.keyboard.press('Tab')
    await expect(page.locator('[data-testid=work-order-card]').first()).toBeFocused()
    
    // Navigate with arrow keys
    await page.keyboard.press('ArrowDown')
    await expect(page.locator('[data-testid=work-order-card]').nth(1)).toBeFocused()
    
    // Open with Enter
    await page.keyboard.press('Enter')
    await page.waitForSelector('[data-testid=work-order-details]')
  })

  test('should be accessible to screen readers', async () => {
    // Run axe accessibility tests
    await page.waitForSelector('[data-testid=work-order-list]')
    
    const accessibilityScanResults = await page.evaluate(() => {
      return new Promise((resolve) => {
        // @ts-ignore - axe is loaded via script
        axe.run((err, results) => {
          resolve(results)
        })
      })
    })
    
    // @ts-ignore
    expect(accessibilityScanResults.violations).toHaveLength(0)
  })
})
```

### Cross-Browser Compatibility Tests

```typescript
// tests/e2e/cross-browser.spec.ts
import { test, expect, devices } from '@playwright/test'

const browserTests = [
  { name: 'Chrome', ...devices['Desktop Chrome'] },
  { name: 'Firefox', ...devices['Desktop Firefox'] },
  { name: 'Safari', ...devices['Desktop Safari'] },
  { name: 'Edge', ...devices['Desktop Edge'] }
]

browserTests.forEach(({ name, ...device }) => {
  test.describe(`${name} Browser Tests`, () => {
    test.use(device)

    test('GraphQL operations work correctly', async ({ page }) => {
      await page.goto('/hs/work-orders')
      
      // Login
      await page.fill('[data-testid=email-input]', 'test@example.com')
      await page.fill('[data-testid=password-input]', 'password123')
      await page.click('[data-testid=login-button]')
      
      // Wait for GraphQL query to complete
      await page.waitForResponse(response => 
        response.url().includes('/graphql') && 
        response.request().postData()?.includes('hsWorkOrders')
      )
      
      // Verify data loaded
      await expect(page.locator('[data-testid=work-order-card]')).toBeVisible()
    })

    test('Real-time subscriptions work', async ({ page }) => {
      await page.goto('/hs/dashboard')
      await page.fill('[data-testid=email-input]', 'test@example.com')
      await page.fill('[data-testid=password-input]', 'password123')
      await page.click('[data-testid=login-button]')
      
      // Wait for WebSocket connection
      await page.waitForEvent('websocket')
      
      // Should receive real-time updates
      const wsPromise = page.waitForEvent('websocket', ws => {
        return ws.url().includes('graphql')
      })
      
      const ws = await wsPromise
      expect(ws).toBeDefined()
    })
  })
})
```

---

## Performance Testing

### Load Testing GraphQL Endpoints

```typescript
// tests/performance/load-test.ts
import { test, expect } from '@playwright/test'
import { performance } from 'perf_hooks'

test.describe('GraphQL Performance Tests', () => {
  test('should handle concurrent queries efficiently', async ({ page }) => {
    const startTime = performance.now()
    
    // Simulate 50 concurrent users
    const promises = Array.from({ length: 50 }, async (_, index) => {
      const userPage = await page.context().newPage()
      
      return userPage.evaluate(async (userIndex) => {
        const response = await fetch('/api/v1/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer test-token-${userIndex}`
          },
          body: JSON.stringify({
            query: `
              query GetWorkOrders {
                hsWorkOrders(pagination: { first: 20 }) {
                  edges {
                    node {
                      id
                      title
                      status
                      customer {
                        fullName
                      }
                    }
                  }
                }
              }
            `
          })
        })
        
        return {
          status: response.status,
          timing: performance.now()
        }
      }, index)
    })
    
    const results = await Promise.all(promises)
    const endTime = performance.now()
    
    // All requests should succeed
    expect(results.every(r => r.status === 200)).toBe(true)
    
    // Total time should be reasonable
    expect(endTime - startTime).toBeLessThan(5000) // 5 seconds
    
    // Calculate average response time
    const avgResponseTime = results.reduce((sum, r) => sum + r.timing, 0) / results.length
    expect(avgResponseTime).toBeLessThan(1000) // 1 second average
  })

  test('should optimize query performance', async ({ page }) => {
    await page.goto('/hs/work-orders')
    
    // Measure GraphQL query performance
    const queryStart = performance.now()
    
    const response = await page.waitForResponse(response => 
      response.url().includes('/graphql') && 
      response.request().postData()?.includes('hsWorkOrders')
    )
    
    const queryEnd = performance.now()
    const queryTime = queryEnd - queryStart
    
    // Query should complete within reasonable time
    expect(queryTime).toBeLessThan(2000) // 2 seconds
    
    // Check response size
    const responseBody = await response.text()
    expect(responseBody.length).toBeLessThan(500000) // 500KB
  })

  test('should handle large datasets efficiently', async ({ page }) => {
    // Test with large pagination
    const largeQueryResponse = await page.evaluate(async () => {
      const start = performance.now()
      
      const response = await fetch('/api/v1/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify({
          query: `
            query GetManyWorkOrders {
              hsWorkOrders(pagination: { first: 100 }) {
                edges {
                  node {
                    id
                    title
                    status
                  }
                }
                totalCount
              }
            }
          `
        })
      })
      
      const data = await response.json()
      const end = performance.now()
      
      return {
        timing: end - start,
        count: data.data?.hsWorkOrders?.edges?.length || 0,
        totalCount: data.data?.hsWorkOrders?.totalCount || 0
      }
    })
    
    // Should handle 100 items efficiently
    expect(largeQueryResponse.timing).toBeLessThan(3000)
    expect(largeQueryResponse.count).toBeLessThanOrEqual(100)
  })

  test('should optimize subscription performance', async ({ page }) => {
    await page.goto('/hs/dashboard')
    
    // Establish WebSocket connection
    const wsPromise = page.waitForEvent('websocket')
    await page.evaluate(() => {
      // Start subscription
      const ws = new WebSocket('wss://localhost:3001/graphql')
      ws.send(JSON.stringify({
        type: 'start',
        payload: {
          query: `
            subscription WorkOrderUpdates {
              workOrderUpdates {
                id
                status
                updatedAt
              }
            }
          `
        }
      }))
    })
    
    const ws = await wsPromise
    
    // Measure subscription message timing
    const messagePromise = page.waitForEvent('websocket', ws => {
      return ws.type() === 'framereceived'
    })
    
    // Trigger update that should send subscription message
    await page.evaluate(() => {
      fetch('/api/v1/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation TriggerUpdate {
              updateHSWorkOrderStatus(id: "test-id", status: IN_PROGRESS) {
                id
                status
              }
            }
          `
        })
      })
    })
    
    const messageStart = performance.now()
    await messagePromise
    const messageEnd = performance.now()
    
    // Subscription message should arrive quickly
    expect(messageEnd - messageStart).toBeLessThan(1000)
  })
})
```

### Query Complexity Analysis

```typescript
// tests/performance/query-complexity.test.ts
import { describe, it, expect } from 'vitest'
import { buildSchema, validate, parse, visit } from 'graphql'
import { typeDefs } from '../../src/schema'

describe('Query Complexity Analysis', () => {
  const schema = buildSchema(typeDefs)

  function calculateQueryComplexity(query: string): number {
    const document = parse(query)
    let complexity = 0

    visit(document, {
      Field: (node) => {
        complexity += 1
        
        // List fields add complexity based on potential size
        if (node.name.value.endsWith('s')) {
          complexity += 5 // Base list penalty
        }
        
        // Nested fields add exponential complexity
        const depth = getFieldDepth(node)
        complexity += Math.pow(2, depth - 1)
      }
    })

    return complexity
  }

  function getFieldDepth(node: any, depth = 1): number {
    if (node.selectionSet) {
      const maxChildDepth = Math.max(
        ...node.selectionSet.selections.map(child => 
          getFieldDepth(child, depth + 1)
        )
      )
      return maxChildDepth
    }
    return depth
  }

  it('should reject overly complex queries', () => {
    const complexQuery = `
      query VeryComplexQuery {
        hsWorkOrders {
          edges {
            node {
              id
              customer {
                workOrders {
                  edges {
                    node {
                      customer {
                        workOrders {
                          edges {
                            node {
                              id
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `
    
    const complexity = calculateQueryComplexity(complexQuery)
    expect(complexity).toBeGreaterThan(1000) // Should be flagged as too complex
  })

  it('should allow reasonable queries', () => {
    const reasonableQuery = `
      query ReasonableQuery {
        hsWorkOrders(pagination: { first: 20 }) {
          edges {
            node {
              id
              title
              status
              customer {
                fullName
                phone
              }
              items {
                name
                quantity
                rate
              }
            }
          }
        }
      }
    `
    
    const complexity = calculateQueryComplexity(reasonableQuery)
    expect(complexity).toBeLessThan(100) // Should be acceptable
  })

  it('should optimize fragment usage', () => {
    const queryWithoutFragments = `
      query WithoutFragments {
        activeWorkOrders: hsWorkOrders(filters: [{field: "status", operator: EQUALS, value: "ACTIVE"}]) {
          edges {
            node {
              id
              title
              status
              customer {
                fullName
                phone
                email
              }
            }
          }
        }
        
        completedWorkOrders: hsWorkOrders(filters: [{field: "status", operator: EQUALS, value: "COMPLETED"}]) {
          edges {
            node {
              id
              title
              status
              customer {
                fullName
                phone
                email
              }
            }
          }
        }
      }
    `

    const queryWithFragments = `
      fragment WorkOrderDetails on HSWorkOrder {
        id
        title
        status
        customer {
          fullName
          phone
          email
        }
      }

      query WithFragments {
        activeWorkOrders: hsWorkOrders(filters: [{field: "status", operator: EQUALS, value: "ACTIVE"}]) {
          edges {
            node {
              ...WorkOrderDetails
            }
          }
        }
        
        completedWorkOrders: hsWorkOrders(filters: [{field: "status", operator: EQUALS, value: "COMPLETED"}]) {
          edges {
            node {
              ...WorkOrderDetails
            }
          }
        }
      }
    `
    
    const complexityWithoutFragments = calculateQueryComplexity(queryWithoutFragments)
    const complexityWithFragments = calculateQueryComplexity(queryWithFragments)
    
    // Fragment usage should not significantly increase complexity
    expect(Math.abs(complexityWithFragments - complexityWithoutFragments)).toBeLessThan(10)
  })
})
```

---

## Security Testing

### Authentication & Authorization Tests

```typescript
// tests/security/auth.test.ts
import { describe, it, expect } from 'vitest'
import { createTestClient } from '../test-utils'

describe('GraphQL Security Tests', () => {
  describe('Authentication', () => {
    it('should reject requests without authentication', async () => {
      const client = await createTestClient({ authenticated: false })
      
      const result = await client.query({
        query: `
          query GetWorkOrders {
            hsWorkOrders {
              edges {
                node {
                  id
                  title
                }
              }
            }
          }
        `
      })
      
      expect(result.errors).toBeDefined()
      expect(result.errors[0].extensions.code).toBe('UNAUTHENTICATED')
    })

    it('should reject expired tokens', async () => {
      const client = await createTestClient({ 
        token: 'expired.jwt.token'
      })
      
      const result = await client.query({
        query: `
          query GetWorkOrders {
            hsWorkOrders {
              edges {
                node {
                  id
                }
              }
            }
          }
        `
      })
      
      expect(result.errors).toBeDefined()
      expect(result.errors[0].extensions.code).toBe('UNAUTHENTICATED')
    })

    it('should validate business isolation', async () => {
      const client1 = await createTestClient({ businessId: 'business-1' })
      const client2 = await createTestClient({ businessId: 'business-2' })
      
      // Create work order in business 1
      await client1.mutate({
        mutation: `
          mutation CreateWorkOrder($input: HSWorkOrderInput!) {
            createHSWorkOrder(input: $input) {
              id
              title
            }
          }
        `,
        variables: {
          input: {
            customerId: 'customer-1',
            title: 'Business 1 Work Order',
            items: [{ name: 'Service', quantity: 1, rate: 100 }]
          }
        }
      })
      
      // Try to access from business 2
      const result = await client2.query({
        query: `
          query GetWorkOrders {
            hsWorkOrders {
              edges {
                node {
                  id
                  title
                }
              }
            }
          }
        `
      })
      
      // Should not see work orders from other business
      expect(result.data.hsWorkOrders.edges).toHaveLength(0)
    })
  })

  describe('Authorization', () => {
    it('should enforce field-level permissions', async () => {
      const client = await createTestClient({
        permissions: ['hs:work_orders:read'] // No customer read permission
      })
      
      const result = await client.query({
        query: `
          query GetWorkOrders {
            hsWorkOrders {
              edges {
                node {
                  id
                  title
                  customer {
                    fullName
                    email
                  }
                }
              }
            }
          }
        `
      })
      
      expect(result.errors).toBeDefined()
      expect(result.errors.some(error => 
        error.message.includes('Insufficient permissions for customer data')
      )).toBe(true)
    })

    it('should enforce mutation permissions', async () => {
      const client = await createTestClient({
        permissions: ['hs:work_orders:read'] // No write permission
      })
      
      const result = await client.mutate({
        mutation: `
          mutation CreateWorkOrder($input: HSWorkOrderInput!) {
            createHSWorkOrder(input: $input) {
              id
              title
            }
          }
        `,
        variables: {
          input: {
            customerId: 'customer-1',
            title: 'Unauthorized Creation',
            items: [{ name: 'Service', quantity: 1, rate: 100 }]
          }
        }
      })
      
      expect(result.errors).toBeDefined()
      expect(result.errors[0].extensions.code).toBe('FORBIDDEN')
    })
  })

  describe('Input Validation', () => {
    it('should sanitize input strings', async () => {
      const client = await createTestClient()
      
      const maliciousInput = {
        customerId: 'customer-1',
        title: '<script>alert("xss")</script>',
        description: '${JSON.stringify(process.env)}',
        items: [{ name: 'Service', quantity: 1, rate: 100 }]
      }
      
      const result = await client.mutate({
        mutation: `
          mutation CreateWorkOrder($input: HSWorkOrderInput!) {
            createHSWorkOrder(input: $input) {
              id
              title
              description
            }
          }
        `,
        variables: { input: maliciousInput }
      })
      
      expect(result.data.createHSWorkOrder.title).not.toContain('<script>')
      expect(result.data.createHSWorkOrder.description).not.toContain('process.env')
    })

    it('should prevent SQL injection attempts', async () => {
      const client = await createTestClient()
      
      const result = await client.query({
        query: `
          query SearchWorkOrders($search: String!) {
            searchWorkOrders(search: $search) {
              edges {
                node {
                  id
                  title
                }
              }
            }
          }
        `,
        variables: {
          search: "'; DROP TABLE work_orders; --"
        }
      })
      
      // Should not cause database error
      expect(result.errors).toBeUndefined()
      expect(result.data.searchWorkOrders.edges).toBeDefined()
    })

    it('should enforce input size limits', async () => {
      const client = await createTestClient()
      
      const largeInput = {
        customerId: 'customer-1',
        title: 'A'.repeat(10000), // Very large title
        items: [{ name: 'Service', quantity: 1, rate: 100 }]
      }
      
      const result = await client.mutate({
        mutation: `
          mutation CreateWorkOrder($input: HSWorkOrderInput!) {
            createHSWorkOrder(input: $input) {
              id
              title
            }
          }
        `,
        variables: { input: largeInput }
      })
      
      expect(result.errors).toBeDefined()
      expect(result.errors[0].extensions.code).toBe('VALIDATION_ERROR')
    })
  })

  describe('Rate Limiting', () => {
    it('should enforce query rate limits', async () => {
      const client = await createTestClient()
      
      // Make many requests quickly
      const requests = Array.from({ length: 100 }, () =>
        client.query({
          query: `
            query GetWorkOrders {
              hsWorkOrders {
                edges {
                  node {
                    id
                  }
                }
              }
            }
          `
        })
      )
      
      const results = await Promise.allSettled(requests)
      
      // Some requests should be rate limited
      const rateLimited = results.filter(result => 
        result.status === 'fulfilled' && 
        result.value.errors?.some(error => 
          error.extensions?.code === 'RATE_LIMIT_EXCEEDED'
        )
      )
      
      expect(rateLimited.length).toBeGreaterThan(0)
    })

    it('should enforce mutation rate limits more strictly', async () => {
      const client = await createTestClient()
      
      const requests = Array.from({ length: 20 }, (_, index) =>
        client.mutate({
          mutation: `
            mutation CreateWorkOrder($input: HSWorkOrderInput!) {
              createHSWorkOrder(input: $input) {
                id
              }
            }
          `,
          variables: {
            input: {
              customerId: 'customer-1',
              title: `Rate limit test ${index}`,
              items: [{ name: 'Service', quantity: 1, rate: 100 }]
            }
          }
        })
      )
      
      const results = await Promise.allSettled(requests)
      
      // Mutations should be rate limited more aggressively
      const successful = results.filter(result => 
        result.status === 'fulfilled' && !result.value.errors
      )
      
      expect(successful.length).toBeLessThan(10) // Should be limited
    })
  })
})
```

### Query Depth & Complexity Security

```typescript
// tests/security/query-limits.test.ts
import { describe, it, expect } from 'vitest'
import { createTestClient } from '../test-utils'

describe('Query Security Limits', () => {
  it('should reject deeply nested queries', async () => {
    const client = await createTestClient()
    
    const deepQuery = `
      query DeepQuery {
        hsWorkOrders {
          edges {
            node {
              customer {
                workOrders {
                  edges {
                    node {
                      customer {
                        workOrders {
                          edges {
                            node {
                              customer {
                                workOrders {
                                  edges {
                                    node {
                                      id
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `
    
    const result = await client.query({ query: deepQuery })
    
    expect(result.errors).toBeDefined()
    expect(result.errors[0].message).toContain('Query depth')
  })

  it('should reject queries with high complexity', async () => {
    const client = await createTestClient()
    
    // Query that would cause N+1 problems
    const complexQuery = `
      query ComplexQuery {
        hsWorkOrders {
          edges {
            node {
              id
              customer {
                workOrders {
                  edges {
                    node {
                      items {
                        name
                      }
                      technician {
                        workOrders {
                          edges {
                            node {
                              customer {
                                fullName
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `
    
    const result = await client.query({ query: complexQuery })
    
    expect(result.errors).toBeDefined()
    expect(result.errors[0].message).toContain('complexity')
  })

  it('should reject queries requesting too many records', async () => {
    const client = await createTestClient()
    
    const result = await client.query({
      query: `
        query LargeQuery {
          hsWorkOrders(pagination: { first: 10000 }) {
            edges {
              node {
                id
              }
            }
          }
        }
      `
    })
    
    expect(result.errors).toBeDefined()
    expect(result.errors[0].extensions.code).toBe('VALIDATION_ERROR')
  })
})
```

---

## Mock Data & Test Utilities

### Test Data Factory

```typescript
// tests/test-utils/factories.ts
import { faker } from '@faker-js/faker'

export interface MockWorkOrder {
  id?: string
  businessId?: string
  customerId?: string
  title?: string
  description?: string
  status?: string
  priority?: string
  items?: MockWorkOrderItem[]
  total?: number
  scheduledDate?: string
  createdAt?: string
  updatedAt?: string
}

export interface MockWorkOrderItem {
  id?: string
  name?: string
  description?: string
  quantity?: number
  rate?: number
  total?: number
}

export interface MockCustomer {
  id?: string
  businessId?: string
  fullName?: string
  email?: string
  phone?: string
  address?: MockAddress
  totalSpent?: number
  createdAt?: string
}

export interface MockAddress {
  street?: string
  city?: string
  state?: string
  zip?: string
  coordinates?: { lat: number; lng: number }
}

export const mockWorkOrder = (overrides: MockWorkOrder = {}): MockWorkOrder => {
  const items = overrides.items || [
    mockWorkOrderItem(),
    mockWorkOrderItem()
  ]
  
  const total = items.reduce((sum, item) => 
    sum + ((item.quantity || 1) * (item.rate || 0)), 0
  )

  return {
    id: faker.datatype.uuid(),
    businessId: faker.datatype.uuid(),
    customerId: faker.datatype.uuid(),
    title: faker.lorem.sentence(),
    description: faker.lorem.paragraph(),
    status: faker.helpers.arrayElement(['CREATED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED']),
    priority: faker.helpers.arrayElement(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
    items,
    total,
    scheduledDate: faker.date.future().toISOString(),
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
    ...overrides
  }
}

export const mockWorkOrderItem = (overrides: MockWorkOrderItem = {}): MockWorkOrderItem => {
  const quantity = overrides.quantity || faker.datatype.number({ min: 1, max: 5 })
  const rate = overrides.rate || faker.datatype.number({ min: 20, max: 200 })
  const total = quantity * rate

  return {
    id: faker.datatype.uuid(),
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    quantity,
    rate,
    total,
    ...overrides
  }
}

export const mockCustomer = (overrides: MockCustomer = {}): MockCustomer => {
  return {
    id: faker.datatype.uuid(),
    businessId: faker.datatype.uuid(),
    fullName: faker.name.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    address: mockAddress(),
    totalSpent: faker.datatype.number({ min: 100, max: 50000 }),
    createdAt: faker.date.past().toISOString(),
    ...overrides
  }
}

export const mockAddress = (overrides: Partial<MockAddress> = {}): MockAddress => {
  return {
    street: faker.address.streetAddress(),
    city: faker.address.city(),
    state: faker.address.state(),
    zip: faker.address.zipCode(),
    coordinates: {
      lat: faker.address.latitude(),
      lng: faker.address.longitude()
    },
    ...overrides
  }
}

// Batch factory functions
export const mockWorkOrders = (count: number, overrides: MockWorkOrder = {}): MockWorkOrder[] => {
  return Array.from({ length: count }, () => mockWorkOrder(overrides))
}

export const mockCustomers = (count: number, overrides: MockCustomer = {}): MockCustomer[] => {
  return Array.from({ length: count }, () => mockCustomer(overrides))
}

// Industry-specific mocks
export const mockRestaurantOrder = (overrides = {}) => ({
  id: faker.datatype.uuid(),
  orderNumber: faker.datatype.number({ min: 1000, max: 9999 }).toString(),
  orderType: faker.helpers.arrayElement(['DINE_IN', 'TAKEOUT', 'DELIVERY']),
  status: faker.helpers.arrayElement(['PENDING', 'IN_PREPARATION', 'READY', 'COMPLETED']),
  items: [
    {
      id: faker.datatype.uuid(),
      menuItemId: faker.datatype.uuid(),
      quantity: faker.datatype.number({ min: 1, max: 3 }),
      price: faker.datatype.number({ min: 8, max: 25 }),
      modifiers: []
    }
  ],
  subtotal: faker.datatype.number({ min: 20, max: 100 }),
  tax: faker.datatype.number({ min: 2, max: 10 }),
  total: faker.datatype.number({ min: 22, max: 110 }),
  createdAt: faker.date.recent().toISOString(),
  ...overrides
})

export const mockAutoRepairOrder = (overrides = {}) => ({
  id: faker.datatype.uuid(),
  workOrderNumber: `RO-${faker.datatype.number({ min: 10000, max: 99999 })}`,
  vehicleId: faker.datatype.uuid(),
  status: faker.helpers.arrayElement(['CREATED', 'DIAGNOSED', 'APPROVED', 'IN_PROGRESS', 'COMPLETED']),
  laborHours: faker.datatype.number({ min: 1, max: 8 }),
  partsTotal: faker.datatype.number({ min: 50, max: 1000 }),
  laborTotal: faker.datatype.number({ min: 100, max: 800 }),
  grandTotal: faker.datatype.number({ min: 150, max: 1800 }),
  estimatedCompletion: faker.date.future().toISOString(),
  createdAt: faker.date.recent().toISOString(),
  ...overrides
})
```

### GraphQL Test Client

```typescript
// tests/test-utils/graphql-client.ts
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import fetch from 'cross-fetch'

export interface TestClientOptions {
  authenticated?: boolean
  businessId?: string
  userId?: string
  permissions?: string[]
  token?: string
}

export class TestGraphQLClient {
  private client: ApolloClient<any>

  constructor(options: TestClientOptions = {}) {
    const httpLink = createHttpLink({
      uri: process.env.TEST_GRAPHQL_URL || 'http://localhost:4000/graphql',
      fetch
    })

    const authLink = setContext((_, { headers }) => {
      if (!options.authenticated) return { headers }

      const token = options.token || this.generateTestToken(options)

      return {
        headers: {
          ...headers,
          authorization: `Bearer ${token}`,
          'x-business-id': options.businessId || 'test-business',
          'x-user-id': options.userId || 'test-user'
        }
      }
    })

    this.client = new ApolloClient({
      link: authLink.concat(httpLink),
      cache: new InMemoryCache(),
      defaultOptions: {
        query: { errorPolicy: 'all' },
        mutate: { errorPolicy: 'all' }
      }
    })
  }

  private generateTestToken(options: TestClientOptions): string {
    // Generate test JWT token with specified claims
    const payload = {
      sub: options.userId || 'test-user',
      businessId: options.businessId || 'test-business',
      permissions: options.permissions || ['hs:*:*'],
      exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour
    }

    // In real tests, this would be signed with test key
    return `test.${Buffer.from(JSON.stringify(payload)).toString('base64')}.signature`
  }

  async query(options: any) {
    return this.client.query(options)
  }

  async mutate(options: any) {
    return this.client.mutate(options)
  }

  subscribe(options: any) {
    return this.client.subscribe(options)
  }

  getClient() {
    return this.client
  }

  async close() {
    await this.client.stop()
  }
}

export const createTestClient = (options?: TestClientOptions) => {
  return new TestGraphQLClient(options)
}
```

### Mock GraphQL Server

```typescript
// tests/test-utils/mock-server.ts
import { createServer } from 'http'
import { ApolloServer } from 'apollo-server-express'
import express from 'express'
import { typeDefs, resolvers } from './mock-schema'

export class MockGraphQLServer {
  private server: any
  private httpServer: any
  private port: number

  constructor(port = 4000) {
    this.port = port
  }

  async start() {
    const app = express()
    
    this.server = new ApolloServer({
      typeDefs,
      resolvers,
      context: ({ req }) => ({
        businessId: req.headers['x-business-id'] || 'test-business',
        userId: req.headers['x-user-id'] || 'test-user',
        permissions: ['hs:*:*'], // Full permissions for tests
        isAuthenticated: !!req.headers.authorization
      })
    })

    await this.server.start()
    this.server.applyMiddleware({ app })

    this.httpServer = createServer(app)
    
    return new Promise<void>((resolve) => {
      this.httpServer.listen(this.port, () => {
        console.log(`Mock GraphQL server running on port ${this.port}`)
        resolve()
      })
    })
  }

  async stop() {
    await this.server.stop()
    return new Promise<void>((resolve) => {
      this.httpServer.close(() => resolve())
    })
  }

  getUrl() {
    return `http://localhost:${this.port}${this.server.graphqlPath}`
  }
}

// Mock resolvers for testing
const mockResolvers = {
  Query: {
    hsWorkOrders: () => ({
      edges: [
        {
          node: mockWorkOrder(),
          cursor: 'cursor-1'
        }
      ],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: 'cursor-1',
        endCursor: 'cursor-1'
      },
      totalCount: 1
    }),
    
    hsCustomers: () => ({
      edges: [
        {
          node: mockCustomer(),
          cursor: 'cursor-1'
        }
      ],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: 'cursor-1',
        endCursor: 'cursor-1'
      },
      totalCount: 1
    })
  },

  Mutation: {
    createHSWorkOrder: (_, { input }) => ({
      id: faker.datatype.uuid(),
      ...input,
      status: 'CREATED',
      total: input.items.reduce((sum, item) => 
        sum + (item.quantity * item.rate), 0
      ),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  },

  Subscription: {
    workOrderUpdates: {
      subscribe: () => {
        // Return mock subscription iterator
        return {
          [Symbol.asyncIterator]: async function* () {
            while (true) {
              yield {
                workOrderUpdates: mockWorkOrder({
                  status: 'IN_PROGRESS'
                })
              }
              await new Promise(resolve => setTimeout(resolve, 5000))
            }
          }
        }
      }
    }
  }
}
```

---

## Industry-Specific Test Scenarios

### Home Services Testing Scenarios

```typescript
// tests/scenarios/home-services.test.ts
describe('Home Services Scenarios', () => {
  test('Technician mobile workflow', async () => {
    const client = createTestClient({
      permissions: ['hs:work_orders:read', 'hs:work_orders:write']
    })

    // 1. Technician gets assigned work orders
    const assignedOrders = await client.query({
      query: GET_ASSIGNED_WORK_ORDERS,
      variables: { technicianId: 'tech-123' }
    })

    expect(assignedOrders.data.assignedWorkOrders).toBeDefined()

    // 2. Start first work order
    const workOrderId = assignedOrders.data.assignedWorkOrders[0].id
    
    const startResult = await client.mutate({
      mutation: START_WORK_ORDER,
      variables: {
        id: workOrderId,
        location: { lat: 40.7128, lng: -74.0060 }
      }
    })

    expect(startResult.data.startWorkOrder.status).toBe('IN_PROGRESS')

    // 3. Add photos during work
    const photoResult = await client.mutate({
      mutation: ADD_WORK_ORDER_PHOTO,
      variables: {
        workOrderId,
        photo: {
          uri: 'data:image/jpeg;base64,/9j/4AAQ...',
          type: 'BEFORE'
        }
      }
    })

    expect(photoResult.data.addWorkOrderPhoto).toBeDefined()

    // 4. Complete work order with customer signature
    const completeResult = await client.mutate({
      mutation: COMPLETE_WORK_ORDER,
      variables: {
        id: workOrderId,
        customerSignature: 'signature-data',
        notes: 'Work completed successfully'
      }
    })

    expect(completeResult.data.completeWorkOrder.status).toBe('COMPLETED')
  })

  test('Dispatch optimization scenario', async () => {
    const client = createTestClient()

    // Create multiple work orders in different locations
    const workOrders = await Promise.all([
      client.mutate({
        mutation: CREATE_WORK_ORDER,
        variables: {
          input: {
            customerId: 'customer-1',
            title: 'Plumbing Repair',
            address: { lat: 40.7580, lng: -73.9855 },
            priority: 'HIGH'
          }
        }
      }),
      client.mutate({
        mutation: CREATE_WORK_ORDER,
        variables: {
          input: {
            customerId: 'customer-2',
            title: 'HVAC Maintenance',
            address: { lat: 40.7505, lng: -73.9934 },
            priority: 'MEDIUM'
          }
        }
      })
    ])

    // Get optimal technician assignments
    const optimizationResult = await client.query({
      query: OPTIMIZE_TECHNICIAN_ROUTES,
      variables: {
        date: new Date().toISOString().split('T')[0]
      }
    })

    expect(optimizationResult.data.optimizedRoutes).toBeDefined()
    expect(optimizationResult.data.optimizedRoutes.length).toBeGreaterThan(0)
  })
})
```

### Restaurant Testing Scenarios

```typescript
// tests/scenarios/restaurant.test.ts
describe('Restaurant Scenarios', () => {
  test('Kitchen display system workflow', async () => {
    const client = createTestClient({
      permissions: ['rest:orders:read', 'rest:orders:write']
    })

    // 1. New order comes in
    const orderResult = await client.mutate({
      mutation: CREATE_RESTAURANT_ORDER,
      variables: {
        input: {
          orderType: 'DINE_IN',
          tableNumber: 5,
          items: [
            {
              menuItemId: 'burger-123',
              quantity: 2,
              modifiers: ['no-onion', 'extra-cheese']
            }
          ]
        }
      }
    })

    const orderId = orderResult.data.createRestOrder.id

    // 2. Kitchen receives order via subscription
    const subscription = client.subscribe({
      query: KITCHEN_ORDER_UPDATES,
      variables: { stationId: 'grill-station' }
    })

    const orderUpdates = []
    subscription.subscribe({
      next: (data) => orderUpdates.push(data)
    })

    // 3. Update order status through prep stages
    await client.mutate({
      mutation: UPDATE_ORDER_STATUS,
      variables: { orderId, status: 'IN_PREPARATION' }
    })

    await client.mutate({
      mutation: UPDATE_ORDER_STATUS,
      variables: { orderId, status: 'READY' }
    })

    // Wait for subscription updates
    await new Promise(resolve => setTimeout(resolve, 1000))

    expect(orderUpdates.length).toBeGreaterThan(0)
    expect(orderUpdates.some(update => 
      update.data.kitchenOrderUpdates.status === 'READY'
    )).toBe(true)
  })

  test('Peak hour performance scenario', async () => {
    const client = createTestClient()

    // Simulate 50 concurrent orders during peak hours
    const orderPromises = Array.from({ length: 50 }, (_, index) =>
      client.mutate({
        mutation: CREATE_RESTAURANT_ORDER,
        variables: {
          input: {
            orderType: 'TAKEOUT',
            items: [
              {
                menuItemId: `item-${index % 10}`,
                quantity: Math.floor(Math.random() * 3) + 1
              }
            ]
          }
        }
      })
    )

    const startTime = performance.now()
    const results = await Promise.allSettled(orderPromises)
    const endTime = performance.now()

    // All orders should be created successfully
    const successful = results.filter(r => r.status === 'fulfilled')
    expect(successful.length).toBe(50)

    // Should complete within reasonable time
    expect(endTime - startTime).toBeLessThan(5000) // 5 seconds
  })
})
```

### Auto Services Testing Scenarios

```typescript
// tests/scenarios/auto-services.test.ts
describe('Auto Services Scenarios', () => {
  test('Vehicle diagnostic workflow', async () => {
    const client = createTestClient()

    // 1. Create vehicle with diagnostic data
    const vehicleResult = await client.mutate({
      mutation: CREATE_VEHICLE,
      variables: {
        input: {
          vin: '1HGBH41JXMN109186',
          year: 2021,
          make: 'Honda',
          model: 'Civic',
          customerId: 'customer-123'
        }
      }
    })

    const vehicleId = vehicleResult.data.createVehicle.id

    // 2. Run diagnostic scan
    const diagnosticResult = await client.mutate({
      mutation: RUN_DIAGNOSTIC_SCAN,
      variables: {
        vehicleId,
        scanData: {
          codes: ['P0420', 'P0171'],
          mileage: 45000
        }
      }
    })

    expect(diagnosticResult.data.runDiagnosticScan.codes).toHaveLength(2)

    // 3. Generate service recommendations
    const recommendationsResult = await client.query({
      query: GET_SERVICE_RECOMMENDATIONS,
      variables: { vehicleId }
    })

    expect(recommendationsResult.data.serviceRecommendations).toBeDefined()

    // 4. Create repair order from recommendations
    const repairOrderResult = await client.mutate({
      mutation: CREATE_REPAIR_ORDER,
      variables: {
        input: {
          vehicleId,
          services: recommendationsResult.data.serviceRecommendations.map(rec => ({
            serviceId: rec.id,
            approved: rec.priority === 'HIGH'
          }))
        }
      }
    })

    expect(repairOrderResult.data.createRepairOrder.status).toBe('CREATED')
  })

  test('Parts inventory integration', async () => {
    const client = createTestClient()

    // 1. Create repair order requiring specific parts
    const repairOrderResult = await client.mutate({
      mutation: CREATE_REPAIR_ORDER,
      variables: {
        input: {
          vehicleId: 'vehicle-123',
          services: [
            {
              name: 'Brake Pad Replacement',
              parts: [
                { partNumber: 'BP-456', quantity: 4 },
                { partNumber: 'BR-789', quantity: 2 }
              ]
            }
          ]
        }
      }
    })

    // 2. Check parts availability
    const availabilityResult = await client.query({
      query: CHECK_PARTS_AVAILABILITY,
      variables: {
        partNumbers: ['BP-456', 'BR-789']
      }
    })

    expect(availabilityResult.data.partsAvailability).toBeDefined()

    // 3. Reserve parts for repair order
    const reservationResult = await client.mutate({
      mutation: RESERVE_PARTS,
      variables: {
        repairOrderId: repairOrderResult.data.createRepairOrder.id,
        parts: [
          { partNumber: 'BP-456', quantity: 4 },
          { partNumber: 'BR-789', quantity: 2 }
        ]
      }
    })

    expect(reservationResult.data.reserveParts.success).toBe(true)
  })
})
```

---

## Continuous Integration

### Jest/Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    testTimeout: 10000,
    hookTimeout: 10000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@tests': path.resolve(__dirname, './tests')
    }
  }
})

// tests/setup.ts
import { vi } from 'vitest'
import { setupServer } from 'msw/node'
import { graphql } from 'msw'
import { cleanup } from '@testing-library/react'

// Mock GraphQL server for testing
export const server = setupServer(
  graphql.query('GetWorkOrders', (req, res, ctx) => {
    return res(
      ctx.data({
        hsWorkOrders: {
          edges: [],
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false
          },
          totalCount: 0
        }
      })
    )
  })
)

// Setup
beforeAll(() => server.listen())
afterEach(() => {
  server.resetHandlers()
  cleanup()
})
afterAll(() => server.close())

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
```

### GitHub Actions Workflow

```yaml
# .github/workflows/graphql-tests.yml
name: GraphQL Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'pnpm'
    
    - name: Install dependencies
      run: pnpm install
    
    - name: Run unit tests
      run: pnpm test:unit --coverage
      env:
        NODE_ENV: test
    
    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/coverage-final.json

  integration-tests:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js 20.x
      uses: actions/setup-node@v3
      with:
        node-version: 20.x
        cache: 'pnpm'
    
    - name: Install dependencies
      run: pnpm install
    
    - name: Setup test database
      run: pnpm db:migrate:test
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
    
    - name: Run integration tests
      run: pnpm test:integration
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
        NODE_ENV: test

  e2e-tests:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js 20.x
      uses: actions/setup-node@v3
      with:
        node-version: 20.x
        cache: 'pnpm'
    
    - name: Install dependencies
      run: pnpm install
    
    - name: Install Playwright
      run: pnpm playwright install --with-deps
    
    - name: Build application
      run: pnpm build
      env:
        NODE_ENV: production
    
    - name: Start application
      run: pnpm start &
      env:
        NODE_ENV: test
    
    - name: Wait for server
      run: npx wait-on http://localhost:3000
    
    - name: Run Playwright tests
      run: pnpm test:e2e
    
    - uses: actions/upload-artifact@v3
      if: failure()
      with:
        name: playwright-report
        path: playwright-report/

  performance-tests:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js 20.x
      uses: actions/setup-node@v3
      with:
        node-version: 20.x
        cache: 'pnpm'
    
    - name: Install dependencies
      run: pnpm install
    
    - name: Build application
      run: pnpm build
    
    - name: Run performance tests
      run: pnpm test:performance
    
    - name: Upload performance results
      uses: actions/upload-artifact@v3
      with:
        name: performance-results
        path: performance-results.json

  security-tests:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js 20.x
      uses: actions/setup-node@v3
      with:
        node-version: 20.x
        cache: 'pnpm'
    
    - name: Install dependencies
      run: pnpm install
    
    - name: Run security tests
      run: pnpm test:security
    
    - name: Run dependency audit
      run: pnpm audit --audit-level high
    
    - name: Run CodeQL Analysis
      uses: github/codeql-action/analyze@v2
      with:
        languages: typescript

  test-report:
    needs: [unit-tests, integration-tests, e2e-tests, performance-tests, security-tests]
    runs-on: ubuntu-latest
    if: always()
    
    steps:
    - name: Generate test report
      uses: actions/github-script@v6
      with:
        script: |
          const results = {
            unit: '${{ needs.unit-tests.result }}',
            integration: '${{ needs.integration-tests.result }}',
            e2e: '${{ needs.e2e-tests.result }}',
            performance: '${{ needs.performance-tests.result }}',
            security: '${{ needs.security-tests.result }}'
          }
          
          const passed = Object.values(results).filter(r => r === 'success').length
          const total = Object.keys(results).length
          
          console.log(`Test Results: ${passed}/${total} test suites passed`)
          
          if (passed !== total) {
            core.setFailed(`Some test suites failed: ${JSON.stringify(results)}`)
          }
```

### Test Scripts Configuration

```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run tests/unit",
    "test:integration": "vitest run tests/integration",
    "test:e2e": "playwright test",
    "test:performance": "vitest run tests/performance",
    "test:security": "vitest run tests/security",
    "test:watch": "vitest watch",
    "test:coverage": "vitest run --coverage",
    "test:ci": "pnpm test:unit && pnpm test:integration && pnpm test:e2e",
    "test:debug": "vitest --inspect-brk --no-coverage",
    "playwright:debug": "playwright test --debug",
    "playwright:ui": "playwright test --ui"
  }
}
```

---

## Testing Best Practices

### 1. Test Structure and Organization

```typescript
// Good: Clear test structure
describe('WorkOrder GraphQL Operations', () => {
  describe('Queries', () => {
    describe('hsWorkOrders', () => {
      it('should return paginated work orders', async () => {
        // Arrange
        const mockData = mockWorkOrders(5)
        mockDataSource.findMany.mockResolvedValue(mockData)

        // Act
        const result = await executeQuery(GET_WORK_ORDERS)

        // Assert
        expect(result.data.hsWorkOrders.edges).toHaveLength(5)
        expect(result.errors).toBeUndefined()
      })
    })
  })

  describe('Mutations', () => {
    describe('createHSWorkOrder', () => {
      it('should create work order with valid input', async () => {
        // Test implementation
      })
    })
  })
})
```

### 2. Test Data Management

```typescript
// Good: Use factories and fixtures
const testWorkOrder = mockWorkOrder({
  status: 'CREATED',
  priority: 'HIGH',
  items: [
    mockWorkOrderItem({ name: 'Test Service', rate: 100 })
  ]
})

// Bad: Hardcoded test data
const testWorkOrder = {
  id: 'wo-123',
  title: 'Test Work Order',
  status: 'CREATED',
  // ... lots of hardcoded fields
}
```

### 3. Error Testing

```typescript
// Good: Test all error scenarios
describe('Error Handling', () => {
  it('should handle authentication errors', async () => {
    const client = createTestClient({ authenticated: false })
    const result = await client.query({ query: GET_WORK_ORDERS })
    
    expect(result.errors).toBeDefined()
    expect(result.errors[0].extensions.code).toBe('UNAUTHENTICATED')
  })

  it('should handle validation errors', async () => {
    const result = await client.mutate({
      mutation: CREATE_WORK_ORDER,
      variables: { input: { title: '' } } // Invalid input
    })
    
    expect(result.errors).toBeDefined()
    expect(result.errors[0].extensions.code).toBe('VALIDATION_ERROR')
  })

  it('should handle network errors gracefully', async () => {
    // Mock network failure
    mockNetworkError()
    
    const result = await client.query({ query: GET_WORK_ORDERS })
    expect(result.error).toBeDefined()
  })
})
```

### 4. Performance Testing Guidelines

```typescript
// Good: Measure specific operations
it('should load work orders within performance budget', async () => {
  const startTime = performance.now()
  
  await client.query({
    query: GET_WORK_ORDERS,
    variables: { pagination: { first: 100 } }
  })
  
  const endTime = performance.now()
  expect(endTime - startTime).toBeLessThan(1000) // 1 second
})

// Test memory usage
it('should not cause memory leaks with subscriptions', async () => {
  const initialMemory = process.memoryUsage().heapUsed
  
  // Create and destroy many subscriptions
  for (let i = 0; i < 100; i++) {
    const subscription = client.subscribe({ query: WORK_ORDER_UPDATES })
    subscription.unsubscribe()
  }
  
  global.gc() // Force garbage collection if available
  
  const finalMemory = process.memoryUsage().heapUsed
  const memoryGrowth = finalMemory - initialMemory
  
  expect(memoryGrowth).toBeLessThan(10 * 1024 * 1024) // Less than 10MB
})
```

### 5. Test Environment Isolation

```typescript
// Good: Each test starts with clean state
describe('WorkOrder Operations', () => {
  beforeEach(async () => {
    await cleanupTestDatabase()
    await seedTestData()
  })

  afterEach(async () => {
    await cleanupTestDatabase()
  })

  // Tests...
})

// Use transactions for database tests
it('should rollback changes on error', async () => {
  await withTransaction(async (trx) => {
    await createWorkOrder(trx, workOrderData)
    throw new Error('Simulated error')
  })

  // Verify rollback occurred
  const workOrders = await findAllWorkOrders()
  expect(workOrders).toHaveLength(0)
})
```

---

## Conclusion

This comprehensive GraphQL Testing Documentation provides a complete testing strategy for GraphQL applications within the Thorbis Business OS ecosystem. The testing approach covers:

- **Unit Testing**: Resolvers, schema validation, and client-side operations
- **Integration Testing**: API integration, database operations, and real-time features
- **End-to-End Testing**: Complete user workflows and cross-browser compatibility
- **Performance Testing**: Load testing, query optimization, and subscription performance
- **Security Testing**: Authentication, authorization, input validation, and rate limiting
- **Test Utilities**: Mock data factories, test clients, and CI/CD integration

### Key Takeaways

1. **Comprehensive Coverage**: Test all layers from schema validation to complete user workflows
2. **Industry-Specific Testing**: Create realistic test scenarios for each business vertical
3. **Performance Focus**: Regular performance testing prevents regressions
4. **Security First**: Thorough security testing ensures application safety
5. **Automation**: Automated testing in CI/CD pipelines maintains quality

### Next Steps

1. **Implement Testing Infrastructure**: Set up test databases, mock servers, and CI/CD pipelines
2. **Create Test Data**: Build comprehensive test data factories for all industries
3. **Write Core Tests**: Start with unit tests for critical business logic
4. **Add Integration Tests**: Test GraphQL operations with real databases
5. **Expand to E2E**: Build complete user workflow tests
6. **Monitor Performance**: Set up continuous performance monitoring

### Additional Resources

- [GraphQL Integration Patterns](./GRAPHQL-INTEGRATION-PATTERNS.md)
- [GraphQL Performance Guide](./GRAPHQL-PERFORMANCE.md)
- [GraphQL Training Materials](../training/GRAPHQL-TRAINING.md)
- [GraphQL API Documentation](../../API-GRAPHQL-INDEX.md)

---

**Document Status**: ✅ Production Ready  
**Last Updated**: 2025-01-31  
**Next Review**: 2025-02-28