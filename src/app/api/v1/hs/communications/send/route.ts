import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Send communication schema
const SendCommunicationSchema = z.object({
  communication_id: z.string().uuid().optional(),
  
  // Or create and send in one step
  communication_type: z.enum(['email', 'sms', 'whatsapp', 'in_app']).optional(),
  template_id: z.string().uuid().optional(),
  
  // Recipients
  recipients: z.array(z.object({
    customer_id: z.string().uuid().optional(),
    technician_id: z.string().uuid().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    name: z.string().optional(),
  })).min(1),
  
  // Content (if not using existing communication)
  subject: z.string().optional(),
  message: z.string().optional(),
  
  // Variable substitution for templates
  variables: z.record(z.string(), z.any()).optional(),
  
  // Scheduling
  send_immediately: z.boolean().default(true),
  scheduled_send_at: z.string().datetime().optional(),
  
  // References
  work_order_id: z.string().uuid().optional(),
  appointment_id: z.string().uuid().optional(),
  estimate_id: z.string().uuid().optional(),
  invoice_id: z.string().uuid().optional(),
  
  // Settings
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  delivery_receipt_requested: z.boolean().default(false),
  read_receipt_requested: z.boolean().default(false),
  
  // Attachments
  attachments: z.array(z.object({
    file_name: z.string(),
    file_url: z.string().url(),
    file_size: z.number().optional(),
    mime_type: z.string().optional(),
  })).optional(),
  
  // Campaign tracking
  campaign_id: z.string().uuid().optional(),
  tracking_tags: z.array(z.string()).optional(),
});

// Bulk send schema
const BulkSendSchema = z.object({
  template_id: z.string().uuid(),
  communication_type: z.enum(['email', 'sms', 'whatsapp', 'in_app']),
  
  // Recipients with variable data
  recipients: z.array(z.object({
    customer_id: z.string().uuid().optional(),
    technician_id: z.string().uuid().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    name: z.string().optional(),
    variables: z.record(z.string(), z.any()).optional(), // Per-recipient variable substitution
  })).min(1).max(500), // Limit bulk sends
  
  // Global variables (applied to all recipients)
  global_variables: z.record(z.string(), z.any()).optional(),
  
  // Scheduling
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
function substituteVariables(template: string, variables: Record<string, unknown>): string {
  let result = template;
  
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp('\\{\\{\\s*${key}\\s*\\}\\}', 'g');
    result = result.replace(regex, String(value ?? '));
  }
  
  return result;
}

// Helper function to validate recipient data
async function validateRecipients(recipients: unknown[], organizationId: string) {
  const errors = [];
  
  for (const i = 0; i < recipients.length; i++) {
    const recipient = recipients[i];
    
    // Validate customer if provided
    if (recipient.customer_id) {
      const { data: customer } = await supabase
        .from('hs.customers')
        .select('id, email, phone, first_name, last_name, company_name')
        .eq('id', recipient.customer_id)
        .eq('organization_id`, organizationId)
        .single();
      
      if (!customer) {
        errors.push(`Recipient ${i + 1}: Customer not found');
      } else {
        // Auto-fill contact details from customer
        recipients[i].email = recipients[i].email || customer.email;
        recipients[i].phone = recipients[i].phone || customer.phone;
        recipients[i].name = recipients[i].name || customer.company_name || '${customer.first_name} ${customer.last_name}';
      }
    }
    
    // Validate technician if provided
    if (recipient.technician_id) {
      const { data: technician } = await supabase
        .from('hs.technicians')
        .select('id, email, phone, first_name, last_name')
        .eq('id', recipient.technician_id)
        .eq('organization_id`, organizationId)
        .single();
      
      if (!technician) {
        errors.push(`Recipient ${i + 1}: Technician not found`);
      } else {
        // Auto-fill contact details from technician
        recipients[i].email = recipients[i].email || technician.email;
        recipients[i].phone = recipients[i].phone || technician.phone;
        recipients[i].name = recipients[i].name || `${technician.first_name} ${technician.last_name}';
      }
    }
    
    // Validate contact information is present
    if (!recipient.email && !recipient.phone) {
      errors.push('Recipient ${i + 1}: No email or phone number provided');
    }
  }
  
  return { errors, validatedRecipients: recipients };
}

// Simulated send function (replace with actual email/SMS service integration)
async function sendCommunication(
  type: string, recipient: unknown,
  subject: string,
  message: string,
  attachments?: unknown[]
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  // Simulate sending delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Simulate success/failure (replace with actual service integration)
  if (Math.random() > 0.95) { // 5% failure rate for simulation
    return {
      success: false,
      error: 'Service temporarily unavailable'
    };
  }
  
  return {
    success: true,
    messageId: 'msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}'
  };
}

// POST /api/v1/hs/communications/send - Send single or multiple communications
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const sendData = SendCommunicationSchema.parse(body);

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

    let communicationToSend: any;
    let subject: string;
    let message: string;

    if (sendData.communication_id) {
      // Send existing communication
      const { data: existingComm } = await supabase
        .from('hs.communications')
        .select('*')
        .eq('id', sendData.communication_id)
        .eq('organization_id', organizationId)
        .single();

      if (!existingComm) {
        return NextResponse.json(
          { error: 'Communication not found' },
          { status: 404 }
        );
      }

      if (existingComm.status !== 'draft') {
        return NextResponse.json(
          { error: 'Communication has already been sent' },
          { status: 409 }
        );
      }

      communicationToSend = existingComm;
      subject = existingComm.subject || ';
      message = existingComm.message;
    } else {
      // Create and send new communication
      if (!sendData.communication_type) {
        return NextResponse.json(
          { error: 'communication_type is required when not using existing communication' },
          { status: 400 }
        );
      }

      // Get template if provided
      let template = null;
      if (sendData.template_id) {
        const { data: templateData } = await supabase
          .from('hs.communication_templates')
          .select('*')
          .eq('id', sendData.template_id)
          .eq('organization_id', organizationId)
          .single();

        if (!templateData) {
          return NextResponse.json(
            { error: 'Template not found' },
            { status: 400 }
          );
        }

        template = templateData;
      }

      // Determine subject and message
      if (template) {
        subject = template.subject_template ? 
          substituteVariables(template.subject_template, sendData.variables || {}) : 
          sendData.subject || ';
        message = substituteVariables(template.message_template, sendData.variables || {});
      } else {
        subject = sendData.subject || ';
        message = sendData.message || ';
      }

      if (!message) {
        return NextResponse.json(
          { error: 'Message content is required' },
          { status: 400 }
        );
      }
    }

    // Validate recipients
    const { errors, validatedRecipients } = await validateRecipients(
      sendData.recipients,
      organizationId
    );

    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Recipient validation failed', details: errors },
        { status: 400 }
      );
    }

    const results = [];
    const failedSends = [];

    // Send to each recipient
    for (const recipient of validatedRecipients) {
      try {
        // Create communication record for this recipient
        const { data: communication } = await supabase
          .from('hs.communications')
          .insert({
            communication_type: sendData.communication_type || communicationToSend?.communication_type,
            direction: 'outbound',
            channel: 'manual',
            subject,
            message,
            template_id: sendData.template_id,
            customer_id: recipient.customer_id,
            technician_id: recipient.technician_id,
            contact_name: recipient.name,
            contact_email: recipient.email,
            contact_phone: recipient.phone,
            work_order_id: sendData.work_order_id,
            appointment_id: sendData.appointment_id,
            estimate_id: sendData.estimate_id,
            invoice_id: sendData.invoice_id,
            status: sendData.send_immediately ? 'sent' : 'draft',
            priority: sendData.priority,
            scheduled_send_at: sendData.scheduled_send_at,
            delivery_receipt_requested: sendData.delivery_receipt_requested,
            read_receipt_requested: sendData.read_receipt_requested,
            attachments: sendData.attachments,
            tags: sendData.tracking_tags,
            organization_id: organizationId,
            created_by: user.id,
            sent_at: sendData.send_immediately ? new Date().toISOString() : null,
          })
          .select()
          .single();

        if (sendData.send_immediately) {
          // Send the communication
          const sendResult = await sendCommunication(
            sendData.communication_type || communicationToSend?.communication_type,
            recipient,
            subject,
            message,
            sendData.attachments
          );

          if (sendResult.success) {
            // Update communication with delivery details
            await supabase
              .from('hs.communications')
              .update({
                status: 'delivered',
                delivered_at: new Date().toISOString(),
                delivery_details: {
                  message_id: sendResult.messageId,
                  provider: 'internal',
                },
              })
              .eq('id', communication.id);

            results.push({
              communication_id: communication.id,
              recipient,
              status: 'sent',
              message_id: sendResult.messageId,
            });
          } else {
            // Update communication as failed
            await supabase
              .from('hs.communications')
              .update({
                status: 'failed',
                failed_at: new Date().toISOString(),
                error_message: sendResult.error,
              })
              .eq('id', communication.id);

            failedSends.push({
              communication_id: communication.id,
              recipient,
              error: sendResult.error,
            });
          }
        } else {
          results.push({
            communication_id: communication.id,
            recipient,
            status: 'scheduled',
            scheduled_for: sendData.scheduled_send_at,
          });
        }

        // Update template usage count
        if (sendData.template_id) {
          await supabase
            .from('hs.communication_templates')
            .update({
              usage_count: supabase.raw('usage_count + 1'),
              last_used_at: new Date().toISOString(),
            })
            .eq('id', sendData.template_id);
        }

      } catch (error) {
        console.error('Error sending to recipient:', error);
        failedSends.push({
          recipient,
          error: 'Internal error sending communication',
        });
      }
    }

    // Update original communication status if it was an existing one
    if (sendData.communication_id && sendData.send_immediately) {
      await supabase
        .from('hs.communications')
        .update({
          status: results.length > 0 ? 'sent' : 'failed',
          sent_at: new Date().toISOString(),
        })
        .eq('id', sendData.communication_id);
    }

    const response = {
      message: 'Sent ${results.length} communications successfully',
      successful_sends: results,
      failed_sends: failedSends,
      summary: {
        total_recipients: sendData.recipients.length,
        successful: results.length,
        failed: failedSends.length,
        send_mode: sendData.send_immediately ? 'immediate' : 'scheduled',
      },
    };

    const statusCode = failedSends.length > 0 ? 207 : 200; // Multi-status for partial success

    return NextResponse.json(response, { status: statusCode });

  } catch (error) {
    console.error('POST /api/v1/hs/communications/send error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid send data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}