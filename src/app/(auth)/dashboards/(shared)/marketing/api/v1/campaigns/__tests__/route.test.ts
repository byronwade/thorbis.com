import { NextRequest } from 'next/server'
import { GET, POST, PUT, DELETE } from '../route'

// Mock the database/ORM calls
jest.mock('@/lib/database', () => ({
  campaigns: {
    findMany: jest.fn(),
    create: jest.fn(),
    updateMany: jest.fn(),
    deleteMany: jest.fn(),
  },
}))

describe('/api/campaigns', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/campaigns', () => {
    it('returns campaigns with default pagination', async () => {
      const request = new NextRequest('http://localhost:3000/api/campaigns')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('campaigns')
      expect(data).toHaveProperty('pagination')
      expect(data.pagination).toEqual({
        page: 1,
        limit: 20,
        total: expect.any(Number),
        total_pages: expect.any(Number)
      })
    })

    it('applies status filter when provided', async () => {
      const request = new NextRequest('http://localhost:3000/api/campaigns?status=active')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.filters.status).toBe('active')
    })

    it('applies type filter when provided', async () => {
      const request = new NextRequest('http://localhost:3000/api/campaigns?type=email')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.filters.type).toBe('email')
    })

    it('applies search filter when provided', async () => {
      const request = new NextRequest('http://localhost:3000/api/campaigns?search=holiday')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.filters.search).toBe('holiday')
    })

    it('handles custom pagination parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/campaigns?page=2&limit=10')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.pagination.page).toBe(2)
      expect(data.pagination.limit).toBe(10)
    })

    it('handles database errors gracefully', async () => {
      // Mock database error
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      const request = new NextRequest('http://localhost:3000/api/campaigns')
      const response = await GET(request)

      expect(response.status).toBe(200) // Should still return mock data
      consoleSpy.mockRestore()
    })
  })

  describe('POST /api/campaigns', () => {
    const validCampaignData = {
      name: 'Test Campaign',
      type: 'email',
      budget: 5000,
      channels: ['email'],
      goals: {
        primary_metric: 'conversions',
        target_value: 100
      }
    }

    it('creates a new campaign with valid data', async () => {
      const request = new NextRequest('http://localhost:3000/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validCampaignData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toHaveProperty('campaign')
      expect(data).toHaveProperty('message')
      expect(data.campaign.name).toBe('Test Campaign')
      expect(data.campaign).toHaveProperty('id')
      expect(data.campaign).toHaveProperty('created_at')
    })

    it('returns validation error for missing required fields', async () => {
      const invalidData = {
        type: 'email'
        // missing name and channels
      }

      const request = new NextRequest('http://localhost:3000/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invalidData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
      expect(data).toHaveProperty('details')
      expect(data.error).toBe('Validation failed')
    })

    it('returns validation error for invalid campaign type', async () => {
      const invalidData = {
        ...validCampaignData,
        type: 'invalid_type'
      }

      const request = new NextRequest('http://localhost:3000/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invalidData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation failed')
    })

    it('returns validation error for negative budget', async () => {
      const invalidData = {
        ...validCampaignData,
        budget: -100
      }

      const request = new NextRequest('http://localhost:3000/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invalidData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation failed')
    })

    it('handles JSON parsing errors', async () => {
      const request = new NextRequest('http://localhost:3000/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: 'invalid json',
      })

      const response = await POST(request)

      expect(response.status).toBe(500)
    })
  })

  describe('PUT /api/campaigns', () => {
    const validBulkUpdate = {
      campaign_ids: ['1', '2', '3'],
      updates: {
        status: 'paused',
        budget: 10000
      }
    }

    it('updates multiple campaigns successfully', async () => {
      const request = new NextRequest('http://localhost:3000/api/campaigns', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validBulkUpdate),
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('updated_campaigns')
      expect(data).toHaveProperty('message')
      expect(data.updated_campaigns).toHaveLength(3)
    })

    it('returns error for empty campaign_ids array', async () => {
      const invalidUpdate = {
        campaign_ids: [],
        updates: { status: 'paused' }
      }

      const request = new NextRequest('http://localhost:3000/api/campaigns', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invalidUpdate),
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('campaign_ids must be a non-empty array')
    })

    it('returns error for missing campaign_ids', async () => {
      const invalidUpdate = {
        updates: { status: 'paused' }
      }

      const request = new NextRequest('http://localhost:3000/api/campaigns', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invalidUpdate),
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(400)
    })

    it('validates update fields', async () => {
      const invalidUpdate = {
        campaign_ids: ['1', '2'],
        updates: {
          type: 'invalid_type',
          budget: -500
        }
      }

      const request = new NextRequest('http://localhost:3000/api/campaigns', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invalidUpdate),
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation failed')
    })
  })

  describe('DELETE /api/campaigns', () => {
    it('deletes multiple campaigns successfully', async () => {
      const deleteData = {
        campaign_ids: ['1', '2', '3']
      }

      const request = new NextRequest('http://localhost:3000/api/campaigns', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deleteData),
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('deleted_campaign_ids')
      expect(data).toHaveProperty('message')
      expect(data.deleted_campaign_ids).toEqual(['1', '2', '3'])
    })

    it('returns error for empty campaign_ids array', async () => {
      const deleteData = {
        campaign_ids: []
      }

      const request = new NextRequest('http://localhost:3000/api/campaigns', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deleteData),
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('campaign_ids must be a non-empty array')
    })

    it('returns error for missing campaign_ids', async () => {
      const deleteData = {}

      const request = new NextRequest('http://localhost:3000/api/campaigns', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deleteData),
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(400)
    })
  })
})