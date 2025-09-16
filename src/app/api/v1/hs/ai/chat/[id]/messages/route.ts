import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Message schemas
const ChatMessageSchema = z.object({
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

const MessageQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('50'),
  message_type: z.enum(['user', 'ai', 'system', 'action']).optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  search: z.string().optional(),
  sort: z.enum(['created_at', 'message_type']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('asc'),
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

// Helper function to verify session access
async function verifySessionAccess(sessionId: string, organizationId: string) {
  const { data: session } = await supabase
    .from('hs.ai_chat_sessions')
    .select('id, session_status, context_data')
    .eq('id', sessionId)
    .eq('organization_id', organizationId)
    .single();
  
  return session;
}

// Helper function to analyze message intent
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

// Helper function to generate AI response
async function generateAIResponse(
  message: string, 
  intent: string, 
  entities: Record<string, unknown>, sessionContext: unknown,
  organizationId: string
): Promise<{ response: string; suggestedActions: string[]; requiresHandoff: boolean }> {
  
  let response = ';
  let suggestedActions: string[] = [];
  let requiresHandoff = false;

  // Get contextual data if available
  const contextData = sessionContext.context_data || {};
  
  switch (intent) {
    case 'schedule_appointment':
      if (contextData.customer_id) {
        response = "I can help you schedule an appointment. Let me check our available time slots for your area and the services you need.";
        suggestedActions = [
          'check_technician_availability',
          'show_available_slots',
          'create_appointment'
        ];
      } else {
        response = "I'd be happy to help you schedule an appointment. Could you please provide your contact information so I can check availability in your area?";
        requiresHandoff = true;
      }
      break;

    case 'emergency_support':
      response = "This sounds like an emergency situation. I'm immediately connecting you with our emergency dispatch team. Please ensure your safety first. If there's water damage, turn off the main water supply if it's safe to do so.";
      suggestedActions = [
        'escalate_to_emergency_dispatch',
        'send_emergency_instructions',
        'notify_on_call_technician',
        'create_emergency_work_order'
      ];
      requiresHandoff = true;
      
      // Auto-escalate emergency sessions
      await supabase
        .from('hs.ai_chat_sessions')
        .update({ 
          priority: 'urgent',
          session_status: 'escalated',
          escalation_reason: 'Emergency support request'
        })
        .eq('id', sessionContext.id);
      break;

    case 'service_inquiry':
      const serviceTypes = entities.service_types || [];
      if (serviceTypes.length > 0) {
        // Get pricing information from database
        const { data: services } = await supabase
          .from('hs.services')
          .select('name, description, base_price')
          .eq('organization_id', organizationId)
          .ilike('name`, `%${serviceTypes[0]}%')
          .limit(3);

        if (services && services.length > 0) {
          const serviceInfo = services.map(s => 
            '${s.name}: ${s.description} (Starting at $${s.base_price})'
          ).join('\n');
          
          response = 'Here are our ${serviceTypes[0]} services:\n\n${serviceInfo}\n\nWould you like to schedule a free estimate?';
          suggestedActions = [
            'show_service_details',
            'schedule_estimate',
            'provide_pricing_guide'
          ];
        } else {
          response = 'I can help you with ${serviceTypes.join(', ')} services. We provide comprehensive solutions with transparent, upfront pricing. Would you like to schedule a free consultation?';
          suggestedActions = [
            'show_all_services',
            'schedule_consultation',
            'connect_specialist'
          ];
        }
      } else {
        response = "I can help you learn about our home services. We specialize in plumbing, electrical, HVAC, and general maintenance. What specific service are you interested in?";
        suggestedActions = [
          'show_service_categories',
          'ask_for_specifics',
          'schedule_consultation'
        ];
      }
      break;

    case 'billing_inquiry':
      if (contextData.customer_id) {
        response = "I can help you with your billing question. Let me pull up your account information right now.";
        suggestedActions = [
          'lookup_customer_invoices',
          'show_payment_history',
          'explain_charges'
        ];
      } else {
        response = "I can help you with billing questions. To access your account information, I'll need to verify some details. Let me connect you with our billing department who can assist you securely.";
        requiresHandoff = true;
        suggestedActions = [
          'transfer_to_billing',
          'request_account_verification'
        ];
      }
      break;

    case 'status_update':
      if (contextData.work_order_id) {
        // Get work order status
        const { data: workOrder } = await supabase
          .from('hs.work_orders')
          .select('
            work_order_number,
            status,
            scheduled_date,
            technicians(first_name, last_name, phone)
          ')
          .eq('id', contextData.work_order_id)
          .single();

        if (workOrder) {
          const techName = workOrder.technicians ? 
            '${workOrder.technicians.first_name} ${workOrder.technicians.last_name}' : 
            'your assigned technician';
          
          response = 'Here's the status of work order #${workOrder.work_order_number}:\n\nStatus: ${workOrder.status}\nScheduled: ${new Date(workOrder.scheduled_date).toLocaleDateString()}\nTechnician: ${techName}';
          
          if (workOrder.status === 'dispatched' || workOrder.status === 'in_progress') {
            response += '\n\nYour technician should arrive within the scheduled window. You can contact them at ${workOrder.technicians?.phone || 'the number provided earlier'}.';
          }
          
          suggestedActions = [
            'provide_tracking_link',
            'show_technician_contact',
            'update_appointment'
          ];
        } else {
          response = "I'm having trouble finding the details for that work order. Let me connect you with our dispatch team for the most current information.";
          requiresHandoff = true;
        }
      } else {
        response = "I can help you check on your service appointment. Could you provide your work order number or the phone number associated with your account?";
        suggestedActions = [
          'request_work_order_number',
          'lookup_by_phone',
          'connect_dispatch'
        ];
      }
      break;

    default:
      response = "Hello! I'm here to help with any questions about our home services. I can assist with:\n\n• Scheduling appointments\n• Service information and pricing\n• Checking work order status\n• Billing questions\n• Emergency support\n\nHow can I help you today?";
      suggestedActions = [
        'show_service_menu',
        'schedule_appointment',
        'check_work_order_status',
        'connect_human_agent'
      ];
  }

  return { response, suggestedActions, requiresHandoff };
}

// Helper function to log message activity
async function logMessageActivity(
  sessionId: string,
  messageId: string,
  activityType: string,
  description: string, metadata: unknown,
  organizationId: string,
  userId?: string
) {
  await supabase
    .from('hs.chat_activity_log')
    .insert({
      session_id: sessionId,
      message_id: messageId,
      activity_type: activityType,
      activity_description: description,
      metadata,
      organization_id: organizationId,
      created_by: userId,
    });
}

// GET /api/v1/hs/ai/chat/[id]/messages - Get messages for a chat session
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id;
    const { searchParams } = new URL(request.url);
    const query = MessageQuerySchema.parse(Object.fromEntries(searchParams));

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

    // Verify session access
    const session = await verifySessionAccess(sessionId, organizationId);
    if (!session) {
      return NextResponse.json(
        { error: 'Chat session not found or access denied' },
        { status: 404 }
      );
    }

    // Build query
    let supabaseQuery = supabase
      .from('hs.ai_chat_messages')
      .select('
        *,
        created_by_user:created_by(
          first_name,
          last_name
        )
      ', { count: 'exact' })
      .eq('session_id', sessionId);

    // Apply filters
    if (query.message_type) {
      supabaseQuery = supabaseQuery.eq('message_type', query.message_type);
    }

    if (query.date_from) {
      supabaseQuery = supabaseQuery.gte('created_at', query.date_from);
    }

    if (query.date_to) {
      supabaseQuery = supabaseQuery.lte('created_at', query.date_to);
    }

    // Apply search
    if (query.search) {
      supabaseQuery = supabaseQuery.ilike('message_content', '%${query.search}%');
    }

    // Apply sorting and pagination
    const offset = (query.page - 1) * query.limit;
    supabaseQuery = supabaseQuery
      .order(query.sort, { ascending: query.order === 'asc' })
      .range(offset, offset + query.limit - 1);

    const { data: messages, error, count } = await supabaseQuery;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      );
    }

    const totalPages = Math.ceil((count || 0) / query.limit);

    return NextResponse.json({
      messages: messages || [],
      session_info: {
        id: session.id,
        status: session.session_status,
        context_type: session.context_type,
      },
      pagination: {
        page: query.page,
        limit: query.limit,
        total: count || 0,
        totalPages,
        hasMore: query.page < totalPages,
      },
    });

  } catch (error) {
    console.error('GET /api/v1/hs/ai/chat/[id]/messages error:', error);
    
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

// POST /api/v1/hs/ai/chat/[id]/messages - Send new message in chat session
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id;
    const body = await request.json();
    const messageData = ChatMessageSchema.parse(body);

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

    // Verify session access and get session context
    const session = await verifySessionAccess(sessionId, organizationId);
    if (!session) {
      return NextResponse.json(
        { error: 'Chat session not found or access denied' },
        { status: 404 }
      );
    }

    // Check if session is active
    if (session.session_status !== 'active') {
      return NextResponse.json(
        { error: 'Cannot send messages to inactive chat sessions' },
        { status: 409 }
      );
    }

    // Process user message and analyze intent
    const finalMessageData = { ...messageData };
    
    if (messageData.message_type === 'user') {
      const analysis = analyzeMessageIntent(messageData.message_content);
      finalMessageData.intent = analysis.intent;
      finalMessageData.entities = analysis.entities;
      finalMessageData.confidence_score = analysis.confidence;
    }

    // Save user message
    const { data: userMessage, error: messageError } = await supabase
      .from('hs.ai_chat_messages')
      .insert({
        ...finalMessageData,
        session_id: sessionId,
        organization_id: organizationId,
        created_by: user.id,
      })
      .select()
      .single();

    if (messageError) {
      console.error('Database error:', messageError);
      return NextResponse.json(
        { error: 'Failed to save message' },
        { status: 500 }
      );
    }

    // Generate AI response if this is a user message
    let aiMessage = null;
    if (messageData.message_type === 'user') {
      const aiResponse = await generateAIResponse(
        messageData.message_content,
        finalMessageData.intent!,
        finalMessageData.entities!,
        session,
        organizationId
      );

      // Save AI response
      const { data: aiMessageData, error: aiError } = await supabase
        .from('hs.ai_chat_messages')
        .insert({
          session_id: sessionId,
          message_content: aiResponse.response,
          message_type: 'ai',
          suggested_actions: aiResponse.suggestedActions,
          requires_human_handoff: aiResponse.requiresHandoff,
          organization_id: organizationId,
        })
        .select()
        .single();

      if (!aiError) {
        aiMessage = aiMessageData;
      }

      // Update session if handoff is required
      if (aiResponse.requiresHandoff) {
        await supabase
          .from('hs.ai_chat_sessions')
          .update({ 
            session_status: 'escalated',
            escalated_at: new Date().toISOString(),
            escalation_reason: 'AI determined human assistance required'
          })
          .eq('id', sessionId);

        // Log escalation
        await logMessageActivity(
          sessionId,
          userMessage.id,
          'escalated',
          'Session escalated due to AI analysis',
          {
            intent: finalMessageData.intent,
            confidence: finalMessageData.confidence_score,
            escalation_reason: 'AI determined human assistance required',
          },
          organizationId,
          user.id
        );
      }
    }

    // Update session's last activity
    await supabase
      .from('hs.ai_chat_sessions')
      .update({ 
        last_message_at: new Date().toISOString(),
        last_message_preview: messageData.message_content.substring(0, 200)
      })
      .eq('id', sessionId);

    // Log message activity
    await logMessageActivity(
      sessionId,
      userMessage.id,
      'message_sent',
      '${messageData.message_type} message sent',
      {
        message_length: messageData.message_content.length,
        has_attachments: messageData.attachments && messageData.attachments.length > 0,
        intent: finalMessageData.intent,
        confidence: finalMessageData.confidence_score,
      },
      organizationId,
      user.id
    );

    return NextResponse.json(
      { 
        user_message: userMessage,
        ai_response: aiMessage,
        session_escalated: finalMessageData.requires_human_handoff || false
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('POST /api/v1/hs/ai/chat/[id]/messages error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid message data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}