import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Customer preferences schema
const CustomerPreferencesSchema = z.object({
  // Communication preferences
  preferred_contact_method: z.enum(['phone', 'email', 'sms', 'app']).optional(),
  communication_frequency: z.enum(['minimal', 'normal', 'frequent']).optional(),
  marketing_opt_in: z.boolean().optional(),
  service_reminders_enabled: z.boolean().optional(),
  appointment_reminders_enabled: z.boolean().optional(),
  invoice_reminders_enabled: z.boolean().optional(),
  
  // Communication channels
  email_notifications: z.object({
    job_updates: z.boolean().optional(),
    appointment_reminders: z.boolean().optional(),
    invoice_notifications: z.boolean().optional(),
    marketing_emails: z.boolean().optional(),
    service_reminders: z.boolean().optional(),
  }).optional(),
  
  sms_notifications: z.object({
    job_updates: z.boolean().optional(),
    appointment_reminders: z.boolean().optional(),
    emergency_notifications: z.boolean().optional(),
    arrival_notifications: z.boolean().optional(),
  }).optional(),
  
  // Scheduling preferences
  preferred_appointment_time: z.enum([
    'early_morning', 'morning', 'midday', 'afternoon', 'evening', 'flexible'
  ]).optional(),
  preferred_days: z.array(z.enum([
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ])).optional(),
  advance_notice_days: z.number().min(0).max(30).optional(),
  
  // Service preferences
  preferred_technicians: z.array(z.string().uuid()).optional(),
  service_notes_preferences: z.string().optional(),
  special_requirements: z.array(z.string()).optional(),
  
  // Billing preferences
  preferred_payment_method: z.enum(['cash', 'check', 'card', 'bank_transfer', 'online']).optional(),
  auto_pay_enabled: z.boolean().optional(),
  invoice_delivery_method: z.enum(['email', 'mail', 'both']).optional(),
  billing_contact_different: z.boolean().optional(),
  billing_contact_name: z.string().optional(),
  billing_contact_email: z.string().email().optional(),
  billing_contact_phone: z.string().optional(),
  
  // Privacy preferences
  data_retention_consent: z.boolean().optional(),
  photo_consent: z.boolean().optional(),
  review_request_opt_out: z.boolean().optional(),
  third_party_sharing_opt_out: z.boolean().optional(),
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

// Helper function to verify customer access
async function verifyCustomerAccess(customerId: string, organizationId: string) {
  const { data: customer } = await supabase
    .from('hs.customers')
    .select('id')
    .eq('id', customerId)
    .eq('organization_id', organizationId)
    .single();
  
  return !!customer;
}

// Helper function to get or create customer preferences
async function getCustomerPreferences(customerId: string, organizationId: string) {
  // First try to get existing preferences
  const { data: existing } = await supabase
    .from('hs.customer_preferences')
    .select('*')
    .eq('customer_id', customerId)
    .eq('organization_id', organizationId)
    .single();

  if (existing) {
    return existing;
  }

  // Create default preferences if none exist
  const defaultPreferences = {
    customer_id: customerId,
    organization_id: organizationId,
    preferred_contact_method: 'phone',
    communication_frequency: 'normal',
    marketing_opt_in: true,
    service_reminders_enabled: true,
    appointment_reminders_enabled: true,
    invoice_reminders_enabled: true,
    email_notifications: {
      job_updates: true,
      appointment_reminders: true,
      invoice_notifications: true,
      marketing_emails: true,
      service_reminders: true,
    },
    sms_notifications: {
      job_updates: true,
      appointment_reminders: true,
      emergency_notifications: true,
      arrival_notifications: true,
    },
    preferred_appointment_time: 'flexible',
    preferred_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    advance_notice_days: 1,
    preferred_payment_method: 'card',
    auto_pay_enabled: false,
    invoice_delivery_method: 'email',
    billing_contact_different: false,
    data_retention_consent: true,
    photo_consent: true,
    review_request_opt_out: false,
    third_party_sharing_opt_out: false,
  };

  const { data: created } = await supabase
    .from('hs.customer_preferences')
    .insert(defaultPreferences)
    .select()
    .single();

  return created;
}

// GET /api/v1/hs/customers/[id]/preferences - Get customer preferences
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customerId = params.id;

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

    // Verify customer access
    if (!(await verifyCustomerAccess(customerId, organizationId))) {
      return NextResponse.json(
        { error: 'Customer not found or access denied' },
        { status: 404 }
      );
    }

    // Get customer preferences
    const preferences = await getCustomerPreferences(customerId, organizationId);

    // Also get available technicians for preferred technicians list
    const { data: technicians } = await supabase
      .from('hs.technicians')
      .select('id, first_name, last_name, skills')
      .eq('organization_id', organizationId)
      .eq('status', 'active');

    return NextResponse.json({
      preferences,
      available_technicians: technicians || [],
    });

  } catch (error) {
    console.error('GET /api/v1/hs/customers/[id]/preferences error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/v1/hs/customers/[id]/preferences - Update customer preferences
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customerId = params.id;
    const body = await request.json();
    const updateData = CustomerPreferencesSchema.parse(body);

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

    // Verify customer access
    if (!(await verifyCustomerAccess(customerId, organizationId))) {
      return NextResponse.json(
        { error: 'Customer not found or access denied' },
        { status: 404 }
      );
    }

    // Validate preferred technicians exist
    if (updateData.preferred_technicians && updateData.preferred_technicians.length > 0) {
      const { data: technicianCheck } = await supabase
        .from('hs.technicians')
        .select('id')
        .in('id', updateData.preferred_technicians)
        .eq('organization_id', organizationId);

      if (technicianCheck?.length !== updateData.preferred_technicians.length) {
        return NextResponse.json(
          { error: 'One or more preferred technicians not found' },
          { status: 400 }
        );
      }
    }

    // Ensure preferences record exists
    await getCustomerPreferences(customerId, organizationId);

    // Update preferences
    const { data: preferences, error } = await supabase
      .from('hs.customer_preferences')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('customer_id', customerId)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update preferences' },
        { status: 500 }
      );
    }

    // Log preference change for audit
    await supabase
      .from('hs.customer_activity_log')
      .insert({
        customer_id: customerId,
        activity_type: 'preferences_updated',
        activity_description: 'Customer preferences were updated',
        metadata: {
          updated_fields: Object.keys(updateData),
          updated_by: user.id,
        },
        organization_id: organizationId,
        created_by: user.id,
      });

    return NextResponse.json({ preferences });

  } catch (error) {
    console.error('PUT /api/v1/hs/customers/[id]/preferences error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid preference data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/v1/hs/customers/[id]/preferences - Partially update customer preferences
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customerId = params.id;
    const body = await request.json();
    
    // For PATCH, we allow partial updates
    const updateData = CustomerPreferencesSchema.partial().parse(body);

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

    // Verify customer access
    if (!(await verifyCustomerAccess(customerId, organizationId))) {
      return NextResponse.json(
        { error: 'Customer not found or access denied' },
        { status: 404 }
      );
    }

    // Get current preferences
    const currentPreferences = await getCustomerPreferences(customerId, organizationId);

    // Merge nested objects properly
    const mergedData: unknown = { ...updateData };
    
    if (updateData.email_notifications) {
      mergedData.email_notifications = {
        ...currentPreferences.email_notifications,
        ...updateData.email_notifications,
      };
    }
    
    if (updateData.sms_notifications) {
      mergedData.sms_notifications = {
        ...currentPreferences.sms_notifications,
        ...updateData.sms_notifications,
      };
    }

    // Update preferences
    const { data: preferences, error } = await supabase
      .from('hs.customer_preferences')
      .update({
        ...mergedData,
        updated_at: new Date().toISOString(),
      })
      .eq('customer_id', customerId)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update preferences' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      preferences,
      message: 'Preferences updated successfully' 
    });

  } catch (error) {
    console.error('PATCH /api/v1/hs/customers/[id]/preferences error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid preference data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}