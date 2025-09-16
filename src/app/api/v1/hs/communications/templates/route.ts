import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Template validation schema
const TemplateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  template_type: z.enum(['email', 'sms', 'whatsapp', 'in_app', 'postal']),
  category: z.enum(['appointment', 'work_order', 'estimate', 'invoice', 'payment', 'reminder', 'marketing', 'support', 'emergency', 'other']),
  
  // Template content
  subject_template: z.string().optional(), // For email/in_app
  message_template: z.string().min(1),
  
  // Variables/placeholders available in this template
  available_variables: z.array(z.string()).default([]),
  
  // Usage settings
  is_active: z.boolean().default(true),
  is_default: z.boolean().default(false), // Default template for this category/type
  auto_send_trigger: z.enum(['appointment_created', 'appointment_reminder', 'work_order_completed', 'invoice_created', 'payment_received', 'estimate_sent', 'none']).default('none'),
  
  // Timing for auto-send
  send_delay_minutes: z.number().min(0).optional(), // Delay after trigger event
  send_before_event_hours: z.number().min(0).optional(), // For reminder templates
  
  // Conditions
  conditions: z.object({
    service_types: z.array(z.string()).optional(), // Only send for specific service types
    customer_types: z.array(z.string()).optional(), // Residential, commercial, etc.
    priority_levels: z.array(z.enum(['low', 'normal', 'high', 'urgent', 'emergency'])).optional(),
    min_amount: z.number().min(0).optional(), // Only for estimates/invoices above amount
    max_amount: z.number().min(0).optional(), // Only for estimates/invoices below amount
  }).optional(),
  
  // Personalization
  personalization_level: z.enum(['none', 'basic', 'advanced']).default('basic'),
  include_company_branding: z.boolean().default(true),
  
  // Compliance and approval
  requires_approval: z.boolean().default(false),
  approved_by: z.string().uuid().optional(),
  approved_at: z.string().datetime().optional(),
  
  // Analytics tracking
  track_opens: z.boolean().default(false),
  track_clicks: z.boolean().default(false),
  
  // Notes
  usage_notes: z.string().optional(),
  compliance_notes: z.string().optional(),
});

// Template query schema
const TemplateQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
  
  template_type: z.enum(['email', 'sms', 'whatsapp', 'in_app', 'postal']).optional(),
  category: z.enum(['appointment', 'work_order', 'estimate', 'invoice', 'payment', 'reminder', 'marketing', 'support', 'emergency', 'other']).optional(),
  is_active: z.boolean().optional(),
  is_default: z.boolean().optional(),
  requires_approval: z.boolean().optional(),
  auto_send_trigger: z.enum(['appointment_created', 'appointment_reminder', 'work_order_completed', 'invoice_created', 'payment_received', 'estimate_sent', 'none']).optional(),
  
  search: z.string().optional(),
  
  sort: z.enum(['name', 'template_type', 'category', 'created_at', 'last_used_at', 'usage_count']).default('name'),
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

// Helper function to validate template variables
function validateTemplateVariables(messageTemplate: string, subjectTemplate?: string): string[] {
  const variableRegex = /\{\{([^}]+)\}\}/g;
  const variables = new Set<string>();
  
  // Extract variables from message template
  let match;
  while ((match = variableRegex.exec(messageTemplate)) !== null) {
    variables.add(match[1].trim());
  }
  
  // Extract variables from subject template
  if (subjectTemplate) {
    variableRegex.lastIndex = 0;
    while ((match = variableRegex.exec(subjectTemplate)) !== null) {
      variables.add(match[1].trim());
    }
  }
  
  return Array.from(variables);
}

// GET /api/v1/hs/communications/templates - List communication templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = TemplateQuerySchema.parse(Object.fromEntries(searchParams));
    
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
      .from('hs.communication_templates')
      .select('
        id,
        name,
        description,
        template_type,
        category,
        subject_template,
        message_template,
        available_variables,
        is_active,
        is_default,
        auto_send_trigger,
        send_delay_minutes,
        send_before_event_hours,
        conditions,
        personalization_level,
        include_company_branding,
        requires_approval,
        approved_by,
        approved_at,
        track_opens,
        track_clicks,
        usage_count,
        last_used_at,
        usage_notes,
        compliance_notes,
        created_at,
        updated_at,
        approved_by_user:approved_by(
          first_name,
          last_name,
          email
        ),
        created_by_user:created_by(
          first_name,
          last_name
        )
      ', { count: 'exact' })
      .eq('organization_id', organizationId);

    // Apply filters
    if (query.template_type) {
      supabaseQuery = supabaseQuery.eq('template_type', query.template_type);
    }
    
    if (query.category) {
      supabaseQuery = supabaseQuery.eq('category', query.category);
    }
    
    if (query.is_active !== undefined) {
      supabaseQuery = supabaseQuery.eq('is_active', query.is_active);
    }
    
    if (query.is_default !== undefined) {
      supabaseQuery = supabaseQuery.eq('is_default', query.is_default);
    }
    
    if (query.requires_approval !== undefined) {
      supabaseQuery = supabaseQuery.eq('requires_approval', query.requires_approval);
    }
    
    if (query.auto_send_trigger) {
      supabaseQuery = supabaseQuery.eq('auto_send_trigger', query.auto_send_trigger);
    }

    // Apply search
    if (query.search) {
      supabaseQuery = supabaseQuery.or(
        'name.ilike.%${query.search}%,description.ilike.%${query.search}%,message_template.ilike.%${query.search}%'
      );
    }

    // Apply sorting and pagination
    const offset = (query.page - 1) * query.limit;
    supabaseQuery = supabaseQuery
      .order(query.sort, { ascending: query.order === 'asc' })
      .range(offset, offset + query.limit - 1);

    const { data: templates, error, count } = await supabaseQuery;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch communication templates' },
        { status: 500 }
      );
    }

    const totalPages = Math.ceil((count || 0) / query.limit);

    return NextResponse.json({
      templates: templates || [],
      pagination: {
        page: query.page,
        limit: query.limit,
        total: count || 0,
        totalPages,
        hasMore: query.page < totalPages,
      },
    });

  } catch (error) {
    console.error('GET /api/v1/hs/communications/templates error:', error);
    
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

// POST /api/v1/hs/communications/templates - Create communication template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const templateData = TemplateSchema.parse(body);

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

    // Check for duplicate template name
    const { data: existingTemplate } = await supabase
      .from('hs.communication_templates')
      .select('id')
      .eq('name', templateData.name)
      .eq('organization_id', organizationId)
      .single();
    
    if (existingTemplate) {
      return NextResponse.json(
        { error: 'Template with this name already exists' },
        { status: 409 }
      );
    }

    // Auto-extract variables from template content
    const extractedVariables = validateTemplateVariables(
      templateData.message_template,
      templateData.subject_template
    );

    // Merge extracted variables with provided ones
    const allVariables = [...new Set([...extractedVariables, ...templateData.available_variables])];

    // Validate approver if provided
    if (templateData.approved_by) {
      const { data: approver } = await supabase
        .from('auth.users')
        .select('id')
        .eq('id', templateData.approved_by)
        .single();
      
      if (!approver) {
        return NextResponse.json(
          { error: 'Approver not found' },
          { status: 400 }
        );
      }
    }

    // If this is set as default, unset other default templates for the same category/type
    if (templateData.is_default) {
      await supabase
        .from('hs.communication_templates')
        .update({ is_default: false })
        .eq('template_type', templateData.template_type)
        .eq('category', templateData.category)
        .eq('organization_id', organizationId);
    }

    // Create template
    const { data: template, error } = await supabase
      .from('hs.communication_templates')
      .insert({
        ...templateData,
        available_variables: allVariables,
        organization_id: organizationId,
        created_by: user.id,
        usage_count: 0,
      })
      .select('
        *,
        approved_by_user:approved_by(
          first_name,
          last_name,
          email
        ),
        created_by_user:created_by(
          first_name,
          last_name
        )
      ')
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create communication template' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { template },
      { status: 201 }
    );

  } catch (error) {
    console.error('POST /api/v1/hs/communications/templates error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid template data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}