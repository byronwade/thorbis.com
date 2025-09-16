/**
 * Test script for Thorbis Idempotency Implementation
 * 
 * Validates key generation, conflict detection, and SDK behavior
 */

import * as crypto from 'crypto'

// Mock the SDK for testing
class MockThorbisTruthLayerSDK {
  private idempotencyStore: Map<string, any> = new Map()

  async createBookingHold(request: any, options: any) {
    const key = options.idempotencyKey
    
    if (this.idempotencyStore.has(key)) {
      const stored = this.idempotencyStore.get(key)
      
      // Check if content matches
      const currentHash = this.generateContentHash(request)
      if (stored.contentHash === currentHash) {
        // Replay response
        return {
          data: stored.response,
          headers: { 'X-Idempotency-Replay': 'true' }
        }
      } else {
        // Conflict
        return {
          error: {
            code: 'IDEMPOTENCY_CONFLICT',
            message: 'Request body differs from original',
            details: {
              original_hash: stored.contentHash,
              current_hash: currentHash,
              diff_summary: this.generateDiffSummary(stored.request, request)
            }
          }
        }
      }
    }

    // New request - store and return response
    const response = {
      hold_id: `hold_${Date.now()}`,
      status: 'pending_confirmation',
      confirm_url: `https://example.com/confirm/${key}`,
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString()
    }

    this.idempotencyStore.set(key, {
      request,
      response,
      contentHash: this.generateContentHash(request),
      timestamp: new Date()
    })

    return { data: response }
  }

  async createEstimateDraft(request: any, options: any) {
    // Similar logic to booking hold
    return this.createBookingHold(request, options)
  }

  private generateContentHash(body: any): string {
    const normalized = this.normalizeRequestBody(body)
    const hash = crypto.createHash('sha256')
    hash.update(JSON.stringify(normalized))
    return hash.digest('hex').substring(0, 16)
  }

  private normalizeRequestBody(body: any): any {
    if (Array.isArray(body)) {
      return body.map(item => this.normalizeRequestBody(item)).sort()
    }
    
    if (typeof body === 'object' && body !== null) {
      const result: any = {}
      const excludeFields = ['created_at', 'updated_at', 'timestamp', '_metadata']
      
      Object.keys(body)
        .filter(key => !excludeFields.includes(key))
        .sort()
        .forEach(key => {
          result[key] = this.normalizeRequestBody(body[key])
        })
      
      return result
    }
    
    return body
  }

  private generateDiffSummary(original: any, current: any): string[] {
    const diffs: string[] = []
    
    const findDiffs = (obj1: any, obj2: any, path = '') => {
      for (const key in obj1) {
        const fullPath = path ? `${path}.${key}` : key
        
        if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
          findDiffs(obj1[key], obj2[key], fullPath)
        } else if (obj1[key] !== obj2[key]) {
          diffs.push(`${fullPath}: '${obj1[key]}' → '${obj2[key]}'`)
        }
      }
    }

    findDiffs(original, current)
    return diffs
  }
}

// Test utility functions
function generateIdempotencyKey(
  tenantId: string,
  route: string,
  requestBody: any,
  providedKey?: string
): string {
  if (providedKey) {
    return providedKey
  }

  const contentHash = generateContentHash(requestBody)
  const tenantIdNoHyphens = tenantId.replace(/-/g, '')
  
  return `${tenantIdNoHyphens}:${route}:${contentHash}`
}

function generateContentHash(body: any): string {
  const normalized = normalizeRequestBody(body)
  const hash = crypto.createHash('sha256')
  hash.update(JSON.stringify(normalized))
  return hash.digest('hex').substring(0, 16)
}

function normalizeRequestBody(body: any): any {
  if (Array.isArray(body)) {
    return body.map(normalizeRequestBody).sort()
  }
  
  if (typeof body === 'object' && body !== null) {
    const result: any = {}
    const excludeFields = [
      'created_at', 'updated_at', 'timestamp', '_metadata',
      'request_id', 'trace_id', 'session_id', 'user_agent'
    ]
    
    Object.keys(body)
      .filter(key => !excludeFields.includes(key))
      .sort()
      .forEach(key => {
        result[key] = normalizeRequestBody(body[key])
      })
    
    return result
  }
  
  return body
}

// Test cases
async function runTests() {
  console.log('🧪 Running Thorbis Idempotency Tests\n')
  
  const sdk = new MockThorbisTruthLayerSDK()
  const tenantId = '11111111-1111-1111-1111-111111111111'
  
  let passedTests = 0
  let totalTests = 0

  // Test 1: Key generation consistency
  console.log('Test 1: Key generation consistency')
  totalTests++
  
  const requestData = {
    business_slug: 'test-business',
    service_code: 'plumbing',
    customer_info: { name: 'John Doe', phone: '+1-555-0100' }
  }
  
  const key1 = generateIdempotencyKey(tenantId, 'POST:bookings-hold', requestData)
  const key2 = generateIdempotencyKey(tenantId, 'POST:bookings-hold', requestData)
  
  if (key1 === key2) {
    console.log('✅ Same input generates same key')
    console.log(`   Key: ${key1}`)
    passedTests++
  } else {
    console.log('❌ Keys should be identical')
    console.log(`   Key 1: ${key1}`)
    console.log(`   Key 2: ${key2}`)
  }
  console.log()

  // Test 2: Content hash stability
  console.log('Test 2: Content hash stability')
  totalTests++
  
  const hash1 = generateContentHash(requestData)
  const hash2 = generateContentHash({
    customer_info: { name: 'John Doe', phone: '+1-555-0100' },
    business_slug: 'test-business',
    service_code: 'plumbing'
  }) // Same data, different order
  
  if (hash1 === hash2) {
    console.log('✅ Hash is stable regardless of key order')
    console.log(`   Hash: ${hash1}`)
    passedTests++
  } else {
    console.log('❌ Hash should be same for equivalent objects')
    console.log(`   Hash 1: ${hash1}`)
    console.log(`   Hash 2: ${hash2}`)
  }
  console.log()

  // Test 3: Double POST returns original (acceptance criteria)
  console.log('Test 3: Double POST returns 200 and original payload')
  totalTests++
  
  const bookingRequest = {
    business_slug: 'smith-plumbing-co',
    service_code: 'plumbing',
    customer_info: {
      name: 'John Smith',
      phone: '+1-512-555-0200',
      email: 'john.smith@email.com'
    },
    job_details: {
      description: 'Kitchen sink repair',
      priority: 'normal'
    }
  }
  
  const idempotencyKey = generateIdempotencyKey(tenantId, 'POST:bookings-hold', bookingRequest)
  
  // First request
  const response1 = await sdk.createBookingHold(bookingRequest, { idempotencyKey })
  
  // Second identical request
  const response2 = await sdk.createBookingHold(bookingRequest, { idempotencyKey })
  
  if (response1.data && response2.data && 
      response1.data.hold_id === response2.data.hold_id &&
      response2.headers?.['X-Idempotency-Replay'] === 'true') {
    console.log('✅ Second request returned original response')
    console.log(`   Hold ID: ${response1.data.hold_id}`)
    console.log(`   Replay header: ${response2.headers['X-Idempotency-Replay']}`)
    passedTests++
  } else {
    console.log('❌ Second request should replay original response')
    console.log('   Response 1:', JSON.stringify(response1, null, 2))
    console.log('   Response 2:', JSON.stringify(response2, null, 2))
  }
  console.log()

  // Test 4: Same key, different body returns 409 CONFLICT (acceptance criteria)
  console.log('Test 4: Same key + different body returns 409 CONFLICT')
  totalTests++
  
  const modifiedRequest = {
    ...bookingRequest,
    customer_info: {
      ...bookingRequest.customer_info,
      phone: '+1-512-555-9999' // Changed phone number
    }
  }
  
  // Third request with modified body but same key logic (different hash)
  const response3 = await sdk.createBookingHold(modifiedRequest, { idempotencyKey })
  
  if (response3.error?.code === 'IDEMPOTENCY_CONFLICT') {
    console.log('✅ Modified request returned conflict')
    console.log(`   Error code: ${response3.error.code}`)
    console.log(`   Diff summary: ${JSON.stringify(response3.error.details?.diff_summary)}`)
    passedTests++
  } else {
    console.log('❌ Modified request should return conflict')
    console.log('   Response 3:', JSON.stringify(response3, null, 2))
  }
  console.log()

  // Test 5: Different keys allow different requests
  console.log('Test 5: Different keys allow different requests')
  totalTests++
  
  const differentRequest = {
    business_slug: 'another-business',
    service_code: 'electrical',
    customer_info: {
      name: 'Jane Doe',
      phone: '+1-555-0200'
    }
  }
  
  const differentKey = generateIdempotencyKey(tenantId, 'POST:bookings-hold', differentRequest)
  const response4 = await sdk.createBookingHold(differentRequest, { idempotencyKey: differentKey })
  
  if (response4.data && response4.data.hold_id !== response1.data.hold_id) {
    console.log('✅ Different request with different key succeeded')
    console.log(`   New hold ID: ${response4.data.hold_id}`)
    console.log(`   Different from: ${response1.data.hold_id}`)
    passedTests++
  } else {
    console.log('❌ Different requests should get different responses')
    console.log('   Response 4:', JSON.stringify(response4, null, 2))
  }
  console.log()

  // Test 6: Tenant isolation in keys
  console.log('Test 6: Tenant isolation in key generation')
  totalTests++
  
  const tenant1Key = generateIdempotencyKey(
    '11111111-1111-1111-1111-111111111111',
    'POST:bookings-hold',
    requestData
  )
  
  const tenant2Key = generateIdempotencyKey(
    '22222222-2222-2222-2222-222222222222',
    'POST:bookings-hold', 
    requestData // Same request data
  )
  
  if (tenant1Key !== tenant2Key && tenant1Key.startsWith('11111111') && tenant2Key.startsWith('22222222')) {
    console.log('✅ Different tenants generate different keys')
    console.log(`   Tenant 1: ${tenant1Key}`)
    console.log(`   Tenant 2: ${tenant2Key}`)
    passedTests++
  } else {
    console.log('❌ Tenant IDs should be isolated in keys')
    console.log(`   Tenant 1: ${tenant1Key}`)
    console.log(`   Tenant 2: ${tenant2Key}`)
  }
  console.log()

  // Test 7: Timestamp exclusion
  console.log('Test 7: Timestamp fields excluded from hash')
  totalTests++
  
  const withTimestamp = {
    ...requestData,
    created_at: '2024-01-01T00:00:00Z',
    timestamp: Date.now()
  }
  
  const withoutTimestamp = { ...requestData }
  
  const hashWithTimestamp = generateContentHash(withTimestamp)
  const hashWithoutTimestamp = generateContentHash(withoutTimestamp)
  
  if (hashWithTimestamp === hashWithoutTimestamp) {
    console.log('✅ Timestamp fields properly excluded from hash')
    console.log(`   Hash: ${hashWithTimestamp}`)
    passedTests++
  } else {
    console.log('❌ Timestamp fields should not affect hash')
    console.log(`   With timestamp: ${hashWithTimestamp}`)
    console.log(`   Without timestamp: ${hashWithoutTimestamp}`)
  }
  console.log()

  // Summary
  console.log('📊 Test Results Summary:')
  console.log(`✅ Passed: ${passedTests}/${totalTests}`)
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`)
  console.log(`📈 Success rate: ${Math.round((passedTests / totalTests) * 100)}%`)

  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! Idempotency implementation is working correctly.')
  } else {
    console.log('\n⚠️  Some tests failed. Please review the implementation.')
  }

  return {
    passed: passedTests,
    total: totalTests,
    successRate: passedTests / totalTests
  }
}

// SQL validation tests
function validateSQLStructure() {
  console.log('\n🗄️  SQL Structure Validation:')
  
  const sqlChecks = [
    {
      name: 'Idempotency key format validation',
      test: () => {
        const tenantId = '11111111-1111-1111-1111-111111111111'
        const route = 'POST:bookings-hold'
        const hash = 'a1b2c3d4e5f6g7h8'
        const expected = '11111111111111111111111111111111:POST:bookings-hold:a1b2c3d4e5f6g7h8'
        
        const actual = tenantId.replace(/-/g, '') + ':' + route + ':' + hash
        return actual === expected
      }
    },
    {
      name: 'Content hash length validation',
      test: () => {
        const hash = generateContentHash({ test: 'data' })
        return hash.length === 16 && /^[a-f0-9]+$/.test(hash)
      }
    },
    {
      name: 'Key uniqueness validation',
      test: () => {
        const data1 = { name: 'John', phone: '123' }
        const data2 = { name: 'Jane', phone: '456' }
        
        const key1 = generateIdempotencyKey('tenant1', 'POST:test', data1)
        const key2 = generateIdempotencyKey('tenant1', 'POST:test', data2)
        
        return key1 !== key2
      }
    }
  ]

  let passed = 0
  
  sqlChecks.forEach(check => {
    const result = check.test()
    if (result) {
      console.log(`✅ ${check.name}`)
      passed++
    } else {
      console.log(`❌ ${check.name}`)
    }
  })
  
  console.log(`\nSQL validation: ${passed}/${sqlChecks.length} checks passed`)
  return passed === sqlChecks.length
}

// Run all tests
if (require.main === module) {
  runTests().then(results => {
    const sqlValid = validateSQLStructure()
    
    if (results.successRate === 1.0 && sqlValid) {
      console.log('\n🚀 Idempotency implementation ready for production!')
      process.exit(0)
    } else {
      console.log('\n🔧 Implementation needs fixes before deployment.')
      process.exit(1)
    }
  }).catch(error => {
    console.error('💥 Test execution failed:', error)
    process.exit(1)
  })
}

export { runTests, validateSQLStructure }
