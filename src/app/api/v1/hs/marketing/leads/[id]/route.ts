import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Lead update schema
const LeadUpdateSchema = z.object({
  source: z.enum(['website', 'phone', 'referral', 'social', 'email', 'walk_in', 'advertisement', 'other']).optional(),
  campaign_id: z.string().uuid().optional(),
  
  // Contact information
  first_name: z.string().min(1).max(100).optional(),
  last_name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
  company_name: z.string().max(255).optional(),
  
  // Address
  address_line_1: z.string().max(255).optional(),
  address_line_2: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  state_province: z.string().max(100).optional(),
  postal_code: z.string().max(20).optional(),
  
  // Lead details
  service_interest: z.array(z.string()).optional(),
  urgency: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  budget_range: z.enum(['under_500', '500_1000', '1000_2500', '2500_5000', 'over_5000']).optional(),
  preferred_contact_time: z.string().optional(),
  
  // Qualification
  lead_score: z.number().min(0).max(100).optional(),
  qualification_notes: z.string().optional(),
  
  // Status
  status: z.enum(['new', 'contacted', 'qualified', 'quoted', 'converted', 'lost', 'nurturing']).optional(),
  
  // Assignment
  assigned_technician_id: z.string().uuid().optional(),
  
  // Source tracking
  referrer_url: z.string().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  utm_term: z.string().optional(),
  utm_content: z.string().optional(),
  
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

// Lead conversion schema
const LeadConversionSchema = z.object({
  converted_to_customer_id: z.string().uuid().optional(),
  conversion_revenue: z.number().min(0).optional(),
  conversion_notes: z.string().optional(),
  work_order_id: z.string().uuid().optional(),
  estimate_id: z.string().uuid().optional(),
  conversion_date: z.string().datetime().optional(),
});

// Lead activity schema
const LeadActivitySchema = z.object({
  activity_type: z.enum(['call', 'email', 'meeting', 'quote_sent', 'follow_up', 'note', 'status_change', 'other']),
  activity_description: z.string(),
  activity_date: z.string().datetime().optional(),
  duration_minutes: z.number().min(0).optional(),
  outcome: z.enum(['positive', 'neutral', 'negative', 'no_response']).optional(),
  next_action: z.string().optional(),
  next_action_date: z.string().date().optional(),
  notes: z.string().optional(),
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

// Helper function to verify lead access
async function verifyLeadAccess(leadId: string, organizationId: string) {
  const { data: lead } = await supabase
    .from('hs.leads')
    .select('id')
    .eq('id', leadId)
    .eq('organization_id', organizationId)
    .single();
  
  return !!lead;
}

// Helper function to log lead activity
async function logLeadActivity(
  leadId: string,
  activityType: string,
  description: string, metadata: unknown,
  organizationId: string,
  userId: string
) {
  await supabase
    .from('hs.lead_activity_log')
    .insert({
      lead_id: leadId,
      activity_type: activityType,
      activity_description: description,
      metadata,
      organization_id: organizationId,
      created_by: userId,
    });
}

// GET /api/v1/hs/marketing/leads/[id] - Get specific lead
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const leadId = params.id;

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

    // Verify lead access
    if (!(await verifyLeadAccess(leadId, organizationId))) {
      return NextResponse.json(
        { error: 'Lead not found or access denied' },
        { status: 404 }
      );
    }

    // Get lead with related data
    const { data: lead, error } = await supabase
      .from('hs.leads')
      .select('
        *,
        campaigns:campaign_id(
          id,
          name,
          campaign_type,
          status
        ),
        assigned_technician:assigned_technician_id(
          id,
          first_name,
          last_name,
          email,
          phone
        )
      ')
      .eq('id', leadId)
      .eq('organization_id', organizationId)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch lead' },
        { status: 500 }
      );
    }

    // Get lead activity history
    const { data: activities } = await supabase
      .from('hs.lead_activity_log')
      .select('
        *,
        created_by_user:created_by(
          first_name,
          last_name
        )
      ')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })
      .limit(50);

    // Get related records (if converted)
    let relatedRecords = {};
    if (lead.status === 'converted') {
      const [customer, workOrders, estimates] = await Promise.all([
        lead.converted_to_customer_id ? supabase
          .from('hs.customers')
          .select('id, first_name, last_name, company_name')
          .eq('id', lead.converted_to_customer_id)
          .single() : { data: null },
        
        supabase
          .from('hs.work_orders')
          .select('id, work_order_number, status, estimate_total')
          .eq('organization_id', organizationId)
          .eq('lead_id', leadId),
        
        supabase
          .from('hs.estimates')
          .select('id, estimate_number, status, total_amount')
          .eq('organization_id', organizationId)
          .eq('lead_id', leadId),
      ]);

      relatedRecords = {
        customer: customer.data,
        work_orders: workOrders.data || [],
        estimates: estimates.data || [],
      };
    }

    return NextResponse.json({
      lead,
      activities: activities || [],
      related_records: relatedRecords,
    });

  } catch (error) {
    console.error('GET /api/v1/hs/marketing/leads/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/v1/hs/marketing/leads/[id] - Update lead
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const leadId = params.id;
    const body = await request.json();
    const updateData = LeadUpdateSchema.parse(body);

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

    // Verify lead access and get current data
    const { data: currentLead } = await supabase
      .from('hs.leads')
      .select('*')
      .eq('id', leadId)
      .eq('organization_id', organizationId)
      .single();

    if (!currentLead) {
      return NextResponse.json(
        { error: 'Lead not found or access denied' },
        { status: 404 }
      );
    }

    // Validate technician assignment
    if (updateData.assigned_technician_id) {
      const { data: technician } = await supabase
        .from('hs.technicians')
        .select('id, first_name, last_name')
        .eq('id', updateData.assigned_technician_id)
        .eq('organization_id', organizationId)
        .single();

      if (!technician) {
        return NextResponse.json(
          { error: 'Assigned technician not found' },
          { status: 400 }
        );
      }
    }

    // Update lead
    const { data: lead, error } = await supabase
      .from('hs.leads')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', leadId)
      .eq('organization_id', organizationId)
      .select('
        *,
        campaigns:campaign_id(
          name,
          campaign_type
        ),
        assigned_technician:assigned_technician_id(
          first_name,
          last_name
        )
      ')
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update lead' },
        { status: 500 }
      );
    }

    // Log changes
    const changes = [];
    for (const [key, value] of Object.entries(updateData)) {
      if (currentLead[key] !== value) {
        changes.push({
          field: key,
          old_value: currentLead[key],
          new_value: value,
        });
      }
    }

    if (changes.length > 0) {
      await logLeadActivity(
        leadId,
        'updated',
        'Lead information was updated',
        { changes },
        organizationId,
        user.id
      );
    }

    // Log specific status changes
    if (updateData.status && updateData.status !== currentLead.status) {
      await logLeadActivity(
        leadId,
        'status_change`,
        `Lead status changed from ${currentLead.status} to ${updateData.status}',
        {
          old_status: currentLead.status,
          new_status: updateData.status,
        },
        organizationId,
        user.id
      );
    }

    // Log assignment changes
    if (updateData.assigned_technician_id && updateData.assigned_technician_id !== currentLead.assigned_technician_id) {
      const technicianName = lead.assigned_technician ? 
        '${lead.assigned_technician.first_name} ${lead.assigned_technician.last_name}' : 
        'Unknown';
      
      await logLeadActivity(
        leadId,
        'assigned',
        'Lead assigned to ${technicianName}',
        {
          technician_id: updateData.assigned_technician_id,
          previous_technician_id: currentLead.assigned_technician_id,
        },
        organizationId,
        user.id
      );
    }

    return NextResponse.json({ lead });

  } catch (error) {
    console.error('PUT /api/v1/hs/marketing/leads/[id] error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid lead data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/hs/marketing/leads/[id] - Delete lead (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const leadId = params.id;

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

    // Verify lead access
    if (!(await verifyLeadAccess(leadId, organizationId))) {
      return NextResponse.json(
        { error: 'Lead not found or access denied' },
        { status: 404 }
      );
    }

    // Check if lead has been converted - prevent deletion of converted leads
    const { data: leadCheck } = await supabase
      .from('hs.leads')
      .select('status, converted_to_customer_id')
      .eq('id', leadId)
      .single();

    if (leadCheck?.status === 'converted' || leadCheck?.converted_to_customer_id) {
      return NextResponse.json(
        { error: 'Cannot delete converted leads' },
        { status: 409 }
      );
    }

    // Soft delete lead
    const { data: lead, error } = await supabase
      .from('hs.leads')
      .update({
        status: 'deleted',
        deleted_at: new Date().toISOString(),
      })
      .eq('id', leadId)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to delete lead' },
        { status: 500 }
      );
    }

    // Log deletion
    await logLeadActivity(
      leadId,
      'deleted',
      'Lead was deleted',
      { deleted_by: user.id },
      organizationId,
      user.id
    );

    return NextResponse.json({ 
      message: 'Lead deleted successfully',
      lead 
    });

  } catch (error) {
    console.error('DELETE /api/v1/hs/marketing/leads/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}