import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Chat session schemas
const ChatSessionSchema = z.object({
  session_name: z.string().min(1).max(255).optional(),
  context_type: z.enum(['customer_service', 'technical_support', 'sales', 'general', 'emergency']).default('general'),
  context_data: z.object({
    customer_id: z.string().uuid().optional(),
    work_order_id: z.string().uuid().optional(),
    technician_id: z.string().uuid().optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    department: z.string().optional(),
  }).optional(),
  initial_message: z.string().min(1).optional(),
  session_metadata: z.object({
    user_agent: z.string().optional(),
    ip_address: z.string().optional(),
    referrer: z.string().optional(),
    source: z.enum(['web', 'mobile', 'api', 'widget']).optional(),
  }).optional(),
});

const ChatMessageSchema = z.object({
  session_id: z.string().uuid(),
  message_content: z.string().min(1),
  message_type: z.enum(['user', 'ai', 'system', 'action']).default('user'),
  
  // Message metadata
  attachments: z.array(z.object({
    file_name: z.string(),
    file_url: z.string().url(),
    file_type: z.string(),
    file_size: z.number(),
  })).optional(),
  
  // Context for AI processing
  intent: z.string().optional(),
  entities: z.record(z.any()).optional(),
  confidence_score: z.number().min(0).max(1).optional(),
  
  // Follow-up actions
  requires_human_handoff: z.boolean().optional(),
  suggested_actions: z.array(z.string()).optional(),
  escalation_reason: z.string().optional(),
});

const ChatQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
  search: z.string().optional(),
  context_type: z.enum(['customer_service', 'technical_support', 'sales', 'general', 'emergency']).optional(),
  status: z.enum(['active', 'resolved', 'escalated', 'abandoned']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  date_from: z.string().date().optional(),
  date_to: z.string().date().optional(),
  customer_id: z.string().uuid().optional(),
  technician_id: z.string().uuid().optional(),
  assigned_to: z.string().uuid().optional(),
  sort: z.enum(['created_at', 'updated_at', 'priority', 'status']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

// Helper function to get user's organization
async function getUserOrganization(userId: string) {
  const { data: membership } = await supabase
    .from('user_mgmt.organization_memberships')
    .select('organization_id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();
  
  return membership?.organization_id;
}

// Helper function to analyze message intent using simple pattern matching
function analyzeMessageIntent(message: string): { intent: string; confidence: number; entities: Record<string, unknown> } {
  const lowerMessage = message.toLowerCase();
  
  // Define intent patterns
  const intentPatterns = {
    schedule_appointment: [
      /schedule.*appointment/i,
      /book.*service/i,
      /when.*available/i,
      /need.*appointment/i
    ],
    service_inquiry: [
      /what.*service/i,
      /do you.*fix/i,
      /repair.*cost/i,
      /estimate.*price/i
    ],
    emergency_support: [
      /emergency/i,
      /urgent/i,
      /asap/i,
      /immediate/i,
      /broken.*pipe/i,
      /no.*water/i,
      /flooding/i
    ],
    billing_inquiry: [
      /invoice/i,
      /bill/i,
      /payment/i,
      /charge/i,
      /refund/i
    ],
    status_update: [
      /where.*technician/i,
      /when.*arrive/i,
      /status.*order/i,
      /update.*work/i
    ],
    general_inquiry: [
      /hello/i,
      /hi/i,
      /help/i,
      /question/i,
      /info/i
    ]
  };

  // Find matching intent
  let bestIntent = 'general_inquiry';
  let bestConfidence = 0.3;

  for (const [intent, patterns] of Object.entries(intentPatterns)) {
    for (const pattern of patterns) {
      if (pattern.test(lowerMessage)) {
        bestIntent = intent;
        bestConfidence = 0.8;
        break;
      }
    }
    if (bestConfidence > 0.7) break;
  }

  // Extract entities (simplified)
  const entities: Record<string, unknown> = {};
  
  // Time entities
  const timeMatches = message.match(/\b(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d+\s*(am|pm))\b/gi);
  if (timeMatches) {
    entities.time_references = timeMatches;
  }

  // Service entities
  const serviceMatches = message.match(/\b(plumbing|electrical|hvac|heating|cooling|water|drain|pipe|toilet|faucet|sink)\b/gi);
  if (serviceMatches) {
    entities.service_types = serviceMatches;
  }

  // Urgency entities
  const urgencyMatches = message.match(/\b(emergency|urgent|asap|immediate|critical)\b/gi);
  if (urgencyMatches) {
    entities.urgency_indicators = urgencyMatches;
    bestConfidence = Math.max(bestConfidence, 0.9);
  }

  return {
    intent: bestIntent,
    confidence: bestConfidence,
    entities
  };
}

// Helper function to generate AI response based on intent
async function generateAIResponse(
  message: string, 
  intent: string, 
  entities: Record<string, unknown>, contextData: unknown,
  organizationId: string
): Promise<{ response: string; suggestedActions: string[]; requiresHandoff: boolean }> {
  
  let response = ';
  let suggestedActions: string[] = [];
  let requiresHandoff = false;

  switch (intent) {
    case 'schedule_appointment':
      response = "I'd be happy to help you schedule an appointment. Let me check our availability and connect you with the right team member for your needs.";
      suggestedActions = [
        'check_technician_availability',
        'create_appointment_slot',
        'send_confirmation'
      ];
      requiresHandoff = true;
      break;

    case 'emergency_support':
      response = "I understand this is an emergency situation. Let me immediately connect you with our emergency dispatch team. In the meantime, please ensure your safety and turn off the main water valve if there's flooding.";
      suggestedActions = [
        'escalate_to_emergency_dispatch',
        'send_emergency_instructions',
        'notify_on_call_technician'
      ];
      requiresHandoff = true;
      break;

    case 'service_inquiry':
      // Get service information from database
      const serviceTypes = entities.service_types || [];
      if (serviceTypes.length > 0) {
        response = 'I can help you with ${serviceTypes.join(', ')} services. Our team provides comprehensive solutions with upfront pricing. Would you like me to schedule a free estimate?';
      } else {
        response = "I can help you learn about our home service offerings. We provide plumbing, electrical, HVAC, and general maintenance services. What specific service are you interested in?";
      }
      suggestedActions = [
        'provide_service_details',
        'offer_free_estimate',
        'share_pricing_guide'
      ];
      break;

    case 'billing_inquiry':
      response = "I can help you with billing questions. Let me pull up your account information. For immediate assistance with payments or billing disputes, I can connect you with our billing department.";
      suggestedActions = [
        'lookup_customer_account',
        'show_recent_invoices',
        'connect_billing_dept'
      ];
      requiresHandoff = contextData?.customer_id ? false : true;
      break;

    case 'status_update':
      if (contextData?.work_order_id) {
        response = "Let me check the status of your service appointment right now.";
        suggestedActions = [
          'lookup_work_order_status',
          'provide_technician_eta',
          'send_tracking_link'
        ];
      } else {
        response = "I can help you track your service appointment. Could you please provide your work order number or the phone number associated with your account?";
        requiresHandoff = true;
      }
      break;

    default:
      response = "Hello! I'm here to help with any questions about our home services. I can help you schedule appointments, check service status, or connect you with the right team member. How can I assist you today?";
      suggestedActions = [
        'show_service_menu',
        'offer_appointment_booking',
        'connect_human_agent'
      ];
  }

  return { response, suggestedActions, requiresHandoff };
}

// Helper function to log chat activity
async function logChatActivity(
  sessionId: string,
  activityType: string,
  description: string, metadata: unknown,
  organizationId: string,
  userId?: string
) {
  await supabase
    .from('hs.chat_activity_log')
    .insert({
      session_id: sessionId,
      activity_type: activityType,
      activity_description: description,
      metadata,
      organization_id: organizationId,
      created_by: userId,
    });
}

// GET /api/v1/hs/ai/chat - List chat sessions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = ChatQuerySchema.parse(Object.fromEntries(searchParams));

    // Get authenticated user
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    // Get user's organization
    const organizationId = await getUserOrganization(user.id);
    if (!organizationId) {
      return NextResponse.json(
        { error: 'User not associated with any organization' },
        { status: 403 }
      );
    }

    // Build query
    let supabaseQuery = supabase
      .from('hs.ai_chat_sessions')
      .select('
        *,
        messages_count:ai_chat_messages(count),
        last_message:ai_chat_messages(
          message_content,
          created_at,
          message_type
        ),
        customer:context_data->customer_id(
          first_name,
          last_name,
          company_name
        ),
        assigned_agent:assigned_to(
          first_name,
          last_name
        )
      ', { count: 'exact' })
      .eq('organization_id', organizationId)
      .order('last_message.created_at', { ascending: false });

    // Apply filters
    if (query.context_type) {
      supabaseQuery = supabaseQuery.eq('context_type', query.context_type);
    }
    
    if (query.status) {
      supabaseQuery = supabaseQuery.eq('session_status', query.status);
    }

    if (query.priority) {
      supabaseQuery = supabaseQuery.eq('priority', query.priority);
    }

    if (query.customer_id) {
      supabaseQuery = supabaseQuery.eq('context_data->>customer_id', query.customer_id);
    }

    if (query.assigned_to) {
      supabaseQuery = supabaseQuery.eq('assigned_to', query.assigned_to);
    }

    if (query.date_from) {
      supabaseQuery = supabaseQuery.gte('created_at', query.date_from);
    }

    if (query.date_to) {
      supabaseQuery = supabaseQuery.lte('created_at', query.date_to);
    }

    // Apply search
    if (query.search) {
      supabaseQuery = supabaseQuery.or(
        'session_name.ilike.%${query.search}%,last_message_preview.ilike.%${query.search}%'
      );
    }

    // Apply pagination
    const offset = (query.page - 1) * query.limit;
    supabaseQuery = supabaseQuery
      .range(offset, offset + query.limit - 1);

    const { data: sessions, error, count } = await supabaseQuery;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch chat sessions' },
        { status: 500 }
      );
    }

    const totalPages = Math.ceil((count || 0) / query.limit);

    // Calculate summary statistics
    const { data: stats } = await supabase
      .from('hs.ai_chat_sessions')
      .select('session_status, context_type, priority')
      .eq('organization_id', organizationId);

    const summary = {
      total_sessions: count || 0,
      active_sessions: stats?.filter(s => s.session_status === 'active').length || 0,
      resolved_sessions: stats?.filter(s => s.session_status === 'resolved').length || 0,
      escalated_sessions: stats?.filter(s => s.session_status === 'escalated').length || 0,
      emergency_sessions: stats?.filter(s => s.priority === 'urgent').length || 0,
      by_context: {
        customer_service: stats?.filter(s => s.context_type === 'customer_service').length || 0,
        technical_support: stats?.filter(s => s.context_type === 'technical_support').length || 0,
        sales: stats?.filter(s => s.context_type === 'sales').length || 0,
        emergency: stats?.filter(s => s.context_type === 'emergency').length || 0,
      }
    };

    return NextResponse.json({
      sessions: sessions || [],
      summary,
      pagination: {
        page: query.page,
        limit: query.limit,
        total: count || 0,
        totalPages,
        hasMore: query.page < totalPages,
      },
    });

  } catch (error) {
    console.error('GET /api/v1/hs/ai/chat error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/v1/hs/ai/chat - Create new chat session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const sessionData = ChatSessionSchema.parse(body);

    // Get authenticated user
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    // Get user's organization
    const organizationId = await getUserOrganization(user.id);
    if (!organizationId) {
      return NextResponse.json(
        { error: 'User not associated with any organization' },
        { status: 403 }
      );
    }

    // Determine priority based on context
    let priority = 'medium';
    if (sessionData.context_type === 'emergency') {
      priority = 'urgent';
    } else if (sessionData.context_type === 'technical_support') {
      priority = 'high';
    } else if (sessionData.context_type === 'sales') {
      priority = 'low';
    }

    // Create chat session
    const { data: session, error } = await supabase
      .from('hs.ai_chat_sessions')
      .insert({
        session_name: sessionData.session_name || 
          '${sessionData.context_type} - ${new Date().toLocaleDateString()}',
        context_type: sessionData.context_type,
        context_data: sessionData.context_data || {},
        priority,
        session_status: 'active',
        organization_id: organizationId,
        created_by: user.id,
        session_metadata: sessionData.session_metadata || {},
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create chat session' },
        { status: 500 }
      );
    }

    // If there's an initial message, process it
    if (sessionData.initial_message) {
      const messageAnalysis = analyzeMessageIntent(sessionData.initial_message);
      const aiResponse = await generateAIResponse(
        sessionData.initial_message,
        messageAnalysis.intent,
        messageAnalysis.entities,
        sessionData.context_data,
        organizationId
      );

      // Save initial user message
      await supabase
        .from('hs.ai_chat_messages')
        .insert({
          session_id: session.id,
          message_content: sessionData.initial_message,
          message_type: 'user',
          intent: messageAnalysis.intent,
          entities: messageAnalysis.entities,
          confidence_score: messageAnalysis.confidence,
          organization_id: organizationId,
          created_by: user.id,
        });

      // Save AI response
      await supabase
        .from('hs.ai_chat_messages')
        .insert({
          session_id: session.id,
          message_content: aiResponse.response,
          message_type: 'ai',
          suggested_actions: aiResponse.suggestedActions,
          requires_human_handoff: aiResponse.requiresHandoff,
          organization_id: organizationId,
        });

      // Update session if handoff is required
      if (aiResponse.requiresHandoff) {
        await supabase
          .from('hs.ai_chat_sessions')
          .update({ 
            session_status: 'escalated',
            escalated_at: new Date().toISOString(),
            escalation_reason: 'AI determined human assistance required'
          })
          .eq('id', session.id);

        session.session_status = 'escalated';
      }

      // Log activity
      await logChatActivity(
        session.id,
        'session_created',
        'New chat session created with initial message',
        {
          intent: messageAnalysis.intent,
          confidence: messageAnalysis.confidence,
          requires_handoff: aiResponse.requiresHandoff,
        },
        organizationId,
        user.id
      );
    }

    return NextResponse.json(
      { 
        session,
        message: 'Chat session created successfully'
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('POST /api/v1/hs/ai/chat error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid chat session data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}