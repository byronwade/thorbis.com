import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Reply schema for handling inbound communications
const ReplySchema = z.object({
  reply_message: z.string().min(1),
  reply_type: z.enum(['email', 'sms', 'call', 'whatsapp', 'in_app']),
  reply_from: z.string().optional(), // Email or phone number
  reply_to: z.string().optional(), // Reply destination if different from original
  attachments: z.array(z.object({
    file_name: z.string(),
    file_url: z.string().url(),
    file_size: z.number().optional(),
    mime_type: z.string().optional(),
  })).optional(),
  internal_notes: z.string().optional(),
  is_internal_note: z.boolean().default(false), // True if this is just an internal note, not a sent reply
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

// Helper function to verify communication access
async function verifyCommunicationAccess(communicationId: string, organizationId: string) {
  const { data: communication } = await supabase
    .from('hs.communications')
    .select('id, communication_type, direction, customer_id, technician_id, contact_email, contact_phone')
    .eq('id', communicationId)
    .eq('organization_id', organizationId)
    .single();
  
  return communication;
}

// POST /api/v1/hs/communications/[id]/reply - Create reply to communication
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const communicationId = params.id;
    const body = await request.json();
    const replyData = ReplySchema.parse(body);

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

    // Verify communication access and get original communication details
    const originalCommunication = await verifyCommunicationAccess(communicationId, organizationId);
    if (!originalCommunication) {
      return NextResponse.json(
        { error: 'Communication not found or access denied' },
        { status: 404 }
      );
    }

    // Validate reply type matches original communication type
    if (replyData.reply_type !== originalCommunication.communication_type) {
      return NextResponse.json(
        { error: 'Reply type ${replyData.reply_type} does not match original communication type ${originalCommunication.communication_type}' },
        { status: 400 }
      );
    }

    // Create reply record
    const { data: reply, error: replyError } = await supabase
      .from('hs.communication_replies')
      .insert({
        communication_id: communicationId,
        reply_message: replyData.reply_message,
        reply_type: replyData.reply_type,
        reply_from: replyData.reply_from,
        reply_to: replyData.reply_to,
        attachments: replyData.attachments,
        internal_notes: replyData.internal_notes,
        is_internal_note: replyData.is_internal_note,
        organization_id: organizationId,
        created_by: user.id,
      })
      .select('
        *,
        created_by_user:created_by(
          first_name,
          last_name,
          email
        )
      ')
      .single();

    if (replyError) {
      console.error('Database error creating reply:', replyError);
      return NextResponse.json(
        { error: 'Failed to create reply' },
        { status: 500 }
      );
    }

    // If this is not an internal note, update the original communication status
    if (!replyData.is_internal_note) {
      const { error: updateError } = await supabase
        .from('hs.communications')
        .update({
          status: 'replied',
          replied_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', communicationId)
        .eq('organization_id', organizationId);

      if (updateError) {
        console.error('Error updating communication status:', updateError);
        // Don't fail the reply creation, just log the error
      }

      // Create a new outbound communication record for the reply if it's being sent
      const replyDirection = originalCommunication.direction === 'inbound' ? 'outbound' : 'inbound';
      
      const { data: newCommunication, error: newCommError } = await supabase
        .from('hs.communications')
        .insert({
          communication_type: replyData.reply_type,
          direction: replyDirection,
          channel: 'manual',
          subject: 'Re: Original Communication',
          message: replyData.reply_message,
          customer_id: originalCommunication.customer_id,
          technician_id: originalCommunication.technician_id,
          contact_email: replyData.reply_to || originalCommunication.contact_email,
          contact_phone: replyData.reply_to || originalCommunication.contact_phone,
          status: replyData.is_internal_note ? 'draft' : 'sent',
          priority: 'normal',
          attachments: replyData.attachments,
          internal_notes: replyData.internal_notes,
          organization_id: organizationId,
          created_by: user.id,
          sent_at: replyData.is_internal_note ? null : new Date().toISOString(),
        })
        .select()
        .single();

      if (newCommError) {
        console.error('Error creating reply communication:', newCommError);
        // Don't fail the reply creation, but note the error
      }
    }

    // Get updated communication with reply count
    const { data: updatedCommunication } = await supabase
      .from('hs.communications')
      .select('
        *,
        reply_count:communication_replies(count)
      ')
      .eq('id', communicationId)
      .single();

    return NextResponse.json({
      reply,
      updated_communication: updatedCommunication,
      message: replyData.is_internal_note ? 'Internal note added successfully' : 'Reply sent successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('POST /api/v1/hs/communications/[id]/reply error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid reply data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/v1/hs/communications/[id]/replies - Get all replies for a communication
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const communicationId = params.id;

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

    // Verify communication access
    const originalCommunication = await verifyCommunicationAccess(communicationId, organizationId);
    if (!originalCommunication) {
      return NextResponse.json(
        { error: 'Communication not found or access denied' },
        { status: 404 }
      );
    }

    // Get all replies for this communication
    const { data: replies, error } = await supabase
      .from('hs.communication_replies')
      .select('
        *,
        created_by_user:created_by(
          first_name,
          last_name,
          email
        )
      ')
      .eq('communication_id', communicationId)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Database error fetching replies:', error);
      return NextResponse.json(
        { error: 'Failed to fetch replies' },
        { status: 500 }
      );
    }

    // Separate internal notes from actual replies
    const actualReplies = replies?.filter(reply => !reply.is_internal_note) || [];
    const internalNotes = replies?.filter(reply => reply.is_internal_note) || [];

    return NextResponse.json({
      communication_id: communicationId,
      replies: actualReplies,
      internal_notes: internalNotes,
      total_replies: actualReplies.length,
      total_internal_notes: internalNotes.length,
      original_communication: {
        id: originalCommunication.id,
        communication_type: originalCommunication.communication_type,
        direction: originalCommunication.direction,
      },
    });

  } catch (error) {
    console.error('GET /api/v1/hs/communications/[id]/replies error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}