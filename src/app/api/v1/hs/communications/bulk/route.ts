import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Bulk send schema
const BulkSendSchema = z.object({
  template_id: z.string().uuid(),
  communication_type: z.enum(['email', 'sms', 'whatsapp', 'in_app']),
  
  // Recipients with individual variable data
  recipients: z.array(z.object({
    customer_id: z.string().uuid().optional(),
    technician_id: z.string().uuid().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    name: z.string().optional(),
    variables: z.record(z.string(), z.any()).optional(), // Per-recipient variable substitution
    metadata: z.record(z.string(), z.any()).optional(), // Additional tracking data
  })).min(1).max(1000), // Increased limit for bulk operations
  
  // Global variables (applied to all recipients)
  global_variables: z.record(z.string(), z.any()).optional(),
  
  // Scheduling and delivery
  send_immediately: z.boolean().default(true),
  scheduled_send_at: z.string().datetime().optional(),
  stagger_send_minutes: z.number().min(0).max(60).optional(), // Stagger sends to avoid rate limits
  
  // Campaign tracking
  campaign_id: z.string().uuid().optional(),
  campaign_name: z.string().optional(),
  tracking_tags: z.array(z.string()).optional(),
  
  // Settings
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  stop_on_failure: z.boolean().default(false),
  max_failures_allowed: z.number().min(0).default(50), // Stop after this many failures
  
  // Test mode
  test_mode: z.boolean().default(false), // If true, don't actually send
  test_recipient_limit: z.number().min(1).max(10).optional(), // Limit for test sends
});

// Bulk action schema for other operations
const BulkActionSchema = z.object({
  action: z.enum(['cancel', 'reschedule', 'retry_failed']),
  communication_ids: z.array(z.string().uuid()).min(1).max(500),
  
  // For reschedule action
  new_scheduled_time: z.string().datetime().optional(),
  
  // For retry action
  retry_delay_minutes: z.number().min(0).max(1440).optional(), // Max 24 hours delay
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

// Helper function to substitute template variables
function substituteVariables(template: string, globalVars: Record<string, unknown>, localVars: Record<string, unknown>): string {
  let result = template;
  const allVars = { ...globalVars, ...localVars }; // Local vars override global
  
  for (const [key, value] of Object.entries(allVars)) {
    const regex = new RegExp('\\{\\{\\s*${key}\\s*\\}\\}', 'g');
    result = result.replace(regex, String(value ?? '));
  }
  
  return result;
}

// Helper function to validate and enrich recipients
async function validateAndEnrichRecipients(recipients: unknown[], organizationId: string) {
  const errors = [];
  const enrichedRecipients = [];
  
  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i];
    const enrichedRecipient = { ...recipient };
    
    // Validate and enrich customer data
    if (recipient.customer_id) {
      const { data: customer } = await supabase
        .from('hs.customers')
        .select('
          id, email, phone, first_name, last_name, company_name,
          address_line_1, city, state_province, postal_code,
          preferred_contact_method, customer_type
        ')
        .eq('id', recipient.customer_id)
        .eq('organization_id`, organizationId)
        .single();
      
      if (!customer) {
        errors.push(`Recipient ${i + 1}: Customer not found');
        continue;
      }
      
      // Auto-fill contact details and variables from customer
      enrichedRecipient.email = recipient.email || customer.email;
      enrichedRecipient.phone = recipient.phone || customer.phone;
      enrichedRecipient.name = recipient.name || customer.company_name || '${customer.first_name} ${customer.last_name}';
      
      // Add customer data to variables for template substitution
      enrichedRecipient.variables = {
        ...recipient.variables,
        customer_first_name: customer.first_name,
        customer_last_name: customer.last_name,
        customer_company: customer.company_name,
        customer_email: customer.email,
        customer_phone: customer.phone,
        customer_address: customer.address_line_1,
        customer_city: customer.city,
        customer_state: customer.state_province,
        customer_postal_code: customer.postal_code,
        customer_type: customer.customer_type,
      };
    }
    
    // Validate and enrich technician data
    if (recipient.technician_id) {
      const { data: technician } = await supabase
        .from('hs.technicians')
        .select('
          id, email, phone, first_name, last_name, employee_id,
          skills, certifications, status
        ')
        .eq('id', recipient.technician_id)
        .eq('organization_id`, organizationId)
        .single();
      
      if (!technician) {
        errors.push(`Recipient ${i + 1}: Technician not found');
        continue;
      }
      
      // Auto-fill contact details and variables from technician
      enrichedRecipient.email = recipient.email || technician.email;
      enrichedRecipient.phone = recipient.phone || technician.phone;
      enrichedRecipient.name = recipient.name || '${technician.first_name} ${technician.last_name}';
      
      // Add technician data to variables
      enrichedRecipient.variables = {
        ...recipient.variables,
        technician_first_name: technician.first_name,
        technician_last_name: technician.last_name,
        technician_employee_id: technician.employee_id,
        technician_email: technician.email,
        technician_phone: technician.phone,
        technician_skills: technician.skills?.join(', ') || ',
      };
    }
    
    // Validate contact information is present
    if (!enrichedRecipient.email && !enrichedRecipient.phone) {
      errors.push('Recipient ${i + 1}: No email or phone number available');
      continue;
    }
    
    enrichedRecipients.push(enrichedRecipient);
  }
  
  return { errors, recipients: enrichedRecipients };
}

// Simulated bulk send function with rate limiting
async function sendBulkCommunications(
  communications: unknown[],
  staggerMinutes: number = 0
): Promise<{ successful: unknown[], failed: unknown[] }> {
  const successful = [];
  const failed = [];
  const staggerMs = staggerMinutes * 60 * 1000;
  
  for (let i = 0; i < communications.length; i++) {
    const communication = communications[i];
    
    // Stagger sends if requested
    if (i > 0 && staggerMs > 0) {
      await new Promise(resolve => setTimeout(resolve, staggerMs));
    }
    
    try {
      // Simulate sending (replace with actual service integration)
      await new Promise(resolve => setTimeout(resolve, 50)); // Simulate API call
      
      // Simulate failure rate
      if (Math.random() > 0.98) { // 2% failure rate
        failed.push({
          communication_id: communication.id,
          error: 'Service temporarily unavailable',
          recipient: communication.recipient,
        });
      } else {
        successful.push({
          communication_id: communication.id,
          message_id: 'msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}',
          recipient: communication.recipient,
        });
      }
    } catch (error) {
      failed.push({
        communication_id: communication.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        recipient: communication.recipient,
      });
    }
  }
  
  return { successful, failed };
}

// POST /api/v1/hs/communications/bulk - Bulk send communications
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const bulkData = BulkSendSchema.parse(body);

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

    // Get and validate template
    const { data: template } = await supabase
      .from('hs.communication_templates')
      .select('*')
      .eq('id', bulkData.template_id)
      .eq('organization_id', organizationId)
      .single();

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    if (template.template_type !== bulkData.communication_type) {
      return NextResponse.json(
        { error: 'Template type ${template.template_type} does not match communication type ${bulkData.communication_type}' },
        { status: 400 }
      );
    }

    // Limit recipients for test mode
    const recipientsToProcess = bulkData.test_mode && bulkData.test_recipient_limit
      ? bulkData.recipients.slice(0, bulkData.test_recipient_limit)
      : bulkData.recipients;

    // Validate and enrich recipients
    const { errors, recipients } = await validateAndEnrichRecipients(
      recipientsToProcess,
      organizationId
    );

    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Recipient validation failed', details: errors },
        { status: 400 }
      );
    }

    // Create campaign if needed
    let campaignId = bulkData.campaign_id;
    if (!campaignId && bulkData.campaign_name) {
      const { data: campaign } = await supabase
        .from('hs.communication_campaigns')
        .insert({
          name: bulkData.campaign_name,
          template_id: bulkData.template_id,
          total_recipients: recipients.length,
          status: 'in_progress',
          organization_id: organizationId,
          created_by: user.id,
        })
        .select()
        .single();
      
      campaignId = campaign?.id;
    }

    // Create communication records for each recipient
    const communicationsToCreate = recipients.map(recipient => {
      const subject = template.subject_template
        ? substituteVariables(template.subject_template, bulkData.global_variables || {}, recipient.variables || {})
        : ';
      
      const message = substituteVariables(template.message_template, bulkData.global_variables || {}, recipient.variables || {});

      return {
        communication_type: bulkData.communication_type,
        direction: 'outbound',
        channel: 'automated',
        subject,
        message,
        template_id: bulkData.template_id,
        customer_id: recipient.customer_id,
        technician_id: recipient.technician_id,
        contact_name: recipient.name,
        contact_email: recipient.email,
        contact_phone: recipient.phone,
        status: bulkData.test_mode ? 'draft' : (bulkData.send_immediately ? 'sent' : 'scheduled'),
        priority: bulkData.priority,
        scheduled_send_at: bulkData.scheduled_send_at,
        tags: bulkData.tracking_tags,
        campaign_id: campaignId,
        organization_id: organizationId,
        created_by: user.id,
        sent_at: bulkData.send_immediately && !bulkData.test_mode ? new Date().toISOString() : null,
        recipient_metadata: recipient.metadata,
      };
    });

    // Insert all communications in batches
    const batchSize = 100;
    const createdCommunications = [];
    
    for (let i = 0; i < communicationsToCreate.length; i += batchSize) {
      const batch = communicationsToCreate.slice(i, i + batchSize);
      
      const { data: batchResult, error } = await supabase
        .from('hs.communications')
        .insert(batch)
        .select();

      if (error) {
        console.error('Batch insert error:', error);
        return NextResponse.json(
          { error: 'Failed to create communications batch' },
          { status: 500 }
        );
      }

      createdCommunications.push(...(batchResult || []));
    }

    let sendResults = { successful: [], failed: [] };

    // Send communications if not in test mode and sending immediately
    if (!bulkData.test_mode && bulkData.send_immediately) {
      const communicationsWithRecipients = createdCommunications.map((comm, index) => ({
        ...comm,
        recipient: recipients[index],
      }));

      sendResults = await sendBulkCommunications(
        communicationsWithRecipients,
        bulkData.stagger_send_minutes
      );

      // Update communication statuses based on send results
      for (const success of sendResults.successful) {
        await supabase
          .from('hs.communications')
          .update({
            status: 'delivered',
            delivered_at: new Date().toISOString(),
            delivery_details: {
              message_id: success.message_id,
              provider: 'internal',
            },
          })
          .eq('id', success.communication_id);
      }

      for (const failure of sendResults.failed) {
        await supabase
          .from('hs.communications')
          .update({
            status: 'failed',
            failed_at: new Date().toISOString(),
            error_message: failure.error,
          })
          .eq('id', failure.communication_id);
      }

      // Check if we should stop on failure
      if (bulkData.stop_on_failure && sendResults.failed.length >= bulkData.max_failures_allowed) {
        return NextResponse.json({
          error: 'Bulk send stopped due to ${sendResults.failed.length} failures (max allowed: ${bulkData.max_failures_allowed})',
          successful_sends: sendResults.successful,
          failed_sends: sendResults.failed,
          total_created: createdCommunications.length,
        }, { status: 207 });
      }
    }

    // Update template usage
    await supabase
      .from('hs.communication_templates')
      .update({
        usage_count: supabase.raw('usage_count + ${createdCommunications.length}'),
        last_used_at: new Date().toISOString(),
      })
      .eq('id', bulkData.template_id);

    // Update campaign status
    if (campaignId) {
      await supabase
        .from('hs.communication_campaigns')
        .update({
          status: bulkData.send_immediately ? 'completed' : 'scheduled',
          sent_count: sendResults.successful.length,
          failed_count: sendResults.failed.length,
          completed_at: bulkData.send_immediately ? new Date().toISOString() : null,
        })
        .eq('id`, campaignId);
    }

    const response = {
      message: bulkData.test_mode
        ? `Test completed: ${createdCommunications.length} communications prepared'
        : 'Bulk send completed: ${sendResults.successful.length} sent, ${sendResults.failed.length} failed',
      
      summary: {
        total_recipients: recipients.length,
        communications_created: createdCommunications.length,
        successful_sends: sendResults.successful.length,
        failed_sends: sendResults.failed.length,
        campaign_id: campaignId,
        send_mode: bulkData.send_immediately ? 'immediate' : 'scheduled',
        test_mode: bulkData.test_mode,
      },
      
      successful_sends: sendResults.successful,
      failed_sends: sendResults.failed.slice(0, 10), // Limit failed details in response
      
      // Include more details in test mode
      ...(bulkData.test_mode && {
        test_communications: createdCommunications.slice(0, 5), // Sample of created communications
        validation_errors: errors,
      }),
    };

    const statusCode = sendResults.failed.length > 0 ? 207 : (bulkData.test_mode ? 200 : 201);
    return NextResponse.json(response, { status: statusCode });

  } catch (error) {
    console.error('POST /api/v1/hs/communications/bulk error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid bulk send data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/v1/hs/communications/bulk - Bulk actions on communications
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const actionData = BulkActionSchema.parse(body);

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

    // Verify all communications belong to the organization
    const { data: communications } = await supabase
      .from('hs.communications')
      .select('id, status, communication_type')
      .in('id', actionData.communication_ids)
      .eq('organization_id', organizationId);

    if (!communications || communications.length !== actionData.communication_ids.length) {
      return NextResponse.json(
        { error: 'Some communications not found or access denied' },
        { status: 404 }
      );
    }

    let updateData: unknown = {};
    let message = ';

    switch (actionData.action) {
      case 'cancel':
        updateData = {
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
        };
        message = 'Communications cancelled successfully';
        break;

      case 'reschedule':
        if (!actionData.new_scheduled_time) {
          return NextResponse.json(
            { error: 'new_scheduled_time is required for reschedule action' },
            { status: 400 }
          );
        }
        updateData = {
          scheduled_send_at: actionData.new_scheduled_time,
          status: 'scheduled',
        };
        message = 'Communications rescheduled successfully';
        break;

      case 'retry_failed':
        const retryTime = new Date();
        if (actionData.retry_delay_minutes) {
          retryTime.setMinutes(retryTime.getMinutes() + actionData.retry_delay_minutes);
        }
        
        updateData = {
          status: 'scheduled',
          scheduled_send_at: retryTime.toISOString(),
          error_message: null,
          failed_at: null,
        };
        message = 'Failed communications scheduled for retry';
        break;
    }

    // Apply bulk update
    const { data: updatedCommunications, error } = await supabase
      .from('hs.communications')
      .update(updateData)
      .in('id', actionData.communication_ids)
      .eq('organization_id', organizationId)
      .select();

    if (error) {
      console.error('Bulk update error:', error);
      return NextResponse.json(
        { error: 'Failed to perform bulk action' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message,
      action: actionData.action,
      affected_communications: updatedCommunications?.length || 0,
      communications: updatedCommunications,
    });

  } catch (error) {
    console.error('PATCH /api/v1/hs/communications/bulk error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid bulk action data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}