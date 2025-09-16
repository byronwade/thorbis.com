import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

/**
 * Thorbis Business OS - Billing & Usage Metering API
 * 
 * Features from billing-config documentation:
 * - Usage-based billing with granular metering
 * - Budget guardrails with automatic enforcement
 * - Stripe integration with automated invoicing
 * - Multi-tier billing with industry-specific pricing
 * - Real-time usage tracking and alerts
 */

interface BillingUsage {
  business_id: string
  period: string // YYYY-MM format
  metrics: {
    api_calls: {
      current: number
      limit: number
      unit_cost: number // Per call
      total_cost: number
    }
    work_orders_created: {
      current: number
      limit: number
      unit_cost: number // Per work order
      total_cost: number
    }
    storage_gb: {
      current: number
      limit: number
      unit_cost: number // Per GB per month
      total_cost: number
    }
    ai_operations: {
      current: number
      limit: number
      unit_cost: number // Per AI operation
      total_cost: number
    }
    hardware_sessions: {
      current: number
      limit: number
      unit_cost: number // Per hardware session
      total_cost: number
    }
  }
  total_usage_cost: number
  base_subscription_cost: number
  total_monthly_cost: number
  budget_limit: number
  budget_remaining: number
  next_billing_date: string
  payment_status: 'current' | 'overdue' | 'failed' | 'suspended'
}

interface BudgetGuardrail {
  type: 'soft' | 'hard'
  threshold_percentage: number
  action: 'notify' | 'throttle' | 'suspend'
  notification_channels: string[]
}

// GET /api/hs/app/v1/billing - Get current usage and billing information
export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const headersList = await headers()
    const authHeader = headersList.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json(
        { error: { code: 'AUTH_ERROR', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    // Extract business context with AI safety validation
    const { businessId, userId, role } = await validateAndExtractJWTClaims(authHeader)
    
    // Role-based access control for billing data
    if (!['owner', 'manager'].includes(role)) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Insufficient permissions for billing data' } },
        { status: 403 }
      )
    }

    const url = new URL(request.url)
    const period = url.searchParams.get('period') || getCurrentPeriod()
    const includeHistory = url.searchParams.get('include_history') === 'true'

    // Fetch comprehensive billing usage data
    const billingUsage = await fetchBillingUsage(businessId, period)
    
    // Get budget guardrails configuration
    const budgetGuardrails = await getBudgetGuardrails(businessId)
    
    // Calculate overage projections
    const projections = await calculateUsageProjections(businessId, billingUsage)
    
    // Get billing history if requested
    let billingHistory = null
    if (includeHistory) {
      billingHistory = await getBillingHistory(businessId, 12) // Last 12 months
    }

    // Record API usage for billing
    await recordUsage(businessId, 'api_calls', 1, {
      endpoint: 'billing_read',
      user_id: userId,
      data_scope: includeHistory ? 'full' : 'current'
    })

    const responseTime = Date.now() - startTime
    await recordMetric('thorbis_billing_api_duration_seconds', responseTime / 1000, {
      method: 'GET',
      business_id: businessId
    })

    return NextResponse.json({
      data: {
        usage: billingUsage,
        guardrails: budgetGuardrails,
        projections,
        history: billingHistory
      },
      meta: {
        request_id: generateRequestId(),
        response_time_ms: responseTime,
        period,
        currency: 'USD'
      }
    }, {
      headers: {
        'Cache-Control': 'private, max-age=300', // 5 minutes
        'X-Business-ID': businessId,
        'X-Request-ID': generateRequestId()
      }
    })

  } catch (_error) {
    const responseTime = Date.now() - startTime
    
    await logError('billing_api_error', error as Error, {
      endpoint: '/api/hs/app/v1/billing',
      method: 'GET',
      response_time_ms: responseTime
    })

    return NextResponse.json(
      { 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: 'Failed to fetch billing information',
          request_id: generateRequestId()
        }
      },
      { status: 500 }
    )
  }
}

// POST /api/hs/app/v1/billing/budget-alerts - Configure budget guardrails
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const headersList = await headers()
    const authHeader = headersList.get('authorization')
    const idempotencyKey = headersList.get('idempotency-key')

    if (!authHeader) {
      return NextResponse.json(
        { error: { code: 'AUTH_ERROR', message: 'Authentication required' } },
        { status: 401 }
      )
    }

    const { businessId, userId, role } = await validateAndExtractJWTClaims(authHeader)
    
    // Only owners can modify budget settings
    if (role !== 'owner') {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Only business owners can modify budget settings' } },
        { status: 403 }
      )
    }

    if (!idempotencyKey) {
      return NextResponse.json(
        { 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: 'Idempotency-Key header required for billing modifications'
          }
        },
        { status: 400 }
      )
    }

    const body = await request.json()
    
    // Validate budget guardrail configuration
    const validationResult = await validateBudgetGuardrails(body.guardrails)
    if (!validationResult.valid) {
      return NextResponse.json(
        { 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: 'Invalid budget guardrail configuration',
            details: validationResult.errors
          }
        },
        { status: 400 }
      )
    }

    // AI Safety: Prevent unreasonable budget limits
    const safetyCheck = await validateBudgetSafety(body.guardrails, businessId)
    if (!safetyCheck.safe) {
      return NextResponse.json(
        { 
          error: { 
            code: 'SAFETY_ERROR', 
            message: 'Budget configuration failed safety validation',
            details: safetyCheck.warnings
          }
        },
        { status: 400 }
      )
    }

    // Update budget guardrails with audit trail
    const updatedGuardrails = await updateBudgetGuardrails(businessId, body.guardrails, {
      updated_by: userId,
      idempotency_key: idempotencyKey,
      change_reason: body.reason
    })

    // Set up Stripe webhook for budget monitoring
    await configureStripeWebhooks(businessId, updatedGuardrails)

    // Record usage for billing
    await recordUsage(businessId, 'api_calls', 1, {
      endpoint: 'billing_budget_update',
      user_id: userId,
      change_type: 'budget_guardrails'
    })

    const responseTime = Date.now() - startTime
    
    return NextResponse.json({
      data: {
        guardrails: updatedGuardrails,
        effective_date: new Date().toISOString()
      },
      meta: {
        request_id: generateRequestId(),
        response_time_ms: responseTime,
        idempotency_status: 'created'
      }
    }, {
      status: 201,
      headers: {
        'X-Idempotency-Key': idempotencyKey,
        'X-Business-ID': businessId
      }
    })

  } catch (_error) {
    const responseTime = Date.now() - startTime
    
    await logError('billing_budget_update_error', error as Error, {
      endpoint: '/api/hs/app/v1/billing/budget-alerts',
      method: 'POST',
      response_time_ms: responseTime
    })

    return NextResponse.json(
      { 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: 'Failed to update budget guardrails',
          request_id: generateRequestId()
        }
      },
      { status: 500 }
    )
  }
}

// Utility Functions

async function validateAndExtractJWTClaims(authHeader: string) {
  // Mock implementation - would validate JWT and extract claims
  return {
    businessId: 'biz_123',
    userId: 'user_456',
    role: 'owner' as const
  }
}

async function fetchBillingUsage(businessId: string, period: string): Promise<BillingUsage> {
  // Mock implementation - would fetch from billing database
  return {
    business_id: businessId,
    period,
    metrics: {
      api_calls: {
        current: 2450,
        limit: 10000,
        unit_cost: 0.001,
        total_cost: 2.45
      },
      work_orders_created: {
        current: 156,
        limit: 500,
        unit_cost: 0.50,
        total_cost: 78.00
      },
      storage_gb: {
        current: 2.3,
        limit: 10,
        unit_cost: 2.00,
        total_cost: 4.60
      },
      ai_operations: {
        current: 89,
        limit: 200,
        unit_cost: 0.10,
        total_cost: 8.90
      },
      hardware_sessions: {
        current: 45,
        limit: 100,
        unit_cost: 0.25,
        total_cost: 11.25
      }
    },
    total_usage_cost: 105.20,
    base_subscription_cost: 99.00,
    total_monthly_cost: 204.20,
    budget_limit: 500.00,
    budget_remaining: 295.80,
    next_billing_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    payment_status: 'current'
  }
}

async function getBudgetGuardrails(businessId: string): Promise<BudgetGuardrail[]> {
  // Mock implementation
  return [
    {
      type: 'soft',
      threshold_percentage: 80,
      action: 'notify',
      notification_channels: ['email', 'dashboard']
    },
    {
      type: 'hard',
      threshold_percentage: 95,
      action: 'throttle',
      notification_channels: ['email', 'sms', 'dashboard']
    }
  ]
}

async function calculateUsageProjections(businessId: string, usage: BillingUsage) {
  // Calculate projected end-of-month usage based on current trends
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
  const dayOfMonth = new Date().getDate()
  const projectionFactor = daysInMonth / dayOfMonth

  return {
    projected_total_cost: usage.total_usage_cost * projectionFactor + usage.base_subscription_cost,
    projected_overage: Math.max(0, (usage.total_usage_cost * projectionFactor + usage.base_subscription_cost) - usage.budget_limit),
    high_usage_metrics: Object.entries(usage.metrics)
      .filter(([_, metric]) => metric.current / metric.limit > 0.8)
      .map(([name, metric]) => ({
        name,
        usage_percentage: (metric.current / metric.limit) * 100,
        projected_overage: Math.max(0, metric.current * projectionFactor - metric.limit)
      }))
  }
}

async function getBillingHistory(businessId: string, months: number) {
  // Mock implementation - would fetch historical billing data
  return Array.from({ length: months }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const period = '${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}'
    
    return {
      period,
      total_cost: 180 + Math.random() * 100,
      usage_cost: 80 + Math.random() * 50,
      base_cost: 99,
      payment_status: 'paid'
    }
  })
}

async function validateBudgetGuardrails(guardrails: BudgetGuardrail[]) {
  const errors: unknown[] = []
  
  guardrails.forEach((guardrail, index) => {
    if (!['soft', 'hard'].includes(guardrail.type)) {
      errors.push({ field: 'guardrails[${index}].type', message: 'Must be "soft" or "hard"' })
    }
    if (guardrail.threshold_percentage < 1 || guardrail.threshold_percentage > 100) {
      errors.push({ field: 'guardrails[${index}].threshold_percentage', message: 'Must be between 1 and 100' })
    }
    if (!['notify', 'throttle', 'suspend'].includes(guardrail.action)) {
      errors.push({ field: 'guardrails[${index}].action', message: 'Must be "notify", "throttle", or "suspend"' })
    }
  })

  return {
    valid: errors.length === 0,
    errors
  }
}

async function validateBudgetSafety(guardrails: BudgetGuardrail[], businessId: string) {
  const warnings = []
  
  // AI Safety: Prevent overly restrictive budgets that could harm business operations
  const hardLimits = guardrails.filter(g => g.type === 'hard' && g.threshold_percentage < 50)
  if (hardLimits.length > 0) {
    warnings.push('Hard budget limits below 50% may disrupt critical business operations')
  }

  // Prevent accidental suspension
  const suspendLimits = guardrails.filter(g => g.action === 'suspend' && g.threshold_percentage < 90)
  if (suspendLimits.length > 0) {
    warnings.push('Account suspension below 90% budget usage is not recommended')
  }

  return {
    safe: warnings.length === 0,
    warnings
  }
}

async function updateBudgetGuardrails(businessId: string, guardrails: BudgetGuardrail[], metadata: unknown) {
  // Mock implementation - would update in database with audit trail
  return guardrails.map(g => ({
    ...g,
    id: generateRequestId(),
    created_at: new Date().toISOString(),
    updated_by: metadata.updated_by
  }))
}

async function configureStripeWebhooks(businessId: string, guardrails: BudgetGuardrail[]) {
  // Configure Stripe webhooks for budget monitoring
  console.log('Configuring Stripe webhooks for budget monitoring:`, businessId, guardrails)
}

async function recordUsage(businessId: string, metric: string, quantity: number, metadata?: any) {
  // Implementation would record usage for billing system
  console.log(`Usage recorded: ${businessId} - ${metric}: ${quantity}`, metadata)
}

async function recordMetric(name: string, value: number, labels: unknown) {
  // Implementation would record to Prometheus/observability system
  console.log(`Metric: ${name} = ${value}`, labels)
}

async function logError(type: string, error: Error, context: unknown) {
  // Implementation would log to structured logging system with PII redaction
  console.error(`${type}:`, error.message, context)
}

function generateRequestId() {
  return 'req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}'
}

function getCurrentPeriod() {
  const now = new Date()
  return '${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}'
}