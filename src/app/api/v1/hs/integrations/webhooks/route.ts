import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import crypto from 'crypto';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Webhook event schema
const WebhookEventSchema = z.object({
  event_type: z.string(),
  data: z.record(z.any()),
  timestamp: z.string().datetime().optional(),
  source: z.string().optional(),
  version: z.string().optional(),
});

// Webhook registration schema  
const WebhookRegistrationSchema = z.object({
  integration_id: z.string().uuid(),
  event_types: z.array(z.string()),
  endpoint_url: z.string().url(),
  secret: z.string().min(16).optional(), // For signature verification
  
  // Filtering options
  filters: z.object({
    customer_types: z.array(z.string()).optional(),
    service_types: z.array(z.string()).optional(),
    statuses: z.array(z.string()).optional(),
    priority_levels: z.array(z.string()).optional(),
  }).optional(),
  
  // Delivery options
  max_retries: z.number().min(0).max(10).default(3),
  retry_delay_seconds: z.number().min(1).max(3600).default(60),
  timeout_seconds: z.number().min(1).max(60).default(30),
  
  // Security and validation
  verify_ssl: z.boolean().default(true),
  require_signature: z.boolean().default(true),
  
  // Metadata
  description: z.string().optional(),
  enabled: z.boolean().default(true),
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

// Helper function to verify HMAC signature
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (_error) {
    return false;
  }
}

// Helper function to process webhook event
async function processWebhookEvent(event: unknown, integration: unknown,
  organizationId: string,
  sourceIp?: string,
  signature?: string
) {
  const startTime = Date.now();
  
  try {
    // Validate event structure
    const validatedEvent = WebhookEventSchema.parse(event);
    
    // Verify signature if required
    if (integration.config.require_signature && integration.config.webhook_secret) {
      if (!signature) {
        throw new Error('Missing webhook signature');
      }
      
      const isValidSignature = verifyWebhookSignature(
        JSON.stringify(event),
        signature.replace('sha256=', ''),
        integration.config.webhook_secret
      );
      
      if (!isValidSignature) {
        throw new Error('Invalid webhook signature');
      }
    }

    // Create webhook event log
    const { data: eventLog, error: logError } = await supabase
      .from('hs.integration_webhook_events')
      .insert({
        integration_id: integration.id,
        event_type: validatedEvent.event_type,
        payload: validatedEvent,
        source_ip: sourceIp,
        signature_verified: integration.config.require_signature ? true : null,
        organization_id: organizationId,
        status: 'processing',
      })
      .select()
      .single();

    if (logError) {
      throw new Error('Failed to log webhook event: ${logError.message}');
    }

    // Process event based on type and integration
    let processedData = null;
    let shouldStoreData = false;

    switch (validatedEvent.event_type) {
      case 'customer.created':
      case 'customer.updated':
        processedData = await processCustomerEvent(validatedEvent, integration, organizationId);
        shouldStoreData = true;
        break;
        
      case 'invoice.created':
      case 'invoice.updated':
      case 'invoice.paid':
        processedData = await processInvoiceEvent(validatedEvent, integration, organizationId);
        shouldStoreData = true;
        break;
        
      case 'payment.received':
      case 'payment.failed':
        processedData = await processPaymentEvent(validatedEvent, integration, organizationId);
        shouldStoreData = true;
        break;
        
      case 'inventory.updated':
      case 'inventory.low_stock':
        processedData = await processInventoryEvent(validatedEvent, integration, organizationId);
        shouldStoreData = true;
        break;
        
      case 'work_order.created':
      case 'work_order.updated':
      case 'work_order.completed':
        processedData = await processWorkOrderEvent(validatedEvent, integration, organizationId);
        shouldStoreData = true;
        break;
        
      default:
        // Handle unknown events
        processedData = {
          message: 'Received unknown event type: ${validatedEvent.event_type}',
          stored: false,
        };
        break;
    }

    const endTime = Date.now();
    const processingTime = endTime - startTime;

    // Update event log with results
    await supabase
      .from('hs.integration_webhook_events')
      .update({
        status: 'completed',
        processed_data: processedData,
        processing_time_ms: processingTime,
        processed_at: new Date().toISOString(),
      })
      .eq('id', eventLog.id);

    // Log activity
    await supabase
      .from('hs.integration_activity_log')
      .insert({
        integration_id: integration.id,
        activity_type: 'webhook_received',
        activity_description: 'Processed webhook: ${validatedEvent.event_type}',
        metadata: {
          event_type: validatedEvent.event_type,
          processing_time_ms: processingTime,
          data_stored: shouldStoreData,
          source_ip: sourceIp,
        },
        organization_id: organizationId,
      });

    return {
      success: true,
      event_id: eventLog.id,
      event_type: validatedEvent.event_type,
      processed_data: processedData,
      processing_time_ms: processingTime,
    };

  } catch (error) {
    const endTime = Date.now();
    const processingTime = endTime - startTime;

    // Log error
    await supabase
      .from('hs.integration_webhook_events')
      .insert({
        integration_id: integration.id,
        event_type: event.event_type || 'unknown',
        payload: event,
        source_ip: sourceIp,
        status: 'failed',
        error_message: error.message,
        processing_time_ms: processingTime,
        processed_at: new Date().toISOString(),
        organization_id: organizationId,
      });

    throw error;
  }
}

// Event processing functions
async function processCustomerEvent(event: unknown, integration: unknown, organizationId: string) {
  const customerData = event.data;
  
  try {
    if (event.event_type === 'customer.created') {
      // Create new customer record
      const { data: customer, error } = await supabase
        .from('hs.customers')
        .insert({
          external_id: customerData.id,
          first_name: customerData.first_name,
          last_name: customerData.last_name,
          company_name: customerData.company,
          email: customerData.email,
          phone: customerData.phone,
          address: customerData.address,
          city: customerData.city,
          state_province: customerData.state,
          postal_code: customerData.zip,
          customer_type: customerData.type || 'residential',
          integration_source: integration.provider_name,
          organization_id: organizationId,
        })
        .select()
        .single();

      if (error && !error.message.includes('duplicate')) {
        throw error;
      }

      return {
        action: 'customer_created',
        customer_id: customer?.id,
        external_id: customerData.id,
        stored: !error,
      };
    } else if (event.event_type === 'customer.updated') {
      // Update existing customer
      const { data: customer, error } = await supabase
        .from('hs.customers')
        .update({
          first_name: customerData.first_name,
          last_name: customerData.last_name,
          company_name: customerData.company,
          email: customerData.email,
          phone: customerData.phone,
          address: customerData.address,
          city: customerData.city,
          state_province: customerData.state,
          postal_code: customerData.zip,
          customer_type: customerData.type || 'residential',
          updated_at: new Date().toISOString(),
        })
        .eq('external_id', customerData.id)
        .eq('organization_id', organizationId)
        .select()
        .single();

      return {
        action: 'customer_updated',
        customer_id: customer?.id,
        external_id: customerData.id,
        stored: !error,
      };
    }
  } catch (error) {
    return {
      action: 'customer_processing_failed',
      external_id: customerData.id,
      error: error.message,
      stored: false,
    };
  }
}

async function processInvoiceEvent(event: unknown, integration: unknown, organizationId: string) {
  const invoiceData = event.data;
  
  try {
    if (event.event_type === 'invoice.created') {
      // Find associated customer
      const { data: customer } = await supabase
        .from('hs.customers')
        .select('id')
        .eq('external_id', invoiceData.customer_id)
        .eq('organization_id', organizationId)
        .single();

      if (!customer) {
        throw new Error('Customer not found for external_id: ${invoiceData.customer_id}');
      }

      // Create invoice record
      const { data: invoice, error } = await supabase
        .from('hs.invoices')
        .insert({
          external_id: invoiceData.id,
          invoice_number: invoiceData.number,
          customer_id: customer.id,
          total_amount: invoiceData.amount,
          amount_paid: invoiceData.amount_paid || 0,
          status: invoiceData.status || 'draft',
          due_date: invoiceData.due_date,
          integration_source: integration.provider_name,
          organization_id: organizationId,
        })
        .select()
        .single();

      return {
        action: 'invoice_created',
        invoice_id: invoice?.id,
        external_id: invoiceData.id,
        stored: !error,
      };
    }
    
    return {
      action: event.event_type,
      external_id: invoiceData.id,
      stored: true,
    };
  } catch (error) {
    return {
      action: 'invoice_processing_failed',
      external_id: invoiceData.id,
      error: error.message,
      stored: false,
    };
  }
}

async function processPaymentEvent(event: unknown, integration: unknown, organizationId: string) {
  const paymentData = event.data;
  
  return {
    action: event.event_type,
    external_id: paymentData.id,
    amount: paymentData.amount,
    stored: false, // Would implement payment storage logic
  };
}

async function processInventoryEvent(event: unknown, integration: unknown, organizationId: string) {
  const inventoryData = event.data;
  
  return {
    action: event.event_type,
    item_id: inventoryData.item_id,
    quantity: inventoryData.quantity,
    stored: false, // Would implement inventory update logic
  };
}

async function processWorkOrderEvent(event: unknown, integration: unknown, organizationId: string) {
  const workOrderData = event.data;
  
  return {
    action: event.event_type,
    external_id: workOrderData.id,
    status: workOrderData.status,
    stored: false, // Would implement work order processing logic
  };
}

// GET /api/v1/hs/integrations/webhooks - List webhook configurations and recent events
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const integrationId = searchParams.get('integration_id');
    const includeEvents = searchParams.get('include_events') === 'true';
    const eventLimit = parseInt(searchParams.get('event_limit') || '50');

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

    // Get webhook integrations
    let integrationsQuery = supabase
      .from('hs.integrations')
      .select('
        id,
        provider_name,
        display_name,
        integration_type,
        status,
        enabled,
        config,
        created_at
      ')
      .eq('organization_id', organizationId)
      .eq('integration_type', 'webhook');

    if (integrationId) {
      integrationsQuery = integrationsQuery.eq('id', integrationId);
    }

    const { data: integrations, error: integrationsError } = await integrationsQuery;

    if (integrationsError) {
      console.error('Database error:', integrationsError);
      return NextResponse.json(
        { error: 'Failed to fetch webhook integrations' },
        { status: 500 }
      );
    }

    // Sanitize integration configs
    const sanitizedIntegrations = integrations?.map(integration => ({
      ...integration,
      config: {
        webhook_url: integration.config.webhook_url,
        require_signature: integration.config.require_signature,
        verify_ssl: integration.config.verify_ssl,
        // Don't expose webhook_secret
      },
    })) || [];

    const response: unknown = {
      webhook_integrations: sanitizedIntegrations,
    };

    // Include recent webhook events if requested
    if (includeEvents) {
      let eventsQuery = supabase
        .from('hs.integration_webhook_events')
        .select('
          id,
          integration_id,
          event_type,
          status,
          source_ip,
          signature_verified,
          processing_time_ms,
          error_message,
          created_at,
          processed_at,
          integrations!inner(provider_name, display_name)
        ')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .limit(eventLimit);

      if (integrationId) {
        eventsQuery = eventsQuery.eq('integration_id', integrationId);
      }

      const { data: events } = await eventsQuery;
      response.recent_events = events || [];

      // Event statistics
      const eventStats = {
        total_events: events?.length || 0,
        successful_events: events?.filter(e => e.status === 'completed').length || 0,
        failed_events: events?.filter(e => e.status === 'failed').length || 0,
        by_type: events?.reduce((acc, event) => {
          acc[event.event_type] = (acc[event.event_type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {},
        avg_processing_time: events?.length > 0 ? 
          events.filter(e => e.processing_time_ms).reduce((sum, e) => sum + (e.processing_time_ms || 0), 0) / events.filter(e => e.processing_time_ms).length : 0,
      };

      response.event_statistics = eventStats;
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('GET /api/v1/hs/integrations/webhooks error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/v1/hs/integrations/webhooks - Handle incoming webhook events
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const integrationId = searchParams.get('integration_id');
    
    if (!integrationId) {
      return NextResponse.json(
        { error: 'integration_id parameter required' },
        { status: 400 }
      );
    }

    // Get request details
    const body = await request.text(); // Get raw body for signature verification
    const sourceIp = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    const signature = request.headers.get('x-webhook-signature') || 
                     request.headers.get('x-hub-signature-256');

    let event;
    try {
      event = JSON.parse(body);
    } catch (_error) {
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    // Get integration details
    const { data: integration, error: integrationError } = await supabase
      .from('hs.integrations')
      .select('*')
      .eq('id', integrationId)
      .eq('integration_type', 'webhook')
      .single();

    if (integrationError || !integration) {
      return NextResponse.json(
        { error: 'Webhook integration not found' },
        { status: 404 }
      );
    }

    // Check if integration is enabled
    if (!integration.enabled || integration.status !== 'active') {
      return NextResponse.json(
        { error: 'Webhook integration is not active' },
        { status: 409 }
      );
    }

    // Process the webhook event
    const result = await processWebhookEvent(
      event,
      integration,
      integration.organization_id,
      sourceIp,
      signature
    );

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      ...result,
    }, { status: 200 });

  } catch (error) {
    console.error('POST /api/v1/hs/integrations/webhooks error:', error);
    
    // Return appropriate error response
    if (error.message.includes('signature')) {
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 401 }
      );
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid webhook payload', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}