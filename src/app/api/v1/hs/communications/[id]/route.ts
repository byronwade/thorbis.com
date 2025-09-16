import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Communication update schema
const CommunicationUpdateSchema = z.object({
  // Content updates
  subject: z.string().min(1).max(200).optional(),
  message: z.string().min(1).optional(),
  
  // Recipients/Participants
  contact_name: z.string().max(100).optional(),
  contact_email: z.string().email().optional(),
  contact_phone: z.string().max(20).optional(),
  
  // Status updates
  status: z.enum(['draft', 'sent', 'delivered', 'read', 'replied', 'failed', 'cancelled']).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  
  // Scheduling
  scheduled_send_at: z.string().datetime().optional(),
  expires_at: z.string().datetime().optional(),
  
  // Delivery tracking
  delivery_receipt_requested: z.boolean().optional(),
  read_receipt_requested: z.boolean().optional(),
  
  // Attachments
  attachments: z.array(z.object({
    file_name: z.string(),
    file_url: z.string().url(),
    file_size: z.number().optional(),
    mime_type: z.string().optional(),
  })).optional(),
  
  // Settings
  is_confidential: z.boolean().optional(),
  auto_archive_after_days: z.number().min(1).optional(),
  tags: z.array(z.string()).optional(),
  
  // Notes
  internal_notes: z.string().optional(),
});

// Status update schema for tracking delivery status
const StatusUpdateSchema = z.object({
  status: z.enum(['sent', 'delivered', 'read', 'replied', 'failed']),
  timestamp: z.string().datetime().optional(),
  error_message: z.string().optional(),
  delivery_details: z.object({
    provider: z.string().optional(),
    provider_message_id: z.string().optional(),
    provider_status: z.string().optional(),
  }).optional(),
});

// Reply schema for handling inbound communications
const ReplySchema = z.object({
  reply_message: z.string().min(1),
  reply_type: z.enum(['email', 'sms', 'call', 'whatsapp', 'in_app']),
  reply_from: z.string().optional(), // Email or phone number
  attachments: z.array(z.object({
    file_name: z.string(),
    file_url: z.string().url(),
    file_size: z.number().optional(),
    mime_type: z.string().optional(),
  })).optional(),
  internal_notes: z.string().optional(),
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
    .select('id')
    .eq('id', communicationId)
    .eq('organization_id', organizationId)
    .single();
  
  return !!communication;
}

// GET /api/v1/hs/communications/[id] - Get specific communication
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
    if (!(await verifyCommunicationAccess(communicationId, organizationId))) {
      return NextResponse.json(
        { error: 'Communication not found or access denied' },
        { status: 404 }
      );
    }

    // Get communication with all related data
    const { data: communication, error } = await supabase
      .from('hs.communications')
      .select('
        *,
        customers:customer_id(
          id,
          first_name,
          last_name,
          company_name,
          email,
          phone,
          preferred_contact_method
        ),
        technicians:technician_id(
          id,
          first_name,
          last_name,
          phone,
          employee_id,
          email
        ),
        work_orders:work_order_id(
          id,
          work_order_number,
          status,
          service_type,
          service_address_line_1,
          service_city,
          service_state_province
        ),
        appointments:appointment_id(
          id,
          scheduled_date,
          scheduled_time_start,
          scheduled_time_end,
          service_type,
          status
        ),
        estimates:estimate_id(
          id,
          estimate_number,
          status,
          total_amount,
          valid_until
        ),
        invoices:invoice_id(
          id,
          invoice_number,
          status,
          total_amount,
          due_date
        ),
        templates:template_id(
          id,
          name,
          template_type,
          subject_template,
          message_template
        ),
        created_by_user:created_by(
          first_name,
          last_name,
          email
        ),
        communication_replies(
          id,
          reply_message,
          reply_type,
          reply_from,
          attachments,
          internal_notes,
          created_at,
          created_by_user:created_by(
            first_name,
            last_name
          )
        )
      ')
      .eq('id', communicationId)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: true, referencedTable: 'communication_replies' })
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch communication' },
        { status: 500 }
      );
    }

    return NextResponse.json({ communication });

  } catch (error) {
    console.error('GET /api/v1/hs/communications/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/v1/hs/communications/[id] - Update communication
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const communicationId = params.id;
    const body = await request.json();
    const updateData = CommunicationUpdateSchema.parse(body);

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
    if (!(await verifyCommunicationAccess(communicationId, organizationId))) {
      return NextResponse.json(
        { error: 'Communication not found or access denied' },
        { status: 404 }
      );
    }

    // Check current communication status
    const { data: currentCommunication } = await supabase
      .from('hs.communications')
      .select('status, communication_type')
      .eq('id', communicationId)
      .single();

    if (!currentCommunication) {
      return NextResponse.json(
        { error: 'Communication not found' },
        { status: 404 }
      );
    }

    // Prevent editing sent/delivered communications (except status updates)
    if (['sent', 'delivered', 'read'].includes(currentCommunication.status) && 
        (updateData.message || updateData.subject)) {
      return NextResponse.json(
        { error: 'Cannot edit message content after communication has been sent' },
        { status: 409 }
      );
    }

    // Update communication
    const { data: communication, error } = await supabase
      .from('hs.communications')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', communicationId)
      .eq('organization_id', organizationId)
      .select('
        *,
        customers:customer_id(
          first_name,
          last_name,
          company_name,
          email,
          phone
        ),
        technicians:technician_id(
          first_name,
          last_name,
          phone,
          employee_id
        ),
        templates:template_id(
          name,
          template_type
        )
      ')
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update communication' },
        { status: 500 }
      );
    }

    return NextResponse.json({ communication });

  } catch (error) {
    console.error('PUT /api/v1/hs/communications/[id] error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid communication data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/v1/hs/communications/[id]/status - Update communication status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const communicationId = params.id;
    const body = await request.json();
    const statusData = StatusUpdateSchema.parse(body);

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
    if (!(await verifyCommunicationAccess(communicationId, organizationId))) {
      return NextResponse.json(
        { error: 'Communication not found or access denied' },
        { status: 404 }
      );
    }

    const timestamp = statusData.timestamp || new Date().toISOString();
    const updateFields: unknown = {
      status: statusData.status,
      updated_at: timestamp,
    };

    // Update specific timestamp fields based on status
    switch (statusData.status) {
      case 'sent':
        updateFields.sent_at = timestamp;
        break;
      case 'delivered':
        updateFields.delivered_at = timestamp;
        break;
      case 'read':
        updateFields.read_at = timestamp;
        break;
      case 'replied':
        updateFields.replied_at = timestamp;
        break;
      case 'failed':
        updateFields.failed_at = timestamp;
        if (statusData.error_message) {
          updateFields.error_message = statusData.error_message;
        }
        break;
    }

    // Add delivery details if provided
    if (statusData.delivery_details) {
      updateFields.delivery_details = statusData.delivery_details;
    }

    // Update communication status
    const { data: communication, error } = await supabase
      .from('hs.communications')
      .update(updateFields)
      .eq('id', communicationId)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) {
      console.error('Database error updating communication status:', error);
      return NextResponse.json(
        { error: 'Failed to update communication status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Communication status updated successfully',
      communication,
      status_update: {
        previous_status: communication.status,
        new_status: statusData.status,
        timestamp,
      },
    });

  } catch (error) {
    console.error('PATCH /api/v1/hs/communications/[id]/status error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid status update data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/hs/communications/[id] - Delete communication
export async function DELETE(
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

    // Get current communication to check status
    const { data: currentCommunication } = await supabase
      .from('hs.communications')
      .select('status, communication_type')
      .eq('id', communicationId)
      .eq('organization_id', organizationId)
      .single();

    if (!currentCommunication) {
      return NextResponse.json(
        { error: 'Communication not found or access denied' },
        { status: 404 }
      );
    }

    // Only allow deletion of draft communications
    if (currentCommunication.status !== 'draft') {
      return NextResponse.json(
        { error: 'Can only delete draft communications. Use cancel for sent communications.' },
        { status: 409 }
      );
    }

    // Delete communication (this will cascade to replies if configured in DB)
    const { error } = await supabase
      .from('hs.communications')
      .delete()
      .eq('id', communicationId)
      .eq('organization_id', organizationId);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to delete communication' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Communication deleted successfully' 
    });

  } catch (error) {
    console.error('DELETE /api/v1/hs/communications/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}