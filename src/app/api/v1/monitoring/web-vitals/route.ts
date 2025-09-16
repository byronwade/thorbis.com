import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const WebVitalsReportSchema = z.object({
  metric: z.string(),
  value: z.number(),
  delta: z.number().optional(),
  id: z.string().optional(),
  url: z.string(),
  timestamp: z.number(),
  deviceType: z.enum(['mobile', 'tablet', 'desktop']),
  connectionType: z.string().optional(),
  rating: z.enum(['good', 'needs-improvement', 'poor']),
  navigationType: z.string().optional(),
  sessionId: z.string(),
  userId: z.string().optional()
})

const BatchReportSchema = z.object({
  reports: z.array(WebVitalsReportSchema)
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the batch of reports
    const validatedBatch = BatchReportSchema.parse(body)
    
    // Process each report
    for (const report of validatedBatch.reports) {
      await processWebVitalsReport(report)
    }
    
    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('WebVitals Batch Processed:', {
        count: validatedBatch.reports.length,
        metrics: validatedBatch.reports.map(r => '${r.metric}:${r.value}(${r.rating})),
        timestamp: new Date().toISOString()
      })
    }
    
    return NextResponse.json({ 
      success: true, 
      processed: validatedBatch.reports.length 
    }, { status: 200 })
  } catch (error) {
    console.error('Failed to process WebVitals reports:', error)
    
    return NextResponse.json(
      { error: 'Invalid WebVitals report format' },
      { status: 400 }
    )
  }
}

async function processWebVitalsReport(report: z.infer<typeof WebVitalsReportSchema>) {
  // 1. Store in analytics services
  if (process.env.NODE_ENV === 'production') {
    await sendToAnalyticsServices(report)
  }
  
  // 2. Check for performance budget violations
  const violation = checkPerformanceBudget(report)
  if (violation) {
    await alertPerformanceViolation(report, violation)
  }
  
  // 3. Store for internal analytics
  await storeInternalMetric(report)
  
  // 4. Update real-time dashboard data
  await updateDashboardCache(report)
}

async function sendToAnalyticsServices(report: z.infer<typeof WebVitalsReportSchema>) {
  const promises: Promise<void>[] = []
  
  // Google Analytics 4
  if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && process.env.GA4_API_SECRET) {
    promises.push(sendToGA4(report))
  }
  
  // New Relic
  if (process.env.NEW_RELIC_LICENSE_KEY) {
    promises.push(sendToNewRelic(report))
  }
  
  // DataDog
  if (process.env.DATADOG_API_KEY) {
    promises.push(sendToDataDog(report))
  }
  
  // Custom analytics endpoint
  if (process.env.CUSTOM_ANALYTICS_ENDPOINT) {
    promises.push(sendToCustomAnalytics(report))
  }
  
  // Send to all services concurrently
  await Promise.allSettled(promises)
}

async function sendToGA4(report: z.infer<typeof WebVitalsReportSchema>) {
  try {
    const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!
    const apiSecret = process.env.GA4_API_SECRET!
    
    const payload = {
      client_id: report.sessionId,
      user_id: report.userId,
      events: [{
        name: 'web_vitals',
        params: {
          metric_name: report.metric,
          metric_value: Math.round(report.value),
          metric_rating: report.rating,
          device_category: report.deviceType,
          connection_type: report.connectionType || 'unknown',
          page_location: report.url,
          custom_map: {
            metric_delta: report.delta,
            navigation_type: report.navigationType || 'unknown'
          }
        }
      }]
    }
    
    await fetch('https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
  } catch (error) {
    console.error('Failed to send WebVitals to GA4:', error)
  }
}

async function sendToNewRelic(report: z.infer<typeof WebVitalsReportSchema>) {
  try {
    const licenseKey = process.env.NEW_RELIC_LICENSE_KEY!
    const accountId = process.env.NEW_RELIC_ACCOUNT_ID!
    
    const payload = [{
      eventType: 'WebVitals',
      timestamp: report.timestamp,
      metric: report.metric,
      value: report.value,
      delta: report.delta,
      rating: report.rating,
      url: report.url,
      deviceType: report.deviceType,
      connectionType: report.connectionType || 'unknown',
      navigationType: report.navigationType || 'unknown',
      sessionId: report.sessionId,
      userId: report.userId
    }]
    
    await fetch('https://insights-collector.newrelic.com/v1/accounts/${accountId}/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Insert-Key': licenseKey
      },
      body: JSON.stringify(payload)
    })
  } catch (error) {
    console.error('Failed to send WebVitals to New Relic:`, error)
  }
}

async function sendToDataDog(report: z.infer<typeof WebVitalsReportSchema>) {
  try {
    const apiKey = process.env.DATADOG_API_KEY!
    
    const payload = {
      series: [{
        metric: `thorbis.webvitals.${report.metric.toLowerCase()}`,
        points: [[Math.floor(report.timestamp / 1000), report.value]],
        tags: [
          `rating:${report.rating}`,
          'device_type:${report.deviceType}',
          'connection_type:${report.connectionType || 'unknown'}',
          'navigation_type:${report.navigationType || 'unknown'}',
          'url_path:${new URL(report.url).pathname}'
        ],
        host: 'thorbis-app',
        type: 'gauge'
      }]
    }
    
    await fetch('https://api.datadoghq.com/api/v1/series', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'DD-API-KEY': apiKey
      },
      body: JSON.stringify(payload)
    })
  } catch (error) {
    console.error('Failed to send WebVitals to DataDog:', error)
  }
}

async function sendToCustomAnalytics(report: z.infer<typeof WebVitalsReportSchema>) {
  try {
    const endpoint = process.env.CUSTOM_ANALYTICS_ENDPOINT!
    const token = process.env.CUSTOM_ANALYTICS_TOKEN
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    
    if (token) {
      headers['Authorization'] = 'Bearer ${token}'
    }
    
    await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        type: 'web_vitals',
        data: report,
        environment: process.env.NODE_ENV,
        version: process.env.npm_package_version,
        timestamp: new Date(report.timestamp).toISOString()
      })
    })
  } catch (error) {
    console.error('Failed to send WebVitals to custom analytics:`, error)
  }
}

function checkPerformanceBudget(report: z.infer<typeof WebVitalsReportSchema>): string | null {
  // Define performance budgets
  const budgets = {
    CLS: { warning: 0.1, critical: 0.25 },
    FID: { warning: 100, critical: 300 },
    LCP: { warning: 2500, critical: 4000 },
    FCP: { warning: 1800, critical: 3000 },
    TTFB: { warning: 800, critical: 1800 },
    INP: { warning: 200, critical: 500 }
  }
  
  const budget = budgets[report.metric as keyof typeof budgets]
  if (!budget) return null
  
  if (report.value > budget.critical) {
    return `Critical performance budget violation: ${report.metric} = ${report.value} (budget: ${budget.critical})'
  }
  
  if (report.value > budget.warning) {
    return 'Performance budget warning: ${report.metric} = ${report.value} (budget: ${budget.warning})'
  }
  
  return null
}

async function alertPerformanceViolation(
  report: z.infer<typeof WebVitalsReportSchema>, 
  violation: string
) {
  console.warn('Performance Budget Violation:', {
    violation,
    metric: report.metric,
    value: report.value,
    rating: report.rating,
    url: report.url,
    deviceType: report.deviceType,
    timestamp: new Date(report.timestamp).toISOString()
  })
  
  // Send alerts to various channels
  const alertPromises: Promise<void>[] = []
  
  // Slack notification
  if (process.env.SLACK_PERFORMANCE_WEBHOOK) {
    alertPromises.push(sendSlackAlert(report, violation))
  }
  
  // Email notification
  if (process.env.ALERT_EMAIL) {
    alertPromises.push(sendEmailAlert(report, violation))
  }
  
  // PagerDuty for critical issues
  if (violation.includes('Critical') && process.env.PAGERDUTY_INTEGRATION_KEY) {
    alertPromises.push(sendPagerDutyAlert(report, violation))
  }
  
  await Promise.allSettled(alertPromises)
}

async function sendSlackAlert(
  report: z.infer<typeof WebVitalsReportSchema>, 
  violation: string
) {
  try {
    const webhook = process.env.SLACK_PERFORMANCE_WEBHOOK!
    const isCritical = violation.includes('Critical')
    
    const payload = {
      text: '${isCritical ? '🚨' : '⚠️'} Performance Alert: ${violation}',
      attachments: [{
        color: isCritical ? 'danger' : 'warning',
        title: 'WebVitals ${report.metric} Alert',
        fields: [
          { title: 'Metric', value: report.metric, short: true },
          { title: 'Value', value: '${report.value}${report.metric === 'CLS' ? ' : 'ms'}', short: true },
          { title: 'Rating', value: report.rating, short: true },
          { title: 'Device', value: report.deviceType, short: true },
          { title: 'URL', value: report.url, short: false },
          { title: 'Connection', value: report.connectionType || 'unknown', short: true },
          { title: 'Time', value: new Date(report.timestamp).toISOString(), short: true }
        ]
      }]
    }
    
    await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
  } catch (error) {
    console.error('Failed to send Slack alert:', error)
  }
}

async function sendEmailAlert(
  report: z.infer<typeof WebVitalsReportSchema>, 
  violation: string
) {
  // Email alert implementation would go here
  // This is a placeholder for email notification service integration
  console.log('Email alert would be sent:', { report, violation })
}

async function sendPagerDutyAlert(
  report: z.infer<typeof WebVitalsReportSchema>, 
  violation: string
) {
  try {
    const integrationKey = process.env.PAGERDUTY_INTEGRATION_KEY!
    
    const payload = {
      routing_key: integrationKey,
      event_action: 'trigger`,
      dedup_key: `webvitals-${report.metric}-${report.url}',
      payload: {
        summary: 'Critical WebVitals Performance Issue: ${report.metric}',
        source: 'thorbis-webvitals',
        severity: 'critical',
        custom_details: {
          metric: report.metric,
          value: report.value,
          rating: report.rating,
          url: report.url,
          deviceType: report.deviceType,
          violation
        }
      }
    }
    
    await fetch('https://events.pagerduty.com/v2/enqueue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
  } catch (error) {
    console.error('Failed to send PagerDuty alert:', error)
  }
}

async function storeInternalMetric(report: z.infer<typeof WebVitalsReportSchema>) {
  // Store metrics in database for internal analytics
  // This would typically use your database client (Supabase, etc.)
  
  /*
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )
  
  await supabase
    .from('web_vitals_metrics')
    .insert({
      metric_name: report.metric,
      metric_value: report.value,
      metric_delta: report.delta,
      metric_rating: report.rating,
      url: report.url,
      device_type: report.deviceType,
      connection_type: report.connectionType,
      navigation_type: report.navigationType,
      session_id: report.sessionId,
      user_id: report.userId,
      timestamp: new Date(report.timestamp).toISOString(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version
    })
  */
}

async function updateDashboardCache(report: z.infer<typeof WebVitalsReportSchema>) {
  // Update real-time dashboard cache (Redis, memory, etc.)
  // This enables real-time dashboard updates
  
  if (process.env.REDIS_URL) {
    try {
      // Example Redis integration
      /*
      const redis = await import('redis')
      const client = redis.createClient({ url: process.env.REDIS_URL })
      
      await client.connect()
      
      // Update latest metrics
      await client.hSet('webvitals:latest', report.metric, JSON.stringify({
        value: report.value,
        rating: report.rating,
        timestamp: report.timestamp
      }))
      
      // Update hourly aggregates
      const hourKey = 'webvitals:hourly:${new Date().toISOString().slice(0, 13)}'
      await client.lPush(hourKey, JSON.stringify(report))
      await client.expire(hourKey, 86400) // 24 hours
      
      await client.disconnect()
      */
    } catch (error) {
      console.error('Failed to update dashboard cache:', error)
    }
  }
}

export async function GET() {
  // Health check endpoint
  return NextResponse.json({ 
    status: 'ok', 
    service: 'web-vitals-tracking',
    timestamp: new Date().toISOString()
  })
}