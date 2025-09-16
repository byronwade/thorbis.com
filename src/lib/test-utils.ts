/**
 * Test Utilities and Helpers
 * 
 * Provides testing infrastructure for API endpoints, database operations, and integrations
 */

import { NextRequest, NextResponse } from 'next/server'
import { executeQuery, executeTransaction } from './database'
import crypto from 'crypto'

// Test data factories
export class TestDataFactory {
  static createTestBusiness(overrides: Partial<unknown> = {}): unknown {
    return {
      id: crypto.randomUUID(),
      name: 'Test Business Inc.',
      industry: 'hs', // home services
      email: 'test@testbusiness.com',
      phone: '+1-555-0123',
      address: {
        street: '123 Test Street',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        country: 'US'
      },
      settings: {
        timezone: 'America/New_York',
        currency: 'USD',
        businessHours: {
          monday: { open: '09:00', close: '17:00' },
          tuesday: { open: '09:00', close: '17:00' },
          wednesday: { open: '09:00', close: '17:00' },
          thursday: { open: '09:00', close: '17:00' },
          friday: { open: '09:00', close: '17:00' },
          saturday: { closed: true },
          sunday: { closed: true }
        }
      },
      subscriptionStatus: 'active',
      onboardingStatus: 'completed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...overrides
    }
  }

  static createTestUser(businessId: string, overrides: Partial<unknown> = {}): unknown {
    return {
      id: crypto.randomUUID(),
      businessId,
      email: 'testuser@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'admin',
      permissions: [
        'hs.manage_customers',
        'hs.manage_work_orders',
        'hs.view_analytics',
        'billing.view',
        'users.manage',
        'audit.view',
        'compliance.view'
      ],
      industries: ['hs'],
      isActive: true,
      lastLoginAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...overrides
    }
  }

  static createTestApiKey(businessId: string, userId: string, overrides: Partial<unknown> = {}): unknown {
    const keyValue = 'sk_test_${crypto.randomBytes(24).toString('hex')}'
    return {
      id: crypto.randomUUID(),
      businessId,
      userId,
      name: 'Test API Key',
      key: keyValue,
      keyHash: crypto.createHash('sha256').update(keyValue).digest('hex'),
      permissions: [
        'hs.manage_customers',
        'hs.manage_work_orders',
        'rest.manage_orders',
        'auto.manage_repair_orders'
      ],
      isActive: true,
      lastUsedAt: null,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...overrides
    }
  }

  static createTestCustomer(businessId: string, overrides: Partial<unknown> = {}): unknown {
    return {
      id: crypto.randomUUID(),
      businessId,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-0199',
      address: {
        street: '456 Customer Ave',
        city: 'Customer City',
        state: 'CC',
        zipCode: '54321',
        country: 'US'
      },
      customerType: 'residential',
      status: 'active',
      tags: ['vip', 'referral'],
      notes: 'Test customer for automated testing',
      customFields: Record<string, unknown>,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...overrides
    }
  }

  static createTestWorkOrder(businessId: string, customerId: string, overrides: Partial<unknown> = {}): unknown {
    return {
      id: crypto.randomUUID(),
      businessId,
      customerId,
      title: 'Test Work Order - HVAC Repair',
      description: 'Air conditioning unit not cooling properly',
      status: 'scheduled',
      priority: 'medium',
      serviceType: 'hvac_repair',
      scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      estimatedDuration: 120, // 2 hours
      assignedTechnicians: [],
      address: {
        street: '456 Customer Ave',
        city: 'Customer City', 
        state: 'CC',
        zipCode: '54321',
        country: 'US'
      },
      items: [
        {
          id: crypto.randomUUID(),
          name: 'HVAC Diagnostic',
          description: 'Diagnostic service for AC unit',
          quantity: 1,
          rate: 125.00,
          total: 125.00,
          type: 'service'
        }
      ],
      subtotal: 125.00,
      tax: 10.00,
      total: 135.00,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...overrides
    }
  }

  static createTestOrder(businessId: string, overrides: Partial<unknown> = {}): unknown {
    return {
      id: crypto.randomUUID(),
      businessId,
      orderNumber: 'TEST-${Date.now()}',
      customerInfo: {
        name: 'Test Customer',
        email: 'customer@example.com',
        phone: '+1-555-0177'
      },
      type: 'dine_in',
      status: 'pending',
      items: [
        {
          id: crypto.randomUUID(),
          menuItemId: crypto.randomUUID(),
          name: 'Test Burger',
          price: 12.99,
          quantity: 2,
          modifiers: [
            { name: 'Extra Cheese', price: 1.50 }
          ],
          specialInstructions: 'No pickles',
          total: 28.48
        }
      ],
      subtotal: 28.48,
      tax: 2.28,
      tip: 5.00,
      total: 35.76,
      paymentStatus: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...overrides
    }
  }
}

// Test database utilities
export class TestDatabase {
  static async createTestBusiness(): Promise<{ business: unknown, user: unknown, apiKey: any }> {
    const business = TestDataFactory.createTestBusiness()
    const user = TestDataFactory.createTestUser(business.id)
    const apiKey = TestDataFactory.createTestApiKey(business.id, user.id)

    // Create business in database
    await executeQuery('shared', '
      INSERT INTO shared.businesses (
        id, name, industry, email, phone, address, settings, subscription_status,
        onboarding_status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    ', [
      business.id, business.name, business.industry, business.email,
      business.phone, JSON.stringify(business.address), JSON.stringify(business.settings),
      business.subscriptionStatus, business.onboardingStatus, business.createdAt, business.updatedAt
    ])

    // Create user
    await executeQuery('shared', '
      INSERT INTO shared.users (
        id, business_id, email, first_name, last_name, role, permissions,
        industries, is_active, last_login_at, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    ', [
      user.id, user.businessId, user.email, user.firstName, user.lastName,
      user.role, user.permissions, user.industries, user.isActive,
      user.lastLoginAt, user.createdAt, user.updatedAt
    ])

    // Create API key
    await executeQuery('shared', '
      INSERT INTO shared.api_keys (
        id, business_id, user_id, name, key_hash, permissions, is_active,
        last_used_at, expires_at, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    ', [
      apiKey.id, apiKey.businessId, apiKey.userId, apiKey.name,
      apiKey.keyHash, apiKey.permissions, apiKey.isActive,
      apiKey.lastUsedAt, apiKey.expiresAt, apiKey.createdAt, apiKey.updatedAt
    ])

    return { business, user, apiKey }
  }

  static async cleanupTestData(businessId: string): Promise<void> {
    await executeTransaction('shared', async (client) => {
      // Clean up in reverse dependency order
      await client.query('DELETE FROM shared.audit_logs WHERE business_id = $1', [businessId])
      await client.query('DELETE FROM shared.api_keys WHERE business_id = $1', [businessId])
      await client.query('DELETE FROM shared.users WHERE business_id = $1', [businessId])
      await client.query('DELETE FROM hs.work_orders WHERE business_id = $1', [businessId])
      await client.query('DELETE FROM hs.customers WHERE business_id = $1', [businessId])
      await client.query('DELETE FROM rest.orders WHERE business_id = $1', [businessId])
      await client.query('DELETE FROM auto.repair_orders WHERE business_id = $1', [businessId])
      await client.query('DELETE FROM shared.businesses WHERE id = $1', [businessId])
    })
  }
}

// Mock request/response helpers
export class MockRequestHelper {
  static createRequest(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    url: string,
    body?: any,
    headers: Record<string, string> = {}
  ): NextRequest {
    const requestInit: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    }

    if (body && method !== 'GET') {
      requestInit.body = JSON.stringify(body)
    }

    return new NextRequest(url, requestInit)
  }

  static createAuthenticatedRequest(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    url: string,
    apiKey: string,
    body?: any,
    additionalHeaders: Record<string, string> = {}
  ): NextRequest {
    return this.createRequest(method, url, body, {
      'Authorization`: `Bearer ${apiKey}`,
      ...additionalHeaders
    })
  }
}

// API testing utilities
export class ApiTestHelper {
  static async testEndpoint(
    handler: (request: NextRequest) => Promise<NextResponse>,
    request: NextRequest
  ): Promise<{
    status: number, data: unknown,
    headers: Headers
  }> {
    const response = await handler(request)
    const data = await response.json().catch(() => null)
    
    return {
      status: response.status,
      data,
      headers: response.headers
    }
  }

  static async expectSuccess(
    handler: (request: NextRequest) => Promise<NextResponse>,
    request: NextRequest,
    expectedStatus: number = 200
  ): Promise<unknown> {
    const result = await this.testEndpoint(handler, request)
    
    if (result.status !== expectedStatus) {
      throw new Error(`Expected status ${expectedStatus}, got ${result.status}: ${JSON.stringify(result.data)}`)
    }

    return result.data
  }

  static async expectError(
    handler: (request: NextRequest) => Promise<NextResponse>,
    request: NextRequest,
    expectedStatus: number,
    expectedErrorCode?: string
  ): Promise<unknown> {
    const result = await this.testEndpoint(handler, request)
    
    if (result.status !== expectedStatus) {
      throw new Error(`Expected error status ${expectedStatus}, got ${result.status}: ${JSON.stringify(result.data)}')
    }

    if (expectedErrorCode && result.data?.error?.code !== expectedErrorCode) {
      throw new Error('Expected error code ${expectedErrorCode}, got ${result.data?.error?.code}')
    }

    return result.data
  }
}

// Performance testing utilities
export class PerformanceTestHelper {
  static async measureResponseTime(
    operation: () => Promise<unknown>
  ): Promise<{ result: unknown, timeMs: number }> {
    const startTime = performance.now()
    const result = await operation()
    const endTime = performance.now()
    
    return {
      result,
      timeMs: endTime - startTime
    }
  }

  static async testConcurrentRequests(
    operations: (() => Promise<unknown>)[],
    maxConcurrency: number = 10
  ): Promise<{
    results: unknown[],
    totalTimeMs: number,
    averageTimeMs: number,
    successCount: number,
    errorCount: number
  }> {
    const startTime = performance.now()
    const results: unknown[] = []
    const successCount = 0
    const errorCount = 0

    // Process operations in batches
    for (const i = 0; i < operations.length; i += maxConcurrency) {
      const batch = operations.slice(i, i + maxConcurrency)
      const batchResults = await Promise.allSettled(
        batch.map(op => op())
      )

      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          results.push(result.value)
          successCount++
        } else {
          results.push({ error: result.reason.message })
          errorCount++
        }
      }
    }

    const endTime = performance.now()
    const totalTimeMs = endTime - startTime

    return {
      results,
      totalTimeMs,
      averageTimeMs: totalTimeMs / operations.length,
      successCount,
      errorCount
    }
  }
}

// Load testing utilities
export class LoadTestHelper {
  static async simulateLoad(
    operation: () => Promise<unknown>,
    {
      duration = 30000, // 30 seconds
      maxConcurrentRequests = 50,
      targetRPS = 10 // requests per second
    } = {}
  ): Promise<{
    totalRequests: number,
    successfulRequests: number,
    failedRequests: number,
    averageResponseTime: number,
    maxResponseTime: number,
    minResponseTime: number,
    requestsPerSecond: number
  }> {
    const startTime = Date.now()
    const endTime = startTime + duration
    const results: { success: boolean, responseTime: number }[] = []
    const activeRequests = 0
    const intervalMs = 1000 / targetRPS

    return new Promise((resolve) => {
      const interval = setInterval(async () => {
        if (Date.now() >= endTime) {
          clearInterval(interval)
          
          // Wait for all active requests to complete
          while (activeRequests > 0) {
            await new Promise(resolve => setTimeout(resolve, 100))
          }

          // Calculate statistics
          const successfulRequests = results.filter(r => r.success).length
          const failedRequests = results.filter(r => !r.success).length
          const responseTimes = results.map(r => r.responseTime)
          const averageResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
          const maxResponseTime = Math.max(...responseTimes)
          const minResponseTime = Math.min(...responseTimes)
          const actualDuration = Date.now() - startTime
          const requestsPerSecond = (results.length / actualDuration) * 1000

          resolve({
            totalRequests: results.length,
            successfulRequests,
            failedRequests,
            averageResponseTime,
            maxResponseTime,
            minResponseTime,
            requestsPerSecond
          })
          return
        }

        if (activeRequests >= maxConcurrentRequests) {
          return
        }

        activeRequests++
        
        const requestStart = performance.now()
        operation()
          .then(() => {
            results.push({
              success: true,
              responseTime: performance.now() - requestStart
            })
          })
          .catch(() => {
            results.push({
              success: false,
              responseTime: performance.now() - requestStart
            })
          })
          .finally(() => {
            activeRequests--
          })

      }, intervalMs)
    })
  }
}

// Export all utilities
export {
  TestDataFactory,
  TestDatabase,
  MockRequestHelper,
  ApiTestHelper,
  PerformanceTestHelper,
  LoadTestHelper
}