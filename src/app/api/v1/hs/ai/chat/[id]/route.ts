import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Session update schema
const SessionUpdateSchema = z.object({
  session_name: z.string().min(1).max(255).optional(),
  session_status: z.enum(['active', 'resolved', 'escalated', 'abandoned']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  assigned_to: z.string().uuid().optional(),
  context_data: z.record(z.any()).optional(),
  resolution_summary: z.string().optional(),
  escalation_reason: z.string().optional(),
  tags: z.array(z.string()).optional(),
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
    .select('id')
    .eq('id', sessionId)
    .eq('organization_id', organizationId)
    .single();
  
  return !!session;
}

// Helper function to log session activity
async function logSessionActivity(
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

// GET /api/v1/hs/ai/chat/[id] - Get specific chat session with messages
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id;
    const { searchParams } = new URL(request.url);
    const includeMessages = searchParams.get('include_messages') !== 'false';
    const messageLimit = parseInt(searchParams.get('message_limit') || '50');

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
    if (!(await verifySessionAccess(sessionId, organizationId))) {
      return NextResponse.json(
        { error: 'Chat session not found or access denied' },
        { status: 404 }
      );
    }

    // Get session with related data
    const { data: session, error } = await supabase
      .from('hs.ai_chat_sessions')
      .select('
        *,
        customer:context_data->customer_id(
          id,
          first_name,
          last_name,
          company_name,
          email,
          phone
        ),
        work_order:context_data->work_order_id(
          id,
          work_order_number,
          status,
          service_type
        ),
        assigned_agent:assigned_to(
          id,
          first_name,
          last_name,
          email
        ),
        created_by_user:created_by(
          first_name,
          last_name
        )
      ')
      .eq('id', sessionId)
      .eq('organization_id', organizationId)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch chat session' },
        { status: 500 }
      );
    }

    let messages = [];
    if (includeMessages) {
      // Get chat messages
      const { data: chatMessages } = await supabase
        .from('hs.ai_chat_messages')
        .select('
          *,
          created_by_user:created_by(
            first_name,
            last_name
          )
        ')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })
        .limit(messageLimit);

      messages = chatMessages || [];
    }

    // Get session activity log
    const { data: activities } = await supabase
      .from('hs.chat_activity_log')
      .select('
        *,
        created_by_user:created_by(
          first_name,
          last_name
        )
      ')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(20);

    // Calculate session metrics
    const sessionMetrics = {
      total_messages: messages.length,
      user_messages: messages.filter(m => m.message_type === 'user').length,
      ai_messages: messages.filter(m => m.message_type === 'ai').length,
      avg_response_time: 0, // Would calculate based on timestamps
      session_duration: session.resolved_at ? 
        new Date(session.resolved_at).getTime() - new Date(session.created_at).getTime() : 
        Date.now() - new Date(session.created_at).getTime(),
      handoff_occurred: session.session_status === 'escalated',
    };

    return NextResponse.json({
      session,
      messages: includeMessages ? messages : undefined,
      activities: activities || [],
      metrics: sessionMetrics,
    });

  } catch (error) {
    console.error('GET /api/v1/hs/ai/chat/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/v1/hs/ai/chat/[id] - Update chat session
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id;
    const body = await request.json();
    const updateData = SessionUpdateSchema.parse(body);

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

    // Get current session data
    const { data: currentSession } = await supabase
      .from('hs.ai_chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('organization_id', organizationId)
      .single();

    if (!currentSession) {
      return NextResponse.json(
        { error: 'Chat session not found or access denied' },
        { status: 404 }
      );
    }

    // Validate assigned agent exists
    if (updateData.assigned_to) {
      const { data: agent } = await supabase
        .from('user_mgmt.users')
        .select('id, first_name, last_name')
        .eq('id', updateData.assigned_to)
        .single();

      if (!agent) {
        return NextResponse.json(
          { error: 'Assigned agent not found' },
          { status: 400 }
        );
      }
    }

    // Prepare update data with timestamps
    const finalUpdateData: unknown = { ...updateData };

    if (updateData.session_status === 'resolved' && currentSession.session_status !== 'resolved') {
      finalUpdateData.resolved_at = new Date().toISOString();
    }

    if (updateData.session_status === 'escalated' && currentSession.session_status !== 'escalated') {
      finalUpdateData.escalated_at = new Date().toISOString();
    }

    if (updateData.assigned_to && updateData.assigned_to !== currentSession.assigned_to) {
      finalUpdateData.assigned_at = new Date().toISOString();
    }

    // Update session
    const { data: session, error } = await supabase
      .from('hs.ai_chat_sessions')
      .update({
        ...finalUpdateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .eq('organization_id', organizationId)
      .select('
        *,
        assigned_agent:assigned_to(
          first_name,
          last_name,
          email
        )
      ')
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update chat session' },
        { status: 500 }
      );
    }

    // Log changes
    const changes = [];
    for (const [key, value] of Object.entries(updateData)) {
      if (currentSession[key] !== value) {
        changes.push({
          field: key,
          old_value: currentSession[key],
          new_value: value,
        });
      }
    }

    if (changes.length > 0) {
      await logSessionActivity(
        sessionId,
        'session_updated',
        'Chat session was updated',
        { changes },
        organizationId,
        user.id
      );
    }

    // Log specific status changes
    if (updateData.session_status && updateData.session_status !== currentSession.session_status) {
      await logSessionActivity(
        sessionId,
        'status_change`,
        `Session status changed from ${currentSession.session_status} to ${updateData.session_status}',
        {
          old_status: currentSession.session_status,
          new_status: updateData.session_status,
          resolution_summary: updateData.resolution_summary,
          escalation_reason: updateData.escalation_reason,
        },
        organizationId,
        user.id
      );
    }

    // Log assignment changes
    if (updateData.assigned_to && updateData.assigned_to !== currentSession.assigned_to) {
      const agentName = session.assigned_agent ? 
        '${session.assigned_agent.first_name} ${session.assigned_agent.last_name}' : 
        'Unknown';
      
      await logSessionActivity(
        sessionId,
        'assigned',
        'Session assigned to ${agentName}',
        {
          agent_id: updateData.assigned_to,
          previous_agent_id: currentSession.assigned_to,
        },
        organizationId,
        user.id
      );
    }

    return NextResponse.json({ session });

  } catch (error) {
    console.error('PUT /api/v1/hs/ai/chat/[id] error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid session data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/hs/ai/chat/[id] - Archive chat session
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id;

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
    if (!(await verifySessionAccess(sessionId, organizationId))) {
      return NextResponse.json(
        { error: 'Chat session not found or access denied' },
        { status: 404 }
      );
    }

    // Check if session is active - prevent deletion of active sessions
    const { data: sessionCheck } = await supabase
      .from('hs.ai_chat_sessions')
      .select('session_status')
      .eq('id', sessionId)
      .single();

    if (sessionCheck?.session_status === 'active') {
      return NextResponse.json(
        { error: 'Cannot delete active chat sessions. Please resolve or abandon first.' },
        { status: 409 }
      );
    }

    // Archive session (soft delete)
    const { data: session, error } = await supabase
      .from('hs.ai_chat_sessions')
      .update({
        session_status: 'archived',
        archived_at: new Date().toISOString(),
        archived_by: user.id,
      })
      .eq('id', sessionId)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to archive chat session' },
        { status: 500 }
      );
    }

    // Log archival
    await logSessionActivity(
      sessionId,
      'archived',
      'Chat session was archived',
      { archived_by: user.id },
      organizationId,
      user.id
    );

    return NextResponse.json({ 
      message: 'Chat session archived successfully',
      session 
    });

  } catch (error) {
    console.error('DELETE /api/v1/hs/ai/chat/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}