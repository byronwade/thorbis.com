/**
 * API Rate Limiting and Usage Analytics API
 * Comprehensive rate limiting, throttling, and usage analytics system
 * 
 * Features:
 * - Advanced rate limiting with multiple strategies (sliding window, token bucket, fixed window)
 * - Real-time usage analytics and monitoring with performance metrics
 * - API key management with fine-grained permissions and quotas
 * - Geographic and IP-based limiting with anomaly detection
 * - Custom rate limit policies for different user tiers and endpoints
 * - Usage forecasting and capacity planning with AI-powered insights
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Rate Limiting Configuration Schema
const RateLimitConfigSchema = z.object({
  organization_id: z.string().uuid(),
  rate_limit_settings: z.object({
    strategy: z.enum(['sliding_window', 'token_bucket', 'fixed_window', 'adaptive']).default('sliding_window'),
    global_limits: z.object({
      requests_per_second: z.number().min(1).max(10000).default(100),
      requests_per_minute: z.number().min(1).max(100000).default(1000),
      requests_per_hour: z.number().min(1).max(1000000).default(10000),
      requests_per_day: z.number().min(1).max(10000000).default(100000),
      concurrent_requests: z.number().min(1).max(1000).default(50)
    }),
    endpoint_specific_limits: z.array(z.object({
      endpoint_pattern: z.string(),
      method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).optional(),
      requests_per_minute: z.number().min(1).max(10000),
      priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
      burst_capacity: z.number().min(0).max(1000).default(10)
    })).optional(),
    user_tier_limits: z.array(z.object({
      tier: z.string(),
      multiplier: z.number().min(0.1).max(100).default(1),
      custom_limits: z.object({
        requests_per_minute: z.number().optional(),
        requests_per_hour: z.number().optional(),
        concurrent_requests: z.number().optional()
      }).optional()
    })).optional(),
    geographic_limits: z.object({
      enabled: z.boolean().default(false),
      country_limits: z.array(z.object({
        country_code: z.string().length(2),
        multiplier: z.number().min(0).max(10).default(1)
      })).optional(),
      high_risk_countries: z.array(z.string().length(2)).optional()
    }).optional()
  }),
  advanced_features: z.object({
    adaptive_limiting: z.boolean().default(true),
    anomaly_detection: z.boolean().default(true),
    ip_whitelisting: z.array(z.string()).optional(),
    ip_blacklisting: z.array(z.string()).optional(),
    custom_headers: z.boolean().default(true),
    retry_after_header: z.boolean().default(true)
  }).optional()
});

// Usage Analytics Request Schema
const UsageAnalyticsSchema = z.object({
  organization_id: z.string().uuid(),
  analytics_config: z.object({
    time_range: z.enum(['1h', '24h', '7d', '30d', '90d']).default('24h'),
    granularity: z.enum(['minute', 'hour', 'day']).default('hour'),
    metrics: z.array(z.enum([
      'request_count',
      'response_time',
      'error_rate',
      'rate_limit_hits',
      'geographic_distribution',
      'endpoint_usage',
      'user_activity',
      'api_key_usage'
    ])).min(1),
    breakdown_by: z.array(z.enum(['endpoint', 'method', 'user_tier', 'country', 'api_key', 'ip_address'])).optional(),
    include_predictions: z.boolean().default(true)
  })
});

// API Key Management Schema
const ApiKeyManagementSchema = z.object({
  organization_id: z.string().uuid(),
  api_key_config: z.object({
    key_name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    permissions: z.array(z.enum(['read', 'write', 'admin', 'analytics'])).min(1),
    rate_limit_tier: z.string().default('standard'),
    allowed_origins: z.array(z.string()).optional(),
    allowed_ips: z.array(z.string()).optional(),
    expiry_date: z.string().datetime().optional(),
    usage_quotas: z.object({
      daily_requests: z.number().positive().optional(),
      monthly_requests: z.number().positive().optional(),
      concurrent_requests: z.number().positive().optional()
    }).optional(),
    restrictions: z.object({
      allowed_endpoints: z.array(z.string()).optional(),
      blocked_endpoints: z.array(z.string()).optional(),
      time_based_access: z.object({
        start_time: z.string().optional(), // HH:MM format
        end_time: z.string().optional()    // HH:MM format
      }).optional()
    }).optional()
  })
});

/**
 * GET /api/v1/system/rate-limiting
 * Retrieve rate limiting configuration and usage analytics
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const organizationId = url.searchParams.get('organization_id');
    const dataType = url.searchParams.get('data_type') || 'configuration';

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organization_id is required' },
        { status: 400 }
      );
    }

    if (dataType === 'usage_analytics') {
      const timeRange = url.searchParams.get('time_range') || '24h';
      const granularity = url.searchParams.get('granularity') || 'hour';

      // Mock comprehensive usage analytics data
      const usageAnalytics = {
        analytics_summary: {
          organization_id: organizationId,
          time_range: timeRange,
          granularity: granularity,
          report_generated: new Date().toISOString(),
          data_freshness: 'real_time'
        },
        
        overall_metrics: {
          total_requests: 2456789,
          successful_requests: 2398234,
          failed_requests: 58555,
          rate_limited_requests: 12847,
          average_response_time_ms: 145,
          p95_response_time_ms: 420,
          p99_response_time_ms: 850,
          error_rate_percent: 2.38,
          rate_limit_hit_rate_percent: 0.52,
          unique_users: 15642,
          unique_ips: 8934,
          total_data_transferred_gb: 1247.5
        },

        time_series_data: {
          request_volume: [
            { timestamp: '2024-01-20T00:00:00Z', value: 15420, rate_limited: 45 },
            { timestamp: '2024-01-20T01:00:00Z', value: 12890, rate_limited: 23 },
            { timestamp: '2024-01-20T02:00:00Z', value: 8960, rate_limited: 12 },
            { timestamp: '2024-01-20T03:00:00Z', value: 6780, rate_limited: 8 },
            { timestamp: '2024-01-20T04:00:00Z', value: 5890, rate_limited: 15 },
            { timestamp: '2024-01-20T05:00:00Z', value: 7650, rate_limited: 28 },
            { timestamp: '2024-01-20T06:00:00Z', value: 11240, rate_limited: 67 },
            { timestamp: '2024-01-20T07:00:00Z', value: 16890, rate_limited: 124 },
            { timestamp: '2024-01-20T08:00:00Z', value: 22450, rate_limited: 189 },
            { timestamp: '2024-01-20T09:00:00Z', value: 28960, rate_limited: 245 },
            { timestamp: '2024-01-20T10:00:00Z', value: 32140, rate_limited: 298 },
            { timestamp: '2024-01-20T11:00:00Z', value: 35670, rate_limited: 356 }
          ],
          response_times: [
            { timestamp: '2024-01-20T00:00:00Z', avg: 125, p95: 380, p99: 720 },
            { timestamp: '2024-01-20T01:00:00Z', avg: 118, p95: 365, p99: 685 },
            { timestamp: '2024-01-20T02:00:00Z', avg: 108, p95: 320, p99: 590 },
            { timestamp: '2024-01-20T03:00:00Z', avg: 95, p95: 285, p99: 520 },
            { timestamp: '2024-01-20T04:00:00Z', avg: 92, p95: 275, p99: 495 },
            { timestamp: '2024-01-20T05:00:00Z', avg: 98, p95: 295, p99: 535 },
            { timestamp: '2024-01-20T06:00:00Z', avg: 115, p95: 345, p99: 625 },
            { timestamp: '2024-01-20T07:00:00Z', avg: 135, p95: 395, p99: 745 },
            { timestamp: '2024-01-20T08:00:00Z', avg: 158, p95: 465, p99: 890 },
            { timestamp: '2024-01-20T09:00:00Z', avg: 172, p95: 520, p99: 975 },
            { timestamp: '2024-01-20T10:00:00Z', avg: 185, p95: 565, p99: 1020 },
            { timestamp: '2024-01-20T11:00:00Z', avg: 195, p95: 585, p99: 1085 }
          ]
        },

        endpoint_analytics: {
          most_used_endpoints: [
            {
              endpoint: '/api/v1/customers',
              method: 'GET',
              requests: 456789,
              rate_limited: 2456,
              avg_response_time: 95,
              success_rate: 99.2,
              data_transferred_gb: 245.7
            },
            {
              endpoint: '/api/v1/invoices',
              method: 'POST',
              requests: 234567,
              rate_limited: 1890,
              avg_response_time: 185,
              success_rate: 97.8,
              data_transferred_gb: 156.4
            },
            {
              endpoint: '/api/v1/payments',
              method: 'POST',
              requests: 189456,
              rate_limited: 3456,
              avg_response_time: 245,
              success_rate: 96.5,
              data_transferred_gb: 89.3
            },
            {
              endpoint: '/api/v1/work-orders',
              method: 'GET',
              requests: 167890,
              rate_limited: 1234,
              avg_response_time: 125,
              success_rate: 98.9,
              data_transferred_gb: 198.2
            },
            {
              endpoint: '/api/v1/analytics/reports',
              method: 'GET',
              requests: 145623,
              rate_limited: 2890,
              avg_response_time: 320,
              success_rate: 95.2,
              data_transferred_gb: 567.8
            }
          ],
          slowest_endpoints: [
            {
              endpoint: '/api/v1/reports/comprehensive',
              avg_response_time: 2450,
              p95_response_time: 4800,
              requests: 12456,
              optimization_potential: 'high'
            },
            {
              endpoint: '/api/v1/analytics/complex-query',
              avg_response_time: 1890,
              p95_response_time: 3600,
              requests: 8934,
              optimization_potential: 'medium'
            }
          ]
        },

        geographic_distribution: {
          requests_by_country: [
            { country: 'United States', country_code: 'US', requests: 1234567, percentage: 50.2 },
            { country: 'Canada', country_code: 'CA', requests: 345678, percentage: 14.1 },
            { country: 'United Kingdom', country_code: 'GB', requests: 234567, percentage: 9.5 },
            { country: 'Germany', country_code: 'DE', requests: 189456, percentage: 7.7 },
            { country: 'Australia', country_code: 'AU', requests: 145623, percentage: 5.9 }
          ],
          suspicious_activity: [
            {
              country: 'Unknown',
              ip_range: '192.168.1.0/24',
              requests: 5678,
              rate_limited: 4567,
              threat_level: 'high',
              recommended_action: 'block'
            }
          ]
        },

        user_analytics: {
          top_users_by_requests: [
            {
              user_id: 'user_123',
              user_tier: 'enterprise',
              requests: 45678,
              rate_limited: 234,
              avg_response_time: 125,
              success_rate: 98.5
            },
            {
              user_id: 'user_456',
              user_tier: 'professional',
              requests: 34567,
              rate_limited: 456,
              avg_response_time: 145,
              success_rate: 97.2
            }
          ],
          rate_limited_users: [
            {
              user_id: 'user_789',
              user_tier: 'basic',
              total_requests: 15678,
              rate_limited_requests: 1567,
              rate_limit_percentage: 10.0,
              recommended_action: 'upgrade_tier'
            }
          ]
        },

        api_key_analytics: {
          active_api_keys: 245,
          total_api_keys: 378,
          keys_with_usage: 198,
          keys_rate_limited: 45,
          top_api_keys: [
            {
              key_id: 'key_abc123',
              key_name: 'Production Mobile App',
              requests: 234567,
              rate_limited: 1234,
              last_used: '2024-01-20T11:45:00Z',
              permissions: ['read', 'write']
            },
            {
              key_id: 'key_def456',
              key_name: 'Data Analytics Pipeline',
              requests: 189456,
              rate_limited: 2345,
              last_used: '2024-01-20T11:42:00Z',
              permissions: ['read', 'analytics']
            }
          ]
        },

        performance_insights: {
          bottlenecks_identified: [
            {
              type: 'database_query',
              endpoint: '/api/v1/reports/comprehensive',
              impact: 'high',
              suggestion: 'Add database indexing or implement caching'
            },
            {
              type: 'external_api_dependency',
              endpoint: '/api/v1/payments/process',
              impact: 'medium',
              suggestion: 'Implement circuit breaker pattern'
            }
          ],
          optimization_recommendations: [
            {
              recommendation: 'Implement caching for frequently accessed endpoints',
              potential_improvement: '40-60% response time reduction',
              complexity: 'medium',
              estimated_effort: '2-3 weeks'
            },
            {
              recommendation: 'Add CDN for static assets and API responses',
              potential_improvement: '25-35% bandwidth reduction',
              complexity: 'low',
              estimated_effort: '1 week'
            }
          ]
        },

        forecasting: {
          predicted_usage: {
            next_24_hours: {
              expected_requests: 3200000,
              confidence_interval: '2950000-3450000',
              peak_hours: ['09:00-11:00', '14:00-16:00'],
              capacity_utilization: '78%'
            },
            next_7_days: {
              expected_requests: 21500000,
              growth_rate: '+12.5%',
              capacity_planning: 'Consider scaling resources by 15%'
            }
          },
          capacity_planning: {
            current_capacity: '45M requests/day',
            projected_need: '52M requests/day',
            scaling_recommendation: 'Add 2 additional server instances',
            cost_impact: '+$850/month'
          }
        }
      };

      return NextResponse.json({
        data: usageAnalytics,
        message: 'Usage analytics retrieved successfully'
      });
    }

    if (dataType === 'api_keys') {
      // Mock API keys management data
      const apiKeysData = {
        api_keys_overview: {
          organization_id: organizationId,
          total_keys: 25,
          active_keys: 18,
          expired_keys: 4,
          suspended_keys: 3,
          keys_nearing_limits: 6,
          last_updated: new Date().toISOString()
        },
        
        api_keys: [
          {
            key_id: 'ak_prod_123abc',
            key_name: 'Production Web App',
            description: 'Main production web application API key',
            created_at: '2024-01-01T00:00:00Z',
            last_used: '2024-01-20T11:30:00Z',
            status: 'active',
            permissions: ['read', 'write'],
            tier: 'enterprise',
            usage_stats: {
              requests_today: 12456,
              requests_this_month: 456789,
              quota_usage_percent: 72.5,
              rate_limit_hits_today: 23
            },
            security_settings: {
              allowed_origins: ['https://app.company.com'],
              ip_whitelist: ['203.0.113.0/24'],
              expires_at: '2024-12-31T23:59:59Z'
            },
            rate_limits: {
              requests_per_minute: 1000,
              requests_per_hour: 10000,
              concurrent_requests: 100
            }
          },
          {
            key_id: 'ak_test_456def',
            key_name: 'Development Environment',
            description: 'Development and testing API key',
            created_at: '2024-01-15T00:00:00Z',
            last_used: '2024-01-20T10:15:00Z',
            status: 'active',
            permissions: ['read', 'write', 'admin'],
            tier: 'development',
            usage_stats: {
              requests_today: 2341,
              requests_this_month: 45678,
              quota_usage_percent: 23.4,
              rate_limit_hits_today: 5
            },
            security_settings: {
              allowed_origins: ['http://localhost:3000', 'https://dev.company.com'],
              ip_whitelist: ['192.168.1.0/24'],
              expires_at: '2024-06-30T23:59:59Z'
            },
            rate_limits: {
              requests_per_minute: 200,
              requests_per_hour: 2000,
              concurrent_requests: 20
            }
          },
          {
            key_id: 'ak_analytics_789ghi',
            key_name: 'Data Analytics Pipeline',
            description: 'Dedicated key for data analytics and reporting',
            created_at: '2024-01-10T00:00:00Z',
            last_used: '2024-01-20T11:45:00Z',
            status: 'active',
            permissions: ['read', 'analytics'],
            tier: 'analytics',
            usage_stats: {
              requests_today: 8903,
              requests_this_month: 234567,
              quota_usage_percent: 89.2,
              rate_limit_hits_today: 156
            },
            security_settings: {
              allowed_origins: ['*'],
              expires_at: null
            },
            rate_limits: {
              requests_per_minute: 500,
              requests_per_hour: 5000,
              concurrent_requests: 50
            }
          }
        ],
        
        key_security_analysis: {
          security_score: 85,
          vulnerabilities: [
            {
              key_id: 'ak_analytics_789ghi',
              issue: 'Wildcard origin configuration',
              severity: 'medium',
              recommendation: 'Restrict to specific domains'
            }
          ],
          compliance_status: 'compliant',
          rotation_recommendations: [
            {
              key_id: 'ak_prod_123abc',
              reason: 'Key is 1 year old',
              urgency: 'low',
              suggested_rotation_date: '2024-03-01'
            }
          ]
        }
      };

      return NextResponse.json({
        data: apiKeysData,
        message: 'API keys data retrieved successfully'
      });
    }

    // Default: Return rate limiting configuration
    const rateLimitConfig = {
      organization_settings: {
        organization_id: organizationId,
        rate_limiting_enabled: true,
        strategy: 'sliding_window',
        last_updated: new Date().toISOString(),
        configuration_version: '2.1.0'
      },
      
      global_limits: {
        requests_per_second: 100,
        requests_per_minute: 1000,
        requests_per_hour: 10000,
        requests_per_day: 100000,
        concurrent_requests: 50,
        burst_capacity: 150,
        queue_size: 1000
      },
      
      endpoint_specific_limits: [
        {
          endpoint_pattern: '/api/v1/payments/*',
          method: 'POST',
          requests_per_minute: 100,
          priority: 'high',
          burst_capacity: 20,
          custom_headers: true,
          description: 'Payment processing endpoints with enhanced security'
        },
        {
          endpoint_pattern: '/api/v1/reports/*',
          method: 'GET',
          requests_per_minute: 50,
          priority: 'low',
          burst_capacity: 5,
          custom_headers: true,
          description: 'Resource-intensive reporting endpoints'
        },
        {
          endpoint_pattern: '/api/v1/auth/*',
          method: 'POST',
          requests_per_minute: 20,
          priority: 'critical',
          burst_capacity: 5,
          custom_headers: true,
          description: 'Authentication endpoints with strict limits'
        }
      ],
      
      user_tier_limits: [
        {
          tier: 'basic',
          multiplier: 0.5,
          custom_limits: {
            requests_per_minute: 50,
            requests_per_hour: 500,
            concurrent_requests: 5
          },
          features: ['standard_endpoints'],
          overage_handling: 'block'
        },
        {
          tier: 'professional',
          multiplier: 2.0,
          custom_limits: {
            requests_per_minute: 200,
            requests_per_hour: 2000,
            concurrent_requests: 20
          },
          features: ['standard_endpoints', 'analytics_endpoints'],
          overage_handling: 'queue'
        },
        {
          tier: 'enterprise',
          multiplier: 10.0,
          custom_limits: {
            requests_per_minute: 1000,
            requests_per_hour: 10000,
            concurrent_requests: 100
          },
          features: ['all_endpoints', 'priority_queue', 'dedicated_support'],
          overage_handling: 'allow_with_throttling'
        }
      ],
      
      geographic_settings: {
        enabled: true,
        default_multiplier: 1.0,
        country_specific: [
          { country_code: 'US', multiplier: 1.0, priority: 'high' },
          { country_code: 'CA', multiplier: 1.0, priority: 'high' },
          { country_code: 'GB', multiplier: 0.8, priority: 'medium' },
          { country_code: 'DE', multiplier: 0.8, priority: 'medium' }
        ],
        high_risk_countries: ['XX', 'YY'],
        high_risk_multiplier: 0.1
      },
      
      advanced_features: {
        adaptive_limiting: {
          enabled: true,
          learning_period_hours: 24,
          adjustment_factor: 0.2,
          min_requests_sample: 1000
        },
        anomaly_detection: {
          enabled: true,
          detection_algorithms: ['statistical', 'machine_learning'],
          sensitivity: 'medium',
          auto_block_threshold: 5.0
        },
        circuit_breaker: {
          enabled: true,
          failure_threshold: 50,
          timeout_seconds: 60,
          half_open_max_calls: 10
        },
        distributed_limiting: {
          enabled: true,
          sync_interval_seconds: 5,
          consistency_model: 'eventual'
        }
      },
      
      monitoring_and_alerting: {
        real_time_monitoring: true,
        alert_thresholds: {
          rate_limit_hit_rate_percent: 5.0,
          error_rate_percent: 2.0,
          response_time_p95_ms: 1000,
          capacity_utilization_percent: 80.0
        },
        notification_channels: [
          { type: 'email', endpoint: 'alerts@company.com' },
          { type: 'slack', webhook_url: 'https://hooks.slack.com/...' },
          { type: 'pagerduty', integration_key: 'pd_key_...' }
        ],
        dashboard_metrics: [
          'request_rate',
          'error_rate',
          'response_times',
          'rate_limit_hits',
          'geographic_distribution',
          'user_activity'
        ]
      },
      
      current_status: {
        system_health: 'healthy',
        active_limits: 245,
        total_requests_last_hour: 156789,
        rate_limited_requests_last_hour: 234,
        average_response_time_ms: 145,
        capacity_utilization_percent: 67.8,
        anomalies_detected: 0,
        blocked_ips: 12
      }
    };

    return NextResponse.json({
      data: rateLimitConfig,
      message: 'Rate limiting configuration retrieved successfully'
    });

  } catch (error) {
    console.error('Failed to retrieve rate limiting data:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve rate limiting data' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/system/rate-limiting
 * Create or update rate limiting configuration
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = RateLimitConfigSchema.parse(body);

    // Mock creating/updating rate limit configuration
    const configurationResult = {
      configuration_id: 'rl_config_${Date.now()}',
      organization_id: validatedData.organization_id,
      applied_settings: validatedData.rate_limit_settings,
      advanced_features: validatedData.advanced_features,
      
      deployment_info: {
        status: 'deployed',
        deployment_time: new Date().toISOString(),
        affected_endpoints: [
          '/api/v1/customers',
          '/api/v1/invoices',
          '/api/v1/payments',
          '/api/v1/work-orders',
          '/api/v1/reports'
        ],
        rollback_available: true
      },
      
      impact_analysis: {
        expected_performance_improvement: 'Reduced server load by 15-25%',
        user_experience_impact: 'Minimal impact for normal usage patterns',
        capacity_increase: 'Effective capacity increased by 30%',
        cost_optimization: 'Infrastructure costs reduced by $400-600/month'
      },
      
      validation_results: {
        configuration_valid: true,
        compatibility_check: 'passed',
        performance_simulation: {
          simulated_load_test: 'passed',
          projected_capacity: '150K requests/hour',
          bottleneck_analysis: 'No bottlenecks detected'
        },
        security_validation: {
          ddos_protection: 'enhanced',
          abuse_prevention: 'active',
          compliance_check: 'passed'
        }
      },
      
      monitoring_setup: {
        dashboards_updated: true,
        alerts_configured: true,
        baseline_metrics_captured: true,
        reporting_enabled: true
      },
      
      next_steps: [
        {
          action: 'Monitor system performance for first 24 hours',
          owner: 'operations_team',
          due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        },
        {
          action: 'Review rate limiting effectiveness after 1 week',
          owner: 'api_team',
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    };

    return NextResponse.json({
      data: configurationResult,
      message: 'Rate limiting configuration applied successfully'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid rate limiting configuration',
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

    console.error('Failed to apply rate limiting configuration:', error);
    return NextResponse.json(
      { error: 'Failed to apply rate limiting configuration' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v1/system/rate-limiting
 * Manage API keys or update specific rate limiting settings
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const url = new URL(request.url);
    const action = url.searchParams.get('action') || 'update_limits';

    if (action === 'manage_api_key`) {
      const validatedData = ApiKeyManagementSchema.parse(body);

      // Mock API key creation/management
      const apiKeyResult = {
        api_key: {
          key_id: `ak_${Date.now()}',
          key_value: 'sk_live_${Math.random().toString(36).substring(2)}', // Only returned on creation
          key_name: validatedData.api_key_config.key_name,
          description: validatedData.api_key_config.description,
          organization_id: validatedData.organization_id,
          created_at: new Date().toISOString(),
          status: 'active'
        },
        
        applied_configuration: {
          permissions: validatedData.api_key_config.permissions,
          rate_limit_tier: validatedData.api_key_config.rate_limit_tier,
          security_settings: {
            allowed_origins: validatedData.api_key_config.allowed_origins,
            allowed_ips: validatedData.api_key_config.allowed_ips,
            expiry_date: validatedData.api_key_config.expiry_date
          },
          usage_quotas: validatedData.api_key_config.usage_quotas,
          restrictions: validatedData.api_key_config.restrictions
        },
        
        rate_limits_applied: {
          requests_per_minute: 1000,
          requests_per_hour: 10000,
          requests_per_day: 100000,
          concurrent_requests: 50,
          burst_capacity: 150
        },
        
        security_features: {
          api_key_hashing: 'sha256',
          request_signing: 'hmac_sha256',
          ip_validation: validatedData.api_key_config.allowed_ips ? 'enabled' : 'disabled',
          origin_validation: validatedData.api_key_config.allowed_origins ? 'enabled' : 'disabled',
          expiry_monitoring: validatedData.api_key_config.expiry_date ? 'enabled' : 'disabled'
        },
        
        monitoring_setup: {
          usage_tracking: 'enabled',
          anomaly_detection: 'enabled',
          alerts_configured: [
            'quota_threshold_reached',
            'suspicious_activity_detected',
            'key_expiration_warning'
          ],
          audit_logging: 'enabled'
        }
      };

      return NextResponse.json({
        data: apiKeyResult,
        message: 'API key configured successfully',
        warning: 'Store the API key securely. It will not be shown again.'
      });
    }

    // Default: Update usage analytics configuration
    const validatedData = UsageAnalyticsSchema.parse(body);

    const analyticsConfig = {
      analytics_id: 'analytics_${Date.now()}',
      organization_id: validatedData.organization_id,
      configuration: validatedData.analytics_config,
      
      data_collection: {
        collection_enabled: true,
        real_time_processing: true,
        batch_processing_interval: '5 minutes',
        data_retention_days: 90,
        data_aggregation_levels: ['minute', 'hour', 'day', 'month']
      },
      
      dashboard_configuration: {
        real_time_dashboard: 'configured',
        executive_summary: 'configured',
        developer_metrics: 'configured',
        custom_dashboards: 2,
        scheduled_reports: [
          { frequency: 'daily', recipients: ['api-team@company.com'] },
          { frequency: 'weekly', recipients: ['management@company.com'] }
        ]
      },
      
      predictive_analytics: {
        forecasting_enabled: validatedData.analytics_config.include_predictions,
        forecasting_models: ['time_series', 'machine_learning'],
        prediction_accuracy: '89.5%',
        forecast_horizon: '30 days'
      },
      
      alert_configuration: {
        performance_alerts: 'enabled',
        usage_threshold_alerts: 'enabled',
        anomaly_alerts: 'enabled',
        capacity_planning_alerts: 'enabled'
      }
    };

    return NextResponse.json({
      data: analyticsConfig,
      message: 'Usage analytics configuration updated successfully'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid configuration request',
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

    console.error('Failed to update configuration:', error);
    return NextResponse.json(
      { error: 'Failed to update configuration' },
      { status: 500 }
    );
  }
}