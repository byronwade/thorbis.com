/**
 * Advanced Webhook Delivery System API
 * Enterprise-grade webhook management with intelligent retry logic and delivery guarantees
 * 
 * Features:
 * - Intelligent retry strategies with exponential backoff and jitter
 * - Webhook endpoint health monitoring and circuit breaker patterns
 * - Delivery guarantees with persistent queue and dead letter handling
 * - Event-driven architecture with real-time delivery status tracking
 * - Security features including payload signing and IP whitelisting
 * - Comprehensive analytics and monitoring with SLA tracking
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Webhook Endpoint Configuration Schema
const WebhookEndpointSchema = z.object({
  organization_id: z.string().uuid(),
  endpoint_config: z.object({
    url: z.string().url(),
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    events: z.array(z.string()).min(1), // Event types to subscribe to
    is_active: z.boolean().default(true),
    secret: z.string().min(10).optional(), // For payload signing
    
    // Retry Configuration
    retry_config: z.object({
      max_attempts: z.number().min(1).max(20).default(5),
      retry_strategy: z.enum(['linear', 'exponential', 'fibonacci']).default('exponential'),
      initial_delay_seconds: z.number().min(1).max(300).default(5),
      max_delay_seconds: z.number().min(60).max(86400).default(3600), // 1 hour max
      backoff_multiplier: z.number().min(1).max(10).default(2),
      jitter_enabled: z.boolean().default(true),
      timeout_seconds: z.number().min(5).max(300).default(30)
    }).optional(),
    
    // Delivery Configuration
    delivery_config: z.object({
      guarantee_level: z.enum(['at_least_once', 'exactly_once', 'best_effort']).default('at_least_once'),
      batch_delivery: z.boolean().default(false),
      batch_size: z.number().min(1).max(100).default(10),
      batch_timeout_seconds: z.number().min(1).max(300).default(30),
      compression_enabled: z.boolean().default(false)
    }).optional(),
    
    // Security Settings
    security_config: z.object({
      signature_header: z.string().default('X-Webhook-Signature'),
      signature_algorithm: z.enum(['sha256', 'sha512']).default('sha256'),
      ip_whitelist: z.array(z.string()).optional(),
      require_https: z.boolean().default(true),
      custom_headers: z.record(z.string()).optional()
    }).optional(),
    
    // Health Monitoring
    health_config: z.object({
      health_check_enabled: z.boolean().default(true),
      health_check_interval_seconds: z.number().min(30).max(3600).default(300),
      failure_threshold: z.number().min(1).max(20).default(5),
      recovery_threshold: z.number().min(1).max(10).default(2),
      circuit_breaker_enabled: z.boolean().default(true)
    }).optional()
  })
});

// Webhook Delivery Request Schema
const WebhookDeliverySchema = z.object({
  organization_id: z.string().uuid(),
  delivery_request: z.object({
    event_type: z.string(),
    payload: z.record(z.any()),
    target_endpoints: z.array(z.string()).optional(), // Specific endpoint IDs, or all if empty
    priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
    scheduled_delivery: z.string().datetime().optional(), // For future delivery
    idempotency_key: z.string().optional(),
    
    // Override settings for this delivery
    delivery_overrides: z.object({
      max_attempts: z.number().min(1).max(10).optional(),
      timeout_seconds: z.number().min(5).max(180).optional(),
      require_immediate_delivery: z.boolean().default(false)
    }).optional(),
    
    // Metadata for tracking
    metadata: z.object({
      source_system: z.string().optional(),
      correlation_id: z.string().optional(),
      user_id: z.string().optional(),
      transaction_id: z.string().optional()
    }).optional()
  })
});

// Webhook Analytics Request Schema
const WebhookAnalyticsSchema = z.object({
  organization_id: z.string().uuid(),
  analytics_config: z.object({
    time_range: z.enum(['1h', '24h', '7d', '30d', '90d']).default('24h'),
    granularity: z.enum(['minute', 'hour', 'day']).default('hour'),
    metrics: z.array(z.enum([
      'delivery_count',
      'success_rate',
      'failure_rate',
      'retry_count',
      'average_delivery_time',
      'endpoint_health',
      'event_distribution',
      'error_analysis'
    ])).min(1),
    breakdown_by: z.array(z.enum(['endpoint', 'event_type', 'status', 'failure_reason'])).optional(),
    include_predictions: z.boolean().default(true)
  })
});

/**
 * GET /api/v1/system/webhooks
 * Retrieve webhook configuration, delivery status, and analytics
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const organizationId = url.searchParams.get('organization_id');
    const dataType = url.searchParams.get('data_type') || 'endpoints';

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organization_id is required' },
        { status: 400 }
      );
    }

    if (dataType === 'analytics') {
      const timeRange = url.searchParams.get('time_range') || '24h';

      // Mock comprehensive webhook analytics
      const webhookAnalytics = {
        analytics_summary: {
          organization_id: organizationId,
          time_range: timeRange,
          report_generated: new Date().toISOString(),
          data_freshness: 'real_time'
        },
        
        overall_metrics: {
          total_deliveries: 45678,
          successful_deliveries: 43234,
          failed_deliveries: 2444,
          success_rate_percent: 94.65,
          average_delivery_time_ms: 245,
          p95_delivery_time_ms: 850,
          p99_delivery_time_ms: 1650,
          total_retry_attempts: 8934,
          unique_events_delivered: 15623,
          active_endpoints: 12,
          healthy_endpoints: 10,
          circuit_breaker_trips: 3
        },

        delivery_performance: {
          time_series_data: [
            { timestamp: '2024-01-20T00:00:00Z', deliveries: 1856, successes: 1798, failures: 58, avg_time_ms: 225 },
            { timestamp: '2024-01-20T01:00:00Z', deliveries: 1654, successes: 1612, failures: 42, avg_time_ms: 198 },
            { timestamp: '2024-01-20T02:00:00Z', deliveries: 1203, successes: 1167, failures: 36, avg_time_ms: 165 },
            { timestamp: '2024-01-20T03:00:00Z', deliveries: 897, successes: 871, failures: 26, avg_time_ms: 152 },
            { timestamp: '2024-01-20T04:00:00Z', deliveries: 756, successes: 738, failures: 18, avg_time_ms: 145 },
            { timestamp: '2024-01-20T05:00:00Z', deliveries: 934, successes: 912, failures: 22, avg_time_ms: 158 },
            { timestamp: '2024-01-20T06:00:00Z', deliveries: 1345, successes: 1298, failures: 47, avg_time_ms: 189 },
            { timestamp: '2024-01-20T07:00:00Z', deliveries: 1897, successes: 1834, failures: 63, avg_time_ms: 234 },
            { timestamp: '2024-01-20T08:00:00Z', deliveries: 2456, successes: 2378, failures: 78, avg_time_ms: 267 },
            { timestamp: '2024-01-20T09:00:00Z', deliveries: 2934, successes: 2834, failures: 100, avg_time_ms: 298 },
            { timestamp: '2024-01-20T10:00:00Z', deliveries: 3234, successes: 3112, failures: 122, avg_time_ms: 325 },
            { timestamp: '2024-01-20T11:00:00Z', deliveries: 3567, successes: 3423, failures: 144, avg_time_ms: 356 }
          ],
          performance_trends: {
            success_rate_trend: '+2.3%',
            delivery_time_trend: '+15ms',
            volume_trend: '+18.5%',
            reliability_score: 96.2
          }
        },

        endpoint_analytics: {
          endpoint_performance: [
            {
              endpoint_id: 'wh_prod_123',
              endpoint_name: 'Production CRM Integration',
              url: 'https://crm.company.com/webhooks/thorbis',
              deliveries: 12456,
              success_rate: 98.7,
              average_response_time_ms: 145,
              last_successful_delivery: '2024-01-20T11:45:00Z',
              health_status: 'healthy',
              circuit_breaker_status: 'closed',
              retry_rate: 1.3
            },
            {
              endpoint_id: 'wh_analytics_456',
              endpoint_name: 'Analytics Data Pipeline',
              url: 'https://analytics.company.com/webhooks/events',
              deliveries: 8934,
              success_rate: 92.1,
              average_response_time_ms: 320,
              last_successful_delivery: '2024-01-20T11:42:00Z',
              health_status: 'degraded',
              circuit_breaker_status: 'closed',
              retry_rate: 7.9
            },
            {
              endpoint_id: 'wh_billing_789',
              endpoint_name: 'Billing System Sync',
              url: 'https://billing.company.com/api/webhooks',
              deliveries: 6789,
              success_rate: 89.4,
              average_response_time_ms: 580,
              last_successful_delivery: '2024-01-20T11:38:00Z',
              health_status: 'warning',
              circuit_breaker_status: 'half_open',
              retry_rate: 10.6
            }
          ],
          endpoint_health_summary: {
            healthy: 7,
            degraded: 3,
            unhealthy: 1,
            circuit_breaker_open: 1,
            circuit_breaker_half_open: 2
          }
        },

        event_analytics: {
          event_distribution: [
            { event_type: 'invoice.created', count: 12456, success_rate: 97.8, avg_delivery_time_ms: 198 },
            { event_type: 'payment.processed', count: 8934, success_rate: 98.9, avg_delivery_time_ms: 234 },
            { event_type: 'customer.updated', count: 6789, success_rate: 96.5, avg_delivery_time_ms: 156 },
            { event_type: 'order.completed', count: 5432, success_rate: 95.2, avg_delivery_time_ms: 289 },
            { event_type: 'subscription.changed', count: 3456, success_rate: 94.7, avg_delivery_time_ms: 267 }
          ],
          most_retried_events: [
            { event_type: 'invoice.failed', retry_rate: 15.6, avg_attempts: 2.8 },
            { event_type: 'payment.declined', retry_rate: 12.3, avg_attempts: 2.5 },
            { event_type: 'subscription.expired', retry_rate: 8.9, avg_attempts: 2.1 }
          ]
        },

        failure_analysis: {
          top_failure_reasons: [
            {
              reason: 'Connection timeout',
              count: 1245,
              percentage: 28.5,
              affected_endpoints: 3,
              recommendation: 'Increase timeout configuration or check endpoint performance'
            },
            {
              reason: 'HTTP 503 - Service Unavailable',
              count: 987,
              percentage: 22.6,
              affected_endpoints: 2,
              recommendation: 'Implement circuit breaker or contact endpoint provider'
            },
            {
              reason: 'HTTP 422 - Invalid Payload',
              count: 654,
              percentage: 15.0,
              affected_endpoints: 1,
              recommendation: 'Review payload format and endpoint expectations'
            },
            {
              reason: 'DNS resolution failure',
              count: 432,
              percentage: 9.9,
              affected_endpoints: 1,
              recommendation: 'Verify endpoint URL and DNS configuration'
            }
          ],
          error_patterns: {
            temporal_patterns: 'Failures spike during business hours (9-11 AM)',
            geographic_patterns: 'Higher failure rates from EU endpoints',
            endpoint_patterns: 'Legacy endpoints show 3x higher failure rates'
          }
        },

        retry_analytics: {
          retry_success_rates: [
            { attempt: 1, success_rate: 94.65 },
            { attempt: 2, success_rate: 76.34 },
            { attempt: 3, success_rate: 52.18 },
            { attempt: 4, success_rate: 31.42 },
            { attempt: 5, success_rate: 18.67 }
          ],
          retry_strategies_performance: [
            {
              strategy: 'exponential',
              endpoints_using: 8,
              success_rate: 89.4,
              avg_total_delivery_time: '4m 35s'
            },
            {
              strategy: 'linear',
              endpoints_using: 3,
              success_rate: 82.1,
              avg_total_delivery_time: '6m 12s'
            },
            {
              strategy: 'fibonacci',
              endpoints_using: 1,
              success_rate: 91.2,
              avg_total_delivery_time: '5m 48s'
            }
          ]
        },

        sla_metrics: {
          delivery_sla_compliance: 96.8,
          target_sla: 95.0,
          sla_breaches_last_24h: 12,
          mttr_minutes: 8.5, // Mean Time to Recovery
          mtbf_hours: 72.3,  // Mean Time Between Failures
          availability_percent: 99.7
        },

        recommendations: [
          {
            type: 'performance',
            priority: 'high',
            recommendation: 'Optimize billing system endpoint - response times 2.4x above average',
            impact: 'Reduce average delivery time by ~120ms',
            effort: 'medium'
          },
          {
            type: 'reliability',
            priority: 'medium',
            recommendation: 'Implement circuit breaker for analytics endpoint',
            impact: 'Prevent cascade failures during high load',
            effort: 'low'
          },
          {
            type: 'capacity',
            priority: 'low',
            recommendation: 'Scale webhook infrastructure for projected 40% growth',
            impact: 'Maintain SLA compliance during peak usage',
            effort: 'high'
          }
        ]
      };

      return NextResponse.json({
        data: webhookAnalytics,
        message: 'Webhook analytics retrieved successfully'
      });
    }

    if (dataType === 'delivery_status') {
      const deliveryId = url.searchParams.get('delivery_id');
      
      if (deliveryId) {
        // Mock specific delivery status
        const deliveryStatus = {
          delivery_id: deliveryId,
          organization_id: organizationId,
          status: 'delivered',
          event_type: 'invoice.created',
          created_at: '2024-01-20T11:30:00Z',
          completed_at: '2024-01-20T11:30:02.450Z',
          
          delivery_attempts: [
            {
              attempt_number: 1,
              attempted_at: '2024-01-20T11:30:00Z',
              completed_at: '2024-01-20T11:30:02.450Z',
              status: 'delivered',
              response_code: 200,
              response_time_ms: 245,
              response_headers: {
                'content-type': 'application/json',
                'x-response-id': 'resp_123abc'
              }
            }
          ],
          
          endpoint_details: {
            endpoint_id: 'wh_prod_123',
            endpoint_name: 'Production CRM Integration',
            url: 'https://crm.company.com/webhooks/thorbis'
          },
          
          payload_info: {
            size_bytes: 1245,
            checksum: 'sha256:abc123...',
            compression_used: false
          },
          
          security_info: {
            signature_sent: true,
            signature_header: 'X-Webhook-Signature',
            ip_validated: true
          },
          
          metadata: {
            correlation_id: 'corr_456def',
            source_system: 'billing_system',
            priority: 'medium'
          }
        };

        return NextResponse.json({
          data: deliveryStatus,
          message: 'Delivery status retrieved successfully'
        });
      }

      // Mock recent delivery statuses
      const recentDeliveries = {
        delivery_summary: {
          organization_id: organizationId,
          total_deliveries_last_24h: 45678,
          pending_deliveries: 234,
          failed_deliveries_requiring_attention: 56,
          last_updated: new Date().toISOString()
        },
        
        recent_deliveries: [
          {
            delivery_id: 'del_20240120_001',
            event_type: 'payment.processed',
            endpoint_name: 'Production CRM Integration',
            status: 'delivered',
            attempts: 1,
            created_at: '2024-01-20T11:45:00Z',
            delivered_at: '2024-01-20T11:45:01.234Z',
            response_time_ms: 234
          },
          {
            delivery_id: 'del_20240120_002',
            event_type: 'invoice.created',
            endpoint_name: 'Analytics Data Pipeline',
            status: 'retrying',
            attempts: 2,
            created_at: '2024-01-20T11:44:30Z',
            next_retry_at: '2024-01-20T11:46:30Z',
            last_error: 'Connection timeout'
          },
          {
            delivery_id: 'del_20240120_003',
            event_type: 'customer.updated',
            endpoint_name: 'Billing System Sync',
            status: 'failed',
            attempts: 5,
            created_at: '2024-01-20T11:40:00Z',
            failed_at: '2024-01-20T11:44:15Z',
            last_error: 'HTTP 422 - Invalid payload format'
          }
        ],
        
        queue_status: {
          pending_deliveries: 234,
          scheduled_deliveries: 45,
          dead_letter_queue: 12,
          processing_rate_per_second: 156.7,
          average_queue_wait_time_ms: 45
        }
      };

      return NextResponse.json({
        data: recentDeliveries,
        message: 'Recent delivery statuses retrieved successfully'
      });
    }

    // Default: Return webhook endpoints configuration
    const webhookEndpoints = {
      organization_settings: {
        organization_id: organizationId,
        webhook_system_enabled: true,
        total_endpoints: 12,
        active_endpoints: 10,
        total_events_supported: 25,
        delivery_guarantee_level: 'at_least_once',
        last_updated: new Date().toISOString()
      },
      
      active_endpoints: [
        {
          endpoint_id: 'wh_prod_123',
          name: 'Production CRM Integration',
          description: 'Main CRM system for customer and invoice data synchronization',
          url: 'https://crm.company.com/webhooks/thorbis',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          last_delivery: '2024-01-20T11:45:00Z',
          
          subscribed_events: [
            'customer.created', 'customer.updated', 'invoice.created', 
            'invoice.updated', 'payment.processed'
          ],
          
          health_status: {
            status: 'healthy',
            success_rate_24h: 98.7,
            average_response_time_ms: 145,
            last_health_check: '2024-01-20T11:40:00Z',
            consecutive_failures: 0,
            circuit_breaker_status: 'closed'
          },
          
          retry_config: {
            max_attempts: 5,
            retry_strategy: 'exponential',
            initial_delay_seconds: 5,
            max_delay_seconds: 3600,
            backoff_multiplier: 2,
            jitter_enabled: true,
            timeout_seconds: 30
          },
          
          delivery_stats_24h: {
            total_deliveries: 12456,
            successful_deliveries: 12289,
            failed_deliveries: 167,
            retry_attempts: 289,
            average_delivery_time_ms: 198
          },
          
          security_config: {
            signature_verification: true,
            signature_algorithm: 'sha256',
            require_https: true,
            ip_whitelist_enabled: true,
            allowed_ips: ['203.0.113.0/24']
          }
        },
        {
          endpoint_id: 'wh_analytics_456',
          name: 'Analytics Data Pipeline',
          description: 'Real-time data analytics and reporting system',
          url: 'https://analytics.company.com/webhooks/events',
          is_active: true,
          created_at: '2024-01-05T00:00:00Z',
          last_delivery: '2024-01-20T11:42:00Z',
          
          subscribed_events: [
            'order.completed', 'payment.processed', 'customer.created',
            'service.completed', 'invoice.paid'
          ],
          
          health_status: {
            status: 'degraded',
            success_rate_24h: 92.1,
            average_response_time_ms: 320,
            last_health_check: '2024-01-20T11:35:00Z',
            consecutive_failures: 2,
            circuit_breaker_status: 'closed'
          },
          
          retry_config: {
            max_attempts: 3,
            retry_strategy: 'linear',
            initial_delay_seconds: 10,
            max_delay_seconds: 300,
            backoff_multiplier: 1.5,
            jitter_enabled: false,
            timeout_seconds: 60
          },
          
          delivery_stats_24h: {
            total_deliveries: 8934,
            successful_deliveries: 8227,
            failed_deliveries: 707,
            retry_attempts: 1456,
            average_delivery_time_ms: 387
          },
          
          security_config: {
            signature_verification: true,
            signature_algorithm: 'sha512',
            require_https: true,
            ip_whitelist_enabled: false
          }
        },
        {
          endpoint_id: 'wh_billing_789',
          name: 'Billing System Sync',
          description: 'Legacy billing system integration with enhanced monitoring',
          url: 'https://billing.company.com/api/webhooks',
          is_active: true,
          created_at: '2023-12-15T00:00:00Z',
          last_delivery: '2024-01-20T11:38:00Z',
          
          subscribed_events: [
            'invoice.created', 'invoice.paid', 'payment.processed',
            'subscription.created', 'subscription.cancelled'
          ],
          
          health_status: {
            status: 'warning',
            success_rate_24h: 89.4,
            average_response_time_ms: 580,
            last_health_check: '2024-01-20T11:30:00Z',
            consecutive_failures: 1,
            circuit_breaker_status: 'half_open'
          },
          
          retry_config: {
            max_attempts: 8,
            retry_strategy: 'fibonacci',
            initial_delay_seconds: 15,
            max_delay_seconds: 7200,
            backoff_multiplier: 1.618,
            jitter_enabled: true,
            timeout_seconds: 120
          },
          
          delivery_stats_24h: {
            total_deliveries: 6789,
            successful_deliveries: 6070,
            failed_deliveries: 719,
            retry_attempts: 2145,
            average_delivery_time_ms: 658
          },
          
          security_config: {
            signature_verification: false, // Legacy system limitation
            require_https: true,
            ip_whitelist_enabled: true,
            allowed_ips: ['198.51.100.0/24']
          }
        }
      ],
      
      system_configuration: {
        global_retry_settings: {
          default_max_attempts: 5,
          default_strategy: 'exponential',
          default_timeout_seconds: 30,
          dead_letter_queue_enabled: true,
          dead_letter_retention_days: 7
        },
        
        delivery_guarantees: {
          at_least_once: 'Standard delivery guarantee',
          exactly_once: 'Available for premium endpoints',
          best_effort: 'Available for non-critical events'
        },
        
        monitoring_and_alerting: {
          real_time_monitoring: true,
          health_check_interval_seconds: 300,
          failure_threshold_for_alerts: 5,
          sla_monitoring: true,
          target_success_rate: 95.0,
          target_p95_delivery_time_ms: 1000
        }
      }
    };

    return NextResponse.json({
      data: webhookEndpoints,
      message: 'Webhook configuration retrieved successfully'
    });

  } catch (error) {
    console.error('Failed to retrieve webhook data:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve webhook data' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/system/webhooks
 * Create new webhook endpoint or trigger webhook delivery
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const url = new URL(request.url);
    const action = url.searchParams.get('action') || 'create_endpoint';

    if (action === 'trigger_delivery') {
      const validatedData = WebhookDeliverySchema.parse(body);

      // Mock triggering webhook delivery
      const deliveryResult = {
        delivery_id: 'del_${Date.now()}',
        organization_id: validatedData.organization_id,
        event_type: validatedData.delivery_request.event_type,
        
        delivery_initiation: {
          initiated_at: new Date().toISOString(),
          priority: validatedData.delivery_request.priority,
          scheduled_for: validatedData.delivery_request.scheduled_delivery || new Date().toISOString(),
          idempotency_key: validatedData.delivery_request.idempotency_key,
          target_endpoints_count: 3 // Mock number of matching endpoints
        },
        
        payload_processing: {
          payload_size_bytes: JSON.stringify(validatedData.delivery_request.payload).length,
          payload_checksum: 'sha256:def456...',
          compression_applied: false,
          signature_generated: true
        },
        
        delivery_plan: {
          immediate_delivery_endpoints: [
            {
              endpoint_id: 'wh_prod_123',
              endpoint_name: 'Production CRM Integration',
              estimated_delivery_time: '2024-01-20T11:30:05Z',
              retry_config_applied: {
                max_attempts: 5,
                strategy: 'exponential',
                timeout_seconds: 30
              }
            },
            {
              endpoint_id: 'wh_analytics_456',
              endpoint_name: 'Analytics Data Pipeline',
              estimated_delivery_time: '2024-01-20T11:30:08Z',
              retry_config_applied: {
                max_attempts: 3,
                strategy: 'linear',
                timeout_seconds: 60
              }
            }
          ],
          batch_delivery_endpoints: [],
          total_estimated_delivery_time: '15 seconds'
        },
        
        delivery_tracking: {
          tracking_url: '/api/v1/system/webhooks?data_type=delivery_status&delivery_id=del_${Date.now()}',
          real_time_status_available: true,
          webhook_delivery_webhook: 'https://your-app.com/webhook-status' // Meta-webhook for delivery status
        },
        
        quality_assurance: {
          duplicate_detection: 'passed',
          payload_validation: 'passed',
          endpoint_health_check: 'passed',
          delivery_guarantee: validatedData.delivery_request.priority === 'critical' ? 'exactly_once' : 'at_least_once'
        }
      };

      return NextResponse.json({
        data: deliveryResult,
        message: 'Webhook delivery initiated successfully'
      });
    }

    // Default: Create webhook endpoint
    const validatedData = WebhookEndpointSchema.parse(body);

    const endpointResult = {
      endpoint_id: 'wh_${Date.now()}',
      organization_id: validatedData.organization_id,
      endpoint_configuration: validatedData.endpoint_config,
      
      setup_results: {
        configuration_applied: true,
        health_check_passed: true,
        security_validation: 'passed',
        event_subscription: 'active',
        initial_test_delivery: 'scheduled'
      },
      
      security_setup: {
        webhook_secret_generated: !!validatedData.endpoint_config.secret,
        signature_verification_enabled: true,
        https_requirement_enforced: validatedData.endpoint_config.security_config?.require_https ?? true,
        ip_whitelist_configured: !!validatedData.endpoint_config.security_config?.ip_whitelist?.length
      },
      
      monitoring_setup: {
        health_monitoring: 'enabled',
        performance_tracking: 'enabled',
        failure_alerting: 'configured',
        sla_monitoring: 'enabled',
        circuit_breaker: validatedData.endpoint_config.health_config?.circuit_breaker_enabled ? 'enabled' : 'disabled'
      },
      
      delivery_configuration: {
        retry_strategy: validatedData.endpoint_config.retry_config?.retry_strategy || 'exponential',
        max_retry_attempts: validatedData.endpoint_config.retry_config?.max_attempts || 5,
        delivery_guarantee: validatedData.endpoint_config.delivery_config?.guarantee_level || 'at_least_once',
        timeout_configuration: '${validatedData.endpoint_config.retry_config?.timeout_seconds || 30}s',
        batch_delivery: validatedData.endpoint_config.delivery_config?.batch_delivery || false
      },
      
      integration_details: {
        supported_events: validatedData.endpoint_config.events,
        webhook_url: validatedData.endpoint_config.url,
        signature_header: validatedData.endpoint_config.security_config?.signature_header || 'X-Webhook-Signature',
        signature_algorithm: validatedData.endpoint_config.security_config?.signature_algorithm || 'sha256'
      },
      
      next_steps: [
        {
          step: 'Verify endpoint accessibility',
          status: 'in_progress',
          description: 'Initial connectivity test to webhook URL'
        },
        {
          step: 'Send test webhook',
          status: 'pending',
          description: 'Deliver test event to validate integration'
        },
        {
          step: 'Monitor initial deliveries',
          status: 'pending',
          description: 'Track first production deliveries for issues'
        }
      ]
    };

    return NextResponse.json({
      data: endpointResult,
      message: 'Webhook endpoint created successfully'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid webhook configuration',
          details: error.errors.reduce((acc, err) => {
            const path = err.path.join('.');
            if (!acc[path]) acc[path] = [];
            acc[path].push(err.message);
            return acc;
          }, {} as Record<string, string[]>)
        },
        { status: 400 }
      );
    }

    console.error('Failed to process webhook request:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook request' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v1/system/webhooks
 * Update webhook endpoint configuration or retry failed deliveries
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const url = new URL(request.url);
    const action = url.searchParams.get('action') || 'update_endpoint';
    const endpointId = url.searchParams.get('endpoint_id');

    if (action === 'retry_failed_deliveries') {
      const organizationId = body.organization_id;
      const deliveryIds = body.delivery_ids || [];

      if (!organizationId) {
        return NextResponse.json(
          { error: 'organization_id is required for retry operation' },
          { status: 400 }
        );
      }

      // Mock retry operation
      const retryResult = {
        retry_operation_id: 'retry_${Date.now()}',
        organization_id: organizationId,
        requested_retries: deliveryIds.length || 'all_failed',
        
        retry_summary: {
          total_deliveries_to_retry: 156,
          immediate_retries: 89,
          scheduled_retries: 45,
          skipped_retries: 22, // Already at max attempts
          estimated_completion_time: '15 minutes'
        },
        
        retry_strategy: {
          strategy_used: 'intelligent_backoff',
          prioritization: 'by_failure_age_and_importance',
          batch_size: 10,
          concurrent_retries: 5,
          respect_endpoint_health: true
        },
        
        affected_endpoints: [
          {
            endpoint_id: 'wh_analytics_456',
            endpoint_name: 'Analytics Data Pipeline',
            deliveries_to_retry: 78,
            health_status: 'degraded',
            retry_delay_minutes: 5
          },
          {
            endpoint_id: 'wh_billing_789',
            endpoint_name: 'Billing System Sync',
            deliveries_to_retry: 56,
            health_status: 'warning',
            retry_delay_minutes: 10
          }
        ],
        
        monitoring: {
          progress_tracking_url: '/api/v1/system/webhooks/retry-status/${Date.now()}',
          real_time_updates: true,
          completion_webhook: 'optional'
        }
      };

      return NextResponse.json({
        data: retryResult,
        message: 'Retry operation initiated successfully'
      });
    }

    if (action === 'update_health_status') {
      // Mock endpoint health status update
      const healthUpdate = {
        endpoint_id: endpointId,
        health_check_performed_at: new Date().toISOString(),
        previous_status: 'degraded',
        current_status: 'healthy',
        
        health_metrics: {
          response_time_ms: 145,
          success_rate_last_100: 98.0,
          consecutive_successes: 25,
          consecutive_failures: 0,
          last_successful_delivery: new Date().toISOString()
        },
        
        circuit_breaker_update: {
          previous_state: 'half_open',
          current_state: 'closed',
          reason: 'Successful recovery after health threshold met'
        },
        
        automatic_actions_taken: [
          'Resumed normal delivery schedule',
          'Cleared failure backlog',
          'Reset retry counters',
          'Notified monitoring systems'
        ]
      };

      return NextResponse.json({
        data: healthUpdate,
        message: 'Endpoint health status updated successfully'
      });
    }

    // Default: Update endpoint configuration
    const validatedData = WebhookEndpointSchema.parse(body);

    const updateResult = {
      endpoint_id: endpointId,
      organization_id: validatedData.organization_id,
      update_applied_at: new Date().toISOString(),
      previous_configuration: 'saved_for_rollback',
      
      configuration_changes: {
        url_updated: true,
        events_subscription_updated: true,
        retry_configuration_updated: true,
        security_settings_updated: true,
        monitoring_settings_updated: false
      },
      
      validation_results: {
        url_accessibility: 'verified',
        ssl_certificate: 'valid',
        response_format: 'compatible',
        security_compliance: 'passed'
      },
      
      impact_analysis: {
        active_deliveries_affected: 0,
        pending_deliveries: 23,
        configuration_effective_immediately: true,
        backward_compatibility: 'maintained'
      },
      
      testing_scheduled: {
        connectivity_test: 'scheduled',
        payload_format_test: 'scheduled',
        retry_mechanism_test: 'scheduled',
        estimated_test_completion: '5 minutes'
      }
    };

    return NextResponse.json({
      data: updateResult,
      message: 'Webhook endpoint updated successfully'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid update request',
          details: error.errors.reduce((acc, err) => {
            const path = err.path.join('.');
            if (!acc[path]) acc[path] = [];
            acc[path].push(err.message);
            return acc;
          }, {} as Record<string, string[]>)
        },
        { status: 400 }
      );
    }

    console.error('Failed to update webhook configuration:', error);
    return NextResponse.json(
      { error: 'Failed to update webhook configuration' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/system/webhooks
 * Delete webhook endpoint or clear failed deliveries
 */
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const endpointId = url.searchParams.get('endpoint_id');
    const organizationId = url.searchParams.get('organization_id');
    const action = url.searchParams.get('action') || 'delete_endpoint';

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organization_id is required' },
        { status: 400 }
      );
    }

    if (action === 'clear_dead_letter_queue') {
      // Mock clearing dead letter queue
      const clearResult = {
        operation_id: 'clear_${Date.now()}',
        organization_id: organizationId,
        
        cleared_items: {
          total_items_cleared: 156,
          oldest_item_date: '2024-01-15T10:30:00Z',
          newest_item_date: '2024-01-20T09:45:00Z',
          total_storage_freed_mb: 2.3
        },
        
        breakdown_by_endpoint: [
          {
            endpoint_id: 'wh_billing_789',
            endpoint_name: 'Billing System Sync',
            items_cleared: 89,
            reason: 'Max retry attempts exceeded'
          },
          {
            endpoint_id: 'wh_analytics_456',
            endpoint_name: 'Analytics Data Pipeline',
            items_cleared: 67,
            reason: 'Endpoint permanently unreachable'
          }
        ],
        
        audit_information: {
          cleared_by: 'system_administrator',
          cleared_at: new Date().toISOString(),
          retention_policy_applied: '7-day automatic retention',
          backup_created: true,
          backup_expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      };

      return NextResponse.json({
        data: clearResult,
        message: 'Dead letter queue cleared successfully'
      });
    }

    // Default: Delete webhook endpoint
    if (!endpointId) {
      return NextResponse.json(
        { error: 'endpoint_id is required for delete operation' },
        { status: 400 }
      );
    }

    const deleteResult = {
      endpoint_id: endpointId,
      organization_id: organizationId,
      deleted_at: new Date().toISOString(),
      
      deletion_summary: {
        endpoint_name: 'Analytics Data Pipeline',
        endpoint_url: 'https://analytics.company.com/webhooks/events',
        was_active: true,
        subscribed_events: ['order.completed', 'payment.processed', 'customer.created'],
        total_deliveries_lifetime: 123456
      },
      
      pending_deliveries: {
        queued_deliveries: 23,
        scheduled_deliveries: 5,
        action_taken: 'moved_to_dead_letter_queue',
        retention_period: '7 days'
      },
      
      cleanup_actions: {
        monitoring_disabled: true,
        health_checks_stopped: true,
        circuit_breaker_removed: true,
        analytics_data_archived: true,
        webhook_secret_revoked: true
      },
      
      recovery_options: {
        configuration_backup_available: true,
        backup_retention_days: 30,
        restore_possible: true,
        restore_note: 'Endpoint can be recreated with same configuration within 30 days'
      }
    };

    return NextResponse.json({
      data: deleteResult,
      message: 'Webhook endpoint deleted successfully'
    });

  } catch (error) {
    console.error('Failed to delete webhook resource:', error);
    return NextResponse.json(
      { error: 'Failed to delete webhook resource' },
      { status: 500 }
    );
  }
}