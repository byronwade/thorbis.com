/**
 * Thorbis Billing Examples
 * 
 * End-to-end examples demonstrating metering, budget enforcement,
 * and usage tracking in the Thorbis Business OS.
 */

import { ThorbisTruthLayerSDK } from '../thorbis-truth-layer-sdk/index'

// ============================================================================
// MOCK BILLING SDK (for examples)
// ============================================================================

interface UsageMetrics {
  active_app_users: number
  embeddings: number
  vector_search: number
  template_render: number
  sms: number
  email: number
  storage_gb: number
  webhook_delivery: number
}

interface UsageLimits {
  included: UsageMetrics
  overages: Partial<UsageMetrics>
  costs: Partial<UsageMetrics>
}

class ThorbisBillingSDK {
  constructor(private apiKey: string, private baseURL: string) {}

  async getCurrentUsage(tenantId: string): Promise<{
    success: boolean
    data?: {
      tenantId: string
      billingPeriod: { start: string, end: string, month: string }
      usage: UsageMetrics
      limits: UsageLimits
      projectedCosts: Partial<UsageMetrics>
      totalProjectedCost: number
      budgetStatus: 'safe' | 'warning' | 'exceeded'
      alerts: any[]
    }
    error?: any
  }> {
    // Mock implementation
    return {
      success: true,
      data: {
        tenantId,
        billingPeriod: {
          start: '2024-02-01',
          end: '2024-02-29',
          month: 'February 2024'
        },
        usage: {
          active_app_users: 15,
          embeddings: 32000,
          vector_search: 78000,
          template_render: 850,
          sms: 250,
          email: 4500,
          storage_gb: 45.2,
          webhook_delivery: 18000
        },
        limits: {
          included: {
            active_app_users: 10,
            embeddings: 10000,
            vector_search: 25000,
            template_render: 500,
            sms: 100,
            email: 2500,
            storage_gb: 25,
            webhook_delivery: 10000
          },
          overages: {
            active_app_users: 5,
            embeddings: 22000,
            vector_search: 53000,
            template_render: 350,
            sms: 150,
            email: 2000,
            storage_gb: 20.2,
            webhook_delivery: 8000
          },
          costs: {
            active_app_users: 40.00,
            embeddings: 2.20,
            vector_search: 26.50,
            template_render: 87.50,
            sms: 7.50,
            email: 40.00,
            storage_gb: 2.02,
            webhook_delivery: 80.00
          }
        },
        projectedCosts: {
          active_app_users: 40.00,
          embeddings: 2.20,
          vector_search: 26.50,
          template_render: 87.50,
          sms: 7.50,
          email: 40.00,
          storage_gb: 2.02,
          webhook_delivery: 80.00
        },
        totalProjectedCost: 335.72,
        budgetStatus: 'warning',
        alerts: [
          {
            type: 'soft_limit_reached',
            metric: 'active_app_users',
            message: 'AAU soft limit reached - some features restricted'
          }
        ]
      }
    }
  }

  async getUsageHistory(tenantId: string, months: number = 6): Promise<{
    success: boolean
    data?: {
      tenantId: string
      months: Array<{
        month: string
        usage: UsageMetrics
        costs: Partial<UsageMetrics>
        totalCost: number
      }>
    }
  }> {
    // Mock historical data
    return {
      success: true,
      data: {
        tenantId,
        months: [
          {
            month: '2024-01',
            usage: {
              active_app_users: 8,
              embeddings: 18000,
              vector_search: 45000,
              template_render: 650,
              sms: 180,
              email: 3200,
              storage_gb: 38.5,
              webhook_delivery: 12000
            },
            costs: {
              embeddings: 0.80,
              vector_search: 10.00,
              template_render: 37.50,
              sms: 4.00,
              email: 14.00,
              storage_gb: 1.35,
              webhook_delivery: 20.00
            },
            totalCost: 137.65
          },
          {
            month: '2023-12',
            usage: {
              active_app_users: 6,
              embeddings: 12000,
              vector_search: 28000,
              template_render: 420,
              sms: 95,
              email: 2100,
              storage_gb: 22.3,
              webhook_delivery: 8500
            },
            costs: {
              embeddings: 0.20,
              vector_search: 1.50,
              template_render: 0.00,
              sms: 0.00,
              email: 0.00,
              storage_gb: 0.00,
              webhook_delivery: 0.00
            },
            totalCost: 51.70
          },
          {
            month: '2023-11',
            usage: {
              active_app_users: 5,
              embeddings: 8500,
              vector_search: 20000,
              template_render: 380,
              sms: 75,
              email: 1800,
              storage_gb: 18.7,
              webhook_delivery: 6200
            },
            costs: {},
            totalCost: 50.00
          }
        ]
      }
    }
  }

  async recordUsage(tenantId: string, metric: keyof UsageMetrics, quantity: number): Promise<{
    success: boolean
    data?: {
      recorded: boolean
      newTotal: number
      thresholdCrossed?: string
      actionTaken?: string
    }
    error?: any
  }> {
    // Mock usage recording with threshold checking
    return {
      success: true,
      data: {
        recorded: true,
        newTotal: quantity,
        thresholdCrossed: 'soft_limit',
        actionTaken: 'throttling_enabled'
      }
    }
  }

  async setBudgetLimits(tenantId: string, limits: Partial<UsageMetrics>): Promise<{
    success: boolean
    data?: { updated: boolean }
  }> {
    return { success: true, data: { updated: true } }
  }

  async requestUsageOverride(
    tenantId: string, 
    metric: keyof UsageMetrics,
    overrideType: 'one_time' | 'remainder_month' | 'increase_limit',
    amount?: number
  ): Promise<{
    success: boolean
    data?: {
      overrideId: string
      status: 'pending' | 'approved' | 'denied'
      approvalUrl?: string
    }
  }> {
    return {
      success: true,
      data: {
        overrideId: 'override_' + Date.now(),
        status: 'pending',
        approvalUrl: `https://app.thorbis.com/billing/approve/override_${Date.now()}`
      }
    }
  }
}

// ============================================================================
// EXAMPLE 1: TENANT EXCEEDING AAU LIMIT
// ============================================================================

/**
 * Complete example showing a business exceeding AAU limits,
 * triggering alerts, and generating detailed invoice
 */
export async function exampleAAUExceedanceScenario() {
  console.log('🏢 Example: Tenant Exceeding AAU Limit\n')
  
  const tenantId = 'biz_austin_hvac_456'
  const billing = new ThorbisBillingSDK(
    process.env.THORBIS_BILLING_API_KEY!,
    'https://billing.thorbis.com/v1'
  )

  // Scenario: Austin HVAC Pros grows from 8 to 15 active users during February
  console.log('📈 Scenario: Austin HVAC Pros business growth')
  console.log('   Started month: 8 active users')
  console.log('   Current: 15 active users (exceeded 10 included)')
  console.log('   Days remaining: 5 days in billing cycle\n')

  // 1. Check current usage and limits
  console.log('1️⃣  Checking current usage...')
  const currentUsage = await billing.getCurrentUsage(tenantId)
  
  if (currentUsage.success && currentUsage.data) {
    const usage = currentUsage.data
    console.log(`   ✅ Current AAU: ${usage.usage.active_app_users}`)
    console.log(`   ✅ Included AAU: ${usage.limits.included.active_app_users}`)
    console.log(`   ✅ Overage AAU: ${usage.limits.overages.active_app_users}`)
    console.log(`   ✅ Overage Cost: $${usage.limits.costs.active_app_users}`)
    console.log(`   ✅ Budget Status: ${usage.budgetStatus}`)
    console.log(`   ✅ Total Projected: $${usage.totalProjectedCost}\n`)

    // 2. Show threshold alerts
    if (usage.alerts.length > 0) {
      console.log('2️⃣  Active Alerts:')
      usage.alerts.forEach(alert => {
        console.log(`   ⚠️  ${alert.type}: ${alert.message}`)
      })
      console.log()
    }

    // 3. Generate detailed invoice preview
    console.log('3️⃣  February 2024 Invoice Preview:')
    console.log('   =====================================')
    console.log('   Thorbis Business OS - Base Plan: $50.00')
    console.log('   ')
    console.log('   Usage Charges:')
    console.log(`   • Active App Users: 5 additional × $8.00 = $${usage.limits.costs.active_app_users}`)
    console.log(`   • AI Embeddings: 22,000 additional × $0.10/1K = $${usage.limits.costs.embeddings}`)
    console.log(`   • Vector Search: 53,000 additional × $0.50/1K = $${usage.limits.costs.vector_search}`)
    console.log(`   • Template Renders: 350 additional × $0.25 = $${usage.limits.costs.template_render}`)
    console.log(`   • SMS Messages: 150 additional × $0.05 = $${usage.limits.costs.sms}`)
    console.log(`   • Email Messages: 2,000 additional × $0.02 = $${usage.limits.costs.email}`)
    console.log(`   • Storage: 20.2 additional GB × $0.10 = $${usage.limits.costs.storage_gb}`)
    console.log(`   • Webhooks: 8,000 additional × $0.01 = $${usage.limits.costs.webhook_delivery}`)
    console.log('   ')
    console.log(`   Subtotal: $${50 + usage.totalProjectedCost}`)
    console.log(`   Tax (8.25%): $${((50 + usage.totalProjectedCost) * 0.0825).toFixed(2)}`)
    console.log(`   =====================================`)
    console.log(`   Total: $${((50 + usage.totalProjectedCost) * 1.0825).toFixed(2)}`)
    console.log()

    // 4. Show usage optimization recommendations
    console.log('4️⃣  Cost Optimization Recommendations:')
    console.log('   • Consider upgrading to higher AAU allowance')
    console.log('   • Review user access - remove inactive users')
    console.log('   • Implement role-based access to reduce AAU count')
    console.log('   • Cache search results to reduce vector search usage')
    console.log('   • Batch template generation for efficiency')
    console.log()

    return {
      tenantId,
      currentUsage: usage.usage,
      projectedCost: usage.totalProjectedCost,
      invoiceTotal: ((50 + usage.totalProjectedCost) * 1.0825),
      recommendations: [
        'upgrade_aau_allowance',
        'review_user_access',
        'implement_caching',
        'batch_operations'
      ]
    }
  }

  throw new Error('Failed to retrieve usage data')
}

// ============================================================================
// EXAMPLE 2: REAL-TIME USAGE TRACKING WITH SDK
// ============================================================================

/**
 * SDK examples showing real-time usage retrieval and monitoring
 */
export async function exampleRealTimeUsageTracking() {
  console.log('📊 Example: Real-time Usage Tracking with SDK\n')
  
  const tenantId = 'biz_smith_plumbing_123'
  const billing = new ThorbisBillingSDK(
    process.env.THORBIS_BILLING_API_KEY!,
    'https://billing.thorbis.com/v1'
  )

  // 1. Real-time usage dashboard
  console.log('1️⃣  Real-time Usage Dashboard:')
  const usage = await billing.getCurrentUsage(tenantId)
  
  if (usage.success && usage.data) {
    const data = usage.data
    
    console.log(`   Business: Smith Plumbing Co`)
    console.log(`   Billing Period: ${data.billingPeriod.month}`)
    console.log(`   Budget Status: ${data.budgetStatus.toUpperCase()}`)
    console.log()
    
    // Display each metric with progress bar
    Object.entries(data.usage).forEach(([metric, current]) => {
      const included = data.limits.included[metric as keyof UsageMetrics]
      const percentage = (current / included) * 100
      const status = percentage >= 100 ? 'OVER' : percentage >= 90 ? 'HIGH' : percentage >= 75 ? 'MED' : 'OK'
      
      console.log(`   ${formatMetricName(metric)}:`)
      console.log(`     Current: ${formatUsageValue(current, metric)}`)
      console.log(`     Included: ${formatUsageValue(included, metric)}`)
      console.log(`     Usage: ${Math.min(100, percentage).toFixed(1)}% [${status}]`)
      console.log(`     Progress: ${createProgressBar(percentage)}`)
      if (percentage > 100) {
        const overage = current - included
        const cost = data.limits.costs?.[metric as keyof UsageMetrics] || 0
        console.log(`     Overage: ${formatUsageValue(overage, metric)} ($${cost})`)
      }
      console.log()
    })
  }

  // 2. Usage history and trends
  console.log('2️⃣  Usage History & Trends:')
  const history = await billing.getUsageHistory(tenantId, 3)
  
  if (history.success && history.data) {
    console.log('   Last 3 Months:')
    history.data.months.forEach(month => {
      console.log(`   ${month.month}: AAU ${month.usage.active_app_users}, Total Cost $${month.totalCost}`)
    })
    
    // Calculate trends (handle case where we only have 1 month)
    const months = history.data.months
    let aauTrend = 0, costTrend = 0
    
    if (months.length >= 2) {
      aauTrend = ((months[0].usage.active_app_users - months[months.length - 1].usage.active_app_users) / months[months.length - 1].usage.active_app_users) * 100
      costTrend = ((months[0].totalCost - months[months.length - 1].totalCost) / months[months.length - 1].totalCost) * 100
    }
    
    console.log()
    console.log(`   AAU Trend: ${aauTrend > 0 ? '+' : ''}${aauTrend.toFixed(1)}%`)
    console.log(`   Cost Trend: ${costTrend > 0 ? '+' : ''}${costTrend.toFixed(1)}%`)
    console.log()
  }

  // 3. Record new usage and check thresholds
  console.log('3️⃣  Recording New Usage:')
  
  // Simulate generating 500 new embeddings
  console.log('   Generating 500 AI embeddings for customer matching...')
  const embeddingResult = await billing.recordUsage(tenantId, 'embeddings', 500)
  
  if (embeddingResult.success && embeddingResult.data) {
    console.log(`   ✅ Recorded: 500 embeddings`)
    console.log(`   ✅ New Total: ${embeddingResult.data.newTotal}`)
    
    if (embeddingResult.data.thresholdCrossed) {
      console.log(`   ⚠️  Threshold Crossed: ${embeddingResult.data.thresholdCrossed}`)
      console.log(`   🔧 Action Taken: ${embeddingResult.data.actionTaken}`)
    }
  }
  console.log()

  // 4. Budget management
  console.log('4️⃣  Budget Management:')
  
  // Set new budget limits
  const newLimits = {
    active_app_users: 15,  // Increase from 10
    template_render: 750   // Increase from 500
  }
  
  console.log('   Setting new budget limits...')
  const budgetResult = await billing.setBudgetLimits(tenantId, newLimits)
  
  if (budgetResult.success) {
    console.log(`   ✅ Updated AAU limit to 15 users`)
    console.log(`   ✅ Updated template render limit to 750 renders`)
  }
  console.log()

  return {
    tenantId,
    currentUsage: usage.data?.usage,
    trends: {
      aau: 25.5,  // Mock calculated trend
      cost: 18.2  // Mock calculated trend
    },
    budgetUpdated: budgetResult.success
  }
}

// ============================================================================
// EXAMPLE 3: BUDGET LIMIT EXCEEDED - OVERRIDE FLOW
// ============================================================================

/**
 * Example showing budget limit exceeded and override request flow
 */
export async function exampleBudgetOverrideFlow() {
  console.log('🚨 Example: Budget Limit Exceeded - Override Flow\n')
  
  const tenantId = 'biz_downtown_electric_789'
  const billing = new ThorbisBillingSDK(
    process.env.THORBIS_BILLING_API_KEY!,
    'https://billing.thorbis.com/v1'
  )

  // Scenario: Template rendering hits hard limit
  console.log('📄 Scenario: Template Rendering Hard Limit Reached')
  console.log('   Current: 625 templates rendered')
  console.log('   Hard Limit: 500 (125% of 500 included)')
  console.log('   Service: PAUSED')
  console.log('   Customer Impact: Cannot generate invoices\n')

  // 1. Attempt to render invoice template (should fail)
  console.log('1️⃣  Attempting to render invoice template...')
  try {
    await billing.recordUsage(tenantId, 'template_render', 1)
    console.log('   ❌ This should not succeed - hard limit reached')
  } catch (error) {
    console.log('   ⛔ Service paused: Template rendering hard limit exceeded')
    console.log('   💡 Critical templates (invoices) can still be approved')
    console.log()
  }

  // 2. Request override for remainder of month
  console.log('2️⃣  Requesting Usage Override:')
  console.log('   Override Type: Remainder of month')
  console.log('   Estimated Additional Cost: $37.50 (150 renders × $0.25)')
  
  const overrideResult = await billing.requestUsageOverride(
    tenantId,
    'template_render',
    'remainder_month',
    150  // Allow 150 more renders
  )
  
  if (overrideResult.success && overrideResult.data) {
    console.log(`   ✅ Override Request ID: ${overrideResult.data.overrideId}`)
    console.log(`   ⏳ Status: ${overrideResult.data.status.toUpperCase()}`)
    console.log(`   🔗 Approval URL: ${overrideResult.data.approvalUrl}`)
    console.log()
    
    // 3. Simulate approval notification
    console.log('3️⃣  Override Approval Process:')
    console.log('   📧 Email sent to business owner: mike@downtownelectric.com')
    console.log('   📱 SMS sent to: +1-512-555-0300')
    console.log('   ⏰ Approval expires in: 30 minutes')
    console.log()
    console.log('   Approval Message:')
    console.log('   "Template rendering limit exceeded. Approve additional')
    console.log('   150 renders for $37.50 for remainder of February?"')
    console.log('   [APPROVE] [DENY] [ADJUST AMOUNT]')
    console.log()
    
    // 4. Show what happens after approval
    console.log('4️⃣  After Approval (Simulated):')
    console.log('   ✅ Service resumed immediately')
    console.log('   ✅ Additional 150 renders authorized')
    console.log('   ✅ Budget notifications updated')
    console.log('   ✅ March billing plan recommendations generated')
    console.log()
    
    return {
      overrideId: overrideResult.data.overrideId,
      estimatedCost: 37.50,
      additionalUnits: 150,
      approvalRequired: true
    }
  }

  throw new Error('Failed to request override')
}

// ============================================================================
// EXAMPLE 4: MULTI-METRIC DASHBOARD WITH REAL-TIME UPDATES  
// ============================================================================

/**
 * Comprehensive dashboard example with real-time usage monitoring
 */
export async function exampleUsageDashboard() {
  console.log('📊 Example: Multi-Metric Usage Dashboard\n')
  
  const tenantId = 'biz_metro_field_services_999'
  const billing = new ThorbisBillingSDK(
    process.env.THORBIS_BILLING_API_KEY!,
    'https://billing.thorbis.com/v1'
  )

  console.log('🏢 Metro Field Services - Usage Dashboard')
  console.log('   Plan: Thorbis Business OS Base ($50/month)')
  console.log('   Billing Period: February 1-29, 2024')
  console.log('   Days Remaining: 3 days\n')

  const usage = await billing.getCurrentUsage(tenantId)
  
  if (usage.success && usage.data) {
    const data = usage.data
    
    // Overall status
    console.log('📈 Overall Status:')
    console.log(`   Budget: $300 monthly limit`)
    console.log(`   Projected Cost: $${data.totalProjectedCost}`)
    console.log(`   Status: ${getStatusEmoji(data.budgetStatus)} ${data.budgetStatus.toUpperCase()}`)
    console.log()
    
    // Detailed metrics table
    console.log('📊 Detailed Metrics:')
    console.log('   ┌─────────────────────┬──────────┬──────────┬────────────┬──────────────┬──────────┐')
    console.log('   │ Metric              │ Current  │ Included │ Usage %    │ Overage Cost │ Status   │')
    console.log('   ├─────────────────────┼──────────┼──────────┼────────────┼──────────────┼──────────┤')
    
    Object.entries(data.usage).forEach(([metric, current]) => {
      const included = data.limits.included[metric as keyof UsageMetrics]
      const percentage = (current / included) * 100
      const cost = data.limits.costs?.[metric as keyof UsageMetrics] || 0
      const status = getUsageStatus(percentage)
      
      console.log(`   │ ${formatMetricName(metric).padEnd(19)} │ ${String(current).padStart(8)} │ ${String(included).padStart(8)} │ ${percentage.toFixed(1).padStart(9)}% │ ${('$' + cost.toFixed(2)).padStart(12)} │ ${status.padEnd(8)} │`)
    })
    
    console.log('   └─────────────────────┴──────────┴──────────┴────────────┴──────────────┴──────────┘')
    console.log()
    
    // Alerts and recommendations
    if (data.alerts.length > 0) {
      console.log('🚨 Active Alerts:')
      data.alerts.forEach(alert => {
        console.log(`   • ${alert.type}: ${alert.message}`)
      })
      console.log()
    }
    
    console.log('💡 Optimization Recommendations:')
    console.log('   • AAU: Consider user access review (5 over limit)')
    console.log('   • Templates: Implement template caching (350 over limit)')
    console.log('   • Storage: Archive files older than 12 months (20GB over)')
    console.log('   • Webhooks: Batch non-critical notifications (8K over)')
    console.log()
    
    // Projected next month
    console.log('🔮 March 2024 Projections (based on trends):')
    console.log('   • Projected AAU: 18 users ($64 overage)')
    console.log('   • Projected Total: $425 (+26% from February)')
    console.log('   • Recommend: Upgrade to Growth plan ($150/month + overages)')
    console.log()
    
    return {
      dashboard: {
        tenantId,
        totalCost: data.totalProjectedCost,
        budgetStatus: data.budgetStatus,
        metricsOverLimit: Object.entries(data.usage).filter(
          ([metric, current]) => current > data.limits.included[metric as keyof UsageMetrics]
        ).length,
        activeAlerts: data.alerts.length
      }
    }
  }
  
  throw new Error('Failed to load dashboard data')
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatMetricName(metric: string): string {
  const names = {
    active_app_users: 'Active App Users',
    embeddings: 'AI Embeddings',
    vector_search: 'Vector Search',
    template_render: 'Template Renders',
    sms: 'SMS Messages',
    email: 'Email Messages',
    storage_gb: 'Storage (GB)',
    webhook_delivery: 'Webhook Delivery'
  }
  return names[metric as keyof typeof names] || metric
}

function formatUsageValue(value: number, metric: string): string {
  if (metric === 'storage_gb') {
    return `${value.toFixed(1)} GB`
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`
  }
  return value.toString()
}

function createProgressBar(percentage: number): string {
  const width = 20
  const filled = Math.min(width, Math.round((percentage / 100) * width))
  const empty = width - filled
  
  let bar = ''
  bar += '█'.repeat(filled)
  bar += '░'.repeat(empty)
  
  const color = percentage >= 100 ? '🔴' : percentage >= 90 ? '🟠' : percentage >= 75 ? '🟡' : '🟢'
  return `${color} ${bar} ${Math.min(100, percentage).toFixed(1)}%`
}

function getStatusEmoji(status: string): string {
  switch (status) {
    case 'safe': return '🟢'
    case 'warning': return '🟡' 
    case 'exceeded': return '🔴'
    default: return '⚪'
  }
}

function getUsageStatus(percentage: number): string {
  if (percentage >= 125) return '🔴 HARD'
  if (percentage >= 100) return '🟠 SOFT'
  if (percentage >= 90) return '🟡 WARN'
  if (percentage >= 75) return '🟡 WATCH'
  return '🟢 OK'
}

// ============================================================================
// MAIN EXAMPLE RUNNER
// ============================================================================

export async function runAllBillingExamples() {
  console.log('🚀 Thorbis Billing System Examples\n')
  console.log('=' .repeat(60))
  console.log()
  
  try {
    // Example 1: AAU Exceedance
    const aauExample = await exampleAAUExceedanceScenario()
    console.log('✅ AAU Exceedance Example Complete')
    console.log(`   Invoice Total: $${aauExample.invoiceTotal.toFixed(2)}`)
    console.log()
    
    console.log('=' .repeat(60))
    console.log()
    
    // Example 2: Real-time Usage
    const usageExample = await exampleRealTimeUsageTracking()
    console.log('✅ Real-time Usage Example Complete')
    console.log(`   AAU Trend: +${usageExample.trends.aau}%`)
    console.log()
    
    console.log('=' .repeat(60))
    console.log()
    
    // Example 3: Override Flow
    const overrideExample = await exampleBudgetOverrideFlow()
    console.log('✅ Budget Override Example Complete')
    console.log(`   Override Cost: $${overrideExample.estimatedCost}`)
    console.log()
    
    console.log('=' .repeat(60))
    console.log()
    
    // Example 4: Dashboard
    const dashboardExample = await exampleUsageDashboard()
    console.log('✅ Usage Dashboard Example Complete')
    console.log(`   Metrics Over Limit: ${dashboardExample.dashboard.metricsOverLimit}`)
    console.log()
    
    console.log('🎉 All billing examples completed successfully!')
    
    return {
      aauExceedance: aauExample,
      realTimeUsage: usageExample,
      budgetOverride: overrideExample,
      dashboard: dashboardExample
    }
    
  } catch (error) {
    console.error('❌ Example execution failed:', error)
    throw error
  }
}

// Individual examples already exported above

// Run examples if called directly
if (require.main === module) {
  runAllBillingExamples().catch(console.error)
}
