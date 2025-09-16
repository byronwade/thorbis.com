import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface SupportTicketData {
  firstName: string
  lastName: string
  email: string
  businessName?: string
  category: string
  subject: string
  message: string
  priority: 'low' | 'normal' | 'high' | 'critical'
  businessId?: string
}

interface TicketResponse {
  ticketId: string
  category: string
  priority: string
  estimatedResponseTime: string
  status: string
}

const RESPONSE_TIME_MAP = {
  verification: {
    low: '24-48 hours',
    normal: '8-12 hours', 
    high: '4-8 hours',
    critical: '1-4 hours'
  },
  technical: {
    low: '12-24 hours',
    normal: '4-8 hours',
    high: '2-4 hours', 
    critical: '30 minutes - 2 hours'
  },
  billing: {
    low: '8-24 hours',
    normal: '2-8 hours',
    high: '1-2 hours',
    critical: '30 minutes - 1 hour'
  },
  account: {
    low: '24-48 hours',
    normal: '8-12 hours',
    high: '4-8 hours',
    critical: '1-4 hours'
  },
  listing: {
    low: '24-72 hours',
    normal: '12-24 hours',
    high: '8-12 hours',
    critical: '4-8 hours'
  },
  general: {
    low: '48-72 hours',
    normal: '24-48 hours',
    high: '12-24 hours',
    critical: '8-12 hours'
  }
}

export async function POST(request: NextRequest) {
  try {
    const ticketData: SupportTicketData = await request.json()
    
    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'category', 'subject', 'message']
    const missingFields = requiredFields.filter(field => !ticketData[field as keyof SupportTicketData])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: 'Missing required fields: ${missingFields.join(', ')}' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(ticketData.email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      )
    }

    // Validate category
    const validCategories = ['verification', 'account', 'listing', 'technical', 'billing', 'general']
    if (!validCategories.includes(ticketData.category)) {
      return NextResponse.json(
        { error: 'Invalid support category' },
        { status: 400 }
      )
    }

    // Validate priority
    const validPriorities = ['low', 'normal', 'high', 'critical']
    if (!validPriorities.includes(ticketData.priority)) {
      return NextResponse.json(
        { error: 'Invalid priority level' },
        { status: 400 }
      )
    }

    // Generate ticket ID
    const ticketId = generateTicketId()

    // Get estimated response time
    const estimatedResponse = RESPONSE_TIME_MAP[ticketData.category as keyof typeof RESPONSE_TIME_MAP]?.[ticketData.priority] || '24-48 hours'

    // Determine initial status based on priority
    const initialStatus = ticketData.priority === 'critical' ? 'urgent' : 'open'

    // Check if business exists (if business ID or name provided)
    let businessRecord = null
    if (ticketData.businessId) {
      const { data: business } = await supabase
        .from('directory.business_submissions')
        .select('id, business_name, verification_score, trust_badges')
        .eq('id', ticketData.businessId)
        .single()
      
      businessRecord = business
    } else if (ticketData.businessName) {
      const { data: business } = await supabase
        .from('directory.business_submissions')
        .select('id, business_name, verification_score, trust_badges')
        .ilike('business_name', '%${ticketData.businessName}%')
        .limit(1)
        .single()
      
      businessRecord = business
    }

    // Create support ticket record
    const ticketRecord = {
      ticket_id: ticketId,
      first_name: ticketData.firstName,
      last_name: ticketData.lastName,
      email: ticketData.email,
      business_name: ticketData.businessName,
      business_id: businessRecord?.id || null,
      category: ticketData.category,
      subject: ticketData.subject,
      message: ticketData.message,
      priority: ticketData.priority,
      status: initialStatus,
      estimated_response_time: estimatedResponse,
      created_at: new Date().toISOString(),
      
      // Additional context if business exists
      business_context: businessRecord ? {
        business_id: businessRecord.id,
        business_name: businessRecord.business_name,
        verification_score: businessRecord.verification_score,
        trust_badges: businessRecord.trust_badges,
        has_verification: businessRecord.verification_score > 0
      } : null,
      
      // Auto-categorize based on content for better routing
      auto_tags: generateAutoTags(ticketData),
      
      // Set up notifications
      notification_preferences: {
        email_notifications: true,
        sms_notifications: ticketData.priority === 'critical'
      }
    }

    // Insert support ticket
    const { data: ticket, error: insertError } = await supabase
      .from('support_mgmt.support_tickets')
      .insert(ticketRecord)
      .select('*')
      .single()

    if (insertError) {
      console.error('Error creating support ticket:', insertError)
      return NextResponse.json(
        { error: 'Failed to create support ticket' },
        { status: 500 }
      )
    }

    // Create initial activity log entry
    await supabase
      .from('support_mgmt.ticket_activities')
      .insert({
        ticket_id: ticket.id,
        activity_type: 'ticket_created',
        description: 'Support ticket created by ${ticketData.firstName} ${ticketData.lastName}',
        created_by: 'system',
        metadata: {
          category: ticketData.category,
          priority: ticketData.priority,
          initial_status: initialStatus
        },
        created_at: new Date().toISOString()
      })

    // Send auto-response email (in production)
    // await sendAutoResponseEmail(ticketData.email, ticketId, estimatedResponse)

    // If critical priority, create alert for support team
    if (ticketData.priority === 'critical') {
      await createSupportAlert(ticket.id, ticketData.category, ticketData.subject)
    }

    // Queue for AI categorization and priority adjustment
    if (ticket) {
      await queueTicketForAIProcessing(ticket.id, ticketData.category, ticketData.message)
    }

    const response: TicketResponse = {
      ticketId: ticketId,
      category: ticketData.category,
      priority: ticketData.priority,
      estimatedResponseTime: estimatedResponse,
      status: initialStatus
    }

    return NextResponse.json({
      success: true,
      ticket: response,
      message: 'Support ticket created successfully',
      nextSteps: getNextSteps(ticketData.category, ticketData.priority)
    })

  } catch (error) {
    console.error('Error processing support ticket:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve ticket status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ticketId = searchParams.get('ticket_id')
    const email = searchParams.get('email')

    if (!ticketId && !email) {
      return NextResponse.json(
        { error: 'Either ticket ID or email is required' },
        { status: 400 }
      )
    }

    let query = supabase
      .from('support_mgmt.support_tickets')
      .select('
        ticket_id,
        first_name,
        last_name,
        email,
        business_name,
        category,
        subject,
        priority,
        status,
        estimated_response_time,
        created_at,
        updated_at,
        resolved_at
      ')

    if (ticketId) {
      query = query.eq('ticket_id', ticketId)
    } else {
      query = query.eq('email', email).order('created_at', { ascending: false }).limit(5)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'No support tickets found' },
        { status: 404 }
      )
    }

    // Get recent activities for each ticket
    const ticketsWithActivities = await Promise.all(
      data.map(async (ticket) => {
        const { data: activities } = await supabase
          .from('support_mgmt.ticket_activities')
          .select('activity_type, description, created_at, created_by')
          .eq('ticket_id', ticket.id)
          .order('created_at', { ascending: false })
          .limit(5)

        return {
          ...ticket,
          recent_activities: activities || []
        }
      })
    )

    return NextResponse.json({
      success: true,
      tickets: ticketId ? ticketsWithActivities[0] : ticketsWithActivities
    })

  } catch (error) {
    console.error('Error fetching support tickets:', error)
    return NextResponse.json(
      { error: 'Internal server error` },
      { status: 500 }
    )
  }
}

// Helper functions
function generateTicketId(): string {
  const timestamp = Date.now().toString(36)
  const randomStr = Math.random().toString(36).substr(2, 5)
  return `TH-${timestamp}-${randomStr}'.toUpperCase()
}

function generateAutoTags(ticketData: SupportTicketData): string[] {
  const tags: string[] = []
  
  const message = ticketData.message.toLowerCase()
  const subject = ticketData.subject.toLowerCase()
  const combined = '${subject} ${message}'

  // Auto-tag based on keywords
  if (combined.includes('verification') || combined.includes('verify')) tags.push('verification')
  if (combined.includes('password') || combined.includes('login')) tags.push('authentication')
  if (combined.includes('payment') || combined.includes('billing')) tags.push('billing')
  if (combined.includes('bug') || combined.includes('error') || combined.includes('broken')) tags.push('bug')
  if (combined.includes('slow') || combined.includes('performance')) tags.push('performance')
  if (combined.includes('feature') || combined.includes('request')) tags.push('feature_request')
  if (combined.includes('urgent') || combined.includes('asap') || combined.includes('immediately')) tags.push('urgent')
  
  // Business-specific tags
  if (ticketData.businessName) tags.push('has_business')
  if (ticketData.businessId) tags.push('verified_business')
  
  return tags
}

async function createSupportAlert(ticketId: number, category: string, subject: string) {
  try {
    await supabase
      .from('support_mgmt.support_alerts')
      .insert({
        ticket_id: ticketId,
        alert_type: 'critical_priority',
        alert_message: 'Critical support ticket in ${category}: ${subject}',
        severity: 'high',
        requires_immediate_attention: true,
        created_at: new Date().toISOString()
      })
  } catch (error) {
    console.error('Error creating support alert:', error)
  }
}

async function queueTicketForAIProcessing(ticketId: number, category: string, message: string) {
  try {
    await supabase
      .from('ai_mgmt.ai_processing_queue')
      .insert({
        business_id: null,
        job_type: 'support_ticket_analysis',
        status: 'queued',
        priority: 3,
        input_data: {
          ticket_id: ticketId,
          category: category,
          message: message,
          analysis_types: ['sentiment', 'priority_suggestion', 'auto_categorization', 'similar_tickets']
        },
        created_at: new Date().toISOString()
      })
  } catch (error) {
    console.error('Error queuing ticket for AI processing:', error)
  }
}

function getNextSteps(category: string, priority: string): string[] {
  const baseSteps = [
    'You will receive an email confirmation with your ticket details',
    'Our support team will review your request and respond within the estimated timeframe',
    'You can check your ticket status at any time by providing your ticket ID'
  ]

  const categorySteps: Record<string, string[]> = {
    verification: [
      ...baseSteps,
      'For verification issues, please have your business documents ready for review',
      'Check your email for any requests for additional documentation'
    ],
    technical: [
      ...baseSteps,
      'If possible, provide screenshots or error messages to help our technical team',
      'Our technical team may request additional information to reproduce the issue'
    ],
    billing: [
      ...baseSteps,
      'For billing inquiries, have your account information and payment details ready',
      'Billing issues are typically resolved quickly during business hours'
    ],
    critical: [
      'Your ticket has been marked as critical and escalated to our priority support queue',
      'You should receive an initial response within 30 minutes to 2 hours',
      'A dedicated support specialist will be assigned to your case',
      ...baseSteps
    ]
  }

  if (priority === 'critical') {
    return categorySteps.critical
  }

  return categorySteps[category] || baseSteps
}