import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const ErrorReportSchema = z.object({
  message: z.string(),
  stack: z.string().optional(),
  timestamp: z.number(),
  url: z.string(),
  userAgent: z.string(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  errorType: z.enum(['javascript', 'react', 'network', 'custom']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  context: z.record(z.any()).optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the error report
    const validatedReport = ErrorReportSchema.parse(body)
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Report:', {
        ...validatedReport,
        timestamp: new Date(validatedReport.timestamp).toISOString()
      })
    }
    
    // In production, you would typically send this to an error tracking service
    // like Sentry, LogRocket, Bugsnag, or your own logging infrastructure
    if (process.env.NODE_ENV === 'production') {
      await logErrorToService(validatedReport)
    }
    
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Failed to process error report:', error)
    
    return NextResponse.json(
      { error: 'Invalid error report format' },
      { status: 400 }
    )
  }
}

async function logErrorToService(report: z.infer<typeof ErrorReportSchema>) {
  // This is where you would integrate with your preferred error tracking service
  
  // Example integrations:
  
  // 1. Sentry (recommended for production)
  if (process.env.SENTRY_DSN) {
    try {
      // Dynamic import to avoid bundling Sentry if not configured
      const Sentry = await import('@sentry/nextjs')
      
      Sentry.captureException(new Error(report.message), {
        user: { id: report.userId },
        extra: {
          sessionId: report.sessionId,
          errorType: report.errorType,
          originalStack: report.stack,
          context: report.context,
          url: report.url,
          userAgent: report.userAgent
        },
        level: mapSeverityToSentryLevel(report.severity),
        tags: {
          errorType: report.errorType,
          severity: report.severity
        }
      })
    } catch (sentryError) {
      console.error('Failed to send error to Sentry:', sentryError)
    }
  }
  
  // 2. Custom logging service
  if (process.env.CUSTOM_ERROR_ENDPOINT) {
    try {
      await fetch(process.env.CUSTOM_ERROR_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${process.env.CUSTOM_ERROR_TOKEN}'
        },
        body: JSON.stringify({
          ...report,
          environment: process.env.NODE_ENV,
          version: process.env.npm_package_version,
          timestamp: new Date(report.timestamp).toISOString()
        })
      })
    } catch (customError) {
      console.error('Failed to send error to custom service:', customError)
    }
  }
  
  // 3. Database logging (for internal analytics)
  if (process.env.DATABASE_URL) {
    try {
      await logErrorToDatabase(report)
    } catch (dbError) {
      console.error('Failed to log error to database:', dbError)
    }
  }
  
  // 4. File-based logging (fallback)
  await logErrorToFile(report)
}

function mapSeverityToSentryLevel(severity: string): 'fatal' | 'error' | 'warning' | 'info' {
  switch (severity) {
    case 'critical':
      return 'fatal'
    case 'high':
      return 'error'
    case 'medium':
      return 'warning'
    case 'low':
      return 'info'
    default:
      return 'error'
  }
}

async function logErrorToDatabase(report: z.infer<typeof ErrorReportSchema>) {
  // Example: Using a hypothetical database client
  // You would replace this with your actual database implementation
  
  /*
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )
  
  await supabase
    .from('error_logs')
    .insert({
      message: report.message,
      stack: report.stack,
      timestamp: new Date(report.timestamp).toISOString(),
      url: report.url,
      user_agent: report.userAgent,
      user_id: report.userId,
      session_id: report.sessionId,
      error_type: report.errorType,
      severity: report.severity,
      context: report.context,
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version
    })
  */
}

async function logErrorToFile(report: z.infer<typeof ErrorReportSchema>) {
  // File-based logging for development or as a fallback
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
    const fs = await import('fs/promises')
    const path = await import('path')
    
    try {
      const logDir = path.join(process.cwd(), 'logs')
      await fs.mkdir(logDir, { recursive: true })
      
      const logFile = path.join(logDir, 'errors-${new Date().toISOString().split('T')[0]}.json')
      const logEntry = {
        ...report,
        timestamp: new Date(report.timestamp).toISOString(),
        environment: process.env.NODE_ENV,
        version: process.env.npm_package_version
      }
      
      await fs.appendFile(logFile, JSON.stringify(logEntry) + '
')
    } catch (fileError) {
      console.error('Failed to write error to file:', fileError)
    }
  }
}

export async function GET() {
  // Health check endpoint
  return NextResponse.json({ status: 'ok', service: 'error-monitoring' })
}