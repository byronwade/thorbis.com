# Thorbis Truth Layer SDK

A TypeScript SDK for the Thorbis Truth Layer API - the public API system that provides verified, real-time business data for AI agents and partners.

## Features

- **Never Write on Open**: All mutation actions return confirmation URLs rather than executing immediately
- **Typed Interfaces**: Full TypeScript support with narrow error union types
- **Retry Logic**: Built-in exponential backoff retry for resilient API calls
- **Idempotency**: Helper functions for safe action execution
- **Rate Limiting**: Automatic handling of rate limit responses
- **Multi-tenant Support**: Built-in tenant context helpers

## Installation

```bash
npm install @thorbis/truth-layer-sdk
# or
yarn add @thorbis/truth-layer-sdk
# or
pnpm add @thorbis/truth-layer-sdk
```

## Quick Start

```typescript
import ThorbisTruthLayerSDK, { withIdempotencyKey, withRetry } from '@thorbis/truth-layer-sdk'

// Initialize SDK
const sdk = new ThorbisTruthLayerSDK({
  apiKey: 'your-api-key-here',
  baseURL: 'https://api.thorbis.com/v1'
})

// Check availability
const availability = await sdk.getAvailability({
  service_code: 'plumbing',
  zip: '78701',
  duration_minutes: 120
})

if (availability.data?.now_available.available) {
  // Create booking hold with idempotency
  const booking = await sdk.createBookingHold({
    business_slug: 'smith-plumbing-co',
    service_code: 'plumbing',
    requested_time: '2024-02-16T10:00:00Z',
    customer_info: {
      name: 'John Smith',
      phone: '+1-512-555-0200',
      email: 'john.smith@email.com'
    },
    job_details: {
      description: 'Kitchen sink not draining properly'
    }
  }, withIdempotencyKey())

  if (booking.data) {
    console.log('Booking hold created:', booking.data.confirm_url)
  }
}
```

## API Reference

### Read Endpoints (Rate Limited, Free Tier)

#### `getBusinessBySlug(slug: string)`
Get business profile including verification badges and license/insurance status.

#### `getAvailability(params: GetAvailabilityParams)`
Get real-time availability windows for service booking.

#### `getPriceBands(params: GetPriceBandsParams)`
Get pricing data with percentiles (p50/p75/p90) for services.

#### `getReviews(params: GetReviewsParams)`
Get invoice-verified reviews and ratings.

### Action Endpoints (Confirm-Flow Only)

#### `createBookingHold(request: CreateBookingHoldRequest, options?: RequestOptions)`
Create a temporary booking hold that expires after a set time. Returns confirmation URL.

#### `createEstimateDraft(request: CreateEstimateDraftRequest, options?: RequestOptions)`
Create a draft estimate for review. Returns confirmation URL.

#### `createPaymentLink(request: CreatePaymentLinkRequest, options?: RequestOptions)`
Create a secure payment link. Returns confirmation URL.

## Helper Functions

### `withIdempotencyKey(key?: string)`
Add idempotency key to prevent duplicate operations.

```typescript
const booking = await sdk.createBookingHold(data, withIdempotencyKey())
```

### `withTenant(tenantId: string)`
Add tenant context for multi-tenant scenarios.

```typescript
const business = await sdk.getBusinessBySlug('business-slug', withTenant('tenant-123'))
```

### `withRetry(maxRetries?: number, baseDelay?: number)`
Configure retry behavior with exponential backoff.

```typescript
const pricing = await sdk.getPriceBands(params, withRetry(5, 2000))
```

## Error Handling

The SDK uses narrow union types for predictable error handling:

```typescript
const result = await sdk.getAvailability(params)

if (result.error) {
  switch (result.error.code) {
    case 'VALIDATION_ERROR':
      console.log('Invalid parameters:', result.error.details)
      break
    case 'RATE_LIMIT':
      console.log('Rate limit exceeded, retry after:', result.error.details.reset_at)
      break
    case 'NOT_FOUND':
      console.log('Resource not found')
      break
    default:
      console.error('Unexpected error:', result.error.message)
  }
} else {
  // result.data is guaranteed to be defined
  console.log('Success:', result.data)
}
```

## Usage Examples

### Node.js - Check Availability and Book

```typescript
import ThorbisTruthLayerSDK, { withIdempotencyKey } from '@thorbis/truth-layer-sdk'

async function bookPlumbingService() {
  const sdk = new ThorbisTruthLayerSDK({
    apiKey: process.env.THORBIS_API_KEY!
  })

  // Check availability
  const availability = await sdk.getAvailability({
    service_code: 'plumbing',
    zip: '78701',
    when: '2024-02-16T10:00:00Z'
  })

  if (availability.error) {
    console.error('Availability check failed:', availability.error)
    return
  }

  if (availability.data.now_available.available) {
    // Create booking hold
    const booking = await sdk.createBookingHold({
      business_slug: 'smith-plumbing-co',
      service_code: 'plumbing',
      requested_time: '2024-02-16T10:00:00Z',
      customer_info: {
        name: 'John Smith',
        phone: '+1-512-555-0200'
      }
    }, withIdempotencyKey())

    if (booking.data) {
      console.log('Booking created! Confirm at:', booking.data.confirm_url)
    }
  }
}
```

### Next.js Server Action - Create Estimate

```typescript
'use server'
import ThorbisTruthLayerSDK, { withIdempotencyKey } from '@thorbis/truth-layer-sdk'

export async function createEstimate(formData: FormData) {
  const sdk = new ThorbisTruthLayerSDK({
    apiKey: process.env.THORBIS_API_KEY!
  })

  const response = await sdk.createEstimateDraft({
    business_slug: 'smith-plumbing-co',
    customer_info: {
      name: formData.get('customer_name') as string,
      email: formData.get('customer_email') as string,
      phone: formData.get('customer_phone') as string
    },
    project_details: {
      title: formData.get('project_title') as string,
      description: formData.get('project_description') as string,
      type: 'renovation'
    },
    line_items: JSON.parse(formData.get('line_items') as string),
    totals: JSON.parse(formData.get('totals') as string)
  }, withIdempotencyKey())

  if (response.error) {
    throw new Error(`Estimate creation failed: ${response.error.message}`)
  }

  return {
    draftId: response.data.draft_id,
    confirmUrl: response.data.confirm_url
  }
}
```

### Webhook Handler with Retry

```typescript
import ThorbisTruthLayerSDK, { withRetry } from '@thorbis/truth-layer-sdk'

export async function handleAvailabilityWebhook(webhookData: any) {
  const sdk = new ThorbisTruthLayerSDK({
    apiKey: process.env.THORBIS_API_KEY!,
    retries: 5
  })

  if (webhookData.event_type === 'availability.changed') {
    // Refresh availability data
    const response = await sdk.getAvailability({
      service_code: webhookData.data.service_code,
      zip: '78701'
    }, withRetry(5, 2000))

    if (response.data) {
      console.log('Updated availability:', response.data.now_available)
      // Update local cache, notify subscribers, etc.
      return true
    }
  }

  return false
}
```

## Configuration

### Environment Variables

```bash
THORBIS_API_KEY=your-api-key-here
THORBIS_API_URL=https://api.thorbis.com/v1  # Optional, defaults to production
```

### SDK Configuration

```typescript
const sdk = new ThorbisTruthLayerSDK({
  apiKey: 'your-api-key',
  baseURL: 'https://api.thorbis.com/v1',  // Optional
  timeout: 30000,                         // Optional, default 30s
  retries: 3,                            // Optional, default 3
  retryDelay: 1000                       // Optional, default 1s
})
```

## TypeScript Support

The SDK is written in TypeScript and provides full type safety:

- All request/response objects are fully typed
- Error codes use narrow union types for exhaustive handling
- Optional fields are properly marked and handled
- Generic types provide IntelliSense for nested objects

## Rate Limiting

The SDK automatically handles rate limiting:

- Includes rate limit headers in error responses
- Provides retry-after information
- Built-in exponential backoff for retries
- Configurable retry behavior per request

## Security

- All requests require valid JWT Bearer tokens
- Supports signed action links for confirmations
- Automatic request signing and validation
- No sensitive data stored in client-side code

## License

MIT - see LICENSE file for details.

## Support

- Documentation: https://docs.thorbis.com/truth-layer
- Issues: https://github.com/thorbis/truth-layer-sdk/issues
- Email: api-support@thorbis.com
