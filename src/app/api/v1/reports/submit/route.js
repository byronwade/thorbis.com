import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const body = await request.json()
    const {
      businessId,
      category,
      title,
      description,
      priority,
      anonymous,
      attachments,
      reporterInfo
    } = body

    // Validate required fields
    if (!category || !title || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate unique report ID
    const reportId = 'RP-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}'

    // Prepare report data
    const reportData = {
      report_id: reportId,
      business_id: businessId,
      category,
      title,
      description,
      priority: priority || 'medium',
      status: 'pending',
      is_anonymous: anonymous || false,
      reporter_email: anonymous ? null : reporterInfo?.email,
      reporter_name: anonymous ? null : '${reporterInfo?.firstName} ${reporterInfo?.lastName}',
      reporter_ip: request.headers.get('x-forwarded-for') || 'unknown',
      metadata: {
        attachments: attachments || [],
        user_agent: request.headers.get('user-agent'),
        submitted_at: new Date().toISOString()
      }
    }

    // Insert report into database
    const { data: report, error: insertError } = await supabase
      .from('business_reports')
      .insert([reportData])
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting report:', insertError)
      return NextResponse.json(
        { error: 'Failed to submit report' },
        { status: 500 }
      )
    }

    // Create initial activity log
    await supabase
      .from('report_activities')
      .insert([{
        report_id: report.id,
        activity_type: 'report_submitted',
        description: 'Report submitted: ${title}',
        created_by: anonymous ? 'anonymous' : reporterInfo?.email || 'unknown',
        is_customer_visible: true,
        metadata: {
          category,
          priority,
          anonymous
        }
      }])

    // Auto-categorize and prioritize based on category
    let estimatedResponseTime = '24-48 hours'
    let autoStatus = 'pending'
    
    switch (category) {
      case 'fake_business':
      case 'legal_issue':
        estimatedResponseTime = '4-8 hours'
        autoStatus = 'urgent'
        break
      case 'false_information':
      case 'inappropriate_content':
      case 'privacy_concern':
        estimatedResponseTime = '8-12 hours'
        autoStatus = 'high_priority'
        break
      case 'verification_issue':
      case 'spam_abuse':
        estimatedResponseTime = '12-24 hours'
        break
      default:
        estimatedResponseTime = '24-48 hours'
    }

    // Update report with auto-categorization
    await supabase
      .from('business_reports')
      .update({
        status: autoStatus,
        estimated_response_time: estimatedResponseTime
      })
      .eq('id', report.id)

    // Send notification to moderation team for urgent reports
    if (autoStatus === 'urgent') {
      // In production, this would trigger an immediate notification
      console.log('URGENT REPORT ALERT: ${reportId} - ${title}')
    }

    // Prepare response
    const response = {
      success: true,
      report: {
        reportId,
        category,
        status: autoStatus,
        estimatedResponseTime,
        submittedAt: report.created_at
      },
      nextSteps: [
        'Your report has been received and assigned a unique ID',
        'Our moderation team will review the report within the estimated timeframe',
        'You\'ll receive email updates on the investigation progress',
        'We may contact the business for clarification if needed'
      ]
    }

    // Add anonymous-specific messaging
    if (anonymous) {
      response.nextSteps.push('Since this is an anonymous report, we cannot provide direct updates')
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error processing report submission:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}