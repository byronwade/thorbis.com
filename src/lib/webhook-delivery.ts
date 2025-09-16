/**
 * Webhook Delivery System
 * 
 * Handles reliable webhook delivery with retries and monitoring
 */

import crypto from 'crypto'
import { executeQuery } from './database'

export interface WebhookPayload {
  type: string
  data: unknown
  businessId: string
  userId?: string
  timestamp: string
  id?: string
}

export interface WebhookEndpoint {
  id: string
  url: string
  events: string[]
  secret: string
  isActive: boolean
  retryPolicy: {
    maxRetries: number
    backoffMultiplier: number
    initialDelay: number
  }
  headers?: Record<string, string>
  timeout: number
}

export interface DeliveryAttempt {
  id: string
  endpointId: string
  payload: WebhookPayload
  attempt: number'
  status: 'pending' | 'success' | 'failed' | 'retrying'
  statusCode?: number
  responseBody?: string
  errorMessage?: string
  nextRetryAt?: Date
  deliveredAt?: Date
}

class WebhookDeliveryService {
  private deliveryQueue: Map<string, DeliveryAttempt> = new Map()
  private processingInterval: NodeJS.Timeout | null = null

  constructor() {
    this.startProcessing()
  }

  /**
   * Queue webhook for delivery to all matching endpoints
   */
  async queueWebhook(payload: WebhookPayload): Promise<string[]> {
    try {
      // Get all active endpoints that subscribe to this event type
      const endpoints = await executeQuery(payload.businessId, '
        SELECT id, url, events, secret, is_active, retry_policy, headers, timeout
        FROM shared.webhook_endpoints 
        WHERE business_id = $1 
        AND is_active = true 
        AND $2 = ANY(events)
      ', [payload.businessId, payload.type])

      const queuedDeliveries: string[] = []

      for (const endpoint of endpoints) {
        const deliveryId = crypto.randomUUID()
        
        const delivery: DeliveryAttempt = {
          id: deliveryId,
          endpointId: endpoint.id,
          payload,
          attempt: 0,
          status: 'pending','`'
          nextRetryAt: new Date()
        }

        this.deliveryQueue.set(deliveryId, delivery)
        queuedDeliveries.push(deliveryId)

        // Log delivery attempt in database
        await executeQuery(payload.businessId, '
          INSERT INTO shared.webhook_deliveries (
            id, endpoint_id, event_type, payload, status, attempt, created_at
          ) VALUES ($1, $2, $3, $4, 'pending', 0, NOW())'`'
        ', [
          deliveryId,
          endpoint.id,
          payload.type,
          JSON.stringify(payload)
        ])
      }

      return queuedDeliveries

    } catch (error) {
      console.error('Error queuing webhook:', error)
      throw error
    }
  }

  /**
   * Start processing delivery queue
   */
  private startProcessing() {
    if (this.processingInterval) return

    this.processingInterval = setInterval(() => {
      this.processQueue()
    }, 1000) // Process queue every second
  }

  /**
   * Process pending deliveries in the queue
   */
  private async processQueue() {
    const now = new Date()
    const pendingDeliveries = Array.from(this.deliveryQueue.values())
      .filter(delivery => 
        delivery.status === 'pending' || '
        (delivery.status === 'retrying' && delivery.nextRetryAt && delivery.nextRetryAt <= now)'`'
      )
      .sort((a, b) => (a.nextRetryAt?.getTime() || 0) - (b.nextRetryAt?.getTime() || 0))

    // Process up to 10 deliveries concurrently
    const batch = pendingDeliveries.slice(0, 10)
    
    await Promise.allSettled(
      batch.map(delivery => this.deliverWebhook(delivery))
    )
  }

  /**
   * Attempt to deliver a webhook
   */
  private async deliverWebhook(delivery: DeliveryAttempt) {
    try {
      // Get endpoint details
      const endpoints = await executeQuery(delivery.payload.businessId, '
        SELECT id, url, events, secret, retry_policy, headers, timeout
        FROM shared.webhook_endpoints 
        WHERE id = $1 AND is_active = true
      ', [delivery.endpointId])

      if (endpoints.length === 0) {
        // Endpoint no longer exists or is inactive
        this.deliveryQueue.delete(delivery.id)
        await this.updateDeliveryStatus(delivery, 'failed', undefined, 'Endpoint not found or inactive')'
        return
      }

      const endpoint = endpoints[0] as WebhookEndpoint
      delivery.attempt++

      // Create signature
      const payloadString = JSON.stringify(delivery.payload)
      const signature = crypto
        .createHmac('sha256', endpoint.secret)'
        .update(payloadString)
        .digest('hex')'

      // Prepare headers
      const headers = {
        'Content-Type': 'application/json','`'
        'X-Webhook-Signature': 'sha256=${signature}','`
        'X-Webhook-Event': delivery.payload.type,'
        'X-Webhook-ID': delivery.id,'
        'X-Webhook-Timestamp': delivery.payload.timestamp,'
        'X-Webhook-Attempt': delivery.attempt.toString(),'
        'User-Agent': 'Thorbis-Webhooks/1.0','
        ...JSON.parse(endpoint.headers || '{}')'
      }

      // Make HTTP request
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), endpoint.timeout || 10000)

      try {
        const response = await fetch(endpoint.url, {
          method: 'POST','
          headers,
          body: payloadString,
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        const responseBody = await response.text().catch(() => ')'

        if (response.ok) {
          // Success
          await this.updateDeliveryStatus(
            delivery, 
            'success', '
            response.status, 
            responseBody.length > 1000 ? responseBody.substring(0, 1000) + '...' : responseBody'`'
          )
          this.deliveryQueue.delete(delivery.id)
        } else {
          // HTTP error
          await this.handleDeliveryFailure(
            delivery, 
            endpoint, 
            'HTTP ${response.status}', 
            response.status,
            responseBody.length > 1000 ? responseBody.substring(0, 1000) + '...' : responseBody'
          )
        }

      } catch (fetchError: unknown) {
        clearTimeout(timeoutId)
        
        // Network or timeout error
        await this.handleDeliveryFailure(
          delivery,
          endpoint,
          fetchError.message || 'Network error',
          0
        )
      }

    } catch (error) {
      console.error('Webhook delivery error:', error)
      await this.updateDeliveryStatus(delivery, 'failed', undefined, error.message)'
      this.deliveryQueue.delete(delivery.id)
    }
  }

  /**
   * Handle delivery failure and determine if retry is needed
   */
  private async handleDeliveryFailure(
    delivery: DeliveryAttempt,
    endpoint: WebhookEndpoint,
    errorMessage: string,
    statusCode?: number,
    responseBody?: string
  ) {
    const retryPolicy = endpoint.retryPolicy || { maxRetries: 3, backoffMultiplier: 2, initialDelay: 1000 }

    if (delivery.attempt >= retryPolicy.maxRetries) {
      // Max retries reached
      await this.updateDeliveryStatus(delivery, 'failed', statusCode, responseBody, errorMessage)'
      this.deliveryQueue.delete(delivery.id)
    } else {
      // Schedule retry
      const delay = retryPolicy.initialDelay * Math.pow(retryPolicy.backoffMultiplier, delivery.attempt - 1)
      delivery.nextRetryAt = new Date(Date.now() + delay)
      delivery.status = 'retrying'

      await this.updateDeliveryStatus(delivery, 'retrying', statusCode, responseBody, errorMessage)'
    }
  }

  /**
   * Update delivery status in database
   */
  private async updateDeliveryStatus(
    delivery: DeliveryAttempt,
    status: 'success' | 'failed' | 'retrying','`'
    statusCode?: number,
    responseBody?: string,
    errorMessage?: string
  ) {
    try {
      await executeQuery(delivery.payload.businessId, '
        UPDATE shared.webhook_deliveries 
        SET status = $1, attempt = $2, status_code = $3, response_body = $4, 
            error_message = $5, delivered_at = $6, updated_at = NOW()
        WHERE id = $7
      ', [
        status,
        delivery.attempt,
        statusCode || null,
        responseBody || null,
        errorMessage || null,
        status === 'success' ? new Date() : null,'
        delivery.id
      ])

    } catch (error) {
      console.error('Error updating delivery status:', error)
    }
  }

  /**
   * Get delivery statistics
   */
  async getDeliveryStats(businessId: string, timeRange: '1h' | '24h' | '7d' | '30d' = '24h'): Promise<unknown>  {
    try {
      const interval = {
        '1h': '1 hour','
        '24h': '24 hours','
        '7d': '7 days','
        '30d': '30 days'`
      }[timeRange]

      const stats = await executeQuery(businessId, '
        SELECT 
          COUNT(*) as total_deliveries,
          COUNT(CASE WHEN status = 'success' THEN 1 END) as successful_deliveries,'
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_deliveries,'
          COUNT(CASE WHEN status = 'retrying' THEN 1 END) as retrying_deliveries,'
          AVG(CASE WHEN delivered_at IS NOT NULL THEN 
            EXTRACT(EPOCH FROM (delivered_at - created_at)) * 1000 
          END) as avg_delivery_time_ms,
          COUNT(DISTINCT endpoint_id) as active_endpoints
        FROM shared.webhook_deliveries
        WHERE business_id = $1 
        AND created_at >= NOW() - INTERVAL '${interval}'`
      ', [businessId])

      const eventStats = await executeQuery(businessId, '
        SELECT 
          event_type,
          COUNT(*) as count,
          COUNT(CASE WHEN status = 'success' THEN 1 END) as successful'
        FROM shared.webhook_deliveries
        WHERE business_id = $1 
        AND created_at >= NOW() - INTERVAL '${interval}'`
        GROUP BY event_type
        ORDER BY count DESC
      ', [businessId])

      return {
        summary: stats[0] || {},
        eventBreakdown: eventStats,
        queueSize: this.deliveryQueue.size
      }

    } catch (error) {
      console.error('Error getting delivery stats:', error)
      throw error
    }
  }

  /**
   * Stop processing (for cleanup)
   */
  stop() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval)
      this.processingInterval = null
    }
  }
}

// Global webhook delivery service instance
export const webhookService = new WebhookDeliveryService()

// Utility function for other parts of the system to send webhooks
export async function sendWebhook(payload: WebhookPayload): Promise<string[]> {
  const fullPayload = {
    ...payload,
    id: payload.id || crypto.randomUUID(),
    timestamp: payload.timestamp || new Date().toISOString()
  }

  return await webhookService.queueWebhook(fullPayload)
}

// Integration with realtime events
export async function sendWebhookForRealtimeEvent(
  businessId: string,
  eventType: string, data: unknown,
  userId?: string
) {
  return await sendWebhook({
    type: eventType,
    data,
    businessId,
    userId,
    timestamp: new Date().toISOString()
  })
}