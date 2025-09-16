import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const PerformanceReportSchema = z.object({
  metric: z.string(),
  value: z.number(),
  url: z.string(),
  timestamp: z.number(),
  deviceType: z.enum(['mobile', 'tablet', 'desktop']),
  connectionType: z.string().optional(),
  sessionId: z.string().optional(),
  userId: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the performance report
    const validatedReport = PerformanceReportSchema.parse(body)
    
    // Log performance metric in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Performance Metric:', {
        ...validatedReport,
        timestamp: new Date(validatedReport.timestamp).toISOString(),
        threshold: getPerformanceThreshold(validatedReport.metric),
        status: getPerformanceStatus(validatedReport.metric, validatedReport.value)
      })
    }
    
    // In production, send to performance monitoring service
    if (process.env.NODE_ENV === 'production') {
      await logPerformanceToService(validatedReport)
    }
    
    // Check for performance budget violations
    const budgetViolation = checkPerformanceBudget(validatedReport.metric, validatedReport.value)
    if (budgetViolation) {
      await alertPerformanceIssue(validatedReport, budgetViolation)
    }
    
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Failed to process performance report:', error)
    
    return NextResponse.json(
      { error: 'Invalid performance report format' },
      { status: 400 }
    )
  }
}

async function logPerformanceToService(report: z.infer<typeof PerformanceReportSchema>) {
  // Integration with performance monitoring services
  
  // 1. Google Analytics 4 (GA4) with gtag
  if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
    try {
      // This would typically be handled client-side, but we can also send server-side events
      await sendGA4Event(report)
    } catch (gaError) {
      console.error('Failed to send performance data to GA4:', gaError)
    }
  }
  
  // 2. New Relic Browser
  if (process.env.NEW_RELIC_LICENSE_KEY) {
    try {
      await sendNewRelicMetric(report)
    } catch (nrError) {
      console.error('Failed to send performance data to New Relic:', nrError)
    }
  }
  
  // 3. DataDog RUM
  if (process.env.DATADOG_CLIENT_TOKEN) {
    try {
      await sendDataDogMetric(report)
    } catch (ddError) {
      console.error('Failed to send performance data to DataDog:', ddError)
    }
  }
  
  // 4. Custom analytics service
  if (process.env.CUSTOM_ANALYTICS_ENDPOINT) {
    try {
      await fetch(process.env.CUSTOM_ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${process.env.CUSTOM_ANALYTICS_TOKEN}'
        },
        body: JSON.stringify({
          ...report,
          environment: process.env.NODE_ENV,
          version: process.env.npm_package_version,
          timestamp: new Date(report.timestamp).toISOString()
        })
      })
    } catch (customError) {
      console.error('Failed to send performance data to custom service:', customError)
    }
  }
  
  // 5. Database logging for internal analytics
  if (process.env.DATABASE_URL) {
    try {
      await logPerformanceToDatabase(report)
    } catch (dbError) {
      console.error('Failed to log performance to database:`, dbError)
    }
  }
}

async function sendGA4Event(report: z.infer<typeof PerformanceReportSchema>) {
  // Send Core Web Vitals to GA4
  const eventName = `web_vitals_${report.metric.toLowerCase()}`
  
  // This would typically use gtag on the client side
  // For server-side, you'd use the Measurement Protocol
  if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
    const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
    const apiSecret = process.env.GA4_API_SECRET
    
    if (apiSecret) {
      await fetch('https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}', {
        method: 'POST',
        body: JSON.stringify({
          client_id: report.sessionId || 'anonymous',
          user_id: report.userId,
          events: [{
            name: eventName,
            params: {
              metric_name: report.metric,
              metric_value: report.value,
              device_type: report.deviceType,
              connection_type: report.connectionType,
              page_location: report.url
            }
          }]
        })
      })
    }
  }
}

async function sendNewRelicMetric(report: z.infer<typeof PerformanceReportSchema>) {
  // Send to New Relic via their API
  const apiKey = process.env.NEW_RELIC_LICENSE_KEY
  
  if (apiKey) {
    await fetch('https://insights-collector.newrelic.com/v1/accounts/YOUR_ACCOUNT_ID/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Insert-Key': apiKey
      },
      body: JSON.stringify([{
        eventType: 'WebVitals',
        metric: report.metric,
        value: report.value,
        url: report.url,
        deviceType: report.deviceType,
        connectionType: report.connectionType,
        timestamp: report.timestamp
      }])
    })
  }
}

async function sendDataDogMetric(report: z.infer<typeof PerformanceReportSchema>) {
  // Send to DataDog RUM API
  const apiKey = process.env.DATADOG_API_KEY
  
  if (apiKey) {
    await fetch('https://api.datadoghq.com/api/v1/series', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'DD-API-KEY`: apiKey
      },
      body: JSON.stringify({
        series: [{
          metric: `thorbis.webvitals.${report.metric.toLowerCase()}`,
          points: [[report.timestamp / 1000, report.value]],
          tags: [
            `device_type:${report.deviceType}`,
            `connection_type:${report.connectionType}',
            'url:${new URL(report.url).pathname}'
          ]
        }]
      })
    })
  }
}

async function logPerformanceToDatabase(report: z.infer<typeof PerformanceReportSchema>) {
  // Example: Using Supabase
  /*
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )
  
  await supabase
    .from('performance_metrics')
    .insert({
      metric: report.metric,
      value: report.value,
      url: report.url,
      timestamp: new Date(report.timestamp).toISOString(),
      device_type: report.deviceType,
      connection_type: report.connectionType,
      session_id: report.sessionId,
      user_id: report.userId,
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version
    })
  */
}

function getPerformanceThreshold(metric: string): number {
  const thresholds = {
    'CLS': 0.1,      // Cumulative Layout Shift
    'FID': 100,      // First Input Delay (ms)
    'FCP': 1800,     // First Contentful Paint (ms)
    'LCP': 2500,     // Largest Contentful Paint (ms)
    'TTFB': 600,     // Time to First Byte (ms)
    'INP': 200       // Interaction to Next Paint (ms)
  }
  
  return thresholds[metric as keyof typeof thresholds] || 0
}

function getPerformanceStatus(metric: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = getPerformanceThreshold(metric)
  
  if (metric === 'CLS') {
    if (value <= 0.1) return 'good'
    if (value <= 0.25) return 'needs-improvement'
    return 'poor'
  }
  
  if (metric === 'FID') {
    if (value <= 100) return 'good'
    if (value <= 300) return 'needs-improvement'
    return 'poor'
  }
  
  if (metric === 'LCP') {
    if (value <= 2500) return 'good'
    if (value <= 4000) return 'needs-improvement'
    return 'poor'
  }
  
  if (metric === 'FCP') {
    if (value <= 1800) return 'good'
    if (value <= 3000) return 'needs-improvement'
    return 'poor'
  }
  
  if (metric === 'TTFB') {
    if (value <= 600) return 'good'
    if (value <= 1500) return 'needs-improvement'
    return 'poor'
  }
  
  if (metric === 'INP') {
    if (value <= 200) return 'good'
    if (value <= 500) return 'needs-improvement'
    return 'poor'
  }
  
  return value <= threshold ? 'good' : 'poor'
}

function checkPerformanceBudget(metric: string, value: number): string | null {
  const status = getPerformanceStatus(metric, value)
  const threshold = getPerformanceThreshold(metric)
  
  if (status === 'poor') {
    return 'Performance budget violation: ${metric} = ${value} (threshold: ${threshold})'
  }
  
  return null
}

async function alertPerformanceIssue(report: z.infer<typeof PerformanceReportSchema>, violation: string) {
  console.warn('Performance Budget Violation:', {
    violation,
    metric: report.metric,
    value: report.value,
    url: report.url,
    deviceType: report.deviceType
  })
  
  // In production, you might want to send alerts via:
  // - Slack webhook
  // - Email notification
  // - PagerDuty
  // - Custom alerting service
  
  if (process.env.SLACK_WEBHOOK_URL) {
    try {
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: '🚨 Performance Alert: ${violation}',
          attachments: [{
            color: 'danger',
            fields: [
              { title: 'Metric', value: report.metric, short: true },
              { title: 'Value', value: report.value.toString(), short: true },
              { title: 'URL', value: report.url, short: false },
              { title: 'Device', value: report.deviceType, short: true },
              { title: 'Connection', value: report.connectionType || 'unknown', short: true }
            ]
          }]
        })
      })
    } catch (slackError) {
      console.error('Failed to send Slack alert:', slackError)
    }
  }
}

export async function GET() {
  // Health check endpoint
  return NextResponse.json({ status: 'ok', service: 'performance-monitoring' })
}