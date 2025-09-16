# Thorbis Budget Guardrails

Comprehensive cost control system to prevent unexpected billing and give businesses control over their usage-based spending.

## 🎯 Guardrail Philosophy

**Core Principles**:
1. **Transparency First** - Always show current usage and projected costs
2. **Gradual Escalation** - Warnings before limits, soft limits before hard limits
3. **Business Continuity** - Critical operations continue with explicit opt-in
4. **User Control** - Business owners can adjust limits and overrides
5. **Predictable Costs** - Set spending caps to prevent runaway bills

## 🚨 Threshold System

### Threshold Levels
```typescript
interface UsageThresholds {
  // Warning thresholds (notifications only)
  warning_75: 0.75,    // 75% of limit
  warning_90: 0.90,    // 90% of limit
  
  // Action thresholds (behavioral changes)
  soft_limit: 1.0,     // 100% of limit (restrictions start)
  hard_limit: 1.25,    // 125% of limit (service paused)
  
  // Absolute safety net
  emergency_stop: 2.0  // 200% of limit (hard stop)
}
```

### Per-Metric Threshold Configuration
```typescript
const defaultThresholds = {
  active_app_users: {
    warning_75: true,     // Alert at 75% of AAU limit
    warning_90: true,     // Alert at 90% of AAU limit
    soft_limit: false,    // No soft limit (users need access)
    hard_limit: false,    // No hard limit (critical for operations)
    emergency_stop: true, // Stop at 200% (prevents abuse)
    
    projectedCostAlert: 50.00,  // Alert if projected monthly cost > $50
    maxMonthlyCost: 200.00      // Hard stop if monthly cost would exceed $200
  },
  
  embeddings: {
    warning_75: true,
    warning_90: true, 
    soft_limit: true,     // Throttle embedding generation
    hard_limit: false,    // Allow overages (AI features important)
    emergency_stop: true,
    
    projectedCostAlert: 25.00,
    maxMonthlyCost: 100.00
  },
  
  vector_search: {
    warning_75: true,
    warning_90: true,
    soft_limit: true,     // Cache more aggressively
    hard_limit: false,    // Search is core functionality  
    emergency_stop: true,
    
    projectedCostAlert: 30.00,
    maxMonthlyCost: 150.00
  },
  
  template_render: {
    warning_75: true,
    warning_90: true,
    soft_limit: true,     // Queue non-urgent renders
    hard_limit: true,     // Block rendering until approved
    emergency_stop: true,
    
    projectedCostAlert: 40.00,
    maxMonthlyCost: 200.00,
    
    // Special rules for critical documents
    criticalTypes: ['invoice', 'estimate', 'contract'],
    allowCriticalRenders: true
  },
  
  sms: {
    warning_75: true,
    warning_90: true,
    soft_limit: true,     // Batch non-urgent SMS
    hard_limit: true,     // Block SMS until approved
    emergency_stop: true,
    
    projectedCostAlert: 15.00,
    maxMonthlyCost: 50.00,
    
    // Emergency SMS always allowed
    emergencyTypes: ['security_alert', 'payment_failure'],
    allowEmergencySMS: true
  },
  
  email: {
    warning_75: true,
    warning_90: true,
    soft_limit: true,     // Queue marketing emails
    hard_limit: false,    // Email is low-cost, keep flowing
    emergency_stop: true,
    
    projectedCostAlert: 20.00,
    maxMonthlyCost: 75.00
  },
  
  storage_gb: {
    warning_75: true,
    warning_90: true,
    soft_limit: true,     // Compress/archive old data
    hard_limit: false,    // Don't break storage
    emergency_stop: false, // Storage is ongoing need
    
    projectedCostAlert: 10.00,
    maxMonthlyCost: 50.00,
    
    // Automatic cleanup suggestions
    suggestCleanup: true,
    autoArchiveAfterDays: 365
  },
  
  webhook_delivery: {
    warning_75: true,
    warning_90: true,
    soft_limit: true,     // Batch non-critical webhooks
    hard_limit: true,     // Pause webhooks until approved
    emergency_stop: true,
    
    projectedCostAlert: 25.00,
    maxMonthlyCost: 100.00,
    
    // Critical webhooks always delivered
    criticalTypes: ['payment_success', 'booking_confirmed'],
    allowCriticalWebhooks: true
  }
}
```

---

## 📊 Real-Time Monitoring

### Usage Dashboard
```typescript
interface UsageDashboard {
  tenantId: string
  currentPeriod: BillingPeriod
  overallStatus: 'healthy' | 'warning' | 'at_limit' | 'over_limit'
  
  // Current usage vs limits
  metrics: {
    [metric: string]: {
      current: number
      included: number
      remaining: number
      usagePercent: number
      
      // Projected end-of-month
      projected: number
      projectedOverage: number
      projectedCost: number
      
      // Status and alerts
      status: 'healthy' | 'warning' | 'at_limit' | 'over_limit'
      nextThreshold: number
      thresholdType: 'warning_90' | 'soft_limit' | 'hard_limit'
      
      // Days remaining in billing cycle
      daysRemaining: number
      dailyBurnRate: number
    }
  }
  
  // Total cost projection
  totalProjectedCost: number
  budgetRemaining: number
  budgetStatus: 'safe' | 'warning' | 'exceeded'
}

// Real-time usage calculation
async function getCurrentUsage(tenantId: string): Promise<UsageDashboard> {
  const billingPeriod = getCurrentBillingPeriod()
  const usage = await getMonthToDateUsage(tenantId)
  const thresholds = await getBusinessThresholds(tenantId)
  
  const metrics = {}
  for (const [metric, currentUsage] of Object.entries(usage)) {
    const config = thresholds[metric]
    const daysElapsed = getDaysElapsed(billingPeriod)
    const daysInMonth = getDaysInMonth(billingPeriod)
    
    // Project end-of-month usage based on current burn rate
    const dailyRate = currentUsage / daysElapsed
    const projected = dailyRate * daysInMonth
    const projectedOverage = Math.max(0, projected - config.included)
    
    metrics[metric] = {
      current: currentUsage,
      included: config.included,
      remaining: Math.max(0, config.included - currentUsage),
      usagePercent: (currentUsage / config.included) * 100,
      
      projected: projected,
      projectedOverage: projectedOverage,
      projectedCost: projectedOverage * config.overageRate,
      
      status: calculateStatus(currentUsage, config),
      nextThreshold: calculateNextThreshold(currentUsage, config),
      
      daysRemaining: daysInMonth - daysElapsed,
      dailyBurnRate: dailyRate
    }
  }
  
  return {
    tenantId,
    currentPeriod: billingPeriod,
    overallStatus: calculateOverallStatus(metrics),
    metrics,
    totalProjectedCost: calculateTotalProjectedCost(metrics),
    budgetRemaining: calculateBudgetRemaining(tenantId, metrics),
    budgetStatus: calculateBudgetStatus(tenantId, metrics)
  }
}
```

---

## 🔔 Notification System

### Notification Types
```typescript
interface UsageAlert {
  tenantId: string
  alertType: 'warning' | 'soft_limit' | 'hard_limit' | 'budget_exceeded'
  metric: string
  threshold: number
  currentUsage: number
  projectedCost: number
  daysRemaining: number
  
  // Recommended actions
  recommendations: string[]
  urgency: 'low' | 'medium' | 'high' | 'critical'
  
  // Available actions
  availableActions: {
    increaseBudget: boolean
    pauseService: boolean
    continueAnyway: boolean
    optimizeUsage: boolean
  }
}

// Alert templates
const alertTemplates = {
  warning_75: {
    title: "Usage Alert: 75% of Monthly Limit Reached",
    urgency: 'medium',
    message: "You've used 75% of your {{metric}} allowance with {{daysRemaining}} days left in your billing cycle. At your current usage rate, you may exceed your included allowance.",
    recommendations: [
      "Monitor usage closely",
      "Consider optimizing {{metric}} operations", 
      "Review your usage patterns"
    ]
  },
  
  warning_90: {
    title: "Usage Warning: 90% of Monthly Limit Reached", 
    urgency: 'high',
    message: "You've used 90% of your {{metric}} allowance. You're projected to exceed your limit by {{projectedOverage}} units, which would cost approximately ${{projectedCost}}.",
    recommendations: [
      "Take immediate action to reduce usage",
      "Consider increasing your plan limits",
      "Review efficiency optimizations"
    ]
  },
  
  soft_limit: {
    title: "Soft Limit Reached: {{metric}} Usage Restricted",
    urgency: 'high', 
    message: "You've reached 100% of your {{metric}} allowance. Some features have been restricted to prevent unexpected charges. Critical operations continue normally.",
    recommendations: [
      "Increase your budget to restore full functionality",
      "Click 'Continue Anyway' to allow overages",
      "Optimize usage to stay within limits"
    ]
  },
  
  hard_limit: {
    title: "Hard Limit Reached: {{metric}} Service Paused",
    urgency: 'critical',
    message: "{{metric}} operations have been paused to prevent unexpected charges. Your projected monthly cost was ${{projectedCost}}.",
    recommendations: [
      "Increase your budget immediately",
      "Click 'Continue Anyway' for this billing cycle",
      "Consider upgrading your plan for predictable costs"
    ]
  }
}
```

### Multi-Channel Notifications
```typescript
async function sendUsageAlert(alert: UsageAlert) {
  const business = await getBusiness(alert.tenantId)
  const notification = formatAlert(alert)
  
  // Always send in-app notification
  await sendInAppNotification({
    tenantId: alert.tenantId,
    type: 'usage_alert',
    title: notification.title,
    message: notification.message,
    actions: notification.actions,
    urgency: alert.urgency
  })
  
  // Send email for high/critical alerts
  if (['high', 'critical'].includes(alert.urgency)) {
    await sendEmailAlert({
      to: business.owner_email,
      cc: business.billing_contacts,
      subject: notification.title,
      template: 'usage_alert',
      data: {
        business_name: business.name,
        alert: notification,
        dashboard_url: `https://app.thorbis.com/billing/usage`,
        action_url: `https://app.thorbis.com/billing/limits?metric=${alert.metric}`
      }
    })
  }
  
  // Send SMS for critical alerts
  if (alert.urgency === 'critical') {
    await sendSMSAlert({
      to: business.owner_phone,
      message: `THORBIS ALERT: ${notification.title}. Take action at https://app.thorbis.com/billing`
    })
  }
  
  // Create webhook for external systems
  await sendWebhook({
    tenantId: alert.tenantId,
    event: 'usage.threshold_reached',
    data: alert
  })
}
```

---

## ⚙️ Automatic Actions

### Soft Limit Behaviors
```typescript
const softLimitActions = {
  embeddings: {
    action: 'throttle',
    description: 'Reduce embedding generation frequency',
    implementation: async (tenantId: string) => {
      // Cache embeddings more aggressively
      await updateCacheSettings(tenantId, { 
        embeddingCacheTTL: 24 * 60 * 60,  // 24 hours instead of 1 hour
        aggressiveEmbeddingCache: true
      })
      
      // Batch embedding requests
      await enableBatchProcessing(tenantId, 'embeddings')
    }
  },
  
  vector_search: {
    action: 'optimize',
    description: 'Enable aggressive search result caching',
    implementation: async (tenantId: string) => {
      await updateCacheSettings(tenantId, {
        searchResultCacheTTL: 6 * 60 * 60,  // 6 hours
        enableSearchResultSharing: true      // Share results across similar searches
      })
    }
  },
  
  template_render: {
    action: 'queue_non_critical',
    description: 'Queue non-essential document generation',
    implementation: async (tenantId: string) => {
      // Allow critical renders (invoices, estimates)
      const criticalTypes = ['invoice', 'estimate', 'contract', 'legal_document']
      
      await updateRenderSettings(tenantId, {
        queueNonCritical: true,
        criticalTypes: criticalTypes,
        maxQueuedRenders: 100,
        queueProcessingSchedule: 'off_peak_hours'
      })
    }
  },
  
  sms: {
    action: 'emergency_only',
    description: 'Send only critical SMS messages',
    implementation: async (tenantId: string) => {
      const emergencyTypes = ['security_alert', 'payment_failure', 'system_outage']
      
      await updateSMSSettings(tenantId, {
        emergencyOnly: true,
        allowedTypes: emergencyTypes,
        batchNonEmergency: true,
        nonEmergencyDelay: 60 * 60  // 1 hour delay
      })
    }
  },
  
  webhook_delivery: {
    action: 'critical_only',
    description: 'Deliver only critical webhooks',
    implementation: async (tenantId: string) => {
      const criticalEvents = [
        'booking.confirmed', 'booking.cancelled',
        'payment.succeeded', 'payment.failed',
        'invoice.finalized'
      ]
      
      await updateWebhookSettings(tenantId, {
        criticalOnly: true,
        allowedEvents: criticalEvents,
        batchNonCritical: true,
        batchDelay: 30 * 60  // 30 minutes
      })
    }
  }
}
```

### Hard Limit Behaviors
```typescript
const hardLimitActions = {
  template_render: {
    action: 'pause_service',
    description: 'Pause document generation until approved',
    allowOverride: true,
    criticalExceptions: ['invoice', 'estimate', 'contract']
  },
  
  sms: {
    action: 'pause_service',
    description: 'Pause SMS sending until approved',
    allowOverride: true,
    emergencyExceptions: ['security_alert', 'payment_failure']
  },
  
  webhook_delivery: {
    action: 'pause_service', 
    description: 'Pause webhook delivery until approved',
    allowOverride: true,
    criticalExceptions: ['payment.succeeded', 'booking.confirmed']
  }
}

// Pause service implementation
async function pauseService(tenantId: string, metric: string) {
  const config = hardLimitActions[metric]
  
  if (config) {
    // Pause the service
    await updateServiceSettings(tenantId, {
      [`${metric}_paused`]: true,
      paused_reason: 'hard_limit_reached',
      paused_at: new Date(),
      allow_critical: config.criticalExceptions || [],
      allow_emergency: config.emergencyExceptions || []
    })
    
    // Log the pause
    await logServicePause({
      tenantId,
      metric,
      reason: 'hard_limit_reached',
      config: config
    })
    
    // Send notification
    await sendPauseNotification(tenantId, metric, config)
  }
}
```

---

## 🚀 "Continue Anyway" System

### Override Options
```typescript
interface OverrideOptions {
  tenantId: string
  metric: string
  overrideType: 'one_time' | 'remainder_of_month' | 'increase_limit'
  
  // For one-time overrides
  oneTimeAmount?: number
  oneTimeReason?: string
  
  // For remainder of month
  monthlyCapIncrease?: number
  
  // For permanent increase
  newMonthlyLimit?: number
  effectiveDate?: string
  
  // Authorization
  authorizedBy: string
  authorizationMethod: 'dashboard' | 'email_link' | 'sms_code' | 'phone_call'
  businessOwnerConfirmed: boolean
}

// Override request UI
const overrideInterface = {
  title: "Service Usage Limit Reached",
  message: "{{metric}} has reached its monthly limit. Choose how to proceed:",
  
  options: [
    {
      id: 'pause',
      title: "Keep Service Paused",
      description: "Service will remain paused until next billing cycle",
      cost: "$0.00",
      icon: "pause-circle"
    },
    
    {
      id: 'one_time',
      title: "Continue for One Operation", 
      description: "Allow one more {{metric}} operation",
      cost: "${{single_unit_cost}}",
      icon: "play-circle",
      requiresConfirmation: true
    },
    
    {
      id: 'remainder_month',
      title: "Continue for Rest of Month",
      description: "Resume service until {{next_billing_date}}",
      cost: "Up to ${{projected_cost}}",
      icon: "calendar-check",
      requiresConfirmation: true,
      additionalOptions: {
        setDailyLimit: true,
        setTotalLimit: true
      }
    },
    
    {
      id: 'increase_limit',
      title: "Increase Monthly Allowance",
      description: "Permanently increase your {{metric}} allowance",
      cost: "${{additional_monthly_cost}}/month",
      icon: "trending-up", 
      requiresOwnerApproval: true
    }
  ]
}
```

### Authorization Flow
```typescript
async function requestOverride(
  tenantId: string, 
  metric: string, 
  overrideType: string,
  requestedBy: string
) {
  // Create override request
  const request = await createOverrideRequest({
    tenantId,
    metric,
    overrideType,
    requestedBy,
    status: 'pending',
    expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
  })
  
  // Get business owner contact
  const business = await getBusiness(tenantId)
  
  // Send authorization request
  if (overrideType === 'one_time') {
    // Quick approval via SMS/email
    await sendQuickApproval(business.owner_phone, {
      requestId: request.id,
      message: `Approve one-time ${metric} operation for $${calculateCost(metric, 1)}?`,
      approveUrl: `${baseUrl}/approve/${request.id}`,
      denyUrl: `${baseUrl}/deny/${request.id}`
    })
  } else {
    // Full approval process
    await sendFullApproval(business.owner_email, {
      requestId: request.id,
      business: business,
      metric: metric,
      overrideType: overrideType,
      projectedCost: calculateProjectedCost(tenantId, metric, overrideType),
      approvalUrl: `${baseUrl}/billing/approve/${request.id}`
    })
  }
  
  return request
}

// Quick approval handler
async function handleQuickApproval(requestId: string, approved: boolean) {
  const request = await getOverrideRequest(requestId)
  
  if (approved) {
    // Execute the override
    await executeOverride(request.tenantId, request.metric, {
      type: request.overrideType,
      amount: 1,
      authorizedBy: 'business_owner',
      authorizationMethod: 'sms_approval'
    })
    
    // Resume service temporarily
    await resumeService(request.tenantId, request.metric, '1_operation')
    
    // Send confirmation
    await sendOverrideConfirmation(request.tenantId, request.metric, 'approved')
  } else {
    await updateOverrideRequest(requestId, { 
      status: 'denied',
      deniedAt: new Date() 
    })
  }
}
```

---

## 💰 Budget Management

### Business Budget Settings
```typescript
interface BusinessBudget {
  tenantId: string
  
  // Overall monthly budget
  totalMonthlyBudget: number
  budgetType: 'soft' | 'hard'  // Soft = warnings, Hard = service pause
  
  // Per-metric budgets
  metricBudgets: {
    [metric: string]: {
      monthlyBudget: number
      budgetType: 'soft' | 'hard'
      
      // Auto-scaling options
      autoIncrease: boolean
      maxAutoIncrease: number
      increaseThreshold: number
    }
  }
  
  // Budget alerts
  budgetAlerts: {
    thresholds: number[]  // [0.75, 0.90, 1.0, 1.25]
    recipients: string[]
    channels: ('email' | 'sms' | 'webhook')[]
  }
  
  // Emergency settings
  emergencyOverride: {
    enabled: boolean
    maxOverride: number
    requiresApproval: boolean
    approvers: string[]
  }
}

// Default budget templates
const budgetTemplates = {
  startup: {
    totalMonthlyBudget: 100,
    budgetType: 'soft',
    metricBudgets: {
      active_app_users: { monthlyBudget: 20, budgetType: 'soft', autoIncrease: true, maxAutoIncrease: 50 },
      embeddings: { monthlyBudget: 5, budgetType: 'soft', autoIncrease: false },
      template_render: { monthlyBudget: 15, budgetType: 'hard', autoIncrease: false },
      sms: { monthlyBudget: 10, budgetType: 'hard', autoIncrease: false }
    }
  },
  
  growing: {
    totalMonthlyBudget: 300,
    budgetType: 'soft',
    metricBudgets: {
      active_app_users: { monthlyBudget: 100, budgetType: 'soft', autoIncrease: true, maxAutoIncrease: 200 },
      embeddings: { monthlyBudget: 25, budgetType: 'soft', autoIncrease: true, maxAutoIncrease: 50 },
      template_render: { monthlyBudget: 75, budgetType: 'soft', autoIncrease: false }
    }
  },
  
  enterprise: {
    totalMonthlyBudget: 1000,
    budgetType: 'soft',
    metricBudgets: {
      active_app_users: { monthlyBudget: 400, budgetType: 'soft', autoIncrease: true, maxAutoIncrease: 800 },
      embeddings: { monthlyBudget: 100, budgetType: 'soft', autoIncrease: true, maxAutoIncrease: 200 },
      vector_search: { monthlyBudget: 150, budgetType: 'soft', autoIncrease: true, maxAutoIncrease: 300 }
    }
  }
}
```

### Smart Budget Recommendations
```typescript
async function generateBudgetRecommendations(tenantId: string) {
  // Analyze 3-month usage history
  const usageHistory = await getUsageHistory(tenantId, 3)
  const currentBudget = await getBudgetSettings(tenantId)
  
  const recommendations = []
  
  for (const metric in usageHistory.metrics) {
    const history = usageHistory.metrics[metric]
    const current = currentBudget.metricBudgets[metric]
    
    // Calculate statistics
    const avgUsage = history.reduce((sum, month) => sum + month.usage, 0) / history.length
    const maxUsage = Math.max(...history.map(month => month.usage))
    const trend = calculateTrend(history.map(month => month.usage))
    
    // Generate recommendations
    if (trend > 0.2) {  // Growing usage
      recommendations.push({
        metric,
        type: 'increase_budget',
        currentBudget: current.monthlyBudget,
        recommendedBudget: Math.ceil(maxUsage * 1.2),
        reason: `${metric} usage has grown ${Math.round(trend * 100)}% over 3 months`,
        priority: trend > 0.5 ? 'high' : 'medium'
      })
    }
    
    if (avgUsage < current.monthlyBudget * 0.3) {  // Under-utilized
      recommendations.push({
        metric,
        type: 'reduce_budget',
        currentBudget: current.monthlyBudget,
        recommendedBudget: Math.ceil(avgUsage * 1.5),
        reason: `${metric} budget is under-utilized (avg usage: ${Math.round(avgUsage)})`,
        priority: 'low',
        potentialSavings: (current.monthlyBudget - Math.ceil(avgUsage * 1.5)) * getOverageRate(metric)
      })
    }
  }
  
  return recommendations
}
```

---

## 📱 User Experience

### Budget Dashboard Component
```typescript
const BudgetDashboard = () => {
  const { tenantId } = useAuth()
  const { usage, loading } = useUsage(tenantId)
  const { budget } = useBudget(tenantId)
  
  return (
    <div className="budget-dashboard">
      <div className="budget-overview">
        <h2>Usage & Budget Overview</h2>
        <div className="total-budget">
          <span>Monthly Budget: ${budget.totalMonthlyBudget}</span>
          <span>Projected Cost: ${usage.totalProjectedCost}</span>
          <span className={usage.budgetStatus}>
            {usage.budgetRemaining > 0 
              ? `$${usage.budgetRemaining} remaining`
              : `$${Math.abs(usage.budgetRemaining)} over budget`
            }
          </span>
        </div>
      </div>
      
      <div className="metrics-grid">
        {Object.entries(usage.metrics).map(([metric, data]) => (
          <MetricCard 
            key={metric}
            metric={metric}
            data={data}
            budget={budget.metricBudgets[metric]}
            onAdjustBudget={(newBudget) => adjustBudget(metric, newBudget)}
            onPauseService={() => pauseService(metric)}
            onContinueAnyway={() => requestOverride(metric)}
          />
        ))}
      </div>
    </div>
  )
}

const MetricCard = ({ metric, data, budget, onAdjustBudget, onPauseService, onContinueAnyway }) => {
  const getStatusColor = (status) => {
    switch(status) {
      case 'healthy': return 'green'
      case 'warning': return 'yellow' 
      case 'at_limit': return 'orange'
      case 'over_limit': return 'red'
    }
  }
  
  return (
    <div className={`metric-card status-${data.status}`}>
      <div className="metric-header">
        <h3>{formatMetricName(metric)}</h3>
        <span className="status-badge" style={{ background: getStatusColor(data.status) }}>
          {data.status}
        </span>
      </div>
      
      <div className="usage-bar">
        <div 
          className="usage-fill" 
          style={{ width: `${Math.min(100, data.usagePercent)}%` }}
        />
        <div className="usage-text">
          {data.current} / {data.included} included
        </div>
      </div>
      
      <div className="projections">
        <span>Projected: {data.projected}</span>
        <span>Est. cost: ${data.projectedCost}</span>
      </div>
      
      {data.status !== 'healthy' && (
        <div className="actions">
          <button onClick={() => onAdjustBudget(data.projected * 1.2)}>
            Increase Budget
          </button>
          
          {data.status === 'over_limit' && (
            <>
              <button onClick={onPauseService} className="secondary">
                Pause Service
              </button>
              <button onClick={onContinueAnyway} className="warning">
                Continue Anyway
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
```

---

## 🔧 Implementation Examples

### Real-time Usage Monitoring
```typescript
// WebSocket connection for real-time usage updates
const usageStream = new WebSocket(`wss://api.thorbis.com/usage/${tenantId}`)

usageStream.onmessage = (event) => {
  const update = JSON.parse(event.data)
  
  if (update.type === 'usage_increment') {
    // Update usage display
    updateUsageDisplay(update.metric, update.newTotal)
    
    // Check thresholds
    checkThresholds(update.metric, update.newTotal, update.included)
  }
  
  if (update.type === 'threshold_reached') {
    // Show immediate alert
    showUsageAlert(update)
    
    // Apply any automatic restrictions
    applyThresholdActions(update.metric, update.threshold)
  }
}

// Usage recording with threshold checking
async function recordUsageWithGuardrails(
  tenantId: string,
  metric: string, 
  quantity: number
) {
  // Get current usage and limits
  const current = await getCurrentUsage(tenantId, metric)
  const limits = await getUsageLimits(tenantId, metric)
  
  const newTotal = current.total + quantity
  const usagePercent = newTotal / current.included
  
  // Check if operation should be blocked
  if (limits.hard_limit_enabled && usagePercent >= limits.hard_limit_threshold) {
    throw new UsageLimitError({
      metric,
      current: newTotal,
      limit: current.included,
      action: 'hard_limit_reached',
      canOverride: limits.allow_override
    })
  }
  
  // Check for soft limit actions
  if (limits.soft_limit_enabled && usagePercent >= limits.soft_limit_threshold) {
    await applySoftLimitActions(tenantId, metric)
  }
  
  // Record the usage
  await recordUsage(tenantId, metric, quantity)
  
  // Check for new threshold crossings
  await checkAndTriggerAlerts(tenantId, metric, newTotal, current.included)
  
  return { success: true, newTotal, usagePercent }
}
```

This comprehensive budget guardrail system ensures businesses have complete control over their Thorbis spending while maintaining service availability for critical operations.
